import React, { useState, useEffect, useRef } from 'react';
import { Users, Target, Shield, ChevronRight, ArrowRight, TrendingUp, Check, Zap, Lock, UserPlus, BarChart3, Vote, FileText, Menu, X, Play, ExternalLink, Calendar, Award, ChevronDown } from 'lucide-react';

// Animated counter with easing
const AnimatedCounter = ({ end, duration = 2500, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString('uk-UA')}{suffix}</span>;
};

// Progress bar component
const ProgressToMillion = ({ current }) => {
  const percentage = (current / 1000000) * 100;
  const milestones = [
    { value: 10000, label: '10K' },
    { value: 100000, label: '100K' },
    { value: 300000, label: '300K' },
    { value: 1000000, label: '1M' },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>0</span>
        {milestones.map(m => (
          <span key={m.value} className={current >= m.value ? 'text-amber-400' : ''}>
            {m.label}
          </span>
        ))}
      </div>
      <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-1000"
          style={{ width: `${Math.max(percentage, 0.5)}%` }}
        />
        {milestones.map(m => (
          <div
            key={m.value}
            className="absolute top-0 bottom-0 w-0.5 bg-gray-600"
            style={{ left: `${(m.value / 1000000) * 100}%` }}
          />
        ))}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-amber-400 flex items-center justify-center"
          style={{ left: `calc(${Math.max(percentage, 0.5)}% - 12px)` }}
        >
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="text-amber-400 font-bold text-lg">{percentage.toFixed(2)}%</span>
        <span className="text-gray-500 text-sm ml-2">до мети</span>
      </div>
    </div>
  );
};

export default function MerezhaRedesign() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentMembers] = useState(4569);
  const [weeklyJoins] = useState(35);

  const navItems = [
    { id: 'home', label: 'Головна' },
    { id: 'manifest', label: 'Маніфест' },
    { id: 'about', label: 'Про нас' },
    { id: 'news', label: 'Новини' },
    { id: 'contacts', label: 'Контакти' },
  ];

  const reasons = [
    {
      icon: Target,
      title: 'Право на самозахист',
      description: 'Головна вимога — закон про зброю самозахисту для законослухняних громадян'
    },
    {
      icon: Users,
      title: '1,000,000 громадян',
      description: 'Згуртувавши мільйон — отримаємо 10-12% електорату та реальний вплив'
    },
    {
      icon: Vote,
      title: 'Контроль над владою',
      description: 'Громадяни як "акціонери республіки", що наймають політиків на роботу'
    },
    {
      icon: Shield,
      title: 'Імперативний мандат',
      description: 'Механізм відкликання депутатів, які не виконують наші вимоги'
    },
  ];

  const timeline = [
    { date: 'Серпень 2024', event: 'Початок розбудови Мережі', icon: Zap },
    { date: '8 грудня 2024', event: 'Установчі збори — 1,277 учасників', icon: Users },
    { date: '10 лютого 2025', event: 'Офіційна реєстрація в Мін\'юсті', icon: FileText },
    { date: '1 травня 2025', event: '2,238 батьків-засновників', icon: Award },
    { date: 'Сьогодні', event: `${currentMembers.toLocaleString()} членів`, icon: TrendingUp },
  ];

  const leaders = [
    { name: 'Георгій Учайкін', role: 'Голова Спостережної ради', org: 'УАВЗ, "ЗБРОЙОВИЙ ЛОБІСТ"' },
    { name: 'Руслан Рохов', role: 'Виконавчий директор', org: 'PGR CONSULTING GROUP' },
    { name: 'Володимир Гаркуша', role: 'Член ради', org: 'IT-підприємець' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Unbounded:wght@400;500;600;700;800;900&display=swap');
        
        * { box-sizing: border-box; }
        
        .font-display { font-family: 'Unbounded', sans-serif; }
        
        .gradient-gold {
          background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .bg-grid {
          background-image: 
            linear-gradient(rgba(251, 191, 36, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.4);
        }
        
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        
        .btn-primary:hover::after {
          transform: translateX(100%);
        }
        
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px);
          border-color: rgba(251, 191, 36, 0.3);
        }
        
        .counter-glow {
          text-shadow: 0 0 60px rgba(251, 191, 36, 0.5), 0 0 120px rgba(251, 191, 36, 0.3);
        }
        
        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        
        .hero-gradient {
          background: 
            radial-gradient(ellipse at 30% 20%, rgba(251, 191, 36, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, #0a0b0f 0%, #0d0e14 100%);
        }
        
        .border-glow {
          box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.1);
        }
        
        .live-indicator {
          animation: live-pulse 2s ease-in-out infinite;
        }
        
        @keyframes live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="font-display font-bold text-black text-lg md:text-xl">М</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-bold text-sm md:text-base tracking-tight">МЕРЕЖА</div>
                <div className="text-[10px] md:text-xs text-gray-500 tracking-widest">ВІЛЬНИХ ЛЮДЕЙ</div>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map(item => (
                <a 
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-sm text-gray-400 hover:text-white transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all" />
                </a>
              ))}
            </div>

            {/* Live Counter + CTA */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass">
                <span className="w-2 h-2 bg-green-400 rounded-full live-indicator" />
                <span className="text-sm font-medium">{currentMembers.toLocaleString()}</span>
                <span className="text-xs text-gray-500">членів</span>
              </div>
              
              <button className="btn-primary px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm font-semibold text-black flex items-center gap-2">
                <span className="hidden sm:inline">Доєднатись</span>
                <span className="sm:hidden">Вступ</span>
                <UserPlus className="w-4 h-4" />
              </button>

              <button 
                className="lg:hidden p-2 text-gray-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden glass border-t border-white/5 py-4 px-6">
            {navItems.map(item => (
              <a 
                key={item.id}
                href={`#${item.id}`}
                className="block py-3 text-lg text-gray-300 hover:text-amber-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen hero-gradient bg-grid flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8">
              {/* Badge */}
              <div className="slide-up stagger-1 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full live-indicator" />
                <span className="text-gray-400">+{weeklyJoins} цього тижня</span>
                <span className="text-amber-400 font-semibold">Приєднуйся!</span>
              </div>

              {/* Main Heading */}
              <h1 className="slide-up stagger-2 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1]">
                <span className="block">ГУРТУЄМО</span>
                <span className="block gradient-gold counter-glow">1,000,000</span>
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">ВІЛЬНИХ ЛЮДЕЙ</span>
              </h1>

              {/* Subheading */}
              <p className="slide-up stagger-3 text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl">
                Щоб <span className="text-white font-medium">змусити політиків</span> ухвалити закон про зброю самозахисту та виконувати наші вимоги
              </p>

              {/* CTAs */}
              <div className="slide-up stagger-4 flex flex-wrap gap-4">
                <button className="btn-primary px-8 py-4 rounded-full text-lg font-bold text-black flex items-center gap-3">
                  Вступити до Мережі
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a 
                  href="#manifest"
                  className="px-8 py-4 rounded-full border border-white/20 hover:border-amber-400/50 text-lg font-medium transition-all flex items-center gap-3"
                >
                  <FileText className="w-5 h-5" />
                  Маніфест
                </a>
              </div>

              {/* Quick Stats */}
              <div className="slide-up stagger-4 flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">Зареєстрована ГО</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">ЄДРПОУ 45854363</span>
                </div>
              </div>
            </div>

            {/* Right Content - Progress Counter */}
            <div className="relative">
              <div className="relative p-6 md:p-10 rounded-3xl glass border-glow">
                {/* Main Counter */}
                <div className="text-center mb-8">
                  <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">Членів у мережі зараз</div>
                  <div className="font-display text-6xl sm:text-7xl md:text-8xl font-black gradient-gold counter-glow">
                    <AnimatedCounter end={currentMembers} />
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">+{weeklyJoins} за тиждень</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <ProgressToMillion current={currentMembers} />

                {/* Milestones */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-amber-400">100K</div>
                    <div className="text-xs text-gray-500 mt-1">диктувати порядок денний</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-amber-400">1M</div>
                    <div className="text-xs text-gray-500 mt-1">ухвалити закон</div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-amber-400/50" />
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Чому це працює</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4">
              Логіка <span className="gradient-gold">колективного впливу</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((reason, index) => (
              <div 
                key={index}
                className="card-hover p-6 md:p-8 rounded-2xl glass border border-transparent"
              >
                <div className="w-14 h-14 rounded-xl bg-amber-400/10 flex items-center justify-center mb-6">
                  <reason.icon className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="font-display text-lg font-bold mb-3">{reason.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>

          {/* Key Quote */}
          <div className="mt-16 p-8 md:p-12 rounded-3xl glass border-glow text-center max-w-4xl mx-auto">
            <blockquote className="font-display text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed">
              "Політиків цікавить лише дві речі — <span className="text-amber-400">виграти вибори</span> та <span className="text-amber-400">виграти перевибори</span>. Відтак, щоб змусити їх виконувати суспільний запит, ми маємо мати спроможність <span className="text-amber-400">впливати на результати виборів</span>."
            </blockquote>
            <div className="mt-6 text-gray-500">— Маніфест Мережі Вільних Людей</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-amber-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Механізм</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4">
              Як це <span className="gradient-gold">працює</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '01',
                title: 'Гуртуємо мільйон',
                description: 'Кожен член Мережі запрошує друзів через реферальне посилання. Геометрична прогресія!'
              },
              {
                step: '02',
                title: 'Формуємо вимоги',
                description: 'Голосуємо за програму. Перша вимога — закон про зброю. Решту узгодимо на 100K членів.'
              },
              {
                step: '03',
                title: 'Наймаємо політиків',
                description: 'Фінансуємо кампанії тих, хто погоджується виконувати наші вимоги. Контролюємо після виборів.'
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-7xl md:text-8xl font-display font-black text-white/5 absolute -top-8 -left-4">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <h3 className="font-display text-xl md:text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 text-gray-700">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Analogy Box */}
          <div className="mt-16 p-6 md:p-8 rounded-2xl bg-amber-400/5 border border-amber-400/20 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg mb-2">Аналогія з ОСББ</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Мережа — це як загальнонаціональне ОСББ. Мешканці (громадяни) самі вирішують, що треба зробити, скидаються грошима і <span className="text-white">наймають управителя (політика)</span>. Якщо управитель не виконує роботу — його звільняють і наймають іншого.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Історія</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4">
              Наш <span className="gradient-gold">шлях</span>
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-amber-400/50 to-gray-800" />

            {timeline.map((item, index) => (
              <div 
                key={index}
                className={`relative flex items-start gap-6 md:gap-12 mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Icon */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-12 h-12 rounded-full bg-[#0a0b0f] border-2 border-amber-400 flex items-center justify-center z-10">
                  <item.icon className="w-5 h-5 text-amber-400" />
                </div>

                {/* Content */}
                <div className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                  <div className="text-amber-400 text-sm font-medium mb-1">{item.date}</div>
                  <div className="font-display font-bold text-lg">{item.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaders Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Керівництво</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4">
              Хто <span className="gradient-gold">веде</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {leaders.map((leader, index) => (
              <div key={index} className="card-hover p-6 rounded-2xl glass border border-transparent text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="font-display font-bold text-lg">{leader.name}</h3>
                <div className="text-amber-400 text-sm mt-1">{leader.role}</div>
                <div className="text-gray-500 text-xs mt-2">{leader.org}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a href="#about" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
              Повний склад керівних органів
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-grid opacity-50" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-8">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-gray-400">Щотижня до нас приєднуються десятки громадян</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
            Для гуртування мільйону<br />
            <span className="gradient-gold">потрібні Ви!</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Якщо кожен із нас щотижня залучатиме хоча б одну людину — ми подвоюватимемо кількість членів щотижня. Геометрична прогресія!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary px-10 py-5 rounded-full text-xl font-bold text-black flex items-center justify-center gap-3">
              Доєднатись до Мережі
              <ArrowRight className="w-6 h-6" />
            </button>
            <a 
              href="https://www.youtube.com/@ZBROIOVYILOBIST"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 rounded-full border border-white/20 hover:border-amber-400/50 text-xl font-medium transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
              ЗБРОЙОВИЙ ЛОБІСТ
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Захищені дані
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Прозора звітність
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Офіційно зареєстрована ГО
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="font-display font-bold text-black text-xl">М</span>
                </div>
                <div>
                  <div className="font-display font-bold">МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ</div>
                  <div className="text-xs text-gray-500">Громадянська мережа політичного впливу</div>
                </div>
              </div>
              <p className="text-gray-500 text-sm max-w-md mb-6">
                Місія мережі — подолання набутої громадянської безпорадності шляхом формування колективної спроможності заподіювати громадянський вплив.
              </p>
              <div className="flex gap-4">
                {['youtube', 'telegram', 'facebook'].map(social => (
                  <a 
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-amber-400/10 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-display font-bold mb-4">Навігація</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {['Головна', 'Маніфест', 'Про нас', 'Новини', 'Контакти'].map(link => (
                  <li key={link}>
                    <a href="#" className="hover:text-amber-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-bold mb-4">Контакти</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>📧 info@freepeople.org.ua</li>
                <li>📞 097 782 6978</li>
                <li className="text-xs">
                  ГО "МЕРЕЖА ВІЛЬНИХ ЛЮДЕЙ"<br />
                  ЄДРПОУ 45854363
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div>© 2025 Громадянська мережа політичного впливу вільних людей</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-amber-400 transition-colors">Умови користування</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Політика конфіденційності</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
