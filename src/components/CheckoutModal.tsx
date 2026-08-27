import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  Lock, 
  Building2, 
  ArrowRight,
  School,
  Clock
} from 'lucide-react';
import StudiaLogo from './StudiaLogo';
import { PlanDetails } from '../types';

export type { PlanDetails };

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanDetails | null;
  onSuccessLogin: () => void;
}

export default function CheckoutModal({ isOpen, onClose, plan, onSuccessLogin }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');

  // Form states
  const [schoolData, setSchoolData] = useState({
    schoolName: '',
    cnpjOrCpf: '',
    directorName: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCvv: ''
  });

  if (!isOpen || !plan) return null;

  const pixCode = `00020126580014br.gov.bcb.pix0136studia-pay-${plan.id}-${Date.now()}520400005303986540${plan.price}.005802BR5916STUDIA SAAS LTDA6009CURITIBA62070503***6304`;

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('processing');

    try {
      // Tenta enviar para o backend Express
      await fetch('/api/checkout/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: schoolData.schoolName || 'Colégio Assinante',
          cnpjOrCpf: schoolData.cnpjOrCpf || '00.000.000/0001-00',
          directorName: schoolData.directorName || 'Diretor Geral',
          email: schoolData.email || 'direcao@escola.com.br',
          phone: schoolData.phone || '(11) 99999-9999',
          planId: plan.id,
          billingPeriod: plan.period,
        }),
      }).catch(() => {
        // Fallback gracioso
      });
    } catch {
      // Prossegue normalmente
    }

    setTimeout(() => {
      setPaymentStep('success');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
              <School size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 leading-none">Assinatura da Escola</h3>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {plan.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Valor: <strong className="text-blue-700 font-bold">R$ {plan.price},00 / {plan.period === 'annual' ? 'mês (anual)' : 'mês'}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-4">
          {paymentStep === 'form' && (
            <form onSubmit={handleSimulatePayment} className="space-y-5">
              {/* Step 1: School info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-600" />
                  1. Dados da Instituição de Ensino
                </h4>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Escola / Colégio</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Colégio São Francisco"
                      value={schoolData.schoolName}
                      onChange={e => setSchoolData({...schoolData, schoolName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ ou CPF</label>
                    <input 
                      type="text" 
                      required
                      placeholder="00.000.000/0001-00"
                      value={schoolData.cnpjOrCpf}
                      onChange={e => setSchoolData({...schoolData, cnpjOrCpf: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diretor / Gestor</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nome completo"
                      value={schoolData.directorName}
                      onChange={e => setSchoolData({...schoolData, directorName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail para Login</label>
                    <input 
                      type="email" 
                      required
                      placeholder="direcao@escola.com.br"
                      value={schoolData.email}
                      onChange={e => setSchoolData({...schoolData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / Chat</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="(00) 00000-0000"
                      value={schoolData.phone}
                      onChange={e => setSchoolData({...schoolData, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Payment method selector */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard size={14} className="text-blue-600" />
                  2. Método de Pagamento
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      paymentMethod === 'pix' 
                        ? 'border-blue-600 bg-blue-50/60 text-blue-950' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'pix' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <QrCode size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight">PIX Instantâneo</p>
                      <p className="text-[10px] text-blue-700 font-semibold mt-0.5">Liberação Imediata</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-blue-600 bg-blue-50/60 text-blue-950' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <CreditCard size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight">Cartão de Crédito</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Até 12x sem juros</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* PIX VIEW */}
              {paymentMethod === 'pix' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* QR Code */}
                    <div className="w-36 h-36 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                      <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-lg p-2 text-white text-center">
                        <QrCode size={68} className="text-blue-400" />
                        <span className="text-[8px] font-mono tracking-tighter mt-1">PIX ESTÁTICO</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        <Clock size={12} />
                        QR Code válido por 30 minutos
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm">Escaneie o QR Code ou use o Copia e Cola:</h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Abra o app do seu banco, escolha <strong>Pagar com PIX</strong> e escaneie o código. A ativação é automática.
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <input 
                          readOnly 
                          value={pixCode}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-600 flex-1 truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={copyPix}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
                        >
                          {copiedPix ? <Check size={14} /> : <Copy size={14} />}
                          {copiedPix ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD VIEW */}
              {paymentMethod === 'card' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número do Cartão de Crédito</label>
                    <input 
                      type="text" 
                      required
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={schoolData.cardNumber}
                      onChange={e => setSchoolData({...schoolData, cardNumber: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome Impresso no Cartão</label>
                    <input 
                      type="text" 
                      required
                      placeholder="NOME COMO ESTA NO CARTAO"
                      value={schoolData.cardHolder}
                      onChange={e => setSchoolData({...schoolData, cardHolder: e.target.value.toUpperCase()})}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 uppercase font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Validade (MM/AA)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="12/28"
                        maxLength={5}
                        value={schoolData.cardExpiry}
                        onChange={e => setSchoolData({...schoolData, cardExpiry: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Código CVV</label>
                      <input 
                        type="password" 
                        required
                        placeholder="123"
                        maxLength={4}
                        value={schoolData.cardCvv}
                        onChange={e => setSchoolData({...schoolData, cardCvv: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  <Lock size={16} />
                  <span>
                    {paymentMethod === 'pix' 
                      ? `Confirmar Pagamento PIX (R$ ${plan.price},00)` 
                      : `Pagar e Ativar Assinatura (R$ ${plan.price},00)`}
                  </span>
                </button>
                <p className="text-center text-[10px] text-slate-400 font-medium mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck size={13} className="text-blue-600" />
                  Ambiente seguro com criptografia de ponta a ponta e emissão de Nota Fiscal.
                </p>
              </div>
            </form>
          )}

          {paymentStep === 'processing' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <h4 className="text-lg font-bold text-slate-800">Processando Assinatura da Escola...</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Estamos validando a transação e liberando o acesso da sua escola ao sistema.
              </p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="py-10 text-center space-y-5">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={44} />
              </div>
              <div>
                <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase">
                  Assinatura Confirmada!
                </span>
                <h4 className="text-2xl font-black text-slate-900 mt-3">
                  Parabéns! Sua escola está pronta.
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  O plano <strong>{plan.name}</strong> foi ativado com sucesso. Você e seus professores já podem acessar a plataforma diretamente no portal.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-md mx-auto text-left space-y-2">
                <p className="text-xs font-bold text-slate-700">Resumo da Conta Criada:</p>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>• <strong>Escola:</strong> {schoolData.schoolName || 'Escola Assinante'}</p>
                  <p>• <strong>E-mail Principal:</strong> {schoolData.email || 'direcao@escola.com.br'}</p>
                  <p>• <strong>Status:</strong> <span className="text-blue-600 font-bold">Ativo & Liberado</span></p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onSuccessLogin();
                  }}
                  className="w-full max-w-md mx-auto py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  <span>Ir para o Login e Acessar o Painel</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
