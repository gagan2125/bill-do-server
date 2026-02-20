export interface CreateBillInput {
    name: string;
    amount: number;
    dueDate: Date;
    frequency: string;
    reminder: string;
    userId: string;
}

export interface UpdateBillInput {
    name?: string;
    amount?: number;
    dueDate?: Date;
    frequency?: string;
    reminder?: string;
}