import './suites/loader';
import './suites/sync';
import './suites/async';
import './suites/bulk';
import './suites/general';
import './suites/indexer';
import './suites/transactions';
import './suites/encryption';
import './suites/events';
import './suites/hooks';
import './suites/regressions';
import './suites/keyloss';

export { runTests, getRegisteredTests, getSuiteNames } from '../testing/framework';
export type { TestResult, RunSummary } from '../testing/framework';
