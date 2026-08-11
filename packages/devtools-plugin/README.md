# react-native-mmkv-storage-devtools

A React Native DevTools panel for [react-native-mmkv-storage](https://github.com/ammarahm-ed/react-native-mmkv-storage). Browse every instance, key, type and value while the app runs, and edit or delete entries from the panel.

Built on [Rozenite](https://www.rozenite.dev), the plugin framework for React Native DevTools.

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

Rozenite is disabled unless `enabled` is set, so this option is required.

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

Instances have to be passed explicitly — the library can list instance IDs, but recreating an instance from an ID alone would not carry its encryption key or options.

Pass an object to label them yourself:

```tsx
useMMKVDevTools({
  storages: {
    user: userStorage,
    cache: cacheStorage
  }
});
```

Start the dev server, open React Native DevTools, and select the **MMKV Storage** panel.

## Options

| Option | Type | Description |
| --- | --- | --- |
| `storages` | `MMKVInstance[] \| Record<string, MMKVInstance>` | Instances to inspect. An array uses each instance's `instanceID` as its label. |
| `blacklist` | `RegExp` | Hides matching entries. Tested against `instanceId:key`. |

Hide sensitive values with `blacklist`:

```tsx
useMMKVDevTools({
  storages: [storage],
  blacklist: /token|password|secret/i
});
```

## Production builds

The package entry resolves to a no-op when `NODE_ENV` is `production`, so `useMMKVDevTools` costs nothing in release builds and no panel code is bundled. Keeping the call unguarded in your app is safe.

## How updates reach the panel

The panel observes the instance's transactions — an `onwrite` observer per data type and one `ondelete` observer — using `transactions.subscribe`. Transactions run on every write and delete regardless of listeners, so new and removed keys appear immediately without polling.

`subscribe` is used instead of `register` on purpose: a mutator would replace whatever the app had registered for that type. Observers are additive and cannot change values, so the panel never alters the behaviour of the app it inspects.

The initial snapshot reads from the type indexes, so `onread` mutators do not run on it — the panel shows what is actually stored.

## Editing

Click a value to edit it, then press Enter or **Save**. The draft is parsed according to the entry's existing type:

- `number` — must parse as a number
- `boolean` — `true` or `false`
- `object` and `array` — must parse as JSON
- `string` — used as typed

An entry keeps its type. To store a different type for a key, delete it and write it again from your app.
