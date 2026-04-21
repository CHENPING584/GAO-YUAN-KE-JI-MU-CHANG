import {
  BadgeCheck,
  Building2,
  FileCheck2,
  QrCode,
  ScanLine,
  Search,
  ShieldPlus,
  UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import LazyImage from '../components/traceability/LazyImage';
import TraceMapCard from '../components/traceability/TraceMapCard';
import TraceTimeline from '../components/traceability/TraceTimeline';
import TraceUploadCard from '../components/traceability/TraceUploadCard';
import {
  findTraceabilityRecord,
  traceabilityRecords,
} from '../data/traceabilityData';

function IdentityItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-base font-medium text-white">{value}</p>
    </div>
  );
}

export default function TraceabilityPage() {
  const defaultCode = traceabilityRecords[0].code;
  const [keyword, setKeyword] = useState(defaultCode);
  const [activeCode, setActiveCode] = useState(defaultCode);

  const record = useMemo(
    () => findTraceabilityRecord(activeCode) ?? traceabilityRecords[0],
    [activeCode],
  );

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveCode(keyword.trim() || defaultCode);
  };

  const handleMockScan = () => {
    const nextCode = traceabilityRecords[0].code;
    setKeyword(nextCode);
    setActiveCode(nextCode);
  };

  return (
    <section className="container-shell py-12 sm:py-16">
      <div className="mb-8 max-w-4xl">
        <p className="text-sm uppercase tracking-[0.25em] text-plateau-200">
          Traceability
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          轻量化可视化溯源大厅
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          用户可输入溯源编号或点击模拟扫码，查看产品“数字身份证”、牧场位置、实景照片墙、检疫证书与全流程时间轴。
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">溯源查询入口</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              演示编号：`{defaultCode}`，可模拟二维码扫码录入。
            </p>
          </div>

          <form className="flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row" onSubmit={handleSearch}>
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-full border border-white/10 bg-slate-950/80 py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-plateau-400"
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="请输入溯源编号或批次号"
                type="text"
                value={keyword}
              />
            </label>
            <button
              className="rounded-full bg-plateau-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-plateau-400"
              type="submit"
            >
              查询编号
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              onClick={handleMockScan}
              type="button"
            >
              <ScanLine className="h-4 w-4" />
              模拟扫码
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-plateau-500/10 px-3 py-1 text-xs text-plateau-200">
              数字身份证
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              编号：{record.code}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              批次：{record.batchNo}
            </span>
          </div>

          <h3 className="mt-5 text-2xl font-semibold text-white">
            {record.productName}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{record.story}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {record.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-plateau-300/20 bg-plateau-500/10 px-3 py-1 text-xs text-plateau-100"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <IdentityItem label="产地位置" value={record.origin} />
            <IdentityItem label="加工企业" value={record.enterprise.name} />
            <IdentityItem label="企业许可编号" value={record.enterprise.license} />
            <IdentityItem label="联系信息" value={record.rancher.phone} />
          </div>
        </div>

        <TraceMapCard
          coordinates={record.coordinates}
          origin={record.origin}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-plateau-500/15 p-3 text-plateau-300">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">牧民 / 企业信息</h3>
              <p className="text-sm text-slate-400">核心主体与合作链路</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-plateau-200">
                <UserRound className="h-4 w-4" />
                <span className="text-sm">源头牧民</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                {record.rancher.name}
              </p>
              <p className="mt-1 text-sm text-slate-400">{record.rancher.role}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-plateau-200">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">合作企业</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                {record.rancher.company}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                加工主体：{record.enterprise.name}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-plateau-200">
                <ShieldPlus className="h-4 w-4" />
                <span className="text-sm">认证说明</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                当前页面为轻量化示范版，后续可与 Supabase 或 Firebase
                数据表联动，实现批次追踪、证书归档和多主体协同录入。
              </p>
            </div>
          </div>
        </div>

        <TraceTimeline items={record.timeline} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-plateau-500/15 p-3 text-plateau-300">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">养殖 / 加工实景照片墙</h3>
              <p className="text-sm text-slate-400">
                弱网场景下按需懒加载图片，减少首屏压力
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {record.photos.map((photo) => (
              <figure key={photo.title} className="space-y-3">
                <LazyImage
                  alt={photo.title}
                  className="aspect-[4/3]"
                  src={photo.src}
                />
                <figcaption className="text-sm text-slate-300">
                  {photo.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-plateau-500/15 p-3 text-plateau-300">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">防疫 / 检疫证书</h3>
              <p className="text-sm text-slate-400">支持扫描件归档展示</p>
            </div>
          </div>

          <div className="space-y-4">
            {record.certificates.map((certificate) => (
              <div key={certificate.title} className="space-y-3">
                <LazyImage
                  alt={certificate.title}
                  className="aspect-[4/3] border border-white/10"
                  src={certificate.src}
                />
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <BadgeCheck className="h-4 w-4 text-plateau-300" />
                  <span>{certificate.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <TraceUploadCard />
      </div>
    </section>
  );
}
