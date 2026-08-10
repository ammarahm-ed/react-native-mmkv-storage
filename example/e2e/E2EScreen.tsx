import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { HookHost } from '../testing/hookHost';
import { report } from '../testing/reporter';
import { runTests, getRegisteredTests } from './index';
import type { RunSummary, TestResult } from '../testing/framework';

const RESULT_MARKER = 'E2E_RESULTS_JSON';

type Theme = {
  background: string;
  card: string;
  text: string;
  muted: string;
  pass: string;
  fail: string;
  skip: string;
  border: string;
};

const themes: { light: Theme; dark: Theme } = {
  light: {
    background: '#f5f6f8',
    card: '#ffffff',
    text: '#11181c',
    muted: '#5b6770',
    pass: '#118a3d',
    fail: '#c2255c',
    skip: '#8a6d00',
    border: '#e2e5e9'
  },
  dark: {
    background: '#0f1115',
    card: '#181b21',
    text: '#f2f4f7',
    muted: '#98a2b3',
    pass: '#3ddc84',
    fail: '#ff6b8b',
    skip: '#ffd166',
    border: '#262b33'
  }
};

export default function E2EScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? themes.dark : themes.light;

  const total = useMemo(() => getRegisteredTests().length, []);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [showPassing, setShowPassing] = useState(false);

  const run = useCallback(async () => {
    setRunning(true);
    setResults([]);
    setSummary(null);
    setCompleted(0);

    const collected: TestResult[] = [];
    const runSummary = await runTests({
      onTestEnd: result => {
        collected.push(result);
        setCompleted(collected.length);
        if (result.status === 'failed') {
          console.log(`FAIL ${result.suite} > ${result.name}: ${result.error}`);
        }
      }
    });

    setResults(collected);
    setSummary(runSummary);
    setRunning(false);

    const summary = {
      passed: runSummary.passed,
      failed: runSummary.failed,
      skipped: runSummary.skipped,
      total: runSummary.results.length,
      durationMs: Math.round(runSummary.durationMs),
      failures: runSummary.results
        .filter(result => result.status === 'failed')
        .map(result => ({ suite: result.suite, name: result.name, error: result.error }))
    };

    console.log(`${RESULT_MARKER} ${JSON.stringify(summary)}`);
    report('e2e', summary);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(run, 300);
    return () => clearTimeout(timeout);
  }, [run]);

  const grouped = useMemo(() => {
    const bySuite: { [suite: string]: TestResult[] } = {};
    results.forEach(result => {
      (bySuite[result.suite] || (bySuite[result.suite] = [])).push(result);
    });
    return bySuite;
  }, [results]);

  const statusColor = (status: TestResult['status']) =>
    status === 'passed' ? theme.pass : status === 'failed' ? theme.fail : theme.skip;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <HookHost />
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>MMKV Storage E2E</Text>
        <Text testID="e2e-status" style={[styles.subtitle, { color: theme.muted }]}>
          {running
            ? `Running ${completed}/${total}`
            : summary
            ? `${summary.failed === 0 ? 'PASS' : 'FAIL'} · ${summary.passed} passed · ${summary.failed} failed · ${
                summary.skipped
              } skipped · ${Math.round(summary.durationMs)}ms`
            : 'Idle'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          testID="e2e-run"
          disabled={running}
          onPress={run}
          style={[styles.button, { backgroundColor: running ? theme.muted : theme.text }]}
        >
          <Text style={[styles.buttonLabel, { color: theme.background }]}>
            {running ? 'Running' : 'Run again'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowPassing(value => !value)}
          style={[styles.button, styles.secondaryButton, { borderColor: theme.border }]}
        >
          <Text style={[styles.buttonLabel, { color: theme.text }]}>
            {showPassing ? 'Hide passing' : 'Show passing'}
          </Text>
        </TouchableOpacity>
      </View>

      {running && results.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.text} />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll}>
        {Object.keys(grouped).map(suiteName => {
          const suiteResults = grouped[suiteName];
          const failed = suiteResults.filter(result => result.status === 'failed');
          const visible = showPassing ? suiteResults : failed;
          return (
            <View key={suiteName} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.suiteName, { color: theme.text }]}>{suiteName}</Text>
                <Text style={{ color: failed.length ? theme.fail : theme.pass, fontWeight: '700' }}>
                  {suiteResults.length - failed.length}/{suiteResults.length}
                </Text>
              </View>
              {visible.map(result => (
                <View key={`${result.suite}-${result.name}`} style={styles.testRow}>
                  <Text style={[styles.testName, { color: statusColor(result.status) }]}>
                    {result.status === 'passed' ? '✓' : result.status === 'failed' ? '✕' : '○'} {result.name}
                    <Text style={{ color: theme.muted }}> {Math.round(result.durationMs)}ms</Text>
                  </Text>
                  {result.error ? (
                    <Text style={[styles.error, { color: theme.fail }]}>{result.error}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 4, fontSize: 14, fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  button: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1 },
  buttonLabel: { fontWeight: '600', fontSize: 14 },
  loading: { paddingVertical: 24 },
  scroll: { padding: 16, paddingBottom: 48, gap: 12 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  suiteName: { fontSize: 16, fontWeight: '700' },
  testRow: { paddingVertical: 4 },
  testName: { fontSize: 13, lineHeight: 18 },
  error: { fontSize: 12, marginTop: 4, fontFamily: undefined }
});
