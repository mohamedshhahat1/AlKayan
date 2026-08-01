"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, Phone, Mail, MapPin, ArrowUp } from "lucide-react";

const quickLinks = [
  { label: "الرئيسية", href: "#hero" },
  { label: "من نحن", href: "#about" },
  { label: "الخدمات", href: "#services" },
  { label: "المشاريع", href: "#projects" },
  { label: "التصميمات", href: "#designs" },
  { label: "آراء العملاء", href: "#testimonials" },
  { label: "الأسئلة الشائعة", href: "#faq" },
  { label: "تواصل معنا", href: "#contact" },
];

const services = [
  "تشطيب الشقق",
  "تشطيب الفلل",
  "تشطيب المكاتب",
  "تصميم داخلي",
  "تصميم خارجي",
  "تصميم 3D",
  "حدائق ومناظر",
  "سمارت هوم",
];

export function SiteFooter() {
  return (
    <footer className="relative pt-20 pb-8 border-t border-gold/10" style={{ backgroundColor: "#081830" }}>
      {/* Gold top border */}
      <div className="absolute top-0 left-0 right-0 h-px section-divider" />

      <div className="container-luxury">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg gold-gradient-bg flex items-center justify-center">
                <span className="font-extrabold text-lg" style={{ color: "#0B1F3A" }}>الك</span>
              </div>
              <div>
                <span className="text-xl font-extrabold text-white block">الكيان</span>
                <span className="text-[10px] text-gold tracking-[0.3em] uppercase">AL-KAYAN</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              شركة رائدة في مجال المقاولات والتشطيبات الداخلية والتصميم. نحوّل المساحات إلى تحف فنية بأعلى معايير الجودة.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-all duration-300 hover:scale-110">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-all duration-300 hover:scale-110">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/966501234567" className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-gray-300 hover:text-green-400 hover:border-green-400/30 transition-all duration-300 hover:scale-110">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.89-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-5">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-gold transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-5">خدماتنا</h4>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <a href="#services" className="text-sm text-gray-400 hover:text-gold transition-colors duration-300">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-5">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <span dir="ltr">+966 50 123 4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                info@al-kayan.com
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                الرياض، السعودية
              </li>
            </ul>
            <div className="mt-5 glass-gold rounded-xl p-4">
              <p className="text-xs text-gray-300 mb-1">ساعات العمل</p>
              <p className="text-sm font-bold text-white">السبت - الخميس</p>
              <p className="text-sm text-gold">9:00 ص - 9:00 م</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-right">
            © {new Date().getFullYear()} الكيان للمقاولات والتشطيبات. جميع الحقوق محفوظة.
          </p>
          <a
            href="#hero"
            className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-gold hover:scale-110 hover:border-gold/30 transition-all duration-300"
            aria-label="العودة للأعلى"
          >
            <ArrowUp className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
