import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

type TabType = 'share' | 'store';

export default function CommunityScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('share');

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>COMMUNITY</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Discover & Share</Text>
        </View>
        {activeTab === 'share' && (
          <TouchableOpacity
            onPress={() => router.push('/community/publish')}
            style={[styles.publishButton, { backgroundColor: theme.colors.accent }]}
          >
            <FontAwesome name="plus" size={12} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.publishButtonText}>Share</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('share')}
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'share' ? theme.colors.accent : theme.colors.surface,
              borderColor: activeTab === 'share' ? theme.colors.accent : theme.colors.border,
            },
          ]}>
          <FontAwesome
            name="share-alt"
            size={14}
            color={activeTab === 'share' ? '#000' : theme.colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: activeTab === 'share' ? '#000' : theme.colors.textSecondary,
              fontWeight: activeTab === 'share' ? '700' : '500',
            }}>
            Project Share
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('store')}
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'store' ? theme.colors.accent : theme.colors.surface,
              borderColor: activeTab === 'store' ? theme.colors.accent : theme.colors.border,
            },
          ]}>
          <FontAwesome
            name="store"
            size={14}
            color={activeTab === 'store' ? '#000' : theme.colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: activeTab === 'store' ? '#000' : theme.colors.textSecondary,
              fontWeight: activeTab === 'store' ? '700' : '500',
            }}>
            Pattern Store
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'share' ? (
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
      ) : (
        <PatternStoreTab />
      )}
    </Screen>
  );
}

function PatternStoreTab() {
  const theme = useTheme();
  const router = useRouter();

  // Mock data for pattern store / call for testers
  const testerCalls = [
    {
      id: 'tester1',
      designer: 'CrochetDesigns Co.',
      patternName: 'Cozy Winter Cardigan',
      difficulty: 'Intermediate',
      deadline: '2024-02-15',
      requirements: 'Must complete within 2 weeks, provide feedback',
      reward: 'Free pattern + early access',
      image: 'https://images.unsplash.com/photo-1619250907298-76e018cb932e?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'tester2',
      designer: 'YarnCraft Studio',
      patternName: 'Amigurumi Bunny Collection',
      difficulty: 'Beginner',
      deadline: '2024-02-20',
      requirements: 'Test all 3 sizes, document issues',
      reward: 'Pattern bundle + credit',
      image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'tester3',
      designer: 'StitchMaster',
      patternName: 'Lace Shawl Pattern',
      difficulty: 'Advanced',
      deadline: '2024-02-28',
      requirements: 'Test with different yarn weights',
      reward: 'Premium pattern access',
      image: 'https://images.unsplash.com/photo-1584662889139-55364fb59d84?q=80&w=600&auto=format&fit=crop',
    },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feed}>
      <View style={styles.storeHeader}>
        <Text style={[styles.storeDescription, { color: theme.colors.textSecondary }]}>
          Help designers test new patterns and get early access to patterns.
        </Text>
      </View>

      {testerCalls.map((call, index) => (
        <SlideUp key={call.id} delay={index * 100}>
          <View style={[styles.testerCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.testerHeader}>
              <View style={styles.testerInfo}>
                <Text style={[styles.designerName, { color: theme.colors.text }]}>{call.designer}</Text>
                <Text style={[styles.patternName, { color: theme.colors.textSecondary }]}>{call.patternName}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: theme.colors.accentMuted }]}>
                <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: '600' }}>
                  {call.difficulty}
                </Text>
              </View>
            </View>

            <View style={styles.testerImageContainer}>
              <Image source={{ uri: call.image }} style={styles.testerImage} />
            </View>

            <View style={styles.testerDetails}>
              <View style={styles.detailRow}>
                <FontAwesome name="calendar" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  Deadline: {call.deadline}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="check-circle" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {call.requirements}
                </Text>
              </View>
              <View style={[styles.rewardBox, { backgroundColor: theme.colors.accentMuted, borderColor: theme.colors.accent }]}>
                <FontAwesome name="gift" size={14} color={theme.colors.accent} />
                <Text style={[styles.rewardText, { color: theme.colors.accent }]}>{call.reward}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => {
                // TODO: Implement apply functionality
              }}>
              <Text style={styles.applyButtonText}>Apply to Test</Text>
            </TouchableOpacity>
          </View>
        </SlideUp>
      ))}
    </ScrollView>
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
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  storeHeader: {
    marginBottom: 20,
  },
  storeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  testerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  testerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  testerInfo: {
    flex: 1,
  },
  designerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  patternName: {
    fontSize: 16,
    fontWeight: '700',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  testerImageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    backgroundColor: '#333',
  },
  testerImage: {
    width: '100%',
    height: '100%',
  },
  testerDetails: {
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  applyButton: {
    margin: 16,
    marginTop: 0,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
