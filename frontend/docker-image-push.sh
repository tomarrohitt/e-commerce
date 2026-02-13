#!/bin/bash

# 1. Configuration (Matches your backend script)
NAMESPACE="idgxrtixsdtd"
REGION="iad"
REPO="ecommerce"
SERVICE="frontend"

# 2. Define Image Names
LOCAL_NAME="frontend-service"
REMOTE_TAG="$REGION.ocir.io/$NAMESPACE/$REPO:$SERVICE"

echo "------------------------------------------------------"
echo "Building & Pushing $SERVICE..."
echo "------------------------------------------------------"

# 3. Build with Arguments (CRITICAL for Next.js)
# We pass the PUBLIC variables here so they get baked into the static HTML/JS.
docker build \
  --build-arg NEXT_PUBLIC_API_URL="http://api-gateway:4000" \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51SRYEnA4Mr7wN5Jm8hotlYOkMdTjvnJIEVvTj5KQMkpxdEF2BvmgW00ZKHIQHh6gGoexgMIL0d48gExR9ibCfk4U00z0tzHmNB" \
  --build-arg NEXT_PUBLIC_ORIGIN_URL="https://rohit-ecommerce-microservice.dedyn.io" \
  --build-arg NEXT_PUBLIC_AWS_REGION="ap-south-1" \
  --build-arg NEXT_PUBLIC_AWS_BUCKET_NAME="ecommerce-node-microservices" \
  -t "$LOCAL_NAME" .

# 4. Tag for Oracle Cloud
docker tag "$LOCAL_NAME" "$REMOTE_TAG"

# 5. Push to Registry
docker push "$REMOTE_TAG"

echo "✅ Frontend successfully pushed to: $REMOTE_TAG"
