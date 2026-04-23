import { Leaf, ShieldCheck, Store, Waves, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  {
    icon: Leaf,
    title: '生态高原',
    description: '立足青海高寒牧场生态环境，强化绿色产地认知。',
  },
  {
    icon: ShieldCheck,
    title: '可信溯源',
    description: '以批次、证书和流程节点构建产品数字身份证。',
  },
  {
    icon: Store,
    title: '品牌展示',
    description: '服务散户、企业和消费者的展示与连接场景。',
  },
  {
    icon: Waves,
    title: '轻量接入',
    description: '兼顾弱网环境与多终端浏览体验，降低推广门槛。',
  },
];

export default function HomePage() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      {/* Background Elements - 引入沉浸式背景图层 */}
      <div className="fixed inset-0 -z-30 overflow-hidden">
        <div 
          className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: "url('/hero-plateau.jpg')" }}
        ></div>
        {/* 暗色渐变遮罩，确保文字可读性 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#080d0b]"></div>
      </div>

      <div className="plateau-grid-bg"></div>
      <div className="glow-mesh top-[-10%] left-[-10%] w-[500px] h-[500px] bg-plateau-900/20"></div>
      <div className="glow-mesh bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold-900/10"></div>

      {/* Hero Section */}
      <section className="container-shell relative pt-32 pb-20 lg:pt-56 lg:pb-40">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-5 py-2 lg:px-6 lg:py-2.5 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500"></span>
            </span>
            挑战杯 · 数字化农牧创新平台
          </div>
          
          <h1 className="section-title mt-8 lg:mt-12 max-w-5xl leading-[1.1] lg:leading-[1.05] animate-fade-in-up [text-shadow:0_4px_24px_rgba(0,0,0,0.5)] text-4xl sm:text-5xl lg:text-7xl">
            <span className="text-gradient">让每一份高原馈赠</span>
            <br />
            <span className="text-gradient-gold">皆可溯源，皆有回响</span>
          </h1>
          
          <p className="mt-8 lg:mt-10 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg lg:text-xl animate-fade-in-up [animation-delay:200ms] [text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">
            “高原科技牧场”深度融合<span className="text-white font-semibold">数字指纹</span>与<span className="text-white font-semibold">实景溯源</span>，
            为青海优质农牧产品建立独一无二的数字档案，打破信息鸿沟，链接纯净原产地与现代消费。
          </p>

          <div className="mt-12 lg:mt-16 flex flex-col sm:flex-row justify-center gap-4 lg:gap-6 animate-fade-in-up [animation-delay:400ms] w-full sm:w-auto px-6 sm:px-0">
            <Link className="btn-gold group w-full sm:w-auto" to="/traceability">
              <span className="flex items-center justify-center">
                开启溯源之旅
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link className="btn-outline group w-full sm:w-auto" to="/apply-farmer">
              <span className="flex items-center justify-center">申请发布者入驻</span>
            </Link>
            <Link className="btn-outline group w-full sm:w-auto" to="/showcase">
              <span className="flex items-center justify-center">浏览数字牧场</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container-shell py-20 lg:py-32">
        <div className="mb-12 lg:mb-20 text-center">
          <h2 className="heading-serif text-3xl text-white lg:text-5xl">核心技术与核心价值</h2>
          <div className="mx-auto mt-4 h-1 w-20 lg:w-24 rounded-full bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
        </div>
        
        <div className="grid gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="glass-card group p-8 lg:p-10 animate-fade-in-up"
              style={{ animationDelay: `${index * 150 + 600}ms` }}
            >
              <div className="mb-6 lg:mb-8 flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl lg:rounded-3xl bg-white/[0.03] text-gold-500 border border-white/[0.05] transition-all duration-500 group-hover:scale-110 group-hover:bg-gold-500/10 group-hover:border-gold-500/20">
                <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
              </div>
              <h3 className="heading-serif text-xl lg:text-2xl text-white mb-3 lg:mb-4 group-hover:text-gold-400 transition-colors">
                {title}
              </h3>
              <p className="text-xs lg:text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Bridge Section */}
      <section className="container-shell pb-32 lg:pb-40">
        <div className="glass-card relative overflow-hidden p-8 lg:p-24">
          <div className="absolute inset-0 bg-plateau-mesh opacity-40"></div>
          <div className="relative z-10 grid gap-12 lg:gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="heading-serif text-3xl text-white sm:text-4xl lg:text-6xl mb-6 lg:mb-8">
                构建产销一体的<br />
                <span className="text-gradient-gold">数字信任闭环</span>
              </h2>
              <p className="text-lg lg:text-xl text-slate-400 leading-relaxed mb-8 lg:mb-10">
                通过去中心化的身份标识与实时影像存证，我们确保每一个产品节点都真实可感，让信任成为高原品牌的核心竞争力。
              </p>
              <div className="flex gap-8 lg:gap-12">
                <div>
                  <p className="text-4xl lg:text-5xl heading-serif text-gold-500">85%</p>
                  <p className="mt-2 text-[10px] lg:text-sm uppercase tracking-widest text-slate-500">信任提升</p>
                </div>
                <div>
                  <p className="text-4xl lg:text-5xl heading-serif text-gold-500">120+</p>
                  <p className="mt-2 text-[10px] lg:text-sm uppercase tracking-widest text-slate-500">合伙农牧</p>
                </div>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="aspect-video lg:aspect-square rounded-[2rem] lg:rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-2 overflow-hidden">
                <div className="h-full w-full rounded-[1.8rem] lg:rounded-[2.5rem] bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 lg:h-24 lg:w-24 rounded-full bg-gold-500/20 border border-gold-500/50 backdrop-blur-xl flex items-center justify-center animate-pulse">
                    <ShieldCheck className="h-8 w-8 lg:h-10 lg:w-10 text-gold-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
