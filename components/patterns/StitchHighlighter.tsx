import { Text, TextStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { detectStitches, getStitchColor } from '@/lib/stitchDetector';

type StitchHighlighterProps = {
  text: string;
  style?: TextStyle;
  highlightColor?: string;
};

/**
 * Component that highlights crochet stitch abbreviations in text
 */
export function StitchHighlighter({ 
  text, 
  style,
  highlightColor,
}: StitchHighlighterProps) {
  const theme = useTheme();
  const stitches = detectStitches(text);

  if (stitches.length === 0) {
    return <Text style={style}>{text}</Text>;
  }

  // Sort matches by position and remove overlaps
  const sortedMatches = stitches.sort((a, b) => a.startIndex - b.startIndex);
  const nonOverlapping: typeof sortedMatches = [];
  
  sortedMatches.forEach((match) => {
    const overlaps = nonOverlapping.some(
      (existing) =>
        (match.startIndex >= existing.startIndex && match.startIndex < existing.endIndex) ||
        (match.endIndex > existing.startIndex && match.endIndex <= existing.endIndex) ||
        (match.startIndex <= existing.startIndex && match.endIndex >= existing.endIndex)
    );
    
    if (!overlaps) {
      nonOverlapping.push(match);
    }
  });

  // Build text segments with highlights
  const segments: Array<{ text: string; isStitch: boolean; color?: string }> = [];
  let lastIndex = 0;

  nonOverlapping.forEach((match) => {
    // Add text before match
    if (match.startIndex > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.startIndex),
        isStitch: false,
      });
    }

    // Add highlighted stitch
    segments.push({
      text: text.substring(match.startIndex, match.endIndex),
      isStitch: true,
      color: highlightColor || match.stitch.color,
    });

    lastIndex = match.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isStitch: false,
    });
  }

  return (
    <Text style={style}>
      {segments.map((segment, index) => (
        <Text
          key={index}
          style={
            segment.isStitch
              ? {
                  color: segment.color,
                  fontWeight: '600',
                  backgroundColor: `${segment.color}20`,
                  paddingHorizontal: 2,
                  borderRadius: 3,
                }
              : undefined
          }>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}



