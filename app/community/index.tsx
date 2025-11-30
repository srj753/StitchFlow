import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SlideUp } from '@/components/animations/SlideUp';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';

// Mock Data for Community Feed
const communityPosts = [
  {
    id: 'post1',
    user: 'AliceCrafts',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Alice',
    projectTitle: 'Sunset Cardigan',
    image: 'https://images.unsplash.com/photo-1619250907298-76e018cb932e?q=80&w=600&auto=format&fit=crop',
    likes: 124,
    patternName: 'Cozy Cardigan Pattern',
    isPaid: true,
  },
  {
    id: 'post2',
    user: 'YarnMaster99',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=YarnMaster',
    projectTitle: 'Dragon Scale Bag',
    image: 'https://images.unsplash.com/photo-1584662889139-55364fb59d84?q=80&w=600&auto=format&fit=crop',
    likes: 89,
    patternName: 'Dragon Scale Stitch',
    isPaid: false,
  },
  {
    id: 'post3',
    user: 'StitchWitch',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=StitchWitch',
    projectTitle: 'Amigurumi Fox',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=600&auto=format&fit=crop',
    likes: 256,
    patternName: 'Fox Plushie',
    isPaid: true,
  },
];

export default function CommunityScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>COMMUNITY</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Discover & Share</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/community/publish')}
          style={[styles.publishButton, { backgroundColor: theme.colors.accent }]}
        >
          <FontAwesome name="plus" size={12} color="#000" style={{ marginRight: 6 }} />
          <Text style={styles.publishButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feed}>
        {communityPosts.map((post, index) => (
          <SlideUp key={post.id} delay={index * 100}>
            <View style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {/* User Header */}
              <View style={styles.userHeader}>
                <Image source={{ uri: post.avatar }} style={styles.avatar} />
                <Text style={[styles.username, { color: theme.colors.text }]}>{post.user}</Text>
                <TouchableOpacity style={styles.moreButton}>
                  <FontAwesome name="ellipsis-h" size={16} color={theme.colors.muted} />
                </TouchableOpacity>
              </View>

              {/* Project Image */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: post.image }} style={styles.projectImage} />
                {post.isPaid && (
                  <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
                    <Text style={styles.badgeText}>PAID PATTERN</Text>
                  </View>
                )}
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome name="heart-o" size={22} color={theme.colors.text} />
                    <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>{post.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome name="comment-o" size={22} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome name="bookmark-o" size={22} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.projectTitle, { color: theme.colors.text }]}>{post.projectTitle}</Text>
                <Text style={[styles.patternLink, { color: theme.colors.accent }]}>
                  Pattern: {post.patternName}
                </Text>
              </View>
            </View>
          </SlideUp>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  publishButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
  feed: {
    gap: 24,
    paddingBottom: 100,
  },
  postCard: {
    borderRadius: 24,
    overflow: 'hidden',
    // borderWidth: 1, // Removed border for cleaner look
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  moreButton: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Square images for feed consistency
    backgroundColor: '#333',
    position: 'relative',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  content: {
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  patternLink: {
    fontSize: 14,
    fontWeight: '500',
  },
});
