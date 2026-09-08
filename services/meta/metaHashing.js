import crypto from 'node:crypto'

export function normalize(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function normalizePhone(value) {
  return String(value ?? '').replace(/[^\d+]/g, '').replace(/^00/, '+')
}

export function hashIdentifier(value, phone = false) {
  const normalized = phone ? normalizePhone(value) : normalize(value)
  return normalized ? crypto.createHash('sha256').update(normalized).digest('hex') : undefined
}

export function hashCustomerIdentifiers(customer = {}) {
  const result = {}
  for (const field of ['em', 'ph', 'fn', 'ln', 'ct', 'st', 'zp']) {
    const hashed = hashIdentifier(customer[field], field === 'ph')
    if (hashed) result[field] = [hashed]
  }
  if (customer.country) result.country = [normalize(customer.country)]
  if (customer.external_id) result.external_id = [String(customer.external_id)]
  if (customer.fbp) result.fbp = customer.fbp
  if (customer.fbc) result.fbc = customer.fbc
  return result
}
