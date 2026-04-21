import { ArrowRight, MessageCircleMore, QrCode, Users } from 'lucide-react';

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
    <div className="animate-fade-in">
      <section className="container-shell py-12 sm:py-16">
        <div className="glass-card overflow-hidden p-8 sm:p-16 relative">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-plateau-500/10 blur-3xl"></div>
          
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.25em] text-plateau-200 animate-fade-in-up">
              Connect
            </p>
            <h2 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl animate-fade-in-up delay-75">
              关于我们与私域入口
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 animate-fade-in-up delay-150">
              该页面承载团队介绍、合作洽谈和私域转化入口。
              我们通过数字化手段，将线下的田野调研、牧场实景与线上品牌建设深度联动，构建可持续的高原农牧生态圈。
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {cards.map(({ icon: Icon, title, description }, index) => (
                <div 
                  key={title} 
                  className="glass-card group p-8 animate-scale-in"
                  style={{ animationDelay: `${(index + 2) * 150}ms` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-plateau-500/15 text-plateau-300 transition-all duration-500 group-hover:scale-110 group-hover:bg-plateau-500/25">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-white group-hover:text-plateau-300 transition-colors">
                    {title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-400">
                    {description}
                  </p>
                  
                  <div className="mt-8 flex items-center gap-2 text-sm font-medium text-plateau-400 group-hover:text-plateau-300 transition-colors">
                    <span>了解更多</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team/Mission Section */}
      <section className="container-shell py-16 sm:py-24 animate-fade-in-up">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="glass-card p-10">
            <h3 className="text-3xl font-bold text-white">项目使命</h3>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              “高原科技牧场”源自第十五届挑战杯项目，旨在利用移动互联网与数字化溯源技术，
              解决青海边远地区农牧产品外销中的信任痛点。
            </p>
            <div className="mt-8 space-y-4">
              {[
                '连接散户：让每一户牧民的辛勤都有迹可循',
                '赋能企业：提升地方农牧品牌的核心竞争力',
                '触达消费：为城市家庭提供安全透明的选购参考',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-plateau-500"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative aspect-video rounded-[2.5rem] border border-white/10 bg-slate-900/50 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-plateau-grid opacity-10"></div>
             <div className="text-center p-8">
               <Users className="mx-auto h-16 w-16 text-slate-700 mb-6" />
               <p className="text-slate-500 italic">团队调研实景照片/视频占位</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
