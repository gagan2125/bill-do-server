import prisma from "../lib/prisma";
import { PushPlatform } from "../../generated/prisma/enums";

export type PushPlatformType = "WEB" | "ANDROID" | "IOS";

export const registerPushTokenService = async (
    userId: string,
    token: string,
    platform: PushPlatformType = "WEB"
) => {
    return prisma.pushToken.upsert({
        where: { token },
        create: { userId, token, platform: platform as PushPlatform },
        update: { userId, platform: platform as PushPlatform, updatedAt: new Date() },
    });
};

export const unregisterPushTokenService = async (
    userId: string,
    token: string
) => {
    const deleted = await prisma.pushToken.deleteMany({
        where: { userId, token },
    });
    return deleted.count > 0;
};
