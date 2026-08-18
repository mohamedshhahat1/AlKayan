"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import {
  ArrowUpLeft,
  Award,
  Clock3,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Award,
    title: "جودة استثنائية",
    desc: "نختار الخامات وننفذ كل تفصيلة بمعايير دقيقة.",
  },
  {
    icon: Users,
    title: "فريق متخصص",
    desc: "مهندسون وفنيون بخبرة حقيقية في التنفيذ.",
  },
  {
    icon: Clock3,
    title: "التزام واضح",
    desc: "خطة تنفيذ دقيقة ومواعيد تسليم واضحة من البداية.",
  },
  {
    icon: ShieldCheck,
    title: "ضمان وثقة",
    desc: "نظل معك حتى بعد التسليم لضمان أفضل تجربة.",
  },
];

const stats = [
  { value: "+15", label: "سنة خبرة" },
  { value: "+250", label: "مشروع مكتمل" },
  { value: "100%", label: "رضا والتزام" },
];

export function AboutSection() {
  return (
    <section
      id="about"
      dir="rtl"
      className="relative overflow-hidden bg-background py-20 sm:py-24 lg:py-32"
    >
      {/* Soft luxury background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-12%] top-[12%] h-[360px] w-[360px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-8%] h-[300px] w-[300px] rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <div className="container-luxury relative z-10">
        <SectionHeading
          eyebrow="من نحن"
          title="نصنع مساحات تستحق أن تُعاش"
          subtitle="في الكيان، لا نتعامل مع التشطيبات كمرحلة تنفيذ فقط، بل نصنع تجربة متكاملة تبدأ من الفكرة وتنتهي بمساحة تحمل طابعك."
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          {/* Image */}
          <Reveal>
            <div className="group relative overflow-hidden rounded-[2rem]">
              <div className="aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
                <img
                  src="https://images.pexels.com/photos/7722168/pexels-photo-7722168.jpeg?auto=compress&cs=tinysrgb&w=1600"
                  alt="تصميم داخلي فاخر من تنفيذ الكيان"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>

              {/* Minimal overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

              {/* Floating years card */}
              <div className="absolute bottom-5 right-5 rounded-2xl border border-white/15 bg-black/35 px-5 py-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-black">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div>
                    <div className="text-lg font-black text-white">+15</div>
                    <div className="text-[11px] text-white/65">
                      سنة من الخبرة
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Content */}
          <Reveal delay={0.12}>
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-gold">
                <span className="h-px w-8 bg-gold" />
                EL KAYAN
              </span>

              <h3 className="mt-5 text-3xl font-black leading-[1.25] tracking-tight text-foreground sm:text-4xl lg:text-[46px]">
                التفاصيل الصغيرة
                <br />
                تصنع <span className="gold-gradient-text">الفرق الكبير</span>
              </h3>

              <p className="mt-6 text-sm leading-8 text-muted-foreground sm:text-base">
                نؤمن أن المساحة الناجحة ليست مجرد شكل جميل، بل مزيج متوازن من
                التصميم، الجودة، الدقة، والوظيفة. لذلك نعمل معك من أول تصور وحتى
                آخر تفصيلة في المشروع.
              </p>

              {/* Features */}
              <div className="mt-9 divide-y divide-border/70 border-y border-border/70">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="group flex items-start gap-4 py-5"
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.07] text-gold transition-all duration-300 group-hover:border-gold/40 group-hover:bg-gold group-hover:text-black">
                        <Icon className="h-[18px] w-[18px]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-sm font-extrabold text-foreground sm:text-base">
                            {feature.title}
                          </h4>

                          <ArrowUpLeft className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-gold" />
                        </div>

                        <p className="mt-1.5 max-w-lg text-xs leading-6 text-muted-foreground sm:text-sm">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-black tracking-tight text-gold sm:text-3xl">
                      {stat.value}
                    </div>

                    <div className="mt-1 text-[10px] font-medium text-muted-foreground sm:text-xs">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
