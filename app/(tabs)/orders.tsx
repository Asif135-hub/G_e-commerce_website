import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { OrderStatusTimeline } from '@/components/OrderStatusTimeline';
import { Order, PaymentMethod, useStore } from '@/context/StoreContext';
import { formatPrice } from '@/data/products';
import { colors, MAX_CONTENT_WIDTH, radii, spacing } from '@/theme';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on Delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
  card: 'Card',
};

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, currentUser, trackOrder } = useStore();

  const [trackId, setTrackId] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const visibleOrders = useMemo(() => {
    if (!currentUser) return orders;
    if (currentUser.role === 'admin') return orders;
    const cleanUserPhone = currentUser.phone.replace(/\D/g, '');
    return orders.filter(
      (o) =>
        o.userId === currentUser.id ||
        o.customer.phone.replace(/\D/g, '') === cleanUserPhone
    );
  }, [orders, currentUser]);

  const handleTrack = () => {
    setTrackError(null);
    const found = trackOrder(trackId, trackPhone);
    if (!found) {
      setTrackedOrder(null);
      setTrackError('No matching order found. Check your Order ID (e.g. GG-123456) and phone.');
      return;
    }
    setTrackedOrder(found);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Quick Order Tracker (Works without login!) */}
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.trackerTitle}>Track Your Order</Text>
          </View>
          <Text style={styles.trackerSubtitle}>
            Enter your Order ID and phone number to check live delivery status anytime.
          </Text>
          <View style={styles.trackerInputs}>
            <TextInput
              value={trackId}
              onChangeText={setTrackId}
              placeholder="Order ID (e.g. GG-123456)"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              style={[styles.input, styles.flex]}
            />
            <TextInput
              value={trackPhone}
              onChangeText={setTrackPhone}
              placeholder="Phone (01XXXXXXXXX)"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              style={[styles.input, styles.flex]}
            />
            <Pressable style={styles.trackBtn} onPress={handleTrack}>
              <Text style={styles.trackBtnText}>Track</Text>
            </Pressable>
          </View>

          {trackError ? <Text style={styles.errorText}>{trackError}</Text> : null}

          {trackedOrder ? (
            <View style={styles.trackedResult}>
              <View style={styles.trackedTop}>
                <Text style={styles.orderId}>Order #{trackedOrder.id}</Text>
                <Text style={styles.orderTotal}>{formatPrice(trackedOrder.total)}</Text>
              </View>
              <OrderStatusTimeline
                status={trackedOrder.status}
                trackingNote={trackedOrder.trackingNote}
              />
            </View>
          ) : null}
        </View>

        {/* Account Sync Banner if logged out */}
        {!currentUser ? (
          <View style={styles.loginPrompt}>
            <View style={styles.flex}>
              <Text style={styles.loginPromptTitle}>Have an account?</Text>
              <Text style={styles.loginPromptSub}>
                Sign in to view your full order history or access the Admin Dashboard.
              </Text>
            </View>
            <Pressable style={styles.loginBtn} onPress={() => router.push('/(tabs)/account')}>
              <Text style={styles.loginBtnText}>Sign In</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Orders List */}
        <Text style={styles.listHeading}>
          {currentUser?.role === 'admin' ? 'All Store Orders' : 'Your Orders'} (
          {visibleOrders.length})
        </Text>

        {visibleOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="receipt-outline" size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Place an order and watch its live delivery status right here.
            </Text>
            <Pressable style={styles.ctaButton} onPress={() => router.push('/')}>
              <Text style={styles.ctaText}>Explore Collection</Text>
            </Pressable>
          </View>
        ) : (
          visibleOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {PAYMENT_LABELS[order.customer.paymentMethod] ?? order.customer.paymentMethod}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    order.status === 'Cancelled' && styles.statusBadgeCancelled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      order.status === 'Cancelled' && styles.statusTextCancelled,
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <OrderStatusTimeline status={order.status} trackingNote={order.trackingNote} />

              <View style={styles.itemsList}>
                {order.items.map((item) => (
                  <View key={`${item.product.id}-${item.selectedOption}`} style={styles.itemRow}>
                    <Text style={styles.itemLabel} numberOfLines={1}>
                      {item.quantity}× {item.product.brand} {item.product.name} (
                      {item.selectedOption})
                    </Text>
                    <Text style={styles.itemAmount}>
                      {formatPrice(item.product.price * item.quantity)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.shipTo}>
                  {order.customer.fullName} · {order.customer.phone} · {order.customer.city}
                </Text>
                <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  container: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  trackerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  trackerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  trackerInputs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 4,
  },
  input: {
    minWidth: 160,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  trackBtn: {
    backgroundColor: colors.heroBg,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  trackedResult: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  trackedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: spacing.md,
  },
  loginPromptTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  loginPromptSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  loginBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  listHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  ctaText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  statusBadgeCancelled: {
    backgroundColor: colors.dangerBg,
  },
  statusText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextCancelled: {
    color: colors.danger,
  },
  itemsList: {
    gap: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surfaceAlt,
    paddingVertical: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  itemLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  shipTo: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
});
