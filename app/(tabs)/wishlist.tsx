import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { colors, MAX_CONTENT_WIDTH, radii, spacing } from '@/theme';

export default function WishlistScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { products, wishlistIds } = useStore();

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));
  const numColumns = width >= 960 ? 3 : width >= 620 ? 2 : 1;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {savedProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="heart-outline" size={36} color={colors.danger} />
            </View>
            <Text style={styles.emptyTitle}>No saved items yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on any product to save it here for later.
            </Text>
            <Pressable style={styles.ctaButton} onPress={() => router.push('/')}>
              <Text style={styles.ctaText}>Browse Products</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {savedProducts.map((product) => (
              <View
                key={product.id}
                style={[
                  styles.gridItem,
                  numColumns === 1 && styles.col1,
                  numColumns === 2 && styles.col2,
                  numColumns === 3 && styles.col3,
                ]}
              >
                <ProductCard product={product} style={styles.fullHeightCard} />
              </View>
            ))}
          </View>
        )}
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
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.dangerBg,
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
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  col1: { width: '100%' },
  col2: { width: '50%' },
  col3: { width: '33.3333%' },
  fullHeightCard: { flex: 1 },
});
