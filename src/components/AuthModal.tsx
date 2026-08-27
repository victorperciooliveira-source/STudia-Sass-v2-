import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  BookOpen, 
  GraduationCap, 
  ChevronRight, 
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Building2,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import StudiaLogo from './StudiaLogo';
import { useAuth } from '../lib/auth';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onOpenSupabaseConfig: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onOpenSupabaseConfig,
}: AuthModalProps) {
  const { isConfigured, signIn, signUp, loginAsDemo } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleQuickDemo = (demoRole: UserRole) => {
    loginAsDemo(
      demoRole,
      demoRole === 'admin' ? 'Profa. Sofia Mendes (Diretoria)' : 'Prof. Miguel Silva',
      email || (demoRole === 'admin' ? 'direcao@escola.gov.br' : 'miguel@escola.pr.gov.br')
    );
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }
    
    // Se o Supabase não estiver configurado, entra direto no modo demo para permitir o teste
    if (!isConfigured) {
      handleQuickDemo('teacher');
      return;
    }

    setError('');
    setAuthLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.error) {
        let msg = res.error.message || 'Erro ao realizar login no sistema.';
        if (msg.includes('Invalid path specified in request URL') || msg.includes('Failed to fetch')) {
          msg = 'O endereço do servidor configurado parece incorreto. Clique no botão abaixo para verificar as credenciais.';
        } else if (msg.includes('Invalid login credentials')) {
          msg = 'E-mail ou senha não encontrados no sistema escolar. Se você ainda não cadastrou este e-mail, clique na aba "Criar Conta" acima ou use o "Acesso de Teste Rápido" abaixo!';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'E-mail aguardando confirmação (ou use o Acesso de Teste Rápido abaixo).';
        }
        setError(msg);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      let errorMsg = err instanceof Error ? err.message : 'Erro inesperado ao conectar ao sistema.';
      if (errorMsg.includes('Invalid path specified in request URL') || errorMsg.includes('Failed to fetch')) {
        errorMsg = 'O endereço do servidor configurado está incorreto. Clique abaixo para ajustar as credenciais.';
      }
      setError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName || (role === 'teacher' && !subject)) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (!isConfigured) {
      // Se não tiver servidor configurado, cadastra em modo demonstração instantâneo
      loginAsDemo(role, displayName, email);
      onClose();
      return;
    }
    setError('');
    setAuthLoading(true);
    try {
      const res = await signUp(email, password, displayName, role, subject);
      if (res.error) {
        let msg = res.error.message || 'Erro ao criar conta no sistema.';
        if (msg.includes('Invalid path specified in request URL') || msg.includes('Failed to fetch')) {
          msg = 'O endereço do servidor configurado está incorreto. Abra a configuração para verificar.';
        } else if (msg.includes('User already registered')) {
          msg = 'Este e-mail já está cadastrado no sistema. Clique na aba "Entrar" para fazer login.';
        }
        setError(msg);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      let errorMsg = err instanceof Error ? err.message : 'Erro ao cadastrar usuário no sistema.';
      if (errorMsg.includes('Invalid path specified in request URL')) {
        errorMsg = 'O endereço do servidor configurado está incorreto. Abra a configuração para verificar.';
      }
      setError(errorMsg);
    } finally {
      setAuthLoading(false);
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
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden p-8 md:p-10 relative z-10 max-h-[95vh] overflow-y-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="mb-6 text-center">
              <StudiaLogo width={180} height={50} />
              <p className="text-center text-slate-500 text-xs font-medium mt-2">
                {authMode === 'login' ? 'Conecte-se com sua conta da escola' : 'Cadastre-se na grade escolar'}
              </p>
            </div>

            {!isConfigured && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-xs text-amber-800">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  Servidor em Modo Demonstração
                </p>
                <p className="mt-1">
                  Você pode usar o Acesso Rápido de Teste abaixo ou configurar a conexão do servidor da sua instituição.
                </p>
                <button 
                  onClick={() => { onClose(); onOpenSupabaseConfig(); }}
                  className="mt-2.5 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-center shadow cursor-pointer"
                >
                  Configurar Conexão do Servidor
                </button>
              </div>
            )}

            <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
              <button 
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); }} 
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${authMode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Entrar
              </button>
              <button 
                type="button"
                onClick={() => { setAuthMode('register'); setError(''); }} 
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${authMode === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Criar Conta
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-rose-700 font-semibold leading-relaxed">{error}</span>
                  </div>
                  {error.includes('servidor') && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSupabaseConfig();
                      }}
                      className="w-full mt-2 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Abrir Configurações de Conexão para Corrigir
                    </button>
                  )}
                </div>
              )}

              {authMode === 'register' && (
                <>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Nome completo (ex: Prof. Roberto Silva)"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tipo de Acesso / Perfil
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('teacher')}
                        className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer ${
                          role === 'teacher' 
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold' 
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <GraduationCap size={18} className={role === 'teacher' ? 'text-blue-600' : 'text-slate-400'} />
                        <span className="text-xs">Professor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer ${
                          role === 'admin' 
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold' 
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <Building2 size={18} className={role === 'admin' ? 'text-blue-600' : 'text-slate-400'} />
                        <span className="text-xs">Direção / Coord.</span>
                      </button>
                    </div>
                  </div>

                  {role === 'teacher' && (
                    <div className="relative">
                      <BookOpen size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Disciplina principal (ex: Matemática, Física)"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="seu-email@escola.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Sua senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer text-sm"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Entrar no Sistema' : 'Concluir Cadastro'}</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Acesso Rápido de Teste no Google AI Studio */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                <Zap size={13} className="text-amber-500 fill-amber-400" />
                <span>Acesso Rápido para Testes (1 Clique)</span>
              </div>
              <p className="text-center text-xs text-slate-500 mb-3">
                Ambiente Google AI: teste as telas completas imediatamente sem precisar cadastrar senha:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="p-2.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center"
                >
                  <Building2 size={16} className="text-blue-600" />
                  <span>Painel Direção / Gestor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('teacher')}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center"
                >
                  <GraduationCap size={16} className="text-emerald-600" />
                  <span>Portal do Professor</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
