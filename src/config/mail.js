import env from "./env.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT),
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

export const sendMail = async ({ to, subject, html }) => {
  console.log("Sending email to:", to);

  const info = await transporter.sendMail({
    from: env.EMAIL_USER,
    to,
    subject,
    html
  });
  console.log(info);
  return info;
};

export default sendMail;