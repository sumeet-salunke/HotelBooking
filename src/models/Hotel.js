import mongoose from "mongoose";

import { HOTEL_STATUS }
  from "../constants/hotelStatus.js";

const hotelSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      minlength: 3,
      maxlength: 120
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: 20,
      maxlength: 3000
    },

    address: {
      line1: {
        type: String,
        required: true,
        trim: true
      },

      line2: {
        type: String,
        default: null,
        trim: true
      },

      city: {
        type: String,
        required: true,
        trim: true,
        index: true
      },

      state: {
        type: String,
        required: true,
        trim: true
      },

      country: {
        type: String,
        required: true,
        trim: true
      },

      postalCode: {
        type: String,
        required: true,
        trim: true
      }
    },

    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     default: "Point"
    //   },

    //   coordinates: {
    //     type: [Number],
    //     default: undefined
    //   }
    // },

    amenities: {
      type: [String],
      default: []
    },

    images: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: Object.values(HOTEL_STATUS),
      default: HOTEL_STATUS.PENDING,
      index: true
    },

    rejectionReason: {
      type: String,
      default: null
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

hotelSchema.index({
  name: "text",
  description: "text",
  "address.city": "text"
});


// hotelSchema.index({
//   location: "2dsphere"
// });


hotelSchema.index({
  status: 1,
  isActive: 1,
  isDeleted: 1,
  "address.city": 1
});

const Hotel = mongoose.model(
  "Hotel",
  hotelSchema
);

export default Hotel;