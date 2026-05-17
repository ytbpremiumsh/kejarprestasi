import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAdSettings, type AdPosition, type AdSlotConfig } from "./AdSettings";

const MARK_ATTR = "data-auto-ad-injected";
const SLOT_ATTR = "data-auto-ad-slot";

function extractPublisherId(html: string) {
  return html.match(/(?:client=|data-ad-client=["'])(ca-pub-[0-9]+)/)?.[1] || "";
}

function ensureAdSenseScript(publisherId: string, htmlSnippets: string[] = []) {
  if (typeof document === "undefined") return;
  const client = publisherId || htmlSnippets.map(extractPublisherId).find(Boolean) || "";
  if (!client) return;

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`,
  );
  if (existing) return;

  const script = document.createElement("script");
  script.id = "adsense-script";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.appendChild(script);
}

function prepareAdSenseIns(root: HTMLElement, fallbackClient: string) {
  root.querySelectorAll<HTMLElement>(`[${MARK_ATTR}] ins.adsbygoogle`).forEach((ins) => {
    if (fallbackClient && !ins.getAttribute("data-ad-client")) {
      ins.setAttribute("data-ad-client", fallbackClient);
    }
    ins.style.display = "block";
    ins.style.width = "100%";
    ins.style.maxWidth = "100%";
  });
}

function buildAdNode(slot: AdSlotConfig): HTMLElement | null {
  const tpl = document.createElement("template");
  tpl.innerHTML = (slot.code || "").trim();
  if (!tpl.content.childNodes.length) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "my-6 w-full overflow-hidden text-center";
  wrapper.style.width = "100%";
  wrapper.style.maxWidth = "100%";
  wrapper.setAttribute(MARK_ATTR, "1");
  wrapper.setAttribute(SLOT_ATTR, slot.id);
  wrapper.setAttribute("aria-label", "Iklan");

  // Copy only non-script nodes (typically <ins class="adsbygoogle">).
  // We'll trigger the push ourselves after AdSense is loaded — this avoids
  // the user's inline `push({})` only running once for a single ad on the page.
  tpl.content.childNodes.forEach((node) => {
    if (node.nodeType === 1 && (node as HTMLElement).tagName === "SCRIPT") return;
    wrapper.appendChild(node.cloneNode(true));
  });

  if (!wrapper.childNodes.length) return null;
  return wrapper;
}

function selectorFor(position: AdPosition): string | null {
  switch (position) {
    case "before_each_image":
    case "after_each_image":
      return "img";
    case "before_each_heading":
    case "after_each_heading":
      return "h1, h2, h3";
    case "after_each_paragraph":
      return "p";
    case "between_sections":
      return "section";
    case "before_timeline_button":
      // Buttons (Link rendered as <a>) inside the public Timeline section
      return "#timeline a[class*='rounded-full'], #timeline button";
    case "before_each_button":
      return "button, a[role='button'], a[class*='rounded-full']";
    case "before_each_nav_link":
    case "after_each_nav_link":
      // Any internal <a href="/..."> that leads to another page (excludes anchors, mail, tel, external)
      return "a[href]:not([href^='#']):not([href^='mailto']):not([href^='tel']):not([href^='http']):not([href^='javascript'])";
    case "before_each_card":
    case "after_each_card":
      // Card-like containers (rounded + bg-card or shadow-card)
      return "div.rounded-3xl.bg-card, div.rounded-2xl.bg-card, div[class*='shadow-card']";
    default:
      return null;
  }
}

function injectSlot(root: HTMLElement, slot: AdSlotConfig) {
  if (!slot.enabled || !slot.code?.trim()) return 0;
  const everyNth = Math.max(1, Number(slot.every_nth) || 1);
  const maxPer = Math.max(1, Number(slot.max_per_page) || 3);

  if (slot.position === "top_of_page") {
    const node = buildAdNode(slot);
    if (node) root.prepend(node);
    return node ? 1 : 0;
  }
  if (slot.position === "bottom_of_page") {
    const node = buildAdNode(slot);
    if (node) root.append(node);
    return node ? 1 : 0;
  }

  const sel = selectorFor(slot.position);
  if (!sel) return 0;
  const isCardPos = slot.position === "before_each_card" || slot.position === "after_each_card";
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(sel)).filter((el) => {
    if (el.closest(`[${MARK_ATTR}]`)) return false;
    if (isCardPos) {
      // Skip nested cards / cards inside forms or asides — injecting here
      // breaks form grids and creates messy spacing on mobile.
      if (el.closest("form, aside")) return false;
      // Skip cards-in-cards (nested mini cards inside another card)
      const parentCard = el.parentElement?.closest(
        "div.rounded-3xl.bg-card, div.rounded-2xl.bg-card, div[class*='shadow-card']",
      );
      if (parentCard && parentCard !== el) return false;
      // Skip when the card is a child of a grid/flex container — inserting
      // a sibling div there becomes a grid/flex item and corrupts layout.
      const parent = el.parentElement;
      if (parent) {
        const cs = window.getComputedStyle(parent);
        if (cs.display.includes("grid") || cs.display.includes("flex")) return false;
      }
    }
    return true;
  });
  let injected = 0;
  candidates.forEach((el, idx) => {
    if (injected >= maxPer) return;
    if ((idx + 1) % everyNth !== 0) return;
    const node = buildAdNode(slot);
    if (!node) return;
    if (slot.position.startsWith("before_")) el.parentNode?.insertBefore(node, el);
    else el.parentNode?.insertBefore(node, el.nextSibling);
    injected++;
  });
  return injected;
}

function pushAds(root: HTMLElement) {
  const insList = root.querySelectorAll<HTMLElement>(
    `[${MARK_ATTR}] ins.adsbygoogle:not([data-ad-pushed])`,
  );
  if (!insList.length) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.adsbygoogle = w.adsbygoogle || [];
  insList.forEach((ins) => {
    const tryPush = (attempt = 0) => {
      if (ins.getAttribute("data-ad-pushed") === "1") return;
      // Ensure wrapper has measurable width — common on mobile where layout
      // settles after route transition. Retry a few times before giving up.
      const w0 = ins.offsetWidth;
      if (w0 < 1) {
        if (attempt < 8) {
          window.setTimeout(() => tryPush(attempt + 1), 250);
        }
        return;
      }
      try {
        ins.setAttribute("data-ad-pushed", "1");
        w.adsbygoogle.push({});
      } catch (e) {
        ins.removeAttribute("data-ad-pushed");
        console.warn("[adsense] push failed", e);
      }
    };
    tryPush();
  });
}

export function AutoAdInjector() {
  const { adsense, slots, loaded } = useAdSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loaded) return;
    if (!adsense.enabled) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return;

    const enabledSlots = slots.filter((s) => s.enabled && s.code?.trim());
    if (!enabledSlots.length) return;
    ensureAdSenseScript(
      adsense.publisher_id,
      enabledSlots.map((s) => s.code),
    );

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40; // ~12s with 300ms interval
    const injectedPerSlot = new Map<string, number>();
    let observer: MutationObserver | null = null;
    let scheduled = false;

    const runInjection = () => {
      if (cancelled) return;
      const root = document.querySelector("main") as HTMLElement | null;
      if (!root) return;

      let injectedThisPass = 0;
      enabledSlots.forEach((s) => {
        const prev = injectedPerSlot.get(s.id) || 0;
        const cap = Math.max(1, Number(s.max_per_page) || 3);
        if (prev >= cap) return;

        // Only remove this slot's previous wrappers if they haven't been
        // pushed yet (no <ins> with data-ad-pushed / data-ad-status).
        // This preserves already-rendered ads while still allowing
        // re-injection for async-rendered targets.
        root
          .querySelectorAll<HTMLElement>(`[${SLOT_ATTR}="${s.id}"]`)
          .forEach((n) => {
            const hasLiveAd = n.querySelector(
              "ins.adsbygoogle[data-ad-pushed], ins.adsbygoogle[data-ad-status], ins.adsbygoogle iframe",
            );
            if (!hasLiveAd) n.remove();
          });

        const n = injectSlot(root, s);
        injectedPerSlot.set(s.id, prev + n);
        injectedThisPass += n;
      });

      if (injectedThisPass > 0) {
        prepareAdSenseIns(root, adsense.publisher_id);
        window.setTimeout(() => pushAds(root), 60);
        window.setTimeout(() => pushAds(root), 700);
      }
    };

    const scheduleRun = (delay = 0) => {
      if (cancelled || scheduled) return;
      scheduled = true;
      window.setTimeout(() => {
        scheduled = false;
        runInjection();
      }, delay);
    };

    const tryInject = () => {
      if (cancelled) return;
      attempts++;
      const root = document.querySelector("main") as HTMLElement | null;
      if (!root) {
        if (attempts < maxAttempts) window.setTimeout(tryInject, 300);
        return;
      }

      // First attempt: clear leftover unpushed wrappers from previous route.
      if (attempts === 1) {
        root.querySelectorAll<HTMLElement>(`[${MARK_ATTR}]`).forEach((n) => {
          const hasLiveAd = n.querySelector(
            "ins.adsbygoogle[data-ad-pushed], ins.adsbygoogle[data-ad-status], ins.adsbygoogle iframe",
          );
          if (!hasLiveAd) n.remove();
        });
        injectedPerSlot.clear();
      }

      runInjection();

      const anyMissing = enabledSlots.some(
        (s) => (injectedPerSlot.get(s.id) || 0) === 0,
      );
      if (anyMissing && attempts < maxAttempts) {
        window.setTimeout(tryInject, 300);
      }
    };

    const t = window.setTimeout(tryInject, 200);

    // Observe DOM mutations so newly-rendered targets get ads.
    // Ignore mutations inside ad wrappers (AdSense injects iframes which
    // would otherwise cause an infinite re-inject loop).
    const mainEl = document.querySelector("main");
    if (mainEl && typeof MutationObserver !== "undefined") {
      observer = new MutationObserver((mutations) => {
        const relevant = mutations.some((m) => {
          const tgt = m.target as HTMLElement | null;
          if (!tgt) return false;
          if (tgt.closest?.(`[${MARK_ATTR}]`)) return false;
          if (tgt.closest?.("ins.adsbygoogle")) return false;
          return true;
        });
        if (relevant) scheduleRun(250);
      });
      observer.observe(mainEl, { childList: true, subtree: true });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      observer?.disconnect();
    };
  }, [pathname, loaded, adsense.enabled, slots]);

  return null;
}
