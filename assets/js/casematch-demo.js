/* Casematch preview: a 3-step walkthrough with sample data.
   Mirrors the real rule: each applicable criterion is met, not met, or unknown.
   Score = met / checked. Unknown is neutral and is not counted. No innerHTML. */
(function () {
  'use strict';
  var root = document.querySelector('[data-cm-demo]');
  if (!root) return;

  var CREDENTIALS = ['BCBA', 'RBT', 'Special education teacher'];
  var SETTINGS = ['School-based', 'Clinic-based', 'Home-based', 'Telehealth'];
  var EMPLOYMENT = [{ l: 'Full-time', v: 'Full-time' }, { l: 'Part-time', v: 'Part-time' }, { l: 'Per Diem', v: 'Per Diem' }, { l: 'Not set', v: null }];
  var STARTS = [{ l: 'Available now', v: 0 }, { l: 'Within 30 days', v: 30 }, { l: 'Within 90 days', v: 90 }, { l: 'Not set', v: null }];
  var RADII = [{ l: '10 miles', v: 10 }, { l: '25 miles', v: 25 }, { l: '50 miles', v: 50 }, { l: 'Not set', v: null }];

  /* Fictional employer. Distance is sample data too. */
  var ROLE = {
    employer: 'Sample Learning Center',
    town: 'Sampleton',
    title: 'Behavior support role',
    credentials: ['BCBA', 'RBT'],
    setting: 'School-based',
    employment: 'Full-time',
    startWithin: 60,
    distance: 18
  };

  var state = { credential: 'RBT', setting: 'Clinic-based', employment: 'Full-time', start: 30, radius: 25 };
  var step = 0;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function labelOf(list, v) {
    for (var i = 0; i < list.length; i++) if (list[i].v === v) return list[i].l;
    return '';
  }

  /* ---- Matching rule ---- */
  function evaluate() {
    var rows = [];
    rows.push({
      name: 'Credential',
      need: 'Accepts ' + ROLE.credentials.join(' or '),
      have: state.credential,
      status: ROLE.credentials.indexOf(state.credential) > -1 ? 'met' : 'notMet'
    });
    rows.push({
      name: 'Setting',
      need: ROLE.setting,
      have: state.setting,
      status: state.setting === ROLE.setting ? 'met' : 'notMet'
    });
    rows.push({
      name: 'Employment type',
      need: ROLE.employment,
      have: labelOf(EMPLOYMENT, state.employment),
      status: state.employment === null ? 'unknown' : (state.employment === ROLE.employment ? 'met' : 'notMet')
    });
    rows.push({
      name: 'Start date',
      need: 'Within ' + ROLE.startWithin + ' days',
      have: labelOf(STARTS, state.start),
      status: state.start === null ? 'unknown' : (state.start <= ROLE.startWithin ? 'met' : 'notMet')
    });
    rows.push({
      name: 'Location',
      need: ROLE.distance + ' miles from the candidate',
      have: labelOf(RADII, state.radius),
      status: state.radius === null ? 'unknown' : (ROLE.distance <= state.radius ? 'met' : 'notMet')
    });
    var met = 0, checked = 0;
    rows.forEach(function (r) {
      if (r.status !== 'unknown') checked++;
      if (r.status === 'met') met++;
    });
    return { rows: rows, met: met, checked: checked, pct: checked ? Math.round((met / checked) * 100) : null };
  }

  /* ---- Step 1: candidate controls ---- */
  var groupCounter = 0;
  function chipGroup(title, options, current, onPick) {
    var id = 'cm-g' + (++groupCounter);
    var wrap = el('div', 'cm-field');
    var lab = el('p', 'cm-field-label', title);
    lab.id = id;
    var group = el('div', 'cm-chips');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-labelledby', id);
    options.forEach(function (o) {
      var text = typeof o === 'string' ? o : o.l;
      var val = typeof o === 'string' ? o : o.v;
      var b = el('button', 'cm-chip', text);
      b.type = 'button';
      b.setAttribute('aria-pressed', val === current ? 'true' : 'false');
      b.addEventListener('click', function () {
        onPick(val);
        var sibs = group.children;
        for (var i = 0; i < sibs.length; i++) sibs[i].setAttribute('aria-pressed', sibs[i] === b ? 'true' : 'false');
        refresh();
      });
      group.appendChild(b);
    });
    wrap.appendChild(lab);
    wrap.appendChild(group);
    return wrap;
  }

  function buildPanel0(panel) {
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    panel.removeAttribute('data-cm-initial');
    var h = el('h3', 'cm-panel-title', 'Candidate profile');
    h.tabIndex = -1;
    panel.appendChild(h);
    panel.appendChild(el('p', 'cm-panel-sub', 'Sample candidate. Tap a chip to change a value.'));
    var form = el('div', 'cm-fields');
    form.appendChild(chipGroup('Credential', CREDENTIALS, state.credential, function (v) { state.credential = v; }));
    form.appendChild(chipGroup('Setting', SETTINGS, state.setting, function (v) { state.setting = v; }));
    form.appendChild(chipGroup('Employment type', EMPLOYMENT, state.employment, function (v) { state.employment = v; }));
    form.appendChild(chipGroup('Earliest start', STARTS, state.start, function (v) { state.start = v; }));
    form.appendChild(chipGroup('Location radius', RADII, state.radius, function (v) { state.radius = v; }));
    panel.appendChild(form);
  }

  /* ---- Step 2: role card ---- */
  function buildPanel1(panel) {
    var h = el('h3', 'cm-panel-title', 'Role');
    h.tabIndex = -1;
    panel.appendChild(h);
    panel.appendChild(el('p', 'cm-panel-sub', 'A sample posting from a made-up employer.'));
    var card = el('div', 'cm-role');
    var head = el('div', 'cm-role-head');
    head.appendChild(el('p', 'cm-role-title', ROLE.title));
    head.appendChild(el('p', 'cm-role-org', ROLE.employer + ', ' + ROLE.town));
    card.appendChild(head);
    var dl = el('dl', 'cm-static');
    [
      ['Eligible credentials', ROLE.credentials.join(', ')],
      ['Setting', ROLE.setting],
      ['Employment type', ROLE.employment],
      ['Start', 'Within ' + ROLE.startWithin + ' days'],
      ['Location', ROLE.distance + ' miles from the sample candidate']
    ].forEach(function (p) {
      var d = el('div');
      d.appendChild(el('dt', null, p[0]));
      d.appendChild(el('dd', null, p[1]));
      dl.appendChild(d);
    });
    card.appendChild(dl);
    panel.appendChild(card);
  }

  /* ---- Step 3: match ---- */
  var ui = {};
  var CIRC = 2 * Math.PI * 52;
  var GLYPH = { met: '✓', notMet: '✕', unknown: '−' };
  var WORD = { met: 'Met', notMet: 'Not met', unknown: 'Unknown' };

  function buildPanel2(panel) {
    var h = el('h3', 'cm-panel-title', 'Match');
    h.tabIndex = -1;
    panel.appendChild(h);
    panel.appendChild(el('p', 'cm-panel-sub', 'Sample candidate against ' + ROLE.employer + '.'));

    var top = el('div', 'cm-score');
    var ring = svg('svg', { viewBox: '0 0 120 120', 'class': 'cm-ring', 'aria-hidden': 'true', focusable: 'false' });
    ring.appendChild(svg('circle', { cx: 60, cy: 60, r: 52, 'class': 'cm-ring-track' }));
    ui.arc = svg('circle', { cx: 60, cy: 60, r: 52, 'class': 'cm-ring-arc', transform: 'rotate(-90 60 60)' });
    ui.arc.setAttribute('stroke-dasharray', String(CIRC));
    ring.appendChild(ui.arc);
    top.appendChild(ring);
    var txt = el('div', 'cm-score-text');
    ui.pct = el('p', 'cm-score-num');
    ui.pct.setAttribute('role', 'status');
    ui.count = el('p', 'cm-score-count');
    txt.appendChild(ui.pct);
    txt.appendChild(ui.count);
    top.appendChild(txt);
    panel.appendChild(top);

    ui.list = el('ul', 'cm-checks');
    panel.appendChild(ui.list);

    panel.appendChild(el('p', 'cm-rule', 'The rule: every criterion that applies counts equally, and the score is the number met divided by the number checked.'));
    panel.appendChild(el('p', 'cm-rule cm-rule-soft', 'Missing data is not a failure. An unknown line is left out of the score, and the score never auto-rejects anyone. This sample uses five lines; the real checklist has more.'));
  }

  function renderMatch() {
    var r = evaluate();
    ui.pct.textContent = r.pct === null ? 'No score yet' : r.pct + '% match';
    ui.count.textContent = r.met + ' met of ' + r.checked + ' checked';
    ui.arc.setAttribute('stroke-dashoffset', String(CIRC * (1 - (r.pct || 0) / 100)));
    while (ui.list.firstChild) ui.list.removeChild(ui.list.firstChild);
    r.rows.forEach(function (row) {
      var li = el('li', 'cm-check cm-' + row.status);
      li.appendChild(el('span', 'cm-glyph', GLYPH[row.status])).setAttribute('aria-hidden', 'true');
      var body = el('div', 'cm-check-body');
      body.appendChild(el('p', 'cm-check-name', row.name));
      body.appendChild(el('p', 'cm-check-detail', 'Role: ' + row.need + '. Candidate: ' + row.have + '.'));
      li.appendChild(body);
      li.appendChild(el('span', 'cm-status', WORD[row.status]));
      ui.list.appendChild(li);
    });
    return r;
  }

  /* ---- Stepper chrome ---- */
  var panels = root.querySelectorAll('[data-cm-panel]');
  var stepbar = root.querySelector('[data-cm-stepbar]');
  var stepList = root.querySelector('[data-cm-steps]');
  var live = root.querySelector('[data-cm-live]');
  var nav = root.querySelector('[data-cm-nav]');
  var prev = root.querySelector('[data-cm-prev]');
  var next = root.querySelector('[data-cm-next]');
  var NAMES = ['Candidate profile', 'Role', 'Match'];
  var stepBtns = [];

  function refresh() {
    var r = renderMatch();
    live.textContent = r.pct === null ? 'Live match: none yet' : 'Live match: ' + r.pct + '%';
  }

  function show(i, moveFocus) {
    step = i;
    for (var p = 0; p < panels.length; p++) panels[p].hidden = p !== i;
    stepBtns.forEach(function (b, k) {
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    prev.disabled = i === 0;
    next.disabled = i === 2;
    if (moveFocus) {
      var h = panels[i].querySelector('.cm-panel-title');
      if (h) h.focus({ preventScroll: true });
    }
  }

  function init() {
    buildPanel0(panels[0]);
    buildPanel1(panels[1]);
    buildPanel2(panels[2]);
    NAMES.forEach(function (n, i) {
      var li = el('li');
      var b = el('button', 'cm-step');
      b.type = 'button';
      b.appendChild(el('span', 'cm-step-num', String(i + 1))).setAttribute('aria-hidden', 'true');
      b.appendChild(el('span', 'cm-step-name', n));
      var sr = el('span', 'sr-only', 'Step ' + (i + 1) + ': ');
      b.insertBefore(sr, b.firstChild);
      b.addEventListener('click', function () { show(i, true); });
      li.appendChild(b);
      stepList.appendChild(li);
      stepBtns.push(b);
    });
    prev.addEventListener('click', function () { if (step > 0) show(step - 1, true); });
    next.addEventListener('click', function () { if (step < 2) show(step + 1, true); });
    root.classList.add('is-live');
    stepbar.hidden = false;
    nav.hidden = false;
    refresh();
    show(0, false);
  }

  init();
})();
