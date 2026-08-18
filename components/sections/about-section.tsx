"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import {
  Award,
  Users,
  Clock,
  Sparkles,
  DollarSign,
  ShieldCheck,
  Headset,
  ArrowUpLeft,
} from "lucide-react";

/**
 * Premium About / Why Us section.
 * Combines one strong brand statement with compact differentiators.
 */
const features = [
  { icon: Award, title: "جودة فائقة", desc: "أعلى معايير الجودة في كل تفصيلة" },
  { icon: Users, title: "فريق محترف", desc: "نخبة من المهندسين والفنيين" },
  { icon: Clock, title: "التزام بالمواعيد", desc: "تسليم في الوقت المحدد دون تأخير" },
  { icon: Sparkles, title: "أحدث التصاميم", desc: "نواكب أحدث الاتجاهات العالمية" },
  { icon: DollarSign, title: "أسعار تنافسية", desc: "أفضل قيمة دون تنازل عن الجودة" },
  { icon: ShieldCheck, title: "ضمان شامل", desc: "ضمان على جميع الأعمال" },
  { icon: Headset, title: "ما بعد التسليم", desc: "صيانة ومتابعة بعد التسليم" },
];

const stats = [
  { value: "+15", label: "سنة خبرة" },
  { value: "+250", label: "مشروع مكتمل" },
  { value: "100%", label: "التزام وجودة" },
];

export function AboutSection() {
  return (
    <section
      id="about"
      dir="rtl"
      className="relative overflow-hidden py-20 lg:py-28"
    >
      {/* Premium background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full opacity-20 blur-[90px]"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.55), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[-18%] left-[-8%] h-[460px] w-[460px] rounded-full opacity-10 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.35), transparent 68%)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(212,175,55,0.03),transparent)]" />
      </div>

      <div className="container-luxury relative z-10">
        <SectionHeading
          eyebrow="من نحن"
          title="رحلة متكاملة من الفكرة إلى الواقع"
          subtitle="شركة الكيان تقدم حلولاً شاملة في المقاولات والتشطيبات الداخلية، ونرافقك في كل خطوة نحو مساحة أحلامك"
        />

        <div className="mt-12 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-7">
          {/* Hero brand card */}
          <Reveal>
            <div className="group relative h-full min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-2xl shadow-black/20">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url(https://images.pexels.com/photos/7722168/pexels-photo-7722168.jpeg?auto=compress&cs=tinysrgb&w=1920)",
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/55 to-black/20" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(212,175,55,0.28),transparent_36%)]" />
              <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-l from-transparent via-gold/60 to-transparent" />

              <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold text-gold backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    تشطيبات فاخرة بتفاصيل استثنائية
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md">
                    من التصميم إلى التسليم
                  </span>
                </div>

                <div className="max-w-xl">
                  <h3 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                    نحوّل المساحات إلى{" "}
                    <span className="gold-gradient-text">تحف فنية</span>
                    <br />
                    تعكس ذوقك وتدوم لسنوات
                  </h3>

                  <p className="mt-5 max-w-lg text-sm leading-8 text-white/72 sm:text-base">
                    خبرة تمتد لأكثر من 15 عاماً في تنفيذ مشاريع سكنية وتجارية
                    فاخرة بأعلى معايير الجودة العالمية، من التصميم الأولي وحتى
                    تسليم المفتاح.
                  </p>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {stats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-center backdrop-blur-md transition duration-300 hover:border-gold/40 hover:bg-gold/[0.08]"
                      >
                        <div className="text-2xl font-black text-gold">
                          {item.value}
                        </div>
                        <div className="mt-1 text-[11px] font-medium text-white/65">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Differentiators */}
          <Reveal delay={0.15}>
            <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((f, index) => (
                <div
                  key={f.title}
                  className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-gold/[0.06] hover:shadow-2xl hover:shadow-gold/10 ${
                    index === features.length - 1
                      ? "sm:col-span-2"
                      : ""
                  }`}
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold/15 blur-2xl" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/70 to-transparent" />
                  </div>

                  <div className="relative flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold transition-all duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-black">
                      <f.icon className="h-5 w-5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="block text-base font-extrabold text-foreground transition-colors duration-300 group-hover:text-gold">
                          {f.title}
                        </span>

                        <ArrowUpLeft className="h-4 w-4 shrink-0 text-gold/0 transition-all duration-300 group-hover:text-gold/80" />
                      </span>

                      <span className="mt-2 block text-sm leading-7 text-muted-foreground">
                        {f.desc}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
