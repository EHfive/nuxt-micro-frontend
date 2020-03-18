const { resolve } = require('path')
const uniqueId = require('uniqid')
const isEmpty = require('lodash.isempty')
const { relativeTo } = require('@nuxt/utils')
const WrapperPlugin = require('wrapper-webpack-plugin')
const devalue = require('@nuxt/devalue')

// Because this module override the client.js copy from v2.11.0
// if nuxt official update client.js maybe some features won't work
// so enableVersion is a list of version which can use the same client.js
const enableVersion = ['2.11.0']

const checkVersion = (nuxtVersion = '', skip = false) => {
  return skip || enableVersion.includes(nuxtVersion)
}

/**
 * Nuxt module for micro frontend using such as single-SPA or qiankun
 *
 * @param {Object} moduleOptions
 * @param {string} [moduleOptions.path = 'mfe.js'] - the MFE lifecycle hook file path relative to rootDir
 * @param {boolean} [moduleOptions.force = false] - skip version check and force to use this module
 * @param {boolean} [moduleOptions.unique = false] - create a unique name scope under window in umd library
 */
module.exports = function (moduleOptions) {
  const { rootDir, MFE, buildDir } = this.options

  // MFE means micro frontend
  const options = ({
    ...MFE,
    ...moduleOptions
  })

  const getGlobalsContextName = () => {
    return this.nuxt.server.globals.context
  }

  const usingMFE = !isEmpty(options) || MFE === true

  const { path = 'mfe.js', force = false } = options

  const publicPath = options.publicPath || this.options.build.publicPath
  const hotPublicPath = options.hotPublicPath || ''

  options.path = relativeTo(buildDir, path)

  const APP = require(resolve(rootDir, 'package.json'))

  // eslint-disable-next-line prefer-const
  let { name = uniqueId('nuxt'), dependencies: { nuxt: nuxtVersion } } = APP

  if (!usingMFE || !checkVersion(nuxtVersion, force)) {
    return
  }

  if (options.unique) {
    name = uniqueId(name)
  }

  // extend webpack config to output umd library
  this.extendBuild((config, { isDev }) => {
    config.output.publicPath = publicPath
    if (config.name === 'client') {
      config.output = Object.assign(config.output, {
        filename: 'client.js',
        // library: `${name}-[name]`,
        libraryTarget: 'amd',
        jsonpFunction: `webpackJsonp_${name}`
      })
      config.optimization = Object.assign(config.optimization, {
        splitChunks: {
          chunks: 'all',
          minChunks: Infinity
        },
        runtimeChunk: false
      })
      config.plugins = [
        ...config.plugins,
        new WrapperPlugin({
          test: /client\.js$/, // only wrap output of bundle files with '.js' extension
          header: '(function(define){\n',
          footer: '\n})((window.ILC && window.ILC.define) || window.define);'
        })
      ]
    }
  })
  this.addTemplate({
    src: resolve(__dirname, 'client.ejs'),
    fileName: 'client.js',
    options
  })
  this.addTemplate({
    src: resolve(__dirname, 'views/app.template.html'),
    fileName: 'views/app.template.html',
    options
  })
  this.nuxt.hook('build:before', (nuxt, options) => {
    options.publicPath = publicPath
  })
  this.nuxt.hook('build:templates', (config) => {
    config.templateVars = Object.assign(config.templateVars, { MFE: options })
  })

  this.nuxt.hook('webpack:config', (webpackConfigs) => {
    const clientConfig = webpackConfigs.find(({ name }) => name === 'client')
    clientConfig.entry.app.some((src, idx) => {
      if (!src.startsWith('webpack-hot-middleware')) {
        return false
      }
      clientConfig.entry.app[idx] = src.replace('/__webpack_hmr', hotPublicPath + '/__webpack_hmr')
      return true
    })
  })

  this.nuxt.hook('render:before', (renderer, options) => {
    options.injectScripts = false
  })

  this.nuxt.hook('render:route', (url, result, context) => {
    const { meta, res, nuxt } = context
    const serializedSession = `window.${getGlobalsContextName()}=${devalue(nuxt)};`
    res.setHeader('x-head-title', Buffer.from(meta.inject().title.text()).toString('base64'))
    res.setHeader('x-head-meta', Buffer.from(meta.inject().meta.text()).toString('base64'))
    result.html += `<script type="text/javascript">${serializedSession}</script><script
                    type="text/javascript"
                    >document.currentScript.previousElementSibling.remove();document.currentScript.remove()</script>`
  })
}

module.exports.meta = require('../package.json')
