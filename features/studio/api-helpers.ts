/** Read a JSON error body from a failed fetch Response. Tolerates non-JSON
 *  bodies (e.g. HTML error pages) and missing `error` fields. */
export async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; message?: string };
    return body.error ?? body.message ?? res.statusText ?? fallback;
  } catch {
    return res.statusText || fallback;
  }
}
