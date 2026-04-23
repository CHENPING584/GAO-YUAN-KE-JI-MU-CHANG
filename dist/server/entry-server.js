import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.mjs";
import { useNavigate, Link, useLocation, Navigate, NavLink, Outlet, useParams, Routes, Route } from "react-router-dom";
import { Lock, KeyRound, Clock3, Video, MapPinned, MessageSquareWarning, BadgeCheck, QrCode, ShieldCheck, UserRound, Phone, Upload, ImagePlus, LoaderCircle, CheckCircle2, ArrowRight, LogIn, UserPlus, ArrowLeft, Mountain, Home, Search, Store, User, Users, MessageCircle, X as X$1, Menu, LogOut, ChevronRight, MessageCircleMore, Camera, Package, Trash2, Leaf, Waves, Star, ClipboardList, Medal, ImageIcon, Navigation, ScanLine, ShieldPlus, Building2, FileCheck2 } from "lucide-react";
function canWriteProducts(role) {
  return role === "farmer";
}
async function requireUser(client) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Error("用户未登录，无法执行该操作。");
  }
  return data.user;
}
async function getCurrentProfile(client) {
  const user = await requireUser(client);
  const { data, error } = await client.from("profiles").select("id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at").eq("id", user.id).single();
  if (error || !data) {
    throw new Error("读取用户资料失败。");
  }
  return data;
}
async function ensureCurrentProfile(client, defaults) {
  const user = await requireUser(client);
  const existing = await client.from("profiles").select("id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at").eq("id", user.id).single();
  if (existing.data) {
    return existing.data;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data, error } = await client.from("profiles").upsert(
    {
      id: user.id,
      role: "user",
      phone: null,
      wechat_qr_url: null,
      ranch_location: null,
      created_at: now,
      updated_at: now
    },
    { onConflict: "id" }
  ).select("id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at").single();
  if (error || !data) {
    throw new Error("初始化用户资料失败。");
  }
  return data;
}
async function updateCurrentProfile(client, payload) {
  const user = await requireUser(client);
  const { data, error } = await client.from("profiles").update({
    phone: payload.phone ?? null,
    wechat_qr_url: payload.wechat_qr_url ?? null,
    ranch_location: payload.ranch_location ?? null
  }).eq("id", user.id).select("id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at").single();
  if (error || !data) {
    throw new Error("更新数字名片失败。");
  }
  return data;
}
async function applyForFarmer(client, payload) {
  const user = await requireUser(client);
  const { error: profileError } = await client.from("profiles").update({
    phone: payload.phone ?? null,
    wechat_qr_url: payload.wechat_qr_url ?? null,
    ranch_location: payload.ranch_location ?? null
  }).eq("id", user.id);
  if (profileError) {
    throw new Error("更新资料失败，无法提交农户申请。");
  }
  const { data, error } = await client.from("farmer_applications").insert({
    user_id: user.id,
    real_name: payload.real_name,
    id_card: payload.id_card,
    ranch_proof_video: payload.ranch_proof_video,
    status: "pending"
  }).select(
    "id, user_id, real_name, id_card, ranch_proof_video, status, review_note, reviewed_at, created_at, updated_at"
  ).single();
  if (error || !data) {
    throw new Error("农户申请提交失败。");
  }
  return data;
}
async function createProductAsFarmer(client, product) {
  const user = await requireUser(client);
  const profile = await getCurrentProfile(client);
  if (!canWriteProducts(profile.role)) {
    throw new Error("当前用户不是 farmer，不能发布产品。");
  }
  const { data, error } = await client.from("products").insert({
    owner_id: user.id,
    product_name: product.product_name,
    description: product.description ?? null,
    price: product.price ?? null
  }).select("id, owner_id, product_name, description, price, created_at, updated_at").single();
  if (error || !data) {
    throw new Error("产品写入失败，请检查 RLS 或字段配置。");
  }
  return data;
}
async function listCurrentFarmerProducts(client) {
  const user = await requireUser(client);
  const { data, error } = await client.from("products").select("id, owner_id, product_name, description, price, created_at, updated_at").eq("owner_id", user.id).order("created_at", { ascending: false });
  if (error) {
    throw new Error("读取我的商品失败。");
  }
  return data ?? [];
}
async function deleteCurrentFarmerProduct(client, productId) {
  const user = await requireUser(client);
  const { error } = await client.from("products").delete().eq("id", productId).eq("owner_id", user.id);
  if (error) {
    throw new Error("商品下架失败，请检查权限配置。");
  }
}
async function getLatestCurrentApplication(client) {
  const user = await requireUser(client);
  const { data, error } = await client.from("farmer_applications").select(
    "id, user_id, real_name, id_card, ranch_proof_video, status, review_note, reviewed_at, created_at, updated_at"
  ).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
  if (error) {
    throw new Error("读取申请状态失败。");
  }
  return (data ?? [])[0] ?? null;
}
async function getProfileById(client, id) {
  const { data, error } = await client.from("profiles").select("id, role, phone, wechat_qr_url, ranch_location, created_at, updated_at").eq("id", id).single();
  if (error || !data) {
    return null;
  }
  return data;
}
async function listFarmerApplicationsForReview(client) {
  const { data, error } = await client.from("farmer_applications").select(
    "id, user_id, real_name, id_card, ranch_proof_video, status, review_note, reviewed_at, created_at, updated_at"
  ).order("created_at", { ascending: false });
  if (error) {
    throw new Error("读取审核列表失败。");
  }
  const applications = data ?? [];
  const enriched = await Promise.all(
    applications.map(async (item) => ({
      ...item,
      profile: await getProfileById(client, item.user_id)
    }))
  );
  return enriched;
}
async function reviewFarmerApplication(client, payload) {
  const reviewedAt = (/* @__PURE__ */ new Date()).toISOString();
  const { error: applicationError } = await client.from("farmer_applications").update({
    status: payload.status,
    review_note: payload.reviewNote,
    reviewed_at: reviewedAt
  }).eq("id", payload.applicationId);
  if (applicationError) {
    throw new Error("更新审核状态失败。");
  }
  const nextRole = payload.status === "approved" ? "farmer" : "user";
  const { error: profileError } = await client.from("profiles").update({
    role: nextRole
  }).eq("id", payload.userId);
  if (profileError) {
    throw new Error("同步用户角色失败。");
  }
}
function getSupabaseBrowserClient() {
  {
    return null;
  }
}
const ADMIN_AUTH_CODE = "XC0115";
function isQinghaiLocation(locationText) {
  if (!locationText) {
    return false;
  }
  return /青海|玉树|果洛|海东|海北|海西|海南州|黄南|西宁|柴达木/.test(locationText);
}
function AdminReviewPage() {
  var _a, _b, _c;
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_auth") === "true";
    }
    return false;
  });
  const [inputCode, setInputCode] = useState("");
  const [authError, setAuthError] = useState(false);
  const [listings, setListings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNote, setReviewNote] = useState(
    "已核验视频水印、产地信息与资料完整性。"
  );
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (inputCode === ADMIN_AUTH_CODE) {
      setIsAuthorized(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_auth", "true");
      }
      setAuthError(false);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2e3);
    }
  };
  const loadListings = async () => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setListings([]);
      setSelectedId(null);
      return;
    }
    try {
      const nextListings = await listFarmerApplicationsForReview(client);
      setListings(nextListings);
      setSelectedId((current) => {
        var _a2;
        return current ?? ((_a2 = nextListings[0]) == null ? void 0 : _a2.id) ?? null;
      });
    } catch {
      setListings([]);
    }
  };
  useEffect(() => {
    if (isAuthorized) {
      void loadListings();
    }
  }, [isAuthorized]);
  const selectedListing = useMemo(
    () => listings.find((item) => item.id === selectedId) ?? listings[0] ?? null,
    [listings, selectedId]
  );
  const videoUrl = (selectedListing == null ? void 0 : selectedListing.ranch_proof_video) ?? null;
  const qrUrl = ((_a = selectedListing == null ? void 0 : selectedListing.profile) == null ? void 0 : _a.wechat_qr_url) ?? null;
  const locationText = ((_b = selectedListing == null ? void 0 : selectedListing.profile) == null ? void 0 : _b.ranch_location) ?? "未填写";
  const phoneText = ((_c = selectedListing == null ? void 0 : selectedListing.profile) == null ? void 0 : _c.phone) ?? "未填写";
  const handleReview = async (status) => {
    if (!selectedListing) {
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) {
      return;
    }
    await reviewFarmerApplication(client, {
      applicationId: selectedListing.id,
      userId: selectedListing.user_id,
      status,
      reviewNote
    });
    await loadListings();
  };
  if (!isAuthorized) {
    return /* @__PURE__ */ jsx("section", { className: "container-shell flex min-h-[70vh] items-center justify-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "glass-card w-full max-w-md p-10 text-center animate-fade-in", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gold-500/10 text-gold-500 shadow-gold-glow", children: /* @__PURE__ */ jsx(Lock, { className: "h-10 w-10" }) }),
      /* @__PURE__ */ jsx("h2", { className: "heading-serif text-3xl text-white", children: "审核后台访问受限" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-slate-400 leading-relaxed", children: "请输入管理员授权码以进入审核系统" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleAuthSubmit, className: "mt-10 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(KeyRound, { className: "absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-gold-500/40" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              placeholder: "输入授权码",
              className: `w-full rounded-2xl border bg-black/40 py-5 pl-16 pr-6 text-white outline-none transition-all ${authError ? "border-red-500 animate-pulse" : "border-white/5 focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5"}`,
              value: inputCode,
              onChange: (e) => setInputCode(e.target.value),
              autoFocus: true
            }
          )
        ] }),
        authError && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400 animate-fade-in font-bold", children: "授权码错误，请重新输入" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "btn-gold w-full !py-5 text-sm tracking-widest uppercase",
            children: "验证并进入"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-10 text-[10px] font-bold uppercase tracking-widest text-slate-600", children: "授权码由项目主理人分发，请妥善保管" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative isolate min-h-screen pb-40", children: [
    /* @__PURE__ */ jsx("div", { className: "plateau-grid-bg" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh top-[10%] left-[-5%] w-[400px] h-[400px] bg-plateau-900/20" }),
    /* @__PURE__ */ jsxs("section", { className: "container-shell pt-32 lg:pt-48", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-16 animate-fade-in-up", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md", children: "Admin Review" }),
        /* @__PURE__ */ jsx("h1", { className: "heading-serif mt-10 text-4xl text-white sm:text-6xl", children: "管理员审核界面" }),
        /* @__PURE__ */ jsx("p", { className: "mt-8 text-xl leading-relaxed text-slate-400 max-w-3xl", children: "用于确认农户提交的视频是否为青海本地实景，并核验数字身份证、水印信息和多媒体证明。" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-10 xl:grid-cols-[0.36fr_0.64fr] animate-fade-in-up [animation-delay:200ms]", children: [
        /* @__PURE__ */ jsxs("aside", { className: "glass-card p-10", children: [
          /* @__PURE__ */ jsx("h3", { className: "heading-serif text-2xl text-white mb-4", children: "待审核商品" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 leading-relaxed mb-10", children: "选择一个农户提交记录查看视频与真实性证明" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-6", children: listings.length ? listings.map((item) => {
            var _a2;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                className: [
                  "w-full rounded-[2.5rem] border p-8 text-left transition-all duration-500",
                  (selectedListing == null ? void 0 : selectedListing.id) === item.id ? "border-gold-500/30 bg-gold-500/5 shadow-gold-glow" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"
                ].join(" "),
                onClick: () => setSelectedId(item.id),
                type: "button",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 mb-4", children: [
                    /* @__PURE__ */ jsx("p", { className: "heading-serif text-xl text-white group-hover:text-gold-400 transition-colors", children: item.productName }),
                    isQinghaiLocation((_a2 = item.profile) == null ? void 0 : _a2.ranch_location) ? /* @__PURE__ */ jsx("div", { className: "rounded-full bg-gold-500/10 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-gold-500 border border-gold-500/20", children: "本地产地" }) : /* @__PURE__ */ jsx("div", { className: "rounded-full bg-red-500/10 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-red-400 border border-red-500/20", children: "非青海产地" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-slate-500", children: [
                    /* @__PURE__ */ jsx(Clock3, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-widest", children: new Date(item.created_at).toLocaleString("zh-CN", { hour12: false }) })
                  ] })
                ]
              },
              item.id
            );
          }) : /* @__PURE__ */ jsx("div", { className: "py-20 text-center text-slate-700", children: "暂无待审核记录" }) })
        ] }),
        /* @__PURE__ */ jsx("main", { className: "space-y-10", children: selectedListing ? /* @__PURE__ */ jsxs("div", { className: "glass-card p-10 lg:p-16", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-8 mb-12", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
              /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-500 shadow-gold-glow", children: /* @__PURE__ */ jsx(Video, { className: "h-8 w-8" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "heading-serif text-3xl text-white", children: selectedListing.productName }),
                /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs font-bold uppercase tracking-widest text-slate-500", children: [
                  "批次号: ",
                  selectedListing.id.slice(0, 8)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "rounded-full border border-red-500/20 bg-red-500/5 px-8 py-3 text-xs font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500 hover:text-white",
                  onClick: () => handleReview("rejected"),
                  children: "驳回发布"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn-gold !py-3 !px-8 text-xs tracking-widest uppercase",
                  onClick: () => handleReview("approved"),
                  children: "通过审核"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-10 lg:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-[2.5rem] border border-white/5 bg-black/40 p-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500", children: [
                  /* @__PURE__ */ jsx(MapPinned, { className: "h-4 w-4 text-gold-500" }),
                  "GPS & 水印核验"
                ] }),
                videoUrl ? /* @__PURE__ */ jsx("video", { className: "aspect-video w-full rounded-3xl object-cover shadow-premium", controls: true, src: videoUrl }) : /* @__PURE__ */ jsx("div", { className: "aspect-video w-full rounded-3xl bg-white/[0.01] border border-dashed border-white/10 flex items-center justify-center text-slate-700", children: "视频加载失败" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-bold uppercase tracking-widest", children: "拍摄坐标" }),
                    /* @__PURE__ */ jsx("span", { className: "text-white font-mono", children: locationText })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-bold uppercase tracking-widest", children: "系统判定" }),
                    isQinghaiLocation(locationText) ? /* @__PURE__ */ jsx("span", { className: "text-gold-500 font-bold", children: "符合高原产地要求" }) : /* @__PURE__ */ jsx("span", { className: "text-red-400 font-bold", children: "产地信息异常" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-[2.5rem] border border-white/5 bg-black/40 p-10", children: [
                /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500", children: [
                  /* @__PURE__ */ jsx(MessageSquareWarning, { className: "h-4 w-4 text-gold-500" }),
                  "审核备注"
                ] }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    className: "w-full rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-sm text-slate-300 outline-none focus:border-gold-500/50 min-h-[120px]",
                    onChange: (e) => setReviewNote(e.target.value),
                    value: reviewNote
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-[2.5rem] border border-white/5 bg-black/40 p-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500", children: [
                  /* @__PURE__ */ jsx(BadgeCheck, { className: "h-4 w-4 text-gold-500" }),
                  "资质与细节图核验"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-sm leading-relaxed text-slate-500", children: "当前数据库版本已接入申请视频、联系方式与牧场地址。 若后续扩展补充图片字段，这里会自动展示更多审核素材。" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-[2.5rem] border border-white/5 bg-black/40 p-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500", children: [
                  /* @__PURE__ */ jsx(QrCode, { className: "h-4 w-4 text-gold-500" }),
                  "私域名片核验"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-32 w-32 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center overflow-hidden", children: qrUrl ? /* @__PURE__ */ jsx("img", { alt: "QR", className: "h-full w-full object-cover", src: qrUrl }) : /* @__PURE__ */ jsx(QrCode, { className: "h-10 w-10 text-slate-800" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest", children: "联系电话" }),
                    /* @__PURE__ */ jsx("p", { className: "heading-serif text-2xl text-white", children: phoneText })
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "glass-card flex min-h-[50vh] flex-col items-center justify-center py-20 text-center", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-20 w-20 text-slate-800 opacity-20" }),
          /* @__PURE__ */ jsx("h4", { className: "heading-serif mt-8 text-2xl text-white", children: "请在左侧选择待审核记录" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-slate-500", children: "暂无待处理的商品发布申请" })
        ] }) })
      ] })
    ] })
  ] });
}
const STORAGE_BUCKET$1 = "farmer-media";
function LargeInput$1({ className = "", ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      className: [
        "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-white outline-none transition",
        "placeholder:text-slate-500 focus:border-plateau-400",
        className
      ].join(" ")
    }
  );
}
function LargeTextArea({ className = "", ...props }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      ...props,
      className: [
        "min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-white outline-none transition",
        "placeholder:text-slate-500 focus:border-plateau-400",
        className
      ].join(" ")
    }
  );
}
function sanitizeFileName$1(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}
function ApplyFarmerPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    realName: "",
    phone: "",
    wechat: "",
    ranchLocation: ""
  });
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState({
    type: "idle",
    message: "提交后将进入审核中状态，预计 24 小时内完成审核。"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booting, setBooting] = useState(true);
  const videoFiles = useMemo(
    () => files.filter((file) => file.type.startsWith("video/")),
    [files]
  );
  const imageFiles = useMemo(
    () => files.filter((file) => file.type.startsWith("image/")),
    [files]
  );
  const previewItems = useMemo(
    () => files.map((file) => ({
      file,
      url: URL.createObjectURL(file)
    })),
    [files]
  );
  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewItems]);
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const client = getSupabaseBrowserClient();
      if (!client) {
        if (!cancelled) {
          setBooting(false);
          setStatus({
            type: "warning",
            message: "尚未配置 Supabase 环境变量，请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。"
          });
        }
        return;
      }
      try {
        const profile = await getCurrentProfile(client);
        if (cancelled) {
          return;
        }
        setFormData((current) => ({
          ...current,
          phone: profile.phone ?? "",
          wechat: profile.wechat_qr_url ?? "",
          ranchLocation: profile.ranch_location ?? ""
        }));
        if (profile.role === "pending_farmer") {
          navigate("/audit-status", { replace: true });
          return;
        }
        if (profile.role === "farmer") {
          navigate("/dashboard/farmer", { replace: true });
          return;
        }
      } catch {
        if (!cancelled) {
          setStatus({
            type: "warning",
            message: "请先登录后再申请成为发布者。"
          });
        }
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
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };
  const handleFileSelect = (event) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setFiles(nextFiles);
  };
  const uploadMedia = async (client, userId) => {
    if (!videoFiles.length) {
      throw new Error("请至少上传一段牧场放牧或自荐视频。");
    }
    const submissionKey = `${userId}/${Date.now()}`;
    const primaryVideo = videoFiles[0];
    const videoPath = `${submissionKey}/video-${sanitizeFileName$1(primaryVideo.name)}`;
    const { error: videoError } = await client.storage.from(STORAGE_BUCKET$1).upload(videoPath, primaryVideo, {
      upsert: false,
      cacheControl: "3600"
    });
    if (videoError) {
      throw new Error("证明视频上传失败，请确认 Supabase Storage 已创建 farmer-media bucket。");
    }
    await Promise.all(
      imageFiles.map(async (file, index) => {
        const imagePath = `${submissionKey}/images/${index + 1}-${sanitizeFileName$1(file.name)}`;
        const { error } = await client.storage.from(STORAGE_BUCKET$1).upload(imagePath, file, {
          upsert: false,
          cacheControl: "3600"
        });
        if (error) {
          throw new Error("补充图片上传失败，请稍后重试。");
        }
      })
    );
    const { data } = client.storage.from(STORAGE_BUCKET$1).getPublicUrl(videoPath);
    return data.publicUrl;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) {
      setStatus({
        type: "error",
        message: "尚未配置 Supabase 环境变量，当前无法提交申请。请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。"
      });
      return;
    }
    if (!formData.realName || !formData.phone || !formData.wechat || !formData.ranchLocation) {
      setStatus({
        type: "error",
        message: "请完整填写真实姓名、联系电话、微信号和牧场详细地址。"
      });
      return;
    }
    setIsSubmitting(true);
    setStatus({
      type: "loading",
      message: "正在上传证明素材并提交发布者申请，请稍候..."
    });
    try {
      const {
        data: { user },
        error: userError
      } = await client.auth.getUser();
      if (userError || !user) {
        throw new Error("请先登录后再提交申请。");
      }
      const videoUrl = await uploadMedia(client, user.id);
      const application = await applyForFarmer(client, {
        real_name: formData.realName,
        id_card: `${formData.realName}-待补录`,
        ranch_proof_video: videoUrl,
        phone: formData.phone,
        // 当前 schema 仅提供 wechat_qr_url 字段，这里先写入微信号字符串。
        wechat_qr_url: formData.wechat,
        ranch_location: formData.ranchLocation
      });
      navigate("/audit-status", {
        replace: true,
        state: {
          applicationId: application.id,
          submittedAt: application.created_at
        }
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "提交失败，请稍后重试。"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("section", { className: "container-shell py-12 sm:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 max-w-4xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-plateau-200", children: "Apply Publisher" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-white sm:text-4xl", children: "申请成为发布者" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-slate-300", children: "完成基础身份信息和真实性素材提交后，你的账户将进入发布者审核流程。审核通过后即可进入农户控制台发布产品。" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[0.7fr_0.3fr]", children: [
      /* @__PURE__ */ jsxs("form", { className: "space-y-6", onSubmit: (event) => void handleSubmit(event), children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-plateau-500/15 p-3 text-plateau-200", children: /* @__PURE__ */ jsx(UserRound, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "基础资料" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-6 text-slate-400", children: "请填写真实身份信息，便于平台审核与你后续发布产品时建立可信档案。" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsx(
              LargeInput$1,
              {
                name: "realName",
                onChange: handleChange,
                placeholder: "真实姓名",
                value: formData.realName
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Phone, { className: "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" }),
              /* @__PURE__ */ jsx(
                LargeInput$1,
                {
                  className: "pl-12",
                  name: "phone",
                  onChange: handleChange,
                  placeholder: "联系电话",
                  type: "tel",
                  value: formData.phone
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              LargeInput$1,
              {
                name: "wechat",
                onChange: handleChange,
                placeholder: "微信号",
                value: formData.wechat
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(MapPinned, { className: "pointer-events-none absolute left-4 top-6 h-5 w-5 text-slate-500" }),
              /* @__PURE__ */ jsx(
                LargeTextArea,
                {
                  className: "pl-12",
                  name: "ranchLocation",
                  onChange: handleChange,
                  placeholder: "牧场详细地址",
                  value: formData.ranchLocation
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-sky-500/15 p-3 text-sky-200", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "真实性素材上传" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-6 text-slate-400", children: "请拍摄一段您在牧场放牧或自荐的短视频，以证明真实性。" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-5", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-plateau-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-plateau-400",
                onClick: () => {
                  var _a;
                  return (_a = document.getElementById("publisher-media-upload")) == null ? void 0 : _a.click();
                },
                type: "button",
                children: [
                  /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5" }),
                  "选择视频和图片素材"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                accept: "video/*,image/*",
                className: "hidden",
                id: "publisher-media-upload",
                multiple: true,
                onChange: handleFileSelect,
                type: "file"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
                  /* @__PURE__ */ jsx(Video, { className: "h-4 w-4 text-sky-200" }),
                  /* @__PURE__ */ jsx("span", { children: "视频素材" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "mt-2 text-lg font-semibold text-white", children: [
                  videoFiles.length,
                  " 个"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
                  /* @__PURE__ */ jsx(ImagePlus, { className: "h-4 w-4 text-plateau-200" }),
                  /* @__PURE__ */ jsx("span", { children: "图片素材" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "mt-2 text-lg font-semibold text-white", children: [
                  imageFiles.length,
                  " 张"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-5 grid gap-3 md:grid-cols-2", children: previewItems.length ? previewItems.map(
            (item) => item.file.type.startsWith("video/") ? /* @__PURE__ */ jsx(
              "video",
              {
                className: "h-56 w-full rounded-3xl object-cover",
                controls: true,
                src: item.url
              },
              item.url
            ) : /* @__PURE__ */ jsx(
              "img",
              {
                alt: item.file.name,
                className: "h-56 w-full rounded-3xl object-cover",
                src: item.url
              },
              item.url
            )
          ) : /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-slate-400", children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-10 w-10" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm", children: "支持上传视频和图片，视频为必填，图片为补充审核材料" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `rounded-2xl px-4 py-4 text-sm leading-6 ${status.type === "error" ? "border border-rose-300/20 bg-rose-500/10 text-rose-100" : status.type === "warning" ? "border border-amber-300/20 bg-amber-500/10 text-amber-100" : "border border-emerald-300/20 bg-emerald-500/10 text-emerald-100"}`,
              children: status.message
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-col gap-3 sm:flex-row", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-sky-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60",
                disabled: isSubmitting || booting,
                type: "submit",
                children: [
                  isSubmitting ? /* @__PURE__ */ jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }),
                  "提交申请"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                className: "flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 py-4 text-base font-semibold text-slate-100 transition hover:bg-white/10",
                to: "/",
                children: [
                  "返回首页",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-5 w-5" })
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "申请说明" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 space-y-4 text-sm leading-6 text-slate-300", children: [
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: "提交申请后会向 `farmer_applications` 写入记录，并把你的账户流转到 `pending_farmer`。" }),
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: "建议自拍视频控制在 30 秒到 90 秒，能清晰体现草场、棚圈或本人出镜。" }),
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: "图片可补充牧场环境、牲畜状态、合作证明等材料，帮助审核更快通过。" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "状态流转" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-plateau-300/20 bg-plateau-500/10 p-4 text-sm text-plateau-100", children: "`user`：普通消费者，可浏览与咨询" }),
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-sm text-amber-100", children: "`pending_farmer`：资料已提交，等待审核" }),
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-sm text-emerald-100", children: "`farmer`：审核通过，可进入农户控制台发布产品" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function getSupabaseConfigSummary() {
  const supabaseUrl = void 0;
  const supabaseAnonKey = void 0;
  return {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    supabaseUrl
  };
}
function normalizeAuthError(error) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "认证失败，请稍后重试。";
  if (/Failed to fetch/i.test(message)) {
    return "认证服务连接失败。请检查 Supabase 项目是否可访问、环境变量是否正确，以及当前网络是否能连到 Supabase。";
  }
  if (/network/i.test(message)) {
    return "网络连接异常，暂时无法连接认证服务，请稍后重试。";
  }
  if (/Invalid login credentials/i.test(message)) {
    return "邮箱或密码不正确。";
  }
  if (/User already registered/i.test(message)) {
    return "该邮箱已注册，请直接登录。";
  }
  if (/Email not confirmed/i.test(message)) {
    return "该邮箱尚未完成验证，请先前往邮箱完成确认。";
  }
  return message;
}
function AuthInput({ className = "", ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      className: [
        "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-white outline-none transition",
        "placeholder:text-slate-500 focus:border-plateau-400",
        className
      ].join(" ")
    }
  );
}
function AuthPage() {
  const navigate = useNavigate();
  const config = getSupabaseConfigSummary();
  const isConfigReady = config.hasUrl && config.hasAnonKey;
  const [mode, setMode] = useState("signin");
  const [booting, setBooting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({
    type: "idle",
    message: "登录后即可提交发布者申请、查看审核状态并管理农户后台。"
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const client = getSupabaseBrowserClient();
      if (!client) {
        if (!cancelled) {
          setStatus({
            type: "warning",
            message: "尚未配置 Supabase 环境变量，请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。"
          });
          setBooting(false);
        }
        return;
      }
      try {
        const {
          data: { user }
        } = await client.auth.getUser();
        if (!user || cancelled) {
          return;
        }
        const profile = await ensureCurrentProfile(client);
        if (cancelled) {
          return;
        }
        if (profile.role === "farmer") {
          navigate("/dashboard/farmer", { replace: true });
          return;
        }
        if (profile.role === "pending_farmer") {
          navigate("/audit-status", { replace: true });
          return;
        }
        navigate("/apply-farmer", { replace: true });
      } catch {
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
    if (status.type === "error") {
      return "border-red-500/30 bg-red-500/10 text-red-200";
    }
    if (status.type === "success") {
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    }
    if (status.type === "warning") {
      return "border-gold-500/30 bg-gold-500/10 text-amber-100";
    }
    return "border-white/10 bg-white/[0.03] text-slate-300";
  }, [status.type]);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) {
      setStatus({
        type: "warning",
        message: "尚未配置 Supabase 环境变量，请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。"
      });
      return;
    }
    if (!formData.email || !formData.password) {
      setStatus({
        type: "error",
        message: "请输入邮箱和密码。"
      });
      return;
    }
    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      setStatus({
        type: "error",
        message: "两次输入的密码不一致。"
      });
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error: error2 } = await client.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error2) {
          throw new Error(error2.message || "登录失败，请检查邮箱和密码。");
        }
        await ensureCurrentProfile(client);
        const profile = await getCurrentProfile(client);
        setStatus({
          type: "success",
          message: "登录成功，正在为你跳转。"
        });
        if (profile.role === "farmer") {
          navigate("/dashboard/farmer", { replace: true });
          return;
        }
        if (profile.role === "pending_farmer") {
          navigate("/audit-status", { replace: true });
          return;
        }
        navigate("/apply-farmer", { replace: true });
        return;
      }
      const { data, error } = await client.auth.signUp({
        email: formData.email,
        password: formData.password
      });
      if (error) {
        throw new Error(error.message || "注册失败，请稍后重试。");
      }
      if (data.user && data.session) {
        await ensureCurrentProfile(client);
        setStatus({
          type: "success",
          message: "注册成功，已自动登录，正在前往发布者申请页。"
        });
        navigate("/apply-farmer", { replace: true });
        return;
      }
      setStatus({
        type: "success",
        message: "注册成功，请前往邮箱完成验证后再登录。"
      });
      setMode("signin");
      setFormData((current) => ({
        ...current,
        password: "",
        confirmPassword: ""
      }));
    } catch (error) {
      setStatus({
        type: "error",
        message: normalizeAuthError(error)
      });
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative isolate min-h-screen overflow-x-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "plateau-grid-bg" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh top-[5%] left-[-10%] h-[360px] w-[360px] bg-plateau-900/30" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh bottom-[10%] right-[-5%] h-[420px] w-[420px] bg-gold-900/10" }),
    /* @__PURE__ */ jsx("section", { className: "container-shell relative py-28 lg:py-40", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }),
          "账户认证入口"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "section-title mt-8 max-w-4xl text-4xl sm:text-5xl lg:text-6xl", children: [
          "登录后进入",
          /* @__PURE__ */ jsx("span", { className: "text-gradient-gold", children: " 发布者申请与农户后台" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg", children: "当前项目已经接入数据库权限链路，但之前缺少实际登录入口。现在你可以先注册或登录，再继续申请发布者、查看审核状态与管理商品。" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 text-sm leading-7 text-slate-400", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-white", children: "当前认证配置状态" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2", children: [
            "`VITE_SUPABASE_URL`：",
            config.hasUrl ? "已配置" : "未配置"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "`VITE_SUPABASE_ANON_KEY`：",
            config.hasAnonKey ? "已配置" : "未配置"
          ] }),
          null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-col gap-4 sm:flex-row", children: [
          /* @__PURE__ */ jsx(Link, { className: "btn-outline w-full sm:w-auto", to: "/apply-farmer", children: "我先看看申请页" }),
          /* @__PURE__ */ jsx(Link, { className: "btn-outline w-full sm:w-auto", to: "/dashboard/farmer", children: "我已登录，进入后台" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card w-full p-6 sm:p-8 lg:p-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 rounded-full border border-white/5 bg-white/[0.02] p-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: [
                "rounded-full px-4 py-3 text-sm font-bold transition-all duration-300",
                mode === "signin" ? "bg-gold-500 text-slate-950" : "text-slate-400 hover:bg-white/5 hover:text-white"
              ].join(" "),
              onClick: () => setMode("signin"),
              type: "button",
              children: "登录"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: [
                "rounded-full px-4 py-3 text-sm font-bold transition-all duration-300",
                mode === "signup" ? "bg-gold-500 text-slate-950" : "text-slate-400 hover:bg-white/5 hover:text-white"
              ].join(" "),
              onClick: () => setMode("signup"),
              type: "button",
              children: "注册"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("form", { className: "mt-8 space-y-5", onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500", children: "邮箱" }),
            /* @__PURE__ */ jsx(
              AuthInput,
              {
                autoComplete: "email",
                name: "email",
                onChange: handleChange,
                placeholder: "请输入登录邮箱",
                type: "email",
                value: formData.email
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500", children: "密码" }),
            /* @__PURE__ */ jsx(
              AuthInput,
              {
                autoComplete: mode === "signin" ? "current-password" : "new-password",
                name: "password",
                onChange: handleChange,
                placeholder: "请输入密码",
                type: "password",
                value: formData.password
              }
            )
          ] }),
          mode === "signup" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500", children: "确认密码" }),
            /* @__PURE__ */ jsx(
              AuthInput,
              {
                autoComplete: "new-password",
                name: "confirmPassword",
                onChange: handleChange,
                placeholder: "请再次输入密码",
                type: "password",
                value: formData.confirmPassword
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: `rounded-3xl border px-5 py-4 text-sm leading-7 ${statusClassName}`, children: booting ? "正在检查当前登录状态..." : status.message }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn-gold flex w-full items-center justify-center gap-3 !py-4 text-sm uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-60",
              disabled: submitting || booting || !isConfigReady,
              type: "submit",
              children: submitting || booting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }),
                "正在处理中"
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                mode === "signin" ? /* @__PURE__ */ jsx(LogIn, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(UserPlus, { className: "h-5 w-5" }),
                mode === "signin" ? "立即登录" : "创建账户"
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-xs leading-6 text-slate-500", children: [
          "登录后会根据你的角色自动跳转到申请页、审核状态页或农户后台。",
          /* @__PURE__ */ jsx(Link, { className: "ml-1 text-gold-500 hover:text-gold-400", to: "/apply-farmer", children: "继续前往发布者申请" }),
          /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1 inline h-3.5 w-3.5" })
        ] })
      ] })
    ] }) })
  ] });
}
function AuditStatusPage() {
  var _a;
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submittedAt, setSubmittedAt] = useState(
    ((_a = location.state) == null ? void 0 : _a.submittedAt) ? new Date(location.state.submittedAt).toLocaleString("zh-CN", {
      hour12: false
    }) : null
  );
  const [currentRole, setCurrentRole] = useState("pending_farmer");
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const client = getSupabaseBrowserClient();
      if (!client) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }
      try {
        const [application, profile] = await Promise.all([
          getLatestCurrentApplication(client),
          getCurrentProfile(client)
        ]);
        if (cancelled) {
          return;
        }
        if (application == null ? void 0 : application.created_at) {
          setSubmittedAt(
            new Date(application.created_at).toLocaleString("zh-CN", {
              hour12: false
            })
          );
        }
        setCurrentRole(profile.role);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);
  return /* @__PURE__ */ jsx("section", { className: "container-shell flex min-h-[72vh] items-center justify-center py-12 sm:py-16", children: /* @__PURE__ */ jsxs("div", { className: "glass-card w-full max-w-3xl overflow-hidden p-6 sm:p-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(245,158,11,0.18),rgba(15,23,42,0.45))] p-8 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-amber-100", children: /* @__PURE__ */ jsx(LoaderCircle, { className: `h-10 w-10 ${loading ? "animate-spin" : ""}` }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm uppercase tracking-[0.25em] text-amber-100/80", children: "Pending Review" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-white sm:text-4xl", children: "你的发布者申请已进入审核中" }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200", children: "平台已收到你的资料与真实性素材，预计 24 小时内完成审核。审核通过后，你将自动获得农户发布权限。" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
          /* @__PURE__ */ jsx(Clock3, { className: "h-4 w-4 text-amber-200" }),
          /* @__PURE__ */ jsx("span", { children: "审核时效" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: "预计 24 小时内" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-sky-200" }),
          /* @__PURE__ */ jsx("span", { children: "当前角色" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: currentRole })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
          /* @__PURE__ */ jsx(Clock3, { className: "h-4 w-4 text-plateau-200" }),
          /* @__PURE__ */ jsx("span", { children: "提交时间" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: submittedAt ?? "刚刚提交" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-3xl border border-white/10 bg-white/5 p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "审核期间你可以做什么" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-3 text-sm leading-6 text-slate-300", children: [
        /* @__PURE__ */ jsx("p", { children: "继续完善溯源资料与牧场素材，方便后续更快发布产品。" }),
        /* @__PURE__ */ jsx("p", { children: "确保联系电话与微信号可用，以便平台联系核验。" }),
        /* @__PURE__ */ jsx("p", { children: "若 24 小时后仍未收到结果，可通过私域入口联系项目方复核。" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          className: "flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-plateau-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-plateau-400",
          to: "/",
          children: "返回首页"
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          className: "flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 py-4 text-base font-semibold text-slate-100 transition hover:bg-white/10",
          to: "/connect",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" }),
            "联系项目团队"
          ]
        }
      )
    ] })
  ] }) });
}
function FarmerRouteGuard({ children }) {
  const [state, setState] = useState({
    loading: true,
    redirectTo: null
  });
  useEffect(() => {
    let cancelled = false;
    async function checkRole() {
      const client = getSupabaseBrowserClient();
      if (!client) {
        if (!cancelled) {
          setState({
            loading: false,
            redirectTo: "/apply-farmer"
          });
        }
        return;
      }
      try {
        const profile = await getCurrentProfile(client);
        if (cancelled) {
          return;
        }
        if (profile.role === "user") {
          setState({
            loading: false,
            redirectTo: "/apply-farmer"
          });
          return;
        }
        if (profile.role === "pending_farmer") {
          setState({
            loading: false,
            redirectTo: "/audit-status"
          });
          return;
        }
        setState({
          loading: false,
          redirectTo: null
        });
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            redirectTo: "/apply-farmer"
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
    return /* @__PURE__ */ jsx("section", { className: "container-shell flex min-h-[60vh] items-center justify-center py-16", children: /* @__PURE__ */ jsxs("div", { className: "glass-card w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx(LoaderCircle, { className: "mx-auto h-10 w-10 animate-spin text-plateau-200" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-5 text-2xl font-semibold text-white", children: "正在校验农户权限" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-slate-400", children: "系统正在根据你的角色自动跳转到申请页、审核状态页或农户控制台。" })
    ] }) });
  }
  if (state.redirectTo) {
    return /* @__PURE__ */ jsx(Navigate, { replace: true, to: state.redirectTo });
  }
  return children;
}
const navItems = [
  { label: "首页", to: "/", icon: Home, desc: "回到大厅起点" },
  { label: "溯源大厅", to: "/traceability", icon: Search, desc: "查验产品数字档案" },
  { label: "农场商城", to: "/showcase", icon: Store, desc: "探索高原优质产品" },
  { label: "农户后台", to: "/dashboard/farmer", icon: User, desc: "管理我的牧场与发布" },
  { label: "审核后台", to: "/admin-review", icon: ShieldCheck, desc: "资质与产品审核管理" },
  { label: "合作伙伴", to: "/partners", icon: Users, desc: "共建生态的伙伴们" },
  { label: "关于我们", to: "/connect", icon: MessageCircle, desc: "了解我们的使命与愿景" }
];
function navClassName({ isActive }) {
  return [
    "nav-link group relative block py-2 font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-500",
    isActive ? "text-gold-500" : "text-slate-400 hover:text-white"
  ].join(" ");
}
function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setIsAuthenticated(false);
      return void 0;
    }
    let mounted = true;
    client.auth.getUser().then(({ data }) => {
      if (mounted) {
        setIsAuthenticated(Boolean(data.user));
      }
    });
    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session == null ? void 0 : session.user));
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  const handleMobileNav = (to) => {
    setIsMenuOpen(false);
    if (typeof window === "undefined") {
      return;
    }
    if (window.location.pathname === to) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      return;
    }
    window.location.assign(to);
  };
  const handleAuthAction = async () => {
    const client = getSupabaseBrowserClient();
    if (!isAuthenticated || !client) {
      navigate("/auth");
      return;
    }
    await client.auth.signOut();
    setIsMenuOpen(false);
    navigate("/auth");
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col bg-[#080d0b] overflow-x-hidden", children: [
    /* @__PURE__ */ jsx("header", { className: "fixed top-0 left-0 right-0 z-[200] py-6 pointer-events-none", children: /* @__PURE__ */ jsx("nav", { className: "container-shell pointer-events-auto", children: /* @__PURE__ */ jsxs("div", { className: "glass-card flex items-center justify-between px-8 py-4 !rounded-full border-white/10 bg-black/40 backdrop-blur-2xl", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          className: "flex items-center gap-3 transition-all duration-500 hover:opacity-80 active:scale-95",
          to: "/",
          onClick: () => setIsMenuOpen(false),
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-slate-950 shadow-gold-glow", children: /* @__PURE__ */ jsx(Mountain, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsx("span", { className: "heading-serif text-xl text-white hidden sm:block", children: "高原科技牧场" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-8 lg:flex", children: [
        navItems.map((item) => /* @__PURE__ */ jsxs(
          NavLink,
          {
            className: navClassName,
            to: item.to,
            children: [
              item.label,
              /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 h-[1px] w-full origin-right scale-x-0 bg-gold-500 transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" })
            ]
          },
          item.to
        )),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn-outline !px-6 !py-3 text-xs uppercase tracking-[0.2em]",
            onClick: () => void handleAuthAction(),
            type: "button",
            children: isAuthenticated ? "退出登录" : "登录注册"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "relative z-[210] flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 lg:hidden border border-white/10 transition-all hover:bg-white/10 active:scale-90 cursor-pointer",
          onClick: () => setIsMenuOpen(!isMenuOpen),
          type: "button",
          "aria-label": isMenuOpen ? "关闭菜单" : "打开菜单",
          children: /* @__PURE__ */ jsx("div", { className: "relative h-5 w-5 pointer-events-none", children: isMenuOpen ? /* @__PURE__ */ jsx(X$1, { className: "absolute inset-0 h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "absolute inset-0 h-5 w-5" }) })
        }
      )
    ] }) }) }),
    isMenuOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[150] lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500 cursor-pointer",
          onClick: () => setIsMenuOpen(false)
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "container-shell relative z-[160] flex h-full flex-col justify-center py-10", children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "glass-card flex max-h-[85vh] flex-col overflow-hidden !rounded-[3rem] border-white/10 bg-black/60 shadow-2xl animate-in slide-in-from-bottom-12 duration-700 pointer-events-auto",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsx("div", { className: "border-b border-white/5 bg-white/[0.02] px-10 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-slate-950 shadow-gold-glow", children: /* @__PURE__ */ jsx(Mountain, { className: "h-7 w-7" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h2", { className: "heading-serif text-xl text-white", children: "导航菜单" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-gold-500/60", children: "高原科技牧场 · 数字化桥梁" })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-6 py-6 custom-scrollbar", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "group flex w-full items-center gap-5 rounded-3xl border border-gold-500/15 bg-gold-500/5 p-5 text-left transition-all duration-500 hover:bg-gold-500/10 active:scale-[0.98]",
                  onClick: () => void handleAuthAction(),
                  type: "button",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-500 shadow-gold-glow/20", children: isAuthenticated ? /* @__PURE__ */ jsx(LogOut, { className: "h-6 w-6" }) : /* @__PURE__ */ jsx(LogIn, { className: "h-6 w-6" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsx("span", { className: "block text-lg font-bold tracking-wide text-white transition-colors", children: isAuthenticated ? "退出登录" : "登录 / 注册" }),
                      /* @__PURE__ */ jsx("span", { className: "block text-xs text-slate-400 transition-colors", children: isAuthenticated ? "退出当前账户后重新选择身份" : "先登录，再申请发布者或进入农户后台" })
                    ] }),
                    /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5 text-gold-500 transition-all duration-500 group-hover:translate-x-1" })
                  ]
                }
              ),
              navItems.map((item) => /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "group flex w-full items-center gap-5 rounded-3xl p-5 text-left transition-all duration-500 hover:bg-white/5 active:scale-[0.98] cursor-pointer border border-transparent hover:border-white/5",
                  onClick: () => handleMobileNav(item.to),
                  type: "button",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-slate-400 transition-all duration-500 group-hover:bg-gold-500/10 group-hover:text-gold-500 group-hover:shadow-gold-glow/20", children: /* @__PURE__ */ jsx(item.icon, { className: "h-6 w-6" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsx("span", { className: "block text-lg font-bold tracking-wide text-slate-200 group-hover:text-white transition-colors", children: item.label }),
                      /* @__PURE__ */ jsx("span", { className: "block text-xs text-slate-500 group-hover:text-slate-400 transition-colors", children: item.desc })
                    ] }),
                    /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5 text-slate-600 transition-all duration-500 group-hover:translate-x-1 group-hover:text-gold-500" })
                  ]
                },
                item.to
              ))
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "border-t border-white/5 bg-white/[0.02] px-10 py-8", children: /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn-outline w-full !py-4 text-xs font-bold tracking-widest",
                onClick: () => setIsMenuOpen(false),
                children: "关闭导航"
              }
            ) })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "flex-1", children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-white/5 bg-black/40 py-20 backdrop-blur-xl", children: /* @__PURE__ */ jsxs("div", { className: "container-shell", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-16 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Mountain, { className: "h-7 w-7 text-gold-500" }) }),
            /* @__PURE__ */ jsx("span", { className: "heading-serif text-2xl text-white", children: "高原科技牧场" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "max-w-md text-lg leading-relaxed text-slate-400", children: "连接青海农牧散户、企业与消费者的数字桥梁。我们以科技赋能传统牧场，让每一份高原馈赠都拥有真实可信的数字档案。" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-8 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold uppercase tracking-widest text-white", children: "快速导航" }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-slate-400", children: [
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/traceability", className: "hover:text-gold-500 transition-colors", children: "溯源大厅" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/showcase", className: "hover:text-gold-500 transition-colors", children: "农场商城" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/partners", className: "hover:text-gold-500 transition-colors", children: "合作伙伴" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold uppercase tracking-widest text-white", children: "农户服务" }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-slate-400", children: [
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/auth", className: "hover:text-gold-500 transition-colors", children: "登录 / 注册" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/dashboard/farmer", className: "hover:text-gold-500 transition-colors", children: "农户后台" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { to: "/apply-farmer", className: "hover:text-gold-500 transition-colors", children: "申请入驻" }) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-20 border-t border-white/5 pt-10 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-slate-500", children: "© 2026 高原科技牧场. 第十五届挑战杯项目衍生平台." }) })
    ] }) })
  ] });
}
const cards = [
  {
    icon: Users,
    title: "团队介绍",
    description: "展示挑战杯项目背景、团队分工与田野调研成果。"
  },
  {
    icon: QrCode,
    title: "私域引流",
    description: "预留企业微信、公众号、小程序码等私域入口位置。"
  },
  {
    icon: MessageCircleMore,
    title: "合作洽谈",
    description: "提供合作联系方式，承接品牌联动与渠道共建。"
  }
];
function ConnectPage() {
  return /* @__PURE__ */ jsxs("div", { className: "animate-fade-in", children: [
    /* @__PURE__ */ jsx("section", { className: "container-shell py-12 sm:py-16", children: /* @__PURE__ */ jsxs("div", { className: "glass-card overflow-hidden p-8 sm:p-16 relative", children: [
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-plateau-500/10 blur-3xl" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-plateau-200 animate-fade-in-up", children: "Connect" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-3 text-4xl font-extrabold text-white sm:text-5xl animate-fade-in-up delay-75", children: "关于我们与私域入口" }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 animate-fade-in-up delay-150", children: "该页面承载团队介绍、合作洽谈和私域转化入口。 我们通过数字化手段，将线下的田野调研、牧场实景与线上品牌建设深度联动，构建可持续的高原农牧生态圈。" }),
        /* @__PURE__ */ jsx("div", { className: "mt-16 grid gap-8 md:grid-cols-3", children: cards.map(({ icon: Icon, title, description }, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "glass-card group p-8 animate-scale-in",
            style: { animationDelay: `${(index + 2) * 150}ms` },
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-plateau-500/15 text-plateau-300 transition-all duration-500 group-hover:scale-110 group-hover:bg-plateau-500/25", children: /* @__PURE__ */ jsx(Icon, { className: "h-7 w-7" }) }),
              /* @__PURE__ */ jsx("h3", { className: "mt-6 text-2xl font-bold text-white group-hover:text-plateau-300 transition-colors", children: title }),
              /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-relaxed text-slate-400", children: description }),
              /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center gap-2 text-sm font-medium text-plateau-400 group-hover:text-plateau-300 transition-colors", children: [
                /* @__PURE__ */ jsx("span", { children: "了解更多" }),
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-1" })
              ] })
            ]
          },
          title
        )) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "container-shell py-16 sm:py-24 animate-fade-in-up", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-12 lg:grid-cols-2 lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass-card p-10", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-3xl font-bold text-white", children: "项目使命" }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg leading-relaxed text-slate-300", children: "“高原科技牧场”源自第十五届挑战杯项目，旨在利用移动互联网与数字化溯源技术， 解决青海边远地区农牧产品外销中的信任痛点。" }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 space-y-4", children: [
          "连接散户：让每一户牧民的辛勤都有迹可循",
          "赋能企业：提升地方农牧品牌的核心竞争力",
          "触达消费：为城市家庭提供安全透明的选购参考"
        ].map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-slate-300", children: [
          /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-plateau-500" }),
          /* @__PURE__ */ jsx("span", { children: item })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative aspect-video rounded-[2.5rem] border border-white/10 bg-slate-900/50 flex items-center justify-center overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-plateau-grid opacity-10" }),
        /* @__PURE__ */ jsxs("div", { className: "text-center p-8", children: [
          /* @__PURE__ */ jsx(Users, { className: "mx-auto h-16 w-16 text-slate-700 mb-6" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-500 italic", children: "团队调研实景照片/视频占位" })
        ] })
      ] })
    ] }) })
  ] });
}
const initialPublishedProducts = [
  {
    id: "farmer-yak-1",
    name: "玉树生态牦牛前腿肉",
    specs: "2kg / 箱",
    price: "¥198",
    stock: "12",
    status: "在售中"
  },
  {
    id: "farmer-lamb-2",
    name: "高原藏羊分割礼盒",
    specs: "1.5kg / 盒",
    price: "¥268",
    stock: "8",
    status: "在售中"
  },
  {
    id: "farmer-barley-3",
    name: "青稞健康组合装",
    specs: "750g / 盒",
    price: "¥88",
    stock: "36",
    status: "在售中"
  }
];
const STORAGE_BUCKET = "farmer-media";
function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}
function parseProductDescription(description) {
  var _a, _b;
  const raw = description ?? "";
  const specsMatch = raw.match(/规格：([^\n]+)/);
  const stockMatch = raw.match(/库存：([^\n]+)/);
  return {
    specs: ((_a = specsMatch == null ? void 0 : specsMatch[1]) == null ? void 0 : _a.trim()) ?? "待补充",
    stock: ((_b = stockMatch == null ? void 0 : stockMatch[1]) == null ? void 0 : _b.trim()) ?? "待补充"
  };
}
function formatPublishedProduct(product) {
  const meta = parseProductDescription(product.description);
  return {
    id: product.id,
    name: product.product_name,
    specs: meta.specs,
    price: product.price != null ? `¥${product.price}` : "待定",
    stock: meta.stock,
    status: "在售中"
  };
}
function SectionHeader({ icon: Icon, title, hint }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-start gap-4", children: [
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-white/5 border border-white/10 p-4 text-gold-500 shadow-gold-glow", children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "heading-serif text-2xl text-white", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-slate-500", children: hint })
    ] })
  ] });
}
function LargeInput({ className = "", ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      className: [
        "w-full rounded-2xl border border-white/5 bg-black/40 px-6 py-5 text-base text-white outline-none transition-all",
        "placeholder:text-slate-700 focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5",
        className
      ].join(" ")
    }
  );
}
function UploadButton({ icon: Icon, label, onClick }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: "flex min-h-[4rem] w-full items-center justify-center gap-4 rounded-full bg-gold-500 px-8 py-5 text-sm font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-gold-400 hover:shadow-gold-glow active:scale-95",
      onClick,
      type: "button",
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }),
        label
      ]
    }
  );
}
function FarmerDashboardPage() {
  const [publishForm, setPublishForm] = useState({
    productName: "",
    specs: "",
    price: "",
    stock: ""
  });
  const [contactForm, setContactForm] = useState({
    phone: "189-9701-2234",
    wechatQrLabel: "当前已绑定微信二维码",
    wechatQrUrl: ""
  });
  const [videoFile, setVideoFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [qrFile, setQrFile] = useState(null);
  const [publishedProducts, setPublishedProducts] = useState(initialPublishedProducts);
  const [isBooting, setIsBooting] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(
    "填写商品信息并上传素材后，即可快速发布到农户控制台。"
  );
  const videoPreview = useMemo(
    () => videoFile ? URL.createObjectURL(videoFile) : null,
    [videoFile]
  );
  const qrPreview = useMemo(
    () => qrFile ? URL.createObjectURL(qrFile) : null,
    [qrFile]
  );
  const imagePreviews = useMemo(
    () => imageFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    })),
    [imageFiles]
  );
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      if (qrPreview) {
        URL.revokeObjectURL(qrPreview);
      }
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imagePreviews, qrPreview, videoPreview]);
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const client = getSupabaseBrowserClient();
      if (!client) {
        if (!cancelled) {
          setSubmitMessage(
            "尚未配置 Supabase 环境变量，当前显示的是本地演示数据。配置后将自动切换为数据库内容。"
          );
          setIsBooting(false);
        }
        return;
      }
      try {
        const [profile, products2] = await Promise.all([
          getCurrentProfile(client),
          listCurrentFarmerProducts(client)
        ]);
        if (cancelled) {
          return;
        }
        setContactForm({
          phone: profile.phone ?? "",
          wechatQrLabel: profile.wechat_qr_url ? "已绑定云端微信二维码" : "当前未上传微信二维码",
          wechatQrUrl: profile.wechat_qr_url ?? ""
        });
        setPublishedProducts(products2.map(formatPublishedProduct));
        setSubmitMessage("数据库已连接，当前页面展示的是你的真实资料与商品。");
      } catch (error) {
        if (!cancelled) {
          setSubmitMessage(
            error instanceof Error ? error.message : "数据库连接失败，当前显示本地演示数据。"
          );
        }
      } finally {
        if (!cancelled) {
          setIsBooting(false);
        }
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);
  const handlePublishChange = (event) => {
    const { name, value } = event.target;
    setPublishForm((current) => ({
      ...current,
      [name]: value
    }));
  };
  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((current) => ({
      ...current,
      [name]: value
    }));
  };
  const handlePublishSubmit = (event) => {
    void (async () => {
      event.preventDefault();
      if (!publishForm.productName || !publishForm.specs || !publishForm.price || !publishForm.stock) {
        setSubmitMessage("请完整填写商品名称、规格、价格和库存。");
        return;
      }
      const client = getSupabaseBrowserClient();
      if (!client) {
        const nextProduct = {
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
          name: publishForm.productName,
          specs: publishForm.specs,
          price: publishForm.price,
          stock: publishForm.stock,
          status: "在售中"
        };
        setPublishedProducts((current) => [nextProduct, ...current]);
        setPublishForm({
          productName: "",
          specs: "",
          price: "",
          stock: ""
        });
        setVideoFile(null);
        setImageFiles([]);
        setSubmitMessage("当前未连接数据库，已仅在本地演示列表中新增商品。");
        return;
      }
      setIsPublishing(true);
      try {
        const created = await createProductAsFarmer(client, {
          product_name: publishForm.productName,
          description: `规格：${publishForm.specs}
库存：${publishForm.stock}`,
          price: Number.parseFloat(String(publishForm.price).replace(/[^\d.]/g, "")) || null
        });
        setPublishedProducts((current) => [formatPublishedProduct(created), ...current]);
        setPublishForm({
          productName: "",
          specs: "",
          price: "",
          stock: ""
        });
        setVideoFile(null);
        setImageFiles([]);
        setSubmitMessage("商品已成功写入数据库。");
      } catch (error) {
        setSubmitMessage(error instanceof Error ? error.message : "商品发布失败，请稍后重试。");
      } finally {
        setIsPublishing(false);
      }
    })();
  };
  const handleTakeDown = (productId) => {
    void (async () => {
      const client = getSupabaseBrowserClient();
      if (!client) {
        setPublishedProducts(
          (current) => current.filter((product) => product.id !== productId)
        );
        setSubmitMessage("当前未连接数据库，商品仅从本地演示列表中移除。");
        return;
      }
      try {
        await deleteCurrentFarmerProduct(client, productId);
        setPublishedProducts(
          (current) => current.filter((product) => product.id !== productId)
        );
        setSubmitMessage("商品已从数据库下架。");
      } catch (error) {
        setSubmitMessage(error instanceof Error ? error.message : "商品下架失败。");
      }
    })();
  };
  const handleQrUpload = (file) => {
    setQrFile(file);
    if (file) {
      setContactForm((current) => ({
        ...current,
        wechatQrLabel: file.name,
        wechatQrUrl: current.wechatQrUrl
      }));
    }
  };
  const handleSaveContact = async () => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setSubmitMessage("尚未配置 Supabase 环境变量，当前无法保存数字名片。");
      return;
    }
    setIsSavingContact(true);
    try {
      let wechatQrUrl = contactForm.wechatQrUrl;
      if (qrFile) {
        const {
          data: { user },
          error: userError
        } = await client.auth.getUser();
        if (userError || !user) {
          throw new Error("请先登录后再保存数字名片。");
        }
        const qrPath = `${user.id}/contact/qr-${Date.now()}-${sanitizeFileName(qrFile.name)}`;
        const { error: uploadError } = await client.storage.from(STORAGE_BUCKET).upload(qrPath, qrFile, {
          upsert: true,
          cacheControl: "3600"
        });
        if (uploadError) {
          throw new Error("微信二维码上传失败，请确认 farmer-media bucket 可用。");
        }
        const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(qrPath);
        wechatQrUrl = data.publicUrl;
      }
      const profile = await updateCurrentProfile(client, {
        phone: contactForm.phone,
        wechat_qr_url: wechatQrUrl || null
      });
      setContactForm((current) => ({
        ...current,
        phone: profile.phone ?? "",
        wechatQrUrl: profile.wechat_qr_url ?? "",
        wechatQrLabel: profile.wechat_qr_url ? "已绑定云端微信二维码" : "当前未上传微信二维码"
      }));
      setQrFile(null);
      setSubmitMessage("数字名片已同步到数据库。");
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "数字名片保存失败。");
    } finally {
      setIsSavingContact(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative isolate min-h-screen pb-40", children: [
    /* @__PURE__ */ jsx("div", { className: "plateau-grid-bg" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh top-[10%] left-[-5%] w-[400px] h-[400px] bg-plateau-900/20" }),
    /* @__PURE__ */ jsxs("section", { className: "container-shell pt-32 lg:pt-48", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-16 animate-fade-in-up", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md", children: "Farmer Dashboard" }),
        /* @__PURE__ */ jsx("h1", { className: "heading-serif mt-10 text-4xl text-white sm:text-6xl", children: "农户数字化控制台" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-8 text-xl leading-relaxed text-slate-400 max-w-3xl", children: [
          "已认证农户专享。在这里，您可以",
          /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "发布新品" }),
          "、 上传",
          /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "真实性证明" }),
          "，并维护您的私域名片。"
        ] }),
        isBooting && /* @__PURE__ */ jsxs("div", { className: "mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300", children: [
          /* @__PURE__ */ jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gold-500" }),
          "正在连接数据库并同步你的资料..."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]", children: [
        /* @__PURE__ */ jsx("div", { className: "glass-card overflow-hidden p-2", children: /* @__PURE__ */ jsxs("div", { className: "h-full rounded-[2.8rem] bg-gradient-to-br from-white/[0.03] to-transparent p-10 lg:p-16 relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-plateau-mesh opacity-30" }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mb-10", children: [
              /* @__PURE__ */ jsx("span", { className: "rounded-full border border-gold-500/20 bg-gold-500/10 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gold-500", children: "认证农户专用" }),
              /* @__PURE__ */ jsx("span", { className: "rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400", children: "移动端优化" })
            ] }),
            /* @__PURE__ */ jsxs("h3", { className: "heading-serif text-3xl text-white sm:text-5xl leading-tight", children: [
              "让高原馈赠",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "text-gradient-gold", children: "直达消费者心间" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-8 max-w-2xl text-lg leading-relaxed text-slate-400", children: "我们坚持“不介入资金流转”原则，所有的信任链接都建立在您提供的真实影像与私域联系方式之上。" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 sm:grid-cols-3 lg:grid-cols-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-10 flex flex-col justify-center border-white/5 transition-all hover:bg-white/[0.03]", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2", children: "已上架商品" }),
            /* @__PURE__ */ jsxs("p", { className: "heading-serif text-4xl text-white", children: [
              publishedProducts.length,
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-lg", children: "Units" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-10 flex flex-col justify-center border-white/5 transition-all hover:bg-white/[0.03]", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2", children: "私域联络电话" }),
            /* @__PURE__ */ jsx("p", { className: "heading-serif text-3xl text-gold-500", children: contactForm.phone || "未填写" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-10 flex flex-col justify-center border-white/5 transition-all hover:bg-white/[0.03]", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2", children: "微信名片状态" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-gold-500" }),
              /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-white tracking-wide", children: "已绑定" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-10 xl:grid-cols-[0.68fr_0.32fr] animate-fade-in-up [animation-delay:400ms]", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
          /* @__PURE__ */ jsxs("form", { className: "glass-card p-10 lg:p-16", onSubmit: handlePublishSubmit, children: [
            /* @__PURE__ */ jsx(
              SectionHeader,
              {
                hint: "完善商品详情并上传实景影像素材，让每一份信任都真实可感。",
                icon: Store,
                title: "发布高原臻品"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2 mt-10", children: [
              /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx(
                LargeInput,
                {
                  name: "productName",
                  onChange: handlePublishChange,
                  placeholder: "商品名称，如：玉树有机牦牛肉",
                  value: publishForm.productName
                }
              ) }),
              /* @__PURE__ */ jsx(
                LargeInput,
                {
                  name: "specs",
                  onChange: handlePublishChange,
                  placeholder: "规格，如：500g / 盒",
                  value: publishForm.specs
                }
              ),
              /* @__PURE__ */ jsx(
                LargeInput,
                {
                  name: "price",
                  onChange: handlePublishChange,
                  placeholder: "建议零售价，如：¥168",
                  value: publishForm.price
                }
              ),
              /* @__PURE__ */ jsx(
                LargeInput,
                {
                  name: "stock",
                  onChange: handlePublishChange,
                  placeholder: "当前可用库存",
                  value: publishForm.stock
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-12 grid gap-10 xl:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsx(
                  UploadButton,
                  {
                    icon: Video,
                    label: videoFile ? "更新实景视频" : "上传实景视频",
                    onClick: () => {
                      var _a;
                      return (_a = document.getElementById("dashboard-video-upload")) == null ? void 0 : _a.click();
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    accept: "video/*",
                    className: "hidden",
                    id: "dashboard-video-upload",
                    onChange: (event) => {
                      var _a;
                      return setVideoFile(((_a = event.target.files) == null ? void 0 : _a[0]) ?? null);
                    },
                    type: "file"
                  }
                ),
                /* @__PURE__ */ jsx(
                  UploadButton,
                  {
                    icon: ImagePlus,
                    label: imageFiles.length ? `更新检疫/细节图 (${imageFiles.length})` : "上传检疫/细节图",
                    onClick: () => {
                      var _a;
                      return (_a = document.getElementById("dashboard-image-upload")) == null ? void 0 : _a.click();
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    accept: "image/*",
                    className: "hidden",
                    id: "dashboard-image-upload",
                    multiple: true,
                    onChange: (event) => setImageFiles(Array.from(event.target.files ?? [])),
                    type: "file"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-[2.5rem] border border-white/5 bg-black/40 p-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500", children: [
                    /* @__PURE__ */ jsx(Video, { className: "h-4 w-4 text-gold-500" }),
                    /* @__PURE__ */ jsx("span", { children: "实景影像预览" })
                  ] }),
                  videoPreview ? /* @__PURE__ */ jsx(
                    "video",
                    {
                      className: "h-64 w-full rounded-3xl object-cover shadow-premium",
                      controls: true,
                      src: videoPreview
                    }
                  ) : /* @__PURE__ */ jsxs("div", { className: "flex h-64 flex-col items-center justify-center rounded-3xl bg-white/[0.01] border border-dashed border-white/10 text-slate-700", children: [
                    /* @__PURE__ */ jsx(Upload, { className: "h-10 w-10 opacity-20" }),
                    /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs tracking-widest uppercase", children: "等待视频上传" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-[2.5rem] border border-white/5 bg-black/40 p-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500", children: [
                    /* @__PURE__ */ jsx(Camera, { className: "h-4 w-4 text-gold-500" }),
                    /* @__PURE__ */ jsx("span", { children: "细节图片预览" })
                  ] }),
                  imagePreviews.length ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3", children: imagePreviews.map((item) => /* @__PURE__ */ jsx(
                    "img",
                    {
                      alt: item.name,
                      className: "aspect-square rounded-2xl object-cover shadow-premium",
                      src: item.url
                    },
                    item.url
                  )) }) : /* @__PURE__ */ jsxs("div", { className: "flex h-40 flex-col items-center justify-center rounded-3xl bg-white/[0.01] border border-dashed border-white/10 text-slate-700", children: [
                    /* @__PURE__ */ jsx(ImagePlus, { className: "h-10 w-10 opacity-20" }),
                    /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs tracking-widest uppercase", children: "等待图片上传" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-12 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between border-t border-white/5 pt-10", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-full bg-gold-500/10 flex items-center justify-center mt-1", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-gold-500" }) }),
                /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-slate-500", children: submitMessage })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn-gold !py-5 !px-12 text-sm tracking-widest uppercase disabled:cursor-not-allowed disabled:opacity-60",
                  disabled: isPublishing,
                  type: "submit",
                  children: isPublishing ? "正在写入数据库" : "立即发布商品"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-10 lg:p-16", children: [
            /* @__PURE__ */ jsx(
              SectionHeader,
              {
                hint: "展示您的全部上架商品，可随时进行数字化下架操作。",
                icon: Package,
                title: "我的上架臻品"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-2 mt-10", children: publishedProducts.length ? publishedProducts.map((product) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 transition-all hover:bg-white/[0.03] hover:border-white/10",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "heading-serif text-2xl text-white group-hover:text-gold-400 transition-colors", children: product.name }),
                      /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs font-bold uppercase tracking-widest text-slate-500", children: product.specs })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "rounded-full bg-gold-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gold-500 border border-gold-500/20", children: product.status })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-4 grid-cols-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/5 bg-black/40 p-5", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1", children: "建议价" }),
                      /* @__PURE__ */ jsx("p", { className: "text-lg heading-serif text-white", children: product.price })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/5 bg-black/40 p-5 text-right", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1", children: "库存" }),
                      /* @__PURE__ */ jsx("p", { className: "text-lg heading-serif text-gold-500", children: product.stock })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      className: "mt-6 w-full py-4 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/20 flex items-center justify-center gap-3",
                      onClick: () => handleTakeDown(product.id),
                      children: [
                        /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                        "下架该商品"
                      ]
                    }
                  )
                ]
              },
              product.id
            )) : /* @__PURE__ */ jsx("div", { className: "col-span-2 py-20 text-center text-slate-700", children: "暂无已发布商品" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-10", children: /* @__PURE__ */ jsxs("div", { className: "glass-card p-10 lg:p-12 sticky top-40", children: [
          /* @__PURE__ */ jsx(
            SectionHeader,
            {
              hint: "维护您的联系方式，确保消费者能快速与您建立私域连接。",
              icon: Phone,
              title: "数字化名片"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "space-y-8 mt-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Phone, { className: "pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-500/40" }),
              /* @__PURE__ */ jsx(
                LargeInput,
                {
                  className: "pl-16",
                  name: "phone",
                  onChange: handleContactChange,
                  placeholder: "请输入手机号",
                  type: "tel",
                  value: contactForm.phone
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              UploadButton,
              {
                icon: QrCode,
                label: qrFile ? "更换微信二维码" : "上传微信二维码",
                onClick: () => {
                  var _a;
                  return (_a = document.getElementById("dashboard-qr-upload")) == null ? void 0 : _a.click();
                }
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                accept: "image/*",
                className: "hidden",
                id: "dashboard-qr-upload",
                onChange: (event) => {
                  var _a;
                  return handleQrUpload(((_a = event.target.files) == null ? void 0 : _a[0]) ?? null);
                },
                type: "file"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/5 bg-white/[0.01] p-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4", children: [
                /* @__PURE__ */ jsx(QrCode, { className: "h-4 w-4 text-gold-500" }),
                "二维码预览"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "aspect-square rounded-3xl border border-dashed border-white/10 bg-black/40 flex items-center justify-center overflow-hidden", children: qrPreview ? /* @__PURE__ */ jsx(
                "img",
                {
                  alt: "微信二维码预览",
                  className: "h-full w-full object-cover",
                  src: qrPreview
                }
              ) : /* @__PURE__ */ jsxs("div", { className: "text-center text-slate-800", children: [
                /* @__PURE__ */ jsx(QrCode, { className: "h-12 w-12 mx-auto mb-3 opacity-20" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest", children: "等待上传" })
              ] }) }),
              /* @__PURE__ */ jsx("p", { className: "mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 truncate", children: contactForm.wechatQrLabel })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn-gold w-full !py-5 text-sm tracking-widest uppercase disabled:cursor-not-allowed disabled:opacity-60",
                disabled: isSavingContact,
                onClick: () => void handleSaveContact(),
                type: "button",
                children: isSavingContact ? "正在保存名片" : "保存数字名片"
              }
            )
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
const highlights = [
  {
    icon: Leaf,
    title: "生态高原",
    description: "立足青海高寒牧场生态环境，强化绿色产地认知。"
  },
  {
    icon: ShieldCheck,
    title: "可信溯源",
    description: "以批次、证书和流程节点构建产品数字身份证。"
  },
  {
    icon: Store,
    title: "品牌展示",
    description: "服务散户、企业和消费者的展示与连接场景。"
  },
  {
    icon: Waves,
    title: "轻量接入",
    description: "兼顾弱网环境与多终端浏览体验，降低推广门槛。"
  }
];
function HomePage() {
  return /* @__PURE__ */ jsxs("div", { className: "relative isolate min-h-screen overflow-x-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 -z-30 overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105",
          style: { backgroundImage: "url('/hero-plateau.jpg')" }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#080d0b]" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "plateau-grid-bg" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh top-[-10%] left-[-10%] w-[500px] h-[500px] bg-plateau-900/20" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold-900/10" }),
    /* @__PURE__ */ jsx("section", { className: "container-shell relative pt-32 pb-20 lg:pt-56 lg:pb-40", children: /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-5 py-2 lg:px-6 lg:py-2.5 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md", children: [
        /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" }),
          /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-gold-500" })
        ] }),
        "挑战杯 · 数字化农牧创新平台"
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "section-title mt-8 lg:mt-12 max-w-5xl leading-[1.1] lg:leading-[1.05] animate-fade-in-up [text-shadow:0_4px_24px_rgba(0,0,0,0.5)] text-4xl sm:text-5xl lg:text-7xl", children: [
        /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "让每一份高原馈赠" }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { className: "text-gradient-gold", children: "皆可溯源，皆有回响" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-8 lg:mt-10 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg lg:text-xl animate-fade-in-up [animation-delay:200ms] [text-shadow:0_2px_10px_rgba(0,0,0,0.3)]", children: [
        "“高原科技牧场”深度融合",
        /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: "数字指纹" }),
        "与",
        /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: "实景溯源" }),
        "， 为青海优质农牧产品建立独一无二的数字档案，打破信息鸿沟，链接纯净原产地与现代消费。"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 lg:mt-16 flex flex-col sm:flex-row justify-center gap-4 lg:gap-6 animate-fade-in-up [animation-delay:400ms] w-full sm:w-auto px-6 sm:px-0", children: [
        /* @__PURE__ */ jsx(Link, { className: "btn-gold group w-full sm:w-auto", to: "/traceability", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center", children: [
          "开启溯源之旅",
          /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" })
        ] }) }),
        /* @__PURE__ */ jsx(Link, { className: "btn-outline group w-full sm:w-auto", to: "/auth", children: /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center", children: "登录后申请发布者" }) }),
        /* @__PURE__ */ jsx(Link, { className: "btn-outline group w-full sm:w-auto", to: "/showcase", children: /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center", children: "浏览数字牧场" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "container-shell py-20 lg:py-32", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-12 lg:mb-20 text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "heading-serif text-3xl text-white lg:text-5xl", children: "核心技术与核心价值" }),
        /* @__PURE__ */ jsx("div", { className: "mx-auto mt-4 h-1 w-20 lg:w-24 rounded-full bg-gradient-to-r from-transparent via-gold-500 to-transparent" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-4", children: highlights.map(({ icon: Icon, title, description }, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "glass-card group p-8 lg:p-10 animate-fade-in-up",
          style: { animationDelay: `${index * 150 + 600}ms` },
          children: [
            /* @__PURE__ */ jsx("div", { className: "mb-6 lg:mb-8 flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl lg:rounded-3xl bg-white/[0.03] text-gold-500 border border-white/[0.05] transition-all duration-500 group-hover:scale-110 group-hover:bg-gold-500/10 group-hover:border-gold-500/20", children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 lg:h-8 lg:w-8" }) }),
            /* @__PURE__ */ jsx("h3", { className: "heading-serif text-xl lg:text-2xl text-white mb-3 lg:mb-4 group-hover:text-gold-400 transition-colors", children: title }),
            /* @__PURE__ */ jsx("p", { className: "text-xs lg:text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors", children: description })
          ]
        },
        title
      )) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container-shell pb-32 lg:pb-40", children: /* @__PURE__ */ jsxs("div", { className: "glass-card relative overflow-hidden p-8 lg:p-24", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-plateau-mesh opacity-40" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 grid gap-12 lg:gap-16 lg:grid-cols-2 lg:items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "heading-serif text-3xl text-white sm:text-4xl lg:text-6xl mb-6 lg:mb-8", children: [
            "构建产销一体的",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("span", { className: "text-gradient-gold", children: "数字信任闭环" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-lg lg:text-xl text-slate-400 leading-relaxed mb-8 lg:mb-10", children: "通过去中心化的身份标识与实时影像存证，我们确保每一个产品节点都真实可感，让信任成为高原品牌的核心竞争力。" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-8 lg:gap-12", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-4xl lg:text-5xl heading-serif text-gold-500", children: "85%" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-[10px] lg:text-sm uppercase tracking-widest text-slate-500", children: "信任提升" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-4xl lg:text-5xl heading-serif text-gold-500", children: "120+" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-[10px] lg:text-sm uppercase tracking-widest text-slate-500", children: "合伙农牧" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "relative mt-8 lg:mt-0", children: /* @__PURE__ */ jsxs("div", { className: "aspect-video lg:aspect-square rounded-[2rem] lg:rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-2 overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "h-full w-full rounded-[1.8rem] lg:rounded-[2.5rem] bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-60 mix-blend-overlay" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-16 w-16 lg:h-24 lg:w-24 rounded-full bg-gold-500/20 border border-gold-500/50 backdrop-blur-xl flex items-center justify-center animate-pulse", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-8 w-8 lg:h-10 lg:w-10 text-gold-500" }) }) })
        ] }) })
      ] })
    ] }) })
  ] });
}
const partners = [
  {
    id: "yushu-ecological-ranch",
    type: "农户",
    name: "玉树巴塘生态牧场",
    region: "青海玉树州",
    level: "大学生严选",
    creditScore: 96,
    description: "以牦牛自然散养为核心，接入平台后已完成耳标建档、日常巡检和礼盒批次溯源展示，适合作为源头直供型伙伴主页模板。",
    tags: ["牦牛养殖", "源头直供", "草场散养"],
    contact: {
      manager: "联络员 才仁卓玛",
      phone: "189-9702-1168"
    },
    stats: {
      records: 18,
      activeProducts: 6,
      fulfillmentRate: "98%"
    },
    traceRecords: [
      {
        code: "QH-YS-YK-001",
        product: "牦牛雪花肉",
        date: "2026-03-14",
        status: "已完成包装"
      },
      {
        code: "QH-YS-YK-002",
        product: "高原牦牛礼盒",
        date: "2026-02-27",
        status: "检疫归档"
      },
      {
        code: "QH-YS-YK-003",
        product: "牦牛排酸肉",
        date: "2026-01-30",
        status: "养殖档案齐全"
      }
    ]
  },
  {
    id: "guoluo-sheep-coop",
    type: "农户",
    name: "果洛藏羊联营合作社",
    region: "青海果洛州",
    level: "大学生严选",
    creditScore: 92,
    description: "聚焦藏羊精品分割与社区团购供应，强调牧户联营、统一检疫和稳定履约能力，适合作为合作社型主页模板。",
    tags: ["藏羊分割", "合作社联营", "冷链发运"],
    contact: {
      manager: "合作社对接 仁青才让",
      phone: "177-9708-2206"
    },
    stats: {
      records: 24,
      activeProducts: 4,
      fulfillmentRate: "95%"
    },
    traceRecords: [
      {
        code: "QH-GL-ZY-016",
        product: "藏羊精品分割装",
        date: "2026-04-05",
        status: "待渠道发运"
      },
      {
        code: "QH-GL-ZY-012",
        product: "藏羊礼赠盒",
        date: "2026-03-11",
        status: "批次已归档"
      },
      {
        code: "QH-GL-ZY-009",
        product: "藏羊鲜切块",
        date: "2026-01-18",
        status: "源头巡检完成"
      }
    ]
  },
  {
    id: "haidong-processing-center",
    type: "企业",
    name: "海东高原牧业加工中心",
    region: "青海海东市",
    level: "官方企业合作",
    creditScore: 99,
    description: "承担标准化加工、真空包装和批次编码任务，具备企业资质展示、产能说明和合作品牌背书等企业主页表达场景。",
    tags: ["官方合作", "标准加工", "品牌联营"],
    contact: {
      manager: "企业招商主管 韩涛",
      phone: "0972-881-3098"
    },
    stats: {
      records: 43,
      activeProducts: 12,
      fulfillmentRate: "99%"
    },
    traceRecords: [
      {
        code: "QH-HD-QY-101",
        product: "牦牛礼盒加工批次",
        date: "2026-04-09",
        status: "加工完成"
      },
      {
        code: "QH-HD-QY-084",
        product: "藏羊真空包装批次",
        date: "2026-03-21",
        status: "复检通过"
      },
      {
        code: "QH-HD-QY-063",
        product: "青稞联名礼装",
        date: "2026-02-10",
        status: "展示上架"
      }
    ]
  }
];
function getLevelStyle(level) {
  if (level === "官方企业合作") {
    return "bg-sky-500/15 text-sky-200 border border-sky-300/20";
  }
  return "bg-plateau-500/15 text-plateau-100 border border-plateau-300/20";
}
function getScoreStyle(score) {
  if (score >= 95) {
    return "text-emerald-300";
  }
  if (score >= 90) {
    return "text-sky-300";
  }
  return "text-amber-300";
}
function PartnerStat({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: label }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold text-white", children: value })
  ] });
}
function PartnersPage() {
  const [activeType, setActiveType] = useState("全部");
  const [selectedId, setSelectedId] = useState(partners[0].id);
  const visiblePartners = useMemo(() => {
    if (activeType === "全部") {
      return partners;
    }
    return partners.filter((partner) => partner.type === activeType);
  }, [activeType]);
  const selectedPartner = useMemo(() => {
    const inCurrentList = visiblePartners.find((partner) => partner.id === selectedId);
    return inCurrentList ?? visiblePartners[0] ?? partners[0];
  }, [selectedId, visiblePartners]);
  return /* @__PURE__ */ jsx("div", { className: "animate-fade-in", children: /* @__PURE__ */ jsxs("section", { className: "container-shell py-12 sm:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-12 max-w-4xl animate-fade-in-up", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-sky-200", children: "Partner System" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-3 text-4xl font-extrabold text-white sm:text-5xl", children: "合作伙伴管理系统" }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg leading-relaxed text-slate-300", children: "为每一个扎根高原的农户或企业生成独立的线上主页。 我们统一展示合作等级、信用积分、历史溯源记录和合作概况，构建透明可信的供应链体系。" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] animate-fade-in-up delay-100", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass-card overflow-hidden p-8 sm:p-12 relative", children: [
        /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" }),
        /* @__PURE__ */ jsxs("div", { className: "relative rounded-[2.5rem] border border-sky-300/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(61,168,117,0.12),rgba(15,23,32,0.4))] p-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200", children: "青海蓝 + 生态绿" }),
            /* @__PURE__ */ jsx("span", { className: "rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300", children: "伙伴独立主页模板" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-8 text-3xl font-bold text-white", children: "统一管理农户与企业合作档案" }),
          /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-2xl text-base leading-relaxed text-slate-300", children: "支持平台运营方快速为合作农户、合作社和企业伙伴建立线上主页，持续沉淀信用表现、 履约能力与历史溯源记录，用于品牌背书、渠道合作和平台准入管理。" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 sm:grid-cols-3 lg:grid-cols-1", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-scale-in", style: { animationDelay: "200ms" }, children: /* @__PURE__ */ jsx(PartnerStat, { label: "模板覆盖伙伴", value: `${partners.length} 家` }) }),
        /* @__PURE__ */ jsx("div", { className: "animate-scale-in", style: { animationDelay: "300ms" }, children: /* @__PURE__ */ jsx(PartnerStat, { label: "最高信用积分", value: "99 分" }) }),
        /* @__PURE__ */ jsx("div", { className: "animate-scale-in", style: { animationDelay: "400ms" }, children: /* @__PURE__ */ jsx(PartnerStat, { label: "累计溯源记录", value: "85 条+" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 xl:grid-cols-[0.32fr_0.68fr] animate-fade-in-up delay-200", children: [
      /* @__PURE__ */ jsxs("aside", { className: "glass-card p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white", children: "筛选伙伴" }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: ["全部", "农户", "企业"].map((type) => /* @__PURE__ */ jsx(
            "button",
            {
              className: [
                "rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                activeType === type ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20"
              ].join(" "),
              onClick: () => setActiveType(type),
              type: "button",
              children: type
            },
            type
          )) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: visiblePartners.map((partner, index) => /* @__PURE__ */ jsxs(
          "button",
          {
            className: [
              "w-full rounded-2xl border p-5 text-left transition-all duration-300 group",
              selectedId === partner.id ? "border-sky-300/40 bg-sky-500/10" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            ].join(" "),
            onClick: () => setSelectedId(partner.id),
            type: "button",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold text-white group-hover:text-sky-300 transition-colors", children: partner.name }),
                /* @__PURE__ */ jsx("span", { className: "rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-slate-200", children: partner.type })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-slate-500", children: partner.region })
            ]
          },
          partner.id
        )) })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "animate-fade-in", children: selectedPartner ? /* @__PURE__ */ jsxs("div", { className: "glass-card overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative h-48 sm:h-64 overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-sky-900/40 to-emerald-900/40" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-plateau-grid opacity-20" }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-8 left-8 right-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/10", children: selectedPartner.region }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: [
                      "rounded-full px-4 py-1.5 text-xs font-bold backdrop-blur-md",
                      getLevelStyle(selectedPartner.level)
                    ].join(" "),
                    children: selectedPartner.level
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-4 text-3xl font-bold text-white sm:text-4xl", children: selectedPartner.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-md", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-sky-200 uppercase tracking-widest", children: "信用积分" }),
              /* @__PURE__ */ jsx(
                "p",
                {
                  className: [
                    "mt-1 text-3xl font-black leading-none",
                    getScoreStyle(selectedPartner.creditScore)
                  ].join(" "),
                  children: selectedPartner.creditScore
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-8 sm:p-12", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-12 lg:grid-cols-[1.3fr_0.7fr]", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h4", { className: "flex items-center gap-3 text-xl font-bold text-white", children: [
              /* @__PURE__ */ jsx(Leaf, { className: "h-5 w-5 text-plateau-400" }),
              "伙伴主页简介"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg leading-relaxed text-slate-300", children: selectedPartner.description }),
            /* @__PURE__ */ jsxs("div", { className: "mt-12 grid gap-6 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-slate-400", children: [
                  /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "联系人 / 负责人" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-4 text-xl font-bold text-white", children: selectedPartner.contact.manager }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: selectedPartner.contact.phone })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-slate-400", children: [
                  /* @__PURE__ */ jsx(Star, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "履约状态" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "mt-4 text-xl font-bold text-white", children: [
                  selectedPartner.stats.fulfillmentRate,
                  "% 达成"
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: "历史合作周期：3年+" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h4", { className: "flex items-center gap-3 text-xl font-bold text-white", children: [
              /* @__PURE__ */ jsx(ClipboardList, { className: "h-5 w-5 text-sky-400" }),
              "历史溯源档案"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-8 space-y-4", children: selectedPartner.traceRecords.map((record) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-bold text-white group-hover:text-sky-300 transition-colors", children: record.product }),
                    /* @__PURE__ */ jsx("span", { className: "rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-300", children: record.status })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between text-xs text-slate-500", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      "编号：",
                      record.code
                    ] }),
                    /* @__PURE__ */ jsx("span", { children: record.date })
                  ] })
                ]
              },
              record.code
            )) })
          ] })
        ] }) })
      ] }, selectedPartner.id) : /* @__PURE__ */ jsxs("div", { className: "glass-card flex h-96 flex-col items-center justify-center p-8 text-slate-500", children: [
        /* @__PURE__ */ jsx(Medal, { className: "h-16 w-16 opacity-20" }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg", children: "请在左侧选择一个合作伙伴查看主页" })
      ] }) })
    ] })
  ] }) });
}
function createProductImage(title, subtitle, colors) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <circle cx="960" cy="160" r="170" fill="rgba(255,255,255,0.14)" />
      <circle cx="220" cy="700" r="230" fill="rgba(255,255,255,0.08)" />
      <text x="80" y="180" fill="#ffffff" font-size="64" font-family="Arial, sans-serif" font-weight="700">${title}</text>
      <text x="80" y="260" fill="rgba(255,255,255,0.84)" font-size="34" font-family="Arial, sans-serif">${subtitle}</text>
      <rect x="80" y="350" width="1040" height="340" rx="30" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.16)" />
      <text x="120" y="450" fill="#ffffff" font-size="42" font-family="Arial, sans-serif">高原科技牧场 · 农场商城展示图</text>
      <text x="120" y="525" fill="rgba(255,255,255,0.84)" font-size="28" font-family="Arial, sans-serif">展示详情页不设购物车，统一联系牧民 / 主理人</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
const products = [
  {
    id: "yak-ribeye",
    category: "牦牛肉",
    name: "高原牦牛雪花肉",
    originLabel: "玉树直供",
    description: "选自高海拔散养牦牛，适合家庭烹饪、餐饮采购与节庆礼赠。",
    story: "该产品来自玉树高海拔天然牧场，采用散养方式，接入统一溯源、检疫和冷链交付流程，兼顾高端零售与渠道礼赠展示。",
    specs: "500g / 盒",
    traceCode: "QH-SC-YK-001",
    image: createProductImage("牦牛雪花肉", "玉树直供 · 高海拔散养", ["#14532d", "#1e3a8a"]),
    features: ["高原散养", "检疫可追溯", "支持礼盒定制"],
    prices: {
      retail: "¥168 / 盒",
      wholesale: "¥138 / 盒（20盒起）",
      gift: "¥398 / 礼盒"
    },
    contact: {
      owner: "私域主理人 卓玛",
      phone: "189-9701-2234",
      wechat: "gaoyuan-zhuoma"
    }
  },
  {
    id: "tibetan-lamb",
    category: "藏羊",
    name: "藏羊精品分割装",
    originLabel: "果洛牧场",
    description: "草场自然放牧，适配社区团购、批量团餐与品牌联名礼盒。",
    story: "产品源于果洛高寒草场，强调天然放牧和统一检疫，适合团餐、渠道分销和区域品牌联名合作。",
    specs: "1kg / 袋",
    traceCode: "QH-SC-ZY-016",
    image: createProductImage("藏羊分割装", "果洛牧场 · 天然放牧", ["#2d855c", "#475569"]),
    features: ["天然放牧", "团购友好", "冷链发运"],
    prices: {
      retail: "¥128 / 袋",
      wholesale: "¥108 / 袋（30袋起）",
      gift: "¥328 / 礼盒"
    },
    contact: {
      owner: "牧场联络员 仁青",
      phone: "177-9708-6612",
      wechat: "guoluo-lamb"
    }
  },
  {
    id: "highland-barley",
    category: "青稞",
    name: "青稞营养礼装",
    originLabel: "海北原产",
    description: "适合文旅伴手礼、企业福利及高原农特产组合展示。",
    story: "青稞礼装突出海北原产地故事和联名文旅属性，适合企业福利、伴手礼和区域特色组合展示。",
    specs: "750g / 盒",
    traceCode: "QH-SC-QK-032",
    image: createProductImage("青稞礼装", "海北原产 · 农文旅联名", ["#b45309", "#365314"]),
    features: ["海北原产", "礼赠属性强", "适合联名展示"],
    prices: {
      retail: "¥69 / 盒",
      wholesale: "¥52 / 盒（50盒起）",
      gift: "¥168 / 礼盒"
    },
    contact: {
      owner: "渠道主理人 南杰",
      phone: "181-0971-3386",
      wechat: "qingke-shop"
    }
  },
  {
    id: "goji-berry",
    category: "枸杞",
    name: "高原枸杞臻选装",
    originLabel: "柴达木优选",
    description: "面向健康零售、企业定制和私域社群复购场景。",
    story: "柴达木产区枸杞突出健康属性和复购潜力，适合社群私域转化、企业定制和养生伴手礼场景。",
    specs: "250g / 罐",
    traceCode: "QH-SC-GQ-021",
    image: createProductImage("高原枸杞", "柴达木优选 · 健康滋补", ["#b91c1c", "#7c2d12"]),
    features: ["柴达木优选", "健康滋补", "适合私域复购"],
    prices: {
      retail: "¥88 / 罐",
      wholesale: "¥72 / 罐（40罐起）",
      gift: "¥218 / 礼盒"
    },
    contact: {
      owner: "私域运营 央金",
      phone: "186-9720-5418",
      wechat: "chai-goji"
    }
  }
];
function getProductById(productId) {
  return products.find((product) => product.id === productId) ?? null;
}
function ProductDetailPage() {
  const { productId } = useParams();
  const [showContact, setShowContact] = useState(false);
  const product = useMemo(() => getProductById(productId), [productId]);
  if (!product) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/showcase", replace: true });
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative isolate min-h-screen pb-40 animate-fade-in", children: [
    /* @__PURE__ */ jsx("div", { className: "plateau-grid-bg" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh top-[10%] left-[-5%] w-[400px] h-[400px] bg-plateau-900/30" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh bottom-[15%] right-[-5%] w-[500px] h-[500px] bg-gold-900/10" }),
    /* @__PURE__ */ jsxs("section", { className: "container-shell pt-32 lg:pt-48", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          className: "inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:text-gold-500",
          to: "/showcase",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "返回商城列表"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-16 grid gap-16 lg:grid-cols-[1.1fr_0.9fr]", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-12 animate-fade-in-up", children: [
          /* @__PURE__ */ jsx("div", { className: "glass-card overflow-hidden !rounded-[3rem]", children: /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/3] w-full", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                alt: product.name,
                className: "h-full w-full object-cover transition-transform duration-1000",
                src: product.image
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute left-10 top-10", children: /* @__PURE__ */ jsx("span", { className: "rounded-full bg-black/60 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gold-500 backdrop-blur-md border border-white/10", children: product.origin }) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-3", children: product.features.map((feature, i) => /* @__PURE__ */ jsxs("div", { className: "glass-card bg-white/[0.01] p-8 text-center border-white/5 transition-all hover:bg-white/[0.03]", children: [
            /* @__PURE__ */ jsx(BadgeCheck, { className: "mx-auto h-8 w-8 text-gold-500 mb-4" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-white tracking-wide", children: feature })
          ] }, i)) }),
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-12", children: [
            /* @__PURE__ */ jsxs("h3", { className: "heading-serif flex items-center gap-4 text-2xl text-white mb-8", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "h-8 w-8 text-gold-500" }),
              "产品溯源物语"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xl leading-relaxed text-slate-400 font-light", children: product.story }),
            /* @__PURE__ */ jsxs("div", { className: "mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-t border-white/5 pt-10", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gold-500 shadow-gold-glow", children: /* @__PURE__ */ jsx(Store, { className: "h-7 w-7" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1", children: "唯一数字化指纹" }),
                  /* @__PURE__ */ jsx("p", { className: "font-mono text-base text-white font-bold tracking-wider", children: product.traceCode })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                Link,
                {
                  className: "btn-outline !py-4 !px-8 text-xs font-bold",
                  to: "/traceability",
                  children: "查看完整档案"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "animate-fade-in-up [animation-delay:200ms]", children: /* @__PURE__ */ jsxs("div", { className: "glass-card sticky top-40 p-12 lg:p-16", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-[0.3em] text-gold-500/60 mb-4 block", children: product.category }),
          /* @__PURE__ */ jsx("h1", { className: "heading-serif text-5xl text-white lg:text-6xl", children: product.name }),
          /* @__PURE__ */ jsxs("div", { className: "mt-12 space-y-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-[2rem] bg-white/[0.01] p-10 border border-white/5 transition-all hover:bg-white/[0.03]", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-slate-500 uppercase tracking-widest", children: "零售建议价" }),
              /* @__PURE__ */ jsx("span", { className: "heading-serif text-4xl text-white", children: product.prices.retail })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-6 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] border border-white/5 bg-white/[0.01] p-10 transition-all hover:bg-white/[0.03]", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3", children: "大宗批发价" }),
                /* @__PURE__ */ jsx("p", { className: "heading-serif text-3xl text-gold-500", children: product.prices.wholesale })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] border border-white/5 bg-white/[0.01] p-10 transition-all hover:bg-white/[0.03]", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3", children: "礼盒定制价" }),
                /* @__PURE__ */ jsx("p", { className: "heading-serif text-3xl text-slate-300", children: product.prices.gift })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-12 rounded-[2rem] border border-gold-500/10 bg-gold-500/[0.02] p-8 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-5", children: [
            /* @__PURE__ */ jsx(MessageCircleMore, { className: "mt-1 h-6 w-6 text-gold-500" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm leading-relaxed text-slate-400", children: [
              "本平台旨在连接源头与消费，",
              /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "不介入任何资金流转" }),
              "。 如需购买或深度定制，请直接与牧民主理人进行私域沟通。"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn-gold mt-12 w-full !py-6 text-lg tracking-widest uppercase",
              onClick: () => setShowContact(true),
              type: "button",
              children: "联系主理人"
            }
          )
        ] }) })
      ] })
    ] }),
    showContact && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60 animate-in fade-in duration-300",
        onClick: () => setShowContact(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "glass-card max-w-xl w-full p-8 lg:p-16 relative animate-in slide-in-from-bottom-8 duration-500",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "absolute top-6 right-6 h-10 w-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-slate-500 transition-all hover:bg-white/10 hover:text-white active:scale-90",
                  onClick: () => setShowContact(false),
                  children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
                }
              ),
              /* @__PURE__ */ jsx("h3", { className: "heading-serif text-3xl lg:text-4xl text-white mb-4 lg:mb-6", children: "建立信任连接" }),
              /* @__PURE__ */ jsxs("p", { className: "text-base lg:text-lg text-slate-400 leading-relaxed mb-8 lg:mb-12 font-light", children: [
                "请通过以下方式联系主理人 ",
                /* @__PURE__ */ jsx("span", { className: "text-gold-500 font-bold", children: product.contact.owner }),
                "， 咨询产品详情、原产地实况及采购事宜。"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-6 lg:space-y-10", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-6 lg:gap-8 p-6 lg:p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/10 transition-all hover:bg-white/[0.03] group", children: [
                  /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-32 w-32 lg:h-48 lg:w-48 items-center justify-center rounded-[2rem] border border-dashed border-gold-500/20 bg-gold-500/5 transition-transform duration-500 group-hover:scale-105", children: /* @__PURE__ */ jsx(QrCode, { className: "h-12 w-12 lg:h-16 lg:w-16 text-gold-500 opacity-60" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 lg:mb-2", children: "微信私域连接" }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xl lg:text-2xl font-bold text-white", children: [
                      "ID: ",
                      product.contact.wechat
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-6 lg:p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/10 flex items-center justify-between transition-all hover:bg-white/[0.03] group cursor-pointer active:scale-[0.98]", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 lg:mb-2", children: "服务电话" }),
                    /* @__PURE__ */ jsx("p", { className: "heading-serif text-2xl lg:text-3xl text-white group-hover:text-gold-400 transition-colors", children: product.contact.phone })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-gold-500 text-slate-950 flex items-center justify-center shadow-gold-glow transition-transform duration-500 group-hover:rotate-12 group-active:scale-90", children: /* @__PURE__ */ jsx(Phone, { className: "h-6 w-6 lg:h-8 lg:w-8" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "mt-12 w-full py-5 rounded-full border border-white/10 font-bold text-slate-500 transition-all hover:bg-white/5 hover:text-white uppercase tracking-widest text-xs active:scale-95",
                  onClick: () => setShowContact(false),
                  children: "返回产品详情"
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
const categories = ["全部", "优质肉禽", "高原粮油", "特色滋补", "非遗文创"];
function ShowcasePage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === "全部" || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase()) || product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);
  return /* @__PURE__ */ jsxs("div", { className: "relative isolate min-h-screen pb-40 overflow-x-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "plateau-grid-bg" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh top-[10%] right-[-5%] w-[400px] h-[400px] bg-plateau-900/30" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh bottom-[20%] left-[-5%] w-[500px] h-[500px] bg-gold-900/10" }),
    /* @__PURE__ */ jsxs("section", { className: "container-shell pt-32 lg:pt-48", children: [
      /* @__PURE__ */ jsxs("div", { className: "animate-fade-in-up max-w-4xl", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md", children: "Product Showcase" }),
        /* @__PURE__ */ jsxs("h1", { className: "section-title mt-10", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "高原瑰宝" }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-gradient-gold", children: "数字牧场精品展厅" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-8 text-xl leading-relaxed text-slate-400 max-w-2xl", children: [
          "严选青海高寒牧场核心产区，每一份馈赠皆可追溯至山野原点。 坚持",
          /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: "源头直供" }),
          "，透明定价，重塑农牧品牌价值。"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-20 space-y-8 animate-fade-in-up [animation-delay:200ms]", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative max-w-2xl", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute left-6 top-1/2 -translate-y-1/2 text-gold-500/50", children: /* @__PURE__ */ jsx(Search, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "搜索产品名称、分类或描述...",
              className: "w-full rounded-full border border-white/10 bg-black/40 py-5 pl-14 pr-14 text-white outline-none transition-all focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5 placeholder:text-slate-600",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value)
            }
          ),
          searchQuery && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSearchQuery(""),
              className: "absolute right-6 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-white",
              children: /* @__PURE__ */ jsx(X$1, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-4", children: categories.map((category) => /* @__PURE__ */ jsx(
          "button",
          {
            className: [
              "rounded-full px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-500 active:scale-95",
              activeCategory === category ? "bg-gold-500 text-slate-950 shadow-gold-glow" : "border border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5 hover:text-white"
            ].join(" "),
            onClick: () => setActiveCategory(category),
            type: "button",
            children: category
          },
          category
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 lg:mt-16 grid gap-6 lg:gap-10 md:grid-cols-2", children: visibleProducts.length > 0 ? visibleProducts.map((product, index) => /* @__PURE__ */ jsx(
        Link,
        {
          className: "glass-card group animate-fade-in-up active:scale-[0.98] active:brightness-90 transition-all duration-300",
          style: { animationDelay: `${index * 150 + 400}ms` },
          to: `/showcase/${product.id}`,
          children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full lg:flex-row pointer-events-none", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative aspect-video lg:aspect-auto lg:w-2/5 overflow-hidden", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  alt: product.name,
                  className: "h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110",
                  src: product.image
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute left-4 top-4 lg:left-6 lg:top-6", children: /* @__PURE__ */ jsx("span", { className: "rounded-full bg-black/60 px-3 py-1.5 lg:px-4 lg:py-2 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-gold-500 backdrop-blur-md border border-white/10", children: product.originLabel }) }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6", children: /* @__PURE__ */ jsxs("div", { className: "text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2", children: [
                "探索详情 ",
                /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-6 lg:p-10", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500/60 mb-1 lg:mb-2 block", children: product.category }),
                  /* @__PURE__ */ jsx("h3", { className: "heading-serif text-2xl lg:text-3xl text-white group-hover:text-gold-400 transition-colors", children: product.name })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-slate-950 transition-all", children: /* @__PURE__ */ jsx(BadgeCheck, { className: "h-4 w-4 lg:h-5 lg:w-5" }) })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-4 lg:mt-6 flex-1 text-xs lg:text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors", children: product.description }),
              /* @__PURE__ */ jsxs("div", { className: "mt-8 lg:mt-10 grid grid-cols-3 gap-3 lg:gap-4 border-t border-white/5 pt-6 lg:pt-8", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500", children: "零售建议" }),
                  /* @__PURE__ */ jsx("p", { className: "text-base lg:text-lg heading-serif text-white", children: product.prices.retail })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500", children: "大宗批发" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base font-bold text-gold-500", children: product.prices.wholesale })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500", children: "礼盒定制" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base font-bold text-slate-300", children: product.prices.gift })
                ] })
              ] })
            ] })
          ] })
        },
        product.id
      )) : /* @__PURE__ */ jsxs("div", { className: "col-span-full py-32 text-center animate-fade-in", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.02] border border-white/5 text-slate-800 shadow-premium mb-8", children: /* @__PURE__ */ jsx(Search, { className: "h-12 w-12" }) }),
        /* @__PURE__ */ jsx("h3", { className: "heading-serif text-3xl text-white", children: "未找到相关产品" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-slate-500 max-w-md mx-auto leading-relaxed", children: "尝试更换搜索词或选择其他分类，寻找您心仪的高原瑰宝。" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setSearchQuery("");
              setActiveCategory("全部");
            },
            className: "mt-10 text-xs font-bold uppercase tracking-[0.2em] text-gold-500/60 transition-all hover:text-gold-500 hover:tracking-[0.3em]",
            children: "重置所有筛选"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container-shell mt-40", children: /* @__PURE__ */ jsxs("div", { className: "glass-card relative overflow-hidden p-12 lg:p-24 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-plateau-mesh opacity-30" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-4xl mx-auto", children: [
        /* @__PURE__ */ jsx("h2", { className: "heading-serif text-3xl text-white sm:text-5xl mb-8", children: "“不介入资金流转，只链接信任与价值”" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl text-slate-400 leading-relaxed mb-12", children: [
          "我们严格遵守合规要求，所有交易均由消费者与牧民直接对接完成。 平台通过",
          /* @__PURE__ */ jsx("span", { className: "text-gold-500 font-bold", children: "数字存证" }),
          "与",
          /* @__PURE__ */ jsx("span", { className: "text-gold-500 font-bold", children: "实地审核" }),
          "，为每一次链接提供真实性背书。"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-center gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-slate-300", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "h-6 w-6 text-gold-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold tracking-widest uppercase", children: "实地资质核验" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-slate-300", children: [
            /* @__PURE__ */ jsx(QrCode, { className: "h-6 w-6 text-gold-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold tracking-widest uppercase", children: "一物一码溯源" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-slate-300", children: [
            /* @__PURE__ */ jsx(Store, { className: "h-6 w-6 text-gold-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold tracking-widest uppercase", children: "源头直供保障" })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
function LazyImage({ src, alt, className = "" }) {
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) {
      return void 0;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: wrapperRef,
      className: `relative overflow-hidden rounded-3xl bg-slate-900 ${className}`,
      children: [
        !loaded && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-slate-900/90 text-slate-400", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsx(ImageIcon, { className: "h-8 w-8" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "图片按需加载中" })
        ] }) }),
        visible && /* @__PURE__ */ jsx(
          "img",
          {
            alt,
            className: "h-full w-full object-cover",
            loading: "lazy",
            onLoad: () => setLoaded(true),
            src
          }
        )
      ]
    }
  );
}
function getMarkerPosition({ lng, lat }) {
  const left = (lng - 73) / (135 - 73) * 100;
  const top = 100 - (lat - 18) / (54 - 18) * 100;
  return {
    left: `${Math.min(Math.max(left, 15), 85)}%`,
    top: `${Math.min(Math.max(top, 18), 82)}%`
  };
}
function TraceMapCard({ origin, coordinates }) {
  const marker = getMarkerPosition(coordinates);
  return /* @__PURE__ */ jsxs("div", { className: "glass-card h-full p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-plateau-500/15 p-3 text-plateau-300", children: /* @__PURE__ */ jsx(MapPinned, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "地理坐标" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "轻量地图组件示意牧场位置" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative mb-5 h-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-plateau-grid bg-[size:26px_26px] opacity-50" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(96,165,250,0.18),transparent_25%),radial-gradient(circle_at_70%_70%,rgba(61,168,117,0.22),transparent_30%)]" }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400 shadow-[0_0_0_8px_rgba(251,113,133,0.15)]",
          style: marker,
          children: /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-rose-300/50" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "坐标定位" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-base font-medium text-white", children: origin })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "经度" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold text-white", children: coordinates.lng })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "纬度" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold text-white", children: coordinates.lat })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-2 text-sm text-plateau-200", children: [
      /* @__PURE__ */ jsx(Navigation, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { children: "后续可接入腾讯地图或高德地图 SDK 做实时地理可视化。" })
    ] })
  ] });
}
function TraceTimeline({ items }) {
  return /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-plateau-500/15 p-3 text-plateau-300", children: /* @__PURE__ */ jsx(Clock3, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "全流程时间轴" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "从源头养殖到加工包装的关键节点一目了然" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-6", children: items.map((item, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative pl-8 sm:pl-12",
        children: [
          index !== items.length - 1 && /* @__PURE__ */ jsx("div", { className: "absolute left-3 top-8 h-full w-px bg-gradient-to-b from-plateau-400 to-transparent sm:left-4" }),
          /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-plateau-300/40 bg-plateau-500 text-xs font-semibold text-white sm:h-8 sm:w-8", children: index + 1 }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-lg font-semibold text-white", children: item.stage }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-plateau-200", children: item.date })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-slate-300", children: item.description })
          ] })
        ]
      },
      `${item.stage}-${item.date}`
    )) })
  ] });
}
function createSvgDataUri(title, subtitle, colors) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <circle cx="940" cy="180" r="180" fill="rgba(255,255,255,0.12)" />
      <circle cx="230" cy="700" r="220" fill="rgba(255,255,255,0.08)" />
      <text x="80" y="180" fill="#ffffff" font-size="62" font-family="Arial, sans-serif" font-weight="700">${title}</text>
      <text x="80" y="260" fill="rgba(255,255,255,0.84)" font-size="34" font-family="Arial, sans-serif">${subtitle}</text>
      <rect x="80" y="350" width="1040" height="340" rx="30" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.15)" />
      <text x="120" y="440" fill="#ffffff" font-size="44" font-family="Arial, sans-serif">高原科技牧场 · 轻量化可视化溯源示意图</text>
      <text x="120" y="520" fill="rgba(255,255,255,0.86)" font-size="28" font-family="Arial, sans-serif">支持牧场实景、加工节点、防疫证书和生产流转过程展示</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
const traceabilityRecords = [
  {
    code: "QH-2026-YK-001",
    productName: "青海牦牛精选礼盒",
    batchNo: "PI-2026-0401",
    origin: "青海省海北州刚察县沙柳河镇",
    coordinates: {
      lng: 100.138,
      lat: 37.326
    },
    rancher: {
      name: "才让卓玛家庭牧场",
      role: "源头牧民合作社成员",
      company: "青海高原科技牧场示范基地",
      phone: "0970-621-1024"
    },
    enterprise: {
      name: "青海高原牧业加工中心",
      license: "QH-SC-630104-2026"
    },
    tags: ["高海拔散养", "绿色防疫", "冷链运输"],
    story: "该批次牦牛源自环青海湖高寒草场，采用家庭牧场散养模式，接入合作企业统一检疫、加工和包装。消费者可查看从养殖到包装的关键节点。 ",
    timeline: [
      {
        stage: "源头养殖",
        date: "2026-01-12",
        description: "耳标绑定电子档案，完成牧场基础信息与牲畜身份采集。"
      },
      {
        stage: "日常巡检",
        date: "2026-02-08",
        description: "兽医记录饲养状况、防疫计划和生长数据。"
      },
      {
        stage: "检疫出栏",
        date: "2026-03-22",
        description: "完成检疫申报、转运备案和屠前健康核验。"
      },
      {
        stage: "加工包装",
        date: "2026-04-01",
        description: "进入标准化分割、真空包装和批次编码流程。"
      }
    ],
    photos: [
      {
        title: "高寒牧场实景",
        src: createSvgDataUri("高寒牧场", "青海湖畔冬春轮牧区", ["#1f7a56", "#1e3a8a"])
      },
      {
        title: "牦牛饲养画面",
        src: createSvgDataUri("牦牛散养", "草场放牧与日常巡检", ["#2d855c", "#475569"])
      },
      {
        title: "加工车间",
        src: createSvgDataUri("加工车间", "标准化分割与冷链准备", ["#0f766e", "#334155"])
      }
    ],
    certificates: [
      {
        title: "动物检疫合格证明",
        src: createSvgDataUri("检疫证明", "批次：PI-2026-0401", ["#14532d", "#0f172a"])
      },
      {
        title: "防疫记录扫描件",
        src: createSvgDataUri("防疫记录", "周期免疫与巡检档案", ["#1d4ed8", "#0f172a"])
      }
    ]
  }
];
function findTraceabilityRecord(keyword) {
  if (!keyword) {
    return null;
  }
  const normalized = keyword.trim().toLowerCase();
  return traceabilityRecords.find(
    (record) => record.code.toLowerCase() === normalized || record.batchNo.toLowerCase() === normalized
  ) || null;
}
function TraceabilityPage() {
  const [searchId, setSearchId] = useState("");
  const [activeRecord, setActiveRecord] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const handleSearch = (e) => {
    e == null ? void 0 : e.preventDefault();
    if (!searchId.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      const record = findTraceabilityRecord(searchId);
      setActiveRecord(record);
      setIsSearching(false);
    }, 800);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative isolate min-h-screen pb-40", children: [
    /* @__PURE__ */ jsx("div", { className: "plateau-grid-bg" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh top-[15%] left-[-5%] w-[400px] h-[400px] bg-plateau-900/30" }),
    /* @__PURE__ */ jsx("div", { className: "glow-mesh bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-gold-900/10" }),
    /* @__PURE__ */ jsxs("section", { className: "container-shell pt-32 lg:pt-48", children: [
      /* @__PURE__ */ jsxs("div", { className: "animate-fade-in-up max-w-4xl", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-reveal inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-500 backdrop-blur-md", children: "Traceability Center" }),
        /* @__PURE__ */ jsxs("h1", { className: "section-title mt-10", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "数字指纹" }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-gradient-gold", children: "每一份原产地馈赠皆有迹可循" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-8 text-xl leading-relaxed text-slate-400 max-w-2xl", children: [
          "输入产品溯源编号，开启一场跨越山海的",
          /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: "信任之旅" }),
          "。 从牧场环境到加工流通，全链路数据实时存证。"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card mt-12 lg:mt-20 p-6 lg:p-16 animate-fade-in-up [animation-delay:200ms]", children: [
        /* @__PURE__ */ jsxs("form", { className: "relative flex flex-col gap-4 lg:gap-6 lg:flex-row", onSubmit: handleSearch, children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-6 lg:left-8 top-1/2 h-5 lg:h-6 w-5 lg:w-6 -translate-y-1/2 text-gold-500/50" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: "w-full rounded-full border border-white/10 bg-black/40 py-5 lg:py-6 pl-14 lg:pl-20 pr-6 lg:pr-8 text-base lg:text-lg text-white outline-none transition-all focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5 placeholder:text-slate-600",
                onChange: (e) => setSearchId(e.target.value),
                placeholder: "请输入溯源编号 (如: QH-2026-001)",
                type: "text",
                value: searchId
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn-gold flex items-center justify-center gap-3 lg:gap-4 px-8 lg:px-16 py-5 lg:py-0 text-base lg:text-lg transition-all active:scale-95 active:brightness-90",
              disabled: isSearching,
              type: "submit",
              children: isSearching ? /* @__PURE__ */ jsx("div", { className: "h-5 lg:h-6 w-5 lg:w-6 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(ScanLine, { className: "h-5 lg:h-6 w-5 lg:w-6" }),
                /* @__PURE__ */ jsx("span", { children: "开启溯源" })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 lg:mt-12 flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-10 border-t border-white/5 pt-8 lg:pt-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-slate-400 group cursor-pointer", onClick: () => window.open("https://www.baidu.com", "_blank"), children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 lg:h-12 w-10 lg:w-12 items-center justify-center rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 text-gold-500 shadow-gold-glow transition-all group-hover:bg-gold-500 group-hover:text-slate-950 group-active:scale-90", children: /* @__PURE__ */ jsx(ShieldPlus, { className: "h-5 lg:h-6 w-5 lg:w-6" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-colors group-hover:text-white", children: "区块链加密存证" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-slate-400 group cursor-pointer", onClick: () => window.open("https://www.baidu.com", "_blank"), children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 lg:h-12 w-10 lg:w-12 items-center justify-center rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 text-gold-500 shadow-gold-glow transition-all group-hover:bg-gold-500 group-hover:text-slate-950 group-active:scale-90", children: /* @__PURE__ */ jsx(BadgeCheck, { className: "h-5 lg:h-6 w-5 lg:w-6" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-colors group-hover:text-white", children: "实地影像核验" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 lg:mt-20", children: activeRecord ? /* @__PURE__ */ jsx("div", { className: "animate-fade-in space-y-12 lg:space-y-16", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_0.8fr]", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-8 lg:space-y-12", children: [
          /* @__PURE__ */ jsx("div", { className: "glass-card p-8 lg:p-12 animate-fade-in-up", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "inline-block rounded-full bg-gold-500/10 px-3 py-1 lg:px-4 lg:py-1.5 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-gold-500 border border-gold-500/20 mb-4 lg:mb-6", children: "Verified Identity" }),
              /* @__PURE__ */ jsx("h3", { className: "heading-serif text-3xl lg:text-4xl text-white", children: activeRecord.productName }),
              /* @__PURE__ */ jsxs("p", { className: "mt-3 lg:mt-4 font-mono text-xs lg:text-base text-slate-500 tracking-wider", children: [
                "ID: ",
                activeRecord.batchNo
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] lg:rounded-[2.5rem] bg-white/[0.02] border border-white/10 px-8 lg:px-10 py-5 lg:py-6 text-center backdrop-blur-xl transition-all hover:bg-white/5 cursor-default", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2", children: "数字化状态" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center lg:justify-start gap-3", children: [
                /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" }),
                  /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-gold-500" })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-lg lg:text-xl font-bold text-gold-500 tracking-widest uppercase", children: "Active" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "animate-fade-in-up [animation-delay:200ms]", children: /* @__PURE__ */ jsx(TraceTimeline, { items: activeRecord.timeline }) }),
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-8 lg:p-12 animate-fade-in-up [animation-delay:400ms]", children: [
            /* @__PURE__ */ jsx("h4", { className: "heading-serif text-xl lg:text-2xl text-white mb-8 lg:mb-10", children: "档案主体信息" }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:gap-8 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 lg:p-10 transition-all hover:bg-white/[0.03] hover:border-white/10", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-gold-500/60 mb-4 lg:mb-6", children: [
                  /* @__PURE__ */ jsx(UserRound, { className: "h-5 lg:h-6 w-5 lg:w-6" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] lg:text-xs font-bold uppercase tracking-widest", children: "生产者" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "heading-serif text-2xl lg:text-3xl text-white mb-2 lg:mb-3", children: activeRecord.rancher.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs lg:text-sm leading-relaxed text-slate-500", children: activeRecord.rancher.role })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 lg:p-10 transition-all hover:bg-white/[0.03] hover:border-white/10", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-gold-500/60 mb-4 lg:mb-6", children: [
                  /* @__PURE__ */ jsx(Building2, { className: "h-5 lg:h-6 w-5 lg:w-6" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] lg:text-xs font-bold uppercase tracking-widest", children: "监管企业" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "heading-serif text-2xl lg:text-3xl text-white mb-2 lg:mb-3", children: activeRecord.enterprise.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs lg:text-sm leading-relaxed text-slate-500", children: activeRecord.enterprise.license })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-8 lg:space-y-12", children: [
          /* @__PURE__ */ jsx("div", { className: "animate-fade-in-up [animation-delay:600ms]", children: /* @__PURE__ */ jsx(
            TraceMapCard,
            {
              coordinates: activeRecord.coordinates,
              origin: activeRecord.origin
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-8 lg:p-12 animate-fade-in-up [animation-delay:800ms]", children: [
            /* @__PURE__ */ jsx("h4", { className: "heading-serif text-xl lg:text-2xl text-white mb-8 lg:mb-10", children: "合规证明" }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-6 lg:gap-8", children: activeRecord.certificates.map((cert, idx) => /* @__PURE__ */ jsxs("div", { className: "group relative aspect-[16/10] overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] border border-white/10", children: [
              /* @__PURE__ */ jsx(LazyImage, { alt: cert.title, className: "h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110", src: cert.src }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" }),
              /* @__PURE__ */ jsx("div", { className: "absolute bottom-6 lg:bottom-8 left-6 lg:left-8 right-6 lg:right-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 lg:gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 lg:h-12 w-10 lg:w-12 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-gold-500 border border-white/10 group-hover:bg-gold-500 group-hover:text-slate-950 transition-all", children: /* @__PURE__ */ jsx(FileCheck2, { className: "h-5 lg:h-6 w-5 lg:w-6" }) }),
                /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base font-bold text-white tracking-wide", children: cert.title })
              ] }) })
            ] }, idx)) })
          ] })
        ] })
      ] }) }) : !isSearching && /* @__PURE__ */ jsxs("div", { className: "glass-card py-24 lg:py-40 px-6 text-center animate-fade-in-up [animation-delay:400ms]", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-20 lg:h-24 w-20 lg:w-24 items-center justify-center rounded-full bg-white/[0.02] border border-white/5 text-slate-800 shadow-premium", children: /* @__PURE__ */ jsx(QrCode, { className: "h-10 lg:h-12 w-10 lg:w-12" }) }),
        /* @__PURE__ */ jsx("h3", { className: "heading-serif mt-8 lg:mt-12 text-2xl lg:text-3xl text-white", children: "等待溯源查询" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 lg:mt-6 text-sm lg:text-slate-500 max-w-md mx-auto leading-relaxed", children: "请输入产品包装上的溯源编号或扫描二维码， 系统将为您检索完整的数字化档案与实地影像。" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: "mt-10 lg:mt-12 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] text-gold-500/60 transition-all hover:text-gold-500 hover:tracking-[0.3em]",
            onClick: () => {
              const code = traceabilityRecords[0].code;
              setSearchId(code);
              const record = findTraceabilityRecord(code);
              setActiveRecord(record);
            },
            type: "button",
            children: [
              "预览演示数据: ",
              traceabilityRecords[0].code
            ]
          }
        )
      ] }) })
    ] })
  ] });
}
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function App() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(ScrollToTop, {}),
    /* @__PURE__ */ jsxs(Routes, { children: [
      /* @__PURE__ */ jsxs(Route, { element: /* @__PURE__ */ jsx(MainLayout, {}), children: [
        /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(HomePage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/traceability", element: /* @__PURE__ */ jsx(TraceabilityPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/showcase", element: /* @__PURE__ */ jsx(ShowcasePage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/showcase/:productId", element: /* @__PURE__ */ jsx(ProductDetailPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/apply-farmer", element: /* @__PURE__ */ jsx(ApplyFarmerPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/auth", element: /* @__PURE__ */ jsx(AuthPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/audit-status", element: /* @__PURE__ */ jsx(AuditStatusPage, {}) }),
        /* @__PURE__ */ jsx(
          Route,
          {
            path: "/dashboard/farmer",
            element: /* @__PURE__ */ jsx(FarmerRouteGuard, { children: /* @__PURE__ */ jsx(FarmerDashboardPage, {}) })
          }
        ),
        /* @__PURE__ */ jsx(Route, { path: "/farmer-dashboard", element: /* @__PURE__ */ jsx(Navigate, { replace: true, to: "/dashboard/farmer" }) }),
        /* @__PURE__ */ jsx(Route, { path: "/admin-review", element: /* @__PURE__ */ jsx(AdminReviewPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/partners", element: /* @__PURE__ */ jsx(PartnersPage, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/connect", element: /* @__PURE__ */ jsx(ConnectPage, {}) })
      ] }),
      /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true }) })
    ] })
  ] });
}
function render(url) {
  return renderToString(
    /* @__PURE__ */ jsx(React.StrictMode, { children: /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(App, {}) }) })
  );
}
export {
  render
};
