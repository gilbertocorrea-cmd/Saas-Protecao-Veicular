import { Router } from 'express'
import { PaymentController } from './payment.controller'
import { authenticateJWT } from '../../middleware/authenticateJWT'
import { checkRole } from '../../middleware/checkRole'
import { checkTenant } from '../../middleware/checkTenant'

const router = Router()

router.post('/webhook', PaymentController.handleWebhook)

router.use(authenticateJWT)
router.use(checkTenant)
router.use(checkRole(['ADMIN', 'FUNCIONARIO']))

router.post('/', PaymentController.createPayment)
router.get('/', PaymentController.getPayments)
router.get('/:id', PaymentController.getPaymentById)
router.patch('/:id/status', PaymentController.updatePaymentStatus)

export { router as paymentRoutes }