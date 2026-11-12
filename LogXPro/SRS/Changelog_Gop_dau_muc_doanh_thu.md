# BẢNG TỔNG HỢP UPDATE — Gộp đầu mục doanh thu (cố định) & chọn ĐVT

**Phạm vi:** Quản lý Báo giá – Báo giá khách hàng (liên quan Quản lý Dịch vụ)   
**Ngày:** 12/10/2026   
**Người lập:** Đặng Thanh Sơn (BA)   
**Mục đích:** Dev nắm sơ bộ update ở những chỗ nào trong tài liệu cũ. Nội dung rule chi tiết lấy theo bản BA bàn giao kèm theo.

---

## 1\. Tóm tắt thay đổi (1 dòng)

Bổ sung quy tắc **gộp các đầu mục doanh thu cố định** trong Báo giá khách hàng: khi gộp phải **chọn Đơn vị tính (ĐVT)**, **Đơn giá gốc dòng gộp \= tổng đơn giá gốc các dòng con**, và dòng gộp **vẫn được điều chỉnh giá** ở chức năng Điều chỉnh giá chốt. Kéo theo 1 điểm đồng bộ sang tab Doanh thu của phiếu Dịch vụ.

---

## 2\. Danh sách vị trí cần update

| STT | Tài liệu | Vị trí (mục) | Loại | Nội dung update sơ bộ |
| :---- | :---- | :---- | :---- | :---- |
| 1 | SRS – Quản lý YCBG \+ Báo giá KH | **3.5.3.2** (Business Rule) | **Thêm mới** | Thêm **BR\_BG\_47** – quy tắc chọn ĐVT khi gộp đầu mục cố định \+ cộng tổng đơn giá gốc \+ cho phép điều chỉnh giá sau gộp. |
| 2 | SRS – Quản lý YCBG \+ Báo giá KH | **3.5.2 A – Popup 2 "Xác nhận Gộp đầu mục"** | **Thêm field \+ sửa** | Thêm field **"Đơn vị tính (ĐVT)"** (Dropdown, bắt buộc, auto-fill khi các dòng con cùng ĐVT). Sửa mô tả **"Tổng thành tiền sau gộp"** cho rõ cơ chế cộng Đơn giá gốc \+ Thành tiền sau điều chỉnh. |
| 3 | SRS – Quản lý YCBG \+ Báo giá KH | **3.5.4** (Thông báo & lỗi) | **Thêm mới** | Thêm dòng lỗi: thiếu ĐVT khi xác nhận gộp → chặn \+ báo "Vui lòng chọn đơn vị tính cho đầu mục sau khi gộp". |
| 4 | SRS – Quản lý YCBG \+ Báo giá KH | **US\_BG\_08 / US\_BG\_17** (AC gộp đầu mục) | **Sửa** | Bổ sung AC: popup gộp yêu cầu chọn ĐVT; dòng gộp tính đơn giá theo tổng đơn giá gốc. (tham chiếu BR\_BG\_47) |

## 3\. Các quyết định nghiệp vụ đã chốt (để dev hiểu logic)

| Điểm | Quyết định |
| :---- | :---- |
| ĐVT dòng gộp | Dropdown **bắt buộc**; auto-fill nếu các dòng con cùng ĐVT (cho đổi); để trống \+ bắt buộc chọn nếu khác ĐVT. |
| Đơn giá gốc dòng gộp | \= **tổng Đơn giá gốc (chưa điều chỉnh)** các dòng con; khóa chỉ đọc. |
| Thành tiền sau điều chỉnh dòng gộp | Khởi tạo \= tổng TTSĐC các dòng con; **vẫn sửa được** qua Điều chỉnh giá chốt. |
| Điều chỉnh (%) dòng gộp | Hệ thống tự tính lại theo BR\_BG\_13, chỉ đọc. |
| SL ở tab Doanh thu DV | Theo **quy tắc riêng gắn ĐVT**, không lấy từ số K3 nhập. |
| Sinh phiên bản | **Không** sinh version mới (đồng bộ BR\_BG\_24). |

---

## 4\. Phạm vi ảnh hưởng

- **Báo giá khách hàng:** màn Chi tiết (Chế độ Gộp đầu mục, Điều chỉnh giá chốt), Popup gộp.  
- **Dịch vụ:** tab Doanh thu từng dịch vụ con (chỉ hiển thị/tính toán, không đổi luồng).  
- **Không ảnh hưởng:** luồng trạng thái YCBG/Báo giá, gộp báo giá bổ sung (BR\_BG\_27, BR\_BG\_41 giữ nguyên).