'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const socialIcon =
  'relative no-underline w-10 h-10 rounded-full flex items-center justify-center text-white ' +
  'transition-all duration-300 ease-out ' +
  'hover:-translate-y-1 hover:scale-110 ' +
  'hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]';

const linkStyle =
  'relative inline-block text-gray-400 transition-colors duration-300 ' +
  'hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] ' +
  'after:w-0 after:bg-gradient-to-r after:from-blue-400 after:to-indigo-500 ' +
  'after:transition-all after:duration-300 hover:after:w-full';

export default function Footer() {
  return (
    <footer className="bg-[#0b1220] text-gray-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-5 no-underline">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 
                              flex items-center justify-center text-white font-black text-lg shadow-lg">
                B
              </div>
              <span className="text-2xl font-semibold text-white tracking-tight">
                BookingApp
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Đặt homestay & biệt thự nghỉ dưỡng nhanh chóng, an toàn và đẳng cấp cho mọi chuyến đi.
            </p>

            {/* Social */}
            <div className="flex gap-4">
              <a
                href="#"
                className={`${socialIcon} bg-gradient-to-br from-blue-500 to-blue-700`}
              >
                <Facebook size={18} />
              </a>

              <a
                href="#"
                className={`${socialIcon} bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500`}
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                className={`${socialIcon} bg-gradient-to-br from-sky-400 to-sky-600`}
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              Khám phá
            </h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className={linkStyle}>Trang chủ</Link></li>
              <li><Link href="/about" className={linkStyle}>Về chúng tôi</Link></li>
              <li><Link href="/properties" className={linkStyle}>Danh sách phòng</Link></li>
              <li><Link href="/blog" className={linkStyle}>Cẩm nang du lịch</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              Hỗ trợ
            </h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/help" className={linkStyle}>Trung tâm trợ giúp</Link></li>
              <li><Link href="/terms" className={linkStyle}>Điều khoản sử dụng</Link></li>
              <li><Link href="/privacy" className={linkStyle}>Chính sách bảo mật</Link></li>
              <li><Link href="/properties/create" className={linkStyle}>Đăng tin cho thuê</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              Liên hệ
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <MapPin size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <span>Bitexco Tower, Quận 1, TP.HCM</span>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="text-blue-400 shrink-0" />
                <span>1900 1234 567</span>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="text-blue-400 shrink-0" />
                <span>contact@bookingapp.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row 
                        justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 BookingApp. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className={linkStyle}>Privacy</a>
            <a href="#" className={linkStyle}>Terms</a>
            <a href="#" className={linkStyle}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
