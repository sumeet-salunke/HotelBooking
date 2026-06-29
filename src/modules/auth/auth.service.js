import bcrypt from "bcrypt";

import ApiError from "../../utils/ApiError.js";
import generateOTP from "../../utils/generateOTP.js";
import calculateOTPExpiry from "../../utils/calculateOTPExpiry.js";
import sendMail from "../../config/mail.js";
import otpTemplate from "../../templates/otp.template.js";
import logger from "../../config/logger.js";

import userRepository from "../../repositories/user.repository.js";
import otpRepository from "../../repositories/otp.repository.js";

import { OTP_PURPOSE } from "../../constants/otpPurpose.js";
import { AUTH_MESSAGES } from "../../constants/messages.js";

class AuthService {

  async register(userData) {

    const { name, email, password } = userData;

    const existingUser = await userRepository.findByEmail(email);

    /*
    ----------------------------------------------------------
    Existing & Verified User
    ----------------------------------------------------------
    */

    if (existingUser && existingUser.isVerified) {

      throw new ApiError(
        409,
        AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED
      );

    }

    /*
    ----------------------------------------------------------
    Existing but NOT Verified
    ----------------------------------------------------------
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
    ----------------------------------------------------------
    New User
    ----------------------------------------------------------
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

}

export default new AuthService();