import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import ApiError from "../../utils/ApiError.js";
import generateOTP from "../../utils/generateOTP.js";
import calculateOTPExpiry from "../../utils/calculateOTPExpiry.js";
import sendMail from "../../config/mail.js";
import otpTemplate from "../../templates/otp.template.js";
import logger from "../../config/logger.js";

import userRepository from "../../repositories/user.repository.js";
import otpRepository from "../../repositories/otp.repository.js";
import refreshTokenRepository from "../../repositories/refreshToken.repository.js";

import { OTP_PURPOSE } from "../../constants/otpPurpose.js";
import { AUTH_MESSAGES } from "../../constants/messages.js";
import { generateAccessToken, generateTokens } from "../../utils/generateTokens.js";


class AuthService {

  async register(userData) {

    const { name, email, password } = userData;

    const existingUser = await userRepository.findByEmail(email);

    /*
  
    Existing & Verified User
  
    */

    if (existingUser && existingUser.isVerified) {

      throw new ApiError(
        409,
        AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED
      );

    }

    /*
    Existing but NOT Verified
    */

    if (existingUser && !existingUser.isVerified) {

      const otp = generateOTP();

      const otpHash = await bcrypt.hash(
        otp,
        Number(process.env.BCRYPT_SALT_ROUNDS)
      );

      await otpRepository.deleteActiveOTP(
        existingUser._id,
        OTP_PURPOSE.VERIFY_ACCOUNT
      );

      await otpRepository.create({

        userId: existingUser._id,

        email,

        otpHash,

        purpose: OTP_PURPOSE.VERIFY_ACCOUNT,

        expiresAt: calculateOTPExpiry()

      });

      await sendMail({

        to: email,

        subject: "Verify Your Account",

        html: otpTemplate(name, otp)

      });

      logger.info(
        `OTP resent to ${email}`
      );

      return {

        message: AUTH_MESSAGES.OTP_RESENT,

        data: null

      };

    }

    /*
    New User
  
    */

    let createdUser;

    try {

      createdUser = await userRepository.create({

        name,

        email,

        password

      });

      const otp = generateOTP();

      const otpHash = await bcrypt.hash(

        otp,

        Number(process.env.BCRYPT_SALT_ROUNDS)

      );

      await otpRepository.create({

        userId: createdUser._id,

        email,

        otpHash,

        purpose: OTP_PURPOSE.VERIFY_ACCOUNT,

        expiresAt: calculateOTPExpiry()

      });

      await sendMail({

        to: email,

        subject: "Verify Your Account",

        html: otpTemplate(name, otp)

      });

      logger.info(
        `User Registered : ${email}`
      );

      return {

        message: AUTH_MESSAGES.REGISTER_SUCCESS,

        data: {

          id: createdUser._id,

          email: createdUser.email

        }

      };

    }
    catch (error) {

      if (createdUser) {

        await userRepository.deleteById(createdUser._id);

      }

      logger.error(error.message);

      throw error;

    }

  }

  async verifyOTP(data) {
    const { email, otp } = data;
    //find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, AUTH_MESSAGES.USER_NOT_FOUND);
    }
    //already verified
    if (user.isVerified) {
      throw new ApiError(409, AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED);
    }
    //find active OTP
    const otpRecord = await otpRepository.findActiveOTP(user._id, OTP_PURPOSE.VERIFY_ACCOUNT);
    if (!otpRecord) {
      throw new ApiError(400, AUTH_MESSAGES.INVALID_OTP);
    }
    //otp expired
    if (otpRecord.expiresAt < new Date()) {
      throw new ApiError(404, AUTH_MESSAGES.OTP_EXPIRED);
    }
    //compare otp
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      await otpRepository.updateById(otpRecord._id, {
        attempts: otpRecord.attempts + 1
      });
      throw new ApiError(400, AUTH_MESSAGES.INVALID_OTP);
    }
    //mark otp used
    await otpRepository.updateById(otpRecord._id, { isUsed: true });

    //verify user
    await userRepository.updateById(user._id, { isVerified: true });

    logger.info(`Email verified: ${email}`);
    return {
      message: AUTH_MESSAGES.OTP_VERIFIED,
      data: null,
    };
  }

  async login(data) {
    const { email, password } = data;
    //find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(400, AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    //verified?
    if (!user.isVerified) {
      throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_NOT_VERIFIED);
    }
    //active?
    if (!user.isActive) {
      throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_DISABLED);
    }
    //account locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_LOCKED);
    }
    //compare password
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      const attempts = user.loginAttempts + 1;
      const updateData = {
        loginAttempts: attempts
      };
      if (attempts >= 5) {
        updateData.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await userRepository.updateById(user._id,
        updateData);
      if (attempts >= 5) {
        throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_LOCKED);
      }
      throw new ApiError(400, AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    //reset login attempts
    await userRepository.updateById(user._id, {
      loginAttempts: 0, lockUntil: null
    })
    //generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    //store refresh token
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    await refreshTokenRepository.create({ userId: user._id, token: refreshToken, expiresAt: expiry });
    //return data
    return {
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    };

  }

  async refreshAccessToken(refreshToken) {
    //1. check if refresh token exists
    if (!refreshToken) {
      throw new ApiError(401, AUTH_MESSAGES.REFRESH_TOKEN_REQUIRED);
    }
    //2 verify jwt
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      console.log("decoded", decoded);
    } catch (error) {
      throw new ApiError(401, AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    //find stored session
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (!storedToken) {
      throw new ApiError(401, AUTH_MESSAGES.SESSION_EXPIRED);
    }
    //check database expiry
    if (storedToken.expiresAt && storedToken.expiresAt <= new Date()) {
      await refreshTokenRepository.revoke(refreshToken);
      throw new ApiError(401, AUTH_MESSAGES.SESSION_EXPIRED);
    }
    //find user
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      await refreshTokenRepository.revoke(refreshToken);
      throw new ApiError(401, AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
    //user active?
    if (!user.isActive) {
      await refreshTokenRepository.revoke(refreshToken);
      throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_DISABLED);
    }
    //token version check
    if (decoded.tokenVersion !== (user.tokenVersion ?? 0)) {
      await refreshTokenRepository.revoke(refreshToken);
      throw new ApiError(401, AUTH_MESSAGES.SESSION_EXPIRED);
    }
    //generate new access token only
    const accessToken = generateAccessToken(user);
    //return
    return {
      messsage: AUTH_MESSAGES.TOKEN_REFRESH_SUCCESS,
      data: {
        accessToken
      }
    };

  }

  async logout(refreshToken) {
    if (!refreshToken) {
      return {
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
        data: null
      }
    }
    await refreshTokenRepository.revoke(refreshToken);
    return {
      message: AUTH_MESSAGES.LOGOUT_SUCCESS,
      data: null,
    }
  }

  async forgotPasssword(data) {
    const { email } = data;
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return {
        message: AUTH_MESSAGES.PASSWORD_RESET_OTP_SENT,
        data: null,
      }
    }
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, Number(process.env.BCRYPT_SALT_ROUNDS));
    //remove previous active otp
    await otpRepository.deleteActiveOTP(user._id, OTP_PURPOSE.RESET_PASSWORD);
    //store new reset OTp
    await otpRepository.create({
      userId: user._id,
      email: user.email,
      otpHash,
      purpose: OTP_PURPOSE.RESET_PASSWORD,
      expiresAt: calculateOTPExpiry()
    });
    //send email
    await sendMail({
      to: user.email,
      subject: "Reset your password",
      html: otpTemplate(user.name, otp)
    });
    logger.info(`password reset OTP requested for userId: ${user._id}`);
    return {
      message: AUTH_MESSAGES.PASSWORD_RESET_OTP_SENT,
      data: null,
    }
  }

  async resetPassword(data) {
    const { email, otp, newPassword } = data;
    //find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(400, AUTH_MESSAGES.INVALID_OR_EXPIRED_OTP);
    }
    //find active reset otp
    const otpRecord = await otpRepository.findActiveOTP(user._id, OTP_PURPOSE.RESET_PASSWORD);
    if (!otpRecord) {
      throw new ApiError(400, AUTH_MESSAGES.INVALID_OR_EXPIRED_OTP);
    }
    //check expiry
    if (otpRecord.expiresAt <= new Date()) {
      await otpRepository.markAsUsed(otpRecord._id);
      throw new ApiError(400, AUTH_MESSAGES.INVALID_OR_EXPIRED_OTP);
    }
    //compare otp
    const isOTPValid = await bcrypt.compare(String(otp), otpRecord.otpHash);
    if (!isOTPValid) {
      throw new ApiError(400, AUTH_MESSAGES.INVALID_OR_EXPIRED_OTP);
    }
    //update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await userRepository.save(user);
    //mark otp as used
    await otpRepository.markAsUsed(otpRecord._id);
    //revoke existing sessions
    await refreshTokenRepository.revokeAllByUserId(user._id);
    logger.info(`Password reset completed for userId: ${user._id}`);

    return {
      message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
      data: null,
    }

  }
}
export default new AuthService();