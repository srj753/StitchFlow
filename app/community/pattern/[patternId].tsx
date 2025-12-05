import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useCartStore } from '@/store/useCartStore';
import { useCommunityStore } from '@/store/useCommunityStore';

export default function PatternDetailScreen() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { patternId, type } = useLocalSearchParams<{ patternId: string; type?: string }>();
    const { showSuccess } = useToast();

    const patternStoreItems = useCommunityStore((state) => state.patternStoreItems);
    const testerCalls = useCommunityStore((state) => state.testerCalls);
    const applyToTesterCall = useCommunityStore((state) => state.applyToTesterCall);
    const getTesterApplications = useCommunityStore((state) => state.getTesterApplications);
    const currentUserId = useCommunityStore((state) => state.currentUserId);
    const addToCart = useCartStore((state) => state.addItem);
    const cartItems = useCartStore((state) => state.items);

    // Find pattern from store or tester calls
    const pattern = useMemo(() => {
        if (type === 'tester') {
            return testerCalls.find((t) => t.id === patternId);
        }
        return patternStoreItems.find((p) => p.id === patternId);
    }, [patternId, type, patternStoreItems, testerCalls]);

    const isTester = type === 'tester';
    const hasApplied = useMemo(() => {
        if (!isTester) return false;
        const apps = getTesterApplications(currentUserId);
        return apps.some((a) => a.callId === patternId);
    }, [isTester, patternId, currentUserId, getTesterApplications]);

    const isInCart = useMemo(() => {
        return cartItems.some((item) => item.id === patternId);
    }, [cartItems, patternId]);

    if (!pattern) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Pattern</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <FontAwesome name="exclamation-circle" size={48} color={theme.colors.muted} />
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Pattern not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleAddToCart = () => {
        if (isInCart) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        addToCart({
            id: pattern.id,
            name: isTester ? pattern.patternName : pattern.name,
            price: isTester ? 0 : (pattern.price || 0),
            image: pattern.image,
            designer: pattern.designer,
        });
        showSuccess('Added to cart!');
    };

    const handleBuyNow = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (!isInCart) {
            addToCart({
                id: pattern.id,
                name: isTester ? pattern.patternName : pattern.name,
                price: isTester ? 0 : (pattern.price || 0),
                image: pattern.image,
                designer: pattern.designer,
            });
        }
        router.push('/community/cart');
    };

    const handleApply = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        applyToTesterCall(pattern.id, currentUserId, 'I would love to test this pattern!');
        showSuccess('Application submitted!');
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return '#4CAF50';
            case 'Intermediate': return '#FF9800';
            case 'Advanced': return '#F44336';
            default: return theme.colors.textSecondary;
        }
    };

    const price = isTester ? 0 : (pattern.price || 0);
    const name = isTester ? pattern.patternName : pattern.name;
    const difficulty = pattern.difficulty;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {name}
                </Text>
                <TouchableOpacity onPress={() => router.push('/community/cart')} style={styles.backButton}>
                    <FontAwesome name="shopping-cart" size={20} color={theme.colors.text} />
                    {cartItems.length > 0 && (
                        <View style={[styles.cartBadge, { backgroundColor: theme.colors.accent }]}>
                            <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Main Image */}
                <Image source={{ uri: pattern.image }} style={styles.mainImage} resizeMode="cover" />

                {/* Price Badge */}
                <View style={[styles.priceBadge, { backgroundColor: price > 0 ? theme.colors.accent : '#4CAF50' }]}>
                    <Text style={styles.priceText}>{price > 0 ? `$${price.toFixed(2)}` : 'FREE'}</Text>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={[styles.patternName, { color: theme.colors.text }]}>{name}</Text>
                    <Text style={[styles.designerName, { color: theme.colors.textSecondary }]}>by {pattern.designer}</Text>

                    {/* Meta */}
                    <View style={styles.metaRow}>
                        <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(difficulty) + '20' }]}>
                            <Text style={[styles.difficultyText, { color: getDifficultyColor(difficulty) }]}>{difficulty}</Text>
                        </View>
                        {!isTester && pattern.rating && (
                            <View style={styles.ratingContainer}>
                                <FontAwesome name="star" size={14} color="#FFD700" />
                                <Text style={[styles.ratingText, { color: theme.colors.text }]}>{pattern.rating}</Text>
                                <Text style={[styles.reviewCount, { color: theme.colors.muted }]}>({pattern.reviewCount} reviews)</Text>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    {pattern.description && (
                        <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
                            <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>{pattern.description}</Text>
                        </View>
                    )}

                    {/* Pattern Details */}
                    <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Details</Text>
                        <View style={styles.detailsGrid}>
                            {(pattern.yarnWeight || (isTester && 'Varies')) && (
                                <View style={[styles.detailBox, { backgroundColor: theme.colors.surface }]}>
                                    <FontAwesome name="circle-o" size={16} color={theme.colors.accent} />
                                    <Text style={[styles.detailLabel, { color: theme.colors.muted }]}>Yarn</Text>
                                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{pattern.yarnWeight || 'Varies'}</Text>
                                </View>
                            )}
                            {(pattern.hookSize || (isTester && 'Varies')) && (
                                <View style={[styles.detailBox, { backgroundColor: theme.colors.surface }]}>
                                    <FontAwesome name="pencil" size={16} color={theme.colors.accent} />
                                    <Text style={[styles.detailLabel, { color: theme.colors.muted }]}>Hook</Text>
                                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{pattern.hookSize || 'Varies'}</Text>
                                </View>
                            )}
                            {pattern.category && (
                                <View style={[styles.detailBox, { backgroundColor: theme.colors.surface }]}>
                                    <FontAwesome name="tag" size={16} color={theme.colors.accent} />
                                    <Text style={[styles.detailLabel, { color: theme.colors.muted }]}>Category</Text>
                                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{pattern.category}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Tester-specific info */}
                    {isTester && (
                        <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Testing Requirements</Text>
                            <View style={styles.testerInfo}>
                                <View style={styles.testerRow}>
                                    <FontAwesome name="calendar" size={14} color={theme.colors.muted} />
                                    <Text style={[styles.testerText, { color: theme.colors.textSecondary }]}>Deadline: {pattern.deadline}</Text>
                                </View>
                                <View style={styles.testerRow}>
                                    <FontAwesome name="list-ul" size={14} color={theme.colors.muted} />
                                    <Text style={[styles.testerText, { color: theme.colors.textSecondary }]}>{pattern.requirements}</Text>
                                </View>
                                <View style={[styles.rewardBox, { backgroundColor: theme.colors.accentMuted }]}>
                                    <FontAwesome name="gift" size={16} color={theme.colors.accent} />
                                    <Text style={[styles.rewardText, { color: theme.colors.accent }]}>{pattern.reward}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Tags */}
                    {!isTester && pattern.tags && pattern.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {pattern.tags.map((tag: string, idx: number) => (
                                <View key={idx} style={[styles.tag, { backgroundColor: theme.colors.surface }]}>
                                    <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Action Buttons */}
            <View style={[styles.bottomBar, { backgroundColor: theme.colors.background, paddingBottom: Math.max(insets.bottom, 16) }]}>
                {isTester ? (
                    <TouchableOpacity
                        onPress={handleApply}
                        disabled={hasApplied}
                        style={[
                            styles.fullButton,
                            { backgroundColor: hasApplied ? theme.colors.surface : theme.colors.accent, borderColor: theme.colors.accent }
                        ]}
                    >
                        <FontAwesome name={hasApplied ? 'check' : 'paper-plane'} size={16} color={hasApplied ? theme.colors.accent : '#000'} />
                        <Text style={[styles.fullButtonText, { color: hasApplied ? theme.colors.accent : '#000' }]}>
                            {hasApplied ? 'Applied!' : 'Apply to Test'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={handleAddToCart}
                            disabled={isInCart}
                            style={[
                                styles.addToCartButton,
                                { backgroundColor: theme.colors.surface, borderColor: isInCart ? theme.colors.accent : theme.colors.border }
                            ]}
                        >
                            <FontAwesome name={isInCart ? 'check' : 'shopping-cart'} size={16} color={isInCart ? theme.colors.accent : theme.colors.text} />
                            <Text style={[styles.addToCartText, { color: isInCart ? theme.colors.accent : theme.colors.text }]}>
                                {isInCart ? 'In Cart' : 'Add to Cart'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleBuyNow} style={[styles.buyNowButton, { backgroundColor: theme.colors.accent }]}>
                            <Text style={styles.buyNowText}>{price > 0 ? 'Buy Now' : 'Get Free'}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
        position: 'relative',
    },
    headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
    cartBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: { color: '#000', fontSize: 10, fontWeight: '700' },
    scrollView: { flex: 1 },
    mainImage: { width: '100%', aspectRatio: 1, backgroundColor: '#333' },
    priceBadge: {
        position: 'absolute',
        top: 60,
        right: 16,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    priceText: { color: '#000', fontSize: 16, fontWeight: '800' },
    content: { padding: 20 },
    patternName: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
    designerName: { fontSize: 15, marginBottom: 16 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    difficultyTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    difficultyText: { fontSize: 12, fontWeight: '600' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 14, fontWeight: '600' },
    reviewCount: { fontSize: 13 },
    section: { paddingTop: 20, marginTop: 20, borderTopWidth: 1 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    descriptionText: { fontSize: 15, lineHeight: 22 },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    detailBox: { padding: 14, borderRadius: 12, minWidth: 100, alignItems: 'center', gap: 6 },
    detailLabel: { fontSize: 11 },
    detailValue: { fontSize: 14, fontWeight: '600' },
    testerInfo: { gap: 12 },
    testerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    testerText: { fontSize: 14, flex: 1 },
    rewardBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, marginTop: 4 },
    rewardText: { fontSize: 14, fontWeight: '600', flex: 1 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
    tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    tagText: { fontSize: 13 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    emptyText: { fontSize: 16 },
    bottomBar: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    addToCartButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8, borderWidth: 1 },
    addToCartText: { fontSize: 15, fontWeight: '600' },
    buyNowButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
    buyNowText: { color: '#000', fontSize: 15, fontWeight: '700' },
    fullButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8, borderWidth: 2 },
    fullButtonText: { fontSize: 15, fontWeight: '700' },
});
