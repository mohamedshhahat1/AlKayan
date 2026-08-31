"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Script from "next/script";
import { MessageCircle, X, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { siteConfig } from "@/lib/site-config";
import { arabicYears } from "@/lib/arabic";
import { useSetting, useSiteDetails } from "@/lib/content/context";
import type { SiteDetails } from "@/lib/content/site-details";

type Message = { id: number; from: "bot" | "user"; text: string };

/**
 * Mojeeb is loaded from a third-party CDN and attaches itself to `window`.
 * Everything is optional because none of it exists until that script has run,
 * and it may never run — the CDN can be blocked, offline or slow.
 */

declare global {
  interface Window {
    MojeebWidget?: {
      attach?: (selector: string) => void;
      detach?: (selector: string) => void;
      toggle?: () => void;
      close?: () => void;
      isOpen?: () => boolean;
    };
  }
}

/**
 * The id Mojeeb selects on. Kept in one place so the attribute on the button
 * and the selector handed to attach() cannot drift apart.
 */
const MOJEEB_BUTTON_ID = "my-chat-button";
const MOJEEB_SELECTOR = `#${MOJEEB_BUTTON_ID}`;

/**
 * `onReady` fires when the script element loads, but a widget is free to
 * publish its global a tick later. Rather than assume, re-check briefly before
 * giving up. ~6s total, which is generous for a script that has already loaded.
 */
const MOJEEB_POLL_INTERVAL_MS = 150;
const MOJEEB_POLL_ATTEMPTS = 40;

/**
 * The element Mojeeb is currently bound to, held at module scope rather than in
 * a ref.
 *
 * This is the StrictMode guard. In development React mounts, unmounts and
 * remounts every component, running effects twice; attaching twice would leave
 * two click listeners on one button. Comparing against the actual DOM node is
 * better than a boolean flag: it is idempotent when the effect re-runs against
 * the same button, and still re-attaches correctly if the widget genuinely
 * remounts and React creates a new element.
 */
let mojeebAttachedTo: HTMLElement | null = null;

/** Dev-only. A silently missing third-party widget is near-impossible to diagnose. */
function chatLog(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[chat] ${message}`);
  }
}

/**
 * The keyword matcher, built from the current site details.
 *
 * A function of the details rather than a module constant: the warranty terms,
 * timelines, opening hours and phone number are all editable in Supabase now,
 * and a constant evaluated at import time would quote whatever the build
 * shipped with — so the widget would confidently tell a customer a warranty
 * length nobody offers any more.
 */
function buildAnswers(details: SiteDetails): Array<{ keywords: string[]; reply: string }> {
  const { warranty, timelines, hours, contact } = details;

  return [
    {
      keywords: ["سعر", "اسعار", "أسعار", "تكلفة", "ميزانية", "كم يكلف"],
      reply:
        "تختلف التكلفة حسب المساحة ومستوى التشطيب والخامات المختارة. أرسل لنا تفاصيل مشروعك عبر نموذج الحجز وسنزودك بعرض سعر مفصل مجاناً.",
    },
    {
      keywords: ["ضمان", "الضمان"],
      reply: `نقدم ضماناً لمدة ${arabicYears(warranty.structuralYears)} على الأعمال الإنشائية و${arabicYears(warranty.finishingYears)} على أعمال التشطيبات.`,
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
      keywords: ["جوال", "موبايل", "رقم", "اتصال", "تواصل", "هاتف"],
      reply: `يمكنك الاتصال بنا على ${contact.phone} أو مراسلتنا عبر واتساب.`,
    },
    {
      keywords: ["موقع", "عنوان", "وين", "فين", "أين"],
      reply: `مقرنا في ${contact.address}، وننفذ مشاريع في مختلف محافظات مصر.`,
    },
    {
      keywords: ["تصميم", "ديكور", "3d", "مخطط"],
      reply:
        "نقدم خدمات التصميم الداخلي والخارجي والمخططات ثنائية وثلاثية الأبعاد والجولات الافتراضية. تصفح قسم التصاميم للاطلاع.",
    },
  ];
}

const quickQuestions = ["كم تكلفة التشطيب؟", "ما مدة التنفيذ؟", "هل يوجد ضمان؟", "ما هي أوقات الدوام؟"];

function findReply(
  input: string,
  answers: ReturnType<typeof buildAnswers>,
  fallback: string
) {
  const normalized = input.toLowerCase();
  const match = answers.find((answer) =>
    answer.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
  );
  return match ? match.reply : fallback;
}

export function ChatWidget() {
  const details = useSiteDetails();
  const { contact } = details;

  const roleNote = useSetting("chat.role_note", "مساعد آلي — للتحدث مع فريقنا استخدم واتساب");
  const fallback = useSetting("chat.fallback", "يسعدنا مساعدتك عبر واتساب.");
  const whatsappCta = useSetting("chat.whatsapp_cta", "التحدث مع فريقنا على واتساب");

  const answers = useMemo(() => buildAnswers(details), [details]);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: "bot",
      text: `مرحباً بك في ${siteConfig.name}. أنا مساعد آلي وأستطيع الإجابة عن الأسئلة الشائعة. كيف يمكنني مساعدتك؟`,
    },
  ]);

  /** Set by next/script once the CDN file has run. */
  const [scriptReady, setScriptReady] = useState(false);

  /**
   * True once Mojeeb has successfully bound to the button, at which point it
   * owns the click and the local panel steps aside. While false — script still
   * loading, blocked, or failed — the original behaviour is untouched, so the
   * button is never dead.
   */
  const [mojeebOwnsButton, setMojeebOwnsButton] = useState(false);

  /**
   * Whether Mojeeb's dialog is on screen.
   *
   * Tracked here because the widget publishes no open/close event and renders
   * into its own iframe, so nothing about it reaches React on its own. Without
   * this the button could only ever show the "open" icon, which is what it did.
   */
  const [mojeebOpen, setMojeebOpen] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
useEffect(() => {
  if (!mojeebOwnsButton) return;

  const styleId = "alkayan-mojeeb-position-fix";

  const addStyles = () => {
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;

    style.textContent = `
      #mojeeb-chat-iframe {
        right: auto !important;
        left: 24px !important;
        bottom: 96px !important;
        width: 380px !important;
        height: 600px !important;
        max-width: calc(100vw - 48px) !important;
        max-height: calc(100vh - 120px) !important;
        border-radius: 18px !important;
      }

      #mojeeb-chat-container {
        right: auto !important;
        left: 24px !important;
      }

      @media (max-width: 640px) {
        #mojeeb-chat-iframe {
          left: 12px !important;
          right: 12px !important;
          bottom: 84px !important;
          width: calc(100vw - 24px) !important;
          height: calc(100vh - 100px) !important;
          max-width: none !important;
          max-height: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  };

  addStyles();

  return () => {
    document.getElementById(styleId)?.remove();
  };
}, [mojeebOwnsButton]);
  /**
   * Hand the button over to Mojeeb — but keep the click.
   *
   * The widget's own attach() is deliberately not used. Its handler is
   *
   *     const clickHandler = function (e) { ...; api.open(options); };
   *
   * which calls open(), never toggle() — and open() on an already-open chat
   * just logs "[Mojeeb] Chat is already open" and returns. Bound that way the
   * button could open the chat and never close it, and because the click was
   * swallowed by a listener React knew nothing about (it calls
   * stopPropagation), this component could not tell the chat was open and so
   * never swapped the icon for a close one either.
   *
   * So we drive the documented API ourselves: toggle() from our own onClick,
   * isOpen() to know which icon to draw. attach() is kept only as a fallback
   * for a widget build too old to expose toggle().
   *
   * Runs only after the script reports ready, and only touches `window` inside
   * the effect, so nothing here executes during server rendering. Every step is
   * defensive: the global may be absent, the methods may not be functions, and
   * third-party code can throw. Any of those simply leaves the local panel in
   * charge rather than taking the page down.
   */
  useEffect(() => {
    if (!scriptReady) return;

    const button = document.getElementById(MOJEEB_BUTTON_ID);
    if (!button) return;

    // Already bound to this exact element — StrictMode's second pass, or a
    // re-render. Re-attaching would add a duplicate listener.
    if (mojeebAttachedTo === button) {
      setMojeebOwnsButton(true);
      return;
    }

    let attempts = 0;
    let timer: number | undefined;
    let cancelled = false;

    const tryAttach = () => {
      if (cancelled) return;

      const widget = window.MojeebWidget;
      const canDrive = typeof widget?.toggle === "function";

      if (canDrive || typeof widget?.attach === "function") {
        try {
          if (canDrive) {
            // Nothing to bind: our own onClick calls toggle(). Recording the
            // button keeps the StrictMode guard meaningful either way.
            chatLog("driving Mojeeb through toggle()/isOpen()");
          } else {
            widget!.attach!(MOJEEB_SELECTOR);
            chatLog(`no toggle() on this build — fell back to attach(${MOJEEB_SELECTOR})`);
          }

          mojeebAttachedTo = button;
          setMojeebOwnsButton(true);
          // Mojeeb is the chat interface from here on. If the local panel
          // happened to be open when it arrived, close it so the two are never
          // on screen together.
          setOpen(false);
        } catch (error) {
          chatLog(
            `handing over to Mojeeb threw (${
              error instanceof Error ? error.message : String(error)
            }). Keeping the built-in assistant.`
          );
        }
        return;
      }

      attempts += 1;
      if (attempts >= MOJEEB_POLL_ATTEMPTS) {
        chatLog(
          "the Mojeeb script loaded but never exposed window.MojeebWidget. Keeping the built-in assistant."
        );
        return;
      }

      timer = window.setTimeout(tryAttach, MOJEEB_POLL_INTERVAL_MS);
    };

    tryAttach();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [scriptReady]);

  /**
   * The built-in panel only renders while Mojeeb has not taken over. Derived
   * rather than relying on `open` alone, so there is no window in which both
   * interfaces could be mounted.
   */
  const showLocalPanel = open && !mojeebOwnsButton;

  /** Either chat being on screen means the button's job is now "close". */
  const showCloseIcon = showLocalPanel || mojeebOpen;

  /**
   * Follow Mojeeb when it is closed from inside its own dialog.
   *
   * It has an X of its own and no event to announce it, so a poll is the only
   * way to hear about it. Cheap — isOpen() reads a boolean — and it only runs
   * while the chat is actually open, so an idle page polls nothing.
   */
  useEffect(() => {
    if (!mojeebOpen) return;

    const id = window.setInterval(() => {
      const widget = window.MojeebWidget;
      if (typeof widget?.isOpen !== "function") return;
      if (!widget.isOpen()) setMojeebOpen(false);
    }, 500);

    return () => window.clearInterval(id);
  }, [mojeebOpen]);

  /** Escape closes Mojeeb too, matching the local panel's behaviour. */
  useEffect(() => {
    if (!mojeebOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      const widget = window.MojeebWidget;
      if (typeof widget?.close !== "function") return;

      widget.close();
      setMojeebOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mojeebOpen]);

  useEffect(() => {
    if (showLocalPanel) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, showLocalPanel]);

  useEffect(() => {
    if (!showLocalPanel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showLocalPanel]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = { id: nextId.current++, from: "user", text: trimmed };
    const botMessage: Message = { id: nextId.current++, from: "bot", text: findReply(trimmed, answers, fallback) };

    setMessages((current) => [...current, userMessage, botMessage]);
    setInput("");
  }

  return (
    <>
      {/*
        next/script rather than a raw tag: React does not execute a <script>
        written into JSX, and next/script also de-duplicates by id, so the file
        is fetched once no matter how often this component renders.

        afterInteractive injects it once the page is interactive — not blocking
        first paint, but early enough that it is almost always attached before
        anyone reaches a button in the bottom corner. lazyOnload would defer it
        further and spare the hero video some bandwidth, at the cost of a longer
        window in which clicking opens the built-in assistant instead.

        onReady, not onLoad: onLoad fires only on the first fetch, whereas
        onReady also fires when the component mounts against an already-cached
        script. With onLoad, a remount would silently never attach.
      */}
      <Script
        id="mojeeb-chat-widget"
        src="https://mojeebcdn.z7.web.core.windows.net/mojeeb-widget.js"
        data-widget-id="82b49e65-8f1c-4367-ac71-854eccf61c42"
        data-mode="headless"
        data-config="{}"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => {
          chatLog(
            "the Mojeeb script failed to load. Keeping the built-in assistant — the button still works."
          );
        }}
      />

      {/*
        The same button as before: identical classes, position, icon, hover
        scale and focus ring. The only additions are the id Mojeeb selects on
        and a guard in the click handler.

        In headless mode Mojeeb binds its own listener to this element, so once
        it has taken over, toggling the local panel here as well would put two
        chat windows on screen at once. The original handler is kept, not
        replaced — it is simply skipped while Mojeeb is in charge, which is also
        what makes it a working fallback if Mojeeb never loads.
      */}
      <button
        type="button"
        id={MOJEEB_BUTTON_ID}
        onClick={() => {
          if (!mojeebOwnsButton) {
            setOpen((value) => !value);
            return;
          }

          const widget = window.MojeebWidget;
          // No toggle() means the attach() fallback is in charge and has
          // already handled this click by opening. Nothing to toggle, and
          // nothing we can reliably report about its state.
          if (typeof widget?.toggle !== "function") return;

          try {
            widget.toggle();
            setMojeebOpen(typeof widget.isOpen === "function" ? widget.isOpen() : true);
          } catch (error) {
            chatLog(
              `MojeebWidget.toggle() threw (${
                error instanceof Error ? error.message : String(error)
              })`
            );
          }
        }}
        // Only describe the local panel while it is the thing being controlled.
        // Under Mojeeb this button opens a dialog we neither render nor track,
        // so claiming aria-expanded={false} against a non-existent #chat-panel
        // would be actively wrong for a screen reader.
        aria-expanded={mojeebOwnsButton ? undefined : open}
        aria-controls={mojeebOwnsButton ? undefined : "chat-panel"}
        aria-haspopup={mojeebOwnsButton ? "dialog" : undefined}
        aria-label={showCloseIcon ? "إغلاق المحادثة" : "فتح المحادثة"}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full glass-gold flex items-center justify-center text-gold hover:scale-110 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {showCloseIcon ? <X className="w-6 h-6" aria-hidden="true" /> : <MessageCircle className="w-6 h-6" aria-hidden="true" />}
      </button>

      {showLocalPanel && (
        <div
          id="chat-panel"
          role="dialog"
          aria-label="المساعد الآلي"
          className="fixed bottom-24 left-6 z-50 w-[min(22rem,calc(100vw-3rem))] rounded-3xl glass border border-gold/20 overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-border">
            <p className="font-bold text-foreground">{siteConfig.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{roleNote}</p>
          </div>

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
                    ? "glass-light text-muted-foreground"
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
                className="text-[11px] px-3 py-1.5 rounded-full glass-light text-muted-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
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
            className="p-4 pt-2 border-t border-border flex items-center gap-2"
          >
            <label htmlFor="chat-input" className="sr-only">
              اكتب رسالتك
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="اكتب سؤالك..."
              className="flex-1 min-w-0 rounded-full bg-input border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50"
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
            {whatsappCta}
          </a>
        </div>
      )}
    </>
  );
}
