import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { updateBillService } from "../../../../../packages/services/bill.services";

export const updateBillHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Bill id is required" });
        }

        const { name, amount, dueDate, frequency, reminder } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Bill id is required" });
        }

        const bill = await updateBillService(id, userId, {
            ...(name != null && { name }),
            ...(amount != null && { amount }),
            ...(dueDate != null && { dueDate: new Date(dueDate) }),
            ...(frequency != null && { frequency }),
            ...(reminder != null && { reminder }),
        });

        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        return res.json({
            message: "Bill updated successfully",
            data: bill,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to update bill";
        return res.status(400).json({ message });
    }
};
