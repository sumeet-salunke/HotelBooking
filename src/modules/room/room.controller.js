import roomService from "./room.service.js";
import asyncHandler from "../../utils/asyncHandler.js"
import ApiResponse from "../../utils/ApiResponse.js"

export const createRoom = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const result = await roomService.createRoom(ownerId, req.body);
  return res.status(201).json(new ApiResponse(201, result.message, result.data));
});

export const getPublicRooms = asyncHandler(async (req, res) => {
  const hotelId = req.params.hotelId;
  const result = await roomService.getPublicRooms(hotelId, req.query);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const getOwnerRooms = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const hotelId = req.params.hotelId;
  const result = await roomService.getOwnerRooms(ownerId, hotelId, req.query);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const updateRoom = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const roomId = req.params.roomId;
  const result = await roomService.updateRoom(ownerId, roomId, req.body);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const roomId = req.params.roomId;
  const result = await roomService.deleteRoom(ownerId, roomId);
  return res.status(200).json(new ApiResponse(200, result.message, result.data)
  );
});