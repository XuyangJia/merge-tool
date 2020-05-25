'use strict'
const port = process.env.port || process.env.npm_config_port || 8080 // dev port
module.exports = {
  publicPath: '/bin/merge',
  outputDir: 'D:/meng52/Client/bin/merge',
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
      },
      '/kr': {
        target: 'http://kr.ptkill.com/',
        changeOrigin: true,
        pathRewrite: {
          '^/kr': '/'
        }
      },
      '/hk': {
        target: 'http://hk.ptkill.com/',
        changeOrigin: true,
        pathRewrite: {
          '^/hk': '/'
        }
      },
      '/jpn': {
        target: 'http://jpn.ptkill.com/',
        changeOrigin: true,
        pathRewrite: {
          '^/jpn': '/'
        }
      },
      '/war': {
        target: 'http://war.ptkill.com/',
        changeOrigin: true,
        pathRewrite: {
          '^/war': '/'
        }
      },
      '/war37': {
        target: 'http://war37.ptkill.com/',
        changeOrigin: true,
        pathRewrite: {
          '^/war37': '/'
        }
      },
      '/local': {
        target: 'http://192.168.1.128:8888/',
        changeOrigin: true,
        pathRewrite: {
          '^/local': '/'
        }
      }
    }
  }
}
