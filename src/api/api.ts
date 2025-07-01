import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const baseURL =
    (typeof import.meta !== 'undefined' &&
        (import.meta as any).env?.VITE_API_URL) ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080/api/v1';

export const API = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;

API.interceptors.response.use(
    (res) => res,
    async (err) => {
        const e = err as AxiosError;
        if (e.response?.status !== 401 || isRefreshing) throw err;

        isRefreshing = true;
        try {
            await API.post('/auth/refresh');
            const cfg = e.config as AxiosRequestConfig
            return API.request(cfg);
        } finally {
            isRefreshing = false;
        }
    },
);

export interface TokensResp {
    access_token:  string;
    refresh_token: string;
    expires_in:    number;
}

export interface Profile {
    user_id:   number;
    full_name: string;
    about:     string;
    email:     string;
    avatar:    string;
    city:      string;
    phone:     string;
    birthday:  string;
}

export const authApi = {
    signup: (email: string, nickname: string, password: string) =>
        API.post<{ user_id: number }>('/auth/signup', { email, nickname, password }),

    signin: (email: string, password: string) =>
        API.post<TokensResp>('/auth/signin', { email, password }),

    logout: () => API.post('/auth/logout'),

    me: () => API.get<{ user_id: number }>('/me'),
};

export const profileApi = {
    get: () =>
        API.get<Profile>('/profile').then((r) => r.data),

    save: (patch: Partial<Profile>) =>
        API.put<Profile>('/profile', patch).then((r) => r.data),
};

export interface PresignResp { put_url: string; public_url: string }

export const avatarApi = {
    presign: () => API.get<PresignResp>('/avatar/presign').then(r => r.data),
    async uploadAvatar(file: File) {
        const { put_url, public_url } = await this.presign()
        await fetch(put_url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
                'x-amz-acl': 'public-read',
            },
        })
        return public_url
    }
}

export default API;