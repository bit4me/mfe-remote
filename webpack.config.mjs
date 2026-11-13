// Node.js 및 환경변수 관련
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Webpack 플러그인 관련
import HtmlWebpackPlugin from 'html-webpack-plugin';

// Module Federation 관련
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
import { Container } from 'postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async (webpackEnv = {}, argv = {}) => {
    const mode = argv.mode || 'development';
    const isDevelopment = mode === 'development'

    // 1. 환경변수 파일 경로
    const envPath = path.resolve(
        __dirname,
        isDevelopment ? '.env.dev' : '.env'
    );

    // 2. 환경변수 로딩
    const result = dotenv.config({
        path: envPath,
        override: true
    });

    if (result.error) {
        throw new Error(`[Webpack] Environment loading failed: ${envPath}`);
    }

    // 3. 환경변수 로딩 이후 Federation 설정 가져오기
    const { default: mf } = await import('./federation/federation.config.mjs');

    const { shared, exposes } = mf;

    // 4. Remote 번들 형식 결정
    const isModule = mf.env.remoteFormat === 'module';

    console.log('[Webpack] Remote Configuration:', {
        mode,
        command: mf.env.command,

        remoteContainerName: mf.remoteContainerName,                   // Module Federation 컨테이너 이름

        entryName: mf.entryName,        // Remote Entry 파일명
        entryNameForViteVarBuild: mf.entryNameForViteVarBuild,  // Remote Entry 파일명 (Vite 의 var 타입)

        remoteFormat: mf.remoteFormat,      // Remote 노출 방식

        exposes: mf.exposes,

        appPort: mf.env.appPort,
    });

    return {
        mode,

        // 번들러 진입점.
        //entry: {}, //<-- 독립 실행용 entry 없음.
        entry: {
            //button: './src/components/Button.tsx',               //<-- 01-02 용
            //themeinjector: './src/components/ThemeInjector.tsx',    //<-- 01-02 용

            //app: './src/main.jsx',                                //  <-- 02-02 용
            //app: './src/main.jsx',                                //  <-- 03-02 용: 버튼 나옴
        },
        //entry: ['./src/components/ui/Button.tsx', './src/components/ThemeInjector.tsx'],//<-- 02-01 용

        // Output
        output: {
            publicPath: 'auto',
            uniqueName: mf.remoteContainerName,
            clean: true,

            // ESM 출력 설정
            module: isModule
        },

        // Development Server
        devServer: {
            port: mf.env.appPort,
            host: '0.0.0.0',
            historyApiFallback: true,

            headers: {
                'Access-Control-Allow-Origin': '*'
            },

            hot: isDevelopment
        },

        // Resolve
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js']
        },

        // Plugins
        plugins: [
            new ModuleFederationPlugin({
                name: mf.remoteContainerName,

                filename: mf.entryName,

                library: isModule
                    ? {
                        type: mf.remoteFormat,
                    }
                    : {
                        type: mf.remoteFormat,
                        name: mf.remoteContainerName,
                    },

                exposes: mf.exposes,

                shared: mf.shared,

                dts: mf.dts
            }),

            new HtmlWebpackPlugin({
                template: './src/index.html'
            })
        ],

        // Module Rules
        module: {
            rules: createRules(isDevelopment)
        },

        stats: 'minimal', // 에러, 경고, 요약 정보만 간략하게 출력
    };
};

// Module Rules
const createRules = (isDevelopment) => [
    {
        // 1. JavaScript 및 JSX 설정
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: [
                    '@babel/preset-env',
                    ['@babel/preset-react', {
                        runtime: 'automatic',
                        development: isDevelopment,
                    }],
                ],
            },
        },
    },

    // 2. TypeScript 및 TSX 설정
    {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: [
                    '@babel/preset-env',
                    ['@babel/preset-react', {
                        runtime: 'automatic',
                        development: isDevelopment,
                    }],
                    '@babel/preset-typescript',
                ],
            },
        },
    },
    //{
    //    test: /\.[jt]sx?$/,
    //    exclude: /node_modules/,
    //    use: {
    //        loader: 'babel-loader',
    //        options: {
    //            presets: [
    //                '@babel/preset-env',
    //                [
    //                    '@babel/preset-react',
    //                    {
    //                        runtime: 'automatic',
    //                        development: isDevelopment,
    //                    },
    //                ],
    //                '@babel/preset-typescript',
    //            ],
    //        },
    //    },
    //},
    {
        test: /\.css$/,
        use: [
            'style-loader',
            'css-loader',
            'postcss-loader'
        ]
    }
];