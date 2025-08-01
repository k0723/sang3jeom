#!/bin/bash

echo "🚀 Starting Community Service..."

# 환경 변수 설정
export SPRING_PROFILES_ACTIVE=local
export SERVER_PORT=8083

# JAR 파일 찾기
JAR_FILE=$(find backend/community-service/build/libs -name "*.jar" | head -1)

if [ -z "$JAR_FILE" ]; then
    echo "❌ JAR file not found. Please build the service first."
    echo "Run: ./scripts/build-all.sh"
    exit 1
fi

echo "📦 Starting with JAR: $JAR_FILE"
echo "🌐 Service will be available at: http://localhost:8083"

# Java 애플리케이션 실행
java -jar \
    -Dspring.profiles.active=local \
    -Dserver.port=8083 \
    "$JAR_FILE" 