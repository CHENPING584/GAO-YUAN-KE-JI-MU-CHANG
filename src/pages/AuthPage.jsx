import { ArrowRight, LoaderCircle, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ensureCurrentProfile, getCurrentProfile } from '../lib/supabase/farmerAccess.ts';
import { getSupabaseBrowserClient } from '../lib/supabase/client';

function getSupabaseConfigSummary() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    supabaseUrl,
  };
}

function normalizeAuthError(error) {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : '认证失败，请稍后重试。';

  if (/Failed to fetch/i.test(message)) {
    return '认证服务连接失败。请检查 Supabase 项目是否可访问、环境变量是否正确，以及当前网络是否能连到 Supabase。';
  }

  if (/network/i.test(message)) {
    return '网络连接异常，暂时无法连接认证服务，请稍后重试。';
  }

  if (/Invalid login credentials/i.test(message)) {
    return '邮箱或密码不正确。';
  }

  if (/User already registered/i.test(message)) {
    return '该邮箱已注册，请直接登录。';
  }

  if (/Email not confirmed/i.test(message)) {
    return '该邮箱尚未完成验证，请先前往邮箱完成确认。';
  }

  return message;
}

function AuthInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-white outline-none transition',
        'placeholder:text-slate-500 focus:border-plateau-400',
        className,
      ].join(' ')}
    />
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const config = getSupabaseConfigSummary();
  const isConfigReady = config.hasUrl && config.hasAnonKey;
  const [mode, setMode] = useState('signin');
  const [booting, setBooting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({
    type: 'idle',
    message: '登录后即可提交发布者申请、查看审核状态并管理农户后台。',
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const client = getSupabaseBrowserClient();

      if (!client) {
        if (!cancelled) {
          setStatus({
            type: 'warning',
            message:
              '尚未配置 Supabase 环境变量，请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。',
          });
          setBooting(false);
        }
        return;
      }

      try {
        const {
          data: { user },
        } = await client.auth.getUser();

        if (!user || cancelled) {
          return;
        }

        const profile = await ensureCurrentProfile(client);

        if (cancelled) {
          return;
        }

        if (profile.role === 'farmer') {
          navigate('/dashboard/farmer', { replace: true });
          return;
        }

        if (profile.role === 'pending_farmer') {
          navigate('/audit-status', { replace: true });
          return;
        }

        navigate('/apply-farmer', { replace: true });
      } catch {
        // Ignore boot errors and keep the auth form visible.
      } finally {
        if (!cancelled) {
          setBooting(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const statusClassName = useMemo(() => {
    if (status.type === 'error') {
      return 'border-red-500/30 bg-red-500/10 text-red-200';
    }

    if (status.type === 'success') {
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
    }

    if (status.type === 'warning') {
      return 'border-gold-500/30 bg-gold-500/10 text-amber-100';
    }

    return 'border-white/10 bg-white/[0.03] text-slate-300';
  }, [status.type]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const client = getSupabaseBrowserClient();

    if (!client) {
      setStatus({
        type: 'warning',
        message:
          '尚未配置 Supabase 环境变量，请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。',
      });
      return;
    }

    if (!formData.email || !formData.password) {
      setStatus({
        type: 'error',
        message: '请输入邮箱和密码。',
      });
      return;
    }

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setStatus({
        type: 'error',
        message: '两次输入的密码不一致。',
      });
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await client.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          throw new Error(error.message || '登录失败，请检查邮箱和密码。');
        }

        await ensureCurrentProfile(client);
        const profile = await getCurrentProfile(client);

        setStatus({
          type: 'success',
          message: '登录成功，正在为你跳转。',
        });

        if (profile.role === 'farmer') {
          navigate('/dashboard/farmer', { replace: true });
          return;
        }

        if (profile.role === 'pending_farmer') {
          navigate('/audit-status', { replace: true });
          return;
        }

        navigate('/apply-farmer', { replace: true });
        return;
      }

      const { data, error } = await client.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message || '注册失败，请稍后重试。');
      }

      if (data.user && data.session) {
        await ensureCurrentProfile(client);
        setStatus({
          type: 'success',
          message: '注册成功，已自动登录，正在前往发布者申请页。',
        });
        navigate('/apply-farmer', { replace: true });
        return;
      }

      setStatus({
        type: 'success',
        message: '注册成功，请前往邮箱完成验证后再登录。',
      });
      setMode('signin');
      setFormData((current) => ({
        ...current,
        password: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setStatus({
        type: 'error',
        message: normalizeAuthError(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <div className="plateau-grid-bg"></div>
      <div className="glow-mesh top-[5%] left-[-10%] h-[360px] w-[360px] bg-plateau-900/30"></div>
      <div className="glow-mesh bottom-[10%] right-[-5%] h-[420px] w-[420px] bg-gold-900/10"></div>

      <section className="container-shell relative py-28 lg:py-40">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" />
              账户认证入口
            </div>
            <h1 className="section-title mt-8 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">
              登录后进入
              <span className="text-gradient-gold"> 发布者申请与农户后台</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              当前项目已经接入数据库权限链路，但之前缺少实际登录入口。现在你可以先注册或登录，再继续申请发布者、查看审核状态与管理商品。
            </p>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 text-sm leading-7 text-slate-400">
              <p className="font-semibold text-white">当前认证配置状态</p>
              <p className="mt-2">`VITE_SUPABASE_URL`：{config.hasUrl ? '已配置' : '未配置'}</p>
              <p>`VITE_SUPABASE_ANON_KEY`：{config.hasAnonKey ? '已配置' : '未配置'}</p>
              {config.supabaseUrl ? (
                <p className="mt-2 break-all text-xs text-slate-500">服务地址：{config.supabaseUrl}</p>
              ) : null}
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link className="btn-outline w-full sm:w-auto" to="/apply-farmer">
                我先看看申请页
              </Link>
              <Link className="btn-outline w-full sm:w-auto" to="/dashboard/farmer">
                我已登录，进入后台
              </Link>
            </div>
          </div>

          <div className="glass-card w-full p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-2 gap-3 rounded-full border border-white/5 bg-white/[0.02] p-2">
              <button
                className={[
                  'rounded-full px-4 py-3 text-sm font-bold transition-all duration-300',
                  mode === 'signin'
                    ? 'bg-gold-500 text-slate-950'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                ].join(' ')}
                onClick={() => setMode('signin')}
                type="button"
              >
                登录
              </button>
              <button
                className={[
                  'rounded-full px-4 py-3 text-sm font-bold transition-all duration-300',
                  mode === 'signup'
                    ? 'bg-gold-500 text-slate-950'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                ].join(' ')}
                onClick={() => setMode('signup')}
                type="button"
              >
                注册
              </button>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">
                  邮箱
                </label>
                <AuthInput
                  autoComplete="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="请输入登录邮箱"
                  type="email"
                  value={formData.email}
                />
              </div>

              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">
                  密码
                </label>
                <AuthInput
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  name="password"
                  onChange={handleChange}
                  placeholder="请输入密码"
                  type="password"
                  value={formData.password}
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    确认密码
                  </label>
                  <AuthInput
                    autoComplete="new-password"
                    name="confirmPassword"
                    onChange={handleChange}
                    placeholder="请再次输入密码"
                    type="password"
                    value={formData.confirmPassword}
                  />
                </div>
              )}

              <div className={`rounded-3xl border px-5 py-4 text-sm leading-7 ${statusClassName}`}>
                {booting ? '正在检查当前登录状态...' : status.message}
              </div>

              <button
                className="btn-gold flex w-full items-center justify-center gap-3 !py-4 text-sm uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting || booting || !isConfigReady}
                type="submit"
              >
                {submitting || booting ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    正在处理中
                  </>
                ) : (
                  <>
                    {mode === 'signin' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                    {mode === 'signin' ? '立即登录' : '创建账户'}
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-6 text-slate-500">
              登录后会根据你的角色自动跳转到申请页、审核状态页或农户后台。
              <Link className="ml-1 text-gold-500 hover:text-gold-400" to="/apply-farmer">
                继续前往发布者申请
              </Link>
              <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
