import { Clock3 } from 'lucide-react';

export default function TraceTimeline({ items }) {
  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl bg-plateau-500/15 p-3 text-plateau-300">
          <Clock3 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">全流程时间轴</h3>
          <p className="text-sm text-slate-400">
            从源头养殖到加工包装的关键节点一目了然
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={`${item.stage}-${item.date}`}
            className="relative pl-8 sm:pl-12"
          >
            {index !== items.length - 1 && (
              <div className="absolute left-3 top-8 h-full w-px bg-gradient-to-b from-plateau-400 to-transparent sm:left-4" />
            )}

            <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-plateau-300/40 bg-plateau-500 text-xs font-semibold text-white sm:h-8 sm:w-8">
              {index + 1}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-lg font-semibold text-white">{item.stage}</h4>
                <span className="text-sm text-plateau-200">{item.date}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
