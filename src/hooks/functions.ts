import { handleAction } from '../handlers';
import MMKVInstance from '../mmkvinstance';
import mmkvJsiModule from '../module';
import { methods, types } from './constants';

export type InitialState = { value: any; type: string | null };

export const getDataType = (value: any) => {
  if (value === null || value === undefined) return null;
  let type = Array.isArray(value) ? 'array' : typeof value;
  return type;
};

const getValueType = (key: string, storage: MMKVInstance) => {
  if (mmkvJsiModule.getValueTypeMMKV) {
    return handleAction(mmkvJsiModule.getValueTypeMMKV, key, storage.instanceID) || null;
  }

  if (!storage.indexer.hasKey(key)) return null;

  for (let i = 0; i < types.length; i++) {
    const type: string = types[i];
    //@ts-ignore
    if (storage.indexer[methods[type].indexer].hasKey(key)) return type;
  }

  return null;
};

export const getInitialState = (key: string, storage: MMKVInstance): InitialState => {
  if (!storage?.indexer) return { value: null, type: null };

  const type = getValueType(key, storage);
  if (!type) return { value: null, type: null };

  //@ts-ignore
  return { value: storage[methods[type]['get']](key), type };
};

export const getInitialValue =
  (key: string, storage: MMKVInstance, initialValueType: 'type' | 'value') => () => {
    const state = getInitialState(key, storage);
    return initialValueType === 'type' ? state.type : state.value;
  };
