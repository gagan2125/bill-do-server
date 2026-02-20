import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;

if (resendApiKey) {
    try {
        resend = new Resend(resendApiKey);
    } catch (err) {
        console.warn("Resend init skipped:", (err as Error).message);
    }
}

export { resend };

export const getMailFrom = (): string => {
    return process.env.RESEND_FROM || "Bill Do <onboarding@resend.dev>";
};

export const isEmailConfigured = (): boolean => !!resend;

export interface SendMailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
}

export const sendMail = async (options: SendMailOptions): Promise<boolean> => {
    if (!resend) {
        console.warn("Resend not configured (set RESEND_API_KEY)");
        return false;
    }

    const { from, to, subject, text, html } = options;

    try {
        const { error } = await resend.emails.send({
            from,
            to,
            subject,
            text,
            html,
        });
        if (error) {
            console.error("Resend error:", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("Resend send failed:", err);
        return false;
    }
};
