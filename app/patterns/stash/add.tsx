import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { YarnForm } from '@/components/yarn/YarnForm';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useYarnStore } from '@/store/useYarnStore';
import { YarnInput } from '@/types/yarn';

export default function AddYarnScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess } = useToast();
  const addYarn = useYarnStore((state) => state.addYarn);

  const handleSubmit = (values: YarnInput) => {
    addYarn(values);
    showSuccess(`${values.name} added to stash`);
    router.replace('/patterns/stash' as any);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Yarn stash</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Add yarn</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Log the yarn you have on hand so projects can reserve skeins and keep meterage accurate.
        </Text>
      </View>

      <YarnForm onSubmit={handleSubmit} submitLabel="Save to stash" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 16,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});

