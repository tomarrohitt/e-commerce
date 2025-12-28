import {
  EventBusService,
  Event,
  UserEventType,
  LoggerFactory,
  UserVerifiedEvent,
} from "@ecommerce/common";
import { prisma } from "../config/prisma";

const logger = LoggerFactory.create("EmailService");

export class UserCreatedConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe(
      "email-service-queue",
      ["order.*", "user.*"],
      async (event: Event) => {
        try {
          switch (event.eventType) {
            case UserEventType.VERIFIED:
              await this.createUser(event.data);
              break;
            default:
              break;
          }
        } catch (error) {
          logger.error("Failed to process email event", error);
          throw error;
        }
      }
    );
  }

  private async createUser(data: UserVerifiedEvent["data"]) {
    const { name, image, userId } = data;
    await prisma.user.create({
      data: {
        id: userId,
        name,
        image,
      },
      select: {
        id: true,
      },
    });
  }
}
