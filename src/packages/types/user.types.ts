export interface RegisterUserInput {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
}

export interface LoginUserInput {
    email: string;
    password: string;
}

export interface UpdateUserInput {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
}