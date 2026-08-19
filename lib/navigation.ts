/**
 * The site's routes, in the order they appear in the navigation.
 *
 * The header and the footer both read this list, so adding a page is one edit
 * rather than three — and the two menus cannot drift apart, which is how a
 * footer ends up linking to a page the header has forgotten.
 */

export type NavLink = {
  href: string;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "من نحن" },
  { href: "/services", label: "خدماتنا" },
  { href: "/projects", label: "مشاريعنا" },
  { href: "/contact", label: "تواصل معنا" },
];

/**
 * Is this the route the visitor is on?
 *
 * Everything except the homepage matches on prefix, so /projects/modern-villa
 * keeps "مشاريعنا" highlighted — a detail page is still inside that section of
 * the site, and dropping the highlight there makes the navigation look broken.
 *
 * "/" has to be exact, since every path starts with it.
 */
export function isActiveRoute(pathname: string | null | undefined, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}
