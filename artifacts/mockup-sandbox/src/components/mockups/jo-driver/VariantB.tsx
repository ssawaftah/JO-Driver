import React from "react";
import { 
  Car, 
  MapPin, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronLeft,
  FileQuestion,
  Layers,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function VariantB() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans flex flex-col items-center pb-12 w-full max-w-[390px] mx-auto shadow-xl relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-indigo-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 pointer-events-none" />
      
      {/* Header */}
      <header className="w-full px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">JO Driver</span>
        </div>
        <Button variant="ghost" size="sm" className="text-blue-600 font-medium">
          دخول
        </Button>
      </header>

      <main className="flex-1 w-full px-6 flex flex-col relative z-10 mt-4">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm flex gap-1.5 items-center">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-medium">معتمد وفق معايير دائرة الترخيص الأردنية</span>
          </Badge>
        </div>

        {/* Hero Section */}
        <section className="text-center mb-8 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-[1.3] mb-4">
            منصتك الأولى للتحضير لاختبار القيادة النظري
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-[280px]">
            استعد لامتحان السواقة بثقة تامة مع أسئلة محدثة ومطابقة للامتحان الرسمي.
          </p>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 text-lg font-bold shadow-lg shadow-blue-600/20 group">
            ابدأ رحلتك الآن
            <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Button>
        </section>

        {/* Hero Illustration / Graphic */}
        <div className="w-full h-48 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-1 mb-8 shadow-xl shadow-blue-900/10 relative overflow-hidden">
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
          <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[22px] flex items-center justify-center border border-white/20 relative z-10">
             <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-in fade-in zoom-in duration-700">
               <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                 <CheckCircle2 className="w-7 h-7 text-green-600" />
               </div>
               <div className="flex flex-col text-right">
                 <span className="font-bold text-slate-900">نتيجة الامتحان</span>
                 <span className="text-sm font-medium text-green-600">ناجح - 58/60</span>
               </div>
             </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
            <FileQuestion className="w-6 h-6 text-blue-500 mb-2" />
            <span className="font-bold text-slate-800 text-sm mb-0.5">+500</span>
            <span className="text-xs text-slate-500">سؤال</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
            <Layers className="w-6 h-6 text-blue-500 mb-2" />
            <span className="font-bold text-slate-800 text-sm mb-0.5">6</span>
            <span className="text-xs text-slate-500">أقسام</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
            <Gift className="w-6 h-6 text-blue-500 mb-2" />
            <span className="font-bold text-slate-800 text-sm mb-0.5">مئة بالمئة</span>
            <span className="text-xs text-slate-500">مجاني</span>
          </div>
        </div>

        {/* Feature Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 px-1">ماذا نقدم لك؟</h2>
          
          <Card className="rounded-3xl border-0 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                <FileQuestion className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">امتحان نظري واقعي</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  محاكاة كاملة لامتحان إدارة السير الرسمي مع مؤقت ونفس نظام التقييم.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                <BookOpen className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">دراسة ذكية</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  أسئلة مقسمة حسب الفئات: الشواخص، الأولويات، والمخالفات للتركيز على نقاط ضعفك.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0 group-hover:bg-sky-500 transition-colors">
                <MapPin className="w-7 h-7 text-sky-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">مراكز قريبة منك</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ابحث عن أقرب مراكز التدريب المعتمدة واطلع على تقييمات المتدربين السابقين.
                </p>
              </div>
            </CardContent>
          </Card>

        </section>

      </main>
    </div>
  );
}

export default VariantB;
