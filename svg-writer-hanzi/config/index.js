/*
 * @Author: your name
 * @Date: 2020-05-17 12:32:46
 * @LastEditTime: 2020-05-20 17:35:04
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /config/index.js
 */ 
'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path');
const env = require('yargs').argv.env;
const envConfig = env ? require('./prod.env')[env] : require('./dev.env');
const assetsPublicPath = envConfig.cdnPath.replace(/'|"/g, '');
const proxyUrl = envConfig.baseURL.replace(/'|"/g, '');

module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: assetsPublicPath,
    proxyTable: {
      '/dev/api': {
        target: proxyUrl,
        secure: true,  // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        pathRewrite: {
          '^/dev': ''
        }
      },
    },

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8081, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-


    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true,
    useEslint: true,
    showEslintErrorsInOverlay: false,
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../mweb/mweb/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../mweb/mweb/'),
    assetsSubDirectory: 'static',
    assetsPublicPath: assetsPublicPath,

    /**
     * Source Maps
     */

    productionSourceMap: false,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: true,
    productionGzipExtensions: ['js', 'css'],
    useEslint:true,
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
