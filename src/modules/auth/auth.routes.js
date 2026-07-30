import { Router } from "express";
import rateLimit from "express-rate-limit";

import validate from "../../middlewares/validate.middleware.js";

import { registerSchema, verifyOTPSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.validation.js";

import { register, verifyOTP, login, refreshAccessToken, logout, forgotPassword, resetPassword } from "./auth.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts. Please try again later."
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Login using email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: sumeet@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/register", sensitiveAuthLimiter, validate(registerSchema), register);

router.post("/verify-otp", sensitiveAuthLimiter, validate(verifyOTPSchema), verifyOTP);

router.post("/login", sensitiveAuthLimiter, validate(loginSchema), login);

router.post("/refresh-token", sensitiveAuthLimiter, refreshAccessToken);
router.post("/logout", logout);
router.post("/forgot-password", sensitiveAuthLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", sensitiveAuthLimiter, validate(resetPasswordSchema), resetPassword);

router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true, data: {
      user: req.user
    }
  });
})

export default router;
