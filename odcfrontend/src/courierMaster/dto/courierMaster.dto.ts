import { z } from "zod";

// Courier master validation schema
export const courierMasterSchema = z.object({
    // Optional courier ID
    uuid4: z
        .string()
        .uuid("Invalid courier ID.")
        .optional(),
    // Courier name validation
    courierName: z
        .string()
        .trim()
        .min(1, "Courier name is required.")
        .min(2, "Courier name must be at least 2 characters.")
        .max(80, "Courier name must not be more than 80 characters.")
        .regex(
            /^[A-Za-z0-9&.\- ]+$/,
            "Courier name can contain only letters, numbers, spaces, &, dot, and hyphen."
        )
        .refine(
            (value) => !/\s{2,}/.test(value),
            "Courier name should not contain multiple spaces."
        ),

    // Mobile number validation
    mobileNo: z
        .string()
        .trim()
        .min(1, "Mobile number is required.")
        .regex(
            /^[6-9][0-9]{9}$/,
            "Enter valid 10 digit Indian mobile number."
        ),
});

// Courier master form type
export type CourierMasterFormValues = z.infer<typeof courierMasterSchema>;
// Courier master row type
export type CourierMasterRow = CourierMasterFormValues & {
    id: string;
};
// Get courier masters API response type
export type GetCourierMastersResponse = {
    data: CourierMasterRow[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
};

// Single courier master API response type

export type CourierMasterResponse = {
    data: CourierMasterRow;
    message: string;
    success: boolean;
};