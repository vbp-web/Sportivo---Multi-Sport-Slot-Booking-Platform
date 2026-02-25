const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
    token?: string;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { token, ...fetchOptions } = options;
        const headers = new Headers(fetchOptions.headers as HeadersInit);

        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const config: RequestInit = {
            ...fetchOptions,
            headers,
            credentials: 'include', // Include cookies
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error');
        }
    }

    // GET request
    async get<T>(endpoint: string, token?: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', token });
    }

    // POST request
    async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            token,
        });
    }

    // PUT request
    async put<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            token,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string, token?: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', token });
    }

    // Upload file
    async upload<T>(
        endpoint: string,
        formData: FormData,
        token?: string
    ): Promise<T> {
        const headers = new Headers();

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            body: formData,
            headers,
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }

        return data;
    }
}

// Create API client instance
const api = new ApiClient(API_URL);

// Auth API
export const authAPI = {
    register: (data: unknown) => api.post('/auth/register', data),
    login: (data: unknown) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: (token: string) => api.get('/auth/me', token),
    sendOTP: (phone: string) => api.post('/auth/send-otp', { phone }),
    verifyOTP: (phone: string, otp: string) =>
        api.post('/auth/verify-otp', { phone, otp }),
};

// User API
export const userAPI = {
    getProfile: (token: string) => api.get('/user/profile', token),
    updateProfile: (data: unknown, token: string) =>
        api.put('/user/profile', data, token),
    getBookings: (token: string) => api.get('/user/bookings', token),
    getBooking: (id: string, token: string) =>
        api.get(`/user/bookings/${id}`, token),
};

// Owner API
export const ownerAPI = {
    getDashboard: (token: string) => api.get('/owner/dashboard', token),
    getVenues: (token: string) => api.get('/owner/venues', token),
    createVenue: (data: unknown, token: string) =>
        api.post('/owner/venues', data, token),
    getCourts: (token: string) => api.get('/owner/courts', token),
    createCourt: (data: unknown, token: string) =>
        api.post('/owner/courts', data, token),
    getSlots: (token: string) => api.get('/owner/slots', token),
    createSlot: (data: unknown, token: string) =>
        api.post('/owner/slots', data, token),
    getBookings: (token: string) => api.get('/owner/bookings', token),
    approveBooking: (id: string, token: string) =>
        api.put(`/owner/bookings/${id}/approve`, {}, token),
    rejectBooking: (id: string, reason: string, token: string) =>
        api.put(`/owner/bookings/${id}/reject`, { reason }, token),
    getSubscription: (token: string) => api.get('/owner/subscription', token),
    subscribe: (data: unknown, token: string) =>
        api.post('/owner/subscription', data, token),
};

// Admin API
export const adminAPI = {
    getDashboard: (token: string) => api.get('/admin/dashboard', token),
    getOwners: (token: string) => api.get('/admin/owners', token),
    getPendingOwners: (token: string) => api.get('/admin/owners/pending', token),
    approveOwner: (id: string, token: string) =>
        api.put(`/admin/owners/${id}/approve`, {}, token),
    rejectOwner: (id: string, reason: string, token: string) =>
        api.put(`/admin/owners/${id}/reject`, { reason }, token),
    getCities: (token: string) => api.get('/admin/cities', token),
    createCity: (data: unknown, token: string) =>
        api.post('/admin/cities', data, token),
    getSports: (token: string) => api.get('/admin/sports', token),
    createSport: (data: unknown, token: string) =>
        api.post('/admin/sports', data, token),
    getPlans: (token: string) => api.get('/admin/plans', token),
    createPlan: (data: unknown, token: string) =>
        api.post('/admin/plans', data, token),
    getAnalytics: (token: string) => api.get('/admin/analytics', token),
};

// Public API
export const publicAPI = {
    getVenues: () => api.get('/venues'),
    getVenuesByCity: (city: string) => api.get(`/venues/city/${city}`),
    getVenue: (id: string) => api.get(`/venues/${id}`),
    getSports: () => api.get('/sports'),
    getSlots: (params?: Record<string, string>) => api.get(`/slots?${new URLSearchParams(params)}`),
    getSlotsByVenue: (venueId: string) => api.get(`/slots/venue/${venueId}`),
    createBooking: (formData: FormData, token: string) =>
        api.upload('/bookings', formData, token),
};

export default api;
