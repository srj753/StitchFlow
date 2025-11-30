import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { patternCatalog } from '@/data/patterns/catalog';
import { parsePatternText } from '@/lib/patternParser';
import { usePatternStore } from '@/store/usePatternStore';

export default function PatternDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const importedPatterns = usePatternStore((state) => state.patterns);
  const toggleRowChecklist = usePatternStore((state) => state.toggleRowChecklist);
  const pattern = useMemo(
    () =>
      patternCatalog.find((item) => item.id === id) ||
      importedPatterns.find((item) => item.id === id),
    [id, importedPatterns],
  );
  const [tab, setTab] = useState<'smart' | 'original'>('smart');

  // Parse pattern text for checklist
  const parsedLines = useMemo(() => {
    if (!pattern?.snippet) return [];
    return parsePatternText(pattern.snippet);
  }, [pattern?.snippet]);

  const completedRows = useMemo(() => {
    return new Set(pattern?.rowChecklist || []);
  }, [pattern?.rowChecklist]);

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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <FontAwesome name="heart-o" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <FontAwesome name="share-square-o" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
            
            <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>PATTERN LIBRARY</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{pattern.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                by {pattern.designer}
            </Text>
            
            <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: theme.colors.surfaceAlt }]}>
                    <Text style={[styles.badgeText, { color: theme.colors.text }]}>{pattern.difficulty}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: theme.colors.surfaceAlt }]}>
                    <Text style={[styles.badgeText, { color: theme.colors.text }]}>{pattern.yarnWeight}</Text>
                </View>
            </View>
        </View>

        <TouchableOpacity
            onPress={handleUseInProject}
            style={[
            styles.primaryButton,
            {
                backgroundColor: theme.colors.accent,
            },
            ]}>
            <FontAwesome name="plus" size={16} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Start Project</Text>
        </TouchableOpacity>

        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>OVERVIEW</Text>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text style={{ color: theme.colors.textSecondary, marginBottom: 16, lineHeight: 22 }}>
                    {pattern.description}
                </Text>
                <View style={styles.metaGrid}>
                    <Meta label="Duration" value={pattern.duration} />
                    <Meta label="Hook Size" value={pattern.hookSize} />
                    <Meta label="Format" value={pattern.patternSourceType || 'Digital'} />
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.tabHeader}>
                {['smart', 'original'].map((key) => {
                const selected = tab === key;
                return (
                    <TouchableOpacity
                    key={key}
                    onPress={() => setTab(key as 'smart' | 'original')}
                    style={[
                        styles.tabChip,
                        {
                        borderBottomWidth: 2,
                        borderColor: selected ? theme.colors.accent : 'transparent',
                        },
                    ]}>
                    <Text
                        style={{
                        color: selected ? theme.colors.text : theme.colors.textSecondary,
                        fontWeight: '700',
                        fontSize: 14,
                        textTransform: 'uppercase',
                        }}>
                        {key === 'smart' ? 'Smart View' : 'Original Source'}
                    </Text>
                    </TouchableOpacity>
                );
                })}
            </View>
            
            <View style={[styles.card, { backgroundColor: theme.colors.surface, minHeight: 300 }]}>
                {tab === 'smart' ? (
                    parsedLines.length > 0 ? (
                        <View style={styles.checklistContainer}>
                            {parsedLines.map((line) => {
                                const isDone = completedRows.has(line.id);
                                const isHeader = line.type === 'header';

                                if (isHeader) {
                                    return (
                                        <Text key={line.id} style={[styles.sectionHeader, { color: theme.colors.accent }]}>
                                            {line.text}
                                        </Text>
                                    );
                                }

                                return (
                                    <TouchableOpacity
                                        key={line.id}
                                        onPress={() => pattern && toggleRowChecklist(pattern.id, line.id)}
                                        style={[
                                            styles.checkRow,
                                            {
                                                backgroundColor: isDone ? theme.colors.surfaceAlt : theme.colors.surface,
                                                borderColor: isDone ? 'transparent' : theme.colors.border,
                                            },
                                        ]}>
                                        <View
                                            style={[
                                                styles.checkbox,
                                                {
                                                    borderColor: isDone ? theme.colors.accent : theme.colors.muted,
                                                    backgroundColor: isDone ? theme.colors.accent : 'transparent',
                                                },
                                            ]}>
                                            {isDone && <FontAwesome name="check" size={10} color="#000" />}
                                        </View>
                                        <Text
                                            style={[
                                                styles.lineText,
                                                {
                                                    color: isDone ? theme.colors.textSecondary : theme.colors.text,
                                                    textDecorationLine: isDone ? 'line-through' : 'none',
                                                },
                                            ]}>
                                            {line.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={styles.smartView}>
                            <Text style={{ color: theme.colors.textSecondary, marginBottom: 12, lineHeight: 22 }}>
                                {pattern.snippet ??
                                'Smart parsing will surface steps, counts, and repeats as we roll out AI helpers.'}
                            </Text>
                            <View style={[styles.todoBox, { backgroundColor: theme.colors.surfaceAlt }]}>
                                <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                                    {pattern.snippet 
                                        ? '✨ Pattern text detected. Interactive checklist will appear here once parsing is complete.'
                                        : '✨ AI Features Coming Soon: PDF parsing, stitch detection, and interactive checklists.'}
                                </Text>
                            </View>
                        </View>
                    )
                ) : pattern.referenceUrl ? (
                    <View style={styles.webviewWrapper}>
                    <WebView source={{ uri: pattern.referenceUrl }} />
                    </View>
                ) : (
                    <View style={styles.smartView}>
                    <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 16 }}>
                        This pattern was imported from a file.
                    </Text>
                    <TouchableOpacity
                        onPress={handleOpenOriginal}
                        style={[
                        styles.secondaryButton,
                        { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
                        ]}>
                        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Open Original File</Text>
                    </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.meta}>
      <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  headerActions: {
      flexDirection: 'row',
      gap: 16,
  },
  backButton: {
      padding: 4,
  },
  iconButton: {
      padding: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  badgeRow: {
      flexDirection: 'row',
      gap: 8,
  },
  badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
  },
  badgeText: {
      fontSize: 12,
      fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 32,
  },
  primaryButtonText: {
    color: '#07080c',
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
      marginBottom: 24,
  },
  sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 12,
      paddingLeft: 4,
  },
  card: {
      borderRadius: 24,
      padding: 20,
  },
  metaGrid: {
      flexDirection: 'row',
      gap: 24,
      borderTopWidth: 1,
      borderTopColor: 'rgba(150,150,150,0.1)',
      paddingTop: 16,
  },
  meta: {
    gap: 2,
  },
  tabHeader: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  tabChip: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  smartView: {
    gap: 8,
  },
  todoBox: {
      padding: 12,
      borderRadius: 12,
      marginTop: 8,
  },
  webviewWrapper: {
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'center',
  },
  checklistContainer: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  lineText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
});
