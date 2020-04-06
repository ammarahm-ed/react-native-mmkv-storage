# Working with encryption

So now you know how to create an instance of MMKV. Lets dig into encryption and how to handle different use cases.

An already created instance of MMKV can be encrypted without destroying it.

Lets suppose you have this MMKV instance created during first app startup.

```js
import MMKVStorage from "react-native-mmkv-storage";

const MMKV = await new MMKVStorage().initialize();
```

Now later you might want to encrypt it somwhere during the lifecycle of an app. So you can then simply do this:

```js
// Let the library do everything (RECOMMENDED)

await MMKV.encryption.encrypt();

// Provide your own password, it will be stored securely

await MMKV.encryption.encrypt("myencryptionkey");

// You dont want it to be stored in the secure storage

await MMKV.encryption.encrypt("myencryptionkey", false);
```

This will encrypt the storage. Remember that **you will not need to change your Loader function** for this instance afterwards. The Library will handle everything itself

Now lets say you want to decrypt it later on.

```js
await MMKV.encryption.decrypt();
```

Or you might want to update the encryption key to a newer one:

```js
await MMKV.encryption.changeEncryptionKey();

// Provide your own password, it will be stored securely

await MMKV.encryption.changeEncryptionKey("myencryptionkey");

// You dont want it to be stored in the secure storage

await MMKV.encryption.changeEncryptionKey("myencryptionkey", false);
```

Remember that whenever you encrypt your storage, a strongpassword is automatically generated, stored and used to decrypt it behind the scenes. It is recommended to use it since it handles everything smoothly. However you can choose to not do so, in such a case, things get a little complicated.


Lets say you created an MMKV Instance with encryption and you did not store the password so.
```js


const MMKV = await new MMKVStorage.Loader()
  .withEncryption()
  .encryptWithCustomKey("mykey", false)
  .initialize();


```

Now if you change the encryption key 


```js
await MMKV.encryption.changeEncryptionKey('newkey',false);
```
When the app starts again on  next start up. You will need to update the value of key in the Loader function or your database will not load. 

So on next app startup:
```js
const MMKV = await new MMKVStorage.Loader()
  .withEncryption()
  .encryptWithCustomKey("newkey", false)
  .initialize();
```

How you handle the change from old key to the new one, is left upon you.
