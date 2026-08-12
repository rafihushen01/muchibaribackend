// Small, dependency-free response cache for public catalogue content.
// A shared Redis cache can replace this module when the API is scaled to multiple instances.
const entries = new Map()

export function cacheResponse(seconds) {
  return (req, res, next) => {
    const key = req.originalUrl
    const cached = entries.get(key)
    if (cached && cached.expiresAt > Date.now()) return res.status(200).json(cached.payload)
    if (cached) entries.delete(key)

    const sendJson = res.json.bind(res)
    res.json = (payload) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        entries.set(key, { payload, expiresAt: Date.now() + seconds * 1000 })
      }
      return sendJson(payload)
    }
    next()
  }
}

export function clearPublicCache() {
  entries.clear()
}
