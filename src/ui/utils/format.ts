export function msToSecondsString(ms: number): string {
  if (typeof ms !== "number" || isNaN(ms) || ms < 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isToday =
    date >= today && date < new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const isYesterday = date >= yesterday && date < today;

  const timeStr = timeFormatter.format(date);

  if (isToday) {
    return `Today at ${timeStr}`;
  } else if (isYesterday) {
    return `yesterday at ${timeStr}`;
  } else if (timestamp === "No scans yet") {
    return "No scans yet";
  } else {
    return `${dateFormatter.format(date)} at ${timeStr}`;
  }
}
