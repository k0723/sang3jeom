#!/bin/bash

echo "🚀 Starting User Service..."

# 환경 변수 설정
export SPRING_PROFILES_ACTIVE=docker
export SERVER_PORT=8082

# JAR 파일 찾기
JAR_FILE=$(find backend/user-service/build/libs -name "*.jar" | head -1)

if [ -z "$JAR_FILE" ]; then
    echo "❌ JAR file not found. Please build the service first."
    echo "Run: ./scripts/build-all.sh"
    exit 1
fi

echo "📦 Starting with JAR: $JAR_FILE"
echo "🌐 Service will be available at: http://localhost:8082"

# Java 애플리케이션 실행
java -jar \
    -Dspring.profiles.active=docker \
    -Dserver.port=8082 \
    "$JAR_FILE" 