'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  images: string[];
  index: number;
  onClose: () => void;
}

export default function ImageModal({
  open,
  images,
  index,
  onClose,
}: Props) {
  const [current, setCurrent] = useState(index);
  const [touchX, setTouchX] = useState<number | null>(null);

  useEffect(() => {
    setCurrent(index);
  }, [index]);

  if (!open) return null;

  // Mobile swipe
  const onTouchStart = (e: React.TouchEvent) =>
    setTouchX(e.touches[0].clientX);

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchX) return;
    const diff = touchX - e.changedTouches[0].clientX;
    if (diff > 50 && current < images.length - 1)
      setCurrent((c) => c + 1);
    if (diff < -50 && current > 0)
      setCurrent((c) => c - 1);
    setTouchX(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white"
      >
        <X size={28} />
      </button>

      {/* Nút mũi tên trái */}
      {images.length > 1 && (
        <button
          className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-4xl px-2 py-1 bg-black/30 rounded-full hover:bg-black/60 transition"
          onClick={() => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1))}
        >
          &#8249;
        </button>
      )}

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative w-full max-w-5xl aspect-[16/10]"
      >
        <Image
          src={images[current]}
          alt="Gallery"
          fill
          className="object-contain"
        />
      </div>

      {/* Nút mũi tên phải */}
      {images.length > 1 && (
        <button
          className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-4xl px-2 py-1 bg-black/30 rounded-full hover:bg-black/60 transition"
          onClick={() => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0))}
        >
          &#8250;
        </button>
      )}

      {/* Indicator */}
      <div className="absolute bottom-6 flex gap-2">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === current ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
