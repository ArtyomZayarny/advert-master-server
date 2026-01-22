/**
 * Общие типы для пользователей
 * Используются во всех сервисах
 */

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  address: string;
  upload_user: string;
  deals: number;
  password: string;
  re_password: string;
  is_superuser: boolean;
}

export interface UserPublic {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  first_name: string;
  address: string;
  upload_user: string;
  deals: number;
  is_superuser: boolean;
}

export interface JWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  access: string;
  refresh: string;
}
