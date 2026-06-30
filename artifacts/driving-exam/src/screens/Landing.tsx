import { Car, ShieldCheck, ChevronLeft, FileQuestion, BookOpen, MapPin, Layers, Gift, CheckCircle2 } from "lucide-react";

interface Props { onStart: () => void; }

export default function Landing({ onStart }: Props) {
  return (
    <div
      dir="rtl"
      style={{ fontFamily: "var(--font-sans, 'Tajawal', sans-serif)" }}
      className="min-h-screen bg-slate-50 flex flex-col items-center pb-12 w-full relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-indigo-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <header className="w-full px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">JO Driver</span>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
          الأردن 🇯🇴
        </span>
      </header>

      <main className="flex-1 w-full px-6 flex flex-col relative z-10 mt-2 max-w-lg mx-auto">

        {/* Trust badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-4 py-2 shadow-sm">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold">معتمد وفق معايير دائرة الترخيص الأردنية</span>
          </div>
        </div>

        {/* Hero text */}
        <section className="text-center mb-7 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-snug mb-3">
            منصتك الأولى للتحضير<br />لاختبار القيادة النظري
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-7 max-w-xs">
            استعد لامتحان السواقة بثقة تامة مع أسئلة محدثة ومطابقة للامتحان الرسمي.
          </p>

          <button
            onClick={onStart}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl h-14 text-lg font-bold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all"
          >
            ابدأ رحلتك الآن
            <ChevronLeft className="w-5 h-5" />
          </button>
        </section>

        {/* Hero card */}
        <div className="w-full h-44 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-7 shadow-xl shadow-blue-900/15 relative overflow-hidden">
          {/* road lines pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="road" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 20 40" stroke="white" strokeWidth="2" strokeDasharray="6 6" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#road)" />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex flex-col text-right">
                <span className="font-bold text-slate-900 text-sm">نتيجة الامتحان</span>
                <span className="text-sm font-semibold text-green-600">ناجح — 58 / 60</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: FileQuestion, label: "سؤال",  value: "+500",     color: "text-blue-500",   bg: "bg-blue-50"   },
            { icon: Layers,       label: "أقسام", value: "6",        color: "text-indigo-500", bg: "bg-indigo-50" },
            { icon: Gift,         label: "مجاني", value: "100%",     color: "text-sky-500",    bg: "bg-sky-50"    },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="flex flex-col items-center text-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="font-extrabold text-slate-800 text-base leading-none mb-0.5">{value}</span>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 px-1 mb-1">ماذا نقدم لك؟</h2>

          {[
            {
              icon: FileQuestion,
              iconColor: "text-blue-600",
              iconBg: "bg-blue-50",
              hoverBg: "group-hover:bg-blue-600",
              title: "امتحان نظري واقعي",
              desc: "محاكاة كاملة لامتحان دائرة الترخيص مع مؤقت ونفس نظام التقييم الرسمي.",
            },
            {
              icon: BookOpen,
              iconColor: "text-indigo-600",
              iconBg: "bg-indigo-50",
              hoverBg: "group-hover:bg-indigo-600",
              title: "دراسة ذكية",
              desc: "أسئلة مقسمة حسب الفئات: الشواخص، الأولويات، والمخالفات للتركيز على نقاط ضعفك.",
            },
            {
              icon: MapPin,
              iconColor: "text-sky-500",
              iconBg: "bg-sky-50",
              hoverBg: "group-hover:bg-sky-500",
              title: "مراكز قريبة منك",
              desc: "ابحث عن أقرب مراكز التدريب المعتمدة واطلع على تقييمات المتدربين.",
            },
          ].map(({ icon: Icon, iconColor, iconBg, hoverBg, title, desc }) => (
            <div
              key={title}
              className="group bg-white rounded-3xl shadow-sm shadow-slate-200/60 hover:shadow-md transition-shadow border border-slate-100/80 p-5 flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-2xl ${iconBg} ${hoverBg} flex items-center justify-center shrink-0 transition-colors`}>
                <Icon className={`w-7 h-7 ${iconColor} group-hover:text-white transition-colors`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
