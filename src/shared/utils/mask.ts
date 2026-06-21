export function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  return `${local[0]}***@${domain}`
}

export function maskPhone(phone: string) {
  return phone.replace(/\d(?=\d{4})/g, '*')
}
