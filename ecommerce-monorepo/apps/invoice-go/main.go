package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/tomarrohitt/invoice-go/internal/config"
	"github.com/tomarrohitt/invoice-go/internal/database"
	"github.com/tomarrohitt/invoice-go/internal/eventbus"
	"github.com/tomarrohitt/invoice-go/internal/invoice"
	"github.com/tomarrohitt/invoice-go/internal/outbox"
	s3svc "github.com/tomarrohitt/invoice-go/internal/s3"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Config error: %v", err)
	}

	if err := database.RunMigrations(cfg.DatabaseURL); err != nil {
		log.Fatalf("Migration error: %v", err)
	}

	dbCfg := database.PostgresConfig{
		URL:             cfg.DatabaseURL,
		MaxConns:        int32(cfg.DBMaxConns),
		MinConns:        int32(cfg.DBMinConns),
		MaxConnLifetime: cfg.DBMaxConnLifetime,
		MaxConnIdleTime: cfg.DBMaxConnIdleTime,
	}

	db, err := database.NewPostgres(ctx, dbCfg)
	if err != nil {
		log.Fatalf("Database error: %v", err)
	}
	defer db.Close()

	bus, err := eventbus.NewEventBus(cfg.RabbitMQURL, "ecommerce.events")
	if err != nil {
		log.Fatalf("RabbitMQ error: %v", err)
	}
	defer bus.Close()

	outbox.NewWorker(db, bus).Start(ctx)

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(cfg.AWSRegion),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AWSKeyID,
			cfg.AWSSecretKey,
			"",
		)),
	)
	if err != nil {
		log.Fatalf("AWS config error: %v", err)
	}

	s3Client := s3.NewFromConfig(awsCfg)

	s3Service := s3svc.NewService(s3Client, cfg.AWSBucket)

	invoiceRepo := invoice.NewRepository(db)
	outboxRepo := outbox.NewRepository()

	consumer := invoice.NewConsumer(invoiceRepo, outboxRepo, s3Service)

	err = bus.Subscribe("invoice_service_processor", []string{"order.paid"}, consumer.HandleOrderPaid)
	if err != nil {
		log.Fatalf("Failed to subscribe to events: %v", err)
	}

	handler := invoice.NewHandler(invoiceRepo, outboxRepo, s3Service)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/invoice/download/", handler.DownloadInvoice)

	server := &http.Server{
		Addr:    ":" + strconv.Itoa(cfg.Port),
		Handler: mux,
	}

	go func() {
		log.Println("Server listening on port", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("Shutting down gracefully...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server shutdown failed: %v", err)
	}
}
