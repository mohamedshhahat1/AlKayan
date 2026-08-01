"use client";

import { useEffect, useState } from "react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { getSupabaseClient } from "@/lib/supabase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type Testimonial = {
  id: string;
  client_name: string;
  client_title: string | null;
  rating: number;
  content: string;
  avatar_url: string | null;
};

type Status = "loading" | "ready" | "error";

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("ready");
      return;
    }

    let cancelled = false;

    async function fetchTestimonials() {
      const { data, error } = await supabase!
        .from("testimonials")
        .select("id, client_name, client_title, rating, content, avatar_url")
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error) {
        console.error("[testimonials] failed to load", error.message);
        setStatus("error");
        return;
      }
      setTestimonials((data ?? []) as Testimonial[]);
      setStatus("ready");
    }

    fetchTestimonials();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="testimonials" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl bg-gold-radial" />

      <div className="container-luxury">
        <SectionHeading
          eyebrow="آراء العملاء"
          title="ماذا يقول عملاؤنا"
          subtitle="ثقة عملائنا هي أكبر إنجازاتنا، وكلماتهم هي شهادة على جودة عملنا"
        />

        <div className="mt-16">
          {status === "loading" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <div key={index} className="glass rounded-2xl p-8 h-56 animate-pulse" />
              ))}
            </div>
          )}

          {status === "error" && (
            <p role="status" className="text-center text-gray-400">
              تعذر تحميل آراء العملاء حالياً. يرجى المحاولة لاحقاً.
            </p>
          )}

          {status === "ready" && testimonials.length === 0 && (
            <p className="text-center text-gray-400">لا توجد آراء منشورة بعد.</p>
          )}

          {status === "ready" && testimonials.length > 0 && (
            <Reveal delay={0.1}>
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                pagination={{
                  clickable: true,
                  bulletClass: "swiper-bullet",
                  bulletActiveClass: "swiper-bullet-active",
                }}
                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
                loop={testimonials.length > 3}
                className="!overflow-visible !pb-14"
              >
                {testimonials.map((testimonial) => (
                  <SwiperSlide key={testimonial.id} className="h-auto">
                    <figure className="glass rounded-2xl p-8 h-full flex flex-col hover:border-gold/30 transition-all duration-500 hover:-translate-y-1.5">
                      <div
                        className="flex items-center gap-1 mb-5"
                        role="img"
                        aria-label={`${testimonial.rating} من 5 نجوم`}
                      >
                        {[0, 1, 2, 3, 4].map((index) => (
                          <span
                            key={index}
                            aria-hidden="true"
                            className={index < testimonial.rating ? "text-gold text-lg" : "text-gray-600 text-lg"}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <blockquote className="text-gray-200 leading-relaxed flex-1 mb-6 text-balance">
                        {testimonial.content}
                      </blockquote>

                      <figcaption className="flex items-center gap-4 pt-4 border-t border-white/10">
                        {testimonial.avatar_url ? (
                          <img
                            src={testimonial.avatar_url}
                            alt=""
                            loading="lazy"
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full gold-gradient-bg flex items-center justify-center flex-shrink-0 text-navy-deep">
                            <span aria-hidden="true" className="font-bold text-lg">
                              {testimonial.client_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">{testimonial.client_name}</p>
                          {testimonial.client_title && (
                            <p className="text-xs text-gray-400 mt-0.5">{testimonial.client_title}</p>
                          )}
                        </div>
                      </figcaption>
                    </figure>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
