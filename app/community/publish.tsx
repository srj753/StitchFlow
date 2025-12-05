import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useCommunityStore } from '@/store/useCommunityStore';
import { useProjectsStore } from '@/store/useProjectsStore';

export default function PublishProjectScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess } = useToast();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const projects = useProjectsStore((state) => state.projects);

  // Community store
  const addPost = useCommunityStore((state) => state.addPost);
  const currentUserId = useCommunityStore((state) => state.currentUserId);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId || null);

  useEffect(() => {
    if (projectId) setSelectedProjectId(projectId);
  }, [projectId]);

  const project = projects.find((p) => p.id === selectedProjectId);
  const completedProjects = projects.filter((p) => p.status === 'finished');

  const [caption, setCaption] = useState('');
  const [includePattern, setIncludePattern] = useState(false);
  const [includeJournal, setIncludeJournal] = useState(true);
  const [includeStudio, setIncludeStudio] = useState(true);
  const [sellPattern, setSellPattern] = useState(false);
  const [price, setPrice] = useState('');

  const handlePublish = () => {
    if (!project) return;

    // Create post with project data
    const newPost = addPost({
      userId: currentUserId,
      projectId: project.id,
      projectName: project.name,
      patternName: project.patternName,
      caption: caption || `Just finished my ${project.name}! 🎉`,
      images: project.photos.length > 0 ? project.photos : (project.thumbnail ? [project.thumbnail] : []),
      includeJournal,
      includeStudio,
      includePattern,
      journalEntries: includeJournal ? project.journal : undefined,
      studioData: includeStudio ? { colorPalette: project.colorPalette } : undefined,
    });

    showSuccess('Project published to community!');
    router.dismissTo('/community');
  };

  // 1. No project selected yet -> Show list of completed projects
  if (!project) {
    return (
      <Screen>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Select Project</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Choose a finished project to share with the community.
          </Text>

          {completedProjects.length === 0 ? (
            <EmptyState
              icon={{ name: 'trophy', size: 48 }}
              title="No finished projects"
              description="Mark a project as 'Finished' in the tracking tab to share it with the community."
              actionLabel="Go to Projects"
              onAction={() => router.push('/projects')}
            />
          ) : (
            completedProjects.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedProjectId(p.id)}
                style={[styles.projectSelectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <View style={[styles.selectionThumbnail, { backgroundColor: theme.colors.surfaceAlt }]}>
                  {p.thumbnail ? (
                    <Image source={{ uri: p.thumbnail }} style={styles.thumbnail} />
                  ) : (
                    <FontAwesome name="image" size={24} color={theme.colors.muted} />
                  )}
                </View>
                <View style={styles.selectionInfo}>
                  <Text style={[styles.selectionTitle, { color: theme.colors.text }]}>{p.name}</Text>
                  <Text style={{ color: theme.colors.textSecondary }}>{p.patternName || 'Custom Project'}</Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color={theme.colors.muted} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Screen>
    );
  }

  // 2. Project selected -> Review & Share UI
  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => projectId ? router.back() : setSelectedProjectId(null)} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Review & Share</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Preview Header */}
        <View style={styles.previewHeader}>
          <View style={[styles.thumbnailContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
            {project.thumbnail ? (
              <Image source={{ uri: project.thumbnail }} style={styles.thumbnail} />
            ) : (
              <FontAwesome name="image" size={32} color={theme.colors.muted} />
            )}
          </View>
          <View style={styles.previewMeta}>
            <Text style={[styles.projectName, { color: theme.colors.text }]}>{project.name}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>
              {project.patternName || 'Custom Pattern'}
            </Text>
            <Text style={{ color: theme.colors.accent, marginTop: 4 }}>
              {project.photos.length} photos · {project.journal.length} journal entries
            </Text>
          </View>
        </View>

        {/* Caption Input */}
        <Card title="Caption" style={styles.card}>
          <TextInput
            style={[styles.textArea, { color: theme.colors.text, backgroundColor: theme.colors.surfaceAlt }]}
            placeholder="Share your story, yarn choices, or tips..."
            placeholderTextColor={theme.colors.muted}
            multiline
            numberOfLines={4}
            value={caption}
            onChangeText={setCaption}
          />
        </Card>

        {/* What's Included Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          Included in Post
        </Text>

        {/* Photos (Always Included) */}
        <View style={[styles.includeRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
          <View style={styles.includeInfo}>
            <FontAwesome name="image" size={16} color={theme.colors.text} style={styles.includeIcon} />
            <Text style={[styles.includeLabel, { color: theme.colors.text }]}>Project Photos ({project.photos.length})</Text>
          </View>
          <FontAwesome name="check-circle" size={20} color={theme.colors.accent} />
        </View>

        {/* Notes (Always Included) */}
        <View style={[styles.includeRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
          <View style={styles.includeInfo}>
            <FontAwesome name="sticky-note" size={16} color={theme.colors.text} style={styles.includeIcon} />
            <Text style={[styles.includeLabel, { color: theme.colors.text }]}>Project Notes</Text>
          </View>
          <FontAwesome name="check-circle" size={20} color={theme.colors.accent} />
        </View>

        {/* Toggles */}
        <View style={[styles.toggleRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
          <View style={styles.includeInfo}>
            <FontAwesome name="book" size={16} color={theme.colors.text} style={styles.includeIcon} />
            <View>
              <Text style={[styles.includeLabel, { color: theme.colors.text }]}>Journal Entries</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Milestones & dates</Text>
            </View>
          </View>
          <Switch
            value={includeJournal}
            onValueChange={setIncludeJournal}
            trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.accent }}
          />
        </View>

        <View style={[styles.toggleRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
          <View style={styles.includeInfo}>
            <FontAwesome name="paint-brush" size={16} color={theme.colors.text} style={styles.includeIcon} />
            <View>
              <Text style={[styles.includeLabel, { color: theme.colors.text }]}>Studio Data</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Moodboard & palette</Text>
            </View>
          </View>
          <Switch
            value={includeStudio}
            onValueChange={setIncludeStudio}
            trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.accent }}
          />
        </View>

        {project.patternName && (
          <View style={[styles.toggleRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
            <View style={styles.includeInfo}>
              <FontAwesome name="link" size={16} color={theme.colors.text} style={styles.includeIcon} />
              <View>
                <Text style={[styles.includeLabel, { color: theme.colors.text }]}>Link Pattern Source</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Help others find the pattern you used</Text>
              </View>
            </View>
            <Switch
              value={includePattern}
              onValueChange={setIncludePattern}
              trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.accent }}
            />
          </View>
        )}

        {/* Sell Pattern Option (Stub) */}
        <View style={[styles.toggleRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
          <View style={styles.includeInfo}>
            <FontAwesome name="shopping-bag" size={16} color={theme.colors.text} style={styles.includeIcon} />
            <View>
              <Text style={[styles.includeLabel, { color: theme.colors.text }]}>Sell Your Pattern?</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>List your original design on the store</Text>
            </View>
          </View>
          <Switch
            value={sellPattern}
            onValueChange={setSellPattern}
            trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.accent }}
          />
        </View>

        {sellPattern && (
          <Card title="Price" style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, color: theme.colors.text, marginRight: 8 }}>$</Text>
              <TextInput
                style={[styles.priceInput, { color: theme.colors.text, backgroundColor: theme.colors.surfaceAlt }]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.muted}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </Card>
        )}

        <TouchableOpacity
          onPress={handlePublish}
          style={[styles.publishButton, { backgroundColor: theme.colors.accent }]}
        >
          <Text style={styles.publishButtonText}>Share to Community</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    paddingBottom: 40,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  projectSelectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  selectionThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  previewMeta: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  card: {
    marginBottom: 8,
  },
  textArea: {
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  priceInput: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  includeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    opacity: 0.8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  includeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  includeIcon: {
    width: 24,
    marginRight: 12,
    textAlign: 'center',
  },
  includeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  publishButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
