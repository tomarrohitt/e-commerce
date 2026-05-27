import { EventBusService, Event, UserEventType } from "@ecommerce/common";
import { deleteImage } from "@ecommerce/storage-service";

export class ImageCleanUpConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe(
      "user-image-uploaded-listener",
      [UserEventType.IMAGE_UPDATED],
      async (event: Event) => {
        await deleteImage(event.data.image);
      },
    );
  }
}
