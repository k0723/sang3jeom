#!/bin/bash

echo "🚀 Starting all services locally..."

# 1. Redis 시작
echo "📱 Step 1: Starting Redis..."
./scripts/start-redis.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Redis. Exiting..."
    exit 1
fi

# 2. 모든 Java 서비스 빌드
echo "📱 Step 2: Building all Java services..."
./scripts/build-all.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to build Java services. Exiting..."
    exit 1
fi

# 3. Image Service 설정 (필요시)
echo "📱 Step 3: Setting up Image Service..."
if [ ! -d "backend/image-service/venv" ]; then
    ./scripts/setup-image-service.sh
fi

echo ""
echo "🎉 All services are ready to start!"
echo ""
echo "🔥 To start individual services, use:"
echo "   ./scripts/run-user-service.sh      (Port: 8082)"
echo "   ./scripts/run-community-service.sh (Port: 8083)"
echo "   ./scripts/run-review-service.sh    (Port: 8084)"
echo "   ./scripts/run-order-service.sh     (Port: 8085)"
echo "   ./scripts/run-image-service.sh     (Port: 8000)"
echo ""
echo "💡 Or start them in separate terminal windows!"
echo ""
echo "🌐 Services will be available at:"
echo "   - User Service:      http://localhost:8082"
echo "   - Community Service: http://localhost:8083"
echo "   - Review Service:    http://localhost:8084"
echo "   - Order Service:     http://localhost:8085"
echo "   - Image Service:     http://localhost:8000"
echo "   - Redis:             localhost:6379" 