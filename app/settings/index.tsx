import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ColorPickerModal } from '@/components/color/ColorPickerModal';
import { Screen } from '@/components/Screen';
import { UnitConverter } from '@/components/tools/UnitConverter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { exportAllData, importData } from '@/lib/dataExport';
import { exportPresets, importPresets } from '@/lib/presetExport';
import { ThemeMode, useAppearanceStore } from '@/store/useAppearanceStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const { showSuccess, showError } = useToast();
  const { mode, setMode, cycleMode, customAccentColor, setCustomAccentColor } = useAppearanceStore();
  const { 
    keepScreenAwake, setKeepScreenAwake, 
    voiceHintsEnabled, toggleVoiceHints, 
    aiAssistantEnabled, toggleAiAssistant, 
    openaiApiKey, setOpenaiApiKey,
    aiProvider, setAiProvider
  } = useSettingsStore();
  const router = useRouter();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExportingPresets, setIsExportingPresets] = useState(false);
  const [isImportingPresets, setIsImportingPresets] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(openaiApiKey || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleSaveApiKey = () => {
    // Simple validation, allow sk- (OpenAI) or xai- (Grok) or just non-empty
    if (apiKeyInput.trim().length > 5) {
      setOpenaiApiKey(apiKeyInput.trim());
      showSuccess('API Key saved');
      setShowApiKeyInput(false);
    } else if (apiKeyInput.trim() === '') {
      setOpenaiApiKey('');
      showSuccess('API Key removed');
      setShowApiKeyInput(false);
    } else {
      showError('Invalid API Key format');
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportAllData();
      showSuccess('Backup exported successfully');
    } catch (error) {
      showError('Failed to export backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsImporting(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const jsonString = await response.text();

      Alert.alert(
        'Import backup?',
        'This will replace all your current data. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setIsImporting(false) },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                await importData(jsonString);
                showSuccess('Backup imported successfully');
              } catch (error) {
                showError('Failed to import backup. File may be invalid.');
              } finally {
                setIsImporting(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      showError('Failed to open file picker');
      setIsImporting(false);
    }
  };

  const handleExportPresets = async () => {
    try {
      setIsExportingPresets(true);
      const success = await exportPresets();
      if (success) {
        showSuccess('Presets exported successfully');
      } else {
        showError('Failed to export presets');
      }
    } catch (error) {
      showError('Failed to export presets');
    } finally {
      setIsExportingPresets(false);
    }
  };

  const handleImportPresets = async () => {
    try {
      setIsImportingPresets(true);
      const result = await importPresets();
      if (result.imported > 0) {
        showSuccess(`Imported ${result.imported} preset(s)`);
        if (result.errors.length > 0) {
          showError(`Some presets failed: ${result.errors.join(', ')}`);
        }
      } else {
        showError(result.errors[0] || 'No presets imported');
      }
    } catch (error) {
      showError('Failed to import presets');
    } finally {
      setIsImportingPresets(false);
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

            {aiAssistantEnabled && (
              <>
                <View style={styles.divider} />
                
                {/* AI Provider Selection */}
                <View style={styles.row}>
                    <View style={styles.iconLabelRow}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                            <FontAwesome name="server" size={14} color={theme.colors.text} />
                        </View>
                        <View>
                            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>AI Provider</Text>
                        </View>
                    </View>
                    <View style={styles.themeToggleRow}>
                        <TouchableOpacity
                            onPress={() => setAiProvider('openai')}
                            style={[
                                styles.themePill,
                                { backgroundColor: aiProvider === 'openai' ? theme.colors.accent : theme.colors.surfaceAlt }
                            ]}
                        >
                            <Text style={{ 
                                color: aiProvider === 'openai' ? '#000' : theme.colors.textSecondary, 
                                fontWeight: aiProvider === 'openai' ? '700' : '400',
                                fontSize: 12
                            }}>
                                OpenAI
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setAiProvider('groq')}
                            style={[
                                styles.themePill,
                                { backgroundColor: aiProvider === 'groq' ? theme.colors.accent : theme.colors.surfaceAlt }
                            ]}
                        >
                            <Text style={{ 
                                color: aiProvider === 'groq' ? '#000' : theme.colors.textSecondary, 
                                fontWeight: aiProvider === 'groq' ? '700' : '400',
                                fontSize: 12
                            }}>
                                Groq
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.divider} />
                
                <View style={styles.apiKeyContainer}>
                  <TouchableOpacity 
                    onPress={() => setShowApiKeyInput(!showApiKeyInput)}
                    style={styles.row}
                  >
                    <View style={styles.iconLabelRow}>
                      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="key" size={16} color={theme.colors.text} />
                      </View>
                      <View>
                        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
                            {aiProvider === 'groq' ? 'Groq API Key' : 'OpenAI API Key'}
                        </Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                          {openaiApiKey ? 'Key saved • Tap to edit' : 'Required for smart features'}
                        </Text>
                      </View>
                    </View>
                    <FontAwesome 
                      name={showApiKeyInput ? "chevron-up" : "chevron-down"} 
                      size={14} 
                      color={theme.colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  {showApiKeyInput && (
                    <View style={styles.apiKeyInputContainer}>
                      <TextInput
                        value={apiKeyInput}
                        onChangeText={setApiKeyInput}
                        placeholder={aiProvider === 'groq' ? "gsk_..." : "sk-..."}
                        placeholderTextColor={theme.colors.muted}
                        style={[styles.apiKeyInput, { 
                          color: theme.colors.text,
                          backgroundColor: theme.colors.surfaceAlt,
                          borderColor: theme.colors.border
                        }]}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                      <TouchableOpacity 
                        onPress={handleSaveApiKey}
                        style={[styles.saveKeyButton, { backgroundColor: theme.colors.accent }]}
                      >
                        <Text style={{ color: '#000', fontWeight: '700', fontSize: 12 }}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}
            
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
            <TouchableOpacity 
                onPress={handleExport} 
                disabled={isExporting}
                style={[styles.row, isExporting && { opacity: 0.6 }]}>
                <View style={styles.iconLabelRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="download" size={16} color={theme.colors.text} />
                    </View>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Export Backup</Text>
                </View>
                {isExporting ? (
                    <LoadingSpinner size="small" />
                ) : (
                    <FontAwesome name="chevron-right" size={14} color={theme.colors.textSecondary} />
                )}
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
                onPress={handleImport} 
                disabled={isImporting}
                style={[styles.row, isImporting && { opacity: 0.6 }]}>
                <View style={styles.iconLabelRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="upload" size={16} color={theme.colors.text} />
                    </View>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Import Backup</Text>
                </View>
                {isImporting ? (
                    <LoadingSpinner size="small" />
                ) : (
                    <FontAwesome name="chevron-right" size={14} color={theme.colors.textSecondary} />
                )}
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>COUNTER PRESETS</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity 
                onPress={handleExportPresets} 
                disabled={isExportingPresets}
                style={[styles.row, isExportingPresets && { opacity: 0.6 }]}>
                <View style={styles.iconLabelRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="download" size={16} color={theme.colors.text} />
                    </View>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Export Presets</Text>
                </View>
                {isExportingPresets ? (
                    <LoadingSpinner size="small" />
                ) : (
                    <FontAwesome name="chevron-right" size={14} color={theme.colors.textSecondary} />
                )}
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
                onPress={handleImportPresets} 
                disabled={isImportingPresets}
                style={[styles.row, isImportingPresets && { opacity: 0.6 }]}>
                <View style={styles.iconLabelRow}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                        <FontAwesome name="upload" size={16} color={theme.colors.text} />
                    </View>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Import Presets</Text>
                </View>
                {isImportingPresets ? (
                    <LoadingSpinner size="small" />
                ) : (
                    <FontAwesome name="chevron-right" size={14} color={theme.colors.textSecondary} />
                )}
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
  apiKeyContainer: {
    flexDirection: 'column',
  },
  apiKeyInputContainer: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'row',
    gap: 8,
  },
  apiKeyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  saveKeyButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});
