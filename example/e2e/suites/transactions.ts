import { MMKVLoader } from 'react-native-mmkv-storage';
import { suite, test, expect, afterEach } from '../../testing/framework';
import { uniqueKey, flush } from '../../testing/async';

const storage = new MMKVLoader().withInstanceID('e2e_transactions').initialize();

suite('Transactions', () => {
  afterEach(() => {
    storage.transactions.clear();
  });

  test('beforewrite can transform the value before it is stored', () => {
    const key = uniqueKey('tx_before');
    storage.transactions.register('string', 'beforewrite', (_key, value) => `${value}!`);
    storage.setString(key, 'hello');
    expect(storage.getString(key)).toBe('hello!');
  });

  test('mutators receive positional key and value arguments', () => {
    const key = uniqueKey('tx_args');
    let receivedKey: any = null;
    let receivedValue: any = null;
    storage.transactions.register('string', 'beforewrite', (mutatorKey, value) => {
      receivedKey = mutatorKey;
      receivedValue = value;
      return value;
    });
    storage.setString(key, 'positional');
    expect(receivedKey).toBe(key);
    expect(receivedValue).toBe('positional');
  });

  test('onwrite fires after a value is written', () => {
    const key = uniqueKey('tx_onwrite');
    const seen: any[] = [];
    storage.transactions.register('string', 'onwrite', (mutatorKey, value) => {
      seen.push([mutatorKey, value]);
      return value;
    });
    storage.setString(key, 'written');
    expect(seen).toHaveLength(1);
    expect(seen[0][0]).toBe(key);
    expect(seen[0][1]).toBe('written');
  });

  test('onread can transform the value returned to the caller', () => {
    const key = uniqueKey('tx_onread');
    storage.setString(key, 'raw');
    storage.transactions.register('string', 'onread', (_key, value) => `${value}-decorated`);
    expect(storage.getString(key)).toBe('raw-decorated');
  });

  test('ondelete fires when a key is removed', () => {
    const key = uniqueKey('tx_ondelete');
    const deleted: string[] = [];
    storage.setString(key, 'value');
    storage.transactions.register('string', 'ondelete', mutatorKey => {
      deleted.push(mutatorKey);
    });
    storage.removeItem(key);
    expect(deleted).toContain(key);
  });

  test('register returns a function that unregisters the mutator', () => {
    const key = uniqueKey('tx_unsub');
    let calls = 0;
    const unregister = storage.transactions.register('string', 'beforewrite', (_key, value) => {
      calls++;
      return value;
    });
    expect(unregister).toBeTypeOf('function');

    storage.setString(key, 'first');
    const afterFirst = calls;
    unregister();
    storage.setString(key, 'second');

    expect(afterFirst).toBeGreaterThan(0);
    expect(calls).toBe(afterFirst);
  });

  test('unregister removes a registered mutator', () => {
    const key = uniqueKey('tx_unregister');
    let calls = 0;
    storage.transactions.register('string', 'beforewrite', (_key, value) => {
      calls++;
      return value;
    });
    storage.transactions.unregister('string', 'beforewrite');
    storage.setString(key, 'value');
    expect(calls).toBe(0);
  });

  test('clear removes every registered mutator', () => {
    let calls = 0;
    storage.transactions.register('string', 'beforewrite', (_key, value) => {
      calls++;
      return value;
    });
    storage.transactions.register('number', 'onwrite', (_key, value) => {
      calls++;
      return value;
    });
    storage.transactions.clear();
    storage.setString(uniqueKey('tx_clear'), 'value');
    storage.setInt(uniqueKey('tx_clear_n'), 1);
    expect(calls).toBe(0);
  });

  test('register throws when a parameter is missing', () => {
    expect(() => storage.transactions.register('string', 'beforewrite', undefined as any)).toThrow(
      'All parameters are required'
    );
    expect(() => storage.transactions.unregister(undefined as any, 'beforewrite')).toThrow(
      'All parameters are required'
    );
  });

  test('a mutator returning undefined leaves the original value intact', () => {
    const key = uniqueKey('tx_undefined');
    storage.transactions.register('string', 'beforewrite', () => undefined);
    storage.setString(key, 'original');
    expect(storage.getString(key)).toBe('original');
  });

  test('mutators are registered per data type', () => {
    const stringKey = uniqueKey('tx_type_s');
    const numberKey = uniqueKey('tx_type_n');
    let stringCalls = 0;
    let numberCalls = 0;
    storage.transactions.register('string', 'onwrite', (_key, value) => {
      stringCalls++;
      return value;
    });
    storage.transactions.register('number', 'onwrite', (_key, value) => {
      numberCalls++;
      return value;
    });

    storage.setString(stringKey, 'value');
    expect(stringCalls).toBe(1);
    expect(numberCalls).toBe(0);

    storage.setInt(numberKey, 1);
    expect(numberCalls).toBe(1);
  });

  test('registering the same type and transaction twice overwrites the mutator', () => {
    const key = uniqueKey('tx_overwrite');
    storage.transactions.register('string', 'beforewrite', (_key, value) => `${value}-first`);
    storage.transactions.register('string', 'beforewrite', (_key, value) => `${value}-second`);
    storage.setString(key, 'value');
    expect(storage.getString(key)).toBe('value-second');
  });

  test('object mutators run for map writes', () => {
    const key = uniqueKey('tx_object');
    storage.transactions.register('object', 'beforewrite', (_key, value: any) => ({
      ...value,
      stamped: true
    }));
    storage.setMap(key, { original: true });
    expect(storage.getMap(key)).toEqual({ original: true, stamped: true });
  });

  test('multiple observers can watch the same type and transaction', () => {
    const key = uniqueKey('tx_multi_observer');
    const first: any[] = [];
    const second: any[] = [];

    const offFirst = storage.transactions.subscribe('string', 'onwrite', (k, value) => {
      first.push([k, value]);
    });
    const offSecond = storage.transactions.subscribe('string', 'onwrite', (k, value) => {
      second.push([k, value]);
    });

    storage.setString(key, 'observed');
    offFirst();
    offSecond();

    expect(first).toEqual([[key, 'observed']]);
    expect(second).toEqual([[key, 'observed']]);
  });

  test('an observer does not replace a registered mutator', () => {
    const key = uniqueKey('tx_observer_keeps_mutator');
    const observed: any[] = [];

    storage.transactions.register('string', 'beforewrite', (_key, value) => `${value}-mutated`);
    const off = storage.transactions.subscribe('string', 'beforewrite', (k, value) => {
      observed.push([k, value]);
    });

    storage.setString(key, 'value');
    off();

    expect(storage.getString(key)).toBe('value-mutated');
    expect(observed).toEqual([[key, 'value-mutated']]);
  });

  test('a mutator registered after an observer does not remove it', () => {
    const key = uniqueKey('tx_mutator_after_observer');
    const observed: any[] = [];

    const off = storage.transactions.subscribe('string', 'onwrite', k => observed.push(k));
    storage.transactions.register('string', 'onwrite', (_key, value) => value);

    storage.setString(key, 'value');
    off();

    expect(observed).toEqual([key]);
  });

  test('an observer cannot change the stored value', () => {
    const key = uniqueKey('tx_observer_readonly');
    let ran = false;
    const off = storage.transactions.subscribe('string', 'beforewrite', () => {
      ran = true;
      return 'hijacked' as any;
    });

    storage.setString(key, 'original');
    off();

    expect(ran).toBe(true);
    expect(storage.getString(key)).toBe('original');
  });

  test('unsubscribing removes only that observer', () => {
    const key = uniqueKey('tx_observer_unsub');
    let firstCalls = 0;
    let secondCalls = 0;

    const offFirst = storage.transactions.subscribe('string', 'onwrite', () => {
      firstCalls++;
    });
    const offSecond = storage.transactions.subscribe('string', 'onwrite', () => {
      secondCalls++;
    });

    storage.setString(key, 'one');
    offFirst();
    storage.setString(key, 'two');
    offSecond();

    expect(firstCalls).toBe(1);
    expect(secondCalls).toBe(2);
  });

  test('clear leaves observers registered', () => {
    const key = uniqueKey('tx_clear_observers');
    let calls = 0;
    const off = storage.transactions.subscribe('string', 'onwrite', () => {
      calls++;
    });

    storage.transactions.clear();
    storage.setString(key, 'value');
    off();

    expect(calls).toBe(1);
  });

  test('delete observers fire without a registered ondelete mutator', () => {
    const key = uniqueKey('tx_observer_ondelete');
    const deleted: string[] = [];
    storage.setString(key, 'value');

    const off = storage.transactions.subscribe('string', 'ondelete', k => deleted.push(k));
    storage.removeItem(key);
    off();

    expect(deleted).toContain(key);
  });

  test('delete observers fire for removeItems', () => {
    const first = uniqueKey('tx_observer_removeitems_a');
    const second = uniqueKey('tx_observer_removeitems_b');
    const deleted: string[] = [];
    storage.setString(first, 'a');
    storage.setString(second, 'b');

    const off = storage.transactions.subscribe('string', 'ondelete', k => deleted.push(k));
    storage.removeItems([first, second]);
    off();

    expect(deleted).toContain(first);
    expect(deleted).toContain(second);
  });

  test('observers fire for every data type', () => {
    const seen: string[] = [];
    const offs = (['string', 'number', 'boolean', 'object', 'array'] as const).map(type =>
      storage.transactions.subscribe(type, 'onwrite', () => seen.push(type))
    );

    storage.setString(uniqueKey('tx_all_s'), 'a');
    storage.setInt(uniqueKey('tx_all_n'), 1);
    storage.setBool(uniqueKey('tx_all_b'), true);
    storage.setMap(uniqueKey('tx_all_o'), { a: 1 });
    storage.setArray(uniqueKey('tx_all_a'), [1]);
    offs.forEach(off => off());

    expect(seen).toEqual(['string', 'number', 'boolean', 'object', 'array']);
  });

  test('an observer unsubscribing during dispatch does not skip the others', () => {
    const key = uniqueKey('tx_observer_reentrant');
    const called: string[] = [];

    const offFirst = storage.transactions.subscribe('string', 'onwrite', () => {
      called.push('first');
      offFirst();
    });
    const offSecond = storage.transactions.subscribe('string', 'onwrite', () => {
      called.push('second');
    });

    storage.setString(key, 'value');
    offSecond();

    expect(called).toEqual(['first', 'second']);
  });

  test('subscribe throws when a parameter is missing', () => {
    expect(() => storage.transactions.subscribe('string', 'onwrite', undefined as any)).toThrow(
      'All parameters are required'
    );
  });

  test('ondelete fires for clearStore', async () => {
    const scoped = new MMKVLoader().withInstanceID(uniqueKey('tx_clearstore')).initialize();
    const deleted: string[] = [];
    scoped.setString('one', 'a');
    scoped.setString('two', 'b');
    scoped.transactions.register('string', 'ondelete', key => {
      deleted.push(key);
    });
    scoped.clearStore();
    await flush();
    expect(deleted.length).toBeGreaterThan(0);
  });
});
