const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { getConfig } = require('react-native-builder-bob/metro-config');
const pkg = require('../package.json');
const root = path.resolve(__dirname, '..');

const config = getConfig(getDefaultConfig(__dirname), {
  root,
  pkg,
  project: __dirname
});

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react') {
        return {
          filePath: path.resolve(path.join(__dirname, '../node_modules', 'react', 'index.js')),
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
};
