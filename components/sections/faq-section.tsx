"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "ما هي مدة تنفيذ المشروع؟",
    a: "تختلف مدة التنفيذ حسب نوع وحجم المشروع. الشقق السكنية تستغرق عادة 60-90 يوماً، بينما الفلل قد تستغرق 120-180 يوماً. نقدم لك جدولاً زمنياً دقيقاً بعد الاستشارة الأولى.",
  },
  {
    q: "هل تقدمون ضماناً على الأعمال؟",
    a: "نعم، نقدم ضماناً شاملاً على جميع أعمالنا. مدة الضمان تختلف حسب نوع العمل، وتصل إلى سنتين للأعمال الإنشائية وسنة للتشطيبات والديكورات.",
  },
  {
    q: "هل يمكنني رؤية المشروع قبل التنفيذ؟",
    a: "بالتأكيد. نوفر تصاميم ثلاثية الأبعاد وعروضاً واقعية لمشروعك قبل بدء التنفيذ، حتى تتمكن من رؤية كل تفصيلة والموافقة عليها.",
  },
  {
    q: "كيف يتم تحديد تكلفة المشروع؟",
    a: "نقوم بزيارة الموقع مجاناً ثم نقدم عرض سعر مفصلاً وشفافاً يشمل جميع التكاليف بدون أي رسوم خفية. السعر يعتمد على المساحة، الخامات المطلوبة، ونوع التشطيب.",
  },
  {
    q: "هل تعملون في جميع المدن؟",
    a: "نعمل في جميع المدن الرئيسية بالمملكة العربية السعودية. للاستفسار عن توفر الخدمة في مدينتك، يرجى التواصل معنا عبر نموذج الاتصال أو الواتساب.",
  },
  {
    q: "هل يمكنني تعديل التصميم أثناء التنفيذ؟",
    a: "نعم، نرحب بتعديلاتك في مرحلة التصميم. أما أثناء التنفيذ، فالتعديلات الممكنة تعتمد على مرحلة العمل الحالية وقد تؤثر على التكلفة والجدول الزمني.",
  },
  {
    q: "ما هي طرق الدفع المتاحة؟",
    a: "نقدم خطط دفع مرنة على دفعات مرتبطة بمراحل المشروع. نقبل التحويل البنكي والشيكات. يتم الاتفاق على جدول الدفع في عقد المشروع.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="الأسئلة الشائعة"
          title="إجابات على أكثر تساؤلاتكم"
          subtitle="جمعنا لكم الأسئلة الأكثر تكراراً لتسهيل رحلتكم معنا"
        />

        <Reveal delay={0.2} className="mt-16 max-w-3xl mx-auto">
          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass rounded-2xl px-6 border border-white/10 data-[state=open]:border-gold/30 transition-colors duration-300"
              >
                <AccordionTrigger className="text-right hover:no-underline py-6 group">
                  <span className="flex items-center justify-between w-full gap-4">
                    <span className="text-base font-bold text-white group-data-[state=open]:text-gold transition-colors duration-300">
                      {faq.q}
                    </span>
                    <ChevronDown className="w-5 h-5 text-gold flex-shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed pb-6 pt-2">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
