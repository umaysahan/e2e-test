import { ApiClient, type ApiResponse } from '../client.js';
import type { Order, Inventory } from '../schemas/store.schema.js';
import type { ApiMessage } from '../schemas/pet.schema.js';

/**
 * Store endpoint — wraps /store operations (orders + inventory).
 */
export class StoreEndpoint {
  constructor(private readonly client: ApiClient) {}

  async getInventory(): Promise<ApiResponse<Inventory>> {
    return this.client.get<Inventory>('/store/inventory');
  }

  async placeOrder(order: Omit<Order, 'id'> & { id?: number }): Promise<ApiResponse<Order>> {
    return this.client.post<Order>('/store/order', order);
  }

  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    return this.client.get<Order>(`/store/order/${id}`);
  }

  async deleteOrder(id: number): Promise<ApiResponse<ApiMessage>> {
    return this.client.delete<ApiMessage>(`/store/order/${id}`);
  }
}
