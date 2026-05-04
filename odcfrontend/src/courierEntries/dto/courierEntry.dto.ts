// // import { z } from "zod";

// // export const courierEntrySchema = z.object({
// //     uuid4: z.string().optional(),

// //     courierName: z
// //         .string()
// //         .trim()
// //         .min(1, "Please select courier"),

// //     boxQuantity: z
// //         .string()
// //         .trim()
// //         .min(1, "Please enter quantity of box")
// //         .regex(/^[0-9]+$/, "Quantity must be a number"),

// //     collectedBy: z
// //         .string()
// //         .trim()
// //         .min(1, "Please enter collected by name"),

// //     phoneNumber: z
// //         .string()
// //         .trim()
// //         .min(1, "Please enter phone number")
// //         .regex(/^[0-9]{10}$/, "Please enter valid 10 digit phone number"),

// //     photoUri: z.string().optional(),
// // });

// // export type CourierEntryFormValues = z.infer<typeof courierEntrySchema>;

// // export type CourierRow = {
// //     id: string;
// //     name: string;
// // };

// // export type CourierEntryRow = CourierEntryFormValues & {
// //     id: string;
// // };

// // export type GetCourierEntriesResponse = {
// //     data: CourierEntryRow[];
// //     totalRecords: number;
// //     page: number;
// //     limit: number;
// //     totalPages: number;
// // };

// // export type CourierEntryResponse = {
// //     data: CourierEntryRow;
// //     message: string;
// //     success: boolean;
// // };

// import { z } from "zod";

// export const courierEntrySchema = z.object({
//     uuid4: z.string().optional(),

//     courierName: z
//         .string()
//         .trim()
//         .min(1, "Please select courier"),

//     boxQuantity: z
//         .string()
//         .trim()
//         .min(1, "Please enter quantity of box")
//         .regex(/^[0-9]+$/, "Quantity must be a number")
//         .refine((value) => Number(value) > 0, {
//             message: "Quantity must be greater than 0",
//         }),

//     collectedBy: z
//         .string()
//         .trim()
//         .min(1, "Please enter collected by name")
//         .min(2, "Name must be at least 2 characters")
//         .max(50, "Name must not be more than 50 characters")
//         .regex(/^[A-Za-z\s]+$/, "Name should contain only letters"),

//     phoneNumber: z
//         .string()
//         .trim()
//         .min(1, "Please enter phone number")
//         .regex(/^[0-9]+$/, "Phone number must contain only digits")
//         .length(10, "Phone number must be exactly 10 digits")
//         .regex(/^[6-9][0-9]{9}$/, "Please enter valid mobile number"),

//     photoUri: z.string().optional(),
// });

// export type CourierEntryFormValues = z.infer<typeof courierEntrySchema>;

// export type CourierRow = {
//     id: string;
//     name: string;
// };

// export type CourierEntryRow = CourierEntryFormValues & {
//     id: string;
// };

// export type GetCourierEntriesResponse = {
//     data: CourierEntryRow[];
//     totalRecords: number;
//     page: number;
//     limit: number;
//     totalPages: number;
// };

// export type CourierEntryResponse = {
//     data: CourierEntryRow;
//     message: string;
//     success: boolean;
// };

import { z } from "zod";
// Courier entry validation schema
export const courierEntrySchema = z.object({
    // Optional unique id
    uuid4: z.string().optional(),
    // Courier name validation
    courierName: z
        .string()
        .trim()
        .min(1, "Please select courier"),

    // Box quantity validation
    boxQuantity: z
        .string()
        .trim()
        .min(1, "Please enter quantity of box")
        .regex(/^[0-9]+$/, "Quantity must be a number")
        .refine((value) => Number(value) > 0, {
            message: "Quantity must be greater than 0",
        }),
    // Collected by name validation
    collectedBy: z
        .string()
        .trim()
        .min(1, "Please enter collected by name")
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must not be more than 50 characters")
        .regex(/^[A-Za-z\s]+$/, "Name should contain only letters"),
    // Phone number validation
    phoneNumber: z
        .string()
        .trim()
        .min(1, "Please enter phone number")
        .regex(/^[0-9]+$/, "Phone number must contain only digits")
        .length(10, "Phone number must be exactly 10 digits")
        .regex(/^[6-9][0-9]{9}$/, "Please enter valid mobile number"),

    // Optional photo URI
    photoUri: z.string().optional(),
    // Optional audio URI
    audioUri: z.string().optional(),
});

// Courier entry form type
export type CourierEntryFormValues = z.infer<typeof courierEntrySchema>;
// Courier dropdown row type
export type CourierRow = {
    id: string;
    name: string;
};
// Courier table row type
export type CourierEntryRow = CourierEntryFormValues & {
    id: string;
};
// Single entry API response type
export type GetCourierEntriesResponse = {
    data: CourierEntryRow[];
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type CourierEntryResponse = {
    data: CourierEntryRow;
    message: string;
    success: boolean;
};