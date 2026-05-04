// import { z } from "zod";

// // History entry validation schema
// export const historyEntrySchema = z.object({
//     // Optional unique id
//     uuid4: z.string().optional(),

//     // Entry id
//     id: z.string(),

//     // Date validation
//     date: z.string().min(1, "Date is required"),

//     // Courier name validation
//     courierName: z
//         .string()
//         .trim()
//         .min(1, "Courier name is required"),

//     // Box quantity validation
//     boxQuantity: z
//         .string()
//         .trim()
//         .min(1, "Box quantity is required")
//         .regex(/^[0-9]+$/, "Box quantity must be a number"),

//     // Collected by validation
//     collectedBy: z
//         .string()
//         .trim()
//         .min(1, "Collected by is required"),

//     // Photo availability flag
//     hasPhoto: z.boolean(),

//     // User mobile number validation
//     userMobileNo: z
//         .string()
//         .trim()
//         .min(1, "User mobile number is required")
//         .regex(/^[0-9]{10}$/, "Enter valid 10 digit mobile number"),

//     // Optional phone number
//     phoneNumber: z.string().optional(),

//     // Optional media fields
//     photoUri: z.string().optional(),
//     audioUri: z.string().optional(),

//     // Optional created date
//     createdAt: z.string().optional(),
// });
// // History entry form type
// export type HistoryEntryFormValues = z.infer<typeof historyEntrySchema>;

// // History table row type
// export type HistoryEntryRow = HistoryEntryFormValues;

// // User role type
// export type UserRole = "superadmin" | "user";

// // Logged-in user type
// export type LoggedInUserDto = {
//     id: string;
//     name: string;
//     mobileNo: string;
//     role: UserRole;
// };

// // Dropdown option type
// export type OptionRow = {
//     label: string;
//     value: string;
// };

// // Get history API response type
// export type GetHistoryEntriesResponse = {
//     data: HistoryEntryRow[];
//     totalRecords: number;
//     page: number;
//     limit: number;
//     totalPages: number;
// };
import { z } from "zod";

// History entry validation schema
export const historyEntrySchema = z.object({
    // Optional unique id
    uuid4: z.string().optional(),

    // Entry id
    id: z.string(),

    // Date validation
    date: z.string().min(1, "Date is required"),

    // Courier name validation
    courierName: z
        .string()
        .trim()
        .min(1, "Courier name is required"),

    // Box quantity validation
    boxQuantity: z
        .string()
        .trim()
        .min(1, "Box quantity is required")
        .regex(/^[0-9]+$/, "Box quantity must be a number"),

    // Collected by validation
    collectedBy: z
        .string()
        .trim()
        .min(1, "Collected by is required"),

    // Photo availability flag
    hasPhoto: z.boolean(),

    // User mobile number validation
    userMobileNo: z
        .string()
        .trim()
        .min(1, "User mobile number is required")
        .regex(/^[0-9]{10}$/, "Enter valid 10 digit mobile number"),

    // Optional phone number
    phoneNumber: z.string().optional(),

    // Optional media fields
    photoUri: z.string().optional(),
    audioUri: z.string().optional(),

    // Optional created date
    createdAt: z.string().optional(),
});

// History entry form type
export type HistoryEntryFormValues = z.infer<typeof historyEntrySchema>;

// History table row type
export type HistoryEntryRow = HistoryEntryFormValues;

// History record type for UI
export type HistoryRecord = {
    id: string;
    date: string;
    courierName: string;
    boxQuantity: string;
    collectedBy: string;

    phoneNumber?: string;
    userMobileNo?: string;

    photoUri?: string;
    photo?: string;
    image?: string;
    photoUrl?: string;
    imageBase64?: string;
    photoBase64?: string;
    base64?: string;
    audioUri?: string;

    hasPhoto?: boolean;
    createdAt?: string;
    uuid4?: string;
};

// User role type
export type UserRole = "superadmin" | "user";

// Logged-in user type
export type LoggedInUserDto = {
    id: string;
    name: string;
    mobileNo: string;
    role: UserRole;
};

// Dropdown option type
export type OptionRow = {
    label: string;
    value: string;
};

// Select popup props type
export type SelectPopupProps = {
    visible: boolean;
    title: string;
    options: OptionRow[];
    selectedValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
};

// Get history API response type
export type GetHistoryEntriesResponse = {
    data: HistoryEntryRow[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
};