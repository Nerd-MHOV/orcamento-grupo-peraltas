/*
  Warnings:

  - The `percent_general` column on the `discounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `percent_unitary` column on the `discounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ActionPercent" AS ENUM ('occupancy', 'discount');

-- AlterTable
ALTER TABLE "discounts" DROP COLUMN "percent_general",
ADD COLUMN     "percent_general" "ActionPercent"[],
DROP COLUMN "percent_unitary",
ADD COLUMN     "percent_unitary" "ActionPercent"[];
