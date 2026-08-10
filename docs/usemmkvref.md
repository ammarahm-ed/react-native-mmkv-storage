# useMMKVRef

`useMMKVRef` is a `useRef` like hook whose `current` value is persisted to storage. Assigning to `current` schedules a write, but — like a normal ref — it does **not** re-render the component. That makes it a good fit for values that change very often, such as text input contents, scroll offsets or draft state.

## Signature

```ts
function useMMKVRef<T>(
  key: string,
  storage: MMKVInstance,
  defaultValue: T
): { current: T; reset(): void };
```

**Arguments**

| Name         | Required | Type               | Description                                              |
| ------------ | -------- | ------------------ | -------------------------------------------------------- |
| key          | yes      | `string`           | The key the value is persisted against.                  |
| storage      | yes      | `MMKVInstance`     | Instance created with `new MMKVLoader().initialize()`.   |
| defaultValue | yes      | any supported type | Used when nothing is stored for the key yet.             |

::: warning
`defaultValue` is required on `useMMKVRef`. Only the curried [`createMMKVRefHookForStorage`](#createmmkvrefhookforstorage) form makes it optional.
:::

**Returns:** `{ current, reset }`

## How to use

```jsx
import React from 'react';
import { Button, TextInput, View } from 'react-native';
import { MMKVLoader, useMMKVRef } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

const DraftEditor = () => {
  const draft = useMMKVRef('draft', MMKV, '');

  return (
    <View>
      <TextInput
        defaultValue={draft.current}
        onChangeText={value => {
          draft.current = value;
        }}
      />
      <Button title="Discard draft" onPress={() => draft.reset()} />
    </View>
  );
};

export default DraftEditor;
```

Every keystroke updates `draft.current` and is persisted, but the component never re-renders. That is why the `TextInput` is given `defaultValue` rather than a controlled `value`.

## Behaviour

- **Writes are debounced to one animation frame.** Rapid assignments to `current` coalesce into a single storage write, so typing does not produce one write per character.
- **The component does not re-render when the value changes.** If you need re-rendering, use [useMMKVStorage](/usemmkvstorage) instead.
- **The value is stored under a namespaced key.** It is persisted as an object at `__mmkvref:<key>`, so `useMMKVRef('draft', MMKV, '')` writes to `__mmkvref:draft`, not `draft`.
- **It also listens for writes to the bare key.** Writing `MMKV.setString('draft', 'hello')` elsewhere updates `current` in place (still without a re-render).

::: warning
`reset()` only removes the persisted key from storage. It does **not** restore `current` to `defaultValue` in the running component — the ref keeps its last in-memory value until the component remounts, at which point the default is picked up again.
:::

## createMMKVRefHookForStorage

Binds a storage instance to the hook so you do not have to pass it every time. In this form `defaultValue` is optional.

```ts
function createMMKVRefHookForStorage(
  storage: MMKVInstance
): <T>(key: string, defaultValue?: T) => { current: T; reset(): void };
```

```jsx
import React from 'react';
import { TextInput, View } from 'react-native';
import { MMKVLoader, createMMKVRefHookForStorage } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

export const useStorageRef = createMMKVRefHookForStorage(MMKV);

const DraftEditor = () => {
  const draft = useStorageRef('draft', '');

  return (
    <View>
      <TextInput
        defaultValue={draft.current}
        onChangeText={value => {
          draft.current = value;
        }}
      />
    </View>
  );
};

export default DraftEditor;
```

It throws `Key and Storage are required parameters.` if the key or the storage instance is missing.

## TypeScript

```tsx
import { MMKVLoader, useMMKVRef } from 'react-native-mmkv-storage';
import type { MMKVInstance } from 'react-native-mmkv-storage';

const MMKV: MMKVInstance = new MMKVLoader().initialize();

type Draft = { title: string; body: string };

export const useDraft = () =>
  useMMKVRef<Draft>('draft', MMKV, { title: '', body: '' });
```

## See also

- [useMMKVStorage](/usemmkvstorage) when the UI must react to the value.
- [Events](/events) for subscribing to writes directly.
