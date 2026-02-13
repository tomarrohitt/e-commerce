package eventbus

import (
	"context"
	"encoding/json"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

type EventBus struct {
	conn     *amqp.Connection
	channel  *amqp.Channel
	exchange string
}

func NewEventBus(url, exchange string) (*EventBus, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	err = ch.ExchangeDeclare(
		exchange,
		"topic",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}

	log.Printf("[RabbitMQ] Connected to exchange: %s", exchange)
	return &EventBus{
		conn:     conn,
		channel:  ch,
		exchange: exchange,
	}, nil
}

func (e *EventBus) Publish(ctx context.Context, routingKey string, event any) error {
	body, err := json.Marshal(event)
	if err != nil {
		return err
	}

	return e.channel.PublishWithContext(
		ctx,
		e.exchange,
		routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent,
		},
	)
}

func (e *EventBus) Subscribe(queueName string, routingKeys []string, handler func([]byte) error) error {
	q, err := e.channel.QueueDeclare(queueName, true, false, false, false, nil)
	if err != nil {
		return err
	}

	for _, key := range routingKeys {
		if err := e.channel.QueueBind(q.Name, key, e.exchange, false, nil); err != nil {
			return err
		}
	}

	err = e.channel.Qos(
		100,
		0,
		false,
	)
	if err != nil {
		return err
	}

	msgs, err := e.channel.Consume(q.Name, "", false, false, false, false, nil)
	if err != nil {
		return err
	}

	workerCount := 50
	for i := 1; i <= workerCount; i++ {
		go func(workerID int) {
			for msg := range msgs {
				if err := handler(msg.Body); err != nil {
					log.Printf("[Worker %d] Processing Failed [%s]: %v", workerID, msg.RoutingKey, err)
					msg.Nack(false, true)
					continue
				}
				msg.Ack(false)
			}
		}(i)
	}

	return nil
}

func (e *EventBus) Close() {
	if e.channel != nil {
		e.channel.Close()
	}
	if e.conn != nil {
		e.conn.Close()
	}
	log.Println("[RabbitMQ] Connection closed")
}
