import {useMMKVStorage as useMMKV} from "./src/hooks/useMMKV"
import { ACCESSIBLE, MODES } from 'react-native-mmkv-storage/src/utils';
export const useMMKVStorage = useMMKV;

const Loader = require('./src/loader').default;

const MMKVStorage = {
  Loader:Loader,
  MODES: MODES,
  ACCESSIBLE : ACCESSIBLE,
}

export default MMKVStorage;

