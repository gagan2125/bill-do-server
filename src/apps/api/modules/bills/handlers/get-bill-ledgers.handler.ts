import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import {
    getLedgersByBillIdService,
    BillLedgersSummary,
} from "../../../../../packages/services/ledger.services";
import { LedgerStatus } from "../../../../../generated/prisma/enums";

const startOfToday = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

export const getBillLedgersHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const billId = req.params.id;
        if (!billId || typeof billId !== "string") {
            return res.status(400).json({ message: "Bill id is required" });
        }

        const result = await getLedgersByBillIdService(billId, userId);

        if (!result) {
            return res.status(404).json({ message: "Bill not found" });
        }

        const todayStart = startOfToday();
        const entries = result.ledgers.map((ledger) => {
            const dueDate = new Date(ledger.dueDate);
            const amount = Number(ledger.amount);
            const paidAmount =
                ledger.paidAmount != null ? Number(ledger.paidAmount) : 0;
            const isOverdue =
                ledger.status === LedgerStatus.PENDING && dueDate < todayStart;
            const remainingBalance =
                ledger.status === LedgerStatus.PAID
                    ? Math.max(0, amount - paidAmount)
                    : amount;

            return {
                id: ledger.id,
                amount,
                paidAmount: ledger.paidAmount != null ? paidAmount : null,
                dueDate: ledger.dueDate,
                paidDate: ledger.paidDate,
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
                createdAt: ledger.createdAt,
                updatedAt: ledger.updatedAt,
            };
        });

        const summary: BillLedgersSummary = result.summary;

        return res.json({
            message: "Bill ledger entries retrieved successfully",
            data: {
                bill: result.bill,
                entries,
                summary,
            },
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to get bill ledger entries";
        return res.status(500).json({ message });
    }
};
