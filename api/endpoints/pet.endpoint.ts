import { ApiClient, type ApiResponse } from '../client.js';
import type { Pet, PetList, ApiMessage } from '../schemas/pet.schema.js';

/**
 * Pet endpoint — wraps /pet CRUD operations.
 *
 * Each method returns the raw ApiResponse so tests can assert on
 * status codes, headers, and body independently.
 */
export class PetEndpoint {
  constructor(private readonly client: ApiClient) {}

  async create(pet: Omit<Pet, 'id'> & { id?: number }): Promise<ApiResponse<Pet>> {
    return this.client.post<Pet>('/pet', pet);
  }

  async getById(id: number): Promise<ApiResponse<Pet>> {
    return this.client.get<Pet>(`/pet/${id}`);
  }

  async update(pet: Pet): Promise<ApiResponse<Pet>> {
    return this.client.put<Pet>('/pet', pet);
  }

  async deleteById(id: number): Promise<ApiResponse<ApiMessage>> {
    return this.client.delete<ApiMessage>(`/pet/${id}`);
  }

  async findByStatus(status: 'available' | 'pending' | 'sold'): Promise<ApiResponse<PetList>> {
    return this.client.get<PetList>('/pet/findByStatus', { status });
  }
}
