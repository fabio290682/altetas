
export function validateCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleanCpf[i]) * (10 - i);
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  if (check1 !== parseInt(cleanCpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleanCpf[i]) * (11 - i);
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;

  return check2 === parseInt(cleanCpf[10]);
}

export function validateNIS(nis: string): boolean {
  const cleanNis = nis.replace(/\D/g, "");
  if (cleanNis.length !== 11) return false;

  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanNis[i]) * weights[i];
  }

  let digit = 11 - (sum % 11);
  if (digit === 10 || digit === 11) digit = 0;

  return digit === parseInt(cleanNis[10]);
}

export function formatCPF(v: string) {
  v = v.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v;
}

export function formatNIS(v: string) {
  v = v.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{5})(\d)/, "$1.$2");
  v = v.replace(/(\d{2})(\d{1})$/, "$1-$2");
  return v;
}
