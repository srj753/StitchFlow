import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { analyzePatternStructure, parsePatternText, PatternLine } from '@/lib/patternParser';
import { StitchHighlighter } from './StitchHighlighter';

type ParsedPatternViewProps = {
  patternText: string;
  completedRowIds?: string[];
  onToggleRow?: (rowId: string) => void;
  showValidation?: boolean;
  showStructure?: boolean;
};

/**
 * Enhanced pattern view with stitch highlighting, structure analysis, and validation
 */
export function ParsedPatternView({
  patternText,
  completedRowIds = [],
  onToggleRow,
  showValidation = true,
  showStructure = true,
}: ParsedPatternViewProps) {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['all']));

  const parsedLines = useMemo(() => parsePatternText(patternText), [patternText]);
  const structure = useMemo(() => analyzePatternStructure(parsedLines), [parsedLines]);

  const toggleSection = (sectionId: string) => {
    const next = new Set(expandedSections);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    setExpandedSections(next);
  };

  if (parsedLines.length === 0) {
    return (
      <EmptyState
        icon={{ name: 'file-text-o', size: 48 }}
        title="No pattern text found"
        description="Paste your pattern text to see the enhanced view with stitch highlighting."
      />
    );
  }

  const renderLine = (line: PatternLine) => {
    const isDone = completedRowIds.includes(line.id);
    const isHeader = line.type === 'header';

    if (isHeader) {
      return (
        <Text key={line.id} style={[styles.sectionHeader, { color: theme.colors.accent }]}>
          {line.text}
        </Text>
      );
    }

    const isInstruction = line.type === 'instruction';
    const hasStitches = line.detectedStitches && line.detectedStitches.length > 0;

    return (
      <TouchableOpacity
        key={line.id}
        onPress={() => onToggleRow?.(line.id)}
        style={[
          styles.lineRow,
          {
            backgroundColor: isDone ? theme.colors.surfaceAlt : theme.colors.surface,
            borderColor: isDone ? 'transparent' : theme.colors.border,
            borderLeftWidth: isInstruction ? 3 : 1,
            borderLeftColor: isInstruction ? theme.colors.accent : theme.colors.border,
          },
        ]}>
        <View style={styles.lineContent}>
          {isInstruction && (
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: isDone ? theme.colors.accent : theme.colors.muted,
                    backgroundColor: isDone ? theme.colors.accent : 'transparent',
                  },
                ]}>
                {isDone && <FontAwesome name="check" size={10} color="#000" />}
              </View>
            </View>
          )}

          <View style={styles.textContainer}>
            {isInstruction && line.rowNumber && (
              <View style={styles.rowNumberBadge}>
                <Text style={[styles.rowNumberText, { color: theme.colors.accent }]}>
                  R{line.rowNumber}
                </Text>
              </View>
            )}

            <StitchHighlighter
              text={line.text}
              style={[
                styles.lineText,
                {
                  color: isDone ? theme.colors.textSecondary : theme.colors.text,
                  textDecorationLine: isDone ? 'line-through' : 'none',
                },
              ]}
            />

            {line.stitchCount && (
              <View style={[styles.stitchCountBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Text style={[styles.stitchCountText, { color: theme.colors.textSecondary }]}>
                  {line.stitchCount} sts
                </Text>
              </View>
            )}

            {hasStitches && (
              <View style={styles.stitchTags}>
                {line.detectedStitches!.slice(0, 3).map((stitch, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.stitchTag,
                      { backgroundColor: `${stitch.type === 'increase' ? '#2ECC71' : stitch.type === 'decrease' ? '#E74C3C' : '#4A90E2'}20` },
                    ]}>
                    <Text
                      style={[
                        styles.stitchTagText,
                        {
                          color:
                            stitch.type === 'increase'
                              ? '#2ECC71'
                              : stitch.type === 'decrease'
                                ? '#E74C3C'
                                : '#4A90E2',
                        },
                      ]}>
                      {stitch.abbreviation}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Structure Summary */}
      {showStructure && structure.sections.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Pattern Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Sections: {structure.sections.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Total Rows: {structure.totalRows || 'N/A'}
            </Text>
          </View>
          {structure.detectedStitches.size > 0 && (
            <View style={styles.stitchesList}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Stitches used:{' '}
                {Array.from(structure.detectedStitches).slice(0, 10).join(', ')}
                {structure.detectedStitches.size > 10 && '...'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Validation Errors */}
      {showValidation && structure.validationErrors.length > 0 && (
        <View style={[styles.errorCard, { backgroundColor: '#E74C3C20', borderColor: '#E74C3C' }]}>
          <View style={styles.errorHeader}>
            <FontAwesome name="exclamation-triangle" size={16} color="#E74C3C" />
            <Text style={[styles.errorTitle, { color: '#E74C3C' }]}>
              {structure.validationErrors.length} Issue{structure.validationErrors.length > 1 ? 's' : ''} Found
            </Text>
          </View>
          {structure.validationErrors.map((error, idx) => (
            <View key={idx} style={styles.errorItem}>
              <Text style={[styles.errorMessage, { color: theme.colors.text }]}>
                Line {error.line + 1}: {error.message}
              </Text>
              {error.suggestion && (
                <Text style={[styles.errorSuggestion, { color: theme.colors.textSecondary }]}>
                  💡 {error.suggestion}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Pattern Sections */}
      {structure.sections.map((section) => {
        const isExpanded = expandedSections.has(section.id) || expandedSections.has('all');
        const sectionLines = parsedLines.filter(
          (line, idx) => idx >= section.startLine && idx <= section.endLine && line.type !== 'header'
        );

        return (
          <View key={section.id} style={styles.section}>
            <TouchableOpacity
              onPress={() => toggleSection(section.id)}
              style={[styles.sectionHeader, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {section.name}
              </Text>
              <FontAwesome
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.sectionContent}>
                {sectionLines.map((line) => renderLine(line))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
  },
  stitchesList: {
    marginTop: 4,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorItem: {
    gap: 4,
  },
  errorMessage: {
    fontSize: 14,
  },
  errorSuggestion: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionContent: {
    gap: 8,
  },
  lineRow: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  lineContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxContainer: {
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  rowNumberBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  rowNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lineText: {
    fontSize: 16,
    lineHeight: 24,
  },
  stitchCountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  stitchCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stitchTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  stitchTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stitchTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
});



