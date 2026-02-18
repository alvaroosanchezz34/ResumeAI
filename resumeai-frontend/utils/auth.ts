const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const setToken = (token: string) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

// Decodifica el payload del JWT sin verificar firma (solo para leer la fecha)
const decodeTokenPayload = (token: string): { exp?: number } | null => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
};

// Devuelve true si el token expira en menos de 1 día
const tokenExpiresSoon = (token: string): boolean => {
    const payload = decodeTokenPayload(token);
    if (!payload?.exp) return true;
    const expiresInMs = payload.exp * 1000 - Date.now();
    return expiresInMs < 24 * 60 * 60 * 1000; // menos de 1 día
};

// Llama a /auth/refresh si el token está próximo a expirar
// Se puede llamar al cargar cualquier página protegida
export const refreshTokenIfNeeded = async (): Promise<void> => {
    const token = getToken();
    if (!token) return;
    if (!tokenExpiresSoon(token)) return;

    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.token) setToken(data.token);
        }
    } catch {
        // Si falla el refresh, no hacemos nada — el token sigue siendo válido por ahora
    }
};