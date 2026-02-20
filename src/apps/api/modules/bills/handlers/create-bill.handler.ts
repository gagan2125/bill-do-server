import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import {
    createBillService,
} from "../../../../../packages/services/bill.services";

export const createBillHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { name, amount, dueDate, frequency, reminder } = req.body;

        if (!name || !amount || !dueDate || !frequency || !reminder) {
            return res.status(400).json({
                message: "name, amount, dueDate, frequency and reminder are required",
            });
        }

        const bill = await createBillService({
            name,
            amount,
            dueDate: new Date(dueDate),
            frequency,
            reminder,
            userId,
        });

        return res.status(201).json({
            message: "Bill created successfully",
            data: bill,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to create bill";
        return res.status(400).json({ message });
    }
};
