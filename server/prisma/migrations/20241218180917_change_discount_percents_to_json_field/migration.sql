/*
  Warnings:

  - Changed the type of `percent_general` on the `discounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `percent_unitary` on the `discounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Create temporary columns
ALTER TABLE "discounts" ADD COLUMN "percent_general_temp" JSON;
ALTER TABLE "discounts" ADD COLUMN "percent_unitary_temp" JSON;

-- Copy data to temporary columns
UPDATE "discounts" SET "percent_general_temp" = to_jsonb("percent_general");
UPDATE "discounts" SET "percent_unitary_temp" = to_jsonb("percent_unitary");

-- Drop original columns
ALTER TABLE "discounts" DROP COLUMN "percent_general";
ALTER TABLE "discounts" DROP COLUMN "percent_unitary";

-- Add original columns with new type
ALTER TABLE "discounts" ADD COLUMN "percent_general" JSON NOT NULL DEFAULT '[]';
ALTER TABLE "discounts" ADD COLUMN "percent_unitary" JSON NOT NULL DEFAULT '[]';

-- Copy data back to original columns
UPDATE "discounts" SET "percent_general" = "percent_general_temp";
UPDATE "discounts" SET "percent_unitary" = "percent_unitary_temp";

-- Drop temporary columns
ALTER TABLE "discounts" DROP COLUMN "percent_general_temp";
ALTER TABLE "discounts" DROP COLUMN "percent_unitary_temp";
