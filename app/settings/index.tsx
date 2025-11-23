import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';

import { Card } from '@/components/Card';
import { ColorPickerModal } from '@/components/color/ColorPickerModal';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { exportAllData, importData } from '@/lib/dataExport';
import { useAppearanceStore, ThemeMode } from '@/store/useAppearanceStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const { showSuccess, showError } = useToast();
  const { mode, setMode, cycleMode, customAccentColor, setCustomAccentColor } = useAppearanceStore();
  const { keepScreenAwake, setKeepScreenAwake, voiceHintsEnabled, toggleVoiceHints } =
    useSettingsStore();
  const router = useRouter();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleExport = async () => {
    try {
      await exportAllData();
      showSuccess('Backup exported successfully');
    } catch (error) {
      showError('Failed to export backup');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const jsonString = await response.text();

      Alert.alert(
        'Import backup?',
        'This will replace all your current data. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                await importData(jsonString);
                showSuccess('Backup imported successfully');
              } catch (error) {
                showError('Failed to import backup. File may be invalid.');
              }
            },
          },
        ],
      );
    } catch (error) {
      showError('Failed to open file picker');
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Profile & settings</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Make KnotIQ yours</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Account basics, theme controls, device sync, and future premium toggles will live here.
        </Text>
      </View>

      <Card title="Theme" subtitle="Display preference">
        <View style={styles.themeRow}>
          {themeOptions.map((option) => {
            const selected = mode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setMode(option.value)}
                style={[
                  styles.themeChip,
                  {
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
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
        <TouchableOpacity
          onPress={cycleMode}
          style={[
            styles.cycleButton,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
          ]}>
          <Text style={{ color: theme.colors.textSecondary }}>Cycle theme</Text>
        </TouchableOpacity>
      </Card>

      <Card title="Accent color" subtitle="Customize your app's accent color">
        <View style={styles.accentColorRow}>
          <TouchableOpacity
            onPress={() => setShowColorPicker(true)}
            style={[
              styles.accentColorSwatch,
              {
                backgroundColor: customAccentColor || theme.colors.accent,
                borderColor: theme.colors.border,
              },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 4 }}>
              {customAccentColor || 'Default (pink)'}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              Tap to choose a custom color
            </Text>
          </View>
          {customAccentColor && (
            <TouchableOpacity
              onPress={() => {
                setCustomAccentColor(undefined);
                showSuccess('Reset to default accent color');
              }}
              style={[
                styles.resetButton,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
              ]}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
        <ColorPickerModal
          visible={showColorPicker}
          initialColor={customAccentColor || theme.colors.accent}
          onClose={() => setShowColorPicker(false)}
          onSelect={(hex) => {
            setCustomAccentColor(hex);
            setShowColorPicker(false);
            showSuccess('Accent color updated');
          }}
        />
      </Card>

      <Card title="Focus helpers" subtitle="Quality-of-life toggles">
        <View style={[styles.toggleRow, { borderColor: theme.colors.border }]}>
          <View style={styles.toggleCopy}>
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Keep screen awake</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              Prevents the display from sleeping while the project screen is open.
            </Text>
          </View>
          <Switch
            value={keepScreenAwake}
            onValueChange={setKeepScreenAwake}
            thumbColor={keepScreenAwake ? theme.colors.accent : theme.colors.border}
          />
        </View>
        <View style={[styles.toggleRow, { borderColor: theme.colors.border }]}>
          <View style={styles.toggleCopy}>
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Voice command hints</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              Show upcoming voice command capabilities around the app.
            </Text>
          </View>
          <Switch
            value={voiceHintsEnabled}
            onValueChange={toggleVoiceHints}
            thumbColor={voiceHintsEnabled ? theme.colors.accent : theme.colors.border}
          />
        </View>
      </Card>

      <Card title="Data management" subtitle="Backup & restore">
        <TouchableOpacity
          onPress={handleExport}
          style={[
            styles.dataButton,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
          ]}>
          <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Export backup</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            Download all your projects, yarns, and patterns as JSON
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleImport}
          style={[
            styles.dataButton,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
            { marginTop: 12 },
          ]}>
          <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Import backup</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            Restore from a previously exported JSON file
          </Text>
        </TouchableOpacity>
      </Card>

      <TouchableOpacity
        onPress={() => router.push('/profile' as any)}
        style={[
          styles.profileButton,
          { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
        ]}>
        <Text style={{ color: theme.colors.text }}>View profile summary</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
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
  themeRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: -6,
  },
  themeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 6,
  },
  cycleButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleCopy: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  profileButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  dataButton: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  accentColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accentColorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

