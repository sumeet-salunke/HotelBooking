import { z } from "zod";
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50)
  ,
  email: z
    .string().trim().email("Invalid email"),
  password: z
    .string().min(8, "Password must be at least 8 characters").max(50)
});

export const verifyOTPSchema = z.object({
  email: z
    .string().trim().email(),
  otp: z
    .string().trim().length(6)
});

export const loginSchema = z.object({
  email: z
    .string().trim().email("Invalid email"),

  password: z
    .string().min(8, "Password must be at least 8 characters long"),
});

export const forgotPassswordSchema = z.object({
  email: z.string().trim().email("Invalid email address"),

});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
  newPassword: z.string().min(8, "password must be at least 8 characters"),
})