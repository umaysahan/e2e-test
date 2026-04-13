import { type APIRequestContext, type APIResponse } from '@playwright/test';

/**
 * Reusable API client wrapper around Playwright's APIRequestContext.
 *
 * Why wrap it instead of using raw request calls?
 * - Centralized response logging for debugging failed API tests
 * - Consistent error formatting across all endpoints
 * - Single place to add auth headers, retries, or request hooks later
 *
 * The client is stateless — it receives the Playwright context via constructor
 * and delegates all HTTP work to it. No axios, no supertest, no extra deps.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get<T>(path: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
    const response = await this.request.get(path, { params });
    return this.parseResponse<T>(response);
  }

  async post<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.request.post(path, { data });
    return this.parseResponse<T>(response);
  }

  async put<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.request.put(path, { data });
    return this.parseResponse<T>(response);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    const response = await this.request.delete(path);
    return this.parseResponse<T>(response);
  }

  private async parseResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    const status = response.status();
    const headers = response.headers();

    let body: T | null = null;
    const contentType = headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      body = (await response.json()) as T;
    }

    return {
      status,
      headers,
      body: body as T,
      ok: response.ok(),
      responseTime: parseResponseTime(headers),
    };
  }
}

/** Structured response returned by all client methods */
export interface ApiResponse<T> {
  status: number;
  headers: Record<string, string>;
  body: T;
  ok: boolean;
  /** Response time in ms (from server header, if available) */
  responseTime: number | null;
}

/**
 * Extract response time from headers.
 * Petstore includes a `response-time` header — not all APIs do,
 * so this returns null when unavailable.
 */
function parseResponseTime(headers: Record<string, string>): number | null {
  const raw = headers['response-time'];
  if (!raw) return null;
  const parsed = parseFloat(raw);
  return isNaN(parsed) ? null : parsed;
}
