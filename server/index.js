import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'shm',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'shm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let mysqlConnected = false;

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

let redisConnected = false;

redis.on('connect', () => {
  redisConnected = true;
});

redis.on('error', () => {
  redisConnected = false;
});

const DEFAULT_BRANDING = {
  appName: 'SHM Admin',
  appTitle: 'SHM Admin',
  logoUrl: '',
  primaryColor: '#22d3ee',
  loginTitle: 'SHM Admin',
  loginSubtitle: 'Добро пожаловать',
};

async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    const [rows] = await connection.execute(
      'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
      ['branding']
    );
    
    if (rows.length === 0) {
      await connection.execute(
        'INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?)',
        ['branding', JSON.stringify(DEFAULT_BRANDING)]
      );
    }
    
    connection.release();
    mysqlConnected = true;
  } catch (error) {
    mysqlConnected = false;
  }
}

initDatabase();

app.use(cors());
app.use(express.json());

const CACHE_PREFIX = 'shm-admin:cache:';
const BRANDING_CACHE_KEY = 'shm-admin:branding';

app.get('/api/branding', async (req, res) => {
  try {
    if (redisConnected) {
      const cached = await redis.get(BRANDING_CACHE_KEY);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
    
    if (mysqlConnected) {
      const [rows] = await pool.execute(
        'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
        ['branding']
      );
      
      if (rows.length > 0) {
        const branding = rows[0].setting_value;
        
        if (redisConnected) {
          await redis.setex(BRANDING_CACHE_KEY, 3600, JSON.stringify(branding));
        }
        
        return res.json(branding);
      }
    }
    
    res.json(DEFAULT_BRANDING);
  } catch (error) {
    res.json(DEFAULT_BRANDING);
  }
});

app.post('/api/branding', async (req, res) => {
  try {
    const branding = { ...DEFAULT_BRANDING, ...req.body };
    
    if (mysqlConnected) {
      await pool.execute(
        `INSERT INTO admin_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        ['branding', JSON.stringify(branding), JSON.stringify(branding)]
      );
      
      if (redisConnected) {
        await redis.del(BRANDING_CACHE_KEY);
      }
      
      return res.json({ success: true, data: branding });
    }
    
    res.status(500).json({ success: false, error: 'Database not connected' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save branding' });
  }
});

app.delete('/api/branding', async (req, res) => {
  try {
    if (mysqlConnected) {
      await pool.execute(
        'UPDATE admin_settings SET setting_value = ? WHERE setting_key = ?',
        [JSON.stringify(DEFAULT_BRANDING), 'branding']
      );
      
      if (redisConnected) {
        await redis.del(BRANDING_CACHE_KEY);
      }
      
      return res.json({ success: true, data: DEFAULT_BRANDING });
    }
    
    res.status(500).json({ success: false, error: 'Database not connected' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reset branding' });
  }
});

app.get('/api/settings/:key', async (req, res) => {
  try {
    if (mysqlConnected) {
      const [rows] = await pool.execute(
        'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
        [req.params.key]
      );
      
      if (rows.length > 0) {
        return res.json({ data: rows[0].setting_value, found: true });
      }
    }
    
    res.json({ data: null, found: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get setting' });
  }
});

app.post('/api/settings/:key', async (req, res) => {
  try {
    if (mysqlConnected) {
      await pool.execute(
        `INSERT INTO admin_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [req.params.key, JSON.stringify(req.body.value), JSON.stringify(req.body.value)]
      );
      
      return res.json({ success: true });
    }
    
    res.status(500).json({ success: false, error: 'Database not connected' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save setting' });
  }
});

app.get('/api/cache/:key', async (req, res) => {
  try {
    if (!redisConnected) {
      return res.json({ data: null, cached: false });
    }
    
    const key = CACHE_PREFIX + req.params.key;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json({ data: JSON.parse(cached), cached: true });
    }
    
    res.json({ data: null, cached: false });
  } catch (error) {
    res.json({ data: null, cached: false });
  }
});

app.post('/api/cache/:key', async (req, res) => {
  try {
    if (!redisConnected) {
      return res.json({ success: false, error: 'Redis not connected' });
    }
    
    const key = CACHE_PREFIX + req.params.key;
    const { data, ttl = 300 } = req.body; 
    
    await redis.setex(key, ttl, JSON.stringify(data));
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to set cache' });
  }
});

app.delete('/api/cache/:key', async (req, res) => {
  try {
    if (!redisConnected) {
      return res.json({ success: true });
    }
    
    const key = CACHE_PREFIX + req.params.key;
    await redis.del(key);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete cache' });
  }
});

app.delete('/api/cache', async (req, res) => {
  try {
    if (!redisConnected) {
      return res.json({ success: true, deleted: 0 });
    }
    
    const keys = await redis.keys(CACHE_PREFIX + '*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    res.json({ success: true, deleted: keys.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to clear cache' });
  }
});

app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    mysql: mysqlConnected,
    redis: redisConnected,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT);
