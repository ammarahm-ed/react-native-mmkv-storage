export let useMMKVDevTools: typeof import('./src/react-native/useMMKVDevTools').useMMKVDevTools;

const isWeb = typeof window !== 'undefined' && window.navigator.product !== 'ReactNative';
const isDev = process.env.NODE_ENV !== 'production';
const isServer = typeof window === 'undefined';

if (isDev && !isWeb && !isServer) {
  useMMKVDevTools = require('./src/react-native/useMMKVDevTools').useMMKVDevTools;
} else {
  useMMKVDevTools = () => null;
}

export type { MMKVDevToolsOptions } from './src/react-native/useMMKVDevTools';
export type { MMKVEntry, MMKVEntryType, MMKVEntryValue } from './src/shared/types';
