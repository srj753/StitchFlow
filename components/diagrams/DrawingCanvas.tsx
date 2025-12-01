import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/hooks/useTheme';
import { DrawingPath, Point } from '@/types/project';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 32;
const CANVAS_HEIGHT = 400; // Default height, can be made configurable

export type DrawingTool = 'pen' | 'pencil' | 'eraser';

type DrawingCanvasProps = {
  width?: number;
  height?: number;
  paths: DrawingPath[];
  currentTool: DrawingTool;
  currentColor: string;
  strokeWidth: number;
  onPathsChange: (paths: DrawingPath[]) => void;
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
};

export function DrawingCanvas({
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
  paths,
  currentTool,
  currentColor,
  strokeWidth,
  onPathsChange,
  showGrid = false,
  snapToGrid = false,
  gridSize = 20,
}: DrawingCanvasProps) {
  const theme = useTheme();
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const pathIdRef = useRef(0);

  const snapPoint = useCallback(
    (point: Point): Point => {
      // Clamp coordinates to canvas bounds
      let x = Math.max(0, Math.min(width, point.x));
      let y = Math.max(0, Math.min(height, point.y));
      
      if (snapToGrid) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }
      
      return { x, y };
    },
    [snapToGrid, gridSize, width, height],
  );

  const panGesture = Gesture.Pan()
    .minDistance(1) // Minimum distance before gesture activates
    .activeOffsetX(0) // Allow horizontal pan immediately
    .activeOffsetY(0) // Allow vertical pan immediately
    .onStart((event) => {
      try {
        // Coordinates are relative to the gesture detector's view
        const point = snapPoint({ x: event.x, y: event.y });
        const newPath: DrawingPath = {
          id: `path-${Date.now()}-${pathIdRef.current++}`,
          points: [point],
          color: currentTool === 'eraser' ? theme.colors.background : currentColor,
          strokeWidth: currentTool === 'eraser' ? strokeWidth * 2 : strokeWidth,
          tool: currentTool,
        };
        setCurrentPath(newPath);
      } catch (error) {
        console.error('Error in onStart:', error);
      }
    })
    .onUpdate((event) => {
      try {
        if (currentPath) {
          const point = snapPoint({ x: event.x, y: event.y });
          // Limit points to prevent memory issues (sample every few points)
          const shouldAddPoint = currentPath.points.length === 0 || 
            currentPath.points.length % 2 === 0 || // Sample every other point for performance
            Math.abs(currentPath.points[currentPath.points.length - 1].x - point.x) > 2 ||
            Math.abs(currentPath.points[currentPath.points.length - 1].y - point.y) > 2;
          
          if (shouldAddPoint) {
            setCurrentPath({
              ...currentPath,
              points: [...currentPath.points, point],
            });
          }
        }
      } catch (error) {
        console.error('Error in onUpdate:', error);
      }
    })
    .onEnd(() => {
      try {
        if (currentPath && currentPath.points.length > 0) {
          // Ensure we have at least 2 points for a valid path
          if (currentPath.points.length === 1) {
            // Duplicate the point to make a valid line
            currentPath.points.push({ ...currentPath.points[0] });
          }
          onPathsChange([...paths, currentPath]);
          setCurrentPath(null);
        }
      } catch (error) {
        console.error('Error in onEnd:', error);
        // Reset on error to prevent stuck state
        setCurrentPath(null);
      }
    })
    .onFinalize(() => {
      // Cleanup if needed
      if (currentPath) {
        setCurrentPath(null);
      }
    });

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

  const renderGrid = () => {
    if (!showGrid) return null;

    const lines = [];
    for (let x = 0; x <= width; x += gridSize) {
      lines.push(
        <Path
          key={`v-${x}`}
          d={`M ${x} 0 L ${x} ${height}`}
          stroke={theme.colors.border}
          strokeWidth={0.5}
          opacity={0.3}
        />,
      );
    }
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(
        <Path
          key={`h-${y}`}
          d={`M 0 ${y} L ${width} ${y}`}
          stroke={theme.colors.border}
          strokeWidth={0.5}
          opacity={0.3}
        />,
      );
    }
    return lines;
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <GestureDetector gesture={panGesture}>
        <View 
          style={styles.canvasContainer}
          collapsable={false}
        >
          <Svg width={width} height={height} style={styles.svg}>
            {/* Grid overlay */}
            {renderGrid()}

            {/* Existing paths */}
            {paths.map((path) => (
              <Path
                key={path.id}
                d={pathToSvgPath(path)}
                stroke={path.color}
                strokeWidth={path.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={path.tool === 'eraser' ? 0 : 1}
              />
            ))}

            {/* Current path being drawn */}
            {currentPath && (
              <Path
                d={pathToSvgPath(currentPath)}
                stroke={currentPath.color}
                strokeWidth={currentPath.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={currentPath.tool === 'eraser' ? 0 : 1}
              />
            )}
          </Svg>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  canvasContainer: {
    flex: 1,
  },
  svg: {
    flex: 1,
  },
});

