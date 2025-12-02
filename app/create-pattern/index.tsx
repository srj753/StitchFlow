import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Card } from '@/components/Card';
import { ColorPickerModal } from '@/components/color/ColorPickerModal';
import { Screen } from '@/components/Screen';
import { getPatternById } from '@/data/patterns/catalog';
import { useTheme } from '@/hooks/useTheme';
import { patternDraftToPreviewLines } from '@/lib/patternDraft';
import {
    PatternSectionDraft,
    usePatternDraftStore,
} from '@/store/usePatternDraftStore';
import { PatternDifficulty } from '@/types/pattern';

const difficultyOptions: PatternDifficulty[] = ['beginner', 'intermediate', 'advanced'];

const quickRowTemplates: Array<{
  id: string;
  label: string;
  instruction: string;
  stitchCount?: string;
}> = [
  {
    id: 'inc-round',
    label: '+6 inc round',
    instruction: '(sc, inc) repeat around',
    stitchCount: '+6 sts',
  },
  {
    id: 'even-round',
    label: 'Even round',
    instruction: 'sc around',
  },
  {
    id: 'dec-round',
    label: '-6 dec round',
    instruction: '(sc, dec) repeat around',
    stitchCount: '-6 sts',
  },
];

export default function CreatePatternScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ patternId?: string }>();
  const draft = usePatternDraftStore((state) => state.draft);
  const setMeta = usePatternDraftStore((state) => state.setMeta);
  const addTag = usePatternDraftStore((state) => state.addTag);
  const removeTag = usePatternDraftStore((state) => state.removeTag);
  const addSection = usePatternDraftStore((state) => state.addSection);
  const updateSectionName = usePatternDraftStore((state) => state.updateSectionName);
  const deleteSection = usePatternDraftStore((state) => state.deleteSection);
  const addRow = usePatternDraftStore((state) => state.addRow);
  const updateRow = usePatternDraftStore((state) => state.updateRow);
  const deleteRow = usePatternDraftStore((state) => state.deleteRow);
  const duplicateRow = usePatternDraftStore((state) => state.duplicateRow);
  const resetDraft = usePatternDraftStore((state) => state.resetDraft);
  const updatePaletteColor = usePatternDraftStore((state) => state.updatePaletteColor);
  const addPaletteColor = usePatternDraftStore((state) => state.addPaletteColor);
  const loadPattern = usePatternDraftStore((state) => state.loadPattern);

  const [tagInput, setTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const patternIdParam = params.patternId;
  const patternId =
    typeof patternIdParam === 'string'
      ? patternIdParam
      : Array.isArray(patternIdParam)
      ? patternIdParam[0]
      : undefined;
  const patternTemplate = useMemo(
    () => (patternId ? getPatternById(patternId) : undefined),
    [patternId],
  );

  useEffect(() => {
    if (!patternTemplate || !patternId) return;
    loadPattern(patternTemplate);
    router.replace('/create-pattern');
  }, [patternId, patternTemplate, loadPattern, router]);

  const previewLines = useMemo(() => patternDraftToPreviewLines(draft), [draft]);

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    addTag(tagInput);
    setTagInput('');
  };

  const handleCopyPreview = async () => {
    await Clipboard.setStringAsync(previewLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePalettePress = (index: number) => {
    setPaletteIndex(index);
    setShowColorPicker(true);
  };

  const handleSelectColor = (color: string) => {
    if (paletteIndex === null) return;
    updatePaletteColor(paletteIndex, color);
  };

  const handleClosePicker = () => {
    setShowColorPicker(false);
    setPaletteIndex(null);
  };

  const handleSendToProjects = () => {
    router.push({
      pathname: '/projects/create',
      params: { source: 'draft' },
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Pattern maker</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Structure your own pattern</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Drafts auto-save locally as you work.
          </Text>
        </View>

        <Card title="Overview" subtitle="Metadata & palette" style={styles.card}>
          <View style={styles.formRow}>
            <LabeledField label="Pattern title">
              <TextInput
                value={draft.title}
                onChangeText={(text) => setMeta({ title: text })}
                placeholder="e.g. Bubble tea plush"
                placeholderTextColor={theme.colors.muted}
                style={[
                  styles.input,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
                ]}
              />
            </LabeledField>
          </View>
          <LabeledField label="Description">
            <TextInput
              value={draft.description}
              onChangeText={(text) => setMeta({ description: text })}
              placeholder="What makes this pattern special?"
              placeholderTextColor={theme.colors.muted}
              multiline
              style={[
                styles.input,
                styles.multiline,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
              ]}
            />
          </LabeledField>
          <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>Difficulty</Text>
          <View style={styles.chipRow}>
            {difficultyOptions.map((option) => {
              const selected = draft.difficulty === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setMeta({ difficulty: option })}
                  style={[
                    styles.chip,
                    {
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                      backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surface,
                    },
                  ]}>
                  <Text
                    style={{
                      color: selected ? theme.colors.accent : theme.colors.textSecondary,
                      fontWeight: '600',
                    }}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.inlineRow}>
            <LabeledField label="Yarn weight" style={styles.inlineField}>
              <TextInput
                value={draft.yarnWeight}
                onChangeText={(text) => setMeta({ yarnWeight: text })}
                placeholder="e.g. DK 3"
                placeholderTextColor={theme.colors.muted}
                style={[
                  styles.input,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
                ]}
              />
            </LabeledField>
            <LabeledField label="Hook size" style={styles.inlineField}>
              <TextInput
                value={draft.hookSize}
                onChangeText={(text) => setMeta({ hookSize: text })}
                placeholder="4.0 mm"
                placeholderTextColor={theme.colors.muted}
                style={[
                  styles.input,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
                ]}
              />
            </LabeledField>
          </View>
          <LabeledField label="Gauge">
            <TextInput
              value={draft.gauge}
              onChangeText={(text) => setMeta({ gauge: text })}
              placeholder='4" = 14 sc'
              placeholderTextColor={theme.colors.muted}
              style={[
                styles.input,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
              ]}
            />
          </LabeledField>
          <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>Tags</Text>
          <View style={styles.tagRow}>
            {draft.tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => removeTag(tag)}
                style={[
                  styles.tag,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                ]}>
                <Text style={{ color: theme.colors.text }}>{tag}</Text>
                <Text style={{ color: theme.colors.muted, marginLeft: 6 }}>×</Text>
              </TouchableOpacity>
            ))}
            <View
              style={[
                styles.tagInputWrapper,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
              ]}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add tag"
                placeholderTextColor={theme.colors.muted}
                style={{ color: theme.colors.text, minWidth: 80 }}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity onPress={handleAddTag}>
                <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.helper, { color: theme.colors.textSecondary, marginTop: 12 }]}>Palette</Text>
          <View style={styles.paletteRow}>
            {draft.palette.map((color, index) => (
              <TouchableOpacity
                key={`${color}-${index}`}
                onPress={() => handlePalettePress(index)}
                style={[
                  styles.paletteSwatch,
                  { backgroundColor: color, borderColor: theme.colors.border },
                ]}
              />
            ))}
            {draft.palette.length < 6 ? (
              <TouchableOpacity
                onPress={() => addPaletteColor()}
                style={[
                  styles.paletteSwatch,
                  styles.paletteSwatchDashed,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                ]}>
                <Text style={{ color: theme.colors.textSecondary }}>+</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Card>

        <Card title="Sections & rounds" subtitle="Structure instructions" style={styles.card}>
          {draft.sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              onRename={(name) => updateSectionName(section.id, name)}
              onDelete={() => deleteSection(section.id)}
              onAddRow={(template) => addRow(section.id, template)}
              onUpdateRow={(rowId, data) => updateRow(section.id, rowId, data)}
              onDeleteRow={(rowId) => deleteRow(section.id, rowId)}
              onDuplicateRow={(rowId) => duplicateRow(section.id, rowId)}
              themeColors={theme.colors}
            />
          ))}
          <TouchableOpacity
            onPress={() => addSection()}
            style={[
              styles.addSectionButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}>
            <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>+ Add section</Text>
          </TouchableOpacity>
        </Card>

        <Card title="Live preview" subtitle="Copy or send to Projects" style={styles.card}>
          <View
            style={[
              styles.previewBox,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}>
            {previewLines.map((line, index) => (
              <Text
                // eslint-disable-next-line react/no-array-index-key
                key={`${line}-${index}`}
                style={[styles.previewText, { color: theme.colors.textSecondary }]}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.previewActions}>
            <TouchableOpacity
              onPress={handleCopyPreview}
              style={[
                styles.copyButton,
                {
                  backgroundColor: theme.colors.accent,
                },
              ]}>
              <Text style={{ color: '#07080c', fontWeight: '700' }}>
                {copied ? 'Copied!' : 'Copy preview'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSendToProjects}
              style={[
                styles.secondaryButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}>
              <Text style={{ color: theme.colors.text }}>Send to Projects</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card title="Draft controls" subtitle="Safety net & utilities" style={styles.card}>
          <View style={styles.controlButtons}>
            <TouchableOpacity
              onPress={handleSendToProjects}
              style={[
                styles.controlButton,
                {
                  backgroundColor: theme.colors.accentMuted,
                  borderColor: theme.colors.accentMuted,
                },
              ]}>
              <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>Create project from draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetDraft}
              style={[
                styles.controlButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}>
              <Text style={{ color: theme.colors.textSecondary }}>Reset draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/patterns')}
              style={[
                styles.controlButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}>
              <Text style={{ color: theme.colors.textSecondary }}>Browse pattern library</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
      <ColorPickerModal
        visible={showColorPicker}
        initialColor={paletteIndex !== null ? draft.palette[paletteIndex] : '#ffffff'}
        onClose={handleClosePicker}
        onSelect={handleSelectColor}
      />
    </Screen>
  );
}

function SectionEditor({
  section,
  onRename,
  onDelete,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  onDuplicateRow,
  themeColors,
}: {
  section: PatternSectionDraft;
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddRow: (template?: { label?: string; instruction?: string; stitchCount?: string }) => void;
  onUpdateRow: (rowId: string, data: Partial<{ label: string; instruction: string; stitchCount?: string }>) => void;
  onDeleteRow: (rowId: string) => void;
  onDuplicateRow: (rowId: string) => void;
  themeColors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={[styles.sectionCard, { borderColor: themeColors.border, backgroundColor: themeColors.surface }]}>
      <View style={styles.sectionHeader}>
        <TextInput
          value={section.name}
          onChangeText={onRename}
          style={[
            styles.sectionNameInput,
            {
              borderColor: themeColors.border,
              backgroundColor: themeColors.surfaceAlt,
              color: themeColors.text,
            },
          ]}
        />
        <TouchableOpacity onPress={onDelete}>
          <Text style={{ color: themeColors.textSecondary }}>Delete</Text>
        </TouchableOpacity>
      </View>
      {section.rows.map((row, index) => (
        <View
          key={row.id}
          style={[
            styles.rowCard,
            {
              borderColor: themeColors.border,
              backgroundColor: themeColors.surfaceAlt,
            },
          ]}>
          <View style={styles.rowHeader}>
            <TextInput
              value={row.label}
              onChangeText={(text) => onUpdateRow(row.id, { label: text })}
              style={[
                styles.rowLabelInput,
                {
                  borderColor: themeColors.border,
                  color: themeColors.text,
                },
              ]}
            />
            <View style={styles.rowActions}>
              <TouchableOpacity onPress={() => onDuplicateRow(row.id)}>
                <Text style={{ color: themeColors.accent }}>Duplicate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDeleteRow(row.id)}
                disabled={section.rows.length <= 1}>
                <Text
                  style={{
                    color:
                      section.rows.length <= 1 ? themeColors.muted : themeColors.textSecondary,
                    marginLeft: 12,
                  }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            multiline
            value={row.instruction}
            onChangeText={(text) => onUpdateRow(row.id, { instruction: text })}
            placeholder="Stitch instruction"
            placeholderTextColor={themeColors.muted}
            style={[
              styles.rowInstructionInput,
              {
                color: themeColors.text,
                borderColor: themeColors.border,
                backgroundColor: themeColors.surface,
              },
            ]}
          />
          <TextInput
            value={row.stitchCount ?? ''}
            onChangeText={(text) => onUpdateRow(row.id, { stitchCount: text })}
            placeholder="Stitch count (optional)"
            placeholderTextColor={themeColors.muted}
            style={[
              styles.rowCountInput,
              {
                color: themeColors.text,
                borderColor: themeColors.border,
                backgroundColor: themeColors.surface,
              },
            ]}
          />
          <Text style={[styles.helper, { color: themeColors.muted }]}>
            Row {index + 1} · {row.instruction.length || 0} chars
          </Text>
        </View>
      ))}
      <View style={styles.quickRowBar}>
        {quickRowTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            onPress={() => onAddRow(template)}
            style={[
              styles.quickChip,
              {
                borderColor: themeColors.border,
                backgroundColor: themeColors.surface,
              },
            ]}>
            <Text style={{ color: themeColors.textSecondary }}>{template.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => onAddRow()}
          style={[
            styles.quickChip,
            {
              borderColor: themeColors.border,
              backgroundColor: themeColors.surface,
            },
          ]}>
          <Text style={{ color: themeColors.accent }}>+ Custom row</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LabeledField({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: object;
}) {
  const theme = useTheme();
  return (
    <View style={style}>
      <Text style={[styles.fieldLabel, { color: theme.colors.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 48,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  formRow: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  inlineField: {
    flex: 1,
    minWidth: 140,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInputWrapper: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  paletteSwatch: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
  },
  paletteSwatchDashed: {
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sectionNameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  rowCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  rowLabelInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 90,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowInstructionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 8,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  rowCountInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 6,
  },
  quickRowBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addSectionButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  copyButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlButtons: {
    gap: 12,
  },
  controlButton: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
});
