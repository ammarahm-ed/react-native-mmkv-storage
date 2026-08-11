# React Native DevTools

`react-native-mmkv-storage-devtools` adds an **MMKV Storage** panel to React Native DevTools. It lists every instance you register, with each key's type and value, updates as your app writes, and lets you edit or delete entries.

React Native DevTools has no built-in storage panel and no public API for a library to add one, so the panel is provided through [Rozenite](https://www.rozenite.dev), a plugin framework for React Native DevTools.

## Install

```bash
npm install --save-dev react-native-mmkv-storage-devtools @rozenite/metro
```

## Enable Rozenite in Metro

```js
const { withRozenite } = require('@rozenite/metro');
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = withRozenite(getDefaultConfig(__dirname), {
  enabled: process.env.NODE_ENV !== 'production'
});
```

::: warning
Rozenite does nothing unless `enabled` is set — it defaults to `false`. If the panel never appears, check this first.
:::

## Register your instances

```tsx
import { MMKVLoader } from 'react-native-mmkv-storage';
import { useMMKVDevTools } from 'react-native-mmkv-storage-devtools';

const storage = new MMKVLoader().initialize();

export default function App() {
  useMMKVDevTools({ storages: [storage] });

  return <YourApp />;
}
```

Then start the dev server, open React Native DevTools, and pick the **MMKV Storage** panel.

Instances are passed explicitly rather than discovered. `getAllMMKVInstanceIDs()` can list the IDs, but rebuilding an instance from an ID alone would lose its encryption key and options, so the panel only shows what you hand it.

Use an object to label them:

```tsx
useMMKVDevTools({
  storages: {
    user: userStorage,
    cache: cacheStorage
  }
});
```

## Options

| Option | Type | Description |
| --- | --- | --- |
| `storages` | `MMKVInstance[] \| Record<string, MMKVInstance>` | Instances to inspect. An array labels each one with its `instanceID`. |
| `blacklist` | `RegExp` | Hides matching entries. Tested against `instanceId:key`. |

```tsx
useMMKVDevTools({
  storages: [storage],
  blacklist: /token|password|secret/i
});
```

## Production builds

The package entry becomes a no-op when `NODE_ENV` is `production`, so the hook costs nothing in release builds and none of the panel code is bundled. You do not need to guard the call.

## How the panel stays current

The panel observes the instance's [transactions](/transactionmanager) — one `onwrite` observer per data type plus one `ondelete` observer. Transactions run on every write and every delete regardless of who is listening, so added and removed keys show up immediately with no polling.

Observers are used rather than `register` deliberately: a mutator registered by the panel would replace whatever your app had registered for that type. `subscribe` is additive and cannot change values, so the panel can never alter the behaviour of the app it is inspecting.

The initial snapshot reads values directly from the type indexes, which means `onread` mutators do not run on it. What you see is what is stored.

## Editing values

Click a value to edit it and press Enter or **Save**. The text is parsed using the entry's current type:

| Type | Accepted input |
| --- | --- |
| `string` | Any text |
| `number` | Anything that parses as a number |
| `boolean` | `true` or `false` |
| `object`, `array` | Valid JSON |

Entries keep their type. To change a key's type, delete it and write it again from your app — the same rule the [hooks](/usemmkvstorage) follow.

## See also

- [Events](/events) — the mechanism behind live updates
- [Using MMKV from native code](/nativeaccess)
