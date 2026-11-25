import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { Product, PRODUCTS as INITIAL_PRODUCTS } from '@/data/products';

export interface CartItem {
  product: Product;
  selectedOption: string;
  quantity: number;
}

export type DeliveryZone = 'tangail' | 'nationwide';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card';
export type UserRole = 'customer' | 'admin';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export const ORDER_STATUS_STEPS: Exclude<OrderStatus, 'Cancelled'>[] = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
];

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface ShippingDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  deliveryZone: DeliveryZone;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface Order {
  id: string;
  userId?: string;
  createdAt: string;
  statusUpdatedAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string | null;
  customer: ShippingDetails;
  status: OrderStatus;
  trackingNote?: string;
}

export type ProductInput = Omit<Product, 'id' | 'rating' | 'reviewCount'>;

interface StoreContextValue {
  products: Product[];
  cart: CartItem[];
  wishlistIds: string[];
  orders: Order[];
  users: UserAccount[];
  currentUser: UserAccount | null;
  promoCode: string | null;
  deliveryZone: DeliveryZone;
  isHydrated: boolean;
  toastMessage: string | null;
  cartCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  getProduct: (id: string) => Product | undefined;
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, updates: Partial<ProductInput>) => void;
  deleteProduct: (id: string) => void;
  setDeliveryZone: (zone: DeliveryZone) => void;
  addToCart: (product: Product, selectedOption?: string, quantity?: number) => void;
  removeFromCart: (productId: string, selectedOption: string) => void;
  updateQuantity: (productId: string, selectedOption: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  applyPromoCode: (code: string) => { ok: boolean; message: string };
  removePromoCode: () => void;
  placeOrder: (customer: ShippingDetails) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNote?: string) => void;
  trackOrder: (orderId: string, phone: string) => Order | null;
  login: (identifier: string, password: string) => { ok: boolean; message: string };
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => { ok: boolean; message: string };
  logout: () => void;
  showToast: (message: string) => void;
}

const STORAGE_KEY = 'glowara_glowing_store_v2';
const FREE_SHIPPING_THRESHOLD = 2000;
const TANGAIL_SHIPPING_FEE = 60;
const NATIONWIDE_SHIPPING_FEE = 120;

const PROMO_CODES: Record<string, number> = {
  GLOW10: 0.1,
  WELCOME15: 0.15,
};

const SEEDED_USERS: UserAccount[] = [
  {
    id: 'admin-1',
    name: 'Glowara Admin',
    email: 'admin@glowara.com',
    phone: '01700000000',
    password: 'admin123',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'customer-1',
    name: 'Nusrat Jahan',
    email: 'customer@glowara.com',
    phone: '01711000000',
    password: 'glow123',
    role: 'customer',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
];

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

interface PersistedState {
  products: Product[];
  cart: { productId: string; selectedOption: string; quantity: number }[];
  wishlistIds: string[];
  orders: Order[];
  users: UserAccount[];
  currentUserId: string | null;
  promoCode: string | null;
  deliveryZone: DeliveryZone;
}

function triggerHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserAccount[]>(SEEDED_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('tangail');
  const [isHydrated, setIsHydrated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && active) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          const loadedProducts =
            Array.isArray(parsed.products) && parsed.products.length > 0
              ? parsed.products
              : INITIAL_PRODUCTS;
          setProducts(loadedProducts);

          if (Array.isArray(parsed.cart)) {
            const hydratedCart: CartItem[] = [];
            for (const entry of parsed.cart) {
              const product = loadedProducts.find((p) => p.id === entry.productId);
              if (product && entry.quantity > 0) {
                hydratedCart.push({
                  product,
                  selectedOption: entry.selectedOption || product.options[0],
                  quantity: entry.quantity,
                });
              }
            }
            setCart(hydratedCart);
          }
          if (Array.isArray(parsed.wishlistIds)) {
            setWishlistIds(parsed.wishlistIds);
          }
          if (Array.isArray(parsed.orders)) {
            setOrders(parsed.orders);
          }
          if (Array.isArray(parsed.users) && parsed.users.length > 0) {
            setUsers(parsed.users);
          }
          if (typeof parsed.currentUserId === 'string') {
            setCurrentUserId(parsed.currentUserId);
          }
          if (typeof parsed.promoCode === 'string' && PROMO_CODES[parsed.promoCode]) {
            setPromoCode(parsed.promoCode);
          }
          if (parsed.deliveryZone === 'tangail' || parsed.deliveryZone === 'nationwide') {
            setDeliveryZone(parsed.deliveryZone);
          }
        }
      } catch {
        // Ignore unavailable storage
      } finally {
        if (active) setIsHydrated(true);
      }
    })();

    return () => {
      active = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const payload: PersistedState = {
      products,
      cart: cart.map((item) => ({
        productId: item.product.id,
        selectedOption: item.selectedOption,
        quantity: item.quantity,
      })),
      wishlistIds,
      orders,
      users,
      currentUserId,
      promoCode,
      deliveryZone,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [
    products,
    cart,
    wishlistIds,
    orders,
    users,
    currentUserId,
    promoCode,
    deliveryZone,
    isHydrated,
  ]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const addProduct = useCallback(
    (input: ProductInput): Product => {
      const created: Product = {
        ...input,
        id: `prod-${Date.now()}`,
        rating: 5.0,
        reviewCount: 0,
      };
      setProducts((prev) => [created, ...prev]);
      showToast(`Added "${created.name}" to catalog`);
      return created;
    },
    [showToast]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<ProductInput>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === id
            ? { ...item, product: { ...item.product, ...updates } }
            : item
        )
      );
      showToast('Product updated');
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((item) => item.product.id !== id));
      setWishlistIds((prev) => prev.filter((wid) => wid !== id));
      showToast('Product removed from catalog');
    },
    [showToast]
  );

  const addToCart = useCallback(
    (product: Product, selectedOption?: string, quantity = 1) => {
      if (!product.inStock) {
        showToast('This product is currently out of stock');
        return;
      }
      const option = selectedOption || product.options[0];
      triggerHaptic();
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.product.id === product.id && item.selectedOption === option
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }
        return [...prev, { product, selectedOption: option, quantity }];
      });
      showToast(`Added ${product.brand} ${product.name} to bag`);
    },
    [showToast]
  );

  const removeFromCart = useCallback((productId: string, selectedOption: string) => {
    triggerHaptic();
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedOption === selectedOption)
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: string, selectedOption: string, delta: number) => {
    triggerHaptic();
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedOption === selectedOption) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setPromoCode(null);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      triggerHaptic();
      setWishlistIds((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          showToast('Removed from saved items');
          return prev.filter((id) => id !== productId);
        }
        showToast('Saved to wishlist');
        return [...prev, productId];
      });
    },
    [showToast]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const applyPromoCode = useCallback(
    (rawCode: string) => {
      const normalized = rawCode.trim().toUpperCase();
      if (!normalized) {
        return { ok: false, message: 'Enter a promo code (try GLOW10)' };
      }
      if (!PROMO_CODES[normalized]) {
        return { ok: false, message: 'Invalid code. Try GLOW10 or WELCOME15.' };
      }
      setPromoCode(normalized);
      showToast(`Promo code ${normalized} applied!`);
      return { ok: true, message: `${Math.round(PROMO_CODES[normalized] * 100)}% discount applied` };
    },
    [showToast]
  );

  const removePromoCode = useCallback(() => {
    setPromoCode(null);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const discount = useMemo(() => {
    if (!promoCode || !PROMO_CODES[promoCode]) return 0;
    return Math.round(subtotal * PROMO_CODES[promoCode]);
  }, [promoCode, subtotal]);

  const shipping = useMemo(() => {
    if (cart.length === 0) return 0;
    if (subtotal - discount >= FREE_SHIPPING_THRESHOLD) return 0;
    return deliveryZone === 'tangail' ? TANGAIL_SHIPPING_FEE : NATIONWIDE_SHIPPING_FEE;
  }, [cart.length, subtotal, discount, deliveryZone]);

  const total = useMemo(
    () => Math.max(0, subtotal - discount + shipping),
    [subtotal, discount, shipping]
  );

  const placeOrder = useCallback(
    (customer: ShippingDetails): Order => {
      const effectiveShipping =
        subtotal - discount >= FREE_SHIPPING_THRESHOLD
          ? 0
          : customer.deliveryZone === 'tangail'
            ? TANGAIL_SHIPPING_FEE
            : NATIONWIDE_SHIPPING_FEE;
      const finalTotal = Math.max(0, subtotal - discount + effectiveShipping);
      const now = new Date().toISOString();

      const newOrder: Order = {
        id: `GG-${Date.now().toString().slice(-6)}`,
        userId: currentUser?.id,
        createdAt: now,
        statusUpdatedAt: now,
        items: cart,
        subtotal,
        discount,
        shipping: effectiveShipping,
        total: finalTotal,
        promoCode,
        customer,
        status: 'Pending',
        trackingNote: 'Order received. Waiting for confirmation from Glowara Glowing.',
      };
      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      setPromoCode(null);
      triggerHaptic();
      return newOrder;
    },
    [cart, subtotal, discount, promoCode, currentUser?.id]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus, trackingNote?: string) => {
      const defaultNotes: Record<OrderStatus, string> = {
        Pending: 'Order received and awaiting confirmation.',
        Confirmed: 'Order confirmed by Glowara Glowing.',
        Packed: 'Your authentic beauty items are carefully packed.',
        Shipped: 'Handed over to courier for delivery.',
        Delivered: 'Delivered! Thank you for glowing with us.',
        Cancelled: 'Order was cancelled.',
      };
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
                statusUpdatedAt: new Date().toISOString(),
                trackingNote: trackingNote || defaultNotes[status],
              }
            : order
        )
      );
      showToast(`Order #${orderId} marked ${status}`);
    },
    [showToast]
  );

  const trackOrder = useCallback(
    (rawOrderId: string, rawPhone: string): Order | null => {
      const cleanId = rawOrderId.trim().replace(/^#/, '').toUpperCase();
      const cleanPhone = rawPhone.replace(/\D/g, '');
      if (!cleanId || !cleanPhone) return null;

      return (
        orders.find((o) => {
          const idMatch = o.id.toUpperCase() === cleanId;
          const orderPhone = o.customer.phone.replace(/\D/g, '');
          const phoneMatch = orderPhone === cleanPhone || orderPhone.endsWith(cleanPhone);
          return idMatch && phoneMatch;
        }) ?? null
      );
    },
    [orders]
  );

  const login = useCallback(
    (identifier: string, password: string) => {
      const cleanId = identifier.trim().toLowerCase();
      const cleanPhone = identifier.replace(/\D/g, '');
      const user = users.find(
        (u) =>
          (u.email.toLowerCase() === cleanId ||
            (cleanPhone.length >= 6 && u.phone.replace(/\D/g, '') === cleanPhone)) &&
          u.password === password
      );
      if (!user) {
        return { ok: false, message: 'Invalid email/phone or password.' };
      }
      setCurrentUserId(user.id);
      showToast(`Welcome back, ${user.name}!`);
      return { ok: true, message: 'Signed in successfully' };
    },
    [users, showToast]
  );

  const register = useCallback(
    (input: { name: string; email: string; phone: string; password: string }) => {
      const cleanEmail = input.email.trim().toLowerCase();
      const cleanPhone = input.phone.trim();
      if (!input.name.trim() || !cleanEmail || !cleanPhone || input.password.length < 4) {
        return {
          ok: false,
          message: 'Please fill all fields (password must be at least 4 characters).',
        };
      }
      if (!cleanEmail.includes('@')) {
        return { ok: false, message: 'Please enter a valid email address.' };
      }
      const exists = users.some(
        (u) =>
          u.email.toLowerCase() === cleanEmail ||
          u.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')
      );
      if (exists) {
        return { ok: false, message: 'An account with this email or phone already exists.' };
      }
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: input.name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: input.password,
        role: 'customer',
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUserId(newUser.id);
      showToast(`Account created! Welcome, ${newUser.name}`);
      return { ok: true, message: 'Account created' };
    },
    [users, showToast]
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
    showToast('Signed out');
  }, [showToast]);

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      cart,
      wishlistIds,
      orders,
      users,
      currentUser,
      promoCode,
      deliveryZone,
      isHydrated,
      toastMessage,
      cartCount,
      subtotal,
      discount,
      shipping,
      total,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      setDeliveryZone,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      applyPromoCode,
      removePromoCode,
      placeOrder,
      updateOrderStatus,
      trackOrder,
      login,
      register,
      logout,
      showToast,
    }),
    [
      products,
      cart,
      wishlistIds,
      orders,
      users,
      currentUser,
      promoCode,
      deliveryZone,
      isHydrated,
      toastMessage,
      cartCount,
      subtotal,
      discount,
      shipping,
      total,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      applyPromoCode,
      removePromoCode,
      placeOrder,
      updateOrderStatus,
      trackOrder,
      login,
      register,
      logout,
      showToast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
