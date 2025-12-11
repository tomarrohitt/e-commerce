import {
  EventBusService,
  Event,
  OrderEventType,
  UserEventType,
  LoggerFactory,
} from "@ecommerce/common";
import emailService from "../services/email-service";

const logger = LoggerFactory.create("EmailService");

export class EmailConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe(
      "email-service-queue",
      ["order.*", "user.*"],
      async (event: Event) => {
        try {
          switch (event.eventType) {
            case UserEventType.REGISTERED:
              await emailService.sendVerificationEmail(event.data);
              break;
            case UserEventType.VERIFIED:
              await emailService.sendWelcomeEmail(event.data);
              break;
            case UserEventType.FORGOT_PASSWORD:
              await emailService.sendPasswordResetEmail(event.data);
              break;

            case OrderEventType.PAID:
              await emailService.sendOrderConfirmation(event.data);
              break;

            case OrderEventType.CANCELLED:
              await emailService.sendOrderCancelled(event.data);
              break;

            default:
              break;
          }
        } catch (error) {
          logger.error("Failed to process email event", error);
          throw error;
        }
      },
    );
  }
}
