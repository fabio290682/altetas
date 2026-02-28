
export interface Endereco {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Escolar {
  escola: string;
  serie: string;
  turno: 'Manhã' | 'Tarde' | 'Noite' | '';
}

export interface Saude {
  restricao: string;
  alergia: string;
  tipoSanguineo: string;
  contatoEmergencia: string;
  telefoneEmergencia: string;
}

export interface Responsavel {
  nome: string;
  cpf: string;
  parentesco: string;
}

export type UserRole = 'ADMIN' | 'TECNICO' | 'VISUALIZADOR';

export interface AppUser {
  uid: string;
  nome: string;
  email: string;
  role: UserRole;
}

export interface AppConfig {
  logoURL: string;
  appName: string;
}

export interface Atleta {
  id?: string;
  nome: string;
  cpf: string;
  nis: string;
  dataNascimento: string;
  sexo: 'Masculino' | 'Feminino' | '';
  whatsapp: string;
  peso: string;
  altura: string;
  tamanhoCamisa: string;
  numCalcado: string;
  posicao: 'Goleiro' | 'Zagueiro' | 'Lateral' | 'Meio-campo' | 'Atacante' | '';
  peDominante: 'Direito' | 'Esquerdo' | 'Ambidestro' | '';
  photoURL: string;
  endereco: Endereco;
  escolar: Escolar;
  saude: Saude;
  responsavel: Responsavel;
  createdAt: string;
}

export enum StepType {
  ATLETA = 1,
  ENDERECO = 2,
  ESCOLAR = 3,
  SAUDE = 4,
  RESPONSAVEL = 5
}
