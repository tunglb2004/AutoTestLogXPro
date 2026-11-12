# **SRS TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

| Tên hệ thống | LOGXPRO |
| :---: | :---- |
| **Phân hệ** | Quản lý Dịch vụ  |
| **Link UI Design** | [Figma \- LogXPro](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=9584-4174&t=bNJcyeBFaqgkXBoo-4) |
| **Người lập** | Đặng Thanh Sơn |
| **Ngày tạo** | 03/09/2026 |
| **Ngày cập nhật** | 20/10/2026 |

## **1\. Tổng quan & Phạm vi**

### **1.1. Mục tiêu**

Phân hệ Quản lý Dịch vụ là mắt xích chuyển giao then chốt giữa khâu thương mại bán hàng và khâu tổ chức thực thi hiện trường trong nền tảng Logistics 4PL LogXPro. Phân hệ tiếp nhận các yêu cầu đặt dịch vụ (Booking) từ những khách hàng đã có biểu giá bán hoặc hợp đồng nguyên tắc đang có hiệu lực, thiết lập phiếu dịch vụ theo thông số lô hàng thực tế, kiểm soát an toàn tài chính qua hạn mức công nợ, bàn giao đơn sang Tháp điều phối (K3), và cuối cùng đối soát sản lượng thực tế cùng phụ phí phát sinh để xuất bảng kê đóng đơn.

### **1.2. Phạm vi hệ thống**

* **Trong phạm vi (In-scope):**

  * Quản lý danh sách và tra cứu Phiếu dịch vụ theo vòng đời trạng thái.

  * Khởi tạo Phiếu dịch vụ kế thừa biểu giá bán gốc từ Báo giá khách hàng hoặc Hợp đồng đang hiệu lực.

  * Theo dõi tiến độ vận hành hiện trường từ Tháp điều phối (K3) theo thời gian thực (trạng thái, biển số xe, số container, tài xế).

  * Tiếp nhận kết quả giao nhận hoàn tất kèm biên bản bàn giao có chữ ký (POD \- Proof of Delivery) từ K3.

  * Đối soát sản lượng thực tế, tổng hợp các khoản phụ phí phát sinh được duyệt, thiết lập tỷ giá và thuế suất để chốt bảng kê doanh thu gửi khách hàng.

  * Xuất bảng kê chi tiết dịch vụ (định dạng Excel, PDF) và xác nhận thanh toán để đóng đơn dịch vụ (khóa dữ liệu vĩnh viễn).

  * Nghiệp vụ hủy phiếu dịch vụ trước khi kích hoạt vận hành.

  * Ghi nhận Doanh thu đồng thời với Chi phí (1:1) theo trạng thái dòng giá trong Báo giá khách hàng (Đã có báo giá / Chưa có báo giá / Hết hạn báo giá) — US\_ORD\_06.

* **Ngoài phạm vi (Out-of-scope):**

  * Khảo sát giá mua, xây dựng biểu giá bán và phê duyệt giá gốc (thuộc phân hệ Báo giá K1/K2).

  * Nghiệp vụ điều phối nội bộ của Tháp điều phối: gán nhà thầu AVL, mở tờ khai hải quan trên hệ thống VNACCS, điều xe, kiểm hóa bãi, bốc xếp kho (thuộc phân hệ K3).

  * Đối soát chi phí mua chi trả cho nhà thầu(thuộc phân hệ Quản lý nhà thầu K4 và Kế toán K5).

## **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

### **2.1 Business Process Flow**

[Luồng nghiệp vụ Phiếu dịch vụ.drawio \- work flow](https://app.diagrams.net/#G1DAdcpNKn6hWCBJrmowoDywVMq-zQViRM#%7B%22pageId%22%3A%221qNzLdh44eayoZTdDAvG%22%7D) 

### **2.2 Sơ đồ trạng thái (State Diagram)**

[State diagram](https://app.diagrams.net/#G1DAdcpNKn6hWCBJrmowoDywVMq-zQViRM#%7B%22pageId%22%3A%22qHLwt2pu4C9m-qcR0wFb%22%7D) 	

#### *Bảng A — Vòng đời Phiếu dịch vụ*

| STT | Trạng thái hiện tại | Sự kiện / Hành động | Người thực hiện | Trạng thái tiếp theo | Điều kiện & Tác vụ hệ thống |
| :---: | :---- | :---- | :---- | :---- | :---- |
| 1 | (Chưa tạo) | Bấm "Lưu nháp"  | K1 | Nháp | Lưu phiếu; sinh mã ORDYYMMDD-XXX; không thông báo K3 |
| 2 | (Chưa tạo) | Bấm "Gửi phiếu"  | K1 | Tạo mới | Kiểm tra đủ trường bắt buộc;sinh mã ORDYYMMDD-XXX; thông báo K3 |
| 3 | Nháp | Bấm "Gửi phiếu" | K1 | Tạo mới | Kiểm tra đủ trường bắt buộc; thông báo sang K3 (mã phiếu đã sinh từ bước Lưu nháp) |
| 4 | Nháp | Bấm "Xóa phiếu" | K1 | (Xóa vĩnh viễn) | Chỉ áp dụng cho phiếu chưa từng gửi đi, chưa có hoạt động điều phối nào; xóa hẳn bản ghi kèm mã phiếu, không thể khôi phục. Mã ORDYYMMDD-XXX đã sinh sẽ không được tái sử dụng (chấp nhận lỗ số thứ tự) |
| 5 | Tạo mới | Chỉnh sửa thông tin phiếu | K1 | Tạo mới (giữ nguyên) | Ghi vào Lịch sử hoạt động; chỉ sửa được khi K3 chưa bấm "Tiếp nhận phiếu" |
| 6 | Tạo mới | K3 xem xét, bấm "Tiếp nhận phiếu" | Trưởng điều phối (K3) | Đã tiếp nhận | Xác nhận tuyến đường, cấu trúc chặng; ghi Nhật ký điều phối |
| 7 | Tạo mới | K3 xem xét, bấm "Từ chối" | Trưởng điều phối (K3) | Từ chối | Bắt buộc nhập lý do từ chối; ghi Nhật ký điều phối |
| 8 | Tạo mới | Bấm "Hủy phiếu" | K1 (người tạo) | Đã hủy | Bắt buộc nhập lý do hủy |
| 9 | Đã tiếp nhận | Bấm "Hủy phiếu" | K1 (người tạo) | Đã hủy | Bắt buộc nhập lý do hủy; chỉ hủy được trước khi có chặng nào được kích hoạt; hệ thống bắt buộc gửi thông báo cho K3 |
| 10 | Đã tiếp nhận | Khi có tối thiểu 1 dịch vụ yêu cầu chuyển đang thực hiện  | Người giám sát/thực hiện dịch vụ (K3) | Đang thực hiện | Từ thời điểm này, K1 không còn quyền hủy phiếu |
| 11 | Từ chối | Chỉnh sửa thông tin phiếu | K1 | Từ chối (giữ nguyên) | Ghi vào Lịch sử hoạt động; chưa gửi lại cho K3 |
| 12 | Từ chối | Bấm "Khôi phục yêu cầu" | K1 | Tạo mới | Gửi lại phiếu cho K3 xem xét; ghi Nhật ký điều phối |
| 13 | Từ chối | Bấm "Hủy phiếu" | K1 | Đã hủy | Bắt buộc nhập lý do hủy |
| 14 | Đã hủy | Chỉnh sửa thông tin phiếu | K1 | Đã hủy (giữ nguyên) | Ghi vào Lịch sử hoạt động; chưa gửi lại cho K3 |
| 15 | Đã hủy | Bấm "Khôi phục yêu cầu" | K1 | Tạo mới | Gửi lại phiếu cho K3 xem xét; ghi Nhật ký điều phối |
| 16 | Đang thực hiện | Hoàn thành tất cả các chặng | Hệ thống (tự động) | Đã thực hiện | Tất cả chặng đã hoàn thành |
| 17 | Đã thực hiện | Bấm "Xác nhận doanh thu" | Kiểm soát công nợ thu  (K5) | Hoàn thành | Chốt doanh thu; khóa vĩnh viễn dữ liệu đơn hàng |

## **3\. Đặc tả Tính năng**

### **3.1. MODULE 1: Quản lý Dịch vụ** 

#### *3.1.1 US\_ORD\_01 — Xem và tìm kiếm/lọc danh sách Phiếu dịch vụ*

##### a. User Story

| Mục | Mô tả |
| :---- | :---- |
| ID US | US\_ORD\_01 |
| Tên Story | Xem và tìm kiếm/lọc danh sách Phiếu dịch vụ |
| User Story | Là Nhân viên Dịch vụ khách hàng / Kinh doanh (K1), tôi muốn xem danh sách các phiếu dịch vụ kèm ô tìm kiếm nhanh và bảng bộ lọc nâng cao đa tiêu chí, để theo dõi tiến độ xử lý và tra cứu thông tin đơn hàng của khách hàng do mình phụ trách. |
| Độ Ưu tiên | Must have |
| Module | Quản lý Dịch vụ |
| Người Phụ trách | Đặng Thanh Sơn (BA) |

##### b. Acceptance Criteria

| STT | Tiêu chí Chấp nhận (Acceptance Criteria \- AC) | Điều kiện Thất bại (Negative Criteria \- NC) |
| :---- | :---- | :---- |
| AC1 | Hiển thị danh sách tổng quan: Hệ thống hiển thị bảng danh sách các phiếu dịch vụ được sắp xếp theo thứ tự thời gian tạo mới nhất lên đầu tiên. Bảng cung cấp đầy đủ 7 cột thông tin chuẩn: Mã phiếu dịch vụ, Khách hàng, Các dịch vụ, BSX nhận hàng, BSX giao hàng, Trạng thái, Ngày tạo. | NC1: Người dùng chưa được phân quyền truy cập phân hệ Quản lý Dịch vụ thì hệ thống chặn mở trang, hiển thị thông báo lỗi yêu cầu liên hệ quản trị viên. |
| AC2 | Tìm kiếm nhanh theo từ khóa: Ô tìm kiếm cho phép người dùng gõ từ khóa tự do để tìm kiếm đồng thời theo: Mã phiếu dịch vụ (đúng chuẩn ORDYYMMDD-XXX) hoặc Biển số xe nhận hàng / giao hàng. Dữ liệu bảng tự động lọc ngay theo thời gian thực khi người dùng nhập từng ký tự. | NC2: Nếu từ khóa tìm kiếm không khớp với bất kỳ bản ghi nào trong hệ thống, bảng hiển thị dòng thông báo ở giữa: "Không tìm thấy phiếu dịch vụ nào phù hợp.". |
| AC3 | Bảng bộ lọc nâng cao (Expandable Filter Panel): Bấm nút "Bộ lọc nâng cao" để mở rộng hoặc thu gọn khối lọc gồm 3 nhóm tiêu chí hộp kiểm chọn nhiều: 1\. Khách hàng (Lọc kiểu HOẶC \- OR): Tích chọn 1 hoặc nhiều khách hàng trong danh sách phụ trách; hiển thị các đơn thuộc bất kỳ khách hàng nào được chọn. 2\. Loại dịch vụ (Lọc kiểu VÀ \- AND): Tích chọn 1 hoặc nhiều dịch vụ trong 5 dịch vụ con (Khai báo hải quan, Hải quan giám sát, Vận tải, Sang tải, Kho); chỉ hiển thị các đơn hàng có chứa toàn bộ các dịch vụ được tích chọn. 3\. Nhóm Trạng thái phiếu (Lọc kiểu HOẶC \- OR): Tích chọn 1 hoặc nhiều trạng thái trong 8 trạng thái vòng đời; hiển thị các đơn thuộc bất kỳ trạng thái nào được chọn. 4\. BSX giao: cho phép nhập 1 BSX 5\. BSX nhận 6\. Nhóm Ngày tạo | NC3: Khi người dùng thu gọn bảng lọc hoặc chưa tích chọn tiêu chí nào thì hệ thống mặc định hiển thị toàn bộ danh sách đơn hàng hợp lệ thuộc quyền quản lý của người dùng. |
| AC4 | Huy hiệu số lượng bộ lọc & Nút xóa nhanh: Khi có ít nhất 1 điều kiện lọc được chọn, nút "Bộ lọc nâng cao" đổi sang màu xanh thương hiệu và hiển thị huy hiệu đếm tổng số tiêu chí đang chọn. Đồng thời xuất hiện nút chữ màu đỏ "Xóa tất cả bộ lọc"; khi bấm vào, hệ thống xóa trắng ô tìm kiếm và bỏ chọn toàn bộ các hộp kiểm để hiển thị lại toàn bộ danh sách. | NC4: Khi không có bất kỳ bộ lọc hoặc từ khóa nào đang áp dụng thì nút "Xóa tất cả bộ lọc" tự động ẩn đi. |
| AC5 | Điều hướng sang màn hình Chi tiết qua dòng: Người dùng bấm chuột vào bất kỳ vị trí nào trên một dòng phiếu dịch vụ thì hệ thống chuyển hướng ngay sang màn hình Chi tiết của phiếu dịch vụ tương ứng. | NC5: Nếu đơn hàng đang bị khóa hoặc tài khoản bị thu hồi quyền truy cập giữa phiên làm việc thì hệ thống chặn chuyển hướng và thông báo lỗi. |
| AC6 | khi bấm vào nút '+ Tạo phiếu dịch vụ', hệ thống chuyển sang màn hình Khởi tạo phiếu dịch vụ mới | NC6: Nếu tài khoản chỉ có quyền xem mà không có quyền tạo đơn thì nút này bị ẩn đi. |
| AC7 | Bảo mật dữ liệu phạm vi Khối 1 (BR\_ORD\_01): Nhân viên K1 chỉ được nhìn thấy các phiếu dịch vụ thuộc những khách hàng mà mình trực tiếp phụ trách. | NC7: Người dùng cố tình nhập mã đơn của khách hàng khác trên thanh địa chỉ trình duyệt thì hệ thống chặn truy cập và ghi nhận vào nhật ký kiểm toán. |

##### c. Quy tắc nghiệp vụ (Business Rule)

| Rule ID | Mô tả |
| :---- | :---- |
| BR\_ORD\_01 | Phân quyền dữ liệu phạm vi K1 (Own-only): Người dùng thuộc vai trò Dịch vụ khách hàng / Kinh doanh (K1) chỉ được phép nhìn thấy và tra cứu các phiếu dịch vụ thuộc những khách hàng mà mình trực tiếp phụ trách (dựa trên trường Người phụ trách trên hồ sơ Khách hàng). Quyền xem toàn bộ phiếu dịch vụ của tất cả khách hàng chỉ dành riêng cho tài khoản Quản trị hệ thống (Admin) hoặc Giám đốc khối. Mọi hành vi cố tình nhập mã đơn khác trên thanh địa chỉ trình duyệt đều bị hệ thống chặn và ghi nhật ký kiểm toán. |
| BR\_ORD\_02 | Quy tắc hiển thị và suy luận trạng thái đơn hàng (Derive Badge): Giá trị hiển thị tại cột Trạng thái trên bảng danh sách bắt buộc phải được suy ra trực tiếp từ bước hiện tại của quy trình xử lý đơn hàng trên hệ thống, tuyệt đối không sử dụng một trường dữ liệu lưu tạm thời riêng biệt để tránh tình trạng lệch pha dữ liệu giữa khâu kinh doanh K1 và Tháp điều phối K3. Danh sách 8 trạng thái chuẩn và điều kiện kích hoạt: Nháp: Phiếu lưu tạm, chưa gửi K3. Tạo mới: Phiếu tạo xong chọn Gửi phiếu hoặc được Khôi phục yêu cầu. Đã tiếp nhận: K3 xem xét và chọn "Tiếp nhận phiếu". Từ chối: K3 từ chối tiếp nhận kèm lý do. Đang thực hiện: Tối thiểu 1 chặng active. Đã thực hiện: Toàn bộ các chặng hoàn thành, đã có POD. Hoàn thành: Kiểm soát công nợ thu  (K5)  bấm "Xác nhận doanh thu", chốt khóa sổ. Đã hủy: Phiếu bị hủy bởi K1.  |
| BR\_ORD\_03 | Mã phiếu dịch vụ được hệ thống tự sinh ngay khi K1 bấm "Lưu nháp" theo cấu trúc: ORDYYMMDD-XXX (trong đó ORD là tiền tố cố định, YY là 2 số cuối năm, MM là tháng, DD là ngày tạo, và XXX là số thứ tự tăng dần bắt đầu từ 001 trong ngày; ví dụ: ORD261010-045). Mã đơn sau khi sinh không thể chỉnh sửa. Nếu phiếu nháp bị xóa, mã đã sinh bị mất vĩnh viễn và không được tái sử dụng cho phiếu khác. |
| BR\_ORD\_04 | Quy tắc kết hợp logic bộ lọc (Filter Combination Logic): \- Nhóm Khách hàng (Logic OR): Khi chọn nhiều khách hàng, hệ thống lấy tập hợp đơn của Khách hàng A HOẶC Khách hàng B. \- Nhóm Trạng thái (Logic OR): Khi chọn nhiều trạng thái, hệ thống lấy tập hợp đơn có Trạng thái X HOẶC Trạng thái Y. \- Nhóm Dịch vụ yêu cầu (Logic AND): Khi chọn nhiều dịch vụ con, đơn hàng bắt buộc phải chứa toàn bộ các dịch vụ được chọn (ví dụ: chọn \[Vận tải\] và \[Kho\] thì chỉ những đơn có đồng thời cả Vận tải VÀ Kho mới được hiển thị). \- Kết hợp liên nhóm (Logic AND): Kết quả cuối cùng hiển thị trên bảng bắt buộc phải thỏa mãn đồng thời: (Từ khóa tìm kiếm) VÀ (Khách hàng) VÀ (Dịch vụ yêu cầu) VÀ (Trạng thái). |
| BR\_ORD\_05 | Đồng bộ thông tin biển số xe (SSOT từ K3): Dữ liệu tại hai cột BSX nhận hàng và BSX giao hàng trên màn hình danh sách được đồng bộ tự động từ biển số xe thực tế (nguồn SSOT gốc theo tài liệu K3), do Tháp điều phối K3 trực tiếp nhập . Nhân viên K1 tại màn hình danh sách này chỉ xem, không được chỉnh sửa. Chi tiết quy tắc nhập liệu và đồng bộ phía K3 được đặc tả tại tài liệu SRS phân hệ Tháp điều phối (K3), không thuộc phạm vi tài liệu này. Trường hợp K3 chưa cập nhật biển số xe, ô dữ liệu để trống  |

##### d. Mô tả giao diện

UI Design: [Figma \- Màn hình Danh sách Quản lý Phiếu dịch vụ](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=9584-4174&t=bNJcyeBFaqgkXBoo-4)

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=11499-125822&t=CXRNAyoybDgpXJ6a-4)

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---: | :---- | :---: | :---- | :---- |
| Ô tìm kiếm nhanh |  | Text | 100 |  | Nhập tìm theo mã phiếu dịch vụ hoặc biển số xe nhận/giao; lọc dữ liệu ngay theo thời gian thực khi gõ |
| Nút "Bộ lọc nâng cao" |  | Button |  | Thu gọn | Bấm để mở rộng hoặc thu gọn bảng chọn  nhóm tiêu chí lọc bên dưới thanh tìm kiếm |
| Huy hiệu số lượng lọc |  | Badge | 3 |  | Hiển thị tổng số điều kiện lọc đang được người dùng tích chọn (chỉ đếm số checkbox được chọn) |
| Nút "Xóa tất cả bộ lọc" |  | Button |  |  | Nút chữ đỏ, xuất hiện khi có điều kiện lọc hoặc từ khóa; bấm vào để xóa trắng toàn bộ bộ lọc |
| Nút "+ Tạo phiếu dịch vụ" |  | Button (Primary) |  |  | Nút màu xanh lá nằm ở góc phải; bấm vào để mở luồng tạo phiếu dịch vụ mới |
| Khung lọc Khách hàng |  | Checkbox (Multi-select) |  | Tất cả khách hàng | Danh sách tên khách hàng thuộc quyền quản lý; lọc theo kiểu HOẶC (OR) khi chọn nhiều khách hàng |
| Khung lọc Loại dịch vụ |  | Checkbox (Multi-select) |  | Tất cả dịch vụ | Gồm 5 hộp kiểm: Khai báo hải quan, Hải quan giám sát, Vận tải, Sang tải, Kho; lọc theo kiểu VÀ (AND), đơn phải có đủ toàn bộ các dịch vụ được chọn |
| Khung lọc Trạng thái phiếu |  | Checkbox (Multi-select) |  | Tất cả trạng thái | Gồm 8 hộp kiểm trạng thái: Nháp, Tạo mới, Đã tiếp nhận, Từ chối, Đang thực hiện, Đã thực hiện, Hoàn thành, Đã hủy; lọc theo kiểu HOẶC (OR) |
| BSX giao |  | Text |  |  | Nhập để tìm kiếm phiếu theo BSX giao,  |
| BSX nhận |  | Text |  |  | Nhập để tìm kiếm phiếu theo BSX nhận  |
| Ngày tạo |  | Date time |  |  | Chọn khoảng từ ngày đến ngày để tìm kiếm  Từ ngày \< đến ngày Tìm kiếm theo ngày tạo phiếu |
| Cột Mã phiếu dịch vụ | v | Text (Bold / Link) | 14 |  | Mã đơn hàng theo chuẩn ORDYYMMDD-XXX (ví dụ: ORD261010-045) |
| Cột Khách hàng | v | Text (Bold) | 150 |  | Tên doanh nghiệp của khách hàng đặt dịch vụ |
| Cột Các dịch vụ | v | Badge (List) | 100 |  | Hiển thị các thẻ dịch vụ con có trong phiếu (Vận tải, Kho, Khai báo HQ...) |
| Cột BSX nhận hàng |  | Text | 50 |  | Biển số xe nhận hàng đầu xuất phát (đồng bộ từ K3; nếu K3 chưa gán xe thì để trống) |
| Cột BSX giao hàng |  | Text | 50 |  | Biển số xe giao hàng đầu đích đến (đồng bộ từ K3; nếu K3 chưa gán xe thì để trống) |
| Cột Trạng thái | v | Badge | 30 |  | Hiển thị 1 trong 8 trạng thái chuẩn: \- Nháp : Phiếu lưu tạm chưa gửi sang K3. \- Tạo mới : Phiếu DV tạo xong chọn Gửi phiếu hoặc được Khôi phục. \- Đã tiếp nhận : Trưởng điều phối K3 chọn Tiếp nhận phiếu \- Từ chối : Trưởng điều phối K3 chọn Từ chối kèm lý do. \- Đang thực hiện : Tối thiểu 1 chặng active. \- Đã thực hiện: Tất cả các chặng trong phiếu DV đã hoàn thành; có POD. \- Hoàn thành : Kiểm soát công nợ thu   xác nhận doanh thu, chốt sổ. \- Đã hủy : Phiếu bị hủy kèm lý do. |
| Cột Ngày tạo | v | Date | 10 |  | Ngày tạo lập phiếu dịch vụ theo định dạng DD/MM/YYYY |

##### e. Thông báo và lỗi

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Tìm kiếm hoặc áp dụng bộ lọc không có bản ghi khớp | Thông tin | "Không tìm thấy phiếu dịch vụ nào phù hợp." | Hiển thị bảng trống với thông báo ở giữa bảng |
| Người dùng bấm "Xóa tất cả bộ lọc" | Tác vụ |  | Xóa sạch từ khóa tìm kiếm, bỏ chọn toàn bộ hộp kiểm, tải lại toàn bộ danh sách đơn hàng mặc định |
| Truy cập vào phiếu dịch vụ của khách hàng do người khác quản lý | Lỗi | "Bạn không có quyền truy cập thông tin phiếu dịch vụ này" | Chặn điều hướng, giữ nguyên màn hình hiện tại và ghi nhật ký kiểm toán hệ thống |

#### *3.1.2 US\_ORD\_02 — Khởi tạo và Gửi phiếu dịch vụ mới*

Danh mục địa lý hành chính TQ: [DanhMuc\_HanhChinh\_TrungQuoc](https://docs.google.com/spreadsheets/d/18r6iRNvQFoZ9UxmdwzEjtilbj-z6ncZWi3Eu1kIICmw/edit?usp=sharing)

##### a. User Story

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_ORD\_02 |
| **Tên Story** | Khởi tạo và Gửi phiếu dịch vụ mới |
| **User Story** | Là Nhân viên Dịch vụ khách hàng / Kinh doanh (K1), tôi muốn khởi tạo phiếu dịch vụ mới bằng cách kế thừa biểu giá từ Hợp đồng/Báo giá đang hiệu lực của khách hàng, khai báo thông số hàng hóa, chọn các dịch vụ con và đính kèm chứng từ, để gửi yêu cầu sang Tháp điều phối (K3) tiếp nhận tổ chức vận hành. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý Dịch vụ |
| **Người Phụ trách** | Đặng Thanh Sơn (BA) |

##### b. Acceptance Criteria

| STT | Tiêu chí Chấp nhận (Acceptance Criteria \- AC) | Điều kiện Thất bại (Negative Criteria \- NC) |
| :---: | :---- | :---- |
| **AC1** | **Điều hướng mở form Khởi tạo:** Bấm nút *"+ Tạo phiếu dịch vụ"* tại màn hình Danh sách (US\_ORD\_01); hệ thống mở form màn hình Tạo phiếu dịch vụ với giao diện nhập liệu dạng cuộn một trang (Single-scroll layout). | **NC1:** Người dùng không có quyền tạo đơn thì nút bị ẩn, cố tình gõ link trực tiếp bị chặn truy cập. |
| **AC2** | **Chọn Khách hàng & Kế thừa Hợp đồng, Báo giá :** Chọn một đối tác từ danh sách Khách hàng (chỉ nạp các khách hàng có Hợp đồng VÀ Báo giá đang hiệu lực). Hệ thống tự động điền số Hợp đồng nguyên tắc hiệu lực và tự động nạp Báo giá mặc định của khách hàng đó. Nếu khách hàng chưa có Báo giá mặc định, hệ thống hiển thị cảnh báo và yêu cầu K1 chọn Báo giá; Báo giá được chọn sẽ tự động trở thành mặc định cho khách hàng đó (xem BR\_ORD\_07).  | **NC2:** Khách hàng chưa có Hợp đồng hoặc Báo giá ở trạng thái ACTIVE thì không hiển thị trong danh sách chọn. |
| **AC3** | **Xem chi tiết hoặc Chuyển đổi Báo giá (BR\_ORD\_09, BR\_ORD\_10):** K1 có thể bấm *"Xem chi tiết Báo giá"* để tra cứu cơ cấu đơn giá và điều khoản. K1 có quyền đổi sang Báo giá hiệu lực khác; khi đổi Báo giá, hệ thống hiển thị hộp thoại xác nhận: cập nhật lại tuyến đường cam kết và đơn giá bán gốc, đồng thời giữ nguyên thông tin Hàng hóa và các Chứng từ đã tải lên. | **NC3:** Khi K1 chuyển đổi Báo giá nhưng không bấm xác nhận tại hộp thoại thì hệ thống giữ nguyên Báo giá hiện tại. |
| **AC4** | **Khai báo thông tin tuyến đường cam kết:** K1 chọn Loại điểm đi/đến (Địa chỉ chi tiết hoặc Cửa khẩu). Nếu chọn Địa chỉ chi tiết, chọn đủ 3 cấp hành chính (Quốc gia, Tỉnh/Thành, Phường/Xã) và nhập địa chỉ cụ thể. Nếu chọn Cửa khẩu, chọn trực tiếp cửa khẩu từ danh mục liên vận. | **NC4:** Để trống Quốc gia hoặc Tỉnh/Thành thì hệ thống báo lỗi viền đỏ trường bắt buộc. |
| **AC5** | **Khai báo thông tin hàng hóa:** Người dùng nhập tên hàng, chọn đặc tính hàng hóa, nhập Thể tích , Trọng lượng  và chọn quy cách đóng gói. | **NC5:** Nhập trọng lượng hoặc thể tích nhỏ hơn hoặc bằng 0 thì hệ thống hiển thị thông báo lỗi giá trị không hợp lệ. |
| **AC6** | **Tích chọn dịch vụ con theo Báo giá (BR\_ORD\_11.2):** Tích chọn dịch vụ con: K1 tích chọn các dịch vụ con cần thực hiện (Khai báo HQ, HQ Giám sát, Vận tải, Sang tải, Kho bãi) không phụ thuộc vào việc Báo giá có giá cho dịch vụ đó hay không. SĐT xe giao Trường hợp dịch vụ được chọn không có đầu mục giá tương ứng trong Báo giá đang áp dụng, hệ thống vẫn cho phép tạo và xử lý dịch vụ bình thường; riêng bảng giá doanh thu của dịch vụ đó tại màn Chi tiết sẽ để trống (không hiển thị đầu mục giá).  | **NC6:** Nếu không tích chọn dịch vụ con nào mà bấm "Gửi phiếu", hệ thống chặn và báo lỗi yêu cầu chọn tối thiểu 1 dịch vụ. |
| **AC7** | **Đính kèm tệp chứng từ lô hàng:** Cho phép tải lên các tệp Invoice, Packing List, C/O... Định dạng cho phép: PDF, JPG, PNG, DOCX, XLSX.  tối đa 10 file/khối đính kèm. | **NC7:** sai định dạng sẽ bị từ chối và hiển thị cảnh báo đỏ. |
| **AC8** | **Thao tác nút "Lưu nháp" (BR\_ORD\_12):** Bấm nút *"Lưu nháp"*; hệ thống lưu tạm thời dữ liệu đang nhập vào cơ sở dữ liệu,xác lập trạng thái là Nháp, sinh mã ORDYYMMDD-XXX ngay lập tức, không kiểm tra bắt buộc toàn bộ trường và không phát thông báo sang K3. | **NC8:** Lỗi mất kết nối mạng hoặc lỗi cơ sở dữ liệu hệ thống hiển thị thông báo "Lưu nháp thất bại, vui lòng thử lại". |
| **AC9** | **Thao tác nút "Gửi phiếu" (BR\_ORD\_12):** Bấm nút *"Gửi phiếu"*; hệ thống kiểm tra toàn bộ các trường bắt buộc: Nếu hợp lệ, hệ thống lưu dữ liệu, chuyển trạng thái sang Tạo mới, gửi thông báo sang Tháp điều phối (K3) và ở lại màn hình Chi tiết phiếu vừa tạo (mã phiếu đã sinh từ bước Lưu nháp). | **NC9:** Người dùng chưa điền đủ trường bắt buộc mà bấm "Gửi phiếu" thì hệ thống chặn lưu, viền đỏ các trường thiếu và cuộn màn hình đến vị trí lỗi đầu tiên. |
| **AC10** | **Thao tác nút "← Quay lại danh sách":** Bấm nút *"← Quay lại danh sách"* để hủy bỏ việc lập đơn và quay về US\_ORD\_01. Nếu đã nhập liệu, hệ thống hiển thị popup xác nhận: *"Dữ liệu chưa lưu sẽ bị mất, bạn có chắc chắn muốn thoát?"*. |  |

##### c. Quy tắc nghiệp vụ (Business Rule)

| Rule ID | Mô tả |
| :---- | :---- |
| **BR\_ORD\_06** | **Điều kiện chọn Khách hàng tạo đơn:** Khách hàng bắt buộc phải có Hợp đồng nguyên tắc đang hiệu lực VÀ có ít nhất một Báo giá khách hàng ở trạng thái Đang hiệu lực (ACTIVE). |
| **BR\_ORD\_07** | Hệ thống tự động fill Hợp đồng nguyên tắc hiệu lực và Báo giá mặc định của khách hàng. Trường hợp khách hàng chưa có Báo giá mặc định: hệ thống hiển thị cảnh báo yêu cầu K1 chọn Báo giá. Khi K1 chọn một Báo giá hiệu lực, hệ thống tự động gán Báo giá đó làm mặc định (set Is\_Default \= True) cho khách hàng đó, để các phiếu dịch vụ sau không cần chọn lại. Trường hợp khách hàng đã có Báo giá mặc định: hệ thống auto-fill Báo giá mặc định. K1 vẫn có quyền đổi sang Báo giá hiệu lực khác cho phiếu này, nhưng việc đổi không làm thay đổi cờ Is\_Default — Báo giá mặc định của khách hàng vẫn giữ nguyên. Báo giá được chọn chỉ áp dụng riêng cho phiếu dịch vụ đang tạo. |
| **BR\_ORD\_08** | **Nguyên tắc SSOT đối với thông tin thương mại (K1 làm chủ):** Các trường Thông tin chung, Tuyến đường cam kết, Thông số hàng hóa và Chứng từ ban đầu do K1 sở hữu độc quyền. khi K3 tiếp nhận phiếu (trạng thái Đã tiếp nhận trở đi) , toàn bộ các thông tin này chuyển sang trạng thái Chỉ đọc (Read-only) trên màn hình Chi tiết để K3 căn cứ thực hiện. |
| **BR\_ORD\_09** | **Quy tắc chuyển đổi Báo giá:** K1 có quyền chọn Báo giá khác ngoài Báo giá mặc định. Khi đổi Báo giá, hệ thống tự động cập nhật lại thông số tuyến đường, cửa khẩu và cơ cấu đơn giá; giữ nguyên toàn bộ dữ liệu Hàng hóa và Chứng từ đã upload. |
| **BR\_ORD\_10** | **Khóa cứng đơn giá bán gốc (SSOT Giá bán):** Đơn giá bán của các dịch vụ con kế thừa từ Báo giá được khóa cố định. K1 tuyệt đối không được phép chỉnh sửa đơn giá bán tại màn hình này. Mọi phát sinh thay đổi đơn giá phải thực hiện qua phân hệ Báo giá bổ sung. |
| **BR\_ORD\_11** | Dữ liệu vận hành thực tế do K3 làm chủ, gồm: mã tờ khai hải quan, kết quả phân luồng, kết quả kiểm hóa, vị trí/tên kho bãi và các mốc thời gian thực hiện thực tế. Thông tin phương tiện điều phối (biển số xe, số mooc, số cont, tài xế, SĐT, giấy phép, CCCD) nằm trong các tab dịch vụ con thuộc Khối Dịch vụ yêu cầu (Khối IV) cũng thuộc SSOT độc quyền của K3. Nguyên tắc hiển thị và quyền nhập: \- Các trường SSOT của K3 nêu trên (Khối IV và các trường tác nghiệp thực tế): hiển thị mờ / chỉ đọc (disabled), K1 không được phép điền; dữ liệu tự đồng bộ từ K3 khi vận hành. \- Khối "Thông tin xe (Xe giao – Xe nhận)" ở Khối III.2 (Thông tin chung): K1 được phép nhập, không bắt buộc. K1 có thể điền trước thông tin cặp xe giao – xe nhận (biển số, tải trọng, mooc, cont, tài xế…) nếu đã biết; nếu để trống, K3 sẽ cập nhật sau. \- Ràng buộc có điều kiện: với mỗi xe (xe giao / xe nhận), nếu K1 đã nhập Biển số xe thì Tải trọng xe của xe đó trở thành bắt buộc. Không nhập biển số thì tải trọng không bắt buộc. \- Nguồn ghi đè cuối (K3 ưu tiên): dữ liệu phương tiện Sang tải là loại hai bên cùng có thể nhập nhưng K3 là nguồn chốt. Khi K3 chỉnh sửa thông tin cặp xe trong quá trình điều phối, hệ thống đồng bộ đè lại theo dữ liệu K3; giá trị K1 nhập ban đầu chỉ mang tính khai báo trước. |
| **BR\_ORD\_11.2** | Quy tắc chọn dịch vụ con và hiển thị bảng giá: K1 được phép tích chọn bất kỳ dịch vụ con nào cần thực hiện, không bị giới hạn bởi Báo giá. Việc dịch vụ có được định giá trong Báo giá hay không chỉ ảnh hưởng đến bảng giá doanh thu tại màn Chi tiết: nếu Báo giá có đầu mục giá cho dịch vụ đó → hiển thị bảng giá; nếu không có → bảng giá của dịch vụ đó để trống. (Chi tiết cơ chế trích xuất giá xem BR\_ORD\_17.) |
| **BR\_ORD\_12** | **Quy tắc Lưu nháp và Gửi phiếu:** \- Bấm "Lưu nháp": Bản ghi được lưu với trạng thái Nháp, hệ thống sinh mã ORDYYMMDD-XXX ngay lập tức, không gửi thông báo K3. \- Bấm "Gửi phiếu": Kiểm tra hợp lệ toàn bộ trường bắt buộc, chuyển trạng thái sang Tạo mới, đồng thời gửi thông báo sang Tháp điều phối K3 để Trưởng điều phối tiếp nhận xem xét (mã phiếu đã sinh từ bước Lưu nháp, không sinh lại).  |

BR\_ORD\_22: Quy tắc bắt buộc các trường khi tích chọn loại dịch vụ:

- Các trường đánh dấu bắt buộc (v) chỉ được validate khi khối chứa trường đó đang hiển thị trên form

Bảng: Trường bắt buộc khi Gửi phiếu (dấu ✔)

**Khối chung — luôn bắt buộc (không phụ thuộc dịch vụ con):**

| Trường | Bắt buộc |
| ----- | ----- |
| Khách hàng | ✔ |
| Hợp đồng áp dụng | ✔ |
| Báo giá áp dụng | ✔ |
| Loại hình XNK | ✔ |
| Cửa khẩu | ✔ |
| Phương thức vận tải | ✔ |
| Loại hình vận tải | ✔ |
| Ngày yêu cầu SDDV | ✔ |
| Điểm đi/đến: Loại điểm (radio) | ✔ |
| → Nếu Loại điểm \= Địa chỉ chi tiết: Tên điểm thực tế \+ 3 cấp hành chính (Quốc gia, Tỉnh/Thành phố, Phường/Xã) | ✔ (chỉ khi chọn Địa chỉ chi tiết) |
| → Nếu Loại điểm \= Cửa khẩu: Danh mục Cửa khẩu | ✔ (chỉ khi chọn Cửa khẩu) |
| Tên hàng hóa | ✔ |
| Đặc tính hàng hóa | ✔ |
| Thể tích  | ✔ |
| Trọng lượng  | ✔ |
| Quy cách đóng gói | ✔ |
| Tối thiểu 1 dịch vụ con được chọn | ✔ |

**Theo từng dịch vụ con — chỉ bắt buộc khi dịch vụ đó được tích chọn:**

| Dịch vụ con | Trường bắt buộc riêng (khi dịch vụ này được chọn) |
| ----- | ----- |
| **Khai báo Hải quan** | Địa điểm làm thủ tục HQ ✔ |
| **Hải quan Giám sát** | Đơn vị giám sát hải quan ✔ |
| **Vận tải** | Nơi lấy hàng: Loại điểm \+ (3 cấp hành chính hoặc Cửa khẩu) \+ Tên điểm lấy thực tế ✔ Thời gian lấy hàng dự kiến ✔ Nơi giao hàng: Loại điểm \+ (3 cấp hành chính hoặc Cửa khẩu) \+ Tên điểm giao thực tế ✔ Thời gian giao hàng dự kiến ✔ |
| **Sang tải** | Địa điểm sang tải ✔ Phương thức sang tải ✔ |
| **Kho bãi** | Ngày nhập kho dự kiến ✔ Loại hình lưu kho ✔ Đơn vị tính sản lượng ✔ Số lượng lưu kho dự kiến ✔ |

**Ví dụ minh họa (chỉ chọn 1 dịch vụ):**

> Nếu K1 chỉ tích chọn dịch vụ **Vận tải** (không chọn 4 dịch vụ còn lại): hệ thống bắt buộc điền toàn bộ Khối chung \+ các trường bắt buộc riêng của Vận tải (Nơi lấy/giao hàng, thời gian dự kiến lấy/giao). Các trường của Khai báo HQ, HQ Giám sát, Sang tải, Kho bãi **không tham gia validate** vì các dịch vụ đó không được chọn.

##### d. Mô tả giao diện

UI Design: [Figma \- Màn hình Tạo Phiếu dịch vụ](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=9584-4174&t=bNJcyeBFaqgkXBoo-4)

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=11499-126031&t=CXRNAyoybDgpXJ6a-4)

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---: | :---- | :---- | :---- | :---- |
| **I. KHỐI TIÊU ĐỀ & THAO TÁC** |  |  |  |  |  |
| Tiêu đề màn hình |  | Text | 100 | Tạo phiếu dịch vụ | Tiêu đề đầu trang của màn hình tạo đơn mới |
| Nút "← Quay lại danh sách" |  | Button |  |  | K1 bấm để hủy bỏ việc lập đơn và quay về danh sách đơn hàng |
| Nút "Lưu nháp" |  | Button |  |  | Bấm để lưu tạm dữ liệu đang nhập, chuyển trạng thái đơn sang Nháp |
| Nút "Xem chi tiết Báo giá" |  | Button |  |  | Bấm để mở popup xem cơ cấu bảng giá và điều khoản Báo giá đang áp dụng |
| Nút "Gửi phiếu" | v | Button (Primary) |  |  | Nút bấm màu xanh lá; K1 bấm để gửi phiếu, sinh mã ORD và chuyển trạng thái sang Tạo mới |
| Nút "Hủy" |  | Button |  |  | Nhấn để hủy bỏ thao tác tạo mới xóa dữ liệu đã nhập và quay về màn danh sách |
| **II. KHỐI THÔNG TIN CHUNG** |  |  |  |  |  |
| Khách hàng | v | Dropdown | 150 |  | K1 chọn đối tác; hệ thống chỉ hiển thị khách hàng có Hợp đồng VÀ Báo giá đang hiệu lực |
| Hợp đồng áp dụng | v | Dropdown | 50 |  | Hệ thống tự động nạp Hợp đồng hiệu lực khi chọn Khách hàng, cho phép chọn nếu có nhiều hợp đồng |
| Báo giá áp dụng | v | Dropdown | 100 |  | Hệ thống tự động fill Báo giá mặc định, cho phép K1 đổi sang báo giá hiệu lực khác |
| Mã tham chiếu |  | Text | 50 |  | K1 nhập mã đơn PO / số booking nội bộ của khách hàng cấp |
| Loại hình XNK | v | Dropdown | 50 |  | K1 chọn: Xuất kinh doanh, Nhập kinh doanh, Tạm nhập tái xuất... |
| Cửa khẩu | v | Dropdown |  |  | K1 chọn cửa khẩu thông quan liên vận: Hữu Nghị, Tân Thanh, Móng Cái... |
| Phương thức vận tải | v | Dropdown | 50 | Đường bộ | K1 chọn: Đường bộ, Đường biển, Đường sắt, Đường hàng không |
| Loại hình vận tải | v | Dropdown | 50 | Hàng nguyên | Cho phép k1 chọn 1 trong 2: Hàng nguyên  Hàng ghép  |
| Ngày yêu cầu SDDV | v | Date | 10 | Ngày hiện tại | K1 chọn ngày khách yêu cầu bắt đầu dịch vụ, định dạng DD/MM/YYYY |
| Ghi chú chung |  | Textarea | 500 |  | K1 nhập các lưu ý vận hành chung cho đơn hàng |
| Điểm đi: Loại điểm | v | Radio button |  | Địa chỉ chi tiết | K1 chọn: Địa chỉ chi tiết hoặc Cửa khẩu |
| Điểm đi: Tên Điểm đi thực tế | v | Text | 200 |  | K1 nhập tên nhà máy, tên kho, KCN xuất phát (nếu chọn Địa chỉ chi tiết) |
| Điểm đi: 3 cấp hành chính | v | Dropdown | 200 |  | \- Nếu là quốc gia là VN thì Chọn Tỉnh/Thành → Phường/Xã. \- Nếu quốc gia là TQ thì chọn Tỉnh/Thành phố \-\> Thành phố / Địa cấp thị \-\> Quận/Huyện-\> Phường/Xã \- Và chỉ bắt buộc đến tỉnh thành |
| Điểm đi: Quốc gia | v | Dropdown | 50 |  | Chọn Quốc gia xuất phát  |
| Điểm đi: Danh mục Cửa khẩu | v | Dropdown | 50 |  | Chọn cửa khẩu xuất phát (hiển thị khi chọn Loại điểm \= Cửa khẩu) |
| Điểm đến: Loại điểm | v | Radio button |  | Địa chỉ chi tiết | K1 chọn: Địa chỉ chi tiết hoặc Cửa khẩu |
| Điểm đến: Tên Điểm đến thực tế | v | Text | 200 |  | K1 nhập tên kho, KCN đích đến (nếu chọn Địa chỉ chi tiết) |
| Điểm đến: 3 cấp hành chính | v | Dropdown | 200 |  | \- Nếu là quốc gia là VN thì Chọn Tỉnh/Thành → Phường/Xã. \- Nếu quốc gia là TQ thì chọn Tỉnh/Thành phố \-\> Thành phố / Địa cấp thị \-\> Quận/Huyện-\> Phường/Xã \- Và chỉ bắt buộc đến tỉnh thành |
| Điểm đến: Quốc gia | v | Dropdown | 50 |  | Chọn Quốc gia xuất phát (hiển thị khi chọn Loại điểm \= Cửa khẩu) |
| Điểm đến: Danh mục Cửa khẩu | v | Dropdown | 50 |  | Chọn cửa khẩu đích đến (hiển thị khi chọn Loại điểm \= Cửa khẩu) |
| **III. KHỐI THÔNG TIN VẬN HÀNH & ĐIỀU PHỐI** |  |  |  |  |  |
| *1\. Thông tin hàng hóa* |  |  |  |  |  |
| Tên hàng hóa | v | Text | 150 |  | K1 nhập tên mặt hàng thực tế của lô hàng |
| Nhóm hàng | v | Dropdown |  |  | CHọn nhóm hàng từ danh mục |
| Đặc tính hàng hóa | v | Dropdown |  |  | K1 chọn phân loại hàng: Thường, Hàng nguy hiểm, Hàng dễ vỡ, Hàng lạnh... |
| Thể tích  | v | Number | 10 |  | K1 nhập tổng thể tích thực tế của lô hàng (đơn vị: m³) |
| Trọng lượng  | v | Number | 10 |  | K1 nhập tổng trọng lượng thực tế của lô hàng Đơn vị: Tấn |
| Quy cách đóng gói | v | Dropdown | 50 |  | K1 chọn hình thức đóng gói: Pallet, Thùng carton, Bao bì, Kiện gỗ... |
| *2\. Thông tin xe (Xe giao \- Xe nhận)* |  |  |  |  |  |
| Biển số xe giao |  | Text | 20 |  | K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| Trọng lượng xe |  | Number | 10 |  | K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3  Nếu đã điền BSX thì bắt buộc điền tải trọng xe |
| Số Mooc xe giao |  | Text | 20 |  | Số rơ-mooc xe giao K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| Số Container xe giao |  | Text | 20 |  | Số hiệu container xe giao K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| Tài xế  |  | Text | 100 |  | Họ tên tài xế K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| SĐT xe giao  |  | Text |  |  | K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| CCCD |  | Number |  |  | K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| Chứng từ kèm theo xe |  | File upload / Text | 50 |  | Giấy phép thông hành qua biên giới do  K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| Biển số xe nhận |  | Text | 20 |  | Biển số xe nhận đối ứng  K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| Số Mooc xe nhận |  | Text | 20 |  | Số rơ-mooc xe nhận do  K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| Số Container xe nhận |  | Text | 20 |  | Số hiệu container xe nhận  K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| Tài xế |  | Text | 100 |  | K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| SĐT xe nhận  |  | Text  |  |  | K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| CCCD lái xe nhận |  | text | 20 |  | K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| Chứng từ kèm theo xe |  | File |  |  | K1 nếu có thông tin có thể nhập nếu không thì sẽ do K3 nhập và đồng bộ về  SSOT thuộc K3 |
| **IV. KHỐI DỊCH VỤ YÊU CẦU** |  |  |  |  |  |
| Danh sách hộp kiểm dịch vụ | v | Checkbox list |  |  | K1 tích chọn dịch vụ con cần thực hiện (không giới hạn theo Báo giá) |
| *1\. Dịch vụ Khai báo Hải quan* |  |  |  |  |  |
| Địa điểm làm thủ tục HQ | v | Dropdown | 100 |  | K1 chọn chi cục hải quan làm thủ tục (Hải quan Hữu Nghị, Cốc Nam...) |
| Số lượng tờ khai |  | Number | 5 |  | K1 nhập số lượng tờ khai dự kiến mở |
| Ghi chú khai báo |  | Textarea | 500 |  | K1 nhập các lưu ý khai báo hải quan |
| Chứng từ lô hàng |  | File upload |  |  | K1 tải lên các tệp Invoice, Packing List, C/O... (PDF, JPG, PNG \<= 10MB) |
| *2\. Dịch vụ Hải quan Giám sát* |  |  |  |  |  |
| Đơn vị giám sát hải quan |  | Dropdown | 100 |  | K1 chọn chi cục/đơn vị hải quan thực hiện giám sát |
| Số tờ khai liên quan |  | Text | 50 |  | K1 nhập số tờ khai liên quan cần đưa vào diện giám sát |
| Chứng từ lô hàng |  | File upload |  |  | K1 tải tệp phiếu đăng ký giám sát hải quan |
| Ghi chú giám sát |  | Textarea | 500 |  | K1 nhập các lưu ý giám sát bãi |
| *3\. Dịch vụ Vận tải* |  |  |  |  |  |
| Thêm cặp địa điểm |  | Button |  |  | Nhấn để thêm 1 cặp điểm lấy/giao |
| Sao chép |  | Button |  |  | Nhấn để sao chép cặp điểm lấy/giao |
| Xóa |  | Button |  |  | Nhấn để xóa cặp điểm lấy/giao |
| Điểm lấy hàng: Loại điểm | v | Radio button |  | Địa chỉ chi tiết | K1 chọn: Địa chỉ chi tiết hoặc Cửa khẩu |
| Nơi lấy hàng: 3 cấp hành chính | v | Dropdown | 200 |  | \- Nếu là quốc gia là VN thì Chọn Tỉnh/Thành → Phường/Xã. \- Nếu quốc gia là TQ thì chọn Tỉnh/Thành phố \-\> Thành phố / Địa cấp thị \-\> Quận/Huyện-\> Phường/Xã \- Và chỉ bắt buộc đến tỉnh thành |
| Địa chỉ chi tiết | v | Text | 200 |  | K1 nhập địa chỉ chi tiết nơi lấy hàng |
| Điểm lấy hàng: Quốc gia | v | Dropdown | 50 |  | Chọn Quốc gia xuất phát  |
| Điểm lấy hàng: Danh mục Cửa khẩu | v | Dropdown | 50 |  | Chọn cửa khẩu xuất phát (hiển thị khi chọn Loại điểm \= Cửa khẩu) |
| Liên hệ lấy hàng |  | Text | 100 |  | K1 nhập họ tên và SĐT người giao hàng tại điểm lấy |
| Thời gian hàng dự kiến lấy  | v | Datetime | 16 |  | K1 chọn ngày giờ dự kiến lấy hàng xuất phát |
| Yêu cầu bốc xếp tại điểm lấy hàng |  | Checkbox |  |  | Tích chọn nếu yêu cầu công nhân bốc xếp tại điểm lấy |
| Ghi chú chung cho điểm giao hàng |  | Text |  |  |  |
| Nơi giao hàng: Loại điểm | v | Radio button |  | Địa chỉ chi tiết | K1 chọn: Địa chỉ chi tiết hoặc Cửa khẩu |
| Nơi giao hàng: 3 cấp hành chính | v | Dropdown | 200 |  | \- Nếu là quốc gia là VN thì Chọn Tỉnh/Thành → Phường/Xã. \- Nếu quốc gia là TQ thì chọn Tỉnh/Thành phố \-\> Thành phố / Địa cấp thị \-\> Quận/Huyện-\> Phường/Xã \- Và chỉ bắt buộc đến tỉnh thành |
| Địa chỉ chi tiết | v | Text | 200 |  | K1 nhập địa chỉ chi tiết nơi giao hàng |
| Điểm giao hàng: Quốc gia | v | Dropdown | 50 |  | Chọn Quốc gia xuất phát  |
| Điểm Giao hàng: Cửa khẩu | v | Dropdown | 50 |  | Chọn cửa khẩu xuất phát (hiển thị khi chọn Loại điểm \= Cửa khẩu) |
| Liên hệ giao hàng |  | Text | 100 |  | K1 nhập họ tên và SĐT người nhận hàng tại điểm giao |
| Thời gian hàng dự kiến giao | v | Datetime | 16 |  | K1 chọn ngày giờ dự kiến giao hàng đến đích |
| Yêu cầu bốc xếp giao hàng |  | Checkbox |  |  | Tích chọn nếu yêu cầu công nhân bốc xếp tại điểm giao |
| Ghi chú chung cho điểm giao |  | Textarea | 500 |  | K1 nhập các lưu ý vận chuyển |
| *4\. Dịch vụ Sang tải* |  |  |  |  |  |
| Địa điểm sang tải | v | Dropdown | 100 |  | K1 chọn bãi sang tải (Bãi xe Hữu Nghị, Bãi Xuân Cương...) |
| Phương thức sang tải | v | Dropdown | 50 | Xe sang Xe | Xe cẩu, Xe nâng, Đội cửu vạn |
| Loại hình sang tải |  | Dropdown |  |  |  |
| Ghi chú hoạt động sang tải |  | Textarea | 500 |  | K1 nhập lưu ý sang tải hàng hóa |
| Chứng từ lô hàng |  | File / upload |  |  |  |
| *5\. Dịch vụ Kho bãi* |  |  |  |  |  |
| Tên kho  |  | dropdown | 100 |  | Tên kho lưu |
| Số ngày lưu kho dự kiến |  | Number | 5 |  | K1 nhập số ngày dự kiến lưu kho |
| Loại hình lưu kho | v | Dropdown | 50 | Kho thường | K1 chọn: Kho thường, Kho mát, Kho lạnh, Kho ngoại quan |
| Đơn vị tính sản lượng |  | Dropdown |  |  | Chọn từ danh mục quy cách đóng gói |
| Số lượng lưu kho dự kiến |  | Number | 10 |  | K1 nhập số lượng sản lượng dự kiến lưu kho |
| Chứng từ lô hàng |  | File upload |  |  | K1 tải lên phiếu gửi hàng hoặc chứng từ lưu kho |
| Ghi chú lưu kho |  | Textarea | 500 |  | K1 nhập yêu cầu nhiệt độ bảo quản, vị trí pallet |

##### e. Thông báo và lỗi

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| KH chưa có BG mặc định  |  | "⚠️ Khách hàng chưa được thiết lập Báo giá mặc định. Vui lòng chọn một Báo giá đang hiệu lực hoặc quay lại phân hệ Báo giá để cài đặt."  | Hiển thị cảnh báo vàng; ô Báo giá để trống chờ K1 chọn. **Khi K1 chọn xong, hệ thống tự động gán BG đó làm mặc định cho KH**  |
| Người dùng bấm nút "Gửi phiếu" khi chưa nhập đủ trường bắt buộc (\*) | Lỗi | "Vui lòng nhập đầy đủ các thông tin bắt buộc có dấu (\*)" | Viền đỏ các ô bị thiếu thông tin, chặn gửi phiếu và cuộn màn hình đến vị trí lỗi đầu tiên |
| Người dùng bấm nút "Gửi phiếu" thành công | Thành công | "Tạo phiếu dịch vụ thành công. Đơn hàng đã được gửi sang Tháp điều phối." | Hiển thị thông báo thành công xanh lá, và điều hướng về màn hình Chi tiết Phiếu dịch vụ |

#### *3.1.3 US\_ORD\_03 — Xem chi tiết Phiếu dịch vụ và Theo dõi tiến độ vận hành*

##### a. User Story

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_ORD\_03 |
| **Tên Story** | Xem chi tiết Phiếu dịch vụ và Theo dõi tiến độ vận hành |
| **User Story** | Là Nhân viên Dịch vụ khách hàng (K1) hoặc Kiểm soát công nợ thu  (K5), tôi muốn xem chi tiết thông tin phiếu dịch vụ, giám sát tiến độ chặng từ Tháp điều phối (K3), tra cứu bảng giá doanh thu từng dịch vụ, và thực hiện đối soát xác nhận doanh thu đóng đơn, để đảm bảo quản lý chất lượng dịch vụ và quyết toán tài chính chính xác. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý Dịch vụ |
| **Người Phụ trách** | Đặng Thanh Sơn (BA) |

##### b. Acceptance Criteria

| STT | Tiêu chí Chấp nhận (Acceptance Criteria \- AC) | Điều kiện Thất bại (Negative Criteria \- NC) |
| :---: | :---- | :---- |
| **AC1** | **Hiển thị thông tin thương mại (Chỉ đọc \- BR\_ORD\_14):** Khối Thông tin chung, Tuyến đường và Hàng hóa hiển thị đầy đủ ở chế độ Chỉ đọc (Read-only) nhằm đảm bảo tính toàn vẹn dữ liệu cho K3 thực thi. | **NC1:** Người dùng không có quyền chỉnh sửa trực tiếp các thông tin thương mại tại màn hình này sau khi phiếu đã gửi đi. |
| **AC2** | **Đồng bộ tiến độ hiện trường từ K3 (BR\_ORD\_15):** Dữ liệu biển số xe, tài xế, mã tờ khai hải quan, kết quả phân luồng, kiểm hóa và thời gian thực hiện tự động hiển thị cập nhật theo thời gian thực từ K3. | **NC2:** Nếu K3 chưa cập nhật thông tin thì các trường tương ứng hiển thị trạng thái chờ hoặc để trống. |
| **AC3** | **Hiển thị Cấu trúc chặng vận chuyển (BR\_ORD\_16):** Khi K3 (CC) xác nhận cấu trúc Chặng, hệ thống đồng bộ cách hiển thị Chặng về màn hình Chi tiết của K1 (dạng Accordion) để K1 theo dõi tiến độ lô hàng theo từng Chặng.  Khi phiếu ở trạng thái Nháp, Tạo mới, Đã tiếp nhận, Từ chối, Đã hủy và chưa xác nhận cấu trúc chặng thì hệ thống hiển thị dạng danh sách phẳng (Flat list). \- Danh sách phẳng (Flat list)" nghĩa là **các tab/card dịch vụ con (Khai báo HQ, HQ Giám sát, Vận tải, Sang tải, Kho bãi) được liệt kê ngang hàng nhau** (hệ thống Tabs hoặc danh sách card liên tiếp), **không nhóm theo Chặng**  \- Tại màn chi tiết doanh thu của phiếu dịch vụ Khi tạo dịch vụ: chỉ hiển thị các đầu mục doanh thu cố định trong báo giá khách hàng Sau khi làm dịch vụ: \- Nếu phía thực hiện thêm chi phí phụ phí và đầu mục phụ phí đó nằm trong báo giá thì sẽ hiển thị đầu mục phụ phí đó trong tab doanh thu Đối với đầu mục phát sinh: \- Khi có chi phí phát sinh thì doanh thu sẽ hiển thị như bên chi phí ĐVT \= ĐVT Tên đầu mục \= đầu mục doanh thu SL \= SL Đơn giá \= Đơn giá ( quy đổi loại tiền của đơn giá chi phí \= loại tiền của báo giá)  Doanh thu từng đầu mục được **ghi nhận đồng thời với Chi phí (1:1)** theo trạng thái dòng giá tương ứng trong Báo giá khách hàng tại thời điểm ghi nhận:  Dòng báo giá “Đang hiệu lực” → Doanh thu \= Đơn giá;  Hết hạn → Doanh thu \= null. Không có dòng báo giá tương ứng  → Doanh thu \= null. Chi tiết tại **US\_ORD\_06 (BR\_ORD\_29 – BR\_ORD\_34)**. Quy tắc hiển thị đầu mục cố định ngay khi tạo dịch vụ cần chốt lại — Mục 4, điểm Q1. |  |
| **AC4** | **Tra cứu Bảng giá Doanh thu theo từng dịch vụ con (BR\_ORD\_17):** Bấm chọn từng tab dịch vụ con để xem Bảng giá doanh thu riêng biệt của dịch vụ đó. Phía trên bảng giá hiển thị các thuộc tính điều kiện trích xuất từ Báo giá. Bảng giá gồm đúng 6 cột: STT, Đầu mục doanh thu, ĐVT, SL, Đơn giá, Thành tiền. Dòng tổng cộng hiển thị tổng tiền của dịch vụ đó. | **NC3:** Đơn giá bán gốc kế thừa từ Báo giá khách hàng bị khóa cứng, K1 không được phép sửa. |
| **AC5** | **Xem Nhật ký Tháp điều phối (BR\_ORD\_19):** Cột bên phải hiển thị dòng thời gian Nhật ký điều phối do K3 cập nhật (sắp xếp mới nhất lên đầu). |  |
| **AC6** | **Nút Chỉnh sửa phiếu dịch vụ:** Nút *"Chỉnh sửa phiếu"* hiển thị khi phiếu ở trạng thái Nháp, Tạo mới (khi K3 chưa nhận), Từ chối hoặc Đã hủy. Khi bấm, hệ thống cho phép sửa thông tin và ghi nhận vào Lịch sử hoạt động. | **NC4:** Khi phiếu đã được K3 bấm "Tiếp nhận phiếu" hoặc đang thực hiện, nút Chỉnh sửa phiếu bị ẩn/khóa. |
| **AC7** | **Xác nhận Doanh thu quyết toán (K5 \- BR\_ORD\_18):** Nút *"Xác nhận doanh thu"* chỉ hiển thị với vai trò K5 khi phiếu ở trạng thái **Đã thực hiện** (đã hoàn thành tất cả các chặng). Bấm nút sẽ mở Popup Đối soát doanh thu chi tiết từng dịch vụ con. Khi K5 xác nhận, phiếu chuyển sang **Hoàn thành**, chốt khóa sổ vĩnh viễn dữ liệu đơn hàng. | **NC5:** Tài khoản K1 hoặc người dùng không thuộc vai trò K5 không được hiển thị nút này; hệ thống chặn gọi API trực tiếp và ghi nhật ký an ninh. |
| **AC8** | **Xuất Bảng kê quyết toán:** Khi phiếu đạt trạng thái Hoàn thành, hệ thống kích hoạt nút 'Xuất Bảng kê' Nợ template và cho phép xuất theo định dạng Excel hoặc PDF để tải tệp quyết toán chính thức |  |
| **AC9** | **Hủy phiếu dịch vụ (BR\_ORD\_20):** Nút *"Hủy phiếu"* khả dụng khi phiếu ở trạng thái Tạo mới, Đã tiếp nhận (trước khi có chặng active), hoặc Từ chối. Khi bấm, mở popup yêu cầu nhập lý do hủy. Nếu hủy tại Đã tiếp nhận, hệ thống tự động bắn thông báo khẩn sang K3 để thu hồi lệnh điều phối. | **NC6:** Phiếu đã có ít nhất một chặng chuyển sang Đang thực hiện thì nút Hủy phiếu bị vô hiệu hóa hoàn toàn. |
| **AC10** | **Khôi phục yêu cầu dịch vụ:** Nút *"Khôi phục yêu cầu"* hiển thị khi phiếu ở trạng thái Từ chối hoặc Đã hủy. Bấm vào hệ thống chuyển trạng thái phiếu về lại **Tạo mới** để gửi sang K3 xem xét lại, ghi nhận vào Nhật ký điều phối. |  |

##### c. Quy tắc nghiệp vụ (Business Rule)

| Rule ID | Mô tả |
| :---- | :---- |
| **BR\_ORD\_13** | **Kế thừa phân quyền dữ liệu K1 (Own-only Detail):** Nhân viên K1 chỉ có quyền xem chi tiết các phiếu dịch vụ thuộc những khách hàng do mình trực tiếp phụ trách. Hệ thống kiểm tra quyền truy cập ở cấp độ API; mọi truy cập trái phép bằng URL trực tiếp đều bị từ chối và ghi log an ninh. |
| **BR\_ORD\_14** | **Tính toàn vẹn của Dữ liệu thương mại (SSOT Khối 1):** Toàn bộ thông tin thương mại (Khách hàng, Hợp đồng, Báo giá, Tuyến đường cam kết, Hàng hóa) do K1 xác lập. Tại màn hình Chi tiết sau khi K3 Tiếp nhận phiếu, các trường này hiển thị ở chế độ Chỉ đọc (Read-only) nhằm đảm bảo tính toàn vẹn dữ liệu cho K3 thực thi. |
| **BR\_ORD\_15** | **Đồng bộ dữ liệu hiện trường thời gian thực (SSOT Tháp điều phối K3):** Dữ liệu phương tiện (BSX, số mooc, số cont, tài xế, SĐT, phiếu cân), mã tờ khai hải quan, kết quả phân luồng, kết quả kiểm hóa bãi, trạng thái của các dịch vụ yêu cầu và thời gian giao nhận thực tế thuộc quyền sở hữu độc quyền của K3. Màn hình Chi tiết của K1 chỉ đóng vai trò hiển thị giám sát, tự động đồng bộ từ K3 theo thời gian thực. |
| **BR\_ORD\_16** | **Chuyển đổi giao diện hiển thị Dịch vụ con theo vòng đời**  \- *Giai đoạn trước vận hành (Nháp, Tạo mới, Đã tiếp nhận (CC chưa xác nhận cấu trúc chặng), Từ chối, Đã hủy):* Hệ thống hiển thị dạng danh sách phẳng (Flat list) liệt kê các dịch vụ con. \- *Giai đoạn thực thi (Đã tiếp nhận(CC đã xác nhận cấu trúc chặng), Đang thực hiện, Đã thực hiện, Hoàn thành):* Hệ thống tự động chuyển sang mô hình Cấu trúc chặng vận tải liên vận dạng Accordion \- Danh sách phẳng (Flat list)" nghĩa là **các tab/card dịch vụ con (Khai báo HQ, HQ Giám sát, Vận tải, Sang tải, Kho bãi) được liệt kê ngang hàng nhau** (hệ thống Tabs hoặc danh sách card liên tiếp), **không nhóm theo Chặng**  |
| **BR\_ORD\_17** | **Quy tắc trích xuất và hiển thị Bảng giá doanh thu cho từng dịch vụ con:  1\. Cơ chế trích xuất bảng giá (matching):** Với mỗi dịch vụ con được chọn trong phiếu, hệ thống dò trong Báo giá đang áp dụng để tìm Biểu giá bán có **loại dịch vụ trùng khớp** VÀ có **thuộc tính điều kiện khớp** với thông tin đã khai trên phiếu. Bộ thuộc tính matching theo từng dịch vụ: **Khai báo Hải quan:** Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe  **Hải quan Giám sát:** Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe **Vận tải:** Điểm đi, Điểm đến, Loại xe **Sang tải:** Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa **Kho bãi:** Tên kho, Loại kho Khi khớp đủ thuộc tính, hệ thống lấy toàn bộ đầu mục doanh thu của Biểu giá bán đó hiển thị vào bảng giá của dịch vụ con tương ứng. **2\. Trường hợp không khớp / không có giá:** Nếu dịch vụ con được chọn nhưng Báo giá đang áp dụng **không có Biểu giá bán khớp** (không có loại dịch vụ đó, hoặc không có thuộc tính phù hợp), hệ thống **vẫn cho phép tạo và xử lý phiếu bình thường**; riêng bảng giá doanh thu của dịch vụ đó tại màn Chi tiết **để trống** (không hiển thị đầu mục giá). **3\. Số lượng (SL):** SL của mỗi đầu mục được xác định dựa trên **Đơn vị tính (ĐVT)** đồng bộ từ K3 **4\. Cấu trúc bảng giá:** Bảng gồm 6 cột: STT, Đầu mục doanh thu, ĐVT, SL, Đơn giá, Thành tiền. Công thức **Thành tiền \= SL × Đơn giá**. Đơn giá bán gốc khóa cố định theo Báo giá (Read-only, K1 không sửa). Dòng tổng cộng \= tổng Thành tiền toàn bộ đầu mục trong dịch vụ đó. **5\. Nguồn số lượng theo vòng đời (dự kiến → thực tế):** SL ưu tiên lấy theo **số liệu thực tế** do K3 cập nhật trong quá trình vận hành. Khi chưa có số liệu thực tế, hệ thống **tạm dùng số dự kiến do K1 nhập** để ước tính Thành tiền; khi K3 cập nhật số thực tế, hệ thống **tự động tính lại** theo số thực tế. Nếu không có cả số dự kiến lẫn số thực tế cho một đầu mục, cột SL và Thành tiền của đầu mục đó **để trống**. Giá trị chính thức để quyết toán là SL thực tế tại thời điểm K5 xác nhận doanh thu. **6\.** "Tại màn chi tiết doanh thu của phiếu dịch vụ Khi tạo dịch vụ: chỉ hiển thị các đầu mục doanh thu cố định trong báo giá khách hàng Sau khi làm dịch vụ: \- Nếu phía thực hiện thêm chi phí phụ phí và đầu mục phụ phí đó nằm trong báo giá thì sẽ hiển thị đầu mục phụ phí đó trong tab doanh thu  Đối với đầu mục phát sinh: \- Khi có chi phí phát sinh thì doanh thu sẽ hiển thị như bên chi phí ĐVT \= ĐVT  Tên đầu mục \= đầu mục doanh thu SL \= SL Đơn giá \= Đơn giá ( quy đổi loại tiền của đơn giá chi phí \= loại tiền của báo giá)" **7\. Ghi nhận Doanh thu theo Chi phí và trạng thái dòng giá:** Doanh thu của từng đầu mục được sinh theo từng dòng Chi phí (1:1) và theo trạng thái dòng giá tương ứng trong Báo giá khách hàng (Đang hiệu lực / Hết hạn / Không có dòng giá) — xem BR\_ORD\_29 – BR\_ORD\_34. |
| **BR\_ORD\_18** | **Quy tắc Xác nhận doanh thu chuyển trạng thái Hoàn thành (K5 RACI):** \- Thao tác "Xác nhận doanh thu" chỉ xuất hiện và khả dụng khi phiếu dịch vụ ở trạng thái **Đã thực hiện** (toàn bộ các chặng vận tải và dịch vụ trong đơn đã hoàn tất, có đầy đủ biên bản bàn giao POD). \- Quyền bấm nút thuộc về vai trò “Kiểm soát công nợ thu” (Kế toán K5). \- Khi K5 bấm nút và xác nhận bảng đối soát, hệ thống lập tức chuyển trạng thái phiếu sang **Hoàn thành**, ghi nhận doanh thu chính thức, khóa đóng băng toàn bộ số liệu của phiếu dịch vụ (vĩnh viễn không thể chỉnh sửa) và kích hoạt tính năng xuất bảng kê quyết toán. |
| **BR\_ORD\_19** | **Quy tắc hiển thị Nhật ký Tháp điều phối (Coordination Timeline):** Dữ liệu nhật ký K3 được hiển thị theo thứ tự thời gian giảm dần (sự kiện mới nhất trên đầu). Mỗi bản ghi gồm: thời gian (DD/MM/YYYY HH:mm), dịch vụ phát sinh sự kiện và mô tả nội dung thay đổi do K3 cập nhật. |
| **BR\_ORD\_20** | **Điều kiện ràng buộc khi Hủy phiếu dịch vụ:** 1\. Người dùng chỉ được bấm "Hủy phiếu" khi phiếu ở trạng thái **Tạo mới**, **Đã tiếp nhận** (với điều kiện chưa có bất kỳ chặng nào kích hoạt Đang thực hiện), hoặc **Từ chối**. 2\. Khi phiếu đã có ít nhất 1 chặng chuyển sang Đang thực hiện, nút "Hủy phiếu" bị vô hiệu hóa hoàn toàn. 3\. Bắt buộc nhập lý do hủy. Nếu hủy tại Đã tiếp nhận, hệ thống tự động gửi cảnh báo sang K3 để thu hồi lệnh điều phối. |
| **BR\_ORD\_21**  | Đồng bộ trạng thái dịch vụ con từ K3 : Mỗi dịch vụ con (Khai báo HQ, HQ Giám sát, Vận tải, Sang tải, Kho bãi) có trạng thái riêng gồm 4 mốc tuần tự: Chưa thực hiện → Điều phối → Đang thực hiện → Đã thực hiện. Trạng thái này do Điều phối viên dịch vụ con (K3) cập nhật và đồng bộ tự động về màn hình Chi tiết của K1 theo thời gian thực. K1 chỉ xem (Read-only), không có quyền thay đổi trạng thái dịch vụ con. Badge trạng thái hiển thị trên mỗi tab/card dịch vụ con tương ứng. |

##### d. Mô tả giao diện

UI Design: [Figma \- Màn hình Danh sách Quản lý Phiếu dịch vụ](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=9584-4174&t=bNJcyeBFaqgkXBoo-4)

###### A. Bảng quy tắc hiển thị Nút bấm thao tác & Thành phần giao diện theo từng Trạng thái phiếu

| Trạng thái phiếu | Vai trò | Các nút bấm thao tác hiển thị trên Header | Thành phần giao diện đặc thù đi kèm | Hành vi khi bấm nút |
| :---- | :---- | :---- | :---- | :---- |
| **1\. Nháp** | K1 | \- "← Quay lại danh sách" \- "Chỉnh sửa phiếu" \- "Gửi phiếu" \- "Xóa phiếu" | Banner xám: *"Phiếu dịch vụ đang ở dạng Nháp, chưa gửi sang Tháp điều phối"* | \- **"Chỉnh sửa phiếu":** Mở form sửa toàn bộ dữ liệu \- **"Gửi phiếu":** Kiểm tra hợp lệ, sinh mã ORD và chuyển Tạo mới \- **"Xóa phiếu":** Xóa hẳn bản ghi khỏi DB |
| **2\. Tạo mới** | K1 | \- "← Quay lại danh sách" \- "Lịch sử hoạt động" \- "Chỉnh sửa phiếu" \- "Hủy phiếu" | \- Thanh tiến trình: Sáng mốc 1 \- Khối dịch vụ: Dạng danh sách phẳng (Flat list) \- Sidebar: Thao tác ngoại lệ bị khóa mờ | \- **"Chỉnh sửa phiếu":** Mở form cho phép sửa thông tin (chỉ khả dụng khi K3 chưa nhận) \- **"Hủy phiếu":** Mở modal nhập lý do hủy |
| **3\. Đã tiếp nhận** | K1 | \- "← Quay lại danh sách" \- "Lịch sử hoạt động" \- "Hủy phiếu" | \- Thanh tiến trình: Đã xong mốc 1, sáng mốc 2 \- Khối dịch vụ: Dạng danh sách phẳng \- Nút "Hủy phiếu" chỉ khả dụng trước khi có chặng active | \- **"Hủy phiếu":** Mở modal hủy; hệ thống gửi thông báo thu hồi điều phối sang K3 |
| **4\. Từ chối** | K1 | \- "← Quay lại danh sách" \- "Lịch sử hoạt động" \- "Chỉnh sửa phiếu" \- "Khôi phục yêu cầu" \- "Hủy phiếu" | Banner cảnh báo màu cam gạch: Hiển thị rõ lý do Trưởng điều phối K3 từ chối tiếp nhận | \- **"Chỉnh sửa phiếu":** Sửa thông tin theo góp ý của K3 \- **"Khôi phục yêu cầu":** Gửi lại phiếu cho K3 xem xét (chuyển về Tạo mới) \- **"Hủy phiếu":** Hủy đơn |
| **5\. Đang thực hiện** | K1 | \- "← Quay lại danh sách" \- "Lịch sử hoạt động" | \- Thanh tiến trình: Sáng mốc 3 \- Khối dịch vụ: Cấu trúc chặng | K1 theo dõi tiến độ chặng ; không còn quyền hủy phiếu |
| **6\. Đã thực hiện** | K1/K5 | \- "← Quay lại danh sách" \- "Lịch sử hoạt động" \- "Xác nhận doanh thu" | \- Thanh tiến trình: Sáng mốc 4 \- Khối dịch vụ: Cấu trúc chặng hoàn tất 100% \- Xuất hiện nút "Xác nhận doanh thu" màu xanh lá dành riêng cho K5 | \- **"Xác nhận doanh thu":** Mở Popup Bảng đối soát doanh thu chi tiết từng dịch vụ để K5 kiểm tra và xác nhận |
| **7\. Hoàn thành** | K1 / K5 | \- "← Quay lại danh sách" \- "Lịch sử hoạt động" \- "Xuất bảng kê" Nợ template bảng kê | \- Thanh tiến trình: Hoàn tất cả 5 mốc \- Badge trạng thái: Hoàn thành (Xanh lá) \- Toàn bộ dữ liệu đơn hàng và doanh thu bị khóa đóng băng vĩnh viễn | Bấm các nút để tải về file bảng kê quyết toán và biên bản đối chiếu dịch vụ |
| **8\. Đã hủy** | K1 | \- "← Quay lại danh sách" \- "Lịch sử hoạt động" \- "Chỉnh sửa phiếu" \- "Khôi phục yêu cầu" | Banner đỏ thông báo lý do hủy đơn và người thực hiện hủy | \- **"Chỉnh sửa phiếu":** Cập nhật lại thông tin đơn \- **"Khôi phục yêu cầu":** Kích hoạt lại đơn, chuyển về Tạo mới để gửi sang K3 |

###### B. Danh sách Popup / Hộp thoại trên màn hình Chi tiết

###### 1\. Popup Xác nhận Doanh thu 

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài | Mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Tiêu đề Popup |  | Text | 100 | Đối soát & Xác nhận doanh thu | Tiêu đề hộp thoại của K5 |
| Mã phiếu dịch vụ |  | Text | 14 |  | Mã phiếu cần xác nhận (VD: ORD261010-045) |
| Tên khách hàng |  | Text | 150 |  | Tên doanh nghiệp khách hàng |
| Bảng đối soát theo dịch vụ con |  | Table |  |  | Mỗi dòng \= 1 dịch vụ con đã thực hiện, gồm các cột: Tên dịch vụ, Doanh thu dịch vụ (tổng từ bảng giá của dịch vụ đó). K5 chỉ xem, không sửa |
| Dòng Tổng doanh thu quyết toán |  | Number | 15 |  | Tổng cộng doanh thu toàn bộ dịch vụ con (đơn vị VND) |
| Cảnh báo khóa sổ |  | Text | 250 |  | "Sau khi xác nhận, phiếu chuyển sang Hoàn thành và toàn bộ dữ liệu bị khóa vĩnh viễn, không thể chỉnh sửa." |
| Nút "Quay lại" |  | Button |  |  | Đóng popup, giữ nguyên trạng thái Đã thực hiện |
| Nút "Xác nhận hoàn thành" | v | Button (Primary) |  |  | K5 bấm để chuyển phiếu sang Hoàn thành và khóa sổ |

###### 2\. Popup Lịch sử hoạt động

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---: | :---- | :---- | :---- | :---- |
| Phân biệt 2 luồng:  **Nhật ký điều phối** (gửi/khôi phục phiếu, cập nhật từ K3) và  **Lịch sử hoạt động** (K1 chỉnh sửa thông tin phiếu)  |  |  |  |  |  |
| Tiêu đề Popup |  | Text | 100 | Lịch sử hoạt động bất biến | Tiêu đề popup kèm mã đơn hàng đang tra cứu |
| Danh sách nhật ký |  | Timeline |  |  | Danh sách các bản ghi nhật ký sắp xếp giảm dần theo thời gian |
| Cột Thời điểm | v | Datetime | 19 |  | Thời gian ghi nhận sự kiện hệ thống theo định dạng DD/MM/YYYY HH:mm:ss |
| Cột Mã sự kiện | v | Badge | 30 |  | Mã định danh sự kiện: ORDER\_CREATED, STATUS\_CHANGED, REVENUE\_CONFIRMED... |
| Cột Người thực hiện | v | Text | 100 |  | Họ tên kèm vai trò nhân sự thao tác (Đặng Thanh Sơn \- K1, Lê Thị Mai \- K5...) |
| Cột Nội dung ghi nhận | v | Text | 500 |  | Mô tả chi tiết hành động hoặc dữ liệu trước/sau biến động |
| Nút "Đóng lại" |  | Button |  |  | Bấm để đóng popup xem nhật ký |

###### 3\. Popup Xác nhận Hủy phiếu dịch vụ (Cancel Order Modal)

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---: | :---- | :---- | :---- | :---- |
| Tiêu đề Popup |  | Text | 50 | Hủy phiếu dịch vụ | Tiêu đề hộp thoại cảnh báo xác nhận hủy |
| Mã phiếu dịch vụ |  | Text | 14 |  | Hiển thị mã phiếu dịch vụ chuẩn bị hủy để người dùng đối chiếu |
| Lý do hủy phiếu | v | Textarea | 500 |  | K1 bắt buộc phải nhập nguyên nhân hủy đơn (ví dụ: Khách hàng hoãn lịch xuất...) |
| Cảnh báo quy trình |  | Text | 200 |  | Dòng chữ đỏ: *"Hành động này sẽ hủy bỏ đơn hàng. Vui lòng kiểm tra kỹ trước khi xác nhận."* |
| Nút "Quay lại" |  | Button |  |  | Bấm để hủy bỏ thao tác và giữ nguyên trạng thái đơn hàng |
| Nút "Xác nhận hủy phiếu" | v | Button (Danger) |  |  | Nút màu đỏ; bấm vào hệ thống chuyển trạng thái đơn sang Đã hủy và ghi nhận vào Audit Log |

###### C. Bảng mô tả chi tiết các trường dữ liệu trên màn hình Chi tiết

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=11499-124107&t=CXRNAyoybDgpXJ6a-4)

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | ----- | :---- | :---- | :---- | :---- |
| **I. KHỐI TIÊU ĐỀ & THANH ĐIỀU HƯỚNG HEADER** |  |  |  |  |  |
| Nút "← Quay lại danh sách" |  | Button |  |  | Bấm để quay trở lại màn hình Danh sách Phiếu dịch vụ (US\_ORD\_01) |
| Mã phiếu dịch vụ | v | Text | 14 |  | Mã đơn hàng bất biến định dạng ORDYYMMDD-XXX (ví dụ: ORD261010-045) |
| Huy hiệu Trạng thái phiếu | v | Badge | 30 |  | Thẻ màu hiển thị 1 trong 5 trạng thái vòng đời (Tạo mới, Đã tiếp nhận, Đang thực hiện, Đã thực hiện, Hoàn thành) |
| Nút "Chỉnh sửa phiếu" |  | Button |  |  | Bấm để mở form chỉnh sửa thông tin phiếu (khả dụng khi phiếu ở trạng thái Nháp, Tạo mới, Từ chối, Đã hủy) |
| Nút "Khôi phục yêu cầu" |  | Button |  |  | Bấm để chuyển trạng thái phiếu về Tạo mới gửi lại sang K3 (khả dụng khi Từ chối, Đã hủy) |
| Nút "Hủy phiếu" |  | Button (Danger) |  |  | Bấm để mở popup hủy phiếu dịch vụ (khả dụng khi Tạo mới, Đã tiếp nhận chưa có chặng active, Từ chối) |
| Nút "Lịch sử hoạt động" |  | Button |  |  | Bấm để mở popup xem toàn bộ Audit Logs |
| Nút "Xác nhận doanh thu" |  | Button (Primary) |  |  | Nút màu xanh lá dành riêng cho K5; xuất hiện khi phiếu ở trạng thái Đã thực hiện |
| **II. KHỐI THANH TIẾN TRÌNH VẬN HÀNH** |  |  |  |  |  |
| Mốc 1: Tạo mới |  | Progress Bar |  |  | Sáng khi phiếu đã gửi sang K3 tiếp nhận |
| Mốc 2: Đã tiếp nhận |  | Progress Bar |  |  | Sáng khi Trưởng điều phối K3 đã bấm Tiếp nhận phiếu |
| Mốc 3: Đang thực hiện |  | Progress Bar |  |  | Sáng/nhấp nháy khi có ít nhất 1 chặng vận hành đang active |
| Mốc 4: Đã thực hiện |  | Progress Bar |  |  | Sáng khi toàn bộ các chặng đã hoàn thành và có POD |
| Mốc 5: Hoàn thành |  | Progress Bar |  |  | Sáng khi K5 đã xác nhận doanh thu quyết toán |
| **III. KHỐI THÔNG TIN CHUNG**  |  |  |  |  |  |
| Khách hàng | v | Text | 150 |  | Tên doanh nghiệp khách hàng đối tác |
| Hợp đồng áp dụng | v | Text | 50 |  | Số hợp đồng nguyên tắc đang áp dụng |
| Báo giá áp dụng | v | Text | 100 |  | Tên và mã bảng báo giá áp dụng cho đơn hàng |
| Mã tham chiếu  |  | Text | 50 |  | Mã PO / số booking nội bộ của khách hàng |
| Loại hình XNK | v | Text | 50 |  | Loại hình: Xuất kinh doanh, Nhập kinh doanh, Tạm nhập tái xuất... |
| Cửa khẩu | v | Text | 50 |  | Cửa khẩu làm thủ tục: Hữu Nghị, Tân Thanh, Móng Cái... |
| Phương thức vận tải | v | Text | 50 |  | Đường bộ, Đường biển, Đường sắt... |
| Loại hình vận tải | v | Dropdown | 50 | Hàng nguyên | Cho phép k1 chọn 1 trong 2: Hàng nguyên  Hàng ghép  |
| Ngày yêu cầu SDDV | v | Date | 10 |  | Ngày khách hàng yêu cầu bắt đầu cung cấp dịch vụ |
| Điểm đi: Tên Điểm đi thực tế | v | Text | 200 |  | Địa chỉ kho bãi/nhà máy xuất phát |
| Điểm đi: 3 cấp hành chính | v | Text | 200 |  | \- Nếu là quốc gia là VN thì Chọn Tỉnh/Thành → Phường/Xã. \- Nếu quốc gia là TQ thì chọn Tỉnh/Thành phố \-\> Thành phố / Địa cấp thị \-\> Quận/Huyện-\> Phường/Xã \- Và chỉ bắt buộc đến tỉnh thành |
| Điểm đến: Tên Điểm đến thực tế | v | Text | 200 |  | Địa chỉ kho bãi/nhà máy giao hàng đích |
| Điểm đến: 3 cấp hành chính | v | Text | 200 |  | \- Nếu là quốc gia là VN thì Chọn Tỉnh/Thành → Phường/Xã. \- Nếu quốc gia là TQ thì chọn Tỉnh/Thành phố \-\> Thành phố / Địa cấp thị \-\> Quận/Huyện-\> Phường/Xã \- Và chỉ bắt buộc đến tỉnh thành |
| Ghi chú chung |  | Textarea | 500 |  | Các chỉ dẫn vận hành chung của đơn hàng |
| **IV. KHỐI THÔNG TIN HÀNG HÓA & PHƯƠNG TIỆN**  |  |  |  |  |  |
| Tên hàng hóa | v | Text | 150 |  | Tên mặt hàng thực tế |
| Đặc tính hàng hóa | v | Text | 50 |  | Phân loại: Thường, Nguy hiểm, Dễ vỡ, Hàng lạnh... |
| Thể tích | v | Number | 10 |  | Tổng thể tích thực tế  |
| Trọng lượng | v | Number | 10 |  | Tổng trọng lượng thực tế Đơn vị: Tấn |
| Quy cách đóng gói | v | Text | 50 |  | Pallet, Thùng carton, Kiện gỗ... |
| Biển số xe giao |  | Text | 20 |  | Biển số xe giao tại bãi sang tải biên giới (K3 cập nhật) |
| Trọng lượng thực tế  |  | Number | 10 |  | Trọng lượng cân xe giao (K3 cập nhật) |
| Số Mooc xe giao |  | Text | 20 |  | Số rơ-mooc xe giao (K3 cập nhật) |
| Số Container xe giao |  | Text | 20 |  | Số hiệu container xe giao (K3 cập nhật) |
| Tài xế  |  | Text | 100 |  | Họ tên (K3 cập nhật) |
| SĐT tài xế  |  | Number |  |  | SĐT tài xế xe nhận (K3 cập nhật) |
| Chứng từ kèm theo xe |  | file/ upload |  |  | Chứng từ của xe |
| Biển số xe nhận |  | Text | 20 |  | Biển số xe nhận đối ứng tại bãi sang tải (K3 cập nhật) |
| Số Mooc xe nhận |  | Text | 20 |  | Số rơ-mooc xe nhận (K3 cập nhật) |
| Số Container xe nhận |  | Text | 20 |  | Số hiệu container xe nhận (K3 cập nhật) |
| Tài xế  |  | Text | 100 |  | Họ tên (K3 cập nhật) |
| SĐT tài xế  |  | Number |  |  | SĐT tài xế xe nhận (K3 cập nhật) |
| Chứng từ kèm theo xe |  | file/ upload |  |  | Chứng từ của xe |
| **V. KHỐI THÔNG TIN DỊCH VỤ** |  |  |  |  |  |
| Hệ thống Tabs dịch vụ con | v | Tabs |  |  | Các tab: Khai báo HQ, HQ giám sát, Vận tải, Sang tải, Kho bãi |
| Badge trạng thái dịch vụ con |  | Badge  |  |  | Hiển thị trên mỗi tab/card dịch vụ con, gồm 1 trong 4 giá trị đồng bộ từ K3: Chưa thực hiện, Điều phối , Đang thực hiện , Đã thực hiện. K1 chỉ xem, không can thiệp.  |
| ***1\. Dữ liệu tác nghiệp Dịch vụ Khai báo Hải quan (Tab 1\)*** |  |  |  |  |  |
| Thông tin khai báo |  |  |  |  |  |
| Địa điểm làm thủ tục HQ |  | Text | 100 |  | Chi cục hải quan mở tờ khai, có thể K1 điền hoặc K3 điền |
| Ghi chú |  |  |  |  |  |
| Chứng từ lô hàng |  |  |  |  |  |
| Thông tin thực tế |  |  |  |  |  |
| Mã tờ khai hải quan thực tế |  | Text |  |  |  |
| Kết quả phân luồng |  | Dropdown |  |  |  |
| Ngày thông quan thực tế |  | Date |  |  |  |
| Số lượng tờ khai |  | Text |  |  |  |
| Thông tin xe vận chuyển  |  | Text |  |  |  |
| Thông tin tài xế |  |  |  |  |  |
| Ghi chú |  | Textarea |  |  |  |
| Chứng từ lô hàng |  | Fiule |  |  |  |
| *2\. Dữ liệu tác nghiệp Dịch vụ Hải quan Giám sát (Tab 2\)* |  |  |  |  |  |
| Thông tin khai báo |  |  |  |  |  |
| Đơn vị giám sát hải quan |  | Dropdown | 100 |  | Chi cục hải quan mở tờ khai, có thể K1 điền hoặc K3 điền |
| Số tờ khai liên quan |  | Text | 50 |  | Số tờ khai cần giám sát hải quan |
| Ghi chú giám sát |  | Textarea | 500 |  | Ghi chú giám sát của K1 |
| Chứng từ lô hàng |  | File upload (List) |  |  | Tệp phiếu đăng ký giám sát |
| Thông tin thực tế |  |  |  |  |  |
| Kết quả kiểm hóa thực tế |  | Text | 100 |  | Kết quả kiểm hóa tại bãi (K3 cập nhật) |
| Giờ vào khu thực tế |  | Datetime | 16 |  | Thời gian xe vào bãi giám sát (K3 cập nhật) |
| Giờ rời khu thực tế |  | Datetime | 16 |  | Thời gian xe rời bãi giám sát (K3 cập nhật) |
| Yêu cầu giám sát bãi |  | Check box |  |  | Đồng bộ từ K3 |
| Ghi chú giám sát |  | Textarea | 500 |  | Ghi chú giám sát của K3 |
| Chứng từ lô hàng |  | File upload (List) |  |  | Tệp phiếu đăng ký giám sát |
| *3\. Dữ liệu tác nghiệp Dịch vụ Vận tải (Tab 3\)* |  |  |  |  |  |
| Thông tin khai báo |  |  |  |  |  |
| Điểm lấy hàng | v | Text | 200 |  | Địa chỉ chi tiết lấy hàng |
| Ghi chú chung cho điểm lấy |  | Text |  |  |  |
| Điểm giao hàng | v | Text | 200 |  | Địa chỉ chi tiết giao hàng |
| Ghi chú chung cho điểm giao |  | Text |  |  |  |
| Chứng từ lô hàng |  | File list |  |  |  |
| Thông tin thực tế |  |  |  |  |  |
| Biển số xe |  | Text | 20 |  | Biển số xe tải/xe kéo nội địa (K3 cập nhật) |
| Tải trọng |  | Text |  |  |  |
| Số chì niêm phong |  | Text | 30 |  | Số seal niêm phong thùng cont (K3 cập nhật) |
| Số Container |  | Text | 50 |  | Số cont xe (K3 cập nhật) |
| Số Mooc  |  | Text | 50 |  | số mooc xe (K3 cập nhật) |
| Số cửa |  | Text | 20 |  | Cửa khẩu ra/vào (K3 cập nhật) |
| Thông tin tài xế |  | Text | 100 |  | Họ tên và SĐT, CCCD tài xế chạy nội địa (K3 cập nhật) |
| Thời gian lấy hàng thực tế |  | Date time |  |  | K3 cập nhật |
| Thời gian giao hàng thực tế |  | Date time |  |  | K3 cập nhật |
| Chứng từ & tệp đính kèm |  | File upload / Link |  |  | File ảnh/PDF biên bản bàn giao có chữ ký do K3 upload (bắt buộc để sang Đã thực hiện) |
| Ghi chú vận tải |  | Textarea | 500 |  | Ghi chú vận tải của K3 |
| *4\. Dữ liệu tác nghiệp Dịch vụ Sang tải (Tab 4\)* |  |  |  |  |  |
| Thông tin khai báo |  |  |  |  |  |
| Địa điểm sang tải | v | Text | 100 |  | Bãi sang tải chỉ định |
| Loại hình sang tải |  | Text | 50 |  | Xe sang Xe, Xe qua Kho, Xe xuống Bãi |
| Phương thức sang tải |  | Text | 100 |  | Xe cẩu, Xe nâng, Đội cửu vạn |
| Ghi chú |  | Text |  |  |  |
| Chứng từ lô hàng |  | File list |  |  |  |
| Thông tin thực tế |  |  |  |  |  |
| Địa điểm sang tải |  | Text |  |  |  |
| Loại hình sang tải |  | Text |  |  |  |
| Phương thức sang tải |  | Text |  |  | Xe cẩu, Xe nâng, Đội cửu vạn |
| Quy cách đóng gói thực tế |  | Text | 50 |  | Hiện trạng bao bì thực tế (K3 cập nhật) |
| Số lượng thực nhận |  | Number | 10 |  | Số kiện hàng thực nhận tại bãi (K3 cập nhật) |
| Cặp xe sang tải |  |  |  |  |  |
| Xe giao |  | Text  |  |  | Danh sách cặp xe sang tải (cấu trúc mảng lặp — có thể gồm nhiều cặp xe trong 1 lần sang tải; K1 hiển thị readonly, số lượng cặp do K3 nhập) |
| Tải trọng xe giao |  |  |  |  | K3 cập nhật |
| Xe nhận |  | Text |  |  | Danh sách cặp xe sang tải (cấu trúc mảng lặp — có thể gồm nhiều cặp xe trong 1 lần sang tải; K1 hiển thị readonly, số lượng cặp do K3 nhập) |
| Tải trọng xe nhận |  | Số \+ đơn vị |  |  | K3 cập nhật |
| Số kiện đủ/bốc |  | Text |  |  | K3 cập nhật |
| Mã chì seal |  | Text |  |  | K3 cập nhật |
| Trọng lượng thực tế (Tấn) |  | Số |  |  | K3 cập nhật |
| Mã số niêm phong mới |  | Text |  |  | K3 cập nhật |
| Biên bản ghi nhận |  | Tag |  |  | Biên bản ghi nhận tình trạng sang tải (K3 cập nhật) |
| Ghi chú hoạt động sang tải |  | Textarea | 500 |  | Ghi chú sang tải của K1 |
| Chứng từ lô hàng |  | File list |  |  |  |
| *5\. Dữ liệu tác nghiệp Dịch vụ Kho bãi (Tab 5\)* |  |  |  |  |  |
| Thông tin khai báo |  |  |  |  |  |
| Tên kho |  | Text |  |  |  |
| Thời gian lưu kho dự kiến |  | Number | 5 |  | Số ngày dự kiến lưu kho |
| Loại hình lưu kho | v | Text | 50 |  | Kho thường, Kho mát, Kho lạnh, Kho ngoại quan |
| Đơn vị tính sản lượng |  | Text | 20 |  | Tấn, m³, Pallet, Kiện |
| Số lượng lưu kho dự kiến |  | Number | 10 |  | Sản lượng dự kiến lưu kho |
| Ghi chú |  | text |  |  |  |
| Chứng từ lô hàng  |  | File list |  |  |  |
| Thông tin thực tế |  |  |  |  |  |
| Số lượng thực tế |  | Number |  |  | K3 cập nhật |
| Quy cách đóng gói thực tế |  | Dropdown |  |  | K3 cập nhật |
| Thời gian nhập kho thực tế |  | Datetime | 16 |  | Ngày giờ hàng vào kho (K3 cập nhật) |
| Thời gian xuất kho thực tế |  | Datetime | 16 |  | Ngày giờ hàng ra khỏi kho (K3 cập nhật) |
| Dịch vụ giá trị gia tăng tại kho (VAS) |  | Checklist |  |  | K3 cập nhật, K1 chỉ đọc |
| Chứng từ lô hàng |  | File/ upload |  |  | Upload file và cập nhật các file từ K3 |
| Ghi chú lưu kho |  | Textarea | 500 |  | Ghi chú kho của K3 |
| *6\. Doanh thu* |  |  |  |  |  |
| Đơn vị tiền tệ |  | Text |  |  | Đơn vị tiền tệ lấy từ BGKH |
| Tỷ giá | v | Dropdown |  | Mặc định | Lựa chọn tỷ giá: \- Theo VCB: được lấy từ tỷ giá VCB \- Tùy chỉnh: Nhập tỷ giá \- Theo BGKH: Lấy giá trị tỷ giá \= tỷ giá trong BGKH  |
| Thuế |  | Text |  |  | Hiển thị thuế lấy từ BGKH |
| Bảng cơ cấu giá: Đầu mục doanh thu | v | Text | 150 |  | Tên đầu mục giá theo biểu giá Báo giá khách hàng |
| Bảng cơ cấu giá: Loại đầu mục | v | Text |  |  | Hiển thị loại đầu mục danh thu, dữ liệu được lấy từ BGKH |
| Bảng cơ cấu giá: ĐVT | v | Text | 30 |  | Đơn vị tính lấy ra từ BGKH |
| Bảng cơ cấu giá: Số lượng | v | Number | 10 | 1 | Số lượng theo đơn vị tính đồng bộ theo quy tắc  |
| Bảng cơ cấu giá: Đơn giá | v | Number | 15 |  | Đơn giá bán gốc kế thừa từ Báo giá (Chỉ đọc) Bằng cột thành tiền sau điều chỉnh |
| Bảng cơ cấu giá: Thành tiền | v | Number | 15 |  | Thành tiền \= SL \* Đơn giá |
| Bảng cơ cấu giá: Thành tiền quy đổi | v | Number |  |  | Thành tiền quy đổi \= Thành tiền \* tỷ giá |
| Dòng Tổng doanh thu dịch vụ | v | Number | 15 |  | Tổng cộng thành tiền của toàn bộ các đầu mục trong dịch vụ con đang xem Gồm 3 dòng:  \- Tổng doanh thu trước VAT \- Thuế \- Tổng doanh thu sau VAT |
| **VI. KHỐI THÁP ĐIỀU PHỐI & THAO TÁC NGOẠI LỆ (CỘT PHẢI \- SIDEBAR)** |  |  |  |  |  |
| Nút "Tải lại" |  | Button |  |  | Bấm để làm mới tức thì nhật ký điều phối |
| Nhật ký Tháp điều phối  |  | Timeline |  |  | Hiển thị các trường thông tin cập nhật từ K3 |
| Tiêu đề Thao tác ngoại lệ |  | Text | 50 | Thao tác ngoại lệ & Sự cố | Khối chứa các hành động xử lý phát sinh nghiệp vụ |
| Thêm dịch vụ yêu cầu |  |  |  |  | Chưa phát triển trong giai đoạn hiện tại  |
| Hủy dịch vụ yêu cầu |  |  |  |  | Chưa phát triển trong giai đoạn hiện tại  |
| Yêu cầu đổi lộ trình |  |  |  |  | Chưa phát triển trong giai đoạn hiện tại  |
| Nút "📋 Tạo Ticket khiếu nại" |  | Button |  |  | Chưa phát triển trong giai đoạn hiện tại  |
| **VII. KHỐI XUẤT BẢNG KÊ QUYẾT TOÁN (KHI ĐƠN Hoàn thành)** |  |  |  |  |  |
| Nút "Xuất bảng kê" |  | Button |  |  | Bấm để tải file bảng kê đối chiếu chi tiết định dạng Excel hoặc pdf |

##### e. Thông báo và lỗi

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Truy cập vào mã đơn của khách hàng do người khác quản lý | Lỗi | "Bạn không có quyền truy cập thông tin phiếu dịch vụ này." | Chặn điều hướng, giữ nguyên màn hình hiện tại và ghi nhật ký kiểm toán hệ thống |
| Chuyển sang "Đã thực hiện" nhưng chặng cuối thiếu POD | Lỗi | "Vui lòng tải lên Biên bản bàn giao có chữ ký (POD) trước khi hoàn tất dịch vụ." | Chặn chuyển trạng thái, thông báo lỗi cho điều phối viên K3 |
| Người dùng bấm "Xác nhận hủy phiếu" nhưng để trống lý do hủy | Lỗi | "Vui lòng nhập lý do hủy phiếu dịch vụ." | Viền đỏ ô lý do hủy và chặn xác nhận |
| Hủy phiếu dịch vụ thành công | Thành công | "Đã hủy phiếu dịch vụ thành công. Đơn hàng chuyển sang trạng thái Đã hủy." | Hiển thị thông báo xanh lá, đóng popup, đổi badge sang Đã hủy và khóa nút Hủy |
| K5 bấm "Xác nhận doanh thu" thành công | Thành công | "Xác nhận doanh thu thành công. Phiếu dịch vụ đã chuyển sang trạng thái Hoàn thành." | Hiển thị thông báo thành công, đổi badge sang Hoàn thành và đóng băng toàn bộ số liệu đơn hàng |

#### *3.1.4 US\_ORD\_04: Xem chi tiết tổng hợp chi phí \- doanh thu phiếu dịch vụ*

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_ORD\_04 |
| **Tên Story** | Xem Tổng hợp doanh thu chi phí của phiếu |
| **User Story** | Là Kiểm soát công nợ thu (K1) , tôi muốn xem chi tiết tổng hợp chi \- phí \- doanh thu của phiếu dịch vụ, để đảm bảo quyết toán tài chính chính xác. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý Dịch vụ |
| **Người Phụ trách** | Đặng Thanh Sơn (BA) |

##### Acceptance Criteria

| STT | AC | NC |
| ----- | ----- | ----- |
| AC1 | **Mở popup Tổng hợp chi phí – doanh thu:** Nút "Tổng hợp CP-DT" hiển thị trên màn Chi tiết phiếu khi phiếu ở trạng thái **Đang thực hiện trở đi** (khi đã có dữ liệu chi phí/doanh thu). Bấm nút mở popup hiển thị toàn bộ thông tin tổng hợp. | NC1: Phiếu ở trạng thái Nháp, Tạo mới, Đã tiếp nhận (chưa xác nhận Chặng), Từ chối, Đã hủy — nút bị ẩn vì chưa có dữ liệu chi phí. |
| AC2 | **Header tổng hợp:** Hiển thị 2 ô tổng: Tổng chi phí và Tổng doanh thu (kèm đơn vị tiền tệ). Giá trị \= tổng cộng tất cả dịch vụ con bên dưới. | NC2: Nếu chưa có dữ liệu chi phí hoặc doanh thu cho bất kỳ dịch vụ nào, ô tổng tương ứng hiển thị 0\. |
| AC3 | **Bảng chi tiết theo dịch vụ con:** Mỗi dịch vụ con đã chọn trong phiếu hiển thị thành 1 nhóm (accordion/panel), bên trong chia 2 phần: **Chi phí** (danh sách đầu mục chi phí mua từ K3/K4) và **Doanh thu** (danh sách đầu mục doanh thu từ Báo giá K1 — theo BR\_ORD\_17). Mỗi phần có dòng tổng riêng. | NC3: Dịch vụ con không được chọn trong phiếu thì không hiển thị nhóm tương ứng. |
| AC4 | **Dòng lãi gộp theo dịch vụ:** Cuối mỗi nhóm dịch vụ con hiển thị dòng **Lãi gộp \= Tổng doanh thu DV – Tổng chi phí DV**. Hiển thị màu xanh nếu dương, màu đỏ nếu âm. |  |
| AC5 | **Nút Xác nhận:** Bấm "Xác nhận" → mở popup Xác nhận doanh thu (US\_ORD\_03 AC7). Chỉ hiển thị với vai trò K5 và khi phiếu ở trạng thái Đã thực hiện. | NC5: K1 chỉ xem, không thấy nút Xác nhận. |
| AC6 | **Nút Đóng:** Bấm "Đóng" → đóng popup, quay lại màn Chi tiết, không thay đổi dữ liệu. |  |

##### Business Rule

| Rule | Mô tả |
| ----- | ----- |
| **BR\_ORD\_23** | **Nguồn dữ liệu Chi phí:** Các đầu mục chi phí trong bảng Tổng hợp được đồng bộ từ dữ liệu giá mua thực tế do K3/K4 xác nhận (SSOT thuộc phân hệ Quản lý nhà thầu K4 và Tháp điều phối K3). K1 và K5 chỉ xem (Read-only), không chỉnh sửa chi phí tại popup này. Chi tiết quy tắc nhập liệu chi phí được đặc tả tại tài liệu SRS phân hệ K3/K4, không thuộc phạm vi tài liệu này. |
| **BR\_ORD\_24** | **Nguồn dữ liệu Doanh thu:** Các đầu mục doanh thu được trích xuất từ Báo giá khách hàng theo BR\_ORD\_17 (matching thuộc tính điều kiện \+ SL thực tế từ K3). Đơn giá bán khóa cứng theo Báo giá, K1/K5 không sửa. Doanh thu chỉ được ghi nhận khi có dòng Chi phí tương ứng (1:1). Dòng giá tương ứng ở trạng thái "Hết hạn" tại thời điểm ghi nhận → Doanh thu \= null, (BR\_ORD\_29, BR\_ORD\_30, BR\_ORD\_34).  |
| **BR\_ORD\_25** | **Đơn vị tiền tệ & quy đổi:** Đơn vị tiền tệ kế thừa từ Báo giá khách hàng (VND/USD/CNY). Cột "Thành tiền" hiển thị theo đồng tiền gốc Báo giá. Nếu đồng tiền gốc không phải VND, hệ thống hiển thị thêm giá trị quy đổi VND (theo tỷ giá tại thời điểm quyết toán) để phục vụ hạch toán nội bộ. |
| **BR\_ORD\_26** | **Công thức Lãi gộp:** Lãi gộp theo từng dịch vụ con \= Tổng doanh thu dịch vụ – Tổng chi phí dịch vụ. Tổng lãi gộp phiếu \= Tổng doanh thu phiếu – Tổng chi phí phiếu. Giá trị này chỉ mang tính tham khảo cho K5 đối soát, không ảnh hưởng đến luồng xác nhận doanh thu. |
| **BR\_ORD\_27** | **Thời điểm có dữ liệu:** Chi phí chỉ có sau khi K3 điều phối nhà thầu và K4 xác nhận giá mua (phiếu phải ở trạng thái Đang thực hiện trở đi). Doanh thu có ngay khi matching Báo giá thành công (có thể từ lúc tạo phiếu nếu đã có đủ thuộc tính). Vì vậy, bảng tổng hợp có thể xuất hiện tình huống: doanh thu đã có nhưng chi phí chưa có (hoặc ngược lại) — hiển thị 0 cho phần chưa có dữ liệu. |

##### Bảng mô tả field

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=13647-118633&t=9bBezlMq3H7PBxLa-4)

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Mô tả |
| ----- | ----- | ----- | ----- | ----- |
| Tiêu đề popup |  | Text |  | "Tổng hợp chi phí \- doanh thu" |
| Mã phiếu dịch vụ |  | Text |  | Hiển thị mã phiếu dịch vụ đang được xác nhận |
| Tổng chi phí |  | Number |  | Hiển thị tổng chi phí của phiếu đó |
| Đơn vị tiền tệ |  |  |  | Hiển thị tên viết tắt của đơn vị tiền tệ của phiếu  Đô la mỹ: USD Nhân dân tệ: CNY Việt Nam đồng: VND |
| Tổng doanh thu |  | Number |  | Hiển thị tổng doanh thu của phiếu đó |
| Đơn vị tiền tệ |  | Text |  | Hiển thị tên viết tắt của đơn vị tiền tệ của phiếu  Đô la mỹ: USD Nhân dân tệ: CNY Việt Nam đồng: VND |
| Tên dịch vụ |  | Text |  | Hiển thị tên dịch vụ có trong phiếu |
| Tổng chi phí dịch vụ |  | Number |  | Bằng tổng chi phí của các đầu mục trong dịch vụ |
| Tổng doanh thu dịch vụ |  | Number |  | Bằng tổng doanh thu của các đầu mục trong dịch vụ |
| Tên đầu mục |  | Text |  | Tên đầu mục của dịch vụ Hiển thị tên đầu mục của chi phí và doanh thu  Nếu 2 đầu mục giống nhau thì sẽ chỉ hiển thị 1 dòng và có chi phí doanh thu Nếu đầu mục chỉ có ở doanh thu không có ở chi phí thì hiển thị đầu mục đó với chi phí \= 0 và có doanh thu |
| Chi phí |  |  |  | Chi phí của từng đầu mục  Lấy giá trị tại cột Tổng quy đổi |
| Doanh thu |  |  |  | Doanh thu của từng đầu mục Lấy giá trị tại cột Thành tiền quy đổi Giá trị sinh theo BR\_ORD\_30: dòng giá Đang hiệu lực → Thành tiền quy đổi; dòng giá Hết hạn hoặc không có dòng giá → **null**, hiển thị "—" |
| Nút Xác nhận |  | Button  |  | Nhấn để mở popup xác nhận doanh thu |
| Nút Hủy |  | Button |  | Nhấn để hủy bỏ thao tác trở về màn hình chi tiết phiếu |

#### *3.1.5 US\_ORD\_05 — Chỉnh sửa doanh thu dịch vụ (US mới)*

##### a. User Story

| Mục | Mô tả |
| :---- | :---- |
| **ID US** | US\_ORD\_05 |
| **Tên Story** | Chỉnh sửa doanh thu dịch vụ (đầu mục phát sinh) |
| **User Story** | Là Nhân viên Dịch vụ khách hàng (K1), tôi muốn bấm "Chỉnh sửa" tại tab Doanh thu của từng dịch vụ con để điều chỉnh Đơn vị tính, Số lượng và Đơn giá của các đầu mục doanh thu phát sinh, để doanh thu khớp với thực tế phát sinh tại hiện trường trước khi K5 chốt quyết toán. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý Dịch vụ |
| **Người Phụ trách** | Đặng Thanh Sơn (BA) |

##### b. Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (NC) |
| :---- | :---- | :---- |
| **AC1** | **Hiển thị nút "Chỉnh sửa doanh thu":** Trên tab Doanh thu của từng dịch vụ con, nút "Chỉnh sửa" hiển thị khi phiếu ở trạng thái **Đang thực hiện** hoặc **Đã thực hiện**, và tài khoản là **K1 phụ trách** khách hàng đó (own-scope theo BR\_ORD\_13). | **NC1:** Phiếu ở Nháp/Tạo mới/Đã tiếp nhận/Từ chối/Đã hủy/**Hoàn thành**, hoặc không phải K1 phụ trách → nút bị ẩn. |
| **AC2** | **Vào chế độ chỉnh sửa:** Bấm "Chỉnh sửa", bảng doanh thu chuyển sang chế độ nhập liệu. Hệ thống **auto-fill sẵn giá trị hiện tại** vào 3 cột cho phép sửa; K1 chỉnh trực tiếp **ĐVT (dropdown), Số lượng (number), Đơn giá (number)**. |  |
| **AC3** | **Chỉ cho sửa dòng Phát sinh:** Chỉ các dòng có phân loại **Phát sinh** mới mở 3 cột ĐVT/SL/Đơn giá cho nhập. Dòng **Cố định** và **Phụ phí** giữ **read-only** (khóa cứng theo BR\_ORD\_10). | **NC2:** Thao tác sửa trên dòng Cố định/Phụ phí bị hệ thống chặn. |
| **AC4** | **Tự tính lại Thành tiền:** Khi sửa SL hoặc Đơn giá, hệ thống tự tính lại: **Thành tiền \= SL × Đơn giá** và **Thành tiền quy đổi \= Thành tiền × tỷ giá**, cập nhật ngay dòng Tổng doanh thu (trước VAT / VAT / sau VAT) ở Footer. |  |
| **AC5** | **Ưu tiên giá trị sửa tay (chặn K3 ghi đè):** Sau khi K1 lưu chỉnh sửa 1 dòng phát sinh, dòng đó được đánh dấu **"đã chỉnh tay"** và **ngừng auto-đồng bộ** từ chi phí K3; giá trị sửa tay là giá trị chính thức dùng cho quyết toán. | **NC3:** Hệ thống không được tự ghi đè giá trị K1 đã sửa khi K3 cập nhật chi phí sau đó. |
| **AC6** | **Lưu / Hủy:** Bấm "Lưu" → validate, ghi dữ liệu, thoát chế độ sửa, ghi **Lịch sử hoạt động** (người sửa, thời điểm, giá trị trước→sau). Bấm "Hủy" → giữ nguyên giá trị cũ, thoát chế độ sửa. | **NC4:** Nhập SL ≤ 0 hoặc Đơn giá \< 0 hoặc bỏ trống ĐVT → chặn lưu, viền đỏ ô lỗi. |
| **AC7** | **Khóa sau quyết toán:** Khi K5 bấm "Xác nhận doanh thu" (phiếu → Hoàn thành), toàn bộ bảng doanh thu khóa vĩnh viễn, nút "Chỉnh sửa doanh thu" bị ẩn (theo BR\_ORD\_18). |  |

##### c. Quy tắc nghiệp vụ (Business Rule)

| Rule ID | Mô tả |
| :---- | :---- |
| **BR\_ORD\_28** | **Quy tắc chỉnh sửa doanh thu phát sinh:**  (1) Chỉ K1 phụ trách được sửa, ở trạng thái **Đang thực hiện / Đã thực hiện**; từ **Hoàn thành** trở đi khóa vĩnh viễn.  (2) Chỉ sửa được 3 cột **ĐVT, SL, Đơn giá** và **chỉ trên dòng Phát sinh**; dòng Cố định & Phụ phí read-only (3) Khi vào chế độ sửa, hệ thống auto-fill giá trị hiện tại; sau khi lưu, dòng đã sửa **ưu tiên giá trị tay**, ngừng auto-đồng bộ từ K3 (ngoại lệ của BR\_ORD\_17 mục 5–6).  (4) Thành tiền \= SL × Đơn giá; Thành tiền quy đổi \= Thành tiền × tỷ giá; tính lại Footer theo 1 mức VAT của phiếu.  (5) Validate: SL \> 0, Đơn giá ≥ 0, ĐVT bắt buộc.  (6) Dòng Doanh thu null do "Hết hạn báo giá" thuộc loại Cố định/Phụ phí đang read-only → K1 không bổ sung được Doanh thu. Bắt buộc K1 phải tạo yêu cầu bổ sung và báo giá khách hàng bổ sung tương ứng để lấy dòng báo giá mới. |

##### d. Mô tả giao diện 

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=11499-125615&t=Qk2b9bSlS8o0UUgH-4)

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| Nút "Chỉnh sửa doanh thu" |  | Button |  | Hiển thị khi phiếu ở Đang thực hiện/Đã thực hiện & K1 phụ trách. Bấm để vào chế độ sửa bảng doanh thu. |
| Cột ĐVT (chế độ sửa) | v | Dropdown | Giá trị hiện tại | Chỉ editable trên dòng Phát sinh; auto-fill ĐVT hiện tại, chọn từ danh mục ĐVT. |
| Cột Số lượng (chế độ sửa) | v | Number (\>0) | Giá trị hiện tại | Chỉ editable trên dòng Phát sinh. |
| Cột Đơn giá (chế độ sửa) | v | Number (≥0) | Giá trị hiện tại | Chỉ editable trên dòng Phát sinh. |
| Nút "Lưu" / "Hủy" |  | Button |  | Lưu: validate \+ ghi \+ ghi log. Hủy: thoát, giữ giá trị cũ. |

##### e. Thông báo và lỗi

| Trigger | Loại | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Nhập SL ≤ 0 | Lỗi | "Số lượng phải lớn hơn 0." | Viền đỏ ô SL, chặn lưu |
| Nhập Đơn giá \< 0 | Lỗi | "Đơn giá không hợp lệ." | Viền đỏ ô Đơn giá, chặn lưu |
| Bỏ trống ĐVT | Lỗi | "Vui lòng chọn đơn vị tính." | Viền đỏ ô ĐVT, chặn lưu |
| Lưu chỉnh sửa thành công | Thành công | "Cập nhật doanh thu thành công." | Thoát chế độ sửa, cập nhật Footer, ghi Lịch sử hoạt động |

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Bổ sung US mới \+ 1 Business Rule \+ cập nhật mô tả giao diện tab Doanh thu | –/– | 12/10/2026 | Bổ sung chức năng |
| 2 | Doanh thu:  Ghi nhận khi đã có chi phí (1:1) hoặc có phiên bản báo giá khách hàng mới.  Tại thời điểm ghi nhận, dòng giá tương ứng trong bảng báo giá “Hết hạn” \=\> Doanh thu nhận giá trị null Phạm vi áp dụng: Dịch vụ ở trạng thái Đã tiếp nhận, Đang thực hiện, Đã thực hiện | Ghi nhận tất cả dòng giá trong báo giá tại thời điểm tạo phiếu và thời điểm ghi nhận chi phí phụ phí/phát sinh.  | 20/10/2026 | Hoàn thiện luồng hệ thống theo nghiệp vụ thực tế (Điều chỉnh giá bán định mức) |

