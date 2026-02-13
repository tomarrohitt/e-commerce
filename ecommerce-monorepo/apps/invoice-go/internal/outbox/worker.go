package outbox

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Worker struct {
	db        *pgxpool.Pool
	eventBus  Publisher
	interval  time.Duration
	batchSize int
}

type Publisher interface {
	Publish(context.Context, string, any) error
}

func NewWorker(db *pgxpool.Pool, bus Publisher) *Worker {
	return &Worker{
		db:        db,
		eventBus:  bus,
		interval:  5 * time.Second,
		batchSize: 10,
	}
}

func (w *Worker) Start(ctx context.Context) {
	go w.loop(ctx)
}

func (w *Worker) loop(ctx context.Context) {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Outbox worker stopped")
			return
		case <-ticker.C:
			w.processBatch(ctx)
		}
	}
}

func (w *Worker) processBatch(ctx context.Context) {
	query := `
		SELECT id, aggregate_id, event_type, payload
		FROM outbox_events
		WHERE status = 'PENDING'
		ORDER BY created_at ASC
		LIMIT $1
	`

	rows, err := w.db.Query(ctx, query, w.batchSize)
	if err != nil {
		log.Println("Outbox query error:", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var id string
		var aggregateID string
		var eventType string
		var payload []byte

		err := rows.Scan(&id, &aggregateID, &eventType, &payload)
		if err != nil {
			continue
		}

		w.processEvent(ctx, id, eventType, payload)
	}
}

func (w *Worker) processEvent(ctx context.Context, id, eventType string, payload []byte) {
	var rawData map[string]any
	json.Unmarshal(payload, &rawData)

	wrappedEvent := map[string]any{
		"eventType": eventType,
		"data":      rawData,
	}

	err := w.eventBus.Publish(ctx, eventType, wrappedEvent)
	if err != nil {
		log.Println("Publish failed:", err)
		w.markFailed(ctx, id)
		return
	}

	w.markProcessed(ctx, id)
}

func (w *Worker) markProcessed(ctx context.Context, id string) {
	_, _ = w.db.Exec(ctx,
		`UPDATE outbox_events SET status='PROCESSED', published_at=NOW() WHERE id=$1`,
		id,
	)
}

func (w *Worker) markFailed(ctx context.Context, id string) {
	_, _ = w.db.Exec(ctx,
		`UPDATE outbox_events SET status='FAILED' WHERE id=$1`,
		id,
	)
}
