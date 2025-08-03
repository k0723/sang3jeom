#!/bin/bash

echo "🚀 Starting Image Service (AI Goods)..."

# image-service 디렉토리로 이동
cd backend/image-service

# 환경 변수 설정
export UPLOAD_DIR=./uploads
export OUTPUT_DIR=./outputs

# 필요한 디렉토리 생성
mkdir -p uploads outputs

# 가상환경이 있는지 확인
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Virtual environment not found. Run setup first:"
    echo "   ./scripts/setup-image-service.sh"
fi

# main.py 파일 확인
if [ ! -f "main.py" ]; then
    echo "❌ main.py not found!"
    exit 1
fi

echo "🌐 Service will be available at: http://localhost:8000"
echo "📁 Upload directory: ./uploads"
echo "📁 Output directory: ./outputs"

# Python 애플리케이션 실행
python main.py 