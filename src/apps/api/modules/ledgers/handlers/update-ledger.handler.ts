import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { updateLedgerService } from "../../../../../packages/services/ledger.services";

export const updateLedgerHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Ledger id is required" });
        }

        const { amount, dueDate } = req.body;

        if (amount == null && dueDate == null) {
            return res.status(400).json({
                message: "At least one of amount or dueDate is required",
            });
        }

        const ledger = await updateLedgerService(id, userId, {
            ...(amount != null && { amount }),
            ...(dueDate != null && {
                dueDate: typeof dueDate === "string" ? dueDate : dueDate,
            }),
        });

        if (!ledger) {
            return res.status(404).json({ message: "Ledger not found" });
        }

        return res.json({
            message: "Ledger updated successfully",
            data: ledger,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to update ledger";
        return res.status(400).json({ message });
    }
};
