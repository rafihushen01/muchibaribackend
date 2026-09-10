import { META_EVENT_NAMES } from './metaTypes.js'
import { hashCustomerIdentifiers } from './metaHashing.js'

const timeoutMs = 4000

function logSuccess(eventName, eventId, orderId, status) {
  console.info('META_CAPI_EVENT_SUCCESS', { event_name: eventName, event_id: eventId, order_id: orderId ?? null, status })
}

function logFailure(eventName, eventId, orderId, status, errorBody) {
  console.error('META_CAPI_EVENT_FAILED', { 
    event_name: eventName, 
    event_id: eventId, 
    order_id: orderId ?? null, 
    status: status ?? null,
    error: errorBody ?? 'unknown'
  })
}

export async function sendMetaEvent({ eventName, eventId, eventTime = Math.floor(Date.now() / 1000), eventSourceUrl, userData = {}, customData = {}, orderId }) {
  if (!META_EVENT_NAMES.has(eventName)) throw new Error('Unsupported Meta event name.')
  const datasetId = process.env.META_DATASET_ID
  const accessToken = process.env.META_ACCESS_TOKEN
  const apiVersion = process.env.META_API_VERSION || 'v22.0'
  if (!datasetId || !accessToken) return { skipped: true }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  let status
  const payload = { data: [{ event_name: eventName, event_time: eventTime, event_id: eventId, action_source: 'website', event_source_url: eventSourceUrl, user_data: { ...hashCustomerIdentifiers(userData), client_ip_address: userData.client_ip_address, client_user_agent: userData.client_user_agent }, custom_data: customData }] }
  if (process.env.NODE_ENV !== 'production') {
    console.debug('META_CAPI_EVENT_PAYLOAD', { ...payload.data[0], user_data: { fields: Object.keys(payload.data[0].user_data) } })
  }
  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${datasetId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    status = response.status
    const responseText = await response.text()
    if (!response.ok) {
      logFailure(eventName, eventId, orderId, status, responseText)
      return { sent: false, status, error: responseText }
    }
    logSuccess(eventName, eventId, orderId, status)
    return { sent: true, status }
  } catch (err) {
    logFailure(eventName, eventId, orderId, status, err?.message)
    return { sent: false, status, error: err?.message }
  } finally {
    clearTimeout(timeout)
  }
}
