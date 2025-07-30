# 1단계: Gradle 빌드 단계
FROM gradle:8.7-jdk17 AS builder
WORKDIR /app

# Gradle 캐시 최적화를 위해 빌드 스크립트만 먼저 복사
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN gradle --version  # 캐시 확인용

# 의존성만 먼저 다운받아서 캐시
RUN gradle dependencies --no-daemon || return 0

# 소스 코드 복사
COPY . .

# Protobuf + BootJar 빌드
RUN gradle clean build -x test --no-daemon
# 또는 test 생략하고 bootJar만 원하면:
# RUN gradle clean bootJar -x test --no-daemon

# 2단계: 런타임 이미지
FROM eclipse-temurin:17-jdk
WORKDIR /app

# 빌드 결과물 복사 (Fat JAR)
COPY --from=builder /app/build/libs/*.jar app.jar

# 환경 변수
ENV TZ=Asia/Seoul
EXPOSE 8080

# JVM 최적화 옵션 예시 추가 가능
ENTRYPOINT ["java", "-jar", "app.jar"]
