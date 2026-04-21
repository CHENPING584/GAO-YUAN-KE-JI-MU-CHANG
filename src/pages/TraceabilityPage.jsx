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
    e?.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      const record = findTraceabilityRecord(searchId);
      setActiveRecord(record);
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="relative isolate min-h-screen pb-40">
      {/* Background Decor */}
      <div className="plateau-grid-bg"></div>
      <div className="glow-mesh top-[15%] left-[-5%] w-[400px] h-[400px] bg-plateau-900/30"></div>
      <div className="glow-mesh bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-gold-900/10"></div>
      
      <section className="container-shell pt-32 lg:pt-48">
        <div className="animate-fade-in-up max-w-4xl">
          <div className="animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md">
            Traceability Center
          </div>
          <h1 className="section-title mt-10">
            <span className="text-gradient">数字指纹</span>
            <br />
            <span className="text-gradient-gold">每一份原产地馈赠皆有迹可循</span>
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-slate-400 max-w-2xl">
            输入产品溯源编号，开启一场跨越山海的<span className="text-white font-semibold">信任之旅</span>。
            从牧场环境到加工流通，全链路数据实时存证。
          </p>
        </div>

        {/* Search Input */}
        <div className="glass-card mt-20 p-10 lg:p-16 animate-fade-in-up [animation-delay:200ms]">
          <form className="relative flex flex-col gap-6 lg:flex-row" onSubmit={handleSearch}>
            <div className="relative flex-1">
              <Search className="absolute left-8 top-1/2 h-6 w-6 -translate-y-1/2 text-gold-500/50" />
              <input
                className="w-full rounded-full border border-white/10 bg-black/40 py-6 pl-20 pr-8 text-lg text-white outline-none transition-all focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5 placeholder:text-slate-600"
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="请输入溯源编号 (如: QH-2026-001)"
                type="text"
                value={searchId}
              />
            </div>
            <button
              className="btn-gold flex items-center justify-center gap-4 px-16 text-lg transition-all active:scale-95 active:brightness-90"
              disabled={isSearching}
              type="submit"
            >
              {isSearching ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
              ) : (
                <>
                  <ScanLine className="h-6 w-6" />
                  <span>开启溯源</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 flex flex-wrap items-center gap-10 border-t border-white/5 pt-12">
             <div className="flex items-center gap-4 text-slate-400 group cursor-pointer" onClick={() => window.open('https://www.baidu.com', '_blank')}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gold-500 shadow-gold-glow transition-all group-hover:bg-gold-500 group-hover:text-slate-950 group-active:scale-90">
                   <ShieldPlus className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest transition-colors group-hover:text-white">区块链加密存证</span>
             </div>
             <div className="flex items-center gap-4 text-slate-400 group cursor-pointer" onClick={() => window.open('https://www.baidu.com', '_blank')}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gold-500 shadow-gold-glow transition-all group-hover:bg-gold-500 group-hover:text-slate-950 group-active:scale-90">
                   <BadgeCheck className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest transition-colors group-hover:text-white">实地影像核验</span>
             </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-20">
          {activeRecord ? (
            <div className="animate-fade-in space-y-16">
              <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-12">
                  {/* Basic Info Card */}
                  <div className="glass-card p-12 animate-fade-in-up">
                    <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="inline-block rounded-full bg-gold-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gold-500 border border-gold-500/20 mb-6">
                          Verified Identity
                        </div>
                        <h3 className="heading-serif text-4xl text-white">{activeRecord.productName}</h3>
                        <p className="mt-4 font-mono text-slate-500 tracking-wider">ID: {activeRecord.batchNo}</p>
                      </div>
                      <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/10 px-10 py-6 text-center backdrop-blur-xl transition-all hover:bg-white/5 cursor-default">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">数字化状态</p>
                         <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75"></span>
                               <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500"></span>
                            </span>
                            <span className="text-xl font-bold text-gold-500 tracking-widest uppercase">Active</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="animate-fade-in-up [animation-delay:200ms]">
                    <TraceTimeline items={activeRecord.timeline} />
                  </div>

                  {/* Details Grid */}
                  <div className="glass-card p-12 animate-fade-in-up [animation-delay:400ms]">
                     <h4 className="heading-serif text-2xl text-white mb-10">档案主体信息</h4>
                     <div className="grid gap-8 sm:grid-cols-2">
                        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-10 transition-all hover:bg-white/[0.03] hover:border-white/10">
                           <div className="flex items-center gap-4 text-gold-500/60 mb-6">
                              <UserRound className="h-6 w-6" />
                              <span className="text-xs font-bold uppercase tracking-widest">生产者</span>
                           </div>
                           <p className="heading-serif text-3xl text-white mb-3">{activeRecord.rancher.name}</p>
                           <p className="text-sm leading-relaxed text-slate-500">{activeRecord.rancher.role}</p>
                        </div>
                        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-10 transition-all hover:bg-white/[0.03] hover:border-white/10">
                           <div className="flex items-center gap-4 text-gold-500/60 mb-6">
                              <Building2 className="h-6 w-6" />
                              <span className="text-xs font-bold uppercase tracking-widest">监管企业</span>
                           </div>
                           <p className="heading-serif text-3xl text-white mb-3">{activeRecord.enterprise.name}</p>
                           <p className="text-sm leading-relaxed text-slate-500">{activeRecord.enterprise.license}</p>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="space-y-12">
                  {/* Map */}
                  <div className="animate-fade-in-up [animation-delay:600ms]">
                    <TraceMapCard 
                      coordinates={activeRecord.coordinates} 
                      origin={activeRecord.origin} 
                    />
                  </div>

                  {/* Certificates */}
                  <div className="glass-card p-12 animate-fade-in-up [animation-delay:800ms]">
                    <h4 className="heading-serif text-2xl text-white mb-10">合规证明</h4>
                    <div className="grid gap-8">
                      {activeRecord.certificates.map((cert, idx) => (
                        <div key={idx} className="group relative aspect-[16/10] overflow-hidden rounded-[2.5rem] border border-white/10">
                          <LazyImage alt={cert.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" src={cert.src} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
                          <div className="absolute bottom-8 left-8 right-8">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-gold-500 border border-white/10 group-hover:bg-gold-500 group-hover:text-slate-950 transition-all">
                                   <FileCheck2 className="h-6 w-6" />
                                </div>
                                <p className="text-base font-bold text-white tracking-wide">{cert.title}</p>
                             </div>
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
              <div className="glass-card py-40 text-center animate-fade-in-up [animation-delay:400ms]">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.02] border border-white/5 text-slate-800 shadow-premium">
                  <QrCode className="h-12 w-12" />
                </div>
                <h3 className="heading-serif mt-12 text-3xl text-white">等待溯源查询</h3>
                <p className="mt-6 text-slate-500 max-w-md mx-auto leading-relaxed">
                  请输入产品包装上的溯源编号或扫描二维码，
                  系统将为您检索完整的数字化档案与实地影像。
                </p>
                <button
                  className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-gold-500/60 transition-all hover:text-gold-500 hover:tracking-[0.3em]"
                  onClick={() => {
                    const code = traceabilityRecords[0].code;
                    setSearchId(code);
                    const record = findTraceabilityRecord(code);
                    setActiveRecord(record);
                  }}
                  type="button"
                >
                  预览演示数据: {traceabilityRecords[0].code}
                </button>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}

