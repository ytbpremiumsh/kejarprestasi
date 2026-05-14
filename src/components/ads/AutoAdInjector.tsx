import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAdSettings, type AdPosition, type AdSlotConfig } from "./AdSettings";

const MARK_ATTR = "data-auto-ad-injected";
const SLOT_ATTR = "data-auto-ad-slot";

function buildAdNode(slot: AdSlotConfig): HTMLElement | null {
  const wrapper = document.createElement("div");
  wrapper.className = "my-6 flex justify-center";
  wrapper.setAttribute(MARK_ATTR, "1");
  wrapper.setAttribute(SLOT_ATTR, slot.id);
  wrapper.setAttribute("aria-label", "Iklan");

  const tpl = document.createElement("template");
  tpl.innerHTML = (slot.code || "").trim();
  if (!tpl.content.childNodes.length) return null;

  // Re-create <script> tags so they execute after insertion.
  tpl.content.childNodes.forEach((node) => {
    if (node.nodeType === 1 && (node as HTMLElement).tagName === "SCRIPT") {
      const orig = node as HTMLScriptElement;
      const s = document.createElement("script");
      for (const a of Array.from(orig.attributes)) s.setAttribute(a.name, a.value);
      s.text = orig.textContent || "";
      wrapper.appendChild(s);
    } else {
      wrapper.appendChild(node.cloneNode(true));
    }
  });
  return wrapper;
}

function selectorFor(position: AdPosition): string | null {
  switch (position) {
    case "before_each_image":
    case "after_each_image":
      return "img";
    case "before_each_heading":
    case "after_each_heading":
      return "h2, h3";
    case "after_each_paragraph":
      return "p";
    case "between_sections":
      return "section";
    default:
      return null;
  }
}

function injectSlot(root: HTMLElement, slot: AdSlotConfig) {
  if (!slot.enabled || !slot.code?.trim()) return;
  const everyNth = Math.max(1, Number(slot.every_nth) || 1);
  const maxPer = Math.max(1, Number(slot.max_per_page) || 3);

  if (slot.position === "top_of_page") {
    const node = buildAdNode(slot);
    if (node) root.prepend(node);
    return;
  }
  if (slot.position === "bottom_of_page") {
    const node = buildAdNode(slot);
    if (node) root.append(node);
    return;
  }

  const sel = selectorFor(slot.position);
  if (!sel) return;
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
}

export function AutoAdInjector() {
  const { adsense, slots, loaded } = useAdSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loaded) return;
    if (!adsense.enabled) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return;

    // Wait for the page content to mount.
    const t = window.setTimeout(() => {
      const root = document.querySelector("main") as HTMLElement | null;
      if (!root) return;

      // Clear any previous injections (route change).
      root.querySelectorAll(`[${MARK_ATTR}]`).forEach((n) => n.remove());

      slots.filter((s) => s.enabled && s.code?.trim()).forEach((s) => injectSlot(root, s));
    }, 250);

    return () => window.clearTimeout(t);
  }, [pathname, loaded, adsense.enabled, slots]);

  return null;
}
