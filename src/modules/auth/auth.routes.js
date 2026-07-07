import { Router } from "express";

import validate from "../../middlewares/validate.middleware.js";

import { registerSchema, verifyOTPSchema, loginSchema, forgotPassswordSchema, resetPasswordSchema } from "./auth.validation.js";

import { register, verifyOTP, login, refreshAccessToken, logout, forgotPassword, resetPassword } from "./auth.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/verify-otp", validate(verifyOTPSchema), verifyOTP);

router.post("/login", validate(loginSchema), login);

router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.post("/forgot-password", validate(forgotPassswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true, data: {
      user: req.user
    }
  });
})

export default router;