import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type CustomCode = { head?: string; body?: string };
type Performance = { lite_mode?: boolean; disable_ads?: boolean; disable_animations?: boolean };

const HEAD_MARK = "data-custom-head-injection";
const BODY_MARK = "data-custom-body-injection";

function injectHTML(target: HTMLElement, html: string, mark: string) {
  // remove previous
  target.querySelectorAll(`[${mark}]`).forEach((n) => n.remove());
  if (!html?.trim()) return;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  Array.from(tpl.content.childNodes).forEach((node) => {
    if (node.nodeType === 1) {
      const el = node as HTMLElement;
      // Re-create <script> tags so they actually execute when inserted
      if (el.tagName === "SCRIPT") {
        const s = document.createElement("script");
        for (const attr of Array.from(el.attributes)) s.setAttribute(attr.name, attr.value);
        s.text = el.textContent || "";
        s.setAttribute(mark, "1");
        target.appendChild(s);
      } else {
        el.setAttribute(mark, "1");
        target.appendChild(el);
      }
    } else if (node.nodeType === 3 && node.textContent?.trim()) {
      const span = document.createElement("span");
      span.style.display = "none";
      span.textContent = node.textContent;
      span.setAttribute(mark, "1");
      target.appendChild(span);
    }
  });
}

export function CustomCodeInjector() {
  useEffect(() => {
    let active = true;
    const apply = (cc: CustomCode | null, perf: Performance | null) => {
      if (!active) return;
      injectHTML(document.head, cc?.head || "", HEAD_MARK);
      injectHTML(document.body, cc?.body || "", BODY_MARK);
      // Performance / Lite mode
      const lite = !!(perf?.lite_mode || perf?.disable_animations);
      document.documentElement.classList.toggle("lite-mode", lite);
      if (perf?.disable_ads) {
        document.documentElement.setAttribute("data-disable-ads", "1");
      } else {
        document.documentElement.removeAttribute("data-disable-ads");
      }
    };

    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["custom_code", "performance"]);
      const cc = data?.find((d) => d.key === "custom_code")?.value as CustomCode | null;
      const perf = data?.find((d) => d.key === "performance")?.value as Performance | null;
      apply(cc, perf);
    })();

    // Realtime updates from admin
    const channel = supabase
      .channel("custom_code_perf")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        (payload) => {
          const row = (payload.new ?? payload.old) as { key: string; value: unknown } | null;
          if (!row) return;
          if (row.key === "custom_code") {
            injectHTML(document.head, ((row.value as CustomCode)?.head) || "", HEAD_MARK);
            injectHTML(document.body, ((row.value as CustomCode)?.body) || "", BODY_MARK);
          }
          if (row.key === "performance") {
            const perf = row.value as Performance;
            const lite = !!(perf?.lite_mode || perf?.disable_animations);
            document.documentElement.classList.toggle("lite-mode", lite);
            if (perf?.disable_ads) document.documentElement.setAttribute("data-disable-ads", "1");
            else document.documentElement.removeAttribute("data-disable-ads");
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
