import { create, useIndex, useMMKVRef, useMMKVStorage, createMMKVRefHookForStorage } from 'react-native-mmkv-storage';
import { suite, test, expect } from '../../testing/framework';
import { uniqueKey, flush, nextFrame, waitFor } from '../../testing/async';
import { renderHook } from '../../testing/hookHost';
import { plain, persistedDefaults } from '../storages';

suite('useMMKVStorage', () => {
  test('returns the default value when the key is missing', async () => {
    const key = uniqueKey('hook_default');
    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'fallback'));
    expect(hook.result.current![0]).toBe('fallback');
    await hook.unmount();
  });

  test('returns the stored value when the key exists', async () => {
    const key = uniqueKey('hook_existing');
    plain.setString(key, 'stored');
    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'fallback'));
    expect(hook.result.current![0]).toBe('stored');
    await hook.unmount();
  });

  test('the setter writes to storage and updates the value', async () => {
    const key = uniqueKey('hook_set');
    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'initial'));

    await hook.act(() => {
      hook.result.current![1]('updated');
    });
    await hook.waitForValue(value => value?.[0] === 'updated');

    expect(hook.result.current![0]).toBe('updated');
    expect(plain.getString(key)).toBe('updated');
    await hook.unmount();
  });

  test('the setter accepts an updater function', async () => {
    const key = uniqueKey('hook_updater');
    const hook = await renderHook(() => useMMKVStorage<number>(key, plain, 1));

    await hook.act(() => {
      hook.result.current![1]((previous: number) => previous + 41);
    });
    await hook.waitForValue(value => value?.[0] === 42);

    expect(hook.result.current![0]).toBe(42);
    expect(plain.getInt(key)).toBe(42);
    await hook.unmount();
  });

  test('an external write updates the hook value', async () => {
    const key = uniqueKey('hook_external');
    plain.setString(key, 'before');
    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'fallback'));

    await hook.act(() => {
      plain.setString(key, 'after');
    });
    await hook.waitForValue(value => value?.[0] === 'after');

    expect(hook.result.current![0]).toBe('after');
    await hook.unmount();
  });

  test('setting null removes the key and falls back to the default', async () => {
    const key = uniqueKey('hook_null');
    plain.setString(key, 'present');
    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'fallback'));

    await hook.act(() => {
      hook.result.current![1](null as any);
    });
    await hook.waitForValue(value => value?.[0] === 'fallback');

    expect(plain.getString(key)).toBeNull();
    await hook.unmount();
  });

  test('booleans and numbers do not fall back to the default when falsy', async () => {
    const boolKey = uniqueKey('hook_false');
    const numberKey = uniqueKey('hook_zero');
    plain.setBool(boolKey, false);
    plain.setInt(numberKey, 0);

    const boolHook = await renderHook(() => useMMKVStorage<boolean>(boolKey, plain, true));
    const numberHook = await renderHook(() => useMMKVStorage<number>(numberKey, plain, 10));

    expect(boolHook.result.current![0]).toBe(false);
    expect(numberHook.result.current![0]).toBe(0);

    await boolHook.unmount();
    await numberHook.unmount();
  });

  test('objects and arrays round-trip through the hook', async () => {
    const mapKey = uniqueKey('hook_map');
    const arrayKey = uniqueKey('hook_array');
    const mapHook = await renderHook(() => useMMKVStorage<{ a: number }>(mapKey, plain, { a: 0 }));
    const arrayHook = await renderHook(() => useMMKVStorage<number[]>(arrayKey, plain, []));

    await mapHook.act(() => {
      mapHook.result.current![1]({ a: 5 });
    });
    await arrayHook.act(() => {
      arrayHook.result.current![1]([1, 2, 3]);
    });

    await mapHook.waitForValue(value => (value?.[0] as any)?.a === 5);
    await arrayHook.waitForValue(value => (value?.[0] as any)?.length === 3);

    expect(plain.getMap(mapKey)).toEqual({ a: 5 });
    expect(plain.getArray(arrayKey)).toEqual([1, 2, 3]);

    await mapHook.unmount();
    await arrayHook.unmount();
  });

  test('writing a different data type is ignored once the type is locked', async () => {
    const key = uniqueKey('hook_typelock');
    plain.setString(key, 'a string');
    const hook = await renderHook(() => useMMKVStorage<any>(key, plain, 'fallback'));

    await hook.act(() => {
      hook.result.current![1](12345 as any);
    });
    await flush();

    expect(hook.result.current![0]).toBe('a string');
    expect(plain.getString(key)).toBe('a string');
    await hook.unmount();
  });

  test('equalityFn suppresses updates when values are considered equal', async () => {
    const key = uniqueKey('hook_equality');
    plain.setMap(key, { version: 1, label: 'first' });
    const hook = await renderHook(() =>
      useMMKVStorage<{ version: number; label: string }>(
        key,
        plain,
        { version: 0, label: 'default' },
        (previous, next) => previous?.version === next?.version
      )
    );

    await hook.act(() => {
      plain.setMap(key, { version: 1, label: 'second' });
    });
    await flush();
    expect(hook.result.current![0].label).toBe('first');

    await hook.act(() => {
      plain.setMap(key, { version: 2, label: 'third' });
    });
    await hook.waitForValue(value => value?.[0]?.label === 'third');
    expect(hook.result.current![0].version).toBe(2);

    await hook.unmount();
  });

  test('withPersistedDefaultValues writes the default into storage', async () => {
    const key = uniqueKey('hook_persist');
    const hook = await renderHook(() => useMMKVStorage<string>(key, persistedDefaults, 'persisted'));
    await waitFor(() => persistedDefaults.getString(key) === 'persisted');
    expect(persistedDefaults.getString(key)).toBe('persisted');
    await hook.unmount();
  });

  test('an unmounted hook stops receiving updates', async () => {
    const key = uniqueKey('hook_unmount');
    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'initial'));
    await hook.unmount();
    const rendersAfterUnmount = hook.renderCount();

    plain.setString(key, 'changed');
    await flush();

    expect(hook.renderCount()).toBe(rendersAfterUnmount);
  });
});

suite('create', () => {
  test('returns a hook bound to a storage instance', async () => {
    const useStorage = create(plain);
    const key = uniqueKey('create_hook');
    const hook = await renderHook(() => useStorage<string>(key, 'bound'));
    expect(hook.result.current![0]).toBe('bound');

    await hook.act(() => {
      hook.result.current![1]('written');
    });
    await hook.waitForValue(value => value?.[0] === 'written');
    expect(plain.getString(key)).toBe('written');
    await hook.unmount();
  });

  test('throws when the key is missing', () => {
    const useStorage = create(plain);
    expect(() => useStorage('' as any)).toThrow('required');
  });

  test('throws when the storage is missing', () => {
    expect(() => create(undefined as any)('key')).toThrow('required');
  });
});

suite('useIndex', () => {
  test('returns the values for the given keys', async () => {
    const prefix = uniqueKey('useindex');
    const keys = [`${prefix}_a`, `${prefix}_b`];
    plain.setString(keys[0], 'first');
    plain.setString(keys[1], 'second');

    const hook = await renderHook(() => useIndex<string>(keys, 'string', plain));
    expect(hook.result.current![0]).toEqual(['first', 'second']);
    await hook.unmount();
  });

  test('update writes a value through the hook', async () => {
    const prefix = uniqueKey('useindex_update');
    const keys = [`${prefix}_a`];
    plain.setString(keys[0], 'before');

    const hook = await renderHook(() => useIndex<string>(keys, 'string', plain));
    await hook.act(() => {
      hook.result.current![1](keys[0], 'after');
    });
    await waitFor(() => plain.getString(keys[0]) === 'after');
    expect(plain.getString(keys[0])).toBe('after');
    await hook.unmount();
  });

  test('remove deletes a value through the hook', async () => {
    const prefix = uniqueKey('useindex_remove');
    const keys = [`${prefix}_a`];
    plain.setString(keys[0], 'present');

    const hook = await renderHook(() => useIndex<string>(keys, 'string', plain));
    await hook.act(() => {
      hook.result.current![2](keys[0]);
    });
    await waitFor(() => plain.getString(keys[0]) === null);
    expect(plain.getString(keys[0])).toBeNull();
    await hook.unmount();
  });

  test('an external write is reflected in the returned values', async () => {
    const prefix = uniqueKey('useindex_external');
    const keys = [`${prefix}_a`];
    plain.setString(keys[0], 'initial');

    const hook = await renderHook(() => useIndex<string>(keys, 'string', plain));
    await hook.act(() => {
      plain.setString(keys[0], 'external');
    });
    await hook.waitForValue(values => values?.[0]?.[0] === 'external');
    expect(hook.result.current![0][0]).toBe('external');
    await hook.unmount();
  });

  test('works with object values', async () => {
    const prefix = uniqueKey('useindex_object');
    const keys = [`${prefix}_a`, `${prefix}_b`];
    plain.setMap(keys[0], { id: 1 });
    plain.setMap(keys[1], { id: 2 });

    const hook = await renderHook(() => useIndex<{ id: number }>(keys, 'object', plain));
    expect(hook.result.current![0]).toEqual([{ id: 1 }, { id: 2 }]);
    await hook.unmount();
  });
});

suite('useMMKVRef', () => {
  test('starts from the default value', async () => {
    const key = uniqueKey('ref_default');
    const hook = await renderHook(() => useMMKVRef<string>(key, plain, 'default value'));
    expect(hook.result.current!.current).toBe('default value');
    await hook.unmount();
  });

  test('assigning current persists the value after a frame', async () => {
    const key = uniqueKey('ref_persist');
    const hook = await renderHook(() => useMMKVRef<string>(key, plain, 'initial'));

    hook.result.current!.current = 'typed value';
    expect(hook.result.current!.current).toBe('typed value');

    await nextFrame();
    await flush();

    expect(plain.getMap<{ current: string }>(`__mmkvref:${key}`)).toEqual({ current: 'typed value' });
    await hook.unmount();
  });

  test('assigning does not re-render the component', async () => {
    const key = uniqueKey('ref_norender');
    const hook = await renderHook(() => useMMKVRef<string>(key, plain, 'initial'));
    const renders = hook.renderCount();

    hook.result.current!.current = 'no render';
    await nextFrame();
    await flush();

    expect(hook.renderCount()).toBe(renders);
    await hook.unmount();
  });

  test('rapid assignments are debounced to the last value', async () => {
    const key = uniqueKey('ref_debounce');
    const hook = await renderHook(() => useMMKVRef<string>(key, plain, 'initial'));

    hook.result.current!.current = 'one';
    hook.result.current!.current = 'two';
    hook.result.current!.current = 'three';

    await nextFrame();
    await flush();

    expect(plain.getMap<{ current: string }>(`__mmkvref:${key}`)).toEqual({ current: 'three' });
    await hook.unmount();
  });

  test('a persisted value is restored on the next mount', async () => {
    const key = uniqueKey('ref_restore');
    const first = await renderHook(() => useMMKVRef<string>(key, plain, 'initial'));
    first.result.current!.current = 'persisted across mounts';
    await nextFrame();
    await flush();
    await first.unmount();

    const second = await renderHook(() => useMMKVRef<string>(key, plain, 'initial'));
    expect(second.result.current!.current).toBe('persisted across mounts');
    await second.unmount();
  });

  test('reset removes the persisted value', async () => {
    const key = uniqueKey('ref_reset');
    const hook = await renderHook(() => useMMKVRef<string>(key, plain, 'initial'));
    hook.result.current!.current = 'to be reset';
    await nextFrame();
    await flush();

    hook.result.current!.reset();
    expect(plain.getMap(`__mmkvref:${key}`)).toBeNull();
    await hook.unmount();
  });

  test('createMMKVRefHookForStorage binds a storage instance', async () => {
    const useRefHook = createMMKVRefHookForStorage(plain);
    const key = uniqueKey('ref_bound');
    const hook = await renderHook(() => useRefHook<string>(key, 'bound default'));
    expect(hook.result.current!.current).toBe('bound default');
    await hook.unmount();
  });

  test('createMMKVRefHookForStorage throws without a key', () => {
    const useRefHook = createMMKVRefHookForStorage(plain);
    expect(() => useRefHook('' as any)).toThrow('required');
  });
});
