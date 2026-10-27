(function () {
  "use strict";

  var C = window.KPI_CONFIG || {};
  var DATA = window.KPI_DATA || { modules: [] };
  var HASHES = window.KPI_HASHES || { salt: "", tasks: {}, ci: [] };
  var page = document.body.getAttribute("data-page");

  /* ---------------------------------------------------------- сховище */
  var mem = {};
  function lsGet(k) {
    try { var v = window.localStorage.getItem(k); if (v !== null) return v; } catch (e) {}
    return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
  }
  function lsSet(k, v) { mem[k] = v; try { window.localStorage.setItem(k, v); } catch (e) {} }

  function tokKey(n) { return "kpi_token:" + String(n).toLowerCase(); }
  function getToken(n) {
    var t = lsGet(tokKey(n));
    if (!t) {
      var a = new Uint8Array(16), hex = "";
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(a);
      else for (var i = 0; i < 16; i++) a[i] = Math.floor(Math.random() * 256);
      for (var j = 0; j < 16; j++) hex += ("0" + a[j].toString(16)).slice(-2);
      t = hex; lsSet(tokKey(n), t);
    }
    return t;
  }
  function apiPost(body) {
    return fetch(C.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, /* без preflight (CORS) */
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    });
  }
  var NICK_RE = /^[A-Za-z0-9Ѐ-ӿ_.\-]{3,20}$/;
  function getNick() { return lsGet("kpi_nick"); }
  function progKey(n) { return "kpi_progress:" + n; }
  function getProgress(n) {
    try { return JSON.parse(lsGet(progKey(n)) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveProgress(n, p) { lsSet(progKey(n), JSON.stringify(p)); }
  function totalPoints(n) {
    var p = getProgress(n), s = 0;
    Object.keys(p).forEach(function (k) { s += Number(p[k].pts) || 0; });
    return s;
  }

  /* ---------------------------------------------------------- DOM-помічники */
  function $(id) { return document.getElementById(id); }
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.indexOf("on") === 0 && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v !== false && v !== null && v !== undefined) n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) {
      if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }
  function pad(n) { return n < 10 ? "0" + n : String(n); }

  var ICONS = {
    web: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="8" width="38" height="32" rx="3"/><path d="M5 17h38"/><circle cx="10.5" cy="12.5" r="1"/><circle cx="15" cy="12.5" r="1"/><path d="M17 27l-4 4 4 4M31 27l4 4-4 4M26 25l-4 12"/></svg>',
    crypto: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="17" cy="24" r="8"/><circle cx="17" cy="24" r="2.5"/><path d="M25 24h18M36 24v6M42 24v4"/></svg>',
    forensics: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="21" cy="21" r="12"/><path d="M30 30l12 12"/><path d="M15 21h12M21 15v12" opacity=".5"/></svg>',
    reverse: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="13" y="13" width="22" height="22" rx="2"/><rect x="19" y="19" width="10" height="10"/><path d="M18 13V6M24 13V6M30 13V6M18 42v-7M24 42v-7M30 42v-7M13 18H6M13 24H6M13 30H6M42 18h-7M42 24h-7M42 30h-7"/></svg>'
  };

  /* ---------------------------------------------------------- SHA-256 (запасна реалізація) */
  var K256 = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  function sha256js(str) {
    var bytes = [], s = unescape(encodeURIComponent(str)), i;
    for (i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 0xff);
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    for (var off = 0; off < bytes.length; off += 64) {
      var w = new Array(64), j;
      for (j = 0; j < 16; j++) {
        w[j] = (bytes[off + j * 4] << 24) | (bytes[off + j * 4 + 1] << 16) | (bytes[off + j * 4 + 2] << 8) | bytes[off + j * 4 + 3];
      }
      for (j = 16; j < 64; j++) {
        var s0 = rr(w[j - 15], 7) ^ rr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        var s1 = rr(w[j - 2], 17) ^ rr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (j = 0; j < 64; j++) {
        var S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K256[j] + w[j]) | 0;
        var S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
        var mj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (x) { return ("00000000" + (x >>> 0).toString(16)).slice(-8); }).join("");
  }
  function sha256hex(str) {
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      });
    }
    return Promise.resolve(sha256js(str));
  }
  window.__kpiSha256js = sha256js; /* для автотесту */

  /* ---------------------------------------------------------- перевірка прапора */
  function normalize(task, raw) {
    var f = String(raw).trim();
    if ((HASHES.ci || []).indexOf(task.key) !== -1) f = f.toLowerCase();
    return f;
  }
  function localCheck(task, raw) {
    var f = normalize(task, raw);
    return sha256hex(HASHES.salt + "|" + task.key + "|" + f).then(function (h) {
      return { ok: (HASHES.tasks[task.key] || []).indexOf(h) !== -1 };
    });
  }
  function remoteCheck(task, flag, nick) {
    return apiPost({ action: "submit", nick: nick, token: getToken(nick), key: task.key, flag: flag });
  }

  /* ---------------------------------------------------------- шапка */
  function renderNavTools() {
    var host = $("nav-tools");
    if (!host) return;
    var nick = getNick();
    host.textContent = "";
    if (!nick) return;
    host.appendChild(el("span", { class: "isk-label isk-label--raw", text: "NICK: " + nick }));
    host.appendChild(el("span", { class: "isk-label isk-label--accent", id: "nav-points", text: "БАЛИ: " + totalPoints(nick) }));
    host.appendChild(el("a", { class: "isk-btn isk-btn--ghost", href: "index.html?change=1", text: "Змінити" }));
  }
  function requireNick() {
    var n = getNick();
    if (!n) { window.location.replace("index.html"); return null; }
    return n;
  }

  /* ---------------------------------------------------------- головна */
  function initIndex() {
    var form = $("nick-form"), input = $("nick"), err = $("nick-error"), cont = $("continue");
    var cur = getNick();
    var change = /[?&]change=1/.test(window.location.search);
    if (cur) {
      input.value = cur;
      if (!change) {
        cont.hidden = false;
        $("continue-nick").textContent = cur;
      }
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!NICK_RE.test(v)) {
        err.textContent = "[ ПОМИЛКА ] 3–20 символів: літери, цифри, _ . -. Без пробілів.";
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      function enter() { lsSet("kpi_nick", v); window.location.href = "modules.html"; }
      if (!C.API_URL) { enter(); return; }
      var sb = form.querySelector("button[type=submit]");
      sb.disabled = true;
      err.textContent = "[ ПЕРЕВІРКА НІКНЕЙМУ… ]";
      apiPost({ action: "register", nick: v, token: getToken(v) }).then(function (r) {
        sb.disabled = false;
        if (r && r.ok) { err.textContent = ""; enter(); return; }
        input.setAttribute("aria-invalid", "true");
        err.textContent = r && r.error === "taken"
          ? "[ ПОМИЛКА ] Цей нікнейм уже зайнятий. Оберіть інший."
          : r && r.error === "slow_down" ? "[ ЗАЧЕКАЙТЕ ] Спробуйте ще раз за кілька секунд."
          : "[ ПОМИЛКА ] Не вдалося зареєструвати нікнейм.";
        input.focus();
      }).catch(function () {
        sb.disabled = false;
        err.textContent = "[ ПОМИЛКА ] Немає зв'язку із сервером. Спробуйте ще раз.";
      });
    });
    input.addEventListener("input", function () {
      err.textContent = "";
      input.removeAttribute("aria-invalid");
    });
  }

  /* ---------------------------------------------------------- блоки */
  function initModules() {
    var nick = requireNick();
    if (!nick) return;
    var prog = getProgress(nick);
    var grid = $("modules");
    var allTotal = 0, allDone = 0;
    DATA.modules.forEach(function (m) {
      var total = m.tasks.length;
      var done = m.tasks.filter(function (t) { return prog[t.key]; }).length;
      allTotal += total; allDone += done;
      var live = total > 0;
      var visual = el("div", { class: "isk-card__visual" });
      visual.innerHTML = ICONS[m.icon] || "";
      var kids = [
        visual,
        el("div", { class: "tags" }, [
          el("span", { class: "isk-label isk-label--accent", text: m.tag }),
          el("span", { class: "isk-label", text: live ? "ЗАВДАНЬ: " + pad(total) : "СКОРО" })
        ]),
        el("h3", { class: "isk-card__title", text: m.title }),
        el("p", { class: "isk-card__desc", text: m.desc }),
        el("div", { class: "isk-card__meta", text: live ? "Прогрес: " + done + "/" + total : "Завдання з'являться найближчим часом" })
      ];
      var card = live
        ? el("a", { class: "isk-card", href: "module.html?id=" + encodeURIComponent(m.id) }, kids)
        : el("div", { class: "isk-card module--soon", "aria-disabled": "true" }, kids);
      grid.appendChild(card);
    });
    $("overall").textContent = "[ ПРОГРЕС: " + allDone + "/" + allTotal + " ]";
    var maxPts = 0;
    DATA.modules.forEach(function (m) { m.tasks.forEach(function (t) { maxPts += t.points; }); });
    $("overall-pts").textContent = "[ БАЛИ: " + totalPoints(nick) + "/" + maxPts + " ]";
    $("overall-fill").style.width = (maxPts ? Math.round(totalPoints(nick) / maxPts * 100) : 0) + "%";
  }

  /* ---------------------------------------------------------- сторінка блока */
  function initModule() {
    var nick = requireNick();
    if (!nick) return;
    var id = (new URLSearchParams(window.location.search)).get("id");
    var mod = DATA.modules.filter(function (m) { return m.id === id; })[0];
    var root = $("module-root");

    if (!mod || !mod.tasks.length) {
      document.title = "Блок недоступний — InfoSec KPI";
      root.appendChild(el("div", { class: "isk-empty" }, [
        el("p", { class: "isk-empty__code", text: "{ no tasks yet }" }),
        el("h1", { class: "isk-card__title", text: "Цей блок ще порожній" }),
        el("p", { class: "help", text: "Завдання з'являться найближчим часом." }),
        el("a", { class: "isk-btn isk-btn--secondary", href: "modules.html", text: "До блоків" })
      ]));
      return;
    }

    document.title = mod.title + " — InfoSec KPI";
    var prog = getProgress(nick);

    root.appendChild(el("p", { class: "crumbs" }, [
      el("a", { href: "modules.html", text: "Блоки" }), " / " + mod.title
    ]));
    root.appendChild(el("p", { class: "eyebrow", text: "[ БЛОК: " + mod.tag + (mod.caseName ? " · СПРАВА: " + mod.caseName : "") + " ]" }));
    root.appendChild(el("h1", { class: "h1", text: mod.title }));

    var stack = el("div", { class: "stack" });
    root.appendChild(stack);

    if (mod.story) {
      stack.appendChild(el("section", { class: "isk-card story", "aria-label": "Легенда" },
        [el("span", { class: "isk-label isk-label--bare", text: "[ ЛЕГЕНДА ]" })].concat(
          mod.story.map(function (p) { return el("p", { text: p }); }))));
    }
    if (mod.intro) {
      var introKids = [el("span", { class: "isk-label isk-label--bare", text: "[ ПРО БЛОК ]" })];
      mod.intro.forEach(function (p) { introKids.push(el("p", { text: p })); });
      if (mod.resources && mod.resources.length) introKids.push(linkRow(mod.resources));
      stack.appendChild(el("section", { class: "isk-card story", "aria-label": "Про блок" }, introKids));
    }
    function fileRows(list) {
      var box = el("div", { class: "files" });
      list.forEach(function (f) {
        box.appendChild(el("div", { class: "file" }, [
          el("span", { class: "file__name", text: f.name }),
          f.size ? el("span", { class: "isk-label", text: f.size }) : null,
          el("a", { class: "isk-btn isk-btn--secondary", href: f.path, download: f.name }, [
            "Завантажити ", el("span", { class: "isk-btn__arrow", text: "↓" })
          ])
        ]));
        if (f.sha256) box.appendChild(el("p", { class: "hash", text: "SHA-256: " + f.sha256 }));
      });
      return box;
    }
    function linkRow(list) {
      return el("div", { class: "links" }, list.map(function (l) {
        return el("a", { class: "link-chip", href: l.url, target: "_blank", rel: "noopener noreferrer" }, [
          l.label, el("span", { "aria-hidden": "true", text: "↗" })
        ]);
      }));
    }
    function codeBlock(label, text) {
      var btn = el("button", { class: "isk-btn isk-btn--ghost", type: "button", text: "Копіювати" });
      btn.addEventListener("click", function () {
        function done() { btn.textContent = "Скопійовано"; setTimeout(function () { btn.textContent = "Копіювати"; }, 1500); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
        else {
          var ta = el("textarea", { style: "position:fixed;opacity:0" }); ta.value = text;
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
      return el("div", { class: "codebox" }, [
        el("div", { class: "codebox__head" }, [el("span", { class: "isk-label isk-label--bare", text: "[ " + label.toUpperCase() + " ]" }), btn]),
        el("pre", { class: "codebox__pre", tabindex: "0", text: text })
      ]);
    }
    if (mod.files && mod.files.length) {
      var files = fileRows(mod.files);
      stack.appendChild(el("section", { class: "isk-card", "aria-label": "Матеріали" },
        [el("span", { class: "isk-label isk-label--bare", text: "[ МАТЕРІАЛИ ]" }), files]));
    }

    var fill = el("div", { class: "progress__fill" });
    var progText = el("span", { class: "isk-label isk-label--bare" });
    stack.appendChild(el("div", { class: "progress", role: "group", "aria-label": "Прогрес блоку" }, [
      progText, el("div", { class: "progress__bar" }, [fill])
    ]));

    function refreshProgress() {
      var p = getProgress(nick);
      var done = mod.tasks.filter(function (t) { return p[t.key]; }).length;
      progText.textContent = "[ ПРОГРЕС: " + done + "/" + mod.tasks.length + " ]";
      fill.style.width = Math.round(done / mod.tasks.length * 100) + "%";
      var np = $("nav-points");
      if (np) np.textContent = "БАЛИ: " + totalPoints(nick);
    }

    mod.tasks.forEach(function (task, i) {
      var inputId = "flag-" + i;
      var badge = el("span", { class: "isk-label", text: "ОЧКИ: " + task.points });
      var input = el("input", {
        class: "input", id: inputId, type: "text", name: "flag", placeholder: task.placeholder,
        autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-describedby": inputId + "-fb"
      });
      var btn = el("button", { class: "isk-btn isk-btn--primary", type: "submit" }, [
        "Надіслати ", el("span", { class: "isk-btn__arrow", text: "→" })
      ]);
      var fb = el("p", { class: "fb", id: inputId + "-fb", role: "status", "aria-live": "polite" });
      var card = el("article", { class: "task", "data-solved": "false" });
      var last = 0;

      function setFb(kind, msg) {
        fb.className = "fb" + (kind === "ok" ? " fb--ok" : kind === "bad" ? " fb--bad" : "");
        fb.textContent = msg;
      }
      function showSolved(rec) {
        card.setAttribute("data-solved", "true");
        input.value = rec.f || "";
        input.disabled = true;
        btn.disabled = true;
        btn.textContent = "Зараховано";
        badge.className = "isk-label isk-label--accent";
        badge.textContent = "ЗАРАХОВАНО · +" + rec.pts;
        setFb("ok", "[ ВІРНО ] Прапор прийнято.");
      }

      var form = el("form", { novalidate: "novalidate", onsubmit: function (e) {
        e.preventDefault();
        var flag = input.value.trim();
        var pre = task.prefix || "kpi";
        if (flag.slice(0, pre.length + 1).toLowerCase() !== (pre + "{").toLowerCase() || flag.slice(-1) !== "}" || flag.length < pre.length + 3) {
          setFb("bad", "[ ФОРМАТ ] Прапор має вигляд " + pre + "{...}"); input.focus(); return;
        }
        var now = Date.now();
        if (now - last < 2000) { setFb("", "[ ЗАЧЕКАЙТЕ ] Наступна спроба — за кілька секунд."); return; }
        last = now;
        btn.disabled = true;
        setFb("", "[ ПЕРЕВІРКА… ]");
        var check = C.API_URL ? remoteCheck(task, flag, nick) : localCheck(task, flag);
        Promise.resolve(check).then(function (r) {
          if (r && r.ok) {
            var p = getProgress(nick);
            p[task.key] = { t: Date.now(), pts: Number(r.points) || task.points, f: flag };
            saveProgress(nick, p);
            showSolved(p[task.key]);
            refreshProgress();
          } else {
            btn.disabled = false;
            var er = r && r.error;
            if (er === "slow_down") { setFb("", "[ ЗАЧЕКАЙТЕ ] Забагато спроб поспіль."); return; }
            if (er === "not_registered") { setFb("bad", "[ НІКНЕЙМ ] Поверніться на головну («Змінити») і введіть нікнейм ще раз."); return; }
            if (er === "frozen") { setFb("bad", "[ ЗАКРИТО ] Прийом прапорів зупинено."); return; }
            setFb("bad", "[ НЕВІРНО ] Це не той прапор. Спробуйте ще раз.");
            input.select();
          }
        }).catch(function () {
          btn.disabled = false;
          setFb("bad", "[ ПОМИЛКА ] Не вдалося перевірити. Спробуйте ще раз.");
        });
      } }, [
        el("label", { class: "field-label", for: inputId, text: "Прапор" }),
        el("div", { class: "row" }, [input, btn])
      ]);

      var links = linkRow(task.links || []);

      [
        el("div", { class: "task__head" }, [
          el("span", { class: "isk-label isk-label--bare", text: "[ ЗАВДАННЯ " + pad(i + 1) + " ]" }), badge
        ]),
        el("h2", { class: "task__title", text: task.title }),
        el("p", { class: "task__text", text: task.text }),
        task.code ? codeBlock(task.codeLabel || "Дані", task.code) : null,
        task.files && task.files.length ? fileRows(task.files) : null,
        task.hints && task.hints.length ? el("div", { class: "hints" }, task.hints.map(function (h) {
          return el("details", {}, [el("summary", { text: h.title }), el("p", { text: h.text })]);
        })) : null,
        task.links && task.links.length ? links : null,
        form,
        fb
      ].forEach(function (n) { if (n) card.appendChild(n); });

      stack.appendChild(card);
      if (prog[task.key]) showSolved(prog[task.key]);
    });
    refreshProgress();
  }

  /* ---------------------------------------------------------- старт */
  renderNavTools();
  if (page === "index") initIndex();
  else if (page === "modules") initModules();
  else if (page === "module") initModule();
})();
