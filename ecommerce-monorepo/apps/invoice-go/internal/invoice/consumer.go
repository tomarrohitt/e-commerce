package invoice

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"github.com/tomarrohitt/invoice-go/internal/events"
	"github.com/tomarrohitt/invoice-go/internal/outbox"
)

type S3Uploader interface {
	GetSignedDownloadURL(context.Context, string) (string, error)
	UploadInvoice(context.Context, string, []byte) (string, error)
}

type Consumer struct {
	repo       *Repository
	outboxRepo *outbox.Repository
	s3         S3Uploader
}

func NewConsumer(repo *Repository, outboxRepo *outbox.Repository, s3 S3Uploader) *Consumer {
	return &Consumer{
		repo:       repo,
		outboxRepo: outboxRepo,
		s3:         s3,
	}
}

func (c *Consumer) HandleOrderPaid(payload []byte) error {
	var event events.OrderPaidEvent
	if err := json.Unmarshal(payload, &event); err != nil {
		return err
	}

	if event.Data.OrderID == "" {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	existing, err := c.repo.GetInvoiceByOrderID(ctx, event.Data.OrderID)
	if err == nil && existing != nil {
		return nil
	}

	invoiceID := uuid.New().String()

	generator := NewPDFGenerator()
	pdfBytes, err := generator.Generate(event, invoiceID)
	if err != nil {
		log.Printf("PDF Gen failed for order %s: %v", event.Data.OrderID, err)
		return err
	}

	s3Key := fmt.Sprintf("uploads/invoices/%s/%s.pdf", event.Data.UserID, event.Data.OrderID)
	uploadedKey, err := c.s3.UploadInvoice(ctx, s3Key, pdfBytes)
	if err != nil {
		log.Printf("S3 upload failed for order %s: %v", event.Data.OrderID, err)
		return err
	}

	inv := Invoice{
		ID:      invoiceID,
		OrderID: event.Data.OrderID,
		UserID:  event.Data.UserID,
		Amount:  decimal.NewFromFloat(event.Data.TotalAmount),
		Status:  "COMPLETED",
		PDFURL:  uploadedKey,
	}

	if err := c.repo.CreateWithEvent(ctx, inv, c.outboxRepo); err != nil {
		log.Printf("Failed to save invoice record for order %s: %v", event.Data.OrderID, err)
		return err
	}

	log.Printf("[Invoice] Successfully processed Order: %s", event.Data.OrderID)
	return nil
}
