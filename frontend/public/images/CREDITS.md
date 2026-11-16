# CREDITS — Ảnh thật cho NEXORA

Ảnh được tìm bằng `/opt/hatch/bin/image-search`, preflight bằng `curl -I`
(User-Agent Mozilla, Referer cross-origin) và chỉ tải ảnh trả về HTTP 2xx
đúng `image/*`. Mọi ảnh đã được kiểm tra trực quan để khớp loại sản phẩm
trong `frontend/lib/mock-data.ts` (không sửa mock-data).

Ghi chú nguồn: công cụ image-search gần như không trả về ảnh Unsplash/Pexels
trực tiếp (chỉ có 1 URL Pexels cho ảnh bếp chung, không khớp sản phẩm), nên
các ảnh dưới đây lấy từ nguồn thương mại/blog có ảnh thật, đã qua preflight.
Một số ảnh có logo/thương hiệu khác với mock (ghi rõ ở cột Ghi chú) — nếu cần
"chuẩn brand" thì nên chụp ảnh sản phẩm thật của shop thay vì dùng ảnh mạng.

| File | Dùng cho (mock-data) | Nguồn (media_url đã tải) | Trang nguồn (page_url) | Ghi chú |
|---|---|---|---|---|
| `hero-shop.jpg` | Ảnh hero — chủ shop sau quầy | `https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI2LTAzL3NyLWltYWdlLTA1MDMyMDI2LWFtMDItcy0yNThfMS5qcGc.jpg` | https://www.rawpixel.com/search/market shaer | Chủ shop tạp hóa cười sau quầy, kệ hàng đầy — đúng vibe "chủ shop thật", nhưng là cửa hàng tạp hóa (không phải chuyên gia dụng) |
| `pos-counter.jpg` | Quầy POS — thu ngân quét mã | `https://www.weber-marking.com/assets/Uploads/Images/Stockphotos/2D-Codierung-Kasse-Bluhm-Systeme__FocusFillWyIwLjAwIiwiMC4wMCIsODAwLDUzM10_ExtRewriteWyJqcGVnIiwid2VicCJd.webp` (gốc WebP, đã convert sang JPG) | https://www.weber-marking.com/ | Thu ngân quét mã vạch, màn hình POS hiện rõ. Bối cảnh siêu thị (không phải cửa hàng gia dụng) |
| `product-airfryer.jpg` | PROD-01 — Nồi chiên không dầu Tefal 5.6L | `https://salt.tikicdn.com/ts/product/ad/fc/5e/43c607b46d1ee2c0f9c2a63bd0c873bb.jpg` | (không trả về trong kết quả image-search) | Nồi chiên đen, núm xoay cơ, tay cầm bạc |
| `product-airfryer-2.jpg` | PROD-02 — Nồi chiên không dầu Lock&Lock 5.2L | `https://i.ebayimg.com/00/s/ODAwWDgwMA==/z/4yUAAOSw0RZj~aBQ/$_12.JPG?set_id=880000500F` | https://www.bidbuy.co.kr/auctions/ebay/uk/item/air-fryer-5l-1450w-power-oven-healthy-cooker-non-stick-oil-free-low-fat-frying/185794189700 | Nồi chiên đen dáng bầu, núm hẹn giờ tròn — khác mẫu với ảnh 01 |
| `product-pan.jpg` | PROD-03 — Chảo xào chống dính Ceramic Elmich 28cm | `https://m.media-amazon.com/images/I/71-GGIGDPPL.jpg` | https://www.desertcart.ae/brand/etsair | Chảo chống dính đen, nền trắng, nhìn rõ lòng chảo |
| `product-pan-2.jpg` | PROD-04 — Chảo chiên vân đá Sunhouse 26cm | `https://www.noticias24hrs.com.ve/wp-content/uploads/2025/04/1200x655_sarten-sobre-los-fogones-apagados.jpg` | https://www.noticias24hrs.com.ve/el-utensilio-de-cocina-que-todos-utilizan-y-es-cancerigeno-segun-la-oms-que-precauciones-hay-que-tener-en-cuenta-detalles/ | Chảo đen trên bếp gas (ảnh lifestyle, không thấy vân đá) |
| `product-kettle.jpg` | PROD-05 — Ấm siêu tốc thủy tinh Philips 1.7L LED | `https://egbelektronik.com/idea/kq/25/myassets/products/787/crown-crw-7204-1500w-1-d72ffa.jpeg?revision=1761605263` (server trả WebP, đã convert sang JPG) | (không trả về trong kết quả image-search) | Ấm thủy tinh đang sôi, vạch MAX 1.8L (mock ghi 1.7L — lệch 0.1L, xem đề xuất đổi tên) |
| `product-kettle-inox.jpg` | PROD-06 — Ấm siêu tốc Inox 304 Sunhouse 1.8L | `https://www.bmielectronics.com/uploads/photobank5.jpg` | https://www.bmielectronics.com/stainless-steel-kettle/ | Ấm inox bóng, tay cầm đen, nền trắng |
| `product-blender.jpg` | PROD-07 — Máy xay sinh tố Sunhouse 3 cối thủy tinh | `https://asset.m-gs.kr/product/api/orgdesc/1123422831/pagedesk/mxt/resource/U9uA8QY6HVBi7OoaHHmT0MSj1eru8Losovh4gz-RzvRYghedb4Q9lQuc9ovSEq1XclXvoAOQJOk2NWSNLoA70xwa9y~hr7HEld6Iy1kTEGk_/dims/optimize` | (không trả về trong kết quả image-search) | Cối xay thủy tinh có vạch ml trên đế máy — chỉ thấy 1 cối, không thấy đủ "3 cối" |
| `product-blender-hand.jpg` | PROD-08 — Máy xay cầm tay Braun MultiQuick 5 1000W | `https://www.stick-blender.com/photo/ps154623674-powerful_quick_immersion_stick_blender_for_blending_chopping_pureeing.jpg` | https://www.stick-blender.com/sale-39474430-powerful-quick-immersion-stick-blender-for-blending-chopping-pureeing.html | Máy xay cầm tay inox, 2 nút bấm — đúng loại immersion blender |
| `product-rice-cooker.jpg` | PROD-10 — Nồi cơm điện tử nắp gài Panasonic 1.8L | `https://image.sourcingai.com/202f0j00ntTMoaFROypQ/Auto-Keep-Warm-Multi-Size-Electric-Rice-Cooker-for-Home-Use.jpg` | https://indonesian.sourcingai.com/smart-products/jieweishi/basic-mechanical-rice-cooker-with-keep-warm-function-for-household-MWqsTDAkphRG | Nồi cơm trắng nắp kính, nút COOK/WARM — dạng nắp gài cơ, giống PROD-10 hơn PROD-09 |
| `product-rice-cooker-2.jpg` | PROD-09 — Nồi cơm điện cao tần Cuckoo 1.8L | `https://www.astersonline.com/cdn/shop/files/44304-00_1200x1200.jpg?v=1770806964` (gốc WebP, đã convert sang JPG) | https://www.astersonline.com/collections/rice-cookers/products/midea-4-5l-electric-rice-cooker-black-silver-mb-fs5077 | Nồi cơm điện tử nắp mở, cơm bên trong, bảng điều khiển cảm ứng — thấy logo "Midea" (mock ghi Cuckoo) |
| `product-induction.jpg` | PROD-11 — Bếp từ đơn cảm ứng Bluestone ICB-6617 | `https://m.media-amazon.com/images/I/81tIPTbWDEL._AC_SX679_.jpg` | http://laurelandwolf.com/blogs/single-burner-induction-cooktops | Bếp từ đơn đen, chảo + bít tết, màn hình 2000 — thấy logo "Sunmaki" (mock ghi Bluestone) |
| `product-microwave.jpg` | PROD-12 — Lò vi sóng cơ có nướng Sharp 20L R-G222VN-S | `https://www.ikea.com/ca/en/images/products/tillreda-microwave-oven-white__1397935_pe967792_s5.jpg?f=xl` (gốc WebP, đã convert sang JPG) | https://www.ikea.com/ca/en/p/tillreda-portable-induction-cooktop-1-zone-white-10493520/ (page_url trả về là trang bếp từ IKEA, không khớp ảnh — ảnh là lò vi sóng TILLREDA) | Lò vi sóng trắng, 2 núm xoay cơ, trên bàn bếp gỗ — sạch, đúng loại "lò vi sóng cơ" |
| `store-shelf.jpg` | Kệ hàng cửa hàng gia dụng | `https://www.mohinani.com/Images/CompanyProject/10/26122023125023.jpg` | http://www.mohinani.com/home/vertical/3/consumer-durables-auto | Showroom gia dụng: ấm, nồi cơm, máy xay trên kệ + hộp Bosch — ảnh rộng 1920px, hợp làm banner/section cửa hàng |
| `packing-parcel.jpg` | Đóng gói / giao hàng | `https://blog.simplyparcel.sg/_next/image?url=https%3A%2F%2Fcsuxjmfbwmkxiegfpljm.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fblog-images%2Forganization-26843%2F1787387831067_Courier-sorting-packages-in-logistics-hub.jpeg&w=1920&q=75` (gốc WebP, đã convert sang JPG) | https://blog.simplyparcel.sg/ | Nhân viên xếp thùng carton lên băng chuyền, xe tải phía sau |

## Ảnh tìm không ra / phải thay thế

- **Quạt và ly giữ nhiệt**: mock-data KHÔNG có 2 sản phẩm này (12 sản phẩm thật là:
  2 nồi chiên, 2 chảo, 2 ấm, 2 máy xay, 2 nồi cơm, 1 bếp từ, 1 lò vi sóng).
  Vì vậy không tìm ảnh quạt/ly giữ nhiệt — nếu FE cần thì phải thêm sản phẩm vào
  mock trước, hoặc dùng ảnh gia dụng khác.
- **Ấm thủy tinh Philips (PROD-05)**: ứng viên đầu (kitchee.com.au) trả 404;
  ứng viên 2 (myhomedecorate.com) không phản hồi (empty reply); đã dùng ảnh
  egbelektronik (ấm thủy tinh đang sôi) — khớp loại, chỉ lệch vạch dung tích.
- **Ấm inox Sunhouse (PROD-06)**: ứng viên đầu (merhein.com) trả 429
  (rate-limit — không thử lại host này); đã dùng ảnh bmielectronics.
- **Máy xay Sunhouse (PROD-07)**: ứng viên đầu (alicdn) trả 403 (chặn hotlink);
  đã dùng ảnh m-gs.kr (chỉ thấy 1 cối thủy tinh).
- **Nồi cơm Cuckoo (PROD-09)**: ứng viên đầu (kitchenall.com) trả 404;
  đã dùng ảnh astersonline (Midea, nắp mở có cơm).
- **Ảnh hero gốc (Bank of Baroda)**: trả 404; đã dùng ảnh Rawpixel.
- **Lò vi sóng (PROD-12)**: ảnh đầu (kennesawappliancerepairga.com) tải được
  nhưng bố cục xấu (lò đặt trên máy giặt Samsung, đồ đạc chất trên nóc, thấy
  nhãn năng lượng + logo BGH); đã thay bằng ảnh IKEA TILLREDA trắng, sạch hơn.

## Đề xuất đổi tên sản phẩm trong mock (CHƯA sửa — chỉ đề xuất)

Không có trường hợp nào "ảnh chảo mà tên là ấm". Tất cả ảnh đều khớp LOẠI sản
phẩm. Chỉ có các lệch nhỏ về brand/dung tích in trên ảnh — nếu muốn khớp tuyệt
đối thì cân nhắc:

1. **PROD-05** `Ấm siêu tốc thủy tinh Philips 1.7L LED HD9339` → ảnh ghi vạch
   `MAX 1.8L` (không thấy đèn LED). Đề xuất: đổi thành
   `Ấm siêu tốc thủy tinh 1.8L` (bỏ "Philips 1.7L LED HD9339"), hoặc giữ tên
   và chấp nhận ảnh minh họa chung.
2. **PROD-09** `Nồi cơm điện cao tần Cuckoo 1.8L CRP-PK1000S` → ảnh thấy logo
   `Midea`. Đề xuất: đổi thành `Nồi cơm điện tử Midea 1.8L` (bỏ "cao tần
   Cuckoo CRP-PK1000S"), hoặc tìm/chụp ảnh Cuckoo thật.
3. **PROD-11** `Bếp từ đơn cảm ứng Bluestone ICB-6617 tặng chảo` → ảnh thấy
   logo `Sunmaki` trên mặt bếp và không thấy "tặng chảo" (chảo trong ảnh là
   chảo đang nấu). Đề xuất: đổi thành `Bếp từ đơn cảm ứng Sunmaki 2000W`
   (bỏ "Bluestone ICB-6617 tặng chảo").
4. **PROD-12** `Lò vi sóng cơ có nướng Sharp 20L R-G222VN-S` → ảnh là lò
   TILLREDA của IKEA, không thấy chức năng nướng. Đề xuất: đổi thành
   `Lò vi sóng cơ 20L` (bỏ "có nướng Sharp R-G222VN-S").
5. **PROD-07** `Máy xay sinh tố đa năng Sunhouse 3 cối thủy tinh` → ảnh chỉ
   thấy 1 cối. Đề xuất: đổi thành `Máy xay sinh tố cối thủy tinh`
   (bỏ "3 cối"), hoặc tìm ảnh bộ 3 cối.
6. **PROD-04** `Chảo chiên vân đá siêu bền Sunhouse 26cm` → ảnh là chảo đen
   trơn trên bếp, không thấy vân đá. Đề xuất: đổi thành
   `Chảo chống dính Sunhouse 26cm` (bỏ "vân đá siêu bền").

Các sản phẩm còn lại (PROD-01, 02, 03, 06, 08, 10) ảnh khớp loại và không lộ
brand đối nghịch — không cần đổi tên.
