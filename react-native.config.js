module.exports = {
  dependency: {
    platforms: {
      android: {},
      desktop: {
        cmake: "desktop",
        crate: "rn-gpui-mmkv-secure",
        path: "desktop/secure",
        cppProvider: "create_mmkv_storage_module"
      }
    }
  }
};
