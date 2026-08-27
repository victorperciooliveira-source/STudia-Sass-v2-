import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, MapPin, User, X } from 'lucide-react';
import { TeacherProfile, CreateScheduleDTO } from '../../types';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: TeacherProfile[];
  onSubmit: (dto: CreateScheduleDTO) => Promise<void>;
}

export default function ScheduleFormModal({
  isOpen,
  onClose,
  teachers,
  onSubmit,
}: ScheduleFormModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '07:30',
    end_time: '08:20',
    subject: '',
    room: '',
    class_group: '',
    teacher_id: teachers[0]?.id || '',
    teacher_name: teachers[0]?.display_name || teachers[0]?.email || '',
  });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen && teachers.length > 0 && !formData.teacher_id) {
      setFormData(prev => ({
        ...prev,
        teacher_id: teachers[0].id,
        teacher_name: teachers[0].display_name || teachers[0].email || '',
      }));
    }
  }, [isOpen, teachers, formData.teacher_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.date) return;

    setSubmitting(true);
    try {
      const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
      const teacherName = selectedTeacher?.display_name || selectedTeacher?.email || formData.teacher_name || 'Docente';

      await onSubmit({
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        subject: formData.subject,
        room: formData.room,
        class_group: formData.class_group || '',
        teacher_id: formData.teacher_id || null,
        teacher_name: teacherName,
      });

      setFormData(prev => ({ ...prev, subject: '', room: '', class_group: '' }));
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Novo Agendamento</h3>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Matéria / Disciplina</label>
                <div className="relative">
                  <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    required
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-sm font-medium"
                    placeholder="Ex: Matemática, Física, Biologia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Data</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sala / Local</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      required
                      type="text" 
                      value={formData.room}
                      onChange={e => setFormData({...formData, room: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all text-sm font-medium"
                      placeholder="Sala 101, Lab Info"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Turma (opcional)</label>
                <input 
                  type="text" 
                  value={formData.class_group}
                  onChange={e => setFormData({...formData, class_group: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium text-sm"
                  placeholder="Ex: 9A, 1B, 3A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Início</label>
                  <input 
                    required
                    type="time" 
                    value={formData.start_time}
                    onChange={e => setFormData({...formData, start_time: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Fim</label>
                  <input 
                    required
                    type="time" 
                    value={formData.end_time}
                    onChange={e => setFormData({...formData, end_time: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Professor Responsável</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  {teachers.length > 0 ? (
                    <select 
                      value={formData.teacher_id}
                      onChange={e => {
                        const t = teachers.find(item => item.id === e.target.value);
                        setFormData({
                          ...formData, 
                          teacher_id: e.target.value,
                          teacher_name: t?.display_name || t?.email || ''
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 appearance-none transition-all text-sm font-medium"
                    >
                      <option value="">Selecione um professor cadastrado...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.display_name || t.email}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Nome do Professor"
                      value={formData.teacher_name}
                      onChange={e => setFormData({ ...formData, teacher_name: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all text-sm font-medium"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Salvar Horário'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
