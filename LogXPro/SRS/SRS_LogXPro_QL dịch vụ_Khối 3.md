# **TÀI LIỆU TỔNG HỢP SRS \- MODULE K3:**

**THÁP ĐIỀU PHỐI**

*(Software Requirements Specification — SRS)*

 

 

 

| Thuộc tính | Giá trị |
| :---: | :---: |
| Mã tài liệu | LogXPro — Module K3: Tháp Điều Phối |
| Phiên bản | 1.0 |
| Ngày phát hành | 07/09/2026 |
| Người soạn thảo | Phạm Thị Hương |

 

#  

#  

#  

#      

# 

#  **MỤC LỤC** {#mục-lục}

[**TÀI LIỆU TỔNG HỢP SRS \- MODULE K3:	1**](#heading=h.evqsnsc0aou2)

[**MỤC LỤC	2**](#mục-lục)

[**BẢNG THUẬT NGỮ (Glossary)	4**](#bảng-thuật-ngữ-\(glossary\))

[**I. TỔNG QUAN THÁP ĐIỀU PHỐI	6**](#i.-tổng-quan-tháp-điều-phối)

[**1.1. Tổng quan & Phạm vi	6**](#1.1.-tổng-quan-&-phạm-vi)

[1.1.1. Mục tiêu	6](#1.1.1.-mục-tiêu)

[1.1.2. Phạm vi	6](#1.1.2.-phạm-vi)

[**1.2. Sơ đồ luồng nghiệp vụ (Business Process Flow)	7**](#1.2.-sơ-đồ-luồng-nghiệp-vụ-\(business-process-flow\))

[**1.3. Kiến trúc phân quyền (RBAC)	9**](#1.3.-kiến-trúc-phân-quyền-\(rbac\))

[**1.4. Quy tắc nghiệp vụ toàn cục (Global Business Rules)	11**](#1.4.-quy-tắc-nghiệp-vụ)

[**1.5. Yêu cầu phi chức năng chung	14**](#1.5.-yêu-cầu-phi-chức-năng-chung)

[1.5.1. Giả định, Ràng buộc & Phụ thuộc	15](#1.5.1.-giả-định,-ràng-buộc-&-phụ-thuộc)

[1.5.2. Ràng buộc chung cho trường "Chứng từ lô hàng"	16](#1.5.2.-ràng-buộc-chung-cho-trường-"chứng-từ-lô-hàng")

[**1.6. Cấu trúc dùng chung: Điều phối nhà thầu & Chi phí dịch vụ con	17**](#1.6.-cấu-trúc-dùng-chung:-điều-phối-nhà-thầu-&-chi-phí-dịch-vụ-con)

[1.6.1. Modal "Khu điều phối nhà thầu AVL"	17](#1.6.5.-modal-"khu-điều-phối-nhà-thầu-avl")

[1.6.2. Tab "Chi phí" (trong mỗi card dịch vụ con)	20](#heading=h.1q7k0ykgt9ps)

[1.6.3. Biến thể màn "Danh sách Dịch vụ" theo 5 vai trò Coordinator	26](#1.6.7.-biến-thể-màn-"danh-sách-dịch-vụ"-theo-5-vai-trò-coordinator)

[**1.7. Use Case dùng chung cho 4 dịch vụ con (HQ Giám sát, Vận tải, Sang tải, Kho bãi)	27**](#heading=h.xl79d1xgidjo)

[1.7.1. UC chung: Điều phối nhà thầu	28](#heading=h.gekc46iwd4h3)

[1.7.2. UC chung: Bắt đầu thực hiện (có khóa theo thứ tự Chặng)	29](#heading=h.hll7ewy93sni)

[**II. TRƯỞNG ĐIỀU PHỐI-CONSIGNMENT CONTROLLER	30**](#ii.-trưởng-điều-phối-consignment-controller)

[**2.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)	30**](#2.1.-sơ-đồ-luồng-nghiệp-vụ-\(business-process-flow\))

[**2.2. Danh sách Use Case	32**](#heading=h.m4o6bzpr6u6w)

[**2.3. Mô tả giao diện — Bảng field	36**](#2.2.-mô-tả-giao-diện-—-bảng-field)

[**2.4. Quy tắc nghiệp vụ (Business Rule)	46**](#2.3.-quy-tắc-nghiệp-vụ-\(business-rule\))

[**III. KHAI BÁO HẢI QUAN	47**](#iii.-khai-báo-hải-quan)

[**3.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)	47**](#3.1.-sơ-đồ-luồng-nghiệp-vụ-\(business-process-flow\))

[**3.2. Danh sách Use Case	48**](#heading=h.1xt6g3vcivg)

[**3.3 Mô tả giao diện — Bảng field	52**](#heading=h.ss7q2txmr5t2)

[**3.4. Quy tắc nghiệp vụ (Business Rule)	55**](#3.3.-quy-tắc-nghiệp-vụ-\(business-rule\))

[**3.5. Danh sách thông báo và lỗi	56**](#heading=h.xdfekkujgcyv)

[**IV.HẢI QUAN GIÁM SÁT	56**](#iv.hải-quan-giám-sát)

[**4.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)	56**](#4.1.-sơ-đồ-luồng-nghiệp-vụ-\(business-process-flow\))

[**4.2. Danh sách Use Case	58**](#heading=h.j9tn0dbx5szb)

[**4.3. Mô tả giao diện — Bảng field	62**](#4.2.-mô-tả-giao-diện-—-bảng-field)

[**4.4. Quy tắc nghiệp vụ (Business Rule)	63**](#4.3.-quy-tắc-nghiệp-vụ-\(business-rule\))

[**4.5. Danh sách thông báo và lỗi	63**](#heading=h.3lazs1uzwmxj)

[**V.VẬN TẢI	64**](#v.vận-tải)

[**5.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)	64**](#5.1.-sơ-đồ-luồng-nghiệp-vụ-\(business-process-flow\))

[**5.2. Danh sách Use Case	65**](#heading=h.pyrzmfgdg4t4)

[**5.3. Mô tả giao diện — Bảng field	70**](#5.2.-mô-tả-giao-diện-—-bảng-field)

[**5.4. Quy tắc nghiệp vụ (Business Rule)	73**](#5.3.-quy-tắc-nghiệp-vụ-\(business-rule\))

[**5.5. Danh sách thông báo và lỗi	73**](#heading=h.1s9yky7pphxc)

[**VI.SANG TẢI	74**](#vi.sang-tải)

[**6.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)	74**](#6.1.-sơ-đồ-luồng-nghiệp-vụ-\(business-process-flow\))

[**6.2. Danh sách Use Case	75**](#heading=h.kik8evuo0x20)

[**6.3. Mô tả giao diện — Bảng field	79**](#6.2.-mô-tả-giao-diện-—-bảng-field)

[**6.4. Quy tắc nghiệp vụ (Business Rule)	82**](#6.3.-quy-tắc-nghiệp-vụ-\(business-rule\))

[**6.5. Danh sách thông báo và lỗi	83**](#heading=h.ce5h133dp4v9)

[**VII. KHO BÃI	83**](#vii.-kho)

[**7.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)	83**](#7.1.-sơ-đồ-luồng-nghiệp-vụ-\(business-process-flow\))

[**7.2. Danh sách Use Case	84**](#heading=h.xpdtfn7qt84b)

[**7.3. Mô tả giao diện — Bảng field	88**](#7.2.-mô-tả-giao-diện-—-bảng-field)

[**7.4. Quy tắc nghiệp vụ (Business Rule)	91**](#7.3.-quy-tắc-nghiệp-vụ-\(business-rule\))

[**7.5. Danh sách thông báo và lỗi	91**](#heading=h.v9wnx8vuue97)

[**VIII. PHỤ LỤC A — BẢNG TỔNG HỢP TOÀN BỘ BUSINESS RULE	92**](#heading=h.cqzp861unusk)

# **BẢNG THUẬT NGỮ (Glossary)** {#bảng-thuật-ngữ-(glossary)}

| Viết tắt/Thuật ngữ | Giải thích |
| :---- | :---- |
| K1 | Bộ phận Sales/KAM (Key Account Manager) — tạo Phiếu dịch vụ ban đầu, sở hữu Doanh thu bán |
| K2 | Bộ phận Pricing — định giá, xây dựng Rate Sheet |
| K3 | Tháp Điều Phối (Control Tower) — điều phối & giám sát vận hành, chủ thể của tài liệu này |
| K4 | Bộ phận Cost Approval — duyệt chi phí gốc, quản lý Approved Vendor List (AVL) |
| K5 | Bộ phận Compliance/Finance — đối soát công nợ, xuất hóa đơn, chốt doanh thu |
| CC | Consignment Controller — Trưởng nhóm Tháp Điều Phối, không thao tác dịch vụ con |
| Coordinator | Điều phối viên dịch vụ con (Customs Declaration/Supervision, Transport, Transload, Warehouse) |
| AVL | Approved Vendor List — danh sách nhà thầu đã được K4 duyệt |
| SSOT | Single Source of Truth — nguồn dữ liệu gốc duy nhất, các nơi khác chỉ đọc/tham chiếu |
| RACI | Responsible/Accountable/Consulted/Informed — mô hình phân quyền trách nhiệm phê duyệt |
| Công cụ tính Chặng (Leg Engine) | Bộ máy tự động tính cấu trúc Chặng dựa trên Loại hình XNK \+ Điểm đi/đến |
| Chặng (Leg) | Một đoạn trong hành trình vận chuyển, chứa 1+ dịch vụ con |
| RULE-NK-01/02/03 | 3 quy tắc sinh cấu trúc Chặng cho Loại hình Nhập khẩu |
| RULE-XK-01/02 | 2 quy tắc sinh cấu trúc Chặng cho Loại hình Xuất khẩu |
| VNACCS | Hệ thống thông quan điện tử hải quan Việt Nam — do nhà thầu Customs Broker thao tác ngoài LogXPro |
| VAS | Value-Added Service — Dịch vụ giá trị gia tăng tại kho (đóng gói lại, quấn màng co, dán nhãn phụ, kiểm đếm chi tiết) |
| Customs Broker | Nhà thầu thực hiện khai báo hải quan thực tế trên VNACCS |
| Demurrage | Phí lưu container quá hạn tại cảng/bãi |
| P\&L | Profit & Loss — Doanh thu, Chi phí, Lợi nhuận gộp theo từng Phiếu dịch vụ |
| Margin | Tỷ lệ Lợi nhuận gộp / Doanh thu, tính theo % |

 

# **I. TỔNG QUAN THÁP ĐIỀU PHỐI** {#i.-tổng-quan-tháp-điều-phối}

# **1.1. Tổng quan & Phạm vi** {#1.1.-tổng-quan-&-phạm-vi}

## 1.1.1. Mục tiêu {#1.1.1.-mục-tiêu}

Module K3 — Tháp Điều Phối là phân hệ điều hành vận hành trung tâm của nền tảng logistics 4PL LogXPro, chịu trách nhiệm điều phối, giám sát và theo dõi tiến độ thực hiện các Phiếu Dịch vụ (Service Orders) do K1 (Sales/KAM) tạo lập. K3 đóng vai trò "tháp điều khiển" — không tự thực hiện công việc vật lý mà điều phối các nhà thầu/vendor bên ngoài thực hiện, đồng thời giádim sát tiến độ theo thời gian thực.

## 1.1.2. Phạm vi {#1.1.2.-phạm-vi}

**Trong phạm vi (In-scope):**

•     Tiếp nhận Phiếu dịch vụ từ K1, xác định cấu trúc Chặng (Leg) tự động theo Cấu hình Chặng.

•  5 Trạng thái tổng chuẩn: Tạo mới→Đã tiếp nhận / Từ chối→ Đang thực hiện→ Đã thực hiện. 

Ma trận ánh xạ Nút bấm thao tác của Trưởng điều phối (CC):

* Nút Gửi phiếu DV (K1 bấm gửi sang K3)→ Phiếu chuyển trạng thái Tạo mới.  
* Nút Từ chối phiếu (CC chọn từ chối kèm lý do) →Phiếu chuyển trạng thái Từ chối.  
* Nút Tiếp nhận phiếu (CC chọn Nhận dịch vụ) → Phiếu chuyển trạng thái Đã tiếp nhận.  
* Nút Xác định cấu trúc chặng (CC chốt & kích hoạt chặng)→ Phiếu chuyển trạng thái Đang thực hiện.

•  Điều phối nhà thầu (Approved Vendor List — AVL) cho từng dịch vụ con.

•  Theo dõi tiến độ thực hiện dịch vụ theo 4 mốc trạng thái (Chưa thực hiện → Điều phối → Đang thực hiện → Đã thực hiện).

Nút bấm chính trên Card Dịch vụ con (Primary Action Button):

* Trạng thái Chưa thực hiện → Hiển thị nút Điều phối nhà thầu.  
* Trạng thái Điều phối →Hiển thị nút Bắt đầu thực hiện.  
* Trạng thái Đang thực hiện→ Hiển thị nút Hoàn thành dịch vụ.  
* Trạng thái Đã thực hiện 

•  Phân quyền truy cập (RBAC) theo vai trò: Consignment Controller (CC) và 5 vai trò Điều phối viên dịch vụ con.

•  Ghi nhận Phụ phí và Chi phí phát sinh ở cấp dịch vụ con .

•  Nhật ký Tháp điều phối (audit trail) ghi nhận mọi thay đổi trạng thái quan trọng.

•  Module cấu hình "Cấu hình Chặng" (sandbox) cho phép xem/thử nghiệm bộ quy tắc Công cụ tính Chặng.

**Ngoài phạm vi (Out-of-scope):**

•  Xử lý Hàng ghép (LTL/LCL) — Công cụ tính Chặng hiện chỉ hỗ trợ Hàng nguyên (FTL/FCL).

•  Quy tắc sinh cấu trúc Chặng (RUL-YYMM-xxx ) được quản trị tại module riêng 'Cấu hình Chặng.

•  Định giá, duyệt chi phí gốc (Giá mua) — thuộc K2 (Pricing)/K4 (Cost Approval).

•  Khai báo hải quan thực tế trên hệ thống VNACCS — do nhà thầu thực hiện ngoài hệ thống.

•  Theo dõi GPS thời gian thực — K3 chỉ ghi nhận mốc thời gian thủ công/theo báo cáo nhà thầu.

•     Đối soát công nợ, xuất hóa đơn, chốt doanh thu — thuộc K5 (Compliance/Finance).

•     Thao tác ngoại lệ của CC (Ghi nhận đổi xe, Raise yêu cầu chi phí phát sinh, Yêu cầu điều chỉnh phạm vi dịch vụ).

# **1.2. Sơ đồ luồng nghiệp vụ (Business Process Flow)** {#1.2.-sơ-đồ-luồng-nghiệp-vụ-(business-process-flow)}

[*Tham chiếu sơ đồ*](https://app.diagrams.net/#G1WrTNfp9d8UiaKMEsaWxzNzQP17zKQS0P#%7B%22pageId%22%3A%22rHpYzlqODYcsjcbZNc0r%22%7D)

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tiếp nhận đơn | Consignment Controller | Xem đơn 'Tạo mới', bấm 'Tiếp nhận phiếu' | Phiếu dịch vụ từ K1 | trạng thái phiếu \= "Đã tiếp nhận" | Đơn phải có đủ thông tin Header từ K1   |
| Xác định cấu trúc Chặng | CC \+ Hệ thống (Công cụ tính Chặng) | Hệ thống áp dụng  RULE đã cấu hình chặng  | Loại hình XNK, Điểm đi/đến, Cửa khẩu  | cấu trúc Chặng đã xác nhận | Không sinh Chặng rỗng; không có case xuyên biên giới 3 Chặng |
| Điều phối nhà thầu | Điều phối viên dịch vụ con | Chọn nhà thầu từ Danh sách nhà thầu hiển thị để chọn lấy nguồn từ module "Giá mua đầu vào" (Quản lý cung ứng \> Giá mua đầu vào) , phân bổ chi phí & nhiệm vụ | Danh sách nhà thầu hiển thị để chọn lấy nguồn từ module "Giá mua đầu vào" (Quản lý cung ứng \> Giá mua đầu vào) , dịch vụ đã khởi tạo | trạng thái dịch vụ \= "Điều phối" | Không bị khóa theo thứ tự Chặng |
| Đang thực hiện dịch vụ | Điều phối viên \+ Nhà thầu | Bấm 'Bắt đầu thực hiện', thực hiện công việc thực tế | Dịch vụ đã điều phối | trạng thái dịch vụ → "Đang thực hiện" | Khóa theo thứ tự Chặng, trừ Khai báo Hải quan |
| Hoàn thành dịch vụ | Điều phối viên \+ Nhà thầu | Bấm 'hoàn thành dịch vụ', thực hiện công việc thực tế | Dịch vụ đang thực hiện dịch vụ | trạng thái dịch vụ → "Hoàn thành dịch vụ" | Khóa theo thứ tự Chặng, trừ Khai báo Hải quan |
| Chốt phiếu | Hệ thống | Khi toàn bộ dịch vụ mọi Chặng đạt 'Đã thực hiện' | Trạng thái mọi dịch vụ con | trạng thái phiếu \= "Đã thực hiện" | Tự động, không cần CC thao tác thêm |

 

# **1.3. Kiến trúc phân quyền (RBAC)** {#1.3.-kiến-trúc-phân-quyền-(rbac)}

| Vai trò | Phụ trách dịch vụ | Quyền hạn chính |
| :---- | :---- | :---- |
| CC (Consignment Controller — Trưởng nhóm) | Không thao tác dịch vụ nào | Tiếp nhận phiếu, Xác định cấu trúc Chặng, xem toàn bộ (chỉ xem), xử lý ngoại lệ, xem panel Tổng chi/Nhật ký/Thao tác ngoại lệ |
| Customs Declaration Coordinator | Khai báo Hải quan | Điều phối nhà thầu, Bắt đầu/Hoàn thành (độc lập, không chờ Chặng) |
| Customs Supervision Coordinator | Hải quan Giám sát | Tương tự với Khai báo hải quan, có khóa theo thứ tự Chặng |
| Transport Coordinator | Vận tải | Tương tự với Khai báo hải quan, có khóa theo thứ tự Chặng |
| Transload Coordinator | Sang tải | Tương tự với Khai báo hải quan, có khóa theo thứ tự Chặng |
| Warehouse Coordinator | Kho bãi | Tương tự với Khai báo hải quan, có khóa theo thứ tự Chặng |

 **1.3.1. Ma trận RACI theo hoạt động**

 R \= Responsible (thực hiện) · A \= Accountable (chịu trách nhiệm cuối) · C \= Consulted (được tham vấn) · I \= Informed (được thông báo)

| Hoạt động | K1 | K2 | CC (K3) | Coordinator (K3) | K4 | K5 |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Tạo Phiếu dịch vụ (Booking) | R/A | I | I | — | — | — |
| Định giá / Rate Sheet | C | R/A | — | — | I | — |
| Duyệt danh sách nhà thầu (AVL) | — | — | I | I | R/A | — |
| Tiếp nhận phiếu (chấp nhận Phiếu từ K1) | I | — | R/A | — | — | — |
| Xác định cấu trúc Chặng (Công cụ tính Chặng) | — | — | R/A | I | — | — |
| Từ chối phiếu | I | — | R/A | — | — | — |
| Điều phối nhà thầu cho dịch vụ con | — | — | I | R/A | — | — |
| Cập nhật thông tin thực tế & Hoàn thành dịch vụ | — | — | I | R/A | — | — |
| Chốt phiếu (tự động khi đủ điều kiện) | I | — | I | R | — | — |

 

 

# **1.4. Quy tắc nghiệp vụ** {#1.4.-quy-tắc-nghiệp-vụ}

| Mã BR | Nội dung |
| :---- | :---- |
| BR-K3-01 | "K3 không chạm vào Giá mua gốc" — K3 thêm đầu mục Phụ phí/ Chi phí phát sinh đồng thời nhập số tiền của Chi phí phát sinh.  |
| BR-K3-02 | Mỗi Phiếu dịch vụ (FTL/FCL) tự động sinh cấu trú c\>=1 Chặng khớp theo Quy tắc chặng. Ngay khi Consignment Controller (CC) bấm *"Xác nhận & kích hoạt"*, cấu trúc Chặng bị khóa đóng băng vĩnh viễn (Read-only)1  **Khai báo Hải quan & Hải quan Giám sát:** Tự động gán vào Chặng có **Cửa khẩu / Địa điểm TTHQ khớp trùng tên** với thuộc tính *"Địa điểm làm thủ tục HQ"* do K1 khai báo ở Khối A (Ví dụ: K1 chọn *"Chi cục HQ Cửa khẩu Hữu Nghị"*, Công cụ tính Chặng tự động gán dịch vụ vào Chặng tại Cửa khẩu Hữu Nghị). **Sang tải:** Tự động gán vào Chặng tại Cửa khẩu có Bãi sang tải tương ứng. **Vận tải:** Khớp tự động theo Hướng di chuyển (Nội địa \>Cửa khẩu / Cửa khẩu \> Nội địa / Cửa khẩu \> Cửa khẩu / Nội địa \> Nội địa). |
| BR-K3-03 | Khi phiếu dịch vụ có đăng ký dịch vụ Kho bãi, Công cụ tính Chặng mặc định tự động gán Kho bãi vào Chặng 1  — do CC kéo-thả/chọn thủ công. 4 dịch vụ còn lại gán tự động. |
| BR-K3-04 | Sau khi xác nhận cấu trúc chặng, cấu trúc Chặng bị khóa cứng, không sửa được nữa. |
| BR-K3-05 | Trạng thái dịch vụ con gồm đúng 4 mốc: Chưa thực hiện → Điều phối → Đang thực hiện → Đã thực hiện. |
| BR-K3-06 | Quy tắc Khóa Chặng (Leg Sequential Lock): Dịch vụ con ở Chặng sau chỉ được bấm nút Bắt đầu thực hiện khi Chặng liền trước đã ở trạng thái Đã thực hiện. *(Ngoại lệ: Khai báo Hải quan chạy độc lập, không bị khóa Chặng*  |
| BR-K3-07 | Badge Trạng thái Chặng được tổng hợp tự động từ trạng thái các dịch vụ con bên trong theo thứ tự ưu tiên: Đã thực hiện (100% xong); Đang thực hiện (\>=1 đang chạy) ;Điều phối ;Chưa bắt đầu |
| BR-K3-08 | Phân định Quyền sở hữu Thao tác & Phân quyền RBAC Mô tả: Đảm bảo nguyên tắc Segregation of Duties (SoD) giữa vai trò Quản lý tổng thể (CC) và các Vai trò Thực thi (Coordinators). Quy tắc: Consignment Controller (CC) chỉ nắm quyền: *Tiếp nhận phiếu, Xác định cấu trúc chặng, Từ chối phiếu, Xử lý sự cố/ngoại lệ tổng*. CC không có quyền bấm nút điều phối nhà thầu hay thay đổi tiến độ của các dịch vụ con. Nút hành động chính (Điều phối nhà thầu, Bắt đầu thực hiện, Hoàn thành dịch vụ) và quyền nhập dữ liệu thực tế tại từng dịch vụ con thuộc quyền sở hữu độc quyền của Coordinator phụ trách dịch vụ đó. |
| BR-K3-09 | Phụ phí / Chi phí phát sinh tại hiện trường do Coordinator nhập tại tab "Chi phí" của dịch vụ con được cộng trực tiếp vào Tổng chi phí dịch vụ con và đồng bộ lên Tổng chi quy đổi toàn phiếu  |
| BR-K3-10  | Từ chối phiếu bị chặn nếu đã có Chặng đang active.  |
| BR-K3-11 | Loại bỏ toàn bộ các mã kỹ thuật, mã quy tắc nội bộ và các nhãn quốc gia dư thừa trên giao diện người dùng cuối, đảm bảo tên gọi trực quan, ngắn gọn, chuẩn hóa nghiệp vụ và nhất quán trên toàn hệ thống Tháp điều phối.  |
| BR-K3-13 | Khối Chi phí theo Chặng & Dịch vụ con ở Sidebar được điều chỉnh hiển thị động theo vai trò đăng nhập: Màn hình CC: Hiển thị phân cấp Accordion theo toàn bộ các Chặng và tất cả dịch vụ con. Màn hình Coordinator: Chỉ hiển thị cột/dòng Tổng chi phí áp dụng cho từng dịch vụ hiển thị thuộc phạm vi phụ trách, không tải/hiển thị cấu trúc chặng tổng và các dịch vụ con khác. |
| BR-K3-14 | Duy trì hiển thị khối Chi phí và Nhật ký Timeline trên Sidebar cho tất cả vai trò, nhưng giới hạn phạm vi dữ liệu Tổng chi quy đổi hiển thị ở mức dịch vụ phụ trách đối với Coordinators. |
| BR-K3-16 | Quy tắc hiển thị nhãn Nút hành động chính theo Trạng thái dịch vụ con: Nút hành động chính (Primary Action Button) trên mỗi Card dịch vụ con tự động đổi nhãn (Label) dựa theo Trạng thái dịch vụ con tại thời điểm hiện tại: Khi Trạng thái \= Chưa thực hiện: Hiển thị nút Điều phối nhà thầu (Bấm để mở Modal AVL). Khi Trạng thái \= Điều phối: Hiển thị nút Bắt đầu thực hiện (Bấm để chuyển dịch vụ sang thực địa). Khi Trạng thái \= Đang thực hiện: Hiển thị nút Hoàn thành dịch vụ (Bấm để chốt hoàn tất dịch vụ). *Quy tắc các bước nút bấm nêu trên áp dụng đồng nhất cho cả 5 loại dịch vụ con (bao gồm cả Khai báo Hải quan).* |
| BR-K3-18 | Màn danh sách phân tách 2 biến thể: CC dùng *Lọc nhanh tiến độ tổng*; Coordinators dùng *Lọc nhanh phần việc* |
| BR-K3-19 | Mini-stepper trên Card dịch vụ chỉ render 3 mốc (Điều phối /Đang thực hiện /Đã thực hiện) |
| BR-K3-20 | **"Quy tắc xác định Điểm đi và Điểm đến động cho từng Chặng (BR-CH-40):** *Vị trí Điểm đi/đến của từng Chặng không lưu tĩnh trong cấu hình mà được tính ĐỘNG theo thông số thực tế của Phiếu dịch vụ:* ●   	**Chặng 1 (Chặng đầu):** Điểm đi \= Điểm đi của Phiếu dịch vụ. *(Nếu Điểm đi của phiếu là Cửa khẩu cụ thể thì Chặng 1 có Điểm đi \= Điểm đến \= Cửa khẩu đó)*. ●   	**Chặng N (Chặng cuối):** Điểm đến \= Điểm đến của Phiếu dịch vụ. *(Nếu Điểm đến của phiếu là Cửa khẩu cụ thể thì Chặng N có Điểm đi \= Điểm đến \= Cửa khẩu đó)*. ●   	**Các Chặng giữa (nếu có):** Điểm đi của Chặng \$n\$ \= Điểm đến của Chặng \$n-1\$ (nối tiếp liên tục). *Cơ chế này áp dụng đồng nhất cho cả công cụ Simulator (Giả lập) và luồng xử lý Phiếu dịch vụ thật tại Tháp điều phối (K3)."*   |
| BR-K3-21 | Quy tắc SSOT và trách nhiệm nhập liệu đối với Xe giao hàng: Thông tin Xe giao hàng (Biển số xe, tải trọng, số mooc, số cont, tài xế, SĐT,CCCD) tại Khối B (Thông tin chung) do K1 khai báo ban đầu chỉ mang tính chất dự kiến (không bắt buộc). Khi Phiếu dịch vụ chuyển sang Tháp điều phối (K3), Điều phối viên Khai báo Hải quan (K3) là vai trò chịu trách nhiệm nhập mới hoặc cập nhật lại thông tin Xe giao hàng tại mục *Thông tin thực tế của Dịch vụ Khai báo HQ* (nếu K1 để trống hoặc có thay đổi xe tại cửa khẩu). Ngay khi Dịch vụ Khai báo HQ cập nhật, hệ thống tự động cascade ngược (ghi đè) thông tin này về Khối B (Thông tin chung \- Xe giao hàng) làm dữ liệu gốc SSOT. Dịch vụ Sang tải (phần Xe giao trong cặp xe sang tải) và các dịch vụ liên quan cùng chặng sẽ tự động đọc kế thừa (Read-only) dữ liệu Xe giao hàng từ Khối B, không nhập |
| BR-K3-22  | Đơn vị tính (ĐVT) chi phí được xét ĐỘNG từ Bảng giá (Rate Sheet) hiệu lực của nhà thầu. Bắt buộc validate có ĐVT hợp lệ tại bước Điều phối nhà thầu AVL.  |
| BR-K3-25  | Khi chốt nhà thầu tại Modal AVL, hệ thống kế thừa đồng thời 4 thông số gốc sang Bảng chi phí: \[Tên Nhà thầu\], \[Mã ID Báo giá mua đầu vào (Rate Sheet ID)\], \[Đơn giá gốc\], và \[Đơn vị tính (ĐVT)\].  |
| BR-K3-LOCK-COST  | Quy tắc Khóa Chỉnh sửa Bảng Chi phí Nhà thầu 1\. Khóa theo Vòng đời:    \- Dịch vụ con \= "Đã thực hiện" \-\> Khóa chỉnh sửa Bảng chi phí của dịch vụ đó (Chuyển Read-only).    \- Phiếu dịch vụ \= "Hoàn thành" (K5 chốt) / "Đã hủy" / "Từ chối" \-\> Khóa vĩnh viễn Bảng chi phí của tất cả các Chặng. 2\. Khóa theo Phân quyền & Đầu mục:    \- Nút "+ Phụ phí", "+ Chi phí phát sinh" và " Chỉnh sửa" chỉ hiển thị cho Coordinator phụ trách dịch vụ đó. CC và các vai trò khác chỉ có quyền xem (Read-only).    \- Dòng chi phí Mặc định (Rate Sheet AVL): Khóa thao tác Xóa dòng (Ẩn icon xóa) và Read-only cột "TỔNG CHI".    \- Cột "TỔNG QUY ĐỔI" (VND) và trường "Tỷ giá quy đổi" (khi chọn Nguồn VCB): Read-only 100%. 3\. Khóa Truy cập Đồng thời (Pessimistic Lock):    \- Khi 01 người dùng đang mở chế độ chỉnh sửa Bảng chi phí, hệ thống khóa bảng chi phí đó; chặn người dùng khác vào chỉnh sửa đồng thời (Timeout phiên: 5 phút). |
| BR-KHQ-03  | (SSOT Xe giao hàng) Coordinator Khai báo Hải quan (K3) có quyền thêm/sửa/xóa các bản ghi xe trong Xe giao hàng. Ngay khi Lưu, hệ thống tự động Cascade toàn bộ danh sách Xe giao hàng về Khối B (Header). Dịch vụ Sang tải tự động nạp danh sách này vào dropdown chọn Xe giao của Cặp xe sang tải. |
| BR-VT-01 (SSOT  | Xe nhận hàng) Transport Coordinator (K3) nhập/chốt Xe nhận hàng. Ngay khi Lưu, hệ thống tự động Cascade ngược toàn bộ Xe nhận hàng lên Khối B (Header). Dịch vụ Sang tải tự động nạp danh sách này vào dropdown chọn Xe nhận của Cặp xe sang tải. |
| BR-K3-22-CALC  | Với các Đơn vị tính (ĐVT) **"Xe giao"**, **"Xe nhận"**, **"Chuyến"**, **"Cặp xe"** → **Số lượng (SL) trên Bảng chi phí \= 1** (cố định).   |
| BR-K3-PRE-INPUT  | Quy định nhập Thông tin thực tế: Khóa Read-only 100% Khối 1; Cho phép nhập linh hoạt Khối 2 khi chưa thực hiện, nhưng bắt buộc điền đủ trường cốt lõi khi bấm Hoàn thành dịch vụ.  Bổ sung rule: Default Khối 2 \= Giá trị Khối 1 cho các trường trùng nhau.  |
| BR-K3-MAPPING-AVL  | Ma trận Rà soát & Mapping Thuộc tính khi Điều phối Nhà thầu AVL Khi mở Modal "Khu điều phối nhà thầu AVL", hệ thống tự động query và filter các Dòng giá mua đầu vào ở trạng thái "Đang hoạt động" còn hiệu lực theo bộ thuộc tính bắt buộc của từng phân hệ:   (1) Vận tải: Điểm đi \+ Điểm đến \+ Loại xe   (2) Kho bãi: Tên kho \+ Loại kho   (3) Khai báo Hải quan: Chi cục hải quan \+ Loại hình XNK \+ Nhóm hàng \+ Loại xe   (4) Hải quan Giám sát: Chi cục hải quan \+ Loại hình XNK \+ Nhóm hàng \+ Loại xe   (5) Sang tải: Địa điểm sang tải \+ Phương thức sang tải \+ Nhóm hàng \+ Đặc tính hàng hóa \* Quy tắc khớp linh hoạt (Fallback): Dòng giá trên Bảng giá mua có thuộc tính \= "Tất cả" sẽ tự động khớp với mọi giá trị thực tế tương ứng trên Phiếu dịch vụ. |
| BR-K3-30  | Đóng băng Dữ liệu Thương mại Khối A/B khi K3 Tiếp nhận Ngay khi Consignment Controller (CC) bấm "Tiếp nhận phiếu", toàn bộ dữ liệu tại Khối A (Thông tin chung) và Khối B (Hàng hóa) do K1 bàn giao sẽ chuyển sang trạng thái KHÓA ĐÓNG BẰNG (Read-only) trên cả màn hình K1 và K3. Ngoại lệ: Các trường phương tiện SSOT và Chi cục/Đơn vị Hải quan do K3 chốt/sửa. |
| BR-K3-HANDOFF-K5  | Chuyển giao Snapshot P\&L Thực tế cho Khối 5 Khi 100% dịch vụ con đạt "Đã thực hiện", phiếu tự động chuyển trạng thái "Đã thực hiện". Hệ thống đóng đóng băng snapshot Bảng chi phí thực tế quy đổi (VND) và tự động đẩy sang Khối 5 (Kế toán) để đối soát công nợ và quyết toán. |
| BR-K3-RESET-AVL  | Tự động Hủy gán Nhà thầu & Điều chỉnh Trạng thái khi Thay đổi Thuộc tính Mapping AVL 1\. Phạm vi áp dụng: Áp dụng đối với TOÀN BỘ 5 DỊCH VỤ CON khi xảy ra sự thay đổi thuộc tính thuộc Ma trận Mapping AVL (BR-K3-MAPPING-AVL), bao gồm:    \- Dịch vụ Khai báo HQ & HQ Giám sát: Thay đổi trường "Địa điểm làm thủ tục HQ" / "Đơn vị giám sát HQ" (Chi cục hải quan), Loại xe, Loại hình XNK, Nhóm hàng.    \- Dịch vụ Vận tải: Thay đổi Điểm đi, Điểm đến, Loại xe.    \- Dịch vụ Kho bãi: Thay đổi Tên kho, Loại kho.    \- Dịch vụ Sang tải: Thay đổi Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa. 2\. Hành vi hệ thống khi Coordinator chỉnh sửa thuộc tính:    Khi dịch vụ con ĐÃ ĐƯỢC GÁN NHÀ THẦU (đang ở trạng thái "Điều phối" hoặc "Đang thực hiện") mà Coordinator thực hiện chỉnh sửa 1 trong các thuộc tính Mapping AVL nêu trên và bấm "Lưu":    a. Hủy gán nhà thầu cũ: Hệ thống tự động XÓA/RESET thông tin Nhà thầu đã gán và XÓA toàn bộ Bảng chi phí mặc định sinh từ Bảng giá của nhà thầu cũ.    b. Điều chỉnh Trạng thái Dịch vụ con: Hệ thống tự động TỰ ĐỘNG CHUYỂN TRẠNG THÁI dịch vụ con LÙI VỀ "Chưa thực hiện".    c. Cảnh báo UI: Hiển thị Popup cảnh báo xác nhận trước khi lưu: "Thay đổi \[Tên thuộc tính\] sẽ HỦY kết quả điều phối nhà thầu hiện tại và đưa dịch vụ về trạng thái Chưa thực hiện. Bạn có chắc chắn muốn tiếp tục?".    d. Truy vết Nhật ký: Tự động push bản ghi sự kiện RESET\_VENDOR\_MAPPING (kèm thuộc tính bị thay đổi, tên nhà thầu bị hủy và trạng thái cũ \-\> mới) vào Nhật ký Tháp điều phối (Timeline).    e. Yêu cầu bắt buộc: Coordinator phải bấm nút "Điều phối nhà thầu" để mở lại Modal AVL và chọn Nhà thầu/Bảng giá mới khớp với bộ thuộc tính vừa cập nhật. |
|  | Quy tắc Hiển thị Đa Báo giá theo ĐVT, Binding 3 Thông số và Đồng bộ Công thức đếm SL tại Modal AVL 1\. Hiển thị Option Báo giá Đa Đơn vị tính (Multi-UOM Quotes Display):    \- Nguồn nạp: Truy vấn tất cả các dòng giá "Đã phê duyệt" thuộc Bảng giá "Đang hoạt động" và còn thời hạn hiệu lực của nhà thầu được chọn từ phân hệ Giá mua đầu vào.    \- Không gộp bản ghi theo ID Nhà thầu: Trường hợp 01 Nhà thầu chào giá cho cùng 01 Đầu mục nhiệm vụ theo nhiều Đơn vị tính (ĐVT) khác nhau (VD: vừa chào giá theo Chuyến, vừa chào theo Tấn, vừa chào theo Xe), hệ thống hiển thị TẤT CẢ các dòng báo giá thành các Option riêng biệt.    \- Định dạng hiển thị từng Option:       \[Tên Nhà Thầu\] \- \[Đơn giá chào\] \[Tiền tệ\] / \[Đơn vị tính (ĐVT)\]      (Ví dụ: "CTCP Vận tải Nam Ninh \- 15,000,000 VND / Chuyến", "CTCP Vận tải Nam Ninh \- 500,000 VND / Tấn"). 2\. Binding Đồng bộ 3 Thông số (3-Parameter Synchronous Binding):    Khi Coordinator chọn 01 Option báo giá trong Dropdown "Nhà thầu đảm nhận" và bấm "Xác nhận điều phối", hệ thống tự động kế thừa đồng thời 3 thông số từ dòng giá đã chọn sang Bảng chi phí Dịch vụ con:    \- Parameter 1: \[Tên Nhà Thầu phụ trách\] \-\> Tiêu đề Khối chi phí & thuộc tính nhà thầu của dòng chi phí.    \- Parameter 2: \[Đơn giá gốc\] \-\> Đơn giá cố định dòng chi phí mặc định.    \- Parameter 3: \[Đơn vị tính (ĐVT)\] \-\> ĐVT chính thức của dòng chi phí mặc định. 3\. Đồng bộ ĐVT với Công thức đếm Số lượng (Dynamic Quantity Formula Switch):    Khi ĐVT được khởi tạo từ AVL hoặc khi Coordinator thay đổi ĐVT tại Modal "Chỉnh sửa chi phí", hệ thống tự động chuyển đổi (switch) hàm đếm/nguồn dữ liệu đếm Số lượng (SL) theo đúng loại ĐVT:    \- ĐVT "Xe giao" / "Chuyến": SL \= 1 Xe giao hàng.    \- ĐVT "Xe nhận" / "Chuyến": SL \= 1 Xe nhận hàng.    \- ĐVT "Cặp xe": SL \= Tổng số cặp xe sang tải.    \- ĐVT "Tờ khai": SL \= Số lượng tờ khai nhập ở Khối 2 Khai báo HQ.    \- ĐVT "Ngày": SL \= Thời gian xuất kho thực tế \- Thời gian nhập kho thực tế (ngày).    \- ĐVT "Tấn": SL \= Trọng lượng tồn thực tế (Tấn).    \- ĐVT "m³" / "CBM" / "Pallet" / "Kiện": SL \= Số lượng thực tế nhập ở Khối 1 Kho bãi/Sang tải.    \- ĐVT "JOB": SL \= 1 (mặc định).    \- Ngay sau khi SL tự động cập nhật \-\> Tự động tính lại "TỔNG CHI" (= Đơn giá x SL) và "TỔNG QUY ĐỔI (VND)" (= Tổng chi x Tỷ giá).  |
| BR-K3-06-B  | Quy tắc Linh hoạt Thứ tự Thực hiện Dịch vụ con trong cùng 01 Chặng (Flexible Intra-Leg Execution) 1\. Phạm vi áp dụng: Áp dụng cho các Dịch vụ con thuộc CÙNG 01 CHẶNG đã được kích hoạt. 2\. Quy tắc nghiệp vụ:    \- Các dịch vụ con trong cùng 01 Chặng KHÔNG BẮT BUỘC phải thực hiện theo thứ tự tuyến tính cố định.    \- Coordinator phụ trách có toàn quyền bấm nút "Bắt đầu thực hiện" cho bất kỳ dịch vụ con nào trong Chặng đó tùy theo tình hình tác nghiệp thực tế tại hiện trường. 3\. Ràng buộc liên chặng: Quy tắc Khóa chặng tuần tự giữa các Chặng khác nhau (BR-K3-06) vẫn giữ nguyên hiệu lực (Chặng sau chỉ được thực hiện khi Chặng liền trước đạt trạng thái "Đã thực hiện"). |
| BR-K3-LEG-DISPLAY  | Quy tắc Hiển thị và Tự động Ẩn Chặng rỗng khi Xác định Cấu trúc Chặng 1\. Trạng thái hiển thị tại Modal Cấu trúc chặng (Trưởng điều phối \- CC):    Khi Trưởng điều phối (CC) mở Popup "Xác định cấu trúc chặng dịch vụ", hệ thống phải HIỂN THỊ ĐẦY ĐỦ TOÀN BỘ 100% các chặng đã được công cụ Leg Engine cấu hình sinh ra, BẠO GỒM CẢ CÁC CHẶNG CHƯA CÓ DỊCH VỤ CON NÀO (Chặng rỗng). 2\. Xử lý tự động khi Bấm Lưu / Xác nhận:    Khi CC kiểm tra xong và bấm nút "Xác nhận cấu trúc chặng" (hoặc "Lưu"):    \- Hệ thống tự động quét toàn bộ danh sách chặng.    \- Tự động LOẠI BỎ / ẨN các chặng rỗng (chặng không chứa bất kỳ dịch vụ con nào).    \- Chỉ lưu, tạo Card tác nghiệp và kích hoạt hiển thị các Chặng có chứa tối thiểu 01 dịch vụ con lên giao diện Chi tiết phiếu dịch vụ K3. |
| BR-K3-VEHICLE-FORMAT  | Kiểm tra trực tiếp ký tự đầu tiên của **Biển số Xe giao duy nhất** hoặc **Biển số Xe nhận duy nhất**: Ký tự đầu là **Chữ số** (VD: 29C-123.45) → ĐVT là **Xe VN**. Ký tự đầu là **Ký tự chữ** (VD: 桂A-88888) → ĐVT là **Xe TQ**. |

 

# **1.5. Yêu cầu phi chức năng chung** {#1.5.-yêu-cầu-phi-chức-năng-chung}

•  Hiệu suất: thời gian tải trang Danh sách Dịch vụ/Chi tiết phiếu ≤ 3 giây với tối đa 500 phiếu đang hoạt động.

•  Bảo mật: RBAC bắt buộc ở tầng API (không chỉ ẩn UI).

•  Khả năng truy vết: mọi thay đổi trạng thái, điều phối nhà thầu, chi phí phát sinh phải ghi Nhật ký Tháp điều phối, append-only.

•  Khả dụng: badge trạng thái Chặng/dịch vụ phải cập nhật theo thời gian thực (độ trễ ≤ 2 giây).

## 1.5.1. Giả định, Ràng buộc & Phụ thuộc {#1.5.1.-giả-định,-ràng-buộc-&-phụ-thuộc}

| Loại | Nội dung |
| :---- | :---- |
| Giả định | K1 đã cung cấp đầy đủ Header hợp lệ (Khách hàng, Loại hình XNK, Cửa khẩu, Điểm đi/đến...) trước khi bàn giao Phiếu dịch vụ sang K3. |
| Giả định | Danh sách nhà thầu (AVL) đã được K4 duyệt sẵn trước khi K3 sử dụng ở bước Điều phối nhà thầu. |
| Giả định | Toàn bộ số liệu tài chính hiển thị (Doanh thu, Chi phí, Tổng chi, Tổng quy đổi) sử dụng thống nhất đơn vị tiền tệ VNĐ, trừ khi chọn Nguồn tỷ giá khác trong bảng Chi phí mua. |
| Giả định | Mỗi Phiếu dịch vụ chỉ thuộc về đúng 1 khách hàng, không hỗ trợ gộp nhiều khách hàng trong 1 phiếu. |
| Giả định | Giai đoạn hiện tại chỉ xử lý Hàng nguyên (FTL/FCL); Hàng ghép (LTL/LCL) chưa được hỗ trợ trong Công cụ tính Chặng. |
| Ràng buộc | Chưa có tích hợp API thật với hệ thống VNACCS — Điều phối viên Khai báo Hải quan phải nhập tay kết quả từ nhà thầu vào LogXPro. |
| Ràng buộc | RBAC hiện tại được chọn thủ công qua dropdown "Vai trò K3" (phục vụ giai đoạn prototype/demo) — chưa gắn cứng vào tài khoản đăng nhập thật; cần làm rõ cơ chế gán vai trò theo tài khoản khi triển khai production. |
| Ràng buộc | Không có theo dõi GPS thời gian thực — mọi mốc thời gian (lấy hàng, giao hàng, vào/ra khu kiểm hóa...) đều ghi nhận thủ công theo báo cáo của nhà thầu. |
| Ràng buộc | Hệ thống LogXPro chưa thực hiện tích hợp API trực tiếp với hệ thống VNACCS/VCIS của Tổng cục Hải quan. Mọi thông tin về số tờ khai, kết quả phân luồng (Xanh/Vàng/Đỏ) và trạng thái thông quan đều do Điều phối viên Khai báo HQ cập nhật thủ công dựa trên phản hồi thực tế từ Nhà thầu/Đại lý Hải quan.   |
| Phụ thuộc | Màn "Chi tiết P\&L" phụ thuộc đồng thời vào dữ liệu Doanh thu từ K1 và dữ liệu Chi phí mua thực tế từ Bảng chi phí dịch vụ con của K3 — nếu 1 trong 2 nguồn chưa có dữ liệu, số liệu hiển thị có thể không đầy đủ. |
| Phụ thuộc | Badge trạng thái Chặng (4 mức) phụ thuộc vào việc đồng bộ cập nhật trạng thái thời gian thực giữa các dịch vụ con cùng Chặng — độ trễ đồng bộ vượt quá 2 giây (theo Yêu cầu phi chức năng, mục 5\) có thể khiến badge hiển thị sai lệch tạm thời. |

## 1.5.2. Ràng buộc chung cho trường "Chứng từ lô hàng" {#1.5.2.-ràng-buộc-chung-cho-trường-"chứng-từ-lô-hàng"}

| Thuộc tính | Giá trị áp dụng |
| :---- | :---- |
| Định dạng file cho phép | PDF, JPG, PNG, DOCX, XLSX |
| Dung lượng tối đa mỗi file | 10 MB |
| Số lượng file tối đa mỗi khối đính kèm | 10 file |
| Đặt tên file khi upload | Giữ nguyên tên gốc người dùng upload; hệ thống không tự đổi tên |
| Xử lý khi vượt giới hạn dung lượng | Chặn upload, hiển thị lỗi "File vượt quá dung lượng cho phép (tối đa 20MB)" |
| Xử lý khi sai định dạng | Chặn upload, hiển thị lỗi "Định dạng file không được hỗ trợ" |
| Xử lý khi vượt số lượng file | Chặn thêm file mới, hiển thị lỗi "Đã đạt giới hạn 10 file đính kèm" |
| Quyền xóa file đã upload | Chỉ Người phụ trách dịch vụ tương ứng (hoặc CC ở khối dùng chung) được xóa; xóa có xác nhận, không khôi phục lại được |
| Áp dụng cho các khối | "Chứng từ lô hàng" (Khối 1 — Thông tin khai báo, chỉ xem/không xóa vì là dữ liệu K1); "Chứng từ lô hàng" (Khối 2 — Thông tin thực tế, có thể thêm/xóa); Modal Phụ phí/Chi phí phát sinh |

# **1.6. Cấu trúc dùng chung: Điều phối nhà thầu & Chi phí dịch vụ con** {#1.6.-cấu-trúc-dùng-chung:-điều-phối-nhà-thầu-&-chi-phí-dịch-vụ-con}

## 1.6.1. Cụm nút thao tác ngoài Tab Chi phí (Header Tab Card Dịch vụ con)

* Hệ thống hiển thị trực tiếp **02 nút gọi Popup thao tác riêng biệt** trên Header Tab Chi phí:  
  1. Nút **\[+ Thêm phụ phí\]**: Mở Popup *"Thêm phụ phí"*.  
  2. Nút **\[+ Thêm chi phí phát sinh\]**: Mở Popup *"Thêm chi phí phát sinh"*.

## 1.6.2. Cấu trúc & Logic Xử lý tại Popup "Thêm phụ phí"

Khi Coordinator bấm nút **\[+ Thêm phụ phí\]**, hệ thống mở Modal Popup *"Thêm phụ phí"* bao gồm các trường và quy tắc tự động nhảy giá như sau:

| STT | Tên trường / Control | Kiểu DL / Control | Chế độ UI | Quy tắc Dữ liệu & Logic Nghiệp vụ |
| ----- | ----- | ----- | ----- | ----- |
| **1** | **Đầu mục phụ phí** | Dropdown | Editable | Chọn 01 khoản phụ phí từ **Bảng giá mua đầu vào** (Master Data Phụ phí / Rate Sheet AVL). |
| **2** | **Đơn vị tính (ĐVT)** | Dropdown | Editable | Chọn ĐVT hợp lệ theo khoản phụ phí đã chọn. |
| **3** | **Số lượng (SL)** | Number (\>0) | Editable | Coordinator nhập số lượng thực tế. |
| **4** | **Đơn giá** | Number | **Read-only (Auto)** | **Hệ thống tự động nạp đơn giá** tương ứng từ Bảng giá mua đầu vào dựa trên *Đầu mục phụ phí* \+ *ĐVT* đã chọn. |
| **5** | **Thành tiền (Nguyên tệ)** | Number | **Read-only (Auto)** | **Hệ thống tự động tính toán:**\<br\> $Thànhtiền=Đơngiá(Auto)\times Sốlượng$ |
| **6** | **Ghi chú & Đính kèm** | Text / File | Optional | Nhập diễn giải / tải đính kèm chứng từ phụ phí (nếu có). |

* **Hành vi nút \[Lưu\]:**  
  * Thêm 01 dòng bản ghi mới thuộc nhóm **Phụ phí** vào Bảng Chi phí.  
  * Tự động dán nhãn Badge **Phụ phí** (màu vàng/cam) và nhãn **Đã duyệt**.  
  * Cột `Báo giá` kế thừa Mã Rate Sheet ID tương ứng (nếu có).

## 1.6.3. Cấu trúc & Logic Xử lý tại Popup "Thêm chi phí phát sinh"

Khi Coordinator bấm nút **\[+ Thêm chi phí phát sinh\]**, hệ thống mở Modal Popup *"Thêm chi phí phát sinh"* bao gồm các trường nhập liệu tự do như sau:

| STT | Tên trường / Control | Kiểu DL / Control | Chế độ UI | Quy tắc Dữ liệu & Logic Nghiệp vụ |
| ----- | ----- | ----- | ----- | ----- |
| **1** | **Đầu mục phát sinh** | Select / Textbox | Editable | Chọn hoặc nhập tên khoản chi phí phát sinh thực tế tại hiện trường. |
| **2** | **Đơn vị tính (ĐVT)** | Select / Textbox | Editable | Nhập / chọn ĐVT thực tế. |
| **3** | **Số lượng (SL)** | Number (\>0) | Editable | Coordinator nhập số lượng thực tế. |
| **4** | **Đơn giá** | Number (\>0) | **Editable** | **Coordinator tự nhập đơn giá phát sinh thực tế**. |
| **5** | **Thành tiền (Nguyên tệ)** | Number | **Read-only (Auto)** | **Hệ thống tự động tính toán:**\<br\> $Thànhtiền=Đơngiá(Nhậptay)\times Sốlượng$ |
| **6** | **Ghi chú & Đính kèm** | Text / File | Optional | Nhập diễn giải / tải đính kèm chứng từ phát sinh (Phiếu cân, Biên bản lưu đêm, Hóa đơn...). |

* **Hành vi nút \[Lưu\]:**  
  * Thêm 01 dòng bản ghi mới thuộc nhóm **Chi phí phát sinh** vào Bảng Chi phí.  
  * Tự động dán nhãn Badge **Chi phí phát sinh** (màu tím/xanh) và nhãn 🟢 **Đã duyệt**.  
  * Cột `Báo giá` để trống (`-`).

## 1.6. 4\. Quy tắc Phân quyền Chỉnh sửa trên Bảng Chi phí (Inline Edit Rules)

Sau khi các dòng Chi phí cố định (nạp từ AVL), Phụ phí hoặc Chi phí phát sinh được khởi tạo/lưu vào Bảng Chi phí tại Card Dịch vụ con:

1. **Khóa Read-only 100% đối với các trường dữ liệu tài chính & định lượng:**  
   * **KHÓA KHÔNG CHO SỬA TRỰC TIẾP TRÊN BẢNG:** *Đầu mục, Báo giá ID, Nhãn phân loại (Badge), Đơn vị tính (ĐVT), Số lượng (SL), Đơn giá, Tổng chi nguyên tệ, Tổng quy đổi (VND)*.  
2. **CHỈ CHO PHÉP CHỈNH SỬA 02 TRƯỜNG DỮ LIỆU SAU:**  
   * **Ghi chú**: Cho phép click vào ô để sửa/bổ sung diễn giải văn bản.  
   * **File đính kèm**: Cho phép bấm icon để tải thêm / xóa file chứng từ đính kèm/ cho phép tải nhiều file đính kèm và không giới hạn định dạng  
3. **Thao tác Xóa :**  
   * *Chi phí cố định:* Khóa / Ẩn icon xóa.  
   * *Phụ phí & Chi phí phát sinh:* Hiển thị icon 🗑️ cho phép xóa bản ghi khỏi bảng.

**2\. BẢNG CHI PHÍ K3 TỔNG HỢP (HIỂN THỊ TRÊN CARD DỊCH VỤ CON)**

| STT | Tên cột / Trường | Kiểu DL / Control | Chế độ Chỉnh sửa trên Bảng | Logic Dữ liệu & Quy tắc Nghiệp vụ |
| ----- | ----- | ----- | ----- | ----- |
| **1** | **STT** | Integer | Read-only | Số thứ tự tăng tự động (1, 2, 3...). |
| **2** | **Đầu mục** | Text | Read-only | Tên đầu mục chi phí cố định, phụ phí hoặc phát sinh. |
| **3** | **ID** | Text / Tag Link | Read-only | Mã ID Bảng báo giá mua đầu vào (Rate Sheet ID). Dòng Phụ phí/Phát sinh để trống (`-`). |
| **4** | **Báo giá** | Text / Link | Read-only | Lấy từ Cột "Báo giá" trong Bảng giá mua đầu vào. Dòng Phụ phí/Phát sinh để trống (`-`). |
| **5** | **Nhãn phân loại (Badge)** | Badge | Read-only | Phân nhóm theo Loại giá: `Cố định`, `Phụ phí` (vàng/cam), `Phát sinh` (tím/xanh). |
| **6** | **Đơn vị tính (ĐVT)** | Text | Read-only | Kế thừa từ Bảng giá mua hoặc từ Popup khai báo. |
| **7** | **Số lượng (SL)** | Number | Read-only | • Hiển thị con số đếm thực tế (Bỏ text "Tự động"). Tự động tính theo field đã mô tả sẵn ở các mục field của từng dịch vụ  Bảng mapping: [LogXPro\_K3\_Mapping\_DVT\_SL](https://docs.google.com/spreadsheets/d/1o4OHLckRLDzwVTNd_BffS1i4PLhwBFq5UuA4yZRqDWY/edit?usp=sharing) |
| **8** | **Tổng chi (Nguyên tệ)** | Number | Read-only | Thành tiền nguyên tệ ($Đơngiá\times SL$). |
| **9** | **Tổng quy đổi (VND)** | Number | Read-only | Công thức: $Tổngquyđổi=Tổngchi\times Tỷgiáquyđổi$ |
| **10** | **Ghi chú**  | **Text Input** | **EDITABLE** | **Cho phép Coordinator nhập/chỉnh sửa nội dung diễn giải**. |
| **11** | **File đính kèm** 📎 | **File Upload** | **EDITABLE** | **Cho phép Coordinator tải nhiều file / xóa chứng từ đính kèm**. |
| **12** | **Thao tác** | Icon 🗑️ | Action | Cho phép bấm xóa đối với dòng Phụ phí & Phát sinh. |

## 1.6.5. Modal "Khu điều phối nhà thầu AVL" {#1.6.5.-modal-"khu-điều-phối-nhà-thầu-avl"}

| Tên trường | Bắt buộc? | Kiểu DL | Giá trị mặc định / Mô tả |
| :---- | :---- | :---- | :---- |
| Chọn nhà thầu | v (\>=1) | Multi-select search \+ tag chips | Tìm & chọn nhiều nhà thầu từ "Giá mua đầu vào" ; mỗi nhà thầu đã chọn hiển thị dạng chip có nút bỏ chọn.  \- Danh sách nhà thầu hiển thị để chọn lấy nguồn từ module "Giá mua đầu vào" (Quản lý cung ứng \> Giá mua đầu vào) \--- CHỈ hiển thị nhà thầu có ít nhất 1 Bảng giá Trạng thái \= "Đang hoạt động" và còn trong khoảng \[Ngày hiệu lực, Ngày hết hiệu lực\] tại thời điểm điều phối. |
| Bảng Phân bổ chi phí & nhiệm vụ | v | Table động | Cột: \- Tên đầu mục nhiệm vụ (danh sách đầu mục chi phí lấy từ Bảng giá "Giá mua đầu vào" của đúng nhà thầu tương ứng \- mỗi nhà thầu chỉ hiển thị các đầu mục có trong Bảng giá đang "Đang hoạt động" và còn hiệu lực của nhà thầu đó)  \- Nhà thầu đảm nhận: Kiểu UI: Dropdown. Quy tắc nạp: Hiển thị đầy đủ từng Option báo giá theo từng ĐVT của từng nhà thầu (không gộp 1 nhà thầu thành 1 dòng). Format Option: \[Tên Nhà Thầu\] \- \[Đơn giá chào\] \[Tiền tệ\] / \[Đơn vị tính (ĐVT)\]. \- Điểm hiệu suất nhà thầu (thang điểm tối đa 5 \--- định dạng "★ X.X/5", hiển thị 1 lần duy nhất cạnh tên nhà thầu, lấy từ trường "Điểm hiệu suất" trong quản lý Nhà thầu \--- thay thế SLA) |
| Nút hành động | \- | Button | 'Đóng' (hủy) / 'Xác nhận điều phối' (lưu, chuyển trạng thái dịch vụ='Điều phối') |

## 1.6.6. Bảng Khối Tham số Tiền tệ & Tỷ giá (Header Tab Chi phí)

| Tên trường | Bắt buộc? | Kiểu DL | Giá trị mặc định / Mô tả |
| ----- | ----- | ----- | ----- |
| **Loại tiền tệ** | Có | Dropdown | Cho phép chọn: VND (mặc định), USD, CNY (Nhân dân tệ)... Xác định loại tiền giao dịch cho các dòng chi phí của nhà thầu. |
| **Nguồn tỷ giá** | Có | Radio / Select | Cho phép chọn 02 phương thức xác định tỷ giá: 1\. **Tỷ giá VCB** : Hệ thống tự động lấy tỷ giá theo Ngân hàng Vietcombank. 2\. **Nhập tay**: Cho phép Coordinator tự nhập số tỷ giá quy đổi thực tế. |
| **Tỷ giá**  | Có | Number (\>0) | \+ *Nếu Nguồn tỷ giá \= "Tỷ giá VCB":* **Read-only** (Hệ thống tự động lấy theo tỷ giá bán Vietcombank mới nhất). \+ *Nếu Nguồn tỷ giá \= "Nhập tay":* **Cho phép nhập tay** trực tiếp số tỷ giá. \- **Mục đích:** Dùng để tính tự động cột **Tổng quy đổi (VND)** \= {Tổng chi}x{Tỷ giá quy đổi}. |

**4\. Quy tắc xác định Đơn vị tính (ĐVT) mặc định**

| \# | Tình huống | Quy tắc xác định ĐVT mặc định |
| ----- | ----- | ----- |
| 1 | Đầu mục chi phí chỉ có **1 ĐVT** đã cấu hình trong Bảng giá (Rate Sheet) đang hoạt động của nhà thầu | Hệ thống mặc định chọn đúng ĐVT duy nhất đó |
| 2 | Đầu mục chi phí có **nhiều hơn 1 ĐVT** đã cấu hình | Hệ thống chọn ĐVT của cấu hình được **cập nhật gần nhất** làm mặc định |

**Quyền chỉnh sửa:** Trên bảng chi phí chính (card dịch vụ) → ĐVT hiển thị **Read-only**. Coordinator phụ trách chỉ chỉnh sửa được qua modal **"Chỉnh sửa chi phí"**, và chỉ được chọn ĐVT nằm trong Rate Sheet của đúng nhà thầu tương ứng.

**5\. Cách tính Số lượng (SL) theo từng Đơn vị tính**

| ĐVT | Dịch vụ áp dụng | Nguồn dữ liệu / Cách tính cụ thể |
| ----- | ----- | ----- |
| **Xe giao hàng** | Khai báo Hải quan, Sang tải | SL Xe giao (Khai báo HQ): Tự động đếm tổng số lượng bản ghi xe trong *Xe giao hàng*. |
| **Xe nhận hàng** | Vận tải, Sang tải, Hải quan Giám sát | SL Xe nhận (Vận tải): Tự động đếm tổng số lượng bản ghi xe trong *Xe nhận hàng*. |
| **Cặp xe** | Sang tải | Đếm theo **số cặp xe giao – nhận** thực tế phát sinh tại Sang tải (1 cặp \= 1 lượt xe giao khớp 1 lượt xe nhận), không đếm xe giao/xe nhận riêng lẻ. |
| **Tờ khai** | Khai báo Hải quan | Trường **"Số lượng tờ khai"** (Thông tin thực tế), do Điều phối viên Khai báo HQ nhập khi hoàn thành khai báo. |
| **Ngày** | Kho bãi | \= Thời gian xuất kho thực tế − Thời gian nhập kho thực tế (tính theo 2 mốc Datetime thực tế Coordinator Kho bãi ghi nhận). |
| **Tấn** | Kho bãi | Trường **"Trọng lượng tồn thực tế"** — Coordinator nhập theo Tấn. |
| **m³ / Pallet / Kiện** | Kho bãi | Trường **"Số lượng thực tế"** — đơn vị đếm theo "Đơn vị tính sản lượng" đã khai báo ban đầu (VD nếu khai "Pallet" thì Số lượng thực tế tính theo Pallet). |
| **m³ / Pallet / Kiện** | Sang tải | Trường **"Số lượng thực tế"** tương ứng tại dịch vụ Sang tải, cùng nguyên tắc lấy theo Đơn vị tính sản lượng đã khai. |
| **JOB** | Mọi dịch vụ (phí trọn gói theo đầu việc, không gắn số lượng vận hành cụ thể) | Mặc định cố định \= **1**, không có field nguồn tương ứng. |

 **4\. Trạng thái bên cạnh Tab Chi phí**

* **Không có Chi phí phát sinh:** Hiển thị **Badge Màu Xanh** (Trạng thái vận hành bình thường).  
* **Có Chi phí phát sinh:** Hiển thị dòng **Đã duyệt** kèm **Badge Màu Xanh** (**Đã duyệt**). *(📌 Ghi chú Sprint: Do luồng Phê duyệt chi phí phát sinh chưa triển khai ở Sprint này, 100% chi phí phát sinh mặc định dán nhãn Đã duyệt màu xanh).*

## 1.6.7. Biến thể màn "Danh sách Dịch vụ" theo 5 vai trò Coordinator {#1.6.7.-biến-thể-màn-"danh-sách-dịch-vụ"-theo-5-vai-trò-coordinator}

Màn "Danh sách Dịch vụ" hiển thị KHÁC NHAU theo vai trò đăng nhập. 

- Vai trò CC dùng bộ lọc theo trạng thái TỔNG của Phiếu (mục 2.3.2).   
- 5 vai trò Coordinator (Customs Declaration/Customs Supervision/Transport/Transload/Warehouse), màn hình đổi sang lọc theo TRẠNG THÁI PHẦN VIỆC CỦA RIÊNG dịch vụ họ phụ trách trong từng phiếu, mô tả dưới đây.

| Tên trường | Bắt buộc? | Kiểu DL | Giá trị mặc định / Mô tả |
| :---- | :---- | :---- | :---- |
| Lọc nhanh phần việc | \- | Tab kèm số đếm | 5 tab, KHÁC HOÀN TOÀN với CC: Tất cả / Chờ xác định Chặng / Chưa thực hiện / Điều phối / Đang thực hiện / Đã thực hiện  |
| Cột 'TRẠNG THÁI PHẦN VIỆC CỦA BẠN' | \- | Badge/Button | Cột bổ sung riêng cho Coordinator (CC không có cột này) — hiển thị badge trạng thái dịch vụ \+ nút hành động nhanh tương ứng (VD 'Điều phối', 'Đang thực hiện') hoặc badge 'Chờ CC xác định cấu trúc Chặng' nếu phiếu chưa qua UC-CC-02 |
| Cột 'TRẠNG THÁI' (chung) | \- | Badge (readonly) | Vẫn hiển thị trạng thái TỔNG của phiếu (Tạo mới/Đã tiếp nhận/Đang thực hiện/Đã thực hiện/Từ chối) song song cột phần việc riêng, để Coordinator biết bối cảnh chung |
| Phân trang cuối bảng | \- | Text \+ control | 'Hiển thị X/Y phiếu dịch vụ' — xuất hiện ở cả 6 vai trò (CC \+ 5 Coordinator) |

## 1.6.8: Cấu trúc & Kịch bản hiển thị Nhật ký Tháp điều phối (Coordination Timeline)

[NhatKy\_ThapDieuPhoi](https://docs.google.com/spreadsheets/d/1CFOolsIx1YLx0kc9hDW_nw6AqJ9yXq3sY1siMD4Jhz0/edit?gid=0#gid=0)

Cấu trúc: \[Thời gian thực hiện\] \[Ngày thực hiện\] \- \[Label\]: \[Content\] \[Người thực hiện\] \- \[Actor\] 

Thời gian thực hiện: hh:mm Ngày thực hiện: dd/MM/yyyy Label \+ Content: Theo bảng danh sách kịch bản 

Người thực hiện: Tên tài khoản người dùng thao tác Actor: Vai trò người thực hiện 

Lưu ý: Nếu do hệ thống tự động thì "Người thực hiện \- Actor" \= "Hệ thống" 

| Thành phần | Định dạng |
| ----- | ----- |
| Ngày thực hiện | dd/MM/yyyy |
| Thời gian thực hiện | HH:mm |
| Label | Tên Nhóm sự kiện, tiếng Việt, đặt trong \[ \] |
| Content | Mẫu văn bản tự sinh, điền đủ tên người/dữ liệu thật — xem chi tiết Sheet 1 |
| Người thực hiện | Tên tài khoản người dùng thao tác |
| Actor |  Vai trò người thực hiện |

**Nguồn phát sinh log — mở rộng cho cả K1** (trước đây chỉ có K3): Panel áp dụng chung cho mọi tác nhân thao tác trên Phiếu dịch vụ — K1 (tạo/hủy/khôi phục/chỉnh sửa phiếu), Trưởng điều phối và Điều phối viên K3 (toàn bộ vòng đời \+ tác nghiệp).

## 1.6.9.  Quy chuẩn Trạng thái Chi phí từng Dịch vụ (Cost Status)

**Phạm vi áp dụng Trạng thái Phê duyệt theo Loại chi phí (Cost Line Level)**

Trạng thái phê duyệt chi phí chỉ áp dụng cho từng dòng đầu mục chi phí cụ thể theo quy tắc:

* Chi phí mặc định (Chi phí gốc theo hợp đồng / Rate Sheet): Cột Trạng thái phê duyệt ĐỂ TRỐNG (Blank). Chi phí mặc định mặc nhiên được công nhận theo Bảng giá AVL hiệu lực, không qua luồng phê duyệt phụ phí.  
* Chi phí phát sinh: CÓ trạng thái phê duyệt để ghi nhận và kiểm soát các khoản chi phí nằm ngoài dự kiến ban đầu.

**Quy tắc hiển thị màu sắc Tab/Badge Chi phí:**

* **MÀU XANH LÁ:** Khi tất cả các đầu mục chi phí đều ở trạng thái **Đã duyệt** (hoặc chỉ có chi phí mặc định).  
* **MÀU ĐỎ:** Khi có ít nhất 01 đầu mục chi phí đang ở trạng thái **Chưa duyệt** hoặc **Từ chối**.  
* *Ghi chú Sprint hiện tại: Do luồng duyệt phụ phí chưa triển khai, 100% chi phí phát sinh mặc định dán nhãn Đã duyệt* → *Tab Chi phí hiển thị Màu Xanh).*

## 1.6.6. Quy chuẩn hiển thị Sidebar theo Vai trò người dùng (RBAC Sidebar Visibility): Màn hình Trưởng điều phối (CC):

   \- Sidebar hiển thị đầy đủ cấu trúc toàn phiếu: Tổng chi phí quy đổi toàn phiếu \-\> Phân rã theo từng Chặng (Accordion Chặng 1, Chặng 2...) \-\> Breakdown chi phí từng Dịch vụ con.

**Màn hình 5 vai trò Điều phối viên Dịch vụ con (Coordinators):**

   \- Sidebar KHÔNG hiển thị tất cả các chặng và tất cả dịch vụ con của toàn phiếu.

   \- Hệ thống CHỈ hiển thị thêm cột/dòng "Tổng chi phí" đối với từng dịch vụ hiển thị thuộc phạm vi phân quyền phụ trách của Coordinator đó (Ví dụ: Transport Coordinator chỉ nhìn thấy dòng Tổng chi phí của dịch vụ Vận tải).

**BẢNG SO SÁNH HIỂN THỊ SIDEBAR CHI PHÍ K3**

| Thành phần Sidebar | Trưởng điều phối (CC) | Điều phối viên Dịch vụ con (Coordinators) |
| ----- | ----- | ----- |
| Tổng chi phí quy đổi toàn phiếu | Hiển thị | Ẩn (Chỉ hiển thị tổng chi dịch vụ mình làm) |
| Danh sách tất cả các Chặng (Chặng 1, 2...) | Hiển thị (Accordion) | KHÔNG hiển thị |
| Danh sách dịch vụ của phân hệ khác |  Hiển thị đầy đủ | KHÔNG hiển thị |
| Cột Tổng chi phí đối với dịch vụ hiển thị | Hiển thị | CHỈ HIỂN THỊ đúng dịch vụ được phân công |
| Khối Nhật ký Tháp điều phối (Timeline) | Hiển thị toàn bộ | Hiển thị (Read-only) |

## 1.6.10. Ma trận Rà soát & Mapping Thuộc tính khi Điều phối Nhà thầu AVL 

**Mô tả:** Ràng buộc các thuộc tính bắt buộc giữa Phiếu dịch vụ (K3) và Dòng giá mua đầu vào (Rate Sheet từ phân hệ Giá Mua Đầu Vào) để nạp danh sách nhà thầu và đơn giá tương ứng khi mở Modal "Khu điều phối nhà thầu AVL".

Quy tắc Mapping theo 5 Phân hệ:

| STT | Phân hệ / Dịch vụ con | Thuộc tính đặc thù BẮT BUỘC Mapping | Nguồn dữ liệu tra cứu trên Phiếu dịch vụ K3 |
| :---- | :---- | :---- | :---- |
| (1) | Vận tải | 1\. Điểm đi 2\. Điểm đến 3\. Loại xe | • Điểm đi, Điểm đến: Lấy từ Cấu trúc Chặng vận tải tương ứng. • Loại xe: Lấy từ Khối A (K1 khai báo) hoặc từ Xe nhận/vận tải do Transport Coordinator nhập trước. |
| (2) | Kho bãi | 1\. Tên kho 2\. Loại kho | • Tên kho: Lấy từ trường Tên kho tại Khối 1 (K3 chốt/sửa) .• Loại kho: Lấy từ trường Loại hình lưu kho tại Khối 1\. |
| (3) | Khai báo Hải quan | 1\. Chi cục hải quan 2\. Loại hình XNK 3\. Nhóm hàng 4\. Loại xe | • Chi cục HQ: Lấy từ Địa điểm làm thủ tục HQ tại Khối 1 .• Loại hình XNK, Nhóm hàng: Lấy từ Khối A & Khối B (Header). • Loại xe: Lấy từ Xe giao hàng (thông tin xe thực tế do K3 nhập trước) hoặc từ Khối A. |
| (4) | Hải quan Giám sát | 1\. Chi cục hải quan 2\. Loại hình XNK 3\. Nhóm hàng 4\. Loại xe | • Chi cục HQ: Lấy từ Đơn vị giám sát hải quan tại Khối 1\. • Loại hình XNK, Nhóm hàng: Lấy từ Khối A & Khối B (Header) .• Loại xe: Lấy từ Xe nhận/xe giao do K3 nhập trước hoặc từ Khối A. |
| (5) | Sang tải | 1\. Địa điểm sang tải 2\. Phương thức sang tải 3\. Nhóm hàng 4\. Đặc tính hàng hóa | • Địa điểm ST, Phương thức ST: Lấy từ Khối 1 & Khối 2 Dịch vụ Sang tải .• Nhóm hàng, Đặc tính hàng hóa: Lấy từ Khối A & Khối B (Header). |

Quy tắc khớp linh hoạt (Fallback Rule): Khi so khớp dữ liệu, nếu một thuộc tính trên Dòng giá mua đầu vào mang giá trị "Tất cả" thì dòng giá đó sẽ tự động khớp với mọi giá trị thực tế tương ứng của thuộc tính đó trên Phiếu dịch vụ (theo quy tắc BR32 trong phân hệ Giá Mua Đầu Vào).

# **1.7. BẢNG ĐẶC TẢ USE CASE DÙNG CHUNG CHO 5 DỊCH VỤ CON**

Toàn bộ 5 Dịch vụ con thuộc Tháp điều phối (K3) bao gồm: **Khai báo Hải quan, Hải quan Giám sát, Vận tải, Sang tải, Kho bãi** tuân theo **3 Use Case chuẩn chuẩn hóa** dưới đây.

Bảng Ma trận Ánh xạ Mã Use Case (Use Case Mapping Matrix):

| Tên Use Case dùng chung | Khai báo HQ | HQ Giám sát | Vận tải | Sang tải | Kho  |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **UC-COMMON-01: Điều phối nhà thầu** | UC-KHQ-01 | UC-HQGS-01 | UC-VT-01 | UC-ST-01 | UC-KB-01 |
| **UC-COMMON-02: Bắt đầu thực hiện** | UC-KHQ-02 | UC-HQGS-02 | UC-VT-02 | UC-ST-02 | UC-KB-02 |
| **UC-COMMON-03: Cập nhật thực tế & Hoàn thành** | UC-KHQ-03 | UC-HQGS-03 | UC-VT-03 | UC-ST-03 | UC-KB-03 |

1.7.1. UC-COMMON-01: Điều phối nhà thầu (Gán nhà thầu AVL)

| Mục | Nội dung đặc tả chi tiết |
| ----- | ----- |
| **Tên Use Case** | **Điều phối nhà thầu Dịch vụ con** |
| **Mã Use Case** | UC-COMMON-01 (Chi tiết: UC-KHQ-01, UC-HQGS-01, UC-VT-01, UC-ST-01, UC-KB-01) |
| **Actor** | Coordinator phụ trách dịch vụ tương ứng *(Xem bảng Ma trận biến thể Actor bên dưới)* |
| **Trigger** | Coordinator bấm nút **Điều phối nhà thầu** trên Card Dịch vụ tương ứng. |
| **Điều kiện tiên quyết** | \- Trạng thái dịch vụ \= **Chưa thực hiện**.  Cấu trúc Chặng đã được Consignment Controller (CC) xác nhận kích hoạt (UC-CC-02).  *Riêng dịch vụ Kho bãi:* Phải được CC gán vị trí vào một Chặng cụ thể trong cấu trúc Chặng. |
| **Luồng cơ bản (Main flow)** | 1\. Coordinator bấm nút **Điều phối nhà thầu**. 2\. Hệ thống mở Modal *"Khu điều phối nhà thầu AVL"*. 3\. Hệ thống hiển thị danh sách các Bảng giá thỏa thuận (Rate Sheet) từ Phân hệ Giá mua đầu vào (K2/K4) thỏa mãn điều kiện: Trạng thái \= Đang hoạt động, thời gian hiện tại nằm trong khoảng \[Ngày hiệu lực \- Ngày hết hiệu lực\], và đúng loại dịch vụ con (BR-K3-26). 4\. Coordinator chọn 01 hoặc nhiều Nhà thầu khả dụng. 5\. Gán nhà thầu đảm nhận từng đầu mục nhiệm vụ. Hệ thống tự động hiển thị Điểm hiệu suất nhà thầu (★ X.X/5) và Đơn vị tính (ĐVT) mặc định xét động theo cấu hình (BR-K3-21, BR-K3-25). 6\. Coordinator kiểm tra Bảng tổng hợp chi phí nhà thầu. 7\. Bấm **Xác nhận điều phối**. 8\. Hệ thống chuyển trạng thái dịch vụ sang **Điều phối**, ghi bản ghi ASSIGN\_VENDOR vào Nhật ký Tháp điều phối (Timeline). |
| **Luồng ngoại lệ (Exceptions)** | **E1. Không có Bảng giá/Nhà thầu AVL hợp lệ:** Hiển thị cảnh báo *"Không tìm thấy nhà thầu có bảng giá đang hoạt động cho dịch vụ này"*, chặn lưu. **E2. Thiếu ĐVT tại đầu mục chi phí:** Hệ thống báo lỗi vi phạm BR-K3-23, yêu cầu chọn ĐVT trước khi lưu. |
| **Hậu điều kiện** | Trạng thái dịch vụ \= **Điều phối**. Bảng chi phí nhà thầu được khởi tạo. |
| **Business Rules** | BR-K3-01, BR-K3-08, BR-K3-15, BR-K3-21, BR-K3-23, BR-K3-25, BR-K3-26. |

1.7.2. UC-COMMON-02: Bắt đầu thực hiện (Kích hoạt thực địa)

| Mục | Nội dung đặc tả chi tiết |
| ----- | ----- |
| **Tên Use Case** | **Bắt đầu thực hiện Dịch vụ con** |
| **Mã Use Case** | UC-COMMON-02 (Chi tiết: UC-KHQ-02, UC-HQGS-02, UC-VT-02, UC-ST-02, UC-KB-02) |
| **Actor** | Coordinator phụ trách dịch vụ tương ứng. |
| **Trigger** | Coordinator bấm nút **Bắt đầu thực hiện** trên Card Dịch vụ. |
| **Điều kiện tiên quyết** | \- Trạng thái dịch vụ \= **Điều phối**. \- *Điều kiện khóa theo Chặng (BR-K3-06):* Chặng chứa dịch vụ này phải đến lượt thực hiện (Chặng liền trước đã Đã thực hiện hoặc là Chặng 1). **NGOẠI LỆ:** Dịch vụ Khai báo Hải quan không áp dụng điều kiện này (BR-KHQ-01). |
| **Luồng cơ bản (Main flow)** | 1\. Coordinator bấm nút **Bắt đầu thực hiện**. 2\. Hệ thống kiểm tra điều kiện thứ tự Chặng (BR-K3-06). 3\. Hệ thống chuyển trạng thái dịch vụ sang **Đang thực hiện**. 4\. Nhãn nút hành động chính trên Card dịch vụ đổi thành **Hoàn thành dịch vụ**. 5\. Hệ thống ghi bản ghi START\_SERVICE vào Nhật ký Tháp điều phối. |
| **Luồng ngoại lệ (Exceptions)** | **E1. Chưa đến lượt Chặng (BR-K3-06):** Nút Bắt đầu thực hiện bị khóa mờ (Disabled). Rê chuột hiển thị Tooltip: *"Chờ hoàn thành Chặng \[N-1\] trước khi bắt đầu dịch vụ này"*. *(Lưu ý: Không áp dụng ngoại lệ này cho Khai báo Hải quan)*. |
| **Hậu điều kiện** | Trạng thái dịch vụ \= **Đang thực hiện**. |
| **Business Rules** | BR-K3-06, BR-K3-16, BR-KHQ-01. |

1.7.3. UC-COMMON-03: Cập nhật thông tin thực tế & Hoàn thành dịch vụ

| Mục | Nội dung đặc tả chi tiết |
| ----- | ----- |
| **Tên Use Case** | **Cập nhật thông tin thực tế & Hoàn thành Dịch vụ con** |
| **Mã Use Case** | UC-COMMON-03 (Chi tiết: UC-KHQ-03, UC-HQGS-03, UC-VT-03, UC-ST-03, UC-KB-03) |
| **Actor** | Coordinator phụ trách dịch vụ tương ứng. |
| **Trigger** | Coordinator bấm nút **Hoàn thành dịch vụ** trên Card Dịch vụ. |
| **Điều kiện tiên quyết** | Trạng thái dịch vụ \= **Đang thực hiện**. |
| **Luồng cơ bản (Main flow)** | 1\. Coordinator mở tab dịch vụ, nhập/xác nhận các trường dữ liệu thực tế tại khối *"2. Thông tin thực tế"* *(Xem ma trận dữ liệu trường thực tế theo từng dịch vụ bên dưới)*. 2\. Đính kèm các tệp chứng từ thực địa bắt buộc (POD, Tờ khai, Biên bản bốc xếp, Phiếu cân...). 3\. *(Tùy chọn)* Bổ sung các khoản Phụ phí / Chi phí phát sinh thực tế tại Bảng chi phí nhà thầu. 4\. Bấm nút **Hoàn thành dịch vụ**. 5\. Hệ thống kiểm tra validation dữ liệu bắt buộc của dịch vụ. 6\. Nếu hợp lệ: Chuyển trạng thái dịch vụ sang **Đã thực hiện**. 7\. Tự động kích hoạt các cơ chế Cascade SSOT / Phát cờ liên thông (BR-VT-01, BR-KHQ-04). 8\. Ghi bản ghi COMPLETE\_SERVICE và log cập nhật SSOT vào Nhật ký Tháp điều phối. 9\. *(Tự động chốt phiếu):* Nếu 100% dịch vụ thuộc mọi Chặng đều đã đạt Đã thực hiện, hệ thống tự động chuyển trạng thái toàn Phiếu dịch vụ sang **Đã thực hiện** (AUTO\_COMPLETE\_ORDER). |
| **Luồng ngoại lệ (Exceptions)** | 1\. Coordinator chỉnh sửa trường thuộc tính thuộc Ma trận Mapping AVL (ví dụ: đổi Chi cục Hải quan, đổi Loại xe, đổi Tên kho...).   2\. Hệ thống kiểm tra thấy Dịch vụ con hiện tại đang ở trạng thái "Điều phối" hoặc "Đang thực hiện".   3\. Hệ thống hiển thị Modal cảnh báo MSG-K3-WARN-04: "Thay đổi thông tin này sẽ HỦY Nhà thầu \[Tên\_Nhà\_Thầu\] đã gán và đưa dịch vụ về trạng thái Chưa thực hiện. Xác nhận thay đổi?".   4\. Nếu Coordinator bấm "Xác nhận":      \- Hệ thống xóa bản ghi gán nhà thầu và xóa Bảng chi phí cũ.      \- Cập nhật Trạng thái dịch vụ con \= "Chưa thực hiện".      \- Nhãn nút hành động đổi lại thành "Điều phối nhà thầu".      \- Push log vào Timeline.   5\. Nếu Coordinator bấm "Hủy bỏ":      \- Giữ nguyên thuộc tính cũ, giữ nguyên Nhà thầu và Trạng thái dịch vụ con. |
| **Hậu điều kiện** | Trạng thái dịch vụ \= **Đã thực hiện**. Dữ liệu SSOT được đóng đóng băng/Cascade sang các phân hệ liên quan. |
| **Business Rules** | BR-K3-05, BR-VT-01, BR-KHQ-03, BR-KHQ-04, BR-HQGS-01, BR-ST-01, BR-KB-01. |

Ma trận Dữ liệu thực tế & Quy tắc nghiệp vụ riêng từng dịch vụ (cho UC-COMMON-03):

| Dịch vụ con | Bắt buộc nhập tại Khối Thông tin thực tế | Cơ chế Cascade dữ liệu & Quy tắc đặc thù (SSOT / Business Rules) |
| ----- | ----- | ----- |
| **Khai báo Hải quan** | \- Mã tờ khai hải quan thực tế. \- Kết quả phân luồng (Xanh/Vàng/Đỏ). \- Ngày thông quan thực tế. \- Số lượng tờ khai. \- **Xe giao hàng** (BSX, Tải trọng, số Mooc, số Cont). | \- **Chốt SSOT Xe giao hàng (BR-KHQ-03):** Khi Coordinator Khai báo HQ bấm Lưu, thông tin Xe giao hàng tự động **Cascade  về Khối B (Thông tin chung \- Xe giao hàng)** ở Header phiếu. \- **Phát cờ Giám sát (BR-KHQ-04):** Nếu Phân luồng \= **Vàng/Đỏ**, hệ thống tự động phát cờ FLAG\_CUSTOMS\_SUPERVISION, tự động tick checkbox *"Yêu cầu giám sát bãi"* tại dịch vụ HQ Giám sát cùng Chặng. |
| **Hải quan Giám sát** | \- Đơn vị giám sát HQ. \- Kết quả kiểm hóa thực tế. \- Giờ vào / Giờ rời khu kiểm hóa. | \- Checkbox *"Yêu cầu giám sát bãi"* tự động kích hoạt dựa theo kết quả phân luồng từ Khai báo HQ (BR-HQGS-01). |
| **Vận tải** | \- Biển số xe nhận, Tài xế & SĐT. \- Số chì seal, Số Cont, Số Mooc. \- Thời gian lấy/giao hàng thực tế. | \- **Chốt SSOT Xe nhận hàng (BR-VT-01):** Dữ liệu BSX/Tài xế do Transport Coordinator nhập tự động **Cascade ngược lên Khối B (Thông tin chung \- Xe nhận hàng)** ở Header phiếu. Dịch vụ Sang tải (phần Xe nhận) tự động đọc kế thừa dữ liệu này. |
| **Sang tải** | \- Địa điểm/Loại hình/Phương thức sang tải. \- Số lượng thực nhận, Hiện trạng hàng. \- **Cặp xe sang tải** (Xe giao \- Xe nhận). | \- **Tham chiếu SSOT Cặp xe (BR-ST-01, BR-ST-02):** Xe giao đọc Read-only từ Khối B (do Khai báo HQ/K1 chốt); Xe nhận đọc Read-only từ Vận tải. Không nhập tay tự do. \- **Cảnh báo hư hỏng:** Nếu chọn *"Có phát sinh hư hỏng/móp méo"*, bắt buộc đính kèm \$\\ge 1\$ ảnh minh chứng hư hỏng mới cho phép Hoàn thành. |
| **Kho bãi** | \- Tên kho sử dụng, Loại hình kho. \- Trọng lượng / Sản lượng tồn thực tế.  Thời gian nhập / xuất kho thực tế. \- **Checklist dịch vụ VAS** (4 mục). | \- **Ràng buộc VAS (BR-KB-01):** Bảng 4 checkbox VAS (Đóng gói lại, Quấn màng co, Dán nhãn phụ, Kiểm đếm chi tiết) lưu độc lập dạng boolean. \- **Cảnh báo chênh lệch sản lượng:** Cảnh báo (không chặn) nếu sản lượng thực tế nhập kho lệch so với sản lượng sang tải/vận tải liền trước. |

 **Bảng ma trận phân định chi tiết các trường khi KẾT THÚC DỊCH VỤ:**

| Dịch vụ con | Trường BẮT BUỘC phải điền khi KẾT THÚC dịch vụ (Hoàn thành dịch vụ) | Trường KHÔNG BẮT BUỘC (Tùy chọn) |
| ----- | ----- | ----- |
| Khai báo Hải quan | • Mã tờ khai hải quan thực  • Kết quả phân luồng (Xanh/Vàng/Đỏ) • Ngày thông quan thực tế (\<=Thời gian hiện tại) • Số lượng tờ khai | • Ghi chú  |
| Hải quan Giám sát | • Kết quả kiểm hóa thực tế • Giờ vào khu thực tế • Giờ rời khu thực | • Ghi chú |
| Vận tải | • Biển số xe nhận • Tải trọng (bắt buộc nếu đã nhập BSX) • Số chì niêm phong (Seal) • Thời gian lấy hàng thực tế  • Thời gian giao hàng thực tế  • Biên bản giao hàng và file đính kèm (File POD có chữ ký) |  • Ghi chú |
| Sang tải | • Địa điểm sang tải & Phương thức sang tải thực tế • Quy cách đóng gói thực tế & Số lượng thực nhận • Cặp xe sang tải (Xe giao \- Xe nhận) • Tình trạng hàng hóa thực tế (Radio)*( Bắt buộc đính kèm Ảnh hư hỏng nếu chọn "Có phát sinh hư hỏng")* | • Ghi chú |
| Kho bãi | • Số lượng thực tế nhập kho • Trọng lượng tồn thực tế (Tấn) • Thời gian nhập kho thực tế • Thời gian xuất kho thực tế (\<=Thời gian nhập kho) | • Checklist dịch vụ VAS (nếu không thực hiện)• Ghi chú |

# 

# **1.8. BẢNG DANH SÁCH THÔNG BÁO** 

Toàn bộ các phản hồi hệ thống (System Responses) phát sinh trong quá trình vận hành Tháp điều phối (K3) được chuẩn hóa theo bộ mã duy nhất dưới đây.

1.8.1. Phân loại hình thức hiển thị UI/UX:

* Toast Notification: Thông báo ngắn tự ẩn sau 3 giây ở góc trên bên phải màn hình (Dành cho các thao tác thành công hoặc cảnh báo nhanh).  
* Inline Validation: Hiển thị viền đỏ và dòng chữ báo lỗi ngay dưới chân trường dữ liệu bị vi phạm (Dành cho lỗi nhập liệu).  
* Modal Popup: Hộp thoại cảnh báo/xác nhận nằm giữa màn hình, bắt buộc người dùng bấm nút xác nhận/đóng mới được tiếp tục (Dành cho lỗi hệ thống, lỗi chặn luồng hoặc xác nhận thao tác quan trọng).

1.8.2. Bảng Mã Thông Báo & Lỗi Chi Tiết

| Mã Mã Lỗi / Thông báo | Loại UI | Loại tin | Nội dung văn bản hiển thị trên UI (Message Text) | Điều kiện kích hoạt / Trigger Condition | Phạm vi áp dụng |
| ----- | ----- | ----- | ----- | ----- | ----- |
| I. BỘ MÃ THÔNG BÁO THÀNH CÔNG (MSG-K3-SUCCESS-xxx) |  |  |  |  |  |
| MSG-K3-SUCCESS-01 | Toast | 🟢 Thành công | "Tiếp nhận Phiếu dịch vụ thành công\!" | Khi Consignment Controller (CC) bấm tiếp nhận phiếu thành công (UC-CC-01). | Toàn phiếu |
| MSG-K3-SUCCESS-02 | Toast | 🟢 Thành công | "Xác nhận cấu trúc {N} Chặng và kích hoạt phiếu thành công\!" | Khi CC chốt cấu trúc chặng (UC-CC-02). | Toàn phiếu |
| MSG-K3-SUCCESS-03 | Toast | 🟢 Thành công | "Điều phối nhà thầu {Tên\_Nhà\_Thầu} thành công cho dịch vụ {Tên\_Dịch\_Vụ}\!" | Khi Coordinator gán nhà thầu AVL thành công (UC-COMMON-01). | Dùng chung 5 Dịch vụ |
| MSG-K3-SUCCESS-04 | Toast | 🟢 Thành công | "Dịch vụ {Tên\_Dịch\_Vụ} đã chuyển sang trạng thái Đang thực hiện." | Khi Coordinator bấm *Bắt đầu thực hiện* (UC-COMMON-02). | Dùng chung 5 Dịch vụ |
| MSG-K3-SUCCESS-05 | Toast | 🟢 Thành công | "Hoàn thành dịch vụ {Tên\_Dịch\_Vụ} tại {Tên\_Chặng} thành công\!" | Khi Coordinator bấm *Hoàn thành dịch vụ* (UC-COMMON-03). | Dùng chung 5 Dịch vụ |
| MSG-K3-SUCCESS-06 | Toast | 🟢 Thành công | "Đã cập nhật và đồng bộ thông tin phương tiện (SSOT) thành công." | Khi Khai báo HQ hoặc Vận tải cập nhật thông tin xe giao/nhận thành công. | Khai báo HQ / Vận tải |
| II. BỘ MÃ CẢNH BÁO VẬN HÀNH (MSG-K3-WARN-xxx) |  |  |  |  |  |
| MSG-K3-WARN-01 | Modal | 🟡 Cảnh báo | "Tờ khai phân luồng {Vàng/Đỏ}. Hệ thống đã tự động kích hoạt Yêu cầu Giám sát Hải quan tại bãi." | Khi kết quả phân luồng Hải quan chọn Vàng/Đỏ (BR-KHQ-04). | Khai báo HQ / HQGS |
| MSG-K3-WARN-02 | Modal | 🟡 Cảnh báo | "Cảnh báo: Sản lượng nhập kho thực tế ({SL\_Kho}) lệch so với sản lượng sang tải ({SL\_ST}). Bạn có chắc chắn muốn tiếp tục?" | Khi ghi nhận sản lượng Kho bãi lệch so với Sang tải liền trước (BR-KB-01). | Kho bãi |
| MSG-K3-WARN-03 | Toast | 🟡 Cảnh báo | "Ghi nhận hàng hóa có hư hỏng/móp méo. Bắt buộc đính kèm tệp ảnh minh chứng hiện trường." | Khi chọn checkbox *"Có hư hỏng"* tại dịch vụ Sang tải. | Sang tải |
| III. BỘ MÃ LỖI RÀNG BUỘC & VALIDATION (ERR-K3-VAL-xxx) |  |  |  |  |  |
| ERR-K3-VAL-01 | Inline | 🔴 Lỗi | *"Vui lòng nhập đầy đủ các trường thông tin thực tế bắt buộc (* ) trước khi bấm Hoàn thành dịch vụ."  | Khi bấm Lưu/Hoàn thành mà chưa điền trường bắt buộc. | Dùng chung 5 Dịch vụ |
| ERR-K3-VAL-02 | Inline | 🔴 Lỗi | "Biển số xe không đúng định dạng chuẩn (Ví dụ hợp lệ: 29C12345 hoặc 29C-123.45)." | Nhập sai quy chuẩn regex Biển số xe. | Dùng chung 5 Dịch vụ |
| ERR-K3-VAL-03 | Inline | 🔴 Lỗi | "Định dạng Container không hợp lệ (Phải gồm 4 chữ cái và 7 chữ số, VD: TGHU1234567)." | Nhập sai quy chuẩn ISO 6346 Container. | Dùng chung 5 Dịch vụ |
| ERR-K3-VAL-04 | Modal | 🔴 Lỗi | "Bắt buộc đính kèm tối thiểu 01 tệp chứng từ thực địa ({Tên\_Chứng\_Từ}) trước khi hoàn thành dịch vụ." | Thiếu file chứng từ bắt buộc (POD, Tờ khai...) khi bấm Hoàn thành. | Dùng chung 5 Dịch vụ |
| ERR-K3-VAL-05 | Inline | 🔴 Lỗi | "Thời gian xuất kho thực tế phải lớn hơn hoặc bằng Thời gian nhập kho thực tế." | Nhập mốc thời gian xuất kho trước thời gian nhập kho. | Kho bãi |
| IV. BỘ MÃ LỖI QUY TẮC NGHIỆP VỤ & HỆ THỐNG (ERR-K3-BR-xxx) |  |  |  |  |  |
| ERR-K3-BR-01 | Modal | 🔴 Lỗi | "Chưa đến lượt thực hiện\! Vui lòng chờ Chặng liền trước hoàn thành trước khi bắt đầu dịch vụ này." | Bấm *Bắt đầu thực hiện* khi Chặng trước chưa Đã thực hiện (BR-K3-06). *(Trừ Khai báo HQ)*. | HQGS / VT / ST / KB |
| ERR-K3-BR-02 | Modal | 🔴 Lỗi | "Không tìm thấy Bảng giá thỏa thuận (Rate Sheet) ở trạng thái 'Đang hoạt động' cho nhà thầu được chọn." | Chọn nhà thầu không có bảng giá hiệu lực tại khu điều phối AVL (BR-K3-26). | Dùng chung 5 Dịch vụ |
| ERR-K3-BR-03 | Modal | 🔴 Lỗi | "Vui lòng chọn Đơn vị tính (ĐVT) hợp lệ cho tất cả các đầu mục chi phí nhà thầu." | Thiếu ĐVT tại dòng chi phí nhà thầu (BR-K3-23). | Dùng chung 5 Dịch vụ |
| ERR-K3-BR-04 | Modal | 🔴 Lỗi | "Bạn không có quyền thực hiện thao tác này đối với vai trò hiện tại." | Người dùng truy cập thao tác vượt thẩm quyền phân quyền RBAC. | Toàn hệ thống |

# **1.9. Ràng buộc Validation Ngày thông quan thực tế & Các trường ngày/giờ**

**1\. Nguyên tắc Kiểm tra Thời gian** 

- **Quy tắc 1 — Chặn Ngày Tương lai (So với Hiện tại):** **Chỉ check NGÀY (Date \<= Today)**.  
  * Bỏ qua Giờ để user tự do chọn bất kỳ giờ nào trong ngày hiện tại mà không bị lệch phút/giây so với giờ hệ thống (Now).  
- **Quy tắc 2 — Cặp Thời gian Tuần tự (So với Mốc trước đó):** **BẮT BUỘC CHECK ĐẦY ĐỦ CẢ NGÀY \+ GIỜ (Timestamp\_Sau \>= Timestamp\_Trước)**.  
  * Khi 2 sự kiện diễn ra trong **cùng 01 ngày**, hệ thống bắt buộc kiểm tra Giờ Sau \>= Giờ Trước.

**2\. Bảng Phân loại Loại Thời gian & Quy tắc Giới hạn Chi tiết**

| LOẠI THỜI GIAN | TRƯỜNG DỮ LIỆU ÁP DỤNG | QUY TẮC GIỚI HẠN  | VÍ DỤ |
| :---- | :---- | :---- | :---- |
| **NHÓM 1:Giới hạn Tương lai**  | • Ngày thông quan thực tế • Thời gian lấy hàng thực tế • Thời gian giao hàng thực tế • Giờ vào/ra khu thực tế • Thời gian nhập/xuất kho thực tế | **CHỈ CHECK NGÀY (Date \<= Today)** | **• Chặn chọn Ngày Tương lai:** Hôm nay \= 28/09/2026 $\rightarrow$ Được chọn ngày 28/09/2026 (bất kỳ giờ nào) hoặc ngày trong quá khứ. Chặn hoàn toàn các ngày từ 29/09/2026 trở đi. |
| **NHÓM 2:Cặp Thời gian Tuần tự** *(So với Mốc trước)* | **1\. Vận tải:** Thời gian giao thực tế vs Thời gian lấy thực tế **2\. Kho bãi:** Thời gian xuất kho thực tế vs Thời gian nhập kho thực tế **3\. HQ Giám sát:**Giờ rời khu thực tế vs Giờ vào khu thực tế | **CHECK ĐẦY ĐỦ CẢ NGÀY \+ GIỜ**  | **• Ràng buộc tuần tự thời gian thực tế:**Mốc thời gian sau **bắt buộc lớn hơn hoặc bằng** mốc thời gian trước cả về Ngày lẫn Giờ/Phút. **• Ví dụ sai (Chặn lỗi):**Lấy hàng: 28/09 14:00, Giao hàng: 28/09 10:00 $\rightarrow$ **HỆ THỐNG BÁO LỖI**  |
| **NHÓM 3:Thời gian Dự kiến** | • Thời gian lấy/giao dự kiến • Thời gian lưu kho dự kiến | **KHÔNG GIỚI HẠN** | Cho phép chọn ngày/giờ tương lai bình thường. |

**3\. Cập nhật Bảng Mã Lỗi Validation** 

* **Chọn ngày tương lai:**

 *"Mốc thời gian thực tế không được chọn ngày trong tương lai."*

* **Lệch giờ/ngày cặp tuần tự:**

 *"\[Thời gian giao/xuất/rời thực tế\] ({Time\_Sau}) không được nhỏ hơn \[Thời gian lấy/nhập/vào thực tế\] ({Time\_Truoc})."*

# **II. TRƯỞNG ĐIỀU PHỐI-CONSIGNMENT CONTROLLER** {#ii.-trưởng-điều-phối-consignment-controller}

# **2.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)** {#2.1.-sơ-đồ-luồng-nghiệp-vụ-(business-process-flow)}

[*Tham chiếu sơ đồ*](https://app.diagrams.net/#G1WrTNfp9d8UiaKMEsaWxzNzQP17zKQS0P#%7B%22pageId%22%3A%22ea0sM0AHgEiJgN7m9QWo%22%7D)

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tiếp nhận đơn | CC | Xem đơn 'Tạo mới', bấm 'Tiếp nhận phiếu' | Đơn từ K1 | trạng thái phiếu \= "Đã tiếp nhận" | Đơn phải đủ Header |
| Mở modal cấu trúc Chặng | CC | Hệ thống tự tính trước cấu trúc theo Công cụ tính Chặng | Loại hình XNK, Loại hình vận tải, Điểm đi/đến thực tế | Preview N Chặng | Áp đúng 1 trong 5 RULE |
| Xác định vị trí Kho bãi | CC | Kéo-thả hoặc bấm nút gán Kho bãi vào Chặng phù hợp | Preview Chặng | Vị trí Kho bãi đã gán | Không bắt buộc nếu đơn không có Kho bãi |
| Xác nhận & kích hoạt | CC | Bấm nút khóa cứng cấu trúc | Cấu trúc Chặng đã xem trước | cấu trúc Chặng đã xác nhận; trạng thái phiếu="Đang thực hiện" | Không sửa lại được sau bước này |

# **2.2. Mô tả giao diện — Bảng field** {#2.2.-mô-tả-giao-diện-—-bảng-field}

| Khối | Tên trường | Bắt buộc? | Kiểu DL | Max Length | Giá trị mặc định / Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Khối A \- Thông tin chung | Khách hàng | \- | Text (readonly) | \- | Dữ liệu K1 bàn giao, không sửa được ở K3 |
| Khối A \- Thông tin chung | Mã tham chiếu | \- | Text (readonly) | \- | Dữ liệu K1 bàn giao |
| Khối A \- Thông tin chung | Loại hình XNK | \- | Text/Badge (readonly) | \- | *'Loại hình XNK' (Xuất kinh doanh, Nhập kinh doanh, Tạm nhập tái xuất...) do K1 chọn phục vụ cho nghiệp vụ Khai báo Hải quan và Quản lý thương mại. Trường này hoàn toàn độc lập và KHÔNG tham gia vào bộ khóa kiểm tra/match quy tắc chặng của Công cụ tính Chặng (Cấu hình Chặng chỉ match dựa trên 5 thuộc tính: Phạm vi thực hiện \+ Phương thức vận tải \+ Loại hình vận tải \+ Điểm đi \+ Điểm đến).* |
| Khối A \- Thông tin chung | Cửa khẩu | \- | Text (readonly) | \- | Từ danh mục Cửa khẩu (SRS\_07) |
| Khối A \- Thông tin chung | Đặc tính hàng hóa | \- | Text/Badge (readonly) | \- | Từ danh mục Đặc tính hàng hóa (SRS\_07); mặc định 'Hàng thường' nếu không gắn đặc tính nào |
| Khối A \- Thông tin chung | Phương thức vận tải | \- | Text (readonly) | \- | VD: Đường bộ liên vận |
| Khối A \- Thông tin chung | Loại hình vận tải | \- | Text (readonly) | \- | VD: 'Đường bộ liên vận (FTL)' — hiển thị Loại hình vận tải của quy tắc Công cụ tính Chặng đã áp dụng (xem Cấu hình Chặng |
| Khối A \- Thông tin chung | Tên Điểm đi / Tên Điểm đến | \- | Text (readonly) | \- | Dữ liệu K1 bàn giao, dùng làm căn cứ Công cụ tính Chặng |
| Khối A \- Thông tin chung | Ghi chú  | \- | Textarea (readonly) | \- | Ghi chú vận hành tổng thể từ K1 |
| Khối A \- Thông tin chung | Quy tắc dự kiến áp dụng | \- | Badge (RULE-xx readonly) | \- | Mã quy tắc Công cụ tính Chặng \+ mô tả ngắn, VD 'RULE-XK-01 (Thu gom hàng từ nội địa ra Cửa khẩu xuất..., sinh 2 Chặng)' |
| Khối B \- Thông tin hàng hóa | Tên hàng hóa | \- | Text (readonly) | \- | \- |
| Khối B \- Thông tin hàng hóa | Thể tích | \- | Text (readonly) | \- | VD: 45 m3 |
| Khối B \- Thông tin hàng hóa | Trọng lượng | \- | Text (readonly) | \- | VD: 15.0 Tấn |
| Khối B \- Thông tin hàng hóa | Quy cách đóng gói | \- | Text (readonly) | \- | VD: Pallet đóng màng co |
| Khối B | Xe giao hàng | Không | Text (readonly) | Read-only | Đồng bộ tự động từ *Dịch vụ Khai báo Hải quan (K3)*. Hiển thị danh sách  xe giao (BSX, Tải trọng, Mooc, Cont, Tài xế, CCCD, SĐT, Chứng từ xe). |
| Khối B | Danh sách Xe nhận hàng | Không | Text (readonly) | Read-only | Cascade ngược tự động từ *Dịch vụ Vận tải (K3)*. Hiển thị danh sách xe nhận (BSX, Tải trọng, Mooc, Cont, Tài xế, SĐT, CCCD,Seal, Chứng từ xe). |
| Khối B \- Thông tin xe | Thông tin xe giao hàng | \- | Card, expand/collapse (readonly) | \- | Biển số xe \+ Tải trọng \+ Tài xế \+ SĐT \+CCCD+ Số Cont \+ Số Mooc+Chứng từ xe. K1 nhập trước (tùy chọn). Nếu K1 không nhập, Điều phối viên Khai báo Hải quan (K3) sẽ nhập tại dịch vụ Khai báo HQ và hệ thống tự động cascade về Khối B. K3 là nguồn chốt SSOT cuối cùng.  |
| Khối B \- Thông tin xe | Thông tin xe nhận hàng | \- | Card, expand/collapse (readonly) | \- | Biển số xe \+ Tải trọng \+ Tài xế \+ SĐT \+ CCCD  CHỨNG TỪ KÈM THEO XE  — CASCADE NGƯỢC từ 'Thông tin thực tế' của dịch vụ Vận tải sau khi Coordinator Vận tải nhập/xác nhận. Sang tải (Xe nhận trong cặp xe) đọc theo giá trị này (xem BR-VT-01 đã sửa lại) |
| Khối 'Chi tiết Dịch vụ yêu cầu' | Tab chọn dịch vụ | \- | Tab đơn (dạng checkbox, single-select) | \- | 5 tab tương ứng 5 dịch vụ chuẩn; tick 1 tab để xem thông tin dịch vụ đó, không phải multi-select danh sách yêu cầu. Luôn hiển thị được kể cả khi phiếu đang ở trạng thái 'Tạo mới' (trước khi Tiếp nhận/Xác định cấu trúc Chặng) |
| Khối 'Chi tiết Dịch vụ yêu cầu' | Sub-tab 'Thông tin \[dịch vụ\]' | \- | Tab | \- | Hiển thị dữ liệu K1 bàn giao cho dịch vụ đang chọn — nội dung TRÙNG với nhóm field '1. Thông tin khai báo' đã đặc tả riêng ở từng module (mục 3.2.2/4.3.2/5.2.2/6.3.2/7.3.2), không lặp lại chi tiết field tại đây |
| Khối 'Chi tiết Dịch vụ yêu cầu' | Sub-tab 'Doanh thu' | \- | Tab (luôn disabled) | \- | Luôn ở trạng thái mờ/không bấm được đối với mọi vai trò K3 — bằng chứng UI củng cố BR-K3-01 (K3 không chạm doanh thu/giá bán cho khách hàng) |
| Danh sách Dịch vụ | Ô tìm kiếm | \- | Text input | \- | Tìm theo Mã phiếu DV, BSX giao hàng/nhận hàng, Khách hàng |
| Danh sách Dịch vụ | Mã phiếu DV | — | Text (link) | — | Mở Chi tiết phiếu |
| Danh sách Dịch vụ | Khách hàng | — | Text | — | Tên KH  |
| Danh sách Dịch vụ | Các dịch vụ | — | Badge list | — | Badge màu theo loại dịch vụ |
| Danh sách Dịch vụ | BSX giao hàng / nhận hàng | — | Text | — | Biển số xe (SSOT) |
| Danh sách Dịch vụ | Trạng thái | — | Badge | — | trạng thái phiếu — badge PHẢI derive trực tiếp từ bước hiện tại trên stepper 'Tiến độ thực hiện phiếu tổng', không lưu/cache giá trị riêng |
| Danh sách Dịch vụ | Ngày tạo / Ngày đã thực hiện | \- | Datetime (readonly) | \- | Ngày tạo \= timestamp bước 'Tạo mới'; Ngày đã thực hiện \= timestamp bước 'Đã thực hiện' (rỗng nếu chưa hoàn tất) |
| Danh sách Dịch vụ | Lọc nhanh tiến độ tổng | — | Tab | — | 5 tab kèm số đếm: Tất cả / Tạo mới / Đã tiếp nhận / Đang thực hiện / Đã thực hiện / Từ chối — chỉ áp dụng cho vai trò CC (xem mục 1.6.3 cho biến thể 5 vai trò Coordinator) |
| Modal Bộ lọc nâng cao | Khách hàng | \- | Dropdown | \- | Mặc định 'Tất cả khách hàng' |
| Modal Bộ lọc nâng cao | Các dịch vụ | \- | Multi-select chip | \- | 5 dịch vụ chuẩn, chọn nhiều |
| Modal Bộ lọc nâng cao | BSX giao hàng / BSX nhận hàng | \- | Text input | \- | Tìm gần đúng (contains), 2 ô riêng biệt |
| Modal Bộ lọc nâng cao | Trạng thái | \- | Checkbox nhiều lựa chọn | \- | Tạo mới / Đã tiếp nhận / Đang thực hiện / Đã thực hiện / Từ chối  |
| Modal Bộ lọc nâng cao | Ngày tạo | \- | Quick filter \+ Từ ngày/Đến ngày | \- | Quick filter: Hôm qua/Hôm nay/Tuần này/Tháng này |
| Modal Bộ lọc nâng cao | Ngày hoàn thành | \- | Quick filter \+ Từ ngày/Đến ngày | \- | Cấu trúc giống Ngày tạo, lọc theo Ngày đã thực hiện |
| Modal Bộ lọc nâng cao | Nút hành động | \- | Button | \- | 'Đặt lại' (xóa toàn bộ filter) / 'Áp dụng' (đóng modal, áp filter vào bảng) |
| Modal Xác định cấu trúc Chặng | Quy tắc áp dụng | — | Text (readonly) | — | Tên RULE \+ mô tả ngắn |
| Modal Xác định cấu trúc Chặng | Danh sách Chặng | — | Card list | — | Tên Chặng \+ badge dịch vụ cố định |
| Modal Xác định cấu trúc Chặng | Vị trí Kho bãi | Có (nếu có KB) | Drag-drop | — | Kéo-thả badge Kho bãi giữa các khối Chặng |
| Khối 'Cấu trúc N Chặng' | Điểm đi / Điểm đến của Chặng | \- | Text \+ pin icon (readonly) | \- | 2 điểm dạng pin (đỏ=điểm đi, cam=điểm đến) hiển thị ngay dưới tiêu đề mỗi Chặng — KHÁC với 'Tên Điểm đi/đến thực tế' ở Khối A (đó là điểm đầu-cuối của TOÀN Phiếu, còn đây là điểm riêng của từng Chặng) |
| Khối 'Cấu trúc N Chặng' | Dịch vụ thuộc Chặng này (N) | \- | Badge list (readonly) | \- | Liệt kê các dịch vụ đang active trong Chặng đó; bấm vào badge để cuộn tới/mở card chi tiết dịch vụ tương ứng |
| Khối 'Cấu trúc N Chặng' | Trạng thái Chặng | \- | Badge | \- | Hiển thị góc phải mỗi Chặng: Chưa bắt đầu / Điều phối / Đang thực hiện / Đã thực hiện — tổng hợp tự động từ trạng thái các dịch vụ con thuộc Chặng đó |
| Khối 'Cấu trúc N Chặng' | Nút hành động dịch vụ (trạng thái khóa) | \- | Button \+ icon khóa | \- | Dịch vụ thuộc Chặng CHƯA tới lượt thực hiện (BR-K3-06) hiển thị nút hành động ở trạng thái disabled kèm icon khóa, không cho bấm cho tới khi Chặng trước đó chuyển 'Đã thực hiện' |
| Khối 'Cấu trúc N Chặng' | Tổng chi phí quy đổi theo Chặng | — | Text (readonly) | — | Tổng hợp chi phí quy đổi (VND) của các dịch vụ thuộc Chặng đó, hiển thị cạnh tên mỗi Chặng |
| Panel Tổng chi quy đổi | Danh sách theo Chặng | — | List (readonly) | — | Thay thế cách liệt kê phẳng theo dịch vụ trước đây — mỗi dòng là 1 Chặng kèm tổng chi quy đổi |
| Panel Tổng chi quy đổi | Chi tiết theo dịch vụ (expand) | — | Accordion | — | Bấm 'Chi tiết' tại 1 dòng Chặng để mở rộng breakdown chi phí quy đổi theo từng dịch vụ con thuộc Chặng đó |
| Panel Nhật ký Tháp điều phối | Danh sách log | \- | List (readonly, append-only) | \- | Mỗi dòng: \[Timestamp\] \- \[Loại\] mô tả ngắn hành động (VD 'bổ sung thông tin Trạm kiểm soát Dấu Giây'); log mới nhất hiển thị TRÊN CÙNG |
| Panel Nhật ký Tháp điều phối | Nút 'Tải lại' | \- | Button (icon refresh) | \- | Làm mới danh sách log không cần reload cả trang |

 

# **2.3. Quy tắc nghiệp vụ (Business Rule)** {#2.3.-quy-tắc-nghiệp-vụ-(business-rule)}

•  BR-K3-01: K3 không chạm vào tiền — không nhập/duyệt số liệu tài chính gốc.

•  BR-K3-02: Có nhiều Chặng, đúng 1 trong 5 RULE Công cụ tính Chặng.

•  BR-K3-03: Khi phiếu có đăng ký Kho bãi, Leg Engine mặc định gán Kho bãi vào Chặng 1; CC có quyền kéo-thả di chuyển Kho bãi sang Chặng lưu kho thực tế trước khi kích hoạt

•  BR-K3-04: Cấu trúc Chặng khóa cứng sau xác nhận.

•  BR-K3-08: Chỉ Điều phối viên dịch vụ mới thao tác Điều phối nhà thầu/tiến độ, không phải CC.

•  BR-K3-09: Phụ phí/Chi phí phát sinh tự nhập ở tab Chi phí (thuộc dịch vụ con) không qua duyệt — khác với Raise yêu cầu chi phí phát sinh ở cấp CC (vẫn qua duyệt K2/K4).

•  BR-K3-10: Từ chối phiếu bị chặn nếu có Chặng active.

•  BR-K3-11: Không gắn nhãn quốc gia vào tên Chặng.

•  BR-K3-12: Mọi vị trí hiển thị badge trạng thái tổng của Phiếu dịch vụ trong toàn hệ thống K3 (bảng Danh sách Dịch vụ, header trang Chi tiết Phiếu dịch vụ, và bất kỳ widget/card tóm tắt nào khác) PHẢI dùng chung DUY NHẤT 1 hàm/1 selector để tính badge, đọc trực tiếp từ bước gần nhất đã hoàn tất trên thanh 'Tiến độ thực hiện phiếu tổng' (trạng thái phiếu) — nghiêm cấm lưu/cache giá trị badge tách rời hoặc cài đặt logic tính toán riêng ở từng màn hình, tránh lệch pha giữa các nơi hiển thị.

•  BR-K3-13: Panel 'Tổng chi quy đổi' hiển thị theo cấu trúc phân cấp Chặng → Dịch vụ — mỗi Chặng hiển thị 1 dòng tổng hợp chi phí quy đổi, bấm 'Chi tiết' mở rộng breakdown theo từng dịch vụ con thuộc Chặng đó; không còn liệt kê phẳng theo dịch vụ như phiên bản trước

**2.6. Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Bấm 'Tiếp nhận phiếu' khi Header thiếu dữ liệu | Lỗi | Đơn thiếu thông tin bắt buộc từ K1, vui lòng liên hệ K1 bổ sung | Không chuyển trạng thái |

 

# **III. KHAI BÁO HẢI QUAN** {#iii.-khai-báo-hải-quan}

# **3.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)** {#3.1.-sơ-đồ-luồng-nghiệp-vụ-(business-process-flow)}

*Tham chiếu sơ đồ: [02\_QuyTrinh\_KhaiBaoHaiQuan](https://app.diagrams.net/#G1WrTNfp9d8UiaKMEsaWxzNzQP17zKQS0P#%7B%22pageId%22%3A%2202Jq5eo0ooqGO41YVjFe%22%7D).drawio (3 lane: Coordinator/Nhà thầu/Hệ thống, 3 giai đoạn)*

# **3.2 Mô tả giao diện — Bảng field**

| Khối | Tên trường | Bắt buộc? | Kiểu DL | Max Length | Giá trị mặc định / Mô tả |
| :---- | :---- | ----- | :---- | :---- | :---- |
| Thông tin nhà thầu | Danh sách nhà thầu đã điều phối | \- | List \+ badge % Điểm hiệu suất nhà thầu | \- | Hiển thị tên từng nhà thầu đã chọn ở Modal 'Khu điều phối nhà thầu AVL' kèm % Điểm hiệu suất nhà thầu; link 'Sửa gán nhà thầu' mở lại Modal AVL để điều chỉnh (xem mục 1.6.1) |
| 1\. Thông tin khai báo | Địa điểm làm thủ tục HQ | Có | Dropdown | Không cho phép sửa  | Nạp dữ liệu từ Bảng Danh mục Chi cục Hải quan (Module Quản lý danh mục / Master Data). \- K1 chọn mặc định ban đầu. |
| 1\. Thông tin khai báo | Số lượng tờ khai |  | Number | 5 | 1 |
| 1\. Thông tin khai báo | Ghi chú | — | Textarea | — | — |
| 1\. Thông tin khai báo | Chứng từ lô hàng | — | File list | — | Có thể nhiều file |
| 2\. Thông tin thực tế | Mã tờ khai hải quan thực tế | v | Text | 20 | — |
| 2\. Thông tin thực tế | Địa điểm làm thủ tục HQ  |  | Dropdown |  | Default= Giá trị tương ứng  Khối 1  |
| 2\. Thông tin thực tế | Kết quả phân luồng | v | Dropdown | — | Xanh/Vàng/Đỏ |
| 2\. Thông tin thực tế | Ngày thông quan thực tế | v | Date | — | — |
| 2\. Thông tin thực tế | Số lượng tờ khai | v | Number | 5 | — |
| 2\. Thông tin thực tế | Nút \+ Thêm xe giao | Không | Button | Editable | Bấm để bổ sung 01 bản ghi xe giao hàng mới vào danh sách. |
| 2\. Thông tin thực tế | Danh sách Xe giao hàng (Mảng lặp) | Không | Data Table / Card List | Editable | Cho phép nhập/chỉnh sửa danh sách xe giao hàng. Mỗi xe gồm các trường:-Gồm 7 field con: Biển số xe \| Tải trọng \| Tài xế \| Số điện thoại\|CCCD\|Số Cont\|Số Mooc. Chứng từ kèm theo xe . Cho phép Coordinator Khai báo HQ nhập/sửa trực tiếp (nếu K1 chưa khai hoặc đổi xe). Khi Lưu, hệ thống tự động cascade ngược về Khối B (Thông tin chung \- Xe giao hàng). \- Nút Xóa xe  |
| 2\. Thông tin thực tế | Ghi chú | \- | Textarea | \- | Có thể chỉnh sửa lại nội dung ghi chú ban đầu sau khi có kết quả thông quan thực tế |
| 2\. Thông tin thực tế | Chứng từ lô hàng | — | File list | — | Biên bản giao nhận xe, Phiếu cân xe |

 

# **3.3. Quy tắc nghiệp vụ (Business Rule)** {#3.3.-quy-tắc-nghiệp-vụ-(business-rule)}

-   
- **BR-KHQ-01 (Độc lập vận hành):** Dịch vụ Khai báo HQ **không bị khóa theo thứ tự Chặng**. Nút **Bắt đầu thực hiện** LUÔN SÁNG ngay khi gán nhà thầu AVL thành công mà không phải chờ Chặng trước hoàn thành1more\_horiz.  
- **BR-KHQ-02 (SSOT Xe giao hàng):** Coordinator Khai báo HQ là vai trò duy nhất nhập/chốt **Xe giao hàng** tại mục *Thông tin thực tế Khai báo HQ*. Ngay khi Lưu, hệ thống **Cascade đè dữ liệu này về Khối B (Header phiếu \- Xe giao hàng)** làm dữ liệu gốc SSOT cho toàn đơn  
- **BR-KHQ-03 (Tự động phát cờ Giám sát bãi):** Kết quả phân luồng tờ khai \= **Luồng Vàng / Luồng Đỏ**. Hệ thống tự động phát cờ FLAG\_CUSTOMS\_SUPERVISION, tự động tick chọn checkbox *"Yêu cầu giám sát bãi"* tại dịch vụ Hải quan Giám sát cùng Chặng.  
- **BR-KHQ-04 (Ngoại lệ địa điểm TTHQ):** Trường *"Địa điểm làm thủ tục HQ"* cho phép cả K1 và K3 (Khai báo HQ) cùng chỉnh sửa khi địa điểm thông quan thực tế tại cửa khẩu thay đổi.  
- BR-KHQ-05 (Quy tắc Chỉnh sửa Địa điểm làm TTHQ):  
  - Trường Địa điểm làm thủ tục HBR-HQGS Q hiển thị dưới dạng Dropdown tại khối *"1. Thông tin khai báo"* của Card Khai báo HQ.  
  - Danh sách tùy chọn (Options) được nạp động từ Bảng Danh mục Chi cục Hải quan (Master Data).  
  - Customs Declaration Coordinator (K3) có quyền chọn/sửa lại Chi cục Hải quan thực tế. Khi bấm Lưu, hệ thống cập nhật dữ liệu và ghi vết UPDATE\_CUSTOMS\_LOCATION vào Timeline.  
- 

# **IV.HẢI QUAN GIÁM SÁT** {#iv.hải-quan-giám-sát}

# **4.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)** {#4.1.-sơ-đồ-luồng-nghiệp-vụ-(business-process-flow)}

*Tham chiếu sơ đồ: [03\_QuyTrinh\_HaiQuanGiamSat.drawio](https://app.diagrams.net/#G1WrTNfp9d8UiaKMEsaWxzNzQP17zKQS0P#%7B%22pageId%22%3A%22x5Ad-j_Wbl_D7NjoMtya%22%7D)* 

# **4.2. Mô tả giao diện — Bảng field** {#4.2.-mô-tả-giao-diện-—-bảng-field}

| Khối | Tên trường | Bắt buộc? | Kiểu DL | Max Length | Giá trị mặc định / Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Thông tin nhà thầu | Danh sách nhà thầu đã điều phối | \- | List \+ badge % Điểm hiệu suất nhà thầu | \- | Hiển thị tên từng nhà thầu đã chọn ở Modal 'Khu điều phối nhà thầu' kèm % Điểm hiệu suất nhà thầu; link 'Sửa gán nhà thầu' mở lại Modal AVL để điều chỉnh (xem mục 1.6.1) |
| 1\. Thông tin khai báo | Số tờ khai liên quan | — | Text | — | — |
| 1\. Thông tin khai báo | Đơn vị giám sát hải quan | Có | Dropdown | không cho phép sửa  | Nạp dữ liệu từ Bảng Danh mục Chi cục Hải quan (Module Quản lý danh mục / Master Data). \- K1 chọn mặc định ban đầu. \-  |
| 1\. Thông tin khai báo | Ghi chú  | — | Textarea | — | — |
| 1\. Thông tin khai báo | Chứng từ lô hàng | — | File list | — | Nếu rỗng: placeholder 'Chưa có chứng từ bổ sung' |
| 2\. Thông tin thực tế | Kết quả kiểm hóa thực tế | v | Text | — | — |
| 2\. Thông tin thực tế | Đơn vị giám sát Hải Quan |  | Dropdown |  | Default= Giá trị tương ứng  Khối 1  |
| 2\. Thông tin thực tế | Giờ vào khu thực tế | v | Datetime | — | — |
| 2\. Thông tin thực tế | Giờ rời khu thực tế | — | Datetime | — | — |
| 2\. Thông tin thực tế | Yêu cầu giám sát bãi | — | Checkbox | — | Tự động kích hoạt khi phân luồng Vàng/Đỏ |
| 2\. Thông tin thực tế | Ghi chú  | \- | Textarea | \- | Ghi chú cập nhật sau khi giám sát thực địa, độc lập với Ghi chú giám sát ban đầu ở mục '1. Thông tin khai báo' |
| 2\. Thông tin thực tế | Chứng từ lô hàng | — | File list | — | — |

 

# **4.3. Quy tắc nghiệp vụ (Business Rule)** {#4.3.-quy-tắc-nghiệp-vụ-(business-rule)}

* BR-HQGS-01: Checkbox *"Yêu cầu giám sát bãi"* tự động kích hoạt dựa trên cờ phân luồng Vàng/Đỏ từ Dịch vụ Khai báo HQ.  
* BR-HQGS-02: Khóa nút Bắt đầu thực hiện tuân theo thứ tự Chặng tuần tự (BR-K3-06)  
* BR-HQGS-03 (Quy tắc Chỉnh sửa Đơn vị giám sát HQ):  
  * Trường Đơn vị giám sát hải quan được bố trí hiển thị tại khối *"1. Thông tin khai báo"* của Card HQ Giám sát dưới dạng Dropdown.  
  * Danh sách tùy chọn (Options) nạp động từ Bảng Danh mục Chi cục Hải quan (Master Data).  
  * Customs Supervision Coordinator (K3) có quyền chọn/sửa lại Đơn vị giám sát thực tế. Khi bấm Lưu, hệ thống cập nhật dữ liệu và ghi vết UPDATE\_SUPERVISION\_UNIT vào Timeline.

# **V.VẬN TẢI** {#v.vận-tải}

# **5.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)** {#5.1.-sơ-đồ-luồng-nghiệp-vụ-(business-process-flow)}

*Tham chiếu sơ đồ: [04\_QuyTrinh\_VanTai.drawio](https://app.diagrams.net/#G1WrTNfp9d8UiaKMEsaWxzNzQP17zKQS0P#%7B%22pageId%22%3A%22h9TehbIgGmQE03a4w_Ak%22%7D)* 

# **5.2. Mô tả giao diện — Bảng field** {#5.2.-mô-tả-giao-diện-—-bảng-field}

| Khối | Tên trường | Bắt buộc? | Kiểu DL | Max Length | Giá trị mặc định / Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Thông tin nhà thầu | Danh sách nhà thầu đã điều phối | \- | List \+ badge % Điểm hiệu suất nhà thầu | \- | Hiển thị tên từng nhà thầu đã chọn ở Modal 'Khu điều phối nhà thầu AVL' kèm % Điểm hiệu suất nhà thầu; link 'Sửa gán nhà thầu' mở lại Modal AVL để điều chỉnh (xem mục 1.6.1) |
| 1\. Thông tin khai báo | Nơi lấy hàng | v | Text | — | — |
| 1\. Thông tin khai báo | Thời gian dự kiến lấy  | v | Datetime | — | — |
| 1\. Thông tin khai báo | Liên hệ lấy hàng (Tên / SĐT) | \- | Text / Text | \- | VD: 'Anh Tuấn — Quản lý kho' / SĐT liên hệ tại điểm lấy hàng; dữ liệu K1 bàn giao, readonly |
| 1\. Thông tin khai báo | Nơi giao hàng | v | Text | — | — |
| 1\. Thông tin khai báo | Thời gian dự kiến giao | v | Datetime | — | — |
| 1\. Thông tin khai báo | Liên hệ giao hàng (Tên / SĐT) | \- | Text / Text | \- | Người liên hệ \+ SĐT tại điểm giao hàng; dữ liệu K1 bàn giao, readonly |
| 1\. Thông tin khai báo | Ghi chú  | — | Textarea | — | — |
| 1\. Thông tin khai báo | Chứng từ lô hàng | — | File list | — | — |
| 2\. Thông tin thực tế | Nút \+ Thêm xe nhận/vận tải | Không | Button | Editable | Bấm để bổ sung 01 bản ghi xe nhận/vận chuyển mới vào danh sách. |
| 2\. Thông tin thực tế | Danh sách Xe nhận hàng  | Có | Data Table / Card List | Editable | Cho phép nhập/chỉnh sửa danh sách xe vận chuyển. Mỗi xe gồm các trường: Gồm 9 field con: Biển số xe \| Tải trọng \| Tài xế \| Số điện thoại\|Thời gian giao hàng thực tế \|Thời gian lấy hàng thực tế  \| CCCD \|Số Cont\|Số Mooc. Chứng từ kèm theo xe . \- Nút Xóa xe . |
| 2\. Thông tin thực tế | Số chì niêm phong | v | Number | 20 | — |
| 2\. Thông tin thực tế | Số cửa | — | Number | 20 | Cửa khẩu ra/vào |
| 2\. Thông tin thực tế | Ghi chú  | \- | Textarea | \- | Ghi chú cập nhật sau khi vận chuyển thực tế, độc lập với Ghi chú vận tải ban đầu ở mục '1. Thông tin khai báo' |
| 2\. Thông tin thực tế | Biên bản giao hàng và file đính kèm (chứa file POD)  | — | File list | — | Biên bản giao nhận xe, Phiếu cân xe |

 

# **5.3. Quy tắc nghiệp vụ (Business Rule)** {#5.3.-quy-tắc-nghiệp-vụ-(business-rule)}

* BR-VT-01 (SSOT Xe nhận hàng): Transport Coordinator nhập/chốt Xe nhận hàng (BSX, Tải trọng, Tài xế, SĐT, CCCD, Mooc, Cont, Seal) tại mục *Thông tin thực tế Dịch vụ Vận tải*. Hệ thống tự động Cascade ngược dữ liệu này lên Khối B (Header phiếu \- Xe nhận hàng). Dịch vụ Sang tải (vế Xe nhận) tự động đọc kế thừa dữ liệu này.  
* BR-VT-02: Khóa nút Bắt đầu thực hiện tuân theo thứ tự Chặng tuần tự (BR-K3-06).

# **VI.SANG TẢI** {#vi.sang-tải}

# **6.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)** {#6.1.-sơ-đồ-luồng-nghiệp-vụ-(business-process-flow)}

*Tham chiếu sơ đồ: [05\_QuyTrinh\_SangTai.drawio](https://app.diagrams.net/#G1WrTNfp9d8UiaKMEsaWxzNzQP17zKQS0P#%7B%22pageId%22%3A%22IBIlld6rdglZiiz0daUI%22%7D)*  

# **6.2. Mô tả giao diện — Bảng field** {#6.2.-mô-tả-giao-diện-—-bảng-field}

| Khối | Tên trường | Bắt buộc? | Kiểu DL | Max Length | Giá trị mặc định / Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Thông tin nhà thầu | Danh sách nhà thầu đã điều phối | \- | List \+ badge % Điểm hiệu suất nhà thầu | \- | Hiển thị tên từng nhà thầu đã chọn ở Modal 'Khu điều phối nhà thầu AVL' kèm % Điểm hiệu suất nhà thầu; link 'Sửa gán nhà thầu' mở lại Modal AVL để điều chỉnh (xem mục 1.6.1) |
| 1\. Thông tin khai báo | Địa điểm sang tải | v | Dropdown | — | — |
| 1\. Thông tin khai báo | Ghi chú  | — | Textarea | — | — |
| 1\. Thông tin khai báo | Chứng từ lô hàng | — | File list | — | — |
| 2\. Thông tin thực tế | Loại hình sang tải | v | Dropdown | — | VD: Sang tải xe sang xe |
| 2\. Thông tin thực tế | Phương thức sang tải | v | Dropdown  | — | VD: Cẩu nâng & Nhân công bốc xếp |
| 2\. Thông tin thực tế | Phương thức sang tải   |  | Dropdown |  | Default= Giá trị tương ứng  Khối 1  |
| 2\. Thông tin thực tế | Loại hình sang tải  |  | Dropdown |  | Default= Giá trị tương ứng  Khối 1  |
| 2\. Thông tin thực tế | Địa điểm sang tải  |  | Dropdown |  | Default= Giá trị tương ứng  Khối 1  |
| 2\. Thông tin thực tế | Quy cách đóng gói thực tế | v | dropdown | — | — |
| 2\. Thông tin thực tế | Số lượng thực nhận | v | Number | 10 | — |
| 2\. Cặp xe  | Xe giao | v | Text (SSOT) | — | Đọc tự động từ Khối B (Thông tin chung \- Xe giao hàng) do K1 hoặc Khai báo HQ (K3) chốt. Không cho phép Coordinator Sang tải sửa tự do.  |
| 2\. Cặp xe  | Tải trọng xe giao | v | Số \+ đơn vị | — | — |
| 2\. Cặp xe  | Xe nhận | v | Text (SSOT) | — | Nguồn: Dịch vụ Vận tải hệ thống (Thông tin thực tế) — cascade ngược qua Khối B |
| 2\. Cặp xe  | Tải trọng xe nhận | v | Số \+ đơn vị | — | — |
| 2\. Cặp xe  | Số kiện đủ/bốc | v | Text | — | — |
| 2\. Cặp xe  | Mã chì seal | v | Text | — | — |
| 2\. Cặp xe  | Trọng lượng thực tế (tấn) | v | Số | — | — |
| 2\. Cặp xe  | Mã số niêm phong mới | v | Text | — | — |
| 2\. Biên bản ghi nhận | Tình trạng hàng hóa thực tế & biên bản | v | Radio/Tag | — | 2 lựa chọn (radio, bắt buộc chọn 1): 'Hàng nguyên đai nguyên kiện, không hư hỏng' hoặc 'Có phát sinh hư hỏng/móp méo'. Nếu chọn 'Có phát sinh hư hỏng/móp méo' \-\> bắt buộc tải lên tối thiểu 1 ảnh minh chứng ở field 'Ảnh minh chứng hư hỏng' ngay bên dưới trước khi cho phép Lưu thông tin. |
| 2\. Biên bản ghi nhận | Ảnh minh chứng hư hỏng | Có điều kiện | Image upload (nhiều ảnh) | \- | CHỈ hiển thị và bắt buộc (\>= 1 ảnh) khi Tình trạng hàng hóa \= 'Có phát sinh hư hỏng/móp méo'. Ẩn hoàn toàn khi chọn 'Hàng nguyên đai nguyên kiện, không hư hỏng'. Dùng làm căn cứ biên bản/khiếu nại bồi thường với nhà thầu. |
| 2\. Biên bản ghi nhận | Ghi chú  | Có (nếu hư hỏng) | Textarea | — | — |
| 2\. Biên bản ghi nhận | Chứng từ lô hàng | — | File list | — | — |

 

# **6.3. Quy tắc nghiệp vụ (Business Rule)** {#6.3.-quy-tắc-nghiệp-vụ-(business-rule)}

- **BR-ST-01 (Kế thừa SSOT Cặp xe):** **Xe giao** đọc Read-only từ Khối B (do Khai báo HQ chốt); **Xe nhận** đọc Read-only từ Khối B (do Vận tải chốt). Coordinator Sang tải không nhập tay phương tiện tự do.  
- **BR-ST-02 (Ràng buộc Ảnh hư hỏng):** Chọn *"Tình trạng hàng hóa"* \= *"Có phát sinh hư hỏng/móp méo"* .Bắt buộc đính kèm ảnh minh chứng mới cho phép Hoàn thành dịch vụ.

# **VII. KHO**  {#vii.-kho}

# **7.1. Sơ đồ luồng nghiệp vụ (Business Process Flow)** {#7.1.-sơ-đồ-luồng-nghiệp-vụ-(business-process-flow)}

*Tham chiếu sơ đồ: [06\_QuyTrinh\_KhoBai.drawio](https://app.diagrams.net/#G1WrTNfp9d8UiaKMEsaWxzNzQP17zKQS0P#%7B%22pageId%22%3A%22IBIlld6rdglZiiz0daUI%22%7D)*  

# **7.2. Mô tả giao diện — Bảng field** {#7.2.-mô-tả-giao-diện-—-bảng-field}

| Khối | Tên trường | Bắt buộc? | Kiểu DL | Max Length | Giá trị mặc định / Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Thông tin nhà thầu | Danh sách nhà thầu đã điều phối | \- | List \+ badge % Điểm hiệu suất nhà thầu | \- | Hiển thị tên từng nhà thầu đã chọn ở Modal 'Khu điều phối nhà thầu AVL' kèm % Điểm hiệu suất nhà thầu; link 'Sửa gán nhà thầu' mở lại Modal AVL để điều chỉnh (xem mục 1.6.1) |
| 1\. Thông tin khai báo | Tên kho | Có | Dropdown | không cho phép sửa  | Nạp dữ liệu từ Danh mục Kho bãi (Master Data). \- K1 chọn mặc định ban đầu. |
| 1\. Thông tin khai báo | Loại hình lưu kho | Có | Dropdown | Read-only | Nạp dữ liệu từ Danh mục Loại hình lưu kho (Master Data). VD: *Kho thường, Kho lạnh, Kho ngoại quan, Kho CFS...* |
| 1\. Thông tin khai báo | Thời gian lưu kho dự kiến | Có |  Number | Read-only | Khoảng thời gian lưu kho dự kiến (VD: *07 Ngày*). |
| 1\. Thông tin khai báo | Số lượng lưu kho dự kiến | Có |  Number | Read-only | Số lượng & ĐVT dự kiến lưu kho (VD: *24 Pallet / 58 CBM*). |
| 1\. Thông tin khai báo | Chứng từ lô hàng | Không | File list | Read-only | Tệp đính kèm chứng từ do K1 bàn giao. |
| 1\. Thông tin khai báo | Ghi chú  | Không | Textarea | Read-only | Ghi chú vận hành lưu kho ban đầu do K1 nhập. |
| 2\. Thông tin thực tế | Số lượng thực tế | Có | Number | Editable | Nhập tay độc lập tại hiện trường nhập kho (BR-KB-04). Cảnh báo nếu lệch so với Sang tải/Vận tải liền trước. |
| 2\. Thông tin thực tế | Tên kho   |  | Dropdown |  | Default= Giá trị tương ứng  Khối 1  |
| 2\. Thông tin thực tế | Loại hình lưu kho   |  | Dropdown |  | Default= Giá trị tương ứng  Khối 1  |
| 2\. Thông tin thực tế | Trọng lượng tồn thực tế | Có | Number (Tấn) | Editable | Nhập tay trọng lượng tồn thực tế kiểm đếm tại kho. |
| 2\. Thông tin thực tế | Thời gian nhập kho thực tế | Có | Datetime | Editable | Mốc thời gian thực tế hàng vào kho. |
| 2\. Thông tin thực tế | Thời gian xuất kho thực tế | Có | Datetime | Editable | Mốc thời gian thực tế hàng ra khỏi kho (bắt buộc \$\\ge\$ Thời gian nhập kho thực tế). |
| 2\. Thông tin thực tế | Dịch vụ VAS | Không | Checklist (4 Checkbox) | Editable | 4 checkbox độc lập: *Đóng gói lại, Quấn màng co, Dán nhãn phụ, Kiểm đếm chi tiết*. |
| 2\. Thông tin thực tế | Ghi chú  | Không | Textarea | Editable | Ghi chú vận hành phát sinh tại kho. |
| 2\. Thông tin thực tế | Chứng từ lô hàng | Không | File list | Editable | Phiếu nhập/xuất kho, Biên bản kiểm đếm thực địa. |

 

# **7.3. Quy tắc nghiệp vụ (Business Rule)** {#7.3.-quy-tắc-nghiệp-vụ-(business-rule)}

* BR-KB-01: Nhóm dịch vụ gia tăng (VAS) gồm đúng 4 checkbox độc lập (*Đóng gói lại, Quấn màng co, Dán nhãn phụ, Kiểm đếm chi tiết*), lưu dưới dạng 4 trường boolean riêng biệt.  
* BR-KB-02: Leg Engine mặc định gán Kho bãi vào Chặng 1\. CC có quyền kéo-thả vị trí Chặng trước khi kích hoạt. Warehouse Coordinator không tự ý đổi Chặng sau khi đã khóa.  
* BR-KB-04 (Kiểm đếm Độc lập & Cảnh báo Chênh lệch): *"Số lượng thực tế"* và *"Trọng lượng tồn thực tế"* do Warehouse Coordinator kiểm đếm độc lập khi nhập kho (không tự động kế thừa từ Sang tải). Hệ thống hiển thị CẢNH BÁO (không chặn lưu) nếu sản lượng Kho bãi lệch so với sản lượng Sang tải/Vận tải liền trước.  
  **BR-KB-05 Quy tắc Chỉnh sửa Tên kho:**  
* Trường **Tên kho** hiển thị dưới dạng **Dropdown** tại khối *"1. Thông tin khai báo"* của Card Dịch vụ Kho bãi.  
* Danh sách tùy chọn nạp động từ **Bảng Danh mục Kho bãi** (Master Data).  
* **Warehouse Coordinator (K3)** có quyền chọn/thay đổi lại Tên kho thực tế sử dụng. Khi Coordinator bấm Lưu, hệ thống cập nhật Tên kho mới và tự động ghi log sự kiện UPDATE\_WAREHOUSE\_NAME (kèm tên kho cũ \>tên kho mới) vào Nhật ký Tháp điều phối (Timeline).

**TÀI LIỆU ĐẶC TẢ THAY ĐỔI YÊU CẦU**

(Change Request – CR)

*Cập nhật SRS Module K3: Tháp Điều Phối*

| Mục | Thông tin |
| :---- | :---- |
| **Mã CR** | CR-K3-01; CR-K3-02 |
| **Tên thay đổi** | CR-K3-01: Hiển thị thông tin liên hệ của nhà thầu đã điều phối CR-K3-02: Bổ sung chức năng "Làm mới giá" trong Modal "Chỉnh sửa chi phí" CR-K3-03: Dịch vụ Kho bãi — lấy danh sách đầu mục giá theo Loại kho của dịch vụ; cập nhật Loại hình lưu kho → bắt buộc điều phối lại nhà thầu |
| **Tài liệu ảnh hưởng** | LogX\_SRS\_ThapDieuPhoi\_20261014 — v1.0 → v1.1 |
| **Phạm vi module** | K3 Tháp Điều Phối — Module 1: Chức năng dùng chung 5 dịch vụ con CR-K3-01: Card dịch vụ — khối "Thông tin nhà thầu" CR-K3-02: Tab Chi phí — Modal "Chỉnh sửa chi phí" CR-K3-03: Dịch vụ Kho bãi — Modal "Điều phối nhà thầu", Bảng chi phí dịch vụ (Popup "Thêm phụ phí", "Thêm chi phí phát sinh"), trường "Loại hình lưu kho", nút "Hoàn thành dịch vụ" |
| **Module liên quan** | Quản lý nhà thầu (nguồn dữ liệu đầu mối liên hệ, BR-VD-12) — không thay đổi Giá mua đầu vào (nguồn đơn giá hiện tại theo ID dòng giá) — không thay đổi Cấu hình đầu mục giá (Loại giá "Cố định") — không thay đổi |
| **Người yêu cầu** | \[...\] |
| **Người lập** | Trang BA |
| **Ngày tạo** | 17/10/2026 |
| **Độ ưu tiên (MoSCoW)** | Must have |
| **Trạng thái** | — |

# **1\. Tổng quan thay đổi**

## **1.1. Yêu cầu gốc**

* \[CR-K3-01\] Trong thông tin nhà thầu, với mỗi nhà thầu đã điều phối, bổ sung hiển thị thông tin liên hệ của nhà thầu gồm: Họ tên, Chức danh, Số điện thoại, Email.

* \[CR-K3-02\] Thêm chức năng "Làm mới giá" trong màn Chỉnh sửa chi phí: Người dùng nhấn nút "Làm mới giá" trên 1 dòng chi phí, hệ thống tự động lấy đơn giá hiện tại của ID dòng giá đó từ bảng giá nhà thầu. Chức năng chỉ áp dụng cho đầu mục giá "Cố định".

* \[CR-K3-03\] Bổ sung logic mới: Với dịch vụ Kho bãi, bảng Điều phối nhà thầu và bảng chi phí dịch vụ: lấy danh sách đầu mục giá từ Cấu hình đầu mục giá có gắn với Loại kho của dịch vụ.

## **1.2. Hiện trạng (As-is) và Đề xuất (To-be)**

| Khía cạnh | Hiện trạng (SRS v1.0) | Sau thay đổi (SRS v1.1) |
| :---- | :---- | :---- |
| \[CR-K3-01\] Thông tin liên hệ nhà thầu trên K3 | Không quy định. | Khối "Thông tin nhà thầu" trên Card dịch vụ hiển thị liên hệ của từng nhà thầu đã điều phối. |
| \[CR-K3-01\] Đầu mối hiển thị | — | Chỉ Đầu mối chính của nhà thầu (theo xác nhận 14/10/2026). |
| \[CR-K3-01\] Thời điểm hiển thị | — | Từ khi "Điều phối nhà thầu" thành công (dịch vụ "Điều phối" trở đi). |
| \[CR-K3-01\] Quyền thao tác | — | Read-only trên K3; chỉnh sửa tại Quản lý nhà thầu. |
| \[CR-K3-02\] Cập nhật đơn giá dòng chi phí Cố định | Đơn giá kế thừa 1 lần tại thời điểm "Xác nhận điều phối" (BR-K3-25); không có cơ chế cập nhật khi bảng giá nhà thầu điều chỉnh đơn giá. | Nút "Làm mới giá" trên từng dòng chi phí Cố định trong Modal "Chỉnh sửa chi phí"; hệ thống lấy đơn giá hiện tại theo đúng ID dòng giá từ Giá mua đầu vào. |
| \[CR-K3-02\] Dòng chi phí áp dụng | — | Chỉ dòng thuộc đầu mục giá có Loại giá \= "Cố định". Phụ phí, Chi phí phát sinh không có nút. |
| \[CR-K3-02\] Dữ liệu được cập nhật | — | Chỉ Đơn giá; tự động tính lại Tổng chi (nguyên tệ) và Tổng quy đổi (VND). ID dòng giá, Đầu mục, Nhà thầu, ĐVT, SL giữ nguyên. |
| \[CR-K3-02\] Thời điểm ghi nhận | — | Đơn giá mới chỉ được lưu khi nhấn "Lưu" tại Modal; "Hủy" → giữ đơn giá cũ. |
| \[CR-K3-02\] Truy vết | — | Ghi Nhật ký Tháp điều phối: Đơn giá cũ → Đơn giá mới, ID dòng giá. |
| \[CR-K3-03\] Nguồn đầu mục — Bảng điều phối nhà thầu (Kho bãi) | Đầu mục lấy từ Bảng giá "Giá mua đầu vào" của từng nhà thầu đã chọn (mục 1.6.5). | Đầu mục lấy từ Cấu hình đầu mục giá phân hệ Kho bãi: Loại kho của đầu mục chứa Loại kho của dịch vụ, Kích hoạt \= Bật, Loại giá \= "Cố định". |
| \[CR-K3-03\] Nguồn đầu mục — Bảng chi phí dịch vụ (Kho bãi) | Dòng Cố định kế thừa từ Modal AVL; Phụ phí chọn từ Bảng giá mua đầu vào; Chi phí phát sinh chọn/nhập tự do. | Dòng Cố định chỉ sinh từ đầu mục theo Loại kho; Phụ phí chỉ chọn đầu mục gắn Loại kho của dịch vụ; \[Đề xuất\] Chi phí phát sinh gợi ý đầu mục theo Loại kho, vẫn cho nhập tự do. |
| \[CR-K3-03\] Option nhà thầu & đơn giá | — | Không đổi: lấy từ Giá mua đầu vào theo Ma trận Mapping AVL (Tên kho \+ Loại kho). |
| \[CR-K3-03\] Đầu mục chưa có nhà thầu chào giá | Không phát sinh (đầu mục luôn lấy từ bảng giá nhà thầu). | Vẫn hiển thị trong bảng điều phối; dropdown "Nhà thầu đảm nhận" trống kèm MSG-K3-INFO-03. |
| \[CR-K3-03\] Phạm vi dịch vụ | — | Chỉ dịch vụ Kho bãi; 4 dịch vụ con còn lại giữ nguyên. |
| \[CR-K3-03\] Cập nhật Loại hình lưu kho khi dịch vụ đã điều phối | Áp dụng BR-K3-RESET-AVL: hủy gán nhà thầu, xóa Bảng chi phí mặc định, dịch vụ lùi về "Chưa thực hiện". | Detach các đầu mục không áp dụng cho Loại kho mới, kèm nhà thầu và các dòng giá (chi phí) gắn với dòng giá đó; Có ≥1 đầu mục bị detach → bắt buộc điều phối lại phần bị ảnh hưởng; chặn "Hoàn thành dịch vụ" đến khi điều phối lại xong. |
| \[CR-K3-03\] Trạng thái dịch vụ sau khi detach | Lùi về "Chưa thực hiện" (BR-K3-RESET-AVL mục 2b). | \[Đề xuất\] Giữ nguyên trạng thái hiện tại ("Điều phối" / "Đang thực hiện"); gắn cờ "Cần điều phối lại nhà thầu". |
| \[CR-K3-03\] Đầu mục vẫn áp dụng cho Loại kho mới | Bị xóa cùng toàn bộ Bảng chi phí mặc định (BR-K3-RESET-AVL). | Giữ nguyên dòng chi phí, nhà thầu đảm nhận và dòng giá đã gắn. |

## **1.3. Lợi ích**

CR-K3-01:

* Coordinator liên hệ nhà thầu ngay khi triển khai và xử lý phát sinh thực địa, không phải chuyển module.

* CC giám sát và hỗ trợ xử lý ngoại lệ nhanh hơn.

* Dữ liệu liên hệ có 1 nguồn duy nhất (Quản lý nhà thầu), tránh sai lệch.

CR-K3-02:

* Coordinator cập nhật chi phí theo đơn giá nhà thầu mới nhất mà không phải hủy và điều phối lại nhà thầu.

* Giảm sai lệch giữa chi phí trên K3 và bảng giá nhà thầu, giúp snapshot P\&L chuyển sang Khối 5 chính xác hơn (BR-K3-HANDOFF-K5).

* Đơn giá vẫn không cho nhập tay; nguồn giá duy nhất là Giá mua đầu vào (BR-K3-01).

CR-K3-03

* Danh sách đầu mục Kho bãi thống nhất với Cấu hình đầu mục giá, đúng cấu trúc giá & chi phí theo từng Loại kho (BR11 – Cấu hình đầu mục giá).

* Coordinator thấy đủ đầu mục cần điều phối cho Loại kho, kể cả đầu mục chưa có nhà thầu chào giá, tránh bỏ sót chi phí.

* Loại bỏ đầu mục không phù hợp Loại kho khỏi bảng điều phối và bảng chi phí, giảm chọn nhầm.

* Chi phí luôn khớp Loại kho thực tế: không thể hoàn thành dịch vụ khi nhà thầu và dòng giá còn gắn theo Loại kho cũ.

* Đổi Loại hình lưu kho không làm mất kết quả điều phối của đầu mục còn áp dụng; Coordinator chỉ điều phối lại phần bị ảnh hưởng.

# **2\. Phân tích ảnh hưởng**

| Mục SRS v1.0 | Loại thay đổi | Nội dung thay đổi |
| :---- | :---- | :---- |
| 1.2 Phạm vi hệ thống | Sửa | Bổ sung 1 dòng In-scope cho CR-K3-01. |
| 3.1.1 – US\_COM\_01 Điều phối nhà thầu | Sửa | Thêm AC 9: hiển thị khối "Thông tin nhà thầu" sau khi Xác nhận điều phối. Thêm 1 dòng Postcondition trong UC\_COM\_01. |
| 3.1.1 – US\_COM\_08 | Thêm mới | User story "Xem thông tin liên hệ nhà thầu đã điều phối". |
| 3.1.2 Mô tả giao diện | Thêm mới | Bảng f) Khối "Thông tin nhà thầu" (6 trường). |
| 3.1.3 Quy tắc nghiệp vụ | Thêm mới | BR-K3-32, BR-K3-33, BR-K3-34. |
| 3.1.4 Thông báo và lỗi | Thêm mới | MSG-K3-INFO-01; thông báo sao chép. |
| 3.1.5 Tích hợp | Sửa | Dòng "Quản lý nhà thầu": bổ sung dữ liệu Đầu mối chính.. |
| Phụ lục B | Sửa | Thêm dòng CR-K3-01 vào ma trận truy vết B.1; cập nhật mã mới ở B.4. |
| Đầu tài liệu | Thêm mới | Dòng "Phiên bản" và bảng "Lịch sử thay đổi". |
| 1.4 Quy tắc nghiệp vụ — BR-K3-LOCK-COST | Sửa | Mục 2 "Khóa theo Phân quyền & Đầu mục": bổ sung nút "Làm mới giá" (chỉ Coordinator phụ trách, chỉ dòng Cố định) — CR-K3-02. |
| 1.4 Quy tắc nghiệp vụ — BR-K3-25 / Binding 3 thông số | Sửa | Đơn giá gốc kế thừa từ AVL được phép làm mới theo đơn giá hiện tại của cùng ID dòng giá — CR-K3-02. |
| 1.6.4 Quy tắc Phân quyền Chỉnh sửa trên Bảng Chi phí | Sửa | Giữ khóa sửa trực tiếp Đơn giá trên Bảng; bổ sung ngoại lệ cập nhật qua "Làm mới giá" trong Modal "Chỉnh sửa chi phí" — CR-K3-02. |
| Modal "Chỉnh sửa chi phí" | Thêm mới | Nút "Làm mới giá" trên từng dòng chi phí Cố định và hành vi hiển thị đơn giá sau làm mới — CR-K3-02. |
| 1.7 Use case / User story — US\_COM\_09 | Thêm mới | User story "Làm mới giá dòng chi phí Cố định" — CR-K3-02. |
| 1.4 Quy tắc nghiệp vụ | Thêm mới | BR-K3-36 → BR-K3-40 — CR-K3-02. |
| 1.6.8 Nhật ký Tháp điều phối | Thêm mới | Kịch bản log "Làm mới giá" — CR-K3-02. |
| 1.8 Bảng danh sách thông báo | Thêm mới | MSG-K3-SUCCESS-07, MSG-K3-INFO-02, ERR-K3-BR-05 — CR-K3-02. |
| Tích hợp — Giá mua đầu vào | Sửa | Bổ sung luồng đọc đơn giá hiện tại theo ID dòng giá khi "Làm mới giá" — CR-K3-02. |
| 1.6.5 Modal "Khu điều phối nhà thầu AVL" — Bảng Phân bổ chi phí & nhiệm vụ | Sửa | Cột "Tên đầu mục nhiệm vụ": bổ sung nguồn riêng cho Kho bãi — CR-K3-03. |
| 1.6.2 Popup "Thêm phụ phí" | Sửa | Dropdown "Đầu mục phụ phí" (Kho bãi) lọc theo Loại kho — CR-K3-03. |
| 1.6.3 Popup "Thêm chi phí phát sinh" | Sửa | Danh sách chọn "Đầu mục phát sinh" (Kho bãi) theo Loại kho — CR-K3-03. |
| 1.6.10 Ma trận Mapping AVL / BR-K3-MAPPING-AVL — Kho bãi | Sửa | Loại kho đồng thời là điều kiện lọc danh sách đầu mục — CR-K3-03. |
| 1.4 Quy tắc nghiệp vụ — BR-K3-RESET-AVL | Sửa | Kho bãi: đổi Loại hình lưu kho → chỉ detach đầu mục không áp dụng cho Loại kho mới (kèm nhà thầu, dòng giá), giữ nguyên đầu mục còn áp dụng; yêu cầu điều phối lại phần bị ảnh hưởng, chặn Hoàn thành (thay cho hành vi xóa toàn bộ và lùi trạng thái) — CR-K3-03. |
| 1.7.1 UC-COMMON-01 (UC-KB-01) | Sửa | Bước 5 luồng cơ bản; thêm ngoại lệ E3 — CR-K3-03. |
| 1.7 Use case / User story — US\_COM\_10 | Thêm mới | User story "Lấy danh sách đầu mục giá theo Loại kho cho dịch vụ Kho bãi" — CR-K3-03. |
| 7.3 Quy tắc nghiệp vụ (Kho bãi) | Thêm mới | BR-KB-06 → BR-KB-10 — CR-K3-03. |
| 1.8 Bảng danh sách thông báo | Thêm mới | MSG-K3-INFO-03, MSG-K3-INFO-04, ERR-K3-BR-06, MSG-K3-WARN-05, MSG-K3-WARN-06, ERR-K3-BR-07 — CR-K3-03. |
| Tích hợp — Cấu hình đầu mục giá | Thêm mới | Luồng đọc danh sách đầu mục phân hệ Kho bãi theo Loại kho — CR-K3-03. |
| 7.2 Mô tả giao diện Kho bãi — "Loại hình lưu kho" | Sửa | Bổ sung hành vi khi cập nhật: Modal xác nhận MSG-K3-WARN-05, detach, cảnh báo "Cần điều phối lại nhà thầu" — CR-K3-03. |
| 1.7.1 UC-COMMON-01 (UC-KB-01) — Điều kiện tiên quyết | Sửa | Cho phép điều phối lại khi dịch vụ Kho bãi mang cờ "Cần điều phối lại nhà thầu" — CR-K3-03. |
| 1.7.3 UC-COMMON-03 (UC-KB-03) — Hoàn thành dịch vụ | Sửa | Thêm điều kiện chặn Hoàn thành (ERR-K3-BR-07); luồng ngoại lệ riêng cho Kho bãi khi đổi Loại hình lưu kho — CR-K3-03. |
| Module 2, Module 3 | Không đổi | — |

# **3\. Đặc tả chi tiết thay đổi**

## **3.1. User story mới**

#### ***3.1.1. Xem thông tin liên hệ nhà thầu đã điều phối \[CR-K3-01\]***

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_COM\_08 |
| **Tên Story** | Xem thông tin liên hệ nhà thầu đã điều phối — CR-K3-01 (14/10/2026) |
| **User Story** | Là **CC / Coordinator**, tôi muốn **xem thông tin liên hệ (Họ tên, Chức danh, Số điện thoại, Email) của từng nhà thầu đã điều phối ngay trên Card dịch vụ**, để **liên hệ nhanh khi triển khai và xử lý phát sinh thực địa mà không phải chuyển sang module Quản lý nhà thầu**. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Module 1 – Chức năng dùng chung 5 dịch vụ con |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Dịch vụ đã "Điều phối nhà thầu" (trạng thái "Điều phối" / "Đang thực hiện" / "Đã thực hiện") → khối "Thông tin nhà thầu" hiển thị mỗi nhà thầu đã điều phối 1 dòng gồm: Mã, Tên nhà thầu, Họ tên, Chức danh, Số điện thoại, Email. | Dịch vụ "Chưa thực hiện" (chưa điều phối) → không hiển thị thông tin liên hệ. |
| 2 | Dịch vụ có nhiều nhà thầu đảm nhận các đầu mục → hiển thị đủ từng nhà thầu; 1 nhà thầu đảm nhận nhiều đầu mục chỉ hiển thị 1 lần. | — |
| 3 | Chỉ hiển thị **Đầu mối chính** của nhà thầu (đầu mối được đánh dấu "Đầu mối chính" tại Quản lý nhà thầu – BR-VD-12). | Nhà thầu chưa có Đầu mối chính → hiển thị MSG-K3-INFO-01 tại dòng nhà thầu; không hiển thị đầu mối khác. |
| 4 | Dữ liệu đọc trực tiếp từ Quản lý nhà thầu tại thời điểm xem: Đầu mối chính thay đổi → K3 hiển thị giá trị mới khi tải lại Card. | — |
| 5 | Thông tin liên hệ là read-only trên K3. | Không có thao tác thêm/sửa/xóa trên K3; chỉnh sửa tại Quản lý nhà thầu (UC-VD-03). |
| 6 | Người có quyền “Điều phối nhà thầu” có thể xem được Thông tin nhà thầu bao gồm cả thông tin liên hệ nhà thầu | Người dùng được phân quyền không xem được thông tin liên hệ nhà thầu |
| 7 | Phiếu đã khóa ("Hoàn thành" / "Đã hủy" / "Từ chối") hoặc nhà thầu chuyển "Dừng hợp tác" sau khi điều phối → vẫn hiển thị thông tin liên hệ để tra cứu. | — |

#### ***3.1.2. Làm mới giá dòng chi phí Cố định \[CR-K3-02\]*** 

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_COM\_09 |
| **Tên Story** | Làm mới giá dòng chi phí Cố định — CR-K3-02 (17/10/2026) |
| **User Story** | Là **Coordinator phụ trách dịch vụ**, tôi muốn **làm mới đơn giá của dòng chi phí Cố định theo đơn giá hiện tại của ID dòng giá trong bảng giá nhà thầu**, để **chi phí dịch vụ phản ánh đúng giá nhà thầu mới nhất mà không phải điều phối lại nhà thầu**. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Module 1 – Chức năng dùng chung 5 dịch vụ con |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Modal "Chỉnh sửa chi phí": mỗi dòng chi phí thuộc đầu mục giá có Loại giá \= "Cố định" hiển thị nút "Làm mới giá". | Dòng Phụ phí / Chi phí phát sinh → không hiển thị nút. |
| 2 | Nhấn "Làm mới giá" → hệ thống lấy Đơn giá hiện tại của đúng ID dòng giá trên dòng chi phí từ bảng giá nhà thầu (Giá mua đầu vào) và thay vào ô Đơn giá của dòng đó. | Lấy giá theo ID dòng giá khác hoặc nhà thầu khác. |
| 3 | Đơn giá thay đổi → tự động tính lại Tổng chi (= Đơn giá × SL) và Tổng quy đổi (VND) (= Tổng chi × Tỷ giá); ô Đơn giá được highlight; hiển thị thông báo MSG-K3-SUCCESS-07. | — |
| 4 | Chỉ Đơn giá được cập nhật; ID dòng giá, Đầu mục, Nhà thầu, ĐVT, SL giữ nguyên. | — |
| 5 | Đơn giá hiện tại bằng đơn giá đang có trên dòng → hiển thị thông báo MSG-K3-INFO-02, không thay đổi dữ liệu. | — |
| 6 | Dòng giá không còn tồn tại, hoặc bảng giá không ở trạng thái "Đang hoạt động", hoặc đã hết hiệu lực tại thời điểm làm mới → hiển thị ERR-K3-BR-05. | Đơn giá cũ bị xóa/ghi đè khi nguồn giá không hợp lệ. |
| 7 | Nhấn "Lưu" tại Modal → đơn giá mới được ghi nhận vào Bảng chi phí trên Card dịch vụ và ghi Nhật ký (BR-K3-40). Nhấn "Hủy" / đóng Modal → không lưu, giữ đơn giá cũ. | Đơn giá mới tự lưu khi chưa nhấn "Lưu". |
| 8 | Chỉ Coordinator phụ trách dịch vụ thấy và thao tác được nút; Bảng chi phí đã khóa theo BR-K3-LOCK-COST (dịch vụ "Đã thực hiện"; phiếu "Hoàn thành" / "Đã hủy" / "Từ chối") → không hiển thị nút. | CC và các vai trò khác thấy hoặc thao tác được nút. |

#### ***3.1.3. Lấy danh sách đầu mục giá theo Loại kho cho dịch vụ Kho bãi \[CR-K3-03\]*** 

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_COM\_10 |
| **Tên Story** | Lấy danh sách đầu mục giá theo Loại kho cho dịch vụ Kho bãi — CR-K3-03 (17/10/2026) |
| **User Story** | Là **Warehouse Coordinator**, tôi muốn **bảng điều phối nhà thầu và bảng chi phí dịch vụ Kho bãi chỉ hiển thị các đầu mục giá được cấu hình cho Loại kho của dịch vụ**, để **điều phối và ghi nhận chi phí đúng cấu trúc giá theo từng loại kho, không bỏ sót hay chọn nhầm đầu mục**. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Module 1 – Chức năng dùng chung 5 dịch vụ con (áp dụng riêng dịch vụ Kho bãi) |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Mở Modal "Khu điều phối nhà thầu AVL" của dịch vụ Kho bãi → cột "Tên đầu mục nhiệm vụ" hiển thị các đầu mục giá phân hệ Kho bãi trong Cấu hình đầu mục giá thỏa đồng thời: Loại kho của đầu mục chứa Loại kho của dịch vụ; Kích hoạt \= Bật; Loại giá \= "Cố định". | Hiển thị đầu mục không gắn Loại kho của dịch vụ, đầu mục đang tắt kích hoạt, hoặc đầu mục Phụ phí / Phát sinh. |
| 2 | Loại kho của dịch vụ \= giá trị hiện hành của trường "Loại hình lưu kho" trên Card Kho bãi (mặc định từ Khối 1; nếu đã cập nhật thông tin thực tế → dùng giá trị Loại hình lưu kho của section Thông tin thực tế). | — |
| 3 | Không có đầu mục nào khớp Loại kho của dịch vụ → hiển thị ERR-K3-BR-06, chặn "Xác nhận điều phối". | — |
| 4 | Sau "Xác nhận điều phối" → Bảng chi phí dịch vụ Kho bãi chỉ sinh dòng Cố định cho đầu mục thuộc danh sách theo Loại kho đã được gán nhà thầu. | — |
| 5 | Popup "Thêm phụ phí" (Kho bãi): dropdown "Đầu mục phụ phí" chỉ gồm đầu mục Loại giá \= "Phụ phí", Kích hoạt \= Bật, gắn Loại kho \= Loại hình lưu kho của dịch vụ; Đơn giá vẫn nạp tự động theo mục 1.6.2. | Cho chọn phụ phí không gắn Loại kho của dịch vụ. |
| 6 | Popup "Thêm chi phí phát sinh" (Kho bãi): danh sách gợi ý "Đầu mục phát sinh" gồm đầu mục Loại giá \= "Phát sinh", Kích hoạt \= Bật, gắn Loại kho \= Loại hình lưu kho của dịch vụ; vẫn cho nhập tự do theo mục 1.6.3. | — |
| 7 | Cập nhật Loại hình lưu kho khi dịch vụ đã điều phối ("Điều phối" / "Đang thực hiện") → hệ thống xác định đầu mục đang gắn trên dịch vụ không còn áp dụng cho Loại kho mới (Loại kho của đầu mục không chứa Loại kho mới) và hiển thị Modal xác nhận MSG-K3-WARN-05 kèm danh sách đầu mục bị ảnh hưởng. Xác nhận → chỉ detach các đầu mục đó cùng nhà thầu đảm nhận và dòng giá đã gắn; Card hiển thị MSG-K3-WARN-06 và nút "Điều phối nhà thầu". | Đầu mục còn áp dụng bị detach; đầu mục không còn áp dụng vẫn còn gắn nhà thầu / dòng giá; Hủy ở Modal xác nhận nhưng Loại hình lưu kho vẫn bị đổi. |
| 8 | Cấu hình đầu mục giá thay đổi (gỡ Loại kho / tắt kích hoạt) sau khi đã điều phối → dòng chi phí đã sinh giữ nguyên; thay đổi áp dụng từ lần mở Modal Điều phối nhà thầu tiếp theo. | — |
| 9 | Dịch vụ mang cờ "Cần điều phối lại nhà thầu" → nhấn "Hoàn thành dịch vụ" bị chặn, hiển thị ERR-K3-BR-07. | Dịch vụ chuyển "Đã thực hiện" khi chưa điều phối lại. |
| 10 | Điều phối lại: Modal Điều phối nhà thầu nạp danh sách đầu mục theo Loại kho mới (BR-KB-06); đầu mục còn giữ hiển thị sẵn nhà thầu / option đã gán; đầu mục bị detach và đầu mục mới áp dụng hiển thị trống để gán. "Xác nhận điều phối" thành công → sinh dòng chi phí cho đầu mục được gán mới, gỡ cờ và cảnh báo, mở lại "Hoàn thành dịch vụ". | Modal Điều phối nhà thầu vẫn hiển thị đầu mục theo Loại kho cũ; mất kết quả gán của đầu mục còn giữ; cờ không được gỡ sau khi điều phối lại. |
| 11 | Dòng Chi phí phát sinh (do không gắn dòng giá đầu vào) được giữ nguyên sau khi detach; giá trị Loại hình lưu kho không đổi khi lưu → không detach. | — |
| 12 | Dịch vụ "Chưa thực hiện" (chưa điều phối) cập nhật Loại hình lưu kho → không phát sinh detach; lần mở Modal Điều phối nhà thầu kế tiếp nạp danh sách đầu mục theo Loại kho mới. | — |
| 13 | Đầu mục vẫn áp dụng cho Loại kho mới (Cố định hoặc Phụ phí) → giữ nguyên dòng chi phí, nhà thầu đảm nhận, dòng giá (ID, Đơn giá, ĐVT) và SL. | Đầu mục còn áp dụng bị xóa hoặc thay đổi nhà thầu / dòng giá. |
| 14 | Không có đầu mục nào bị ảnh hưởng → lưu Loại hình lưu kho, hiển thị MSG-K3-INFO-04; không gắn cờ, không chặn "Hoàn thành dịch vụ". | Gắn cờ "Cần điều phối lại nhà thầu" khi không có đầu mục nào bị detach. |
| 15 | Nhà thầu đảm nhận cả đầu mục bị detach và đầu mục còn giữ → chỉ gỡ khỏi đầu mục bị detach; vẫn hiển thị trong khối "Thông tin nhà thầu". Nhà thầu chỉ đảm nhận đầu mục bị detach → gỡ khỏi khối "Thông tin nhà thầu". | Nhà thầu bị gỡ hoàn toàn dù còn đảm nhận đầu mục được giữ. |

## **3.2. Cập nhật User story US\_COM\_01 – Điều phối nhà thầu**

| Vị trí | Trước (v1.0) | Sau (v1.1) |
| :---- | :---- | :---- |
| Acceptance Criteria – AC 9 | (không có) | Sau khi "Xác nhận điều phối" thành công → Card dịch vụ hiển thị khối "Thông tin nhà thầu" kèm thông tin liên hệ Đầu mối chính của từng nhà thầu đã điều phối (chi tiết: US\_COM\_08). |
| UC\_COM\_01 – Postcondition | 4 kết quả (không có liên hệ nhà thầu) | Bổ sung: Khối "Thông tin nhà thầu" hiển thị liên hệ Đầu mối chính của từng nhà thầu đã điều phối (BR-K3-32). |

## **3.3. Mô tả giao diện**

Link UI Design: \[Chèn link\]. Khối đặt trên Card dịch vụ con, cạnh thông tin điều phối nhà thầu; mỗi nhà thầu 1 dòng.

**Khối "Thông tin nhà thầu" trên Card dịch vụ (hiển thị sau khi Xác nhận điều phối)**

| Tên trường | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- |
| Mã nhà thầu | Text (read-only) | Từ Quản lý nhà thầu | Định dạng VDR-XXXX (BR-VD-01); giúp phân biệt nhà thầu trùng tên. |
| Tên nhà thầu | Text (read-only) | Từ Quản lý nhà thầu | Nhà thầu đã điều phối cho dịch vụ. |
| Họ tên | Text (read-only) | \[Họ tên Đầu mối chính\] | Họ tên Đầu mối chính. |
| Chức danh | Text (read-only) | \[Chức danh Đầu mối chính\] | Ánh xạ trường "Chức danh" (Quản lý nhà thầu); trống → "—". |
| Số điện thoại | Text (read-only) | \[Số điện thoại Đầu mối chính\] | Ánh xạ trường "Số điện thoại" (Quản lý nhà thầu); trống → "—". |
| Email | Text (read-only) | \[Email Đầu mối chính\] | Ánh xạ trường "Email" (Quản lý nhà thầu); trống → "—". |

Link UI Design: \[Chèn link\]. \[CR-K3-02\] 

**Modal "Chỉnh sửa chi phí" — các thành phần bổ sung/ảnh hưởng (CR-K3-02)**

| Tên trường | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- |
| Nút "Làm mới giá" | Button (icon ↻) | Hiển thị trên dòng Cố định | Chỉ hiển thị trên dòng có Loại giá \= "Cố định" và có ID dòng giá; ẩn với Phụ phí / Chi phí phát sinh (BR-K3-37). |
| Nút "+ Phụ phí" | Button | — | Nhấn vào hiển thị popup Thêm phụ phí |
| Nút "+ Chi phí phát sinh" | Button | — | Nhấn vào hiển thị popup Thêm chi phí phát sinh |
| ID dòng giá | Text (read-only) | Kế thừa từ AVL | Khóa tra cứu đơn giá khi làm mới; không thay đổi sau làm mới. |
| Đơn giá | Number (read-only) | Đơn giá đang lưu trên dòng | Sau làm mới: hiển thị đơn giá hiện tại của ID dòng giá. \[Đề xuất\] Highlight ô (nền vàng nhạt) đến khi Lưu/Hủy; tooltip "Đơn giá trước: {Đơn giá cũ} {Tiền tệ}". |
| Tổng chi (Nguyên tệ) | Number (read-only) | Tự động | Tính lại \= Đơn giá × SL ngay sau khi làm mới. |
| Tổng quy đổi (VND) | Number (read-only) | Tự động | Tính lại \= Tổng chi × Tỷ giá quy đổi ngay sau khi làm mới. |
| Nút "Lưu" / "Hủy" | Button | — | Lưu: ghi nhận đơn giá đã làm mới. Hủy / đóng Modal: bỏ thay đổi, giữ đơn giá cũ (BR-K3-39). |

**Dịch vụ Kho bãi — các trường bị ảnh hưởng (CR-K3-03)**

| Tên trường | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- |
| Tên đầu mục chi phí (Modal AVL) | Text (read-only) | Đầu mục Cố định theo Loại kho | Nguồn: Cấu hình đầu mục giá — phân hệ Kho bãi, Loại kho chứa Loại kho của dịch vụ, Kích hoạt \= Bật (BR-KB-06, BR-KB-07). Thứ tự theo Cấu hình đầu mục giá. |
| Nhà thầu đảm nhận (Modal AVL) | Dropdown | (Trống) | Option theo dòng giá của nhà thầu đã chọn cho đúng đầu mục, khớp Tên kho \+ Loại kho. Không có option → dropdown trống, hiển thị MSG-K3-INFO-03 tại dòng. |
| Đầu mục phụ phí (Popup "Thêm phụ phí") | Dropdown | (Trống) | Chỉ đầu mục Loại giá \= "Phụ phí", Kích hoạt, gắn Loại kho của dịch vụ (BR-KB-08). |
| Đầu mục phát sinh (Popup "Thêm chi phí phát sinh") | Select / Textbox | (Trống) | Gợi ý đầu mục Loại giá \= "Phát sinh", Kích hoạt, gắn Loại kho của dịch vụ; vẫn cho nhập tự do. |
| Đầu mục (Bảng chi phí trên Card) | Text (read-only) | Kế thừa | Chỉ chứa đầu mục thuộc danh sách theo Loại kho (dòng Cố định từ Modal AVL; Phụ phí / Phát sinh từ Popup). |
| Cảnh báo "Cần điều phối lại nhà thầu" | Banner (Card dịch vụ) | Ẩn | Hiển thị MSG-K3-WARN-06 (kèm số đầu mục chưa điều phối) khi có ≥1 đầu mục bị detach; ẩn khi "Xác nhận điều phối" lại thành công. |
| Khối "Thông tin nhà thầu" & Bảng chi phí | List / Table | — | Sau detach: khối "Thông tin nhà thầu" chỉ còn nhà thầu đảm nhận ≥1 đầu mục được giữ; Bảng chi phí giữ dòng của đầu mục còn áp dụng và dòng Chi phí phát sinh, bỏ dòng của đầu mục bị detach. |
| Nút "Điều phối nhà thầu" | Button | Ẩn | Hiển thị lại khi dịch vụ mang cờ "Cần điều phối lại nhà thầu", kể cả trạng thái "Đang thực hiện". |
| Nút "Hoàn thành dịch vụ" | Button | — | Nhấn khi còn cờ "Cần điều phối lại nhà thầu" → chặn, hiển thị ERR-K3-BR-07. |

## **3.4. Quy tắc nghiệp vụ (Business Rule)**

* BR-K3-32: Với mỗi nhà thầu đã điều phối cho dịch vụ con, K3 hiển thị thông tin liên hệ của **Đầu mối chính** gồm Họ tên, Chức danh (= "Chức danh"), Số điện thoại, Email; mỗi nhà thầu hiển thị 1 lần. Thông tin read-only, nguồn duy nhất là module Quản lý nhà thầu.

* BR-K3-33: Thông tin liên hệ được đọc trực tiếp (không lưu bản sao) từ Quản lý nhà thầu tại thời điểm hiển thị.

* BR-K3-34: Nhà thầu chưa có Đầu mối chính → hiển thị thông báo theo MSG-K3-INFO-01, không tự chọn đầu mối khác thay thế.

* BR-K3-35: Người có quyền “Điều phối nhà thầu” có thể xem được Thông tin nhà thầu bao gồm cả thông tin liên hệ nhà thầu

* BR-K3-36: "Làm mới giá" tra cứu dòng giá trong Giá mua đầu vào theo đúng **ID dòng giá** của dòng chi phí, lấy Đơn giá hiện tại và thay thế Đơn giá trên dòng; sau đó tự động tính lại Tổng chi và Tổng quy đổi (VND). Không thay đổi ID dòng giá, Đầu mục, Nhà thầu, ĐVT, SL. K3 chỉ đọc giá, không chỉnh sửa bảng giá nhà thầu (BR-K3-01).

* BR-K3-37: Nút "Làm mới giá" chỉ hiển thị trên dòng thuộc đầu mục giá có Loại giá \= **"Cố định"** (theo Cấu hình đầu mục giá) và có ID dòng giá; chỉ Coordinator phụ trách dịch vụ thao tác được và chỉ khi Bảng chi phí chưa bị khóa (BR-K3-LOCK-COST).

* BR-K3-38: Nguồn giá hợp lệ khi dòng giá còn tồn tại,“Đã phê duyệt” và thuộc Bảng giá "Đang hoạt động", tại thời điểm làm mới (đồng nhất điều kiện nạp giá tại Modal). Không thỏa → ERR-K3-BR-05, giữ nguyên đơn giá cũ.

* BR-K3-39: Đơn giá làm mới chỉ được ghi nhận khi nhấn "Lưu" tại Modal "Chỉnh sửa chi phí"; "Hủy" / đóng Modal → giữ đơn giá cũ. Đơn giá hiện tại không đổi → MSG-K3-INFO-02, không phát sinh thay đổi.

* BR-K3-40: Khi lưu, mỗi dòng có đơn giá thay đổi ghi 1 bản ghi Nhật ký Tháp điều phối: "\[Cập nhật chi phí\]: Làm mới đơn giá {Đầu mục} (ID {ID dòng giá}): {Đơn giá cũ} → {Đơn giá mới} {Tiền tệ}" — {Người thực hiện} \- {Actor}.

* BR-KB-06: Danh sách đầu mục giá của dịch vụ Kho bãi (dùng tại Modal Điều phối nhà thầu và Bảng chi phí dịch vụ) lấy từ **Cấu hình đầu mục giá**, phân hệ Kho bãi, thỏa đồng thời: (1) Loại kho của đầu mục (chọn nhiều) chứa Loại kho của dịch vụ; (2) Kích hoạt \= Bật. Loại kho của dịch vụ \= "Loại hình lưu kho" tại Khối 2 (thông tin thực tế). Nếu Loại hình lưu kho Khối 2 null, Loại kho của dịch vụ \= “Loại hình lưu kho” tại khối 1 (thông tin khai báo) .

* BR-KB-07: Bảng Phân bổ chi phí & nhiệm vụ (Modal AVL) hiển thị các đầu mục Loại giá \= "Cố định" thuộc danh sách BR-KB-06. 

* BR-KB-08: Bảng chi phí dịch vụ Kho bãi: dòng Cố định chỉ sinh từ đầu mục BR-KB-07 đã gán nhà thầu; Popup "Thêm phụ phí" chỉ cho chọn đầu mục Loại giá \= "Phụ phí" thuộc danh sách BR-KB-06; Popup "Thêm chi phí phát sinh" gợi ý đầu mục Loại giá \= "Phát sinh" thuộc danh sách BR-KB-06, vẫn cho nhập tự do.

* BR-KB-09: Danh sách đầu mục được nạp tại thời điểm mở Modal Điều phối nhà thầu. Thay đổi Cấu hình đầu mục giá sau đó không làm thay đổi dòng chi phí đã sinh. 

* BR-KB-10: Dịch vụ Kho bãi đã điều phối ("Điều phối" / "Đang thực hiện") mà người dùng cập nhật Loại hình lưu kho và xác nhận lưu (MSG-K3-WARN-05) → hệ thống đối chiếu từng đầu mục đang gắn trên dịch vụ (dòng Cố định, Phụ phí) với Cấu hình đầu mục giá: 

  * (a) Đầu mục không áp dụng cho Loại kho mới (Loại kho của đầu mục không chứa Loại kho mới) → sau khi người dùng xác nhận (MSG-K3-WARN-05), detach đầu mục đó cùng nhà thầu đảm nhận và dòng giá đã gắn; 

  * (b) Đầu mục vẫn áp dụng → giữ nguyên dòng chi phí, nhà thầu và dòng giá; 

  * (c) có ≥1 đầu mục bị detach → gắn cờ "Cần điều phối lại nhà thầu", chặn "Hoàn thành dịch vụ" (ERR-K3-BR-07) đến khi "Xác nhận điều phối" lại thành công; không có đầu mục bị detach; 

  * (d) ghi Nhật ký (Loại hình lưu kho cũ → mới, danh sách đầu mục và nhà thầu bị detach). Nhà thầu chỉ bị gỡ khỏi khối "Thông tin nhà thầu" khi không còn đảm nhận đầu mục nào. Trạng thái dịch vụ giữ nguyên; dòng Chi phí phát sinh giữ nguyên. Quy tắc này thay thế BR-K3-RESET-AVL mục 2a–2b đối với thuộc tính Loại kho của dịch vụ Kho bãi.

## **3.5. Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| MSG-K3-INFO-01: Nhà thầu đã điều phối chưa có Đầu mối chính | Thông tin | "Nhà thầu chưa thiết lập đầu mối liên hệ chính. Vui lòng liên hệ bộ phận Quản lý nhà thầu." | Hiển thị inline tại dòng nhà thầu trong khối "Thông tin nhà thầu". |
| MSG-K3-SUCCESS-07: Làm mới giá thành công, đơn giá thay đổi | Thành công (Toast) | "Đã làm mới đơn giá {Đầu mục}: {Đơn giá cũ} → {Đơn giá mới} {Tiền tệ}." | Cập nhật ô Đơn giá trong Modal, tính lại Tổng chi/Tổng quy đổi; chưa lưu. |
| MSG-K3-INFO-02: Đơn giá không thay đổi | Thông tin (Toast) | "Đơn giá của {Đầu mục} đã là giá mới nhất theo bảng giá nhà thầu." | Không thay đổi dữ liệu. |
| ERR-K3-BR-05: Dòng giá không còn hiệu lực | Lỗi (Modal) | "Không thể làm mới giá: dòng giá {ID dòng giá} không còn hiệu lực trong bảng giá nhà thầu. Vui lòng kiểm tra tại Giá mua đầu vào hoặc điều phối lại nhà thầu." | Giữ nguyên đơn giá cũ. |
| MSG-K3-INFO-03: Đầu mục Kho bãi chưa có nhà thầu chào giá | Thông tin (inline) | "Chưa có nhà thầu đã chọn chào giá cho đầu mục này theo Tên kho / Loại kho của dịch vụ." | Hiển thị tại dòng đầu mục trong Modal AVL; dropdown trống; không chặn "Xác nhận điều phối". |
| ERR-K3-BR-06: Không có đầu mục giá khớp Loại kho | Lỗi (Modal) | "Chưa có đầu mục giá nào được cấu hình cho Loại kho {Loại kho}. Vui lòng liên hệ bộ phận Quản lý nhà thầu để bổ sung tại Cấu hình đầu mục giá." | Chặn "Xác nhận điều phối". |
| MSG-K3-WARN-05: Cập nhật Loại hình lưu kho làm ≥1 đầu mục không còn áp dụng | Cảnh báo (Modal) | "Loại hình lưu kho {Loại kho mới} không áp dụng cho {N} đầu mục: {Danh sách đầu mục}. Các đầu mục này cùng nhà thầu và dòng giá đã gắn sẽ bị gỡ; bạn cần điều phối lại trước khi hoàn thành dịch vụ. Tiếp tục?" | Xác nhận → lưu và detach các đầu mục liệt kê (BR-KB-10). Hủy → giữ nguyên Loại hình lưu kho, nhà thầu và Bảng chi phí. |
| MSG-K3-WARN-06: Dịch vụ cần điều phối lại | Cảnh báo (Banner) | "Loại hình lưu kho đã thay đổi. Còn {N} đầu mục chưa điều phối nhà thầu theo danh sách đầu mục giá mới." | Hiển thị trên Card Kho bãi đến khi điều phối lại thành công. |
| ERR-K3-BR-07: Hoàn thành khi chưa điều phối lại | Lỗi (Modal) | "Không thể hoàn thành dịch vụ: nhà thầu chưa được điều phối lại theo Loại hình lưu kho mới." | Chặn "Hoàn thành dịch vụ". |

## **3.6. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Quản lý nhà thầu | Điểm hiệu suất nhà thầu (★ X.X/5). Đầu mối chính: Họ tên, Chức danh, SĐT, Email (BR-VD-12). | Quản lý nhà thầu → K3 | Hiển thị Card Thông tin nhà thầu đã điều phối | Chưa có điểm → hiển thị "—". Chưa có Đầu mối chính → MSG-K3-INFO-01. Lỗi đọc dữ liệu → hiển thị "Không tải được thông tin liên hệ". |
| Giá mua đầu vào | Đơn giá hiện tại của dòng giá theo ID dòng giá. Trạng thái, thời hạn hiệu lực của Bảng giá chứa dòng giá. | Giá mua đầu vào → K3 (chỉ đọc) | Nhấn "Làm mới giá" (CR-K3-02) | Dòng giá/bảng giá không hợp lệ → ERR-K3-BR-05. Lỗi đọc dữ liệu → hiển thị "Không tải được đơn giá. Vui lòng thử lại."; giữ đơn giá cũ. |

## **3.7. Cập nhật quy tắc hiện hành theo CR-K3-02**

| Vị trí | Trước (v1.0) | Sau (v1.1) |
| :---- | :---- | :---- |
| 1.6.4 Inline Edit Rules – mục 1 | Khóa không cho sửa trực tiếp trên Bảng: Đầu mục, Báo giá ID, Badge, ĐVT, SL, Đơn giá, Tổng chi, Tổng quy đổi. | Giữ nguyên khóa sửa trực tiếp. Bổ sung: Đơn giá dòng Cố định chỉ được thay đổi qua "Làm mới giá" trong Modal "Chỉnh sửa chi phí" (BR-K3-36). |
| BR-K3-LOCK-COST – mục 2 | Nút "+ Phụ phí", "+ Chi phí phát sinh" hiển thị trong section Chỉnh sửa chi phí. | Bổ sung nút "Làm mới giá" vào danh sách; chỉ hiển thị trên dòng Cố định (BR-K3-37). |
| BR-K3-25 / Binding 3 thông số – Parameter 2 | Đơn giá gốc → Đơn giá cố định dòng chi phí mặc định (kế thừa 1 lần khi Xác nhận điều phối). | Đơn giá kế thừa khi Xác nhận điều phối; được phép làm mới theo đơn giá hiện tại của cùng ID dòng giá (BR-K3-36). |
| UC-COMMON-01 – Hậu điều kiện | Trạng thái dịch vụ \= Điều phối. Bảng chi phí nhà thầu được khởi tạo. | Bổ sung: Đơn giá dòng Cố định có thể được làm mới đến trước khi Bảng chi phí bị khóa (US\_COM\_09). |

## **3.8. Cập nhật quy tắc hiện hành theo CR-K3-03**

| Vị trí | Trước (v1.0) | Sau (v1.1) |
| :---- | :---- | :---- |
| 1.6.5 Bảng Phân bổ chi phí & nhiệm vụ – cột "Tên đầu mục nhiệm vụ" | Lấy từ Bảng giá "Giá mua đầu vào" của đúng nhà thầu tương ứng (đầu mục có trong Bảng giá "Đang hoạt động", còn hiệu lực). | Giữ nguyên với 4 dịch vụ con còn lại. Riêng Kho bãi: lấy từ Cấu hình đầu mục giá theo Loại kho của dịch vụ (BR-KB-06, BR-KB-07). |
| 1.6.2 Popup "Thêm phụ phí" – Đầu mục phụ phí | Chọn 01 khoản phụ phí từ Bảng giá mua đầu vào. | Riêng Kho bãi: chỉ đầu mục Phụ phí gắn Loại kho của dịch vụ (BR-KB-08); Đơn giá nạp như hiện hành. |
| 1.6.3 Popup "Thêm chi phí phát sinh" – Đầu mục phát sinh | Chọn hoặc nhập tên khoản chi phí phát sinh thực tế. | \[Đề xuất\] Riêng Kho bãi: gợi ý đầu mục Phát sinh gắn Loại kho của dịch vụ; vẫn cho nhập tự do. |
| 1.6.10 Ma trận Mapping AVL – (2) Kho bãi | Tên kho \+ Loại kho dùng để lọc dòng giá mua đầu vào. | Bổ sung: Loại kho đồng thời dùng để lọc danh sách đầu mục giá (BR-KB-06). |
| BR-K3-RESET-AVL – Kho bãi | Đổi Tên kho / Loại kho → hủy gán nhà thầu, xóa Bảng chi phí mặc định, dịch vụ về "Chưa thực hiện". | Kho bãi — riêng thuộc tính Loại kho (Loại hình lưu kho): thay mục 2a–2b bằng BR-KB-10 (chỉ detach đầu mục không áp dụng cho Loại kho mới kèm nhà thầu, dòng giá; giữ nguyên đầu mục còn áp dụng; yêu cầu điều phối lại phần bị ảnh hưởng, chặn Hoàn thành; giữ trạng thái). Đổi Tên kho: giữ nguyên hành vi hiện hành. |
| UC-COMMON-01 (UC-KB-01) – Luồng cơ bản bước 5 & Ngoại lệ | Bước 5: Gán nhà thầu đảm nhận từng đầu mục nhiệm vụ. Ngoại lệ: E1, E2. | Kho bãi: đầu mục nhiệm vụ theo BR-KB-07. Bổ sung E3: không có đầu mục khớp Loại kho → ERR-K3-BR-06, chặn lưu. |
| 7.2 Mô tả giao diện Kho bãi – "Loại hình lưu kho" | Khối 1: Read-only; Khối 2: Dropdown, mặc định \= Khối 1\. Chưa mô tả hành vi khi cập nhật. | Cập nhật khi đã điều phối → có đầu mục bị ảnh hưởng: MSG-K3-WARN-05; không có: MSG-K3-INFO-04; áp dụng BR-KB-10. |
| UC-COMMON-01 (UC-KB-01) – Điều kiện tiên quyết | Trạng thái dịch vụ \= Chưa thực hiện. | Bổ sung: hoặc dịch vụ Kho bãi mang cờ "Cần điều phối lại nhà thầu" (trạng thái "Điều phối" / "Đang thực hiện"). |
| UC-COMMON-03 (UC-KB-03) – Luồng cơ bản bước 5 & Ngoại lệ | Bước 5: kiểm tra validation dữ liệu bắt buộc. Ngoại lệ: đổi thuộc tính Mapping → MSG-K3-WARN-04, dịch vụ về "Chưa thực hiện". | Bước 5 bổ sung: còn cờ "Cần điều phối lại nhà thầu" → ERR-K3-BR-07. Kho bãi – đổi Loại hình lưu kho: dùng MSG-K3-WARN-05 và BR-KB-10 thay cho MSG-K3-WARN-04. |

