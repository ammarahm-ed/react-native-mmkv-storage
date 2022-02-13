import { Platform } from 'react-native';
import mmkvJsiModule from '../module';
var STORE_ID = Platform.OS === 'ios' ? 'mmkvIdStore' : 'mmkvIDStore';
/**
 *	Store instance properties that we will use later to
 *  load the storage again.
 */
function add(id, encrypted, alias) {
    var storeUnit = {
        id: id,
        encrypted: encrypted,
        alias: alias
    };
    mmkvJsiModule.setStringMMKV(id, JSON.stringify(storeUnit), STORE_ID);
}
/**
 * Check if the storage instance with the given ID is encrypted or not.
 */
function encrypted(id) {
    var json = mmkvJsiModule.getStringMMKV(id, STORE_ID);
    if (!json) {
        return false;
    }
    var storeUnit = JSON.parse(json);
    return storeUnit.encrypted;
}
/**
 * Get the alias for the storage which we used
 * to store the crypt key in secure storage.
 * @param {string} id instance id
 */
function getAlias(id) {
    var json = mmkvJsiModule.getStringMMKV(id, STORE_ID);
    if (!json) {
        return null;
    }
    var storeUnit = JSON.parse(json);
    return storeUnit.alias;
}
/**
 * Check if an instance is already present in the store.
 * @param {string} id instance id
 */
function exists(id) {
    var json = mmkvJsiModule.getStringMMKV(id, STORE_ID);
    if (!json) {
        return false;
    }
    return true;
}
var blacklist = ['stringIndex'];
/**
 * Get all the available instances that
 * were loaded since the app was installed.
 */
function getAll() {
    var keys = mmkvJsiModule.getAllKeysMMKV(STORE_ID);
    if (!keys)
        return [];
    var storeUnits = {};
    keys.forEach(function (key) {
        if (!blacklist.includes(key)) {
            var json = mmkvJsiModule.getStringMMKV(key, STORE_ID);
            if (json) {
                var storeUnit = JSON.parse(json);
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
    getAll: getAll,
    getAlias: getAlias,
    getAllMMKVInstanceIDs: getAllMMKVInstanceIDs,
    add: add,
    exists: exists,
    encrypted: encrypted,
    STORE_ID: STORE_ID
};
