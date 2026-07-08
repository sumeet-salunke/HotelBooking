import express from "express";
import { createHotel, deleteHotel, getHotelById, getHotels, getMyHotels, updateHotel } from "./hotel.controller.js";
import { createHotelSchema, updateHotelSchema } from "./hotel.validation.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();


router.post("/", authenticate, authorizeRoles(ROLES.HOTEL_OWNER, ROLES.ADMIN), validate(createHotelSchema), createHotel);

router.get("/", getHotels);

router.get("/owner/me", authenticate, authorizeRoles(ROLES.HOTEL_OWNER, ROLES.ADMIN), getMyHotels);

router.patch("/:hotelId", authenticate, authorizeRoles(ROLES.HOTEL_OWNER), validate(updateHotelSchema), updateHotel);

router.delete("/:hotelId", authenticate, authorizeRoles(ROLES.HOTEL_OWNER), deleteHotel);

router.get("/:hotelId", getHotelById);


export default router;