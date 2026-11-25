import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPrice } from '@/data/products';
import { colors, radii, spacing, STORE_INFO } from '@/theme';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId, total } = useLocalSearchParams<{ orderId?: string; total?: string }>();
  const numericTotal = total ? Number(total) : null;

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={44} color={colors.success} />
        </View>
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Thank you for shopping with <Text style={styles.bold}>{STORE_INFO.name}</Text>. Order{' '}
          <Text style={styles.bold}>#{orderId || 'GG-CONFIRMED'}</Text>
          {numericTotal !== null && !Number.isNaN(numericTotal)
            ? ` (${formatPrice(numericTotal)})`
            : ''}{' '}
          is confirmed and saved in your Orders tab.
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace('/(tabs)/orders')}
          >
            <Text style={styles.primaryBtnText}>View My Orders</Text>
          </Pressable>
          <Pressable
            style={styles.fbBtn}
            onPress={() => Linking.openURL(STORE_INFO.facebookUrl)}
          >
            <Ionicons name="logo-facebook" size={16} color={colors.primaryDark} />
            <Text style={styles.fbBtnText}>Message Us on Facebook</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => router.replace('/')}>
            <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  bold: {
    fontWeight: '800',
    color: colors.text,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  fbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingVertical: 13,
    borderRadius: radii.md,
  },
  fbBtnText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
