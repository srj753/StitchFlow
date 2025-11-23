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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
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
          contentOffset={{ x: currentIndex * SCREEN_WIDTH, y: 0 }}
          style={styles.scrollView}>
          {photos.map((uri, index) => (
            <View key={uri} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>

        {photos.length > 1 && (
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              style={[
                styles.controlButton,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  opacity: currentIndex === 0 ? 0.5 : 1,
                },
              ]}>
              <Text style={{ color: theme.colors.text }}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.counter, { color: theme.colors.textSecondary }]}>
              {currentIndex + 1} / {photos.length}
            </Text>
            <TouchableOpacity
              onPress={handleNext}
              disabled={currentIndex === photos.length - 1}
              style={[
                styles.controlButton,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  opacity: currentIndex === photos.length - 1 ? 0.5 : 1,
                },
              ]}>
              <Text style={{ color: theme.colors.text }}>›</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    fontSize: 24,
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
    height: SCREEN_HEIGHT * 0.8,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    fontSize: 16,
    fontWeight: '600',
  },
});




