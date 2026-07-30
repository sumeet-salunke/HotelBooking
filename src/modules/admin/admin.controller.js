import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import adminService from "./admin.service.js";
export const getPendingHotels = asyncHandler(async (req, res) => {
  const result = await adminService.getPendingHotels(req.query);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const approveHotel = asyncHandler(async (req, res) => {

  const hotelId = req.params.hotelId;

  const result = await adminService.approveHotel(hotelId);

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      result.data
    )
  );

});

export const rejectHotel = asyncHandler(async (req, res) => {

  const hotelId = req.params.hotelId;
  const { reason } = req.body;

  const result = await adminService.rejectHotel(
    hotelId,
    reason
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      result.data
    )
  );

});
export const getUsers = asyncHandler(async (req, res) => {

  const result =
    await adminService.getUsers(req.query);

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      result.data
    )
  );

});

export const updateUserStatus =
  asyncHandler(async (req, res) => {

    const adminId = req.user.id;

    const userId = req.params.userId;

    const { isActive } = req.body;

    const result =
      await adminService.updateUserStatus(

        adminId,

        userId,

        isActive

      );

    return res.status(200).json(

      new ApiResponse(

        200,

        result.message,

        result.data

      )

    );

  });