import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('../../../server/db/sessions.js', () => ({
  getAllSessions: vi.fn(),
}));

import { getAllSessions } from '../../../server/db/sessions.js';
import sessionsRouter from '../../../server/routes/sessions.js';

describe('GET /api/sessions', () => {
  const app = express();
  app.use('/', sessionsRouter);

  beforeEach(() => {
    vi.mocked(getAllSessions).mockReset();
  });

  it('returns mapped session list', async () => {
    vi.mocked(getAllSessions).mockResolvedValue([
      {
        session_id: 'Ab12Cd34',
        airport_icao: 'EGLL',
        created_at: new Date(),
        created_by: 'u1',
        is_pfatc: false,
        active_runway: '09L',
      },
    ] as never);

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body[0].sessionId).toBe('Ab12Cd34');
    expect(res.body[0].airportIcao).toBe('EGLL');
  });
});
