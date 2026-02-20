import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { getDashboardService } from "../../../../../packages/services/dashboard.services";

export const dashboardHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const data = await getDashboardService(userId);

        return res.json({
            message: "Dashboard retrieved successfully",
            data,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to get dashboard";
        return res.status(500).json({ message });
    }
};
