global.__fbBatchedBridgeConfig = {};
global.__turboModuleProxy = name => {
  return {};
};

require('react-native').NativeModules.MMKVNative = {
  install: jest.fn(() => true),
};
