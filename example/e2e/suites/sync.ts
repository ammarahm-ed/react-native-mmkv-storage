import { suite, test, expect } from '../../testing/framework';
import { uniqueKey } from '../../testing/async';
import { plain } from '../storages';

suite('Sync API', () => {
  test('setString and getString round-trip', () => {
    const key = uniqueKey('string');
    expect(plain.setString(key, 'hello world')).toBe(true);
    expect(plain.getString(key)).toBe('hello world');
  });

  test('getString returns null for a missing key', () => {
    expect(plain.getString(uniqueKey('missing'))).toBeNull();
  });

  test('getString invokes the optional callback', () => {
    const key = uniqueKey('string_cb');
    plain.setString(key, 'callback value');
    let received: any = 'untouched';
    let receivedError: any = 'untouched';
    plain.getString(key, (error, value) => {
      receivedError = error;
      received = value;
    });
    expect(received).toBe('callback value');
    expect(receivedError).toBeNull();
  });

  test('empty strings are stored and read back', () => {
    const key = uniqueKey('empty');
    plain.setString(key, '');
    expect(plain.getString(key)).toBe('');
  });

  test('unicode strings survive a round-trip', () => {
    const key = uniqueKey('unicode');
    const value = 'مرحبا \u{1F30D} 日本語 end';
    plain.setString(key, value);
    expect(plain.getString(key)).toBe(value);
  });

  test('NUL bytes are preserved on both platforms', () => {
    const key = uniqueKey('nul');
    plain.setString(key, 'before\u0000after');
    expect(plain.getString(key)).toBe('before\u0000after');
  });

  test('setInt and getInt round-trip', () => {
    const key = uniqueKey('int');
    expect(plain.setInt(key, 42)).toBe(true);
    expect(plain.getInt(key)).toBe(42);
  });

  test('negative, zero and floating point numbers round-trip', () => {
    const negative = uniqueKey('negative');
    const zero = uniqueKey('zero');
    const float = uniqueKey('float');
    plain.setInt(negative, -12345);
    plain.setInt(zero, 0);
    plain.setInt(float, 3.14159);
    expect(plain.getInt(negative)).toBe(-12345);
    expect(plain.getInt(zero)).toBe(0);
    expect(plain.getInt(float)).toBe(3.14159);
  });

  test('large numbers round-trip', () => {
    const key = uniqueKey('bignum');
    plain.setInt(key, Number.MAX_SAFE_INTEGER);
    expect(plain.getInt(key)).toBe(Number.MAX_SAFE_INTEGER);
  });

  test('setBool and getBool round-trip both values', () => {
    const truthy = uniqueKey('bool_true');
    const falsy = uniqueKey('bool_false');
    expect(plain.setBool(truthy, true)).toBe(true);
    expect(plain.setBool(falsy, false)).toBe(true);
    expect(plain.getBool(truthy)).toBe(true);
    expect(plain.getBool(falsy)).toBe(false);
  });

  test('setMap and getMap round-trip a nested object', () => {
    const key = uniqueKey('map');
    const value = { name: 'ammar', nested: { list: [1, 2, 3], flag: true }, count: 7 };
    expect(plain.setMap(key, value)).toBe(true);
    expect(plain.getMap(key)).toEqual(value);
  });

  test('getMap returns null for a missing key', () => {
    expect(plain.getMap(uniqueKey('map_missing'))).toBeNull();
  });

  test('setArray and getArray round-trip mixed content', () => {
    const key = uniqueKey('array');
    const value = [1, 'two', false, null, { nested: true }, [1, 2]];
    expect(plain.setArray(key, value)).toBe(true);
    expect(plain.getArray(key)).toEqual(value);
  });

  test('an empty array round-trips', () => {
    const key = uniqueKey('array_empty');
    plain.setArray(key, []);
    expect(plain.getArray(key)).toEqual([]);
  });

  test('getArray returns null for a missing key', () => {
    expect(plain.getArray(uniqueKey('array_missing'))).toBeNull();
  });

  test('getMap and getArray invoke their callbacks', () => {
    const mapKey = uniqueKey('map_cb');
    const arrayKey = uniqueKey('array_cb');
    plain.setMap(mapKey, { a: 1 });
    plain.setArray(arrayKey, [1, 2]);

    let mapValue: any = null;
    let arrayValue: any = null;
    plain.getMap(mapKey, (_error, value) => {
      mapValue = value;
    });
    plain.getArray(arrayKey, (_error, value) => {
      arrayValue = value;
    });
    expect(mapValue).toEqual({ a: 1 });
    expect(arrayValue).toEqual([1, 2]);
  });

  test('setString rejects a non-string value', () => {
    const key = uniqueKey('type_string');
    expect(() => plain.setString(key, 5 as any)).toThrow('as a string');
  });

  test('setInt rejects a non-number value', () => {
    const key = uniqueKey('type_int');
    expect(() => plain.setInt(key, 'five' as any)).toThrow('as a number');
  });

  test('setBool rejects a non-boolean value', () => {
    const key = uniqueKey('type_bool');
    expect(() => plain.setBool(key, 'true' as any)).toThrow('as a boolean');
  });

  test('setArray rejects a non-array value', () => {
    const key = uniqueKey('type_array');
    expect(() => plain.setArray(key, { not: 'an array' } as any)).toThrow('as a array');
  });

  test('setMap rejects a primitive value', () => {
    const key = uniqueKey('type_map');
    expect(() => plain.setMap(key, 'string' as any)).toThrow('as a object');
  });

  test('writing null removes the key', () => {
    const key = uniqueKey('null_write');
    plain.setString(key, 'present');
    expect(plain.setString(key, null as any)).toBe(true);
    expect(plain.getString(key)).toBeNull();
  });

  test('writing undefined removes the key', () => {
    const key = uniqueKey('undefined_write');
    plain.setString(key, 'present');
    expect(plain.setString(key, undefined as any)).toBe(true);
    expect(plain.getString(key)).toBeNull();
  });

  test('overwriting a key replaces the value', () => {
    const key = uniqueKey('overwrite');
    plain.setString(key, 'first');
    plain.setString(key, 'second');
    expect(plain.getString(key)).toBe('second');
  });

  test('values persist on an encrypted instance', () => {
    const key = uniqueKey('encrypted_value');
    plain.setString(key, 'plain');
    expect(plain.getString(key)).toBe('plain');
  });
});
