import prisma from "../lib/prisma";
import { LedgerStatus } from "../../generated/prisma/enums";

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

    return prisma.ledger.update({
        where: { id: ledgerId },
        data: {
            paidAmount: data.paidAmount,
            paidDate: data.paidDate,
            status: LedgerStatus.PAID,
        },
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

    return prisma.ledger.update({
        where: { id: ledgerId },
        data: {
            paidAmount: null,
            paidDate: null,
            status: LedgerStatus.PENDING,
        },
    });
};
