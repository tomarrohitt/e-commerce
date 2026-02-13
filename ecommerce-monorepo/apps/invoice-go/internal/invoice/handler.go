package invoice

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/tomarrohitt/invoice-go/internal/outbox"
)

type Handler struct {
	repo       *Repository
	outboxRepo *outbox.Repository
	s3         interface {
		GetSignedDownloadURL(context.Context, string) (string, error)
	}
}

func NewHandler(
	repo *Repository,
	outboxRepo *outbox.Repository,
	s3Service interface {
		GetSignedDownloadURL(context.Context, string) (string, error)
	},
) *Handler {
	return &Handler{
		repo:       repo,
		outboxRepo: outboxRepo,
		s3:         s3Service,
	}
}

func (h *Handler) DownloadInvoice(w http.ResponseWriter, r *http.Request) {
	rawID := strings.TrimPrefix(r.URL.Path, "/api/invoice/download/")

	orderID := strings.Trim(rawID, "/ ")

	if orderID == "" {
		http.Error(w, "orderId required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	inv, err := h.repo.GetInvoiceByOrderID(ctx, orderID)
	if err != nil {
		log.Printf("🔍 Invoice not found in DB for ID: [%s]", orderID)
		http.Error(w, "Invoice not found", http.StatusNotFound)
		return
	}

	fileKey := inv.PDFURL

	secureURL, err := h.s3.GetSignedDownloadURL(ctx, fileKey)
	if err != nil {
		http.Error(w, "Failed to generate signed URL", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"url": secureURL,
	})
}
