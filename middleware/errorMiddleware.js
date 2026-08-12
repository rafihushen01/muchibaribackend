export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(error, _req, res, _next) {
  if (error.name === 'MulterError') return res.status(400).json({ message: error.message })
  if (error.name === 'CastError') return res.status(400).json({ message: `Invalid ${error.path}.` })
  if (error.name === 'ValidationError') return res.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(' ') })
  if (error.code === 11000) return res.status(409).json({ message: 'A record with that value already exists.' })
  const status = error.statusCode || 500
  if (status >= 500) console.error(error)
  res.status(status).json({ message: error.message || 'An unexpected error occurred.' })
}
