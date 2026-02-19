const MAX_LIMIT = 50

type PaginationParams = {
  limit: number
  offset: number
}

type PaginationResult =
  | { ok: true; params: PaginationParams }
  | { ok: false; response: Response }

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { limit?: number } = {}
): PaginationResult {
  const limitParam = searchParams.get("limit") || String(defaults.limit ?? 20)
  const offsetParam = searchParams.get("offset")

  const limit = parseInt(limitParam, 10)
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0

  if (isNaN(limit) || limit < 1) {
    return {
      ok: false,
      response: Response.json(
        { error: "limit must be a positive integer" },
        { status: 400 }
      ),
    }
  }

  if (limit > MAX_LIMIT) {
    return {
      ok: false,
      response: Response.json(
        { error: `limit must not exceed ${MAX_LIMIT}` },
        { status: 400 }
      ),
    }
  }

  if (isNaN(offset) || offset < 0) {
    return {
      ok: false,
      response: Response.json(
        { error: "offset must be a non-negative integer" },
        { status: 400 }
      ),
    }
  }

  return { ok: true, params: { limit, offset } }
}
