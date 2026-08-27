import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, Check, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { CreateScheduleDTO } from '../../types';
import { scheduleService } from '../../services/scheduleService';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
}

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }: BulkImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<CreateScheduleDTO[]>([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const sampleCsv = `data,inicio,fim,disciplina,sala,turma,professor
2026-08-27,07:30,08:20,Matemática Avançada,Sala 101 - Bloco A,3º Ano A,Prof. Miguel Silva
2026-08-27,08:20,09:10,Física Teórica,Lab. Ciências 1,2º Ano B,Prof. Ricardo Santos
2026-08-27,09:30,10:20,Química Orgânica,Sala 104,1º Ano C,Profa. Mariana Costa
2026-08-27,10:20,11:10,História Geral,Sala 202,3º Ano B,Prof. Carlos Eduardo
2026-08-27,11:10,12:00,Língua Portuguesa,Sala 105,2º Ano A,Profa. Beatriz Lima`;

  const handleDownloadTemplate = () => {
    const element = document.createElement("a");
    const file = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    element.href = URL.createObjectURL(file);
    element.download = "modelo_importacao_grade_studia.csv";
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (content: string) => {
    try {
      const lines = content.trim().split('\n');
      if (lines.length <= 1) {
        setError('O arquivo deve conter cabeçalho e pelo menos 1 linha de aula.');
        return;
      }

      const rows: CreateScheduleDTO[] = [];
      // pula a primeira linha se for cabeçalho
      const startIndex = lines[0].toLowerCase().includes('disciplina') || lines[0].toLowerCase().includes('data') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 6) {
          rows.push({
            date: cols[0] || new Date().toISOString().split('T')[0],
            start_time: cols[1] || '07:30',
            end_time: cols[2] || '08:20',
            subject: cols[3] || 'Geral',
            room: cols[4] || 'Sala de Aula',
            class_group: cols[5] || 'Geral',
            teacher_id: null,
            teacher_name: cols[6] || 'Docente a Definir',
            status: 'pending'
          });
        }
      }

      if (rows.length === 0) {
        setError('Nenhuma linha válida encontrada. Verifique se as colunas estão separadas por vírgula.');
        setParsedRows([]);
      } else {
        setParsedRows(rows);
        setError('');
      }
    } catch {
      setError('Erro ao processar o CSV. Certifique-se de usar o modelo padrão.');
    }
  };

  const handleApplyImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    try {
      const result = await scheduleService.bulkCreateSchedules(parsedRows);
      if (result.error) {
        console.warn('Erro na importação em massa:', result.error);
      }
      onImportSuccess(result.count || parsedRows.length);
      onClose();
    } catch {
      setError('Falha ao salvar horários importados.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Importação em Massa (Excel / CSV)</h3>
              <p className="text-xs text-slate-500 font-medium">Cadastre 50+ aulas e horários em poucos segundos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="text-xs text-blue-900 font-medium leading-relaxed">
              <strong>Como funciona:</strong> Baixe o arquivo modelo, preencha no Excel/Google Sheets e anexe aqui.
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Baixar Modelo CSV</span>
            </button>
          </div>

          {/* Upload Box */}
          <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/30">
            <UploadCloud size={32} className="text-slate-400 mb-2" />
            <span className="text-xs font-bold text-slate-700">Clique para selecionar o arquivo .CSV</span>
            <span className="text-[11px] text-slate-400 mt-1">ou cole o texto CSV diretamente abaixo</span>
            <input type="file" accept=".csv, .txt" onChange={handleFileUpload} className="hidden" />
          </label>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Ou cole o texto CSV aqui:
              </label>
              {parsedRows.length > 0 && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check size={14} /> {parsedRows.length} aulas identificadas
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                parseCsv(e.target.value);
              }}
              placeholder="data,inicio,fim,disciplina,sala,turma,professor&#10;2026-08-27,07:30,08:20,Matemática,Sala 101,3º A,Prof. Miguel Silva"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Prévia da Importação ({parsedRows.length} registros)
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs">
                {parsedRows.slice(0, 5).map((row, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between text-slate-700">
                    <div>
                      <span className="font-bold text-slate-900">{row.subject}</span> ({row.class_group})
                      <div className="text-[11px] text-slate-500">{row.date} • {row.start_time} às {row.end_time} • {row.room}</div>
                    </div>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      {row.teacher_name}
                    </span>
                  </div>
                ))}
                {parsedRows.length > 5 && (
                  <div className="p-2 text-center text-xs text-slate-400 font-medium">
                    + {parsedRows.length - 5} outras aulas serão importadas...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={handleApplyImport}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Confirmar e Importar {parsedRows.length} Aulas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
