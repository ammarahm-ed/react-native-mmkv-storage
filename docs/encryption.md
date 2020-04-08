# Encryption

MMKV uses AES_CFB for encryption. The encryption keys are stored in Keychain on iOS and Android Keystore in android but if you are using your own secure storage solution, you can opt this out and save your keys there.

## encrypt

Encrypt an already created instance of MMKV.

**Arguments**

| Name             | Required | Type    | Description                                                                           |
| ---------------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| cryptKey         | no       | String  | Password to encrypt the storage                                                       |
| secureKeyStorage | no       | boolean | Set to true of you want the library to store the password securely                    |
| alias            | no       | String  | You can provide a custom alias for storage of password, by default instanceID is used |

```js
// A simple MMKV Instance();

MMKV = await new MMKVStorage.Loader().initialize();

await MMKV.encryption.encrypt();

// or if you want to provide your own key

await MMKV.encryption.encrypt("encryptionKey");

// if you dont want to store it

MMKV.encryption.encrypt("encryptionKey", false);
```

## decrypt

Removes encryption from an encrypted instance of MMKV.

```js
// Create an instance that is encrypted

MMKV = await new MMKVStorage().Loader().withEncryption().initialize();

// Remove encryption from an encrypted instance of MMKV.

await MMKV.encryption.decrypt();
```

!> Once you have decrypted an already created instance, the loader will not encrypt it when you reload the your app. If you want to encrypt again, you will now call `encrypt()`. Only new created instances are encrypted with the loader class. Once you modify that, it will have no effect.

## changeEncryptionKey

Change the encryption key of an encrypted instance of MMKV.

**Arguments**

| Name             | Required | Type    | Description                                                                           |
| ---------------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| cryptKey         | yes      | String  | Password to encrypt the storage                                                       |
| secureKeyStorage | no       | boolean | Set to true of you want the library to store the password securely                    |
| alias            | no       | String  | You can provide a custom alias for storage of password, by default instanceID is used |

```js
// Create an instance that is encrypted

MMKV = new MMKVStorage().Loader().withEncryption().initialize().getInstance();

await MMKV.encryption.changeEncryptionKey();

// or if you want to provide your own key

await MMKV.encryption.changeEncryptionKey("encryptionKey");

// if you dont want to store it

MMKV.encryption.changeEncryptionKey("encryptionKey", false);
```

!> After changing the encryption key, you will need to change your key or provide a key in the loader method above or it will throw error and not load the database.
