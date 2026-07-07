import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    phone: {
      type: String,
      default: null
    },
    profileImage: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number, default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date, default: null,
    },
    isActive: {
      type: Boolean, default: true
    }, tokenVersion: {
      type: Number, default: 0
    }
  }, {
  timestamps: true,
}
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_SALT_ROUNDS));
  // next();
});

// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign({
//     userId: this._id,
//     role: this.role,
//   }, process.env.JWT_ACCESS_SECRET, {
//     expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//   })
// };

// userSchema.methods.generateRefreshToken = function () {

//   return jwt.sign(
//     {
//       userId: this._id
//     },
//     process.env.JWT_REFRESH_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//     }
//   );

// };

const User = mongoose.model("user", userSchema);
export default User;