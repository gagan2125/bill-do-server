import { Request, Response } from "express";
import { updateUserService } from "../../../../../packages/services/user.service";

export const updateProfileHandler = async (req: Request, res: Response) => {
    try {
        const {
            firstName,
            lastName,
            email,
            mobileNumber
        } = req.body;

        if (!firstName || !email || !mobileNumber) {
            return res.status(400).json({ message: "All fields required" });
        }

        // Check for req.user existence and get userId safely
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await updateUserService(userId, {
            firstName,
            lastName,
            email,
            mobileNumber
        }
        );
        return res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        return res.status(400).json({ message: "Failed to update profile" });
    }
}