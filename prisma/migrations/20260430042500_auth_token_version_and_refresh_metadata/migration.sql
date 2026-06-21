-- AlterTable
ALTER TABLE `Usuario`
  ADD COLUMN `tokenVersion` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `RefreshToken`
  ADD COLUMN `ip` VARCHAR(64) NULL,
  ADD COLUMN `userAgent` VARCHAR(255) NULL;

