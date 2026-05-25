FROM golang:alpine AS builder

WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY apps/invoice/go.mod apps/invoice/go.sum ./
RUN go mod download

COPY apps/invoice/ .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o invoice-service .


FROM alpine:latest

WORKDIR /app

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY --from=builder /app/invoice-service .

COPY --from=builder /app/migrations ./migrations

EXPOSE 4005

CMD ["./invoice-service"]
