package invoice

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
	"github.com/tomarrohitt/invoice-go/internal/outbox"
)

type Invoice struct {
	ID        string
	OrderID   string
	UserID    string
	Amount    decimal.Decimal
	Status    string
	PDFURL    string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, inv Invoice) error {
	query := `
		INSERT INTO invoices (id, order_id, user_id, amount, status, pdf_url)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := r.db.Exec(ctx, query,
		inv.ID,
		inv.OrderID,
		inv.UserID,
		inv.Amount,
		inv.Status,
		inv.PDFURL,
	)

	return err
}

func (r *Repository) GetInvoiceByOrderID(ctx context.Context, orderID string) (*Invoice, error) {
	query := `
		SELECT id, order_id, user_id, amount, status, pdf_url, created_at, updated_at
		FROM invoices
		WHERE order_id = $1
	`

	row := r.db.QueryRow(ctx, query, orderID)

	var inv Invoice

	err := row.Scan(
		&inv.ID,
		&inv.OrderID,
		&inv.UserID,
		&inv.Amount,
		&inv.Status,
		&inv.PDFURL,
		&inv.CreatedAt,
		&inv.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &inv, nil
}

func (r *Repository) CreateWithEvent(ctx context.Context, inv Invoice, outboxRepo *outbox.Repository) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO invoices (id, order_id, user_id, amount, status, pdf_url)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err = tx.Exec(ctx, query,
		inv.ID,
		inv.OrderID,
		inv.UserID,
		inv.Amount,
		inv.Status,
		inv.PDFURL,
	)

	if err != nil {
		return err
	}

	eventPayload := map[string]any{
		"invoiceUrl": inv.PDFURL,
		"orderId":    inv.OrderID,
	}

	err = outboxRepo.InsertEvent(
		ctx,
		tx,
		inv.ID,
		"invoice.generated",
		eventPayload,
	)

	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
