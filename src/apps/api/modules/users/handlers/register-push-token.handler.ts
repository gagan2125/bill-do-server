import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { registerPushTokenService } from "../../../../../packages/services/push-token.services";
import type { PushPlatformType } from "../../../../../packages/services/push-token.services";

export const registerPushTokenHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { token, platform } = req.body as {
            token?: string;
            platform?: PushPlatformType;
        };

        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "token is required" });
        }

        const validPlatforms: PushPlatformType[] = ["WEB", "ANDROID", "IOS"];
        const platformValue = platform && validPlatforms.includes(platform) ? platform : "WEB";

        const pushToken = await registerPushTokenService(userId, token, platformValue);

        return res.status(201).json({
            message: "Push token registered successfully",
            data: pushToken,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to register push token";
        return res.status(400).json({ message });
    }
};
