
// Node.js 및 환경변수 관련
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Webpack 플러그인 관련
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async (webpackEnv = {}, argv = {}) => {
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
            `[Webpack] Environment loading failed: ${envPath}`
        );
    }

    // 3. 환경변수 로딩 이후 Federation 설정 가져오기
    const { default: mf } = await import(
        './federation/federation.config.mjs'
    );

    // 4. Remote 번들 형식 결정
    const isModule = mf.env.remoteFormat === 'module';

    console.log('[Webpack] Remote Configuration:', {
        mode,
        appName: mf.name,
        appPort: mf.env.appPort,
        remoteFormat: isModule,
        outputModule: isModule
    });

    return {
        mode,

        // Entry
        //entry: './src/main.jsx',
        entry: ['./src/components/ui/Button.tsx', './src/components/ThemeInjector.tsx'],

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
                    //test: /\.jsx?$/,
                    test: /\.(j|t)sx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                ['@babel/preset-react', { runtime: 'automatic' }], // React 18+ 자동 런타임 대응
                                '@babel/preset-typescript', // TypeScript(TSX) 컴파일 프리셋
                            ]
                        }
                    }
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
