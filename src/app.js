import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URI,
  credentials: true
}));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later."
});
app.use(limiter);

//logging
app.use(morgan("dev"));

//body parsers
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hotel Booking API is running"
  });
});

app.use("/api/auth", authRoutes);





app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});
//global error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error"
  });
});
app.use(errorMiddleware);

export default app;
