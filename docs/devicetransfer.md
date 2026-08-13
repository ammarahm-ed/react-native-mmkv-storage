# Backups and device transfers

An encrypted storage is two separate things: the data file, and the key that decrypts it. They are backed up and restored by different mechanisms, and on one path the key does not survive. This page explains when that happens and what to do about it.

Unencrypted storages are unaffected — there is no key involved, and the data file restores like any other file.

## What survives what

| Transfer | Data file | Encryption key | Result |
| --- | --- | --- | --- |
| Quick Start (device to device) | migrates | migrates | works |
| Encrypted Finder/iTunes backup | restores | restores | works |
| **iCloud backup restore** | restores | **lost** | **storage cannot be decrypted** |
| Android device transfer / Auto Backup | restores | **lost** | **storage cannot be decrypted** |

The reason is deliberate on both platforms. iOS wraps the keychain portion of an iCloud backup with a key derived from the hardware of the device that made it, so it cannot be unwrapped on different hardware. Android Keystore keys are non-exportable and never leave the device at all.

The data file arrives intact; it is simply ciphertext nobody can read.

## Letting the key follow the user (iOS)

[`withSynchronizableKey()`](/loaderclass#withsynchronizablekey) stores the key as an iCloud Keychain item, which syncs to the new device independently of the backup. The storage then decrypts normally after a restore and the user sees nothing unusual.

```js
const storage = new MMKVLoader()
  .withInstanceID('secure-storage')
  .withEncryption()
  .withSynchronizableKey()
  .initialize();
```

Keys written before you added this call are migrated automatically the next time the storage is initialized, so existing installs are covered rather than only new ones.

::: warning
This only works if the user has iCloud Keychain enabled, and it means the key leaves the device — end-to-end encrypted by Apple, but no longer device-bound. It is opt-in for that reason. There is no Android equivalent, because Keystore keys cannot be exported.
:::

## When the key is gone anyway

If an encrypted storage exists but its key cannot be read, `initialize()` throws `KeyUnavailableError` rather than returning a storage that silently discards every write:

```js
import { MMKVLoader, KeyUnavailableError } from 'react-native-mmkv-storage';

let storage;
try {
  storage = new MMKVLoader().withInstanceID('secure-storage').withEncryption().initialize();
} catch (e) {
  if (e instanceof KeyUnavailableError) {
    // The data is unreadable. Sign the user out, or reset the storage.
  } else {
    throw e;
  }
}
```

The error carries `instanceID`, so an app with several storages knows which one failed.

To reset instead of handling the error, opt in with [`recoverOnKeyLoss()`](/loaderclass#recoveronkeyloss). The unreadable storage is deleted and recreated with a fresh key:

```js
const storage = new MMKVLoader()
  .withInstanceID('secure-storage')
  .withEncryption()
  .recoverOnKeyLoss()
  .initialize();
```

This throws away data that cannot be recovered by any other means, so it is opt-in rather than the default. Prefer it for caches; prefer the error for anything the user would miss.

## Excluding storage from backup

Storage lives in `Library/mmkv` on iOS, which iOS includes in backups. Set `disableMMKVBackup` to `true` in `Info.plist` to exclude it:

```xml
<key>disableMMKVBackup</key>
<true/>
```

Excluded storage is absent after any restore, encrypted or not, and your app should treat it as a first launch.
