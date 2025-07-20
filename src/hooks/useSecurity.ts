import { useEffect, useState } from "react";
import { securityApi} from "../api/api";
import {SecurityItem} from "../api/interface-api"
import { toast } from "react-toastify";

export function useSecurity() {
    const [settings, setSettings] = useState<SecurityItem[]>([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        securityApi.list()
            .then(setSettings)
            .catch(() => toast.error("Не удалось загрузить настройки безопасности"))
            .finally(() => setLoading(false));
    }, []);

    const toggle = async (key: string) => {
        setSettings(s =>
            s.map(it => it.key === key ? { ...it, enabled: !it.enabled } : it));

        try {
            const curr = settings.find(s => s.key === key)!;
            await securityApi.toggle(key, !curr.enabled);
        } catch {
            toast.error("Ошибка сохранения");
            setSettings(s =>
                s.map(it => it.key === key ? { ...it, enabled: !it.enabled } : it));
        }
    };

    return { settings, loading, toggle, changePassword: securityApi.changePassword };
}