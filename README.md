# mfe-remote

## Micro Frontend System Architecture

- Development & Runtime Environment
- Frontend Build & Tooling Architecture
- Application Source Architecture
- Configuration & Environment Management
- Testing Architecture

### Development & Runtime Environment: 개발 및 실행 환경

```text

my-project/
│
├── .devcontainer/
│   ├── devcontinaer-lock.json
│   └── devcontinaer.json
│
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── docker-compose.yml
│
└── Dockerfile
```

- 향후 AWS, Kubernetes, Terraform, VPC, Load Balancer 등의 구성 정희 후 Infrastructure Architecture라는 상위 영역 확장 정의 필요

- Infrastructure Structure = Container Configuration: 컨테이너 설정 + Infrastructure Configuration: 인프라 설정

### Frontend Build & Tooling Architecture

```text

my-project/
│
├── federation/
│   ├── env.config.mjs
│   ├── exposes.config.mjs      <- remote app 전용
│   ├── federation.config.mjs
│   ├── refresh-preamble.mjs
│   ├── remotes.config.mjs      <- host app 전용
│   ├── shared.config.mjs
│   └── tailwind-classes.txt
│
├── package-lock.json
├── package.json
│
├── postcss.config.cjs
├── tailwind.config.js
│
├── tsconfig.json
│
├── rspack.config.mjs
├── vite.config.mjs
└── webpack.config.mjs
```

- 세부적으로는 다음과 같이 분류할 수 있습니다.

  | 분류                     | 파일                                                   | 역할                     |
  | ------------------------ | ------------------------------------------------------ | ------------------------ |
  | Package Management       | package.json, package-lock.json                        | 의존성 관리              |
  | Build Tools              | rspack.config.mjs, vite.config.mjs, webpack.config.mjs | 번들링 및 빌드           |
  | CSS Tooling              | postcss.config.cjs, tailwind.config.js                 | CSS 처리 및 스타일링     |
  | TypeScript Configuration | tsconfig.json                                          | 타입 검사 및 컴파일 설정 |

- 참고로 Webpack, Rspack, Vite는 모두 동일한 역할을 수행하는 도구라고 보기는 어렵습니다. 특히 Vite는 개발 서버와 빌드 환경을 함께 제공하는 프론트엔드 빌드 도구입니다.

### Application Source Architecture

```text

my-project/
│
├── build/
│   ├── paths.mjs
│   └── shared.config.mjs
│
├── src/
│   ├── components/
│   │   └── Button.tsx
│   │
│   ├── styles/
│   │   └── theme.ts
│   │
│   ├── routes/
│   │   └── user.js
│   │
│   ├── services/
│   │   └── userService.js
│   │
│   ├── utils/
│   │   └── logger.js
│   │
│   ├── App.tsx
│   ├── bootstrap.tsx       <-- 앱 초기화
│   └── index.tsx           <-- 번들러 공통 진입점
│
├── tests/
│    └── user.test.js
│
├── .env
├── .env.dev
├── .env.prod
├── .env.example
│
└── README.md
```

- 세부적으로는 다음과 같이 분류할 수 있습니다.
  | 분류 | 디렉터리 / 파일 | 역할 |
  | -------------- | ---------------------- | -------- |
  |Build Configuration |build/ |빌드 공통 설정 |
  |UI Components |src/components/ |재사용 가능한 UI |
  |Styling |src/styles/ |테마 및 스타일 |
  |Routing |src/routes/ |라우팅 |
  |Services |src/services/ |API 및 비즈니스 서비스 |
  |Utilities |src/utils/ |공통 유틸리티 |
  |Application Entry |bootstrap.tsx, index.tsx |애플리케이션 초기화 및 진입 |
  |Application Root |App.tsx |애플리케이션 루트 |
  |Tests |tests/ |테스트 코드 |
  |Environment Configuration |.env\* |환경별 설정 |

### Configuration & Environment Management

- .env / Environment Variables / Build Configuration

### Testing Architecture

- Unit Test / Integration Test / E2E Test

## 추가로 고려하면 좋은 MFE 전용 영역

현재 구조에서 가장 아쉬운 부분은 Micro Frontend 자체의 아키텍처가 명시적으로 드러나지 않는다는 점입니다.

MFE라면 다음 영역도 별도로 정의하는 것을 추천합니다.

| 영역                           | 주요 내용                                 |
| ------------------------------ | ----------------------------------------- |
| MFE Composition Architecture   | Host, Remote, Application Composition     |
| Module Federation Architecture | Exposes, Remotes, Shared Dependencies     |
| Runtime Integration            | Remote Loading, Bootstrap, Initialization |
| Dependency Sharing             | React, React DOM 등의 공유 전략           |
| Routing Architecture           | Host 및 Remote 간 라우팅 전략             |
| Deployment Architecture        | MFE별 독립 빌드 및 배포 전략              |

특히 Webpack, Rspack을 사용한다면 Module Federation 설정과 Runtime Integration을 Build Architecture와 구분해서 문서화하는 것이 좋습니다.

- ESM 방식 사용(CommonJS 지양)

  ```json
  {
    "name": "my-project",
    "type": "module",
    "scripts": {
      "start": "node src/index.js"
    }
  }
  ```

## 참조용

### 각 폴더별 소스 복사해 오기

```bash
cp -r ./01-01/. .
```

### node_modules 초기화하기

```bash
rm -rf node_modules
```

### 스크립트에 의해 파일이 생성되지 않을떄

```bash
apk add --no-cache gettext
```

### 성공한 소스 복사 해오기

```bash
cp -r gitignore/bk-성공작\ 만들기\ 중/projects/01-01-src/. ./src
```
