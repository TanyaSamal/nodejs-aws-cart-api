import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST || '',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});

const getDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const getStatus = (): string => {
  const n = Math.random();
  return n < 0.5 ? 'OPEN' : 'ORDERED';
};

const getCount = (): number => {
  const n = Math.random();
  return Math.trunc(n * 10);
};

async function populateTables(items: number) {
  try {
    await client.connect();

    console.log('Connected to database');

    await createTables();

    let cartId, userId;

    for (let i = 0; i < items; i++) {
      cartId = uuidv4();
      userId = uuidv4();

      await client.query(
        `
        INSERT INTO users (id, name, email, password)
        VALUES ($1, $2, $3, $4);
      `,
        [
          userId,
          `User name ${i + 1}`,
          `user${i + 1}@example.com`,
          `examplePass${i + 1}`,
        ],
      );

      await client.query(
        `
        INSERT INTO carts (id, user_id, created_at, updated_at, status)
        VALUES ($1, $2, $3, $4, $5);
      `,
        [cartId, userId, getDate(-1 * i), getDate(-1 * i), getStatus()],
      );

      await client.query(
        `
        INSERT INTO cart_items (cart_id, product_id, count)
        VALUES ($1, $2, $3);
      `,
        [cartId, uuidv4(), getCount()],
      );

      console.log(`Inserted cart ${i + 1} of ${items}`);
    }

    await addOrder([
      uuidv4(),
      userId,
      cartId,
      JSON.stringify({ method: 'Credit Card', details: 'Visa' }),
      JSON.stringify({
        address: '123 Main St',
        city: 'Tbilisi',
        country: 'Georgia',
      }),
      'Please deliver between 10am and 12pm.',
      'OPEN',
      100,
    ]);

    console.log('Data inserted successfully!');
  } catch (error) {
    console.error('Error populating tables:', error);
  } finally {
    await client.end();
  }
}

async function createTables() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS carts (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      created_at DATE NOT NULL,
      updated_at DATE NOT NULL,
      status VARCHAR(50) NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      cart_id UUID REFERENCES carts(id),
      product_id UUID NOT NULL,
      count INTEGER NOT NULL,
      PRIMARY KEY (cart_id, product_id)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      cart_id UUID NOT NULL REFERENCES carts(id),
      payment JSON,
      delivery JSON,
      comments TEXT,
      total NUMERIC,
      status TEXT
    );
  `);
}

async function addOrder(values) {
  await client.query(
    `
    INSERT INTO orders (
      id, user_id, cart_id, payment, delivery, comments, status, total
    ) VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8);
    `,
    values,
  );
}

populateTables(4).catch(console.error);
