import MMKVInstance from '../mmkvinstance';
import { methods, types } from './constants';
export const getDataType = (value: any) => {
  if (value === null || value === undefined) return null;
  let type = Array.isArray(value) ? 'array' : typeof value;
  return type;
};

export const getInitialValue =
  (key: string, storage: MMKVInstance, initialValueType: 'type' | 'value') => () => {
    if (!storage?.indexer) {
      return null;
    }
    let indexer = storage.indexer;
    if (indexer.hasKey(key)) {
      for (let i = 0; i < types.length; i++) {
        let type: string = types[i];
        //@ts-ignore
        if (indexer.hasKey(key)) {
          if (initialValueType === 'value') {
            //@ts-ignore
            return storage[methods[type]['get']](key);
          }
          if (initialValueType === 'type') {
            return type;
          }
        }
      }
    }
    return null;
  };
