# UPDATE SRS Cấu hình danh mục

# MODULE: Quản lý danh mục \- Đơn vị tính

## 

| Mục | Nội dung |
| ----- | ----- |
| **ID use case** | UC-DM-07 |
| **Tên use case** | Danh mục Đơn vị tính cấu hình sẵn (seed) với ràng buộc ĐVT ↔ Dịch vụ áp dụng ↔ Trường nguồn tính SL |
| **Module liên quan** | Cấu hình → Quản lý danh mục → **Đơn vị tính** (danh mục dùng chung, chỉ đọc). **Giá mua đầu vào** (tạo dòng giá); **K3 Tháp điều phối** (tính SL) |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Danh mục ĐVT là dữ liệu cấu hình cố định do hệ thống seed sẵn, không cho người dùng Thêm/Sửa/Xóa. Mỗi ĐVT gắn sẵn **Dịch vụ áp dụng** (multi-select trong 5 dịch vụ, hiển thị trên UI) và **Trường nguồn tính SL** (quy định dưới hệ thống/backend, không hiển thị UI). Lý do seed-only: ĐVT quyết định hệ thống đếm SL từ trường vận hành nào ở K3; ĐVT tự tạo sẽ không có trường nguồn → không tính được SL. Khi tạo dòng giá tại Giá mua đầu vào, dropdown ĐVT của một đầu mục chỉ hiển thị ĐVT có Dịch vụ áp dụng chứa dịch vụ của tab đó. |
| **Actor** | **Chính:** Hệ thống (seed danh mục khi triển khai / cập nhật qua migration, ngoài luồng nghiệp vụ). **Phụ — chỉ xem:** Người dùng có quyền xem danh mục (VD Dịch vụ khách hàng K1). **Phụ — chịu tác động:** Bộ phận quản lý nhà thầu (ràng buộc khi tạo dòng giá). |
| **Trigger** | \- Hệ thống nạp danh mục ĐVT seed khi khởi tạo/triển khai. \- Người dùng mở màn **Cấu hình → Quản lý danh mục → Đơn vị tính** để tra cứu. |
| **Điều kiện tiên quyết** | \- Danh mục 5 dịch vụ (phân hệ) đã tồn tại. \- Bộ ĐVT seed đã được định nghĩa kèm Dịch vụ áp dụng và Trường nguồn tính SL (Phụ lục mục 5). |
| **Luồng cơ bản** | 1\. Hệ thống seed sẵn danh sách ĐVT với: Mã (UOM-NNN), Tên hiển thị, **Dịch vụ áp dụng**, **Trường nguồn tính SL** (backend), Trạng thái \= Đang hiệu lực. 2\. Người dùng mở màn Đơn vị tính → xem danh sách ở chế độ chỉ đọc (không có nút Thêm/Sửa/Xóa). 3\. Có thể tìm kiếm theo Mã/Tên và xem cột Dịch vụ áp dụng. 4\. Tại Giá mua đầu vào, khi mở dialog thêm/sửa dòng giá của một đầu mục thuộc dịch vụ X → hệ thống lọc dropdown ĐVT \= các ĐVT seed có Dịch vụ áp dụng chứa X (BR-DM-07-02). 5\. Tại K3, SL của dòng chi phí tính theo Trường nguồn của đúng ĐVT đã chọn (ánh xạ backend, không hiển thị UI — BR-DM-07-03). |
| **Luồng ngoại lệ** | **E1 — Người dùng cố Thêm/Sửa/Xóa:** không có nút trên UI; nếu gọi API trực tiếp → chặn ở tầng API, báo “Danh mục Đơn vị tính là cấu hình hệ thống, không cho phép chỉnh sửa”. **E2 — Dịch vụ chưa có ĐVT seed nào áp dụng:** tại Giá mua, dropdown ĐVT trống \+ thông tin “Chưa có đơn vị tính cấu hình cho dịch vụ này” (về nguyên tắc không xảy ra nếu seed đủ). |
| **Luồng thay thế** | **A1 — Thay đổi bộ seed:** chỉ thực hiện qua phát hành/migration (thêm ĐVT, đổi Dịch vụ áp dụng, đổi Trường nguồn SL). Không thao tác runtime. **A2 — Ngừng dùng 1 ĐVT:** đặt Trạng thái \= Ngừng hiệu lực (qua seed/migration) → ẩn khỏi dropdown chọn mới; dòng giá cũ giữ nguyên (BR-DM-07-05). |
| **Hậu điều kiện Thành công** | Danh mục ĐVT hiển thị đúng bộ seed kèm Dịch vụ áp dụng; ràng buộc có hiệu lực ở Giá mua đầu vào (lọc dropdown) và ở K3 (tính SL đúng trường nguồn theo ánh xạ backend). |
| **Hậu điều kiện Thất bại** | Danh mục không nạp được/nạp thiếu → màn hiển thị trống hoặc dropdown ĐVT ở Giá mua trống; không phát sinh thao tác ghi dữ liệu từ người dùng. |
| **Business Rule** | BR-DM-07-01 → BR-DM-07-06 (mục 2). |
| **Yêu cầu phi chức năng** | \- **Toàn vẹn cấu hình:** ĐVT seed-only; chặn Thêm/Sửa/Xóa ở cả UI lẫn API. \- **Ràng buộc SL:** mỗi ĐVT có đúng 1 trường nguồn SL cho mỗi dịch vụ áp dụng, định nghĩa ở backend, không phơi ra UI. \- **Nhất quán:** danh mục dùng chung toàn hệ thống; lọc theo dịch vụ áp đồng nhất 5 phân hệ. \- **Hiệu năng:** dropdown ĐVT đã lọc tải ≤1s. \- **Truy vết:** mọi thay đổi bộ seed ghi version qua migration. |

#### 2\. Business Rule

| ID | Quy tắc |
| ----- | ----- |
| **BR-DM-07-01** | Danh mục ĐVT là cấu hình hệ thống seed sẵn, chỉ đọc với mọi người dùng; không có chức năng Thêm/Sửa/Xóa trên UI và chặn ở API. |
| **BR-DM-07-02** | Mỗi ĐVT gắn sẵn **Dịch vụ áp dụng** (≥1 trong 5 dịch vụ). Tại Giá mua đầu vào, dropdown ĐVT của một đầu mục chỉ hiển thị ĐVT có Dịch vụ áp dụng chứa dịch vụ của tab/đầu mục đang thao tác. |
| **BR-DM-07-03** | Mỗi ĐVT gắn sẵn **Trường nguồn tính SL** theo từng dịch vụ áp dụng; đây là nguồn K3 đếm SL. Trường này được quy định dưới hệ thống (backend), KHÔNG hiển thị trên UI. Ràng buộc này là lý do danh mục phải seed-only. |
| **BR-DM-07-04** | ĐVT “Lô hàng” áp dụng mọi dịch vụ, SL mặc định \= 1 (trọn gói, không gắn trường nguồn). |
| **BR-DM-07-05** | Ngừng hiệu lực 1 ĐVT (qua seed/migration): ẩn khỏi mọi dropdown chọn mới; dòng giá đã dùng ĐVT đó giữ nguyên, vẫn tham chiếu hạ nguồn (đồng quy ước BR51). |
| **BR-DM-07-06** | Việc thêm/đổi ĐVT, Dịch vụ áp dụng hoặc Trường nguồn SL chỉ qua phát hành hệ thống (seed/migration), không thao tác runtime. |

#### 3\. Phần ảnh hưởng — Module Giá mua đầu vào

| Vị trí SRS Giá mua | Hiện trạng (As-is) | Sau thay đổi (To-be) |
| ----- | ----- | ----- |
| US\_BGM\_08 – AC2 (thêm dòng đơn lẻ) | “Đơn vị tính” \= Select enum cố định từ cấu hình (toàn bộ). | Nguồn enum ĐVT lọc theo dịch vụ của tab/đầu mục (BR-DM-07-02). |
| US\_BGM\_09 – AC4 (tạo hàng loạt) | ĐVT chọn 1 giá trị từ cấu hình. | Danh sách ĐVT đã lọc theo dịch vụ của đầu mục. |
| US\_BGM\_13 – AC4 / Panel bộ lọc | Trường lọc “Đơn vị tính” lấy theo danh mục. | Giá trị ĐVT trong bộ lọc tab chỉ gồm ĐVT áp dụng cho phân hệ của tab (giữ giá trị ngừng dùng còn trong dòng hiện có, BR51). |
| Mục 3.1.2 – Bảng field dialog dòng giá | “Đơn vị tính \| Select (enum) \| Enum cố định từ cấu hình”. | Bổ sung: “chỉ gồm ĐVT có Dịch vụ áp dụng \= dịch vụ của tab (BR-DM-07-02)”. |
| US\_BGM\_14 – AC7 / BR56 (nhân bản) | Không sao chép dòng có thuộc tính ngừng dùng. | Mở rộng: không sao chép, không thông báo dòng giá có ĐVT không còn áp dụng cho dịch vụ của đầu mục. |
| 3.1.5 – Luồng dữ liệu | “Quản lý danh mục → dòng giá/bộ lọc”. | Bổ sung: danh mục ĐVT cung cấp ánh xạ ĐVT ↔ Dịch vụ áp dụng để lọc dropdown khi tạo/sửa dòng giá. |

#### 4\. Mô tả giao diện

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=15150-109859&t=qmVdyzuLA2iHG69X-4)

| Tên trường | Kiểu dữ liệu | Mô tả |
| ----- | ----- | ----- |
| Mã | Text (chỉ đọc) | UOM-NNN, seed |
| Tên hiển thị | Text (chỉ đọc) | Tên ĐVT |
| Dịch vụ áp dụng | Tag list (chỉ đọc) | ≥1 trong 5 dịch vụ (BR-DM-07-02) |
| Mô tả | Text (chỉ đọc) | Ghi chú |
| Trạng thái | Badge (chỉ đọc) | Đang hiệu lực / Ngừng hiệu lực |

#### 5\. Phụ lục — Bộ ĐVT seed

| Tên ĐVT | Dịch vụ áp dụng | Trường nguồn tính SL (backend) | Công thức |
| ----- | ----- | ----- | ----- |
| Xe TQ | Khai báo HQ, Vận tải, Sang tải | Danh sách xe của dịch vụ → lọc BSX ký tự đầu là chữ (VD 桂A-88888) | SL \= đếm xe TQ |
| Xe VN | Khai báo HQ, Vận tải, Sang tải | Danh sách xe của dịch vụ → lọc BSX ký tự đầu là số (VD 29C-123.45) | SL \= đếm xe VN |
| Xe | Vận tải | Số lượng xe trong danh sách xe dịch vụ Vận tải | SL \= số lượng xe |
| Chuyến | Vận tải | Số cặp “Điểm lấy – Điểm giao” đăng ký cho Vận tải | SL \= đếm số cặp điểm |
| Cặp xe | Sang tải | Mảng “Cặp xe sang tải” (mục 6.4) | SL \= đếm số cặp |
| Tờ khai | Khai báo HQ, HQ Giám sát | “Số lượng tờ khai” (2. TTTT, mục 3.4) | SL \= giá trị |
| Tấn | Vận tải, Sang tải, Kho bãi | VT: trọng lượng vận chuyển thực tế · ST: “Trọng lượng thực tế (tấn)” · Kho: “Trọng lượng tồn thực tế” | SL \= giá trị |
| m³ (CBM) | Sang tải, Kho bãi | ST: “Số lượng thực nhận” · Kho: “Số lượng thực tế” (theo ĐVT sản lượng) | SL \= giá trị |
| Pallet | Sang tải, Kho bãi | ST: “Số lượng thực nhận” · Kho: “Số lượng thực tế” (theo ĐVT sản lượng) | SL \= giá trị |
| Kiện | Sang tải, Kho bãi | ST: “Số lượng thực nhận” · Kho: “Số lượng thực tế” (theo ĐVT sản lượng) | SL \= giá trị |
| Thùng | Sang tải, Kho bãi | ST: “Số lượng thực nhận” · Kho: “Số lượng thực tế” (theo ĐVT sản lượng) | SL \= giá trị |
| Ngày | Kho bãi | “Thời gian xuất kho thực tế” − “Thời gian nhập kho thực tế” (mục 7.4) | SL \= số ngày |
| Lô hàng | Mọi dịch vụ | — | SL \= 1 |

# **UPDATE SRS Quản lý dịch vụ K1 \- Update tổng doanh thu cho phiếu dịch vụ**

# MODULE 1: Quản lý dịch vụ

## **US\_ORD\_04: Xem chi tiết tổng hợp  doanh thu phiếu dịch vụ**

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_ORD\_04 |
| **Tên Story** | Xem Tổng hợp doanh thu  của phiếu |
| **User Story** | Là Kiểm soát công nợ thu (K5) , tôi muốn xem chi tiết tổng doanh thu của phiếu dịch vụ, để đảm bảo quyết toán tài chính chính xác. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý Dịch vụ |
| **Người Phụ trách** | Đặng Thanh Sơn (BA) |

### **Bổ sung Acceptance Criteria**

| STT | AC | NC |
| ----- | ----- | ----- |
| AC1 | **Mở popup Tổng hợp doanh thu:** Nút "Tổng hợp CP-DT" hiển thị trên màn Chi tiết phiếu khi phiếu ở trạng thái **Đang thực hiện trở đi** (khi đã có dữ liệu /doanh thu). Bấm nút mở popup hiển thị toàn bộ thông tin tổng hợp. | NC1: Phiếu ở trạng thái Nháp, Tạo mới, Đã tiếp nhận (chưa xác nhận Chặng), Từ chối, Đã hủy — nút bị ẩn vì chưa có dữ liệu . |
| AC2 | **Header tổng hợp:** Hiển thị ô tổng:  Tổng doanh thu (kèm đơn vị tiền tệ). Giá trị \= tổng cộng tất cả dịch vụ con bên dưới. | NC2: Nếu chưa có dữ liệu  doanh thu cho bất kỳ dịch vụ nào, ô tổng tương ứng hiển thị 0\. |
| AC5 | **Nút Xác nhận:** Bấm "Xác nhận" → mở popup Xác nhận doanh thu (US\_ORD\_03 AC7). Chỉ hiển thị với vai trò K5 và khi phiếu ở trạng thái Đã thực hiện. | NC5: K1 chỉ xem, không thấy nút Xác nhận. |
| AC6 | **Nút Đóng:** Bấm "Đóng" → đóng popup, quay lại màn Chi tiết, không thay đổi dữ liệu. |  |

### **Bổ sung Business Rule**

| Rule | Mô tả |
| ----- | ----- |
| **BR\_ORD\_24** | **Nguồn dữ liệu Doanh thu:** Các đầu mục doanh thu được trích xuất từ Báo giá khách hàng theo BR\_ORD\_17 (matching thuộc tính điều kiện \+ SL thực tế từ K3). Đơn giá bán khóa cứng theo Báo giá, K1/K5 không sửa. |
| **BR\_ORD\_25** | **Đơn vị tiền tệ & quy đổi:** Đơn vị tiền tệ kế thừa từ Báo giá khách hàng (VND/USD/CNY). Cột "Thành tiền" hiển thị theo đồng tiền gốc Báo giá. Nếu đồng tiền gốc không phải VND, hệ thống hiển thị thêm giá trị quy đổi VND (theo tỷ giá tại thời điểm quyết toán) để phục vụ hạch toán nội bộ. |
| **BR\_ORD\_27** | **Thời điểm có dữ liệu:** . Doanh thu có ngay khi matching Báo giá thành công (có thể từ lúc tạo phiếu nếu đã có đủ thuộc tính). |

### **Bổ sung bảng mô tả field**

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=13647-118633&t=9bBezlMq3H7PBxLa-4)

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Mô tả |
| ----- | ----- | ----- | ----- | ----- |
| Tiêu đề popup |  | Text |  | "Tổng hợp doanh thu" |
| Mã phiếu dịch vụ |  | Text |  | Hiển thị mã phiếu dịch vụ đang được xác nhận |
| Tổng doanh thu |  | Number |  | Hiển thị tổng doanh thu của phiếu đó |
| Đơn vị tiền tệ |  | Text |  | Hiển thị tên viết tắt của đơn vị tiền tệ của phiếu  Đô la mỹ: USD Nhân dân tệ: CNY Việt Nam đồng: VND |
| Chặng |  |  |  | Hiển thị tên chặng trong dịch vụ |
| Tổng doanh thu theo chặng |  |  |  | Bằng tổng doanh thu của các dịch vụ trong chặng |
| Tên dịch vụ |  | Text |  | Hiển thị tên dịch vụ có trong phiếu |
| Tổng doanh thu dịch vụ |  | Number |  | Bằng tổng doanh thu của các đầu mục trong dịch vụ  \= Tổng cộng của các đầu mục trong dịch vụ tại cột thành tiền |
| Nút Xác nhận |  | Button  |  | Nhấn để mở popup xác nhận doanh thu |
| Nút Hủy |  | Button |  | Nhấn để hủy bỏ thao tác trở về màn hình chi tiết phiếu |

