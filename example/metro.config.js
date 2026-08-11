const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withRozenite } = require('@rozenite/metro');
const { getConfig } = require('react-native-builder-bob/metro-config');
const pkg = require('../package.json');
const root = path.resolve(__dirname, '..');

const config = getConfig(getDefaultConfig(__dirname), {
  root,
  pkg,
  project: __dirname
});

const mode = `${process.env.E2E_TEST ?? '0'}-${process.env.BENCHMARK ?? '0'}`;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
module.exports = withRozenite({
  ...config,
  cacheVersion: `${config.cacheVersion ?? 'mmkv-example'}-${mode}`,
  resolver: {
    ...config.resolver,
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react') {
        return {
          filePath: path.resolve(path.join(__dirname, 'node_modules', 'react', 'index.js')),
          type: 'sourceFile'
        };
      }

      if (moduleName === pkg.name) {
        return {
          filePath: path.resolve(path.join(__dirname, '../dist', 'index.js')),
          type: 'sourceFile'
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    }
  }
}, {
  enabled: process.env.NODE_ENV !== 'production'
});
