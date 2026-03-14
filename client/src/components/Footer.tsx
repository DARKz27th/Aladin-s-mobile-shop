import { Link } from "wouter";
import { Wrench, Phone, MapPin, Clock, Facebook, MessageCircle, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white leading-none">Aladin</span>
                <span className="font-bold text-lg text-primary leading-none">Mobile</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              ร้านขายอะไหล่มือถือและรับซ่อมมือถือครบวงจร ช่างมืออาชีพ รับประกันงานซ่อม
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://line.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-green-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="tel:0812345678"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-4">บริการของเรา</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/products", label: "ขายอะไหล่มือถือ" },
                { href: "/repair", label: "จองคิวซ่อม" },
                { href: "/track", label: "ติดตามงานซ่อม" },
                { href: "/service-center", label: "ศูนย์บริการ" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="font-semibold text-white mb-4">ยี่ห้อที่รองรับ</h3>
            <ul className="space-y-2.5">
              {["Apple iPhone", "Samsung Galaxy", "OPPO", "Vivo", "Xiaomi", "Huawei"].map((brand) => (
                <li key={brand}>
                  <span className="text-sm text-gray-400">{brand}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:0812345678" className="hover:text-white transition-colors">081-234-5678</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:info@aladinmobile.com" className="hover:text-white transition-colors">
                  info@aladinmobile.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p>จันทร์ – เสาร์: 09:00 – 19:00</p>
                  <p>อาทิตย์: 10:00 – 17:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © 2024 AladinMobile. สงวนลิขสิทธิ์ทุกประการ
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
              นโยบายความเป็นส่วนตัว
            </span>
            <span className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
              เงื่อนไขการใช้บริการ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
