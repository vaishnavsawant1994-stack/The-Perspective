export function formatMagazineIssueDate(publicationDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(publicationDate));
}
