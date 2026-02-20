import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { getLedgersService } from "../../../../../packages/services/ledger.services";
import { LedgerStatus } from "../../../../../generated/prisma/enums";

type LedgerItem = Awaited<ReturnType<typeof getLedgersService>>[number];

const startOfToday = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

export const getLedgersHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const ledgers = await getLedgersService(userId);
        const todayStart = startOfToday();

        const data = ledgers.map((ledger: LedgerItem) => {
            const dueDate = new Date(ledger.dueDate);
            const amount = Number(ledger.amount);
            const paidAmount = ledger.paidAmount != null ? Number(ledger.paidAmount) : 0;
            const isOverdue =
                ledger.status === LedgerStatus.PENDING && dueDate < todayStart;
            const remainingBalance =
                ledger.status === LedgerStatus.PAID
                    ? Math.max(0, amount - paidAmount)
                    : amount;
            return {
                ...ledger,
                status: isOverdue ? "OVERDUE" : ledger.status,
                remainingBalance: Math.round(remainingBalance * 100) / 100,
            };
        });

        return res.json({
            message: "Ledgers retrieved successfully",
            data,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to get ledgers";
        return res.status(500).json({ message });
    }
};
