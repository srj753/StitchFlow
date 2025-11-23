import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import {
  HSV,
  clamp,
  ensureContrastingText,
  hexToHsv,
  hsvToHex,
  normalizeHex,
} from '@/lib/color';

const HUE_GRADIENT = [
  '#ff0000',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#0000ff',
  '#ff00ff',
  '#ff0000',
 ] as const;

const QUICK_SWATCHES = [
  '#F68AAF',
  '#FFC8DD',
  '#F5A3C7',
  '#6EC4CF',
  '#AEC9FF',
  '#6F78FF',
  '#4E7C59',
  '#A3B18A',
  '#FFE5D9',
  '#F7B267',
  '#F4845F',
  '#F25C54',
  '#F5F5F0',
  '#1F2933',
  '#EED9C4',
  '#D1C4E9',
  '#9B5DE5',
  '#F15BB5',
];

const CURSOR_SIZE = 22;
const HUE_THUMB = 18;

type ColorPickerModalProps = {
  visible: boolean;
  initialColor?: string;
  onClose: () => void;
  onSelect: (color: string) => void;
};

export function ColorPickerModal({
  visible,
  initialColor = QUICK_SWATCHES[0],
  onClose,
  onSelect,
}: ColorPickerModalProps) {
  const theme = useTheme();
  const [mode, setMode] = useState<'picker' | 'swatches'>('picker');
  const [svLayout, setSvLayout] = useState<{ width: number; height: number }>();
  const [hueWidth, setHueWidth] = useState(0);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(initialColor));

  useEffect(() => {
    if (!visible) return;
    setHsv(hexToHsv(initialColor));
  }, [initialColor, visible]);

  const colorHex = useMemo(() => hsvToHex(hsv), [hsv]);
  const hueColor = useMemo(() => hsvToHex({ h: hsv.h, s: 1, v: 1 }), [hsv.h]);

  const handleSvChange = (x: number, y: number) => {
    if (!svLayout) return;
    const nextS = clamp(x / svLayout.width);
    const nextV = clamp(1 - y / svLayout.height);
    setHsv((current) => ({
      ...current,
      s: nextS,
      v: nextV,
    }));
  };

  const handleHueChange = (x: number) => {
    if (hueWidth <= 0) return;
    const nextHue = clamp(x / hueWidth) * 360;
    setHsv((current) => ({
      ...current,
      h: Math.max(0, Math.min(359.9, nextHue)),
    }));
  };

  const handleHexInput = (value: string) => {
    const normalized = normalizeHex(value, colorHex);
    setHsv(hexToHsv(normalized));
  };

  const handleApply = () => {
    onSelect(colorHex);
    onClose();
  };

  const svCursorPosition = {
    left: svLayout ? hsv.s * svLayout.width - CURSOR_SIZE / 2 : 0,
    top: svLayout ? (1 - hsv.v) * svLayout.height - CURSOR_SIZE / 2 : 0,
  };

  const hueThumbPosition = hueWidth > 0 ? (hsv.h / 360) * hueWidth - HUE_THUMB / 2 : 0;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.card,
            },
          ]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Pick a color</Text>
            <View style={styles.modeRow}>
              {['picker', 'swatches'].map((value) => {
                const selected = mode === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setMode(value as 'picker' | 'swatches')}
                    style={[
                      styles.modeChip,
                      {
                        backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceAlt,
                      },
                    ]}>
                    <Text
                      style={{
                        color: selected ? '#07080c' : theme.colors.textSecondary,
                        fontWeight: '600',
                      }}>
                      {value === 'picker' ? 'Picker' : 'Palettes'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.previewRow}>
            <View
              style={[
                styles.previewSwatch,
                {
                  backgroundColor: colorHex,
                },
              ]}>
              <Text style={{ color: ensureContrastingText(colorHex), fontWeight: '700' }}>
                {colorHex.toUpperCase()}
              </Text>
            </View>
            <TextInput
              value={colorHex.toUpperCase()}
              onChangeText={handleHexInput}
              style={[
                styles.hexInput,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surfaceAlt,
                },
              ]}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          {mode === 'picker' ? (
            <>
              <View
                style={styles.svSquare}
                onLayout={(event) => setSvLayout(event.nativeEvent.layout)}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(event) =>
                  handleSvChange(event.nativeEvent.locationX, event.nativeEvent.locationY)
                }
                onResponderMove={(event) =>
                  handleSvChange(event.nativeEvent.locationX, event.nativeEvent.locationY)
                }>
                <LinearGradient
                  colors={['#ffffff', hueColor]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0)', '#000000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View
                  pointerEvents="none"
                  style={[
                    styles.svCursor,
                    {
                      borderColor: theme.colors.background,
                      backgroundColor: colorHex,
                      transform: [
                        { translateX: svCursorPosition.left },
                        { translateY: svCursorPosition.top },
                      ],
                    },
                  ]}
                />
              </View>

              <View
                style={styles.hueStrip}
                onLayout={(event) => setHueWidth(event.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(event) =>
                  handleHueChange(event.nativeEvent.locationX)
                }
                onResponderMove={(event) => handleHueChange(event.nativeEvent.locationX)}>
                <LinearGradient
                  colors={HUE_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View
                  pointerEvents="none"
                  style={[
                    styles.hueThumb,
                    {
                      transform: [{ translateX: hueThumbPosition }],
                    },
                  ]}
                />
              </View>
            </>
          ) : (
            <View style={styles.swatchGrid}>
              {QUICK_SWATCHES.map((swatch) => {
                const selected = swatch.toLowerCase() === colorHex.toLowerCase();
                return (
                  <TouchableOpacity
                    key={swatch}
                    onPress={() => setHsv(hexToHsv(swatch))}
                    style={[
                      styles.swatchButton,
                      {
                        backgroundColor: swatch,
                        borderColor: selected ? theme.colors.accent : '#ffffff33',
                      },
                    ]}
                  />
                );
              })}
            </View>
          )}

          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.footerButton,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
              ]}>
              <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={[
                styles.footerButton,
                styles.footerButtonLast,
                { backgroundColor: theme.colors.accent },
              ]}>
              <Text style={{ color: '#07080c', fontWeight: '700' }}>Use color</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 8, 12, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 28,
    padding: 20,
    elevation: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    padding: 4,
  },
  modeChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewSwatch: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hexInput: {
    width: 110,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  svSquare: {
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
  },
  svCursor: {
    width: CURSOR_SIZE,
    height: CURSOR_SIZE,
    borderRadius: CURSOR_SIZE / 2,
    borderWidth: 2,
    position: 'absolute',
  },
  hueStrip: {
    height: 26,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  hueThumb: {
    width: HUE_THUMB,
    height: HUE_THUMB,
    borderRadius: HUE_THUMB / 2,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: (26 - HUE_THUMB) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  swatchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    margin: 6,
    borderWidth: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  footerButtonLast: {
    marginRight: 0,
  },
});

