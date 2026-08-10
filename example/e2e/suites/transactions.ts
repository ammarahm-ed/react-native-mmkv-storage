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
