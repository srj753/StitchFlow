import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Project } from '@/types/project';

type AssistantViewProps = {
  project: Project;
};

export function AssistantView({ project }: AssistantViewProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.chatContainer, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.botIcon}>
            <FontAwesome name="magic" size={16} color="#fff" />
          </View>
          <View>
            <Text style={[styles.botName, { color: theme.colors.text }]}>StitchFlow Assistant</Text>
            <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
              Ask me about {project.patternName || 'your pattern'}
            </Text>
          </View>
        </View>

        <View style={styles.messages}>
          <View style={styles.emptyState}>
            <Text style={{ color: theme.colors.muted, textAlign: 'center', fontSize: 14 }}>
              Ask: "How do I do a magic ring?"{'\n'}or "Explain row 4"
            </Text>
          </View>
        </View>

        <View style={[styles.inputArea, { borderTopColor: theme.colors.border }]}>
          <TextInput
            placeholder="Ask AI..."
            placeholderTextColor={theme.colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceAlt,
                color: theme.colors.text,
              },
            ]}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.colors.accent }]}>
            <FontAwesome name="send" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
  chatContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  botIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#8B5CF6', // Violet
    alignItems: 'center',
    justifyContent: 'center',
  },
  botName: {
    fontWeight: '700',
    fontSize: 14,
  },
  messages: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    opacity: 0.6,
  },
  inputArea: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});



