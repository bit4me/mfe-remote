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
    ├── package.json
    ├── src/
    │   ├── index.js
    │   ├── routes/
    │   │   └── user.js
    │   ├── services/
    │   │   └── userService.js
    │   └── utils/
    │       └── logger.js
    └── tests/
        └── user.test.js

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
