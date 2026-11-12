**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification \- SRS)*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu "Giá mua đầu vào" (Thỏa thuận bảng giá mua dịch vụ) |
| :---- | :---- |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | Trang BA  |
| **Ngày tạo** | 06/08/2026 |

# 1\. Tổng quan & Phạm vi

## 1.1. Mục tiêu

Menu "Giá mua đầu vào" quản lý danh sách các bảng giá mua dịch vụ đã thỏa thuận với nhà thầu, tổ chức theo 5 phân hệ dịch vụ: Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát và Sang tải. Mỗi bảng giá mua gắn với 1 nhà thầu phụ trách, liên kết 1 hợp đồng khung "Đang hiệu lực", và chứa các dòng giá chi tiết thuộc các đầu mục giá đã thiết lập ở menu "Cấu hình đầu mục giá".

Đây là nơi lưu trữ, tra cứu và điều hành hiệu lực của các thỏa thuận giá mua; dữ liệu dòng giá là nguồn tham chiếu cho các menu hạ nguồn (Giá mua/bán định mức, Quản lý báo giá).

## 1.2. Phạm vi hệ thống

**Trong phạm vi (In-scope):**

* Xem danh sách bảng giá mua theo 5 phân hệ; lọc theo trạng thái/nhà thầu; tìm theo ID; sắp xếp; chọn nhiều bản ghi để xuất dữ liệu.

* Xem chi tiết 1 bảng giá mua: thông tin chung, 5 tab dòng giá chi tiết, lịch sử hoạt động.

* Thêm mới bảng giá mua: nhập thông tin chung và cấu hình dòng giá 5 phân hệ (thêm dòng đơn lẻ, thêm hàng loạt, xóa dòng, sửa đơn giá).

* Chỉnh sửa thông tin chung (chỉ thông tin chung, chỉ bảng giá mua "Tạo mới").

* Xóa bảng giá mua (chỉ "Tạo mới") theo cơ chế xóa mềm: khóa và ẩn bản ghi khỏi danh sách.

* Cập nhật bảng giá: thêm/xóa dòng giá và sửa đơn giá trên bảng giá mua đã tồn tại (Thông tin chung chỉ đọc).

* Kích hoạt bảng giá mua và quản lý vòng đời trạng thái (Tạo mới / Đang hoạt động / Ngừng hoạt động / Hết hiệu lực).

* Phân quyền theo chức năng: mỗi chức năng Xem/Thêm/Sửa/Xóa/Kích hoạt chỉ hiển thị và thao tác được khi người dùng có quyền tương ứng.

* *Quy tắc validate Import/Export CSV cấp dòng giá — chỉ mô tả nút, chi tiết ở phiên bản sau. (Đang cập nhật*

* *Nhân bản bảng giá mua (Đang cập nhật)*

* *Phê duyệt giá*

**Ngoài phạm vi (Out-of-scope):**

* Luồng gửi Phê duyệt bảng giá mua (phê duyệt cấp bảng giá) — không triển khai trong giai đoạn này. 

# 2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)

[**LogX \-QL giá mua .drawio**](https://drive.google.com/file/d/1Au166CK7y3eQp1O5QDwLt8Y2eDFbscmQ/view?usp=sharing)

 

**Mô tả luồng chính:** 

* Người dùng (Bộ phận quản lý nhà thầu) mở menu Giá mua đầu vào → xem danh sách bảng giá mua (lọc/tìm/sắp xếp). Chỉ các chức năng người dùng được phân quyền mới hiển thị.

* Thêm mới bảng giá mua: nhập thông tin chung \+ cấu hình dòng giá 5 phân hệ (thêm đơn lẻ / thêm hàng loạt / xóa / sửa đơn giá); nhấn "Lưu thông tin" lưu đồng thời (atomic) → bảng giá mua ở trạng thái "Tạo mới", ID tự sinh RSYYMM-NNN; hệ thống ghi log "Khởi tạo bảng giá".

* Cập nhật bảng giá: mở bảng giá mua đã tồn tại (Thông tin chung chỉ đọc), thêm/xóa dòng giá và sửa đơn giá → "Lưu thông tin". 

* Lọc dòng giá tại màn Thêm mới/Cập nhật bảng giá:

  * Mở màn Thêm mới/Cập nhật bảng giá → chọn tab phân hệ cần thao tác.

  * Nhấn "Bộ lọc" → chọn giá trị theo thuộc tính (cột đặc thù \+ Đơn vị tính) → "Áp dụng".

  * Hệ thống lọc danh sách tạm của tab (gồm dòng đã lưu \+ dòng chưa lưu) → hiển thị kết quả theo từng đầu mục giá.

  * Người dùng sửa Đơn giá / xóa / thêm dòng trên kết quả → thay đổi cập nhật vào danh sách tạm, bộ lọc giữ nguyên.

  * Nhấn "Xóa bộ lọc" khi cần xem lại toàn bộ dòng giá của tab.

  * Nhấn "Lưu thông tin" → lưu atomic toàn bộ danh sách tạm, kể cả dòng đang bị ẩn bởi bộ lọc.

* Kích hoạt bảng giá mua (Tạo mới/Ngừng hoạt động) → "Đang hoạt động": kiểm tra Nhà thầu phụ trách phải đang hoạt động; nếu có bảng giá mua khác cùng nhà thầu đang "Đang hoạt động" thì yêu cầu xác nhận để chuyển bảng giá mua đó sang "Ngừng hoạt động". Riêng bảng giá "Tạo mới": sau khi kiểm tra nhà thầu, kiểm tra thêm Thời điểm kích hoạt ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực hợp đồng; kích hoạt thành công thì cập nhật Ngày hiệu lực \= Ngày kích hoạt.

* Xóa bảng giá mua ("Tạo mới"): khóa & ẩn bản ghi khỏi danh sách (xóa mềm, không xóa vật lý).

* Xem chi tiết: thông tin chung \+ dòng giá theo 5 phân hệ \+ lịch sử; hệ thống ghi log mọi thao tác.

* Đến ngày hết hiệu lực → tự động chuyển "Hết hiệu lực".

* Chỉ dòng giá "Đã phê duyệt" của bảng giá mua "Đang hoạt động" là nguồn tham chiếu động cho Bảng giá mua định mức, Bảng giá bán định mức và Chi phí dịch vụ.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Xem danh sách | BP quản lý nhà thầu | Mở menu, xem danh sách bảng giá mua, lọc/tìm/sắp xếp | Danh mục bảng giá mua | Danh sách bảng giá mua | Có quyền Xem bảng giá mua |
| Thêm mới bảng giá mua | BP quản lý nhà thầu | Nhập thông tin chung \+ cấu hình dòng giá 5 phân hệ (đơn lẻ/hàng loạt/xóa/sửa đơn giá) | Thông tin bảng giá mua \+ dòng giá | Bảng giá mua "Tạo mới" (atomic); ID tự sinh RSYYMM-NNN; log "Khởi tạo bảng giá" | Có quyền Thêm; bắt buộc Tên, Nhà thầu, Ngày hiệu lực, Ngày hết hiệu lực; chặn trùng tên |
| Cập nhật bảng giá | BP quản lý nhà thầu | Thêm/xóa dòng giá, sửa đơn giá (Thông tin chung chỉ đọc) | Danh sách dòng giá hiện tại | Dòng giá cập nhật \+ log | Áp dụng Tạo mới/Đang hoạt động/Ngừng hoạt động (không Hết hiệu lực); khóa đồng thời |
| Kích hoạt bảng giá mua | BP quản lý nhà thầu | Kích hoạt bảng giá mua "Tạo mới"/"Ngừng hoạt động" → "Đang hoạt động" | Bảng giá mua Tạo mới/Ngừng hoạt động | Đang hoạt động (+ bảng giá mua trùng nhà thầu → Ngừng hoạt động) | Có quyền Kích hoạt; Nhà thầu "Đang hoạt động"; (Tạo mới) Thời điểm kích hoạt ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực hợp đồng → cập nhật Ngày hiệu lực \= Ngày kích hoạt; xác nhận nếu có bảng giá mua trùng nhà thầu đang "Đang hoạt động" |
| Xem chi tiết | BP quản lý nhà thầu | Xem thông tin chung \+ dòng giá 5 phân hệ \+ lịch sử | Bảng giá mua đã chọn | Chi tiết bảng giá mua \+ log | Có quyền Xem |
| Chỉnh sửa thông tin chung | BP quản lý nhà thầu | Sửa các trường trong section Thông tin chung | Thông tin chung hiện tại | Thông tin chung cập nhật \+ log | Có quyền Sửa; chỉ bảng giá mua "Tạo mới"; không sửa dòng giá; khóa đồng thời |
| Xóa bảng giá mua | BP quản lý nhà thầu | Khóa & ẩn bản ghi khỏi danh sách (xóa mềm) | Bảng giá mua "Tạo mới" | Bản ghi bị khóa & ẩn \+ log | Có quyền Xóa; chỉ "Tạo mới"; không xóa vật lý |
| Tự động đổi trạng thái | Hệ thống | Đến ngày hiệu lực → Đang hoạt động Quá Ngày hết hiệu lực → Hết hiệu lực | Ngày hệ thống | Trạng thái cập nhật | Tự động kích hoạt: Áp dụng cho Bảng giá mua trạng thái Tạo mới Tự động hết hiệu lựcz: Áp dụng cho Tạo mới/Đang hoạt động/Ngừng hoạt động |
| Đồng bộ tham chiếu | Hệ thống | Cung cấp dòng giá "Đã phê duyệt" cho định mức mua/bán & chi phí dịch vụ | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) | Dữ liệu tham chiếu | Chỉ dòng "Đã phê duyệt" của bảng giá mua "Đang hoạt động"; tham chiếu động |
| Mở màn thiết lập giá | BP quản lý nhà thầu | Mở màn Thêm mới/Cập nhật bảng giá, chọn tab phân hệ | Tab phân hệ | Danh sách đầu mục giá \+ dòng giá của tab | Có quyền Thêm/Cập nhật (BR27) |
| Mở bộ lọc | BP quản lý nhà thầu | Nhấn "Bộ lọc" tại tab | — | Panel bộ lọc theo phân hệ của tab | Trường lọc theo BR42 |
| Chọn điều kiện lọc | BP quản lý nhà thầu | Chọn 1 hoặc nhiều giá trị cho từng thuộc tính | Giá trị lọc | Điều kiện lọc của tab | HOẶC trong 1 trường, VÀ giữa các trường (BR43) |
| Áp dụng bộ lọc | Hệ thống | Lọc danh sách tạm của tab, áp cho mọi đầu mục | Điều kiện lọc; danh sách tạm | Danh sách rút gọn; số dòng hiển thị | Dòng "Tất cả" luôn khớp (BR44); bảng trống nếu không có dòng khớp (BR45) |
| Thao tác trên kết quả | BP quản lý nhà thầu | Sửa Đơn giá / xóa / thêm dòng giá | Thao tác người dùng | Danh sách tạm cập nhật | Giữ nguyên bộ lọc; dòng mới không khớp bị ẩn (BR47, BR48) |
| Xóa bộ lọc | BP quản lý nhà thầu | Nhấn "Xóa bộ lọc" | — | Hiển thị đủ dòng giá của tab | Chỉ xóa bộ lọc của tab đang xem |
| Lưu thông tin | BP quản lý nhà thầu / Hệ thống | Lưu toàn bộ thay đổi | Danh sách tạm | Bảng giá mua được lưu \+ log | Lưu cả dòng đang bị ẩn (BR23, BR46) |

# 3\. Đặc tả Tính năng

## 3.1. MODULE: Giá mua đầu vào

### 3.1.1 Danh sách user story

#### *User story 1: Xem danh sách bảng giá mua*

| ID US | US\_BGM\_01 |
| :---- | :---- |
| **Tên Story** | Xem danh sách bảng giá mua |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem danh sách bảng giá mua theo bộ lọc và sắp xếp, để nắm nhanh tình trạng các thỏa thuận giá và truy cập vào từng bảng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Hiển thị bảng danh mục với các cột:  ID bảng giá,  Tên bảng giá,  Nhà thầu phụ trách,  Ngày hiệu lực,  Ngày hết hiệu lực,  Trạng thái,  Thao tác. | Thiếu cột hoặc sai dữ liệu. |
| AC2 | \- Cho lọc theo Trạng thái và Nhà thầu;  \- Tìm kiếm theo ID;  \- Sắp xếp theo Ngày hiệu lực và Ngày hết hiệu lực;  Kết quả trả ra đúng. | Lọc/tìm/sắp xếp ra kết quả sai. |
| AC3 | \- Mỗi dòng chỉ hiển thị action Sửa / Xóa khi người dùng có quyền Sửa / Xóa bảng giá mua. \- Khi nhấn action, hệ thống điều hướng đúng bảng giá mua tương ứng. | Nhấn action điều hướng sai/không điều hướng. |
| AC4 | Cho chọn nhiều bản ghi (checkbox) và Xuất dữ liệu các bản ghi đã chọn. | Xuất sai/thiếu bản ghi đã chọn. |
| AC5 | Chức năng Xem danh sách/chi tiết bảng giá mua chỉ hiển thị khi người dùng có quyền Xem; User không có quyền → không nhìn thấy menu trên menu side và truy cập vào menu không thấy dữ liệu. | Người dùng không có quyền Xem vẫn truy cập/xem được dữ liệu. |
| AC6 | Mặc định danh sách bảng giá mua được sắp xếp theo Thời gian tạo giảm dần (bản ghi mới nhất ở trên cùng).  | Danh sách không sắp xếp mặc định theo Thời gian tạo giảm dần; hoặc bản ghi vừa tạo không hiển thị ở trên cùng. |

#### *User story 2: Xem chi tiết bảng giá mua* 

| ID US | US\_BGM\_02 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết thông tin chung, dòng giá theo 5 phân hệ |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem chi tiết 1 bảng giá mua gồm thông tin chung, dòng giá theo 5 phân hệ và lịch sử, để kiểm tra thỏa thuận giá hiện tại và truy vết thay đổi. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| Thông tin chung |  |  |
| AC1 | Section Thông tin chung hiển thị:  ID bảng giá Nhà thầu phụ trách,  Ngày hiệu lực,  Ngày hết hiệu lực,  Trạng thái,  Tiền tệ,  Hợp đồng khung. | Thiếu/sai trường thông tin chung. |
| Danh sách dòng giá mua |  |  |
| AC2 | Luôn hiển thị đủ 5 tab phân hệ (Mỗi tab phân hệ là 1 loại dịch vụ); Trong mỗi tab không có dòng giá nào vẫn hiển thị tab với bảng giá trống. Các đầu mục giá trong từng tab hiển thị đầy đủ theo Loại dịch vụ (đã được cấu hình trong Cấu hình đầu mục giá) gồm ID, Tên đầu mục giá, Loại giá | Ẩn tab của phân hệ trống hoặc thiếu tab. |
| AC3 | Danh sách dòng giá được nhóm theo đầu mục giá (thiết lập trong Cấu hình đầu mục giá) và danh sách giá mua hiển thị đúng các cột theo từng dịch vụ (xem 3.1.2);  | Sai cấu trúc cột theo phân hệ; thiếu trạng thái dòng giá. |
| AC4 | Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị đuôi NNNN của dòng giá.  | Hiển thị đầy đủ ID hoặc không hiển thị ID |
| AC5 | Danh sách dòng giá cho phép:  Tìm kiếm theo ID dòng giá: Tìm kiếm theo ID đầy đủ \[Mã bảng giá mua\]-NNNN hoặc NNNN đều tìm được dòng giá theo ID đầy đủ Sắp xếp theo Đơn giá, Lọc theo các cột thuộc tính.  | Tìm/sắp xếp/lọc sai kết quả. |
| AC6 | Khi lọc theo một thuộc tính, kết quả bao gồm các dòng có giá trị đúng bộ lọc VÀ các dòng có giá trị "Tất cả" ở thuộc tính đó (dòng "Tất cả" luôn khớp mọi bộ lọc của thuộc tính tương ứng — xem BR32). | Lọc bỏ sót dòng "Tất cả"; dòng "Tất cả" không xuất hiện trong kết quả lọc theo thuộc tính. |
| AC7 | Phạm vi lọc: Áp dụng tất cả đầu mục trong tab dịch vụ đã thao tác. Không áp dụng tại các tab dịch vụ còn lại. |  |
| Lịch sử hoạt động |  |  |
| AC8 | Lịch sử hoạt động hiển thị: Thời gian, Người thực hiện, Hành động, Nội dung;  | Log thiếu người thao tác/nội dung; không lọc được theo Hành động. |
| AC9 | Lịch sử hoạt động: Cho phép lọc theo Hành động và làm mới bảng lịch sử hoạt động (cập nhật thông tin mới nhất). Với Lịch sử hoạt động là Chỉnh sửa bảng giá mua và Phê duyệt bảng giá mua, hiển thị nút *Xem chi tiết* ở cuối bản ghi*.* | Log Chỉnh sửa bảng giá mua và Phê duyệt bảng giá mua, không hiển thị nút *Xem chi tiết.* |
| Nút tương tác |  |  |
| AC10 | Nút "Chỉnh sửa thông tin chung" chỉ hiển thị với bảng giá mua ở "Tạo mới";  Nút "Cập nhật bảng giá" hiển thị khi bảng giá mua ở "Tạo mới"/"Đang hoạt động"/"Ngừng hoạt động" (ẩn khi "Hết hiệu lực"). | Hiển thị/ẩn sai nút theo trạng thái; điều hướng sai bảng giá mua. |
| AC11 | Với người dùng không có quyền Chỉnh sửa bảng giá mua, hệ thống ẩn nút “Chỉnh sửa thông tin chung” và nút “Cập nhật bảng giá” đồng thời chặn người dùng chỉnh sửa.  | Người dùng không có quyền Sửa vẫn hiển thị nút Chỉnh sửa thông tin chung / Cập nhật bảng giá hoặc chỉnh sửa thành công. |
| AC12 | Với người dùng không có quyền Xóa bảng giá mua, hệ thống ẩn nút “Xóa bảng giá mua” đồng thời chặn người dùng xóa bảng giá mua. | Người dùng không có quyền Xóa vẫn hiển thị nút Xóa bảng giá mua hoặc xóa thành công. |

#### *User story 3: Thêm mới bảng giá mua*

| ID US | US\_BGM\_03 |
| :---- | :---- |
| **Tên Story** | Tạo mới bảng giá mua: thông tin chung \+ cấu hình dòng giá 5 phân hệ |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn thêm mới bảng giá mua gồm thông tin chung và cấu hình dòng giá cho 5 phân hệ, để khởi tạo đầy đủ một thỏa thuận giá cho nhà thầu. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Nhấn "Thêm bảng giá mua" mở màn tạo mới gồm section Thông tin chung và section "Thiết lập giá đầu vào dịch vụ" (5 tab). | Không mở được màn/thiếu section. |
| AC2 | Thông tin chung gồm các trường: Tên bảng giá mua, Nhà thầu phụ trách, Ngày hiệu lực, Ngày hết hiệu lực, Ghi chú bổ sung, Tiền tệ, Hợp đồng khung,  |  |
| AC2 | Ràng buộc:  Ngày hiệu lực ≤ Ngày hết hiệu lực.  Ngày hiệu lực ≥ Ngày hiệu lực hợp đồng (kiểm tra khi Lưu) Ngày hết hiệu lực ≤ Ngày hết hiệu lực hợp đồng (kiểm tra khi Lưu). | Thiếu trường bắt buộc vẫn cho lưu; hoặc Ngày hiệu lực \> Ngày hết hiệu lực. |
| AC3 | Chặn trùng Tên bảng giá mua (kiểm tra khi lưu). | Cho trùng tên. |
| AC4 | Sau khi chọn Nhà thầu phụ trách, hệ thống tự động gắn hợp đồng "Đang hiệu lực" của nhà thầu (chỉ xem); tại 1 thời điểm, mỗi nhà thầu chỉ có 1 hợp đồng "Đang hiệu lực". Khi bỏ chọn Nhà thầu phụ trách, hợp đồng tự động bỏ gắn kèm. | Hợp đồng không tự động gắn kèm khi chọn nhà thầu phụ trách. |
| AC5 | ID bảng giá mua do hệ thống tự sinh theo cấu trúc RSYYMM-NNN Trong đó: RS \= ratesheet,  YYMM \= năm/tháng tạo,  NNN \= số thứ tự trong tháng tạo, bắt đầu từ 001;  ví dụ ID bảng giá: RS260804-001; Người dùng không được nhập/sửa ID. | ID không tự sinh hoặc sai cấu trúc RSYYMM-NNN. |
| AC6 | Mỗi tab phân hệ hiển thị các đầu mục giá “đang kích hoạt” và có loại giá \= {Cố định, Phụ phí} của phân hệ. Mỗi đầu mục có: ID, Tên đầu mục giá, Loại giá và "Thêm bảng giá dịch vụ" (hàng loạt), "Thêm dòng giá mới" (đơn lẻ), (chi tiết ở US\_BGM\_08 và US\_BGM\_09).  Mỗi dòng giá có Xóa và sửa Đơn giá inline (chi tiết ở US\_BGM\_11 và US\_BGM\_10). Mỗi tab phân hệ có nút "Bộ lọc" để lọc dòng giá (chi tiết US\_BGM\_13). | Sai/không hiển thị đúng đầu mục hoặc thiếu action. |
| AC7 | Nút "Lưu thông tin" lưu đồng thời Thông tin chung \+ toàn bộ dòng giá đã cấu hình theo cơ chế atomic; bảng giá mua tạo ở trạng thái "Tạo mới". Nút "Hủy bỏ" không lưu.  | Lưu không đồng bộ (mất thông tin chung hoặc mất dòng giá). |
| AC8 | Sau khi tạo thành công bảng giá, hệ thống đồng thời ghi lịch sử hoạt động với hành động "Khởi tạo bảng giá". | Tạo thành công nhưng không ghi log "Khởi tạo bảng giá". |
| AC9 | Cho phép lưu ngay cả khi một/nhiều đầu mục chưa có dòng giá nào (hiển thị đầu mục/bảng giá trống). | Bắt buộc phải có dòng giá mới cho lưu. |
| AC10 | Đầu mục giá bị tắt kích hoạt (bật/tắt kích hoạt trong Cấu hình đầu mục giá) bị ẩn & khóa, không thể thiết lập các dòng giá trong đầu mục giá. Chỉ thiết lập giá cho đầu mục giá có Loại giá \= Cố định / Phụ phí. Đầu mục giá có Loại giá \= “Phát sinh” không được thiết lập dòng giá trong đầu mục (ẩn hiển thị và chặn thiết lập) | Vẫn cấu hình được dòng giá cho đầu mục đã tắt.Vẫn thiết lập được đầu mục giá “Phát sinh” |
| AC11 | Chặn người dùng thêm bảng giá mua khi người dùng không có quyền Tạo mới bảng giá mua. | Người dùng không có quyền Thêm vẫn thêm mới thành công bảng giá mua |
| AC12 | *Chức năng Export và Import chưa được mô tả trong phiên bản tài liệu này.* | \- |
| AC13 | Danh sách chọn "Nhà thầu phụ trách" chỉ gồm nhà thầu "Đang hoạt động" và có hợp đồng "Đang hiệu lực" (BR52). | Hiển thị nhà thầu không hoạt động hoặc không có hợp đồng "Đang hiệu lực" trong danh sách chọn. |

#### *User story 4: Chỉnh sửa thông tin chung bảng giá mua*

| ID US | US\_BGM\_04 |
| :---- | :---- |
| **Tên Story** | Chỉnh sửa các trường thông tin chung của bảng giá mua |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn cập nhật thông tin chung của bảng giá mua, để chỉnh sửa thỏa thuận (nhà thầu, hợp đồng, thời hạn) mà không tác động tới dòng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Chức năng chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới"; các trạng thái khác ẩn nút "Chỉnh sửa thông tin chung" và chặn chỉnh sửa. | Cho chỉnh sửa bảng giá mua không ở trạng thái "Tạo mới". |
| AC2 | Nút "Chỉnh sửa thông tin chung" mở form chỉ chứa các trường của section Thông tin chung. | Form chứa/cho sửa dòng giá. |
| AC3 | Áp dụng cùng rule bắt buộc như khi thêm (Tên bảng giá mua, Nhà thầu phụ trách, Ngày hiệu lực, Ngày hết hiệu lực, Tiền tệ, Hợp đồng);  Ràng buộc: Ngày hiệu lực ≤ Ngày hết hiệu lực;  Ngày hiệu lực ≥ Ngày hiệu lực hợp đồng  Ngày hết hiệu lực ≤ Ngày hết hiệu lực hợp đồng. | Thiếu trường bắt buộc vẫn cho lưu; hoặc Ngày hiệu lực \> Ngày hết hiệu lực. |
| AC4 | Sau khi chọn Nhà thầu phụ trách, hệ thống tự động gắn hợp đồng "Đang hiệu lực" của nhà thầu (chỉ xem); tại 1 thời điểm, mỗi nhà thầu chỉ có 1 hợp đồng "Đang hiệu lực". Khi bỏ chọn Nhà thầu phụ trách, hợp đồng tự động bỏ gắn kèm. | Hợp đồng không tự động gắn kèm khi chọn nhà thầu phụ trách hoặc người dùng có thể tự ý thay đổi hợp đồng gắn kèm. |
| AC5 | "Lưu thông tin" ghi lại các thông tin thay đổi \+ lưu lịch sử thao tác; "Hủy bỏ" không lưu bất kỳ thay đổi nào. | Hủy bỏ nhưng thay đổi vẫn được lưu. |
| AC6 | Chặn người dùng chỉnh sửa khi người dùng không có quyền Chỉnh sửa bảng giá mua. | Người dùng không có quyền Chỉnh sửa vẫn sửa thành công bảng giá mua. |
| AC7 | Trường hợp user chọn lại nhà thầu phụ trách, hệ thống cập nhật hợp đồng "Đang hiệu lực" tương ứng của nhà thầu | Không cập nhật hợp đồng  |
| AC8 | Danh sách chọn "Nhà thầu phụ trách" chỉ gồm nhà thầu "Đang hoạt động" và có hợp đồng "Đang hiệu lực" (BR52). | Cho chọn nhà thầu không hoạt động hoặc không có hợp đồng "Đang hiệu lực" khi chỉnh sửa. |

#### *User story 5: Xóa bảng giá mua*

| ID US | US\_BGM\_05 |
| :---- | :---- |
| **Tên Story** | Xóa bảng giá mua |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xóa 1 bảng giá mua, để loại bỏ bản ghi tạo nhầm hoặc không còn dùng. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Nhấn Xóa, hệ thống hiển thị popup “Yêu cầu xác nhận” trước khi thực hiện xóa. | Xóa ngay không có bước xác nhận. |
| AC2 | Chỉ cho phép xóa bảng giá mua ở trạng thái "Tạo mới"; các trạng thái khác (Đang hoạt động/Ngừng hoạt động/Hết hiệu lực) bị chặn xóa và thông báo. | Cho xóa bảng giá mua không ở trạng thái "Tạo mới". |
| AC3 | Xóa thành công: bản ghi bị khóa và ẩn khỏi danh sách bảng giá mua; hệ thống KHÔNG xóa hoàn toàn dữ liệu trong cơ sở dữ liệu (xóa mềm). | Xóa vật lý dữ liệu trong DB hoặc bản ghi vẫn hiển thị trong danh sách sau khi xóa. |
| AC4 | Thao tác xóa được ghi vào lịch sử hoạt động. | Không ghi log thao tác xóa. |
| AC5 | Action Xóa chỉ hiển thị khi người dùng có quyền Xóa bảng giá mua. | Người dùng không có quyền Xóa vẫn thấy/dùng được action. |

#### *User story 6: Kích hoạt bảng giá mua & vòng đời trạng thái*

| ID US | US\_BGM\_06 |
| :---- | :---- |
| **Tên Story** | Kích hoạt bảng giá mua và điều hành máy trạng thái |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn kích hoạt bảng giá mua và hệ thống quản lý đúng vòng đời trạng thái, để đảm bảo tại mỗi thời điểm mỗi nhà thầu chỉ có 1 bảng giá đang hoạt động. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Trạng thái bảng giá mua gồm: Tạo mới, Đang hoạt động, Ngừng hoạt động, Hết hiệu lực. | Thiếu/sai danh sách trạng thái. |
| AC2 | Chức năng "Kích hoạt" chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới" hoặc "Ngừng hoạt động". | Cho kích hoạt bảng giá mua ở trạng thái khác. |
| AC3 | Khi kích hoạt bảng giá mua (ở "Tạo mới" hoặc "Ngừng hoạt động"): hệ thống kiểm tra trạng thái Nhà thầu phụ trách trước; nếu nhà thầu ≠ "Đang hoạt động" thì chặn kích hoạt và thông báo "Nhà thầu phụ trách đang không hoạt động, vui lòng kiểm tra lại Nhà thầu phụ trách". | Cho kích hoạt khi nhà thầu không hoạt động. |
| AC4 | Riêng khi kích hoạt bảng giá mua ở trạng thái "Tạo mới": sau khi kiểm tra Nhà thầu phụ trách hợp lệ (AC3), hệ thống kiểm tra tiếp: Thời điểm kích hoạt (ngày kích hoạt) ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực của hợp đồng khung liên kết.  Nếu đạt → cho phép kích hoạt; nếu không đạt → chặn kích hoạt và thông báo. | Kiểm tra ngày hiệu lực hợp đồng trước cả bước kiểm tra nhà thầu; hoặc cho kích hoạt khi Thời điểm kích hoạt \< Ngày hiệu lực hợp đồng. |
| AC5 | Khi kích hoạt (nhà thầu hợp lệ): hệ thống kiểm tra bảng giá mua khác cùng nhà thầu đang "Đang hoạt động". Nếu có → hiển thị Popup xác nhận nếu tiếp tục kích hoạt, bảng giá mua còn lại sẽ chuyển "Ngừng hoạt động". Nếu không có bảng giá mua nào khác cùng nhà thầu đang hoạt động → chuyển trạng thái và thông báo thành công. | Không cảnh báo/không yêu cầu xác nhận. |
| AC6 | Nếu người dùng xác nhận tiếp tục kích hoạt: bảng giá mua được kích hoạt → chuyển trạng thái "Đang hoạt động"; bảng giá mua khác có cùng nhà thầu & đang hoạt động → chuyển trạng thái "Ngừng hoạt động".  Nếu người dùng không xác nhận: Hủy bỏ kích hoạt và giữ nguyên trạng thái của các bảng giá r mua. | Sau kích hoạt vẫn tồn tại \>1 bảng giá mua cùng nhà thầu "Đang hoạt động". |
| AC7 | Tạo mới / Đang hoạt động / Ngừng hoạt động → Hết hiệu lực: Hệ thống tự động chuyển khi qua Ngày hết hiệu lực. | Không tự chuyển "Hết hiệu lực" khi qua hạn. |
| AC8 | Nút "Kích hoạt" chỉ hiển thị khi người dùng có quyền Kích hoạt bảng giá mua. | Người dùng không có quyền Kích hoạt vẫn thấy/dùng được nút. |
| AC9 | Kích hoạt thành công bảng giá mua ở trạng thái "Tạo mới": hệ thống tự cập nhật Ngày hiệu lực của bảng giá mua \= Ngày kích hoạt. Chỉ áp dụng khi kích hoạt từ "Tạo mới"; kích hoạt lại từ "Ngừng hoạt động" giữ nguyên Ngày hiệu lực đã có. | Sau khi kích hoạt bảng "Tạo mới", Ngày hiệu lực không được cập nhật \= Ngày kích hoạt; hoặc reset Ngày hiệu lực khi kích hoạt lại bảng "Ngừng hoạt động". |

#### *User story 7: Cập nhật bảng giá*

| ID US | US\_BGM\_07 |
| :---- | :---- |
| **Tên Story** | Thêm/xóa dòng giá và sửa đơn giá trên bảng giá mua đã tồn tại |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn cập nhật bảng giá (thêm/xóa dòng giá, sửa đơn giá) trên một bảng giá mua đã tồn tại, để điều chỉnh chi tiết giá mà không thay đổi thông tin chung. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Màn Chi tiết bảng giá mua có nút "Cập nhật bảng giá"; nút hiển thị khi bảng giá mua ở "Tạo mới", "Đang hoạt động" hoặc "Ngừng hoạt động", ẩn khi "Hết hiệu lực" (BR21). | Hiển thị nút với bảng giá mua "Hết hiệu lực"; thiếu nút ở các trạng thái còn lại. |
| AC2 | Nút "Cập nhật bảng giá" chỉ hiển thị khi người dùng có quyền Cập nhật bảng giá mua (BR27). | Người dùng không có quyền Cập nhật vẫn thấy/dùng được nút. |
| AC3 | Màn "Cập nhật bảng giá": section Thông tin chung ở chế độ chỉ đọc (disable, nhãn "Thông tin chung (Chỉ đọc)"); không cho sửa Thông tin chung tại màn này. | Cho sửa Thông tin chung tại màn Cập nhật bảng giá. |
| AC4 | Đầu mục giá bị tắt kích hoạt (bật/tắt kích hoạt trong Cấu hình đầu mục giá) bị ẩn & khóa, không thể thiết lập các dòng giá trong đầu mục giá. Đầu mục giá có Loại giá \= “Phát sinh” không được thiết lập dòng giá trong đầu mục (ẩn hiển thị và chặn thiết lập)  ID, Tên đầu mục giá, Loại giá | Vẫn hiển thị các đầu mục giá bị tắt kích hoạt Vẫn hiển thị các đầu mục giá “Phát sinh” |
| AC5 | Phần dòng giá cho thao tác trên cả 5 phân hệ: thêm dòng giá đơn lẻ (US\_BGM\_08), thêm bảng giá dịch vụ/tạo hàng loạt (US\_BGM\_09), sửa đơn giá inline (US\_BGM\_10), xóa dòng giá (US\_BGM\_11), lọc dòng giá (US\_BGM\_13). | Thiếu một trong các thao tác thêm đơn lẻ/hàng loạt/sửa đơn giá/xóa. |
| AC6 | Áp dụng khóa đồng thời (pessimistic lock): khi 1 user đang cập nhật bảng giá, user khác không được sửa đồng thời (BR22). | Hai user cùng sửa và cùng lưu gây ghi đè. |
| AC7 | Thao tác Cập nhật bảng giá KHÔNG làm thay đổi trạng thái bảng giá mua; bảng giá giữ nguyên trạng thái hiện tại (Tạo mới / Đang hoạt động / Ngừng hoạt động). | Cập nhật bảng giá làm đổi trạng thái bảng giá mua. |
| AC8 | Nút "Lưu thông tin" persist toàn bộ thay đổi dòng giá theo cơ chế atomic (BR23), ghi lịch sử hoạt động với hành động "Cập nhật" (lưu before/after theo BR10) và thông báo "Lưu bảng giá thành công"; "Hủy bỏ" không lưu bất kỳ thay đổi nào. | Lưu một phần; Hủy bỏ vẫn lưu; không ghi lịch sử thao tác cập nhật. |

#### *User story 8: Thêm 1 dòng giá trong đầu mục giá*

| ID US | US\_BGM\_08 |
| :---- | :---- |
| **Tên Story** | Thêm 1 dòng giá trong đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn thêm một dòng giá đơn lẻ vào một đầu mục giá, để bổ sung chính xác từng dòng giá theo thuộc tính của phân hệ. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Trong 1 đầu mục giá, nhấn "Thêm dòng giá mới" mở dialog nhập 1 dòng giá. | Không mở được dialog. |
| AC2 | Dialog gồm các thuộc tính đặc thù theo phân hệ (xem 3.1.2) và các trường chung: Đơn vị tính, Đơn giá. | Thiếu trường thuộc tính đặc thù hoặc trường chung. |
| AC3 | Tất cả trường trong dialog bắt buộc; thiếu bất kỳ trường nào → chặn thêm và báo lỗi. Các trường thuộc tính (theo loại dich vụ)  Cho phép chọn nhiều giá trị,  Nếu chọn giá trị “Tất cả” hệ thống disable các lựa chọn còn lại Nếu chọn ít nhất 1 giá trị cụ thể ≠ “Tất cả”, hệ thống disable lựa chọn “Tất cả” | Cho thêm khi thiếu trường bắt buộc. |
| AC4 | Đối với riêng dịch vụ kho, khi thêm mới giá trong đầu mục giá, trường Loại kho chỉ hiển thị danh sách Loại kho đã cấu hình (danh sách Loại kho được cấu hình theo đầu mục giá trong Cấu hình đầu mục giá). | Thêm mới dòng giá được chọn Loại kho ngoài danh sách Loại kho đã cấu hình cho đầu mục giá. |
| AC5 | Không hiển thị trường Trạng thái dòng giá trên dialog; khi tạo mới dòng giá, hệ thống mặc định trạng thái "Đã phê duyệt". | Hiển thị/cho chọn trạng thái dòng giá trên dialog; hoặc dòng mới không mặc định "Đã phê duyệt". |
| AC6 | Trước khi thêm vào danh sách, hệ thống kiểm tra trùng: nếu bộ thuộc tính \+ Đơn vị tính của dòng mới trùng với một dòng giá đã có trong CÙNG đầu mục giá → chặn thêm và báo lỗi trùng. | Cho thêm dòng trùng bộ thuộc tính \+ Đơn vị tính trong cùng đầu mục giá. |
| AC7 | Khi kiểm tra trùng, giá trị "Tất cả" của một thuộc tính được coi là bao trùm mọi giá trị cụ thể của thuộc tính đó (BR32): nếu các thuộc tính còn lại \+ Đơn vị tính trùng một dòng đã có và thuộc tính khác biệt mang giá trị "Tất cả" → ghi nhận trùng, chặn thêm và báo lỗi tạo dòng giá không thành công. | Cho thêm dòng chọn "Tất cả" trùng lặp với dòng có giá trị cụ thể đã tồn tại. |
| AC8 | Riêng phân hệ Vận tải: nhập riêng "Điểm đi" và "Điểm đến"; khi tạo thành công hiển thị gộp thành 1 cột "Điểm đi \- Điểm đến" dạng "\[Điểm đi\] \- \[Điểm đến\]". Nếu chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến" → hệ thống disable trường còn lại; khi tạo thành công cột "Điểm đi \- Điểm đến" ghi nhận giá trị "Tất cả" (BR33). | Không gộp cột "Điểm đi \- Điểm đến"; chọn "Tất cả" một trường vẫn cho nhập trường còn lại; cột gộp ghi sai giá trị. |
| AC9 | ID dòng giá do hệ thống tự sinh theo cấu trúc: \[Mã bảng giá mua\]-NNNN trong đó NNNN là số thứ tự sinh ra (tăng dần); người dùng không nhập. Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị NNNN. | Cho người dùng nhập/sửa ID dòng giá. ID giá sai cấu trúc. ID dòng giá hiển thị full trên giao diện \[Mã bảng giá mua\]-NNNN  |
| AC10 | Dòng giá vừa thêm được hiển thị ở trên cùng trong danh sách đầu mục giá và chỉ cập nhật vào danh sách tạm; chỉ được persist khi bấm "Lưu thông tin". Khi bộ lọc đang bật, dòng vừa thêm chỉ hiển thị nếu khớp bộ lọc (BR47). | Dòng giá được lưu ngay khi chưa bấm "Lưu thông tin". |

#### *User story 9: Thêm nhiều dòng giá trong đầu mục giá*

| ID US | US\_BGM\_09 |
| :---- | :---- |
| **Tên Story** | Thêm nhiều dòng giá trong đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn tạo nhanh hàng loạt dòng giá theo tổ hợp thuộc tính trong một đầu mục giá, để thiết lập nhiều dòng giá cùng lúc thay vì nhập từng dòng. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Trong 1 đầu mục giá, nhấn "Thêm bảng giá dịch vụ" mở dialog "Tạo nhanh hàng loạt". | Không mở được dialog. |
| AC2 | Trường "Đầu mục giá" mặc định \= đầu mục chứa nút “Thêm bảng giá dịch vụ”, bắt buộc và disable; chỉ tạo các dòng giá trong 1 đầu mục giá từ 1 loại dịch vụ (lấy theo tab đang được tạo dòng giá). | Cho đổi đầu mục giá / tạo xuyên đầu mục hoặc phân hệ / null Đầu mục giá. |
| AC3 | Các thuộc tính phân hệ cho chọn nhiều giá trị, trừ khi chọn “Tất cả” \- disable các checkbox còn lại. | Không cho chọn nhiều giá trị. Chọn tất cả vẫn chọn được các checkbox giá trị khác |
| AC4 | Đơn vị tính chỉ chọn một giá trị  Đơn giá đại diện nhập tay giá tiền. Khi tạo thành công giá, các trường này được áp dụng chung cho các dòng giá được thêm vào danh sách thiết lập.  Không cho chọn trường Trạng thái; mọi dòng sinh ra mặc định trạng thái "Đã phê duyệt". | Cho chọn nhiều với Đơn vị tính/Đơn giá đại diện; hoặc hiển thị/cho chọn Trạng thái; hoặc dòng sinh ra không mặc định "Đã phê duyệt". Áp sai đơn giá/đơn vị tính/trạng thái. |
| AC5 | Tất cả trường bắt buộc; enum có giá trị "Tất cả" được coi là đã điền hợp lệ. | Cho sinh khi thiếu trường; không chấp nhận "Tất cả". |
| AC6 | Hệ thống sinh dòng giá theo tổ hợp đầy đủ (Cartesian) mọi giá trị đã chọn của các thuộc tính; Hệ thống hiển thị số lượng dòng được tạo ra khi nhập đầy đủ các trường thông tin (Bỏ qua không đếm các trường hợp vi phạm ràng buộc như trùng điểm đi, điểm đến của dịch vụ vận tải). | Sinh thiếu/thừa tổ hợp; không có xem trước. |
| AC7 | Riêng phân hệ Vận tải:  Dòng sinh ra gộp "Điểm đi" và "Điểm đến" thành 1 cột "Điểm đi \- Điểm đến" dạng "\[Điểm đi\] \- \[Điểm đến\]". Nếu chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến" → hệ thống disable trường còn lại; dòng sinh ra ghi nhận cột "Điểm đi \- Điểm đến" \= "Tất cả" (BR33). | Sinh dòng giá có Điểm đi trùng Điểm đến; không gộp cột "Điểm đi \- Điểm đến". Chọn "Tất cả" một trường vẫn cho chọn giá trị ở trường còn lại; cột gộp ghi sai giá trị. |
| AC8 | Khi nhấn tạo, hệ thống kiểm tra các dòng giá không hợp lệ và bỏ qua (không tạo dòng giá hoặc ghi đè dòng giá sẵn có):  Trùng điểm đi, điểm đến (với dịch vụ vận tải);  Trùng với bản ghi đã tạo (trùng bộ thuộc tính đặc thù \+ Đơn vị tính với dòng đã có trong CÙNG đầu mục giá)  \=\> Hiện thông báo số dòng giá bị trùng Giá trị "Tất cả" được coi là bao trùm mọi giá trị cụ thể của thuộc tính khi so trùng (BR32). | Tạo dòng trùng bộ thuộc tính \+ Đơn vị tính trong cùng đầu mục giá; hoặc không lược bỏ dòng "Tất cả" bao trùm giá trị cụ thể đã có. |
| AC9 | Dòng giá sinh ra chỉ cập nhật vào danh sách tạm và hiển thị lên trên cùng trong đầu mục giá; chỉ persist khi bấm "Lưu thông tin". Khi bộ lọc đang bật, dòng vừa thêm chỉ hiển thị nếu khớp bộ lọc (BR47). | Dòng giá được lưu ngay khi chưa bấm "Lưu thông tin". |
| AC10 | ID dòng giá do hệ thống tự sinh theo cấu trúc: \[Mã bảng giá mua\]-NNNN trong đó NNNN là số thứ tự sinh ra (tăng dần); người dùng không nhập. Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị NNNN. | Cho người dùng nhập/sửa ID dòng giá. ID giá sai cấu trúc. ID dòng giá hiển thị full trên giao diện \[Mã bảng giá mua\]-NNNN  |

#### *User story 10: Chỉnh sửa đơn giá*

| ID US | US\_BGM\_10 |
| :---- | :---- |
| **Tên Story** | Chỉnh sửa đơn giá của dòng giá (inline) |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn sửa đơn giá của dòng giá ngay trên danh sách, để điều chỉnh giá mà không phải xóa và tạo lại dòng. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Cho sửa Đơn giá của dòng giá ngay trên danh sách (inline). | Không cho sửa đơn giá inline. |
| AC2 | KHÔNG hỗ trợ chỉnh sửa các thuộc tính khác của dòng giá (thuộc tính đặc thù, Đơn vị tính, Trạng thái); muốn đổi thuộc tính khác phải xóa và tạo lại dòng giá. | Cho sửa thuộc tính ngoài Đơn giá.  |
| AC3 | Sửa đơn giá dòng đang được tham chiếu hạ nguồn (định mức mua/bán, Chi phí dịch vụ), lưu chỉnh sửa → cho phép:  trạng thái dòng giá chuyển thành “Chờ phê duyệt”. Dòng "Chờ phê duyệt" **KHÔNG** còn là nguồn hợp lệ cho giá mua/bán định mức (theo BR4/BR5 — SRS Giá mua định mức) — tổ hợp tương ứng tạm thời **biến mất khỏi màn định mức** cho tới khi dòng giá được phê duyệt.  *(Luồng phê duyệt bảng giá mua chưa triển khai, tạm thời luồng trạng thái dừng ở đây)* | Chặn sửa hoặc không cập nhật hạ nguồn theo giá mới; hoặc không hiển thị icon cảnh báo/tooltip tại Bảng giá mua định mức khi sửa đơn giá dòng "Đã phê duyệt". |
| AC4 | Thay đổi đơn giá chỉ cập nhật vào danh sách tạm; chỉ persist khi bấm "Lưu thông tin". | Thay đổi đơn giá được lưu ngay khi chưa bấm "Lưu thông tin". |

#### *User story 11: Xóa dòng giá*

| ID US | US\_BGM\_11 |
| :---- | :---- |
| **Tên Story** | Xóa một dòng giá khỏi đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xóa một dòng giá khỏi đầu mục giá, để loại bỏ dòng giá sai/không dùng hoặc phục vụ tạo lại khi cần đổi thuộc tính. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Mỗi dòng giá trong danh sách có action Xóa. | Thiếu action Xóa. |
| AC2 | Xóa thành công, tại Bảng giá mua định mức, xóa dòng giá nhà thầu tham chiếu và dòng giá định mức hiển thị icon cảnh báo kèm tooltip "Đã có điều chỉnh đơn giá nhà thầu" | Xóa dòng đang tham chiếu mà không hiển thị icon cảnh báo. |
| AC3 | Thao tác xóa dòng giá chỉ cập nhật vào danh sách tạm; chỉ persist khi bấm "Lưu thông tin". | Xóa được lưu ngay khi chưa bấm "Lưu thông tin". |

#### *Use story 12: Xem chi tiết lịch sử cập nhật (before/after)*

| ID US | US\_BGM\_12 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết thay đổi trước/sau của một bản ghi lịch sử |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem chi tiết giá trị trước/sau của một thao tác Cập nhật, để truy vết chính xác nội dung đã thay đổi. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Mỗi bản ghi lịch sử có Hành động là “Cập nhật Bảng giá mua” và “Phê duyệt bảng giá mua” có action "Xem chi tiết" mở popup so sánh giá trị Trước (before) và Sau (after). | Không mở được popup hoặc thiếu dữ liệu before/after. |
| AC2 | Popup hiển thị: Thông tin chung: Thời gian, Người thực hiện Thông tin bản ghi trước thay đổi (before) và sau thay đổi (after): Thông tin chung, 5 tab phân hệ theo loại dịch vụ và danh sách dòng giá theo đầu mục trong từng tab. | Hiển thị sai giá trị hoặc thiếu trường thông tin.  Không hiển thị đầy đủ cả 2 bản ghi trước và sau thay đổi. |

#### *User story 13: Lọc dòng giá theo thuộc tính tại màn Thêm mới/Cập nhật bảng giá*

| ID US | US\_BGM\_13 |
| :---- | :---- |
| **Tên Story** | Lọc dòng giá theo cột đặc thù và Đơn vị tính tại màn Thêm mới bảng giá mua và Cập nhật bảng giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn lọc dòng giá theo các thuộc tính đặc thù của phân hệ và Đơn vị tính ngay khi đang thiết lập giá, để khoanh vùng nhanh nhóm dòng giá cần rà soát, sửa Đơn giá hoặc xóa trước khi lưu. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Mỗi tab phân hệ có nút "Bộ lọc" trong section "Thiết lập giá đầu vào dịch vụ". Áp dụng cho cả màn Thêm mới bảng giá mua (US\_BGM\_03) và Cập nhật bảng giá (US\_BGM\_07). | Thiếu nút "Bộ lọc" ở 1 trong 5 tab. Có bộ lọc ở 1 màn nhưng thiếu ở màn còn lại. |
| AC2 | Trường lọc theo phân hệ (cột đặc thù \+ Đơn vị tính): Vận tải: Điểm đi, Điểm đến, Loại xe, Đơn vị tính Kho bãi: Tên kho, Loại kho, Đơn vị tính Khai báo Hải quan: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe, Đơn vị tính Hải quan Giám sát: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe, Đơn vị tính Sang tải: Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa, Đơn vị tính | Thiếu/thừa trường lọc so với phân hệ. Hiển thị trường lọc của phân hệ khác. |
| AC3 | Phân hệ Vận tải: lọc riêng "Điểm đi" và "Điểm đến" (thống nhất US\_GDM\_03 AC1), dù danh sách hiển thị gộp cột "Điểm đi \- Điểm đến" (BR33). | Gộp "Điểm đi" và "Điểm đến" thành 1 trường lọc. Lọc sai khi dòng có cột gộp \= "Tất cả". |
| AC4 | Mỗi trường lọc cho chọn nhiều giá trị (multi-select). Danh sách giá trị lấy theo danh mục của thuộc tính; không có lựa chọn "Tất cả" trong bộ lọc (BR51). | Chỉ cho chọn 1 giá trị. Hiển thị lựa chọn "Tất cả" trong danh sách giá trị lọc. |
| AC5 | Điều kiện kết hợp: Nhiều giá trị trong 1 trường → HOẶC. Nhiều trường → VÀ. Trường không chọn giá trị → không lọc theo trường đó. | Kết hợp HOẶC giữa các trường. Trường bỏ trống làm kết quả rỗng. |
| AC6 | Khi lọc theo 1 thuộc tính, kết quả gồm dòng có giá trị đúng bộ lọc VÀ dòng có giá trị "Tất cả" ở thuộc tính đó (BR32a, BR44). Ví dụ: lọc Loại xe \= "Xe 40ft" → hiển thị dòng Loại xe \= "Xe 40ft" và dòng Loại xe \= "Tất cả". | Lọc bỏ sót dòng "Tất cả". Dòng "Tất cả" không xuất hiện trong kết quả lọc. |
| AC7 | Phạm vi lọc: 1 bộ lọc chung cho tab phân hệ đang thao tác, áp dụng cho mọi đầu mục giá trong tab. Không áp dụng cho các tab còn lại; mỗi tab có trạng thái bộ lọc riêng. Đầu mục giá không có dòng khớp vẫn hiển thị, bảng dòng giá trống kèm thông báo "Không có dòng giá phù hợp với bộ lọc". | Bộ lọc của tab này áp sang tab khác. Ẩn đầu mục giá không có dòng khớp. |
| AC8 | Lọc thực hiện trên danh sách tạm, gồm dòng đã lưu và dòng vừa thêm/sửa chưa lưu. Bộ lọc chỉ ảnh hưởng hiển thị; không thêm, sửa hay xóa dữ liệu dòng giá. | Lọc bỏ sót dòng chưa lưu. Dòng bị ẩn do bộ lọc bị mất/bị xóa khỏi danh sách tạm. |
| AC9 | Khi bộ lọc đang bật, dòng giá mới (thêm đơn lẻ US\_BGM\_08 hoặc tạo hàng loạt US\_BGM\_09) áp bộ lọc như bình thường: Khớp bộ lọc → hiển thị trên cùng đầu mục giá. Không khớp → không hiển thị nhưng vẫn nằm trong danh sách tạm. Bộ lọc không bị tự động xóa. | Dòng không khớp vẫn hiển thị. Dòng không khớp không được đưa vào danh sách tạm. Bộ lọc tự xóa khi thêm dòng. |
| AC10 | Kiểm tra trùng khi thêm dòng (BR28, BR32b) thực hiện trên toàn bộ dòng trong đầu mục giá, kể cả dòng đang bị ẩn bởi bộ lọc. | Cho thêm dòng trùng với dòng đang bị ẩn bởi bộ lọc. |
| AC11 | Sửa Đơn giá inline (US\_BGM\_10) và Xóa dòng giá (US\_BGM\_11) hoạt động bình thường trên kết quả lọc. Sau thao tác, bộ lọc giữ nguyên. Sửa Đơn giá không đổi thuộc tính nên dòng không rời khỏi kết quả lọc. | Sửa/xóa xong bộ lọc bị reset. Thao tác tác động đến dòng không thuộc dòng được chọn. |
| AC12 | "Lưu thông tin" lưu toàn bộ danh sách tạm (atomic, BR23), kể cả dòng đang bị ẩn bởi bộ lọc. "Hủy bỏ" không lưu thay đổi. | Chỉ lưu các dòng đang hiển thị. Dòng bị ẩn do bộ lọc bị mất sau khi lưu. |
| AC13 | Nhấn "Xóa bộ lọc" → xóa toàn bộ điều kiện của tab đang xem. | Không có cách xóa bộ lọc. |
| AC14 | Vòng đời bộ lọc: Chuyển qua lại giữa các tab: mỗi tab giữ bộ lọc riêng trong phiên đang mở màn. Rời màn (Lưu/Hủy bỏ): xóa toàn bộ bộ lọc, không lưu giữa các phiên. | Bộ lọc còn tồn tại khi mở lại màn. Chuyển tab làm mất bộ lọc của tab trước đó. |
| AC15 | Chức năng Lọc không kiểm soát phân quyền riêng: mọi người dùng vào được màn Thêm mới/Cập nhật bảng giá (theo BR27) đều dùng được. | Chặn hoặc ẩn bộ lọc vì lý do phân quyền. |

### 3.1.2 Mô tả giao diện (Reviewing)

* Ảnh giao diện: \[Chèn ảnh màn hình Danh sách / Chi tiết / Thêm mới / Chỉnh sửa thông tin chung / Cập nhật bảng giá / dialog dòng giá\]

* Link UI Design: \[Chèn link\]

* Màn hình chính: Danh sách bảng giá mua; Chi tiết (thông tin chung \+ 5 tab dòng giá \+ lịch sử); Thêm mới bảng giá mua; Chỉnh sửa thông tin chung; Cập nhật bảng giá; các dialog cấu hình dòng giá (thêm đơn lẻ / tạo hàng loạt).

**Bảng trường dữ liệu — Form "Chỉnh sửa thông tin chung / Thêm bảng giá mua" (section Thông tin chung):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tên bảng giá mua | v | Text | — | (Trống) | Tên định danh bảng giá mua; chặn trùng tên khi tạo |
| Nhà thầu phụ trách | v | Select (nhà thầu) | — | (Trống) | Chọn từ danh sách nhà thầu "Đang hoạt động" và có hợp đồng "Đang hiệu lực" (BR52); mỗi nhà thầu chỉ 1 bảng giá mua Đang hoạt động |
| Ngày hiệu lực | v | Date | — | (Trống) | Ngày bắt đầu áp dụng |
| Ngày hết hiệu lực | v | Date | — | (Trống) | Ngày kết thúc áp dụng; phải ≥ Ngày hiệu lực |
| Tiền tệ | v | Select (enum) | — | VND | Đơn vị tiền tệ áp dụng chung cho toàn bộ dòng giá của bảng giá; chỉ chọn 1 giá trị, không cho phép nhiều đơn vị tiền tệ trong 1 bảng giá; enum cố định Chọn từ danh sách cố định: VND, CNY, USD |
| Mã hợp đồng (ID hợp đồng) | v | Pointer (chỉ đọc) | — | (Tự điền) | Tự động gắn hợp đồng "Đang hiệu lực" của nhà thầu phụ trách; chỉ xem |
| Tên hợp đồng | — | Text (chỉ đọc) | — | (Tự điền) | Tự điền theo Mã hợp đồng |
| Ghi chú bổ sung | — | Text | — | (Trống) | Ghi chú thêm cho bảng giá |

*Lưu ý: ID bảng giá mua do hệ thống tự sinh theo cấu trúc RSYYMM-NNN, không hiển thị để nhập trong form. Trường "Trạng thái áp dụng" không hiển thị trong form Chỉnh sửa thông tin chung (do máy trạng thái điều khiển — xem US\_BGM\_06). Ở màn "Cập nhật bảng giá" section Thông tin chung hiển thị chế độ chỉ đọc (disable).*

**Bảng trường dữ liệu — Dialog "Thêm/nhập dòng giá đơn lẻ" (Thêm mới dòng giá):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| Thuộc tính đặc thù phân hệ (các biến) | v | Select | (Trống) | Theo phân hệ (xem bảng cấu trúc cột 3.1.2); ví dụ Kho bãi: Tên kho, Loại kho |
| Đơn vị tính | v | Select (enum) | (Theo cấu hình) | Enum cố định từ cấu hình |
| Đơn giá | v | Number | (Trống) | Đơn giá của dòng giá |
| Trạng thái | v | Enum | Đã phê duyệt | Hệ thống mặc định "Đã phê duyệt"; không hiển thị/không cho chọn khi thêm dòng giá |

**Bảng trường dữ liệu — Dialog "Tạo nhanh hàng loạt" (Thêm bảng giá dịch vụ):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| Đầu mục giá | v | Select (chỉ đọc) | (Đầu mục chứa nút) | Mặc định \= đầu mục giá chứa nút "Thêm bảng giá dịch vụ"; disable |
| Thuộc tính phân hệ (multi-select) (các biến) | v | Multi-select (enum) | (Trống) | Chọn nhiều giá trị để sinh tổ hợp; enum có giá trị "Tất cả"; riêng "Tên kho" là dropdown cho chọn nhiều giá trị |
| Đơn vị tính | v | Select (enum) | (Theo cấu hình) | Chọn đơn, áp chung mọi dòng sinh ra |
| Đơn giá đại diện | v | Number | (Trống) | Đơn giá áp cho toàn bộ dòng giá sinh ra (đơn giá cuối, không tính toán thêm) |
| Trạng thái | v | Enum | Đã phê duyệt | Hệ thống mặc định "Đã phê duyệt"; không hiển thị/không cho chọn, áp chung mọi dòng |

*Ghi chú: Dialog "Chỉnh sửa dòng giá đơn lẻ" giữ tên trường "Đơn giá"; chỉ dialog "Tạo nhanh hàng loạt" dùng tên "Đơn giá đại diện". Cột trong danh sách dòng giá luôn hiển thị tên "Đơn giá".*

**Cấu trúc cột danh sách dòng giá theo từng phân hệ (nhóm theo đầu mục giá):**

| Phân hệ | Cột đặc thù | Cột chung |
| :---- | :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Loại xe | Đơn vị tính, Đơn giá, Trạng thái |
| (2) Kho bãi | Tên kho, Loại kho | Đơn vị tính, Đơn giá, Trạng thái |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Đơn giá, Trạng thái |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Đơn giá, Trạng thái |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa | Đơn vị tính, Đơn giá, Trạng thái |

*Ghi chú (Vận tải): trên form tạo dòng giá, "Điểm đi" và "Điểm đến" là 2 trường nhập riêng; trong danh sách dòng giá của bảng giá, hai trường được hiển thị gộp thành 1 cột "Điểm đi \- Điểm đến" dạng "\[Điểm đi\] \- \[Điểm đến\]". Khi chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến", hệ thống disable trường còn lại và cột gộp ghi nhận giá trị "Tất cả" (xem BR33). Ngoài ra, mỗi thuộc tính có thể nhận giá trị "Tất cả" theo BR32.*

Màn hình: Thêm mới bảng giá mua và Cập nhật bảng giá — section "Thiết lập giá đầu vào dịch vụ" (5 tab). Panel "Bộ lọc dòng giá" mở từ nút "Bộ lọc" trên thanh công cụ của tab.

Link UI Design: [Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=10477-102910&t=WV0Lgpv3EwatkzL4-0)

**Bảng trường dữ liệu — Panel "Bộ lọc dòng giá" (màn Thêm mới bảng giá mua và Cập nhật bảng giá):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Điểm đi |  | Multi-select (enum) | — | (Trống) | Phân hệ: Vận tải. Lọc riêng, không gộp với Điểm đến (BR33). |
| Điểm đến |  | Multi-select (enum) | — | (Trống) | Phân hệ: Vận tải. Lọc riêng, không gộp với Điểm đi. |
| Loại xe |  | Multi-select (enum) | — | (Trống) | Phân hệ: Vận tải, Khai báo Hải quan, Hải quan Giám sát. Dòng "Tất cả" luôn khớp (BR44). |
| Tên kho |  | Multi-select (enum) | — | (Trống) | Phân hệ: Kho bãi. Dòng "Tất cả" luôn khớp. |
| Loại kho |  | Multi-select (enum) | — | (Trống) | Phân hệ: Kho bãi. Lấy toàn bộ danh mục Loại kho (không giới hạn theo đầu mục vì bộ lọc dùng chung cho cả tab). |
| Chi cục hải quan |  | Multi-select (enum) | — | (Trống) | Phân hệ: Khai báo Hải quan, Hải quan Giám sát. Dòng "Tất cả" luôn khớp. |
| Loại hình XNK |  | Multi-select (enum) | — | (Trống) | Phân hệ: Khai báo Hải quan, Hải quan Giám sát. Dòng "Tất cả" luôn khớp. |
| Nhóm hàng |  | Multi-select (enum) | — | (Trống) | Phân hệ: Khai báo Hải quan, Hải quan Giám sát, Sang tải. Dòng "Tất cả" luôn khớp. |
| Địa điểm sang tải |  | Multi-select (enum) | — | (Trống) | Phân hệ: Sang tải. Dòng "Tất cả" luôn khớp. |
| Phương thức sang tải |  | Multi-select (enum) | — | (Trống) | Phân hệ: Sang tải. Dòng "Tất cả" luôn khớp. |
| Đặc tính hàng hóa |  | Multi-select (enum) | — | (Trống) | Phân hệ: Sang tải. Dòng "Tất cả" luôn khớp. |
| Đơn vị tính |  | Multi-select (enum) | — | (Trống) | Phân hệ: cả 5 phân hệ. Khớp chính xác giá trị; Đơn vị tính không có giá trị "Tất cả". |
| Xóa bộ lọc |  | Button | — | — | Xóa toàn bộ điều kiện của tab đang xem và hiển thị lại đầy đủ dòng giá. |

### 3.1.3. Quy tắc nghiệp vụ (Business Rule)

| ID | Quy tắc |
| ----- | :---- |
| BR1 | Mỗi bảng giá mua gắn đúng 1 nhà thầu phụ trách và 1 hợp đồng khung; quan hệ bảng giá mua–hợp đồng là 1-1. |
| BR2 | Tại mỗi thời điểm, mỗi nhà thầu chỉ được có 1 bảng giá mua ở trạng thái "Đang hoạt động" — đảm bảo qua cơ chế kích hoạt: khi kích hoạt 1 bảng giá mua, bảng giá mua khác cùng nhà thầu đang "Đang hoạt động" tự động chuyển "Ngừng hoạt động" (sau khi người dùng xác nhận). |
| BR3 | Trạng thái bảng giá mua: Tạo mới, Đang hoạt động, Ngừng hoạt động, Hết hiệu lực. Chuyển trạng thái (xem US\_BGM\_06): Tạo mới/Ngừng hoạt động → Đang hoạt động qua chức năng "Kích hoạt"; Đang hoạt động → Ngừng hoạt động khi 1 bảng giá mua khác cùng nhà thầu được kích hoạt; mọi trạng thái → Hết hiệu lực tự động khi qua Ngày hết hiệu lực. |
| BR4 | Chức năng "Kích hoạt" chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới" hoặc "Ngừng hoạt động". |
| BR5 | Khi kích hoạt bảng giá mua (ở "Tạo mới" hoặc "Ngừng hoạt động"), hệ thống kiểm tra trạng thái Nhà thầu phụ trách; chỉ cho kích hoạt khi nhà thầu "Đang hoạt động", ngược lại chặn và cảnh báo. |
| BR6 | Menu này KHÔNG áp dụng luồng phê duyệt bảng giá mua trong giai đoạn hiện tại. |
| BR7 | Màn chi tiết luôn hiển thị đủ 5 tab phân hệ; phân hệ không có giá hiển thị bảng trống. Không bắt buộc bảng giá mua đủ cả 5 phân hệ. |
| BR8 | Dòng giá (con) bắt buộc thuộc 1 đầu mục giá (cha) lấy từ menu "Cấu hình đầu mục giá"; không thể tạo dòng giá ngoài đầu mục giá. |
| BR9 | Cấu trúc cột dòng giá phụ thuộc phân hệ (xem 3.1.2). |
| BR10 | Trạng thái dòng giá: xem BR18–BR20 (thêm/xóa/sửa đơn giá, tạo hàng loạt). |
| BR11 | Ngày hiệu lực phải nhỏ hơn hoặc bằng Ngày hết hiệu lực. |
| BR13 | Chức năng "Chỉnh sửa thông tin chung" chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới"; chỉ sửa các trường trong section Thông tin chung (không sửa dòng giá, không hiển thị trường "Trạng thái áp dụng"). Các trạng thái khác ẩn nút và chặn chỉnh sửa. |
| BR14 | Chỉ được phép xóa bảng giá mua ở trạng thái "Tạo mới". |
| BR15 | Chỉ dòng giá có trạng thái "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" mới được tham chiếu (động) tại Bảng giá mua định mức, Bảng giá bán định mức và Chi phí dịch vụ. |
| BR16 | Mọi thao tác Thêm/Cập nhật/Kích hoạt/Xóa được ghi vào Lịch sử hoạt động (Thời gian, Người thực hiện, Hành động, Nội dung). Riêng thao tác tạo mới bảng giá thành công ghi log với hành động "Khởi tạo bảng giá". |
| BR17 | Checkbox chọn nhiều ở màn danh sách phục vụ chức năng xuất dữ liệu (bulk export). |
| BR18 | Cấu hình dòng giá (thêm đơn lẻ, thêm hàng loạt, xóa, sửa đơn giá) thuộc phạm vi "Thêm mới bảng giá mua" và "Cập nhật bảng giá". KHÔNG hỗ trợ chỉnh sửa toàn bộ thuộc tính của một dòng giá; chỉ sửa Đơn giá (inline). Muốn đổi thuộc tính khác phải xóa và tạo lại dòng. |
| BR19 | Tạo hàng loạt ("Thêm bảng giá dịch vụ") sinh dòng giá theo tổ hợp đầy đủ (Cartesian) các giá trị đã chọn của các thuộc tính (theo loại dịch vụ);  Áp Đơn giá \= "Đơn giá đại diện", cùng Đơn vị tính đã chọn và mặc định trạng thái \= "Đã phê duyệt".  Các dòng giá chỉ thuộc 1 đầu mục giá (trường "Đầu mục giá" mặc định \= đầu mục chứa nút, disable);  Ràng buộc: bắt buộc điền mọi trường thông tin, các trường thuộc tính (danh sách trường tùy theo loại dịch vụ) được chọn nhiều giá trị; enum có giá trị "Tất cả" (coi là đã điền).  |
| BR20 | Trạng thái dòng giá: mặc định "Đã phê duyệt", độc lập với trạng thái bảng giá mua. Trong phase này chưa triển khai chức năng phê duyệt giá nên mọi dòng giá được tạo đều mặc định ở trạng thái "Đã phê duyệt". |
| BR21 | Chức năng "Cập nhật bảng giá" áp dụng cho bảng giá mua ở "Tạo mới"/"Đang hoạt động"/"Ngừng hoạt động" (ẩn nút khi "Hết hiệu lực");  Trong màn Cập nhật bảng giá, section Thông tin chung ở chế độ chỉ đọc (disable). |
| BR22 | Khi 1 user đang "Chỉnh sửa thông tin chung" hoặc "Cập nhật bảng giá" một bảng giá mua, hệ thống áp dụng khóa bảng (pessimistic lock); user khác không được sửa đồng thời. |
| BR23 | Các dialog cấu hình dòng giá chỉ cập nhật danh sách tạm; toàn bộ thay đổi (thông tin chung \+ dòng giá) chỉ được lưu (atomic) khi bấm "Lưu thông tin". Cho phép lưu khi đầu mục/phân hệ chưa có dòng giá. Bao gồm cả dòng đang bị ẩn bởi bộ lọc (BR46). |
| BR24 | Chặn trùng Tên bảng giá mua khi tạo mới. |
| BR25 | Sửa đơn giá & Phê duyệt dòng giá (mới) → Tại bảng giá mua định mức, hiển thị cảnh báo dòng giá tham chiếu và cập nhật giá mới Xóa dòng giá → Tại bảng giá mua định mức, / xóa dòng đơn giá mua theo nhà thầu   |
| BR26 | ID dòng giá do hệ thống tự sinh theo cấu trúc: \[Mã bảng giá mua\]-NNNN trong đó NNNN là số thứ tự sinh ra (tăng dần); người dùng không nhập.  Đầu mục giá bị tắt kích hoạt (trong Cấu hình đầu mục giá) sẽ bị ẩn ở màn Thêm mới/Cập nhật/Chi tiết Bảng giá mua & khóa, không được sử dụng ở các menu khác (bao gồm cả đầu mục và các dòng giá bên trong).  Chỉ thiết lập giá cho các Đầu mục giá có Loại giá \= {Cố định;Phụ phí}Đầu mục giá có Loại giá \= “Phát sinh” không được thiết lập dòng giá trong đầu mục (ẩn hiển thị và chặn thiết lập) Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị NNNN. |
| BR27 | Mỗi chức năng Xem/Thêm/Sửa/Xóa/Kích hoạt được kiểm soát bằng phân quyền; nút/action/menu tương ứng chỉ hiển thị và thao tác được khi người dùng có quyền, ngược lại ẩn hoàn toàn và chặn sử dụng chức năng |
| BR28 | Khi thêm dòng giá (đơn lẻ hoặc hàng loạt) trong một đầu mục giá, hệ thống kiểm tra trùng theo tổ hợp (bộ thuộc tính đặc thù phân hệ \+ Đơn vị tính) với các dòng giá đã có trong CÙNG đầu mục giá; dòng trùng bị chặn (thêm đơn lẻ) hoặc bị lược bỏ (tạo hàng loạt), không tạo bản ghi trùng. Kiểm tra trên toàn bộ dòng, không phụ thuộc bộ lọc đang bật (BR46). |
| BR29 | Riêng phân hệ Vận tải, khi sinh tổ hợp hàng loạt, "Điểm đi" luôn phải khác "Điểm đến"; mọi tổ hợp có Điểm đi trùng Điểm đến bị lược bỏ, không tạo dòng giá. |
| BR30 | ID bảng giá mua do hệ thống tự sinh theo cấu trúc RSYYMM-NNN (RS \= ratesheet, YYMM \= năm/tháng tạo, NNN= số thứ tự trong tháng tạo, bắt đầu từ 001; ví dụ RS260804-001); người dùng không nhập/sửa. |
| BR31 | Xóa bảng giá mua là xóa mềm (soft delete): bản ghi bị khóa và ẩn khỏi danh sách, KHÔNG xóa vật lý khỏi cơ sở dữ liệu; chỉ áp dụng cho bảng giá mua ở "Tạo mới" (BR14). |
| BR32 | Một thuộc tính của dòng giá có thể nhận giá trị đặc biệt "Tất cả" (áp dụng cho mọi giá trị của thuộc tính đó). Giá trị "Tất cả" tuân theo 2 quy tắc:  (a) LỌC — khi lọc danh sách dòng giá theo một thuộc tính, kết quả bao gồm các dòng có giá trị đúng bộ lọc VÀ các dòng có giá trị "Tất cả" ở thuộc tính đó (dòng "Tất cả" luôn khớp mọi bộ lọc của thuộc tính tương ứng);  Áp dụng cả cho bộ lọc tại màn Thêm mới/Cập nhật bảng giá (BR44). (b) CHỐNG TRÙNG — khi kiểm tra trùng dòng giá (BR28), "Tất cả" của một thuộc tính được coi là bao trùm mọi giá trị cụ thể của thuộc tính đó: nếu các thuộc tính còn lại \+ Đơn vị tính trùng một dòng đã có trong cùng đầu mục giá và thuộc tính khác biệt mang giá trị "Tất cả" (bao trùm giá trị cụ thể của dòng đã có) → ghi nhận trùng; đơn lẻ bị chặn, hàng loạt bị lược bỏ.  |
| BR33 | Riêng phân hệ Vận tải: "Điểm đi" và "Điểm đến" được nhập riêng trên form tạo dòng giá; khi tạo thành công, hệ thống gộp thành 1 cột "Điểm đi \- Điểm đến" trong bảng giá với định dạng "\[Điểm đi\] \- \[Điểm đến\]". Nếu chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến" → hệ thống disable trường còn lại; khi tạo thành công, cột "Điểm đi \- Điểm đến" ghi nhận giá trị "Tất cả". |
| BR34 | Ràng buộc ngày theo hợp đồng khung liên kết (kiểm tra khi Lưu): Ngày hiệu lực của bảng giá mua phải ≥ Ngày hiệu lực của hợp đồng khung liên kết.  |
| BR35 | Ràng buộc ngày theo hợp đồng khung liên kết (kiểm tra khi Lưu): Ngày hết hiệu lực của bảng giá mua phải ≤ Ngày hết hiệu lực của hợp đồng khung liên kết.  |
| BR36 | Cảnh báo sắp hết hiệu lực: trước Ngày hết hiệu lực của bảng giá mua 10 ngày / 5 ngày / 1 ngày, hệ thống hiển thị cảnh báo nhắc người dùng bảng giá sắp hết hiệu lực (để kịp kích hoạt bảng giá thay thế).  |
| BR37 | Tiền tệ là thuộc tính chung của bảng giá mua, được thiết lập tại section Thông tin chung; toàn bộ dòng giá của bảng giá dùng chung 1 loại tiền tệ. Dòng giá KHÔNG có trường Tiền tệ riêng. |
| BR38 | Khi kích hoạt bảng giá mua (thủ công) ở trạng thái "Tạo mới": hệ thống kiểm tra Thời điểm kích hoạt (ngày kích hoạt) ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực của hợp đồng khung; nếu không đạt thì chặn kích hoạt. Trình tự kiểm tra khi kích hoạt bảng "Tạo mới": (1) Nhà thầu phụ trách "Đang hoạt động" (BR5); (2) Thời điểm kích hoạt ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực hợp đồng (BR38). |
| BR39 | Kích hoạt thành công bảng giá mua ở trạng thái "Tạo mới": hệ thống tự cập nhật Ngày hiệu lực của bảng giá mua \= Ngày kích hoạt. Quy tắc chỉ áp dụng khi kích hoạt từ "Tạo mới"; kích hoạt lại từ "Ngừng hoạt động" giữ nguyên Ngày hiệu lực đã có. |
| BR40 | Danh sách bảng giá mua mặc định sắp xếp theo Thời gian tạo (created time) giảm dần — bản ghi mới nhất ở trên cùng. Khi tạo mới bảng giá mua thành công, bản ghi mới luôn xuất hiện ở đầu danh sách. Người dùng vẫn có thể đổi sắp xếp theo Ngày hiệu lực / Ngày hết hiệu lực (US\_BGM\_01 AC2); khi không áp sắp xếp thủ công, danh sách trở về mặc định theo Thời gian tạo giảm dần. |
| BR41 | Bộ lọc dòng giá tại màn Thêm mới/Cập nhật bảng giá chỉ lọc hiển thị trên danh sách tạm; không thay đổi và không xóa dữ liệu dòng giá. |
| BR42 | Trường lọc theo phân hệ \= cột đặc thù (mục 3.1.2) \+ Đơn vị tính. Vận tải lọc riêng Điểm đi và Điểm đến dù cột hiển thị gộp (BR33). |
| BR43 | Nhiều giá trị trong 1 trường → HOẶC; nhiều trường → VÀ; trường không chọn giá trị → không lọc theo trường đó. |
| BR44 | Dòng có giá trị "Tất cả" ở thuộc tính đang lọc luôn khớp (BR32a). Vận tải: dòng có cột "Điểm đi \- Điểm đến" \= "Tất cả" khớp mọi bộ lọc Điểm đi/Điểm đến. |
| BR45 | 1 bộ lọc/tab, áp dụng cho mọi đầu mục giá trong tab; không ảnh hưởng tab khác. Đầu mục giá không có dòng khớp vẫn hiển thị với bảng trống. |
| BR46 | Bộ lọc áp trên toàn bộ danh sách tạm (dòng đã lưu \+ dòng chưa lưu). Kiểm tra trùng (BR28) và "Lưu thông tin" (BR23) xử lý toàn bộ dòng, không phụ thuộc bộ lọc. |
| BR47 | Khi bộ lọc đang bật, dòng mới thêm (đơn lẻ/hàng loạt) áp bộ lọc như bình thường: khớp → hiển thị trên cùng đầu mục; không khớp → ẩn nhưng vẫn nằm trong danh sách tạm; bộ lọc không tự xóa. |
| BR48 | Sửa Đơn giá và xóa dòng trên kết quả lọc giữ nguyên bộ lọc. Sửa Đơn giá không đổi thuộc tính nên dòng không rời khỏi kết quả lọc. |
| BR49 | Bộ lọc giữ riêng theo từng tab trong phiên mở màn; xóa khi rời màn (Lưu/Hủy bỏ); không lưu vào cơ sở dữ liệu. |
| BR50 | Chức năng Lọc không kiểm soát phân quyền riêng; quyền vào màn theo BR27. |
| BR51 | Danh sách giá trị lọc lấy theo danh mục thuộc tính; không có lựa chọn "Tất cả". Giá trị đã ngừng sử dụng nhưng còn trong dòng giá hiện có vẫn hiển thị để có thể lọc. |
| BR52 | Tại màn Thêm mới bảng giá mua (US\_BGM\_03) và Chỉnh sửa thông tin chung (US\_BGM\_04), danh sách chọn "Nhà thầu phụ trách" chỉ gồm nhà thầu thỏa đồng thời: Trạng thái nhà thầu \= "Đang hoạt động". Có hợp đồng ở trạng thái "Đang hiệu lực". |

### 3.1.4 Danh sách thông báo và lỗi

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Nhấn "Lưu"/"Thêm" khi thiếu trường bắt buộc | Lỗi | "Vui lòng nhập đầy đủ thông tin bắt buộc" | Không lưu/không thêm, giữ nguyên form |
| Ngày hiệu lực \> Ngày hết hiệu lực | Lỗi | "Ngày hiệu lực phải nhỏ hơn hoặc bằng ngày hết hiệu lực" | Không lưu |
| Kích hoạt bảng giá mua (Tạo mới/Ngừng hoạt động) khi Nhà thầu phụ trách không hoạt động | Lỗi | "Nhà thầu phụ trách đang không hoạt động, vui lòng kiểm tra lại Nhà thầu phụ trách" | Chặn kích hoạt |
| Kích hoạt bảng giá mua (Tạo mới) khi Thời điểm kích hoạt \< Ngày hiệu lực của hợp đồng liên kết | Lỗi | "Chưa đến ngày hiệu lực của hợp đồng, không thể kích hoạt bảng giá" | Chặn kích hoạt |
| Kích hoạt bảng giá mua khi có bảng giá mua khác cùng nhà thầu đang "Đang hoạt động" | Cảnh báo | "Kích hoạt bảng giá này đồng nghĩa với việc bảng giá \[Mã bảng giá\] \[Tên bảng giá\] đang áp dụng sẽ ngừng hoạt động, vẫn tiếp tục kích hoạt?" | Yêu cầu xác nhận; sau xác nhận: kích hoạt bảng giá mua \+ chuyển bảng giá mua kia sang "Ngừng hoạt động" |
| Kích hoạt bảng giá mua thành công (không có bảng giá mua trùng nhà thầu) | Thành công | "Kích hoạt bảng giá thành công" | Chuyển bảng giá mua sang "Đang hoạt động", ghi lịch sử |
| Thêm bảng giá mua thành công | Thành công | "Thêm bảng giá mua thành công" | Ghi lịch sử với hành động "Khởi tạo bảng giá", chuyển về màn hình chi tiết |
| Tạo mới bảng giá mua trùng Tên bảng giá mua | Lỗi | "Tên bảng giá mua đã tồn tại" | Không lưu |
| Lưu cấu hình dòng giá / Cập nhật bảng giá thành công | Thành công | "Lưu bảng giá thành công" | Persist dòng giá, ghi lịch sử |
| Tạo nhanh hàng loạt thiếu trường bắt buộc | Lỗi | "Vui lòng nhập đầy đủ thông tin bắt buộc" | Không sinh dòng giá |
| Thêm dòng giá đơn lẻ trùng thuộc tính \+ Đơn vị tính trong cùng đầu mục giá (kể cả khi trùng do giá trị "Tất cả" bao trùm giá trị cụ thể đã có) | Lỗi | "Dòng giá đã tồn tại trong đầu mục giá này (trùng thuộc tính và đơn vị tính)" | Không thêm dòng giá |
| Tạo hàng loạt phát sinh dòng trùng hoặc (Vận tải) Điểm đi trùng Điểm đến | Thông báo | "Một số dòng giá đã được bỏ qua do trùng hoặc do Điểm đi trùng Điểm đến" | Chỉ tạo các dòng hợp lệ, bỏ qua dòng trùng/không hợp lệ |
| Xóa dòng giá đang tham chiếu Chi phí dịch vụ | Cảnh báo | "Dòng giá đang được sử dụng trong Chi phí dịch vụ, bạn có chắc muốn xóa?" | Yêu cầu xác nhận trước khi xóa |
| Mở "Cập nhật bảng giá"/"Chỉnh sửa thông tin chung" đang bị user khác khóa | Cảnh báo | "Bảng giá đang được \[user\] chỉnh sửa, vui lòng thử lại sau" | Chặn mở màn chỉnh sửa |
| Chỉnh sửa thông tin chung thành công | Thành công | "Chỉnh sửa thông tin chung thành công" | Ghi lịch sử, trở về màn hình chi tiết |
| Nhấn Xóa bảng giá mua (trạng thái Tạo mới) | Cảnh báo | "Bạn có chắc muốn xóa bảng giá mua này?" | Yêu cầu xác nhận trước khi xóa |
| Xóa bảng giá mua thành công (Tạo mới) | Thành công | "Xóa bảng giá mua thành công" | Khóa & ẩn bản ghi khỏi danh sách (xóa mềm), ghi lịch sử |
| Chỉnh sửa thông tin chung bảng giá mua không ở trạng thái "Tạo mới" | Lỗi | "Chỉ được chỉnh sửa bảng giá mua ở trạng thái Tạo mới" | Ẩn nút / chặn chỉnh sửa |
| Xóa bảng giá mua không ở trạng thái "Tạo mới" | Lỗi | "Chỉ được xóa bảng giá mua ở trạng thái Tạo mới" | Chặn thao tác xóa |
| Người dùng không có quyền với chức năng tương ứng | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn nút/action và chặn thao tác Thêm/Xem/Sửa/Xóa/Kích hoạt |
| Lưu bảng giá mua khi Ngày hiệu lực \< Ngày hiệu lực của hợp đồng liên kết | Lỗi | "Ngày hiệu lực phải lớn hơn hoặc bằng ngày hiệu lực của hợp đồng liên kết" | Không lưu, giữ nguyên form |
| Lưu bảng giá mua khi Ngày hết hiệu lực \> Ngày hết hiệu lực của hợp đồng liên kết | Lỗi | "Ngày hết hiệu lực phải nhỏ hơn hoặc bằng ngày hết hiệu lực của hợp đồng liên kết" | Không lưu, giữ nguyên form |
| Bảng giá mua còn 10 / 5 / 1 ngày đến Ngày hết hiệu lực | Cảnh báo | "Bảng giá sắp hết hiệu lực (còn 10/5/1 ngày), vui lòng kiểm tra và gia hạn" | Hiển thị cảnh báo; không tự đổi trạng thái bảng giá |
| Thêm bảng giá dịch vụ (Tạo hàng loạt) trùng với dòng giá đã tạo | Lỗi | “Có \[Số lượng dòng giá trùng\] dòng giá đã trùng với dòng giá sẵn có.” | Không tạo các dòng giá đã trùng với dòng giá có sẵn |
| Áp bộ lọc mà đầu mục giá không có dòng khớp | Thông tin | "Không có dòng giá phù hợp với bộ lọc" | Giữ đầu mục giá, hiển thị bảng trống |
| Thêm dòng giá đơn lẻ trùng với dòng đang bị ẩn bởi bộ lọc | Lỗi | "Dòng giá đã tồn tại trong đầu mục giá này (trùng thuộc tính và đơn vị tính)" | Chặn thêm (dùng lại thông báo hiện có, BR28); dòng trùng vẫn bị ẩn |
| Tạo hàng loạt phát sinh dòng trùng với dòng đang bị ẩn bởi bộ lọc | Lỗi | "Có \[Số lượng dòng giá trùng\] dòng giá đã trùng với dòng giá sẵn có." | Bỏ qua các dòng trùng (dùng lại thông báo hiện có) |
| Người dùng không có quyền vào màn Thêm mới/Cập nhật bảng giá | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn/chặn theo BR27 (dùng lại thông báo hiện có) |

### 3.1.5. Mô tả luồng dữ liệu

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Cấu hình đầu mục giá | Cung cấp đầu mục giá (cha) để gắn dòng giá Cung cấp đầu mục giá (cha) chứa các dòng giá cần lọc | Đầu mục giá → bảng giá mua (dòng giá) Đầu mục giá → Màn Thêm mới/Cập nhật | Khi hiển thị/tạo dòng giá Khi hiển thị tab phân hệ | Đầu mục bị tắt kích hoạt → ẩn & khóa ở màn Thêm mới/Cập nhật/Chi tiết Bộ lọc không thay đổi danh sách đầu mục; đầu mục không có dòng khớp vẫn hiển thị (BR45) |
| Quản lý nhà thầu | Nguồn nhà thầu phụ trách; kiểm tra trạng thái khi kích hoạt Cung cấp trạng thái nhà thầu và trạng thái hợp đồng để lọc danh sách "Nhà thầu phụ trách" khi mở màn Thêm mới/Chỉnh sửa thông tin chung. | Nhà thầu → bảng giá mua | Khi chọn nhà thầu / kích hoạt bảng giá mua | Nhà thầu không "Đang hoạt động" → chặn kích hoạt bảng giá mua (Tạo mới/Ngừng hoạt động) |
| Quản lý hợp đồng | Liên kết hợp đồng khung Cung cấp trạng thái nhà thầu và trạng thái hợp đồng để lọc danh sách "Nhà thầu phụ trách" khi mở màn Thêm mới/Chỉnh sửa thông tin chung. | Hợp đồng → bảng giá mua | Khi chọn Nhà thầu phụ trách | Hợp đồng hết hạn: bảng giá mua không tự đổi trạng thái (cảnh báo hết hạn chưa triển khai trong phase này) |
| Bảng giá mua định mức | Tham chiếu dòng giá để thiết lập định mức mua | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) → định mức mua | Khi tạo/sửa định mức mua | Tham chiếu tự động dòng "Đã phê duyệt"; sửa đơn giá → cập nhật im lặng Bộ lọc chỉ là thao tác hiển thị; dữ liệu hạ nguồn chỉ thay đổi khi "Lưu thông tin" (BR23, BR25) |
| Bảng giá bán định mức | Tham chiếu dòng giá để thiết lập định mức bán | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) → định mức bán | Khi tạo/sửa định mức bán | Tham chiếu tự động dòng "Đã phê duyệt"; sửa đơn giá → cập nhật im lặng Bộ lọc chỉ là thao tác hiển thị; dữ liệu hạ nguồn chỉ thay đổi khi "Lưu thông tin" (BR23, BR25) |
| Chi phí dịch vụ | Tham chiếu dòng giá để ghi nhận chi phí dịch vụ | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) → chi phí dịch vụ | Khi phát sinh/ghi nhận chi phí | Xóa dòng đang tham chiếu → cảnh báo; tham chiếu động theo giá hiện hành Bộ lọc chỉ là thao tác hiển thị; dữ liệu hạ nguồn chỉ thay đổi khi "Lưu thông tin" (BR23, BR25) |
| Quản lý danh mục | Cung cấp giá trị cho các trường lọc (Điểm, Loại xe, Loại kho, Nhóm hàng, Đơn vị tính...) | Danh mục → Panel bộ lọc | Khi mở panel "Bộ lọc" | Giá trị đã ngừng sử dụng nhưng còn trong dòng giá hiện có → vẫn hiển thị trong danh sách lọc (BR51) |

### 3.1.6. Tích hợp & Đồng bộ dữ liệu

# 4\. Đánh giá độ phủ rule (Case còn thiếu)

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| :---- | :---- | :---- | :---- |
| Liên kết hợp đồng | Ngoài phạm vi phase này | Chưa định nghĩa nội dung/kênh cảnh báo khi hợp đồng hết hạn | Chuẩn hóa cảnh báo (banner \+ thông báo) và tần suất nhắc |
| Nhà thầu phụ trách | Đã chốt một phần (BR5) | Đã kiểm tra nhà thầu khi kích hoạt (Tạo mới/Ngừng hoạt động); chưa xử lý khi nhà thầu chấm dứt lúc bảng giá mua đang "Đang hoạt động" | Đồng bộ trạng thái nhà thầu → cảnh báo/treo bảng giá mua đang hoạt động liên quan |
| Xóa/chỉnh sửa dòng giá đang tham chiếu | Đã chốt một phần (BR25) | Mới cảnh báo khi xóa dòng tham chiếu Chi phí dịch vụ; chưa xử lý ràng buộc phía định mức | Cân nhắc cảnh báo/chặn/cập nhật giá mới khi xóa/sửa dòng đang tham chiếu tại bảng định mức giá mua/bán, bảng chi phí dịch vụ |
| Import/Export CSV dòng giá | Ngoài phạm vi (chỉ mô tả nút) | Quy tắc validate khi import (trùng ID, sai đầu mục, ghi đè/thêm mới) | Đặc tả ở phiên bản sau |
| Phân quyền | Đã chốt (BR27 \+ AC phân quyền từng US) | Chưa định nghĩa ma trận quyền chi tiết theo từng role cụ thể; chưa tách rõ quyền "Sửa" gồm Chỉnh sửa thông tin chung và Cập nhật bảng giá (dòng giá) | Xây ma trận Role × Chức năng (Xem / Thêm / Chỉnh sửa thông tin chung / Cập nhật bảng giá / Xóa / Kích hoạt); bổ sung quyền chỉ-xem cho các role liên quan |

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM** 

**MODULE GIÁ MUA ĐẦU VÀO \- SPRINT 4 PHASE MVP**

*(Software Requirements Specification \- SRS)*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu "Giá mua đầu vào"  |
| :---- | :---- |
| **Tài liệu gốc** | SRS\_LogXPro\_Giá mua đầu vào  |
| **Sprint / Phase** | Sprint 4 – phase MVP |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | Trang BA  |
| **Ngày tạo** | 13/10/2026 |

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

**Mô tả luồng chính:** 

Nhân bản bảng giá mua: tại màn Chi tiết nhấn "Nhân bản" → mở màn Thêm mới điền sẵn Nhà thầu phụ trách, Tiền tệ, Ghi chú bổ sung và toàn bộ dòng giá hợp lệ; nhập Tên bảng giá mua, Ngày hiệu lực, Ngày hết hiệu lực → "Lưu thông tin" tạo bảng giá mua "Tạo mới"; bảng giá nguồn không thay đổi.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Nhân bản bảng giá mua | BP quản lý nhà thầu | Nhấn "Nhân bản" tại màn Chi tiết → mở màn Thêm mới điền sẵn dữ liệu sao chép | Bảng giá mua nguồn (mọi trạng thái) | Màn tạo mới bảng giá mua đã điền dữ liệu; | Có quyền Thêm; áp dụng rule Thêm mới; không đổi bảng giá nguồn (BR53) |

# **3\. Đặc tả Tính năng**

## **3.1. MODULE: Giá mua đầu vào – Nhân bản bảng giá mua**

### **3.1.1 Danh sách user story**

#### *User story 14: Nhân bản bảng giá mua*

| ID US | US\_BGM\_14 |
| :---- | :---- |
| **Tên Story** | Nhân bản bảng giá mua từ màn Chi tiết |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn nhân bản 1 bảng giá mua có sẵn, để tạo nhanh bảng giá mới mà không phải nhập lại dòng giá. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn Chi tiết bảng giá mua có nút "Nhân bản", hiển thị ở cả 4 trạng thái (Tạo mới / Đang hoạt động / Ngừng hoạt động / Hết hiệu lực). | Thiếu nút ở 1 trạng thái. |
| AC2 | Nút chỉ hiển thị khi user có quyền Thêm mới bảng giá mua (BR27). | User không có quyền Thêm vẫn thấy/dùng được nút. |
| AC3 | Nhấn "Nhân bản" → mở màn Thêm mới bảng giá mua với dữ liệu điền sẵn từ bảng giá nguồn; chưa tạo bản ghi. | Tạo bản ghi ngay khi nhấn. |
| AC4 | Thông tin chung sao chép: Nhà thầu phụ trách (hợp đồng "Đang hiệu lực" tự gắn theo US\_BGM\_03 AC4), Tiền tệ, Ghi chú bổ sung. Tên bảng giá mua, Ngày hiệu lực, Ngày hết hiệu lực để trống, bắt buộc nhập. | Sao chép Tên / Ngày; thiếu trường sao chép. |
| AC5 | Nhà thầu nguồn không còn thỏa BR52 → để trống Nhà thầu phụ trách (không gắn hợp đồng), user chọn lại. | Điền sẵn nhà thầu không hợp lệ. |
| AC6 | Sao chép toàn bộ dòng giá theo tab/đầu mục: giữ thuộc tính, Đơn vị tính, Đơn giá; trạng thái dòng mặc định "Đã phê duyệt"; ID dòng giá sinh mới theo mã bảng giá mới (BR26). | Giữ ID dòng giá cũ; sai Đơn giá/thuộc tính. |
| AC7 | Không sao chép, không thông báo các dòng giá thuộc đầu mục giá đã tắt kích hoạt hoặc có giá trị thuộc tính đã ngừng sử dụng trong danh mục. | Sao chép các dòng này. |
| AC8 | Dữ liệu sao chép chỉ nằm trong danh sách tạm; user thao tác như màn Thêm mới (US\_BGM\_08–11, US\_BGM\_13). "Lưu thông tin" áp dụng đủ rule Thêm mới (bắt buộc, trùng tên, ràng buộc ngày theo hợp đồng, BR52) → tạo bảng giá "Tạo mới", ID mới RSYYMM-NNN. "Hủy bỏ" không tạo bản ghi. | Lưu bỏ qua rule Thêm mới. |
| AC9 | Bảng giá nguồn không bị thay đổi. | Bảng giá nguồn bị đổi dữ liệu/trạng thái. |
| AC10 | Lưu thành công: ghi lịch sử hoạt động cho bảng giá mới với hành động "Khởi tạo". | Không ghi log. |

#### *Điều chỉnh các mục liên quan trong SRS\_LogXPro\_Giá mua đầu vào*

Các điểm dưới đây đã được cập nhật tương ứng trong SRS\_LogXPro\_Giá mua đầu vào để thống nhất với chức năng Nhân bản.

| Vị trí | Nội dung hiện tại (tóm tắt) | Điều chỉnh |
| :---- | :---- | :---- |
| Mục 1.2 – In-scope | "Nhân bản bảng giá mua (Đang cập nhật)" | "Nhân bản bảng giá mua (tại màn Chi tiết)." |
| Mục 2 – Mô tả luồng & bảng bước | Chưa có luồng Nhân bản | Bổ sung gạch đầu dòng và bước "Nhân bản bảng giá mua" (xem mục 2 tài liệu này). |
| US\_BGM\_02 – AC10 | Nút "Chỉnh sửa thông tin chung" / "Cập nhật bảng giá" hiển thị theo trạng thái bảng giá mua. | Bổ sung: Nút "Nhân bản" hiển thị ở mọi trạng thái của bảng giá mua (chi tiết US\_BGM\_14). |
| 3.1.3 – Quy tắc nghiệp vụ | — | Bổ sung BR53. |

### **3.1.2. Quy tắc nghiệp vụ (Business Rule)**

| ID | Quy tắc |
| :---- | :---- |
| BR53 | Áp dụng cho bảng giá mua ở mọi trạng thái (Tạo mới / Đang hoạt động / Ngừng hoạt động / Hết hiệu lực); nút "Nhân bản" tại màn Chi tiết; quyền theo quyền Thêm mới bảng giá mua (BR27). |
| BR54 | Nhấn nút “Nhân bản” màn chi tiết, hệ thống mở màn Thêm mới điền sẵn: Nhà thầu phụ trách (nếu còn thỏa BR52; hợp đồng "Đang hiệu lực" tự gắn), Tiền tệ, Ghi chú bổ sung và toàn bộ dòng giá (thuộc tính, Đơn vị tính, Đơn giá; trạng thái "Đã phê duyệt"; ID dòng giá sinh mới). Tên bảng giá mua, Ngày hiệu lực, Ngày hết hiệu lực để trống. |
| BR55 | Trong màn Thêm mới từ chức năng Nhân bản, nếu Nhà thầu phụ trách không thỏa BR52, để trống trường Nhà thầu phụ trách và hợp đồng |
| BR56 | Nhân bản bảng giá mua không sao chép, không thông báo dòng giá thuộc đầu mục giá đã tắt kích hoạt hoặc có giá trị thuộc tính đã ngừng sử dụng. |

# 

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification \- SRS)*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu "Giá mua đầu vào" (Thỏa thuận bảng giá mua dịch vụ) |
| :---- | :---- |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | Trang BA  |
| **Ngày tạo** | 06/08/2026 |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Menu "Giá mua đầu vào" quản lý danh sách các bảng giá mua dịch vụ đã thỏa thuận với nhà thầu, tổ chức theo 5 phân hệ dịch vụ: Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát và Sang tải. Mỗi bảng giá mua gắn với 1 nhà thầu phụ trách, liên kết 1 hợp đồng khung "Đang hiệu lực", và chứa các dòng giá chi tiết thuộc các đầu mục giá đã thiết lập ở menu "Cấu hình đầu mục giá".

Đây là nơi lưu trữ, tra cứu và điều hành hiệu lực của các thỏa thuận giá mua; dữ liệu dòng giá là nguồn tham chiếu cho các menu hạ nguồn (Giá mua/bán định mức, Quản lý báo giá).

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Xem danh sách bảng giá mua theo 5 phân hệ; lọc theo trạng thái/nhà thầu; tìm theo ID; sắp xếp; chọn nhiều bản ghi để xuất dữ liệu.

* Xem chi tiết 1 bảng giá mua: thông tin chung, 5 tab dòng giá chi tiết, lịch sử hoạt động.

* Thêm mới bảng giá mua: nhập thông tin chung và cấu hình dòng giá 5 phân hệ (thêm dòng đơn lẻ, thêm hàng loạt, xóa dòng, sửa đơn giá).

* Chỉnh sửa thông tin chung (chỉ thông tin chung, chỉ bảng giá mua "Tạo mới").

* Xóa bảng giá mua (chỉ "Tạo mới") theo cơ chế xóa mềm: khóa và ẩn bản ghi khỏi danh sách.

* Cập nhật bảng giá: thêm/xóa dòng giá và sửa đơn giá trên bảng giá mua đã tồn tại (Thông tin chung chỉ đọc).

* Kích hoạt bảng giá mua và quản lý vòng đời trạng thái (Tạo mới / Đang hoạt động / Ngừng hoạt động / Hết hiệu lực).

* Phân quyền theo chức năng: mỗi chức năng Xem/Thêm/Sửa/Xóa/Kích hoạt chỉ hiển thị và thao tác được khi người dùng có quyền tương ứng.

* *Quy tắc validate Import/Export CSV cấp dòng giá — chỉ mô tả nút, chi tiết ở phiên bản sau. (Đang cập nhật*

* *Nhân bản bảng giá mua (Đang cập nhật)*

* *Phê duyệt giá*

**Ngoài phạm vi (Out-of-scope):**

* Luồng gửi Phê duyệt bảng giá mua (phê duyệt cấp bảng giá) — không triển khai trong giai đoạn này. 

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

[**LogX \-QL giá mua .drawio**](https://drive.google.com/file/d/1Au166CK7y3eQp1O5QDwLt8Y2eDFbscmQ/view?usp=sharing)

 

**Mô tả luồng chính:** 

* Người dùng (Bộ phận quản lý nhà thầu) mở menu Giá mua đầu vào → xem danh sách bảng giá mua (lọc/tìm/sắp xếp). Chỉ các chức năng người dùng được phân quyền mới hiển thị.

* Thêm mới bảng giá mua: nhập thông tin chung \+ cấu hình dòng giá 5 phân hệ (thêm đơn lẻ / thêm hàng loạt / xóa / sửa đơn giá); nhấn "Lưu thông tin" lưu đồng thời (atomic) → bảng giá mua ở trạng thái "Tạo mới", ID tự sinh RSYYMM-NNN; hệ thống ghi log "Khởi tạo bảng giá".

* Cập nhật bảng giá: mở bảng giá mua đã tồn tại (Thông tin chung chỉ đọc), thêm/xóa dòng giá và sửa đơn giá → "Lưu thông tin". 

* Lọc dòng giá tại màn Thêm mới/Cập nhật bảng giá:

  * Mở màn Thêm mới/Cập nhật bảng giá → chọn tab phân hệ cần thao tác.

  * Nhấn "Bộ lọc" → chọn giá trị theo thuộc tính (cột đặc thù \+ Đơn vị tính) → "Áp dụng".

  * Hệ thống lọc danh sách tạm của tab (gồm dòng đã lưu \+ dòng chưa lưu) → hiển thị kết quả theo từng đầu mục giá.

  * Người dùng sửa Đơn giá / xóa / thêm dòng trên kết quả → thay đổi cập nhật vào danh sách tạm, bộ lọc giữ nguyên.

  * Nhấn "Xóa bộ lọc" khi cần xem lại toàn bộ dòng giá của tab.

  * Nhấn "Lưu thông tin" → lưu atomic toàn bộ danh sách tạm, kể cả dòng đang bị ẩn bởi bộ lọc.

* Kích hoạt bảng giá mua (Tạo mới/Ngừng hoạt động) → "Đang hoạt động": kiểm tra Nhà thầu phụ trách phải đang hoạt động; nếu có bảng giá mua khác cùng nhà thầu đang "Đang hoạt động" thì yêu cầu xác nhận để chuyển bảng giá mua đó sang "Ngừng hoạt động". Riêng bảng giá "Tạo mới": sau khi kiểm tra nhà thầu, kiểm tra thêm Thời điểm kích hoạt ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực hợp đồng; kích hoạt thành công thì cập nhật Ngày hiệu lực \= Ngày kích hoạt.

* Xóa bảng giá mua ("Tạo mới"): khóa & ẩn bản ghi khỏi danh sách (xóa mềm, không xóa vật lý).

* Xem chi tiết: thông tin chung \+ dòng giá theo 5 phân hệ \+ lịch sử; hệ thống ghi log mọi thao tác.

* Đến ngày hết hiệu lực → tự động chuyển "Hết hiệu lực".

* Chỉ dòng giá "Đã phê duyệt" của bảng giá mua "Đang hoạt động" là nguồn tham chiếu động cho Bảng giá mua định mức, Bảng giá bán định mức và Chi phí dịch vụ.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Xem danh sách | BP quản lý nhà thầu | Mở menu, xem danh sách bảng giá mua, lọc/tìm/sắp xếp | Danh mục bảng giá mua | Danh sách bảng giá mua | Có quyền Xem bảng giá mua |
| Thêm mới bảng giá mua | BP quản lý nhà thầu | Nhập thông tin chung \+ cấu hình dòng giá 5 phân hệ (đơn lẻ/hàng loạt/xóa/sửa đơn giá) | Thông tin bảng giá mua \+ dòng giá | Bảng giá mua "Tạo mới" (atomic); ID tự sinh RSYYMM-NNN; log "Khởi tạo bảng giá" | Có quyền Thêm; bắt buộc Tên, Nhà thầu, Ngày hiệu lực, Ngày hết hiệu lực; chặn trùng tên |
| Cập nhật bảng giá | BP quản lý nhà thầu | Thêm/xóa dòng giá, sửa đơn giá (Thông tin chung chỉ đọc) | Danh sách dòng giá hiện tại | Dòng giá cập nhật \+ log | Áp dụng Tạo mới/Đang hoạt động/Ngừng hoạt động (không Hết hiệu lực); khóa đồng thời |
| Kích hoạt bảng giá mua | BP quản lý nhà thầu | Kích hoạt bảng giá mua "Tạo mới"/"Ngừng hoạt động" → "Đang hoạt động" | Bảng giá mua Tạo mới/Ngừng hoạt động | Đang hoạt động (+ bảng giá mua trùng nhà thầu → Ngừng hoạt động) | Có quyền Kích hoạt; Nhà thầu "Đang hoạt động"; (Tạo mới) Thời điểm kích hoạt ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực hợp đồng → cập nhật Ngày hiệu lực \= Ngày kích hoạt; xác nhận nếu có bảng giá mua trùng nhà thầu đang "Đang hoạt động" |
| Xem chi tiết | BP quản lý nhà thầu | Xem thông tin chung \+ dòng giá 5 phân hệ \+ lịch sử | Bảng giá mua đã chọn | Chi tiết bảng giá mua \+ log | Có quyền Xem |
| Chỉnh sửa thông tin chung | BP quản lý nhà thầu | Sửa các trường trong section Thông tin chung | Thông tin chung hiện tại | Thông tin chung cập nhật \+ log | Có quyền Sửa; chỉ bảng giá mua "Tạo mới"; không sửa dòng giá; khóa đồng thời |
| Xóa bảng giá mua | BP quản lý nhà thầu | Khóa & ẩn bản ghi khỏi danh sách (xóa mềm) | Bảng giá mua "Tạo mới" | Bản ghi bị khóa & ẩn \+ log | Có quyền Xóa; chỉ "Tạo mới"; không xóa vật lý |
| Tự động đổi trạng thái | Hệ thống | Đến ngày hiệu lực → Đang hoạt động Quá Ngày hết hiệu lực → Hết hiệu lực | Ngày hệ thống | Trạng thái cập nhật | Tự động kích hoạt: Áp dụng cho Bảng giá mua trạng thái Tạo mới Tự động hết hiệu lựcz: Áp dụng cho Tạo mới/Đang hoạt động/Ngừng hoạt động |
| Đồng bộ tham chiếu | Hệ thống | Cung cấp dòng giá "Đã phê duyệt" cho định mức mua/bán & chi phí dịch vụ | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) | Dữ liệu tham chiếu | Chỉ dòng "Đã phê duyệt" của bảng giá mua "Đang hoạt động"; tham chiếu động |
| Mở màn thiết lập giá | BP quản lý nhà thầu | Mở màn Thêm mới/Cập nhật bảng giá, chọn tab phân hệ | Tab phân hệ | Danh sách đầu mục giá \+ dòng giá của tab | Có quyền Thêm/Cập nhật (BR27) |
| Mở bộ lọc | BP quản lý nhà thầu | Nhấn "Bộ lọc" tại tab | — | Panel bộ lọc theo phân hệ của tab | Trường lọc theo BR42 |
| Chọn điều kiện lọc | BP quản lý nhà thầu | Chọn 1 hoặc nhiều giá trị cho từng thuộc tính | Giá trị lọc | Điều kiện lọc của tab | HOẶC trong 1 trường, VÀ giữa các trường (BR43) |
| Áp dụng bộ lọc | Hệ thống | Lọc danh sách tạm của tab, áp cho mọi đầu mục | Điều kiện lọc; danh sách tạm | Danh sách rút gọn; số dòng hiển thị | Dòng "Tất cả" luôn khớp (BR44); bảng trống nếu không có dòng khớp (BR45) |
| Thao tác trên kết quả | BP quản lý nhà thầu | Sửa Đơn giá / xóa / thêm dòng giá | Thao tác người dùng | Danh sách tạm cập nhật | Giữ nguyên bộ lọc; dòng mới không khớp bị ẩn (BR47, BR48) |
| Xóa bộ lọc | BP quản lý nhà thầu | Nhấn "Xóa bộ lọc" | — | Hiển thị đủ dòng giá của tab | Chỉ xóa bộ lọc của tab đang xem |
| Lưu thông tin | BP quản lý nhà thầu / Hệ thống | Lưu toàn bộ thay đổi | Danh sách tạm | Bảng giá mua được lưu \+ log | Lưu cả dòng đang bị ẩn (BR23, BR46) |

# **3\. Đặc tả Tính năng**

## **3.1. MODULE: Giá mua đầu vào**

### **3.1.1 Danh sách user story**

#### *User story 1: Xem danh sách bảng giá mua*

| ID US | US\_BGM\_01 |
| :---- | :---- |
| **Tên Story** | Xem danh sách bảng giá mua |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem danh sách bảng giá mua theo bộ lọc và sắp xếp, để nắm nhanh tình trạng các thỏa thuận giá và truy cập vào từng bảng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Hiển thị bảng danh mục với các cột:  ID bảng giá,  Tên bảng giá,  Nhà thầu phụ trách,  Ngày hiệu lực,  Ngày hết hiệu lực,  Trạng thái,  Thao tác. | Thiếu cột hoặc sai dữ liệu. |
| AC2 | \- Cho lọc theo Trạng thái và Nhà thầu;  \- Tìm kiếm theo ID;  \- Sắp xếp theo Ngày hiệu lực và Ngày hết hiệu lực;  Kết quả trả ra đúng. | Lọc/tìm/sắp xếp ra kết quả sai. |
| AC3 | \- Mỗi dòng chỉ hiển thị action Sửa / Xóa khi người dùng có quyền Sửa / Xóa bảng giá mua. \- Khi nhấn action, hệ thống điều hướng đúng bảng giá mua tương ứng. | Nhấn action điều hướng sai/không điều hướng. |
| AC4 | Cho chọn nhiều bản ghi (checkbox) và Xuất dữ liệu các bản ghi đã chọn. | Xuất sai/thiếu bản ghi đã chọn. |
| AC5 | Chức năng Xem danh sách/chi tiết bảng giá mua chỉ hiển thị khi người dùng có quyền Xem; User không có quyền → không nhìn thấy menu trên menu side và truy cập vào menu không thấy dữ liệu. | Người dùng không có quyền Xem vẫn truy cập/xem được dữ liệu. |
| AC6 | Mặc định danh sách bảng giá mua được sắp xếp theo Thời gian tạo giảm dần (bản ghi mới nhất ở trên cùng).  | Danh sách không sắp xếp mặc định theo Thời gian tạo giảm dần; hoặc bản ghi vừa tạo không hiển thị ở trên cùng. |

#### *User story 2: Xem chi tiết bảng giá mua* 

| ID US | US\_BGM\_02 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết thông tin chung, dòng giá theo 5 phân hệ |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem chi tiết 1 bảng giá mua gồm thông tin chung, dòng giá theo 5 phân hệ và lịch sử, để kiểm tra thỏa thuận giá hiện tại và truy vết thay đổi. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| Thông tin chung |  |  |
| AC1 | Section Thông tin chung hiển thị:  ID bảng giá Nhà thầu phụ trách,  Ngày hiệu lực,  Ngày hết hiệu lực,  Trạng thái,  Tiền tệ,  Hợp đồng khung. | Thiếu/sai trường thông tin chung. |
| Danh sách dòng giá mua |  |  |
| AC2 | Luôn hiển thị đủ 5 tab phân hệ (Mỗi tab phân hệ là 1 loại dịch vụ); Trong mỗi tab không có dòng giá nào vẫn hiển thị tab với bảng giá trống. Các đầu mục giá trong từng tab hiển thị đầy đủ theo Loại dịch vụ (đã được cấu hình trong Cấu hình đầu mục giá) gồm ID, Tên đầu mục giá, Loại giá | Ẩn tab của phân hệ trống hoặc thiếu tab. |
| AC3 | Danh sách dòng giá được nhóm theo đầu mục giá (thiết lập trong Cấu hình đầu mục giá) và danh sách giá mua hiển thị đúng các cột theo từng dịch vụ (xem 3.1.2);  | Sai cấu trúc cột theo phân hệ; thiếu trạng thái dòng giá. |
| AC4 | Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị đuôi NNNN của dòng giá.  | Hiển thị đầy đủ ID hoặc không hiển thị ID |
| AC5 | Danh sách dòng giá cho phép:  Tìm kiếm theo ID dòng giá: Tìm kiếm theo ID đầy đủ \[Mã bảng giá mua\]-NNNN hoặc NNNN đều tìm được dòng giá theo ID đầy đủ Sắp xếp theo Đơn giá, Lọc theo các cột thuộc tính.  | Tìm/sắp xếp/lọc sai kết quả. |
| AC6 | Khi lọc theo một thuộc tính, kết quả bao gồm các dòng có giá trị đúng bộ lọc VÀ các dòng có giá trị "Tất cả" ở thuộc tính đó (dòng "Tất cả" luôn khớp mọi bộ lọc của thuộc tính tương ứng — xem BR32). | Lọc bỏ sót dòng "Tất cả"; dòng "Tất cả" không xuất hiện trong kết quả lọc theo thuộc tính. |
| AC7 | Phạm vi lọc: Áp dụng tất cả đầu mục trong tab dịch vụ đã thao tác. Không áp dụng tại các tab dịch vụ còn lại. |  |
| Lịch sử hoạt động |  |  |
| AC8 | Lịch sử hoạt động hiển thị: Thời gian, Người thực hiện, Hành động, Nội dung;  | Log thiếu người thao tác/nội dung; không lọc được theo Hành động. |
| AC9 | Lịch sử hoạt động: Cho phép lọc theo Hành động và làm mới bảng lịch sử hoạt động (cập nhật thông tin mới nhất). Với Lịch sử hoạt động là Chỉnh sửa bảng giá mua và Phê duyệt bảng giá mua, hiển thị nút *Xem chi tiết* ở cuối bản ghi*.* | Log Chỉnh sửa bảng giá mua và Phê duyệt bảng giá mua, không hiển thị nút *Xem chi tiết.* |
| Nút tương tác |  |  |
| AC10 | Nút "Chỉnh sửa thông tin chung" chỉ hiển thị với bảng giá mua ở "Tạo mới";  Nút "Cập nhật bảng giá" hiển thị khi bảng giá mua ở "Tạo mới"/"Đang hoạt động"/"Ngừng hoạt động" (ẩn khi "Hết hiệu lực"). | Hiển thị/ẩn sai nút theo trạng thái; điều hướng sai bảng giá mua. |
| AC11 | Với người dùng không có quyền Chỉnh sửa bảng giá mua, hệ thống ẩn nút “Chỉnh sửa thông tin chung” và nút “Cập nhật bảng giá” đồng thời chặn người dùng chỉnh sửa.  | Người dùng không có quyền Sửa vẫn hiển thị nút Chỉnh sửa thông tin chung / Cập nhật bảng giá hoặc chỉnh sửa thành công. |
| AC12 | Với người dùng không có quyền Xóa bảng giá mua, hệ thống ẩn nút “Xóa bảng giá mua” đồng thời chặn người dùng xóa bảng giá mua. | Người dùng không có quyền Xóa vẫn hiển thị nút Xóa bảng giá mua hoặc xóa thành công. |

#### *User story 3: Thêm mới bảng giá mua*

| ID US | US\_BGM\_03 |
| :---- | :---- |
| **Tên Story** | Tạo mới bảng giá mua: thông tin chung \+ cấu hình dòng giá 5 phân hệ |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn thêm mới bảng giá mua gồm thông tin chung và cấu hình dòng giá cho 5 phân hệ, để khởi tạo đầy đủ một thỏa thuận giá cho nhà thầu. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Nhấn "Thêm bảng giá mua" mở màn tạo mới gồm section Thông tin chung và section "Thiết lập giá đầu vào dịch vụ" (5 tab). | Không mở được màn/thiếu section. |
| AC2 | Thông tin chung gồm các trường: Tên bảng giá mua, Nhà thầu phụ trách, Ngày hiệu lực, Ngày hết hiệu lực, Ghi chú bổ sung, Tiền tệ, Hợp đồng khung,  |  |
| AC2 | Ràng buộc:  Ngày hiệu lực ≤ Ngày hết hiệu lực.  Ngày hiệu lực ≥ Ngày hiệu lực hợp đồng (kiểm tra khi Lưu) Ngày hết hiệu lực ≤ Ngày hết hiệu lực hợp đồng (kiểm tra khi Lưu). | Thiếu trường bắt buộc vẫn cho lưu; hoặc Ngày hiệu lực \> Ngày hết hiệu lực. |
| AC3 | Chặn trùng Tên bảng giá mua (kiểm tra khi lưu). | Cho trùng tên. |
| AC4 | Sau khi chọn Nhà thầu phụ trách, hệ thống tự động gắn hợp đồng "Đang hiệu lực" của nhà thầu (chỉ xem); tại 1 thời điểm, mỗi nhà thầu chỉ có 1 hợp đồng "Đang hiệu lực". Khi bỏ chọn Nhà thầu phụ trách, hợp đồng tự động bỏ gắn kèm. | Hợp đồng không tự động gắn kèm khi chọn nhà thầu phụ trách. |
| AC5 | ID bảng giá mua do hệ thống tự sinh theo cấu trúc RSYYMM-NNN Trong đó: RS \= ratesheet,  YYMM \= năm/tháng tạo,  NNN \= số thứ tự trong tháng tạo, bắt đầu từ 001;  ví dụ ID bảng giá: RS260804-001; Người dùng không được nhập/sửa ID. | ID không tự sinh hoặc sai cấu trúc RSYYMM-NNN. |
| AC6 | Mỗi tab phân hệ hiển thị các đầu mục giá “đang kích hoạt” và có loại giá \= {Cố định, Phụ phí} của phân hệ. Mỗi đầu mục có: ID, Tên đầu mục giá, Loại giá và "Thêm bảng giá dịch vụ" (hàng loạt), "Thêm dòng giá mới" (đơn lẻ), (chi tiết ở US\_BGM\_08 và US\_BGM\_09).  Mỗi dòng giá có Xóa và sửa Đơn giá inline (chi tiết ở US\_BGM\_11 và US\_BGM\_10). Mỗi tab phân hệ có nút "Bộ lọc" để lọc dòng giá (chi tiết US\_BGM\_13). | Sai/không hiển thị đúng đầu mục hoặc thiếu action. |
| AC7 | Nút "Lưu thông tin" lưu đồng thời Thông tin chung \+ toàn bộ dòng giá đã cấu hình theo cơ chế atomic; bảng giá mua tạo ở trạng thái "Tạo mới". Nút "Hủy bỏ" không lưu.  | Lưu không đồng bộ (mất thông tin chung hoặc mất dòng giá). |
| AC8 | Sau khi tạo thành công bảng giá, hệ thống đồng thời ghi lịch sử hoạt động với hành động "Khởi tạo bảng giá". | Tạo thành công nhưng không ghi log "Khởi tạo bảng giá". |
| AC9 | Cho phép lưu ngay cả khi một/nhiều đầu mục chưa có dòng giá nào (hiển thị đầu mục/bảng giá trống). | Bắt buộc phải có dòng giá mới cho lưu. |
| AC10 | Đầu mục giá bị tắt kích hoạt (bật/tắt kích hoạt trong Cấu hình đầu mục giá) bị ẩn & khóa, không thể thiết lập các dòng giá trong đầu mục giá. Chỉ thiết lập giá cho đầu mục giá có Loại giá \= Cố định / Phụ phí. Đầu mục giá có Loại giá \= “Phát sinh” không được thiết lập dòng giá trong đầu mục (ẩn hiển thị và chặn thiết lập) | Vẫn cấu hình được dòng giá cho đầu mục đã tắt.Vẫn thiết lập được đầu mục giá “Phát sinh” |
| AC11 | Chặn người dùng thêm bảng giá mua khi người dùng không có quyền Tạo mới bảng giá mua. | Người dùng không có quyền Thêm vẫn thêm mới thành công bảng giá mua |
| AC12 | *Chức năng Export và Import chưa được mô tả trong phiên bản tài liệu này.* | \- |
| AC13 | Danh sách chọn "Nhà thầu phụ trách" chỉ gồm nhà thầu "Đang hoạt động" và có hợp đồng "Đang hiệu lực" (BR52). | Hiển thị nhà thầu không hoạt động hoặc không có hợp đồng "Đang hiệu lực" trong danh sách chọn. |

#### *User story 4: Chỉnh sửa thông tin chung bảng giá mua*

| ID US | US\_BGM\_04 |
| :---- | :---- |
| **Tên Story** | Chỉnh sửa các trường thông tin chung của bảng giá mua |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn cập nhật thông tin chung của bảng giá mua, để chỉnh sửa thỏa thuận (nhà thầu, hợp đồng, thời hạn) mà không tác động tới dòng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Chức năng chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới"; các trạng thái khác ẩn nút "Chỉnh sửa thông tin chung" và chặn chỉnh sửa. | Cho chỉnh sửa bảng giá mua không ở trạng thái "Tạo mới". |
| AC2 | Nút "Chỉnh sửa thông tin chung" mở form chỉ chứa các trường của section Thông tin chung. | Form chứa/cho sửa dòng giá. |
| AC3 | Áp dụng cùng rule bắt buộc như khi thêm (Tên bảng giá mua, Nhà thầu phụ trách, Ngày hiệu lực, Ngày hết hiệu lực, Tiền tệ, Hợp đồng);  Ràng buộc: Ngày hiệu lực ≤ Ngày hết hiệu lực;  Ngày hiệu lực ≥ Ngày hiệu lực hợp đồng  Ngày hết hiệu lực ≤ Ngày hết hiệu lực hợp đồng. | Thiếu trường bắt buộc vẫn cho lưu; hoặc Ngày hiệu lực \> Ngày hết hiệu lực. |
| AC4 | Sau khi chọn Nhà thầu phụ trách, hệ thống tự động gắn hợp đồng "Đang hiệu lực" của nhà thầu (chỉ xem); tại 1 thời điểm, mỗi nhà thầu chỉ có 1 hợp đồng "Đang hiệu lực". Khi bỏ chọn Nhà thầu phụ trách, hợp đồng tự động bỏ gắn kèm. | Hợp đồng không tự động gắn kèm khi chọn nhà thầu phụ trách hoặc người dùng có thể tự ý thay đổi hợp đồng gắn kèm. |
| AC5 | "Lưu thông tin" ghi lại các thông tin thay đổi \+ lưu lịch sử thao tác; "Hủy bỏ" không lưu bất kỳ thay đổi nào. | Hủy bỏ nhưng thay đổi vẫn được lưu. |
| AC6 | Chặn người dùng chỉnh sửa khi người dùng không có quyền Chỉnh sửa bảng giá mua. | Người dùng không có quyền Chỉnh sửa vẫn sửa thành công bảng giá mua. |
| AC7 | Trường hợp user chọn lại nhà thầu phụ trách, hệ thống cập nhật hợp đồng "Đang hiệu lực" tương ứng của nhà thầu | Không cập nhật hợp đồng  |
| AC8 | Danh sách chọn "Nhà thầu phụ trách" chỉ gồm nhà thầu "Đang hoạt động" và có hợp đồng "Đang hiệu lực" (BR52). | Cho chọn nhà thầu không hoạt động hoặc không có hợp đồng "Đang hiệu lực" khi chỉnh sửa. |

#### *User story 5: Xóa bảng giá mua*

| ID US | US\_BGM\_05 |
| :---- | :---- |
| **Tên Story** | Xóa bảng giá mua |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xóa 1 bảng giá mua, để loại bỏ bản ghi tạo nhầm hoặc không còn dùng. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Nhấn Xóa, hệ thống hiển thị popup “Yêu cầu xác nhận” trước khi thực hiện xóa. | Xóa ngay không có bước xác nhận. |
| AC2 | Chỉ cho phép xóa bảng giá mua ở trạng thái "Tạo mới"; các trạng thái khác (Đang hoạt động/Ngừng hoạt động/Hết hiệu lực) bị chặn xóa và thông báo. | Cho xóa bảng giá mua không ở trạng thái "Tạo mới". |
| AC3 | Xóa thành công: bản ghi bị khóa và ẩn khỏi danh sách bảng giá mua; hệ thống KHÔNG xóa hoàn toàn dữ liệu trong cơ sở dữ liệu (xóa mềm). | Xóa vật lý dữ liệu trong DB hoặc bản ghi vẫn hiển thị trong danh sách sau khi xóa. |
| AC4 | Thao tác xóa được ghi vào lịch sử hoạt động. | Không ghi log thao tác xóa. |
| AC5 | Action Xóa chỉ hiển thị khi người dùng có quyền Xóa bảng giá mua. | Người dùng không có quyền Xóa vẫn thấy/dùng được action. |

#### *User story 6: Kích hoạt bảng giá mua & vòng đời trạng thái*

| ID US | US\_BGM\_06 |
| :---- | :---- |
| **Tên Story** | Kích hoạt bảng giá mua và điều hành máy trạng thái |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn kích hoạt bảng giá mua và hệ thống quản lý đúng vòng đời trạng thái, để đảm bảo tại mỗi thời điểm mỗi nhà thầu chỉ có 1 bảng giá đang hoạt động. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Trạng thái bảng giá mua gồm: Tạo mới, Đang hoạt động, Ngừng hoạt động, Hết hiệu lực. | Thiếu/sai danh sách trạng thái. |
| AC2 | Chức năng "Kích hoạt" chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới" hoặc "Ngừng hoạt động". | Cho kích hoạt bảng giá mua ở trạng thái khác. |
| AC3 | Khi kích hoạt bảng giá mua (ở "Tạo mới" hoặc "Ngừng hoạt động"): hệ thống kiểm tra trạng thái Nhà thầu phụ trách trước; nếu nhà thầu ≠ "Đang hoạt động" thì chặn kích hoạt và thông báo "Nhà thầu phụ trách đang không hoạt động, vui lòng kiểm tra lại Nhà thầu phụ trách". | Cho kích hoạt khi nhà thầu không hoạt động. |
| AC4 | Riêng khi kích hoạt bảng giá mua ở trạng thái "Tạo mới": sau khi kiểm tra Nhà thầu phụ trách hợp lệ (AC3), hệ thống kiểm tra tiếp: Thời điểm kích hoạt (ngày kích hoạt) ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực của hợp đồng khung liên kết.  Nếu đạt → cho phép kích hoạt; nếu không đạt → chặn kích hoạt và thông báo. | Kiểm tra ngày hiệu lực hợp đồng trước cả bước kiểm tra nhà thầu; hoặc cho kích hoạt khi Thời điểm kích hoạt \< Ngày hiệu lực hợp đồng. |
| AC5 | Khi kích hoạt (nhà thầu hợp lệ): hệ thống kiểm tra bảng giá mua khác cùng nhà thầu đang "Đang hoạt động". Nếu có → hiển thị Popup xác nhận nếu tiếp tục kích hoạt, bảng giá mua còn lại sẽ chuyển "Ngừng hoạt động". Nếu không có bảng giá mua nào khác cùng nhà thầu đang hoạt động → chuyển trạng thái và thông báo thành công. | Không cảnh báo/không yêu cầu xác nhận. |
| AC6 | Nếu người dùng xác nhận tiếp tục kích hoạt: bảng giá mua được kích hoạt → chuyển trạng thái "Đang hoạt động"; bảng giá mua khác có cùng nhà thầu & đang hoạt động → chuyển trạng thái "Ngừng hoạt động".  Nếu người dùng không xác nhận: Hủy bỏ kích hoạt và giữ nguyên trạng thái của các bảng giá r mua. | Sau kích hoạt vẫn tồn tại \>1 bảng giá mua cùng nhà thầu "Đang hoạt động". |
| AC7 | Tạo mới / Đang hoạt động / Ngừng hoạt động → Hết hiệu lực: Hệ thống tự động chuyển khi qua Ngày hết hiệu lực. | Không tự chuyển "Hết hiệu lực" khi qua hạn. |
| AC8 | Nút "Kích hoạt" chỉ hiển thị khi người dùng có quyền Kích hoạt bảng giá mua. | Người dùng không có quyền Kích hoạt vẫn thấy/dùng được nút. |
| AC9 | Kích hoạt thành công bảng giá mua ở trạng thái "Tạo mới": hệ thống tự cập nhật Ngày hiệu lực của bảng giá mua \= Ngày kích hoạt. Chỉ áp dụng khi kích hoạt từ "Tạo mới"; kích hoạt lại từ "Ngừng hoạt động" giữ nguyên Ngày hiệu lực đã có. | Sau khi kích hoạt bảng "Tạo mới", Ngày hiệu lực không được cập nhật \= Ngày kích hoạt; hoặc reset Ngày hiệu lực khi kích hoạt lại bảng "Ngừng hoạt động". |

#### *User story 7: Cập nhật bảng giá*

| ID US | US\_BGM\_07 |
| :---- | :---- |
| **Tên Story** | Thêm/xóa dòng giá và sửa đơn giá trên bảng giá mua đã tồn tại |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn cập nhật bảng giá (thêm/xóa dòng giá, sửa đơn giá) trên một bảng giá mua đã tồn tại, để điều chỉnh chi tiết giá mà không thay đổi thông tin chung. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Màn Chi tiết bảng giá mua có nút "Cập nhật bảng giá"; nút hiển thị khi bảng giá mua ở "Tạo mới", "Đang hoạt động" hoặc "Ngừng hoạt động", ẩn khi "Hết hiệu lực" (BR21). | Hiển thị nút với bảng giá mua "Hết hiệu lực"; thiếu nút ở các trạng thái còn lại. |
| AC2 | Nút "Cập nhật bảng giá" chỉ hiển thị khi người dùng có quyền Cập nhật bảng giá mua (BR27). | Người dùng không có quyền Cập nhật vẫn thấy/dùng được nút. |
| AC3 | Màn "Cập nhật bảng giá": section Thông tin chung ở chế độ chỉ đọc (disable, nhãn "Thông tin chung (Chỉ đọc)"); không cho sửa Thông tin chung tại màn này. | Cho sửa Thông tin chung tại màn Cập nhật bảng giá. |
| AC4 | Đầu mục giá bị tắt kích hoạt (bật/tắt kích hoạt trong Cấu hình đầu mục giá) bị ẩn & khóa, không thể thiết lập các dòng giá trong đầu mục giá. Đầu mục giá có Loại giá \= “Phát sinh” không được thiết lập dòng giá trong đầu mục (ẩn hiển thị và chặn thiết lập)  ID, Tên đầu mục giá, Loại giá | Vẫn hiển thị các đầu mục giá bị tắt kích hoạt Vẫn hiển thị các đầu mục giá “Phát sinh” |
| AC5 | Phần dòng giá cho thao tác trên cả 5 phân hệ: thêm dòng giá đơn lẻ (US\_BGM\_08), thêm bảng giá dịch vụ/tạo hàng loạt (US\_BGM\_09), sửa đơn giá inline (US\_BGM\_10), xóa dòng giá (US\_BGM\_11), lọc dòng giá (US\_BGM\_13). | Thiếu một trong các thao tác thêm đơn lẻ/hàng loạt/sửa đơn giá/xóa. |
| AC6 | Áp dụng khóa đồng thời (pessimistic lock): khi 1 user đang cập nhật bảng giá, user khác không được sửa đồng thời (BR22). | Hai user cùng sửa và cùng lưu gây ghi đè. |
| AC7 | Thao tác Cập nhật bảng giá KHÔNG làm thay đổi trạng thái bảng giá mua; bảng giá giữ nguyên trạng thái hiện tại (Tạo mới / Đang hoạt động / Ngừng hoạt động). | Cập nhật bảng giá làm đổi trạng thái bảng giá mua. |
| AC8 | Nút "Lưu thông tin" persist toàn bộ thay đổi dòng giá theo cơ chế atomic (BR23), ghi lịch sử hoạt động với hành động "Cập nhật" (lưu before/after theo BR10) và thông báo "Lưu bảng giá thành công"; "Hủy bỏ" không lưu bất kỳ thay đổi nào. | Lưu một phần; Hủy bỏ vẫn lưu; không ghi lịch sử thao tác cập nhật. |

#### *User story 8: Thêm 1 dòng giá trong đầu mục giá*

| ID US | US\_BGM\_08 |
| :---- | :---- |
| **Tên Story** | Thêm 1 dòng giá trong đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn thêm một dòng giá đơn lẻ vào một đầu mục giá, để bổ sung chính xác từng dòng giá theo thuộc tính của phân hệ. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Trong 1 đầu mục giá, nhấn "Thêm dòng giá mới" mở dialog nhập 1 dòng giá. | Không mở được dialog. |
| AC2 | Dialog gồm các thuộc tính đặc thù theo phân hệ (xem 3.1.2) và các trường chung: Đơn vị tính, Đơn giá. | Thiếu trường thuộc tính đặc thù hoặc trường chung. |
| AC3 | Tất cả trường trong dialog bắt buộc; thiếu bất kỳ trường nào → chặn thêm và báo lỗi. Các trường thuộc tính (theo loại dich vụ)  Cho phép chọn nhiều giá trị,  Nếu chọn giá trị “Tất cả” hệ thống disable các lựa chọn còn lại Nếu chọn ít nhất 1 giá trị cụ thể ≠ “Tất cả”, hệ thống disable lựa chọn “Tất cả” | Cho thêm khi thiếu trường bắt buộc. |
| AC4 | Đối với riêng dịch vụ kho, khi thêm mới giá trong đầu mục giá, trường Loại kho chỉ hiển thị danh sách Loại kho đã cấu hình (danh sách Loại kho được cấu hình theo đầu mục giá trong Cấu hình đầu mục giá). | Thêm mới dòng giá được chọn Loại kho ngoài danh sách Loại kho đã cấu hình cho đầu mục giá. |
| AC5 | Không hiển thị trường Trạng thái dòng giá trên dialog; khi tạo mới dòng giá, hệ thống mặc định trạng thái "Đã phê duyệt". | Hiển thị/cho chọn trạng thái dòng giá trên dialog; hoặc dòng mới không mặc định "Đã phê duyệt". |
| AC6 | Trước khi thêm vào danh sách, hệ thống kiểm tra trùng: nếu bộ thuộc tính \+ Đơn vị tính của dòng mới trùng với một dòng giá đã có trong CÙNG đầu mục giá → chặn thêm và báo lỗi trùng. | Cho thêm dòng trùng bộ thuộc tính \+ Đơn vị tính trong cùng đầu mục giá. |
| AC7 | Khi kiểm tra trùng, giá trị "Tất cả" của một thuộc tính được coi là bao trùm mọi giá trị cụ thể của thuộc tính đó (BR32): nếu các thuộc tính còn lại \+ Đơn vị tính trùng một dòng đã có và thuộc tính khác biệt mang giá trị "Tất cả" → ghi nhận trùng, chặn thêm và báo lỗi tạo dòng giá không thành công. | Cho thêm dòng chọn "Tất cả" trùng lặp với dòng có giá trị cụ thể đã tồn tại. |
| AC8 | Riêng phân hệ Vận tải: nhập riêng "Điểm đi" và "Điểm đến"; khi tạo thành công hiển thị gộp thành 1 cột "Điểm đi \- Điểm đến" dạng "\[Điểm đi\] \- \[Điểm đến\]". Nếu chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến" → hệ thống disable trường còn lại; khi tạo thành công cột "Điểm đi \- Điểm đến" ghi nhận giá trị "Tất cả" (BR33). | Không gộp cột "Điểm đi \- Điểm đến"; chọn "Tất cả" một trường vẫn cho nhập trường còn lại; cột gộp ghi sai giá trị. |
| AC9 | ID dòng giá do hệ thống tự sinh theo cấu trúc: \[Mã bảng giá mua\]-NNNN trong đó NNNN là số thứ tự sinh ra (tăng dần); người dùng không nhập. Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị NNNN. | Cho người dùng nhập/sửa ID dòng giá. ID giá sai cấu trúc. ID dòng giá hiển thị full trên giao diện \[Mã bảng giá mua\]-NNNN  |
| AC10 | Dòng giá vừa thêm được hiển thị ở trên cùng trong danh sách đầu mục giá và chỉ cập nhật vào danh sách tạm; chỉ được persist khi bấm "Lưu thông tin". Khi bộ lọc đang bật, dòng vừa thêm chỉ hiển thị nếu khớp bộ lọc (BR47). | Dòng giá được lưu ngay khi chưa bấm "Lưu thông tin". |

#### *User story 9: Thêm nhiều dòng giá trong đầu mục giá*

| ID US | US\_BGM\_09 |
| :---- | :---- |
| **Tên Story** | Thêm nhiều dòng giá trong đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn tạo nhanh hàng loạt dòng giá theo tổ hợp thuộc tính trong một đầu mục giá, để thiết lập nhiều dòng giá cùng lúc thay vì nhập từng dòng. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Trong 1 đầu mục giá, nhấn "Thêm bảng giá dịch vụ" mở dialog "Tạo nhanh hàng loạt". | Không mở được dialog. |
| AC2 | Trường "Đầu mục giá" mặc định \= đầu mục chứa nút “Thêm bảng giá dịch vụ”, bắt buộc và disable; chỉ tạo các dòng giá trong 1 đầu mục giá từ 1 loại dịch vụ (lấy theo tab đang được tạo dòng giá). | Cho đổi đầu mục giá / tạo xuyên đầu mục hoặc phân hệ / null Đầu mục giá. |
| AC3 | Các thuộc tính phân hệ cho chọn nhiều giá trị, trừ khi chọn “Tất cả” \- disable các checkbox còn lại. | Không cho chọn nhiều giá trị. Chọn tất cả vẫn chọn được các checkbox giá trị khác |
| AC4 | Đơn vị tính chỉ chọn một giá trị  Đơn giá đại diện nhập tay giá tiền. Khi tạo thành công giá, các trường này được áp dụng chung cho các dòng giá được thêm vào danh sách thiết lập.  Không cho chọn trường Trạng thái; mọi dòng sinh ra mặc định trạng thái "Đã phê duyệt". | Cho chọn nhiều với Đơn vị tính/Đơn giá đại diện; hoặc hiển thị/cho chọn Trạng thái; hoặc dòng sinh ra không mặc định "Đã phê duyệt". Áp sai đơn giá/đơn vị tính/trạng thái. |
| AC5 | Tất cả trường bắt buộc; enum có giá trị "Tất cả" được coi là đã điền hợp lệ. | Cho sinh khi thiếu trường; không chấp nhận "Tất cả". |
| AC6 | Hệ thống sinh dòng giá theo tổ hợp đầy đủ (Cartesian) mọi giá trị đã chọn của các thuộc tính; Hệ thống hiển thị số lượng dòng được tạo ra khi nhập đầy đủ các trường thông tin (Bỏ qua không đếm các trường hợp vi phạm ràng buộc như trùng điểm đi, điểm đến của dịch vụ vận tải). | Sinh thiếu/thừa tổ hợp; không có xem trước. |
| AC7 | Riêng phân hệ Vận tải:  Dòng sinh ra gộp "Điểm đi" và "Điểm đến" thành 1 cột "Điểm đi \- Điểm đến" dạng "\[Điểm đi\] \- \[Điểm đến\]". Nếu chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến" → hệ thống disable trường còn lại; dòng sinh ra ghi nhận cột "Điểm đi \- Điểm đến" \= "Tất cả" (BR33). | Sinh dòng giá có Điểm đi trùng Điểm đến; không gộp cột "Điểm đi \- Điểm đến". Chọn "Tất cả" một trường vẫn cho chọn giá trị ở trường còn lại; cột gộp ghi sai giá trị. |
| AC8 | Khi nhấn tạo, hệ thống kiểm tra các dòng giá không hợp lệ và bỏ qua (không tạo dòng giá hoặc ghi đè dòng giá sẵn có):  Trùng điểm đi, điểm đến (với dịch vụ vận tải);  Trùng với bản ghi đã tạo (trùng bộ thuộc tính đặc thù \+ Đơn vị tính với dòng đã có trong CÙNG đầu mục giá)  \=\> Hiện thông báo số dòng giá bị trùng Giá trị "Tất cả" được coi là bao trùm mọi giá trị cụ thể của thuộc tính khi so trùng (BR32). | Tạo dòng trùng bộ thuộc tính \+ Đơn vị tính trong cùng đầu mục giá; hoặc không lược bỏ dòng "Tất cả" bao trùm giá trị cụ thể đã có. |
| AC9 | Dòng giá sinh ra chỉ cập nhật vào danh sách tạm và hiển thị lên trên cùng trong đầu mục giá; chỉ persist khi bấm "Lưu thông tin". Khi bộ lọc đang bật, dòng vừa thêm chỉ hiển thị nếu khớp bộ lọc (BR47). | Dòng giá được lưu ngay khi chưa bấm "Lưu thông tin". |
| AC10 | ID dòng giá do hệ thống tự sinh theo cấu trúc: \[Mã bảng giá mua\]-NNNN trong đó NNNN là số thứ tự sinh ra (tăng dần); người dùng không nhập. Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị NNNN. | Cho người dùng nhập/sửa ID dòng giá. ID giá sai cấu trúc. ID dòng giá hiển thị full trên giao diện \[Mã bảng giá mua\]-NNNN  |

#### *User story 10: Chỉnh sửa đơn giá*

| ID US | US\_BGM\_10 |
| :---- | :---- |
| **Tên Story** | Chỉnh sửa đơn giá của dòng giá (inline) |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn sửa đơn giá của dòng giá ngay trên danh sách, để điều chỉnh giá mà không phải xóa và tạo lại dòng. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Cho sửa Đơn giá của dòng giá ngay trên danh sách (inline). | Không cho sửa đơn giá inline. |
| AC2 | KHÔNG hỗ trợ chỉnh sửa các thuộc tính khác của dòng giá (thuộc tính đặc thù, Đơn vị tính, Trạng thái); muốn đổi thuộc tính khác phải xóa và tạo lại dòng giá. | Cho sửa thuộc tính ngoài Đơn giá.  |
| AC3 | Sửa đơn giá dòng đang được tham chiếu hạ nguồn (định mức mua/bán, Chi phí dịch vụ), lưu chỉnh sửa → cho phép:  trạng thái dòng giá chuyển thành “Chờ phê duyệt”. Dòng "Chờ phê duyệt" **KHÔNG** còn là nguồn hợp lệ cho giá mua/bán định mức (theo BR4/BR5 — SRS Giá mua định mức) — tổ hợp tương ứng tạm thời **biến mất khỏi màn định mức** cho tới khi dòng giá được phê duyệt.  *(Luồng phê duyệt bảng giá mua chưa triển khai, tạm thời luồng trạng thái dừng ở đây)* | Chặn sửa hoặc không cập nhật hạ nguồn theo giá mới; hoặc không hiển thị icon cảnh báo/tooltip tại Bảng giá mua định mức khi sửa đơn giá dòng "Đã phê duyệt". |
| AC4 | Thay đổi đơn giá chỉ cập nhật vào danh sách tạm; chỉ persist khi bấm "Lưu thông tin". | Thay đổi đơn giá được lưu ngay khi chưa bấm "Lưu thông tin". |

#### *User story 11: Xóa dòng giá*

| ID US | US\_BGM\_11 |
| :---- | :---- |
| **Tên Story** | Xóa một dòng giá khỏi đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xóa một dòng giá khỏi đầu mục giá, để loại bỏ dòng giá sai/không dùng hoặc phục vụ tạo lại khi cần đổi thuộc tính. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Mỗi dòng giá trong danh sách có action Xóa. | Thiếu action Xóa. |
| AC2 | Xóa thành công, tại Bảng giá mua định mức, xóa dòng giá nhà thầu tham chiếu và dòng giá định mức hiển thị icon cảnh báo kèm tooltip "Đã có điều chỉnh đơn giá nhà thầu" | Xóa dòng đang tham chiếu mà không hiển thị icon cảnh báo. |
| AC3 | Thao tác xóa dòng giá chỉ cập nhật vào danh sách tạm; chỉ persist khi bấm "Lưu thông tin". | Xóa được lưu ngay khi chưa bấm "Lưu thông tin". |

#### *Use story 12: Xem chi tiết lịch sử cập nhật (before/after)*

| ID US | US\_BGM\_12 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết thay đổi trước/sau của một bản ghi lịch sử |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem chi tiết giá trị trước/sau của một thao tác Cập nhật, để truy vết chính xác nội dung đã thay đổi. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Mỗi bản ghi lịch sử có Hành động là “Cập nhật Bảng giá mua” và “Phê duyệt bảng giá mua” có action "Xem chi tiết" mở popup so sánh giá trị Trước (before) và Sau (after). | Không mở được popup hoặc thiếu dữ liệu before/after. |
| AC2 | Popup hiển thị: Thông tin chung: Thời gian, Người thực hiện Thông tin bản ghi trước thay đổi (before) và sau thay đổi (after): Thông tin chung, 5 tab phân hệ theo loại dịch vụ và danh sách dòng giá theo đầu mục trong từng tab. | Hiển thị sai giá trị hoặc thiếu trường thông tin.  Không hiển thị đầy đủ cả 2 bản ghi trước và sau thay đổi. |

#### *User story 13: Lọc dòng giá theo thuộc tính tại màn Thêm mới/Cập nhật bảng giá*

| ID US | US\_BGM\_13 |
| :---- | :---- |
| **Tên Story** | Lọc dòng giá theo cột đặc thù và Đơn vị tính tại màn Thêm mới bảng giá mua và Cập nhật bảng giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn lọc dòng giá theo các thuộc tính đặc thù của phân hệ và Đơn vị tính ngay khi đang thiết lập giá, để khoanh vùng nhanh nhóm dòng giá cần rà soát, sửa Đơn giá hoặc xóa trước khi lưu. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Mỗi tab phân hệ có nút "Bộ lọc" trong section "Thiết lập giá đầu vào dịch vụ". Áp dụng cho cả màn Thêm mới bảng giá mua (US\_BGM\_03) và Cập nhật bảng giá (US\_BGM\_07). | Thiếu nút "Bộ lọc" ở 1 trong 5 tab. Có bộ lọc ở 1 màn nhưng thiếu ở màn còn lại. |
| AC2 | Trường lọc theo phân hệ (cột đặc thù \+ Đơn vị tính): Vận tải: Điểm đi, Điểm đến, Loại xe, Đơn vị tính Kho bãi: Tên kho, Loại kho, Đơn vị tính Khai báo Hải quan: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe, Đơn vị tính Hải quan Giám sát: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe, Đơn vị tính Sang tải: Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa, Đơn vị tính | Thiếu/thừa trường lọc so với phân hệ. Hiển thị trường lọc của phân hệ khác. |
| AC3 | Phân hệ Vận tải: lọc riêng "Điểm đi" và "Điểm đến" (thống nhất US\_GDM\_03 AC1), dù danh sách hiển thị gộp cột "Điểm đi \- Điểm đến" (BR33). | Gộp "Điểm đi" và "Điểm đến" thành 1 trường lọc. Lọc sai khi dòng có cột gộp \= "Tất cả". |
| AC4 | Mỗi trường lọc cho chọn nhiều giá trị (multi-select). Danh sách giá trị lấy theo danh mục của thuộc tính; không có lựa chọn "Tất cả" trong bộ lọc (BR51). | Chỉ cho chọn 1 giá trị. Hiển thị lựa chọn "Tất cả" trong danh sách giá trị lọc. |
| AC5 | Điều kiện kết hợp: Nhiều giá trị trong 1 trường → HOẶC. Nhiều trường → VÀ. Trường không chọn giá trị → không lọc theo trường đó. | Kết hợp HOẶC giữa các trường. Trường bỏ trống làm kết quả rỗng. |
| AC6 | Khi lọc theo 1 thuộc tính, kết quả gồm dòng có giá trị đúng bộ lọc VÀ dòng có giá trị "Tất cả" ở thuộc tính đó (BR32a, BR44). Ví dụ: lọc Loại xe \= "Xe 40ft" → hiển thị dòng Loại xe \= "Xe 40ft" và dòng Loại xe \= "Tất cả". | Lọc bỏ sót dòng "Tất cả". Dòng "Tất cả" không xuất hiện trong kết quả lọc. |
| AC7 | Phạm vi lọc: 1 bộ lọc chung cho tab phân hệ đang thao tác, áp dụng cho mọi đầu mục giá trong tab. Không áp dụng cho các tab còn lại; mỗi tab có trạng thái bộ lọc riêng. Đầu mục giá không có dòng khớp vẫn hiển thị, bảng dòng giá trống kèm thông báo "Không có dòng giá phù hợp với bộ lọc". | Bộ lọc của tab này áp sang tab khác. Ẩn đầu mục giá không có dòng khớp. |
| AC8 | Lọc thực hiện trên danh sách tạm, gồm dòng đã lưu và dòng vừa thêm/sửa chưa lưu. Bộ lọc chỉ ảnh hưởng hiển thị; không thêm, sửa hay xóa dữ liệu dòng giá. | Lọc bỏ sót dòng chưa lưu. Dòng bị ẩn do bộ lọc bị mất/bị xóa khỏi danh sách tạm. |
| AC9 | Khi bộ lọc đang bật, dòng giá mới (thêm đơn lẻ US\_BGM\_08 hoặc tạo hàng loạt US\_BGM\_09) áp bộ lọc như bình thường: Khớp bộ lọc → hiển thị trên cùng đầu mục giá. Không khớp → không hiển thị nhưng vẫn nằm trong danh sách tạm. Bộ lọc không bị tự động xóa. | Dòng không khớp vẫn hiển thị. Dòng không khớp không được đưa vào danh sách tạm. Bộ lọc tự xóa khi thêm dòng. |
| AC10 | Kiểm tra trùng khi thêm dòng (BR28, BR32b) thực hiện trên toàn bộ dòng trong đầu mục giá, kể cả dòng đang bị ẩn bởi bộ lọc. | Cho thêm dòng trùng với dòng đang bị ẩn bởi bộ lọc. |
| AC11 | Sửa Đơn giá inline (US\_BGM\_10) và Xóa dòng giá (US\_BGM\_11) hoạt động bình thường trên kết quả lọc. Sau thao tác, bộ lọc giữ nguyên. Sửa Đơn giá không đổi thuộc tính nên dòng không rời khỏi kết quả lọc. | Sửa/xóa xong bộ lọc bị reset. Thao tác tác động đến dòng không thuộc dòng được chọn. |
| AC12 | "Lưu thông tin" lưu toàn bộ danh sách tạm (atomic, BR23), kể cả dòng đang bị ẩn bởi bộ lọc. "Hủy bỏ" không lưu thay đổi. | Chỉ lưu các dòng đang hiển thị. Dòng bị ẩn do bộ lọc bị mất sau khi lưu. |
| AC13 | Nhấn "Xóa bộ lọc" → xóa toàn bộ điều kiện của tab đang xem. | Không có cách xóa bộ lọc. |
| AC14 | Vòng đời bộ lọc: Chuyển qua lại giữa các tab: mỗi tab giữ bộ lọc riêng trong phiên đang mở màn. Rời màn (Lưu/Hủy bỏ): xóa toàn bộ bộ lọc, không lưu giữa các phiên. | Bộ lọc còn tồn tại khi mở lại màn. Chuyển tab làm mất bộ lọc của tab trước đó. |
| AC15 | Chức năng Lọc không kiểm soát phân quyền riêng: mọi người dùng vào được màn Thêm mới/Cập nhật bảng giá (theo BR27) đều dùng được. | Chặn hoặc ẩn bộ lọc vì lý do phân quyền. |

### **3.1.2 Mô tả giao diện (Reviewing)**

* Ảnh giao diện: \[Chèn ảnh màn hình Danh sách / Chi tiết / Thêm mới / Chỉnh sửa thông tin chung / Cập nhật bảng giá / dialog dòng giá\]

* Link UI Design: \[Chèn link\]

* Màn hình chính: Danh sách bảng giá mua; Chi tiết (thông tin chung \+ 5 tab dòng giá \+ lịch sử); Thêm mới bảng giá mua; Chỉnh sửa thông tin chung; Cập nhật bảng giá; các dialog cấu hình dòng giá (thêm đơn lẻ / tạo hàng loạt).

**Bảng trường dữ liệu — Form "Chỉnh sửa thông tin chung / Thêm bảng giá mua" (section Thông tin chung):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tên bảng giá mua | v | Text | — | (Trống) | Tên định danh bảng giá mua; chặn trùng tên khi tạo |
| Nhà thầu phụ trách | v | Select (nhà thầu) | — | (Trống) | Chọn từ danh sách nhà thầu "Đang hoạt động" và có hợp đồng "Đang hiệu lực" (BR52); mỗi nhà thầu chỉ 1 bảng giá mua Đang hoạt động |
| Ngày hiệu lực | v | Date | — | (Trống) | Ngày bắt đầu áp dụng |
| Ngày hết hiệu lực | v | Date | — | (Trống) | Ngày kết thúc áp dụng; phải ≥ Ngày hiệu lực |
| Tiền tệ | v | Select (enum) | — | VND | Đơn vị tiền tệ áp dụng chung cho toàn bộ dòng giá của bảng giá; chỉ chọn 1 giá trị, không cho phép nhiều đơn vị tiền tệ trong 1 bảng giá; enum cố định Chọn từ danh sách cố định: VND, CNY, USD |
| Mã hợp đồng (ID hợp đồng) | v | Pointer (chỉ đọc) | — | (Tự điền) | Tự động gắn hợp đồng "Đang hiệu lực" của nhà thầu phụ trách; chỉ xem |
| Tên hợp đồng | — | Text (chỉ đọc) | — | (Tự điền) | Tự điền theo Mã hợp đồng |
| Ghi chú bổ sung | — | Text | — | (Trống) | Ghi chú thêm cho bảng giá |

*Lưu ý: ID bảng giá mua do hệ thống tự sinh theo cấu trúc RSYYMM-NNN, không hiển thị để nhập trong form. Trường "Trạng thái áp dụng" không hiển thị trong form Chỉnh sửa thông tin chung (do máy trạng thái điều khiển — xem US\_BGM\_06). Ở màn "Cập nhật bảng giá" section Thông tin chung hiển thị chế độ chỉ đọc (disable).*

**Bảng trường dữ liệu — Dialog "Thêm/nhập dòng giá đơn lẻ" (Thêm mới dòng giá):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| Thuộc tính đặc thù phân hệ (các biến) | v | Select | (Trống) | Theo phân hệ (xem bảng cấu trúc cột 3.1.2); ví dụ Kho bãi: Tên kho, Loại kho |
| Đơn vị tính | v | Select (enum) | (Theo cấu hình) | Enum cố định từ cấu hình |
| Đơn giá | v | Number | (Trống) | Đơn giá của dòng giá |
| Trạng thái | v | Enum | Đã phê duyệt | Hệ thống mặc định "Đã phê duyệt"; không hiển thị/không cho chọn khi thêm dòng giá |

**Bảng trường dữ liệu — Dialog "Tạo nhanh hàng loạt" (Thêm bảng giá dịch vụ):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| Đầu mục giá | v | Select (chỉ đọc) | (Đầu mục chứa nút) | Mặc định \= đầu mục giá chứa nút "Thêm bảng giá dịch vụ"; disable |
| Thuộc tính phân hệ (multi-select) (các biến) | v | Multi-select (enum) | (Trống) | Chọn nhiều giá trị để sinh tổ hợp; enum có giá trị "Tất cả"; riêng "Tên kho" là dropdown cho chọn nhiều giá trị |
| Đơn vị tính | v | Select (enum) | (Theo cấu hình) | Chọn đơn, áp chung mọi dòng sinh ra |
| Đơn giá đại diện | v | Number | (Trống) | Đơn giá áp cho toàn bộ dòng giá sinh ra (đơn giá cuối, không tính toán thêm) |
| Trạng thái | v | Enum | Đã phê duyệt | Hệ thống mặc định "Đã phê duyệt"; không hiển thị/không cho chọn, áp chung mọi dòng |

*Ghi chú: Dialog "Chỉnh sửa dòng giá đơn lẻ" giữ tên trường "Đơn giá"; chỉ dialog "Tạo nhanh hàng loạt" dùng tên "Đơn giá đại diện". Cột trong danh sách dòng giá luôn hiển thị tên "Đơn giá".*

**Cấu trúc cột danh sách dòng giá theo từng phân hệ (nhóm theo đầu mục giá):**

| Phân hệ | Cột đặc thù | Cột chung |
| :---- | :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Loại xe | Đơn vị tính, Đơn giá, Trạng thái |
| (2) Kho bãi | Tên kho, Loại kho | Đơn vị tính, Đơn giá, Trạng thái |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Đơn giá, Trạng thái |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Đơn giá, Trạng thái |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa | Đơn vị tính, Đơn giá, Trạng thái |

*Ghi chú (Vận tải): trên form tạo dòng giá, "Điểm đi" và "Điểm đến" là 2 trường nhập riêng; trong danh sách dòng giá của bảng giá, hai trường được hiển thị gộp thành 1 cột "Điểm đi \- Điểm đến" dạng "\[Điểm đi\] \- \[Điểm đến\]". Khi chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến", hệ thống disable trường còn lại và cột gộp ghi nhận giá trị "Tất cả" (xem BR33). Ngoài ra, mỗi thuộc tính có thể nhận giá trị "Tất cả" theo BR32.*

Màn hình: Thêm mới bảng giá mua và Cập nhật bảng giá — section "Thiết lập giá đầu vào dịch vụ" (5 tab). Panel "Bộ lọc dòng giá" mở từ nút "Bộ lọc" trên thanh công cụ của tab.

Link UI Design: [Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=10477-102910&t=WV0Lgpv3EwatkzL4-0)

**Bảng trường dữ liệu — Panel "Bộ lọc dòng giá" (màn Thêm mới bảng giá mua và Cập nhật bảng giá):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Điểm đi |  | Multi-select (enum) | — | (Trống) | Phân hệ: Vận tải. Lọc riêng, không gộp với Điểm đến (BR33). |
| Điểm đến |  | Multi-select (enum) | — | (Trống) | Phân hệ: Vận tải. Lọc riêng, không gộp với Điểm đi. |
| Loại xe |  | Multi-select (enum) | — | (Trống) | Phân hệ: Vận tải, Khai báo Hải quan, Hải quan Giám sát. Dòng "Tất cả" luôn khớp (BR44). |
| Tên kho |  | Multi-select (enum) | — | (Trống) | Phân hệ: Kho bãi. Dòng "Tất cả" luôn khớp. |
| Loại kho |  | Multi-select (enum) | — | (Trống) | Phân hệ: Kho bãi. Lấy toàn bộ danh mục Loại kho (không giới hạn theo đầu mục vì bộ lọc dùng chung cho cả tab). |
| Chi cục hải quan |  | Multi-select (enum) | — | (Trống) | Phân hệ: Khai báo Hải quan, Hải quan Giám sát. Dòng "Tất cả" luôn khớp. |
| Loại hình XNK |  | Multi-select (enum) | — | (Trống) | Phân hệ: Khai báo Hải quan, Hải quan Giám sát. Dòng "Tất cả" luôn khớp. |
| Nhóm hàng |  | Multi-select (enum) | — | (Trống) | Phân hệ: Khai báo Hải quan, Hải quan Giám sát, Sang tải. Dòng "Tất cả" luôn khớp. |
| Địa điểm sang tải |  | Multi-select (enum) | — | (Trống) | Phân hệ: Sang tải. Dòng "Tất cả" luôn khớp. |
| Phương thức sang tải |  | Multi-select (enum) | — | (Trống) | Phân hệ: Sang tải. Dòng "Tất cả" luôn khớp. |
| Đặc tính hàng hóa |  | Multi-select (enum) | — | (Trống) | Phân hệ: Sang tải. Dòng "Tất cả" luôn khớp. |
| Đơn vị tính |  | Multi-select (enum) | — | (Trống) | Phân hệ: cả 5 phân hệ. Khớp chính xác giá trị; Đơn vị tính không có giá trị "Tất cả". |
| Xóa bộ lọc |  | Button | — | — | Xóa toàn bộ điều kiện của tab đang xem và hiển thị lại đầy đủ dòng giá. |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

| ID | Quy tắc |
| ----- | :---- |
| BR1 | Mỗi bảng giá mua gắn đúng 1 nhà thầu phụ trách và 1 hợp đồng khung; quan hệ bảng giá mua–hợp đồng là 1-1. |
| BR2 | Tại mỗi thời điểm, mỗi nhà thầu chỉ được có 1 bảng giá mua ở trạng thái "Đang hoạt động" — đảm bảo qua cơ chế kích hoạt: khi kích hoạt 1 bảng giá mua, bảng giá mua khác cùng nhà thầu đang "Đang hoạt động" tự động chuyển "Ngừng hoạt động" (sau khi người dùng xác nhận). |
| BR3 | Trạng thái bảng giá mua: Tạo mới, Đang hoạt động, Ngừng hoạt động, Hết hiệu lực. Chuyển trạng thái (xem US\_BGM\_06): Tạo mới/Ngừng hoạt động → Đang hoạt động qua chức năng "Kích hoạt"; Đang hoạt động → Ngừng hoạt động khi 1 bảng giá mua khác cùng nhà thầu được kích hoạt; mọi trạng thái → Hết hiệu lực tự động khi qua Ngày hết hiệu lực. |
| BR4 | Chức năng "Kích hoạt" chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới" hoặc "Ngừng hoạt động". |
| BR5 | Khi kích hoạt bảng giá mua (ở "Tạo mới" hoặc "Ngừng hoạt động"), hệ thống kiểm tra trạng thái Nhà thầu phụ trách; chỉ cho kích hoạt khi nhà thầu "Đang hoạt động", ngược lại chặn và cảnh báo. |
| BR6 | Menu này KHÔNG áp dụng luồng phê duyệt bảng giá mua trong giai đoạn hiện tại. |
| BR7 | Màn chi tiết luôn hiển thị đủ 5 tab phân hệ; phân hệ không có giá hiển thị bảng trống. Không bắt buộc bảng giá mua đủ cả 5 phân hệ. |
| BR8 | Dòng giá (con) bắt buộc thuộc 1 đầu mục giá (cha) lấy từ menu "Cấu hình đầu mục giá"; không thể tạo dòng giá ngoài đầu mục giá. |
| BR9 | Cấu trúc cột dòng giá phụ thuộc phân hệ (xem 3.1.2). |
| BR10 | Trạng thái dòng giá: xem BR18–BR20 (thêm/xóa/sửa đơn giá, tạo hàng loạt). |
| BR11 | Ngày hiệu lực phải nhỏ hơn hoặc bằng Ngày hết hiệu lực. |
| BR13 | Chức năng "Chỉnh sửa thông tin chung" chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới"; chỉ sửa các trường trong section Thông tin chung (không sửa dòng giá, không hiển thị trường "Trạng thái áp dụng"). Các trạng thái khác ẩn nút và chặn chỉnh sửa. |
| BR14 | Chỉ được phép xóa bảng giá mua ở trạng thái "Tạo mới". |
| BR15 | Chỉ dòng giá có trạng thái "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" mới được tham chiếu (động) tại Bảng giá mua định mức, Bảng giá bán định mức và Chi phí dịch vụ. |
| BR16 | Mọi thao tác Thêm/Cập nhật/Kích hoạt/Xóa được ghi vào Lịch sử hoạt động (Thời gian, Người thực hiện, Hành động, Nội dung). Riêng thao tác tạo mới bảng giá thành công ghi log với hành động "Khởi tạo bảng giá". |
| BR17 | Checkbox chọn nhiều ở màn danh sách phục vụ chức năng xuất dữ liệu (bulk export). |
| BR18 | Cấu hình dòng giá (thêm đơn lẻ, thêm hàng loạt, xóa, sửa đơn giá) thuộc phạm vi "Thêm mới bảng giá mua" và "Cập nhật bảng giá". KHÔNG hỗ trợ chỉnh sửa toàn bộ thuộc tính của một dòng giá; chỉ sửa Đơn giá (inline). Muốn đổi thuộc tính khác phải xóa và tạo lại dòng. |
| BR19 | Tạo hàng loạt ("Thêm bảng giá dịch vụ") sinh dòng giá theo tổ hợp đầy đủ (Cartesian) các giá trị đã chọn của các thuộc tính (theo loại dịch vụ);  Áp Đơn giá \= "Đơn giá đại diện", cùng Đơn vị tính đã chọn và mặc định trạng thái \= "Đã phê duyệt".  Các dòng giá chỉ thuộc 1 đầu mục giá (trường "Đầu mục giá" mặc định \= đầu mục chứa nút, disable);  Ràng buộc: bắt buộc điền mọi trường thông tin, các trường thuộc tính (danh sách trường tùy theo loại dịch vụ) được chọn nhiều giá trị; enum có giá trị "Tất cả" (coi là đã điền).  |
| BR20 | Trạng thái dòng giá: mặc định "Đã phê duyệt", độc lập với trạng thái bảng giá mua. Trong phase này chưa triển khai chức năng phê duyệt giá nên mọi dòng giá được tạo đều mặc định ở trạng thái "Đã phê duyệt". |
| BR21 | Chức năng "Cập nhật bảng giá" áp dụng cho bảng giá mua ở "Tạo mới"/"Đang hoạt động"/"Ngừng hoạt động" (ẩn nút khi "Hết hiệu lực");  Trong màn Cập nhật bảng giá, section Thông tin chung ở chế độ chỉ đọc (disable). |
| BR22 | Khi 1 user đang "Chỉnh sửa thông tin chung" hoặc "Cập nhật bảng giá" một bảng giá mua, hệ thống áp dụng khóa bảng (pessimistic lock); user khác không được sửa đồng thời. |
| BR23 | Các dialog cấu hình dòng giá chỉ cập nhật danh sách tạm; toàn bộ thay đổi (thông tin chung \+ dòng giá) chỉ được lưu (atomic) khi bấm "Lưu thông tin". Cho phép lưu khi đầu mục/phân hệ chưa có dòng giá. Bao gồm cả dòng đang bị ẩn bởi bộ lọc (BR46). |
| BR24 | Chặn trùng Tên bảng giá mua khi tạo mới. |
| BR25 | Sửa đơn giá & Phê duyệt dòng giá (mới) → Tại bảng giá mua định mức, hiển thị cảnh báo dòng giá tham chiếu và cập nhật giá mới Xóa dòng giá → Tại bảng giá mua định mức, / xóa dòng đơn giá mua theo nhà thầu   |
| BR26 | ID dòng giá do hệ thống tự sinh theo cấu trúc: \[Mã bảng giá mua\]-NNNN trong đó NNNN là số thứ tự sinh ra (tăng dần); người dùng không nhập.  Đầu mục giá bị tắt kích hoạt (trong Cấu hình đầu mục giá) sẽ bị ẩn ở màn Thêm mới/Cập nhật/Chi tiết Bảng giá mua & khóa, không được sử dụng ở các menu khác (bao gồm cả đầu mục và các dòng giá bên trong).  Chỉ thiết lập giá cho các Đầu mục giá có Loại giá \= {Cố định;Phụ phí}Đầu mục giá có Loại giá \= “Phát sinh” không được thiết lập dòng giá trong đầu mục (ẩn hiển thị và chặn thiết lập) Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị NNNN. |
| BR27 | Mỗi chức năng Xem/Thêm/Sửa/Xóa/Kích hoạt được kiểm soát bằng phân quyền; nút/action/menu tương ứng chỉ hiển thị và thao tác được khi người dùng có quyền, ngược lại ẩn hoàn toàn và chặn sử dụng chức năng |
| BR28 | Khi thêm dòng giá (đơn lẻ hoặc hàng loạt) trong một đầu mục giá, hệ thống kiểm tra trùng theo tổ hợp (bộ thuộc tính đặc thù phân hệ \+ Đơn vị tính) với các dòng giá đã có trong CÙNG đầu mục giá; dòng trùng bị chặn (thêm đơn lẻ) hoặc bị lược bỏ (tạo hàng loạt), không tạo bản ghi trùng. Kiểm tra trên toàn bộ dòng, không phụ thuộc bộ lọc đang bật (BR46). |
| BR29 | Riêng phân hệ Vận tải, khi sinh tổ hợp hàng loạt, "Điểm đi" luôn phải khác "Điểm đến"; mọi tổ hợp có Điểm đi trùng Điểm đến bị lược bỏ, không tạo dòng giá. |
| BR30 | ID bảng giá mua do hệ thống tự sinh theo cấu trúc RSYYMM-NNN (RS \= ratesheet, YYMM \= năm/tháng tạo, NNN= số thứ tự trong tháng tạo, bắt đầu từ 001; ví dụ RS260804-001); người dùng không nhập/sửa. |
| BR31 | Xóa bảng giá mua là xóa mềm (soft delete): bản ghi bị khóa và ẩn khỏi danh sách, KHÔNG xóa vật lý khỏi cơ sở dữ liệu; chỉ áp dụng cho bảng giá mua ở "Tạo mới" (BR14). |
| BR32 | Một thuộc tính của dòng giá có thể nhận giá trị đặc biệt "Tất cả" (áp dụng cho mọi giá trị của thuộc tính đó). Giá trị "Tất cả" tuân theo 2 quy tắc:  (a) LỌC — khi lọc danh sách dòng giá theo một thuộc tính, kết quả bao gồm các dòng có giá trị đúng bộ lọc VÀ các dòng có giá trị "Tất cả" ở thuộc tính đó (dòng "Tất cả" luôn khớp mọi bộ lọc của thuộc tính tương ứng);  Áp dụng cả cho bộ lọc tại màn Thêm mới/Cập nhật bảng giá (BR44). (b) CHỐNG TRÙNG — khi kiểm tra trùng dòng giá (BR28), "Tất cả" của một thuộc tính được coi là bao trùm mọi giá trị cụ thể của thuộc tính đó: nếu các thuộc tính còn lại \+ Đơn vị tính trùng một dòng đã có trong cùng đầu mục giá và thuộc tính khác biệt mang giá trị "Tất cả" (bao trùm giá trị cụ thể của dòng đã có) → ghi nhận trùng; đơn lẻ bị chặn, hàng loạt bị lược bỏ.  |
| BR33 | Riêng phân hệ Vận tải: "Điểm đi" và "Điểm đến" được nhập riêng trên form tạo dòng giá; khi tạo thành công, hệ thống gộp thành 1 cột "Điểm đi \- Điểm đến" trong bảng giá với định dạng "\[Điểm đi\] \- \[Điểm đến\]". Nếu chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến" → hệ thống disable trường còn lại; khi tạo thành công, cột "Điểm đi \- Điểm đến" ghi nhận giá trị "Tất cả". |
| BR34 | Ràng buộc ngày theo hợp đồng khung liên kết (kiểm tra khi Lưu): Ngày hiệu lực của bảng giá mua phải ≥ Ngày hiệu lực của hợp đồng khung liên kết.  |
| BR35 | Ràng buộc ngày theo hợp đồng khung liên kết (kiểm tra khi Lưu): Ngày hết hiệu lực của bảng giá mua phải ≤ Ngày hết hiệu lực của hợp đồng khung liên kết.  |
| BR36 | Cảnh báo sắp hết hiệu lực: trước Ngày hết hiệu lực của bảng giá mua 10 ngày / 5 ngày / 1 ngày, hệ thống hiển thị cảnh báo nhắc người dùng bảng giá sắp hết hiệu lực (để kịp kích hoạt bảng giá thay thế).  |
| BR37 | Tiền tệ là thuộc tính chung của bảng giá mua, được thiết lập tại section Thông tin chung; toàn bộ dòng giá của bảng giá dùng chung 1 loại tiền tệ. Dòng giá KHÔNG có trường Tiền tệ riêng. |
| BR38 | Khi kích hoạt bảng giá mua (thủ công) ở trạng thái "Tạo mới": hệ thống kiểm tra Thời điểm kích hoạt (ngày kích hoạt) ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực của hợp đồng khung; nếu không đạt thì chặn kích hoạt. Trình tự kiểm tra khi kích hoạt bảng "Tạo mới": (1) Nhà thầu phụ trách "Đang hoạt động" (BR5); (2) Thời điểm kích hoạt ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực hợp đồng (BR38). |
| BR39 | Kích hoạt thành công bảng giá mua ở trạng thái "Tạo mới": hệ thống tự cập nhật Ngày hiệu lực của bảng giá mua \= Ngày kích hoạt. Quy tắc chỉ áp dụng khi kích hoạt từ "Tạo mới"; kích hoạt lại từ "Ngừng hoạt động" giữ nguyên Ngày hiệu lực đã có. |
| BR40 | Danh sách bảng giá mua mặc định sắp xếp theo Thời gian tạo (created time) giảm dần — bản ghi mới nhất ở trên cùng. Khi tạo mới bảng giá mua thành công, bản ghi mới luôn xuất hiện ở đầu danh sách. Người dùng vẫn có thể đổi sắp xếp theo Ngày hiệu lực / Ngày hết hiệu lực (US\_BGM\_01 AC2); khi không áp sắp xếp thủ công, danh sách trở về mặc định theo Thời gian tạo giảm dần. |
| BR41 | Bộ lọc dòng giá tại màn Thêm mới/Cập nhật bảng giá chỉ lọc hiển thị trên danh sách tạm; không thay đổi và không xóa dữ liệu dòng giá. |
| BR42 | Trường lọc theo phân hệ \= cột đặc thù (mục 3.1.2) \+ Đơn vị tính. Vận tải lọc riêng Điểm đi và Điểm đến dù cột hiển thị gộp (BR33). |
| BR43 | Nhiều giá trị trong 1 trường → HOẶC; nhiều trường → VÀ; trường không chọn giá trị → không lọc theo trường đó. |
| BR44 | Dòng có giá trị "Tất cả" ở thuộc tính đang lọc luôn khớp (BR32a). Vận tải: dòng có cột "Điểm đi \- Điểm đến" \= "Tất cả" khớp mọi bộ lọc Điểm đi/Điểm đến. |
| BR45 | 1 bộ lọc/tab, áp dụng cho mọi đầu mục giá trong tab; không ảnh hưởng tab khác. Đầu mục giá không có dòng khớp vẫn hiển thị với bảng trống. |
| BR46 | Bộ lọc áp trên toàn bộ danh sách tạm (dòng đã lưu \+ dòng chưa lưu). Kiểm tra trùng (BR28) và "Lưu thông tin" (BR23) xử lý toàn bộ dòng, không phụ thuộc bộ lọc. |
| BR47 | Khi bộ lọc đang bật, dòng mới thêm (đơn lẻ/hàng loạt) áp bộ lọc như bình thường: khớp → hiển thị trên cùng đầu mục; không khớp → ẩn nhưng vẫn nằm trong danh sách tạm; bộ lọc không tự xóa. |
| BR48 | Sửa Đơn giá và xóa dòng trên kết quả lọc giữ nguyên bộ lọc. Sửa Đơn giá không đổi thuộc tính nên dòng không rời khỏi kết quả lọc. |
| BR49 | Bộ lọc giữ riêng theo từng tab trong phiên mở màn; xóa khi rời màn (Lưu/Hủy bỏ); không lưu vào cơ sở dữ liệu. |
| BR50 | Chức năng Lọc không kiểm soát phân quyền riêng; quyền vào màn theo BR27. |
| BR51 | Danh sách giá trị lọc lấy theo danh mục thuộc tính; không có lựa chọn "Tất cả". Giá trị đã ngừng sử dụng nhưng còn trong dòng giá hiện có vẫn hiển thị để có thể lọc. |
| BR52 | Tại màn Thêm mới bảng giá mua (US\_BGM\_03) và Chỉnh sửa thông tin chung (US\_BGM\_04), danh sách chọn "Nhà thầu phụ trách" chỉ gồm nhà thầu thỏa đồng thời: Trạng thái nhà thầu \= "Đang hoạt động". Có hợp đồng ở trạng thái "Đang hiệu lực". |

### **3.1.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Nhấn "Lưu"/"Thêm" khi thiếu trường bắt buộc | Lỗi | "Vui lòng nhập đầy đủ thông tin bắt buộc" | Không lưu/không thêm, giữ nguyên form |
| Ngày hiệu lực \> Ngày hết hiệu lực | Lỗi | "Ngày hiệu lực phải nhỏ hơn hoặc bằng ngày hết hiệu lực" | Không lưu |
| Kích hoạt bảng giá mua (Tạo mới/Ngừng hoạt động) khi Nhà thầu phụ trách không hoạt động | Lỗi | "Nhà thầu phụ trách đang không hoạt động, vui lòng kiểm tra lại Nhà thầu phụ trách" | Chặn kích hoạt |
| Kích hoạt bảng giá mua (Tạo mới) khi Thời điểm kích hoạt \< Ngày hiệu lực của hợp đồng liên kết | Lỗi | "Chưa đến ngày hiệu lực của hợp đồng, không thể kích hoạt bảng giá" | Chặn kích hoạt |
| Kích hoạt bảng giá mua khi có bảng giá mua khác cùng nhà thầu đang "Đang hoạt động" | Cảnh báo | "Kích hoạt bảng giá này đồng nghĩa với việc bảng giá \[Mã bảng giá\] \[Tên bảng giá\] đang áp dụng sẽ ngừng hoạt động, vẫn tiếp tục kích hoạt?" | Yêu cầu xác nhận; sau xác nhận: kích hoạt bảng giá mua \+ chuyển bảng giá mua kia sang "Ngừng hoạt động" |
| Kích hoạt bảng giá mua thành công (không có bảng giá mua trùng nhà thầu) | Thành công | "Kích hoạt bảng giá thành công" | Chuyển bảng giá mua sang "Đang hoạt động", ghi lịch sử |
| Thêm bảng giá mua thành công | Thành công | "Thêm bảng giá mua thành công" | Ghi lịch sử với hành động "Khởi tạo bảng giá", chuyển về màn hình chi tiết |
| Tạo mới bảng giá mua trùng Tên bảng giá mua | Lỗi | "Tên bảng giá mua đã tồn tại" | Không lưu |
| Lưu cấu hình dòng giá / Cập nhật bảng giá thành công | Thành công | "Lưu bảng giá thành công" | Persist dòng giá, ghi lịch sử |
| Tạo nhanh hàng loạt thiếu trường bắt buộc | Lỗi | "Vui lòng nhập đầy đủ thông tin bắt buộc" | Không sinh dòng giá |
| Thêm dòng giá đơn lẻ trùng thuộc tính \+ Đơn vị tính trong cùng đầu mục giá (kể cả khi trùng do giá trị "Tất cả" bao trùm giá trị cụ thể đã có) | Lỗi | "Dòng giá đã tồn tại trong đầu mục giá này (trùng thuộc tính và đơn vị tính)" | Không thêm dòng giá |
| Tạo hàng loạt phát sinh dòng trùng hoặc (Vận tải) Điểm đi trùng Điểm đến | Thông báo | "Một số dòng giá đã được bỏ qua do trùng hoặc do Điểm đi trùng Điểm đến" | Chỉ tạo các dòng hợp lệ, bỏ qua dòng trùng/không hợp lệ |
| Xóa dòng giá đang tham chiếu Chi phí dịch vụ | Cảnh báo | "Dòng giá đang được sử dụng trong Chi phí dịch vụ, bạn có chắc muốn xóa?" | Yêu cầu xác nhận trước khi xóa |
| Mở "Cập nhật bảng giá"/"Chỉnh sửa thông tin chung" đang bị user khác khóa | Cảnh báo | "Bảng giá đang được \[user\] chỉnh sửa, vui lòng thử lại sau" | Chặn mở màn chỉnh sửa |
| Chỉnh sửa thông tin chung thành công | Thành công | "Chỉnh sửa thông tin chung thành công" | Ghi lịch sử, trở về màn hình chi tiết |
| Nhấn Xóa bảng giá mua (trạng thái Tạo mới) | Cảnh báo | "Bạn có chắc muốn xóa bảng giá mua này?" | Yêu cầu xác nhận trước khi xóa |
| Xóa bảng giá mua thành công (Tạo mới) | Thành công | "Xóa bảng giá mua thành công" | Khóa & ẩn bản ghi khỏi danh sách (xóa mềm), ghi lịch sử |
| Chỉnh sửa thông tin chung bảng giá mua không ở trạng thái "Tạo mới" | Lỗi | "Chỉ được chỉnh sửa bảng giá mua ở trạng thái Tạo mới" | Ẩn nút / chặn chỉnh sửa |
| Xóa bảng giá mua không ở trạng thái "Tạo mới" | Lỗi | "Chỉ được xóa bảng giá mua ở trạng thái Tạo mới" | Chặn thao tác xóa |
| Người dùng không có quyền với chức năng tương ứng | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn nút/action và chặn thao tác Thêm/Xem/Sửa/Xóa/Kích hoạt |
| Lưu bảng giá mua khi Ngày hiệu lực \< Ngày hiệu lực của hợp đồng liên kết | Lỗi | "Ngày hiệu lực phải lớn hơn hoặc bằng ngày hiệu lực của hợp đồng liên kết" | Không lưu, giữ nguyên form |
| Lưu bảng giá mua khi Ngày hết hiệu lực \> Ngày hết hiệu lực của hợp đồng liên kết | Lỗi | "Ngày hết hiệu lực phải nhỏ hơn hoặc bằng ngày hết hiệu lực của hợp đồng liên kết" | Không lưu, giữ nguyên form |
| Bảng giá mua còn 10 / 5 / 1 ngày đến Ngày hết hiệu lực | Cảnh báo | "Bảng giá sắp hết hiệu lực (còn 10/5/1 ngày), vui lòng kiểm tra và gia hạn" | Hiển thị cảnh báo; không tự đổi trạng thái bảng giá |
| Thêm bảng giá dịch vụ (Tạo hàng loạt) trùng với dòng giá đã tạo | Lỗi | “Có \[Số lượng dòng giá trùng\] dòng giá đã trùng với dòng giá sẵn có.” | Không tạo các dòng giá đã trùng với dòng giá có sẵn |
| Áp bộ lọc mà đầu mục giá không có dòng khớp | Thông tin | "Không có dòng giá phù hợp với bộ lọc" | Giữ đầu mục giá, hiển thị bảng trống |
| Thêm dòng giá đơn lẻ trùng với dòng đang bị ẩn bởi bộ lọc | Lỗi | "Dòng giá đã tồn tại trong đầu mục giá này (trùng thuộc tính và đơn vị tính)" | Chặn thêm (dùng lại thông báo hiện có, BR28); dòng trùng vẫn bị ẩn |
| Tạo hàng loạt phát sinh dòng trùng với dòng đang bị ẩn bởi bộ lọc | Lỗi | "Có \[Số lượng dòng giá trùng\] dòng giá đã trùng với dòng giá sẵn có." | Bỏ qua các dòng trùng (dùng lại thông báo hiện có) |
| Người dùng không có quyền vào màn Thêm mới/Cập nhật bảng giá | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn/chặn theo BR27 (dùng lại thông báo hiện có) |

### **3.1.5. Mô tả luồng dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Cấu hình đầu mục giá | Cung cấp đầu mục giá (cha) để gắn dòng giá Cung cấp đầu mục giá (cha) chứa các dòng giá cần lọc | Đầu mục giá → bảng giá mua (dòng giá) Đầu mục giá → Màn Thêm mới/Cập nhật | Khi hiển thị/tạo dòng giá Khi hiển thị tab phân hệ | Đầu mục bị tắt kích hoạt → ẩn & khóa ở màn Thêm mới/Cập nhật/Chi tiết Bộ lọc không thay đổi danh sách đầu mục; đầu mục không có dòng khớp vẫn hiển thị (BR45) |
| Quản lý nhà thầu | Nguồn nhà thầu phụ trách; kiểm tra trạng thái khi kích hoạt Cung cấp trạng thái nhà thầu và trạng thái hợp đồng để lọc danh sách "Nhà thầu phụ trách" khi mở màn Thêm mới/Chỉnh sửa thông tin chung. | Nhà thầu → bảng giá mua | Khi chọn nhà thầu / kích hoạt bảng giá mua | Nhà thầu không "Đang hoạt động" → chặn kích hoạt bảng giá mua (Tạo mới/Ngừng hoạt động) |
| Quản lý hợp đồng | Liên kết hợp đồng khung Cung cấp trạng thái nhà thầu và trạng thái hợp đồng để lọc danh sách "Nhà thầu phụ trách" khi mở màn Thêm mới/Chỉnh sửa thông tin chung. | Hợp đồng → bảng giá mua | Khi chọn Nhà thầu phụ trách | Hợp đồng hết hạn: bảng giá mua không tự đổi trạng thái (cảnh báo hết hạn chưa triển khai trong phase này) |
| Bảng giá mua định mức | Tham chiếu dòng giá để thiết lập định mức mua | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) → định mức mua | Khi tạo/sửa định mức mua | Tham chiếu tự động dòng "Đã phê duyệt"; sửa đơn giá → cập nhật im lặng Bộ lọc chỉ là thao tác hiển thị; dữ liệu hạ nguồn chỉ thay đổi khi "Lưu thông tin" (BR23, BR25) |
| Bảng giá bán định mức | Tham chiếu dòng giá để thiết lập định mức bán | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) → định mức bán | Khi tạo/sửa định mức bán | Tham chiếu tự động dòng "Đã phê duyệt"; sửa đơn giá → cập nhật im lặng Bộ lọc chỉ là thao tác hiển thị; dữ liệu hạ nguồn chỉ thay đổi khi "Lưu thông tin" (BR23, BR25) |
| Chi phí dịch vụ | Tham chiếu dòng giá để ghi nhận chi phí dịch vụ | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) → chi phí dịch vụ | Khi phát sinh/ghi nhận chi phí | Xóa dòng đang tham chiếu → cảnh báo; tham chiếu động theo giá hiện hành Bộ lọc chỉ là thao tác hiển thị; dữ liệu hạ nguồn chỉ thay đổi khi "Lưu thông tin" (BR23, BR25) |
| Quản lý danh mục | Cung cấp giá trị cho các trường lọc (Điểm, Loại xe, Loại kho, Nhóm hàng, Đơn vị tính...) | Danh mục → Panel bộ lọc | Khi mở panel "Bộ lọc" | Giá trị đã ngừng sử dụng nhưng còn trong dòng giá hiện có → vẫn hiển thị trong danh sách lọc (BR51) |

### **3.1.6. Tích hợp & Đồng bộ dữ liệu**

# **4\. Đánh giá độ phủ rule (Case còn thiếu)**

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| :---- | :---- | :---- | :---- |
| Liên kết hợp đồng | Ngoài phạm vi phase này | Chưa định nghĩa nội dung/kênh cảnh báo khi hợp đồng hết hạn | Chuẩn hóa cảnh báo (banner \+ thông báo) và tần suất nhắc |
| Nhà thầu phụ trách | Đã chốt một phần (BR5) | Đã kiểm tra nhà thầu khi kích hoạt (Tạo mới/Ngừng hoạt động); chưa xử lý khi nhà thầu chấm dứt lúc bảng giá mua đang "Đang hoạt động" | Đồng bộ trạng thái nhà thầu → cảnh báo/treo bảng giá mua đang hoạt động liên quan |
| Xóa/chỉnh sửa dòng giá đang tham chiếu | Đã chốt một phần (BR25) | Mới cảnh báo khi xóa dòng tham chiếu Chi phí dịch vụ; chưa xử lý ràng buộc phía định mức | Cân nhắc cảnh báo/chặn/cập nhật giá mới khi xóa/sửa dòng đang tham chiếu tại bảng định mức giá mua/bán, bảng chi phí dịch vụ |
| Import/Export CSV dòng giá | Ngoài phạm vi (chỉ mô tả nút) | Quy tắc validate khi import (trùng ID, sai đầu mục, ghi đè/thêm mới) | Đặc tả ở phiên bản sau |
| Phân quyền | Đã chốt (BR27 \+ AC phân quyền từng US) | Chưa định nghĩa ma trận quyền chi tiết theo từng role cụ thể; chưa tách rõ quyền "Sửa" gồm Chỉnh sửa thông tin chung và Cập nhật bảng giá (dòng giá) | Xây ma trận Role × Chức năng (Xem / Thêm / Chỉnh sửa thông tin chung / Cập nhật bảng giá / Xóa / Kích hoạt); bổ sung quyền chỉ-xem cho các role liên quan |

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification – SRS)*

**Tài liệu bổ sung: Lọc thuộc tính dòng giá tại màn Thêm mới bảng giá mua**

*Mô hình Hybrid: User Story (xương sống) \+ Use Case chi tiết (cho story phức tạp)*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu "Giá mua đầu vào" (Thỏa thuận bảng giá mua dịch vụ) |
| :---- | :---- |
| **Tài liệu gốc** | SRS\_LogXPro\_Giá mua đầu vào (bổ sung cho US\_BGM\_03, US\_BGM\_07; tham chiếu US\_BGM\_02, US\_BGM\_08, US\_BGM\_09, US\_BGM\_10, US\_BGM\_11) |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | Trang BA |
| **Ngày tạo** | 20/09/2026 |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Bổ sung chức năng **Lọc thuộc tính dòng giá** tại section "Thiết lập giá đầu vào dịch vụ" của màn Thêm mới bảng giá mua và màn Cập nhật bảng giá.

Giúp khoanh vùng nhanh nhóm dòng giá cần rà soát, sửa Đơn giá hoặc xóa trước khi bấm "Lưu thông tin" — nhất là khi 1 tab có nhiều đầu mục giá và nhiều dòng sinh từ "Tạo nhanh hàng loạt".

Cách lọc thống nhất với bộ lọc tại màn Chi tiết (US\_BGM\_02 – AC5, AC6, AC7) và quy tắc giá trị "Tất cả" (BR32).

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Bộ lọc dòng giá theo cột đặc thù của 5 phân hệ \+ Đơn vị tính.

* Áp dụng tại màn Thêm mới bảng giá mua (US\_BGM\_03) và màn Cập nhật bảng giá (US\_BGM\_07).

* Phạm vi lọc: 1 bộ lọc chung cho tab phân hệ đang thao tác, áp dụng cho mọi đầu mục giá trong tab.

* Quy tắc giá trị "Tất cả" khi lọc (BR32a).

* Tương tác giữa bộ lọc với thêm dòng (đơn lẻ/hàng loạt), sửa Đơn giá, xóa dòng, kiểm tra trùng và "Lưu thông tin".

**Ngoài phạm vi (Out-of-scope):**

* Bộ lọc tại màn Chi tiết bảng giá mua — giữ nguyên theo US\_BGM\_02.

* Lọc theo Trạng thái dòng giá và lọc theo Đầu mục giá.

* Tìm kiếm theo ID dòng giá và sắp xếp theo Đơn giá tại màn Thêm mới/Cập nhật (chưa nằm trong yêu cầu; xem mục 4).

* Lưu bộ lọc giữa các phiên làm việc.

* Thao tác hàng loạt trên kết quả lọc (xóa/sửa Đơn giá đồng loạt).

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

*\[Chèn hình ảnh sơ đồ BPMN/Flowchart nếu có — hiện chưa có sơ đồ riêng cho chức năng này\]*

**Mô tả luồng chính:**

1. Mở màn Thêm mới/Cập nhật bảng giá → chọn tab phân hệ cần thao tác.

2. Nhấn "Bộ lọc" → chọn giá trị theo thuộc tính (cột đặc thù \+ Đơn vị tính) → "Áp dụng".

3. Hệ thống lọc danh sách tạm của tab (gồm dòng đã lưu \+ dòng chưa lưu) → hiển thị kết quả theo từng đầu mục giá.

4. Người dùng sửa Đơn giá / xóa / thêm dòng trên kết quả → thay đổi cập nhật vào danh sách tạm, bộ lọc giữ nguyên.

5. Nhấn "Xóa bộ lọc" khi cần xem lại toàn bộ dòng giá của tab.

6. Nhấn "Lưu thông tin" → lưu atomic toàn bộ danh sách tạm, kể cả dòng đang bị ẩn bởi bộ lọc.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Mở màn thiết lập giá | BP quản lý nhà thầu | Mở màn Thêm mới/Cập nhật bảng giá, chọn tab phân hệ | Tab phân hệ | Danh sách đầu mục giá \+ dòng giá của tab | Có quyền Thêm/Cập nhật (BR27) |
| Mở bộ lọc | BP quản lý nhà thầu | Nhấn "Bộ lọc" tại tab | — | Panel bộ lọc theo phân hệ của tab | Trường lọc theo BR42 |
| Chọn điều kiện lọc | BP quản lý nhà thầu | Chọn 1 hoặc nhiều giá trị cho từng thuộc tính | Giá trị lọc | Điều kiện lọc của tab | HOẶC trong 1 trường, VÀ giữa các trường (BR43) |
| Áp dụng bộ lọc | Hệ thống | Lọc danh sách tạm của tab, áp cho mọi đầu mục | Điều kiện lọc; danh sách tạm | Danh sách rút gọn; số dòng hiển thị | Dòng "Tất cả" luôn khớp (BR44); bảng trống nếu không có dòng khớp (BR45) |
| Thao tác trên kết quả | BP quản lý nhà thầu | Sửa Đơn giá / xóa / thêm dòng giá | Thao tác người dùng | Danh sách tạm cập nhật | Giữ nguyên bộ lọc; dòng mới không khớp bị ẩn (BR47, BR48) |
| Xóa bộ lọc | BP quản lý nhà thầu | Nhấn "Xóa bộ lọc" | — | Hiển thị đủ dòng giá của tab | Chỉ xóa bộ lọc của tab đang xem |
| Lưu thông tin | BP quản lý nhà thầu / Hệ thống | Lưu toàn bộ thay đổi | Danh sách tạm | Bảng giá mua được lưu \+ log | Lưu cả dòng đang bị ẩn (BR23, BR46) |

# **3\. Đặc tả Tính năng**

*Mặc định mỗi tính năng được đặc tả bằng User Story \+ Acceptance Criteria. Các story đánh dấu **\[PHỨC TẠP\]** có thêm khối "Use Case chi tiết" mô tả main/alternative/exception flow. Story trong tài liệu này không đánh dấu \[PHỨC TẠP\] (1 actor, luồng tuyến tính; các nhánh xử lý đã nằm trong AC).*

## **3.1. MODULE: Giá mua đầu vào (bổ sung)**

### **3.1.1 Danh sách user story**

**Chú thích MoSCoW:**

* **Must have**: bắt buộc để sản phẩm hoạt động / tuân thủ pháp luật-hợp đồng → Sprint hiện tại/kế tiếp.

* **Should have**: quan trọng, có thể tạm workaround → đưa vào Sprint nếu còn năng lực sau P1.

* **Could have**: mong muốn, cải thiện trải nghiệm → làm khi dư buffer hoặc sprint sau.

#### ***User story 13: Lọc dòng giá theo thuộc tính tại màn Thêm mới/Cập nhật bảng giá***

| ID US | US\_BGM\_13 |
| :---- | :---- |
| **Tên Story** | Lọc dòng giá theo cột đặc thù và Đơn vị tính tại màn Thêm mới bảng giá mua và Cập nhật bảng giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn lọc dòng giá theo các thuộc tính đặc thù của phân hệ và Đơn vị tính ngay khi đang thiết lập giá, để khoanh vùng nhanh nhóm dòng giá cần rà soát, sửa Đơn giá hoặc xóa trước khi lưu. |
| **Độ Ưu tiên (MoSCoW)** | Should have  |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| AC1 | Mỗi tab phân hệ có nút "Bộ lọc" trong section "Thiết lập giá đầu vào dịch vụ". Áp dụng cho cả màn Thêm mới bảng giá mua (US\_BGM\_03) và Cập nhật bảng giá (US\_BGM\_07). | Thiếu nút "Bộ lọc" ở 1 trong 5 tab. Có bộ lọc ở 1 màn nhưng thiếu ở màn còn lại. |
| AC2 | Trường lọc theo phân hệ (cột đặc thù \+ Đơn vị tính): Vận tải: Điểm đi, Điểm đến, Loại xe, Đơn vị tính Kho bãi: Tên kho, Loại kho, Đơn vị tính Khai báo Hải quan: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe, Đơn vị tính Hải quan Giám sát: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe, Đơn vị tính Sang tải: Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa, Đơn vị tính | Thiếu/thừa trường lọc so với phân hệ. Hiển thị trường lọc của phân hệ khác. |
| AC3 | Phân hệ Vận tải: lọc riêng "Điểm đi" và "Điểm đến" (thống nhất US\_GDM\_03 AC1), dù danh sách hiển thị gộp cột "Điểm đi \- Điểm đến" (BR33). | Gộp "Điểm đi" và "Điểm đến" thành 1 trường lọc. Lọc sai khi dòng có cột gộp \= "Tất cả". |
| AC4 | Mỗi trường lọc cho chọn nhiều giá trị (multi-select). Danh sách giá trị lấy theo danh mục của thuộc tính; không có lựa chọn "Tất cả" trong bộ lọc (BR51). | Chỉ cho chọn 1 giá trị. Hiển thị lựa chọn "Tất cả" trong danh sách giá trị lọc. |
| AC5 | Điều kiện kết hợp: Nhiều giá trị trong 1 trường → HOẶC. Nhiều trường → VÀ. Trường không chọn giá trị → không lọc theo trường đó. | Kết hợp HOẶC giữa các trường. Trường bỏ trống làm kết quả rỗng. |
| AC6 | Khi lọc theo 1 thuộc tính, kết quả gồm dòng có giá trị đúng bộ lọc VÀ dòng có giá trị "Tất cả" ở thuộc tính đó (BR32a, BR44). Ví dụ: lọc Loại xe \= "Xe 40ft" → hiển thị dòng Loại xe \= "Xe 40ft" và dòng Loại xe \= "Tất cả". | Lọc bỏ sót dòng "Tất cả". Dòng "Tất cả" không xuất hiện trong kết quả lọc. |
| AC7 | Phạm vi lọc: 1 bộ lọc chung cho tab phân hệ đang thao tác, áp dụng cho mọi đầu mục giá trong tab. Không áp dụng cho các tab còn lại; mỗi tab có trạng thái bộ lọc riêng. Đầu mục giá không có dòng khớp vẫn hiển thị, bảng dòng giá trống kèm thông báo "Không có dòng giá phù hợp với bộ lọc". | Bộ lọc của tab này áp sang tab khác. Ẩn đầu mục giá không có dòng khớp. |
| AC8 | Lọc thực hiện trên danh sách tạm, gồm dòng đã lưu và dòng vừa thêm/sửa chưa lưu. Bộ lọc chỉ ảnh hưởng hiển thị; không thêm, sửa hay xóa dữ liệu dòng giá. | Lọc bỏ sót dòng chưa lưu. Dòng bị ẩn do bộ lọc bị mất/bị xóa khỏi danh sách tạm. |
| AC9 | Khi bộ lọc đang bật, dòng giá mới (thêm đơn lẻ US\_BGM\_08 hoặc tạo hàng loạt US\_BGM\_09) áp bộ lọc như bình thường: Khớp bộ lọc → hiển thị trên cùng đầu mục giá. Không khớp → không hiển thị nhưng vẫn nằm trong danh sách tạm. Bộ lọc không bị tự động xóa. | Dòng không khớp vẫn hiển thị. Dòng không khớp không được đưa vào danh sách tạm. Bộ lọc tự xóa khi thêm dòng. |
| AC10 | Kiểm tra trùng khi thêm dòng (BR28, BR32b) thực hiện trên toàn bộ dòng trong đầu mục giá, kể cả dòng đang bị ẩn bởi bộ lọc. | Cho thêm dòng trùng với dòng đang bị ẩn bởi bộ lọc. |
| AC11 | Sửa Đơn giá inline (US\_BGM\_10) và Xóa dòng giá (US\_BGM\_11) hoạt động bình thường trên kết quả lọc. Sau thao tác, bộ lọc giữ nguyên. Sửa Đơn giá không đổi thuộc tính nên dòng không rời khỏi kết quả lọc. | Sửa/xóa xong bộ lọc bị reset. Thao tác tác động đến dòng không thuộc dòng được chọn. |
| AC12 | "Lưu thông tin" lưu toàn bộ danh sách tạm (atomic, BR23), kể cả dòng đang bị ẩn bởi bộ lọc. "Hủy bỏ" không lưu thay đổi. | Chỉ lưu các dòng đang hiển thị. Dòng bị ẩn do bộ lọc bị mất sau khi lưu. |
| AC13 | Nhấn "Xóa bộ lọc" → xóa toàn bộ điều kiện của tab đang xem. | Không có cách xóa bộ lọc. Hiển thị sai số dòng X/Y. |
| AC14 | Vòng đời bộ lọc: Chuyển qua lại giữa các tab: mỗi tab giữ bộ lọc riêng trong phiên đang mở màn. Rời màn (Lưu/Hủy bỏ): xóa toàn bộ bộ lọc, không lưu giữa các phiên. | Bộ lọc còn tồn tại khi mở lại màn. Chuyển tab làm mất bộ lọc của tab trước đó. |
| AC15 | Chức năng Lọc không kiểm soát phân quyền riêng: mọi người dùng vào được màn Thêm mới/Cập nhật bảng giá (theo BR27) đều dùng được. | Chặn hoặc ẩn bộ lọc vì lý do phân quyền. |

#### ***Điều chỉnh các User Story / Business Rule hiện có***

Các điểm dưới đây cần cập nhật tương ứng trong SRS\_LogXPro\_Giá mua đầu vào để tránh lệch pha giữa các mục.

| Vị trí | Nội dung hiện tại (tóm tắt) | Điều chỉnh |
| ----- | ----- | ----- |
| US\_BGM\_03 – AC6 | Mỗi đầu mục có "Thêm bảng giá dịch vụ", "Thêm dòng giá mới"; mỗi dòng có Xóa và sửa Đơn giá inline. | Bổ sung: mỗi tab phân hệ có nút "Bộ lọc" để lọc dòng giá (chi tiết US\_BGM\_13). |
| US\_BGM\_07 – AC5 | Thao tác dòng giá trên 5 phân hệ: thêm đơn lẻ, tạo hàng loạt, sửa Đơn giá, xóa. | Bổ sung thao tác "Lọc dòng giá" (US\_BGM\_13). |
| US\_BGM\_08 – AC10; US\_BGM\_09 – AC9 | Dòng vừa thêm hiển thị trên cùng đầu mục giá; chỉ persist khi "Lưu thông tin". | Bổ sung: khi bộ lọc đang bật, dòng vừa thêm chỉ hiển thị nếu khớp bộ lọc (BR47). |
| BR23 | Toàn bộ thay đổi chỉ lưu (atomic) khi bấm "Lưu thông tin". | Bổ sung: bao gồm cả dòng đang bị ẩn bởi bộ lọc (BR46). |
| BR28 | Kiểm tra trùng theo bộ thuộc tính \+ Đơn vị tính trong cùng đầu mục giá. | Bổ sung: kiểm tra trên toàn bộ dòng, không phụ thuộc bộ lọc đang bật (BR46). |
| BR32 (a) – LỌC | Dòng "Tất cả" luôn khớp mọi bộ lọc của thuộc tính tương ứng. | Bổ sung: áp dụng cả cho bộ lọc tại màn Thêm mới/Cập nhật bảng giá (BR44). |
| Mục 3.1.2 | Mô tả giao diện Thêm mới/Cập nhật. | Bổ sung panel "Bộ lọc dòng giá" (xem 3.1.2 của tài liệu này). |

### **3.1.2 Mô tả giao diện**

Link UI Design: [Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=10477-102910&t=WV0Lgpv3EwatkzL4-0)

Màn hình: Thêm mới bảng giá mua và Cập nhật bảng giá — section "Thiết lập giá đầu vào dịch vụ" (5 tab). Panel "Bộ lọc dòng giá" mở từ nút "Bộ lọc" trên thanh công cụ của tab.

**Bảng trường dữ liệu — Panel "Bộ lọc dòng giá":**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Điểm đi |  | Multi-select (enum) | — | (Trống) | Phân hệ: Vận tải. Lọc riêng, không gộp với Điểm đến (BR33). |
| Điểm đến |  | Multi-select (enum) | — | (Trống) | Phân hệ: Vận tải. Lọc riêng, không gộp với Điểm đi. |
| Loại xe |  | Multi-select (enum) | — | (Trống) | Phân hệ: Vận tải, Khai báo Hải quan, Hải quan Giám sát. Dòng "Tất cả" luôn khớp (BR44). |
| Tên kho |  | Multi-select (enum) | — | (Trống) | Phân hệ: Kho bãi. Dòng "Tất cả" luôn khớp. |
| Loại kho |  | Multi-select (enum) | — | (Trống) | Phân hệ: Kho bãi. Lấy toàn bộ danh mục Loại kho (không giới hạn theo đầu mục vì bộ lọc dùng chung cho cả tab). |
| Chi cục hải quan |  | Multi-select (enum) | — | (Trống) | Phân hệ: Khai báo Hải quan, Hải quan Giám sát. Dòng "Tất cả" luôn khớp. |
| Loại hình XNK |  | Multi-select (enum) | — | (Trống) | Phân hệ: Khai báo Hải quan, Hải quan Giám sát. Dòng "Tất cả" luôn khớp. |
| Nhóm hàng |  | Multi-select (enum) | — | (Trống) | Phân hệ: Khai báo Hải quan, Hải quan Giám sát, Sang tải. Dòng "Tất cả" luôn khớp. |
| Địa điểm sang tải |  | Multi-select (enum) | — | (Trống) | Phân hệ: Sang tải. Dòng "Tất cả" luôn khớp. |
| Phương thức sang tải |  | Multi-select (enum) | — | (Trống) | Phân hệ: Sang tải. Dòng "Tất cả" luôn khớp. |
| Đặc tính hàng hóa |  | Multi-select (enum) | — | (Trống) | Phân hệ: Sang tải. Dòng "Tất cả" luôn khớp. |
| Đơn vị tính |  | Multi-select (enum) | — | (Trống) | Phân hệ: cả 5 phân hệ. Khớp chính xác giá trị; Đơn vị tính không có giá trị "Tất cả". |
| Xóa bộ lọc |  | Button | — | — | Xóa toàn bộ điều kiện của tab đang xem và hiển thị lại đầy đủ dòng giá. |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

*Đánh số tiếp nối SRS gốc (BR1–BR40).*

* BR41: Bộ lọc dòng giá tại màn Thêm mới/Cập nhật bảng giá chỉ lọc hiển thị trên danh sách tạm; không thay đổi và không xóa dữ liệu dòng giá.

* BR42: Trường lọc theo phân hệ \= cột đặc thù (mục 3.1.2 SRS gốc) \+ Đơn vị tính. Vận tải lọc riêng Điểm đi và Điểm đến dù cột hiển thị gộp (BR33).

* BR43: Nhiều giá trị trong 1 trường → HOẶC; nhiều trường → VÀ; trường không chọn giá trị → không lọc theo trường đó.

* BR44: Dòng có giá trị "Tất cả" ở thuộc tính đang lọc luôn khớp (BR32a). Vận tải: dòng có cột "Điểm đi \- Điểm đến" \= "Tất cả" khớp mọi bộ lọc Điểm đi/Điểm đến.

* BR45: 1 bộ lọc/tab, áp dụng cho mọi đầu mục giá trong tab; không ảnh hưởng tab khác. Đầu mục giá không có dòng khớp vẫn hiển thị với bảng trống.

* BR46: Bộ lọc áp trên toàn bộ danh sách tạm (dòng đã lưu \+ dòng chưa lưu). Kiểm tra trùng (BR28) và "Lưu thông tin" (BR23) xử lý toàn bộ dòng, không phụ thuộc bộ lọc.

* BR47: Khi bộ lọc đang bật, dòng mới thêm (đơn lẻ/hàng loạt) áp bộ lọc như bình thường: khớp → hiển thị trên cùng đầu mục; không khớp → ẩn nhưng vẫn nằm trong danh sách tạm; bộ lọc không tự xóa.

* BR48: Sửa Đơn giá và xóa dòng trên kết quả lọc giữ nguyên bộ lọc. Sửa Đơn giá không đổi thuộc tính nên dòng không rời khỏi kết quả lọc.

* BR49: Bộ lọc giữ riêng theo từng tab trong phiên mở màn; xóa khi rời màn (Lưu/Hủy bỏ); không lưu vào cơ sở dữ liệu.

* BR50: Chức năng Lọc không kiểm soát phân quyền riêng; quyền vào màn theo BR27.

* BR51: Danh sách giá trị lọc lấy theo danh mục thuộc tính; không có lựa chọn "Tất cả". Giá trị đã ngừng sử dụng nhưng còn trong dòng giá hiện có vẫn hiển thị để có thể lọc.

### **3.1.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| ----- | ----- | ----- | ----- |
| Áp bộ lọc mà đầu mục giá không có dòng khớp | Thông tin | "Không có dòng giá phù hợp với bộ lọc" | Giữ đầu mục giá, hiển thị bảng trống |
| Thêm dòng giá đơn lẻ trùng với dòng đang bị ẩn bởi bộ lọc | Lỗi | "Dòng giá đã tồn tại trong đầu mục giá này (trùng thuộc tính và đơn vị tính)" | Chặn thêm (dùng lại thông báo hiện có, BR28); dòng trùng vẫn bị ẩn |
| Tạo hàng loạt phát sinh dòng trùng với dòng đang bị ẩn bởi bộ lọc | Lỗi | "Có \[Số lượng dòng giá trùng\] dòng giá đã trùng với dòng giá sẵn có." | Bỏ qua các dòng trùng (dùng lại thông báo hiện có) |
| Người dùng không có quyền vào màn Thêm mới/Cập nhật bảng giá | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn/chặn theo BR27 (dùng lại thông báo hiện có) |

### **3.1.5. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| ----- | ----- | ----- | ----- | ----- |
| Quản lý danh mục | Cung cấp giá trị cho các trường lọc (Điểm, Loại xe, Loại kho, Nhóm hàng, Đơn vị tính...) | Danh mục → Panel bộ lọc | Khi mở panel "Bộ lọc" | Giá trị đã ngừng sử dụng nhưng còn trong dòng giá hiện có → vẫn hiển thị trong danh sách lọc (BR51) |
| Cấu hình đầu mục giá | Cung cấp đầu mục giá (cha) chứa các dòng giá cần lọc | Đầu mục giá → Màn Thêm mới/Cập nhật | Khi hiển thị tab phân hệ | Bộ lọc không thay đổi danh sách đầu mục; đầu mục không có dòng khớp vẫn hiển thị (BR45) |
| Bảng giá mua định mức, Bảng giá bán định mức, Chi phí dịch vụ | Tham chiếu dòng giá "Đã phê duyệt" của bảng giá mua "Đang hoạt động" | Không phát sinh luồng dữ liệu mới | — | Bộ lọc chỉ là thao tác hiển thị; dữ liệu hạ nguồn chỉ thay đổi khi "Lưu thông tin" (BR23, BR25) |

# **4\. Đánh giá độ phủ rule (Case còn thiếu)**

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| ----- | ----- | ----- | ----- |
| Tìm kiếm & sắp xếp tại màn Thêm mới/Cập nhật | Ngoài phạm vi | US\_BGM\_02 AC5 có Tìm kiếm theo ID dòng giá và Sắp xếp theo Đơn giá; US\_BGM\_03 và US\_BGM\_07 chưa mô tả. | Đề xuất bổ sung cùng thanh công cụ với "Bộ lọc" để đồng nhất giữa các màn. |
| Lọc theo Trạng thái dòng giá | Chưa đưa vào phạm vi | Dòng "Chờ phê duyệt" phát sinh khi sửa Đơn giá dòng đang được tham chiếu (US\_BGM\_10 AC3) nhưng chưa lọc được. | Cân nhắc thêm trường lọc "Trạng thái" khi luồng phê duyệt giá được triển khai. |
| Cô lập dòng "Tất cả" | Chưa chốt | Bộ lọc không có lựa chọn "Tất cả" nên chưa xem riêng được các dòng "Tất cả". | Cân nhắc thêm tùy chọn "Chỉ dòng Tất cả" hoặc chip ghi chú "đã gồm dòng Tất cả". |
| Dòng bị ẩn gây lỗi trùng khó hiểu | Rủi ro UX | Người dùng thêm dòng bị báo trùng với dòng đang bị ẩn bởi bộ lọc, không thấy dòng trùng. | Đề xuất: thông báo kèm liên kết "Xóa bộ lọc để xem dòng trùng". |
| Đồng bộ bộ lọc với màn Chi tiết | Cần đối chiếu | US\_BGM\_02 AC5 mô tả "Lọc theo các cột thuộc tính", chưa nêu Đơn vị tính, multi-select và nút "Xóa bộ lọc". | Rà soát và thống nhất hành vi lọc giữa Chi tiết, Thêm mới và Cập nhật. |
| Thao tác hàng loạt trên kết quả lọc | Chưa có | Chưa có xóa/sửa Đơn giá đồng loạt các dòng đang lọc. | Đề xuất cho phiên bản sau (chọn nhiều dòng, sửa Đơn giá hàng loạt) nếu phát sinh nhu cầu. |

# **Phụ lục A. Hướng dẫn áp dụng mô hình Hybrid theo Sprint**

* **Refinement:** bẻ Epic → User Story \+ AC; đánh dấu \[PHỨC TẠP\] cho story nhiều nhánh/nhiều actor để bổ sung Use Case.

* **Sprint Planning:** chỉ story đạt Definition of Ready mới đưa vào Sprint Backlog; đính wireframe & business rule.

* **Trong Sprint:** US \+ AC là living doc; tester biến AC (và Use Case flow) trực tiếp thành test case.

* **Review/Done:** cập nhật lại US/UC theo thực tế build, đồng bộ Data Dictionary & bảng tích hợp.

  **YÊU CẦU THAY ĐỔI (CHANGE REQUIREMENT)**

**Module Giá mua đầu vào – Danh sách chọn "Nhà thầu phụ trách"**

| Hệ thống / Module | LogXPro – Module Quản lý cung ứng – Menu "Giá mua đầu vào" |
| :---- | :---- |
| **Tài liệu bị ảnh hưởng** | SRS\_LogXPro\_Giá mua đầu vào |
| **Loại thay đổi** | Bổ sung rule mới |
| **Người lập** | Trang BA |
| **Ngày tạo** | 20/09/2026 |

# **1\. Tóm tắt thay đổi**

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| ----- | ----- | ----- | ----- | ----- |
| 1 | Tại màn Thêm mới bảng giá mua và Chỉnh sửa thông tin chung, khi chọn Nhà thầu phụ trách, danh sách chọn chỉ gồm nhà thầu: Ở trạng thái "Đang hoạt động". Có hợp đồng ở trạng thái "Đang hiệu lực". (US\_BGM\_03 – AC13; US\_BGM\_04 – AC8; mục 3.1.2; BR52) | Nhà thầu phụ trách chọn từ danh mục nhà thầu, không giới hạn trạng thái nhà thầu/hợp đồng tại bước chọn; trạng thái "Đang hoạt động" của nhà thầu chỉ kiểm tra khi Kích hoạt (US\_BGM\_06 – AC3; BR5). | 20/09/2026 | Đảm bảo bảng giá mua chỉ gắn nhà thầu hợp lệ và có hợp đồng khung đang hiệu lực; chặn lỗi ngay tại bước chọn thay vì đến bước Lưu/Kích hoạt. |

# **2\. Nội dung bổ sung vào SRS**

| Vị trí | Nội dung bổ sung |
| ----- | ----- |
| 3.1.1 – US\_BGM\_03 (Thêm mới) Thêm AC13 | **AC:** Danh sách chọn "Nhà thầu phụ trách" chỉ gồm nhà thầu "Đang hoạt động" và có hợp đồng "Đang hiệu lực" (BR52). **Negative:** Hiển thị nhà thầu không hoạt động hoặc không có hợp đồng "Đang hiệu lực" trong danh sách chọn. |
| 3.1.1 – US\_BGM\_04 (Chỉnh sửa thông tin chung) Thêm AC8 | **AC:** Danh sách chọn "Nhà thầu phụ trách" chỉ gồm nhà thầu "Đang hoạt động" và có hợp đồng "Đang hiệu lực" (BR52). **Negative:** Cho chọn nhà thầu không hoạt động hoặc không có hợp đồng "Đang hiệu lực" khi chỉnh sửa. |
| 3.1.2 – Trường "Nhà thầu phụ trách" | Mô tả: "Chọn từ danh sách nhà thầu 'Đang hoạt động' và có hợp đồng 'Đang hiệu lực' (BR52); mỗi nhà thầu chỉ 1 bảng giá mua Đang hoạt động". |
| 3.1.3 – Thêm BR52 | **BR52:** Tại màn Thêm mới bảng giá mua (US\_BGM\_03) và Chỉnh sửa thông tin chung (US\_BGM\_04), danh sách chọn "Nhà thầu phụ trách" chỉ gồm nhà thầu thỏa đồng thời: Trạng thái nhà thầu \= "Đang hoạt động". Có hợp đồng ở trạng thái "Đang hiệu lực". |
| 3.1.5 – Tích hợp (Quản lý nhà thầu, Quản lý hợp đồng) | Bổ sung: cung cấp trạng thái nhà thầu và trạng thái hợp đồng để lọc danh sách "Nhà thầu phụ trách" khi mở màn Thêm mới/Chỉnh sửa thông tin chung. |

*Ghi chú: BR52 đánh số tiếp nối BR41–BR51 của tài liệu bổ sung "Lọc thuộc tính dòng giá"; điều chỉnh lại nếu hợp nhất vào SRS gốc theo thứ tự khác.*

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification \- SRS)*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu "Giá mua đầu vào" (Thỏa thuận bảng giá mua dịch vụ) |
| :---- | :---- |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | Trang BA  |
| **Ngày tạo** | 06/08/2026 |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Menu "Giá mua đầu vào" quản lý danh sách các bảng giá mua dịch vụ đã thỏa thuận với nhà thầu, tổ chức theo 5 phân hệ dịch vụ: Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát và Sang tải. Mỗi bảng giá mua gắn với 1 nhà thầu phụ trách, liên kết tối đa 1 hợp đồng khung, và chứa các dòng giá chi tiết thuộc các đầu mục giá đã thiết lập ở menu "Cấu hình đầu mục giá".

Đây là nơi lưu trữ, tra cứu và điều hành hiệu lực của các thỏa thuận giá mua; dữ liệu dòng giá là nguồn tham chiếu cho các menu hạ nguồn (Giá mua/bán định mức, Quản lý báo giá).

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Xem danh sách bảng giá mua theo 5 phân hệ; lọc theo trạng thái/nhà thầu; tìm theo ID; sắp xếp; chọn nhiều bản ghi để xuất dữ liệu.

* Xem chi tiết 1 bảng giá mua: thông tin chung, 5 tab dòng giá chi tiết, lịch sử hoạt động.

* Thêm mới bảng giá mua: nhập thông tin chung và cấu hình dòng giá 5 phân hệ (thêm dòng đơn lẻ, thêm hàng loạt, xóa dòng, sửa đơn giá).

* Chỉnh sửa thông tin chung (chỉ thông tin chung, chỉ bảng giá mua "Tạo mới").

* Xóa bảng giá mua (chỉ "Tạo mới") theo cơ chế xóa mềm: khóa và ẩn bản ghi khỏi danh sách.

* Cập nhật bảng giá: thêm/xóa dòng giá và sửa đơn giá trên bảng giá mua đã tồn tại (Thông tin chung chỉ đọc).

* Kích hoạt bảng giá mua và quản lý vòng đời trạng thái (Tạo mới / Đang hoạt động / Ngừng hoạt động / Hết hiệu lực).

* Phân quyền theo chức năng: mỗi chức năng Xem/Thêm/Sửa/Xóa/Kích hoạt chỉ hiển thị và thao tác được khi người dùng có quyền tương ứng.

* *Quy tắc validate Import/Export CSV cấp dòng giá — chỉ mô tả nút, chi tiết ở phiên bản sau. (Đang cập nhật*

* *Nhân bản bảng giá mua (Đang cập nhật)*

* *Phê duyệt giá*

**Ngoài phạm vi (Out-of-scope):**

* Luồng gửi Phê duyệt bảng giá mua (phê duyệt cấp bảng giá) — không triển khai trong giai đoạn này. 

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

[**LogX \-QL giá mua .drawio**](https://drive.google.com/file/d/1Au166CK7y3eQp1O5QDwLt8Y2eDFbscmQ/view?usp=sharing)

 

**Mô tả luồng chính:** 

* Người dùng (Bộ phận quản lý nhà thầu) mở menu Giá mua đầu vào → xem danh sách bảng giá mua (lọc/tìm/sắp xếp). Chỉ các chức năng người dùng được phân quyền mới hiển thị.

* Thêm mới bảng giá mua: nhập thông tin chung \+ cấu hình dòng giá 5 phân hệ (thêm đơn lẻ / thêm hàng loạt / xóa / sửa đơn giá); nhấn "Lưu thông tin" lưu đồng thời (atomic) → bảng giá mua ở trạng thái "Tạo mới", ID tự sinh RSYYMM-NNN; hệ thống ghi log "Khởi tạo bảng giá".

* Cập nhật bảng giá: mở bảng giá mua đã tồn tại (Thông tin chung chỉ đọc), thêm/xóa dòng giá và sửa đơn giá → "Lưu thông tin". 

* Kích hoạt bảng giá mua (Tạo mới/Ngừng hoạt động) → "Đang hoạt động": kiểm tra Nhà thầu phụ trách phải đang hoạt động; nếu có bảng giá mua khác cùng nhà thầu đang "Đang hoạt động" thì yêu cầu xác nhận để chuyển bảng giá mua đó sang "Ngừng hoạt động". Riêng bảng giá "Tạo mới" có liên kết hợp đồng: sau khi kiểm tra nhà thầu, kiểm tra thêm Thời điểm kích hoạt ≥ Ngày hiệu lực hợp đồng; kích hoạt thành công thì cập nhật Ngày hiệu lực \= Ngày kích hoạt.

* Xóa bảng giá mua ("Tạo mới"): khóa & ẩn bản ghi khỏi danh sách (xóa mềm, không xóa vật lý).

* Xem chi tiết: thông tin chung \+ dòng giá theo 5 phân hệ \+ lịch sử; hệ thống ghi log mọi thao tác.

* Đến ngày hết hiệu lực → tự động chuyển "Hết hiệu lực".

* Chỉ dòng giá "Đã phê duyệt" của bảng giá mua "Đang hoạt động" là nguồn tham chiếu động cho Bảng giá mua định mức, Bảng giá bán định mức và Chi phí dịch vụ.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Xem danh sách | BP quản lý nhà thầu | Mở menu, xem danh sách bảng giá mua, lọc/tìm/sắp xếp | Danh mục bảng giá mua | Danh sách bảng giá mua | Có quyền Xem bảng giá mua |
| Thêm mới bảng giá mua | BP quản lý nhà thầu | Nhập thông tin chung \+ cấu hình dòng giá 5 phân hệ (đơn lẻ/hàng loạt/xóa/sửa đơn giá) | Thông tin bảng giá mua \+ dòng giá | Bảng giá mua "Tạo mới" (atomic); ID tự sinh RSYYMM-NNN; log "Khởi tạo bảng giá" | Có quyền Thêm; bắt buộc Tên, Nhà thầu, Ngày hiệu lực, Ngày hết hiệu lực; chặn trùng tên |
| Cập nhật bảng giá | BP quản lý nhà thầu | Thêm/xóa dòng giá, sửa đơn giá (Thông tin chung chỉ đọc) | Danh sách dòng giá hiện tại | Dòng giá cập nhật \+ log | Áp dụng Tạo mới/Đang hoạt động/Ngừng hoạt động (không Hết hiệu lực); khóa đồng thời |
| Kích hoạt bảng giá mua | BP quản lý nhà thầu | Kích hoạt bảng giá mua "Tạo mới"/"Ngừng hoạt động" → "Đang hoạt động" | Bảng giá mua Tạo mới/Ngừng hoạt động | Đang hoạt động (+ bảng giá mua trùng nhà thầu → Ngừng hoạt động) | Có quyền Kích hoạt; Nhà thầu "Đang hoạt động"; (Tạo mới \+ có hợp đồng) Thời điểm kích hoạt ≥ Ngày hiệu lực hợp đồng → cập nhật Ngày hiệu lực \= Ngày kích hoạt; xác nhận nếu có bảng giá mua trùng nhà thầu đang "Đang hoạt động" |
| Xem chi tiết | BP quản lý nhà thầu | Xem thông tin chung \+ dòng giá 5 phân hệ \+ lịch sử | Bảng giá mua đã chọn | Chi tiết bảng giá mua \+ log | Có quyền Xem |
| Chỉnh sửa thông tin chung | BP quản lý nhà thầu | Sửa các trường trong section Thông tin chung | Thông tin chung hiện tại | Thông tin chung cập nhật \+ log | Có quyền Sửa; chỉ bảng giá mua "Tạo mới"; không sửa dòng giá; khóa đồng thời |
| Xóa bảng giá mua | BP quản lý nhà thầu | Khóa & ẩn bản ghi khỏi danh sách (xóa mềm) | Bảng giá mua "Tạo mới" | Bản ghi bị khóa & ẩn \+ log | Có quyền Xóa; chỉ "Tạo mới"; không xóa vật lý |
| Tự động đổi trạng thái | Hệ thống | Đến ngày hiệu lực → Đang hoạt động Quá Ngày hết hiệu lực → Hết hiệu lực | Ngày hệ thống | Trạng thái cập nhật | Tự động kích hoạt: Áp dụng cho Bảng giá mua trạng thái Tạo mới Tự động hết hiệu lựcz: Áp dụng cho Tạo mới/Đang hoạt động/Ngừng hoạt động |
| Đồng bộ tham chiếu | Hệ thống | Cung cấp dòng giá "Đã phê duyệt" cho định mức mua/bán & chi phí dịch vụ | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) | Dữ liệu tham chiếu | Chỉ dòng "Đã phê duyệt" của bảng giá mua "Đang hoạt động"; tham chiếu động |

# **3\. Đặc tả Tính năng**

## **3.1. MODULE: Giá mua đầu vào**

### **3.1.1 Danh sách user story**

#### *User story 1: Xem danh sách bảng giá mua*

| ID US | US\_BGM\_01 |
| :---- | :---- |
| **Tên Story** | Xem danh sách bảng giá mua |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem danh sách bảng giá mua theo bộ lọc và sắp xếp, để nắm nhanh tình trạng các thỏa thuận giá và truy cập vào từng bảng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Hiển thị bảng danh mục với các cột:  ID bảng giá,  Tên bảng giá,  Nhà thầu phụ trách,  Ngày hiệu lực,  Ngày hết hiệu lực,  Trạng thái,  Thao tác. | Thiếu cột hoặc sai dữ liệu. |
| AC2 | \- Cho lọc theo Trạng thái và Nhà thầu;  \- Tìm kiếm theo ID;  \- Sắp xếp theo Ngày hiệu lực và Ngày hết hiệu lực;  Kết quả trả ra đúng. | Lọc/tìm/sắp xếp ra kết quả sai. |
| AC3 | \- Mỗi dòng chỉ hiển thị action Sửa / Xóa khi người dùng có quyền Sửa / Xóa bảng giá mua. \- Khi nhấn action, hệ thống điều hướng đúng bảng giá mua tương ứng. | Nhấn action điều hướng sai/không điều hướng. |
| AC4 | Cho chọn nhiều bản ghi (checkbox) và Xuất dữ liệu các bản ghi đã chọn. | Xuất sai/thiếu bản ghi đã chọn. |
| AC5 | Chức năng Xem danh sách/chi tiết bảng giá mua chỉ hiển thị khi người dùng có quyền Xem; User không có quyền → không nhìn thấy menu trên menu side và truy cập vào menu không thấy dữ liệu. | Người dùng không có quyền Xem vẫn truy cập/xem được dữ liệu. |
| AC6 | Mặc định danh sách bảng giá mua được sắp xếp theo Thời gian tạo giảm dần (bản ghi mới nhất ở trên cùng).  | Danh sách không sắp xếp mặc định theo Thời gian tạo giảm dần; hoặc bản ghi vừa tạo không hiển thị ở trên cùng. |

#### *User story 2: Xem chi tiết bảng giá mua* 

| ID US | US\_BGM\_02 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết thông tin chung, dòng giá theo 5 phân hệ |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem chi tiết 1 bảng giá mua gồm thông tin chung, dòng giá theo 5 phân hệ và lịch sử, để kiểm tra thỏa thuận giá hiện tại và truy vết thay đổi. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| Thông tin chung |  |  |
| AC1 | Section Thông tin chung hiển thị:  ID bảng giá Nhà thầu phụ trách,  Ngày hiệu lực,  Ngày hết hiệu lực,  Trạng thái,  Tiền tệ,  Hợp đồng khung. | Thiếu/sai trường thông tin chung. |
| Danh sách dòng giá mua |  |  |
| AC2 | Luôn hiển thị đủ 5 tab phân hệ (Mỗi tab phân hệ là 1 loại dịch vụ); Trong mỗi tab không có dòng giá nào vẫn hiển thị tab với bảng giá trống. Các đầu mục giá trong từng tab hiển thị đầy đủ theo Loại dịch vụ (đã được cấu hình trong Cấu hình đầu mục giá) gồm ID, Tên đầu mục giá, Loại giá | Ẩn tab của phân hệ trống hoặc thiếu tab. |
| AC3 | Danh sách dòng giá được nhóm theo đầu mục giá (thiết lập trong Cấu hình đầu mục giá) và danh sách giá mua hiển thị đúng các cột theo từng dịch vụ (xem 3.1.2);  | Sai cấu trúc cột theo phân hệ; thiếu trạng thái dòng giá. |
| AC4 | Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị đuôi NNNN của dòng giá.  | Hiển thị đầy đủ ID hoặc không hiển thị ID |
| AC5 | Danh sách dòng giá cho phép:  Tìm kiếm theo ID dòng giá: Tìm kiếm theo ID đầy đủ \[Mã bảng giá mua\]-NNNN hoặc NNNN đều tìm được dòng giá theo ID đầy đủ Sắp xếp theo Đơn giá, Lọc theo các cột thuộc tính.  | Tìm/sắp xếp/lọc sai kết quả. |
| AC6 | Khi lọc theo một thuộc tính, kết quả bao gồm các dòng có giá trị đúng bộ lọc VÀ các dòng có giá trị "Tất cả" ở thuộc tính đó (dòng "Tất cả" luôn khớp mọi bộ lọc của thuộc tính tương ứng — xem BR32). | Lọc bỏ sót dòng "Tất cả"; dòng "Tất cả" không xuất hiện trong kết quả lọc theo thuộc tính. |
| AC7 | Phạm vi lọc: Áp dụng tất cả đầu mục trong tab dịch vụ đã thao tác. Không áp dụng tại các tab dịch vụ còn lại. |  |
| Lịch sử hoạt động |  |  |
| AC8 | Lịch sử hoạt động hiển thị: Thời gian, Người thực hiện, Hành động, Nội dung;  | Log thiếu người thao tác/nội dung; không lọc được theo Hành động. |
| AC9 | Lịch sử hoạt động: Cho phép lọc theo Hành động và làm mới bảng lịch sử hoạt động (cập nhật thông tin mới nhất). Với Lịch sử hoạt động là Chỉnh sửa bảng giá mua và Phê duyệt bảng giá mua, hiển thị nút *Xem chi tiết* ở cuối bản ghi*.* | Log Chỉnh sửa bảng giá mua và Phê duyệt bảng giá mua, không hiển thị nút *Xem chi tiết.* |
| Nút tương tác |  |  |
| AC10 | Nút "Chỉnh sửa thông tin chung" chỉ hiển thị với bảng giá mua ở "Tạo mới";  Nút "Cập nhật bảng giá" hiển thị khi bảng giá mua ở "Tạo mới"/"Đang hoạt động"/"Ngừng hoạt động" (ẩn khi "Hết hiệu lực"). | Hiển thị/ẩn sai nút theo trạng thái; điều hướng sai bảng giá mua. |
| AC11 | Với người dùng không có quyền Chỉnh sửa bảng giá mua, hệ thống ẩn nút “Chỉnh sửa thông tin chung” và nút “Cập nhật bảng giá” đồng thời chặn người dùng chỉnh sửa.  | Người dùng không có quyền Sửa vẫn hiển thị nút Chỉnh sửa thông tin chung / Cập nhật bảng giá hoặc chỉnh sửa thành công. |
| AC12 | Với người dùng không có quyền Xóa bảng giá mua, hệ thống ẩn nút “Xóa bảng giá mua” đồng thời chặn người dùng xóa bảng giá mua. | Người dùng không có quyền Xóa vẫn hiển thị nút Xóa bảng giá mua hoặc xóa thành công. |

#### *User story 3: Thêm mới bảng giá mua*

| ID US | US\_BGM\_03 |
| :---- | :---- |
| **Tên Story** | Tạo mới bảng giá mua: thông tin chung \+ cấu hình dòng giá 5 phân hệ |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn thêm mới bảng giá mua gồm thông tin chung và cấu hình dòng giá cho 5 phân hệ, để khởi tạo đầy đủ một thỏa thuận giá cho nhà thầu. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Nhấn "Thêm bảng giá mua" mở màn tạo mới gồm section Thông tin chung và section "Thiết lập giá đầu vào dịch vụ" (5 tab). | Không mở được màn/thiếu section. |
| AC2 | Thông tin chung gồm các trường: Tên bảng giá mua, Nhà thầu phụ trách, Ngày hiệu lực, Ngày hết hiệu lực, Ghi chú bổ sung, Tiền tệ, Hợp đồng khung,  |  |
| AC2 | Ràng buộc:  Ngày hiệu lực ≤ Ngày hết hiệu lực.  Ngày hiệu lực ≥ Ngày hiệu lực hợp đồng (kiểm tra khi Lưu) Ngày hết hiệu lực ≤ Ngày hết hiệu lực hợp đồng (kiểm tra khi Lưu). | Thiếu trường bắt buộc vẫn cho lưu; hoặc Ngày hiệu lực \> Ngày hết hiệu lực. |
| AC3 | Chặn trùng Tên bảng giá mua (kiểm tra khi lưu). | Cho trùng tên. |
| AC4 | Hợp đồng tự động gắn kèm (lấy từ danh sách hợp đồng) khi chọn Nhà thầu phụ trách (only read)Khi bỏ chọn Nhà thầu phụ trách, hợp đồng tự động bỏ gắn kèm. *(Chi tiết rule hợp đồng được gắn kèm tự động sẽ được mô tả ở phiên bản sau của tài liệu).* | Hợp đồng không tự động gắn kèm khi chọn nhà thầu phụ trách. |
| AC5 | ID bảng giá mua do hệ thống tự sinh theo cấu trúc RSYYMM-NNN Trong đó: RS \= ratesheet,  YYMM \= năm/tháng tạo,  NNN \= số thứ tự trong tháng tạo, bắt đầu từ 001;  ví dụ ID bảng giá: RS260804-001; Người dùng không được nhập/sửa ID. | ID không tự sinh hoặc sai cấu trúc RSYYMM-NNN. |
| AC6 | Mỗi tab phân hệ hiển thị các đầu mục giá “đang kích hoạt” và có loại giá \= {Cố định, Phụ phí} của phân hệ. Mỗi đầu mục có: ID, Tên đầu mục giá, Loại giá và "Thêm bảng giá dịch vụ" (hàng loạt), "Thêm dòng giá mới" (đơn lẻ), (chi tiết ở US\_BGM\_08 và US\_BGM\_09).  Mỗi dòng giá có Xóa và sửa Đơn giá inline (chi tiết ở US\_BGM\_11 và US\_BGM\_10). | Sai/không hiển thị đúng đầu mục hoặc thiếu action. |
| AC7 | Nút "Lưu thông tin" lưu đồng thời Thông tin chung \+ toàn bộ dòng giá đã cấu hình theo cơ chế atomic; bảng giá mua tạo ở trạng thái "Tạo mới". Nút "Hủy bỏ" không lưu.  | Lưu không đồng bộ (mất thông tin chung hoặc mất dòng giá). |
| AC8 | Sau khi tạo thành công bảng giá, hệ thống đồng thời ghi lịch sử hoạt động với hành động "Khởi tạo bảng giá". | Tạo thành công nhưng không ghi log "Khởi tạo bảng giá". |
| AC9 | Cho phép lưu ngay cả khi một/nhiều đầu mục chưa có dòng giá nào (hiển thị đầu mục/bảng giá trống). | Bắt buộc phải có dòng giá mới cho lưu. |
| AC10 | Đầu mục giá bị tắt kích hoạt (bật/tắt kích hoạt trong Cấu hình đầu mục giá) bị ẩn & khóa, không thể thiết lập các dòng giá trong đầu mục giá. Chỉ thiết lập giá cho đầu mục giá có Loại giá \= Cố định / Phụ phí. Đầu mục giá có Loại giá \= “Phát sinh” không được thiết lập dòng giá trong đầu mục (ẩn hiển thị và chặn thiết lập) | Vẫn cấu hình được dòng giá cho đầu mục đã tắt.Vẫn thiết lập được đầu mục giá “Phát sinh” |
| AC11 | Chặn người dùng thêm bảng giá mua khi người dùng không có quyền Tạo mới bảng giá mua. | Người dùng không có quyền Thêm vẫn thêm mới thành công bảng giá mua |
| AC12 | *Chức năng Export và Import chưa được mô tả trong phiên bản tài liệu này.* | \- |

#### *User story 4: Chỉnh sửa thông tin chung bảng giá mua*

| ID US | US\_BGM\_04 |
| :---- | :---- |
| **Tên Story** | Chỉnh sửa các trường thông tin chung của bảng giá mua |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn cập nhật thông tin chung của bảng giá mua, để chỉnh sửa thỏa thuận (nhà thầu, hợp đồng, thời hạn) mà không tác động tới dòng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Chức năng chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới"; các trạng thái khác ẩn nút "Chỉnh sửa thông tin chung" và chặn chỉnh sửa. | Cho chỉnh sửa bảng giá mua không ở trạng thái "Tạo mới". |
| AC2 | Nút "Chỉnh sửa thông tin chung" mở form chỉ chứa các trường của section Thông tin chung. | Form chứa/cho sửa dòng giá. |
| AC3 | Áp dụng cùng rule bắt buộc như khi thêm (Tên bảng giá mua, Nhà thầu phụ trách, Ngày hiệu lực, Ngày hết hiệu lực, Tiền tệ, Hợp đồng);  Ràng buộc: Ngày hiệu lực ≤ Ngày hết hiệu lực;  khi có liên kết hợp đồng khung:  Ngày hiệu lực ≥ Ngày hiệu lực hợp đồng  Ngày hết hiệu lực ≤ Ngày hết hiệu lực hợp đồng. | Thiếu trường bắt buộc vẫn cho lưu; hoặc Ngày hiệu lực \> Ngày hết hiệu lực. |
| AC4 | Hợp đồng tự động gắn kèm (lấy từ danh sách hợp đồng) khi chọn Nhà thầu phụ trách (only read)Khi bỏ chọn Nhà thầu phụ trách, hợp đồng tự động bỏ gắn kèm. *(Chi tiết rule hợp đồng được gắn kèm tự động sẽ được mô tả ở phiên bản sau của tài liệu).* | Hợp đồng không tự động gắn kèm khi chọn nhà thầu phụ trách hoặc người dùng có thể tự ý thay đổi hợp đồng gắn kèm. |
| AC5 | "Lưu thông tin" ghi lại các thông tin thay đổi \+ lưu lịch sử thao tác; "Hủy bỏ" không lưu bất kỳ thay đổi nào. | Hủy bỏ nhưng thay đổi vẫn được lưu. |
| AC6 | Chặn người dùng chỉnh sửa khi người dùng không có quyền Chỉnh sửa bảng giá mua. | Người dùng không có quyền Chỉnh sửa vẫn sửa thành công bảng giá mua. |
| AC7 | Trường hợp user chọn lại nhà thầu phụ trách, hệ thống cập nhật hợp đồng đang hoạt động tương ứng của nhà thầu | Không cập nhật hợp đồng  |

#### *User story 5: Xóa bảng giá mua*

| ID US | US\_BGM\_05 |
| :---- | :---- |
| **Tên Story** | Xóa bảng giá mua |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xóa 1 bảng giá mua, để loại bỏ bản ghi tạo nhầm hoặc không còn dùng. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Nhấn Xóa, hệ thống hiển thị popup “Yêu cầu xác nhận” trước khi thực hiện xóa. | Xóa ngay không có bước xác nhận. |
| AC2 | Chỉ cho phép xóa bảng giá mua ở trạng thái "Tạo mới"; các trạng thái khác (Đang hoạt động/Ngừng hoạt động/Hết hiệu lực) bị chặn xóa và thông báo. | Cho xóa bảng giá mua không ở trạng thái "Tạo mới". |
| AC3 | Xóa thành công: bản ghi bị khóa và ẩn khỏi danh sách bảng giá mua; hệ thống KHÔNG xóa hoàn toàn dữ liệu trong cơ sở dữ liệu (xóa mềm). | Xóa vật lý dữ liệu trong DB hoặc bản ghi vẫn hiển thị trong danh sách sau khi xóa. |
| AC4 | Thao tác xóa được ghi vào lịch sử hoạt động. | Không ghi log thao tác xóa. |
| AC5 | Action Xóa chỉ hiển thị khi người dùng có quyền Xóa bảng giá mua. | Người dùng không có quyền Xóa vẫn thấy/dùng được action. |

#### *User story 6: Kích hoạt bảng giá mua & vòng đời trạng thái*

| ID US | US\_BGM\_06 |
| :---- | :---- |
| **Tên Story** | Kích hoạt bảng giá mua và điều hành máy trạng thái |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn kích hoạt bảng giá mua và hệ thống quản lý đúng vòng đời trạng thái, để đảm bảo tại mỗi thời điểm mỗi nhà thầu chỉ có 1 bảng giá đang hoạt động. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Trạng thái bảng giá mua gồm: Tạo mới, Đang hoạt động, Ngừng hoạt động, Hết hiệu lực. | Thiếu/sai danh sách trạng thái. |
| AC2 | Chức năng "Kích hoạt" chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới" hoặc "Ngừng hoạt động". | Cho kích hoạt bảng giá mua ở trạng thái khác. |
| AC3 | Khi kích hoạt bảng giá mua (ở "Tạo mới" hoặc "Ngừng hoạt động"): hệ thống kiểm tra trạng thái Nhà thầu phụ trách trước; nếu nhà thầu ≠ "Đang hoạt động" thì chặn kích hoạt và thông báo "Nhà thầu phụ trách đang không hoạt động, vui lòng kiểm tra lại Nhà thầu phụ trách". | Cho kích hoạt khi nhà thầu không hoạt động. |
| AC4 | Riêng khi kích hoạt bảng giá mua ở trạng thái "Tạo mới" và Có  liên kết hợp đồng khung: sau khi kiểm tra Nhà thầu phụ trách hợp lệ (AC3), hệ thống kiểm tra tiếp: Thời điểm kích hoạt (ngày kích hoạt) ≥ Ngày hiệu lực và ≤ Ngày hết hiệu lực của hợp đồng khung liên kết.  Nếu đạt → cho phép kích hoạt; nếu không đạt → chặn kích hoạt và thông báo. Bảng giá mua không liên kết hợp đồng thì bỏ qua ràng buộc này. | Kiểm tra ngày hiệu lực hợp đồng trước cả bước kiểm tra nhà thầu; hoặc cho kích hoạt khi Thời điểm kích hoạt \< Ngày hiệu lực hợp đồng. |
| AC5 | Khi kích hoạt (nhà thầu hợp lệ): hệ thống kiểm tra bảng giá mua khác cùng nhà thầu đang "Đang hoạt động". Nếu có → hiển thị Popup xác nhận nếu tiếp tục kích hoạt, bảng giá mua còn lại sẽ chuyển "Ngừng hoạt động". Nếu không có bảng giá mua nào khác cùng nhà thầu đang hoạt động → chuyển trạng thái và thông báo thành công. | Không cảnh báo/không yêu cầu xác nhận. |
| AC6 | Nếu người dùng xác nhận tiếp tục kích hoạt: bảng giá mua được kích hoạt → chuyển trạng thái "Đang hoạt động"; bảng giá mua khác có cùng nhà thầu & đang hoạt động → chuyển trạng thái "Ngừng hoạt động".  Nếu người dùng không xác nhận: Hủy bỏ kích hoạt và giữ nguyên trạng thái của các bảng giá r mua. | Sau kích hoạt vẫn tồn tại \>1 bảng giá mua cùng nhà thầu "Đang hoạt động". |
| AC7 | Tạo mới / Đang hoạt động / Ngừng hoạt động → Hết hiệu lực: Hệ thống tự động chuyển khi qua Ngày hết hiệu lực. | Không tự chuyển "Hết hiệu lực" khi qua hạn. |
| AC8 | Nút "Kích hoạt" chỉ hiển thị khi người dùng có quyền Kích hoạt bảng giá mua. | Người dùng không có quyền Kích hoạt vẫn thấy/dùng được nút. |
| AC9 | Kích hoạt thành công bảng giá mua ở trạng thái "Tạo mới": hệ thống tự cập nhật Ngày hiệu lực của bảng giá mua \= Ngày kích hoạt. Chỉ áp dụng khi kích hoạt từ "Tạo mới"; kích hoạt lại từ "Ngừng hoạt động" giữ nguyên Ngày hiệu lực đã có. | Sau khi kích hoạt bảng "Tạo mới", Ngày hiệu lực không được cập nhật \= Ngày kích hoạt; hoặc reset Ngày hiệu lực khi kích hoạt lại bảng "Ngừng hoạt động". |

#### *User story 7: Cập nhật bảng giá*

| ID US | US\_BGM\_07 |
| :---- | :---- |
| **Tên Story** | Thêm/xóa dòng giá và sửa đơn giá trên bảng giá mua đã tồn tại |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn cập nhật bảng giá (thêm/xóa dòng giá, sửa đơn giá) trên một bảng giá mua đã tồn tại, để điều chỉnh chi tiết giá mà không thay đổi thông tin chung. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Màn Chi tiết bảng giá mua có nút "Cập nhật bảng giá"; nút hiển thị khi bảng giá mua ở "Tạo mới", "Đang hoạt động" hoặc "Ngừng hoạt động", ẩn khi "Hết hiệu lực" (BR21). | Hiển thị nút với bảng giá mua "Hết hiệu lực"; thiếu nút ở các trạng thái còn lại. |
| AC2 | Nút "Cập nhật bảng giá" chỉ hiển thị khi người dùng có quyền Cập nhật bảng giá mua (BR27). | Người dùng không có quyền Cập nhật vẫn thấy/dùng được nút. |
| AC3 | Màn "Cập nhật bảng giá": section Thông tin chung ở chế độ chỉ đọc (disable, nhãn "Thông tin chung (Chỉ đọc)"); không cho sửa Thông tin chung tại màn này. | Cho sửa Thông tin chung tại màn Cập nhật bảng giá. |
| AC4 | Đầu mục giá bị tắt kích hoạt (bật/tắt kích hoạt trong Cấu hình đầu mục giá) bị ẩn & khóa, không thể thiết lập các dòng giá trong đầu mục giá. Đầu mục giá có Loại giá \= “Phát sinh” không được thiết lập dòng giá trong đầu mục (ẩn hiển thị và chặn thiết lập)  ID, Tên đầu mục giá, Loại giá | Vẫn hiển thị các đầu mục giá bị tắt kích hoạt Vẫn hiển thị các đầu mục giá “Phát sinh” |
| AC5 | Phần dòng giá cho thao tác trên cả 5 phân hệ: thêm dòng giá đơn lẻ (US\_BGM\_08), thêm bảng giá dịch vụ/tạo hàng loạt (US\_BGM\_09), sửa đơn giá inline (US\_BGM\_10), xóa dòng giá (US\_BGM\_11). | Thiếu một trong các thao tác thêm đơn lẻ/hàng loạt/sửa đơn giá/xóa. |
| AC6 | Áp dụng khóa đồng thời (pessimistic lock): khi 1 user đang cập nhật bảng giá, user khác không được sửa đồng thời (BR22). | Hai user cùng sửa và cùng lưu gây ghi đè. |
| AC7 | Thao tác Cập nhật bảng giá KHÔNG làm thay đổi trạng thái bảng giá mua; bảng giá giữ nguyên trạng thái hiện tại (Tạo mới / Đang hoạt động / Ngừng hoạt động). | Cập nhật bảng giá làm đổi trạng thái bảng giá mua. |
| AC8 | Nút "Lưu thông tin" persist toàn bộ thay đổi dòng giá theo cơ chế atomic (BR23), ghi lịch sử hoạt động với hành động "Cập nhật" (lưu before/after theo BR10) và thông báo "Lưu bảng giá thành công"; "Hủy bỏ" không lưu bất kỳ thay đổi nào. | Lưu một phần; Hủy bỏ vẫn lưu; không ghi lịch sử thao tác cập nhật. |

#### *User story 8: Thêm 1 dòng giá trong đầu mục giá*

| ID US | US\_BGM\_08 |
| :---- | :---- |
| **Tên Story** | Thêm 1 dòng giá trong đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn thêm một dòng giá đơn lẻ vào một đầu mục giá, để bổ sung chính xác từng dòng giá theo thuộc tính của phân hệ. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Trong 1 đầu mục giá, nhấn "Thêm dòng giá mới" mở dialog nhập 1 dòng giá. | Không mở được dialog. |
| AC2 | Dialog gồm các thuộc tính đặc thù theo phân hệ (xem 3.1.2) và các trường chung: Đơn vị tính, Đơn giá. | Thiếu trường thuộc tính đặc thù hoặc trường chung. |
| AC3 | Tất cả trường trong dialog bắt buộc; thiếu bất kỳ trường nào → chặn thêm và báo lỗi. Các trường thuộc tính (theo loại dich vụ)  Cho phép chọn nhiều giá trị,  Nếu chọn giá trị “Tất cả” hệ thống disable các lựa chọn còn lại Nếu chọn ít nhất 1 giá trị cụ thể ≠ “Tất cả”, hệ thống disable lựa chọn “Tất cả” | Cho thêm khi thiếu trường bắt buộc. |
| AC4 | Đối với riêng dịch vụ kho, khi thêm mới giá trong đầu mục giá, trường Loại kho chỉ hiển thị danh sách Loại kho đã cấu hình (danh sách Loại kho được cấu hình theo đầu mục giá trong Cấu hình đầu mục giá). | Thêm mới dòng giá được chọn Loại kho ngoài danh sách Loại kho đã cấu hình cho đầu mục giá. |
| AC5 | Không hiển thị trường Trạng thái dòng giá trên dialog; khi tạo mới dòng giá, hệ thống mặc định trạng thái "Đã phê duyệt". | Hiển thị/cho chọn trạng thái dòng giá trên dialog; hoặc dòng mới không mặc định "Đã phê duyệt". |
| AC6 | Trước khi thêm vào danh sách, hệ thống kiểm tra trùng: nếu bộ thuộc tính \+ Đơn vị tính của dòng mới trùng với một dòng giá đã có trong CÙNG đầu mục giá → chặn thêm và báo lỗi trùng. | Cho thêm dòng trùng bộ thuộc tính \+ Đơn vị tính trong cùng đầu mục giá. |
| AC7 | Khi kiểm tra trùng, giá trị "Tất cả" của một thuộc tính được coi là bao trùm mọi giá trị cụ thể của thuộc tính đó (BR32): nếu các thuộc tính còn lại \+ Đơn vị tính trùng một dòng đã có và thuộc tính khác biệt mang giá trị "Tất cả" → ghi nhận trùng, chặn thêm và báo lỗi tạo dòng giá không thành công. | Cho thêm dòng chọn "Tất cả" trùng lặp với dòng có giá trị cụ thể đã tồn tại. |
| AC8 | Riêng phân hệ Vận tải: nhập riêng "Điểm đi" và "Điểm đến"; khi tạo thành công hiển thị gộp thành 1 cột "Điểm đi \- Điểm đến" dạng "\[Điểm đi\] \- \[Điểm đến\]". Nếu chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến" → hệ thống disable trường còn lại; khi tạo thành công cột "Điểm đi \- Điểm đến" ghi nhận giá trị "Tất cả" (BR33). | Không gộp cột "Điểm đi \- Điểm đến"; chọn "Tất cả" một trường vẫn cho nhập trường còn lại; cột gộp ghi sai giá trị. |
| AC9 | ID dòng giá do hệ thống tự sinh theo cấu trúc: \[Mã bảng giá mua\]-NNNN trong đó NNNN là số thứ tự sinh ra (tăng dần); người dùng không nhập. Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị NNNN. | Cho người dùng nhập/sửa ID dòng giá. ID giá sai cấu trúc. ID dòng giá hiển thị full trên giao diện \[Mã bảng giá mua\]-NNNN  |
| AC10 | Dòng giá vừa thêm được hiển thị ở trên cùng trong danh sách đầu mục giá và chỉ cập nhật vào danh sách tạm; chỉ được persist khi bấm "Lưu thông tin". | Dòng giá được lưu ngay khi chưa bấm "Lưu thông tin". |

#### *User story 9: Thêm nhiều dòng giá trong đầu mục giá*

| ID US | US\_BGM\_09 |
| :---- | :---- |
| **Tên Story** | Thêm nhiều dòng giá trong đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn tạo nhanh hàng loạt dòng giá theo tổ hợp thuộc tính trong một đầu mục giá, để thiết lập nhiều dòng giá cùng lúc thay vì nhập từng dòng. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Trong 1 đầu mục giá, nhấn "Thêm bảng giá dịch vụ" mở dialog "Tạo nhanh hàng loạt". | Không mở được dialog. |
| AC2 | Trường "Đầu mục giá" mặc định \= đầu mục chứa nút “Thêm bảng giá dịch vụ”, bắt buộc và disable; chỉ tạo các dòng giá trong 1 đầu mục giá từ 1 loại dịch vụ (lấy theo tab đang được tạo dòng giá). | Cho đổi đầu mục giá / tạo xuyên đầu mục hoặc phân hệ / null Đầu mục giá. |
| AC3 | Các thuộc tính phân hệ cho chọn nhiều giá trị, trừ khi chọn “Tất cả” \- disable các checkbox còn lại. | Không cho chọn nhiều giá trị. Chọn tất cả vẫn chọn được các checkbox giá trị khác |
| AC4 | Đơn vị tính chỉ chọn một giá trị  Đơn giá đại diện nhập tay giá tiền. Khi tạo thành công giá, các trường này được áp dụng chung cho các dòng giá được thêm vào danh sách thiết lập.  Không cho chọn trường Trạng thái; mọi dòng sinh ra mặc định trạng thái "Đã phê duyệt". | Cho chọn nhiều với Đơn vị tính/Đơn giá đại diện; hoặc hiển thị/cho chọn Trạng thái; hoặc dòng sinh ra không mặc định "Đã phê duyệt". Áp sai đơn giá/đơn vị tính/trạng thái. |
| AC5 | Tất cả trường bắt buộc; enum có giá trị "Tất cả" được coi là đã điền hợp lệ. | Cho sinh khi thiếu trường; không chấp nhận "Tất cả". |
| AC6 | Hệ thống sinh dòng giá theo tổ hợp đầy đủ (Cartesian) mọi giá trị đã chọn của các thuộc tính; Hệ thống hiển thị số lượng dòng được tạo ra khi nhập đầy đủ các trường thông tin (Bỏ qua không đếm các trường hợp vi phạm ràng buộc như trùng điểm đi, điểm đến của dịch vụ vận tải). | Sinh thiếu/thừa tổ hợp; không có xem trước. |
| AC7 | Riêng phân hệ Vận tải:  Dòng sinh ra gộp "Điểm đi" và "Điểm đến" thành 1 cột "Điểm đi \- Điểm đến" dạng "\[Điểm đi\] \- \[Điểm đến\]". Nếu chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến" → hệ thống disable trường còn lại; dòng sinh ra ghi nhận cột "Điểm đi \- Điểm đến" \= "Tất cả" (BR33). | Sinh dòng giá có Điểm đi trùng Điểm đến; không gộp cột "Điểm đi \- Điểm đến". Chọn "Tất cả" một trường vẫn cho chọn giá trị ở trường còn lại; cột gộp ghi sai giá trị. |
| AC8 | Khi nhấn tạo, hệ thống kiểm tra các dòng giá không hợp lệ và bỏ qua (không tạo dòng giá hoặc ghi đè dòng giá sẵn có):  Trùng điểm đi, điểm đến (với dịch vụ vận tải);  Trùng với bản ghi đã tạo (trùng bộ thuộc tính đặc thù \+ Đơn vị tính với dòng đã có trong CÙNG đầu mục giá)  \=\> Hiện thông báo số dòng giá bị trùng Giá trị "Tất cả" được coi là bao trùm mọi giá trị cụ thể của thuộc tính khi so trùng (BR32). | Tạo dòng trùng bộ thuộc tính \+ Đơn vị tính trong cùng đầu mục giá; hoặc không lược bỏ dòng "Tất cả" bao trùm giá trị cụ thể đã có. |
| AC9 | Dòng giá sinh ra chỉ cập nhật vào danh sách tạm và hiển thị lên trên cùng trong đầu mục giá; chỉ persist khi bấm "Lưu thông tin". | Dòng giá được lưu ngay khi chưa bấm "Lưu thông tin". |
| AC10 | ID dòng giá do hệ thống tự sinh theo cấu trúc: \[Mã bảng giá mua\]-NNNN trong đó NNNN là số thứ tự sinh ra (tăng dần); người dùng không nhập. Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị NNNN. | Cho người dùng nhập/sửa ID dòng giá. ID giá sai cấu trúc. ID dòng giá hiển thị full trên giao diện \[Mã bảng giá mua\]-NNNN  |

#### *User story 10: Chỉnh sửa đơn giá*

| ID US | US\_BGM\_10 |
| :---- | :---- |
| **Tên Story** | Chỉnh sửa đơn giá của dòng giá (inline) |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn sửa đơn giá của dòng giá ngay trên danh sách, để điều chỉnh giá mà không phải xóa và tạo lại dòng. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Cho sửa Đơn giá của dòng giá ngay trên danh sách (inline). | Không cho sửa đơn giá inline. |
| AC2 | KHÔNG hỗ trợ chỉnh sửa các thuộc tính khác của dòng giá (thuộc tính đặc thù, Đơn vị tính, Trạng thái); muốn đổi thuộc tính khác phải xóa và tạo lại dòng giá. | Cho sửa thuộc tính ngoài Đơn giá.  |
| AC3 | Sửa đơn giá dòng đang được tham chiếu hạ nguồn (định mức mua/bán, Chi phí dịch vụ), lưu chỉnh sửa → cho phép:  trạng thái dòng giá chuyển thành “Chờ phê duyệt”. Dòng "Chờ phê duyệt" **KHÔNG** còn là nguồn hợp lệ cho giá mua/bán định mức (theo BR4/BR5 — SRS Giá mua định mức) — tổ hợp tương ứng tạm thời **biến mất khỏi màn định mức** cho tới khi dòng giá được phê duyệt.  *(Luồng phê duyệt bảng giá mua chưa triển khai, tạm thời luồng trạng thái dừng ở đây)* | Chặn sửa hoặc không cập nhật hạ nguồn theo giá mới; hoặc không hiển thị icon cảnh báo/tooltip tại Bảng giá mua định mức khi sửa đơn giá dòng "Đã phê duyệt". |
| AC4 | Thay đổi đơn giá chỉ cập nhật vào danh sách tạm; chỉ persist khi bấm "Lưu thông tin". | Thay đổi đơn giá được lưu ngay khi chưa bấm "Lưu thông tin". |

#### *User story 11: Xóa dòng giá*

| ID US | US\_BGM\_11 |
| :---- | :---- |
| **Tên Story** | Xóa một dòng giá khỏi đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xóa một dòng giá khỏi đầu mục giá, để loại bỏ dòng giá sai/không dùng hoặc phục vụ tạo lại khi cần đổi thuộc tính. (Dùng chung cho Thêm mới bảng giá mua và Cập nhật bảng giá.) |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | :---- | :---- |
| AC1 | Mỗi dòng giá trong danh sách có action Xóa. | Thiếu action Xóa. |
| AC2 | Xóa thành công, tại Bảng giá mua định mức, xóa dòng giá nhà thầu tham chiếu và dòng giá định mức hiển thị icon cảnh báo kèm tooltip "Đã có điều chỉnh đơn giá nhà thầu" | Xóa dòng đang tham chiếu mà không hiển thị icon cảnh báo. |
| AC3 | Thao tác xóa dòng giá chỉ cập nhật vào danh sách tạm; chỉ persist khi bấm "Lưu thông tin". | Xóa được lưu ngay khi chưa bấm "Lưu thông tin". |

#### *Use story 12: Xem chi tiết lịch sử cập nhật (before/after)*

| ID US | US\_BGM\_12 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết thay đổi trước/sau của một bản ghi lịch sử |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem chi tiết giá trị trước/sau của một thao tác Cập nhật, để truy vết chính xác nội dung đã thay đổi. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Mỗi bản ghi lịch sử có Hành động là “Cập nhật Bảng giá mua” và “Phê duyệt bảng giá mua” có action "Xem chi tiết" mở popup so sánh giá trị Trước (before) và Sau (after). | Không mở được popup hoặc thiếu dữ liệu before/after. |
| AC2 | Popup hiển thị: Thông tin chung: Thời gian, Người thực hiện Thông tin bản ghi trước thay đổi (before) và sau thay đổi (after): Thông tin chung, 5 tab phân hệ theo loại dịch vụ và danh sách dòng giá theo đầu mục trong từng tab. | Hiển thị sai giá trị hoặc thiếu trường thông tin.  Không hiển thị đầy đủ cả 2 bản ghi trước và sau thay đổi. |

### **3.1.2 Mô tả giao diện (Reviewing)**

* Ảnh giao diện: \[Chèn ảnh màn hình Danh sách / Chi tiết / Thêm mới / Chỉnh sửa thông tin chung / Cập nhật bảng giá / dialog dòng giá\]

* Link UI Design: \[Chèn link\]

* Màn hình chính: Danh sách bảng giá mua; Chi tiết (thông tin chung \+ 5 tab dòng giá \+ lịch sử); Thêm mới bảng giá mua; Chỉnh sửa thông tin chung; Cập nhật bảng giá; các dialog cấu hình dòng giá (thêm đơn lẻ / tạo hàng loạt).

**Bảng trường dữ liệu — Form "Chỉnh sửa thông tin chung / Thêm bảng giá mua" (section Thông tin chung):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tên bảng giá mua | v | Text | — | (Trống) | Tên định danh bảng giá mua; chặn trùng tên khi tạo |
| Nhà thầu phụ trách | v | Select (nhà thầu) | — | (Trống) | Chọn từ danh mục nhà thầu; ràng buộc mỗi nhà thầu chỉ 1 bảng giá mua Đang hoạt động |
| Ngày hiệu lực | v | Date | — | (Trống) | Ngày bắt đầu áp dụng |
| Ngày hết hiệu lực | v | Date | — | (Trống) | Ngày kết thúc áp dụng; phải ≥ Ngày hiệu lực |
| Tiền tệ | v | Select (enum) | — | VND | Đơn vị tiền tệ áp dụng chung cho toàn bộ dòng giá của bảng giá; chỉ chọn 1 giá trị, không cho phép nhiều đơn vị tiền tệ trong 1 bảng giá; enum cố định Chọn từ danh sách cố định: VND, CNY, USD |
| Mã hợp đồng (ID hợp đồng) | — | Pointer (chỉ đọc) | — | (Tự điền) | Tự điền theo nhà thầu phụ trách |
| Tên hợp đồng | — | Text (chỉ đọc) | — | (Tự điền) | Tự điền theo Mã hợp đồng |
| Ghi chú bổ sung | — | Text | — | (Trống) | Ghi chú thêm cho bảng giá |

*Lưu ý: ID bảng giá mua do hệ thống tự sinh theo cấu trúc RSYYMM-NNN, không hiển thị để nhập trong form. Trường "Trạng thái áp dụng" không hiển thị trong form Chỉnh sửa thông tin chung (do máy trạng thái điều khiển — xem US\_BGM\_06). Ở màn "Cập nhật bảng giá" section Thông tin chung hiển thị chế độ chỉ đọc (disable).*

**Bảng trường dữ liệu — Dialog "Thêm/nhập dòng giá đơn lẻ" (Thêm mới dòng giá):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| Thuộc tính đặc thù phân hệ (các biến) | v | Select | (Trống) | Theo phân hệ (xem bảng cấu trúc cột 3.1.2); ví dụ Kho bãi: Tên kho, Loại kho |
| Đơn vị tính | v | Select (enum) | (Theo cấu hình) | Enum cố định từ cấu hình |
| Đơn giá | v | Number | (Trống) | Đơn giá của dòng giá |
| Trạng thái | v | Enum | Đã phê duyệt | Hệ thống mặc định "Đã phê duyệt"; không hiển thị/không cho chọn khi thêm dòng giá |

**Bảng trường dữ liệu — Dialog "Tạo nhanh hàng loạt" (Thêm bảng giá dịch vụ):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| Đầu mục giá | v | Select (chỉ đọc) | (Đầu mục chứa nút) | Mặc định \= đầu mục giá chứa nút "Thêm bảng giá dịch vụ"; disable |
| Thuộc tính phân hệ (multi-select) (các biến) | v | Multi-select (enum) | (Trống) | Chọn nhiều giá trị để sinh tổ hợp; enum có giá trị "Tất cả"; riêng "Tên kho" là dropdown cho chọn nhiều giá trị |
| Đơn vị tính | v | Select (enum) | (Theo cấu hình) | Chọn đơn, áp chung mọi dòng sinh ra |
| Đơn giá đại diện | v | Number | (Trống) | Đơn giá áp cho toàn bộ dòng giá sinh ra (đơn giá cuối, không tính toán thêm) |
| Trạng thái | v | Enum | Đã phê duyệt | Hệ thống mặc định "Đã phê duyệt"; không hiển thị/không cho chọn, áp chung mọi dòng |

*Ghi chú: Dialog "Chỉnh sửa dòng giá đơn lẻ" giữ tên trường "Đơn giá"; chỉ dialog "Tạo nhanh hàng loạt" dùng tên "Đơn giá đại diện". Cột trong danh sách dòng giá luôn hiển thị tên "Đơn giá".*

**Cấu trúc cột danh sách dòng giá theo từng phân hệ (nhóm theo đầu mục giá):**

| Phân hệ | Cột đặc thù | Cột chung |
| :---- | :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Loại xe | Đơn vị tính, Đơn giá, Trạng thái |
| (2) Kho bãi | Tên kho, Loại kho | Đơn vị tính, Đơn giá, Trạng thái |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Đơn giá, Trạng thái |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Đơn giá, Trạng thái |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa | Đơn vị tính, Đơn giá, Trạng thái |

*Ghi chú (Vận tải): trên form tạo dòng giá, "Điểm đi" và "Điểm đến" là 2 trường nhập riêng; trong danh sách dòng giá của bảng giá, hai trường được hiển thị gộp thành 1 cột "Điểm đi \- Điểm đến" dạng "\[Điểm đi\] \- \[Điểm đến\]". Khi chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến", hệ thống disable trường còn lại và cột gộp ghi nhận giá trị "Tất cả" (xem BR33). Ngoài ra, mỗi thuộc tính có thể nhận giá trị "Tất cả" theo BR32.*

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

| ID | Quy tắc |
| ----- | :---- |
| BR1 | Mỗi bảng giá mua gắn đúng 1 nhà thầu phụ trách và 1 hợp đồng khung; quan hệ bảng giá mua–hợp đồng là 1-1. |
| BR2 | Tại mỗi thời điểm, mỗi nhà thầu chỉ được có 1 bảng giá mua ở trạng thái "Đang hoạt động" — đảm bảo qua cơ chế kích hoạt: khi kích hoạt 1 bảng giá mua, bảng giá mua khác cùng nhà thầu đang "Đang hoạt động" tự động chuyển "Ngừng hoạt động" (sau khi người dùng xác nhận). |
| BR3 | Trạng thái bảng giá mua: Tạo mới, Đang hoạt động, Ngừng hoạt động, Hết hiệu lực. Chuyển trạng thái (xem US\_BGM\_06): Tạo mới/Ngừng hoạt động → Đang hoạt động qua chức năng "Kích hoạt"; Đang hoạt động → Ngừng hoạt động khi 1 bảng giá mua khác cùng nhà thầu được kích hoạt; mọi trạng thái → Hết hiệu lực tự động khi qua Ngày hết hiệu lực. |
| BR4 | Chức năng "Kích hoạt" chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới" hoặc "Ngừng hoạt động". |
| BR5 | Khi kích hoạt bảng giá mua (ở "Tạo mới" hoặc "Ngừng hoạt động"), hệ thống kiểm tra trạng thái Nhà thầu phụ trách; chỉ cho kích hoạt khi nhà thầu "Đang hoạt động", ngược lại chặn và cảnh báo. |
| BR6 | Menu này KHÔNG áp dụng luồng phê duyệt bảng giá mua trong giai đoạn hiện tại. |
| BR7 | Màn chi tiết luôn hiển thị đủ 5 tab phân hệ; phân hệ không có giá hiển thị bảng trống. Không bắt buộc bảng giá mua đủ cả 5 phân hệ. |
| BR8 | Dòng giá (con) bắt buộc thuộc 1 đầu mục giá (cha) lấy từ menu "Cấu hình đầu mục giá"; không thể tạo dòng giá ngoài đầu mục giá. |
| BR9 | Cấu trúc cột dòng giá phụ thuộc phân hệ (xem 3.1.2). |
| BR10 | Trạng thái dòng giá: xem BR18–BR20 (thêm/xóa/sửa đơn giá, tạo hàng loạt). |
| BR11 | Ngày hiệu lực phải nhỏ hơn hoặc bằng Ngày hết hiệu lực. |
| BR13 | Chức năng "Chỉnh sửa thông tin chung" chỉ áp dụng cho bảng giá mua ở trạng thái "Tạo mới"; chỉ sửa các trường trong section Thông tin chung (không sửa dòng giá, không hiển thị trường "Trạng thái áp dụng"). Các trạng thái khác ẩn nút và chặn chỉnh sửa. |
| BR14 | Chỉ được phép xóa bảng giá mua ở trạng thái "Tạo mới". |
| BR15 | Chỉ dòng giá có trạng thái "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" mới được tham chiếu (động) tại Bảng giá mua định mức, Bảng giá bán định mức và Chi phí dịch vụ. |
| BR16 | Mọi thao tác Thêm/Cập nhật/Kích hoạt/Xóa được ghi vào Lịch sử hoạt động (Thời gian, Người thực hiện, Hành động, Nội dung). Riêng thao tác tạo mới bảng giá thành công ghi log với hành động "Khởi tạo bảng giá". |
| BR17 | Checkbox chọn nhiều ở màn danh sách phục vụ chức năng xuất dữ liệu (bulk export). |
| BR18 | Cấu hình dòng giá (thêm đơn lẻ, thêm hàng loạt, xóa, sửa đơn giá) thuộc phạm vi "Thêm mới bảng giá mua" và "Cập nhật bảng giá". KHÔNG hỗ trợ chỉnh sửa toàn bộ thuộc tính của một dòng giá; chỉ sửa Đơn giá (inline). Muốn đổi thuộc tính khác phải xóa và tạo lại dòng. |
| BR19 | Tạo hàng loạt ("Thêm bảng giá dịch vụ") sinh dòng giá theo tổ hợp đầy đủ (Cartesian) các giá trị đã chọn của các thuộc tính (theo loại dịch vụ);  Áp Đơn giá \= "Đơn giá đại diện", cùng Đơn vị tính đã chọn và mặc định trạng thái \= "Đã phê duyệt".  Các dòng giá chỉ thuộc 1 đầu mục giá (trường "Đầu mục giá" mặc định \= đầu mục chứa nút, disable);  Ràng buộc: bắt buộc điền mọi trường thông tin, các trường thuộc tính (danh sách trường tùy theo loại dịch vụ) được chọn nhiều giá trị; enum có giá trị "Tất cả" (coi là đã điền).  |
| BR20 | Trạng thái dòng giá: mặc định "Đã phê duyệt", độc lập với trạng thái bảng giá mua. Trong phase này chưa triển khai chức năng phê duyệt giá nên mọi dòng giá được tạo đều mặc định ở trạng thái "Đã phê duyệt". |
| BR21 | Chức năng "Cập nhật bảng giá" áp dụng cho bảng giá mua ở "Tạo mới"/"Đang hoạt động"/"Ngừng hoạt động" (ẩn nút khi "Hết hiệu lực");  Trong màn Cập nhật bảng giá, section Thông tin chung ở chế độ chỉ đọc (disable). |
| BR22 | Khi 1 user đang "Chỉnh sửa thông tin chung" hoặc "Cập nhật bảng giá" một bảng giá mua, hệ thống áp dụng khóa bảng (pessimistic lock); user khác không được sửa đồng thời. |
| BR23 | Các dialog cấu hình dòng giá chỉ cập nhật danh sách tạm; toàn bộ thay đổi (thông tin chung \+ dòng giá) chỉ được lưu (atomic) khi bấm "Lưu thông tin". Cho phép lưu khi đầu mục/phân hệ chưa có dòng giá. |
| BR24 | Chặn trùng Tên bảng giá mua khi tạo mới. |
| BR25 | Sửa đơn giá & Phê duyệt dòng giá (mới) → Tại bảng giá mua định mức, hiển thị cảnh báo dòng giá tham chiếu và cập nhật giá mới Xóa dòng giá → Tại bảng giá mua định mức, / xóa dòng đơn giá mua theo nhà thầu   |
| BR26 | ID dòng giá do hệ thống tự sinh theo cấu trúc: \[Mã bảng giá mua\]-NNNN trong đó NNNN là số thứ tự sinh ra (tăng dần); người dùng không nhập.  Đầu mục giá bị tắt kích hoạt (trong Cấu hình đầu mục giá) sẽ bị ẩn ở màn Thêm mới/Cập nhật/Chi tiết Bảng giá mua & khóa, không được sử dụng ở các menu khác (bao gồm cả đầu mục và các dòng giá bên trong).  Chỉ thiết lập giá cho các Đầu mục giá có Loại giá \= {Cố định;Phụ phí}Đầu mục giá có Loại giá \= “Phát sinh” không được thiết lập dòng giá trong đầu mục (ẩn hiển thị và chặn thiết lập) Hiển thị ID dòng giá trong bảng giá mua: chỉ hiển thị NNNN. |
| BR27 | Mỗi chức năng Xem/Thêm/Sửa/Xóa/Kích hoạt được kiểm soát bằng phân quyền; nút/action/menu tương ứng chỉ hiển thị và thao tác được khi người dùng có quyền, ngược lại ẩn hoàn toàn và chặn sử dụng chức năng |
| BR28 | Khi thêm dòng giá (đơn lẻ hoặc hàng loạt) trong một đầu mục giá, hệ thống kiểm tra trùng theo tổ hợp (bộ thuộc tính đặc thù phân hệ \+ Đơn vị tính) với các dòng giá đã có trong CÙNG đầu mục giá; dòng trùng bị chặn (thêm đơn lẻ) hoặc bị lược bỏ (tạo hàng loạt), không tạo bản ghi trùng. |
| BR29 | Riêng phân hệ Vận tải, khi sinh tổ hợp hàng loạt, "Điểm đi" luôn phải khác "Điểm đến"; mọi tổ hợp có Điểm đi trùng Điểm đến bị lược bỏ, không tạo dòng giá. |
| BR30 | ID bảng giá mua do hệ thống tự sinh theo cấu trúc RSYYMM-NNN (RS \= ratesheet, YYMM \= năm/tháng tạo, NNN= số thứ tự trong tháng tạo, bắt đầu từ 001; ví dụ RS260804-001); người dùng không nhập/sửa. |
| BR31 | Xóa bảng giá mua là xóa mềm (soft delete): bản ghi bị khóa và ẩn khỏi danh sách, KHÔNG xóa vật lý khỏi cơ sở dữ liệu; chỉ áp dụng cho bảng giá mua ở "Tạo mới" (BR14). |
| BR32 | Một thuộc tính của dòng giá có thể nhận giá trị đặc biệt "Tất cả" (áp dụng cho mọi giá trị của thuộc tính đó). Giá trị "Tất cả" tuân theo 2 quy tắc:  (a) LỌC — khi lọc danh sách dòng giá theo một thuộc tính, kết quả bao gồm các dòng có giá trị đúng bộ lọc VÀ các dòng có giá trị "Tất cả" ở thuộc tính đó (dòng "Tất cả" luôn khớp mọi bộ lọc của thuộc tính tương ứng);  (b) CHỐNG TRÙNG — khi kiểm tra trùng dòng giá (BR28), "Tất cả" của một thuộc tính được coi là bao trùm mọi giá trị cụ thể của thuộc tính đó: nếu các thuộc tính còn lại \+ Đơn vị tính trùng một dòng đã có trong cùng đầu mục giá và thuộc tính khác biệt mang giá trị "Tất cả" (bao trùm giá trị cụ thể của dòng đã có) → ghi nhận trùng; đơn lẻ bị chặn, hàng loạt bị lược bỏ.  |
| BR33 | Riêng phân hệ Vận tải: "Điểm đi" và "Điểm đến" được nhập riêng trên form tạo dòng giá; khi tạo thành công, hệ thống gộp thành 1 cột "Điểm đi \- Điểm đến" trong bảng giá với định dạng "\[Điểm đi\] \- \[Điểm đến\]". Nếu chọn "Tất cả" ở "Điểm đi" hoặc "Điểm đến" → hệ thống disable trường còn lại; khi tạo thành công, cột "Điểm đi \- Điểm đến" ghi nhận giá trị "Tất cả". |
| BR34 | Ràng buộc ngày theo hợp đồng khung liên kết (kiểm tra khi Lưu): Ngày hiệu lực của bảng giá mua phải ≥ Ngày hiệu lực của hợp đồng khung liên kết.  |
| BR35 | Ràng buộc ngày theo hợp đồng khung liên kết (kiểm tra khi Lưu): Ngày hết hiệu lực của bảng giá mua phải ≤ Ngày hết hiệu lực của hợp đồng khung liên kết.  |
| BR36 | Cảnh báo sắp hết hiệu lực: trước Ngày hết hiệu lực của bảng giá mua 10 ngày / 5 ngày / 1 ngày, hệ thống hiển thị cảnh báo nhắc người dùng bảng giá sắp hết hiệu lực (để kịp kích hoạt bảng giá thay thế).  |
| BR37 | Tiền tệ là thuộc tính chung của bảng giá mua, được thiết lập tại section Thông tin chung; toàn bộ dòng giá của bảng giá dùng chung 1 loại tiền tệ. Dòng giá KHÔNG có trường Tiền tệ riêng. |
| BR38 | Khi kích hoạt bảng giá mua (thủ công) ở trạng thái "Tạo mới" và có liên kết hợp đồng khung: hệ thống kiểm tra Thời điểm kích hoạt (ngày kích hoạt) ≥ Ngày hiệu lực của hợp đồng khung; nếu không đạt thì chặn kích hoạt. Trình tự kiểm tra khi kích hoạt bảng "Tạo mới": (1) Nhà thầu phụ trách "Đang hoạt động" (BR5); (2) Thời điểm kích hoạt ≥ Ngày hiệu lực hợp đồng (BR38). Bảng giá mua không liên kết hợp đồng thì bỏ qua ràng buộc (2). |
| BR39 | Kích hoạt thành công bảng giá mua ở trạng thái "Tạo mới": hệ thống tự cập nhật Ngày hiệu lực của bảng giá mua \= Ngày kích hoạt. Quy tắc chỉ áp dụng khi kích hoạt từ "Tạo mới"; kích hoạt lại từ "Ngừng hoạt động" giữ nguyên Ngày hiệu lực đã có. |
| BR40 | Danh sách bảng giá mua mặc định sắp xếp theo Thời gian tạo (created time) giảm dần — bản ghi mới nhất ở trên cùng. Khi tạo mới bảng giá mua thành công, bản ghi mới luôn xuất hiện ở đầu danh sách. Người dùng vẫn có thể đổi sắp xếp theo Ngày hiệu lực / Ngày hết hiệu lực (US\_BGM\_01 AC2); khi không áp sắp xếp thủ công, danh sách trở về mặc định theo Thời gian tạo giảm dần. |

### **3.1.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Nhấn "Lưu"/"Thêm" khi thiếu trường bắt buộc | Lỗi | "Vui lòng nhập đầy đủ thông tin bắt buộc" | Không lưu/không thêm, giữ nguyên form |
| Ngày hiệu lực \> Ngày hết hiệu lực | Lỗi | "Ngày hiệu lực phải nhỏ hơn hoặc bằng ngày hết hiệu lực" | Không lưu |
| Kích hoạt bảng giá mua (Tạo mới/Ngừng hoạt động) khi Nhà thầu phụ trách không hoạt động | Lỗi | "Nhà thầu phụ trách đang không hoạt động, vui lòng kiểm tra lại Nhà thầu phụ trách" | Chặn kích hoạt |
| Kích hoạt bảng giá mua (Tạo mới) khi Thời điểm kích hoạt \< Ngày hiệu lực của hợp đồng liên kết | Lỗi | "Chưa đến ngày hiệu lực của hợp đồng, không thể kích hoạt bảng giá" | Chặn kích hoạt |
| Kích hoạt bảng giá mua khi có bảng giá mua khác cùng nhà thầu đang "Đang hoạt động" | Cảnh báo | "Kích hoạt bảng giá này đồng nghĩa với việc bảng giá \[Mã bảng giá\] \[Tên bảng giá\] đang áp dụng sẽ ngừng hoạt động, vẫn tiếp tục kích hoạt?" | Yêu cầu xác nhận; sau xác nhận: kích hoạt bảng giá mua \+ chuyển bảng giá mua kia sang "Ngừng hoạt động" |
| Kích hoạt bảng giá mua thành công (không có bảng giá mua trùng nhà thầu) | Thành công | "Kích hoạt bảng giá thành công" | Chuyển bảng giá mua sang "Đang hoạt động", ghi lịch sử |
| Thêm bảng giá mua thành công | Thành công | "Thêm bảng giá mua thành công" | Ghi lịch sử với hành động "Khởi tạo bảng giá", chuyển về màn hình chi tiết |
| Tạo mới bảng giá mua trùng Tên bảng giá mua | Lỗi | "Tên bảng giá mua đã tồn tại" | Không lưu |
| Lưu cấu hình dòng giá / Cập nhật bảng giá thành công | Thành công | "Lưu bảng giá thành công" | Persist dòng giá, ghi lịch sử |
| Tạo nhanh hàng loạt thiếu trường bắt buộc | Lỗi | "Vui lòng nhập đầy đủ thông tin bắt buộc" | Không sinh dòng giá |
| Thêm dòng giá đơn lẻ trùng thuộc tính \+ Đơn vị tính trong cùng đầu mục giá (kể cả khi trùng do giá trị "Tất cả" bao trùm giá trị cụ thể đã có) | Lỗi | "Dòng giá đã tồn tại trong đầu mục giá này (trùng thuộc tính và đơn vị tính)" | Không thêm dòng giá |
| Tạo hàng loạt phát sinh dòng trùng hoặc (Vận tải) Điểm đi trùng Điểm đến | Thông báo | "Một số dòng giá đã được bỏ qua do trùng hoặc do Điểm đi trùng Điểm đến" | Chỉ tạo các dòng hợp lệ, bỏ qua dòng trùng/không hợp lệ |
| Xóa dòng giá đang tham chiếu Chi phí dịch vụ | Cảnh báo | "Dòng giá đang được sử dụng trong Chi phí dịch vụ, bạn có chắc muốn xóa?" | Yêu cầu xác nhận trước khi xóa |
| Mở "Cập nhật bảng giá"/"Chỉnh sửa thông tin chung" đang bị user khác khóa | Cảnh báo | "Bảng giá đang được \[user\] chỉnh sửa, vui lòng thử lại sau" | Chặn mở màn chỉnh sửa |
| Chỉnh sửa thông tin chung thành công | Thành công | "Chỉnh sửa thông tin chung thành công" | Ghi lịch sử, trở về màn hình chi tiết |
| Nhấn Xóa bảng giá mua (trạng thái Tạo mới) | Cảnh báo | "Bạn có chắc muốn xóa bảng giá mua này?" | Yêu cầu xác nhận trước khi xóa |
| Xóa bảng giá mua thành công (Tạo mới) | Thành công | "Xóa bảng giá mua thành công" | Khóa & ẩn bản ghi khỏi danh sách (xóa mềm), ghi lịch sử |
| Chỉnh sửa thông tin chung bảng giá mua không ở trạng thái "Tạo mới" | Lỗi | "Chỉ được chỉnh sửa bảng giá mua ở trạng thái Tạo mới" | Ẩn nút / chặn chỉnh sửa |
| Xóa bảng giá mua không ở trạng thái "Tạo mới" | Lỗi | "Chỉ được xóa bảng giá mua ở trạng thái Tạo mới" | Chặn thao tác xóa |
| Người dùng không có quyền với chức năng tương ứng | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn nút/action và chặn thao tác Thêm/Xem/Sửa/Xóa/Kích hoạt |
| Lưu bảng giá mua khi Ngày hiệu lực \< Ngày hiệu lực của hợp đồng liên kết (có liên kết hợp đồng) | Lỗi | "Ngày hiệu lực phải lớn hơn hoặc bằng ngày hiệu lực của hợp đồng liên kết" | Không lưu, giữ nguyên form |
| Lưu bảng giá mua khi Ngày hết hiệu lực \> Ngày hết hiệu lực của hợp đồng liên kết (có liên kết hợp đồng) | Lỗi | "Ngày hết hiệu lực phải nhỏ hơn hoặc bằng ngày hết hiệu lực của hợp đồng liên kết" | Không lưu, giữ nguyên form |
| Bảng giá mua còn 10 / 5 / 1 ngày đến Ngày hết hiệu lực | Cảnh báo | "Bảng giá sắp hết hiệu lực (còn 10/5/1 ngày), vui lòng kiểm tra và gia hạn" | Hiển thị cảnh báo; không tự đổi trạng thái bảng giá |
| Thêm bảng giá dịch vụ (Tạo hàng loạt) trùng với dòng giá đã tạo | Lỗi | “Có \[Số lượng dòng giá trùng\] dòng giá đã trùng với dòng giá sẵn có.” | Không tạo các dòng giá đã trùng với dòng giá có sẵn |

### **3.1.5. Mô tả luồng dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Cấu hình đầu mục giá | Cung cấp đầu mục giá (cha) để gắn dòng giá | Đầu mục giá → bảng giá mua (dòng giá) | Khi hiển thị/tạo dòng giá | Đầu mục bị tắt kích hoạt → ẩn & khóa ở màn Thêm mới/Cập nhật/Chi tiết |
| Quản lý nhà thầu | Nguồn nhà thầu phụ trách; kiểm tra trạng thái khi kích hoạt | Nhà thầu → bảng giá mua | Khi chọn nhà thầu / kích hoạt bảng giá mua | Nhà thầu không "Đang hoạt động" → chặn kích hoạt bảng giá mua (Tạo mới/Ngừng hoạt động) |
| Quản lý hợp đồng | Liên kết hợp đồng khung | Hợp đồng → bảng giá mua | Khi chọn hợp đồng | Hợp đồng hết hạn: bảng giá mua không tự đổi trạng thái (cảnh báo hết hạn chưa triển khai trong phase này) |
| Bảng giá mua định mức | Tham chiếu dòng giá để thiết lập định mức mua | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) → định mức mua | Khi tạo/sửa định mức mua | Tham chiếu tự động dòng "Đã phê duyệt"; sửa đơn giá → cập nhật im lặng |
| Bảng giá bán định mức | Tham chiếu dòng giá để thiết lập định mức bán | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) → định mức bán | Khi tạo/sửa định mức bán | Tham chiếu tự động dòng "Đã phê duyệt"; sửa đơn giá → cập nhật im lặng |
| Chi phí dịch vụ | Tham chiếu dòng giá để ghi nhận chi phí dịch vụ | Dòng giá "Đã phê duyệt" (bảng giá mua Đang hoạt động) → chi phí dịch vụ | Khi phát sinh/ghi nhận chi phí | Xóa dòng đang tham chiếu → cảnh báo; tham chiếu động theo giá hiện hành |

### **3.1.6. Tích hợp & Đồng bộ dữ liệu**

# **4\. Đánh giá độ phủ rule (Case còn thiếu)**

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| :---- | :---- | :---- | :---- |
| Liên kết hợp đồng | Ngoài phạm vi phase này | Chưa định nghĩa nội dung/kênh cảnh báo khi hợp đồng hết hạn | Chuẩn hóa cảnh báo (banner \+ thông báo) và tần suất nhắc |
| Nhà thầu phụ trách | Đã chốt một phần (BR5) | Đã kiểm tra nhà thầu khi kích hoạt (Tạo mới/Ngừng hoạt động); chưa xử lý khi nhà thầu chấm dứt lúc bảng giá mua đang "Đang hoạt động" | Đồng bộ trạng thái nhà thầu → cảnh báo/treo bảng giá mua đang hoạt động liên quan |
| Xóa/chỉnh sửa dòng giá đang tham chiếu | Đã chốt một phần (BR25) | Mới cảnh báo khi xóa dòng tham chiếu Chi phí dịch vụ; chưa xử lý ràng buộc phía định mức | Cân nhắc cảnh báo/chặn/cập nhật giá mới khi xóa/sửa dòng đang tham chiếu tại bảng định mức giá mua/bán, bảng chi phí dịch vụ |
| Import/Export CSV dòng giá | Ngoài phạm vi (chỉ mô tả nút) | Quy tắc validate khi import (trùng ID, sai đầu mục, ghi đè/thêm mới) | Đặc tả ở phiên bản sau |
| Phân quyền | Đã chốt (BR27 \+ AC phân quyền từng US) | Chưa định nghĩa ma trận quyền chi tiết theo từng role cụ thể; chưa tách rõ quyền "Sửa" gồm Chỉnh sửa thông tin chung và Cập nhật bảng giá (dòng giá) | Xây ma trận Role × Chức năng (Xem / Thêm / Chỉnh sửa thông tin chung / Cập nhật bảng giá / Xóa / Kích hoạt); bổ sung quyền chỉ-xem cho các role liên quan |

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Cập nhật Chi tiết bảng giá mua: mỗi tab dịch vụ chứa các đầu mục. Mỗi đầu mục hiển thị đầy đủ: ID, Tên đầu mục giá, Loại giá  | Chi tiết bảng giá mua: mỗi tab dịch vụ chứa các đầu mục. Mỗi đầu mục hiển thị đầy đủ: ID, Tên đầu mục giá | 25/08/2026 | Hiển thị đầy đủ thông tin Đầu mục giá để người dùng dễ theo dõi, quản lý và nhập liệu |
| 2 | Cập nhật danh sách nhà thầu được chọn khi tạo / sửa bảng giá mua |  |  |  |

# So sánh SRS Giá mua đầu vào: Bản cũ (12.08) vs Bản mới (bản 8\)

- File cũ: `Bản sao của SRS_LogXPro_Giá mua đầu vào 23_39 12 tháng 8.docx`  
- File mới: `SRS_LogXPro_Giá mua đầu vào 8.docx`  
- Phương pháp: trích xuất toàn bộ paragraph \+ bảng của cả 2 file (python-docx), đối chiếu 1-1 theo thứ tự; đối chiếu thêm số lượng paragraph/table/heading/hình ảnh để đảm bảo không sót thay đổi cấu trúc.  
- Kết quả cấu trúc: 84 paragraph, 34 bảng, 25 heading, 0 hình ảnh — khớp tuyệt đối giữa 2 bản (không thêm/bớt user story, business rule hay section nào). Không có tracked changes/comment trong 2 file gốc.  
- Kết quả nội dung: **4 cập nhật**, đều là chỉnh sửa trong nội dung ô bảng (AC/BR), không có thay đổi định dạng (2 bản đã đồng nhất định dạng in nghiêng tiêu đề User story, không còn khác biệt).

## Bảng cập nhật

| STT | Nội dung cập nhật | Vị trí trong bản mới | Bản cũ | Bản mới |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Đổi thuật ngữ nhãn trường log lịch sử hoạt động: "Người thao tác" → "Người thực hiện" | Mục 3.1.1 – User story 2: Xem chi tiết bảng giá mua & dòng giá 5 phân hệ, bảng AC, **AC8** | Lịch sử hoạt động hiển thị: Thời gian, **Người thao tác**, Hành động, Nội dung; | Lịch sử hoạt động hiển thị: Thời gian, **Người thực hiện**, Hành động, Nội dung; |
| 2 | Bổ sung rule liên thông trạng thái "Chờ phê duyệt" của dòng giá với màn Giá mua/bán định mức khi sửa đơn giá dòng đang được tham chiếu hạ nguồn; viết lại rõ hơn điều kiện AC | Mục 3.1.1 – User story 10: Chỉnh sửa giá, bảng AC, **AC3** | Sửa đơn giá dòng đang được tham chiếu hạ nguồn (định mức mua/bán, Chi phí dịch vụ) → cho phép; hạ nguồn cập nhật theo giá mới: Sửa đơn giá và Lưu chỉnh sửa, trạng thái dòng giá chuyển thành "Chờ phê duyệt" (Luồng phê duyệt bảng giá mua chưa triển khai, tạm thời luồng trạng thái dừng ở đây) | Sửa đơn giá dòng đang được tham chiếu hạ nguồn (định mức mua/bán, Chi phí dịch vụ), lưu chỉnh sửa → cho phép: trạng thái dòng giá chuyển thành "Chờ phê duyệt". **Dòng "Chờ phê duyệt" KHÔNG còn là nguồn hợp lệ cho giá mua/bán định mức (theo BR4/BR5 — SRS Giá mua định mức) — tổ hợp tương ứng tạm thời biến mất khỏi màn định mức cho tới khi dòng giá được phê duyệt.** (Luồng phê duyệt bảng giá mua chưa triển khai, tạm thời luồng trạng thái dừng ở đây) |
| 3 | Đổi thuật ngữ nhãn trường trong popup lịch sử before/after: "Người thao tác" → "Người thực hiện" | Mục 3.1.1 – User story 12: Xem chi tiết lịch sử cập nhật (before/after), bảng AC, **AC2** | Popup hiển thị: Thông tin chung: Thời gian, **Người thao tác** / ... | Popup hiển thị: Thông tin chung: Thời gian, **Người thực hiện** / ... |
| 4 | Đổi thuật ngữ nhãn trường log hoạt động trong Business Rule: "Người thao tác" → "Người thực hiện" | Mục 3.1.3 – Quy tắc nghiệp vụ (Business Rule), **BR16** | Mọi thao tác Thêm/Cập nhật/Kích hoạt/Xóa được ghi vào Lịch sử hoạt động (Thời gian, **Người thao tác**, Hành động, Nội dung)... | Mọi thao tác Thêm/Cập nhật/Kích hoạt/Xóa được ghi vào Lịch sử hoạt động (Thời gian, **Người thực hiện**, Hành động, Nội dung)... |

## Phân loại

- Thuật ngữ (không đổi logic): \#1, \#3, \#4 — đồng nhất "Người thao tác" → "Người thực hiện" xuyên suốt AC8/US2, AC2/US12, BR16. Rà toàn văn bản mới không còn sót cụm "Người thao tác" nào.  
- Nghiệp vụ (bổ sung rule liên thông module): \#2 — thêm điều kiện dòng giá "Chờ phê duyệt" không còn là nguồn hợp lệ cho Giá mua/bán định mức, tham chiếu chéo BR4/BR5 của SRS Giá mua định mức.

## Đề xuất bổ sung (chưa xác nhận)

- Cập nhật \#2 tham chiếu BR4/BR5 của SRS Giá mua định mức — đề nghị đối chiếu SRS Giá mua định mức để đảm bảo BR4/BR5 bên đó mô tả khớp chiều ngược lại (dòng giá "Chờ phê duyệt" → tổ hợp biến mất khỏi màn định mức), tránh lệch pha giữa 2 tài liệu.  
- Lưu ý: bản "cũ" trong lần so sánh này (23:39 12/08) đã khác với bản "cũ" (12.08.2026) từng dùng trong ghi chú so sánh trước đó (18/08) ở project — bản cũ hiện tại đã tích hợp sẵn 2 thay đổi từng ghi nhận trước đây (bỏ cột "Cửa khẩu" khỏi phân hệ Vận tải trong bảng cấu trúc cột, và bỏ in nghiêng tiêu đề User story). Vì vậy 2 mục đó không xuất hiện lại trong bảng so sánh lần này — không phải bị bỏ sót mà đã nằm sẵn trong cả 2 file đang so sánh.

