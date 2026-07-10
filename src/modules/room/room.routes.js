import express from "express";
import { createRoomSchema, updateRoomSchema } from "./room.validation.js";
import { createRoom, deleteRoom, getOwnerRooms, updateRoom } from "./room.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { ROLES } from "../../constants/roles.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles(ROLES.HOTEL_OWNER), validate(createRoomSchema), createRoom);

router.patch("/:roomId", authenticate, authorizeRoles(ROLES.HOTEL_OWNER), validate(updateRoomSchema), updateRoom);

router.delete("/:roomId", authenticate, authorizeRoles(ROLES.HOTEL_OWNER), deleteRoom);

router.get("/owner/:hotelId", authenticate, authorizeRoles(ROLES.HOTEL_OWNER), getOwnerRooms);

export default router;