import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
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

function buildObjectUrl(file) {
  if (!file) {
    return null;
  }

  return URL.createObjectURL(file);
}

export default function AdminReviewPage() {
  const [listings, setListings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNote, setReviewNote] = useState(
    '已核验视频水印、产地信息与资料完整性。',
  );

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
    void loadListings();
  }, []);

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

  return (
    <section className="container-shell py-12 sm:py-16">
      <div className="mb-8 max-w-4xl">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
          Admin Review
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          管理员审核界面
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          用于确认农户提交的视频是否为青海本地实景，并核验数字身份证、水印信息和多媒体证明。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
        <aside className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white">待审核商品</h3>
          <p className="mt-2 text-sm text-slate-400">
            选择一个农户提交记录查看视频与真实性证明
          </p>

          <div className="mt-6 space-y-4">
            {listings.length ? (
              listings.map((item) => (
                <button
                  key={item.id}
                  className={[
                    'w-full rounded-3xl border p-5 text-left transition',
                    selectedListing?.id === item.id
                      ? 'border-sky-300/40 bg-sky-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10',
                  ].join(' ')}
                  onClick={() => setSelectedId(item.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-white">
                      {item.productName}
                    </p>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{item.origin}</p>
                  <p className="mt-3 text-xs text-slate-500">{item.digitalId}</p>
                </button>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm leading-6 text-slate-400">
                当前还没有农户提交的待审核商品。请先在“农户后台”完成一次产品发布。
              </div>
            )}
          </div>
        </aside>

        <div className="space-y-6">
          {selectedListing ? (
            <>
              <div className="glass-card p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200">
                        {selectedListing.status}
                      </span>
                      <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
                        {selectedListing.priceCategory}
                      </span>
                    </div>

                    <h3 className="mt-5 text-3xl font-semibold text-white">
                      {selectedListing.productName}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      产地：{selectedListing.origin}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                    <p className="text-sm text-slate-400">数字身份证 ID</p>
                    <p className="mt-2 max-w-xs break-all text-sm font-semibold text-white">
                      {selectedListing.digitalId}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sky-200">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-sm">拍摄时间戳</span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">
                      {selectedListing.watermark?.timestamp ?? '未记录'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sky-200">
                      <MapPinned className="h-4 w-4" />
                      <span className="text-sm">定位信息</span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">
                      {selectedListing.watermark?.latitude &&
                      selectedListing.watermark?.longitude
                        ? `${selectedListing.watermark.latitude}, ${selectedListing.watermark.longitude}`
                        : selectedListing.watermark?.region ?? '未记录'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-emerald-200">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-sm">青海核验</span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">
                      {isQinghaiLocation({
                        ...selectedListing.watermark,
                        origin: selectedListing.origin,
                      })
                        ? '匹配青海区域'
                        : '需人工复核'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-emerald-200">
                      <BadgeCheck className="h-4 w-4" />
                      <span className="text-sm">提交状态</span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">
                      {selectedListing.reviewNote}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <div className="glass-card p-6 sm:p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <Video className="h-5 w-5 text-sky-200" />
                    <h3 className="text-xl font-semibold text-white">视频核验</h3>
                  </div>

                  {videoUrl ? (
                    <div className="relative">
                      <video
                        className="h-72 w-full rounded-3xl object-cover"
                        controls
                        src={videoUrl}
                      />
                      <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-slate-950/75 p-3 text-xs text-white backdrop-blur">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span>
                            时间戳：{selectedListing.watermark?.timestamp ?? '未记录'}
                          </span>
                          <span>
                            地点：
                            {selectedListing.watermark?.latitude &&
                            selectedListing.watermark?.longitude
                              ? `${selectedListing.watermark.latitude}, ${selectedListing.watermark.longitude}`
                              : selectedListing.watermark?.region ?? selectedListing.origin}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-72 flex-col items-center justify-center rounded-3xl bg-white/5 text-slate-400">
                      <Video className="h-10 w-10" />
                      <p className="mt-3 text-sm">未找到可预览视频，请核对农户上传资料</p>
                    </div>
                  )}

                  <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                    审核重点：视频场景是否为青海牧场/高原草地、拍摄时间是否合理、定位是否与产地描述一致。
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <QrCode className="h-5 w-5 text-plateau-200" />
                      <h3 className="text-xl font-semibold text-white">私域与图片资料</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-slate-400">联系电话</p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {selectedListing.phone || '未填写'}
                        </p>
                      </div>

                      {qrUrl && (
                        <img
                          alt="微信二维码"
                          className="h-56 w-full rounded-3xl object-cover"
                          src={qrUrl}
                        />
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {imageUrls.length ? (
                          imageUrls.map((item) => (
                            <img
                              key={item.url}
                              alt={item.name}
                              className="aspect-square rounded-2xl object-cover"
                              src={item.url}
                            />
                          ))
                        ) : (
                          <div className="col-span-2 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                            暂无图片资料
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <MessageSquareWarning className="h-5 w-5 text-sky-200" />
                      <h3 className="text-xl font-semibold text-white">审核意见</h3>
                    </div>

                    <textarea
                      className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-plateau-400"
                      onChange={(event) => setReviewNote(event.target.value)}
                      placeholder="填写审核备注"
                      value={reviewNote}
                    />

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-base font-medium text-white transition hover:bg-emerald-400"
                        onClick={() => void handleReview('已通过')}
                        type="button"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        确认青海本地实景
                      </button>
                      <button
                        className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 text-base font-medium text-white transition hover:bg-rose-400"
                        onClick={() => void handleReview('退回补充')}
                        type="button"
                      >
                        <XCircle className="h-5 w-5" />
                        退回补充
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 text-sm leading-7 text-slate-400">
              暂无审核数据，请先在 `农户后台` 提交一条包含视频和图片的产品记录。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
