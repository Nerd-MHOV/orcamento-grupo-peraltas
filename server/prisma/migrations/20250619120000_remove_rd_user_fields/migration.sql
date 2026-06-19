-- Remove os campos de integração RD Station por usuário (migração CRM Kommo)
ALTER TABLE "User" DROP COLUMN "token_rd";
ALTER TABLE "User" DROP COLUMN "user_rd";
