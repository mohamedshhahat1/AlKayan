import { createClient } from "@supabase/supabase-js";

export type SeoProject = {
  id: string;
  title: string;
  title_en: string | null;
  category: string;
  location: string | null;
  area_sqm: number | null;
  duration_days: number | null;
  execution_date: string | null;
  services_included: string[] | null;
  materials_used: string[] | null;
  client_testimonial: string | null;
  client_name: string | null;
  hero_image: string;
  gallery_images: string[] | null;
  before_image: string | null;
  after_image: string | null;
  featured: boolean;
};

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getProject(id: string) {
  const supabase = getServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as SeoProject;
}

export async function getProjectIds() {
  const supabase = getServerClient();
  if (!supabase) return [] as string[];
  const { data } = await supabase.from("projects").select("id").order("sort_order", { ascending: true });
  return (data ?? []).map((row) => row.id as string);
}
