/*
  # Editable site content

  Everything the site says was a TypeScript array literal in the module that
  rendered it: twenty-six services in lib/services.ts, six FAQs and twelve
  service options in contact-section.tsx, four strengths and three figures in
  about-section.tsx, five process steps, four counters, thirty-two design
  images across six categories, two before/after pairs, eight footer links,
  eight client names in lib/clients.ts, and every eyebrow and heading. Changing
  a phone number, a warranty term or a photograph meant editing a module,
  rebuilding and redeploying.

  These tables move all of it into the database, so it is edited in the
  Supabase table editor and picked up on the next revalidation.

  ## Shape

  Every list table carries the same three columns:

    id           a stable text slug, not a uuid — it is the ON CONFLICT key the
                 generated seed upserts against, so re-running this migration
                 refreshes the shipped rows in place instead of duplicating
                 them. An editor adding a row picks their own slug.
    sort_order   an integer, seeded in tens so a row can be slotted between two
                 others without renumbering the table.
    is_published a boolean, so content can be taken off the site and put back
                 without being destroyed. The site reads only published rows.

  The exceptions are `site_settings`, keyed by setting name, and
  `section_headings`, keyed by section — both are maps rather than lists, so
  neither needs an ordering or a published flag.

  ## Security

  Public read, no public write. Everything here is already visible to anyone
  loading the page, so anon SELECT gives nothing away; editing goes through the
  Supabase dashboard, which authenticates as the service role and bypasses RLS.
  Deliberately no anon INSERT/UPDATE/DELETE: the anon key ships to every
  browser, and a write policy would let anyone rewrite the site's copy.

  The application never breaks on missing data — lib/content/fetch.ts falls
  back per table to lib/content/defaults.ts — so this migration is safe to
  apply before any content is reviewed, and the site is safe to run without it.

  Safe to re-run.
*/

-- ---------------------------------------------------------------------------
-- List tables: shared columns, RLS, policy, index and updated_at trigger
--
-- A procedural loop rather than fifteen copies of the same twenty lines: the
-- copies would drift, and the one that drifted would be the table whose RLS
-- was never enabled. public.set_updated_at() comes from
-- 20260801170000_harden_schema.sql.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'service_groups', 'services', 'about_features', 'about_stats',
    'process_steps', 'stats', 'faqs', 'design_categories', 'design_images',
    'before_after', 'service_options', 'footer_services', 'hero_clients'
  ]
  LOOP
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS public.%I (
         id text PRIMARY KEY,
         sort_order integer NOT NULL DEFAULT 0,
         is_published boolean NOT NULL DEFAULT true,
         created_at timestamptz NOT NULL DEFAULT now(),
         updated_at timestamptz NOT NULL DEFAULT now()
       )', target_table
    );

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);

    EXECUTE format('DROP POLICY IF EXISTS anon_select_%I ON public.%I', target_table, target_table);
    EXECUTE format(
      'CREATE POLICY anon_select_%I ON public.%I FOR SELECT
         TO anon, authenticated USING (true)',
      target_table, target_table
    );

    -- The site's only query shape: published rows, in order.
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (sort_order) WHERE is_published',
      target_table || '_published_sort_idx', target_table
    );

    EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I', target_table, target_table);
    EXECUTE format(
      'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      target_table, target_table
    );
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- Per-table columns
-- ---------------------------------------------------------------------------

ALTER TABLE public.service_groups
  ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT '';

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS group_slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'Box',
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE public.about_features
  ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'Box',
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

-- `value` is free text ("+15", "100%"), not a number: these are typeset as
-- given and never counted up, unlike public.stats below.
ALTER TABLE public.about_stats
  ADD COLUMN IF NOT EXISTS value text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT '';

ALTER TABLE public.process_steps
  ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'Box',
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE public.stats
  ADD COLUMN IF NOT EXISTS emoji text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS target numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suffix text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT '';

ALTER TABLE public.faqs
  ADD COLUMN IF NOT EXISTS question text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS answer text NOT NULL DEFAULT '';

ALTER TABLE public.design_categories
  ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT '';

ALTER TABLE public.design_images
  ADD COLUMN IF NOT EXISTS category_slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '';

ALTER TABLE public.before_after
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS before_image text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS after_image text NOT NULL DEFAULT '';

ALTER TABLE public.service_options
  ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT '';

ALTER TABLE public.footer_services
  ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT '';

ALTER TABLE public.hero_clients
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';

-- A service or a design image whose parent slug does not exist renders
-- nowhere, which is a miserable thing to debug from the table editor. These
-- make the mistake impossible rather than invisible.
ALTER TABLE public.service_groups DROP CONSTRAINT IF EXISTS service_groups_slug_key;
ALTER TABLE public.service_groups ADD CONSTRAINT service_groups_slug_key UNIQUE (slug);

ALTER TABLE public.design_categories DROP CONSTRAINT IF EXISTS design_categories_slug_key;
ALTER TABLE public.design_categories ADD CONSTRAINT design_categories_slug_key UNIQUE (slug);

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_group_slug_fkey;
ALTER TABLE public.services
  ADD CONSTRAINT services_group_slug_fkey
  FOREIGN KEY (group_slug) REFERENCES public.service_groups (slug)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.design_images DROP CONSTRAINT IF EXISTS design_images_category_slug_fkey;
ALTER TABLE public.design_images
  ADD CONSTRAINT design_images_category_slug_fkey
  FOREIGN KEY (category_slug) REFERENCES public.design_categories (slug)
  ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS services_group_slug_idx ON public.services (group_slug);
CREATE INDEX IF NOT EXISTS design_images_category_slug_idx ON public.design_images (category_slug);

-- ---------------------------------------------------------------------------
-- Maps: settings and section headings
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.section_headings (
  section text PRIMARY KEY,
  eyebrow text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  subtitle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY['site_settings', 'section_headings']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);

    EXECUTE format('DROP POLICY IF EXISTS anon_select_%I ON public.%I', target_table, target_table);
    EXECUTE format(
      'CREATE POLICY anon_select_%I ON public.%I FOR SELECT
         TO anon, authenticated USING (true)',
      target_table, target_table
    );

    EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I', target_table, target_table);
    EXECUTE format(
      'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      target_table, target_table
    );
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- Seed
--
-- Generated from lib/content/defaults.ts by
-- scripts/generate-content-seed.mjs. Do not edit the block below by hand:
-- change the defaults and regenerate, so the seeded rows and the fallback the
-- site uses when the database is unreachable stay the same data.
-- ---------------------------------------------------------------------------

-- @generated-seed-start
-- Generated by scripts/generate-content-seed.mjs — do not edit by hand.
-- Re-run it after changing lib/content/defaults.ts.

INSERT INTO public.site_settings (key, value) VALUES
  ('contact.address', 'القاهرة الجديدة، القاهرة، مصر'),
  ('contact.address_short', 'القاهرة الجديدة، مصر'),
  ('contact.city', 'القاهرة الجديدة'),
  ('contact.country_code', 'EG'),
  ('hours.days', 'السبت - الخميس'),
  ('hours.time', '9:00 ص - 9:00 م'),
  ('warranty.structural_years', '2'),
  ('warranty.finishing_years', '1'),
  ('timelines.apartments', '60-90 يوماً'),
  ('timelines.villas', '120-180 يوماً'),
  ('timelines.offices', '60-120 يوماً'),
  ('hero.clients_label', 'TRUSTED BY OUR CLIENTS'),
  ('projects.empty', 'سيتم إضافة المشاريع قريباً.'),
  ('before_after.eyebrow', 'قبل و بعد'),
  ('before_after.title', 'شاهد التحول بنفسك'),
  ('before_after.hint', 'اسحب المقبض أو استخدم أسهم لوحة المفاتيح لرؤية الفرق'),
  ('partners.title', 'شركاؤنا'),
  ('form.submit_label', 'احجز استشارتك المجانية'),
  ('form.success', 'تم استلام طلبك بنجاح. سنتواصل معك خلال 24 ساعة.'),
  ('chat.role_note', 'مساعد آلي — للتحدث مع فريقنا استخدم واتساب'),
  ('chat.fallback', 'لم أفهم سؤالك تماماً. يسعدنا مساعدتك مباشرة عبر واتساب أو من خلال نموذج الحجز.'),
  ('chat.whatsapp_cta', 'التحدث مع فريقنا على واتساب')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value;

INSERT INTO public.section_headings (section, eyebrow, title, subtitle) VALUES
  ('about', 'من نحن', 'رحلة متكاملة من الفكرة إلى الواقع', 'شركة الكيان تقدم حلولاً شاملة في المقاولات والتشطيبات الداخلية، ونرافقك في كل خطوة نحو مساحة أحلامك'),
  ('services', 'خدماتنا', 'حلول متكاملة تحت سقف واحد', 'باقة شاملة من خدمات المقاولات والتشطيبات والتصميم لتلبية كل احتياجاتك'),
  ('projects', 'مشاريعنا', 'معرض أعمالنا الفاخرة', 'نظرة على بعض مشاريعنا التي نفذناها بأعلى معايير الجودة والاحترافية'),
  ('designs', 'التصميمات', 'استكشف تصاميمنا الإبداعية', 'من المخططات ثنائية الأبعاد إلى العروض ثلاثية الأبعاد والفيديوهات التفاعلية'),
  ('process', 'آلية العمل', 'رحلتك معنا خطوة بخطوة', 'منهجية واضحة ومنظمة تضمن وصولك لنتيجة تفوق توقعاتك'),
  ('testimonials', 'آراء العملاء', 'ماذا يقول عملاؤنا', 'ثقة عملائنا هي أكبر إنجازاتنا'),
  ('faq', 'الأسئلة الشائعة', 'إجابات على أكثر تساؤلاتكم', NULL)
ON CONFLICT (section) DO UPDATE SET
    eyebrow = EXCLUDED.eyebrow,
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle;

INSERT INTO public.service_groups (id, slug, label, sort_order) VALUES
  ('finishing', 'finishing', 'التشطيبات', 10),
  ('design', 'design', 'التصميم', 20),
  ('specialized', 'specialized', 'الأعمال المتخصصة', 30)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    label = EXCLUDED.label,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.services (id, group_slug, icon, title, description, sort_order) VALUES
  ('finishing-home-1', 'finishing', 'Home', 'تشطيب الشقق', 'تصاميم عصرية وجودة عالية', 10),
  ('finishing-building2-2', 'finishing', 'Building2', 'تشطيب الفلل', 'فلل فاخرة بأدق التفاصيل', 20),
  ('finishing-briefcase-3', 'finishing', 'Briefcase', 'تشطيب المكاتب', 'مساحات عمل احترافية', 30),
  ('finishing-store-4', 'finishing', 'Store', 'تشطيب المحلات', 'تصاميم تجارية جذابة', 40),
  ('finishing-stethoscope-5', 'finishing', 'Stethoscope', 'تشطيب العيادات', 'بيئات طبية نظيفة ومريحة', 50),
  ('finishing-utensilscrossed-6', 'finishing', 'UtensilsCrossed', 'المطاعم والكافيهات', 'أجواء استثنائية لا تُنسى', 60),
  ('finishing-building-7', 'finishing', 'Building', 'تشطيب الشركات', 'مقرات تعكس الاحترافية', 70),
  ('design-sofa-1', 'design', 'Sofa', 'تصميم داخلي', 'تصاميم فاخرة تناسب ذوقك', 10),
  ('design-palette-2', 'design', 'Palette', 'تصميم خارجي', 'واجهات معمارية لافتة', 20),
  ('design-ruler-3', 'design', 'Ruler', 'تصميم 2D', 'مخططات دقيقة وشاملة', 30),
  ('design-box-4', 'design', 'Box', 'تصميم 3D', 'مشاهدة واقعية قبل التنفيذ', 40),
  ('design-trees-5', 'design', 'Trees', 'تصميم حدائق', 'مساحات خضراء ساحرة', 50),
  ('design-flower2-6', 'design', 'Flower2', 'تصميم المناظر', 'تنسيق خارجي متكامل', 60),
  ('design-dooropen-7', 'design', 'DoorOpen', 'المداخل', 'انطباع أول قوي', 70),
  ('design-sun-8', 'design', 'Sun', 'الواجهات', 'واجهات مبتكرة وعصرية', 80),
  ('specialized-zap-1', 'specialized', 'Zap', 'الإضاءة', 'أنظمة تخلق الأجواء المثالية', 10),
  ('specialized-droplets-2', 'specialized', 'Droplets', 'السباكة', 'أنظمة صحية متكاملة', 20),
  ('specialized-layers-3', 'specialized', 'Layers', 'الجبس بورد', 'تشكيلات ديكورية أنيقة', 30),
  ('specialized-paintbrush-4', 'specialized', 'Paintbrush', 'الدهانات', 'دهانات فاخرة ودائمة', 40),
  ('specialized-grid3x3-5', 'specialized', 'Grid3x3', 'الأرضيات', 'أفضل الخامات والتشطيبات', 50),
  ('specialized-gem-6', 'specialized', 'Gem', 'الرخام', 'أعمال رخام فاخرة', 60),
  ('specialized-treepine-7', 'specialized', 'TreePine', 'النجارة', 'دقة وخامات ممتازة', 70),
  ('specialized-dooropen-8', 'specialized', 'DoorOpen', 'الألمنيوم', 'ألمنيوم حراري وديكوري', 80),
  ('specialized-cpu-9', 'specialized', 'Cpu', 'السمارت هوم', 'أنظمة منزل ذكي متكاملة', 90),
  ('specialized-refreshcw-10', 'specialized', 'RefreshCw', 'الترميم', 'تجديد بلمسة عصرية', 100),
  ('specialized-wrench-11', 'specialized', 'Wrench', 'الصيانة', 'صيانة دورية احترافية', 110)
ON CONFLICT (id) DO UPDATE SET
    group_slug = EXCLUDED.group_slug,
    icon = EXCLUDED.icon,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.about_features (id, icon, title, description, sort_order) VALUES
  ('about-feature-1', 'Award', 'جودة استثنائية', 'نختار أفضل الخامات ونطبق معايير دقيقة في كل مرحلة من مراحل التنفيذ، بداية من التجهيز وحتى آخر لمسة.', 10),
  ('about-feature-2', 'Users', 'فريق متخصص', 'يعمل معك فريق من المهندسين والفنيين المتخصصين لضمان تنفيذ التصميم بالشكل المطلوب وبأعلى دقة.', 20),
  ('about-feature-3', 'Clock3', 'التزام بالمواعيد', 'نضع جدولاً واضحاً للتنفيذ ونتابعه خطوة بخطوة حتى نحافظ على موعد التسليم ونقلل أي تأخير غير ضروري.', 30),
  ('about-feature-4', 'ShieldCheck', 'ضمان وثقة', 'علاقتنا مع العميل لا تنتهي عند التسليم. نقدم المتابعة والدعم لضمان استمرار جودة العمل وراحة العميل.', 40)
ON CONFLICT (id) DO UPDATE SET
    icon = EXCLUDED.icon,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.about_stats (id, value, label, sort_order) VALUES
  ('about-stat-1', '+15', 'سنة خبرة', 10),
  ('about-stat-2', '+250', 'مشروع مكتمل', 20),
  ('about-stat-3', '100%', 'رضا والتزام', 30)
ON CONFLICT (id) DO UPDATE SET
    value = EXCLUDED.value,
    label = EXCLUDED.label,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.process_steps (id, icon, title, description, sort_order) VALUES
  ('step-1', 'MessageSquare', 'الاستشارة والمعاينة', 'نستمع لرؤيتك ونزور الموقع لتحديد المتطلبات', 10),
  ('step-2', 'PencilRuler', 'التصميم 2D', 'مخططات أولية دقيقة للمساحة', 20),
  ('step-3', 'Box', 'التصور 3D', 'ترى مشروعك واقعياً قبل التنفيذ', 30),
  ('step-4', 'FileText', 'العرض والتعاقد', 'عرض سعر مفصل وشفاف بلا رسوم خفية', 40),
  ('step-5', 'KeyRound', 'التنفيذ والتسليم', 'تنفيذ بأعلى المعايير حتى تسليم المفتاح', 50)
ON CONFLICT (id) DO UPDATE SET
    icon = EXCLUDED.icon,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.stats (id, emoji, target, suffix, label, sort_order) VALUES
  ('stat-1', '🏗️', 450, '+', 'مشروع منجز', 10),
  ('stat-2', '⭐', 15, '+', 'سنة خبرة', 20),
  ('stat-3', '😊', 380, '+', 'عميل سعيد', 30),
  ('stat-4', '📐', 250000, ' م²', 'مساحة منجزة', 40)
ON CONFLICT (id) DO UPDATE SET
    emoji = EXCLUDED.emoji,
    target = EXCLUDED.target,
    suffix = EXCLUDED.suffix,
    label = EXCLUDED.label,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.faqs (id, question, answer, sort_order) VALUES
  ('faq-1', 'ما هي مدة تنفيذ المشروع؟', 'تختلف مدة التنفيذ حسب نوع وحجم المشروع. الشقق السكنية تستغرق عادة 60-90 يوماً، بينما الفلل قد تستغرق 120-180 يوماً. نقدم لك جدولاً زمنياً دقيقاً بعد الاستشارة الأولى.', 10),
  ('faq-2', 'هل تقدمون ضماناً على الأعمال؟', 'نعم، نقدم ضماناً شاملاً على جميع أعمالنا. مدة الضمان تختلف حسب نوع العمل، وتصل إلى سنتين للأعمال الإنشائية وسنة للتشطيبات والديكورات.', 20),
  ('faq-3', 'هل يمكنني رؤية المشروع قبل التنفيذ؟', 'بالتأكيد. نوفر تصاميم ثلاثية الأبعاد وعروضاً واقعية لمشروعك قبل بدء التنفيذ، حتى تتمكن من رؤية كل تفصيلة والموافقة عليها.', 30),
  ('faq-4', 'كيف يتم تحديد تكلفة المشروع؟', 'نقوم بزيارة الموقع مجاناً ثم نقدم عرض سعر مفصلاً وشفافاً يشمل جميع التكاليف بدون أي رسوم خفية. السعر يعتمد على المساحة، الخامات المطلوبة، ونوع التشطيب.', 40),
  ('faq-5', 'هل تعملون في جميع المحافظات؟', 'نعمل في جميع المحافظات الرئيسية بجمهورية مصر العربية. للاستفسار عن توفر الخدمة في منطقتك، يرجى التواصل معنا عبر نموذج الاتصال أو الواتساب.', 50),
  ('faq-6', 'ما هي طرق الدفع المتاحة؟', 'نقدم خطط دفع مرنة على دفعات مرتبطة بمراحل المشروع. نقبل التحويل البنكي والشيكات. يتم الاتفاق على جدول الدفع في عقد المشروع.', 60)
ON CONFLICT (id) DO UPDATE SET
    question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.design_categories (id, slug, label, sort_order) VALUES
  ('2d-plans', '2d-plans', 'مخططات 2D', 10),
  ('3d-designs', '3d-designs', 'تصاميم 3D', 20),
  ('exterior', 'exterior', 'تصاميم خارجية', 30),
  ('interior', 'interior', 'تصاميم داخلية', 40),
  ('360-views', '360-views', 'عروض 360°', 50),
  ('walkthrough', 'walkthrough', 'فيديوهات تجول', 60)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    label = EXCLUDED.label,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.design_images (id, category_slug, image_url, sort_order) VALUES
  ('2d-plans-1', '2d-plans', 'https://images.pexels.com/photos/7722168/pexels-photo-7722168.jpeg?auto=compress&cs=tinysrgb&w=940', 10),
  ('2d-plans-2', '2d-plans', 'https://images.pexels.com/photos/8089172/pexels-photo-8089172.jpeg?auto=compress&cs=tinysrgb&w=940', 20),
  ('2d-plans-3', '2d-plans', 'https://images.pexels.com/photos/7546323/pexels-photo-7546323.jpeg?auto=compress&cs=tinysrgb&w=940', 30),
  ('2d-plans-4', '2d-plans', 'https://images.pexels.com/photos/8135492/pexels-photo-8135492.jpeg?auto=compress&cs=tinysrgb&w=940', 40),
  ('2d-plans-5', '2d-plans', 'https://images.pexels.com/photos/7174113/pexels-photo-7174113.jpeg?auto=compress&cs=tinysrgb&w=940', 50),
  ('2d-plans-6', '2d-plans', 'https://images.pexels.com/photos/34887637/pexels-photo-34887637.jpeg?auto=compress&cs=tinysrgb&w=940', 60),
  ('3d-designs-1', '3d-designs', 'https://images.pexels.com/photos/33529500/pexels-photo-33529500.jpeg?auto=compress&cs=tinysrgb&w=940', 10),
  ('3d-designs-2', '3d-designs', 'https://images.pexels.com/photos/27164969/pexels-photo-27164969.jpeg?auto=compress&cs=tinysrgb&w=940', 20),
  ('3d-designs-3', '3d-designs', 'https://images.pexels.com/photos/33529503/pexels-photo-33529503.jpeg?auto=compress&cs=tinysrgb&w=940', 30),
  ('3d-designs-4', '3d-designs', 'https://images.pexels.com/photos/8135492/pexels-photo-8135492.jpeg?auto=compress&cs=tinysrgb&w=940', 40),
  ('3d-designs-5', '3d-designs', 'https://images.pexels.com/photos/30002783/pexels-photo-30002783.jpeg?auto=compress&cs=tinysrgb&w=940', 50),
  ('3d-designs-6', '3d-designs', 'https://images.pexels.com/photos/38468834/pexels-photo-38468834.jpeg?auto=compress&cs=tinysrgb&w=940', 60),
  ('exterior-1', 'exterior', 'https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=940', 10),
  ('exterior-2', 'exterior', 'https://images.pexels.com/photos/17174768/pexels-photo-17174768.jpeg?auto=compress&cs=tinysrgb&w=940', 20),
  ('exterior-3', 'exterior', 'https://images.pexels.com/photos/10647324/pexels-photo-10647324.jpeg?auto=compress&cs=tinysrgb&w=940', 30),
  ('exterior-4', 'exterior', 'https://images.pexels.com/photos/8134745/pexels-photo-8134745.jpeg?auto=compress&cs=tinysrgb&w=940', 40),
  ('exterior-5', 'exterior', 'https://images.pexels.com/photos/7031594/pexels-photo-7031594.jpeg?auto=compress&cs=tinysrgb&w=940', 50),
  ('exterior-6', 'exterior', 'https://images.pexels.com/photos/14603131/pexels-photo-14603131.jpeg?auto=compress&cs=tinysrgb&w=940', 60),
  ('interior-1', 'interior', 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=940', 10),
  ('interior-2', 'interior', 'https://images.pexels.com/photos/7546276/pexels-photo-7546276.jpeg?auto=compress&cs=tinysrgb&w=940', 20),
  ('interior-3', 'interior', 'https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&w=940', 30),
  ('interior-4', 'interior', 'https://images.pexels.com/photos/6492399/pexels-photo-6492399.jpeg?auto=compress&cs=tinysrgb&w=940', 40),
  ('interior-5', 'interior', 'https://images.pexels.com/photos/8142047/pexels-photo-8142047.jpeg?auto=compress&cs=tinysrgb&w=940', 50),
  ('interior-6', 'interior', 'https://images.pexels.com/photos/7166637/pexels-photo-7166637.jpeg?auto=compress&cs=tinysrgb&w=940', 60),
  ('360-views-1', '360-views', 'https://images.pexels.com/photos/33685856/pexels-photo-33685856.jpeg?auto=compress&cs=tinysrgb&w=940', 10),
  ('360-views-2', '360-views', 'https://images.pexels.com/photos/36121750/pexels-photo-36121750.jpeg?auto=compress&cs=tinysrgb&w=940', 20),
  ('360-views-3', '360-views', 'https://images.pexels.com/photos/29012619/pexels-photo-29012619.jpeg?auto=compress&cs=tinysrgb&w=940', 30),
  ('360-views-4', '360-views', 'https://images.pexels.com/photos/34688219/pexels-photo-34688219.jpeg?auto=compress&cs=tinysrgb&w=940', 40),
  ('walkthrough-1', 'walkthrough', 'https://images.pexels.com/photos/8082243/pexels-photo-8082243.jpeg?auto=compress&cs=tinysrgb&w=940', 10),
  ('walkthrough-2', 'walkthrough', 'https://images.pexels.com/photos/8082233/pexels-photo-8082233.jpeg?auto=compress&cs=tinysrgb&w=940', 20),
  ('walkthrough-3', 'walkthrough', 'https://images.pexels.com/photos/35058546/pexels-photo-35058546.jpeg?auto=compress&cs=tinysrgb&w=940', 30),
  ('walkthrough-4', 'walkthrough', 'https://images.pexels.com/photos/33342710/pexels-photo-33342710.jpeg?auto=compress&cs=tinysrgb&w=940', 40)
ON CONFLICT (id) DO UPDATE SET
    category_slug = EXCLUDED.category_slug,
    image_url = EXCLUDED.image_url,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.before_after (id, title, before_image, after_image, sort_order) VALUES
  ('before-after-1', 'شقة النخبة - التجمع الخامس', 'https://images.pexels.com/photos/15087186/pexels-photo-15087186.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/7546323/pexels-photo-7546323.jpeg?auto=compress&cs=tinysrgb&w=1920', 10),
  ('before-after-2', 'فيلا الياسمين - الشيخ زايد', 'https://images.pexels.com/photos/19408681/pexels-photo-19408681.jpeg?auto=compress&cs=tinysrgb&w=1920', 'https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=1920', 20)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    before_image = EXCLUDED.before_image,
    after_image = EXCLUDED.after_image,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.service_options (id, label, sort_order) VALUES
  ('service-option-1', 'تشطيب شقة', 10),
  ('service-option-2', 'تشطيب فيلا', 20),
  ('service-option-3', 'تشطيب مكتب', 30),
  ('service-option-4', 'تشطيب عيادة', 40),
  ('service-option-5', 'تشطيب مطعم', 50),
  ('service-option-6', 'تشطيب محل تجاري', 60),
  ('service-option-7', 'تصميم داخلي', 70),
  ('service-option-8', 'تصميم خارجي وواجهات', 80),
  ('service-option-9', 'تنسيق حدائق', 90),
  ('service-option-10', 'ترميم وتجديد', 100),
  ('service-option-11', 'إشراف هندسي', 110),
  ('service-option-12', 'أخرى', 120)
ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.footer_services (id, label, sort_order) VALUES
  ('footer-service-1', 'تشطيبات داخلية فاخرة', 10),
  ('footer-service-2', 'تصميم داخلي', 20),
  ('footer-service-3', 'تصميم خارجي وواجهات', 30),
  ('footer-service-4', 'مقاولات عامة', 40),
  ('footer-service-5', 'إشراف هندسي', 50),
  ('footer-service-6', 'ترميم وتجديد', 60),
  ('footer-service-7', 'تنسيق حدائق', 70),
  ('footer-service-8', 'أنظمة ذكية', 80)
ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.hero_clients (id, name, sort_order) VALUES
  ('client-1', 'شركة الدهانات الفاخرة', 10),
  ('client-2', 'مجموعة البورسلان الدولية', 20),
  ('client-3', 'شركة أنظمة السمارت هوم', 30),
  ('client-4', 'مؤسسة الحجر الطبيعي', 40),
  ('client-5', 'شركة الرخام الملكي', 50),
  ('client-6', 'مجموعة الإضاءة الحديثة', 60),
  ('client-7', 'شركة الخشب الطبيعي', 70),
  ('client-8', 'مؤسسة الألمنيوم الذهبي', 80)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;
-- @generated-seed-end
