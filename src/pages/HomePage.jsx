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
    <section className="container-shell py-12 sm:py-16">
      <div className="glass-card overflow-hidden p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <span className="rounded-full border border-plateau-300/30 bg-plateau-500/10 px-4 py-2 text-sm text-plateau-200">
              第十五届挑战杯项目衍生平台
            </span>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              为青海农牧产品打造看得见、讲得清、传得开的数字名片
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              “高原科技牧场”聚焦青海农牧散户、企业与消费者之间的信息信任问题，
              通过轻量化可视化溯源与展示体系，让产品故事、生态价值与生产流程直观可见。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-plateau-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-plateau-400"
                to="/traceability"
              >
                进入溯源大厅
              </Link>
              <Link
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                to="/showcase"
              >
                查看农场商城
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(61,168,117,0.25),rgba(15,23,32,0.6))] p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-slate-950/40 p-5"
                >
                  <Icon className="h-6 w-6 text-plateau-300" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
