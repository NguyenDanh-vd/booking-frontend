'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPatch } from '@/utils/api';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  ArrowLeft, Save, Home, MapPin, DollarSign,
  FileText, Loader2, Camera, X
} from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface IProperty {
  id: number;
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
  images: string[];
}

interface PropertyFormData {
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const MAX_FILE_SIZE_MB = 5;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isDirty, setIsDirty] = useState(false); 

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    pricePerNight: 0,
    address: '',
  });

  const previewUrlsRef = useRef<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Load dữ liệu cũ
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setFetching(true);
        const res = await apiGet<IProperty>(`/properties/${propertyId}`);

        if (res) {
          setFormData({
            title: res.title,
            description: res.description || '',
            pricePerNight: res.pricePerNight ?? 0,
            address: res.address,
          });
          setExistingImages(res.images || []);
        }
      } catch {
        toast.error('Không tìm thấy thông tin chỗ nghỉ');
        router.push('/my-properties');
      } finally {
        setFetching(false);
      }
    };

    if (propertyId) fetchProperty();
  }, [propertyId, router]);

  // Cập nhật ref để cleanup sau này
  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  // Cleanup URL.createObjectURL
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

 // Cảnh báo khi rời trang nếu có thay đổi chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Upload + compress ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsDirty(true); 

    const files = Array.from(e.target.files);
    const compressedFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
        toast.error(`Ảnh ${file.name} vượt quá ${MAX_FILE_SIZE_MB}MB`);
        continue;
      }

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        compressedFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch {
        toast.error(`Không nén được ảnh ${file.name}`);
      }
    }

    setNewFiles((prev) => [...prev, ...compressedFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };
 // Xoá ảnh
  const removeNewImage = (index: number) => {
    setIsDirty(true); // ✅ NEW
    URL.revokeObjectURL(previewUrls[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Xoá ảnh đã lưu
  const removeExistingImage = (index: number) => {
    setIsDirty(true); // ✅ NEW
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('address', formData.address);
      data.append('pricePerNight', formData.pricePerNight.toString());

      newFiles.forEach((file) => data.append('images', file));
      existingImages.forEach((url) => data.append('existingImages', url));

      await apiPatch(`/properties/${propertyId}`, data);

      setIsDirty(false); // ✅ RESET
      toast.success('Cập nhật thành công!');
      router.push('/my-properties');
    } catch (error) {
      const err = error as AxiosError<{ message: string | string[] }>;
      const msg = err.response?.data?.message || 'Lỗi hệ thống';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }


  return (
     <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => {
            if (isDirty && !confirm('Bạn chưa lưu thay đổi. Rời trang?')) return;
            router.back();
          }}
          className="flex items-center gap-2 text-gray-500 mb-6"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          <div className="bg-gray-900 p-8 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Edit3Icon /> Chỉnh sửa thông tin
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Cập nhật thông tin: {formData.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* --- KHU VỰC ẢNH --- */}
            <div className="space-y-4">
              <label className="font-bold text-gray-700 flex items-center gap-2">
                <Camera size={18} className="text-blue-600" /> Hình ảnh
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Ảnh cũ */}
                {existingImages.map((url, index) => (
                  <div key={`old-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <Image src={url} alt="Old" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1.5 shadow-md hover:bg-red-500 hover:text-white transition z-10"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 text-white text-[10px] py-1 text-center font-bold">
                      Đã lưu
                    </div>
                  </div>
                ))}

                {/* Ảnh mới */}
                {previewUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-500 group">
                    <Image src={url} alt="New Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition z-10"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white text-[10px] py-1 text-center font-bold">
                      Mới thêm
                    </div>
                  </div>
                ))}

                {/* Nút thêm ảnh */}
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center cursor-pointer transition text-gray-400 hover:text-blue-600 gap-2">
                  <Camera size={32} />
                  <span className="text-xs font-bold">Thêm ảnh</span>
                  <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* --- CÁC TRƯỜNG TEXT --- */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-bold text-gray-700 flex items-center gap-2">
                  <Home size={18} className="text-blue-600" /> Tên chỗ nghỉ
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-gray-700 flex items-center gap-2">
                  <MapPin size={18} className="text-red-500" /> Địa chỉ
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-gray-700 flex items-center gap-2">
                  <DollarSign size={18} className="text-green-600" /> Giá mỗi đêm (VNĐ)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.pricePerNight}
                  onChange={(e) => 
                    setFormData({ 
                      ...formData, 
                      pricePerNight: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition font-bold text-lg text-gray-800"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-gray-700 flex items-center gap-2">
                  <FileText size={18} className="text-purple-500" /> Mô tả chi tiết
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Lưu thay đổi
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

function Edit3Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
  )
}