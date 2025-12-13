import Stripe from "stripe";
import { env } from "../config/env";

class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });
  }

  async createPaymentIntent(amount: number, metadata: Record<string, any>) {
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async refundPayment(paymentIntentId: string) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  }

  async cancelPaymentIntent(paymentIntentId: string) {
    return await this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  constructEvent(payload: string | Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  }
}

export const stripeService = new StripeService();
