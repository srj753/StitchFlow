import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

type SlideUpProps = {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  distance?: number;
  style?: any;
};

export function SlideUp({
  children,
  duration = 400,
  delay = 0,
  distance = 20,
  style,
}: SlideUpProps) {
  const translateY = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}>
      {children}
    </Animated.View>
  );
}




