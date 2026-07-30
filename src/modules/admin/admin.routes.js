import express from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";

import { authorizeRoles }
  from "../../middlewares/role.middleware.js";

import { ROLES }
  from "../../constants/roles.js";

import {
  getPendingHotels, getUsers, approveHotel, rejectHotel, updateUserStatus
} from "./admin.controller.js";

import { rejectHotelSchema, updateUserStatusSchema } from "../admin/admin.validation.js"
import validate from "../../middlewares/validate.middleware.js";

const router = express.Router();

router.get(

  "/hotels/pending",

  authenticate,

  authorizeRoles(ROLES.ADMIN),

  getPendingHotels

);

router.patch(
  "/hotels/:hotelId/approve",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  approveHotel
);
router.patch(
  "/hotels/:hotelId/reject",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate(rejectHotelSchema),
  rejectHotel
);

router.get(
  "/users",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  getUsers
);

router.patch(

  "/users/:userId/status",

  authenticate,

  authorizeRoles(ROLES.ADMIN),

  validate(updateUserStatusSchema),

  updateUserStatus

);

export default router;