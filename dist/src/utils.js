export function promisify(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve) {
            resolve(fn.apply(void 0, args));
        });
    };
}
/**
 * Accessible modes for iOS Keychain
 */
export var IOSAccessibleStates = {
    WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
    AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
    /** @deprected in iOS 16+ */
    ALWAYS: 'AccessibleAlways',
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'AccessibleWhenPasscodeSetThisDeviceOnly',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AccessibleAfterFirstUnlockThisDeviceOnly',
    /** @deprected in iOS 16+ */
    ALWAYS_THIS_DEVICE_ONLY: 'AccessibleAlwaysThisDeviceOnly'
};
/**
 * Processing modes for storage.
 */
export var ProcessingModes = {
    SINGLE_PROCESS: 1,
    MULTI_PROCESS: 2
};
export var DATA_TYPES = Object.freeze({
    STRING: 1,
    NUMBER: 2,
    BOOL: 3,
    MAP: 4,
    ARRAY: 5
});
/**
 * Information about all storage instances
 */
export var options = {};
export var stringToHex = function (input) {
    var str = '';
    //@ts-ignore
    for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
        var char = input_1[_i];
        str += char.charCodeAt(0).toString(16);
    }
    return str;
};
