import { z } from "zod";

export const rejectHotelSchema = z.object({

  reason: z
    .string()
    .trim()
    .min(5, "Reason is too short.")
    .max(500, "Reason is too long.")

}).strict();


export const updateUserStatusSchema = z.object({

  isActive: z.boolean()

}).strict();