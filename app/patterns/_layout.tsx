import { Stack } from 'expo-router';

export default function PatternsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="import" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="stash/index" />
      <Stack.Screen name="stash/add" />
      <Stack.Screen name="stash/[id]" />
    </Stack>
  );
}

