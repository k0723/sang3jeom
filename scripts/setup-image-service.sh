#!/bin/bash

echo "🐍 Setting up Image Service (Python)..."

# image-service 디렉토리로 이동
cd backend/image-service

# Python 가상환경 생성 (선택적)
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# 가상환경 활성화
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# requirements.txt 확인
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found!"
    exit 1
fi

# 의존성 설치
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Image Service setup completed!"
    echo "💡 To run the service, use: ./scripts/run-image-service.sh"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

cd ../.. 