// Public lookup of registrant by email + kind. Returns minimal info for berkas form.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function maskWa(n: string): string {
  const digits = (n || "").replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return digits.slice(0, 3) + "•".repeat(Math.max(0, digits.length - 6)) + digits.slice(-3);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { email, kind } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (kind !== "prestasi" && kind !== "ekonomi") {
      return new Response(JSON.stringify({ ok: false, error: "invalid_kind" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase
      .from("registrations")
      .select("id, full_name, whatsapp, school_name, education_level, gender, birth_place, birth_date, address, grade")
      .ilike("email", email.trim())
      .eq("kind", kind)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return new Response(JSON.stringify({ ok: false, error: "not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({
      ok: true,
      data: {
        id: data.id,
        full_name: data.full_name,
        whatsapp: maskWa(data.whatsapp || ""),
        school_name: data.school_name,
        education_level: data.education_level,
        gender: data.gender,
        birth_place: data.birth_place,
        birth_date: data.birth_date,
        address: data.address,
        grade: data.grade,
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
