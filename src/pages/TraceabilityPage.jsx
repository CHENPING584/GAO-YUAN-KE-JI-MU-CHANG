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
  const [searchId, setSearchId] = useState('');
  const [activeRecord, setActiveRecord] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      const record = findTraceabilityRecord(searchId);
      setActiveRecord(record);
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="animate-fade-in">
      <section className="container-shell py-12 sm:py-16">
        <div className="mb-12 max-w-4xl animate-fade-in-up">
          <p className="text-sm uppercase tracking-[0.25em] text-plateau-200">
            Traceability Center
          </p>
          <h2 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
            产品溯源大厅
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            输入产品包装上的溯源编号或扫描二维码，即可查看该产品的“数字身份证”。
            我们致力于让每一份高原馈赠都拥有真实、可追溯的身份记录。
          </p>
        </div>

        <div className="glass-card mb-12 p-8 animate-fade-in-up delay-100">
          <form className="flex flex-col gap-4 sm:flex-row" onSubmit={handleSearch}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-4 pl-12 pr-4 text-white outline-none transition-all focus:border-plateau-400 focus:ring-1 focus:ring-plateau-400"
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="请输入溯源编号或批次号 (如: QH-2026-001)"
                type="text"
                value={searchId}
              />
            </div>
            <button
              className="btn-plateau flex items-center justify-center gap-2 whitespace-nowrap px-10"
              disabled={isSearching}
              type="submit"
            >
              {isSearching ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ScanLine className="h-5 w-5" />
              )}
              立即查询
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/5 pt-8">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plateau-500/10 text-plateau-300">
                <ShieldPlus className="h-4 w-4" />
              </div>
              <span>官方区块链存证</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plateau-500/10 text-plateau-300">
                <BadgeCheck className="h-4 w-4" />
              </div>
              <span>人工实地核验</span>
            </div>
          </div>
        </div>

        {activeRecord ? (
          <div className="animate-scale-in">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-8">
                <div className="glass-card p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {activeRecord.productName}
                      </h3>
                      <p className="mt-2 text-slate-400">
                        批次号：{activeRecord.batchNo}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-plateau-500/10 px-6 py-3 text-center">
                      <p className="text-xs font-medium text-plateau-300 uppercase tracking-wider">
                        数字身份证状态
                      </p>
                      <p className="mt-1 font-bold text-plateau-400">已激活 / 正常</p>
                    </div>
                  </div>
                </div>
                
                <TraceTimeline items={activeRecord.timeline} />
                
                <div className="glass-card p-8">
                  <h4 className="mb-6 text-xl font-bold text-white">档案详情</h4>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center gap-3 text-slate-400">
                        <UserRound className="h-4 w-4" />
                        <span className="text-sm">生产者/牧民</span>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {activeRecord.rancher.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {activeRecord.rancher.role}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center gap-3 text-slate-400">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">合作企业</span>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {activeRecord.enterprise.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {activeRecord.enterprise.license}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <TraceMapCard 
                  coordinates={activeRecord.coordinates} 
                  origin={activeRecord.origin} 
                />
                
                <div className="glass-card p-8">
                  <h4 className="mb-6 text-xl font-bold text-white">防疫与检疫证书</h4>
                  <div className="grid gap-4">
                    {activeRecord.certificates.map((cert, idx) => (
                      <div key={idx} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
                        <LazyImage 
                          alt={cert.title} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          src={cert.src} 
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
                          <p className="text-sm font-medium text-white flex items-center gap-2">
                            <FileCheck2 className="h-4 w-4 text-plateau-400" />
                            {cert.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !isSearching && (
            <div className="glass-card p-20 text-center animate-fade-in-up delay-200">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-slate-600">
                <QrCode className="h-12 w-12" />
              </div>
              <h3 className="mt-8 text-xl font-bold text-white">等待查询</h3>
              <p className="mt-4 text-slate-400">
                请在上方输入框输入编号或点击模拟扫码按钮。
              </p>
              <button
                className="mt-8 text-sm font-medium text-plateau-400 transition-colors hover:text-plateau-300"
                onClick={() => {
                  const code = traceabilityRecords[0].code;
                  setSearchId(code);
                  const record = findTraceabilityRecord(code);
                  setActiveRecord(record);
                }}
                type="button"
              >
                没有编号？点击这里使用测试编号：{traceabilityRecords[0].code}
              </button>
            </div>
          )
        )}
      </section>
    </div>
  );
}
