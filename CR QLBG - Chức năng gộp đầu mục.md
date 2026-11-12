

# **Change Request \- CR**

### **1\. Thông tin Chung về Thay đổi**

| Mô tả | Trường |
| :---: | :---- |
| **ID Yêu cầu Thay đổi** | **CR\_20260916\_001** |
| **Ngày Đề xuất** | 16/08/2026 |
| **Người Đề xuất** | Đặng Thanh Sơn |
| **Loại Thay đổi** |  **Cải tiến** (Enhancement) |
| **Module Bị Ảnh hưởng** |  MODULE 2: Quản lý báo giá \- Báo giá khách hàng/ User story 8 |
| **Tác động Ưu tiên (MoSCoW)** | ***Should have***: Rất quan trọng, mang lại giá trị lớn, nhưng có thể tạm thời có **giải pháp thay thế** (workaround) và có thể trì hoãn nếu có xung đột về tài nguyên |

##### **User story 20: Gộp đầu mục doanh thu trên Báo giá khách hàng** 

| Mục | Mô tả |
| :---- | :---- |
| ID US | US\_BG\_20 |
| Tên Story | Gộp đầu mục doanh thu trên Báo giá khách hàng  |
| User Story | Là **Dịch vụ khách hàng**, tôi muốn **gộp nhiều đầu mục doanh thu (bao gồm cả đầu mục cố định và phụ phí) trong cùng một loại dịch vụ thành 1 dòng duy nhất**, để **đơn giản hóa bảng báo giá gửi khách hàng và sử dụng dòng gộp làm đơn vị thanh toán chính thức trên hóa đơn**. |
| Độ Ưu tiên | **Must have** |
| Module | Quản lý Báo giá |
| Người Phụ trách | Đặng Thanh Sơn (BA) |
| Ghi chú phạm vi | US này **thay thế toàn bộ** phần Gộp đầu mục tại AC2–AC4 của US\_BG\_08 và AC1–AC3 của US\_BG\_17. Các AC cũ liên quan đến gộp đầu mục trong 2 US trên không còn hiệu lực khi US\_BG\_20 được triển khai. |

##### Acceptance Criteria

| STT | Tiêu chí Chấp nhận (Acceptance Criteria — AC) | Điều kiện Thất bại (Negative Criteria — NC) |
| :---- | :---- | :---- |
| AC1 | **Kích hoạt Chế độ Gộp đầu mục:** Khi phiếu Báo giá khách hàng ở trạng thái **"Chờ xác nhận"** hoặc **"Đang hiệu lực"**, DVKH bấm nút **"Gộp đầu mục"** trên khối Báo giá chi tiết. Hệ thống chuyển sang *Chế độ Gộp dòng*: hiển thị cột Checkbox ở đầu **mỗi dòng đầu mục** (bao gồm cả dòng phân loại Cố định và phụ phí), đồng thời hiển thị dải băng Chế độ Gộp phía trên bảng. |  |
| AC2 | **Điều kiện tích chọn dòng gộp:** |  |
|  | \- DVKH tích chọn **tối thiểu 2 dòng** đầu mục trở lên thuộc **cùng một Loại dịch vụ** (ví dụ: cùng thuộc Khai báo hải quan, hoặc cùng thuộc Vận tải). | **NC1 (Không cho gộp 1 dòng):** Nếu DVKH chỉ tích chọn 1 dòng duy nhất, nút *"Gộp N đầu mục"* ở trạng thái **Vô hiệu hóa (Disable)**, không cho phép mở Popup gộp. |
|  | — Cho phép chọn **cả dòng Cố định và dòng phụ phí** trong cùng một loại dịch vụ. Không giới hạn phân loại. | **NC2 (Chặn gộp khác Loại dịch vụ):** Khi DVKH đã chọn ≥1 dòng thuộc Loại dịch vụ A, toàn bộ Checkbox của các dòng thuộc Loại dịch vụ khác (B, C…) tự động bị **khóa/vô hiệu hóa** kèm thông báo cảnh báo mềm: *"Chỉ được gộp các đầu mục thuộc cùng một loại dịch vụ"*. |
|  | — Khi chọn ≥2 dòng hợp lệ, dải băng cập nhật: *"Đã chọn N đầu mục thuộc \[Tên dịch vụ\]"* và kích hoạt nút **"Gộp N đầu mục"**. |  |
| AC3 | **Hộp thoại Popup Gộp đầu mục:** Bấm nút *"Gộp N đầu mục"*, hệ thống hiển thị Popup **"Xác nhận Gộp đầu mục — \[Tên dịch vụ\]"** gồm các thành phần: |  |
|  | **3.1. Cảnh báo gộp phụ phí (có điều kiện):** Khi nhóm gộp bao gồm ≥1 dòng phụ phí **và** ≥1 dòng Cố định, hiển thị Alert banner phía trên danh sách dòng con: *"⚠ Lưu ý: Bạn đang gộp đầu mục cố định và phụ phí. Đầu mục phụ phí sau khi gộp sẽ được tính như phí cố định trên báo giá và hóa đơn."* Cảnh báo dạng thông tin — không chặn thao tác. |  |
|  | **3.2. Danh sách dòng con:** Bảng read-only liệt kê chi tiết từng dòng được chọn, gồm các cột: STT, Tên đầu mục, Phân loại (Cố định/phụ phí), Đơn vị tính, Đơn giá. |  |
|  | **3.3. Trường "Tên đầu mục sau khi gộp":** Ô nhập văn bản, **bắt buộc nhập**, tối đa 255 ký tự, hỗ trợ tiếng Việt có dấu, chữ số và ký tự đặc biệt thông dụng. Placeholder gợi ý: *"Nhập tên hiển thị cho dòng gộp (Ví dụ: Trọn gói dịch vụ Khai báo hải quan)…"* | **NC3 (Bỏ trống tên đầu mục gộp):** Nếu DVKH bỏ trống ô Tên và bấm "Xác nhận gộp", hệ thống **chặn lưu**, hiển thị viền đỏ quanh ô nhập và dòng thông báo lỗi: *"Vui lòng nhập tên cho đầu mục sau khi gộp"*. |
|  | **3.4. Trường "Đơn vị tính" (ĐVT):** Dropdown **bắt buộc chọn**, dữ liệu lấy từ **danh mục cấu hình Đơn vị tính**.  **Quy tắc auto-fill:** Nếu tất cả dòng con cùng ĐVT → hệ thống tự động fill giá trị ĐVT đó (DVKH vẫn được phép đổi sang ĐVT khác). Nếu các dòng con có ≥2 ĐVT khác nhau → trường ĐVT để trống, hiển thị placeholder *"Chọn đơn vị tính"*, bắt buộc chọn trước khi xác nhận. | **NC4 (Bỏ trống ĐVT):** Nếu trường ĐVT chưa được chọn và bấm "Xác nhận gộp", hệ thống **chặn lưu**, hiển thị viền đỏ quanh dropdown ĐVT và dòng thông báo lỗi: *"Vui lòng chọn đơn vị tính cho đầu mục sau khi gộp"*. |
|  | **3.6. Trường "Phân loại" (read-only, tự động):** Hệ thống tự gán Phân loại cho dòng gộp theo quy tắc BR\_BG\_50: Gộp toàn Cố định → **Cố định**; Gộp Cố định \+ phụ phí → **Cố định**; Gộp toàn phụ phí → **phụ phí**. Hiển thị dạng Tag, DVKH không được sửa. |  |
|  | **3.9. Nút "Xác nhận gộp":** Validate 3 điều kiện (Tên không trống, ĐVT đã chọn, Đơn giá \> 0). Nếu hợp lệ → đóng Popup, thay thế các dòng được chọn bằng 1 dòng gộp duy nhất trên bảng Báo giá chi tiết. |  |
|  | **3.10. Nút "Đóng":** Đóng Popup, giữ nguyên danh sách dòng đã chọn trên bảng, không thực hiện gộp. |  |
| AC4 | **Hiển thị dòng đã gộp trên bảng Báo giá chi tiết:** |  |
|  | — Dòng gộp hiển thị: Tên mới kèm nhãn xanh **\[ ĐÃ GỘP \]**, Phân loại , Đơn vị, Thành tiền sau điều chỉnh, Thành tiền quy đổi. |  |
|  | — Cung cấp nút/text link **"Thu gọn / Mở rộng"** (hoặc biểu tượng mũi tên ▸/▾) để DVKH mở xem danh sách chi tiết các dòng con cấu thành bên dưới. Dòng con hiển thị mờ (text color nhạt), indent so với dòng gộp, ở chế độ read-only. |  |
|  | — Hệ thống lưu mapping **"Dòng gộp X \= Dòng con A \+ B \+ C"** phục vụ: xem chi tiết (Thu gọn/Mở rộng), hủy gộp (khôi phục dòng con),  |  |
| AC5 | **Thao tác Hủy gộp từng nhóm:** |  |
|  | — Trên mỗi dòng gộp (dòng có nhãn \[ ĐÃ GỘP \]), hiển thị nút **"Hủy gộp"**. |  |
|  | — Bấm "Hủy gộp" → hệ thống tách riêng nhóm gộp đó, khôi phục các dòng con gốc về vị trí cũ với đơn giá ban đầu (trước khi gộp). Các nhóm gộp khác trên cùng RC **không bị ảnh hưởng**. |  |
|  | — Dòng Footer (Tổng doanh thu, VAT, Tổng sau VAT) tự động tính lại sau khi hủy. |  |
| AC6 | **Thao tác Reset báo giá gốc (liên quan gộp):** |  |
|  | — Bấm nút **"Reset báo giá gốc"** trên dải băng Chế độ Gộp hoặc trên thanh Header → hệ thống khôi phục **toàn bộ**: tất cả các nhóm gộp bị tách, mọi điều chỉnh giá trở về bản gốc do K2 phát hành. |  |
| AC7 | **Lưu cấu hình gộp:** |  |
|  | — Bấm nút **"Lưu bản gộp"** → hệ thống ghi nhận cấu hình gộp hiện tại, áp dụng trực tiếp cho Biểu giá bán hiện tại. |  |
|  | — **Không sinh phiên bản (version) mới.** (Phân biệt với BR\_BG\_27 — gộp Báo giá bổ sung → CÓ tăng version.) |  |
|  | — Dòng gộp sau khi lưu được sử dụng làm căn cứ tạo Đơn hàng dịch vụ (Order) về sau và xuất hóa đơn cho khách hàng. |  |

##### Mô tả giao diện

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=10579-188174&t=UGOn82Tlep2NbFY8-4)

###### *1\. Dải băng Chế độ Gộp* 

Hiển thị khi DVKH bấm nút "Gộp đầu mục", nằm phía trên bảng Báo giá chi tiết.

| Thành phần | Kiểu | Mô tả & Quy tắc |
| :---- | :---- | :---- |
| Dòng thông tin | Text (động) | Cập nhật theo thao tác tích chọn: *"Đã chọn \[N\] đầu mục thuộc \[Tên dịch vụ\] — Tổng đơn giá: \[Số tiền\]"*. Khi chưa chọn dòng nào: *"Tích chọn tối thiểu 2 đầu mục cùng loại dịch vụ để gộp"*. |
| Nút "Gộp N đầu mục" | Nút bấm | Kích hoạt khi chọn ≥2 dòng cùng Loại dịch vụ. Bấm để mở Popup Gộp đầu mục. Vô hiệu hóa (Disabled) khi chọn \<2 dòng. |
| Nút "Hủy" | Nút bấm | Bấm để thoát Chế độ Gộp: ẩn cột Checkbox, ẩn dải băng, bỏ chọn tất cả. Không ảnh hưởng các nhóm gộp đã lưu trước đó. |
| Nút "Reset báo giá gốc" | Nút bấm | Bấm để khôi phục toàn bộ bảng giá về bản gốc K2: hủy tất cả nhóm gộp, khôi phục đơn giá và % điều chỉnh gốc. |

###### *2\. Popup Xác nhận Gộp đầu mục*

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả & Quy tắc nghiệp vụ |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tiêu đề Popup |  | Văn bản |  |  | "Xác nhận Gộp đầu mục — \[Tên dịch vụ\]" |
| Alert banner cảnh báo gộp phụ phí |  | Alert (có điều kiện) |  |  | Hiển thị **khi và chỉ khi** nhóm gộp chứa ≥1 dòng phụ phí VÀ ≥1 dòng Cố định. Nội dung: *"⚠ Lưu ý: Bạn đang gộp đầu mục cố định và phụ phí. Đầu mục phụ phí sau khi gộp sẽ được tính như phí cố định trên báo giá và hóa đơn."*  \- Không chặn thao tác. |
| Danh sách dòng đã chọn |  |  |  |  | Liệt kê các dòng được chọn gộp. bao gồm:  Tên đầu mục \-  \- Thành tiền sau điều chỉnh Thành tiền sau gộp |
| Đơn vị tính (ĐVT) |  | Text |  |  | **ĐVT** của đầu mục doanh thu |
| Phân loại |  | Tag (read-only, tự động) |  | Theo BR\_BG\_50 | Hệ thống tự gán: Toàn Cố định → **Cố định**; Cố định \+ phụ phí → **Cố định**; Toàn phụ phí → **phụ phí**. DVKH không được sửa. |
| Đơn giá |  | Number (read-only) |  |  | Lấy giá trị tại cột thành tiền sau điều chỉnh của dòng giá được gộp |
| Thành tiền |  | Number (read-only) | 15 chữ số |  | Tổng đơn giá của các đầu mục |
| Tên đầu mục sau khi gộp | **Có** | Ô nhập văn bản (Text) | 255 | (trống) | **Bắt buộc nhập.** Chuỗi ký tự văn bản hỗ trợ tiếng Việt có dấu, chữ số và ký tự đặc biệt thông dụng. Placeholder: *"Nhập tên hiển thị cho dòng gộp (Ví dụ: Trọn gói dịch vụ Khai báo hải quan)…"* |
| Đơn vị tính (ĐVT) | **Có** | Dropdown (search được) |  | Auto-fill nếu tất cả dòng con cùng ĐVT; trống nếu có ≥2 ĐVT khác nhau | **Bắt buộc chọn.** Dữ liệu lấy từ **danh mục cấu hình Đơn vị tính**. Khi trống: placeholder *"Chọn đơn vị tính"*. DVKH được phép đổi ĐVT kể cả khi hệ thống đã auto-fill. |
| Phân loại |  | Tag (read-only, tự động) |  | Theo BR\_BG\_50 | Hệ thống tự gán: Toàn Cố định → **Cố định**; Cố định \+ phụ phí → **Cố định**; Toàn phụ phí → **phụ phí**. DVKH không được sửa. |
| Đơn giá |  | Number (read-only) |  |  | Lấy giá trị tại cột thành tiền sau điều chỉnh của dòng giá được gộp |
| Thành tiền |  | Number (read-only) | 15 chữ số |  | Tổng đơn giá của các đầu mục |
| Nút "Xác nhận gộp" |  | Nút bấm |  |  | Validate: (1) Tên không trống, (2) ĐVT đã chọn, (3) Đơn giá \>= 0\. Nếu hợp lệ → đóng Popup, thay thế các dòng con bằng 1 dòng gộp trên bảng Báo giá chi tiết. |
| Nút "Đóng" |  | Nút bấm |  |  | Đóng Popup, giữ nguyên danh sách dòng đã chọn (Checkbox vẫn tích), không thực hiện gộp. |

###### *3\. Hiển thị dòng đã gộp trên bảng Báo giá chi tiết*

| Thành phần | Mô tả |
| :---- | :---- |
| Tên đầu mục | Tên mới do DVKH nhập \+ nhãn xanh **\[ ĐÃ GỘP \]** bên phải tên |
| Phân loại | Tag Cố định hoặc phụ phí — hệ thống tự gán theo BR\_BG\_50 (read-only) |
| Đơn vị | ĐVT mới do DVKH chọn từ Popup |
| Thành tiền sau điều chỉnh | Tổng của các dòng con trong đầu mục được gộp |
| Thành tiền quy đổi | Tổng của các dòng con trong đầu mục được gộp |
| Nút "Thu gọn / Mở rộng" | Icon mũi tên ▸/▾ hoặc text link.  Mở rộng: hiển thị danh sách dòng con bên dưới dòng gộp Thu gọn: ẩn danh sách dòng con. |
| Nút "Hủy gộp" | Hiển thị trên mỗi dòng gộp. Bấm → tách riêng nhóm gộp đó, khôi phục dòng con gốc. |

##### Quy tắc nghiệp vụ (Business Rules)

| Mã quy tắc | Tên & Nội dung quy tắc nghiệp vụ |
| :---- | :---- |
| **BR\_BG\_42** | **Quy tắc phạm vi phân loại khi gộp đầu mục:** Cho phép gộp cả đầu mục phân loại **Cố định** và **phụ phí** thuộc cùng một Loại dịch vụ vào chung một nhóm gộp. Khi nhóm gộp bao gồm ≥1 dòng phụ phí và ≥1 dòng Cố định, hệ thống hiển thị cảnh báo thông tin (Alert banner) trên Popup Gộp để DVKH xác nhận trước khi thao tác. Sau khi gộp, dòng phụ phí được ghi nhận như phí cố định trên báo giá và hóa đơn  |
| **BR\_BG\_43** | **Quy tắc chọn Đơn vị tính (ĐVT) khi gộp đầu mục:**  **1\.** DVKH bắt buộc chọn ĐVT cho dòng gộp từ trường Dropdown, dữ liệu lấy từ **danh mục cấu hình Đơn vị tính**.  **2\.** Quy tắc auto-fill: Nếu **tất cả** dòng con được chọn gộp có **cùng ĐVT** → hệ thống tự động fill giá trị ĐVT đó vào trường ĐVT trên Popup; DVKH vẫn được phép đổi sang ĐVT khác trong danh mục. Nếu các dòng con có **≥2 ĐVT khác nhau** → trường ĐVT để trống, bắt buộc DVKH chọn.  |
| **BR\_BG\_44** | **Quy tắc tính và điều chỉnh Đơn giá sau gộp:**  Đơn giá sau gộp \= ∑ Đơn giá bán (cột "Thành tiền sau điều chỉnh") của tất cả các dòng con được chọn gộp. Hệ thống tự tính và hiển thị.  |
| **BR\_BG\_45** | **Quy tắc cấu trúc thương mại của dòng gộp (Quotation \= Invoice):** Dòng gộp sau khi lưu là **đơn vị thanh toán chính thức**, áp dụng xuyên suốt: Báo giá khách hàng → Đơn hàng dịch vụ (Order) → Hóa đơn. Khi xuất file Báo giá (PDF/Excel) hoặc xuất hóa đơn, hệ thống sử dụng dòng gộp — **không tách lại dòng con trên chứng từ gửi khách**. Trên Order, K1 (Dịch vụ khách hàng) nhìn thấy **dòng gộp** — không hiển thị từng dòng con riêng lẻ ở phần doanh thu. Dòng con gốc chỉ hiển thị trong chức năng Thu gọn/Mở rộng trên màn hình Báo giá. |
| **BR\_BG\_46** | **Quy tắc lưu vết dòng con (Audit Trail):** Khi gộp thành công, hệ thống lưu mapping **"Dòng gộp X \= {Dòng con A, Dòng con B, Dòng con C,…}"** bao gồm đầy đủ: Mã đầu mục gốc, Tên, Phân loại (CĐ/PS), ĐVT gốc, Đơn giá gốc của từng dòng con.  Mapping này phục vụ: **(a)** Hiển thị chi tiết dòng con khi DVKH bấm "Mở rộng"; **(b)** Khôi phục dòng con khi DVKH bấm "Hủy gộp" |
| **BR\_BG\_47** | **Quy tắc Hủy gộp và Reset:**  **1\. Hủy gộp từng nhóm:** Bấm nút "Hủy gộp" trên một dòng gộp cụ thể → hệ thống chỉ tách nhóm gộp đó, khôi phục các dòng con gốc về vị trí cũ với đơn giá ban đầu (trước khi gộp). Các nhóm gộp khác trên cùng RC không bị ảnh hưởng. Dòng Footer tự động tính lại.  **2\. Reset toàn bộ:** Bấm nút "Reset báo giá gốc" → hệ thống khôi phục toàn bộ bảng giá về bản gốc do K2 phát hành: hủy tất cả nhóm gộp, khôi phục mọi dòng con, đưa đơn giá và % điều chỉnh về giá trị gốc.  |
| **BR\_BG\_48** | **Quy tắc phân quyền nút Gộp đầu mục theo trạng thái (bổ sung cho BR\_BG\_22):** Nút "Gộp đầu mục" khả dụng tại 2 trạng thái: **Chờ xác nhận** và **Đang hiệu lực**. Tại các trạng thái **Thất bại** và **Hết hiệu lực**, nút Gộp bị ẩn hoàn toàn — chỉ cho phép xem (bao gồm xem dòng gộp nếu có, ở chế độ read-only). |
| **BR\_BG\_49** | **Quy tắc gộp không sinh phiên bản:** Thao tác gộp đầu mục (bao gồm tạo dòng gộp, hủy gộp, reset) áp dụng trực tiếp lên Biểu giá bán hiện tại, **tuyệt đối không tăng version**. Phân biệt rõ với BR\_BG\_27 (gộp Báo giá bổ sung khi khách đồng ý → CÓ tăng version). |
| **BR\_BG\_50** | **Quy tắc xác định Phân loại (Cố định/phụ phí) cho dòng gộp:** Hệ thống tự động gán Phân loại cho dòng gộp dựa trên Phân loại của các dòng con cấu thành, theo bảng sau:  **(1)** Tất cả dòng con đều là **Cố định** → Dòng gộp \= **Cố định**.  **(2)** Gộp hỗn hợp **Cố định \+ phụ phí** → Dòng gộp \= **Cố định**.  **(3)** Tất cả dòng con đều là **phụ phí** → Dòng gộp \= **phụ phí**. |
| **BR\_BG\_51** | **Quy tắc áp dụng báo giá cho Đơn hàng dịch vụ (Order) khi có thay đổi gộp:**  **(1)** Order đã tạo trước khi thay đổi gộp trên RC: **giữ nguyên** theo cấu trúc báo giá tại thời điểm tạo Order — không tự động cập nhật theo cấu hình gộp mới. **(2)** Order tạo mới sau khi thay đổi gộp: **áp dụng** cấu trúc báo giá mới nhất (bao gồm dòng gộp, ĐVT mới, đơn giá sau gộp) làm căn cứ doanh thu. |

---

##### Danh sách thông báo và lỗi

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| DVKH tích chọn dòng thuộc Loại dịch vụ khác khi đã có dòng thuộc Loại dịch vụ A đang được chọn | Cảnh báo | "Chỉ được gộp các đầu mục thuộc cùng một loại dịch vụ" | Vô hiệu hóa Checkbox của các dòng dịch vụ khác loại, giữ nguyên các dòng đã chọn thuộc dịch vụ A |
| Nhóm gộp chứa ≥1 dòng phụ phí VÀ ≥1 dòng Cố định → hiển thị trên Popup | Cảnh báo (Alert banner) | "⚠ Lưu ý: Bạn đang gộp đầu mục cố định và phụ phí. Đầu mục phụ phí sau khi gộp sẽ được tính như phí cố định trên báo giá và hóa đơn." | Hiển thị Alert banner phía trên danh sách dòng con trên Popup. Không chặn thao tác — DVKH bấm "Xác nhận gộp" để tiếp tục |
| Bỏ trống ô "Tên đầu mục sau khi gộp" khi bấm "Xác nhận gộp" | Lỗi | "Vui lòng nhập tên cho đầu mục sau khi gộp" | Chặn gộp, hiển thị viền đỏ quanh ô nhập tên |
| Chưa chọn ĐVT khi bấm "Xác nhận gộp" | Lỗi | "Vui lòng chọn đơn vị tính cho đầu mục sau khi gộp" | Chặn gộp, hiển thị viền đỏ quanh dropdown ĐVT |
| Bấm "Xác nhận gộp" thành công (Popup đóng) | Thành công | "Gộp đầu mục thành công.." | Đóng Popup, thay thế các dòng con bằng 1 dòng gộp trên bảng, cập nhật Footer |
| Bấm "Lưu bản gộp" thành công | Thành công | "Lưu cấu hình báo giá thành công " | Ghi nhận cấu hình gộp, cập nhật bảng đơn giá và Footer trực tiếp. Không sinh phiên bản mới |
| Bấm "Hủy gộp" trên 1 dòng gộp cụ thể | Thành công | "Đã hủy gộp đầu mục . Các dòng con đã được khôi phục." | Tách nhóm gộp, khôi phục dòng con gốc, cập nhật Footer |
| Bấm "Reset báo giá gốc" thành công | Thành công | "Đã khôi phục toàn bộ báo giá về bản gốc của bộ phận Định giá." | Hủy tất cả nhóm gộp, khôi phục đơn giá và % điều chỉnh gốc, cập nhật Footer |

