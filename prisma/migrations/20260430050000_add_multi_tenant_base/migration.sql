-- CreateTable
CREATE TABLE `Tenant` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(191) NOT NULL,
  `status` ENUM('ATIVO', 'BLOQUEADO', 'SUSPENSO') NOT NULL DEFAULT 'ATIVO',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `Tenant_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed a default tenant to keep existing data working
INSERT INTO `Tenant` (`id`, `nome`, `status`, `createdAt`, `updatedAt`)
VALUES (1, 'Default', 'ATIVO', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE `id` = `id`;

-- Add tenantId columns (nullable first)
ALTER TABLE `Usuario` ADD COLUMN `tenantId` INTEGER NULL;
ALTER TABLE `Cliente` ADD COLUMN `tenantId` INTEGER NULL;
ALTER TABLE `Veiculo` ADD COLUMN `tenantId` INTEGER NULL;
ALTER TABLE `Vistoria` ADD COLUMN `tenantId` INTEGER NULL;
ALTER TABLE `Financeiro` ADD COLUMN `tenantId` INTEGER NULL;
ALTER TABLE `RefreshToken` ADD COLUMN `tenantId` INTEGER NULL;

-- Backfill existing rows to default tenant
UPDATE `Usuario` SET `tenantId` = 1 WHERE `tenantId` IS NULL;
UPDATE `Cliente` SET `tenantId` = 1 WHERE `tenantId` IS NULL;
UPDATE `Veiculo` SET `tenantId` = 1 WHERE `tenantId` IS NULL;
UPDATE `Vistoria` SET `tenantId` = 1 WHERE `tenantId` IS NULL;
UPDATE `Financeiro` SET `tenantId` = 1 WHERE `tenantId` IS NULL;
UPDATE `RefreshToken` SET `tenantId` = 1 WHERE `tenantId` IS NULL;

-- Make tenantId required
ALTER TABLE `Usuario` MODIFY `tenantId` INTEGER NOT NULL;
ALTER TABLE `Cliente` MODIFY `tenantId` INTEGER NOT NULL;
ALTER TABLE `Veiculo` MODIFY `tenantId` INTEGER NOT NULL;
ALTER TABLE `Vistoria` MODIFY `tenantId` INTEGER NOT NULL;
ALTER TABLE `Financeiro` MODIFY `tenantId` INTEGER NOT NULL;
ALTER TABLE `RefreshToken` MODIFY `tenantId` INTEGER NOT NULL;

-- Indexes
CREATE INDEX `Usuario_tenantId_idx` ON `Usuario`(`tenantId`);
CREATE INDEX `Cliente_tenantId_idx` ON `Cliente`(`tenantId`);
CREATE INDEX `Veiculo_tenantId_idx` ON `Veiculo`(`tenantId`);
CREATE INDEX `Vistoria_tenantId_idx` ON `Vistoria`(`tenantId`);
CREATE INDEX `Financeiro_tenantId_idx` ON `Financeiro`(`tenantId`);
CREATE INDEX `RefreshToken_tenantId_idx` ON `RefreshToken`(`tenantId`);

-- Foreign keys
ALTER TABLE `Usuario`
  ADD CONSTRAINT `Usuario_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `RefreshToken`
  ADD CONSTRAINT `RefreshToken_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

