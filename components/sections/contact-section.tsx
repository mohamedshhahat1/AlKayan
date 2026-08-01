"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { bookingSchema, collectErrors, type BookingErrors } from "@/lib/validation";
import { siteConfig } from "@/lib/site-config";

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

export function ContactSection() {
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
    <section id="contact" className="relative py-24 lg:py-32">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="تواصل معنا"
          title="احجز استشارتك المجانية"
          subtitle="أخبرنا عن مشروعك وسيتواصل معك فريقنا خلال 24 ساعة"
        />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Reveal className="lg:col-span-2">
            <ul className="space-y-4">
              <li>
                <a
                  href={siteConfig.contact.telHref}
                  className="flex items-start gap-4 glass rounded-2xl p-6 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span className="w-11 h-11 rounded-xl glass-gold flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gold" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-gray-400 mb-1">اتصل بنا</span>
                    <span className="block font-bold text-white" dir="ltr">
                      {siteConfig.contact.phone}
                    </span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={siteConfig.contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 glass rounded-2xl p-6 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span className="w-11 h-11 rounded-xl glass-gold flex items-center justify-center flex-shrink-0">
                    <WhatsAppIcon className="w-5 h-5 fill-gold" />
                  </span>
                  <span>
                    <span className="block text-sm text-gray-400 mb-1">واتساب</span>
                    <span className="block font-bold text-white">راسلنا مباشرة</span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={siteConfig.contact.mailtoHref}
                  className="flex items-start gap-4 glass rounded-2xl p-6 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span className="w-11 h-11 rounded-xl glass-gold flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gold" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</span>
                    <span className="block font-bold text-white break-all">{siteConfig.contact.email}</span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={siteConfig.contact.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 glass rounded-2xl p-6 hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span className="w-11 h-11 rounded-xl glass-gold flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gold" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-gray-400 mb-1">العنوان</span>
                    <span className="block font-bold text-white">{siteConfig.contact.address}</span>
                  </span>
                </a>
              </li>

              {/* Static information, so a div rather than a dead anchor. */}
              <li className="flex items-start gap-4 glass rounded-2xl p-6">
                <span className="w-11 h-11 rounded-xl glass-gold flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-gold" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm text-gray-400 mb-1">ساعات العمل</span>
                  <span className="block font-bold text-white">{siteConfig.hours.days}</span>
                  <span className="block text-sm text-gray-300">{siteConfig.hours.time}</span>
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-3">
            <form onSubmit={handleSubmit} noValidate className="glass rounded-3xl p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  label="رقم الجوال"
                  required
                  type="tel"
                  dir="ltr"
                  placeholder="05XXXXXXXX"
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
                  <label htmlFor="service_type" className="block text-sm text-gray-300 mb-2">
                    نوع الخدمة (اختياري)
                  </label>
                  <select
                    id="service_type"
                    value={form.service_type}
                    onChange={(event) => update("service_type", event.target.value)}
                    className="w-full rounded-xl bg-navy-light border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold transition-colors"
                  >
                    <option value="">اختر الخدمة</option>
                    {serviceOptions.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm text-gray-300 mb-2">
                    تفاصيل المشروع (اختياري)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    maxLength={1000}
                    value={form.message}
                    onChange={(event) => update("message", event.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className="w-full rounded-xl bg-navy-light border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold transition-colors resize-y"
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
                className="mt-7 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full gold-gradient-bg text-navy-deep font-bold shimmer-btn hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                {state === "submitting" ? "جارٍ الإرسال..." : "احجز استشارتك المجانية"}
              </button>

              <div aria-live="polite" className="mt-4">
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
      <label htmlFor={id} className="block text-sm text-gray-300 mb-2">
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
        className="w-full rounded-xl bg-navy-light border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold transition-colors"
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
