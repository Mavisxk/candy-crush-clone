// ===== ART: hand-built SVG illustrations of Singapore hawker food =====
const ART = (() => {
  const svg = (body, defs = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${defs}</defs>${body}</svg>`;

  // Cute face used on every food piece
  const face = (cx, cy, s = 1) => `
    <ellipse cx="${cx - 7 * s}" cy="${cy}" rx="${3.1 * s}" ry="${3.9 * s}" fill="#2b1a12"/>
    <ellipse cx="${cx + 7 * s}" cy="${cy}" rx="${3.1 * s}" ry="${3.9 * s}" fill="#2b1a12"/>
    <circle cx="${cx - 6 * s}" cy="${cy - 1.5 * s}" r="${1.2 * s}" fill="#fff"/>
    <circle cx="${cx + 8 * s}" cy="${cy - 1.5 * s}" r="${1.2 * s}" fill="#fff"/>
    <path d="M${cx - 3.6 * s} ${cy + 4.6 * s} Q${cx} ${cy + 8.6 * s} ${cx + 3.6 * s} ${cy + 4.6 * s}" stroke="#2b1a12" stroke-width="${1.9 * s}" fill="none" stroke-linecap="round"/>
    <ellipse cx="${cx - 12 * s}" cy="${cy + 4.5 * s}" rx="${3.4 * s}" ry="${2.1 * s}" fill="#ff5c86" opacity=".5"/>
    <ellipse cx="${cx + 12 * s}" cy="${cy + 4.5 * s}" rx="${3.4 * s}" ry="${2.1 * s}" fill="#ff5c86" opacity=".5"/>`;

  const crab = svg(`
    <g stroke="#a3150f" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M24 62 L9 53"/><path d="M22 70 L6 72"/><path d="M27 78 L14 89"/>
      <path d="M76 62 L91 53"/><path d="M78 70 L94 72"/><path d="M73 78 L86 89"/>
      <path d="M35 52 Q25 44 25 33"/><path d="M65 52 Q75 44 75 33"/>
    </g>
    <g fill="url(#a)" stroke="#9c130d" stroke-width="2.2" stroke-linejoin="round">
      <path d="M25 37 C12 37 7 22 15 12 C17 19 21 22 27 21 C29 15 34 13 38 16 C37 28 33 37 25 37Z"/>
      <path d="M75 37 C88 37 93 22 85 12 C83 19 79 22 73 21 C71 15 66 13 62 16 C63 28 67 37 75 37Z"/>
      <ellipse cx="50" cy="65" rx="32" ry="24"/>
    </g>
    <ellipse cx="37" cy="53" rx="11" ry="4.5" fill="#fff" opacity=".4" transform="rotate(-18 37 53)"/>
    <circle cx="70" cy="76" r="2.4" fill="#ffc2a8" opacity=".8"/><circle cx="63" cy="82" r="1.8" fill="#ffc2a8" opacity=".8"/>
    <circle cx="30" cy="77" r="2" fill="#ffc2a8" opacity=".8"/>
    ${face(50, 64, 1.05)}`,
    `<radialGradient id="a" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#ff8a5c"/><stop offset=".55" stop-color="#e8392f"/><stop offset="1" stop-color="#a3150f"/></radialGradient>`);

  const satayChunk = (y) => `
    <rect x="28" y="${y}" width="44" height="25" rx="10" fill="url(#m)" stroke="#8f3a05" stroke-width="2.2"/>
    <path d="M36 ${y + 6} l5 12 M49 ${y + 5} l5 14 M61 ${y + 6} l4 10" stroke="#6e2a03" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>
    <rect x="32" y="${y + 3}" width="18" height="5" rx="2.5" fill="#fff" opacity=".35"/>`;
  const satay = svg(`
    <g transform="rotate(40 50 50)">
      <rect x="47" y="-2" width="6" height="104" rx="3" fill="#ecc994" stroke="#a88145" stroke-width="1.6"/>
      ${satayChunk(6)}${satayChunk(38)}${satayChunk(70)}
    </g>
    <rect x="34" y="42" width="32" height="18" rx="8" fill="#e8731b" opacity=".0"/>
    ${face(50, 51, .9)}`,
    `<linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb05a"/><stop offset=".6" stop-color="#ef7d1c"/><stop offset="1" stop-color="#c25409"/></linearGradient>`);

  const toast = svg(`
    <path d="M17 40 C9 22 26 9 40 15 C46 7 54 7 60 15 C74 9 91 22 83 40 L81 86 Q81 93 74 93 L26 93 Q19 93 19 86Z" fill="#c8741f" stroke="#8d4c0c" stroke-width="2.2"/>
    <path d="M24 42 C18 28 30 19 41 23 C46 16 54 16 59 23 C70 19 82 28 76 42 L75 83 Q75 87 71 87 L29 87 Q25 87 25 83Z" fill="url(#t)"/>
    <path d="M24 40 C22 31 31 25 41 28 C46 22 54 22 59 28 C69 25 79 31 76 40 Q70 47 63 42 Q56 49 49 43 Q41 50 35 43 Q29 48 24 40Z" fill="#8fc23a" stroke="#5f8a1d" stroke-width="1.6"/>
    <rect x="52" y="22" width="20" height="13" rx="3" fill="#fff6cf" stroke="#e2c46a" stroke-width="1.5" transform="rotate(-12 62 28)"/>
    <rect x="55" y="24" width="8" height="3" rx="1.5" fill="#fff" transform="rotate(-12 62 28)"/>
    ${face(50, 66, 1.05)}`,
    `<linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe58a"/><stop offset="1" stop-color="#f5bd2e"/></linearGradient>`);

  const flakes = (cx, cy, r) => {
    const pts = [[-.5, -.4, 20], [.2, -.6, -30], [.55, -.1, 60], [-.2, .1, 10], [.35, .45, -50], [-.6, .3, 80], [0, -.15, -70]];
    return pts.map(([x, y, a]) => `<rect x="${cx + x * r - 3}" y="${cy + y * r - 1}" width="6" height="2.2" rx="1.1" fill="#fffef5" transform="rotate(${a} ${cx + x * r} ${cy + y * r})"/>`).join('');
  };
  const ondeh = svg(`
    <circle cx="29" cy="40" r="18" fill="url(#o)" stroke="#2a7a26" stroke-width="2"/>${flakes(29, 40, 14)}
    <circle cx="71" cy="40" r="18" fill="url(#o)" stroke="#2a7a26" stroke-width="2"/>${flakes(71, 40, 14)}
    <path d="M44 86 Q50 96 56 86Z" fill="#7a3d12"/>
    <circle cx="50" cy="62" r="29" fill="url(#o)" stroke="#2a7a26" stroke-width="2.2"/>
    <ellipse cx="39" cy="48" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-25 39 48)"/>
    ${flakes(50, 60, 22)}
    ${face(50, 66, 1)}`,
    `<radialGradient id="o" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9be36a"/><stop offset=".6" stop-color="#43b649"/><stop offset="1" stop-color="#22812a"/></radialGradient>`);

  const teh = svg(`
    <g stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".9">
      <path d="M40 28 C34 21 46 17 40 8"/><path d="M58 28 C52 21 64 17 58 8"/>
    </g>
    <path d="M75 48 C93 48 93 76 71 75" stroke="#1d5fb5" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M21 36 L79 36 L72 86 Q71 93 63 93 L37 93 Q29 93 28 86Z" fill="url(#c)" stroke="#164a8f" stroke-width="2.2"/>
    <path d="M26 74 Q38 70 50 74 Q62 78 74 74" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>
    <ellipse cx="50" cy="36" rx="29" ry="8" fill="#eef6ff" stroke="#164a8f" stroke-width="2"/>
    <ellipse cx="50" cy="37" rx="24" ry="5.5" fill="#c98a4b"/>
    <ellipse cx="48" cy="36.5" rx="16" ry="3.4" fill="#f6e1c2"/>
    <rect x="29" y="44" width="7" height="22" rx="3.5" fill="#fff" opacity=".3"/>
    ${face(51, 56, .95)}`,
    `<linearGradient id="c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5cb0ff"/><stop offset=".55" stop-color="#2e86de"/><stop offset="1" stop-color="#1a5cae"/></linearGradient>`);

  let layers = '';
  for (let i = 0; i < 8; i++) layers += `<rect x="18" y="${24 + i * 8.5}" width="64" height="8.5" fill="${i % 2 ? '#f9d0f3' : '#b84fd8'}"/>`;
  const kueh = svg(`
    <path d="M24 24 L34 12 L88 12 L78 24Z" fill="#7d2a96" stroke="#5e1874" stroke-width="2" stroke-linejoin="round"/>
    <path d="M78 24 L88 12 L88 78 L78 90Z" fill="#8f33a8" stroke="#5e1874" stroke-width="2" stroke-linejoin="round"/>
    <g clip-path="url(#k)">${layers}</g>
    <rect x="18" y="24" width="60" height="66" rx="5" fill="none" stroke="#5e1874" stroke-width="2.4"/>
    <rect x="22" y="27" width="6" height="58" rx="3" fill="#fff" opacity=".25"/>
    <rect x="34" y="48" width="32" height="22" rx="9" fill="#f9d0f3" opacity=".75"/>
    ${face(48, 56, .95)}`,
    `<clipPath id="k"><rect x="18" y="24" width="60" height="66" rx="5"/></clipPath>`);

  // Colour bomb: ice kacang
  const stripesIK = ['#ff4d6d', '#ffd23f', '#3ccf6e', '#4dabff', '#ff8fd0', '#ff4d6d', '#ffd23f'];
  const iceKacang = svg(`
    <g clip-path="url(#mound)">${stripesIK.map((c, i) => `<rect x="${12 + i * 11}" y="0" width="11.5" height="70" fill="${c}"/>`).join('')}
      <circle cx="30" cy="42" r="3" fill="#fff" opacity=".7"/><circle cx="62" cy="30" r="2.5" fill="#fff" opacity=".7"/>
      <circle cx="46" cy="50" r="2.8" fill="#fff" opacity=".7"/><circle cx="70" cy="48" r="2.4" fill="#fff" opacity=".7"/>
      <circle cx="38" cy="28" r="2.2" fill="#fff" opacity=".7"/></g>
    <path d="M17 62 C17 34 35 17 50 17 C65 17 83 34 83 62Z" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/>
    <path d="M10 60 L90 60 Q87 87 62 92 L38 92 Q13 87 10 60Z" fill="#f7f9fc" stroke="#7c8ca3" stroke-width="2.2"/>
    <path d="M14 70 Q32 76 50 70 Q68 64 86 70" stroke="#2e86de" stroke-width="3" fill="none"/>
    <circle cx="30" cy="80" r="2.4" fill="#2e86de"/><circle cx="50" cy="83" r="2.4" fill="#2e86de"/><circle cx="70" cy="80" r="2.4" fill="#2e86de"/>
    <path d="M52 12 Q56 2 64 4" stroke="#3a7d1f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="15" r="8" fill="#e11d48" stroke="#8a0b28" stroke-width="1.8"/>
    <circle cx="47" cy="12" r="2.4" fill="#fff" opacity=".7"/>
    <path d="M86 18 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2z" fill="#fff59d"/>
    <path d="M12 30 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5z" fill="#fff59d"/>`,
    `<clipPath id="mound"><path d="M17 62 C17 34 35 17 50 17 C65 17 83 34 83 62Z"/></clipPath>`);

  const packet = (dx, dy, rot) => `
    <g transform="translate(${dx} ${dy}) rotate(${rot} 50 50)">
      <rect x="14" y="26" width="72" height="50" rx="9" fill="#fdfdfd" stroke="#b9c2cf" stroke-width="2.4"/>
      <rect x="14" y="26" width="72" height="12" rx="6" fill="#ffd6e4"/>
      <path d="M30 32 h40" stroke="#e8467c" stroke-width="2.5" stroke-dasharray="4 4"/>
      <circle cx="28" cy="58" r="7" fill="#ffb3cb"/><circle cx="28" cy="58" r="3" fill="#ffe066"/>
      <text x="59" y="63" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="12.5" text-anchor="middle" fill="#e8467c">CHOPE</text>
      <path d="M20 44 L36 40" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>
    </g>`;
  const tissue1 = svg(packet(0, 0, -6));
  const tissue2 = svg(packet(-4, -12, 8) + packet(2, 8, -6));

  const lock = svg(`
    <rect x="6" y="14" width="88" height="80" rx="16" fill="#ffffff" opacity=".38" stroke="#ffffff" stroke-width="3"/>
    <path d="M18 26 L28 60" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
    <path d="M78 70 L82 84" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <path d="M36 14 Q50 2 64 14" stroke="#e23b5a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M42 8 L34 -2 M58 8 L66 -2" stroke="#e23b5a" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="10" r="5" fill="#e23b5a"/>`);

  const stain = (o, col) => svg(`
    <path d="M50 12 C62 10 70 22 80 22 C92 24 90 40 86 48 C94 60 86 74 76 76 C72 90 56 92 48 84 C36 92 20 86 22 72 C8 66 10 50 18 44 C12 30 26 18 36 22 C40 14 46 12 50 12Z" fill="${col}" opacity="${o}"/>
    <circle cx="86" cy="86" r="5" fill="${col}" opacity="${o}"/><circle cx="12" cy="20" r="4" fill="${col}" opacity="${o}"/>`);
  const stain1 = stain(.42, '#e2622b');
  const stain2 = stain(.72, '#b8361a');

  const leaf = svg(`
    <path d="M50 3 Q92 8 97 50 Q92 92 50 97 Q8 92 3 50 Q8 8 50 3Z" fill="url(#l)" stroke="#1f5e1c" stroke-width="2.5"/>
    <path d="M14 86 L86 14" stroke="#cfe9a8" stroke-width="2.5" opacity=".8"/>
    <g stroke="#cfe9a8" stroke-width="1.6" opacity=".6"><path d="M30 70 L22 50"/><path d="M42 58 L32 34"/><path d="M56 44 L48 20"/><path d="M30 70 L52 76"/><path d="M42 58 L66 64"/><path d="M56 44 L80 50"/></g>`,
    `<linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ccf5b"/><stop offset="1" stop-color="#2f8a2a"/></linearGradient>`);

  // Booster & UI icons
  const cleaver = svg(`
    <path d="M18 22 L70 22 Q78 22 78 30 L78 56 Q78 62 72 62 L24 62 Q16 62 16 54 Z" fill="url(#s)" stroke="#4b5563" stroke-width="2.5"/>
    <circle cx="66" cy="32" r="4" fill="#cbd5e1" stroke="#4b5563" stroke-width="1.5"/>
    <path d="M22 54 L70 54" stroke="#fff" stroke-width="2.5" opacity=".7"/>
    <path d="M60 62 L64 90 Q65 95 70 94 L76 92 Q80 90 78 85 L72 62Z" fill="#7a4a24" stroke="#4a2a10" stroke-width="2"/>`,
    `<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>`);
  const wok = svg(`
    <path d="M8 46 Q50 98 92 46Z" fill="#374151" stroke="#111827" stroke-width="2.5"/>
    <path d="M18 52 Q50 82 82 52" stroke="#6b7280" stroke-width="3" fill="none"/>
    <path d="M90 47 L99 40" stroke="#7a4a24" stroke-width="7" stroke-linecap="round"/>
    <circle cx="34" cy="30" r="7" fill="#e8392f"/><circle cx="54" cy="20" r="6" fill="#43b649"/><circle cx="68" cy="32" r="6.5" fill="#f5c242"/>
    <path d="M26 16 q4 -6 8 0 M74 14 q4 -6 8 0" stroke="#f59e0b" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
  const chop = svg(`
    <path d="M22 92 L62 8" stroke="#b07a3d" stroke-width="7" stroke-linecap="round"/>
    <path d="M40 94 L74 10" stroke="#c98d4c" stroke-width="7" stroke-linecap="round"/>
    <path d="M54 26 L64 6 M66 28 L76 8" stroke="#e23b5a" stroke-width="7.5" stroke-linecap="butt"/>
`);
  const star = svg(`<path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36Z" fill="#ffd23f" stroke="#c98a00" stroke-width="4" stroke-linejoin="round"/>`);

  const all = { foods: [crab, satay, toast, ondeh, teh, kueh], iceKacang, tissue1, tissue2, lock, stain1, stain2, leaf, cleaver, wok, chop, star };
  const url = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  return { svgs: all, url };
})();
