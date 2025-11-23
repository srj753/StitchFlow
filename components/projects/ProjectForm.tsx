
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Project, ProjectInput } from '@/types/project';
import { ColorPickerModal } from '@/components/color/ColorPickerModal';
import { ensureContrastingText } from '@/lib/color';

export type ProjectFormPrefill = {
  name?: string;
  patternName?: string;
  patternSourceType?: Project['patternSourceType'];
  referenceLink?: string;
  notes?: string;
  snippet?: string;
  yarnWeight?: string;
  hookSize?: string;
  targetHeight?: string;
  roundGoal?: string;
  colorPalette?: string[];
  paletteMode?: 'preset' | 'custom';
  paletteIndex?: number;
};

type ProjectFormProps = {
  onSubmit: (input: ProjectInput) => void;
  submitLabel?: string;
  prefill?: ProjectFormPrefill;
  prefillKey?: string;
};

const patternSourceOptions: Array<{ label: string; value: Project['patternSourceType'] }> = [
  { label: 'External link', value: 'external' },
  { label: 'Built-in', value: 'built-in' },
  { label: 'My notes', value: 'my-pattern' },
];

const yarnWeightOptions = ['Lace', 'Sport', 'DK', 'Worsted', 'Bulky', 'Super bulky'];
const hookSizeOptions = ['2.0', '2.25', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0'];
const palettePresets = [
  { label: 'Rose quartz', colors: ['#F68AAF', '#FFC8DD', '#F5A3C7'] },
  { label: 'Coastal mist', colors: ['#6EC4CF', '#AEC9FF', '#6F78FF'] },
  { label: 'Forest walk', colors: ['#4E7C59', '#A3B18A', '#FFE5D9'] },
  { label: 'Sunset glow', colors: ['#F7B267', '#F4845F', '#F25C54'] },
];

export function ProjectForm({
  onSubmit,
  submitLabel = 'Create project',
  prefill,
  prefillKey = 'default',
}: ProjectFormProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [patternName, setPatternName] = useState('');
  const [patternSource, setPatternSource] = useState<Project['patternSourceType']>('external');
  const [referenceLink, setReferenceLink] = useState('');
  const [notes, setNotes] = useState('');
  const [snippet, setSnippet] = useState('');
  const [yarnWeight, setYarnWeight] = useState<string>();
  const [hookSize, setHookSize] = useState<string>();
  const [targetHeight, setTargetHeight] = useState('');
  const [roundGoal, setRoundGoal] = useState('');
  const [paletteMode, setPaletteMode] = useState<'preset' | 'custom'>('preset');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [customColors, setCustomColors] = useState<string[]>([
    '#F68AAF',
    '#FFC8DD',
    '#F5A3C7',
  ]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!prefill) return;
    if (prefill.name !== undefined) setName(prefill.name);
    if (prefill.patternName !== undefined) setPatternName(prefill.patternName);
    if (prefill.patternSourceType) setPatternSource(prefill.patternSourceType);
    if (prefill.referenceLink !== undefined) setReferenceLink(prefill.referenceLink);
    if (prefill.notes !== undefined) setNotes(prefill.notes);
    if (prefill.snippet !== undefined) setSnippet(prefill.snippet);
    if (prefill.yarnWeight !== undefined) setYarnWeight(prefill.yarnWeight);
    if (prefill.hookSize !== undefined) setHookSize(prefill.hookSize);
    if (prefill.targetHeight !== undefined) setTargetHeight(prefill.targetHeight);
    if (prefill.roundGoal !== undefined) setRoundGoal(prefill.roundGoal);

    if (prefill.paletteMode) {
      setPaletteMode(prefill.paletteMode);
    } else if (prefill.colorPalette?.length) {
      setPaletteMode('custom');
    }

    if (typeof prefill.paletteIndex === 'number') {
      setPaletteIndex(prefill.paletteIndex);
    }

    if (prefill.colorPalette?.length) {
      setCustomColors(prefill.colorPalette);
    }
  }, [prefill, prefillKey]);

  const disableSubmit = useMemo(() => name.trim().length === 0, [name]);
  const activePalette =
    paletteMode === 'preset' ? palettePresets[paletteIndex]?.colors ?? [] : customColors;

  const resetForm = () => {
    setName('');
    setPatternName('');
    setPatternSource('external');
    setReferenceLink('');
    setNotes('');
    setSnippet('');
    setYarnWeight(undefined);
    setHookSize(undefined);
    setTargetHeight('');
    setRoundGoal('');
    setPaletteMode('preset');
    setPaletteIndex(0);
    setCustomColors(['#F68AAF', '#FFC8DD', '#F5A3C7']);
  };

  const handleSubmit = () => {
    if (disableSubmit) return;

    const payload: ProjectInput = {
      name: name.trim(),
      patternName: patternName.trim() || undefined,
      patternSourceType: patternSource,
      sourceUrl: referenceLink.trim() || undefined,
      notes: notes.trim() || undefined,
      patternSnippet: snippet.trim() || undefined,
      yarnWeight,
      hookSizeMm: hookSize ? Number(hookSize) : undefined,
      targetHeightInches: targetHeight ? Number(targetHeight) : undefined,
      totalRoundsEstimate: roundGoal ? Number(roundGoal) : undefined,
      colorPalette: activePalette,
    };

    onSubmit(payload);
    resetForm();
  };

  const handleColorPress = (index: number) => {
    setEditingColorIndex(index);
    setShowColorPicker(true);
  };

  const handleColorSelect = (color: string) => {
    if (editingColorIndex === null) return;
    setCustomColors((prev) => {
      const next = [...prev];
      next[editingColorIndex] = color;
      return next;
    });
  };

  const addCustomColor = () => {
    setCustomColors((prev) => {
      const next = [...prev, '#F5F5F5'];
      setEditingColorIndex(next.length - 1);
      return next;
    });
    setShowColorPicker(true);
  };

  const closeColorPicker = () => {
    setShowColorPicker(false);
    setEditingColorIndex(null);
  };

  return (
    <View>
      <Section title="Basics" description="Name it clearly and log where the pattern lives.">
        <FormField
          label="Project name*"
          value={name}
          onChangeText={setName}
          themeColor={theme.colors}
          autoFocus
          placeholder="e.g. Aurora plushie"
        />
        <FormField
          label="Pattern or inspiration"
          value={patternName}
          onChangeText={setPatternName}
          themeColor={theme.colors}
          placeholder="Blog post, book, or your own design"
        />
        <Text style={[styles.helperText, { color: theme.colors.muted }]}>Pattern source</Text>
        <View style={styles.row}>
          {patternSourceOptions.map((option, index) => {
            const selected = patternSource === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setPatternSource(option.value)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    marginRight: index === patternSourceOptions.length - 1 ? 0 : 8,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                    fontWeight: '600',
                  }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {patternSource !== 'my-pattern' ? (
          <FormField
            label="Reference link"
            value={referenceLink}
            onChangeText={setReferenceLink}
            themeColor={theme.colors}
            placeholder="https://example.com/pattern"
          />
        ) : null}
      </Section>

      <Section
        title="Palette & materials"
        description="Pick yarn combos and specs now so cards feel alive.">
        <Text style={[styles.helperText, { color: theme.colors.muted }]}>Palette mode</Text>
        <View style={styles.row}>
          {['preset', 'custom'].map((mode) => {
            const selected = paletteMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setPaletteMode(mode as 'preset' | 'custom')}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    marginRight: 8,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                    fontWeight: '600',
                  }}>
                  {mode === 'preset' ? 'Curated sets' : 'Custom colors'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {paletteMode === 'preset' ? (
          <View style={styles.paletteRow}>
            {palettePresets.map((preset, index) => {
              const selected = paletteIndex === index;
              return (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => setPaletteIndex(index)}
                  style={[
                    styles.paletteCard,
                    {
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                      backgroundColor: theme.colors.surfaceAlt,
                    },
                  ]}>
                  <View style={styles.swatchRow}>
                    {preset.colors.map((color) => (
                      <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
                    ))}
                  </View>
                  <Text
                    style={{
                      color: selected ? theme.colors.accent : theme.colors.textSecondary,
                      fontSize: 13,
                    }}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View>
            <View style={styles.customPaletteRow}>
              {customColors.map((color, index) => {
                const textColor = ensureContrastingText(color);
                return (
                  <TouchableOpacity
                    key={`custom-${index}`}
                    onPress={() => handleColorPress(index)}
                    style={[
                      styles.customSwatch,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: color,
                      },
                    ]}>
                    <Text style={{ color: textColor, fontWeight: '700' }}>{index + 1}</Text>
                  </TouchableOpacity>
                );
              })}
              {customColors.length < 6 ? (
                <TouchableOpacity
                  onPress={addCustomColor}
                  style={[
                    styles.customSwatch,
                    {
                      borderStyle: 'dashed',
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceAlt,
                    },
                  ]}>
                  <Text style={{ color: theme.colors.textSecondary }}>+</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              Tap a swatch to open the picker. We’ll store up to 6 colors.
            </Text>
          </View>
        )}

        <Text style={[styles.helperText, { color: theme.colors.muted, marginTop: 16 }]}>
          Yarn weight
        </Text>
        <View style={styles.rowWrap}>
          {yarnWeightOptions.map((option) => {
            const selected = yarnWeight === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setYarnWeight(option)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    marginRight: 8,
                    marginBottom: 8,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                    fontWeight: '600',
                  }}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.helperText, { color: theme.colors.muted, marginTop: 16 }]}>
          Hook size (mm)
        </Text>
        <View style={styles.rowWrap}>
          {hookSizeOptions.map((option) => {
            const selected = hookSize === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setHookSize(option)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    marginRight: 8,
                    marginBottom: 8,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                    fontWeight: '600',
                  }}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <FormField
          label="Custom hook size"
          helper="Type any measurement like 1.75 or 12.0"
          value={hookSize ?? ''}
          onChangeText={setHookSize}
          themeColor={theme.colors}
          keyboardType="decimal-pad"
          placeholder="e.g. 2.75"
        />
      </Section>

      <Section title="Goals" description="Optional targets to keep progress satisfying.">
        <View style={styles.inlineRow}>
          <FormField
            label="Target height (in)"
            value={targetHeight}
            onChangeText={setTargetHeight}
            themeColor={theme.colors}
            keyboardType="decimal-pad"
            style={styles.inlineField}
          />
          <FormField
            label="Round goal"
            value={roundGoal}
            onChangeText={setRoundGoal}
            themeColor={theme.colors}
            keyboardType="number-pad"
            style={styles.inlineField}
          />
        </View>
      </Section>

      <Section title="Notes & snippet" description="Reference text you can tweak later.">
        <FormField
          label="Pattern snippet"
          value={snippet}
          onChangeText={setSnippet}
          themeColor={theme.colors}
          multiline
          numberOfLines={4}
          placeholder="Row 1: ch 2, 6 sc in magic ring..."
        />
        <FormField
          label="Project notes"
          value={notes}
          onChangeText={setNotes}
          themeColor={theme.colors}
          multiline
          numberOfLines={4}
          placeholder="Yarn substitutions, fit adjustments, reminders..."
        />
      </Section>

      <TouchableOpacity
        disabled={disableSubmit}
        onPress={handleSubmit}
        style={[
          styles.submitButton,
          {
            backgroundColor: disableSubmit ? theme.colors.cardMuted : theme.colors.accent,
            opacity: disableSubmit ? 0.6 : 1,
          },
        ]}>
        <Text
          style={[
            styles.submitButtonText,
            {
              color: disableSubmit ? theme.colors.muted : '#07080c',
            },
          ]}>
          {submitLabel}
        </Text>
      </TouchableOpacity>
      <ColorPickerModal
        visible={showColorPicker}
        initialColor={
          editingColorIndex !== null ? customColors[editingColorIndex] : customColors[0]
        }
        onClose={closeColorPicker}
        onSelect={handleColorSelect}
      />
    </View>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      ) : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

type FormFieldProps = {
  label: string;
  helper?: string;
  value: string;
  onChangeText: (value: string) => void;
  themeColor: ReturnType<typeof useTheme>['colors'];
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  autoFocus?: boolean;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: object;
};

function FormField({
  label,
  helper,
  value,
  onChangeText,
  themeColor,
  keyboardType = 'default',
  autoFocus,
  placeholder,
  multiline,
  numberOfLines,
  style,
}: FormFieldProps) {
  return (
    <View style={[styles.fieldWrapper, style]}>
      <Text style={[styles.fieldLabel, { color: themeColor.muted }]}>{label}</Text>
      {helper ? <Text style={[styles.helperText, { color: themeColor.muted }]}>{helper}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.textInput,
          {
            borderColor: themeColor.border,
            backgroundColor: themeColor.surfaceAlt,
            color: themeColor.text,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={themeColor.muted}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionBody: {
    marginTop: 12,
  },
  helperText: {
    fontSize: 12,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  customPaletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  customSwatch: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
  paletteCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
    width: 150,
  },
  swatchRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 8,
    marginRight: 6,
  },
  inlineRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  inlineField: {
    flex: 1,
    marginHorizontal: 8,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
