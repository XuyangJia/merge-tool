'use strict'
const port = process.env.port || process.env.npm_config_port || 8080 // dev port
module.exports = {
  publicPath: '/bin/merge',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/sg3': {
        target: 'http://sg3.ptkill.com/',
        changeOrigin: true,
        pathRewrite: {
          '^/sg3': '/'
        }
      },
      '/qh': {
        target: 'http://qh.ptkill.com/',
        changeOrigin: true,
        pathRewrite: {
          '^/qh': '/'
        }
      }
    }
  }
}
