import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { CATEGORIES, Category } from '@/data/products';
import { colors, MAX_CONTENT_WIDTH, radii, spacing, STORE_INFO } from '@/theme';

const brandLogo = require('../../assets/images/logo.png');

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

const SORT_LABELS: Record<SortOption, string> = {
  featured: 'Featured',
  'price-asc': 'Price: Low → High',
  'price-desc': 'Price: High → Low',
  rating: 'Top Rated',
};

export default function ShopScreen() {
  const { width } = useWindowDimensions();
  const { products } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const numColumns = width >= 960 ? 3 : width >= 620 ? 2 : 1;

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.origin.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    switch (sortBy) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [products, searchQuery, selectedCategory, sortBy]);

  const cycleSort = () => {
    const order: SortOption[] = ['featured', 'price-asc', 'price-desc', 'rating'];
    const next = order[(order.indexOf(sortBy) + 1) % order.length];
    setSortBy(next);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Editorial Hero Banner */}
        <View style={styles.hero}>
          <View style={styles.heroLayout}>
            <Image source={brandLogo} style={styles.heroLogo} resizeMode="cover" />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={13} color={colors.primaryDark} />
                <Text style={styles.heroBadgeText}>COSMETIC & BEAUTY · TANGAIL, BANGLADESH</Text>
              </View>
              <Text style={styles.heroTitle}>100% Authentic Imported Beauty</Text>
              <Text style={styles.heroSubtitle}>
                Welcome to Glowara Glowing. Explore original Malaysian & Korean skincare, body
                care, and beauty essentials—delivered from Tangail across Bangladesh. Use code{' '}
                <Text style={styles.promoHighlight}>GLOW10</Text> for 10% off.
              </Text>
              <View style={styles.heroActions}>
                <Pressable
                  style={styles.heroPrimaryBtn}
                  onPress={() => setSelectedCategory('K-Beauty')}
                >
                  <Text style={styles.heroPrimaryText}>Explore K-Beauty</Text>
                </Pressable>
                <Pressable
                  style={styles.heroSecondaryBtn}
                  onPress={() => Linking.openURL(STORE_INFO.facebookUrl)}
                >
                  <Ionicons name="logo-facebook" size={16} color={colors.primaryDark} />
                  <Text style={styles.heroSecondaryText}>Facebook Page</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Authenticity & Delivery Trust Strip */}
        <View style={styles.trustRow}>
          <View style={styles.trustPill}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
            <Text style={styles.trustText}>100% Original Imports</Text>
          </View>
          <View style={styles.trustPill}>
            <Ionicons name="bicycle-outline" size={16} color={colors.primary} />
            <Text style={styles.trustText}>Free Delivery ৳2,000+</Text>
          </View>
          <View style={styles.trustPill}>
            <Ionicons name="cash-outline" size={16} color={colors.primaryDark} />
            <Text style={styles.trustText}>Cash on Delivery & bKash</Text>
          </View>
        </View>

        {/* Search + Sort */}
        <View style={styles.controlsRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Garnier, Simple, Dove, K-Beauty..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <Pressable onPress={cycleSort} style={styles.sortButton}>
            <Ionicons name="swap-vertical-outline" size={16} color={colors.primary} />
            <Text style={styles.sortText}>{SORT_LABELS[sortBy]}</Text>
          </Pressable>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'Our Authentic Collection' : selectedCategory}
          </Text>
          <Text style={styles.resultCount}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Responsive Product Grid */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={44} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for Garnier, Simple, Enchanteur, Dove, or K-Beauty.
            </Text>
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Reset filters</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
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

        {/* Brand Footer */}
        <View style={styles.footerCard}>
          <Image source={brandLogo} style={styles.footerLogo} resizeMode="cover" />
          <Text style={styles.footerBrand}>{STORE_INFO.name}</Text>
          <Text style={styles.footerTagline}>{STORE_INFO.tagline}</Text>
          <Text style={styles.footerMeta}>
            {STORE_INFO.location} · {STORE_INFO.hours} · {STORE_INFO.languages}
          </Text>
          <Pressable
            style={styles.fbButton}
            onPress={() => Linking.openURL(STORE_INFO.facebookUrl)}
          >
            <Ionicons name="logo-facebook" size={16} color={colors.white} />
            <Text style={styles.fbButtonText}>Message Glowara Glowing on Facebook</Text>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  hero: {
    backgroundColor: '#F7EDE4',
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  heroLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xl,
  },
  heroLogo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.background,
  },
  heroContent: {
    flex: 1,
    minWidth: 240,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    maxWidth: 680,
    marginBottom: spacing.lg,
  },
  promoHighlight: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroPrimaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radii.md,
  },
  heroPrimaryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  heroSecondaryText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBox: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 44,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  categoriesRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
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
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.sm,
  },
  resetButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  footerCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 6,
  },
  footerLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: 4,
  },
  footerBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  footerTagline: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  footerMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  fbButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.heroBg,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radii.full,
  },
  fbButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
