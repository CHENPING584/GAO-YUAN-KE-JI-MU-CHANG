import {
  ArrowLeft,
  BadgeCheck,
  MessageCircleMore,
  Phone,
  QrCode,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getProductById } from '../data/showcaseProducts';

function ModalQrCard({ name }) {
  return (
    <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-3xl border border-dashed border-plateau-300/40 bg-white/5">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-plateau-500/15 text-plateau-200">
          <QrCode className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm text-slate-300">联系牧民 / 主理人二维码</p>
          <p className="mt-1 text-xs text-slate-500">{name}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [showContact, setShowContact] = useState(false);

  const product = useMemo(() => getProductById(productId), [productId]);

  if (!product) {
    return <Navigate to="/showcase" replace />;
  }

  return (
    <section className="container-shell py-12 sm:py-16">
      <Link
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        to="/showcase"
      >
        <ArrowLeft className="h-4 w-4" />
        返回农场商城
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="glass-card overflow-hidden">
          <img
            alt={product.name}
            className="h-full min-h-[320px] w-full object-cover"
            loading="lazy"
            src={product.image}
          />
        </div>

        <div className="glass-card p-6 sm:p-8">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-plateau-500 px-4 py-2 text-sm text-white">
              {product.origin}
            </span>
            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
              {product.category}
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            {product.name}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            {product.story}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.features.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-plateau-300/20 bg-plateau-500/10 px-3 py-1 text-xs text-plateau-100"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">零售价</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {product.pricing.retail}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">批发价</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {product.pricing.wholesale}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">礼盒价</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {product.pricing.gift}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">规格</p>
              <p className="mt-2 text-base font-medium text-white">
                {product.specs}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">溯源码</p>
              <p className="mt-2 text-base font-medium text-white">
                {product.traceCode}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-200" />
              <div>
                <p className="text-sm font-medium text-amber-100">互动逻辑说明</p>
                <p className="mt-2 text-sm leading-6 text-amber-50/90">
                  详情页不设置购物车和在线支付入口，统一通过“联系牧民”按钮进入私域沟通，符合项目不介入资金流转的要求。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-plateau-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-plateau-400"
              onClick={() => setShowContact(true)}
              type="button"
            >
              <MessageCircleMore className="h-5 w-5" />
              联系牧民
            </button>
            <Link
              className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 py-4 text-base font-semibold text-slate-100 transition hover:bg-white/10"
              to="/traceability"
            >
              <Store className="h-5 w-5" />
              查看溯源档案
            </Link>
          </div>
        </div>
      </div>

      <div className="glass-card mt-6 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <BadgeCheck className="h-5 w-5 text-plateau-200" />
          <h3 className="text-xl font-semibold text-white">联系信息</h3>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">联系人</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {product.contact.owner}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Phone className="h-4 w-4" />
              <span>联系电话</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-white">
              {product.contact.phone}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">微信号</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {product.contact.wechat}
            </p>
          </div>
        </div>
      </div>

      {showContact && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 sm:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-plateau-200">
                Connect Farmer
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {product.name}
              </h3>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              当前详情页不提供购物车。如需购买、批发或礼盒定制，请直接联系牧民或私域主理人完成后续沟通。
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
              <ModalQrCard name={product.contact.owner} />

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">联系人</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {product.contact.owner}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="h-4 w-4" />
                    <span>牧民联系方式</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {product.contact.phone}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    微信号：{product.contact.wechat}
                  </p>
                </div>
              </div>
            </div>

            <button
              className="mt-6 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              onClick={() => setShowContact(false)}
              type="button"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
