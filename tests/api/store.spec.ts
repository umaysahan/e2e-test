import { test, expect } from '../../fixtures/test-base.js';
import { ApiClient } from '../../api/client.js';
import { StoreEndpoint } from '../../api/endpoints/store.endpoint.js';
import { OrderSchema, InventorySchema } from '../../api/schemas/store.schema.js';
import { faker } from '@faker-js/faker';

/**
 * Store API test suite — order lifecycle + inventory check.
 *
 * Demonstrates:
 * - Full CRUD lifecycle within a single test (create → read → delete)
 * - Schema validation on every response
 * - Verifying business logic (order status, inventory counts)
 */

test.describe('Store API @api @regression', () => {
  let storeApi: StoreEndpoint;
  const uniqueId = () => faker.number.int({ min: 1, max: 10 });

  test.beforeEach(({ apiClient }) => {
    storeApi = new StoreEndpoint(new ApiClient(apiClient));
  });

  test('should get store inventory (GET /store/inventory)', async () => {
    const response = await storeApi.getInventory();

    expect(response.status).toBe(200);

    // Inventory is a dynamic map — validate the shape, not exact values
    const inventory = InventorySchema.parse(response.body);
    // The inventory should have at least one status key
    expect(Object.keys(inventory).length).toBeGreaterThan(0);
  });

  test('should place an order (POST /store/order)', async () => {
    const orderId = uniqueId();
    const response = await storeApi.placeOrder({
      id: orderId,
      petId: 1,
      quantity: 2,
      shipDate: new Date().toISOString(),
      status: 'placed',
      complete: false,
    });

    expect(response.status).toBe(200);
    const order = OrderSchema.parse(response.body);
    expect(order.petId).toBe(1);
    expect(order.quantity).toBe(2);
    expect(order.status).toBe('placed');
  });

  test('should retrieve an order by ID (GET /store/order/{id})', async () => {
    const orderId = uniqueId();
    // Arrange: place an order
    await storeApi.placeOrder({
      id: orderId,
      petId: 5,
      quantity: 1,
      shipDate: new Date().toISOString(),
      status: 'placed',
      complete: false,
    });

    // Act: fetch it
    const response = await storeApi.getOrderById(orderId);

    expect(response.status).toBe(200);
    const order = OrderSchema.parse(response.body);
    expect(order.id).toBe(orderId);
    expect(order.petId).toBe(5);
  });

  test('should delete an order (DELETE /store/order/{id})', async () => {
    const orderId = uniqueId();
    await storeApi.placeOrder({
      id: orderId,
      petId: 3,
      quantity: 1,
      shipDate: new Date().toISOString(),
      status: 'placed',
      complete: false,
    });

    const deleteResponse = await storeApi.deleteOrder(orderId);
    expect(deleteResponse.status).toBe(200);

    // Verify: fetching the deleted order returns 404
    const getResponse = await storeApi.getOrderById(orderId);
    expect(getResponse.status).toBe(404);
  });

  test('should return 404 for non-existent order', async () => {
    // Petstore returns 404 for order IDs > 10 that don't exist
    const response = await storeApi.getOrderById(999_999);
    expect(response.status).toBe(404);
  });
});
