"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "bot"; text: string };

const botResponses: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["سعر", "تكلفة", "كم", "مبلغ", "رسوم"],
    reply: "تختلف التكلفة حسب نوع وحجم المشروع والخامات المختارة. نقدم عرض سعر مجاني بعد زيارة الموقع. للحصول على تسعيرة دقيقة، احجز معاينة مجانية عبر نموذج التواصل أو واتساب.",
  },
  {
    keywords: ["مدة", "وقت", "متى", "كم يوم", "كم شهر"],
    reply: "تختلف مدة التنفيذ حسب المشروع: الشقق 60-90 يوماً، الفلل 120-180 يوماً، المكاتب 60-120 يوماً. نقدم جدولاً زمنياً دقيقاً بعد الاستشارة الأولى.",
  },
  {
    keywords: ["خدمات", "ماذا تقدم", "تختصون", "أعمال"],
    reply: "نقدم خدمات شاملة: تشطيب شقق وفلل ومكاتب ومحلات وعيادات ومطاعم، تصميم داخلي وخارجي، تصميم 2D و3D، حدائق، إضاءة، سباكة، جبس بورد، دهانات، أرضيات، رخام، نجارة، ألمنيوم، سمارت هوم، ترميم وصيانة.",
  },
  {
    keywords: ["ضمان", "كفالة"],
    reply: "نعم، نقدم ضماناً شاملاً على جميع أعمالنا: سنتان للأعمال الإنشائية وسنة للتشطيبات والديكورات.",
  },
  {
    keywords: ["تواصل", "اتصال", "رقم", "هاتف", "واتساب"],
    reply: "يمكنك التواصل معنا عبر الهاتف: ‎+966 50 123 4567 أو واتساب على نفس الرقم، أو عبر نموذج التواصل في الموقع. ساعات العمل: السبت - الخميس 9ص - 9م.",
  },
  {
    keywords: ["معاينة", "حجز", "موعد", "استشارة"],
    reply: "يمكنك حجز معاينة مجانية عبر نموذج (احجز معاينة مجانية) في صفحة التواصل. سنزور موقعك ونقدم استشارة وعرض سعر بدون أي التزام.",
  },
  {
    keywords: ["موقع", "عنوان", "أين", "مكان"],
    reply: "نقع في الرياض، المملكة العربية السعودية. نخدم جميع المدن الرئيسية في المملكة.",
  },
  {
    keywords: ["شكرا", "شكراً", "مشكور", "تسلم"],
    reply: "العفو! نحن سعداء بمساعدتك. لا تتردد في التواصل إذا كان لديك أي استفسار آخر.",
  },
];

function getBotReply(text: string): string {
  const lower = text.toLowerCase();
  for (const r of botResponses) {
    if (r.keywords.some((k) => lower.includes(k))) return r.reply;
  }
  return "شكراً لرسالتك! لمساعدتك بشكل أفضل، يمكنك التواصل معنا عبر الهاتف ‎+966 50 123 4567 أو حجز معاينة مجانية من نموذج التواصل. فريقنا جاهز لخدمتك.";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "مرحباً بك في الكيان! 👋 كيف يمكنني مساعدتك اليوم؟" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = getBotReply(userMsg);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
      setTyping(false);
    }, 1200);
  }

  return (
    <>
      {/* Chat button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full glass-gold flex items-center justify-center shadow-2xl shadow-gold/20 hover:scale-110 transition-transform duration-300"
        aria-label="المساعد الذكي"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-gold" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-gold" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-80 h-96 rounded-3xl glass flex flex-col overflow-hidden shadow-2xl"
            style={{ backgroundColor: "rgba(11,31,58,0.95)" }}
          >
            {/* Header */}
            <div className="glass-gold px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gold-gradient-bg flex items-center justify-center">
                <span className="font-bold" style={{ color: "#0B1F3A" }}>الك</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">مساعد الكيان</p>
                <p className="text-xs text-gold">متصل الآن</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "glass-light text-white"
                        : "glass-gold text-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex justify-end">
                  <div className="glass-gold rounded-2xl px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full bg-gold"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 bg-navy-light/50 border border-white/10 rounded-full px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                  style={{ backgroundColor: "rgba(19,42,77,0.5)" }}
                />
                <button
                  onClick={send}
                  className="w-10 h-10 rounded-full gold-gradient-bg flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
                  style={{ color: "#0B1F3A" }}
                  aria-label="إرسال"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
