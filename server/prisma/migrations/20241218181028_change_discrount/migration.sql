-- AlterTable
ALTER TABLE "discounts" ALTER COLUMN "percent_general" DROP DEFAULT,
ALTER COLUMN "percent_general" SET DATA TYPE JSONB,
ALTER COLUMN "percent_unitary" DROP DEFAULT,
ALTER COLUMN "percent_unitary" SET DATA TYPE JSONB;
