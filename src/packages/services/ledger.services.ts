import prisma from "../lib/prisma";
import { ActivityType, LedgerStatus } from "../../generated/prisma/enums";

export const getLedgersService = async (userId: string) => {
    return prisma.ledger.findMany({
        where: {
            userId,
            isDeleted: false,
        },
        include: {
            bill: true,
        },
        orderBy: { dueDate: "desc" },
    });
};

export const getLedgerByIdService = async (ledgerId: string, userId: string) => {
    return prisma.ledger.findFirst({
        where: {
            id: ledgerId,
            userId,
            isDeleted: false,
        },
        include: {
            bill: true,
            activities: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
};

export interface BillLedgersSummary {
    totalLedgers: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
    totalAmount: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
    totalOverdueAmount: number;
}

export const getLedgersByBillIdService = async (
    billId: string,
    userId: string
) => {
    const bill = await prisma.bill.findFirst({
        where: { id: billId, userId, isDeleted: false },
    });
    if (!bill) return null;

    const ledgers = await prisma.ledger.findMany({
        where: {
            billId,
            userId,
            isDeleted: false,
        },
        include: {
            activities: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { dueDate: "desc" },
    });

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    let totalAmount = 0;
    let totalPaidAmount = 0;
    let totalPendingAmount = 0;
    let totalOverdueAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    for (const l of ledgers) {
        const amount = Number(l.amount);
        totalAmount += amount;

        if (l.status === LedgerStatus.PAID) {
            paidCount += 1;
            totalPaidAmount += l.paidAmount != null ? Number(l.paidAmount) : 0;
        } else {
            pendingCount += 1;
            totalPendingAmount += amount;
            const due = new Date(l.dueDate);
            if (due < todayStart) {
                overdueCount += 1;
                totalOverdueAmount += amount;
            }
        }
    }

    const summary: BillLedgersSummary = {
        totalLedgers: ledgers.length,
        paidCount,
        pendingCount,
        overdueCount,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
        totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
        totalOverdueAmount: Math.round(totalOverdueAmount * 100) / 100,
    };

    return { bill, ledgers, summary };
};

export interface MarkLedgerPaidInput {
    paidAmount: number | string;
    paidDate: Date;
}

export const markLedgerAsPaidService = async (
    ledgerId: string,
    userId: string,
    data: MarkLedgerPaidInput
) => {
    const existing = await prisma.ledger.findFirst({
        where: {
            id: ledgerId,
            userId,
            isDeleted: false,
        },
    });

    if (!existing) {
        return null;
    }

    return prisma.$transaction(async (tx) => {
        const ledger = await tx.ledger.update({
            where: { id: ledgerId },
            data: {
                paidAmount: data.paidAmount,
                paidDate: data.paidDate,
                status: LedgerStatus.PAID,
            },
        });
        await tx.activity.create({
            data: {
                ledgerId,
                date: new Date(),
                amount: data.paidAmount,
                type: ActivityType.MARKED_AS_PAID,
                changedToDate: data.paidDate,
            },
        });
        return ledger;
    });
};

export const markLedgerAsUnpaidService = async (
    ledgerId: string,
    userId: string
) => {
    const existing = await prisma.ledger.findFirst({
        where: {
            id: ledgerId,
            userId,
            isDeleted: false,
            status: LedgerStatus.PAID,
        },
    });

    if (!existing) {
        return null;
    }

    return prisma.$transaction(async (tx) => {
        const ledger = await tx.ledger.update({
            where: { id: ledgerId },
            data: {
                paidAmount: null,
                paidDate: null,
                status: LedgerStatus.PENDING,
            },
        });
        await tx.activity.create({
            data: {
                ledgerId,
                date: new Date(),
                amount: existing.amount,
                type: ActivityType.MARKED_AS_UNPAID,
                changedToDate: null,
            },
        });
        return ledger;
    });
};

export interface UpdateLedgerInput {
    amount?: number | string;
    dueDate?: Date | string;
}

export const updateLedgerService = async (
    ledgerId: string,
    userId: string,
    data: UpdateLedgerInput
) => {
    const existing = await prisma.ledger.findFirst({
        where: {
            id: ledgerId,
            userId,
            isDeleted: false,
        },
    });

    if (!existing) {
        return null;
    }

    const updates: {
        amount?: number | string;
        dueDate?: Date;
    } = {};
    const activities: Array<{
        amount: number | string;
        type: ActivityType;
        changedToDate: Date | null;
    }> = [];

    if (Object.keys(updates).length === 0) {
        return existing;
    }

    return prisma.$transaction(async (tx) => {
        const ledger = await tx.ledger.update({
            where: { id: ledgerId },
            data: updates,
        });
        for (const act of activities) {
            await tx.activity.create({
                data: {
                    ledgerId,
                    date: new Date(),
                    amount: act.amount,
                    type: act.type,
                    changedToDate: act.changedToDate,
                },
            });
        }
        return ledger;
    });
};
