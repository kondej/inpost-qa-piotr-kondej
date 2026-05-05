import { test, expect } from '@playwright/test'

/**
 * TASK 06 — API testing
 *
 * Documentation: http://localhost:3000/challenges/api-testing
 * Auth token: test-token-inpost-2026
 */

const TOKEN = 'test-token-inpost-2026';

test.use({
  baseURL: 'http://localhost:3000',
  extraHTTPHeaders: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

// ---------------------------------------------------------------------------
// Version A — Recruitment
// Test the POST /api/parcels endpoint.
// ---------------------------------------------------------------------------

test.describe('POST /api/parcels', () => {
  test('successfully create a new parcel with valid data', async ({ request }) => {
    const payload = {
      recipientName: 'Anna Nowak',
      recipientEmail: 'anna@example.com',
      size: 'A',
      deliveryType: 'LOCKER',
      lockerCode: 'WAW123'
    };

    const response = await request.post('/api/parcels', {
      data: payload
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.recipientEmail).toBe(payload.recipientEmail);
    expect(body.status).toBe('CREATED');
  });

  test('return 400 Bad Request when required fields are missing', async ({ request }) => {

    const invalidPayload = {
      recipientName: 'Anna Nowak',
      deliveryType: 'LOCKER'
    };

    const response = await request.post('/api/parcels', {
      data: invalidPayload
    });

    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('return 401 Unauthorized with missing token', async ({ request }) => {
    const response = await request.post('/api/parcels', {
      headers: { 
        Authorization: '' 
      }, 

      data: {
        recipientName: 'Anna Nowak',
        recipientEmail: 'anna@example.com',
        size: 'A',
        deliveryType: 'LOCKER',
        lockerCode: 'WAW123'
      }
    });

    expect(response.status()).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Version B — Internship
// Test the full update flow: create a parcel and update it with PATCH
// ---------------------------------------------------------------------------

test.describe('PATCH /api/parcels', () => {
  let parcelId: string;

  test.beforeEach(async ({ request }) => {
    const createRes = await request.post('/api/parcels', {
      data: {
        recipientName: 'Adam Kowalski',
        recipientEmail: 'adam@example.com',
        size: 'B',
        deliveryType: 'LOCKER',
        lockerCode: 'KRK001'
      }
    });
    
    expect(createRes.status()).toBe(201);
    const body = await createRes.json();
    parcelId = body.id;
  });

  test.afterEach(async ({ request }) => {
    if (parcelId) {
      await request.delete(`/api/parcels/${parcelId}`);
    }
  });

  test('update parcel size and delivery notes', async ({ request }) => {
    const updatePayload = {
      notes: 'Fragile package'
    };

    const patchRes = await request.patch(`/api/parcels/${parcelId}`, {
      data: updatePayload
    });

    expect(patchRes.status()).toBe(200);

    const body = await patchRes.json();
    expect(body.id).toBe(parcelId);
    expect(body.notes).toBe('Fragile package');

    const getRes = await request.get(`/api/parcels/${parcelId}`);
    const getBody = await getRes.json();
    expect(getBody.notes).toBe('Fragile package');
  });

  test('return 404 Not Found when updating a non-existent parcel', async ({ request }) => {
    const patchRes = await request.patch('/api/parcels/fake-uuid-999', {
      data: { notes: 'Does not matter' }
    });

    expect(patchRes.status()).toBe(404);
  });
});
