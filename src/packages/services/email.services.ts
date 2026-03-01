import { sendMail, getMailFrom, isEmailConfigured } from "../lib/email";
import { renderBillsDueEmail } from "../lib/email-templates";
import prisma from "../lib/prisma";

export interface BillsDueEmailOptions {
    userIds: string[];
    billCount: number;
}

export const sendBillsDueTodayEmail = async (
    options: BillsDueEmailOptions
): Promise<{ sent: number; failed: number }> => {
    if (!isEmailConfigured()) {
        console.warn("Resend not configured (set RESEND_API_KEY), skip email");
        return { sent: 0, failed: 0 };
    }

    const { userIds, billCount } = options;
    const uniqueIds = [...new Set(userIds)];

    const users = await prisma.user.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true, email: true, firstName: true },
    });

    const from = getMailFrom();
    const subject =
        billCount === 1 ? "Bill due today" : `${billCount} bills due today`;
    const appUrl = process.env.APP_URL || process.env.FRONTEND_URL;

    let sent = 0;
    let failed = 0;

    for (const user of users) {
        if (!user.email?.trim()) {
            failed++;
            continue;
        }
        const textBody =
            billCount === 1
                ? "You have 1 new bill due today. Open the app to view and pay."
                : `You have ${billCount} new bills due today. Open the app to view and pay.`;
        const html = renderBillsDueEmail({
            firstName: user.firstName,
            billCount,
            appUrl,
        });
        const ok = await sendMail({
            from,
            to: user.email,
            subject,
            text: `Hi ${user.firstName},\n\n${textBody}\n\n— Bill Do`,
            html,
        });
        if (ok) sent++;
        else failed++;
    }

    return { sent, failed };
};
