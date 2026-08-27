import React, { useState, useEffect } from 'react';
import { tenantService } from '../../services/tenantService';
import { WhatsAppNotification, TeacherProfile } from '../../types';
import { MessageSquare, Send, CheckCircle2, Phone, BellRing, Sparkles } from 'lucide-react';

interface AdminWhatsAppCenterProps {
  teachers?: TeacherProfile[];
}

export default function AdminWhatsAppCenter({ teachers = [] }: AdminWhatsAppCenterProps) {
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [recipient, setRecipient] = useState(teachers[0]?.display_name || '');
  const [phone, setPhone] = useState('+55 (41) 99123-4567');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const loadNotifications = () => {
    setNotifications(tenantService.getWhatsAppNotifications());
  };

  useEffect(() => {
    loadNotifications();
    if (teachers.length > 0 && !recipient) {
      setRecipient(teachers[0].display_name);
    }
  }, [teachers]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !recipient) return;

    tenantService.sendWhatsAppNotification({
      recipient_name: recipient,
      phone,
      message,
      type: 'substitution'
    });

    setMessage('');
    setSentSuccess(true);
    loadNotifications();
    setTimeout(() => setSentSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 font-display">Central de Alertas & Chat Escolar</h3>
              <span className="bg-emerald-200 text-emerald-900 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
                Online • Chat Conectado
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Envio instantâneo de chamados de substituição, confirmações de presença e recados urgentes direto no chat do docente.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Disparo */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Send size={16} className="text-emerald-600" />
            <span>Disparar Mensagem de Chat</span>
          </h4>

          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Docente / Destinatário</label>
              {teachers.length > 0 ? (
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Selecione o professor...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.display_name}>
                      {t.display_name} {t.subject ? `(${t.subject})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Nome do professor ou colaborador"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Telefone / Canal de Chat</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Mensagem do Alerta</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Prezado(a) professor(a), solicitamos sua presença na sala 102 para cobertura de aula no 2º turno."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {sentSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Mensagem entregue com sucesso via Chat!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Send size={14} />
              <span>Enviar via Chat</span>
            </button>
          </form>
        </div>

        {/* Feed de Notificações Enviadas */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BellRing size={16} className="text-emerald-600" />
              <span>Histórico de Mensagens do Chat</span>
            </h4>
            <span className="text-xs text-slate-500 font-semibold">{notifications.length} registros</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-2xl transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{n.recipient_name}</span>
                    <span className="text-[11px] font-mono text-slate-500">{n.phone}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Entregue
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-slate-100">
                  {n.message}
                </p>
                <div className="text-[10px] text-slate-400 mt-2 text-right">
                  {new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • Chat do Portal
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
