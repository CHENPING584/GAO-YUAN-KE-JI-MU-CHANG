import {
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  PauseCircle,
  RefreshCw,
  Upload,
  WifiOff,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const DB_NAME = 'plateau-tech-ranch';
const STORE_NAME = 'upload-drafts';
const DRAFT_ID = 'traceability-upload';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveDraft(draft) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
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
    const transaction = database.transaction(STORE_NAME, 'readonly');
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
    const transaction = database.transaction(STORE_NAME, 'readwrite');
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

export default function TraceUploadCard() {
  const fileInputRef = useRef(null);
  const uploadTimerRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const [statusText, setStatusText] = useState('支持弱网环境下的资料暂存与恢复上传。');
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  const progress = useMemo(() => {
    if (!draft?.fileSize) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((draft.uploadedBytes / draft.fileSize) * 100),
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
      if (typeof indexedDB === 'undefined') {
        setStatusText('当前环境不支持本地离线缓存，可继续使用普通上传。');
        return;
      }

      try {
        const cachedDraft = await loadDraft();
        if (!mounted || !cachedDraft) {
          return;
        }

        const normalizedDraft =
          cachedDraft.status === 'uploading'
            ? { ...cachedDraft, status: 'paused' }
            : cachedDraft;

        setDraft(normalizedDraft);
        if (cachedDraft.file) {
          setStatusText('检测到本地缓存的上传草稿，可直接继续上传。');
        }
      } catch {
        if (mounted) {
          setStatusText('本地缓存读取失败，请重新选择文件。');
        }
      }
    }

    initializeDraft();

    const handleOnline = () => {
      setIsOnline(true);
      setStatusText('网络已恢复，可继续断点续传。');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatusText('当前处于离线状态，上传进度已缓存在本地。');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mounted = false;
      stopUploadLoop();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const continueUpload = async (baseDraft) => {
    if (!baseDraft?.file) {
      setStatusText('未找到本地缓存文件，请重新选择上传资料。');
      return;
    }

    if (!isOnline) {
      const pausedDraft = { ...baseDraft, status: 'paused' };
      await persistDraft(pausedDraft);
      setStatusText('当前离线，已保存上传进度，恢复网络后可继续。');
      return;
    }

    stopUploadLoop();

    const uploadingDraft = { ...baseDraft, status: 'uploading' };
    await persistDraft(uploadingDraft);
    setStatusText('正在分片上传中，弱网中断后可继续从已完成片段恢复。');

    const chunkSize = getChunkSize(baseDraft.fileSize);

    const tick = async (currentDraft) => {
      if (!navigator.onLine) {
        const pausedDraft = { ...currentDraft, status: 'paused' };
        await persistDraft(pausedDraft);
        setIsOnline(false);
        setStatusText('网络中断，上传已暂停，进度已写入本地缓存。');
        stopUploadLoop();
        return;
      }

      const nextUploadedBytes = Math.min(
        currentDraft.fileSize,
        currentDraft.uploadedBytes + chunkSize,
      );

      const nextDraft = {
        ...currentDraft,
        uploadedBytes: nextUploadedBytes,
        status:
          nextUploadedBytes >= currentDraft.fileSize ? 'completed' : 'uploading',
        updatedAt: new Date().toISOString(),
      };

      await persistDraft(nextDraft);

      if (nextUploadedBytes >= currentDraft.fileSize) {
        setStatusText('上传完成，断点缓存已保留，可按需清除本地草稿。');
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
    const file = event.target.files?.[0];
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
      status: 'cached',
      updatedAt: new Date().toISOString(),
    };

    try {
      await persistDraft(nextDraft);
      setStatusText('文件已缓存到本地，可在弱网或离线状态下保留并稍后续传。');
    } catch {
      setStatusText('本地缓存失败，请检查浏览器是否支持 IndexedDB。');
    }
  };

  const handlePause = async () => {
    if (!draft) {
      return;
    }

    stopUploadLoop();
    const pausedDraft = { ...draft, status: 'paused' };
    await persistDraft(pausedDraft);
    setStatusText('上传已暂停，当前进度已保存到本地。');
  };

  const handleClear = async () => {
    stopUploadLoop();
    await clearDraft();
    setDraft(null);
    setStatusText('本地上传草稿已清除。');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">溯源资料上传</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            适用于防疫证书、检疫扫描件、加工照片等资料上传。采用本地离线缓存 +
            分片续传演示逻辑，应对高原弱网环境。
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
            isOnline
              ? 'border border-emerald-300/20 bg-emerald-500/10 text-emerald-200'
              : 'border border-amber-300/20 bg-amber-500/10 text-amber-200'
          }`}
        >
          {isOnline ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span>{isOnline ? '网络在线' : '当前离线'}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap gap-3">
            <button
              className="flex items-center justify-center gap-2 rounded-full bg-plateau-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-plateau-400"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Upload className="h-4 w-4" />
              选择上传文件
            </button>

            <button
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!draft}
              onClick={() => void continueUpload(draft)}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              {draft?.uploadedBytes ? '继续上传' : '开始上传'}
            </button>

            <button
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!draft || draft.status !== 'uploading'}
              onClick={() => void handlePause()}
              type="button"
            >
              <PauseCircle className="h-4 w-4" />
              暂停
            </button>
          </div>

          <input
            ref={fileInputRef}
            className="hidden"
            onChange={(event) => void handleFileChange(event)}
            type="file"
          />

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">当前状态</p>
                <p className="mt-1 text-base font-medium text-white">
                  {draft?.fileName ?? '尚未选择文件'}
                </p>
              </div>
              <span className="rounded-full border border-sky-300/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">
                {draft?.status ?? 'idle'}
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>进度：{progress}%</span>
              <span>
                已上传：
                {draft
                  ? `${formatFileSize(draft.uploadedBytes)} / ${formatFileSize(draft.fileSize)}`
                  : '--'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-amber-300/20 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-200" />
              <div>
                <p className="text-sm font-medium text-amber-100">离线缓存提示</p>
                <p className="mt-2 text-sm leading-6 text-amber-50/90">
                  {statusText}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5">
            <div className="flex items-start gap-3">
              <DatabaseZap className="mt-0.5 h-5 w-5 text-emerald-200" />
              <div>
                <p className="text-sm font-medium text-emerald-100">断点续传说明</p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/90">
                  文件会先写入本地 IndexedDB 草稿区，网络中断时自动暂停，并从已完成进度继续上传。
                </p>
              </div>
            </div>
          </div>

          <button
            className="w-full rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!draft}
            onClick={() => void handleClear()}
            type="button"
          >
            清除本地上传草稿
          </button>
        </div>
      </div>
    </div>
  );
}
