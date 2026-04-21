import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.mjs";
import { useNavigate, Link, useLocation, Navigate, NavLink, Outlet, useParams, Routes, Route } from "react-router-dom";
import { Clock3, MapPinned, ShieldCheck, BadgeCheck, Video, QrCode, MessageSquareWarning, CheckCircle2, XCircle, UserRound, Phone, Upload, ImagePlus, LoaderCircle, ArrowRight, ArrowLeft, Mountain, X, Menu, Users, MessageCircleMore, Store, Camera, ChevronRight, Package, Trash2, Leaf, Waves, ClipboardList, Building2, Medal, Star, Sprout, ImageIcon, Navigation, WifiOff, RefreshCw, PauseCircle, AlertTriangle, DatabaseZap, Search, ScanLine, ShieldPlus, FileCheck2 } from "lucide-react";
const DB_NAME$1 = "plateau-tech-ranch";
const DB_VERSION = 2;
const STORE_NAME$1 = "farmer-listings";
function openDatabase$1() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME$1, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME$1)) {
        database.createObjectStore(STORE_NAME$1, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function withStore(mode, executor) {
  return openDatabase$1().then(
    (database) => new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME$1, mode);
      const store = transaction.objectStore(STORE_NAME$1);
      executor(store, resolve, reject);
      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
      transaction.oncomplete = () => database.close();
    })
  );
}
function isQinghaiLocation(watermark) {
  if (!watermark) {
    return false;
  }
  const label = `${watermark.region || ""} ${watermark.origin || ""}`;
  const matchesText = /青海|玉树|果洛|海东|海北|海西|海南州|黄南|西宁|柴达木/.test(label);
  if (matchesText) {
    return true;
  }
  const latitude = watermark.latitude;
  const longitude = watermark.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return false;
  }
  return latitude >= 31 && latitude <= 40 && longitude >= 89 && longitude <= 104;
}
function getFarmerListings() {
  return withStore("readonly", (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const listings = (request.result || []).sort(
        (left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
      );
      resolve(listings);
    };
    request.onerror = () => reject(request.error);
  });
}
function updateFarmerListingStatus(id, status, reviewNote) {
  return withStore("readwrite", (store, resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      const current = request.result;
      if (!current) {
        resolve(null);
        return;
      }
      const next = {
        ...current,
        status,
        reviewNote,
        reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      store.put(next);
      resolve(next);
    };
    request.onerror = () => reject(request.error);
  });
}
function buildObjectUrl(file) {
  if (!file) {
    return null;
  }
  return URL.createObjectURL(file);
}
function AdminReviewPage() {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const [listings, setListings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNote, setReviewNote] = useState(
    "已核验视频水印、产地信息与资料完整性。"
  );
  const loadListings = async () => {
    try {
      const nextListings = await getFarmerListings();
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
    void loadListings();
  }, []);
  const selectedListing = useMemo(
    () => listings.find((item) => item.id === selectedId) ?? listings[0] ?? null,
    [listings, selectedId]
  );
  const videoUrl = useMemo(
    () => buildObjectUrl(selectedListing == null ? void 0 : selectedListing.videoFile),
    [selectedListing]
  );
  const qrUrl = useMemo(
    () => buildObjectUrl(selectedListing == null ? void 0 : selectedListing.qrImage),
    [selectedListing]
  );
  const imageUrls = useMemo(
    () => ((selectedListing == null ? void 0 : selectedListing.imageFiles) ?? []).map((file) => ({
      name: file.name,
      url: buildObjectUrl(file)
    })),
    [selectedListing]
  );
  useEffect(
    () => () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (qrUrl) {
        URL.revokeObjectURL(qrUrl);
      }
      imageUrls.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [imageUrls, qrUrl, videoUrl]
  );
  const handleReview = async (status) => {
    if (!selectedListing) {
      return;
    }
    await updateFarmerListingStatus(selectedListing.id, status, reviewNote);
    await loadListings();
  };
  return /* @__PURE__ */ jsxs("section", { className: "container-shell py-12 sm:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 max-w-4xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-sky-200", children: "Admin Review" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-white sm:text-4xl", children: "管理员审核界面" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-slate-300", children: "用于确认农户提交的视频是否为青海本地实景，并核验数字身份证、水印信息和多媒体证明。" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[0.36fr_0.64fr]", children: [
      /* @__PURE__ */ jsxs("aside", { className: "glass-card p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "待审核商品" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-400", children: "选择一个农户提交记录查看视频与真实性证明" }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 space-y-4", children: listings.length ? listings.map((item) => /* @__PURE__ */ jsxs(
          "button",
          {
            className: [
              "w-full rounded-3xl border p-5 text-left transition",
              (selectedListing == null ? void 0 : selectedListing.id) === item.id ? "border-sky-300/40 bg-sky-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
            ].join(" "),
            onClick: () => setSelectedId(item.id),
            type: "button",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-white", children: item.productName }),
                /* @__PURE__ */ jsx("span", { className: "rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300", children: item.status })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-400", children: item.origin }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-slate-500", children: item.digitalId })
            ]
          },
          item.id
        )) : /* @__PURE__ */ jsx("div", { className: "rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm leading-6 text-slate-400", children: "当前还没有农户提交的待审核商品。请先在“农户后台”完成一次产品发布。" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: selectedListing ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200", children: selectedListing.status }),
                /* @__PURE__ */ jsx("span", { className: "rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300", children: selectedListing.priceCategory })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-5 text-3xl font-semibold text-white", children: selectedListing.productName }),
              /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm leading-7 text-slate-300", children: [
                "产地：",
                selectedListing.origin
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-slate-950/40 p-5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "数字身份证 ID" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-xs break-all text-sm font-semibold text-white", children: selectedListing.digitalId })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sky-200", children: [
                /* @__PURE__ */ jsx(Clock3, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "拍摄时间戳" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium text-white", children: ((_a = selectedListing.watermark) == null ? void 0 : _a.timestamp) ?? "未记录" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sky-200", children: [
                /* @__PURE__ */ jsx(MapPinned, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "定位信息" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium text-white", children: ((_b = selectedListing.watermark) == null ? void 0 : _b.latitude) && ((_c = selectedListing.watermark) == null ? void 0 : _c.longitude) ? `${selectedListing.watermark.latitude}, ${selectedListing.watermark.longitude}` : ((_d = selectedListing.watermark) == null ? void 0 : _d.region) ?? "未记录" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-emerald-200", children: [
                /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "青海核验" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium text-white", children: isQinghaiLocation({
                ...selectedListing.watermark,
                origin: selectedListing.origin
              }) ? "匹配青海区域" : "需人工复核" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-emerald-200", children: [
                /* @__PURE__ */ jsx(BadgeCheck, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "提交状态" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium text-white", children: selectedListing.reviewNote })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_0.95fr]", children: [
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(Video, { className: "h-5 w-5 text-sky-200" }),
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "视频核验" })
            ] }),
            videoUrl ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "video",
                {
                  className: "h-72 w-full rounded-3xl object-cover",
                  controls: true,
                  src: videoUrl
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute bottom-3 left-3 right-3 rounded-2xl bg-slate-950/75 p-3 text-xs text-white backdrop-blur", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "时间戳：",
                  ((_e = selectedListing.watermark) == null ? void 0 : _e.timestamp) ?? "未记录"
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "地点：",
                  ((_f = selectedListing.watermark) == null ? void 0 : _f.latitude) && ((_g = selectedListing.watermark) == null ? void 0 : _g.longitude) ? `${selectedListing.watermark.latitude}, ${selectedListing.watermark.longitude}` : ((_h = selectedListing.watermark) == null ? void 0 : _h.region) ?? selectedListing.origin
                ] })
              ] }) })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "flex h-72 flex-col items-center justify-center rounded-3xl bg-white/5 text-slate-400", children: [
              /* @__PURE__ */ jsx(Video, { className: "h-10 w-10" }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm", children: "未找到可预览视频，请核对农户上传资料" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100", children: "审核重点：视频场景是否为青海牧场/高原草地、拍摄时间是否合理、定位是否与产地描述一致。" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "glass-card p-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(QrCode, { className: "h-5 w-5 text-plateau-200" }),
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "私域与图片资料" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "联系电话" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: selectedListing.phone || "未填写" })
                ] }),
                qrUrl && /* @__PURE__ */ jsx(
                  "img",
                  {
                    alt: "微信二维码",
                    className: "h-56 w-full rounded-3xl object-cover",
                    src: qrUrl
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: imageUrls.length ? imageUrls.map((item) => /* @__PURE__ */ jsx(
                  "img",
                  {
                    alt: item.name,
                    className: "aspect-square rounded-2xl object-cover",
                    src: item.url
                  },
                  item.url
                )) : /* @__PURE__ */ jsx("div", { className: "col-span-2 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400", children: "暂无图片资料" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "glass-card p-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(MessageSquareWarning, { className: "h-5 w-5 text-sky-200" }),
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "审核意见" })
              ] }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  className: "min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-plateau-400",
                  onChange: (event) => setReviewNote(event.target.value),
                  placeholder: "填写审核备注",
                  value: reviewNote
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-3 sm:flex-row", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-base font-medium text-white transition hover:bg-emerald-400",
                    onClick: () => void handleReview("已通过"),
                    type: "button",
                    children: [
                      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }),
                      "确认青海本地实景"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 text-base font-medium text-white transition hover:bg-rose-400",
                    onClick: () => void handleReview("退回补充"),
                    type: "button",
                    children: [
                      /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5" }),
                      "退回补充"
                    ]
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "glass-card p-8 text-sm leading-7 text-slate-400", children: "暂无审核数据，请先在 `农户后台` 提交一条包含视频和图片的产品记录。" }) })
    ] })
  ] });
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
function getSupabaseBrowserClient() {
  {
    return null;
  }
}
const STORAGE_BUCKET = "farmer-media";
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
function sanitizeFileName(name) {
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
    const videoPath = `${submissionKey}/video-${sanitizeFileName(primaryVideo.name)}`;
    const { error: videoError } = await client.storage.from(STORAGE_BUCKET).upload(videoPath, primaryVideo, {
      upsert: false,
      cacheControl: "3600"
    });
    if (videoError) {
      throw new Error("证明视频上传失败，请确认 Supabase Storage 已创建 farmer-media bucket。");
    }
    await Promise.all(
      imageFiles.map(async (file, index) => {
        const imagePath = `${submissionKey}/images/${index + 1}-${sanitizeFileName(file.name)}`;
        const { error } = await client.storage.from(STORAGE_BUCKET).upload(imagePath, file, {
          upsert: false,
          cacheControl: "3600"
        });
        if (error) {
          throw new Error("补充图片上传失败，请稍后重试。");
        }
      })
    );
    const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(videoPath);
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
function AuditStatusPage() {
  var _a;
  const location = useLocation();
  const submittedAt = ((_a = location.state) == null ? void 0 : _a.submittedAt) ? new Date(location.state.submittedAt).toLocaleString("zh-CN", {
    hour12: false
  }) : null;
  return /* @__PURE__ */ jsx("section", { className: "container-shell flex min-h-[72vh] items-center justify-center py-12 sm:py-16", children: /* @__PURE__ */ jsxs("div", { className: "glass-card w-full max-w-3xl overflow-hidden p-6 sm:p-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(245,158,11,0.18),rgba(15,23,42,0.45))] p-8 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-amber-100", children: /* @__PURE__ */ jsx(LoaderCircle, { className: "h-10 w-10 animate-spin" }) }),
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
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: "pending_farmer" })
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
  { label: "首页", to: "/" },
  { label: "溯源大厅", to: "/traceability" },
  { label: "农场商城", to: "/showcase" },
  { label: "我是农户/我要发布", to: "/dashboard/farmer" },
  { label: "审核后台", to: "/admin-review" },
  { label: "合作伙伴", to: "/partners" },
  { label: "关于我们", to: "/connect" }
];
function navClassName({ isActive }) {
  return [
    "rounded-full px-4 py-2 text-sm transition",
    isActive ? "bg-plateau-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
  ].join(" ");
}
function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentYear = useMemo(() => (/* @__PURE__ */ new Date()).getFullYear(), []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen text-slate-100", children: [
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-50 border-b border-white/10 bg-earth-950/80 backdrop-blur", children: [
      /* @__PURE__ */ jsxs("div", { className: "container-shell flex items-center justify-between py-4", children: [
        /* @__PURE__ */ jsxs(NavLink, { className: "flex items-center gap-3", to: "/", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-plateau-500/15 p-2 text-plateau-300", children: /* @__PURE__ */ jsx(Mountain, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "高原科技牧场" }),
            /* @__PURE__ */ jsx("h1", { className: "text-base font-semibold tracking-wide", children: "青海农牧溯源与展示平台" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("nav", { className: "hidden items-center gap-2 md:flex", children: navItems.map((item) => /* @__PURE__ */ jsx(NavLink, { className: navClassName, to: item.to, children: item.label }, item.to)) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "rounded-full border border-white/10 p-2 text-slate-200 md:hidden",
            onClick: () => setMenuOpen((value) => !value),
            type: "button",
            children: menuOpen ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
          }
        )
      ] }),
      menuOpen && /* @__PURE__ */ jsx("div", { className: "border-t border-white/10 bg-slate-900/95 md:hidden", children: /* @__PURE__ */ jsx("div", { className: "container-shell flex flex-col gap-2 py-3", children: navItems.map((item) => /* @__PURE__ */ jsx(
        NavLink,
        {
          className: navClassName,
          onClick: () => setMenuOpen(false),
          to: item.to,
          children: item.label
        },
        item.to
      )) }) })
    ] }),
    /* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-white/10 bg-earth-950/70", children: /* @__PURE__ */ jsxs("div", { className: "container-shell flex flex-col gap-3 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsx("p", { children: "以数字化溯源连接牧场、企业与消费者。" }),
      /* @__PURE__ */ jsxs("p", { children: [
        currentYear,
        " High Plateau Tech Ranch"
      ] })
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
  return /* @__PURE__ */ jsx("section", { className: "container-shell py-12 sm:py-16", children: /* @__PURE__ */ jsxs("div", { className: "glass-card p-8 sm:p-10", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-plateau-200", children: "Connect" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-white sm:text-4xl", children: "关于我们与私域入口" }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-3xl text-base leading-7 text-slate-300", children: "该页面承载团队介绍、合作洽谈和私域转化入口，可与线下展陈、短视频传播、直播导购等场景联动。" }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 grid gap-6 md:grid-cols-3", children: cards.map(({ icon: Icon, title, description }) => /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-7 w-7 text-plateau-300" }),
      /* @__PURE__ */ jsx("h3", { className: "mt-5 text-xl font-semibold text-white", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-slate-400", children: description })
    ] }, title)) })
  ] }) });
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
function SectionHeader({ icon: Icon, title, hint }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-start gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-plateau-500/15 p-3 text-plateau-200", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-6 text-slate-400", children: hint })
    ] })
  ] });
}
function LargeInput({ className = "", ...props }) {
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
function UploadButton({ icon: Icon, label, onClick }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: "flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-plateau-500 px-5 py-4 text-base font-medium text-white transition hover:bg-plateau-400",
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
    wechatQrLabel: "当前已绑定微信二维码"
  });
  const [videoFile, setVideoFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [qrFile, setQrFile] = useState(null);
  const [publishedProducts, setPublishedProducts] = useState(initialPublishedProducts);
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
    event.preventDefault();
    if (!publishForm.productName || !publishForm.specs || !publishForm.price || !publishForm.stock) {
      setSubmitMessage("请完整填写商品名称、规格、价格和库存。");
      return;
    }
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
    setSubmitMessage("新商品已加入已发布列表，你可以继续补充更多商品。");
  };
  const handleTakeDown = (productId) => {
    setPublishedProducts(
      (current) => current.filter((product) => product.id !== productId)
    );
    setSubmitMessage("商品已成功下架。");
  };
  const handleQrUpload = (file) => {
    setQrFile(file);
    if (file) {
      setContactForm((current) => ({
        ...current,
        wechatQrLabel: file.name
      }));
    }
  };
  return /* @__PURE__ */ jsxs("section", { className: "container-shell py-12 sm:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 max-w-4xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-plateau-200", children: "Farmer Dashboard" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-white sm:text-4xl", children: "农户控制台" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-slate-300", children: "仅开放给已通过审核的 `farmer` 用户，用于发布商品、维护私域名片，以及管理自己已上架的商品。" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]", children: [
      /* @__PURE__ */ jsx("div", { className: "glass-card overflow-hidden p-8", children: /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] border border-plateau-300/10 bg-[linear-gradient(135deg,rgba(61,168,117,0.2),rgba(14,165,233,0.12),rgba(15,23,32,0.45))] p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "rounded-full border border-plateau-300/20 bg-plateau-500/10 px-4 py-2 text-sm text-plateau-200", children: "仅限已认证农户" }),
          /* @__PURE__ */ jsx("span", { className: "rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200", children: "手机端优先" })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "mt-6 text-3xl font-semibold text-white", children: "发布商品并维护你的私域联系入口" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-2xl text-sm leading-7 text-slate-300", children: "消费者在商城或详情页看中你的商品后，会直接通过你维护的电话或微信联系你，因此这套控制台同时兼顾发品与私域承接。" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3 lg:grid-cols-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "已发布商品" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-2xl font-semibold text-white", children: [
            publishedProducts.length,
            " 个"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "私域电话" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold text-white", children: contactForm.phone || "未填写" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "素材上传" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-2xl font-semibold text-white", children: [
            "视频 ",
            videoFile ? "1" : "0",
            " / 图片 ",
            imageFiles.length
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[0.68fr_0.32fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("form", { className: "glass-card p-6 sm:p-8", onSubmit: handlePublishSubmit, children: [
          /* @__PURE__ */ jsx(
            SectionHeader,
            {
              hint: "填写商品名称、规格、价格和库存，并补充实景视频与检疫图片。",
              icon: Store,
              title: "发布新商品"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
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
                placeholder: "价格，如：¥168",
                value: publishForm.price
              }
            ),
            /* @__PURE__ */ jsx(
              LargeInput,
              {
                name: "stock",
                onChange: handlePublishChange,
                placeholder: "库存，如：24",
                value: publishForm.stock
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx(
                UploadButton,
                {
                  icon: Video,
                  label: videoFile ? "重新上传实景视频" : "上传实景视频",
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
                  label: imageFiles.length ? `继续上传肉质 / 检疫图片 (${imageFiles.length})` : "上传肉质 / 检疫图片",
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
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-slate-950/40 p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm text-slate-300", children: [
                  /* @__PURE__ */ jsx(Video, { className: "h-4 w-4 text-sky-200" }),
                  /* @__PURE__ */ jsx("span", { children: "实景视频预览" })
                ] }),
                videoPreview ? /* @__PURE__ */ jsx(
                  "video",
                  {
                    className: "h-64 w-full rounded-2xl object-cover",
                    controls: true,
                    src: videoPreview
                  }
                ) : /* @__PURE__ */ jsxs("div", { className: "flex h-64 flex-col items-center justify-center rounded-2xl bg-white/5 text-slate-400", children: [
                  /* @__PURE__ */ jsx(Upload, { className: "h-10 w-10" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm", children: "上传后显示实景视频预览" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-slate-950/40 p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm text-slate-300", children: [
                  /* @__PURE__ */ jsx(Camera, { className: "h-4 w-4 text-plateau-200" }),
                  /* @__PURE__ */ jsx("span", { children: "图片预览" })
                ] }),
                imagePreviews.length ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: imagePreviews.map((item) => /* @__PURE__ */ jsx(
                  "img",
                  {
                    alt: item.name,
                    className: "aspect-square rounded-2xl object-cover",
                    src: item.url
                  },
                  item.url
                )) }) : /* @__PURE__ */ jsxs("div", { className: "flex h-40 flex-col items-center justify-center rounded-2xl bg-white/5 text-slate-400", children: [
                  /* @__PURE__ */ jsx(ImagePlus, { className: "h-10 w-10" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm", children: "上传后展示肉质与检疫图片" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-1 h-5 w-5 text-emerald-300" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm leading-6 text-slate-300", children: submitMessage })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-sky-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-400",
                type: "submit",
                children: [
                  "发布新商品",
                  /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
          /* @__PURE__ */ jsx(
            SectionHeader,
            {
              hint: "消费者看中您的商品后，将直接通过此处的电话或微信与您联系，请保持畅通。",
              icon: Phone,
              title: "我的私域名片"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 xl:grid-cols-[0.95fr_1.05fr]", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Phone, { className: "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" }),
                /* @__PURE__ */ jsx(
                  LargeInput,
                  {
                    className: "pl-12",
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
                  label: qrFile ? "重新上传微信二维码" : "一键上传微信二维码",
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
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-plateau-300/20 bg-plateau-500/10 p-4 text-sm text-plateau-100", children: [
                "当前二维码：",
                contactForm.wechatQrLabel
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-4", children: qrPreview ? /* @__PURE__ */ jsx(
              "img",
              {
                alt: "微信二维码预览",
                className: "h-56 w-full rounded-2xl object-cover",
                src: qrPreview
              }
            ) : /* @__PURE__ */ jsxs("div", { className: "flex h-56 flex-col items-center justify-center rounded-2xl bg-white/5 text-slate-400", children: [
              /* @__PURE__ */ jsx(QrCode, { className: "h-10 w-10" }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm", children: "微信二维码预览区" })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
          /* @__PURE__ */ jsx(
            SectionHeader,
            {
              hint: "瀑布流展示你自己上架的商品，可随时一键下架。",
              icon: Package,
              title: "已发布商品"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "columns-1 gap-4 md:columns-2", children: publishedProducts.length ? publishedProducts.map((product) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "mb-4 break-inside-avoid rounded-3xl border border-white/10 bg-white/5 p-5",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-white", children: product.name }),
                    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-400", children: product.specs })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100", children: product.status })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-slate-950/40 p-4", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "价格" }),
                    /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.price })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-slate-950/40 p-4", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "库存" }),
                    /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.stock })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: "mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20",
                    onClick: () => handleTakeDown(product.id),
                    type: "button",
                    children: [
                      /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                      "一键下架"
                    ]
                  }
                )
              ]
            },
            product.id
          )) : /* @__PURE__ */ jsx("div", { className: "break-inside-avoid rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm leading-6 text-slate-400", children: "暂无已发布商品。你可以先在上方“发布新商品”板块创建第一条商品。" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "控制台提醒" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 space-y-4 text-sm leading-6 text-slate-300", children: [
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: "商品的实景视频越清晰，越有助于消费者快速建立信任。" }),
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: "私域名片中的电话和微信二维码要保持最新，避免错失咨询线索。" }),
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: "已发布商品支持即时下架，适合库存变动或临时停售场景。" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass-card p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "当前名片摘要" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "联系电话" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: contactForm.phone || "未填写" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "二维码状态" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: qrFile ? "已更新" : "待确认" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "商品总数" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: publishedProducts.length })
            ] })
          ] })
        ] })
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
  return /* @__PURE__ */ jsx("section", { className: "container-shell py-12 sm:py-16", children: /* @__PURE__ */ jsx("div", { className: "glass-card overflow-hidden p-8 sm:p-12", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("span", { className: "rounded-full border border-plateau-300/30 bg-plateau-500/10 px-4 py-2 text-sm text-plateau-200", children: "第十五届挑战杯项目衍生平台" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl", children: "为青海农牧产品打造看得见、讲得清、传得开的数字名片" }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-2xl text-base leading-8 text-slate-300", children: "“高原科技牧场”聚焦青海农牧散户、企业与消费者之间的信息信任问题， 通过轻量化可视化溯源与展示体系，让产品故事、生态价值与生产流程直观可见。" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            className: "rounded-full bg-plateau-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-plateau-400",
            to: "/traceability",
            children: "进入溯源大厅"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            className: "rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10",
            to: "/showcase",
            children: "查看农场商城"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(61,168,117,0.25),rgba(15,23,32,0.6))] p-6", children: /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: highlights.map(({ icon: Icon, title, description }) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "rounded-3xl border border-white/10 bg-slate-950/40 p-5",
        children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-plateau-300" }),
          /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold text-white", children: title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-slate-400", children: description })
        ]
      },
      title
    )) }) })
  ] }) }) });
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
  return /* @__PURE__ */ jsxs("section", { className: "container-shell py-12 sm:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 max-w-4xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-sky-200", children: "Partner System" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-white sm:text-4xl", children: "合作伙伴管理系统模板" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-slate-300", children: "为每个农户或企业生成独立的线上主页，统一展示合作等级、信用积分、历史溯源记录和合作概况。 整体风格采用青海蓝与生态绿，便于后续接入真实伙伴数据。" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]", children: [
      /* @__PURE__ */ jsx("div", { className: "glass-card overflow-hidden p-8", children: /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] border border-sky-300/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(61,168,117,0.12),rgba(15,23,32,0.4))] p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-200", children: "青海蓝 + 生态绿" }),
          /* @__PURE__ */ jsx("span", { className: "rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300", children: "伙伴独立主页模板" })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "mt-6 text-3xl font-semibold text-white", children: "统一管理农户与企业合作档案" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-2xl text-sm leading-7 text-slate-300", children: "支持平台运营方快速为合作农户、合作社和企业伙伴建立线上主页，持续沉淀信用表现、 履约能力与历史溯源记录，用于品牌背书、渠道合作和平台准入管理。" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3 lg:grid-cols-1", children: [
        /* @__PURE__ */ jsx(PartnerStat, { label: "模板覆盖伙伴", value: `${partners.length} 家` }),
        /* @__PURE__ */ jsx(PartnerStat, { label: "最高信用积分", value: "99 分" }),
        /* @__PURE__ */ jsx(PartnerStat, { label: "累计溯源记录", value: "85 条+" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[0.36fr_0.64fr]", children: [
      /* @__PURE__ */ jsxs("aside", { className: "glass-card p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "伙伴列表" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-400", children: "选择一个伙伴查看独立线上主页" })
          ] }),
          /* @__PURE__ */ jsx(ClipboardList, { className: "h-5 w-5 text-sky-300" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 flex flex-wrap gap-2", children: ["全部", "农户", "企业"].map((type) => /* @__PURE__ */ jsx(
          "button",
          {
            className: [
              "rounded-full px-4 py-2 text-sm transition",
              activeType === type ? "bg-sky-500 text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            ].join(" "),
            onClick: () => setActiveType(type),
            type: "button",
            children: type
          },
          type
        )) }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 space-y-4", children: visiblePartners.map((partner) => {
          const active = selectedPartner.id === partner.id;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              className: [
                "w-full rounded-3xl border p-5 text-left transition",
                active ? "border-sky-300/40 bg-sky-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
              ].join(" "),
              onClick: () => setSelectedId(partner.id),
              type: "button",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-white", children: partner.name }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-400", children: partner.region })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `rounded-full px-3 py-1 text-xs ${getLevelStyle(partner.level)}`,
                      children: partner.type
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between text-sm", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: partner.level }),
                  /* @__PURE__ */ jsxs("span", { className: `font-medium ${getScoreStyle(partner.creditScore)}`, children: [
                    "信用 ",
                    partner.creditScore
                  ] })
                ] })
              ]
            },
            partner.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass-card overflow-hidden p-8", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-[2rem] border border-sky-300/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(61,168,117,0.12),rgba(15,23,32,0.45))] p-6 sm:p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: `rounded-full px-4 py-2 text-sm ${getLevelStyle(selectedPartner.level)}`, children: selectedPartner.level }),
                /* @__PURE__ */ jsx("span", { className: "rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300", children: selectedPartner.region })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-5 text-3xl font-bold text-white", children: selectedPartner.name }),
              /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-3xl text-sm leading-7 text-slate-300", children: selectedPartner.description }),
              /* @__PURE__ */ jsx("div", { className: "mt-5 flex flex-wrap gap-2", children: selectedPartner.tags.map((tag) => /* @__PURE__ */ jsx(
                "span",
                {
                  className: "rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100",
                  children: tag
                },
                tag
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-center", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "信用积分" }),
              /* @__PURE__ */ jsx("div", { className: `mt-3 text-5xl font-bold ${getScoreStyle(selectedPartner.creditScore)}`, children: selectedPartner.creditScore }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-slate-500", children: "基于履约、记录完整度与合作反馈综合评估" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sky-200", children: [
                selectedPartner.type === "企业" ? /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "合作主体" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: selectedPartner.type })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-emerald-200", children: [
                /* @__PURE__ */ jsx(Medal, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "合作等级" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: selectedPartner.level })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sky-200", children: [
                /* @__PURE__ */ jsx(BadgeCheck, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "在线产品数" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: selectedPartner.stats.activeProducts })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-emerald-200", children: [
                /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "履约达成率" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: selectedPartner.stats.fulfillmentRate })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[0.9fr_1.1fr]", children: [
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-emerald-500/15 p-3 text-emerald-200", children: /* @__PURE__ */ jsx(Leaf, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "伙伴档案" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "线上主页基础信息模块" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "合作联系人" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: selectedPartner.contact.manager })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "联系电话" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: selectedPartner.contact.phone })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "历史溯源记录数" }),
                /* @__PURE__ */ jsxs("p", { className: "mt-2 text-lg font-semibold text-white", children: [
                  selectedPartner.stats.records,
                  " 条"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-sky-500/15 p-3 text-sky-200", children: /* @__PURE__ */ jsx(Star, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "历史溯源记录" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "展示合作方历史批次与处理状态" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-6 space-y-4", children: selectedPartner.traceRecords.map((record) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "rounded-3xl border border-white/10 bg-white/5 p-5",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-white", children: record.product }),
                      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-slate-400", children: [
                        "溯源编号：",
                        record.code
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "rounded-full border border-sky-300/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-200", children: record.status })
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-slate-400", children: [
                    "归档时间：",
                    record.date
                  ] })
                ]
              },
              record.code
            )) })
          ] })
        ] })
      ] })
    ] })
  ] });
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
const categories = ["全部", "牦牛肉", "藏羊", "青稞", "枸杞"];
const products = [
  {
    id: "yak-ribeye",
    category: "牦牛肉",
    name: "高原牦牛雪花肉",
    origin: "玉树直供",
    description: "选自高海拔散养牦牛，适合家庭烹饪、餐饮采购与节庆礼赠。",
    story: "该产品来自玉树高海拔天然牧场，采用散养方式，接入统一溯源、检疫和冷链交付流程，兼顾高端零售与渠道礼赠展示。",
    specs: "500g / 盒",
    traceCode: "QH-SC-YK-001",
    image: createProductImage("牦牛雪花肉", "玉树直供 · 高海拔散养", ["#14532d", "#1e3a8a"]),
    features: ["高原散养", "检疫可追溯", "支持礼盒定制"],
    pricing: {
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
    origin: "果洛牧场",
    description: "草场自然放牧，适配社区团购、批量团餐与品牌联名礼盒。",
    story: "产品源于果洛高寒草场，强调天然放牧和统一检疫，适合团餐、渠道分销和区域品牌联名合作。",
    specs: "1kg / 袋",
    traceCode: "QH-SC-ZY-016",
    image: createProductImage("藏羊分割装", "果洛牧场 · 天然放牧", ["#2d855c", "#475569"]),
    features: ["天然放牧", "团购友好", "冷链发运"],
    pricing: {
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
    origin: "海北原产",
    description: "适合文旅伴手礼、企业福利及高原农特产组合展示。",
    story: "青稞礼装突出海北原产地故事和联名文旅属性，适合企业福利、伴手礼和区域特色组合展示。",
    specs: "750g / 盒",
    traceCode: "QH-SC-QK-032",
    image: createProductImage("青稞礼装", "海北原产 · 农文旅联名", ["#b45309", "#365314"]),
    features: ["海北原产", "礼赠属性强", "适合联名展示"],
    pricing: {
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
    origin: "柴达木优选",
    description: "面向健康零售、企业定制和私域社群复购场景。",
    story: "柴达木产区枸杞突出健康属性和复购潜力，适合社群私域转化、企业定制和养生伴手礼场景。",
    specs: "250g / 罐",
    traceCode: "QH-SC-GQ-021",
    image: createProductImage("高原枸杞", "柴达木优选 · 健康滋补", ["#b91c1c", "#7c2d12"]),
    features: ["柴达木优选", "健康滋补", "适合私域复购"],
    pricing: {
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
function ModalQrCard$1({ name }) {
  return /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-44 w-44 items-center justify-center rounded-3xl border border-dashed border-plateau-300/40 bg-white/5", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-plateau-500/15 text-plateau-200", children: /* @__PURE__ */ jsx(QrCode, { className: "h-8 w-8" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300", children: "联系牧民 / 主理人二维码" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-slate-500", children: name })
    ] })
  ] }) });
}
function ProductDetailPage() {
  const { productId } = useParams();
  const [showContact, setShowContact] = useState(false);
  const product = useMemo(() => getProductById(productId), [productId]);
  if (!product) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/showcase", replace: true });
  }
  return /* @__PURE__ */ jsxs("section", { className: "container-shell py-12 sm:py-16", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        className: "mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white",
        to: "/showcase",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "返回农场商城"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[1fr_0.95fr]", children: [
      /* @__PURE__ */ jsx("div", { className: "glass-card overflow-hidden", children: /* @__PURE__ */ jsx(
        "img",
        {
          alt: product.name,
          className: "h-full min-h-[320px] w-full object-cover",
          loading: "lazy",
          src: product.image
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "rounded-full bg-plateau-500 px-4 py-2 text-sm text-white", children: product.origin }),
          /* @__PURE__ */ jsx("span", { className: "rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300", children: product.category })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "mt-5 text-3xl font-bold text-white sm:text-4xl", children: product.name }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-slate-300", children: product.story }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: product.features.map((feature) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "rounded-full border border-plateau-300/20 bg-plateau-500/10 px-3 py-1 text-xs text-plateau-100",
            children: feature
          },
          feature
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "零售价" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.pricing.retail })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "批发价" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.pricing.wholesale })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "礼盒价" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.pricing.gift })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "规格" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-base font-medium text-white", children: product.specs })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "溯源码" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-base font-medium text-white", children: product.traceCode })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 rounded-3xl border border-amber-300/20 bg-amber-500/10 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "mt-0.5 h-5 w-5 text-amber-200" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-amber-100", children: "互动逻辑说明" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-amber-50/90", children: "详情页不设置购物车和在线支付入口，统一通过“联系牧民”按钮进入私域沟通，符合项目不介入资金流转的要求。" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-plateau-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-plateau-400",
              onClick: () => setShowContact(true),
              type: "button",
              children: [
                /* @__PURE__ */ jsx(MessageCircleMore, { className: "h-5 w-5" }),
                "联系牧民"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              className: "flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 py-4 text-base font-semibold text-slate-100 transition hover:bg-white/10",
              to: "/traceability",
              children: [
                /* @__PURE__ */ jsx(Store, { className: "h-5 w-5" }),
                "查看溯源档案"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-card mt-6 p-6 sm:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(BadgeCheck, { className: "h-5 w-5 text-plateau-200" }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "联系信息" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "联系人" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.contact.owner })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
            /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "联系电话" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.contact.phone })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "微信号" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.contact.wechat })
        ] })
      ] })
    ] }),
    showContact && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass-card w-full max-w-lg p-6 sm:p-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.2em] text-plateau-200", children: "Connect Farmer" }),
        /* @__PURE__ */ jsx("h3", { className: "mt-2 text-2xl font-semibold text-white", children: product.name })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-6 text-slate-300", children: "当前详情页不提供购物车。如需购买、批发或礼盒定制，请直接联系牧民或私域主理人完成后续沟通。" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr]", children: [
        /* @__PURE__ */ jsx(ModalQrCard$1, { name: product.contact.owner }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "联系人" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.contact.owner })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
              /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: "牧民联系方式" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.contact.phone }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-slate-400", children: [
              "微信号：",
              product.contact.wechat
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "mt-6 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10",
          onClick: () => setShowContact(false),
          type: "button",
          children: "关闭"
        }
      )
    ] }) })
  ] });
}
function ModalQrCard({ name }) {
  return /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-44 w-44 items-center justify-center rounded-3xl border border-dashed border-plateau-300/40 bg-white/5", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-plateau-500/15 text-plateau-200", children: /* @__PURE__ */ jsx(QrCode, { className: "h-8 w-8" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300", children: "私域主理人二维码" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-slate-500", children: name })
    ] })
  ] }) });
}
function ShowcasePage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const visibleProducts = useMemo(() => {
    if (activeCategory === "全部") {
      return products;
    }
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);
  return /* @__PURE__ */ jsxs("section", { className: "container-shell py-12 sm:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 max-w-4xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-plateau-200", children: "Showcase" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-white sm:text-4xl", children: "农场商城展示墙" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-slate-300", children: "结合项目书中的三级差异化定价策略，面向零售用户、批量采购方和礼赠客户提供不同规格价格展示； 页面仅做展示与咨询引流，不介入支付和资金流转。" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "glass-card mb-8 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "产品分类" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-400", children: "展示牦牛肉、藏羊、青稞、枸杞等高原特色产品" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: categories.map((category) => /* @__PURE__ */ jsx(
        "button",
        {
          className: [
            "rounded-full px-4 py-2 text-sm transition",
            activeCategory === category ? "bg-plateau-500 text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          ].join(" "),
          onClick: () => setActiveCategory(category),
          type: "button",
          children: category
        },
        category
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-6 xl:grid-cols-2", children: visibleProducts.map((product) => /* @__PURE__ */ jsx("article", { className: "glass-card overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "grid h-full gap-0 md:grid-cols-[0.95fr_1.05fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative min-h-72 overflow-hidden", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            alt: product.name,
            className: "h-full w-full object-cover",
            loading: "lazy",
            src: product.image
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute left-4 top-4 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "rounded-full bg-slate-950/75 px-3 py-1 text-xs text-white", children: product.category }),
          /* @__PURE__ */ jsx("span", { className: "rounded-full bg-plateau-500 px-3 py-1 text-xs text-white", children: product.origin })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                className: "text-2xl font-semibold text-white transition hover:text-plateau-200",
                to: `/showcase/${product.id}`,
                children: product.name
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-slate-400", children: product.description })
          ] }),
          /* @__PURE__ */ jsx(Package, { className: "h-5 w-5 shrink-0 text-plateau-300" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap gap-2 text-xs", children: [
          /* @__PURE__ */ jsxs("span", { className: "rounded-full border border-white/10 px-3 py-1 text-slate-300", children: [
            "规格：",
            product.specs
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "rounded-full border border-white/10 px-3 py-1 text-slate-300", children: [
            "溯源码：",
            product.traceCode
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "零售价" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.pricing.retail })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "批发价" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.pricing.wholesale })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "礼盒价" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: product.pricing.gift })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center gap-3 text-sm text-slate-300", children: [
          /* @__PURE__ */ jsx(BadgeCheck, { className: "h-4 w-4 text-plateau-300" }),
          /* @__PURE__ */ jsx("span", { children: "展示型商城，不直接处理支付，统一转私域主理人承接咨询。" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "flex items-center justify-center gap-2 rounded-full bg-plateau-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-plateau-400",
              onClick: () => setSelectedProduct(product),
              type: "button",
              children: [
                /* @__PURE__ */ jsx(MessageCircleMore, { className: "h-4 w-4" }),
                "立即咨询"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              className: "flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10",
              to: `/showcase/${product.id}`,
              children: [
                /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }),
                "查看详情"
              ]
            }
          )
        ] })
      ] })
    ] }) }, product.id)) }),
    /* @__PURE__ */ jsxs("div", { className: "glass-card mt-8 flex items-center gap-4 p-6 text-slate-300", children: [
      /* @__PURE__ */ jsx(Sprout, { className: "h-8 w-8 text-plateau-300" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-6", children: "后续可在该模块继续接入 Supabase 或 Firebase 商品数据，实现商品发布、图片上传、价格策略管理与咨询线索归档。" })
    ] }),
    selectedProduct && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass-card w-full max-w-lg p-6 sm:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.2em] text-plateau-200", children: "Private Connect" }),
          /* @__PURE__ */ jsx("h3", { className: "mt-2 text-2xl font-semibold text-white", children: selectedProduct.name })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white",
            onClick: () => setSelectedProduct(null),
            type: "button",
            children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-6 text-slate-300", children: "为符合项目“不介入资金流转”的风险管控要求，当前页面不直接跳转支付。 如需购买、批发或定制礼盒，请通过私域主理人或牧民联系方式进一步沟通。" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr]", children: [
        /* @__PURE__ */ jsx(ModalQrCard, { name: selectedProduct.contact.owner }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "私域主理人" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: selectedProduct.contact.owner })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
              /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: "牧民 / 主理人联系方式" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-white", children: selectedProduct.contact.phone }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-slate-400", children: [
              "微信号：",
              selectedProduct.contact.wechat
            ] })
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
const DB_NAME = "plateau-tech-ranch";
const STORE_NAME = "upload-drafts";
const DRAFT_ID = "traceability-upload";
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveDraft(draft) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put(draft);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}
async function loadDraft() {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(DRAFT_ID);
    request.onsuccess = () => {
      database.close();
      resolve(request.result ?? null);
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}
async function clearDraft() {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(DRAFT_ID);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}
function formatFileSize(size) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
function getChunkSize(fileSize) {
  return Math.max(256 * 1024, Math.floor(fileSize * 0.12));
}
function TraceUploadCard() {
  const fileInputRef = useRef(null);
  const uploadTimerRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const [statusText, setStatusText] = useState("支持弱网环境下的资料暂存与恢复上传。");
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const progress = useMemo(() => {
    if (!(draft == null ? void 0 : draft.fileSize)) {
      return 0;
    }
    return Math.min(
      100,
      Math.round(draft.uploadedBytes / draft.fileSize * 100)
    );
  }, [draft]);
  const persistDraft = async (nextDraft) => {
    setDraft(nextDraft);
    await saveDraft(nextDraft);
  };
  const stopUploadLoop = () => {
    if (uploadTimerRef.current) {
      clearTimeout(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
  };
  useEffect(() => {
    let mounted = true;
    async function initializeDraft() {
      if (typeof indexedDB === "undefined") {
        setStatusText("当前环境不支持本地离线缓存，可继续使用普通上传。");
        return;
      }
      try {
        const cachedDraft = await loadDraft();
        if (!mounted || !cachedDraft) {
          return;
        }
        const normalizedDraft = cachedDraft.status === "uploading" ? { ...cachedDraft, status: "paused" } : cachedDraft;
        setDraft(normalizedDraft);
        if (cachedDraft.file) {
          setStatusText("检测到本地缓存的上传草稿，可直接继续上传。");
        }
      } catch {
        if (mounted) {
          setStatusText("本地缓存读取失败，请重新选择文件。");
        }
      }
    }
    initializeDraft();
    const handleOnline = () => {
      setIsOnline(true);
      setStatusText("网络已恢复，可继续断点续传。");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatusText("当前处于离线状态，上传进度已缓存在本地。");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      mounted = false;
      stopUploadLoop();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const continueUpload = async (baseDraft) => {
    if (!(baseDraft == null ? void 0 : baseDraft.file)) {
      setStatusText("未找到本地缓存文件，请重新选择上传资料。");
      return;
    }
    if (!isOnline) {
      const pausedDraft = { ...baseDraft, status: "paused" };
      await persistDraft(pausedDraft);
      setStatusText("当前离线，已保存上传进度，恢复网络后可继续。");
      return;
    }
    stopUploadLoop();
    const uploadingDraft = { ...baseDraft, status: "uploading" };
    await persistDraft(uploadingDraft);
    setStatusText("正在分片上传中，弱网中断后可继续从已完成片段恢复。");
    const chunkSize = getChunkSize(baseDraft.fileSize);
    const tick = async (currentDraft) => {
      if (!navigator.onLine) {
        const pausedDraft = { ...currentDraft, status: "paused" };
        await persistDraft(pausedDraft);
        setIsOnline(false);
        setStatusText("网络中断，上传已暂停，进度已写入本地缓存。");
        stopUploadLoop();
        return;
      }
      const nextUploadedBytes = Math.min(
        currentDraft.fileSize,
        currentDraft.uploadedBytes + chunkSize
      );
      const nextDraft = {
        ...currentDraft,
        uploadedBytes: nextUploadedBytes,
        status: nextUploadedBytes >= currentDraft.fileSize ? "completed" : "uploading",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await persistDraft(nextDraft);
      if (nextUploadedBytes >= currentDraft.fileSize) {
        setStatusText("上传完成，断点缓存已保留，可按需清除本地草稿。");
        stopUploadLoop();
        return;
      }
      uploadTimerRef.current = setTimeout(() => {
        void tick(nextDraft);
      }, 500);
    };
    await tick(uploadingDraft);
  };
  const handleFileChange = async (event) => {
    var _a;
    const file = (_a = event.target.files) == null ? void 0 : _a[0];
    if (!file) {
      return;
    }
    stopUploadLoop();
    const nextDraft = {
      id: DRAFT_ID,
      file,
      fileName: file.name,
      fileSize: file.size,
      uploadedBytes: 0,
      status: "cached",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      await persistDraft(nextDraft);
      setStatusText("文件已缓存到本地，可在弱网或离线状态下保留并稍后续传。");
    } catch {
      setStatusText("本地缓存失败，请检查浏览器是否支持 IndexedDB。");
    }
  };
  const handlePause = async () => {
    if (!draft) {
      return;
    }
    stopUploadLoop();
    const pausedDraft = { ...draft, status: "paused" };
    await persistDraft(pausedDraft);
    setStatusText("上传已暂停，当前进度已保存到本地。");
  };
  const handleClear = async () => {
    stopUploadLoop();
    await clearDraft();
    setDraft(null);
    setStatusText("本地上传草稿已清除。");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "溯源资料上传" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-slate-400", children: "适用于防疫证书、检疫扫描件、加工照片等资料上传。采用本地离线缓存 + 分片续传演示逻辑，应对高原弱网环境。" })
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${isOnline ? "border border-emerald-300/20 bg-emerald-500/10 text-emerald-200" : "border border-amber-300/20 bg-amber-500/10 text-amber-200"}`,
          children: [
            isOnline ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(WifiOff, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: isOnline ? "网络在线" : "当前离线" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "flex items-center justify-center gap-2 rounded-full bg-plateau-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-plateau-400",
              onClick: () => {
                var _a;
                return (_a = fileInputRef.current) == null ? void 0 : _a.click();
              },
              type: "button",
              children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
                "选择上传文件"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
              disabled: !draft,
              onClick: () => void continueUpload(draft),
              type: "button",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
                (draft == null ? void 0 : draft.uploadedBytes) ? "继续上传" : "开始上传"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
              disabled: !draft || draft.status !== "uploading",
              onClick: () => void handlePause(),
              type: "button",
              children: [
                /* @__PURE__ */ jsx(PauseCircle, { className: "h-4 w-4" }),
                "暂停"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: fileInputRef,
            className: "hidden",
            onChange: (event) => void handleFileChange(event),
            type: "file"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "当前状态" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-base font-medium text-white", children: (draft == null ? void 0 : draft.fileName) ?? "尚未选择文件" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "rounded-full border border-sky-300/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-200", children: (draft == null ? void 0 : draft.status) ?? "idle" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 h-3 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all",
              style: { width: `${progress}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "进度：",
              progress,
              "%"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "已上传：",
              draft ? `${formatFileSize(draft.uploadedBytes)} / ${formatFileSize(draft.fileSize)}` : "--"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-3xl border border-amber-300/20 bg-amber-500/10 p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-5 w-5 text-amber-200" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-amber-100", children: "离线缓存提示" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-amber-50/90", children: statusText })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(DatabaseZap, { className: "mt-0.5 h-5 w-5 text-emerald-200" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-emerald-100", children: "断点续传说明" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-emerald-50/90", children: "文件会先写入本地 IndexedDB 草稿区，网络中断时自动暂停，并从已完成进度继续上传。" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "w-full rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
            disabled: !draft,
            onClick: () => void handleClear(),
            type: "button",
            children: "清除本地上传草稿"
          }
        )
      ] })
    ] })
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
function IdentityItem({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: label }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-base font-medium text-white", children: value })
  ] });
}
function TraceabilityPage() {
  const defaultCode = traceabilityRecords[0].code;
  const [keyword, setKeyword] = useState(defaultCode);
  const [activeCode, setActiveCode] = useState(defaultCode);
  const record = useMemo(
    () => findTraceabilityRecord(activeCode) ?? traceabilityRecords[0],
    [activeCode]
  );
  const handleSearch = (event) => {
    event.preventDefault();
    setActiveCode(keyword.trim() || defaultCode);
  };
  const handleMockScan = () => {
    const nextCode = traceabilityRecords[0].code;
    setKeyword(nextCode);
    setActiveCode(nextCode);
  };
  return /* @__PURE__ */ jsxs("section", { className: "container-shell py-12 sm:py-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 max-w-4xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.25em] text-plateau-200", children: "Traceability" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-white sm:text-4xl", children: "轻量化可视化溯源大厅" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-slate-300", children: "用户可输入溯源编号或点击模拟扫码，查看产品“数字身份证”、牧场位置、实景照片墙、检疫证书与全流程时间轴。" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "glass-card p-6 sm:p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-semibold text-white", children: "溯源查询入口" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm leading-6 text-slate-400", children: [
          "演示编号：`",
          defaultCode,
          "`，可模拟二维码扫码录入。"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { className: "flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row", onSubmit: handleSearch, children: [
        /* @__PURE__ */ jsxs("label", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "w-full rounded-full border border-white/10 bg-slate-950/80 py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-plateau-400",
              onChange: (event) => setKeyword(event.target.value),
              placeholder: "请输入溯源编号或批次号",
              type: "text",
              value: keyword
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "rounded-full bg-plateau-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-plateau-400",
            type: "submit",
            children: "查询编号"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: "flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10",
            onClick: handleMockScan,
            type: "button",
            children: [
              /* @__PURE__ */ jsx(ScanLine, { className: "h-4 w-4" }),
              "模拟扫码"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "rounded-full bg-plateau-500/10 px-3 py-1 text-xs text-plateau-200", children: "数字身份证" }),
          /* @__PURE__ */ jsxs("span", { className: "rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300", children: [
            "编号：",
            record.code
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300", children: [
            "批次：",
            record.batchNo
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "mt-5 text-2xl font-semibold text-white", children: record.productName }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-7 text-slate-300", children: record.story }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: record.tags.map((tag) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "rounded-full border border-plateau-300/20 bg-plateau-500/10 px-3 py-1 text-xs text-plateau-100",
            children: tag
          },
          tag
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsx(IdentityItem, { label: "产地位置", value: record.origin }),
          /* @__PURE__ */ jsx(IdentityItem, { label: "加工企业", value: record.enterprise.name }),
          /* @__PURE__ */ jsx(IdentityItem, { label: "企业许可编号", value: record.enterprise.license }),
          /* @__PURE__ */ jsx(IdentityItem, { label: "联系信息", value: record.rancher.phone })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        TraceMapCard,
        {
          coordinates: record.coordinates,
          origin: record.origin
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-plateau-500/15 p-3 text-plateau-300", children: /* @__PURE__ */ jsx(UserRound, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "牧民 / 企业信息" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "核心主体与合作链路" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-plateau-200", children: [
              /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "源头牧民" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: record.rancher.name }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-400", children: record.rancher.role })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-plateau-200", children: [
              /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "合作企业" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-semibold text-white", children: record.rancher.company }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-slate-400", children: [
              "加工主体：",
              record.enterprise.name
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-plateau-200", children: [
              /* @__PURE__ */ jsx(ShieldPlus, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "认证说明" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-slate-300", children: "当前页面为轻量化示范版，后续可与 Supabase 或 Firebase 数据表联动，实现批次追踪、证书归档和多主体协同录入。" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(TraceTimeline, { items: record.timeline })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-plateau-500/15 p-3 text-plateau-300", children: /* @__PURE__ */ jsx(QrCode, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "养殖 / 加工实景照片墙" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "弱网场景下按需懒加载图片，减少首屏压力" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-3", children: record.photos.map((photo) => /* @__PURE__ */ jsxs("figure", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(
            LazyImage,
            {
              alt: photo.title,
              className: "aspect-[4/3]",
              src: photo.src
            }
          ),
          /* @__PURE__ */ jsx("figcaption", { className: "text-sm text-slate-300", children: photo.title })
        ] }, photo.title)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-card p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-plateau-500/15 p-3 text-plateau-300", children: /* @__PURE__ */ jsx(FileCheck2, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white", children: "防疫 / 检疫证书" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "支持扫描件归档展示" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: record.certificates.map((certificate) => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(
            LazyImage,
            {
              alt: certificate.title,
              className: "aspect-[4/3] border border-white/10",
              src: certificate.src
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-300", children: [
            /* @__PURE__ */ jsx(BadgeCheck, { className: "h-4 w-4 text-plateau-300" }),
            /* @__PURE__ */ jsx("span", { children: certificate.title })
          ] })
        ] }, certificate.title)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(TraceUploadCard, {}) })
  ] });
}
function App() {
  return /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsxs(Route, { element: /* @__PURE__ */ jsx(MainLayout, {}), children: [
      /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(HomePage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/traceability", element: /* @__PURE__ */ jsx(TraceabilityPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/showcase", element: /* @__PURE__ */ jsx(ShowcasePage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/showcase/:productId", element: /* @__PURE__ */ jsx(ProductDetailPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/apply-farmer", element: /* @__PURE__ */ jsx(ApplyFarmerPage, {}) }),
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
