import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastBanner } from '@/components/ToastBanner';
import { StoreProvider } from '@/context/StoreContext';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={styles.root}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[id]"
              options={{
                title: 'Product Details',
                headerBackTitle: 'Shop',
              }}
            />
            <Stack.Screen
              name="checkout"
              options={{
                title: 'Checkout',
                headerBackTitle: 'Bag',
              }}
            />
            <Stack.Screen
              name="order-success"
              options={{
                title: 'Order Confirmed',
                headerBackVisible: false,
              }}
            />
            <Stack.Screen
              name="admin"
              options={{
                title: 'Admin Dashboard',
                headerBackTitle: 'Account',
              }}
            />
          </Stack>
          <ToastBanner />
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
