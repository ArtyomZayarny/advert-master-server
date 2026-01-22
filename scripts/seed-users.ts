import { Pool } from 'pg';
import { createHash } from 'crypto';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables manually (dotenv may not be installed)
try {
  const envPath = resolve(__dirname, '../.env');
  const envFile = readFileSync(envPath, 'utf-8');
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
} catch (error) {
  console.warn('⚠️  Could not load .env file, using environment variables');
}

interface TestUser {
  username: string;
  email: string;
  phone: string;
  first_name: string;
  address: string;
  password: string;
  is_superuser?: boolean;
}

const testUsers: TestUser[] = [
  {
    username: 'admin',
    email: 'admin@kibtop.com',
    phone: '+905551234567',
    first_name: 'Admin',
    address: 'Kyrenia, Northern Cyprus',
    password: 'admin123',
    is_superuser: true,
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    phone: '+905551234568',
    first_name: 'John',
    address: 'Nicosia, Northern Cyprus',
    password: 'password123',
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    phone: '+905551234569',
    first_name: 'Jane',
    address: 'Famagusta, Northern Cyprus',
    password: 'password123',
  },
  {
    username: 'test_user',
    email: 'test@example.com',
    phone: '+905551234570',
    first_name: 'Test',
    address: 'Lefkosa, Northern Cyprus',
    password: 'test123',
  },
  {
    username: 'seller1',
    email: 'seller1@example.com',
    phone: '+905551234571',
    first_name: 'Seller',
    address: 'Girne, Northern Cyprus',
    password: 'seller123',
  },
];

async function seedUsers() {
  const postgresUrl = process.env.POSTGRES_URL;
  
  let pool: Pool;
  
  if (postgresUrl && postgresUrl.trim()) {
    console.log('🔍 Using POSTGRES_URL for connection');
    pool = new Pool({
      connectionString: postgresUrl.trim(),
    });
  } else {
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = parseInt(process.env.POSTGRES_PORT || '5432', 10);
    const user = process.env.POSTGRES_USER || 'advert';
    const password = process.env.POSTGRES_PASSWORD || 'advert123';
    const database = process.env.POSTGRES_DB || 'advert_auth';
    
    // Check if it's a cloud provider (Neon, AWS RDS, etc.)
    const isNeon = host.includes('neon.tech') || host.includes('aws.neon.tech');
    const isCloudProvider = isNeon || host.includes('.rds.amazonaws.com') || host.includes('.cloud');
    
    pool = new Pool({
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
      ssl: isCloudProvider ? {
        rejectUnauthorized: false,
      } : undefined,
    });
  }

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');

    // Ensure users table exists
    await pool.query(`
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
    console.log('✅ Users table ready');

    let created = 0;
    let skipped = 0;

    for (const userData of testUsers) {
      try {
        // Hash email to get user ID (same as in AuthService)
        const userId = createHash('sha256').update(userData.email).digest('hex');
        
        // Hash password (same as in AuthService)
        const hashedPassword = createHash('sha256').update(userData.password).digest('hex');

        // Check if user already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
        
        if (existingUser.rows.length > 0) {
          console.log(`⏭️  User ${userData.username} (${userData.email}) already exists, skipping...`);
          skipped++;
          continue;
        }

        // Insert user
        await pool.query(
          `INSERT INTO users (id, username, email, phone, first_name, address, upload_user, deals, password, re_password, is_superuser) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            userId,
            userData.username,
            userData.email,
            userData.phone,
            userData.first_name,
            userData.address,
            '', // upload_user
            0, // deals
            hashedPassword,
            '', // re_password
            userData.is_superuser || false,
          ],
        );

        console.log(`✅ Created user: ${userData.username} (${userData.email})`);
        console.log(`   Password: ${userData.password}`);
        created++;
      } catch (error: any) {
        if (error.code === '23505') {
          // Duplicate key error
          console.log(`⏭️  User ${userData.username} already exists, skipping...`);
          skipped++;
        } else {
          console.error(`❌ Error creating user ${userData.username}:`, error.message);
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created} users`);
    console.log(`   Skipped: ${skipped} users (already exist)`);
    console.log(`   Total: ${testUsers.length} users\n`);

    console.log('🔑 Test users credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach((user) => {
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   ${user.is_superuser ? '👑 Admin' : '👤 User'}`);
      console.log('   ──────────────────────────────────────────────────────');
    });

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedUsers();
