"use client";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// --- CẤU HÌNH STRIPE ---
// 1. Thay dòng này bằng Publishable Key của bạn (Lấy trên dashboard Stripe)
const stripePromise = loadStripe("pk_test_51SvHoJBqUSYgzBdghhdtmIKumtivpjCgNiYaAdCKrsU4vauldZeRsGMNv9IJWzLUC4wexg6wPgrSLmmIkHz9kHDF00ppBkT21P");

// Component con: Form nhập thẻ
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Sau khi thanh toán xong sẽ quay về trang chủ
        return_url: "http://localhost:3000/", 
      },
    });

    if (error) setMessage(error.message || "Có lỗi xảy ra");
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <PaymentElement />
      {message && <div className="text-red-500 text-sm">{message}</div>}
      <button 
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200"
      >
        {isProcessing ? "Đang xử lý..." : "Hoàn tất đặt phòng"}
      </button>
    </form>
  );
}

// Component chính: Trang Checkout
export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");

  // 2. Gọi Backend để lấy 'clientSecret' khi vừa vào trang
  useEffect(() => {
    // Lưu ý: Đảm bảo Backend bạn đang chạy ở cổng 3000 hoặc cổng nào đó (kiểm tra terminal backend)
    // Nếu Backend chạy cổng 3000 thì URL này đúng.
    fetch("http://localhost:3000/payment/create-intent", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 500000 }), // Giả lập thanh toán 500k
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => console.error("Lỗi gọi backend:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- CỘT TRÁI (70%): FORM NHẬP LIỆU --- */}
        <div className="md:col-span-2 space-y-6">
          {/* Box 1: Thông tin khách */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Thông tin khách hàng</h2>
            <div className="grid grid-cols-2 gap-4">
               <input placeholder="Họ *" className="border p-2 rounded w-full" />
               <input placeholder="Tên *" className="border p-2 rounded w-full" />
               <input placeholder="Email *" className="border p-2 rounded w-full col-span-2" />
            </div>
          </div>

          {/* Box 2: Thanh toán */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Thanh toán an toàn</h2>
            
            {/* Form thẻ chỉ hiện khi kết nối được Backend */}
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Đang tải cổng thanh toán... <br/>
                <span className="text-xs text-red-400">(Nếu đợi lâu, hãy kiểm tra xem Backend đã bật CORS chưa)</span>
              </div>
            )}
          </div>
        </div>

        {/* --- CỘT PHẢI (30%): TÓM TẮT --- */}
        <div className="md:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-4">
            <h3 className="font-bold text-lg mb-2">Grand Hotel Saigon</h3>
            <div className="text-yellow-500 text-xs mb-3">★★★★★</div>
            
            <div className="border-t border-b py-3 my-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Nhận phòng:</span><b>30/01/2026</b></div>
                <div className="flex justify-between"><span>Trả phòng:</span><b>31/01/2026</b></div>
            </div>

            <div className="flex justify-between items-end">
              <span className="font-bold text-lg">Tổng cộng</span>
              <span className="font-bold text-2xl text-blue-600">500.000 ₫</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}