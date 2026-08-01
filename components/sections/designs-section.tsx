"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import { useState } from "react";

const designCategories = [
  { id: "2d-plans", label: "مخططات 2D", images: [
    "https://images.pexels.com/photos/7722168/pexels-photo-7722168.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/8089172/pexels-photo-8089172.jpeg?auto=compress&cs=tinysrgb&w=940",
  "https://images.pexels.com/photos/7546323/pexels-photo-7546323.jpeg?auto=compress&cs=tinysrgb&w=940",
  "https://images.pexels.com/photos/8135492/pexels-photo-8135492.jpeg?auto=compress&cs=tinysrgb&w=940",
  "https://images.pexels.com/photos/7174113/pexels-photo-7174113.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/34887637/pexels-photo-34887637.jpeg?auto=compress&cs=tinysrgb&w=940",
  ]},
  { id: "3d-designs", label: "تصاميم 3D", images: [
    "https://images.pexels.com/photos/33529500/pexels-photo-33529500.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/27164969/pexels-photo-27164969.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/33529503/pexels-photo-33529503.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/8135492/pexels-photo-8135492.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/30002783/pexels-photo-30002783.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/38468834/pexels-photo-38468834.jpeg?auto=compress&cs=tinysrgb&w=940",
  ]},
  { id: "exterior", label: "تصاميم خارجية", images: [
    "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/17174768/pexels-photo-17174768.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/10647324/pexels-photo-10647324.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/8134745/pexels-photo-8134745.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/7031594/pexels-photo-7031594.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/14603131/pexels-photo-14603131.jpeg?auto=compress&cs=tinysrgb&w=940",
  ]},
  { id: "interior", label: "تصاميم داخلية", images: [
    "https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/7546276/pexels-photo-7546276.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/6492399/pexels-photo-6492399.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/8142047/pexels-photo-8142047.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/7166637/pexels-photo-7166637.jpeg?auto=compress&cs=tinysrgb&w=940",
  ]},
  { id: "360-views", label: "عروض 360°", images: [
    "https://images.pexels.com/photos/33685856/pexels-photo-33685856.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/36121750/pexels-photo-36121750.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/29012619/pexels-photo-29012619.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/34688219/pexels-photo-34688219.jpeg?auto=compress&cs=tinysrgb&w=940",
  ]},
  { id: "walkthrough", label: "فيديوهات تجول", images: [
    "https://images.pexels.com/photos/8082243/pexels-photo-8082243.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/8082233/pexels-photo-8082233.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/35058546/pexels-photo-35058546.jpeg?auto=compress&cs=tinysrgb&w=940",
    "https://images.pexels.com/photos/33342710/pexels-photo-33342710.jpeg?auto=compress&cs=tinysrgb&w=940",
  ]},
];

export function DesignsSection() {
  const [active, setActive] = useState(designCategories[0].id);
  const activeCategory = designCategories.find((c) => c.id === active)!;

  return (
    <section id="designs" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />

      <div className="container-luxury">
        <SectionHeading
          eyebrow="التصميمات"
          title="استكشف تصاميمنا الإبداعية"
          subtitle="من المخططات ثنائية الأبعاد إلى العروض ثلاثية الأبعاد والفيديوهات التفاعلية"
        />

        {/* Tabs */}
        <Reveal delay={0.2} className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {designCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  active === cat.id
                    ? "gold-gradient-bg text-navy"
                    : "glass-light text-gray-300 hover:text-gold hover:border-gold/30"
                }`}
                style={active === cat.id ? { color: "#0B1F3A" } : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Gallery */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCategory.images.map((img, i) => (
            <Reveal key={`${active}-${i}`} delay={(i % 3) * 0.1} y={30}>
              <div className="zoom-container rounded-2xl overflow-hidden glass group">
                <img
                  src={img}
                  alt={`${activeCategory.label} ${i + 1}`}
                  className="zoom-image w-full h-64 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(11,31,58,0.8) 100%)" }}>
                  <span className="text-white font-bold">{activeCategory.label}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
