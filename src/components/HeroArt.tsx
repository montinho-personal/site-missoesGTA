// Ilustração original: pôr do sol tropical sobre uma orla art déco.
// SVG puro (≈3 KB), sem imagem raster: zero custo de LCP e nenhuma arte de terceiros.
export function HeroArt({ className }: { className?: string }) {
  const towers: [number, number, number, number][] = [
    // x, largura, altura, degraus
    [20, 70, 150, 2], [100, 46, 96, 1], [156, 84, 210, 3], [250, 52, 120, 1], [312, 96, 176, 2],
    [690, 60, 110, 1], [760, 90, 236, 3], [860, 54, 134, 2], [924, 80, 170, 2], [1014, 64, 104, 1], [1088, 92, 198, 3],
  ];
  const base = 372;
  return (
    <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ha-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0b19" /><stop offset=".45" stopColor="#2a1650" /><stop offset=".72" stopColor="#8a1f6b" /><stop offset=".9" stopColor="#ff6b5e" /><stop offset="1" stopColor="#ffb25e" />
        </linearGradient>
        <linearGradient id="ha-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd86b" /><stop offset=".55" stopColor="#ff7a59" /><stop offset="1" stopColor="#ff3d94" />
        </linearGradient>
        <linearGradient id="ha-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1458" /><stop offset="1" stopColor="#07060f" />
        </linearGradient>
        <clipPath id="ha-sunclip"><rect x="380" y="150" width="440" height="222" /></clipPath>
      </defs>
      <rect width="1200" height="372" fill="url(#ha-sky)" />
      <g clipPath="url(#ha-sunclip)">
        <circle cx="600" cy="330" r="170" fill="url(#ha-sun)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x="400" y={262 + i * 20 - i * i * 0.6} width="400" height={3 + i * 2.2} fill="#2a1650" opacity=".9" />
        ))}
      </g>
      <g fill="#0d0a1c">
        {towers.map(([x, w, h, steps], i) => (
          <g key={i}>
            <rect x={x} y={base - h} width={w} height={h} />
            {Array.from({ length: steps }).map((_, s) => (
              <rect key={s} x={x + (w * (s + 1)) / (steps * 2 + 2)} y={base - h - (s + 1) * 12} width={w - (w * (s + 1)) / (steps + 1)} height="13" />
            ))}
            <rect x={x + w / 2 - 1.5} y={base - h - steps * 12 - 22} width="3" height="24" />
          </g>
        ))}
      </g>
      <g fill="#ffcb66" opacity=".8">
        {towers.flatMap(([x, w, h], i) =>
          Array.from({ length: Math.floor(h / 26) }).flatMap((_, r) =>
            Array.from({ length: Math.floor(w / 18) }).map((_, c) =>
              (i * 7 + r * 3 + c * 5) % 4 === 0 ? <rect key={`${i}-${r}-${c}`} x={x + 8 + c * 18} y={base - h + 14 + r * 26} width="5" height="9" /> : null,
            ),
          ),
        )}
      </g>
      <g stroke="#ff4d9d" strokeWidth="3" opacity=".95"><path d="M156 268h84M760 214h90M1088 250h92" /></g>
      <g stroke="#5ce1f2" strokeWidth="3" opacity=".9"><path d="M312 252h96M924 262h80M20 280h70" /></g>
      <rect y="372" width="1200" height="148" fill="url(#ha-sea)" />
      <g stroke="#ff9257" strokeLinecap="round" opacity=".7">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} strokeWidth={2 + i * 0.4} d={`M${600 - (150 - i * 14)} ${384 + i * 16}h${(150 - i * 14) * 2}`} opacity={0.9 - i * 0.11} />
        ))}
      </g>
      <g fill="#07060f">
        <Palm x={905} y={404} s={0.8} flip />
        <Palm x={1130} y={420} s={1.25} flip />
        <Palm x={64} y={430} s={1.35} />
      </g>
    </svg>
  );
}

function Palm({ x, y, s, flip }: { x: number; y: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-4 0C-2-60 4-110 14-150l6 2C12-108 8-60 6 0Z" />
      {[-70, -38, -8, 22, 52, 84].map((a) => (
        <path key={a} transform={`translate(17 -150) rotate(${a})`} d="M0 0C22-16 52-18 84-2 54-6 26-2 0 6Z" />
      ))}
    </g>
  );
}
