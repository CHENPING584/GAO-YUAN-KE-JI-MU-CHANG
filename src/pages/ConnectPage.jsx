import { MessageCircleMore, QrCode, Users } from 'lucide-react';

const cards = [
  {
    icon: Users,
    title: '团队介绍',
    description: '展示挑战杯项目背景、团队分工与田野调研成果。',
  },
  {
    icon: QrCode,
    title: '私域引流',
    description: '预留企业微信、公众号、小程序码等私域入口位置。',
  },
  {
    icon: MessageCircleMore,
    title: '合作洽谈',
    description: '提供合作联系方式，承接品牌联动与渠道共建。',
  },
];

export default function ConnectPage() {
  return (
    <section className="container-shell py-12 sm:py-16">
      <div className="glass-card p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.25em] text-plateau-200">
          Connect
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          关于我们与私域入口
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          该页面承载团队介绍、合作洽谈和私域转化入口，可与线下展陈、短视频传播、直播导购等场景联动。
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <Icon className="h-7 w-7 text-plateau-300" />
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
