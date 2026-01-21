import Image from 'next/image';
import { useState } from 'react';
import ImageModal from './ImageModal';

interface PropertyGalleryProps {
  images: string[];
}

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const [open, setOpen] = useState(false);
  const mainImg = images[0];
  const rightTop = images[1];
  const rightBottom = images[2];
  const bottomImgs = images.slice(3, 7);
  const moreCount = images.length - 7;
  const moreImg = images[7];

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Hàng trên: Ảnh lớn + 2 ảnh nhỏ dọc bên phải */}
        <div className="flex gap-4 h-[300px]">
          {/* Ảnh lớn bên trái */}
          <div className="flex-1 rounded-2xl overflow-hidden relative shadow-lg">
            {mainImg && (
              <Image src={mainImg} alt="Main" fill className="object-cover" />
            )}
          </div>
          {/* 2 ảnh nhỏ dọc bên phải */}
          <div className="flex flex-col gap-4 w-[260px]">
            {rightTop && (
              <div className="rounded-2xl overflow-hidden h-[145px] relative shadow-md">
                <Image src={rightTop} alt="Right Top" fill className="object-cover" />
              </div>
            )}
            {rightBottom && (
              <div className="rounded-2xl overflow-hidden h-[145px] relative shadow-md">
                <Image src={rightBottom} alt="Right Bottom" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>
        {/* Hàng dưới: 4 ảnh nhỏ full width */}
        <div className="flex gap-4 h-[80px]">
          {bottomImgs.map((img, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden flex-1 relative shadow">
              <Image src={img} alt={`Bottom ${idx}`} fill className="object-cover" />
            </div>
          ))}
          {/* Nếu còn nhiều ảnh, hiện ô "+N ảnh" */}
          {moreCount > 0 && moreImg && (
            <div
              className="rounded-2xl overflow-hidden flex-1 relative shadow cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <Image src={moreImg} alt="More" fill className="object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span className="text-white text-lg font-bold drop-shadow">+{moreCount} ảnh</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal hiển thị toàn bộ ảnh */}
      <ImageModal
        open={open}
        images={images}
        index={7}
        onClose={() => setOpen(false)}
      />
    </>
  );
}