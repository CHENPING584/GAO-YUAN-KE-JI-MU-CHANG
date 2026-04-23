import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  MapPinned,
  Phone,
  ShieldCheck,
  Upload,
  UserRound,
  Video,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applyForFarmer, getCurrentProfile } from '../lib/supabase/farmerAccess.ts';
import { getSupabaseBrowserClient } from '../lib/supabase/client';

const STORAGE_BUCKET = 'farmer-media';

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

function LargeTextArea({ className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={[
        'min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-white outline-none transition',
        'placeholder:text-slate-500 focus:border-plateau-400',
        className,
      ].join(' ')}
    />
  );
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export default function ApplyFarmerPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    realName: '',
    phone: '',
    wechat: '',
    ranchLocation: '',
  });
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState({
    type: 'idle',
    message: '提交后将进入审核中状态，预计 24 小时内完成审核。',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booting, setBooting] = useState(true);

  const videoFiles = useMemo(
    () => files.filter((file) => file.type.startsWith('video/')),
    [files],
  );
  const imageFiles = useMemo(
    () => files.filter((file) => file.type.startsWith('image/')),
    [files],
  );
  const previewItems = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewItems]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const client = getSupabaseBrowserClient();

      if (!client) {
        if (!cancelled) {
          setBooting(false);
          setStatus({
            type: 'warning',
            message:
              '尚未配置 Supabase 环境变量，请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。',
          });
        }
        return;
      }

      try {
        const profile = await getCurrentProfile(client);

        if (cancelled) {
          return;
        }

        setFormData((current) => ({
          ...current,
          phone: profile.phone ?? '',
          wechat: profile.wechat_qr_url ?? '',
          ranchLocation: profile.ranch_location ?? '',
        }));

        if (profile.role === 'pending_farmer') {
          navigate('/audit-status', { replace: true });
          return;
        }

        if (profile.role === 'farmer') {
          navigate('/dashboard/farmer', { replace: true });
          return;
        }
      } catch {
        if (!cancelled) {
          setStatus({
            type: 'idle',
            message: '请先填写基础资料与证明素材，提交时系统会校验当前服务状态。',
          });
        }
      } finally {
        if (!cancelled) {
          setBooting(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setFiles(nextFiles);
  };

  const uploadMedia = async (client, userId) => {
    if (!videoFiles.length) {
      throw new Error('请至少上传一段牧场放牧或自荐视频。');
    }

    const submissionKey = `${userId}/${Date.now()}`;
    const primaryVideo = videoFiles[0];
    const videoPath = `${submissionKey}/video-${sanitizeFileName(primaryVideo.name)}`;

    const { error: videoError } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(videoPath, primaryVideo, {
        upsert: false,
        cacheControl: '3600',
      });

    if (videoError) {
      throw new Error('证明视频上传失败，请确认 Supabase Storage 已创建 farmer-media bucket。');
    }

    await Promise.all(
      imageFiles.map(async (file, index) => {
        const imagePath = `${submissionKey}/images/${index + 1}-${sanitizeFileName(file.name)}`;
        const { error } = await client.storage.from(STORAGE_BUCKET).upload(imagePath, file, {
          upsert: false,
          cacheControl: '3600',
        });

        if (error) {
          throw new Error('补充图片上传失败，请稍后重试。');
        }
      }),
    );

    const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(videoPath);
    return data.publicUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const client = getSupabaseBrowserClient();

    if (!client) {
      setStatus({
        type: 'error',
        message:
          '尚未配置 Supabase 环境变量，当前无法提交申请。请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。',
      });
      return;
    }

    if (!formData.realName || !formData.phone || !formData.wechat || !formData.ranchLocation) {
      setStatus({
        type: 'error',
        message: '请完整填写真实姓名、联系电话、微信号和牧场详细地址。',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({
      type: 'loading',
      message: '正在上传证明素材并提交发布者申请，请稍候...',
    });

    try {
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user) {
        throw new Error('当前发布者申请通道暂未完成身份校验接入，请先确保 Supabase 认证服务可访问后再提交。');
      }

      const videoUrl = await uploadMedia(client, user.id);

      const application = await applyForFarmer(client, {
        real_name: formData.realName,
        id_card: `${formData.realName}-待补录`,
        ranch_proof_video: videoUrl,
        phone: formData.phone,
        // 当前 schema 仅提供 wechat_qr_url 字段，这里先写入微信号字符串。
        wechat_qr_url: formData.wechat,
        ranch_location: formData.ranchLocation,
      });

      navigate('/audit-status', {
        replace: true,
        state: {
          applicationId: application.id,
          submittedAt: application.created_at,
        },
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : '提交失败，请稍后重试。',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container-shell py-12 sm:py-16">
      <div className="mb-8 max-w-4xl">
        <p className="text-sm uppercase tracking-[0.25em] text-plateau-200">
          Apply Publisher
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          申请成为发布者
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          完成基础身份信息和真实性素材提交后，资料将进入平台审核流程。审核通过后即可进入农户控制台发布产品。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
        <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
          <div className="glass-card p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-2xl bg-plateau-500/15 p-3 text-plateau-200">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">基础资料</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  请填写真实身份信息，便于平台审核与你后续发布产品时建立可信档案。
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <LargeInput
                name="realName"
                onChange={handleChange}
                placeholder="真实姓名"
                value={formData.realName}
              />
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <LargeInput
                  className="pl-12"
                  name="phone"
                  onChange={handleChange}
                  placeholder="联系电话"
                  type="tel"
                  value={formData.phone}
                />
              </div>
              <LargeInput
                name="wechat"
                onChange={handleChange}
                placeholder="微信号"
                value={formData.wechat}
              />
              <div className="relative">
                <MapPinned className="pointer-events-none absolute left-4 top-6 h-5 w-5 text-slate-500" />
                <LargeTextArea
                  className="pl-12"
                  name="ranchLocation"
                  onChange={handleChange}
                  placeholder="牧场详细地址"
                  value={formData.ranchLocation}
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">真实性素材上传</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  请拍摄一段您在牧场放牧或自荐的短视频，以证明真实性。
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-5">
              <button
                className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-plateau-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-plateau-400"
                onClick={() => document.getElementById('publisher-media-upload')?.click()}
                type="button"
              >
                <Upload className="h-5 w-5" />
                选择视频和图片素材
              </button>
              <input
                accept="video/*,image/*"
                className="hidden"
                id="publisher-media-upload"
                multiple
                onChange={handleFileSelect}
                type="file"
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Video className="h-4 w-4 text-sky-200" />
                    <span>视频素材</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {videoFiles.length} 个
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <ImagePlus className="h-4 w-4 text-plateau-200" />
                    <span>图片素材</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {imageFiles.length} 张
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {previewItems.length ? (
                previewItems.map((item) =>
                  item.file.type.startsWith('video/') ? (
                    <video
                      key={item.url}
                      className="h-56 w-full rounded-3xl object-cover"
                      controls
                      src={item.url}
                    />
                  ) : (
                    <img
                      key={item.url}
                      alt={item.file.name}
                      className="h-56 w-full rounded-3xl object-cover"
                      src={item.url}
                    />
                  ),
                )
              ) : (
                <div className="md:col-span-2 flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-slate-400">
                  <Upload className="h-10 w-10" />
                  <p className="mt-3 text-sm">
                    支持上传视频和图片，视频为必填，图片为补充审核材料
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <div
              className={`rounded-2xl px-4 py-4 text-sm leading-6 ${
                status.type === 'error'
                  ? 'border border-rose-300/20 bg-rose-500/10 text-rose-100'
                  : status.type === 'warning'
                    ? 'border border-amber-300/20 bg-amber-500/10 text-amber-100'
                    : 'border border-emerald-300/20 bg-emerald-500/10 text-emerald-100'
              }`}
            >
              {status.message}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-sky-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting || booting}
                type="submit"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                提交申请
              </button>
              <Link
                className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 py-4 text-base font-semibold text-slate-100 transition hover:bg-white/10"
                to="/"
              >
                返回首页
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white">申请说明</h3>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                提交申请后会向 `farmer_applications` 写入记录，并把你的账户流转到 `pending_farmer`。
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                建议自拍视频控制在 30 秒到 90 秒，能清晰体现草场、棚圈或本人出镜。
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                图片可补充牧场环境、牲畜状态、合作证明等材料，帮助审核更快通过。
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white">状态流转</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-plateau-300/20 bg-plateau-500/10 p-4 text-sm text-plateau-100">
                `user`：普通消费者，可浏览与咨询
              </div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                `pending_farmer`：资料已提交，等待审核
              </div>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                `farmer`：审核通过，可进入农户控制台发布产品
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
