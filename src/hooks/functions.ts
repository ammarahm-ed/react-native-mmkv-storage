import { handleAction } from '../handlers';
import MMKVInstance from '../mmkvinstance';
import mmkvJsiModule from '../module';
import { methods, types } from './constants';

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

export const getInitialValue =
  (key: string, storage: MMKVInstance, initialValueType: 'type' | 'value') => () => {
    if (!storage?.indexer) {
      return null;
    }

    const type = getValueType(key, storage);
    if (!type) return null;

    if (initialValueType === 'type') return type;

    //@ts-ignore
    return storage[methods[type]['get']](key);
  };
