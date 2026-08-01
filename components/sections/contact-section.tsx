"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Reveal, SectionHeading } from "@/components/reveal";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Send, CheckCircle2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const serviceOptions = [
  "تشطيب شقة",
  "تشطيب فيلا",
  "تشطيب مكتب",
  "تشطيب محل",
  "تشطيب عيادة",
  "تشطيب مطعم",
  "تصميم داخلي",
  "تصميم خارجي",
  "تصميم 3D",
  "حدائق ومناظر",
  "صيانة",
  "أخرى",
];

const contactInfo = [
  { icon: Phone, label: "الهاتف", value: "+966 50 123 4567", href: "tel:+966501234567" },
  { icon: Mail, label: "البريد الإلكتروني", value: "info@al-kayan.com", href: "mailto:info@al-kayan.com" },
  { icon: MapPin, label: "العنوان", value: "الرياض، المملكة العربية السعودية", href: "#" },
  { icon: Clock, label: "ساعات العمل", value: "السبت - الخميس: 9ص - 9م", href: "#" },
];

export function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service_type: "",
    preferred_date: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const { error: insertError } = await supabase.from("bookings").insert({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        service_type: form.service_type || null,
        preferred_date: form.preferred_date || null,
        message: form.message || null,
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setForm({ name: "", phone: "", email: "", service_type: "", preferred_date: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />

      <div className="container-luxury">
        <SectionHeading
          eyebrow="تواصل معنا"
          title="احجز معاينتك المجانية اليوم"
          subtitle="نحن هنا لتحويل رؤيتك إلى واقع. تواصل معنا واحصل على استشارة مجانية"
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Reveal y={40}>
            <div className="glass rounded-3xl p-8 lg:p-10">
              {success ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-gold mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">تم إرسال طلبك بنجاح!</h3>
                  <p className="text-gray-300">سنتواصل معك في أقرب وقت ممكن</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">الاسم الكامل *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-navy-light/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                        style={{ backgroundColor: "rgba(19,42,77,0.5)" }}
                        placeholder="أدخل اسمك"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">رقم الجوال *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                        style={{ backgroundColor: "rgba(19,42,77,0.5)" }}
                        placeholder="05xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                        style={{ backgroundColor: "rgba(19,42,77,0.5)" }}
                        placeholder="example@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">التاريخ المفضل</label>
                      <input
                        type="date"
                        value={form.preferred_date}
                        onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                        className="w-full border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                        style={{ backgroundColor: "rgba(19,42,77,0.5)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نوع الخدمة</label>
                    <select
                      value={form.service_type}
                      onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                      className="w-full border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold/50 focus:outline-none transition-colors"
                      style={{ backgroundColor: "rgba(19,42,77,0.5)" }}
                    >
                      <option value="">اختر الخدمة</option>
                      {serviceOptions.map((s) => (
                        <option key={s} value={s} className="bg-navy">{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">رسالتك</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      className="w-full border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors resize-none"
                      style={{ backgroundColor: "rgba(19,42,77,0.5)" }}
                      placeholder="أخبرنا عن مشروعك..."
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm">حدث خطأ، يرجى المحاولة مرة أخرى</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="shimmer-btn gold-gradient-bg font-bold text-base px-8 py-4 rounded-full w-full hover:shadow-2xl hover:shadow-gold/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ color: "#0B1F3A" }}
                  >
                    {submitting ? "جاري الإرسال..." : "احجز معاينة مجانية"}
                    {!submitting && <Send className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* Contact info + map */}
          <Reveal delay={0.15} y={40}>
            <div className="space-y-6">
              {/* Contact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((info, i) => (
                  <a
                    key={i}
                    href={info.href}
                    className="glass rounded-2xl p-5 hover:border-gold/30 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="w-10 h-10 rounded-lg glass-gold flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <info.icon className="w-4 h-4 text-gold" />
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{info.label}</p>
                    <p className="text-sm font-bold text-white">{info.value}</p>
                  </a>
                ))}
              </div>

              {/* Social */}
              <div className="glass rounded-2xl p-6">
                <p className="text-sm text-gray-300 mb-4 font-bold">تابعنا على</p>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-12 h-12 rounded-xl glass-light flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-all duration-300 hover:scale-110">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-xl glass-light flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-all duration-300 hover:scale-110">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://wa.me/966501234567" className="w-12 h-12 rounded-xl glass-light flex items-center justify-center text-gray-300 hover:text-green-400 hover:border-green-400/30 transition-all duration-300 hover:scale-110">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.89-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                </div>
              </div>

              {/* Map */}
              <div className="glass rounded-2xl overflow-hidden h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d463895.7002415764!2d46.575583!3d24.713552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(0.3) invert(0.9) hue-rotate(180deg)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="موقع الكيان"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
