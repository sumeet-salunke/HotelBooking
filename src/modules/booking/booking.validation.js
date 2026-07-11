import { z } from "zod";

export const createBookingSchema = z
  .object({
    roomId: z
      .string()
      .min(1, "Room ID is required"),

    checkIn: z
      .string()
      .min(1, "Check-in date is required"),

    checkOut: z
      .string()
      .min(1, "Check-out date is required"),

    quantity: z
      .number()
      .int("Quantity must be an integer")
      .min(
        1,
        "Quantity must be at least 1"
      ),

    guests: z
      .number()
      .int("Guests must be an integer")
      .min(
        1,
        "At least one guest is required"
      )
  })
  .strict();