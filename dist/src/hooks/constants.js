var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export var types = ['string', 'number', 'boolean', 'object', 'array'];
export var methods = {
    string: {
        indexer: 'strings',
        get: 'getString',
        set: 'setString',
        copy: function (value) {
            return value;
        }
    },
    number: {
        indexer: 'numbers',
        get: 'getInt',
        set: 'setInt',
        copy: function (value) {
            return value;
        }
    },
    boolean: {
        indexer: 'booleans',
        get: 'getBool',
        set: 'setBool',
        copy: function (value) {
            return value;
        }
    },
    object: {
        indexer: 'maps',
        get: 'getMap',
        set: 'setMap',
        copy: function (value) {
            return __assign({}, value);
        }
    },
    array: {
        indexer: 'arrays',
        get: 'getArray',
        set: 'setArray',
        copy: function (value) {
            return __spreadArray([], value, true);
        }
    }
};
