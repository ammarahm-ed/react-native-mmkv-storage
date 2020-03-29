

const Loader = require('./src/loader').default;

const MMKVStorage = {
  Loader:Loader,
  MODES: {
    SINGLE_PROCESS:1,
    MULTI_PROCESS:2
  },
  ACCESSIBLE :{
    WHEN_UNLOCKED                      : 'AccessibleWhenUnlocked',
    AFTER_FIRST_UNLOCK                 : 'AccessibleAfterFirstUnlock',
    ALWAYS                             : 'AccessibleAlways',
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY : 'AccessibleWhenPasscodeSetThisDeviceOnly',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY     : 'AccessibleWhenUnlockedThisDeviceOnly',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AccessibleAfterFirstUnlockThisDeviceOnly',
    ALWAYS_THIS_DEVICE_ONLY            : 'AccessibleAlwaysThisDeviceOnly',
  }
}

export default MMKVStorage;

