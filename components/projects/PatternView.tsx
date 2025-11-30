import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useTheme } from '@/hooks/useTheme';
import { parsePatternText } from '@/lib/patternParser';
import { Project } from '@/types/project';

type PatternViewProps = {
  project: Project;
};

type ViewMode = 'smart' | 'original';

export function PatternView({ project }: PatternViewProps) {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('smart');
  const [completedLines, setCompletedLines] = useState<Set<string>>(new Set());

  // Parse the pattern snippet into interactive lines
  const parsedLines = useMemo(() => {
    return parsePatternText(project.patternSnippet || '');
  }, [project.patternSnippet]);

  const toggleLine = (id: string) => {
    const next = new Set(completedLines);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCompletedLines(next);
  };

  const renderSmartView = () => {
    if (parsedLines.length === 0) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome name="file-text-o" size={48} color={theme.colors.border} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No pattern text found. Paste your pattern in the 'Track' tab to see the checklist here.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.checklistContainer}>
        {parsedLines.map((line) => {
          const isDone = completedLines.has(line.id);
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
              onPress={() => toggleLine(line.id)}
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
    );
  };

  const renderOriginalView = () => {
    if (project.sourceUrl && Platform.OS !== 'web') {
      return (
        <View style={styles.webviewContainer}>
          <WebView source={{ uri: project.sourceUrl }} style={{ flex: 1 }} />
        </View>
      );
    }

    return (
      <ScrollView style={[styles.rawTextContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.rawText, { color: theme.colors.text }]}>
          {project.patternSnippet || 'No pattern text available.'}
        </Text>
        {project.sourceUrl && Platform.OS === 'web' && (
            <Text style={{color: theme.colors.accent, marginTop: 20}}>
                Original URL: {project.sourceUrl} (Open in new tab)
            </Text>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Mode Toggle */}
      <View style={styles.toggleContainer}>
        <View style={[styles.toggleBar, { backgroundColor: theme.colors.surfaceAlt }]}>
          <TouchableOpacity
            onPress={() => setViewMode('smart')}
            style={[
              styles.toggleButton,
              viewMode === 'smart' && { backgroundColor: theme.colors.card },
            ]}>
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'smart' ? theme.colors.text : theme.colors.textSecondary },
              ]}>
              Smart View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('original')}
            style={[
              styles.toggleButton,
              viewMode === 'original' && { backgroundColor: theme.colors.card },
            ]}>
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'original' ? theme.colors.text : theme.colors.textSecondary },
              ]}>
              Original
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {viewMode === 'smart' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {renderSmartView()}
        </ScrollView>
      ) : (
        <View style={styles.fullScreenContent}>{renderOriginalView()}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 4,
  },
  fullScreenContent: {
    flex: 1,
    paddingBottom: 100, // Space for floating counter
  },
  toggleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toggleBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
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
  webviewContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  rawTextContainer: {
    flex: 1,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },
  rawText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
