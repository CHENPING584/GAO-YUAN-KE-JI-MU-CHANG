function createSvgDataUri(title, subtitle, colors) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <circle cx="940" cy="180" r="180" fill="rgba(255,255,255,0.12)" />
      <circle cx="230" cy="700" r="220" fill="rgba(255,255,255,0.08)" />
      <text x="80" y="180" fill="#ffffff" font-size="62" font-family="Arial, sans-serif" font-weight="700">${title}</text>
      <text x="80" y="260" fill="rgba(255,255,255,0.84)" font-size="34" font-family="Arial, sans-serif">${subtitle}</text>
      <rect x="80" y="350" width="1040" height="340" rx="30" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.15)" />
      <text x="120" y="440" fill="#ffffff" font-size="44" font-family="Arial, sans-serif">高原科技牧场 · 轻量化可视化溯源示意图</text>
      <text x="120" y="520" fill="rgba(255,255,255,0.86)" font-size="28" font-family="Arial, sans-serif">支持牧场实景、加工节点、防疫证书和生产流转过程展示</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const traceabilityRecords = [
  {
    code: 'QH-2026-YK-001',
    productName: '青海牦牛精选礼盒',
    batchNo: 'PI-2026-0401',
    origin: '青海省海北州刚察县沙柳河镇',
    coordinates: {
      lng: 100.138,
      lat: 37.326,
    },
    rancher: {
      name: '才让卓玛家庭牧场',
      role: '源头牧民合作社成员',
      company: '青海高原科技牧场示范基地',
      phone: '0970-621-1024',
    },
    enterprise: {
      name: '青海高原牧业加工中心',
      license: 'QH-SC-630104-2026',
    },
    tags: ['高海拔散养', '绿色防疫', '冷链运输'],
    story:
      '该批次牦牛源自环青海湖高寒草场，采用家庭牧场散养模式，接入合作企业统一检疫、加工和包装。消费者可查看从养殖到包装的关键节点。 ',
    timeline: [
      {
        stage: '源头养殖',
        date: '2026-01-12',
        description: '耳标绑定电子档案，完成牧场基础信息与牲畜身份采集。',
      },
      {
        stage: '日常巡检',
        date: '2026-02-08',
        description: '兽医记录饲养状况、防疫计划和生长数据。',
      },
      {
        stage: '检疫出栏',
        date: '2026-03-22',
        description: '完成检疫申报、转运备案和屠前健康核验。',
      },
      {
        stage: '加工包装',
        date: '2026-04-01',
        description: '进入标准化分割、真空包装和批次编码流程。',
      },
    ],
    photos: [
      {
        title: '高寒牧场实景',
        src: createSvgDataUri('高寒牧场', '青海湖畔冬春轮牧区', ['#1f7a56', '#1e3a8a']),
      },
      {
        title: '牦牛饲养画面',
        src: createSvgDataUri('牦牛散养', '草场放牧与日常巡检', ['#2d855c', '#475569']),
      },
      {
        title: '加工车间',
        src: createSvgDataUri('加工车间', '标准化分割与冷链准备', ['#0f766e', '#334155']),
      },
    ],
    certificates: [
      {
        title: '动物检疫合格证明',
        src: createSvgDataUri('检疫证明', '批次：PI-2026-0401', ['#14532d', '#0f172a']),
      },
      {
        title: '防疫记录扫描件',
        src: createSvgDataUri('防疫记录', '周期免疫与巡检档案', ['#1d4ed8', '#0f172a']),
      },
    ],
  },
];

export function findTraceabilityRecord(keyword) {
  if (!keyword) {
    return null;
  }

  const normalized = keyword.trim().toLowerCase();
  return (
    traceabilityRecords.find(
      (record) =>
        record.code.toLowerCase() === normalized ||
        record.batchNo.toLowerCase() === normalized,
    ) || null
  );
}
