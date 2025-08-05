FROM python:3.10

WORKDIR /app

# image-service 파일 복사
COPY backend/image-service/ . 

# scripts 복사 (Dockerfile 기준 상대경로)
COPY ../../scripts ./scripts

RUN apt-get update && apt-get install -y dos2unix \
    && find ./scripts -type f -name "*.sh" -exec dos2unix {} \; \
    && chmod +x ./scripts/*.sh

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

CMD ["sh", "./scripts/docker-start.sh", "image-service", "8000"]
