import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { getMeService } from "../../../../../packages/services/user.service";

export const getMeHandler = async (req: AuthRequest, res: Response) => {
    try {
        const user = await getMeService(req.user!.userId);
        return res.json({
            message: "User found",
            user,
        });
    } catch (error) {
        return res.status(401).json({ message: "Invalid session" });
    }
}