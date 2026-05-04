import { z } from "zod";

// User master validation schema
export const userMasterSchema = z.object({
    uuid4: z
        .string()
        .uuid("Invalid user ID.")
        .optional(),

    // Mobile number validation
    mobileNo: z
        .string()
        .trim()
        .min(1, "Mobile number is required.")
        .regex(
            /^[6-9][0-9]{9}$/,
            "Enter valid 10 digit Indian mobile number."
        )
        .refine(
            (value) => !/^(\d)\1{9}$/.test(value),
            "Mobile number cannot contain same digit repeated 10 times."
        ),

    // Name validation
    name: z
        .string()
        .trim()
        .min(1, "Name is required.")
        .min(2, "Name must be at least 2 characters.")
        .max(50, "Name must not be more than 50 characters.")
        .regex(
            /^[A-Za-z ]+$/,
            "Name should contain only letters."
        )
        .refine(
            (value) => value.trim().length > 0,
            "Name cannot be empty."
        )
        .refine(
            (value) => !/\s{2,}/.test(value),
            "Name should not contain multiple spaces."
        )
        .refine(
            (value) => value.split(" ").every((word) => word.length >= 2),
            "Each name word must be at least 2 characters."
        ),
});

// User master form type
export type UserMasterFormValues = z.infer<typeof userMasterSchema>;
export type UserMasterErrors = Partial<Record<keyof UserMasterFormValues, string>>;

export type UserMasterRow = {
    id: string;
    name: string;
    phone: string;
    initial: string;
    color: string;
};

// Get users API response type
export type GetUserMastersResponse = {
    data: UserMasterRow[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
};

// Single user API response type
export type UserMasterResponse = {
    data: UserMasterRow;
    message: string;
    success: boolean;
};