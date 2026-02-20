import prisma from "../lib/prisma";
import { CreateBillInput, UpdateBillInput } from "../types/bill.types";
import { BillFrequency } from "../../generated/prisma/enums";

export const createBillService = async (data: CreateBillInput) => {
    const { name, amount, dueDate, frequency, reminder, userId } = data;

    const existing = await prisma.bill.findFirst({
        where: { name, userId, isDeleted: false, isPaused: false },
    });

    if (existing) {
        throw new Error("Bill already exists");
    }

    const bill = await prisma.bill.create({
        data: {
            name,
            amount,
            dueDate,
            frequency: frequency as BillFrequency,
            reminder,
            userId,
        },
    });

    return bill;
};

export const getBillsService = async (userId: string) => {
    const bills = await prisma.bill.findMany({
        where: {
            userId,
            isDeleted: false,
        },
        orderBy: { dueDate: "asc" },
    });

    return bills;
};

export const getBillByIdService = async (id: string, userId: string) => {
    const bill = await prisma.bill.findFirst({
        where: {
            id,
            userId,
            isDeleted: false,
        },
    });

    return bill;
};

export const updateBillService = async (
    id: string,
    userId: string,
    data: UpdateBillInput
) => {
    const existing = await prisma.bill.findFirst({
        where: { id, userId, isDeleted: false, isPaused: false },
    });

    if (!existing) {
        return null;
    }

    return prisma.bill.update({
        where: { id },
        data: {
            ...(data.name != null && { name: data.name }),
            ...(data.amount != null && { amount: data.amount }),
            ...(data.dueDate != null && { dueDate: data.dueDate }),
            ...(data.frequency != null && {
                frequency: data.frequency as BillFrequency,
            }),
            ...(data.reminder != null && { reminder: data.reminder }),
        },
    });
};

export const deleteBillService = async (id: string, userId: string) => {
    const existing = await prisma.bill.findFirst({
        where: { id, userId, isDeleted: false, isPaused: false },
    });

    if (!existing) {
        return null;
    }

    return prisma.bill.update({
        where: { id },
        data: { isDeleted: true },
    });
};

export const pauseBillService = async (id: string, userId: string) => {
    const existing = await prisma.bill.findFirst({
        where: { id, userId, isDeleted: false },
    });

    if (!existing) {
        return null;
    }

    if (existing.isPaused) {
        return existing;
    }

    return prisma.bill.update({
        where: { id },
        data: { isPaused: true },
    });
};

export const resumeBillService = async (id: string, userId: string) => {
    const existing = await prisma.bill.findFirst({
        where: { id, userId, isDeleted: false },
    });

    if (!existing) {
        return null;
    }

    if (!existing.isPaused) {
        return existing;
    }

    return prisma.bill.update({
        where: { id },
        data: { isPaused: false },
    });
};
