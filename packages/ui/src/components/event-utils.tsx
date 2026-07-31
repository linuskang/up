export function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function getDayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatTime(dateStr: string) {
  return new Date(dateStr)
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase()
}

export function formatDuration(ms: number): string {
  const absMs = Math.max(0, ms)
  const seconds = Math.floor(absMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0)
    return `${days} day${days === 1 ? "" : "s"} ${hours % 24} hr${hours % 24 === 1 ? "" : "s"}`
  if (hours > 0)
    return `${hours} hr${hours === 1 ? "" : "s"} ${minutes % 60} min${minutes % 60 === 1 ? "" : "s"}`
  if (minutes > 0)
    return `${minutes} min${minutes === 1 ? "" : "s"} ${seconds % 60} sec${seconds % 60 === 1 ? "" : "s"}`
  return `${seconds} sec${seconds === 1 ? "" : "s"}`
}
