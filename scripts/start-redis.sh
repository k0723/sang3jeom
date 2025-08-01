#!/bin/bash

echo "🚀 Starting Redis..."

# 기존 Redis 컨테이너 중지 및 제거
docker stop sang3jeom-redis 2>/dev/null || true
docker rm sang3jeom-redis 2>/dev/null || true

# Redis 컨테이너 실행
docker run -d \
  --name sang3jeom-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine

if [ $? -eq 0 ]; then
    echo "✅ Redis started successfully!"
    echo "🌐 Redis is available at: localhost:6379"
    
    # 헬스체크
    echo "🔍 Checking Redis health..."
    sleep 3
    docker exec sang3jeom-redis redis-cli ping
else
    echo "❌ Failed to start Redis"
    exit 1
fi 