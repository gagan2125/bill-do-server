import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { getBillsService } from "../../../../../packages/services/bill.services";

export const getBillsHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const bills = await getBillsService(userId);

        return res.json({
            message: "Bills retrieved successfully",
            data: bills,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to get bills";
        return res.status(500).json({ message });
    }
};
