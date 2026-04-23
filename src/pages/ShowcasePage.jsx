import {
  BadgeCheck,
  ChevronRight,
  MessageCircleMore,
  Package,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/showcaseProducts';

const categories = ['全部', '优质肉禽', '高原粮油', '特色滋补', '非遗文创'];

export default function ShowcasePage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === '全部' || product.category === activeCategory;
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="relative isolate min-h-screen pb-40 overflow-x-hidden">
      {/* Background Decor */}
      <div className="plateau-grid-bg"></div>
      <div className="glow-mesh top-[10%] right-[-5%] w-[400px] h-[400px] bg-plateau-900/30"></div>
      <div className="glow-mesh bottom-[20%] left-[-5%] w-[500px] h-[500px] bg-gold-900/10"></div>
      
      <section className="container-shell pt-32 lg:pt-48">
        <div className="animate-fade-in-up max-w-4xl">
          <div className="animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md">
            Product Showcase
          </div>
          <h1 className="section-title mt-10">
            <span className="text-gradient">高原瑰宝</span>
            <br />
            <span className="text-gradient-gold">数字牧场精品展厅</span>
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-slate-400 max-w-2xl">
            严选青海高寒牧场核心产区，每一份馈赠皆可追溯至山野原点。
            坚持<span className="text-white font-semibold">源头直供</span>，透明定价，重塑农牧品牌价值。
          </p>
        </div>

        {/* 搜索与筛选栏 */}
        <div className="mt-20 space-y-8 animate-fade-in-up [animation-delay:200ms]">
          {/* 搜索框 */}
          <div className="relative max-w-2xl">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500/50">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="搜索产品名称、分类或描述..."
              className="w-full rounded-full border border-white/10 bg-black/40 py-5 pl-14 pr-14 text-white outline-none transition-all focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5 placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 分类筛选 */}
          <div className="flex flex-wrap items-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                className={[
                  'rounded-full px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-500 active:scale-95',
                  activeCategory === category
                    ? 'bg-gold-500 text-slate-950 shadow-gold-glow'
                    : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5 hover:text-white',
                ].join(' ')}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-12 lg:mt-16 grid gap-6 lg:gap-10 md:grid-cols-2">
          {visibleProducts.length > 0 ? (
            visibleProducts.map((product, index) => (
              <Link
                key={product.id}
                className="glass-card group animate-fade-in-up active:scale-[0.98] active:brightness-90 transition-all duration-300"
                style={{ animationDelay: `${index * 150 + 400}ms` }}
                to={`/showcase/${product.id}`}
              >
                <div className="flex flex-col h-full lg:flex-row pointer-events-none">
                  <div className="relative aspect-video lg:aspect-auto lg:w-2/5 overflow-hidden">
                    <img
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      src={product.image}
                    />
                    <div className="absolute left-4 top-4 lg:left-6 lg:top-6">
                      <span className="rounded-full bg-black/60 px-3 py-1.5 lg:px-4 lg:py-2 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-gold-500 backdrop-blur-md border border-white/10">
                        {product.originLabel}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <div className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        探索详情 <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6 lg:p-10">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500/60 mb-1 lg:mb-2 block">
                          {product.category}
                        </span>
                        <h3 className="heading-serif text-2xl lg:text-3xl text-white group-hover:text-gold-400 transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-slate-950 transition-all">
                        <BadgeCheck className="h-4 w-4 lg:h-5 lg:w-5" />
                      </div>
                    </div>

                    <p className="mt-4 lg:mt-6 flex-1 text-xs lg:text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                      {product.description}
                    </p>

                    <div className="mt-8 lg:mt-10 grid grid-cols-3 gap-3 lg:gap-4 border-t border-white/5 pt-6 lg:pt-8">
                      <div className="space-y-1">
                        <p className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500">零售建议</p>
                        <p className="text-base lg:text-lg heading-serif text-white">{product.prices.retail}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500">大宗批发</p>
                        <p className="text-sm lg:text-base font-bold text-gold-500">{product.prices.wholesale}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500">礼盒定制</p>
                        <p className="text-sm lg:text-base font-bold text-slate-300">{product.prices.gift}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center animate-fade-in">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.02] border border-white/5 text-slate-800 shadow-premium mb-8">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="heading-serif text-3xl text-white">未找到相关产品</h3>
              <p className="mt-4 text-slate-500 max-w-md mx-auto leading-relaxed">
                尝试更换搜索词或选择其他分类，寻找您心仪的高原瑰宝。
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('全部');
                }}
                className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-gold-500/60 transition-all hover:text-gold-500 hover:tracking-[0.3em]"
              >
                重置所有筛选
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="container-shell mt-40">
        <div className="glass-card relative overflow-hidden p-12 lg:p-24 text-center">
          <div className="absolute inset-0 bg-plateau-mesh opacity-30"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="heading-serif text-3xl text-white sm:text-5xl mb-8">
              “不介入资金流转，只链接信任与价值”
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed mb-12">
              我们严格遵守合规要求，所有交易均由消费者与牧民直接对接完成。
              平台通过<span className="text-gold-500 font-bold">数字存证</span>与<span className="text-gold-500 font-bold">实地审核</span>，为每一次链接提供真实性背书。
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-3 text-slate-300">
                <ShieldCheck className="h-6 w-6 text-gold-500" />
                <span className="text-sm font-bold tracking-widest uppercase">实地资质核验</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <QrCode className="h-6 w-6 text-gold-500" />
                <span className="text-sm font-bold tracking-widest uppercase">一物一码溯源</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Store className="h-6 w-6 text-gold-500" />
                <span className="text-sm font-bold tracking-widest uppercase">源头直供保障</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
