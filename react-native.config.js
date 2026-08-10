/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      // Codegen artifacts are generated at build time by the app, so the
      // default cmakeListsPath (build/generated/source/codegen/jni/CMakeLists.txt)
      // is used on Android.
      android: {},
    },
  },
};
