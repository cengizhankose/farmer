export function protocolLogo(protocol: string): { letter: string; bg: string; fg: string } {
  const p = protocol.toLowerCase();
  // Lightweight color coding per protocol
  const map: Record<string, { bg: string; fg: string }> = {
    alex: { bg: "#0f172a", fg: "#fff" },
    arkadiko: { bg: "#0b3b2e", fg: "#a7f3d0" },
    aave: { bg: "#2f3b5c", fg: "#d8b4fe" },
    jupiter: { bg: "#0a1f2e", fg: "#7dd3fc" },
    zest: { bg: "#3b0764", fg: "#e9d5ff" },
  };
  const style = map[p] || { bg: "#111827", fg: "#e5e7eb" };
  return { letter: protocol[0]?.toUpperCase() || "?", bg: style.bg, fg: style.fg };
}
