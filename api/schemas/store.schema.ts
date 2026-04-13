import { z } from 'zod';

/**
 * Zod schemas for Petstore /store endpoint responses.
 */

export const OrderSchema = z.object({
  id: z.number(),
  petId: z.number(),
  quantity: z.number(),
  shipDate: z.string(),
  status: z.enum(['placed', 'approved', 'delivered']),
  complete: z.boolean(),
});

/** /store/inventory returns a dynamic map of status → count */
export const InventorySchema = z.record(z.string(), z.number());

export type Order = z.infer<typeof OrderSchema>;
export type Inventory = z.infer<typeof InventorySchema>;
