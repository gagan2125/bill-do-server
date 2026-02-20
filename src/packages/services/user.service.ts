import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { LoginUserInput, RegisterUserInput, UpdateUserInput } from "../types/user.types";

export const registerUserService = async (data: RegisterUserInput) => {
    const { firstName, lastName, email, mobileNumber, password } = data;

    //check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { mobileNumber }]
        }
    })

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            mobileNumber,
            password: hashedPassword,
        },
    })

    return user;
}

export const loginUserService = async (data: LoginUserInput) => {
    const { email, password } = data;

    if (!email) {
        throw new Error("Email required");
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email }],
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.password) {
        throw new Error("Password not set");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
        throw new Error("User disabled");
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    );


    return {
        user,
        token,
    };

}

export const getMeService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    return user;
}

export const updateUserService = async (userId: string, data: UpdateUserInput) => {
    const { firstName, lastName, email, mobileNumber } = data;

    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!existingUser) {
        throw new Error("User not found");
    }

    const user = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            firstName,
            lastName,
            email,
            mobileNumber,
        },
    });

    return user;
}

export const isActiveUserService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isActive: !user.isActive, // 🔁 toggle
        },
    });

    return updatedUser;
};