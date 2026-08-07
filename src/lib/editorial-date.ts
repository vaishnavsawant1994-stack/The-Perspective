const editorialTimeZone = "Asia/Kolkata";

export function formatEditorialDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: editorialTimeZone }).format(new Date(value));
}

export function formatEditorialTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: editorialTimeZone }).format(new Date(value));
}

export function formatEditorialDay(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: editorialTimeZone }).format(new Date(value));
}

export function editorialDayKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: editorialTimeZone }).format(new Date(value));
}
