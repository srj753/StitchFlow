import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { patternCatalog } from '@/data/patterns/catalog';
import { usePatternStore } from '@/store/usePatternStore';

export default function PatternDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const importedPatterns = usePatternStore((state) => state.patterns);
  const pattern = useMemo(
    () =>
      patternCatalog.find((item) => item.id === id) ||
      importedPatterns.find((item) => item.id === id),
    [id, importedPatterns],
  );
  const [tab, setTab] = useState<'smart' | 'original'>('smart');

  if (!pattern) {
    return (
      <Screen>
        <Card title="Pattern not found">
          <Text style={{ color: theme.colors.textSecondary }}>
            We couldn’t locate this pattern. It may have been removed or you opened an outdated link.
          </Text>
        </Card>
      </Screen>
    );
  }

  const handleUseInProject = () => {
    router.push({
      pathname: '/projects/create',
      params: { patternId: pattern.id },
    });
  };

  const handleOpenOriginal = () => {
    if (pattern.referenceUrl) {
      Linking.openURL(pattern.referenceUrl);
    } else if (pattern.fileUri) {
      Linking.openURL(pattern.fileUri);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Pattern</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>{pattern.name}</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            {pattern.designer} · {pattern.difficulty}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleUseInProject}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.colors.accent,
                },
              ]}>
              <Text style={styles.primaryButtonText}>Use in project</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[
                styles.secondaryButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceAlt,
                },
              ]}>
              <Text style={{ color: theme.colors.textSecondary }}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card title="Overview" subtitle="Quick facts">
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 16 }}>
            {pattern.description}
          </Text>
          <View style={styles.metaRow}>
            <Meta label="Duration" value={pattern.duration} />
            <Meta label="Yarn weight" value={pattern.yarnWeight} />
            <Meta label="Hook" value={pattern.hookSize} />
          </View>
        </Card>

        <Card title="View" subtitle="Smart notes vs. original source">
          <View style={styles.tabRow}>
            {['smart', 'original'].map((key) => {
              const selected = tab === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setTab(key as 'smart' | 'original')}
                  style={[
                    styles.tabChip,
                    {
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                      backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    },
                  ]}>
                  <Text
                    style={{
                      color: selected ? theme.colors.accent : theme.colors.textSecondary,
                      fontWeight: '600',
                    }}>
                    {key === 'smart' ? 'Smart view' : 'Original'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {tab === 'smart' ? (
            <View style={styles.smartView}>
              <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>
                {pattern.snippet ??
                  'Smart parsing will surface steps, counts, and repeats as we roll out AI helpers.'}
              </Text>
              <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                TODO: Parse PDF/text, detect stitches, and allow row checklists.
              </Text>
            </View>
          ) : pattern.referenceUrl ? (
            <View style={styles.webviewWrapper}>
              <WebView source={{ uri: pattern.referenceUrl }} />
            </View>
          ) : (
            <View style={styles.smartView}>
              <Text style={{ color: theme.colors.textSecondary }}>
                This pattern was imported from a file. Tap below to open it in your browser or PDF
                viewer.
              </Text>
              <TouchableOpacity
                onPress={handleOpenOriginal}
                style={[
                  styles.secondaryButton,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
                ]}>
                <Text style={{ color: theme.colors.text }}>Open original</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.meta}>
      <Text style={{ color: theme.colors.muted, fontSize: 12, letterSpacing: 0.3 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#07080c',
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  smartView: {
    gap: 8,
  },
  webviewWrapper: {
    height: 400,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

