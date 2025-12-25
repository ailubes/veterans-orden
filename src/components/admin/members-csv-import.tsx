'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ParsedRow {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  patronymic?: string;
  date_of_birth?: string;
  city?: string;
  oblast_name?: string;
  role?: string;
  membership_tier?: string;
}

interface ImportResult {
  success: boolean;
  row: number;
  email: string;
  error?: string;
}

export function MembersCSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    success: number;
    errors: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Помилка',
        description: 'Будь ласка, виберіть CSV файл',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        toast({
          title: 'Помилка',
          description: 'CSV файл порожній або не містить даних',
          variant: 'destructive',
        });
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map((h) => h.trim());

      // Parse rows
      const rows: ParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: any = {};

        headers.forEach((header, index) => {
          if (values[index]) {
            row[header] = values[index];
          }
        });

        rows.push(row);
      }

      setParsedData(rows);
      setResults(null);
      setSummary(null);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setImporting(true);
    try {
      const response = await fetch('/api/admin/members/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedData }),
      });

      if (!response.ok) {
        throw new Error('Failed to import members');
      }

      const data = await response.json();
      setResults(data.results);
      setSummary(data.summary);

      toast({
        title: 'Імпорт завершено',
        description: `Успішно: ${data.summary.success}, Помилки: ${data.summary.errors}`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Помилка імпорту',
        description: 'Не вдалося імпортувати членів',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `first_name,last_name,email,phone,patronymic,date_of_birth,city,oblast_name,role,membership_tier
Іван,Петренко,ivan@example.com,+380501234567,Миколайович,1990-05-15,Київ,Київська,free_viewer,free
Марія,Коваленко,maria@example.com,+380507654321,Олександрівна,1985-08-22,Львів,Львівська,full_member,basic_49`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'members-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <div className="bg-blue-50 border-2 border-blue-200 p-4 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <h3 className="font-bold mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Інструкція з імпорту
        </h3>
        <div className="text-sm text-blue-900 space-y-2">
          <p>1. Завантажте шаблон CSV файлу</p>
          <p>2. Заповніть дані членів (обов&apos;язкові поля: first_name, last_name, email)</p>
          <p>3. Завантажте файл та перевірте дані</p>
          <p>4. Натисніть &quot;Імпортувати&quot;</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Завантажити шаблон CSV
        </button>
      </div>

      {/* Upload Card */}
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <h3 className="font-bold mb-4">Завантаження CSV файлу</h3>

        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-timber-dark p-8 text-center hover:bg-timber-dark/5 transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-3 text-timber-beam" />
            <p className="font-bold mb-1">
              {file ? file.name : 'Оберіть CSV файл'}
            </p>
            <p className="text-sm text-timber-beam">
              або перетягніть файл сюди
            </p>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Preview */}
      {parsedData.length > 0 && !results && (
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <h3 className="font-bold mb-4">
            Попередній перегляд ({parsedData.length} записів)
          </h3>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-timber-dark">
                  <th className="text-left p-2 font-bold">#</th>
                  <th className="text-left p-2 font-bold">Ім&apos;я</th>
                  <th className="text-left p-2 font-bold">Прізвище</th>
                  <th className="text-left p-2 font-bold">Email</th>
                  <th className="text-left p-2 font-bold">Роль</th>
                  <th className="text-left p-2 font-bold">План</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-b border-timber-dark/10">
                    <td className="p-2 text-timber-beam">{index + 1}</td>
                    <td className="p-2">{row.first_name}</td>
                    <td className="p-2">{row.last_name}</td>
                    <td className="p-2 font-mono text-xs">{row.email}</td>
                    <td className="p-2">{row.role || 'free_viewer'}</td>
                    <td className="p-2">{row.membership_tier || 'free'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsedData.length > 10 && (
            <p className="text-sm text-timber-beam mb-4">
              Показано 10 з {parsedData.length} записів
            </p>
          )}

          <button
            onClick={handleImport}
            disabled={importing}
            className="btn btn-primary flex items-center gap-2"
          >
            {importing ? 'Імпортування...' : `Імпортувати ${parsedData.length} членів`}
          </button>
        </div>
      )}

      {/* Results */}
      {results && summary && (
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <h3 className="font-bold mb-4">Результати імпорту</h3>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-timber-dark/5 p-4 border border-timber-dark/20">
              <p className="text-xs text-timber-beam mb-1">ВСЬОГО</p>
              <p className="font-syne text-2xl font-bold">{summary.total}</p>
            </div>
            <div className="bg-green-50 p-4 border border-green-200">
              <p className="text-xs text-green-700 mb-1">УСПІШНО</p>
              <p className="font-syne text-2xl font-bold text-green-700">
                {summary.success}
              </p>
            </div>
            <div className="bg-red-50 p-4 border border-red-200">
              <p className="text-xs text-red-700 mb-1">ПОМИЛКИ</p>
              <p className="font-syne text-2xl font-bold text-red-700">
                {summary.errors}
              </p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.row}
                className={`flex items-start gap-3 p-3 border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">
                    Рядок {result.row}: {result.email}
                  </p>
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1">{result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setFile(null);
              setParsedData([]);
              setResults(null);
              setSummary(null);
            }}
            className="btn btn-outline mt-4"
          >
            Імпортувати ще файл
          </button>
        </div>
      )}
    </div>
  );
}
