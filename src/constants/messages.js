export const AUTH_MESSAGES = Object.freeze({

  REGISTER_SUCCESS:
    "Registration successful. Please verify your email.",

  EMAIL_ALREADY_VERIFIED:
    "Email is already registered and verified.",

  OTP_SENT:
    "OTP sent successfully.",

  OTP_RESENT:
    "OTP resent successfully.",

  INVALID_OTP:
    "Invalid OTP.",

  OTP_EXPIRED:
    "OTP has expired.",

  OTP_VERIFIED:
    "OTP verified successfully.",

  LOGIN_SUCCESS:
    "Login successful.",

  LOGOUT_SUCCESS:
    "Logged out successfully.",

  INVALID_CREDENTIALS:
    "Invalid email or password.",

  ACCOUNT_NOT_VERIFIED:
    "Please verify your account first.",

  ACCOUNT_LOCKED:
    "Your account has been temporarily locked.",

  USER_NOT_FOUND:
    "User not found.",

  ACCOUNT_DISABLED: "Your account has been disabled.",

  REFRESH_TOKEN_REQUIRED: "Refresh token is required.",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token.",
  SESSION_EXPIRED: "Session expired. Please login again.",
  TOKEN_REFRESH_SUCCESS: "Access token refreshed successfully",
  LOGOUT_SUCCESS: "Logged out successfully",
  PASSWORD_RESET_OTP_SENT: "If an account exists with this email, a password reset OTP has been sent.",

  PASSWORD_RESET_SUCCESS: "Password reset successfully",

  INVALID_OR_EXPIRED_OTP: "Invalid or expired OTP.",
  UNAUTHORIZED: "Authentication required.",
  INVALID_ACCCESS_TOKEN: "Invalid or expired access token.",

});

export const HOTEL_MESSAGES = Object.freeze({
  CREATED:
    "Hotel created successfully.",

  DUPLICATE:
    "A hotel with this name already exists in this city.",

  NOT_FOUND:
    "Hotel not found.",

  FORBIDDEN:
    "You do not have permission to manage this hotel.",

  FETCHED: "Hotels fetched successfully.",

  INVALID_ID: "Invalid hotel ID.",

  FETCHED_ONE: "Hotel fetched successfully",

  OWNER_HOTELS_FETCHED: "Your hotels fetched successfully.",

  INVALID_STATUS: "Invalid hotel status.",

  EMPTY: "At least one field is required for update.",

  UPDATED: "Hotel updated successfully.",

  DELETED: "Hotel Deleted successfully."
});

export const ROOM_MESSAGES = Object.freeze({
  INVALID_HOTEL_ID: "Invalid hotel ID.",

  HOTEL_NOT_FOUND: "Hotel not found.",

  DUPLICATE: "A room with this name already exists in this hotel.",

  CREATED: "Room created successfully.",

  HOTEL_INACTIVE: "Cannot add rooms to an inactive hotel",

  INVALID_ROOM_TYPE: "Invalid room type.",

  INVALID_PRICE: "Price must be a valid non-negative number.",

  INVALID_PRICE_RANGE: "Price range cannot exceed maximum price.",

  INVALID_GUESTS: "Guests must be a positive integer.",

  FETCHED: "Rooms fetched successfully.",

  INVALID_ACTIVE_STATUS: "isActive must be either true or false.",

  INVALID_ROOM_ID: "Invalid romm ID.",

  EMPTY_OBJECT_DATA: "Empty object data.",

  ROOM_NOT_FOUND: "Room not found.",

  UPDATED: "Room updated successfully.",

  DELETED: "Room deleted successfully."


})

export const BOOKING_MESSAGES = Object.freeze({
  CREATED:
    "Booking created successfully.",

  FETCHED:
    "Booking fetched successfully.",

  FETCHED_ALL:
    "Bookings fetched successfully.",

  CANCELLED:
    "Booking cancelled successfully.",

  INVALID_BOOKING_ID:
    "Invalid booking ID.",

  INVALID_ROOM_ID:
    "Invalid room ID.",

  ROOM_NOT_FOUND:
    "Room not found.",

  HOTEL_NOT_FOUND:
    "Hotel not found.",

  BOOKING_NOT_FOUND:
    "Booking not found.",

  INVALID_DATES:
    "Check-out date must be after check-in date.",

  PAST_CHECK_IN:
    "Check-in date cannot be in the past.",

  INVALID_QUANTITY:
    "Requested room quantity is invalid.",

  INVALID_GUESTS:
    "Guest count is invalid for the selected rooms.",

  INSUFFICIENT_AVAILABILITY:
    "Requested number of rooms is not available for the selected dates.",

  ALREADY_CANCELLED:
    "Booking is already cancelled.",

  CANNOT_CANCEL:
    "This booking cannot be cancelled."
});