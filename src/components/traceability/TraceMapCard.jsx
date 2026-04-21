import { MapPinned, Navigation } from 'lucide-react';

function getMarkerPosition({ lng, lat }) {
  const left = ((lng - 73) / (135 - 73)) * 100;
  const top = 100 - ((lat - 18) / (54 - 18)) * 100;

  return {
    left: `${Math.min(Math.max(left, 15), 85)}%`,
    top: `${Math.min(Math.max(top, 18), 82)}%`,
  };
}

export default function TraceMapCard({ origin, coordinates }) {
  const marker = getMarkerPosition(coordinates);

  return (
    <div className="glass-card h-full p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-plateau-500/15 p-3 text-plateau-300">
          <MapPinned className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">地理坐标</h3>
          <p className="text-sm text-slate-400">轻量地图组件示意牧场位置</p>
        </div>
      </div>

      <div className="relative mb-5 h-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
        <div className="absolute inset-0 bg-plateau-grid bg-[size:26px_26px] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(96,165,250,0.18),transparent_25%),radial-gradient(circle_at_70%_70%,rgba(61,168,117,0.22),transparent_30%)]" />

        <div
          className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400 shadow-[0_0_0_8px_rgba(251,113,133,0.15)]"
          style={marker}
        >
          <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-rose-300/50" />
        </div>

        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur">
          <p className="text-sm text-slate-400">坐标定位</p>
          <p className="mt-1 text-base font-medium text-white">{origin}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">经度</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {coordinates.lng}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">纬度</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {coordinates.lat}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-plateau-200">
        <Navigation className="h-4 w-4" />
        <span>后续可接入腾讯地图或高德地图 SDK 做实时地理可视化。</span>
      </div>
    </div>
  );
}
