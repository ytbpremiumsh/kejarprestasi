/** Stable, zero-height anchor for safe ad placement between page sections. */
export function AdSlot({ placement = "content", className = "" }: { placement?: string; className?: string }) {
  return <div data-ad-placement={placement} className={`ad-placement-anchor ${className}`} aria-hidden="true" />;
}
