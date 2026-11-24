// ===================== UI =====================
const $ = s => document.querySelector(s);
const imgTag = (svg, cls = '') => `<img class="${cls}" alt="" src="${ART.url(svg)}">`;
const ICON = {
  sfxOn: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  sfxOff: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  musOn: '<svg viewBox="0 0 24 24"><path d="M9 17V5l11-2v12" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="6.5" cy="17.5" r="3" fill="currentColor"/><circle cx="17.5" cy="15.5" r="3" fill="currentColor"/></svg>',
  musOff: '<svg viewBox="0 0 24 24"><path d="M9 17V5l11-2v12" stroke="currentColor" stroke-width="2" fill="none" opacity=".45"/><circle cx="6.5" cy="17.5" r="3" fill="currentColor" opacity=".45"/><circle cx="17.5" cy="15.5" r="3" fill="currentColor" opacity=".45"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>',
};
const BOOSTERS = [
  { id: 'cleaver', name: 'Cleaver', art: () => ART.svgs.cleaver, help: 'Tap a food, tissue packet or tapao bag to chop it.' },
  { id: 'wok', name: 'Wok Toss', art: () => ART.svgs.wok, help: 'Shuffles the board.' },
  { id: 'chop', name: 'Chopsticks', art: () => ART.svgs.chop, help: 'Swap any two neighbours for free, even without a match.' },
];

function goalIcon(g) {
  const S = ART.svgs;
  if (g.type === 'collect') return imgTag(S.foods[g.color]);
  if (g.type === 'stain') return imgTag(S.stain2);
  if (g.type === 'tissue') return imgTag(S.tissue1);
  if (g.type === 'lock') return `<span class="lockgoal">${imgTag(S.foods[1])}${imgTag(S.lock)}</span>`;
  return imgTag(S.star);
}
function goalText(g) {
  if (g.type === 'collect') return `Collect ${g.n} ${FOODS[g.color]}`;
  if (g.type === 'stain') return 'Wipe every sambal stain';
  if (g.type === 'tissue') return 'Clear every chope tissue';
  if (g.type === 'lock') return 'Free every tapao bag';
  return `Score ${g.n.toLocaleString()} points`;
}

const UI = {
  show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    if (id === 'game') requestAnimationFrame(() => { resizeBoard(); });
  },
  toggles() {
    document.querySelectorAll('[data-t="sfx"]').forEach(b => { b.innerHTML = save.sfx ? ICON.sfxOn : ICON.sfxOff; b.setAttribute('aria-label', save.sfx ? 'Mute sound effects' : 'Turn on sound effects'); });
    document.querySelectorAll('[data-t="music"]').forEach(b => { b.innerHTML = save.music ? ICON.musOn : ICON.musOff; b.setAttribute('aria-label', save.music ? 'Mute music' : 'Turn on music'); });
  },
  map() {
    const box = $('#stalls'); box.innerHTML = '';
    const pts = [];
    LEVELS.forEach((L, i) => {
      const unlocked = i < save.unlocked, stars = save.stars[i] || 0;
      const x = [22, 58, 78, 44, 18, 50, 80, 50][i];
      const b = document.createElement('button');
      b.className = 'stall' + (unlocked ? '' : ' locked') + (i === save.unlocked - 1 ? ' current' : '');
      b.style.left = x + '%'; b.style.top = (i * 92 + 16) + 'px';
      b.innerHTML = `<span class="awning"></span><span class="num"><span class="n">${unlocked ? i + 1 : ICON.lock}</span></span>
        <span class="sname">${L.name}</span>
        <span class="sstars">${[0, 1, 2].map(s => `<i class="${s < stars ? 'on' : ''}"></i>`).join('')}</span>`;
      b.setAttribute('aria-label', `Level ${i + 1}, ${L.name}${unlocked ? '' : ', locked'}`);
      if (unlocked) b.onclick = () => { Snd.play('click'); UI.intro(i); };
      box.appendChild(b); pts.push([x, i * 92 + 16 + 34]);
    });
    box.style.height = (LEVELS.length * 92 + 40) + 'px';
    const h = LEVELS.length * 92 + 40;
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; d += ` C ${x0} ${(y0 + y1) / 2}, ${x1} ${(y0 + y1) / 2}, ${x1} ${y1}`; }
    const svg = `<svg class="path" viewBox="0 0 100 ${h}" preserveAspectRatio="none" style="height:${h}px"><path d="${d}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-dasharray="2 4" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>`;
    box.insertAdjacentHTML('afterbegin', svg);
    const total = Object.values(save.stars).reduce((a, b) => a + b, 0);
    $('#starTotal').textContent = `${total} / ${LEVELS.length * 3}`;
  },
  modal(html) { $('#modalCard').innerHTML = html; $('#modal').classList.add('open'); },
  close() { $('#modal').classList.remove('open'); },
  intro(i) {
    const L = LEVELS[i];
    UI.modal(`<p class="eyebrow">Level ${i + 1} of ${LEVELS.length}</p><h2>${L.name}</h2>
      <ul class="goallist">${L.goals.map(g => `<li>${goalIcon(g)}<span>${goalText(g)}</span></li>`).join('')}</ul>
      <p class="moveline"><b>${L.moves}</b> moves</p>
      <p class="tip">${L.tip}</p>
      <div class="row"><button class="btn ghost" data-a="close">Back</button><button class="btn" data-a="start" data-i="${i}">Start cooking</button></div>`);
  },
  start(i) {
    UI.close(); setupLevel(i); UI.show('game');
    $('#lvlName').textContent = `${i + 1}. ${LEVELS[i].name}`;
    UI.buildGoals(); UI.hud(); UI.boosters();
    if (save.music) Snd.startMusic();
  },
  buildGoals() {
    $('#goals').innerHTML = G.L.goals.map((g, j) => `<div class="goal" id="goal${j}">${goalIcon(g)}<b></b></div>`).join('');
  },
  hud() {
    if (!G.L) return;
    const mv = $('#moves'); mv.textContent = G.moves; mv.classList.toggle('low', G.moves <= 5);
    $('#score').textContent = G.score.toLocaleString();
    const st = G.L.stars, max = st[2] * 1.05;
    $('#bar').style.width = Math.min(100, G.score / max * 100) + '%';
    document.querySelectorAll('#ticks i').forEach((t, j) => { t.style.left = (st[j] / max * 100) + '%'; t.classList.toggle('on', G.score >= st[j]); });
    G.L.goals.forEach((g, j) => {
      const el = document.getElementById('goal' + j); if (!el) return;
      const left = goalLeft(g);
      el.querySelector('b').textContent = left === 0 ? '✓' : (g.type === 'score' ? G.score.toLocaleString() + '/' + g.n.toLocaleString() : left);
      el.classList.toggle('done', left === 0);
    });
  },
  boosters() {
    $('#boosters').innerHTML = BOOSTERS.map(b => `<button class="booster ${G.booster === b.id ? 'active' : ''}" data-b="${b.id}" aria-label="${b.name}: ${b.help}" ${save.boosters[b.id] ? '' : 'disabled'}>
      ${imgTag(b.art())}<span class="bcount">${save.boosters[b.id]}</span><span class="blabel">${b.name}</span></button>`).join('');
    const hint = $('#boosterHint');
    const act = BOOSTERS.find(b => b.id === G.booster);
    hint.innerHTML = act ? `<span>${act.help} Tap ${act.name} again to cancel.</span>` : '';
    hint.classList.toggle('show', !!act);
  },
  praise(text, big) {
    const el = document.createElement('div'); el.className = 'praise' + (big ? ' big' : ''); el.textContent = text;
    $('#boardWrap').appendChild(el); setTimeout(() => el.remove(), 1500);
  },
  stars() { const s = G.L.stars; return G.score >= s[2] ? 3 : G.score >= s[1] ? 2 : 1; },
  win() {
    const i = G.li, stars = UI.stars();
    const prevStars = save.stars[i] || 0;
    save.stars[i] = Math.max(prevStars, stars);
    save.best[i] = Math.max(save.best[i] || 0, G.score);
    save.unlocked = Math.max(save.unlocked, Math.min(LEVELS.length, i + 2));
    const reward = BOOSTERS[rand(3)]; save.boosters[reward.id]++;
    writeSave(); Snd.play('win');
    const last = i === LEVELS.length - 1;
    UI.modal(`<p class="eyebrow">${LEVELS[i].name} cleared</p><h2>${['', 'Not bad!', 'Shiok!', 'Damn shiok!'][stars]}</h2>
      <div class="bigstars">${[0, 1, 2].map(s => `<span class="${s < stars ? 'on' : ''}" style="animation-delay:${.2 + s * .25}s">${imgTag(ART.svgs.star)}</span>`).join('')}</div>
      <p class="final">${G.score.toLocaleString()}<small>Best ${save.best[i].toLocaleString()}</small></p>
      <p class="reward">${imgTag(reward.art())}<span>Bonus: +1 ${reward.name}</span></p>
      ${last ? '<p class="tip">You have eaten your way through every hawker centre. Replay any stall to chase 3 stars.</p>' : ''}
      <div class="row"><button class="btn ghost" data-a="map">Map</button>${last ? `<button class="btn" data-a="replay" data-i="${i}">Play again</button>` : `<button class="btn" data-a="next" data-i="${i + 1}">Next stall</button>`}</div>`);
  },
  lose() {
    Snd.play('lose');
    UI.modal(`<p class="eyebrow">${G.L.name}</p><h2>Out of moves!</h2>
      <p class="tip">Still to do:</p>
      <ul class="goallist">${G.L.goals.filter(g => goalLeft(g) > 0).map(g => `<li>${goalIcon(g)}<span>${goalLeft(g).toLocaleString()} left: ${goalText(g).toLowerCase()}</span></li>`).join('')}</ul>
      <div class="row"><button class="btn ghost" data-a="map">Map</button><button class="btn" data-a="replay" data-i="${G.li}">Try again</button></div>`);
  },
  pause() {
    UI.modal(`<h2>Paused</h2>
      <div class="row toggles"><button class="iconbtn light" data-t="sfx"></button><button class="iconbtn light" data-t="music"></button></div>
      <div class="col"><button class="btn" data-a="close">Resume</button><button class="btn ghost" data-a="replay" data-i="${G.li}">Restart level</button><button class="btn ghost" data-a="map">Quit to map</button></div>`);
    UI.toggles();
  },
};

function toggle(t) {
  Snd.init();
  if (t === 'sfx') { save.sfx = !save.sfx; Snd.setSfx(save.sfx); }
  else { save.music = !save.music; Snd.setMusic(save.music); if (save.music) Snd.startMusic(); }
  writeSave(); UI.toggles(); Snd.play('click');
}

function boot() {
  loadSave();
  R.canvas = $('#board'); R.ctx = R.canvas.getContext('2d');
  bindInput();
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (t) { toggle(t.dataset.t); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    Snd.init(); Snd.play('click');
    const act = a.dataset.a, i = +a.dataset.i;
    if (act === 'close') UI.close();
    else if (act === 'play') { UI.map(); UI.show('map'); if (save.music) Snd.startMusic(); }
    else if (act === 'start' || act === 'next' || act === 'replay') { if (act === 'next') UI.start(i); else UI.start(i); }
    else if (act === 'map') { UI.close(); G.over = true; UI.map(); UI.show('map'); }
    else if (act === 'title') UI.show('title');
    else if (act === 'pause') { if (!G.over) UI.pause(); }
    else if (act === 'help') UI.help();
  });
  $('#boosters').addEventListener('click', e => { const b = e.target.closest('[data-b]'); if (b) { Snd.init(); boosterTap(b.dataset.b); } });
  window.addEventListener('resize', () => resizeBoard());
  if (window.ResizeObserver) new ResizeObserver(() => resizeBoard()).observe($('#boardWrap'));
  document.addEventListener('visibilitychange', () => { if (document.hidden) Snd.suspend(); else Snd.resume(); });
  UI.toggles();
  // Title screen food parade
  $('#parade').innerHTML = ART.svgs.foods.map((s, i) => `<span style="animation-delay:${i * .15}s">${imgTag(s)}</span>`).join('') ;
  loadImages().then(() => { resizeBoard(); requestAnimationFrame(frame); });
}
UI.help = () => {
  UI.modal(`<h2>How to play</h2>
    <ul class="howto">
      <li>Swipe a dish onto a neighbour, or tap one then the other, to line up 3 or more.</li>
      <li><b>4 in a row</b> makes a striped dish that clears a whole row or column.</li>
      <li><b>L or T shape</b> wraps a dish in banana leaf. It explodes twice.</li>
      <li><b>5 in a row</b> makes an Ice Kacang. Swap it with any dish to clear every one of that kind.</li>
      <li>Swap two specials together for a combo blast.</li>
      <li>Leftover moves turn into bonus points during Makan Time.</li>
    </ul>
    <div class="row"><button class="btn" data-a="close">Got it</button></div>`);
};
document.addEventListener('DOMContentLoaded', boot);
