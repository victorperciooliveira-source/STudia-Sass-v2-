import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Check, 
  Clock, 
  User, 
  Calendar, 
  AlertCircle,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { Certificate } from '../../types';
import { certificateService } from '../../services/certificateService';

interface AdminCertificatesProps {
  onRefreshSchedules: () => void;
}

export default function AdminCertificates({ onRefreshSchedules }: AdminCertificatesProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data, error } = await certificateService.fetchCertificates();
      if (!error && data) {
        setCertificates(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Aprovar atestado médico? As aulas deste professor nesta data serão marcadas como "Aula Vaga" para substituição imediata.')) return;

    setProcessingId(id);
    try {
      const { error } = await certificateService.approveCertificate(id);
      if (error) {
        alert('Erro ao aprovar atestado: ' + error.message);
      } else {
        await loadCertificates();
        onRefreshSchedules();
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 font-display">
            Atestados Médicos & Licenças Docentes
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Validação oficial com conversão automática de horários em aulas vagas.
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs">
          <FileCheck size={48} className="text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Nenhum atestado recebido</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Quando os professores enviarem atestados pelo portal do professor, eles aparecerão aqui para validação da coordenação.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <div 
              key={cert.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    cert.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    cert.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {cert.status === 'approved' ? 'Aprovado' :
                     cert.status === 'rejected' ? 'Recusado' : 'Aguardando Aprovação'}
                  </span>

                  <span className="text-xs text-slate-400 font-mono">{cert.created_at.split('T')[0]}</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    Prof. {cert.teacher_name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar size={14} className="text-blue-600" />
                    <span>Data do Afastamento: <strong>{cert.date}</strong></span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Motivo informado:</strong>
                  {cert.reason}
                </div>
              </div>

              {cert.status === 'pending' && (
                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleApprove(cert.id)}
                    disabled={processingId === cert.id}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>{processingId === cert.id ? 'Liberando...' : 'Aprovar e Liberar Grade'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
