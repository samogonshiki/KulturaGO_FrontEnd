import axios, { AxiosError, AxiosRequestConfig } from "axios";
import {TokensResp,Profile,SecurityItem,PresignResp} from "./interface-api"

const baseURL = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
    process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1";

export const API = axios.create({
    baseURL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

export let isRefreshing = false;

API.interceptors.response.use(
    (res) => res,
    async (err) => {
        const e = err as AxiosError;
        if (e.response?.status !== 401 || isRefreshing) throw err;

        isRefreshing = true;
        try {
            await API.post("/auth/refresh");
            const cfg = e.config as AxiosRequestConfig;
            return API.request(cfg);
        } finally {
            isRefreshing = false;
        }
    }
);

export const authApi = {
    signup: (email: string, nickname: string, password: string) =>
        API.post<{ user_id: number }>("/auth/signup", { email, nickname, password }),

    signin: (email: string, password: string) =>
        API.post<TokensResp>("/auth/signin", { email, password }),

    logout: () => API.post("/auth/logout"),

    me: () => API.get<{ user_id: number }>("/me"),
};

export const profileApi = {
    get: () => API.get<Profile>("/profile").then((r) => r.data),

    save: (patch: Partial<Profile>) =>
        API.put<Profile>("/profile", patch).then((r) => r.data),
};


export const avatarApi = {
    presign(): Promise<PresignResp> {
        return API.get<PresignResp>('/avatar/presign')
            .then(r => r.data);
    },

    async uploadAvatar(file: File): Promise<string> {
        const { put_url, public_url } = await this.presign();

        const uploadRes = await fetch(put_url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
                'x-amz-acl': 'public-read',
            },
        });
        if (!uploadRes.ok) {
            throw new Error(`S3 upload failed: ${uploadRes.status}`);
        }

        await profileApi.save({ avatar: public_url });

        return public_url;
    },
};

export const securityApi = {
    list: () =>
        API.get<{ settings: SecurityItem[] }>("/security")
            .then((r) => r.data.settings),

    toggle: (key: string, enabled: boolean) =>
        API.patch(`/security/${key}`, { enabled }),

    changePassword: (oldPwd: string, newPwd: string): Promise<void> =>
        API.put("/security/password", { old: oldPwd, new: newPwd }).then(() => {}),
};

export default API;