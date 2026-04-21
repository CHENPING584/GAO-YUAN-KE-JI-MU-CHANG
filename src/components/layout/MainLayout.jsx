import { Mountain, Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { label: '首页', to: '/' },
  { label: '溯源大厅', to: '/traceability' },
  { label: '农场商城', to: '/showcase' },
  { label: '我是农户/我要发布', to: '/dashboard/farmer' },
  { label: '审核后台', to: '/admin-review' },
  { label: '合作伙伴', to: '/partners' },
  { label: '关于我们', to: '/connect' },
];

function navClassName({ isActive }) {
  return [
    'rounded-full px-4 py-2 text-sm transition',
    isActive
      ? 'bg-plateau-500 text-white'
      : 'text-slate-300 hover:bg-white/10 hover:text-white',
  ].join(' ');
}

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-earth-950/80 backdrop-blur">
        <div className="container-shell flex items-center justify-between py-4">
          <NavLink className="flex items-center gap-3" to="/">
            <div className="rounded-2xl bg-plateau-500/15 p-2 text-plateau-300">
              <Mountain className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">高原科技牧场</p>
              <h1 className="text-base font-semibold tracking-wide">
                青海农牧溯源与展示平台
              </h1>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} className={navClassName} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="rounded-full border border-white/10 p-2 text-slate-200 md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            type="button"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-slate-900/95 md:hidden">
            <div className="container-shell flex flex-col gap-2 py-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  className={navClassName}
                  onClick={() => setMenuOpen(false)}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-earth-950/70">
        <div className="container-shell flex flex-col gap-3 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>以数字化溯源连接牧场、企业与消费者。</p>
          <p>{currentYear} High Plateau Tech Ranch</p>
        </div>
      </footer>
    </div>
  );
}
