# mfe-remote

- 각 폴더별 소스 복사해 오기

  ```bash
  cp -r ./01-01/. .
  ```

- node_modules 초기화하기

  ```bash
  rm -rf node_modules
  ```

- 스크립트에 의해 파일이 생성되지 않을떄

  ```bash
  apk add --no-cache gettext
  ```

- 프로젝트 추천 구조
  - 폴더 구조

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
    │   └── index.tsx         <-- 번들러 공통 진입점
    │
    ├── tests/
    │    └── user.test.js
    │
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    │
    ├── rspack.config.mjs
    ├── vite.config.mjs
    └── webpack.config.mjs
    ```

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

- 성공한 소스 복사 해오기
  ```bash
  cp -r gitignore/bk-성공작\ 만들기\ 중/projects/01-01-src/. ./src
  ```
