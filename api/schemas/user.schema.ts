import { z } from 'zod';

/**
 * Zod schemas for Petstore /user endpoint responses.
 */

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string(),
  phone: z.string(),
  userStatus: z.number(),
});

export const ApiMessageSchema = z.object({
  code: z.number(),
  type: z.string(),
  message: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type UserApiMessage = z.infer<typeof ApiMessageSchema>;
