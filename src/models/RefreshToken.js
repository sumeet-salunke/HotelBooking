import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    token: {
      type: String,
      required: true
    },

    isRevoked: {
      type: Boolean,
      default: false
    },

    ipAddress: {
      type: String,
      default: null
    },

    deviceInfo: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

refreshTokenSchema.index({
  userId: 1,
  token: 1
});

const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);

export default RefreshToken;