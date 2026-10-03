export function liveStatus() {
  return { status: "live" as const };
}

export async function readyStatus(probe: () => Promise<unknown>) {
  try {
    await probe();
    return { httpStatus: 200, body: { status: "ready" as const } };
  } catch {
    return { httpStatus: 503, body: { status: "not-ready" as const } };
  }
}
