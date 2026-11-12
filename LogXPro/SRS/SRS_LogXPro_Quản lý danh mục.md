# SRS\_Quản lý danh mục

*(Software Requirements Specification  SRS)*

| Tên hệ thống | LogXPro   |
| :---- | :---- |
| **Module** | Quản lý danh mục (Master Data dùng chung toàn hệ thống) |
| **Tài liệu** | SRS Module Quản lý danh mục |
| **Người lập** | Phạm Thị Hương |
| **Ngày tạo** | 14/08/2026 |
| **Phiên bản** | 1.1 |
| **Ngày cập nhật** | 15/10/2026: Bỏ Button thêm mới ở danh mục “đơn vị tính” |

# 1\. Tổng quan & Phạm vi

## 1.1. Mục tiêu

Đặc tả nghiệp vụ thiết lập và quản trị danh mục dùng chung (master data) cho nền tảng LogXPro  phục vụ cả module K1 (Báo giá, Giá mua) và K3 (Tháp Điều Phối). Đây là dữ liệu nền, được tham chiếu (dropdown/multi-select) ở các màn hình nhập liệu trong hệ thống. Module đặt ở khu vực CẤU HÌNH dùng chung, truy cập được từ cả sidebar K1 và K3, không nằm riêng trong 1 phân hệ. Không hiển thị badge/nhãn phân biệt nguồn gốc K1/K3 trên giao diện  đơn giản hóa thành 1 danh sách dùng chung duy nhất. 

**1.2. Phạm vi**

**Trong phạm vi (In-scope):**

* CRUD (Thêm/Sửa/Xem/Bật-Tắt) các giá trị trong từng danh mục hệ thống.  
* Điều hướng qua menu con (accordion) dạng danh sách PHẲNG, không phân nhóm hiển thị  gồm đúng 12 danh mục.  
* Trường Mã TỰ ĐỘNG SINH theo quy tắc Prefix tiếng Anh cố định \+ STT 3 chữ số (VD: BGT-001), người dùng không tự gõ; riêng danh mục 'Chi cục Hải quan' có thêm cột 'Tên viết tắt Chi cục' cho nhập tay tự do; riêng danh mục 'Địa điểm vận tải' dùng Prefix cố định 'TPZ-' (Transport Zone) vì bản chất là khu vực định giá, không phải giá trị danh mục đơn lẻ.   
* Kiểm soát không cho xóa cứng giá trị danh mục đã được dữ liệu nghiệp vụ khác tham chiếu (chỉ Bật/Tắt qua toggle Is activated ngay trên bảng danh sách).  
* Danh mục 'Đặc tính hàng hóa' quản lý các nhãn đặc tính có thể gắn nhiều lựa chọn (multi-select) cho hàng hóa: Hàng nguy hiểm, Hàng dễ vỡ, Hàng đông lạnh.  
* Danh mục "Địa điểm vận tải" là CRUD khu vực định giá vận tải (không phải danh sách phẳng thông thường) — mỗi khu vực gắn 1 Quốc gia, 1 Tỉnh/Thành phố và nhiều Phường/Xã được chọn qua giao diện cascading Quốc gia → Tỉnh/Thành phố → Phường/Xã

**Ngoài phạm vi (Out-of-scope):**

* Import/Export danh mục hàng loạt qua Excel  chưa thuộc phạm vi Sprint 1 (MVP).  
* RBAC chi tiết theo từng vai trò  toàn bộ thao tác thực hiện qua tài khoản Admin.  
* Cấu hình quy tắc nghiệp vụ phức tạp gắn với từng danh mục (VD: Leg Engine 5 RULE của K3)  thuộc module riêng 'Cấu hình Chặng'.  
* Tùy chỉnh thứ tự hiển thị giá trị trong dropdown (Sort order)  không có giao diện cho Admin chỉnh.  
* Trang tổng quan dạng thẻ (dashboard lưới card)  không tồn tại; điều hướng hoàn toàn qua menu accordion.  
* 'Cấu hình đầu mục giá' (Cước vận chuyển, Phí bốc xếp...) và 'Loại giá' (Cố định/Phụ phí)  thuộc module riêng (SRS 08).

# 2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)

*Tham chiếu sơ đồ: Không có trang tổng quan dạng thẻ  điều hướng hoàn toàn qua menu accordion, mô tả bằng bảng bước bên dưới.*

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Mở accordion menu danh mục | Admin | Bấm mục 'Quản lý danh mục' để mở/thu gọn danh sách 12 danh mục con |  | 12 tên danh mục hiện ra dưới dạng danh sách phẳng, không phân nhóm | Bấm vào dòng chữ hoặc mũi tên đều chỉ mở/đóng, KHÔNG điều hướng sang trang nào khác |
| Chọn 1 danh mục trong menu con | Admin | Bấm vào tên 1 danh mục (VD: Cửa khẩu) trong menu con | Tên danh mục đã chọn | Vào thẳng màn bảng danh sách chi tiết của danh mục đó | Không qua bất kỳ trang trung gian nào |
| Thêm giá trị mới | Admin | Bấm '+ Tạo mới \[Tên danh mục\]', Tên hiển thị, Mô tả | Dữ liệu nhập | Giá trị mới xuất hiện trong dropdown liên quan | Mã tạo tự động, phải duy nhất trong danh mục |
| Sửa giá trị | Admin | Chỉnh sửa Tên hiển thị/Mô tả của 1 giá trị đã có | Giá trị cần sửa | Cập nhật hiển thị ở mọi nơi tham chiếu | Không cho sửa Mã sau khi đã tạo |
| Bật/Tắt trạng thái giá trị | Admin | Bấm trực tiếp toggle ở cột Trạng thái trên bảng danh sách | Giá trị cần đổi trạng thái | Đổi ngay Is activated, không cần mở modal | Không xóa cứng dữ liệu; giá trị Tắt vẫn hiển thị đúng ở dữ liệu lịch sử |

# 3\. MODULE: Quản lý danh mục (toàn hệ thống)

## 3.1. Danh sách Use Case

| ID | Tên use case | Độ ưu tiên | Tóm tắt |
| :---- | :---- | :---- | :---- |
| UC-DM-01 | Xem danh sách giá trị 1 danh mục qua menu | Must have | Admin mở accordion 'Quản lý danh mục', bấm vào 1 trong 9 tên danh mục để vào thẳng bảng danh sách chi tiết. |
| UC-DM-02 | Thêm mới giá trị danh mục | Must have | Admin thêm 1 giá trị mới vào 1 danh mục dùng chung được ngay cho cả K1 và K3.  |
| UC-DM-03 | Sửa giá trị danh mục | Must have | Admin chỉnh sửa Tên hiển thị/Mô tả của 1 giá trị đã tồn tại \- không cho sửa Mã. |
| UC-DM-04 | Bật/Tắt trạng thái giá trị danh mục | Must have | Admin bấm trực tiếp toggle ở cột Trạng thái trên bảng danh sách để Vô hiệu hóa/Kích hoạt lại 1 giá trị \- không xóa cứng. |
| UC-DM-05 | Xem Lịch sử thao tác | Should have | Xem nhật ký đầy đủ mọi thay đổi (Thêm/Sửa/Bật-Tắt) trên các giá trị của 1 danh mục để truy vết khi cần. |
| UC-DM-06 | Quản lý khu vực định giá vận tải (Địa điểm vận tải) | Must have | Admin tạo/sửa các khu vực định giá vận tải — mỗi khu vực gắn 1 Quốc gia, 1 Tỉnh/Thành phố và nhiều Phường/Xã, dùng để áp cước vận tải khác nhau cho từng khu vực trong cùng 1 Tỉnh/Thành. **Modal Thêm mới / Chỉnh sửa Địa điểm vận tải: Mã địa điểm:** Tự động sinh TRZ-XXX (Read-only). **Tên địa điểm vận tải:** Nhập text tự do (**Bắt buộc, Duy nhất**). **Component "Chọn khu vực" (Địa giới hành chính): Nếu chọn Quốc gia \= Việt Nam (VN):** Component hiển thị cấu trúc chọn **2 cấp**: Tab 1: Quốc gia (Việt Nam) \$\\rightarrow\$ Tab 2: Tỉnh/Thành phố *(Bắt buộc)* \$\\rightarrow\$ Tab 3: Phường/Xã *(Tùy chọn, tự động lọc ẩn các Phường/Xã đã thuộc Địa điểm vận tải đang hoạt động khác)*. **Nếu chọn Quốc gia \= Trung Quốc (CN):** Component hiển thị cấu trúc chọn **4 cấp**: Tab 1: Quốc gia (Trung Quốc) \$\\rightarrow\$ Tab 2: Tỉnh/Thành phố *(Bắt buộc)* \$\\rightarrow\$ Tab 3: Thành phố / Địa cấp thị *(Tùy chọn)* \$\\rightarrow\$ Tab 4: Quận/Huyện *(Tùy chọn)* \$\\rightarrow\$ Tab 5: Phường/Xã *(Tùy chọn)*. **Mô tả:** Nhập ghi chú bổ sung (Tùy chọn, tối đa 255 ký tự).  |

**Use case 1: Xem danh sách giá trị 1 danh mục qua menu (UC-DM-01)**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-DM-01 |
| **Tên use case** | Xem danh sách giá trị 1 danh mục qua menu |
| **Module liên quan** | Cấu hình / Quản lý danh mục |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Admin mở accordion 'Quản lý danh mục', bấm vào 1 trong 9 tên danh mục để vào thẳng bảng danh sách chi tiết. |
| **Actor** | Admin |
| **Trigger** | Admin bấm mục 'Quản lý danh mục' để mở accordion, sau đó bấm 1 tên danh mục con |
| **Điều kiện tiên quyết** | Đã đăng nhập với quyền quản trị danh mục |
| **Luồng cơ bản** | Luồng cơ bản (Basic Flow) \- Bước 3: Hệ thống điều hướng thẳng tới màn bảng danh sách chi tiết của danh mục đã chọn. Bảng hiển thị đầy đủ 5 cột: Mã (Mã danh mục tự động sinh, readonly). Tên hiển thị. Mô tả (Cột mới bổ sung). Trạng thái (nút Toggle kích hoạt/vô hiệu hóa). Thao tác (nút Chỉnh sửa). Quy tắc hiển thị cột Mô tả trên Table: Quy tắc cắt chuỗi (Ellipsis): Do độ dài mô tả tối đa lên đến 255 ký tự, để tránh làm vỡ khung giao diện table, cột Mô tả trên bảng danh sách chỉ hiển thị tối đa 50 ký tự đầu tiên. Nếu nội dung vượt quá 50 ký tự, hệ thống tự động cắt bớt và hiển thị bằng dấu ba chấm (...) ở cuối. Cơ chế Tooltip: Khi người dùng rê chuột (hover) vào ô mô tả bị rút gọn, hệ thống hiển thị một tooltip hover màu đen show đầy đủ toàn bộ nội dung text của mô tả đó.  |
| **Luồng ngoại lệ** | \- |
| **Luồng thay thế** | \- |
| **Hậu điều kiện Thành công** | Hiển thị đúng danh sách, không thay đổi dữ liệu |
| **Hậu điều kiện Thất bại** | \- |
| **Business Rule** | BR-DM-05, BR-DM-08, BR-DM-09 Danh sách giá trị danh mục hiển thị theo thứ tự ID danh mục tăng dần. Đối với danh mục địa điểm vận tải, cho phép lọc theo quốc gia, tỉnh/thành phố, phường/xã dạng AND. Bắt buộc chọn lần lượt bộ lọc theo thứ tự Quốc gia \=\> Tỉnh/thành phố \=\> Phường/xã. Giá trị lọc tỉnh/thành phố lấy theo quốc gia đã chọn và giá trị lọc phường/xã lấy theo tỉnh/thành phố đã chọn. |
| **Yêu cầu phi chức năng** | Thời gian tải bảng \<= 2 giây với tối đa 200 giá trị; riêng Chi cục Hải quan (\~150 giá trị) phải phân trang |

**Use case 2: Thêm mới giá trị danh mục (UC-DM-02)**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-DM-02 |
| **Tên use case** | Thêm mới giá trị danh mục |
| **Module liên quan** | Cấu hình / Quản lý danh mục |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Admin thêm 1 giá trị mới vào 1 danh mục đã có sẵn  tự nhập Tên hiển thị, dùng chung được ngay cho cả K1 và K3. |
| **Actor** | Admin*UC-DM-02*  |
| **Trigger** | *3.1.2* Bấm nút '+ Tạo mới \[Tên danh mục\]' ở góc phải trên màn bảng danh sách |
| **Điều kiện tiên quyết** | Đang xem bảng danh sách của 1 danh mục Không áp dụng cho danh mục Tiền tệ |
| **Luồng cơ bản** | Admin bấm nút \+ Tạo mới \[Tên danh mục\] tại màn hình danh sách giá trị. Hệ thống hiển thị Modal tạo mới tương ứng: Trường hợp 1: Đối với các danh mục phẳng thông thường (Cửa khẩu, Loại xe, ĐVT...):. *Tên hiển thị:* Admin nhập tay tự do (Bắt buộc). *Mô tả:* Admin nhập thông tin bổ sung (Tùy chọn).   Trường hợp 2: Đối với danh mục "Chi cục Hải quan" (CSD): *Tên viết tắt chi cục:* Admin nhập tay tự do (Bắt buộc). *Ví dụ: 01E1/HQBACHN, 18BC/HQBACGIANG*. *Tên hiển thị:* Admin nhập tay tự do (Bắt buộc). *Ví dụ: Hải quan Bắc Hà Nội \- 01E1*. *Mô tả/Ghi chú:* Admin nhập thông tin bổ sung (Tùy chọn). Trường hợp : Đối với danh mục "Cửa khẩu’’: Mã cửa khẩu: Hệ thống tự động sinh dạng BGT-XXX (Read-only). Tên hiển thị (Tên cửa khẩu): Admin nhập tay tự do (Bắt buộc, Duy nhất trên toàn hệ thống \- áp dụng quy tắc BR-DM-11 chặn trùng). Chọn khu vực (Trường nhập liệu đặc thù \- Bắt buộc):Khi bấm vào ô/nút "Chọn khu vực", hệ thống hiển thị một popover/dropdown panel chứa 3 Tab để chọn tuần tự (cascading): **Trường hợp 1: Chọn Quốc gia \= Việt Nam (VN) Tab 1 (Quốc gia):** Chọn Việt Nam \$\\rightarrow\$ Tự động mở Tab 2\. **Tab 2 (Tỉnh/Thành phố):** Hiển thị danh sách 63 Tỉnh/Thành phố thuộc Việt Nam1. *(Đã đủ điều kiện tối thiểu để lưu)*. **Tab 3 (Phường/Xã):** Hiển thị danh sách Phường/Xã thuộc Tỉnh/Thành phố đã chọn *(Tùy chọn, không bắt buộc)*.     **Trường hợp 2: Chọn Quốc gia \= Trung Quốc (CN) Tab 1 (Quốc gia):** Chọn Trung Quốc \$\\rightarrow\$ Tự động mở Tab 2\. **Tab 2 (Tỉnh/Thành phố):** Hiển thị danh sách Tỉnh/Thành phố cấp tỉnh (VD: *Quảng Tây, Vân Nam...*) *(Đã đủ điều kiện tối thiểu để lưu)*. **Tab 3 (Thành phố / Địa cấp thị):** Hiển thị danh sách Địa cấp thị thuộc Tỉnh/Thành đã chọn (VD: *Bằng Tường, Sùng Tả...*) *(Tùy chọn)*. **Tab 4 (Quận/Huyện):** Hiển thị danh sách Quận/Huyện thuộc Địa cấp thị đã chọn *(Tùy chọn)*. **Tab 5 (Phường/Xã/Thị trấn):** Hiển thị danh sách Phường/Xã thuộc Quận/Huyện đã chọn *(Tùy chọn)*. Số nhà, tên đường (Bắt buộc): Ô nhập text tự do để người dùng điền địa chỉ chi tiết (ví dụ: *Khu vực Cửa khẩu quốc tế Hữu Nghị*) Mô tả: Admin nhập ghi chú bổ sung (Tùy chọn) Admin nhập đầy đủ thông tin bắt buộc và nhấn "Lưu". Hệ thống kiểm tra: Validate trống các trường bắt buộc. Kiểm tra chống trùng *Tên hiển thị* trong cùng danh mục (theo quy tắc BR-DM-11). *(Riêng Chi cục Hải quan)*: Kiểm tra chống trùng *Tên viết tắt chi cục* trong danh mục. Hệ thống lưu giá trị mới vào cơ sở dữ liệu ở trạng thái mặc định là Hoạt động (Is activated \= True). Modal tự động đóng, cập nhật bản ghi mới lên bảng danh sách và các dropdown liên quan toàn hệ thống.  |
| **Luồng ngoại lệ** |  E1. Để trống Tên hiển thị \-\> hiển thị lỗi, chặn lưu. E2: Tên hiển thị nhập vào trùng với tên hiển thị của một giá trị đã tồn tại trong cùng danh mục (theo quy tắc BR-DM-11). Hành vi hệ thống: Chặn lưu, hiển thị viền đỏ quanh trường nhập và báo lỗi: *"Tên hiển thị \[Tên nhập vào\] đã tồn tại trong danh mục này. Vui lòng nhập tên khác."*  |
| **Luồng thay thế** | \- |
| **Hậu điều kiện Thành công** | Giá trị mới được lưu, khả dụng ngay trong dropdown liên quan |
| **Hậu điều kiện Thất bại** | Không lưu, giữ nguyên form để sửa lại |
| **Business Rule** | BR-DM-03, BR-DM-05 |
| **Yêu cầu phi chức năng** | \- |

**Use case 3: Sửa giá trị danh mục (UC-DM-03)**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-DM-03 |
| **Tên use case** | Sửa giá trị danh mục |
| **Module liên quan** | Cấu hình / Quản lý danh mục |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Admin chỉnh sửa Tên hiển thị/Mô tả của 1 giá trị đã tồn tại \- không cho sửa Mã. |
| **Actor** | Admin |
| **Trigger** | Bấm 'Chỉnh sửa' tại 1 dòng giá trị trong bảng danh sách |
| **Điều kiện tiên quyết** | Giá trị đã tồn tại trong hệ thống Không áp dụng cho danh mục Tiền tệ |
| **Luồng cơ bản** | 1\. Bấm 'Chỉnh sửa' tại dòng giá trị cần sửa. 2\. Modal hiện ra với Mã ở chế độ chỉ xem (readonly), Tên hiển thị/Mô tả cho phép sửa. 3\. Chỉnh Tên hiển thị/Mô tả. 4\. Bấm 'Lưu'. 5\. Hệ thống cập nhật \- mọi nơi đang hiển thị giá trị này tự động hiển thị Tên hiển thị mới. |
| **Luồng ngoại lệ** | E1. Để trống Tên hiển thị \-\> chặn lưu, hiển thị lỗi. E2: Tên hiển thị chỉnh sửa trùng với tên hiển thị của một giá trị khác đã tồn tại trong cùng danh mục (ngoại trừ chính bản ghi đang sửa). Hành vi hệ thống: Chặn lưu, hiển thị lỗi tương tự: "Tên hiển thị \[Tên nhập vào\] đã tồn tại trong danh mục này. Vui lòng nhập tên khác.  |
| **Luồng thay thế** | \- |
| **Hậu điều kiện Thành công** | Cập nhật thành công, đồng bộ hiển thị mọi nơi tham chiếu |
| **Hậu điều kiện Thất bại** | Không lưu thay đổi |
| **Business Rule** | BR-DM-01, BR-DM-03 |
| **Yêu cầu phi chức năng** | \- |

**Use case 4: Bật/Tắt trạng thái giá trị danh mục (UC-DM-04)**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-DM-04 |
| **Tên use case** | Bật/Tắt trạng thái giá trị danh mục |
| **Module liên quan** | Cấu hình / Quản lý danh mục |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Admin bấm trực tiếp toggle ở cột Trạng thái trên bảng danh sách để Vô hiệu hóa/Kích hoạt lại 1 giá trị \- không xóa cứng. |
| **Actor** | Admin |
| **Trigger** | Bấm trực tiếp vào toggle ở cột 'Trạng thái' tại 1 dòng giá trị trên bảng danh sách |
| **Điều kiện tiên quyết** | Giá trị đang tồn tại trong bảng danh sách Không áp dụng cho danh mục Tiền tệ |
| **Luồng cơ bản** | 1\. Bấm toggle tại dòng giá trị cần đổi trạng thái. 2\. Nếu đang TẮT giá trị đang Hoạt động: hệ thống hiển thị xác nhận, kèm cảnh báo nếu giá trị đang được dữ liệu nghiệp vụ hiện hữu tham chiếu. 3\. Admin xác nhận. 4\. Toggle đổi trạng thái ngay \- giá trị bị Tắt biến mất khỏi các dropdown chọn mới, nhưng vẫn hiển thị đúng ở dữ liệu cũ đã chọn giá trị này trước đó. |
| **Luồng ngoại lệ** | \- |
| **Luồng thay thế** | Bấm lại toggle để Kích hoạt lại 1 giá trị đã Tắt. |
| **Hậu điều kiện Thành công** | Trạng thái đổi ngay; nếu Tắt thì ẩn khỏi dropdown chọn mới |
| **Hậu điều kiện Thất bại** | \- |
| **Business Rule** | BR-DM-01, BR-DM-02 |
| **Yêu cầu phi chức năng** | \- |

**Use case 5: Xem Lịch sử thao tác (UC-DM-05)**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-DM-05 |
| **Tên use case** | Xem Lịch sử thao tác |
| **Module liên quan** | Cấu hình / Quản lý danh mục |
| **Độ ưu tiên** | Should have |
| **Tóm tắt** | Admin xem nhật ký đầy đủ mọi thay đổi (Thêm mới, Sửa, Bật/Tắt trạng thái) đã thực hiện trên các giá trị của 1 danh mục, phục vụ truy vết khi có sai lệch dữ liệu. |
| **Actor** | Admin |
| **Trigger** | Bấm nút "Lịch sử thao tác" ở màn bảng danh sách chi tiết 1 danh mục |
| **Điều kiện tiên quyết** | Danh mục đã có ít nhất 1 lần thao tác Thêm/Sửa/Đổi trạng thái |
| **Luồng cơ bản** | 1\. Bấm "Lịch sử thao tác" → mở modal. 2\. Có ô tìm kiếm, lọc theo Người thao tác, lọc theo khoảng Thời gian. 3\. Bảng log 4 cột: Thời gian, Người thao tác, Hành động (Thêm mới giá trị / Chỉnh sửa giá trị / Bật trạng thái / Tắt trạng thái), Nội dung (mô tả \+ diff trước/sau nếu là hành động Sửa hoặc Đổi trạng thái, VD: "Trạng thái: Tắt → Bật") 4\. Phân trang ở cuối. |
| **Luồng ngoại lệ** | — |
| **Luồng thay thế** | — |
| **Hậu điều kiện Thành công** | 3.1.2 Hiển thị đúng lịch sử, không cho sửa/xóa nội dung log |
| **Hậu điều kiện Thất bại** | — |
| **Business Rule** | BR-DM-07 |
| **Yêu cầu phi chức năng** | Log phải ghi nhận ngay lập tức (không trễ) sau mỗi thao tác; lưu trữ tối thiểu 12 tháng |

**Use case 6: Quản lý khu vực định giá vận tải – Địa điểm vận tải (UC-DM-06)**

| Mục | Mô tả |
| :---- | :---- |
| **ID use case** | UC-DM-06 |
| **Tên use case** | Quản lý khu vực định giá vận tải (Địa điểm vận tải) |
| **Module liên quan** | Cấu hình / Quản lý danh mục |
| **Độ ưu tiên** | Must have |
| **Tóm tắt** | Admin tạo/sửa các khu vực định giá vận tải — mỗi khu vực gắn 1 Quốc gia, 1 Tỉnh/Thành phố và nhiều Quận/Huyện, dùng để áp cước vận tải khác nhau cho từng khu vực trong cùng 1 Tỉnh/Thành. |
| **Actor** | Admin |
| **Trigger** | Bấm '+ Tạo mới Địa điểm vận tải' ở bảng danh sách danh mục 'Địa điểm vận tải' |
| **Điều kiện tiên quyết** | Đang xem bảng danh sách danh mục 'Địa điểm vận tải' |
| **Luồng cơ bản** | **Modal Thêm mới / Chỉnh sửa Địa điểm vận tải: Mã địa điểm:** Tự động sinh TRZ-XXX (Read-only). **Tên địa điểm vận tải:** Nhập text tự do (**Bắt buộc, Duy nhất**). **Component "Chọn khu vực" (Địa giới hành chính): Nếu chọn Quốc gia \= Việt Nam (VN):** Component hiển thị cấu trúc chọn **2 cấp**: Tab 1: Quốc gia (Việt Nam) \$\\rightarrow\$ Tab 2: Tỉnh/Thành phố *(Bắt buộc)* \$\\rightarrow\$ Tab 3: Phường/Xã *(Tùy chọn, tự động lọc ẩn các Phường/Xã đã thuộc Địa điểm vận tải đang hoạt động khác)*. **Nếu chọn Quốc gia \= Trung Quốc (CN):** Component hiển thị cấu trúc chọn **4 cấp**: Tab 1: Quốc gia (Trung Quốc) \$\\rightarrow\$ Tab 2: Tỉnh/Thành phố *(Bắt buộc)* \$\\rightarrow\$ Tab 3: Thành phố / Địa cấp thị *(Tùy chọn)* \$\\rightarrow\$ Tab 4: Quận/Huyện *(Tùy chọn)* \$\\rightarrow\$ Tab 5: Phường/Xã *(Tùy chọn)*. **Mô tả:** Nhập ghi chú bổ sung (Tùy chọn, tối đa 255 ký tự).  |
| **Luồng ngoại lệ** | *Tình huống:* Trong quá trình Admin A đang mở form tạo mới và thấy Phường/Xã X (chưa bị ẩn), Admin B ở một máy khác đã nhanh tay gán Phường/Xã X vào khu vực khác và Lưu thành công. Lúc này Admin A mới bấm "Lưu". *Hành vi hệ thống:* Backend thực hiện kiểm tra chéo lần cuối trước khi ghi DB. Hệ thống phát hiện Phường/Xã X đã bị gán hoạt động, chặn thao tác lưu và hiển thị thông báo lỗi: *"Lưu không thành công. Phường/Xã \[Tên Phường/Xã\] vừa được gán vào khu vực khác bởi một phiên làm việc khác. Vui lòng tải lại trang."*   |
| **Luồng thay thế** | Khi Sửa 1 khu vực đã có: Mã hiển thị readonly, các field còn lại cho phép chỉnh; kiểm tra trùng Quận/Huyện áp dụng tương tự, loại trừ chính khu vực đang sửa. |
| **Hậu điều kiện Thành công** | Khu vực mới/đã sửa có hiệu lực ngay khi hệ thống tính cước vận tải theo Quận/Huyện điểm đi/đến của Phiếu dịch vụ |
| **Hậu điều kiện Thất bại** | Không lưu, giữ nguyên form để sửa lại |
| **Business Rule** | BR-DM-12, BR-DM-07 |
| **Yêu cầu phi chức năng** | Danh sách Quận/Huyện phải load theo đúng Tỉnh/Thành phố đã chọn trong vòng \<= 1 giây |

## 3.2. Mô tả giao diện  Bảng field

| Khối | Tên trường | Bắt buộc? | Kiểu DL | Max Length | Giá trị mặc định / Mô tả |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Menu (danh sách phẳng, không phân nhóm) | 8 danh mục | \- | Menu item | \- | \- Cửa khẩu, Loại hình Xuất Nhập Khẩu, Loại xe, Loại hàng hóa, Chi cục Hải quan, Đơn vị tính, Loại hình lưu kho, Tiền tệ |  |
| Bảng danh sách chi tiết | Mã | v | Text | 50 | \-Tự động sinh theo Prefix \+ STT 3 số, readonly, không cho nhập tay  |  |
| Bảng danh sách chi tiết | Tên hiển thị | v | Text | 150 | \-  Tên hiển thị tiếng Việt có dấu, hiển thị trong mọi dropdown |  |
| Bảng danh sách chi tiết | Trạng thái (Is activated) | \- | Toggle (không kèm nhãn chữ) | \- | Bật  Bấm trực tiếp trên bảng để đổi |  |
| Bảng danh sách chi tiết | Thao tác | \- | Link "Chỉnh sửa" | \- | \-  Mở modal Sửa |  |
| Modal Tạo mới | Tên hiển thị,  | v/v/- | Text/Text/Textarea | 50/150/255 | \-  Tên hiển thị đều nhập tay tự do \- Không cho phép người dùng tạo mới danh mục đơn vị tính |  |
|  | Mô tả | Không | Text Area (Nhập tự do nhiều dòng) | 255 ký tự | \- Cho phép nhập ghi chú hoặc mô tả bổ sung cho giá trị danh mục. \- Validate UI: Client tích hợp bộ đếm ngược ký tự real-time (ví dụ hiển thị nhỏ dưới góc: 0/255). Khi chạm mốc 255 ký tự, chặn không cho người dùng gõ tiếp. \- Validate API: Backend kiểm tra nếu độ dài chuỗi đầu vào vượt quá 255 ký tự sẽ báo lỗi chặn lưu. |  |
| Bảng danh sách | Địa chỉ | Có | Text | \- | Hiển thị ghép chuỗi theo thứ tự bắt buộc: \[Số nhà, tên đường\], \[Phường/Xã\], \[Tỉnh/Thành phố\], \[Quốc gia\]. |  |
| Modal Thêm/Sửa | Chọn khu vực | Có (Đến cấp Tỉnh/Thành) | C3.4omponent (Tab control) |  | \- Bắt buộc: Chọn Quốc gia và Tỉnh/Thành phố. \- Tùy chọn (Optional): Các cấp bên dưới Tỉnh/Thành phố (Phường/Xã đối với VN; Địa cấp thị, Quận/Huyện, Phường/Xã đối với TQ). \- Nếu dừng ở Tỉnh/Thành phố, hệ thống vẫn cho phép xác nhận và lưu dữ liệu địa chỉ. |  |
| Modal Thêm/Sửa | Số nhà, tên đường | Có | Text | 150 ký tự | Ô nhập text tự do (số nhà, tên đường, khu vực bến bãi, v.v.). |  |
| Dữ liệu nội bộ (không hiển thị UI) | Core id | \- | Số (auto, readonly) | \- | Tự sinh tăng dần  Khóa hệ thống nội bộ, không hiển thị cho người dùng cuối |  |
| Dữ liệu nội bộ (không hiển thị UI) | Sort order | \- | Số (ẩn hoàn toàn khỏi UI) | \- | 0  Không có giao diện chỉnh; hệ thống tự gán ngầm |  |
| Modal Lịch sử thao tác | Thời gian | — | Datetime (readonly) | — | Ghi theo giờ hệ thống, định dạng HH:mm \- dd/mm/yyyy |  |
| Modal Lịch sử thao tác | Người thao tác | — | Text (readonly) | — | Tên tài khoản Admin thực hiện |  |
| Modal Lịch sử thao tác | Hành động | — | Text (readonly) | — | Thêm mới giá trị / Chỉnh sửa giá trị / Bật trạng thái / Tắt trạng thái |  |
| Modal Lịch sử thao tác | Nội dung | — | Text (readonly) | — | Mô tả chi tiết; nếu là Sửa/Đổi trạng thái thì hiển thị dạng diff "\[Field\]: \[Giá trị cũ\] → \[Giá trị mới\]" |  |
| Modal Tạo mới & Chỉnh sửa  | Tên viết tắt chi cục | Có (Chỉ áp dụng với Chi cục Hải quan) | Text (Nhập tự do) | 50 | (Trống) | \- Chỉ hiển thị trên modal của danh mục "Chi cục Hải quan". \- Cho phép nhập chữ, số và ký tự đặc biệt (như dấu /). \- Ràng buộc bắt buộc nhập, độc lập với Mã hệ thống. Chặn trùng lặp trên toàn danh mục. |
| Modal Tạo mới & Chỉnh sửa  | Tên hiển thị | Có | Text (Nhập tự do) | 150 | (Trống) | \- Tên hiển thị tiếng Việt có dấu. \- Áp dụng quy tắc chống trùng BR-DM-11 (không phân biệt hoa/thường, chuẩn hóa khoảng trắng). |
| Modal Tạo mới & Chỉnh sửa  | Mô tả | Không | Text Area | 255 | (Trống) | \- Nhập ghi chú hoặc thông tin chi tiết bổ sung. |

## 3.3. Chi tiết danh mục hệ thống & giá trị mẫu

**1\. Bảng quy ước prefix**  

| STT | Danh mục | Tên tiếng Anh | Prefix | Cấu trúc mã | Ví dụ |
| ----- | ----- | ----- | ----- | ----- | ----- |
| 1 | Cửa khẩu | Border Gate | BGT | BGT-XXX | BGT-001 |
| 2 | Loại hình Xuất Nhập Khẩu | Import-Export Type | IMP | IMP-XXX | IMP-001 |
| 3 | Loại xe | Vehicle Type | VHT | VHT-XXX | VHT-001 |
| 4 | Chi cục Hải quan | Customs Sub-Department | CSD | CSD-XXX | CSD-001 |
| 5 | Đơn vị tính | Unit of Measure | UOM | UOM-XXX | UOM-001 |
| 6 | Loại hình lưu kho | Warehouse Type | WHT | WHT-XXX | WHT-001 |
| 7 | Tiền tệ | Currency | ISO 4217 | 3 ký tự viết hoa theo chuẩn ISO 4217 | VND, USD, CNY |
| 8 | Nhóm hàng | Industry | IND | IND-XXX | IND-001 |
| 9 | Kho | Warehouse | WRH | WRH-XXX | WRH-001 |
| 10 | Đặc tính hàng hóa | Cargo Characteristic | CGC | CGC-XXX | CGC-001 |
| 11 | Địa điểm sang tải | Transload Location | TLL | TLL-XXX | TLL-001 |
| 12 | Địa điểm vận tải | Transport Zone | TPZ | TPZ-XXX (Kèm trường Mã quốc gia chuẩn ISO 3166-1 Alpha-2/Alpha-3) | TPZ-001 (Quốc gia: VN / VNM) |

*(XXX \= STT 3 chữ số, bắt đầu từ 001, tăng dần riêng theo từng danh mục)*

**2\. Bảng Cửa khẩu & giá trị mẫu** 

| Mã | Tên hiển thị | Địa chỉ | Mô tả  |
| :---- | :---- | :---- | ----- |
| BGT-001 | Hữu Nghị | Khu vực Cửa khẩu quốc tế Hữu Nghị, Thị trấn Đồng Đăng, Tỉnh Lạng Sơn, Việt Nam | Cửa khẩu quốc tế đường bộ |
| BGT-002 | Tân Thanh | Khu vực Cửa khẩu Tân Thanh, Xã Tân Thanh, Tỉnh Lạng Sơn, Việt Nam | Cửa khẩu phụ |
| BGT-007 | Hữu Nghị Quan | Khu vực Cửa khẩu Hữu Nghị Quan, Bằng Tường, Tỉnh Quảng Tây, Trung Quốc | Cửa khẩu đối ứng phía Trung Quốc |

**3\. Bảng Loại hình Xuất Nhập Khẩu & giá trị mẫu** 

| Mã | Tên hiển thị | Ghi chú |
| :---- | :---- | :---- |
| IMP-001  | Xuất thẳng | Cửa khẩu Hữu Nghị |
| IMP-002 | Nhập chuyển khẩu | Cửa khẩu Hữu Nghị |
| IMP-003 | Nhập kinh doanh | Cửa khẩu Hữu Nghị |
| IMP-004 | Xuất KD nông sản | Cửa khẩu Hữu Nghị*3.1.2*  |
| IMP-005 | Nhập quá cảnh Hữu Nghị | Cửa khẩu Hữu Nghị |
| IMP-006 | Nhập kinh doanh máy cũ | Cửa khẩu Hữu Nghị |
| IMP-007 | Nhập khẩu (xe VN bốc hàng tại Bảo Nguyên) | Cửa khẩu Tân Thanh |
| IMP-008 | Nhập khẩu (xe TQ sang VN tại Bảo Nguyên) | Cửa khẩu Tân Thanh |
| IMP-009 | Xuất thẳng | Cửa khẩu Tân Thanh |
| IMP-010 | Nhập kinh doanh TT | Cửa khẩu Tân Thanh |

**4\. Bảng Loại xe & giá trị mẫu** 

| Mã | Tên hiển thị | Ghi chú |
| :---- | :---- | :---- |
| VHT-001  | Xe 1,25 tấn | \- |
| VHT-002 | Xe 2,5 tấn | \- |
| VHT-003 | Xe 3,5 tấn | \- |
| VHT-004 | Xe 5 tấn | \- |
| VHT-005 | Xe lạnh 5 tấn | Biến thể xe lạnh |
| VHT-006 | Xe 7 tấn | \- |
| VHT-007 | Xe 8 tấn | \- |
| VHT-008 | Xe lạnh 8 tấn | Biến thể xe lạnh |
| VHT-009 | Xe tải bạt 9.6m | Phân loại theo kích thước thùng |
| VHT-010 | Xe 10 tấn | \- |

**5\. Bảng Chi cục Hải quan  & giá trị mẫu** 

| Mã | Tên viết tắt chi cục | Tên hiển thị | Ghi chú |
| :---- | :---- | :---- | :---- |
| CSD-001  | 01E1/HQBACHN | Hải quan Bắc Hà Nội \- 01E1 | \- |
| CSD-002 | 01E2/HQBACHN | Hải quan Bắc Hà Nội \- 01E2 | \- |
| CSD-003 | 01E3/HQBACHN | Hải quan Bắc Hà Nội \- 01E3 | \- |
| CSD-004 | 01NV/HQBACTL | Hải quan KCN Bắc Thăng Long | \- |
| CSD-005 | 01DD/HQCPN | Hải quan CPN \- 01DD | \- |
| CSD-006 | 03CD/HQTHAIBINH | Hải quan Thái Bình | \- |
| CSD-007 | 18BC/HQBACGIANG | Hải quan Bắc Giang | \- |
| CSD-008 | 01D2/HQCPN 01D2 | Hải quan Chuyển phát nhanh \- 01D2 | \- |
| CSD-009 | 01SI/HQYENVIEN | Hải quan ga đường sắt quốc tế Yên Viên | \- |
| CSD-010 | 01IK/HQGIATHUY | Hải quan Gia Thụy | \- |

**6\. Bảng Đơn vị tính & giá trị mẫu**  

| Mã | Tên hiển thị | Ghi chú |
| :---- | :---- | :---- |
| UOM-001  | Pallet | \- |
| UOM-002 | CBM | Mét khối |
| UOM-003 | KG | Kilôgam |
| UOM-004 | Tấn | \- |
| UOM-006 | Kiện | \- |

**7\. Bảng Loại hình lưu kho  & giá trị mẫu** 

| Mã | Tên hiển thị | Ghi chú |
| :---- | :---- | :---- |
| WHT-001  | Lưu kho thường | \- |
| WHT-002 | Lưu kho có bảo ôn | \- |
| WHT-003 | Lưu kho ngoại quan | \- |
| WHT-004 | CFS (Container Freight Station) | \- |

**8\. Bảng Tiền tệ  & giá trị mẫu** 

| Mã | Tên hiển thị | Ghi chú |
| :---- | :---- | :---- |
| CUR-001  | VND | Mặc định |
| CUR-002 | USD | \- |
| CUR-003 | CNY | Nhân dân tệ \- tuyến Việt-Trung |

**9\. Bảng Nhóm hàng & giá trị mẫu** 

| Mã | Tên hiển thị | Ghi chú |
| :---- | :---- | :---- |
| IND-001  | Nông sản & Thực phẩm | — |
| IND-002 | Linh kiện điện tử | — |
| IND-003 | Dệt may & Da giày | — |

**10\. Bảng Kho & giá trị mẫu**

| Mã | Tên hiển thị | Địa điểm kho | Ghi chú |
| :---- | :---- | :---- | :---- |
| WRH-001 | Kho Quế Võ | Khu công nghiệp Quế Võ, Bắc Ninh | \- |
| WRH-002 | Kho Bình Dương | KCN Bình Dương, tỉnh Bình Dương | \- |
| WRH-003 | Kho ngoại quan Hữu Nghị | Cửa khẩu Hữu Nghị, Lạng Sơn | Kho ngoại quan |

**11\. Bảng Đặc tính hàng hóa & giá trị mẫu**

| Mã | Tên hiển thị | Ghi chú |
| :---- | :---- | :---- |
| CGC-001 | Hàng nguy hiểm | \- |
| CGC-002 | Hàng dễ vỡ | \- |
| CGC-003 | Hàng đông lạnh | \- |

**12\. Bảng Địa điểm sang tải & giá trị mẫu**

| Mã | Tên hiển thị | Ghi chú |
| :---- | :---- | :---- |
| TLL-001 | Bãi sang tải Hữu Nghị | Cửa khẩu Hữu Nghị, Lạng Sơn |
| TLL-002 | Bãi sang tải Tân Thanh | Cửa khẩu Tân Thanh, Lạng Sơn |
| TLL-003 | Bãi sang tải Bảo Nguyên | Khu vực Tân Thanh, Lạng Sơn |

**13\. Bảng Địa điểm vận tải & giá trị mẫu**

| STT | Mã địa điểm | Tên địa điểm vận tải | Quốc gia | Tỉnh / Thành phố | Thành phố / Địa cấp thị | Quận / Huyện | Phường / Xã | Mô tả | Trạng thái | Thao tác |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 1 | TRZ-001 | Bãi xe Hữu Nghị | Việt Nam | Lạng Sơn | *(Trống)* | *(Trống)* | Đồng Đăng | Bãi xe cửa khẩu | \[Toggle\] | \[Sửa\] |
| 2 | TRZ-002 | Bằng Tường Hub | Trung Quốc | Quảng Tây | Sùng Tả | Bằng Tường | *(Trống)* | Bãi trung chuyển TQ | \[Toggle\] | \[Sửa\] |

## 3.4. Quy tắc nghiệp vụ (Business Rule)

* BR-DM-01: Không xóa cứng 1 giá trị danh mục đã được dữ liệu nghiệp vụ khác tham chiếu (ở K1 HOẶC K3) \- chỉ cho phép Bật/Tắt qua toggle Trạng thái trên bảng danh sách (soft delete, field Is activated).  
* BR-DM-02: Giá trị bị Tắt vẫn hiển thị đúng ở dữ liệu lịch sử đã dùng nó ở CẢ K1 và K3; chỉ ẩn khỏi dropdown khi chọn giá trị MỚI.  
* BR-DM-03: Ràng buộc Mã danh mục:

\- Các danh mục phẳng thông thường: Mã tự động sinh theo Prefix cố định (tiếng Anh, viết tắt theo tên danh mục) \+ STT 3 chữ số tăng dần riêng theo từng danh mục (không cho phép nhập tay hay chỉnh sửa sau khi tạo).

\- Ngoại lệ Tiền tệ (Currency): Mã danh mục không sử dụng cơ chế sinh mã tự động CUR-XXX. Bắt buộc sử dụng mã chuẩn ISO 4217 gồm 3 ký tự chữ viết hoa (ví dụ: VND, USD, CNY). Trường mã này do Admin nhập thủ công (hoặc hệ thống seed sẵn) theo đúng chuẩn quốc tế khi tạo mới, hiển thị readonly trên màn hình Chỉnh sửa.

\- Ngoại lệ Quốc gia (Country): Mã quốc gia tích hợp trong danh mục "Địa điểm vận tải" hoặc danh mục hành chính phải tuân thủ chuẩn ISO 3166-1 (ưu tiên chuẩn Alpha-2 như VN, CN, US hoặc Alpha-3 như VNM, CHN, USA tùy theo thiết kế database đồng bộ). 

\- Ràng buộc Mã danh mục: Mã tự động sinh theo Prefix cố định tiếng Anh viết tắt của từng danh mục \+ STT 3 chữ số tăng dần (ví dụ: Cửa khẩu là BGT-XXX, Chi cục Hải quan là CSD-XXX). Trường này hiển thị ở trạng thái chỉ đọc (Read-only) trên giao diện 

* BR-DM-04: Core id do hệ thống tự sinh, không hiển thị UI. Sort order không có giao diện chỉnh sửa, hệ thống tự gán ngầm.  
* BR-DM-05: Trong phạm vi Sprint 1 (MVP), toàn bộ thao tác danh mục thực hiện qua tài khoản Admin.  
* BR-DM-06: Danh mục 'Loại hình Xuất Nhập Khẩu' liên kết trực tiếp tới Cấu hình Chặng (K3) \- khi sửa/tắt giá trị thuộc nhóm này, hệ thống phải cảnh báo rõ mức độ ảnh hưởng tới cấu hình Chặng trước khi Admin xác nhận.  
* BR-DM-07: Mọi thao tác Thêm mới/Chỉnh sửa/Bật-Tắt trạng thái trên bất kỳ giá trị danh mục nào phải được ghi vào Lịch sử thao tác (audit trail) ngay lập tức — dữ liệu log là **append-only**, không cho phép xóa hoặc chỉnh sửa lại nội dung đã ghi, kể cả bởi Admin.  
* BR-DM-08: Menu 'Quản lý danh mục' hiển thị dạng DANH SÁCH PHẲNG đúng 12 danh mục, KHÔNG phân nhóm theo nguồn gốc nghiệp vụ (K1/K3), KHÔNG hiển thị badge 'Dùng chung: K1 & K3' ở bất kỳ đâu trong khu vực này — về mặt kiến trúc dữ liệu, module vẫn phục vụ cả K1 và K3, chỉ đơn giản hóa cách trình bày trên giao diện.  
* BR-DM-09: Cấu trúc dữ liệu Địa điểm vận tải:\<br\>Danh mục "Địa điểm vận tải" không phải danh sách phẳng — mỗi khu vực (Tên khu vực) gắn đúng 1 Quốc gia \+ 1 Tỉnh/Thành phố \+ nhiều Phường/Xã được chọn trực tiếp qua giao diện cascading Quốc gia → Tỉnh/Thành phố → Phường/Xã.  
* BR-DM-10 : Quy tắc lọc hiển thị địa giới (Phường/Xã):

\- Khi tạo mới (Create): Danh sách Phường/Xã hiển thị dạng checkbox phải lọc bỏ (ẩn) hoàn toàn các Phường/Xã đã nằm trong một khu vực Địa điểm vận tải đang hoạt động (Is activated \= True) của Tỉnh/Thành phố đó.

\- Khi chỉnh sửa (Edit): Danh sách Phường/Xã hiển thị bao gồm: (1) Các Phường/Xã chưa bị gán cho khu vực nào khác; và (2) Các Phường/Xã đang thuộc chính khu vực đang sửa này (để Admin có thể chủ động tích chọn thêm hoặc bỏ tích chọn ra). Toàn bộ các Phường/Xã đã gán cho khu vực hoạt động khác vẫn phải ẩn đi. 

* BR-DM-11: Quy tắc chống trùng Tên hiển thị (Display Name):  
*  Hệ thống không cho phép tồn tại hai giá trị có Tên hiển thị trùng nhau trong cùng một danh mục dùng chung (áp dụng cho cả các danh mục phẳng như Cửa khẩu, Loại hình XNK, Loại xe, v.v.).  
* Cơ chế kiểm tra trùng: Không phân biệt chữ hoa, chữ thường (case-insensitive) và tự động chuẩn hóa khoảng trắng (loại bỏ khoảng trắng thừa ở đầu/cuối và giữa các từ). Ví dụ: "Hữu Nghị", "hữu nghị", "Hữu  Nghị " đều bị coi là trùng nhau.  
* Phạm vi kiểm tra: Đối soát với tất cả bản ghi trong danh mục, bao gồm cả bản ghi đang Hoạt động (Is activated \= True) và bản ghi đã bị Vô hiệu hóa (Is activated \= False) nhằm tránh xung đột dữ liệu lịch sử hoặc lỗi khi kích hoạt lại  
* Ràng buộc duy nhất Tên cửa khẩu:  
- Tên hiển thị (Tên cửa khẩu) bắt buộc phải là duy nhất trên toàn hệ thống.  
- Hệ thống chặn lưu và báo lỗi nếu trùng tên (so khớp không phân biệt hoa/thường, tự động trim khoảng trắng thừa). Áp dụng đối soát trên tất cả bản ghi hoạt động và không hoạt động  
* BR-DM-12: Quy tắc chống trùng Tên khu vực (Địa điểm vận tải):  
  \- Đối với danh mục đặc thù "Địa điểm vận tải", Tên khu vực khi tạo mới hoặc chỉnh sửa cũng bắt buộc phải là duy nhất trên toàn hệ thống và không được phép trùng lặp   
* BR-DM-13: Chuẩn hóa tích hợp (ISO Integration):

\- Mã Tiền tệ chuẩn ISO 4217 là điều kiện bắt buộc để hệ thống gọi API đồng bộ Tỷ giá tự động từ Vietcombank (VCB).

\- Mã Quốc gia chuẩn ISO 3166-1 là cơ sở để đồng bộ vùng địa lý và định cấu hình "Địa điểm vận tải" chuẩn xác 

* BR-DM-14: Ràng buộc Tên viết tắt Chi cục Hải quan: Đối với danh mục Chi cục Hải quan, trường Tên viết tắt chi cục là thông tin nhập tay bắt buộc và phải là duy nhất (unique) trong danh mục. Hệ thống sẽ chặn lưu và báo lỗi nếu người dùng bỏ trống hoặc nhập trùng tên viết tắt đã tồn tại (bao gồm cả các bản ghi đang hoạt động và đã bị vô hiệu hóa).  
* BR-DM-15: Quy tắc thiết lập và hiển thị trường Mô tả:- Trường Mô tả trong tất cả các danh mục dùng chung (Master Data) có giới hạn lưu trữ tối đa là 255 ký tự.

\- Trên bảng danh sách của 12 danh mục, trường này bắt buộc phải được tách thành một cột riêng biệt mang tên "Mô tả" (không hiển thị gộp chung dòng với Tên hiển thị).- Áp dụng cơ chế rút gọn hiển thị bằng dấu ba chấm (...) ở ký tự thứ 50 trên bảng danh sách và kích hoạt Tooltip hiển thị đầy đủ nội dung khi người dùng rê chuột vào

* BR-DM-16: Quy tắc gộp hiển thị địa chỉ Cửa khẩu:   
- Chuỗi địa chỉ hoàn chỉnh hiển thị ngoài bảng table bắt buộc phải ghép theo thứ tự từ vi mô đến vĩ mô: \[Số nhà, tên đường\], \[Phường/Xã\], \[Tỉnh/Thành phố\], \[Quốc gia\].  
- *Ví dụ hiển thị:* Khu vực Cửa khẩu quốc tế Hữu Nghị, Thị trấn Đồng Đăng, Tỉnh Lạng Sơn, Việt Nam.   
* BR-DM-17:**Quy tắc phân nhánh cấu trúc địa giới theo Quốc gia:**  
- **Việt Nam:** Cấu trúc địa giới gồm 2 cấp con: Tỉnh/Thành phố ;Phường/Xã.  
- **Trung Quốc:** Cấu trúc địa giới gồm 4 cấp con: Tỉnh/Thành phố ;Thành phố / Địa cấp thị;Quận/Huyện;Phường/Xã.  
- **Ràng buộc validate (Mandatory Level):** Hệ thống chỉ bắt buộc người dùng chọn tới cấp **Tỉnh/Thành phố**. Nếu các cấp chi tiết hơn bị bỏ trống, hệ thống vẫn chấp nhận lưu và hiển thị chuỗi địa chỉ theo các cấp đã được chọn5. 

BR-DM\-18: Quy tắc phân nhánh địa giới Địa điểm vận tải:- Cho phép cấu hình Địa điểm vận tải theo cả hai quốc gia Việt Nam và Trung Quốc- Ràng buộc bắt buộc chọn tối thiểu đến cấp Tỉnh/Thành phố.- Trên Table danh sách, hiển thị phân rã thành các cột riêng biệt: QUỐC GIA, TỈNH/THÀNH PHỐ, THÀNH PHỐ / ĐỊA CẤP THỊ, QUẬN/HUYỆN, PHƯỜNG/XÃ để dễ dàng tra cứu và lọc dữ liệu.

BR-DM\-19: Danh mục “Đơn vị tính” không cho phép người dùng tạo mới. Người dùng muốn bổ sung cần báo quản trị và đưa ra trường để mapping số lượng với đơn vị tính đó

## 3.5. Danh sách thông báo và lỗi

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Tên hiển thị khi Thêm mới | Lỗi | Vui lòng nhập đầy đủ Tên hiển thị | Không lưu |
| Bấm toggle Tắt 1 giá trị đang được tham chiếu (ở K1 hoặc K3) | Cảnh báo | Thao tác tắt sẽ không ảnh hưởng dữ liệu cũ nhưng sẽ ẩn khỏi lựa chọn mới. Bạn có chắc chắn tắt? | Chờ xác nhận trước khi đổi trạng thái |
| Sửa/Tắt giá trị thuộc danh mục 'Loại hình Xuất Nhập Khẩu' | Cảnh báo | Thay đổi này có thể ảnh hưởng tới cấu hình Chặng đang áp dụng giá trị này | Chờ xác nhận trước khi lưu |
| Lưu giá trị mới thành công | Thành công | Đã thêm giá trị mới vào danh mục | Cập nhật bảng danh sách, giá trị khả dụng ngay ở cả K1 và K3 |
| Để trống 'Địa điểm kho' khi Tạo mới/Sửa danh mục Kho | Lỗi | Vui lòng nhập Địa điểm kho | Không lưu |
| Chưa chọn Quốc gia/Tỉnh/Thành hoặc chưa tick Phường/Xã khi Tạo mới "Địa điểm vận tải" | Lỗi | "Vui lòng chọn đầy đủ Quốc gia, Tỉnh/Thành phố và ít nhất 1 Phường/Xã" | Chặn lưu, giữ nguyên màn hình để người dùng nhập liệu bổ sung. |
| Phường/Xã đã chọn trùng với 1 khu vực khác đang áp dụng trong cùng Tỉnh/Thành phố | Lỗi | "Phường/Xã \[Tên Phường/Xã\] đã thuộc khu vực \[Tên khu vực trùng\], vui lòng bỏ chọn hoặc vô hiệu hóa khu vực cũ trước" | Chặn thao tác lưu. |
| Nhập trùng Tên hiển thị khi tạo mới hoặc chỉnh sửa giá trị danh mục phẳng | Lỗi | "Tên hiển thị \[Tên nhập vào\] đã tồn tại trong danh mục này, vui lòng nhập tên khác" | Chặn lưu, giữ nguyên modal và dữ liệu đang nhập để người dùng chỉnh sửa. |
| Nhập trùng Tên khu vực khi tạo mới hoặc chỉnh sửa "Địa điểm vận tải" | Lỗi | "Tên khu vực \[Tên nhập vào\] đã tồn tại trên hệ thống, vui lòng nhập tên khác" | Chặn lưu, giữ nguyên form đang nhập. |

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Danh mục Địa điểm vận tải: Bổ sung bộ lọc theo quốc gia, tỉnh/thành phố, phường/xã Bắt buộc chọn lần lượt bộ lọc quốc gia \> tỉnh/thành phố \> phường xã Giá trị lọc tỉnh/thành phố lấy theo quốc gia đã chọn và giá trị lọc phường/xã lấy theo tỉnh/thành phố đã chọn. | Chưa có bộ lọc | 14/10/2026 | Đề xuất của BA |
| 2 | Danh mục Tiền tệ: Xóa bỏ chức năng Thêm/Sửa/Kích hoạt \- Vô hiệu hóa giá trị danh mục Chỉ được xem danh sách danh mục Tiền tệ. | Được phép Thêm/Sửa/Xóa Tiền tệ | 14/10/2026 | Đề xuất của BA |
| 3 | Cập nhật thứ tự hiển thị: Theo ID của danh mục | Thứ tự hiển thị danh mục theo tên danh mục | 14/10/2026 | Đề xuất của BA |

