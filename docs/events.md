# Events

Every storage instance carries a small event manager at `instance.ev`. It is what makes [useMMKVStorage](/usemmkvstorage), [useIndex](/useindex) and [useMMKVRef](/usemmkvref) reactive, and you can use it directly to observe storage changes anywhere in your app — including outside React.

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

const onUserChange = event => {
  console.log(event.key, event.value);
};

MMKV.ev.subscribe('user:onwrite', onUserChange);

MMKV.setString('user', 'andrew');
// => user andrew
```

## Event names

Events are namespaced per key. Writing to a key publishes `` `${key}:onwrite` ``:

| Action                                   | Event published     | Payload                 |
| ---------------------------------------- | ------------------- | ----------------------- |
| `setString`, `setInt`, `setBool`, `setMap`, `setArray` | `` `${key}:onwrite` `` | `{ key, value }`        |
| `removeItem`, `removeItems`              | `` `${key}:onwrite` `` | `{ key, value: null }`  |
| `clearStore`                             | `` `${key}:onwrite` `` for every key | `{ key }` |

A removal is therefore delivered as an ordinary write event whose `value` is `null`.

::: tip
Events are per instance. Two instances created with different `instanceID`s have independent event managers, so a write on one never notifies subscribers of the other.
:::

## subscribe

```ts
function subscribe(name: string, handler: Function): void;
```

Registers a handler for an event name. Multiple handlers can be registered for the same name and are called in registration order.

```js
MMKV.ev.subscribe('user:onwrite', event => {
  console.log('user is now', event.value);
});
```

::: warning
`subscribe` throws `name and handler are required.` if either argument is missing.
:::

## subscribeMulti

```ts
function subscribeMulti(names: string[], handler: Function): void;
```

Registers the same handler for several event names at once.

```js
const keys = ['user', 'settings', 'theme'];

MMKV.ev.subscribeMulti(
  keys.map(key => `${key}:onwrite`),
  event => {
    console.log('changed', event.key, event.value);
  }
);
```

## unsubscribe

```ts
function unsubscribe(name: string, handler: Function): void;
```

Removes a single handler. You must pass the same function reference that was used to subscribe, so keep a reference to it.

```js
const handler = event => console.log(event.value);

MMKV.ev.subscribe('user:onwrite', handler);
MMKV.ev.unsubscribe('user:onwrite', handler);
```

## unsubscribeAll

```ts
function unsubscribeAll(): void;
```

Clears the whole registry for the instance.

::: warning
This removes every subscription, including the ones the hooks created internally. Any mounted `useMMKVStorage`, `useIndex` or `useMMKVRef` on this instance stops updating until it remounts.
:::

## publish

```ts
function publish(name: string, ...args: any[]): void;
```

Calls every handler registered for the name. The library publishes storage events itself, but you can also use the manager as a general purpose event bus.

```js
MMKV.ev.publish('sync:finished', { at: Date.now() });
```

## publishWithResult

```ts
function publishWithResult(name: string, ...args: any[]): Promise<true | any[]>;
```

Like `publish`, but awaits all handlers and resolves with an array of their return values. If no handler is registered for the name, it resolves with `true`.

```js
const results = await MMKV.ev.publishWithResult('sync:requested', { force: true });
```

## A practical example

Keeping a non-React module — an analytics client, a background sync queue, a plain singleton — in sync with storage:

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

class ThemeWatcher {
  constructor(storage) {
    this.storage = storage;
    this.theme = storage.getString('theme') || 'light';
    this.onWrite = this.onWrite.bind(this);
  }

  start() {
    this.storage.ev.subscribe('theme:onwrite', this.onWrite);
  }

  stop() {
    this.storage.ev.unsubscribe('theme:onwrite', this.onWrite);
  }

  onWrite(event) {
    this.theme = event.value || 'light';
  }
}

const watcher = new ThemeWatcher(MMKV);
watcher.start();
```

## When to use events vs the hooks

- Use [useMMKVStorage](/usemmkvstorage) when a component's render output depends on the value. It handles subscribing, unsubscribing and type resolution for you.
- Use [useIndex](/useindex) when the component renders a list of keys.
- Use `instance.ev` when the consumer is not a component — a store, a service, a cache, a logger — or when you want to react to a change without holding the value in React state.
- Use [Transactions](/transactionmanager) when you want to *modify* a value on read or write, rather than merely observe it. Transactions run for every write regardless of whether anyone subscribed; key events only fire when a subscriber exists for that key.

## See also

- [Transactions](/transactionmanager)
- [Types](/types)
