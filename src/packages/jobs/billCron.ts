import cron from "node-cron";
import prisma from "../lib/prisma";
import { isBillDueToday } from "../lib/util";
import { sendPushToUsers } from "../services/notification.services";
import { sendBillsDueTodayEmail } from "../services/email.services";

type BillCronRow = {
    id: string;
    userId: string;
    name: string;
    amount: unknown;
    dueDate: Date;
    frequency: string;
};

type NewLedgerEntry = {
    billId: string;
    userId: string;
    amount: string | number;
    dueDate: Date;
    status: "PENDING";
};

export const startBillCron = () => {
    cron.schedule(
        "00 7 * * *",
        async () => {
            console.log("🕒 Running Bill Cron Job...");

            try {
                const now = new Date();

                const today = {
                    day: now.getDate(),
                    month: now.getMonth(),
                    year: now.getFullYear(),
                };

                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);

                console.log("📅 Checking bills for:", startOfDay.toISOString().slice(0, 10));

                // 1️⃣ Get only active & non-paused bills
                const allBills = await prisma.bill.findMany({
                    where: {
                        isDeleted: false,
                        isPaused: false,
                    },
                    select: {
                        id: true,
                        userId: true,
                        name: true,
                        amount: true,
                        dueDate: true,
                        frequency: true,
                    },
                });

                // 2️⃣ Filter due bills
                const dueBills = allBills.filter((bill: BillCronRow) =>
                    isBillDueToday(bill.dueDate, bill.frequency, today)
                );

                if (!dueBills.length) {
                    console.log("✅ No bills due today");
                    return;
                }

                console.log("📌 Bills due today:", dueBills.length);

                // 3️⃣ Get existing ledgers for today (prevent duplicate check before insert)
                const existingLedgers = await prisma.ledger.findMany({
                    where: {
                        dueDate: startOfDay,
                        billId: { in: dueBills.map((b: BillCronRow) => b.id) },
                    },
                    select: { billId: true },
                });

                const existingBillIds = new Set(
                    existingLedgers.map((l: { billId: string }) => l.billId)
                );

                // 4️⃣ Prepare new ledger entries
                const newLedgerData: NewLedgerEntry[] = dueBills
                    .filter((bill: BillCronRow) => !existingBillIds.has(bill.id))
                    .map((bill: BillCronRow) => ({
                        billId: bill.id,
                        userId: bill.userId,
                        amount: Number(bill.amount),
                        dueDate: startOfDay,
                        status: "PENDING" as const,
                    }));

                if (!newLedgerData.length) {
                    console.log("⚠️ Ledgers already created for today");
                    return;
                }

                // 5️⃣ Bulk insert (much faster)
                await prisma.ledger.createMany({
                    data: newLedgerData,
                    skipDuplicates: true, // extra safety
                });

                console.log(`🚀 Created ${newLedgerData.length} ledger entries successfully`);

                // 6️⃣ Notify users about new bills due today
                const userIds: string[] = [...new Set(newLedgerData.map((l: NewLedgerEntry) => l.userId))];
                const count = newLedgerData.length;
                const title = count === 1 ? "Bill due today" : "Bills due today";
                const body =
                    count === 1
                        ? "You have 1 new bill due today. Open the app to view."
                        : `You have ${count} new bills due today. Open the app to view.`;
                await sendPushToUsers(userIds, { title, body });
                console.log(`📬 Sent notifications to ${userIds.length} user(s)`);

                const emailResult = await sendBillsDueTodayEmail({
                    userIds,
                    billCount: count,
                });
                console.log(`📧 Sent emails: ${emailResult.sent} ok, ${emailResult.failed} failed`);
            } catch (error) {
                console.error("❌ Error in Bill Cron:", error);
            }
        },
    );
};
