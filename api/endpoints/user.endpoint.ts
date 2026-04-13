import { ApiClient, type ApiResponse } from '../client.js';
import type { User, UserApiMessage } from '../schemas/user.schema.js';

/**
 * User endpoint — wraps /user CRUD operations.
 */
export class UserEndpoint {
  constructor(private readonly client: ApiClient) {}

  async create(user: Omit<User, 'id'> & { id?: number }): Promise<ApiResponse<UserApiMessage>> {
    return this.client.post<UserApiMessage>('/user', user);
  }

  async getByUsername(username: string): Promise<ApiResponse<User>> {
    return this.client.get<User>(`/user/${username}`);
  }

  async update(username: string, user: Partial<User>): Promise<ApiResponse<UserApiMessage>> {
    return this.client.put<UserApiMessage>(`/user/${username}`, user);
  }

  async deleteByUsername(username: string): Promise<ApiResponse<UserApiMessage>> {
    return this.client.delete<UserApiMessage>(`/user/${username}`);
  }

  async login(username: string, password: string): Promise<ApiResponse<UserApiMessage>> {
    return this.client.get<UserApiMessage>('/user/login', { username, password });
  }
}
