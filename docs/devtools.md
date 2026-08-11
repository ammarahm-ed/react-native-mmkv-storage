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
| `rescanIntervalMs` | `number` | How often to re-scan for added or removed keys. Defaults to `1000`. `0` disables it. |

```tsx
useMMKVDevTools({
  storages: [storage],
  blacklist: /token|password|secret/i
});
```

## Production builds

The package entry becomes a no-op when `NODE_ENV` is `production`, so the hook costs nothing in release builds and none of the panel code is bundled. You do not need to guard the call.

## How the panel stays current

Writes to a key already on screen are pushed immediately through the instance's [event manager](/events). Keys that appear or disappear are caught by a re-scan on `rescanIntervalMs` — a key with no subscribers cannot publish a write event, so a newly created key has nothing to announce it.

The panel reads values directly from storage, which means `onread` [transaction](/transactionmanager) mutators do not run. What you see is what is stored.

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
