// Lightweight sortable tables — click column header to sort asc/desc.
// Numeric detection: header has data-numeric, or all cells in column parse as number.
(function () {
  function parseNum(s) {
    if (s == null) return NaN;
    const t = String(s).replace(/[\s ]/g, "").replace(/[%€$]/g, "").replace(",", ".");
    const m = t.match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  }

  function isNumericCol(rows, idx) {
    let n = 0, ok = 0;
    rows.forEach(r => {
      const c = r.cells[idx];
      if (!c) return;
      n++;
      if (!isNaN(parseNum(c.textContent))) ok++;
    });
    return n > 0 && ok / n >= 0.7;
  }

  function makeSortable(table) {
    const thead = table.tHead;
    if (!thead) return;
    const headerRow = thead.rows[0];
    if (!headerRow) return;
    const tbody = table.tBodies[0];
    if (!tbody) return;

    Array.from(headerRow.cells).forEach((th, idx) => {
      th.style.cursor = "pointer";
      th.style.userSelect = "none";
      th.style.position = "relative";
      th.style.paddingRight = "22px";
      const arrow = document.createElement("span");
      arrow.style.cssText = "position:absolute;right:8px;opacity:0.5;font-size:10px;";
      arrow.textContent = "↕";
      th.appendChild(arrow);
      th.dataset.sortDir = "none";

      th.addEventListener("click", () => {
        const rows = Array.from(tbody.rows);
        const numeric = th.dataset.numeric === "true" || isNumericCol(rows, idx);
        const currentDir = th.dataset.sortDir;
        const newDir = currentDir === "asc" ? "desc" : "asc";

        Array.from(headerRow.cells).forEach(h => {
          h.dataset.sortDir = "none";
          const a = h.querySelector("span");
          if (a) { a.textContent = "↕"; a.style.opacity = "0.5"; }
        });

        rows.sort((a, b) => {
          const av = a.cells[idx] ? a.cells[idx].textContent.trim() : "";
          const bv = b.cells[idx] ? b.cells[idx].textContent.trim() : "";
          let cmp;
          if (numeric) {
            const an = parseNum(av), bn = parseNum(bv);
            if (isNaN(an) && isNaN(bn)) cmp = 0;
            else if (isNaN(an)) cmp = 1;
            else if (isNaN(bn)) cmp = -1;
            else cmp = an - bn;
          } else {
            cmp = av.localeCompare(bv, "cs");
          }
          return newDir === "asc" ? cmp : -cmp;
        });

        rows.forEach(r => tbody.appendChild(r));
        th.dataset.sortDir = newDir;
        arrow.textContent = newDir === "asc" ? "▲" : "▼";
        arrow.style.opacity = "1";
      });
    });
  }

  function init() {
    document.querySelectorAll("table").forEach(makeSortable);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
