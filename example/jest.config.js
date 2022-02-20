module.exports = {
  preset: 'react-native',
  setupFiles: [
    './node_modules/react-native-mmkv-storage/jest/mmkvJestSetup.js',
  ],
  transformIgnorePatterns: ['/!node_modules\\/react-native-mmkv-storage/'],
};
