/*
 * Aurora Analytics — the dashboard's sample data. Nothing here is real; it is
 * generated from a fixed seed so every load of a given range looks the same.
 */
(function () {
  "use strict";

  var C = window.Charts;
  var el = window.AppShell.el;

  function kpi(label, value, delta, goodWhenUp) {
    var up = delta >= 0;
    var good = up === goodWhenUp;
    var tile = document.createElement("div");
    tile.className = "card kpi";
    var l = document.createElement("div");
    l.className = "kpi-label";
    l.textContent = label;
    var v = document.createElement("div");
    v.className = "kpi-value";
    v.textContent = value;
    var d = document.createElement("div");
    d.className = "kpi-delta " + (good ? "good" : "bad");
    d.textContent = (up ? "▲ " : "▼ ") + Math.abs(delta).toFixed(1) + "% vs previous period";
    tile.appendChild(l);
    tile.appendChild(v);
    tile.appendChild(d);
    return tile;
  }

  function render(range) {
    window.Dashboard.range = range;
    var rand = C.seeded(1000 + range);
    var days = C.lastDays(range);

    var sessions = days.map(function (d, i) {
      var weekly = d.getDay() === 0 || d.getDay() === 6 ? 0.72 : 1;
      var trend = 1 + i / (range * 3);
      return { label: C.shortDate(d), value: Math.round(4200 * weekly * trend * (0.88 + rand() * 0.24)) };
    });
    var total = sessions.reduce(function (s, d) { return s + d.value; }, 0);

    var kpis = el("kpis");
    kpis.textContent = "";
    kpis.appendChild(kpi("Active users", C.compact(Math.round(total * 0.41)), 8.4 + rand() * 4, true));
    kpis.appendChild(kpi("Sessions", C.compact(total), 5.1 + rand() * 3, true));
    kpis.appendChild(kpi("Conversion rate", (3.2 + rand()).toFixed(2) + "%", -0.6 - rand(), true));
    kpis.appendChild(kpi("Avg. session", "4m " + Math.round(10 + rand() * 40) + "s", 2.3 + rand() * 2, true));

    C.line(el("chart-sessions"), sessions, {
      label: "Sessions per day over the last " + range + " days",
      format: function (v) { return C.compact(Math.round(v)); },
    });

    var channels = [
      ["Organic search", 0.34],
      ["Direct", 0.24],
      ["Referral", 0.16],
      ["Paid search", 0.12],
      ["Email", 0.09],
      ["Social", 0.05],
    ].map(function (c) {
      var value = Math.round(total * c[1] * (0.9 + rand() * 0.2));
      return { label: c[0], value: value, detail: C.compact(value) + " sessions" };
    });
    C.bars(el("chart-channels"), channels, { format: C.compact });

    var pages = ["/pricing", "/", "/docs/getting-started", "/blog/q3-release", "/integrations", "/customers", "/signup"];
    var tbody = el("top-pages");
    tbody.textContent = "";
    pages.forEach(function (path, i) {
      var tr = document.createElement("tr");
      [
        path,
        C.compact(Math.round((total / (i + 2)) * (0.8 + rand() * 0.3))),
        Math.floor(1 + rand() * 4) + "m " + String(Math.floor(rand() * 60)).padStart(2, "0") + "s",
        Math.round(22 + rand() * 40) + "%",
      ].forEach(function (text, col) {
        var td = document.createElement("td");
        td.textContent = text;
        if (col) td.className = "num";
        else td.className = "mono";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  window.Dashboard = { render: render, range: 30 };
})();
