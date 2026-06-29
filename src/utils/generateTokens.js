import jwt from "jsonwebtoken";
const generateTokens = (user) => {
  const accessToken = jwt.sign({
    userId: user._id, role: user.role,
  }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });

  const refreshToken = jwt.sign({
    userId: user._id,
  }, process.env.JWT_REFRESH_TOKEN, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
};
export default generateTokens;