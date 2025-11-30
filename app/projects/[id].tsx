import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AssistantView } from '@/components/projects/AssistantView';
import { PatternView } from '@/components/projects/PatternView';
import { ProjectTab, ProjectTabs } from '@/components/projects/ProjectTabs';
import { StudioView } from '@/components/projects/StudioView';
import { TrackView } from '@/components/projects/TrackView';
import { useTheme } from '@/hooks/useTheme';
import { useProjectsStore } from '@/store/useProjectsStore';

export default function ProjectDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projects = useProjectsStore((state) => state.projects);
  
  const [activeTab, setActiveTab] = useState<ProjectTab>('track');

  const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);

  if (!project) {
    return (
      <Screen>
        <Card title="Project missing">
          <Text style={{ color: theme.colors.textSecondary }}>
            We couldn’t find this project. Head back to projects to add a new one.
          </Text>
        </Card>
      </Screen>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'track':
        return <TrackView project={project} />;
      case 'pattern':
        return <PatternView project={project} />;
      case 'studio':
        return <StudioView project={project} />;
      case 'ai':
        return <AssistantView project={project} />;
      default:
        return null;
    }
  };

  return (
    <Screen>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {project.patternName || 'Custom Project'}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="ellipsis-v" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
});
