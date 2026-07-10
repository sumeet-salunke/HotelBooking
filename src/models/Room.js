import mongoose from "mongoose";
import { ROOM_TYPE } from "../constants/roomType.js";
import { BED_TYPE } from "../constants/bedType.js";

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
    index: true,
  },
  name: {
    type: String,
    trim: true,
    required: [true, "Room name is required"],
    minLength: [3, "Room name must be at least 3 characters long"],
    maxLength: [120, "Room name is too long."]
  },
  description: {
    type: String,
    required: [true, "Room description is required"],
    trim: true,
    minLength: [20, "Room description must be at least 20 characters long"],
    maxLength: [2000, "Room description is too long."],
  },
  roomType: {
    type: String,
    enum: Object.values(ROOM_TYPE),
    required: true,
    index: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: [1, "Price per night must be greater than 0"]
  },
  maxGuests: {
    type: Number,
    required: true,
    min: [1, "Maximun guests must be atleast 1"],
    max: [20, "Maximum guests cannot exceed 20"],
    //integer validation
    vaildate: {
      validator: Number.isInteger,
      message: "Maximum guests must be an integer"
    }
  },
  totalRooms: {
    type: Number,
    required: true,
    min: [1, "Total rooms must be atleast 1"],
    //integer validation
    validate: {
      validator: Number.isInteger,
      message: "Total rooms must be integer"
    }
  },
  bedType: {
    type: String,
    enum: Object.values(BED_TYPE),
    required: true,
  },
  amenities: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);
export default Room;