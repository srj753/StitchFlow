import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { ColorPickerModal } from '@/components/color/ColorPickerModal';
import { Screen } from '@/components/Screen';
import { UnitConverter } from '@/components/tools/UnitConverter';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { exportAllData, importData } from '@/lib/dataExport';
import { ThemeMode, useAppearanceStore } from '@/store/useAppearanceStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const { showSuccess, showError } = useToast();
  const { mode, setMode, cycleMode, customAccentColor, setCustomAccentColor } = useAppearanceStore();
  const { keepScreenAwake, setKeepScreenAwake, voiceHintsEnabled, toggleVoiceHints, aiAssistantEnabled, toggleAiAssistant } =
    useSettingsStore();
  const router = useRouter();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showConverter, setShowConverter] = useState(false);

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
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>PREFERENCES</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Customize your experience and manage your data.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.row}>
                <View>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Theme</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </View>
                <View style={styles.themeToggleRow}>
                    {themeOptions.map((option) => {
                        const selected = mode === option.value;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setMode(option.value)}
                                style={[
                                    styles.themePill,
                                    {
                                        backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceAlt,
                                    }
                                ]}
                            >
                                <Text style={{ 
                                    color: selected ? '#000' : theme.colors.textSecondary, 
                                    fontWeight: selected ? '700' : '400',
                                    fontSize: 12
                                }}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            
            <View style={styles.divider} />
            
            <TouchableOpacity onPress={() => setShowColorPicker(true)} style={styles.row}>
                <View>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Accent Color</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                        {customAccentColor ? 'Custom' : 'Default Pink'}
                    </Text>
                </View>
                <View style={[styles.colorSwatch, { backgroundColor: customAccentColor || theme.colors.accent }]} />
            </TouchableOpacity>
            
            {customAccentColor && (
                <>
                    <View style={styles.divider} />
                    <TouchableOpacity 
                        onPress={() => {
                            setCustomAccentColor(undefined);
                            showSuccess('Reset to default accent color');
                        }} 
                        style={styles.row}
                    >
                        <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>Reset Accent Color</Text>
                        <FontAwesome name="undo" size={14} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </>
            )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>TOOLS & FEATURES</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity onPress={() => setShowConverter(true)} style={styles.row}>
                <View style={styles.iconLabelRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="calculator" size={16} color={theme.colors.text} />
                    </View>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Unit Converter</Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <View style={styles.row}>
                <View style={styles.iconLabelRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="magic" size={16} color={theme.colors.text} />
                    </View>
                    <View>
                        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>AI Assistant</Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Show Assistant tab in projects</Text>
                    </View>
                </View>
                <Switch
                    value={aiAssistantEnabled}
                    onValueChange={toggleAiAssistant}
                    trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.accent }}
                />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.row}>
                <View style={styles.iconLabelRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="eye" size={16} color={theme.colors.text} />
                    </View>
                    <View>
                        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Keep Screen Awake</Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>While in project view</Text>
                    </View>
                </View>
                <Switch
                    value={keepScreenAwake}
                    onValueChange={setKeepScreenAwake}
                    trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.accent }}
                />
            </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>DATA</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity onPress={handleExport} style={styles.row}>
                <View style={styles.iconLabelRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="download" size={16} color={theme.colors.text} />
                    </View>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Export Backup</Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity onPress={handleImport} style={styles.row}>
                <View style={styles.iconLabelRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="upload" size={16} color={theme.colors.text} />
                    </View>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Import Backup</Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.section, { marginBottom: 40 }]}>
         <TouchableOpacity
            onPress={() => router.push('/profile' as any)}
            style={[styles.profileButton, { backgroundColor: theme.colors.surfaceAlt }]}
         >
             <Text style={{ color: theme.colors.text, fontWeight: '600' }}>View Profile Summary</Text>
         </TouchableOpacity>
         <Text style={{ textAlign: 'center', marginTop: 16, color: theme.colors.muted, fontSize: 12 }}>
             StitchFlow v1.0.0
         </Text>
      </View>

      <Modal
        visible={showConverter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConverter(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Unit Converter</Text>
              <TouchableOpacity onPress={() => setShowConverter(false)} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <UnitConverter />
          </View>
        </View>
      </Modal>
      
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
    </Screen>
  );
}

const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: 'Auto', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
    paddingTop: 16,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
      marginBottom: 24,
  },
  sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 12,
      paddingLeft: 8,
  },
  card: {
      borderRadius: 24,
      overflow: 'hidden',
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      minHeight: 56,
  },
  rowLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
  },
  iconLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
  },
  divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: 'rgba(150,150,150,0.1)',
      marginLeft: 16,
  },
  themeToggleRow: {
      flexDirection: 'row',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 12,
      padding: 2,
  },
  themePill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
  },
  colorSwatch: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  profileButton: {
      padding: 16,
      borderRadius: 20,
      alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
});
