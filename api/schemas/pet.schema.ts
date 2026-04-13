import { z } from 'zod';

/**
 * Zod schemas for Petstore /pet endpoint responses.
 *
 * Why Zod instead of manual field checks:
 * - Validates the entire response shape in one call
 * - Catches missing fields, wrong types, and unexpected nulls
 * - Auto-generates TypeScript types (no manual interface duplication)
 * - parse() throws descriptive errors showing exactly what's wrong
 */

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const PetSchema = z.object({
  id: z.number(),
  category: CategorySchema.optional(),
  name: z.string(),
  photoUrls: z.array(z.string()),
  tags: z.array(TagSchema).optional(),
  status: z.enum(['available', 'pending', 'sold']).optional(),
});

/** Schema for the array response from /pet/findByStatus */
export const PetListSchema = z.array(PetSchema);

/** Schema for the generic API response (used by upload, delete, etc.) */
export const ApiMessageSchema = z.object({
  code: z.number(),
  type: z.string(),
  message: z.string(),
});

// Inferred TypeScript types — use these in endpoint methods and tests
export type Pet = z.infer<typeof PetSchema>;
export type PetList = z.infer<typeof PetListSchema>;
export type ApiMessage = z.infer<typeof ApiMessageSchema>;
