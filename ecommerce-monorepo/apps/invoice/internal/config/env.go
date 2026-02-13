package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         int
	DatabaseURL  string
	RabbitMQURL  string
	AWSRegion    string
	AWSBucket    string
	AWSKeyID     string
	AWSSecretKey string

	DBMaxConns        int32
	DBMinConns        int32
	DBMaxConnLifetime time.Duration
	DBMaxConnIdleTime time.Duration
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	var err error
	cfg := &Config{}

	cfg.Port, err = getEnvInt("PORT", 4005)
	if err != nil {
		return nil, err
	}

	cfg.DatabaseURL, err = getRequiredEnv("DATABASE_URL")
	if err != nil {
		return nil, err
	}

	cfg.RabbitMQURL, err = getRequiredEnv("RABBITMQ_URL")
	if err != nil {
		return nil, err
	}

	cfg.AWSRegion = getEnv("AWS_REGION", "ap-south-1")
	cfg.AWSBucket = getEnv("AWS_BUCKET_NAME", "")
	cfg.AWSKeyID = getEnv("AWS_ACCESS_KEY_ID", "")
	cfg.AWSSecretKey = getEnv("AWS_SECRET_ACCESS_KEY", "")

	maxConns, _ := getEnvInt("DB_MAX_CONNS", 10)
	cfg.DBMaxConns = int32(maxConns)

	minConns, _ := getEnvInt("DB_MIN_CONNS", 2)
	cfg.DBMinConns = int32(minConns)

	cfg.DBMaxConnLifetime = 1 * time.Hour
	cfg.DBMaxConnIdleTime = 30 * time.Minute

	if cfg.AWSBucket == "" || cfg.AWSKeyID == "" || cfg.AWSSecretKey == "" {
		return nil, fmt.Errorf("AWS configuration is incomplete")
	}

	return cfg, nil
}

func getEnv(key string, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) (int, error) {
	if value, exists := os.LookupEnv(key); exists {
		parsed, err := strconv.Atoi(value)
		if err != nil {
			return 0, fmt.Errorf("%s must be an integer", key)
		}
		return parsed, nil
	}
	return fallback, nil
}

func getRequiredEnv(key string) (string, error) {
	value, exists := os.LookupEnv(key)
	if !exists || value == "" {
		return "", fmt.Errorf("%s is required", key)
	}
	return value, nil
}
