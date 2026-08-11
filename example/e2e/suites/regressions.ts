import { useIndex, useMMKVStorage } from 'react-native-mmkv-storage';
import { suite, test, expect } from '../../testing/framework';
import { uniqueKey, waitFor, flush } from '../../testing/async';
import { renderHook } from '../../testing/hookHost';
import { plain } from '../storages';

suite('Regressions', () => {
  test('a value written from js is visible to native code', () => {
    plain.setString('__native_interop__', 'written from js');
    expect(plain.getString('__native_interop__')).toBe('written from js');
  });

  test('a handler unsubscribing during dispatch does not skip later handlers', async () => {
    const key = uniqueKey('dispatch_unsub');
    const called: string[] = [];

    const first = () => {
      called.push('first');
      plain.ev.unsubscribe(`${key}:onwrite`, first);
    };
    const second = () => {
      called.push('second');
    };

    plain.ev.subscribe(`${key}:onwrite`, first);
    plain.ev.subscribe(`${key}:onwrite`, second);

    plain.setString(key, 'value');
    await waitFor(() => called.length >= 2);

    plain.ev.unsubscribe(`${key}:onwrite`, second);

    expect(called).toEqual(['first', 'second']);
  });

  test('a handler subscribing during dispatch is not called for the same event', async () => {
    const key = uniqueKey('dispatch_sub');
    const called: string[] = [];

    const late = () => called.push('late');
    const first = () => {
      called.push('first');
      plain.ev.subscribe(`${key}:onwrite`, late);
    };

    plain.ev.subscribe(`${key}:onwrite`, first);
    plain.setString(key, 'value');
    await flush();

    plain.ev.unsubscribe(`${key}:onwrite`, first);
    plain.ev.unsubscribe(`${key}:onwrite`, late);

    expect(called).toEqual(['first']);
  });

  test('removing the last handler clears the registry entry for the key', () => {
    const key = uniqueKey('registry_clear');
    const handler = () => {};

    plain.ev.subscribe(`${key}:onwrite`, handler);
    expect(plain.ev.hasListenersForKey(key)).toBe(true);

    plain.ev.unsubscribe(`${key}:onwrite`, handler);
    expect(plain.ev.hasListenersForKey(key)).toBe(false);
    expect(plain.isRegisterd(key)).toBeFalsy();
  });

  test('an empty string is returned by the hook instead of the default value', async () => {
    const key = uniqueKey('hook_empty_string');
    plain.setString(key, '');

    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'fallback'));
    expect(hook.result.current![0]).toBe('');
    await hook.unmount();
  });

  test('an empty string written through the hook is read back as an empty string', async () => {
    const key = uniqueKey('hook_set_empty');
    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'fallback'));

    await hook.act(() => {
      hook.result.current![1]('');
    });
    await hook.waitForValue(value => value?.[0] === '');

    expect(hook.result.current![0]).toBe('');
    await hook.unmount();
  });

  test('a functional setter receives the stored empty string, not the default', async () => {
    const key = uniqueKey('hook_fn_empty');
    plain.setString(key, '');

    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'fallback'));

    let received: any = 'untouched';
    await hook.act(() => {
      hook.result.current![1]((previous: string) => {
        received = previous;
        return 'next';
      });
    });
    await hook.waitForValue(value => value?.[0] === 'next');

    expect(received).toBe('');
    await hook.unmount();
  });

  test('false and zero are still returned instead of the default value', async () => {
    const boolKey = uniqueKey('hook_false');
    const numberKey = uniqueKey('hook_zero');
    plain.setBool(boolKey, false);
    plain.setInt(numberKey, 0);

    const boolHook = await renderHook(() => useMMKVStorage<boolean>(boolKey, plain, true));
    const numberHook = await renderHook(() => useMMKVStorage<number>(numberKey, plain, 99));

    expect(boolHook.result.current![0]).toBe(false);
    expect(numberHook.result.current![0]).toBe(0);

    await boolHook.unmount();
    await numberHook.unmount();
  });

  test('the setter keeps the same identity across writes', async () => {
    const key = uniqueKey('hook_setter_identity');
    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'initial'));

    const firstSetter = hook.result.current![1];

    await hook.act(() => {
      hook.result.current![1]('first write');
    });
    await hook.waitForValue(value => value?.[0] === 'first write');

    await hook.act(() => {
      hook.result.current![1]('second write');
    });
    await hook.waitForValue(value => value?.[0] === 'second write');

    expect(hook.result.current![1]).toBe(firstSetter);
    await hook.unmount();
  });

  test('an async function setter is rejected and does not write', async () => {
    const key = uniqueKey('hook_async_setter');
    const hook = await renderHook(() => useMMKVStorage<string>(key, plain, 'initial'));

    await hook.act(() => {
      hook.result.current![1]((async () => 'from async') as any);
    });
    await flush();

    expect(plain.getString(key)).toBeNull();
    await hook.unmount();
  });

  test('removing a key that is not in the index leaves the other values intact', async () => {
    const present = uniqueKey('index_present');
    const absent = uniqueKey('index_absent');
    plain.setString(present, 'kept');

    const keys = [present, absent];
    const hook = await renderHook(() => useIndex<string>(keys, 'string', plain));
    await hook.waitForValue(value => value?.[0].length === 1);

    await hook.act(() => {
      plain.removeItem(absent);
    });
    await flush();

    expect(hook.result.current![0]).toEqual(['kept']);
    await hook.unmount();
  });

  test('a watched key gaining a value is inserted in key order', async () => {
    const first = uniqueKey('index_order_a');
    const second = uniqueKey('index_order_b');
    const third = uniqueKey('index_order_c');
    plain.setString(first, 'a');
    plain.setString(third, 'c');

    const keys = [first, second, third];
    const hook = await renderHook(() => useIndex<string>(keys, 'string', plain));
    await hook.waitForValue(value => value?.[0].length === 2);

    await hook.act(() => {
      plain.setString(second, 'b');
    });
    await hook.waitForValue(value => value?.[0].length === 3);

    expect(hook.result.current![0]).toEqual(['a', 'b', 'c']);
    await hook.unmount();
  });

  test('writing to a watched key updates that value in place', async () => {
    const first = uniqueKey('index_update_a');
    const second = uniqueKey('index_update_b');
    plain.setString(first, 'a');
    plain.setString(second, 'b');

    const keys = [first, second];
    const hook = await renderHook(() => useIndex<string>(keys, 'string', plain));
    await hook.waitForValue(value => value?.[0].length === 2);

    await hook.act(() => {
      plain.setString(second, 'b updated');
    });
    await hook.waitForValue(value => value?.[0][1] === 'b updated');

    expect(hook.result.current![0]).toEqual(['a', 'b updated']);
    await hook.unmount();
  });

  test('bulk number writes apply the beforewrite mutator once per item', async () => {
    const keyA = uniqueKey('bulk_once_a');
    const keyB = uniqueKey('bulk_once_b');

    const unregister = plain.transactions.register('number', 'beforewrite', (_key, value) => {
      return (value as number) + 1;
    });

    await plain.setMultipleItemsAsync(
      [
        [keyA, 1],
        [keyB, 10]
      ],
      'number'
    );
    unregister();

    expect(plain.getInt(keyA)).toBe(2);
    expect(plain.getInt(keyB)).toBe(11);
  });

  test('bulk number writes publish one event per key', async () => {
    const key = uniqueKey('bulk_event_once');
    let count = 0;
    const handler = () => {
      count++;
    };

    plain.ev.subscribe(`${key}:onwrite`, handler);
    await plain.setMultipleItemsAsync([[key, 5]], 'number');
    await flush();
    plain.ev.unsubscribe(`${key}:onwrite`, handler);

    expect(count).toBe(1);
  });

  test('multi get applies the onread mutator once per item', () => {
    const key = uniqueKey('multiget_once');
    plain.setInt(key, 1);

    const unregister = plain.transactions.register('number', 'onread', (_key, value) => {
      return (value as number) + 1;
    });

    const items = plain.getMultipleItems<number>([key], 'number');
    unregister();

    expect(items![0][1]).toBe(2);
  });
});
