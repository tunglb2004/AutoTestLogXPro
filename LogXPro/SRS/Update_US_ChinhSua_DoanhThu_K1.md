# TÀI LIỆU UPDATE — BỔ SUNG US CHỈNH SỬA DOANH THU

| Thuộc tính | Giá trị |
| :---- | :---- |
| Tài liệu gốc | SRS\_LogXPro\_QL dịch vụ\_Khối 1 (Quản lý Dịch vụ) |
| Loại update | Bổ sung US mới \+ 1 Business Rule \+ cập nhật mô tả giao diện tab Doanh thu |
| Người lập | Đặng Thanh Sơn (BA) |
| Ngày | 12/10/2026 |

## A. TÓM TẮT UPDATE (cho dev nắm nhanh)

Bổ sung chức năng **Chỉnh sửa doanh thu** tại màn Chi tiết phiếu dịch vụ → tab **Doanh thu** của từng dịch vụ con. Khi bấm "Chỉnh sửa", K1 được sửa **3 cột: Đơn vị tính (ĐVT), Số lượng (SL), Đơn giá** — nhưng **chỉ trên dòng đầu mục Phát sinh**; dòng Cố định và Phụ phí giữ nguyên read-only.

**Vị trí chèn trong tài liệu gốc:**

1. Thêm **US\_ORD\_05** mới — ngay sau mục 3.1.4 US\_ORD\_04.  
2. Thêm **BR\_ORD\_28** vào bảng Business Rule.  
3. Cập nhật mục 3.1.3 US\_ORD\_03 → C. Bảng field → Khối V mục 6\. Doanh thu: bổ sung nút "Chỉnh sửa doanh thu" và mô tả chế độ sửa.

## B. NỘI DUNG CHÈN

### 3.1.5 US\_ORD\_05 — Chỉnh sửa doanh thu dịch vụ *(US mới)*

#### a. User Story

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_ORD\_05 |
| **Tên Story** | Chỉnh sửa doanh thu dịch vụ (đầu mục phát sinh) |
| **User Story** | Là Nhân viên Dịch vụ khách hàng (K1), tôi muốn bấm "Chỉnh sửa" tại tab Doanh thu của từng dịch vụ con để điều chỉnh Đơn vị tính, Số lượng và Đơn giá của các đầu mục doanh thu phát sinh, để doanh thu khớp với thực tế phát sinh tại hiện trường trước khi K5 chốt quyết toán. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý Dịch vụ |
| **Người Phụ trách** | Đặng Thanh Sơn (BA) |

#### b. Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (NC) |
| :---- | :---- | :---- |
| **AC1** | **Hiển thị nút "Chỉnh sửa doanh thu":** Trên tab Doanh thu của từng dịch vụ con, nút "Chỉnh sửa" hiển thị khi phiếu ở trạng thái **Đang thực hiện** hoặc **Đã thực hiện**, và tài khoản là **K1 phụ trách** khách hàng đó (own-scope theo BR\_ORD\_13). | **NC1:** Phiếu ở Nháp/Tạo mới/Đã tiếp nhận/Từ chối/Đã hủy/**Hoàn thành**, hoặc không phải K1 phụ trách → nút bị ẩn. |
| **AC2** | **Vào chế độ chỉnh sửa:** Bấm "Chỉnh sửa", bảng doanh thu chuyển sang chế độ nhập liệu. Hệ thống **auto-fill sẵn giá trị hiện tại** vào 3 cột cho phép sửa; K1 chỉnh trực tiếp **ĐVT (dropdown), Số lượng (number), Đơn giá (number)**. |  |
| **AC3** | **Chỉ cho sửa dòng Phát sinh:** Chỉ các dòng có phân loại **Phát sinh** mới mở 3 cột ĐVT/SL/Đơn giá cho nhập. Dòng **Cố định** và **Phụ phí** giữ **read-only** (khóa cứng theo BR\_ORD\_10). | **NC2:** Thao tác sửa trên dòng Cố định/Phụ phí bị hệ thống chặn. |
| **AC4** | **Tự tính lại Thành tiền:** Khi sửa SL hoặc Đơn giá, hệ thống tự tính lại: **Thành tiền \= SL × Đơn giá** và **Thành tiền quy đổi \= Thành tiền × tỷ giá**, cập nhật ngay dòng Tổng doanh thu (trước VAT / VAT / sau VAT) ở Footer. |  |
| **AC5** | **Ưu tiên giá trị sửa tay (chặn K3 ghi đè):** Sau khi K1 lưu chỉnh sửa 1 dòng phát sinh, dòng đó được đánh dấu **"đã chỉnh tay"** và **ngừng auto-đồng bộ** từ chi phí K3; giá trị sửa tay là giá trị chính thức dùng cho quyết toán. | **NC3:** Hệ thống không được tự ghi đè giá trị K1 đã sửa khi K3 cập nhật chi phí sau đó. |
| **AC6** | **Lưu / Hủy:** Bấm "Lưu" → validate, ghi dữ liệu, thoát chế độ sửa, ghi **Lịch sử hoạt động** (người sửa, thời điểm, giá trị trước→sau). Bấm "Hủy" → giữ nguyên giá trị cũ, thoát chế độ sửa. | **NC4:** Nhập SL ≤ 0 hoặc Đơn giá \< 0 hoặc bỏ trống ĐVT → chặn lưu, viền đỏ ô lỗi. |
| **AC7** | **Khóa sau quyết toán:** Khi K5 bấm "Xác nhận doanh thu" (phiếu → Hoàn thành), toàn bộ bảng doanh thu khóa vĩnh viễn, nút "Chỉnh sửa doanh thu" bị ẩn  |  |

#### c. Quy tắc nghiệp vụ (Business Rule)

| Rule ID | Mô tả |
| :---- | :---- |
| **BR\_ORD\_28** | **Quy tắc chỉnh sửa doanh thu phát sinh:** (1) Chỉ K1 phụ trách được sửa, ở trạng thái **Đang thực hiện / Đã thực hiện**; từ **Hoàn thành** trở đi khóa vĩnh viễn.  (2) Chỉ sửa được 3 cột **ĐVT, SL, Đơn giá** và **chỉ trên dòng Phát sinh**; dòng Cố định & Phụ phí read-only .  (3) Khi vào chế độ sửa, hệ thống auto-fill giá trị hiện tại; sau khi lưu, dòng đã sửa **ưu tiên giá trị tay**, ngừng auto-đồng bộ từ K3 (ngoại lệ của BR\_ORD\_17 mục 5–6).  (4) Thành tiền \= SL × Đơn giá; Thành tiền quy đổi \= Thành tiền × tỷ giá; tính lại Footer theo 1 mức VAT của phiếu.  (5) Validate: SL \> 0, Đơn giá ≥ 0, ĐVT bắt buộc. |

#### d. Mô tả giao diện 

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=11499-125615&t=Qk2b9bSlS8o0UUgH-4)

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| Nút "Chỉnh sửa doanh thu" |  | Button |  | Hiển thị khi phiếu ở Đang thực hiện/Đã thực hiện & K1 phụ trách. Bấm để vào chế độ sửa bảng doanh thu. |
| Cột ĐVT (chế độ sửa) | v | Dropdown | Giá trị hiện tại | Chỉ editable trên dòng Phát sinh; auto-fill ĐVT hiện tại, chọn từ danh mục ĐVT. |
| Cột Số lượng (chế độ sửa) | v | Number (\>0) | Giá trị hiện tại | Chỉ editable trên dòng Phát sinh. |
| Cột Đơn giá (chế độ sửa) | v | Number (≥0) | Giá trị hiện tại | Chỉ editable trên dòng Phát sinh. |
| Nút "Lưu" / "Hủy" |  | Button |  | Lưu: validate \+ ghi \+ ghi log. Hủy: thoát, giữ giá trị cũ. |

#### e. Thông báo và lỗi

| Trigger | Loại | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Nhập SL ≤ 0 | Lỗi | "Số lượng phải lớn hơn 0." | Viền đỏ ô SL, chặn lưu |
| Nhập Đơn giá \< 0 | Lỗi | "Đơn giá không hợp lệ." | Viền đỏ ô Đơn giá, chặn lưu |
| Bỏ trống ĐVT | Lỗi | "Vui lòng chọn đơn vị tính." | Viền đỏ ô ĐVT, chặn lưu |
| Lưu chỉnh sửa thành công | Thành công | "Cập nhật doanh thu thành công." | Thoát chế độ sửa, cập nhật Footer, ghi Lịch sử hoạt động |

