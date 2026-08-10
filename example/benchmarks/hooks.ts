import { MMKVLoader, useMMKVStorage, useMMKVRef, useIndex } from 'react-native-mmkv-storage';
import { group, bench } from './framework';
import { renderHook, unmountAllHooks } from '../testing/hookHost';
import { nextFrame } from '../testing/async';

const storage = new MMKVLoader().withInstanceID('bench_hooks').initialize();

const indexKeys = Array.from({ length: 20 }, (_, index) => `hook_index_${index}`);

group('Hooks', () => {
  bench('mount useMMKVStorage', async iteration => {
    const hook = await renderHook(() => useMMKVStorage<string>(`hook_mount_${iteration % 50}`, storage, 'default'));
    await hook.unmount();
  }, { iterations: 60, batch: 5, warmup: 5, teardown: unmountAllHooks });

  bench('useMMKVStorage update propagation', async iteration => {
    storage.setString('hook_update_key', `value_${iteration}`);
  }, {
    iterations: 200,
    batch: 10,
    warmup: 5,
    setup: async () => {
      storage.setString('hook_update_key', 'initial');
      await renderHook(() => useMMKVStorage<string>('hook_update_key', storage, 'default'));
    },
    teardown: unmountAllHooks
  });

  bench('useMMKVStorage setter', async iteration => {
    const setter = (globalThis as any).__benchSetter;
    if (setter) setter(`set_${iteration}`);
  }, {
    iterations: 200,
    batch: 10,
    warmup: 5,
    setup: async () => {
      const hook = await renderHook(() => useMMKVStorage<string>('hook_setter_key', storage, 'default'));
      (globalThis as any).__benchSetter = (value: string) => hook.result.current?.[1](value);
    },
    teardown: async () => {
      (globalThis as any).__benchSetter = undefined;
      await unmountAllHooks();
    }
  });

  bench('mount useMMKVRef', async iteration => {
    const hook = await renderHook(() => useMMKVRef<string>(`hook_ref_${iteration % 50}`, storage, 'default'));
    await hook.unmount();
  }, { iterations: 60, batch: 5, warmup: 5, teardown: unmountAllHooks });

  bench('useMMKVRef assignment', async iteration => {
    const ref = (globalThis as any).__benchRef;
    if (ref) ref.current = `value_${iteration}`;
  }, {
    iterations: 500,
    batch: 25,
    warmup: 5,
    setup: async () => {
      const hook = await renderHook(() => useMMKVRef<string>('hook_ref_bench', storage, 'default'));
      (globalThis as any).__benchRef = hook.result.current;
    },
    teardown: async () => {
      (globalThis as any).__benchRef = undefined;
      await nextFrame();
      await unmountAllHooks();
    }
  });

  bench('mount useIndex 20 keys', async () => {
    const hook = await renderHook(() => useIndex<string>(indexKeys, 'string', storage));
    await hook.unmount();
  }, {
    iterations: 40,
    batch: 5,
    warmup: 3,
    setup: () => {
      indexKeys.forEach((key, index) => storage.setString(key, `value_${index}`));
    },
    teardown: unmountAllHooks
  });
});
