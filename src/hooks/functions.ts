import type { JsonReviver } from 'src/types';
import MMKVInstance from '../mmkvinstance';
import { methods, types } from './constants';
export const getDataType = (value: any) => {
  if (value === null || value === undefined) return null;
  let type = Array.isArray(value) ? 'array' : typeof value;
  return type;
};

export const getInitialValue =
  (key: string, storage: MMKVInstance, initialValueType: 'type' | 'value', reviver?: JsonReviver) =>
  () => {
    if (!storage?.indexer) {
      return null;
    }
    let indexer = storage.indexer;
    if (indexer.hasKey(key)) {
      for (let i = 0; i < types.length; i++) {
        let type: string = types[i];
        //@ts-ignore
        if (indexer[methods[type].indexer].hasKey(key)) {
          if (initialValueType === 'value') {
            const previousReviver = storage.reviver;
            if (reviver) {
              storage.reviver = reviver;
            }
            //@ts-ignore
            const value = storage[methods[type]['get']](key);
            // Falls back to default reviver avoiding it being overriden on
            // multiple `getInitialValue` calls
            storage.reviver = previousReviver;
            return value;
          }
          if (initialValueType === 'type') {
            return type;
          }
        }
      }
    }
    return null;
  };
