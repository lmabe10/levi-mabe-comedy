export type JsonBody =
  | { ok: true }
  | { ok: false; error: string };

export function jsonResponse(body: JsonBody, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export function okResponse(): Response {
  return jsonResponse({ ok: true }, 200);
}

/** Safe public error — never include stack traces or provider details. */
export function errorResponse(error: string, status: number): Response {
  return jsonResponse({ ok: false, error }, status);
}
