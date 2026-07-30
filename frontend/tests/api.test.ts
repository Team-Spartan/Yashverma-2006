import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';
import { app } from '../src/index';
import type { AddressInfo } from 'net';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  baseUrl = `http://localhost:${port}`;
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('status');
    expect(data.data).toHaveProperty('uptime');
    expect(data.data).toHaveProperty('timestamp');
    expect(data.data).toHaveProperty('checks');
  });
});

describe('Auth Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPass123',
    firstName: 'Test',
    lastName: 'User',
  };

  it('should register a new user', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('accessToken');
    expect(data.data).toHaveProperty('refreshToken');
    expect(data.data.user.email).toBe(testUser.email);
  });

  it('should not register with duplicate email', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    expect(response.status).toBe(409);
  });

  it('should login successfully', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('accessToken');
    expect(data.data).toHaveProperty('refreshToken');
  });

  it('should reject invalid credentials', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' }),
    });

    expect(response.status).toBe(401);
  });

  it('should access protected route with token', async () => {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;

    const response = await fetch(`${baseUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe(testUser.email);
  });

  it('should reject unauthenticated access', async () => {
    const response = await fetch(`${baseUrl}/api/auth/profile`);
    expect(response.status).toBe(401);
  });

  it('should validate input', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '123' }),
    });

    expect(response.status).toBe(400);
  });
});

describe('User Endpoints (Admin)', () => {
  let adminToken: string;

  beforeAll(async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' }),
    });
    const data = await response.json();
    if (data.data?.accessToken) {
      adminToken = data.data.accessToken;
    }
  });

  it('should get all users', async () => {
    if (!adminToken) return;
    const response = await fetch(`${baseUrl}/api/users?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('meta');
    expect(data.meta).toHaveProperty('total');
    expect(data.meta).toHaveProperty('page');
  });

  it('should get user stats', async () => {
    if (!adminToken) return;
    const response = await fetch(`${baseUrl}/api/users/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveProperty('totalUsers');
  });

  it('should reject non-admin access', async () => {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'User@123' }),
    });
    const loginData = await loginRes.json();
    if (!loginData.data?.accessToken) return;
    const userToken = loginData.data.accessToken;

    const response = await fetch(`${baseUrl}/api/users`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    expect(response.status).toBe(403);
  });
});
