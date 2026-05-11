import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";

export const Route = createFileRoute("/artikel/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Artikel — Kejar Prestasi` },
      { name: "description", content: `Baca artikel ${params.slug} di Kejar Prestasi.` },
    ],
  }),
  component: ArticleDetail,
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">Artikel tidak ditemukan</h1>
      <Link to="/artikel" className="mt-4 inline-block text-primary underline">Kembali ke Artikel</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">Terjadi kesalahan</h1>
      <p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
    </div>
  ),
});

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  cover_url: string | null;
  published_at: string;
  author: string | null;
};

function renderMarkdown(md: string) {
  // Minimal markdown: # ## ### headings, **bold**, lists, paragraphs.
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const flushList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^### /.test(line)) { flushList(); out.push(`<h3>${escape(line.slice(4))}</h3>`); continue; }
    if (/^## /.test(line))  { flushList(); out.push(`<h2>${escape(line.slice(3))}</h2>`); continue; }
    if (/^# /.test(line))   { flushList(); out.push(`<h1>${escape(line.slice(2))}</h1>`); continue; }
    if (/^[-*] /.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${escape(line.slice(2)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (!inList) { out.push("<ol>"); inList = true; }
      out.push(`<li>${escape(line.replace(/^\d+\.\s/, "")).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`);
      continue;
    }
    if (line.trim() === "") { flushList(); continue; }
    flushList();
    out.push(`<p>${escape(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
  }
  flushList();
  return out.join("\n");
}

function ArticleDetail() {
  const { slug } = Route.useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!data) setMissing(true);
      else setArticle(data as Article);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (missing || !article) {
    throw notFound();
  }

  return (
    <main className="container-page py-12">
      <Link to="/artikel" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Artikel
      </Link>
      <article className="mt-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">{article.category}</span>
          <span className="text-muted-foreground">
            {new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          {article.author && <span className="text-muted-foreground">• {article.author}</span>}
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground">{article.title}</h1>
        {article.excerpt && <p className="mt-3 text-lg text-muted-foreground">{article.excerpt}</p>}
        {article.cover_url && (
          <img src={article.cover_url} alt={article.title} className="mt-6 w-full rounded-2xl border border-border" />
        )}
        <AdSlot placement="in_article_top" />
        <div
          className="prose prose-slate dark:prose-invert mt-8 max-w-none text-foreground
            [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-3
            [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-2
            [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2
            [&>p]:my-3 [&>p]:leading-relaxed
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-3
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-3
            [&>ul>li]:my-1 [&>ol>li]:my-1"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />
        <AdSlot placement="in_article_middle" />
        <AdSlot placement="in_article_bottom" />
      </article>
    </main>
  );
}
