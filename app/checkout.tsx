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

import { PaymentMethod, useStore } from '@/context/StoreContext';
import { formatPrice } from '@/data/products';
import { colors, MAX_CONTENT_WIDTH, radii, spacing } from '@/theme';

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  sublabel: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'cod',
    label: 'Cash on Delivery (COD)',
    sublabel: 'Pay in cash when your order arrives',
    icon: 'cash-outline',
  },
  {
    id: 'bkash',
    label: 'bKash',
    sublabel: 'Instant mobile payment',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'nagad',
    label: 'Nagad',
    sublabel: 'Fast mobile wallet payment',
    icon: 'wallet-outline',
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    sublabel: 'Visa & Mastercard accepted',
    icon: 'card-outline',
  },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    cart,
    currentUser,
    subtotal,
    discount,
    shipping,
    total,
    deliveryZone,
    setDeliveryZone,
    placeOrder,
  } = useStore();

  const [fullName, setFullName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(deliveryZone === 'tangail' ? 'Tangail' : '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [error, setError] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your bag is empty</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.replace('/')}>
          <Text style={styles.primaryBtnText}>Return to Glowara Glowing</Text>
        </Pressable>
      </View>
    );
  }

  const handleSubmit = () => {
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError('Please fill in your name, phone number, address, and city/district.');
      return;
    }
    if (email.trim() && !email.includes('@')) {
      setError('Please enter a valid email address or leave it blank.');
      return;
    }

    setError(null);
    const order = placeOrder({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      deliveryZone,
      paymentMethod,
      note: note.trim() || undefined,
    });

    router.replace({
      pathname: '/order-success',
      params: { orderId: order.id, total: String(order.total) },
    });
  };

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
          {/* Delivery Zone */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Delivery Area</Text>
            <View style={styles.twoCol}>
              <Pressable
                onPress={() => {
                  setDeliveryZone('tangail');
                  if (!city.trim()) setCity('Tangail');
                }}
                style={[styles.zoneChip, deliveryZone === 'tangail' && styles.zoneChipActive]}
              >
                <Text
                  style={[styles.zoneTitle, deliveryZone === 'tangail' && styles.zoneTitleActive]}
                >
                  Tangail Sadar
                </Text>
                <Text style={styles.zoneSub}>৳60 · Same / Next Day</Text>
              </Pressable>

              <Pressable
                onPress={() => setDeliveryZone('nationwide')}
                style={[styles.zoneChip, deliveryZone === 'nationwide' && styles.zoneChipActive]}
              >
                <Text
                  style={[
                    styles.zoneTitle,
                    deliveryZone === 'nationwide' && styles.zoneTitleActive,
                  ]}
                >
                  All Bangladesh
                </Text>
                <Text style={styles.zoneSub}>৳120 · 2–4 Days</Text>
              </Pressable>
            </View>
          </View>

          {/* Shipping Form */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Nusrat Jahan"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoComplete="name"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number (for delivery call) *</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="01XXXXXXXXX"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Full Address *</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="House, Road, Area (e.g. South College Para)"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>City / District *</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Tangail / Dhaka / Gazipur"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
              </View>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Email (optional)</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Order Note (optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Any gift note or delivery instructions..."
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentList}>
              {PAYMENT_OPTIONS.map((option) => {
                const active = paymentMethod === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setPaymentMethod(option.id)}
                    style={[styles.paymentOption, active && styles.paymentOptionActive]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={active ? colors.primary : colors.textSecondary}
                    />
                    <View style={styles.flex}>
                      <Text style={[styles.paymentLabel, active && styles.paymentLabelActive]}>
                        {option.label}
                      </Text>
                      <Text style={styles.paymentSub}>{option.sublabel}</Text>
                    </View>
                    <Ionicons
                      name={active ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={active ? colors.primary : colors.textMuted}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Summary */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Summary ({cart.length} items)</Text>
            <View style={styles.row}>
              <Text style={styles.muted}>Subtotal</Text>
              <Text style={styles.value}>{formatPrice(subtotal)}</Text>
            </View>
            {discount > 0 ? (
              <View style={styles.row}>
                <Text style={styles.muted}>Discount</Text>
                <Text style={[styles.value, { color: colors.success }]}>
                  -{formatPrice(discount)}
                </Text>
              </View>
            ) : null}
            <View style={styles.row}>
              <Text style={styles.muted}>
                Delivery ({deliveryZone === 'tangail' ? 'Tangail' : 'Nationwide'})
              </Text>
              <Text style={styles.value}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
              onPress={handleSubmit}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.white} />
              <Text style={styles.primaryBtnText}>Confirm Order · {formatPrice(total)}</Text>
            </Pressable>
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
    maxWidth: Math.min(MAX_CONTENT_WIDTH, 760),
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
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
  zoneSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  field: {
    gap: 6,
  },
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
  twoCol: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentList: {
    gap: spacing.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  paymentLabelActive: {
    color: colors.primaryDark,
  },
  paymentSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  muted: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
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
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radii.md,
  },
  primaryBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
