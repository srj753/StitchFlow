import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useCartStore } from '@/store/useCartStore';

export default function CartScreen() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { showSuccess } = useToast();

    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const getTotal = useCartStore((state) => state.getTotal);

    const total = getTotal();

    const handleRemove = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        removeItem(id);
        showSuccess('Removed from cart');
    };

    const handleCheckout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        // Mock checkout
        clearCart();
        showSuccess('Purchase complete! Patterns added to your library.');
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Cart</Text>
                {items.length > 0 && (
                    <TouchableOpacity onPress={() => { clearCart(); showSuccess('Cart cleared'); }} style={styles.clearButton}>
                        <Text style={[styles.clearText, { color: theme.colors.accent }]}>Clear</Text>
                    </TouchableOpacity>
                )}
                {items.length === 0 && <View style={{ width: 44 }} />}
            </View>

            {items.length === 0 ? (
                <View style={styles.emptyWrapper}>
                    <EmptyState
                        icon={{ name: 'shopping-cart', size: 48 }}
                        title="Your cart is empty"
                        description="Browse the Pattern Store to find patterns you love!"
                        actionLabel="Browse Patterns"
                        onAction={() => router.push('/community')}
                    />
                </View>
            ) : (
                <>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        {items.map((item) => (
                            <View key={item.id} style={[styles.cartItem, { backgroundColor: theme.colors.surface }]}>
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                <View style={styles.itemInfo}>
                                    <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={[styles.itemDesigner, { color: theme.colors.textSecondary }]}>
                                        by {item.designer}
                                    </Text>
                                    <Text style={[styles.itemPrice, { color: theme.colors.accent }]}>
                                        {item.price > 0 ? `$${item.price.toFixed(2)}` : 'FREE'}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeButton}>
                                    <FontAwesome name="trash-o" size={18} color={theme.colors.muted} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Checkout Section */}
                    <View style={[styles.checkoutSection, { backgroundColor: theme.colors.background, paddingBottom: Math.max(insets.bottom, 16) }]}>
                        <View style={styles.totalRow}>
                            <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Total</Text>
                            <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                                {total > 0 ? `$${total.toFixed(2)}` : 'FREE'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleCheckout} style={[styles.checkoutButton, { backgroundColor: theme.colors.accent }]}>
                            <FontAwesome name="lock" size={16} color="#000" style={{ marginRight: 8 }} />
                            <Text style={styles.checkoutText}>
                                {total > 0 ? 'Checkout' : 'Get Patterns'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
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
    },
    headerTitle: { fontSize: 17, fontWeight: '600' },
    clearButton: { paddingHorizontal: 12, paddingVertical: 8 },
    clearText: { fontSize: 14, fontWeight: '600' },
    emptyWrapper: { flex: 1, justifyContent: 'center', padding: 24 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, gap: 12, paddingBottom: 120 },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
    },
    itemImage: {
        width: 72,
        height: 72,
        borderRadius: 12,
        backgroundColor: '#333',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 14,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDesigner: {
        fontSize: 13,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '700',
    },
    removeButton: {
        padding: 12,
    },
    checkoutSection: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    checkoutText: {
        color: '#000',
        fontSize: 17,
        fontWeight: '700',
    },
});
