import React from 'react';
import { Car, MapPin, Brain, ShieldCheck, ChevronLeft } from 'lucide-react';

export function VariantC() {
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-slate-950 text-slate-50 font-sans relative overflow-hidden flex justify-center">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-60 pointer-events-none" />

      <div className="w-full max-w-[390px] relative z-10 flex flex-col px-6 pt-12 pb-8 min-h-full">
        {/* Header / Logo */}
        <header className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent" />
            <Car className="w-6 h-6 text-emerald-400 relative z-10" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            JO <span className="text-emerald-400">Driver</span>
          </span>
        </header>

        {/* Hero Content */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold leading-[1.3] mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500">
            طريقك نحو <br />
            رخصة القيادة <br />
            <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">يبدأ هنا</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-[280px]">
            المنصة الأذكى والأسرع للتدريب على الامتحان النظري في الأردن.
          </p>
        </div>

        {/* Neon Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { value: "+500", label: "سؤال محدث" },
            { value: "6", label: "فئات تدريب" },
            { value: "مجاناً", label: "الوصول الأساسي" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center py-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]">
              <span className="text-xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] mb-1">
                {stat.value}
              </span>
              <span className="text-[10px] text-slate-400 text-center font-medium px-1 leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Glassmorphism Feature List */}
        <div className="flex flex-col gap-4 mb-12">
          {[
            { icon: ShieldCheck, title: "الامتحان النظري الرسمي", desc: "محاكاة دقيقة لامتحان إدارة الترخيص بـ 60 سؤال و 60 دقيقة." },
            { icon: Brain, title: "مذاكرة ذكية", desc: "خوارزمية تركز على نقاط ضعفك في الإشارات والأولويات." },
            { icon: MapPin, title: "خريطة المدارس", desc: "ابحث عن أقرب مراكز التدريب المعتمدة في محافظتك." },
          ].map((feature, i) => (
            <div key={i} className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800/70 hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-12 h-12 shrink-0 rounded-full bg-slate-900/80 flex items-center justify-center border border-slate-700 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                <feature.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="pt-1">
                <h3 className="text-base font-bold text-slate-100 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mt-auto pt-4">
          <button className="w-full py-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-lg hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 active:scale-[0.98]">
            ابدأ الاختبار الآن
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-full py-4 rounded-full bg-transparent text-slate-300 font-semibold text-base hover:bg-slate-800/80 hover:text-white transition-all border border-slate-700 active:scale-[0.98]">
            تعرف على المميزات
          </button>
        </div>
      </div>
    </div>
  );
}

export default VariantC;
