import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import ApiError from "../utils/ApiError.js";
import userRepository from "../repositories/user.repository.js";
import { AUTH_MESSAGES } from "../constants/messages.js";

export const authenticate = async (req, res, next) => {
  try {
    //read authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, AUTH_MESSAGES.UNAUTHORIZED);
    }
    //extarct access token
    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      throw new ApiError(401, AUTH_MESSAGES.UNAUTHORIZED);
    }
    //verify access token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new ApiError(401, AUTH_MESSAGES.INVALID_ACCCESS_TOKEN);
    }
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      throw new ApiError(401, AUTH_MESSAGES.INVALID_ACCCESS_TOKEN);
    }
    //find current user 
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, AUTH_MESSAGES.USER_NOT_FOUND);
    }
    if (!user.isActive) {
      throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_DISABLED);
    }
    const decodedTokenVersion = decoded.tokenVersion ?? 0;
    if (decodedTokenVersion !== (user.tokenVersion ?? 0)) {
      throw new ApiError(401, AUTH_MESSAGES.INVALID_ACCCESS_TOKEN);
    }
    //attach safe user context
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      isVerified: user.isVerified
    };
    next();
  } catch (error) {
    next(error);
  }
};
