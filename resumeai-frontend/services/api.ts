const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

// Redirige al usuario a Stripe Checkout
export const startCheckout = async (plan: 'premium' | 'pro') => {
    const res = await api('/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan })
    });
    if (res.url) window.location.href = res.url;
};

// Abre el portal de gestión de Stripe
export const openBillingPortal = async () => {
    const res = await api('/stripe/portal');
    if (res.url) window.location.href = res.url;
};