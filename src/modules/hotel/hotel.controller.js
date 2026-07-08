import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import hotelService from "./hotel.service.js";

export const createHotel = asyncHandler(async (req, res) => {
  const result = await hotelService.createHotel(req.user.id, req.body);
  return res.status(201).json(new ApiResponse(201, result.message, result.data));
});


export const getHotels = asyncHandler(async (req, res) => {
  const result = await hotelService.getHotels(req.query);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const getHotelById = asyncHandler(async (req, res) => {
  const hotelId = req.params.hotelId;
  const result = await hotelService.getHotelById(hotelId);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const getMyHotels = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const result = await hotelService.getMyHotels(ownerId, req.query);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const updateHotel = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const hotelId = req.params.hotelId;
  const updateData = req.body;
  const result = await hotelService.updateHotel(ownerId, hotelId, updateData);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const deleteHotel = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const hotelId = req.params.hotelId;
  const result = await hotelService.deleteHotel(ownerId, hotelId);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});