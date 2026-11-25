import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/data/products';
import { colors, MAX_CONTENT_WIDTH, radii, spacing } from '@/theme';

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    discount,
    shipping,
    total,
    promoCode,
    deliveryZone,
    freeShippingThreshold,
    setDeliveryZone,
    updateQuantity,
    removeFromCart,
    applyPromoCode,
    removePromoCode,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const amountRemainingForFreeShipping = Math.max(0, freeShippingThreshold - (subtotal - discount));
  const shippingProgress = Math.min(1, (subtotal - discount) / freeShippingThreshold);

  const handleApplyPromo = () => {
    const res = applyPromoCode(promoInput);
    setPromoFeedback(res);
    if (res.ok) {
      setPromoInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyWrapper}>
        <View style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="bag-handle-outline" size={38} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore Glowara Glowing’s authentic imported skincare and beauty essentials.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/')}>
            <Text style={styles.primaryButtonText}>Start Shopping</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Free Shipping Banner */}
        <View style={styles.shippingCard}>
          <View style={styles.shippingTextRow}>
            <Ionicons
              name={amountRemainingForFreeShipping === 0 ? 'checkmark-circle' : 'bicycle-outline'}
              size={18}
              color={amountRemainingForFreeShipping === 0 ? colors.success : colors.primary}
            />
            <Text style={styles.shippingText}>
              {amountRemainingForFreeShipping === 0
                ? 'You unlocked FREE delivery across Bangladesh!'
                : `Add ${formatPrice(amountRemainingForFreeShipping)} more for FREE delivery`}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(shippingProgress * 100)}%`,
                  backgroundColor:
                    amountRemainingForFreeShipping === 0 ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.list}>
          {cart.map((item) => (
            <View key={`${item.product.id}-${item.selectedOption}`} style={styles.itemCard}>
              <Image
                source={{ uri: item.product.image }}
                style={[styles.itemImage, { backgroundColor: item.product.fallbackColor }]}
              />
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.brand} {item.product.name}
                  </Text>
                  <Pressable
                    onPress={() => removeFromCart(item.product.id, item.selectedOption)}
                    hitSlop={8}
                    accessibilityLabel={`Remove ${item.product.name}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                  </Pressable>
                </View>

                <Text style={styles.itemOption}>
                  {item.product.optionLabel}: {item.selectedOption}
                </Text>

                <View style={styles.itemBottom}>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.product.price * item.quantity)}
                  </Text>

                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() => updateQuantity(item.product.id, item.selectedOption, -1)}
                      style={styles.stepperBtn}
                    >
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable
                      onPress={() => updateQuantity(item.product.id, item.selectedOption, 1)}
                      style={styles.stepperBtn}
                    >
                      <Ionicons name="add" size={16} color={colors.text} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Zone */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeading}>Delivery Area</Text>
          <View style={styles.zoneRow}>
            <Pressable
              onPress={() => setDeliveryZone('tangail')}
              style={[styles.zoneChip, deliveryZone === 'tangail' && styles.zoneChipActive]}
            >
              <Text
                style={[styles.zoneTitle, deliveryZone === 'tangail' && styles.zoneTitleActive]}
              >
                Tangail Sadar
              </Text>
              <Text style={styles.zoneFee}>৳60 (Free ৳2,000+)</Text>
            </Pressable>
            <Pressable
              onPress={() => setDeliveryZone('nationwide')}
              style={[styles.zoneChip, deliveryZone === 'nationwide' && styles.zoneChipActive]}
            >
              <Text
                style={[styles.zoneTitle, deliveryZone === 'nationwide' && styles.zoneTitleActive]}
              >
                All Bangladesh
              </Text>
              <Text style={styles.zoneFee}>৳120 (Free ৳2,000+)</Text>
            </Pressable>
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeading}>Promo Code</Text>
          {promoCode ? (
            <View style={styles.appliedPromo}>
              <View style={styles.appliedPromoLeft}>
                <Ionicons name="pricetag" size={16} color={colors.success} />
                <Text style={styles.appliedPromoText}>{promoCode} applied</Text>
              </View>
              <Pressable onPress={removePromoCode}>
                <Text style={styles.removePromoText}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.promoRow}>
                <TextInput
                  value={promoInput}
                  onChangeText={setPromoInput}
                  placeholder="Enter GLOW10 or WELCOME15"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  style={styles.promoInput}
                />
                <Pressable style={styles.applyBtn} onPress={handleApplyPromo}>
                  <Text style={styles.applyBtnText}>Apply</Text>
                </Pressable>
              </View>
              {promoFeedback ? (
                <Text
                  style={[
                    styles.promoMessage,
                    { color: promoFeedback.ok ? colors.success : colors.danger },
                  ]}
                >
                  {promoFeedback.message}
                </Text>
              ) : null}
            </>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeading}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          {discount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({promoCode})</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                -{formatPrice(discount)}
              </Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Delivery ({deliveryZone === 'tangail' ? 'Tangail' : 'Nationwide'})
            </Text>
            <Text style={styles.summaryValue}>
              {shipping === 0 ? 'FREE' : formatPrice(shipping)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.checkoutButton,
              pressed && styles.checkoutButtonPressed,
            ]}
            onPress={() => router.push('/checkout')}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  emptyWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    maxWidth: 420,
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
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  shippingCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 10,
  },
  shippingTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shippingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  list: {
    gap: spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  itemImage: {
    width: 88,
    height: 88,
    borderRadius: radii.md,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  itemOption: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    padding: 2,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  qtyText: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 10,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  zoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  zoneChip: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    gap: 2,
  },
  zoneChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  zoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  zoneTitleActive: {
    color: colors.primaryDark,
  },
  zoneFee: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  promoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  promoInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  applyBtn: {
    backgroundColor: colors.heroBg,
    paddingHorizontal: 18,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  promoMessage: {
    fontSize: 12,
    fontWeight: '600',
  },
  appliedPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.successBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.sm,
  },
  appliedPromoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appliedPromoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
  },
  removePromoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  checkoutButton: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  checkoutButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
