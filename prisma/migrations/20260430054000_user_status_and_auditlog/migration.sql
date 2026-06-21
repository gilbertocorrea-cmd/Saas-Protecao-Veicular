-- AlterTable
ALTER TABLE `Usuario`
  ADD COLUMN `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO';

-- CreateTable
CREATE TABLE `AuditLog` (
  `id` CHAR(36) NOT NULL,
  `tenantId` INTEGER NOT NULL,
  `userId` INTEGER NULL,
  `action` VARCHAR(64) NOT NULL,
  `entity` VARCHAR(64) NOT NULL,
  `entityId` VARCHAR(64) NULL,
  `before` JSON NULL,
  `after` JSON NULL,
  `ip` VARCHAR(64) NULL,
  `userAgent` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `AuditLog_tenantId_idx`(`tenantId`),
  INDEX `AuditLog_userId_idx`(`userId`),
  INDEX `AuditLog_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog`
  ADD CONSTRAINT `AuditLog_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog`
  ADD CONSTRAINT `AuditLog_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

