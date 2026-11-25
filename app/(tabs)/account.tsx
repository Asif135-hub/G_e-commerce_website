import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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

export default function AccountScreen() {
  const router = useRouter();
  const { currentUser, orders, products, wishlistIds, login, register, logout } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = () => {
    setError(null);
    if (mode === 'login') {
      const res = login(identifier, password);
      if (!res.ok) setError(res.message);
      else {
        setIdentifier('');
        setPassword('');
      }
    } else {
      const res = register({ name, email: identifier, phone, password });
      if (!res.ok) setError(res.message);
      else {
        setName('');
        setIdentifier('');
        setPhone('');
        setPassword('');
      }
    }
  };

  if (currentUser) {
    const isAdmin = currentUser.role === 'admin';
    const userOrders = isAdmin
      ? orders
      : orders.filter(
          (o) =>
            o.userId === currentUser.id ||
            o.customer.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')
        );
    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={[styles.avatar, isAdmin && styles.avatarAdmin]}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'person'}
                size={32}
                color={colors.white}
              />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{currentUser.name}</Text>
                <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
                  <Text style={[styles.roleText, isAdmin && styles.roleTextAdmin]}>
                    {isAdmin ? 'ADMIN' : 'CUSTOMER'}
                  </Text>
                </View>
              </View>
              <Text style={styles.profileMeta}>{currentUser.email}</Text>
              <Text style={styles.profileMeta}>{currentUser.phone}</Text>
            </View>
          </View>

          {/* Admin Quick Panel */}
          {isAdmin ? (
            <View style={styles.adminBanner}>
              <View style={styles.adminBannerTop}>
                <Ionicons name="storefront" size={22} color={colors.heroGold} />
                <Text style={styles.adminBannerTitle}>Store Management</Text>
              </View>
              <Text style={styles.adminBannerText}>
                Add or edit Glowara Glowing products, manage stock, and update live customer order
                tracking statuses.
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{products.length}</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{orders.length}</Text>
                  <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatPrice(totalRevenue)}</Text>
                  <Text style={styles.statLabel}>Sales</Text>
                </View>
              </View>
              <Pressable style={styles.adminCta} onPress={() => router.push('/admin')}>
                <Ionicons name="settings-outline" size={18} color={colors.white} />
                <Text style={styles.adminCtaText}>Open Admin Dashboard</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.statsCard}>
              <View style={styles.customerStat}>
                <Text style={styles.customerStatValue}>{userOrders.length}</Text>
                <Text style={styles.customerStatLabel}>My Orders</Text>
              </View>
              <View style={styles.vDivider} />
              <View style={styles.customerStat}>
                <Text style={styles.customerStatValue}>{wishlistIds.length}</Text>
                <Text style={styles.customerStatLabel}>Saved Items</Text>
              </View>
            </View>
          )}

          {/* Menu Actions */}
          <View style={styles.menuCard}>
            <Pressable style={styles.menuRow} onPress={() => router.push('/(tabs)/orders')}>
              <Ionicons name="receipt-outline" size={20} color={colors.primary} />
              <Text style={styles.menuText}>Track & View Orders</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.menuRow} onPress={() => router.push('/(tabs)/wishlist')}>
              <Ionicons name="heart-outline" size={20} color={colors.accent} />
              <Text style={styles.menuText}>Saved Wishlist ({wishlistIds.length})</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.menuRow} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={[styles.menuText, { color: colors.danger }]}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>
              {mode === 'login' ? 'Sign In to Glowara Glowing' : 'Create Customer Account'}
            </Text>
            <Text style={styles.authSubtitle}>
              {mode === 'login'
                ? 'Sign in to track your orders, save favorites, or access the Admin Dashboard.'
                : 'Register once for faster checkout and easy order tracking.'}
            </Text>

            {/* Mode Switch */}
            <View style={styles.segmented}>
              <Pressable
                style={[styles.segmentBtn, mode === 'login' && styles.segmentBtnActive]}
                onPress={() => {
                  setMode('login');
                  setError(null);
                }}
              >
                <Text style={[styles.segmentText, mode === 'login' && styles.segmentTextActive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segmentBtn, mode === 'register' && styles.segmentBtnActive]}
                onPress={() => {
                  setMode('register');
                  setError(null);
                }}
              >
                <Text style={[styles.segmentText, mode === 'register' && styles.segmentTextActive]}>
                  Create Account
                </Text>
              </Pressable>
            </View>

            {mode === 'register' ? (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Nusrat Jahan"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>
                {mode === 'login' ? 'Email or Phone Number' : 'Email Address'}
              </Text>
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder={mode === 'login' ? 'you@example.com or 017...' : 'you@example.com'}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {mode === 'register' ? (
              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="01XXXXXXXXX"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={styles.input}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable style={styles.primaryBtn} onPress={handleAuth}>
              <Text style={styles.primaryBtnText}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            </Pressable>
          </View>

          {/* Demo Quick-Login Helper */}
          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>Quick Demo Access</Text>
            <Text style={styles.demoHint}>
              Test both the Customer and Store Owner (Admin) experience in one tap:
            </Text>
            <View style={styles.demoButtons}>
              <Pressable
                style={styles.demoBtn}
                onPress={() => login('customer@glowara.com', 'glow123')}
              >
                <Ionicons name="person-outline" size={16} color={colors.primaryDark} />
                <Text style={styles.demoBtnText}>Demo Customer</Text>
              </Pressable>
              <Pressable
                style={[styles.demoBtn, styles.demoBtnAdmin]}
                onPress={() => {
                  const res = login('admin@glowara.com', 'admin123');
                  if (res.ok) router.push('/admin');
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.white} />
                <Text style={[styles.demoBtnText, { color: colors.white }]}>Demo Admin</Text>
              </Pressable>
            </View>
            <Text style={styles.credentialsNote}>
              Admin: admin@glowara.com / admin123 · Customer: customer@glowara.com / glow123
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    maxWidth: Math.min(MAX_CONTENT_WIDTH, 620),
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  authSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  field: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  demoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  demoHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  demoBtnAdmin: {
    backgroundColor: colors.heroBg,
    borderColor: colors.heroBg,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  credentialsNote: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAdmin: {
    backgroundColor: colors.heroBg,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  roleBadgeAdmin: {
    backgroundColor: colors.heroBg,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  roleTextAdmin: {
    color: colors.heroGold,
  },
  profileMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  adminBanner: {
    backgroundColor: colors.heroBg,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  adminBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminBannerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.white,
  },
  adminBannerText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#E7DDD3',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.heroGold,
  },
  statLabel: {
    fontSize: 11,
    color: '#D6C8BA',
    marginTop: 2,
  },
  adminCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  adminCtaText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  customerStat: {
    flex: 1,
    alignItems: 'center',
  },
  customerStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  customerStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  vDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.lg,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
  },
});
