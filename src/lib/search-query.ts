export function normalizeSearchQuery(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}&]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function getSearchDisplayQuery(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function readSearchParameter(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
