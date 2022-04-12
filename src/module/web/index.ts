import { Callback, MMKVJsiModule } from '../../types';
import encryption, { EncryptedData } from './encryption';
import localforage from 'localforage';
import { options } from '../../utils';

const drivers = [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE];

const instances: { [name: string]: LocalForage } = {};

function kv(id: string) {
  return instances[id];
}

const cryptKeys: { [alias: string]: CryptoKey } = {};

function saveEncryptedValue(
  mmkv: LocalForage,
  key: string,
  value: string,
  id: string,
  callback: (value: boolean) => void
) {
  const alias = options[id].alias;
  let cryptoKey = cryptKeys[alias];
  if (cryptoKey) {
    encryption.encrypt(cryptoKey, value).then(cipher => {
      mmkv.setItem(key, cipher, () => {
        callback(true);
      });
    });
  } else {
    encryption.getSecureKeyAsync(alias).then(async cryptoKey => {
      if (!cryptoKey) {
        await encryption.setSecureKeyAsync(alias, options[alias].key);
        cryptoKey = await encryption.getSecureKeyAsync(alias);
      }
      cryptKeys[alias] = cryptoKey;
      encryption.encrypt(cryptoKey, value).then(cipher => {
        mmkv.setItem(key, cipher, () => {
          callback(true);
        });
      });
    });
  }
}

function getEncryptedValue<T>(mmkv: LocalForage, key: string, id: string, callback: Callback<T>) {
  const alias = options[id].alias;
  let cryptoKey = cryptKeys[alias];
  if (cryptoKey) {
    mmkv.getItem<EncryptedData>(key, (err, value) => {
      if (!value) callback(null);
      //@ts-ignore
      encryption.decrypt(cryptoKey, value).then(callback);
    });
  } else {
    encryption.getSecureKeyAsync(alias).then(async cryptoKey => {
      if (!cryptoKey) {
        await encryption.setSecureKeyAsync(alias, options[alias].key);
        cryptoKey = await encryption.getSecureKeyAsync(alias);
      }
      cryptKeys[alias] = cryptoKey;

      mmkv.getItem<EncryptedData>(key, (err, value) => {
        if (!value) callback(null);
        encryption.decrypt(cryptoKey, value).then(callback);
      });
    });
  }
}

const mmkvWebModule: MMKVJsiModule = {
  ...encryption,
  setupMMKVInstance: id => {
    instances[id] = localforage.createInstance({
      driver: drivers,
      name: id
    });
    return true;
  },
  setStringMMKV: (key, value, id, callback) => {
    const mmkv = kv(id);
    if (!mmkv) return undefined;
    const encrypted = options[id].initWithEncryption;
    if (encrypted) {
      saveEncryptedValue(mmkv, key, value, id, callback);
    } else {
      mmkv.setItem(key, value, () => {
        callback(true);
      });
    }

    return true;
  },
  getStringMMKV: (key, id, callback) => {
    const mmkv = kv(id);
    if (!mmkv) return undefined;
    const encrypted = options[id].initWithEncryption;
    if (encrypted) {
      getEncryptedValue(mmkv, key, id, callback);
    } else {
      mmkv.getItem<string>(key, (err, value) => {
        callback(value);
      });
    }

    return null;
  }
};

export default mmkvWebModule;

// generate a passowrd
// make password key
// use that key to encrypt original key
// store that key
