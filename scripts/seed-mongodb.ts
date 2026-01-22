import { MongoClient, Db } from 'mongodb';
import { createHash } from 'crypto';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables manually
try {
  // Try multiple paths for .env file
  const possiblePaths = [
    resolve(process.cwd(), '.env'),
    resolve(__dirname, '../.env'),
    resolve(__dirname, '../../.env'),
  ];
  
  let envFile: string | null = null;
  for (const envPath of possiblePaths) {
    try {
      envFile = readFileSync(envPath, 'utf-8');
      console.log(`📄 Loaded .env from: ${envPath}`);
      break;
    } catch (e) {
      // Try next path
    }
  }
  
  if (envFile) {
    envFile.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
  } else {
    console.warn('⚠️  Could not find .env file, using environment variables');
  }
} catch (error) {
  console.warn('⚠️  Could not load .env file, using environment variables');
}

// Test user emails (same as in seed-users.ts)
const TEST_USER_EMAILS = [
  'admin@kibtop.com',
  'john@example.com',
  'jane@example.com',
  'test@example.com',
  'seller1@example.com',
];

// Get user IDs (hashed emails)
function getUserIds(): string[] {
  return TEST_USER_EMAILS.map((email) => createHash('sha256').update(email).digest('hex'));
}

// Cities in Northern Cyprus with coordinates
const CITIES = {
  Kyrenia: {
    name: 'Kyrenia',
    lat: 35.3392,
    lng: 33.3192,
    geocode: '35.3392 33.3192',
  },
  Nicosia: {
    name: 'Nicosia',
    lat: 35.1856,
    lng: 33.3823,
    geocode: '35.1856 33.3823',
  },
  Famagusta: {
    name: 'Famagusta',
    lat: 35.1250,
    lng: 33.9500,
    geocode: '35.1250 33.9500',
  },
  Lefkosa: {
    name: 'Lefkosa',
    lat: 35.1856,
    lng: 33.3823,
    geocode: '35.1856 33.3823',
  },
  Girne: {
    name: 'Girne',
    lat: 35.3392,
    lng: 33.3192,
    geocode: '35.3392 33.3192',
  },
};

// ============================================
// 1. SEED ADVERTISEMENTS (advs)
// ============================================
function generateAdvertisements(userIds: string[]): any[] {
  const ads: any[] = [];
  let id = 1;
  const now = new Date();

  // ========== REALTY (Недвижимость) ==========
  ads.push({
    id: id++,
    title: '2 Bedroom Apartment in Kyrenia',
    title_en: '2 Bedroom Apartment in Kyrenia',
    title_ru: '2-комнатная квартира в Кирении',
    title_tr: 'Girne\'de 2 Yatak Odalı Daire',
    description: 'Beautiful apartment with sea view, fully furnished, modern kitchen and bathroom. Close to beach and city center.',
    description_en: 'Beautiful apartment with sea view, fully furnished, modern kitchen and bathroom. Close to beach and city center.',
    description_ru: 'Красивая квартира с видом на море, полностью меблирована, современная кухня и ванная. Близко к пляжу и центру города.',
    description_tr: 'Deniz manzaralı güzel daire, tam eşyalı, modern mutfak ve banyo. Sahile ve şehir merkezine yakın.',
    price: 450000,
    currency: 'EUR',
    owner: userIds[1], // john@example.com
    city: CITIES.Kyrenia.name,
    address: `${CITIES.Kyrenia.name}, Beach Road, 15`,
    geocode: CITIES.Kyrenia.geocode,
    geo_indexed: [CITIES.Kyrenia.lng, CITIES.Kyrenia.lat],
    db_category: 'realty',
    upload: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
      {
        id: 2,
        uploads: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&q=80',
        sort_order: 3000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 45,
    lifts: 2,
    top: 3,
    vip: 0,
    square: 85,
    type_sell: 'Sale',
    rooms: '2',
    floor: 3,
    condition: 'Excellent',
    isMonth: false,
  });

  ads.push({
    id: id++,
    title: 'Villa for Rent in Nicosia',
    title_en: 'Villa for Rent in Nicosia',
    title_ru: 'Вилла в аренду в Никосии',
    title_tr: 'Lefkoşa\'da Kiralık Villa',
    description: 'Luxury 4-bedroom villa with private pool and garden. Monthly rent available.',
    description_en: 'Luxury 4-bedroom villa with private pool and garden. Monthly rent available.',
    description_ru: 'Роскошная вилла с 4 спальнями, частным бассейном и садом. Доступна месячная аренда.',
    description_tr: 'Özel havuz ve bahçeli lüks 4 yatak odalı villa. Aylık kiralama mevcut.',
    price: 2500,
    currency: 'EUR',
    owner: userIds[2], // jane@example.com
    city: CITIES.Nicosia.name,
    address: `${CITIES.Nicosia.name}, Residential Area, 42`,
    geocode: CITIES.Nicosia.geocode,
    geo_indexed: [CITIES.Nicosia.lng, CITIES.Nicosia.lat],
    db_category: 'realty',
    upload: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 28,
    lifts: 0,
    top: 0,
    vip: 0,
    square: 250,
    type_sell: 'Rent',
    rooms: '4',
    floor: 1,
    condition: 'Excellent',
    isMonth: true,
  });

  // ========== AVTO (Автомобили) ==========
  ads.push({
    id: id++,
    title: 'Toyota Camry 2018 - Excellent Condition',
    title_en: 'Toyota Camry 2018 - Excellent Condition',
    title_ru: 'Toyota Camry 2018 - Отличное состояние',
    title_tr: 'Toyota Camry 2018 - Mükemmel Durum',
    description: 'Single owner, full service history, no accidents. All documents ready.',
    description_en: 'Single owner, full service history, no accidents. All documents ready.',
    description_ru: 'Один владелец, полная история обслуживания, без аварий. Все документы готовы.',
    description_tr: 'Tek sahibi, tam servis geçmişi, kaza yok. Tüm belgeler hazır.',
    price: 20000,
    currency: 'EUR',
    owner: userIds[0], // admin@kibtop.com
    city: CITIES.Kyrenia.name,
    address: `${CITIES.Kyrenia.name}, Car Dealership, 25`,
    geocode: CITIES.Kyrenia.geocode,
    geo_indexed: [CITIES.Kyrenia.lng, CITIES.Kyrenia.lat],
    db_category: 'avto',
    upload: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
      {
        id: 2,
        uploads: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop&q=80',
        sort_order: 3000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 120,
    lifts: 5,
    top: 7,
    vip: 10,
    brand: 'Toyota',
    model: 'Camry',
    year: 2018,
    mileage: 50000,
    gas: 'Petrol',
    transmission: true, // Automatic
    isUsed: true,
  });

  ads.push({
    id: id++,
    title: 'BMW X5 2020 - Premium Package',
    title_en: 'BMW X5 2020 - Premium Package',
    title_ru: 'BMW X5 2020 - Премиум комплектация',
    title_tr: 'BMW X5 2020 - Premium Paket',
    description: 'Full options, leather interior, navigation system, warranty included.',
    description_en: 'Full options, leather interior, navigation system, warranty included.',
    description_ru: 'Полная комплектация, кожаный салон, навигационная система, гарантия включена.',
    description_tr: 'Tam donanım, deri iç mekan, navigasyon sistemi, garanti dahil.',
    price: 55000,
    currency: 'EUR',
    owner: userIds[4], // seller1@example.com
    city: CITIES.Nicosia.name,
    address: `${CITIES.Nicosia.name}, Premium Cars, 100`,
    geocode: CITIES.Nicosia.geocode,
    geo_indexed: [CITIES.Nicosia.lng, CITIES.Nicosia.lat],
    db_category: 'avto',
    upload: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
      {
        id: 2,
        uploads: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop&q=80',
        sort_order: 3000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 250,
    lifts: 8,
    top: 5,
    vip: 15,
    brand: 'BMW',
    model: 'X5',
    year: 2020,
    mileage: 30000,
    gas: 'Diesel',
    transmission: true,
    isUsed: false,
  });

  // ========== WORK (Работа) ==========
  ads.push({
    id: id++,
    title: 'Python Developer - Remote Work',
    title_en: 'Python Developer - Remote Work',
    title_ru: 'Python разработчик - Удаленная работа',
    title_tr: 'Python Geliştirici - Uzaktan Çalışma',
    description: 'Full-time remote position, 3+ years experience required. Competitive salary.',
    description_en: 'Full-time remote position, 3+ years experience required. Competitive salary.',
    description_ru: 'Полная занятость, удаленная работа, требуется опыт 3+ года. Конкурентная зарплата.',
    description_tr: 'Tam zamanlı uzaktan pozisyon, 3+ yıl deneyim gerekli. Rekabetçi maaş.',
    price: 5000,
    currency: 'EUR',
    owner: userIds[1], // john@example.com
    city: CITIES.Nicosia.name,
    address: `${CITIES.Nicosia.name}, IT Company Office`,
    geocode: CITIES.Nicosia.geocode,
    geo_indexed: [CITIES.Nicosia.lng, CITIES.Nicosia.lat],
    db_category: 'work',
    upload: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 180,
    lifts: 3,
    top: 5,
    vip: 0,
    employment: 'Full-time',
    workType: true, // Remote
  });

  ads.push({
    id: id++,
    title: 'Restaurant Manager - Kyrenia',
    title_en: 'Restaurant Manager - Kyrenia',
    title_ru: 'Менеджер ресторана - Кирения',
    title_tr: 'Restoran Müdürü - Girne',
    description: 'Experienced restaurant manager needed. Must speak English and Turkish.',
    description_en: 'Experienced restaurant manager needed. Must speak English and Turkish.',
    description_ru: 'Требуется опытный менеджер ресторана. Должен говорить на английском и турецком.',
    description_tr: 'Deneyimli restoran müdürü aranıyor. İngilizce ve Türkçe konuşmalı.',
    price: 2000,
    currency: 'EUR',
    owner: userIds[2], // jane@example.com
    city: CITIES.Kyrenia.name,
    address: `${CITIES.Kyrenia.name}, Restaurant District`,
    geocode: CITIES.Kyrenia.geocode,
    geo_indexed: [CITIES.Kyrenia.lng, CITIES.Kyrenia.lat],
    db_category: 'work',
    upload: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 95,
    lifts: 1,
    top: 2,
    vip: 0,
    employment: 'Full-time',
    workType: false, // On-site
  });

  // ========== SERVICES (Услуги) ==========
  ads.push({
    id: id++,
    title: 'Computer Repair Service',
    title_en: 'Computer Repair Service',
    title_ru: 'Ремонт компьютеров',
    title_tr: 'Bilgisayar Tamir Hizmeti',
    description: 'Professional PC and laptop repair. Home service available. Fast and reliable.',
    description_en: 'Professional PC and laptop repair. Home service available. Fast and reliable.',
    description_ru: 'Профессиональный ремонт ПК и ноутбуков. Выезд на дом. Быстро и надежно.',
    description_tr: 'Profesyonel PC ve laptop tamiri. Ev servisi mevcut. Hızlı ve güvenilir.',
    price: 50,
    currency: 'EUR',
    owner: userIds[3], // test@example.com
    city: CITIES.Famagusta.name,
    address: `${CITIES.Famagusta.name}, Tech Street, 88`,
    geocode: CITIES.Famagusta.geocode,
    geo_indexed: [CITIES.Famagusta.lng, CITIES.Famagusta.lat],
    db_category: 'services',
    upload: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 65,
    lifts: 2,
    top: 0,
    vip: 0,
  });

  ads.push({
    id: id++,
    title: 'House Cleaning Service',
    title_en: 'House Cleaning Service',
    title_ru: 'Услуги по уборке дома',
    title_tr: 'Ev Temizlik Hizmeti',
    description: 'Professional cleaning service for homes and offices. Weekly or one-time cleaning available.',
    description_en: 'Professional cleaning service for homes and offices. Weekly or one-time cleaning available.',
    description_ru: 'Профессиональная уборка домов и офисов. Еженедельная или разовая уборка.',
    description_tr: 'Evler ve ofisler için profesyonel temizlik hizmeti. Haftalık veya tek seferlik temizlik mevcut.',
    price: 80,
    currency: 'EUR',
    owner: userIds[4], // seller1@example.com
    city: CITIES.Kyrenia.name,
    address: `${CITIES.Kyrenia.name}, Service Area`,
    geocode: CITIES.Kyrenia.geocode,
    geo_indexed: [CITIES.Kyrenia.lng, CITIES.Kyrenia.lat],
    db_category: 'services',
    upload: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 42,
    lifts: 1,
    top: 0,
    vip: 0,
  });

  // ========== CHILDREN (Детские товары) ==========
  ads.push({
    id: id++,
    title: 'Transformable Baby Stroller',
    title_en: 'Transformable Baby Stroller',
    title_ru: 'Трансформируемая детская коляска',
    title_tr: 'Dönüştürülebilir Bebek Arabası',
    description: 'Excellent condition, all accessories included. Suitable for newborns to 3 years.',
    description_en: 'Excellent condition, all accessories included. Suitable for newborns to 3 years.',
    description_ru: 'Отличное состояние, все аксессуары включены. Подходит для новорожденных до 3 лет.',
    description_tr: 'Mükemmel durum, tüm aksesuarlar dahil. Yenidoğanlardan 3 yaşına kadar uygundur.',
    price: 200,
    currency: 'EUR',
    owner: userIds[2], // jane@example.com
    city: CITIES.Nicosia.name,
    address: `${CITIES.Nicosia.name}, Residential Area, 15`,
    geocode: CITIES.Nicosia.geocode,
    geo_indexed: [CITIES.Nicosia.lng, CITIES.Nicosia.lat],
    db_category: 'children',
    upload: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 35,
    lifts: 0,
    top: 0,
    vip: 0,
  });

  // ========== ELECTRONICS (Электроника) ==========
  ads.push({
    id: id++,
    title: 'iPhone 14 Pro Max 256GB',
    title_en: 'iPhone 14 Pro Max 256GB',
    title_ru: 'iPhone 14 Pro Max 256GB',
    title_tr: 'iPhone 14 Pro Max 256GB',
    description: 'Brand new, in box, warranty included. Unlocked, all accessories.',
    description_en: 'Brand new, in box, warranty included. Unlocked, all accessories.',
    description_ru: 'Новый, в коробке, гарантия включена. Разблокирован, все аксессуары.',
    description_tr: 'Sıfır, kutuda, garanti dahil. Kilit açık, tüm aksesuarlar.',
    price: 1200,
    currency: 'EUR',
    owner: userIds[0], // admin@kibtop.com
    city: CITIES.Kyrenia.name,
    address: `${CITIES.Kyrenia.name}, Tech Store, 50`,
    geocode: CITIES.Kyrenia.geocode,
    geo_indexed: [CITIES.Kyrenia.lng, CITIES.Kyrenia.lat],
    db_category: 'electronics',
    upload: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 150,
    lifts: 4,
    top: 0,
    vip: 5,
  });

  ads.push({
    id: id++,
    title: 'Samsung 55" 4K Smart TV',
    title_en: 'Samsung 55" 4K Smart TV',
    title_ru: 'Samsung 55" 4K Smart TV',
    title_tr: 'Samsung 55" 4K Smart TV',
    description: 'Like new, used for 6 months only. All original accessories and remote included.',
    description_en: 'Like new, used for 6 months only. All original accessories and remote included.',
    description_ru: 'Как новый, использовался только 6 месяцев. Все оригинальные аксессуары и пульт включены.',
    description_tr: 'Yeni gibi, sadece 6 ay kullanıldı. Tüm orijinal aksesuarlar ve uzaktan kumanda dahil.',
    price: 800,
    currency: 'EUR',
    owner: userIds[1], // john@example.com
    city: CITIES.Famagusta.name,
    address: `${CITIES.Famagusta.name}, Electronics Market`,
    geocode: CITIES.Famagusta.geocode,
    geo_indexed: [CITIES.Famagusta.lng, CITIES.Famagusta.lat],
    db_category: 'electronics',
    upload: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 88,
    lifts: 1,
    top: 0,
    vip: 0,
  });

  // ========== FASHION (Мода) ==========
  ads.push({
    id: id++,
    title: 'Men\'s Leather Jacket - Italian',
    title_en: 'Men\'s Leather Jacket - Italian',
    title_ru: 'Мужская кожаная куртка - Итальянская',
    title_tr: 'Erkek Deri Ceket - İtalyan',
    description: 'Italian leather, size 52, excellent condition. Classic style.',
    description_en: 'Italian leather, size 52, excellent condition. Classic style.',
    description_ru: 'Итальянская кожа, размер 52, отличное состояние. Классический стиль.',
    description_tr: 'İtalyan deri, 52 beden, mükemmel durum. Klasik stil.',
    price: 250,
    currency: 'EUR',
    owner: userIds[3], // test@example.com
    city: CITIES.Nicosia.name,
    address: `${CITIES.Nicosia.name}, Fashion Street, 30`,
    geocode: CITIES.Nicosia.geocode,
    geo_indexed: [CITIES.Nicosia.lng, CITIES.Nicosia.lat],
    db_category: 'fashion',
    upload: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 55,
    lifts: 1,
    top: 0,
    vip: 0,
  });

  // ========== HOUSE_GARDEN (Дом и сад) ==========
  ads.push({
    id: id++,
    title: 'Corner Sofa - Brand New',
    title_en: 'Corner Sofa - Brand New',
    title_ru: 'Угловой диван - Новый',
    title_tr: 'Köşe Koltuk - Sıfır',
    description: 'New sofa, never used, still in packaging. Modern design, comfortable.',
    description_en: 'New sofa, never used, still in packaging. Modern design, comfortable.',
    description_ru: 'Новый диван, никогда не использовался, еще в упаковке. Современный дизайн, удобный.',
    description_tr: 'Yeni koltuk, hiç kullanılmadı, hala paketinde. Modern tasarım, rahat.',
    price: 800,
    currency: 'EUR',
    owner: userIds[4], // seller1@example.com
    city: CITIES.Kyrenia.name,
    address: `${CITIES.Kyrenia.name}, Furniture Store, 75`,
    geocode: CITIES.Kyrenia.geocode,
    geo_indexed: [CITIES.Kyrenia.lng, CITIES.Kyrenia.lat],
    db_category: 'house_garden',
    upload: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
      {
        id: 2,
        uploads: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&h=800&fit=crop&q=80',
        sort_order: 3000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 40,
    lifts: 0,
    top: 0,
    vip: 0,
  });

  // ========== FREE (Бесплатные) ==========
  ads.push({
    id: id++,
    title: 'Free Books Collection',
    title_en: 'Free Books Collection',
    title_ru: 'Бесплатная коллекция книг',
    title_tr: 'Ücretsiz Kitap Koleksiyonu',
    description: 'Book collection, free to take. Pickup only. Various genres available.',
    description_en: 'Book collection, free to take. Pickup only. Various genres available.',
    description_ru: 'Коллекция книг, бесплатно. Только самовывоз. Различные жанры.',
    description_tr: 'Kitap koleksiyonu, ücretsiz alınabilir. Sadece teslim alınabilir. Çeşitli türler mevcut.',
    price: 0,
    currency: 'EUR',
    owner: userIds[2], // jane@example.com
    city: CITIES.Famagusta.name,
    address: `${CITIES.Famagusta.name}, Library Area, 20`,
    geocode: CITIES.Famagusta.geocode,
    geo_indexed: [CITIES.Famagusta.lng, CITIES.Famagusta.lat],
    db_category: 'free',
    upload: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=800&fit=crop&q=80',
    full_upload: [
      {
        id: 0,
        uploads: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=800&fit=crop&q=80',
        sort_order: 1000,
        full_upload: 1,
      },
      {
        id: 1,
        uploads: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&q=80',
        sort_order: 2000,
        full_upload: 1,
      },
    ],
    created_at: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    views: 60,
    lifts: 0,
    top: 0,
    vip: 0,
  });

  return ads;
}

// ============================================
// 2. SEED FAVORITES (fav)
// ============================================
function generateFavorites(adIds: number[], userIds: string[]): any[] {
  return [
    {
      user: userIds[0], // admin@kibtop.com
      ids: [adIds[0], adIds[2], adIds[8]], // Realty, Avto, Electronics
    },
    {
      user: userIds[1], // john@example.com
      ids: [adIds[1], adIds[4], adIds[9]], // Realty, Work, Electronics
    },
    {
      user: userIds[2], // jane@example.com
      ids: [adIds[3], adIds[6], adIds[11]], // Avto, Children, Free
    },
    {
      user: userIds[3], // test@example.com
      ids: [adIds[5], adIds[7]], // Work, Services
    },
    {
      user: userIds[4], // seller1@example.com
      ids: [adIds[0], adIds[2], adIds[4], adIds[10]], // Multiple favorites
    },
  ];
}

// ============================================
// 3. SEED SEARCH QUERIES (search)
// ============================================
function generateSearchQueries(): any[] {
  return [
    { text: 'apartment', times: 250 },
    { text: 'car', times: 320 },
    { text: 'iphone', times: 180 },
    { text: 'job', times: 200 },
    { text: 'villa', times: 150 },
    { text: 'toyota', times: 140 },
    { text: 'bmw', times: 130 },
    { text: 'computer repair', times: 90 },
    { text: 'baby stroller', times: 85 },
    { text: 'sofa', times: 100 },
    { text: 'leather jacket', times: 70 },
    { text: 'books', times: 60 },
    { text: 'cleaning service', times: 80 },
    { text: 'restaurant manager', times: 55 },
    { text: 'python developer', times: 120 },
    { text: 'real estate', times: 220 },
    { text: 'electronics', times: 160 },
    { text: 'fashion', times: 95 },
    { text: 'house garden', times: 75 },
    { text: 'free', times: 50 },
  ];
}

// ============================================
// 4. SEED ARCHIVE (archive)
// ============================================
function generateArchiveItems(userIds: string[]): any[] {
  const oldDate1 = new Date();
  oldDate1.setDate(oldDate1.getDate() - 60); // 60 days ago

  const oldDate2 = new Date();
  oldDate2.setDate(oldDate2.getDate() - 45); // 45 days ago

  const oldDate3 = new Date();
  oldDate3.setDate(oldDate3.getDate() - 30); // 30 days ago

  return [
    {
      id: 1001,
      title: 'Old Laptop - Sold',
      title_en: 'Old Laptop - Sold',
      title_ru: 'Старый ноутбук - Продано',
      title_tr: 'Eski Laptop - Satıldı',
      description: 'This item was sold and moved to archive.',
      description_en: 'This item was sold and moved to archive.',
      description_ru: 'Этот товар был продан и перемещен в архив.',
      description_tr: 'Bu ürün satıldı ve arşive taşındı.',
      price: 300,
      currency: 'EUR',
      owner: userIds[0],
      city: CITIES.Kyrenia.name,
      address: `${CITIES.Kyrenia.name}, Old Address`,
      geocode: CITIES.Kyrenia.geocode,
      geo_indexed: [CITIES.Kyrenia.lng, CITIES.Kyrenia.lat],
      db_category: 'electronics',
      upload: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=800&fit=crop&q=80',
      full_upload: [
        {
          id: 0,
          uploads: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=800&fit=crop&q=80',
          sort_order: 1000,
          full_upload: 1,
        },
      ],
      created_at: oldDate1.toISOString(),
      updated_at: null,
      views: 25,
      lifts: 0,
      top: 0,
      vip: 0,
    },
    {
      id: 1002,
      title: 'Old Furniture Set',
      title_en: 'Old Furniture Set',
      title_ru: 'Старый мебельный гарнитур',
      title_tr: 'Eski Mobilya Takımı',
      description: 'Archived item - no longer available.',
      description_en: 'Archived item - no longer available.',
      description_ru: 'Архивный товар - больше не доступен.',
      description_tr: 'Arşivlenmiş ürün - artık mevcut değil.',
      price: 150,
      currency: 'EUR',
      owner: userIds[1],
      city: CITIES.Nicosia.name,
      address: `${CITIES.Nicosia.name}, Old Location`,
      geocode: CITIES.Nicosia.geocode,
      geo_indexed: [CITIES.Nicosia.lng, CITIES.Nicosia.lat],
      db_category: 'house_garden',
      upload: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&q=80',
      full_upload: [
        {
          id: 0,
          uploads: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&q=80',
          sort_order: 1000,
          full_upload: 1,
        },
      ],
      created_at: oldDate2.toISOString(),
      updated_at: null,
      views: 18,
      lifts: 0,
      top: 0,
      vip: 0,
    },
    {
      id: 1003,
      title: 'Old Clothing Items',
      title_en: 'Old Clothing Items',
      title_ru: 'Старые предметы одежды',
      title_tr: 'Eski Giyim Eşyaları',
      description: 'Archived - item was removed.',
      description_en: 'Archived - item was removed.',
      description_ru: 'Архивировано - товар был удален.',
      description_tr: 'Arşivlendi - ürün kaldırıldı.',
      price: 50,
      currency: 'EUR',
      owner: userIds[2],
      city: CITIES.Famagusta.name,
      address: `${CITIES.Famagusta.name}, Archive Location`,
      geocode: CITIES.Famagusta.geocode,
      geo_indexed: [CITIES.Famagusta.lng, CITIES.Famagusta.lat],
      db_category: 'fashion',
      upload: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop&q=80',
      full_upload: [
        {
          id: 0,
          uploads: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop&q=80',
          sort_order: 1000,
          full_upload: 1,
        },
      ],
      created_at: oldDate3.toISOString(),
      updated_at: null,
      views: 12,
      lifts: 0,
      top: 0,
      vip: 0,
    },
  ];
}

// ============================================
// MAIN SEEDING FUNCTION
// ============================================
async function seedMongoDB() {
  const mongoUrl = process.env.MONGODB_URL || '';
  const dbName = process.env.MONGODB_DB_NAME || 'advert_adverts';

  if (!mongoUrl) {
    console.error('❌ Error: MONGODB_URL is not set');
    console.error('Please set MONGODB_URL in .env file');
    process.exit(1);
  }

  const client = new MongoClient(mongoUrl, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const db = client.db(dbName);
    console.log(`📦 Using database: ${dbName}`);

    // Check if --clear flag is provided
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      console.log('\n🗑️  Clearing existing collections...');
      await db.collection('advs').deleteMany({});
      await db.collection('fav').deleteMany({});
      await db.collection('search').deleteMany({});
      await db.collection('archive').deleteMany({});
      console.log('✅ Collections cleared!');
    }

    const userIds = getUserIds();
    console.log(`\n👥 Using ${userIds.length} test user IDs`);

    // ============================================
    // 1. SEED ADVERTISEMENTS
    // ============================================
    console.log('\n📝 Seeding advertisements...');
    const advertisements = generateAdvertisements(userIds);
    const advResult = await db.collection('advs').insertMany(advertisements);
    console.log(`✅ Inserted ${advResult.insertedCount} advertisements`);
    const adIds = advertisements.map((ad) => ad.id);

    // ============================================
    // 2. SEED FAVORITES
    // ============================================
    console.log('\n⭐ Seeding favorites...');
    const favorites = generateFavorites(adIds, userIds);
    const favResult = await db.collection('fav').insertMany(favorites);
    console.log(`✅ Inserted ${favResult.insertedCount} favorite entries`);

    // ============================================
    // 3. SEED SEARCH QUERIES
    // ============================================
    console.log('\n🔍 Seeding search queries...');
    const searchQueries = generateSearchQueries();
    const searchResult = await db.collection('search').insertMany(searchQueries);
    console.log(`✅ Inserted ${searchResult.insertedCount} search queries`);

    // ============================================
    // 4. SEED ARCHIVE
    // ============================================
    console.log('\n📦 Seeding archive...');
    const archiveItems = generateArchiveItems(userIds);
    const archiveResult = await db.collection('archive').insertMany(archiveItems);
    console.log(`✅ Inserted ${archiveResult.insertedCount} archive items`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database seeding completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 Summary:');
    console.log(`   📝 Advertisements: ${advResult.insertedCount}`);
    console.log(`   ⭐ Favorites: ${favResult.insertedCount}`);
    console.log(`   🔍 Search queries: ${searchResult.insertedCount}`);
    console.log(`   📦 Archive items: ${archiveResult.insertedCount}`);
    console.log(`   📈 Total documents: ${advResult.insertedCount + favResult.insertedCount + searchResult.insertedCount + archiveResult.insertedCount}`);

    console.log('\n📋 Categories breakdown:');
    const categoryCounts: Record<string, number> = {};
    advertisements.forEach((ad) => {
      categoryCounts[ad.db_category] = (categoryCounts[ad.db_category] || 0) + 1;
    });
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} ads`);
    });

  } catch (error: any) {
    console.error('\n❌ Error seeding database:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed.');
  }
}

// Run seed
seedMongoDB().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
