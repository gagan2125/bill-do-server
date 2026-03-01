import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { getLedgerByIdService } from "../../../../../packages/services/ledger.services";
import { LedgerStatus } from "../../../../../generated/prisma/enums";

const startOfToday = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

export const getLedgerByIdHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Ledger id is required" });
        }

        const ledger = await getLedgerByIdService(id, userId);

        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        const dueDate = new Date(ledger.dueDate);
        const amount = Number(ledger.amount);
        const paidAmount =
            ledger.paidAmount != null ? Number(ledger.paidAmount) : 0;
        const todayStart = startOfToday();
        const isOverdue =
            ledger.status === LedgerStatus.PENDING && dueDate < todayStart;
        const remainingBalance =
            ledger.status === LedgerStatus.PAID
                ? Math.max(0, amount - paidAmount)
                : amount;

        const data = {
            ...ledger,
            status: isOverdue ? "OVERDUE" : ledger.status,
            remainingBalance: Math.round(remainingBalance * 100) / 100,
            activities: ledger.activities.map((a) => ({
                id: a.id,
                date: a.date,
                amount: Number(a.amount),
                type: a.type,
                changedToDate: a.changedToDate,
                createdAt: a.createdAt,
            })),
        };

        return res.json({
            message: "Ledger retrieved successfully",
            data,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to get ledger";
        return res.status(500).json({ message });
    }
};
