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
import { useCallback, useEffect, useRef, useState } from 'react';
import { methods } from './constants';
import { getDataType, getInitialValue } from './functions';
/**
 * A helper function which returns `useMMKVStorage` hook with a storage instance set.
 *
 * ```tsx
 * import MMKVStorage, {create} from "react-native-mmkv-storage"
 *
 * const storage = new MMKVStorage.Loader().initialize();
 * const useStorage = create(storage);
 *
 * // Then later in your component
 * const App = () => {
 *  const [value, setValue] = useStorage("key");
 *
 * ...
 * }
 * ```
 * Documentation: https://rnmmkv.vercel.app/#/usemmkvstorage
 *
 * @param storage The storage instance
 * @returns `useMMKVStorage` hook
 */
export var create = function (storage) {
    return function (key, defaultValue) {
        if (!key || typeof key !== 'string' || !storage)
            throw new Error('Key and Storage are required parameters.');
        return useMMKVStorage(key, storage, defaultValue);
    };
};
/**
 *
 * useMMKVStorage Hook is like a persisted state that will always write every change in storage and update your app UI instantly.
 * It doesn’t matter if you reload the app or restart it. Everything will be in place on app load.
 *
 * ```tsx
 * import MMKVStorage from "react-native-mmkv-storage"
 *
 * const MMKV = new MMKVStorage.Loader().initialize();
 *
 * // Then later in your component
 * const App = () => {
 * const [user, setUser] = useMMKVStorage("user", MMKV, "robert");
 *
 * ...
 * };
 * ```
 * Documentation: https://rnmmkv.vercel.app/#/usemmkvstorage
 *
 * @param key The key against which the hook should update
 * @param storage The storage instance
 * @param defaultValue Default value if any
 *
 * @returns `[value,setValue]`
 */
export var useMMKVStorage = function (key, storage, defaultValue) {
    var getValue = useCallback(getInitialValue(key, storage, 'value'), [key, storage]);
    var getValueType = useCallback(getInitialValue(key, storage, 'type'), [key, storage]);
    var _a = useState(getValue), value = _a[0], setValue = _a[1];
    var _b = useState(getValueType), valueType = _b[0], setValueType = _b[1];
    var prevKey = usePrevious(key);
    var prevStorage = usePrevious(storage);
    var prevValue = useRef(value);
    useEffect(function () {
        prevValue.current = value;
        if (storage.options.persistDefaults &&
            defaultValue !== undefined &&
            defaultValue !== null &&
            (value === null || value === undefined)) {
            setNewValue(defaultValue);
        }
    }, [value]);
    useEffect(function () {
        if (storage !== null) {
            // This check prevents getInitialValue from being called twice when this hook intially loads
            if (prevKey !== key || prevStorage !== storage) {
                setValue(getValue);
                setValueType(getValueType);
            }
            storage.ev.subscribe("".concat(key, ":onwrite"), updateValue);
        }
        return function () {
            if (storage != null) {
                storage.ev.unsubscribe("".concat(key, ":onwrite"), updateValue);
            }
        };
    }, [prevKey, key, prevStorage, storage, getValue, getValueType]);
    var updateValue = useCallback(function (event) {
        var type = getDataType(event.value);
        //@ts-ignore
        var _value = event.value ? methods[type]['copy'](event.value) : event.value;
        setValue(_value);
        setValueType(type);
    }, []);
    var setNewValue = useCallback(function (nextValue) { return __awaiter(void 0, void 0, void 0, function () {
        var updatedValue, _value, _valueType, _dataType;
        return __generator(this, function (_a) {
            updatedValue = nextValue;
            if (typeof nextValue === 'function') {
                if (nextValue.constructor.name === 'AsyncFunction') {
                    __DEV__ &&
                        console.warn("Attempting to use an async function as state setter is not allowed.");
                    return [2 /*return*/];
                }
                updatedValue = nextValue(prevValue.current || defaultValue);
            }
            _valueType = valueType;
            if (updatedValue === null || updatedValue === undefined) {
                storage.removeItem(key);
                _valueType = null;
            }
            else {
                _dataType = getDataType(updatedValue);
                if (_valueType && _dataType !== valueType) {
                    __DEV__ &&
                        console.warn("Trying to set a ".concat(_dataType, " value to hook for type ").concat(_valueType, " is not allowed."));
                    return [2 /*return*/];
                }
                if (!valueType) {
                    _valueType = _dataType;
                }
                _value = updatedValue;
                //@ts-ignore
                storage[methods[_valueType]['set']](key, _value);
            }
            //@ts-ignore
            setValue(_value);
            setValueType(_valueType);
            return [2 /*return*/];
        });
    }); }, [key, storage, valueType]);
    return [
        valueType === 'boolean' || valueType === 'number' ? value : value || defaultValue,
        setNewValue
    ];
};
function usePrevious(value) {
    var ref = useRef(value);
    useEffect(function () {
        ref.current = value;
    }, [value]);
    return ref.current;
}
