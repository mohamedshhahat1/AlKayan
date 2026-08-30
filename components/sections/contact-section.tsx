"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { bookingSchema, collectErrors, type BookingErrors } from "@/lib/validation";
import { siteConfig } from "@/lib/site-config";
import { useContent, useHeading, useSetting, useSiteDetails } from "@/lib/content/context";

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

/**
 * The closing block: objections, then the ask, then the form. These were two
 * separate full-height sections making the same move.
 *
 * Note that #faq and #contact are two anchors inside this one section. The
 * section element itself carries no id: if it did, it would start at the FAQ
 * heading, and the "تواصل معنا" nav link would scroll to the FAQ.
 */
export function ContactSection() {
  const { faqs, serviceOptions } = useContent();
  const { contact, hours } = useSiteDetails();
  const faqHeading = useHeading("faq");

  const ctaTitleLead = useSetting("cta.title_lead", "جاهز لبدء");
  const ctaTitleAccent = useSetting("cta.title_accent", "مشروعك؟");
  const ctaSubtitle = useSetting("cta.subtitle", "");
  const callLabel = useSetting("cta.call_label", "اتصل الآن");
  const whatsappLabel = useSetting("cta.whatsapp_label", "واتساب");
  const submitLabel = useSetting("form.submit_label", "احجز استشارتك المجانية");
  const successMessage = useSetting("form.success", "تم استلام طلبك بنجاح.");

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [state, setState] = useState<SubmitState>("idle");

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
    // Pretend it worked so the bot does not retry.
    if (form.company.trim() !== "") {
      setForm(emptyForm);
      setState("success");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setState("error");
      return;
    }

    setState("submitting");
    setErrors({});

    const { company, ...values } = parsed.data;
    const { error } = await supabase.from("bookings").insert({
      name: values.name,
      phone: values.phone,
      email: values.email || null,
      service_type: values.service_type || null,
      preferred_date: values.preferred_date || null,
      message: values.message || null,
    });

    if (error) {
      console.error("[bookings] insert failed", error.message);
      setState("error");
      return;
    }

    setForm(emptyForm);
    setState("success");
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="relative py-14 lg:py-20">
      <div className="container-luxury">
        {/* FAQ */}
        <div id="faq">
          <SectionHeading eyebrow={faqHeading.eyebrow} title={faqHeading.title} />

          <Reveal delay={0.15} className="mt-8 max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.id}
                  value={`item-${i}`}
                  className="glass rounded-xl px-5 border border-border data-[state=open]:border-gold/30 transition-colors duration-300"
                >
                  <AccordionTrigger className="text-right hover:no-underline py-4 group">
                    <span className="flex items-center justify-between w-full gap-4">
                      <span className="text-sm font-bold text-foreground group-data-[state=open]:text-gold transition-colors duration-300">
                        {faq.question}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gold flex-shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 pt-1">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>

        {/* Compact CTA, replacing the old full-width contact header. This is
            where "تواصل معنا" lands. */}
        <div id="contact" className="mt-12">
          <Reveal>
            <div className="glass rounded-3xl border border-gold/20 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 text-center lg:text-right">
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground">
                  {ctaTitleLead} <span className="gold-gradient-text">{ctaTitleAccent}</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-2">{ctaSubtitle}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                <a
                  href={contact.telHref}
                  className="shimmer-btn gold-gradient-bg font-bold text-sm px-7 py-3 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{ color: "#0B1F3A" }}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {callLabel}
                </a>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-light border border-border text-foreground font-bold text-sm px-7 py-3 rounded-full flex items-center justify-center gap-2 hover:text-gold hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-gold" />
                  {whatsappLabel}
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Details + booking form */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Reveal className="lg:col-span-2">
            <ul className="space-y-3">
              <li>
                <a
                  href={contact.telHref}
                  className="flex items-start gap-3 glass rounded-xl p-4 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span className="w-9 h-9 rounded-lg glass-gold flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-gold" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground mb-0.5">اتصل بنا</span>
                    <span className="block text-sm font-bold text-foreground" dir="ltr">
                      {contact.phone}
                    </span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={contact.mailtoHref}
                  className="flex items-start gap-3 glass rounded-xl p-4 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span className="w-9 h-9 rounded-lg glass-gold flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-gold" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground mb-0.5">البريد الإلكتروني</span>
                    <span className="block text-sm font-bold text-foreground break-all">{contact.email}</span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={contact.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 glass rounded-xl p-4 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span className="w-9 h-9 rounded-lg glass-gold flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gold" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground mb-0.5">العنوان</span>
                    <span className="block text-sm font-bold text-foreground">{contact.address}</span>
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
                  <span className="block text-sm font-bold text-foreground">{hours.days}</span>
                  <span className="block text-xs text-muted-foreground">{hours.time}</span>
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-3">
            <form onSubmit={handleSubmit} noValidate className="glass rounded-3xl p-6 sm:p-8">
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
                    {serviceOptions.map((service) => (
                      <option key={service.id} value={service.label}>
                        {service.label}
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
                {state === "submitting" ? "جارٍ الإرسال..." : submitLabel}
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
                    {successMessage}
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
