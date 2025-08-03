#!/bin/bash

echo "🚀 Building all Java services..."

# 서비스 목록
services=("user-service" "community-service" "order-service" "review-service")

# 각 서비스 빌드
for service in "${services[@]}"; do
    echo "📦 Building $service..."
    cd backend/$service
    
    # Gradle 빌드 (테스트 제외)
    ./gradlew clean build -x test
    
    if [ $? -eq 0 ]; then
        echo "✅ $service build completed"
    else
        echo "❌ $service build failed"
        exit 1
    fi
    
    cd ../..
done

echo "🎉 All services built successfully!" 