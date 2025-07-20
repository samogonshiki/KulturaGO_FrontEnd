import { useEffect, useState } from 'react';
import { profileApi} from '../api/api';
import { Profile} from '../api/interface-api';

export function useProfile() {
    const [profile, setProfile]   = useState<Profile | null>(null);
    const [loading, setLoading]   = useState(true);
    const [error,   setError]     = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const p = await profileApi.get();
                if (mounted) setProfile(p);
            } catch (e) {
                if (mounted) setError((e as Error).message);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, []);

    const save = async (patch: Partial<Profile>) => {
        const data = await profileApi.save(patch);
        setProfile((prev) => (prev ? { ...prev, ...data } : data));
        return data;
    };

    return { profile, loading, error, save };
}