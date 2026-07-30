import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import compression from "compression";

import authRoutes from "./modules/auth/auth.routes.js";
import hotelRoutes from "./modules/hotel/hotel.routes.js";
import roomRoutes from "./modules/room/room.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";


import { swaggerUi, swaggerSpec } from "./config/swagger.js";

import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URI,
  credentials: true
}));
app.use(compression());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please try again later."
});
app.use(limiter);

app.use(morgan("dev"));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(mongoSanitize());
app.use(hpp());

//health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hotel Booking API is running"
  });
});


app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});
app.use(errorMiddleware);

export default app;
