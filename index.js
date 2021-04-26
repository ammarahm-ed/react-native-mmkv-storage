import { NativeModules } from 'react-native';
import { ACCESSIBLE, MODES } from 'react-native-mmkv-storage/src/utils';
if (!global.getStringMMKV) {
  NativeModules.MMKVNative.installMMKV()
}
const Loader = require('./src/loader').default;

const MMKVStorage = {
  Loader:Loader,
  MODES: MODES,
  ACCESSIBLE : ACCESSIBLE,
  install: NativeModules.MMKVNative.installMMKV
}

export default MMKVStorage;

