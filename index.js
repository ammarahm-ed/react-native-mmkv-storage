import {useMMKVStorage as useMMKV} from "./src/hooks/useMMKV"
import { ACCESSIBLE, MODES } from './src/utils';
export const useMMKVStorage = useMMKV;
export const create = require("./src/hooks/useMMKV").create;

const Loader = require('./src/loader').default;

const MMKVStorage = {
  Loader:Loader,
  MODES: MODES,
  ACCESSIBLE : ACCESSIBLE,
}

export default MMKVStorage;

