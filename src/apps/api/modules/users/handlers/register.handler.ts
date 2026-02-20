import { Request, Response } from "express";
import { registerUserService } from "../../../../../packages/services/user.service";

export const registerUserHandler = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, mobileNumber, password } = req.body;

        if (!firstName || !email || !mobileNumber || !password) {
            return res.status(400).json({
                message: "All fields required",
            });
        }

        const user = await registerUserService({
            firstName,
            lastName,
            email,
            mobileNumber,
            password,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });

    } catch (error) {
        let errorMessage = "Registration failed";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return res.status(400).json({
            success: false,
            message: errorMessage,
        });
    }
}
