import { Atleta, AppConfig, AppUser, UserRole } from '../types';

const ATLETAS_KEY = 'estrelas_donorte_atletas';
const USER_KEY = 'estrelas_donorte_user';
const CONFIG_KEY = 'estrelas_donorte_config';
const AUTH_SESSION_KEY = 'estrelas_donorte_session';

const DEFAULT_USER: AppUser = {
  uid: 'admin-01',
  nome: 'Administrador Estrelas',
  email: 'admin',
  role: 'ADMIN'
};

const DEFAULT_CONFIG: AppConfig = {
  logoURL: '',
  appName: 'Estrelas do Norte'
};

const SEED_DATA: Atleta[] = [
  {
    id: 'seed-1',
    nome: 'Carlos Eduardo Santos',
    cpf: '123.456.789-00',
    nis: '123.45678.90-1',
    dataNascimento: '2010-05-15',
    sexo: 'Masculino',
    whatsapp: '(11) 98888-7777',
    peso: '55',
    altura: '1.65',
    tamanhoCamisa: 'M',
    numCalcado: '38',
    posicao: 'Atacante',
    peDominante: 'Direito',
    photoURL: '',
    createdAt: new Date().toISOString(),
    endereco: {
      logradouro: 'Rua das Estrelas',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Manaus',
      uf: 'AM',
      cep: '69000-000'
    },
    escolar: { escola: 'Escola Municipal Norte', serie: '8 Ano', turno: 'Manha' as Atleta['escolar']['turno'] },
    saude: {
      restricao: '',
      alergia: 'Lactose',
      tipoSanguineo: 'O+',
      contatoEmergencia: 'Maria Santos',
      telefoneEmergencia: '(11) 97777-6666'
    },
    responsavel: { nome: 'Maria Santos', cpf: '321.654.987-11', parentesco: 'Mae' }
  }
];

const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || '';
const useSqliteApi = (import.meta.env.VITE_DATABASE_PROVIDER as string | undefined) !== 'local';

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

function ensureLocalBootstrap(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(ATLETAS_KEY)) {
    writeLocalAtletas(SEED_DATA);
  }

  if (!localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
  }

  if (!localStorage.getItem(CONFIG_KEY)) {
    writeLocalConfig(DEFAULT_CONFIG);
  }
}

function createAtletaId(): string {
  return Math.random().toString(36).slice(2, 11);
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function mergeAtletasPreservingLocal(local: Atleta[], remote: Atleta[]): Atleta[] {
  const merged = [...local];
  const existingIds = new Set(local.map((item) => item.id));

  for (const item of remote) {
    if (!existingIds.has(item.id)) {
      merged.push(item);
    }
  }

  return merged;
}

async function syncConfigFromApi(): Promise<void> {
  if (!useSqliteApi) return;

  try {
    const config = await apiRequest<AppConfig>('/api/config');
    writeLocalConfig(config);
    window.dispatchEvent(new Event('appConfigUpdated'));
  } catch (error) {
    console.warn('Falha ao carregar configuracao da API. Mantendo local.', error);
  }
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
    ensureLocalBootstrap();
    void syncConfigFromApi();
  },

  login: async (email: string, password: string): Promise<AppUser | null> => {
    await new Promise((r) => setTimeout(r, 300));

    const user: AppUser = JSON.parse(localStorage.getItem(USER_KEY) || JSON.stringify(DEFAULT_USER));

    if (email === 'admin' && password === 'estrelas2026') {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
      return user;
    }

    return null;
  },

  logout: () => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    window.location.href = '#/login';
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(AUTH_SESSION_KEY);
  },

  getCurrentUser: (): AppUser => {
    const data = localStorage.getItem(AUTH_SESSION_KEY);
    return data ? JSON.parse(data) : { uid: '', nome: '', email: '', role: 'VISUALIZADOR' };
  },

  getAtletas: async (): Promise<Atleta[]> => {
    const localAtletas = readLocalAtletas();

    if (useSqliteApi) {
      try {
        const atletas = await apiRequest<Atleta[]>('/api/atletas');
        const merged = mergeAtletasPreservingLocal(localAtletas, atletas);
        writeLocalAtletas(merged);
        return merged;
      } catch (error) {
        console.warn('Falha ao carregar atletas da API. Usando local.', error);
      }
    }

    return localAtletas;
  },

  getAtletaById: async (id: string): Promise<Atleta | null> => {
    const localAtleta = readLocalAtletas().find((item) => item.id === id) || null;

    if (localAtleta) {
      return localAtleta;
    }

    if (useSqliteApi) {
      try {
        return await apiRequest<Atleta>(`/api/atletas/${id}`);
      } catch (error) {
        console.warn('Falha ao carregar atleta na API. Usando local.', error);
      }
    }

    return null;
  },

  saveAtleta: async (atleta: Atleta): Promise<void> => {
    const payload: Atleta = {
      ...atleta,
      id: atleta.id || createAtletaId(),
      createdAt: atleta.createdAt || new Date().toISOString()
    };

    const atletas = readLocalAtletas();
    atletas.push(payload);
    writeLocalAtletas(atletas);

    if (useSqliteApi) {
      try {
        await apiRequest<Atleta>('/api/atletas', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.warn('Falha ao salvar atleta na API. Mantido localmente.', error);
      }
    }
  },

  updateAtleta: async (id: string, data: Partial<Atleta>): Promise<void> => {
    const atletas = readLocalAtletas();
    const index = atletas.findIndex((item) => item.id === id);
    if (index !== -1) {
      atletas[index] = { ...atletas[index], ...data };
      writeLocalAtletas(atletas);
    }

    if (useSqliteApi) {
      try {
        await apiRequest<Atleta>(`/api/atletas/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } catch (error) {
        console.warn('Falha ao atualizar atleta na API. Mantido localmente.', error);
      }
    }
  },

  deleteAtleta: async (id: string): Promise<void> => {
    const atletas = readLocalAtletas().filter((item) => item.id !== id);
    writeLocalAtletas(atletas);

    if (useSqliteApi) {
      try {
        await apiRequest<void>(`/api/atletas/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.warn('Falha ao remover atleta na API. Mantido localmente.', error);
      }
    }
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
      }).catch((error) => {
        console.warn('Falha ao salvar configuracao na API. Mantida localmente.', error);
      });
    }
  },

  setUserRole: (role: UserRole) => {
    const user = database.getCurrentUser();
    if (user.uid) {
      user.role = role;
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));

      const masterUser = JSON.parse(localStorage.getItem(USER_KEY) || JSON.stringify(DEFAULT_USER));
      masterUser.role = role;
      localStorage.setItem(USER_KEY, JSON.stringify(masterUser));
      window.location.reload();
    }
  }
};

export const mockStorage = {
  uploadFile: async (file: File): Promise<string> => {
    return compressToDataURL(file);
  }
};
