import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import { BOOKING_STATUS } from "../../constants/bookingStatus.js";
class BookingRepository {
  /*
calculate consumed inventory
counts:
1. CONFIRMED BOOKING
2. PENDING booking whose hold has not expired
Does NOT count:
-cancelled
-expired pending
  */
  async calculateBookedQuantity(roomId, checkIn, checkOut) {
    const now = new Date();

    const result = await Booking.aggregate([
      {
        $match: {
          roomId: new mongoose.Types.ObjectId(roomId),
          checkIn: {
            $lt: checkOut
          },
          checkOut: {
            $gt: checkIn
          },
          $or: [
            {
              status: BOOKING_STATUS.CONFIRMED
            },
            {
              status: BOOKING_STATUS.PENDING,
              expiresAt: {
                $gt: now
              }
            }
          ]
        }
      }, {
        $group: {
          _id: null,
          bookedQuantity: {
            $sum: "$quantity"
          }
        }
      }
    ]);
    return result.length > 0 ? result[0].bookedQuantity : 0;
  }
  //create booking
  async create(data) {
    return await Booking.create(data);

  }
  //find customer-owned booking
  async findOwnedBookingById(bookingId, userId) {
    return await Booking.findOne({
      _id: bookingId,
      userId
    }).lean();
  }
  //customer booking history
  async findUserBookings({ filter, skip, limit }) {
    const [bookings, totalBookings] = await Promise.all([(await Booking.find(filter)).toSorted({
      createdAt: -1, _id: 1
    }).skip(skip).limit(limit).lean(), Booking.countDocuments(filter)]);
    return {
      bookings, totalBookings
    };
  }
  //cancel customer booking
  async cancelOwnedBooking(bookingId, userId) {
    return await Booking.findOneAndUpdate({
      _id: bookingId, userId,
      status: {
        $in: [
          BOOKING_STATUS.PENDING,
          BOOKING_STATUS.CONFIRMED
        ]
      }
    }, {
      $set: {
        status: BOOKING_STATUS.CANCELLED,
        cancelledAt: new Date(),
        expiresAt: null
      }
    }, {
      new: true,
      runValidators: true
    }).lean();
  }
}

export default new BookingRepository();