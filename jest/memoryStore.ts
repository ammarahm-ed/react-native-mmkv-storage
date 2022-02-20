import { MMKVJsiModule, IndexType } from '../src/types/index';

type MemoryStore = {
  [name: string]: {
    indexes: {
      stringIndex: string[];
      boolIndex: string[];
      numberIndex: string[];
      mapIndex: string[];
      arrayIndex: string[];
    };
    storage: { [name: string]: any };
  };
};
//@ts-ignore
const mmkvJsiModule: MMKVJsiModule = global;

let SECURE_KEYSTORE: { [name: string]: string | null } = {};
let MEMORY_STORE: MemoryStore = {};

export const unmock = (): boolean => {
  //@ts-ignore
  mmkvJsiModule.getStringMMKV = undefined;
  SECURE_KEYSTORE = {};
  MEMORY_STORE = {};
  return true;
};

export const mock = (): boolean => {
  SECURE_KEYSTORE = {};
  MEMORY_STORE = {};
  mmkvJsiModule.setupMMKVInstance = id => {
    MEMORY_STORE[id] = {
      indexes: {
        stringIndex: [],
        boolIndex: [],
        numberIndex: [],
        mapIndex: [],
        arrayIndex: []
      },
      storage: {}
    };
    return true;
  };

  //@ts-ignore
  mmkvJsiModule.setMMKVServiceName = (alias, serviceName) => {
    return serviceName;
  };

  mmkvJsiModule.getSecureKey = alias => {
    return SECURE_KEYSTORE[alias];
  };

  mmkvJsiModule.setSecureKey = (alias, key) => {
    SECURE_KEYSTORE[alias] = key;
    return true;
  };

  mmkvJsiModule.secureKeyExists = alias => {
    return Object.keys(SECURE_KEYSTORE).includes(alias);
  };

  mmkvJsiModule.removeSecureKey = alias => {
    delete SECURE_KEYSTORE[alias];
    return true;
  };

  mmkvJsiModule.clearMMKV = id => {
    mmkvJsiModule.setupMMKVInstance(id);
    return true;
  };

  mmkvJsiModule.clearMemoryCache = () => {
    return true;
  };
  mmkvJsiModule.decryptMMKV = () => {
    return true;
  };

  mmkvJsiModule.encryptMMKV = () => {
    return true;
  };

  mmkvJsiModule.containsKeyMMKV = (key, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    return Object.keys(MEMORY_STORE[id].storage).includes(key);
  };

  mmkvJsiModule.getIndexMMKV = (type, id) => {
    if (!MEMORY_STORE[id]) return [];
    return MEMORY_STORE[id].indexes[type];
  };

  mmkvJsiModule.removeValueMMKV = (key, id) => {
    delete MEMORY_STORE[id].storage[key];

    Object.keys(MEMORY_STORE[id].indexes).forEach(key => {
      //@ts-ignore
      let index: string[] = MEMORY_STORE[id].indexes[key];
      if (index.includes(key)) {
        index.splice(index.indexOf(key), 1);
      }
    });

    return true;
  };

  const updateIndex = (key: string, indexType: IndexType, id: string) => {
    let index = MEMORY_STORE[id].indexes[indexType];
    if (!index.includes(key)) {
      index.push(key);
    }
  };

  mmkvJsiModule.setStringMMKV = (key, value, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    MEMORY_STORE[id].storage[key] = value;
    updateIndex(key, 'stringIndex', id);
    return true;
  };

  mmkvJsiModule.getStringMMKV = (key, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    let value = MEMORY_STORE[id].storage[key];
    if (!value) return null;
    return value;
  };

  mmkvJsiModule.setNumberMMKV = (key, value, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    MEMORY_STORE[id].storage[key] = value;
    updateIndex(key, 'numberIndex', id);
    return true;
  };

  mmkvJsiModule.getNumberMMKV = (key, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    let value = MEMORY_STORE[id].storage[key];
    if (!value) return null;
    return value;
  };

  mmkvJsiModule.setBoolMMKV = (key, value, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    MEMORY_STORE[id].storage[key] = value;
    updateIndex(key, 'boolIndex', id);
    return true;
  };

  mmkvJsiModule.getBoolMMKV = (key, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    let value = MEMORY_STORE[id].storage[key];
    if (!value) return null;
    return value;
  };

  mmkvJsiModule.setMapMMKV = (key, value, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    MEMORY_STORE[id].storage[key] = value;
    updateIndex(key, 'mapIndex', id);
    return true;
  };

  mmkvJsiModule.getMapMMKV = (key, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    let value = MEMORY_STORE[id].storage[key];
    if (!value) return null;
    return value;
  };

  mmkvJsiModule.setArrayMMKV = (key, value, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    MEMORY_STORE[id].storage[key] = value;
    updateIndex(key, 'mapIndex', id);
    return true;
  };

  mmkvJsiModule.getArrayMMKV = (key, id) => {
    if (!MEMORY_STORE[id]) return undefined;
    let value = MEMORY_STORE[id].storage[key];
    if (!value) return null;
    return value;
  };

  mmkvJsiModule.getAllKeysMMKV = id => {
    if (!MEMORY_STORE[id]) return undefined;
    return Object.keys(MEMORY_STORE[id].storage);
  };

  mmkvJsiModule.setupMMKVInstance('mmkvIdStore');
  return true;
};
