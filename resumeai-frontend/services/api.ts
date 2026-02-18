const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = async (endpoint: string, options: RequestInit = {}) => {
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

    // Si el token expiró o es inválido, redirigir al login automáticamente
    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok) throw new Error(data.message || 'API error');
    return data;
};

// Upload PDF y obtener texto extraído
export const uploadPdf = async (file: File): Promise<{ text: string; chars: number; truncated: boolean; pages: number }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/ai/pdf`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData
    });

    const data = await res.json();

    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok) throw new Error(data.message || 'PDF upload failed');
    return data.data;
};

export const startCheckout = async (plan: 'premium' | 'pro') => {
    const res = await api('/stripe/checkout', { method: 'POST', body: JSON.stringify({ plan }) });
    if (res.url) window.location.href = res.url;
};

export const openBillingPortal = async () => {
    const res = await api('/stripe/portal');
    if (res.url) window.location.href = res.url;
};