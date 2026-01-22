/**
 * Общие типы для объявлений
 */

export type Currency = 'EUR' | 'GBP' | 'RUB';
export type Category = 
  | 'realty' 
  | 'avto' 
  | 'work' 
  | 'services' 
  | 'children' 
  | 'electronics' 
  | 'fashion' 
  | 'house_garden' 
  | 'free';

export interface Advert {
  id: number;
  title: string;
  title_en?: string;
  title_ru?: string;
  title_tr?: string;
  description: string;
  description_en?: string;
  description_ru?: string;
  description_tr?: string;
  price: number;
  currency: Currency;
  address: string;
  city: string;
  geocode: string; // "lat lng"
  geo_indexed: [number, number]; // [lng, lat] for MongoDB
  upload: string; // Main photo URL
  full_upload: Array<{
    id: number;
    uploads: string;
    sort_order: number;
    full_upload?: number;
  }>;
  db_category: Category;
  owner: string; // User ID
  created_at: string;
  updated_at: string | null;
  views?: number;
  top: number; // Days
  vip: number; // Days
  lifts: number; // Count
  // Category-specific fields
  // Realty
  square?: number;
  type_sell?: string;
  rooms?: string;
  floor?: number;
  condition?: string;
  isMonth?: boolean;
  // Auto
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  gas?: string;
  transmission?: boolean;
  isUsed?: boolean;
  // Job
  employment?: string;
  workType?: boolean;
}

export interface AdvertCreateDTO {
  title: string;
  description: string;
  price: number;
  currency: Currency;
  address: string;
  city: string;
  geocode: string;
  category: Category;
  // Category-specific
  square?: number;
  type_sell?: string;
  rooms?: string;
  floor?: number;
  condition?: string;
  isMonth?: boolean;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  gas?: string;
  transmission?: boolean;
  isUsed?: boolean;
  employment?: string;
  workType?: boolean;
}
