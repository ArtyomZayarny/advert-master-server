/**
 * Утилита для HTTP запросов между сервисами
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ServiceResponse } from '../interfaces/service.interface';

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string, timeout: number = 5000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ServiceResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Request failed',
        statusCode: error.response?.status || 500,
      };
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ServiceResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Request failed',
        statusCode: error.response?.status || 500,
      };
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ServiceResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Request failed',
        statusCode: error.response?.status || 500,
      };
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ServiceResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Request failed',
        statusCode: error.response?.status || 500,
      };
    }
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}
