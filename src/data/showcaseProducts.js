function createProductImage(title, subtitle, colors) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <circle cx="960" cy="160" r="170" fill="rgba(255,255,255,0.14)" />
      <circle cx="220" cy="700" r="230" fill="rgba(255,255,255,0.08)" />
      <text x="80" y="180" fill="#ffffff" font-size="64" font-family="Arial, sans-serif" font-weight="700">${title}</text>
      <text x="80" y="260" fill="rgba(255,255,255,0.84)" font-size="34" font-family="Arial, sans-serif">${subtitle}</text>
      <rect x="80" y="350" width="1040" height="340" rx="30" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.16)" />
      <text x="120" y="450" fill="#ffffff" font-size="42" font-family="Arial, sans-serif">高原科技牧场 · 农场商城展示图</text>
      <text x="120" y="525" fill="rgba(255,255,255,0.84)" font-size="28" font-family="Arial, sans-serif">展示详情页不设购物车，统一联系牧民 / 主理人</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const categories = ['全部', '牦牛肉', '藏羊', '青稞', '枸杞'];

export const products = [
  {
    id: 'yak-ribeye',
    category: '牦牛肉',
    name: '高原牦牛雪花肉',
    originLabel: '玉树直供',
    description: '选自高海拔散养牦牛，适合家庭烹饪、餐饮采购与节庆礼赠。',
    story:
      '该产品来自玉树高海拔天然牧场，采用散养方式，接入统一溯源、检疫和冷链交付流程，兼顾高端零售与渠道礼赠展示。',
    specs: '500g / 盒',
    traceCode: 'QH-SC-YK-001',
    image: createProductImage('牦牛雪花肉', '玉树直供 · 高海拔散养', ['#14532d', '#1e3a8a']),
    features: ['高原散养', '检疫可追溯', '支持礼盒定制'],
    prices: {
      retail: '¥168 / 盒',
      wholesale: '¥138 / 盒（20盒起）',
      gift: '¥398 / 礼盒',
    },
    contact: {
      owner: '私域主理人 卓玛',
      phone: '189-9701-2234',
      wechat: 'gaoyuan-zhuoma',
    },
  },
  {
    id: 'tibetan-lamb',
    category: '藏羊',
    name: '藏羊精品分割装',
    originLabel: '果洛牧场',
    description: '草场自然放牧，适配社区团购、批量团餐与品牌联名礼盒。',
    story:
      '产品源于果洛高寒草场，强调天然放牧和统一检疫，适合团餐、渠道分销和区域品牌联名合作。',
    specs: '1kg / 袋',
    traceCode: 'QH-SC-ZY-016',
    image: createProductImage('藏羊分割装', '果洛牧场 · 天然放牧', ['#2d855c', '#475569']),
    features: ['天然放牧', '团购友好', '冷链发运'],
    prices: {
      retail: '¥128 / 袋',
      wholesale: '¥108 / 袋（30袋起）',
      gift: '¥328 / 礼盒',
    },
    contact: {
      owner: '牧场联络员 仁青',
      phone: '177-9708-6612',
      wechat: 'guoluo-lamb',
    },
  },
  {
    id: 'highland-barley',
    category: '青稞',
    name: '青稞营养礼装',
    originLabel: '海北原产',
    description: '适合文旅伴手礼、企业福利及高原农特产组合展示。',
    story:
      '青稞礼装突出海北原产地故事和联名文旅属性，适合企业福利、伴手礼和区域特色组合展示。',
    specs: '750g / 盒',
    traceCode: 'QH-SC-QK-032',
    image: createProductImage('青稞礼装', '海北原产 · 农文旅联名', ['#b45309', '#365314']),
    features: ['海北原产', '礼赠属性强', '适合联名展示'],
    prices: {
      retail: '¥69 / 盒',
      wholesale: '¥52 / 盒（50盒起）',
      gift: '¥168 / 礼盒',
    },
    contact: {
      owner: '渠道主理人 南杰',
      phone: '181-0971-3386',
      wechat: 'qingke-shop',
    },
  },
  {
    id: 'goji-berry',
    category: '枸杞',
    name: '高原枸杞臻选装',
    originLabel: '柴达木优选',
    description: '面向健康零售、企业定制和私域社群复购场景。',
    story:
      '柴达木产区枸杞突出健康属性和复购潜力，适合社群私域转化、企业定制和养生伴手礼场景。',
    specs: '250g / 罐',
    traceCode: 'QH-SC-GQ-021',
    image: createProductImage('高原枸杞', '柴达木优选 · 健康滋补', ['#b91c1c', '#7c2d12']),
    features: ['柴达木优选', '健康滋补', '适合私域复购'],
    prices: {
      retail: '¥88 / 罐',
      wholesale: '¥72 / 罐（40罐起）',
      gift: '¥218 / 礼盒',
    },
    contact: {
      owner: '私域运营 央金',
      phone: '186-9720-5418',
      wechat: 'chai-goji',
    },
  },
];

export function getProductById(productId) {
  return products.find((product) => product.id === productId) ?? null;
}
