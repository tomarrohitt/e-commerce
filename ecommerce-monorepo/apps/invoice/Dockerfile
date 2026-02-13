# Stage 1: The Builder
FROM golang:alpine AS builder

WORKDIR /app

# Install CA certificates for AWS S3
RUN apk add --no-cache ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Compile the binary explicitly for your ARM VM
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o invoice-service .


# Stage 2: The Final Minimal Image
# Stage 2: The Final Minimal Image
FROM alpine:latest

WORKDIR /app

# Copy the certs
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the binary
COPY --from=builder /app/invoice-service .

# --- ADD THIS EXACT LINE ---
COPY --from=builder /app/migrations ./migrations

EXPOSE 4005

CMD ["./invoice-service"]
