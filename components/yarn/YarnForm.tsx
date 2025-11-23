import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { ColorPickerModal } from '@/components/color/ColorPickerModal';
import { useTheme } from '@/hooks/useTheme';
import { YarnInput, YarnWeightCategory } from '@/types/yarn';

type YarnFormProps = {
  initialValues?: Partial<YarnInput>;
  submitLabel?: string;
  onSubmit: (values: YarnInput) => void;
  onDelete?: () => void;
};

const weightOptions: YarnWeightCategory[] = [
  'Lace',
  'Fingering',
  'Sport',
  'DK',
  'Worsted',
  'Aran',
  'Bulky',
  'Super Bulky',
  'Jumbo',
];

export function YarnForm({
  initialValues,
  submitLabel = 'Save yarn',
  onSubmit,
  onDelete,
}: YarnFormProps) {
  const theme = useTheme();
  const [name, setName] = useState(initialValues?.name ?? '');
  const [brand, setBrand] = useState(initialValues?.brand ?? '');
  const [color, setColor] = useState(initialValues?.color ?? '');
  const [colorHex, setColorHex] = useState(initialValues?.colorHex ?? '');
  const [weightCategory, setWeightCategory] = useState<YarnWeightCategory>(
    initialValues?.weightCategory ?? 'DK',
  );
  const [metersPerSkein, setMetersPerSkein] = useState(
    initialValues?.metersPerSkein?.toString() ?? '',
  );
  const [yardagePerSkein, setYardagePerSkein] = useState(
    initialValues?.yardagePerSkein?.toString() ?? '',
  );
  const [skeinsOwned, setSkeinsOwned] = useState(initialValues?.skeinsOwned?.toString() ?? '');
  const [pricePerSkein, setPricePerSkein] = useState(
    initialValues?.pricePerSkein?.toString() ?? '',
  );
  const [purchasedFrom, setPurchasedFrom] = useState(initialValues?.purchasedFrom ?? '');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [error, setError] = useState<string | undefined>();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const displayMeters = useMemo(() => {
    if (metersPerSkein.length > 0) return metersPerSkein;
    if (yardagePerSkein.length > 0) {
      const yards = Number(yardagePerSkein);
      if (!Number.isNaN(yards)) {
        return (yards / 1.09361).toFixed(0);
      }
    }
    return '';
  }, [metersPerSkein, yardagePerSkein]);

  const displayYards = useMemo(() => {
    if (yardagePerSkein.length > 0) return yardagePerSkein;
    if (metersPerSkein.length > 0) {
      const meters = Number(metersPerSkein);
      if (!Number.isNaN(meters)) {
        return Math.round(meters * 1.09361).toString();
      }
    }
    return '';
  }, [metersPerSkein, yardagePerSkein]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!color.trim()) {
      setError('Color is required.');
      return;
    }
    if (!skeinsOwned.trim()) {
      setError('Please enter how many skeins you own.');
      return;
    }
    const meters = Number(displayMeters);
    const yards = Number(displayYards);
    const skeins = Number(skeinsOwned);
    if (Number.isNaN(meters) || meters <= 0) {
      setError('Meters per skein should be a positive number.');
      return;
    }
    if (Number.isNaN(yards) || yards <= 0) {
      setError('Yards per skein should be a positive number.');
      return;
    }
    if (Number.isNaN(skeins) || skeins <= 0) {
      setError('Owned skeins must be greater than zero.');
      return;
    }
    setError(undefined);

    onSubmit({
      name: name.trim(),
      brand: brand.trim() || undefined,
      color: color.trim(),
      colorHex: colorHex.trim() || undefined,
      weightCategory,
      metersPerSkein: meters,
      yardagePerSkein: yards,
      skeinsOwned: skeins,
      pricePerSkein: pricePerSkein ? Number(pricePerSkein) : undefined,
      purchasedFrom: purchasedFrom.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      'Remove yarn',
      'Are you sure you want to delete this yarn from your stash? You can always add it back later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <View style={styles.stack}>
      <Card title="Details" subtitle="Name, brand, and palette">
        <View style={styles.fieldGroup}>
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Velvet Luxe"
            required
          />
          <Field label="Brand" value={brand} onChangeText={setBrand} placeholder="Optional" />
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.colors.muted }]}>Color *</Text>
            <View style={styles.colorRow}>
              <TextInput
                value={color}
                onChangeText={setColor}
                placeholder="e.g., Rose smoke"
                placeholderTextColor={theme.colors.muted}
                style={[
                  styles.input,
                  styles.colorInput,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceAlt,
                    color: theme.colors.text,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={() => setShowColorPicker(true)}
                style={[
                  styles.colorSwatchButton,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: colorHex || theme.colors.surfaceAlt,
                  },
                ]}>
                {colorHex ? null : <Text style={{ color: theme.colors.textSecondary }}>🎨</Text>}
              </TouchableOpacity>
            </View>
            {colorHex && (
              <TouchableOpacity
                onPress={() => setColorHex('')}
                style={{ marginTop: 4 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Hex: {colorHex} (tap to clear)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>

      <Card title="Specs" subtitle="Weight, yardage, and counts">
        <View style={[styles.fieldGroup, styles.weightGroup]}>
          <Text style={[styles.label, { color: theme.colors.muted }]}>Weight category</Text>
          <View style={styles.chipRow}>
            {weightOptions.map((option) => {
              const selected = weightCategory === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setWeightCategory(option)}
                  style={[
                    styles.chip,
                    {
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                      backgroundColor: selected
                        ? theme.colors.accentMuted
                        : theme.colors.surfaceAlt,
                    },
                  ]}>
                  <Text
                    style={{
                      color: selected ? theme.colors.accent : theme.colors.textSecondary,
                      fontWeight: '600',
                      fontSize: 12,
                    }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.duoRow}>
          <Field
            label="Meters / skein"
            value={metersPerSkein}
            onChangeText={setMetersPerSkein}
            placeholder="100"
            keyboardType="numeric"
            helper="Auto converts from yards"
          />
          <Field
            label="Yards / skein"
            value={yardagePerSkein}
            onChangeText={setYardagePerSkein}
            placeholder="109"
            keyboardType="numeric"
            helper="Auto converts from meters"
          />
        </View>
        <View style={styles.duoRow}>
          <Field
            label="Skeins owned"
            value={skeinsOwned}
            onChangeText={setSkeinsOwned}
            placeholder="6"
            keyboardType="numeric"
            required
          />
          <Field
            label="Price per skein"
            value={pricePerSkein}
            onChangeText={setPricePerSkein}
          />
        </View>
      </Card>

      <Card title="Notes" subtitle="Where you bought it, care instructions, etc.">
        <Field
          label="Purchased from"
          value={purchasedFrom}
          onChangeText={setPurchasedFrom}
          placeholder="Local shop or website"
        />
        <Field
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Fiber content, care, planned projects..."
          multiline
        />
      </Card>

      {error ? <Text style={[styles.errorText, { color: theme.colors.accent }]}>{error}</Text> : null}

      <ColorPickerModal
        visible={showColorPicker}
        initialColor={colorHex}
        onClose={() => setShowColorPicker(false)}
        onSelect={(hex) => {
          setColorHex(hex);
          setShowColorPicker(false);
        }}
      />

      <View style={styles.buttonRow}>
        {onDelete ? (
          <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton]}>
            <Text style={{ color: theme.colors.textSecondary }}>Delete yarn</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}>
          <Text style={styles.primaryButtonText}>{submitLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  required,
  multiline,
  keyboardType = 'default',
}: FieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.colors.muted }]}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        keyboardType={keyboardType}
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceAlt,
            color: theme.colors.text,
          },
        ]}
        multiline={multiline}
      />
      {helper ? (
        <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  fieldGroup: {
    gap: 12,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  colorInput: {
    flex: 1,
  },
  colorSwatchButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helper: {
    fontSize: 12,
  },
  weightGroup: {
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  duoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#07080c',
    fontWeight: '700',
  },
});



