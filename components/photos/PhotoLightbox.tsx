import { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type PhotoLightboxProps = {
  photos: string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PhotoLightbox({ photos, initialIndex = 0, visible, onClose }: PhotoLightboxProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!visible || photos.length === 0) return null;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={[styles.closeText, { color: theme.colors.text }]}>✕</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentOffset={{ x: initialIndex * SCREEN_WIDTH, y: 0 }}
          style={styles.scrollView}
          maximumZoomScale={3} // Enables pinch-to-zoom
          minimumZoomScale={1}
          scrollEventThrottle={16}
        >
          {photos.map((uri, index) => (
            <View key={uri} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>

        {photos.length > 1 && (
          <View style={styles.footer}>
            <View style={[styles.indicator, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <Text style={[styles.counter, { color: '#fff' }]}>
                {currentIndex + 1} / {photos.length}
                </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Full black for immersive feel
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT, // Full height
  },
  footer: {
      position: 'absolute',
      bottom: 40,
      width: '100%',
      alignItems: 'center',
  },
  indicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counter: {
    fontSize: 14,
    fontWeight: '600',
  },
});
