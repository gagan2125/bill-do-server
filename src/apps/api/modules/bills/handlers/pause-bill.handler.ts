import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { pauseBillService } from "../../../../../packages/services/bill.services";

export const pauseBillHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Bill id is required" });
        }

        const bill = await pauseBillService(id, userId);

        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        return res.json({
            message: "Bill paused successfully",
            data: bill,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to pause bill";
        return res.status(500).json({ message });
    }
};
