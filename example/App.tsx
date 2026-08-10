import React from 'react';

const isEnabled = (value?: string) => value === '1' || value === 'true';

const E2E_ENABLED = isEnabled(process.env.E2E_TEST);
const BENCHMARK_ENABLED = isEnabled(process.env.BENCHMARK);

const Screen: React.ComponentType = E2E_ENABLED
  ? require('./e2e/E2EScreen').default
  : BENCHMARK_ENABLED
  ? require('./benchmarks/BenchmarkScreen').default
  : require('./DemoScreen').default;

export default function App(): React.JSX.Element {
  return <Screen />;
}
