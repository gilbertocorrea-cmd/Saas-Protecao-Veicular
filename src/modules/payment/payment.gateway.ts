import mercadopago, { Payment } from 'mercadopago'
import { MP_CONFIG } from '../../config/payment'

interface CreatePixPaymentParams {
  amount: number
  description: string
  email: string
}

interface CreatePixPaymentResult {
  paymentId: string
  qrCode: string
  qrCodeBase64: string
}

export async function createPixPayment({ amount, description, email }: CreatePixPaymentParams): Promise<CreatePixPaymentResult> {
  if (!MP_CONFIG.accessToken) {
    throw new Error('MP_ACCESS_TOKEN_MISSING')
  }

  const paymentClient = new Payment({ accessToken: MP_CONFIG.accessToken })
  const response = await paymentClient.create({
    body: {
      transaction_amount: amount,
      description,
      payment_method_id: 'pix',
      payer: {
        email,
      },
    },
  })

  const payload = ((response as { response?: unknown }).response ?? response) as {
    id?: string | number
    point_of_interaction?: {
      transaction_data?: {
        qr_code?: string
        qr_code_base64?: string
      }
    }
  }

  const paymentId = payload.id?.toString()
  const qrCode = payload.point_of_interaction?.transaction_data?.qr_code
  const qrCodeBase64 = payload.point_of_interaction?.transaction_data?.qr_code_base64

  if (!paymentId || !qrCode || !qrCodeBase64) {
    throw new Error('MP_PIX_INVALID_RESPONSE')
  }

  return {
    paymentId,
    qrCode,
    qrCodeBase64,
  }
}
