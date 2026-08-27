import React, { useState } from 'react';
import { 
  CalendarDays, 
  Smartphone, 
  Bot, 
  FileCheck, 
  Laptop, 
  LayoutDashboard, 
  Printer, 
  CheckCircle2,
} from 'lucide-react';

export interface RoutineStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  icon: React.ReactNode;
  themeColor: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    lightBg: string;
    shadow: string;
  };
}

export const ROUTINE_STEPS: RoutineStep[] = [
  {
    step: '01',
    title: 'Cadastro Ágil de Grade & Turmas',
    subtitle: 'Matriz Inteligente',
    description: 'A coordenação insere turnos, turmas, disciplinas e professores associados em segundos. O sistema detecta choques de horários e sobreposições automaticamente.',
    tag: 'Grade 100% blindada',
    icon: <CalendarDays size={22} />,
    themeColor: {
      bg: 'bg-blue-600',
      text: 'text-blue-600',
      border: 'border-blue-200 hover:border-blue-500',
      badgeBg: 'bg-blue-50 text-blue-700',
      lightBg: 'bg-blue-500/10',
      shadow: 'shadow-blue-500/20',
    },
  },
  {
    step: '02',
    title: 'Check-in Docente em 1 Toque',
    subtitle: 'Presença Mobile',
    description: 'Pelo smartphone, o professor confirma sua entrada na sala de aula logo ao chegar. A coordenação visualiza o status verde em tempo real sem precisar passar de sala em sala.',
    tag: 'Presença em tempo real',
    icon: <Smartphone size={22} />,
    themeColor: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-200 hover:border-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      lightBg: 'bg-emerald-500/10',
      shadow: 'shadow-emerald-500/20',
    },
  },
  {
    step: '03',
    title: 'Atestados & Licenças Digitais',
    subtitle: 'Afastamento sem Papel',
    description: 'O professor envia atestados e declarações médicas direto pelo app. O sistema notifica a direção e já pré-converte o horário em "Aula Vaga" para reposição imediata.',
    tag: 'Protocolo digital ágil',
    icon: <FileCheck size={22} />,
    themeColor: {
      bg: 'bg-amber-600',
      text: 'text-amber-600',
      border: 'border-amber-200 hover:border-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700',
      lightBg: 'bg-amber-500/10',
      shadow: 'shadow-amber-500/20',
    },
  },
  {
    step: '04',
    title: 'Substituição Inteligente Instantânea',
    subtitle: 'Zero Alunos Ociosos',
    description: 'Quando ocorre uma falta, o algoritmo Studia cruza os horários livres de outros professores e sugere substitutos compatíveis. A coordenação designa com apenas 1 clique.',
    tag: 'Substituição em 42 seg',
    icon: <Bot size={22} />,
    themeColor: {
      bg: 'bg-indigo-600',
      text: 'text-indigo-600',
      border: 'border-indigo-200 hover:border-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      lightBg: 'bg-indigo-500/10',
      shadow: 'shadow-indigo-500/20',
    },
  },
  {
    step: '05',
    title: 'Gestão & Reserva de Laboratórios',
    subtitle: 'Espaços Otimizados',
    description: 'Controle de agendamentos para salas de informática, laboratórios de ciências, robótica e quadras. Evita conflitos de turma e maximiza o uso da infraestrutura escolar.',
    tag: 'Fim dos conflitos de espaço',
    icon: <Laptop size={22} />,
    themeColor: {
      bg: 'bg-cyan-600',
      text: 'text-cyan-600',
      border: 'border-cyan-200 hover:border-cyan-500',
      badgeBg: 'bg-cyan-50 text-cyan-700',
      lightBg: 'bg-cyan-500/10',
      shadow: 'shadow-cyan-500/20',
    },
  },
  {
    step: '06',
    title: 'Painel da Coordenação em Tempo Real',
    subtitle: 'Visão 360° da Escola',
    description: 'Um dashboard dinâmico com o mapa de todas as salas ativas simultaneamente. Identifique num relance quais professores estão em aula, quais salas estão vagas e reposições ativas.',
    tag: 'Controle visual total',
    icon: <LayoutDashboard size={22} />,
    themeColor: {
      bg: 'bg-violet-600',
      text: 'text-violet-600',
      border: 'border-violet-200 hover:border-violet-500',
      badgeBg: 'bg-violet-50 text-violet-700',
      lightBg: 'bg-violet-500/10',
      shadow: 'shadow-violet-500/20',
    },
  },
  {
    step: '07',
    title: 'Relatórios Executivos & Grade Oficial A4',
    subtitle: 'Auditoria & Impressão',
    description: 'Gere gráficos de assiduidade por docente e exporte a grade completa diagramada em padrão oficial A4 Paisagem, pronta para afixação no mural ou prestação de contas.',
    tag: 'Exportação e auditoria A4',
    icon: <Printer size={22} />,
    themeColor: {
      bg: 'bg-rose-600',
      text: 'text-rose-600',
      border: 'border-rose-200 hover:border-rose-500',
      badgeBg: 'bg-rose-50 text-rose-700',
      lightBg: 'bg-rose-500/10',
      shadow: 'shadow-rose-500/20',
    },
  },
];

export default function RoutineMarquee() {
  const [isHovered, setIsHovered] = useState(false);

  // Duplicamos a lista para criar o loop contínuo infinito
  const doubleSteps = [...ROUTINE_STEPS, ...ROUTINE_STEPS];

  return (
    <div className="relative w-full py-4 overflow-hidden">
      {/* Máscaras de Gradiente nas bordas para suavizar a entrada e saída */}
      <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Container do Marquee Contínuo */}
      <div 
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <div 
          className="flex gap-6 py-6 px-4 no-scrollbar select-none"
        >
          <div 
            className="flex gap-6 shrink-0 animate-marquee-slow"
            style={{
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
          >
            {doubleSteps.map((step, index) => (
              <div
                key={`${step.step}-${index}`}
                className={`w-[320px] sm:w-[370px] bg-slate-50 border rounded-3xl p-7 space-y-5 relative transition-all duration-300 flex flex-col justify-between shrink-0 hover:shadow-2xl hover:-translate-y-2 group ${step.themeColor.border} bg-slate-50/95`}
              >
                {/* Topo do Card: Número do Passo + Ícone */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 ${step.themeColor.bg} text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${step.themeColor.shadow} font-display group-hover:scale-110 transition-transform duration-300`}>
                      {step.step}
                    </div>

                    <div className={`p-3 rounded-2xl ${step.themeColor.lightBg} ${step.themeColor.text}`}>
                      {step.icon}
                    </div>
                  </div>

                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${step.themeColor.badgeBg}`}>
                      {step.subtitle}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 font-display mt-2 leading-tight group-hover:text-blue-700 transition-colors">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>

                {/* Rodapé do Card: Benefício em Destaque */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-2.5 mt-2">
                  <CheckCircle2 size={16} className={`${step.themeColor.text} shrink-0`} />
                  <span className="text-xs font-bold text-slate-700 leading-tight">
                    {step.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
