-- Remove os campos de integração RD Station por usuário (migração CRM Kommo)
ALTER TABLE "users" DROP COLUMN "token_rd";
ALTER TABLE "users" DROP COLUMN "user_rd";
