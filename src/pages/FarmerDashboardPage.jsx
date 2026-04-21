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
    <div className="mb-6 flex items-start gap-4">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-gold-500 shadow-gold-glow">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="heading-serif text-2xl text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{hint}</p>
      </div>
    </div>
  );
}

function LargeInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-2xl border border-white/5 bg-black/40 px-6 py-5 text-base text-white outline-none transition-all',
        'placeholder:text-slate-700 focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5',
        className,
      ].join(' ')}
    />
  );
}

function UploadButton({ icon: Icon, label, onClick }) {
  return (
    <button
      className="flex min-h-[4rem] w-full items-center justify-center gap-4 rounded-full bg-gold-500 px-8 py-5 text-sm font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-gold-400 hover:shadow-gold-glow active:scale-95"
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
    <div className="relative isolate min-h-screen pb-40">
      <div className="plateau-grid-bg"></div>
      <div className="glow-mesh top-[10%] left-[-5%] w-[400px] h-[400px] bg-plateau-900/20"></div>
      
      <section className="container-shell pt-32 lg:pt-48">
        <div className="mb-16 animate-fade-in-up">
          <div className="animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md">
            Farmer Dashboard
          </div>
          <h1 className="heading-serif mt-10 text-4xl text-white sm:text-6xl">
            农户数字化控制台
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-slate-400 max-w-3xl">
            已认证农户专享。在这里，您可以<span className="text-white font-bold">发布新品</span>、
            上传<span className="text-white font-bold">真实性证明</span>，并维护您的私域名片。
          </p>
        </div>

        <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-card overflow-hidden p-2">
            <div className="h-full rounded-[2.8rem] bg-gradient-to-br from-white/[0.03] to-transparent p-10 lg:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-plateau-mesh opacity-30"></div>
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gold-500">
                    认证农户专用
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    移动端优化
                  </span>
                </div>

                <h3 className="heading-serif text-3xl text-white sm:text-5xl leading-tight">
                  让高原馈赠<br />
                  <span className="text-gradient-gold">直达消费者心间</span>
                </h3>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-400">
                  我们坚持“不介入资金流转”原则，所有的信任链接都建立在您提供的真实影像与私域联系方式之上。
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
            <div className="glass-card p-10 flex flex-col justify-center border-white/5 transition-all hover:bg-white/[0.03]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">已上架商品</p>
              <p className="heading-serif text-4xl text-white">
                {publishedProducts.length} <span className="text-lg">Units</span>
              </p>
            </div>
            <div className="glass-card p-10 flex flex-col justify-center border-white/5 transition-all hover:bg-white/[0.03]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">私域联络电话</p>
              <p className="heading-serif text-3xl text-gold-500">
                {contactForm.phone || '未填写'}
              </p>
            </div>
            <div className="glass-card p-10 flex flex-col justify-center border-white/5 transition-all hover:bg-white/[0.03]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">微信名片状态</p>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gold-500" />
                <span className="text-lg font-bold text-white tracking-wide">已绑定</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-10 xl:grid-cols-[0.68fr_0.32fr] animate-fade-in-up [animation-delay:400ms]">
          <div className="space-y-10">
            <form className="glass-card p-10 lg:p-16" onSubmit={handlePublishSubmit}>
              <SectionHeader
                hint="完善商品详情并上传实景影像素材，让每一份信任都真实可感。"
                icon={Store}
                title="发布高原臻品"
              />

              <div className="grid gap-6 md:grid-cols-2 mt-10">
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
                  placeholder="建议零售价，如：¥168"
                  value={publishForm.price}
                />
                <LargeInput
                  name="stock"
                  onChange={handlePublishChange}
                  placeholder="当前可用库存"
                  value={publishForm.stock}
                />
              </div>

              <div className="mt-12 grid gap-10 xl:grid-cols-2">
                <div className="space-y-6">
                  <UploadButton
                    icon={Video}
                    label={videoFile ? '更新实景视频' : '上传实景视频'}
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
                        ? `更新检疫/细节图 (${imageFiles.length})`
                        : '上传检疫/细节图'
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

                <div className="space-y-6">
                  <div className="rounded-[2.5rem] border border-white/5 bg-black/40 p-6">
                    <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <Video className="h-4 w-4 text-gold-500" />
                      <span>实景影像预览</span>
                    </div>
                    {videoPreview ? (
                      <video
                        className="h-64 w-full rounded-3xl object-cover shadow-premium"
                        controls
                        src={videoPreview}
                      />
                    ) : (
                      <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-white/[0.01] border border-dashed border-white/10 text-slate-700">
                        <Upload className="h-10 w-10 opacity-20" />
                        <p className="mt-4 text-xs tracking-widest uppercase">等待视频上传</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-[2.5rem] border border-white/5 bg-black/40 p-6">
                    <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <Camera className="h-4 w-4 text-gold-500" />
                      <span>细节图片预览</span>
                    </div>
                    {imagePreviews.length ? (
                      <div className="grid grid-cols-3 gap-3">
                        {imagePreviews.map((item) => (
                          <img
                            key={item.url}
                            alt={item.name}
                            className="aspect-square rounded-2xl object-cover shadow-premium"
                            src={item.url}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-40 flex-col items-center justify-center rounded-3xl bg-white/[0.01] border border-dashed border-white/10 text-slate-700">
                        <ImagePlus className="h-10 w-10 opacity-20" />
                        <p className="mt-4 text-xs tracking-widest uppercase">等待图片上传</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between border-t border-white/5 pt-10">
                <div className="flex items-start gap-4">
                  <div className="h-6 w-6 rounded-full bg-gold-500/10 flex items-center justify-center mt-1">
                    <CheckCircle2 className="h-4 w-4 text-gold-500" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500">{submitMessage}</p>
                </div>

                <button
                  className="btn-gold !py-5 !px-12 text-sm tracking-widest uppercase"
                  type="submit"
                >
                  立即发布商品
                </button>
              </div>
            </form>

            <div className="glass-card p-10 lg:p-16">
              <SectionHeader
                hint="展示您的全部上架商品，可随时进行数字化下架操作。"
                icon={Package}
                title="我的上架臻品"
              />

              <div className="grid gap-6 sm:grid-cols-2 mt-10">
                {publishedProducts.length ? (
                  publishedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 transition-all hover:bg-white/[0.03] hover:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="heading-serif text-2xl text-white group-hover:text-gold-400 transition-colors">
                            {product.name}
                          </p>
                          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                            {product.specs}
                          </p>
                        </div>
                        <span className="rounded-full bg-gold-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gold-500 border border-gold-500/20">
                          {product.status}
                        </span>
                      </div>

                      <div className="mt-8 grid gap-4 grid-cols-2">
                        <div className="rounded-2xl border border-white/5 bg-black/40 p-5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">建议价</p>
                          <p className="text-lg heading-serif text-white">{product.price}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-black/40 p-5 text-right">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">库存</p>
                          <p className="text-lg heading-serif text-gold-500">{product.stock}</p>
                        </div>
                      </div>

                      <button
                        className="mt-6 w-full py-4 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/20 flex items-center justify-center gap-3"
                        onClick={() => handleTakeDown(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        下架该商品
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-20 text-center text-slate-700">
                     暂无已发布商品
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="glass-card p-10 lg:p-12 sticky top-40">
              <SectionHeader
                hint="维护您的联系方式，确保消费者能快速与您建立私域连接。"
                icon={Phone}
                title="数字化名片"
              />

              <div className="space-y-8 mt-10">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-500/40" />
                  <LargeInput
                    className="pl-16"
                    name="phone"
                    onChange={handleContactChange}
                    placeholder="请输入手机号"
                    type="tel"
                    value={contactForm.phone}
                  />
                </div>

                <UploadButton
                  icon={QrCode}
                  label={qrFile ? '更换微信二维码' : '上传微信二维码'}
                  onClick={() => document.getElementById('dashboard-qr-upload')?.click()}
                />
                <input
                  accept="image/*"
                  className="hidden"
                  id="dashboard-qr-upload"
                  onChange={(event) => handleQrUpload(event.target.files?.[0] ?? null)}
                  type="file"
                />

                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    <QrCode className="h-4 w-4 text-gold-500" />
                    二维码预览
                  </div>
                  <div className="aspect-square rounded-3xl border border-dashed border-white/10 bg-black/40 flex items-center justify-center overflow-hidden">
                    {qrPreview ? (
                      <img
                        alt="微信二维码预览"
                        className="h-full w-full object-cover"
                        src={qrPreview}
                      />
                    ) : (
                      <div className="text-center text-slate-800">
                        <QrCode className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">等待上传</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 truncate">
                    {contactForm.wechatQrLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
