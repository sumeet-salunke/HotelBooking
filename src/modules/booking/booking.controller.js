import asyncHandler
  from "../../utils/asyncHandler.js";

import ApiResponse
  from "../../utils/ApiResponse.js";

import bookingService
  from "./booking.service.js";


export const createBooking =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user.id;

      const result =
        await bookingService
          .createBooking(
            userId,
            req.body
          );

      return res.status(201).json(
        new ApiResponse(
          201,
          result.message,
          result.data
        )
      );
    }
  );


export const getMyBookings =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user.id;

      const result =
        await bookingService
          .getMyBookings(
            userId,
            req.query
          );

      return res.status(200).json(
        new ApiResponse(
          200,
          result.message,
          result.data
        )
      );
    }
  );


export const getMyBookingById =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user.id;

      const bookingId =
        req.params.bookingId;

      const result =
        await bookingService
          .getMyBookingById(
            userId,
            bookingId
          );

      return res.status(200).json(
        new ApiResponse(
          200,
          result.message,
          result.data
        )
      );
    }
  );


export const cancelMyBooking =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user.id;

      const bookingId =
        req.params.bookingId;

      const result =
        await bookingService
          .cancelMyBooking(
            userId,
            bookingId
          );

      return res.status(200).json(
        new ApiResponse(
          200,
          result.message,
          result.data
        )
      );
    }
  );