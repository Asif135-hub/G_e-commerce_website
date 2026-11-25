import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/data/products';
import { colors, MAX_CONTENT_WIDTH, radii, spacing, STORE_INFO } from '@/theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { getProduct, addToCart, toggleWishlist, isWishlisted } = useStore();

  const product = id ? getProduct(String(id)) : undefined;
  const [selectedOption, setSelectedOption] = useState<string>(product?.options[0] ?? '');
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={44} color={colors.textMuted} />
        <Text style={styles.notFoundTitle}>Product not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace('/')}>
          <Text style={styles.backBtnText}>Back to Glowara Glowing</Text>
        </Pressable>
      </View>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const isWide = width >= 840;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.container, isWide && styles.containerWide]}>
        {/* Image Column */}
        <View
          style={[
            styles.imageBox,
            isWide && styles.imageBoxWide,
            { backgroundColor: product.fallbackColor },
          ]}
        >
          {!imageError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.fallbackBox}>
              <Ionicons name="sparkles-outline" size={56} color={colors.primary} />
            </View>
          )}
          {product.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          ) : null}
        </View>

        {/* Details Column */}
        <View style={[styles.detailsCard, isWide && styles.detailsCardWide]}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>
              {product.brand} · {product.category}
            </Text>
            <Pressable
              onPress={() => toggleWishlist(product.id)}
              style={styles.heartBtn}
              accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Ionicons
                name={wishlisted ? 'heart' : 'heart-outline'}
                size={22}
                color={wishlisted ? colors.danger : colors.textSecondary}
              />
            </Pressable>
          </View>

          <Text style={styles.title}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({product.reviewCount} reviews)</Text>
            <View style={styles.originPill}>
              <Ionicons name="shield-checkmark" size={13} color={colors.success} />
              <Text style={styles.originText}>Imported from {product.origin}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice ? (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            ) : null}
          </View>

          <Text style={styles.description}>{product.longDescription}</Text>

          {/* Option Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {product.optionLabel}: <Text style={styles.selectedLabel}>{selectedOption}</Text>
            </Text>
            <View style={styles.optionsRow}>
              {product.options.map((option) => {
                const active = selectedOption === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setSelectedOption(option)}
                    style={[styles.optionChip, active && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.qtyBtn}
              >
                <Ionicons name="remove" size={18} color={colors.text} />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable onPress={() => setQuantity((q) => q + 1)} style={styles.qtyBtn}>
                <Ionicons name="add" size={18} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
              onPress={() => addToCart(product, selectedOption, quantity)}
            >
              <Ionicons name="bag-add" size={18} color={colors.white} />
              <Text style={styles.addBtnText}>
                Add to Bag · {formatPrice(product.price * quantity)}
              </Text>
            </Pressable>

            <View style={styles.secondaryRow}>
              <Pressable
                style={[styles.secondaryBtn, styles.flex]}
                onPress={() => {
                  addToCart(product, selectedOption, quantity);
                  router.push('/(tabs)/cart');
                }}
              >
                <Text style={styles.secondaryBtnText}>Go to Bag</Text>
              </Pressable>
              <Pressable
                style={[styles.secondaryBtn, styles.flex]}
                onPress={() => Linking.openURL(STORE_INFO.facebookUrl)}
              >
                <Ionicons name="logo-facebook" size={16} color={colors.primaryDark} />
                <Text style={styles.secondaryBtnText}>Inbox to Order</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    gap: spacing.lg,
  },
  containerWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageBox: {
    width: '100%',
    height: 320,
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  imageBoxWide: {
    flex: 1,
    height: 480,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  detailsCardWide: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  heartBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  reviews: {
    fontSize: 13,
    color: colors.textMuted,
  },
  originPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  originText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  originalPrice: {
    fontSize: 17,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  section: {
    gap: 8,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  selectedLabel: {
    color: colors.primary,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  optionChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    padding: 4,
    gap: 8,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  actionsRow: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radii.md,
  },
  addBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  backBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  backBtnText: {
    color: colors.white,
    fontWeight: '700',
  },
});
