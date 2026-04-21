import {
  Camera,
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  Package,
  Phone,
  QrCode,
  Store,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const initialPublishedProducts = [
  {
    id: 'farmer-yak-1',
    name: '玉树生态牦牛前腿肉',
    specs: '2kg / 箱',
    price: '¥198',
    stock: '12',
    status: '在售中',
  },
  {
    id: 'farmer-lamb-2',
    name: '高原藏羊分割礼盒',
    specs: '1.5kg / 盒',
    price: '¥268',
    stock: '8',
    status: '在售中',
  },
  {
    id: 'farmer-barley-3',
    name: '青稞健康组合装',
    specs: '750g / 盒',
    price: '¥88',
    stock: '36',
    status: '在售中',
  },
];

function SectionHeader({ icon: Icon, title, hint }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="rounded-2xl bg-plateau-500/15 p-3 text-plateau-200">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{hint}</p>
      </div>
    </div>
  );
}

function LargeInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-white outline-none transition',
        'placeholder:text-slate-500 focus:border-plateau-400',
        className,
      ].join(' ')}
    />
  );
}

function UploadButton({ icon: Icon, label, onClick }) {
  return (
    <button
      className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-plateau-500 px-5 py-4 text-base font-medium text-white transition hover:bg-plateau-400"
      onClick={onClick}
      type="button"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

export default function FarmerDashboardPage() {
  const [publishForm, setPublishForm] = useState({
    productName: '',
    specs: '',
    price: '',
    stock: '',
  });
  const [contactForm, setContactForm] = useState({
    phone: '189-9701-2234',
    wechatQrLabel: '当前已绑定微信二维码',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [qrFile, setQrFile] = useState(null);
  const [publishedProducts, setPublishedProducts] = useState(initialPublishedProducts);
  const [submitMessage, setSubmitMessage] = useState(
    '填写商品信息并上传素材后，即可快速发布到农户控制台。',
  );

  const videoPreview = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : null),
    [videoFile],
  );
  const qrPreview = useMemo(
    () => (qrFile ? URL.createObjectURL(qrFile) : null),
    [qrFile],
  );
  const imagePreviews = useMemo(
    () =>
      imageFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [imageFiles],
  );

  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      if (qrPreview) {
        URL.revokeObjectURL(qrPreview);
      }
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imagePreviews, qrPreview, videoPreview]);

  const handlePublishChange = (event) => {
    const { name, value } = event.target;
    setPublishForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePublishSubmit = (event) => {
    event.preventDefault();

    if (
      !publishForm.productName ||
      !publishForm.specs ||
      !publishForm.price ||
      !publishForm.stock
    ) {
      setSubmitMessage('请完整填写商品名称、规格、价格和库存。');
      return;
    }

    const nextProduct = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}`,
      name: publishForm.productName,
      specs: publishForm.specs,
      price: publishForm.price,
      stock: publishForm.stock,
      status: '在售中',
    };

    setPublishedProducts((current) => [nextProduct, ...current]);
    setPublishForm({
      productName: '',
      specs: '',
      price: '',
      stock: '',
    });
    setVideoFile(null);
    setImageFiles([]);
    setSubmitMessage('新商品已加入已发布列表，你可以继续补充更多商品。');
  };

  const handleTakeDown = (productId) => {
    setPublishedProducts((current) =>
      current.filter((product) => product.id !== productId),
    );
    setSubmitMessage('商品已成功下架。');
  };

  const handleQrUpload = (file) => {
    setQrFile(file);

    if (file) {
      setContactForm((current) => ({
        ...current,
        wechatQrLabel: file.name,
      }));
    }
  };

  return (
    <section className="container-shell py-12 sm:py-16">
      <div className="mb-8 max-w-4xl">
        <p className="text-sm uppercase tracking-[0.25em] text-plateau-200">
          Farmer Dashboard
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          农户控制台
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          仅开放给已通过审核的 `farmer` 用户，用于发布商品、维护私域名片，以及管理自己已上架的商品。
        </p>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-card overflow-hidden p-8">
          <div className="rounded-[2rem] border border-plateau-300/10 bg-[linear-gradient(135deg,rgba(61,168,117,0.2),rgba(14,165,233,0.12),rgba(15,23,32,0.45))] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-plateau-300/20 bg-plateau-500/10 px-4 py-2 text-sm text-plateau-200">
                仅限已认证农户
              </span>
              <span className="rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200">
                手机端优先
              </span>
            </div>

            <h3 className="mt-6 text-3xl font-semibold text-white">
              发布商品并维护你的私域联系入口
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              消费者在商城或详情页看中你的商品后，会直接通过你维护的电话或微信联系你，因此这套控制台同时兼顾发品与私域承接。
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="glass-card p-5">
            <p className="text-sm text-slate-400">已发布商品</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {publishedProducts.length} 个
            </p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm text-slate-400">私域电话</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {contactForm.phone || '未填写'}
            </p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm text-slate-400">素材上传</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              视频 {videoFile ? '1' : '0'} / 图片 {imageFiles.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.68fr_0.32fr]">
        <div className="space-y-6">
          <form className="glass-card p-6 sm:p-8" onSubmit={handlePublishSubmit}>
            <SectionHeader
              hint="填写商品名称、规格、价格和库存，并补充实景视频与检疫图片。"
              icon={Store}
              title="发布新商品"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <LargeInput
                  name="productName"
                  onChange={handlePublishChange}
                  placeholder="商品名称，如：玉树有机牦牛肉"
                  value={publishForm.productName}
                />
              </div>
              <LargeInput
                name="specs"
                onChange={handlePublishChange}
                placeholder="规格，如：500g / 盒"
                value={publishForm.specs}
              />
              <LargeInput
                name="price"
                onChange={handlePublishChange}
                placeholder="价格，如：¥168"
                value={publishForm.price}
              />
              <LargeInput
                name="stock"
                onChange={handlePublishChange}
                placeholder="库存，如：24"
                value={publishForm.stock}
              />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-4">
                <UploadButton
                  icon={Video}
                  label={videoFile ? '重新上传实景视频' : '上传实景视频'}
                  onClick={() => document.getElementById('dashboard-video-upload')?.click()}
                />
                <input
                  accept="video/*"
                  className="hidden"
                  id="dashboard-video-upload"
                  onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                  type="file"
                />

                <UploadButton
                  icon={ImagePlus}
                  label={
                    imageFiles.length
                      ? `继续上传肉质 / 检疫图片 (${imageFiles.length})`
                      : '上传肉质 / 检疫图片'
                  }
                  onClick={() => document.getElementById('dashboard-image-upload')?.click()}
                />
                <input
                  accept="image/*"
                  className="hidden"
                  id="dashboard-image-upload"
                  multiple
                  onChange={(event) =>
                    setImageFiles(Array.from(event.target.files ?? []))
                  }
                  type="file"
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                    <Video className="h-4 w-4 text-sky-200" />
                    <span>实景视频预览</span>
                  </div>
                  {videoPreview ? (
                    <video
                      className="h-64 w-full rounded-2xl object-cover"
                      controls
                      src={videoPreview}
                    />
                  ) : (
                    <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white/5 text-slate-400">
                      <Upload className="h-10 w-10" />
                      <p className="mt-3 text-sm">上传后显示实景视频预览</p>
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                    <Camera className="h-4 w-4 text-plateau-200" />
                    <span>图片预览</span>
                  </div>
                  {imagePreviews.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {imagePreviews.map((item) => (
                        <img
                          key={item.url}
                          alt={item.name}
                          className="aspect-square rounded-2xl object-cover"
                          src={item.url}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-2xl bg-white/5 text-slate-400">
                      <ImagePlus className="h-10 w-10" />
                      <p className="mt-3 text-sm">上传后展示肉质与检疫图片</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-300" />
                <p className="text-sm leading-6 text-slate-300">{submitMessage}</p>
              </div>

              <button
                className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-sky-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-400"
                type="submit"
              >
                发布新商品
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="glass-card p-6 sm:p-8">
            <SectionHeader
              hint="消费者看中您的商品后，将直接通过此处的电话或微信与您联系，请保持畅通。"
              icon={Phone}
              title="我的私域名片"
            />

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <LargeInput
                    className="pl-12"
                    name="phone"
                    onChange={handleContactChange}
                    placeholder="请输入手机号"
                    type="tel"
                    value={contactForm.phone}
                  />
                </div>

                <UploadButton
                  icon={QrCode}
                  label={qrFile ? '重新上传微信二维码' : '一键上传微信二维码'}
                  onClick={() => document.getElementById('dashboard-qr-upload')?.click()}
                />
                <input
                  accept="image/*"
                  className="hidden"
                  id="dashboard-qr-upload"
                  onChange={(event) => handleQrUpload(event.target.files?.[0] ?? null)}
                  type="file"
                />

                <div className="rounded-2xl border border-plateau-300/20 bg-plateau-500/10 p-4 text-sm text-plateau-100">
                  当前二维码：{contactForm.wechatQrLabel}
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-4">
                {qrPreview ? (
                  <img
                    alt="微信二维码预览"
                    className="h-56 w-full rounded-2xl object-cover"
                    src={qrPreview}
                  />
                ) : (
                  <div className="flex h-56 flex-col items-center justify-center rounded-2xl bg-white/5 text-slate-400">
                    <QrCode className="h-10 w-10" />
                    <p className="mt-3 text-sm">微信二维码预览区</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <SectionHeader
              hint="瀑布流展示你自己上架的商品，可随时一键下架。"
              icon={Package}
              title="已发布商品"
            />

            <div className="columns-1 gap-4 md:columns-2">
              {publishedProducts.length ? (
                publishedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="mb-4 break-inside-avoid rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-semibold text-white">
                          {product.name}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          {product.specs}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                        {product.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs text-slate-400">价格</p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {product.price}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs text-slate-400">库存</p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {product.stock}
                        </p>
                      </div>
                    </div>

                    <button
                      className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20"
                      onClick={() => handleTakeDown(product.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      一键下架
                    </button>
                  </div>
                ))
              ) : (
                <div className="break-inside-avoid rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm leading-6 text-slate-400">
                  暂无已发布商品。你可以先在上方“发布新商品”板块创建第一条商品。
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white">控制台提醒</h3>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                商品的实景视频越清晰，越有助于消费者快速建立信任。
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                私域名片中的电话和微信二维码要保持最新，避免错失咨询线索。
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                已发布商品支持即时下架，适合库存变动或临时停售场景。
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white">当前名片摘要</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">联系电话</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {contactForm.phone || '未填写'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">二维码状态</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {qrFile ? '已更新' : '待确认'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">商品总数</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {publishedProducts.length}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
