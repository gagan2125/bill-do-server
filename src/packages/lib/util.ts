import { BillFrequency } from "../../generated/prisma/enums";

export const isBillDueToday = (
    billDueDate: Date,
    frequency: string,
    today: { day: number; month: number; year: number }
) => {
    const d = new Date(billDueDate);
    // Use UTC so stored date "2025-02-15" is always the 15th regardless of server TZ
    const billDay = d.getUTCDate();
    const billMonth = d.getUTCMonth();
    const billYear = d.getUTCFullYear();

    if (frequency === BillFrequency.MONTHLY) {
        return billDay === today.day && billMonth === today.month;
    }
    if (frequency === BillFrequency.YEARLY) {
        return billDay === today.day && billMonth === today.month && billYear === today.year;
    }
    return false;
}