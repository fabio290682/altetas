import { Atleta, AppConfig, AppUser, UserRole } from '../types';

const ATLETAS_KEY = 'estrelas_donorte_atletas';
const CONFIG_KEY = 'estrelas_donorte_config';
const AUTH_USER_KEY = 'estrelas_donorte_auth_user';
const AUTH_TOKEN_KEY = 'estrelas_donorte_auth_token';

const DEFAULT_CONFIG: AppConfig = {
  logoURL: '',
  appName: 'Estrelas do Norte'
};

const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || '';
const useSqliteApi = (import.meta.env.VITE_DATABASE_PROVIDER as string | undefined) !== 'local';

interface LoginResponse {
  token: string;
  user: AppUser;
}

interface RegisterResponse {
  token?: string;
  user: AppUser;
}

function readLocalAtletas(): Atleta[] {
  const data = localStorage.getItem(ATLETAS_KEY);
  return data ? JSON.parse(data) : [];
}

function writeLocalAtletas(data: Atleta[]): void {
  localStorage.setItem(ATLETAS_KEY, JSON.stringify(data));
}

function readLocalConfig(): AppConfig {
  const data = localStorage.getItem(CONFIG_KEY);
  return data ? JSON.parse(data) : DEFAULT_CONFIG;
}

function writeLocalConfig(config: AppConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function getToken(): string {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function setSession(token: string, user: AppUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function createAtletaId(): string {
  return Math.random().toString(36).slice(2, 11);
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers || {});

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `API ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function compressToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 500;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };

      img.onerror = reject;
      img.src = event.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const database = {
  init: () => {
    if (!localStorage.getItem(CONFIG_KEY)) {
      writeLocalConfig(DEFAULT_CONFIG);
    }
  },

  login: async (identifier: string, password: string): Promise<AppUser | null> => {
    if (!useSqliteApi) return null;

    const data = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });

    setSession(data.token, data.user);
    return data.user;
  },

  registerUser: async (payload: { nome: string; email: string; password: string; role?: UserRole }): Promise<AppUser> => {
    if (!useSqliteApi) {
      throw new Error('Cadastro de usuario indisponivel sem API.');
    }

    const data = await apiRequest<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (data.token) {
      setSession(data.token, data.user);
    }

    return data.user;
  },

  logout: () => {
    if (useSqliteApi) {
      void apiRequest<void>('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    }

    clearSession();
    window.location.href = '#/login';
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!getToken() && !!localStorage.getItem(AUTH_USER_KEY);
  },

  getCurrentUser: (): AppUser => {
    const data = localStorage.getItem(AUTH_USER_KEY);
    return data ? JSON.parse(data) : { uid: '', nome: '', email: '', role: 'VISUALIZADOR' };
  },

  getAtletas: async (): Promise<Atleta[]> => {
    if (!useSqliteApi) {
      return readLocalAtletas();
    }

    const atletas = await apiRequest<Atleta[]>('/api/atletas');
    writeLocalAtletas(atletas);
    return atletas;
  },

  getAtletaById: async (id: string): Promise<Atleta | null> => {
    if (!useSqliteApi) {
      return readLocalAtletas().find((item) => item.id === id) || null;
    }

    return await apiRequest<Atleta>(`/api/atletas/${id}`);
  },

  saveAtleta: async (atleta: Atleta): Promise<void> => {
    const payload: Atleta = {
      ...atleta,
      id: atleta.id || createAtletaId(),
      createdAt: atleta.createdAt || new Date().toISOString()
    };

    if (!useSqliteApi) {
      const atletas = readLocalAtletas();
      atletas.push(payload);
      writeLocalAtletas(atletas);
      return;
    }

    await apiRequest<Atleta>('/api/atletas', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateAtleta: async (id: string, data: Partial<Atleta>): Promise<void> => {
    if (!useSqliteApi) {
      const atletas = readLocalAtletas();
      const index = atletas.findIndex((item) => item.id === id);
      if (index !== -1) {
        atletas[index] = { ...atletas[index], ...data };
        writeLocalAtletas(atletas);
      }
      return;
    }

    await apiRequest<Atleta>(`/api/atletas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteAtleta: async (id: string): Promise<void> => {
    if (!useSqliteApi) {
      const atletas = readLocalAtletas().filter((item) => item.id !== id);
      writeLocalAtletas(atletas);
      return;
    }

    await apiRequest<void>(`/api/atletas/${id}`, { method: 'DELETE' });
  },

  getAppConfig: (): AppConfig => {
    return readLocalConfig();
  },

  updateAppConfig: (config: Partial<AppConfig>) => {
    const current = readLocalConfig();
    const updated = { ...current, ...config };
    writeLocalConfig(updated);
    window.dispatchEvent(new Event('appConfigUpdated'));

    if (useSqliteApi) {
      void apiRequest<AppConfig>('/api/config', {
        method: 'PUT',
        body: JSON.stringify(updated)
      }).catch(() => undefined);
    }
  },

  setUserRole: (_role: UserRole) => {
    // Deprecated: role now managed by backend user records.
  },

  getApiStatus: async (): Promise<boolean> => {
    if (!useSqliteApi) return true;
    try {
      const result = await apiRequest<{ ok: boolean }>('/api/health');
      return !!result?.ok;
    } catch {
      return false;
    }
  }
};

export const mockStorage = {
  uploadFile: async (file: File): Promise<string> => {
    return compressToDataURL(file);
  }
};
