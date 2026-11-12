TÀI LIỆU ĐẶC TẢ YÊU CẦU HỆ THỐNG (SRS)

MODULE TỔNG HỢP CHI PHÍ – DOANH THU

 

 

| Thuộc tính | Giá trị |
| ----- | ----- |
| **Tên module** | Chi phí – Doanh thu |
| **Phân hệ liên quan** | v1.1 |
| **Phiên bản** | v1.0 |
| **Ngày phát hành** | 02/10/2026 |
| **Người phụ trách** | Trang BA |

 

###  

###  **BẢNG THUẬT NGỮ (GLOSSARY)**

| Viết tắt / Thuật ngữ | Giải thích |
| ----- | ----- |
| **K1** | Phân hệ Quản lý Dịch vụ / CSKH — Quản lý Doanh thu bán ra (Revenue) |
| **K2** | Phân hệ Pricing — Định giá gốc và Biểu giá bán định mức |
| **K3** | Tháp Điều Phối (Control Tower) — Quản lý vận hành & Chi phí mua thực tế (Cost) |
| **K4** | Phân hệ Quản lý Cung ứng & Bảng giá Nhà thầu AVL |
| **K5** | Phân hệ Tài chính & Kiểm soát Công nợ — Quyết toán và Chốt sổ vĩnh viễn |
| **P\&L** | *Profit & Loss* — Bảng tổng hợp Doanh thu, Chi phí và Lợi nhuận gộp |
| **Gross Profit** | Lợi nhuận gộp (Doanh thu − Chi phí) |
| **Margin (%)** | Tỷ lệ Lợi nhuận gộp / Doanh thu (tính theo %) |
| **ORD** | *Service Order* — Mã Phiếu dịch vụ  (VD: ORD261010-045) |
| **SSOT** | *Single Source of Truth* — Nguồn dữ liệu gốc duy nhất |
| **Rate Card (RC)** | Báo giá khách hàng chính thức từ K1 |
| **Rate Sheet (RS)** | Bảng giá mua thỏa thuận với nhà thầu từ K4 |

#  

# **PHẦN I: TỔNG QUAN & PHẠM VI**

## **1.1. Mục tiêu Module**

Module **Tổng hợp Chi phí – Doanh thu (P\&L)** đóng vai trò  **Tính toán Tài chính Vận hành Real-time (Real-time Operational P\&L Engine)** cho toàn bộ hệ thống LogXPro. Module này tự động đối soát và hợp nhất **Doanh thu bán ra (kế thừa từ K1)** với **Chi phí mua nhà thầu (kế thừa từ K3)** theo từng Phiếu dịch vụ (ORD), đồng thời tự động phân rã chỉ số Lợi nhuận gộp (*Gross Profit*) và Biên lợi nhuận (*Margin %*) theo từng **Chặng hành trình (Leg)** và từng **Dịch vụ con** (Khai báo Hải quan, HQ Giám sát, Vận tải, Sang tải, Kho bãi).

## **1.2. Phạm vi Hệ thống (System Scope)**

### **Trong phạm vi (In-scope):**

1. **Tính toán P\&L Đa cấp độ:** Bảng tổng hợp P\&L ở 3 cấp độ: *Toàn Phiếu dịch vụ (ORD)*, *Theo từng Chặng (Leg)*, và *Theo từng Dịch vụ con*.  
2. **Đồng bộ Dữ liệu Tự động (Real-time Sync):**

   ○ 	**Doanh thu (Revenue):** Tự động kế thừa từ Bảng doanh thu của Phiếu dịch vụ ở Khối 1\.

   ○ 	**Chi phí (Cost):** Tự động kế thừa từ Bảng Chi phí Nhà thầu AVL ở Khối 3 (bao gồm Chi phí cố định \+ Phụ phí \+ Chi phí phát sinh).

3. **Cảnh báo Lợi nhuận & Biên độ An toàn (Margin Warning):**

   ○ 	Cảnh báo mềm khi Margin % rơi xuống dưới ngưỡng an toàn (mặc định \< 10%).

   ○ 	Cảnh báo đỏ khi P\&L bị **Âm (Lỗ)**.

4. **Xuất báo cáo P\&L:** Cho phép kết xuất Báo cáo P\&L chi tiết dưới định dạng Excel (.xlsx) và PDF.

   ### **Ngoài phạm vi (Out-of-scope):**

1. Quản lý Báo cáo Tài chính Kế toán tổng thể (Bảng Cân đối kế toán, Sổ cái, Công nợ chu kỳ K5).  
2. Phân bổ chi phí quản lý doanh nghiệp gián tiếp (Chi phí khấu hao, Lương cố định, Chi phí văn phòng \- OPEX/CAPEX).  
3. Điều chỉnh Báo giá gốc/Bảng doanh thu của K1 hay Bảng giá AVL của K4.  
4. **Đóng băng Snapshot P\&L Quyết toán (K5 Handoff):** Tự động chốt và đóng băng toàn bộ số liệu P\&L khi K5 bấm *Xác nhận doanh thu* để chuyển đơn hàng sang trạng thái Hoàn thành.  
5. **Phân quyền Xem P\&L theo Vai trò (RBAC):** Phân định hiển thị P\&L linh hoạt theo vai trò (CC xem toàn phiếu, Coordinators chỉ xem chi phí phần việc phụ trách, K1 xem Doanh thu & Margin tổng, K5 xem toàn bộ P\&L quyết toán).

## **1.3. Sơ đồ Luồng Nghiệp vụ (Business Process Flow)**

[Link](https://app.diagrams.net/?splash=0#G121K8br0_3hoWh4lMxNoH2pM-j_OL1WMs#%7B%22pageId%22%3A%22D8i12cJKUzRyePgcrNSN%22%7D)  
   
   
Bảng Mô tả Luồng Xử lý Dữ liệu P\&L:

| STT | Tên bước | Actor / Hệ thống | Mô tả chi tiết | Input | Output | Quy tắc & Điều kiện |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **B1** | **Khởi tạo P\&L Dự kiến** | Hệ thống (Auto) | Ngay khi K1 gửi Phiếu DV sang K3 (Tạo mới), hệ thống nạp Doanh thu bán gốc từ Báo giá. | Thông tin Báo giá RC từ K1 | Doanh thu dự kiến | Doanh thu \= $\sum\limits_{}^{}$ (SL dự kiến $\times$ Đơn giá bán gốc) |
| **B2** | **Cập nhật Chi phí Mua** | Coordinators (K3) | Coordinator gán nhà thầu AVL và nhập Phụ phí/Phát sinh. | Bảng giá AVL \+ Phụ phí | Chi phí mua thực tế | Chi phí \= $\sum\limits_{}^{}$ (SL thực tế $\times$ Đơn giá mua \+ Phụ phí) |
| **B3** | **Tính toán P\&L Real-time** | Engine P\&L (Auto) | Hệ thống tự động tính lại Lợi nhuận gộp và Margin % mỗi khi Chi phí hoặc SL thay đổi. | Doanh thu \+ Chi phí thực tế | P\&L & Margin % hiện tại | P\&L= Doanh thu \- Chi phí Margin% \= (P\&L / Doanh thu) x 100% |
| **B4** | **Kiểm tra Cảnh báo Rủi ro** | Engine P\&L (Auto) | Quét tỷ lệ Margin %. Nếu Margin $<10%$ hoặc $P&L<0$, hệ thống gắn Badge cảnh báo. | Tỷ lệ Margin % | Badge Cảnh báo P\&L | Hiển thị Warning màu Cam (Margin thấp) hoặc Đỏ (P\&L Âm) |
| **B5** | **Đóng băng P\&L Quyết toán** | Kiểm soát Công nợ (K5) | K5 đối soát và bấm *Xác nhận doanh thu* (Hoàn thành). | Toàn bộ dữ liệu P\&L | Snapshot P\&L Bất biến | Chuyển P\&L sang Read-only vĩnh viễn, không cho sửa |

 

# **PHẦN 2: ĐẶC TẢ YÊU CẦU HỆ THỐNG**

## **2.1. MODULE 1: Quản lý dịch vụ K1**

### **2.1.1. Danh sách User story**

* **Must have:** bắt buộc để sản phẩm hoạt động / tuân thủ pháp luật-hợp đồng → Sprint hiện tại/kế tiếp.

* **Should have:** quan trọng, có thể tạm workaround → đưa vào Sprint nếu còn năng lực sau P1.

* **Could have:** mong muốn, cải thiện trải nghiệm → làm khi dư buffer hoặc sprint sau.

#### **User story: Xem tổng quan P\&L của Phiếu dịch vụ**

| Mục | Mô tả |
| :---- | :---- |
| ID US | US\_CPDT\_01 |
| Tên Story | Xem tổng quan P\&L của Phiếu dịch vụ |
| User Story | Là Điều phối viên / Trưởng nhóm CC, tôi muốn xem nhanh tổng doanh thu, tổng chi phí, lợi nhuận gộp và biên lợi nhuận của Phiếu dịch vụ, để đánh giá ngay hiệu quả của phiếu mà không phải tính thủ công. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Chi phí – Doanh thu |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Bắt đầu hiển thị nội dung tab khi chặng được xác nhận. Trước khi xác nhận chặng, tab trống thông tin. Mở tab → hiển thị header: Mã Phiếu dịch vụ, Khách hàng, Điểm đi – Điểm đến. | Không có quyền xem phiếu → thông báo lỗi, không hiển thị dữ liệu. |
| 2 | Hiển thị 4 thẻ KPI: Tổng doanh thu quy đổi, Tổng chi phí quy đổi, Tổng lợi nhuận gộp (P\&L), Biên lợi nhuận (Margin); đơn vị VND, phân cách hàng nghìn bằng dấu chấm. | Phiếu chưa phát sinh chi phí/doanh thu → các thẻ hiển thị 0, kèm thông báo thông tin. |
| 3 | Giá trị KPI \= tổng của các chặng, khớp với bảng chi tiết (BR-05). | Có dòng ngoại tệ chưa có tỷ giá → KPI hiển thị "—" kèm cảnh báo thiếu tỷ giá (BR-17). |
| 4 | P\&L dương hiển thị dấu "+" màu xanh; P\&L âm hiển thị dấu "−" màu đỏ. | — |
| 5 | Thẻ Margin hiển thị ngưỡng chuẩn (CHUẨN \>= 10%) và nhãn đánh giá (BR-06, BR-07). | Doanh thu quy đổi \= null / Chi phí \= 0 → Margin hiển thị "—", không chia cho 0 (BR-04). |

#### **User story: Xem bảng phân tích P\&L chi tiết theo chặng & dịch vụ con \[PHỨC TẠP\]**

| Mục | Mô tả |
| :---- | :---- |
| ID US | US\_CPDT\_02 |
| Tên Story | Xem bảng phân tích P\&L chi tiết theo chặng & dịch vụ con |
| User Story | Là Điều phối viên / Trưởng nhóm CC / Kế toán, tôi muốn xem doanh thu, chi phí, lợi nhuận và margin theo từng chặng, dịch vụ và dịch vụ con, để biết chính xác dịch vụ hoặc nhà thầu nào tạo lãi hay gây lỗ. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Chi phí – Doanh thu |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Bảng hiển thị 3 cấp: Chặng → Dịch vụ (nhãn "Tổng hợp") → Dịch vụ con, đủ 7 cột theo mục 2.1.3. | Bảng hiện không đủ 3 cấp |
| 2 | Dòng Dịch vụ con hiển thị: tên, Nhà thầu thực hiện, Doanh thu, Chi phí gốc kèm mã tiền tệ, Chi phí quy đổi (VND), Lợi nhuận, Ghi chú. Chỉ lấy thông tin đầu mục giá, doanh thu, chi phí gốc khi dịch vụ ở trạng thái Đã thực hiện | Dịch vụ con chưa có nhà thầu → cột Nhà thầu AVL hiển thị "Chưa gán", ghi chú cảnh báo. |
| 3 | Dòng Dịch vụ và dòng Chặng: cột Gốc hiển thị "–"; cột Quy đổi, P\&L \= tổng cấp dưới; (BR-05). | — |
| 4 | Tên dài (nhà thầu, dịch vụ con) bị cắt "..." và hiện tooltip đầy đủ khi rê chuột. | — |
| 5 | Với các cột doanh thu và chi phí gốc của đầu mục, hiển thị bên dưới giá trị kèm thị mã dòng giá của báo giá khách hàng và bảng giá mua đầu vào | — |
| 6 | Tab chỉ xem: không có thao tác sửa số liệu trên bảng (BR-15). | Click vào ô số liệu → không mở chế độ sửa. |
| 7 | Không có quyền xem Tổng hợp chi phí \- Doanh thu, người dùng không nhìn thấy tab Chi phí \- Doanh thu | Không có quyền vẫn xem được tab và thông tin tab |

**▸ Use Case chi tiết UC\_CPDT\_01 — Tổng hợp & hiển thị bảng phân tích P\&L**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | \- Điều phối viên (ĐPV) \- Trưởng nhóm CC \- Kế toán |
| Actor phụ | \- Hệ thống LogX (tính toán) \- Module Chi phí, Doanh thu \- Cấu hình chặng \- Quản lý giá (Giá mua định mức, Giá bán định mức) |
| Precondition | \- Người dùng đã đăng nhập, có quyền xem Phiếu dịch vụ \- Phiếu dịch vụ đã tạo, có ít nhất 1 dịch vụ |
| Trigger | Người dùng chọn tab "Chi phí – Doanh thu" hoặc click Làm mới |
| Luồng chính (Main flow) | 1\. Hệ thống lấy danh sách chặng của phiếu. 2\. Lấy dịch vụ, dịch vụ con theo từng chặng. 3\. Lấy Chi phí, Doanh thu gốc của từng dịch vụ con. 4\. Lấy tỷ giá đang lưu trên Phiếu dịch vụ. 5\. Quy đổi từng dòng về VND (BR-01, BR-02). 6\. Tính P\&L từng dòng (BR-03, BR-04). 7\. Cộng dồn Dịch vụ → Chặng → KPI (BR-05). 8\. Sinh Ghi chú & cảnh báo (BR-06, BR-07, BR-20). 9\. Hiển thị KPI và bảng; mặc định mở rộng tất cả chặng. |
| Luồng thay thế (Alternative) | 3a. Tiền tệ gốc là VND → tỷ giá \= 1, tiếp bước 6\. 4a. Phiếu đã xác nhận doanh thu: 4a1. Dùng số liệu quy đổi đã chốt, không quy đổi lại. 4a2. Hiển thị nhãn "Đã chốt số liệu" cạnh tiêu đề, tiếp bước 9\. |
| Luồng ngoại lệ (Exception) | 1a. Không tải được dữ liệu → thông báo lỗi, hiển thị nút Thử lại. 3b. Dịch vụ con chưa có chi phí hoặc doanh thu → ô tương ứng "–", ghi chú "Chưa ghi nhận". 5a. Thiếu tỷ giá cho tiền tệ gốc → cột Quy đổi "—", tổng cấp trên "—", cảnh báo thiếu tỷ giá (BR-17). |
| Postcondition | \- KPI và bảng P\&L hiển thị, số liệu các cấp khớp nhau \- Không thay đổi dữ liệu nghiệp vụ |
| Business Rules liên quan | BR-01, BR-02, BR-03, BR-04, BR-05, BR-06, BR-07, BR-14, BR-15, BR-16, BR-17, BR-19, BR-20 |

#### **User story: Mở rộng / thu gọn bảng phân tích**

| Mục | Mô tả |
| :---- | :---- |
| ID US | US\_CPDT\_03 |
| Tên Story | Mở rộng / thu gọn bảng phân tích |
| User Story | Là người dùng tab, tôi muốn mở rộng hoặc thu gọn từng chặng và toàn bộ bảng, để tập trung vào phần cần phân tích khi phiếu có nhiều chặng. |
| Độ Ưu tiên (MoSCoW) | Could have |
| Module | Chi phí – Doanh thu |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Click mũi tên ở dòng Chặng → ẩn/hiện các dòng Dịch vụ thuộc chặng; dòng Chặng vẫn hiển thị số tổng. | — |
| 2 | Click "Mở tất cả" → mở toàn bộ chặng và dịch vụ. | Bảng không có dữ liệu → nút "Mở tất cả", "Thu gọn" bị vô hiệu hóa. |
| 3 | Click "Thu gọn" → chỉ còn các dòng Chặng. | — |
| 4 | Trạng thái mở/thu gọn được giữ khi Làm mới dữ liệu trong cùng phiên. | — |

#### **User story: Cảnh báo biên lợi nhuận**

| Mục | Mô tả |
| :---- | :---- |
| ID US | US\_CPDT\_04 |
| Tên Story | Cảnh báo biên lợi nhuận và doanh thu |
| User Story | Là Trưởng nhóm CC, tôi muốn dòng có margin dưới ngưỡng hoặc âm được đánh dấu nổi bật tại ghi chú, để xử lý kịp thời trước khi xác nhận doanh thu. |
| Độ Ưu tiên (MoSCoW) | Should have |
| Module | Chi phí – Doanh thu |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Nội dung Ghi chú cho dòng Cấp 1 Đầu mục giá:  nếu có doanh thu (có dòng giá tương ứng trong báo giá & trạng thái Đang hiệu lực), hiển thị ghi chú “Đã có báo giá” nếu có doanh thu (có dòng giá tương ứng trong báo giá & trạng thái Hết hạn), hiển thị ghi chú “Hết hạn báo giá” nếu chưa có doanh thu (không có dòng giá tương ứng trong báo giá), hiển thị Ghi chú “Chưa có báo giá” | Hiển thị sai hoặc không hiển thị nội dung ghi chú |
| 2 | Nội dung Ghi chú cho dòng Cấp 2 Dịch vụ: Margin \= Lợi nhuận / Chi phí x 100% (%) Margin ≥ 10% → badge màu xanh; Ghi chú hiển thị nhãn "An toàn" (BR-06). 0% ≤ Margin \< 10% → Cột Ghi chú hiển thị cảnh báo kèm badge màu vàng, nhãn "Dưới chuẩn" (BR-07). Margin \< 0% → cột Ghi chú hiển thị số tiền lỗ kèm badge màu đỏ, nhãn "Lỗ"(BR-07). | Hiển thị sai hoặc không hiển thị nội dung ghi chú |

#### **User story: Quy đổi tiền tệ \[PHỨC TẠP\]**

| Mục | Mô tả |
| :---- | :---- |
| ID US | US\_CPDT\_05 |
| Tên Story | Quy đổi tiền tệ |
| User Story | Là Điều phối viên / Kế toán, tôi muốn chọn nguồn tỷ giá và cập nhật tỷ giá USD→VND, CNY→VND cho Phiếu dịch vụ, để toàn bộ chi phí, doanh thu ngoại tệ được quy đổi thống nhất về VND trước khi xác nhận doanh thu. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Chi phí – Doanh thu |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Click "Tỷ giá quy đổi" → mở popup "Chức năng quy đổi tiền tệ" gồm: Tiền tệ quy đổi, Nguồn tỷ giá, Tỷ giá USD → VND, Tỷ giá CNY → VND. | Phiếu đã xác nhận doanh thu → popup ở chế độ chỉ xem, hiển thị tỷ giá đã chốt (BR-14). |
| 2 | Tiền tệ quy đổi luôn \= VND, chỉ xem (BR-09). | — |
| 3 | Chọn Nguồn tỷ giá \= Vietcombank → hệ thống tự lấy tỷ giá, 2 ô tỷ giá chỉ xem, hiển thị thời điểm lấy (BR-11). | API Vietcombank lỗi/timeout → thông báo lỗi, giữ tỷ giá đang lưu, gợi ý chọn Nhập tay. |
| 4 | Chọn Nguồn tỷ giá \= Nhập tay → cho phép nhập 2 ô tỷ giá (BR-12). | Để trống, ≤ 0 hoặc sai định dạng → báo lỗi tại trường, không cho áp dụng. |
| 5 | Click "Áp dụng" → lưu nguồn, tỷ giá vào Phiếu dịch vụ; tính lại toàn bộ cột Quy đổi, P\&L, Margin; thông báo thành công (BR-13). | Chưa chọn nguồn tỷ giá → báo lỗi "Vui lòng chọn nguồn tỷ giá". |
| 6 | Mở lại popup → hiển thị nguồn và tỷ giá đã lưu trên phiếu. | Phiếu chưa từng lưu tỷ giá → các trường hiển thị "—"; cột Quy đổi của dòng ngoại tệ hiển thị "—". |
| 7 | Phiếu được xác nhận doanh thu → chốt tỷ giá, cột Quy đổi, P\&L, Margin; nút "Tỷ giá quy đổi" chuyển chế độ chỉ xem (BR-14). | Áp dụng tỷ giá khi phiếu vừa được người khác xác nhận doanh thu → từ chối lưu, thông báo, tải lại dữ liệu. |
| 8 | Được phân quyền Cập nhật tỷ giá DT \- CP, hệ thống hiển thị nút Quy đổi tiền tệ & người dùng có thể cập nhật tỷ giá (BR-21). | Không được phân quyền vẫn có thể cập nhật tỷ giá. |

**▸ Use Case chi tiết UC\_CPDT\_02 — Cập nhật tỷ giá quy đổi cho Phiếu dịch vụ**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Kế toán (BR-21) |
| Actor phụ | \- Vietcombank (API tỷ giá) \- Hệ thống LogX (tính toán, lưu lịch sử) |
| Precondition | \- Người dùng có quyền cập nhật tỷ giá \- Phiếu dịch vụ chưa xác nhận doanh thu |
| Trigger | Người dùng click nút "Tỷ giá quy đổi" trên tab |
| Luồng chính (Main flow) | 1\. Hệ thống mở popup: Tiền tệ quy đổi \= VND (chỉ xem), nguồn & tỷ giá đang lưu. 2\. Người dùng chọn Nguồn tỷ giá \= Vietcombank. 3\. Hệ thống gọi API Vietcombank, điền tỷ giá USD→VND, CNY→VND (chỉ xem). 4\. Người dùng click "Áp dụng". 5\. Hệ thống kiểm tra phiếu chưa xác nhận doanh thu. 6\. Lưu nguồn, tỷ giá, thời điểm vào Phiếu dịch vụ; ghi lịch sử (BR-18). 7\. Tính lại cột Quy đổi, P\&L, Margin, KPI. 8\. Đóng popup, thông báo thành công. |
| Luồng thay thế (Alternative) | 1a. Phiếu đã xác nhận doanh thu → popup chỉ xem, kết thúc use case. 2a. Người dùng chọn Nguồn tỷ giá \= Nhập tay: 2a1. Hai ô tỷ giá cho phép nhập. 2a2. Người dùng nhập tỷ giá USD→VND, CNY→VND. 2a3. Quay lại bước 4\. 4a. Người dùng click "Hủy" → đóng popup, không thay đổi dữ liệu. |
| Luồng ngoại lệ (Exception) | 2a2a. Tỷ giá trống, ≤ 0 hoặc sai định dạng → báo lỗi tại trường, khóa nút "Áp dụng". 3a. API Vietcombank lỗi/timeout → thông báo lỗi, giữ tỷ giá cũ, gợi ý Nhập tay. 5a. Phiếu vừa được xác nhận doanh thu → từ chối lưu, thông báo, tải lại dữ liệu. 6a. Lỗi lưu dữ liệu → thông báo lỗi, không tính lại số liệu. |
| Postcondition | \- Thành công: tỷ giá mới lưu trên phiếu, toàn bộ số liệu quy đổi được cập nhật \- Hủy/Thất bại: dữ liệu giữ nguyên |
| Business Rules liên quan | BR-09, BR-10, BR-11, BR-12, BR-13, BR-14, BR-17, BR-18, BR-21 |

#### **User story: Xuất dữ liệu Excel**

| Mục | Mô tả |
| :---- | :---- |
| ID US | US\_CPDT\_06 |
| Tên Story | Xuất dữ liệu Excel |
| User Story | Là Kế toán / Trưởng nhóm CC, tôi muốn xuất bảng P\&L của Phiếu dịch vụ ra Excel, để đối soát, lưu trữ và báo cáo ngoài hệ thống. |
| Độ Ưu tiên (MoSCoW) | Should have |
| Module | Chi phí – Doanh thu |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Click "Xuất dữ liệu Excel" → tải file .xlsx; tên file: LogX\_CPDT\_\<Mã phiếu\>\_\<yyyyMMddHHmm\>.xlsx. | Lỗi tạo file → thông báo lỗi, không tải file. |
| 2 | File gồm: thông tin chung phiếu, 4 KPI, bảng chi tiết đủ 7 cột theo cấu trúc Phiếu → Chặng → Dịch vụ. | — |
| 3 | File ghi kèm nguồn tỷ giá, tỷ giá áp dụng. | — |
| 4 | Xuất toàn bộ dòng, không phụ thuộc trạng thái mở/thu gọn trên màn hình. | — |
| 5 | Cột số liệu xuất dạng số (không phải text) để tính toán được trong Excel. | — |
| 6 | Chỉ xuất các cột người dùng có quyền xem Tổng hợp doanh thu \- chi phí (BR-16). | Phiếu chưa có dữ liệu → nút bị vô hiệu hóa. |

#### **User story: Làm mới dữ liệu**

| Mục | Mô tả |
| :---- | :---- |
| ID US | US\_CPDT\_07 |
| Tên Story | Làm mới dữ liệu |
| User Story | Là người dùng tab, tôi muốn làm mới dữ liệu, để thấy ngay chi phí, doanh thu vừa cập nhật tại Dịch vụ mà không phải tải lại trang. |
| Độ Ưu tiên (MoSCoW) | Could have |
| Module | Chi phí – Doanh thu |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Click biểu tượng làm mới → tải lại dữ liệu, tính lại theo tỷ giá đang lưu; hiển thị trạng thái đang tải. | Lỗi kết nối → thông báo lỗi, giữ dữ liệu đang hiển thị. |
| 2 | Phiếu đã xác nhận doanh thu → làm mới không thay đổi số liệu quy đổi đã chốt. | — |
| 3 | Nút bị khóa trong lúc đang tải để tránh click liên tục. | — |

### **2.1.2. Business Rules**

**BR-PL-01: Công thức Tính toán P\&L Chuẩn Toàn Hệ thống**

* BR-02: Chi phí quy đổi \= Chi phí gốc × Tỷ giá (tiền tệ gốc → VND).

* BR-03: P\&L \= Doanh thu quy đổi − Chi phí quy đổi.

* BR-04: Margin % \= P\&L ÷ Doanh thu quy đổi × 100; Doanh thu quy đổi \= 0 → hiển thị "—". Làm tròn 1 chữ số thập phân.

* BR-05: Số liệu cộng dồn Dịch vụ → Chặng → KPI phiếu; Margin cấp tổng hợp tính lại từ tổng, không lấy trung bình.

* BR-06: Ngưỡng margin chuẩn ≥ 10%; đạt ngưỡng → nhãn "An toàn" (xanh).

* BR-07: 0% ≤ Margin \< 10% → "Dưới chuẩn" (vàng); Margin \< 0% → "Lỗ" (đỏ).

* BR-08: Ngưỡng margin mặc định 10%.

* BR-09: Tiền tệ quy đổi cố định là VND, chỉ xem.

* BR-10: Nguồn tỷ giá gồm 2 giá trị: Vietcombank, Nhập tay.

* BR-11: Nguồn Vietcombank → tỷ giá lấy tự động, không cho sửa.

* BR-12: Nguồn Nhập tay → tỷ giá bắt buộc, \> 0\. Tối đa 2 chữ số thập phân.

* BR-13: Tỷ giá được lưu vào Phiếu dịch vụ và áp dụng thống nhất cho toàn bộ dòng Chi phí, Doanh thu của phiếu.

* BR-14: Khi Phiếu dịch vụ được xác nhận doanh thu → chốt tỷ giá, cột Quy đổi, P\&L, Margin; không cho cập nhật tỷ giá.

* BR-15: Tab chỉ xem; Chi phí, Doanh thu gốc được nhập/sửa tại Dịch vụ tương ứng của Phiếu dịch vụ.

* BR-16: Quyền xem áp theo tài khoản đăng nhập. Tài khoản không có quyền xem Tổng hợp doanh thu \- chi phí → ẩn tab Doanh thu \- Chi phí.

* BR-17: Dòng có tiền tệ gốc khác VND/USD/CNY hoặc chưa có tỷ giá → cột Quy đổi "—", tổng cấp trên "—", hiển thị cảnh báo thiếu tỷ giá.

* BR-18: Mỗi lần thay đổi tỷ giá được ghi log hệ thống: người thực hiện, thời điểm, nguồn, giá trị cũ/mới.

* BR-21: Được phân quyền Cập nhật tỷ giá DT \- CP, hệ thống hiển thị nút Quy đổi tiền tệ & người dùng có thể cập nhật tỷ giá.

  ### **2.1.3. Mô tả giao diện**

**Tab Doanh thu \- Chi phí (P\&L)**

Giao diện Tab **"Chi phí – Doanh thu (P\&L)"** trên Chi tiết Phiếu dịch vụ (ORD) bao gồm **Khối Tổng hợp P\&L Toàn phiếu** và **Bảng Phân tích P\&L Chi tiết theo Chặng & Dịch vụ con**.

| STT | Tên trường thông tin | Kiểu dữ liệu | Default | Mô tả & Ràng buộc nghiệp vụ |
| :---- | :---- | :---- | :---- | :---- |
| **Thông số tài chính & Nút chức năng** |  |  |  |  |
| 1 | Tổng doanh thu  | Card KPI | — | \= Tổng \[Doanh thu\] của dịch vụ (Đã bao gồm VAT \[thuế suất VAT\] %) |
| 2 | Tổng chi phí | Card KPI | — | \= Tổng \[Quy đổi chi phí\] của tất cả dịch vụ trong tất cả các chặng |
| 3 | Lợi nhuận | Card KPI | — | \= Tổng doanh thu \- Tổng chi phí  \= (Tổng doanh thu \- Tổng chi phí)/Tổng doanh thu x 100% (%) |
| 4 | Trạng thái xác nhận | Card KPI | — | \= Đã xác nhận/Chưa xác nhận doanh tuh (Trạng thái xác nhận doanh thu) |
| **Nút thao tác** |  |  |  |  |
| 5 | Quy đổi tiền tệ | Button | Tỷ giá VCB | Nhấn vào hiển thị poppup Quy đổi tiền tệ |
| 6 | Nút Xuất dữ liệu | Button | — | Cho phép kết xuất Bảng P\&L Phiếu dịch vụ ra file Excel (.xlsx). |
| 7 | Nút Refresh dữ liệu | Button  | — | Làm mới tức thì số liệu P\&L khi doanh thu hoặc chi phí được điều chỉnh |
| **Thông tin Tỷ giá quy đổi** |  |  |  |  |
| 8 | Nguồn tỷ giá | Text | Default: Tỷ giá VCB | Mặc định: Tỷ giá VCB |
| 9 | Tỷ giá quy đổi: Tỷ giá USD → VND | Decimal (18,2) | — | \= \[Tỷ giá VCB, USD → VND\] Tự động cập nhật tỷ giá mới nhất 5p/lần |
| 10 | Tỷ giá quy đổi: Tỷ giá CNY → VND | Decimal (18,2) | — | \= \[Tỷ giá VCB, CNY → VND\] Tự động cập nhật tỷ giá mới nhất 5p/lần |
| 11 | Người cập nhật | Text | Default: Hệ thống | \= “Hệ thống” với Nguồn tỷ giá \= “Tỷ giá VCB” \= \[Người cập nhật\] với Nguồn tỷ giá \= “Tỷ giá thủ công” |
| 12 | Thời điểm cập nhật cuối | Date Time | (Trống) | \= \[Thời điểm tự động cập nhật cuối\] với Nguồn tỷ giá \= “Tỷ giá VCB” \= \[Thời điểm áp dụng tỷ giá\] với Nguồn tỷ giá \= “Tỷ giá thủ công” |
| 13 | Accordion Theo Chặng | Component | Mở rộng | Bấm mở rộng / thu gọn để xem chi tiết P\&L từng dịch vụ con trong Chặng. |
| **Thông tin xác nhận doanh thu** |  |  |  |  |
| 14 | Người xác nhận | Text | — | \= \[Username\] của tài khoản xác nhận doanh thu |
| 15 | Thời gian xác nhận | Date time (DD/MM/YYYY \- hh/mm) | — | \= \[Thời gian xác nhận\] |
| **Bảng Tổng hợp chi tiết Doanh thu \- Chi phí** |  |  |  |  |
| 16 | Chặng / Dịch vụ / Đầu mục giá  | Text / Accordion | — | Hiển thị phân cấp: **Tên Chặng** (Chặng 1, Chặng 2...) $\rightarrow$ **Tên Dịch vụ con** thuộc chặng (Vận tải, Kho bãi...) $\rightarrow$  Tên đầu mục giá. |
| 17 | Hiển thị/Ẩn các dòng dịch vụ/đầu mục trong chặng | Icon | Collapsible | Bấm mở rộng / thu gọn để xem chi tiết P\&L từng dịch vụ/đầu mục trong Chặng. |
| 18 | Nhà thầu thực hiện | Text  | — | Cấp 1 Đầu mục: Hiển thị Tên Nhà thầu AVL được gán cho đầu mục giá (Kế thừa từ K3). Cấp 2 Dịch vụ: null |
| 19 | Doanh thu (Mã dòng giá) | Number/Text | — | Cấp 1: Đầu mục: \= \[Doanh thu theo đầu mục giá lấy từ báo giá\] (VND)  Cấp 2: Dịch vụ \= Tổng \[Doanh thu theo đầu mục\] (VND)  Hiển thị mã dòng giá trong báo giá |
| 20 | Chi phí gốc (Mã dòng giá) | Number | — | Cấp 1: Đầu mục: \= \[Chi phí theo đầu mục giá\] (Tiền tệ của dòng giá) Cấp 2: Dịch vụ \= null Hiển thị Mã dòng giá trong bảng giá mua đầu vào.  |
| 21 | Chi phí Quy đổi (VND) | Number | — | Cấp 1: Đầu mục: \= \[Chi phí theo đầu mục giá\] x \[Tỷ giá VCB\] (VND) Cấp 2: Dịch vụ \= Tổng \[Chi phí theo đầu mục\] (VND)  |
| 22 | Lợi nhuận | Number | — | **Công thức:**  \= cột Doanh thu \- cột Chi phí quy đổi (VND)  Hiển thị số xanh nếu $>0$, số đỏ nếu $<0$. |
| 23 | Ghi chú  | Text  | — | Hiển thị cảnh báo chênh lệch giá, vượt định mức hoặc phát sinh lỗ (mô tả tại US\_CPDT\_04). |
| 24 | Tổng doanh thu | Number | — | Dòng hiển thị cuối bảng. Hiển thị giá trị \[Tổng doanh thu\] ở cột doanh thu Các cột khác null giá trị |
|  **Popup "Chức năng quy đổi tiền tệ"**  |  |  |  |  |
| 24 | Tiền tệ quy đổi | Dropdown | VND | Chỉ xem, cố định VND (BR-09) |
| 25 | Nguồn tỷ giá | Dropdown | Trống (placeholder "Chọn nguồn tỷ giá") | Giá trị: Vietcombank / Nhập tay (BR-10) |
| 26 | Tỷ giá USD → VND | Decimal (18,2) | — | Vietcombank: chỉ xem Nhập tay: cho nhập, \> 0 |
| 27 | Tỷ giá CNY → VND | Decimal (18,2) | — | Vietcombank: chỉ xem Nhập tay: cho nhập, \> 0 |
| 28 | Nút Áp dụng / Hủy | Button | — | Áp dụng: lưu & tính lại Hủy: đóng popup |

 

### **2.1.4. Bảng mô tả Thông báo** 

Toàn bộ phản hồi hệ thống liên quan đến Module P\&L được chuẩn hóa theo bộ mã duy nhất dưới đây:

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Mở tab khi không có quyền xem phiếu | Lỗi | "Bạn không có quyền xem Chi phí – Doanh thu của Phiếu dịch vụ này." | Không hiển thị dữ liệu |
| Phiếu chưa phát sinh chi phí, doanh thu | Thông tin | "Phiếu dịch vụ chưa phát sinh Chi phí – Doanh thu." | KPI \= 0, bảng trống |
| Áp dụng khi chưa chọn nguồn tỷ giá | Lỗi | "Vui lòng chọn nguồn tỷ giá." | Không lưu |
| Nhập tỷ giá trống, ≤ 0 hoặc sai định dạng | Lỗi | "Tỷ giá phải là số lớn hơn 0." | Báo lỗi tại trường, khóa nút Áp dụng |
| API Vietcombank lỗi/timeout | Lỗi | "Không lấy được tỷ giá từ Vietcombank. Vui lòng thử lại hoặc chọn Nhập tay." | Giữ tỷ giá đang lưu |
| Áp dụng tỷ giá thành công | Thành công | "Đã cập nhật tỷ giá và tính lại số liệu quy đổi." | Đóng popup, cập nhật bảng & KPI |
| Mở popup khi phiếu đã xác nhận doanh thu | Thông tin | "Phiếu dịch vụ đã xác nhận doanh thu. Tỷ giá và số liệu quy đổi đã được chốt." | Popup chỉ xem |
| Áp dụng tỷ giá khi phiếu vừa được xác nhận doanh thu | Lỗi | "Phiếu dịch vụ vừa được xác nhận doanh thu, không thể cập nhật tỷ giá." | Từ chối lưu, tải lại dữ liệu |
| Xuất Excel thành công | Thành công | "Xuất dữ liệu Excel thành công." | Tải file .xlsx |
| Xuất Excel thất bại | Lỗi | "Xuất dữ liệu thất bại. Vui lòng thử lại." | Không tải file |
| Làm mới / tải tab thất bại | Lỗi | "Không tải được dữ liệu. Vui lòng thử lại." | Giữ dữ liệu cũ, hiển thị nút Thử lại |

### **2.1.5. Template mẫu tài liệu xuất dữ liệu**

*Toàn bộ dữ liệu trong các Template xuất dưới đây chỉ tổng hợp các Dịch vụ con đang ở trạng thái "Đã thực hiện" hoặc "Hoàn thành", theo đúng BR-PL-05 (mục 1.5).*

**Template Xuất "Xuất dữ liệu Excel" (từ Tab Chi phí – Doanh thu trên Chi tiết Phiếu dịch vụ):** *File Excel (.xlsx), 1 Sheet duy nhất tên "PL\_{Mã\_ORD}", cấu trúc 3 cấp (Chặng → Dịch vụ con → Đầu mục theo Nhà thầu), xuất từ nút \[Xuất dữ liệu Excel\] tại Action Bar (mục 3.1).*

| Cột trong file Excel | Nguồn dữ liệu / Công thức | Định dạng | Ghi chú |
| :---- | :---- | :---- | :---- |
| **Chặng** | Tên Chặng theo Cấu hình Chặng đã xác nhận | Text | Dòng Tổng hợp (Subtotal) — gộp toàn bộ Dịch vụ con trong Chặng. |
| **Dịch vụ con** | 1 trong 5 tên chuẩn K3 (Khai báo Hải quan, Hải quan Giám sát, Vận tải, Sang tải, Kho bãi) | Text | Dòng Tổng hợp — gộp toàn bộ Đầu mục/Nhà thầu của dịch vụ đó trong Chặng. |
| **Đầu mục / Hạng mục** | Tên đầu mục cụ thể do Coordinator khai báo khi gán nhiều Nhà thầu cho cùng 1 Dịch vụ con | Text | Dòng chi tiết cấp thấp nhất; nếu Dịch vụ con chỉ có 1 Nhà thầu thì chỉ có 1 dòng đầu mục. |
| **Nhà thầu AVL** | Tên Nhà thầu được gán cho đầu mục | Text | — |
| **Doanh thu (Nguyên tệ)** | Kế thừa Báo giá K1 | Number \+ Mã tiền tệ | — |
| **Doanh thu Quy đổi (VND)** | Doanh thu Nguyên tệ × Tỷ giá bán | Number (VND) | — |
| **Chi phí (Nguyên tệ)** | Cố định \+ Phụ phí \+ Phát sinh (K3) | Number \+ Mã tiền tệ | — |
| **Chi phí Quy đổi (VND)** | Chi phí Nguyên tệ × Tỷ giá mua | Number (VND) | — |
| **P\&L (Lợi nhuận, VND)** | Doanh thu Quy đổi − Chi phí Quy đổi | Number (VND) | Số âm hiển thị màu đỏ. |
| **Margin (%)** | (P\&L / Doanh thu Quy đổi) × 100% | Percentage | — |
| **Trạng thái Dịch vụ** | Đồng bộ từ K3 | Text | Chỉ xuất các dòng có trạng thái "Đang thực hiện" trở lên theo BR-PL-05 — chỉ tính vào Tổng hợp khi "Đã thực hiện"/"Hoàn thành". |
| **Ghi chú & Cảnh báo** | Cảnh báo chênh lệch giá / vượt định mức / phát sinh lỗ | Text | — |

### 

**Template Xuất "Xuất dữ liệu Excel" (từ màn hình "Chi phí – Doanh thu" — Báo cáo Quản trị):** *File Excel (.xlsx), 1 Sheet "BaoCao\_ChiPhi\_DoanhThu", danh sách các Phiếu dịch vụ theo đúng bộ lọc đang áp dụng tại thời điểm xuất, xuất từ nút \[Xuất dữ liệu Excel\] (mục 3.2). Mỗi dòng \= 1 Phiếu dịch vụ (ORD).*

| Cột trong file Excel | Nguồn dữ liệu | Định dạng | Ghi chú |
| :---- | :---- | :---- | :---- |
| **Mã Phiếu DV (ORD)** | Mã Phiếu dịch vụ | Text | Trùng khớp cột 1 trên bảng chính (mục 3.2). |
| **Khách hàng** | Tên doanh nghiệp Khách hàng | Text | — |
| **Điểm đi – Điểm đến** | Điểm đi → Điểm đến của Phiếu | Text | Đổi tên từ "Cung đường / Tuyến". |
| **Doanh thu (VND)** | Tổng Doanh thu Quy đổi toàn phiếu | Number | Chỉ tính Dịch vụ con "Đã thực hiện"/"Hoàn thành" (BR-PL-05). |
| **Chi phí (VND)** | Tổng Chi phí Quy đổi toàn phiếu | Number | Chỉ tính Dịch vụ con "Đã thực hiện"/"Hoàn thành" (BR-PL-05). |
| **P\&L Lợi nhuận (VND)** | Doanh thu − Chi phí | Number, Bold | Số âm hiển thị màu đỏ. |
| **Margin (%)** | (P\&L / Doanh thu) × 100% | Percentage | — |
| **Ngày tạo** | Ngày tạo Phiếu dịch vụ | Date (dd/MM/yyyy) | Cột mới bổ sung, trùng khớp field lọc "Ngày tạo". |
| **Ngày hoàn thành** | Ngày Phiếu chuyển "Hoàn thành" | Date (dd/MM/yyyy) | Cột mới bổ sung; để trống nếu phiếu chưa Hoàn thành. |

 

## **2.2. MODULE 2: Chi phí – Doanh thu**

### **2.2.1 Danh sách user story**

* **Must have**: bắt buộc để sản phẩm hoạt động / tuân thủ pháp luật-hợp đồng → Sprint hiện tại/kế tiếp.

* **Should have**: quan trọng, có thể tạm workaround → đưa vào Sprint nếu còn năng lực sau P1.

* **Could have**: mong muốn, cải thiện trải nghiệm → làm khi dư buffer hoặc sprint sau.

#### **User story: Xem danh sách tổng hợp Chi phí – Doanh thu**

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_CPDT\_01 |
| **Tên Story** | Xem danh sách tổng hợp Chi phí – Doanh thu |
| **User Story** | Là người dùng CC / Admin / K5, tôi muốn xem danh sách tổng hợp Doanh thu, Chi phí, Lợi nhuận theo từng Phiếu dịch vụ, để theo dõi hiệu quả kinh doanh trên toàn bộ phiếu. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Chi phí – Doanh thu |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Người dùng có quyền mở menu → hiển thị danh sách Phiếu dịch vụ gồm 10 cột (theo mục 3.1.2), sắp xếp Ngày tạo giảm dần. | Người dùng không có quyền → menu không hiển thị. Truy cập URL trực tiếp → thông báo không có quyền, chuyển về trang chủ. |
| 2 | Danh sách phân trang, mặc định 20 bản ghi/trang; hiển thị "Hiển thị n / N phiếu". | Không có phiếu nào → hiển thị trạng thái trống "Chưa có phiếu dịch vụ". |
| 3 | Lợi nhuận (%) ≥ 0 hiển thị màu xanh; \< 0 hiển thị màu đỏ. | Chi phí \= 0 → Lợi nhuận (%) hiển thị "–". |

#### **User story: Xem card số liệu tổng hợp**

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_CPDT\_02 |
| **Tên Story** | Xem card số liệu tổng hợp |
| **User Story** | Là người dùng CC / Admin / K5, tôi muốn xem tổng Doanh thu, Chi phí, Lợi nhuận gộp và Biên lợi nhuận của tập phiếu đang xem, để nắm nhanh kết quả tài chính mà không cần cộng thủ công. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Chi phí – Doanh thu |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Mở menu → 4 card hiển thị số liệu tính trên các phiếu của toàn bộ danh sách. Không có phiếu → 3 card tiền hiển thị 0 VND; card Biên lợi nhuận hiển thị "–". | Không hiển thị dữ liệu hoặc hiển thị sai |
| 2 | Áp dụng tìm kiếm / bộ lọc → 4 card tự động tính lại theo tập bản ghi đã lọc. Kết quả lọc rỗng → card về 0, Biên lợi nhuận hiển thị “–”. | 4 card không tính lại theo kết quả lọc |
| 3 | Card "Biên lợi nhuận" hiển thị %. | Tính sai giá trị Biên lợi nhuận |

#### **User story: Tìm kiếm theo mã phiếu dịch vụ**

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_CPDT\_03 |
| **Tên Story** | Tìm kiếm theo mã phiếu dịch vụ |
| **User Story** | Là người dùng CC / Admin / K5, tôi muốn tìm nhanh phiếu theo mã phiếu dịch vụ, để tra cứu số liệu của một phiếu cụ thể. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Chi phí – Doanh thu |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Nhập một phần mã phiếu → danh sách chỉ còn phiếu có mã chứa từ khóa (không phân biệt hoa/thường); card tính lại. Không có kết quả → thông báo "Không tìm thấy phiếu dịch vụ phù hợp." | Không tìm kiếm hoặc hiển thị kết quả tìm kiếm sai |
| 2 | Tìm kiếm kết hợp (AND) với bộ lọc nâng cao đang áp dụng. Từ khóa có khoảng trắng đầu/cuối → hệ thống tự cắt bỏ trước khi tìm. | Không tìm kiếm hoặc hiển thị kết quả tìm kiếm sai |
| 3 | Xóa từ khóa (nút "x") → trả lại danh sách theo bộ lọc hiện tại. | Nhập ký tự đặc biệt → không phát sinh lỗi; trả kết quả rỗng nếu không khớp. |

#### **User story: Lọc nâng cao \[PHỨC TẠP\]**

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_CPDT\_04 |
| **Tên Story** | Lọc nâng cao |
| **User Story** | Là người dùng CC / Admin / K5, tôi muốn lọc phiếu theo Khách hàng, Trạng thái, khoảng Doanh thu / Chi phí / Lợi nhuận, khoảng ngày thực hiện và Người tạo, để phân tích hiệu quả theo từng nhóm phiếu. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Chi phí – Doanh thu |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Nhấn "Bộ lọc nâng cao" → hiển thị 8 trường lọc (theo mục 3.1.2). | Hiển thị sai hoặc thiếu 8 trường lọc |
| 2 | Gõ tên hoặc mã số thuế vào trường Khách hàng → gợi ý khách hàng khớp; chọn → thêm vào điều kiện. Không có khách hàng khớp → hiển thị "Không có dữ liệu". | Không có ô tìm kiếm khách hàng hoặc không tìm được khách hàng theo tên/mã số thuế |
| 3 | Nhập khoảng Doanh thu / Chi phí / Lợi nhuận (%) → chỉ trả về phiếu có giá trị trong khoảng (bao gồm biên). Giá trị "Từ" \> "Đến" → báo lỗi tại trường, không cho Áp dụng. | Cho phép lọc và không hiển thị bản ghi nào |
| 4 | Chọn khoảng Ngày bắt đầu / Ngày kết thúc thực hiện → lọc theo khoảng ngày. Ngày "Từ" sau ngày "Đến" → báo lỗi tại trường. | Cho phép lọc và không hiển thị bản ghi nào |
| 5 | Nhấn "Áp dụng" → danh sách và 4 card cập nhật; hiển thị chip điều kiện và badge số điều kiện trên nút lọc. | Kết quả rỗng → trạng thái trống; card về 0\. |
| 6 | Nhấn "Đặt lại" → xóa toàn bộ điều kiện, trả danh sách mặc định. | Đóng panel không nhấn "Áp dụng" → giữ nguyên điều kiện cũ. |

**▸ Use Case chi tiết UC\_CPDT\_01 — Lọc nâng cao danh sách Chi phí – Doanh thu**

(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)

| Mục | Nội dung |
| :---- | :---- |
| **Actor chính** | Người dùng CC / Admin / K5 |
| **Actor phụ** | Hệ thống LogX Module Cấu hình danh mục (nguồn Khách hàng) Module Tài khoản & Phân quyền (nguồn Người tạo) |
| **Precondition** | Người dùng đã đăng nhập, có quyền xem menu Chi phí – Doanh thu. Đang ở màn danh sách Chi phí – Doanh thu. |
| **Trigger** | Người dùng nhấn nút "Bộ lọc nâng cao". |
| **Luồng chính (Main flow)** | 1\. Người dùng nhấn "Bộ lọc nâng cao". 2\. Hệ thống hiển thị panel lọc, giữ các điều kiện đang áp dụng (nếu có). 3\. Người dùng nhập / chọn một hoặc nhiều điều kiện. 4\. Người dùng nhấn "Áp dụng". 5\. Hệ thống kiểm tra tính hợp lệ của các khoảng giá trị. 6\. Hệ thống lọc danh sách (AND giữa các trường, kết hợp từ khóa tìm kiếm). 7\. Hệ thống tính lại 4 card trên tập đã lọc. 8\. Hệ thống hiển thị chip điều kiện, badge số điều kiện; chuyển về trang 1\. |
| **Luồng thay thế (Alternative)** | 3a. Lọc Khách hàng: gõ tên / mã số thuế → chọn một hoặc nhiều khách hàng. 3b. Lọc Người tạo: gõ họ tên / tài khoản → chọn một hoặc nhiều người tạo. 3c. Chỉ nhập một đầu khoảng → lọc "≥ Từ" hoặc "≤ Đến". 4a. Nhấn "Đặt lại" → xóa toàn bộ điều kiện → danh sách mặc định. 4b. Đóng panel không Áp dụng → giữ nguyên điều kiện cũ. 8a. Xóa một chip → bỏ điều kiện đó → quay lại bước 6\. |
| **Luồng ngoại lệ (Exception)** | 5a. "Từ" \> "Đến" (số hoặc ngày) → báo lỗi tại trường, không lọc. 6a. Kết quả rỗng → hiển thị trạng thái trống; 4 card về 0\. 6b. Lỗi kết nối → thông báo lỗi, giữ dữ liệu đang hiển thị. 6c. Đang có phiếu được tick chọn → làm mới lựa chọn, hiển thị thông báo. |
| **Postcondition** | Thành công: danh sách và 4 card hiển thị theo điều kiện lọc. Thất bại: giữ nguyên danh sách và điều kiện trước đó. |
| **Business Rules liên quan** | BR-04, BR-07, BR-11, BR-12, BR-13, BR-14, BR-16 |

#### **User story: Sắp xếp danh sách**

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_CPDT\_05 |
| **Tên Story** | Sắp xếp danh sách |
| **User Story** | Là người dùng CC / Admin / K5, tôi muốn sắp xếp danh sách theo Doanh thu, Chi phí, Lợi nhuận, Ngày bắt đầu / kết thúc thực hiện, để tìm nhanh phiếu có giá trị cao / thấp nhất hoặc theo thời gian. |
| **Độ Ưu tiên (MoSCoW)** | Should have |
| **Module** | Chi phí – Doanh thu |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Nhấn tiêu đề cột hỗ trợ sắp xếp → sắp xếp tăng dần; nhấn lần 2 → giảm dần. | Cột không hỗ trợ sắp xếp → không hiển thị icon sắp xếp, nhấn không có tác dụng. |
| 2 | Nhấn lần 3 → trở về thứ tự mặc định (Ngày tạo giảm dần). | Cột không hỗ trợ sắp xếp → không hiển thị icon sắp xếp, nhấn không có tác dụng. |
| 3 | Sắp xếp áp dụng trên toàn bộ tập đã lọc (không chỉ trang hiện tại); giữ nguyên bộ lọc; về trang 1\. | Sắp xếp chỉ áp dụng trên 1 trang hoặc làm mất bộ lọc hoặc không trở về trang 1 |
| 4 | Giá trị rỗng ("–") luôn nằm cuối danh sách ở cả hai chiều sắp xếp. | Lọc sai thứ tự |
| 5 | Chỉ một cột được sắp xếp tại một thời điểm; icon mũi tên thể hiện chiều đang áp dụng. | Sắp xếp được theo 2 cột. |

#### **User story: Xem chi tiết Doanh thu – Chi phí của phiếu**

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_CPDT\_06 |
| **Tên Story** | Xem chi tiết Doanh thu – Chi phí của phiếu |
| **User Story** | Là người dùng CC / Admin / K5, tôi muốn nhấn vào mã phiếu để mở chi tiết Doanh thu – Chi phí của phiếu đó, để kiểm tra các khoản cấu thành số liệu. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Chi phí – Doanh thu |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Nhấn mã phiếu dịch vụ → mở màn Chi tiết phiếu dịch vụ, tab "Doanh thu – Chi phí" được chọn sẵn. | Phiếu không còn tồn tại → thông báo lỗi, ở lại danh sách và tải lại dữ liệu. |
| 2 | Nhấn "Quay lại" → giữ nguyên từ khóa, bộ lọc, sắp xếp, trang và các phiếu đã chọn. | Người dùng không có quyền xem chi tiết phiếu → thông báo không có quyền. |

#### **User story: Chọn phiếu và xuất dữ liệu Excel \[PHỨC TẠP\]**

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_CPDT\_07 |
| **Tên Story** | Chọn phiếu và xuất dữ liệu Excel |
| **User Story** | Là người dùng CC / Admin / K5, tôi muốn chọn các phiếu (kể cả trên nhiều trang) và xuất ra file Excel, để báo cáo và phân tích ngoài hệ thống. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Chi phí – Doanh thu |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| 1 | Tick checkbox từng dòng → dòng được đánh dấu, hiển thị text “Đã chọn (n) phiếu”; nút hiển thị "Xuất dữ liệu Excel (n)". | Không hiển thị số phiếu đã chọn |
| 2 | Tick checkbox Tiêu đề → chọn tất cả phiếu trong trang, hiển thị text “Đã chọn (n) phiếu”;  nút hiển thị "Xuất dữ liệu Excel (n)". Tick bỏ check box tiêu đề → bỏ chọn tất cả phiếu trong trang | – |
| 3 | Tick checkbox “Chọn tất cả” → chọn tất cả phiếu trong danh sách, hiển thị text “Đã chọn (n) phiếu”;  nút hiển thị "Xuất dữ liệu Excel (n)". | Chỉ chọn các phiếu trong trang hiện tại |
| 4 | Chuyển trang → các phiếu đã chọn ở trang trước vẫn được giữ. | Chuyển trang, các phiếu đã chọn không được giữ |
| 5 | Nhấn "Xuất dữ liệu Excel" khi đã chọn → tải file .xlsx chứa đúng các phiếu đã chọn. | Xuất sai / không có dữ liệu |
| 6 | Lỗi khi xuất → thông báo lỗi, giữ nguyên lựa chọn. | Xuất lỗi, lựa chọn các bản ghi bị mất  |
| 7 | Nhấn "Xuất dữ liệu Excel" khi chưa chọn → popup xác nhận số phiếu → "Đồng ý" → xuất toàn bộ phiếu theo bộ lọc hiện tại. | – |
| 8 | Danh sách rỗng → nút "Xuất dữ liệu Excel" bị vô hiệu. | Vẫn ấn được nút “Xuất dữ liệu Excel” |

**▸ Use Case chi tiết UC\_CPDT\_02 — Chọn phiếu và xuất dữ liệu Excel**

(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)

| Mục | Nội dung |
| :---- | :---- |
| **Actor chính** | Người dùng CC / Admin / K5 |
| **Actor phụ** | Hệ thống LogX (dịch vụ xuất file) Trình duyệt của người dùng |
| **Precondition** | Người dùng có quyền xem menu Chi phí – Doanh thu. Danh sách hiện tại có ít nhất 1 phiếu. |
| **Trigger** | Người dùng nhấn nút "Xuất dữ liệu Excel". |
| **Luồng chính (Main flow)** | 1\. Người dùng tick chọn phiếu (từng dòng, có thể trên nhiều trang). 2\. Hệ thống lưu danh sách phiếu đã chọn, cập nhật bộ đếm trên nút. 3\. Người dùng nhấn "Xuất dữ liệu Excel (n)". 4\. Hệ thống tạo file .xlsx gồm các phiếu đã chọn, theo thứ tự sắp xếp hiện tại. 5\. Trình duyệt tải file; hệ thống hiển thị thông báo thành công. 6\. Lựa chọn được giữ nguyên sau khi xuất. |
| **Luồng thay thế (Alternative)** | 1a. Tick checkbox tiêu đề → chọn tất cả phiếu trên trang hiện tại. 1b. Nhấn "Chọn tất cả" → chọn toàn bộ tập đã lọc. 1c. Không tick phiếu nào → bước 3 → hệ thống hiển thị popup xác nhận xuất toàn bộ X phiếu. 1b1. Nhấn "Đồng ý" → tiếp bước 4 với toàn bộ phiếu theo bộ lọc. 1b2. Nhấn "Hủy" → đóng popup, không xuất. 1c. Nhấn "Bỏ chọn tất cả" → xóa toàn bộ lựa chọn. 4a. Số phiếu \> 5.000 → xuất nền; gửi thông báo trong hệ thống khi file sẵn sàng. |
| **Luồng ngoại lệ (Exception)** | 2a. Thay đổi từ khóa / bộ lọc → làm mới lựa chọn, hiển thị thông báo. 3a. Danh sách rỗng → nút xuất bị vô hiệu. 4b. Phiếu đã chọn bị xóa trước khi xuất → bỏ qua phiếu đó, thông báo số phiếu bị bỏ qua. 4c. Lỗi tạo file / quá thời gian → thông báo lỗi, giữ nguyên lựa chọn. |
| **Postcondition** | Thành công: file LogX\_ChiPhiDoanhThu\_yyyyMMdd\_HHmm.xlsx được tải về. Thất bại: không có file; lựa chọn giữ nguyên. |
| **Business Rules liên quan** | BR-04, BR-16, BR-17, BR-18, BR-19, BR-20 |

### **2.2.2 Mô tả giao diện**

Link UI Design: \[Chèn link\].

Màn hình danh sách tổng hợp Chi phí – Doanh thu theo Phiếu dịch vụ, gồm: tiêu đề \+ nút xuất, 4 card số liệu, thanh tìm kiếm / bộ lọc, bảng danh sách, phân trang.

| Tên trường | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| **A. Khu vực tiêu đề** |  |  |  |  |
| Tiêu đề màn hình | Label | – | "Chi phí – Doanh thu" | Tên menu. |
| Nút "Xuất dữ liệu Excel" | Button | – | Enabled | Có phiếu được chọn: hiển thị "(n)". Chưa chọn: xuất toàn bộ theo bộ lọc (có xác nhận). Danh sách rỗng: Disabled. |
| **B. Card số liệu (chỉ tính phiếu "Hoàn thành" trong tập đã lọc)** |  |  |  |  |
| Tổng doanh thu | Number (VND) | – | 0 | Tổng Doanh thu. |
| Tổng chi phí | Number (VND) | – | 0 | Tổng Chi phí. |
| Tổng lợi nhuận gộp | Number (VND) | – | 0 | \= Tổng doanh thu − Tổng chi phí. ( ≥ 0: màu xanh, dấu "+"; \< 0: màu đỏ). |
| Biên lợi nhuận  | Decimal (%)  | – | "–" | Biên lợi nhuận (%) \= Tổng lợi nhuận gộp / Tổng doanh thu × 100  |
| **C. Tìm kiếm & Bộ lọc nâng cao** |  |  |  |  |
| Ô tìm kiếm | Text | 50 | Trống | Placeholder: "Tìm theo mã phiếu dịch vụ...". Tìm kiếm chứa (contains), không phân biệt hoa/thường. |
| Nút "Bộ lọc nâng cao" | Button | – | – | Mở / đóng panel lọc. Badge số điều kiện đang áp dụng. |
| Khách hàng | Multi-select có tìm kiếm | – | Tất cả | Tìm theo tên hoặc mã số thuế. Hiển thị: "Tên khách hàng – MST". |
| Trạng thái | Multi-select | – | Tất cả | Giá trị: Đã thực hiện, Hoàn thành. Chọn một hoặc cả hai. |
| Doanh thu  (Từ – Đến) | Number range (VND) | 15 chữ số | Trống | Số ≥ 0, tự định dạng phân cách hàng nghìn. Cho phép nhập một đầu. |
| Chi phí  (Từ – Đến) | Number range (VND) | 15 chữ số | Trống | Như trường Doanh thu. |
| Lợi nhuận %  (Từ – Đến) | Decimal range (%) | 2 chữ số thập phân | Trống | Cho phép giá trị âm (phiếu lỗ). |
| Ngày kết thúc thực hiện (Từ – Đến) | Date range | dd/MM/yyyy | \[Hôm nay\] \- \[Hôm nay\]  | Date picker; cho phép nhập một đầu. |
| Ngày hoàn thành (Từ – Đến) | Date range | dd/MM/yyyy | Trống | Date picker; cho phép nhập một đầu. |
| Người tạo | Multi-select có tìm kiếm | – | Tất cả | Tìm theo họ tên / tài khoản. Nguồn: Tài khoản & Phân quyền. |
| Nút "Áp dụng" / "Đặt lại" | Button | – | – | Áp dụng: lọc \+ tính lại card. Đặt lại: xóa toàn bộ điều kiện. |
| Chip điều kiện đang lọc | Chip | – | Ẩn | Hiển thị dưới thanh tìm kiếm; có "x" từng chip và "Xóa tất cả". |
| Bộ đếm kết quả | Label | – | – | "Hiển thị n / N phiếu". |
| **D. Bảng danh sách (mặc định: Ngày tạo giảm dần)** |  |  |  |  |
| Checkbox | Checkbox | – | Bỏ chọn | Checkbox tiêu đề: chọn tất cả trên trang. Lựa chọn được giữ khi chuyển trang. |
| Mã phiếu dịch vụ | Text / Hyperlink | 50 | – | Nhấn → Chi tiết phiếu dịch vụ / tab "Doanh thu – Chi phí". |
| Khách hàng | Text | 255 | – | Tên khách hàng. Tên dài cắt "..." kèm tooltip. |
| Trạng thái | Badge | – | – | Giá trị: Hoàn thành, Đã thực hiện. |
| Doanh thu (VND) | Number | – | "–" nếu chưa Hoàn thành | \= Tổng doanh thu dịch vụ |
| Chi phí (VND) | Number | – | "–" nếu chưa Hoàn thành | \= Tổng chi phí dịch vụ |
| Lợi nhuận (%) | Decimal (%) | 2 chữ số thập phân | "–" nếu chưa Hoàn thành | \= % Lợi nhuận dịch vụ. Màu xanh ≥ 0, đỏ \< 0\. |
| Ngày kết thúc thực hiện | Date | dd/MM/yyyy | "–" nếu chưa có | Có sắp xếp. |
| Ngày hoàn thành | Date | dd/MM/yyyy | "–" nếu chưa có | Có sắp xếp. |
| Người tạo | Text | 100 | – | Họ tên người tạo Phiếu dịch vụ. |
| **E. Cấu trúc file Excel xuất** |  |  |  |  |
| Tên file | .xlsx | – | – | LogX\_ChiPhiDoanhThu\_yyyyMMdd\_HHmm.xlsx |
| Cột dữ liệu | – | – | – | Đúng thứ tự cột danh sách (trừ checkbox). Thêm: Mã số thuế, Lợi nhuận (VND). Ô null để trống; số giữ định dạng Number. |
| Dòng tổng | – | – | – | Dòng cuối: tổng Doanh thu, Chi phí, Lợi nhuận (VND) của các phiếu. |

### **2.2.3. Quy tắc nghiệp vụ (Business Rule)**

BR-01: Menu "Chi phí – Doanh thu" thuộc nhóm Quản lý dịch vụ; chỉ vai trò CC / Admin / K5 được xem (cấu hình tại Tài khoản & Phân quyền). 

BR-02: Danh sách chỉ gồm Phiếu dịch vụ có trạng thái "Đã thực hiện" hoặc "Hoàn thành"; phiếu ở trạng thái khác không hiển thị.

BR-03: Thứ tự mặc định: Ngày tạo phiếu giảm dần.

BR-06: Lợi nhuận (%) \= (Doanh thu − Chi phí) / Doanh thu × 100, làm tròn 2 chữ số thập phân; Doanh thu \= 0 → Lợi nhuận "–".

BR-08: Card không phụ thuộc thao tác tick chọn checkbox hay phân trang.

BR-09: Biên lợi nhuận \= Tổng lợi nhuận gộp / Tổng doanh thu × 100 

BR-10: Tìm kiếm theo mã phiếu dịch vụ, dạng chứa (contains), không phân biệt hoa/thường.

BR-11: Giữa các trường lọc và từ khóa tìm kiếm: AND; trong cùng một trường chọn nhiều giá trị: OR.

BR-13: Khoảng lọc bao gồm giá trị biên; cho phép nhập một đầu; "Từ" phải ≤ "Đến".

BR-14: Lọc theo khoảng ngày loại các phiếu chưa có ngày tương ứng.

BR-15: Sắp xếp được trên các cột Doanh thu, Chi phí, Lợi nhuận (%), Ngày bắt đầu thực hiện, Ngày kết thúc thực hiện; áp dụng trên toàn bộ tập đã lọc. Một cột tại một thời điểm; giá trị null luôn ở cuối.

BR-16: Lựa chọn checkbox được giữ khi chuyển trang. Lựa chọn được làm mới khi thay đổi từ khóa / bộ lọc.

BR-17: Xuất Excel: có phiếu được chọn → xuất phiếu đã chọn; chưa chọn → xuất toàn bộ phiếu theo bộ lọc hiện tại, sau khi người dùng xác nhận.

BR-19: Xuất \> 5.000 phiếu → chạy nền, thông báo khi file sẵn sàng; file lưu tối đa 7 ngày.

BR-20: Thứ tự dòng trong file Excel theo thứ tự sắp xếp đang áp dụng trên màn hình.

### **2.2.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Truy cập menu không có quyền | Lỗi | "Bạn không có quyền truy cập chức năng này." | Chuyển về trang chủ. |
| Lỗi tải danh sách | Lỗi | "Không thể tải dữ liệu. Vui lòng thử lại." | Hiển thị nút "Thử lại"; giữ dữ liệu cũ (nếu có). |
| Danh sách không có phiếu | Thông tin | "Chưa có phiếu dịch vụ." | Trạng thái trống; card \= 0; nút xuất Disabled. |
| Tìm kiếm / lọc không có kết quả | Thông tin | "Không tìm thấy phiếu dịch vụ phù hợp." | Trạng thái trống; card \= 0; gợi ý "Xóa bộ lọc". |
| Khoảng số "Từ" \> "Đến" | Lỗi | "Giá trị 'Từ' không được lớn hơn giá trị 'Đến'." | Viền đỏ tại trường; khóa nút "Áp dụng". |
| Khoảng ngày "Từ" sau "Đến" | Lỗi | "Ngày 'Từ' không được sau ngày 'Đến'." | Viền đỏ tại trường; khóa nút "Áp dụng". |
| Nhấn Xuất khi chưa chọn phiếu | Cảnh báo | "Bạn chưa chọn phiếu nào. Hệ thống sẽ xuất toàn bộ {X} phiếu theo bộ lọc hiện tại. Tiếp tục?" | Popup "Đồng ý" / "Hủy". |
| Xuất file thành công | Thành công | "Xuất dữ liệu thành công {n} phiếu." | Tải file về; giữ lựa chọn. |
| Xuất \> 5.000 phiếu | Thông tin | "Dữ liệu đang được xuất. Hệ thống sẽ thông báo khi tệp sẵn sàng." | Chạy nền; gửi thông báo kèm link tải. |
| Có phiếu đã chọn bị xóa trước khi xuất | Cảnh báo | "Đã xuất {n} phiếu. {m} phiếu không còn tồn tại và đã bị bỏ qua." | Xuất phần còn lại; bỏ chọn phiếu không tồn tại. |
| Xuất file thất bại | Lỗi | "Xuất dữ liệu thất bại. Vui lòng thử lại." | Không tải file; giữ lựa chọn. |
| Nhấn mã phiếu đã bị xóa | Lỗi | "Phiếu dịch vụ không tồn tại hoặc đã bị xóa." | Ở lại danh sách; tải lại dữ liệu. |

### **2.2.5. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Module Phiếu dịch vụ | Cung cấp mã phiếu, khách hàng, trạng thái, ngày tạo, ngày bắt đầu / kết thúc thực hiện, người tạo. | Phiếu dịch vụ → Chi phí – Doanh thu | Mở menu; tìm kiếm / lọc / sắp xếp | Lỗi tải → thông báo lỗi, cho thử lại. |
| Module Chi phí & Doanh thu (tab "Doanh thu – Chi phí" của phiếu) | Cung cấp giá trị Doanh thu, Chi phí của từng phiếu. | Chi phí, Doanh thu → Snapshot → Chi phí – Doanh thu | Phiếu chuyển "Hoàn thành" | Phiếu "Hoàn thành" thiếu snapshot → hiển thị "–", ghi log cảnh báo quản trị. |
| Báo giá khách hàng / Giá mua đầu vào (giá nhà thầu) | Nguồn gốc giá trị Doanh thu (theo Giá bán định mức) và Chi phí (theo Giá mua đầu vào) trước khi chốt snapshot. | Báo giá khách hàng, Giá mua đầu vào → Phiếu dịch vụ | Tạo / cập nhật Phiếu dịch vụ | Không tác động trực tiếp tới menu này (gián tiếp qua snapshot). |
| Cấu hình danh mục (Khách hàng) | Nguồn dữ liệu bộ lọc Khách hàng (tên, mã số thuế). | Cấu hình danh mục → Bộ lọc | Mở bộ lọc / gõ tìm | Lỗi → dropdown hiển thị "Không tải được dữ liệu". |
| Tài khoản & Phân quyền | Kiểm tra quyền xem menu. Nguồn bộ lọc Người tạo. | Tài khoản & Phân quyền → Chi phí – Doanh thu | Truy cập menu; mở bộ lọc | Không có quyền → chặn truy cập, thông báo lỗi. |
| Dịch vụ xuất file nền | Tạo file Excel khối lượng lớn không chặn giao diện. | Chi phí – Doanh thu → Dịch vụ xuất file → Thông báo hệ thống | Xuất \> 5.000 phiếu | Thất bại → thông báo lỗi, cho thử lại. |

# **Phụ lục A. Hướng dẫn áp dụng mô hình Hybrid theo Sprint**

* **Refinement:** bẻ Epic → User Story \+ AC; đánh dấu \[PHỨC TẠP\] cho story nhiều nhánh/nhiều actor để bổ sung Use Case.

* **Sprint Planning:** chỉ story đạt Definition of Ready mới đưa vào Sprint Backlog; đính wireframe & business rule.

* **Trong Sprint:** US \+ AC là living doc; tester biến AC (và Use Case flow) trực tiếp thành test case.

* **Review/Done:** cập nhật lại US/UC theo thực tế build, đồng bộ Data Dictionary & bảng tích hợp.