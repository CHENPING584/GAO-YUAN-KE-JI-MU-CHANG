import { ArrowLeft, Clock3, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AuditStatusPage() {
  const location = useLocation();
  const submittedAt = location.state?.submittedAt
    ? new Date(location.state.submittedAt).toLocaleString('zh-CN', {
        hour12: false,
      })
    : null;

  return (
    <section className="container-shell flex min-h-[72vh] items-center justify-center py-12 sm:py-16">
      <div className="glass-card w-full max-w-3xl overflow-hidden p-6 sm:p-10">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(245,158,11,0.18),rgba(15,23,42,0.45))] p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-amber-100">
            <LoaderCircle className="h-10 w-10 animate-spin" />
          </div>

          <p className="mt-6 text-sm uppercase tracking-[0.25em] text-amber-100/80">
            Pending Review
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            你的发布者申请已进入审核中
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200">
            平台已收到你的资料与真实性素材，预计 24 小时内完成审核。审核通过后，你将自动获得农户发布权限。
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock3 className="h-4 w-4 text-amber-200" />
              <span>审核时效</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">预计 24 小时内</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <ShieldCheck className="h-4 w-4 text-sky-200" />
              <span>当前角色</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">pending_farmer</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock3 className="h-4 w-4 text-plateau-200" />
              <span>提交时间</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
              {submittedAt ?? '刚刚提交'}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">审核期间你可以做什么</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <p>继续完善溯源资料与牧场素材，方便后续更快发布产品。</p>
            <p>确保联系电话与微信号可用，以便平台联系核验。</p>
            <p>若 24 小时后仍未收到结果，可通过私域入口联系项目方复核。</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-plateau-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-plateau-400"
            to="/"
          >
            返回首页
          </Link>
          <Link
            className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 py-4 text-base font-semibold text-slate-100 transition hover:bg-white/10"
            to="/connect"
          >
            <ArrowLeft className="h-5 w-5" />
            联系项目团队
          </Link>
        </div>
      </div>
    </section>
  );
}
