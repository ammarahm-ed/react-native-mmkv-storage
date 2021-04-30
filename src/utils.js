export function promisify(fn) {
  return function (...args) {
    return new Promise((resolve) => {
      resolve(fn(...args));
    });
  };
}

export const ACCESSIBLE = {
  WHEN_UNLOCKED: "AccessibleWhenUnlocked",
  AFTER_FIRST_UNLOCK: "AccessibleAfterFirstUnlock",
  ALWAYS: "AccessibleAlways",
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: "AccessibleWhenPasscodeSetThisDeviceOnly",
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "AccessibleWhenUnlockedThisDeviceOnly",
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:
    "AccessibleAfterFirstUnlockThisDeviceOnly",
  ALWAYS_THIS_DEVICE_ONLY: "AccessibleAlwaysThisDeviceOnly",
};

export const MODES = {
  SINGLE_PROCESS: 1,
  MULTI_PROCESS: 2,
};

export const DATA_TYPES = Object.freeze({
  STRING: 1,
  NUMBER: 2,
  BOOL: 3,
  MAP: 4,
  ARRAY: 5,
});

export const options = {};

export const stringToHex = (input) => {
  let str = "";
  for (const char of input) {
    str += char.charCodeAt(0).toString(16);
  }
  return str;
};
