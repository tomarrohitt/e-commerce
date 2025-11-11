// service/email-service.ts
import nodemailer from "nodemailer";
import { logger } from "../utils/logger";
import { config } from "../config";
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  UserRegisteredEvent,
} from "../events/publisher";
import orderRepository from "../repository/order-repository";
import { prisma } from "../config/prisma";

export interface OrderDetails {
  id: string;
  totalAmount: number;
  status: string;
  items: {
    product: {
      name: string;
    };
    quantity: number;
    priceAtPurchase: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

class EmailService {
  private transporter;

  constructor() {
    this.transporter = config.emailProvider;
  }

  async sendVerificationEmail(event: UserRegisteredEvent) {
    const { name, email, verificationLink } = event.data;
    try {
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

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM!,
        to: email,
        subject: "Verify Your Email Address",
        html,
      });

      logger.info(`Verification email sent to ${email}`, { email });
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}`, {
        error,
        email,
      });
    }
  }

  async sendOrderConfirmation(event: OrderCreatedEvent) {
    const {
      orderId,
      userName,
      userEmail,
      totalAmount,
      items,
      shippingAddress,
    } = event.data;

    try {
      const itemsTableRows = items
        .map(
          (item) => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0;">${item.name} (x${item.quantity})</td>
            <td style="padding: 8px 0; text-align: right;">$${item.priceAtPurchase.toFixed(
              2
            )}</td>
          </tr>
        `
        )
        .join("");

      const buttonStyle =
        "display: inline-block; padding: 12px 24px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;";
      const addressStyle =
        "background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;";

      const contentHtml = `
        <p>Hi ${userName},</p>
        <p>Thank you for your order! We're getting it ready.</p>
        
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
        <p><strong>Status:</strong> Paid </p>

        <h3 style="margin-top: 25px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsTableRows}
        </table>

        <h3 style="margin-top: 25px;">Shipping Address:</h3>
        <div style="${addressStyle}">
          ${shippingAddress.street}<br/>
          ${shippingAddress.city}, ${shippingAddress.state} ${
            shippingAddress.zipCode
          }<br/>
          ${shippingAddress.country}
        </div>

        <p style="text-align: center; margin-top: 30px;">
          <a href="${
            process.env.BETTER_AUTH_URL
          }/orders/${orderId}" style="${buttonStyle}">
            View Your Order
          </a>
        </p>
      `;

      const html = this.createEmailWrapper("Order Confirmation", contentHtml);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM!,
        to: userEmail,
        subject: `Order Confirmation - #${orderId}`,
        html,
      });

      logger.info(`Order confirmation email sent to ${userEmail}`, {
        orderId,
      });
    } catch (error) {
      logger.error(`Failed to send order confirmation email`, {
        error,
        orderId,
      });
      throw error;
    }
  }

  async sendOrderCancelledMail(event: OrderCancelledEvent) {
    const { orderId, userName, userEmail } = event.data;

    try {
      // 2. UPDATED STYLES AND CONTENT
      const buttonStyle =
        "display: inline-block; padding: 12px 24px; font-size: 16px; color: #fff; background-color: #dc3545; text-decoration: none; border-radius: 5px;"; // Changed to red
      // 3. NEW HTML CONTENT FOR CANCELLATION
      const contentHtml = `
        <p>Hello, ${userName}!</p>
        <p>This email is to confirm that your order <strong>#${orderId}</strong> has been successfully cancelled.</p>

        <p>If a payment was already made for this order, a refund will be processed to your original payment method within 5-7 business days.</p>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${
            process.env.BETTER_AUTH_URL
          }/orders/${orderId}" style="${buttonStyle}">
            View Order Details
          </a>
        </p>

        <p style="margin-top: 25px; color: #555;">If you did not request this cancellation or have any questions, please contact our support team immediately.</p>
      `;

      const html = this.createEmailWrapper(
        "Your Order Has Been Cancelled",
        contentHtml
      );

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM!,
        to: userEmail,
        subject: `Order Cancelled - #${orderId}`,
        html,
      });
    } catch (error) {
      logger.error(`Failed to send order cancellation email`, {
        error,
        orderId,
      });
      throw error;
    }
  }

  private createEmailWrapper(title: string, contentHtml: string): string {
    const bodyStyle =
      "font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;";
    const containerStyle =
      "width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;";
    const headerStyle =
      "background-color: #007bff; color: #ffffff; padding: 20px 30px; text-align: center;";
    const contentStyle = "padding: 30px; line-height: 1.6; color: #333;";
    const footerStyle =
      "text-align: center; padding: 20px 30px; font-size: 0.9em; color: #777;";

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="${bodyStyle}">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table border="0" cellspacing="0" cellpadding="0" style="${containerStyle}">
                <!-- Header -->
                <tr>
                  <td style="${headerStyle}">
                    <h1 style="margin: 0; font-size: 24px;">Your App Name</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="${contentStyle}">
                    <h2 style="color: #007bff; margin-top: 0;">${title}</h2>
                    ${contentHtml}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="${footerStyle}">
                    <p>&copy; ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
