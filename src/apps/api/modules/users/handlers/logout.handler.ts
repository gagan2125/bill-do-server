import { Request, Response } from "express";


const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
};

export const logoutUserHandler = (req: Request, res: Response) => {
    res.clearCookie("auth_token", COOKIE_OPTIONS);

    res.json({
        message: "Logged out",
    });
};
