#!/bin/bash

echo "🛑 Stopping all services..."

# Java 서비스들 중지 (포트 기반)
ports=(8082 8083 8084 8085 8000)

for port in "${ports[@]}"; do
    echo "🔍 Checking port $port..."
    PID=$(lsof -ti:$port)
    if [ ! -z "$PID" ]; then
        echo "🛑 Stopping service on port $port (PID: $PID)"
        kill -15 $PID
        sleep 2
        # 강제 종료가 필요한 경우
        if kill -0 $PID 2>/dev/null; then
            echo "🔨 Force killing process on port $port"
            kill -9 $PID
        fi
    else
        echo "✅ No service running on port $port"
    fi
done

# Redis 컨테이너 중지
echo "🛑 Stopping Redis container..."
docker stop sang3jeom-redis 2>/dev/null || true

echo "✅ All services stopped!" 