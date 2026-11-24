'use strict';
// ===================== CONFIG =====================
const FOODS = ['Chilli Crab', 'Satay', 'Kaya Toast', 'Ondeh-Ondeh', 'Teh Tarik', 'Kueh Lapis'];
const FOOD_HEX = ['#e8392f', '#f08a24', '#f5c242', '#43b649', '#2e86de', '#b84fd8'];

// Map legend: . cell | x no cell | s stain | S double stain | b tissue | B double tissue | l tapao (locked) | k tapao on stain
const LEVELS = [
  { name: 'Maxwell', moves: 20, colors: 5, stars: [4000, 9000, 15000],
    goals: [{ type: 'score', n: 4000 }],
    tip: 'Swipe a food onto its neighbour to line up 3 or more of the same kind.' },
  { name: 'Lau Pa Sat', moves: 22, colors: 5, stars: [5000, 14000, 21000],
    goals: [{ type: 'collect', color: 0, n: 28 }, { type: 'collect', color: 2, n: 28 }],
    tip: 'Match 4 in a row for a striped piece that clears a whole line. 5 in a row makes an Ice Kacang!' },
  { name: 'Old Airport Road', moves: 24, colors: 5, stars: [6000, 19000, 28000],
    goals: [{ type: 'stain' }],
    map: ['.........', '.........', '..sssss..', '.sssssss.', '.sssssss.', '.sssssss.', '..sssss..', '.........', '.........'],
    tip: 'Sambal stains! Make matches on top of the stains to wipe the table clean.' },
  { name: 'Tiong Bahru', moves: 24, colors: 5, stars: [5000, 15000, 24000],
    goals: [{ type: 'tissue' }],
    map: ['.........', '.........', '.........', '.........', 'bbb...bbb', '.........', '..bbbbb..', '.........', '.........'],
    tip: 'Someone chope-d the seats! Match right next to tissue packets to clear them.' },
  { name: 'Chomp Chomp', moves: 24, colors: 5, stars: [5000, 14000, 21000],
    goals: [{ type: 'lock' }, { type: 'collect', color: 1, n: 30 }],
    map: ['xx.....xx', 'x.......x', '..l...l..', '...l.l...', '....l....', '...l.l...', '..l...l..', 'x.......x', 'xx.....xx'],
    tip: 'Tapao bags lock food in place. Include them in a match to set them free.' },
  { name: 'Newton', moves: 32, colors: 5, stars: [8000, 25000, 35000],
    goals: [{ type: 'stain' }, { type: 'tissue' }],
    map: ['.........', '.SS...SS.', '.SS...SS.', '...bbb...', '...bBb...', '...bbb...', '.SS...SS.', '.SS...SS.', '.........'],
    tip: 'Dark stains need two wipes. Combine special pieces for huge blasts!' },
  { name: 'Tekka', moves: 35, colors: 6, stars: [6000, 13000, 19000],
    goals: [{ type: 'collect', color: 4, n: 20 }, { type: 'collect', color: 5, n: 20 }, { type: 'stain' }],
    map: ['.........', '.........', '..k.k.k..', '.........', '.k.k.k.k.', '.........', '..k.k.k..', '.........', '.........'],
    tip: 'Six dishes on the menu now. Swap two specials together for a combo.' },
  { name: 'Amoy Street', moves: 32, colors: 5, stars: [8000, 22000, 30000],
    goals: [{ type: 'stain' }, { type: 'tissue' }, { type: 'lock' }],
    map: ['x.......x', '.ss...ss.', '.sSbBbSs.', '..SkkkS..', '..SkkkS..', '..SkkkS..', '.sSbbbSs.', '.ss...ss.', 'x.......x'],
    tip: 'The lunch rush finale. Everything at once. Good luck!' },
];

// ===================== SAVE =====================
const SAVE_KEY = 'hawkerCrush.v1';
const save = { unlocked: 1, stars: {}, best: {}, boosters: { cleaver: 3, wok: 3, chop: 3 }, sfx: true, music: true };
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && typeof s === 'object') { Object.assign(save, s); save.boosters = Object.assign({ cleaver: 3, wok: 3, chop: 3 }, s.boosters || {}); } } catch (e) { }
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { } }

// ===================== AUDIO =====================
const Snd = (() => {
  let ctx = null, sfxG = null, musG = null, noiseBuf = null, musicTimer = null, step = 0, nextT = 0;
  const init = () => {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => { }); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
      sfxG = ctx.createGain(); sfxG.gain.value = save.sfx ? .9 : 0; sfxG.connect(comp);
      musG = ctx.createGain(); musG.gain.value = save.music ? .22 : 0; musG.connect(comp);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
  };
  const tone = (f, d, o = {}) => {
    if (!ctx) return;
    const { type = 'sine', vol = .25, when = 0, slide = 0, dest = sfxG, attack = .006 } = o;
    const t = ctx.currentTime + when, osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(f, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(g); g.connect(dest); osc.start(t); osc.stop(t + d + .05);
  };
  const noise = (d, o = {}) => {
    if (!ctx) return;
    const { vol = .2, when = 0, f0 = 3000, f1 = 300, type = 'bandpass', q = 1.2 } = o;
    const t = ctx.currentTime + when, src = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(fl); fl.connect(g); g.connect(sfxG); src.start(t); src.stop(t + d + .05);
  };
  const PENT = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26];
  const nf = (semi, base = 523.25) => base * Math.pow(2, semi / 12);
  const fx = {
    click: () => tone(880, .06, { type: 'triangle', vol: .12 }),
    swap: () => tone(500, .09, { type: 'triangle', vol: .14, slide: 760 }),
    bad: () => { tone(240, .12, { type: 'square', vol: .06, slide: 170 }); tone(200, .14, { type: 'square', vol: .06, slide: 140, when: .1 }); },
    pop: (n) => { const f = nf(PENT[Math.min(n, PENT.length - 1)]); tone(f, .16, { vol: .22 }); tone(f * 2, .08, { type: 'triangle', vol: .07 }); },
    special: () => [0, 4, 7, 12].forEach((s, i) => tone(nf(s + 12), .14, { type: 'triangle', vol: .12, when: i * .05 })),
    stripe: () => { noise(.35, { f0: 5000, f1: 500, vol: .25 }); tone(1100, .3, { type: 'sawtooth', vol: .05, slide: 300 }); },
    wrap: () => { tone(120, .45, { vol: .5, slide: 40 }); noise(.4, { type: 'lowpass', f0: 1200, f1: 80, vol: .45, q: .7 }); },
    bomb: () => { [0, 2, 4, 7, 9, 12, 16, 19].forEach((s, i) => tone(nf(s), .2, { type: 'triangle', vol: .12, when: i * .04 })); noise(.6, { f0: 8000, f1: 1500, vol: .18, when: .25 }); },
    tissue: () => noise(.12, { type: 'highpass', f0: 3000, f1: 6000, vol: .3 }),
    unlock: () => { tone(1200, .08, { type: 'triangle', vol: .12 }); tone(1600, .1, { type: 'triangle', vol: .1, when: .05 }); },
    stain: () => noise(.15, { f0: 1500, f1: 600, vol: .18 }),
    win: () => [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => tone(nf(s), .3, { type: 'triangle', vol: .18, when: i * .12 })),
    lose: () => [7, 4, 2, 0].forEach((s, i) => tone(nf(s - 12), .35, { type: 'triangle', vol: .16, when: i * .2 })),
    tick: () => tone(1400, .05, { type: 'square', vol: .05 }),
  };
  // Background music: gentle pentatonic loop (D major), 8 bars of eighth notes
  const MEL = [12, null, 9, 7, 9, null, 4, null, 7, 9, 12, null, 14, null, 12, null,
    16, null, 14, 12, 9, null, 7, null, 9, 7, 4, 2, 4, null, null, null,
    12, null, 14, 16, 19, null, 16, null, 14, 12, 14, null, 9, null, 7, null,
    9, null, 12, 9, 7, null, 4, 7, 2, null, 4, null, 0, null, null, null];
  const BASS = [-12, -15, -19, -17, -12, -15, -19, -17];
  const schedule = () => {
    if (!ctx) return;
    while (nextT < ctx.currentTime + .3) {
      const dt = nextT - ctx.currentTime;
      const m = MEL[step % MEL.length];
      if (m !== null) { tone(nf(m, 293.66), .35, { type: 'triangle', vol: .32, when: dt, dest: musG }); tone(nf(m + 12, 293.66), .12, { vol: .06, when: dt, dest: musG }); }
      if (step % 4 === 0) tone(nf(BASS[Math.floor(step / 8) % 8], 293.66), .5, { vol: .4, when: dt, dest: musG });
      if (step % 2 === 1) noise(.04, { type: 'highpass', f0: 7000, f1: 8000, vol: .03, when: dt });
      step++; nextT += 60 / 104 / 2;
    }
  };
  return {
    init, play: (n, a) => { if (ctx && save.sfx && fx[n]) fx[n](a); },
    startMusic() { if (!ctx || musicTimer) return; nextT = ctx.currentTime + .1; musicTimer = setInterval(schedule, 90); },
    stopMusic() { clearInterval(musicTimer); musicTimer = null; },
    setSfx(on) { if (sfxG) sfxG.gain.value = on ? .9 : 0; },
    setMusic(on) { if (musG) musG.gain.value = on ? .22 : 0; },
    suspend() { if (ctx) ctx.suspend().catch(() => { }); }, resume() { if (ctx) ctx.resume().catch(() => { }); },
  };
})();

// ===================== TWEENS =====================
const FAST = { on: false };
const tweens = [];
const ease = {
  linear: t => t, outQuad: t => 1 - (1 - t) * (1 - t), inOut: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  outBack: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  fall: t => t < .8 ? Math.pow(t / .8, 2) : 1 - Math.sin((t - .8) / .2 * Math.PI) * .07,
};
function tween(o, to, dur, e = ease.outQuad, delay = 0) {
  if (FAST.on || dur <= 0) { Object.assign(o, to); return Promise.resolve(); }
  return new Promise(res => tweens.push({ o, to, dur, e, t: -delay, from: null, res }));
}
function wait(ms) { if (FAST.on) return Promise.resolve(); return new Promise(res => tweens.push({ o: null, dur: ms, t: 0, res })); }
function updateTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i]; tw.t += dt; if (tw.t < 0) continue;
    const p = Math.min(1, tw.t / tw.dur);
    if (tw.o) {
      if (!tw.from) { tw.from = {}; for (const k in tw.to) tw.from[k] = tw.o[k]; }
      const v = tw.e(p); for (const k in tw.to) tw.o[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * v;
    }
    if (p >= 1) { tweens.splice(i, 1); tw.res(); }
  }
}

// ===================== STATE =====================
const rand = n => Math.floor(Math.random() * n);
const K = (r, c) => r * 16 + c, KR = k => k >> 4, KC = k => k & 15;
let pid = 1;
const newPiece = (color, special = null) => ({ id: pid++, color, special, lock: 0, x: 0, y: 0, scale: 1, alpha: 1, armed: false });

const G = {
  li: 0, L: null, rows: 9, cols: 9, cells: [], grid: [], moves: 0, score: 0, collected: [0, 0, 0, 0, 0, 0],
  busy: false, over: true, selected: null, booster: null, lastSwap: null, cascade: 0, ncolors: 5, dying: [],
};
const inB = (r, c) => r >= 0 && c >= 0 && r < G.rows && c < G.cols;
const isCell = (r, c) => inB(r, c) && G.cells[r][c].valid;
const swappable = (r, c) => isCell(r, c) && !G.cells[r][c].blocker && G.grid[r][c] && !G.grid[r][c].lock;
const colorAt = (r, c) => { if (!isCell(r, c) || G.cells[r][c].blocker) return -1; const p = G.grid[r][c]; return p && p.color >= 0 && p.special !== 'b' ? p.color : -1; };
const forEachPiece = fn => { for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) if (G.grid[r][c]) fn(G.grid[r][c], r, c); };
const randColor = () => rand(G.ncolors);

function setupLevel(li) {
  const L = LEVELS[li];
  G.li = li; G.L = L; G.rows = 9; G.cols = 9; G.ncolors = L.colors;
  G.moves = L.moves; G.score = 0; G.collected = [0, 0, 0, 0, 0, 0]; G.selected = null; G.booster = null;
  G.busy = false; G.over = false; G.cascade = 0; G.dying = []; FX.list.length = 0; FX.parts.length = 0; FX.texts.length = 0;
  G.cells = []; G.grid = [];
  for (let r = 0; r < G.rows; r++) {
    G.cells.push([]); G.grid.push([]);
    for (let c = 0; c < G.cols; c++) {
      const ch = L.map ? L.map[r][c] : '.';
      G.cells[r].push({ valid: ch !== 'x', stain: ch === 's' || ch === 'k' ? 1 : ch === 'S' ? 2 : 0, blocker: ch === 'b' ? 1 : ch === 'B' ? 2 : 0, lockInit: ch === 'l' || ch === 'k' });
      G.grid[r].push(null);
    }
  }
  fillFresh();
}

function fillFresh() {
  for (let tries = 0; tries < 200; tries++) {
    for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) {
      G.grid[r][c] = null;
      const cell = G.cells[r][c];
      if (!cell.valid || cell.blocker) continue;
      const bad = new Set();
      if (colorAt(r, c - 1) >= 0 && colorAt(r, c - 1) === colorAt(r, c - 2)) bad.add(colorAt(r, c - 1));
      if (colorAt(r - 1, c) >= 0 && colorAt(r - 1, c) === colorAt(r - 2, c)) bad.add(colorAt(r - 1, c));
      let col; do { col = randColor(); } while (bad.has(col));
      const p = newPiece(col); p.x = c; p.y = r; if (cell.lockInit) p.lock = 1;
      G.grid[r][c] = p;
    }
    if (findAllMoves().length >= 3) return;
  }
}

// ===================== MATCHING =====================
function findMatches() {
  const runs = [];
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols;) {
    const col = colorAt(r, c); if (col < 0) { c++; continue; }
    let e = c; while (colorAt(r, e + 1) === col) e++;
    if (e - c >= 2) { const cells = []; for (let i = c; i <= e; i++) cells.push(K(r, i)); runs.push({ dir: 'h', cells, color: col }); }
    c = e + 1;
  }
  for (let c = 0; c < G.cols; c++) for (let r = 0; r < G.rows;) {
    const col = colorAt(r, c); if (col < 0) { r++; continue; }
    let e = r; while (colorAt(e + 1, c) === col) e++;
    if (e - r >= 2) { const cells = []; for (let i = r; i <= e; i++) cells.push(K(i, c)); runs.push({ dir: 'v', cells, color: col }); }
    r = e + 1;
  }
  // union runs sharing cells
  const parent = runs.map((_, i) => i), find = i => parent[i] === i ? i : (parent[i] = find(parent[i]));
  const owner = new Map();
  runs.forEach((run, i) => run.cells.forEach(k => { if (owner.has(k)) parent[find(i)] = find(owner.get(k)); else owner.set(k, i); }));
  const groups = new Map();
  runs.forEach((run, i) => { const root = find(i); if (!groups.has(root)) groups.set(root, { runs: [], cells: new Set(), color: run.color }); const g = groups.get(root); g.runs.push(run); run.cells.forEach(k => g.cells.add(k)); });
  const out = [];
  for (const g of groups.values()) {
    const maxLen = Math.max(...g.runs.map(r => r.cells.length));
    const hasH = g.runs.some(r => r.dir === 'h'), hasV = g.runs.some(r => r.dir === 'v');
    if (maxLen >= 5) g.special = 'b';
    else if (hasH && hasV) g.special = 'w';
    else if (maxLen === 4) g.special = g.runs[0].dir === 'h' ? 'v' : 'h';
    else g.special = null;
    out.push(g);
  }
  return out;
}

function chooseSpecialCell(g) {
  const ok = k => { const p = G.grid[KR(k)][KC(k)]; return p && !p.lock; };
  if (G.lastSwap) for (const [r, c] of G.lastSwap) { const k = K(r, c); if (g.cells.has(k) && ok(k)) return k; }
  if (g.special === 'w') {
    const h = new Set(), v = new Set();
    g.runs.forEach(run => run.cells.forEach(k => (run.dir === 'h' ? h : v).add(k)));
    for (const k of h) if (v.has(k) && ok(k)) return k;
  }
  const longest = g.runs.slice().sort((a, b) => b.cells.length - a.cells.length)[0].cells;
  const mid = longest[Math.floor((longest.length - 1) / 2)];
  if (ok(mid)) return mid;
  for (const k of g.cells) if (ok(k)) return k;
  return null;
}

function matchValueAt(r, c) {
  const col = colorAt(r, c); if (col < 0) return 0;
  let a = c, b = c; while (colorAt(r, a - 1) === col) a--; while (colorAt(r, b + 1) === col) b++;
  let u = r, d = r; while (colorAt(u - 1, c) === col) u--; while (colorAt(d + 1, c) === col) d++;
  const h = b - a + 1, v = d - u + 1; let val = 0;
  if (h >= 3) val += h; if (v >= 3) val += v;
  if (h >= 3 && v >= 3) val += 6;
  if (h >= 5 || v >= 5) val += 12; else if (h === 4 || v === 4) val += 4;
  const p = G.grid[r][c]; if (val && p && p.special) val += 5;
  return val;
}

function findAllMoves() {
  const moves = [];
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
    const r2 = r + dr, c2 = c + dc;
    if (!swappable(r, c) || !swappable(r2, c2)) continue;
    const a = G.grid[r][c], b = G.grid[r2][c2]; let val = 0;
    if (a.special === 'b' || b.special === 'b') val = 20 + (a.special && b.special ? 25 : 0);
    else if (a.special && b.special) val = 18;
    else { G.grid[r][c] = b; G.grid[r2][c2] = a; val = matchValueAt(r, c) + matchValueAt(r2, c2); G.grid[r][c] = a; G.grid[r2][c2] = b; }
    if (val > 0) moves.push({ r, c, r2, c2, val });
  }
  return moves;
}

// ===================== HITS / CLEARING =====================
function specialCells(p, r, c) {
  const out = [];
  if (p.special === 'h') for (let i = 0; i < G.cols; i++) { if (i !== c) out.push([r, i]); }
  else if (p.special === 'v') for (let i = 0; i < G.rows; i++) { if (i !== r) out.push([i, c]); }
  else if (p.special === 'w') for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (dr || dc) out.push([r + dr, c + dc]); }
  return out;
}
function mostCommonColor() {
  const n = [0, 0, 0, 0, 0, 0]; forEachPiece(p => { if (p.color >= 0 && p.special !== 'b') n[p.color]++; });
  let best = 0; for (let i = 1; i < 6; i++) if (n[i] > n[best]) best = i; return best;
}
function cellsOfColor(col) { const out = []; forEachPiece((p, r, c) => { if (p.color === col && p.special !== 'b') out.push([r, c]); }); return out; }

async function applyHits(initial, preFired = new Set(), forceClear = []) {
  const cleared = new Map(), unlocked = new Set(), stainHit = new Set(), blockerHit = new Set(), kept = new Set();
  const fired = new Set(preFired), queue = initial.slice();
  const fxs = new Set();
  for (const [r, c] of forceClear) { const p = G.grid[r][c]; if (p) { cleared.set(K(r, c), p); stainHit.add(K(r, c)); } }
  while (queue.length) {
    const [r, c, kind] = queue.shift();
    if (!isCell(r, c)) continue;
    const k = K(r, c), cell = G.cells[r][c];
    if (cell.blocker > 0) { if (kind !== 'match') blockerHit.add(k); continue; }
    const p = G.grid[r][c]; if (!p) continue;
    stainHit.add(k);
    if (kind === 'match') for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (isCell(r + dr, c + dc) && G.cells[r + dr][c + dc].blocker) blockerHit.add(K(r + dr, c + dc));
    if (p.lock) { unlocked.add(k); continue; }
    if (cleared.has(k) || kept.has(k)) continue;
    if (p.special && !fired.has(p.id)) {
      fired.add(p.id);
      if (p.special === 'b') {
        const col = mostCommonColor(), targets = cellsOfColor(col);
        FX.bolts(r, c, targets, FOOD_HEX[col]); fxs.add('bomb');
        targets.forEach(([rr, cc]) => queue.push([rr, cc, 'blast']));
      } else {
        specialCells(p, r, c).forEach(([rr, cc]) => queue.push([rr, cc, 'blast']));
        if (p.special === 'w') { FX.ring(r, c, 1.6, FOOD_HEX[p.color]); fxs.add('wrap'); if (!p.armed) { p.armed = true; kept.add(k); continue; } }
        else { FX.beam(r, c, p.special, FOOD_HEX[p.color]); fxs.add('stripe'); }
      }
    }
    cleared.set(k, p);
  }
  fxs.forEach(n => Snd.play(n));
  const mult = 1 + Math.max(0, G.cascade - 1) * .5;
  let pts = 0, cx = 0, cy = 0, n = 0;
  for (const [k, p] of cleared) {
    const r = KR(k), c = KC(k);
    pts += (p.special ? 60 : 30) * mult; if (p.color >= 0 && p.special !== 'b') G.collected[p.color]++;
    cx += c; cy += r; n++;
    G.grid[r][c] = null; G.dying.push(p);
    FX.burst(c + .5, r + .5, p.special === 'b' ? '#ffffff' : FOOD_HEX[p.color], 6);
    tween(p, { scale: 1.25 }, 70).then(() => tween(p, { scale: 0, alpha: 0 }, 150, ease.inOut)).then(() => { const i = G.dying.indexOf(p); if (i >= 0) G.dying.splice(i, 1); });
  }
  for (const k of unlocked) { const p = G.grid[KR(k)][KC(k)]; if (p) { p.lock = 0; pts += 20; FX.burst(KC(k) + .5, KR(k) + .5, '#ffffff', 8); } }
  if (unlocked.size) Snd.play('unlock');
  let st = 0;
  for (const k of stainHit) { const cell = G.cells[KR(k)][KC(k)]; if (cell.stain > 0) { cell.stain--; pts += 50; st++; FX.burst(KC(k) + .5, KR(k) + .5, '#e2622b', 4); } }
  if (st) Snd.play('stain');
  for (const k of blockerHit) { const cell = G.cells[KR(k)][KC(k)]; if (cell.blocker > 0) { cell.blocker--; pts += 40; FX.burst(KC(k) + .5, KR(k) + .5, '#ffd6e4', 10); } }
  if (blockerHit.size) Snd.play('tissue');
  if (n) { Snd.play('pop', G.cascade); }
  pts = Math.round(pts / 10) * 10;
  if (pts) { G.score += pts; if (n) FX.text((cx / n) + .5, (cy / n) + .5, '+' + pts, '#fff'); }
  UI.hud();
  await wait(n ? 230 : 120);
  return n;
}

// ===================== GRAVITY =====================
async function gravity() {
  const spawnCount = new Array(G.cols).fill(0), moved = new Set();
  const empty = (r, c) => isCell(r, c) && !G.cells[r][c].blocker && !G.grid[r][c];
  const movable = (r, c) => isCell(r, c) && !G.cells[r][c].blocker && G.grid[r][c] && !G.grid[r][c].lock;
  for (let guard = 0; guard < 400; guard++) {
    let changed = false;
    for (let c = 0; c < G.cols; c++) for (let r = G.rows - 1; r >= 0; r--) {
      if (!empty(r, c)) continue;
      let src = r - 1; while (isCell(src, c) && (G.cells[src][c].blocker || (G.grid[src][c] && G.grid[src][c].lock))) src--; // food slides behind tissue packets and tapao bags
      if (movable(src, c)) { G.grid[r][c] = G.grid[src][c]; G.grid[src][c] = null; moved.add(G.grid[r][c]); changed = true; }
      else if (src < 0 || !G.cells[src][c].valid) { const p = newPiece(randColor()); p.x = c; p.y = r - 1 - spawnCount[c]; spawnCount[c]++; G.grid[r][c] = p; moved.add(p); changed = true; }
    }
    if (changed) continue;
    outer: for (let r = G.rows - 1; r >= 0; r--) for (let c = 0; c < G.cols; c++) {
      if (!empty(r, c)) continue;
      for (const dc of [-1, 1]) if (movable(r - 1, c + dc)) {
        G.grid[r][c] = G.grid[r - 1][c + dc]; G.grid[r - 1][c + dc] = null; moved.add(G.grid[r][c]); changed = true; break outer;
      }
    }
    if (!changed) break;
  }
  const ps = [];
  forEachPiece((p, r, c) => {
    if (!moved.has(p)) return;
    const d = Math.hypot(c - p.x, r - p.y);
    ps.push(tween(p, { x: c, y: r }, 110 + 75 * Math.sqrt(d), ease.fall));
  });
  if (ps.length) { await Promise.all(ps); }
}

// ===================== TURN FLOW =====================
async function resolveBoard() {
  for (let guard = 0; guard < 80; guard++) {
    const armed = []; forEachPiece((p, r, c) => { if (p.armed && p.special === 'w') armed.push([r, c, 'blast']); });
    if (armed.length) { await applyHits(armed); await gravity(); continue; }
    const groups = findMatches();
    if (!groups.length) break;
    G.cascade++;
    if (G.cascade === 3) UI.praise('Shiok!'); else if (G.cascade === 5) UI.praise('Power lah!'); else if (G.cascade === 7) UI.praise('Steady bom pi pi!');
    const hits = [], specials = [];
    for (const g of groups) {
      g.cells.forEach(k => hits.push([KR(k), KC(k), 'match']));
      if (g.special) { const k = chooseSpecialCell(g); if (k !== null) specials.push({ k, color: g.color, special: g.special }); }
    }
    await applyHits(hits);
    let made = false;
    for (const s of specials) {
      const r = KR(s.k), c = KC(s.k);
      if (G.grid[r][c] || G.cells[r][c].blocker) continue;
      const p = newPiece(s.special === 'b' ? -1 : s.color, s.special); p.x = c; p.y = r; p.scale = 0;
      G.grid[r][c] = p; made = true; tween(p, { scale: 1 }, 260, ease.outBack);
      G.score += s.special === 'b' ? 300 : s.special === 'w' ? 200 : 120;
    }
    if (made) { Snd.play('special'); await wait(200); }
    G.lastSwap = null;
    await gravity();
  }
  G.lastSwap = null;
}

async function runCombo(a, ra, ca, b, rb, cb) {
  const A = a.special, B = b.special, hits = [], fired = new Set([a.id, b.id]);
  let force = [[ra, ca], [rb, cb]];
  const all = () => { for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) hits.push([r, c, 'blast']); };
  if (A === 'b' && B === 'b') {
    FX.flash(); Snd.play('bomb'); all();
  } else if (A === 'b' || B === 'b') {
    const other = A === 'b' ? b : a, col = other.color;
    const [br, bc] = A === 'b' ? [ra, ca] : [rb, cb];
    const targets = cellsOfColor(col);
    FX.bolts(br, bc, targets, FOOD_HEX[col]); Snd.play('bomb');
    if (other.special) {
      fired.delete(other.id); force = [[br, bc]];
      for (const [r, c] of targets) { const p = G.grid[r][c]; if (p.special !== 'b') { p.special = other.special === 'w' ? 'w' : (Math.random() < .5 ? 'h' : 'v'); p.scale = 1.3; tween(p, { scale: 1 }, 250, ease.outBack); } }
      Snd.play('special'); await wait(450);
    } else await wait(300);
    targets.forEach(([r, c]) => hits.push([r, c, 'blast']));
  } else {
    const s = new Set([A, B]);
    const color = FOOD_HEX[a.color];
    if (s.has('w') && (s.has('h') || s.has('v'))) {
      for (let d = -1; d <= 1; d++) {
        for (let i = 0; i < G.cols; i++) hits.push([ra + d, i, 'blast']);
        for (let i = 0; i < G.rows; i++) hits.push([i, ca + d, 'blast']);
        if (isCell(ra + d, ca) || inB(ra + d, 0)) FX.beam(ra + d, ca, 'h', color, 1.6);
        FX.beam(ra, ca + d, 'v', color, 1.6);
      }
      Snd.play('stripe'); Snd.play('wrap');
    } else if (A === 'w' && B === 'w') {
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) hits.push([ra + dr, ca + dc, 'blast']);
      FX.ring(ra, ca, 2.8, color); Snd.play('wrap');
    } else {
      for (let i = 0; i < G.cols; i++) hits.push([ra, i, 'blast']);
      for (let i = 0; i < G.rows; i++) hits.push([i, ca, 'blast']);
      FX.beam(ra, ca, 'h', color); FX.beam(ra, ca, 'v', color); Snd.play('stripe');
    }
  }
  G.cascade = 1;
  await applyHits(hits, fired, force);
  await gravity();
}

async function trySwap(r1, c1, r2, c2) {
  if (G.busy || G.over) return;
  if (!inB(r2, c2) || Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
  if (!swappable(r1, c1) || !swappable(r2, c2)) {
    const p = isCell(r1, c1) && G.grid[r1][c1];
    if (p) { Snd.play('bad'); shake(p); }
    return;
  }
  G.busy = true; G.selected = null;
  const a = G.grid[r1][c1], b = G.grid[r2][c2];
  Snd.play('swap');
  G.grid[r1][c1] = b; G.grid[r2][c2] = a;
  await Promise.all([tween(a, { x: c2, y: r2 }, 170, ease.inOut), tween(b, { x: c1, y: r1 }, 170, ease.inOut)]);
  const free = G.booster === 'chop';
  const combo = a.special === 'b' || b.special === 'b' || (a.special && b.special);
  if (!combo && !findMatches().length && !free) {
    Snd.play('bad');
    G.grid[r1][c1] = a; G.grid[r2][c2] = b;
    await Promise.all([tween(a, { x: c1, y: r1 }, 170, ease.inOut), tween(b, { x: c2, y: r2 }, 170, ease.inOut)]);
    G.busy = false; return;
  }
  if (free) { useBooster('chop'); } else G.moves--;
  UI.hud();
  G.lastSwap = [[r2, c2], [r1, c1]];
  G.cascade = 0;
  if (combo) await runCombo(a, r2, c2, b, r1, c1);
  await resolveBoard();
  await endTurn();
}

function shake(p) {
  const x = p.x; tween(p, { x: x + .12 }, 50).then(() => tween(p, { x: x - .12 }, 80)).then(() => tween(p, { x }, 50));
}

function goalLeft(g) {
  if (g.type === 'score') return Math.max(0, g.n - G.score);
  if (g.type === 'collect') return Math.max(0, g.n - G.collected[g.color]);
  let n = 0;
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) {
    const cell = G.cells[r][c]; if (!cell.valid) continue;
    if (g.type === 'stain') n += cell.stain;
    if (g.type === 'tissue') n += cell.blocker;
    if (g.type === 'lock' && G.grid[r][c] && G.grid[r][c].lock) n++;
  }
  return n;
}
const goalsMet = () => G.L.goals.every(g => goalLeft(g) === 0);

async function endTurn() {
  UI.hud();
  if (goalsMet()) { G.over = true; await makanTime(); UI.win(); return; }
  if (G.moves <= 0) { G.over = true; await wait(400); UI.lose(); return; }
  if (!findAllMoves().length) { UI.praise('No moves – reshuffle!'); await shuffleBoard(); }
  G.busy = false;
}

async function shuffleBoard() {
  const spots = [], pieces = [];
  forEachPiece((p, r, c) => { if (!p.lock) { spots.push([r, c]); pieces.push(p); } });
  for (let t = 0; t < 120; t++) {
    for (let i = pieces.length - 1; i > 0; i--) { const j = rand(i + 1); [pieces[i], pieces[j]] = [pieces[j], pieces[i]]; }
    spots.forEach(([r, c], i) => G.grid[r][c] = pieces[i]);
    if (t > 60) pieces.forEach(p => { if (!p.special) p.color = randColor(); });
    if (!findMatches().length && findAllMoves().length) break;
  }
  Snd.play('swap');
  await Promise.all(spots.map(([r, c]) => tween(G.grid[r][c], { x: c, y: r }, 420, ease.inOut)));
}

async function makanTime() {
  G.busy = true;
  await wait(300);
  if (G.moves > 0 || hasSpecials()) UI.praise('Makan Time!', true);
  await wait(700);
  while (G.moves > 0) {
    const cand = []; forEachPiece((p, r, c) => { if (!p.special && !p.lock) cand.push(p); });
    G.moves--; G.score += 100;
    if (cand.length) { const p = cand[rand(cand.length)]; p.special = Math.random() < .5 ? 'h' : 'v'; p.scale = 1.5; tween(p, { scale: 1 }, 200, ease.outBack); FX.burst(p.x + .5, p.y + .5, '#fff', 6); }
    Snd.play('tick'); UI.hud(); await wait(110);
  }
  for (let guard = 0; guard < 25 && hasSpecials(); guard++) {
    const hits = []; forEachPiece((p, r, c) => { if (p.special) hits.push([r, c, 'blast']); });
    G.cascade = 1;
    await applyHits(hits); await gravity(); await resolveBoard();
  }
  UI.hud();
  await wait(500);
}
function hasSpecials() { let f = false; forEachPiece(p => { if (p.special) f = true; }); return f; }

// ===================== BOOSTERS =====================
function useBooster(name) { save.boosters[name] = Math.max(0, save.boosters[name] - 1); writeSave(); G.booster = null; UI.boosters(); }
async function boosterTap(name) {
  if (G.busy || G.over) return;
  if (!save.boosters[name]) { Snd.play('bad'); return; }
  Snd.play('click');
  if (name === 'wok') {
    G.booster = null; G.busy = true; useBooster('wok');
    await shuffleBoard(); G.cascade = 0; await resolveBoard(); await endTurn(); return;
  }
  G.booster = G.booster === name ? null : name; G.selected = null; UI.boosters();
}
async function cleaverAt(r, c) {
  if (!isCell(r, c)) return;
  const cell = G.cells[r][c];
  if (!cell.blocker && !G.grid[r][c]) return;
  G.busy = true; useBooster('cleaver');
  FX.ring(r, c, .9, '#cbd5e1'); Snd.play('wrap');
  G.cascade = 1;
  await applyHits([[r, c, 'blast']]);
  await gravity(); G.cascade = 0; await resolveBoard(); await endTurn();
}

// ===================== FX =====================
const FX = {
  list: [], parts: [], texts: [],
  beam(r, c, dir, color, w = 1) { this.list.push({ t: 'beam', r, c, dir, color, w, age: 0, life: 420 }); },
  ring(r, c, rad, color) { this.list.push({ t: 'ring', r, c, rad, color, age: 0, life: 450 }); },
  bolts(r, c, targets, color) { this.list.push({ t: 'bolt', r, c, targets: targets.map(([a, b]) => [a, b, Math.random()]), color, age: 0, life: 520 }); },
  flash() { this.list.push({ t: 'flash', age: 0, life: 600 }); },
  burst(x, y, color, n) {
    if (FAST.on) return;
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 3.5; this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, color, age: 0, life: 450 + Math.random() * 300, size: .06 + Math.random() * .07 }); }
    if (this.parts.length > 400) this.parts.splice(0, this.parts.length - 400);
  },
  text(x, y, s, color) { if (!FAST.on) this.texts.push({ x, y, s, color, age: 0, life: 900 }); },
  update(dt) {
    for (const arr of [this.list, this.parts, this.texts]) for (let i = arr.length - 1; i >= 0; i--) { arr[i].age += dt; if (arr[i].age > arr[i].life) arr.splice(i, 1); }
    const s = dt / 1000;
    for (const p of this.parts) { p.vy += 9 * s; p.x += p.vx * s; p.y += p.vy * s; }
    for (const t of this.texts) t.y -= .9 * s;
  },
};

// ===================== RENDER =====================
const R = { canvas: null, ctx: null, cs: 60, dpr: 1, W: 0, H: 0, imgs: {}, spr: {}, ready: false };
function loadImages() {
  const S = ART.svgs, list = { leaf: S.leaf, bomb: S.iceKacang, tissue1: S.tissue1, tissue2: S.tissue2, lock: S.lock, stain1: S.stain1, stain2: S.stain2 };
  S.foods.forEach((s, i) => list['f' + i] = s);
  const ps = Object.entries(list).map(([k, s]) => new Promise(res => { const im = new Image(); im.onload = () => { R.imgs[k] = im; res(); }; im.onerror = res; im.src = ART.url(s); }));
  return Promise.all(ps);
}
function makeSprite(img, size, { shadow = true, stripes = null, pad = .07 } = {}) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const x = cv.getContext('2d');
  const tmp = document.createElement('canvas'); tmp.width = tmp.height = size;
  const t = tmp.getContext('2d'); const p = size * pad;
  if (img) t.drawImage(img, p, p, size - 2 * p, size - 2 * p);
  if (stripes) {
    t.globalCompositeOperation = 'source-atop'; t.fillStyle = 'rgba(255,255,255,.62)';
    const bw = size * .085;
    for (let i = -2; i <= 2; i++) {
      if (stripes === 'h') t.fillRect(0, size / 2 + i * bw * 2.1 - bw / 2, size, bw);
      else t.fillRect(size / 2 + i * bw * 2.1 - bw / 2, 0, bw, size);
    }
    t.globalCompositeOperation = 'source-over';
  }
  if (shadow) { x.shadowColor = 'rgba(60,30,10,.35)'; x.shadowBlur = size * .04; x.shadowOffsetY = size * .03; }
  x.drawImage(tmp, 0, 0);
  return cv;
}
function buildSprites() {
  const size = Math.max(32, Math.round(R.cs * R.dpr)), I = R.imgs, S = {};
  for (let i = 0; i < 6; i++) { S['f' + i] = makeSprite(I['f' + i], size); S['h' + i] = makeSprite(I['f' + i], size, { stripes: 'h' }); S['v' + i] = makeSprite(I['f' + i], size, { stripes: 'v' }); }
  for (const k of ['leaf', 'bomb', 'tissue1', 'tissue2']) S[k] = makeSprite(I[k], size);
  for (const k of ['lock', 'stain1', 'stain2']) S[k] = makeSprite(I[k], size, { shadow: false, pad: k === 'lock' ? .02 : .04 });
  R.spr = S; R.ready = true;
}
function resizeBoard() {
  const wrap = document.getElementById('boardWrap'); if (!wrap || !R.canvas) return;
  const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
  const cs = Math.floor(Math.min((w - 10) / G.cols, (h - 10) / G.rows, 72));
  R.cs = Math.max(24, cs); R.dpr = Math.min(3, window.devicePixelRatio || 1);
  R.W = R.cs * G.cols; R.H = R.cs * G.rows;
  R.canvas.width = Math.round(R.W * R.dpr); R.canvas.height = Math.round(R.H * R.dpr);
  R.canvas.style.width = R.W + 'px'; R.canvas.style.height = R.H + 'px';
  if (Object.keys(R.imgs).length) buildSprites();
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function drawPiece(ctx, p, now) {
  const cs = R.cs, S = R.spr; if (!p || p.alpha <= 0) return;
  let s = cs * p.scale; const cx = (p.x + .5) * cs, cy = (p.y + .5) * cs;
  ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
  if (G.selected && G.grid[G.selected[0]][G.selected[1]] === p) s *= 1 + .06 * Math.sin(now / 120);
  if (p.special === 'w') {
    const pulse = p.armed ? 1 + .1 * Math.sin(now / 60) : 1;
    ctx.drawImage(S.leaf, cx - s * .52 * pulse, cy - s * .52 * pulse, s * 1.04 * pulse, s * 1.04 * pulse);
    const f = s * .8; ctx.drawImage(S['f' + p.color], cx - f / 2, cy - f / 2, f, f);
  } else if (p.special === 'b') {
    const w = s * (1 + .04 * Math.sin(now / 200)); ctx.drawImage(S.bomb, cx - w / 2, cy - w / 2, w, w);
  } else if (p.special === 'h' || p.special === 'v') {
    ctx.drawImage(S[p.special + p.color], cx - s / 2, cy - s / 2, s, s);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = FOOD_HEX[p.color]; ctx.lineWidth = Math.max(1, cs * .025);
    const a = cs * .1, o = s * .47;
    for (const sg of [-1, 1]) {
      ctx.beginPath();
      if (p.special === 'h') { ctx.moveTo(cx + sg * o, cy); ctx.lineTo(cx + sg * (o - a), cy - a * .8); ctx.lineTo(cx + sg * (o - a), cy + a * .8); }
      else { ctx.moveTo(cx, cy + sg * o); ctx.lineTo(cx - a * .8, cy + sg * (o - a)); ctx.lineTo(cx + a * .8, cy + sg * (o - a)); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  } else ctx.drawImage(S['f' + p.color], cx - s / 2, cy - s / 2, s, s);
  if (p.lock) ctx.drawImage(S.lock, cx - cs / 2, cy - cs / 2, cs, cs);
  ctx.globalAlpha = 1;
}
function render(now) {
  const ctx = R.ctx, cs = R.cs; if (!ctx || !R.ready || !G.L) return;
  ctx.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
  ctx.clearRect(0, 0, R.W, R.H);
  // table frame
  ctx.fillStyle = 'rgba(54,44,90,.18)';
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) if (G.cells[r][c].valid) { rr(ctx, c * cs - 3, r * cs - 3, cs + 6, cs + 6, cs * .22); ctx.fill(); }
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) {
    const cell = G.cells[r][c]; if (!cell.valid) continue;
    ctx.fillStyle = (r + c) % 2 ? '#f3f0f8' : '#e7e2f0';
    rr(ctx, c * cs + 1, r * cs + 1, cs - 2, cs - 2, cs * .16); ctx.fill();
    if (cell.stain) ctx.drawImage(R.spr['stain' + Math.min(2, cell.stain)], c * cs, r * cs, cs, cs);
  }
  if (G.booster === 'cleaver' || G.booster === 'chop') { ctx.fillStyle = 'rgba(255,210,63,.12)'; ctx.fillRect(0, 0, R.W, R.H); }
  if (G.selected) { const [r, c] = G.selected; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; rr(ctx, c * cs + 2, r * cs + 2, cs - 4, cs - 4, cs * .18); ctx.stroke(); }
  // pieces (clipped to the board)
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, R.W, R.H); ctx.clip();
  for (const pass of [0, 1]) for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) {
    const p = G.grid[r][c]; if (!p || p.y < -1) continue;
    const settled = Math.abs(p.y - r) < .01 && Math.abs(p.x - c) < .01;
    if (settled === !!pass) drawPiece(ctx, p, now); // moving pieces first so they pass behind settled ones
  }
  for (const p of G.dying) drawPiece(ctx, p, now);
  ctx.restore();
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) {
    const b = G.cells[r][c].blocker; if (b) ctx.drawImage(R.spr[b > 1 ? 'tissue2' : 'tissue1'], c * cs, r * cs, cs, cs);
  }
  // effects
  for (const f of FX.list) {
    const k = f.age / f.life, a = 1 - k;
    if (f.t === 'beam') {
      ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = f.color; ctx.shadowBlur = cs * .5;
      const th = cs * .42 * f.w * (1 - k * .6), ext = Math.min(1, k * 3);
      ctx.fillStyle = f.color;
      if (f.dir === 'h') { const y = (f.r + .5) * cs, x0 = (f.c + .5) * cs; ctx.fillRect(x0 - ext * R.W, y - th / 2, ext * R.W * 2, th); ctx.fillStyle = '#fff'; ctx.fillRect(x0 - ext * R.W, y - th / 6, ext * R.W * 2, th / 3); }
      else { const x = (f.c + .5) * cs, y0 = (f.r + .5) * cs; ctx.fillRect(x - th / 2, y0 - ext * R.H, th, ext * R.H * 2); ctx.fillStyle = '#fff'; ctx.fillRect(x - th / 6, y0 - ext * R.H, th / 3, ext * R.H * 2); }
      ctx.restore();
    } else if (f.t === 'ring') {
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = f.color; ctx.lineWidth = cs * .25 * a + 2; ctx.shadowColor = '#fff'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc((f.c + .5) * cs, (f.r + .5) * cs, cs * f.rad * ease.outQuad(k) + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,' + (.35 * a) + ')'; ctx.fill(); ctx.restore();
    } else if (f.t === 'bolt') {
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; ctx.shadowColor = f.color; ctx.shadowBlur = 10; ctx.lineWidth = 2.5;
      const sx = (f.c + .5) * cs, sy = (f.r + .5) * cs;
      for (const [r, c, j] of f.targets) {
        if (k < j * .4) continue;
        const tx = (c + .5) * cs, ty = (r + .5) * cs; ctx.beginPath(); ctx.moveTo(sx, sy);
        for (let i = 1; i < 5; i++) { const q = i / 5; ctx.lineTo(sx + (tx - sx) * q + (Math.random() - .5) * cs * .3, sy + (ty - sy) * q + (Math.random() - .5) * cs * .3); }
        ctx.lineTo(tx, ty); ctx.stroke();
      }
      ctx.restore();
    } else if (f.t === 'flash') { ctx.fillStyle = 'rgba(255,255,255,' + (a * .8) + ')'; ctx.fillRect(0, 0, R.W, R.H); }
  }
  for (const p of FX.parts) { ctx.globalAlpha = Math.max(0, 1 - p.age / p.life); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x * cs, p.y * cs, p.size * cs, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const t of FX.texts) {
    const a = 1 - t.age / t.life; ctx.globalAlpha = Math.max(0, a);
    ctx.font = `800 ${Math.round(cs * .42)}px "Baloo 2", system-ui, sans-serif`;
    ctx.lineWidth = 4; ctx.strokeStyle = '#3b1f5c'; ctx.strokeText(t.s, t.x * cs, t.y * cs); ctx.fillStyle = t.color; ctx.fillText(t.s, t.x * cs, t.y * cs);
  }
  ctx.globalAlpha = 1;
}
let lastT = 0;
function frame(now) {
  const dt = Math.min(50, now - (lastT || now)); lastT = now;
  updateTweens(dt); FX.update(dt); render(now);
  requestAnimationFrame(frame);
}

// ===================== INPUT =====================
const input = { start: null };
function cellFromEvent(e) {
  const rect = R.canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / R.cs, y = (e.clientY - rect.top) / R.cs;
  return { r: Math.floor(y), c: Math.floor(x), px: e.clientX, py: e.clientY };
}
function bindInput() {
  const cv = R.canvas;
  cv.addEventListener('pointerdown', e => {
    Snd.init();
    if (G.busy || G.over) return;
    e.preventDefault();
    const h = cellFromEvent(e); if (!isCell(h.r, h.c)) return;
    if (G.booster === 'cleaver') { cleaverAt(h.r, h.c); return; }
    input.start = h; try { cv.setPointerCapture(e.pointerId); } catch (_) { }
  });
  cv.addEventListener('pointermove', e => {
    const s = input.start; if (!s) return;
    const dx = e.clientX - s.px, dy = e.clientY - s.py, th = R.cs * .32;
    if (Math.abs(dx) < th && Math.abs(dy) < th) return;
    input.start = null;
    const [dr, dc] = Math.abs(dx) > Math.abs(dy) ? [0, Math.sign(dx)] : [Math.sign(dy), 0];
    G.selected = null; trySwap(s.r, s.c, s.r + dr, s.c + dc);
  });
  const up = () => {
    const s = input.start; if (!s) return; input.start = null;
    const sel = G.selected;
    if (sel && Math.abs(sel[0] - s.r) + Math.abs(sel[1] - s.c) === 1) { G.selected = null; trySwap(sel[0], sel[1], s.r, s.c); }
    else if (sel && sel[0] === s.r && sel[1] === s.c) G.selected = null;
    else if (G.grid[s.r][s.c]) { G.selected = [s.r, s.c]; Snd.play('click'); }
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', () => { input.start = null; });
}
