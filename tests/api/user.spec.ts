import { test, expect } from '../../fixtures/test-base.js';
import { ApiClient } from '../../api/client.js';
import { UserEndpoint } from '../../api/endpoints/user.endpoint.js';
import { UserSchema, ApiMessageSchema } from '../../api/schemas/user.schema.js';
import { faker } from '@faker-js/faker';

/**
 * User API test suite — CRUD + auth (login) endpoint.
 *
 * Demonstrates:
 * - Creating test data with Faker (unique per run, no collisions)
 * - Full lifecycle: create → read → update → delete
 * - Auth endpoint testing (login returns a session token)
 */

test.describe('User API @api @regression', () => {
  let userApi: UserEndpoint;

  // Unique username per run avoids collisions on the shared Petstore API
  const uniqueUsername = () => `testuser_${faker.string.alphanumeric(8)}`;

  test.beforeEach(({ apiClient }) => {
    userApi = new UserEndpoint(new ApiClient(apiClient));
  });

  test('should create a new user (POST /user)', async () => {
    const username = uniqueUsername();
    const response = await userApi.create({
      username,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: 'TestPass123!',
      phone: faker.phone.number(),
      userStatus: 1,
    });

    expect(response.status).toBe(200);
    ApiMessageSchema.parse(response.body);
  });

  test('should retrieve a user by username (GET /user/{username})', async () => {
    const username = uniqueUsername();
    const firstName = faker.person.firstName();

    // Arrange: create user
    await userApi.create({
      username,
      firstName,
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: 'TestPass123!',
      phone: faker.phone.number(),
      userStatus: 1,
    });

    // Act: fetch by username
    const response = await userApi.getByUsername(username);

    expect(response.status).toBe(200);
    const user = UserSchema.parse(response.body);
    expect(user.username).toBe(username);
    expect(user.firstName).toBe(firstName);
  });

  test('should update a user (PUT /user/{username})', async () => {
    const username = uniqueUsername();
    await userApi.create({
      username,
      firstName: 'Original',
      lastName: 'Name',
      email: faker.internet.email(),
      password: 'TestPass123!',
      phone: faker.phone.number(),
      userStatus: 1,
    });

    // Act: update the first name
    const updateResponse = await userApi.update(username, {
      firstName: 'Updated',
    });
    expect(updateResponse.status).toBe(200);

    // Verify: fetch again and check updated value
    const getResponse = await userApi.getByUsername(username);
    const user = UserSchema.parse(getResponse.body);
    expect(user.firstName).toBe('Updated');
  });

  test('should delete a user (DELETE /user/{username})', async () => {
    const username = uniqueUsername();
    await userApi.create({
      username,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: 'TestPass123!',
      phone: faker.phone.number(),
      userStatus: 1,
    });

    const deleteResponse = await userApi.deleteByUsername(username);
    expect(deleteResponse.status).toBe(200);

    // Verify: fetching deleted user returns 404
    const getResponse = await userApi.getByUsername(username);
    expect(getResponse.status).toBe(404);
  });

  test('should login with valid credentials (GET /user/login)', async () => {
    const username = uniqueUsername();
    const password = 'TestPass123!';

    await userApi.create({
      username,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password,
      phone: faker.phone.number(),
      userStatus: 1,
    });

    const response = await userApi.login(username, password);

    expect(response.status).toBe(200);
    const body = ApiMessageSchema.parse(response.body);
    // Petstore returns a session token in the message field
    expect(body.message).toContain('logged in user session');
  });

  test('should return 404 for non-existent user', async () => {
    const response = await userApi.getByUsername('nonexistent_user_xyz_999');
    expect(response.status).toBe(404);
  });
});
