import mongoose from "mongoose";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
    index: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
    index: true,
  },
  checkIn: {
    type: Date,
    required: true,
    index: true,
  },
  checkOut: {
    type: Date,
    required: true,
    index: true,
    validate: {
      validator: function (value) {
        return (!this.checkIn || value > this.checkIn);
      }, message: "Check-out date must be after check-in date"
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be integer"
    }
  },
  guests: {
    type: Number,
    required: true,
    min: [1, "Guests must be at least 1"],
    validate: {
      validator: Number.isInteger,
      message: "Guests must be an integer"
    }
  },
  pricePerNightSnapshot: {
    type: Number,
    required: true,
    min: [0, "Price per night cannot be negative"]
  },
  totalNights: {
    type: Number,
    required: true,
    min: [1, "TotalNights must be at least 1"
    ],
    validate: {
      validator: Number.isInteger,
      message: "Total Nights must be integer"
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, "Total amount cannot be negative"],
  },
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING,
    index: true,
  },
  expiresAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

bookingSchema.index({
  roomId: 1,
  status: 1,
  checkIn: 1,
  checkOut: 1
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

/*
two booking overlap when
existingCheckIn < requestedCheckOut
AND
existingCheckOut > requestedCheckIn
--> in mongoDB
{
checkIn: {
$lt: requestedCheckOut
},
checkOut: {
$gt: requestedCheckIn}
}
*/