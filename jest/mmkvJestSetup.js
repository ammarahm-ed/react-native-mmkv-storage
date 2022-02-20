if (!global.__fbBatchedBridgeConfig) {
  global.__fbBatchedBridgeConfig = {};
}

if (!global.__turboModuleProxy) {
  global.__turboModuleProxy = name => {
    return {};
  };
}

require('react-native').NativeModules.MMKVNative = {
  install: jest.fn(() => true)
};
