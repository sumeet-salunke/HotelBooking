import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import authService from "./auth.service.js";
import cookieOptions from "../../helpers/cookieOptions.js"
import clearCookieOptions from "../../helpers/clearCookieOptions.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return res.status(201).json(new ApiResponse(201, result.message, result.data));
});



export const verifyOTP = asyncHandler(async (req, res) => {
  const result = await authService.verifyOTP(req.body);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie("refreshToken", result.data.refreshToken, cookieOptions);
  delete result.data.refreshToken;
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const result = await authService.refreshAccessToken(refreshToken);
  return res.status(200).json(
    new ApiResponse(200, result.message, result.data)
  );
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const result = await authService.logout(refreshToken);
  res.clearCookie("refreshToken", clearCookieOptions);
  return res.status(200).json(new ApiResponse(200, result.messsage, result.data));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPasssword(req.body);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  //clear current browser refresh cookie too
  res.clearCookie("refreshToken", clearCookieOptions);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});