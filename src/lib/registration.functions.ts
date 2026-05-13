import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { insertRegistration } from "@/lib/registration.server";

const emptyToNull = (value: unknown) => {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
};

const urlOrNull = z.preprocess(
  emptyToNull,
  z.string().url("URL berkas tidak valid.").max(1000).nullable().optional(),
);

const RegistrationInput = z.object({
  kind: z.enum(["prestasi", "ekonomi"]),
  full_name: z.string().trim().min(2, "Nama lengkap wajib diisi.").max(200),
  birth_place: z.string().trim().min(1, "Tempat lahir wajib diisi.").max(120),
  birth_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir wajib diisi."),
  gender: z.string().trim().min(1, "Jenis kelamin wajib diisi.").max(50),
  address: z.string().trim().min(5, "Alamat wajib diisi minimal 5 karakter.").max(500),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[+\d\s-]{6,25}$/, "Nomor WhatsApp tidak valid."),
  email: z.string().trim().toLowerCase().email("Email tidak valid.").max(200),
  education_level: z.string().trim().min(1, "Jenjang pendidikan wajib diisi.").max(80),
  school_name: z.string().trim().min(1, "Nama sekolah/kampus wajib diisi.").max(200),
  grade: z.string().trim().min(1, "Kelas/semester wajib diisi.").max(80),
  main_achievement: z.preprocess(emptyToNull, z.string().max(1000).nullable().optional()),
  parent_income: z.preprocess(emptyToNull, z.string().max(120).nullable().optional()),
  dependents: z.preprocess((value) => {
    const normalized = emptyToNull(value);
    return normalized == null ? null : Number(normalized);
  }, z.number().int().min(0).max(50).nullable().optional()),
  photo_url: urlOrNull,
  student_card_url: urlOrNull,
  extra: z.record(z.string(), z.unknown()).optional().default({}),
});

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((input) => {
    const parsed = RegistrationInput.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Data pendaftaran belum lengkap.");
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    return insertRegistration(data);
  });
