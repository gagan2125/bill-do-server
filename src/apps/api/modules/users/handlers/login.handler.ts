import { Request, Response } from "express";
import { loginUserService } from "../../../../../packages/services/user.service";

export const loginUserHandler = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if ((!email) || !password) {
            return res.status(400).json({
                message: "Email and password required",
            });
        }

        const { user, token } = await loginUserService({
            email,
            password,
        });

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // or "none" for cross domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.json({
            message: "Login success",
            user,
        });

    } catch (error: any) {
        return res.status(401).json({
            message: error.message || "Login failed",
        });
    }
};