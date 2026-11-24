(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.ShopLogic = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const ASSET_CAP = 99999999;

  function parseAmount(raw) {
    if (raw == null) return null;
    const normalized = String(raw)
      .trim()
      .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30))
      .replace(/[，,\s]/g, "");
    if (!/^\d+$/.test(normalized)) return null;
    const n = Number(normalized);
    if (!Number.isSafeInteger(n)) return null;
    return n;
  }

  function spentOf(items, qtyMap, exceptId) {
    let sum = 0;
    for (const item of items) {
      if (item.id === exceptId) continue;
      sum += item.price * (qtyMap[item.id] || 0);
    }
    return sum;
  }

  function maxQty(items, item, asset, qtyMap) {
    if (!item || item.price <= 0) return 0;
    const remain = asset - spentOf(items, qtyMap, item.id);
    const byMoney = remain > 0 ? Math.floor(remain / item.price) : 0;
    const byLimit = item.limit == null ? byMoney : item.limit;
    return Math.max(0, Math.min(byMoney, byLimit));
  }

  function clampQty(items, item, requested, asset, qtyMap) {
    let q = Math.floor(Number(requested));
    if (!Number.isFinite(q) || q <= 0) return 0;
    return Math.min(q, maxQty(items, item, asset, qtyMap));
  }

  function repair(items, asset, qtyMap) {
    const next = {};
    let spent = 0;
    const safeAsset = Math.max(0, Math.floor(Number(asset)) || 0);
    for (const item of items) {
      let q = Math.floor(Number(qtyMap[item.id] || 0));
      if (!Number.isFinite(q) || q <= 0) q = 0;
      if (item.limit != null) q = Math.min(q, item.limit);
      const byMoney = item.price > 0 ? Math.floor((safeAsset - spent) / item.price) : 0;
      q = Math.min(q, Math.max(0, byMoney));
      if (q > 0) next[item.id] = q;
      spent += q * item.price;
    }
    return next;
  }

  function totals(items, asset, qtyMap) {
    let spent = 0;
    let pieces = 0;
    let kinds = 0;
    for (const item of items) {
      const q = qtyMap[item.id] || 0;
      if (q > 0) {
        kinds += 1;
        pieces += q;
        spent += q * item.price;
      }
    }
    return { spent, left: asset - spent, pieces, kinds };
  }

  function blockReason(items, item, requested, asset, qtyMap) {
    const current = qtyMap[item.id] || 0;
    const want = Math.floor(Number(requested));
    if (!Number.isFinite(want) || want <= current) return null;
    if (want <= maxQty(items, item, asset, qtyMap)) return null;
    const remain = asset - spentOf(items, qtyMap, item.id);
    const byMoney = item.price > 0 && remain > 0 ? Math.floor(remain / item.price) : 0;
    if (item.limit != null && byMoney >= item.limit) return "limit";
    return "money";
  }

  return {
    ASSET_CAP,
    parseAmount,
    maxQty,
    clampQty,
    repair,
    totals,
    blockReason,
  };
});
