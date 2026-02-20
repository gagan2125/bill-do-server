import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { markLedgerAsUnpaidService } from "../../../../../packages/services/ledger.services";

export const markLedgerUnpaidHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Ledger id is required" });
        }

        const ledger = await markLedgerAsUnpaidService(id, userId);

        if (!ledger) {
            return res.status(404).json({
                message:
                    "Ledger not found or not paid (only PAID ledgers can be marked as unpaid)",
            });
        }

        return res.json({
            message: "Ledger marked as unpaid successfully",
            data: ledger,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to mark ledger as unpaid";
        return res.status(400).json({ message });
    }
};
