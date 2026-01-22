import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';
import { User } from '@app/common';

@Injectable()
export class UserService {
  constructor(@Inject(DATABASE_POOL) private pool: Pool) {}

  async createTable(): Promise<void> {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id           text PRIMARY KEY,
          username     text,
          email        text,
          phone        text,
          first_name   text,
          address      text,
          upload_user  text,
          deals        integer NOT NULL DEFAULT 0,
          password     text,
          re_password  text,
          is_superuser boolean DEFAULT false
        );
      `);
    } catch (e) {
      throw e;
    }
  }

  async get(id: string): Promise<User> {
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        throw new Error(`no user find with id - ${id}`);
      }

      return result.rows[0] as User;
    } catch (e) {
      throw e;
    }
  }

  async create(user: User): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO users (id, username, email, phone, first_name, address, upload_user, deals, password, re_password, is_superuser) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          user.id,
          user.username,
          user.email,
          user.phone,
          user.first_name,
          user.address,
          user.upload_user,
          user.deals,
          user.password,
          user.re_password,
          user.is_superuser,
        ],
      );
    } catch (e: any) {
      console.error('UserService.create error:', e);
      if (e.code === '23505') {
        // Duplicate key error
        throw new HttpException('user already exist', HttpStatus.BAD_REQUEST);
      }
      throw e;
    }
  }

  async updateAllUserData(user: User): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE users 
         SET phone = $1, address = $2, first_name = $3, upload_user = $4, email = $5 
         WHERE id = $6`,
        [user.phone, user.address, user.first_name, user.upload_user, user.email, user.id],
      );
    } catch (e) {
      throw e;
    }
  }

  async updatePassword(user_id: string, new_password: string): Promise<void> {
    try {
      await this.pool.query('UPDATE users SET password = $1 WHERE id = $2', [new_password, user_id]);
    } catch (e) {
      throw e;
    }
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE id = ANY($1)', [ids]);
      return result.rows as User[];
    } catch (e) {
      throw e;
    }
  }
}
