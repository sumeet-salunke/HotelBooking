import { z } from "zod";
import { ROOM_TYPE } from "../../constants/roomType.js";
import { BED_TYPE } from "../../constants/bedType.js";

export const createRoomSchema = z.object({
  hotelId: z
    .string()
    .nonempty(),

  name: z
    .string()
    .trim()
    .min(3, "Room name must contain at least 3 characters")
    .max(120, "Name is too long"),

  description: z
    .string()
    .trim()
    .min(20, " Room description must be at least 20 characters long")
    .max(2000, "Room description is too long"),

  roomType: z
    .enum(Object.values(ROOM_TYPE)),

  pricePerNight: z
    .number()
    .positive("Price per night must be greater than 0"),

  maxGuests: z
    .number()
    .int()
    .min(1, "Minimum number of guests must be at least 1")
    .max(20, "Maximum number of guests is 20"),

  totalRooms: z
    .number()
    .int()
    .min(1, "Total number is 1"),

  bedType: z
    .enum(Object.values(BED_TYPE)),

  amenities: z
    .array(z.string().trim().min(1))
    .default([]),

  images: z
    .array(z.string().url("Invalid image URL"))
    .default([]),

}).strict();

export const updateRoomSchema = createRoomSchema.omit({
  hotelId: true
}).partial().extend({
  isActive: z.boolean().optional()
})
  .strict();