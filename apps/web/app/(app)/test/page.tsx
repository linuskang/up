import { Event } from "@workspace/ui/components/event"

export default function Page() {
  const now = new Date()

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto py-6">
      <Event
        id="test-event"
        title="daily billing sync started"
        createdAt={now.toISOString()}
        pushNotify={true}
        icon="📄"
        description="Automated billing sync initiated for the workspace."
        category="billing"
        fields={[
          { title: "Workspace", value: "Acme Corp" },
          { title: "Invoices", value: "198" },
          { title: "Currency", value: "USD" },
          { title: "Run ID", value: "run_7f8a9b2c" },
        ]}
        actions={[
          { title: "View Run", variant: "primary", url: "#" },
          { title: "Logs", variant: "secondary", url: "#" },
        ]}
        data={{
          source: "scheduler",
          environment: "production",
          retries: 0,
        }}
        events={[
          {
            id: "test-event-1",
            title: "processed invoices",
            createdAt: new Date(now.getTime() + 1200).toISOString(),
            pushNotify: false,
            icon: "📄",
            description: "Batch processed all pending invoices.",
            category: "billing",
            fields: [
              { title: "Processed", value: "198" },
              { title: "Skipped", value: "4" },
            ],
            actions: [],
            data: { batchId: "batch_001" },
            events: [],
          },
          {
            id: "test-event-2",
            title: "daily billing sync finished",
            createdAt: new Date(now.getTime() + 3400).toISOString(),
            pushNotify: true,
            icon: "✅",
            description: "Sync completed with a few failures.",
            category: "billing",
            fields: [
              { title: "Succeeded", value: "194" },
              { title: "Failed", value: "4" },
            ],
            actions: [
              { title: "Retry Failed", variant: "primary", url: "#" },
            ],
            data: {
              summary: {
                succeeded: 194,
                failed: 4,
                skipped: 0,
              },
            },
            events: [
              {
                id: "test-event-2-1",
                title: "retry queued",
                createdAt: new Date(now.getTime() + 3600).toISOString(),
                pushNotify: false,
                icon: "🔄",
                description: "Failed invoices queued for retry.",
                category: "billing",
                fields: [
                  { title: "Retry Count", value: "1" },
                ],
                actions: [],
                data: { failedIds: ["inv_001", "inv_002", "inv_003", "inv_004"] },
                events: [],
              },
            ],
          },
        ]}
      />

      <Event
        id="second-event"
        title="user signed up"
        createdAt={new Date(now.getTime() - 1000 * 60 * 5).toISOString()}
        pushNotify={false}
        icon="🚀"
        description="A new user completed the onboarding flow."
        category="auth"
        fields={[
          { title: "Email", value: "user@example.com" },
          { title: "Plan", value: "Pro" },
        ]}
        actions={[
          { title: "View Profile", variant: "secondary", url: "#" },
        ]}
        data={{ userId: "usr_123", referrer: "twitter" }}
      />
    </div>
  )
}