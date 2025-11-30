import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ProjectForm, ProjectFormPrefill } from '@/components/projects/ProjectForm';
import { patternCatalog } from '@/data/patterns/catalog';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { patternDraftToProjectPrefill } from '@/lib/patternDraft';
import { usePatternDraftStore } from '@/store/usePatternDraftStore';
import { usePatternStore } from '@/store/usePatternStore';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Pattern } from '@/types/pattern';
import { ProjectInput } from '@/types/project';

export default function CreateProjectScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess } = useToast();
  const addProject = useProjectsStore((state) => state.addProject);
  const draft = usePatternDraftStore((state) => state.draft);
  const importedPatterns = usePatternStore((state) => state.patterns);
  const params = useLocalSearchParams<{ patternId?: string; source?: string }>();
  const rawPatternParam = params.patternId;
  const patternId =
    typeof rawPatternParam === 'string'
      ? rawPatternParam
      : Array.isArray(rawPatternParam)
      ? rawPatternParam[0]
      : undefined;
  const rawSourceParam = params.source;
  const sourceParam =
    typeof rawSourceParam === 'string'
      ? rawSourceParam
      : Array.isArray(rawSourceParam)
      ? rawSourceParam[0]
      : undefined;
  const fromDraft = sourceParam === 'draft';

  const patternTemplate = useMemo(() => {
    if (!patternId) return undefined;
    return (
      patternCatalog.find((pattern) => pattern.id === patternId) ??
      importedPatterns.find((pattern) => pattern.id === patternId)
    );
  }, [importedPatterns, patternId]);

  const patternPrefill = useMemo<ProjectFormPrefill | undefined>(
    () => (patternTemplate ? patternToPrefill(patternTemplate) : undefined),
    [patternTemplate],
  );

  const draftPrefill = useMemo<ProjectFormPrefill | undefined>(
    () => (fromDraft ? patternDraftToProjectPrefill(draft) : undefined),
    [draft, fromDraft],
  );

  const resolvedPrefill = patternPrefill ?? draftPrefill;
  const prefillKey =
    patternTemplate?.id ?? (fromDraft ? `draft-${draft.updatedAt}` : 'default');

  const handleSubmit = (input: ProjectInput) => {
    const created = addProject(input);
    showSuccess(`Project "${created.name}" created!`);
    
    // If a preset was selected, apply it to the new project
    // Note: This would require passing preset info through the form
    // For now, users can apply presets in the project detail view
    
    setTimeout(() => {
      router.replace({
        pathname: '/projects/[id]',
        params: { id: created.id },
      });
    }, 0);
  };

  const handleClearTemplate = () => {
    router.replace('/projects/create');
  };

  const handleViewPattern = () => {
    router.push('/patterns');
  };

  const handleEditDraft = () => {
    router.push('/create-pattern');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <FontAwesome name="times" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>NEW PROJECT</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Start fresh</Text>
          </View>
        </View>

        {patternTemplate ? (
          <View style={[styles.templateCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.templateHeader}>
                <FontAwesome name="file-text-o" size={20} color={theme.colors.accent} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.templateTitle, { color: theme.colors.text }]}>Template Loaded</Text>
                    <Text style={{ color: theme.colors.textSecondary }}>{patternTemplate.name}</Text>
                </View>
                <TouchableOpacity onPress={handleClearTemplate}>
                    <FontAwesome name="times-circle" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.templateActions}>
                <TouchableOpacity onPress={handleViewPattern}>
                    <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>View Pattern</Text>
                </TouchableOpacity>
            </View>
          </View>
        ) : fromDraft && draftPrefill ? (
          <View style={[styles.templateCard, { backgroundColor: theme.colors.surface }]}>
             <View style={styles.templateHeader}>
                <FontAwesome name="pencil-square-o" size={20} color={theme.colors.accent} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.templateTitle, { color: theme.colors.text }]}>Draft Loaded</Text>
                    <Text style={{ color: theme.colors.textSecondary }}>From Pattern Maker</Text>
                </View>
                <TouchableOpacity onPress={handleClearTemplate}>
                    <FontAwesome name="times-circle" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
             <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
             <View style={styles.templateActions}>
                <TouchableOpacity onPress={handleEditDraft}>
                    <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>Edit Draft</Text>
                </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <ProjectForm
            onSubmit={handleSubmit}
            submitLabel="Create Project"
            prefill={resolvedPrefill}
            prefillKey={prefillKey}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  backButton: {
      marginTop: 4,
      padding: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  templateCard: {
      borderRadius: 20,
      padding: 16,
      marginBottom: 24,
  },
  templateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  templateTitle: {
      fontSize: 16,
      fontWeight: '700',
  },
  divider: {
      height: 1,
      opacity: 0.1,
      marginVertical: 12,
  },
  templateActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
  },
});

function TemplateMeta({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.templateMeta}>
      <Text style={[styles.templateMetaLabel, { color: theme.colors.muted }]}>{label}</Text>
      <Text style={[styles.templateMetaValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

function patternToPrefill(pattern: Pattern): ProjectFormPrefill {
  return {
    name: pattern.name,
    patternName: pattern.name,
    patternSourceType: pattern.patternSourceType ?? 'built-in',
    referenceLink: pattern.referenceUrl,
    notes:
      pattern.notes ??
      `Inspired by ${pattern.designer}. ${pattern.description}`,
    snippet:
      pattern.snippet ??
      `Stitches in play: ${pattern.stitches.join(', ')}.`,
    yarnWeight: pattern.yarnWeight,
    hookSize: parseHookSize(pattern.hookSize),
    targetHeight: pattern.targetHeightInches
      ? String(pattern.targetHeightInches)
      : undefined,
    roundGoal: pattern.estimatedRounds ? String(pattern.estimatedRounds) : undefined,
    colorPalette: pattern.palette,
    paletteMode: 'custom',
  };
}

function parseHookSize(value?: string) {
  if (!value) return undefined;
  const match = value.match(/[\d.]+/);
  return match ? match[0] : undefined;
}

function formatDifficulty(value: Pattern['difficulty']) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
