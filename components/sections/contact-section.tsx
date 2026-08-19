"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { WhatsAppLink } from "@/components/whatsapp-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { isSupabaseConfigured } from "@/lib/supabase";
import { submitLead, type LeadSource } from "@/lib/leads";
import { bookingSchema, collectErrors, type BookingErrors } from "@/lib/validation";
import { siteConfig } from "@/lib/site-config";
import { trackContactSubmit, trackPhoneClick, trackQuoteRequest } from "@/lib/analytics";

/** Top six only, and collapsed by default so the block starts short. */
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
    q: "هل يمكنني روية المشروع قبل التنفيذ؟",
    a: "بالتأكيد. نوفر تصاميم ثلاثية الأبعاد وعروضاً واقعية لمشروعك قبل بدء التنفيذ، حتى تتمكن من روية كل تفصيلة والموافقة عليها.",
  },
  {
    q: "كيف يتم تحديد تكلفة المشروع؟",
    a: "نقوم بزيارة الموقع مجاناً ثم نقدم عرض سعر مفصلاً وشفافاً يشمل جميع التكاليف بدون أي رسوم خفية. السعر يعتمد على المساحة، الخامات المطلوبة، ونوع التشطيب.",
  },
  {
    q: "هل تعملون في جميع المحافطات؟",
    a: "نعمل في جميع المحافطات الرئيسية بجمهورية مصر العربية. للاستفسار عن توفر الخدمة في منطقتك، يرجى التواصل معنا عبر نموذج الاتصال أو الواتساب.",
  },
  {
    q: "ما هي طرق الدفع المتاحة؟",
    a: "نقدم خطط دفع مرنة على دفعات مرتبطة بمراحل المشروع. نقبل التحويل البنكي والشيكات. يتم الاتفاق على جدول الدفع في عقد المشروع.",
  },
];

const serviceOptions = [
  "تشطيب شقة",
  "تشطيب فيلا",
  "تشطيب مكتب",
  "تشطيب عيادة",
  "تشطيب مطعم",
  "تشطيب محل تجاري",
  "تصميم داخلي",
  "تصميم خارجي وواجهات",
  "تنسيق حدائق",
  "ترميم وتجديد",
  "إشراف هندسي",
  "أخرى",
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  service_type: "",
  preferred_date: "",
  message: "",
  company: "",
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export type ContactSectionProps = {
  /**
   * "cta" is the homepage: the ask, and two ways to act on it. "full" is the
   * contact page: FAQ, contact details and the booking form.
   */
  variant?: "full" | "cta";
  /** Recorded on the lead row and on the analytics event. Never trusted as input. */
  source?: LeadSource;
  /** Preselects the service dropdown, e.g. arriving from a service card. */
  defaultService?: string;
  /** Defaults to on for the full variant, off for the CTA. */
  showFaq?: boolean;
};

/**
 * The closing block: objections, then the ask, then the form. These were two
 * separate full-height sections making the same move.
 *
 * Note that #faq and #contact are two anchors inside this one section. The
 * section element itself carries no id: if it did, it would start at the FAQ
 * heading, and an in-page "تواصل معنا" link would scroll to the FAQ.
 */
export function ContactSection({
  variant = "full",
  source = "contact_page",
  defaultService,
  showFaq,
}: ContactSectionProps = {}) {
  const isCta = variant === "cta";
  const withFaq = showFaq ?? !isCta;

  const [form, setForm] = useState({ ...emptyForm, service_type: defaultService ?? "" });
  const [errors, setErrors] = useState<BookingErrors>({});
  const [state, setState] = useState<SubmitState>("idle");

  /**
   * A service arriving from a URL may not be one of the twelve options in the
   * dropdown — the catalogue has 26 entries. Rather than silently dropping the
   * visitor's intent, it is offered as its own option. Callers vet the value
   * against lib/services before passing it, so this cannot become a way to put
   * arbitrary text on the page.
   */
  const options =
    defaultService && !serviceOptions.includes(defaultService)
      ? [defaultService, ...serviceOptions]
      : serviceOptions;

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    // Clear the error as soon as the user starts correcting the field.
    setErrors((current) => (current[field as keyof BookingErrors] ? { ...current, [field]: undefined } : current));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      setState("idle");
      return;
    }

    // Honeypot: a real user never sees this field, so any value means a bot.
    // Pretend it worked so the bot does not retry. Nothing is stored and
    // nothing is reported — a bot is not a lead.
    if (form.company.trim() !== "") {
      setForm(emptyForm);
      setState("success");
      return;
    }

    setState("submitting");
    setErrors({});

    const { company, ...values } = parsed.data;
    const result = await submitLead(values, source);

    if (!result.ok) {
      setState("error");
      return;
    }

    setForm(emptyForm);
    setState("success");

    // Only after Supabase has accepted the row: a reported conversion that was
    // never stored is worse than no report at all. The service name comes from a
    // fixed list; the name, phone, email and message the visitor typed are not
    // passed on, and there is nowhere in AnalyticsParams to put them.
    const serviceName = values.service_type || undefined;
    trackContactSubmit({ source, serviceName });
    if (serviceName) trackQuoteRequest({ source, serviceName });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="relative py-14 lg:py-20">
      <div className="container-luxury">
        {/* FAQ */}
        {withFaq && (
          <div id="faq">
            <SectionHeading
              eyebrow="الأسئلة الشائعة"
              title="إجابات على أكثر تساءلاتكم"
            />

            <Reveal delay={0.15} className="mt-8 max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="glass rounded-xl px-5 border border-border data-[state=open]:border-gold/30 transition-colors duration-300"
                  >
                    <AccordionTrigger className="text-right hover:no-underline py-4 group">
                      <span className="flex items-center justify-between w-full gap-4">
                        <span className="text-sm font-bold text-foreground group-data-[state=open]:text-gold transition-colors duration-300">
                          {faq.q}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gold flex-shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 pt-1">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        )}

        {/* Compact CTA, replacing the old full-width contact header. This is
            where an in-page "تواصل معنا" lands. */}
        <div id="contact" className={withFaq ? "mt-12" : undefined}>
          <Reveal>
            <div className="glass rounded-3xl border border-gold/20 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 text-center lg:text-right">
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground">
                  جاهز لبدء <span className="gold-gradient-text">مشروعك؟</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  معاينة واستشارة مجانية، ورد من فريقنا خلال 24 ساعة
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                <a
                  href={siteConfig.contact.telHref}
                  onClick={() => trackPhoneClick({ placement: isCta ? "home_cta" : "contact_cta" })}
                  className="shimmer-btn gold-gradient-bg font-bold text-sm px-7 py-3 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{ color: "#111111" }}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  اتصل الآن
                </a>

                <WhatsAppLink
                  placement={isCta ? "home_cta" : "contact_cta"}
                  className="glass-light border border-border text-foreground font-bold text-sm px-7 py-3 rounded-full flex items-center justify-center gap-2 hover:text-gold hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-gold" />
                  واتساب
                </WhatsAppLink>

                {/* The homepage has no form on it, so it needs a way to the one
                    that does. Counted as a quote request: it is someone heading
                    for the booking form on purpose. */}
                {isCta && (
                  <Link
                    href="/contact"
                    onClick={() => trackQuoteRequest({ source })}
                    className="glass-light border border-border text-foreground font-bold text-sm px-7 py-3 rounded-full flex items-center justify-center gap-2 hover:text-gold hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <Send className="w-4 h-4 text-gold" aria-hidden="true" />
                    احجز استشارتك المجانية
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Details + booking form */}
        {!isCta && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Reveal className="lg:col-span-2">
              <ul className="space-y-3">
                <li>
                  <a
                    href={siteConfig.contact.telHref}
                    onClick={() => trackPhoneClick({ placement: "contact_details" })}
                    className="flex items-start gap-3 glass rounded-xl p-4 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span className="w-9 h-9 rounded-lg glass-gold flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-gold" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs text-muted-foreground mb-0.5">اتصل بنا</span>
                      <span className="block text-sm font-bold text-foreground" dir="ltr">
                        {siteConfig.contact.phone}
                      </span>
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href={siteConfig.contact.mailtoHref}
                    className="flex items-start gap-3 glass rounded-xl p-4 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span className="w-9 h-9 rounded-lg glass-gold flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-gold" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground mb-0.5">البريد الإلكتروني</span>
                      <span className="block text-sm font-bold text-foreground break-all">{siteConfig.contact.email}</span>
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href={siteConfig.contact.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 glass rounded-xl p-4 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span className="w-9 h-9 rounded-lg glass-gold flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-gold" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs text-muted-foreground mb-0.5">العنوان</span>
                      <span className="block text-sm font-bold text-foreground">{siteConfig.contact.address}</span>
                    </span>
                  </a>
                </li>

                {/* Static information, so a div rather than a dead anchor. */}
                <li className="flex items-start gap-3 glass rounded-xl p-4">
                  <span className="w-9 h-9 rounded-lg glass-gold flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gold" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground mb-0.5">ساعات العمل</span>
                    <span className="block text-sm font-bold text-foreground">{siteConfig.hours.days}</span>
                    <span className="block text-xs text-muted-foreground">{siteConfig.hours.time}</span>
                  </span>
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.15} className="lg:col-span-3">
              {/* data-clarity-mask keeps typed values out of session recordings.
                  Clarity is there to show where people struggle, which does not
                  require knowing anyone's phone number. */}
              <form
                onSubmit={handleSubmit}
                noValidate
                data-clarity-mask="True"
                className="glass rounded-3xl p-6 sm:p-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    id="name"
                    label="الاسم الكامل"
                    required
                    error={errors.name}
                    value={form.name}
                    onChange={(value) => update("name", value)}
                    autoComplete="name"
                  />
                  <Field
                    id="phone"
                    label="رقم الموبايل"
                    required
                    type="tel"
                    dir="ltr"
                    placeholder="01XXXXXXXXX"
                    error={errors.phone}
                    value={form.phone}
                    onChange={(value) => update("phone", value)}
                    autoComplete="tel"
                  />
                  <Field
                    id="email"
                    label="البريد الإلكتروني (اختياري)"
                    type="email"
                    dir="ltr"
                    error={errors.email}
                    value={form.email}
                    onChange={(value) => update("email", value)}
                    autoComplete="email"
                  />
                  <Field
                    id="preferred_date"
                    label="التاريخ المفضل (اختياري)"
                    type="date"
                    min={today}
                    error={errors.preferred_date}
                    value={form.preferred_date}
                    onChange={(value) => update("preferred_date", value)}
                  />

                  <div className="sm:col-span-2">
                    <label htmlFor="service_type" className="block text-sm text-muted-foreground mb-2">
                      نوع الخدمة (اختياري)
                    </label>
                    <select
                      id="service_type"
                      value={form.service_type}
                      onChange={(event) => update("service_type", event.target.value)}
                      className="w-full rounded-xl bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold transition-colors"
                    >
                      <option value="">اختر الخدمة</option>
                      {options.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm text-muted-foreground mb-2">
                      تفاصيل المشروع (اختياري)
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      maxLength={1000}
                      value={form.message}
                      onChange={(event) => update("message", event.target.value)}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      className="w-full rounded-xl bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold transition-colors resize-y"
                      placeholder="المساحة، الموقع، وما تحتاجه بالتحديد..."
                    />
                    {errors.message && (
                      <p id="message-error" className="mt-2 text-sm text-red-400">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Honeypot. Hidden from users, irresistible to bots. */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="company">الشركة</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.company}
                      onChange={(event) => update("company", event.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={state === "submitting" || !isSupabaseConfigured}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full gold-gradient-bg text-navy-deep font-bold shimmer-btn hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {state === "submitting" ? "جارٍ الإرسال..." : "احجز استشارتك المجانية"}
                </button>

                <div aria-live="polite" className="mt-3">
                  {!isSupabaseConfigured && (
                    <p className="flex items-center gap-2 text-sm text-amber-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      نموذج الحجز غير مفعّل حالياً. يرجى التواصل معنا هاتفياً أو عبر واتساب.
                    </p>
                  )}
                  {state === "success" && (
                    <p className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      تم استلام طلبك بنجاح. سنتواصل معك خلال 24 ساعة.
                    </p>
                  )}
                  {state === "error" && (
                    <p className="flex items-center gap-2 text-sm text-red-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      تعذر إرسال الطلب. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.
                    </p>
                  )}
                </div>
              </form>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange" | "type">) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-muted-foreground mb-2">
        {label}
        {required && (
          <span className="text-gold" aria-hidden="true">
            {" *"}
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold transition-colors"
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
