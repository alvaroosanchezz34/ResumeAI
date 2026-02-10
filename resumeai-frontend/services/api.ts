const API_URL = 'http://localhost:3000';

export const api = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null;

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'API error');
    }

    return data;
};
