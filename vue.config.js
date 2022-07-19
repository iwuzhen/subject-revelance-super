const { defineConfig } = require("@vue/cli-service");

//生产环境标记
const IS_PRODUCTION = process.env.NODE_ENV === "production";

//配置引用cdn的js、css地址
const cdn = {
  css: [
    "https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/normalize/8.0.1/normalize.min.css",
    "https://cdn.staticfile.org/element-plus/2.2.8/index.min.css",
    "https://cdn.staticfile.org/font-awesome/6.1.1/css/all.css",
  ],
  js: [
    // 'https://cdn.staticfile.org/core-js/3.23.2/minified.min.js',
    "https://cdn.staticfile.org/vue/3.2.37/vue.global.min.js",
    "https://cdn.staticfile.org/vue-router/4.1.2/vue-router.global.min.js",
    "https://cdn.staticfile.org/axios/0.27.2/axios.min.js",
    "https://cdn.staticfile.org/element-plus/2.2.8/index.full.min.js",
    "https://cdn.staticfile.org/lodash.js/4.17.21/lodash.min.js",
    "https://cdn.staticfile.org/echarts/5.3.3/echarts.min.js",
    // "https://cdn.staticfile.org/pinia/2.0.16/pinia.iife.min.js",
  ],
};

//配置打包时使用CDN节点（加入externals外部扩展）， 忽略打包的第三方库
//左面放package.json中的扩展的名称,右面放项目依赖的名称(项目初始化要用的名称)
const externals = {
  // 属性名称 vue, 表示遇到 import xxx from 'vue' 这类引入 'vue'的，不去 node_modules 中找，而是去找全局变量 Vue（其他的为VueRouter、Vuex、axios、ELEMENT、echarts，注意全局变量是一个确定的值，不能修改为其他值，修改为其他大小写或者其他值会报错，若有异议可留言）
  // vue: 'Vue',
  vue: "Vue",
  "vue-router": "VueRouter",
  // vuex: "Vuex",
  axios: "axios",
  // pinia: "pinia",
  echarts: "echarts",
  "element-plus": "ElementPlus",
  lodash: "_",
  // diff2html: 'Diff2Html',
  // diff: 'Diff',
  // localforage: 'localforage',
  // d3: 'd3',
  // lodash: '_',
  // dayjs: 'dayjs',
  // THREE: 'three',
};

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    externals: IS_PRODUCTION ? externals : {},
  },
  chainWebpack(config) {
    config.plugin("html").tap((args) => {
      // if (!IS_PRODUCTION) {
      //   delete cdn["js"];
      // }
      args[0].cdn = cdn;
      return args;
    });
    //视为一个外部库，而不将它打包进来
    config.externals(externals);
  },
});
