const CopyPlugin = require('copy-webpack-plugin');
const swaggerUiModulePath = path.dirname(require.resolve('swagger-ui-dist'));

module.exports = (options, webpack) => {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    'class-transformer/storage',
  ];

  return {
    ...options,
    externals: [],
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
      new CopyPlugin({
        patterns: [
          {
            from: `${swaggerUiModulePath}/swagger-ui.css`,
            to: 'src/swagger-ui.css',
          },
          {
            from: `${swaggerUiModulePath}/swagger-ui-bundle.js`,
            to: 'src/swagger-ui-bundle.js',
          },
          {
            from: `${swaggerUiModulePath}/swagger-ui-standalone-preset.js`,
            to: 'src/swagger-ui-standalone-preset.js',
          },
          {
            from: `${swaggerUiModulePath}/favicon-32x32.png`,
            to: 'src/favicon-32x32.png',
          },
          {
            from: `${swaggerUiModulePath}/favicon-16x16.png`,
            to: 'src/favicon-16x16.png',
          },
          {
            from: `${swaggerUiModulePath}/oauth2-redirect.html`,
            to: 'src/oauth2-redirect.html',
          },
        ],
      }),
    ],
  };
};
