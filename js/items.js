(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = data;
  } else {
    root.CATEGORIES = data.CATEGORIES;
    root.ITEMS = data.ITEMS;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const CATEGORIES = [
    { id: "all", label: "全部" },
    { id: "memorial", label: "至尊" },
    { id: "badge", label: "徽章" },
    { id: "costume", label: "装扮" },
    { id: "pet", label: "宠物" },
    { id: "gear", label: "装备" },
    { id: "material", label: "材料" },
  ];

  // 顺序按上面的分类。limit 为 null 表示不限购。
  const ITEMS = [
    {
      id: "plat-sun",
      name: "[白金]曜日争锋",
      price: 1800,
      limit: 1,
      category: "memorial",
      detail: {
        stats: [
          "力量+80",
          "智力+80",
          "体力+33",
          "精神+33",
          "攻击速度+2%",
          "施放速度+3%",
          "移动速度+2%",
          "物理暴击+100",
          "魔法暴击+100",
          "生命值上限+220",
          "所有属性强化+10",
          "城镇内移动速度+10%",
          "技能攻击力+3%",
          "附加伤害+12%",
        ],
        effect: "在30秒内，有1%的概率消耗1个无色小晶块，在30秒内增加30点力量、智力、20点体力、精神，以及5%的攻击速度、施放速度和移动速度。",
      },
    },
    {
      id: "bead-title",
      name: "华光天启纪念宝珠(称号)",
      price: 1800,
      limit: 1,
      category: "memorial",
      detail: { stats: ["抗魔值+405", "所有属性强化+10", "技能攻击力+2%"] },
    },
    {
      id: "medal-fate",
      name: "词韵藏锋-命运决断勋章",
      price: 1000,
      limit: 1,
      category: "memorial",
      detail: {
        uncertain: true,
        stats: ["抗魔值+551", "力量+100", "智力+100", "最终伤害+1%"],
        effect: "在团队模式中，攻击时附加5%伤害。",
      },
    },
    {
      id: "medal-adventure",
      name: "华光天启纪念冒险勋章",
      price: 1000,
      limit: 1,
      category: "memorial",
      detail: {
        uncertain: true,
        stats: [
          "抗魔值+535",
          "力量/智力/体力/精神+80",
          "攻击速度+1.5%",
          "施放速度+1.5%",
          "移动速度+2%",
          "技能攻击力+1%",
          "金币额外获得量（剧情普通/冒险）+15%",
          "地下城通关经验额外获得量+3%",
        ],
      },
    },
    {
      id: "bead-adventure",
      name: "华光天启纪念宝珠(冒险勋章)",
      price: 1800,
      limit: 1,
      category: "memorial",
      detail: { stats: ["抗魔值+524", "技能攻击力+2%", "伤害+5%"] },
    },
    {
      id: "bead-weapon",
      name: "华光天启纪念宝珠(武器)",
      price: 1800,
      limit: 1,
      category: "memorial",
      detail: { stats: ["抗魔值+567", "技能攻击力+4%", "伤害+5%"] },
    },
    {
      id: "medal-summer",
      name: "夏梦水上乐园纪念公会勋章",
      price: 1000,
      limit: 1,
      category: "memorial",
      detail: {
        uncertain: true,
        stats: [
          "抗魔值+516",
          "力量/智力/体力/精神+80",
          "攻击速度+3%",
          "施放速度+3%",
          "移动速度+2%",
        ],
        effect: "在世界领主地下城攻击时附加3%伤害。",
      },
    },
    {
      id: "halo-royal",
      name: "[卓越]王权之门光环",
      price: 1800,
      limit: 1,
      category: "memorial",
      detail: {
        uncertain: true,
        stats: [
          "抗魔值+1302",
          "力量/智力/体力/精神+80",
          "物理暴击/魔法暴击+170",
          "所有属性强化+30",
          "最终伤害+3%",
          "物理攻击力/魔法攻击力+3%",
          "城镇移动速度+5%",
        ],
      },
    },
    {
      id: "bead-shoes",
      name: "华光天启纪念宝珠(鞋)",
      price: 1800,
      limit: 1,
      category: "memorial",
      detail: {
        stats: ["抗魔值+858", "物理攻击力、魔法攻击力+65", "物理暴击、魔法暴击+90", "最终伤害+2%"],
      },
    },
    {
      id: "bead-guild",
      name: "华光天启纪念宝珠(公会勋章)",
      price: 1800,
      limit: 1,
      category: "memorial",
      detail: { stats: ["抗魔值+220", "伤害+2%"] },
    },
    {
      id: "costume-blade",
      name: "空明幻刃武器装扮礼盒",
      price: 800,
      limit: 1,
      category: "memorial",
      detail: {
        stats: [
          "抗魔值+540",
          "力量、智力、体力、精神+25",
          "物理攻击力+10%",
          "魔法攻击力+10%",
        ],
      },
    },
    {
      id: "bead-victory",
      name: "胜利荣光宝珠",
      price: 500,
      limit: 1,
      category: "memorial",
      detail: {
        uncertain: true,
        stats: ["抗魔值+308", "力量+60", "智力+60"],
        effect: "用于团队模式勋章附魔。",
      },
    },

    { id: "badge-silver-5", name: "5级银色徽章", price: 160, limit: null, category: "badge" },
    { id: "badge-ele-5", name: "5级属强徽章", price: 800, limit: 8, category: "badge" },
    { id: "badge-ele-1-100", name: "1级属强徽章", price: 100, limit: 384, category: "badge" },
    { id: "badge-ele-1-200", name: "1级属强徽章", price: 200, limit: 512, category: "badge" },
    { id: "badge-ele-1-400", name: "1级属强徽章", price: 400, limit: null, category: "badge" },

    { id: "costume-cafe", name: "咖啡馆制服套装礼包", price: 990, limit: null, category: "costume" },
    { id: "costume-synth", name: "装扮合成器(角色绑定)", price: 50, limit: null, category: "costume" },
    { id: "costume-top", name: "第5期稀有装扮上衣礼盒(款式1)", price: 750, limit: 1, category: "costume" },
    { id: "costume-shoes", name: "第5期稀有装扮鞋礼盒(款式1)", price: 750, limit: 1, category: "costume" },
    { id: "costume-chest", name: "第5期稀有装扮胸部自选礼盒(款式1)", price: 750, limit: 1, category: "costume" },
    { id: "costume-waist", name: "第5期稀有装扮腰部礼盒(款式1)", price: 750, limit: 1, category: "costume" },
    { id: "costume-face", name: "第5期稀有装扮脸部礼盒(款式1)", price: 750, limit: 1, category: "costume" },
    { id: "costume-head", name: "第5期稀有装扮头部礼盒(款式1)", price: 750, limit: 1, category: "costume" },
    { id: "costume-hat", name: "第5期稀有装扮帽子礼盒(款式1)", price: 750, limit: 1, category: "costume" },
    { id: "costume-bottom", name: "第5期稀有装扮下装礼盒(款式1)", price: 750, limit: 1, category: "costume" },

    { id: "pet-artifact", name: "神器团本宠物首领冥(神器)", price: 1680, limit: 2, category: "pet" },
    { id: "pet-epic", name: "史诗团本宠物首领冥(史诗)", price: 3360, limit: 1, category: "pet" },
    { id: "pet-biscuit-50", name: "宠物饼干", price: 50, limit: 200, category: "pet" },
    { id: "pet-biscuit-100", name: "宠物饼干", price: 100, limit: null, category: "pet" },
    { id: "pet-dragon", name: "黑龙降临之宠物装备套装礼盒", price: 1680, limit: 1, category: "pet" },
    { id: "tooth-2", name: "秘能之牙*2", price: 1, limit: 1000, category: "pet" },
    { id: "tooth", name: "秘能之牙", price: 1, limit: null, category: "pet" },

    { id: "box-6-500", name: "+6次元灵驿装备自选礼盒(武器/非武器)", price: 500, limit: 2, category: "gear" },
    { id: "box-6-1000", name: "+6次元灵驿装备自选礼盒(武器/非武器)", price: 1000, limit: 10, category: "gear" },
    { id: "box-7-900", name: "+7次元灵驿装备自选礼盒(武器/非武器)", price: 900, limit: 2, category: "gear" },
    { id: "box-7-1800", name: "+7次元灵驿装备自选礼盒(武器/非武器)", price: 1800, limit: 10, category: "gear" },
    { id: "box-8", name: "+8次元灵驿装备自选礼盒(武器/非武器)", price: 3000, limit: 10, category: "gear" },
    { id: "box-9", name: "+9次元灵驿装备自选礼盒(武器/非武器)", price: 6000, limit: 1, category: "gear" },
    { id: "box-10", name: "+10次元灵驿装备自选礼盒(武器/非武器)", price: 12000, limit: 1, category: "gear" },

    { id: "grade-box", name: "装备品级调整箱", price: 25, limit: 120, category: "material" },
    { id: "crystal-1", name: "矛盾的结晶", price: 1, limit: 5000, category: "material" },
    { id: "crystal-2", name: "矛盾的结晶", price: 2, limit: 10000, category: "material" },
    { id: "crystal-5", name: "矛盾的结晶", price: 5, limit: 10000, category: "material" },
    { id: "crystal-10", name: "矛盾的结晶", price: 10, limit: null, category: "material" },
    { id: "charm", name: "幸运符", price: 120, limit: 50, category: "material" },
    { id: "star-50", name: "史诗星源石宝箱", price: 50, limit: 10, category: "material" },
    { id: "star-100", name: "史诗星源石宝箱", price: 100, limit: 10, category: "material" },
    { id: "star-200", name: "史诗星源石宝箱", price: 200, limit: 10, category: "material" },
    { id: "gold-box", name: "10万金币礼盒", price: 10, limit: null, category: "material" },
  ];

  return { CATEGORIES, ITEMS };
});
