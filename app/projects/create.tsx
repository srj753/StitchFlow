import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ProjectForm, ProjectFormPrefill } from '@/components/projects/ProjectForm';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useProjectsStore } from '@/store/useProjectsStore';
import { ProjectInput } from '@/types/project';
import { patternCatalog } from '@/data/patterns/catalog';
import { Pattern } from '@/types/pattern';
import { patternDraftToProjectPrefill } from '@/lib/patternDraft';
import { usePatternDraftStore } from '@/store/usePatternDraftStore';
import { usePatternStore } from '@/store/usePatternStore';

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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Projects</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>New project</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Capture yarn info, palette, pattern snippets, and goals. We’ll keep everything in sync
            across tabs.
          </Text>
        </View>

        {patternTemplate ? (
          <Card
            title="Template loaded"
            subtitle={`${patternTemplate.name} · ${patternTemplate.designer}`}
            style={styles.section}>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>
              We pre-filled the form using this library pattern. Adjust anything before saving.
            </Text>
            <View style={styles.templateMetaRow}>
              <TemplateMeta label="Difficulty" value={formatDifficulty(patternTemplate.difficulty)} />
              <TemplateMeta label="Yarn weight" value={patternTemplate.yarnWeight} />
              <TemplateMeta label="Hook" value={patternTemplate.hookSize} />
            </View>
            <View style={styles.templateSwatches}>
              {patternTemplate.palette.map((color) => (
                <View key={color} style={[styles.templateSwatch, { backgroundColor: color }]} />
              ))}
            </View>
            <View style={styles.templateActions}>
              <TouchableOpacity
                onPress={handleViewPattern}
                style={[
                  styles.templateActionPrimary,
                  {
                    backgroundColor: theme.colors.accent,
                  },
                ]}>
                <Text style={styles.templateActionPrimaryText}>Back to library</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearTemplate}
                style={[
                  styles.templateActionSecondary,
                  {
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Text style={{ color: theme.colors.textSecondary }}>Clear template</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : fromDraft && draftPrefill ? (
          <Card
            title="Template loaded"
            subtitle="From Pattern Maker draft"
            style={styles.section}>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>
              Pulled from your current pattern draft. Update anything in the maker or tweak fields
              below before saving.
            </Text>
            {draft.description ? (
              <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>
                {draft.description}
              </Text>
            ) : null}
            <View style={styles.templateMetaRow}>
              <TemplateMeta label="Difficulty" value={formatDifficulty(draft.difficulty)} />
              <TemplateMeta label="Yarn weight" value={draft.yarnWeight || '—'} />
              <TemplateMeta label="Hook" value={draft.hookSize || '—'} />
            </View>
            <View style={styles.templateSwatches}>
              {draft.palette.map((color, index) => (
                <View key={`${color}-${index}`} style={[styles.templateSwatch, { backgroundColor: color }]} />
              ))}
            </View>
            <View style={styles.templateActions}>
              <TouchableOpacity
                onPress={handleEditDraft}
                style={[
                  styles.templateActionPrimary,
                  {
                    backgroundColor: theme.colors.accent,
                  },
                ]}>
                <Text style={styles.templateActionPrimaryText}>Edit in Pattern Maker</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearTemplate}
                style={[
                  styles.templateActionSecondary,
                  {
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Text style={{ color: theme.colors.textSecondary }}>Clear template</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : null}

        <Card title="Project details" subtitle="Fill out as much as you like" style={styles.section}>
          <ProjectForm
            onSubmit={handleSubmit}
            submitLabel="Create project"
            prefill={resolvedPrefill}
            prefillKey={prefillKey}
          />
        </Card>

        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.cancelButton,
            {
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  templateMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  templateMeta: {
    flex: 1,
    marginRight: 12,
    marginBottom: 8,
  },
  templateMetaLabel: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  templateMetaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  templateSwatches: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  templateSwatch: {
    width: 30,
    height: 30,
    borderRadius: 12,
    marginRight: 8,
  },
  templateActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateActionPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  templateActionPrimaryText: {
    color: '#07080c',
    fontWeight: '700',
  },
  templateActionSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
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
