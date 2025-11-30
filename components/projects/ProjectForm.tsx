
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
  { label: 'Link', value: 'external' },
  { label: 'Built-in', value: 'built-in' },
  { label: 'Notes', value: 'my-pattern' },
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
      <Section title="DETAILS" first>
        <FormField
          label="Project Name"
          value={name}
          onChangeText={setName}
          themeColor={theme.colors}
          autoFocus
          placeholder="e.g. Cozy Blanket"
        />
        <FormField
          label="Pattern / Inspiration"
          value={patternName}
          onChangeText={setPatternName}
          themeColor={theme.colors}
          placeholder="Pattern name or designer"
        />
        
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>PATTERN SOURCE</Text>
        <View style={[styles.segmentedControl, { backgroundColor: theme.colors.surfaceAlt }]}>
          {patternSourceOptions.map((option) => {
            const selected = patternSource === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setPatternSource(option.value)}
                style={[
                  styles.segment,
                  selected && { backgroundColor: theme.colors.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.text : theme.colors.textSecondary,
                    fontWeight: selected ? '600' : '400',
                    fontSize: 13,
                  }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {patternSource !== 'my-pattern' && (
          <FormField
            label="Link"
            value={referenceLink}
            onChangeText={setReferenceLink}
            themeColor={theme.colors}
            placeholder="https://..."
            style={{ marginTop: 16 }}
          />
        )}
      </Section>

      <Section title="PALETTE">
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
                    fontSize: 13,
                  }}>
                  {mode === 'preset' ? 'Presets' : 'Custom'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {paletteMode === 'preset' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paletteRow}>
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
                      fontSize: 12,
                      fontWeight: '600',
                    }}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
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
                    {/* <Text style={{ color: textColor, fontWeight: '700' }}>{index + 1}</Text> */}
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
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}>
                  <FontAwesome name="plus" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
          </View>
        )}
      </Section>

      <Section title="SPECS">
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>YARN WEIGHT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowWrap}>
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
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                    fontWeight: '600',
                    fontSize: 13,
                  }}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary, marginTop: 16 }]}>HOOK SIZE (mm)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowWrap}>
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
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                    fontWeight: '600',
                    fontSize: 13,
                  }}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        <FormField
          label="Custom Hook"
          value={hookSize ?? ''}
          onChangeText={setHookSize}
          themeColor={theme.colors}
          keyboardType="decimal-pad"
          placeholder="e.g. 7.0"
          style={{ marginTop: 12 }}
        />
      </Section>

      <Section title="GOALS">
        <View style={styles.inlineRow}>
          <FormField
            label="Target Height (in)"
            value={targetHeight}
            onChangeText={setTargetHeight}
            themeColor={theme.colors}
            keyboardType="decimal-pad"
            style={styles.inlineField}
          />
          <FormField
            label="Round Goal"
            value={roundGoal}
            onChangeText={setRoundGoal}
            themeColor={theme.colors}
            keyboardType="number-pad"
            style={styles.inlineField}
          />
        </View>
      </Section>

      <Section title="NOTES">
        <FormField
          label="Initial Snippet"
          value={snippet}
          onChangeText={setSnippet}
          themeColor={theme.colors}
          multiline
          numberOfLines={4}
          placeholder="Row 1: ch 2..."
        />
        <FormField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          themeColor={theme.colors}
          multiline
          numberOfLines={4}
          placeholder="Reminders..."
          style={{ marginTop: 16 }}
        />
      </Section>

      <TouchableOpacity
        disabled={disableSubmit}
        onPress={handleSubmit}
        style={[
          styles.submitButton,
          {
            backgroundColor: disableSubmit ? theme.colors.surfaceAlt : theme.colors.accent,
            opacity: disableSubmit ? 0.5 : 1,
          },
        ]}>
        <Text
          style={[
            styles.submitButtonText,
            {
              color: disableSubmit ? theme.colors.textSecondary : '#07080c',
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
  children,
  first,
}: {
  title: string;
  children: ReactNode;
  first?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.section, !first && { marginTop: 24 }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionBody, { backgroundColor: theme.colors.surface }]}>{children}</View>
    </View>
  );
}

type FormFieldProps = {
  label: string;
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
      <Text style={[styles.fieldLabel, { color: themeColor.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.textInput,
          {
            backgroundColor: themeColor.surfaceAlt,
            color: themeColor.text,
            minHeight: multiline ? 80 : 48,
            paddingTop: multiline ? 12 : 0, // Fix multiline vertical align
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={themeColor.muted}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 8,
  },
  sectionBody: {
    borderRadius: 20,
    padding: 16,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowWrap: {
    paddingBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  paletteRow: {
    paddingRight: 16,
  },
  customPaletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  customSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 12,
    marginBottom: 12,
  },
  paletteCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    width: 140,
  },
  swatchRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
  segmentedControl: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 12,
      marginBottom: 8,
  },
  segment: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 8,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
