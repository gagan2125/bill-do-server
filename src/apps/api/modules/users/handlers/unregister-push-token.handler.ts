import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { unregisterPushTokenService } from "../../../../../packages/services/push-token.services";

export const unregisterPushTokenHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { token } = req.body as { token?: string };

        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "token is required" });
        }

        const removed = await unregisterPushTokenService(userId, token);

        return res.json({
            message: removed ? "Push token removed" : "Token not found or already removed",
            data: { removed },
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to remove push token";
        return res.status(400).json({ message });
    }
};
