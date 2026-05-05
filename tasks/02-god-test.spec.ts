import { test, expect } from "@playwright/test";

/**
 * TASK 02 — Refactor
 *
 * The test below works but is written poorly. Refactor it.
 */

const TOKEN = "test-token-inpost-2026";

test.use({
  baseURL: "http://localhost:3000",
  extraHTTPHeaders: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

test.describe("Parcel API Lifecycle", () => {
  let parcelId: string;

  test.afterEach(async ({ request }) => {
    if (parcelId) {
      const res = await request.delete(`/api/parcels/${parcelId}`);
      expect([204, 404]).toContain(res.status());
    }
  });

  test("complete the full parcel creation and delivery lifecycle", async ({ request }) => {
    
    await test.step("Create a new locker parcel", async () => {
      const createRes = await request.post("/api/parcels", {
        data: {
          recipientName: "Jan Kowalski",
          recipientEmail: "jan@example.com",
          size: "A",
          deliveryType: "LOCKER",
          lockerCode: "KRK001",
        },
      });
      
      expect(createRes.status()).toBe(201);
      
      const parcel = await createRes.json();
      expect(parcel).toHaveProperty("id");
      expect(parcel.recipientName).toBe("Jan Kowalski");
      
      parcelId = parcel.id; 
    });

    await test.step("Update parcel with delivery notes", async () => {
      const updateRes = await request.patch(`/api/parcels/${parcelId}`, {
        data: { notes: "Leave at the door" },
      });
      
      expect(updateRes.status()).toBe(200);
      
      const updatedParcel = await updateRes.json();
      expect(updatedParcel.notes).toBe("Leave at the door");
    });

    await test.step("Transition parcel status to IN_TRANSIT", async () => {
      const statusRes = await request.patch(`/api/parcels/${parcelId}/status`, {
        data: { status: "IN_TRANSIT" },
      });
      
      expect(statusRes.status()).toBe(200);
      
      const transitParcel = await statusRes.json();
      expect(transitParcel.status).toBe("IN_TRANSIT");
    });

    await test.step("Delete the parcel", async () => {
      const deleteRes = await request.delete(`/api/parcels/${parcelId}`);
      expect(deleteRes.status()).toBe(204);
      
      parcelId = ""; 
    });
  });
});
