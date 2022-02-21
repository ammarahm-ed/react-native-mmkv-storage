//@ts-ignore
var mmkvJsiModule = global;
var SECURE_KEYSTORE = {};
var MEMORY_STORE = {};
export var unmock = function () {
    //@ts-ignore
    mmkvJsiModule.getStringMMKV = undefined;
    SECURE_KEYSTORE = {};
    MEMORY_STORE = {};
    return true;
};
export var mock = function () {
    SECURE_KEYSTORE = {};
    MEMORY_STORE = {};
    mmkvJsiModule.setupMMKVInstance = function (id) {
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
    mmkvJsiModule.setMMKVServiceName = function (alias, serviceName) {
        return serviceName;
    };
    mmkvJsiModule.getSecureKey = function (alias) {
        return SECURE_KEYSTORE[alias];
    };
    mmkvJsiModule.setSecureKey = function (alias, key) {
        SECURE_KEYSTORE[alias] = key;
        return true;
    };
    mmkvJsiModule.secureKeyExists = function (alias) {
        return Object.keys(SECURE_KEYSTORE).includes(alias);
    };
    mmkvJsiModule.removeSecureKey = function (alias) {
        delete SECURE_KEYSTORE[alias];
        return true;
    };
    mmkvJsiModule.clearMMKV = function (id) {
        mmkvJsiModule.setupMMKVInstance(id);
        return true;
    };
    mmkvJsiModule.clearMemoryCache = function () {
        return true;
    };
    mmkvJsiModule.decryptMMKV = function () {
        return true;
    };
    mmkvJsiModule.encryptMMKV = function () {
        return true;
    };
    mmkvJsiModule.containsKeyMMKV = function (key, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        return Object.keys(MEMORY_STORE[id].storage).includes(key);
    };
    mmkvJsiModule.getIndexMMKV = function (type, id) {
        if (!MEMORY_STORE[id])
            return [];
        return MEMORY_STORE[id].indexes[type];
    };
    mmkvJsiModule.removeValueMMKV = function (key, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        delete MEMORY_STORE[id].storage[key];
        Object.keys(MEMORY_STORE[id].indexes).forEach(function (indexKey) {
            //@ts-ignore
            var index = MEMORY_STORE[id].indexes[indexKey];
            if (index.includes(key)) {
                index.splice(index.indexOf(key), 1);
            }
        });
        return true;
    };
    var updateIndex = function (key, indexType, id) {
        var index = MEMORY_STORE[id].indexes[indexType];
        if (!index.includes(key)) {
            index.push(key);
        }
    };
    mmkvJsiModule.setStringMMKV = function (key, value, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        MEMORY_STORE[id].storage[key] = value;
        updateIndex(key, 'stringIndex', id);
        return true;
    };
    mmkvJsiModule.getStringMMKV = function (key, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        var value = MEMORY_STORE[id].storage[key];
        if (!value)
            return null;
        return value;
    };
    mmkvJsiModule.setNumberMMKV = function (key, value, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        MEMORY_STORE[id].storage[key] = value;
        updateIndex(key, 'numberIndex', id);
        return true;
    };
    mmkvJsiModule.getNumberMMKV = function (key, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        var value = MEMORY_STORE[id].storage[key];
        if (!value)
            return null;
        return value;
    };
    mmkvJsiModule.setBoolMMKV = function (key, value, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        MEMORY_STORE[id].storage[key] = value;
        updateIndex(key, 'boolIndex', id);
        return true;
    };
    mmkvJsiModule.getBoolMMKV = function (key, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        var value = MEMORY_STORE[id].storage[key];
        if (!value)
            return null;
        return value;
    };
    mmkvJsiModule.setMapMMKV = function (key, value, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        MEMORY_STORE[id].storage[key] = value;
        updateIndex(key, 'mapIndex', id);
        return true;
    };
    mmkvJsiModule.getMapMMKV = function (key, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        var value = MEMORY_STORE[id].storage[key];
        if (!value)
            return null;
        return value;
    };
    mmkvJsiModule.setArrayMMKV = function (key, value, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        MEMORY_STORE[id].storage[key] = value;
        updateIndex(key, 'arrayIndex', id);
        return true;
    };
    mmkvJsiModule.getArrayMMKV = function (key, id) {
        if (!MEMORY_STORE[id])
            return undefined;
        var value = MEMORY_STORE[id].storage[key];
        if (!value)
            return null;
        return value;
    };
    mmkvJsiModule.getAllKeysMMKV = function (id) {
        if (!MEMORY_STORE[id])
            return undefined;
        return Object.keys(MEMORY_STORE[id].storage);
    };
    mmkvJsiModule.setupMMKVInstance('mmkvIdStore');
    return true;
};
