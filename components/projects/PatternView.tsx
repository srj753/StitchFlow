import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Project } from '@/types/project';

type PatternViewProps = {
  project: Project;
};

export function PatternView({ project }: PatternViewProps) {
  const theme = useTheme();
  const updateCounter = useProjectsStore((state) => state.updateCounter);

  // Find primary row counter for HUD
  const rowCounter = project.counters.find(
    (c) => c.type === 'row' || c.label.toLowerCase().includes('row')
  );

  const handleIncrement = () => {
    if (rowCounter) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      updateCounter(project.id, rowCounter.id, rowCounter.currentValue + 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.accentMuted }]}>
              <FontAwesome name="file-text-o" size={20} color={theme.colors.accent} />
            </View>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>Pattern Instructions</Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                {project.patternName || 'Custom Project'}
              </Text>
            </View>
          </View>

          <View style={[styles.snippetBox, { backgroundColor: theme.colors.surfaceAlt }]}>
            {project.patternSnippet ? (
              <Text style={[styles.snippetText, { color: theme.colors.text }]}>
                {project.patternSnippet}
              </Text>
            ) : (
              <View style={styles.emptyState}>
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                  No pattern text added yet.{'\n'}Go to 'Track' tab to add snippets.
                </Text>
              </View>
            )}
          </View>

          {project.sourceUrl && (
            <TouchableOpacity
              onPress={() => Linking.openURL(project.sourceUrl!)}
              style={[
                styles.linkButton,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
              ]}>
              <FontAwesome name="external-link" size={16} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>
                Open Original PDF/Web
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Floating HUD */}
      {rowCounter && (
        <View style={[styles.hud, { backgroundColor: '#1c1917' }]}>
          <View>
            <Text style={styles.hudLabel}>{rowCounter.label}</Text>
            <Text style={styles.hudValue}>{rowCounter.currentValue}</Text>
          </View>
          <TouchableOpacity
            onPress={handleIncrement}
            activeOpacity={0.8}
            style={[styles.hudButton, { backgroundColor: theme.colors.accent }]}>
            <FontAwesome name="plus" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  snippetBox: {
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    marginBottom: 20,
  },
  snippetText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  hud: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 24,
    padding: 12,
    paddingLeft: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  hudLabel: {
    color: '#a8a29e',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hudValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  hudButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

