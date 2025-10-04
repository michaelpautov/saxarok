import type {
  PromptsResponse,
  CreatePromptRequest,
  UpdatePromptRequest,
  Prompt,
  UsersResponse,
  DialogFile,
  StatsResponse,
} from '@/types';

const API_BASE = '/api';

class ApiClient {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Prompts
  async getPrompts(): Promise<PromptsResponse> {
    return this.request<PromptsResponse>('/prompts');
  }

  async createPrompt(data: CreatePromptRequest): Promise<Prompt> {
    return this.request<Prompt>('/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePrompt(id: string, data: UpdatePromptRequest): Promise<Prompt> {
    return this.request<Prompt>(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePrompt(id: string): Promise<void> {
    await fetch(`${API_BASE}/prompts/${id}`, {
      method: 'DELETE',
    });
  }

  async activatePrompt(id: string): Promise<{ success: boolean; activeId: string }> {
    return this.request(`/prompts/${id}/activate`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Dialogs
  async getUsers(): Promise<UsersResponse> {
    return this.request<UsersResponse>('/dialogs/users');
  }

  async getDialog(userId: string): Promise<DialogFile> {
    return this.request<DialogFile>(`/dialogs/${userId}`);
  }

  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/dialogs/stats');
  }
}

export const api = new ApiClient();
