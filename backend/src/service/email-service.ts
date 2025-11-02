import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail({
  user,
  url,
}: {
  user: { email: string; name: string };
  url: string;
}) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "Verify your email",
      html: `
        <h1>Welcome ${user.name}!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${url}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
    logger.info(`Verification email sent to ${user.email}`);
  } catch (error) {
    logger.error("Failed to send verification email:", error);
    throw error;
  }
}
