import { Atleta } from '../types';

type FlatValue = string | number | boolean | null | undefined;
type FlatRecord = Record<string, FlatValue>;

function flattenObject(source: Record<string, unknown>, prefix = ''): FlatRecord {
  const flat: FlatRecord = {};

  for (const key of Object.keys(source)) {
    const nextKey = prefix ? `${prefix}_${key}` : key;
    const value = source[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flat, flattenObject(value as Record<string, unknown>, nextKey));
    } else {
      flat[nextKey] = value as FlatValue;
    }
  }

  return flat;
}

export function exportAtletasCSV(data: Atleta[]): void {
  if (!data || data.length === 0) return;

  const flattenedData = data.map((item) => flattenObject(item as unknown as Record<string, unknown>));
  const headers = Array.from(new Set(flattenedData.flatMap((item) => Object.keys(item))));

  const rows = flattenedData.map((item) =>
    headers
      .map((header) => {
        const raw = item[header] ?? '';
        return `"${String(raw).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `atletas_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
