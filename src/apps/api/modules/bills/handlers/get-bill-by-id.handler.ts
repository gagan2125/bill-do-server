import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { getBillByIdService } from "../../../../../packages/services/bill.services";

export const getBillByIdHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Bill id is required" });
        }

        const bill = await getBillByIdService(id, userId);

        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        return res.json({
            message: "Bill retrieved successfully",
            data: bill,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to get bill";
        return res.status(500).json({ message });
    }
};
