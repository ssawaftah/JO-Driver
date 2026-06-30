import React from "react";
import { Car, MapPin, BookOpen, ChevronLeft, CheckCircle, Target, Navigation, ShieldCheck } from "lucide-react";

export function VariantA() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-6 py-12">
        {/* Header / Brand */}
        <header className="flex items-center justify-between mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Car className="w-6 h-6 text-white" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                JO Driver
              </h1>
              <p className="text-xs text-blue-400 font-medium tracking-wider uppercase">Jordan</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center">
          <div className="space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              منصة التدريب الأولى
            </div>
            
            <h2 className="text-4xl leading-[1.2] font-black animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              استعد لرخصة <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">القيادة الأردنية</span>
            </h2>
            
            <p className="text-slate-400 text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              تدرب على أسئلة الفحص النظري، اختبر جاهزيتك، واعثر على أفضل مراكز التدريب بسهولة.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 mb-1">امتحان نظري واقعي</h3>
                <p className="text-sm text-slate-400">محاكاة دقيقة للامتحان الرسمي (60 سؤال / 60 دقيقة)</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 mb-1">دراسة حسب الأقسام</h3>
                <p className="text-sm text-slate-400">شواخص، ميكانيك، أولويات، وقواعد السير</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 mb-1">مراكز التدريب</h3>
                <p className="text-sm text-slate-400">خريطة تفاعلية لأقرب المراكز المعتمدة</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12 pt-6 border-t border-white/10 animate-in fade-in duration-700 delay-700">
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">+500</div>
              <div className="text-xs text-slate-400 font-medium">سؤال حديث</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">6</div>
              <div className="text-xs text-slate-400 font-medium">أقسام شاملة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-400 mb-1">100%</div>
              <div className="text-xs text-slate-400 font-medium">مجاني</div>
            </div>
          </div>
        </main>

        {/* Footer CTA */}
        <div className="mt-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1000">
          <button className="relative group w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-lg py-4 rounded-2xl overflow-hidden transition-all hover:bg-blue-500 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200" />
            
            <span className="relative flex items-center gap-2">
              ابدأ الآن
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VariantA;
