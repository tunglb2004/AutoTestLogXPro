**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification – SRS)*

*Mô hình Hybrid: User Story (xương sống) \+ Use Case chi tiết (cho story phức tạp)*

**MODULE: CẤU HÌNH CHẶNG (LEG CONFIGURATION ENGINE)**

| Tên hệ thống | LogXPro — Nền tảng logistics 4PL |
| :---- | :---- |
| **Module** | Cấu hình Chặng (Leg Configuration Engine) |
| **Nhóm chức năng** | Cấu hình hệ thống → Cấu hình Chặng |
| **Link UI Design** | [Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=11546-66794&t=ATqlbJwTPe75o7Am-0) |
| **Người lập** | Trang BA |
| **Ngày tạo** | 06/09/2026 |
| **Phiên bản** | v1.0 \- Cấu hình Chặng |

# 1\. Tổng quan & Phạm vi

## 1.1. Mục tiêu

* Đặc tả khu vực cấu hình quản trị cho phép người dùng có quyền khai báo bộ Quy tắc chặng hành trình — mỗi quy tắc xác định số lượng, thứ tự các Chặng và danh sách dịch vụ thực hiện trong từng Chặng.  
* Kết quả cấu hình tại module này là nguồn dữ liệu duy nhất (Single Source) mà K3 — Tháp Điều Phối tham chiếu để biết **thứ tự thực hiện các Chặng** và **danh sách dịch vụ thuộc từng Chặng** của Phiếu dịch vụ.  
* Module cung cấp các chức năng Thêm, Xem, Sửa, Xóa và Kích hoạt / Vô hiệu hóa quy tắc, được kiểm soát bằng 5 quyền chức năng độc lập; công cụ Leg Engine Simulator được mở dạng modal từ nút "Mô phỏng thử".

## 1.2. Phạm vi hệ thống

**Trong phạm vi (In-scope):**

* Xem danh sách Quy tắc chặng hành trình với 9 cột: Mã quy tắc, Tên quy tắc, Phạm vi, Phương thức vận tải, Loại hình vận tải, Điểm đi, Điểm đến, Thành phần, Trạng thái.  
* Tìm kiếm theo Mã quy tắc và Tên quy tắc; lọc theo Phương thức vận tải, Loại hình vận tải, Điểm đi, Điểm đến, Trạng thái.  
* Thêm / Xem chi tiết / Sửa / Xóa Quy tắc chặng hành trình — thao tác được từ cả màn danh sách và màn Xem chi tiết.  
* Kích hoạt và Vô hiệu hóa quy tắc: quy tắc có 2 trạng thái Đang hoạt động và Dừng hoạt động; nút hiển thị theo trạng thái hiện tại của quy tắc.  
* Phân quyền theo từng chức năng: Xem, Thêm, Sửa, Xóa và Kích hoạt/Vô hiệu hóa Quy tắc chặng hành trình.  
* Khai báo khối "Cấu trúc Chặng": thứ tự dòng là thứ tự thực hiện Chặng; tên Chặng không trùng nhau trong cùng một quy tắc; tối thiểu 1 dòng.  
* Với mỗi Chặng, chọn nhiều dịch vụ cùng lúc (multi-select) trong 4 dịch vụ được phép cấu hình; Chặng được phép không có dịch vụ nào — hệ thống chỉ cảnh báo, không chặn lưu.  
* Ràng buộc dây chuyền: Phạm vi thực hiện (Quốc tế / Nội địa / Cửa khẩu) quyết định danh sách lựa chọn của Điểm đi và Điểm đến.  
* Khai báo trường Phương thức vận tải (Đường bộ / Đường biển / Đường hàng không) đứng trước Loại hình vận tải (Hàng nguyên / Hàng lẻ) — cả hai đều là thành phần của bộ khóa kiểm tra trùng.  
* Xóa quy tắc chặng — chỉ áp dụng cho quy tắc chưa có Phiếu dịch vụ nào sử dụng, có bước xác nhận trước khi xóa.  
* Tự động sinh Mã quy tắc theo cấu trúc RUL-YYMM-xxx tại thời điểm lưu quy tắc thành công.  
* Leg Engine Simulator dạng modal: nhập Loại hình vận tải và Điểm đi/Điểm đến thực tế; hệ thống tự suy ra Phạm vi thực hiện và chọn Quy tắc chặng tương ứng.

**Ngoài phạm vi (Out-of-scope):**

* Trường "Loại hình XNK" — đã được gỡ bỏ khỏi Quy tắc chặng hành trình (bản 5.0).  
* Cấu hình dịch vụ Kho bãi theo Chặng — Kho bãi không nằm trong danh sách chọn của Cấu hình Chặng; Leg Engine luôn gán dịch vụ này vào Chặng 1 khi phiếu có đăng ký (BR-CH-36).  
* Vận hành hàng ghép (LTL/LCL) và hàng nguyên container (FCL) — 3 giá trị hiển thị trong dropdown "Loại hình vận tải" nhưng ở trạng thái disabled; phạm vi hiện tại chỉ áp dụng FTL.  
* Chỉnh sửa danh mục Điểm đi–Điểm đến, Cửa khẩu, Dịch vụ, Đơn vị hành chính — thuộc module "Quản lý danh mục" (SRS\_07).  
* Khai báo và gán vai trò/quyền cho tài khoản — thuộc module "Tài khoản & Phân quyền"; module này chỉ tiêu thụ 4 quyền chức năng đã định nghĩa.  
* Import/Export hàng loạt quy tắc qua Excel — chưa thuộc Sprint hiện tại.  
* Giao diện cho phép Consignment Controller (CC) tự thay đổi cấu trúc Chặng đã sinh ra — CC chỉ xác nhận (read-only) tại modal K3.  
* Sắp xếp lại thứ tự Chặng bằng kéo–thả hoặc nút lên/xuống — thứ tự cố định theo thứ tự dòng khai báo (BR-CH-07).  
* Phân bổ chi phí / doanh thu theo Chặng — thuộc nhóm nghiệp vụ Quản lý dịch vụ.  
* Lịch sử thay đổi (audit log) chi tiết từng lần sửa quy tắc — chưa thuộc Sprint hiện tại.

# 2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)

Link Work flow: [Diagram](https://app.diagrams.net/#G1AKDoe9Huz4-XugUO8pZSYwC4dNxlCTUn#%7B%22pageId%22%3A%22wf-cauhinhchang%22%7D)	

*![][image1]*

*Sơ đồ luồng từ Cấu hình chặng đến Mô phỏng chặng*

*![][image2]*

*Sơ đồ luồng từ Cấu hình chặng đến Thực hiện dịch vụ (K3)*

**Mô tả luồng chính:**

Người dùng có quyền mở menu "Cấu hình Chặng" → tạo Quy tắc chặng hành trình (chọn Phạm vi thực hiện → hệ thống nạp danh sách Điểm đi/Điểm đến hợp lệ) → khai báo từng Chặng theo thứ tự và chọn dịch vụ cho từng Chặng → lưu thành công, hệ thống sinh Mã quy tắc → mở modal Mô phỏng thử để kiểm chứng → bộ quy tắc có hiệu lực → K1 bàn giao Phiếu dịch vụ → Leg Engine suy ra Phạm vi thực hiện từ Điểm đi/Điểm đến thực tế, chọn quy tắc khớp và sinh cấu trúc Chặng kèm dịch vụ → CC xác nhận tại modal K3 → K3 vận hành theo đúng thứ tự Chặng.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| ----- | ----- | ----- | ----- | ----- | ----- |
| B1. Mở màn Cấu hình Chặng | Người dùng có quyền | Bấm menu "Cấu hình Chặng" trong nhóm HỆ THỐNG. | — | Hiển thị danh sách Quy tắc chặng hành trình | BR-CH-01: cần quyền "Xem Quy tắc chặng" mới thấy menu |
| B2. Tra cứu quy tắc | Người dùng có quyền Xem | Tìm theo Mã quy tắc / Tên quy tắc. Lọc theo Phương thức vận tải, Loại hình vận tải, Điểm đi, Điểm đến, Trạng thái. | Từ khóa, bộ lọc | Danh sách đã lọc | Các tiêu chí lọc kết hợp theo AND |
| B3. Khai báo Quy tắc chặng hành trình | Người dùng có quyền Thêm/Sửa | Tạo mới/Sửa quy tắc: – Tên quy tắc (duy nhất toàn hệ thống) – Phạm vi thực hiện (chọn đầu tiên) – Phương thức vận tải, Loại hình vận tải – Điểm đi/Điểm đến theo ràng buộc phạm vi – Các dòng Chặng theo thứ tự, mỗi Chặng chọn dịch vụ trong 4 dịch vụ được phép (có thể để trống, hệ thống cảnh báo) | Dữ liệu nhập | Quy tắc được lưu; hệ thống sinh Mã quy tắc khi tạo mới thành công | BR-CH-02, BR-CH-03, BR-CH-17, BR-CH-21, BR-CH-23, BR-CH-24, BR-CH-25, BR-CH-26, BR-CH-29, BR-CH-31, BR-CH-35 |
| B4. Xem chi tiết quy tắc | Người dùng có quyền Xem | Mở màn Xem chi tiết ở chế độ read-only để rà soát cấu hình; thao tác Sửa hoặc Xóa ngay trên màn này nếu có quyền. | Quy tắc được chọn | Thông tin đầy đủ \+ cấu trúc Chặng kèm dịch vụ | BR-CH-28, BR-CH-30 |
| B5. Kiểm thử bộ quy tắc | Người dùng có quyền Xem | Bấm nút "Mô phỏng thử", nhập Loại hình vận tải và Điểm đi/Điểm đến thực tế; hệ thống suy ra Phạm vi và chọn quy tắc khớp. | Loại hình vận tải, Điểm đi/Điểm đến thực tế | Cấu trúc Chặng dự kiến \+ dịch vụ theo Chặng (không lưu) | BR-CH-06, BR-CH-20, BR-CH-33 |
| B6. Kích hoạt / Vô hiệu hóa / Xóa quy tắc | Người dùng có quyền tương ứng | Vô hiệu hóa: chuyển quy tắc Đang hoạt động sang Dừng hoạt động. Kích hoạt: chuyển quy tắc Dừng hoạt động về Đang hoạt động. Xóa: chỉ với quy tắc chưa có Phiếu dịch vụ nào sử dụng. | Quy tắc cần thao tác | Đổi trạng thái hoặc xóa khỏi danh sách | BR-CH-04, BR-CH-22, BR-CH-30, BR-CH-38 |
| B7. Bàn giao Phiếu dịch vụ | K1 — KAM | K1 hoàn tất Khối A (Thông tin chung) và bàn giao Phiếu dịch vụ cho K3. | Loại hình vận tải, Điểm đi/Điểm đến thực tế, danh sách dịch vụ đăng ký | Phiếu dịch vụ chờ xác định cấu trúc Chặng | Đầu vào bắt buộc đủ các trường căn cứ |
| B8. Sinh cấu trúc Chặng | Leg Engine (hệ thống) | Quy đổi Điểm đi/Điểm đến thực tế về giá trị danh mục, suy ra Phạm vi thực hiện, tra quy tắc khớp, sinh danh sách Chặng kèm dịch vụ; gán Kho bãi vào Chặng 1 nếu phiếu có đăng ký; ẩn Chặng không còn dịch vụ nào. | Dữ liệu Khối A \+ bộ quy tắc | Cấu trúc Chặng dự kiến của Phiếu dịch vụ | BR-CH-33, BR-CH-36, BR-CH-37; không có quy tắc khớp → báo lỗi rõ ràng |
| B9. Xác nhận & vận hành | CC / K3 | CC xác nhận cấu trúc Chặng, K3 vận hành theo thứ tự Chặng. | Cấu trúc Chặng dự kiến | Cấu trúc Chặng được đóng băng trên Phiếu dịch vụ | CC không được sửa cấu trúc đã sinh |

# 3\. Đặc tả Tính năng

Mặc định mỗi tính năng được đặc tả bằng **User Story \+ Acceptance Criteria (AC)**. Các story đánh dấu **\[PHỨC TẠP\]** có thêm khối "Use Case chi tiết" mô tả luồng chính / luồng thay thế / luồng ngoại lệ.

## 3.1. MODULE: Cấu hình Chặng (Leg Configuration Engine)

### 3.1.1. Danh sách user story

**Chú thích mức ưu tiên (MoSCoW):**

* **Must have**: bắt buộc để sản phẩm hoạt động / tuân thủ pháp luật–hợp đồng → Sprint hiện tại hoặc kế tiếp.  
* **Should have**: quan trọng, có thể tạm workaround → đưa vào Sprint nếu còn năng lực sau nhóm Must have.  
* **Could have**: mong muốn, cải thiện trải nghiệm → làm khi dư buffer hoặc sprint sau.

| ID US | Tên Story | Độ ưu tiên | Phân loại | Use Case đính kèm |
| ----- | ----- | ----- | ----- | ----- |
| US\_CH\_01 | Xem & tra cứu danh sách Quy tắc chặng hành trình | Must have | Thường | — |
| US\_CH\_02 | Tạo mới Quy tắc chặng hành trình (kèm gán dịch vụ cho từng Chặng) | Must have | \[PHỨC TẠP\] | UC\_CH\_01 |
| US\_CH\_03 | Sửa Quy tắc chặng hành trình | Must have | \[PHỨC TẠP\] | UC\_CH\_02 |
| US\_CH\_04 | Xem chi tiết Quy tắc chặng hành trình | Must have | Thường | — |
| US\_CH\_05 | Kích hoạt / Vô hiệu hóa Quy tắc chặng hành trình | Must have | Thường | — |
| US\_CH\_06 | Xóa Quy tắc chặng hành trình | Must have | Thường | — |
| US\_CH\_07 | Mô phỏng thử cấu trúc Chặng (Leg Engine Simulator) | Should have | \[PHỨC TẠP\] | UC\_CH\_03 |

Ghi chú về cách viết Acceptance Criteria: AC được mô tả dưới dạng **tiêu chí được chấp thuận** — nêu ràng buộc/hành vi mà hệ thống phải thỏa mãn, thay vì mô tả từng thao tác của người dùng. Phần mô tả theo trình tự thao tác được giữ trong khối Use Case chi tiết của các story \[PHỨC TẠP\].

US\_CH\_02 (Tạo mới) và US\_CH\_03 (Sửa) dùng chung 16 tiêu chí đầu tiên về form Quy tắc chặng hành trình; phần riêng của mỗi story bắt đầu từ tiêu chí 17\. Khác biệt duy nhất giữa 2 luồng là trường Mã quy tắc — chỉ sinh ra ở luồng Tạo mới và không được phép chỉnh sửa.

#### User story: Xem & tra cứu danh sách Quy tắc chặng hành trình

| ID US | US\_CH\_01 |
| :---- | :---- |
| **Tên Story** | Xem & tra cứu danh sách Quy tắc chặng hành trình |
| **User Story** | Là **người dùng có quyền xem cấu hình chặng**, tôi muốn **xem và tra cứu toàn bộ Quy tắc chặng hành trình đang có**, để **nắm được bộ quy tắc nào đang chi phối việc sinh Chặng và phân bổ dịch vụ cho Phiếu dịch vụ**. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Cấu hình Chặng (Leg Configuration Engine) |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| 1 | Menu "Cấu hình Chặng" và màn danh sách chỉ hiển thị với tài khoản có quyền "Xem Quy tắc chặng". | Tài khoản không có quyền truy cập trực tiếp bằng URL → hệ thống chặn và báo "Bạn không có quyền truy cập chức năng này". |
| 2 | Danh sách hiển thị đủ 9 cột theo thứ tự: Mã quy tắc, Tên quy tắc, Phạm vi, **Phương thức vận tải**, Loại hình vận tải, Điểm đi, Điểm đến, Thành phần, Trạng thái; kèm cột Thao tác. | Cột Phương thức vận tải đứng sau Loại hình vận tải → sai thứ tự yêu cầu. |
| 3 | Ô tìm kiếm áp dụng cho đúng 2 trường: Mã quy tắc và Tên quy tắc. | Nhập giá trị Điểm đi hoặc Phạm vi vào ô tìm kiếm → không trả về kết quả. |
| 4 | Bộ lọc gồm 5 tiêu chí: Phạm vi, **Phương thức vận tải**, Loại hình vận tải, Điểm đi, Điểm đến, Trạng thái; các tiêu chí kết hợp theo AND. | Không có bản ghi khớp điều kiện lọc → hiển thị trạng thái rỗng kèm gợi ý "Tạo mới Quy tắc". |
| 5 | Cột "Thành phần" chỉ hiển thị **số Chặng** của quy tắc, dạng "n Chặng". | Cột Thành phần còn hiển thị số dịch vụ → sai yêu cầu; số dịch vụ chỉ xem ở màn Xem chi tiết. |
| 6 | Cột Thao tác hiển thị icon theo quyền của tài khoản: Xem chi tiết (quyền Xem), Sửa (quyền Sửa), **Kích hoạt/Vô hiệu hóa (quyền Kích hoạt/Vô hiệu hóa)**, Xóa (quyền Xóa). | Tài khoản chỉ có quyền Xem và Sửa → icon Kích hoạt/Vô hiệu hóa và icon Xóa không hiển thị hoặc ở trạng thái disable. |
| 7 | Icon đổi trạng thái hiển thị theo trạng thái hiện tại: quy tắc **Đang hoạt động** → icon Vô hiệu hóa; quy tắc **Dừng hoạt động** → icon Kích hoạt. | Hiển thị đồng thời cả 2 icon trên cùng một dòng → sai yêu cầu. |
| 8 | Icon Xóa chỉ khả dụng với quy tắc chưa có Phiếu dịch vụ nào sử dụng. | Quy tắc đã có Phiếu dịch vụ áp dụng → icon Xóa ở trạng thái disable kèm tooltip giải thích (BR-CH-22). |
| 9 | Badge tổng số hiển thị "Đang hoạt động: n/m Quy tắc" (n \= số quy tắc Đang hoạt động, m \= tổng số quy tắc). | Chưa có quy tắc nào → badge hiển thị "0/0 Quy tắc" và danh sách ở trạng thái rỗng. |

#### User story: Tạo mới Quy tắc chặng hành trình (kèm gán dịch vụ cho từng Chặng)  \[PHỨC TẠP\]

| ID US | US\_CH\_02 |
| :---- | :---- |
| **Tên Story** | Tạo mới Quy tắc chặng hành trình (kèm gán dịch vụ cho từng Chặng) |
| **User Story** | Là **người dùng có quyền thêm cấu hình chặng**, tôi muốn **tạo mới một Quy tắc chặng hành trình và chọn ngay dịch vụ cho từng Chặng**, để **hệ thống sinh đủ số lượng, đúng thứ tự Chặng và biết mỗi Chặng thực hiện những dịch vụ nào**. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Cấu hình Chặng (Leg Configuration Engine) |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

*Các tiêu chí 1 → 16 dùng chung với US\_CH\_03 (Sửa Quy tắc chặng hành trình). Tiêu chí 17 → 20 chỉ áp dụng cho luồng Tạo mới.*

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| 1 | Trường "Tên quy tắc" bắt buộc điền, tối đa 150 ký tự và không trùng tên với bất kỳ quy tắc nào khác trong hệ thống (kể cả quy tắc đang Dừng hoạt động). | Bỏ trống hoặc trùng tên quy tắc khác → hệ thống báo lỗi kèm Mã quy tắc đang dùng tên đó và không lưu. |
| 2 | Trường "Phạm vi thực hiện" bắt buộc chọn, dạng dropdown 3 giá trị: **Quốc tế, Nội địa, Cửa khẩu**. | Chưa chọn Phạm vi thực hiện → trường Điểm đi và Điểm đến ở trạng thái khóa và không lưu được quy tắc. |
| 3 | Khi Phạm vi thực hiện \= "Quốc tế" hoặc "Nội địa": Điểm đi và Điểm đến chọn trong 4 giá trị — Nội địa Việt Nam, Cửa khẩu Việt Nam, Nội địa Trung Quốc, Cửa khẩu Trung Quốc. | Giá trị ngoài 4 lựa chọn trên xuất hiện trong dropdown → sai yêu cầu. |
| 4 | Khi Phạm vi thực hiện \= "Cửa khẩu": Điểm đi và Điểm đến cùng chọn trong {Cửa khẩu Việt Nam, Cửa khẩu Trung Quốc} và **luôn mang cùng một giá trị** — thay đổi ở trường nào thì trường còn lại tự cập nhật theo. | Điểm đi và Điểm đến mang 2 giá trị khác nhau khi Phạm vi \= "Cửa khẩu" → không được phép; hệ thống luôn đồng bộ hai chiều. |
| 5 | Khi Phạm vi thực hiện thay đổi, hệ thống xóa giá trị đang có của Điểm đi và Điểm đến, đồng thời nạp lại danh sách lựa chọn theo ràng buộc của phạm vi mới. | Hệ thống giữ lại giá trị Điểm đi/Điểm đến cũ sau khi đổi phạm vi → sai yêu cầu. |
| 6 | Trường "Phương thức vận tải" bắt buộc, đứng **trước** trường "Loại hình vận tải" trên form; gồm 3 giá trị: **Đường bộ** (mặc định), Đường biển và Đường hàng không (disable). | Chọn được Đường biển hoặc Đường hàng không → sai yêu cầu. |
| 7 | Trường "Loại hình vận tải" bắt buộc, gồm 2 giá trị: **Hàng nguyên** (mặc định) và **Hàng lẻ** (disable). | Chọn được Hàng lẻ → sai yêu cầu. |
| 8 | Trường "Điểm đi" và "Điểm đến" đều bắt buộc chọn ở cả 3 phạm vi. | Bỏ trống Điểm đi hoặc Điểm đến → hệ thống báo lỗi và không lưu. |
| 9 | Tổ hợp **(Phạm vi thực hiện \+ Phương thức vận tải \+ Loại hình vận tải \+ Điểm đi \+ Điểm đến)** không được trùng với bất kỳ Quy tắc chặng hành trình nào khác đã tạo trong hệ thống, không phân biệt trạng thái. | Đủ 5 trường trùng với quy tắc khác → hệ thống chặn tạo/sửa, báo lỗi kèm Mã quy tắc đang chiếm tổ hợp đó. |
| 10 | Khối "Cấu trúc Chặng" có tối thiểu 1 dòng Chặng; thứ tự dòng là thứ tự thực hiện Chặng và được hệ thống đánh số 1 → n. | Xóa dòng Chặng cuối cùng → hệ thống chặn và báo lỗi "Quy tắc phải có tối thiểu 1 Chặng". |
| 11 | Tên Chặng bắt buộc điền và không trùng với tên Chặng khác trong cùng một quy tắc; hệ thống kiểm tra tại thời điểm bấm Lưu. | Hai dòng Chặng trùng tên trong cùng quy tắc → hệ thống báo lỗi, tô đỏ các dòng vi phạm và không lưu. |
| 12 | Mỗi dòng Chặng có multi-select **4 dịch vụ được phép cấu hình**: Khai báo hải quan, Hải quan giám sát, Sang tải, Vận tải. Dịch vụ **Kho bãi không xuất hiện** trong danh sách chọn. | Dịch vụ Kho bãi xuất hiện trong multi-select của Cấu trúc Chặng → sai yêu cầu (BR-CH-23). |
| 13 | Chặng được phép **không gắn dịch vụ nào**; khi bấm Lưu mà tồn tại Chặng như vậy, hệ thống hiển thị **cảnh báo xác nhận** liệt kê tên các Chặng đó. | Hệ thống chặn tạo/sửa vì có Chặng chưa gắn dịch vụ → sai yêu cầu; ràng buộc bắt buộc tối thiểu 1 dịch vụ đã được gỡ bỏ. |
| 14 | Người dùng xác nhận trên cảnh báo → quy tắc vẫn được lưu bình thường cùng các Chặng rỗng. | Người dùng hủy cảnh báo → quay lại form để bổ sung dịch vụ, chưa lưu quy tắc. |
| 15 | Một dịch vụ chỉ xuất hiện tối đa 1 lần trong 1 Chặng và được phép xuất hiện ở nhiều Chặng khác nhau của cùng quy tắc. | Cùng một dịch vụ xuất hiện 2 lần trong cùng 1 Chặng → không được phép. |
| 16 | Trường "Mô tả quy tắc / Ghi chú" không bắt buộc, tối đa 255 ký tự. | Nhập quá 255 ký tự → hệ thống chặn nhập thêm. |
| 17 | Mã quy tắc do hệ thống tự động sinh **tại thời điểm lưu quy tắc thành công** theo cấu trúc RUL-YYMM-xxx; form Tạo mới không hiển thị trường Mã quy tắc. | Hủy form hoặc lưu thất bại → hệ thống không sinh mã và không tiêu thụ số thứ tự của tháng. |
| 18 | Thành phần xxx trong Mã quy tắc là số thứ tự quy tắc trong tháng tạo, định dạng 3 chữ số, reset về 001 khi sang tháng mới. | Sang tháng mới mà xxx vẫn tiếp nối số thứ tự của tháng trước → sai yêu cầu. |
| 19 | Quy tắc sau khi tạo thành công ở trạng thái "Đang hoạt động" và có hiệu lực ngay trên Leg Engine. | Quy tắc mới ở trạng thái Dừng hoạt động hoặc phải kích hoạt thủ công → sai yêu cầu. |
| 20 | Nút "+ Tạo mới Quy tắc" chỉ hiển thị với tài khoản có quyền "Thêm Quy tắc chặng"; server kiểm tra lại quyền tại thời điểm lưu. | Tài khoản không có quyền gọi API tạo mới → server từ chối, trả lỗi và ghi log. |

**▸ Use Case chi tiết UC\_CH\_01 — Tạo mới Quy tắc chặng hành trình**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Actor chính | Người dùng có quyền "Thêm Quy tắc chặng" |
| :---- | :---- |
| **Actor phụ** | – Leg Engine (thành phần hệ thống tiêu thụ quy tắc) – Module Quản lý danh mục (SRS\_07) — cung cấp danh mục Điểm đi/Điểm đến, Dịch vụ – Module Tài khoản & Phân quyền — cung cấp quyền chức năng |
| **Precondition** | – Đã đăng nhập và có quyền "Xem Quy tắc chặng" \+ "Thêm Quy tắc chặng" – Đang ở màn danh sách Quy tắc chặng hành trình |
| **Trigger** | Người dùng bấm nút "+ Tạo mới Quy tắc" trên thanh công cụ |
| **Luồng chính (Main flow)** | 1\. Hệ thống mở form "Tạo mới Quy tắc chặng hành trình". 2\. Người dùng nhập "Tên quy tắc". 3\. Người dùng chọn "Phạm vi thực hiện" (Quốc tế / Nội địa / Cửa khẩu). 4\. Hệ thống nạp danh sách lựa chọn của Điểm đi và Điểm đến theo ràng buộc của phạm vi vừa chọn (BR-CH-24, BR-CH-25). 5\. Người dùng chọn "Phương thức vận tải", "Loại hình vận tải", "Điểm đi" và "Điểm đến". 6\. Người dùng khai báo khối "Cấu trúc Chặng": nhập tên từng Chặng theo đúng thứ tự thực hiện; bấm "+ Thêm Chặng" để bổ sung dòng. 7\. Với mỗi Chặng, người dùng multi-select các dịch vụ được thực hiện trong Chặng đó. 8\. Người dùng nhập "Mô tả quy tắc / Ghi chú" (tùy chọn). 9\. Người dùng bấm "Lưu quy tắc". 10\. Hệ thống validate: quyền Thêm, Tên quy tắc duy nhất, tên Chặng không trùng trong quy tắc, tổ hợp (Loại hình vận tải \+ Điểm đi \+ Điểm đến) chưa tồn tại, tối thiểu 1 dòng Chặng, các trường bắt buộc. 11\. Hệ thống sinh Mã quy tắc theo cấu trúc RUL-YYMM-xxx và lưu quy tắc (Trạng thái \= Đang hoạt động). 12\. Hệ thống đóng form, làm mới danh sách và badge tổng số, hiển thị Mã quy tắc vừa sinh trong thông báo thành công. |
| **Luồng thay thế (Alternative)** | 3a. Người dùng chọn Phạm vi thực hiện \= "Cửa khẩu". 3a1. Hệ thống giới hạn cả Điểm đi và Điểm đến còn {Cửa khẩu Việt Nam, Cửa khẩu Trung Quốc}. 3a2. Người dùng chọn giá trị ở một trường → hệ thống tự cập nhật trường còn lại theo cùng giá trị (BR-CH-25). 3b. Người dùng đổi lại Phạm vi thực hiện sau khi đã chọn Điểm đi / Điểm đến. 3b1. Hệ thống xóa giá trị Điểm đi và Điểm đến đang có, nạp lại danh sách lựa chọn theo phạm vi mới (BR-CH-31). 7a. Người dùng để trống dịch vụ của một hoặc nhiều Chặng. 7a1. Khi bấm Lưu, hệ thống hiển thị cảnh báo xác nhận liệt kê tên các Chặng chưa có dịch vụ (BR-CH-17). 7a2. Người dùng xác nhận → hệ thống lưu quy tắc bình thường; hủy → quay lại form để bổ sung. 9a. Người dùng bấm "Hủy bỏ". 9a1. Hệ thống đóng form, không lưu và không sinh Mã quy tắc. |
| **Luồng ngoại lệ (Exception)** | 2a. Bỏ trống hoặc trùng "Tên quy tắc" với quy tắc khác trong hệ thống → chặn lưu, báo lỗi (BR-CH-26). 4a. Chưa chọn Phạm vi thực hiện → Điểm đi và Điểm đến bị khóa; nút Lưu vô hiệu hóa. 5a. Chọn Đường biển / Đường hàng không ở Phương thức vận tải, hoặc Hàng lẻ ở Loại hình vận tải → lựa chọn disabled, giữ nguyên giá trị mặc định. 6a. Bấm xóa dòng Chặng khi chỉ còn 1 dòng → chặn xóa, báo lỗi (BR-CH-08). 10a. Có 2 dòng Chặng trùng tên trong cùng quy tắc → chặn lưu, tô đỏ dòng vi phạm (BR-CH-29). 10b. Tổ hợp (Loại hình vận tải \+ Điểm đi \+ Điểm đến) đã tồn tại ở quy tắc khác → chặn lưu, báo lỗi kèm Mã quy tắc đang chiếm tổ hợp đó (BR-CH-02). 10c. Bỏ trống trường bắt buộc → chặn lưu, tô đỏ trường thiếu. 10d. Tài khoản không còn quyền "Thêm Quy tắc chặng" tại thời điểm lưu → server từ chối, báo lỗi phân quyền. 11a. Lỗi khi ghi dữ liệu → rollback toàn bộ, không sinh Mã quy tắc, hiển thị lỗi kỹ thuật. |
| **Postcondition** | – **Thành công:** quy tắc mới được lưu kèm Mã quy tắc vừa sinh, ở trạng thái Đang hoạt động, có hiệu lực ngay trên Leg Engine. – **Thất bại:** không lưu bản ghi nào, không sinh Mã quy tắc, form giữ nguyên dữ liệu đã nhập để người dùng sửa lại. |
| **Business Rules liên quan** | BR-CH-01, BR-CH-02, BR-CH-03, BR-CH-06, BR-CH-07, BR-CH-08, BR-CH-09, BR-CH-17, BR-CH-21, BR-CH-23, BR-CH-24, BR-CH-25, BR-CH-26, BR-CH-29, BR-CH-31 |

#### User story: Sửa Quy tắc chặng hành trình  \[PHỨC TẠP\]

| ID US | US\_CH\_03 |
| :---- | :---- |
| **Tên Story** | Sửa Quy tắc chặng hành trình |
| **User Story** | Là **người dùng có quyền sửa cấu hình chặng**, tôi muốn **chỉnh sửa một Quy tắc chặng hành trình đã có, gồm cả danh sách dịch vụ của từng Chặng**, để **cập nhật cấu hình khi nghiệp vụ thay đổi mà không phải tạo lại quy tắc mới**. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Cấu hình Chặng (Leg Configuration Engine) |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

*Các tiêu chí 1 → 16 dùng chung với US\_CH\_02 (Tạo mới Quy tắc chặng hành trình). Tiêu chí 17 → 19 chỉ áp dụng cho luồng Sửa; điểm khác biệt duy nhất về dữ liệu là trường Mã quy tắc — chỉ sinh ra ở luồng Tạo mới và không được phép chỉnh sửa.*

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| 1 | Trường "Tên quy tắc" bắt buộc điền, tối đa 150 ký tự và không trùng tên với bất kỳ quy tắc nào khác trong hệ thống (kể cả quy tắc đang Dừng hoạt động). | Bỏ trống hoặc trùng tên quy tắc khác → hệ thống báo lỗi kèm Mã quy tắc đang dùng tên đó và không lưu. |
| 2 | Trường "Phạm vi thực hiện" bắt buộc chọn, dạng dropdown 3 giá trị: **Quốc tế, Nội địa, Cửa khẩu**. | Chưa chọn Phạm vi thực hiện → trường Điểm đi và Điểm đến ở trạng thái khóa và không lưu được quy tắc. |
| 3 | Khi Phạm vi thực hiện \= "Quốc tế" hoặc "Nội địa": Điểm đi và Điểm đến chọn trong 4 giá trị — Nội địa Việt Nam, Cửa khẩu Việt Nam, Nội địa Trung Quốc, Cửa khẩu Trung Quốc. | Giá trị ngoài 4 lựa chọn trên xuất hiện trong dropdown → sai yêu cầu. |
| 4 | Khi Phạm vi thực hiện \= "Cửa khẩu": Điểm đi và Điểm đến cùng chọn trong {Cửa khẩu Việt Nam, Cửa khẩu Trung Quốc} và **luôn mang cùng một giá trị** — thay đổi ở trường nào thì trường còn lại tự cập nhật theo. | Điểm đi và Điểm đến mang 2 giá trị khác nhau khi Phạm vi \= "Cửa khẩu" → không được phép; hệ thống luôn đồng bộ hai chiều. |
| 5 | Khi Phạm vi thực hiện thay đổi, hệ thống xóa giá trị đang có của Điểm đi và Điểm đến, đồng thời nạp lại danh sách lựa chọn theo ràng buộc của phạm vi mới. | Hệ thống giữ lại giá trị Điểm đi/Điểm đến cũ sau khi đổi phạm vi → sai yêu cầu. |
| 6 | Trường "Phương thức vận tải" bắt buộc, đứng **trước** trường "Loại hình vận tải" trên form; gồm 3 giá trị: **Đường bộ** (mặc định), Đường biển và Đường hàng không (disable). | Chọn được Đường biển hoặc Đường hàng không → sai yêu cầu. |
| 7 | Trường "Loại hình vận tải" bắt buộc, gồm 2 giá trị: **Hàng nguyên** (mặc định) và **Hàng lẻ** (disable). | Chọn được Hàng lẻ → sai yêu cầu. |
| 8 | Trường "Điểm đi" và "Điểm đến" đều bắt buộc chọn ở cả 3 phạm vi. | Bỏ trống Điểm đi hoặc Điểm đến → hệ thống báo lỗi và không lưu. |
| 9 | Tổ hợp **(Phạm vi thực hiện \+ Phương thức vận tải \+ Loại hình vận tải \+ Điểm đi \+ Điểm đến)** không được trùng với bất kỳ Quy tắc chặng hành trình nào khác đã tạo trong hệ thống, không phân biệt trạng thái. | Đủ 5 trường trùng với quy tắc khác → hệ thống chặn tạo/sửa, báo lỗi kèm Mã quy tắc đang chiếm tổ hợp đó. |
| 10 | Khối "Cấu trúc Chặng" có tối thiểu 1 dòng Chặng; thứ tự dòng là thứ tự thực hiện Chặng và được hệ thống đánh số 1 → n. | Xóa dòng Chặng cuối cùng → hệ thống chặn và báo lỗi "Quy tắc phải có tối thiểu 1 Chặng". |
| 11 | Tên Chặng bắt buộc điền và không trùng với tên Chặng khác trong cùng một quy tắc; hệ thống kiểm tra tại thời điểm bấm Lưu. | Hai dòng Chặng trùng tên trong cùng quy tắc → hệ thống báo lỗi, tô đỏ các dòng vi phạm và không lưu. |
| 12 | Mỗi dòng Chặng có multi-select **4 dịch vụ được phép cấu hình**: Khai báo hải quan, Hải quan giám sát, Sang tải, Vận tải. Dịch vụ **Kho bãi không xuất hiện** trong danh sách chọn. | Dịch vụ Kho bãi xuất hiện trong multi-select của Cấu trúc Chặng → sai yêu cầu (BR-CH-23). |
| 13 | Chặng được phép **không gắn dịch vụ nào**; khi bấm Lưu mà tồn tại Chặng như vậy, hệ thống hiển thị **cảnh báo xác nhận** liệt kê tên các Chặng đó. | Hệ thống chặn tạo/sửa vì có Chặng chưa gắn dịch vụ → sai yêu cầu; ràng buộc bắt buộc tối thiểu 1 dịch vụ đã được gỡ bỏ. |
| 14 | Người dùng xác nhận trên cảnh báo → quy tắc vẫn được lưu bình thường cùng các Chặng rỗng. | Người dùng hủy cảnh báo → quay lại form để bổ sung dịch vụ, chưa lưu quy tắc. |
| 15 | Một dịch vụ chỉ xuất hiện tối đa 1 lần trong 1 Chặng và được phép xuất hiện ở nhiều Chặng khác nhau của cùng quy tắc. | Cùng một dịch vụ xuất hiện 2 lần trong cùng 1 Chặng → không được phép. |
| 16 | Trường "Mô tả quy tắc / Ghi chú" không bắt buộc, tối đa 255 ký tự. | Nhập quá 255 ký tự → hệ thống chặn nhập thêm. |
| 17 | Form Sửa hiển thị Mã quy tắc ở chế độ chỉ đọc; Mã quy tắc không được phép thay đổi dưới mọi hình thức. | Gửi yêu cầu sửa Mã quy tắc qua API → server từ chối, trả lỗi và ghi log. |
| 18 | Thay đổi sau khi lưu chỉ áp dụng cho Phiếu dịch vụ phát sinh mới; Phiếu dịch vụ đã có giữ nguyên cấu trúc Chặng đã đóng băng. | Hệ thống ghi đè cấu trúc Chặng của Phiếu dịch vụ cũ → vi phạm BR-CH-04, coi là lỗi nghiêm trọng. |
| 19 | Icon/nút "Sửa" chỉ hiển thị với tài khoản có quyền "Sửa Quy tắc chặng"; server kiểm tra lại quyền tại thời điểm lưu. | Tài khoản không có quyền gọi API cập nhật → server từ chối, trả lỗi và ghi log. |

**▸ Use Case chi tiết UC\_CH\_02 — Sửa Quy tắc chặng hành trình**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Actor chính | Người dùng có quyền "Sửa Quy tắc chặng" |
| :---- | :---- |
| **Actor phụ** | – Leg Engine – Module Quản lý danh mục (SRS\_07) – Module Tài khoản & Phân quyền |
| **Precondition** | – Quy tắc cần sửa đã tồn tại trong danh sách – Tài khoản có quyền "Xem" và "Sửa Quy tắc chặng" |
| **Trigger** | Người dùng bấm icon Sửa tại cột Thao tác, hoặc nút "Sửa" trên màn Xem chi tiết |
| **Luồng chính (Main flow)** | 1\. Hệ thống mở form "Chỉnh sửa Quy tắc \[Mã quy tắc\]", nạp sẵn dữ liệu hiện có. 2\. Hệ thống hiển thị "Mã quy tắc" ở chế độ chỉ đọc. 3\. Người dùng chỉnh các trường được phép: Tên quy tắc, Phạm vi thực hiện, Phương thức vận tải, Loại hình vận tải, Điểm đi, Điểm đến, Cấu trúc Chặng, danh sách dịch vụ từng Chặng, Ghi chú. 4\. Mỗi khi "Phạm vi thực hiện" thay đổi, hệ thống xóa giá trị Điểm đi/Điểm đến và nạp lại danh sách lựa chọn theo phạm vi mới. 5\. Người dùng bấm "Lưu quy tắc". 6\. Hệ thống validate: quyền Sửa, Tên quy tắc duy nhất, tên Chặng không trùng trong quy tắc, tổ hợp (Loại hình vận tải \+ Điểm đi \+ Điểm đến) chưa thuộc quy tắc khác, tối thiểu 1 dòng Chặng. 7\. Hệ thống lưu thay đổi, giữ nguyên Mã quy tắc, đóng form và làm mới danh sách. |
| **Luồng thay thế (Alternative)** | 3a. Người dùng chỉ sửa Ghi chú hoặc Tên quy tắc. 3a1. Hệ thống bỏ qua bước nạp lại danh sách Điểm đi/Điểm đến, lưu sau khi validate tên. 4a. Người dùng đổi Phạm vi thực hiện sang "Cửa khẩu". 4a1. Hệ thống giới hạn cả Điểm đi và Điểm đến còn 2 giá trị cửa khẩu và đồng bộ hai chiều giá trị giữa 2 trường. 4c. Người dùng bỏ hết dịch vụ của một Chặng. 4c1. Khi bấm Lưu, hệ thống hiển thị cảnh báo xác nhận liệt kê tên các Chặng chưa có dịch vụ; xác nhận thì vẫn lưu (BR-CH-17). 5a. Người dùng bấm "Hủy bỏ". 5a1. Hệ thống đóng form, không lưu thay đổi nào. |
| **Luồng ngoại lệ (Exception)** | 6a. Trùng "Tên quy tắc" với quy tắc khác trong hệ thống → chặn lưu (BR-CH-26). 6b. Có 2 dòng Chặng trùng tên trong cùng quy tắc → chặn lưu, tô đỏ dòng vi phạm (BR-CH-29). 6c. Tổ hợp (Loại hình vận tải \+ Điểm đi \+ Điểm đến) trùng với quy tắc khác → chặn lưu, báo lỗi (BR-CH-02). 6d. Xóa dòng Chặng cuối cùng → chặn xóa (BR-CH-08). 6e. Bỏ trống trường bắt buộc → chặn lưu, báo lỗi từng trường. 6g. Tài khoản không còn quyền "Sửa Quy tắc chặng" tại thời điểm lưu → server từ chối, báo lỗi phân quyền. 7a. Lỗi hệ thống khi ghi dữ liệu → rollback toàn bộ, không cập nhật một phần. |
| **Postcondition** | – **Thành công:** quy tắc được cập nhật (Mã quy tắc giữ nguyên), có hiệu lực ngay cho Phiếu dịch vụ mới; Phiếu dịch vụ cũ giữ nguyên cấu trúc Chặng đã đóng băng. – **Thất bại:** không thay đổi dữ liệu, form giữ nguyên để sửa lại. |
| **Business Rules liên quan** | BR-CH-01, BR-CH-02, BR-CH-03, BR-CH-04, BR-CH-07, BR-CH-08, BR-CH-17, BR-CH-23, BR-CH-24, BR-CH-25, BR-CH-26, BR-CH-29, BR-CH-31 |

#### User story: Xem chi tiết Quy tắc chặng hành trình

| ID US | US\_CH\_04 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết Quy tắc chặng hành trình |
| **User Story** | Là **người dùng có quyền xem cấu hình chặng**, tôi muốn **xem toàn bộ thông tin chi tiết của một Quy tắc chặng hành trình ở chế độ chỉ đọc**, để **rà soát cấu hình đầy đủ trước khi quyết định sửa, vô hiệu hóa hay xóa quy tắc đó**. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Cấu hình Chặng (Leg Configuration Engine) |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| 1 | Màn Xem chi tiết ở chế độ chỉ đọc; không cho phép chỉnh sửa trực tiếp bất kỳ trường nào. | Trường bất kỳ trên màn chi tiết cho phép nhập/chọn → sai yêu cầu. |
| 2 | Khối "Thông tin chung" hiển thị đủ theo thứ tự: Mã quy tắc, Tên quy tắc, Phạm vi thực hiện, **Phương thức vận tải**, **Loại hình vận tải**, Điểm đi, Điểm đến, Trạng thái, Mô tả/Ghi chú. | Phương thức vận tải hiển thị sau Loại hình vận tải → sai thứ tự yêu cầu. |
| 3 | Khối "Cấu trúc Chặng" hiển thị các Chặng theo đúng thứ tự 1 → n, mỗi Chặng kèm chip danh sách dịch vụ đã cấu hình. | Thứ tự Chặng hiển thị khác thứ tự khai báo → sai yêu cầu (BR-CH-07). |
| 4 | Chặng không có dịch vụ nào hiển thị **badge cảnh báo "Không có dịch vụ nào trong chặng này"** thay cho khu vực chip dịch vụ. | Chặng rỗng hiển thị khu vực chip trống, không có badge cảnh báo → sai yêu cầu (BR-CH-32). |
| 5 | Màn chi tiết có các nút: Sửa, **Vô hiệu hóa / Kích hoạt**, Xóa và Quay lại; mỗi nút hiển thị theo quyền tương ứng của tài khoản. | Tài khoản chỉ có quyền Xem → toàn bộ nút thao tác không hiển thị hoặc ở trạng thái disable. |
| 6 | Chỉ hiển thị nút **"Vô hiệu hóa"** khi quy tắc đang ở trạng thái **Đang hoạt động**; chỉ hiển thị nút **"Kích hoạt"** khi quy tắc đang ở trạng thái **Dừng hoạt động**. | Hiển thị đồng thời cả 2 nút, hoặc hiển thị nút không khớp trạng thái → sai yêu cầu (BR-CH-38). |
| 7 | Nút "Xóa" trên màn chi tiết chỉ khả dụng với quy tắc chưa có Phiếu dịch vụ nào sử dụng. | Quy tắc đã có Phiếu dịch vụ áp dụng → nút Xóa ở trạng thái disable kèm tooltip "Quy tắc đã được sử dụng trong Phiếu dịch vụ, chỉ có thể Vô hiệu hóa". |
| 8 | Quy tắc ở trạng thái Dừng hoạt động vẫn xem được chi tiết đầy đủ và vẫn thao tác Sửa được. | Màn chi tiết chặn truy cập với quy tắc đã Dừng hoạt động → sai yêu cầu. |

#### User story: Kích hoạt / Vô hiệu hóa Quy tắc chặng hành trình

| ID US | US\_CH\_05 |
| :---- | :---- |
| **Tên Story** | Kích hoạt / Vô hiệu hóa Quy tắc chặng hành trình |
| **User Story** | Là **người dùng có quyền kích hoạt/vô hiệu hóa cấu hình chặng**, tôi muốn **bật hoặc tạm ngừng một Quy tắc chặng hành trình**, để **điều chỉnh bộ quy tắc đang chạy mà vẫn bảo toàn dữ liệu lịch sử của các Phiếu dịch vụ đã phát sinh**. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Cấu hình Chặng (Leg Configuration Engine) |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| 1 | Quy tắc có đúng 2 trạng thái: **"Đang hoạt động"** và **"Dừng hoạt động"**. | Xuất hiện trạng thái thứ ba, hoặc còn dùng nhãn cũ "Áp dụng"/"Vô hiệu hóa" làm giá trị trạng thái → sai yêu cầu. |
| 2 | Thao tác **Vô hiệu hóa** chỉ khả dụng với quy tắc đang ở trạng thái "Đang hoạt động"; sau khi thực hiện, quy tắc chuyển sang "Dừng hoạt động". | Nút/icon Vô hiệu hóa hiển thị với quy tắc đang "Dừng hoạt động" → sai yêu cầu. |
| 3 | Thao tác **Kích hoạt** chỉ khả dụng với quy tắc đang ở trạng thái "Dừng hoạt động"; sau khi thực hiện, quy tắc chuyển về "Đang hoạt động". | Nút/icon Kích hoạt hiển thị với quy tắc đang "Đang hoạt động" → sai yêu cầu. |
| 4 | Cả hai thao tác đều có popup xác nhận trước khi đổi trạng thái. | Hủy popup xác nhận → trạng thái giữ nguyên, không thay đổi dữ liệu. |
| 5 | Cả hai thao tác dùng chung một quyền: **"Kích hoạt/Vô hiệu hóa Quy tắc chặng"**, tách riêng khỏi quyền Sửa; server kiểm tra lại quyền tại thời điểm thực thi. | Tài khoản chỉ có quyền Sửa nhưng vẫn đổi được trạng thái → sai yêu cầu (BR-CH-01). |
| 6 | Quy tắc ở trạng thái Dừng hoạt động không được Leg Engine sử dụng cho Phiếu dịch vụ mới nhưng vẫn hiển thị trong danh sách. | Leg Engine hoặc modal Mô phỏng thử vẫn khớp quy tắc đã Dừng hoạt động → sai yêu cầu. |
| 7 | Vô hiệu hóa là soft-disable: dữ liệu quy tắc được giữ nguyên và cấu trúc Chặng đã đóng băng trên Phiếu dịch vụ cũ không bị ảnh hưởng. | Thao tác vô hiệu hóa làm thay đổi dữ liệu Phiếu dịch vụ cũ → vi phạm BR-CH-04. |
| 8 | Việc kích hoạt lại một quy tắc phải thỏa điều kiện kiểm tra trùng tại thời điểm kích hoạt. | Kích hoạt lại gây trùng đủ 5 trường với quy tắc khác → hệ thống chặn và báo lỗi kèm Mã quy tắc đang chiếm tổ hợp đó. |
| 9 | Badge tổng số "Đang hoạt động: n/m Quy tắc" được cập nhật ngay sau khi đổi trạng thái. | Badge không đổi sau thao tác → sai yêu cầu. |

#### User story: Xóa Quy tắc chặng hành trình

| ID US | US\_CH\_06 |
| :---- | :---- |
| **Tên Story** | Xóa Quy tắc chặng hành trình |
| **User Story** | Là **người dùng có quyền xóa cấu hình chặng**, tôi muốn **xóa một Quy tắc chặng hành trình chưa được Phiếu dịch vụ nào sử dụng**, để **dọn sạch các quy tắc khai báo nhầm mà không ảnh hưởng dữ liệu đã phát sinh**. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Cấu hình Chặng (Leg Configuration Engine) |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| 1 | Chức năng Xóa khả dụng ở cả màn danh sách (icon Xóa tại cột Thao tác) và màn Xem chi tiết (nút "Xóa"). | Chỉ có 1 trong 2 điểm truy cập → sai yêu cầu (BR-CH-30). |
| 2 | Chỉ quy tắc **chưa có Phiếu dịch vụ nào sử dụng** mới được phép xóa; quy tắc đã được áp dụng chỉ có thể Vô hiệu hóa. | Gọi API xóa với quy tắc đã có Phiếu dịch vụ sử dụng → server từ chối, trả lỗi và ghi log. |
| 3 | Thao tác xóa luôn hiển thị popup xác nhận nêu rõ hành động không thể khôi phục; chỉ thực hiện xóa sau khi người dùng xác nhận. | Hủy popup xác nhận → quy tắc được giữ nguyên, không có thay đổi dữ liệu. |
| 4 | Điều kiện được phép xóa được kiểm tra lại ở phía server tại thời điểm thực thi lệnh. | Quy tắc vừa được một Phiếu dịch vụ mới sử dụng trong lúc người dùng đang mở màn → server chặn xóa và thông báo rõ lý do. |
| 5 | Thao tác xóa yêu cầu quyền "Xóa Quy tắc chặng"; server kiểm tra lại quyền tại thời điểm thực thi. | Tài khoản không có quyền gọi API xóa → server từ chối, trả lỗi và ghi log. |
| 6 | Sau khi xóa thành công, danh sách và badge tổng số được cập nhật ngay. | Xóa thất bại → danh sách giữ nguyên, hệ thống hiển thị thông báo lỗi. |

#### User story: Mô phỏng thử cấu trúc Chặng (Leg Engine Simulator)  \[PHỨC TẠP\]

| ID US | US\_CH\_07 |
| :---- | :---- |
| **Tên Story** | Mô phỏng thử cấu trúc Chặng (Leg Engine Simulator) |
| **User Story** | Là **người dùng có quyền xem cấu hình chặng**, tôi muốn **mô phỏng thử bộ quy tắc bằng Điểm đi/Điểm đến thực tế**, để **kiểm chứng hệ thống chọn đúng quy tắc và sinh đúng cấu trúc Chặng trước khi áp dụng cho Phiếu dịch vụ thật**. |
| **Độ Ưu tiên (MoSCoW)** | Should have |
| **Module** | Cấu hình Chặng (Leg Configuration Engine) |
| **Người Phụ trách (Owner)** | Trang BA |

**Acceptance Criteria**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| ----- | ----- | ----- |
| 1 | Leg Engine Simulator được mở dạng modal từ nút "Mô phỏng thử" trên thanh công cụ của màn danh sách. | Chưa có quy tắc nào ở trạng thái Đang hoạt động → modal hiển thị "Không có quy tắc phù hợp", không đưa kết quả suy đoán. |
| 2 | Thông số đầu vào gồm: **Phương thức vận tải**, **Loại hình vận tải**, Điểm đi và Điểm đến (Phương thức vận tải đứng trước Loại hình vận tải). Trường "Phạm vi thực hiện" không phải input — hệ thống tự suy ra từ Điểm đi/Điểm đến. | Modal thiếu ô nhập Phương thức vận tải, hoặc còn ô nhập Phạm vi thực hiện → sai yêu cầu. |
| 3 | Điểm đi và Điểm đến mỗi trường có radio box 2 lựa chọn: **Địa chỉ** hoặc **Cửa khẩu**. | Chưa chọn radio box → các trường con bên dưới ở trạng thái khóa. |
| 4 | Chọn radio "Địa chỉ" → hiển thị lần lượt 4 trường con: Quốc gia, Tỉnh/Thành phố, Phường/Xã, Địa chỉ cụ thể. | Chưa chọn Quốc gia → các trường Tỉnh/Thành phố và Phường/Xã ở trạng thái khóa. |
| 5 | Chọn radio "Cửa khẩu" → hiển thị 1 trường select Cửa khẩu, lấy dữ liệu từ danh mục Cửa khẩu. | Đổi radio box → hệ thống xóa giá trị các trường con của lựa chọn trước đó. |
| 6 | Hệ thống chọn tự động Quy tắc chặng theo đúng 3 bước: (1) quy đổi Điểm đi/Điểm đến thực tế về giá trị danh mục theo mục 3.1.2.5; (2) suy ra Phạm vi thực hiện theo mục 3.1.2.6; (3) tìm quy tắc **Đang hoạt động** khớp đủ 5 trường **(Phạm vi thực hiện \+ Phương thức vận tải \+ Loại hình vận tải \+ Điểm đi \+ Điểm đến)**. | Không có quy tắc nào khớp đủ 5 trường → hiển thị cảnh báo, không hiển thị Mã quy tắc hay kết quả suy đoán. |
| 7 | Chỉ các quy tắc ở trạng thái **Đang hoạt động** được đưa vào tập tra cứu; quy tắc Dừng hoạt động bị loại khỏi phép so khớp. | Tổ hợp input chỉ khớp một quy tắc đang Dừng hoạt động → hệ thống báo "Không có quy tắc phù hợp", không chọn quy tắc đó. |
| 8 | Kết quả so khớp là duy nhất: tối đa 1 quy tắc được chọn cho một bộ thông tin đầu vào. | Phát hiện từ 2 quy tắc Đang hoạt động cùng khớp (dữ liệu lỗi) → hiển thị cảnh báo liệt kê các Mã quy tắc, KHÔNG tự chọn 1 quy tắc. |
| 9 | Panel kết quả hiển thị Phạm vi thực hiện được suy ra, Mã quy tắc đã khớp và tổng số Chặng. | Panel còn hiển thị dòng "Lý do sinh chặng" → sai yêu cầu, nội dung này đã được gỡ bỏ. |
| 10 | Mỗi Chặng trong kết quả hiển thị số thứ tự, tên Chặng, Điểm đi → Điểm đến và danh sách "Dịch vụ thuộc Chặng này (n)" lấy từ cấu hình dịch vụ của chính Chặng đó. | Thứ tự Chặng hiển thị khác thứ tự khai báo trong quy tắc → sai yêu cầu (BR-CH-07). |
| 11 | **Điểm đi của Chặng 1** bằng Điểm đi của dịch vụ mô phỏng. Nếu Điểm đi của dịch vụ là một **Cửa khẩu** thì Chặng 1 có Điểm đi \= Điểm đến (cùng cửa khẩu đó). | Chặng 1 có Điểm đi khác Điểm đi của dịch vụ, hoặc Điểm đi là cửa khẩu nhưng Chặng 1 lại có Điểm đi ≠ Điểm đến → sai yêu cầu (BR-CH-40). |
| 12 | **Điểm đến của Chặng cuối cùng** bằng Điểm đến của dịch vụ mô phỏng. Nếu Điểm đến của dịch vụ là một **Cửa khẩu** thì Chặng cuối có Điểm đi \= Điểm đến (cùng cửa khẩu đó). | Chặng cuối có Điểm đến khác Điểm đến của dịch vụ, hoặc Điểm đến là cửa khẩu nhưng Chặng cuối lại có Điểm đi ≠ Điểm đến → sai yêu cầu (BR-CH-40). |
| 13 | Các Chặng nối tiếp liên tục: Điểm đến của Chặng n là Điểm đi của Chặng n+1. | Xuất hiện khoảng đứt giữa 2 Chặng liền kề (Điểm đến Chặng n ≠ Điểm đi Chặng n+1) → cấu trúc Chặng không liền mạch. |
| 14 | Khối 5 checkbox dịch vụ hoạt động như **bộ lọc hiển thị kết quả**: bỏ tick một dịch vụ thì chip dịch vụ đó bị ẩn khỏi các Chặng, không ảnh hưởng tới việc chọn quy tắc. | Thay đổi bộ lọc dịch vụ làm hệ thống chọn quy tắc khác → sai yêu cầu. |
| 15 | Khi tick dịch vụ **Kho bãi**, hệ thống hiển thị dịch vụ này trong **Chặng 1** của kết quả — đúng với cách Leg Engine gán Kho bãi trên Phiếu dịch vụ thật. | Kho bãi hiển thị ở Chặng khác Chặng 1 → sai yêu cầu (BR-CH-36). |
| 16 | Chặng không còn dịch vụ nào hiển thị badge **"Không có dịch vụ nào trong chặng này"**, kèm ghi chú Chặng đó sẽ bị ẩn trên Phiếu dịch vụ. | Chặng rỗng vẫn hiển thị như Chặng bình thường, không có badge và không có ghi chú → sai yêu cầu (BR-CH-37). |
| 17 | Mọi thao tác trong modal Mô phỏng thử không ghi bất kỳ dữ liệu nào vào hệ thống. | Phát sinh bản ghi Phiếu dịch vụ hoặc Chặng trong CSDL → lỗi nghiêm trọng. |

**▸ Use Case chi tiết UC\_CH\_03 — Mô phỏng thử cấu trúc Chặng bằng Leg Engine Simulator**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Actor chính | Người dùng có quyền "Xem Quy tắc chặng" |
| :---- | :---- |
| **Actor phụ** | – Leg Engine (dùng chung engine với luồng thật) – Module Quản lý danh mục (SRS\_07) — danh mục Cửa khẩu và Đơn vị hành chính – Danh sách Quy tắc chặng hành trình Đang hoạt động |
| **Precondition** | – Có ít nhất 1 Quy tắc chặng hành trình đang ở trạng thái Đang hoạt động – Đang ở màn danh sách Quy tắc chặng hành trình |
| **Trigger** | Người dùng bấm nút "Mô phỏng thử" trên thanh công cụ |
| **Luồng chính (Main flow)** | 1\. Hệ thống mở modal Leg Engine Simulator. 2\. Người dùng chọn "Phương thức vận tải" và "Loại hình vận tải". 3\. Người dùng chọn radio box cho Điểm đi: "Địa chỉ" hoặc "Cửa khẩu", sau đó nhập các trường con tương ứng. 4\. Người dùng chọn radio box và nhập các trường con tương ứng cho Điểm đến. 5\. Hệ thống quy đổi Điểm đi/Điểm đến thực tế về giá trị danh mục theo bảng tại mục 3.1.2.5. 6\. Hệ thống suy ra Phạm vi thực hiện theo bảng tại mục 3.1.2.6. 7\. Hệ thống tra bộ Quy tắc chặng hành trình Đang hoạt động và tìm quy tắc khớp theo tổ hợp (Phạm vi thực hiện \+ Phương thức vận tải \+ Loại hình vận tải \+ Điểm đi \+ Điểm đến). 8\. Hệ thống sinh danh sách Chặng theo đúng thứ tự khai báo của quy tắc khớp, kèm dịch vụ của từng Chặng. 9\. Hệ thống gán Điểm đi/Điểm đến cho từng Chặng theo quy tắc tại mục 3.1.2.7 (BR-CH-40). 10\. Hệ thống hiển thị panel kết quả: Phạm vi thực hiện suy ra, Mã quy tắc khớp, tổng số Chặng và card từng Chặng. 11\. Người dùng đối chiếu kết quả với kỳ vọng nghiệp vụ; nếu sai, đóng modal và chỉnh lại quy tắc. |
| **Luồng thay thế (Alternative)** | 3a. Người dùng chọn radio "Địa chỉ" cho Điểm đi. 3a1. Hệ thống hiển thị 4 trường con: Quốc gia, Tỉnh/Thành phố, Phường/Xã, Địa chỉ cụ thể. 3b. Người dùng chọn radio "Cửa khẩu" cho Điểm đi. 3b1. Hệ thống hiển thị 1 select Cửa khẩu lấy từ danh mục Cửa khẩu. 3c. Người dùng đổi radio box sau khi đã nhập trường con. 3c1. Hệ thống xóa toàn bộ giá trị đã nhập của lựa chọn trước và hiển thị bộ trường con mới. 9a. Người dùng bỏ tick một số dịch vụ ở khối bộ lọc. 9a1. Hệ thống ẩn chip của các dịch vụ bị bỏ tick khỏi từng Chặng; kết quả chọn quy tắc không thay đổi. 9b. Người dùng bấm link "Mặc định". 9b1. Hệ thống reset toàn bộ thông số đầu vào và bộ lọc về giá trị mặc định. |
| **Luồng ngoại lệ (Exception)** | 5a. Chưa nhập đủ trường con của Điểm đi hoặc Điểm đến → hệ thống chưa chạy mô phỏng, hiển thị hướng dẫn nhập tiếp. 7a. Không có quy tắc nào khớp tổ hợp input → hiển thị cảnh báo "Không có quy tắc phù hợp với tổ hợp input hiện tại", panel kết quả để trống. 7b. Có nhiều hơn 1 quy tắc Đang hoạt động cùng khớp (dữ liệu lỗi) → hiển thị cảnh báo và liệt kê các Mã quy tắc, không tự chọn 1 quy tắc. 7c. Tổ hợp input chỉ khớp quy tắc đang ở trạng thái Dừng hoạt động → hệ thống báo "Không có quy tắc phù hợp", không dùng quy tắc đó. 8a. Quy tắc khớp chỉ có 1 Chặng → Chặng đó vừa là Chặng đầu vừa là Chặng cuối, áp dụng đồng thời cả 2 quy tắc tại BR-CH-40. 9c. Bỏ tick toàn bộ 5 dịch vụ ở bộ lọc → các Chặng hiển thị không có chip dịch vụ nào, kèm ghi chú do bộ lọc đang ẩn. |
| **Postcondition** | – **Thành công:** hiển thị đúng Phạm vi suy ra, quy tắc khớp và cấu trúc Chặng; không phát sinh bất kỳ thay đổi dữ liệu nào. – **Thất bại:** hiển thị cảnh báo lý do không chọn được quy tắc, không đưa ra kết quả suy đoán. |
| **Business Rules liên quan** | BR-CH-06, BR-CH-07, BR-CH-20, BR-CH-23, BR-CH-33, BR-CH-34, BR-CH-40 |

### 3.1.2. Mô tả giao diện

**Link UI Design:** [Figma](https://www.figma.com/design/beRlCqCuYM8LeOQm4fSbo3/LogXPro?node-id=11546-66794&t=ATqlbJwTPe75o7Am-0)

**a) Màn danh sách Quy tắc chặng hành trình**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Cột Mã quy tắc |  | Text (readonly) | 13 | — | Cấu trúc RUL-YYMM-xxx, do hệ thống sinh khi tạo quy tắc thành công |
| Cột Tên quy tắc |  | Text | 150 | — | Tên do người dùng đặt, duy nhất trong toàn hệ thống |
| Cột Phạm vi |  | Text | — | — | Quốc tế / Nội địa / Cửa khẩu |
| Cột Phương thức vận tải |  | Text | — | — | Đứng TRƯỚC cột Loại hình vận tải. Đường bộ / Đường biển / Đường hàng không |
| Cột Loại hình vận tải |  | Text | — | — | Hàng nguyên / Hàng lẻ |
| Cột Điểm đi / Điểm đến |  | Text | — | — | Giá trị danh mục địa điểm. Khi Phạm vi \= Cửa khẩu, hai cột mang cùng một giá trị |
| Cột Thành phần |  | Badge (suy diễn) | — | — | Chỉ hiển thị số Chặng của quy tắc, dạng "n Chặng". Không hiển thị số dịch vụ |
| Cột Trạng thái |  | Badge | — | — | Đang hoạt động / Dừng hoạt động |
| Cột Thao tác |  | Icon | — | — | Hiển thị theo quyền của tài khoản: – Xem chi tiết (quyền Xem) – Sửa (quyền Sửa) – Kích hoạt/Vô hiệu hóa (quyền Kích hoạt/Vô hiệu hóa) – Xóa (quyền Xóa) Icon đổi trạng thái hiển thị theo trạng thái hiện tại của quy tắc |
| Ô tìm kiếm |  | Text | 100 | (trống) | Chỉ tìm theo Mã quy tắc và Tên quy tắc |
| Bộ lọc Phạm vi |  | Dropdown | — | Tất cả | Tất cả / Quốc tế / Nội địa / Cửa khẩu |
| Bộ lọc Phương thức vận tải |  | Dropdown | — | Tất cả | Tất cả / Đường bộ (Đường biển, Đường hàng không disabled) |
| Bộ lọc Loại hình vận tải |  | Dropdown | — | Tất cả | Tất cả / Hàng nguyên (Hàng lẻ disabled) |
| Bộ lọc Điểm đi |  | Dropdown | — | Tất cả | Lấy động từ danh mục địa điểm |
| Bộ lọc Điểm đến |  | Dropdown | — | Tất cả | Lấy động từ danh mục địa điểm |
| Bộ lọc Trạng thái |  | Dropdown | — | Tất cả | Tất cả / Đang hoạt động / Dừng hoạt động |
| Nút "+ Tạo mới Quy tắc" |  | Nút | — | — | Chỉ hiển thị với tài khoản có quyền Thêm Quy tắc chặng |
| Nút "Mô phỏng thử" |  | Nút | — | — | Mở modal Leg Engine Simulator |
| Badge tổng số |  | Text (readonly) | — | — | Hiển thị "Đang hoạt động: n/m Quy tắc" |

**b) Form Tạo mới / Chỉnh sửa Quy tắc chặng hành trình**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Mã quy tắc |  | Text (readonly) | 13 | Do hệ thống sinh | **Form Tạo mới: không hiển thị trường này** — mã chỉ được sinh khi lưu quy tắc thành công. **Form Sửa:** hiển thị ở chế độ chỉ đọc |
| Tên quy tắc | v | Text | 150 | (trống) | Bắt buộc; duy nhất trong toàn hệ thống, kể cả so với quy tắc đang Dừng hoạt động (BR-CH-26) |
| Phạm vi thực hiện | v | Dropdown | — | (trống) | 3 giá trị: **Quốc tế, Nội địa, Cửa khẩu**. Phải chọn ĐẦU TIÊN — chi phối danh sách lựa chọn của Điểm đi và Điểm đến |
| Phương thức vận tải | v | Dropdown | — | Đường bộ | Đứng TRƯỚC trường Loại hình vận tải. 3 giá trị: Đường bộ (khả dụng), Đường biển và Đường hàng không (disabled). Là thành phần của bộ khóa kiểm tra trùng (BR-CH-02, BR-CH-35) |
| Loại hình vận tải | v | Dropdown | — | Hàng nguyên | 2 giá trị: Hàng nguyên (khả dụng, mặc định) và Hàng lẻ (disabled kèm ghi chú "Chưa hỗ trợ trong phạm vi hiện tại") |
| Điểm đi | v | Dropdown | — | (trống) | Phạm vi \= Quốc tế / Nội địa → 4 lựa chọn: Nội địa Việt Nam, Cửa khẩu Việt Nam, Nội địa Trung Quốc, Cửa khẩu Trung Quốc. Phạm vi \= Cửa khẩu → 2 lựa chọn cửa khẩu, đồng bộ hai chiều với Điểm đến |
| Điểm đến | v | Dropdown | — | (trống) | Phạm vi \= Quốc tế / Nội địa → 4 lựa chọn giống Điểm đi. Phạm vi \= Cửa khẩu → 2 lựa chọn cửa khẩu và luôn bằng Điểm đi; đổi ở trường nào thì trường còn lại tự cập nhật theo |
| Cấu trúc Chặng — Tên Chặng | v | Danh sách dòng động | 100 / dòng | 1 dòng trống | Thứ tự dòng \= thứ tự thực hiện Chặng. Tên Chặng không được trùng nhau trong cùng một quy tắc (BR-CH-29). Nút "+ Thêm Chặng" thêm dòng ở cuối; tối thiểu 1 dòng |
| Cấu trúc Chặng — Dịch vụ của Chặng |  | Multi-select | — | (chưa chọn) | Chọn dịch vụ trong 4 dịch vụ được phép cấu hình: Khai báo hải quan, Hải quan giám sát, Sang tải, Vận tải. KHÔNG bắt buộc — Chặng được phép để trống; hệ thống chỉ hiển thị cảnh báo xác nhận khi Lưu (BR-CH-17). Dịch vụ Kho bãi KHÔNG có trong danh sách chọn (BR-CH-23) |
| Mô tả quy tắc / Ghi chú |  | Textarea | 255 | (trống) | Diễn giải chi tiết trường hợp áp dụng của quy tắc |
| Trạng thái |  | Badge | — | Đang hoạt động | Đang hoạt động / Dừng hoạt động — đổi qua icon trên danh sách hoặc nút trên màn chi tiết, không có trong form |

**c) Màn Xem chi tiết Quy tắc chặng hành trình**

*Màn hình chưa có thiết kế giao diện. Đặc tả thành phần như bảng dưới;*

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Khối Thông tin chung |  | Read-only | — | — | Mã quy tắc, Tên quy tắc, Phạm vi thực hiện, Phương thức vận tải, Loại hình vận tải, Điểm đi, Điểm đến, Trạng thái, Mô tả/Ghi chú |
| Khối Cấu trúc Chặng |  | Read-only | — | — | Card từng Chặng theo thứ tự 1 → n: số thứ tự, tên Chặng, chip danh sách dịch vụ đã cấu hình |
| Badge cảnh báo Chặng rỗng |  | Badge (readonly) | — | — | Chặng không có dịch vụ nào hiển thị badge cảnh báo "Không có dịch vụ nào trong chặng này" thay cho khu vực chip dịch vụ (BR-CH-32) |
| Nút "Sửa" |  | Nút | — | — | Chuyển sang form chỉnh sửa; chỉ hiển thị với tài khoản có quyền Sửa |
| Nút "Vô hiệu hóa" |  | Nút | — | — | CHỈ hiển thị khi quy tắc đang ở trạng thái "Đang hoạt động"; yêu cầu quyền Kích hoạt/Vô hiệu hóa. Có popup xác nhận (BR-CH-38) |
| Nút "Kích hoạt" |  | Nút | — | — | CHỈ hiển thị khi quy tắc đang ở trạng thái "Dừng hoạt động"; yêu cầu quyền Kích hoạt/Vô hiệu hóa. Có popup xác nhận (BR-CH-38) |
| Nút "Xóa" |  | Nút | — | — | Xóa vĩnh viễn quy tắc đang xem sau bước xác nhận; chỉ hiển thị với tài khoản có quyền Xóa và chỉ khả dụng khi quy tắc chưa có Phiếu dịch vụ nào sử dụng (BR-CH-22, BR-CH-30) |
| Nút "Quay lại" |  | Nút | — | — | Đóng màn chi tiết, quay về danh sách |

**d) Modal Mô phỏng thử — Leg Engine Simulator**

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Phương thức vận tải | v | Dropdown | — | Đường bộ | Đứng TRƯỚC Loại hình vận tải; đồng bộ danh sách giá trị với form Quy tắc chặng |
| Loại hình vận tải | v | Dropdown | — | Hàng nguyên | Đồng bộ danh sách giá trị với form Quy tắc chặng |
| Điểm đi — Loại địa điểm | v | Radio box | — | Địa chỉ | 2 lựa chọn: **Địa chỉ** hoặc **Cửa khẩu**; quyết định bộ trường con hiển thị bên dưới |
| Điểm đi — Quốc gia | v | Dropdown | — | (trống) | Chỉ hiển thị khi chọn radio "Địa chỉ". Việt Nam / Trung Quốc |
| Điểm đi — Tỉnh/Thành phố | v | Dropdown | — | (trống) | Chỉ hiển thị khi chọn radio "Địa chỉ"; lọc theo Quốc gia đã chọn |
| Điểm đi — Phường/Xã | v | Dropdown | — | (trống) | Chỉ hiển thị khi chọn radio "Địa chỉ"; lọc theo Tỉnh/Thành phố đã chọn |
| Điểm đi — Địa chỉ cụ thể | v | Text | 255 | (trống) | Chỉ hiển thị khi chọn radio "Địa chỉ" |
| Điểm đi — Cửa khẩu | v | Dropdown | — | (trống) | Chỉ hiển thị khi chọn radio "Cửa khẩu"; lấy từ danh mục Cửa khẩu (kèm quốc gia của cửa khẩu) |
| Điểm đến — bộ trường tương ứng | v | Radio box \+ trường con | — | Địa chỉ | Cấu trúc và ràng buộc giống hệt nhóm trường Điểm đi |
| Bộ lọc Dịch vụ |  | Checkbox list | — | Tick đủ 5 dịch vụ | Đủ 5 dịch vụ, gồm cả Kho bãi. Chỉ lọc hiển thị chip dịch vụ trong kết quả; KHÔNG ảnh hưởng tới việc chọn quy tắc (BR-CH-34). Tick Kho bãi → hiển thị dịch vụ này trong Chặng 1 (BR-CH-36) |
| Link "Mặc định" |  | Link | — | — | Reset toàn bộ thông số đầu vào và bộ lọc về giá trị mặc định |
| Panel kết quả |  | Panel (readonly) | — | — | Phạm vi thực hiện suy ra \+ Mã quy tắc khớp \+ tổng số Chặng (KHÔNG còn dòng "Lý do sinh chặng"). Card từng Chặng: số thứ tự, tên Chặng, Điểm đi → Điểm đến (theo BR-CH-40) và chip "Dịch vụ thuộc Chặng này (n)". Chặng không còn dịch vụ nào → badge "Không có dịch vụ nào trong chặng này" \+ ghi chú Chặng sẽ bị ẩn trên Phiếu dịch vụ (BR-CH-37) |

#### 3.1.2.1. Quy ước sinh Mã quy tắc

Cấu trúc mã: **RUL-YYMM-xxx**

| Thành phần | Ý nghĩa | Quy ước | Ví dụ |
| ----- | ----- | ----- | ----- |
| RUL | Viết tắt của Rule — cố định cho mọi Quy tắc chặng hành trình | Chuỗi cố định, viết hoa | RUL |
| YYMM | Năm – tháng tạo quy tắc | 2 chữ số năm \+ 2 chữ số tháng | Tháng 09/2026 → 2609 |
| xxx | Số thứ tự quy tắc trong tháng tạo | MAX(STT của cùng YYMM) \+ 1, định dạng 3 chữ số. Reset về 001 khi sang tháng mới | Quy tắc thứ 7 của tháng → 007 |
| Thời điểm sinh mã | Mã chỉ tồn tại khi quy tắc đã được lưu | Hệ thống sinh mã **tại thời điểm lưu quy tắc thành công**. Form Tạo mới không hiển thị trường Mã quy tắc | RUL-2609-007 |

#### 3.1.2.2. Ràng buộc giữa Phạm vi thực hiện và Điểm đi / Điểm đến

Phạm vi thực hiện phải được chọn đầu tiên; hệ thống nạp danh sách lựa chọn của Điểm đi và Điểm đến theo bảng dưới.

| Phạm vi thực hiện | Danh sách chọn của Điểm đi | Danh sách chọn của Điểm đến | Ràng buộc bổ sung |
| ----- | ----- | ----- | ----- |
| Quốc tế | 4 giá trị: – Nội địa Việt Nam – Cửa khẩu Việt Nam – Nội địa Trung Quốc – Cửa khẩu Trung Quốc | Giống Điểm đi (4 giá trị) | Không ràng buộc thêm; người dùng tự chọn cặp Điểm đi – Điểm đến |
| Nội địa | 4 giá trị: – Nội địa Việt Nam – Cửa khẩu Việt Nam – Nội địa Trung Quốc – Cửa khẩu Trung Quốc | Giống Điểm đi (4 giá trị) | Không ràng buộc thêm; người dùng tự chọn cặp Điểm đi – Điểm đến |
| Cửa khẩu | 2 giá trị: – Cửa khẩu Việt Nam – Cửa khẩu Trung Quốc | 2 giá trị: – Cửa khẩu Việt Nam – Cửa khẩu Trung Quốc | Điểm đi LUÔN bằng Điểm đến. Chọn hoặc đổi giá trị ở một trường thì trường còn lại tự cập nhật theo (đồng bộ hai chiều) |
| (Khi đổi Phạm vi) | Hệ thống xóa giá trị đang có và nạp lại danh sách theo phạm vi mới | Hệ thống xóa giá trị đang có và nạp lại danh sách theo phạm vi mới | BR-CH-31 — áp dụng cho cả luồng Tạo mới và luồng Sửa |

#### 3.1.2.3. Bảng giá trị "Phương thức vận tải" và "Loại hình vận tải"

**a) Phương thức vận tải — đứng trước Loại hình vận tải trên mọi màn hình**

| Giá trị hiển thị | Ý nghĩa | Trạng thái trong Sprint hiện tại |
| ----- | ----- | ----- |
| Đường bộ | Vận chuyển bằng phương tiện đường bộ (xe tải, container đường bộ) | Khả dụng (mặc định) |
| Đường biển | Vận chuyển bằng đường biển | Disabled — chưa hỗ trợ |
| Đường hàng không | Vận chuyển bằng đường hàng không | Disabled — chưa hỗ trợ |

**b) Loại hình vận tải**

| Giá trị hiển thị | Ý nghĩa | Trạng thái trong Sprint hiện tại |
| ----- | ----- | ----- |
| Hàng nguyên | Lô hàng của 1 chủ hàng chiếm trọn 1 phương tiện. 1 Chặng chỉ vận hành cho 1 lô hàng | Khả dụng (mặc định) |
| Hàng lẻ | N lô hàng của N chủ hàng ghép chung 1 phương tiện; 1 Chặng vận hành cho N lô hàng | Disabled — chưa hỗ trợ |

#### 3.1.2.4. Danh mục giá trị Điểm đi / Điểm đến

| Giá trị danh mục | Ý nghĩa | Ghi chú |
| ----- | ----- | ----- |
| Nội địa Việt Nam | Địa điểm nằm trong nội địa Việt Nam (kho, nhà máy, địa chỉ khách hàng) | Dùng cho Phạm vi Quốc tế và Nội địa |
| Nội địa Trung Quốc | Địa điểm nằm trong nội địa Trung Quốc | Dùng cho Phạm vi Quốc tế và Nội địa |
| Cửa khẩu Việt Nam | Cửa khẩu phía Việt Nam | Dùng cho cả 3 phạm vi |
| Cửa khẩu Trung Quốc | Cửa khẩu phía Trung Quốc | Dùng cho cả 3 phạm vi |

#### 3.1.2.5. Quy tắc quy đổi Điểm đi / Điểm đến thực tế về giá trị danh mục

Áp dụng cho modal Mô phỏng thử và luồng sinh cấu trúc Chặng của Phiếu dịch vụ thật (BR-CH-33).

| Radio box | Quốc gia | Điều kiện bổ sung | Giá trị Điểm đi | Giá trị Điểm đến |
| ----- | ----- | ----- | ----- | ----- |
| Địa chỉ | Việt Nam | — | Nội địa Việt Nam | Nội địa Việt Nam |
| Địa chỉ | Trung Quốc | — | Nội địa Trung Quốc | Nội địa Trung Quốc |
| Cửa khẩu | Việt Nam (quốc gia của cửa khẩu) | Điểm đi ≠ Điểm đến | Cửa khẩu Việt Nam | Cửa khẩu Việt Nam |
| Cửa khẩu | Trung Quốc (quốc gia của cửa khẩu) | Điểm đi ≠ Điểm đến | Cửa khẩu Trung Quốc | Cửa khẩu Trung Quốc |
| Cửa khẩu | Việt Nam / Trung Quốc | Điểm đi \= Điểm đến (cùng 1 cửa khẩu) | Cửa khẩu Việt Nam / Cửa khẩu Trung Quốc | Bằng đúng giá trị của Điểm đi |

#### 3.1.2.6. Quy tắc suy ra Phạm vi thực hiện & chọn Quy tắc chặng tương ứng

Sau khi quy đổi Điểm đi/Điểm đến theo mục 3.1.2.5, hệ thống suy ra Phạm vi thực hiện theo bảng dưới, rồi tìm quy tắc khớp tổ hợp (Phạm vi thực hiện \+ Phương thức vận tải \+ Loại hình vận tải \+ Điểm đi \+ Điểm đến).

| STT | Điều kiện | Phạm vi thực hiện được suy ra | Ví dụ |
| ----- | ----- | ----- | ----- |
| 1 | Quốc gia của Điểm đi **≠** Quốc gia của Điểm đến | Quốc tế | Nội địa Trung Quốc → Nội địa Việt Nam |
| 2 | Quốc gia của Điểm đi **\=** Quốc gia của Điểm đến **AND** Điểm đi \= Điểm đến \= \[Cửa khẩu\] | Cửa khẩu | Cửa khẩu Hữu Nghị → chính cửa khẩu đó |
| 3 | Quốc gia của Điểm đi **\=** Quốc gia của Điểm đến **AND** (Điểm đi ≠ Điểm đến **OR** Điểm đi \= Điểm đến ≠ \[Cửa khẩu\]) | Nội địa | – Cửa khẩu Việt Nam → Nội địa Việt Nam – Nội địa Việt Nam → Nội địa Việt Nam |

#### 3.1.2.7. Quy tắc xác định Điểm đi / Điểm đến của từng Chặng trong kết quả mô phỏng

Áp dụng sau khi đã chọn được Quy tắc chặng khớp; căn cứ là Điểm đi/Điểm đến của dịch vụ mô phỏng (BR-CH-40).

| Chặng | Điểm đi của Chặng | Điểm đến của Chặng | Trường hợp Cửa khẩu |
| ----- | ----- | ----- | ----- |
| Chặng 1 (Chặng đầu) | \= **Điểm đi của dịch vụ** mô phỏng | \= Điểm đi của Chặng kế tiếp *(theo (4))* | Nếu Điểm đi của dịch vụ là **Cửa khẩu** → Chặng 1 có **Điểm đi \= Điểm đến** (cùng cửa khẩu đó) |
| Chặng giữa (nếu có) | \= Điểm đến của Chặng liền trước | \= Điểm đi của Chặng liền sau | — |
| Chặng cuối cùng | \= Điểm đến của Chặng liền trước *(theo (4))* | \= **Điểm đến của dịch vụ** mô phỏng | Nếu Điểm đến của dịch vụ là **Cửa khẩu** → Chặng cuối có **Điểm đi \= Điểm đến** (cùng cửa khẩu đó) |
| Quy tắc chỉ có 1 Chặng | \= Điểm đi của dịch vụ | \= Điểm đến của dịch vụ | Chặng đó vừa là Chặng đầu vừa là Chặng cuối — áp dụng đồng thời cả 2 quy tắc trên |

#### 3.1.2.8. Ma trận phân quyền

Module tiêu thụ 5 quyền chức năng độc lập do module Tài khoản & Phân quyền cấp. 

| Quyền chức năng | Mã quyền | Cho phép thao tác | Ghi chú |
| ----- | ----- | ----- | ----- |
| Xem Quy tắc chặng | \- | – Nhìn thấy menu "Cấu hình Chặng" – Xem danh sách, tìm kiếm, lọc – Xem chi tiết quy tắc – Dùng modal Mô phỏng thử | Quyền nền: thiếu quyền này thì không thấy menu và không gọi được API nào của module |
| Thêm Quy tắc chặng | \- | – Nhìn thấy nút "+ Tạo mới Quy tắc" – Lưu quy tắc mới | Yêu cầu có kèm quyền Xem |
| Sửa Quy tắc chặng | \- | – Nhìn thấy icon/nút Sửa – Lưu thay đổi | Yêu cầu có kèm quyền Xem. Không còn bao gồm thao tác đổi trạng thái |
| Kích hoạt / Vô hiệu hóa Quy tắc chặng | \- | – Nhìn thấy icon/nút Vô hiệu hóa (với quy tắc Đang hoạt động) – Nhìn thấy icon/nút Kích hoạt (với quy tắc Dừng hoạt động) – Đổi trạng thái quy tắc | Quyền mới của bản 7.0; dùng CHUNG cho cả 2 thao tác. Yêu cầu có kèm quyền Xem |
| Xóa Quy tắc chặng | \- | – Nhìn thấy icon/nút Xóa – Xóa quy tắc sau bước xác nhận | Yêu cầu có kèm quyền Xem |

#### 3.1.2.9. Dữ liệu mặc định — 5 Quy tắc chặng hành trình

Toàn bộ 5 quy tắc mặc định dùng Phương thức vận tải "Đường bộ", Loại hình vận tải "Hàng nguyên", trạng thái "Đang hoạt động". Dịch vụ được khai báo trực tiếp trong từng Chặng.

| Mã quy tắc | Tên quy tắc | Phạm vi | Điểm đi | Điểm đến | Cấu trúc Chặng & Dịch vụ | Thành phần |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| RUL-2609-001 | Thủ tục tại cửa khẩu | Cửa khẩu | Cửa khẩu Việt Nam | Cửa khẩu Việt Nam | 1\. Tại Cửa khẩu  Dịch vụ: Khai báo hải quan, Hải quan giám sát, Sang tải | 1 Chặng |
| RUL-2609-002 | Cửa khẩu Việt Nam về nội địa Việt Nam | Nội địa | Cửa khẩu Việt Nam | Nội địa Việt Nam | 1\. Tại Cửa khẩu  Dịch vụ: Khai báo hải quan, Hải quan giám sát, Sang tải 2\. Cửa khẩu → Nội địa → Vận tải | 2 Chặng |
| RUL-2609-003 | Vận chuyển nội địa Việt Nam | Nội địa | Nội địa Việt Nam | Nội địa Việt Nam | 1\. Nội địa → Nội địa  Dịch vụ: Vận tải | 1 Chặng |
| RUL-2609-004 | Nội địa Việt Nam lên cửa khẩu Việt Nam | Nội địa | Nội địa Việt Nam | Cửa khẩu Việt Nam | 1\. Nội địa → Cửa khẩu  Dịch vụ: Vận tải 2\. Tại Cửa khẩu  Dịch vụ: Khai báo hải quan, Hải quan giám sát, Sang tải | 2 Chặng |
| RUL-2609-005 | Cửa khẩu Việt Nam đến Cửa khẩu Việt Nam | Nội địa | Cửa khẩu Việt Nam | Cửa khẩu Việt Nam  | 1\. Tại Cửa khẩu  Dịch vụ: Khai báo hải quan, Hải quan giám sát, Sang tải 2\. Cửa khẩu Việt Nam → Cửa khẩu Việt Nam Dịch vụ: Vận tải 3\. Tại Cửa khẩu Dịch vụ: Khai báo hải quan, Hải quan giám sát, Sang tải | 3 Chặng |

### 3.1.3. Quy tắc nghiệp vụ (Business Rule)

* **BR-CH-01:** Module áp dụng phân quyền theo 5 quyền chức năng độc lập: Xem, Thêm, Sửa, **Kích hoạt/Vô hiệu hóa** và Xóa Quy tắc chặng hành trình (chi tiết tại mục 3.1.2.8). Hai thao tác Kích hoạt và Vô hiệu hóa dùng chung một quyền và tách riêng khỏi quyền Sửa. Giao diện ẩn hoặc disable thao tác mà tài khoản không có quyền; server bắt buộc kiểm tra lại quyền ở mọi API.  
* **BR-CH-02:** Khi tạo mới hoặc chỉnh sửa quy tắc, hệ thống kiểm tra 5 trường: **Phạm vi thực hiện, Phương thức vận tải, Loại hình vận tải, Điểm đi, Điểm đến**. Nếu cả 5 trường trùng giá trị với một quy tắc khác đã tạo (không phân biệt trạng thái), hệ thống chặn tạo/sửa và thông báo lỗi.  
* **BR-CH-03:** Mã quy tắc có cấu trúc **RUL-YYMM-xxx** (RUL cố định \+ năm–tháng tạo \+ số thứ tự 3 chữ số trong tháng, reset đầu mỗi tháng). Mã được hệ thống sinh tự động tại thời điểm lưu quy tắc thành công — form Tạo mới không hiển thị trường Mã quy tắc. Sau khi sinh, mã ở chế độ chỉ đọc.  
* **BR-CH-04:** Vô hiệu hóa là soft-disable: không xóa dữ liệu và không ảnh hưởng đến cấu trúc Chặng đã đóng băng trên các Phiếu dịch vụ hiện có.  
* **BR-CH-06:** Kết quả cấu hình tại module này là nguồn dữ liệu duy nhất (Single Source) mà Leg Engine tham chiếu. Modal CC "Xác định cấu trúc Chặng" và modal Mô phỏng thử phải dùng chung một engine tính toán — nghiêm cấm tồn tại logic hardcode song song.  
* **BR-CH-07:** Thứ tự dòng trong khối "Cấu trúc Chặng" chính là **thứ tự thực hiện Chặng** mà K3 phải tuân theo. Hệ thống tự đánh số 1 → n theo thứ tự nhập; không hỗ trợ kéo–thả hay nút lên/xuống.  
* **BR-CH-08:** Khối "Cấu trúc Chặng" phải luôn có tối thiểu 1 dòng Chặng — chặn xóa nếu đó là dòng cuối cùng. Không giới hạn cứng số Chặng tối đa qua giao diện.  
* **BR-CH-09:** Phạm vi phát triển hiện tại chỉ áp dụng Loại hình vận tải "Hàng nguyên" đi kèm Phương thức vận tải "Đường bộ". Giá trị "Hàng lẻ" (Loại hình vận tải) và "Đường biển", "Đường hàng không" (Phương thức vận tải) vẫn hiển thị trong dropdown nhưng ở trạng thái disabled kèm ghi chú "Chưa hỗ trợ trong phạm vi hiện tại".  
* **BR-CH-10:** Trường "Phương thức vận tải" và "Loại hình vận tải" là thuộc tính cấp quy tắc (rule-level) và đều là thành phần của bộ khóa kiểm tra trùng; hai trường này không được hỏi lại ở modal CC "Xác định cấu trúc Chặng". Trên mọi màn hình, Phương thức vận tải luôn đứng trước Loại hình vận tải.  
* **BR-CH-16:** Dịch vụ Khai báo hải quan tuy luôn được gán vào Chặng tại cửa khẩu nhưng vẫn chạy độc lập về mặt trình tự — không tính vào công thức badge trạng thái của Chặng.  
* **BR-CH-17:** Chặng được phép không gắn dịch vụ nào — hệ thống hiển thị cảnh báo xác nhận liệt kê tên các Chặng đó; người dùng xác nhận thì quy tắc vẫn được lưu.   
* **BR-CH-32:** Trên màn Xem chi tiết, Chặng không có dịch vụ nào phải hiển thị badge cảnh báo "Không có dịch vụ nào trong chặng này" thay cho khu vực chip dịch vụ. Dùng thống nhất một câu chữ với badge tại màn Mô phỏng thử (BR-CH-37).   
* **BR-CH-19:** Tên 5 dịch vụ chuẩn dùng thống nhất toàn hệ thống: **Khai báo hải quan, Hải quan giám sát, Kho bãi, Vận tải, Sang tải**. Không dùng biến thể ở bất kỳ bảng, dropdown hay chip nào. Trong đó chỉ 4 dịch vụ được cấu hình theo Chặng (trừ Kho bãi — xem BR-CH-23 và BR-CH-36).  
* **BR-CH-20:** Leg Engine Simulator không được ghi bất kỳ dữ liệu nào vào hệ thống. Kết quả mô phỏng phải kèm Phạm vi suy ra và Mã quy tắc đã khớp (đã gỡ bỏ dòng "Lý do sinh chặng"); không khớp quy tắc thì báo cảnh báo, không đưa kết quả suy đoán.  
* **BR-CH-21:** Trường "Phạm vi thực hiện" là dropdown 3 giá trị cố định: Quốc tế, Nội địa, Cửa khẩu. Người dùng phải chọn trường này ĐẦU TIÊN vì nó chi phối danh sách lựa chọn của Điểm đi và Điểm đến.  
* **BR-CH-22:** Chỉ được xóa một Quy tắc chặng hành trình khi CHƯA có Phiếu dịch vụ nào áp dụng quy tắc đó; quy tắc đã được sử dụng chỉ có thể Vô hiệu hóa. Hệ thống bắt buộc hiển thị bước xác nhận trước khi xóa và kiểm tra lại điều kiện ở phía server tại thời điểm thực thi.  
* **BR-CH-23:** Dịch vụ được gán trực tiếp vào từng Chặng bằng multi-select trong 4 dịch vụ được phép cấu hình: Khai báo hải quan, Hải quan giám sát, Sang tải, Vận tải. Dịch vụ **Kho bãi không xuất hiện** trong danh sách chọn của Cấu hình Chặng. Trong cùng 1 Chặng, mỗi dịch vụ chỉ xuất hiện 1 lần; cùng 1 dịch vụ được phép xuất hiện ở nhiều Chặng khác nhau của cùng một quy tắc.  
* **BR-CH-24:** Khi Phạm vi thực hiện \= "Quốc tế" hoặc "Nội địa": Điểm đi và Điểm đến cùng được chọn trong 4 giá trị — Nội địa Việt Nam, Cửa khẩu Việt Nam, Nội địa Trung Quốc, Cửa khẩu Trung Quốc.  
* **BR-CH-25:** Khi Phạm vi thực hiện \= "Cửa khẩu": Điểm đi và Điểm đến cùng được chọn trong {Cửa khẩu Việt Nam, Cửa khẩu Trung Quốc} và luôn mang cùng một giá trị — chọn hoặc đổi giá trị ở một trường thì trường còn lại tự cập nhật theo.  
* **BR-CH-26:** Trường "Tên quy tắc" là bắt buộc, tối đa 150 ký tự và không được trùng với Tên quy tắc của bất kỳ quy tắc nào khác trong hệ thống — bao gồm cả quy tắc đang ở trạng thái Dừng hoạt động.  
* **BR-CH-27:** Hệ thống không phân biệt bản ghi do hệ thống khởi tạo (seed) và bản ghi do người dùng tạo — mọi Quy tắc chặng hành trình đều chịu chung các rule nghiệp vụ và ma trận phân quyền.  
* **BR-CH-28:** Màn Xem chi tiết Quy tắc chặng hành trình ở chế độ chỉ đọc; mọi thay đổi phải thực hiện qua form Sửa mở từ nút "Sửa" trên màn này hoặc icon Sửa trên danh sách.  
* **BR-CH-29:** Tên Chặng là bắt buộc và không được trùng với tên Chặng khác trong cùng một quy tắc. Hệ thống kiểm tra tại thời điểm bấm Lưu (cả luồng Tạo mới và luồng Sửa) và tô đỏ các dòng vi phạm. Tên Chặng được phép trùng giữa các quy tắc khác nhau.  
* **BR-CH-30:** Thêm / Xem / Sửa / Xóa là 4 chức năng cơ bản của Quy tắc chặng hành trình. Chức năng Xem chi tiết, Sửa và Xóa phải thao tác được từ cả màn danh sách (cột Thao tác) lẫn màn Xem chi tiết (nút tương ứng), trong phạm vi quyền của tài khoản.  
* **BR-CH-31:** Khi giá trị "Phạm vi thực hiện" thay đổi, hệ thống phải xóa giá trị đang có của Điểm đi và Điểm đến, đồng thời nạp lại danh sách lựa chọn theo ràng buộc của phạm vi mới. Áp dụng cho cả luồng Tạo mới và luồng Sửa.  
* **BR-CH-33:** Leg Engine suy ra Phạm vi thực hiện và quy đổi Điểm đi/Điểm đến thực tế về giá trị danh mục theo đúng 2 bảng quy tắc tại mục 3.1.2.5 và 3.1.2.6. Quy tắc này áp dụng chung cho cả modal Mô phỏng thử và luồng sinh cấu trúc Chặng của Phiếu dịch vụ thật.  
* **BR-CH-34:** Khối checkbox 5 dịch vụ trên modal Mô phỏng thử chỉ đóng vai trò bộ lọc hiển thị kết quả; việc bỏ tick một dịch vụ chỉ ẩn chip dịch vụ đó khỏi các Chặng, không làm thay đổi quy tắc được chọn.  
* **BR-CH-40:** Điểm đi/Điểm đến của từng Chặng trong kết quả mô phỏng được xác định như sau:(1) **Chặng đầu tiên** — Điểm đi của Chặng 1 \= Điểm đi của dịch vụ. Nếu Điểm đi của dịch vụ là một Cửa khẩu thì Chặng 1 có Điểm đi \= Điểm đến (cùng cửa khẩu đó).(2) **Chặng cuối cùng** — Điểm đến của Chặng cuối \= Điểm đến của dịch vụ. Nếu Điểm đến của dịch vụ là một Cửa khẩu thì Chặng cuối có Điểm đi \= Điểm đến (cùng cửa khẩu đó).(3) Quy tắc chỉ sinh 1 Chặng thì Chặng đó vừa là Chặng đầu vừa là Chặng cuối, áp dụng đồng thời cả (1) và (2).(4) Các Chặng nối tiếp liên tục: Điểm đến của Chặng n là Điểm đi của Chặng n+1.  
* **BR-CH-35:** Trường "Phương thức vận tải" là bắt buộc ở cả luồng Tạo mới và Sửa; gồm 3 giá trị: Đường bộ (mặc định, khả dụng), Đường biển và Đường hàng không (disabled). Trường này là một thành phần của bộ khóa kiểm tra trùng tại BR-CH-02.  
* **BR-CH-38:** Quy tắc chặng hành trình có đúng 2 trạng thái: **"Đang hoạt động"** và **"Dừng hoạt động"**. Thao tác Vô hiệu hóa chỉ khả dụng với quy tắc Đang hoạt động, thao tác Kích hoạt chỉ khả dụng với quy tắc Dừng hoạt động — trên cả cột Thao tác của danh sách lẫn nút trên màn Xem chi tiết; không bao giờ hiển thị đồng thời cả 2\. Cả 2 thao tác đều có bước xác nhận và dùng chung quyền "Kích hoạt/Vô hiệu hóa Quy tắc chặng".  
* **BR-CH-39:** Cột "Thành phần" trên màn danh sách chỉ hiển thị số Chặng của quy tắc (dạng "n Chặng"), không hiển thị số dịch vụ. Chi tiết dịch vụ của từng Chặng chỉ xem ở màn Xem chi tiết.  
* **BR-CH-36:** Dịch vụ Kho bãi không được cấu hình theo Chặng. Khi Phiếu dịch vụ (hoặc thông số mô phỏng) có đăng ký dịch vụ Kho bãi, Leg Engine luôn gán dịch vụ này vào **Chặng 1** của cấu trúc Chặng sinh ra. Quy tắc áp dụng chung cho modal Mô phỏng thử và luồng Phiếu dịch vụ thật.  
* **BR-CH-37:** Khi một Chặng không còn dịch vụ nào (do phiếu dịch vụ không đăng ký dịch vụ nào của Chặng đó, hoặc do bộ lọc trên modal Mô phỏng thử), hệ thống hiển thị badge "Không có dịch vụ nào trong chặng này" tại Chặng đó trên màn Mô phỏng, và **ẩn Chặng này khỏi cấu trúc Chặng hiển thị trên Phiếu dịch vụ**.

### 3.1.4. Danh sách thông báo và lỗi

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| ----- | ----- | ----- | ----- |
| Tài khoản không có quyền "Xem Quy tắc chặng" truy cập màn Cấu hình Chặng | Lỗi | "Bạn không có quyền truy cập chức năng này." | Chặn truy cập, điều hướng về trang chủ |
| Tài khoản không có quyền Thêm/Sửa/Xóa gọi API tương ứng | Lỗi | "Bạn không có quyền thực hiện thao tác này." | Server từ chối, ghi log, không thay đổi dữ liệu |
| Chưa chọn Phạm vi thực hiện trong form Quy tắc chặng | Cảnh báo | "Chọn Phạm vi thực hiện trước để hệ thống nạp danh sách Điểm đi và Điểm đến." | Khóa trường Điểm đi và Điểm đến; vô hiệu hóa nút Lưu |
| Đổi giá trị Phạm vi thực hiện khi đã chọn Điểm đi/Điểm đến | Thông tin | "Phạm vi thực hiện đã thay đổi, vui lòng chọn lại Điểm đi và Điểm đến." | Xóa giá trị 2 trường, nạp lại danh sách theo phạm vi mới (BR-CH-31) |
| Bỏ trống Tên quy tắc | Lỗi | "Vui lòng nhập Tên quy tắc." | Không lưu, tô đỏ trường Tên quy tắc |
| Tên quy tắc trùng với quy tắc khác trong hệ thống | Lỗi | "Tên quy tắc đã được sử dụng bởi \[Mã quy tắc\], vui lòng đặt tên khác." | Không lưu |
| Trùng đủ 5 trường (Phạm vi, Loại hình vận tải, Phương thức vận tải, Điểm đi, Điểm đến) với quy tắc khác | Lỗi | "Đã tồn tại quy tắc \[Mã quy tắc\] có cùng Phạm vi thực hiện, Loại hình vận tải, Phương thức vận tải, Điểm đi và Điểm đến. Vui lòng kiểm tra lại." | Chặn tạo/sửa, giữ nguyên dữ liệu trên form |
| Hai dòng Chặng trùng tên trong cùng một quy tắc | Lỗi | "Tên Chặng không được trùng nhau trong cùng một quy tắc: \[tên Chặng bị trùng\]." | Không lưu, tô đỏ các dòng Chặng vi phạm |
| Bỏ trống tên dòng Chặng | Lỗi | "Vui lòng nhập tên cho tất cả các Chặng." | Không lưu, tô đỏ dòng thiếu tên |
| Chọn giá trị "Hàng lẻ" (Loại hình vận tải) hoặc "Đường biển"/"Đường hàng không" (Phương thức vận tải) | Thông tin | "Giá trị này chưa hỗ trợ trong phạm vi hiện tại." | Lựa chọn ở trạng thái disabled, giữ nguyên giá trị mặc định |
| Bấm icon xóa dòng Chặng khi chỉ còn 1 dòng duy nhất | Lỗi | "Quy tắc phải có tối thiểu 1 Chặng, không thể xóa dòng cuối cùng." | Chặn xóa |
| Bỏ trống trường bắt buộc (Điểm đi / Điểm đến / Phương thức vận tải) | Lỗi | "Vui lòng nhập đầy đủ các trường bắt buộc." | Không lưu, tô đỏ các trường thiếu |
| Phạm vi \= Cửa khẩu, người dùng đổi giá trị Điểm đi hoặc Điểm đến | Thông tin | "Với phạm vi Cửa khẩu, Điểm đi và Điểm đến luôn là cùng một cửa khẩu." | Tự cập nhật trường còn lại theo giá trị vừa chọn (BR-CH-25) |
| Lưu quy tắc khi còn Chặng chưa gắn dịch vụ nào | Cảnh báo | "Các Chặng sau chưa được gắn dịch vụ: \[danh sách tên Chặng\]. Bạn có muốn tiếp tục lưu?" | Chờ xác nhận; xác nhận thì vẫn lưu quy tắc, hủy thì quay lại form (BR-CH-17) |
| Mở màn Xem chi tiết quy tắc có Chặng chưa gắn dịch vụ | Cảnh báo | "Không có dịch vụ nào trong chặng này." (badge tại Chặng) | Hiển thị badge cảnh báo thay cho khu vực chip dịch vụ (BR-CH-32) |
| Tạo mới Quy tắc chặng hành trình thành công | Thành công | "Đã tạo quy tắc \[Mã quy tắc\], có hiệu lực ngay trên hệ thống." | Sinh Mã quy tắc, đóng form, cập nhật danh sách và badge tổng số |
| Sửa Quy tắc chặng hành trình thành công | Thành công | "Đã cập nhật quy tắc \[Mã quy tắc\]." | Giữ nguyên Mã quy tắc, đóng form, cập nhật danh sách |
| Bấm Vô hiệu hóa với quy tắc "Đang hoạt động" | Cảnh báo | "Vô hiệu hóa quy tắc này sẽ không ảnh hưởng Phiếu dịch vụ cũ nhưng sẽ ngừng áp dụng cho Phiếu dịch vụ mới. Bạn có chắc chắn?" | Chờ xác nhận; xác nhận thì chuyển trạng thái sang "Dừng hoạt động" |
| Bấm Kích hoạt với quy tắc "Dừng hoạt động" | Cảnh báo | "Kích hoạt lại quy tắc này để áp dụng cho các Phiếu dịch vụ mới. Bạn có chắc chắn?" | Chờ xác nhận; xác nhận thì chuyển trạng thái sang "Đang hoạt động" |
| Đổi trạng thái thành công | Thành công | "Đã chuyển quy tắc \[Mã quy tắc\] sang trạng thái \[Đang hoạt động / Dừng hoạt động\]." | Cập nhật danh sách và badge tổng số |
| Kích hoạt lại quy tắc gây trùng tổ hợp 5 trường | Lỗi | "Không thể kích hoạt: đã có quy tắc \[Mã quy tắc\] dùng cùng tổ hợp này." | Giữ nguyên trạng thái Dừng hoạt động |
| Tài khoản không có quyền Kích hoạt/Vô hiệu hóa gọi API đổi trạng thái | Lỗi | "Bạn không có quyền thực hiện thao tác này." | Server từ chối, ghi log, không đổi trạng thái |
| Bấm Xóa (icon trên danh sách hoặc nút trên màn chi tiết) | Cảnh báo | "Quy tắc \[Mã quy tắc\] sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn muốn xóa?" | Chờ xác nhận trước khi xóa |
| Bấm Xóa với quy tắc đã có Phiếu dịch vụ sử dụng | Lỗi | "Quy tắc đã được sử dụng trong Phiếu dịch vụ, chỉ có thể Vô hiệu hóa." | Icon/nút Xóa disabled; gọi qua API thì server từ chối (BR-CH-22) |
| Xóa quy tắc thành công | Thành công | "Đã xóa quy tắc \[Mã quy tắc\]." | Cập nhật danh sách và badge tổng số |
| Simulator: chưa nhập đủ trường con của Điểm đi hoặc Điểm đến | Thông tin | "Vui lòng nhập đầy đủ thông tin Điểm đi và Điểm đến để chạy mô phỏng." | Chưa chạy mô phỏng, panel kết quả để trống |
| Simulator: không có quy tắc Đang hoạt động nào khớp đủ 5 trường | Cảnh báo | "Không có quy tắc phù hợp với tổ hợp input hiện tại." | Không hiển thị kết quả suy đoán, giữ nguyên form |
| Simulator: nhiều quy tắc Đang hoạt động cùng khớp input | Lỗi | "Phát hiện nhiều quy tắc cùng khớp: \[danh sách Mã quy tắc\]. Vui lòng kiểm tra lại cấu hình." | Không chọn tự động quy tắc nào, yêu cầu người dùng xử lý |
| Simulator: bỏ tick toàn bộ 5 dịch vụ ở bộ lọc | Thông tin | "Bộ lọc đang ẩn toàn bộ dịch vụ. Bỏ lọc để xem đầy đủ cấu hình của từng Chặng." | Vẫn hiển thị các Chặng, chỉ ẩn chip dịch vụ |
| Simulator: một Chặng không còn dịch vụ nào | Thông tin | "Không có dịch vụ nào trong chặng này." (badge tại Chặng) \+ ghi chú "Chặng này sẽ được ẩn trên Phiếu dịch vụ." | Hiển thị badge tại Chặng; Leg Engine ẩn Chặng khi sinh cấu trúc cho Phiếu dịch vụ (BR-CH-37) |
| Simulator: tick dịch vụ Kho bãi ở bộ lọc | Thông tin | "Dịch vụ Kho bãi được gán mặc định vào Chặng 1." | Hiển thị chip Kho bãi trong Chặng 1 (BR-CH-36) |

### 3.1.5. Mô tả luồng dữ liệu hệ thống

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| ----- | ----- | ----- | ----- | ----- |
| K3 — Modal CC "Xác định cấu trúc Chặng" | Đọc bộ Quy tắc chặng hành trình Đang hoạt động; suy ra Phạm vi từ Điểm đi/Điểm đến thực tế rồi sinh cấu trúc Chặng kèm dịch vụ | Cấu hình Chặng → Modal CC (đọc) | Khi CC tiếp nhận Phiếu dịch vụ mới và mở modal xác nhận | Không có quy tắc phù hợp → báo lỗi rõ ràng, không suy luận thay |
| Quản lý danh mục (SRS\_07) | Cung cấp danh mục Điểm đi/Điểm đến, Cửa khẩu, Đơn vị hành chính (Quốc gia, Tỉnh/Thành phố, Phường/Xã) và Dịch vụ | Quản lý danh mục → Cấu hình Chặng (đọc) | Khi mở form Tạo mới/Sửa quy tắc và modal Mô phỏng thử | Giá trị danh mục bị Tắt vẫn phải áp đúng quy tắc cho Phiếu dịch vụ cũ đã dùng giá trị đó |
| Tài khoản & Phân quyền | Cung cấp 4 quyền chức năng của module để ẩn/hiện thao tác trên giao diện và chặn ở tầng API | Tài khoản & Phân quyền → Cấu hình Chặng (đọc) | Khi người dùng đăng nhập và mỗi lần gọi API của module | Thiếu quyền → ẩn thao tác trên UI, server trả lỗi phân quyền và ghi log |
| Phiếu dịch vụ (Quản lý dịch vụ) | Kiểm tra một Quy tắc chặng hành trình đã có Phiếu dịch vụ nào sử dụng hay chưa — là điều kiện cho phép Xóa | Phiếu dịch vụ → Cấu hình Chặng (đọc) | Khi người dùng bấm Xóa ở danh sách hoặc màn chi tiết | Đã có Phiếu dịch vụ sử dụng → chặn xóa (BR-CH-22) |
| Khối A — Thông tin chung của Phiếu dịch vụ | Các trường căn cứ (Loại hình vận tải, Điểm đi/Điểm đến thực tế, danh sách dịch vụ đăng ký) là input cho Leg Engine, do K1 bàn giao | Khối A → Leg Engine (đọc) | Khi K1 bàn giao Phiếu dịch vụ cho K3 | Thiếu trường căn cứ → chặn bàn giao, yêu cầu K1 bổ sung |
| SRS\_02 → SRS\_06 (5 module dịch vụ con của K3) | Danh sách dịch vụ khai báo trong từng Chặng xác định mỗi dịch vụ con hiển thị/thao tác ở Chặng nào trên giao diện Coordinator | Cấu hình Chặng → 5 module dịch vụ (đọc) | Khi Coordinator mở màn dịch vụ con của Phiếu dịch vụ | Dịch vụ không có trong cấu hình Chặng nào → không hiển thị, ghi log cảnh báo |
| Leg Engine Simulator (modal nội bộ) | Kiểm thử bộ quy tắc trước khi áp dụng thực tế, dùng chung engine với luồng thật | Cấu hình Chặng → Simulator (đọc) | Khi người dùng bấm nút "Mô phỏng thử" | Không ghi dữ liệu trong mọi trường hợp (BR-CH-20) |

# Phụ lục A. Hướng dẫn áp dụng mô hình Hybrid theo Sprint

* **Refinement:** bẻ Epic → User Story \+ AC; đánh dấu \[PHỨC TẠP\] cho story nhiều nhánh/nhiều actor để bổ sung Use Case.  
* **Sprint Planning:** chỉ story đạt Definition of Ready mới đưa vào Sprint Backlog; đính wireframe & business rule.  
* **Trong Sprint:** US \+ AC là living doc; tester biến AC (và Use Case flow) trực tiếp thành test case.  
* **Review/Done:** cập nhật lại US/UC theo thực tế build, đồng bộ Data Dictionary & bảng tích hợp.

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Bổ sung bộ lọc: Thêm lọc “Phạm vi” gồm các giá trị Tất cả / Quốc tế / Nội địa / Cửa khẩu. | Chưa có bộ lọc Phạm vi | 13/10/2026 | BA đề xuất |

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>