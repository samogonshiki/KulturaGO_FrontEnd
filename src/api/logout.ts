import { clearTokens } from './auth';
import api from "./api";

export function logout() {
    const refresh = localStorage.getItem('refresh');
    if (refresh) api.post('/auth/logout', { refresh_token: refresh });
    clearTokens();
    window.location.href = '/';
}