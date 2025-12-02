import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SlideUp } from '@/components/animations/SlideUp';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useCommunityStore } from '@/store/useCommunityStore';

export default function PostDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showSuccess } = useToast();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  
  const posts = useCommunityStore((state) => state.posts);
  const users = useCommunityStore((state) => state.users);
  const currentUserId = useCommunityStore((state) => state.currentUserId);
  const likePost = useCommunityStore((state) => state.likePost);
  const unlikePost = useCommunityStore((state) => state.unlikePost);
  const bookmarkPost = useCommunityStore((state) => state.bookmarkPost);
  const unbookmarkPost = useCommunityStore((state) => state.unbookmarkPost);
  const addComment = useCommunityStore((state) => state.addComment);
  const deleteComment = useCommunityStore((state) => state.deleteComment);
  
  const [commentText, setCommentText] = useState('');
  const [showAllImages, setShowAllImages] = useState(false);
  
  const post = useMemo(() => {
    const found = posts.find((p) => p.id === postId);
    if (!found) return null;
    
    const user = users.find((u) => u.id === found.userId);
    const isLiked = found.likes.includes(currentUserId);
    const isBookmarked = found.bookmarks.includes(currentUserId);
    
    // Enrich comments with user data
    const enrichedComments = found.comments.map((comment) => {
      const commentUser = users.find((u) => u.id === comment.userId);
      return {
        ...comment,
        user: commentUser,
      };
    });
    
    return {
      ...found,
      user,
      isLiked,
      isBookmarked,
      comments: enrichedComments,
    };
  }, [posts, users, currentUserId, postId]);
  
  if (!post) {
    return (
      <Screen>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Post</Text>
        </View>
        <EmptyState
          icon={{ name: 'exclamation-circle', size: 48 }}
          title="Post not found"
          description="This post may have been deleted or doesn't exist."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }
  
  const displayedImages = showAllImages ? post.images : post.images.slice(0, 1);
  
  const handleLike = () => {
    if (post.isLiked) {
      unlikePost(post.id, currentUserId);
    } else {
      likePost(post.id, currentUserId);
    }
  };
  
  const handleBookmark = () => {
    if (post.isBookmarked) {
      unbookmarkPost(post.id, currentUserId);
    } else {
      bookmarkPost(post.id, currentUserId);
    }
  };
  
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    addComment(post.id, currentUserId, commentText.trim());
    setCommentText('');
    showSuccess('Comment added');
  };
  
  const handleDeleteComment = (commentId: string) => {
    deleteComment(post.id, commentId);
    showSuccess('Comment deleted');
  };
  
  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Post</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* User Header */}
        <View style={styles.userHeader}>
          <Image 
            source={{ uri: post.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=default' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {post.user?.username || 'Unknown'}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        {/* Project Name */}
        <Text style={[styles.projectName, { color: theme.colors.text }]}>{post.projectName}</Text>
        {post.patternName && (
          <Text style={[styles.patternName, { color: theme.colors.accent }]}>
            Pattern: {post.patternName}
          </Text>
        )}
        
        {/* Caption */}
        {post.caption && (
          <Text style={[styles.caption, { color: theme.colors.text }]}>{post.caption}</Text>
        )}
        
        {/* Images */}
        <View style={styles.imagesContainer}>
          {displayedImages.map((imageUri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </View>
          ))}
          {post.images.length > 1 && !showAllImages && (
            <TouchableOpacity
              style={[styles.showMoreButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => setShowAllImages(true)}
            >
              <Text style={styles.showMoreText}>+{post.images.length - 1} more</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Journal Entries (if included) */}
        {post.includeJournal && post.journalEntries && post.journalEntries.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Journal Entries</Text>
            {post.journalEntries.slice(0, 3).map((entry: any, index: number) => (
              <View key={index} style={styles.journalEntry}>
                <Text style={[styles.journalText, { color: theme.colors.textSecondary }]}>
                  {entry.text || entry.title || 'Journal entry'}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <FontAwesome 
              name={post.isLiked ? "heart" : "heart-o"} 
              size={24} 
              color={post.isLiked ? theme.colors.accent : theme.colors.text} 
            />
            <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
              {post.likes.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="comment-o" size={24} color={theme.colors.text} />
            <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
              {post.comments.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
            <FontAwesome 
              name={post.isBookmarked ? "bookmark" : "bookmark-o"} 
              size={24} 
              color={post.isBookmarked ? theme.colors.accent : theme.colors.text} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={[styles.commentsTitle, { color: theme.colors.text }]}>
            Comments ({post.comments.length})
          </Text>
          
          {post.comments.length === 0 ? (
            <Text style={[styles.noComments, { color: theme.colors.textSecondary }]}>
              No comments yet. Be the first to comment!
            </Text>
          ) : (
            post.comments.map((comment, index) => (
              <SlideUp key={comment.id} delay={index * 50}>
                <View style={[styles.commentItem, { borderColor: theme.colors.border }]}>
                  <Image 
                    source={{ uri: comment.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=default' }} 
                    style={styles.commentAvatar} 
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={[styles.commentUsername, { color: theme.colors.text }]}>
                        {comment.user?.username || 'Unknown'}
                      </Text>
                      {comment.userId === currentUserId && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment.id)}
                          style={styles.deleteButton}
                        >
                          <FontAwesome name="trash-o" size={14} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>
                      {comment.text}
                    </Text>
                    <Text style={[styles.commentTime, { color: theme.colors.muted }]}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </SlideUp>
            ))
          )}
        </View>
        
        {/* Comment Input */}
        <View style={[styles.commentInputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
          <Image 
            source={{ uri: users.find((u) => u.id === currentUserId)?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=You' }} 
            style={styles.commentInputAvatar} 
          />
          <TextInput
            style={[styles.commentInput, { color: theme.colors.text, backgroundColor: theme.colors.surfaceAlt }]}
            placeholder="Add a comment..."
            placeholderTextColor={theme.colors.muted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!commentText.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: commentText.trim() ? theme.colors.accent : theme.colors.surfaceAlt },
            ]}
          >
            <FontAwesome 
              name="send" 
              size={16} 
              color={commentText.trim() ? '#000' : theme.colors.muted} 
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    paddingBottom: 40,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  projectName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  patternName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  caption: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  imagesContainer: {
    marginBottom: 16,
    gap: 8,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  showMoreButton: {
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  showMoreText: {
    color: '#000',
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  journalEntry: {
    marginBottom: 8,
  },
  journalText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    paddingVertical: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  noComments: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccc',
  },
  commentInput: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
    borderRadius: 12,
  },
});





