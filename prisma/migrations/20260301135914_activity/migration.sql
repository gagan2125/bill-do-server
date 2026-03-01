-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MARKED_AS_PAID', 'MARKED_AS_UNPAID', 'AMOUNT_CHANGED', 'DATE_CHANGED');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "ActivityType" NOT NULL,
    "changedToDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_ledgerId_idx" ON "Activity"("ledgerId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger"("id") ON DELETE CASCADE ON UPDATE CASCADE;
