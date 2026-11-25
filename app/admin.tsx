import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { OrderStatusTimeline } from '@/components/OrderStatusTimeline';
import {
  ORDER_STATUS_STEPS,
  OrderStatus,
  ProductInput,
  useStore,
} from '@/context/StoreContext';
import { CATEGORIES, Category, formatPrice, Product } from '@/data/products';
import { colors, MAX_CONTENT_WIDTH, radii, spacing } from '@/theme';

const PRODUCT_CATEGORIES = CATEGORIES.filter((c): c is Exclude<Category, 'All'> => c !== 'All');

const ALL_ORDER_STATUSES: OrderStatus[] = [...ORDER_STATUS_STEPS, 'Cancelled'];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const {
    currentUser,
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Product form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [origin, setOrigin] = useState<'Malaysia' | 'South Korea'>('Malaysia');
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('Skincare');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [image, setImage] = useState('');
  const [optionLabel, setOptionLabel] = useState('Size');
  const [optionsText, setOptionsText] = useState('50ml, 100ml');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Orders filter
  const [orderFilter, setOrderFilter] = useState<'All' | OrderStatus>('All');

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'All') return orders;
    return orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed').length,
    [orders]
  );

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <View style={styles.restricted}>
        <View style={styles.restrictedCard}>
          <Ionicons name="lock-closed-outline" size={44} color={colors.primary} />
          <Text style={styles.restrictedTitle}>Admin Access Required</Text>
          <Text style={styles.restrictedText}>
            Please sign in with your Glowara Glowing admin account to add products and manage
            orders.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.replace('/(tabs)/account')}>
            <Text style={styles.primaryBtnText}>Go to Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setBrand('');
    setOrigin('Malaysia');
    setCategory('Skincare');
    setPrice('');
    setOriginalPrice('');
    setImage('');
    setOptionLabel('Size');
    setOptionsText('Standard');
    setBadge('');
    setDescription('');
    setFormError(null);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setBrand(product.brand);
    setOrigin(product.origin);
    setCategory(product.category);
    setPrice(String(product.price));
    setOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setImage(product.image);
    setOptionLabel(product.optionLabel);
    setOptionsText(product.options.join(', '));
    setBadge(product.badge || '');
    setDescription(product.description);
    setFormError(null);
    setShowForm(true);
  };

  const handleSaveProduct = () => {
    const parsedPrice = Number(price);
    const parsedOriginal = originalPrice.trim() ? Number(originalPrice) : undefined;
    const parsedOptions = optionsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name.trim() || !brand.trim() || !description.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Please enter a valid product name, brand, description, and price (৳).');
      return;
    }

    const payload: ProductInput = {
      name: name.trim(),
      brand: brand.trim(),
      origin,
      category,
      price: parsedPrice,
      originalPrice: parsedOriginal && !Number.isNaN(parsedOriginal) ? parsedOriginal : undefined,
      description: description.trim(),
      longDescription: description.trim(),
      image:
        image.trim() ||
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      fallbackColor: '#F5EFE6',
      optionLabel: optionLabel.trim() || 'Variant',
      options: parsedOptions.length > 0 ? parsedOptions : ['Standard'],
      badge: badge.trim() || undefined,
      featured: true,
      inStock: true,
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }

    resetForm();
    setShowForm(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Sales</Text>
            <Text style={styles.kpiValue}>{formatPrice(totalRevenue)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Orders</Text>
            <Text style={styles.kpiValue}>{orders.length}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Active / Pending</Text>
            <Text style={styles.kpiValue}>{pendingOrdersCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Products</Text>
            <Text style={styles.kpiValue}>{products.length}</Text>
          </View>
        </View>

        {/* Admin Section Tabs */}
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
            onPress={() => setActiveTab('products')}
          >
            <Ionicons
              name="cube-outline"
              size={16}
              color={activeTab === 'products' ? colors.white : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
              Products ({products.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Ionicons
              name="receipt-outline"
              size={16}
              color={activeTab === 'orders' ? colors.white : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
              Orders ({orders.length})
            </Text>
          </Pressable>
        </View>

        {activeTab === 'products' ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Catalog Manager</Text>
              <Pressable
                style={styles.addBtn}
                onPress={() => {
                  if (showForm) {
                    resetForm();
                    setShowForm(false);
                  } else {
                    resetForm();
                    setShowForm(true);
                  }
                }}
              >
                <Ionicons name={showForm ? 'close' : 'add'} size={16} color={colors.white} />
                <Text style={styles.addBtnText}>
                  {showForm ? 'Cancel' : 'Add Product'}
                </Text>
              </Pressable>
            </View>

            {showForm ? (
              <View style={styles.formCard}>
                <Text style={styles.formHeading}>
                  {editingId ? 'Edit Product' : 'New Glowara Product'}
                </Text>

                <View style={styles.twoCol}>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Brand *</Text>
                    <TextInput
                      value={brand}
                      onChangeText={setBrand}
                      placeholder="e.g. Garnier, Simple, COSRX"
                      placeholderTextColor={colors.textMuted}
                      style={styles.input}
                    />
                  </View>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Product Name *</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Vitamin C Serum"
                      placeholderTextColor={colors.textMuted}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.twoCol}>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Price (৳ BDT) *</Text>
                    <TextInput
                      value={price}
                      onChangeText={setPrice}
                      placeholder="850"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Original Price (optional)</Text>
                    <TextInput
                      value={originalPrice}
                      onChangeText={setOriginalPrice}
                      placeholder="980"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Origin</Text>
                  <View style={styles.chipsRow}>
                    {(['Malaysia', 'South Korea'] as const).map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => setOrigin(item)}
                        style={[styles.chip, origin === item && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, origin === item && styles.chipTextActive]}>
                          {item}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.chipsRow}>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[styles.chip, category === cat && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.twoCol}>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Variant Label</Text>
                    <TextInput
                      value={optionLabel}
                      onChangeText={setOptionLabel}
                      placeholder="Size / Shade / Flavor"
                      placeholderTextColor={colors.textMuted}
                      style={styles.input}
                    />
                  </View>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Options (comma-separated)</Text>
                    <TextInput
                      value={optionsText}
                      onChangeText={setOptionsText}
                      placeholder="50ml, 100ml"
                      placeholderTextColor={colors.textMuted}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.twoCol}>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Image URL (optional)</Text>
                    <TextInput
                      value={image}
                      onChangeText={setImage}
                      placeholder="https://..."
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>
                  <View style={[styles.field, styles.flex]}>
                    <Text style={styles.label}>Badge (optional)</Text>
                    <TextInput
                      value={badge}
                      onChangeText={setBadge}
                      placeholder="Restocked / Sale / K-Beauty"
                      placeholderTextColor={colors.textMuted}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Description *</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Short product description & benefits..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    style={[styles.input, styles.textArea]}
                  />
                </View>

                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

                <Pressable style={styles.primaryBtn} onPress={handleSaveProduct}>
                  <Text style={styles.primaryBtnText}>
                    {editingId ? 'Save Changes' : 'Publish Product to Store'}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* Product List */}
            <View style={styles.list}>
              {products.map((item) => (
                <View key={item.id} style={styles.productRow}>
                  <Image
                    source={{ uri: item.image }}
                    style={[styles.thumb, { backgroundColor: item.fallbackColor }]}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productBrand}>
                      {item.brand} · {item.origin} · {item.category}
                    </Text>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.priceLine}>
                      <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                      <View
                        style={[
                          styles.stockPill,
                          !item.inStock && styles.stockPillOut,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stockText,
                            !item.inStock && styles.stockTextOut,
                          ]}
                        >
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable
                      onPress={() => updateProduct(item.id, { inStock: !item.inStock })}
                      style={styles.iconAction}
                      accessibilityLabel="Toggle stock"
                    >
                      <Ionicons
                        name={item.inStock ? 'pause-circle-outline' : 'play-circle-outline'}
                        size={19}
                        color={colors.textSecondary}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => openEditForm(item)}
                      style={styles.iconAction}
                      accessibilityLabel="Edit product"
                    >
                      <Ionicons name="create-outline" size={19} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      onPress={() => deleteProduct(item.id)}
                      style={styles.iconAction}
                      accessibilityLabel="Delete product"
                    >
                      <Ionicons name="trash-outline" size={19} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Fulfillment & Live Tracking</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {(['All', ...ALL_ORDER_STATUSES] as const).map((status) => {
                const active = orderFilter === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => setOrderFilter(status)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {status}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {filteredOrders.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No orders yet</Text>
                <Text style={styles.emptySub}>
                  Orders placed by customers will appear here so you can confirm and update their
                  delivery status.
                </Text>
              </View>
            ) : (
              filteredOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <View>
                      <Text style={styles.orderId}>Order #{order.id}</Text>
                      <Text style={styles.orderCustomer}>
                        {order.customer.fullName} · {order.customer.phone}
                      </Text>
                      <Text style={styles.orderAddress}>
                        {order.customer.address}, {order.customer.city} (
                        {order.customer.deliveryZone === 'tangail' ? 'Tangail' : 'Nationwide'})
                      </Text>
                    </View>
                    <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                  </View>

                  <OrderStatusTimeline status={order.status} trackingNote={order.trackingNote} />

                  <View style={styles.statusActionsWrap}>
                    <Text style={styles.updateLabel}>Update Status:</Text>
                    <View style={styles.chipsRow}>
                      {ALL_ORDER_STATUSES.map((status) => {
                        const active = order.status === status;
                        return (
                          <Pressable
                            key={status}
                            onPress={() => updateOrderStatus(order.id, status)}
                            style={[
                              styles.statusBtn,
                              active && styles.statusBtnActive,
                              status === 'Cancelled' && active && styles.statusBtnCancelled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBtnText,
                                active && styles.statusBtnTextActive,
                              ]}
                            >
                              {status}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
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
  restricted: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  restrictedCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  restrictedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  kpiCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 4,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: radii.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.heroBg,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: spacing.lg,
    gap: spacing.md,
  },
  formHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  field: {
    gap: 6,
    minWidth: 180,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: spacing.sm,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radii.sm,
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  stockPill: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  stockPillOut: {
    backgroundColor: colors.dangerBg,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  stockTextOut: {
    color: colors.danger,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 360,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  orderCustomer: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  statusActionsWrap: {
    gap: 6,
  },
  updateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  statusBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusBtnCancelled: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusBtnTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
});
