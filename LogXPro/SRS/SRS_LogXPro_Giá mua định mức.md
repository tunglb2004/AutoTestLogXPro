**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification \- SRS)*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu "Giá mua định mức" (Bảng giá mua định mức chuẩn) |
| :---- | :---- |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | Trang BA |
| **Ngày tạo** | 25/08/2026 |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Menu "Giá mua định mức" quản lý bảng giá mua định mức chuẩn (benchmark) của doanh nghiệp — là mức giá tham chiếu nội bộ, KHÔNG phải giá đã ký với một nhà thầu cụ thể. Dữ liệu được phân nhóm theo 5 phân hệ dịch vụ (Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát, Sang tải) và map theo từng đầu mục giá đã thiết lập ở menu "Cấu hình đầu mục giá".

Mỗi dòng giá định mức được tham chiếu động từ các dòng giá trong menu "Quản lý giá mua" (không tạo mới/xóa thủ công tại menu này). Menu chỉ sở hữu và cho phép chỉnh sửa trường "Giá mua định mức". Trên màn chi tiết, mỗi dòng định mức hiển thị bảng so sánh giá thực tế theo từng nhà thầu (chênh lệch so với định mức, hạng nhà thầu, trạng thái giá) kèm chức năng quy đổi tiền tệ để đối chiếu khi các nhà thầu báo giá ở tiền tệ khác nhau.

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Xem danh sách giá mua định mức theo 5 phân hệ, nhóm theo đầu mục giá.

* Phân trang (pagination) danh sách dòng giá định mức theo từng đầu mục giá.

* Tìm kiếm theo Mã ID; Lọc theo Trạng thái giá mua và theo các cột đặc thù của từng loại dịch vụ; Sắp xếp theo Giá mua định mức.

* Nút Export/Import (chỉ mô tả nút; quy tắc validate chi tiết ở phiên bản sau).

* Xem chi tiết 1 dòng giá định mức: bộ thông tin dòng giá (chỉ đọc), Giá mua định mức, bảng "Giá mua theo nhà thầu" (Quy đổi tiền tệ, So với định mức, Hạng nhà thầu, Trạng thái giá) và lịch sử hoạt động (có phân trang).

* Cập nhật Giá mua định mức (chỉ chỉnh sửa trường Giá mua định mức; các thuộc tính dòng giá chỉ đọc).

* Quy đổi tiền tệ: chọn Nguồn tỷ giá (Thủ công / Tỷ giá VCB), nhập Tỷ giá (khi Thủ công), nhấn Cập nhật để hệ thống tính lại cột Quy đổi tiền tệ; Tiền tệ quy đổi mặc định \= VND và bị khóa (disable).

* Tham chiếu & đồng bộ động dòng giá nhà thầu từ Quản lý giá mua: tự sinh / tự xóa dòng định mức theo vòng đời dòng giá nguồn.

* Phân quyền theo chức năng Xem/Cập nhật (riêng Tìm kiếm/Lọc/Sắp xếp không kiểm soát phân quyền).

**Ngoài phạm vi (Out-of-scope):**

* Thêm mới / Xóa dòng giá định mức thủ công — dòng giá định mức là dữ liệu động tham chiếu từ Quản lý giá mua, không CRUD trực tiếp tại menu này.

* Luồng phê duyệt thay đổi Giá mua định mức — KHÔNG áp dụng: thay đổi giá mua định mức có hiệu lực ngay.

* Quy tắc validate chi tiết khi Import/Export CSV — đặc tả ở phiên bản sau.

* Ngưỡng kiểm soát/cảnh báo khi giá nhà thầu thực tế vượt định mức tại Quản lý giá mua — chưa xác nhận (xem mục 4).

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

[https\://drive.google.com/file/d/1O0VMvaEw2NrL3raYZdp\_5eN-yPrsKuAa/view?usp=sharing](https://drive.google.com/file/d/1O0VMvaEw2NrL3raYZdp_5eN-yPrsKuAa/view?usp=sharing) 

\[Chèn sơ đồ BPMN/Flowchart – .drawio khi có\]

![][image1]

**Mô tả luồng chính:**

* Người dùng (Bộ phận quản lý nhà thầu) mở menu Giá mua định mức, chọn 1 phân hệ dịch vụ, xem danh sách dòng giá định mức nhóm theo đầu mục giá (tìm kiếm/lọc/sắp xếp/phân trang). Đầu mục giá lấy từ Cấu hình đầu mục giá.

* Hệ thống tự tham chiếu các dòng giá nhà thầu "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" từ Quản lý giá mua, gom theo tổ hợp (Đầu mục giá \+ thuộc tính đặc thù \+ Đơn vị tính) thành các dòng giá định mức; dòng định mức chỉ tồn tại khi có ít nhất 1 dòng giá nhà thầu hợp lệ tham chiếu.

* Khi xuất hiện tổ hợp mới chưa có định mức, hệ thống tự sinh dòng định mức (mã theo quy tắc SBP-NNNN) với Giá mua định mức \= null và hiển thị cảnh báo (tooltip) tại dòng.

* Khi có thao tác thêm mới/chỉnh sửa/xóa dòng giá nhà thầu tham chiếu, dòng định mức tương ứng hiển thị cảnh báo (tooltip); cảnh báo được ẩn khi người dùng mở màn chi tiết dòng đó.

* Xem chi tiết 1 dòng định mức: bộ thông tin dòng giá \+ Giá mua định mức \+ bảng giá theo nhà thầu (Quy đổi tiền tệ, So với định mức, Hạng nhà thầu, Trạng thái giá) \+ lịch sử (có phân trang).

* Cập nhật giá mua định mức (chỉ trường Giá mua định mức), Lưu có hiệu lực ngay, ghi lịch sử; đồng thời hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng.

* Quy đổi tiền tệ: chọn Nguồn tỷ giá (Thủ công/Tỷ giá VCB), nhập/lấy Tỷ giá, nhấn Cập nhật, hệ thống tính lại cột Quy đổi tiền tệ; cột So với định mức so sánh Giá mua định mức với cột Quy đổi tiền tệ.

* Khi mọi dòng giá nhà thầu của một tổ hợp bị xóa/ngừng tham chiếu tại Quản lý giá mua, hệ thống xóa dòng định mức và giá benchmark đã nhập.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Chọn phân hệ & xem danh sách | Bộ phận quản lý nhà thầu | Mở menu, chọn 1/5 phân hệ; xem dòng giá định mức nhóm theo đầu mục; tìm/lọc/sắp xếp/phân trang | Danh mục đầu mục giá \+ dòng giá nhà thầu tham chiếu | Danh sách giá mua định mức | Có quyền Xem |
| Đồng bộ tham chiếu động | Hệ thống | Gom dòng giá nhà thầu "Đã phê duyệt" (bảng "Đang hoạt động") theo tổ hợp thành dòng định mức | Dòng giá nhà thầu từ Quản lý giá mua | Dòng giá định mức (động) | Chỉ tồn tại khi có ≥1 dòng nhà thầu hợp lệ |
| Tự sinh dòng định mức mới | Hệ thống | Tổ hợp mới chưa có định mức, tạo dòng (sinh mã SBP-...), Giá định mức \= null \+ tooltip cảnh báo | Tổ hợp thuộc tính mới | Dòng định mức chờ nhập giá | Benchmark null → cảnh báo |
| Xem chi tiết | Bộ phận quản lý nhà thầu | Xem thông tin dòng giá \+ bảng giá nhà thầu \+ lịch sử (phân trang) | Dòng định mức đã chọn | Chi tiết dòng định mức | Có quyền Xem |
| Cập nhật giá định mức | Bộ phận quản lý nhà thầu | Sửa trường Giá mua định mức (các trường khác chỉ đọc), có hiệu lực ngay | Giá mua định mức mới | Giá định mức cập nhật \+ log \+ tooltip tại giá bán định mức | Có quyền Cập nhật |
| Quy đổi tiền tệ | Bộ phận quản lý nhà thầu | Chọn Nguồn tỷ giá, nhập/lấy Tỷ giá, nhấn Cập nhật để tính cột Quy đổi | Tỷ giá \+ Nguồn tỷ giá | Cột Quy đổi tiền tệ theo nhà thầu | Tiền tệ quy đổi \= VND (disable) |
| Tự xóa dòng định mức | Hệ thống | Mọi dòng nhà thầu của tổ hợp bị xóa/ngừng → xóa dòng định mức & benchmark | Trạng thái dòng nhà thầu nguồn | Dòng định mức bị xóa | Không giữ lại giá benchmark |

# **3\. Đặc tả Tính năng**

## **3.1. MODULE: Giá mua định mức**

### **3.1.1 Danh sách user story**

#### **User story 1: Xem danh sách giá mua định mức**

| ID US | US\_GDM\_01 |
| :---- | :---- |
| **Tên Story** | Xem danh sách giá mua định mức theo phân hệ, nhóm theo đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem danh sách giá mua định mức theo phân hệ và nhóm theo đầu mục giá, để nắm nhanh mức benchmark hiện tại của từng dịch vụ và truy cập vào từng dòng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Hiển thị đủ 5 tab phân hệ (Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát, Sang tải);  Mỗi tab hiển thị từng bảng đầu mục giá chứa danh sách dòng giá định mức (mã \+ tên \+ loại giá). | Thiếu tab; không nhóm theo đầu mục giá. |
| AC2 | Mỗi tab hiển thị các cột: ID, Bộ thông tin thuộc tính (theo loại dịch vụ \- xem 3.1.2), Đơn vị tính, Giá mua định mức, Thao tác. | Sai/thiếu cột theo phân hệ; thiếu Giá mua định mức. |
| AC3 | Danh sách dòng giá định mức trong mỗi đầu mục giá có phân trang (pagination): hiển thị theo trang, cho chuyển trang và chọn số dòng mỗi trang. Thứ tự hiển thị dòng giá định mức: Hiển thị theo ID dòng giá tăng dần | Không phân trang; chuyển trang sai dữ liệu. Hiển thị sai thứ tự dòng giá định mức |
| AC4 | Khi có thao tác thêm mới/chỉnh sửa/xóa dòng giá nhà thầu (tại Quản lý giá mua) tham chiếu đến một dòng giá định mức, dòng định mức tương ứng hiển thị cảnh báo (tooltip). Cảnh báo được ẩn khi người dùng nhấn vào mở màn chi tiết của dòng đó. | Không hiển thị cảnh báo khi giá nhà thầu tham chiếu thay đổi; hoặc cảnh báo không ẩn sau khi mở chi tiết. |
| AC5 | Đầu mục giá bị tắt kích hoạt ở Cấu hình đầu mục giá → nhóm đầu mục và toàn bộ dòng định mức thuộc đầu mục đó bị ẩn/khóa, không sử dụng được. | Đầu mục đã tắt kích hoạt vẫn hiển thị/dùng được. |
| AC6 | Dòng giá định mức mới tự sinh (tổ hợp mới chưa có benchmark) hiển thị cảnh báo (tooltip) và Giá mua định mức \= trống (chờ nhập). | Không cảnh báo dòng chưa thiết lập định mức. |
| AC7 | Chức năng Xem danh sách/chi tiết chỉ hiển thị khi người dùng có quyền Xem; không có quyền → không truy cập được menu và không thấy dữ liệu. | Không có quyền Xem vẫn truy cập/xem được dữ liệu. |

#### **User story 2: Tìm kiếm dòng giá định mức**  

| ID US | US\_GDM\_02 |
| :---- | :---- |
| **Tên Story** | Tìm kiếm dòng giá định mức theo Mã ID |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn tìm kiếm dòng giá định mức theo Mã ID, để truy cập nhanh một dòng giá cụ thể trong danh sách. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Ô tìm kiếm cho nhập từ khóa theo Mã ID dòng giá định mức; kết quả trả ra đúng dòng khớp. | Tìm kiếm trả kết quả sai. |
| AC2 | Tìm kiếm áp dụng trong phạm vi phân hệ (tab) đang xem; không có kết quả → hiển thị trạng thái rỗng phù hợp. | Tìm kiếm áp dụng nhầm sang tab khác; không xử lý trạng thái rỗng. |
| AC3 | Chức năng Tìm kiếm không kiểm soát phân quyền: mọi người dùng truy cập được danh sách đều dùng được. | Chặn tìm kiếm vì lý do phân quyền. |

#### **User story 3: Lọc dòng giá định mức** 

| ID US | US\_GDM\_03 |
| :---- | :---- |
| **Tên Story** | Lọc dòng giá định mức theo cột đặc thù của từng loại dịch vụ |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn lọc dòng giá định mức theo các cột đặc thù của từng loại dịch vụ, để khoanh vùng nhanh nhóm dòng giá cần xem. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Cho lọc theo các cột đặc thù của từng loại dịch vụ và có Bộ lọc mở rộng:  (1) Vận tải: Điểm đi, Điểm đến, Loại xe;  (2) Kho bãi: Tên kho, Loại kho;  (3) Khai báo Hải quan: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe;  (4) Hải quan Giám sát: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe;  (5) Sang tải: Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa. Lọc theo Đầu mục giá: giá trị lọc là danh sách các đầu mục giá đã cấu hình theo loại dịch vụ tương ứng — đang ở tab loại dịch vụ nào thì hiển thị và lọc theo danh sách đầu mục giá của loại dịch vụ đó. Lọc theo Trạng thái giá mua (Đã có giá mua / Chưa có giá mua)  | Thiếu cột lọc đặc thù theo loại dịch vụ; lọc ra kết quả sai.  Danh sách Đầu mục giá hiển thị lẫn đầu mục của loại dịch vụ khác (không đúng tab đang xem); hoặc lọc theo Đầu mục giá cho ra kết quả sai. |
| AC2 | Phạm vi lọc áp dụng cho tab dịch vụ đang thao tác, không áp dụng cho các tab dịch vụ còn lại. | Lọc áp dụng nhầm sang tab khác. |
| AC3 | Khi lọc theo một thuộc tính, kết quả bao gồm các dòng có giá trị đúng bộ lọc và các dòng có giá trị "Tất cả" ở thuộc tính đó (dòng "Tất cả" luôn khớp mọi bộ lọc của thuộc tính tương ứng). | Lọc bỏ sót dòng "Tất cả". |
| AC4 | Chức năng Lọc không kiểm soát phân quyền: mọi người dùng truy cập được danh sách đều dùng được. | Chặn lọc vì lý do phân quyền. |
| AC5 | Lọc theo đầu mục giá: lọc theo 1 đầu mục giá → chỉ hiển thị các dòng giá thuộc đầu mục giá đã chọn  | Hiển thị cả các đầu mục giá khác |

#### **User story 4: Sắp xếp dòng giá định mức** 

| ID US | US\_GDM\_04 |
| :---- | :---- |
| **Tên Story** | Sắp xếp dòng giá định mức theo Giá mua định mức |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn sắp xếp dòng giá định mức theo Giá mua định mức, để so sánh nhanh mức benchmark cao/thấp trong một đầu mục giá. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Cho sắp xếp theo Giá mua định mức tăng dần / giảm dần; kết quả trả ra đúng. Phạm vi sắp xếp áp dụng cho tab dịch vụ đang thao tác, không áp dụng cho các tab dịch vụ còn lại. | Sắp xếp ra kết quả sai; hoặc sắp xếp theo trường khác Giá mua định mức. |
| AC2 | Sắp xếp kết hợp được với tìm kiếm và lọc đang áp dụng. | Sắp xếp làm mất bộ lọc/từ khóa đang áp dụng. |
| AC3 | Chức năng Sắp xếp không kiểm soát phân quyền: mọi người dùng truy cập được danh sách đều dùng được. | Chặn sắp xếp vì lý do phân quyền. |

#### **User story 5: Xem chi tiết dòng giá định mức**

| ID US | US\_GDM\_05 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết dòng giá định mức, bảng so sánh giá theo nhà thầu và lịch sử |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem chi tiết 1 dòng giá định mức cùng bảng so sánh giá của từng nhà thầu, để đánh giá mức giá các nhà thầu so với định mức chuẩn và truy vết thay đổi. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Bộ thông tin chi tiết dòng giá định mức hiển thị: Loại dịch vụ, Đầu mục giá (mã \+ tên), Loại giá, Mã dòng giá, các thuộc tính đặc thù phân hệ (ví dụ Vận tải: Điểm đi, Điểm đến, Loại xe), Đơn vị tính, Tiền tệ, Giá mua định mức. | Thiếu/sai trường thông tin dòng giá. |
| AC2 | Bảng "Giá mua theo nhà thầu" liệt kê các nhà thầu có dòng giá cùng tổ hợp, gồm:  Mã,  Tên nhà thầu \+ Mã số thuế,  Hạng nhà thầu,  Đơn giá gốc,  Quy đổi tiền tệ,  So với định mức,  Trạng thái giá. | Thiếu cột; không gom đúng các nhà thầu cùng tổ hợp. |
| AC3 | Chỉ tham chiếu dòng giá nhà thầu có trạng thái "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động"; dòng định mức chỉ tồn tại khi có ít nhất 1 dòng giá nhà thầu hợp lệ như vậy. | Đưa vào bảng dòng chưa "Đã phê duyệt"/không thuộc bảng "Đang hoạt động". |
| AC4 | Cột "So với định mức" \= Quy đổi tiền tệ của nhà thầu − Giá mua định mức; âm (thấp hơn) màu xanh, dương (cao hơn) màu đỏ; nếu Quy đổi tiền tệ chưa có giá trị → để trống (null). | So sánh sai nguồn; hoặc không để trống khi Quy đổi tiền tệ null. |
| AC5 | Cột "Hạng nhà thầu" (Ưu tiên / Dự phòng) được lấy theo ID nhà thầu từ menu Quản lý nhà thầu. | Hạng nhà thầu không lấy đúng theo ID nhà thầu từ Quản lý nhà thầu. |
| AC6 | Cột “Hạn mức sản lượng khuyến nghị” được lấy từ “Hạn mức sản lượng khuyến nghị” theo ID nhà thầu (menu Quản lý nhà thầu) | Hiển thị sai giá trị trường  |
| AC7 | Khi trong cùng đầu mục giá tồn tại cả dòng định mức giá trị "Tất cả" và dòng định mức giá trị cụ thể của cùng một thuộc tính: (a) tại bảng giá nhà thầu của dòng GIÁ TRỊ CỤ THỂ, dòng giá nhà thầu có giá trị "Tất cả" vẫn xuất hiện và tham gia so sánh; (b) tại bảng giá nhà thầu của dòng GIÁ TRỊ "TẤT CẢ", không hiển thị dòng giá nhà thầu có giá trị cụ thể. | Hiển thị sai chiều bao trùm giữa dòng "Tất cả" và dòng cụ thể. |
| AC8 | Nhấn vào 1 dòng giá mua của nhà thầu, hệ thống điều hướng sang màn Chi tiết nhà thầu của Bảng giá mua chứa dòng giá đó | Không điều hướng hoặc điều hướng sai bảng giá |
| AC9 | Có nút "Cập nhật giá mua định mức" điều hướng sang màn cập nhật (US\_GDM\_06); chỉ hiển thị khi người dùng có quyền Cập nhật. | Hiển thị nút cho người không có quyền; điều hướng sai dòng. |
| AC10 | Lịch sử hoạt động hiển thị: Thời gian, Người thao tác, Hành động, Nội dung; cho tìm kiếm và làm mới. Khi mở màn chi tiết, cảnh báo (tooltip) thay đổi giá nhà thầu ở danh sách của dòng này được ẩn. | Log thiếu người thao tác/nội dung; không tìm kiếm/làm mới được; cảnh báo không ẩn khi mở chi tiết. |
| AC11 | Danh sách lịch sử hoạt động có phân trang (pagination): hiển thị theo trang, cho chuyển trang. | Lịch sử hoạt động không phân trang; chuyển trang sai dữ liệu. |
| AC12 | Khi danh sách dòng giá nhà thầu thuộc dòng định mức có thay đổi (tham chiếu dòng giá nhà thầu mới, hoặc đơn giá nhà thầu có điều chỉnh), bảng "Giá mua theo nhà thầu" trên màn Chi tiết giá mua định mức highlight (tô nền) dòng giá nhà thầu tương ứng đã thay đổi/mới thêm;  Highlight tự ẩn khi người dùng mở lại màn Chi tiết của dòng định mức đó (cùng cơ chế ẩn cảnh báo tại BR16). | Không highlight dòng giá nhà thầu thay đổi/mới thêm; hoặc highlight không tự ẩn sau khi người dùng đã mở lại màn Chi tiết. |

#### **User story 6: Cập nhật giá mua định mức**

| ID US | US\_GDM\_06 |
| :---- | :---- |
| **Tên Story** | Cập nhật trường Giá mua định mức của một dòng giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn cập nhật Giá mua định mức của một dòng giá, để điều chỉnh mức benchmark chuẩn mà không tác động tới các thuộc tính dòng giá (được tham chiếu động). |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Nhấn "Cập nhật giá mua định mức" mở modal chứa bộ thông tin dòng giá ở chế độ chỉ xem (disabled) và duy nhất trường "Giá mua định mức (VND)" cho phép chỉnh sửa. | Modal cho sửa các trường ngoài Giá mua định mức. |
| AC2 | Giá mua định mức bắt buộc, kiểu số; để trống khi Lưu → chặn và báo lỗi. | Cho lưu khi Giá mua định mức trống. |
| AC3 | Nút "Lưu thông tin" persist giá trị mới, có hiệu lực ngay và ghi lịch sử hoạt động hành động "Cập nhật giá mua định mức", thông báo thành công; "Hủy bỏ" không lưu thay đổi. | Lưu không ghi log; hoặc Hủy bỏ vẫn lưu. |
| AC4 | Với dòng định mức mới tự sinh (benchmark \= null), người dùng nhập Giá mua định mức lần đầu → dòng hết trạng thái cảnh báo "chưa thiết lập định mức". | Sau khi nhập giá, dòng vẫn còn cảnh báo chưa thiết lập. |
| AC5 | Cập nhật giá mua định mức thành công → hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng ở menu Giá bán định mức. | Không hiển thị cảnh báo tại dòng giá bán định mức sau khi cập nhật giá mua định mức. |
| AC6 | Chặn người dùng cập nhật giá định mức khi không có quyền Cập nhật; ẩn nút và chặn thao tác. | Người dùng không có quyền vẫn cập nhật thành công. |

#### **User story 7: Quy đổi tiền tệ bảng giá nhà thầu**

| ID US | US\_GDM\_07 |
| :---- | :---- |
| **Tên Story** | Quy đổi tiền tệ giá nhà thầu về một tiền tệ chung |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn quy đổi giá nhà thầu về một tiền tệ chung theo tỷ giá, để so sánh công bằng khi các nhà thầu báo giá ở các loại tiền tệ khác nhau. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Trong chi tiết dòng giá định mức có chức năng Quy đổi tiền tệ gồm: Tỷ giá, Nguồn tỷ giá (dropdown), Tiền tệ quy đổi (mặc định \= VND, khóa/disable, không cho đổi). | Thiếu trường; hoặc Tiền tệ quy đổi vẫn cho đổi khác VND. |
| AC2 | Nguồn tỷ giá cho chọn: "Thủ công" (người dùng nhập Tỷ giá tay) hoặc "Tỷ giá VCB" (hệ thống lấy tỷ giá thực tế của Vietcombank). | Không có 2 lựa chọn nguồn tỷ giá. |
| AC3 | Luồng: người dùng chọn Nguồn tỷ giá; nếu chọn "Thủ công" thì nhập Tỷ giá USD \-\> VNĐ, CNY \-\> VNĐ;  → hệ thống cập nhật cột "Quy đổi tiền tệ" theo Tỷ giá đã nhập. Trường hợp để trống 1 trong 2 tỷ giá (hoặc cả 2 tỷ giá), cột Quy đổi tiền tệ chỉ tiến hành quy đổi cho tỷ giá đã nhập (VD: Chỉ nhập USD \-\> VNĐ, chỉ tính cột Quy đổi tiền tệ cho dòng giá nhà thầu có tiền tệ USD, không đổi cho dòng giá CNY) Đối với dòng giá nhà thầu có tiền tệ VNĐ, cột Quy đổi tiền tệ luôn \= Đơn giá nhà thầu (đơn giá gốc) | Không có nút Cập nhật; hoặc đổi tỷ giá không cập nhật cột Quy đổi. Nhập tỷ giá, cột Quy đổi tiền tệ tính sai. |
| AC4 | Cột "Quy đổi tiền tệ" \= Đơn giá nhà thầu × Tỷ giá (theo đúng tiền tệ từ giá mua nhà thầu), hiển thị đơn vị theo Tiền tệ quy đổi (VND). | Tính sai giá trị quy đổi. |
| AC5 | Khi chọn "Tỷ giá VCB": hệ thống tự điền Tỷ giá theo Vietcombank (trường Tỷ giá chỉ đọc); tần suất cập nhật tỷ giá là 10 phút/1 lần. | Nguồn VCB vẫn cho sửa tay; hoặc không cập nhật theo chu kỳ 10 phút/lần. |
| AC6 | Lấy tỷ giá VCB thất bại (lỗi mạng/nguồn) → hiển thị thông báo lỗi và cho phép chuyển sang nhập thủ công. | Lỗi lấy tỷ giá nhưng không thông báo/không có phương án thay thế. |
| AC7 | Sau khi cập nhật cột Quy đổi tiền tệ, cột "So với định mức" tính lại theo Quy đổi tiền tệ; nếu Quy đổi tiền tệ chưa có giá trị → để trống cột "So với định mức". | Đổi tỷ giá nhưng cột So với định mức không cập nhật/không để trống đúng. |

#### **User story 8: Đồng bộ tham chiếu động & vòng đời dòng giá định mức**  

| ID US | US\_GDM\_08 |
| :---- | :---- |
| **Tên Story** | Tự sinh / tự xóa dòng giá định mức theo vòng đời dòng giá nhà thầu nguồn |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn dòng giá định mức được đồng bộ động theo dòng giá nhà thầu ở Quản lý giá mua, để danh mục định mức luôn phản ánh đúng các tổ hợp dịch vụ đang có nhà thầu cung ứng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Mỗi dòng giá định mức tương ứng 1 tổ hợp duy nhất: Đầu mục giá \+ bộ thuộc tính đặc thù phân hệ \+ Đơn vị tính. Mọi dòng giá nhà thầu trùng tổ hợp được gom vào 1 dòng định mức. | Tách/nhân đôi dòng định mức cho cùng tổ hợp; hoặc gộp sai các tổ hợp khác nhau. |
| AC2 | Dòng giá định mức chỉ tồn tại khi có ít nhất 1 dòng giá nhà thầu "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" tham chiếu đến (điều kiện tồn tại). | Dòng định mức tồn tại khi không có dòng giá nhà thầu hợp lệ nào tham chiếu. |
| AC3 | Xuất hiện tổ hợp mới ở Quản lý giá mua (chưa từng có định mức) → hệ thống tự sinh dòng định mức mới với Giá mua định mức \= null và hiển thị cảnh báo (tooltip) tại dòng. | Không tự sinh dòng; hoặc sinh nhưng không cảnh báo benchmark trống. |
| AC4 | Khi mọi dòng giá nhà thầu của một tổ hợp bị xóa hoặc ngừng tham chiếu → hệ thống xóa dòng định mức và giá benchmark đã nhập (không giữ lại). | Dòng định mức vẫn hiển thị hoặc còn giữ benchmark sau khi hết dòng nhà thầu nguồn. |
| AC5 | Dòng có giá trị "Tất cả" ở một thuộc tính và dòng có giá trị cụ thể được coi là các tổ hợp riêng, mỗi loại có dòng định mức và benchmark riêng, không gộp chung. | Gộp dòng "Tất cả" với dòng giá trị cụ thể thành một dòng định mức. |
| AC6 | Mã dòng giá định mức do hệ thống tự sinh theo cấu trúc SBP-NNNN (xem BR19 & bảng mã dịch vụ 3.1.2); người dùng không nhập/sửa mã. | Mã không tự sinh hoặc sai cấu trúc SBP-NNNN. |

### **3.1.2 Mô tả giao diện (Reviewing)**

* Ảnh giao diện: \[Chèn ảnh Danh sách / Chi tiết dòng giá định mức / Modal Cập nhật giá mua định mức\].

* Link UI Design: \[Chèn link\].

* Màn hình chính: Danh sách giá mua định mức theo phân hệ (nhóm đầu mục giá, có phân trang); Chi tiết dòng giá định mức (thông tin dòng giá \+ bảng giá theo nhà thầu \+ quy đổi tiền tệ \+ lịch sử có phân trang); Modal Cập nhật giá mua định mức.

**Bảng trường dữ liệu — Modal "Cập nhật giá mua định mức":**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Mã dòng giá | — | Text (chỉ đọc) | — | (Tự sinh) | Tự sinh theo quy tắc SBP-NNNN (xem BR19) |
| Thuộc tính đặc thù phân hệ (ví dụ Vận tải: Điểm đi, Điểm đến, Loại xe) | — | Text (chỉ đọc) | — | (Tự điền) | Theo phân hệ (xem cấu trúc cột bên dưới); chỉ xem |
| Đơn vị tính | — | Text (chỉ đọc) | — | (Tự điền) | Chỉ xem |
| Tiền tệ | — | Text (chỉ đọc) | — | (Tự điền) | Chỉ xem |
| Giá mua định mức (VND) | v | Number | — | (Trống) | Trường DUY NHẤT cho chỉnh sửa; bắt buộc |

**Quy tắc sinh mã dòng giá mua định mức:** SBP-NNNN. Trong đó SBP \= Standard Buying Price (giá mua định mức); NNNN là số thứ tự. Người dùng không nhập/sửa mã.

| Mã dịch vụ | Loại dịch vụ |
| :---- | :---- |
| TP | Vận tải (Transport) |
| WR | Kho bãi (Warehouse) |
| CD | Khai báo Hải quan (Customs Declaration) |
| CS | Hải quan Giám sát (Customs Supervision) |
| TS | Sang tải (Transshipment) |

*Ghi chú: mã ví dụ trên giao diện hiện tại (LN-VT-001) sẽ được chuẩn hóa theo quy tắc sinh mã nêu trên.*

**Bảng trường dữ liệu — Chức năng "Quy đổi tiền tệ" (trong chi tiết dòng giá định mức):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Nguồn tỷ giá | v | Select (enum) | — | Thủ công | Thủ công / Tỷ giá VCB (lấy tỷ giá thực tế Vietcombank, cập nhật 10 phút/lần) |
| Tỷ giá | v (khi Thủ công) | Number | — | (Trống) | Nhập tay khi nguồn \= Thủ công; tự điền & chỉ đọc khi nguồn \= Tỷ giá VCB |
| Tiền tệ quy đổi | v | Select (enum) | — | VND | Mặc định VND và bị khóa (disable), không cho đổi |

**Cấu trúc cột danh sách dòng giá định mức theo từng phân hệ (nhóm theo đầu mục giá):**

| Phân hệ | Cột đặc thù | Cột chung |
| :---- | :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (2) Kho bãi | Tên kho, Loại kho | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa | Đơn vị tính, Tiền tệ, Giá mua định mức |

**Bộ lọc theo cột đặc thù của từng loại dịch vụ (US\_GDM\_03):**

| Phân hệ | Cột được phép lọc |
| :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Cửa khẩu, Loại xe |
| (2) Kho bãi | Tên kho, Loại kho |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa |

**Cấu trúc cột bảng "Giá mua theo nhà thầu" (trong chi tiết):**

| Cột | Mô tả |
| :---- | :---- |
| Mã (nhà thầu/dòng giá) | Mã dòng giá nhà thầu (ví dụ QUO-001) |
| Tên nhà thầu \+ Mã số thuế | Tên và mã số thuế nhà thầu |
| Đơn giá (chưa gồm VAT) | Đơn giá thực tế của nhà thầu |
| Quy đổi tiền tệ | Đơn giá nhà thầu × Tỷ giá, theo Tiền tệ quy đổi (VND) |
| So với định mức | Quy đổi tiền tệ − Giá mua định mức; âm \= xanh, dương \= đỏ; Quy đổi tiền tệ null → để trống |
| Hạng nhà thầu | Ưu tiên / Dự phòng/Chiến lược, lấy theo ID nhà thầu từ menu Quản lý nhà thầu |
| Trạng thái giá | Trạng thái dòng giá nhà thầu (ví dụ Đã phê duyệt) |
| Hạn mức sản lượng khuyến nghị | \= Hạn mức sản lượng khuyến nghị của nhà thầu (Quản lý nhà thầu) |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

| ID | Quy tắc |
| :---- | :---- |
| BR1 | Dòng giá định mức KHÔNG được tạo mới/xóa thủ công tại menu này; toàn bộ dòng được tham chiếu động từ dòng giá trong Quản lý giá mua. |
| BR2 | 1 dòng giá định mức \= 1 tổ hợp duy nhất: Đầu mục giá \+ bộ thuộc tính đặc thù phân hệ \+ Đơn vị tính. Mọi dòng giá nhà thầu trùng tổ hợp được gom vào 1 dòng định mức để so sánh với 1 mức benchmark. |
| BR3 | Dòng có giá trị "Tất cả" ở một thuộc tính và dòng có giá trị cụ thể được coi là các tổ hợp RIÊNG — mỗi loại có dòng định mức và benchmark riêng, không gộp chung. |
| BR4 | Chỉ tham chiếu dòng giá nhà thầu có trạng thái "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" (theo BR15 tài liệu Quản lý giá mua). |
| BR5 | Điều kiện tồn tại của dòng định mức: một dòng giá định mức chỉ tồn tại khi có ít nhất 1 dòng giá nhà thầu "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" tham chiếu đến. |
| BR6 | Đầu mục giá lấy từ Cấu hình đầu mục giá; đầu mục bị tắt kích hoạt → nhóm đầu mục và các dòng định mức thuộc đầu mục đó bị ẩn/khóa, không sử dụng/tham chiếu được cho đến khi bật lại. |
| BR7 | Vòng đời — tự sinh: khi xuất hiện tổ hợp mới ở Quản lý giá mua chưa có định mức, hệ thống tự sinh dòng định mức với Giá mua định mức \= null và hiển thị cảnh báo (tooltip) chờ nhập. |
| BR8 | Vòng đời — tự xóa: khi mọi dòng giá nhà thầu của một tổ hợp bị xóa/ngừng tham chiếu (không còn dòng "Đã phê duyệt" thuộc bảng "Đang hoạt động"), hệ thống xóa dòng định mức và giá benchmark đã nhập (không giữ lại). |
| BR9 | Chỉ trường "Giá mua định mức" do menu này sở hữu và cho phép chỉnh sửa; mọi thuộc tính khác của dòng giá là chỉ đọc (đến từ dòng nguồn). |
| BR10 | So với định mức \= Quy đổi tiền tệ của nhà thầu − Giá mua định mức; giá trị âm (thấp hơn định mức) hiển thị màu xanh, dương (cao hơn) hiển thị màu đỏ. Nếu cột Quy đổi tiền tệ chưa có giá trị → để trống (null) cột So với định mức. |
| BR11 | Quy đổi tiền tệ: Tiền tệ quy đổi mặc định \= VND và bị khóa (disable). Nguồn tỷ giá \= Thủ công (nhập tay) hoặc Tỷ giá VCB (lấy tỷ giá thực tế Vietcombank, cập nhật 10 phút/lần). Người dùng chọn nguồn, nhập/lấy Tỷ giá, nhấn Cập nhật → cột Quy đổi tiền tệ \= Đơn giá nhà thầu × Tỷ giá. |
| BR12 | Hạng nhà thầu (Ưu tiên / Dự phòng) được lấy theo ID nhà thầu từ menu Quản lý nhà thầu. |
| BR13 | Hiển thị dòng nhà thầu theo giá trị "Tất cả": tại bảng giá nhà thầu của dòng định mức giá trị cụ thể, dòng giá nhà thầu có giá trị "Tất cả" vẫn xuất hiện và tham gia so sánh; tại bảng giá nhà thầu của dòng định mức giá trị "Tất cả", không hiển thị dòng giá nhà thầu có giá trị cụ thể. |
| BR14 | Cập nhật Giá mua định mức có hiệu lực ngay (không qua phê duyệt) và được ghi vào Lịch sử hoạt động (Thời gian, Người thao tác, Hành động, Nội dung); cập nhật thành công → hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng. |
| BR15 | Danh sách dòng giá định mức theo từng đầu mục giá và danh sách lịch sử hoạt động đều được phân trang (pagination). |
| BR16 | Khi có thao tác thêm mới/chỉnh sửa/xóa dòng giá nhà thầu tham chiếu, dòng định mức tương ứng hiển thị cảnh báo (tooltip); cảnh báo được ẩn khi người dùng mở màn chi tiết của dòng đó. |
| BR17 | Phân quyền: chức năng Xem/Cập nhật được kiểm soát bằng phân quyền (nút/action chỉ hiển thị và thao tác được khi có quyền). Riêng chức năng Tìm kiếm/Lọc/Sắp xếp danh sách dòng giá KHÔNG kiểm soát phân quyền. |
| BR18 | Import/Export dòng giá định mức: chỉ mô tả nút trong phiên bản này; quy tắc validate/ghi đè/thêm mới đặc tả ở phiên bản sau. |
| BR19 | Mã dòng giá mua định mức do hệ thống tự sinh theo cấu trúc SBP-NNNN. SBP \= Standard Buying Price; NNNN là số thứ tự. Người dùng không nhập/sửa mã. |
| BR20 | Bộ lọc Đầu mục giá (trường lọc bổ sung trong AC1 của US\_GDM\_03): giá trị lọc là danh sách đầu mục giá đã cấu hình trong Cấu hình đầu mục giá theo từng loại dịch vụ;  |
| BR21 | Highlight dòng giá nhà thầu thay đổi/mới trong bảng "Giá mua theo nhà thầu" (màn Chi tiết): áp dụng khi có dòng giá nhà thầu mới phát sinh hoặc đơn giá nhà thầu được điều chỉnh;  Highlight tự ẩn khi người dùng mở lại màn Chi tiết của dòng đó (cùng cơ chế với cảnh báo tooltip ở BR16). |

### **3.1.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Nhấn "Lưu giá mua định mức" khi để trống Giá mua định mức | Lỗi | "Vui lòng nhập giá mua định mức" | Không lưu, giữ nguyên modal |
| Cập nhật giá mua định mức thành công | Thành công | "Đã cập nhật giá định mức cho dòng {mã}" | Persist giá mới (hiệu lực ngay), ghi lịch sử, đóng modal, hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng |
| Dòng định mức mới tự sinh (chưa có benchmark) | Cảnh báo | "Dòng giá chưa được thiết lập giá định mức" | Hiển thị tooltip tại dòng; chờ người dùng nhập giá |
| Thêm mới/chỉnh sửa/xóa dòng giá nhà thầu tham chiếu đến dòng định mức | Cảnh báo | "Giá nhà thầu tham chiếu vừa thay đổi, vui lòng kiểm tra" | Hiển thị tooltip tại dòng định mức; ẩn khi người dùng mở màn chi tiết |
| Nguồn tỷ giá \= "Thủ công" nhưng để trống Tỷ giá | Lỗi | "Vui lòng nhập tỷ giá" | Không cập nhật cột Quy đổi, giữ nguyên form |
| Lấy Tỷ giá VCB thất bại | Lỗi | "Không lấy được tỷ giá từ Vietcombank, vui lòng thử lại hoặc nhập thủ công" | Cho phép chuyển sang nhập tỷ giá thủ công |
| Mọi dòng giá nhà thầu của tổ hợp bị xóa/ngừng tham chiếu | Thông báo (hệ thống) | (Xóa dòng định mức) | Xóa dòng định mức & giá benchmark đã nhập |
| Người dùng không có quyền với chức năng Xem/Cập nhật | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn nút/action và chặn thao tác Xem/Cập nhật |

### **3.1.5. Luồng xử lý dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Cấu hình đầu mục giá | Cung cấp đầu mục giá (cha) để nhóm dòng định mức & sinh mã dòng | Đầu mục giá → Giá mua định mức | Khi hiển thị danh sách/chi tiết | Đầu mục bị tắt kích hoạt → ẩn & khóa nhóm/dòng định mức |
| Quản lý giá mua | Nguồn dòng giá nhà thầu (động) để so sánh & xác định vòng đời dòng định mức | Dòng giá nhà thầu "Đã phê duyệt" (bảng "Đang hoạt động") → Giá mua định mức | Khi dòng giá nhà thầu thêm/sửa/duyệt/xóa | Hết dòng nhà thầu hợp lệ → xóa dòng định mức & benchmark; thay đổi giá nhà thầu → tooltip cảnh báo |
| Quản lý nhà thầu | Cung cấp Hạng nhà thầu (Ưu tiên/Dự phòng), Hạn mức sản lượng khuyến nghị theo ID nhà thầu | Hạng nhà thầu, Hạn mức sản lượng khuyến nghị  → bảng giá theo nhà thầu | Khi hiển thị bảng giá theo nhà thầu | Không lấy được hạng, sản lượng khuyến nghị → để trống  |
| Tỷ giá VCB (Vietcombank) | Cung cấp tỷ giá thực tế cho quy đổi tiền tệ | Tỷ giá VCB → cột Quy đổi tiền tệ | Khi chọn Nguồn tỷ giá \= "Tỷ giá VCB" (cập nhật 10 phút/lần) | Lấy tỷ giá thất bại → báo lỗi, cho nhập thủ công |
| Giá bán định mức | Menu hạ nguồn tham chiếu Giá mua định mức | Giá mua định mức → Giá bán định mức | Khi cập nhật Giá mua định mức | Cập nhật giá mua định mức → hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng |

### **3.1.6. Tích hợp & Đồng bộ dữ liệu**

# **4\. Đánh giá độ phủ rule (Case còn thiếu)**

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| :---- | :---- | :---- | :---- |
| Ngưỡng kiểm soát vượt định mức | Chưa chốt | Chưa rõ giá định mức có dùng làm ngưỡng cảnh báo/chặn khi giá nhà thầu thực tế vượt định mức ở Quản lý giá mua | Xác nhận: chỉ tham chiếu/so sánh, hay cảnh báo/chặn khi tạo–duyệt giá nhà thầu vượt định mức |
| Điều chỉnh giá định mức khi đã có bảng giá tham chiếu | Chưa chốt | Chưa rõ giá bán định mức/định mức cũ bị ảnh hưởng ra sao khi benchmark đổi (ngoài tooltip cảnh báo) | Xác nhận benchmark ảnh hưởng lịch sử hay chỉ from-now; hành vi cập nhật giá bán định mức |

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Tại màn Chi tiết giá mua định mức \> Bảng giá nhà thầu: Bổ sung cột “Hạn mức sản lượng khuyến nghị” Giá trị: \= “Hạn mức sản lượng khuyến nghị” của nhà thầu (Quản lý nhà thầu) | Chưa có cột Hạn mức sản lượng khuyến nghị | 13/10/2026 | Cập nhật từ feedback của người dùng |
| 2 | Thứ tự hiển thị dòng giá trong danh sách: Hiển thị theo ID dòng giá (tăng dần) | Thứ tự hiển thị dòng giá trong danh sách: Hiển thị theo đơn giá tăng dần | 13/10/2026 | Đề xuất của BA |

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification – SRS)*

*Mô hình Hybrid: User Story (xương sống) \+ Use Case chi tiết (cho story phức tạp)*

**Tài liệu bổ sung — Chức năng NHẬP HÀNG LOẠT (Giá mua định mức)**

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Chức năng Nhập hàng loạt (Menu "Giá mua định mức") |
| :---- | :---- |
| Link UI Design | \[Chèn link UI Design\] |
| Người lập | Trang BA |
| Ngày tạo | 14/09/2026 |
| Phiên bản | v1.0 (15/09/2026) — Tài liệu bổ sung, dùng kèm SRS\_LogXPro\_Giá mua định mức |

*Ghi chú phiên bản: Các nội dung được tô vàng là phần chỉnh sửa/bổ sung so với phiên bản gần nhất: đánh số lại mã Business Rule theo mã khi hợp nhất vào SRS gốc, tách riêng phạm vi tài liệu cho module Giá mua định mức, và chốt 4 hạng mục còn treo (khóa đồng thời, đầu mục giá bị tắt kích hoạt giữa phiên nhập, cột So với định mức, số dòng được mở rộng cùng lúc). Bảng tổng hợp thay đổi ở cuối tài liệu.*

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Bổ sung chức năng Nhập hàng loạt cho menu "Giá mua định mức" của hệ thống LogXPro. Chức năng cho phép người dùng nhập/cập nhật giá mua định mức cho nhiều dòng giá cùng lúc, chỉnh sửa trực tiếp trên lưới màn Danh sách (inline), thay cho thao tác mở modal cập nhật từng dòng như hiện tại.

Mục tiêu chính là rút ngắn thời gian thiết lập giá sau mỗi đợt hệ thống tự sinh hàng loạt dòng giá định mức mới từ Quản lý giá mua.

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Chế độ Nhập hàng loạt (inline bulk edit) trên màn Danh sách Giá mua định mức, áp dụng cho cả 5 phân hệ dịch vụ ngay từ phiên bản đầu tiên.

* Chỉ cập nhật trường giá do menu này sở hữu: "Giá mua định mức".

* Phạm vi dòng được nhập theo đúng tab phân hệ \+ tìm kiếm \+ bộ lọc \+ sắp xếp đang áp dụng.

* Validate tại từng ô khi rời ô; chặn lưu khi còn tồn tại ô không hợp lệ.

* Giữ bộ đệm dữ liệu đã nhập chưa lưu khi người dùng chuyển trang hoặc đổi bộ lọc trong cùng phiên nhập.

* Ghi Lịch sử hoạt động riêng cho từng dòng được cập nhật.

* Xem bảng giá nhà thầu của từng dòng giá ngay trong lưới Nhập hàng loạt theo cơ chế mở rộng trong dòng.

* Phân quyền dùng chung quyền Cập nhật của chức năng cập nhật đơn lẻ.

* Khóa đồng thời (pessimistic lock) bảng giá đang có người cập nhật, và xử lý đầu mục giá bị tắt kích hoạt giữa phiên nhập.

**Ngoài phạm vi (Out-of-scope):**

* Tạo mới / xóa dòng giá định mức — giữ nguyên BR1: dòng giá là dữ liệu tham chiếu động từ Quản lý giá mua.

* Chỉnh sửa các thuộc tính khác của dòng giá (Đầu mục giá, thuộc tính đặc thù phân hệ, Đơn vị tính, Tiền tệ).

* Import/Export file — là chức năng độc lập, tồn tại SONG SONG với Nhập hàng loạt; giữ nguyên hạng mục treo tại BR18, đặc tả riêng ở phiên bản sau.

* Hộp xác nhận bổ sung theo ngưỡng chênh lệch % giữa giá mới và giá cũ — không áp dụng.

* Nhập tỷ giá thủ công trong panel bảng giá nhà thầu — chỉ thực hiện tại màn Chi tiết giá mua định mức (US\_GDM\_07).

* Popup riêng để xem bảng giá nhà thầu — đã cân nhắc và không lựa chọn (xem mục 3.1.2).

* Luồng phê duyệt thay đổi giá — không áp dụng, giá có hiệu lực ngay sau khi lưu.

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

*\[Chèn hình ảnh sơ đồ BPMN/Flowchart — file .drawio tạo riêng theo quy định định dạng của dự án\]*

**Mô tả luồng chính:**

Mở màn Danh sách → Chọn tab phân hệ → Áp bộ lọc khoanh vùng dòng cần nhập → Nhấn "Nhập hàng loạt" → Nhập giá cho nhiều dòng → Hệ thống validate tại ô → Nhấn "Lưu tất cả" → Xác nhận bảng Giá cũ/Giá mới → Hệ thống persist, ghi log từng dòng, phát sinh cảnh báo hạ nguồn → Thoát chế độ nhập.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Khoanh vùng dòng cần nhập | BP quản lý nhà thầu | Chọn tab phân hệ, áp tìm kiếm/bộ lọc/sắp xếp | Danh sách dòng giá định mức | Tập dòng đã khoanh vùng | Có quyền Xem |
| Bật chế độ nhập hàng loạt | BP quản lý nhà thầu | Nhấn nút "Nhập hàng loạt" trên màn Danh sách | Thao tác nhấn nút | Lưới chuyển sang chế độ nhập | Có quyền Cập nhật / Sửa |
| Nhập giá nhiều dòng | BP quản lý nhà thầu | Nhập giá vào ô của từng dòng cần cập nhật Dòng không chạm tới giữ nguyên giá cũ | Giá trị nhập tay | Bộ đệm dòng thay đổi | Chỉ cột giá được nhập |
| Validate tại ô | Hệ thống | Kiểm tra kiểu số, giá trị \> 0 Kiểm tra ô bị xóa trắng của dòng đã có giá | Giá trị từng ô | Trạng thái hợp lệ/lỗi của ô Bộ đếm dòng thay đổi | Validate khi rời ô (on-blur) |
| Xác nhận trước khi lưu | BP quản lý nhà thầu | Xem bảng Mã dòng giá / Giá cũ / Giá mới rồi xác nhận | Tập dòng thay đổi | Lệnh lưu được xác nhận | Không còn ô lỗi |
| Lưu hàng loạt | Hệ thống | Persist toàn bộ dòng thay đổi Ghi 1 bản ghi log cho mỗi dòng | Tập dòng thay đổi đã xác nhận | Giá mới hiệu lực ngay Lịch sử hoạt động | Nguyên khối; còn ô lỗi thì chặn |
| Phát sinh cảnh báo hạ nguồn | Hệ thống | Phát sinh cảnh báo tại dòng giá bán định mức tương ứng cho từng dòng đã lưu | Kết quả lưu | Cảnh báo tại menu liên quan | Áp dụng cho từng dòng |
| Đồng bộ dòng bị xóa | Hệ thống | Loại dòng đã bị xóa do đồng bộ khỏi tập lưu | Trạng thái dòng nguồn | Thông báo kết quả lưu một phần | Không làm thất bại toàn bộ lần lưu |

# **3\. Đặc tả Tính năng**

*Mặc định mỗi tính năng được đặc tả bằng User Story \+ Acceptance Criteria. Các story đánh dấu \[PHỨC TẠP\] có thêm khối "Use Case chi tiết" mô tả main/alternative/exception flow.*

## **3.1. MODULE: Giá mua định mức — Nhập hàng loạt**

### **3.1.1 Danh sách user story**

**Chú thích mức độ ưu tiên (MoSCoW):**

* Must have: bắt buộc để sản phẩm hoạt động / tuân thủ pháp luật-hợp đồng → Sprint hiện tại/kế tiếp.

* Should have: quan trọng, có thể tạm workaround → đưa vào Sprint nếu còn năng lực sau P1.

* Could have: mong muốn, cải thiện trải nghiệm → làm khi dư buffer hoặc sprint sau.

#### **User story 1: Nhập hàng loạt giá mua định mức \[PHỨC TẠP\]**

| Mục | Mô tả |
| ----- | ----- |
| ID US | US\_GDM\_09 |
| Tên Story | Nhập/cập nhật giá mua định mức cho nhiều dòng giá cùng lúc trên màn Danh sách |
| User Story | Là Bộ phận quản lý nhà thầu, tôi muốn nhập giá mua định mức cho nhiều dòng giá cùng lúc ngay trên màn Danh sách, để rút ngắn thời gian thiết lập benchmark sau mỗi đợt đồng bộ dòng giá nhà thầu. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Giá mua định mức |
| Người Phụ trách (Owner) | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| AC1 | Nút "Nhập hàng loạt" hiển thị trên màn Danh sách của từng tab phân hệ, áp dụng cho cả 5 phân hệ; chỉ hiển thị khi người dùng có quyền Cập nhật. | Hiển thị nút cho người không có quyền; thiếu nút ở một trong 5 phân hệ. |
| AC2 | Nhấn nút → lưới chuyển sang chế độ nhập: – Cột "Giá mua định mức" của mọi dòng trở thành ô nhập inline. – Các cột khác (ID, thuộc tính đặc thù, Đơn vị tính) giữ chỉ đọc. – Hiển thị nguyên các cảnh báo trong danh sách dòng giá mua định mức: "Dòng giá chưa được thiết lập giá định mức" / "Giá nhà thầu tham chiếu vừa thay đổi, vui lòng kiểm tra" – Hiện thanh công cụ nổi: bộ đếm dòng thay đổi, nút "Lưu tất cả", nút "Hủy bỏ". | Cho sửa cột ngoài "Giá mua định mức"; không hiển thị thanh công cụ hoặc bộ đếm. |
| AC3 | Phạm vi dòng được nhập đúng bằng tập dòng đang hiển thị theo tab \+ tìm kiếm \+ bộ lọc \+ sắp xếp đang áp dụng, vẫn nhóm theo từng bảng đầu mục giá. Không tạo mới, không xóa dòng. | Chế độ nhập bỏ qua bộ lọc đang áp dụng; hoặc cho thêm/xóa dòng giá. |
| AC4 | Người dùng nhập giá cho 1 hoặc nhiều dòng tùy ý; dòng không được chạm tới giá trị cũ và không phát sinh bản ghi lịch sử khi chưa nhấn Lưu. Nếu đang sử dụng bộ lọc Trạng thái giá bán \= Chưa thiết lập, khi nhập giá cho các dòng chưa có giá \=\> có giá mua định mức, hệ thống vẫn hiển thị các dòng giá này (Khi Lưu thành công dòng giá, hệ thống lưu giá trị mới vaf cập nhật trạng thái dòng giá \= Đã thiết lập) | Ghi log cho dòng không thay đổi; hoặc ghi đè dòng không chạm tới. |
| AC5 | Validate tại ô khi rời ô (on-blur): – Bắt buộc kiểu số. – Giá trị phải lớn hơn 0\. – Không nhận ký tự chữ hoặc số âm. Ô lỗi hiển thị viền đỏ kèm tooltip nêu lý do. | Cho nhập ký tự chữ/số âm; hoặc không báo lỗi ngay tại ô. |
| AC6 | Xử lý ô để trống: – Dòng ĐÃ CÓ giá: xóa trắng ô → báo lỗi "Vui lòng nhập giá mua định mức" (đồng bộ AC2 US\_GDM\_06). – Dòng CHƯA CÓ giá (= null): để trống → coi như không thay đổi, không báo lỗi. | Cho lưu khi xóa trắng giá của dòng đã thiết lập; hoặc báo lỗi với dòng vốn đang để trống. |
| AC7 | Khi còn tồn tại ít nhất 1 ô lỗi: nhấn nút "Lưu tất cả" hệ thống báo lỗi và focus vào dòng lỗi; hệ thống không lưu một phần. | Cho lưu khi còn ô lỗi; hoặc lưu các dòng hợp lệ và bỏ qua dòng lỗi. |
| AC8 | Chuyển trang / đổi bộ lọc / đổi sắp xếp khi đang ở chế độ nhập: hệ thống GIỮ LẠI toàn bộ giá trị đã nhập chưa lưu và giữ nguyên bộ đếm. Rời khỏi menu hoặc nhấn "Hủy bỏ" khi còn dòng chưa lưu → hiện hộp xác nhận "Có {n} dòng chưa lưu, bạn có chắc muốn thoát?". | Mất dữ liệu đã nhập khi chuyển trang; hoặc thoát mà không cảnh báo. |
| AC9 | Nhấn "Lưu tất cả" → persist toàn bộ, hiệu lực ngay, thông báo "Đã cập nhật giá mua định mức cho {n} dòng". | Lưu ngay không qua bảng xác nhận; hoặc thông báo không nêu số dòng đã cập nhật. |
| AC10 | Mỗi dòng được cập nhật ghi MỘT bản ghi Lịch sử hoạt động riêng, gồm: – Thời gian – Người thao tác – Hành động \= "Cập nhật giá mua định mức (nhập hàng loạt)" – Nội dung \= Giá cũ → Giá mới | Gộp chung 1 bản ghi log cho nhiều dòng; hoặc không phân biệt được thao tác nhập hàng loạt với cập nhật đơn lẻ. |
| AC11 | Sau khi lưu thành công: – Dòng từ null → có giá hết trạng thái cảnh báo "chưa thiết lập định mức" (AC4 US\_GDM\_06). – Dòng có icon cảnh báo “Giá nhà thầu có điều chỉnh” của các dòng vừa được lưu tự động ẩn cảnh báo. – Mỗi dòng vừa cập nhật đều hiển thị cảnh báo tooltip tại dòng giá bán định mức tương ứng (BR14 tài liệu gốc). | Không phát sinh cảnh báo hạ nguồn; hoặc chỉ phát sinh cho dòng đầu tiên trong tập lưu. |
| AC12 | Nếu một dòng đang nhập bị hệ thống tự xóa do đồng bộ (BR8 tài liệu gốc) trước khi lưu: dòng đó bị loại khỏi tập lưu, các dòng còn lại vẫn được lưu, hệ thống báo "Đã cập nhật {n} dòng. {m} dòng không còn tồn tại do dữ liệu đã được đồng bộ lại". | Lưu thất bại toàn bộ chỉ vì 1 dòng bị xóa; hoặc lưu thành công vào dòng đã bị xóa. |
| AC13 | Nhấn "Hủy bỏ" và xác nhận → loại bỏ toàn bộ giá trị chưa lưu, thoát chế độ nhập, danh sách trở về chế độ xem với dữ liệu gốc. | Hủy bỏ nhưng giá trị vẫn được lưu; hoặc không thoát khỏi chế độ nhập. |
| AC14 | Nút "Nhập hàng loạt" và nút Import/Export cùng hiển thị trên màn Danh sách, hoạt động độc lập, không thay thế nhau. | Ẩn nút Import/Export khi bổ sung Nhập hàng loạt; hoặc 2 chức năng dùng chung luồng xử lý. |
| AC15 | Khi một người dùng đang ở chế độ Nhập hàng loạt trên một bảng giá, hệ thống khóa bảng giá đó theo cơ chế khóa đồng thời (pessimistic lock): người dùng khác mở cùng bảng giá chỉ xem được, không vào được chế độ Nhập hàng loạt và không sửa được Giá mua định mức của bảng giá đó cho tới khi phiên nhập kết thúc (Lưu tất cả, Hủy bỏ hoặc hết hạn khóa). | Hai người dùng cùng vào được chế độ Nhập hàng loạt trên một bảng giá; hoặc khóa không được giải phóng sau khi phiên nhập kết thúc. |
| AC16 | Tập dòng chuẩn bị lưu có dòng thuộc đầu mục giá vừa bị tắt kích hoạt giữa phiên nhập: – Nhấn "Lưu tất cả" → hệ thống hiển thị cảnh báo: "Đầu mục giá {ID đầu mục giá} \- {Tên đầu mục giá} đã bị tắt kích hoạt, tiếp tục lưu sẽ không lưu cho các dòng giá thuộc đầu mục này. Chắc chắn tiếp tục lưu?" – Người dùng xác nhận → hệ thống loại các dòng giá thuộc đầu mục "Ngừng hoạt động" khỏi tập lưu và lưu các dòng giá hợp lệ còn lại. – Người dùng hủy → giữ nguyên chế độ nhập, không lưu dòng nào. | Lưu cả dòng thuộc đầu mục giá đã tắt kích hoạt; hoặc hủy toàn bộ lần lưu thay vì chỉ loại các dòng không hợp lệ. |

**▸ Use Case chi tiết UC\_GDM\_09 — Nhập hàng loạt giá mua định mức**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| ----- | ----- |
| Actor chính | Bộ phận quản lý nhà thầu |
| Actor phụ | Hệ thống LogXPro (đồng bộ dòng giá tham chiếu từ Quản lý giá mua) Menu Giá bán định mức (hệ thống hạ nguồn nhận cảnh báo) |
| Precondition | 1\. Người dùng có quyền Cập nhật giá mua định mức. 2\. Người dùng đang ở màn Danh sách Giá mua định mức và đã chọn 1 tab phân hệ. 3\. Tab đang xem có ít nhất 1 dòng giá định mức. |
| Trigger | Người dùng nhấn nút "Nhập hàng loạt" trên màn Danh sách. |
| Luồng chính (Main flow) | 1\. Người dùng áp tìm kiếm/bộ lọc để khoanh vùng nhóm dòng cần nhập. 2\. Người dùng nhấn "Nhập hàng loạt". 3\. Hệ thống chuyển lưới sang chế độ nhập: cột Giá mua định mức thành ô nhập, các cột còn lại giữ chỉ đọc. 4\. Hệ thống hiển thị thanh công cụ nổi gồm bộ đếm "{n} dòng đã thay đổi", nút "Lưu tất cả" và nút "Hủy bỏ". 5\. Người dùng nhập giá cho một hoặc nhiều dòng. 6\. Hệ thống validate từng ô khi người dùng rời ô và cập nhật bộ đếm theo thời gian thực. 7\. Người dùng nhấn "Lưu tất cả". 8\. Hệ thống hiển thị bảng xác nhận gồm Mã dòng giá, Giá cũ, Giá mới. 9\. Người dùng xác nhận. 10\. Hệ thống persist toàn bộ dòng thay đổi, ghi 1 bản ghi log cho mỗi dòng, phát sinh cảnh báo tại menu Giá bán định mức, thoát chế độ nhập và làm mới danh sách. |
| Luồng thay thế (Alternative) | 5a. Người dùng chuyển trang hoặc đổi bộ lọc khi đang nhập. 5a1. Hệ thống giữ nguyên giá trị đã nhập chưa lưu trong bộ đệm và giữ nguyên bộ đếm. 5b. Người dùng để trống ô của dòng vốn chưa có giá (= null). 5b1. Hệ thống bỏ qua dòng đó, không tính là thay đổi và không báo lỗi. 7a. Không có dòng nào thay đổi khi nhấn "Lưu tất cả". 7a1. Hệ thống hiển thị cảnh báo "Chưa có dòng giá nào được thay đổi" và giữ nguyên chế độ nhập. 9a. Người dùng hủy tại bảng xác nhận. 9a1. Hệ thống đóng bảng xác nhận, giữ nguyên chế độ nhập và toàn bộ giá trị đã nhập. |
| Luồng ngoại lệ (Exception) | 6a. Ô nhập chứa ký tự không phải số, giá trị ≤ 0, hoặc bị xóa trắng ở dòng đã thiết lập giá. 6a1. Hệ thống hiển thị viền đỏ kèm tooltip lý do và disable nút "Lưu tất cả". 7b. Người dùng nhấn "Lưu tất cả" khi còn ô không hợp lệ. 7b1. Hệ thống chặn lưu, hiển thị "Còn {n} dòng nhập chưa hợp lệ, vui lòng kiểm tra lại" và cuộn tới ô lỗi đầu tiên. 10a. Một hoặc nhiều dòng trong tập lưu đã bị hệ thống tự xóa do đồng bộ. 10a1. Hệ thống loại các dòng đó khỏi tập lưu, lưu các dòng còn lại và báo "Đã cập nhật {n} dòng. {m} dòng không còn tồn tại do dữ liệu đã được đồng bộ lại". 10b. Người dùng rời màn hoặc nhấn "Hủy bỏ" khi còn dòng chưa lưu. 10b1. Hệ thống hiển thị hộp xác nhận "Có {n} dòng chưa lưu, bạn có chắc muốn thoát?"; xác nhận → xóa toàn bộ bộ đệm. |
| Postcondition | 1\. Các dòng thay đổi có Giá mua định mức mới, có hiệu lực ngay. 2\. Mỗi dòng được cập nhật có 1 bản ghi Lịch sử hoạt động riêng. 3\. Dòng từ null → có giá hết cảnh báo "chưa thiết lập định mức". 4\. Mỗi dòng được cập nhật phát sinh cảnh báo tooltip tại dòng giá bán định mức tương ứng. 5\. Lưới trở về chế độ xem, bộ đệm được xóa. |
| Business Rules liên quan | BR22, BR23, BR24, BR25, BR26, BR27, BR28, BR29, BR30, BR31, BR32, BR33, BR34, BR35, BR36, BR37, BR38, BR39, BR40 |

#### **User story 2: Xem bảng giá nhà thầu ngay trong lưới Nhập hàng loạt**

| Mục | Mô tả |
| ----- | ----- |
| ID US | US\_GDM\_10 |
| Tên Story | Xem bảng giá nhà thầu của từng dòng giá bằng cơ chế mở rộng trong dòng |
| User Story | Là Bộ phận quản lý nhà thầu, tôi muốn xem bảng giá của các nhà thầu ngay tại dòng giá đang nhập, để quyết định mức giá mua định mức dựa trên giá thực tế mà không phải rời khỏi lưới nhập hàng loạt. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Giá mua định mức |
| Người Phụ trách (Owner) | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| AC1 | Mỗi dòng giá định mức trong lưới có icon mũi tên (chevron) ở đầu dòng; nhấn vào → bảng giá nhà thầu của dòng đó hiển thị ngay bên dưới dòng; nhấn lại → thu gọn. | Không có icon mở rộng; hoặc nhấn không mở/không thu gọn được. |
| AC2 | Panel mở rộng hiển thị tiêu đề "Bảng giá nhà thầu" kèm số lượng nhà thầu đang cung ứng tổ hợp của dòng giá đó. | Thiếu tiêu đề hoặc số lượng nhà thầu hiển thị sai. |
| AC3 | Bảng giá nhà thầu gồm đúng 6 cột: – Tên nhà thầu – Hạng nhà thầu – Đơn giá – Quy đổi tiền tệ – So với định mức – Hạn mức sản lượng khuyến nghị | Thiếu cột; hoặc thêm cột ngoài danh sách đã chốt. |
| AC4 | Chỉ hiển thị dòng giá nhà thầu có trạng thái "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" (BR4 tài liệu gốc); quy tắc hiển thị dòng "Tất cả" áp dụng theo BR13 tài liệu gốc. | Hiển thị dòng chưa "Đã phê duyệt"; hoặc sai chiều bao trùm giữa dòng "Tất cả" và dòng giá trị cụ thể. |
| AC5 | Cột "Quy đổi tiền tệ" luôn quy đổi theo tỷ giá Vietcombank tại thời điểm hiển thị: – Tiền tệ quy đổi \= VND. – Dòng giá nhà thầu có tiền tệ VNĐ → Quy đổi tiền tệ \= Đơn giá gốc. – Không có ô nhập tỷ giá thủ công trong panel. | Panel cho nhập tỷ giá thủ công; hoặc quy đổi không dùng tỷ giá Vietcombank. |
| AC6 | Ngay bên dưới bảng hiển thị dòng ghi chú: "Tỷ giá quy đổi tiền tệ được áp dụng theo tỷ giá Vietcombank". | Thiếu dòng ghi chú; hoặc nội dung ghi chú khác với quy định. |
| AC7 | Cột "So với định mức" \= Quy đổi tiền tệ − Giá mua định mức của dòng: – Giá trị âm (thấp hơn định mức) hiển thị màu xanh. – Giá trị dương (cao hơn định mức) hiển thị màu đỏ. – Giá mua định mức trống hoặc Quy đổi tiền tệ trống → để trống cột So với định mức. | Tính sai công thức; hoặc không phân biệt màu; hoặc không để trống khi thiếu dữ liệu. |
| AC8 | Cột "So với định mức" tính theo giá trị đang hiển thị trong ô nhập Giá mua định mức của dòng và được tính lại ngay khi người dùng gõ, không chờ tới khi nhấn Lưu. | Cột So với định mức chỉ cập nhật sau khi lưu, khiến người dùng không đối chiếu được giá đang gõ. |
| AC9 | Cột "Hạng nhà thầu" và "Hạn mức sản lượng khuyến nghị" lấy theo ID nhà thầu từ menu Quản lý nhà thầu: – Hạng nhà thầu: Ưu tiên / Dự phòng / Chiến lược. – Hạn mức sản lượng khuyến nghị: kiểu Text area, hiển thị chỉ đọc tại menu này. – Không lấy được giá trị → để trống ô tương ứng. | Lấy sai nguồn dữ liệu; hoặc cho chỉnh sửa 2 trường này tại menu Giá mua định mức. |
| AC10 | Nội dung "Hạn mức sản lượng khuyến nghị" dài hơn 2 dòng hiển thị → cắt bớt kèm dấu ba chấm, hover hiển thị tooltip đầy đủ nội dung. | Nội dung dài làm vỡ chiều cao dòng; hoặc không xem được nội dung đầy đủ. |
| AC11 | Tối đa 1 dòng được mở rộng tại một thời điểm; mở dòng mới → dòng đang mở tự thu gọn. | Cho mở nhiều dòng cùng lúc làm lưới quá dài; hoặc dòng cũ không tự thu gọn. |
| AC12 | Mở hoặc thu gọn panel KHÔNG làm mất giá trị đang nhập chưa lưu và KHÔNG thay đổi bộ đếm dòng thay đổi trên thanh công cụ. | Mở/thu gọn panel làm mất dữ liệu đang nhập hoặc reset bộ đếm. |
| AC13 | Chức năng xem bảng giá nhà thầu chỉ yêu cầu quyền Xem; người dùng không có quyền Cập nhật vẫn mở rộng và xem được panel. | Chặn xem panel vì người dùng không có quyền Cập nhật. |

### 

### **3.1.2 Mô tả giao diện**

Link UI Design: \[Chèn link\].

Màn hình áp dụng: màn Danh sách Giá mua định mức ở chế độ Nhập hàng loạt — lưới nhập inline theo từng bảng đầu mục giá, kèm thanh công cụ nổi và bảng xác nhận trước khi lưu.

**Ảnh giao diện — Lưới Nhập hàng loạt với panel Bảng giá nhà thầu đang mở rộng:**

![][image2]

*Hình 1\. Dòng SBP-0143 được mở rộng, hiển thị bảng giá nhà thầu 6 cột và dòng ghi chú tỷ giá Vietcombank.*   
*(Ảnh chỉ mang tính chất minh họa, không phải giao diện chuẩn thiết kế cho hệ thống)*

**Bảng trường dữ liệu — Panel "Bảng giá nhà thầu" (mở rộng trong dòng):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Tên nhà thầu |  | Text (chỉ đọc) | — | (Tham chiếu) | Lấy theo ID nhà thầu từ menu Quản lý nhà thầu |
| Hạng nhà thầu |  | Select (chỉ đọc) | — | (Tham chiếu) | Ưu tiên / Dự phòng / Chiến lược Lấy theo ID nhà thầu từ Quản lý nhà thầu |
| Đơn giá |  | Number (chỉ đọc) | — | (Tham chiếu) | Đơn giá gốc của dòng giá nhà thầu, kèm ký hiệu tiền tệ |
| Quy đổi tiền tệ |  | Number (chỉ đọc) | — | (Tự tính) | Đơn giá × tỷ giá Vietcombank, đơn vị VND Dòng giá tiền tệ VNĐ → bằng Đơn giá gốc |
| So với định mức |  | Number (chỉ đọc) | — | (Tự tính) | Quy đổi tiền tệ − Giá mua định mức của dòng Âm: màu xanh · Dương: màu đỏ Thiếu dữ liệu → để trống |
| Hạn mức sản lượng khuyến nghị |  | Text area (chỉ đọc) | \[Đề xuất\] 500 ký tự | (Tham chiếu) | Văn bản tự do, lấy theo ID nhà thầu từ Quản lý nhà thầu Hiển thị tối đa 2 dòng, quá dài → cắt bớt kèm tooltip |

**Bảng trường dữ liệu — Lưới nhập hàng loạt (menu Giá mua định mức):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Mã dòng giá |  | Text (chỉ đọc) | — | (Tự sinh) | Định dạng SBP-NNNN; chỉ hiển thị, không cho sửa |
| Thuộc tính đặc thù phân hệ |  | Text (chỉ đọc) | — | (Theo dòng giá) | VD Vận tải: Điểm đi, Điểm đến, Loại xe; không cho sửa |
| Đơn vị tính |  | Text (chỉ đọc) | — | (Theo dòng giá) | Không cho sửa trong chế độ nhập hàng loạt |
| Giá mua định mức (VND) | v (chỉ bắt buộc với các dòng đã có sẵn giá mua định mức) | Number | 15 chữ số | (Giá hiện tại của dòng) | Ô nhập DUY NHẤT của lưới Bắt buộc kiểu số, giá trị \> 0 Validate khi rời ô |
| Bộ đếm dòng thay đổi |  | Number (chỉ đọc) | — | 0 | Hiển thị trên thanh công cụ, cập nhật theo thời gian thực |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

*Mã Business Rule dưới đây là mã chính thức khi hợp nhất vào tài liệu SRS\_LogXPro\_Giá mua định mức (tiếp nối BR21 hiện có).*

* BR22: Nhập hàng loạt là chế độ chỉnh sửa inline trên màn Danh sách, chỉ tác động lên trường "Giá mua định mức" của các dòng đã tồn tại; không tạo mới, không xóa dòng (giữ nguyên BR1).

* BR23: Phạm vi chỉnh sửa bằng đúng tập dòng đang hiển thị theo tab phân hệ \+ tìm kiếm \+ bộ lọc \+ sắp xếp đang áp dụng; áp dụng cho cả 5 phân hệ dịch vụ.

* BR24: Chỉ dòng có thay đổi giá trị so với giá hiện tại mới được persist và ghi Lịch sử hoạt động.

* BR25: Lưu là thao tác nguyên khối trên tập dòng đã thay đổi; còn tồn tại ô nhập không hợp lệ thì chặn lưu toàn bộ, không lưu một phần.

* BR26: Giá trị đã nhập chưa lưu được giữ trong bộ đệm khi người dùng chuyển trang, đổi bộ lọc hoặc đổi sắp xếp trong cùng phiên nhập; rời khỏi menu hoặc hủy bỏ phải qua hộp xác nhận.

* BR27: Mỗi dòng được cập nhật ghi 1 bản ghi Lịch sử hoạt động riêng với hành động "Cập nhật giá mua định mức (nhập hàng loạt)".

* BR28: Mọi hệ quả hạ nguồn của cập nhật đơn lẻ (BR14) được áp dụng đầy đủ cho từng dòng trong lần lưu hàng loạt.

* BR29: Dòng bị hệ thống tự xóa do đồng bộ (BR8) trong lúc đang nhập sẽ bị loại khỏi tập lưu và được báo rõ trong kết quả, không làm thất bại toàn bộ lần lưu.

* BR30: Nhập hàng loạt dùng chung quyền Cập nhật với chức năng cập nhật đơn lẻ; không phát sinh quyền riêng.

* BR31: Nhập hàng loạt và Import/Export file là 2 chức năng độc lập, tồn tại song song trên màn Danh sách; BR18 giữ nguyên hiệu lực.

* BR32: Bảng giá nhà thầu trong lưới Nhập hàng loạt hiển thị theo cơ chế mở rộng trong dòng (inline expand), không dùng popup riêng.

* BR33: Bảng giá nhà thầu trong panel gồm đúng 6 cột: Tên nhà thầu, Hạng nhà thầu, Đơn giá, Quy đổi tiền tệ, So với định mức, Hạn mức sản lượng khuyến nghị.

* BR34: Cột Quy đổi tiền tệ trong panel luôn áp dụng tỷ giá Vietcombank, không cho nhập tỷ giá thủ công tại đây; dòng ghi chú "Tỷ giá quy đổi tiền tệ được áp dụng theo tỷ giá Vietcombank" hiển thị ngay dưới bảng. Nhập tỷ giá thủ công chỉ thực hiện tại màn Chi tiết (US\_GDM\_07).

* BR35: Hạng nhà thầu và Hạn mức sản lượng khuyến nghị lấy theo ID nhà thầu từ menu Quản lý nhà thầu; Hạn mức sản lượng khuyến nghị có kiểu dữ liệu Text area, chỉ đọc tại menu Giá mua định mức.

* BR36: Cột So với định mức trong panel tính theo giá trị đang hiển thị trong ô nhập Giá mua định mức của dòng và được tính lại ngay khi người dùng gõ, không chờ đến khi Lưu.

* BR37: Tối đa 1 dòng được mở rộng tại một thời điểm; mở dòng mới thì dòng đang mở tự thu gọn.

* BR38: Mở hoặc thu gọn panel không ảnh hưởng tới bộ đệm dữ liệu đang nhập chưa lưu và không thay đổi bộ đếm dòng thay đổi.

* BR39: Khóa đồng thời (pessimistic lock): tại một thời điểm chỉ một người dùng được vào chế độ Nhập hàng loạt trên một bảng giá. Người dùng khác chỉ xem, không được sửa đồng thời, cho tới khi phiên nhập kết thúc (Lưu tất cả, Hủy bỏ hoặc hết hạn khóa).

* BR40: Đầu mục giá bị tắt kích hoạt giữa phiên nhập: khi nhấn Lưu tất cả, hệ thống cảnh báo và yêu cầu xác nhận; người dùng xác nhận → hệ thống loại các dòng giá thuộc đầu mục "Ngừng hoạt động" khỏi tập lưu và lưu các dòng giá hợp lệ còn lại.

### **3.1.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| ----- | ----- | ----- | ----- |
| Nhập ký tự không phải số hoặc giá trị ≤ 0 | Lỗi | "Giá mua định mức phải là số lớn hơn 0" | Viền đỏ ô nhập kèm tooltip Disable nút "Lưu tất cả" |
| Xóa trắng giá của dòng đã thiết lập | Lỗi | "Vui lòng nhập giá mua định mức" | Viền đỏ ô nhập Disable nút "Lưu tất cả" |
| Nhấn "Lưu tất cả" khi còn ô không hợp lệ | Lỗi | "Còn {n} dòng nhập chưa hợp lệ, vui lòng kiểm tra lại" | Không lưu Cuộn tới ô lỗi đầu tiên |
| Nhấn "Lưu tất cả" khi không có dòng nào thay đổi | Thông báo | "Chưa có dòng giá nào được thay đổi" | Tắt chế độ nhập và chuyển về màn Danh sách |
| Xác nhận lưu hàng loạt thành công | Thành công | "Đã cập nhật giá mua định mức cho {n} dòng" | Persist toàn bộ, hiệu lực ngay Ghi log từng dòng Phát sinh cảnh báo tại Giá bán định mức Thoát chế độ nhập và làm mới danh sách |
| Lưu thành công nhưng có dòng đã bị xóa do đồng bộ | Cảnh báo | "Đã cập nhật {n} dòng. {m} dòng không còn tồn tại do dữ liệu đã được đồng bộ lại" | Bỏ qua dòng không tồn tại Làm mới danh sách |
| Nhấn "Hủy bỏ" hoặc rời màn khi còn dòng chưa lưu | Cảnh báo | "Có {n} dòng chưa lưu, bạn có chắc muốn thoát?" | Xác nhận → xóa toàn bộ bộ đệm Không → giữ nguyên chế độ nhập |
| Người dùng không có quyền Cập nhật | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn nút "Nhập hàng loạt", chặn thao tác |
| Mở rộng dòng nhưng tổ hợp không còn dòng giá nhà thầu hợp lệ | Thông tin | "Chưa có giá nhà thầu cho tổ hợp này" | Hiển thị trạng thái rỗng trong panel, không báo lỗi hệ thống |
| Không lấy được tỷ giá Vietcombank khi hiển thị panel | Cảnh báo | "Chưa lấy được tỷ giá Vietcombank, cột Quy đổi tiền tệ tạm để trống" | Để trống cột Quy đổi tiền tệ và So với định mức Các cột còn lại vẫn hiển thị bình thường |
| Lỗi hệ thống khi đang lưu hàng loạt | Lỗi | "Cập nhật không thành công, vui lòng thử lại" | Rollback toàn bộ lần lưu Giữ nguyên bộ đệm để người dùng thao tác lại |
| Người dùng mở chế độ Nhập hàng loạt trên bảng giá đang bị người khác khóa | Cảnh báo | "Bảng giá đang được {Tên người dùng} cập nhật, vui lòng thử lại sau" | Không cho vào chế độ Nhập hàng loạt Giữ màn Danh sách ở chế độ xem |
| Nhấn "Lưu tất cả" khi tập lưu có dòng thuộc đầu mục giá vừa bị tắt kích hoạt | Cảnh báo | "Đầu mục giá {ID đầu mục giá} \- {Tên đầu mục giá} đã bị tắt kích hoạt, tiếp tục lưu sẽ không lưu cho các dòng giá thuộc đầu mục này. Chắc chắn tiếp tục lưu?" | Xác nhận → loại các dòng thuộc đầu mục "Ngừng hoạt động" khỏi tập lưu và lưu các dòng hợp lệ còn lại Hủy → giữ nguyên chế độ nhập, không lưu dòng nào |
| Lưu thành công sau khi loại dòng thuộc đầu mục giá đã tắt kích hoạt | Cảnh báo | "Đã cập nhật {n} dòng. {m} dòng thuộc đầu mục giá đã tắt kích hoạt không được lưu." | Làm mới danh sách Các dòng bị loại giữ nguyên giá cũ |

### **3.1.5. Tích hợp & Luồng xử lý dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| ----- | ----- | ----- | ----- | ----- |
| Quản lý giá mua | Xác định vòng đời dòng giá định mức được phép nhập | Quản lý giá mua → Giá mua định mức | Khi dòng giá nhà thầu được thêm/sửa/duyệt/xóa; khi mở rộng panel | Dòng bị xóa khi đang nhập → loại khỏi tập lưu, báo "{m} dòng không còn tồn tại" |
| Quản lý nhà thầu | Cung cấp Hạng nhà thầu và Hạn mức sản lượng khuyến nghị cho panel | Quản lý nhà thầu → panel Bảng giá nhà thầu | Khi mở rộng panel của một dòng giá | Không lấy được giá trị → để trống ô tương ứng, không chặn hiển thị panel |
| Tỷ giá VCB (Vietcombank) | Cung cấp tỷ giá cho cột Quy đổi tiền tệ trong panel | Tỷ giá VCB → panel Bảng giá nhà thầu | Khi mở rộng panel của một dòng giá | Lấy tỷ giá thất bại → để trống cột Quy đổi tiền tệ và So với định mức, hiển thị cảnh báo |
| Cấu hình đầu mục giá | Nhóm dòng giá theo đầu mục trong lưới nhập | Cấu hình đầu mục giá → Giá mua định mức | Khi hiển thị lưới nhập hàng loạt | Đầu mục bị tắt kích hoạt → ẩn/khóa nhóm và dòng, không nhập được |
| Giá bán định mức | Nhận cảnh báo khi benchmark thay đổi | Giá mua định mức → Giá bán định mức | Khi lưu hàng loạt thành công | Từng dòng cập nhật phát sinh 1 cảnh báo tooltip riêng |
| Lịch sử hoạt động | Truy vết thay đổi giá theo từng dòng | Giá mua định mức → Lịch sử hoạt động | Khi lưu hàng loạt thành công | Ghi log thất bại → rollback toàn bộ lần lưu |

# **4\. Đánh giá độ phủ rule (Case còn thiếu)**

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| ----- | ----- | ----- | ----- |
|  |  |  |  |
|  |  |  |  |

# **5\. Đề xuất cải tiến UI/UX**

*Các nội dung dưới đây là đề xuất bổ sung, không thay thế yêu cầu gốc; cần PO xem xét trước khi đưa vào phạm vi triển khai.*

* \[Đề xuất\] Thao tác bàn phím kiểu bảng tính: Enter hoặc phím mũi tên xuống để chuyển ô dưới, Tab để chuyển dòng kế, Esc để hoàn tác ô đang sửa. Đây là yếu tố quyết định tốc độ nhập của chức năng.

* \[Đề xuất\] Dán dữ liệu từ Excel: cho phép copy một cột số từ Excel và dán vào lưới, hệ thống điền lần lượt xuống các dòng theo thứ tự hiển thị.

* \[Đề xuất\] Điền xuống (fill down): chọn 1 ô đã nhập rồi áp cùng giá trị cho các dòng bên dưới.

* \[Đề xuất\] Áp một giá cho nhiều dòng đã chọn: tick chọn nhiều dòng, nhập 1 giá và áp cho toàn bộ dòng đã chọn.

* \[Đề xuất\] Highlight trực quan: dòng đã sửa chưa lưu tô nền vàng nhạt; hover vào ô hiển thị "Giá cũ: {X}".

* \[Đề xuất\] Lối tắt từ bộ lọc: bổ sung nút nhanh "Nhập giá cho các dòng chưa thiết lập" — tự động áp bộ lọc trạng thái chưa có giá và bật chế độ nhập hàng loạt, vì đây là kịch bản sử dụng chính.

* \[Đề xuất\] Thanh công cụ dạng sticky luôn hiển thị ở cuối màn hình để người dùng không phải cuộn lên tìm nút Lưu khi lưới dài.

# **Phụ lục A. Hướng dẫn áp dụng mô hình Hybrid theo Sprint**

* Refinement: bẻ Epic → User Story \+ AC; đánh dấu \[PHỨC TẠP\] cho story nhiều nhánh/nhiều actor để bổ sung Use Case.

* Sprint Planning: chỉ story đạt Definition of Ready mới đưa vào Sprint Backlog; đính wireframe & business rule.

* Trong Sprint: US \+ AC là living doc; tester biến AC (và Use Case flow) trực tiếp thành test case.

* Review/Done: cập nhật lại US/UC theo thực tế build, đồng bộ Data Dictionary & bảng tích hợp.

# **Phụ lục B. Các mục cần cập nhật trong tài liệu SRS gốc**

| Tài liệu | Vị trí cần cập nhật | Nội dung cập nhật |
| ----- | ----- | ----- |
| SRS\_LogXPro\_Giá mua định mức | Mục 1.2 — In-scope | Bổ sung dòng: "Nhập hàng loạt giá mua định mức trực tiếp trên lưới màn Danh sách" |
| SRS\_LogXPro\_Giá mua định mức | Mục 3.1.1 — Danh sách user story | Bổ sung US\_GDM\_09 và UC\_GDM\_09 |
| SRS\_LogXPro\_Giá mua định mức | Mục 3.1.3 — Business Rule | Bổ sung BR22 – BR40 |
| SRS\_LogXPro\_Giá mua định mức | Mục 3.1.3 — BR18 | Giữ nguyên hiệu lực; bổ sung ghi chú Import/Export và Nhập hàng loạt là 2 chức năng độc lập |
| SRS\_LogXPro\_Giá mua định mức | Mục 3.1.4 — Thông báo và lỗi | Bổ sung 9 dòng thông báo tại mục 3.1.4 tài liệu này |

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification \- SRS)*

***Ghi chú phiên bản:** Các nội dung được tô vàng là phần chỉnh sửa/bổ sung so với phiên bản tài liệu gần nhất.*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu "Giá mua định mức" (Bảng giá mua định mức chuẩn) |
| :---- | :---- |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | Trang BA |
| **Ngày tạo** | \[dd/MM/yyyy\] |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Menu "Giá mua định mức" quản lý bảng giá mua định mức chuẩn (benchmark) của doanh nghiệp — là mức giá tham chiếu nội bộ, KHÔNG phải giá đã ký với một nhà thầu cụ thể. Dữ liệu được phân nhóm theo 5 phân hệ dịch vụ (Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát, Sang tải) và map theo từng đầu mục giá đã thiết lập ở menu "Cấu hình đầu mục giá".

Mỗi dòng giá định mức được tham chiếu động từ các dòng giá trong menu "Quản lý giá mua" (không tạo mới/xóa thủ công tại menu này). Menu chỉ sở hữu và cho phép chỉnh sửa trường "Giá mua định mức". Trên màn chi tiết, mỗi dòng định mức hiển thị bảng so sánh giá thực tế theo từng nhà thầu (chênh lệch so với định mức, hạng nhà thầu, trạng thái giá) kèm chức năng quy đổi tiền tệ để đối chiếu khi các nhà thầu báo giá ở tiền tệ khác nhau.

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Xem danh sách giá mua định mức theo 5 phân hệ, nhóm theo đầu mục giá.

* Phân trang (pagination) danh sách dòng giá định mức theo từng đầu mục giá.

* Tìm kiếm theo Mã ID; Lọc theo Trạng thái giá mua và theo các cột đặc thù của từng loại dịch vụ; Sắp xếp theo Giá mua định mức.

* Nút Export/Import (chỉ mô tả nút; quy tắc validate chi tiết ở phiên bản sau).

* Xem chi tiết 1 dòng giá định mức: bộ thông tin dòng giá (chỉ đọc), Giá mua định mức, bảng "Giá mua theo nhà thầu" (Quy đổi tiền tệ, So với định mức, Hạng nhà thầu, Trạng thái giá) và lịch sử hoạt động (có phân trang).

* Cập nhật Giá mua định mức (chỉ chỉnh sửa trường Giá mua định mức; các thuộc tính dòng giá chỉ đọc).

* Quy đổi tiền tệ: chọn Nguồn tỷ giá (Thủ công / Tỷ giá VCB), nhập Tỷ giá (khi Thủ công), nhấn Cập nhật để hệ thống tính lại cột Quy đổi tiền tệ; Tiền tệ quy đổi mặc định \= VND và bị khóa (disable).

* Tham chiếu & đồng bộ động dòng giá nhà thầu từ Quản lý giá mua: tự sinh / tự xóa dòng định mức theo vòng đời dòng giá nguồn.

* Phân quyền theo chức năng Xem/Cập nhật (riêng Tìm kiếm/Lọc/Sắp xếp không kiểm soát phân quyền).

**Ngoài phạm vi (Out-of-scope):**

* Thêm mới / Xóa dòng giá định mức thủ công — dòng giá định mức là dữ liệu động tham chiếu từ Quản lý giá mua, không CRUD trực tiếp tại menu này.

* Luồng phê duyệt thay đổi Giá mua định mức — KHÔNG áp dụng: thay đổi giá mua định mức có hiệu lực ngay.

* Quy tắc validate chi tiết khi Import/Export CSV — đặc tả ở phiên bản sau.

* Ngưỡng kiểm soát/cảnh báo khi giá nhà thầu thực tế vượt định mức tại Quản lý giá mua — chưa xác nhận (xem mục 4).

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

[https\://drive.google.com/file/d/1O0VMvaEw2NrL3raYZdp\_5eN-yPrsKuAa/view?usp=sharing](https://drive.google.com/file/d/1O0VMvaEw2NrL3raYZdp_5eN-yPrsKuAa/view?usp=sharing) 

\[Chèn sơ đồ BPMN/Flowchart – .drawio khi có\]

![][image1]

**Mô tả luồng chính:**

* Người dùng (Bộ phận quản lý nhà thầu) mở menu Giá mua định mức, chọn 1 phân hệ dịch vụ, xem danh sách dòng giá định mức nhóm theo đầu mục giá (tìm kiếm/lọc/sắp xếp/phân trang). Đầu mục giá lấy từ Cấu hình đầu mục giá.

* Hệ thống tự tham chiếu các dòng giá nhà thầu "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" từ Quản lý giá mua, gom theo tổ hợp (Đầu mục giá \+ thuộc tính đặc thù \+ Đơn vị tính) thành các dòng giá định mức; dòng định mức chỉ tồn tại khi có ít nhất 1 dòng giá nhà thầu hợp lệ tham chiếu.

* Khi xuất hiện tổ hợp mới chưa có định mức, hệ thống tự sinh dòng định mức (mã theo quy tắc SBP-NNNN) với Giá mua định mức \= null và hiển thị cảnh báo (tooltip) tại dòng.

* Khi có thao tác thêm mới/chỉnh sửa/xóa dòng giá nhà thầu tham chiếu, dòng định mức tương ứng hiển thị cảnh báo (tooltip); cảnh báo được ẩn khi người dùng mở màn chi tiết dòng đó.

* Xem chi tiết 1 dòng định mức: bộ thông tin dòng giá \+ Giá mua định mức \+ bảng giá theo nhà thầu (Quy đổi tiền tệ, So với định mức, Hạng nhà thầu, Trạng thái giá) \+ lịch sử (có phân trang).

* Cập nhật giá mua định mức (chỉ trường Giá mua định mức), Lưu có hiệu lực ngay, ghi lịch sử; đồng thời hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng.

* Quy đổi tiền tệ: chọn Nguồn tỷ giá (Thủ công/Tỷ giá VCB), nhập/lấy Tỷ giá, nhấn Cập nhật, hệ thống tính lại cột Quy đổi tiền tệ; cột So với định mức so sánh Giá mua định mức với cột Quy đổi tiền tệ.

* Khi mọi dòng giá nhà thầu của một tổ hợp bị xóa/ngừng tham chiếu tại Quản lý giá mua, hệ thống xóa dòng định mức và giá benchmark đã nhập.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Chọn phân hệ & xem danh sách | Bộ phận quản lý nhà thầu | Mở menu, chọn 1/5 phân hệ; xem dòng giá định mức nhóm theo đầu mục; tìm/lọc/sắp xếp/phân trang | Danh mục đầu mục giá \+ dòng giá nhà thầu tham chiếu | Danh sách giá mua định mức | Có quyền Xem |
| Đồng bộ tham chiếu động | Hệ thống | Gom dòng giá nhà thầu "Đã phê duyệt" (bảng "Đang hoạt động") theo tổ hợp thành dòng định mức | Dòng giá nhà thầu từ Quản lý giá mua | Dòng giá định mức (động) | Chỉ tồn tại khi có ≥1 dòng nhà thầu hợp lệ |
| Tự sinh dòng định mức mới | Hệ thống | Tổ hợp mới chưa có định mức, tạo dòng (sinh mã SBP-...), Giá định mức \= null \+ tooltip cảnh báo | Tổ hợp thuộc tính mới | Dòng định mức chờ nhập giá | Benchmark null → cảnh báo |
| Xem chi tiết | Bộ phận quản lý nhà thầu | Xem thông tin dòng giá \+ bảng giá nhà thầu \+ lịch sử (phân trang) | Dòng định mức đã chọn | Chi tiết dòng định mức | Có quyền Xem |
| Cập nhật giá định mức | Bộ phận quản lý nhà thầu | Sửa trường Giá mua định mức (các trường khác chỉ đọc), có hiệu lực ngay | Giá mua định mức mới | Giá định mức cập nhật \+ log \+ tooltip tại giá bán định mức | Có quyền Cập nhật |
| Quy đổi tiền tệ | Bộ phận quản lý nhà thầu | Chọn Nguồn tỷ giá, nhập/lấy Tỷ giá, nhấn Cập nhật để tính cột Quy đổi | Tỷ giá \+ Nguồn tỷ giá | Cột Quy đổi tiền tệ theo nhà thầu | Tiền tệ quy đổi \= VND (disable) |
| Tự xóa dòng định mức | Hệ thống | Mọi dòng nhà thầu của tổ hợp bị xóa/ngừng → xóa dòng định mức & benchmark | Trạng thái dòng nhà thầu nguồn | Dòng định mức bị xóa | Không giữ lại giá benchmark |

# **3\. Đặc tả Tính năng**

## **3.1. MODULE: Giá mua định mức**

### **3.1.1 Danh sách user story**

#### **User story 1: Xem danh sách giá mua định mức**

| ID US | US\_GDM\_01 |
| :---- | :---- |
| **Tên Story** | Xem danh sách giá mua định mức theo phân hệ, nhóm theo đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem danh sách giá mua định mức theo phân hệ và nhóm theo đầu mục giá, để nắm nhanh mức benchmark hiện tại của từng dịch vụ và truy cập vào từng dòng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Hiển thị đủ 5 tab phân hệ (Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát, Sang tải);  Mỗi tab hiển thị từng bảng đầu mục giá chứa danh sách dòng giá định mức (mã \+ tên \+ loại giá). | Thiếu tab; không nhóm theo đầu mục giá. |
| AC2 | Mỗi tab hiển thị các cột: ID, Bộ thông tin thuộc tính (theo loại dịch vụ \- xem 3.1.2), Đơn vị tính, Giá mua định mức, Thao tác. | Sai/thiếu cột theo phân hệ; thiếu Giá mua định mức. |
| AC3 | Danh sách dòng giá định mức trong mỗi đầu mục giá có phân trang (pagination): hiển thị theo trang, cho chuyển trang và chọn số dòng mỗi trang. | Không phân trang; chuyển trang sai dữ liệu. |
| AC4 | Khi có thao tác thêm mới/chỉnh sửa/xóa dòng giá nhà thầu (tại Quản lý giá mua) tham chiếu đến một dòng giá định mức, dòng định mức tương ứng hiển thị cảnh báo (tooltip). Cảnh báo được ẩn khi người dùng nhấn vào mở màn chi tiết của dòng đó. | Không hiển thị cảnh báo khi giá nhà thầu tham chiếu thay đổi; hoặc cảnh báo không ẩn sau khi mở chi tiết. |
| AC5 | Đầu mục giá bị tắt kích hoạt ở Cấu hình đầu mục giá → nhóm đầu mục và toàn bộ dòng định mức thuộc đầu mục đó bị ẩn/khóa, không sử dụng được. | Đầu mục đã tắt kích hoạt vẫn hiển thị/dùng được. |
| AC6 | Dòng giá định mức mới tự sinh (tổ hợp mới chưa có benchmark) hiển thị cảnh báo (tooltip) và Giá mua định mức \= trống (chờ nhập). | Không cảnh báo dòng chưa thiết lập định mức. |
| AC7 | Chức năng Xem danh sách/chi tiết chỉ hiển thị khi người dùng có quyền Xem; không có quyền → không truy cập được menu và không thấy dữ liệu. | Không có quyền Xem vẫn truy cập/xem được dữ liệu. |

#### **User story 2: Tìm kiếm dòng giá định mức**  

| ID US | US\_GDM\_02 |
| :---- | :---- |
| **Tên Story** | Tìm kiếm dòng giá định mức theo Mã ID |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn tìm kiếm dòng giá định mức theo Mã ID, để truy cập nhanh một dòng giá cụ thể trong danh sách. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Ô tìm kiếm cho nhập từ khóa theo Mã ID dòng giá định mức; kết quả trả ra đúng dòng khớp. | Tìm kiếm trả kết quả sai. |
| AC2 | Tìm kiếm áp dụng trong phạm vi phân hệ (tab) đang xem; không có kết quả → hiển thị trạng thái rỗng phù hợp. | Tìm kiếm áp dụng nhầm sang tab khác; không xử lý trạng thái rỗng. |
| AC3 | Chức năng Tìm kiếm không kiểm soát phân quyền: mọi người dùng truy cập được danh sách đều dùng được. | Chặn tìm kiếm vì lý do phân quyền. |

#### **User story 3: Lọc dòng giá định mức** 

| ID US | US\_GDM\_03 |
| :---- | :---- |
| **Tên Story** | Lọc dòng giá định mức theo cột đặc thù của từng loại dịch vụ |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn lọc dòng giá định mức theo các cột đặc thù của từng loại dịch vụ, để khoanh vùng nhanh nhóm dòng giá cần xem. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Cho lọc theo các cột đặc thù của từng loại dịch vụ và có Bộ lọc mở rộng:  (1) Vận tải: Điểm đi, Điểm đến, Loại xe;  (2) Kho bãi: Tên kho, Loại kho;  (3) Khai báo Hải quan: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe;  (4) Hải quan Giám sát: Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe;  (5) Sang tải: Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa. Lọc theo Đầu mục giá: giá trị lọc là danh sách các đầu mục giá đã cấu hình theo loại dịch vụ tương ứng — đang ở tab loại dịch vụ nào thì hiển thị và lọc theo danh sách đầu mục giá của loại dịch vụ đó. Lọc theo Trạng thái giá mua (Đã có giá mua / Chưa có giá mua)  | Thiếu cột lọc đặc thù theo loại dịch vụ; lọc ra kết quả sai.  Danh sách Đầu mục giá hiển thị lẫn đầu mục của loại dịch vụ khác (không đúng tab đang xem); hoặc lọc theo Đầu mục giá cho ra kết quả sai. |
| AC2 | Phạm vi lọc áp dụng cho tab dịch vụ đang thao tác, không áp dụng cho các tab dịch vụ còn lại. | Lọc áp dụng nhầm sang tab khác. |
| AC3 | Khi lọc theo một thuộc tính, kết quả bao gồm các dòng có giá trị đúng bộ lọc và các dòng có giá trị "Tất cả" ở thuộc tính đó (dòng "Tất cả" luôn khớp mọi bộ lọc của thuộc tính tương ứng). | Lọc bỏ sót dòng "Tất cả". |
| AC4 | Chức năng Lọc không kiểm soát phân quyền: mọi người dùng truy cập được danh sách đều dùng được. | Chặn lọc vì lý do phân quyền. |
| AC5 | Lọc theo đầu mục giá: lọc theo 1 đầu mục giá → chỉ hiển thị các dòng giá thuộc đầu mục giá đã chọn  | Hiển thị cả các đầu mục giá khác |

#### **User story 4: Sắp xếp dòng giá định mức** 

| ID US | US\_GDM\_04 |
| :---- | :---- |
| **Tên Story** | Sắp xếp dòng giá định mức theo Giá mua định mức |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn sắp xếp dòng giá định mức theo Giá mua định mức, để so sánh nhanh mức benchmark cao/thấp trong một đầu mục giá. |
| **Độ Ưu tiên** | Should have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Cho sắp xếp theo Giá mua định mức tăng dần / giảm dần; kết quả trả ra đúng. Phạm vi sắp xếp áp dụng cho tab dịch vụ đang thao tác, không áp dụng cho các tab dịch vụ còn lại. | Sắp xếp ra kết quả sai; hoặc sắp xếp theo trường khác Giá mua định mức. |
| AC2 | Sắp xếp kết hợp được với tìm kiếm và lọc đang áp dụng. | Sắp xếp làm mất bộ lọc/từ khóa đang áp dụng. |
| AC3 | Chức năng Sắp xếp không kiểm soát phân quyền: mọi người dùng truy cập được danh sách đều dùng được. | Chặn sắp xếp vì lý do phân quyền. |

#### **User story 5: Xem chi tiết dòng giá định mức**

| ID US | US\_GDM\_05 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết dòng giá định mức, bảng so sánh giá theo nhà thầu và lịch sử |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem chi tiết 1 dòng giá định mức cùng bảng so sánh giá của từng nhà thầu, để đánh giá mức giá các nhà thầu so với định mức chuẩn và truy vết thay đổi. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Bộ thông tin chi tiết dòng giá định mức hiển thị: Loại dịch vụ, Đầu mục giá (mã \+ tên), Loại giá, Mã dòng giá, các thuộc tính đặc thù phân hệ (ví dụ Vận tải: Điểm đi, Điểm đến, Loại xe), Đơn vị tính, Tiền tệ, Giá mua định mức. | Thiếu/sai trường thông tin dòng giá. |
| AC2 | Bảng "Giá mua theo nhà thầu" liệt kê các nhà thầu có dòng giá cùng tổ hợp, gồm:  Mã,  Tên nhà thầu \+ Mã số thuế,  Hạng nhà thầu,  Đơn giá gốc,  Quy đổi tiền tệ,  So với định mức,  Trạng thái giá. | Thiếu cột; không gom đúng các nhà thầu cùng tổ hợp. |
| AC3 | Chỉ tham chiếu dòng giá nhà thầu có trạng thái "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động"; dòng định mức chỉ tồn tại khi có ít nhất 1 dòng giá nhà thầu hợp lệ như vậy. | Đưa vào bảng dòng chưa "Đã phê duyệt"/không thuộc bảng "Đang hoạt động". |
| AC4 | Cột "So với định mức" \= Quy đổi tiền tệ của nhà thầu − Giá mua định mức; âm (thấp hơn) màu xanh, dương (cao hơn) màu đỏ; nếu Quy đổi tiền tệ chưa có giá trị → để trống (null). | So sánh sai nguồn; hoặc không để trống khi Quy đổi tiền tệ null. |
| AC5 | Cột "Hạng nhà thầu" (Ưu tiên / Dự phòng) được lấy theo ID nhà thầu từ menu Quản lý nhà thầu. | Hạng nhà thầu không lấy đúng theo ID nhà thầu từ Quản lý nhà thầu. |
| AC6 | Khi trong cùng đầu mục giá tồn tại cả dòng định mức giá trị "Tất cả" và dòng định mức giá trị cụ thể của cùng một thuộc tính: (a) tại bảng giá nhà thầu của dòng GIÁ TRỊ CỤ THỂ, dòng giá nhà thầu có giá trị "Tất cả" vẫn xuất hiện và tham gia so sánh; (b) tại bảng giá nhà thầu của dòng GIÁ TRỊ "TẤT CẢ", không hiển thị dòng giá nhà thầu có giá trị cụ thể. | Hiển thị sai chiều bao trùm giữa dòng "Tất cả" và dòng cụ thể. |
| AC7 | Nhấn vào 1 dòng giá mua của nhà thầu, hệ thống điều hướng sang màn Chi tiết nhà thầu của Bảng giá mua chứa dòng giá đó | Không điều hướng hoặc điều hướng sai bảng giá |
| AC8 | Có nút "Cập nhật giá mua định mức" điều hướng sang màn cập nhật (US\_GDM\_06); chỉ hiển thị khi người dùng có quyền Cập nhật. | Hiển thị nút cho người không có quyền; điều hướng sai dòng. |
| AC9 | Lịch sử hoạt động hiển thị: Thời gian, Người thao tác, Hành động, Nội dung; cho tìm kiếm và làm mới. Khi mở màn chi tiết, cảnh báo (tooltip) thay đổi giá nhà thầu ở danh sách của dòng này được ẩn. | Log thiếu người thao tác/nội dung; không tìm kiếm/làm mới được; cảnh báo không ẩn khi mở chi tiết. |
| AC10 | Danh sách lịch sử hoạt động có phân trang (pagination): hiển thị theo trang, cho chuyển trang. | Lịch sử hoạt động không phân trang; chuyển trang sai dữ liệu. |
| AC11 | Khi danh sách dòng giá nhà thầu thuộc dòng định mức có thay đổi (tham chiếu dòng giá nhà thầu mới, hoặc đơn giá nhà thầu có điều chỉnh), bảng "Giá mua theo nhà thầu" trên màn Chi tiết giá mua định mức highlight (tô nền) dòng giá nhà thầu tương ứng đã thay đổi/mới thêm;  Highlight tự ẩn khi người dùng mở lại màn Chi tiết của dòng định mức đó (cùng cơ chế ẩn cảnh báo tại BR16). | Không highlight dòng giá nhà thầu thay đổi/mới thêm; hoặc highlight không tự ẩn sau khi người dùng đã mở lại màn Chi tiết. |

#### **User story 6: Cập nhật giá mua định mức**

| ID US | US\_GDM\_06 |
| :---- | :---- |
| **Tên Story** | Cập nhật trường Giá mua định mức của một dòng giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn cập nhật Giá mua định mức của một dòng giá, để điều chỉnh mức benchmark chuẩn mà không tác động tới các thuộc tính dòng giá (được tham chiếu động). |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Nhấn "Cập nhật giá mua định mức" mở modal chứa bộ thông tin dòng giá ở chế độ chỉ xem (disabled) và duy nhất trường "Giá mua định mức (VND)" cho phép chỉnh sửa. | Modal cho sửa các trường ngoài Giá mua định mức. |
| AC2 | Giá mua định mức bắt buộc, kiểu số; để trống khi Lưu → chặn và báo lỗi. | Cho lưu khi Giá mua định mức trống. |
| AC3 | Nút "Lưu thông tin" persist giá trị mới, có hiệu lực ngay và ghi lịch sử hoạt động hành động "Cập nhật giá mua định mức", thông báo thành công; "Hủy bỏ" không lưu thay đổi. | Lưu không ghi log; hoặc Hủy bỏ vẫn lưu. |
| AC4 | Với dòng định mức mới tự sinh (benchmark \= null), người dùng nhập Giá mua định mức lần đầu → dòng hết trạng thái cảnh báo "chưa thiết lập định mức". | Sau khi nhập giá, dòng vẫn còn cảnh báo chưa thiết lập. |
| AC5 | Cập nhật giá mua định mức thành công → hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng ở menu Giá bán định mức. | Không hiển thị cảnh báo tại dòng giá bán định mức sau khi cập nhật giá mua định mức. |
| AC6 | Chặn người dùng cập nhật giá định mức khi không có quyền Cập nhật; ẩn nút và chặn thao tác. | Người dùng không có quyền vẫn cập nhật thành công. |

#### **User story 7: Quy đổi tiền tệ bảng giá nhà thầu**

| ID US | US\_GDM\_07 |
| :---- | :---- |
| **Tên Story** | Quy đổi tiền tệ giá nhà thầu về một tiền tệ chung |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn quy đổi giá nhà thầu về một tiền tệ chung theo tỷ giá, để so sánh công bằng khi các nhà thầu báo giá ở các loại tiền tệ khác nhau. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Trong chi tiết dòng giá định mức có chức năng Quy đổi tiền tệ gồm: Tỷ giá, Nguồn tỷ giá (dropdown), Tiền tệ quy đổi (mặc định \= VND, khóa/disable, không cho đổi). | Thiếu trường; hoặc Tiền tệ quy đổi vẫn cho đổi khác VND. |
| AC2 | Nguồn tỷ giá cho chọn: "Thủ công" (người dùng nhập Tỷ giá tay) hoặc "Tỷ giá VCB" (hệ thống lấy tỷ giá thực tế của Vietcombank). | Không có 2 lựa chọn nguồn tỷ giá. |
| AC3 | Luồng: người dùng chọn Nguồn tỷ giá; nếu chọn "Thủ công" thì nhập Tỷ giá USD \-\> VNĐ, CNY \-\> VNĐ;  → hệ thống cập nhật cột "Quy đổi tiền tệ" theo Tỷ giá đã nhập. Trường hợp để trống 1 trong 2 tỷ giá (hoặc cả 2 tỷ giá), cột Quy đổi tiền tệ chỉ tiến hành quy đổi cho tỷ giá đã nhập (VD: Chỉ nhập USD \-\> VNĐ, chỉ tính cột Quy đổi tiền tệ cho dòng giá nhà thầu có tiền tệ USD, không đổi cho dòng giá CNY) Đối với dòng giá nhà thầu có tiền tệ VNĐ, cột Quy đổi tiền tệ luôn \= Đơn giá nhà thầu (đơn giá gốc) | Không có nút Cập nhật; hoặc đổi tỷ giá không cập nhật cột Quy đổi. Nhập tỷ giá, cột Quy đổi tiền tệ tính sai. |
| AC4 | Cột "Quy đổi tiền tệ" \= Đơn giá nhà thầu × Tỷ giá (theo đúng tiền tệ từ giá mua nhà thầu), hiển thị đơn vị theo Tiền tệ quy đổi (VND). | Tính sai giá trị quy đổi. |
| AC5 | Khi chọn "Tỷ giá VCB": hệ thống tự điền Tỷ giá theo Vietcombank (trường Tỷ giá chỉ đọc); tần suất cập nhật tỷ giá là 10 phút/1 lần. | Nguồn VCB vẫn cho sửa tay; hoặc không cập nhật theo chu kỳ 10 phút/lần. |
| AC6 | Lấy tỷ giá VCB thất bại (lỗi mạng/nguồn) → hiển thị thông báo lỗi và cho phép chuyển sang nhập thủ công. | Lỗi lấy tỷ giá nhưng không thông báo/không có phương án thay thế. |
| AC7 | Sau khi cập nhật cột Quy đổi tiền tệ, cột "So với định mức" tính lại theo Quy đổi tiền tệ; nếu Quy đổi tiền tệ chưa có giá trị → để trống cột "So với định mức". | Đổi tỷ giá nhưng cột So với định mức không cập nhật/không để trống đúng. |

#### **User story 8: Đồng bộ tham chiếu động & vòng đời dòng giá định mức**  

| ID US | US\_GDM\_08 |
| :---- | :---- |
| **Tên Story** | Tự sinh / tự xóa dòng giá định mức theo vòng đời dòng giá nhà thầu nguồn |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn dòng giá định mức được đồng bộ động theo dòng giá nhà thầu ở Quản lý giá mua, để danh mục định mức luôn phản ánh đúng các tổ hợp dịch vụ đang có nhà thầu cung ứng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Mỗi dòng giá định mức tương ứng 1 tổ hợp duy nhất: Đầu mục giá \+ bộ thuộc tính đặc thù phân hệ \+ Đơn vị tính. Mọi dòng giá nhà thầu trùng tổ hợp được gom vào 1 dòng định mức. | Tách/nhân đôi dòng định mức cho cùng tổ hợp; hoặc gộp sai các tổ hợp khác nhau. |
| AC2 | Dòng giá định mức chỉ tồn tại khi có ít nhất 1 dòng giá nhà thầu "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" tham chiếu đến (điều kiện tồn tại). | Dòng định mức tồn tại khi không có dòng giá nhà thầu hợp lệ nào tham chiếu. |
| AC3 | Xuất hiện tổ hợp mới ở Quản lý giá mua (chưa từng có định mức) → hệ thống tự sinh dòng định mức mới với Giá mua định mức \= null và hiển thị cảnh báo (tooltip) tại dòng. | Không tự sinh dòng; hoặc sinh nhưng không cảnh báo benchmark trống. |
| AC4 | Khi mọi dòng giá nhà thầu của một tổ hợp bị xóa hoặc ngừng tham chiếu → hệ thống xóa dòng định mức và giá benchmark đã nhập (không giữ lại). | Dòng định mức vẫn hiển thị hoặc còn giữ benchmark sau khi hết dòng nhà thầu nguồn. |
| AC5 | Dòng có giá trị "Tất cả" ở một thuộc tính và dòng có giá trị cụ thể được coi là các tổ hợp riêng, mỗi loại có dòng định mức và benchmark riêng, không gộp chung. | Gộp dòng "Tất cả" với dòng giá trị cụ thể thành một dòng định mức. |
| AC6 | Mã dòng giá định mức do hệ thống tự sinh theo cấu trúc SBP-NNNN (xem BR19 & bảng mã dịch vụ 3.1.2); người dùng không nhập/sửa mã. | Mã không tự sinh hoặc sai cấu trúc SBP-NNNN. |

### **3.1.2 Mô tả giao diện (Reviewing)**

* Ảnh giao diện: \[Chèn ảnh Danh sách / Chi tiết dòng giá định mức / Modal Cập nhật giá mua định mức\].

* Link UI Design: \[Chèn link\].

* Màn hình chính: Danh sách giá mua định mức theo phân hệ (nhóm đầu mục giá, có phân trang); Chi tiết dòng giá định mức (thông tin dòng giá \+ bảng giá theo nhà thầu \+ quy đổi tiền tệ \+ lịch sử có phân trang); Modal Cập nhật giá mua định mức.

**Bảng trường dữ liệu — Modal "Cập nhật giá mua định mức":**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Mã dòng giá | — | Text (chỉ đọc) | — | (Tự sinh) | Tự sinh theo quy tắc SBP-NNNN (xem BR19) |
| Thuộc tính đặc thù phân hệ (ví dụ Vận tải: Điểm đi, Điểm đến, Loại xe) | — | Text (chỉ đọc) | — | (Tự điền) | Theo phân hệ (xem cấu trúc cột bên dưới); chỉ xem |
| Đơn vị tính | — | Text (chỉ đọc) | — | (Tự điền) | Chỉ xem |
| Tiền tệ | — | Text (chỉ đọc) | — | (Tự điền) | Chỉ xem |
| Giá mua định mức (VND) | v | Number | — | (Trống) | Trường DUY NHẤT cho chỉnh sửa; bắt buộc |

**Quy tắc sinh mã dòng giá mua định mức:** SBP-NNNN. Trong đó SBP \= Standard Buying Price (giá mua định mức); NNNN là số thứ tự. Người dùng không nhập/sửa mã.

| Mã dịch vụ | Loại dịch vụ |
| :---- | :---- |
| TP | Vận tải (Transport) |
| WR | Kho bãi (Warehouse) |
| CD | Khai báo Hải quan (Customs Declaration) |
| CS | Hải quan Giám sát (Customs Supervision) |
| TS | Sang tải (Transshipment) |

*Ghi chú: mã ví dụ trên giao diện hiện tại (LN-VT-001) sẽ được chuẩn hóa theo quy tắc sinh mã nêu trên.*

**Bảng trường dữ liệu — Chức năng "Quy đổi tiền tệ" (trong chi tiết dòng giá định mức):**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Nguồn tỷ giá | v | Select (enum) | — | Thủ công | Thủ công / Tỷ giá VCB (lấy tỷ giá thực tế Vietcombank, cập nhật 10 phút/lần) |
| Tỷ giá | v (khi Thủ công) | Number | — | (Trống) | Nhập tay khi nguồn \= Thủ công; tự điền & chỉ đọc khi nguồn \= Tỷ giá VCB |
| Tiền tệ quy đổi | v | Select (enum) | — | VND | Mặc định VND và bị khóa (disable), không cho đổi |

**Cấu trúc cột danh sách dòng giá định mức theo từng phân hệ (nhóm theo đầu mục giá):**

| Phân hệ | Cột đặc thù | Cột chung |
| :---- | :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (2) Kho bãi | Tên kho, Loại kho | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa | Đơn vị tính, Tiền tệ, Giá mua định mức |

**Bộ lọc theo cột đặc thù của từng loại dịch vụ (US\_GDM\_03):**

| Phân hệ | Cột được phép lọc |
| :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Cửa khẩu, Loại xe |
| (2) Kho bãi | Tên kho, Loại kho |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa |

**Cấu trúc cột bảng "Giá mua theo nhà thầu" (trong chi tiết):**

| Cột | Mô tả |
| :---- | :---- |
| Mã (nhà thầu/dòng giá) | Mã dòng giá nhà thầu (ví dụ QUO-001) |
| Tên nhà thầu \+ Mã số thuế | Tên và mã số thuế nhà thầu |
| Đơn giá (chưa gồm VAT) | Đơn giá thực tế của nhà thầu |
| Quy đổi tiền tệ | Đơn giá nhà thầu × Tỷ giá, theo Tiền tệ quy đổi (VND) |
| So với định mức | Quy đổi tiền tệ − Giá mua định mức; âm \= xanh, dương \= đỏ; Quy đổi tiền tệ null → để trống |
| Hạng nhà thầu | Ưu tiên / Dự phòng/Chiến lược, lấy theo ID nhà thầu từ menu Quản lý nhà thầu |
| Trạng thái giá | Trạng thái dòng giá nhà thầu (ví dụ Đã phê duyệt) |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

| ID | Quy tắc |
| :---- | :---- |
| BR1 | Dòng giá định mức KHÔNG được tạo mới/xóa thủ công tại menu này; toàn bộ dòng được tham chiếu động từ dòng giá trong Quản lý giá mua. |
| BR2 | 1 dòng giá định mức \= 1 tổ hợp duy nhất: Đầu mục giá \+ bộ thuộc tính đặc thù phân hệ \+ Đơn vị tính. Mọi dòng giá nhà thầu trùng tổ hợp được gom vào 1 dòng định mức để so sánh với 1 mức benchmark. |
| BR3 | Dòng có giá trị "Tất cả" ở một thuộc tính và dòng có giá trị cụ thể được coi là các tổ hợp RIÊNG — mỗi loại có dòng định mức và benchmark riêng, không gộp chung. |
| BR4 | Chỉ tham chiếu dòng giá nhà thầu có trạng thái "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" (theo BR15 tài liệu Quản lý giá mua). |
| BR5 | Điều kiện tồn tại của dòng định mức: một dòng giá định mức chỉ tồn tại khi có ít nhất 1 dòng giá nhà thầu "Đã phê duyệt" thuộc bảng giá mua "Đang hoạt động" tham chiếu đến. |
| BR6 | Đầu mục giá lấy từ Cấu hình đầu mục giá; đầu mục bị tắt kích hoạt → nhóm đầu mục và các dòng định mức thuộc đầu mục đó bị ẩn/khóa, không sử dụng/tham chiếu được cho đến khi bật lại. |
| BR7 | Vòng đời — tự sinh: khi xuất hiện tổ hợp mới ở Quản lý giá mua chưa có định mức, hệ thống tự sinh dòng định mức với Giá mua định mức \= null và hiển thị cảnh báo (tooltip) chờ nhập. |
| BR8 | Vòng đời — tự xóa: khi mọi dòng giá nhà thầu của một tổ hợp bị xóa/ngừng tham chiếu (không còn dòng "Đã phê duyệt" thuộc bảng "Đang hoạt động"), hệ thống xóa dòng định mức và giá benchmark đã nhập (không giữ lại). |
| BR9 | Chỉ trường "Giá mua định mức" do menu này sở hữu và cho phép chỉnh sửa; mọi thuộc tính khác của dòng giá là chỉ đọc (đến từ dòng nguồn). |
| BR10 | So với định mức \= Quy đổi tiền tệ của nhà thầu − Giá mua định mức; giá trị âm (thấp hơn định mức) hiển thị màu xanh, dương (cao hơn) hiển thị màu đỏ. Nếu cột Quy đổi tiền tệ chưa có giá trị → để trống (null) cột So với định mức. |
| BR11 | Quy đổi tiền tệ: Tiền tệ quy đổi mặc định \= VND và bị khóa (disable). Nguồn tỷ giá \= Thủ công (nhập tay) hoặc Tỷ giá VCB (lấy tỷ giá thực tế Vietcombank, cập nhật 10 phút/lần). Người dùng chọn nguồn, nhập/lấy Tỷ giá, nhấn Cập nhật → cột Quy đổi tiền tệ \= Đơn giá nhà thầu × Tỷ giá. |
| BR12 | Hạng nhà thầu (Ưu tiên / Dự phòng) được lấy theo ID nhà thầu từ menu Quản lý nhà thầu. |
| BR13 | Hiển thị dòng nhà thầu theo giá trị "Tất cả": tại bảng giá nhà thầu của dòng định mức giá trị cụ thể, dòng giá nhà thầu có giá trị "Tất cả" vẫn xuất hiện và tham gia so sánh; tại bảng giá nhà thầu của dòng định mức giá trị "Tất cả", không hiển thị dòng giá nhà thầu có giá trị cụ thể. |
| BR14 | Cập nhật Giá mua định mức có hiệu lực ngay (không qua phê duyệt) và được ghi vào Lịch sử hoạt động (Thời gian, Người thao tác, Hành động, Nội dung); cập nhật thành công → hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng. |
| BR15 | Danh sách dòng giá định mức theo từng đầu mục giá và danh sách lịch sử hoạt động đều được phân trang (pagination). |
| BR16 | Khi có thao tác thêm mới/chỉnh sửa/xóa dòng giá nhà thầu tham chiếu, dòng định mức tương ứng hiển thị cảnh báo (tooltip); cảnh báo được ẩn khi người dùng mở màn chi tiết của dòng đó. |
| BR17 | Phân quyền: chức năng Xem/Cập nhật được kiểm soát bằng phân quyền (nút/action chỉ hiển thị và thao tác được khi có quyền). Riêng chức năng Tìm kiếm/Lọc/Sắp xếp danh sách dòng giá KHÔNG kiểm soát phân quyền. |
| BR18 | Import/Export dòng giá định mức: chỉ mô tả nút trong phiên bản này; quy tắc validate/ghi đè/thêm mới đặc tả ở phiên bản sau. |
| BR19 | Mã dòng giá mua định mức do hệ thống tự sinh theo cấu trúc SBP-NNNN. SBP \= Standard Buying Price; NNNN là số thứ tự. Người dùng không nhập/sửa mã. |
| BR20 | Bộ lọc Đầu mục giá (trường lọc bổ sung trong AC1 của US\_GDM\_03): giá trị lọc là danh sách đầu mục giá đã cấu hình trong Cấu hình đầu mục giá theo từng loại dịch vụ;  |
| BR21 | Highlight dòng giá nhà thầu thay đổi/mới trong bảng "Giá mua theo nhà thầu" (màn Chi tiết): áp dụng khi có dòng giá nhà thầu mới phát sinh hoặc đơn giá nhà thầu được điều chỉnh;  Highlight tự ẩn khi người dùng mở lại màn Chi tiết của dòng đó (cùng cơ chế với cảnh báo tooltip ở BR16). |

### **3.1.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Nhấn "Lưu giá mua định mức" khi để trống Giá mua định mức | Lỗi | "Vui lòng nhập giá mua định mức" | Không lưu, giữ nguyên modal |
| Cập nhật giá mua định mức thành công | Thành công | "Đã cập nhật giá định mức cho dòng {mã}" | Persist giá mới (hiệu lực ngay), ghi lịch sử, đóng modal, hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng |
| Dòng định mức mới tự sinh (chưa có benchmark) | Cảnh báo | "Dòng giá chưa được thiết lập giá định mức" | Hiển thị tooltip tại dòng; chờ người dùng nhập giá |
| Thêm mới/chỉnh sửa/xóa dòng giá nhà thầu tham chiếu đến dòng định mức | Cảnh báo | "Giá nhà thầu tham chiếu vừa thay đổi, vui lòng kiểm tra" | Hiển thị tooltip tại dòng định mức; ẩn khi người dùng mở màn chi tiết |
| Nguồn tỷ giá \= "Thủ công" nhưng để trống Tỷ giá | Lỗi | "Vui lòng nhập tỷ giá" | Không cập nhật cột Quy đổi, giữ nguyên form |
| Lấy Tỷ giá VCB thất bại | Lỗi | "Không lấy được tỷ giá từ Vietcombank, vui lòng thử lại hoặc nhập thủ công" | Cho phép chuyển sang nhập tỷ giá thủ công |
| Mọi dòng giá nhà thầu của tổ hợp bị xóa/ngừng tham chiếu | Thông báo (hệ thống) | (Xóa dòng định mức) | Xóa dòng định mức & giá benchmark đã nhập |
| Người dùng không có quyền với chức năng Xem/Cập nhật | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn nút/action và chặn thao tác Xem/Cập nhật |

### **3.1.5. Luồng xử lý dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Cấu hình đầu mục giá | Cung cấp đầu mục giá (cha) để nhóm dòng định mức & sinh mã dòng | Đầu mục giá → Giá mua định mức | Khi hiển thị danh sách/chi tiết | Đầu mục bị tắt kích hoạt → ẩn & khóa nhóm/dòng định mức |
| Quản lý giá mua | Nguồn dòng giá nhà thầu (động) để so sánh & xác định vòng đời dòng định mức | Dòng giá nhà thầu "Đã phê duyệt" (bảng "Đang hoạt động") → Giá mua định mức | Khi dòng giá nhà thầu thêm/sửa/duyệt/xóa | Hết dòng nhà thầu hợp lệ → xóa dòng định mức & benchmark; thay đổi giá nhà thầu → tooltip cảnh báo |
| Quản lý nhà thầu | Cung cấp Hạng nhà thầu (Ưu tiên/Dự phòng) theo ID nhà thầu | Hạng nhà thầu → bảng giá theo nhà thầu | Khi hiển thị bảng giá theo nhà thầu | Không lấy được hạng → để trống cột Hạng nhà thầu |
| Tỷ giá VCB (Vietcombank) | Cung cấp tỷ giá thực tế cho quy đổi tiền tệ | Tỷ giá VCB → cột Quy đổi tiền tệ | Khi chọn Nguồn tỷ giá \= "Tỷ giá VCB" (cập nhật 10 phút/lần) | Lấy tỷ giá thất bại → báo lỗi, cho nhập thủ công |
| Giá bán định mức | Menu hạ nguồn tham chiếu Giá mua định mức | Giá mua định mức → Giá bán định mức | Khi cập nhật Giá mua định mức | Cập nhật giá mua định mức → hiển thị cảnh báo (tooltip) tại dòng giá bán định mức tương ứng |

### **3.1.6. Tích hợp & Đồng bộ dữ liệu**

# **4\. Đánh giá độ phủ rule (Case còn thiếu)**

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| :---- | :---- | :---- | :---- |
| Hạng nhà thầu (Ưu tiên/Dự phòng) | Đã chốt (BR12) | — | Đã có: lấy theo ID nhà thầu từ menu Quản lý nhà thầu |
| Phê duyệt thay đổi giá định mức | Đã chốt (BR14) | — | Đã có: thay đổi giá mua định mức có hiệu lực ngay, không qua phê duyệt |
| Downstream của giá định mức | Đã chốt (BR14) | — | Đã có: Giá bán định mức tham chiếu; cập nhật giá mua định mức → tooltip cảnh báo tại dòng giá bán định mức |
| Quy tắc sinh mã dòng định mức | Đã chốt (BR19) | — | Đã có: SBP-NNNN |
| Ngưỡng kiểm soát vượt định mức | Chưa chốt | Chưa rõ giá định mức có dùng làm ngưỡng cảnh báo/chặn khi giá nhà thầu thực tế vượt định mức ở Quản lý giá mua | Xác nhận: chỉ tham chiếu/so sánh, hay cảnh báo/chặn khi tạo–duyệt giá nhà thầu vượt định mức |
| Xử lý dòng "Tất cả" vs cụ thể | Đã chốt (BR3, BR13) | — | Đã có: tổ hợp riêng; bảng dòng cụ thể chứa cả dòng nhà thầu "Tất cả", bảng dòng "Tất cả" không chứa dòng nhà thầu cụ thể |
| Điều kiện tồn tại dòng định mức | Đã chốt (BR5, BR8) | — | Đã có: chỉ tồn tại khi có ≥1 dòng nhà thầu hợp lệ; hết dòng → xóa dòng định mức & benchmark |
| Điều chỉnh giá định mức khi đã có bảng giá tham chiếu | Chưa chốt | Chưa rõ giá bán định mức/định mức cũ bị ảnh hưởng ra sao khi benchmark đổi (ngoài tooltip cảnh báo) | Xác nhận benchmark ảnh hưởng lịch sử hay chỉ from-now; hành vi cập nhật giá bán định mức |
| Đầu mục bị xóa/ngưng ở Cấu hình giá nhưng còn định mức active | Đã chốt (BR6) | — | Đã có: đầu mục tắt kích hoạt → ẩn/khóa nhóm & dòng định mức thuộc đầu mục |
| Tỷ giá VCB | Đã chốt một phần (BR11) | Đã có tần suất 10 phút/lần; chưa rõ API nguồn cụ thể, quy tắc làm tròn, lưu vết tỷ giá tại thời điểm quy đổi | Chuẩn hóa API nguồn, quy tắc làm tròn & lưu vết tỷ giá đã áp dụng |
| Schema cột đặc thù 5 phân hệ | Đã chốt | — | Đã có danh sách cột đặc thù & cột lọc cho cả 5 phân hệ (mục 3.1.2) |
| Import/Export CSV | Ngoài phạm vi (chỉ nút) | Quy tắc validate khi import (trùng, sai đầu mục, ghi đè/thêm mới) | Đặc tả ở phiên bản sau |
| Phân quyền | Đã chốt một phần (BR17) | Chưa tách rõ quyền chỉ-xem cho các role liên quan; chưa có ma trận Role × Chức năng | Xây ma trận Role × (Xem / Cập nhật giá định mức); Tìm kiếm/Lọc/Sắp xếp không kiểm soát quyền |

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Thêm giá trị cho trường Hạng nhà thầu: Ưu tiên/Dự phòng/Chiến lược | Trường Hạng nhà thầu: Ưu tiên/Dự phòng | 24/08/2026 | Đồng bộ dữ liệu với doc Quản lý nhà thầu |
| 2 | Nội dung thông báo: “Đã cập nhật giá mua định mức cho dòng {mã}” | Nội dung thông báo: “Cập nhật giá mua định mức thành công” | 24/08/2026 | Đồng bộ với hệ thống |
| 3 | Bổ sung trường Filter Đầu mục giá vào AC1, US\_GDM\_03:  giá trị lọc là danh sách đầu mục giá đã cấu hình theo từng loại dịch vụ — đang ở tab loại dịch vụ nào thì hiển thị và lọc theo danh sách đầu mục giá của loại dịch vụ đó;  chọn 1 đầu mục giá → chỉ hiển thị các dòng giá thuộc đầu mục giá đã chọn (US\_GDM\_03 \- AC1; mục Bộ lọc 3.1.2; BR20). | Chưa có bộ lọc theo Đầu mục giá; chỉ có Bộ lọc mở rộng theo cột đặc thù của từng phân hệ (US\_GDM\_03 \- AC1). | 24/08/2026 | Yêu cầu bổ sung từ PO để hỗ trợ khoanh vùng nhanh dòng giá theo đầu mục giá;  |
| 4 | Bổ sung rule highlight dòng giá nhà thầu thay đổi/mới thêm trên bảng "Giá mua theo nhà thầu" tại màn Chi tiết giá mua định mức, khi phát sinh dòng giá nhà thầu mới hoặc đơn giá nhà thầu hiện có được điều chỉnh; highlight tự ẩn khi mở lại màn Chi tiết (US\_GDM\_05 \- AC11; BR21). | Chưa có cơ chế highlight dòng giá nhà thầu thay đổi/mới trong bảng "Giá mua theo nhà thầu"; chỉ có cảnh báo (tooltip) tại dòng giá định mức ở màn danh sách (BR16). | 24/08/2026 | Yêu cầu bổ sung từ PO để người dùng dễ nhận biết thay đổi giá nhà thầu khi xem chi tiết. |

# So sánh SRS Giá mua định mức — Bản mới (SRS\_LogXPro\_Giá mua định mức (1)) vs Bản cũ (23:59 12/08/2026)

Mục đích: thống kê toàn bộ cập nhật giữa hai bản để kiểm tra đầy đủ thay đổi. Vị trí ghi theo cấu trúc bản mới.

| STT | Vị trí (bản mới) | Nội dung cập nhật | Mô tả chi tiết thay đổi |
| :---- | :---- | :---- | :---- |
| 1 | Mục 2\. Sơ đồ luồng nghiệp vụ | Bổ sung link & hình ảnh sơ đồ | Thêm link Google Drive tới sơ đồ BPMN/Flowchart và chèn ảnh sơ đồ (image1.png) — bản cũ chỉ có placeholder "\[Chèn sơ đồ BPMN/Flowchart \-- .drawio khi có\]" chưa có hình. |
| 2 | Mục 3.1.1, User story 1 – AC1 | Sửa nội dung AC1 | Bản cũ: "mỗi tab hiển thị **danh sách dòng giá định mức** được nhóm theo đầu mục giá". Bản mới: "mỗi tab hiển thị **từng bảng đầu mục giá** chứa danh sách dòng giá định mức" — thay đổi cách mô tả cấu trúc hiển thị (từ 1 danh sách nhóm → nhiều bảng con theo đầu mục giá). |
| 3 | Mục 3.1.1, User story 1 – AC2 | Sửa nội dung AC2 (cấu trúc cột) | Bản cũ: "cột theo phân hệ (xem 3.1.2) và cột chung: Đơn vị tính, Tiền tệ, Giá mua định mức; kèm action Xem chi tiết/Chỉnh sửa giá". Bản mới: "ID, Bộ thông tin thuộc tính (theo loại dịch vụ – xem 3.1.2), Đơn vị tính, Giá mua định mức, Thao tác" — bỏ cột Tiền tệ khỏi danh sách, đổi tên nhóm cột đặc thù thành "Bộ thông tin thuộc tính", gộp action thành cột "Thao tác". |
| 4 | Mục 3.1.1, User story 2 & 3 & 4 | Bỏ nhãn "\[CẬP NHẬT\]" ở tiêu đề | Tiêu đề "User story 2: Tìm kiếm...", "User story 3: Lọc...", "User story 4: Sắp xếp..." không còn gắn nhãn \[CẬP NHẬT\] như bản cũ (có thể do đã chốt, không còn coi là mới cập nhật). |
| 5 | Mục 3.1.1, User story 4 – AC1 | Bổ sung nội dung AC1 (Sắp xếp) | Thêm ý: "Phạm vi sắp xếp áp dụng cho tab dịch vụ đang thao tác, không áp dụng cho các tab dịch vụ còn lại" — làm rõ phạm vi áp dụng của chức năng sắp xếp (trước đây chưa có). |
| 6 | Mục 3.1.1, User story 5 (tiêu đề) | Bỏ nhãn "\[CẬP NHẬT\]" | Tiêu đề "User story 5: Xem chi tiết..." không còn gắn nhãn \[CẬP NHẬT\]. |
| 7 | Mục 3.1.1, User story 5 – AC2 | Sửa nội dung AC2 (cột bảng "Giá mua theo nhà thầu") | Bản cũ liệt kê cột: Mã, Tên nhà thầu \+ Mã số thuế, Đơn giá (chưa gồm VAT), Quy đổi tiền tệ, So với định mức, Hạng nhà thầu, Trạng thái giá. Bản mới đổi thành: Mã, Tên nhà thầu \+ Mã số thuế, **Hạng nhà thầu** (đổi thứ tự lên trước), **Đơn giá gốc** (đổi tên từ "Đơn giá (chưa gồm VAT)"), Quy đổi tiền tệ, So với định mức, Trạng thái giá. |
| 8 | Mục 3.1.1, User story 5 | Bổ sung AC7 mới | Thêm AC7: "Nhấn vào 1 dòng giá mua của nhà thầu, hệ thống điều hướng sang màn Chi tiết nhà thầu của Bảng giá mua chứa dòng giá đó" (Negative: "Không điều hướng hoặc điều hướng sai bảng giá"). Các AC cũ AC7–AC9 (nút Cập nhật, Lịch sử hoạt động, Phân trang lịch sử) được đánh số lại thành AC8–AC10. |
| 9 | Mục 3.1.1, User story 6 – AC3 | Sửa tên nút | Bản cũ: nút "**Lưu giá mua định mức**". Bản mới: nút "**Lưu thông tin**" — đổi tên nút lưu. |
| 10 | Mục 3.1.1, User story 7 – AC3 | Sửa/mở rộng đáng kể nội dung AC3 (luồng nhập tỷ giá thủ công) | Bản cũ: luồng chung "nếu chọn Thủ công thì nhập Tỷ giá; nhấn Cập nhật → cập nhật cột Quy đổi tiền tệ theo Tỷ giá". Bản mới tách chi tiết theo loại tiền tệ: nhập riêng tỷ giá **USD→VNĐ** và **CNY→VNĐ**; nếu để trống 1 trong 2 (hoặc cả 2\) thì cột Quy đổi tiền tệ chỉ tính cho tỷ giá đã nhập (ví dụ chỉ nhập USD→VNĐ thì chỉ quy đổi dòng giá nhà thầu tiền tệ USD, không đổi cho CNY); dòng giá nhà thầu có tiền tệ **VNĐ** thì cột Quy đổi tiền tệ luôn \= Đơn giá nhà thầu (đơn giá gốc). Đồng thời bổ sung Negative case mới: "Nhập tỷ giá, cột Quy đổi tiền tệ tính sai." |
| 11 | Mục 3.1.1, User story 7 – AC4 | Sửa nội dung AC4 | Bản cũ: "Cột 'Quy đổi tiền tệ' \= Đơn giá nhà thầu × Tỷ giá, hiển thị theo Tiền tệ quy đổi (VND)". Bản mới: "= Đơn giá nhà thầu × Tỷ giá (**theo đúng tiền tệ từ giá mua nhà thầu**), hiển thị **đơn vị** theo Tiền tệ quy đổi (VND)" — làm rõ việc áp tỷ giá phải khớp đúng loại tiền tệ nguồn. |
| 12 | Mục 3.1.2, Bảng cấu trúc cột theo phân hệ — dòng (1) Vận tải | Bớt cột đặc thù "Cửa khẩu" | Bản cũ: cột đặc thù phân hệ Vận tải gồm "Điểm đi, Điểm đến, **Cửa khẩu**, Loại xe". Bản mới: chỉ còn "Điểm đi, Điểm đến, Loại xe" — bỏ thuộc tính "Cửa khẩu" khỏi phân hệ Vận tải. |

## Ghi chú

- Toàn bộ các phần còn lại của tài liệu (Mục 1\. Tổng quan & Phạm vi trừ mục 2; Mục 3.1.3 Quy tắc nghiệp vụ; 3.1.4 Danh sách thông báo và lỗi; 3.1.5 Luồng xử lý dữ liệu; 3.1.6 Tích hợp & Đồng bộ dữ liệu; Mục 4\. Đánh giá độ phủ rule) **không có thay đổi** giữa hai bản (đã đối chiếu toàn văn, không phát hiện khác biệt).  
- Riêng User story 8 (Đồng bộ tham chiếu động & vòng đời dòng giá định mức) vẫn giữ nhãn "\[CẬP NHẬT\]" ở cả 2 bản và **không có thay đổi nội dung** giữa 2 bản — nhãn này có thể là còn sót lại từ lần cập nhật trước, không phải cập nhật mới trong lần so sánh này.

## Câu hỏi cần xác nhận

1. Việc bỏ cột "Tiền tệ" khỏi cấu trúc cột danh sách (AC2, US1) — có phải Tiền tệ vẫn tồn tại ở dữ liệu nhưng chỉ không hiển thị riêng cột, hay đã gộp hiển thị trong "Giá mua định mức"? Cần xác nhận để đảm bảo không mất thông tin đơn vị tiền tệ khi xem danh sách.  
2. Việc bỏ thuộc tính "Cửa khẩu" khỏi phân hệ Vận tải (mục 3.1.2) — đây là quyết định nghiệp vụ chính thức (do dữ liệu không cần phân biệt theo cửa khẩu) hay là thiếu sót cần bổ sung lại?

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>