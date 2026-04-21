import { ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function LazyImage({ src, alt, className = '' }) {
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden rounded-3xl bg-slate-900 ${className}`}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <ImageIcon className="h-8 w-8" />
            <span className="text-sm">图片按需加载中</span>
          </div>
        </div>
      )}

      {visible && (
        <img
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          src={src}
        />
      )}
    </div>
  );
}
