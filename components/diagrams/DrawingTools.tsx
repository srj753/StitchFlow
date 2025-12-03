import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { DrawingTool } from './DrawingCanvas';

type DrawingToolsProps = {
  currentTool: DrawingTool;
  currentColor: string;
  strokeWidth: number;
  showGrid: boolean;
  snapToGrid: boolean;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

const TOOLS: Array<{ id: DrawingTool; icon: string; label: string }> = [
  { id: 'pen', icon: 'pencil', label: 'Pen' },
  { id: 'pencil', icon: 'edit', label: 'Pencil' },
  { id: 'eraser', icon: 'eraser', label: 'Eraser' },
];

const QUICK_COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#0000FF', // Blue
  '#00FF00', // Green
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
];

const STROKE_WIDTHS = [2, 4, 6, 8, 12, 16];

export function DrawingTools({
  currentTool,
  currentColor,
  strokeWidth,
  showGrid,
  snapToGrid,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onToggleGrid,
  onToggleSnap,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: DrawingToolsProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Tool Selection */}
      <View style={styles.toolRow}>
        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            onPress={() => onToolChange(tool.id)}
            style={[
              styles.toolButton,
              {
                backgroundColor: currentTool === tool.id ? theme.colors.accent : theme.colors.surfaceAlt,
                borderColor: currentTool === tool.id ? theme.colors.accent : theme.colors.border,
              },
            ]}>
            <FontAwesome
              name={tool.icon as any}
              size={18}
              color={currentTool === tool.id ? '#000' : theme.colors.text}
            />
            <Text
              style={[
                styles.toolLabel,
                {
                  color: currentTool === tool.id ? '#000' : theme.colors.text,
                  fontWeight: currentTool === tool.id ? '600' : '400',
                },
              ]}>
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Picker */}
      <View style={styles.colorRow}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Color:</Text>
        <View style={styles.colorSwatches}>
          {QUICK_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => onColorChange(color)}
              style={[
                styles.colorSwatch,
                {
                  backgroundColor: color,
                  borderColor: currentColor === color ? theme.colors.accent : theme.colors.border,
                  borderWidth: currentColor === color ? 3 : 1,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Stroke Width */}
      <View style={styles.strokeRow}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Width:</Text>
        <View style={styles.strokeWidths}>
          {STROKE_WIDTHS.map((width) => (
            <TouchableOpacity
              key={width}
              onPress={() => onStrokeWidthChange(width)}
              style={[
                styles.strokeButton,
                {
                  backgroundColor: strokeWidth === width ? theme.colors.accent : theme.colors.surfaceAlt,
                  borderColor: strokeWidth === width ? theme.colors.accent : theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.strokeIndicator,
                  {
                    width: width,
                    height: width,
                    backgroundColor: strokeWidth === width ? '#000' : theme.colors.text,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Grid Controls */}
      <View style={styles.gridRow}>
        <TouchableOpacity
          onPress={onToggleGrid}
          style={[
            styles.gridButton,
            {
              backgroundColor: showGrid ? theme.colors.accent : theme.colors.surfaceAlt,
              borderColor: showGrid ? theme.colors.accent : theme.colors.border,
            },
          ]}>
          <FontAwesome
            name="th"
            size={16}
            color={showGrid ? '#000' : theme.colors.text}
          />
          <Text
            style={[
              styles.gridLabel,
              {
                color: showGrid ? '#000' : theme.colors.text,
                fontWeight: showGrid ? '600' : '400',
              },
            ]}>
            Grid
          </Text>
        </TouchableOpacity>

        {showGrid && (
          <TouchableOpacity
            onPress={onToggleSnap}
            style={[
              styles.gridButton,
              {
                backgroundColor: snapToGrid ? theme.colors.accent : theme.colors.surfaceAlt,
                borderColor: snapToGrid ? theme.colors.accent : theme.colors.border,
              },
            ]}>
            <FontAwesome
              name="magnet"
              size={16}
              color={snapToGrid ? '#000' : theme.colors.text}
            />
            <Text
              style={[
                styles.gridLabel,
                {
                  color: snapToGrid ? '#000' : theme.colors.text,
                  fontWeight: snapToGrid ? '600' : '400',
                },
              ]}>
              Snap
          </Text>
          </TouchableOpacity>
        )}

        {/* Undo/Redo */}
        {onUndo && (
          <TouchableOpacity
            onPress={onUndo}
            disabled={!canUndo}
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.surfaceAlt,
                opacity: canUndo ? 1 : 0.5,
              },
            ]}>
            <FontAwesome name="undo" size={16} color={theme.colors.text} />
          </TouchableOpacity>
        )}

        {onRedo && (
          <TouchableOpacity
            onPress={onRedo}
            disabled={!canRedo}
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.surfaceAlt,
                opacity: canRedo ? 1 : 0.5,
              },
            ]}>
            <FontAwesome name="repeat" size={16} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toolButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  toolLabel: {
    fontSize: 12,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  strokeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  strokeWidths: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  strokeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strokeIndicator: {
    borderRadius: 999,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  gridButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  gridLabel: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});







