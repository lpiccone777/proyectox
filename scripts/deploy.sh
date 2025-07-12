#!/bin/bash

# Deployment script for Deposito Urbano

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if environment is specified
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please specify environment (staging/production)${NC}"
    echo "Usage: ./deploy.sh [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
fi

echo -e "${YELLOW}Deploying to $ENVIRONMENT environment${NC}"

# Build and test backend
echo "📦 Building backend..."
cd backend
npm ci
npm run build
npm test

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t deposito-urbano-backend:latest .

# Tag for registry
if [ "$ENVIRONMENT" == "production" ]; then
    docker tag deposito-urbano-backend:latest $DOCKER_REGISTRY/deposito-urbano-backend:latest
    docker tag deposito-urbano-backend:latest $DOCKER_REGISTRY/deposito-urbano-backend:$(git rev-parse --short HEAD)
fi

# Push to registry
if [ "$ENVIRONMENT" == "production" ]; then
    echo "📤 Pushing to Docker registry..."
    docker push $DOCKER_REGISTRY/deposito-urbano-backend:latest
    docker push $DOCKER_REGISTRY/deposito-urbano-backend:$(git rev-parse --short HEAD)
fi

# Deploy based on platform
if [ -n "$RAILWAY_TOKEN" ]; then
    echo "🚂 Deploying to Railway..."
    railway up
elif [ -n "$RENDER_API_KEY" ]; then
    echo "🎨 Deploying to Render..."
    curl -X POST https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"clearCache": false}'
else
    echo "🐳 Deploying with Docker Compose..."
    docker-compose -f ../docker-compose.yml up -d
fi

# Run database migrations
echo "🗃️ Running database migrations..."
if [ "$ENVIRONMENT" == "production" ]; then
    # Run migrations in production
    echo "Running production migrations..."
    # Add migration command here
else
    # Run migrations locally
    cd ../backend
    npm run migrate
fi

# Health check
echo "🏥 Performing health check..."
sleep 10
HEALTH_CHECK_URL="${API_URL:-http://localhost:3000}/api/health"
if curl -f $HEALTH_CHECK_URL; then
    echo -e "\n${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "\n${RED}❌ Health check failed!${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment complete!${NC}"