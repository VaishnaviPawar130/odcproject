// import { z } from "zod";

// export const signupSchema = z.object({
//     mobileNo: z
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

// export type SignupRequestDto = z.infer<typeof signupSchema>;

// export type SignupUserDto = {
//     id: string;
//     mobileNo: string;
//     role: "superadmin" | "user";
// };

// export type SignupResponseDto = {
//     success: boolean;
//     message: string;
//     token?: string;
//     user?: SignupUserDto;
// };

import { z } from "zod";

// Signup form validation schema
export const signupSchema = z.object({

    // Mobile number validation
    mobileNo: z
        .string()
        .trim()
        .min(1, "Mobile number is required")
        .regex(/^[0-9]+$/, "Mobile number must contain only digits")
        .length(10, "Mobile number must be exactly 10 digits")
        .regex(/^[6-9][0-9]{9}$/, "Enter valid mobile number."),

    // Password validation
    password: z
        .string()
        .trim()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(50, "Password must not be more than 50 characters"),
});
// Signup request type
export type SignupRequestDto = z.infer<typeof signupSchema>;
// Signup user type
export type SignupUserDto = {
    id: string;
    name?: string;
    phone?: string;
    mobileNo?: string;
    role?: "superadmin" | "user";
};
// Signup API response type
export type SignupResponseDto = {
    success: boolean;
    message: string;
    token?: string;
    user?: SignupUserDto;
};