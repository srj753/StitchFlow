import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

type FadeInProps = {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: any;
};

export function FadeIn({ children, duration = 300, delay = 0, style }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration, delay]);

  return (
    <Animated.View style={[style, { opacity }]}>
      {children}
    </Animated.View>
  );
}




