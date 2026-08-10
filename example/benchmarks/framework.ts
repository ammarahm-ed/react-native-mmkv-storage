export type BenchCase = {
  group: string;
  name: string;
  run: (iteration: number) => void | Promise<void>;
  setup?: () => void | Promise<void>;
  teardown?: () => void | Promise<void>;
  iterations?: number;
  batch?: number;
  warmup?: number;
  opsPerRun?: number;
  unit?: string;
};

export type BenchResult = {
  group: string;
  name: string;
  ops: number;
  totalMs: number;
  opsPerSec: number;
  meanUs: number;
  p50Us: number;
  p95Us: number;
  p99Us: number;
  minUs: number;
  maxUs: number;
  unit: string;
};

const registry: BenchCase[] = [];
const groupOrder: string[] = [];

let currentGroup: string | null = null;

export function group(name: string, body: () => void) {
  if (groupOrder.indexOf(name) === -1) groupOrder.push(name);
  currentGroup = name;
  body();
  currentGroup = null;
}

export function bench(
  name: string,
  run: (iteration: number) => void | Promise<void>,
  options: Omit<BenchCase, 'group' | 'name' | 'run'> = {}
) {
  if (!currentGroup) throw new Error(`bench("${name}") declared outside of a group`);
  registry.push({ group: currentGroup, name, run, ...options });
}

export function getBenchCases(): BenchCase[] {
  return registry.slice();
}

export function getGroupNames(): string[] {
  return groupOrder.slice();
}

const now = (): number => {
  const perf = (globalThis as { performance?: { now?: () => number } }).performance;
  return typeof perf?.now === 'function' ? perf.now() : Date.now();
};

const percentile = (sorted: number[], fraction: number) => {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(fraction * sorted.length) - 1));
  return sorted[index];
};

export const DEFAULT_ITERATIONS = 2000;
export const DEFAULT_BATCH = 50;

export async function runBench(testCase: BenchCase): Promise<BenchResult> {
  const iterations = testCase.iterations ?? DEFAULT_ITERATIONS;
  const batch = Math.max(1, Math.min(testCase.batch ?? DEFAULT_BATCH, iterations));
  const warmup = testCase.warmup ?? Math.min(50, Math.ceil(iterations / 10));
  const opsPerRun = testCase.opsPerRun ?? 1;
  const rounds = Math.max(1, Math.floor(iterations / batch));

  if (testCase.setup) await testCase.setup();

  let counter = 0;
  for (let i = 0; i < warmup; i++) {
    await testCase.run(counter++);
  }

  const perOpUs: number[] = [];
  let totalMs = 0;

  for (let round = 0; round < rounds; round++) {
    const start = now();
    for (let i = 0; i < batch; i++) {
      await testCase.run(counter++);
    }
    const elapsed = now() - start;
    totalMs += elapsed;
    perOpUs.push((elapsed * 1000) / (batch * opsPerRun));
    if (round % 10 === 0) await new Promise<void>(resolve => setTimeout(resolve, 0));
  }

  if (testCase.teardown) await testCase.teardown();

  const ops = rounds * batch * opsPerRun;
  const sorted = perOpUs.slice().sort((a, b) => a - b);

  return {
    group: testCase.group,
    name: testCase.name,
    ops,
    totalMs,
    opsPerSec: totalMs > 0 ? (ops / totalMs) * 1000 : 0,
    meanUs: (totalMs * 1000) / ops,
    p50Us: percentile(sorted, 0.5),
    p95Us: percentile(sorted, 0.95),
    p99Us: percentile(sorted, 0.99),
    minUs: sorted[0] ?? 0,
    maxUs: sorted[sorted.length - 1] ?? 0,
    unit: testCase.unit ?? 'op'
  };
}

export type BenchRunEvents = {
  onCaseStart?: (testCase: BenchCase, index: number, total: number) => void;
  onCaseEnd?: (result: BenchResult, index: number, total: number) => void;
};

export async function runAllBenchmarks(events: BenchRunEvents = {}): Promise<BenchResult[]> {
  const cases = getBenchCases();
  const results: BenchResult[] = [];

  for (let i = 0; i < cases.length; i++) {
    events.onCaseStart?.(cases[i], i, cases.length);
    const result = await runBench(cases[i]);
    results.push(result);
    events.onCaseEnd?.(result, i, cases.length);
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  }

  return results;
}

export function formatResultsTable(results: BenchResult[]): string {
  const header = ['group', 'benchmark', 'ops/sec', 'mean µs', 'p50 µs', 'p95 µs', 'p99 µs'];
  const rows = results.map(result => [
    result.group,
    result.name,
    Math.round(result.opsPerSec).toLocaleString(),
    result.meanUs.toFixed(2),
    result.p50Us.toFixed(2),
    result.p95Us.toFixed(2),
    result.p99Us.toFixed(2)
  ]);
  const widths = header.map((_column, index) =>
    Math.max(header[index].length, ...rows.map(row => row[index].length))
  );
  const line = (cells: string[]) => cells.map((cell, index) => cell.padEnd(widths[index])).join('  ');
  return [line(header), line(widths.map(width => '-'.repeat(width))), ...rows.map(line)].join('\n');
}
