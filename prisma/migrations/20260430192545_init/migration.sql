/*
  Warnings:

  - You are about to drop the column `valor_fipe` on the `Veiculo` table. All the data in the column will be lost.
  - Added the required column `marca` to the `Veiculo` table without a default value. This is not possible if the table is not empty.
  - Made the column `ano` on table `Veiculo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Veiculo` DROP FOREIGN KEY `Veiculo_clienteId_fkey`;

-- DropIndex
DROP INDEX `Veiculo_placa_key` ON `Veiculo`;

-- AlterTable
ALTER TABLE `Veiculo` DROP COLUMN `valor_fipe`,
    ADD COLUMN `fipe_code` VARCHAR(191) NULL,
    ADD COLUMN `fipe_updated_at` DATETIME(3) NULL,
    ADD COLUMN `fipe_value` DOUBLE NULL,
    ADD COLUMN `marca` VARCHAR(191) NOT NULL,
    MODIFY `ano` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Veiculo` ADD CONSTRAINT `Veiculo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Veiculo` ADD CONSTRAINT `Veiculo_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
