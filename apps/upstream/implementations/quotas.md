# Quota Implementation Guide

This guide covers how to enforce quotas in Upstream after the database migration is applied.

**Assumptions:**
- The `User` table has a `plan` column (enum: `FREE`, `PRO`)
- The `UserUsage` table exists with `userId`, `month` (format: `YYYY-MM`), and `eventCount` fields
- You have a `plans` config exported from somewhere (e.g., `lib/plans.ts` or `server/plans.ts`)

**Your config:**

```typescript
export const plans = {
    free: {
        maxProjects: 1,
        maxEventsPerMonth: 100,
        retentionDays: 7,
    },
    pro: {
        maxProjects: 10,
        maxEventsPerMonth: 10000,
        retentionDays: 90,
    }
}
```

---

## 1. Enforce Project Limits

### Where to add it
`app/api/project/route.ts` inside the `POST` handler, right after the session check and before calling `Project.create()`.

### What to do

1. **Count existing projects** for the current user:
   ```typescript
   const projectCount = await prisma.project.count({
       where: { ownerId: session.user.id }
   })
   ```

2. **Load the user's plan** and get their limit:
   ```typescript
   const user = await prisma.user.findUnique({
       where: { id: session.user.id },
       select: { plan: true }
   })
   const limit = plans[user.plan.toLowerCase()].maxProjects
   ```

3. **Block if at limit**:
   ```typescript
   if (projectCount >= limit) {
       return NextResponse.json(
           { error: "Project limit reached. Upgrade to create more projects." },
           { status: 403 }
       )
   }
   ```

### Edge cases
- If `user.plan` is null/undefined for legacy users, default to `free`.
- Case sensitivity: store `plan` as uppercase (`FREE`, `PRO`), but your `plans` object uses lowercase keys. Use `.toLowerCase()` when indexing.

---

## 2. Enforce Event Quotas (Ingestion)

### Where to add it
`app/api/events/ingest/route.ts` inside the `POST` handler, **after** `Api.validateKey()` succeeds and **before** `prisma.event.create()`.

### What to do

1. **Get the project owner** from the validated key:
   ```typescript
   const project = await prisma.project.findUnique({
       where: { id: keyValidation.projectId },
       select: { ownerId: true }
   })
   ```

2. **Load the owner's plan**:
   ```typescript
   const user = await prisma.user.findUnique({
       where: { id: project.ownerId },
       select: { id: true, plan: true }
   })
   ```

3. **Get the current month string**:
   ```typescript
   const month = new Date().toISOString().slice(0, 7) // "2026-06"
   ```

4. **Increment the user's monthly counter** using `upsert`:
   ```typescript
   const usage = await prisma.userUsage.upsert({
       where: { userId_month: { userId: user.id, month } },
       update: { eventCount: { increment: 1 } },
       create: { userId: user.id, month, eventCount: 1 }
   })
   ```

5. **Check against the quota**:
   ```typescript
   const limit = plans[user.plan.toLowerCase()].maxEventsPerMonth
   if (usage.eventCount > limit) {
       return NextResponse.json(
           { error: "Monthly event quota exceeded." },
           { status: 429 }
       )
   }
   ```

6. **Only then** create the event.

### Why this order matters

You **must** increment the counter first, then check. If you check first and increment separately, two concurrent requests could both pass the check and then both increment, causing you to overshoot the quota (race condition). Prisma's `upsert` with `increment: 1` is atomic, so it handles concurrency safely.

### Return code
Use `429 Too Many Requests` for quota exhaustion. This is the standard HTTP code for rate/quota limits.

---

## 3. Enforce Data Retention

Data retention means users should not see events older than their plan's `retentionDays`. You need to enforce this in two places: **reads** and **cleanup**.

### 3a. Enforce on reads (Event listing)

#### Where to add it
`app/api/project/[id]/events/route.ts` (or wherever you fetch events for the project page).

#### What to do

1. **Get the project owner**:
   ```typescript
   const project = await prisma.project.findUnique({
       where: { id: projectId },
       select: { ownerId: true }
   })
   ```

2. **Get the owner's retention limit**:
   ```typescript
   const user = await prisma.user.findUnique({
       where: { id: project.ownerId },
       select: { plan: true }
   })
   const retentionDays = plans[user.plan.toLowerCase()].retentionDays
   ```

3. **Calculate the cutoff date**:
   ```typescript
   const cutoff = new Date()
   cutoff.setDate(cutoff.getDate() - retentionDays)
   ```

4. **Add `createdAt` filter to your event query**:
   ```typescript
   const events = await prisma.event.findMany({
       where: {
           projectId: projectId,
           createdAt: { gte: cutoff }
       },
       orderBy: { createdAt: 'desc' }
   })
   ```

### 3b. Enforce via cleanup (optional but recommended)

The read filter is the safety net. But to prevent your database from growing infinitely, you should also **delete old events** periodically.

#### Option A: Vercel Cron (if deployed on Vercel)

Create `app/api/cron/cleanup/route.ts`:

1. Verify the request is from Vercel Cron using a secret token in the header.
2. Query all users with their plans.
3. For each user, calculate their cutoff date.
4. Delete events older than their retention:
   ```typescript
   await prisma.event.deleteMany({
       where: {
           project: { ownerId: user.id },
           createdAt: { lt: cutoff }
       }
   })
   ```

5. Add to `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/cleanup",
         "schedule": "0 4 * * *"
       }
     ]
   }
   ```

#### Option B: Simple script (if self-hosted)

Create a standalone script in `scripts/cleanup.ts` that you run with `ts-node` or via a system cron job. Same logic as above.

#### Option C: Global cleanup (simplest)

If you don't want per-user retention logic in the cleanup job, just delete all events older than the maximum retention period (e.g., 90 days). The per-user read filter handles the rest.

```typescript
// Simplest cleanup: delete everything older than 90 days
const cutoff = new Date()
cutoff.setDate(cutoff.getDate() - 90)

await prisma.event.deleteMany({
    where: { createdAt: { lt: cutoff } }
})
```

---

## 4. Update the Dashboard

### Current state
Your dashboard (`app/(root)/page.tsx`) hardcodes:
- `projects.length / 1`
- `0 / 100`
- "Free"

### What to replace

#### 4a. Total Projects
This is already live (`projects.length`). Just replace the hardcoded `/ 1` with the actual limit from the user's plan.

1. Fetch the user's plan in the `useEffect` or add a new endpoint.
2. Get the limit from `plans[plan].maxProjects`.
3. Display: `{projects.length} / {limit}`.

#### 4b. Events Today
The `UserUsage` table only tracks monthly totals, so you need to query the `Event` table for today's count.

1. Create a new API endpoint or add to your existing `/api/project` response:
   ```typescript
   const today = new Date()
   today.setHours(0, 0, 0, 0)
   
   const eventsToday = await prisma.event.count({
       where: {
           project: { ownerId: userId },
           createdAt: { gte: today }
       }
   })
   ```

2. Display this count in the dashboard.

#### 4c. Monthly Usage
Add a new stat card showing monthly usage:
- Fetch the current month's `UserUsage` row for the user.
- Display: `{eventCount} / {maxEventsPerMonth}`.

#### 4d. Account Plan
Replace the hardcoded "Free" with the actual `user.plan` value.

---

## 5. Upgrade a User to Pro

Since you don't have Stripe yet, you need a way to manually set a user's plan.

### Option A: Admin endpoint (recommended for now)

Create a protected endpoint like `POST /api/admin/upgrade` that:
1. Checks if the requester is an admin (e.g., by hardcoded email or a role field)
2. Updates the target user's `plan` to `PRO`

### Option B: Direct database update

Run a SQL query or Prisma script to flip the plan:
```typescript
await prisma.user.update({
    where: { id: "user_id_here" },
    data: { plan: "PRO" }
})
```

### Option C: Environment variable for beta users

Since your billing page says "Pro plan perks are currently applied to beta accounts for free," you could check if the user is in a beta list:
```typescript
const BETA_USERS = process.env.BETA_USERS?.split(',') || []
const effectivePlan = BETA_USERS.includes(user.email) ? 'pro' : user.plan.toLowerCase()
```

This lets you give Pro perks without touching the database. Keep the actual `user.plan` as `FREE` for billing purposes.

---

## 6. Testing Your Quotas

### Test project limit
1. Sign up as a new user (default plan: `FREE`).
2. Create 1 project (should succeed).
3. Try to create a 2nd project (should get `403` with "Project limit reached").

### Test event quota
1. Send 100 events via `POST /api/events/ingest` (should all succeed with `201`).
2. Send the 101st event (should get `429` with "Monthly event quota exceeded").
3. Check the dashboard — monthly usage should show `100 / 100`.

### Test retention
1. Manually insert an event with `createdAt` set to 10 days ago.
2. Query the project events (should not appear for free users).
3. Set user to `PRO` and query again (should appear).

---

## 7. Summary of Files to Touch

| File | What to do |
|---|---|
| `app/api/project/route.ts` | Add project count check before `Project.create()` |
| `app/api/events/ingest/route.ts` | Add `UserUsage` upsert + quota check before `prisma.event.create()` |
| `app/api/project/[id]/events/route.ts` | Add `createdAt` filter based on `retentionDays` |
| `app/(root)/page.tsx` | Replace hardcoded stats with live data from API |
| `app/(root)/settings/billing/page.tsx` | Optionally show current usage vs quota |
| `app/api/cron/cleanup/route.ts` (new) | Optional: scheduled cleanup of old events |
| `lib/plans.ts` or `server/plans.ts` | Export your plan config (already done) |

---

## 8. Common Pitfalls

1. **Case sensitivity**: Prisma enums are usually uppercase (`FREE`, `PRO`), but your `plans` object uses lowercase keys. Always normalize with `.toLowerCase()` when looking up limits.

2. **Default plan for legacy users**: If you run the migration and some users have `plan = null`, handle it gracefully:
   ```typescript
   const plan = (user?.plan || 'FREE').toLowerCase()
   ```

3. **Race conditions**: Never "check quota, then increment separately." Use the `upsert` with `increment` pattern shown above. This is atomic at the database level.

4. **Not returning early**: Make sure your quota check returns a `NextResponse.json` immediately. Do not fall through to the event creation.

5. **Dashboard API calls**: You may want to batch the dashboard stats into a single endpoint (e.g., `GET /api/stats`) instead of making separate requests for projects, today's events, and monthly usage.
