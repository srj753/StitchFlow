import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DrawingCanvas, DrawingTool } from '@/components/diagrams/DrawingCanvas';
import { DrawingTools } from '@/components/diagrams/DrawingTools';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Diagram, DrawingPath, Project } from '@/types/project';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_CANVAS_WIDTH = SCREEN_WIDTH - 32;
const DEFAULT_CANVAS_HEIGHT = 500;

type DiagramsViewProps = {
  project: Project;
};

export function DiagramsView({ project }: DiagramsViewProps) {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  const updateProject = useProjectsStore((state) => state.updateProject);
  
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(
    project.diagrams && project.diagrams.length > 0 ? project.diagrams[0].id : null,
  );
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [history, setHistory] = useState<DrawingPath[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const currentDiagram = project.diagrams?.find((d) => d.id === currentDiagramId);
  const currentPaths = currentDiagram?.paths || [];

  const generateId = () => `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createNewDiagram = () => {
    const newDiagram: Diagram = {
      id: generateId(),
      projectId: project.id,
      name: `Diagram ${(project.diagrams?.length || 0) + 1}`,
      paths: [],
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedDiagrams = [...(project.diagrams || []), newDiagram];
    updateProject(project.id, { diagrams: updatedDiagrams });
    setCurrentDiagramId(newDiagram.id);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const handlePathsChange = (newPaths: DrawingPath[]) => {
    if (!currentDiagram) return;

    // Save to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...currentPaths]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Update diagram
    const updatedDiagrams = (project.diagrams || []).map((d) =>
      d.id === currentDiagram.id
        ? {
            ...d,
            paths: newPaths,
            updatedAt: new Date().toISOString(),
          }
        : d,
    );
    updateProject(project.id, { diagrams: updatedDiagrams });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousPaths = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      if (currentDiagram) {
        const updatedDiagrams = (project.diagrams || []).map((d) =>
          d.id === currentDiagram.id
            ? {
                ...d,
                paths: previousPaths,
                updatedAt: new Date().toISOString(),
              }
            : d,
        );
        updateProject(project.id, { diagrams: updatedDiagrams });
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextPaths = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      if (currentDiagram) {
        const updatedDiagrams = (project.diagrams || []).map((d) =>
          d.id === currentDiagram.id
            ? {
                ...d,
                paths: nextPaths,
                updatedAt: new Date().toISOString(),
              }
            : d,
        );
        updateProject(project.id, { diagrams: updatedDiagrams });
      }
    }
  };

  const handleDeleteDiagram = () => {
    if (!currentDiagram) return;

    Alert.alert(
      'Delete Diagram',
      `Are you sure you want to delete "${currentDiagram.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedDiagrams = (project.diagrams || []).filter((d) => d.id !== currentDiagram.id);
            updateProject(project.id, { diagrams: updatedDiagrams });
            
            if (updatedDiagrams.length > 0) {
              setCurrentDiagramId(updatedDiagrams[0].id);
            } else {
              setCurrentDiagramId(null);
            }
            setHistory([]);
            setHistoryIndex(-1);
            showSuccess('Diagram deleted');
          },
        },
      ],
    );
  };

  const handleExport = async () => {
    if (!currentDiagram) return;

    try {
      // Export as SVG
      const svgContent = generateSVG(currentDiagram);
      const fileName = `${currentDiagram.name.replace(/\s+/g, '_')}.svg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, svgContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        showSuccess('Diagram exported');
      } else {
        showError('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to export diagram');
    }
  };

  const generateSVG = (diagram: Diagram): string => {
    const pathToSvgPath = (path: DrawingPath): string => {
      if (path.points.length === 0) return '';
      if (path.points.length === 1) {
        const p = path.points[0];
        return `M ${p.x} ${p.y} L ${p.x} ${p.y}`;
      }
      let svgPath = `M ${path.points[0].x} ${path.points[0].y}`;
      for (let i = 1; i < path.points.length; i++) {
        const p = path.points[i];
        svgPath += ` L ${p.x} ${p.y}`;
      }
      return svgPath;
    };

    const paths = diagram.paths
      .map((path) => {
        if (path.tool === 'eraser') return '';
        return `<path d="${pathToSvgPath(path)}" stroke="${path.color}" stroke-width="${path.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none" />`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${diagram.width}" height="${diagram.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  ${paths}
</svg>`;
  };

  if (!currentDiagram) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.emptyContainer}>
          <FontAwesome name="pencil" size={48} color={theme.colors.muted} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Create your first diagram to start drawing.
          </Text>
          <TouchableOpacity
            onPress={createNewDiagram}
            style={[styles.createButton, { backgroundColor: theme.colors.accent }]}>
            <FontAwesome name="plus" size={16} color="#000" />
            <Text style={styles.createButtonText}>Create Diagram</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
      {/* Diagram Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.diagramName, { color: theme.colors.text }]}>
            {currentDiagram.name}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleExport} style={styles.actionButton}>
            <FontAwesome name="share" size={18} color={theme.colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteDiagram} style={styles.actionButton}>
            <FontAwesome name="trash" size={18} color={theme.colors.error || '#ff4444'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawing Tools */}
      <View style={styles.toolsContainer}>
        <DrawingTools
          currentTool={currentTool}
          currentColor={currentColor}
          strokeWidth={strokeWidth}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          onToolChange={setCurrentTool}
          onColorChange={setCurrentColor}
          onStrokeWidthChange={setStrokeWidth}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onToggleSnap={() => setSnapToGrid(!snapToGrid)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
      </View>

      {/* Drawing Canvas */}
      <View style={styles.canvasWrapper} collapsable={false}>
        <DrawingCanvas
          width={DEFAULT_CANVAS_WIDTH}
          height={DEFAULT_CANVAS_HEIGHT}
          paths={currentPaths}
          currentTool={currentTool}
          currentColor={currentColor}
          strokeWidth={strokeWidth}
          onPathsChange={handlePathsChange}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          gridSize={20}
        />
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 400,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  diagramName: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  toolsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  canvasWrapper: {
    padding: 16,
    alignItems: 'center',
    minHeight: DEFAULT_CANVAS_HEIGHT + 32, // Ensure enough space
  },
});

