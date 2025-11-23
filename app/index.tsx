import { Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function IndexRedirectScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home' as Href);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Routing you to Home…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07080c',
  },
  text: {
    color: '#f5f5ff',
    fontSize: 16,
  },
});


