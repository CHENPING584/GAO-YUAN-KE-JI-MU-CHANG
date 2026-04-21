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
    <div className="relative isolate min-h-screen pb-40 animate-fade-in">
      {/* Background Decor */}
      <div className="plateau-grid-bg"></div>
      <div className="glow-mesh top-[10%] left-[-5%] w-[400px] h-[400px] bg-plateau-900/30"></div>
      <div className="glow-mesh bottom-[15%] right-[-5%] w-[500px] h-[500px] bg-gold-900/10"></div>
      
      <section className="container-shell pt-32 lg:pt-48">
        <Link
          className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:text-gold-500"
          to="/showcase"
        >
          <ArrowLeft className="h-4 w-4" />
          返回商城列表
        </Link>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Media */}
          <div className="space-y-12 animate-fade-in-up">
            <div className="glass-card overflow-hidden !rounded-[3rem]">
              <div className="relative aspect-[4/3] w-full">
                <img
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-1000"
                  src={product.image}
                />
                <div className="absolute left-10 top-10">
                  <span className="rounded-full bg-black/60 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gold-500 backdrop-blur-md border border-white/10">
                    {product.origin}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {product.features.map((feature, i) => (
                <div key={i} className="glass-card bg-white/[0.01] p-8 text-center border-white/5 transition-all hover:bg-white/[0.03]">
                  <BadgeCheck className="mx-auto h-8 w-8 text-gold-500 mb-4" />
                  <p className="text-sm font-bold text-white tracking-wide">{feature}</p>
                </div>
              ))}
            </div>
            
            <div className="glass-card p-12">
              <h3 className="heading-serif flex items-center gap-4 text-2xl text-white mb-8">
                <ShieldCheck className="h-8 w-8 text-gold-500" />
                产品溯源物语
              </h3>
              <p className="text-xl leading-relaxed text-slate-400 font-light">
                {product.story}
              </p>
              <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-t border-white/5 pt-10">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gold-500 shadow-gold-glow">
                    <Store className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">唯一数字化指纹</p>
                    <p className="font-mono text-base text-white font-bold tracking-wider">{product.traceCode}</p>
                  </div>
                </div>
                <Link
                  className="btn-outline !py-4 !px-8 text-xs font-bold"
                  to="/traceability"
                >
                  查看完整档案
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Info & CTA */}
          <div className="animate-fade-in-up [animation-delay:200ms]">
            <div className="glass-card sticky top-40 p-12 lg:p-16">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500/60 mb-4 block">
                {product.category}
              </span>
              <h1 className="heading-serif text-5xl text-white lg:text-6xl">
                {product.name}
              </h1>
              
              <div className="mt-12 space-y-8">
                <div className="flex items-center justify-between rounded-[2rem] bg-white/[0.01] p-10 border border-white/5 transition-all hover:bg-white/[0.03]">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">零售建议价</span>
                  <span className="heading-serif text-4xl text-white">{product.prices.retail}</span>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-10 transition-all hover:bg-white/[0.03]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">大宗批发价</p>
                    <p className="heading-serif text-3xl text-gold-500">{product.prices.wholesale}</p>
                  </div>
                  <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-10 transition-all hover:bg-white/[0.03]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">礼盒定制价</p>
                    <p className="heading-serif text-3xl text-slate-300">{product.prices.gift}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 rounded-[2rem] border border-gold-500/10 bg-gold-500/[0.02] p-8 backdrop-blur-sm">
                <div className="flex items-start gap-5">
                  <MessageCircleMore className="mt-1 h-6 w-6 text-gold-500" />
                  <p className="text-sm leading-relaxed text-slate-400">
                    本平台旨在连接源头与消费，<span className="text-white font-bold">不介入任何资金流转</span>。
                    如需购买或深度定制，请直接与牧民主理人进行私域沟通。
                  </p>
                </div>
              </div>

              <button
                className="btn-gold mt-12 w-full !py-6 text-lg tracking-widest uppercase"
                onClick={() => setShowContact(true)}
                type="button"
              >
                联系主理人
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal Overlay */}
      {showContact && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60 animate-in fade-in duration-300"
          onClick={() => setShowContact(false)}
        >
          <div 
            className="glass-card max-w-xl w-full p-8 lg:p-16 relative animate-in slide-in-from-bottom-8 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-6 right-6 h-10 w-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-slate-500 transition-all hover:bg-white/10 hover:text-white active:scale-90"
              onClick={() => setShowContact(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="heading-serif text-3xl lg:text-4xl text-white mb-4 lg:mb-6">建立信任连接</h3>
            <p className="text-base lg:text-lg text-slate-400 leading-relaxed mb-8 lg:mb-12 font-light">
              请通过以下方式联系主理人 <span className="text-gold-500 font-bold">{product.contact.owner}</span>，
              咨询产品详情、原产地实况及采购事宜。
            </p>
            
            <div className="space-y-6 lg:space-y-10">
              <div className="flex flex-col items-center gap-6 lg:gap-8 p-6 lg:p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/10 transition-all hover:bg-white/[0.03] group">
                <div className="mx-auto flex h-32 w-32 lg:h-48 lg:w-48 items-center justify-center rounded-[2rem] border border-dashed border-gold-500/20 bg-gold-500/5 transition-transform duration-500 group-hover:scale-105">
                  <QrCode className="h-12 w-12 lg:h-16 lg:w-16 text-gold-500 opacity-60" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 lg:mb-2">微信私域连接</p>
                  <p className="text-xl lg:text-2xl font-bold text-white">ID: {product.contact.wechat}</p>
                </div>
              </div>
              
              <div className="p-6 lg:p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/10 flex items-center justify-between transition-all hover:bg-white/[0.03] group cursor-pointer active:scale-[0.98]">
                <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 lg:mb-2">服务电话</p>
                   <p className="heading-serif text-2xl lg:text-3xl text-white group-hover:text-gold-400 transition-colors">{product.contact.phone}</p>
                </div>
                <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-gold-500 text-slate-950 flex items-center justify-center shadow-gold-glow transition-transform duration-500 group-hover:rotate-12 group-active:scale-90">
                   <Phone className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
              </div>
            </div>

            <button 
              className="mt-12 w-full py-5 rounded-full border border-white/10 font-bold text-slate-500 transition-all hover:bg-white/5 hover:text-white uppercase tracking-widest text-xs active:scale-95"
              onClick={() => setShowContact(false)}
            >
              返回产品详情
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

