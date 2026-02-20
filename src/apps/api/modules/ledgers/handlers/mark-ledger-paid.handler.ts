import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { markLedgerAsPaidService } from "../../../../../packages/services/ledger.services";

export const markLedgerPaidHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Ledger id is required" });
        }

        const { paidAmount, paidDate } = req.body;

        if (paidAmount == null || paidDate == null) {
            return res.status(400).json({
                message: "paidAmount and paidDate are required",
            });
        }

        const ledger = await markLedgerAsPaidService(id, userId, {
            paidAmount,
            paidDate: new Date(paidDate),
        });

        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        return res.json({
            message: "Ledger marked as paid successfully",
            data: ledger,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to mark ledger as paid";
        return res.status(400).json({ message });
    }
};
