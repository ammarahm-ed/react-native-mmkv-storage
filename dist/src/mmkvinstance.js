var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import encryption from './encryption';
import EventManager from './eventmanager';
import { handleAction } from './handlers';
import indexer from './indexer/indexer';
import { getCurrentMMKVInstanceIDs } from './initializer';
import { default as IDStore } from './mmkv/IDStore';
import mmkvJsiModule from './module';
import transactions from './transactions';
import { options } from './utils';
function assert(type, value) {
    if (type === 'array') {
        if (!Array.isArray(value))
            throw new Error("Trying to set ".concat(typeof value, " as a ").concat(type, "."));
    }
    else {
        if (typeof value !== type)
            throw new Error("Trying to set ".concat(typeof value, " as a ").concat(type, "."));
    }
}
var MMKVInstance = /** @class */ (function () {
    function MMKVInstance(id) {
        var _this = this;
        /**
         * Set a string value to storage for the given key.
         */
        this.setString = function (key, value) {
            assert('string', value);
            var _value = _this.transactions.transact('string', 'beforewrite', key, value);
            assert('string', _value);
            var result = handleAction(mmkvJsiModule.setStringMMKV, key, _value, _this.instanceID);
            if (result) {
                _this.ev.publish("".concat(key, ":onwrite"), { key: key, value: _value });
                _this.transactions.transact('string', 'onwrite', key, _value);
            }
            return result;
        };
        /**
         * Get the string value for the given key.
         */
        this.getString = function (key, callback) {
            var string = handleAction(mmkvJsiModule.getStringMMKV, key, _this.instanceID);
            string = _this.transactions.transact('string', 'onread', key, string);
            callback && callback(null, string);
            return string;
        };
        /**
         * Set a number value to storage for the given key.
         */
        this.setInt = function (key, value) {
            assert('number', value);
            var _value = _this.transactions.transact('number', 'beforewrite', key, value);
            assert('number', _value);
            var result = handleAction(mmkvJsiModule.setNumberMMKV, key, _value, _this.instanceID);
            if (result) {
                _this.ev.publish("".concat(key, ":onwrite"), { key: key, value: _value });
                _this.transactions.transact('number', 'onwrite', key, _value);
            }
            return result;
        };
        /**
         * Get the number value for the given key
         */
        this.getInt = function (key, callback) {
            var int = handleAction(mmkvJsiModule.getNumberMMKV, key, _this.instanceID);
            int = _this.transactions.transact('number', 'onread', key, int);
            callback && callback(null, int);
            return int;
        };
        /**
         * Set a boolean value to storage for the given key
         */
        this.setBool = function (key, value) {
            assert('boolean', value);
            var _value = _this.transactions.transact('boolean', 'beforewrite', key, value);
            assert('boolean', _value);
            var result = handleAction(mmkvJsiModule.setBoolMMKV, key, _value, _this.instanceID);
            if (result) {
                _this.ev.publish("".concat(key, ":onwrite"), { key: key, value: value });
                _this.transactions.transact('boolean', 'onwrite', key, _value);
            }
            return result;
        };
        /**
         * Get the boolean value for the given key.
         */
        this.getBool = function (key, callback) {
            var bool = handleAction(mmkvJsiModule.getBoolMMKV, key, _this.instanceID);
            bool = _this.transactions.transact('boolean', 'onread', key, bool);
            callback && callback(null, bool);
            return bool;
        };
        /**
         * Set an Object to storage for a given key.
         *
         * Note that this function does **not** work with the Map data type
         */
        this.setMap = function (key, value) {
            assert('object', value);
            var _value = _this.transactions.transact('object', 'beforewrite', key, value);
            assert('object', _value);
            var result = handleAction(mmkvJsiModule.setMapMMKV, key, JSON.stringify(_value), _this.instanceID);
            if (result) {
                _this.ev.publish("".concat(key, ":onwrite"), { key: key, value: _value });
                _this.transactions.transact('object', 'onwrite', key, _value);
            }
            return result;
        };
        /**
         * Get an Object from storage for a given key.
         */
        this.getMap = function (key, callback) {
            var json = handleAction(mmkvJsiModule.getMapMMKV, key, _this.instanceID);
            try {
                if (json) {
                    var map = JSON.parse(json);
                    map = _this.transactions.transact('object', 'onread', key, map);
                    callback && callback(null, map);
                    return map;
                }
            }
            catch (e) { }
            _this.transactions.transact('object', 'onread', key);
            callback && callback(null, null);
            return null;
        };
        /**
         * Set an array to storage for the given key.
         */
        this.setArray = function (key, value) {
            assert('array', value);
            var _value = _this.transactions.transact('array', 'beforewrite', key, value);
            assert('array', _value);
            var result = handleAction(mmkvJsiModule.setArrayMMKV, key, JSON.stringify(value), _this.instanceID);
            if (result) {
                _this.ev.publish("".concat(key, ":onwrite"), { key: key, value: _value });
                _this.transactions.transact('array', 'onwrite', key, _value);
            }
            return result;
        };
        /**
         * get an array from the storage for give key.
         */
        this.getArray = function (key, callback) {
            var json = handleAction(mmkvJsiModule.getMapMMKV, key, _this.instanceID);
            try {
                if (json) {
                    var array = JSON.parse(json);
                    array = _this.transactions.transact('array', 'onread', key, array);
                    callback && callback(null, array);
                    return array;
                }
            }
            catch (e) { }
            _this.transactions.transact('array', 'onread', key);
            callback && callback(null, null);
            return null;
        };
        /**
         * Retrieve multiple items for the given array of keys.
         *
         */
        this.getMultipleItems = function (keys, type) {
            if (!type)
                type = 'object';
            var func = function () {
                //@ts-ignore
                var items = [];
                for (var i = 0; i < keys.length; i++) {
                    var item = [];
                    item[0] = keys[i];
                    switch (type) {
                        case 'string':
                            item[1] = mmkvJsiModule.getStringMMKV(keys[i], _this.instanceID);
                            break;
                        case 'boolean':
                            item[1] = mmkvJsiModule.getBoolMMKV(keys[i], _this.instanceID);
                            break;
                        case 'number':
                            item[1] = mmkvJsiModule.getNumberMMKV(keys[i], _this.instanceID);
                            break;
                        case 'object':
                        case 'map':
                            var map = mmkvJsiModule.getMapMMKV(keys[i], _this.instanceID);
                            if (map) {
                                try {
                                    item[1] = JSON.parse(map);
                                }
                                catch (e) {
                                    if (__DEV__) {
                                        console.warn(keys[i] + 'has a value that is not an object, returning null');
                                    }
                                    item[1] = null;
                                }
                            }
                            else {
                                item[1] = null;
                            }
                            break;
                        case 'array':
                            var array = mmkvJsiModule.getArrayMMKV(keys[i], _this.instanceID);
                            if (array) {
                                try {
                                    item[1] = JSON.parse(array);
                                }
                                catch (e) {
                                    if (__DEV__) {
                                        console.warn(keys[i] + 'has a value that is not an array, returning null');
                                    }
                                    item[1] = null;
                                }
                            }
                            else {
                                item[1] = null;
                            }
                            break;
                        default:
                            item[1] = null;
                            break;
                    }
                    //@ts-ignore
                    items.push(item);
                }
                return items;
            };
            handleAction(function () { return null; }, keys, _this.instanceID);
            return func();
        };
        this.instanceID = id;
        this.encryption = new encryption(id);
        this.indexer = new indexer(id);
        this.ev = new EventManager();
        this.transactions = new transactions();
        this.options = options[id];
    }
    /**
     * Set a string value to storage for the given key.
     * This method is added for redux-persist/zustand support.
     *
     */
    MMKVInstance.prototype.setItem = function (key, value) {
        return this.setStringAsync(key, value);
    };
    /**
     * Get the string value for the given key.
     * This method is added for redux-persist/zustand support.
     */
    MMKVInstance.prototype.getItem = function (key) {
        return this.getStringAsync(key);
    };
    /**
     * Set a string value to storage for the given key.
     */
    MMKVInstance.prototype.setStringAsync = function (key, value) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this.setString(key, value));
        });
    };
    /**
     * Get the string value for the given key.
     */
    MMKVInstance.prototype.getStringAsync = function (key) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this.getString(key));
        });
    };
    /**
     * Set a number value to storage for the given key.
     */
    MMKVInstance.prototype.setIntAsync = function (key, value) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this.setInt(key, value));
        });
    };
    /**
     * Get the number value for the given key.
     */
    MMKVInstance.prototype.getIntAsync = function (key) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this.getInt(key));
        });
    };
    /**
     * Set a boolean value to storage for the given key.
     *
     */
    MMKVInstance.prototype.setBoolAsync = function (key, value) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this.setBool(key, value));
        });
    };
    /**
     * Get the boolean value for the given key.
     */
    MMKVInstance.prototype.getBoolAsync = function (key) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this.getBool(key));
        });
    };
    /**
     * Set an Object to storage for the given key.
     *
     * Note that this function does **not** work with the Map data type.
     *
     */
    MMKVInstance.prototype.setMapAsync = function (key, value) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this.setMap(key, value));
        });
    };
    /**
     * Get then Object from storage for the given key.
     */
    MMKVInstance.prototype.getMapAsync = function (key) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this.getMap(key));
        });
    };
    /**
     * Retrieve multiple items for the given array of keys.
     */
    MMKVInstance.prototype.getMultipleItemsAsync = function (keys, type) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        resolve(_this.getMultipleItems(keys, type));
                    })];
            });
        });
    };
    /**
     * Set an array to storage for the given key.
     */
    MMKVInstance.prototype.setArrayAsync = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        resolve(_this.setArray(key, value));
                    })];
            });
        });
    };
    /**
     * Get the array from the storage for the given key.
     */
    MMKVInstance.prototype.getArrayAsync = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        resolve(_this.getArray(key));
                    })];
            });
        });
    };
    /**
     *
     * Get all Storage Instance IDs that are currently loaded.
     *
     */
    MMKVInstance.prototype.getCurrentMMKVInstanceIDs = function () {
        return getCurrentMMKVInstanceIDs();
    };
    /**
     *
     * Get all Storage Instance IDs.
     *
     */
    MMKVInstance.prototype.getAllMMKVInstanceIDs = function () {
        return IDStore.getAllMMKVInstanceIDs();
    };
    /**
     * Remove an item from storage for a given key.
     *
     */
    MMKVInstance.prototype.removeItem = function (key) {
        var result = handleAction(mmkvJsiModule.removeValueMMKV, key, this.instanceID);
        if (result) {
            this.ev.publish("".concat(key, ":onwrite"), { key: key, value: null });
        }
        this.transactions.transact('string', 'ondelete', key);
        return result;
    };
    /**
     * Remove all keys and values from storage.
     */
    MMKVInstance.prototype.clearStore = function () {
        var _this = this;
        var keys = handleAction(mmkvJsiModule.getAllKeysMMKV, this.instanceID);
        var cleared = handleAction(mmkvJsiModule.clearMMKV, this.instanceID);
        mmkvJsiModule.setBoolMMKV(this.instanceID, true, this.instanceID);
        keys === null || keys === void 0 ? void 0 : keys.forEach(function (key) { return _this.ev.publish("".concat(key, ":onwrite"), { key: key }); });
        return cleared;
    };
    /**
     * Get the key and alias for the encrypted storage
     */
    MMKVInstance.prototype.getKey = function () {
        var _a = options[this.instanceID], alias = _a.alias, key = _a.key;
        return { alias: alias, key: key };
    };
    /**
     * Clear memory cache of the current MMKV instance
     */
    MMKVInstance.prototype.clearMemoryCache = function () {
        var cleared = handleAction(mmkvJsiModule.clearMemoryCache, this.instanceID);
        return cleared;
    };
    return MMKVInstance;
}());
export default MMKVInstance;
