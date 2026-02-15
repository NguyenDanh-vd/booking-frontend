"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { apiPost } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Home,
  Loader2,
  MapPin,
  Plus,
  Upload,
  X,
} from "lucide-react";

export default function CreatePropertyPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    pricePerNight: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    if (selectedFiles.length + filesArray.length > 5) {
      toast.error("Chỉ được đăng tối đa 5 ảnh");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...filesArray]);
    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const removedUrl = previewUrls[index];
    if (removedUrl) URL.revokeObjectURL(removedUrl);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để đăng tin");
      router.push("/login");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 ảnh minh họa");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("address", formData.address);
      payload.append("pricePerNight", formData.pricePerNight);
      selectedFiles.forEach((file) => payload.append("images", file));

      await apiPost("/properties", payload);

      toast.success("Đăng tin thành công");
      router.push("/my-properties");
    } catch (error: unknown) {
      let msg = "Lỗi khi đăng tin. Vui lòng thử lại.";
      if (error instanceof AxiosError) {
        const backendMsg = error.response?.data?.message;
        msg = Array.isArray(backendMsg) ? backendMsg[0] : backendMsg || msg;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-7 shadow-xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Đăng chỗ nghỉ mới</h1>
              <p className="mt-2 text-slate-200">
                Tạo tin chuyên nghiệp để thu hút khách đặt phòng nhanh hơn.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-blue-50"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Home size={18} className="text-blue-600" />
                Tên chỗ nghỉ
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Villa Đà Lạt view đồi thông..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin size={18} className="text-red-500" />
                Địa chỉ chi tiết
              </label>
              <input
                type="text"
                required
                placeholder="Số nhà, đường, phường, thành phố..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <DollarSign size={18} className="text-emerald-600" />
                Giá mỗi đêm (VND)
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Nhập giá tiền..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText size={18} className="text-slate-500" />
                Mô tả chi tiết
              </label>
              <textarea
                required
                rows={5}
                placeholder="Mô tả tiện nghi, không gian và điểm nổi bật của chỗ nghỉ..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-xl font-bold text-slate-900">Hình ảnh</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Đã chọn: {selectedFiles.length}/5
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-slate-600 transition hover:bg-red-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {previewUrls.length < 5 && (
                <label className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600">
                  <div className="rounded-full bg-slate-100 p-3 transition group-hover:bg-blue-100">
                    <Upload size={24} />
                  </div>
                  <span className="mt-2 text-xs font-semibold">Thêm ảnh</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold text-white transition ${
              loading
                ? "cursor-not-allowed bg-slate-400"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Plus size={20} />
                Đăng tin ngay
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Bằng việc đăng tin, bạn đồng ý với các điều khoản dịch vụ của BookingApp.
          </p>
        </form>
      </div>
    </div>
  );
}
