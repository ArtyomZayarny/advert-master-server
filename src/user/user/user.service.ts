import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';
import { POSTGRES_POOL } from '../../database/database.module';
import { User } from '@app/common';

@Injectable()
export class UserService {
  constructor(@Inject(POSTGRES_POOL) private pool: Pool) {}

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
}
