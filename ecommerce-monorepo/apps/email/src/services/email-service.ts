import nodemailer from "nodemailer";
import {
  LoggerFactory,
  OrderCancelledEvent,
  OrderCreatedEvent,
  UserForgotPasswordEvent,
  UserRegisteredEvent,
  UserVerifiedEvent,
} from "@ecommerce/common";
import { env } from "../config/env";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const logger = LoggerFactory.create("EmailService");

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

  async sendOrderConfirmation(event: OrderCreatedEvent["data"]) {
    const { userEmail, orderId, totalAmount, items } = event;
    const html = this.createEmailWrapper(
      "Order Confirmed",
      `<p>Order #${orderId} received.</p>`,
    );
    await this.send(userEmail, `Order #${orderId} Confirmed`, html);
  }

  async sendOrderCancelled(event: OrderCancelledEvent["data"]) {
    const { userEmail, orderId } = event;
    const html = this.createEmailWrapper(
      "Order Cancelled",
      `<p>Order #${orderId} was cancelled.</p>`,
    );
    await this.send(userEmail, `Order #${orderId} Cancelled`, html);
  }

  private async send(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      console.log(`[Email] Sent to ${to} (ID: ${info.messageId})`);
    } catch (error) {
      logger.error(`[Email] Failed to send to ${to}`, error);
      throw error;
    }
  }

  private createEmailWrapper(title: string, content: string): string {
    return `<html>...${content}...</html>`;
  }
}

export default new EmailService();
