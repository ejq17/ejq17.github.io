/* Tabscribe scripted demo: a short melody (written for this demo) as piano-roll
   blocks on the left, fret numbers filling a 6-line tab on the right.
   Vanilla JS + SVG. No audio. */
(function () {
  var root = document.querySelector('[data-demo]');
  if (!root) return;
  var NS = 'http://www.w3.org/2000/svg';
  var rollSvg = root.querySelector('[data-roll]');
  var tabSvg = root.querySelector('[data-tab]');
  var playBtn = root.querySelector('[data-play]');
  var speedBtn = root.querySelector('[data-speed]');
  var readout = root.querySelector('[data-readout]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // pitch = MIDI number, beats = duration
  var MELODY = [
    [55, 1], [57, 1], [59, 1], [60, 1], [64, 2], [62, 1],
    [60, 1], [59, 1], [57, 1], [55, 1], [52, 1], [55, 2]
  ];
  // Standard tuning, low to high: E2 A2 D3 G3 B3 E4
  var OPEN = [40, 45, 50, 55, 59, 64];
  var STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
  var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var MAX_FRET = 15;
  var BPM = 96;

  function noteName(p) { return NAMES[p % 12] + (Math.floor(p / 12) - 1); }

  // Lowest-fret heuristic: the string where the fret is smallest but not negative.
  function place(p) {
    var best = null;
    for (var s = 0; s < OPEN.length; s++) {
      var f = p - OPEN[s];
      if (f >= 0 && f <= MAX_FRET && (best === null || f < best.fret)) best = { string: s, fret: f };
    }
    return best || { string: 0, fret: 0 };
  }

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  var W = 440, LEFT = 44, RIGHT = 12, TOP = 16, H = 240;
  var total = 0;
  var notes = MELODY.map(function (m) {
    var n = { pitch: m[0], beats: m[1], start: total, pos: place(m[0]) };
    total += m[1];
    return n;
  });
  var bx = function (beat) { return LEFT + (beat / total) * (W - LEFT - RIGHT); };

  // Piano roll
  var lo = 51, hi = 65, rows = hi - lo, rowH = (H - TOP - 12) / rows;
  var rollY = function (p) { return TOP + (hi - 1 - p) * rowH; };
  for (var r = 0; r <= rows; r++) {
    var y = TOP + r * rowH;
    el('line', { x1: LEFT, x2: W - RIGHT, y1: y, y2: y, 'class': 'roll-row' }, rollSvg);
  }
  [52, 55, 60, 64].forEach(function (p) {
    var t = el('text', { x: LEFT - 8, y: rollY(p) + rowH * 0.7, 'text-anchor': 'end', 'class': 'roll-label' }, rollSvg);
    t.textContent = noteName(p);
  });
  var blocks = notes.map(function (n) {
    return el('rect', {
      x: bx(n.start) + 1.5, y: rollY(n.pitch) + 1.5, width: bx(n.start + n.beats) - bx(n.start) - 3,
      height: rowH - 3, rx: 5, 'class': 'roll-note'
    }, rollSvg);
  });
  var rollHead = el('line', { x1: LEFT, x2: LEFT, y1: TOP - 6, y2: H - 6, 'class': 'playhead' }, rollSvg);

  // Tab: high e on top
  var laneGap = (H - TOP - 28) / 5;
  var laneY = function (s) { return TOP + 14 + (5 - s) * laneGap; };
  for (var s = 0; s < 6; s++) {
    el('line', { x1: LEFT, x2: W - RIGHT, y1: laneY(s), y2: laneY(s), 'class': 'tab-line' }, tabSvg);
    var lt = el('text', { x: LEFT - 12, y: laneY(s) + 4, 'text-anchor': 'end', 'class': 'tab-name' }, tabSvg);
    lt.textContent = STRING_NAMES[s];
  }
  var frets = notes.map(function (n) {
    var cx = bx(n.start) + 16;
    var cy = laneY(n.pos.string);
    var chip = el('rect', { x: cx - 11, y: cy - 11, width: 22, height: 22, rx: 7, 'class': 'tab-chip' }, tabSvg);
    var t = el('text', { x: cx, y: cy + 5, 'text-anchor': 'middle', 'class': 'tab-fret' }, tabSvg);
    t.textContent = n.pos.fret;
    t.chip = chip;
    return t;
  });
  var tabHead = el('line', { x1: LEFT, x2: LEFT, y1: TOP - 6, y2: H - 6, 'class': 'playhead' }, tabSvg);

  function setHead(beat) {
    var x = bx(beat);
    rollHead.setAttribute('x1', x); rollHead.setAttribute('x2', x);
    tabHead.setAttribute('x1', x); tabHead.setAttribute('x2', x);
  }
  function describe(i) {
    var n = notes[i];
    return noteName(n.pitch) + ' → string ' + STRING_NAMES[n.pos.string] + ', fret ' + n.pos.fret;
  }
  function render(shown, current) {
    for (var i = 0; i < notes.length; i++) {
      var on = i < shown;
      blocks[i].classList.toggle('is-on', on);
      blocks[i].classList.toggle('is-now', i === current);
      frets[i].classList.toggle('is-on', on);
      frets[i].chip.classList.toggle('is-on', on);
      frets[i].classList.toggle('is-now', i === current);
    }
  }

  var raf = 0, startTime = 0, slow = false, playing = false;

  function showFinished() {
    cancelAnimationFrame(raf);
    playing = false;
    render(notes.length, -1);
    rollHead.classList.add('is-hidden'); tabHead.classList.add('is-hidden');
    readout.textContent = 'Done: ' + notes.length + ' notes';
    playBtn.textContent = 'Replay';
  }

  function tick(now) {
    var beatMs = 60000 / BPM * (slow ? 2 : 1);
    var beat = (now - startTime) / beatMs;
    if (beat >= total) { showFinished(); return; }
    var cur = 0;
    for (var i = 0; i < notes.length; i++) if (notes[i].start <= beat) cur = i;
    render(cur + 1, cur);
    readout.textContent = describe(cur);
    setHead(beat);
    raf = requestAnimationFrame(tick);
  }

  function play() {
    cancelAnimationFrame(raf);
    playing = true;
    render(0, -1);
    setHead(0);
    rollHead.classList.remove('is-hidden'); tabHead.classList.remove('is-hidden');
    playBtn.textContent = 'Restart';
    startTime = performance.now();
    raf = requestAnimationFrame(tick);
  }

  playBtn.addEventListener('click', play);
  speedBtn.addEventListener('click', function () {
    slow = !slow;
    speedBtn.setAttribute('aria-pressed', slow ? 'true' : 'false');
  });

  // Initial state: finished (also the no-motion and no-IntersectionObserver result).
  showFinished();

  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); play(); }
    }, { threshold: 0.5 });
    io.observe(root);
  }
})();
