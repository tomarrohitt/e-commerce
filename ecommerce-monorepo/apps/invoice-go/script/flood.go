package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/tomarrohitt/invoice-go/internal/events"
)

func main() {
	rabbitmqURL := "amqp://rabbitmq:password@localhost:5672"
	exchange := "ecommerce.events"
	routingKey := "order.paid"

	conn, err := amqp.Dial(rabbitmqURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	defer ch.Close()

	// Bumped to 60s for 10k messages just to be safe
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	log.Printf("Flooding exchange '%s' with 10000 '%s' events...", exchange, routingKey)

	for i := 1; i <= 1000; i++ {
		orderID := uuid.New().String()

		event := events.OrderPaidEvent{
			EventName: routingKey,
		}

		event.Data.OrderID = orderID
		event.Data.UserID = uuid.New().String()
		event.Data.UserEmail = "buyer_" + orderID[:8] + "@example.com"
		event.Data.UserName = "Test Buyer"
		event.Data.TotalAmount = 250.00
		event.Data.Subtotal = 230.00
		event.Data.TaxedAmount = 20.00
		event.Data.PaymentID = "pay_" + uuid.New().String()[:8]

		event.Data.Items = []struct {
			ProductID string  `json:"productId"`
			Name      string  `json:"name"`
			Price     float64 `json:"price"`
			Quantity  int     `json:"quantity"`
		}{
			{
				ProductID: uuid.New().String(),
				Name:      "Mechanical Keyboard",
				Price:     230.00,
				Quantity:  1,
			},
		}

		addr := events.Address{
			Name:        "Test Buyer",
			Street:      "404 Not Found Ave",
			City:        "Tech City",
			State:       "TC",
			ZipCode:     "101010",
			Country:     "India",
			PhoneNumber: "+919876543210",
		}

		event.Data.ShippingAddress = addr
		event.Data.BillingAddress = addr
		event.Data.CreatedAt = time.Now()

		body, err := json.Marshal(event)
		if err != nil {
			log.Fatalf("Failed to marshal event %d: %v", i, err)
		}

		err = ch.PublishWithContext(ctx,
			exchange,
			routingKey,
			false,
			false,
			amqp.Publishing{
				ContentType:  "application/json",
				Body:         body,
				DeliveryMode: amqp.Persistent,
			})
		if err != nil {
			log.Fatalf("Failed to publish event %d: %v", i, err)
		}

		// Print every 1000 to keep the terminal clean
		if i%100 == 0 {
			log.Printf("Published %d events...", i)
		}
	}

	log.Println("Done! 10000 events successfully published.")
}
