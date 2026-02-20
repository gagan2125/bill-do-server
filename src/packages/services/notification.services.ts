import { messaging } from "../lib/firebase";
import prisma from "../lib/prisma";

export interface SendNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export const sendPushToUser = async (
    userId: string,
    payload: SendNotificationPayload
): Promise<{ sent: number; failed: number }> => {
    if (!messaging) {
        console.warn("Firebase messaging not available, skip push");
        return { sent: 0, failed: 0 };
    }

    const tokens = await prisma.pushToken.findMany({
        where: { userId },
        select: { token: true },
    });

    if (!tokens.length) {
        return { sent: 0, failed: 0 };
    }

    const message = {
        notification: {
            title: payload.title,
            body: payload.body,
        },
        data: payload.data ?? {},
        tokens: tokens.map((t: { token: string }) => t.token),
    };

    let sent = 0;
    let failed = 0;

    try {
        const response = await messaging.sendEachForMulticast(message);
        sent = response.successCount;
        failed = response.failureCount;

        response.responses.forEach((r, i) => {
            if (!r.success && r.error?.code === "messaging/invalid-registration-token") {
                prisma.pushToken.deleteMany({ where: { token: tokens[i].token } }).catch(() => {});
            }
        });
    } catch (err) {
        console.error("FCM send error:", err);
        failed = tokens.length;
    }

    return { sent, failed };
};

export const sendPushToUsers = async (
    userIds: string[],
    payload: SendNotificationPayload
): Promise<void> => {
    const uniqueIds = [...new Set(userIds)];
    for (const userId of uniqueIds) {
        await sendPushToUser(userId, payload);
    }
};
