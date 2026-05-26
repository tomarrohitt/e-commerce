import { EventBusService, Event, InvoiceEventType } from "@ecommerce/common";
import { orderRepository } from "../repository/order-repository";

export class InvoiceGeneratedConsumer {
  constructor(private eventBus: EventBusService) {}
  async start() {
    await this.eventBus.subscribe(
      "order-service-invoice-generated",
      [InvoiceEventType.GENERATED],
      async (event: Event) => {
        if (event.eventType === InvoiceEventType.GENERATED) {
          const { orderId, invoiceUrl } = event.data;
          await orderRepository.updateInvoiceUrl(orderId, invoiceUrl);
        }
      },
    );
  }
}
