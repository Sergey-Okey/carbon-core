const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const EMAIL_ALLOWED = /[^a-z0-9.!#$%&'*+/=?^_`{|}~@-]+/g

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`
  if (digits.length === 11 && digits.startsWith('7')) return `+${digits}`
  if (digits.length === 10) return `+7${digits}`
  return value.trim()
}

/** Mask: +7 (XXX) XXX-XX-XX — never longer than 11 digits / full mask. */
export function formatPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (!digits) return ''

  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`
  if (!digits.startsWith('7')) digits = `7${digits}`
  digits = digits.slice(0, 11)

  const local = digits.slice(1)
  const a = local.slice(0, 3)
  const b = local.slice(3, 6)
  const c = local.slice(6, 8)
  const d = local.slice(8, 10)

  let out = '+7'
  if (a) out += ` (${a}`
  if (a.length === 3) out += ')'
  if (b) out += ` ${b}`
  if (c) out += `-${c}`
  if (d) out += `-${d}`
  return out
}

export const PHONE_MASK_MAX_LENGTH = '+7 (999) 123-45-67'.length

export function formatEmailInput(value: string): string {
  return value
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(EMAIL_ALLOWED, '')
    .slice(0, 254)
}

export function formatNameInput(value: string): string {
  return value.replace(/[^\p{L}\p{M}\s'-]/gu, '').slice(0, 40)
}

export function formatCodeInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6)
}

export function formatPasswordInput(value: string): string {
  // Strip control chars; hard cap length — no mask characters beyond limit
  return value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 128)
}

export function validateName(value: string): string {
  const name = value.trim()
  if (!name) return 'Укажите имя'
  if (name.length < 2) return 'Имя слишком короткое'
  if (name.length > 40) return 'Имя слишком длинное'
  return ''
}

export function validateEmail(value: string): string {
  const email = formatEmailInput(value)
  if (!email) return 'Укажите email'
  if (!EMAIL_RE.test(email)) return 'Введите корректный email'
  return ''
}

export function validatePhone(value: string): string {
  const phone = value.trim()
  if (!phone) return 'Укажите номер телефона'
  if (!/^\+7\d{10}$/.test(normalizePhone(phone))) {
    return 'Введите полный номер телефона'
  }
  return ''
}

export function validatePassword(
  value: string,
  { required = true, strict = false } = {}
): string {
  if (!value) return required ? 'Укажите пароль' : ''
  if (value.length < 8) return 'Пароль должен быть не короче 8 символов'
  if (value.length > 128) return 'Пароль слишком длинный'
  if (strict) {
    if (!/\d/.test(value)) return 'Добавьте хотя бы одну цифру'
    if (!/[^\w\s]/.test(value)) return 'Добавьте специальный символ'
  }
  return ''
}

export function validatePasswordConfirm(password: string, confirm: string): string {
  if (!confirm) return 'Подтвердите пароль'
  if (password !== confirm) return 'Пароли не совпадают'
  return ''
}

export function validateVerificationCode(value: string): string {
  if (!/^\d{6}$/.test(formatCodeInput(value))) return 'Введите 6 цифр из письма'
  return ''
}
