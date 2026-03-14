import { MapPin, Phone, Clock, Facebook, MessageCircle, Mail, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapView } from "@/components/Map";

const SHOP_LAT = 13.7563;
const SHOP_LNG = 100.5018;

export default function ServiceCenter() {
  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container py-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">ศูนย์บริการ</h1>
          <p className="text-muted-foreground">ข้อมูลร้านและช่องทางการติดต่อ</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            {/* Address */}
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ที่อยู่ร้าน</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      123 ถนนสุขุมวิท แขวงคลองเตย<br />
                      เขตคลองเตย กรุงเทพมหานคร 10110
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 text-xs gap-1.5"
                      onClick={() => window.open(`https://maps.google.com/?q=${SHOP_LAT},${SHOP_LNG}`, "_blank")}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      นำทาง
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-3">เวลาทำการ</h3>
                    <div className="space-y-2">
                      {[
                        { day: "จันทร์ – ศุกร์", time: "09:00 – 19:00", open: true },
                        { day: "เสาร์", time: "09:00 – 19:00", open: true },
                        { day: "อาทิตย์", time: "10:00 – 17:00", open: true },
                      ].map((item) => (
                        <div key={item.day} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{item.day}</span>
                          <span className={`font-medium ${item.open ? "text-green-600" : "text-red-500"}`}>
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-border/60">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-4">ช่องทางติดต่อ</h3>
                <div className="space-y-3">
                  <a
                    href="tel:0812345678"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">โทรศัพท์</p>
                      <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        081-234-5678
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://line.me/ti/p/~aladinmobile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LINE</p>
                      <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        @aladinmobile
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://facebook.com/aladinmobile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Facebook className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Facebook</p>
                      <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        AladinMobile
                      </p>
                    </div>
                  </a>

                  <a
                    href="mailto:info@aladinmobile.com"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">อีเมล</p>
                      <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        info@aladinmobile.com
                      </p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="border-border/60 overflow-hidden h-full min-h-[400px]">
              <CardContent className="p-0 h-full">
                <MapView
                  className="w-full h-full min-h-[400px]"
                  onMapReady={(map) => {
                    const marker = new google.maps.Marker({
                      position: { lat: SHOP_LAT, lng: SHOP_LNG },
                      map,
                      title: "AladinMobile",
                    });
                    const infoWindow = new google.maps.InfoWindow({
                      content: `
                        <div style="padding: 8px;">
                          <strong style="font-size: 14px;">AladinMobile</strong><br/>
                          <span style="font-size: 12px; color: #666;">ร้านขายอะไหล่และรับซ่อมมือถือ</span><br/>
                          <span style="font-size: 12px; color: #666;">123 ถนนสุขุมวิท กรุงเทพฯ</span>
                        </div>
                      `,
                    });
                    marker.addListener("click", () => infoWindow.open(map, marker));
                    infoWindow.open(map, marker);
                    map.setCenter({ lat: SHOP_LAT, lng: SHOP_LNG });
                    map.setZoom(16);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
