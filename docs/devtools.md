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

## Opening the panel

The panel is not automatic — Metro has to be running with Rozenite enabled, and DevTools has to be opened by hand.

1. **Start Metro.**

   ```bash
   npx react-native start
   ```

   Rozenite discovers plugins while Metro boots. Watch the startup output for:

   ```
   [Rozenite] Loaded 1 plugin(s):
   [Rozenite]   - react-native-mmkv-storage-devtools
   ```

   If that line is missing, the panel will not appear no matter what you do in the app.

2. **Run the app.**

   ```bash
   npx react-native run-android   # or run-ios
   ```

3. **Open React Native DevTools.** Press <kbd>j</kbd> in the Metro terminal. You can also open the dev menu — shake the device, or `adb shell input keyevent 82` on Android — and choose *Open DevTools*.

4. **Select the MMKV Storage tab.**

Entries appear as soon as the panel opens, and every later write or delete shows up immediately.

## Troubleshooting

**The tab is missing.**

- `enabled` was not passed to `withRozenite`. It defaults to `false`.
- Metro was started before the plugin was installed. Rozenite reads the dependency list at startup, so restart Metro after installing.
- `useMMKVDevTools` is not being called, or is called in a component that has not mounted.

**The tab is there but empty.** No instances were registered. `useMMKVDevTools({ storages: [] })` and forgetting the option both produce an empty panel.

**Entries are listed but never change.** The instance you are writing to is not the one you registered. Two `MMKVLoader` calls with the same ID give you two handles to the same store, but only the object you passed to the hook is observed. Export the instance from one module and import it everywhere, rather than creating it again where it is used.

**Nothing shows for a key you know exists.** Check `blacklist`, which is matched against `instanceId:key`. Instances created with `disableIndexing()` also start out empty — the snapshot is built from the type indexes, so there is nothing to enumerate. Writes made while the panel is open still appear, because those arrive through transactions rather than the index, but existing keys stay hidden until they are written again.

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
