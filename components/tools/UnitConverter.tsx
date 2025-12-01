import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';

type UnitType = 'length' | 'weight';

export function UnitConverter() {
  const theme = useTheme();
  const [activeType, setActiveType] = useState<UnitType>('length');
  const [valueA, setValueA] = useState('');
  const [valueB, setValueB] = useState('');

  const handleConvert = (text: string, direction: 'AtoB' | 'BtoA') => {
    if (direction === 'AtoB') {
      setValueA(text);
      const val = parseFloat(text);
      if (isNaN(val)) {
        setValueB('');
        return;
      }
      // Length: Meters to Yards (1 m = 1.09361 yd)
      // Weight: Grams to Ounces (1 g = 0.035274 oz)
      const result = activeType === 'length' ? val * 1.09361 : val * 0.035274;
      setValueB(result.toFixed(2));
    } else {
      setValueB(text);
      const val = parseFloat(text);
      if (isNaN(val)) {
        setValueA('');
        return;
      }
      // Length: Yards to Meters (1 yd = 0.9144 m)
      // Weight: Ounces to Grams (1 oz = 28.3495 g)
      const result = activeType === 'length' ? val * 0.9144 : val * 28.3495;
      setValueA(result.toFixed(2));
    }
  };

  return (
    <Card title="Unit Converter" style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeType === 'length' && { backgroundColor: theme.colors.accentMuted },
            { borderColor: activeType === 'length' ? theme.colors.accent : theme.colors.border },
          ]}
          onPress={() => {
            setActiveType('length');
            setValueA('');
            setValueB('');
          }}>
          <FontAwesome name="arrows-h" size={16} color={theme.colors.text} />
          <Text style={[styles.tabText, { color: theme.colors.text }]}>Length</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeType === 'weight' && { backgroundColor: theme.colors.accentMuted },
            { borderColor: activeType === 'weight' ? theme.colors.accent : theme.colors.border },
          ]}
          onPress={() => {
            setActiveType('weight');
            setValueA('');
            setValueB('');
          }}>
          <FontAwesome name="balance-scale" size={16} color={theme.colors.text} />
          <Text style={[styles.tabText, { color: theme.colors.text }]}>Weight</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.converterRow}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            {activeType === 'length' ? 'Meters (m)' : 'Grams (g)'}
          </Text>
          <TextInput
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
            keyboardType="numeric"
            value={valueA}
            onChangeText={(text) => handleConvert(text, 'AtoB')}
            placeholder="0"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <FontAwesome name="exchange" size={16} color={theme.colors.muted} style={{ marginTop: 24 }} />

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            {activeType === 'length' ? 'Yards (yd)' : 'Ounces (oz)'}
          </Text>
          <TextInput
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
            keyboardType="numeric"
            value={valueB}
            onChangeText={(text) => handleConvert(text, 'BtoA')}
            placeholder="0"
            placeholderTextColor={theme.colors.muted}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  tabText: {
    fontWeight: '600',
  },
  converterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});





