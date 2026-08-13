/**
 * Revalidation utility for triggering Next.js ISR
 * Calls the frontend's on-demand revalidation endpoint
 */

export async function triggerRevalidation(paths = ['/']) {
  try {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')
    const secret = process.env.REVALIDATE_SECRET

    // Skip if required env vars are missing
    if (!secret) {
      console.warn('[ISR] REVALIDATE_SECRET not configured, skipping revalidation')
      return false
    }

    const response = await fetch(`${frontendUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        paths: Array.isArray(paths) ? paths : [paths],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[ISR] Revalidation failed:', response.status, error)
      return false
    }

    const result = await response.json()
    console.log('[ISR] Revalidation successful:', result)
    return true
  } catch (error) {
    console.error('[ISR] Revalidation error:', error)
    return false
  }
}

/**
 * Trigger revalidation with fallback to cache clearing
 * Use this in controllers for automatic homepage updates
 */
export async function revalidateHomepage() {
  return triggerRevalidation(['/'])
}
