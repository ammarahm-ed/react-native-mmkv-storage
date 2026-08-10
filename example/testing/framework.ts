export type TestStatus = 'passed' | 'failed' | 'skipped';

export type TestFn = () => void | Promise<void>;

export type TestCase = {
  suite: string;
  name: string;
  fn: TestFn;
  skip?: boolean;
};

export type TestResult = {
  suite: string;
  name: string;
  status: TestStatus;
  durationMs: number;
  error?: string;
};

export type SuiteHooks = {
  beforeAll?: TestFn;
  afterAll?: TestFn;
  beforeEach?: TestFn;
  afterEach?: TestFn;
};

const registry: TestCase[] = [];
const suiteHooks: { [suite: string]: SuiteHooks } = {};
const suiteOrder: string[] = [];

let currentSuite: string | null = null;

export function suite(name: string, body: () => void) {
  if (suiteOrder.indexOf(name) === -1) suiteOrder.push(name);
  currentSuite = name;
  body();
  currentSuite = null;
}

export function test(name: string, fn: TestFn) {
  if (!currentSuite) throw new Error(`test("${name}") declared outside of a suite`);
  registry.push({ suite: currentSuite, name, fn });
}

test.skip = (name: string, fn: TestFn) => {
  if (!currentSuite) throw new Error(`test.skip("${name}") declared outside of a suite`);
  registry.push({ suite: currentSuite, name, fn, skip: true });
};

function setHook(key: keyof SuiteHooks, fn: TestFn) {
  if (!currentSuite) throw new Error(`${key} declared outside of a suite`);
  const hooks = suiteHooks[currentSuite] || (suiteHooks[currentSuite] = {});
  hooks[key] = fn;
}

export const beforeAll = (fn: TestFn) => setHook('beforeAll', fn);
export const afterAll = (fn: TestFn) => setHook('afterAll', fn);
export const beforeEach = (fn: TestFn) => setHook('beforeEach', fn);
export const afterEach = (fn: TestFn) => setHook('afterEach', fn);

export function getRegisteredTests(): TestCase[] {
  return registry.slice();
}

export function getSuiteNames(): string[] {
  return suiteOrder.slice();
}

function stringify(value: any): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return Number.isNaN(a) && Number.isNaN(b);
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export class AssertionError extends Error {}

function fail(message: string): never {
  throw new AssertionError(message);
}

export type Matchers = {
  toBe(expected: any): void;
  toEqual(expected: any): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toBeNullish(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeInstanceOf(ctor: Function): void;
  toBeTypeOf(type: string): void;
  toHaveLength(length: number): void;
  toContain(item: any): void;
  toBeGreaterThan(value: number): void;
  toBeGreaterThanOrEqual(value: number): void;
  toBeLessThan(value: number): void;
  toHaveProperty(key: string, value?: any): void;
  toMatch(pattern: RegExp | string): void;
  toThrow(expected?: string | RegExp): void;
  not: Omit<Matchers, 'not'>;
};

function createMatchers(actual: any, negated: boolean): Matchers {
  const check = (pass: boolean, message: string, negatedMessage: string) => {
    if (negated ? pass : !pass) fail(negated ? negatedMessage : message);
  };

  const matchers = {
    toBe(expected: any) {
      check(
        Object.is(actual, expected),
        `expected ${stringify(actual)} to be ${stringify(expected)}`,
        `expected ${stringify(actual)} not to be ${stringify(expected)}`
      );
    },
    toEqual(expected: any) {
      check(
        deepEqual(actual, expected),
        `expected ${stringify(actual)} to equal ${stringify(expected)}`,
        `expected ${stringify(actual)} not to equal ${stringify(expected)}`
      );
    },
    toBeNull() {
      check(actual === null, `expected ${stringify(actual)} to be null`, 'expected value not to be null');
    },
    toBeUndefined() {
      check(
        actual === undefined,
        `expected ${stringify(actual)} to be undefined`,
        'expected value not to be undefined'
      );
    },
    toBeDefined() {
      check(actual !== undefined, 'expected value to be defined', 'expected value to be undefined');
    },
    toBeNullish() {
      check(
        actual === null || actual === undefined,
        `expected ${stringify(actual)} to be null or undefined`,
        `expected ${stringify(actual)} not to be null or undefined`
      );
    },
    toBeTruthy() {
      check(!!actual, `expected ${stringify(actual)} to be truthy`, `expected ${stringify(actual)} to be falsy`);
    },
    toBeFalsy() {
      check(!actual, `expected ${stringify(actual)} to be falsy`, `expected ${stringify(actual)} to be truthy`);
    },
    toBeInstanceOf(ctor: Function) {
      check(
        actual instanceof ctor,
        `expected value to be an instance of ${ctor.name}`,
        `expected value not to be an instance of ${ctor.name}`
      );
    },
    toBeTypeOf(type: string) {
      check(
        typeof actual === type,
        `expected typeof ${stringify(actual)} to be ${type}, got ${typeof actual}`,
        `expected typeof value not to be ${type}`
      );
    },
    toHaveLength(length: number) {
      const actualLength = actual == null ? undefined : actual.length;
      check(
        actualLength === length,
        `expected length ${stringify(actualLength)} to be ${length}`,
        `expected length not to be ${length}`
      );
    },
    toContain(item: any) {
      const contains = Array.isArray(actual)
        ? actual.some(entry => deepEqual(entry, item))
        : typeof actual === 'string'
        ? actual.indexOf(item) !== -1
        : false;
      check(
        contains,
        `expected ${stringify(actual)} to contain ${stringify(item)}`,
        `expected ${stringify(actual)} not to contain ${stringify(item)}`
      );
    },
    toBeGreaterThan(value: number) {
      check(actual > value, `expected ${stringify(actual)} to be greater than ${value}`, `expected ${stringify(actual)} not to be greater than ${value}`);
    },
    toBeGreaterThanOrEqual(value: number) {
      check(
        actual >= value,
        `expected ${stringify(actual)} to be >= ${value}`,
        `expected ${stringify(actual)} not to be >= ${value}`
      );
    },
    toBeLessThan(value: number) {
      check(actual < value, `expected ${stringify(actual)} to be less than ${value}`, `expected ${stringify(actual)} not to be less than ${value}`);
    },
    toHaveProperty(key: string, value?: any) {
      const has = actual != null && Object.prototype.hasOwnProperty.call(actual, key);
      const matches = arguments.length < 2 ? has : has && deepEqual(actual[key], value);
      check(
        matches,
        `expected ${stringify(actual)} to have property ${key}${arguments.length > 1 ? ` = ${stringify(value)}` : ''}`,
        `expected ${stringify(actual)} not to have property ${key}`
      );
    },
    toMatch(pattern: RegExp | string) {
      const str = String(actual);
      const matches = typeof pattern === 'string' ? str.indexOf(pattern) !== -1 : pattern.test(str);
      check(matches, `expected ${stringify(str)} to match ${pattern}`, `expected ${stringify(str)} not to match ${pattern}`);
    },
    toThrow(expected?: string | RegExp) {
      if (typeof actual !== 'function') fail('toThrow expects a function');
      let thrown: any = null;
      let didThrow = false;
      try {
        actual();
      } catch (e) {
        didThrow = true;
        thrown = e;
      }
      if (negated) {
        if (didThrow) fail(`expected function not to throw, but it threw ${stringify(thrown?.message ?? thrown)}`);
        return;
      }
      if (!didThrow) fail('expected function to throw, but it did not');
      if (expected !== undefined) {
        const message = String(thrown?.message ?? thrown);
        const matches = typeof expected === 'string' ? message.indexOf(expected) !== -1 : expected.test(message);
        if (!matches) fail(`expected error message ${stringify(message)} to match ${expected}`);
      }
    }
  } as Matchers;

  if (!negated) {
    matchers.not = createMatchers(actual, true) as Omit<Matchers, 'not'>;
  }

  return matchers;
}

export function expect(actual: any): Matchers {
  return createMatchers(actual, false);
}

export async function expectRejects(promise: Promise<any>, expected?: string | RegExp) {
  let threw = false;
  let error: any = null;
  try {
    await promise;
  } catch (e) {
    threw = true;
    error = e;
  }
  if (!threw) fail('expected promise to reject, but it resolved');
  if (expected !== undefined) {
    const message = String(error?.message ?? error);
    const matches = typeof expected === 'string' ? message.indexOf(expected) !== -1 : expected.test(message);
    if (!matches) fail(`expected rejection ${stringify(message)} to match ${expected}`);
  }
}

export type RunnerEvents = {
  onTestStart?: (test: TestCase, index: number, total: number) => void;
  onTestEnd?: (result: TestResult, index: number, total: number) => void;
};

export type RunSummary = {
  results: TestResult[];
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
};

const now = (): number => {
  const perf = (globalThis as { performance?: { now?: () => number } }).performance;
  return typeof perf?.now === 'function' ? perf.now() : Date.now();
};

export async function runTests(events: RunnerEvents = {}): Promise<RunSummary> {
  const tests = getRegisteredTests();
  const results: TestResult[] = [];
  const startedAt = now();
  let lastSuite: string | null = null;

  for (let i = 0; i < tests.length; i++) {
    const testCase = tests[i];
    const hooks = suiteHooks[testCase.suite] || {};

    if (lastSuite !== testCase.suite) {
      if (lastSuite && suiteHooks[lastSuite]?.afterAll) {
        try {
          await suiteHooks[lastSuite].afterAll!();
        } catch (e) {}
      }
      lastSuite = testCase.suite;
      if (hooks.beforeAll) {
        try {
          await hooks.beforeAll();
        } catch (e: any) {
          results.push({
            suite: testCase.suite,
            name: 'beforeAll',
            status: 'failed',
            durationMs: 0,
            error: e?.message ?? String(e)
          });
        }
      }
    }

    events.onTestStart?.(testCase, i, tests.length);

    if (testCase.skip) {
      const result: TestResult = {
        suite: testCase.suite,
        name: testCase.name,
        status: 'skipped',
        durationMs: 0
      };
      results.push(result);
      events.onTestEnd?.(result, i, tests.length);
      continue;
    }

    const testStart = now();
    let error: string | undefined;

    try {
      if (hooks.beforeEach) await hooks.beforeEach();
      await testCase.fn();
    } catch (e: any) {
      error = e?.message ?? String(e);
      if (e && e.stack && !(e instanceof AssertionError)) {
        error = `${error}\n${String(e.stack).split('\n').slice(1, 4).join('\n')}`;
      }
    }

    try {
      if (hooks.afterEach) await hooks.afterEach();
    } catch (e: any) {
      error = error ?? `afterEach failed: ${e?.message ?? String(e)}`;
    }

    const result: TestResult = {
      suite: testCase.suite,
      name: testCase.name,
      status: error ? 'failed' : 'passed',
      durationMs: now() - testStart,
      error
    };
    results.push(result);
    events.onTestEnd?.(result, i, tests.length);
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  }

  if (lastSuite && suiteHooks[lastSuite]?.afterAll) {
    try {
      await suiteHooks[lastSuite].afterAll!();
    } catch (e) {}
  }

  return {
    results,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    durationMs: now() - startedAt
  };
}
