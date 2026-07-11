import mongoose from "mongoose";

import ApiError
  from "../../utils/ApiError.js";

import bookingRepository
  from "./booking.repository.js";

import roomRepository
  from "../room/room.repository.js";

import hotelRepository
  from "../hotel/hotel.repository.js";

import {
  BOOKING_MESSAGES
} from "../../constants/messages.js";

import {
  BOOKING_STATUS
} from "../../constants/bookingStatus.js";

class BookingService {
  //CREATE BOOKING

  async createBooking(userId, bookingData) {
    const {
      roomId,
      checkIn,
      checkOut,
      quantity,
      guests
    } = bookingData;
    //1. Validate Room ID
    if (
      !mongoose.Types.ObjectId.isValid(roomId)
    ) {
      throw new ApiError(
        400,
        BOOKING_MESSAGES.INVALID_ROOM_ID
      );
    }

    /*
    ----------------------------------------
    2. Parse Dates
    ----------------------------------------
    */

    const parsedCheckIn =
      this.parseDateOnly(checkIn);

    const parsedCheckOut =
      this.parseDateOnly(checkOut);

    if (
      !parsedCheckIn ||
      !parsedCheckOut
    ) {
      throw new ApiError(
        400,
        BOOKING_MESSAGES.INVALID_DATES
      );
    }

    /*
    ----------------------------------------
    3. Validate Date Order
    ----------------------------------------
    */

    if (
      parsedCheckOut <= parsedCheckIn
    ) {
      throw new ApiError(
        400,
        BOOKING_MESSAGES.INVALID_DATES
      );
    }

    /*
    ----------------------------------------
    4. Reject Past Check-In
    ----------------------------------------

    Compare normalized UTC dates.
    */

    const today = this.getTodayUTC();

    if (parsedCheckIn < today) {
      throw new ApiError(
        400,
        BOOKING_MESSAGES.PAST_CHECK_IN
      );
    }

    /*
    ----------------------------------------
    5. Find Publicly Bookable Room
    ----------------------------------------
    */

    const room =
      await roomRepository.findById(roomId);

    if (
      !room ||
      !room.isActive ||
      room.isDeleted
    ) {
      throw new ApiError(
        404,
        BOOKING_MESSAGES.ROOM_NOT_FOUND
      );
    }

    /*
    ----------------------------------------
    6. Verify Parent Hotel Is Public
    ----------------------------------------
    */

    const hotel =
      await hotelRepository.findPublicById(
        room.hotelId
      );

    if (!hotel) {
      throw new ApiError(
        404,
        BOOKING_MESSAGES.ROOM_NOT_FOUND
      );
    }

    /*
    ----------------------------------------
    7. Validate Quantity
    ----------------------------------------
    */

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > room.totalRooms
    ) {
      throw new ApiError(
        400,
        BOOKING_MESSAGES.INVALID_QUANTITY
      );
    }

    /*
    ----------------------------------------
    8. Validate Guest Capacity
    ----------------------------------------

    Example:

    maxGuests = 2 per room
    quantity = 3 rooms

    total capacity = 6
    */

    const totalGuestCapacity =
      room.maxGuests * quantity;

    if (
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > totalGuestCapacity
    ) {
      throw new ApiError(
        400,
        BOOKING_MESSAGES.INVALID_GUESTS
      );
    }

    /*
    ----------------------------------------
    9. Calculate Already Consumed Inventory
    ----------------------------------------
    */

    const bookedQuantity =
      await bookingRepository
        .calculateBookedQuantity(
          roomId,
          parsedCheckIn,
          parsedCheckOut
        );

    /*
    ----------------------------------------
    10. Calculate Availability
    ----------------------------------------
    */

    const availableRooms =
      room.totalRooms - bookedQuantity;

    if (quantity > availableRooms) {
      throw new ApiError(
        409,
        BOOKING_MESSAGES
          .INSUFFICIENT_AVAILABILITY
      );
    }

    /*
    ----------------------------------------
    11. Calculate Total Nights
    ----------------------------------------
    */

    const totalNights =
      this.calculateTotalNights(
        parsedCheckIn,
        parsedCheckOut
      );

    /*
    ----------------------------------------
    12. Snapshot Price
    ----------------------------------------
    */

    const pricePerNightSnapshot =
      room.pricePerNight;

    /*
    ----------------------------------------
    13. Calculate Trusted Total
    ----------------------------------------

    Client never sends totalAmount.
    */

    const totalAmount =
      pricePerNightSnapshot *
      quantity *
      totalNights;

    /*
    ----------------------------------------
    14. Create Temporary Pending Hold
    ----------------------------------------

    Hold inventory for 15 minutes.
    */

    const expiresAt =
      new Date(
        Date.now() +
        15 * 60 * 1000
      );

    /*
    ----------------------------------------
    15. Construct Trusted Payload
    ----------------------------------------
    */

    const bookingPayload = {
      userId,

      hotelId:
        room.hotelId,

      roomId:
        room._id,

      checkIn:
        parsedCheckIn,

      checkOut:
        parsedCheckOut,

      quantity,

      guests,

      pricePerNightSnapshot,

      totalNights,

      totalAmount,

      status:
        BOOKING_STATUS.PENDING,

      expiresAt
    };

    /*
    ----------------------------------------
    16. Create Booking
    ----------------------------------------
    */

    const booking =
      await bookingRepository.create(
        bookingPayload
      );

    return {
      message:
        BOOKING_MESSAGES.CREATED,

      data: {
        booking
      }
    };
  }

  /*
  ========================================
  GET MY BOOKINGS
  ========================================
  */

  async getMyBookings(
    userId,
    query
  ) {
    let {
      page,
      limit,
      status
    } = query;

    /*
    ----------------------------------------
    Normalize Pagination
    ----------------------------------------
    */

    page = Number(page);
    limit = Number(limit);

    page =
      Number.isFinite(page) &&
        page >= 1
        ? Math.floor(page)
        : 1;

    limit =
      Number.isFinite(limit) &&
        limit >= 1
        ? Math.min(
          Math.floor(limit),
          50
        )
        : 10;

    /*
    ----------------------------------------
    Base Filter
    ----------------------------------------
    */

    const filter = {
      userId
    };

    /*
    ----------------------------------------
    Optional Status Filter
    ----------------------------------------
    */

    if (status) {
      if (
        !Object.values(
          BOOKING_STATUS
        ).includes(status)
      ) {
        throw new ApiError(
          400,
          "Invalid booking status."
        );
      }

      filter.status = status;
    }

    const skip =
      (page - 1) * limit;

    const {
      bookings,
      totalBookings
    } =
      await bookingRepository
        .findUserBookings({
          filter,
          skip,
          limit
        });

    const totalPages =
      Math.ceil(
        totalBookings / limit
      );

    return {
      message:
        BOOKING_MESSAGES.FETCHED_ALL,

      data: {
        bookings,

        pagination: {
          page,
          limit,
          totalBookings,
          totalPages
        }
      }
    };
  }

  /*
  ========================================
  GET MY BOOKING BY ID
  ========================================
  */

  async getMyBookingById(
    userId,
    bookingId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        bookingId
      )
    ) {
      throw new ApiError(
        400,
        BOOKING_MESSAGES
          .INVALID_BOOKING_ID
      );
    }

    const booking =
      await bookingRepository
        .findOwnedBookingById(
          bookingId,
          userId
        );

    if (!booking) {
      throw new ApiError(
        404,
        BOOKING_MESSAGES
          .BOOKING_NOT_FOUND
      );
    }

    return {
      message:
        BOOKING_MESSAGES.FETCHED,

      data: {
        booking
      }
    };
  }

  /*
  ========================================
  CANCEL MY BOOKING
  ========================================
  */

  async cancelMyBooking(
    userId,
    bookingId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        bookingId
      )
    ) {
      throw new ApiError(
        400,
        BOOKING_MESSAGES
          .INVALID_BOOKING_ID
      );
    }

    /*
    First fetch with ownership boundary.
    */

    const booking =
      await bookingRepository
        .findOwnedBookingById(
          bookingId,
          userId
        );

    if (!booking) {
      throw new ApiError(
        404,
        BOOKING_MESSAGES
          .BOOKING_NOT_FOUND
      );
    }

    /*
    Already cancelled
    */

    if (
      booking.status ===
      BOOKING_STATUS.CANCELLED
    ) {
      throw new ApiError(
        409,
        BOOKING_MESSAGES
          .ALREADY_CANCELLED
      );
    }

    /*
    Completed bookings cannot
    be cancelled.
    */

    if (
      booking.status ===
      BOOKING_STATUS.COMPLETED
    ) {
      throw new ApiError(
        409,
        BOOKING_MESSAGES
          .CANNOT_CANCEL
      );
    }

    /*
    Optional business rule:
    do not cancel after stay starts.
    */

    const now = new Date();

    if (
      new Date(booking.checkIn) <= now
    ) {
      throw new ApiError(
        409,
        BOOKING_MESSAGES
          .CANNOT_CANCEL
      );
    }

    /*
    Atomic status-limited update.
    */

    const cancelledBooking =
      await bookingRepository
        .cancelOwnedBooking(
          bookingId,
          userId
        );

    if (!cancelledBooking) {
      throw new ApiError(
        409,
        BOOKING_MESSAGES
          .CANNOT_CANCEL
      );
    }

    return {
      message:
        BOOKING_MESSAGES.CANCELLED,

      data: {
        booking:
          cancelledBooking
      }
    };
  }

  /*
  ========================================
  DATE HELPERS
  ========================================
  */

  parseDateOnly(value) {
    /*
    Require exact YYYY-MM-DD.

    This avoids silently accepting:
    "hello"
    "07/20/2026"
    malformed dates
    */

    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return null;
    }

    const [
      year,
      month,
      day
    ] = value
      .split("-")
      .map(Number);

    const date = new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

    /*
    Important:
    Date.UTC normalizes invalid dates.

    Example:
    2026-02-31 could roll into March.

    So verify components again.
    */

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return date;
  }

  getTodayUTC() {
    const now = new Date();

    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );
  }

  calculateTotalNights(
    checkIn,
    checkOut
  ) {
    const MS_PER_DAY =
      24 * 60 * 60 * 1000;

    return Math.round(
      (
        checkOut.getTime() -
        checkIn.getTime()
      ) / MS_PER_DAY
    );
  }
}

export default new BookingService();