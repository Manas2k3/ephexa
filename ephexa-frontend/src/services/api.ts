import type {
    ApiResponse,
    User,
    LoginCredentials,
    SignupData,
    ChatRoom,
    Report,
    PaginatedResponse,
    Message
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
            ...options.headers,
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || 'An error occurred',
                };
            }

            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    // Auth endpoints
    async signup(data: SignupData): Promise<ApiResponse<{ user: User; token: string }>> {
        return this.request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async googleAuth(credential: string): Promise<ApiResponse<{ user: User; token: string }>> {
        return this.request('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential }),
        });
    }

    async logout(): Promise<ApiResponse<void>> {
        return this.request('/api/auth/logout', {
            method: 'POST',
        });
    }

    async deleteAccount(): Promise<ApiResponse<void>> {
        return this.request('/api/auth/account', {
            method: 'DELETE',
        });
    }

    async getCurrentUser(): Promise<ApiResponse<User>> {
        return this.request('/api/users/me');
    }

    // Chat endpoints
    async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
        return this.request('/api/chats');
    }

    async createOrJoinChat(interest: string): Promise<ApiResponse<ChatRoom>> {
        return this.request('/api/chats', {
            method: 'POST',
            body: JSON.stringify({ interest }),
        });
    }

    async leaveChat(roomId: string): Promise<ApiResponse<void>> {
        return this.request(`/api/chats/${roomId}`, {
            method: 'DELETE',
        });
    }

    async getChatMessages(
        roomId: string,
        page = 1,
        limit = 50
    ): Promise<ApiResponse<PaginatedResponse<Message>>> {
        return this.request(`/api/chats/${roomId}/messages?page=${page}&limit=${limit}`);
    }

    // User endpoints
    async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
        return this.request('/api/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async blockUser(userId: string): Promise<ApiResponse<void>> {
        return this.request(`/api/users/block/${userId}`, {
            method: 'POST',
        });
    }

    async unblockUser(userId: string): Promise<ApiResponse<void>> {
        return this.request(`/api/users/block/${userId}`, {
            method: 'DELETE',
        });
    }

    async reportUser(report: Report): Promise<ApiResponse<void>> {
        return this.request(`/api/users/report/${report.reportedUserId}`, {
            method: 'POST',
            body: JSON.stringify(report),
        });
    }

    async getBlockedUsers(): Promise<ApiResponse<{ id: string; blockedAt: string }[]>> {
        return this.request('/api/users/blocked');
    }
}

export const api = new ApiService();
