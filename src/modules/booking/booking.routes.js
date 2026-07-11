import express from "express";

import {
  createBooking,
  getMyBookings,
  getMyBookingById,
  cancelMyBooking
} from "./booking.controller.js";

import {
  createBookingSchema
} from "./booking.validation.js";

import {
  authenticate
} from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles
} from "../../middlewares/role.middleware.js";

import validate
  from "../../middlewares/validate.middleware.js";

import {
  ROLES
} from "../../constants/roles.js";

const router = express.Router();


/*
Customer booking history

Keep static routes before /:bookingId
*/
router.get(
  "/me",
  authenticate,
  authorizeRoles(ROLES.CUSTOMER),
  getMyBookings
);


/*
Create booking
*/
router.post(
  "/",
  authenticate,
  authorizeRoles(ROLES.CUSTOMER),
  validate(createBookingSchema),
  createBooking
);


/*
Get one owned booking
*/
router.get(
  "/:bookingId",
  authenticate,
  authorizeRoles(ROLES.CUSTOMER),
  getMyBookingById
);


/*
Cancel owned booking
*/
router.patch(
  "/:bookingId/cancel",
  authenticate,
  authorizeRoles(ROLES.CUSTOMER),
  cancelMyBooking
);


export default router;