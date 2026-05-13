import type { Database } from "@/integrations/supabase/types";

export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

export function uniqueLatestDocuments<T extends Pick<DocumentRow, "doc_type" | "created_at">>(
  items: T[],
) {
  const seen = new Set<string>();
  return [...items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter((item) => {
      const key = item.doc_type.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
