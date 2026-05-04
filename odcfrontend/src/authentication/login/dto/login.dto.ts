// import { z } from "zod";

// export const loginSchema = z.object({
//     phone: z
//         .string()
//         .trim()
//         .min(1, "Mobile number is required")
//         .regex(
//             /^[789][0-9]{9}$/,
//             "Enter valid 10 digit mobile number starting with 7, 8, or 9"
//         ),

//     password: z
//         .string()
//         .trim()
//         .min(1, "Password is required")
//         .min(6, "Password must be at least 6 characters")
//         .max(50, "Password must not be more than 50 characters"),
// });

// export type LoginRequestDto = z.infer<typeof loginSchema>;

// export type LoginUserDto = {
//     id: string;
//     name: string;
//     phone: string;
//     role: "superadmin" | "user";
// };

// export type LoginResponseDto = {
//     success: boolean;
//     message: string;
//     token?: string;
//     user?: LoginUserDto;
// };

import { z } from "zod";

// Login form validation schema
export const loginSchema = z.object({

    // Mobile number validation
    phone: z
        .string()
        .trim()
        .min(1, "Mobile number is required")
        .regex(/^[0-9]+$/, "Mobile number must contain only digits")
        .length(10, "Mobile number must be exactly 10 digits")
        .regex(
            /^[6-9][0-9]{9}$/,
            "Enter valid  mobile number."
        ),

    // Password validation
    password: z
        .string()
        .trim()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(50, "Password must not be more than 50 characters"),
});

// Login request type
export type LoginRequestDto = z.infer<typeof loginSchema>;

// Logged-in user type
export type LoginUserDto = {
    id: string;
    name: string;
    phone: string;
    role: "superadmin" | "user";
};

// Login API response type
export type LoginResponseDto = {
    success: boolean;
    message: string;
    token?: string;
    user?: LoginUserDto;
};