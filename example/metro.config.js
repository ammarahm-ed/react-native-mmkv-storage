const blacklist = require('metro-config/src/defaults/exclusionList');
const path = require('path');

const glob = require('glob-to-regexp');

function getBlacklist() {
  const nodeModuleDirs = [
    glob(`${path.resolve(__dirname, '..')}/node_modules/*`),
    glob(`${path.resolve(__dirname, '..')}/docs/*`),
    glob(
      `${path.resolve(__dirname)}/node_modules/*/node_modules/lodash.isequal/*`,
    ),
    glob(
      `${path.resolve(
        __dirname,
      )}/node_modules/*/node_modules/hoist-non-react-statics/*`,
    ),
    glob(
      `${path.resolve(
        __dirname,
      )}/node_modules/react-native/node_modules/@babel/*`,
    ),
  ];
  return blacklist(nodeModuleDirs);
}

const watchFolders = [path.resolve(__dirname), path.resolve(__dirname, '..')];

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    blacklistRE: getBlacklist(),
    extraNodeModules: new Proxy(
      {},
      {get: (_, name) => path.resolve('.', 'node_modules', name)},
    ),
  },
  watchFolders,
};
