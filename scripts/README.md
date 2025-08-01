# 🚀 Sang3jeom Local Development Scripts

이 디렉토리는 Docker 없이 로컬에서 직접 각 마이크로서비스를 실행하기 위한 스크립트들을 포함합니다.

## 📋 스크립트 목록

### 🏗️ 빌드 스크립트
- `build-all.sh` - 모든 Java 서비스를 빌드

### 🐍 Python 서비스 설정
- `setup-image-service.sh` - Image Service 의존성 설치
- `run-image-service.sh` - Image Service 실행

### ☕ Java 서비스 실행
- `run-user-service.sh` - User Service 실행 (8082)
- `run-community-service.sh` - Community Service 실행 (8083)
- `run-review-service.sh` - Review Service 실행 (8084)
- `run-order-service.sh` - Order Service 실행 (8085)

### 🗄️ 인프라 서비스
- `start-redis.sh` - Redis 컨테이너 시작

### 🎛️ 통합 관리
- `start-all-local.sh` - 모든 서비스 준비 (빌드 + 설정)
- `stop-all.sh` - 모든 서비스 중지

## 🚀 빠른 시작

### 1. 전체 준비
```bash
./scripts/start-all-local.sh
```

### 2. 개별 서비스 시작
각각 별도의 터미널에서 실행:
```bash
# Terminal 1: User Service
./scripts/run-user-service.sh

# Terminal 2: Community Service
./scripts/run-community-service.sh

# Terminal 3: Review Service
./scripts/run-review-service.sh

# Terminal 4: Order Service
./scripts/run-order-service.sh

# Terminal 5: Image Service
./scripts/run-image-service.sh
```

### 3. 서비스 중지
```bash
./scripts/stop-all.sh
```

## 🌐 서비스 포트

| 서비스 | 포트 | URL |
|--------|------|-----|
| User Service | 8082 | http://localhost:8082 |
| Community Service | 8083 | http://localhost:8083 |
| Review Service | 8084 | http://localhost:8084 |
| Order Service | 8085 | http://localhost:8085 |
| Image Service | 8000 | http://localhost:8000 |
| Redis | 6379 | localhost:6379 |

## 📝 주의사항

1. **Java 서비스**: Gradle 빌드가 먼저 완료되어야 합니다.
2. **Image Service**: Python 가상환경과 의존성 설치가 필요합니다.
3. **Redis**: Docker가 실행 중이어야 합니다.
4. **환경변수**: `.env` 파일이 프로젝트 루트에 있어야 합니다.

## 🔧 트러블슈팅

### 포트 충돌
```bash
# 특정 포트 사용 중인 프로세스 확인
lsof -i :8082

# 모든 서비스 중지
./scripts/stop-all.sh
```

### 빌드 실패
```bash
# 개별 서비스 빌드
cd backend/user-service
./gradlew clean build -x test
```

### Python 의존성 문제
```bash
# Image Service 재설정
cd backend/image-service
rm -rf venv
cd ../..
./scripts/setup-image-service.sh
``` 