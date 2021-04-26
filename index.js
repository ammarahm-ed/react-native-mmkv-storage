import { NativeModules } from 'react-native';
import { ACCESSIBLE, MODES } from 'react-native-mmkv-storage/src/utils';
if (!global.getStringMMKV) {
    setTimeout(()=> NativeModules.MMKVNative.installMMKV(),1) 
}

const Loader = require('./src/loader').default;

const MMKVStorage = {
  Loader:Loader,
  MODES: MODES,
  ACCESSIBLE : ACCESSIBLE,
  install:() => setTimeout(()=> NativeModules.MMKVNative.installMMKV(),1) 
}

export default MMKVStorage;

