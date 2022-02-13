import { methods, types } from './constants';
export var getDataType = function (value) {
    if (value === null || value === undefined)
        return null;
    var type = Array.isArray(value) ? 'array' : typeof value;
    return type;
};
export var getInitialValue = function (key, storage, initialValueType) { return function () {
    if (!(storage === null || storage === void 0 ? void 0 : storage.indexer)) {
        return null;
    }
    var indexer = storage.indexer;
    if (indexer.hasKey(key)) {
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            //@ts-ignore
            if (indexer[methods[type].indexer].hasKey(key)) {
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
}; };
