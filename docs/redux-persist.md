# redux-persist

An `MMKVInstance` implements the storage interface redux-persist expects, so it can be dropped in wherever `AsyncStorage` was used.

## The adapter methods

redux-persist only touches three methods on the instance:

| Method | Sync/async | Returns |
| --- | --- | --- |
| `setItem(key, value, callback?)` | async | `Promise` |
| `getItem(key, callback?)` | async | `Promise<string \| null \| undefined>` |
| `removeItem(key)` | **sync** | `boolean \| undefined` |

`setItem` and `getItem` handle **strings only** — internally they are `setString`/`getString`. This is exactly what redux-persist wants, since it serializes each slice of state to JSON before writing it. `removeItem` is synchronous and returns a boolean rather than a promise; redux-persist accepts a non-promise return here.

If you need to store objects, numbers or booleans outside of redux, use the typed methods described in [Data types](/datatypes).

## Setup

```js
import { MMKVLoader } from 'react-native-mmkv-storage';

export const storage = new MMKVLoader().withInstanceID('redux').initialize();
```

```js
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore
} from 'redux-persist';
import { storage } from './storage';
import userReducer from './userSlice';

const rootReducer = combineReducers({
  user: userReducer
});

const persistConfig = {
  key: 'root',
  storage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export const persistor = persistStore(store);
```

```jsx
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store';
import Main from './Main';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Main />
      </PersistGate>
    </Provider>
  );
}
```

`persistConfig.key` is the key the serialized root state is written under, so the example above stores everything under `persist:root` in the `redux` instance.

## zustand

zustand's `persist` middleware expects the same three methods, so the instance works there too — wrapped in `createJSONStorage`, which does the JSON encoding.

```js
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKVLoader } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withInstanceID('zustand').initialize();

export const useUserStore = create(
  persist(
    set => ({
      name: 'robert',
      setName: name => set({ name })
    }),
    {
      name: 'user',
      storage: createJSONStorage(() => storage)
    }
  )
);
```
