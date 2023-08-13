'use strict'
const CompressionPlugin = require('compression-webpack-plugin')
const PostCompilePlugin = require('webpack-post-compile-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const Webpack = require('webpack')

module.exports = {
    transpileDependencies: [
        'vuetify'
    ],
    productionSourceMap: false,
    // vue 2.0 设置跨域
    devServer: {
        proxy: {
            '/_api': {
                target: process.env.VUE_APP_API_HOST, // 目标地址
                changeOrigin: true,
                pathRewrite: {
                    '^/_api': '' // 将目标地址变成这个
                }
            },
            '/_file': {
                target: process.env.VUE_APP_API_HOST,
                changeOrigin: true,
                pathRewrite: {
                    '^/_file': ''
                }
            },
            '/_imgbb': {
                target: 'https://api.imgbb.com',
                changeOrigin: true,
                pathRewrite: {
                    '^/_imgbb': ''
                }
            },
        },
    },
    configureWebpack: () => {
        // provide the app's title in webpack's name field, so that
        // it can be accessed in index.html to inject the correct title.
        const config = {
            name: '三叶草',
            plugins: [
                new PostCompilePlugin(),
                // moment这个库中，如果引用了./locale/目录的内容，就忽略掉，不会打包进去
                new Webpack.IgnorePlugin(/\.\/locale/, /moment/),
                // new BundleAnalyzerPlugin()
            ]
        }
        if (process.env.NODE_ENV === 'production') {
            config.plugins.push(new CompressionPlugin({
                test: /\.js$|\.html$|\.css$|\.jpg$|\.jpeg$|\.png/, // 需要压缩的文件类型
                threshold: 10240, // 归档需要进行压缩的文件大小最小值，我这个是10K以上的进行压缩
                deleteOriginalAssets: false // 是否删除原文件
            }))
        }
        return config
    }
}
