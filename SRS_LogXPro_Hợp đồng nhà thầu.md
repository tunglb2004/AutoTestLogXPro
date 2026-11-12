# **TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

(Software Requirements Specification \- SRS)

| Tên hệ thống | LogXPro — Bộ phận Quản lý Nhà thầu |
| ----- | ----- |
| **Link UI Design** | https\://www\.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=82-956\&p=f\&t=PSVmeY5I44tdMCJD-0 |
| **Người lập** | Bùi Tuấn Nam |
| **Ngày tạo** | \[30/07/2026\] |

## **1\. Tổng quan & Phạm vi**

### **1.1. Mục tiêu**

LogXPro là phần mềm quản lý doanh nghiệp dịch vụ logistics nội địa và xuyên biên giới Việt–Trung, xây dựng theo mô hình chuẩn 4PL. Tài liệu này đặc tả yêu cầu phần mềm cho **2 module thuộc Khối Quản lý Cung ứng (K2+K4)** do Quản lý nhà thầu phụ trách: **Quản lý Nhà thầu** và **Quản lý Hợp đồng Nhà thầu**.

Hai module tập trung vào nghiệp vụ **lưu trữ và quản lý thông tin** mạng lưới nhà thầu cung ứng dịch vụ vận tải: hồ sơ năng lực, phân hạng, trạng thái hợp tác, bảng giá dịch vụ, và toàn bộ vòng đời hợp đồng nguyên tắc (upload, gia hạn qua phụ lục, theo dõi hiệu lực). Đây là nền tảng dữ liệu để các khối khác (K2 Pricing tham chiếu bảng giá tính giá vốn, K3 điều phối gán nhà thầu) vận hành chính xác.

### **1.2. Phạm vi hệ thống**

* **Trong phạm vi (In-scope):**  
  * Quản lý Nhà thầu: tạo, xem, chỉnh sửa, phân hạng, cập nhật trạng thái, xóa hồ sơ, tra cứu, xuất danh sách; xem và xuất (export) bảng giá dịch vụ của nhà thầu  
  * Quản lý Hợp đồng Nhà thầu: upload và lưu trữ hợp đồng nguyên tắc đã ký, quản lý phụ lục hợp đồng, tải file scan, tra cứu; tự động cảnh báo hợp đồng sắp hết hạn  
* **Ngoài phạm vi (Out-of-scope):**  
  * Luồng phê duyệt KYC nhà thầu và phê duyệt hợp đồng  
  * Quản lý đấu thầu (Tender Management)

## **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)** 

## 

## 

## 

## 

## 

## **Sơ đồ trạng thái hợp đồng nhà thầu:**

![][image1]  
Hợp đồng nhà thầu (5 trạng thái)

* **Chưa hiệu lực → Đang hiệu lực**: tự động, đến ngày hiệu lực.  
* **Chưa hiệu lực → Đã hủy**: khi Hủy HĐ, hoặc tự động kéo theo khi nhà thầu Dừng hợp tác.  
* **Đang hiệu lực → Hết hiệu lực**: tự động, khi quá hạn hiệu lực.  
* **Hết hiệu lực → Đang hiệu lực**: thủ công, khi Gia hạn  
* **Đang hiệu lực → Dừng khai thác**: khi Dừng khai thác thủ công, hoặc tự động kéo theo khi nhà thầu Dừng hợp tác, hoặc khi HĐ tái ký (thay thế HĐ đang hiệu lực).  
* **Hết hiệu lực → Dừng khai thác**: tự động kéo theo khi nhà thầu Dừng hợp tác.

Bảng giá mua đầu vào (4 trạng thái)

* **Tạo mới → Đang hoạt động**: khi nhà thầu "Đang hoạt động" và hợp đồng gắn bảng giá "Đang hiệu lực".  
* **Đang hoạt động ⇄ Ngưng hoạt động**: theo trạng thái nhà thầu — nhà thầu "Ngưng hoạt động" thì bảng giá "Ngưng hoạt động", nhà thầu "Đang hoạt động" trở lại thì bảng giá "Đang hoạt động".  
* **Đang hoạt động / Ngưng hoạt động → Hết hiệu lực**: tự động kéo theo khi hợp đồng gắn bảng giá chuyển "Dừng khai thác" hoặc "Đã hủy".

"Hết hiệu lực" của bảng giá là trạng thái cuối (theo hợp đồng đã đóng).  
Liên kết giữa 3 máy (tự động kéo theo)

* Nhà thầu **Dừng hợp tác** → hợp đồng: "Chưa hiệu lực" thành "Đã hủy", "Đang hiệu lực" và "Hết hiệu lực" thành "Dừng khai thác".  
* Hợp đồng chuyển "Đang hiệu lực" ⇄ "Hết hiệu lực" / "Dừng khai thác" → cập nhật trạng thái Nhà thầu (Đang/Ngưng hoạt động) và Bảng giá mua tương ứng.  
* Hợp đồng **Dừng khai thác** (hoặc "Đã hủy") → Bảng giá mua "Hết hiệu lực".

## **3\. Đặc tả Tính năng**

### **3.2. MODULE: Quản lý Hợp đồng Nhà thầu** (Chờ review)

#### **3.2.1. Danh sách Use Case**

| Mã UC | Tên Use Case | Actor | Độ Ưu tiên |
| ----- | ----- | ----- | ----- |
| UC-CTV-01 | Upload hợp đồng nhà thầu đã ký | Quản lý nhà thầu | Must have |
| UC-CTV-02 | Xem hợp đồng nhà thầu | Quản lý nhà thầu | Must have |
| UC-CTV-03.1 | Thêm phụ lục hợp đồng nhà thầu | Quản lý nhà thầu | Must have |
| UC-CTV-03.2 | Sửa phụ lục hợp đồng nhà thầu | Quản lý nhà thầu | Must have |
| UC-CTV-03.3 | Xóa phụ lục hợp đồng nhà thầu | Quản lý nhà thầu | Must have |
| UC-CTV-04 | Chỉnh sửa hợp đồng nhà thầu | Quản lý nhà thầu | Must have |
| UC-CTV-05 | Hủy hợp đồng nhà thầu | Quản lý nhà thầu | Must have |
| UC-CTV-06 | Dừng khai thác hợp đồng nhà thầu | Quản lý nhà thầu | Must have |
| UC-CTV-07 | Gia hạn hợp đồng nhà thầu | Quản lý nhà thầu | Must have |
| UC-CTV-09 | Quản lý tự động gia hạn hợp đồng | Quản lý nhà thầu | Must have |
| UC-CTV-10 | Tìm kiếm/lọc hợp đồng nhà thầu | Quản lý nhà thầu | Must have |
| UC-CTV-11 | Xem lịch sử thao tác hợp đồng nhà thầu | Quản lý nhà thầu | Must have |

##### **Use case 1: Upload hợp đồng nhà thầu đã ký**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-01  |
| **Tên use case** | Upload hợp đồng nhà thầu đã ký |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu khai lập và lưu trữ hợp đồng nguyên tắc đã ký kết với nhà thầu vào hệ thống kèm file scan pháp lý. Đây là bước thiết lập nền tảng pháp lý cho quan hệ cung ứng, đảm bảo mọi hợp đồng đều được quản lý tập trung với đầy đủ thông tin hiệu lực, điều khoản gia hạn và tài liệu đính kèm. |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm nút "Thêm hợp đồng" tại màn Danh sách Hợp đồng Nhà thầu → chọn chế độ "Thêm hợp đồng mới"  |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống **Nhà thầu ở trạng thái "Tạo mới" (chưa từng có hợp đồng)** — đây là HĐ đầu tiên Đã có bản Hợp đồng đã ký (file scan) |
| **Luồng cơ bản** | **1\.** Quản lý nhà thầu bấm "Thêm hợp đồng" và chọn "Thêm hợp đồng mới"  **2\.** Hệ thống hiển thị form Tạo hợp đồng **3\.** Quản lý nhà thầu điền các trường thông tin, chọn Điều khoản gia hạn và upload file scan hợp đồng **4\.** Quản lý nhà thầu bấm "Tạo mới hợp đồng" **5\.** Hệ thống lưu hợp đồng, sinh Mã hợp đồng, gán trạng thái theo ngày (Chưa/Đang hiệu lực), lưu lịch sử thao tác **6\.** Hệ thống chuyển sang màn hình Chi tiết hợp đồng |
| **Luồng ngoại lệ** | **4b. Thiếu trường bắt buộc, sai thứ tự ngày (ký/hiệu lực/hết hạn), hoặc chưa upload/file scan không hợp lệ** — Hệ thống chặn lưu và báo lỗi tại trường tương ứng.  **5b. Lỗi hệ thống khi lưu** — Hệ thống báo lỗi, cho phép thử lại.  |
| **Luồng thay thế** | **1a1.** Quản lý nhà thầu bấm "Thêm hợp đồng" và chọn "Tái ký hợp đồng"  **1a2.** Bấm "Thêm hợp đồng" → chọn "Tái ký hợp đồng" → chọn nhà thầu từ dropdown đã lọc **2a.** Hệ thống mở form Tái ký 2 bước — Bước 1: Xác nhận thông tin nhà thầu (điền sẵn từ HĐ cũ); Bước 2: Xác nhận thông tin hợp đồng (nhập các mốc ngày, điều khoản, upload file scan mới, upload file phụ lục tùy chọn) **3a.** Quản lý nhà thầu điền các trường của hợp đồng mới, upload file scan mới và upload file phụ lục nếu có **4a.** Quản lý nhà thầu bấm "Hoàn tất tái ký" **5a.** Hệ thống lưu hợp đồng mới với mã CTVYYMM-XXX mới, gán trạng thái theo ngày. Nếu có file phụ lục → tự động tạo bản ghi Phụ lục hợp đồng gắn với HĐ mới với Mã PLVYYMM-XXX, Tên mặc định "Phụ lục kèm tái ký HĐ \[Mã HĐ mới\]", Ngày bổ sung phụ lục \= ngày hôm nay **5b. Hợp đồng cũ "Đang hiệu lực" và Ngày hiệu lực HĐ mới \< Ngày hết hạn HĐ cũ** — Hệ thống hiển thị popup xác nhận Dừng khai thác HĐ cũ (điền sẵn lý do "Được thay thế bởi Hợp đồng tái ký \[Mã HĐ mới\]"). Quản lý nhà thầu xác nhận → HĐ cũ chuyển "Dừng khai thác", HĐ mới được lưu. **5c. Hợp đồng cũ "Đang hiệu lực" và Ngày hiệu lực HĐ mới ≥ Ngày hết hạn HĐ cũ** — HĐ cũ sẽ tự chuyển "Hết hiệu lực" theo tác vụ tự động khi tới ngày. HĐ mới được lưu bình thường. **6a.** Hệ thống chuyển sang màn hình Chi tiết hợp đồng mới |
| **Hậu điều kiện Thành công** | Bản ghi hợp đồng được lưu với trạng thái theo ngày File scan được lưu vào hệ thống Widget "Hợp đồng kích hoạt" và "Tổng hợp đồng" được cập nhật lịch sử thao tác tạo hợp đồng được ghi nhận |
| **Hậu điều kiện Thất bại** | Không có bản ghi hợp đồng mới trong hệ thống Hệ thống hiển thị thông báo lỗi tương ứng Giữ nguyên dữ liệu đã nhập trên form |
| **Business Rule** | **BR-CTV-01 — Quy tắc sinh Mã hợp đồng nhà thầu:** Mã hợp đồng nhà thầu sinh tự động theo format CTVYYMM-XXX (CTV \= Contract Vendor cố định, YYMM \= 2 số cuối của năm \+ tháng hiện tại; XXX bắt đầu từ 001; VD: CTV2608-003). Không cho chỉnh sửa sau khi tạo  **BR-CTV-02 — Ràng buộc file đính kèm:** Bắt buộc đính kèm ít nhất 1 file scan khi upload hoặc tái ký hợp đồng.  **BR-CTV-03 — Ràng buộc ngày hợp đồng:** Ngày hiệu lực ≤ Ngày hết hạn  **BR-CTV-05 — Ràng buộc 1 nhà thầu 1 hợp đồng hiệu lực:** Tại mọi thời điểm, mỗi nhà thầu chỉ được có **tối đa 1 hợp đồng ở trạng thái "Đang hiệu lực"**. Một hợp đồng "Chưa hiệu lực" **được phép tồn tại song song** với hợp đồng "Đang hiệu lực" hiện tại, với điều kiện **không chồng lấn thời gian hiệu lực**.(Ngày hiệu lực của HĐ "Chưa hiệu lực" phải **lớn hơn** Ngày hết hạn của HĐ "Đang hiệu lực"). **BR-CTV-09 — Cơ chế tái ký hợp đồng** **Điều kiện tiên quyết: nhà thầu KHÔNG ở "Dừng hợp tác"** (phải kích hoạt lại trước — BR-CTV-21). Áp dụng cho **HĐ mới nhất** ở "Đang hiệu lực"/"Hết hiệu lực"/"Dừng khai thác"/"Đã hủy". Tạo HĐ mới độc lập (mã mới, file scan mới), Ngày hiệu lực HĐ mới \> Ngày hiệu lực HĐ trước. Xử lý HĐ cũ: **"Đang hiệu lực" → buộc "Dừng khai thác"** (lý do "Được thay thế bởi HĐ tái ký \[Mã\]"); **"Hết hiệu lực"/"Dừng khai thác"/"Đã hủy" → giữ nguyên**. Popup có ô upload phụ lục tùy chọn → tự tạo bản ghi phụ lục gắn HĐ mới. **BR-CTV-17 — Hiển thị nút thao tác theo trạng thái :**  Nút chỉ hiển thị khi thỏa đồng thời: (i) người dùng có quyền Quản lý nhà thầu; (ii) nhà thầu KHÔNG ở "Dừng hợp tác" — nếu Dừng hợp tác thì ẩn toàn bộ nút thao tác, chỉ còn Xem chi tiết / Tải file scan / Xem lịch sử (BR-CTV-21); (iii) hợp đồng thỏa điều kiện trạng thái riêng của từng nút bên dưới. Trạng thái không thỏa thì ẩn nút (không hiển thị mờ/disable). "HĐ mới nhất" \= hợp đồng có Ngày hiệu lực lớn nhất của nhà thầu. **Tái ký** (UC-CTV-01, BR-CTV-09): hiển thị khi HĐ "Đang hiệu lực", "Hết hiệu lực", "Dừng khai thác" hoặc "Đã hủy", và là HĐ mới nhất của nhà thầu. **Dừng khai thác** (UC-CTV-06, BR-CTV-12): hiển thị khi HĐ "Đang hiệu lực". **BR-CTV-20 — Hiệu lực Bảng giá mua theo HĐ & trạng thái nhà thầu:** Mỗi bảng giá mua gắn đúng 1 hợp đồng. Hiệu lực của bảng giá phụ thuộc đồng thời trạng thái hợp đồng gắn với nó và trạng thái nhà thầu; hệ thống tự cập nhật bảng giá khi một trong hai thay đổi: Hợp đồng gắn bảng giá chuyển **"Đang hiệu lực"** (và nhà thầu "Đang hoạt động") → bảng giá có hiệu lực, được dùng để tính giá vốn/phân bổ. Hợp đồng chuyển **"Hết hiệu lực"** (quá hạn) → bảng giá tạm ngưng hiệu lực; nếu hợp đồng được Gia hạn về "Đang hiệu lực" → bảng giá có hiệu lực trở lại. Hợp đồng chuyển **"Dừng khai thác"** hoặc **"Đã hủy"** → bảng giá hết hiệu lực vĩnh viễn. Nhà thầu chuyển **"Dừng hợp tác"** (thủ công) → toàn bộ bảng giá của nhà thầu hết hiệu lực vĩnh viễn (theo luồng Dừng hợp tác tại BR-VD-06). Ràng buộc: khoảng hiệu lực bảng giá nằm trong thời hạn hợp đồng (Ngày hiệu lực bảng giá ≥ Ngày hiệu lực HĐ; Ngày hết hạn ≤ Ngày hết hạn HĐ). **BR-CTV-21 — Khóa thao tác HĐ khi nhà thầu "Dừng hợp tác:** Khi nhà thầu "Dừng hợp tác", khóa toàn bộ thao tác trên mọi HĐ của nhà thầu: Upload, Gia hạn, Tái ký, Chỉnh sửa, Hủy, Dừng khai thác, Thêm/Sửa/Xóa phụ lục. Chỉ cho Xem (read-only) \+ tải file scan; nút thao tác bị ẩn (BR-CTV-17). Muốn thao tác lại phải kích hoạt lại nhà thầu (BR-VD-17) |
| **Yêu cầu phi chức năng** | Thời gian lưu hợp đồng \< 3 giây  |

##### **Use case 2: Xem chi tiết hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-02 |
| **Tên use case** | Xem chi tiết hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu tra cứu danh sách hợp đồng nhà thầu theo bộ lọc/tìm kiếm, xem chi tiết một hợp đồng cụ thể (điều khoản thương mại, dịch vụ, giá, danh sách phụ lục, lịch sử gia hạn), và tải file scan gốc về máy nếu cần. Section Giám sát kỳ hạn hiển thị 3 mức cảnh báo giúp chủ động xử lý các HĐ sắp hết hạn.  |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm biểu tượng xem trên hàng hợp đồng trong danh sách |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống Hợp đồng tồn tại trong hệ thống |
| **Luồng cơ bản** | 1\. Quản lý nhà thầu nhấn vào xem chi tiết hợp đồng  2\. Hệ thống hiển thị Chi tiết hợp đồng: thông tin nhà thầu, danh sách phụ lục, đầu mối liên hệ và Lịch sử gia hạn (nếu có)  |
| **Luồng ngoại lệ** |  |
| **Luồng thay thế** |  |
| **Hậu điều kiện Thành công** | Quản lý nhà thầu xem được danh sách/chi tiết Hợp đồng theo tiêu chí tra cứu Nếu tải file: File scan được tải về máy và lịch sử thao tác tải file được ghi nhận Section Giám sát kỳ hạn hiển thị đúng phân loại mức cảnh báo  |
| **Hậu điều kiện Thất bại** | Màn hình không hiển thị được Hệ thống hiển thị thông báo lỗi tương ứng |
| **Business Rule** | **BR-CTV-04 — 5 trạng thái hợp đồng:** Hợp đồng có 5 trạng thái (Chưa hiệu lực, Đang hiệu lực, Hết hiệu lực, Dừng khai thác, Đã hủy). Hợp đồng mới upload tự động đặt trạng thái Chưa hiệu lực (nếu Ngày hiệu lực \> hôm nay) hoặc Đang hiệu lực (nếu Ngày hiệu lực ≤ hôm nay) |
| **Yêu cầu phi chức năng** | Thời gian tải màn hình Chi tiết \< 2 giây |

##### **Use case 3.1: Thêm phụ lục hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-03.1 |
| **Tên use case** | Thêm phụ lục hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu thêm phụ lục vào hợp đồng để lưu trữ văn bản pháp lý gắn với hợp đồng (phụ lục thay đổi điều khoản, gia hạn, điều chỉnh giá, biên bản đối soát, cam kết đặc biệt...). Là kho tài liệu tham chiếu, không ảnh hưởng trạng thái/hiệu lực hợp đồng. |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm nút "Thêm phụ lục" tại khối Phụ lục ở màn Chi tiết Hợp đồng |
| **Điều kiện tiên quyết** | Đã đăng nhập hệ thống; Hợp đồng tồn tại và không ở "Đã hủy" (BR-CTV-17); nhà thầu không ở "Dừng hợp tác" (BR-CTV-21) |
| **Luồng cơ bản** | 1\. Bấm "Thêm phụ lục" tại khối Phụ lục hợp đồng.  2\. Hệ thống mở popup Thêm phụ lục  3\. Điền thông tin và upload file. 4\. Bấm "Lưu".  5\. Hệ thống sinh Mã phụ lục, thêm vào danh sách, ghi lịch sử thao tác, làm mới màn Chi tiết. |
| **Luồng ngoại lệ** | 3a. Thiếu Tên phụ lục hoặc chưa upload file — chặn lưu, báo lỗi. 3b. File sai định dạng hoặc vượt kích thước — chặn lưu, báo lỗi.  4a. Lỗi hệ thống khi lưu — báo lỗi, cho thử lại. |
| **Hậu điều kiện Thành công** | Phụ lục được thêm vào danh sách; sinh Mã theo format PLVYYMM-XXX; file được lưu; lịch sử thao tác ghi chi tiết; trạng thái/hiệu lực hợp đồng không đổi. |
| **Hậu điều kiện Thất bại** | Danh sách phụ lục không thay đổi; hệ thống báo lỗi. |
| **Business Rule** | **BR-CTV-16 — Cơ chế quản lý phụ lục hợp đồng:** Mỗi phụ lục sinh Mã tự động theo format PLVYYMM-XXX (PLV \= Phụ lục Vendor cố định, YYMM \= 2 số cuối của năm \+ tháng hiện tại, XXX bắt đầu từ 001; VD: PLV2608-011). Mã không sửa được sau khi tạo.  **BR-CTV-21 — Khóa thao tác HĐ khi nhà thầu "Dừng hợp tác:** Khi nhà thầu "Dừng hợp tác", khóa toàn bộ thao tác trên mọi HĐ của nhà thầu: Upload, Gia hạn, Tái ký, Chỉnh sửa, Hủy, Dừng khai thác, Thêm/Sửa/Xóa phụ lục. Chỉ cho Xem (read-only) \+ tải file scan; nút thao tác bị ẩn (BR-CTV-17). Muốn thao tác lại phải kích hoạt lại nhà thầu (BR-VD-17) |
| **Yêu cầu phi chức năng** | Thời gian phản hồi \< 2 giây; lịch sử thao tác lưu vĩnh viễn phục vụ audit. |

##### **Use case 3.2: Sửa phụ lục hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-03.2 |
| **Tên use case** | Sửa phụ lục hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu chỉnh sửa thông tin một phụ lục đã có (Tên, Mô tả, File đính kèm). Mã phụ lục và Ngày bổ sung không đổi. Không ảnh hưởng trạng thái/hiệu lực hợp đồng. |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm icon "Sửa" trên một phụ lục tại khối Phụ lục ở màn Chi tiết Hợp đồng |
| **Điều kiện tiên quyết** | Đã đăng nhập; Hợp đồng không ở "Đã hủy" (BR-CTV-17); nhà thầu không ở "Dừng hợp tác" (BR-CTV-21); phụ lục tồn tại |
| **Luồng cơ bản** | 1\. Bấm icon "Sửa" trên một phụ lục.  2\. Hệ thống mở popup Chỉnh sửa  3\. Cập nhật Tên / Mô tả / File.  4\. Bấm "Lưu".  5\. Hệ thống cập nhật phụ lục, ghi lịch sử thao tác, làm mới danh sách. |
| **Luồng ngoại lệ** | 3a. Thiếu Tên phụ lục hoặc xóa hết file bắt buộc — chặn lưu, báo lỗi. 3b. File mới sai định dạng/vượt kích thước — chặn lưu, báo lỗi.  4a. Lỗi hệ thống khi lưu — báo lỗi, cho thử lại. |
| **Hậu điều kiện Thành công** | Phụ lục được cập nhật; file mới (nếu thay) được lưu; lịch sử thao tác ghi chi tiết; trạng thái/hiệu lực hợp đồng không đổi. |
| **Hậu điều kiện Thất bại** | Phụ lục giữ nguyên; hệ thống báo lỗi. |
| **Business Rule** | **BR-CTV-16 — Cơ chế quản lý phụ lục hợp đồng:** Mỗi phụ lục sinh Mã tự động theo format PLVYYMM-XXX (PLV \= Phụ lục Vendor cố định, YYMM \= 2 số cuối của năm \+ tháng hiện tại, XXX bắt đầu từ 001; VD: PLV2608-011). Mã không sửa được sau khi tạo. **BR-CTV-21 — Khóa thao tác HĐ khi nhà thầu "Dừng hợp tác:** Khi nhà thầu "Dừng hợp tác", khóa toàn bộ thao tác trên mọi HĐ của nhà thầu: Upload, Gia hạn, Tái ký, Chỉnh sửa, Hủy, Dừng khai thác, Thêm/Sửa/Xóa phụ lục. Chỉ cho Xem (read-only) \+ tải file scan; nút thao tác bị ẩn (BR-CTV-17). Muốn thao tác lại phải kích hoạt lại nhà thầu (BR-VD-17) |
| **Yêu cầu phi chức năng** | Thời gian phản hồi \< 2 giây |

##### **Use case 3.3: Xóa phụ lục hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-03.3 |
| **Tên use case** | Xóa phụ lục hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu xóa một phụ lục khỏi hợp đồng khi tài liệu sai/không còn cần. Không ảnh hưởng trạng thái/hiệu lực hợp đồng. |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm icon "Xóa" trên một phụ lục tại khối Phụ lục ở màn Chi tiết Hợp đồng |
| **Điều kiện tiên quyết** | Đã đăng nhập; Hợp đồng không ở "Đã hủy" (BR-CTV-17); nhà thầu không ở "Dừng hợp tác" (BR-CTV-21); phụ lục tồn tại |
| **Luồng cơ bản** | 1\. Mở màn Chi tiết Hợp đồng. 2\. Bấm icon "Xóa" trên một phụ lục. 3\. Hệ thống mở popup xác nhận (hiển thị Mã phụ lục \+ Tên). 4\. Xác nhận xóa. 5\. Hệ thống xóa phụ lục khỏi danh sách, ghi lịch sử thao tác, làm mới danh sách. |
| **Luồng ngoại lệ** | 4a. Hủy xác nhận — đóng popup, không xóa. 5a. Lỗi hệ thống khi xóa — báo lỗi, cho thử lại. |
| **Hậu điều kiện Thành công** | Phụ lục bị xóa khỏi danh sách; file liên quan được xóa; lịch sử thao tác ghi chi tiết; trạng thái/hiệu lực hợp đồng không đổi. |
| **Hậu điều kiện Thất bại** | Phụ lục vẫn còn; hệ thống báo lỗi. |
| **Business Rule** | **BR-CTV-16 — Cơ chế quản lý phụ lục hợp đồng:** Mỗi phụ lục sinh Mã tự động theo format PLVYYMM-XXX (PLV \= Phụ lục Vendor cố định, YYMM \= 2 số cuối của năm \+ tháng hiện tại, XXX bắt đầu từ 001; VD: PLV2608-011). Mã không sửa được sau khi tạo. **BR-CTV-21 — Khóa thao tác HĐ khi nhà thầu "Dừng hợp tác:** Khi nhà thầu "Dừng hợp tác", khóa toàn bộ thao tác trên mọi HĐ của nhà thầu: Upload, Gia hạn, Tái ký, Chỉnh sửa, Hủy, Dừng khai thác, Thêm/Sửa/Xóa phụ lục. Chỉ cho Xem (read-only) \+ tải file scan; nút thao tác bị ẩn (BR-CTV-17). Muốn thao tác lại phải kích hoạt lại nhà thầu (BR-VD-17) |
| **Yêu cầu phi chức năng** | Thời gian phản hồi \< 2 giây; lịch sử thao tác lưu vĩnh viễn phục vụ audit. |

##### **Use case 4: Chỉnh sửa hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-04 |
| **Tên use case** | Chỉnh sửa hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu chỉnh sửa thông tin hợp đồng nhà thầu  |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm nút "Chỉnh sửa hợp đồng" trên header màn Chi tiết Hợp đồng |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống Hợp đồng ở "Chưa hiệu lực" hoặc "Đang hiệu lực" |
| **Luồng cơ bản** | 1\. Quản lý nhà thầu bấm nút "Chỉnh sửa hợp đồng" 2\. Hệ thống mở form Chỉnh sửa với các trường sửa được 3\. Quản lý nhà thầu cập nhật các trường cần sửa  4\. Quản lý nhà thầu bấm "Lưu thông tin" 5\. Hệ thống ghi thay đổi, lưu lịch sử thao tác chi tiết (Thời gian, Người thao tác, Hành động, Nội dung) làm mới màn Chi tiết Hợp đồng |
| **Luồng ngoại lệ** | **4a. Thiếu trường bắt buộc hoặc sai định dạng dữ liệu** — Hệ thống chặn lưu và báo lỗi.  **4b. File scan mới sai định dạng hoặc vượt kích thước** — Hệ thống chặn và báo lỗi ngay khi upload.  **5a. Lỗi hệ thống khi lưu** — Hệ thống báo lỗi, cho phép thử lại. |
| **Luồng thay thế** | Không có |
| **Hậu điều kiện Thành công** | Các trường được chỉnh sửa cập nhật giá trị mới lịch sử thao tác thay đổi được ghi chi tiết, tên file cũ ghi trong log để truy vết |
| **Hậu điều kiện Thất bại** | Thông tin hợp đồng giữ nguyên Hệ thống hiển thị thông báo lỗi Giữ nguyên dữ liệu đã nhập trên form |
| **Business Rule** | **BR-CTV-13 — Cơ chế tự động chuyển trạng thái theo ngày:** Tác vụ tự động 0:00:  **(1)** HĐ "Chưa hiệu lực" → "Đang hiệu lực" nếu Ngày hiệu lực ≤ hôm nay → tự động kéo theo: nhà thầu "Tạo mới"/"Ngưng hoạt động" → "Đang hoạt động" (BR-VD-07);  **(2)** HĐ "Đang hiệu lực" → "Hết hiệu lực" nếu Ngày hết hạn \< hôm nay → tự động kéo theo: nếu nhà thầu không còn HĐ "Đang hiệu lực" → "Ngưng hoạt động" (BR-VD-16. Thứ tự 1 lần chạy: bước (1) → (2) → quét cảnh báo kỳ hạn (BR-CTV-06)   **BR-CTV-14 — Quy tắc chỉnh sửa hợp đồng sau upload:**  Phạm vi chỉnh sửa phụ thuộc trạng thái hợp đồng; chỉ áp dụng khi nhà thầu không ở "Dừng hợp tác"mọi thay đổi được ghi lịch sử thao tác. **Không được sửa ở mọi trạng thái:** Mã hợp đồng, Nhà thầu, Giá/Bảng giá mua (tham chiếu từ Giá mua đầu vào). **Khi hợp đồng "Chưa hiệu lực":** được sửa Tên hợp đồng, 3 trường ngày (ký / hiệu lực / hết hạn — thỏa BR-CTV-03), File scan, và phương thức gia hạn (cấu hình tự động/thủ công — BR-CTV-18). **Khi hợp đồng "Đang hiệu lực":** không được sửa Tên hợp đồng, 3 trường ngày và File scan; chỉ được cập nhật phương thức gia hạn (BR-CTV-18). Muốn đổi thời hạn → dùng Gia hạn; muốn thay toàn bộ → Hủy \+ Tái ký. **Khi hợp đồng "Hết hiệu lực" / "Dừng khai thác" / "Đã hủy":** không cho chỉnh sửa.  **BR-CTV-17 — Hiển thị nút thao tác theo trạng thái :**  Nút chỉ hiển thị khi thỏa đồng thời: (i) người dùng có quyền Quản lý nhà thầu; (ii) nhà thầu KHÔNG ở "Dừng hợp tác" — nếu Dừng hợp tác thì ẩn toàn bộ nút thao tác, chỉ còn Xem chi tiết / Tải file scan / Xem lịch sử (BR-CTV-21); (iii) hợp đồng thỏa điều kiện trạng thái riêng của từng nút bên dưới. Trạng thái không thỏa thì ẩn nút (không hiển thị mờ/disable). "HĐ mới nhất" \= hợp đồng có Ngày hiệu lực lớn nhất của nhà thầu. **Chỉnh sửa** (UC-CTV-04, BR-CTV-14): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Gia hạn** (UC-CTV-07, BR-CTV-08): hiển thị khi HĐ "Đang hiệu lực" hoặc "Hết hiệu lực", và là HĐ mới nhất của nhà thầu. **Tái ký** (UC-CTV-01, BR-CTV-09): hiển thị khi HĐ "Đang hiệu lực", "Hết hiệu lực", "Dừng khai thác" hoặc "Đã hủy", và là HĐ mới nhất của nhà thầu. **Hủy hợp đồng** (UC-CTV-05, BR-CTV-11): hiển thị khi HĐ "Chưa hiệu lực". **Dừng khai thác** (UC-CTV-06, BR-CTV-12): hiển thị khi HĐ "Đang hiệu lực". **Cấu hình tự động gia hạn** (UC-CTV-09, BR-CTV-18): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Thêm/Sửa/Xóa**(BR-CTV-16): hiển thị khi HĐ "Chưa hiệu lực", "Đang hiệu lực", "Hết hiệu lực" hoặc "Dừng khai thác"; ẩn khi "Đã hủy". **Tải file scan / Xem chi tiết / Xem lịch sử thao tác** (UC-CTV-02, UC-CTV-11): hiển thị ở mọi trạng thái, kể cả khi nhà thầu "Dừng hợp tác". **BR-CTV-21 — Khóa thao tác HĐ khi nhà thầu "Dừng hợp tác” :** Khi nhà thầu "Dừng hợp tác", khóa toàn bộ thao tác trên mọi HĐ của nhà thầu: Upload, Gia hạn, Tái ký, Chỉnh sửa, Hủy, Dừng khai thác, Thêm/Sửa/Xóa phụ lục. Chỉ cho Xem (read-only) \+ tải file scan; nút thao tác bị ẩn (BR-CTV-17). Muốn thao tác lại phải kích hoạt lại nhà thầu (BR-VD-17) |
| **Yêu cầu phi chức năng** | Thời gian phản hồi khi lưu \< 2 giây File scan cũ retention 90 ngày, tự động xóa sau đó |

##### **Use case 5: Hủy hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-05 |
| **Tên use case** | Hủy hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu hủy hợp đồng "Chưa hiệu lực" khi upload nhầm hoặc hủy hợp đồng trước khi có hiệu lực. Với hợp đồng đang chạy ("Đang hiệu lực"), dùng "Dừng khai thác" thay thế. Hệ thống không xóa vật lý bản ghi để bảo toàn dữ liệu và phục vụ audit. |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm nút "Hủy hợp đồng" trong Chi tiết hợp đồng |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống Hợp đồng ở trạng thái "Chưa hiệu lực" |
| **Luồng cơ bản** | 1\. Quản lý nhà thầu bấm "Hủy hợp đồng" 2\. Hệ thống mở popup xác nhận với ô nhập Lý do hủy 3\. Quản lý nhà thầu nhập lý do và bấm "Xác nhận hủy hợp đồng" 4\. Hệ thống chuyển trạng thái Hợp đồng thành "Đã hủy", lưu lý do và lưu lịch sử thao tác 5\. Hệ thống làm mới danh sách |
| **Luồng ngoại lệ** | **3a. Không nhập lý do** — Hệ thống chặn xác nhận.  |
| **Luồng thay thế** | Không có |
| **Hậu điều kiện Thành công** | Trạng thái Hợp đồng chuyển "Đã hủy" (không xóa DB) Lý do và thời điểm hủy được lưu Ô số liệu tổng quan được cập nhật lịch sử thao tác thao tác được ghi nhận |
| **Hậu điều kiện Thất bại** | Trạng thái Hợp đồng giữ nguyên Hệ thống hiển thị thông báo lỗi |
| **Business Rule** | **BR-CTV-11 — Điều kiện Hủy hợp đồng:** Chỉ được hủy khi Hợp đồng ở trạng thái "Chưa hiệu lực". Với hợp đồng đang chạy ("Đang hiệu lực"), dùng "Dừng khai thác" thay thế. Bắt buộc nhập lý do khi hủy **BR-CTV-17 — Hiển thị nút thao tác theo trạng thái:** Hệ thống chỉ hiển thị các nút mà người dùng có quyền và hợp đồng đang ở trạng thái cho phép thao tác đó tại thời điểm đó; nút không thỏa điều kiện thì ẩn.  **Chỉnh sửa** (UC-CTV-04, BR-CTV-14): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Gia hạn** (UC-CTV-07, BR-CTV-08): hiển thị khi HĐ "Đang hiệu lực" hoặc "Hết hiệu lực", và là HĐ mới nhất của nhà thầu. **Tái ký** (UC-CTV-01, BR-CTV-09): hiển thị khi HĐ "Đang hiệu lực", "Hết hiệu lực", "Dừng khai thác" hoặc "Đã hủy", và là HĐ mới nhất của nhà thầu. **Hủy hợp đồng** (UC-CTV-05, BR-CTV-11): hiển thị khi HĐ "Chưa hiệu lực". **Dừng khai thác** (UC-CTV-06, BR-CTV-12): hiển thị khi HĐ "Đang hiệu lực". **Cấu hình tự động gia hạn** (UC-CTV-09, BR-CTV-18): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Thêm / Quản lý phụ lục** (BR-CTV-16): hiển thị khi HĐ "Chưa hiệu lực", "Đang hiệu lực", "Hết hiệu lực" hoặc "Dừng khai thác"; ẩn khi "Đã hủy". **Tải file scan / Xem chi tiết / Xem lịch sử** (UC-CTV-02, UC-CTV-11): hiển thị ở mọi trạng thái, kể cả khi nhà thầu "Dừng hợp tác". **BR-CTV-20 — Hiệu lực Bảng giá mua theo HĐ & trạng thái nhà thầu:** Mỗi bảng giá mua gắn đúng 1 hợp đồng. Hiệu lực của bảng giá phụ thuộc đồng thời trạng thái hợp đồng gắn với nó và trạng thái nhà thầu; hệ thống tự cập nhật bảng giá khi một trong hai thay đổi: Hợp đồng gắn bảng giá chuyển **"Đang hiệu lực"** (và nhà thầu "Đang hoạt động") → bảng giá có hiệu lực, được dùng để tính giá vốn/phân bổ. Hợp đồng chuyển **"Hết hiệu lực"** (quá hạn) → bảng giá tạm ngưng hiệu lực; nếu hợp đồng được Gia hạn về "Đang hiệu lực" → bảng giá có hiệu lực trở lại. Hợp đồng chuyển **"Dừng khai thác"** hoặc **"Đã hủy"** → bảng giá hết hiệu lực vĩnh viễn. Nhà thầu chuyển **"Dừng hợp tác"** (thủ công) → toàn bộ bảng giá của nhà thầu hết hiệu lực vĩnh viễn (theo luồng Dừng hợp tác tại BR-VD-06). Ràng buộc: khoảng hiệu lực bảng giá nằm trong thời hạn hợp đồng (Ngày hiệu lực bảng giá ≥ Ngày hiệu lực HĐ; Ngày hết hạn ≤ Ngày hết hạn HĐ). **BR-CTV-21 — Khóa thao tác HĐ khi nhà thầu "Dừng hợp tác :** Khi nhà thầu "Dừng hợp tác", khóa toàn bộ thao tác trên mọi HĐ của nhà thầu: Upload, Gia hạn, Tái ký, Chỉnh sửa, Hủy, Dừng khai thác, Thêm/Sửa/Xóa phụ lục. Chỉ cho Xem (read-only) \+ tải file scan; nút thao tác bị ẩn (BR-CTV-17). Muốn thao tác lại phải kích hoạt lại nhà thầu (BR-VD-17) |
| **Yêu cầu phi chức năng** | Thời gian phản hồi \< 2 giây |

##### **Use case 6: Dừng khai thác hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-06 |
| **Tên use case** | Dừng khai thác hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu dừng khai thác hợp đồng đang trong thời hạn khi nhà thầu vi phạm điều khoản, có lý do đặc biệt, hoặc bị thay thế bởi Hợp đồng tái ký. Khác với "Hủy" (chỉ áp dụng cho HĐ chưa hiệu lực), "Dừng khai thác" áp dụng cho HĐ "Đang hiệu lực". |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm nút "Dừng khai thác hợp đồng" trong Chi tiết hợp đồng |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống Hợp đồng đang ở trạng thái "Đang hiệu lực" |
| **Luồng cơ bản** | 1\. Quản lý nhà thầu bấm "Dừng khai thác hợp đồng" 2\. Hệ thống mở popup xác nhận với ô nhập Lý do dừng khai thác 3\. Quản lý nhà thầu nhập lý do và bấm "Xác nhận dừng khai thác" 4\. Hệ thống chuyển trạng thái Hợp đồng thành "Dừng khai thác", lưu lý do và lưu lịch sử thao tác 5\. Hệ thống làm mới danh sách |
| **Luồng ngoại lệ** | **3a. Không nhập lý do** — Hệ thống chặn xác nhận.  |
| **Luồng thay thế** |  |
| **Hậu điều kiện Thành công** | Trạng thái Hợp đồng chuyển "Dừng khai thác" (không xóa DB) Lý do và thời điểm dừng được lưu Ô số liệu tổng quan được cập nhật lịch sử thao tác thao tác được ghi nhận |
| **Hậu điều kiện Thất bại** | Trạng thái Hợp đồng giữ nguyên Hệ thống hiển thị thông báo lỗi |
| **Business Rule** | **BR-CTV-09 — Cơ chế tái ký hợp đồng:** **Điều kiện tiên quyết: nhà thầu KHÔNG ở "Dừng hợp tác"** (phải kích hoạt lại trước — BR-CTV-21). Áp dụng cho **HĐ mới nhất** ở "Đang hiệu lực"/"Hết hiệu lực"/"Dừng khai thác"/"Đã hủy". Tạo HĐ mới độc lập (mã mới, file scan mới), Ngày hiệu lực HĐ mới \> Ngày hiệu lực HĐ trước. Xử lý HĐ cũ: **"Đang hiệu lực" → buộc "Dừng khai thác"** (lý do "Được thay thế bởi HĐ tái ký \[Mã\]"); **"Hết hiệu lực"/"Dừng khai thác"/"Đã hủy" → giữ nguyên**. Popup có ô upload phụ lục tùy chọn → tự tạo bản ghi phụ lục gắn HĐ mới.   **BR-CTV-12 — Điều kiện Dừng khai thác:** Chỉ khi HĐ "Đang hiệu lực". Kích hoạt bởi: (1) thủ công (lý do); (2) tái ký HĐ đang hiệu lực (BR-CTV-09); (3) nhà thầu Dừng hợp tác (BR-VD-06). Mọi trường hợp: HĐ → "Dừng khai thác" ⟹ Bảng giá mua → "Hết hiệu lực" (BR-CTV-20).  **BR-CTV-13 — Cơ chế tự động chuyển trạng thái theo ngày:** Hệ thống tự động cập nhật trạng thái hợp đồng hằng ngày qua tác vụ tự động chạy 0:00. Cơ chế xử lý: (1) quét toàn bộ HĐ "Chưa hiệu lực", chuyển sang "Đang hiệu lực" nếu Ngày hiệu lực ≤ ngày hôm nay; (2) quét toàn bộ HĐ "Đang hiệu lực", chuyển sang "Hết hiệu lực" nếu Ngày hết hạn \< ngày hôm nay. Tác vụ tự động phải đảm bảo tính toàn vẹn (chạy lại không làm sai trạng thái)  **BR-CTV-17 — Hiển thị nút thao tác theo trạng thái:**  Hệ thống chỉ hiển thị các nút mà người dùng có quyền và hợp đồng đang ở trạng thái cho phép thao tác đó tại thời điểm đó; nút không thỏa điều kiện thì ẩn. **Chỉnh sửa** (UC-CTV-04, BR-CTV-14): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Gia hạn** (UC-CTV-07, BR-CTV-08): hiển thị khi HĐ "Đang hiệu lực" hoặc "Hết hiệu lực", và là HĐ mới nhất của nhà thầu. **Tái ký** (UC-CTV-01, BR-CTV-09): hiển thị khi HĐ "Đang hiệu lực", "Hết hiệu lực", "Dừng khai thác" hoặc "Đã hủy", và là HĐ mới nhất của nhà thầu. **Hủy hợp đồng** (UC-CTV-05, BR-CTV-11): hiển thị khi HĐ "Chưa hiệu lực". **Dừng khai thác** (UC-CTV-06, BR-CTV-12): hiển thị khi HĐ "Đang hiệu lực". **Cấu hình tự động gia hạn** (UC-CTV-09, BR-CTV-18): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Thêm phụ lục** (UC-CTV-03.1, BR-CTV-16): hiển thị khi HĐ "Chưa hiệu lực", "Đang hiệu lực", "Hết hiệu lực" hoặc "Dừng khai thác"; ẩn khi "Đã hủy". **Tải file scan / Xem chi tiết / Xem lịch sử** (UC-CTV-02, UC-CTV-11): hiển thị ở mọi trạng thái, kể cả khi nhà thầu "Dừng hợp tác". **BR-CTV-20 — Hiệu lực Bảng giá mua theo HĐ & trạng thái nhà thầu:** Mỗi bảng giá mua gắn đúng 1 hợp đồng. Hiệu lực của bảng giá phụ thuộc đồng thời trạng thái hợp đồng gắn với nó và trạng thái nhà thầu; hệ thống tự cập nhật bảng giá khi một trong hai thay đổi: Hợp đồng gắn bảng giá chuyển **"Đang hiệu lực"** (và nhà thầu "Đang hoạt động") → bảng giá có hiệu lực, được dùng để tính giá vốn/phân bổ. Hợp đồng chuyển **"Hết hiệu lực"** (quá hạn) → bảng giá tạm ngưng hiệu lực; nếu hợp đồng được Gia hạn về "Đang hiệu lực" → bảng giá có hiệu lực trở lại. Hợp đồng chuyển **"Dừng khai thác"** hoặc **"Đã hủy"** → bảng giá hết hiệu lực vĩnh viễn. Nhà thầu chuyển **"Dừng hợp tác"** (thủ công) → toàn bộ bảng giá của nhà thầu hết hiệu lực vĩnh viễn (theo luồng Dừng hợp tác tại BR-VD-06). Ràng buộc: khoảng hiệu lực bảng giá nằm trong thời hạn hợp đồng (Ngày hiệu lực bảng giá ≥ Ngày hiệu lực HĐ; Ngày hết hạn ≤ Ngày hết hạn HĐ). **BR-CTV-21 — Khóa thao tác HĐ khi nhà thầu "Dừng hợp tác :** Khi nhà thầu "Dừng hợp tác", khóa toàn bộ thao tác trên mọi HĐ của nhà thầu: Upload, Gia hạn, Tái ký, Chỉnh sửa, Hủy, Dừng khai thác, Thêm/Sửa/Xóa phụ lục. Chỉ cho Xem (read-only) \+ tải file scan; nút thao tác bị ẩn (BR-CTV-17). Muốn thao tác lại phải kích hoạt lại nhà thầu (BR-VD-17) |
| **Yêu cầu phi chức năng** | Thời gian phản hồi \< 2 giây |

##### 

##### **Use case 7: Gia hạn hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-07 |
| **Tên use case** | Gia hạn hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu kéo dài thời hạn hiệu lực của hợp đồng nhà thầu bằng cách chọn nhanh thời hạn gia hạn (3/6/12/24 tháng) hoặc chọn Ngày hết hạn mới thủ công, kèm đính kèm phụ lục gia hạn (nếu có). Áp dụng cho hợp đồng "Đang hiệu lực" (gia hạn sớm) hoặc "Hết hiệu lực" (gia hạn muộn). Giữ nguyên bản ghi Hợp đồng và mã Hợp đồng, lưu lịch sử thao tác gia hạn để truy vết. |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm nút "Gia hạn" trong Chi tiết hợp đồng |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống Hợp đồng ở trạng thái "Đang hiệu lực" hoặc "Hết hiệu lực" |
| **Luồng cơ bản** | 1\. Quản lý nhà thầu bấm "Gia hạn" trên một hợp đồng 2\. Hệ thống mở popup Gia hạn hiển thị: Ngày hết hạn hiện tại (chỉ đọc), nhóm nút chọn nhanh thời hạn (3/6/12/24 tháng), Ngày hết hạn mới (date picker), Ghi chú, Upload file phụ lục (tùy chọn) 3\. Quản lý nhà thầu chọn thời hạn gia hạn theo 1 trong 2 cách: (a) bấm nút chọn nhanh (3/6/12/24 tháng) → hệ thống tự tính và điền Ngày hết hạn mới vào date picker, nút được chọn hiển thị highlight; (b) tự chọn ngày cụ thể trên date picker 4\. Quản lý nhà thầu bấm "Xác nhận gia hạn" 5\. Hệ thống cập nhật Ngày hết hạn mới, chuyển hợp đồng về "Đang hiệu lực" (nếu đang "Hết hiệu lực") và gỡ badge cảnh báo kỳ hạn (nếu có).  6\. Hệ thống lưu lịch sử thao tác gia hạn và làm mới danh sách |
| **Luồng ngoại lệ** | **3a. Bấm nút chọn nhanh nhưng HĐ không có Ngày hết hạn hợp lệ để tính** — Hệ thống không điền ngày tự động, cho phép user chọn ngày thủ công. **4a. Ngày hết hạn mới ≤ Ngày hết hạn cũ (hoặc ≤ hôm nay đối với HĐ đã hết hiệu lực)** — Hệ thống chặn lưu và báo lỗi tại trường Ngày hết hạn mới.  **4b. File phụ lục sai định dạng hoặc vượt kích thước** — Hệ thống chặn lưu và báo lỗi tại trường upload.  **5a. Lỗi hệ thống khi lưu** — Hệ thống báo lỗi, cho phép thử lại.  |
| **Luồng thay thế** | **3b. Sau khi bấm nút chọn nhanh, user sửa tay Ngày hết hạn mới trên date picker** — Hệ thống bỏ highlight nút chọn nhanh (vì ngày không còn khớp preset), giữ giá trị ngày user vừa sửa. |
| **Hậu điều kiện Thành công** | Ngày hết hạn của Hợp đồng được cập nhật Hợp đồng ở trạng thái "Đang hiệu lực" Nếu có file phụ lục: bản ghi Phụ lục hợp đồng được tạo tự động, hiển thị trong danh sách Phụ lục của HĐ lịch sử thao tác gia hạn được ghi nhận |
| **Hậu điều kiện Thất bại** | Ngày hết hạn Hợp đồng không thay đổi Hệ thống hiển thị thông báo lỗi |
| **Business Rule** | **BR-CTV-08 — Cơ chế gia hạn** Chỉ áp dụng cho **HĐ mới nhất của nhà thầu** (Ngày hiệu lực lớn nhất) khi ở "Đang hiệu lực" (gia hạn sớm) hoặc "Hết hiệu lực" (gia hạn muộn). Không cho HĐ không phải mới nhất, hoặc "Dừng khai thác"/"Đã hủy". 2 cách chọn Ngày hết hạn mới: nút nhanh 3/6/12/24 tháng (Đang hiệu lực cộng từ Ngày hết hạn; Hết hiệu lực cộng từ hôm nay) hoặc date picker. Ngày hết hạn mới \> Ngày hết hạn cũ và \> hôm nay. Cập nhật trực tiếp Ngày hết hạn, mã HĐ không đổi, gia hạn nhiều lần được. Gia hạn HĐ "Hết hiệu lực" → về "Đang hiệu lực" → nhà thầu Tự động "Đang hoạt động" (BR-VD-07). **BR-CTV-06 — Cảnh báo kỳ hạn tự động**  Hệ thống tự động quét các hợp đồng "Đang hiệu lực" hằng ngày (tác vụ tự động chạy 0:00, sau BR-CTV-13), tính số ngày còn lại đến Ngày hết hạn và phân loại 3 mức cảnh báo: Khẩn cấp (đỏ, còn ≤ 7 ngày), Lưu ý (cam, còn 8–30 ngày), Theo dõi (vàng, còn 31–60 ngày). Hệ thống gắn badge cảnh báo cho từng hợp đồng và cập nhật section Giám sát kỳ hạn. Trạng thái hợp đồng không thay đổi. **BR-CTV-14 — Quy tắc chỉnh sửa hợp đồng sau upload:** Phạm vi chỉnh sửa phụ thuộc trạng thái hợp đồng; chỉ áp dụng khi nhà thầu không ở "Dừng hợp tác"; mọi thay đổi được ghi lịch sử thao tác. **Không được sửa ở mọi trạng thái:** Mã hợp đồng, Nhà thầu, Giá/Bảng giá mua (tham chiếu từ Giá mua đầu vào). **Khi hợp đồng "Chưa hiệu lực":** được sửa Tên hợp đồng, 3 trường ngày (ký / hiệu lực / hết hạn — thỏa BR-CTV-03), File scan, và phương thức gia hạn (cấu hình tự động/thủ công — BR-CTV-18). **Khi hợp đồng "Đang hiệu lực":** không được sửa Tên hợp đồng, 3 trường ngày và File scan; chỉ được cập nhật phương thức gia hạn (BR-CTV-18). Muốn đổi thời hạn → dùng Gia hạn; muốn thay toàn bộ → Hủy \+ Tái ký. **Khi hợp đồng "Hết hiệu lực" / "Dừng khai thác" / "Đã hủy":** không cho chỉnh sửa.  **BR-CTV-20 — Hiệu lực Bảng giá mua theo HĐ & trạng thái nhà thầu:** Mỗi bảng giá mua gắn đúng 1 hợp đồng. Hiệu lực của bảng giá phụ thuộc đồng thời trạng thái hợp đồng gắn với nó và trạng thái nhà thầu; hệ thống tự cập nhật bảng giá khi một trong hai thay đổi: Hợp đồng gắn bảng giá chuyển **"Đang hiệu lực"** (và nhà thầu "Đang hoạt động") → bảng giá có hiệu lực, được dùng để tính giá vốn/phân bổ. Hợp đồng chuyển **"Hết hiệu lực"** (quá hạn) → bảng giá tạm ngưng hiệu lực; nếu hợp đồng được Gia hạn về "Đang hiệu lực" → bảng giá có hiệu lực trở lại. Hợp đồng chuyển **"Dừng khai thác"** hoặc **"Đã hủy"** → bảng giá hết hiệu lực vĩnh viễn. Nhà thầu chuyển **"Dừng hợp tác"** (thủ công) → toàn bộ bảng giá của nhà thầu hết hiệu lực vĩnh viễn (theo luồng Dừng hợp tác tại BR-VD-06). Ràng buộc: khoảng hiệu lực bảng giá nằm trong thời hạn hợp đồng (Ngày hiệu lực bảng giá ≥ Ngày hiệu lực HĐ; Ngày hết hạn ≤ Ngày hết hạn HĐ). **BR-CTV-17 — Hiển thị nút thao tác theo trạng thái :**  Nút chỉ hiển thị khi thỏa đồng thời: (i) người dùng có quyền Quản lý nhà thầu; (ii) nhà thầu KHÔNG ở "Dừng hợp tác" — nếu Dừng hợp tác thì ẩn toàn bộ nút thao tác, chỉ còn Xem chi tiết / Tải file scan / Xem lịch sử (BR-CTV-21); (iii) hợp đồng thỏa điều kiện trạng thái riêng của từng nút bên dưới. Trạng thái không thỏa thì ẩn nút (không hiển thị mờ/disable). "HĐ mới nhất" \= hợp đồng có Ngày hiệu lực lớn nhất của nhà thầu. **Chỉnh sửa** (UC-CTV-04, BR-CTV-14): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Gia hạn** (UC-CTV-07, BR-CTV-08): hiển thị khi HĐ "Đang hiệu lực" hoặc "Hết hiệu lực", và là HĐ mới nhất của nhà thầu. **Tái ký** (UC-CTV-01, BR-CTV-09): hiển thị khi HĐ "Đang hiệu lực", "Hết hiệu lực", "Dừng khai thác" hoặc "Đã hủy", và là HĐ mới nhất của nhà thầu. **Hủy hợp đồng** (UC-CTV-05, BR-CTV-11): hiển thị khi HĐ "Chưa hiệu lực". **Dừng khai thác** (UC-CTV-06, BR-CTV-12): hiển thị khi HĐ "Đang hiệu lực". **Cấu hình tự động gia hạn** (UC-CTV-09, BR-CTV-18): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Thêm phụ lục** (UC-CTV-03.1, BR-CTV-16): hiển thị khi HĐ "Chưa hiệu lực", "Đang hiệu lực", "Hết hiệu lực" hoặc "Dừng khai thác"; ẩn khi "Đã hủy". **Tải file scan / Xem chi tiết / Xem lịch sử** (UC-CTV-02, UC-CTV-11): hiển thị ở mọi trạng thái, kể cả khi nhà thầu "Dừng hợp tác". |
| **Yêu cầu phi chức năng** | Thời gian gia hạn \< 3 giây |

##### **Use case 9: Quản lý tự động gia hạn hợp đồng**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-09 |
| **Tên use case** | Quản lý tự động gia hạn hợp đồng |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu bật, tắt hoặc điều chỉnh cấu hình tự động gia hạn của một hợp đồng nhà thầu (chu kỳ gia hạn). Tự động gia hạn chỉ áp dụng cho HĐ có điều khoản tự động gia hạn (evergreen) với nhà thầu. Khi bật, hệ thống sẽ tự động kéo dài thời hạn hợp đồng theo chu kỳ cấu hình mỗi khi đến ngày hết hạn , có gửi thông báo cảnh báo trước và xác nhận sau. User có thể tắt tự động gia hạn bất kỳ lúc nào để giành lại quyền kiểm soát thủ công.  |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu bấm nút "Tắt tự động gia hạn" / "Bật lại tự động gia hạn" trên khối Tự động gia hạn tại màn Chi tiết Hợp đồng; hoặc bấm vào notification cảnh báo trước để tắt nhanh |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống Hợp đồng ở trạng thái "Đang hiệu lực" hoặc "Chưa hiệu lực" (HĐ đã Hết hiệu lực / Dừng khai thác / Đã hủy không cấu hình Tự động gia hạn) |
| **Luồng cơ bản** | 1\. Quản lý nhà thầu mở màn Chi tiết Hợp đồng 2\. Quản lý nhà thầu xem khối "Tự động gia hạn" (hiển thị trạng thái Bật/Tắt, chu kỳ, ngày gia hạn kế tiếp) 3\. Quản lý nhà thầu bấm "Tắt tự động gia hạn" 4\. Hệ thống mở popup xác nhận "Bạn có chắc chắn muốn tắt tự động gia hạn cho HĐ \[Mã HĐ\]? Hợp đồng sẽ không tự động kéo dài khi đến hạn." 5\. Quản lý nhà thầu bấm "Xác nhận" 6\. Hệ thống tắt cấu hình Tự động gia hạn, lưu lịch sử thao tác (user/thời điểm) và làm mới khối Tự động gia hạn |
| **Luồng ngoại lệ** | **5a. Lỗi hệ thống khi cập nhật** — Hệ thống báo lỗi, cho phép thử lại. |
| **Luồng thay thế** | **3a. Bật lại tự động gia hạn** — Nếu Tự động gia hạn đang tắt, Quản lý nhà thầu bấm "Bật lại tự động gia hạn" → Hệ thống mở popup cấu hình (Chu kỳ gia hạn) → user điền và Xác nhận → Hệ thống bật lại và lưu lịch sử thao tác.  **3b. Sửa cấu hình Tự động gia hạn (khi đang bật)** — Quản lý nhà thầu bấm "Chỉnh sửa cấu hình" → Hệ thống mở popup cho sửa Chu kỳ → user cập nhật và Xác nhận → Hệ thống lưu cấu hình mới và lưu lịch sử thao tác.  **3c. Tắt nhanh từ notification cảnh báo trước** — Quản lý nhà thầu bấm nút "Tắt tự động gia hạn" ngay trong notification → Hệ thống mở popup xác nhận (bước 4).  |
| **Hậu điều kiện Thành công** | Cấu hình Tự động gia hạn được cập nhật (bật/tắt/sửa) theo thao tác của user Nếu tắt: HĐ không còn tự động gia hạn khi đến hạn, giữ nguyên hiệu lực hiện tại Nếu bật lại/sửa: cấu hình mới (chu kỳ) được lưu, áp dụng cho lần gia hạn kế tiếp lịch sử thao tác thao tác được ghi nhận  |
| **Hậu điều kiện Thất bại** | Cấu hình Tự động gia hạn giữ nguyên Hệ thống hiển thị thông báo lỗi |
| **Business Rule** | **BR-CTV-18 — Cơ chế tự động gia hạn** Tự động gia hạn chỉ áp dụng cho HĐ có điều khoản tự động gia hạn (evergreen) với nhà thầu. Cấu hình gồm: **(1) Bật/tắt** (mặc định tắt); **(2) Chu kỳ gia hạn** (chọn 3 / 6 / 12 / 24 tháng). Cấu hình có thể thiết lập khi Upload HĐ (UC-CTV-01) hoặc chỉnh sửa sau qua UC-CTV-09. Chỉ cấu hình được Tự động gia hạn khi HĐ ở "Chưa hiệu lực" hoặc "Đang hiệu lực". Khi bật, hệ thống tự động gia hạn theo chu kỳ mỗi khi đến hạn cho đến khi user tắt thủ công. User có thể tắt Tự động gia hạn bất kỳ lúc nào để giành lại kiểm soát thủ công. Mọi thay đổi cấu hình được lưu lịch sử thao tác. Nếu user gia hạn thủ công khi Tự động gia hạn đang bật, Ngày hết hạn mới được cập nhật và lần Tự động gia hạn kế tiếp tính từ Ngày hết hạn mới này. **BR-CTV-14 — Quy tắc chỉnh sửa hợp đồng sau upload:** Phạm vi chỉnh sửa phụ thuộc trạng thái hợp đồng; chỉ áp dụng khi nhà thầu không ở "Dừng hợp tác"; mọi thay đổi được ghi lịch sử thao tác. **Không được sửa ở mọi trạng thái:** Mã hợp đồng, Nhà thầu, Giá/Bảng giá mua (tham chiếu từ Giá mua đầu vào). **Khi hợp đồng "Chưa hiệu lực":** được sửa Tên hợp đồng, 3 trường ngày (ký / hiệu lực / hết hạn — thỏa BR-CTV-03), File scan, và phương thức gia hạn (cấu hình tự động/thủ công — BR-CTV-18). **Khi hợp đồng "Đang hiệu lực":** không được sửa Tên hợp đồng, 3 trường ngày và File scan; chỉ được cập nhật phương thức gia hạn (BR-CTV-18). Muốn đổi thời hạn → dùng Gia hạn; muốn thay toàn bộ → Hủy \+ Tái ký. **Khi hợp đồng "Hết hiệu lực" / "Dừng khai thác" / "Đã hủy":** không cho chỉnh sửa.  **BR-CTV-19 — Cơ chế tự động gia hạn theo tác vụ tự động** Hệ thống chạy tác vụ tự động hằng ngày quét các HĐ "Đang hiệu lực" có bật Tự động gia hạn. **Cơ chế xử lý**: (1) Trước ngày hết hạn 7 ngày → gửi notification cảnh báo trước cho Quản lý nhà thầu (kèm nút tắt nhanh); (2) Đến ngày hết hạn, nếu Tự động gia hạn vẫn bật → hệ thống cộng thêm chu kỳ cấu hình vào Ngày hết hạn, lưu lịch sử thao tác "Tự động gia hạn từ \[ngày cũ\] → \[ngày mới\]", gửi notification xác nhận sau. Tự động gia hạn **không tự tạo file phụ lục** (chỉ cập nhật Ngày hết hạn \+ lưu lịch sử thao tác) — nếu cần phụ lục pháp lý, user tự thêm qua. Tự động gia hạn tự dừng nếu HĐ bị Dừng khai thác/Hủy giữa chừng, hoặc khi user tắt thủ công.  |
| **Yêu cầu phi chức năng** | Thời gian phản hồi \< 2 giây  |

##### **Use case 10: Tìm kiếm/lọc hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-10 |
| **Tên use case** | Tìm kiếm/lọc hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu tìm kiếm theo từ khóa và lọc danh sách hợp đồng nhà thầu theo nhiều tiêu chí để nhanh chóng tìm được hợp đồng cần xem hoặc xử lý. Là hành vi tùy chọn, mở rộng («extend») cho UC Xem hợp đồng nhà thầu (UC-CTV-02) và UC Xuất danh sách hợp đồng nhà thầu (UC-CTV-11) — chỉ kích hoạt khi người dùng chủ động tìm kiếm/lọc. |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Người dùng nhập từ khóa vào ô tìm kiếm hoặc chọn tiêu chí trong panel Bộ lọc trên màn Quản lý Hợp đồng Nhà thầu |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống |
| **Luồng cơ bản** | 1\. Người dùng nhập từ khóa (Mã hợp đồng, Tên nhà thầu, Mã số thuế) và/hoặc chọn tiêu chí lọc (Trạng thái hợp đồng, khoảng Ngày ký / Ngày hết hạn, mức cảnh báo kỳ hạn) 2\. Hệ thống trả về danh sách hợp đồng khớp điều kiện, sắp xếp theo Ngày ký mới nhất trước |
| **Luồng ngoại lệ** | 2a. Không có kết quả khớp — Hệ thống hiển thị màn hình không có dữ liệu "Không tìm thấy hợp đồng phù hợp". |
| **Luồng thay thế** | 1a. Xóa bộ lọc — Người dùng bấm "Đặt lại" → Hệ thống trả về danh sách mặc định. |
| **Hậu điều kiện Thành công** | Danh sách hợp đồng hiển thị đúng theo tiêu chí tìm kiếm/lọc |
| **Hậu điều kiện Thất bại** | Hệ thống hiển thị màn hình không có dữ liệu |
| **Business Rule** | **BR-CTV-07 — Ngưỡng cảnh báo kỳ hạn** Cảnh báo kỳ hạn theo 3 mức dựa trên số ngày còn lại đến ngày hết hạn: Khẩn cấp ≤ 7 ngày (đỏ), Lưu ý 8–30 ngày (cam), Theo dõi 31–60 ngày (vàng) Gia hạn áp dụng cho HĐ "Đang hiệu lực" (gia hạn sớm) hoặc "Hết hiệu lực" (gia hạn muộn). Popup Gia hạn cung cấp 2 cách chọn Ngày hết hạn mới: (1) nút chọn nhanh thời hạn (3 / 6 / 12 / 24 tháng) — hệ thống tự tính Ngày hết hạn mới; (2) chọn ngày cụ thể trên date picker. Mốc tính khi dùng nút chọn nhanh: với HĐ "Đang hiệu lực" cộng thời hạn từ Ngày hết hạn; với HĐ "Hết hiệu lực" cộng thời hạn từ ngày hôm nay. Nếu user sửa tay date picker sau khi đã chọn nhanh, hệ thống bỏ highlight nút preset. Dù chọn cách nào, Ngày hết hạn mới phải lớn hơn Ngày hết hạn cũ và lớn hơn ngày hiện tại. Hệ thống cập nhật trực tiếp trường Ngày hết hạn của Hợp đồng, mã Hợp đồng không đổi. Có thể gia hạn nhiều lần. |
| **Yêu cầu phi chức năng** | Thời gian trả kết quả tìm kiếm \< 2 giây với 10.000 bản ghi |

##### **Use case 11: Xem lịch sử thao tác hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-11 |
| **Tên use case** | Xem lịch sử thao tác hợp đồng nhà thầu |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu xem lại toàn bộ lịch sử thao tác trên một hợp đồng nhà thầu (upload, gia hạn, tái ký, hủy, dừng khai thác, chỉnh sửa, quản lý phụ lục, cấu hình tự động gia hạn, thao tác tự động của hệ thống) để truy vết và phục vụ audit. |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Người dùng mở khối "Lịch sử thao tác" trên màn Chi tiết Hợp đồng Nhà thầu |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống |
| **Luồng cơ bản** | 1\. Người dùng mở màn Chi tiết Hợp đồng Nhà thầu 2\. Người dùng bấm mở khối "Lịch sử thao tác" 3\. Hệ thống hiển thị danh sách bản lưu lịch sử thao tác (mới nhất trước): thời điểm, người thực hiện (hoặc "Hệ thống"), loại thao tác, chi tiết thay đổi (giá trị cũ → mới), lý do (nếu có) 4\. Người dùng có thể lọc theo loại thao tác hoặc phân trang để xem thêm |
| **Luồng ngoại lệ** | 3a. Lỗi tải dữ liệu lịch sử — Hệ thống báo lỗi.  |
| **Luồng thay thế** | Không có |
| **Hậu điều kiện Thành công** | Người dùng xem được lịch sử thao tác của hợp đồng theo thứ tự thời gian |
| **Hậu điều kiện Thất bại** | Hệ thống hiển thị thông báo lỗi tải dữ liệu |
| **Business Rule** |  |
| **Yêu cầu phi chức năng** | Thời gian tải khối lịch sử \< 2 giây  |

##### **Use case 12: Xem danh sách hợp đồng nhà thầu**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-CTV-12 |
| **Tên use case** | Xem danh sách hợp đồng nhà thầu  |
| **Module liên quan** | Module Quản lý Hợp đồng Nhà thầu |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Cho phép Quản lý nhà thầu xem toàn bộ hợp đồng nhà thầu dưới dạng danh sách, kèm các ô số liệu tổng quan (mức cảnh báo kỳ hạn và cơ cấu theo trạng thái) và badge trực quan, làm điểm vào cho các thao tác chi tiết, thêm hợp đồng, tìm kiếm/lọc và tải file.  |
| **Actor** | Quản lý nhà thầu |
| **Trigger** | Quản lý nhà thầu mở màn hình Danh sách hợp đồng nhà thầu từ menu điều hướng.  |
| **Điều kiện tiên quyết** | Quản lý nhà thầu đã đăng nhập hệ thống và có quyền truy cập module Quản lý Hợp đồng Nhà thầu.  |
| **Luồng cơ bản** | 1\. Quản lý nhà thầu mở màn Danh sách hợp đồng nhà thầu. 2\. Hệ thống hiển thị các ô số liệu tổng quan 3\. Hệ thống hiển thị bảng danh sách, mỗi dòng gồm: Mã hợp đồng, Nhà thầu (Tên \+ Mã VDR), Ngày ký, Ngày hiệu lực, Ngày hết hạn, Trạng thái (badge), nút tải file scan. 4\. Danh sách mặc định sắp xếp theo Ngày hết hạn gần nhất (hoặc Ngày tạo mới nhất), phân trang theo số dòng/trang đã chọn. 5\. Quản lý nhà thầu có thể bấm Mã hợp đồng để mở Chi tiết (UC-CTV-02), dùng ô tìm kiếm/bộ lọc (UC-CTV-10), bấm "Thêm hợp đồng" (UC-CTV-01 / UC-CTV-01) hoặc tải file scan. |
| **Luồng ngoại lệ** | **3a.** Lỗi tải dữ liệu — Hiển thị thông báo lỗi và nút thử lại.  |
| **Luồng thay thế** | Không có |
| **Hậu điều kiện Thành công** | Danh sách hợp đồng và các ô số liệu hiển thị đúng dữ liệu hiện tại; badge trạng thái/cảnh báo kỳ hạn hiển thị đúng màu; nút thao tác hiển thị theo BR-CTV-17.  |
| **Hậu điều kiện Thất bại** | Không hiển thị được danh sách; hệ thống báo lỗi tải dữ liệu.  |
| **Business Rule** | **BR-CTV-04 — 5 trạng thái hợp đồng:** Hợp đồng có 5 trạng thái (Chưa hiệu lực, Đang hiệu lực, Hết hiệu lực, Dừng khai thác, Đã hủy). Hợp đồng mới upload tự động đặt trạng thái Chưa hiệu lực (nếu Ngày hiệu lực \> hôm nay) hoặc Đang hiệu lực (nếu Ngày hiệu lực ≤ hôm nay) **BR-CTV-06 — Cơ chế cảnh báo kỳ hạn tự động:** Hệ thống tự động quét các hợp đồng "Đang hiệu lực" hằng ngày (tác vụ tự động chạy 0:00, sau BR-CTV-13), tính số ngày còn lại đến Ngày hết hạn và phân loại 3 mức cảnh báo: Khẩn cấp (đỏ, còn ≤ 7 ngày), Lưu ý (cam, còn 8–30 ngày), Theo dõi (vàng, còn 31–60 ngày). Hệ thống gắn badge cảnh báo cho từng hợp đồng và cập nhật section Giám sát kỳ hạn. Trạng thái hợp đồng không thay đổi.  |
| **Yêu cầu phi chức năng** | Thời gian tải khối lịch sử \< 2 giây  |

#### **3.2.2. Mô tả giao diện**

* **Ảnh giao diện**: 

* **Link UI Design**: https\://www\.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=9593-13789\&t=foCCcYw8Nqufcyw0-0  
* **Mô tả giao diện**: 

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **A. MÀN HÌNH DANH SÁCH HỢP ĐỒNG NHÀ THẦU**  |  |  |  |  |  |
| Ô "Tổng số hợp đồng" | — | Number | — | — | Tổng số hợp đồng trên hệ thống |
| Ô "Đang hiệu lực" | — | Number | — | — | Tổng số hợp đồng ở trạng thái “Đang hiệu lực” |
| Ô "Sắp hết hạn" | — | Number | — | — | Số HĐ "Đang hiệu lực" còn từ dưới 60 ngày  |
| Ô "Hết hiệu lực" | — | Number | — | — | Tổng số hợp đồng ở trạng thái “Hết hiệu lực”  |
| Ô "Dừng/Hủy" | — | Number | — | — | Tổng số hợp đồng ở trạng thái “Đã hủy”/”Dừng khai thác”  |
| Nút "Thêm hợp đồng" | — | Button (primary) | — | — | Mở bước Chọn chế độ (mục B): "Thêm hợp đồng mới" (UC-CTV-01) hoặc "Tái ký hợp đồng" (UC-CTV-01) |
| Ô tìm kiếm | — | Text | 255 | (rỗng) | Placeholder "Tìm kiếm...". Khớp một phần trên: Mã hợp đồng, Tên nhà thầu, Mã nhà thầu (VDR), Mã số thuế (UC-CTV-10) |
| Nút "Bộ lọc nâng cao" | — | Button | — | — | Popup lọc mở rộng: Theo Trạng thái, Theo khoảng gày ký / Ngày hiệu lực / Ngày hết hạn |
| Mã hợp đồng | — | Badge (link) | 15 | — | Format CTVYYMM-XXX (BR-CTV-01, VD: CTV2608-003). Bấm mở màn Chi tiết hợp đồng (UC-CTV-02) |
| Tên hợp đồng | — | Text (link) | 255 |  | Tên hợp đồng nhà thầu |
| Nhà thầu | — | Text (link) | 255 | — | Tên \+ Mã nhà thầu (VDR-XXXX); bấm mở Chi tiết nhà thầu (UC-VD-02) |
| Ngày ký | — | Date | — | — | Lấy từ Hợp đồng.Ngày ký |
| Ngày hiệu lực | — | Date | — | — | Lấy từ Hợp đồng.Ngày hiệu lực |
| Ngày hết hạn | — | Date \+ Badge cảnh báo | — | — | Dưới ngày hiển thị số ngày còn lại kèm badge theo BR-CTV-06/07: • ≤7: "(Còn N ngày)" nền đỏ • 8–30: nền cam • 31–60: nền vàng • quá hạn: "(Đã hết hạn)" đỏ đậm |
| Badge "GH" | — | Badge (icon) | — | — | Hiện nếu HĐ đã từng gia hạn (BR-CTV-08). Bấm mở Lịch sử gia hạn |
| Trạng thái | — | Badge | — | — | Badge màu theo BR-CTV-04: • Chưa hiệu lực (xám) • Đang hiệu lực (xanh) • Hết hiệu lực (xám nhạt) • Dừng khai thác (đỏ) • Đã hủy (đỏ) |
| Nút "Tải xuống" | — | Icon button | — | — | Tải file scan gốc của HĐ về máy (gộp trong UC-CTV-02) |
| Số dòng mỗi trang | — | Dropdown | — | 10 | 10 / 20 / 50 / 100 |
| Tổng số bản ghi | — | Number | — | — | Format "/\[X\] bản ghi" |
| Điều hướng trang | — | Button | — | Trang 1 | Trang trước / số trang / trang sau |
| **B1. FORM THÊM HỢP ĐỒNG** |  |  |  |  |  |
| Chế độ thêm | ✔ | Radio | — | Thêm hợp đồng mới | 2 lựa chọn: Thêm hợp đồng mới · Tái ký hợp đồng. Chọn chế độ → hiển thị form tương ứng (B1 / B2) |
| Nhà thầu | ✔ | Dropdown/Search | — | (rỗng) | Chọn nhà thầu ở "Tạo mới" chưa có HĐ. Hiển thị Tên \+ Mã VDR \+ MST |
| Mã hợp đồng | Tự động | Text (read-only) | 15 | Tự động-generate | Sinh khi lưu (BR-CTV-01), không sửa |
| Tên hợp đồng | ✔ | Text | 255 | (rỗng) | Nhập tên hợp đồng |
| Ngày ký | ✔ | Date | — | (rỗng) | Ngày ký ≤ Ngày hiệu lực (BR-CTV-03) |
| Ngày hiệu lực | ✔ | Date | — | (rỗng) | Ngày hiệu lực; quyết định trạng thái khởi tạo (BR-CTV-04) |
| Ngày hết hạn | ✔ | Date | — | (rỗng) | Ngày kết thúc hiệu lực; ≥ Ngày hiệu lực  |
| File scan hợp đồng | ✔ | File upload | — | (rỗng) | Bắt buộc ≥ 1 file (BR-CTV-02). PDF/DOCX ≤ 20MB |
| Đầu mối liên hệ (HĐ) | — | Text | 255 | (rỗng) | Đầu mối phía nhà thầu cho HĐ này(Họ tên, Chức vụ, Số điện thoại, Email) |
| *— Tự động gia hạn (BR-CTV-18) —* |  |  |  |  |  |
| Bật tự động gia hạn | — | Button | — | Tắt | Bật/tắt evergreen cho HĐ |
| Chu kỳ gia hạn | ✔ (khi bật) | Dropdown | — | (rỗng) | 3 / 6 / 12 / 24 tháng |
| Nút "Lưu" / "Hủy" | — | Button | — | — | Kiểm tra trường bắt buộc \+ thứ tự ngày \+ file trước khi lưu; lưu xong chuyển màn Chi tiết. Nếu Ngày hiệu lực ≤ hôm nay → HĐ "Đang hiệu lực" và Tự động kích hoạt nhà thầu (BR-VD-07) |
| **B2. TÁI KÝ HỢP ĐỒNG — CHỌN NHÀ THẦU** (UC-CTV-01, BR-CTV-09) |  |  |  |  |  |
| Nhà thầu | ✔ | Dropdown/Search | — | (rỗng) | Chỉ liệt kê nhà thầu đủ điều kiện tái ký: KHÔNG ở "Dừng hợp tác", và có HĐ mới nhất ở "Đang hiệu lực" / "Hết hiệu lực" / "Dừng khai thác" / "Đã hủy". LOẠI nhà thầu có HĐ mới nhất "Chưa hiệu lực" và nhà thầu "Dừng hợp tác". Mỗi dòng hiển thị Tên \+ Mã VDR \+ MST, kèm (HĐ gần nhất: \[Mã\] — \[Trạng thái\]) |
| Hợp đồng sẽ được tái ký | — | Section (read-only) | — | — | Sau khi chọn nhà thầu, tự điền Mã HĐ cũ \+ trạng thái \+ Ngày hiệu lực/hết hạn; dùng làm mốc chặn Ngày hiệu lực HĐ mới \> HĐ cũ (BR-CTV-09) |
| Nút "Sao chép thông tin từ HĐ cũ" | — | Button | — | — | Điền sẵn điều khoản/giá/thanh toán/đầu mối/cấu hình Tự động gia hạn từ HĐ cũ để chỉnh, tránh nhập lại |
| Form nhập HĐ mới | — | Section | — | — | Hiển thị ngay bên dưới sau khi chọn nhà thầu; dùng chung toàn bộ trường của popup Tái ký (mục E) (BR-CTV-09) |
| **C. MÀN HÌNH CHI TIẾT HỢP ĐỒNG**  |  |  |  |  |  |
| Mã hợp đồng | — | Text | — | — | Format CTVYYMM-XXX (BR-CTV-01, VD: CTV2608-003). Bấm mở màn Chi tiết hợp đồng (UC-CTV-02) |
| Trạng thái | — | Badge | — | — | Badge 5 trạng thái (BR-CTV-04) |
| Badge cảnh báo kỳ hạn | — | Badge | — | — | Số ngày còn lại \+ màu (BR-CTV-06/07) |
| Nút "Chỉnh sửa" | — | Button | — | — | UC-CTV-04. Hiện khi HĐ "Chưa hiệu lực"/"Đang hiệu lực" (BR-CTV-14, BR-CTV-17) |
| Nút "Gia hạn" | — | Button | — | — | UC-CTV-07. Hiện khi HĐ là **mới nhất** và "Đang hiệu lực"/"Hết hiệu lực" (BR-CTV-08) → popup mục D |
| Nút "Tái ký" | — | Button | — | — | Hiện khi HĐ là **mới nhất** (mọi trạng thái trừ “Chưa hiệu lực”) và nhà thầu không ở "Dừng hợp tác" → popup mục E |
| Nút "Hủy hợp đồng" | — | Button (danger) | — | — | UC-CTV-05. Hiện khi HĐ "Chưa hiệu lực" (BR-CTV-11) → popup mục F |
| Nút "Dừng khai thác" | — | Button (danger) | — | — | UC-CTV-06. Hiện khi HĐ "Đang hiệu lực" (BR-CTV-12) → popup mục G |
| Khối Thông tin hợp đồng | — | Section | — | — | 3 mốc ngày (ký/hiệu lực/hết hạn). Nút "Sửa" của khối chỉ hiện khi HĐ "Chưa hiệu lực" (BR-CTV-14); từ "Đang hiệu lực" trở đi read-only  |
| Khối đầu mối liên hệ  | — | Section | — | — | Hiển thị thông tin đầu mối liên hệ chính: Họ tên(Bắt buộc), Chức vụ, Số điện thoại(Bắt buộc), Email. |
| Khối File scan | — | Danh sách file | — | — | File scan hợp đồng (duy nhất 1 file). Nút "Sửa/Thay file" chỉ hiện khi HĐ "Chưa hiệu lực" (BR-CTV-14); từ "Đang hiệu lực" trở đi read-only, muốn đổi phải Hủy \+ Tái ký  |
| Khối Bảng giá mua | — | Bảng | — | — | Tham chiếu từ Giá mua đầu vào  |
| Khối Phụ lục hợp đồng | — | Bảng | — | — | Danh sách phụ lục (mục H); nút "Thêm phụ lục"  |
| Khối Tự động gia hạn | — | Section | — | — | Trạng thái bật/tắt \+ chu kỳ; nút cấu hình (UC-CTV-09, mục I) |
| Nút "Xem lịch sử thao tác" | — | Button | — | — | Mở khối Lịch sử (UC-CTV-11, mục J) |
| **D. POPUP GIA HẠN**  |  |  |  |  |  |
| Ngày hết hạn hiện tại | — | Date (read-only) | — | — | Hiển thị để đối chiếu |
| Nút chọn nhanh thời hạn | — | Button group | — | — | 3 / 6 / 12 / 24 tháng → tự tính Ngày hết hạn mới (Đang hiệu lực: cộng từ Ngày hết hạn; Hết hiệu lực: cộng từ hôm nay) |
| Ngày hết hạn mới | ✔ | Date picker | — | — | Có thể chọn tay; sửa tay thì bỏ highlight nút preset. Phải \> Ngày hết hạn cũ và \> hôm nay (BR-CTV-08) |
| Khối phụ lục (tùy chọn) | — | File upload | — | — | Tên phụ lục, Ngày bổ sung, Mô tả, Tệp đính kèm)  (BR-CTV-16). PDF/DOCX ≤ 20MB |
| Nút "Xác nhận" / "Hủy" | — | Button | — | — | Cập nhật trực tiếp Ngày hết hạn, mã HĐ không đổi. Gia hạn HĐ "Hết hiệu lực" → về "Đang hiệu lực" → nhà thầu Tự động "Đang hoạt động" (BR-VD-07) |
| **E. POPUP TÁI KÝ**  |  |  |  |  |  |
| **(Lối vào)** | — | — | — | — | Form này mở từ: (a) B2 — chọn "Tái ký" tại nút "Thêm hợp đồng" rồi chọn nhà thầu; hoặc (b) nút "Tái ký" ở màn Chi tiết hợp đồng (HĐ mới nhất). Cả 2 lối dùng chung các trường bên dưới |
| Thông tin HĐ cũ | — | Text | — | — | Mã \+ trạng thái HĐ đang tái ký (HĐ mới nhất) |
| Ngày ký / hiệu lực / hết hạn (HĐ mới) | ✔ | Date | — | (rỗng) | Ngày hiệu lực HĐ mới \> Ngày hiệu lực HĐ trước; đúng thứ tự BR-CTV-03 |
| File scan mới | ✔ | File upload | — | (rỗng) | Bắt buộc (BR-CTV-02). PDF/DOCX ≤ 20MB |
| Khối phụ lục (tùy chọn) | — | File upload | — | (rỗng) | Tên phụ lục, Ngày bổ sung, Mô tả, Tệp đính kèm)  (BR-CTV-16). PDF/DOCX ≤ 20MB |
| Cảnh báo xử lý HĐ cũ | — | Text | — | — | Nếu HĐ cũ "Đang hiệu lực": báo sẽ Dừng khai thác HĐ cũ (BR-CTV-09) → cần xác nhận |
| Nút "Xác nhận" / "Hủy" | — | Button | — | — | Tạo HĐ mới; HĐ cũ "Đang hiệu lực" → Dừng khai thác, các trạng thái khác giữ nguyên (BR-CTV-09) |
| **F. POPUP HỦY HỢP ĐỒNG**  |  |  |  |  |  |
| Lý do hủy | ✔ | Textarea | 500 | (rỗng) | Bắt buộc (BR-CTV-11). Chỉ hủy khi HĐ "Chưa hiệu lực" |
| Nút "Xác nhận" / "Hủy" | — | Button (danger) | — | — | HĐ → "Đã hủy" (không xóa vật lý, BR-CTV-11) |
| **G. POPUP DỪNG KHAI THÁC**  |  |  |  |  |  |
| Lý do dừng khai thác | ✔ | Textarea | 500 | (rỗng) | Bắt buộc. Nếu kích hoạt từ luồng tái ký → điền sẵn "Được thay thế bởi HĐ tái ký \[Mã\]" (BR-CTV-09) |
| Nút "Xác nhận" / "Hủy" | — | Button (danger) | — | — | HĐ → "Dừng khai thác"; Bảng giá mua gắn HĐ → "Hết hiệu lực" (BR-CTV-20) |
| **H. QUẢN LÝ PHỤ LỤC HỢP ĐỒNG**  |  |  |  |  |  |
| Mã phụ lục | — | Text (read-only) | 15 | — | Format PLVYYMM-XXX (VD: PLV2608-011), không sửa |
| Tên phụ lục | ✔ | Text | 255 | (rỗng) | Bắt buộc |
| Mô tả | — | Textarea | 1000 | (rỗng) | Tùy chọn |
| File đính kèm | ✔ | File upload | — | (rỗng) | Bắt buộc. PDF/DOCX ≤ 20MB |
| Ngày bổ sung phụ lục | — | Date (read-only) | — | — | \= ngày user upload, không sửa |
| Nút "Thêm/Sửa/Xóa" | — | Button | — | — | Thêm/Sửa/Xóa tự do; xóa có xác nhận; lưu lịch sử thao tác audit (BR-CTV-16) |
| **I. CẤU HÌNH TỰ ĐỘNG GIA HẠN**  |  |  |  |  |  |
| Bật tự động gia hạn | — | Button | — | Tắt | Chỉ cấu hình khi HĐ "Chưa hiệu lực"/"Đang hiệu lực" (BR-CTV-18) |
| Chu kỳ gia hạn | ✔ (khi bật) | Dropdown | — | (rỗng) | 3 / 6 / 12 / 24 tháng |
| Nút "Lưu" | — | Button | — | — | Lưu cấu hình, lưu lịch sử thao tác; tắt có popup xác nhận |

#### **3.2.3. Quy tắc nghiệp vụ (Business Rule)**

| Mã BR | Tên quy tắc | Nội dung |
| ----- | ----- | ----- |
| BR-CTV-01 | Quy tắc sinh Mã hợp đồng nhà thầu | Mã hợp đồng nhà thầu sinh tự động theo format CTVYYMM-XXX (CTV \= Contract Vendor cố định, YYMM \= 2 số cuối của năm \+ tháng hiện tại; XXX bắt đầu từ 001; VD: CTV2608-003). Không cho chỉnh sửa sau khi tạo |
| BR-CTV-02 | Ràng buộc file đính kèm | Bắt buộc đính kèm ít nhất 1 file scan khi upload hoặc tái ký hợp đồng.  |
| BR-CTV-03 | Ràng buộc ngày hợp đồng | Ngày bắt đầu hiệu lực ≤ Ngày kết thúc hiệu lực |
| BR-CTV-04 | 5 trạng thái hợp đồng | Hợp đồng có 5 trạng thái (Chưa hiệu lực, Đang hiệu lực, Hết hiệu lực, Dừng khai thác, Đã hủy). Hợp đồng mới upload tự động đặt trạng thái Chưa hiệu lực (nếu Ngày hiệu lực \> hôm nay) hoặc Đang hiệu lực (nếu Ngày hiệu lực ≤ hôm nay) |
| BR-CTV-05 | Ràng buộc 1 nhà thầu 1 hợp đồng hiệu lực | ~~Tại mỗi thời điểm, 1 nhà thầu chỉ được có tối đa 1 hợp đồng ở trạng thái "Đang hiệu lực".~~  Tại mọi thời điểm, mỗi nhà thầu chỉ được có **tối đa 1 hợp đồng ở trạng thái "Đang hiệu lực"**. Một hợp đồng "Chưa hiệu lực" **được phép tồn tại song song** với hợp đồng "Đang hiệu lực" hiện tại, với điều kiện **không chồng lấn thời gian hiệu lực**.(Ngày hiệu lực của HĐ "Chưa hiệu lực" phải **lớn hơn** Ngày hết hạn của HĐ "Đang hiệu lực").  |
| BR-CTV-06 | Cơ chế cảnh báo kỳ hạn tự động | Hệ thống tự động quét các hợp đồng "Đang hiệu lực" hằng ngày (tác vụ tự động chạy 0:00, sau BR-CTV-13), tính số ngày còn lại đến Ngày hết hạn và phân loại 3 mức cảnh báo: Khẩn cấp (đỏ, còn ≤ 7 ngày), Lưu ý (cam, còn 8–30 ngày), Theo dõi (vàng, còn 31–60 ngày). Hệ thống gắn badge cảnh báo cho từng hợp đồng và cập nhật section Giám sát kỳ hạn. Trạng thái hợp đồng không thay đổi.  |
| BR-CTV-07 | Ngưỡng cảnh báo kỳ hạn | Cảnh báo kỳ hạn theo 3 mức dựa trên số ngày còn lại đến ngày hết hạn: Khẩn cấp ≤ 7 ngày (đỏ), Lưu ý 8–30 ngày (cam), Theo dõi 31–60 ngày (vàng) |
| BR-CTV-08 | Cơ chế gia hạn tự động | Gia hạn áp dụng cho HĐ "Đang hiệu lực" (gia hạn sớm) hoặc "Hết hiệu lực" (gia hạn muộn). Popup Gia hạn cung cấp 2 cách chọn Ngày hết hạn mới: **(1) nút chọn nhanh thời hạn (3 / 6 / 12 / 24 tháng)** — hệ thống tự tính Ngày hết hạn mới; **(2) chọn ngày cụ thể trên date picker**. **Mốc tính khi dùng nút chọn nhanh**: với HĐ "Đang hiệu lực" cộng thời hạn từ Ngày hết hạn; với HĐ "Hết hiệu lực" cộng thời hạn từ ngày hôm nay. Nếu user sửa tay date picker sau khi đã chọn nhanh, hệ thống bỏ highlight nút preset. Dù chọn cách nào, Ngày hết hạn mới phải lớn hơn Ngày hết hạn cũ và lớn hơn ngày hiện tại. Hệ thống cập nhật trực tiếp trường Ngày hết hạn của Hợp đồng, mã Hợp đồng không đổi. Có thể gia hạn nhiều lần.  |
| BR-CTV-09 | Cơ chế tái ký hợp đồng | **Điều kiện tiên quyết: nhà thầu KHÔNG ở "Dừng hợp tác"** (phải kích hoạt lại trước — BR-CTV-21). Áp dụng cho **HĐ mới nhất** ở "Đang hiệu lực"/"Hết hiệu lực"/"Dừng khai thác"/"Đã hủy". Tạo HĐ mới độc lập (mã mới, file scan mới), Ngày hiệu lực HĐ mới \> Ngày hiệu lực HĐ trước. Xử lý HĐ cũ: **"Đang hiệu lực" → buộc "Dừng khai thác"** (lý do "Được thay thế bởi HĐ tái ký \[Mã\]"); **"Hết hiệu lực"/"Dừng khai thác"/"Đã hủy" → giữ nguyên**. Popup có ô upload phụ lục tùy chọn → tự tạo bản ghi phụ lục gắn HĐ mới.   |
| BR-CTV-11 | Điều kiện Hủy hợp đồng | Chỉ được hủy khi Hợp đồng ở trạng thái "Chưa hiệu lực". Với hợp đồng đang chạy ("Đang hiệu lực"), dùng "Dừng khai thác" thay thế. Bắt buộc nhập lý do khi hủy |
| BR-CTV-12 | Điều kiện Dừng khai thác | Chỉ khi HĐ "Đang hiệu lực". Kích hoạt bởi: (1) thủ công (lý do); (2) tái ký HĐ đang hiệu lực (BR-CTV-09); (3) nhà thầu Dừng hợp tác (BR-VD-06). Mọi trường hợp: HĐ → "Dừng khai thác" ⟹ Bảng giá mua → "Hết hiệu lực" (BR-CTV-20).  |
| BR-CTV-13 | Cơ chế tự động chuyển trạng thái theo ngày | Tác vụ tự động 0:00: **(1)** HĐ "Chưa hiệu lực" → "Đang hiệu lực" nếu Ngày hiệu lực ≤ hôm nay → tự động kéo theo: nhà thầu "Tạo mới"/"Ngưng hoạt động" → "Đang hoạt động" (BR-VD-07); **(2)** HĐ "Đang hiệu lực" → "Hết hiệu lực" nếu Ngày hết hạn \< hôm nay → tự động kéo theo: nếu nhà thầu không còn HĐ "Đang hiệu lực" → "Ngưng hoạt động" (BR-VD-16). Thứ tự 1 lần chạy: bước (1) → (2) → quét cảnh báo kỳ hạn (BR-CTV-06)   |
| BR-CTV-14 | Quy tắc chỉnh sửa hợp đồng sau upload | Phạm vi chỉnh sửa phụ thuộc trạng thái hợp đồng; chỉ áp dụng khi nhà thầu không ở "Dừng hợp tác"; mọi thay đổi được ghi lịch sử thao tác. **Không được sửa ở mọi trạng thái:** Mã hợp đồng, Nhà thầu, Giá/Bảng giá mua (tham chiếu từ Giá mua đầu vào). **Khi hợp đồng "Chưa hiệu lực":** được sửa Tên hợp đồng, 3 trường ngày (ký / hiệu lực / hết hạn — thỏa BR-CTV-03), File scan, và phương thức gia hạn (cấu hình tự động/thủ công — BR-CTV-18). **Khi hợp đồng "Đang hiệu lực":** không được sửa Tên hợp đồng, 3 trường ngày và File scan; chỉ được cập nhật phương thức gia hạn (BR-CTV-18). Muốn đổi thời hạn → dùng Gia hạn; muốn thay toàn bộ → Hủy \+ Tái ký. **Khi hợp đồng "Hết hiệu lực" / "Dừng khai thác" / "Đã hủy":** không cho chỉnh sửa.  |
| BR-CTV-16 | Cơ chế quản lý phụ lục hợp đồng | Mỗi phụ lục sinh Mã tự động theo format PLVYYMM-XXX (PLV \= Phụ lục Vendor cố định, YYMM \= 2 số cuối của năm \+ tháng hiện tại, XXX bắt đầu từ 001; VD: PLV2608-011). Mã không sửa được sau khi tạo.  |
| BR-CTV-17 | Nguyên tắc hiển thị nút thao tác theo trạng thái | Hệ thống chỉ hiển thị các nút mà người dùng có quyền và hợp đồng đang ở trạng thái cho phép thao tác đó tại thời điểm đó; nút không thỏa điều kiện thì ẩn. **Chỉnh sửa** (UC-CTV-04, BR-CTV-14): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Gia hạn** (UC-CTV-07, BR-CTV-08): hiển thị khi HĐ "Đang hiệu lực" hoặc "Hết hiệu lực", và là HĐ mới nhất của nhà thầu. **Tái ký** (UC-CTV-01, BR-CTV-09): hiển thị khi HĐ "Đang hiệu lực", "Hết hiệu lực", "Dừng khai thác" hoặc "Đã hủy", và là HĐ mới nhất của nhà thầu. **Hủy hợp đồng** (UC-CTV-05, BR-CTV-11): hiển thị khi HĐ "Chưa hiệu lực". **Dừng khai thác** (UC-CTV-06, BR-CTV-12): hiển thị khi HĐ "Đang hiệu lực". **Cấu hình tự động gia hạn** (UC-CTV-09, BR-CTV-18): hiển thị khi HĐ "Chưa hiệu lực" hoặc "Đang hiệu lực". **Thêm phụ lục** (UC-CTV-03.1, BR-CTV-16): hiển thị khi HĐ "Chưa hiệu lực", "Đang hiệu lực", "Hết hiệu lực" hoặc "Dừng khai thác"; ẩn khi "Đã hủy". **Tải file scan / Xem chi tiết / Xem lịch sử** (UC-CTV-02, UC-CTV-11): hiển thị ở mọi trạng thái, kể cả khi nhà thầu "Dừng hợp tác".  |
| BR-CTV-18 | Cơ chế tự động gia hạn | Tự động gia hạn chỉ áp dụng cho HĐ có điều khoản tự động gia hạn (evergreen) với nhà thầu. Cấu hình gồm: **(1) Bật/tắt** (mặc định tắt); **(2) Chu kỳ gia hạn** (chọn 3 / 6 / 12 / 24 tháng). Cấu hình có thể thiết lập khi Upload HĐ (UC-CTV-01) hoặc chỉnh sửa sau qua UC-CTV-09. Chỉ cấu hình được Tự động gia hạn khi HĐ ở "Chưa hiệu lực" hoặc "Đang hiệu lực". Khi bật, hệ thống tự động gia hạn theo chu kỳ mỗi khi đến hạn cho đến khi user tắt thủ công. User có thể tắt Tự động gia hạn bất kỳ lúc nào để giành lại kiểm soát thủ công. Mọi thay đổi cấu hình được lưu lịch sử thao tác. Nếu user gia hạn thủ công khi Tự động gia hạn đang bật, Ngày hết hạn mới được cập nhật và lần Tự động gia hạn kế tiếp tính từ Ngày hết hạn mới này.  |
| BR-CTV-19  | Tự động gia hạn theo tác vụ tự động | Tác vụ hằng ngày quét HĐ "Đang hiệu lực" có bật Tự động gia hạn: (1) trước hết hạn 7 ngày → notification cảnh báo (kèm nút tắt nhanh); (2) đến hết hạn nếu vẫn bật → cộng chu kỳ vào Ngày hết hạn, ghi lịch sử thao tác, notification xác nhận. Không tự tạo phụ lục. Tự dừng nếu HĐ bị Dừng khai thác/Hủy hoặc user tắt.  |
| BR-CTV-20  | Hiệu lực Bảng giá mua theo HĐ & trạng thái nhà thầu | Mỗi bảng giá mua gắn đúng 1 hợp đồng. Hiệu lực của bảng giá phụ thuộc đồng thời trạng thái hợp đồng gắn với nó và trạng thái nhà thầu; hệ thống tự cập nhật bảng giá khi một trong hai thay đổi: Hợp đồng gắn bảng giá chuyển **"Đang hiệu lực"** (và nhà thầu "Đang hoạt động") → bảng giá có hiệu lực, được dùng để tính giá vốn/phân bổ. Hợp đồng chuyển **"Hết hiệu lực"** (quá hạn) → bảng giá tạm ngưng hiệu lực; nếu hợp đồng được Gia hạn về "Đang hiệu lực" → bảng giá có hiệu lực trở lại. Hợp đồng chuyển **"Dừng khai thác"** hoặc **"Đã hủy"** → bảng giá hết hiệu lực vĩnh viễn. Nhà thầu chuyển **"Dừng hợp tác"** (thủ công) → toàn bộ bảng giá của nhà thầu hết hiệu lực vĩnh viễn (theo luồng Dừng hợp tác tại BR-VD-06). Ràng buộc: khoảng hiệu lực bảng giá nằm trong thời hạn hợp đồng (Ngày hiệu lực bảng giá ≥ Ngày hiệu lực HĐ; Ngày hết hạn ≤ Ngày hết hạn HĐ). |
| BR-CTV-21  | Khóa thao tác HĐ khi nhà thầu "Dừng hợp tác" | Khi nhà thầu "Dừng hợp tác", khóa toàn bộ thao tác trên mọi HĐ của nhà thầu: Upload, Gia hạn, Tái ký, Chỉnh sửa, Hủy, Dừng khai thác, Thêm/Sửa/Xóa phụ lục. Chỉ cho Xem (read-only) \+ tải file scan; nút thao tác bị ẩn (BR-CTV-17). Muốn thao tác lại phải kích hoạt lại nhà thầu (BR-VD-17).  |

#### **3.2.4. Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Upload HĐ: thiếu trường bắt buộc | Lỗi | "Vui lòng nhập đầy đủ thông tin bắt buộc" | Không lưu, đánh dấu trường thiếu |
| Upload HĐ: sai thứ tự ngày | Lỗi | "Ngày ký ≤ Ngày hiệu lực ≤ Ngày hết hạn. Vui lòng kiểm tra lại" | Không lưu |
| Upload HĐ: chưa đính kèm file scan | Lỗi | "Vui lòng đính kèm file scan hợp đồng" | Không lưu |
| Upload HĐ: file sai định dạng hoặc vượt kích thước | Lỗi | "File không hợp lệ. Chỉ chấp nhận PDF, DOCX, tối đa 20MB" | Không lưu |
| Upload HĐ thành công | Thành công | "Upload hợp đồng thành công" | Chuyển sang màn Chi tiết hợp đồng |
| Upload HĐ đầu tiên (Tự động kích hoạt nhà thầu) | Thông tin | "Đã tạo hợp đồng và kích hoạt nhà thầu \[Tên nhà thầu\] sang Đang hoạt động" | Hiển thị thông báo, cập nhật danh sách |
| Không tìm thấy kết quả tra cứu | Thông tin | "Không tìm thấy hợp đồng phù hợp" | Hiển thị màn hình không có dữ liệu |
| Tải file scan không tồn tại | Lỗi | "File không tồn tại. Vui lòng liên hệ Admin" | Không tải |
| Lỗi hệ thống khi tải file | Lỗi | "Không thể tải file, vui lòng thử lại" | Không tải |
| Gia hạn: bấm nút chọn nhanh nhưng không tính được ngày | Lỗi | "Không thể tính thời hạn tự động. Vui lòng chọn ngày thủ công" | Không điền ngày, cho phép chọn thủ công |
| Gia hạn: Ngày hết hạn mới ≤ Ngày hết hạn cũ (hoặc ≤ hôm nay) | Lỗi | "Ngày hết hạn mới phải lớn hơn Ngày hết hạn cũ và lớn hơn ngày hiện tại" | Không lưu |
| Gia hạn: file phụ lục sai định dạng/vượt kích thước | Lỗi | "File phụ lục không hợp lệ. Chỉ chấp nhận PDF, DOCX tối đa 20MB" | Không lưu, giữ nguyên các trường đã nhập |
| Gia hạn hợp đồng thành công (không kèm phụ lục) | Thành công | "Gia hạn hợp đồng thành công đến \[Ngày hết hạn mới\]" | Cập nhật danh sách, gỡ badge cảnh báo |
| Gia hạn hợp đồng thành công (có kèm phụ lục) | Thành công | "Gia hạn hợp đồng thành công đến \[Ngày hết hạn mới\]. Phụ lục \[Mã phụ lục\] đã được thêm vào danh sách" | Cập nhật danh sách, làm mới Chi tiết HĐ |
| Tái ký: thiếu trường bắt buộc hoặc sai thứ tự ngày | Lỗi | "Vui lòng nhập đầy đủ thông tin bắt buộc và đúng thứ tự ngày" | Không lưu, đánh dấu trường lỗi |
| Tái ký: chưa đính kèm file scan mới | Lỗi | "Vui lòng đính kèm file scan hợp đồng mới" | Không lưu |
| Tái ký: Ngày hiệu lực HĐ mới sau Ngày hiệu lực HĐ trước đó | Lỗi | "Ngày hiệu lực hợp đồng tái ký phải sau ngày hiệu lực hợp đồng trước đó" | Chặn lưu |
| Tái ký: xác nhận Dừng khai thác HĐ cũ | Xác nhận | "Hợp đồng cũ \[Mã\] đang hiệu lực đến \[Ngày\]. Để tránh 2 hợp đồng song song, hợp đồng cũ sẽ được Dừng khai thác. Xác nhận tái ký?" | Chờ xác nhận |
| Tái ký thành công  | Thành công | "Tái ký hợp đồng thành công" | Chuyển sang Chi tiết HĐ mới, cập nhật danh sách |
| Tái ký (lối Thêm hợp đồng): chưa chọn nhà thầu | Lỗi | "Vui lòng chọn nhà thầu cần tái ký" | Chặn tiếp tục |
| Tái ký: không có nhà thầu đủ điều kiện | Thông tin | "Chưa có nhà thầu nào đủ điều kiện tái ký" | Hiển thị danh sách rỗng trong dropdown |
| Hủy HĐ: không nhập lý do | Lỗi | "Vui lòng nhập lý do hủy hợp đồng" | Chặn thao tác |
| Hủy HĐ thành công | Thành công | "Đã hủy hợp đồng thành công" | Cập nhật danh sách |
| Dừng khai thác: không nhập lý do | Lỗi | "Vui lòng nhập lý do dừng khai thác" | Chặn thao tác |
| Dừng khai thác thành công | Thành công | "Đã dừng khai thác hợp đồng" | Cập nhật danh sách |
| Nhà thầu Dừng hợp tác — xử lý hợp đồng liên quan | Thông tin | "Đã xử lý \[N\] hợp đồng của nhà thầu \[Tên\]: hủy/dừng khai thác và cho hết hiệu lực bảng giá mua" | Cập nhật danh sách HĐ, ghi lịch sử thao tác |
| Chỉnh sửa HĐ: thiếu trường bắt buộc hoặc sai định dạng | Lỗi | "Vui lòng nhập đầy đủ thông tin bắt buộc và đúng định dạng" | Chặn lưu, đánh dấu trường lỗi |
| Chỉnh sửa HĐ: file scan sai định dạng/vượt kích thước | Lỗi | "File không hợp lệ. Chỉ chấp nhận PDF, DOCX tối đa 20MB" | Chặn lưu |
| Chỉnh sửa HĐ thành công | Thành công | "Cập nhật thông tin hợp đồng thành công" | Đóng form, làm mới màn Chi tiết HĐ |
| Thêm phụ lục: thiếu Tên hoặc File | Lỗi | "Vui lòng nhập Tên phụ lục và đính kèm file" | Chặn lưu, đánh dấu trường thiếu |
| Thêm phụ lục: file sai định dạng/vượt kích thước | Lỗi | "File không hợp lệ. Chỉ chấp nhận PDF, DOCX tối đa 20MB" | Chặn lưu |
| Thêm phụ lục thành công | Thành công | "Đã thêm phụ lục \[Mã phụ lục\] thành công" | Đóng popup, làm mới danh sách phụ lục |
| Chỉnh sửa phụ lục thành công | Thành công | "Cập nhật phụ lục \[Mã phụ lục\] thành công" | Đóng popup, làm mới danh sách |
| Xóa phụ lục: xác nhận | Xác nhận | "Bạn có chắc chắn muốn xóa phụ lục \[Mã phụ lục\] \- \[Tên phụ lục\]? Thao tác này không thể hoàn tác" | Hiển thị popup xác nhận |
| Xóa phụ lục thành công | Thành công | "Đã xóa phụ lục \[Mã phụ lục\] thành công" | Đóng popup, làm mới danh sách |
| Lỗi hệ thống khi lưu | Lỗi | "Không thể lưu hợp đồng, vui lòng thử lại" | Không lưu, giữ nguyên dữ liệu đã nhập |
| Mất kết nối khi thao tác | Lỗi | "Mất kết nối. Vui lòng kiểm tra đường truyền và thử lại" | Không lưu |
| tác vụ tự động chuyển trạng thái/cảnh báo kỳ hạn không kích hoạt được | Cảnh báo Admin | "tác vụ tự động \[tên\] không kích hoạt được lúc \[thời điểm\]. Vui lòng kiểm tra hệ thống" | lưu lịch sử thao tác lỗi, gửi cảnh báo Admin |
| tác vụ tự động lỗi khi cập nhật một HĐ cụ thể sau nhiều lần retry | Cảnh báo Admin | "Không thể cập nhật trạng thái Hợp đồng \[Mã\] sau \[N\] lần thử. Vui lòng kiểm tra dữ liệu" | lưu lịch sử thao tác lỗi chi tiết, gửi cảnh báo Admin |
| Cấu hình tự động gia hạn: chưa chọn chu kỳ | Lỗi | "Vui lòng chọn chu kỳ gia hạn" | Chặn lưu |
| Bật/sửa cấu hình tự động gia hạn thành công | Thành công | "Đã cập nhật cấu hình tự động gia hạn" | Đóng popup, làm mới khối Tự động gia hạn |
| Tắt tự động gia hạn: xác nhận | Xác nhận | "Bạn có chắc chắn muốn tắt tự động gia hạn cho HĐ \[Mã HĐ\]? Hợp đồng sẽ không tự động kéo dài khi đến hạn." | Hiển thị popup xác nhận |
| Tắt tự động gia hạn thành công | Thành công | "Đã tắt tự động gia hạn cho hợp đồng \[Mã HĐ\]" | Làm mới khối Tự động gia hạn |
| Cảnh báo trước 7 ngày tự động gia hạn | Notification | "Hợp đồng \[Mã HĐ\] (\[Tên nhà thầu\]) sẽ tự động gia hạn thêm \[N\] tháng vào ngày \[ngày\]. Nếu không muốn gia hạn, vui lòng tắt tự động gia hạn trước ngày này" | Hiển thị notification kèm nút "Xem HĐ" \+ "Tắt tự động gia hạn" |
| Tự động gia hạn thành công (tác vụ tự động) | Notification | "Hợp đồng \[Mã HĐ\] (\[Tên nhà thầu\]) đã được tự động gia hạn đến \[ngày mới\]" | Hiển thị notification kèm nút "Xem HĐ" |

#### 

#### **3.2.5. Tích hợp & Đồng bộ dữ liệu**

[image1]: <data:image/png;base64,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>