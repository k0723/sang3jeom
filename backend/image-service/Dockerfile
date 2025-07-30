# 1단계: Python 3.12 slim 이미지를 사용 (용량 최적화)
FROM python:3.12-slim

# 2단계: 작업 디렉토리 설정
WORKDIR /app

# 3단계: pip 업그레이드
RUN pip install --upgrade pip

# 4단계: requirements.txt 먼저 복사 후 패키지 설치 (캐시 활용)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5단계: 소스 코드 복사
COPY . .

# 6단계: 환경 변수 설정
ENV PYTHONUNBUFFERED=1

# 7단계: FastAPI 서비스 포트
EXPOSE 8000

# 8단계: uvicorn 실행 (reload는 개발용 → 운영 배포 시 제거 권장)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
