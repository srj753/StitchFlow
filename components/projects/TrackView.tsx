import * as Speech from 'expo-speech';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import {
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Counter } from '@/components/counters/Counter';
import { CounterPresetPicker } from '@/components/counters/CounterPresetPicker';
import { LinkedCounterGroup } from '@/components/counters/LinkedCounterGroup';
import { JournalEntry } from '@/components/journal/JournalEntry';
import { PhotoLightbox } from '@/components/photos/PhotoLightbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useKeepScreenAwake } from '@/hooks/useKeepScreenAwake';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { VoiceControlButton } from '@/components/counters/VoiceControlButton';
import { findCounterByName, ParsedCommand } from '@/lib/voiceCommands';
import { useCounterPresetsStore } from '@/store/useCounterPresetsStore';
import { useProjectsStore } from '@/store/useProjectsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useYarnStore } from '@/store/useYarnStore';
import type { Project } from '@/types/project';
import type { Yarn } from '@/types/yarn';

type TrackViewProps = {
  project: Project;
};

export function TrackView({ project }: TrackViewProps) {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Group counters by their linked status
  const { linkedGroups, unlinkedCounters } = useMemo(() => {
    const processedIds = new Set<string>();
    const linkedGroups: string[][] = [];
    const unlinkedCounters: typeof project.counters = [];

    project.counters.forEach((counter) => {
      if (processedIds.has(counter.id)) return;

      const linkedIds = counter.linkedCounterIds || [];
      if (linkedIds.length > 0) {
        // This counter is part of a linked group
        const group = [counter.id, ...linkedIds];
        linkedGroups.push(group);
        group.forEach((id) => processedIds.add(id));
      } else {
        // Check if this counter is linked to by another counter
        const isLinkedTo = project.counters.some(
          (c) => c.linkedCounterIds?.includes(counter.id)
        );
        if (!isLinkedTo) {
          unlinkedCounters.push(counter);
          processedIds.add(counter.id);
        }
      }
    });

    return { linkedGroups, unlinkedCounters };
  }, [project.counters]);

  const updateCounter = useProjectsStore((state) => state.updateCounter);
  const updateCounterLabel = useProjectsStore((state) => state.updateCounterLabel);
  const addCounter = useProjectsStore((state) => state.addCounter);
  const deleteCounter = useProjectsStore((state) => state.deleteCounter);
  const linkCounters = useProjectsStore((state) => state.linkCounters);
  const unlinkCounter = useProjectsStore((state) => state.unlinkCounter);
  const updateProjectStatus = useProjectsStore((state) => state.updateProjectStatus);
  const addJournalEntry = useProjectsStore((state) => state.addJournalEntry);
  const deleteJournalEntry = useProjectsStore((state) => state.deleteJournalEntry);
  const updateNotes = useProjectsStore((state) => state.updateNotes);
  const updateProgressNotes = useProjectsStore((state) => state.updateProgressNotes);
  const addPhoto = useProjectsStore((state) => state.addPhoto);
  const deletePhoto = useProjectsStore((state) => state.deletePhoto);
  const linkYarnToProject = useProjectsStore((state) => state.linkYarn);
  const updateLinkedYarnEntry = useProjectsStore((state) => state.updateLinkedYarn);
  const unlinkYarnEntry = useProjectsStore((state) => state.unlinkYarn);
  const keepScreenAwake = useSettingsStore((state) => state.keepScreenAwake);
  const yarns = useYarnStore((state) => state.yarns);
  const reserveYarn = useYarnStore((state) => state.reserveYarn);
  const releaseYarn = useYarnStore((state) => state.releaseYarn);

  const [journalText, setJournalText] = useState('');
  const [showYarnModal, setShowYarnModal] = useState(false);
  const [selectedYarnId, setSelectedYarnId] = useState<string | null>(null);
  const [linkAmount, setLinkAmount] = useState('1');
  const [linkError, setLinkError] = useState<string | undefined>();
  const [activeNotesTab, setActiveNotesTab] = useState<'pattern' | 'progress'>('pattern');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedCounterForLinking, setSelectedCounterForLinking] = useState<string | null>(null);
  const [selectedCountersToLink, setSelectedCountersToLink] = useState<Set<string>>(new Set());
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [patternNotesDraft, setPatternNotesDraft] = useState('');
  const [progressNotesDraft, setProgressNotesDraft] = useState('');
  
  // Voice command handler
  const handleVoiceCommand = (command: ParsedCommand) => {
    const { action } = command;
    
    // Find the target counter
    const targetCounter = action.counterName
      ? findCounterByName(
          project.counters.map((c) => ({ id: c.id, label: c.label })),
          action.counterName,
        )
      : project.counters[0]; // Default to first counter
    
    if (!targetCounter) {
      showError(`Counter "${action.counterName}" not found`);
      return;
    }
    
    const counter = project.counters.find((c) => c.id === targetCounter.id);
    if (!counter) return;
    
    switch (action.type) {
      case 'increment': {
        const newValue = counter.currentValue + (action.amount || 1);
        updateCounter(project.id, counter.id, newValue);
        const message = `Added ${action.amount || 1} to ${counter.label}. Now at ${newValue}`;
        Speech.speak(message, { language: 'en', rate: 0.9 });
        showSuccess(message);
        break;
      }
        
      case 'decrement': {
        const newValue = Math.max(0, counter.currentValue - (action.amount || 1));
        updateCounter(project.id, counter.id, newValue);
        const message = `Subtracted ${action.amount || 1} from ${counter.label}. Now at ${newValue}`;
        Speech.speak(message, { language: 'en', rate: 0.9 });
        showSuccess(message);
        break;
      }
        
      case 'set':
        updateCounter(project.id, counter.id, action.value);
        const setMessage = `Set ${counter.label} to ${action.value}`;
        Speech.speak(setMessage, { language: 'en', rate: 0.9 });
        showSuccess(setMessage);
        break;
        
      case 'reset':
        updateCounter(project.id, counter.id, 0);
        const resetMessage = `Reset ${counter.label} to zero`;
        Speech.speak(resetMessage, { language: 'en', rate: 0.9 });
        showSuccess(resetMessage);
        break;
        
      case 'read':
        // Speak the value
        const readText = `${counter.label} is at ${counter.currentValue}`;
        Speech.speak(readText, { language: 'en', rate: 0.9 });
        showSuccess(readText);
        break;
        
      default:
        showError('Command not recognized');
    }
  };

  useEffect(() => {
    setPatternNotesDraft(project.notes ?? '');
    setProgressNotesDraft(project.progressNotes ?? '');
  }, [project.id, project.notes, project.progressNotes]);

  const yarnMap = useMemo(() => {
    const map: Record<string, Yarn> = {};
    yarns.forEach((yarn) => {
      map[yarn.id] = yarn;
    });
    return map;
  }, [yarns]);

  const availableYarns = useMemo(
    () =>
      yarns.filter(
        (yarn) =>
          yarn.skeinsOwned - yarn.skeinsReserved > 0 &&
          !project.linkedYarns.some((link) => link.yarnId === yarn.id),
      ),
    [yarns, project.linkedYarns],
  );

  const totalReserved = useMemo(
    () => project.linkedYarns.reduce((sum, link) => sum + link.skeinsUsed, 0),
    [project.linkedYarns],
  );

  const totalAvailable = useMemo(
    () => yarns.reduce((sum, yarn) => sum + Math.max(0, yarn.skeinsOwned - yarn.skeinsReserved), 0),
    [yarns],
  );
  const canLinkYarn = availableYarns.length > 0;
  const stashEmpty = yarns.length === 0;
  useKeepScreenAwake(keepScreenAwake);

  const handleSavePatternNotes = () => {
    updateNotes(project.id, patternNotesDraft);
  };

  const handleSaveProgressNotes = () => {
    updateProgressNotes(project.id, progressNotesDraft);
  };

  const handleOpenYarnModal = () => {
    setSelectedYarnId(availableYarns[0]?.id ?? null);
    setLinkAmount('1');
    setLinkError(undefined);
    setShowYarnModal(true);
  };

  const handleCloseYarnModal = () => {
    setShowYarnModal(false);
    setSelectedYarnId(null);
    setLinkError(undefined);
  };

  const handleConfirmLink = () => {
    if (!selectedYarnId) {
      setLinkError('Select a yarn to link.');
      return;
    }
    const yarn = yarnMap[selectedYarnId];
    if (!yarn) {
      setLinkError('Yarn not found.');
      return;
    }
    const parsed = Number(linkAmount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setLinkError('Enter a positive number of skeins.');
      return;
    }
    const available = Math.max(0, yarn.skeinsOwned - yarn.skeinsReserved);
    if (available <= 0) {
      setLinkError('No skeins available for this yarn.');
      return;
    }
    const amount = Math.min(parsed, available);
    linkYarnToProject(project.id, { yarnId: yarn.id, skeins: amount });
    reserveYarn(yarn.id, amount);
    showSuccess(`${yarn.name} linked to project`);
    handleCloseYarnModal();
  };

  const handleLinkedAmountChange = (linkId: string, value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const link = project.linkedYarns.find((item) => item.id === linkId);
    if (!link) return;
    const yarn = yarnMap[link.yarnId];
    const maxAllowed = yarn
      ? Math.max(0, yarn.skeinsOwned - yarn.skeinsReserved + link.skeinsUsed)
      : parsed;
    const nextValue = Math.max(0, Math.min(parsed, maxAllowed));
    const delta = nextValue - link.skeinsUsed;
    if (delta > 0) {
      reserveYarn(link.yarnId, delta);
    } else if (delta < 0) {
      releaseYarn(link.yarnId, Math.abs(delta));
    }
    updateLinkedYarnEntry(project.id, linkId, { skeinsUsed: nextValue });
  };

  const handleRemoveLink = (linkId: string) => {
    const link = project.linkedYarns.find((item) => item.id === linkId);
    if (!link) return;
    const yarn = yarnMap[link.yarnId];
    releaseYarn(link.yarnId, link.skeinsUsed);
    unlinkYarnEntry(project.id, linkId);
    showSuccess(`${yarn?.name || 'Yarn'} unlinked from project`);
  };

  const handleAddPhoto = async () => {
    setIsLoadingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets?.length) {
        addPhoto(project.id, result.assets[0].uri);
        showSuccess('Photo added to project');
      }
    } catch (error) {
      showError('Could not open photo library. Please try again.');
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleRemovePhoto = (uri: string) => {
    deletePhoto(project.id, uri);
    showSuccess('Photo removed');
  };

  const handlePublish = () => {
      router.push({
          pathname: '/community/publish',
          params: { projectId: project.id }
      });
  };

  // Use counters instead of legacy fields
  const rowCounter = useMemo(() => {
    return project.counters.find((c) => c.type === 'row' || c.label.toLowerCase().includes('row'));
  }, [project.counters]);

  const completion = useMemo(() => {
    if (!rowCounter || !rowCounter.targetValue || rowCounter.targetValue <= 0) return undefined;
    return Math.min(100, (rowCounter.currentValue / rowCounter.targetValue) * 100);
  }, [rowCounter]);

  return (
    <View style={styles.container}>
      {/* Changed ScrollView to View to avoid nesting issues, relying on parent Screen scroll */}
      {/* But wait, if parent scrolls, the content inside must not be scrollable or conflicting */}
      {/* However, to ensure proper layout, we keep it simple. Screen handles scroll. */}
      {/* We just render content. */}
      
      <View style={styles.content}>
        
        {/* Hero Dashboard Card */}
        <View style={styles.heroCardContainer}>
             <View style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
                <LinearGradient
                   colors={[theme.colors.surface, theme.colors.surfaceAlt]}
                   style={StyleSheet.absoluteFill}
                />
                
                <View style={styles.heroHeader}>
                    <View style={styles.statusBadge}>
                        <FontAwesome name={project.status === 'active' ? 'play' : 'pause'} size={10} color={theme.colors.accent} />
                        <Text style={[styles.statusText, { color: theme.colors.accent }]}>
                            {project.status === 'active' ? 'IN PROGRESS' : project.status.toUpperCase()}
                        </Text>
                    </View>
                    <View style={{flex: 1}} />
                </View>

                <View style={styles.heroMetrics}>
                    <View style={styles.metricColumn}>
                        <Text style={[styles.metricLabel, { color: theme.colors.muted }]}>ROWS</Text>
                        <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                            {rowCounter?.currentValue ?? 0}
                            <Text style={{ fontSize: 16, color: theme.colors.textSecondary }}>
                                {rowCounter?.targetValue ? ` / ${rowCounter.targetValue}` : ''}
                            </Text>
                        </Text>
                    </View>
                     <View style={[styles.metricColumn, { alignItems: 'flex-end' }]}>
                        <Text style={[styles.metricLabel, { color: theme.colors.muted }]}>COMPLETION</Text>
                        <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                            {completion ? Math.round(completion) : 0}%
                        </Text>
                    </View>
                </View>
                
                {completion !== undefined && (
                    <View style={styles.heroProgressTrack}>
                        <View 
                            style={[
                                styles.heroProgressFill, 
                                { width: `${completion}%`, backgroundColor: theme.colors.accent }
                            ]} 
                        />
                    </View>
                )}
                
                <View style={styles.heroActions}>
                     <TouchableOpacity
                        onPress={() => {
                            const newStatus = project.status === 'active' ? 'paused' : 'active';
                            updateProjectStatus(project.id, newStatus);
                        }}
                        style={[styles.heroButton, { backgroundColor: theme.colors.surfaceAlt }]}
                     >
                        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                            {project.status === 'active' ? 'Pause' : 'Resume'}
                        </Text>
                     </TouchableOpacity>
                     
                     {project.status !== 'finished' && (
                        <TouchableOpacity
                             onPress={() => updateProjectStatus(project.id, 'finished')}
                             style={[styles.heroButton, { backgroundColor: theme.colors.surfaceAlt }]}
                        >
                             <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Finish</Text>
                        </TouchableOpacity>
                     )}
                     
                     {project.status === 'finished' && (
                         <TouchableOpacity
                             onPress={handlePublish}
                             style={[styles.heroButton, { backgroundColor: theme.colors.accent }]}
                         >
                              <Text style={{ color: '#000', fontWeight: '700' }}>Share</Text>
                         </TouchableOpacity>
                     )}
                </View>
             </View>
        </View>

        {/* Counters Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>COUNTERS</Text>
          
          {linkedGroups.map((groupIds, groupIndex) => {
            const groupCounters = project.counters.filter((c) => groupIds.includes(c.id));
            if (groupCounters.length < 2) return null;

            return (
              <LinkedCounterGroup
                key={`linked-${groupIndex}`}
                counters={groupCounters}
                linkedIds={groupIds}
                onIncrement={(counterId, delta) => {
                  const counter = project.counters.find((c) => c.id === counterId);
                  if (counter) {
                    const newValue = counter.currentValue + delta;
                    updateCounter(project.id, counterId, newValue);
                  }
                }}
                onSetValue={(counterId, value) => {
                  updateCounter(project.id, counterId, value);
                }}
                onUnlink={(counterId) => {
                  const counter = project.counters.find((c) => c.id === counterId);
                  Alert.alert(
                    'Unlink Counter',
                    `Are you sure you want to unlink "${counter?.label}"? It will no longer be grouped with other linked counters.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Unlink',
                        style: 'destructive',
                        onPress: () => {
                          unlinkCounter(project.id, counterId);
                          showSuccess('Counter unlinked');
                        },
                      },
                    ]
                  );
                }}
              />
            );
          })}

          {unlinkedCounters.map((counter) => {
            const isLinked = counter.linkedCounterIds && counter.linkedCounterIds.length > 0;
            return (
              <Counter
                key={counter.id}
                counter={counter}
                isLinked={isLinked}
                onIncrement={(delta) => {
                  const newValue = counter.currentValue + delta;
                  updateCounter(project.id, counter.id, newValue);
                }}
                onSetValue={(value) => updateCounter(project.id, counter.id, value)}
                onRename={(label) => {
                  updateCounterLabel(project.id, counter.id, label);
                  showSuccess('Counter renamed');
                }}
                onLink={() => {
                  setSelectedCounterForLinking(counter.id);
                  setSelectedCountersToLink(new Set());
                  setShowLinkModal(true);
                }}
                onDelete={
                  project.counters.length > 1
                    ? () => {
                        deleteCounter(project.id, counter.id);
                        showSuccess('Counter removed');
                      }
                    : undefined
                }
              />
            );
          })}

          <View style={styles.addCounterRow}>
            <TouchableOpacity
              onPress={() => {
                addCounter(project.id, {
                  type: 'custom',
                  label: `Counter ${project.counters.length + 1}`,
                  currentValue: 0,
                });
                showSuccess('Counter added');
              }}
              style={[
                styles.addCounterButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceAlt,
                },
              ]}>
              <FontAwesome name="plus" size={14} color={theme.colors.accent} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>
                Add Counter
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShowPresetPicker(true)}
              style={[
                styles.addCounterButton,
                {
                  borderColor: theme.colors.accent,
                  backgroundColor: theme.colors.accentMuted,
                },
              ]}>
              <FontAwesome name="magic" size={14} color={theme.colors.accent} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>
                Preset
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Voice Control */}
          {/* Only show voice control if not in Expo Go */}
          {/* In Expo Go, the module doesn't exist, so we skip rendering to avoid errors */}
          {Constants.executionEnvironment === 'standalone' || Constants.executionEnvironment === 'bare' ? (
            <View style={[styles.voiceControlContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.voiceControlLabel, { color: theme.colors.textSecondary }]}>
                Voice Control
              </Text>
              <VoiceControlButton
                onCommand={handleVoiceCommand}
                enabled={true}
                size="medium"
              />
            </View>
          ) : null}
          
          <CounterPresetPicker
            visible={showPresetPicker}
            onClose={() => setShowPresetPicker(false)}
            onSelect={(preset) => {
              preset.counters.forEach((counterConfig) => {
                addCounter(project.id, {
                  type: counterConfig.type,
                  label: counterConfig.label,
                  currentValue: 0,
                  targetValue: counterConfig.targetValue,
                });
              });
              // Record preset usage for analytics
              const recordUsage = useCounterPresetsStore.getState().recordUsage;
              recordUsage(preset.id, project.patternName || undefined);
              showSuccess(`${preset.name} preset applied`);
            }}
          />
        </View>

        <View style={styles.section}>
           <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>NOTES</Text>
           <View style={[styles.notesContainer, { backgroundColor: theme.colors.surface }]}>
               <View style={styles.notesTabs}>
                    {['pattern', 'progress'].map((tab) => {
                    const selected = activeNotesTab === tab;
                    const label = tab === 'pattern' ? 'Pattern' : 'Progress';
                    return (
                        <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveNotesTab(tab as 'pattern' | 'progress')}
                        style={[
                            styles.notesTab,
                            {
                            borderBottomWidth: 2,
                            borderColor: selected ? theme.colors.accent : 'transparent',
                            },
                        ]}>
                        <Text
                            style={{
                            color: selected ? theme.colors.accent : theme.colors.textSecondary,
                            fontWeight: '700',
                            fontSize: 14,
                            }}>
                            {label}
                        </Text>
                        </TouchableOpacity>
                    );
                    })}
                </View>
                <TextInput
                    multiline
                    numberOfLines={6}
                    value={activeNotesTab === 'pattern' ? patternNotesDraft : progressNotesDraft}
                    onChangeText={activeNotesTab === 'pattern' ? setPatternNotesDraft : setProgressNotesDraft}
                    onBlur={activeNotesTab === 'pattern' ? handleSavePatternNotes : handleSaveProgressNotes}
                    placeholder={activeNotesTab === 'pattern' ? "Stitch substitutions, sizing tweaks..." : "Row checkpoints, reminders..."}
                    placeholderTextColor={theme.colors.muted}
                    style={[
                        styles.textArea,
                        {
                        color: theme.colors.text,
                        },
                    ]}
                />
           </View>
        </View>

        {/* Yarn & Stash Section - Redesigned */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>YARN & MATERIALS</Text>
              <TouchableOpacity 
                 onPress={handleOpenYarnModal} 
                 disabled={stashEmpty || !canLinkYarn}
                 style={{ opacity: stashEmpty || !canLinkYarn ? 0.5 : 1 }}
              >
                  <Text style={{ color: theme.colors.accent, fontWeight: '600', fontSize: 13 }}>+ Link Yarn</Text>
              </TouchableOpacity>
           </View>

          {project.linkedYarns.length === 0 ? (
             <EmptyState
               compact
               icon={{ name: 'inbox', size: 32 }}
               title="No yarn linked"
               description="Link yarn from your stash to track usage in this project."
               actionLabel="Link Yarn"
               onAction={() => setShowYarnModal(true)}
             />
          ) : (
            <View style={styles.yarnList}>
              {project.linkedYarns.map((link) => {
                const yarn = yarnMap[link.yarnId];
                const available =
                  yarn !== undefined
                    ? Math.max(0, yarn.skeinsOwned - yarn.skeinsReserved + link.skeinsUsed)
                    : 0;
                return (
                  <View
                    key={link.id}
                    style={[
                      styles.yarnRow,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}>
                    <View style={styles.yarnMetaRow}>
                      <View
                        style={[
                          styles.yarnSwatch,
                          {
                            borderColor: theme.colors.border,
                            backgroundColor: yarn?.colorHex ?? theme.colors.cardMuted,
                          },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.yarnName, { color: theme.colors.text }]}>
                          {yarn?.name ?? 'Missing yarn'}
                        </Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                          {(yarn?.brand ?? 'Unknown brand')}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveLink(link.id)} style={styles.iconButton}>
                          <FontAwesome name="trash-o" size={18} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Skein Control */}
                    <View style={[styles.skeinControl, { backgroundColor: theme.colors.surfaceAlt }]}>
                         <Text style={{ color: theme.colors.textSecondary, fontSize: 12, flex: 1 }}>Used in project:</Text>
                         <TextInput
                          value={String(link.skeinsUsed)}
                          onChangeText={(text) => handleLinkedAmountChange(link.id, text)}
                          keyboardType="numeric"
                          style={[
                            styles.skeinInput,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                        />
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>skeins</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Photos Section - Redesigned */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PHOTOS</Text>
              <TouchableOpacity onPress={handleAddPhoto} disabled={isLoadingPhoto}>
                  <Text style={{ color: theme.colors.accent, fontWeight: '600', fontSize: 13 }}>+ Add Photo</Text>
              </TouchableOpacity>
           </View>
          
          {isLoadingPhoto && <LoadingSpinner overlay />}
          
          {project.photos.length === 0 ? (
            <EmptyState
              compact
              icon={{ name: 'camera', size: 32 }}
              title="No photos yet"
              description="Document your progress by adding photos of your work."
              actionLabel="Add Photo"
              onAction={handleAddPhoto}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoRow}>
              {project.photos.map((uri, index) => (
                <View key={uri} style={styles.photoItem}>
                  <TouchableOpacity
                    onPress={() => {
                      setLightboxIndex(index);
                      setLightboxVisible(true);
                    }}
                    style={[styles.photoContainer, { borderColor: theme.colors.border }]}
                  >
                    <Image source={{ uri }} style={styles.photoImage} />
                    <TouchableOpacity
                        onPress={() => handleRemovePhoto(uri)}
                        style={styles.photoDeleteBadge}
                    >
                        <FontAwesome name="times" size={12} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Journal Section - Redesigned */}
        <View style={[styles.section, { marginBottom: 40 }]}>
           <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>JOURNAL</Text>
           
           {/* Add Note Input */}
           <View style={[styles.journalInputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <TextInput
                value={journalText}
                onChangeText={setJournalText}
                placeholder="Log a thought or milestone..."
                placeholderTextColor={theme.colors.muted}
                multiline
                style={[
                    styles.journalInput,
                    {
                    color: theme.colors.text,
                    },
                ]}
                />
                <View style={styles.journalActionRow}>
                    <TouchableOpacity
                        onPress={() => {
                        const currentCounters = project.counters;
                        const rowCounter = currentCounters.find((c) => c.type === 'row');
                        addJournalEntry(project.id, {
                            type: 'milestone',
                            text: journalText.trim() || 'Milestone reached!',
                            metadata: {
                            roundsCompleted: rowCounter?.currentValue,
                            heightAchieved: project.currentHeightInches,
                            },
                        });
                        setJournalText('');
                        showSuccess('Milestone logged!');
                        }}
                        style={styles.journalIconAction}
                    >
                        <FontAwesome name="flag-o" size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    
                    <View style={{ flex: 1 }} />
                    
                    <TouchableOpacity
                        onPress={() => {
                        if (journalText.trim()) {
                            addJournalEntry(project.id, {
                            type: 'note',
                            text: journalText.trim(),
                            });
                            setJournalText('');
                            showSuccess('Note added');
                        }
                        }}
                        style={[styles.postButton, { backgroundColor: theme.colors.surfaceAlt }]}
                    >
                        <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 12 }}>Post</Text>
                    </TouchableOpacity>
                </View>
           </View>

          {project.journal.length > 0 ? (
            <View style={styles.journalList}>
              {project.journal.map((entry) => (
                <JournalEntry
                  key={entry.id}
                  entry={entry}
                  onDelete={() => {
                    deleteJournalEntry(project.id, entry.id);
                    showSuccess('Entry removed');
                  }}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              compact
              icon={{ name: 'book', size: 32 }}
              title="No journal entries yet"
              description="Add notes, milestones, or progress updates to track your journey."
            />
          )}
        </View>
      </View>

      {/* Modals remain the same */}
      <Modal visible={showYarnModal} transparent animationType="fade" onRequestClose={handleCloseYarnModal}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Link yarn from stash</Text>
            {stashEmpty ? (
              <Text style={{ color: theme.colors.textSecondary }}>
                Your stash is empty. Head to Patterns → Yarn Stash to add yarn before linking it here.
              </Text>
            ) : !canLinkYarn ? (
              <Text style={{ color: theme.colors.textSecondary }}>
                All stash yarns are already linked or fully reserved. Adjust existing links to free up skeins.
              </Text>
            ) : (
              <>
                <View style={styles.modalYarnList}>
                  {availableYarns.map((yarn) => {
                    const selected = selectedYarnId === yarn.id;
                    const available = Math.max(0, yarn.skeinsOwned - yarn.skeinsReserved);
                    return (
                      <TouchableOpacity
                        key={yarn.id}
                        onPress={() => setSelectedYarnId(yarn.id)}
                        style={[
                          styles.modalYarnOption,
                          {
                            borderColor: selected ? theme.colors.accent : theme.colors.border,
                            backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                          },
                        ]}>
                        <View style={styles.modalYarnOptionHeader}>
                          <Text
                            style={{
                              color: selected ? theme.colors.accent : theme.colors.text,
                              fontWeight: '600',
                            }}>
                            {yarn.name}
                          </Text>
                          <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                            {available.toFixed(1)} skeins free
                          </Text>
                        </View>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                          {yarn.brand ?? 'Unknown brand'} · {yarn.color}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.modalField}>
                  <Text style={{ color: theme.colors.muted, fontSize: 12, marginBottom: 4 }}>
                    Skeins to reserve
                  </Text>
                  <TextInput
                    value={linkAmount}
                    onChangeText={setLinkAmount}
                    keyboardType="numeric"
                    style={[
                      styles.modalInput,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceAlt,
                        color: theme.colors.text,
                      },
                    ]}
                  />
                </View>
                {linkError ? (
                  <Text style={{ color: theme.colors.accent, fontSize: 13 }}>{linkError}</Text>
                ) : null}
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleCloseYarnModal}
                style={[
                  styles.modalButton,
                  {
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmLink}
                disabled={stashEmpty || !canLinkYarn}
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  {
                    backgroundColor: theme.colors.accent,
                    opacity: stashEmpty || !canLinkYarn ? 0.5 : 1,
                  },
                ]}>
                <Text style={styles.modalButtonPrimaryText}>Link yarn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Link Counter Modal */}
      <Modal
        visible={showLinkModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowLinkModal(false);
          setSelectedCounterForLinking(null);
          setSelectedCountersToLink(new Set());
        }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Link Counters</Text>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 16, fontSize: 14 }}>
              Select counters to link with "{project.counters.find((c) => c.id === selectedCounterForLinking)?.label}". Linked counters will show a combined total.
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {unlinkedCounters
                .filter((c) => c.id !== selectedCounterForLinking)
                .map((counter) => {
                  const isSelected = selectedCountersToLink.has(counter.id);
                  return (
                    <TouchableOpacity
                      key={counter.id}
                      onPress={() => {
                        const next = new Set(selectedCountersToLink);
                        if (isSelected) {
                          next.delete(counter.id);
                        } else {
                          next.add(counter.id);
                        }
                        setSelectedCountersToLink(next);
                      }}
                      style={[
                        styles.modalYarnOption,
                        {
                          borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                          backgroundColor: isSelected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                          marginBottom: 8,
                        },
                      ]}>
                      <Text
                        style={{
                          color: isSelected ? theme.colors.accent : theme.colors.text,
                          fontWeight: '600',
                        }}>
                        {counter.label}
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                        Current: {counter.currentValue}
                        {counter.targetValue ? ` / ${counter.targetValue}` : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            {unlinkedCounters.filter((c) => c.id !== selectedCounterForLinking).length === 0 && (
              <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginVertical: 20 }}>
                No other counters available to link.
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowLinkModal(false);
                  setSelectedCounterForLinking(null);
                  setSelectedCountersToLink(new Set());
                }}
                style={[
                  styles.modalButton,
                  {
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (selectedCounterForLinking && selectedCountersToLink.size > 0) {
                    const allIds = [selectedCounterForLinking, ...Array.from(selectedCountersToLink)];
                    linkCounters(project.id, allIds);
                    showSuccess(`${selectedCountersToLink.size + 1} counters linked`);
                    setShowLinkModal(false);
                    setSelectedCounterForLinking(null);
                    setSelectedCountersToLink(new Set());
                  }
                }}
                disabled={selectedCountersToLink.size === 0}
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  {
                    backgroundColor: theme.colors.accent,
                    opacity: selectedCountersToLink.size === 0 ? 0.5 : 1,
                  },
                ]}>
                <Text style={styles.modalButtonPrimaryText}>Link Counters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PhotoLightbox
        photos={project.photos}
        initialIndex={lightboxIndex}
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
      />
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={{ color: theme.colors.muted, fontSize: 12, letterSpacing: 1 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    // Removed horizontal padding to let content go edge-to-edge if desired, 
    // but generally we want padding unless the children are full-width cards.
    // Given the user complaint about "divs so padded", likely they meant the extra indentation.
    // The parent Screen typically adds horizontal padding (24).
    // If we want full bleed, we'd negative margin it, but here we likely just don't want EXTRA padding.
    // So removing paddingHorizontal: 16 helps.
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
  },
  sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 8,
  },
  heroCardContainer: {
    marginBottom: 24,
    // Removed paddingHorizontal here too
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    gap: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metricColumn: {
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  heroProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metric: {
    flex: 1,
    marginRight: 16,
  },
  notesContainer: {
      borderRadius: 24,
      padding: 20,
  },
  textArea: {
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  notesTabs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 0,
  },
  notesTab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  addCounterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addCounterButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  voiceControlContainer: {
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.1)',
  },
  voiceControlLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  journalInputContainer: {
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      marginBottom: 16,
  },
  journalInput: {
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  journalActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
  },
  journalIconAction: {
      padding: 8,
  },
  postButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
  },
  journalList: {
    marginTop: 8,
  },
  yarnList: {
    gap: 12,
  },
  yarnRow: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  yarnMetaRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  yarnSwatch: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  yarnName: {
    fontSize: 16,
    fontWeight: '700',
  },
  iconButton: {
      padding: 8,
  },
  skeinControl: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      marginTop: 4,
  },
  skeinInput: {
      width: 40,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '700',
      padding: 0, // reset
  },
  addPhotoButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  photoRow: {
    gap: 12,
  },
  photoItem: {
    width: 120,
    marginRight: 12,
  },
  photoContainer: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      position: 'relative',
  },
  photoImage: {
    width: 120,
    height: 120,
  },
  photoDeleteBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: 'rgba(0,0,0,0.5)',
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalYarnList: {
    gap: 8,
  },
  modalYarnOption: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  modalYarnOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalField: {
    gap: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonPrimaryText: {
    color: '#07080c',
    fontWeight: '700',
  },
});
