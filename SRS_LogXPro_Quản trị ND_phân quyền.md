# **TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**  **(Software Requirements Specification \- SRS)**

| Tên hệ thống | Module Quản trị người dùng và phân quyền \- LogXPro |
| :---- | :---- |
| **Link UI Design** | Updating |
| **Người lập** | Đặng Thanh Sơn |
| **Ngày tạo** | 06/08/2026 |

## **1\. Tổng quan & Phạm vi**

### **1.1. Mục tiêu**

Tài liệu này mô tả thiết kế module Quản trị Người dùng & Phân quyền của hệ thống LogXPro, dùng để bàn giao cho đội phát triển triển khai. Nội dung bao gồm: sơ đồ ERD, mô tả các bảng dữ liệu, luồng người dùng và các business rule cần đảm bảo khi lập trình

### **1.2. Phạm vi hệ thống**

- **Trong phạm vi (In-scope):** Module chịu trách nhiệm phân quyền cho user sử dụng hệ thống LogXPro của một doanh nghiệp. Do LogXPro triển khai theo mô hình single-tenant (mỗi doanh nghiệp có một bản LogXPro riêng), tài liệu không đề cập cơ chế multi-tenant

- **Ngoài phạm vi (Out-of-scope)**

### **1.3. Định nghĩa thuật ngữ**

| Tên | Định nghĩa |
| :---- | :---- |
| **Khối** | Đơn vị chức năng gốc của mô hình 4PL (K1–K5), sở hữu SSOT tương ứng  |
| **Role trong khối** | Vai trò nghiệp vụ thuộc mỗi khối của mô hình 4PL, dùng để gom nhóm permission theo định nghĩa 4PL. Do LogXPro sở hữu  |
| **Permission** | Quyền nguyên tử của hệ thống, gắn với một hành động cụ thể trên một đối tượng. Do LogXPro sở hữu và cố định  |
| **Vai trò** | Do doanh nghiệp tự tạo, là bó permission phù hợp với vị trí cụ thể trong doanh nghiệp (ví dụ: Trưởng phòng Kinh doanh, Nhân viên Định giá).  |
| **Bộ phận** | Đơn vị tổ chức trong doanh nghiệp, dùng để nhóm user cho mục đích quản lý, không mang permission  |
| **SSOT** | (Single Source of Truth): Nguồn dữ liệu chính duy nhất. Mỗi Khối trong 4PL sở hữu một loại SSOT  |
| **SoD** | (Segregation of Duties): Nguyên tắc phân tách trách nhiệm để chống gian lận nội bộ  |

## 2\. **Nguyên tắc thiết kế**

### **2.1. Kiến trúc phân quyền**

Hệ thống áp dụng mô hình RBAC (Role-Based Access Control) chuẩn, với 3 tầng chính:

**•** Permission: quyền nguyên tử, LogXPro định nghĩa cố định, được gom nhóm theo Khối và Role trong khối để enforce SSOT ở tầng dữ liệu.

**•** Vai trò: doanh nghiệp tự tạo bằng cách tích chọn permission từ rổ có sẵn. Đây là tầng gán quyền chính.

**•** User: được gán 1 hoặc nhiều vai trò. Quyền của user là union permission của tất cả vai trò được gán.

Bộ phận là tầng tổ chức độc lập, không mang permission. Bộ phận dùng để nhóm user cho quản lý (ví dụ: filter user theo phòng khi admin tìm kiếm).

### **2.2. Ràng buộc SSOT**

Mỗi permission có prefix theo Khối (k1.\*, k2.\*…). Ràng buộc này đảm bảo:

**•** Mọi thao tác đụng đến dữ liệu của Khối nào đều phải qua permission có prefix Khối đó.

**•** Audit log có thể lọc theo Khối để truy nguồn ai đã thay đổi dữ liệu SSOT nào.

**•** Ngay cả khi doanh nghiệp gộp phòng ban, ranh giới quyền theo Khối vẫn được giữ.

### **2.3. Cơ chế cảnh báo/chặn SoD**

LogXPro cung cấp bảng SOD\_CONSTRAINT chứa các cặp permission không nên (WARN) hoặc không được phép (BLOCK) cùng tồn tại trong một vai trò hoặc trên một user. Bảng này do LogXPro sở hữu, doanh nghiệp không sửa được.

**•** BLOCK: chặn cứng, hệ thống không cho lưu vai trò/gán user. Áp dụng cho các cặp SoD trọng yếu (VD: tạo \+ duyệt báo giá cùng một người).

**•** WARN: cảnh báo mềm, admin xác nhận vẫn được phép lưu. Áp dụng cho các trường hợp gộp quyền chéo Khối không phổ biến nhưng có thể chấp nhận trong doanh nghiệp nhỏ 

## 

## **3\. Sơ đồ ERD**

![][image1]

### **3.1 Mô tả chi tiết các bảng**

3.2.1 **Bảng Khối**

*Mục đích: Lưu 5 Khối chức năng của mô hình 4PL. Bảng do LogXPro sở hữu, seed cố định khi cài đặt.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã khối** | VARCHAR | PK | Mã định danh Khối (K1, K2, K3, K4, K5) |
| **Tên khối** | VARCHAR |   | Tên đầy đủ của Khối \- Khối 1: Thương mại và khách hàng  \- Khối 2: Định giá và giải pháp \- Khối 3: Tháp điều phối \- Khối 4: Quản trị nhà thầu \- Khối 5: Tài chính và tuân thủ |
| **Mô tả** | TEXT |   | Mô tả Khối và loại SSOT mà Khối sở hữu |
| **Thứ tự hiển thị** | INT |   | Số thứ tự hiển thị trên UI |

3.2.2 **Bảng Role trong khối** 

*Mục đích: Lưu các vai trò nghiệp vụ 4PL. Dùng để gom nhóm permission theo định nghĩa 4PL, không dùng gán quyền trực tiếp cho user. Bảng do LogXPro sở hữu, seed cố định \=\> MVP liệt kê trước những role sử dụng, bổ sung role ở phase tiếp theo*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã role** | VARCHAR | PK | Mã định danh role 4PL |
| **Tên role** | VARCHAR |   | Tên vai trò nghiệp vụ 4PL |
| **Mã khối** | VARCHAR | FK | Khối mà role này thuộc về (FK → KHOI) |
| **Mô tả** | TEXT |   | Mô tả trách nhiệm nghiệp vụ của role |

| Tên khối | Tên role | Vai trò trách nhiệm |
| :---- | :---- | :---- |
| **Khối 1** | \- Dịch vụ khách hàng \- Kinh doanh | Chịu trách nhiệm tạo doanh thu và duy trì quan hệ khách hàng |
| **Khối 2** | \- Định giá | Chịu trách nhiệm bảo vệ biên lợi nhuận qua mọi báo giá |
| **Khối 3** | \- Trưởng điều phối \- Khai báo hải quan\- Hải quan giám sát\- Vận tải\- Sang tải\- Kho | Chịu trách nhiệm điều phối toàn bộ vòng đời lô hàng từ khi có yêu cầu đến lúc hoàn thành dịch vụ |
| **Khối 4** | \- Quản lý nhà thầu | Chịu trách nhiệm xây và duy trì mạng lưới nhà thầu đủ năng lực |
| **Khối 5** | \- Kiểm soát công nợ thu\- Kiểm soát công nợ trả | Theo dõi, tổng hợp tài chính. Quản lý hiệu suất, tuân thủ |

## 

3.2.3 **Bảng PERMISSION**

*Mục đích: Rổ chứa toàn bộ quyền nguyên tử của hệ thống. Bảng do LogXPro sở hữu, cố định – doanh nghiệp không thêm/bớt/sửa.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã permission** | VARCHAR | PK | Mã định danh permission (ví dụ: k1.lead.create) |
| **Tên permission** | VARCHAR |   | Tên hiển thị (ví dụ: Tạo lead) |
| **Mô tả** | TEXT |   | Mô tả chi tiết permission cho phép làm gì |
| **Mã khối** | VARCHAR | FK | Khối chứa permission (FK → KHOI, dùng enforce SSOT) |
| **Mã role trong khối** | VARCHAR | FK | Role 4PL để gom nhóm hiển thị trên UI (FK → ROLE\_4PL) |
| **Đối tượng** | VARCHAR |   | Đối tượng nghiệp vụ (lead, order, quote…) |
| **Hành động** | VARCHAR |   | Loại hành động (create, read, update, delete, approve) |
| **is\_active** | BOOL |   | Cho phép ẩn permission cũ mà không xoá dữ liệu |

3.2.4 **Bảng SOD\_CONSTRAINT**

*Mục đích: Khai báo các cặp permission bị ràng buộc SoD hoặc SSOT. Bảng do LogXPro sở hữu, doanh nghiệp không sửa.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã ràng buộc** | VARCHAR | PK | Mã định danh ràng buộc |
| **permission\_a** | VARCHAR | FK | Permission thứ nhất (FK → PERMISSION) |
| **permission\_b** | VARCHAR | FK | Permission thứ hai (FK → PERMISSION) |
| **severity** | ENUM |   | Mức độ: WARN (cảnh báo mềm) hoặc BLOCK (chặn cứng) |
| **loai** | ENUM |   | Loại ràng buộc: **SOD** (SSOT enforce bằng prefix Khối theo 2.2, không khai qua bảng này  |
| **Thông báo** | TEXT |   | Nội dung hiển thị khi vi phạm |
| **is\_active** | BOOL |   | Cho phép vô hiệu hoá ràng buộc |

**Lưu ý: Cặp (permission\_a, permission\_b) phải unique và luôn sắp xếp permission\_a \< permission\_b theo thứ tự alphabet để tránh trùng lặp cặp đảo.**

3.2.5. **Bảng VAI\_TRO**

*Mục đích: Lưu các vai trò do doanh nghiệp tự tạo. Ví dụ: Trưởng phòng Kinh doanh, Nhân viên Định giá.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã vai trò** | UUID | PK | Mã định danh vai trò |
| **Tên vai trò** | VARCHAR |   | Tên vai trò do doanh nghiệp đặt |
| **Mô tả** | TEXT |   | Mô tả vai trò |
| **is\_active** | BOOL |   | Vô hiệu hoá vai trò mà không xoá |
| **created\_by** | UUID | FK | User tạo vai trò (FK → USER) |
| **created\_at** | TIMESTAMP |   | Thời điểm tạo |

**Lưu ý: Tên vai trò cần unique trên toàn hệ thống. Vai trò chỉ được xoá khi không còn user nào được gán – nếu còn user thì chỉ vô hiệu hoá (is\_active \= false).**

3.2.6 **Bảng VAI\_TRO\_PERMISSION**

*Mục đích: Bảng nối, thể hiện vai trò gồm những permission nào.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã vai trò** | UUID | PK, FK | FK → VAI\_TRO |
| **Mã permission** | VARCHAR | PK, FK | FK → PERMISSION |
| **granted\_by** | UUID | FK | User gán permission vào vai trò (FK → USER) |
| **granted\_at** | TIMESTAMP |   | Thời điểm gán |

3.2.7 **Bảng Bộ phận**

*Mục đích: Lưu bộ phận trong doanh nghiệp. Bộ phận chỉ dùng để nhóm user cho mục đích quản lý, KHÔNG mang permission.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã bộ phận** | UUID | PK | Mã định danh bộ phận |
| **Tên bộ phận** | VARCHAR |   | Tên bộ phận |
| **is\_active** | BOOL |   | Vô hiệu hoá bộ phận mà không xoá |
| **created\_at** | TIMESTAMP |   | Thời điểm tạo |

3.2.8 **Bảng USER**

*Mục đích: Lưu user sử dụng hệ thống LogXPro.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã user** | UUID | PK | Mã định danh user |
| **Họ và tên** | VARCHAR |   | Họ tên đầy đủ |
| **email** | VARCHAR |   | Email đăng nhập, unique |
| **Số điện thoại** | VARCHAR |   | SĐT liên hệ |
| **is\_active** | BOOL |   | Vô hiệu hoá user (khoá tài khoản) |
| **created\_at** | TIMESTAMP |   | Thời điểm tạo |

3.2.9 **Bảng USER\_BO\_PHAN**

*Mục đích: Bảng nối, thể hiện user thuộc bộ phận nào. Một user có thể thuộc nhiều bộ phận.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã user** | UUID | PK, FK | FK → USER |
| **Mã bộ phận** | UUID | PK, FK | FK → BO\_PHAN |
| **assigned\_at** | TIMESTAMP |   | Thời điểm gán |

3.2.10 **Bảng USER\_VAI\_TRO**

*Mục đích: Bảng nối, thể hiện user được gán vai trò nào. Một user có thể có nhiều vai trò – quyền là union permission của tất cả vai trò.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **Mã user** | UUID | PK, FK | FK → USER |
| **Mã vai trò** | UUID | PK, FK | FK → VAI\_TRO |
| **assigned\_by** | UUID | FK | User thực hiện gán (FK → USER) |
| **assigned\_at** | TIMESTAMP |   | Thời điểm gán |

3.2.11 **Bảng AUDIT\_LOG**

*Mục đích: Ghi log mọi thao tác thay đổi trong module phân quyền để phục vụ audit khi cần.*

| Tên cột | Kiểu dữ liệu | Khoá | Mô tả |
| ----- | ----- | ----- | ----- |
| **log\_id** | UUID | PK | Mã định danh bản ghi log |
| **actor\_user\_id** | UUID | FK | User thực hiện thao tác (FK → USER) |
| **action\_type** | VARCHAR |   | Loại thao tác (CREATE, UPDATE, DELETE, ASSIGN, REVOKE) |
| **target\_entity** | VARCHAR |   | Tên bảng bị thao tác (VAI\_TRO, USER\_VAI\_TRO…) |
| **target\_id** | VARCHAR |   | ID của record bị thao tác |
| **old\_value** | JSON |   | Snapshot dữ liệu trước thay đổi |
| **new\_value** | JSON |   | Snapshot dữ liệu sau thay đổi |
| **created\_at** | TIMESTAMP |   | Thời điểm ghi log |

## 4\. **Sơ đồ người dùng**

Sơ đồ dưới đây mô tả các bước Admin thực hiện để phân quyền cho user sử dụng LogXPro, từ tạo bộ phận đến gán vai trò cho user. Hệ thống kiểm tra vi phạm SoD/SSOT ở 2 điểm: khi tạo/sửa vai trò và khi gán nhiều vai trò cho user.

![][image2]

| Bước | Hành động | Diễn giải |
| :---- | :---- | :---- |
| Bước 1 | Tạo bộ phận | Admin tạo danh sách bộ phận theo cấu trúc thực tế của doanh nghiệp (ví dụ: Phòng Kinh doanh, Phòng Định giá, Phòng Vận hành). Bộ phận chỉ mang tính tổ chức, không mang permission |
| Bước 2 | Tạo vai trò | Admin tạo vai trò bằng cách nhập tên và tích chọn permission từ rổ có sẵn. Permission trên UI được gom nhóm theo Khối → Role 4PL để dễ tìm. Khi Admin lưu, nếu tổ hợp quyền chạm cặp nhạy cảm, hệ thống hiển thị cảnh báo; admin xác nhận thì cho lưu và ghi nhật ký (chế độ mặc định là Cảnh báo, không chặn) |
| Bước 3 | Tạo user | Admin tạo user với thông tin cơ bản: họ tên, email, số điện thoại. Email phải unique |
| Bước 4 | Gán user vào bộ phận | Admin chọn 1 hoặc nhiều bộ phận cho user. Việc gán bộ phận không ảnh hưởng đến quyền của user |
| Bước 5 | Gán vai trò cho user | Admin chọn 1 hoặc nhiều vai trò cho user. Nếu tổ hợp permission từ nhiều vai trò vi phạm SoD/SSOT, hệ thống áp dụng cùng logic kiểm tra như ở Bước 2 (BLOCK hoặc WARN) |
| Ghi Audit Log |  | Mọi thao tác thêm/sửa/xoá vai trò, gán vai trò, gán bộ phận đều được ghi vào bảng AUDIT\_LOG với snapshot dữ liệu trước và sau thay đổi |

## 5\. Đặc tả tính năng

### **5.1. MODULE 1 — Đăng nhập / Đăng xuất**

**US\_AUTH\_01 — Đăng nhập**

| ID US | US\_AUTH\_01 |
| :---- | :---- |
| **Tên Story** | Đăng nhập |
| **User Story** | Là người dùng LogXPro, tôi muốn đăng nhập bằng email và mật khẩu, để truy cập hệ thống theo đúng quyền được cấp. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Màn đăng nhập gồm Email, Mật khẩu, nút Đăng nhập; nhập đúng → vào màn theo quyền hiệu lực. | NC1: Sai email/mật khẩu → báo “Email hoặc mật khẩu không đúng”, không cho vào. |
| AC2 | Tài khoản đang bị khóa (Dừng hoạt động) → chặn đăng nhập, báo “Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.” | NC2: Bỏ trống email/mật khẩu → báo “Vui lòng nhập email và mật khẩu.” |
| AC3 | Lần đầu đăng nhập hoặc sau khi bị reset mật khẩu → hệ thống buộc chuyển sang màn Đổi mật khẩu trước khi vào hệ thống. |  |
| AC4 | Đăng nhập thành công nhưng chưa có quyền hiệu lực nào → hiển thị màn thông báo “Bạn chưa được phân quyền thực hiện. Liên hệ admin để được cấp quyền” và không thao tác nghiệp vụ. |  |
| AC5 | Mỗi tài khoản chỉ 1 phiên hoạt động tại một thời điểm; đăng nhập mới → phiên cũ bị chấm dứt ngay lập tức. Ở phiên bị chấm dứt, hệ thống đẩy về trang đăng nhập kèm thông báo: "Tài khoản của bạn vừa được đăng nhập trên một thiết bị khác." |  |
| AC6 | Hệ thống đếm số lần nhập sai mật khẩu.  | NC3: Nhập sai mật khẩu 5 lần liên tiếp → Khóa tài khoản tạm thời trong 15 phút. Hiển thị thông báo: "Tài khoản bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau 15 phút." |
| AC7 | Session Timeout (Tự động đăng xuất): Nếu người dùng không có bất kỳ thao tác nào trên hệ thống trong vòng 24 giờ, hệ thống sẽ tự động đăng xuất và đẩy về màn hình đăng nhập kèm thông báo: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_01** | Phải đăng nhập thành công trước khi truy cập bất kỳ chức năng nào. |
| **BR\_PQ\_02** | Xác thực email \+ mật khẩu với dữ liệu tài khoản; đúng → cho vào, sai → báo lỗi và không cho vào. |
| **BR\_PQ\_03** | Tài khoản Dừng hoạt động (đã khóa) không đăng nhập được. |
| **BR\_PQ\_04** | Tài khoản đăng nhập lần đầu hoặc ngay sau khi được Admin reset mật khẩu thì bắt buộc phải đổi mật khẩu mới trước khi truy cập bất kỳ tính năng nào. |
| **BR\_PQ\_05** | Chưa có quyền hiệu lực → đăng nhập được nhưng không thao tác; hiển thị thông báo liên hệ admin. |
| **BR\_PQ\_06** | Mỗi tài khoản chỉ 1 phiên tại một thời điểm; đăng nhập mới chấm dứt phiên cũ. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Email** | v | Text | Tài khoản đăng nhập |
| **Mật khẩu** | v | Password | Mật khẩu đăng nhập |
| **Dòng thông báo lỗi** |  | Text | Nếu sai email hoặc mk hệ thống thông báo lỗi |
| **Đăng nhập** |  | Button | Xác thực và vào hệ thống theo quyền |

**US\_AUTH\_02 — Đổi mật khẩu (bắt buộc lần đầu / sau khi reset)**

| ID US | US\_AUTH\_02 |
| :---- | :---- |
| **Tên Story** | Đổi mật khẩu (bắt buộc lần đầu / sau khi reset) |
| **User Story** | Là người dùng, tôi muốn đổi mật khẩu mặc định sang mật khẩu riêng, để bảo mật tài khoản. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Sau đăng nhập lần đầu hoặc sau reset, hệ thống bắt buộc chuyển sang màn Đổi mật khẩu. Người dùng không thể truy cập bất kỳ tính năng nào khác ngoài việc Đổi mật khẩu hoặc Đăng xuất. Nếu Đăng xuất, hệ thống sẽ tiếp tục yêu cầu đổi mật khẩu ở lần đăng nhập kế tiếp. |  |
| AC2 | Nhập Mật khẩu mới \+ Xác nhận mật khẩu. Mật khẩu phải đạt chuẩn: Tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số. (Ghi chú: Không cấm đặt trùng với mật khẩu cũ).  | NC1: Mật khẩu mới ≠ xác nhận → báo lỗi. NC2: Không đạt chuẩn độ mạnh → báo lỗi chi tiết yêu cầu. |
| AC3 | Đổi thành công → vào hệ thống; ghi Audit Log sự kiện (không lưu nội dung mật khẩu). |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_07** | Mật khẩu mới phải khớp ô xác nhận và đạt ràng buộc độ mạnh theo cấu hình. |
| **BR\_PQ\_08** | Ghi Audit Log sự kiện đổi mật khẩu (không lưu nội dung mật khẩu). |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Mật khẩu mới** | Có | Password | Mật khẩu người dùng tự đặt |
| **Xác nhận mật khẩu** | Có | Password | Nhập lại mật khẩu mới |
| **Xác nhận** |  | Button | Lưu mật khẩu mới và vào hệ thống |
| **Quay lại** |  | Button | Thoát mà không đổi (phải đổi ở lần đăng nhập sau) |

**US\_AUTH\_03 — Đăng xuất**

| ID US | US\_AUTH\_03 |
| :---- | :---- |
| **Tên Story** | Đăng xuất |
| **User Story** | Là người dùng, tôi muốn đăng xuất khỏi hệ thống, để bảo đảm an toàn tài khoản. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Bấm Đăng xuất → kết thúc phiên hiện tại và chuyển về màn đăng nhập. |  |
| AC2 | Sau đăng xuất phải đăng nhập lại để tiếp tục sử dụng. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_09** | Đăng xuất kết thúc phiên hiện tại và đưa về màn đăng nhập. |
| **BR\_PQ\_10** | Phải đăng nhập lại để tiếp tục sử dụng hệ thống. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Đăng xuất** |  | Button | Kết thúc phiên và về màn đăng nhập |

### **5.2. MODULE 2 — Quản lý người dùng**

**US\_USR\_01 — Xem và tìm kiếm danh sách người dùng**

| ID US | US\_USR\_01 |
| :---- | :---- |
| **Tên Story** | Xem và tìm kiếm danh sách người dùng |
| **User Story** | Là Admin, tôi muốn xem danh sách người dùng kèm tìm kiếm/lọc, để tra cứu và quản lý tài khoản trong công ty. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Bảng: Mã NV, Họ tên, Email, Bộ phận, Vai trò (nhiều), Trạng thái (Đang hoạt động/Đã khóa), Ngày tạo. | NC1: Không có quyền Quản lý người dùng → không truy cập màn này. |
| AC2 | Tìm kiếm theo Mã NV / Họ tên / Email; lọc theo Bộ phận, Vai trò, Trạng thái. | NC2: Không có kết quả → danh sách trống. |
| AC3 | Bấm một dòng mở chi tiết: thông tin, danh sách vai trò và Phân quyền người dùng (quyền hiệu lực – union). |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_11** | Quyền hiệu lực của một người dùng là tập hợp (Union) tất cả các quyền từ các "Vai trò" đang ở trạng thái Hoạt động mà người đó được gán. |
| **BR\_PQ\_12** | Tài khoản không có quyền “Quản lý người dùng” không truy cập được màn này. |

**Mô tả giao diện**

**[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=13543-84507&t=9bBezlMq3H7PBxLa-4)**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **KHUNG TRÁI: DANH SÁCH** |  |  |  |
| Tìm kiếm |  | Textbox | Nhập từ khóa để tìm kiếm người dùng (hỗ trợ tìm theo Họ tên, Mã nhân viên). |
| Thêm |  | Button | Nút bấm mở màn hình/form thêm mới người dùng. |
| Danh sách người dùng |  | List (Danh sách) | Danh sách cuộn. Mỗi dòng hiển thị: Icon đại diện, Họ và tên, Mã nhân viên. Khi click vào một dòng, hệ thống tải dữ liệu chi tiết sang khung bên phải. |
| **KHUNG PHẢI: CHI TIẾT** |  |  |  |
| Họ và tên |  | Text | Hiển thị họ và tên của người dùng đang được chọn. |
| Trạng thái |  | Badge (Nhãn) | Hiển thị trạng thái hiện tại của tài khoản (Ví dụ: Đang hoạt động, Đã khóa). |
| Mã nhân viên |  | Text | Hiển thị mã định danh của nhân viên. |
| Số điện thoại |  | Text | Hiển thị số điện thoại liên hệ. |
| Email |  | Text | Hiển thị địa chỉ Email (Tài khoản đăng nhập). |
| Vô hiệu hoá |  | Button | Nút bấm để thực hiện khóa tài khoản (ngăn chặn đăng nhập). |
| Chỉnh sửa |  | Button | Nút bấm mở màn hình/form cập nhật thông tin người dùng. |
| Vai trò |  | Tags / Chips | Liệt kê các vai trò mà người dùng đang được gán (Ví dụ: Dịch vụ khách hàng, Định giá, Trưởng điều phối). |
| Bảng chi tiết phân quyền |  | Table (Bảng) | Danh sách chi tiết các quyền hiệu lực của người dùng. Được gom nhóm theo từng Module (Ví dụ: Quản lý lead). Hiển thị Tên quyền và Mô tả quyền. |
| Thông tin cập nhật |  | Text | Dòng chữ nằm ở góc dưới cùng, hiển thị thời gian cập nhật lần cuối và tên người thực hiện cập nhật. |

**US\_USR\_02 — Tạo người dùng**

| ID US | US\_USR\_02 |
| :---- | :---- |
| **Tên Story** | Tạo người dùng |
| **User Story** | Là Admin, tôi muốn tạo tài khoản người dùng mới với Mã NV và email, gán bộ phận và vai trò, để cấp quyền truy cập hệ thống. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Form gồm: Mã NV(\*), Họ tên(\*), Số điện thoại, Email(\*) là tài khoản đăng nhập, Mật khẩu(\*) — Admin tự đặt, Bộ phận, Vai trò (không bắt buộc). | NC1: Bỏ trống trường (\*) → chặn lưu, báo lỗi tại trường thiếu. |
| AC2 | Mã NV và Email là duy nhất toàn hệ thống (Riêng Email KHÔNG phân biệt chữ hoa/thường, ví dụ A@gmail.com sẽ bị tính là trùng với a@gmail.com ). Số điện thoại nếu có nhập phải đúng định dạng số (10-11 số) | NC2: Email hoặc Số điện thoại sai định dạng → chặn lưu và báo lỗi tại trường tương ứng. |
| AC3 | Mật khẩu do Admin đặt phải đạt chuẩn độ mạnh (tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số). Hệ thống lưu hash, không lưu plain text. Admin tự chủ động gửi thông tin tài khoản và mật khẩu cho nhân viên (hệ thống KHÔNG tự động gửi email). Người dùng bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên . Admin sẽ tự chủ động gửi thông tin tài khoản và mật khẩu này cho nhân viên (Hệ thống KHÔNG tự động bắn Email). Người dùng bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên. | Mật khẩu không đạt chuẩn độ mạnh → chặn lưu, báo lỗi chi tiết. |
| AC4 | Người dùng chưa gán vai trò vẫn tạo được nhưng khi đăng nhập nhận thông báo chưa được phân quyền. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_13** | Mã nhân viên và Email của người dùng phải là duy nhất trên toàn hệ thống. Email được sử dụng làm tài khoản đăng nhập. |
| **BR\_PQ\_14** | Người dùng có thể được gắn vào 1 Bộ phận để quản lý nhân sự. Bộ phận này KHÔNG cấp quyền. |
| **BR\_PQ\_15** | Người dùng chưa gán vai trò: đăng nhập được nhưng không thao tác; hiển thị thông báo liên hệ admin. |
| **BR\_PQ\_16** | Ghi Audit Log thao tác tạo người dùng. |

**Mô tả giao diện**

**[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=13600-117197&t=9bBezlMq3H7PBxLa-4)**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| THÔNG TIN CƠ BẢN |  |  |  |
| Tiêu đề & Nút (X) |  | Text / Icon | Tiêu đề "Thêm mới người dùng". Nút (X) ở góc phải để đóng popup. |
| Mã nhân viên | Có | Textbox | Nhập mã định danh nhân viên. (Kiểm tra duy nhất toàn hệ thống). |
| Họ và tên | Có | Textbox | Nhập họ và tên đầy đủ của người dùng. |
| Email | Có | Textbox | Nhập địa chỉ email. (Kiểm tra duy nhất, dùng làm tài khoản đăng nhập). |
| Số điện thoại |  | Textbox | Nhập số điện thoại liên hệ. |
| Mật khẩu |  | Textbox | Nhập mật khẩu đăng nhập. |
| PHÂN QUYỀN (VAI TRÒ) |  |  |  |
| Danh sách Vai trò (Khung trái) |  | List & Checkbox | Liệt kê tất cả Vai trò. Cho phép tích chọn nhiều (Multi-select) để gán cho người dùng. (Không bắt buộc chọn \- Cho phép gán sau). |
| Danh sách quyền (Khung phải) |  | List | Hiển thị chi tiết danh sách các quyền nằm bên trong Vai trò đang được Focus ở cột trái. Hỗ trợ thanh Tìm kiếm quyền. |
| THAO TÁC |  |  |  |
| Hủy |  | Button | Đóng popup, không lưu dữ liệu. |
| Tạo |  | Button | Gửi dữ liệu tạo người dùng mới. Nếu thành công, đóng popup. |

**US\_USR\_03 — Cập nhật thông tin người dùng**

| ID US | US\_USR\_03 |
| :---- | :---- |
| **Tên Story** | Cập nhật thông tin người dùng |
| **User Story** | Là Admin, tôi muốn cập nhật thông tin của một người dùng, để giữ dữ liệu tài khoản chính xác. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Sửa Mã NV, Họ tên, SĐT, Bộ phận, Vai trò; sửa Email qua kiểm tra trùng. | NC1: Mã NV/Email mới trùng tài khoản khác → chặn lưu. |
| AC2 | Đổi vai trò làm quyền hiệu lực cập nhật ngay; mọi thay đổi ghi Audit Log. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_17** | Thay đổi vai trò của người dùng có hiệu lực tức thì lên quyền hiệu lực. |
| **BR\_PQ\_18** | Ghi Audit Log kèm trạng thái trước/sau. |

**Mô tả giao diện**

**[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=13593-116512&t=9bBezlMq3H7PBxLa-4)**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| THÔNG TIN CƠ BẢN |  |  |  |
| Tiêu đề & Nút (X) |  | Text / Icon | Tiêu đề "Chỉnh sửa người dùng" kèm theo Mã người dùng ở bên dưới (Ví dụ: XC-0009). Nút (X) ở góc phải để đóng popup. |
| Mã nhân viên | Có | Textbox (Chỉ đọc) | Hiển thị mã định danh của nhân viên. Tự động điền dữ liệu cũ. |
| Họ và tên | Có | Textbox | Cập nhật họ và tên đầy đủ của người dùng. |
| Email | Có | Textbox | Cập nhật địa chỉ email (Kiểm tra tính duy nhất toàn hệ thống). |
| Số điện thoại |  | Textbox | Cập nhật số điện thoại liên hệ. |
| BẢO MẬT & MẬT KHẨU |  |  |  |
| Ô Mật khẩu |  | Textbox (Chỉ đọc) | Hiển thị chuỗi ký tự ẩn (••••••••••) tượng trưng cho mật khẩu hiện tại (đã bị mã hóa). Admin không thể nhìn thấy pass cũ và không được gõ trực tiếp vào ô này. |
| Reset mật khẩu mặc định |  | Button | Nút bấm để đưa mật khẩu về lại giá trị mặc định (Logxpro@2026), đồng thời ép user phải đổi mật khẩu ở lần đăng nhập sau và ngắt phiên làm việc (kick) ngay lập tức. |
| PHÂN QUYỀN (VAI TRÒ) |  |  |  |
| Danh sách Vai trò (Khung trái) |  | List & Checkbox | Liệt kê tất cả Vai trò. Hiển thị sẵn các vai trò mà user đang nắm giữ (đã được tích xanh). Admin có thể tích thêm hoặc bỏ tích để cập nhật quyền. |
| Danh sách quyền (Khung phải) |  | List (Chỉ đọc) | Hiển thị chi tiết danh sách các quyền nằm bên trong Vai trò đang được Focus ở cột trái. Hỗ trợ thanh Tìm kiếm quyền. |
| THAO TÁC |  |  |  |
| Hủy |  | Button | Đóng popup, không lưu dữ liệu. |
| Cập nhật / Lưu |  | Button | Gọi API lưu lại các thay đổi. Nếu thành công, đóng popup và làm mới danh sách ngoài màn hình chính. |

**US\_USR\_04 — Reset mật khẩu về mặc định**

| ID US | US\_USR\_04 |
| :---- | :---- |
| **Tên Story** | Reset mật khẩu về mặc định |
| **User Story** | Là Admin, tôi muốn reset mật khẩu của một người dùng về mật khẩu mặc định, để hỗ trợ khi người dùng quên mật khẩu. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Nút “Reset mật khẩu” trên chi tiết người dùng → popup xác nhận. |  |
| AC2 | Sau xác nhận: mật khẩu về mặc định; chấm dứt phiên hiện tại; buộc đổi ở lần đăng nhập kế tiếp; ghi Audit Log. | NC1: Không xác nhận trên popup → không reset. |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_19** | Ghi Audit Log thao tác reset. |

**Mô tả giao diện**

**[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=13600-117452&t=9bBezlMq3H7PBxLa-4)**

**US\_USR\_05 — Khóa / Mở khóa tài khoản**

| ID US | US\_USR\_05 |
| :---- | :---- |
| **Tên Story** | Khóa / Mở khóa tài khoản |
| **User Story** | Là Admin, tôi muốn khóa hoặc mở khóa tài khoản người dùng, để kiểm soát quyền truy cập khi cần. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Khóa: hiển thị popup xác nhận; sau khi đồng ý, phiên hoạt động duy nhất hiện tại của người dùng bị chấm dứt ngay lập tức, màn hình của người dùng đó sẽ bị đẩy về trang đăng nhập kèm thông báo tài khoản đã bị khóa. |  |
| AC2 | Hệ thống chỉ cho phép khóa khi tài khoản KHÔNG còn công việc hoặc dịch vụ dở dang (ví dụ: YCBG, Phiếu dịch vụ...). Nếu còn việc, hệ thống chặn hoàn toàn, báo lỗi: "Tài khoản còn công việc chưa hoàn thành, vui lòng bàn giao trước khi khóa". | NC1: Còn việc dở mà khóa thường → hệ thống chặn. |
| AC3 | Mở khóa: popup xác nhận, không kiểm tra điều kiện; đăng nhập lại được ngay. |  |
| AC4 | Hệ thống chặn hoàn toàn việc khóa nếu tài khoản đang là người phụ trách DUY NHẤT của một khách hàng. Admin bắt buộc phải bàn giao khách hàng đó cho người khác trước thì mới được phép khóa. | NC2: Cố khóa KAM phụ trách duy nhất của khách hàng → chặn |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_20** | Khóa tài khoản cần có popup xác nhận. Khi khóa, hệ thống chấm dứt ngay phiên hoạt động hiện tại (đảm bảo tính nhất quán với quy tắc chỉ 1 phiên của BR\_PQ\_06); mở khóa cần popup, không ràng buộc điều kiện. |
| **BR\_PQ\_21** | Áp dụng quy tắc chặn cứng: chỉ được phép khóa tài khoản khi người dùng KHÔNG còn bất kỳ công việc dang dở nào theo Bảng định nghĩa Công việc dang dở. Hệ thống kiểm tra toàn bộ các Khối mà người dùng có quyền tham gia. Nếu còn ít nhất 1 đầu việc dang dở → chặn hoàn toàn, hiển thị danh sách đầu việc kèm thông báo: "Tài khoản còn {N} công việc chưa hoàn thành. Vui lòng bàn giao trước khi khóa." **Bảng định nghĩa "Công việc dang dở" theo từng Khối: Khối Đối tượng Vai trò kiểm tra Điều kiện "dang dở" (trạng thái)** Khối 1 — Sale Yêu cầu báo giá (YCBG) Người tạo / Người phụ trách Tạo mới, Chờ định giá, Đã báo giá KH (chưa có phản hồi KH) Khối 1 — Sale Báo giá khách hàng (BGKH) Người phụ trách Tạo mới, Chờ duyệt, Đã gửi KH (chưa có phản hồi KH) Khối 1 — Sale Khách hàng Người phụ trách DUY NHẤT Khách hàng ở trạng thái Đang hoạt động mà chỉ có 1 người phụ trách (đã quy định riêng tại BR\_PQ\_28) Khối 3 — CS Phiếu dịch vụ (Service Order) Điều phối viên phụ trách Tạo mới, Đã tiếp nhận, Đang thực hiện, Đã thực hiện  |
| **BR\_PQ\_22** | Không xóa vật lý người dùng; nghỉ việc thì khóa để giữ lịch sử. |
| **BR\_PQ\_23** | Áp dụng quy tắc chặn cứng: Không được khóa người dùng đang là người phụ trách DUY NHẤT của một khách hàng. Bắt buộc phải phân công lại người phụ trách mới được phép khóa. |

**US\_USR\_06 — Gán / gỡ vai trò cho người dùng (quản lý quyền – phía người dùng)**

| ID US | US\_USR\_06 |
| :---- | :---- |
| **Tên Story** | Gán / gỡ vai trò cho người dùng (quản lý quyền – phía người dùng) |
| **User Story** | Là Admin, từ chi tiết một người dùng, tôi muốn gán hoặc gỡ vai trò cho họ, để điều chỉnh quyền theo công việc. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Trên chi tiết người dùng, chọn 1+ vai trò để gán; thêm vai trò là cộng dồn, không thay thế. |  |
| AC3 | Gỡ vai trò → popup xác nhận; người dùng mất quyền của vai trò đó ngay, không cần đăng nhập lại. |  |
| AC4 | Quyền hiệu lực \= hợp (union) các vai trò đang hiệu lực; cho phép chéo Khối (kiêm nhiệm). |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_24** | Việc gán thêm vai trò cho người dùng mang tính chất cộng dồn thêm quyền, tuyệt đối không thay thế các vai trò cũ. |
| **BR\_PQ\_25** | Gỡ vai trò cần popup; mất quyền ngay, không cần đăng nhập lại. |
| **BR\_PQ\_26** | Ghi Audit Log thao tác gán/gỡ. |

**US\_USR\_07 — Xem Phân quyền người dùng (quyền hiệu lực)**

| ID US | US\_USR\_07 |
| :---- | :---- |
| **Tên Story** | Xem Phân quyền người dùng (quyền hiệu lực) |
| **User Story** | Là Admin, tôi muốn xem quyền hiệu lực đã hợp nhất của một người dùng, để kiểm tra đúng phạm vi thao tác. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Hiển thị quyền hiệu lực (union) theo cây Khối → Bộ phận 4PL → Đối tượng → Hành động; quyền trùng chỉ hiện một lần. |  |
| AC2 | Mỗi quyền xem được nguồn: đến từ (các) vai trò nào. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_27** | Khi một vai trò bị "Vô hiệu hóa", tập quyền của vai trò đó lập tức bị loại bỏ khỏi quyền hiệu lực của tất cả người dùng liên quan. Khi kích hoạt lại, quyền sẽ tự động được khôi phục. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Cây quyền hiệu lực** |  | Tree (chỉ đọc) | Khối → Bộ phận 4PL → Đối tượng → Hành động |
| **Cột “Nguồn vai trò”** |  | Text | Vai trò cấp quyền đó |
| **Ô tìm quyền** |  | Text | Lọc nhanh trong cây quyền |
| **Xuất danh sách quyền** |  | Button | Xuất phân quyền hiệu lực ra file |

### **5.3. MODULE 3 — Quản lý phân quyền (Vai trò)**

**US\_ROLE\_01 — Xem và tìm kiếm danh sách vai trò**

| ID US | US\_ROLE\_01 |
| :---- | :---- |
| **Tên Story** | Xem và tìm kiếm danh sách vai trò |
| **User Story** | Là Admin, tôi muốn xem danh sách vai trò kèm tìm kiếm, để quản lý các bó quyền trong hệ thống. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Bảng: Tên vai trò, Mô tả, Bộ phận (nếu có), Số quyền, Số người dùng, Trạng thái, Ngày tạo. |  |
| AC2 | Tìm kiếm theo Tên vai trò; lọc theo Bộ phận, Trạng thái. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_28** | Quyền trong vai trò gom nhóm hiển thị theo Khối → Bộ phận 4PL. |
| **BR\_PQ\_29** | Một vai trò có thể thuộc hoặc không thuộc bộ phận nào. Việc gán/gỡ vai trò vào bộ phận chỉ để gom nhóm, không ảnh hưởng đến quyền. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| KHUNG TRÁI: DANH SÁCH VAI TRÒ |  |  |  |
| Tìm kiếm |  | Textbox | Nhập từ khóa để tìm kiếm vai trò theo tên. |
| Thêm |  | Button | Nút bấm mở popup/form thêm mới Vai trò. |
| Danh sách Vai trò |  | List (Danh sách) | Danh sách cuộn. Mỗi dòng hiển thị: Icon khiên bảo mật, Tên vai trò, và Nhãn "Mặc định" (đối với các vai trò hệ thống). Khi click chọn 1 dòng, tải dữ liệu chi tiết sang khung phải. |
| KHUNG PHẢI: THÔNG TIN CHUNG (HEADER) |  |  |  |
| Tên vai trò |  | Text | Hiển thị tên của vai trò đang được chọn. |
| Trạng thái |  | Badge (Nhãn) | Hiển thị trạng thái hiện tại của vai trò (Ví dụ: Đang hoạt động, Vô hiệu hóa). |
| Mô tả |  | Text | Mô tả ngắn gọn ý nghĩa của vai trò. (Hiển thị "---" nếu chưa có dữ liệu). |
| Vô hiệu hoá / Kích hoạt |  | Button | Nút chuyển đổi trạng thái của vai trò. Khi Vô hiệu hóa, toàn bộ người dùng mang vai trò này sẽ bị tạm rút quyền ngay lập tức. |
| Chỉnh sửa |  | Button | Nút bấm mở màn hình/form để cập nhật Tên, Mô tả và phân lại Quyền cho vai trò. |
| Tab: Quyền |  | Tab (Nút chuyển) | Nút bấm để chuyển sang xem danh sách quyền. Có kèm theo con số tổng lượng quyền (Ví dụ: 20). |
| Tab: Người dùng |  | Tab (Nút chuyển) | Nút bấm để chuyển sang xem danh sách nhân sự đang nắm giữ vai trò. Có kèm con số tổng người dùng (Ví dụ: 20). |
| KHUNG PHẢI: NỘI DUNG TAB QUYỀN |  |  |  |
| Bảng Danh sách quyền |  | Table (Bảng) | Danh sách chi tiết các quyền, được phân loại và gom nhóm theo Module (Ví dụ: Quản lý lead, Quản lý khách hàng). Hiển thị chi tiết Tên quyền và Mô tả quyền. |
| KHUNG PHẢI: NỘI DUNG TAB NGƯỜI DÙNG |  |  |  |
| \+ Thêm người dùng |  | Button | Nút bấm màu xanh góc phải. Bấm vào sẽ hiển thị Popup cho phép gán nhanh vai trò này cho nhiều nhân sự cùng lúc. |
| Danh sách người dùng |  | List (Danh sách) | Liệt kê tất cả các nhân sự đang được gán vai trò này. Mỗi dòng hiển thị: Ảnh đại diện (Icon), Họ và tên, và Trạng thái hoạt động (dấu chấm xanh). |
| Gỡ |  | Button | Nút bấm (màu đỏ) nằm ở cuối mỗi dòng nhân sự. Bấm vào để thu hồi (gỡ) vai trò này khỏi người dùng tương ứng. |
| FOOTER CỦA MÀN HÌNH |  |  |  |
| Thông tin cập nhật |  | Text | Dòng chữ nằm ở góc dưới cùng màn hình, hiển thị thời gian cập nhật lần cuối và tên Admin thực hiện thao tác. |

**US\_ROLE\_02 — Tạo vai trò và gán quyền**

| ID US | US\_ROLE\_02 |
| :---- | :---- |
| **Tên Story** | Tạo vai trò và gán quyền |
| **User Story** | Là Admin, tôi muốn tạo vai trò mới và tích chọn quyền cho vai trò, để dựng bó quyền theo vị trí công việc. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Form: Tên vai trò(\*) duy nhất (KHÔNG phân biệt hoa/thường, ví dụ "Admin" trùng "admin"), Mô tả, Bộ phận. Cây quyền bắt buộc chọn ít nhất 1 quyền. | NC1: Tên vai trò trùng hoặc chưa chọn quyền nào (0 quyền) → chặn lưu và báo lỗi. | NC1: Tên vai trò trùng → chặn lưu. |
| AC2 | Cho phép tích chọn quyền thuộc nhiều Khối (kiêm nhiệm). |  |
| AC3 | Lưu:xác nhận thì lưu và ghi log; không xác nhận thì không lưu. | NC2: Bỏ trống Tên vai trò → chặn lưu. |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_30** | Tên vai trò duy nhất toàn hệ thống. |
| **BR\_PQ\_31** | Vai trò được phép chứa quyền của nhiều Khối (kiêm nhiệm). |
| **BR\_PQ\_32** | Rổ quyền cố định do LogXPro sở hữu; doanh nghiệp chỉ tích chọn, không tự thêm/sửa/xóa quyền. |
| **BR\_PQ\_33** | Ghi Audit Log thao tác tạo vai trò và danh sách quyền. |

**Mô tả giao diện**

[Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=13486-135280&t=3cCwKCbCl56YJbfJ-4)

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| THÔNG TIN CƠ BẢN |  |  |  |
| Tiêu đề & Nút đóng (X) |  | Text / Icon | Tiêu đề popup "Tạo vai trò mới". Góc phải có icon (X) để đóng popup. |
| Tên vai trò | Có | Textbox | Nhập tên của vai trò. (Lưu ý hệ thống sẽ kiểm tra trùng lặp tên trên toàn hệ thống, không phân biệt hoa/thường). |
| Mô tả |  | Textarea | Khung nhập liệu (có thể kéo dãn góc dưới) để ghi chú mô tả chi tiết chức năng, nhiệm vụ của vai trò này. |
| THAO TÁC |  |  |  |
| Hủy |  | Button | Đóng popup, hủy bỏ thao tác. |
| Tạo |  | Button | Gửi dữ liệu tạo vai trò mới. Gọi API lưu hệ thống. |

**US\_ROLE\_03 — Cập nhật quyền của vai trò**

| ID US | US\_ROLE\_03 |
| :---- | :---- |
| **Tên Story** | Cập nhật quyền của vai trò |
| **User Story** | Là Admin, tôi muốn sửa danh sách quyền của một vai trò, để điều chỉnh phạm vi cho mọi người dùng thuộc vai trò. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Cho phép tích thêm/bỏ tích quyền và lưu. |  |
| AC2 | Sau lưu, quyền hiệu lực của mọi người dùng thuộc vai trò cập nhật ngay lập tức. |  |
| AC3 | Ghi Audit Log trạng thái danh sách quyền trước/sau khi sửa. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_34** | Thay đổi quyền của vai trò có hiệu lực tức thì cho mọi người dùng thuộc vai trò (không cần đăng nhập lại). |
| **BR\_PQ\_35** | Ghi Audit Log trạng thái quyền trước/sau. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Cây quyền** | Có | Tree checkbox | Tình trạng tích hiện tại, cho sửa |
| **Ô tìm quyền** |  | Text | Lọc nhanh |
| **Lưu thay đổi** |  | Button | Áp dụng danh sách quyền mới (hiệu lực tức thì) |
| **Hủy** |  | Button | Bỏ thay đổi |

**US\_ROLE\_04 — Thêm người dùng vào vai trò**

| ID US | US\_ROLE\_04 |
| :---- | :---- |
| **Tên Story** | Thêm người dùng vào vai trò |
| **User Story** | Là Admin, từ chi tiết một vai trò, tôi muốn thêm người dùng vào vai trò, để cấp bó quyền cho họ. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Trên chi tiết vai trò, chọn 1+ người dùng để thêm vào vai trò. |  |
| AC3 | Thêm có hiệu lực tức thì; quyền của người dùng \= hợp (union) các vai trò. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_36** | Có hiệu lực tức thì, không cần đăng nhập lại. |
| **BR\_PQ\_37** | Ghi Audit Log thao tác thêm người dùng vào vai trò. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| THÔNG TIN CƠ BẢN |  |  |  |
| Tiêu đề & Nút đóng (X) |  | Text / Icon | Tiêu đề popup "Thêm người dùng". Góc phải có icon (X) để đóng cửa sổ. |
| Ô chọn Người dùng | Có | Dropdown (Multi-select) | Trường thả xuống cho phép tìm kiếm và chọn người dùng. Hỗ trợ chọn nhiều người cùng lúc. (Nên tích hợp tính năng gõ từ khóa để search nhanh theo tên/mã NV). |
| DANH SÁCH ĐÃ CHỌN |  |  |  |
| Tiêu đề "Đã chọn" |  | Text | Hiển thị tổng số lượng người dùng đã được chọn trong đợt này (Ví dụ: Đã chọn (4)). |
| Danh sách thẻ (Chips) |  | List (Danh sách khối) | Hiển thị danh sách các người dùng đã chọn dưới dạng các khối chữ nhật. Mỗi khối hiển thị: Họ và tên, Mã nhân viên. |
| Nút xóa thẻ (X) |  | Button / Icon | Dấu (X) màu đỏ nằm trên từng khối. Admin bấm vào để loại bỏ người dùng đó ra khỏi danh sách chuẩn bị thêm. |
| THAO TÁC |  |  |  |
| Hủy |  | Button | Đóng popup, hủy bỏ thao tác gán. |
| Thêm |  | Button | Gửi yêu cầu lưu dữ liệu. Hệ thống sẽ gán Vai trò hiện tại cho tất cả các người dùng có mặt trong danh sách đã chọn. (Sau khi thêm thành công, popup đóng lại và danh sách ở tab Người dùng được làm mới). |

**US\_ROLE\_05 — Gỡ người dùng khỏi vai trò**

| ID US | US\_ROLE\_05 |
| :---- | :---- |
| **Tên Story** | Gỡ người dùng khỏi vai trò |
| **User Story** | Là Admin, từ chi tiết một vai trò, tôi muốn gỡ một người dùng khỏi vai trò, để thu hồi bó quyền đó khỏi họ. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Trên danh sách người dùng của vai trò, mỗi dòng có nút Gỡ → popup xác nhận. | NC1: Không xác nhận popup → không gỡ. |
| AC2 | Sau xác nhận, người dùng mất ngay quyền của vai trò đó (hiệu lực tức thì, không cần đăng nhập lại); các người dùng khác trong vai trò không bị ảnh hưởng. |  |
| AC3 | Nếu sau khi gỡ người dùng không còn vai trò nào → hệ thống cảnh báo “Người dùng sẽ không còn quyền nào”, vẫn cho gỡ; lần đăng nhập kế tiếp người dùng thấy thông báo chưa được phân quyền. |  |
| AC4 | Ghi Audit Log: ai gỡ, thời điểm, vai trò nào, người dùng nào. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_38** | Gỡ người dùng khỏi vai trò cần popup xác nhận; mất quyền ngay, không cần đăng nhập lại. |
| **BR\_PQ\_39** | Chỉ ảnh hưởng người dùng bị gỡ; các người dùng khác trong vai trò giữ nguyên. |
| **BR\_PQ\_40** | Nếu người dùng không còn vai trò nào sau khi gỡ → cảnh báo và áp trạng thái “chưa được phân quyền”. |
| **BR\_PQ\_41** | Ghi Audit Log thao tác gỡ. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Danh sách người dùng** |  | Bảng | Mỗi dòng có nút Gỡ |
| **Popup xác nhận** |  | Popup | Kèm dòng cảnh báo nếu người dùng sẽ hết quyền |
| **Gỡ** |  | Button | Gỡ người dùng ở dòng tương ứng khỏi vai trò |
| **Xác nhận gỡ** |  | Button | Thực hiện gỡ (hiệu lực tức thì) |
| **Hủy** |  | Button | Đóng popup, không gỡ |

**US\_ROLE\_06 — Vô hiệu hóa / Kích hoạt lại vai trò**

| ID US | US\_ROLE\_06 |
| :---- | :---- |
| **Tên Story** | Vô hiệu hóa / Kích hoạt lại vai trò |
| **User Story** | Là Admin, tôi muốn vô hiệu hóa một vai trò, để tạm dừng bó quyền mà không mất cấu hình. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Nút Vô hiệu hóa → popup xác nhận có HIỂN THỊ SỐ NGƯỜI DÙNG bị ảnh hưởng (VD: “Vai trò đang gán cho N người dùng; họ sẽ mất bó quyền này ngay lập tức”); vai trò chuyển trạng thái Vô hiệu. |  |
| AC2 | Khi vô hiệu, quyền của vai trò không còn tính vào quyền hiệu lực của mọi người dùng thuộc vai trò (hiệu lực tức thì). |  |
| AC3 | Có thể Kích hoạt lại; khi kích hoạt lại, quyền được khôi phục cho các người dùng. |  |
| AC4 | Ghi Audit Log thao tác vô hiệu hóa / kích hoạt lại. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_42** | Vô hiệu hóa thay vì xóa để giữ cấu hình và lịch sử. |
| **BR\_PQ\_43** | Vô hiệu hóa vai trò còn người dùng là thao tác ảnh hưởng rộng: popup phải nêu rõ số người dùng bị ảnh hưởng trước khi xác nhận. |
| **BR\_PQ\_44** | Ghi Audit Log. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Badge trạng thái** |  | Nhãn | Đang dùng / Vô hiệu |
| **Popup xác nhận** |  | Popup | Xác nhận vô hiệu hóa / kích hoạt lại |
| **Vô hiệu hóa** |  | Button | Chuyển vai trò sang trạng thái Vô hiệu |
| **Kích hoạt lại** |  | Button | Khôi phục vai trò về Đang dùng |
| **Hủy** |  | Button | Đóng popup |

**US\_ROLE\_07 — Xóa vai trò**

| ID US | US\_ROLE\_07 |
| :---- | :---- |
| **Tên Story** | Xóa vai trò |
| **User Story** | Là Admin, tôi muốn xóa vĩnh viễn một vai trò không còn dùng, để dọn dẹp hệ thống một cách an toàn. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Nút Xóa CHỈ khả dụng khi vai trò không còn người dùng nào được gán; còn người dùng → nút Xóa bị vô hiệu kèm tooltip “Còn N người dùng, hãy gỡ hết trước khi xóa”. | NC1: Cố xóa vai trò còn người dùng qua thao tác bất thường → hệ thống chặn. |
| AC2 | Bấm Xóa → popup xác nhận nêu rõ hành động KHÔNG hoàn tác; yêu cầu xác nhận trước khi xóa. |  |
| AC3 | Khi xóa: tự động gỡ vai trò khỏi mọi bộ phận đang chứa; ghi Audit Log snapshot vai trò \+ danh sách quyền trước khi xóa. |  |
| AC4 | Không cho xóa hoặc vô hiệu hóa các vai trò mặc định. Admin được phép sửa danh sách quyền bên trong và gán/gỡ người dùng, nhưng không được đổi tên, xóa hoặc vô hiệu hóa. | NC2: Cố xóa hoặc vô hiệu hóa vai trò mặc định → hệ thống chặn hoàn toàn, báo: "Đây là vai trò mặc định, không thể xóa hoặc vô hiệu hóa." |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_45** | Chỉ xóa vai trò khi không còn người dùng gán; còn người dùng → chỉ vô hiệu hóa. |
| **BR\_PQ\_46** | Xóa cần popup xác nhận (không hoàn tác); ghi Audit Log snapshot vai trò \+ quyền trước khi xóa. |
| **BR\_PQ\_47** | Khi xóa, tự động gỡ vai trò khỏi các bộ phận đang chứa nó (bộ phận chỉ gom nhóm, không cản xóa). |
| **BR\_PQ\_48** | Hệ thống có 9 vai trò mặc định (xem bảng Mục 2). Không thể xóa, không thể vô hiệu hóa, không thể đổi tên. Admin chỉ được phép sửa danh sách quyền và gán/gỡ người dùng. |
| **BR\_PQ\_49** | Vai trò mặc định được seed khi triển khai hệ thống. Hệ thống chặn 3 thao tác: Xóa, Vô hiệu hóa, Đổi tên. Cho phép: sửa danh sách quyền (tích/bỏ tích), sửa Mô tả, gán/gỡ người dùng. |
| **BR\_PQ\_50** | Khi LogXPro phát hành module mới kèm quyền mới, các quyền mới sẽ tự động được thêm vào rổ quyền. Admin tự quyết định tích thêm quyền mới vào vai trò mặc định — hệ thống KHÔNG tự động gán. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Nút Xóa** |  | Button | Vô hiệu khi còn người dùng gán |
| **Popup xác nhận** |  | Popup | Cảnh báo không hoàn tác \+ xác nhận |
| **Dòng cảnh báo** |  | Text | “Hành động này không thể hoàn tác.” |
| **Xóa vai trò** |  | Button | Mở popup xóa (chỉ khi không còn người dùng) |
| **Xác nhận xóa** |  | Button | Xóa vĩnh viễn vai trò \+ ghi log snapshot |
| **Hủy** |  | Button | Đóng popup, không xóa |

*US\_ROLE\_04/05 (thao tác phía Vai trò) và US\_USR\_06 (thao tác phía Người dùng) là hai lối vào cùng quan hệ Người dùng–Vai trò; nghiệp vụ và rule áp dụng như nhau.*

### **5.4. MODULE 4 — Quản lý bộ phận**

**US\_DEPT\_01 — Xem danh sách bộ phận**

| ID US | US\_DEPT\_01 |
| :---- | :---- |
| **Tên Story** | Xem danh sách bộ phận |
| **User Story** | Là Admin, tôi muốn xem danh sách bộ phận, để quản lý cơ cấu tổ chức và các vai trò trong từng bộ phận. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Bảng: Tên bộ phận, Mô tả, Số vai trò, Trạng thái. |  |
| AC2 | Bấm một bộ phận xem chi tiết: danh sách vai trò được gán vào bộ phận. |  |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Ô tìm kiếm** |  | Text | Tìm theo tên bộ phận |
| **(Cột bảng)** |  | — | Tên bộ phận · Mô tả · Số vai trò · Trạng thái |
| **\+ Tạo bộ phận** |  | Button | Mở form tạo bộ phận mới |
| **Xem chi tiết** |  | Button | Xem danh sách vai trò của bộ phận |
| **Sửa** |  | Button | Mở form cập nhật bộ phận |
| **Vô hiệu hóa / Xóa** |  | Button | Vô hiệu hóa hoặc xóa bộ phận |

**US\_DEPT\_02 — Tạo bộ phận**

| ID US | US\_DEPT\_02 |
| :---- | :---- |
| **Tên Story** | Tạo bộ phận |
| **User Story** | Là Admin, tôi muốn tạo bộ phận mới, để phản ánh cơ cấu tổ chức thực tế của công ty. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Form: Tên bộ phận(\*), Mô tả; tên không trùng. | NC1: Bỏ trống hoặc trùng tên → chặn lưu. |
| AC2 | Bộ phận tạo ra KHÔNG mang quyền và KHÔNG sở hữu người dùng. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_51** | Tên bộ phận phải là duy nhất trên toàn hệ thống. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Tên bộ phận** | Có | Text | Duy nhất |
| **Mô tả** |  | Textarea | Mô tả bộ phận |
| **Lưu** |  | Button | Kiểm tra và tạo bộ phận |
| **Hủy** |  | Button | Đóng form, không lưu |

**US\_DEPT\_03 — Gán / gỡ vai trò vào bộ phận**

| ID US | US\_DEPT\_03 |
| :---- | :---- |
| **Tên Story** | Gán / gỡ vai trò vào bộ phận |
| **User Story** | Là Admin, tôi muốn gán hoặc gỡ vai trò vào một bộ phận, để gom nhóm các vai trò theo tổ chức. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Cho phép 1 người thuộc nhiều bộ phận |  |
| AC2 | Một bộ phận gồm nhiều vai trò; một vai trò có thể không thuộc bộ phận nào. |  |
| AC3 | Gán/gỡ vai trò vào bộ phận CHỈ để gom nhóm tổ chức, KHÔNG phát sinh/đổi quyền hiệu lực của người dùng. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_52** | Một vai trò có thể thuộc nhiều bộ phận |
| **BR\_PQ\_53** | Gán/gỡ vai trò vào bộ phận chỉ để gom nhóm tổ chức, không phát sinh/đổi quyền hiệu lực của người dùng. |
| **BR\_PQ\_54** | Ghi Audit Log thao tác gán/gỡ vai trò vào bộ phận. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Ô chọn vai trò** |  | Multi-select (search) | Chọn vai trò đưa vào bộ phận |
| **Danh sách vai trò trong bộ phận** |  | Bảng | Mỗi dòng có nút Gỡ |
| **Thêm vai trò** |  | Button | Đưa vai trò đã chọn vào bộ phận |
| **Gỡ** |  | Button | Gỡ vai trò khỏi bộ phận (không xóa vai trò) |

**US\_DEPT\_04 — Cập nhật / Vô hiệu hóa / Xóa bộ phận**

| ID US | US\_DEPT\_04 |
| :---- | :---- |
| **Tên Story** | Cập nhật / Vô hiệu hóa / Xóa bộ phận |
| **User Story** | Là Admin, tôi muốn cập nhật, vô hiệu hóa hoặc xóa một bộ phận, để giữ cơ cấu tổ chức luôn đúng. |
| **Độ ưu tiên** | Must have |
| **Người phụ trách** | Đặng Thanh Sơn (BA) |

**Acceptance Criteria**

| STT | Tiêu chí chấp nhận (AC) | Điều kiện thất bại (NC) |
| :---- | :---- | :---- |
| AC1 | Cho phép sửa Tên/Mô tả bộ phận (tên kiểm tra trùng). | NC1: Tên mới trùng bộ phận khác → chặn lưu. |
| AC2 | Vô hiệu hóa thay vì xóa; chỉ xóa khi bộ phận không còn vai trò nào. | NC2: Cố xóa bộ phận còn vai trò → chặn, yêu cầu gỡ hết vai trò trước. |
| AC3 | Khi vô hiệu hóa bộ phận, thông tin "Bộ phận" trên hồ sơ của các Người dùng thuộc bộ phận đó sẽ hiển thị thêm nhãn "(Vô hiệu)". (Việc xóa bộ phận đã được định nghĩa ở AC4). |  |
| AC4 | Khi xóa một bộ phận, thông tin "Bộ phận" trên hồ sơ của các Người dùng đang trực thuộc sẽ tự động bị bỏ trống. Quyền của họ (lấy từ Vai trò) KHÔNG bị ảnh hưởng. |  |

**Quy tắc áp dụng (Business Rule)**

| Mã BR | Nội dung |
| :---- | :---- |
| **BR\_PQ\_55** | Vô hiệu hóa thay vì xóa; chỉ xóa bộ phận khi không còn vai trò liên kết. |
| **BR\_PQ\_56** | Xóa/vô hiệu hóa bộ phận KHÔNG xóa các vai trò bên trong (chỉ gỡ nhóm). |
| **BR\_PQ\_57** | Ghi Audit Log thao tác cập nhật/vô hiệu hóa/xóa. |

**Mô tả giao diện**

| Tên trường / Nút | Bắt buộc? | Kiểu | Mô tả |
| :---- | :---- | :---- | :---- |
| **Tên bộ phận** | v | Text | Sửa tên bộ phận (kiểm tra trùng) |
| **Mô tả** |  | Textarea | Sửa mô tả |
| **Popup xác nhận** |  | Popup | Xác nhận vô hiệu hóa / xóa |
| **Lưu thay đổi** |  | Button | Cập nhật thông tin bộ phận |
| **Vô hiệu hóa** |  | Button | Tạm dừng bộ phận |
| **Xóa** |  | Button | Xóa bộ phận (khi không còn vai trò) |
| **Hủy** |  | Button | Đóng, không thao tác |

## 6\. Ghi Audit Log & Tài khoản Admin

* Thời gian: Timestamp chuẩn xác lúc xảy ra hành động (Ví dụ: 30/09/2026 13:30:45).  
* Người thao tác: Tên người dùng của tài khoản đã thực hiện hành động.  
* Loại thao tác: Hành động đã làm (Ví dụ: Tạo người dùng, Cập nhật thông tin, Gán vai trò, Xóa vai trò, Khóa tài khoản, Reset mật khẩu...).  
* Dữ liệu chi tiết (Nội dung thay đổi): Bắt buộc lưu trữ dưới dạng text tuân thủ đúng format chung sau đây: \[Tên button thao tác\] \[Tên đối tượng bị tác động\] Ví dụ minh họa:  
  * \[Lưu\] \[Người dùng Nguyễn Văn A\]  
  * \[Reset mật khẩu\] \[Người dùng Trần Thị B\]  
  * \[Khóa tài khoản\] \[Người dùng Lê Văn C\]  
  * \[Vô hiệu hóa\] \[Vai trò Quản trị hệ thống\]  
  * \[Lưu\] \[Bộ phận Kế Toán\]

## 7\. Danh sách quyền

Sheet phân quyền: [LogXPro\_MVP\_Module list](https://docs.google.com/spreadsheets/d/1Xi164VV0ts00dZs6AHMzPWrJfPI-H8dl_gOkztGZnrU/edit?usp=sharing)  


[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlcAAAGtCAYAAAA72lFmAABnJElEQVR4XuydB5jUxPvHpTdpNhAV7BUVG4oVsaMoViwgFhQLRUUU219EUUQRQQEFC9afYEEUERBBpCNIkXL0fnfAAUoRpDh/3jknJO/s3mayu9lk8/08z+eZZDKT3dvJTb7OYXaffQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeEYAAAAAAADX8CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTsAAAAAAID48CylwTuEjXl5K8WyDWvFk4M/Esu3boAQJvDNMd+L/G2bxLfTJ/FfJ/Afn3+0QGze9K8YOSxPbFj/L4SQOXvmJrF2zS5x160j+a9PJOBZSoN3CAuV29yi3TQghOae1PEh/usVORYv+kts2aLfQCCE7l2Tv4v/amUtPEtp8A5Bht8UIEy1Jc+sLV785D2tPkqe8kIr/quXlfy7W4jc1Tu0GwSEMDXe0mgY/7XLGniW0uAdggif/LNdusHzOq5qYy/d9It1Drf7XPtx+/to9cYrjnbvDRtsHS9f7zTtPNzL27TU6pR0nuc/fEerNzXez3Znp2fE5GXzXbXNdpcVrOG/ilnBP/8I7SaQLR57RFPpzOnu/px57lmttLp40nnV9iUXtpNl+8fe09rF8rtB07Q6u+p98/pExusTq37Viq1aHbf3Wz/GPEes8xVVz4/VPe1B7bjdVSv/1uqyya4vzeC/hqGHZykN3iFIvPvrj9qEHwX5zVztX9/hEbnd+Mm2Vn3O+lxH2wYP3SOubNtSXNPuYS1wUWiwhyCyxhUXOV7Hftxep/ZrXn2J1X7M/FmONl0HfKydh7SHq3il2u7Y/10Zrk64uZG4Yk/Z89sB1rHfVy+RZdser2qvoTyvRVPHuSuce7q1/USfN8XPc37X+tJ2mbqnWNtXtn3A0WbRX2u114mKO3dn1zL/urW7tYk/m1Q3dHt5Vp0HrO2LL3jMCjLHH3WnDFd0/NWXv7LOcedtrzr6P/5IP2tb1VO4ylu93dGOBw3aL1hX+HnT9vqC3eL8c9pYx+n1qf7B+3rGPEesbSpH/5zjaP9al29k+e03U7X3w89BLlqwUWun2qhwZe8/b26Bo83pJ9/nOGerB3uJWTPz5Ha9Mx/WXo9vX9vwOWv7ywGTHG1U32y1T4+5/FcytPAspcE7BIF/du3UJvkoyW/8qlTbjZ/YG65Uu7teek4M/m2c3N73vDO0c5IDxv0cM5Ao1bH96p/jeF17aQ9X/Lg9XNnbqHDFtbdVgZFUK1d0zB6uDrmyvta/zNmnOl6r7Dl1HOcmPx8zQuunSnu7c+6+TWtX6YKzHOePqtt27+S/pqGCT/LZqv1G3futoXL7xGPvsur4DV+tXNlv7KeeeK+1/X6/n8XdzV632kydskJuU7iyn48HBApStP1x/1+0Y3apzh6u+DG+Hev1KFzZj/Htzi8MkOXihX/KkgLeCUffKUYMmy0GfD7BcX4KV/z92s/F99U2hSt7H7V93z3dtT683fPPfKLVRcGww7OUBu+QaXb/+682sUdN+w3+wpbNRdWLzhal655i1VG4ihUSlNTefh77eWs3uU58OWG0dsx+LhWuyrGgQkHjsIYNHH06fdxPhjnVrvKFdbXzqnDVqvsrovrlF4pGj7eyXp+/P9IeruQ597yuOnZei2aOfhSu+DnUnx5LnXWydezQqy62+tnDIz92Wav7HOdHuNpr7qaN/Nc18CxZvE2b1LNZdROvf96jjn3afqRVHy0YJApXVH9a7cKVGtrm4arBnnLliq3WecePXSyPX33F0+KKS56Udddc+Yw85wX12sZ8vwtyNjjeF6lWteztKOS1frCX3L7/njetNm7DFf3pjVbp1LEhg6db2wsXbJRt+MoV3yZ//GGW3M/L3S5uaNRRbicKV3fevnc1kLeLargiwwzPUhq8QyZZtmW9NqHDvdpv+kHQy3vx0ieRVf4Lk+kyHe85zIaBv/7UJ3JoLg8WXHsA4ceCrPo3Y0Fx0oSlWl1UXF8QzpDFs5QG75ApburbRZvEIYTBNMjc2HDvP0qGEIbDnLnhWhnnWUqDd8gEfOKGEAbbafnL+K9xIOATNoQwPIYJnqU0eAe/qdq2iTZxQwjDYZDgEzWEMHxu3sR/s4MJz1IavIOfbPxnqzZZQwjD44qtwQhYfIKGEIZX+tN+0OFZSoN38BM+UUMIw2mm2Lkzu59bBWFUvemaYD/dnWcpDd7BL/jkDCEMr5mCT8gQwuxx61b+Gx8ceJbS4B38gE/MEMLw6zd8IoYQZp9B/RMhz1IavEO62e+RW7VJGUIYfiu3uYX/uqeND/su0CZhCGF2unt38P5PQp6lNHiHdMMnZAhh9ugL/2LVCsKoGTR4ltLgHdLJy0MHapNxPKfkLhZPDf4YBkQ+PumWvz7MnN/MnqyNTzwPe+Iu/mufUp5qN1GbdJXTpmwU/fstgCGQj10q5K8BwykfV+XC+cH6B1g8S2nwDumET8RFOWrpHN4dZBA+Pun2qh7P87cAMsRdH7+pjU9RphM+4dodOTyPNwcBhY9dKuzTczZ/GRAyEn27QpDgWUqDd0gXfccO0ybhokS4ChZ8fNItwlVwMA1X1do15adICYkmXoSr8MDHLhUiXIWfRL/jZFDgWUqDd0gXfAJOZLaFq927d4vLH7xX5BWs44dCAR+fdItwFRxMwxWZDvgky41iuKIvTA4jfOxSYZjDVVjHMdW4CVdkEOBZSoN3SBd88k1k2MJVyTNrJyx5XZjg45NuMx2u7ONlZ+SkibxK0vGdt3mVK0644WpZFvzp/NLSG9q1Fu9/+7WjLlMEIVzN+WOzNsFywxau1A2Vl8SUSfOsOqV9n1i/fpPcPvn4u61+YYGPXSrMVLji42cfx9zV6626eOMYaz9Wvf0csc5H3NHkJbF9+w6tT6zteHXHH9VMlpkA4coDfPJNZBjDVamzThbb//nH2lflr79PdbSLddMOOnx80m2mw9UBF9eTpX0cd+3aZYUr2h806iervWpXpu4p1v6Hg7+R23RdkKrePv4UrugYhasps/9wvN5+F51jtcskXsLVhn9S+49P+eQay7CHq7G/zhIfvlf4TB8VruzHiQULVlp1qv602i2s42GBj10qDFK4+vD9wnFU4cp+nMiZu9yqs9dzYoUge/2YX2bK8oSj77TqVbji521y4wuynP3HEnmsZYtuYseOXbJOtSfDEK7+/jvzAYtnKQ3eIR00ebeLNvkmMozhyn7TpO02XTvL8qpW98dtFxb4+KTbTIcr+zjZSwpXQ8b+Ivp/N0gbb77N62LVlz37VDFm6m/WytUbn/QX03MKb6yl/wtqmcZLuBq/cgE/jWfcTrhhC1fEu72/E1u2bBM7d+69yRHxwpX9pqnKuXOWWcfDAh+7VJipcEV89+0E8e+//4pt2/7ZE16WWmMTL1zFGkeCzmGHt2t+xytSexgiKFw1va2zuLBeG8fK1cUXPGJtj/55utyeMH6Oo686N7ljx85QhCsy0/AspcE7pAM+8boxjOEqUUm+1K+P4+YaFvj4pNtMhyu1clX5grPkn/xqNWwgyp1zmmPliocnxdZt2+SKFD/+3qCvtH6qnQpXb33xqdU+KNeJl3BFpgo+qcYzjOGK32DPq9tKlvHClVq5emdPKOM32DDBxy4VZjJc8XGsfVzhn2rjhSu1cjXgf6OtY7HGMVYAsrdt3vQVWVK4UnUqXN3T/FVHW7Wdl7teq1uxfI2jLlOYhKuNGzIbsHiW0uAd0gGfdN0YtnCV7fDxSbeZDlfpgMIS/Y8NQQlNbslkuDKZbMMYrqIKH7tUmMlwlUouOKe1NIqY/L6TmYRnKQ3eIR3wSdeNCFfBgo9Pus3GcBVWMhmu+GRalAhX4YGPXSrMlnAVZRCuDOGTrhsRroIFH590i3AVHLyGq6F/TOWnMoZPpkWJcBUe+NilQoSr8GMarjL5pc48S2nwDumAT7pupHBFXwQLgyEfn3TLXx9mTq/hKhXwybQoKVzRZAuDLx+7VMhfA4ZTPq6JzBQ8S2nwDqnm5nde0SZdN1K44nUwOl7c/RmtLlkpKPA6mFiv4Yo+72To1X2ONpEWJYUrXgejY4/XZmt1MFwiXBnCJ103IlxFW4Sr4Og1XP29awefCozgk2giEa6iLcJV+PUSrrZvy0zA4llKg3dINae/2FabdN2YreHq4ENqaHVQF+EqOHoNV8msXM2bs0GbRBOJcBVtEa7Cr5dwtSZ/F58+fIFnKQ3eIR3wSdeNbsLVEUcfRT+g2P+A/cUtze4QSzat09qkU3pte+n2mPK5Li9p2+XKl5Plm++/Y/VX5yhRsqR23suuvkqWjW66XmsfZhOFK/oZixUr5tjnbbipDlfnXHCeLN28thtnrFgkS3W+KlWrOMb74faPyu0TTzlZlt/+8pOjPZUjfhuvnTdZvYar3M3Or/QxgZ7AzCfRRLoJV7VqHSE/p5J7fpfOrnuudjyTlihRQpb0/vgxLz79VCdx4okny201L6jtfv0+t9otX/aX1jeMxgtX9PMefHANuT1xwmzt8y1XrrzYd9+Ksp6O8/6Z1D5m/Fg8r732Rq3ObunSZWT53p5rwH5+fo3wfn7oJVyRmWCfRPAOqSadK1f09uued64MV7TNj6dbek3769J2pcqVre2rr7/OOq6CX9unnxA3N7vdakPlQ+3aiiuvvUYs3Vwg65b8tdYRrh57toPcnp23zOpjL//IXeoIV/x9hlE34Ur9rJWrVBY9PuyrteGmOlxx7Z/9vLWrRNX99pPbvy2eZx1XbYoXL+6oq13nVFkeWO0gq82zr7xobc/NX+EIV/e3bSWPUUhQbU45vY72nlKh13CVzMrVqhX/aBNoIt2EK/qsrrn6Butz48eDpP39ffG/78TLL3cXK5b/JSpU2Fdry9srL774cuuYOk6lPVwpe/fur9WFyaLC1d6fvZgoW7as4/gFF1wsrr++iaNdkDzooOryfT39dCf5H5SqfuzYGbKksGR/74nDVWlZjhg+wXFN2M9x+OFHav380Gu4mvPH3oe1+sU+ieAd0gGfdN3oJlwpKVxRST8OP5ZO+est27JeXrjq2OI9Icne5osfv5P7PFxVrFTJsU+lPVzVPOJw8dGggVob+7Y9XL3c8w3H+wqjbsKVfd++ihXPdIQr9T7eG/iZDMd0DdA+hSsql9pWUycvnCNKliolt4dO+EWWFJipPPHk2tb51DkPrVVTLNqYL/p/M1COqT1cqTYXXtrAcR3Y31uq9BquXvzhCz4VuIZPnm50E65mzlgqSwpXVJbaMx68TSalMaTyqisbiWVLN1r1ZcuWs46XKlV4c+SecEJtUaaMMziQw34cJ84998I959sgvhw4VKxetcUKV7Rapl5zfcFurW+YLCpcqW1amXr11Z5i/LhZVt333492tFu5YpN2jkx6dcPG8r0VL753rEi1/emng6x5g/bvv6+1o4261pVlypQRNWocKrdz5uWKrq++ZbVVzpi+RHsffug1XGWCfRLBO6SaS7oVfZOMZ6JwddKppzguBiVvF0Vf7dVDqwubbsIVl7fhpiNcBU03n4OpXsPV1iT+QTufPN2YKFxVrFhJu2ZI3i5bVH9mdGN+3jatLmwWFa64FK54XRSuCZMATaGc16Vbr+GK+vnNPongHdIBn3TdmChcwew2UbjyYhTCVTr0Gq5qdSj8fjUv8MnTjYnCFcxu44UrGB69hivSb3iW0uAdUs3Wf7Zrk64bEa6iLcJVcPQarryuXM2cXqBNnG5EuIq2CFfh12u4Wrd2N59G0g7PUhq8Qzrgk64bEa6iLcJVcPQarpL5B+188nQjwlW0RbgKv17DFek3PEtp8A7pgE+6bkS4irYIV8HRa7jyunLldYJFuIq2CFfh1+vvPuk3PEtp8A6pJp2PYoDZK8JVcPQarrByBf0U4Sr8IlwZwiddNyJcRVuEq+DoNVxh5Qr6KcJV+PX6u0/6Dc9SGrxDqsnWlat7H37AkvZz1hU+18hujw8KH2x57c03WHX0VHneTp1jTv5yWc7OKyypvs2Tj8tten5SdfbVOU+91FGWX4/80Wr/wKNttPOH0aCHKz7+XlX9721VWNLDQVV9pze6yu1hk8bK/z2ctulZWVQu+avw+VlW/z3lMy930s6fCr2GK6xcxfaBB9pKu3Xr7fp/jf9hyBitjq4J+37lylUc+/QaqlTbqp/9dadNXSjLdu2ekeWDDz5itTd5nEOmDVO4so8HOfKnyfKJ6bxdUU6aqH+xOT8v135NUNmnz0fW/rvvfiK36X3Ee5bac8+9bLXv3v0d7XiyIlwZwiddNwY9XJH08VFJD7Csc+YZcn/8vJnW8Rtvv1VMWlD4dQskPVR0wfo8xzmq7r+f9cBJakOTWZWqVbXXsjt1aY70+NoniYOqVxMNrrxca6PeWyo999X2Wl2qPbh9M1kGPVyR7Ts+K0t62jpdA/SZ33BbE+t49RoHiwsaXCyuaHS13M9Zt1rMWbNCjJ39u9y3j1H/bwaIn36bYIX097/8XHs98rMhg+TYL9yYLxZu2Hst3f1QS1nS9UUPxuT9ktFruMLKVWKPPvo4ceMNt8proXz5Co5jDRteJ+bMXimPdenSQ9bRs4e++vJH8fDD7cQX//veCljr1u6U5Ykn1BYF6wq3Vb1qo+Yh+2vkzMsTH3/8tdzOz9sufhoxUV7Pqr29bVCdMLbw/y6NF67sP8e4sTPF66/3dhy3P0TUr59ZvY564npe7t+Orz+qd875cvurL4fJ8uyzz5P1v4yeJi5pcIWsGzhw6J6x3iXOrXeBWLhgjTUHUUnXDs0Ds/9YYQVp/rMdd9yJVqCOJ10fJG137vyGGDp0rNweP37vQ1ibNb1X6+dVr7/7pN/skwjeIdVk68oVSR8flW06tJeqfSX9sqh2zVu2ECVLlZT79PU2qs1Lb74my7l7brpUVq9RQxx86CHaayk7dXvV2qZwRUEsVvvDatXU6pLxuR8+E8c+11KWXqVww+vsXv32C3tu5D3kdpjCVbzxJ+11tK3a2o+V+u+p/sWKF7PGMla4ovZDJ4yR2xSuaF+1V+FqfsHqmO8jGb2GK6xcJbb9489Jacym/rZAO37LzU3lMRWuVq7YLMOVOv7B+1/I8sf/HvhIYY3aP/P0i+KQQw6T2yQds2+3bfOEdY7vvxstpv++2GoflHA1b84WebP99MNFcX2i7UTRr1eO3C4qXPXs+b7cplU5/nNlKlyNHvWbtf/Qg486xonKNfn/yGvjlZe7ize7v6u9NwpXrVu3l0/mf/PNvla4UsfVtw/8NGKSLKtXP1iW/T/8Upb0nYo05vZz2j300JqOfTqfam8PV/x9JSPClSF80nVjGMJVKixfvrxWlwrpuwp5XbJe0yu5Pzu5CTcDZ02QZRjCVbJ+OWKIVhdEvYYrrFxBU2nsx/6y1rHP28QzXrgKm3Rb5nWpsE6dM7W6oGky3ly/4VlKg3dINdm8cgXNNAk3UQhXYdFruPK6crUm/29t4nQjwlU4/eqLZeL+O3/R6kmTm222hKsoazLeXL/hWUqDd0gHfNJ1I8JV9mkSbhCugqPXcOV15YrgE6cbEa7CpZsbqZs2SoSr8Gsy3ly/4VlKg3dINVi5gkqTcINwFRy9hiuvK1effjhfmzjdiHAVbBfkbBXv9cnR6ovS5GaLcBV+Tcab6zc8S2nwDumAT7pupHDV5L2uMCDy8fGiSbg5pP2d2ntIVnp9XgcT6zVcjVk0m08FruETpxspXHXpNB0GTLph8jo+dvE0udnefdvP2uvAcGky3ly/4VlKg3dINVi5gkqTcIWVq+DoNVx5XbnyOsFi5SoYfv7xYs9jyDU5D1auwq/JeHP9hmcpDd4hHfBJ140IV9mnSbhBuAqOXsNVsw+68anANXzidCPCVWalG2N+7t5nbKVCk5stwlX4NRlvrt/wLKXBO6QarFxBpUm4QbgKjl7D1SFPNOfTgSu8TrAIV/66cvk/nsfKrSbnR7gKvybjzfUbnqU0eId0wCddN4Y9XJX+78GQ9BHzY6rusWc7WHX04L547Q8/6kgxaf4fcjvW073Dokm4SRSu6Oe3fwb0AD3ehmvy+m6kJ+5TSe/jq5+GinFzpmttFm3Mt7bVw0L37pcS+x2wv7VfqXIlWU5fvlCWZcqWtY59MXSwdm76BoBvRg2z9umJ8LxNKvQarrz+WZDgE6cbsy1c0XVFZdmy5cTkyfPkgyTVsTX527X2dpcu3Whtq6e3/zrG+W+dJk+aq/Vz422NR2h1XnzgLv0rfbgmN1u34UrNHWq/Tp0ztDZh8LJLr9Lqxo/b+3BPPt5K+89/7z0PWduqVNdFN/Ykez80GW+u31B+KhLeIR3wSdeNYQ9X6mZP3wmo6g486CBZ0sf+6x/THO2nLc2xjlFZuUoVqTzH5gLrK3JUuAqjJuHGTbhSIUR9Zok0eX03qtelkr+HA6tVk+UDj7a2jtuvBWVZW4C6udnt1s/1xAuFT+0eOrHwiez211SvddyJJ1jbqj0/fyr0Gq68PorB6wSbbeFKSdcIja29ToUrXq+kcFWlSlVpvHax6uLZu8dccdM1hV/FkipvbpT4fCbXgkm4Wrig8EGlhx1WSzseBPnY0P5bPd9z1FG46tXrQ7F8+V9We3u4olDOz0vStaPaFxWulKefdpZ2jnRpMt5cv9knEbxDqtm8fZs26boxG8IVX01RX8pLH/txJ57oODZu7gzrGD8XBTG1SoJwVSj/nPh+LE1e360lSpaQr33NjY0d3/WnpJUrOk7GWtki6diIKeOtfRUa2z9f+PU65O333KX1405bOl+rS4VewxVWrpKXrg0KV+o76JT0PYDqOO9D2leu1ArGk088r52b97NLN7qCde6+WNqLmQxX9v02rdtrbTItf48lSpS0vpZIecklV4rXX+slliwusNrbw5W9vf0LuOkrlFR7KufnFP7eqDoVrm6//W5Z1q9/qeN106nJeHP9Zp9E8A7pgE+6bgx7uDK1UuXKWl1R0tDxuqBrEm4ShasjjjpSk7fhmry+H4ZlDL2GK6xc+av6859b83K3aXVku1YTtLpMaXItuA1XRx55jCZvk2lLliyp1bn1oIOqSe11uav3fusBBTXeJyiajDfXb3iW0uAdUs3F3Z7WJl03Ri1cRUGTcJMoXHnR5PXhXr2GK6xchcNkbmjp1uS9uQ1XMLiajDfXb3iW0uAd0gGfdN2IcJV9moQbhKvg6DVcYeUquE4cV+D5c/ZTk/eIcBV+Tcab6zc8S2nwDqkGj2KASpNwg3AVHL2GK6xcBc9kbl6Z0OT9IlyFX5Px5voNz1IavEM64JOuGxGusk+TcINwFRy9hiusXGXevNyd4t47Rmn1YdHkWkC4Cr8m4831G56lNHiHVIOVK6g0CTcIV8HRa7jCylXmTOYmFSRNfg6Eq/BrMt5cv+FZSoN3SAd80nUjwlX2aRJuEK6Co9dwhZUr//xt0gbR7KaRWn3YNbkWEK7Cr8l4c/2GZykN3iHVYOUKKk3CDcJVcPQarryuXC2c/6c2cboxiuHK7c1o3dodWl0YdPvzkQhX4ddkvLl+w7OUBu+QDvik68awhCt6OBuVPT7oKw6tVdN6dtEhNQ+Tpdonm9x5h5iTv0Ju1znzdDF54Rx5nB4QqNrZ29N2ufLlYj4Pieo+/f4b8cl3X4unX+ro6BurfRA0CTdhD1fv/u9jWdJYlC5T2hqTrr17ym2y2sHVtX5kl7e7O/aPP8n5wFm/9Rqutuz8h08FrvA6wYY9XNE10aDB5bLk9VTSw0RLl64ozjvrRfH7tIXiiCOOkvVr1vzj6KOuL75tf9YRec4551vbj7R90nEsKJpcC2EMV4VjfoUs585ZJceY6itWrKSNoyq/+cb59UMlS5ZytHnpxW6y/OKL77XXogeEUvnuO59Y9StXbHK0U3XqPNN/XyTLhx581Dp+7LEniBc7va71S1aT8eb6zT6J4B1STbavXKlw1W/AZ9Yvg/34wBFDrG0KV/Zjqj3vN3dNYQCrsG8FGa74a6q+FK5GTpuohatDa9bU2gdBk3AT9nBFX13Ex9Wu/Vj3fn0cx3i4Ut87aXfc3NhPe0+HXsOV15Wrp9tN1CZON2ZDuHrwwUe0hzxSPd10Vq/aYu1TuCpfvoKoVq26dS2df95F8vjJJ9eR+7Td6+0PrW2Sns6ttoP48Eyuyc02jOGKrH/RpdYYUZkzL1duqweJqvFV7f+YtcLRXx374P0vHPs8XK3472tySHu4iiV/zYEDh4r772uttUu1JuPN9Zt9EsE7pAM+6boxbOHq/a/+Jy/G5197xXEzHDNrqizf/uh9cUsR4cr+VTkqXFF9onCltmOVQdMk3IQ9XJEUfNX4HlS98LsGSfpam+GTx1rXDpfClf3aoLpjjj9Oa+eXXsNV33HD+VTgGj5xujEbwhX5ySeD5P7on/JFt1dmyq80+XbQSMc1QeGK2nTo0FE89NCjYviw8dp5aB6ikm6qtza503pq95FHHm19nY5qO+rn37T3EwRNbrZhDFeXXdZQVK26nxwD2u/X73PRtevbcluFq7VrdlhfYXT44UeKmjUPt/r/MGSM+GX0NDFj+hJ5jOpatHhYljxcKe3XEUnXwl13tdTakQXrdsmSriUeriaM/0Nrn6wm4831m30SwTukmmxfucqEz77yklYXBk3CTTaEq2zRa7jyunLldYINe7gi6WdfsazwewOh2c02jOHqkgZXaHWpcOmSDVpdGDQZb67f8CylwTukAz7puhHhKvs0CTcIV8HRa7g6+5V2fCpwDZ843RjWcPVKx+ni4Xt/1eqh2c02jOEKOjUZb67f8CylwTukGqxcQaVJuEG4Co5ewxV9r6gXvE6wYQpXXn/GqGnyOSFchV+T8eb6Dc9SGrxDOuCTrhsRrrJPk3CDcBUcvYYrr38WJPjE6cagh6sfBq8SvXvM1ephfE1utghX4ddkvLl+w7OUBu+QDvikC6Mpwk20xKMYCvX680B8dtC9fsOzlAbvkGq+nT5Rm3RhNEW4ipZRXbnq/uof4sG7x2j10FyEK+hWv+FZSoN3SAd80oXRFOEqWkZt5crr+4bxxWcK3eo3PEtp8A6pxus/aIfZJ8JVtAziytUhNQ6VHnpoTbn//P+9orVx68zf/xIfvrtAq0+Huau3anV2aSrndco772whywoV9rXqFsxfY21fffX1RfbPpAhX0K1+w7OUBu+QDvikC6MpwlW0DOLK1Q8/FP65jh6K2O313tpxN3p9f0U59IfCRzHQlJyft83xUNCvvhomfpsyX5QuXdp6cCN9VYq9P/VbuGCt9XBRe32icMXb87pMmo7PGmanfuNMUjHgHVINVq6gEuEqWgZx5coerkaPcvdU8i6dpvtykx89eqosjzrK+bU09JU4tHJF0zXtn3VWPa2vOkZ2fbXwCd9kmTJlxcwZS7U2V111raP/urU7tTZB0I/PHWaHfuNMUjHgHdIBn3RhNEW4ipZBXLkykd5Hfl5h6AiTNK2r7Tat22vHi/Ljj77W6jKp12sBRk+/4VlKg3dINVi5gkqEq2jpdeVq06Yd2sTpxlSEqzb3jxWf9V+k1cPMiHAF3eo3PEtp8A7pgE+6MJoiXEXLsKxceX09mH4xNtCtfsOzlAbvkGqwcgWVCFfR0uvK1eiRzn+s7VaTcNXz9dli7uzNWj0MlghX0K1+w7OUBu+QDvikC6MpwlW0zMTK1QtPT40rnZfXwczIxy6eXq8FGD39hmcpDd4h1WDlCioRrqKl15UrrzfUWCtXzW4eKdq2HKfVw3Do9VqA0dNveJbS4B3SAZ90YTRFuIqWXleunmgzQZs43ajCFW7I2SPGErrVb3iW0uAdUg1WrqAS4Spa+rly9f47843+3ATDoZdrAUZTv+FZSoN3SAd80oXRFOEqWlZteyufClzDJ8542m++sf4sGCab3NJUqzv44BpaHUlTN68jC9Y5n8tF7ext4/VT9fZy2dKN1vakiXO0Pn6IcAXd6jd7U1QceIdUg5WrvVK4iHLAiPLPHkXv//RtPh24oqgbasvmv4gOj07S6smgh6tixYrJkqbdP2YtF7//vsgKMw0aXG6FK6qvWLGSWLH8L1G16n6Oc9BX3Lz5Zl+rn3qyulKFq0qVqoheb39ohSv1tTkkPbXd3ufnkZPlV+6o96bqKVwdXutIR1u/LepagNCu39hzVEx4h3TAJ10YTRGuoqXXPwsSfOJ0c5MNerii6faAAw7UVpLycreJyy9vKG5tcqdVP+CLIeKM0+vGXGl6s/u7MetJ+8pV9eo1rHC1ds2OPcd2xeyn6s46s57crlXrCLmvVq4yqZtxh5D0G5Wh4sI7pBqvK1ejls4RxzxzPwyBfOziiXAVLacsX8inA1fQDfWHwatE8yY/axNoUQY9XIXZkiVLanV+iHAF3eo3PEtp8A6ppvX/3tEmXTdSuALhgI9dPBGuoqWXlSu6mRJ84nQjwlX2iXAF3eo3PEtp8A7pgE+6bkS4Cg987OKJcBUt3T6KoX2b8eKxh8dZ+15vqAhX2afXawFGT7/hWUqDd0g1yfxZEIQDPnbxRLiKlkWtXKkVqnjwidONCFfZJ8IVdKvf8CylwTukAz7pujGo4erSlveIkmfWFqXrniL3aZvc97wzrO3HunWxjtnLS1reLf7avFnud+j5hnXsgPr1tPa8ryqDCB+7eCJcRUu+cjVy2EoxfOgKR10scEOFSlwL0K1+w7OUBu+QarJt5YrCFWEPPQN/GqbVERe1aCbLn6dMkiWFKzo2a+F8uV/x/DPFuXfdLrcJe6jasXOn+G7MaLmvgltQ4WMXT4SraEnjnWiFKh584oTRFOEKutVveJbS4B3SAZ903RjkcHXhvU3FiInj5b499ND26rVrHOHq8x+HOMKVvS3ftoerf3bsEONm/C73q150NsIVDI2dXpwsOneeoq1cuQU3VKjEtQDd6jc8S2nwDqkmW1euFCoQ2YORPVzRtj1cUWiiujpNrnf0t/ejsoztz472MojwsYsnwlX2SjdBXlfUv7lKBJ84YTRFuIJu9RuepTR4h3TAJ103BjVcAR0+dvFEuMou/zcoRwz4LkerV2LlCiYrrgXoVr/hWUqDd0g12bZyBXT42MUT4So7jLVKFUuvK1e93tz7VS0w2iJcQbf6Dc9SGrxDOuCTrhsRrsIDH7t4IlyF0w5PjBf33TVKq0+k15Wr5reM1CZOGE0RrqBb/YZnKQ3eIdUks3LF62C4RbgKl25XqOLpdeUKN1SoxLUA3eo3PEtp8A7pgE+6bkS4yj4RroLtVz/MF737ztTqvep15erNrjO0iRNGU4Qr6Fa/4VlKg3dINVi5gkqEq2Ca7ApVPE/4vwf4dOAK3FChEtcCdKvf8CylwTukAz7puhHhKvtEuAqOzz07UUzOWa3Vp1KvfxYk+MQJoynCFXSr3/AspcE7pJp0r1zRj7D/AfvLkh9LhyVLlhRTl+TI11u2Zb0oX6GC6DfgU3mM6tT7oPKFbq+Ka2683to/8thjxOFHHSlubna7qLJfVTF2znRx8RWXirsevN/Rz17G2l66uUA0bXG33B80erh1rEXrB2U5ffkC7Ty9P/lAls93fdlqX7ZsWWvbDxGuMmu6Vqji+fpPg/h04ArcUKES1wJ0q99QfioS3iHVLFyTq026bnQTrujtU1jxO1zRa1HAoXDVsPG1WpAh99t/Pxm8zjn/PEd/akPhSrXd/4ADxIL1eXKf/wz3PNzSek0q+38zQNx5/72y3VF7ghrVffHjYDFv7Sq5/fHgrxyvo0rVfvFfa8VTnTuKnHWF7f0W4cp/72s+Snw5ZL5W74dYuYLJinAF3eo3MkAVBe+QatK9ckUeUvMwWZavUF47lmorVq5kbVO4KlW6lKhx2KFynz7O4sWLy+2SpUrJAHbRZZc4+tN7vKPF3eKkU08WCzfkiac7vyBG/Dbeeu9lbKtJDzzaWpbFihVz7NvPNXjMT3K7ecsWhW3/e311PvtnQtsvdu8qt2nlrHTp0o7zpVuEK3/0e4Uqnhu3b+XTgStwQ4VKXAvQrX7Ds5QG75Bq/AhXQZE+Tl4H94pwlT6ffWaiWFCwTqvPpFi5gsmKcAXd6jc8S2nwDqkmSuEKFi3CVepctLEgMCtU8fT6KAbcUKES1wJ0q9/wLKXBO6QahCuoRLhKXrrZ9Og1XasPoli5gsmKcAXd6jc8S2nwDumAT7puRLjKPhGuvLlsS3D+HZWJWLmCyYprAbrVb3iW0uAdUg1WrqAS4cq9/frPEjNX5Gv1YRIrVzBZEa6gW/2GZykN3iEd8EnXjQhX2SfCVdGGdYUqnli5gsmKawG61W94ltLgHVINVq6gEuFK94F7R4uXu/ym1WeDWLmCyYpwBd3qNzxLafAO6YBPum4MargqUbKkOOCgA+U2fXz8eDIWdb4ZKxc5HgxKZfuOz8qyxqGHOI4dWO0grT954aUNtPZ+inC112xaoYonVq5gsuJagG71G1uMig3vkGqybeXq+NonyvKAAwsDlrJMmTKypI/00++/Fl+O+ME69vRLHeOGmW9GFX59zd0PtbTaqK/Xsbfr8cG7jn063qR5M7l93EknaO1VG1VPZY8P+mrtP/9hkNYvXUY5XL39zgwx8LvMPCk9U2LlCiYrwhV0q9+oDBUX3iEd8EnXjUEPV41uvsFRr552Tk9oHzNrqri/bSvHcfqo+bnI6jUOto6rNvPWrtTa9/n0Q1l2fL2Ldg67A4cP0epIelo8ryPf/fxjrS5dRjFcRWGFKp5eV65a3/erNnHCaIpwBd3qN84kFQPeIdVk28pVIun7BHldKqSh4nVhMyrh6s5bfxILN8QOs1HS68oVbqhQiWsButVveJbS4B3SAZ903RjWcAXjm83hKsorVPH0unI1YugKbeKE0RThCrrVb3iW0uAdUk3UVq5gfLMtXNHEP2T0Yq0eFnptrxf5dOAK3FChEtcCdKvf8CylwTukAz7puhHhKvvMhnCFFSr3el25IvjECaMpwhV0q9/wLKXBO6SaZFauTunUCoZAPnbxDGu4+r//myTm5q/V6mHRDp41hU8HrvB6Qx05PE+0ajEGhkA+dvE0uRZaNh+tvQ4MlybjzfUbnqU0eIdU886Yodqk60asXGWfYQpXM5blYZUqSb3+g3aCT5xupHAFwgEfu3ia3Gz79JzNXwaEDJPx5voNz1IavEOqSWblitfBcBv0cNXslp/EqN+WafXQm17/LOh1gkW4Cg987OJpci0gXIUfk/Hm+g3PUhq8Q6pBuILKoIYrrFClR6xcuefYI5qK/Lz1vDouJxzdnFeFCj528TS52SJchR+T8eb6Dc9SGrxDqrm+d2dt0nVjtoWr+9s+LMtqBxc+NPTlnt2sY4s25ovxc2dofZSL/8qOf+8TlHB1/12jxPx167R6mFqxchUfClPkuWc9LPq8PdjaV3z37XhH3aZNW61+9jJeXdDhYxdPk2shW8IVH0/7daC2yeXL12jXTdgxGW+u3/AspcE7pBqsXBV63EkniuGTx4rKVaqIx559SjtOVqpSWasjKVx17tFNSvs0bLzNrXcVfhVOkM10uMIKlb9i5So+I4b9Jt5682txxSXtHTfH445sJksKVwSFL+Kupl1Ei7u6ajdZ4tqGT4vrGz0bqpssH7t4mtxsszlc2Y/17fO96P/BMBmuiL//3m4dDzsm4831G56lNHiHdMAnXTdmW7gib7z9Vhmu6GMvUaKEVf/el5+LsuXKiZaPtNb6kBSuqA9ZrFgxWUfb9jbLtqzX+gVNv8PVTdcME5PnrdLqoT9i5Sox9pBEq1Pdug6Q2ypcKewrVw+06KaFq5yclQhXWRquFJ98NMJRp8LVksW5Vl3YMRlvrt84k1QMeIdUg5UrqPQrXGGFKhhi5So+9nAUa7+ocKXabd++Q9ze5CUZrtSxsMDHLp4mN9tsCVcEjeXpJ99nbdsDl1KFq2zCZLy5fsOzlAbvkA74pOtGhKvsM53h6oEWo8X0ZXlaPcycWLlKH3fe1plXhQo+dvE0uRayKVxFFZPx5voNz1IavEOqwcoVVKYyXC3bghWqoIuVKxAPPnbxNLnZIlyFH5Px5voNz1IavEM64JOuGxGuss9UhKtbGg0TA7/L0eph8PS6ckVjzCdONyJchQc+dvE0udkiXIUfk/Hm+g3PUhq8Q6rByhVUeg1XtzYertXB4JuJlSteB8Otyc22x2uztbpkNXl9mLzJfN5+w7OUBu+QDvik60aEq+zTJFy1aD5KzFuTHc/3iqpeV66eeXySNnG6EeEq+zS52SJchd9kPm+/4VlKg3dINVi5gsqiwtWiDQX4N1RZJlauYLKa3GwRrsJvMp+33/AspcE7pAM+6boxzOGKPlYq6aGh/NhNd9xqbbd58nHHsZx1q8RZ9c6R28WLF5elen4VnfOscwuP0bZ6De7iPwtXe+h4zSMO145n0ljhin6ZPvh0tlYPw6/XlatVK7doE6cbwxqu6HfVXpYvX8E6NnbsDGu7TJmyWt/GjW+xtidNnKsdL+xXxvEa8bZXr9qq9c20JjfbbAxXuasLx4TGp++7n4r5OflaGy+uXlX4O5aX+7fjOsi0yXzefrNPIniHVOPHylW58uXjhg0/Ve+BylHTJ2vv6fpbb5ZWrFTJ0V75YveuomTJko7z2dskelBo2bJltXP64Vtjf3C16qTC1aR5q8RNVyduD8Pt419/wKcDV3idYN2Eq5kzlsrfEfo9o5Ifz4QdOnSU5R+zlsvS/r4GffOTtU//waXqO3d+Q9Q4+BAZrtRxVVII4z+bvU2sbTIvd5ujTxA0uRYShSv1sxas2ynL8867SGvDNXn9dFj4nndbY8XHdc7slbIuP2+b+PCDgXK7b9/PtGuCaw9X+uvp7f0ymc/bb/ZJBO+QDvik60bTcKUCS6Ztdt891i+BvX7CvJmypJWrWMdj+UznTlK1P3lh0Z8Jb6+csWKRVpdq6Zci1soUjK5eV64IPnG60W24ojJI4apdu2fE6afXtfbXrtlhbY8fN0uW6r0ecMBBsnyi/XPik0++caxcjfp5irjttuay7euv93K8huqv5h6+Tf4yepqjTxA0udm6DVfx9mNp8vrpUoXlCy64WCxeVOA4NntPuKKSvvGjTev2cpvClToe72dcsmS9LBGuvLNPIniHVOPHylX9yy+VZb0Lz9eO+W2jm66X7+PLET+IJzo+6zhG9R06/Z/1Pun7Bu3H1Z/9VDt+buVRxx4jmjRv6qgbMOx7rZ1fUqhys3IFo+W8tav4dOAKrxOsm3CVM6+wzUUXXSrL88+/WGvjtz17vieee7aztb//fgeIY445Xm7PnbNK1K59qtyuUGFfq03r1o/LlaYOHV6w6ipWrCRq1TpC/kyfffqt9jpVqlS1tsuWLSdL9fMH4XOIpcm1kChc8Z9xypQcrQ3X5PXTKb33mjUPd9RVr36wWLhgrTjllNPkPgUlGv9vB4202hx11DGypPpmTe+V2/XrXyoWzF8jt/PztstzP/bY03K/WLG9q6OZMJnP2294ltLgHdIBn3TdaBKuIITBc9jc3/lU4Bo+cbrRTbiC4dLkZpsoXHnR5PVh8ibzefsNz1IavEOq8WPlCkIYPL3+WdDrBItwlX2aXAsIV+E3mc/bb3iW0uAdUg3CFYTRFI9igMlqcrNFuAq/yXzefsOzlAbvkGp6jR6iTbpupHBFkzMMvnzsICQzsXJFfWHw5WMXT9O2MPzycXWr3/AspcE7pBqsXEEYTSl4e4VPnG7EylX2aXKzxcpV+E3m8/YbnqU0eId0wCddNyJcQRhuM7FyxetguDW5FhCuwm8yn7ff8CylwTukGqxcQRhNsXIFk9XkZotwFX6T+bz9hmcpDd4hHfBJ141uwpV6aCY9RJQfS6WHHHaoLDt1e1U7xr3n4Qcc+ws35mtt4jl8yjitbsi4UVodt9GN18uShlOVd9x7l7Wt6ju90VWW+1asqLVfsmmddl4IkxErV7r0jCEq6WGQS5ds0I4rc1f/bT2Tyy79rqrtdWsLnzSeyEce6eDo26LFw9bT3qnuuONOkNulS5eW5cQJhSFFta9Z8wjtGUvJSmN8c6NhWj3X5FoIa7hSn7N9bJP1hhuaWNvqvG++2VeW5cqVt8Z6xvSl4pxzzne06/Bkx/+OLZHlqaeeLh599CntNdJhMp+331B+KhLeIdWkc+Xq/Ab1pRSu5q5ZqR1PlSpcFS9RQjt2YLWDxNLNBXL7ultutMLVTXfcJkt7uFKBp0XrhxznoGGgksLVQ48/atXT193MW1v49QaqzegZU2RZrFgx8XLPbtp5qh1cXcxctcRqr+rt5+Dt6at67PUQpkKsXOmqcEXS73CVKvtpba68spGoW/dcrV79Dr/cuXvMY/ayS5ce1ra9TfXqNeS2/YGkFK7UuVWd+s451T4d3nT1MPHCM1O1ersmN9swhyul/Yn73Bo1DrW2Z8xYIkt6mv+TTzyvjTV9P2XFfSvKbQrx9H2dFK5oPOvUOdPxVUoUrvj4T5o4R4Yraq++FcAPk/m8/WafRPAO6YBPum50E66UFK5+GD9aq0+VFK7oo+L1JIWr+etz5fYd99xlhavBY0bK0h6u3v74fVkWFa7sr0OhjQIW1al69XN+PmTQnp+7nFX/2LNPWdtU1jj0ELlNE7iqp5Ur9d2FB1ar5mhvfz8QpkKvK1ct7hilTZxuDFu4euqpTjHDFa0sdXrhNa1ezQPffD1c+148qufl8GETxIcfDHD0pe2ePd5ztLOvXM2ds1prf3LtOtp7SYX0/aJjfi58Ung8TW62YQ5Xqvx55JSYx0h7uPr6q+GypBBMX7htb6ekp/7nzMu1zqNWrqpUrmK1L1i3y7FyRd9RqLbVytX1RQS+VJvM5+03+ySCd0g16Vy5orfP5W3C4KQFs7U6vz3ymKO1OgiTEStXyfnd4FFand26detpdemS5lZe54cmN9uwhituUX8uzpQlS5bS6tJhMp+339hzVEx4h3TAJ103uglXEMLg6nXl6sN352kTpxuzLVxBs5tttoSrKJvM5+03PEtp8A6pJp0rVxDC4Op15Wr3bn3idCPCVfZpcrNFuAq/yXzefsOzlAbvkA74pOtGhCsIw63XlSuCT5xuRLjKPk1utghX4TeZz9tveJbS4B1STTIrV/VefRyGQD52EJJ9xw3n04ErvE6wFK4ee3g8DIF87OJpci20avGr9jrJSq/P62D6NBlvrt/wLKXBO6QDPum6EStXEIbbrbt28KnANXzidCNWrrJPk5stVq7CbzKft9/wLKXBO6SaZFaueB2EMDx6DVdeJ1iEq+zT5FpAuAq/yXzefsOzlAbvkA74pOvGMIWrP3KXWtsTc2Zpx71oPye5YH2eVb/ozzVW/fdjf47ZTz1UlfZVXwj99K3RQ/hU4Bo+cbox7OHK5H/Bp+cT8Tq7dC77+UaMmGhtT526QCxauE7rE0RNbrZRClf2sf1j1nJre/myP61j/BoY88vvjnOsyd/uOJe9/ew/Vjra+mUyn7ff8CylwTukmqitXNW78HzHfoMrL7eegN6l15uy/GrkUHHj7beKRRvzRcfXusi6T777ynrSOw3LA4+2kdv0JF1qR3X8tW5qWvgU+DPrnW3VqXYl/nua/K+zf9eOQeiHWLkyc9nSjbJ8revbjvqOz3eRJT2Ne+yvM+TvMYWrJYvXW23uuftBa5uOk3z7lluaOs6rHipJ7rff/o5jQdHkWsimcEVfbbS+YLd4p89HYsb0xbLu998XidzVW+W2GlOlPWz/8MOvjjZDvh8t7we0Xa5cOatdn94fyfLeex5ytOfn9tNkPm+/kQGqKHiHdMAnXTeGMVzRx0nlb4vnWXXX3nyDI9TYt7//tXDVSdWNmzNdlsedeIIs5+Qvl6tUdNzej3tFo6sd57e3t4erDi8+r/WFMF2e2qk1nwpcwydON4Y9XNHvLK0oUWmvL1asuMjL3Safxq3a/T5toTj77POs3/WKFSuJ+vUvk8dPPvk06xwTxs+2tvPzClcqlBdeeIn2HoIm3WzvvHmkK7MlXJUoUVKOp328ihcvIcex6R337AnZ/1hj2qpVu/+OF7fq7PcA2j/xxJOt7Vdffcs6pwpXvD2//vzUZLwL1u129PWbfRLBO6SanDxv3/kXpnBFH2PFSpXk9n77768d69qnp6h7Xj25/+sf02Qdbatw9b+hg2Xd+LkzrD72Mp60Ksbb2PcXrM+1wtWCDXny6y34OSBMl1i5MpN+d0uVKiXKly/vqD/22OPld8Wpr7IiKVzRMfqS5SlTckTZsntXJFQbslKlylad+kJedcy+3f2Nd7T3EwRNroVsCVfHH3+iHGsermj1adCgnxzhyu7KFZvEtY1ulNvfDhpptfnuu1GypP05s/f+uY/C1ZvdC1cv6Wtv7NcEP7dfmnzekQ9XUfuzoBevatxI/jLxegjDrNeHiBJ8InVj2MNVJrX/iTFImtxssyVcmfr6a720umSl+xGv80OTzzvy4Yrgk64boxSuIMxGsXIFk9XkWohquMomTT7vyIcrrFxBGE2xcgWT1eRmi3AVfk0+78iHK4JPum6kcDV59WIYAvnYQUhmYuVq0YK/YQjkYxdPk2vhxWenaa+TrPT6vA6mT5Pxjny4wsoVhNEUK1cwWU1utli5Cr8mn3fkwxXBJ103IlxBGG4zsXLF62C4NbkWEK7Cr8nnHflwhZUrCKMpVq5gsprcbBGuwq/J5x35cEXwSdeNYQlXM1fu/TdH9HHy4/EsX6G8Vme3ZMmS1vn4eWn/oOrVrW1+nEvHy5Uv+vUgTLVeV64mT8jXJlI3hj1c0YNCed3BB9fQ6kh6ppHapq8/UfNAwbqdjnaqnvxy4FDx3nv/k9v2Y7R9xeXXWHVUHnRQdfnEeNrPmZcrypQpq70HPzS52WZLuCpduox48IFHtHq7NP5z56zS6mN5dt1z5dfi0PZnn30rcv97GC091Z3G96GHHpX78j5Rrpz2zDN6WrzapjaNG9+S8OuXvGryeUc+XGX7ytX5DeqLi6+4zNqnj5T8I3eZVTdg2PfWMfoqnLZPtbeOPfpsB1Ht4OryGD2R3X7uGSy41a5zirV/4x23OtqS9D7Ue6H26itwyKdeekGW8wtWa/0gTIdeV642bnA+SdytQQ9X9Dt52mlnWQFG1TVreq/4+ecposl/X09DX3Pz/fejRZUqVR1tSbqp2Z+6Tl+R4jxeeCNUx9V89MzTL1r79pulkr5mxd5v5YrN1tfx8PfgpyY32zCFK/pMH32kgxg44IeYxyhcqc89XhserqynuO+5nnh7+o91td3wqutkqQIS9bF/ByGFq8suu0pK+7VqHSHmzV1tHbd/hU6qNfm8Ix+uCD7pujEs4cq+crVwQ568UG+4rYmjzcPtH5XlJ4O/kiW1sR+n/Wb33aOdm1z851pZ9hvwqahQoYJVv2zLeq2t3Xc+/0iccXZdrX7sf1+xA2G69bpyRfCJ1I1BD1fq+93o933s2BlW/U033S5Wr9pihSvlmvx/tO/8mzljmejRo59146UgZj+uwtWSJXv/Q0+1Jcf8Mk2W9i9upuOffjJIfpGvva0KV5nU5GYbtnDF65R0nVC46tnzPbnvNlypsabrg7cn1XdU0lhTOxWuqlc/eE9I37sSxVeuVHu13/L+1tq5U6XJ5x35cJXtK1dePf/iixz7V157jdYGwjDrdeVq6PfLtYnUjUEPV14dOHCo9LcpOdoxv6Sv2eF1fmhysw1TuLKrxpfkx+yuWrnZVTvuBRc00OqCqsnnHflwRfBJ143ZHq4gzHZn5i7jU4Fr+ETqxmwNV1HW5GYb1nAF92ryeUc+XGHlCsJo6vXPgiYTrF2Eq+zT5FpAuAq/Jp935MMVwSddNyJcQRhuW3/xLp8KXMMnUjciXGWfJjdbhKvwa/J5Rz5cPfhZb23SdSOFK/o3GzD48rGDkMzEyhX1hcGXj108TdvC8MvHNZ6RD1cEn3TdiJUrCMMtBW+v8IkURlOTmy1WrsKvyeeNcCUQriCMott37+RTgStMJliY3ZpcCwhX4dfk80a4EghXEEbR455tyacC1/CJFEZTk5stwlX4Nfm8Ea4EwlVR0hDwOrtnnFPXalPz8FrWdlH9ihcvrtVB6LdeMZlgYXZrci1EMVzRfYDX2S1XrryjrWqvSv6EfzfnTKcmnzfClYhmuKKPlvz590nasV9m/iYebNfWaqNU/WKdJ9bxWauWaOeGMCgmA59IYTQ1udlmU7gqX76CKFasmFZP0j1g4YK18itraPvZZ16S5Q9DxoiceYX/x+zsP1bIsm2bJ6w+J5xwknXOdWt3iPf6fW6dc99997W2fx45WXtNvzT5vBGuRLTD1aG1amrHRk6bKI/Rha7aUf1+++8vDj6kRszzjJs7Qxx93LFi+JSx1tfs0HEKaj0/7Ce3v/1lhHTxX4VfmQNhJvWKyQQLs1uTayEbw9XqVVutOvVl3TT3H3DAQaJMmTJWuKL6zp3fkKX9uyP33/8AWc6YvkS2PeusevJLnNVXMZUuXVpc3bCx3B4xYqK0W7c+2vvxS5PPG+FqD49+/b428SYy7OHKbvkK5aVv9X9PO5YOK1WurNVB6LfJwCdSGE1NbrbZFK7sUtAieb0b7V/I7NaHH3pMq/NLk88b4WoPu//9V5t4E5lN4QrCKOoVkwkWZrcm10K2hqsoafJ5I1z9B594E4lwBWF4TeYZVwSfSGE0NbnZIlyFX5PPG+HqP/jkm0iEKwjDazJs3rxDm0hhNDW52SJchV+Tzxvh6j8mrV6kTcAQwuw0GZYv26xNpDCamtxsEa7Cr8nnjXD1H/96+HdXEMLwmb9tE//1N4ZPpDCamtxsEa7Cr8nnjXBlg0/CEMLsM1lef3m6NpHCaGpys0W4Cr8mnzfClY1/du/SJmIIYfaYu+0v/mvvCT6RwmhqcrPN9nA1evQ0rY772affismT50nV09fV87FUPana9+7V33GMtvPztlt1VE79bYFYtnSjtf/7tEXa66ZKk88b4YrBJ2MIYfaYCkwmWJjdmlwLYQpXRxxxlPWA6GrVqotbb71TNGp0g9ynry+jktpddulVslRt7edo1qyFdYyfn8zP2ybLhg2vi3mOeP1KlSoly9q1T5XlksXrxVtvvS+3Fy5cq7VPpSafN8IVg0/GEMLsMVXwiRRGU5ObbZjClQoudAumslq1g6W0/8X/vpPlmvx/ZN3Zdc9ztFXSE9xHj5pq1b/Q8VXHcRWuVFtqx8/Btbc56aRTrHoVrtKtyeeNcBUDPiFDCMNvqjCZYGF2a3IthClcNWt6r9h//wOtIEPhZ9A3I+Q+fUdgu3bPyHp1nEq1rTzooGqiZMmSWr3SHq7mzlltnYOkPxWqwGXv0737u7KkJ8JTuFLHEa50/otQ8eEd/IJPzBDC8Jpq+EQKo6nJzTZM4QrG1uTzRriKw5hFeEgohNliKjGZYGF2a3ItIFyFX5PPG+GqCH5aNEubpCGE4TId8IkURlOTmy3CVfg1+bwRrhLAJ2oIYXhMByYTLMxuTa6FZ9tPEbNnbUqp9Pq8DqZPk/FGuHIBn7AhhMH34c/78F/llMEnUhhNTW62MFoiXLmET9wQwuCaTnBDhUpcCzCeCFcG8AkcQhg8H/ysN//VTTl8IoXRFOEKxhPhyhA+kUMIgyN9AXu6wQ0VKnEtwHgiXHmgcptbtEkdQphZ/WL79l3aRAqjKcIVjCfCVRJ0/XmQNsFDCP0zZ2Me/7VMO7ihQiWuBRhPhKskadSrkzbhQwj9MRPMnF6gTaQwmiJcwXgiXKWIvG1/aRM/hDD1TsldzH/9fIdPpDCaIlzBeCJcpQF+M4AQJueYZfPEIe3v5L9qGeGe237WJlIYTRGuYDwRrtJMnwnDxbIYNwsIYWILtmziv1KBgE+kMJoiXMF4IlwBAIABuKFCJa4FGE+EKwAAMIRPpDCaIlzBeCJcAQCAAbihQiWuBRhPhCsAADCET6QwmiJcwXgiXAEAgAG4oUIlrgUYT4QrAAAwhE+kMJoiXMF4IlwBAIABuKFCJa4FGE+EKwAAMIRPpDCaIlzBeCJcAQCAAbihQiWuBRhPhCsAADCET6QwmiJcwXgiXCUJvUX1Njds2GDV9+zZ09omdu/ebbUjTj75ZNtRIUqVKuXYBwAEE9xQoRLXAownwlUSDBw40Nqm8HTggQfKANW/f39ZZ3/7tK3cuXOnqFKlijj77LOtNsWLF3e0BwAEk7Vr/tYmUhhNEa5gPBGukmD+/Pmy3LVrl9i+fbtcubrqqqvEZ599Juvtb9++cvXLL7/IcGU/TitXAf9xAQACK1dwr7gWYDwRrpKE3mK1atXktgpXqt7+9u37KlypegLhCoBw8L9PFmgTKYymCFcwnghXAABgwG2Nh2sTKYymCFcwnghXAABgAG6oUIlrAcYT4QoAAAzhEymMpghXMJ4IVwAAYABuqFCJawHGE+EqCSq3uUUs37oBBlgaIwBSDZ9I3ThyeB4/DQgofOziaRKu+vSczV8GhAyT8Ua48sjSgjXajRwGUwBSickEaxfhKjzwsYunybWAcBV+TMYb4cojCFfhEYBUwydSNyJchQc+dvE0udkiXIUfk/FGuPJIKsNVyTNra3XKI6+7wmpT5cK6sly8aZ3Wrijt54/3Wsu2rI/bh1z45xqtjRd/nDlZqyt91slaXSoFIJWYTLB2gxKuNm/+W5Zbtmyz6j775KfCY5v+tlT727ftsNop7G2IZUvzxbffjLO1KGyzY8dOa9teEur1Yx3LNHzs4mlyLQQ5XPExmDa18AHZqo7L4eO6bds/4t9/CwOFOkbXguq/c+cu7Vx5ueulQcZkvBGuPJKucHVAg3PFKbfdIOvK1zvNcZzCldpXdSfe3Egs2Vxg1Z962/Wi3j23O9pQuV/9c8T4xXPk/u+rl2jvYd/zzpBljSsukuX+F9ezjtnPdUfHDtaxUntCkf29U/g6uvGVcrvqRWeLho8+ZPUdMm2CrFPhqnTdU8TIOdOsc7w3bLB8j+r1+PtLRgBSDZ9I3RiUcHXckc1keV7dVrI89oimVqm2FQ/e94Z1zI69D7Fr127HPrHpry3WNm9vfy0qG131lPYamYSPXTxNbrZBDlf2sWh42ZNaXax2dnbtCUv2ej6+sRg8qDCM0/FL6z8mFi/KFXl5G8RlF7djLYODyXgjXHkkHeHqnR++cewrVchS4Uq1sYcnKh98vbN45K3XRJ3bb4h5fhWuYtl7yFfirOZN5HbPbwfIsu5dt2rtKFzZ969q+4Bjn17ro5+HilJ7SrvqPfw4ozBcHXrVxWLaqkWi3J6freKeYEfhSp2j6n8hK1UCkEpMJli7QQ5XJK00qG1+k6SVCDuqnkLVE+3ecdQr+rw9WDS8fO+NOtZ5Yx0LAnzs4mlyLYQlXKmSb8+ZvbTIscrNLbDq6Rrj5+TYz2VvE699EDAZb4Qrj6QyXNlt+sJTWl1RXte+jbU9f0Oedpz74if9rO2n+va0tlX4eaRnV1k2f/FZ69jSBH8OnJm3zNq+rNV9srz3lY6yXLJpnZi7bpXc7vzp+1a7QZN/leWvC2Zp57OvmqVCAFINn0jdGJRw9VDLN8SSxbnazU/d5Ox/rlErV1dd9kRh5//gfWdMX+TYJ4pauXql82dS+401SDdVPnbxNLnZhiVcnX3GgzJMX3RuG6tOXRNFjRXVLVq4SoZ0Nb6qPhb2lavHH+0j3u4xSLzedYDotsegYjLeCFceSVe4UtK/ceJ10JsApBKTCdZuUMJVEFB/RgwqfOziaXItBDlcEerfSIH4mIw3wpVH0h2uYOoEINXwidSNCFfhgY9dPE1utkEPVyAxJuONcJUE/CYOgykAqcRkgrWLcBUe+NjF0+RaQLgKPybjjXCVBPT07/l/5sOAOmdDrjjwsdv5sAGQFIsW/KlNpG6kcLV9+y4YAvnYxdPkZtur+yztdWC4NBlvhCsAADDAZIK1S+GK16XaJx+ZqNXB9GlyLfR4bbZWB8OlyXgjXAEAgAHPPTFJm0jdiHCVfZrcbBGuwq/JeCNcAQCAAS2bj9YmUjciXGWfJjdbhKvwazLeCFdJYPJBw8xIYwRAKvH6e19UuKKp7owzzhbDfhxn7atjU6cukPtffzVMO8b1K1zVrn2qtT1p0lyRn7dNTJo4R2tXlNWrHyyWLFkvtz/4YICoVq263Lb/fJ9+MkiUKVNW6xsUTa6FeOGKfl71M0+cMFv0fffTmMdVG9PPOd3y93XggQeJZUs3au2KsnTp0mL06Kly+6yz6jmugVUrN8uSroWirn0/NBlvhCuPFKzbpn2YMJgCkEq++GSBdo25MVG4IilcUWk/psKVasf72vUzXNF7KVu2nAxXVKfeW5kyZbT2JAUw/v4ThSu78eozqcnNtqhw1axZC2s71nG7/HimVe/rsssayv3c1VvjXq+rV22R5Y8xrvNE4cruhRdeotX5ocl4I1x5JD9vq/ZhwmAKQCoxmWDtJgpXVKqVq6Z33CN+GDJGblO4itU2ln6GK7XNw1XNmodr7clly/6M+95LlSol+vf/0nEeJYUyKosXL671y7Qm10JR4Upt08oV7a9aWRhCyO+/L/wzNNVTcOH9M23h+3UGIPUzVaxYKWZ9r14fauOsLFasmLj77gfk9tUNr3Oce/rviwvrr26s9fNDk/FGuPIIwlV4BCDV8GvMjUWFq1hWr15Dq0ukX+EqFdL0zuvCpsnNNl64guG5FkzGG+HKI6kMV/XPf1SWze/oKh5r21d+1xLtq7L764PFurW7rO/hUv2OP+pOMXNGnlgwf4NYvqww3duP0/Yvo+aLb76cotVTSV+uaX8fHdp/KE4/5X7H65Nv9fjB0e7Tj34Vl9Vv7zjX0iWbxNo1O+W++tJO/pr33/umow8vjz+q8P3krk7tn1wBSCUmE6xd03DlxTCFq2zQ5FpAuAq/JuONcOWRdISrS/cElvUFewfk7DMesrZ5WLHXX3f1c446OgeFscsbPCHqnNRCvNd3pOP4xRc85uhvP/bc059ooYiHKwpzVH/isXc56q9v9LxYsvivuO9VhSv7ue0l306VAKQafo25EeEq+zS52SJchV+T8Ua48kgqwxUFitrH3S23P3x/tNwv+G+lilaeVJtYwYPqaMWoYN0uq04FNDq2eNFf4p3ew2IGmFjno3DVt88IuVpG+/T6o0bOc7S5tuFzIi93u3aOosIV7d/UuJOYMmm5Vdfgwnay/PWXhWL82MVWHwpv9r7JCkAqMZlg7SJchUs34+ymjRLhKvyajDfClUdSGa6Sdcrk5eLLAfEfbNi3z3Ctzqs3XtdRq0u1FNB4XTICkGr4NeZGCld/zNyUVtu0HKfVQe/SzZTX8eN8nOPZ9cUZWn8YLk3GG+HKI0EKV7BoAUglJhOsXaxchcfnnpyi1cXS5FrAylX4NRlvhCuP7Njh/OBgcAUg1fBrzI0IV9mnyc0W4Sr8mow3wlUS3HxN4ROTYXClXwYAUonJBGsX4Sr7NLkWEK7Cr8l4I1wBAIAhfCJ1Y1HhiqY6kh4iSg/UtB/jDxGtVKmy1l+ZznBF74/KPr0/cuyTNWseIf6YVfg/q9jrn+pQ+G80q1SpatWrcvWqrWK//Q5wvIZ6iKq9XYMGV4j/+7+Xtf5B0O3NltrFC1f2n0c9RNR+3P4Q0RIlSmj9M2n58hVkSe9t2tSF1nufn5Mvy3r1LhC1ah0ht9V7t4/jjTfeKo455njHOUuXLiPL9/p97mirtJ/Db2kc3Y45whUAABjgdnLlug1XVNqPBfHrb8jDDqvl2G/V6vGY74/q7E/qbtjwOmt7yJBfHG1/HDrW0Y/KK6+8NtDh6rbGI+J6S6Nh4tbGw+V2UeHK/rPR17/EOm5vFySbN7/fel/lypXXjs/PyXO892uvvVFrY5e+Z5DKzz771vG52M/BPyO/TDTedhGuAADAED7pujFRuKLS/sXNqo6vXJ18ch2tvzLd4Uq9p9tvu8u6CZK0KvHSi6872pDqS5dp5YrKNfnb5fEePd6T+zxcPdH+OUd/ta3Clf1YmDRZuVpfsEuMHzfLqrOvXFF5/nn1tXNk0rlzV8v3Rl9PRNeFqq9T5wxZqnFT73/unFVWG1ql5Su1ebl/x7wG1DmKFcvc1yDRODa51t3/fY9wBQAABqRj5SpVpjtcBUX1p6MwGS9cwb2qL2924wEHHKTVpVuT332EKwAAMMBkgrWLcBVtEa7Cr8nvPsIVAAAY0L71eG0idSPCVbRFuAq/CFc+8vzzz8u/Az/55JNy/+abb2YtCmnXrp1o2bKltb9q1SrbUXcU9XHYjzVu3FhaVHviuuuuk+3icffdd/MqC3XuRK8BQLZhMsHaRbiKtghX4dfkdx/hKknoLZ5++ukyXNnfLm0Xtb98+XJRrFgxa18xePBg+Q8DL7jgAkd9rVq1HPt169aVZcOGDWXJX0uVvD7WPv+Yu3TpIssbb7xRXHPNNVb9338X/kNDgkp6n0TVqlVlOW/ePKstANnKrBkF2kTqRoSraItwFX4RrjKAWrn6+OOPZUlv3f728/PzrW2CwtVpp53mqCMoXFWqVEluq/CisJ+PVsjsx2N9VLyOv6fdu3db9XY6dOggSwpXl156qeOYamsv1fslhg4dam0DkI2YTLB2Ea6iLcJV+DX53Ue4Cijffvstr9Lw4+Oh1ajRo0fz6pjk5ORYgQ2AbIZPpG5EuIq2CFfhF+EKAADShMkEazfM4YqmYl7n1o4dX7W233nnY2sFXdXVrXuuLKlu1M9THMfpn06sL9ht1b3+2tvWsVglSe35ewiCbsPV8GETpPZ93ibM1qpZ+MR28oP3v9COk/SsL17H5deRH5r87iNcAQCAIXwidWMYwlXj626W5U033S5+HTNd3rzowZBUkjVqHCKPn3vuhbI8/PAjRbVq1WPe6OghkrHqubffXvjgSWpH4UrVH8u+FoVbtep+spz++2Krjh5AydsFRbfhyv55JfrsMiH9cxR6XznzcsVllzUU69buFDfecKt1nJ7c3+mF18RRRx1rvX/1TCp6gjsPV2ecUdfaP/KIo2VZtmw57XW5desWPqX97LPP23PexO1TIcIVAACkCZMJ1m4YwpVdmn5VqbbzcrdZx+2hhm6wvD/vW5RLFq/XwpX99Xl7qrN/X2EY9BKugigF7Hjvce2af2TZ6YWu4sQTa4sj9oQl3rZmzcOtbbVytW7tDke7K69sZG0vXbJBex1ShSt64jt/jXRp8ruPcAUAAIbwidSNYQhXK5b/JQYP/lk81eEFub98zz5vY7d3r/6yLFin/xlHfR3OmvzCG64XO7/0hlYXVt2Gq6A7b27unrIwOHR8voss2z32tHV81cotYsAXQxx9vhs8Spb9+n6une+j/l/KMj9vu1VHt34q7X/iHT5sfNxr6cuBQ7W6dIhwBQAAacJkgrUbhnAF02e2hKsoa/K7j3AFAACG8InUjQhX0RbhKvwiXAEAQJowmWDtIlxFW4Sr8Gvyu49wBQAAhvCJ1I0UrmhyhsGXj10q5K8Bwykf13giXAEAgAEmEyyESqxchV+T332EKwAAMIRPpBAmEuEq/CJcAQBAmrjz5p+0iRTCRCJchV+EKwAASCN8IoUwkQhX/4q+fT/T6j78YKC1Tbd8Vb7RrY9WX/ukUxx9P/n4G1k++uhTsrziiqutY4sXFTjapkKEKwAASBPdXp6uTaQQJjKs4apr17flQ2Jr1TpCPomfbstUv2TJeq0tHSNjPVSW6hOFK3tbCldU0tfpqDreTvnwQ4/J8uqGja22RbX3KsIVAACkCZMJFkJlmMLVb1NyHPt0K16Tv90RWk499QytX+nSpeXx0aOmaseo3k24Ovnk06xwZe+rzq/qbrmlqXWMwpVqk05NfvcRrgAAwIBdu/SJFMJEhilcJfKcc85POswsmL9Gqwu6CFcAAJAmTCZYCJXZFK6iqsnvPsIVAAAYwidSCBOJcBV+Ea4AACBNmEywECoRrsKvye8+whUAABjCJ1IIIbSLcAUAAAaY/NcrhDCaIlwBAIAhfCKFEEK7CFcAAGAAVq4ghIlEuAIAAEP4RAohhHYRrgAAwACsXEEIE4lwBQAAhvCJFEII7SJcAQCAAVi5ghAmEuEKAAAM4RMphBDaRbgCAAADWrUYo02kEEJoF+EKAAAM4RMphBDaRbgCAAADfvx+uTaRQgihXYQrAAAwYOvWndpECiGEdhGuAADAED6RQgihXYQrAAAwAI9igBAmEuEKAAAM4RMphBDaRbgCAAADsHIFIUwkwhUAABjCJ1IIIbSLcAUAAAZg5QpCmEiEKwAAMIRPpBBCaBfhCgAADMDKFYQwkQhXAABgCJ9IIYTQLsIVAAAYgJUrCGEiEa4AAMAQPpFCCKFdhCsAADAAK1cQwkQiXAEAgCF8IoUQQrsIVwAAYMDT7SZqEymEENpFuAIAAEP4RAohhHYRrgAAwIDlyzZrEylM7Ht95st/rwazVz7mURbhCgAADMjL3apNpDCxFK5AdsPHPMoiXAEAgCF8IoWJRbjKfviYR1mEKwAAMOCDd+dqEylMLMJV9sPHPMoiXAEAgCF8IoWJDXO4ypm3XBx7RFO5Havk2/a6ePA2fD+M8DGPsghXAABgAP7hrjfDHK54gLKXj7XtpbVZtixf5Oaul9uJyIZQpeBjHmURrgAAwBA+kcLEIlzFhoerMActPuZRFuEKAAAMwMqVN8Marnjw+ffff7WwxQNXvHDF2/Jz87qwwcc8yiJcAQCAIXwihYkNa7gC7uFjHmURrgAAwACsXHkT4Sr74WMeZRGuAADAED6RwsQiXGU/fMyjLMIVAAAYgJUrb1K44nUQZqsIVwAAYAifSGFiEa5glES4AgAAA7By5U2EKxglEa4AAMAQPpHCxEYlXPXu3V+rsztt6kKtzt4vd/VWMXrUb3K7X7/PHMfXFzhv2DC4IlwBAIABWLnyZqJwRdM9lV1ffUtuq/2wSe+7d++PrP3bb79LPPHE/1n7vd7+UJaXXXaVVXf99U2sn3fe3FzRps0TcrtSpcra+ckTjq+t1cFgiXAFAAAG/PsvVq686CZc3XHHPdY2yduEwVjvvX3756xtCleVK1eJ2Y/KWTOXid69Clex+Hl4WxhcEa4AAMAQPpHCxLoJV3w7P2+71i7o0ntft3anKFGihLX//P+9bB1XK1f2n7dq1f2sunr1LrC2Fy5Y4ziv6vNUhxe014XBEuEKAAAMmD9vozaRwsQmClcQZpMIVwAAYAifSGFiEa5glES4AgAAAx5vPV6bSGFiEa5glES4AgAAQ/hEChNL4er7QSthFsvHPMoiXAEAgAF4FIM3sXIFoyTCFQAAGMInUphYhCsYJRGuAADAAKxceRPhCkZJhCsAADCET6QwsW7CFU35F1xwsciZl6sdi5r1618my0TP+lq2tPDRICtXbJLlb78l/pxh+kW4AgAAA7By5U034Wr1qi2yDHq4Ug/9vO225rKcMH62LFcs/8vxsE9lwbpdYuTIyVo9fY/g2jU7tPOT9etfKkveh6vClbJMmbJaG+i/CFcAAGAIn0hhYt2EKyWFK7USE0Q7vfCaWLRonWjY8Dq5v2xZYcChL1am2xZpb79kcYH8ypvixYs76leu2KydWxkrXE2csDfEqa/Q4eGqbFmEqyCIcAUAAAZg5cqbicLVs8+8pMnbhM1rr71Ryuu5RbWLt7IVz2lTF2p10H8RrgAAwBA+kcLEJgpXEGaTCFcAAGAAVq68iXAFoyTCFQAAGMInUphYhCsYJRGuAADAAKxceRPhCkZJhCsAADDgzz//0SZSmFiEKxglEa4AAMAArFx5E+EKRkmEKwAAMGD40BXaRAoTi3AFoyTCFQAAGMInUpjYqIarj/p/pdVx69Y9V3To8ILcPq3OWbKk2x+Vixaus9qph5DWrn2qWLWy8AGkql3FfSvKcuRPk6326phfYlV3rwhXAABgAG4g3syGcEW3pBnTl2j16hg5aeIcRz2Fq1KlSmtBh56kruoqVNhXltN/Xyz69ftc1lepUlXW5czLE2vXFP47vymTc6z+9nBlbz982ATrwaP0xHj7a6Zb+t2AhSJcAQCAIfymAhMb9nBFt6OSJUvK7d+m7A055OWXXy169nw/ZriqU+cMcdWV11rnqFXrCLlNwUeFH6q3l3btK1f0+vfe85DctoerdWt3Wm3sK1fHHHOcdr502+Ta4VodRLgCAIAiof8q5RMnTGzYw1Uy3nTT7VodjJZ+w7OUBu8AAACZhk+cMLFRDlcQ+g3PUhq8AwAAZJJdu/SJEyYW4QpG1bVrdvFpJO3wLKXBOwAAQKbhkydMLMIVjLJ+w7OUBu8AAACZhk+cMLEIVzCq0r/T9BuepTR4BwAAyDR88oSJRbiCUTUT8CylwTsAAECmwf8xaC7CFYyqmYBnKQ3eAQAAggCfQGHRhjlcvflmX60ulnTL4nX8+LSpC7R6dUz15+c59pjjRYkSJaxjlzS4Qutv96ijjhGlS5fR6mFmzAT2HBUT3gEAAIIAn0Bh0YY5XLVq9bgs1UM/y5UrL17u3F2UK1tO7j/37MvyKep0y7L3W7xonZgyeZ6oWLGSFZ4oXA35/hfR/Y13tNdRT1Ynjz76OO183GVLN0pp+4477rbaL1m83mrT5ZU3tX7QPzPx760IR5CKBe8AAABBgE+isGjDHK7UytXzz3ex6uj2RGXBul3/397dhUhVx2Ec933dFV0xUFNCFAkStQIvRKW68KYLr9QkKzOIILoQKgqqOytIgi2IwKIge7nJ0G7bQCHL9S1dW5d1FdzZ9WV3Td0XZVfQTv7PcM7OeX5z2rFs57x8P/DwPzNzfqOr7n8eZmWO99TGZ/xPTg/uC+Lud3HHK1as/Md3roK4MuZWd3mcurpp5vG4uE9vr6+f6R+XlqsZM+rNuWTs8uorB3TrGBNSpSwdAIAk4P9d3V3SXK7+r7iXuOD49dfeMY+T9KdatEsZOgAASaEbKYkP5YrkLXt3d+qWMWa0Sxk6AABJoZspiQ/liuQt1aRdytABAEgK3UxJfChXJG+pJu1Shg4AQFKcbe8zGyopH1euPv+0jWQ4+nee5zQf79ftYkxplzJ0AACSRDdVUj68c0XylL+q+8YV5QpA+unGSmwoVyQv+XJnu24RY067lKEDAJA0urkSG8oVyUuSQLuUoQMAkDQvv7DfbLAkmryXqwvnr/vrrFn3mceC1NRM9Vf30hesf5wsRO5zafypKXJf6Vyhg/8HWO0kQaRIlaMDAJBE167aTZaMJIvlyr1EuZTe1nOCfPP1Hn8NPjG90NEfzqxa9Vh4Xm1tbfi8H3/0mXnO5hPnwucK5l25cuvatU+aX5eMbZIiLFFxdAAAkko3WjKSvJSrxsYm73TbJXNuUIiC8y/3Fq8j6K5X6N7NCu5ft259eOzW/fuORuZc3DtXEyZM8I8bGnaad7xIdVKt6wiWE5aoODoAAEmlmy0ZSRbLlWbRosWR28uXPxpGz3UJLgR9L3PkMB+JUK0kiXYpQwcAIMl0wyXF5KFckfympfmKbgVVpV3K0AEASDrdeAnlimQ3N4d1B6g+7VKGDgBAGugGnPdQrkgWU+0PC42jXcrQAQBIA/efW3UjznMoVySLSSrtUoYOAECa6Gac11CuSNaSZNqlDB0AgDQZHKBguVCuSJaSdNqlDB0AgLThR4SUK5KdpIF2KUMHACCNBgeKHxqZ1yS1XLmXGbdevHDDPw5u6/G2bW+Gx/X1M8P5efPmm+dav/5p/3jp0kci97u8u/1Df12yZFnk9zF1am3kdl3dtPB48+at4fH5ruJldILnnTt3nneoqTXy67j17JnL/tp9aajs1+Ry6eKQ/2GkW59/KXI/KZ+BgXQUK2fcaHQAANJMN+y8JInl6qGHlvrrqZYuv1y54/Hjx3vvv9cQKRvu2KWmpsa/vbrkcjWlcee4awiOlKuHvYkTJ0aeK/jg0NJy5R5ftqxYxMolmA9+H8eOtkce7zh3zVty52txj3UW+r0pU6Z4kyZN8iZPnhzO7Prqh8hzuZQWLzJ60mTcaHQAANJON+08JInlymX69Bn+2tM97L8jtWnTc17rqfPexg2bw3MWL37QX8+095p5l+Dc2bPn+J/GvmPHJ97ePT97b7+13b8/KHEuc+bc76/fffujv7ryFTzmrjt44MDJ8PbePY3+uvv7kR8ru0IUHK9e/bhf1oKLQi9cWPyE+AULFnorV64Jz50//wF/dV9f6dfV1TXobdnyon+8Zs0T4f0kmjTSLmXoAABkwbMbii+ceUlSyxUhcWn44KR+26aGdilDBwAgS3p7bplNPYuhXJE0pb8vne9YBbRLGToAAFl0/Gif2eCzFMoVSUOyQruUoQMAkGW62WcllCuS5BxuStaFl/8r7VKGDgBAHrgfS+gLACHk3qbp12791ssE7VKGDgBAnuz6os0rdAybFwVCyL9LW2uffptljnYpQwcAIM86C4Pe7Vue98a2g+ZFgxAykl/29XrXr3veid8v67dR5mmXMnQAABDv0G/FH3OUW10OH+zx1+HhW2XPGW11OXO6r+xjd7Ne+XPI3FfpeuKYfbHUc0ZbOzsG/dW5efO2vx5p6omcU+nqdF+8Ufaxu1lbW66a+ypd3RUA3FrusUrXwp0/k+A5WpqvlD1ntNX93QTP4T5/q9w5la4uQ0OV/zt1/6ZQpF3K0AEAAADE0y5l6AAAAADiaZcydAAAAADxtEsZOgAAAIB42qUMHQAAAEA87VKGDgAAACCedilDBwAAABBPu5ShAwAAAIinXcrQAQAAAMTTLmXoAAAAAOJplzJ0AAAAAPG0Sxk6AAAAgHjapQwdAAAAQDztUoYOAAAAIJ52KUMHAAAAEE+7lKEDAAAAiKddytABAAAAxNMuBQAAAAAAAAAAAAAAAACo3N9G6kqqncaCaAAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,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>