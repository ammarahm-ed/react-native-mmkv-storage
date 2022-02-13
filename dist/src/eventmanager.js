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
var EventManager = /** @class */ (function () {
    function EventManager() {
        this._registry = {};
    }
    EventManager.prototype.unsubscribeAll = function () {
        this._registry = {};
    };
    EventManager.prototype.subscribeMulti = function (names, handler) {
        var _this = this;
        names.forEach(function (name) {
            _this.subscribe(name, handler);
        });
    };
    EventManager.prototype.subscribe = function (name, handler) {
        if (!name || !handler)
            throw new Error('name and handler are required.');
        if (!this._registry[name])
            this._registry[name] = [];
        this._registry[name].push(handler);
    };
    EventManager.prototype.unsubscribe = function (name, handler) {
        if (!this._registry[name])
            return;
        var index = this._registry[name].indexOf(handler);
        if (index <= -1)
            return;
        this._registry[name].splice(index, 1);
    };
    EventManager.prototype.publish = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this._registry[name])
            return;
        var handlers = this._registry[name];
        handlers.forEach(function (handler) {
            handler.apply(void 0, args);
        });
    };
    EventManager.prototype.publishWithResult = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var handlers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._registry[name])
                            return [2 /*return*/, true];
                        handlers = this._registry[name];
                        if (handlers.length <= 0)
                            return [2 /*return*/, true];
                        return [4 /*yield*/, Promise.all(handlers.map(function (handler) { return handler.apply(void 0, args); }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return EventManager;
}());
export default EventManager;
