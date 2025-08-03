#!/bin/sh

# Docker 컨테이너 내에서 서비스를 시작하는 공통 스크립트

SERVICE_NAME=$1
SERVICE_PORT=$2

echo "🚀 Starting $SERVICE_NAME in Docker container..."

# Java 서비스인 경우
if [ "$SERVICE_NAME" != "image-service" ] && echo "$SERVICE_NAME" | grep -q "\-service"; then
    echo "☕ Java service detected: $SERVICE_NAME"
    
    # JAR 파일 찾기
    JAR_FILE=$(find /app -name "*.jar" | head -1)
    
    if [ -z "$JAR_FILE" ]; then
        echo "❌ JAR file not found in /app directory"
        exit 1
    fi
    
    echo "📦 Found JAR file: $JAR_FILE"
    echo "🌐 Service will be available on port: $SERVICE_PORT"
    
    # Java 애플리케이션 실행
    exec java -jar \
        -Dspring.profiles.active=docker \
        -Dserver.port=$SERVICE_PORT \
        "$JAR_FILE"

# Python 서비스인 경우 (image-service)
elif [ "$SERVICE_NAME" = "image-service" ]; then
    echo "🐍 Python service detected: $SERVICE_NAME"
    
    # main.py 파일 확인
    if [ ! -f "/app/main.py" ]; then
        echo "❌ main.py not found in /app directory"
        exit 1
    fi
    
    echo "🌐 Service will be available on port: $SERVICE_PORT"
    
    # Python 애플리케이션 실행
    cd /app
    exec python main.py
    
else
    echo "❌ Unknown service type: $SERVICE_NAME"
    exit 1
fi 