import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Database,
  Lock,
  Layers,
  FileSpreadsheet,
  Check,
  Send,
  CreditCard,
  QrCode,
  School,
  Sparkles,
  Award,
  BarChart3,
  Laptop,
  Flame,
  HelpCircle,
  TrendingUp,
  Cpu,
  Bot,
  FileCheck,
  CalendarDays,
  Smartphone,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import StudiaLogo from './StudiaLogo';
import LiveDashboard from './LiveDashboard';
import Reveal from './Reveal';
import CheckoutModal, { PlanDetails } from './CheckoutModal';
import RoiCalculator from './RoiCalculator';
import RoutineMarquee from './RoutineMarquee';

interface SaasLandingPageProps {
  onGoToPortal: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenSupabaseConfig: () => void;
}

export default function SaasLandingPage({ onGoToPortal, onOpenAuth, onOpenSupabaseConfig }: SaasLandingPageProps) {
  const { isConfigured } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    schoolName: '',
    email: '',
    phone: '',
    teachersCount: '16-40',
    message: ''
  });

  const handleOpenPlanCheckout = (id: string, name: string, priceMonthly: number, priceAnnual: number, features: string[]) => {
    setSelectedPlan({
      id,
      name,
      price: billingPeriod === 'annual' ? priceAnnual : priceMonthly,
      period: billingPeriod,
      features
    });
    setIsCheckoutOpen(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Como o Studia resolve as aulas vagas tão rápido?',
      a: 'Quando um professor registra ausência pelo celular ou anexa um atestado, o sistema cruza imediatamente as janelas livres de todos os docentes da mesma área ou compatíveis no mesmo turno, sugerindo a melhor substituição em 1 clique.'
    },
    {
      q: 'Os dados da minha escola são seguros e privados?',
      a: 'Sim! Toda a plataforma possui criptografia de ponta a ponta e isolamento rigoroso por instituição de ensino. Professores e coordenadores possuem acessos protegidos de acordo com suas funções pedagógicas.'
    },
    {
      q: 'Os professores precisam instalar algum aplicativo pesado?',
      a: 'Não. O Studia é um Web App Progressivo ultra rápido, que abre instantaneamente em qualquer smartphone (Android e iPhone) ou computador, com confirmação de presença em apenas 1 toque.'
    },
    {
      q: 'Podemos exportar a grade e relatórios para impressão oficial?',
      a: 'Com certeza. O sistema possui gerador oficial de Grade Escolar no formato A4 Paisagem (PDF/Impressão) e relatórios gerenciais de frequência docente prontos para auditoria.'
    },
    {
      q: 'Como funciona a ativação com PIX e Cartão de Crédito?',
      a: 'O pagamento é processado instantaneamente no checkout. Assim que o PIX é escaneado ou o cartão aprovado, o ambiente da sua escola é provisionado automaticamente.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Top Status Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-mono text-[11px] text-slate-300">
              {isConfigured ? 'Sincronização em Nuvem Conectada' : 'Servidor Escolar Pronto'}
            </span>
          </div>
          <button 
            onClick={onOpenSupabaseConfig}
            className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold transition-colors cursor-pointer"
          >
            <Database size={12} />
            {isConfigured ? 'Conexão em Nuvem' : 'Configurar Servidor Escolar'}
          </button>
        </div>
      </div>

      {/* Main SaaS Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Studia Brand Logo */}
          <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <StudiaLogo width={180} height={50} />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('apresentacao')} className="hover:text-blue-600 transition-colors cursor-pointer">
              Apresentação
            </button>
            <button onClick={() => scrollToSection('como-funciona')} className="hover:text-blue-600 transition-colors cursor-pointer">
              Como Funciona
            </button>
            <button onClick={() => scrollToSection('recursos')} className="hover:text-blue-600 transition-colors cursor-pointer">
              Recursos
            </button>
            <button onClick={() => scrollToSection('calculadora')} className="hover:text-blue-600 transition-colors cursor-pointer">
              Economia Escolar
            </button>
            <button onClick={() => scrollToSection('precos')} className="hover:text-blue-600 transition-colors cursor-pointer">
              Planos & Preços
            </button>
            <button onClick={() => scrollToSection('contato')} className="hover:text-blue-600 transition-colors cursor-pointer">
              Contato
            </button>
          </nav>

          {/* Direct CTA to Portal Screen */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-all hidden sm:block cursor-pointer"
            >
              Fazer Login
            </button>
            <button 
              onClick={onGoToPortal}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Acessar Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION COM ILUMINAÇÃO AURORA E O LIVE DASHBOARD */}
      <section id="apresentacao" className="relative pt-16 pb-28 md:pt-24 md:pb-36 overflow-hidden bg-aurora-mesh">
        {/* Luzes dinâmicas de fundo suaves e fluidas */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-400/15 via-cyan-300/15 to-indigo-400/10 blur-[130px] pointer-events-none rounded-full animate-ambient-1"></div>
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[350px] bg-cyan-300/10 blur-[110px] pointer-events-none rounded-full animate-ambient-2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Reveal direction="up" delay={0.1}>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Badge de Destaque */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-xs font-bold shadow-xs animate-float">
                <Sparkles size={14} className="text-blue-600" />
                <span>Gestão Escolar Inteligente com Zero Aulas Vagas</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span className="text-blue-600">v2.4 Pro</span>
              </div>

              {/* Título Principal */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] font-display">
                A grade escolar que <br />
                <span className="text-gradient-studia">
                  elimina aulas vagas
                </span>
                <br />em segundos.
              </h1>

              {/* Subtítulo */}
              <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                Substituição automática de professores ausentes, gestão de laboratórios em tempo real e controle absoluto para a coordenação pedagógica.
              </p>

              {/* Botões de Ação do Hero */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button 
                  onClick={onGoToPortal}
                  className="w-full sm:w-auto px-9 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98] cursor-pointer animate-sheen"
                >
                  <Building2 size={18} />
                  <span>Entrar no Portal da Escola</span>
                  <ArrowRight size={18} />
                </button>

                <button 
                  onClick={() => scrollToSection('como-funciona')}
                  className="w-full sm:w-auto px-8 py-4 bg-white/90 hover:bg-white border border-slate-200 text-slate-800 font-bold text-base rounded-2xl shadow-sm hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ver Demonstração Interativa</span>
                </button>
              </div>

              {/* Badges de Confiança */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  Pronto para uso imediato
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck size={16} className="text-blue-600" />
                  Armazenamento Seguro e Criptografado
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Smartphone size={16} className="text-blue-600" />
                  1 Toque no Celular do Professor
                </span>
              </div>
            </div>
          </Reveal>

          {/* O LIVE DASHBOARD SHOWCASE 3D */}
          <div className="mt-16 md:mt-20">
            <Reveal direction="up" delay={0.25} scale={0.98}>
              <LiveDashboard />
            </Reveal>
          </div>
        </div>
      </section>

      {/* METRICAS DE IMPACTO & MARQUEE */}
      <section className="bg-slate-900 text-white py-14 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="space-y-1 px-4">
              <p className="text-3xl sm:text-4xl font-black text-blue-400 font-display">+120 mil</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Aulas Vagas Evitadas</p>
            </div>
            <div className="space-y-1 px-4">
              <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-display">99.4%</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Taxa de Presença Coberta</p>
            </div>
            <div className="space-y-1 px-4">
              <p className="text-3xl sm:text-4xl font-black text-cyan-400 font-display">-85%</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tempo da Coordenação</p>
            </div>
            <div className="space-y-1 px-4">
              <p className="text-3xl sm:text-4xl font-black text-indigo-400 font-display">42 seg</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tempo Médio de Substituição</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: COMO O STUDIA TRANSFORMA A ROTINA (01 A 07 PASSOS FLUIDOS) */}
      <section id="como-funciona" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <Reveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 shadow-xs">
                Fluxo Inteligente de Ponta a Ponta
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-display">
                Como o Studia transforma a rotina da sua escola
              </h2>
              <p className="text-slate-500 text-sm sm:text-base font-medium max-w-2xl mx-auto">
                Do cadastro da grade horária até a gestão de imprevistos e emissão de relatórios oficiais em tempo real.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Componente Interativo com 7 Cards e Animação Fluida Lenta */}
        <RoutineMarquee />
      </section>

      {/* SEÇÃO 3: RECURSOS & BENTO GRID DE ELITE */}
      <section id="recursos" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Luzes de Fundo */}
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Reveal direction="up">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/50">
                Poder & Tecnologia
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
                Tudo o que sua instituição precisa em uma única plataforma
              </h2>
              <p className="text-slate-400 text-sm sm:text-base font-medium">
                Desenvolvido com base nos maiores desafios diários de diretores e coordenadores pedagógicos.
              </p>
            </div>
          </Reveal>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Grande 1: Anti-Aulas Vagas */}
            <Reveal direction="up" delay={0.1} className="md:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-all h-full flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">
                    Motor Preditivo Anti-Aulas Vagas
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                    Detecção antecipada de janelas ociosas e sugestão automática de professores disponíveis no mesmo turno, reduzindo o tempo de resolução de horas para menos de 1 minuto.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <Check size={14} /> Sugestões por afinidade de matéria
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <Check size={14} /> Histórico de coberturas
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Card 2: Gestão de Laboratórios */}
            <Reveal direction="up" delay={0.2}>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-all h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                    <Laptop size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white font-display">
                    Laboratórios & Ambientes
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Reservas de laboratórios de informática, ciências e quadras esportivas sem sobreposição de turmas.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-cyan-300 flex items-center gap-1.5">
                  <Check size={14} /> Sincronização em tempo real
                </div>
              </div>
            </Reveal>

            {/* Card 3: Atestados Médicos Digitais */}
            <Reveal direction="up" delay={0.3}>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-all h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <FileCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white font-display">
                    Atestados & Licenças
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Upload direto do atestado médico pelo professor com liberação e notificação imediata à coordenação.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-300 flex items-center gap-1.5">
                  <Check size={14} /> Aprovação em 1 clique
                </div>
              </div>
            </Reveal>

            {/* Card Grande 4: Relatórios Oficiais & PDF A4 */}
            <Reveal direction="up" delay={0.4} className="md:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-all h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">
                    Relatórios Executivos & Impressão A4 Paisagem
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                    Gráficos detalhados de assiduidade docente, taxas de cobertura e exportação em formato padrão executivo A4 Paisagem para quadro de avisos ou arquivo da secretaria.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    <Check size={14} /> PDF pronto para impressão
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    <Check size={14} /> Gráficos de presença
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: CALCULADORA DE ECONOMIA / ROI ESCOLAR COM EFEITO VERCEL LIGHT GLOW */}
      <section id="calculadora" className="py-24 bg-slate-950 text-white relative overflow-hidden">
        {/* Background ambient lighting effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <Reveal direction="up">
            <RoiCalculator initialClasses={18} />
          </Reveal>
        </div>
      </section>

      {/* SEÇÃO 5: PLANOS & PREÇOS COM PIX / CARTÃO */}
      <section id="precos" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal direction="up">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
                Investimento Transparente
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-display">
                Planos sob medida para o tamanho da sua escola
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Sem contratos abusivos ou taxas de instalação. Liberação instantânea via PIX ou Cartão.
              </p>

              {/* Billing Toggle (Mensal / Anual) */}
              <div className="inline-flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mt-4">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    billingPeriod === 'monthly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingPeriod === 'annual'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Anual</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                    -20% OFF
                  </span>
                </button>
              </div>
            </div>
          </Reveal>

          {/* Cards de Preço */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Plano Starter */}
            <Reveal direction="up" delay={0.1}>
              <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-xl transition-all h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-display">Starter Escolar</h3>
                    <p className="text-xs text-slate-500 mt-1">Para escolas pequenas e centros de ensino.</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-4xl font-black text-slate-950 font-display">
                      R$ {billingPeriod === 'annual' ? '159' : '199'}
                    </span>
                    <span className="text-xs text-slate-500 font-bold"> / mês</span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs font-medium text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-600" /> Até 15 Professores
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-600" /> Grade Geral Digital
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-600" /> Check-in do Professor
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-600" /> Exportação de Grade A4
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenPlanCheckout('starter', 'Starter Escolar', 199, 159, [
                    'Até 15 Professores',
                    'Grade Geral Digital',
                    'Check-in do Professor',
                    'Exportação de Grade A4'
                  ])}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Assinar Starter
                </button>
              </div>
            </Reveal>

            {/* Plano Pro Escolar (Destaque Mais Popular) */}
            <Reveal direction="up" delay={0.2}>
              <div className="bg-slate-900 text-white border-2 border-blue-500 rounded-3xl p-8 space-y-6 shadow-2xl shadow-blue-900/20 relative h-full flex flex-col justify-between transform md:-translate-y-3">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-wider shadow-md">
                  Mais Escolhido pelas Escolas
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-white font-display">Pro Escolar</h3>
                    <p className="text-xs text-slate-400 mt-1">Para colégios e escolas em pleno crescimento.</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-5xl font-black text-white font-display">
                      R$ {billingPeriod === 'annual' ? '299' : '379'}
                    </span>
                    <span className="text-xs text-slate-400 font-bold"> / mês</span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-white/10 text-xs font-medium text-slate-200">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-400" /> <strong>Professores Ilimitados</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-400" /> Algoritmo de Substituição 1-Toque
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-400" /> Gestão de Laboratórios & Quadras
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-400" /> Envio & Aprovação de Atestados
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-400" /> Relatórios Executivos & Analytics
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenPlanCheckout('pro', 'Pro Escolar', 379, 299, [
                    'Professores Ilimitados',
                    'Algoritmo de Substituição 1-Toque',
                    'Gestão de Laboratórios & Quadras',
                    'Envio & Aprovação de Atestados',
                    'Relatórios Executivos & Analytics'
                  ])}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer animate-sheen"
                >
                  <Sparkles size={16} />
                  <span>Assinar Pro Escolar</span>
                </button>
              </div>
            </Reveal>

            {/* Plano Enterprise / Redes de Ensino */}
            <Reveal direction="up" delay={0.3}>
              <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-xl transition-all h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-display">Redes & Franquias</h3>
                    <p className="text-xs text-slate-500 mt-1">Múltiplas unidades e suporte corporativo dedicado.</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-4xl font-black text-slate-950 font-display">
                      R$ {billingPeriod === 'annual' ? '599' : '749'}
                    </span>
                    <span className="text-xs text-slate-500 font-bold"> / mês</span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs font-medium text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-600" /> Múltiplas Unidades / Polos
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-600" /> Servidor Escolar Dedicado
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-600" /> Treinamento com a Equipe
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-blue-600" /> Suporte Prioritário VIP
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenPlanCheckout('enterprise', 'Redes & Franquias', 749, 599, [
                    'Múltiplas Unidades / Polos',
                    'Servidor Escolar Dedicado',
                    'Treinamento com a Equipe',
                    'Suporte Prioritário VIP'
                  ])}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Assinar Redes
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: DEPOIMENTOS */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal direction="up">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                Casos de Sucesso
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 font-display">
                O que dizem os diretores e coordenadores
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            <Reveal direction="up" delay={0.1}>
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8 space-y-4 shadow-xs">
                <div className="flex text-amber-400">★★★★★</div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "O Studia acabou com o pesadelo das 07h da manhã quando um professor passava mal. Em 30 segundos achamos um substituto e a escola funciona sem tumulto."
                </p>
                <div className="pt-2 border-t border-slate-200/40">
                  <p className="font-bold text-slate-900 text-sm">Profª Helena Vasconcelos</p>
                  <p className="text-xs text-slate-500">Diretora Pedagógica • Colégio Santa Cruz</p>
                </div>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.2}>
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8 space-y-4 shadow-xs">
                <div className="flex text-amber-400">★★★★★</div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "Os professores adoraram a facilidade de confirmar a presença no celular. A gestão de laboratórios também economizou incontáveis discussões."
                </p>
                <div className="pt-2 border-t border-slate-200/40">
                  <p className="font-bold text-slate-900 text-sm">Marcos Drummond</p>
                  <p className="text-xs text-slate-500">Coordenador Geral • Instituto Drummond</p>
                </div>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.3}>
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8 space-y-4 shadow-xs">
                <div className="flex text-amber-400">★★★★★</div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "A exportação em formato A4 e os relatórios em PDF nos deram total conformidade nas reuniões com os pais e auditorias de ensino."
                </p>
                <div className="pt-2 border-t border-slate-200/40">
                  <p className="font-bold text-slate-900 text-sm">Cláudia Fontes</p>
                  <p className="text-xs text-slate-500">Gestora Escolar • Rede Prisma de Ensino</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: FAQ ACORDEÃO */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal direction="up">
            <div className="text-center space-y-3 mb-16">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
                Perguntas Frequentes
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 font-display">
                Tire suas dúvidas sobre o Studia
              </h2>
            </div>
          </Reveal>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left font-bold text-slate-900 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-base">{faq.q}</span>
                  <ChevronRight size={18} className={`text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-90 text-blue-600' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: CONTATO & AGENDAMENTO DE DEMO */}
      <section id="contato" className="py-24 bg-slate-900 text-white relative">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal direction="up">
            <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-950 px-3 py-1 rounded-full border border-blue-900">
                    Fale com Especialistas
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white font-display leading-tight">
                    Agende uma apresentação exclusiva para sua diretoria
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Nossa equipe pedagógica demonstrará a plataforma ao vivo com a grade da sua própria escola.
                  </p>

                  <div className="space-y-3 text-xs text-slate-300 pt-2">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-blue-400" />
                      <span>contato@studia.com.br</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-emerald-400" />
                      <span>+55 (41) 99558-7898 (Atendimento Direto)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-blue-400" />
                      <span>Av. Paulista, 1106 • São Paulo - SP</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href="https://wa.me/5541995587898?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20apresenta%C3%A7%C3%A3o%20do%20Studia%20para%20minha%20escola."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <MessageCircle size={18} className="shrink-0" />
                      <span>Studia COP</span>
                    </a>
                  </div>
                </div>

                {/* Formulário de Contato */}
                <div>
                  {contactSubmitted ? (
                    <div className="bg-white/5 border border-emerald-400/30 rounded-2xl p-8 text-center space-y-4">
                      <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} />
                      </div>
                      <h4 className="text-xl font-bold text-white font-display">Mensagem Enviada!</h4>
                      <p className="text-xs text-slate-300">
                        Nossa equipe entrará em contato em até 2 horas pelo WhatsApp ou e-mail informado.
                      </p>
                      <div className="pt-2">
                        <a
                          href="https://wa.me/5541995587898?text=Ol%C3%A1!%20Enviei%20um%20pedido%20de%20apresenta%C3%A7%C3%A3o%20pelo%20site%20e%20gostaria%20de%20falar%20com%20um%20consultor."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
                        >
                          <MessageCircle size={15} />
                          <span>Abrir WhatsApp Agora</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Seu Nome Completo</label>
                        <input 
                          type="text" 
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Ex: Roberto Silveira"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Escola</label>
                          <input 
                            type="text" 
                            required
                            value={contactForm.schoolName}
                            onChange={(e) => setContactForm({ ...contactForm, schoolName: e.target.value })}
                            placeholder="Colégio São Bento"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Telefone / WhatsApp</label>
                          <input 
                            type="tel" 
                            required
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            placeholder="(41) 90000-0000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">E-mail Institucional</label>
                        <input 
                          type="email" 
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="direcao@escola.com.br"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <Send size={16} />
                        <span>Solicitar Apresentação VIP</span>
                      </button>

                      <div className="pt-2 text-center">
                        <span className="text-[11px] text-slate-400 block mb-2">ou fale direto com o consultor:</span>
                        <a
                          href="https://wa.me/5541995587898?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20especialista%20sobre%20o%20Studia."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-emerald-950/60 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <MessageCircle size={15} />
                          <span>Studia COP</span>
                        </a>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <StudiaLogo width={160} height={44} variant="dark" />
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-slate-400">
            <button onClick={() => scrollToSection('apresentacao')} className="hover:text-white transition-colors cursor-pointer">Apresentação</button>
            <button onClick={() => scrollToSection('como-funciona')} className="hover:text-white transition-colors cursor-pointer">Como Funciona</button>
            <button onClick={() => scrollToSection('precos')} className="hover:text-white transition-colors cursor-pointer">Planos</button>
            <button onClick={onGoToPortal} className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer">Portal Escolar</button>
          </div>

          <div className="text-slate-500 text-center md:text-right">
            <p>© 2026 Studia SaaS — Todos os direitos reservados.</p>
            <p className="text-[11px] mt-0.5">Criptografia de nível institucional com sincronização em tempo real.</p>
          </div>
        </div>
      </footer>

      {/* Checkout Modal PIX / Cartão */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={selectedPlan}
        onSuccessLogin={() => {
          setIsCheckoutOpen(false);
          onOpenAuth('login');
        }}
      />

      {/* Botão Flutuante de WhatsApp */}
      <a
        href="https://wa.me/5541995587898?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20a%20plataforma%20Studia%20para%20minha%20escola."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-950/60 hover:scale-105 transition-all group cursor-pointer border border-emerald-400/40"
        title="Studia COP"
      >
        <MessageCircle size={22} className="shrink-0" />
        <span className="text-xs font-bold font-display hidden sm:inline">Studia COP</span>
      </a>
    </div>
  );
}
