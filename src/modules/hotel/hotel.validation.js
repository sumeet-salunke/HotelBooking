import { optional, z } from "zod";

export const createHotelSchema = z.object({

  name: z
    .string()
    .trim()
    .min(3, "Hotel name must contain at least 3 characters")
    .max(120, "Hotel name is too long"),

  description: z
    .string()
    .trim()
    .min(20, "Description must contain at least 20 characters")
    .max(3000, "Description is too long"),

  address: z.object({

    line1: z
      .string()
      .trim()
      .min(3, "Address line is required"),

    line2: z
      .string()
      .trim()
      .optional()
      .nullable(),

    city: z
      .string()
      .trim()
      .min(2, "City is required"),

    state: z
      .string()
      .trim()
      .min(2, "State is required"),

    country: z
      .string()
      .trim()
      .min(2, "Country is required"),

    postalCode: z
      .string()
      .trim()
      .min(3, "Postal code is required")
  }),

  amenities: z
    .array(
      z.string().trim().min(1)
    )
    .default([]),

  images: z
    .array(
      z.string().url("Invalid image URL")
    )
    .default([])
});

export const updateHotelSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Hotel name must be at least 3 characters long.").
    max(120, "Hotel names is too long")
    .optional(),

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters long")
    .max(3000, "Description is too long")
    .optional(),

  address: z
    .object({
      line1: z
        .string()
        .trim()
        .min(3)
        .optional(),

      line2: z
        .string()
        .trim()
        .nullable()
        .optional(),

      city: z
        .string()
        .trim()
        .min(2)
        .optional(),

      state: z
        .string()
        .trim()
        .min(2)
        .optional(),

      country: z
        .string()
        .trim()
        .min(3)
        .optional(),

      postalCode: z
        .string()
        .trim()
        .min(3)
        .optional(),
    })
    .strict().optional(),

  amenities: z
    .array(z.string().trim().min(1))
    .optional(),

  images: z.array(z.string().url("Invalid imag URL")).optional(),

}).strict();