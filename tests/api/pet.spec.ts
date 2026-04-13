import { test, expect } from '../../fixtures/test-base.js';
import { ApiClient } from '../../api/client.js';
import { PetEndpoint } from '../../api/endpoints/pet.endpoint.js';
import { PetSchema, PetListSchema, ApiMessageSchema } from '../../api/schemas/pet.schema.js';
import { faker } from '@faker-js/faker';

/**
 * Pet API test suite — full CRUD lifecycle + schema validation + error handling.
 *
 * Pattern: each test creates its own data, acts on it, and asserts.
 * No test depends on another test's state (fully isolated).
 *
 * Schema validation (Zod .parse()) runs on every response — this catches
 * contract drift between the API and our expectations, which is the
 * #1 reason API tests exist in a CI pipeline.
 */

test.describe('Pet API @api @regression', () => {
  let petApi: PetEndpoint;

  // Generate a unique pet ID per test run to avoid collisions
  // Petstore is a shared public API — other people are using it too
  const uniqueId = () => faker.number.int({ min: 100_000, max: 999_999 });

  test.beforeEach(({ apiClient }) => {
    petApi = new PetEndpoint(new ApiClient(apiClient));
  });

  test('should create a new pet (POST /pet)', async () => {
    const petId = uniqueId();
    const newPet = {
      id: petId,
      name: faker.animal.dog(),
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'available' as const,
      category: { id: 1, name: 'Dogs' },
      tags: [{ id: 1, name: 'friendly' }],
    };

    const response = await petApi.create(newPet);

    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);

    // Schema validation — proves the response matches our contract
    const parsed = PetSchema.parse(response.body);
    expect(parsed.name).toBe(newPet.name);
    expect(parsed.status).toBe('available');
  });

  test('should retrieve a pet by ID (GET /pet/{id})', async () => {
    // Arrange: create a pet first
    const petId = uniqueId();
    await petApi.create({
      id: petId,
      name: 'TestDog',
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'available' as const,
    });

    // Act: fetch it
    const response = await petApi.getById(petId);

    // Assert: status + schema + values
    expect(response.status).toBe(200);
    const pet = PetSchema.parse(response.body);
    expect(pet.id).toBe(petId);
    expect(pet.name).toBe('TestDog');
  });

  test('should update an existing pet (PUT /pet)', async () => {
    const petId = uniqueId();
    await petApi.create({
      id: petId,
      name: 'OriginalName',
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'available' as const,
    });

    // Act: update the name and status
    const response = await petApi.update({
      id: petId,
      name: 'UpdatedName',
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'sold',
    });

    expect(response.status).toBe(200);
    const updated = PetSchema.parse(response.body);
    expect(updated.name).toBe('UpdatedName');
    expect(updated.status).toBe('sold');
  });

  test('should delete a pet (DELETE /pet/{id})', async () => {
    const petId = uniqueId();
    await petApi.create({
      id: petId,
      name: 'ToBeDeleted',
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'available' as const,
    });

    // Act: delete
    const deleteResponse = await petApi.deleteById(petId);
    expect(deleteResponse.status).toBe(200);
    ApiMessageSchema.parse(deleteResponse.body);

    // Assert: fetching the deleted pet returns 404
    const getResponse = await petApi.getById(petId);
    expect(getResponse.status).toBe(404);
  });

  test('should find pets by status (GET /pet/findByStatus)', async () => {
    const response = await petApi.findByStatus('available');

    expect(response.status).toBe(200);

    // Schema validation on the array response
    const pets = PetListSchema.parse(response.body);
    expect(pets.length).toBeGreaterThan(0);

    // Every returned pet should have the requested status
    for (const pet of pets.slice(0, 10)) {
      expect(pet.status).toBe('available');
    }
  });

  test('should return 404 for non-existent pet', async () => {
    const response = await petApi.getById(999_999_999);

    expect(response.status).toBe(404);
  });

  test('should handle response time within acceptable threshold', async () => {
    const start = Date.now();
    const response = await petApi.findByStatus('available');
    const elapsed = Date.now() - start;

    expect(response.status).toBe(200);
    // API should respond within 5 seconds (generous for a public demo API)
    expect(elapsed).toBeLessThan(5_000);
  });
});
