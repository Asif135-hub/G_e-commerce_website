import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { useStore } from '@/context/StoreContext';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { cartCount, wishlistIds, currentUser } = useStore();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          color: colors.text,
          letterSpacing: 0.4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Glowara Glowing',
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={size}
              color={typeof color === 'string' ? color : colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Saved Items',
          tabBarLabel: 'Saved',
          tabBarBadge: wishlistIds.length > 0 ? wishlistIds.length : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.white, fontSize: 10 },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={size}
              color={typeof color === 'string' ? color : colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Shopping Bag',
          tabBarLabel: 'Bag',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? 'bag-handle' : 'bag-handle-outline'}
                size={size}
                color={typeof color === 'string' ? color : colors.textMuted}
              />
              {cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Track & Orders',
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={size}
              color={typeof color === 'string' ? color : colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: currentUser?.role === 'admin' ? 'Admin Account' : 'Account',
          tabBarLabel: currentUser?.role === 'admin' ? 'Admin' : 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                currentUser?.role === 'admin'
                  ? focused
                    ? 'shield-checkmark'
                    : 'shield-checkmark-outline'
                  : focused
                    ? 'person'
                    : 'person-outline'
              }
              size={size}
              color={typeof color === 'string' ? color : colors.textMuted}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
});
