import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentProfile } from '../../lib/supabase/farmerAccess.ts';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';

export default function FarmerRouteGuard({ children }) {
  const [state, setState] = useState({
    loading: true,
    redirectTo: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkRole() {
      const client = getSupabaseBrowserClient();

      if (!client) {
        if (!cancelled) {
          setState({
            loading: false,
            redirectTo: '/apply-farmer',
          });
        }
        return;
      }

      try {
        const profile = await getCurrentProfile(client);

        if (cancelled) {
          return;
        }

        if (profile.role === 'user') {
          setState({
            loading: false,
            redirectTo: '/apply-farmer',
          });
          return;
        }

        if (profile.role === 'pending_farmer') {
          setState({
            loading: false,
            redirectTo: '/audit-status',
          });
          return;
        }

        setState({
          loading: false,
          redirectTo: null,
        });
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            redirectTo: '/apply-farmer',
          });
        }
      }
    }

    void checkRole();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <section className="container-shell flex min-h-[60vh] items-center justify-center py-16">
        <div className="glass-card w-full max-w-lg p-8 text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-plateau-200" />
          <h2 className="mt-5 text-2xl font-semibold text-white">正在校验农户权限</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            系统正在根据你的角色自动跳转到申请页、审核状态页或农户控制台。
          </p>
        </div>
      </section>
    );
  }

  if (state.redirectTo) {
    return <Navigate replace to={state.redirectTo} />;
  }

  return children;
}
