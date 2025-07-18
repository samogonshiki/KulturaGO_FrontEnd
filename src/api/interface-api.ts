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

    two_fa_enabled:    boolean;
    login_alerts:      boolean;
    allow_new_devices: boolean;
}

export interface PresignResp {
    put_url: string;
    public_url: string;
}

export interface SecurityItem {
    key: string;
    title: string;
    enabled: boolean;
}

export let isRefreshing = false;