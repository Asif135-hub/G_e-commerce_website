import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { useStore } from '@/context/StoreContext';
import { colors, radii, spacing } from '@/theme';

export function ToastBanner() {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.toast}>
        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        <Text style={styles.text}>{toastMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 28 : 92,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 999,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.full,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    elevation: 6,
  },
  text: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
