import transporter from "../config/mail";
import otpTemplate from "../templates/otp.template";
const sendOTP = async ({ name, email, otp }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Account",
    html: otpTemplate(name, otp)
  });
};
export default sendOTP;