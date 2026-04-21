import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  KeyRound,
  Lock,
  MapPinned,
  MessageSquareWarning,
  QrCode,
  ShieldCheck,
  Video,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  getFarmerListings,
  isQinghaiLocation,
  updateFarmerListingStatus,
} from '../utils/farmerListingsStore';

const ADMIN_AUTH_CODE = 'XC0115';

function buildObjectUrl(file) {
  if (!file || typeof window === 'undefined') {
    return null;
  }

  return URL.createObjectURL(file);
}

export default function AdminReviewPage() {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('admin_auth') === 'true';
    }
    return false;
  });
  const [inputCode, setInputCode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [listings, setListings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNote, setReviewNote] = useState(
    '已核验视频水印、产地信息与资料完整性。',
  );

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (inputCode === ADMIN_AUTH_CODE) {
      setIsAuthorized(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_auth', 'true');
      }
      setAuthError(false);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const loadListings = async () => {
    try {
      const nextListings = await getFarmerListings();
      setListings(nextListings);
      setSelectedId((current) => current ?? nextListings[0]?.id ?? null);
    } catch {
      setListings([]);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      void loadListings();
    }
  }, [isAuthorized]);

  const selectedListing = useMemo(
    () => listings.find((item) => item.id === selectedId) ?? listings[0] ?? null,
    [listings, selectedId],
  );

  const videoUrl = useMemo(
    () => buildObjectUrl(selectedListing?.videoFile),
    [selectedListing],
  );
  const qrUrl = useMemo(
    () => buildObjectUrl(selectedListing?.qrImage),
    [selectedListing],
  );
  const imageUrls = useMemo(
    () =>
      (selectedListing?.imageFiles ?? []).map((file) => ({
        name: file.name,
        url: buildObjectUrl(file),
      })),
    [selectedListing],
  );

  useEffect(
    () => () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (qrUrl) {
        URL.revokeObjectURL(qrUrl);
      }
      imageUrls.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [imageUrls, qrUrl, videoUrl],
  );

  const handleReview = async (status) => {
    if (!selectedListing) {
      return;
    }

    await updateFarmerListingStatus(selectedListing.id, status, reviewNote);
    await loadListings();
  };

  if (!isAuthorized) {
    return (
      <section className="container-shell flex min-h-[70vh] items-center justify-center py-12">
        <div className="glass-card w-full max-w-md p-10 text-center animate-fade-in">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gold-500/10 text-gold-500 shadow-gold-glow">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="heading-serif text-3xl text-white">审核后台访问受限</h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            请输入管理员授权码以进入审核系统
          </p>

          <form onSubmit={handleAuthSubmit} className="mt-10 space-y-6">
            <div className="relative">
              <KeyRound className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-gold-500/40" />
              <input
                type="password"
                placeholder="输入授权码"
                className={`w-full rounded-2xl border bg-black/40 py-5 pl-16 pr-6 text-white outline-none transition-all ${
                  authError ? 'border-red-500 animate-pulse' : 'border-white/5 focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5'
                }`}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-sm text-red-400 animate-fade-in font-bold">授权码错误，请重新输入</p>
            )}
            <button
              type="submit"
              className="btn-gold w-full !py-5 text-sm tracking-widest uppercase"
            >
              验证并进入
            </button>
          </form>

          <p className="mt-10 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            授权码由项目主理人分发，请妥善保管
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="relative isolate min-h-screen pb-40">
      <div className="plateau-grid-bg"></div>
      <div className="glow-mesh top-[10%] left-[-5%] w-[400px] h-[400px] bg-plateau-900/20"></div>

      <section className="container-shell pt-32 lg:pt-48">
        <div className="mb-16 animate-fade-in-up">
          <div className="animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md">
            Admin Review
          </div>
          <h1 className="heading-serif mt-10 text-4xl text-white sm:text-6xl">
            管理员审核界面
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-slate-400 max-w-3xl">
            用于确认农户提交的视频是否为青海本地实景，并核验数字身份证、水印信息和多媒体证明。
          </p>
        </div>

        <div className="grid gap-10 xl:grid-cols-[0.36fr_0.64fr] animate-fade-in-up [animation-delay:200ms]">
          <aside className="glass-card p-10">
            <h3 className="heading-serif text-2xl text-white mb-4">待审核商品</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-10">
              选择一个农户提交记录查看视频与真实性证明
            </p>

            <div className="space-y-6">
              {listings.length ? (
                listings.map((item) => (
                  <button
                    key={item.id}
                    className={[
                      'w-full rounded-[2.5rem] border p-8 text-left transition-all duration-500',
                      selectedListing?.id === item.id
                        ? 'border-gold-500/30 bg-gold-500/5 shadow-gold-glow'
                        : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10',
                    ].join(' ')}
                    onClick={() => setSelectedId(item.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <p className="heading-serif text-xl text-white group-hover:text-gold-400 transition-colors">
                        {item.productName}
                      </p>
                      {isQinghaiLocation(item.location) ? (
                        <div className="rounded-full bg-gold-500/10 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-gold-500 border border-gold-500/20">
                          本地产地
                        </div>
                      ) : (
                        <div className="rounded-full bg-red-500/10 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-red-400 border border-red-500/20">
                          非青海产地
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{item.timestamp}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-20 text-center text-slate-700">
                   暂无待审核记录
                </div>
              )}
            </div>
          </aside>

          <main className="space-y-10">
            {selectedListing ? (
              <div className="glass-card p-10 lg:p-16">
                <div className="flex flex-wrap items-center justify-between gap-8 mb-12">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-500 shadow-gold-glow">
                      <Video className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="heading-serif text-3xl text-white">{selectedListing.productName}</h4>
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        批次号: {selectedListing.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      className="rounded-full border border-red-500/20 bg-red-500/5 px-8 py-3 text-xs font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500 hover:text-white"
                      onClick={() => handleReview('rejected')}
                    >
                      驳回发布
                    </button>
                    <button
                      className="btn-gold !py-3 !px-8 text-xs tracking-widest uppercase"
                      onClick={() => handleReview('approved')}
                    >
                      通过审核
                    </button>
                  </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-2">
                   <div className="space-y-8">
                      <div className="rounded-[2.5rem] border border-white/5 bg-black/40 p-6">
                        <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                           <MapPinned className="h-4 w-4 text-gold-500" />
                           GPS & 水印核验
                        </div>
                        {videoUrl ? (
                          <video className="aspect-video w-full rounded-3xl object-cover shadow-premium" controls src={videoUrl} />
                        ) : (
                          <div className="aspect-video w-full rounded-3xl bg-white/[0.01] border border-dashed border-white/10 flex items-center justify-center text-slate-700">
                             视频加载失败
                          </div>
                        )}
                        <div className="mt-6 space-y-3">
                           <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-bold uppercase tracking-widest">拍摄坐标</span>
                              <span className="text-white font-mono">{selectedListing.location}</span>
                           </div>
                           <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-bold uppercase tracking-widest">系统判定</span>
                              {isQinghaiLocation(selectedListing.location) ? (
                                <span className="text-gold-500 font-bold">符合高原产地要求</span>
                              ) : (
                                <span className="text-red-400 font-bold">产地信息异常</span>
                              )}
                           </div>
                        </div>
                      </div>

                      <div className="rounded-[2.5rem] border border-white/5 bg-black/40 p-10">
                        <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                           <MessageSquareWarning className="h-4 w-4 text-gold-500" />
                           审核备注
                        </div>
                        <textarea
                          className="w-full rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-sm text-slate-300 outline-none focus:border-gold-500/50 min-h-[120px]"
                          onChange={(e) => setReviewNote(e.target.value)}
                          value={reviewNote}
                        />
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="rounded-[2.5rem] border border-white/5 bg-black/40 p-6">
                        <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                           <BadgeCheck className="h-4 w-4 text-gold-500" />
                           资质与细节图核验
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           {imageUrls.map((img, idx) => (
                             <img key={idx} alt={img.name} className="aspect-square w-full rounded-2xl object-cover shadow-premium" src={img.url} />
                           ))}
                        </div>
                      </div>

                      <div className="rounded-[2.5rem] border border-white/5 bg-black/40 p-6">
                        <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                           <QrCode className="h-4 w-4 text-gold-500" />
                           私域名片核验
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="h-32 w-32 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center overflow-hidden">
                              {qrUrl ? <img alt="QR" className="h-full w-full object-cover" src={qrUrl} /> : <QrCode className="h-10 w-10 text-slate-800" />}
                           </div>
                           <div className="space-y-3">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">联系电话</p>
                              <p className="heading-serif text-2xl text-white">{selectedListing.phone}</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="glass-card flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
                 <ShieldCheck className="h-20 w-20 text-slate-800 opacity-20" />
                 <h4 className="heading-serif mt-8 text-2xl text-white">请在左侧选择待审核记录</h4>
                 <p className="mt-4 text-slate-500">暂无待处理的商品发布申请</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
