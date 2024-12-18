/*
  Warnings:

  - The values [discount] on the enum `ActionPercent` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActionPercent_new" AS ENUM ('occupancy', 'percent');
ALTER TABLE "discounts" ALTER COLUMN "percent_general" TYPE "ActionPercent_new"[] USING ("percent_general"::text::"ActionPercent_new"[]);
ALTER TABLE "discounts" ALTER COLUMN "percent_unitary" TYPE "ActionPercent_new"[] USING ("percent_unitary"::text::"ActionPercent_new"[]);
ALTER TYPE "ActionPercent" RENAME TO "ActionPercent_old";
ALTER TYPE "ActionPercent_new" RENAME TO "ActionPercent";
DROP TYPE "ActionPercent_old";
COMMIT;
