/** Browser client for qualified R6 HTTP surfaces. Never sends tenant or permission fields. */

export type R6ListEnvelope<T> = { items?: T[] };

export async function fetchQualifiedR6List<T>(path: string, limit = 50): Promise<T[]> {
  const url = path.includes("?") ? `${path}&limit=${limit}` : `${path}?limit=${limit}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (response.status === 401 || response.status === 403 || response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error(`R6_UI_BIND_${response.status}`);
  }
  const body = (await response.json()) as R6ListEnvelope<T>;
  return Array.isArray(body.items) ? body.items : [];
}

export function r6MutationHeaders(): HeadersInit {
  return {
    "content-type": "application/json",
    accept: "application/json",
  };
}

export async function postQualifiedR6Command(
  path: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const payload = { ...body };
  delete payload.ownerOrganizationId;
  delete payload.organizationId;
  delete payload.membershipId;
  delete payload.permissionKey;
  delete payload.resourceContext;
  return fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: r6MutationHeaders(),
    body: JSON.stringify(payload),
  });
}
