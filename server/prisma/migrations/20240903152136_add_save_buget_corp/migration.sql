-- CreateTable
CREATE TABLE "save_budgets_corp" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "budget" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'em andamento',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "save_budgets_corp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "save_budgets_corp" ADD CONSTRAINT "save_budgets_corp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
