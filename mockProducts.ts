// Script: mockProducts.ts
// เพิ่มสินค้า mock 15 รายการลงฐานข้อมูลผ่านฟังก์ชัน createProduct

import { createProduct } from "./server/db.ts";

async function main() {
  const mockProducts = Array.from({ length: 15 }).map((_, i) => ({
    name: `สินค้า Mock ${i + 1}`,
    description: `รายละเอียดสินค้า Mock ${i + 1}`,
    brand: ["Samsung", "Apple", "Xiaomi", "Oppo", "Vivo"][i % 5],
    model: `M${1000 + i}`,
    categoryId: ((i % 2) + 1), // 1 หรือ 2 (หน้าจอ/แบตเตอรี่)
    price: (1000 + i * 100).toFixed(2),
    stock: 10 + i,
    imageUrl: `https://placehold.co/400x400?text=Mock+${i + 1}`,
    isActive: true,
  }));

  for (const p of mockProducts) {
    await createProduct(p);
    console.log(`เพิ่มสินค้า: ${p.name}`);
  }
  console.log("เพิ่มสินค้า mock ครบ 15 รายการแล้ว");
}

main().catch(console.error);
