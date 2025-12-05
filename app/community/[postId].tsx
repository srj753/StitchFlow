import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useCommunityStore } from '@/store/useCommunityStore';

export default function PostDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { showSuccess, showError } = useToast();

  const [commentText, setCommentText] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Store hooks
  const posts = useCommunityStore((state) => state.posts);
  const users = useCommunityStore((state) => state.users);
  const currentUserId = useCommunityStore((state) => state.currentUserId);
  const likePost = useCommunityStore((state) => state.likePost);
  const unlikePost = useCommunityStore((state) => state.unlikePost);
  const bookmarkPost = useCommunityStore((state) => state.bookmarkPost);
  const unbookmarkPost = useCommunityStore((state) => state.unbookmarkPost);
  const addComment = useCommunityStore((state) => state.addComment);
  const deleteComment = useCommunityStore((state) => state.deleteComment);

  const post = useMemo(() => {
    return posts.find((p) => p.id === postId);
  }, [posts, postId]);

  const enrichedPost = useMemo(() => {
    if (!post) return null;
    const user = users.find((u) => u.id === post.userId);
    return {
      ...post,
      user,
      isLiked: post.likes.includes(currentUserId),
      isBookmarked: post.bookmarks.includes(currentUserId),
    };
  }, [post, users, currentUserId]);

  const enrichedComments = useMemo(() => {
    if (!post) return [];
    return post.comments.map((comment) => ({
      ...comment,
      user: users.find((u) => u.id === comment.userId),
    }));
  }, [post, users]);

  if (!enrichedPost) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Post</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <FontAwesome name="exclamation-circle" size={48} color={theme.colors.muted} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Post not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.goBackButton, { backgroundColor: theme.colors.accent }]}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (enrichedPost.isLiked) {
      unlikePost(enrichedPost.id, currentUserId);
    } else {
      likePost(enrichedPost.id, currentUserId);
    }
  };

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (enrichedPost.isBookmarked) {
      unbookmarkPost(enrichedPost.id, currentUserId);
      showSuccess('Removed from saved');
    } else {
      bookmarkPost(enrichedPost.id, currentUserId);
      showSuccess('Saved to collection');
    }
  };

  const handleAddComment = () => {
    const text = commentText.trim();
    if (!text) {
      showError('Please enter a comment');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addComment(enrichedPost.id, currentUserId, text);
      setCommentText('');
      showSuccess('Comment added!');
    } catch (e) {
      showError('Failed to add comment');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteComment(enrichedPost.id, commentId);
    showSuccess('Comment deleted');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Post</Text>
          <TouchableOpacity style={styles.backButton}>
            <FontAwesome name="ellipsis-h" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* User Info */}
          <View style={styles.userSection}>
            <Image
              source={{ uri: enrichedPost.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=default' }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: theme.colors.text }]}>
                {enrichedPost.user?.username || 'Unknown'}
              </Text>
              <Text style={[styles.timeAgo, { color: theme.colors.textSecondary }]}>
                {formatTimeAgo(enrichedPost.createdAt)}
              </Text>
            </View>
          </View>

          {/* Images */}
          {enrichedPost.images.length > 0 ? (
            <View style={styles.imagesContainer}>
              <Image
                source={{ uri: enrichedPost.images[activeImageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              {enrichedPost.images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailsContainer}
                >
                  {enrichedPost.images.map((img, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setActiveImageIndex(idx)}
                      style={[
                        styles.thumbnail,
                        { borderColor: idx === activeImageIndex ? theme.colors.accent : theme.colors.border }
                      ]}
                    >
                      <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <View style={[styles.noImageContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
              <FontAwesome name="image" size={48} color={theme.colors.muted} />
              <Text style={[styles.noImageText, { color: theme.colors.muted }]}>No images</Text>
            </View>
          )}

          {/* Actions */}
          <View style={[styles.actionsRow, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <FontAwesome
                name={enrichedPost.isLiked ? 'heart' : 'heart-o'}
                size={24}
                color={enrichedPost.isLiked ? '#ff4757' : theme.colors.text}
              />
              <Text style={[styles.actionCount, { color: theme.colors.textSecondary }]}>
                {enrichedPost.likes.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="comment-o" size={24} color={theme.colors.text} />
              <Text style={[styles.actionCount, { color: theme.colors.textSecondary }]}>
                {enrichedPost.comments.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
              <FontAwesome
                name={enrichedPost.isBookmarked ? 'bookmark' : 'bookmark-o'}
                size={24}
                color={enrichedPost.isBookmarked ? theme.colors.accent : theme.colors.text}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="share" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentSection}>
            <Text style={[styles.projectName, { color: theme.colors.text }]}>
              {enrichedPost.projectName}
            </Text>
            {enrichedPost.patternName && (
              <TouchableOpacity style={[styles.patternBadge, { backgroundColor: theme.colors.accentMuted }]}>
                <FontAwesome name="file-text-o" size={12} color={theme.colors.accent} />
                <Text style={[styles.patternName, { color: theme.colors.accent }]}>
                  {enrichedPost.patternName}
                </Text>
              </TouchableOpacity>
            )}
            {enrichedPost.caption && (
              <Text style={[styles.caption, { color: theme.colors.text }]}>
                {enrichedPost.caption}
              </Text>
            )}
          </View>

          {/* Journal Entries (if included) */}
          {enrichedPost.includeJournal && enrichedPost.journalEntries && enrichedPost.journalEntries.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.sectionHeader}>
                <FontAwesome name="book" size={16} color={theme.colors.accent} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Journal</Text>
              </View>
              {enrichedPost.journalEntries.slice(0, 3).map((entry: any, idx: number) => (
                <View key={idx} style={[styles.journalEntry, { borderBottomColor: theme.colors.border }]}>
                  <Text style={[styles.journalText, { color: theme.colors.textSecondary }]}>
                    {entry.text || entry.title || 'Entry'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: theme.colors.text }]}>
              Comments ({enrichedComments.length})
            </Text>

            {enrichedComments.length === 0 ? (
              <View style={[styles.noCommentsBox, { backgroundColor: theme.colors.surface }]}>
                <FontAwesome name="comments-o" size={32} color={theme.colors.muted} />
                <Text style={[styles.noComments, { color: theme.colors.textSecondary }]}>
                  Be the first to comment!
                </Text>
              </View>
            ) : (
              enrichedComments.map((comment) => (
                <View key={comment.id} style={[styles.commentCard, { backgroundColor: theme.colors.surface }]}>
                  <Image
                    source={{ uri: comment.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=default' }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={[styles.commentUsername, { color: theme.colors.text }]}>
                        {comment.user?.username || 'Unknown'}
                      </Text>
                      <Text style={[styles.commentTime, { color: theme.colors.muted }]}>
                        {formatTimeAgo(comment.createdAt)}
                      </Text>
                    </View>
                    <Text style={[styles.commentText, { color: theme.colors.text }]}>
                      {comment.text}
                    </Text>
                  </View>
                  {comment.userId === currentUserId && (
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(comment.id)}
                      style={styles.deleteButton}
                    >
                      <FontAwesome name="trash-o" size={14} color={theme.colors.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Bottom spacing for input */}
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Comment Input - Fixed at bottom */}
        <View style={[
          styles.commentInputContainer,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          }
        ]}>
          <TextInput
            style={[styles.commentInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
            placeholder="Write a comment..."
            placeholderTextColor={theme.colors.muted}
            value={commentText}
            onChangeText={setCommentText}
            returnKeyType="send"
            onSubmitEditing={handleAddComment}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleAddComment}
            style={[
              styles.sendButton,
              { backgroundColor: commentText.trim() ? theme.colors.accent : theme.colors.surfaceAlt }
            ]}
          >
            <FontAwesome
              name="send"
              size={16}
              color={commentText.trim() ? '#000' : theme.colors.muted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  goBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  goBackText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ccc',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 13,
    marginTop: 2,
  },
  imagesContainer: {
    marginBottom: 8,
  },
  mainImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#222',
  },
  thumbnailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  noImageText: {
    marginTop: 8,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
    borderBottomWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentSection: {
    padding: 16,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  patternBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  patternName: {
    fontSize: 13,
    fontWeight: '600',
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  journalEntry: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  journalText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  noCommentsBox: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  noComments: {
    textAlign: 'center',
    fontSize: 14,
  },
  commentCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 19,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  commentInput: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
