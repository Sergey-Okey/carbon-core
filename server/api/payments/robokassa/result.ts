import { getMethod, getQuery, readBody, setHeader } from 'h3'
import {
  recordRobokassaPayment,
  verifyRobokassaSignature,
} from '../../../utils/subscriptionStorage'
import { enforceRateLimit } from '../../../utils/rateLimit'

function normalizeParams(value: unknown): Record<string, string> {
  if (!value) return {}

  if (typeof value === 'string') {
    return Object.fromEntries(new URLSearchParams(value).entries())
  }

  if (typeof value !== 'object') return {}

  const result: Record<string, string> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (Array.isArray(raw)) {
      result[key] = String(raw[0] ?? '')
      continue
    }
    result[key] = String(raw ?? '')
  }
  return result
}

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'robokassa-result', 120, 15 * 60 * 1000)
  const queryParams = normalizeParams(getQuery(event))
  const bodyParams = getMethod(event) === 'GET' ? {} : normalizeParams(await readBody(event).catch(() => ({})))
  const params = { ...queryParams, ...bodyParams }

  if (!verifyRobokassaSignature(params)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Robokassa signature' })
  }

  const invoiceId = params.InvId || params.InvID || params.InvoiceID || params.invoiceId || ''
  const email = params.EMail || params.Email || params.email || params.Shp_email || ''
  if (!invoiceId || !email) {
    throw createError({ statusCode: 400, statusMessage: 'Payment invoice and email are required' })
  }

  await recordRobokassaPayment({
    email,
    invoiceId,
    outSum: params.OutSum || params.outsum || '',
    subscriptionId: params.SubscriptionId || params.subscriptionId || params.Shp_subscriptionId,
    paymentMethod: params.PaymentMethod || params.paymentMethod,
    raw: params,
  })

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `OK${invoiceId}`
})
