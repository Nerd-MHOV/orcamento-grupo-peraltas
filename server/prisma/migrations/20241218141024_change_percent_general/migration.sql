/*
  Warnings:

  - Changed the type of `percent_general` on the `discounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `percent_unitary` on the `discounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "discounts" DROP COLUMN "percent_general",
ADD COLUMN     "percent_general" JSONB NOT NULL,
DROP COLUMN "percent_unitary",
ADD COLUMN     "percent_unitary" JSONB NOT NULL;

-- DropEnum
DROP TYPE "ActionPercent";
