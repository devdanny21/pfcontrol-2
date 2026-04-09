import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('../../../server/db/version.js', () => ({
  getAppVersion: vi.fn(),
  updateAppVersion: vi.fn(),
}));

vi.mock('../../../server/db/connection.js', () => ({
  redisConnection: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

import { getAppVersion } from '../../../server/db/version.js';
import versionRouter from '../../../server/routes/version.js';

describe('GET /api/version', () => {
  const app = express();
  app.use('/', versionRouter);

  beforeEach(() => {
    vi.mocked(getAppVersion).mockReset();
  });

  it('returns version json', async () => {
    vi.mocked(getAppVersion).mockResolvedValue({
      version: '2.0.0',
      updated_at: '2024-01-01T00:00:00.000Z',
      updated_by: 'system',
    });

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.version).toBe('2.0.0');
  });
});
