import { Menu, Mountain, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

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
    'nav-link group relative block py-2 font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-500',
    isActive ? 'text-gold-500' : 'text-slate-400 hover:text-white',
  ].join(' ');
}

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMobileNav = (to) => {
    setIsMenuOpen(false);

    // In the mobile preview/webview, router links can be swallowed by overlay layers.
    // Fall back to a hard navigation so every menu item always opens the target page.
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.pathname === to) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    window.location.assign(to);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#080d0b] overflow-x-hidden">
      {/* 顶部导航栏 - 使用 pointer-events-none 确保不会拦截下方菜单的点击 */}
      <header className="fixed top-0 left-0 right-0 z-[200] py-6 pointer-events-none">
        <nav className="container-shell pointer-events-auto">
          <div className="glass-card flex items-center justify-between px-8 py-4 !rounded-full border-white/10 bg-black/40 backdrop-blur-2xl">
            {/* Logo 区域 */}
            <Link 
              className="flex items-center gap-3 transition-all duration-500 hover:opacity-80 active:scale-95" 
              to="/"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-slate-950 shadow-gold-glow">
                <Mountain className="h-6 w-6" />
              </div>
              <span className="heading-serif text-xl text-white hidden sm:block">
                高原科技牧场
              </span>
            </Link>

            {/* 桌面端导航 */}
            <div className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => (
                <NavLink 
                  key={item.to} 
                  className={navClassName} 
                  to={item.to}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 h-[1px] w-full origin-right scale-x-0 bg-gold-500 transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100"></span>
                </NavLink>
              ))}
            </div>

            {/* 移动端菜单按钮 */}
            <button
              className="relative z-[210] flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 lg:hidden border border-white/10 transition-all hover:bg-white/10 active:scale-90 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'}
            >
              <div className="relative h-5 w-5 pointer-events-none">
                {isMenuOpen ? (
                  <X className="absolute inset-0 h-5 w-5" />
                ) : (
                  <Menu className="absolute inset-0 h-5 w-5" />
                )}
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* 移动端下拉菜单 - 提升 z-index 并确保完全覆盖 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          {/* 背景遮罩 - 点击关闭菜单 */}
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500 cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* 菜单内容容器 */}
          <div className="container-shell relative z-[160] h-full pt-32 pb-10">
            <div 
              className="glass-card flex max-h-[80vh] flex-col overflow-y-auto !rounded-[2.5rem] border-white/10 bg-[#0a0f0d] shadow-2xl animate-in slide-in-from-top-8 duration-700 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => (
                <button
                  key={item.to}
                  className="group flex w-full items-center justify-between border-b border-white/5 last:border-0 px-8 py-8 text-left transition-all duration-300 hover:bg-white/5 active:bg-gold-500/20 cursor-pointer"
                  onClick={() => handleMobileNav(item.to)}
                  type="button"
                >
                  <span className="text-xl font-bold tracking-wide text-slate-300 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <div className="h-3 w-3 rounded-full bg-gold-500 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-125 shadow-gold-glow"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-black/40 py-20 backdrop-blur-xl">
        <div className="container-shell">
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Mountain className="h-7 w-7 text-gold-500" />
                </div>
                <span className="heading-serif text-2xl text-white">高原科技牧场</span>
              </div>
              <p className="max-w-md text-lg leading-relaxed text-slate-400">
                连接青海农牧散户、企业与消费者的数字桥梁。我们以科技赋能传统牧场，让每一份高原馈赠都拥有真实可信的数字档案。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white">快速导航</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><NavLink to="/traceability" className="hover:text-gold-500 transition-colors">溯源大厅</NavLink></li>
                  <li><NavLink to="/showcase" className="hover:text-gold-500 transition-colors">农场商城</NavLink></li>
                  <li><NavLink to="/partners" className="hover:text-gold-500 transition-colors">合作伙伴</NavLink></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white">农户服务</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><NavLink to="/dashboard/farmer" className="hover:text-gold-500 transition-colors">农户后台</NavLink></li>
                  <li><NavLink to="/apply-farmer" className="hover:text-gold-500 transition-colors">申请入驻</NavLink></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-20 border-t border-white/5 pt-10 text-center">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              © 2026 高原科技牧场. 第十五届挑战杯项目衍生平台.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
