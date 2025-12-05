import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SlideUp } from '@/components/animations/SlideUp';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useCommunityStore } from '@/store/useCommunityStore';

export default function SavedPostsScreen() {
    const theme = useTheme();
    const router = useRouter();

    const posts = useCommunityStore((state) => state.posts);
    const users = useCommunityStore((state) => state.users);
    const currentUserId = useCommunityStore((state) => state.currentUserId);
    const unbookmarkPost = useCommunityStore((state) => state.unbookmarkPost);

    const savedPosts = useMemo(() => {
        return posts
            .filter((post) => post.bookmarks.includes(currentUserId))
            .map((post) => ({
                ...post,
                user: users.find((u) => u.id === post.userId),
            }));
    }, [posts, users, currentUserId]);

    const handleRemove = (postId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        unbookmarkPost(postId, currentUserId);
    };

    const handlePostPress = (postId: string) => {
        router.push({
            pathname: '/community/[postId]',
            params: { postId },
        });
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 0) return `${diffDays}d ago`;
        return 'Today';
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Saved Posts</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {savedPosts.length === 0 ? (
                    <EmptyState
                        icon={{ name: 'bookmark-o', size: 48 }}
                        title="No saved posts"
                        description="Posts you save will appear here for easy access later."
                        actionLabel="Explore Community"
                        onAction={() => router.push('/community')}
                    />
                ) : (
                    savedPosts.map((post, index) => (
                        <SlideUp key={post.id} delay={index * 80}>
                            <TouchableOpacity
                                onPress={() => handlePostPress(post.id)}
                                activeOpacity={0.8}
                                style={[styles.postCard, { backgroundColor: theme.colors.surface }]}
                            >
                                <View style={styles.postRow}>
                                    {post.images.length > 0 ? (
                                        <Image source={{ uri: post.images[0] }} style={styles.thumbnail} />
                                    ) : (
                                        <View style={[styles.thumbnail, styles.noImage, { backgroundColor: theme.colors.surfaceAlt }]}>
                                            <FontAwesome name="image" size={24} color={theme.colors.muted} />
                                        </View>
                                    )}
                                    <View style={styles.postInfo}>
                                        <Text style={[styles.projectName, { color: theme.colors.text }]} numberOfLines={1}>
                                            {post.projectName}
                                        </Text>
                                        <Text style={[styles.username, { color: theme.colors.textSecondary }]}>
                                            by {post.user?.username || 'Unknown'}
                                        </Text>
                                        <View style={styles.metaRow}>
                                            <View style={styles.metaItem}>
                                                <FontAwesome name="heart" size={12} color={theme.colors.muted} />
                                                <Text style={[styles.metaText, { color: theme.colors.muted }]}>{post.likes.length}</Text>
                                            </View>
                                            <Text style={[styles.metaDot, { color: theme.colors.muted }]}>•</Text>
                                            <Text style={[styles.metaText, { color: theme.colors.muted }]}>{formatTimeAgo(post.createdAt)}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleRemove(post.id)}
                                        style={styles.removeButton}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <FontAwesome name="bookmark" size={20} color={theme.colors.accent} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </SlideUp>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
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
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    postCard: {
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
    },
    postRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnail: {
        width: 72,
        height: 72,
        borderRadius: 12,
        backgroundColor: '#333',
    },
    noImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    postInfo: {
        flex: 1,
        marginLeft: 12,
    },
    projectName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    username: {
        fontSize: 13,
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    metaDot: {
        marginHorizontal: 6,
    },
    removeButton: {
        padding: 8,
    },
});
