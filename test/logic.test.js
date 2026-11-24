const assert = require("assert");
const { ITEMS, CATEGORIES } = require("../js/items.js");
const L = require("../js/logic.js");

const expected = [
  ["[白金]曜日争锋", 1800, 1, "memorial"],
  ["华光天启纪念宝珠(称号)", 1800, 1, "memorial"],
  ["词韵藏锋-命运决断勋章", 1000, 1, "memorial"],
  ["华光天启纪念冒险勋章", 1000, 1, "memorial"],
  ["华光天启纪念宝珠(冒险勋章)", 1800, 1, "memorial"],
  ["华光天启纪念宝珠(武器)", 1800, 1, "memorial"],
  ["夏梦水上乐园纪念公会勋章", 1000, 1, "memorial"],
  ["[卓越]王权之门光环", 1800, 1, "memorial"],
  ["华光天启纪念宝珠(鞋)", 1800, 1, "memorial"],
  ["华光天启纪念宝珠(公会勋章)", 1800, 1, "memorial"],
  ["胜利荣光宝珠", 500, 1, "memorial"],
  ["5级银色徽章", 160, null, "badge"],
  ["5级属强徽章", 800, 8, "badge"],
  ["1级属强徽章", 100, 384, "badge"],
  ["1级属强徽章", 200, 512, "badge"],
  ["1级属强徽章", 400, null, "badge"],
  ["咖啡馆制服套装礼包", 990, null, "costume"],
  ["空明幻刃武器装扮礼盒", 800, 1, "costume"],
  ["装扮合成器(角色绑定)", 50, null, "costume"],
  ["第5期稀有装扮上衣礼盒(款式1)", 750, 1, "costume"],
  ["第5期稀有装扮鞋礼盒(款式1)", 750, 1, "costume"],
  ["第5期稀有装扮胸部自选礼盒(款式1)", 750, 1, "costume"],
  ["第5期稀有装扮腰部礼盒(款式1)", 750, 1, "costume"],
  ["第5期稀有装扮脸部礼盒(款式1)", 750, 1, "costume"],
  ["第5期稀有装扮头部礼盒(款式1)", 750, 1, "costume"],
  ["第5期稀有装扮帽子礼盒(款式1)", 750, 1, "costume"],
  ["第5期稀有装扮下装礼盒(款式1)", 750, 1, "costume"],
  ["神器团本宠物首领冥(神器)", 1680, 2, "pet"],
  ["史诗团本宠物首领冥(史诗)", 3360, 1, "pet"],
  ["宠物饼干", 50, 200, "pet"],
  ["宠物饼干", 100, null, "pet"],
  ["黑龙降临之宠物装备套装礼盒", 1680, 1, "pet"],
  ["秘能之牙*2", 1, 1000, "pet"],
  ["秘能之牙", 1, null, "pet"],
  ["+6次元灵驿装备自选礼盒(武器/非武器)", 500, 2, "gear"],
  ["+6次元灵驿装备自选礼盒(武器/非武器)", 1000, 10, "gear"],
  ["+7次元灵驿装备自选礼盒(武器/非武器)", 900, 2, "gear"],
  ["+7次元灵驿装备自选礼盒(武器/非武器)", 1800, 10, "gear"],
  ["+8次元灵驿装备自选礼盒(武器/非武器)", 3000, 10, "gear"],
  ["+9次元灵驿装备自选礼盒(武器/非武器)", 6000, 1, "gear"],
  ["+10次元灵驿装备自选礼盒(武器/非武器)", 12000, 1, "gear"],
  ["装备品级调整箱", 25, 120, "material"],
  ["矛盾的结晶", 1, 5000, "material"],
  ["矛盾的结晶", 2, 10000, "material"],
  ["矛盾的结晶", 5, 10000, "material"],
  ["矛盾的结晶", 10, null, "material"],
  ["幸运符", 120, 50, "material"],
  ["史诗星源石宝箱", 50, 10, "material"],
  ["史诗星源石宝箱", 100, 10, "material"],
  ["史诗星源石宝箱", 200, 10, "material"],
  ["10万金币礼盒", 10, null, "material"],
];

assert.strictEqual(ITEMS.length, 51);
assert.strictEqual(CATEGORIES.find((cat) => cat.id === "memorial").label, "至尊");
assert.deepStrictEqual(
  ITEMS.map((item) => [item.name, item.price, item.limit, item.category]),
  expected
);

const ids = new Set(ITEMS.map((item) => item.id));
assert.strictEqual(ids.size, ITEMS.length);
const catIds = new Set(CATEGORIES.map((cat) => cat.id));
for (const item of ITEMS) {
  assert.ok(catIds.has(item.category), item.id);
  assert.ok(Number.isInteger(item.price) && item.price > 0, item.id);
  assert.ok(item.limit == null || (Number.isInteger(item.limit) && item.limit > 0), item.id);
}

assert.strictEqual(L.parseAmount("20,000"), 20000);
assert.strictEqual(L.parseAmount("２００００"), 20000);
assert.strictEqual(L.parseAmount(" 12 "), 12);
assert.strictEqual(L.parseAmount("0"), 0);
assert.strictEqual(L.parseAmount(""), null);
assert.strictEqual(L.parseAmount("12.5"), null);
assert.strictEqual(L.parseAmount("-3"), null);
assert.strictEqual(L.parseAmount("abc"), null);

const asset = 3000;
let qty = {};
const sun = ITEMS[0];
qty[sun.id] = L.clampQty(ITEMS, sun, 2, asset, qty);
assert.strictEqual(qty[sun.id], 1, "limit 1");
assert.strictEqual(L.blockReason(ITEMS, sun, 2, asset, qty), "limit");
assert.strictEqual(L.totals(ITEMS, asset, qty).left, 1200);

const box = ITEMS.find((item) => item.id === "grade-box");
qty[box.id] = L.clampQty(ITEMS, box, 999, asset, qty);
assert.strictEqual(qty[box.id], 48, "1200 / 25");
assert.strictEqual(L.totals(ITEMS, asset, qty).left, 0);
assert.strictEqual(L.totals(ITEMS, asset, qty).spent, 3000);

const tooth = ITEMS.find((item) => item.id === "tooth");
assert.strictEqual(L.maxQty(ITEMS, tooth, asset, qty), 0);
assert.strictEqual(L.blockReason(ITEMS, tooth, 1, asset, qty), "money");
qty[tooth.id] = L.clampQty(ITEMS, tooth, 5, asset, qty);
assert.ok(!qty[tooth.id]);
assert.ok(L.totals(ITEMS, asset, qty).left >= 0);

const crystal = ITEMS.find((item) => item.id === "crystal-1");
const crystalQty = {};
assert.strictEqual(L.maxQty(ITEMS, crystal, 100, crystalQty), 100);
crystalQty[crystal.id] = L.clampQty(ITEMS, crystal, 9000, 100, crystalQty);
assert.strictEqual(crystalQty[crystal.id], 100);
assert.strictEqual(L.totals(ITEMS, 100, crystalQty).left, 0);

const badge = ITEMS.find((item) => item.id === "badge-ele-5");
assert.strictEqual(L.maxQty(ITEMS, badge, 800 * 8 + 10, {}), 8);

const repaired = L.repair(ITEMS, 100, { [sun.id]: 1, [tooth.id]: 500 });
assert.deepStrictEqual(repaired, { [tooth.id]: 100 });
assert.ok(L.totals(ITEMS, 100, repaired).left >= 0);

const fixture = [
  { id: "a", price: 1800, limit: 1 },
  { id: "b", price: 25, limit: 120 },
  { id: "c", price: 1, limit: null },
  { id: "d", price: 800, limit: 8 },
];
let fuzzQty = {};
const fuzzAsset = 5000;
for (let i = 0; i < 400; i += 1) {
  const item = fixture[i % fixture.length];
  const requested = ((i * 17) % 40) - 3;
  const next = L.clampQty(fixture, item, requested, fuzzAsset, fuzzQty);
  if (next > 0) fuzzQty[item.id] = next;
  else delete fuzzQty[item.id];
  const t = L.totals(fixture, fuzzAsset, fuzzQty);
  assert.ok(t.left >= 0, `debt at step ${i}: ${t.left}`);
  assert.strictEqual(t.spent + t.left, fuzzAsset);
  if (item.limit != null) assert.ok((fuzzQty[item.id] || 0) <= item.limit);
}

console.log("ok", ITEMS.length, "items");
