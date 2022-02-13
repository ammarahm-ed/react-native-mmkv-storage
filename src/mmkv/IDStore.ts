import { Platform } from 'react-native';
import mmkvJsiModule from '../module';
const STORE_ID = Platform.OS === 'ios' ? 'mmkvIdStore' : 'mmkvIDStore';

export type StorageInstanceInfo = {
  encrypted: boolean;
  id: string;
  alias: string;
};
/**
 *	Store instance properties that we will use later to
 *  load the storage again.
 */
function add(id: string, encrypted?: boolean, alias?: string | null) {
  let storeUnit = {
    id,
    encrypted,
    alias
  };
  mmkvJsiModule.setStringMMKV(id, JSON.stringify(storeUnit), STORE_ID);
}

/**
 * Check if the storage instance with the given ID is encrypted or not.
 */
function encrypted(id: string) {
  let json = mmkvJsiModule.getStringMMKV(id, STORE_ID);
  if (!json) {
    return false;
  }
  let storeUnit: StorageInstanceInfo = JSON.parse(json);
  return storeUnit.encrypted;
}

/**
 * Get the alias for the storage which we used
 * to store the crypt key in secure storage.
 * @param {string} id instance id
 */
function getAlias(id: string) {
  let json = mmkvJsiModule.getStringMMKV(id, STORE_ID);
  if (!json) {
    return null;
  }
  let storeUnit: StorageInstanceInfo = JSON.parse(json);
  return storeUnit.alias;
}

/**
 * Check if an instance is already present in the store.
 * @param {string} id instance id
 */
function exists(id: string) {
  let json = mmkvJsiModule.getStringMMKV(id, STORE_ID);
  if (!json) {
    return false;
  }
  return true;
}

let blacklist = ['stringIndex'];
/**
 * Get all the available instances that
 * were loaded since the app was installed.
 */
function getAll() {
  let keys = mmkvJsiModule.getAllKeysMMKV(STORE_ID);
  if (!keys) return [];
  let storeUnits: { [name: string]: StorageInstanceInfo } = {};
  keys.forEach(key => {
    if (!blacklist.includes(key)) {
      let json = mmkvJsiModule.getStringMMKV(key, STORE_ID);
      if (json) {
        let storeUnit: StorageInstanceInfo = JSON.parse(json);
        storeUnits[key] = storeUnit;
      }
    }
  });
  return storeUnits;
}

/**
 * Get all the instance ids for instances
 * that were loaded since the app was installed
 */
function getAllMMKVInstanceIDs() {
  return Object.keys(getAll());
}

export default {
  getAll,
  getAlias,
  getAllMMKVInstanceIDs,
  add,
  exists,
  encrypted,
  STORE_ID
};
