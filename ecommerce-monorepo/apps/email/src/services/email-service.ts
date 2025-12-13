import nodemailer from "nodemailer";
import {
  OrderCancelledEvent,
  OrderPaidEvent,
  UserForgotPasswordEvent,
  UserRegisteredEvent,
  UserVerifiedEvent,
} from "@ecommerce/common";
import { env } from "../config/env";
import SMTPTransport from "nodemailer/lib/smtp-transport";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: env.SMTP_SECURE === "true",
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    } as SMTPTransport.Options);
  }

  async sendVerificationEmail(event: UserRegisteredEvent["data"]) {
    const { name, email, link: verificationLink } = event;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Hi ${name}!</h1>
          <h2>Please verify your email address</h2>
          <p>Thanks for signing up! Please click the button below to verify your email address and complete your registration.</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
            Verify Email Address
          </a>
          <p>If you cannot click the button, please copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verificationLink}</p>
          <p style="font-size: 0.9em; color: #777;">If you did not sign up for this account, you can safely ignore this email.</p>
        </div>
      `;
    await this.send(email, "Verify Your Email", html);
  }

  async sendPasswordResetEmail(event: UserForgotPasswordEvent["data"]) {
    const { name, email, link: resetLink } = event;
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h1>Hi ${name},</h1>
      <h2>Reset your password</h2>

      <p>You requested to reset your password. Click the button below to create a new one.</p>

      <a href="${resetLink}"
         style="display: inline-block; padding: 12px 24px; margin: 20px 0;
                font-size: 16px; color: #fff; background-color: #dc3545;
                text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>

      <p>If the button doesn’t work, paste this link into your browser:</p>
      <p style="word-break: break-all;">${resetLink}</p>

      <p style="font-size: 0.9em; color: #777;">
        If you did not request this reset, your account is still safe. You can ignore this email.
      </p>
    </div>
  `;

    await this.send(email, "Reset Your Password", html);
  }

  async sendWelcomeEmail(event: UserVerifiedEvent["data"]) {
    const { email, name } = event;
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h1>Welcome, ${name}!</h1>

      <p>Your account has been successfully verified. You're all set to get started.</p>

      <p style="font-size: 0.9em; color: #777;">
        If you didn’t create this account, contact support immediately.
      </p>
    </div>
  `;

    await this.send(email, "Welcome to Our Platform", html);
  }
  async sendOrderConfirmation(event: OrderPaidEvent["data"]) {
    const { userEmail, userName, orderId, totalAmount, items } = event;

    // 1. Build the Items List (HTML Table Rows)
    const itemsListHtml = items
      .map(
        (item) => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; color: #333;">${item.name} <span style="color: #888; font-size: 12px;">(x${item.quantity})</span></td>
            <td style="padding: 10px 0; text-align: right; color: #333;">$${item.price.toFixed(2)}</td>
          </tr>
        `
      )
      .join("");

    // 2. Build the Main Content
    const contentHtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4CAF50;">Payment Successful!</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Thank you for your purchase. We have received your payment and are getting your order ready.</p>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Order ID</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">#${orderId}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="text-align: left; padding-bottom: 10px; border-bottom: 2px solid #eee; color: #888;">Item</th>
                <th style="text-align: right; padding-bottom: 10px; border-bottom: 2px solid #eee; color: #888;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding-top: 15px; font-weight: bold; text-align: right;">Total Paid:</td>
                <td style="padding-top: 15px; font-weight: bold; text-align: right; font-size: 18px;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            You will receive another email once your items have shipped.
          </p>
        </div>
      `;

    const html = this.createEmailWrapper("Order Confirmed", contentHtml);
    await this.send(userEmail, `Order Confirmation #${orderId}`, html);
  }

  async sendOrderCancelled(event: OrderCancelledEvent["data"]) {
    const { userEmail, userName, orderId } = event;

    const contentHtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #E53935;">Order Cancelled</h2>
          <p>Hi <strong>${userName || "there"}</strong>,</p>

          <p>This email is to confirm that Order <strong>#${orderId}</strong> has been cancelled.</p>

          <div style="background-color: #fff3f3; border-left: 4px solid #E53935; padding: 15px; margin: 20px 0;">
            <strong>Refund Status:</strong><br/>
            If you have already been charged, a full refund has been initiated to your original payment method. Please allow 5-10 business days for it to appear on your statement.
          </div>

          <p>If you did not request this cancellation, please reply to this email immediately.</p>
        </div>
      `;

    const html = this.createEmailWrapper("Order Cancelled", contentHtml);
    await this.send(userEmail, `Order #${orderId} Cancelled`, html);
  }
  private async send(to: string, subject: string, html: string) {
    try {
      if (!to) {
        console.warn(
          `[Email Warning] ⚠️ Skipping email "${subject}": No recipient (to) defined.`
        );
        console.warn(
          `[Email Warning] This is likely an old event from before the fix.`
        );
        return;
      }

      const info = await this.transporter.sendMail({
        from: `"Ecommerce App" <${env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error(`[Email] Failed to send to ${to}`, error);
      throw error;
    }
  }

  private createEmailWrapper(_: string, content: string): string {
    return `<html>...${content}...</html>`;
  }
}

export default new EmailService();
