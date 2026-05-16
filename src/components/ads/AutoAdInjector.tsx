import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAdSettings, type AdPosition, type AdSlotConfig } from "./AdSettings";

const MARK_ATTR = "data-auto-ad-injected";
const SLOT_ATTR = "data-auto-ad-slot";

function buildAdNode(slot: AdSlotConfig): HTMLElement | null {
  const tpl = document.createElement("template");
  tpl.innerHTML = (slot.code || "").trim();
  if (!tpl.content.childNodes.length) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "my-6 flex justify-center w-full";
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
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(sel)).filter(
    (el) => !el.closest(`[${MARK_ATTR}]`),
  );
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
    try {
      ins.setAttribute("data-ad-pushed", "1");
      w.adsbygoogle.push({});
    } catch (e) {
      console.warn("[adsense] push failed", e);
    }
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

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20; // ~5s with 250ms interval

    const tryInject = () => {
      if (cancelled) return;
      attempts++;
      const root = document.querySelector("main") as HTMLElement | null;
      if (!root) {
        if (attempts < maxAttempts) window.setTimeout(tryInject, 250);
        return;
      }

      // Clear previous injections (route change / retry).
      root.querySelectorAll(`[${MARK_ATTR}]`).forEach((n) => n.remove());

      let total = 0;
      enabledSlots.forEach((s) => {
        total += injectSlot(root, s);
      });

      // If content hasn't rendered yet (no candidates matched), retry.
      if (total === 0 && attempts < maxAttempts) {
        window.setTimeout(tryInject, 250);
        return;
      }

      // Trigger AdSense rendering (defer slightly to allow layout).
      window.setTimeout(() => pushAds(root), 50);
    };

    const t = window.setTimeout(tryInject, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [pathname, loaded, adsense.enabled, slots]);

  return null;
}
