import { z } from "zod";

export const historyEntrySchema = z.object({
    uuid4: z.string().optional(),

    id: z.string(),

    date: z.string().min(1, "Date is required"),

    courierName: z
        .string()
        .trim()
        .min(1, "Courier name is required"),

    boxQuantity: z
        .string()
        .trim()
        .min(1, "Box quantity is required")
        .regex(/^[0-9]+$/, "Box quantity must be a number"),

    collectedBy: z
        .string()
        .trim()
        .min(1, "Collected by is required"),

    hasPhoto: z.boolean(),

    userMobileNo: z
        .string()
        .trim()
        .min(1, "User mobile number is required")
        .regex(/^[0-9]{10}$/, "Enter valid 10 digit mobile number"),

    phoneNumber: z.string().optional(),

    photoUri: z.string().optional(),

    createdAt: z.string().optional(),
});

export type HistoryEntryFormValues = z.infer<typeof historyEntrySchema>;

export type HistoryEntryRow = HistoryEntryFormValues;

export type UserRole = "superadmin" | "user";

export type LoggedInUserDto = {
    id: string;
    name: string;
    mobileNo: string;
    role: UserRole;
};

export type OptionRow = {
    label: string;
    value: string;
};

export type GetHistoryEntriesResponse = {
    data: HistoryEntryRow[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
};