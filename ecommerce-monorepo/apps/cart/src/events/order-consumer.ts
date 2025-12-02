import { EventBusService, Event, OrderEventType } from "@ecommerce/common";
import cartRepository from "../repository/cart-repository";

export class OrderCreatedConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe(
      "cart-service-order-listener",
      [OrderEventType.CREATED],
      async (event: Event) => {
        console.log(
          `[Cart] Order ${event.aggregateId} created. Clearing cart.`
        );
        const userId = (event.data as any).userId;

        if (userId) {
          await cartRepository.clearCart(userId);
        }
      }
    );
  }
}
