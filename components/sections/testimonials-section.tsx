"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Reveal, SectionHeading } from "@/components/reveal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";

type Testimonial = {
  id: string;
  client_name: string;
  client_title: string | null;
  rating: number;
  content: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setTestimonials(data as Testimonial[]);
    }
    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />

      <div className="container-luxury">
        <SectionHeading
          eyebrow="آراء العملاء"
          title="ماذا يقول عملاؤنا"
          subtitle="ثقة عملائنا هي أكبر إنجازاتنا، وكلماتهم هي شهادة على جودة عملنا"
        />

        <Reveal delay={0.2} className="mt-16">
          {testimonials.length > 0 && (
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true, bulletClass: "swiper-bullet", bulletActiveClass: "swiper-bullet-active" }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              loop
              className="!overflow-visible !pb-14"
            >
              {testimonials.map((t) => (
                <SwiperSlide key={t.id} className="h-auto">
                  <div className="glass rounded-2xl p-8 h-full flex flex-col hover:border-gold/30 transition-all duration-500 hover:-translate-y-1.5">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < t.rating ? "text-gold text-lg" : "text-gray-600 text-lg"}>★</span>
                      ))}
                    </div>
                    {/* Content */}
                    <p className="text-gray-200 leading-relaxed flex-1 mb-6 text-balance">
                      "{t.content}"
                    </p>
                    {/* Author */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                      <div className="w-12 h-12 rounded-full gold-gradient-bg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-lg" style={{ color: "#0B1F3A" }}>
                          {t.client_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{t.client_name}</p>
                        {t.client_title && (
                          <p className="text-xs text-gray-400 mt-0.5">{t.client_title}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </Reveal>
      </div>

      <style jsx global>{`
        .swiper-bullet {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: inline-block;
          margin: 0 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .swiper-bullet-active {
          background: #D4AF37;
          width: 28px;
          border-radius: 5px;
        }
      `}</style>
    </section>
  );
}
