"""
One-shot generator for lib/content/defaults.ts.

Reads the hardcoded arrays out of the section components they used to live in
and emits the defaults module, so the shipped content is transcribed by machine
rather than by hand. Run once during the move to Supabase-backed content; kept
in the repo as the record of where those values came from.

    python scripts/gen-defaults.py

After the move, edit lib/content/defaults.ts directly and re-run
scripts/generate-content-seed.mjs — not this.
"""

import io
import json
import re

ROOT = ""


def read(path):
    return io.open(path, encoding="utf-8").read()


def q(s):
    return json.dumps(s, ensure_ascii=False)


def sl(prefix, i):
    return "%s-%d" % (prefix, i)


# --------------------------------------------------------------------------
# Extract
# --------------------------------------------------------------------------

svc = read("lib/services.ts")
groups = []
for gm in re.finditer(
    r'\{\s*id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*services:\s*\[(.*?)\n    \],', svc, re.S
):
    items = re.findall(r'\{ icon: (\w+), title: "([^"]+)", desc: "([^"]+)" \}', gm.group(3))
    groups.append((gm.group(1), gm.group(2), items))
assert len(groups) == 3, groups

services = []
for gid, _label, items in groups:
    for i, (icon, title, desc) in enumerate(items, 1):
        services.append(("%s-%s-%d" % (gid, icon.lower(), i), gid, icon, title, desc, i * 10))

ds = read("components/sections/designs-section.tsx")
cats = []
for m in re.finditer(r'\{ id: "([^"]+)", label: "([^"]+)", images: \[(.*?)\]\}', ds, re.S):
    cats.append((m.group(1), m.group(2), re.findall(r'"(https://[^"]+)"', m.group(3))))
assert len(cats) == 6, len(cats)

cs = read("components/sections/contact-section.tsx")
faqs = re.findall(r'\{\s*q: "([^"]+)",\s*a:\s*"([^"]+)",\s*\}', cs, re.S)
opts = re.findall(
    r'^  "([^"]+)",$', cs[cs.index("const serviceOptions") : cs.index("const emptyForm")], re.M
)

ps = read("components/sections/projects-section.tsx")
ba = re.findall(
    r'\{\s*before:\s*"([^"]+)",\s*after:\s*"([^"]+)",\s*title: "([^"]+)",\s*\}', ps, re.S
)

ab = read("components/sections/about-section.tsx")
feats = re.findall(r'\{\s*icon: (\w+),\s*title: "([^"]+)",\s*desc:\s*"([^"]+)",\s*\}', ab, re.S)
astats = re.findall(r'\{ value: "([^"]+)", label: "([^"]+)" \}', ab)

st = read("components/sections/stats-section.tsx")
counters = re.findall(
    r'\{ target: (\d+), suffix: "([^"]*)", label: "([^"]+)", icon: "([^"]+)" \}', st
)

wp = read("components/sections/work-process-section.tsx")
steps = re.findall(r'\{ icon: (\w+), title: "([^"]+)", desc: "([^"]+)" \}', wp)

sf = read("components/site-footer.tsx")
fsvc = re.findall(r'^  "([^"]+)",$', sf[sf.index("const services = [") : sf.index("const socials")], re.M)

clients = re.findall(r'^  "([^"]+)",$', read("lib/clients.ts"), re.M)

for name, got, want in [
    ("faqs", len(faqs), 6),
    ("serviceOptions", len(opts), 12),
    ("beforeAfter", len(ba), 2),
    ("aboutFeatures", len(feats), 4),
    ("aboutStats", len(astats), 3),
    ("stats", len(counters), 4),
    ("processSteps", len(steps), 5),
    ("footerServices", len(fsvc), 8),
    ("heroClients", len(clients), 8),
    ("services", len(services), 26),
]:
    assert got == want, "%s: got %d, expected %d" % (name, got, want)

# --------------------------------------------------------------------------
# Emit
# --------------------------------------------------------------------------

SETTINGS = [
    ("Contact. NEXT_PUBLIC_* env vars still win over these — see", None),
    ("lib/content/site-details.ts for the precedence.", None),
    ("contact.address", "القاهرة الجديدة، القاهرة، مصر"),
    ("contact.address_short", "القاهرة الجديدة، مصر"),
    ("contact.city", "القاهرة الجديدة"),
    ("contact.country_code", "EG"),
    ("", None),
    ("hours.days", "السبت - الخميس"),
    ("hours.time", "9:00 ص - 9:00 م"),
    ("", None),
    ("Quoted by the chat widget and the FAQ. Stored as text like every", None),
    ("other setting; site-details.ts parses and falls back on garbage.", None),
    ("warranty.structural_years", "2"),
    ("warranty.finishing_years", "1"),
    ("", None),
    ("timelines.apartments", "60-90 يوماً"),
    ("timelines.villas", "120-180 يوماً"),
    ("timelines.offices", "60-120 يوماً"),
    ("", None),
    ("Hero.", None),
    ("hero.clients_label", "TRUSTED BY OUR CLIENTS"),
    ("", None),
    ("Projects and the before/after block.", None),
    ("projects.empty", "سيتم إضافة المشاريع قريباً."),
    ("before_after.eyebrow", "قبل و بعد"),
    ("before_after.title", "شاهد التحول بنفسك"),
    ("before_after.hint", "اسحب المقبض أو استخدم أسهم لوحة المفاتيح لرؤية الفرق"),
    ("partners.title", "شركاؤنا"),
    ("", None),
    ("Booking form.", None),
    ("form.submit_label", "احجز استشارتك المجانية"),
    ("form.success", "تم استلام طلبك بنجاح. سنتواصل معك خلال 24 ساعة."),
    ("", None),
    ("Chat widget.", None),
    ("chat.role_note", "مساعد آلي — للتحدث مع فريقنا استخدم واتساب"),
    (
        "chat.fallback",
        "لم أفهم سؤالك تماماً. يسعدنا مساعدتك مباشرة عبر واتساب أو من خلال نموذج الحجز.",
    ),
    ("chat.whatsapp_cta", "التحدث مع فريقنا على واتساب"),
]

HEADINGS = [
    (
        "about",
        "من نحن",
        "رحلة متكاملة من الفكرة إلى الواقع",
        "شركة الكيان تقدم حلولاً شاملة في المقاولات والتشطيبات الداخلية، ونرافقك في كل خطوة نحو مساحة أحلامك",
    ),
    (
        "services",
        "خدماتنا",
        "حلول متكاملة تحت سقف واحد",
        "باقة شاملة من خدمات المقاولات والتشطيبات والتصميم لتلبية كل احتياجاتك",
    ),
    (
        "projects",
        "مشاريعنا",
        "معرض أعمالنا الفاخرة",
        "نظرة على بعض مشاريعنا التي نفذناها بأعلى معايير الجودة والاحترافية",
    ),
    (
        "designs",
        "التصميمات",
        "استكشف تصاميمنا الإبداعية",
        "من المخططات ثنائية الأبعاد إلى العروض ثلاثية الأبعاد والفيديوهات التفاعلية",
    ),
    (
        "process",
        "آلية العمل",
        "رحلتك معنا خطوة بخطوة",
        "منهجية واضحة ومنظمة تضمن وصولك لنتيجة تفوق توقعاتك",
    ),
    ("testimonials", "آراء العملاء", "ماذا يقول عملاؤنا", "ثقة عملائنا هي أكبر إنجازاتنا"),
    ("faq", "الأسئلة الشائعة", "إجابات على أكثر تساؤلاتكم", None),
]

DOC = [
    "import type { SiteContent } from \"@/lib/content/types\";",
    "",
    "/**",
    " * The site's content, as shipped.",
    " *",
    " * This is the fallback, and it is also the seed:",
    " * scripts/generate-content-seed.mjs reads this module and emits the INSERTs",
    " * in supabase/migrations/20260830140000_editable_content.sql, so the database",
    " * starts out holding exactly what is written here and the two cannot drift",
    " * apart through a transcription slip.",
    " *",
    " * It matters that this is a complete copy rather than a set of placeholders.",
    " * Every section used to hold its own array literal, so a checkout with no",
    " * Supabase credentials still rendered a finished site. Moving the content into",
    " * the database must not take that away — with no credentials, a failed",
    " * request, or a table an editor emptied by accident, the site falls back to",
    " * this and looks exactly as it does today.",
    " *",
    " * `id` is the stable slug an editor should not change; it is the ON CONFLICT",
    " * key the generated seed upserts against, so re-running the migration updates",
    " * rows in place rather than duplicating them.",
    " *",
    " * Generated once by scripts/gen-defaults.py from the section constants this",
    " * replaced. Edit directly from here on, then re-run the seed generator.",
    " */",
    "export const defaultContent: SiteContent = {",
]

L = list(DOC)
w = L.append

w("  settings: {")
for key, value in SETTINGS:
    if value is None:
        w("    // %s" % key if key else "")
    else:
        w("    %s: %s," % (q(key), q(value)))
w("  },")
w("")

w("  headings: {")
for sec, eb, ti, sub in HEADINGS:
    w("    %s: {" % sec)
    w("      section: %s," % q(sec))
    w("      eyebrow: %s," % q(eb))
    w("      title: %s," % q(ti))
    w("      subtitle: %s," % (q(sub) if sub else "null"))
    w("    },")
w("  },")
w("")

w("  serviceGroups: [")
for i, (gid, label, _items) in enumerate(groups, 1):
    w("    { id: %s, slug: %s, label: %s, sort_order: %d }," % (q(gid), q(gid), q(label), i * 10))
w("  ],")
w("")

w("  services: [")
last = None
for sid, gid, icon, title, desc, order in services:
    if last is not None and gid != last:
        w("")
    last = gid
    w(
        "    { id: %s, group_slug: %s, icon: %s, title: %s, description: %s, sort_order: %d },"
        % (q(sid), q(gid), q(icon), q(title), q(desc), order)
    )
w("  ],")
w("")

w("  aboutFeatures: [")
for i, (icon, title, desc) in enumerate(feats, 1):
    w("    {")
    w("      id: %s," % q(sl("about-feature", i)))
    w("      icon: %s," % q(icon))
    w("      title: %s," % q(title))
    w("      description: %s," % q(desc))
    w("      sort_order: %d," % (i * 10))
    w("    },")
w("  ],")
w("")

w("  aboutStats: [")
for i, (value, label) in enumerate(astats, 1):
    w(
        "    { id: %s, value: %s, label: %s, sort_order: %d },"
        % (q(sl("about-stat", i)), q(value), q(label), i * 10)
    )
w("  ],")
w("")

w("  processSteps: [")
for i, (icon, title, desc) in enumerate(steps, 1):
    w(
        "    { id: %s, icon: %s, title: %s, description: %s, sort_order: %d },"
        % (q(sl("step", i)), q(icon), q(title), q(desc), i * 10)
    )
w("  ],")
w("")

w("  stats: [")
for i, (target, suffix, label, emoji) in enumerate(counters, 1):
    w(
        "    { id: %s, emoji: %s, target: %s, suffix: %s, label: %s, sort_order: %d },"
        % (q(sl("stat", i)), q(emoji), target, q(suffix), q(label), i * 10)
    )
w("  ],")
w("")

w("  faqs: [")
for i, (question, answer) in enumerate(faqs, 1):
    w("    {")
    w("      id: %s," % q(sl("faq", i)))
    w("      question: %s," % q(question))
    w("      answer: %s," % q(answer))
    w("      sort_order: %d," % (i * 10))
    w("    },")
w("  ],")
w("")

w("  designCategories: [")
for i, (cid, label, _urls) in enumerate(cats, 1):
    w("    { id: %s, slug: %s, label: %s, sort_order: %d }," % (q(cid), q(cid), q(label), i * 10))
w("  ],")
w("")

w("  designImages: [")
for n, (cid, _label, urls) in enumerate(cats):
    if n:
        w("")
    for i, url in enumerate(urls, 1):
        w(
            "    { id: %s, category_slug: %s, image_url: %s, sort_order: %d },"
            % (q("%s-%d" % (cid, i)), q(cid), q(url), i * 10)
        )
w("  ],")
w("")

w("  beforeAfter: [")
for i, (before, after, title) in enumerate(ba, 1):
    w("    {")
    w("      id: %s," % q(sl("before-after", i)))
    w("      title: %s," % q(title))
    w("      before_image: %s," % q(before))
    w("      after_image: %s," % q(after))
    w("      sort_order: %d," % (i * 10))
    w("    },")
w("  ],")
w("")

w("  serviceOptions: [")
for i, label in enumerate(opts, 1):
    w("    { id: %s, label: %s, sort_order: %d }," % (q(sl("service-option", i)), q(label), i * 10))
w("  ],")
w("")

w("  footerServices: [")
for i, label in enumerate(fsvc, 1):
    w("    { id: %s, label: %s, sort_order: %d }," % (q(sl("footer-service", i)), q(label), i * 10))
w("  ],")
w("")

w("  /**")
w("   * FICTIONAL PLACEHOLDERS. None of these is a client of الكيان. Replace every")
w("   * entry with a client that has agreed to be named before this reaches")
w("   * customers — a contractor listing companies it has never worked for is a")
w("   * false endorsement, and the named company is the one party guaranteed to")
w("   * notice. Editable in Supabase now, so replacing them needs no deploy.")
w("   *")
w("   * List each client once: ClientMarquee renders the list twice itself to")
w("   * close its loop.")
w("   */")
w("  heroClients: [")
for i, name in enumerate(clients, 1):
    w("    { id: %s, name: %s, sort_order: %d }," % (q(sl("client", i)), q(name), i * 10))
w("  ],")
w("};")

io.open("lib/content/defaults.ts", "w", encoding="utf-8", newline="").write("\n".join(L) + "\n")
print("wrote lib/content/defaults.ts (%d lines)" % len(L))
