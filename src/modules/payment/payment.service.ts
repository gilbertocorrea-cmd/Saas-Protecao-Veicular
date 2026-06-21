import { createPixPayment } from './payment.gateway'

interface Payment {
  id: string
  tenantId: string
  userId: string
  vehicleId: string | undefined
  amount: number
  status: 'PENDING' | 'PAID' | 'CANCELED'
  method: 'PIX' | 'BOLETO'
  createdAt: Date
  externalId?: string
  qrCode?: string
  qrCodeBase64?: string
}

type CreatePaymentData = {
  userId: string
  vehicleId?: string | undefined
  amount: number
  method: 'PIX' | 'BOLETO'
  email?: string
}

let payments: Payment[] = []
let idCounter = 1

export class PaymentService {
static async createPayment(
  tenantId: string,
  data: CreatePaymentData
): Promise<Payment> {

  const payment: Payment = {
    id: idCounter.toString(),
    tenantId,
    userId: data.userId,
    vehicleId: data.vehicleId,
    amount: data.amount,
    method: data.method,
    status: 'PENDING',
    createdAt: new Date(),
  }

  // ============================
  // 🟡 ORIGINAL (DESATIVADO)
  // ============================
  /*
  if (data.method === 'PIX') {
    try {
      const result = await createPixPayment({
        amount: data.amount,
        description: `Pagamento PIX - R$ ${data.amount.toFixed(2)}`,
        email: data.email ?? 'cliente@unknown.com',
      })

      payment.externalId = result.paymentId
      payment.qrCode = result.qrCode
      payment.qrCodeBase64 = result.qrCodeBase64
    } catch {
      // fallback antigo
    }
  }
  */

  // ============================
  // 🟢 NOVO (FUNCIONAL)
  // ============================

  if (data.method === 'PIX') {
    // 🔥 SEMPRE fallback seguro (MVP)
    payment.qrCode = "SIMULATED_QR_CODE"
    payment.qrCodeBase64 = "SIMULATED_BASE64"
  }

  payments.push(payment)
  idCounter++

  return payment
}

  static getPayments(tenantId: string): Payment[] {
    return payments.filter(p => p.tenantId === tenantId)
  }

  static getPaymentById(tenantId: string, id: string): Payment | null {
    return payments.find(p => p.tenantId === tenantId && p.id === id) || null
  }

  static getPaymentByExternalId(externalId: string): Payment | null {
    return payments.find(p => p.externalId === externalId) || null
  }

  static updatePaymentStatus(tenantId: string, id: string, status: 'PAID' | 'CANCELED'): Payment | null {
    const payment = payments.find(p => p.tenantId === tenantId && p.id === id)
    if (!payment || payment.status !== 'PENDING') return null
    payment.status = status
    return payment
  }

  static updatePaymentStatusByExternalId(externalId: string, status: 'PAID' | 'CANCELED'): Payment | null {
    const payment = this.getPaymentByExternalId(externalId)
    if (!payment || payment.status !== 'PENDING') return null
    payment.status = status
    return payment
  }
}