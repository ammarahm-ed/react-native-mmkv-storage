# E2E tests and benchmarks

The example app has three modes, selected by environment variables that are inlined into the bundle by Babel and mixed into the Metro cache key.

| Mode | Flag | Screen |
| --- | --- | --- |
| Demo | none | `DemoScreen.tsx` |
| E2E tests | `E2E_TEST=1` | `e2e/E2EScreen.tsx` |
| Benchmarks | `BENCHMARK=1` | `benchmarks/BenchmarkScreen.tsx` |

The flag has to be set for the Metro process, because the value is inlined at transform time.

## Running the E2E suite

```bash
npm run start:e2e
```

Then, in another terminal:

```bash
npm run ios
npm run android
```

Or build and start together:

```bash
npm run e2e:ios
npm run e2e:android
```

The suite runs automatically on launch and reports the totals in the header. Failures are expanded by default; `Show passing` reveals the rest. A machine readable summary is written to the console with an `E2E_RESULTS_JSON` prefix:

```json
{ "passed": 159, "failed": 0, "skipped": 0, "total": 159, "durationMs": 4294, "failures": [] }
```

## Running the benchmarks

```bash
npm run start:benchmark
npm run ios

npm run benchmark:ios
npm run benchmark:android
```

Results are printed as a table and as a `BENCHMARK_RESULTS_JSON` line containing ops/sec and mean, p50, p95 and p99 timings in microseconds.

## Layout

```
testing/framework.ts    suite/test/expect and the test runner
testing/hookHost.tsx    renderHook for testing hooks against the real renderer
testing/async.ts        waitFor, flush, nextFrame, uniqueKey
e2e/storages.ts         shared instances (plain, encrypted, unindexed, persisted defaults)
e2e/suites/*            one file per API area
benchmarks/framework.ts group/bench registry and the timing runner
benchmarks/suites.ts    storage benchmarks
benchmarks/hooks.ts     hook mount and update benchmarks
```

## Writing a test

```ts
import { suite, test, expect } from '../../testing/framework';
import { uniqueKey } from '../../testing/async';
import { plain } from '../storages';

suite('My area', () => {
  test('round-trips a value', () => {
    const key = uniqueKey('example');
    plain.setString(key, 'value');
    expect(plain.getString(key)).toBe('value');
  });
});
```

Use `uniqueKey()` for keys so tests never collide, and register new suite files in `e2e/index.ts`.

## Writing a hook test

```ts
const hook = await renderHook(() => useMMKVStorage('key', plain, 'default'));

await hook.act(() => {
  hook.result.current![1]('next');
});
await hook.waitForValue(value => value?.[0] === 'next');

await hook.unmount();
```

`renderHook` mounts into the real React tree rendered by the runner screen, so hooks are exercised against the actual renderer rather than a mock.

## Writing a benchmark

```ts
import { group, bench } from './framework';

group('My group', () => {
  bench('setString', iteration => {
    storage.setString(`key_${iteration % 100}`, 'value');
  }, { iterations: 2000 });
});
```

Iterations are split into rounds; each round is timed as a whole so the timer overhead is amortised, and the per-round averages give the percentile spread. Use `opsPerRun` when a single call performs several logical operations, as the bulk benchmarks do.
