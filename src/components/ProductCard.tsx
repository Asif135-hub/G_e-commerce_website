import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useStore } from '@/context/StoreContext';
import { formatPrice, Product } from '@/data/products';
import { colors, radii, spacing } from '@/theme';

interface ProductCardProps {
  product: Product;
  style?: object;
}

export function ProductCard({ product, style }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [imageError, setImageError] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const openDetails = () =>
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id },
    });

  return (
    <View style={[styles.card, style]}>
      <View style={[styles.imageContainer, { backgroundColor: product.fallbackColor }]}>
        <Pressable
          onPress={openDetails}
          style={styles.imagePress}
          accessibilityRole="link"
          accessibilityLabel={`View ${product.brand} ${product.name}`}
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
              <Ionicons name="sparkles-outline" size={38} color={colors.primary} />
            </View>
          )}
        </Pressable>

        {product.badge ? (
          <View
            pointerEvents="none"
            style={[
              styles.badge,
              product.badge === 'Sale' && styles.badgeSale,
              product.badge === 'K-Beauty' && styles.badgeKBeauty,
              product.badge === 'Restocked' && styles.badgeRestocked,
            ]}
          >
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => toggleWishlist(product.id)}
          hitSlop={8}
          style={styles.wishlistButton}
          accessibilityRole="button"
          accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={wishlisted ? colors.danger : colors.textSecondary}
          />
        </Pressable>

        <View pointerEvents="none" style={styles.originTag}>
          <Ionicons name="shield-checkmark" size={11} color={colors.success} />
          <Text style={styles.originText}>{product.origin}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Pressable onPress={openDetails} accessibilityRole="link">
          <View style={styles.metaRow}>
            <Text style={styles.brand}>{product.brand}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={colors.warning} />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({product.reviewCount})</Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {product.name}
          </Text>

          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <View style={styles.priceBlock}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice ? (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            ) : null}
          </View>

          <Pressable
            onPress={() => addToCart(product)}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to bag`}
          >
            <Ionicons name="bag-add-outline" size={16} color={colors.white} />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#2B211A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    height: 196,
    width: '100%',
    position: 'relative',
  },
  imagePress: {
    width: '100%',
    height: '100%',
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
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeSale: {
    backgroundColor: colors.danger,
  },
  badgeKBeauty: {
    backgroundColor: colors.accent,
  },
  badgeRestocked: {
    backgroundColor: colors.success,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  wishlistButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  originTag: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  originText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    padding: spacing.lg,
    flex: 1,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  brand: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  originalPrice: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.sm,
  },
  addButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
