import { suite, test, expect } from '../../testing/framework';
import { uniqueKey, waitFor, flush } from '../../testing/async';
import { plain } from '../storages';

suite('Events', () => {
  test('a write publishes a key scoped onwrite event', async () => {
    const key = uniqueKey('event_write');
    const received: any[] = [];
    const handler = (payload: any) => received.push(payload);

    plain.ev.subscribe(`${key}:onwrite`, handler);
    plain.setString(key, 'event value');
    await waitFor(() => received.length > 0);
    plain.ev.unsubscribe(`${key}:onwrite`, handler);

    expect(received[0]).toHaveProperty('key', key);
    expect(received[0]).toHaveProperty('value', 'event value');
  });

  test('removing a key publishes a null value', async () => {
    const key = uniqueKey('event_remove');
    plain.setString(key, 'present');

    const received: any[] = [];
    const handler = (payload: any) => received.push(payload);
    plain.ev.subscribe(`${key}:onwrite`, handler);
    plain.removeItem(key);
    await waitFor(() => received.length > 0);
    plain.ev.unsubscribe(`${key}:onwrite`, handler);

    expect(received[0].value).toBeNull();
  });

  test('unsubscribe stops further notifications', async () => {
    const key = uniqueKey('event_unsub');
    let count = 0;
    const handler = () => {
      count++;
    };

    plain.ev.subscribe(`${key}:onwrite`, handler);
    plain.setString(key, 'first');
    await waitFor(() => count > 0);
    const afterFirst = count;

    plain.ev.unsubscribe(`${key}:onwrite`, handler);
    plain.setString(key, 'second');
    await flush();

    expect(count).toBe(afterFirst);
  });

  test('subscribeMulti listens to several events with one handler', async () => {
    const keyA = uniqueKey('event_multi');
    const keyB = uniqueKey('event_multi');
    const received: string[] = [];
    const handler = (payload: any) => received.push(payload.key);

    plain.ev.subscribeMulti([`${keyA}:onwrite`, `${keyB}:onwrite`], handler);
    plain.setString(keyA, 'a');
    plain.setString(keyB, 'b');
    await waitFor(() => received.length === 2);

    plain.ev.unsubscribe(`${keyA}:onwrite`, handler);
    plain.ev.unsubscribe(`${keyB}:onwrite`, handler);

    expect(received).toContain(keyA);
    expect(received).toContain(keyB);
  });

  test('publish notifies subscribers with the given arguments', () => {
    const name = uniqueKey('event_custom');
    const received: any[] = [];
    const handler = (...args: any[]) => received.push(args);

    plain.ev.subscribe(name, handler);
    plain.ev.publish(name, 'one', 2);
    plain.ev.unsubscribe(name, handler);

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual(['one', 2]);
  });

  test('publishWithResult resolves after handlers run', async () => {
    const name = uniqueKey('event_result');
    let called = false;
    const handler = () => {
      called = true;
      return 'handled';
    };

    plain.ev.subscribe(name, handler);
    const result = await plain.ev.publishWithResult(name, 'payload');
    plain.ev.unsubscribe(name, handler);

    expect(called).toBe(true);
    expect(result).toBeDefined();
  });

  test('subscribe throws when the name or handler is missing', () => {
    expect(() => plain.ev.subscribe('', () => {})).toThrow('required');
    expect(() => plain.ev.subscribe(uniqueKey('event_bad'), undefined as any)).toThrow('required');
  });

  test('multiple subscribers all receive the event', async () => {
    const key = uniqueKey('event_many');
    let first = 0;
    let second = 0;
    const handlerOne = () => {
      first++;
    };
    const handlerTwo = () => {
      second++;
    };

    plain.ev.subscribe(`${key}:onwrite`, handlerOne);
    plain.ev.subscribe(`${key}:onwrite`, handlerTwo);
    plain.setString(key, 'broadcast');
    await waitFor(() => first > 0 && second > 0);
    plain.ev.unsubscribe(`${key}:onwrite`, handlerOne);
    plain.ev.unsubscribe(`${key}:onwrite`, handlerTwo);

    expect(first).toBeGreaterThan(0);
    expect(second).toBeGreaterThan(0);
  });

  test('bulk writes publish events for each key', async () => {
    const keys = [uniqueKey('event_bulk'), uniqueKey('event_bulk')];
    const received: string[] = [];
    const handler = (payload: any) => received.push(payload.key);

    plain.ev.subscribeMulti(
      keys.map(key => `${key}:onwrite`),
      handler
    );
    await plain.setMultipleItemsAsync(
      keys.map(key => [key, 'bulk'] as [string, string]),
      'string'
    );
    await waitFor(() => received.length === keys.length);
    keys.forEach(key => plain.ev.unsubscribe(`${key}:onwrite`, handler));

    expect(received).toHaveLength(keys.length);
  });
});
