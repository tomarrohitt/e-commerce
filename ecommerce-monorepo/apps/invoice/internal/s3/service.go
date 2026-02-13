package s3

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awss3 "github.com/aws/aws-sdk-go-v2/service/s3"
)

type Service struct {
	client *awss3.Client
	bucket string
}

func NewService(client *awss3.Client, bucket string) *Service {
	return &Service{
		client: client,
		bucket: bucket,
	}
}

func (s *Service) UploadInvoice(ctx context.Context, key string, data []byte) (string, error) {
	_, err := s.client.PutObject(ctx, &awss3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String("application/pdf")})

	if err != nil {
		return "", fmt.Errorf("failed to upload to s3: %w", err)
	}

	return key, nil
}

func (s *Service) GetSignedDownloadURL(ctx context.Context, key string) (string, error) {
	presigner := awss3.NewPresignClient(s.client)

	input := &awss3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
		ResponseContentDisposition: aws.String(
			fmt.Sprintf(`attachment; filename="invoice-%s"`, filepath.Base(key)),
		),
	}

	req, err := presigner.PresignGetObject(ctx, input, func(o *awss3.PresignOptions) {
		o.Expires = 15 * time.Minute
	})

	if err != nil {
		log.Printf("`Presign error: %v", err)
		return "", err
	}

	return req.URL, nil
}
