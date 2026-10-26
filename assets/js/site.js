/* Scroll reveal (IntersectionObserver) + mobile menu niceties. No dependencies. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');

  if (!reduce && 'IntersectionObserver' in window && items.length) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  var menu = document.querySelector('.menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) menu.removeAttribute('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.hasAttribute('open')) {
        menu.removeAttribute('open');
        var s = menu.querySelector('summary');
        if (s) s.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (menu.hasAttribute('open') && !menu.contains(e.target)) menu.removeAttribute('open');
    });
  }
})();

/* Accent easter egg, portrait tilt, GitHub activity strip, command palette. */
(function () {
  var root = document.documentElement;
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- F1 easter egg: toggles data-theme-accent="papaya" on <html>, kept for the session --- */
  var dot = qs('[data-papaya]');
  function setPapaya(on) {
    if (on) root.setAttribute('data-theme-accent', 'papaya'); else root.removeAttribute('data-theme-accent');
    if (dot) dot.setAttribute('aria-pressed', on ? 'true' : 'false');
    store.set('ejq-accent', on ? 'papaya' : '');
  }
  if (store.get('ejq-accent') === 'papaya') setPapaya(true);
  if (dot) {
    dot.hidden = false;
    dot.addEventListener('click', function () { setPapaya(root.getAttribute('data-theme-accent') !== 'papaya'); });
  }

  /* --- Portrait tilt (max 3deg) with a moving highlight; fine pointers only --- */
  var fig = qs('.headshot');
  var shell = qs('.headshot-shell');
  var core = qs('.headshot-core');
  if (fig && shell && core && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var raf = 0;
    fig.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = fig.getBoundingClientRect();
        var x = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
        var y = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
        shell.classList.add('is-tilting');
        shell.style.transform = 'rotateX(' + (-y * 3).toFixed(2) + 'deg) rotateY(' + (x * 3).toFixed(2) + 'deg)';
        core.style.setProperty('--hx', (x * 40).toFixed(1) + 'px');
        core.style.setProperty('--hy', (y * 40).toFixed(1) + 'px');
      });
    });
    fig.addEventListener('pointerleave', function () {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      shell.classList.remove('is-tilting');
      shell.style.transform = '';
    });
  }

  /* --- GitHub activity strip (public events API, cached 10 minutes) --- */
  var box = qs('#activity');
  if (box && window.fetch) {
    var list = qs('[data-activity-list]', box), fb = qs('[data-activity-fallback]', box);
    var KEY = 'ejq-gh-events', TTL = 10 * 60 * 1000;
    var ago = function (iso) {
      var m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
      if (m < 60) return m + 'm ago';
      if (m < 1440) return Math.round(m / 60) + 'h ago';
      return Math.round(m / 1440) + 'd ago';
    };
    var plural = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };
    var describe = function (ev) {
      var p = ev.payload || {};
      switch (ev.type) {
        case 'PushEvent':
          var n = typeof p.size === 'number' ? p.size : (p.commits ? p.commits.length : 0);
          return { verb: n ? 'Pushed ' + plural(n, 'commit') + ' to' : 'Pushed to', n: n, key: 'push' };
        case 'PullRequestEvent':
          return p.action === 'opened' ? { verb: 'Opened a pull request in', key: 'pr' } : p.action === 'closed' ? { verb: 'Closed a pull request in', key: 'prc' } : null;
        case 'IssuesEvent': return p.action === 'opened' ? { verb: 'Opened an issue in', key: 'issue' } : null;
        case 'IssueCommentEvent': return { verb: 'Commented in', key: 'comment' };
        case 'CreateEvent': return { verb: p.ref_type === 'repository' ? 'Created' : 'Created a ' + (p.ref_type || 'branch') + ' in', key: 'create' };
        case 'ReleaseEvent': return { verb: 'Published a release in', key: 'release' };
        case 'ForkEvent': return { verb: 'Forked', key: 'fork' };
        case 'WatchEvent': return { verb: 'Starred', key: 'star' };
        default: return null;
      }
    };
    var group = function (events) {
      var rows = [];
      events.forEach(function (ev) {
        var d = describe(ev), repo = ev.repo && ev.repo.name;
        if (!d || !repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return;
        var last = rows.filter(function (r) { return r.repo === repo && r.key === d.key; })[0];
        if (last) {
          if (d.key === 'push') { last.n += d.n; last.verb = last.n ? 'Pushed ' + plural(last.n, 'commit') + ' to' : last.verb; }
          return;
        }
        if (rows.length < 6) rows.push({ repo: repo, key: d.key, verb: d.verb, n: d.n || 0, at: ev.created_at });
      });
      return rows;
    };
    var render = function (events) {
      var rows = group(events);
      if (!rows.length) return;
      list.textContent = '';
      rows.forEach(function (r) {
        var li = document.createElement('li'), a = document.createElement('a');
        a.className = 'activity-row'; a.href = 'https://github.com/' + r.repo; a.target = '_blank'; a.rel = 'noopener';
        var t = document.createElement('span'); t.className = 'activity-text'; t.textContent = r.verb + ' ' + r.repo;
        var tm = document.createElement('time'); tm.className = 'activity-time'; tm.dateTime = r.at; tm.textContent = ago(r.at);
        a.appendChild(t); a.appendChild(tm); li.appendChild(a); list.appendChild(li);
      });
      list.hidden = false; fb.hidden = true;
    };
    var cached = null;
    try { cached = JSON.parse(store.get(KEY) || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.t < TTL && Array.isArray(cached.d)) render(cached.d);
    else {
      fetch('https://api.github.com/users/ejq17/events/public?per_page=30')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) {
          if (!Array.isArray(d)) return;
          store.set(KEY, JSON.stringify({ t: Date.now(), d: d.map(function (e) { return { type: e.type, repo: e.repo && { name: e.repo.name }, created_at: e.created_at, payload: e.payload && { action: e.payload.action, size: e.payload.size, ref_type: e.payload.ref_type } }; }) }));
          render(d);
        })
        .catch(function () {});
    }
  }

  /* --- Contribution graph: reads /assets/data/contributions.json (written nightly by a GitHub Action) --- */
  var cbox = qs('[data-contrib]');
  if (cbox && window.fetch) {
    var SVGNS = 'http://www.w3.org/2000/svg';
    var el = function (n, attrs) { var e = document.createElementNS(SVGNS, n); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; };
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var nice = function (iso) { var d = new Date(iso + 'T12:00:00'); return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); };
    fetch('/assets/data/contributions.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) {
        var weeks = d && d.weeks;
        if (!Array.isArray(weeks) || !weeks.length) return;
        var CELL = 11, GAP = 3, STEP = CELL + GAP, TOP = 18, LEFT = 0;
        var w = LEFT + weeks.length * STEP - GAP, h = TOP + 7 * STEP - GAP;
        var total = typeof d.total === 'number' ? d.total : 0;
        var svg = el('svg', { class: 'contrib-svg', viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-labelledby': 'contrib-title', 'aria-describedby': 'contrib-desc' });
        var desc = el('desc', { id: 'contrib-desc' }); desc.textContent = total + ' contributions in the last year, one square per day.'; svg.appendChild(desc);
        var lastMonth = -1, lastLabel = null, lastLabelWi = -9;
        weeks.forEach(function (week, wi) {
          week.forEach(function (day, di) {
            if (!Array.isArray(day) || day.length < 3) return;
            var date = String(day[0]), count = Number(day[1]) || 0, level = Math.max(0, Math.min(4, Number(day[2]) || 0));
            var month = new Date(date + 'T12:00:00').getMonth();
            if (di === 0 && month !== lastMonth && wi < weeks.length - 1) {
              lastMonth = month;
              /* A month that only covers the first week or two would collide with the next label, so drop it. */
              if (lastLabel && wi - lastLabelWi < 3) svg.removeChild(lastLabel);
              var t = el('text', { x: LEFT + wi * STEP, y: 10 }); t.textContent = MONTHS[month]; svg.appendChild(t);
              lastLabel = t; lastLabelWi = wi;
            }
            var r = el('rect', { class: 'contrib-cell', 'data-l': level, x: LEFT + wi * STEP, y: TOP + di * STEP, width: CELL, height: CELL, rx: 2.5 });
            var title = el('title'); title.textContent = (count === 1 ? '1 contribution' : count + ' contributions') + ' on ' + nice(date); r.appendChild(title);
            svg.appendChild(r);
          });
        });
        var scroller = qs('[data-contrib-scroll]', cbox), totalEl = qs('[data-contrib-total]', cbox);
        scroller.textContent = ''; scroller.appendChild(svg);
        totalEl.textContent = (total === 1 ? '1 contribution' : total + ' contributions') + ' in the last year';
        cbox.hidden = false;
        scroller.scrollLeft = scroller.scrollWidth; /* newest weeks visible first on small screens */
      })
      .catch(function () {});
  }

  /* --- Résumé: the Download button is Save as PDF via the print stylesheet --- */
  var pr = qs('[data-print]');
  if (pr) pr.addEventListener('click', function () { window.print(); });

  /* --- Command palette: Cmd/Ctrl+K. Edit the ENTRIES list to change what it offers. --- */
  var dlg = qs('#cmdk');
  if (dlg && typeof dlg.showModal === 'function') {
    var ENTRIES = [
      ['About', '/#about', 'Section'], ['Experience', '/#experience', 'Section'], ['How I got here', '/#story', 'Section'],
      ['Projects', '/#projects', 'Section'], ['Skills', '/#skills', 'Section'], ['Right now', '/#now', 'Section'],
      ['Off the keyboard', '/#credentials', 'Section'], ['Outside the work', '/#beyond', 'Section'], ['Get in touch', '/#contact', 'Section'],
      ['Résumé', '/resume/', 'Page'], ['Speaking', '/speaking/', 'Page'], ['Conferences', '/conferences/', 'Page'], ['Certifications', '/certifications/', 'Page'],
      ['Now', '/now/', 'Page'], ['Links', '/links/', 'Page'], ['Tabscribe', '/projects/tabscribe/', 'Page'], ['Casematch', '/projects/casematch/', 'Page'],
      ['GitHub', 'https://github.com/ejq17', 'External'], ['Instagram', 'https://www.instagram.com/madebyejq/', 'External'],
      ['TikTok', 'https://www.tiktok.com/@madebyejq', 'External'], ['LinkedIn', 'https://www.linkedin.com/in/madebyejq', 'External'],
      ['Casematch site', 'https://joincasematch.com', 'External'], ['Coropos', 'https://coroposws.com', 'External'],
      ['NextStep', 'https://nextstepbhs.com', 'External'], ['Equal North', 'https://equalnorth.dev', 'External'],
      ['Tabscribe app', 'https://edwardquigley.com/tabscribe/', 'External']
    ];
    var input = qs('.cmdk-input', dlg), ul = qs('.cmdk-list', dlg), empty = qs('.cmdk-empty', dlg);
    var shown = [], idx = 0;
    var paint = function () {
      Array.prototype.forEach.call(ul.children, function (li, i) { li.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
      var cur = ul.children[idx];
      if (cur) { input.setAttribute('aria-activedescendant', cur.id); if (cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    };
    var build = function () {
      var q = input.value.trim().toLowerCase();
      shown = ENTRIES.filter(function (e) { return !q || (e[0] + ' ' + e[2]).toLowerCase().indexOf(q) > -1; });
      ul.textContent = '';
      shown.forEach(function (e, i) {
        var li = document.createElement('li'); li.className = 'cmdk-item'; li.id = 'cmdk-o' + i; li.setAttribute('role', 'option');
        var a = document.createElement('span'); a.textContent = e[0];
        var g = document.createElement('span'); g.className = 'cmdk-group'; g.textContent = e[2] === 'External' ? 'External ↗' : e[2];
        li.appendChild(a); li.appendChild(g);
        li.addEventListener('click', function () { go(e); });
        li.addEventListener('pointermove', function () { if (idx !== i) { idx = i; paint(); } });
        ul.appendChild(li);
      });
      empty.hidden = shown.length > 0; idx = 0; paint();
    };
    var go = function (e) {
      dlg.close();
      if (e[2] === 'External') window.open(e[1], '_blank', 'noopener'); else window.location.href = e[1];
    };
    var open = function () { input.value = ''; build(); dlg.showModal(); input.setAttribute('aria-expanded', 'true'); input.focus(); };
    dlg.addEventListener('close', function () { input.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dlg.open) dlg.close(); else open();
      }
    });
    input.addEventListener('input', build);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (shown.length) { idx = (idx + (e.key === 'ArrowDown' ? 1 : shown.length - 1)) % shown.length; paint(); }
      } else if (e.key === 'Enter' && shown[idx]) { e.preventDefault(); go(shown[idx]); }
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }
})();
