import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Card } from '@/components/Card';
import { Counter } from '@/components/counters/Counter';
import { JournalEntry } from '@/components/journal/JournalEntry';
import { PhotoLightbox } from '@/components/photos/PhotoLightbox';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useKeepScreenAwake } from '@/hooks/useKeepScreenAwake';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useVoiceCommandStub } from '@/hooks/useVoiceCommandStub';
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

  const updateCounter = useProjectsStore((state) => state.updateCounter);
  const updateCounterLabel = useProjectsStore((state) => state.updateCounterLabel);
  const addCounter = useProjectsStore((state) => state.addCounter);
  const deleteCounter = useProjectsStore((state) => state.deleteCounter);
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
  const [patternNotesDraft, setPatternNotesDraft] = useState('');
  const [progressNotesDraft, setProgressNotesDraft] = useState('');
  const voiceStub = useVoiceCommandStub();

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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card
          title="Status"
          subtitle={project.status === 'active' ? 'In progress' : project.status === 'paused' ? 'Paused' : 'Finished'}
          style={styles.section}>
          <View style={styles.metricRow}>
            <Metric 
              label={rowCounter?.label ?? 'Rows'} 
              value={`${rowCounter?.currentValue ?? 0}${rowCounter?.targetValue ? ` / ${rowCounter.targetValue}` : ''}`} 
            />
            <Metric
              label="Height"
              value={`${project.currentHeightInches.toFixed(1)}${project.targetHeightInches ? ` / ${project.targetHeightInches}` : ''} in`}
            />
          </View>
          
          {/* Status Controls */}
          <View style={styles.statusControls}>
            <TouchableOpacity
              onPress={() => {
                const newStatus = project.status === 'active' ? 'paused' : 'active';
                updateProjectStatus(project.id, newStatus);
                showSuccess(`Project ${newStatus === 'paused' ? 'paused' : 'resumed'}`);
              }}
              style={[
                styles.statusButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: project.status === 'paused' ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                },
              ]}>
              <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                {project.status === 'paused' ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                updateProjectStatus(project.id, 'finished');
                showSuccess('Project marked as finished!');
              }}
              disabled={project.status === 'finished'}
              style={[
                styles.statusButton,
                {
                  borderColor: project.status === 'finished' ? theme.colors.border : theme.colors.accent,
                  backgroundColor: project.status === 'finished' ? theme.colors.surfaceAlt : theme.colors.accentMuted,
                  opacity: project.status === 'finished' ? 0.5 : 1,
                },
              ]}>
              <Text style={{ 
                color: project.status === 'finished' ? theme.colors.textSecondary : theme.colors.accent, 
                fontWeight: '600' 
              }}>
                {project.status === 'finished' ? 'Finished' : 'Mark Finished'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {project.status === 'finished' && (
            <TouchableOpacity
                onPress={handlePublish}
                style={[
                    styles.publishButton,
                    {
                        backgroundColor: theme.colors.accent,
                    },
                ]}
            >
                <Text style={styles.publishButtonText}>Share to Community</Text>
            </TouchableOpacity>
          )}

          {completion !== undefined ? (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.accent,
                    width: `${completion}%`,
                  },
                ]}
              />
            </View>
          ) : null}
        </Card>

        {/* Counters Section */}
        <View style={styles.section}>
          {project.counters.map((counter) => (
            <Counter
              key={counter.id}
              counter={counter}
              onIncrement={(delta) => {
                const newValue = counter.currentValue + delta;
                updateCounter(project.id, counter.id, newValue);
              }}
              onSetValue={(value) => updateCounter(project.id, counter.id, value)}
              onRename={(label) => {
                updateCounterLabel(project.id, counter.id, label);
                showSuccess('Counter renamed');
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
          ))}

          <TouchableOpacity
            onPress={() => Alert.alert('Voice control', voiceStub.message)}
            style={[
              styles.voiceStub,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceAlt,
              },
            ]}>
            <Text style={{ color: theme.colors.textSecondary }}>
              🎙 Voice control (coming soon)
            </Text>
          </TouchableOpacity>

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
            <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>
              + Add counter
            </Text>
          </TouchableOpacity>
        </View>

        <Card title="Notes" subtitle="Split permanent changes vs. progress logs" style={styles.section}>
          <View style={styles.notesTabs}>
            {['pattern', 'progress'].map((tab) => {
              const selected = activeNotesTab === tab;
              const label = tab === 'pattern' ? 'Pattern changes' : 'Progress notes';
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveNotesTab(tab as 'pattern' | 'progress')}
                  style={[
                    styles.notesTab,
                    {
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                      backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                    },
                  ]}>
                  <Text
                    style={{
                      color: selected ? theme.colors.accent : theme.colors.textSecondary,
                      fontWeight: '600',
                    }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {activeNotesTab === 'pattern' ? (
            <TextInput
              multiline
              numberOfLines={6}
              value={patternNotesDraft}
              onChangeText={setPatternNotesDraft}
              onBlur={handleSavePatternNotes}
              placeholder="Document stitch substitutions, sizing tweaks, etc."
              placeholderTextColor={theme.colors.muted}
              style={[
                styles.textArea,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
            />
          ) : (
            <TextInput
              multiline
              numberOfLines={6}
              value={progressNotesDraft}
              onChangeText={setProgressNotesDraft}
              onBlur={handleSaveProgressNotes}
              placeholder="Row checkpoints, reminders, repeat counts..."
              placeholderTextColor={theme.colors.muted}
              style={[
                styles.textArea,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
            />
          )}
        </Card>

        <Card title="Yarn & stash" subtitle="Reserve skeins" style={styles.section}>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>
            Reserved {totalReserved.toFixed(1)} skeins · {totalAvailable.toFixed(1)} skeins available in stash
          </Text>

          {project.linkedYarns.length === 0 ? (
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>
              No yarn linked yet. Connect stash items so counters and estimates stay in sync.
            </Text>
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
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceAlt,
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
                          {(yarn?.brand ?? 'Unknown brand') + ' · ' + (yarn?.color ?? 'Color n/a')}
                        </Text>
                        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                          Reserved {link.skeinsUsed} of {yarn?.skeinsOwned ?? '?'} skeins
                        </Text>
                      </View>
                    </View>
                    <View style={styles.yarnControls}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.muted, fontSize: 12, marginBottom: 4 }}>
                          Adjust skeins
                        </Text>
                        <TextInput
                          value={String(link.skeinsUsed)}
                          onChangeText={(text) => handleLinkedAmountChange(link.id, text)}
                          keyboardType="numeric"
                          style={[
                            styles.yarnAmountInput,
                            {
                              borderColor: theme.colors.border,
                              backgroundColor: theme.colors.surface,
                              color: theme.colors.text,
                            },
                          ]}
                        />
                        <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 4 }}>
                          {available.toFixed(1)} skeins available
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveLink(link.id)} style={styles.removeYarnButton}>
                        <Text style={{ color: theme.colors.textSecondary }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            onPress={handleOpenYarnModal}
            disabled={stashEmpty || !canLinkYarn}
            style={[
              styles.linkYarnButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceAlt,
                opacity: stashEmpty || !canLinkYarn ? 0.5 : 1,
              },
            ]}>
            <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>
              {stashEmpty
                ? 'Add yarn to stash first'
                : canLinkYarn
                  ? 'Link yarn from stash'
                  : 'All stash yarns linked'}
            </Text>
          </TouchableOpacity>
        </Card>

        <Card title="Photos" subtitle="Document progress" style={styles.section}>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              onPress={handleAddPhoto}
              disabled={isLoadingPhoto}
              style={[
                styles.addPhotoButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceAlt,
                  opacity: isLoadingPhoto ? 0.6 : 1,
                },
              ]}>
              <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>+ Add photo</Text>
            </TouchableOpacity>
            {isLoadingPhoto && <LoadingSpinner overlay />}
          </View>
          {project.photos.length === 0 ? (
            <Text style={{ color: theme.colors.textSecondary }}>
              No photos yet. Snap your yarn palette or project milestones.
            </Text>
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
                    }}>
                    <Image source={{ uri }} style={styles.photoImage} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(uri)}
                    style={[
                      styles.removePhotoButton,
                      { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
                    ]}>
                    <Text style={{ color: theme.colors.textSecondary }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </Card>

        {/* Journal/Timeline Section */}
        <Card title="Project journal" subtitle="Track progress & milestones" style={styles.section}>
          <View style={styles.addJournalForm}>
            <TextInput
              value={journalText}
              onChangeText={setJournalText}
              placeholder="Add a note or milestone..."
              placeholderTextColor={theme.colors.muted}
              multiline
              style={[
                styles.journalInput,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                },
              ]}
            />
            <View style={styles.journalButtons}>
              <TouchableOpacity
                onPress={() => {
                  if (journalText.trim()) {
                    addJournalEntry(project.id, {
                      type: 'note',
                      text: journalText.trim(),
                    });
                    setJournalText('');
                    showSuccess('Note added to journal');
                  }
                }}
                style={[
                  styles.journalButton,
                  {
                    backgroundColor: theme.colors.accent,
                  },
                ]}>
                <Text style={styles.journalButtonText}>Add note</Text>
              </TouchableOpacity>
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
                style={[
                  styles.journalButton,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceAlt,
                  },
                ]}>
                <Text style={{ color: theme.colors.text }}>Milestone</Text>
              </TouchableOpacity>
            </View>
          </View>

          {project.journal.length === 0 ? (
            <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>
              No journal entries yet. Add notes or milestones as you work!
            </Text>
          ) : (
            <View style={styles.journalList}>
              {project.journal.map((entry) => (
                <JournalEntry
                  key={entry.id}
                  entry={entry}
                  onDelete={() => {
                    deleteJournalEntry(project.id, entry.id);
                    showSuccess('Journal entry removed');
                  }}
                />
              ))}
            </View>
          )}
        </Card>
      </ScrollView>

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
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  statusControls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statusButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  publishButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  publishButtonText: {
      color: '#07080c',
      fontWeight: '700',
  },
  metric: {
    flex: 1,
    marginRight: 16,
  },
  progressTrack: {
    marginTop: 18,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#1b2032',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  notesTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  notesTab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addCounterButton: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  voiceStub: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  addJournalForm: {
    marginBottom: 16,
  },
  journalInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  journalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  journalButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  journalButtonText: {
    color: '#07080c',
    fontWeight: '700',
  },
  journalList: {
    marginTop: 16,
  },
  yarnList: {
    gap: 12,
    marginBottom: 12,
  },
  yarnRow: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  yarnMetaRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  yarnSwatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  yarnName: {
    fontSize: 16,
    fontWeight: '600',
  },
  yarnControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  yarnAmountInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  removeYarnButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  linkYarnButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
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
    width: 140,
    marginRight: 12,
  },
  photoImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    marginBottom: 8,
  },
  removePhotoButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
