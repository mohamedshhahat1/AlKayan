"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import { Award, Users, Clock, Sparkles, DollarSign, ShieldCheck, Headset } from "lucide-react";

const features = [
  { icon: Award, title: "جودة فائقة", desc: "نلتزم بأعلى معايير الجودة في كل تفصيل من تفاصيل المشروع" },
  { icon: Users, title: "فريق محترف", desc: "نخبة من المهندسين والفنيين ذوي الخبرة الواسعة" },
  { icon: Clock, title: "التزام بالمواعيد", desc: "نسلم مشاريعنا في الوقت المحدد دون تأخير" },
  { icon: Sparkles, title: "أحدث التصاميم", desc: "نواكب أحدث الاتجاهات العالمية في التصميم والتنفيذ" },
  { icon: DollarSign, title: "أسعار تنافسية", desc: "أفضل قيمة مقابل السعر بدون أي تنازل عن الجودة" },
  { icon: ShieldCheck, title: "ضمان شامل", desc: "نقدم ضماناً على جميع أعمالنا لراحة بالك التامة" },
  { icon: Headset, title: "خدمة ما بعد البيع", desc: "نرافقك حتى بعد التسليم بخدمات صيانة ومتابعة" },
];

export function WhyChooseUsSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 navy-gradient opacity-50" />

      <div className="relative container-luxury">
        <SectionHeading
          eyebrow="لماذا الكيان"
          title="ما يميزنا عن غيرنا"
          subtitle="نحن لا ننفذ مشاريع فحسب، بل نبني علاقات ثقة طويلة الأمد مع عملائنا"
        />

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.1} y={40}>
              <div className="group relative glass rounded-2xl p-8 h-full text-center hover:border-gold/30 transition-all duration-500 hover:-translate-y-2">
                <div className="inline-flex w-16 h-16 rounded-2xl glass-gold items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gold transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
