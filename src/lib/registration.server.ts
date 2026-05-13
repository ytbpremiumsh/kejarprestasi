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

const TOKEN_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateToken(kind: RegistrationPayload["kind"]) {
  const prefix = kind === "prestasi" ? "KP-PRE-" : "KP-EKO-";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `${prefix}${Array.from(bytes, (byte) => TOKEN_CHARS[byte % TOKEN_CHARS.length]).join("")}`;
}

export async function insertRegistration(data: RegistrationPayload) {
  let lastError: { code?: string; message?: string } | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = generateToken(data.kind);
    const { data: inserted, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        token,
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

    if (!error) return { token: (inserted as { token?: string } | null)?.token ?? token };

    lastError = error;
    if (error.code !== "23505") throw new Error(error.message);
  }

  throw new Error(lastError?.message ?? "Gagal membuat kode pendaftar. Coba lagi.");
}