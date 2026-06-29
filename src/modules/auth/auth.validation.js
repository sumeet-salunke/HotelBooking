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