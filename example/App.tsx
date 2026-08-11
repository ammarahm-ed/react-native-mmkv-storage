import React from 'react';
import type { MMKVInstance } from 'react-native-mmkv-storage';
import { useMMKVDevTools } from 'react-native-mmkv-storage-devtools';
import { encrypted, persistedDefaults, plain, unindexed } from './e2e/storages';

const isEnabled = (value?: string) => value === '1' || value === 'true';

const E2E_ENABLED = isEnabled(process.env.E2E_TEST);
const BENCHMARK_ENABLED = isEnabled(process.env.BENCHMARK);

const Screen: React.ComponentType = E2E_ENABLED
  ? require('./e2e/E2EScreen').default
  : BENCHMARK_ENABLED
  ? require('./benchmarks/BenchmarkScreen').default
  : require('./DemoScreen').default;

const devToolsStorages: MMKVInstance[] =
  E2E_ENABLED || BENCHMARK_ENABLED
    ? [plain, encrypted, unindexed, persistedDefaults]
    : [require('./demoStorages').storage, require('./demoStorages').storage2];

export default function App(): React.JSX.Element {
  useMMKVDevTools({ storages: devToolsStorages });

  return <Screen />;
}
