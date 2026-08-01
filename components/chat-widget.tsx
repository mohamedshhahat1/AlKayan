"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { siteConfig } from "@/lib/site-config";

type Message = { id: number; from: "bot" | "user"; text: string };

/**
 * Keyword-matched automated assistant.
 *
 * This is deliberately labelled as automated: the previous version showed a
 * "متصل الآن" (agent online) indicator, which implied a human was reading the
 * messages. Anything it cannot answer is handed off to WhatsApp.
 *
 * All quoted facts come from siteConfig so they cannot drift from the FAQ.
 */
const { warranty, timelines, hours, contact } = siteConfig;

const answers: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["سعر", "اسعار", "أسعار", "تكلفة", "ميزانية", "كم يكلف"],
    reply:
      "تختلف التكلفة حسب المساحة ومستوى التشطيب والخامات المختارة. أرسل لنا تفاصيل مشروعك عبر نموذج الحجز وسنزودك بعرض سعر مفصل مجاناً.",
  },
  {
    keywords: ["ضمان", "الضمان"],
    reply: `نقدم ضماناً لمدة ${warranty.structuralYears} سنتين على الأعمال الإنشائية وسنة واحدة على أعمال التشطيبات.`,
  },
  {
    keywords: ["مدة", "مده", "وقت", "كم يوم", "متى يخلص", "تسليم"],
    reply: `متوسط مدة التنفيذ: الشقق ${timelines.apartments}، الفلل ${timelines.villas}، المكاتب ${timelines.offices}. تعتمد المدة النهائية على نطاق العمل.`,
  },
  {
    keywords: ["دوام", "ساعات", "متى تفتح", "اوقات"],
    reply: `أوقات العمل: ${hours.days} من ${hours.time}.`,
  },
  {
    keywords: ["جوال", "رقم", "اتصال", "تواصل", "هاتف"],
    reply: `يمكنك الاتصال بنا على ${contact.phone} أو مراسلتنا عبر واتساب.`,
  },
  {
    keywords: ["موقع", "عنوان", "وين", "أين"],
    reply: `مقرنا في ${contact.address}، وننفذ مشاريع في مختلف مناطق المملكة.`,
  },
  {
    keywords: ["تصميم", "ديكور", "3d", "مخطط"],
    reply:
      "نقدم خدمات التصميم الداخلي والخارجي والمخططات ثنائية وثلاثية الأبعاد والجولات الافتراضية. تصفح قسم التصاميم للاطلاع.",
  },
];

const fallback =
  "لم أفهم سؤالك تماماً. يسعدنا مساعدتك مباشرة عبر واتساب أو من خلال نموذج الحجز.";

const quickQuestions = ["كم تكلفة التشطيب؟", "ما مدة التنفيذ؟", "هل يوجد ضمان؟", "ما هي أوقات الدوام؟"];

function findReply(input: string) {
  const normalized = input.toLowerCase();
  const match = answers.find((answer) =>
    answer.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
  );
  return match ? match.reply : fallback;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: "bot",
      text: `مرحباً بك في ${siteConfig.name}. أنا مساعد آلي وأستطيع الإجابة عن الأسئلة الشائعة. كيف يمكنني مساعدتك؟`,
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = { id: nextId.current++, from: "user", text: trimmed };
    const botMessage: Message = { id: nextId.current++, from: "bot", text: findReply(trimmed) };

    setMessages((current) => [...current, userMessage, botMessage]);
    setInput("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "إغلاق المحادثة" : "فتح المحادثة"}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full glass-gold flex items-center justify-center text-gold hover:scale-110 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {open ? <X className="w-6 h-6" aria-hidden="true" /> : <MessageCircle className="w-6 h-6" aria-hidden="true" />}
      </button>

      {/*
        Rendered conditionally rather than with the `hidden` attribute. `hidden`
        is only `display: none` from the UA stylesheet, so the `flex` class on
        this element overrode it and the panel was always on screen.
      */}
      {open && (
        <div
          id="chat-panel"
          role="dialog"
          aria-label="المساعد الآلي"
          className="fixed bottom-24 left-6 z-50 w-[min(22rem,calc(100vw-3rem))] rounded-3xl glass border border-gold/20 overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-white/10">
            <p className="font-bold text-white">{siteConfig.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">مساعد آلي — للتحدث مع فريقنا استخدم واتساب</p>
          </div>

          {/* data-lenis-prevent: without it Lenis swallows the wheel event and
              scrolls the page instead of this list. */}
          <div
            data-lenis-prevent
            className="flex-1 max-h-80 overflow-y-auto overscroll-contain p-4 space-y-3"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.from === "bot"
                    ? "glass-light text-gray-200"
                    : "gold-gradient-bg text-navy-deep font-medium mr-auto"
                }`}
              >
                {message.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => send(question)}
                className="text-[11px] px-3 py-1.5 rounded-full glass-light text-gray-300 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {question}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="p-4 pt-2 border-t border-white/10 flex items-center gap-2"
          >
            <label htmlFor="chat-input" className="sr-only">
              اكتب رسالتك
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="اكتب سؤالك..."
              className="flex-1 min-w-0 rounded-full bg-navy-light border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-gold/50"
            />
            <button
              type="submit"
              aria-label="إرسال"
              className="w-10 h-10 rounded-full gold-gradient-bg flex items-center justify-center text-navy-deep flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/20 transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current" />
            التحدث مع فريقنا على واتساب
          </a>
        </div>
      )}
    </>
  );
}
