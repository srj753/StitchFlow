import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { usePatternStore } from '@/store/usePatternStore';
import { PatternDifficulty } from '@/types/pattern';

const difficultyOptions: PatternDifficulty[] = ['beginner', 'intermediate', 'advanced'];

export default function ImportPatternScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const addPattern = usePatternStore((state) => state.addPattern);
  const [name, setName] = useState('');
  const [designer, setDesigner] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<PatternDifficulty>('beginner');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [yarnWeight, setYarnWeight] = useState('');
  const [hookSize, setHookSize] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileUri, setFileUri] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickFile = async () => {
    try {
      setIsLoadingFile(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets?.length) {
        const doc = result.assets[0];
        setFileUri(doc.uri);
        setFileName(doc.name);
        showSuccess('PDF attached');
      }
    } catch (error) {
      showError('Failed to pick file');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('A pattern name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Add a short description so the card looks helpful.');
      return;
    }
    if (!referenceUrl.trim() && !fileUri) {
      setError('Provide either a reference link or attach a PDF.');
      return;
    }
    setError(undefined);

    try {
      setIsSubmitting(true);
      addPattern({
        name,
        designer,
        description,
        difficulty,
        referenceUrl: referenceUrl.trim() || undefined,
        fileUri,
        yarnWeight,
        hookSize,
        notes,
        tags: [],
        moods: [],
      });
      showSuccess('Pattern saved to library');
      router.replace('/patterns');
    } catch (error) {
      showError('Failed to save pattern');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>Patterns</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Import pattern</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Save PDF patterns or reference links in your library so you can find them quickly later.
          Smart parsing will arrive in the next phase.
        </Text>
      </View>
      <Card title="Details" subtitle="Basic metadata">
        <Field
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g., Cozy Ripple Throw"
          theme={theme}
          required
        />
        <Field
          label="Designer"
          value={designer}
          onChangeText={setDesigner}
          placeholder="Optional"
          theme={theme}
        />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Short summary of the pattern"
          theme={theme}
          multiline
          required
        />
        <View style={styles.difficultyRow}>
          {difficultyOptions.map((option) => {
            const selected = option === difficulty;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setDifficulty(option)}
                style={[
                  styles.diffChip,
                  {
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surfaceAlt,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? theme.colors.accent : theme.colors.textSecondary,
                  }}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card title="Sources" subtitle="Link or attach the original">
        <Field
          label="Reference URL"
          value={referenceUrl}
          onChangeText={setReferenceUrl}
          placeholder="https://example.com/pattern"
          theme={theme}
        />
        <TouchableOpacity
          onPress={handlePickFile}
          disabled={isLoadingFile}
          style={[
            styles.fileButton,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
            isLoadingFile && { opacity: 0.6 },
          ]}>
          {isLoadingFile ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text style={{ color: theme.colors.textSecondary }}>
              {fileName ? `Attached: ${fileName}` : 'Attach PDF (optional)'}
            </Text>
          )}
        </TouchableOpacity>
      </Card>

      <Card title="Specs" subtitle="Optional helpers for filtering">
        <Field
          label="Yarn weight"
          value={yarnWeight}
          onChangeText={setYarnWeight}
          placeholder="Worsted, DK..."
          theme={theme}
        />
        <Field
          label="Hook size"
          value={hookSize}
          onChangeText={setHookSize}
          placeholder="4.0 mm"
          theme={theme}
        />
        <Field
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Yarn substitutions, reminders..."
          theme={theme}
          multiline
        />
      </Card>

      {error ? <Text style={{ color: theme.colors.accent }}>{error}</Text> : null}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={[
          styles.submitButton,
          { backgroundColor: theme.colors.accent },
          isSubmitting && { opacity: 0.6 },
        ]}>
        {isSubmitting ? (
          <LoadingSpinner size="small" color="#000" />
        ) : (
          <Text style={styles.submitButtonText}>Save to library</Text>
        )}
      </TouchableOpacity>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  theme,
  required,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  theme: ReturnType<typeof useTheme>;
  required?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.colors.muted }]}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        multiline={multiline}
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceAlt,
            color: theme.colors.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    gap: 8,
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
  field: {
    marginBottom: 12,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  diffChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fileButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#07080c',
    fontWeight: '700',
  },
});


