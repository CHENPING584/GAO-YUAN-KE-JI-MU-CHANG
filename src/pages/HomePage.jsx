import { Leaf, ShieldCheck, Store, Waves } from 'lucide-react';
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
    <div className="animate-fade-in">
      <section className="container-shell py-12 sm:py-20">
        <div className="glass-card relative overflow-hidden p-8 sm:p-16">
          {/* Decorative background element */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-plateau-500/10 blur-3xl"></div>
          
          <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="animate-fade-in-up">
              <span className="inline-block rounded-full border border-plateau-300/30 bg-plateau-500/10 px-4 py-2 text-sm font-medium text-plateau-200">
                第十五届挑战杯项目衍生平台
              </span>
              <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:leading-tight">
                为青海农牧产品打造<span className="text-plateau-400">看得见、讲得清、传得开</span>的数字名片
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
                “高原科技牧场”聚焦青海农牧散户、企业与消费者之间的信息信任问题，
                通过轻量化可视化溯源与展示体系，让产品故事、生态价值与生产流程直观可见。
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link className="btn-plateau" to="/traceability">
                  进入溯源大厅
                </Link>
                <Link
                  className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-slate-100 transition-all hover:bg-white/10 hover:border-white/30"
                  to="/showcase"
                >
                  查看农场商城
                </Link>
              </div>
            </div>

            <div className="animate-scale-in delay-200">
              <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(61,168,117,0.25),rgba(15,23,32,0.6))] p-8 shadow-2xl backdrop-blur-sm">
                <div className="grid gap-6 sm:grid-cols-2">
                  {highlights.map(({ icon: Icon, title, description }, index) => (
                    <div
                      key={title}
                      className="group rounded-3xl border border-white/10 bg-slate-950/40 p-6 transition-all duration-500 hover:border-plateau-500/30 hover:bg-slate-950/60"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plateau-500/15 text-plateau-300 transition-transform duration-500 group-hover:scale-110 group-hover:bg-plateau-500/25">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="container-shell py-16 sm:py-24">
        <div className="text-center">
          <h2 className="section-title">核心价值主张</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            通过科技赋能传统农牧业，构建产销一体化信任桥梁
          </p>
        </div>
        
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            { title: '数据驱动', desc: '全流程数字化采集，确保每一份档案真实可靠', color: 'bg-blue-500/10' },
            { title: '生态优先', desc: '强调青海净土品牌价值，提升农产品溢价能力', color: 'bg-emerald-500/10' },
            { title: '直连消费', desc: '打破信息壁垒，让消费者直达生产源头牧场', color: 'bg-amber-500/10' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 text-center animate-fade-in-up" style={{ animationDelay: `${(i + 1) * 150}ms` }}>
              <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${item.color}`}>
                <div className="h-3 w-3 rounded-full bg-current animate-pulse"></div>
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-4 text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
