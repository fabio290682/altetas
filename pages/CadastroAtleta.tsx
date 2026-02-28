import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Atleta, StepType } from '../types';
import { validateCPF, formatCPF, formatNIS } from '../utils/validations';
import { database, mockStorage } from '../services/database';
import FormStep from '../components/FormStep';
import { generateCarteiraAtletaPDF } from '../utils/generateCarteiraAtletaPDF';

const INITIAL_STATE: Atleta = {
  nome: '',
  cpf: '',
  nis: '',
  dataNascimento: '',
  sexo: '',
  whatsapp: '',
  peso: '',
  altura: '',
  tamanhoCamisa: '',
  numCalcado: '',
  posicao: '',
  peDominante: '',
  photoURL: '',
  createdAt: new Date().toISOString(),
  endereco: { logradouro: '', numero: '', bairro: '', cidade: '', uf: '', cep: '' },
  escolar: { escola: '', serie: '', turno: '' },
  saude: { restricao: '', alergia: '', tipoSanguineo: '', contatoEmergencia: '', telefoneEmergencia: '' },
  responsavel: { nome: '', cpf: '', parentesco: '' }
};

const CadastroAtleta: React.FC = () => {
  const [step, setStep] = useState<StepType>(StepType.ATLETA);
  const [form, setForm] = useState<Atleta>(INITIAL_STATE);
  const [photo, setPhoto] = useState<File | null>(null);
  const [emitirCarteirinha, setEmitirCarteirinha] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const photoPreview = useMemo(() => {
    if (!photo) return null;
    return URL.createObjectURL(photo);
  }, [photo]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleFieldChange = (section: string | null, field: string, value: string) => {
    if (section) {
      setForm((prev) => ({
        ...prev,
        [section]: { ...(prev as unknown as Record<string, unknown>)[section] as Record<string, unknown>, [field]: value }
      }) as Atleta);
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => {
    if (step === StepType.ATLETA) {
      if (!form.nome || !form.cpf || !form.dataNascimento) {
        alert('Preencha os campos obrigatorios (Nome, CPF, Nascimento).');
        return;
      }
      if (!validateCPF(form.cpf)) {
        alert('CPF do atleta invalido.');
        return;
      }
    }
    if (step < 5) setStep((step + 1) as StepType);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as StepType);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let photoURL = '';
      if (photo) {
        photoURL = await mockStorage.uploadFile(photo);
      }

      const atletaPayload: Atleta = {
        ...form,
        photoURL,
        createdAt: new Date().toISOString()
      };

      await database.saveAtleta(atletaPayload);

      if (emitirCarteirinha) {
        const confirmar = window.confirm('Cadastro concluido. Deseja emitir a carteirinha agora?');
        if (confirmar) {
          const appConfig = database.getAppConfig();
          await generateCarteiraAtletaPDF(atletaPayload, {
            appName: appConfig.appName,
            logoURL: appConfig.logoURL
          });
        }
      }

      alert('Atleta cadastrado com sucesso!');
      navigate('/atletas');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar cadastro.';
      console.error(error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const stepsInfo = [
    { label: 'Identificacao', icon: '1' },
    { label: 'Endereco', icon: '2' },
    { label: 'Escolar', icon: '3' },
    { label: 'Saude', icon: '4' },
    { label: 'Responsavel', icon: '5' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 overflow-x-auto pb-4">
        <div className="flex justify-between items-center min-w-[600px]">
          {stepsInfo.map((s, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => idx + 1 < step && setStep((idx + 1) as StepType)}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  step === idx + 1 ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-110' :
                  step > idx + 1 ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {step > idx + 1 ? 'OK' : s.icon}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${step === idx + 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < stepsInfo.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > idx + 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">
        {step === StepType.ATLETA && (
          <FormStep title="Dados do Atleta" description="Informacoes basicas e fisicas para o registro.">
            <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-4">
              <label className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-indigo-500 transition-colors bg-gray-50">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="text-3xl text-gray-400">IMG</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Foto</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setPhoto(e.target.files[0])} />
              </label>
              <p className="text-xs text-gray-400 mt-2">Clique para carregar foto do atleta</p>
            </div>

            <InputField label="Nome Completo" value={form.nome} onChange={(v) => handleFieldChange(null, 'nome', v)} placeholder="Ex: Joao da Silva" required />
            <InputField label="CPF" value={form.cpf} onChange={(v) => handleFieldChange(null, 'cpf', formatCPF(v))} placeholder="000.000.000-00" required />
            <InputField label="NIS" value={form.nis} onChange={(v) => handleFieldChange(null, 'nis', formatNIS(v))} placeholder="000.00000.00-0" />
            <InputField label="Data de Nascimento" type="date" value={form.dataNascimento} onChange={(v) => handleFieldChange(null, 'dataNascimento', v)} required />

            <SelectField label="Sexo" value={form.sexo} onChange={(v) => handleFieldChange(null, 'sexo', v)} options={['Masculino', 'Feminino']} />
            <InputField label="WhatsApp" value={form.whatsapp} onChange={(v) => handleFieldChange(null, 'whatsapp', v)} placeholder="(00) 00000-0000" />

            <InputField label="Peso (kg)" value={form.peso} onChange={(v) => handleFieldChange(null, 'peso', v)} placeholder="Ex: 65.5" />
            <InputField label="Altura (m)" value={form.altura} onChange={(v) => handleFieldChange(null, 'altura', v)} placeholder="Ex: 1.75" />

            <InputField label="Tamanho da Camisa" value={form.tamanhoCamisa} onChange={(v) => handleFieldChange(null, 'tamanhoCamisa', v)} placeholder="Ex: P, M, G" />
            <InputField label="Numero do Calcado" value={form.numCalcado} onChange={(v) => handleFieldChange(null, 'numCalcado', v)} placeholder="Ex: 38" />

            <SelectField label="Posicao" value={form.posicao} onChange={(v) => handleFieldChange(null, 'posicao', v)} options={['Goleiro', 'Zagueiro', 'Lateral', 'Meio-campo', 'Atacante']} />
            <SelectField label="Pe Dominante" value={form.peDominante} onChange={(v) => handleFieldChange(null, 'peDominante', v)} options={['Direito', 'Esquerdo', 'Ambidestro']} />
          </FormStep>
        )}

        {step === StepType.ENDERECO && (
          <FormStep title="Localizacao" description="Endereco residencial do atleta.">
            <InputField label="CEP" value={form.endereco.cep} onChange={(v) => handleFieldChange('endereco', 'cep', v)} placeholder="00000-000" />
            <InputField label="Logradouro" value={form.endereco.logradouro} onChange={(v) => handleFieldChange('endereco', 'logradouro', v)} placeholder="Rua, Avenida, etc" />
            <InputField label="Numero" value={form.endereco.numero} onChange={(v) => handleFieldChange('endereco', 'numero', v)} placeholder="Ex: 123" />
            <InputField label="Bairro" value={form.endereco.bairro} onChange={(v) => handleFieldChange('endereco', 'bairro', v)} />
            <InputField label="Cidade" value={form.endereco.cidade} onChange={(v) => handleFieldChange('endereco', 'cidade', v)} />
            <InputField label="UF" value={form.endereco.uf} onChange={(v) => handleFieldChange('endereco', 'uf', v)} placeholder="Ex: SP" />
          </FormStep>
        )}

        {step === StepType.ESCOLAR && (
          <FormStep title="Dados Escolares" description="Instituicao de ensino e periodo escolar.">
            <InputField label="Escola" value={form.escolar.escola} onChange={(v) => handleFieldChange('escolar', 'escola', v)} placeholder="Nome da instituicao" />
            <InputField label="Serie/Ano" value={form.escolar.serie} onChange={(v) => handleFieldChange('escolar', 'serie', v)} placeholder="Ex: 9 Ano" />
            <SelectField label="Turno" value={form.escolar.turno} onChange={(v) => handleFieldChange('escolar', 'turno', v)} options={['Manha', 'Tarde', 'Noite']} />
          </FormStep>
        )}

        {step === StepType.SAUDE && (
          <FormStep title="Ficha Medica" description="Informacoes de saude para seguranca do atleta.">
            <InputField label="Restricao Medica" value={form.saude.restricao} onChange={(v) => handleFieldChange('saude', 'restricao', v)} placeholder="Caso haja alguma" />
            <InputField label="Alergias" value={form.saude.alergia} onChange={(v) => handleFieldChange('saude', 'alergia', v)} placeholder="Ex: Medicamentos" />
            <SelectField label="Tipo Sanguineo" value={form.saude.tipoSanguineo} onChange={(v) => handleFieldChange('saude', 'tipoSanguineo', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
            <div className="col-span-1 md:col-span-2 h-px bg-gray-100 my-2"></div>
            <InputField label="Contato de Emergencia" value={form.saude.contatoEmergencia} onChange={(v) => handleFieldChange('saude', 'contatoEmergencia', v)} placeholder="Nome da pessoa" />
            <InputField label="Telefone de Emergencia" value={form.saude.telefoneEmergencia} onChange={(v) => handleFieldChange('saude', 'telefoneEmergencia', v)} placeholder="(00) 00000-0000" />
          </FormStep>
        )}

        {step === StepType.RESPONSAVEL && (
          <FormStep title="Responsavel Legal" description="Dados da pessoa responsavel pelo menor.">
            <InputField label="Nome do Responsavel" value={form.responsavel.nome} onChange={(v) => handleFieldChange('responsavel', 'nome', v)} placeholder="Nome completo" />
            <InputField label="CPF do Responsavel" value={form.responsavel.cpf} onChange={(v) => handleFieldChange('responsavel', 'cpf', formatCPF(v))} placeholder="000.000.000-00" />
            <InputField label="Grau de Parentesco" value={form.responsavel.parentesco} onChange={(v) => handleFieldChange('responsavel', 'parentesco', v)} placeholder="Ex: Pai, Mae, Tutor" />

            <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" required />
                <span className="text-sm text-indigo-900 leading-tight">
                  Declaro que as informacoes acima sao verdadeiras e estou ciente das normas do projeto social.
                  Autorizo o uso de imagem do atleta para fins institucionais.
                </span>
              </label>
            </div>

            <div className="col-span-1 md:col-span-2 mt-2 p-4 bg-green-50 rounded-xl border border-green-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emitirCarteirinha}
                  onChange={(e) => setEmitirCarteirinha(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-green-900 leading-tight">
                  Emitir carteirinha do atleta ao concluir o cadastro.
                </span>
              </label>
            </div>
          </FormStep>
        )}

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
          <button
            onClick={handleBack}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Voltar
          </button>

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Proximo Passo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Finalizar Cadastro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }> = ({ label, value, onChange, placeholder, type = 'text', required }) => (
  <div className="space-y-1">
    <label className="text-sm font-bold text-gray-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
    />
  </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-white"
    >
      <option value="">Selecione...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default CadastroAtleta;
