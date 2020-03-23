# Nuxt-Micro-Frontend

[📖 **Release Notes**](./CHANGELOG.md)

## Setup

1. Add `@eh5/nuxt-micro-frontend-ilc` dependency to your project

```bash
yarn add @eh5/nuxt-micro-frontend-ilc -D 

# or npm install @eh5/nuxt-micro-frontend-ilc
```

2. Add `@eh5/nuxt-micro-frontend-ilc` to the `modules` section of `nuxt.config.js`

```js
{
  modules: [
    // Simple usage
    '@eh5/nuxt-micro-frontend-ilc',

    // With options
    ['@eh5/nuxt-micro-frontend-ilc', { /* module options */ }]
  ]
}
```

3. enable `extractCSS` if you have css files defined in config

```js
{
  // ...
  css: [
    'element-ui/lib/theme-chalk/index.css'
    // ...
  ],
  build: {
    extractCSS: true
  }
  // ...
}
```

## Module Options

[Documents](https://github.com/lianghx-319/micro-nuxt/blob/master/lib/module.js)

**path**: the MFE lifecycle hook file path relative to rootDir

**force**: skip version check and force to use this module

**unique**: If use qiankun, sub application's package name should unique. Set unique to true can create a unique umd target.

**publicPath**: publicPath (default '/__nuxt/')

**hotPublicPath**: HMR publicPath (default '')

## Support Micro Front-End Framework
- [x] [ilc](https://github.com/namecheap/ilc)

## LifeCycle hooks file example
[example/mfe.js](example/mfe.js)

- add `mounted` and `beforeUnmount` hook to get vue instance

## Development

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Start development server using `npm run dev`

## License

[MIT License](./LICENSE)
