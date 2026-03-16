const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'background/background': './background/background.ts',
    'content/base/content-script': './content/base/content-script.ts',
    'content/plm/plm-extractor': './content/plm/plm-extractor.ts',
    'content/plm/plm-interceptor': './content/plm/plm-interceptor.ts',
    'content/ts/ts-extractor': './content/ts/ts-extractor.ts',
    'content/ts/ts-interceptor': './content/ts/ts-interceptor.ts',
    'content/portal/portal-injector': './content/portal/portal-injector.ts',
    'popup/popup': './popup/popup.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './popup/popup.html',
      filename: 'popup/popup.html',
      chunks: ['popup/popup']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'icons', to: 'icons', noErrorOnMissing: true },
        { from: '_locales', to: '_locales', noErrorOnMissing: true }
      ]
    })
  ]
};
