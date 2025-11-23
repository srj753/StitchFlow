import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { YarnForm } from '@/components/yarn/YarnForm';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useYarnStore } from '@/store/useYarnStore';
import { YarnInput } from '@/types/yarn';

export default function EditYarnScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const yarn = useYarnStore((state) => state.getYarnById(id ?? ''));
  const updateYarn = useYarnStore((state) => state.updateYarn);
  const deleteYarn = useYarnStore((state) => state.deleteYarn);

  const handleSubmit = (values: YarnInput) => {
    if (!id) return;
    updateYarn(id, {
      ...values,
    });
    showSuccess(`${values.name} updated`);
    router.back();
  };

  const handleDelete = () => {
    if (!id || !yarn) return;
    deleteYarn(id);
    showSuccess(`${yarn.name} removed from stash`);
    router.replace('/patterns/stash' as any);
  };

  if (!yarn) {
    return (
      <Screen>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Yarn stash</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Yarn not found</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            We couldn’t find this yarn entry. It may have been deleted or never added.
          </Text>
        </View>
      </Screen>
    );
  }

  const initialValues: YarnInput = {
    name: yarn.name,
    brand: yarn.brand,
    color: yarn.color,
    colorHex: yarn.colorHex,
    weightCategory: yarn.weightCategory,
    metersPerSkein: yarn.metersPerSkein,
    yardagePerSkein: yarn.yardagePerSkein,
    skeinsOwned: yarn.skeinsOwned,
    pricePerSkein: yarn.pricePerSkein,
    purchasedFrom: yarn.purchasedFrom,
    notes: yarn.notes,
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Yarn stash</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Edit yarn</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Update details, reserved quantities, or notes for this yarn.
        </Text>
      </View>

      <YarnForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="Update yarn"
      />
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

