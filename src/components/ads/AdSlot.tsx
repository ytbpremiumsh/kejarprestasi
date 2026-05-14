/**
 * Legacy component. Ad placement is now handled globally by AutoAdInjector,
 * which scans every page and inserts ad slots based on generic positions
 * (top of page, before/after each image, after each paragraph, etc.).
 *
 * This component is kept as a no-op for backwards compatibility with existing
 * imports — remove the imports gradually if desired.
 */
export function AdSlot(_props: { placement?: string; className?: string }) {
  return null;
}
