import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/user/user.routes";
import { tenantRoutes } from "./modules/tenant/tenant.routes";
import { inspectionRoutes } from "./modules/inspection/inspection.routes";
import { contractRoutes } from "./modules/contract/contract.routes";
import { uploadRoutes } from "./modules/upload/upload.routes";
import { paymentRoutes } from "./modules/payment/payment.routes";
import { authenticateJWT } from "./middleware/authenticateJWT";
import { checkTenant } from "./middleware/checkTenant";
import { tenantContextMiddleware } from "./middleware/tenantContextMiddleware";
import { checkRole } from "./middleware/checkRole";
import * as vehicleController from "./modules/vehicle/vehicle.controller";
import { prisma } from "./prisma";

const app = express();

app.use(express.json());

app.use(helmet());

app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true
}));

app.use(morgan("dev"));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100
}));

app.use("/auth", authRoutes);

app.post(
  "/vehicles",
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(["GESTOR", "FUNCIONARIO"]),
  vehicleController.create
);

app.get(
  "/vehicles",
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(["GESTOR", "FUNCIONARIO"]),
  vehicleController.list
);

app.put(
  "/vehicles/:id",
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(["GESTOR", "FUNCIONARIO"]),
  vehicleController.update
);

app.delete(
  "/vehicles/:id",
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(["GESTOR"]),
  vehicleController.remove
);

app.get(
  "/vehicles/:id",
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(["GESTOR", "FUNCIONARIO"]),
  vehicleController.getById
);

app.get(
  "/users/me",
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(["ADMIN", "ADMIN_MASTER", "GESTOR", "FUNCIONARIO", "CLIENTE"]),
  async (req, res) => {
  const userId = (req as any).user?.id as number | undefined;
  if (typeof userId !== "number") {
    return res.status(401).json({ success: false, error: { code: "AUTH_TOKEN_INVALID", message: "Token inválido" } });
  }

  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tenantId: true,
      nome: true,
      email: true,
      tipo_usuario: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ success: false, error: { code: "RESOURCE_NOT_FOUND", message: "Usuário não encontrado" } });
  }

  return res.json({
    success: true,
    data: {
      id: user.id,
      tenantId: user.tenantId,
      nome: user.nome,
      email: user.email,
      role: user.tipo_usuario,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

app.use("/users", userRoutes);

app.use("/tenants", tenantRoutes);

app.use("/inspections", inspectionRoutes);

app.use("/contracts", contractRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(
  '/upload',
  authenticateJWT,
  tenantContextMiddleware,
  checkTenant,
  checkRole(['ADMIN', 'ADMIN_MASTER', 'GESTOR', 'FUNCIONARIO', 'CLIENTE']),
  uploadRoutes,
)

app.use('/api/payments', paymentRoutes);

app.get("/health", (_, res) => {
  return res.json({ success: true, data: "ok" });
});

app.use(errorHandler);

export { app };