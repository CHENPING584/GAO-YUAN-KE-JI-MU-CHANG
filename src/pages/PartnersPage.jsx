import {
  BadgeCheck,
  Building2,
  ClipboardList,
  Leaf,
  Medal,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { partners } from '../data/partnersData';

function getLevelStyle(level) {
  if (level === '官方企业合作') {
    return 'bg-sky-500/15 text-sky-200 border border-sky-300/20';
  }

  return 'bg-plateau-500/15 text-plateau-100 border border-plateau-300/20';
}

function getScoreStyle(score) {
  if (score >= 95) {
    return 'text-emerald-300';
  }

  if (score >= 90) {
    return 'text-sky-300';
  }

  return 'text-amber-300';
}

function PartnerStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function PartnersPage() {
  const [activeType, setActiveType] = useState('全部');
  const [selectedId, setSelectedId] = useState(partners[0].id);

  const visiblePartners = useMemo(() => {
    if (activeType === '全部') {
      return partners;
    }

    return partners.filter((partner) => partner.type === activeType);
  }, [activeType]);

  const selectedPartner = useMemo(() => {
    const inCurrentList = visiblePartners.find((partner) => partner.id === selectedId);
    return inCurrentList ?? visiblePartners[0] ?? partners[0];
  }, [selectedId, visiblePartners]);

  return (
    <div className="animate-fade-in">
      <section className="container-shell py-12 sm:py-16">
        <div className="mb-12 max-w-4xl animate-fade-in-up">
          <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
            Partner System
          </p>
          <h2 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
            合作伙伴管理系统
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            为每一个扎根高原的农户或企业生成独立的线上主页。
            我们统一展示合作等级、信用积分、历史溯源记录和合作概况，构建透明可信的供应链体系。
          </p>
        </div>

        <div className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] animate-fade-in-up delay-100">
          <div className="glass-card overflow-hidden p-8 sm:p-12 relative">
            <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"></div>
            <div className="relative rounded-[2.5rem] border border-sky-300/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(61,168,117,0.12),rgba(15,23,32,0.4))] p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200">
                  青海蓝 + 生态绿
                </span>
                <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
                  伙伴独立主页模板
                </span>
              </div>

              <h3 className="mt-8 text-3xl font-bold text-white">
                统一管理农户与企业合作档案
              </h3>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300">
                支持平台运营方快速为合作农户、合作社和企业伙伴建立线上主页，持续沉淀信用表现、
                履约能力与历史溯源记录，用于品牌背书、渠道合作和平台准入管理。
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
            <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
              <PartnerStat label="模板覆盖伙伴" value={`${partners.length} 家`} />
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '300ms' }}>
              <PartnerStat label="最高信用积分" value="99 分" />
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '400ms' }}>
              <PartnerStat label="累计溯源记录" value="85 条+" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.32fr_0.68fr] animate-fade-in-up delay-200">
          <aside className="glass-card p-8">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white">筛选伙伴</h3>
              <div className="mt-6 flex flex-wrap gap-2">
                {['全部', '农户', '企业'].map((type) => (
                  <button
                    key={type}
                    className={[
                      'rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
                      activeType === type
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                        : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20',
                    ].join(' ')}
                    onClick={() => setActiveType(type)}
                    type="button"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {visiblePartners.map((partner, index) => (
                <button
                  key={partner.id}
                  className={[
                    'w-full rounded-2xl border p-5 text-left transition-all duration-300 group',
                    selectedId === partner.id
                      ? 'border-sky-300/40 bg-sky-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20',
                  ].join(' ')}
                  onClick={() => setSelectedId(partner.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-white group-hover:text-sky-300 transition-colors">
                      {partner.name}
                    </p>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-slate-200">
                      {partner.type}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{partner.region}</p>
                </button>
              ))}
            </div>
          </aside>

          <main className="animate-fade-in">
            {selectedPartner ? (
              <div className="glass-card overflow-hidden" key={selectedPartner.id}>
                {/* Header Section */}
                <div className="relative h-48 sm:h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-900/40 to-emerald-900/40"></div>
                  <div className="absolute inset-0 bg-plateau-grid opacity-20"></div>
                  <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-3">
                        <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/10">
                          {selectedPartner.region}
                        </span>
                        <span
                          className={[
                            'rounded-full px-4 py-1.5 text-xs font-bold backdrop-blur-md',
                            getLevelStyle(selectedPartner.level),
                          ].join(' ')}
                        >
                          {selectedPartner.level}
                        </span>
                      </div>
                      <h3 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                        {selectedPartner.name}
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-md">
                      <p className="text-[10px] font-bold text-sky-200 uppercase tracking-widest">
                        信用积分
                      </p>
                      <p
                        className={[
                          'mt-1 text-3xl font-black leading-none',
                          getScoreStyle(selectedPartner.creditScore),
                        ].join(' ')}
                      >
                        {selectedPartner.creditScore}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 sm:p-12">
                  <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
                    <div>
                      <h4 className="flex items-center gap-3 text-xl font-bold text-white">
                        <Leaf className="h-5 w-5 text-plateau-400" />
                        伙伴主页简介
                      </h4>
                      <p className="mt-6 text-lg leading-relaxed text-slate-300">
                        {selectedPartner.description}
                      </p>

                      <div className="mt-12 grid gap-6 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
                          <div className="flex items-center gap-3 text-slate-400">
                            <UserRound className="h-4 w-4" />
                            <span className="text-sm font-medium">联系人 / 负责人</span>
                          </div>
                          <p className="mt-4 text-xl font-bold text-white">
                            {selectedPartner.contact.manager}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {selectedPartner.contact.phone}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
                          <div className="flex items-center gap-3 text-slate-400">
                            <Star className="h-4 w-4" />
                            <span className="text-sm font-medium">履约状态</span>
                          </div>
                          <p className="mt-4 text-xl font-bold text-white">
                            {selectedPartner.stats.fulfillmentRate}% 达成
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            历史合作周期：3年+
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-3 text-xl font-bold text-white">
                        <ClipboardList className="h-5 w-5 text-sky-400" />
                        历史溯源档案
                      </h4>
                      <div className="mt-8 space-y-4">
                        {selectedPartner.traceRecords.map((record) => (
                          <div
                            key={record.code}
                            className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-white group-hover:text-sky-300 transition-colors">
                                {record.product}
                              </p>
                              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-300">
                                {record.status}
                              </span>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                              <span>编号：{record.code}</span>
                              <span>{record.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card flex h-96 flex-col items-center justify-center p-8 text-slate-500">
                <Medal className="h-16 w-16 opacity-20" />
                <p className="mt-6 text-lg">请在左侧选择一个合作伙伴查看主页</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
