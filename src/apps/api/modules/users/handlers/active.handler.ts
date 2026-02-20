import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { isActiveUserService } from "../../../../../packages/services/user.service";

export const isActiveUserHandler = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await isActiveUserService(userId);

        res.json({
            message: "User status updated",
            isActive: user.isActive,
        });
    } catch (error: any) {
        res.status(400).json({
            message: error.message,
        });
    }
};
