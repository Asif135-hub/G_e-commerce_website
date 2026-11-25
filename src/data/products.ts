export type Category =
  | 'All'
  | 'Skincare'
  | 'Body & Hair'
  | 'Lip Care'
  | 'K-Beauty'
  | 'Sets & Gifts';

export interface Product {
  id: string;
  name: string;
  brand: string;
  origin: 'Malaysia' | 'South Korea';
  price: number;
  originalPrice?: number;
  category: Exclude<Category, 'All'>;
  rating: number;
  reviewCount: number;
  description: string;
  longDescription: string;
  image: string;
  fallbackColor: string;
  options: string[];
  optionLabel: string;
  badge?: string;
  featured?: boolean;
  inStock: boolean;
}

export const CATEGORIES: Category[] = [
  'All',
  'Skincare',
  'Body & Hair',
  'Lip Care',
  'K-Beauty',
  'Sets & Gifts',
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Bright Complete Vitamin C Sleeping Mask',
    brand: 'Garnier',
    origin: 'Malaysia',
    price: 850,
    originalPrice: 980,
    category: 'Skincare',
    rating: 4.9,
    reviewCount: 64,
    description: 'Overnight brightening sleeping mask with pure Yuzu Lemon & Vitamin C.',
    longDescription:
      '100% authentic Malaysian import. Enriched with 2x Vitamin C and Yuzu Lemon essence to visibly brighten dull skin, fade dark spots, and leave your skin glowing by morning without heaviness.',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#FBF0D9',
    options: ['50ml Jar', 'Twin Pack (2×50ml)'],
    optionLabel: 'Size',
    badge: 'Best Seller',
    featured: true,
    inStock: true,
  },
  {
    id: '2',
    name: 'Kind to Skin Hydrating Light Moisturiser',
    brand: 'Simple',
    origin: 'Malaysia',
    price: 780,
    originalPrice: 890,
    category: 'Skincare',
    rating: 4.9,
    reviewCount: 82,
    description: 'Gentle 12-hour hydration with Pro-Vitamin B5 & Vitamin E for sensitive skin.',
    longDescription:
      'Authentic imported Simple Hydrating Light Moisturiser. Fast-absorbing, non-comedogenic formula with no artificial perfume, no harsh chemicals, and no alcohol—ideal for daily tropical humidity.',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#E8F3EA',
    options: ['125ml Bottle'],
    optionLabel: 'Size',
    badge: 'Top Rated',
    featured: true,
    inStock: true,
  },
  {
    id: '3',
    name: 'Bright Complete Vitamin C Serum Cream SPF 36',
    brand: 'Garnier',
    origin: 'Malaysia',
    price: 690,
    category: 'Skincare',
    rating: 4.8,
    reviewCount: 51,
    description: 'Lightweight Vitamin C day cream with SPF 36 PA+++ sun protection.',
    longDescription:
      'Combines Vitamin C serum brightness with daily broad-spectrum SPF 36 protection. Helps shield against UVA/UVB rays while reducing the appearance of sun spots and uneven tone.',
    image:
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#FEF3D6',
    options: ['45ml Tube', '50ml Jar'],
    optionLabel: 'Pack',
    badge: 'Restocked',
    featured: true,
    inStock: true,
  },
  {
    id: '4',
    name: 'Pomegranate Seeds & Shea Butter Body Scrub',
    brand: 'Dove',
    origin: 'Malaysia',
    price: 1250,
    originalPrice: 1450,
    category: 'Body & Hair',
    rating: 4.9,
    reviewCount: 47,
    description: 'Whipped exfoliating body polish for silky, radiant, deeply nourished skin.',
    longDescription:
      'Infused with ¼ moisturizing cream, crushed pomegranate seeds, and rich shea butter. Gently buffs away dull dry skin while leaving a fresh, fruity scent and long-lasting softness.',
    image:
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#FBE6E8',
    options: ['298g Full Jar'],
    optionLabel: 'Size',
    badge: 'Sale',
    featured: true,
    inStock: true,
  },
  {
    id: '5',
    name: 'Perfumed Satin Smooth Body Lotion',
    brand: 'Enchanteur',
    origin: 'Malaysia',
    price: 620,
    category: 'Body & Hair',
    rating: 4.8,
    reviewCount: 73,
    description: 'French-inspired floral perfumed lotion with Aloe Vera & Olive Butter.',
    longDescription:
      'Direct Malaysian import. Enriched with Aloe Vera and Olive Butter for silky, non-greasy hydration wrapped in iconic long-lasting French fragrances.',
    image:
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#F8E7DF',
    options: ['Charming (250ml)', 'Romantic (250ml)', 'Alluring (250ml)'],
    optionLabel: 'Fragrance',
    badge: 'Restocked',
    featured: true,
    inStock: true,
  },
  {
    id: '6',
    name: 'Bright Complete Vitamin C Face Wash',
    brand: 'Garnier',
    origin: 'Malaysia',
    price: 450,
    category: 'Skincare',
    rating: 4.7,
    reviewCount: 95,
    description: 'Refreshing foam cleanser that removes oil and dullness instantly.',
    longDescription:
      'Deeply cleanses pores, removes excess sebum and pollution, and leaves skin feeling fresh, clean, and visibly brighter from the very first wash.',
    image:
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#FFF4D4',
    options: ['100ml Tube', '150ml Tube'],
    optionLabel: 'Size',
    featured: false,
    inStock: true,
  },
  {
    id: '7',
    name: 'Pure Nourishing Olive Oil',
    brand: 'Ginvera',
    origin: 'Malaysia',
    price: 540,
    category: 'Body & Hair',
    rating: 4.8,
    reviewCount: 39,
    description: 'Lightweight multi-purpose Malaysian olive oil for glowing skin & shiny hair.',
    longDescription:
      'Imported directly from Malaysia. Non-sticky botanical olive oil packed with Vitamin E to tame frizz, nourish dry cuticles, and lock in soft moisture after a shower.',
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#EDF2DF',
    options: ['150ml Bottle'],
    optionLabel: 'Size',
    featured: false,
    inStock: true,
  },
  {
    id: '8',
    name: 'Moisturizing Lip Balm Collection',
    brand: "WNP'L",
    origin: 'Malaysia',
    price: 280,
    category: 'Lip Care',
    rating: 4.7,
    reviewCount: 58,
    description: 'Soothing daily lip balm for soft, hydrated, kissably smooth lips.',
    longDescription:
      'Deeply conditions dry and chapped lips with natural plant extracts. Pocket-friendly daily essential available in three beloved variants.',
    image:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#FCE8E6',
    options: ['Avocado', 'Original', 'Honey'],
    optionLabel: 'Flavor',
    featured: false,
    inStock: true,
  },
  {
    id: '9',
    name: 'K-Beauty Glass Skin Starter Set',
    brand: 'Glowara K-Beauty',
    origin: 'South Korea',
    price: 2490,
    originalPrice: 2850,
    category: 'K-Beauty',
    rating: 5.0,
    reviewCount: 24,
    description: 'Curated 3-step Korean routine: gentle cleanser, hydrating toner & UV sunscreen.',
    longDescription:
      '100% original South Korean skincare trio curated by Glowara Glowing for dewy, luminous glass skin. Includes a low-pH cleanser, soothing hydrating toner, and zero-white-cast SPF 50+ sunscreen.',
    image:
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#F6E9E4',
    options: ['Dry / Normal Skin', 'Oily / Combination Skin'],
    optionLabel: 'Skin Type',
    badge: 'K-Beauty',
    featured: true,
    inStock: true,
  },
  {
    id: '10',
    name: 'Glowara Daily Glow Gift Box',
    brand: 'Glowara Glowing',
    origin: 'Malaysia',
    price: 1990,
    originalPrice: 2280,
    category: 'Sets & Gifts',
    rating: 4.9,
    reviewCount: 31,
    description: 'Gift-ready skincare bundle with cleanser, moisturizer & WNP’L lip balm.',
    longDescription:
      'Beautifully packed in our signature cream-and-gold Glowara Glowing gift wrap. Includes Simple Light Moisturiser, Garnier Vitamin C Face Wash, and your choice of WNP’L Lip Balm.',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    fallbackColor: '#F4E8DC',
    options: ['With Avocado Balm', 'With Honey Balm'],
    optionLabel: 'Gift Variant',
    badge: 'Gift Set',
    featured: false,
    inStock: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function formatPrice(amount: number): string {
  const rounded = Math.round(amount);
  return `৳${rounded.toLocaleString('en-US')}`;
}
