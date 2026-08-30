import type { SiteContent } from "@/lib/content/types";

/**
 * The site's content, as shipped.
 *
 * This is the fallback, and it is also the seed:
 * scripts/generate-content-seed.mjs reads this module and emits the INSERTs
 * in supabase/migrations/20260830140000_editable_content.sql, so the database
 * starts out holding exactly what is written here and the two cannot drift
 * apart through a transcription slip.
 *
 * It matters that this is a complete copy rather than a set of placeholders.
 * Every section used to hold its own array literal, so a checkout with no
 * Supabase credentials still rendered a finished site. Moving the content into
 * the database must not take that away — with no credentials, a failed
 * request, or a table an editor emptied by accident, the site falls back to
 * this and looks exactly as it does today.
 *
 * `id` is the stable slug an editor should not change; it is the ON CONFLICT
 * key the generated seed upserts against, so re-running the migration updates
 * rows in place rather than duplicating them.
 *
 * Generated once by scripts/gen-defaults.py from the section constants this
 * replaced. Edit directly from here on, then re-run the seed generator.
 */
export const defaultContent: SiteContent = {
  settings: {
    // Contact. NEXT_PUBLIC_* env vars still win over these — see
    // lib/content/site-details.ts for the precedence.
    "contact.address": "القاهرة الجديدة، القاهرة، مصر",
    "contact.address_short": "القاهرة الجديدة، مصر",
    "contact.city": "القاهرة الجديدة",
    "contact.country_code": "EG",

    "hours.days": "السبت - الخميس",
    "hours.time": "9:00 ص - 9:00 م",

    // Quoted by the chat widget and the FAQ. Stored as text like every
    // other setting; site-details.ts parses and falls back on garbage.
    "warranty.structural_years": "2",
    "warranty.finishing_years": "1",

    "timelines.apartments": "60-90 يوماً",
    "timelines.villas": "120-180 يوماً",
    "timelines.offices": "60-120 يوماً",

    // Hero.
    "hero.clients_label": "TRUSTED BY OUR CLIENTS",

    // Projects and the before/after block.
    "projects.empty": "سيتم إضافة المشاريع قريباً.",
    "before_after.eyebrow": "قبل و بعد",
    "before_after.title": "شاهد التحول بنفسك",
    "before_after.hint": "اسحب المقبض أو استخدم أسهم لوحة المفاتيح لرؤية الفرق",
    "partners.title": "شركاؤنا",

    // Booking form.
    "form.submit_label": "احجز استشارتك المجانية",
    "form.success": "تم استلام طلبك بنجاح. سنتواصل معك خلال 24 ساعة.",

    // Chat widget.
    "chat.role_note": "مساعد آلي — للتحدث مع فريقنا استخدم واتساب",
    "chat.fallback": "لم أفهم سؤالك تماماً. يسعدنا مساعدتك مباشرة عبر واتساب أو من خلال نموذج الحجز.",
    "chat.whatsapp_cta": "التحدث مع فريقنا على واتساب",
  },

  headings: {
    about: {
      section: "about",
      eyebrow: "من نحن",
      title: "نصنع مساحات تستحق أن تُعاش",
      subtitle: "في الكيان، لا نتعامل مع التشطيبات كمرحلة تنفيذ فقط، بل نصنع تجربة متكاملة تبدأ من الفكرة وتنتهي بمساحة تحمل طابعك.",
    },
    services: {
      section: "services",
      eyebrow: "خدماتنا",
      title: "حلول متكاملة تحت سقف واحد",
      subtitle: "باقة شاملة من خدمات المقاولات والتشطيبات والتصميم لتلبية كل احتياجاتك",
    },
    projects: {
      section: "projects",
      eyebrow: "مشاريعنا",
      title: "معرض أعمالنا الفاخرة",
      subtitle: "نظرة على بعض مشاريعنا التي نفذناها بأعلى معايير الجودة والاحترافية",
    },
    designs: {
      section: "designs",
      eyebrow: "التصميمات",
      title: "استكشف تصاميمنا الإبداعية",
      subtitle: "من المخططات ثنائية الأبعاد إلى العروض ثلاثية الأبعاد والفيديوهات التفاعلية",
    },
    process: {
      section: "process",
      eyebrow: "آلية العمل",
      title: "رحلتك معنا خطوة بخطوة",
      subtitle: "منهجية واضحة ومنظمة تضمن وصولك لنتيجة تفوق توقعاتك",
    },
    testimonials: {
      section: "testimonials",
      eyebrow: "آراء العملاء",
      title: "ماذا يقول عملاؤنا",
      subtitle: "ثقة عملائنا هي أكبر إنجازاتنا",
    },
    faq: {
      section: "faq",
      eyebrow: "الأسئلة الشائعة",
      title: "إجابات على أكثر تساؤلاتكم",
      subtitle: null,
    },
  },

  serviceGroups: [
    { id: "finishing", slug: "finishing", label: "التشطيبات", sort_order: 10 },
    { id: "design", slug: "design", label: "التصميم", sort_order: 20 },
    { id: "specialized", slug: "specialized", label: "الأعمال المتخصصة", sort_order: 30 },
  ],

  services: [
    { id: "finishing-home-1", group_slug: "finishing", icon: "Home", title: "تشطيب الشقق", description: "تصاميم عصرية وجودة عالية", sort_order: 10 },
    { id: "finishing-building2-2", group_slug: "finishing", icon: "Building2", title: "تشطيب الفلل", description: "فلل فاخرة بأدق التفاصيل", sort_order: 20 },
    { id: "finishing-briefcase-3", group_slug: "finishing", icon: "Briefcase", title: "تشطيب المكاتب", description: "مساحات عمل احترافية", sort_order: 30 },
    { id: "finishing-store-4", group_slug: "finishing", icon: "Store", title: "تشطيب المحلات", description: "تصاميم تجارية جذابة", sort_order: 40 },
    { id: "finishing-stethoscope-5", group_slug: "finishing", icon: "Stethoscope", title: "تشطيب العيادات", description: "بيئات طبية نظيفة ومريحة", sort_order: 50 },
    { id: "finishing-utensilscrossed-6", group_slug: "finishing", icon: "UtensilsCrossed", title: "المطاعم والكافيهات", description: "أجواء استثنائية لا تُنسى", sort_order: 60 },
    { id: "finishing-building-7", group_slug: "finishing", icon: "Building", title: "تشطيب الشركات", description: "مقرات تعكس الاحترافية", sort_order: 70 },

    { id: "design-sofa-1", group_slug: "design", icon: "Sofa", title: "تصميم داخلي", description: "تصاميم فاخرة تناسب ذوقك", sort_order: 10 },
    { id: "design-palette-2", group_slug: "design", icon: "Palette", title: "تصميم خارجي", description: "واجهات معمارية لافتة", sort_order: 20 },
    { id: "design-ruler-3", group_slug: "design", icon: "Ruler", title: "تصميم 2D", description: "مخططات دقيقة وشاملة", sort_order: 30 },
    { id: "design-box-4", group_slug: "design", icon: "Box", title: "تصميم 3D", description: "مشاهدة واقعية قبل التنفيذ", sort_order: 40 },
    { id: "design-trees-5", group_slug: "design", icon: "Trees", title: "تصميم حدائق", description: "مساحات خضراء ساحرة", sort_order: 50 },
    { id: "design-flower2-6", group_slug: "design", icon: "Flower2", title: "تصميم المناظر", description: "تنسيق خارجي متكامل", sort_order: 60 },
    { id: "design-dooropen-7", group_slug: "design", icon: "DoorOpen", title: "المداخل", description: "انطباع أول قوي", sort_order: 70 },
    { id: "design-sun-8", group_slug: "design", icon: "Sun", title: "الواجهات", description: "واجهات مبتكرة وعصرية", sort_order: 80 },

    { id: "specialized-zap-1", group_slug: "specialized", icon: "Zap", title: "الإضاءة", description: "أنظمة تخلق الأجواء المثالية", sort_order: 10 },
    { id: "specialized-droplets-2", group_slug: "specialized", icon: "Droplets", title: "السباكة", description: "أنظمة صحية متكاملة", sort_order: 20 },
    { id: "specialized-layers-3", group_slug: "specialized", icon: "Layers", title: "الجبس بورد", description: "تشكيلات ديكورية أنيقة", sort_order: 30 },
    { id: "specialized-paintbrush-4", group_slug: "specialized", icon: "Paintbrush", title: "الدهانات", description: "دهانات فاخرة ودائمة", sort_order: 40 },
    { id: "specialized-grid3x3-5", group_slug: "specialized", icon: "Grid3x3", title: "الأرضيات", description: "أفضل الخامات والتشطيبات", sort_order: 50 },
    { id: "specialized-gem-6", group_slug: "specialized", icon: "Gem", title: "الرخام", description: "أعمال رخام فاخرة", sort_order: 60 },
    { id: "specialized-treepine-7", group_slug: "specialized", icon: "TreePine", title: "النجارة", description: "دقة وخامات ممتازة", sort_order: 70 },
    { id: "specialized-dooropen-8", group_slug: "specialized", icon: "DoorOpen", title: "الألمنيوم", description: "ألمنيوم حراري وديكوري", sort_order: 80 },
    { id: "specialized-cpu-9", group_slug: "specialized", icon: "Cpu", title: "السمارت هوم", description: "أنظمة منزل ذكي متكاملة", sort_order: 90 },
    { id: "specialized-refreshcw-10", group_slug: "specialized", icon: "RefreshCw", title: "الترميم", description: "تجديد بلمسة عصرية", sort_order: 100 },
    { id: "specialized-wrench-11", group_slug: "specialized", icon: "Wrench", title: "الصيانة", description: "صيانة دورية احترافية", sort_order: 110 },
  ],

  aboutFeatures: [
    {
      id: "about-feature-1",
      icon: "Award",
      title: "جودة استثنائية",
      description: "نختار أفضل الخامات ونطبق معايير دقيقة في كل مرحلة من مراحل التنفيذ، بداية من التجهيز وحتى آخر لمسة.",
      sort_order: 10,
    },
    {
      id: "about-feature-2",
      icon: "Users",
      title: "فريق متخصص",
      description: "يعمل معك فريق من المهندسين والفنيين المتخصصين لضمان تنفيذ التصميم بالشكل المطلوب وبأعلى دقة.",
      sort_order: 20,
    },
    {
      id: "about-feature-3",
      icon: "Clock3",
      title: "التزام بالمواعيد",
      description: "نضع جدولاً واضحاً للتنفيذ ونتابعه خطوة بخطوة حتى نحافظ على موعد التسليم ونقلل أي تأخير غير ضروري.",
      sort_order: 30,
    },
    {
      id: "about-feature-4",
      icon: "ShieldCheck",
      title: "ضمان وثقة",
      description: "علاقتنا مع العميل لا تنتهي عند التسليم. نقدم المتابعة والدعم لضمان استمرار جودة العمل وراحة العميل.",
      sort_order: 40,
    },
  ],

  aboutStats: [
    { id: "about-stat-1", value: "+15", label: "سنة خبرة", sort_order: 10 },
    { id: "about-stat-2", value: "+250", label: "مشروع مكتمل", sort_order: 20 },
    { id: "about-stat-3", value: "100%", label: "رضا والتزام", sort_order: 30 },
  ],

  processSteps: [
    { id: "step-1", icon: "MessageSquare", title: "الاستشارة والمعاينة", description: "نستمع لرؤيتك ونزور الموقع لتحديد المتطلبات", sort_order: 10 },
    { id: "step-2", icon: "PencilRuler", title: "التصميم 2D", description: "مخططات أولية دقيقة للمساحة", sort_order: 20 },
    { id: "step-3", icon: "Box", title: "التصور 3D", description: "ترى مشروعك واقعياً قبل التنفيذ", sort_order: 30 },
    { id: "step-4", icon: "FileText", title: "العرض والتعاقد", description: "عرض سعر مفصل وشفاف بلا رسوم خفية", sort_order: 40 },
    { id: "step-5", icon: "KeyRound", title: "التنفيذ والتسليم", description: "تنفيذ بأعلى المعايير حتى تسليم المفتاح", sort_order: 50 },
  ],

  stats: [
    { id: "stat-1", emoji: "🏗️", target: 450, suffix: "+", label: "مشروع منجز", sort_order: 10 },
    { id: "stat-2", emoji: "⭐", target: 15, suffix: "+", label: "سنة خبرة", sort_order: 20 },
    { id: "stat-3", emoji: "😊", target: 380, suffix: "+", label: "عميل سعيد", sort_order: 30 },
    { id: "stat-4", emoji: "📐", target: 250000, suffix: " م²", label: "مساحة منجزة", sort_order: 40 },
  ],

  faqs: [
    {
      id: "faq-1",
      question: "ما هي مدة تنفيذ المشروع؟",
      answer: "تختلف مدة التنفيذ حسب نوع وحجم المشروع. الشقق السكنية تستغرق عادة 60-90 يوماً، بينما الفلل قد تستغرق 120-180 يوماً. نقدم لك جدولاً زمنياً دقيقاً بعد الاستشارة الأولى.",
      sort_order: 10,
    },
    {
      id: "faq-2",
      question: "هل تقدمون ضماناً على الأعمال؟",
      answer: "نعم، نقدم ضماناً شاملاً على جميع أعمالنا. مدة الضمان تختلف حسب نوع العمل، وتصل إلى سنتين للأعمال الإنشائية وسنة للتشطيبات والديكورات.",
      sort_order: 20,
    },
    {
      id: "faq-3",
      question: "هل يمكنني رؤية المشروع قبل التنفيذ؟",
      answer: "بالتأكيد. نوفر تصاميم ثلاثية الأبعاد وعروضاً واقعية لمشروعك قبل بدء التنفيذ، حتى تتمكن من رؤية كل تفصيلة والموافقة عليها.",
      sort_order: 30,
    },
    {
      id: "faq-4",
      question: "كيف يتم تحديد تكلفة المشروع؟",
      answer: "نقوم بزيارة الموقع مجاناً ثم نقدم عرض سعر مفصلاً وشفافاً يشمل جميع التكاليف بدون أي رسوم خفية. السعر يعتمد على المساحة، الخامات المطلوبة، ونوع التشطيب.",
      sort_order: 40,
    },
    {
      id: "faq-5",
      question: "هل تعملون في جميع المحافظات؟",
      answer: "نعمل في جميع المحافظات الرئيسية بجمهورية مصر العربية. للاستفسار عن توفر الخدمة في منطقتك، يرجى التواصل معنا عبر نموذج الاتصال أو الواتساب.",
      sort_order: 50,
    },
    {
      id: "faq-6",
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نقدم خطط دفع مرنة على دفعات مرتبطة بمراحل المشروع. نقبل التحويل البنكي والشيكات. يتم الاتفاق على جدول الدفع في عقد المشروع.",
      sort_order: 60,
    },
  ],

  designCategories: [
    { id: "2d-plans", slug: "2d-plans", label: "مخططات 2D", sort_order: 10 },
    { id: "3d-designs", slug: "3d-designs", label: "تصاميم 3D", sort_order: 20 },
    { id: "exterior", slug: "exterior", label: "تصاميم خارجية", sort_order: 30 },
    { id: "interior", slug: "interior", label: "تصاميم داخلية", sort_order: 40 },
    { id: "360-views", slug: "360-views", label: "عروض 360°", sort_order: 50 },
    { id: "walkthrough", slug: "walkthrough", label: "فيديوهات تجول", sort_order: 60 },
  ],

  designImages: [
    { id: "2d-plans-1", category_slug: "2d-plans", image_url: "https://images.pexels.com/photos/7722168/pexels-photo-7722168.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 10 },
    { id: "2d-plans-2", category_slug: "2d-plans", image_url: "https://images.pexels.com/photos/8089172/pexels-photo-8089172.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 20 },
    { id: "2d-plans-3", category_slug: "2d-plans", image_url: "https://images.pexels.com/photos/7546323/pexels-photo-7546323.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 30 },
    { id: "2d-plans-4", category_slug: "2d-plans", image_url: "https://images.pexels.com/photos/8135492/pexels-photo-8135492.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 40 },
    { id: "2d-plans-5", category_slug: "2d-plans", image_url: "https://images.pexels.com/photos/7174113/pexels-photo-7174113.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 50 },
    { id: "2d-plans-6", category_slug: "2d-plans", image_url: "https://images.pexels.com/photos/34887637/pexels-photo-34887637.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 60 },

    { id: "3d-designs-1", category_slug: "3d-designs", image_url: "https://images.pexels.com/photos/33529500/pexels-photo-33529500.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 10 },
    { id: "3d-designs-2", category_slug: "3d-designs", image_url: "https://images.pexels.com/photos/27164969/pexels-photo-27164969.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 20 },
    { id: "3d-designs-3", category_slug: "3d-designs", image_url: "https://images.pexels.com/photos/33529503/pexels-photo-33529503.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 30 },
    { id: "3d-designs-4", category_slug: "3d-designs", image_url: "https://images.pexels.com/photos/8135492/pexels-photo-8135492.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 40 },
    { id: "3d-designs-5", category_slug: "3d-designs", image_url: "https://images.pexels.com/photos/30002783/pexels-photo-30002783.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 50 },
    { id: "3d-designs-6", category_slug: "3d-designs", image_url: "https://images.pexels.com/photos/38468834/pexels-photo-38468834.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 60 },

    { id: "exterior-1", category_slug: "exterior", image_url: "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 10 },
    { id: "exterior-2", category_slug: "exterior", image_url: "https://images.pexels.com/photos/17174768/pexels-photo-17174768.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 20 },
    { id: "exterior-3", category_slug: "exterior", image_url: "https://images.pexels.com/photos/10647324/pexels-photo-10647324.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 30 },
    { id: "exterior-4", category_slug: "exterior", image_url: "https://images.pexels.com/photos/8134745/pexels-photo-8134745.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 40 },
    { id: "exterior-5", category_slug: "exterior", image_url: "https://images.pexels.com/photos/7031594/pexels-photo-7031594.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 50 },
    { id: "exterior-6", category_slug: "exterior", image_url: "https://images.pexels.com/photos/14603131/pexels-photo-14603131.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 60 },

    { id: "interior-1", category_slug: "interior", image_url: "https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 10 },
    { id: "interior-2", category_slug: "interior", image_url: "https://images.pexels.com/photos/7546276/pexels-photo-7546276.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 20 },
    { id: "interior-3", category_slug: "interior", image_url: "https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 30 },
    { id: "interior-4", category_slug: "interior", image_url: "https://images.pexels.com/photos/6492399/pexels-photo-6492399.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 40 },
    { id: "interior-5", category_slug: "interior", image_url: "https://images.pexels.com/photos/8142047/pexels-photo-8142047.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 50 },
    { id: "interior-6", category_slug: "interior", image_url: "https://images.pexels.com/photos/7166637/pexels-photo-7166637.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 60 },

    { id: "360-views-1", category_slug: "360-views", image_url: "https://images.pexels.com/photos/33685856/pexels-photo-33685856.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 10 },
    { id: "360-views-2", category_slug: "360-views", image_url: "https://images.pexels.com/photos/36121750/pexels-photo-36121750.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 20 },
    { id: "360-views-3", category_slug: "360-views", image_url: "https://images.pexels.com/photos/29012619/pexels-photo-29012619.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 30 },
    { id: "360-views-4", category_slug: "360-views", image_url: "https://images.pexels.com/photos/34688219/pexels-photo-34688219.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 40 },

    { id: "walkthrough-1", category_slug: "walkthrough", image_url: "https://images.pexels.com/photos/8082243/pexels-photo-8082243.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 10 },
    { id: "walkthrough-2", category_slug: "walkthrough", image_url: "https://images.pexels.com/photos/8082233/pexels-photo-8082233.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 20 },
    { id: "walkthrough-3", category_slug: "walkthrough", image_url: "https://images.pexels.com/photos/35058546/pexels-photo-35058546.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 30 },
    { id: "walkthrough-4", category_slug: "walkthrough", image_url: "https://images.pexels.com/photos/33342710/pexels-photo-33342710.jpeg?auto=compress&cs=tinysrgb&w=940", sort_order: 40 },
  ],

  beforeAfter: [
    {
      id: "before-after-1",
      title: "شقة النخبة - التجمع الخامس",
      before_image: "https://images.pexels.com/photos/15087186/pexels-photo-15087186.jpeg?auto=compress&cs=tinysrgb&w=1920",
      after_image: "https://images.pexels.com/photos/7546323/pexels-photo-7546323.jpeg?auto=compress&cs=tinysrgb&w=1920",
      sort_order: 10,
    },
    {
      id: "before-after-2",
      title: "فيلا الياسمين - الشيخ زايد",
      before_image: "https://images.pexels.com/photos/19408681/pexels-photo-19408681.jpeg?auto=compress&cs=tinysrgb&w=1920",
      after_image: "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=1920",
      sort_order: 20,
    },
  ],

  serviceOptions: [
    { id: "service-option-1", label: "تشطيب شقة", sort_order: 10 },
    { id: "service-option-2", label: "تشطيب فيلا", sort_order: 20 },
    { id: "service-option-3", label: "تشطيب مكتب", sort_order: 30 },
    { id: "service-option-4", label: "تشطيب عيادة", sort_order: 40 },
    { id: "service-option-5", label: "تشطيب مطعم", sort_order: 50 },
    { id: "service-option-6", label: "تشطيب محل تجاري", sort_order: 60 },
    { id: "service-option-7", label: "تصميم داخلي", sort_order: 70 },
    { id: "service-option-8", label: "تصميم خارجي وواجهات", sort_order: 80 },
    { id: "service-option-9", label: "تنسيق حدائق", sort_order: 90 },
    { id: "service-option-10", label: "ترميم وتجديد", sort_order: 100 },
    { id: "service-option-11", label: "إشراف هندسي", sort_order: 110 },
    { id: "service-option-12", label: "أخرى", sort_order: 120 },
  ],

  footerServices: [
    { id: "footer-service-1", label: "تشطيبات داخلية فاخرة", sort_order: 10 },
    { id: "footer-service-2", label: "تصميم داخلي", sort_order: 20 },
    { id: "footer-service-3", label: "تصميم خارجي وواجهات", sort_order: 30 },
    { id: "footer-service-4", label: "مقاولات عامة", sort_order: 40 },
    { id: "footer-service-5", label: "إشراف هندسي", sort_order: 50 },
    { id: "footer-service-6", label: "ترميم وتجديد", sort_order: 60 },
    { id: "footer-service-7", label: "تنسيق حدائق", sort_order: 70 },
    { id: "footer-service-8", label: "أنظمة ذكية", sort_order: 80 },
  ],

  /**
   * FICTIONAL PLACEHOLDERS. None of these is a client of الكيان. Replace every
   * entry with a client that has agreed to be named before this reaches
   * customers — a contractor listing companies it has never worked for is a
   * false endorsement, and the named company is the one party guaranteed to
   * notice. Editable in Supabase now, so replacing them needs no deploy.
   *
   * List each client once: ClientMarquee renders the list twice itself to
   * close its loop.
   */
  heroClients: [
    { id: "client-1", name: "شركة الدهانات الفاخرة", sort_order: 10 },
    { id: "client-2", name: "مجموعة البورسلان الدولية", sort_order: 20 },
    { id: "client-3", name: "شركة أنظمة السمارت هوم", sort_order: 30 },
    { id: "client-4", name: "مؤسسة الحجر الطبيعي", sort_order: 40 },
    { id: "client-5", name: "شركة الرخام الملكي", sort_order: 50 },
    { id: "client-6", name: "مجموعة الإضاءة الحديثة", sort_order: 60 },
    { id: "client-7", name: "شركة الخشب الطبيعي", sort_order: 70 },
    { id: "client-8", name: "مؤسسة الألمنيوم الذهبي", sort_order: 80 },
  ],
};
