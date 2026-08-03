import { z } from "zod";

/**
 * Booking form validation.
 *
 * The form previously relied on the browser's `required` attribute alone, so
 * any string — including an empty-looking one — reached the database. `zod`
 * was already a dependency but unused.
 */

/**
 * Egyptian mobile numbers.
 *
 * Ten digits beginning with 1, where the second digit identifies the network
 * (10 Vodafone, 11 Etisalat, 12 Orange, 15 WE). Accepts the local 01xxxxxxxxx
 * form as well as +20 / 0020 / bare prefixes, since people type all four.
 */
const egyptianMobile = /^(?:\+?20|0020|0)?1[0125]\d{8}$/;

export const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "الرجاء إدخال الاسم كاملاً")
    .max(80, "الاسم طويل جداً"),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => egyptianMobile.test(value), "رقم موبايل غير صحيح (مثال: 01012345678)"),
  email: z
    .string()
    .trim()
    .max(120, "البريد الإلكتروني طويل جداً")
    .email("بريد إلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  service_type: z.string().trim().max(60).optional().or(z.literal("")),
  preferred_date: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || new Date(value) >= new Date(new Date().toDateString()),
      "لا يمكن اختيار تاريخ في الماضي"
    ),
  message: z.string().trim().max(1000, "الرسالة طويلة جداً").optional().or(z.literal("")),
  /**
   * Honeypot. Hidden from real users with CSS, so any value at all means a bot
   * filled the form. Never sent to the database.
   */
  company: z.string().max(0, "").optional(),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingValues = z.output<typeof bookingSchema>;

/** Field-keyed error messages, ready to render under each input. */
export type BookingErrors = Partial<Record<keyof BookingValues, string>>;

export function collectErrors(error: z.ZodError): BookingErrors {
  const result: BookingErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof BookingValues | undefined;
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}
