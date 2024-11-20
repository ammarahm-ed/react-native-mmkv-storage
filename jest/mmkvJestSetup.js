if (!global.__fbBatchedBridgeConfig) {
  global.__fbBatchedBridgeConfig = {};
}

require('react-native').NativeModules.MMKVNative = {
  install: jest.fn(() => true)
};
