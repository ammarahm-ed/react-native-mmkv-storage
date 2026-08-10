import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
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
import { getBenchCases, runAllBenchmarks, formatResultsTable } from './index';
import type { BenchResult } from './framework';

const RESULT_MARKER = 'BENCHMARK_RESULTS_JSON';

const themes = {
  light: {
    background: '#f5f6f8',
    card: '#ffffff',
    text: '#11181c',
    muted: '#5b6770',
    accent: '#0b6bcb',
    border: '#e2e5e9'
  },
  dark: {
    background: '#0f1115',
    card: '#181b21',
    text: '#f2f4f7',
    muted: '#98a2b3',
    accent: '#69b7ff',
    border: '#262b33'
  }
};

const formatNumber = (value: number) =>
  value >= 1000 ? Math.round(value).toLocaleString() : value.toFixed(value >= 100 ? 0 : 2);

export default function BenchmarkScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? themes.dark : themes.light;

  const total = useMemo(() => getBenchCases().length, []);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [completed, setCompleted] = useState(0);
  const [results, setResults] = useState<BenchResult[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);

  const run = useCallback(async () => {
    setRunning(true);
    setResults([]);
    setCompleted(0);
    const startedAt = Date.now();

    const collected: BenchResult[] = [];
    await runAllBenchmarks({
      onCaseStart: testCase => setCurrent(`${testCase.group} · ${testCase.name}`),
      onCaseEnd: result => {
        collected.push(result);
        setResults(collected.slice());
        setCompleted(collected.length);
      }
    });

    const duration = Date.now() - startedAt;
    setElapsedMs(duration);
    setCurrent(null);
    setRunning(false);

    const summary = {
      platform: Platform.OS,
      version: String(Platform.Version),
      durationMs: duration,
      results: collected.map(result => ({
        group: result.group,
        name: result.name,
        ops: result.ops,
        opsPerSec: Math.round(result.opsPerSec),
        meanUs: Number(result.meanUs.toFixed(3)),
        p50Us: Number(result.p50Us.toFixed(3)),
        p95Us: Number(result.p95Us.toFixed(3)),
        p99Us: Number(result.p99Us.toFixed(3))
      }))
    };

    console.log(formatResultsTable(collected));
    console.log(`${RESULT_MARKER} ${JSON.stringify(summary)}`);
    report('benchmark', summary);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(run, 500);
    return () => clearTimeout(timeout);
  }, [run]);

  const grouped = useMemo(() => {
    const byGroup: { [group: string]: BenchResult[] } = {};
    results.forEach(result => {
      (byGroup[result.group] || (byGroup[result.group] = [])).push(result);
    });
    return byGroup;
  }, [results]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <HookHost />
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>MMKV Storage Benchmarks</Text>
        <Text testID="benchmark-status" style={[styles.subtitle, { color: theme.muted }]}>
          {running
            ? `${completed}/${total} · ${current ?? ''}`
            : results.length
            ? `Done · ${results.length} benchmarks · ${(elapsedMs / 1000).toFixed(1)}s`
            : `${total} benchmarks ready`}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          testID="benchmark-run"
          disabled={running}
          onPress={run}
          style={[styles.button, { backgroundColor: running ? theme.muted : theme.accent }]}
        >
          <Text style={styles.buttonLabel}>{running ? 'Running' : results.length ? 'Run again' : 'Run benchmarks'}</Text>
        </TouchableOpacity>
      </View>

      {running && results.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.text} />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll}>
        {Object.keys(grouped).map(groupName => (
          <View key={groupName} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.groupName, { color: theme.text }]}>{groupName}</Text>
            <View style={[styles.row, styles.headerRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.cellName, styles.headerCell, { color: theme.muted }]}>benchmark</Text>
              <Text style={[styles.cell, styles.headerCell, { color: theme.muted }]}>ops/sec</Text>
              <Text style={[styles.cell, styles.headerCell, { color: theme.muted }]}>mean (µs)</Text>
              <Text style={[styles.cell, styles.headerCell, { color: theme.muted }]}>p95 (µs)</Text>
            </View>
            {grouped[groupName].map(result => (
              <View key={`${result.group}-${result.name}`} style={styles.row}>
                <Text style={[styles.cellName, { color: theme.text }]} numberOfLines={2}>
                  {result.name}
                </Text>
                <Text style={[styles.cell, { color: theme.accent, fontWeight: '700' }]}>
                  {formatNumber(result.opsPerSec)}
                </Text>
                <Text style={[styles.cell, { color: theme.text }]}>{result.meanUs.toFixed(2)}</Text>
                <Text style={[styles.cell, { color: theme.muted }]}>{result.p95Us.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 4, fontSize: 13 },
  actions: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12 },
  button: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  buttonLabel: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  loading: { paddingVertical: 24 },
  scroll: { padding: 16, paddingBottom: 48, gap: 12 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14 },
  groupName: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  headerRow: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 6, marginBottom: 4 },
  headerCell: { fontSize: 11, letterSpacing: 0.3 },
  cellName: { flex: 2.4, fontSize: 12 },
  cell: { flex: 1, fontSize: 12, textAlign: 'right', fontVariant: ['tabular-nums'] }
});
