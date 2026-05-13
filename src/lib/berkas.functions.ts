import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const DocumentInput = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(180),
  url: z.string().url().max(1000),
});

const SubmitBerkasInput = z.object({
  token: z.string().trim().toUpperCase().regex(/^KP-(PRE|EKO)-[A-Z0-9]{4,10}$/),
  kind: z.enum(["prestasi", "ekonomi"]),
  documents: z.array(DocumentInput).min(1).max(20),
});

export const submitBerkasDocuments = createServerFn({ method: "POST" })
  .inputValidator((input) => SubmitBerkasInput.parse(input))
  .handler(async ({ data }) => {
    const expectedPrefix = data.kind === "prestasi" ? "KP-PRE-" : "KP-EKO-";
    if (!data.token.startsWith(expectedPrefix)) {
      throw new Error("Kode pendaftar tidak sesuai kategori.");
    }

    const { data: registrant, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("id, email")
      .eq("token", data.token)
      .eq("kind", data.kind)
      .maybeSingle();

    if (regError) throw new Error(regError.message);
    if (!registrant?.email) throw new Error("Data pendaftar tidak ditemukan.");

    const submittedAt = new Date().toISOString();
    const rows = data.documents.map((doc) => ({
      email: registrant.email,
      kind: data.kind,
      doc_type: doc.label,
      file_url: doc.url,
      registration_id: registrant.id,
      created_at: submittedAt,
      review_status: "pending" as const,
      reviewed_at: null,
    }));

    const { error } = await supabaseAdmin
      .from("documents")
      .upsert(rows, { onConflict: "email_key,kind,doc_key" });

    if (error) throw new Error(error.message);
    return { count: rows.length };
  });