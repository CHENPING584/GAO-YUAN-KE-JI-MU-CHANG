import {
  BadgeCheck,
  ChevronRight,
  MessageCircleMore,
  Package,
  Phone,
  QrCode,
  Sprout,
  Store,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, products } from '../data/showcaseProducts';

function ModalQrCard({ name }) {
  return (
    <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-3xl border border-dashed border-plateau-300/40 bg-white/5">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-plateau-500/15 text-plateau-200">
          <QrCode className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm text-slate-300">私域主理人二维码</p>
          <p className="mt-1 text-xs text-slate-500">{name}</p>
        </div>
      </div>
    </div>
  );
}

export default function ShowcasePage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const visibleProducts = useMemo(() => {
    if (activeCategory === '全部') {
      return products;
    }

    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="container-shell py-12 sm:py-16">
      <div className="mb-8 max-w-4xl">
        <p className="text-sm uppercase tracking-[0.25em] text-plateau-200">
          Showcase
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          农场商城展示墙
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          结合项目书中的三级差异化定价策略，面向零售用户、批量采购方和礼赠客户提供不同规格价格展示；
          页面仅做展示与咨询引流，不介入支付和资金流转。
        </p>
      </div>

      <div className="glass-card mb-8 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">产品分类</h3>
            <p className="mt-2 text-sm text-slate-400">
              展示牦牛肉、藏羊、青稞、枸杞等高原特色产品
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                className={[
                  'rounded-full px-4 py-2 text-sm transition',
                  activeCategory === category
                    ? 'bg-plateau-500 text-white'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
                ].join(' ')}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {visibleProducts.map((product) => (
          <article key={product.id} className="glass-card overflow-hidden">
            <div className="grid h-full gap-0 md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-72 overflow-hidden">
                <img
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  src={product.image}
                />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-950/75 px-3 py-1 text-xs text-white">
                    {product.category}
                  </span>
                  <span className="rounded-full bg-plateau-500 px-3 py-1 text-xs text-white">
                    {product.origin}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      className="text-2xl font-semibold text-white transition hover:text-plateau-200"
                      to={`/showcase/${product.id}`}
                    >
                      {product.name}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {product.description}
                    </p>
                  </div>
                  <Package className="h-5 w-5 shrink-0 text-plateau-300" />
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">
                    规格：{product.specs}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">
                    溯源码：{product.traceCode}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
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

                <div className="mt-6 flex items-center gap-3 text-sm text-slate-300">
                  <BadgeCheck className="h-4 w-4 text-plateau-300" />
                  <span>展示型商城，不直接处理支付，统一转私域主理人承接咨询。</span>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    className="flex items-center justify-center gap-2 rounded-full bg-plateau-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-plateau-400"
                    onClick={() => setSelectedProduct(product)}
                    type="button"
                  >
                    <MessageCircleMore className="h-4 w-4" />
                    立即咨询
                  </button>
                  <Link
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                    to={`/showcase/${product.id}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                    查看详情
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="glass-card mt-8 flex items-center gap-4 p-6 text-slate-300">
        <Sprout className="h-8 w-8 text-plateau-300" />
        <p className="text-sm leading-6">
          后续可在该模块继续接入 Supabase 或 Firebase 商品数据，实现商品发布、图片上传、价格策略管理与咨询线索归档。
        </p>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-plateau-200">
                  Private Connect
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                onClick={() => setSelectedProduct(null)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              为符合项目“不介入资金流转”的风险管控要求，当前页面不直接跳转支付。
              如需购买、批发或定制礼盒，请通过私域主理人或牧民联系方式进一步沟通。
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
              <ModalQrCard name={selectedProduct.contact.owner} />

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">私域主理人</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedProduct.contact.owner}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="h-4 w-4" />
                    <span>牧民 / 主理人联系方式</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedProduct.contact.phone}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    微信号：{selectedProduct.contact.wechat}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
