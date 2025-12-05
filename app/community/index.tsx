import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SlideUp } from '@/components/animations/SlideUp';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useCartStore } from '@/store/useCartStore';
import { useCommunityStore } from '@/store/useCommunityStore';

type TabType = 'feed' | 'patterns' | 'testers';

export default function CommunityScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [refreshing, setRefreshing] = useState(false);

  // Cart
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.length;

  // Get data from store
  const posts = useCommunityStore((state) => state.posts);
  const users = useCommunityStore((state) => state.users);
  const currentUserId = useCommunityStore((state) => state.currentUserId);
  const likePost = useCommunityStore((state) => state.likePost);
  const unlikePost = useCommunityStore((state) => state.unlikePost);
  const bookmarkPost = useCommunityStore((state) => state.bookmarkPost);
  const unbookmarkPost = useCommunityStore((state) => state.unbookmarkPost);
  const patternStoreItems = useCommunityStore((state) => state.patternStoreItems);
  const testerCalls = useCommunityStore((state) => state.testerCalls);

  // Enrich posts with user data
  const enrichedPosts = useMemo(() => {
    return posts.map((post) => {
      const user = users.find((u) => u.id === post.userId);
      return {
        ...post,
        user,
        isLiked: post.likes.includes(currentUserId),
        isBookmarked: post.bookmarks.includes(currentUserId),
      };
    });
  }, [posts, users, currentUserId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleLike = (postId: string, isLiked: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLiked) {
      unlikePost(postId, currentUserId);
    } else {
      likePost(postId, currentUserId);
    }
  };

  const handleBookmark = (postId: string, isBookmarked: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isBookmarked) {
      unbookmarkPost(postId, currentUserId);
    } else {
      bookmarkPost(postId, currentUserId);
      showSuccess('Saved!');
    }
  };

  const handlePostPress = (postId: string) => {
    router.push({ pathname: '/community/[postId]', params: { postId } });
  };

  const handlePatternPress = (patternId: string, isTester: boolean) => {
    router.push({
      pathname: '/community/pattern/[patternId]',
      params: { patternId, type: isTester ? 'tester' : 'store' }
    });
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>COMMUNITY</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Discover & Share</Text>
        </View>
        <View style={styles.headerActions}>
          {/* Cart Icon */}
          <TouchableOpacity
            onPress={() => router.push('/community/cart')}
            style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
          >
            <FontAwesome name="shopping-cart" size={18} color={theme.colors.text} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {activeTab === 'feed' && (
            <TouchableOpacity
              onPress={() => router.push('/community/publish')}
              style={[styles.shareButton, { backgroundColor: theme.colors.accent }]}
            >
              <FontAwesome name="plus" size={12} color="#000" style={{ marginRight: 6 }} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('feed')}
          style={[styles.tab, { backgroundColor: activeTab === 'feed' ? theme.colors.accent : theme.colors.surface }]}>
          <FontAwesome name="newspaper-o" size={14} color={activeTab === 'feed' ? '#000' : theme.colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={{ color: activeTab === 'feed' ? '#000' : theme.colors.textSecondary, fontWeight: activeTab === 'feed' ? '700' : '500' }}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('patterns')}
          style={[styles.tab, { backgroundColor: activeTab === 'patterns' ? theme.colors.accent : theme.colors.surface }]}>
          <FontAwesome name="shopping-bag" size={14} color={activeTab === 'patterns' ? '#000' : theme.colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={{ color: activeTab === 'patterns' ? '#000' : theme.colors.textSecondary, fontWeight: activeTab === 'patterns' ? '700' : '500' }}>Patterns</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('testers')}
          style={[styles.tab, { backgroundColor: activeTab === 'testers' ? theme.colors.accent : theme.colors.surface }]}>
          <FontAwesome name="flask" size={14} color={activeTab === 'testers' ? '#000' : theme.colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={{ color: activeTab === 'testers' ? '#000' : theme.colors.textSecondary, fontWeight: activeTab === 'testers' ? '700' : '500' }}>Testers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/community/saved')}
          style={[styles.tab, { backgroundColor: theme.colors.surface }]}>
          <FontAwesome name="bookmark-o" size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={{ color: theme.colors.textSecondary, fontWeight: '500' }}>Saved</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tab Content */}
      {activeTab === 'feed' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feed}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.accent} />}
        >
          {enrichedPosts.length === 0 ? (
            <EmptyState
              icon={{ name: 'users', size: 48 }}
              title="No posts yet"
              description="Share your finished projects!"
              actionLabel="Share a Project"
              onAction={() => router.push('/community/publish')}
            />
          ) : (
            enrichedPosts.map((post, index) => (
              <SlideUp key={post.id} delay={index * 60}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => handlePostPress(post.id)} style={[styles.postCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.userHeader}>
                    <Image source={{ uri: post.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=default' }} style={styles.avatar} />
                    <Text style={[styles.username, { color: theme.colors.text }]}>{post.user?.username || 'Unknown'}</Text>
                  </View>
                  <View style={styles.imageContainer}>
                    {post.images.length > 0 ? (
                      <Image source={{ uri: post.images[0] }} style={styles.postImage} />
                    ) : (
                      <View style={[styles.postImage, { backgroundColor: theme.colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' }]}>
                        <FontAwesome name="image" size={40} color={theme.colors.muted} />
                      </View>
                    )}
                  </View>
                  <View style={styles.postContent}>
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id, post.isLiked)}>
                        <FontAwesome name={post.isLiked ? 'heart' : 'heart-o'} size={22} color={post.isLiked ? '#ff4757' : theme.colors.text} />
                        <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>{post.likes.length}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handlePostPress(post.id)}>
                        <FontAwesome name="comment-o" size={22} color={theme.colors.text} />
                        <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>{post.comments.length}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleBookmark(post.id, post.isBookmarked)}>
                        <FontAwesome name={post.isBookmarked ? 'bookmark' : 'bookmark-o'} size={22} color={post.isBookmarked ? theme.colors.accent : theme.colors.text} />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.postTitle, { color: theme.colors.text }]}>{post.projectName}</Text>
                    {post.caption && <Text style={[styles.caption, { color: theme.colors.textSecondary }]} numberOfLines={2}>{post.caption}</Text>}
                  </View>
                </TouchableOpacity>
              </SlideUp>
            ))
          )}
        </ScrollView>
      ) : activeTab === 'patterns' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feed}>
          <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>Browse patterns from designers</Text>
          {patternStoreItems.map((pattern, index) => (
            <SlideUp key={pattern.id} delay={index * 60}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => handlePatternPress(pattern.id, false)} style={[styles.patternCard, { backgroundColor: theme.colors.surface }]}>
                <Image source={{ uri: pattern.image }} style={styles.patternImage} />
                <View style={[styles.priceBadge, { backgroundColor: pattern.price ? theme.colors.accent : '#4CAF50' }]}>
                  <Text style={styles.priceText}>{pattern.price ? `$${pattern.price.toFixed(2)}` : 'FREE'}</Text>
                </View>
                <View style={styles.patternInfo}>
                  <Text style={[styles.patternName, { color: theme.colors.text }]} numberOfLines={1}>{pattern.name}</Text>
                  <Text style={[styles.designerName, { color: theme.colors.textSecondary }]}>by {pattern.designer}</Text>
                  <View style={styles.patternMeta}>
                    <View style={[styles.diffTag, { backgroundColor: (pattern.difficulty === 'Beginner' ? '#4CAF50' : pattern.difficulty === 'Intermediate' ? '#FF9800' : '#F44336') + '20' }]}>
                      <Text style={{ color: pattern.difficulty === 'Beginner' ? '#4CAF50' : pattern.difficulty === 'Intermediate' ? '#FF9800' : '#F44336', fontSize: 11, fontWeight: '600' }}>{pattern.difficulty}</Text>
                    </View>
                    {pattern.rating && (
                      <View style={styles.ratingRow}>
                        <FontAwesome name="star" size={12} color="#FFD700" />
                        <Text style={[styles.ratingText, { color: theme.colors.text }]}>{pattern.rating}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </SlideUp>
          ))}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feed}>
          <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>Help test patterns and get rewards!</Text>
          {testerCalls.map((call, index) => (
            <SlideUp key={call.id} delay={index * 60}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => handlePatternPress(call.id, true)} style={[styles.testerCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Image source={{ uri: call.image }} style={styles.testerImage} />
                <View style={styles.testerInfo}>
                  <Text style={[styles.testerName, { color: theme.colors.text }]}>{call.patternName}</Text>
                  <Text style={[styles.testerDesigner, { color: theme.colors.textSecondary }]}>by {call.designer}</Text>
                  <View style={styles.testerMeta}>
                    <View style={[styles.diffTag, { backgroundColor: theme.colors.accentMuted }]}>
                      <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: '600' }}>{call.difficulty}</Text>
                    </View>
                    <View style={styles.deadlineRow}>
                      <FontAwesome name="calendar" size={11} color={theme.colors.muted} />
                      <Text style={[styles.deadlineText, { color: theme.colors.muted }]}>{call.deadline}</Text>
                    </View>
                  </View>
                  <View style={[styles.rewardBadge, { backgroundColor: theme.colors.accentMuted }]}>
                    <FontAwesome name="gift" size={12} color={theme.colors.accent} />
                    <Text style={[styles.rewardBadgeText, { color: theme.colors.accent }]}>{call.reward}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </SlideUp>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#000', fontSize: 10, fontWeight: '700' },
  shareButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  shareButtonText: { color: '#000', fontWeight: '600', fontSize: 13 },
  tabsContainer: { paddingBottom: 14, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18 },
  feed: { gap: 16, paddingBottom: 100 },
  sectionDesc: { fontSize: 14, marginBottom: 8 },
  postCard: { borderRadius: 18, overflow: 'hidden' },
  userHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10, backgroundColor: '#ccc' },
  username: { fontSize: 14, fontWeight: '600' },
  imageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#333' },
  postImage: { width: '100%', height: '100%' },
  postContent: { padding: 12 },
  actions: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 14, fontWeight: '500' },
  postTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  caption: { fontSize: 13, lineHeight: 18 },
  patternCard: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden' },
  patternImage: { width: 100, height: 100, backgroundColor: '#333' },
  priceBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priceText: { color: '#000', fontSize: 11, fontWeight: '800' },
  patternInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  patternName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  designerName: { fontSize: 12, marginBottom: 8 },
  patternMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  diffTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600' },
  testerCard: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  testerImage: { width: 100, height: 120, backgroundColor: '#333' },
  testerInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  testerName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  testerDesigner: { fontSize: 12, marginBottom: 6 },
  testerMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: 11 },
  rewardBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  rewardBadgeText: { fontSize: 11, fontWeight: '600' },
});
