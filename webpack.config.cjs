const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  ModuleFederationPlugin
} = require('@module-federation/enhanced/webpack');

const mf = require('./federation/federation.config');

module.exports = {
  mode: 'development',

  entry: './src/main.jsx',

  output: {
    publicPath: 'auto',
    uniqueName: 'remote_app',
    library: {
      type: 'var',
      name: mf.name
    },
    clean: true
  },

  devServer: {
    port: 5001,
    host: '0.0.0.0',
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },

  resolve: {
    extensions: ['.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-react', {
                runtime: 'automatic'
              }]
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

  plugins: [
    new ModuleFederationPlugin({
      name: mf.name,
      filename: mf.filename,
      library: {
        type: 'var',
        name: mf.name
      },
      exposes: mf.exposes,
      shared: mf.shared
    }),

    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
