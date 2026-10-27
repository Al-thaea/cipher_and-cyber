/* Лідерборд. Дані: GET API_URL?action=board -> {rows:[{nick,points,solved:[key],last}]}.
   Без API_URL показує лише вас (локальний режим). ?tv=1 — великий шрифт для проєктора, ?demo=1 — вигадані дані. */
(function () {
  "use strict";
  if (document.body.getAttribute("data-page") !== "leaderboard") return;
  var C = window.KPI_CONFIG || {}, DATA = window.KPI_DATA, q = new URLSearchParams(location.search);
  var POLL = 5000;
  if (q.get("tv")) document.body.classList.add("tv");

  function $(id) { return document.getElementById(id); }
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "class") n.className = props[k]; else if (k === "text") n.textContent = props[k];
      else if (props[k] !== false && props[k] != null) n.setAttribute(k, props[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function mine() { try { return window.localStorage.getItem("kpi_nick"); } catch (e) { return null; } }

  var tasks = [], maxPts = 0;
  DATA.modules.forEach(function (m) {
    m.tasks.forEach(function (t, i) { tasks.push({ key: t.key, pts: t.points, first: i === 0 && tasks.length > 0 }); maxPts += t.points; });
  });
  $("lb-total").textContent = "[ ЗАВДАНЬ: " + tasks.length + " · МАКС. БАЛІВ: " + maxPts + " ]";
  var leg = $("lb-legend");
  DATA.modules.forEach(function (m) { if (m.tasks.length) leg.appendChild(el("span", { text: m.tag + " · " + m.tasks.length })); });

  function localRows() {
    var n = mine(); if (!n) return [];
    var p = {}; try { p = JSON.parse(window.localStorage.getItem("kpi_progress:" + n) || "{}"); } catch (e) {}
    var keys = Object.keys(p), pts = 0, last = 0;
    keys.forEach(function (k) { pts += Number(p[k].pts) || 0; last = Math.max(last, p[k].t || 0); });
    return [{ nick: n, points: pts, solved: keys, last: last }];
  }
  function demoRows() {
    var names = ["кіберкіт_01", "root_cat", "nullbyte", "xor_fox", "base64_bee", "sql_snail", "packet_owl", "hash_hare"];
    var now = Date.now();
    return names.map(function (n, i) {
      var k = Math.max(0, tasks.length - 1 - i * 2 + (i % 3));
      var s = tasks.slice(0, k).map(function (t) { return t.key; });
      if (i % 2) s = s.filter(function (_, j) { return j % 4 !== 3; });
      var pts = 0; tasks.forEach(function (t) { if (s.indexOf(t.key) !== -1) pts += t.pts; });
      return { nick: n, points: pts, solved: s, last: now - i * 60000 };
    });
  }

  var lastSig = "";
  function render(rows, me) {
    rows = rows.slice().sort(function (a, b) { return b.points - a.points || (a.last || 0) - (b.last || 0); });
    var sig = JSON.stringify(rows) + me;
    if (sig === lastSig) return;
    lastSig = sig;
    var list = $("lb"); list.textContent = "";
    if (!rows.length) { list.appendChild(el("li", { class: "lb-empty", text: "{ поки що ніхто не здав прапор }" })); return; }
    rows.forEach(function (r, i) {
      var segs = el("div", { class: "segs", role: "img", "aria-label": "Розв'язано " + r.solved.length + " з " + tasks.length }, []);
      tasks.forEach(function (t) {
        if (t.first) segs.appendChild(el("span", { class: "seg-gap" }));
        segs.appendChild(el("span", { class: "seg" + (r.solved.indexOf(t.key) !== -1 ? " seg--on" : "") }));
      });
      var cls = "lb__row" + (i < 3 ? " lb__row--top" : "") + (me && r.nick === me ? " lb__row--me" : "");
      list.appendChild(el("li", { class: cls }, [
        el("span", { class: "lb__rank", text: String(i + 1).padStart(2, "0") }),
        el("span", { class: "lb__nick", text: r.nick, title: r.nick }),
        segs,
        el("span", { class: "lb__pts" }, [String(r.points), el("small", { text: r.solved.length + "/" + tasks.length })])
      ]));
    });
  }

  function setStatus(t, bad) { var s = $("lb-status"); s.textContent = t; s.className = "lb-status" + (bad ? " lb-status--bad" : ""); }
  function clock() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2); }

  function tick() {
    var me = mine();
    if (q.get("demo")) { render(demoRows(), me); setStatus("[ ДЕМО-ДАНІ ]"); return; }
    if (!C.API_URL) { render(localRows(), me); setStatus("[ ЛОКАЛЬНИЙ РЕЖИМ · показано лише ваш прогрес ]"); return; }
    fetch(C.API_URL + (C.API_URL.indexOf("?") < 0 ? "?" : "&") + "action=board&t=" + Date.now())
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { render(d.rows || [], me); setStatus("[ ОНОВЛЕНО " + clock() + " · кожні " + POLL / 1000 + " с ]"); })
      .catch(function () { setStatus("[ НЕМАЄ ЗВ'ЯЗКУ · повторюю… ]", true); });
  }
  tick();
  setInterval(function () { if (!document.hidden) tick(); }, POLL);
})();
