const path = require('path');

const svgSpriteDirs = [
  path.resolve(__dirname, 'src/svg/'),
  require.resolve('antd').replace(/index\.js$/, ''),
];

export default {
  entry: 'src/index.js',
  hash: true,
  svgSpriteLoaderDirs: svgSpriteDirs,
  // "publicPath": "/fc-crm-web/",
  autoprefixer: null,
  theme: './theme.config.js',
  cssModulesExclude: ['./public/crm/iconfont.css', './src/assets/icomoon.css'],
  dllPlugin: {
    exclude: ['babel-runtime', 'roadhog', 'corss-env'],
    include: ['dva/router', 'dva/saga', 'dva/fetch'],
  },
  env: {
    development: {
      extraBabelPlugins: [
        'dva-hmr',
        'transform-runtime',
        ['import', { libraryName: 'antd', style: true }],
      ],
    },
    production: {
      extraBabelIncludes: ['node_modules/react-vertical-timeline-component'],
      extraBabelPlugins: ['transform-runtime', ['import', { libraryName: 'antd', style: true }]],
    },
  },
};
