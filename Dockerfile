# === Stage 1: React 애플리케이션 빌드 ===
FROM node:20-alpine AS builder

# 필요에 따라 추가적인 OS 패키지 설치가 필요하면 아래 주석을 해제하고 사용하세요.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <package-list-here>

WORKDIR /app

# 작업 디렉토리 소유권을 node 유저로 변경
RUN chown -R node:node /workspace

# 의존성 정의 파일  복사 (캐싱 효율화) 및 설치
# 만약 yarn이나 pnpm을 쓰신다면 해당 lock 파일도 주석 해제 후 포함하세요.
COPY package*.json ./

# 의존성 설치
RUN npm ci --omit=dev

# 소스 코드 전체 복사 (위의 .dockerignore 덕분에 node_modules는 제외됨)
COPY . .

EXPOSE 5001

CMD ["npm", "run", "dev:vite"]
