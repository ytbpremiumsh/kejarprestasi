import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type RegistrationPayload = {
  kind: "prestasi" | "ekonomi";
  full_name: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  address: string;
  whatsapp: string;
  email: string;
  education_level: string;
  school_name: string;
  grade: string;
  main_achievement?: string | null;
  parent_income?: string | null;
  dependents?: number | null;
  photo_url?: string | null;
  student_card_url?: string | null;
  extra: Record<string, unknown>;
};

export async function insertRegistration(data: RegistrationPayload) {
  const { data: inserted, error } = await supabaseAdmin
    .from("registrations")
    .insert({
      kind: data.kind,
      status: "approved",
      full_name: data.full_name,
      birth_place: data.birth_place,
      birth_date: data.birth_date,
      gender: data.gender,
      address: data.address,
      whatsapp: data.whatsapp,
      email: data.email,
      education_level: data.education_level,
      school_name: data.school_name,
      grade: data.grade,
      main_achievement: data.main_achievement ?? null,
      parent_income: data.parent_income ?? null,
      dependents: data.dependents ?? null,
      photo_url: data.photo_url ?? null,
      student_card_url: data.student_card_url ?? null,
      extra: data.extra,
    } as never)
    .select("token")
    .single();

  if (error) throw new Error(error.message);
  return { token: (inserted as { token?: string } | null)?.token ?? "" };
}