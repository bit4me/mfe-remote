// Node.js 및 환경변수 관련
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Rspack 플러그인 관련
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async (rspackEnv = {}, argv = {}) => {
    const mode = argv.mode || 'development';

    // 1. 환경변수 파일 경로
    const envPath = path.resolve(
        __dirname,
        mode === 'development' ? '.env.dev' : '.env'
    );

    // 2. 환경변수 로딩
    const result = dotenv.config({
        path: envPath,
        override: true
    });

    if (result.error) {
        throw new Error(
            `[Rspack] Environment loading failed: ${envPath}`
        );
    }

    // 3. 환경변수 로딩 이후 Federation 설정 가져오기
    const { default: mf } = await import(
        './federation/federation.config.mjs'
    );

    // 4. Remote 번들 형식 결정
    //const isModule = mf.library.type === 'module';
    const isModule = mf.env.remoteFormat === 'module';
    const isDevelopment = mode === 'development'

    console.log('[Rspack] Remote Configuration:', {
        mode,
        appName: mf.name,
        appPort: mf.env.appPort,
        remoteFormat: isModule,
        outputModule: isModule
    });

    return {
        mode,

        // 번들러 진입점.
        //entry: {}, //<-- 독립 실행용 entry 없음.
        entry: {
            //app: './src/main.jsx',                                //  <-- 02-02 용

            //app: './src/main.jsx',                                //  <-- 03-02 용: 버튼 나옴
        },

        // Output
        output: {
            publicPath: 'auto',
            uniqueName: mf.name,
            clean: true
        },

        // ESM 출력 설정
        experiments: {
            outputModule: isModule
        },

        // Development Server
        devServer: {
            port: mf.env.appPort,
            host: '0.0.0.0',
            historyApiFallback: true,

            headers: {
                'Access-Control-Allow-Origin': '*'
            },

            hot: mode === 'development'
        },

        // Resolve
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js']
        },

        // Module Rules
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loader: 'builtin:swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'ecmascript',
                                jsx: true
                            },
                            transform: {
                                react: {
                                    runtime: 'automatic',
                                    development: isDevelopment,
                                }
                            }
                        }
                    }
                },
                // TypeScript / TSX
                {
                    //test: /\.(j|t)sx?$/,
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    loader: 'builtin:swc-loader',

                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                                tsx: true,
                            },

                            transform: {
                                react: {
                                    runtime: 'automatic',
                                    development: isDevelopment,
                                },
                            },

                            target: 'es2020',
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'postcss-loader'
                    ]
                }
            ]
        },

        // Plugins
        plugins: [
            new ModuleFederationPlugin({
                name: mf.name,

                filename: mf.filename,

                library: mf.library,

                exposes: mf.exposes,

                shared: mf.shared,

                dts: mf.dts
            }),

            new HtmlWebpackPlugin({
                template: './src/index.html'
            })
        ]
    };
};
