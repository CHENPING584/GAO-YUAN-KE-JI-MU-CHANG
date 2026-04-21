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
    <section className="container-shell py-12 sm:py-16">
      <div className="mb-8 max-w-4xl">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
          Partner System
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          合作伙伴管理系统模板
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          为每个农户或企业生成独立的线上主页，统一展示合作等级、信用积分、历史溯源记录和合作概况。
          整体风格采用青海蓝与生态绿，便于后续接入真实伙伴数据。
        </p>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card overflow-hidden p-8">
          <div className="rounded-[2rem] border border-sky-300/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(61,168,117,0.12),rgba(15,23,32,0.4))] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200">
                青海蓝 + 生态绿
              </span>
              <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
                伙伴独立主页模板
              </span>
            </div>

            <h3 className="mt-6 text-3xl font-semibold text-white">
              统一管理农户与企业合作档案
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              支持平台运营方快速为合作农户、合作社和企业伙伴建立线上主页，持续沉淀信用表现、
              履约能力与历史溯源记录，用于品牌背书、渠道合作和平台准入管理。
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <PartnerStat label="模板覆盖伙伴" value={`${partners.length} 家`} />
          <PartnerStat label="最高信用积分" value="99 分" />
          <PartnerStat label="累计溯源记录" value="85 条+" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
        <aside className="glass-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-white">伙伴列表</h3>
              <p className="mt-1 text-sm text-slate-400">
                选择一个伙伴查看独立线上主页
              </p>
            </div>
            <ClipboardList className="h-5 w-5 text-sky-300" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {['全部', '农户', '企业'].map((type) => (
              <button
                key={type}
                className={[
                  'rounded-full px-4 py-2 text-sm transition',
                  activeType === type
                    ? 'bg-sky-500 text-white'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
                ].join(' ')}
                onClick={() => setActiveType(type)}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {visiblePartners.map((partner) => {
              const active = selectedPartner.id === partner.id;

              return (
                <button
                  key={partner.id}
                  className={[
                    'w-full rounded-3xl border p-5 text-left transition',
                    active
                      ? 'border-sky-300/40 bg-sky-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10',
                  ].join(' ')}
                  onClick={() => setSelectedId(partner.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {partner.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {partner.region}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${getLevelStyle(partner.level)}`}
                    >
                      {partner.type}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">{partner.level}</span>
                    <span className={`font-medium ${getScoreStyle(partner.creditScore)}`}>
                      信用 {partner.creditScore}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="glass-card overflow-hidden p-8">
            <div className="rounded-[2rem] border border-sky-300/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(61,168,117,0.12),rgba(15,23,32,0.45))] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-4 py-2 text-sm ${getLevelStyle(selectedPartner.level)}`}>
                      {selectedPartner.level}
                    </span>
                    <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
                      {selectedPartner.region}
                    </span>
                  </div>

                  <h3 className="mt-5 text-3xl font-bold text-white">
                    {selectedPartner.name}
                  </h3>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                    {selectedPartner.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedPartner.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-center">
                  <p className="text-sm text-slate-400">信用积分</p>
                  <div className={`mt-3 text-5xl font-bold ${getScoreStyle(selectedPartner.creditScore)}`}>
                    {selectedPartner.creditScore}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    基于履约、记录完整度与合作反馈综合评估
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sky-200">
                  {selectedPartner.type === '企业' ? (
                    <Building2 className="h-4 w-4" />
                  ) : (
                    <UserRound className="h-4 w-4" />
                  )}
                  <span className="text-sm">合作主体</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {selectedPartner.type}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-200">
                  <Medal className="h-4 w-4" />
                  <span className="text-sm">合作等级</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {selectedPartner.level}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sky-200">
                  <BadgeCheck className="h-4 w-4" />
                  <span className="text-sm">在线产品数</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {selectedPartner.stats.activeProducts}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm">履约达成率</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {selectedPartner.stats.fulfillmentRate}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-200">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">伙伴档案</h3>
                  <p className="text-sm text-slate-400">线上主页基础信息模块</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">合作联系人</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedPartner.contact.manager}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">联系电话</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedPartner.contact.phone}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">历史溯源记录数</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedPartner.stats.records} 条
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-200">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">历史溯源记录</h3>
                  <p className="text-sm text-slate-400">展示合作方历史批次与处理状态</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {selectedPartner.traceRecords.map((record) => (
                  <div
                    key={record.code}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {record.product}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          溯源编号：{record.code}
                        </p>
                      </div>
                      <span className="rounded-full border border-sky-300/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">
                        {record.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      归档时间：{record.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
