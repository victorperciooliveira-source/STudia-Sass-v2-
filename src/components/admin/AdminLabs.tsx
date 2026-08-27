import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Trash2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LabBooking, CreateLabBookingDTO, TeacherProfile } from '../../types';
import { labService } from '../../services/labService';

interface AdminLabsProps {
  teachers: TeacherProfile[];
}

export default function AdminLabs({ teachers }: AdminLabsProps) {
  const [bookings, setBookings] = useState<LabBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateLabBookingDTO>({
    lab_id: 'Laboratório de Informática 1',
    teacher_id: teachers[0]?.id || '',
    teacher_name: teachers[0]?.display_name || teachers[0]?.email || '',
    date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '09:30',
  });

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await labService.fetchBookings();
      if (!error && data) {
        setBookings(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lab_id || !formData.date) return;

    const teacher = teachers.find(t => t.id === formData.teacher_id);
    const teacherName = teacher?.display_name || teacher?.email || formData.teacher_name || 'Professor';

    const { error } = await labService.createBooking({
      ...formData,
      teacher_name: teacherName,
    });

    if (error) {
      alert('Erro ao reservar laboratório: ' + error.message);
    } else {
      setIsModalOpen(false);
      loadBookings();
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Deseja cancelar esta reserva de laboratório?')) return;
    const { error } = await labService.deleteBooking(id);
    if (!error) {
      loadBookings();
    }
  };

  const labsList = [
    'Laboratório de Informática 1',
    'Laboratório de Informática 2',
    'Laboratório de Ciências & Química',
    'Sala Multimídia / Robótica',
    'Quadra Poliesportiva Coberta',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 font-display">
            Gestão de Laboratórios & Espaços Especiais
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Controle de reservas de salas e laboratórios em tempo real.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          <span>Nova Reserva de Espaço</span>
        </button>
      </div>

      {/* Grid de Laboratórios Cadastrados */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs">
          <Laptop size={48} className="text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Nenhuma reserva ativa</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Os laboratórios e espaços estão livres para agendamento dos professores.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
          >
            Fazer Primeira Reserva
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookings.map((booking) => (
            <div 
              key={booking.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Reservado
                  </span>
                  <button 
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Cancelar Reserva"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h4 className="text-base font-bold text-slate-900 font-display">
                  {booking.lab_id}
                </h4>

                <div className="space-y-1 text-xs text-slate-500 font-medium pt-1">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-blue-600" />
                    <span>Prof. {booking.teacher_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-blue-600" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-600" />
                    <span>{booking.start_time} às {booking.end_time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nova Reserva */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-lg font-bold text-slate-900 font-display">Agendar Laboratório</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Espaço / Laboratório
                </label>
                <select
                  value={formData.lab_id}
                  onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  {labsList.map(lab => (
                    <option key={lab} value={lab}>{lab}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Professor Solicitante
                </label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.display_name || t.email}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Início</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Fim</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
