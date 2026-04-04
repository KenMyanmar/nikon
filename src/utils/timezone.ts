/**
 * Myanmar Standard Time (MMT) = UTC+6:30
 */
const MMT_OFFSET_MINUTES = 6 * 60 + 30;

export function formatToMMT(
  isoDate: string,
  format: "full" | "date" | "time" | "relative" = "full"
): string {
  const date = new Date(isoDate);
  if (format === "relative") return getRelativeTime(date);

  const mmtDate = new Date(date.getTime() + MMT_OFFSET_MINUTES * 60000);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = months[mmtDate.getUTCMonth()];
  const day = mmtDate.getUTCDate();
  const year = mmtDate.getUTCFullYear();
  const hours = mmtDate.getUTCHours();
  const minutes = mmtDate.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const mm = minutes.toString().padStart(2, "0");

  switch (format) {
    case "date":
      return `${month} ${day}, ${year}`;
    case "time":
      return `${h12}:${mm} ${ampm}`;
    case "full":
    default:
      return `${month} ${day}, ${year} ${h12}:${mm} ${ampm} (MMT)`;
  }
}

export function isActiveNow(startDate: string, endDate: string): boolean {
  const now = Date.now();
  return new Date(startDate).getTime() <= now && new Date(endDate).getTime() >= now;
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
  if (diff < 0) return "Ended";
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h left`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m left`;
}
