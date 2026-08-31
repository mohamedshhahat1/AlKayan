/*
  # The booking form's button reads "احجز استشارتك الآن"

  20260830140000_editable_content.sql seeded `form.submit_label` as
  "احجز استشارتك المجانية", and an editor has since changed the row to
  "احجز استشارتك الان" — the same wording, missing the hamza on the alif.
  Neither reached a visitor: components/sections/contact-section.tsx read the
  setting into a variable and then hard-coded the Arabic in the button anyway,
  so the setting has been decorative since it shipped. That is fixed in the
  same commit as this migration, which means the value in this table is now the
  one people actually see, and it needs to be right.

  Only the two values this project has ever put there are replaced. A label an
  editor sets deliberately later is left alone — this is a correction, not a
  reset.

  Safe to re-run.
*/

UPDATE public.site_settings
SET value = 'احجز استشارتك الآن'
WHERE key = 'form.submit_label'
  AND value IN ('احجز استشارتك المجانية', 'احجز استشارتك الان');
