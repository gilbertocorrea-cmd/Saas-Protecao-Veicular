import { Request, Response } from 'express'
import { PaymentService } from './payment.service'
import { createPaymentSchema, updatePaymentStatusSchema } from './payment.schemas'
import { sendSuccess, sendError } from '../../shared/utils/response'

export class PaymentController {
  static async createPayment(req: any, res: Response) {
    try {
      const tenantId = req.tenant.id
      const result = createPaymentSchema.safeParse(req.body)
      if (!result.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos', result.error)
      }
      const payment = await PaymentService.createPayment(tenantId, {
        ...result.data,
        email: req.user?.email,
      })
      sendSuccess(res, 201, payment)
    } catch (error) {
      sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno')
    }
  }

  static async getPayments(req: any, res: Response) {
    try {
      const tenantId = req.tenant.id
      const payments = PaymentService.getPayments(tenantId)
      sendSuccess(res, 200, payments)
    } catch (error) {
      sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno')
    }
  }

  static async getPaymentById(req: any, res: Response) {
    try {
      const tenantId = req.tenant.id
      const { id } = req.params
      const payment = PaymentService.getPaymentById(tenantId, id)
      if (!payment) {
        return sendError(res, 404, 'PAYMENT_NOT_FOUND', 'Pagamento não encontrado')
      }
      sendSuccess(res, 200, payment)
    } catch (error) {
      sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno')
    }
  }

  static async updatePaymentStatus(req: any, res: Response) {
    try {
      const tenantId = req.tenant.id
      const { id } = req.params
      const result = updatePaymentStatusSchema.safeParse(req.body)
      if (!result.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos', result.error)
      }
      const payment = PaymentService.updatePaymentStatus(tenantId, id, result.data.status)
      if (!payment) {
        return sendError(res, 404, 'PAYMENT_NOT_FOUND', 'Pagamento não encontrado ou não pode ser atualizado')
      }
      sendSuccess(res, 200, payment)
    } catch (error) {
      sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno')
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    try {
      const body = req.body as unknown
      if (!body || typeof body !== 'object') {
        return sendError(res, 400, 'INVALID_PAYLOAD', 'Payload inválido')
      }

      const payload = body as {
        type?: string
        data?: {
          id?: string | number
          type?: string
        }
      }

      if (!payload.type || !payload.data?.id) {
        return sendError(res, 400, 'INVALID_PAYLOAD', 'Dados de evento ausentes')
      }

      if (!payload.type.toString().includes('payment')) {
        return sendError(res, 400, 'UNSUPPORTED_EVENT', 'Evento não suportado')
      }

      const externalId = payload.data.id.toString()
      const payment = PaymentService.updatePaymentStatusByExternalId(externalId, 'PAID')
      if (!payment) {
        return sendError(res, 404, 'PAYMENT_NOT_FOUND', 'Pagamento não encontrado')
      }

      sendSuccess(res, 200, payment)
    } catch (error) {
      sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno')
    }
  }
}