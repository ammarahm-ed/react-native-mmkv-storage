import { ACCESSIBLE, MODES } from 'react-native-mmkv-storage/src/utils';

const Loader = require('./src/loader').default;

const MMKVStorage = {
  Loader:Loader,
  MODES: MODES,
  ACCESSIBLE : ACCESSIBLE
}

export default MMKVStorage;

