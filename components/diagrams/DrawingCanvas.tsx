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
      if (!snapToGrid) return point;
      return {
        x: Math.round(point.x / gridSize) * gridSize,
        y: Math.round(point.y / gridSize) * gridSize,
      };
    },
    [snapToGrid, gridSize],
  );

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      const point = snapPoint({ x: event.x, y: event.y });
      const newPath: DrawingPath = {
        id: `path-${Date.now()}-${pathIdRef.current++}`,
        points: [point],
        color: currentTool === 'eraser' ? theme.colors.background : currentColor,
        strokeWidth: currentTool === 'eraser' ? strokeWidth * 2 : strokeWidth,
        tool: currentTool,
      };
      setCurrentPath(newPath);
    })
    .onUpdate((event) => {
      if (currentPath) {
        const point = snapPoint({ x: event.x, y: event.y });
        setCurrentPath({
          ...currentPath,
          points: [...currentPath.points, point],
        });
      }
    })
    .onEnd(() => {
      if (currentPath && currentPath.points.length > 0) {
        onPathsChange([...paths, currentPath]);
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
        <View style={styles.canvasContainer}>
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

