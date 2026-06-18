export { }

const endpoint = process.env.UPSTREAM_URL
const secret = process.env.CRON_SECRET

if (!endpoint) {
    console.error("Missing UPSTREAM_URL")
    process.exit(1)
}

if (!secret) {
    console.error("Missing CRON_SECRET")
    process.exit(1)
}

const res = await fetch(endpoint, {
    method: "POST",
    headers: {
        "x-api-key": secret,
    },
})

const body = await res.json()
console.log(body)

if (!res.ok || !body.success) {
    console.error("Retention cleanup failed")
    process.exit(1)
}
