import prisma from "../lib/prisma";
import type { Bill, Ledger } from "../../generated/prisma/client";
import { LedgerStatus } from "../../generated/prisma/enums";

type LedgerWithBill = Ledger & { bill: Bill };

const startOfToday = (): Date => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

const endOfFifthDay = (): Date => {
    const d = startOfToday();
    d.setUTCDate(d.getUTCDate() + 5);
    return d;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface DashboardResult {
    upcomingDues: Array<{
        id: string;
        billId: string;
        billName: string;
        amount: number;
        dueDate: string;
        status: string;
    }>;
    totalAmountDueNext5Days: number;
    organizer: {
        totalPaid: number;
        totalOverdue: number;
    };
    bills: Array<{
        id: string;
        name: string;
        amount: number;
        amountPerPeriod: number;
        frequency: string;
        totalPaidAmount: number;
        totalOverdueAmount: number;
    }>;
}

export const getDashboardService = async (userId: string): Promise<DashboardResult> => {
    const todayStart = startOfToday();
    const fiveDaysEnd = endOfFifthDay();

    const [ledgers, bills] = await Promise.all([
        prisma.ledger.findMany({
            where: { userId, isDeleted: false },
            include: { bill: true },
        }),
        prisma.bill.findMany({
            where: { userId, isDeleted: false },
            orderBy: { name: "asc" },
        }),
    ]);

    // Upcoming: PENDING ledgers due in [today, today+5 days)
    const upcomingDues = ledgers
        .filter((l: LedgerWithBill) => {
            const due = new Date(l.dueDate);
            return (
                l.status === LedgerStatus.PENDING &&
                due >= todayStart &&
                due < fiveDaysEnd
            );
        })
        .map((l: LedgerWithBill) => ({
            id: l.id,
            billId: l.billId,
            billName: l.bill.name,
            amount: round2(Number(l.amount)),
            dueDate: new Date(l.dueDate).toISOString(),
            status: l.status,
        }))
        .sort((a: { dueDate: string }, b: { dueDate: string }) => a.dueDate.localeCompare(b.dueDate));

    const totalAmountDueNext5Days = round2(
        upcomingDues.reduce((sum: number, u: { amount: number }) => sum + u.amount, 0)
    );

    // Organizer totals
    let totalPaid = 0;
    let totalOverdue = 0;
    for (const l of ledgers as LedgerWithBill[]) {
        const amt = Number(l.amount);
        if (l.paidAmount != null) totalPaid += Number(l.paidAmount);
        if (l.status === LedgerStatus.PENDING && new Date(l.dueDate) < todayStart) {
            totalOverdue += amt;
        }
    }
    const organizer = {
        totalPaid: round2(totalPaid),
        totalOverdue: round2(totalOverdue),
    };

    // Per-bill: amount per period, total paid, total overdue
    const billsList = bills.map((bill: Bill) => {
        const billLedgers = (ledgers as LedgerWithBill[]).filter((l: LedgerWithBill) => l.billId === bill.id);
        let totalPaidAmount = 0;
        let totalOverdueAmount = 0;
        for (const l of billLedgers) {
            if (l.paidAmount != null) totalPaidAmount += Number(l.paidAmount);
            if (
                l.status === LedgerStatus.PENDING &&
                new Date(l.dueDate) < todayStart
            ) {
                totalOverdueAmount += Number(l.amount);
            }
        }
        const amount = Number(bill.amount);
        return {
            id: bill.id,
            name: bill.name,
            amount,
            amountPerPeriod: amount,
            frequency: bill.frequency,
            totalPaidAmount: round2(totalPaidAmount),
            totalOverdueAmount: round2(totalOverdueAmount),
        };
    });

    return {
        upcomingDues,
        totalAmountDueNext5Days,
        organizer,
        bills: billsList,
    };
};
