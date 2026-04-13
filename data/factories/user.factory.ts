import { faker } from '@faker-js/faker';
import type { CheckoutInfo } from '../../pages/checkout.page.js';

/**
 * Factory for generating dynamic test data using Faker.
 * Use factories when tests need unique data on each run
 * (avoids test interference from shared static data).
 */
export function generateCheckoutInfo(overrides?: Partial<CheckoutInfo>): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
}
