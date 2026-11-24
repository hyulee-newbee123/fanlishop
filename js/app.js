(function () {
  const ITEMS = window.ITEMS;
  const CATEGORIES = window.CATEGORIES;
  const L = window.ShopLogic;
  const KEY = "fanli-shop-v1";
  const numberFormat = new Intl.NumberFormat("zh-CN");
  const format = (value) => numberFormat.format(value);

  const itemById = Object.fromEntries(ITEMS.map((item) => [item.id, item]));
  const state = {
    asset: null,
    qty: {},
    category: "all",
    query: "",
    onlySelected: false,
  };
  const detailOpen = new Set();

  const desk = window.matchMedia("(min-width: 1100px)");
  let toastTimer = 0;
  let undoQty = null;
  let lastDeny = 0;
  let returnFocus = null;

  const $ = (sel) => document.querySelector(sel);

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]));
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ asset: state.asset, qty: state.qty }));
    } catch (err) {
      /* private mode */
    }
  }

  function sameQty(a, b) {
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const key of keys) {
      if ((+a[key] || 0) !== (+b[key] || 0)) return false;
    }
    return true;
  }

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || typeof raw.asset !== "number" || !Number.isSafeInteger(raw.asset)) return false;
      if (raw.asset < 0 || raw.asset > L.ASSET_CAP) return false;
      const qty = raw.qty && typeof raw.qty === "object" ? raw.qty : {};
      const repaired = L.repair(ITEMS, raw.asset, qty);
      state.asset = raw.asset;
      state.qty = repaired;
      const trimmed = !sameQty(qty, repaired);
      if (trimmed) persist();
      return trimmed;
    } catch (err) {
      return false;
    }
  }

  function validateAsset(raw, minSpent) {
    if (String(raw).trim() === "") return { ok: false, message: "请填写点券数量。" };
    const n = L.parseAmount(raw);
    if (n == null) return { ok: false, message: "只填写数字，不要带小数。" };
    if (n > L.ASSET_CAP) return { ok: false, message: "最多 99,999,999。" };
    if (n < minSpent) {
      return { ok: false, message: `已花费 ${format(minSpent)}，资产不能比这个少。` };
    }
    return { ok: true, value: n };
  }

  function spentNow() {
    return L.totals(ITEMS, state.asset || 0, state.qty).spent;
  }

  function rowFlags(item) {
    const q = state.qty[item.id] || 0;
    const max = L.maxQty(ITEMS, item, state.asset, state.qty);
    let tag = "";
    if (q > 0 && q >= max && item.limit != null && q >= item.limit) tag = "已到限购";
    else if (q > 0 && q >= max) tag = "再加就超支";
    return { q, max, tag };
  }

  function visibleItems() {
    const query = state.query.trim().toLowerCase();
    return ITEMS.filter((item) => {
      if (state.category !== "all" && item.category !== state.category) return false;
      if (state.onlySelected && !(state.qty[item.id] > 0)) return false;
      if (query && !item.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }

  function emptyMessage() {
    if (state.query.trim()) return "没有找到这个名字。";
    if (state.onlySelected) return "还没有已选商品。";
    return "这个分类里没有商品。";
  }

  function countCat(id) {
    if (id === "all") return ITEMS.length;
    return ITEMS.filter((item) => item.category === id).length;
  }

  function renderCats() {
    $("#cats").innerHTML = CATEGORIES.map((cat) => {
      const pressed = cat.id === state.category ? "true" : "false";
      return `<button type="button" class="cat" data-cat="${cat.id}" aria-pressed="${pressed}">${esc(cat.label)} <em>${countCat(cat.id)}</em></button>`;
    }).join("");
  }

  function detailMarkup(item) {
    if (!item.detail) return { name: `<span class="name-text">${esc(item.name)}</span>`, panel: "" };
    const open = detailOpen.has(item.id);
    const stats = item.detail.stats.map((line) => `<li>${esc(line)}</li>`).join("");
    const effect = item.detail.effect ? `<p class="item-effect">${esc(item.detail.effect)}</p>` : "";
    const uncertain = item.detail.uncertain ? " is-uncertain" : "";
    return {
      name: `<button type="button" class="name-toggle" data-act="stats" data-id="${item.id}" aria-expanded="${open ? "true" : "false"}" aria-controls="stats-${item.id}">
        <span class="name-caret" aria-hidden="true"></span>
        <span class="name-text">${esc(item.name)}</span>
      </button>`,
      panel: `<div class="item-stats${uncertain}" id="stats-${item.id}" ${open ? "" : "hidden"}>
        <ul>${stats}</ul>
        ${effect}
      </div>`,
    };
  }

  function rowTemplate(item) {
    const maxBtn = item.limit == null || item.limit > 1
      ? `<button type="button" class="max-btn" data-act="max" data-id="${item.id}">买满</button>`
      : `<span class="max-btn max-btn-slot" aria-hidden="true">买满</span>`;
    const limitText = item.limit == null ? "不限购" : format(item.limit);
    const detail = detailMarkup(item);
    const open = detailOpen.has(item.id) ? " is-open" : "";
    return `<article class="item cols${open}" data-id="${item.id}">
      <div class="item-name">${detail.name}<span class="tag"></span></div>
      <div class="item-price">${format(item.price)}</div>
      <div class="item-limit">${limitText}</div>
      <div class="item-step">
        <div class="stepper">
          <button type="button" data-act="dec" data-id="${item.id}" aria-label="减少 ${esc(item.name)}">−</button>
          <input class="qty" data-id="${item.id}" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="${esc(item.name)} 数量" value="0" />
          <button type="button" data-act="inc" data-id="${item.id}" aria-label="增加 ${esc(item.name)}">+</button>
        </div>
        ${maxBtn}
      </div>
      <div class="item-sub">0</div>
      ${detail.panel}
    </article>`;
  }

  function updateRow(id) {
    const row = document.querySelector(`.item[data-id="${CSS.escape(id)}"]`);
    if (!row) return;
    const item = itemById[id];
    const flags = rowFlags(item);
    const input = row.querySelector(".qty");
    const editing = document.activeElement === input;
    const parsed = L.parseAmount(input.value);
    const keep = editing && (parsed === flags.q || (input.value.trim() === "" && flags.q === 0));
    if (!keep) input.value = String(flags.q);
    input.setAttribute("aria-valuemin", "0");
    input.setAttribute("aria-valuemax", String(flags.max));
    input.setAttribute("aria-valuenow", String(flags.q));
    const dec = row.querySelector("[data-act='dec']");
    const inc = row.querySelector("[data-act='inc']");
    const locked = flags.q >= flags.max;
    dec.disabled = flags.q <= 0;
    inc.classList.toggle("is-locked", locked);
    inc.setAttribute("aria-disabled", locked ? "true" : "false");
    dec.title = flags.q <= 0 ? "数量已经是 0" : "减少一件";
    if (!locked) inc.title = "增加一件";
    else if (item.limit != null && flags.q >= item.limit) inc.title = "已到限购上限";
    else inc.title = "余额不足";
    const maxBtn = row.querySelector("[data-act='max']");
    if (maxBtn) maxBtn.disabled = flags.q >= flags.max;
    const sub = row.querySelector(".item-sub");
    sub.textContent = format(flags.q * item.price);
    sub.classList.toggle("is-zero", flags.q === 0);
    row.classList.toggle("is-picked", flags.q > 0);
    row.classList.toggle("is-out", flags.q === 0 && flags.max === 0);
    row.querySelector(".tag").textContent = flags.tag;
  }

  function renderRows() {
    const list = visibleItems();
    const empty = $("#list-empty");
    if (list.length === 0) {
      $("#rows").innerHTML = "";
      empty.hidden = false;
      empty.textContent = emptyMessage();
    } else {
      empty.hidden = true;
      const showHeads = state.category === "all" && !state.query.trim() && !state.onlySelected;
      let lastCategory = "";
      $("#rows").innerHTML = list.map((item) => {
        let head = "";
        if (showHeads && item.category !== lastCategory) {
          lastCategory = item.category;
          const cat = CATEGORIES.find((entry) => entry.id === item.category);
          head = `<div class="group-head">${esc(cat ? cat.label : item.category)}</div>`;
        }
        return head + rowTemplate(item);
      }).join("");
      for (const item of list) updateRow(item.id);
    }
    $("#list-count").textContent = `列表 ${list.length} 件 / 共 ${ITEMS.length} 件`;
  }

  function usageLabel(spent) {
    if (!state.asset) return "已用 0%";
    const raw = (spent / state.asset) * 100;
    if (raw > 0 && raw < 1) return "已用 <1%";
    return `已用 ${Math.round(raw)}%`;
  }

  function renderBill(t) {
    $("#bill-meta").textContent = t.kinds === 0 ? "未选择" : `${t.kinds} 种 · ${format(t.pieces)} 件`;
    const picked = ITEMS.filter((item) => (state.qty[item.id] || 0) > 0);
    $("#bill-lines").innerHTML = picked.length === 0
      ? `<p class="empty">还没选商品。用加号调整数量，花费会算在这里。</p>`
      : picked.map((item) => {
        const q = state.qty[item.id];
        return `<div class="line">
          <div>
            <div class="line-name">${esc(item.name)}</div>
            <div class="line-meta">${format(item.price)} × ${format(q)}</div>
          </div>
          <div class="line-end">
            <strong>${format(item.price * q)}</strong>
            <button type="button" class="linkish" data-act="zero" data-id="${item.id}">移除</button>
          </div>
        </div>`;
      }).join("");
    $("#bill-total").textContent = format(t.spent);
    $("#bill-left").textContent = format(t.left);
    $("#bill-left").classList.toggle("is-empty", t.left === 0);
    $("#clear-btn").disabled = t.pieces === 0;
  }

  function syncOnlyButton(t) {
    const btn = $("#only-selected");
    btn.setAttribute("aria-pressed", state.onlySelected ? "true" : "false");
    btn.textContent = t.kinds > 0 ? `只看已选 (${t.kinds})` : "只看已选";
  }

  function updateTotals() {
    let t = L.totals(ITEMS, state.asset || 0, state.qty);
    if (t.left < 0) {
      state.qty = L.repair(ITEMS, state.asset, state.qty);
      persist();
      t = L.totals(ITEMS, state.asset, state.qty);
    }
    $("#s-asset").textContent = format(state.asset || 0);
    $("#s-spent").textContent = format(t.spent);
    $("#s-left").textContent = format(t.left);
    $("#s-pct").textContent = usageLabel(t.spent);
    const raw = state.asset > 0 ? (t.spent / state.asset) * 100 : 0;
    $("#s-bar").style.width = `${Math.min(100, raw)}%`;
    $("#status").classList.toggle("is-empty", t.left === 0);
    $("#status").classList.toggle("is-low", t.left > 0 && state.asset > 0 && t.left * 10 <= state.asset);
    $("#live").textContent = `本次花费 ${format(t.spent)}，剩余 ${format(t.left)}`;
    renderBill(t);
    syncOnlyButton(t);
    return t;
  }

  function showShop() {
    $("#gate").hidden = true;
    $("#shop").hidden = false;
    renderRows();
    updateTotals();
    syncSticky();
  }

  function syncGate() {
    const raw = $("#asset").value;
    const result = validateAsset(raw, 0);
    const showError = raw.trim() !== "" && !result.ok;
    $("#gate-error").hidden = !showError;
    if (showError) $("#gate-error").textContent = result.message;
    $("#enter").disabled = !result.ok;
  }

  function syncModal() {
    const spent = spentNow();
    $("#asset-help").textContent = spent > 0
      ? `当前已花费 ${format(spent)}。新的点券不能少于此数。`
      : "改成你现在实际有的点券。";
    const raw = $("#asset-edit").value;
    const result = validateAsset(raw, spent);
    const showError = raw.trim() !== "" && !result.ok;
    $("#asset-error").hidden = !showError;
    if (showError) $("#asset-error").textContent = result.message;
    $("#asset-save").disabled = !result.ok;
    $("#modal-clear").hidden = spent === 0;
  }

  function openModal() {
    returnFocus = document.activeElement;
    $("#asset-edit").value = state.asset == null ? "" : String(state.asset);
    syncModal();
    $("#modal").hidden = false;
    document.body.classList.add("modal-open");
    $("#asset-edit").focus();
    $("#asset-edit").select();
  }

  function closeModal() {
    $("#modal").hidden = true;
    document.body.classList.remove("modal-open");
    if (returnFocus && returnFocus.focus) returnFocus.focus();
  }

  function syncSticky() {
    const status = $("#status");
    if (!status) return;
    document.documentElement.style.setProperty("--status-h", status.offsetHeight + "px");
  }

  function hideToast() {
    $("#toast").hidden = true;
    clearTimeout(toastTimer);
    syncSticky();
  }

  function showToast(message, withUndo) {
    $("#toast-text").textContent = message;
    $("#toast-undo").hidden = !withUndo;
    $("#toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, withUndo ? 5000 : 1800);
    syncSticky();
  }

  function deny(message) {
    const now = Date.now();
    const fig = $("#left-fig");
    fig.classList.remove("is-deny");
    void fig.offsetWidth;
    fig.classList.add("is-deny");
    const showing = !$("#toast").hidden && $("#toast-text").textContent === message;
    if (showing && now - lastDeny < 700) return;
    lastDeny = now;
    showToast(message, false);
  }

  function setQty(id, requested) {
    const item = itemById[id];
    if (!item || state.asset == null) return;
    const current = state.qty[id] || 0;
    const reason = L.blockReason(ITEMS, item, requested, state.asset, state.qty);
    const next = L.clampQty(ITEMS, item, requested, state.asset, state.qty);
    if (next !== current) {
      if (undoQty) hideToast();
      undoQty = null;
    }
    if (next > 0) state.qty[id] = next;
    else delete state.qty[id];
    persist();
    if (state.onlySelected && next === 0 && current !== next) renderRows();
    else document.querySelectorAll("#rows .item").forEach((row) => updateRow(row.dataset.id));
    updateTotals();
    if (reason && requested > current) {
      deny(reason === "limit" ? "这件已经到限购上限。" : "剩余点券不够，不能再加。");
    }
  }

  function clearSelection() {
    if (L.totals(ITEMS, state.asset || 0, state.qty).pieces === 0) return;
    undoQty = { ...state.qty };
    state.qty = {};
    state.onlySelected = false;
    persist();
    renderRows();
    updateTotals();
    if (!$("#modal").hidden) syncModal();
    showToast("已清空已选商品", true);
  }

  function undoClear() {
    if (!undoQty) return;
    state.qty = L.repair(ITEMS, state.asset, undoQty);
    undoQty = null;
    persist();
    renderRows();
    updateTotals();
    if (!$("#modal").hidden) syncModal();
    hideToast();
  }

  function onQtyInput(input) {
    const id = input.dataset.id;
    if (input.value.trim() === "") {
      setQty(id, 0);
      return;
    }
    const n = L.parseAmount(input.value);
    if (n == null) return;
    setQty(id, n);
  }

  function bind() {
    $("#gate-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const result = validateAsset($("#asset").value, 0);
      if (!result.ok) {
        syncGate();
        return;
      }
      state.asset = result.value;
      state.qty = {};
      persist();
      showShop();
    });
    $("#asset").addEventListener("input", syncGate);

    $("#edit-asset").addEventListener("click", openModal);
    $("#modal-cancel").addEventListener("click", closeModal);
    $("#modal-backdrop").addEventListener("click", closeModal);
    $("#modal-clear").addEventListener("click", clearSelection);
    $("#asset-edit").addEventListener("input", syncModal);
    $("#asset-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const result = validateAsset($("#asset-edit").value, spentNow());
      if (!result.ok) {
        syncModal();
        return;
      }
      state.asset = result.value;
      persist();
      closeModal();
      renderRows();
      updateTotals();
    });

    $("#cats").addEventListener("click", (event) => {
      const btn = event.target.closest("[data-cat]");
      if (!btn) return;
      state.category = btn.dataset.cat;
      for (const el of $("#cats").querySelectorAll("[data-cat]")) {
        el.setAttribute("aria-pressed", el === btn ? "true" : "false");
      }
      renderRows();
    });

    $("#search").addEventListener("input", () => {
      state.query = $("#search").value;
      renderRows();
    });

    $("#only-selected").addEventListener("click", () => {
      state.onlySelected = !state.onlySelected;
      renderRows();
      updateTotals();
    });

    $("#clear-btn").addEventListener("click", clearSelection);
    $("#toast-undo").addEventListener("click", undoClear);

    function toggleDetail(id) {
      if (detailOpen.has(id)) detailOpen.delete(id);
      else detailOpen.add(id);
      const row = document.querySelector(`.item[data-id="${CSS.escape(id)}"]`);
      if (!row) return;
      const open = detailOpen.has(id);
      row.classList.toggle("is-open", open);
      const panel = row.querySelector(".item-stats");
      const toggle = row.querySelector("[data-act='stats']");
      if (panel) panel.hidden = !open;
      if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    document.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-act]");
      if (!btn || btn.disabled) return;
      const id = btn.dataset.id;
      if (btn.dataset.act === "stats") {
        toggleDetail(id);
        return;
      }
      const item = itemById[id];
      if (!item) return;
      const current = state.qty[id] || 0;
      if (btn.dataset.act === "inc") setQty(id, current + 1);
      else if (btn.dataset.act === "dec") setQty(id, current - 1);
      else if (btn.dataset.act === "max") setQty(id, L.maxQty(ITEMS, item, state.asset, state.qty));
      else if (btn.dataset.act === "zero") setQty(id, 0);
    });

    $("#rows").addEventListener("input", (event) => {
      if (event.target.classList.contains("qty")) onQtyInput(event.target);
    });
    $("#rows").addEventListener("focusout", (event) => {
      if (!event.target.classList.contains("qty")) return;
      event.target.value = String(state.qty[event.target.dataset.id] || 0);
    });
    $("#rows").addEventListener("keydown", (event) => {
      if (!event.target.classList.contains("qty")) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      const id = event.target.dataset.id;
      const current = state.qty[id] || 0;
      setQty(id, event.key === "ArrowUp" ? current + 1 : current - 1);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !$("#modal").hidden) {
        event.preventDefault();
        closeModal();
      }
    });

    $("#bill-details").querySelector("summary").addEventListener("click", (event) => {
      if (desk.matches) event.preventDefault();
    });
    desk.addEventListener("change", () => {
      if (desk.matches) $("#bill-details").open = true;
      syncSticky();
    });
    window.addEventListener("resize", syncSticky);
  }

  function boot() {
    if (!ITEMS || !L) {
      document.body.textContent = "商店脚本没有载入。";
      return;
    }
    const trimmed = load();
    bind();
    renderCats();
    if (!desk.matches) $("#bill-details").open = false;
    else $("#bill-details").open = true;
    if (state.asset == null) {
      $("#gate").hidden = false;
      $("#shop").hidden = true;
      syncGate();
      $("#asset").focus();
    } else {
      showShop();
      if (trimmed) showToast("上次的选择超出点券，已按余额减掉了。", false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
