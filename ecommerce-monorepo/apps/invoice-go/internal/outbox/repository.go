package outbox

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type Repository struct{}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) InsertEvent(ctx context.Context, tx pgx.Tx, aggregateID string, eventType string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	id := uuid.New().String()

	query := `
		INSERT INTO outbox_events (
			id,
			aggregate_id,
			event_type,
			payload,
			status
		)
		VALUES ($1, $2, $3, $4, 'PENDING')
	`

	_, err = tx.Exec(ctx, query, id, aggregateID, eventType, data)
	return err
}
