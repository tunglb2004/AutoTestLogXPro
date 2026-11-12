**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification – SRS)*

*Mô hình Hybrid: User Story (xương sống) \+ Use Case chi tiết (cho story phức tạp)*

| Tên hệ thống | LogX — Chức năng Xem lịch sử hoạt động (tổng hợp các module) |
| :---- | :---- |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | \[Họ và tên BA\] |
| **Ngày tạo** | 01/10/2026 |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Tổng hợp chức năng Xem lịch sử hoạt động của các module Quản lý giá, Quản lý báo giá và Cấu hình hệ thống vào một tài liệu thống nhất.

Mô tả rõ cách hệ thống lưu nội dung lịch sử cho từng chức năng, làm căn cứ chuẩn hóa thiết kế, phát triển và kiểm thử.

## **1.2. Phạm vi hệ thống**

Trong phạm vi (In-scope):

* Quản lý giá: Cấu hình đầu mục giá, Giá mua đầu vào, Giá mua định mức, Giá bán định mức.

* Quản lý báo giá: Yêu cầu báo giá, Báo giá nội bộ, Báo giá khách hàng.

* Cấu hình hệ thống: Cấu hình danh mục (Lịch sử thao tác), Tài khoản & Phân quyền (Audit Log), Cấu hình Chặng (Lịch sử hoạt động quy tắc chặng.

Ngoài phạm vi (Out-of-scope):

* Module Quản lý dịch vụ (Phiếu dịch vụ, Chi phí, Doanh thu) và Quản lý nhà thầu: chưa tổng hợp trong đợt này.

* Xuất (export) lịch sử hoạt động và báo cáo audit: SRS nguồn chưa đặc tả.

* Log kỹ thuật của hệ thống (lỗi, API): khác với lịch sử hoạt động nghiệp vụ.

## **1.3. Giả định & Quy ước chung**

* **Cấu trúc bản ghi chuẩn:** Thời gian | Người thực hiện | Hành động | Nội dung.

* **Thuật ngữ:** dùng “Người thực hiện” và “Lịch sử hoạt động” thống nhất; một số SRS nguồn còn dùng “Người thực hiện”, “Lịch sử thao tác”, “Audit Log”.

* **Thao tác tự động:** Người thực hiện hiển thị “Hệ thống”.

* **Bản ghi chỉ đọc:** không sửa, không xóa kể cả Admin. Nguồn nêu rõ tại Quản lý danh mục và Báo giá nội bộ; các module còn lại áp dụng tương tự.

* **Quyền xem:** ai có quyền Xem bản ghi thì xem được lịch sử của bản ghi đó. 

* **Thời gian lưu trữ:** 12 tháng.

* **Thao tác thất bại:** không ghi lịch sử hoạt động. 

* **Use Case chi tiết:** chưa đánh dấu \[PHỨC TẠP\] cho story nào do các story đều có 1 actor, luồng đơn giản.

## **1.4. Quy chuẩn cấu trúc Nội dung của bản ghi lịch sử**

**Cột Nội dung** của mọi chức năng/action viết theo một mẫu thống nhất, ngắn gọn, không lặp thông tin đã có ở cột Thời gian và Người thao tác.

**Mẫu chung**: \[Tên action\] \[Định danh đối tượng\] — \[Chi tiết thay đổi\] (phần chi tiết chỉ có khi action làm thay đổi dữ liệu).

| STT | Thành phần | Quy tắc | Ví dụ |
| :---- | :---- | :---- | :---- |
| 1 | Tên action | Mở đầu bằng tên action, khớp cột Hành động. | Phát hành báo giá nội bộ … |
| 2 | Định danh đối tượng | Mã của bản ghi bị tác động đặt trong \[ \]; thêm tên nếu mã chưa đủ nhận diện. | … \[IPS261001-001\] |
| 3 | Chi tiết thay đổi | Sau dấu “—”. Thay đổi giá trị: \[Trường\]: \[cũ\] → \[mới\]; nhiều trường cách nhau bằng dấu “;”, chỉ liệt kê trường thay đổi. | — Đơn giá: 1.200.000 → 1.350.000 |
| 4 | Lý do | Với action bắt buộc lý do (Thu hồi, Hủy, Từ chối, Ngưng hoạt động): “Lý do: \[nội dung\]”. | — Lý do: Khách đổi yêu cầu |
| 5 | Không lặp thông tin của cột khác | Không ghi thời gian, tên người thao tác, “bởi Hệ thống”; người phát hành/hủy/phụ trách và thời điểm thao tác lấy từ cột Người thao tác và Thời gian. | Sai: “Nguyễn Văn A phát hành báo giá lúc 10:00” |
| 6 | Hình thức | Một câu liền, không xuống dòng; tối đa 500 ký tự, vượt thì rút gọn bằng “…” và xem chi tiết phiên bản (nếu có). \[Đề xuất\] | — |

Ví dụ: Hành động “Phát hành”; Nội dung “Phát hành báo giá nội bộ \[IPS261001-001\]”.

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

*\[Chèn hình sơ đồ BPMN/Flowchart nếu có\]*

Mô tả luồng chính:

Người dùng/Hệ thống thực hiện thao tác → Hệ thống validate → Thao tác thành công → Hệ thống ghi bản ghi lịch sử → Người dùng mở Lịch sử hoạt động → Tìm kiếm/Lọc/Phân trang → Xem chi tiết phiên bản (với bản ghi Chỉnh sửa) \- nếu có.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Thực hiện thao tác nghiệp vụ | Người dùng có quyền / Hệ thống | Thêm, sửa, xóa, kích hoạt, phát hành, thu hồi... Hoặc hệ thống tự chạy (đổi trạng thái, ghi nhận kết quả) | Dữ liệu thao tác | Thao tác hợp lệ | Qua validate nghiệp vụ Thao tác thất bại không ghi lịch sử  |
| Ghi bản ghi lịch sử | Hệ thống | Tạo bản ghi: Thời gian, Người thực hiện, Hành động, Nội dung Với bản ghi Chỉnh sửa: lưu thêm phiên bản bản ghi sau chỉnh sửa (chỉ Cấu hình đầu mục giá, Giá mua đầu vào) | Kết quả thao tác | Bản ghi lịch sử | Ghi ngay sau khi thao tác thành công Chỉ thêm mới, không sửa/xóa |
| Mở Lịch sử hoạt động | Người dùng có quyền Xem | Mở khối/popup/modal Lịch sử của bản ghi đang xem | Bản ghi đang xem | Danh sách lịch sử | Có quyền Xem bản ghi |
| Tìm kiếm / Lọc / Phân trang | Người dùng | Tìm kiếm, lọc, làm mới, chuyển trang tùy module | Từ khóa, bộ lọc | Danh sách đã lọc | Công cụ khác nhau theo module (xem mục 3\) |
| Xem chi tiết phiên bản | Người dùng | Bấm “Xem chi tiết phiên bản” để mở popup View bản ghi sau khi chỉnh sửa (dạng quản lý phiên bản) | Bản ghi lịch sử Chỉnh sửa | View phiên bản bản ghi sau chỉnh sửa | Chỉ áp dụng 2 module:\- Cấu hình đầu mục giá  \- Giá mua đầu vào |

# **3\. Đặc tả Tính năng**

## **3.1. MODULE 1: QUẢN LÝ CUNG ỨNG**

### **3.1.1 Danh sách user story**

Chú thích MoSCoW:

* **Must have**: bắt buộc để sản phẩm hoạt động / tuân thủ pháp luật-hợp đồng → Sprint hiện tại/kế tiếp.

* **Should have**: quan trọng, có thể tạm workaround → đưa vào Sprint nếu còn năng lực sau P1.

* **Could have**: mong muốn, cải thiện trải nghiệm → làm khi dư buffer hoặc sprint sau.

#### ***Cấu hình đầu mục giá: Xem lịch sử hoạt động*** 

| ID US | US\_HIS\_GIA\_01 |
| :---- | :---- |
| **Tên Story** | Xem lịch sử hoạt động — Cấu hình đầu mục giá |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem lịch sử hoạt động của một phân hệ trong Cấu hình đầu mục giá, để kiểm tra thiết lập và truy vết thay đổi. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Quản lý giá / Cấu hình đầu mục giá |
| **Người Phụ trách (Owner)** | Trang BA |

Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn Chi tiết của phân hệ hiển thị khối Lịch sử hoạt động. Gồm 4 cột: Thời gian, Người thực hiện, Hành động, Nội dung. Hành động gồm: Cập nhật. | Thiếu cột, thiếu Hành động hoặc thiếu Người thực hiện. |
| AC2 | Cho phép làm mới (refresh) danh sách  Lọc theo Người thao tác, Thời gian (khoảng thời gian) | Không có bộ lọc hoặc bộ lọc/làm mới không thành công |
| AC3 | Bản ghi “Cập nhật cấu hình đầu mục giá” có action “Xem chi tiết phiên bản”. Trang phiên bản hiển thị Thời gian bắt đầu áp dụng, Người thực hiện và nội dung bản ghi sau chỉnh sửa: Loại dịch vụ, Tên đầu mục giá, Loại giá, Loại kho (chỉ trong dịch vụ Kho bãi), Trạng thái kích hoạt. | Bản ghi Chỉnh sửa thiếu action; popup không mở được hoặc hiển thị sai phiên bản. Bản ghi Thêm mới/Xóa có action “Xem chi tiết phiên bản”. |
| AC4 | Chỉ người có quyền Xem cấu hình đầu mục giá mới thấy Lịch sử hoạt động.  | Người không có quyền vẫn xem được lịch sử. |

Đặc tả cách lưu nội dung lịch sử hoạt động: *Mỗi lần lưu, hệ thống tạo bản ghi cho danh sách đầu mục giá theo loại dịch vụ bị thay đổi.* 

| Sự kiện phát sinh | Hành động ghi | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Sửa danh sách đầu mục giá  | Cập nhật | Diễn giải thay đổi: Thêm mới/Chỉnh sửa/Xóa đầu mục/Kích hoạt/Tắt kích hoạt \[Tên đầu mục giá\].  Nếu chỉnh sửa đầu muc, hiển thị nội dung chỉnh sửa: {Tên trường} \[Giá trị cũ\] → \[Giá trị mới\] Lưu phiên bản bản ghi sau chỉnh sửa gồm: Loại dịch vụ, Tên đầu mục giá, Loại giá, Loại kho, Trạng thái kích hoạt. | Bản ghi có “Xem chi tiết phiên bản”. Nguồn: US\_CFG\_02, US\_CFG\_04 (điều chỉnh theo yêu cầu mới). |
| Bấm “Hủy bỏ” khi chỉnh sửa | Không ghi | Không phát sinh bản ghi. | Nguồn: SRS Cấu hình đầu mục giá (Hủy bỏ không lưu). |

#### ***Giá mua đầu vào: Xem lịch sử hoạt động***

| ID US | US\_HIS\_GIA\_02 |
| :---- | :---- |
| **Tên Story** | Xem lịch sử hoạt động — Giá mua đầu vào |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem lịch sử hoạt động của một Bảng giá mua, để truy vết các thao tác và nội dung thay đổi. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Quản lý giá / Giá mua đầu vào |
| **Người Phụ trách (Owner)** | Trang BA |

Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn Chi tiết bảng giá mua hiển thị Lịch sử hoạt động gồm: Thời gian, Người thực hiện, Hành động, Nội dung. | Log thiếu Người thực hiện hoặc thiếu Nội dung. |
| AC2 | Lọc theo Người thao tác, Thời gian (khoảng thời gian), Hành động Cho phép làm mới để cập nhật thông tin mới nhất . | Không có bộ lọc hoặc bộ lọc/làm mới không thành công |
| AC3 | Bản ghi “Chỉnh sửa bảng giá mua” có action “Xem chi tiết phiên bản” ở cuối bản ghi. Bấm action mở popup View bản ghi sau khi chỉnh sửa (dạng quản lý phiên bản), chế độ chỉ xem. Popup hiển thị Thời gian, Người thực hiện, Phiên bản và bản ghi sau chỉnh sửa: Thông tin chung, 5 tab phân hệ, dòng giá theo đầu mục trong từng tab. | Bản ghi Chỉnh sửa thiếu action; popup thiếu dữ liệu hoặc sai phiên bản. Các hành động khác (Khởi tạo, Kích hoạt, Xóa, Phê duyệt) có action này. |
| AC4 | Chỉ người có quyền Xem bảng giá mua mới thấy Lịch sử hoạt động. | Người không có quyền vẫn xem được lịch sử. |

Đặc tả cách lưu nội dung lịch sử hoạt động

*Thông tin chung và dòng giá lưu cùng một lần “Lưu thông tin” (atomic) nên ghi 1 bản ghi cho mỗi lần lưu.*

| Sự kiện phát sinh | Hành động ghi | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Thêm mới bảng giá mua thành công (US\_BGM\_03) | Khởi tạo | Tạo mới bảng giá \[Mã bảng giá mua đầu vào\], \[Tên bảng giá\], \[Nhà thầu\]. | Nguồn: BR16 (hành động “Khởi tạo bảng giá”). Nội dung chi tiết là đề xuất. |
| Chỉnh sửa thông tin chung (chỉ bảng giá “Tạo mới”) | Cập nhật  | Cập nhật thông tin: {Tên trường} \[Giá trị cũ\] → \[Giá trị mới\]. *Lưu phiên bản bảng giá mua sau chỉnh sửa.* | Có “Xem chi tiết phiên bản”. |
| Cập nhật bảng giá: thêm/xóa dòng giá, sửa đơn giá (US\_BGM\_07) | Cập nhật  | Đã cập nhật \[Số dòng được cập nhật\] dòng giá mua (bao gồm thêm/xóa dòng giá/cập nhật đơn giá). Lưu phiên bản bảng giá mua sau chỉnh sửa: Thông tin chung, 5 tab dịch vụ, dòng giá. | Có “Xem chi tiết phiên bản”. Nguồn: US\_BGM\_07, BR23. |
| Kích hoạt bảng giá mua | Kích hoạt | Đã kích hoạt bảng giá mua.   *Nếu bảng giá khác của cùng nhà thầu bị chuyển Ngừng hoạt động*: Bảng giá mua \[Mã bảng giá đang hoạt động\] cùng nhà thầu tự động dừng hoạt động. | Nguồn: BR16.  |
| Tự động ngừng hoạt động bảng giá mua (Đang hoạt động) khi kích hoạt 1 BGM cùng nhà thầu | Dừng hoạt động | Bảng giá mua tự động dừng hoạt động do kích hoạt bảng giá mua \[Mã bảng giá mua được kích hoạt\] cùng nhà thầu.  Trạng thái chuyển \[Trạng thái ban đầu\] → \[Trạng thái mới\]. | Nguồn: BR16 |
| Xóa bảng giá mua (xóa mềm) | Xóa | \[Mã bảng giá\], \[Tên bảng giá\] đã được xóa khỏi danh sách. | Nguồn: BR16. Bản ghi bị ẩn, lịch sử giữ lại. |
| Hệ thống tự đổi trạng thái theo ngày hiệu lực. | Bắt đầu hiệu lực | Bảng giá mua tự động được kích hoạt. Trạng thái chuyển \[Trạng thái ban đầu\] → \[Trạng thái mới\]. Người thực hiện: Hệ thống. | Nguồn chưa đặc tả ghi log cho thao tác tự động (xem Phụ lục B, mục 6). |
| Hệ thống tự đổi trạng thái theo ngày hết hiệu lực | Hết hiệu lực | Bảng giá mua tự động hết hiệu lực. Trạng thái chuyển \[Trạng thái ban đầu\] → \[Trạng thái mới\]. Người thực hiện: Hệ thống. | Nguồn chưa đặc tả ghi log cho thao tác tự động (xem Phụ lục B, mục 6). |

#### ***Giá mua định mức: Xem lịch sử hoạt động***

| ID US | US\_HIS\_GIA\_03 |
| :---- | :---- |
| **Tên Story** | Xem lịch sử hoạt động — Giá mua định mức |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem lịch sử hoạt động của một dòng giá mua định mức, để truy vết các lần thay đổi giá. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Quản lý giá / Giá mua định mức |
| **Người Phụ trách (Owner)** | Trang BA |

Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn Chi tiết dòng giá mua định mức hiển thị Lịch sử hoạt động gồm: Thời gian, Người thực hiện, Hành động, Nội dung. Cho phép làm mới (refresh)  | Log thiếu Người thực hiện hoặc Nội dung; không làm mới được. |
| AC2 | Lọc theo Người thao tác, Thời gian (khoảng thời gian) | Không có bộ lọc hoặc bộ lọc hoạt động sai |
| AC3 | Danh sách lịch sử có phân trang, cho phép chuyển trang. | Không phân trang hoặc chuyển trang sai dữ liệu. |
| AC4 | Mỗi dòng được cập nhật có 1 bản ghi riêng, kể cả khi nhập hàng loạt. Dòng không thay đổi không phát sinh bản ghi. | Gộp nhiều dòng vào 1 bản ghi; ghi log cho dòng không đổi. |

Đặc tả cách lưu nội dung lịch sử hoạt động

| Sự kiện phát sinh | Hành động ghi | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Cập nhật giá mua định mức đơn lẻ (US\_GDM\_06) | Cập nhật  | Điều chỉnh giá định mức \[Giá cũ\] → \[Giá mới\]. | Có hiệu lực ngay, không qua phê duyệt. Nguồn: BR14.  |
| Nhập hàng loạt, bấm “Lưu tất cả” (US\_GDM\_07) | Cập nhật  | Điều chỉnh giá định mức \[Giá cũ\] → \[Giá mới\]. | Mỗi dòng 1 bản ghi riêng. Nguồn: US\_GDM\_07 AC10. |
| Đồng bộ tự động từ Giá mua đầu vào (dòng giá nhà thầu thêm/sửa/xóa) | Không ghi | Chỉ hiển thị cảnh báo (tooltip) và highlight, không tạo bản ghi. | Nguồn: BR16, BR21.  |

#### ***Giá bán định mức: Xem lịch sử hoạt động***

| ID US | US\_HIS\_GIA\_04 |
| :---- | :---- |
| **Tên Story** | Xem lịch sử hoạt động — Giá bán định mức |
| **User Story** | Là Bộ phận quản lý nhà thầu, tôi muốn xem lịch sử hoạt động của một dòng giá bán định mức, để truy vết thay đổi giá bán. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Quản lý giá / Giá bán định mức |
| **Người Phụ trách (Owner)** | Trang BA |

Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn Chi tiết dòng giá bán định mức có section Lịch sử hoạt động gồm: Thời gian, Người thực hiện, Hành động, Nội dung. Cho phép làm mới (refresh)  | Log thiếu trường; không lọc/làm mới được. |
| AC2 | Lọc theo Người thao tác, Thời gian (khoảng thời gian), Hành động | Không có bộ lọc hoặc bộ lọc hoạt động sai |
| AC3 | Người không có quyền Xem không truy cập được menu và không thấy dữ liệu. | Người không có quyền Xem vẫn truy cập được. |
| AC4 | Nhập hàng loạt: mỗi dòng được cập nhật có 1 bản ghi riêng. Dòng không được chạm tới không phát sinh bản ghi. | Gộp chung 1 bản ghi cho nhiều dòng; không phân biệt được nhập hàng loạt. |

Đặc tả cách lưu nội dung lịch sử hoạt động

| Sự kiện phát sinh | Hành động  | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Cập nhật giá bán định mức đơn lẻ (nút “Cập nhật giá bán định mức”) | Cập nhật | Điều chỉnh giá định mức \[Giá cũ\] → \[Giá mới\]. Lợi nhuận thay đổi \[Lợi nhuận cũ\] → \[Lợi nhuận mới\]. | Tên hành động và phần Lợi nhuận là đề xuất. |
| Nhập hàng loạt, bấm “Lưu tất cả” (US\_GBDM nhập hàng loạt) | Cập nhật (nhập hàng loạt) | Điều chỉnh giá định mức \[Giá cũ\] → \[Giá mới\]. Lợi nhuận thay đổi \[Lợi nhuận cũ\] → \[Lợi nhuận mới\]. | Mỗi dòng 1 bản ghi riêng. Nguồn: AC11 nhập hàng loạt. |
| Hệ thống tự cập nhật Lợi nhuận (%) khi Giá mua định mức đổi | Không ghi | Chỉ hiển thị icon cảnh báo “Giá mua định mức đã thay đổi, chưa cập nhật giá bán”. | Nguồn: AC8 danh sách. Cần xác nhận (Phụ lục B, mục 6). |
| Dòng bị hệ thống tự xóa do dòng giá mua định mức nguồn bị xóa | Không ghi | Không phát sinh bản ghi. | Nguồn: BR9 SRS Giá bán định mức. Cần xác nhận. |

### **3.1.2 Mô tả giao diện**

Link UI Design: \[Chèn link\]. Lịch sử hoạt động nằm trong màn Chi tiết của từng chức năng thuộc Quản lý giá.

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Cột Thời gian |  | Datetime | — | — | Thời điểm thao tác, chỉ đọc. Định dạng dd/MM/yyyy HH:mm:ss.  |
| Cột Người thực hiện |  | Text | — | — | Người thực hiện thao tác; thao tác tự động hiển thị “Hệ thống”.  |
| Cột Hành động |  | Text | — | — | Đầu mục giá: Thêm mới / Cập nhật / Xóa. Giá mua đầu vào: Khởi tạo bảng giá / Cập nhật Bảng giá mua / Phê duyệt bảng giá mua / Kích hoạt / Xóa. Giá mua định mức, Giá bán định mức: xem 3.1.1. |
| Cột Nội dung |  | Text | — | — | Diễn giải thay đổi, ví dụ “Giá cũ → Giá mới”. |
| Nút “Xem chi tiết phiên bản” |  | Button | — | — | Chỉ hiển thị ở bản ghi Chỉnh sửa. Áp dụng: Cấu hình đầu mục giá, Giá mua đầu vào. Mở popup View bản ghi sau khi chỉnh sửa (dạng quản lý phiên bản). |
| Popup View phiên bản |  | Popup (chỉ xem) | — | — | Hiển thị Thời gian, Người thực hiện, Phiên bản và bản ghi sau chỉnh sửa. Cấu hình đầu mục giá: Loại dịch vụ, Tên đầu mục giá, Loại giá, Loại kho, Trạng thái kích hoạt. Giá mua đầu vào: Thông tin chung, 5 tab phân hệ, dòng giá theo đầu mục. |
| Lọc Người thực hiện |  | Dropdown | — | Tất cả  | Lọc theo người thực hiện.  |
| Lọc khoảng Thời gian |  | Date range | — | (rỗng) | Từ ngày – Đến ngày.  |
| Lọc hành động |  | Dropdown | — | Tất cả  | Lọc theo trường Hành động. Chỉ áp dụng giá mua đầu vào. |
| Nút “Làm mới” |  | Button | — | — | Cập nhật danh sách lịch sử mới nhất. Áp dụng cho cả 4 chức năng. |
| Phân trang |  | Pagination | — | \[...\] | Bắt buộc với Giá mua định mức; các chức năng còn lại áp dụng tương tự.  |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

* BR-01: Mọi thao tác Thêm/Cập nhật/Kích hoạt/Xóa Bảng giá mua được ghi vào Lịch sử hoạt động (Thời gian, Người thực hiện, Hành động, Nội dung).

* BR-02: Tạo mới bảng giá mua thành công ghi hành động “Khởi tạo bảng giá”.

* BR-03: Chỉ bản ghi “Cập nhật” có nút “Xem chi tiết phiên bản”.

* BR-04: Cấu hình đầu mục giá ghi 3 hành động Thêm mới / Cập nhật / Xóa; chỉ bản ghi “Cập nhật” có “Xem chi tiết phiên bản”.

* BR-05: Cập nhật Giá mua định mức có hiệu lực ngay và được ghi vào Lịch sử hoạt động.

* BR-06: Cập nhật hàng loạt Giá mua/bán định mức ghi MỘT bản ghi riêng cho mỗi dòng được cập nhật; không ghi dòng không đổi.

* BR-07: Nội dung bản ghi cập nhật giá định mức lưu theo dạng “Giá cũ → Giá mới”.

* BR-08: Danh sách lịch sử của Giá mua định mức được phân trang.

* BR-09: Cảnh báo/highlight thay đổi giá nhà thầu chỉ là hiển thị, không tạo bản ghi lịch sử. 

* BR-10: Lịch sử hoạt động ở chế độ chỉ đọc, không sửa/xóa bản ghi.

* BR-11: Quyền xem Lịch sử đi theo quyền Xem của bản ghi tương ứng. 

### **3.1.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Bản ghi chưa có lịch sử | Thông tin | “Chưa có lịch sử hoạt động.” | Hiển thị bảng trống. |
| Tìm kiếm/lọc không có kết quả | Thông tin | “Không tìm thấy lịch sử hoạt động phù hợp.” | Hiển thị bảng trống. |
| Lỗi khi tải lịch sử | Lỗi | “Không thể tải lịch sử hoạt động. Vui lòng thử lại.”  | Giữ nguyên màn hình, cho phép bấm “Làm mới”. |

### **3.1.5. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Tài khoản & Phân quyền | Xác định Người thực hiện và quyền Xem lịch sử | Tài khoản & Phân quyền → Lịch sử hoạt động | Khi ghi log và khi mở Lịch sử | Thiếu quyền → ẩn khối/nút và chặn truy cập. |
| Giá mua đầu vào → Giá mua định mức → Giá bán định mức | Đồng bộ tham chiếu động giữa 3 tầng giá | Giá mua đầu vào → Giá mua định mức → Giá bán định mức | Khi dòng giá nhà thầu thay đổi | Log chỉ ghi ở module phát sinh thao tác; đồng bộ tự động chưa ghi log ở hạ nguồn. |
| Cấu hình đầu mục giá | Cung cấp tên đầu mục giá cho nội dung log | Cấu hình đầu mục giá → Giá mua đầu vào | Khi thêm/sửa dòng giá | Đầu mục bị tắt vẫn hiển thị trong log cũ. |

## **3.2. MODULE 2: QUẢN LÝ BÁO GIÁ**

### **3.2.1 Danh sách user story**

#### ***Yêu cầu báo giá: Xem lịch sử hoạt động*** 

| ID US | US\_HIS\_BG\_01 |
| :---- | :---- |
| **Tên Story** | Xem lịch sử hoạt động — Yêu cầu báo giá  |
| **User Story** | Là Dịch vụ khách hàng, tôi muốn xem lịch sử hoạt động của một Yêu cầu báo giá, để theo dõi các bước xử lý và lý do hủy/từ chối. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Quản lý báo giá / Yêu cầu báo giá |
| **Người Phụ trách (Owner)** | Trang BA |

Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn Chi tiết Yêu cầu báo giá hiển thị Lịch sử hoạt động gồm: Thời gian, Người thực hiện, Hành động, Nội dung.  | Thiếu cột hoặc thiếu Người thực hiện. |
| AC2 | Lọc theo Người thực hiện, Thời gian (khoảng thời gian), Hành động  | Không có bộ lọc hoặc bộ lọc hoạt động sai |
| AC3 | Dịch vụ khách hàng chỉ xem lịch sử của Yêu cầu báo giá thuộc khách hàng mình phụ trách. | Truy cập qua URL phiếu của khách hàng khác → báo “Bạn không có quyền truy cập”. |
| AC4 | Bản ghi Hủy yêu cầu hiển thị Người hủy, thời điểm hủy và lý do hủy. | Bản ghi Hủy thiếu lý do. |

Đặc tả cách lưu nội dung lịch sử hoạt động

*SRS nguồn chưa có story Xem lịch sử cho Yêu cầu báo giá; chỉ nêu sự kiện cần ghi nhận. Story này là đề xuất bổ sung.*

| Sự kiện phát sinh | Hành động ghi | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Lưu nháp / Gửi lần đầu | Khởi tạo | Tạo mới yêu cầu báo giá \[Mã yêu cầu báo giá\]. | Mã RFQ sinh khi lưu nháp (BR\_BG\_02). |
| Chỉnh sửa thông tin yêu cầu báo giá | Chỉnh sửa | Cập nhật thông tin: {Tên trường} \[Giá trị cũ\] → \[Giá trị mới\]. |  |
| Xóa phiếu Nháp | Không ghi | Xóa vĩnh viễn, không lưu vết. | Nguồn: ma trận trạng thái 3.3.3.1. |
| Gửi sang Pricing | Gửi yêu cầu báo giá  | Đã gửi yêu cầu báo giá cho pricing. | Nguồn: BR\_BG\_10. |
| K2 tiếp nhận phiếu | Tiếp nhận yêu cầu báo giá | Đã tiếp nhận và phụ trách phản hồi yêu cầu. | Nguồn: ma trận trạng thái (“Ghi nhận K2 phụ trách”). |
| K2 từ chối báo giá | Từ chối yêu cầu báo giá | Đã từ chối yêu cầu. Lý do từ chối: \[Lý do\]. | Nguồn: ma trận trạng thái (“Ghi nhận lý do từ chối”). |
| Khôi phục yêu cầu báo giá | Khôi phục yêu cầu báo giá | Đã khôi phục yêu cầu. | Nguồn: ma trận trạng thái. |
| K2 phát hành báo giá nội bộ | Phát hành báo giá nội bộ | \[Tên bộ phận của người thực hiện\] đã phát hành báo giá nội bộ mã \[Mã báo giá nội bộ\]. | Trạng thái chuyển sang Đã có báo giá. |
| K2 Thu hồi báo giá nội bộ | Thu hồi báo giá nội bộ | \[Tên bộ phận của người thực hiện\] đã thu hồi báo giá nội bộ mã \[Mã báo giá nội bộ\]. | Trạng thái chuyển sang Đang báo giá. |
| Hủy yêu cầu báo giá | Hủy yêu cầu báo giá | Đã hủy yêu cầu báo. Lý do hủy: \[Lý do\]. | Nguồn: US hủy YCBG, AC3. Tên hành động là đề xuất. |
| Lấy tự động báo giá thành công | Tự động xuất báo giá nội bộ | Tự động sinh báo giá nội bộ từ giá định mức. Báo giá nội bộ mã \[Mã báo giá nội bộ\] đã được phát hành. | Ghi cả ở Lịch sử YCBG và báo giá (BR-53). Người thực hiện: người bấm nút.  |
| Lấy tự động báo giá thất bại | Không ghi | Chỉ ghi log hệ thống. | Nguồn: BR-53. |
| Tạo báo giá khách hàng từ YCBG | Tạo báo giá khách hàng | Mã RC vừa sinh. | Nguồn: US\_BG\_09. YCBG giữ trạng thái Đã có báo giá. |

#### ***Báo giá nội bộ: Xem lịch sử hoạt động*** 

| ID US | US\_HIS\_BG\_02 |
| :---- | :---- |
| **Tên Story** | Xem lịch sử hoạt động — Báo giá nội bộ |
| **User Story** | Là Chuyên viên định giá, tôi muốn xem lịch sử hoạt động của một Báo giá nội bộ, để truy vết các thao tác làm thay đổi báo giá. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Quản lý báo giá / Báo giá nội bộ |
| **Người Phụ trách (Owner)** | Trang BA |

Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn Chi tiết báo giá có nhóm Lịch sử hoạt động gồm đúng 4 cột: Thời gian, Người thực hiện, Hành động, Nội dung. | Thiếu nhóm Lịch sử; thiếu/thừa cột so với đặc tả. |
| AC2 | Lọc theo Người thực hiện, Thời gian (khoảng thời gian), Hành động  | Không có bộ lọc hoặc bộ lọc hoạt động sai |
| AC3 | Mỗi thao tác làm thay đổi báo giá tự sinh 1 bản ghi: tạo mới, chỉnh sửa, phát hành, thu hồi, cập nhật kết quả, hết hiệu lực. | Thao tác thay đổi báo giá không được ghi nhận. |
| AC4 | Lịch sử chỉ ở chế độ xem danh sách. Không xem chi tiết, không chỉnh sửa, không xóa bản ghi. | Cho phép xem chi tiết, sửa hoặc xóa bản ghi lịch sử. |
| AC5 | Báo giá tạo tự động: chỉ lần thành công được ghi, Hành động “Lấy tự động báo giá”. | Ghi cả lần chạy thất bại vào Lịch sử. |

Đặc tả cách lưu nội dung lịch sử hoạt động

| Sự kiện phát sinh | Hành động ghi | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Lưu báo giá mới (trạng thái Nháp) | Tạo mới | Tạo mới báo giá nội bộ \[Mã báo giá nội bộ\] của yêu cầu báo giá \[Mã RFQ\]. | Nguồn: Bảng 5, BR17. |
| Chỉnh sửa thông tin  | Chỉnh sửa | Cập nhật thông tin: {Tên trường} \[Giá trị cũ\] → \[Giá trị mới\]. Đã cập nhật \[Số bảng giá dịch vụ được cập nhật\] bảng giá dịch vụ (bao gồm thêm/xóa bảng giá/cập nhật đơn giá) \- Nếu có bảng giá được cập nhật. | Nguồn: Bảng 5\. |
| Phát hành báo giá | Phát hành | Đã phát hành báo giá cho yêu cầu \[Mã RFQ\]. Báo giá bắt đầu có hiệu lực kể từ thời điểm phát hành \[Date time phát hành\] | Nguồn: BR14, Bảng 5\. |
| Thu hồi báo giá (bắt buộc nhập lý do) | Thu hồi | Đã thu hồi báo giá nội bộ. Lý do thu hồi: \[Lý do\].  | Nguồn: luồng nghiệp vụ “Thu hồi báo giá”. |
| Sales cập nhật Thành công/Thất bại trên Báo giá khách hàng | Ghi nhận kết quả báo giá | Đã ghi nhận kết quả từ báo giá khách hàng tương ứng: {Thành công/Thất bại}.  | Tự động, người dùng không cập nhật thủ công (BR20). |
| Quá Thời hạn hiệu lực | Hết hiệu lực | Báo giá tự động hết hiệu lực. Trạng thái chuyển \[Trạng thái ban đầu\] → \[Trạng thái mới\]. Người thực hiện: Hệ thống. | Nguồn: Bảng 5 (đang “updating”). |
| Lấy tự động báo giá thành công | Tự động xuất báo giá nội bộ | Người tạo/Người phát hành: Hệ thống. Mã RFQ nguồn. | Nguồn: BR-53, AC7. Thất bại chỉ ghi log hệ thống. |

#### ***Báo giá khách hàng: Xem lịch sử các phiên bản***

| ID US | US\_HIS\_BG\_03 |
| :---- | :---- |
| **Tên Story** | Xem lịch sử các phiên bản — Báo giá khách hàng |
| **User Story** | Là Dịch vụ khách hàng, tôi muốn bấm nút Lịch sử báo giá để xem các phiên bản trước đây của Báo giá khách hàng, để đối chiếu thay đổi theo thời gian. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Quản lý báo giá / Báo giá khách hàng |
| **Người Phụ trách (Owner)** | Trang BA |

Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC2 | Chỉ Dịch vụ khách hàng phụ trách khách hàng đó xem được lịch sử. | Người phụ trách khách hàng khác vẫn xem được. |
| AC1 | Màn Chi tiết báo giá có nhóm Lịch sử hoạt động gồm đúng 4 cột: Thời gian, Người thực hiện, Hành động, Nội dung. Nội dung bản ghi diễn giải riêng theo action: trường/đầu mục bị thay đổi, giá trị cũ → mới, lý do (nếu có). | Thiếu nhóm Lịch sử; thiếu/thừa cột so với đặc tả. |
| AC2 | Lọc theo Người thực hiện, Thời gian (khoảng thời gian), Hành động | Không có bộ lọc hoặc bộ lọc hoạt động sai |
| AC3 | Mỗi thao tác làm thay đổi báo giá tự sinh 1 bản ghi: Tạo mới, Xuất báo giá, Điều chỉnh giá chốt, Gộp đầu mục, Thiết lập tỷ giá & VAT, Reset báo giá, Đồng ý báo giá, Đồng ý báo giá bổ sung, Từ chối báo giá, Ngưng hoạt động, Hết hiệu lực (tự động) (chi tiết tại bảng đặc tả bên dưới). | Thao tác thay đổi báo giá không được ghi nhận. |
| AC4 | Lịch sử chỉ ở chế độ xem danh sách. Không xem chi tiết, không chỉnh sửa, không xóa bản ghi. | Cho phép xem chi tiết, sửa hoặc xóa bản ghi lịch sử. |
| AC5 | Thao tác lỗi/bị chặn bởi validate không ghi bản ghi lịch sử. Hành động tự động (RC hết hạn) ghi Người thực hiện là “Hệ thống”. | Ghi cả lần chạy thất bại vào Lịch sử. |

Đặc tả cách lưu nội dung lịch sử hoạt động

| Sự kiện phát sinh | Hành động ghi | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Tạo Báo giá khách hàng từ Yêu cầu báo giá mới (US\_BG\_09) | Tạo mới | Tạo mới báo giá \[Mã báo giá khách hàng\], \[Mã yêu cầu báo giá\], \[Khách hàng\]. | Nguồn: US\_BG\_09. |
| Xuất báo giá | Xuất báo giá | Báo giá khách hàng đã xuất file theo định dạng \[Định dạng file\]. |  |
| Điều chỉnh giá chốt | Điều chỉnh giá chốt | Diễn giải thay đổi: Đơn giá đầu mục {Mã đầu mục} \- biểu giá dịch vụ \[Mã bảng giá\]: \[Giá trị cũ\] → \[Giá trị mới\]. (List) | Nguồn: US\_BG\_13, BR\_BG\_13. |
| Gộp đầu mục | Gộp đầu mục | Diễn giải thay đổi: \[Đầu mục cũ 1\], \[Đầu mục cũ 2\] → \[Đầu mục mới\] (List) | Nguồn: US\_BG\_08, US\_BG\_17. |
| Thiết lập tỷ giá & VAT | Thiết lập tỷ giá & VAT | Diễn giải thay đổi từng trường:  {Tên trường} \[Giá trị cũ\] → \[Giá trị mới\]. | Nguồn: US\_BG\_16. |
| Reset báo giá | Reset báo giá | Đã khôi phục bản gốc của báo giá khách hàng. | Nội dung ghi nhận chi tiết do SRS nguồn chưa quy định. |
| Khách Đồng ý báo giá mới | Đồng ý báo giá | Khách hàng xác nhận đồng ý báo giá. Trạng thái Chờ xác nhận → Đang hiệu lực. Ghi nhận Báo giá khách hàng được gán/không gán cờ Mặc định (BR\_BG\_31). | Nguồn: US\_BG\_19 (Biến thể A). “Ngày khách đồng ý” chỉ lưu, không hiển thị. |
| Khách Đồng ý báo giá bổ sung cho báo giá khách hàng | Đồng ý báo giá bổ sung | Khách hàng xác nhận đồng ý báo giá bổ sung \[mã báo giá\]. Bổ sung biểu giá dịch vụ \[Mã bảng giá 1\], \[Mã bảng giá 2\] vào báo giá | Nguồn: US\_BG\_19 (Biến thể B), US\_BG\_15. |
| Khách Từ chối báo giá | Từ chối báo giá | Khách hàng từ chối báo giá. Trạng thái Chờ xác nhận→ Thất bại;  Lý do từ chối: \[Lý do\]. | Nguồn: US\_BG\_19. |
| Ngưng hoạt động chủ động | Ngưng hoạt động | Đã ngừng hoạt động, không thể tiếp tục sử dụng báo giá. Lý do: \[Lý do\]. | Nguồn: US\_BG\_23, BR\_BG\_42, BR\_BG\_43.  |
| Dòng giá bị hết hiệu lực do hiệu lực của báo giá nội bộ  | Hết hiệu lực biểu giá dịch vụ | Tự động hết hiêu lực các biểu giá: \[Danh sách mã bảng giá hết hiệu lực\]. Không thể tiếp tục sử dụng các biểu giá này. Người thực hiện: Hệ thống. |  |
| RC hết hạn tự động | Hết hiệu lực báo giá | Báo giá tự động hết hiệu lực. Trạng thái Đang hiệu lực → Hết hiệu lực.  Người thực hiện: Hệ thống. | Đồng thời ghi Audit Log AUTO\_EXPIRED. Nguồn: BR\_BG\_40. Chưa có màn xem Audit Log. |

### **3.2.2 Mô tả giao diện**

Link UI Design: \[Chèn link\]. Lịch sử hoạt động nằm ở màn Chi tiết; Lịch sử phiên bản mở dạng popup.

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Lọc Người thực hiện |  | Dropdown | — | Tất cả  | Lọc theo người thực hiện. |
| Lọc khoảng Thời gian |  | Date range | — | (rỗng) | Từ ngày – Đến ngày. |
| Lọc hành động |  | Dropdown | — | Tất cả  | Lọc theo trường Hành động. |
| Cột Thời gian |  | Datetime | — | — | Thời điểm thao tác, chỉ đọc. Áp dụng: Yêu cầu báo giá, Báo giá nội bộ, Báo giá khách hàng. |
| Cột Người thực hiện |  | Text | — | — | Người dùng thực hiện; thao tác tự động hiển thị “Hệ thống”. |
| Cột Hành động |  | Text | — | — | Báo giá nội bộ: Tạo mới / Chỉnh sửa / Thêm bảng giá dịch vụ / Xóa bảng giá dịch vụ / Cập nhật đơn giá / Phát hành / Thu hồi / Ghi nhận kết quả báo giá / Hết hiệu lực / Lấy tự động báo giá. Báo giá khách hàng: Tạo mới / Xuất báo giá / Điều chỉnh giá chốt / Gộp đầu mục / Thiết lập tỷ giá & VAT / Reset báo giá / Đồng ý báo giá / Đồng ý báo giá bổ sung / Từ chối báo giá / Ngưng hoạt động / Hết hiệu lực (tự động). Yêu cầu báo giá: xem 3.2.1. |
| Cột Nội dung |  | Text | — | — | Diễn giải chi tiết nội dung thay đổi của thao tác. |

### **3.2.3. Quy tắc nghiệp vụ (Business Rule)**

* BR-12: Mọi thao tác làm thay đổi Báo giá nội bộ được ghi vào Lịch sử hoạt động (Thời gian, Người thực hiện, Hành động, Nội dung); chỉ xem, không sửa/xóa.

* BR-13: Báo giá nội bộ tạo tự động: Người tạo và Người phát hành là “Hệ thống”.

* BR-14: Chỉ lần tạo báo giá tự động thành công được ghi vào Lịch sử của Yêu cầu báo giá và của báo giá; lần thất bại chỉ ghi log hệ thống.

* BR-15: Phát hành thành công ghi nhận Người phát hành và Thời điểm phát hành.

* BR-16: Thu hồi báo giá bắt buộc nhập lý do và được ghi vào Lịch sử hoạt động.

* BR-17: Kết quả báo giá (Thành công/Thất bại) được hệ thống tự ghi nhận theo trạng thái Báo giá khách hàng tương ứng.

* BR-18: Hủy Yêu cầu báo giá bắt buộc nhập lý do; ghi lịch sử gồm Người hủy, thời điểm hủy và lý do.

* BR-19: Phiếu Yêu cầu báo giá ở trạng thái Nháp khi xóa là xóa vĩnh viễn, không lưu vết.

* BR-20: Dịch vụ khách hàng chỉ xem Yêu cầu báo giá và Báo giá khách hàng của khách hàng mình phụ trách; lịch sử tuân theo phạm vi này.

* BR-21: Mỗi chức năng/action tương tác thành công trên Báo giá khách hàng ghi đúng 1 bản ghi lịch sử (Thời gian, Người thực hiện, Hành động, Nội dung); thao tác lỗi không ghi.

* BR-22: Khi khách Đồng ý báo giá bổ sung, phiên bản cũ của RC gốc được lưu vào Lịch sử phiên bản; phiên bản cũ chỉ xem. Ngoài ra vẫn ghi bản ghi “Đồng ý báo giá bổ sung”.

* BR-23: Gộp đầu mục trên RC Đang hiệu lực không sinh phiên bản mới.

* BR-24: Bảng giá hết hạn tự động (AUTO\_EXPIRED) và Báo giá ngưng chủ động (MANUALLY\_SUSPENDED) được phân biệt ở Audit Log.

* BR-25: Xuất báo giá có ghi lịch sử

### **3.2.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Lịch sử chưa có bản ghi | Thông tin | “Chưa có lịch sử hoạt động.”  | Hiển thị bảng trống. |
| Lỗi khi tải lịch sử | Lỗi | “Không thể tải lịch sử hoạt động. Vui lòng thử lại.”  | Giữ nguyên màn hình, cho phép tải lại. |
| Truy cập URL phiếu của khách hàng không phụ trách | Lỗi | “Bạn không có quyền truy cập” | Từ chối, ghi audit log phân quyền, chuyển về màn Danh sách. |

### **3.2.5. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Báo giá khách hàng → Báo giá nội bộ | Ghi nhận Kết quả báo giá vào lịch sử báo giá nội bộ | Báo giá khách hàng → Báo giá nội bộ | Action Đồng ý / Từ chối trên Báo giá khách hàng (cũng ghi bản ghi lịch sử bên Báo giá khách hàng) | Không cho cập nhật thủ công tại menu Báo giá nội bộ. |
| Yêu cầu báo giá ↔ Báo giá nội bộ | Ghi “Lấy tự động báo giá” ở cả hai bên | Yêu cầu báo giá → Báo giá nội bộ | Bấm “Lấy tự động báo giá” | Thất bại: không ghi lịch sử, chỉ ghi log hệ thống. |
| Giá bán định mức → Báo giá nội bộ | Chốt (snapshot) giá khi nạp đầu mục vào báo giá | Giá bán định mức → Báo giá nội bộ | Khi nạp đầu mục giá | Đổi giá bán định mức về sau không tự đồng bộ, không ghi lịch sử vào báo giá (BR8 nguồn). |
| Tài khoản & Phân quyền | Xác định Người thực hiện và phạm vi xem | Tài khoản & Phân quyền → Lịch sử hoạt động | Khi ghi log và khi mở Lịch sử | Thiếu quyền → ẩn và chặn truy cập. |

## **3.3. MODULE 3: CẤU HÌNH HỆ THỐNG** 

### **3.3.1 Danh sách user story**

#### ***Cấu hình danh mục: Xem lịch sử thao tác*** 

| ID US | US\_HIS\_CFG\_01 |
| :---- | :---- |
| **Tên Story** | Xem lịch sử thao tác — Cấu hình danh mục |
| **User Story** | Là Admin, tôi muốn xem lịch sử thao tác của một danh mục, để truy vết việc thêm, sửa, bật/tắt giá trị danh mục. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Cấu hình hệ thống / Quản lý danh mục |
| **Người Phụ trách (Owner)** | Trang BA |

Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Bấm nút “Lịch sử thao tác” ở màn bảng danh sách chi tiết của một danh mục để mở modal. Điều kiện: danh mục đã có ít nhất 1 lần thao tác Thêm/Sửa/Đổi trạng thái.   | Nút mở sai danh mục hoặc không mở được modal. |
| AC2 | Bảng log có 4 cột: Thời gian, Người thực hiện, Hành động, Nội dung. Hành động gồm: Thêm mới giá trị / Chỉnh sửa giá trị / Bật trạng thái / Tắt trạng thái. | Thiếu cột hoặc thiếu Hành động. |
| AC3 | Mỗi thao tác thành công trên giá trị danh mục (Thêm mới, Chỉnh sửa, Bật/Tắt trạng thái) sinh đúng 1 bản ghi; nội dung ghi theo đúng trường của từng danh mục (xem bảng đặc tả). | Một thao tác sinh nhiều bản ghi hoặc không sinh bản ghi; ghi thiếu trường đặc thù (Tên viết tắt chi cục, Địa điểm kho, Chọn khu vực...). |
| AC4 | Thao tác bị chặn (để trống, trùng Tên hiển thị, trùng Phường/Xã) hoặc Admin hủy ở bước xác nhận Tắt không ghi bản ghi. | Ghi bản ghi dù lưu thất bại hoặc Admin hủy xác nhận. |
| AC5 | Nội dung gồm mô tả và diff Trước/Sau với hành động Sửa hoặc Đổi trạng thái. Ví dụ: “Trạng thái: Tắt → Bật”. | Hành động Sửa/Đổi trạng thái không có diff Trước/Sau. |
| AC6 | Có ô tìm kiếm, lọc theo Người thực hiện, lọc theo khoảng Thời gian, phân trang ở cuối. | Lọc/tìm kiếm trả sai kết quả. |
| AC7 | Không cho sửa/xóa nội dung log, kể cả Admin. | Cho phép sửa/xóa bản ghi log. |

Đặc tả cách lưu nội dung lịch sử hoạt động

*Log tách theo từng danh mục (12 danh mục dùng chung). Ghi ngay lập tức, không trễ; lưu tối thiểu 12 tháng. Mỗi thao tác \= 1 bản ghi 4 trường; trường nhập đặc thù của danh mục được ghi trong Nội dung.*

| Sự kiện phát sinh | Hành động ghi | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Thêm mới giá trị — danh mục phẳng (Loại xe, Đơn vị tính, Loại hình XNK, Loại hình lưu kho, Tiền tệ, Nhóm hàng, Đặc tính hàng hóa, Địa điểm sang tải, Chi cục hải quan) | Thêm mới giá trị | Tạo mới \[Tên danh mục\] mã \[Mã giá trị\], \[Tên hiển thị\]. VD: Tạo mới Loại hình lưu kho mã VT-001 Kho đông lạnh | Nguồn: UC-DM-02, BR-DM-07, BR-DM-03. Nội dung chi tiết là đề xuất. |
| Thêm mới giá trị — Cửa khẩu | Thêm mới giá trị | Tạo mới cửa khẩu mã \[Mã giá trị\], \[Tên cửa khẩu\]. | Nguồn: UC-DM-02, BR-DM-16, BR-DM-17. |
| Thêm mới giá trị — Kho | Thêm mới giá trị | Tạo mới kho mã \[Mã giá trị\], \[Tên kho\]. | Nguồn: SRS Quản lý danh mục, mục 3.5 (Địa điểm kho bắt buộc). |
| Thêm mới Địa điểm vận tải | Thêm mới giá trị | Tạo mới địa điểm vận tải mã \[Mã giá trị\], \[Tên địa điểm vận tải\]. | Nguồn: UC-DM-06, BR-DM-09, BR-DM-18. Mã chưa thống nhất TPZ/TRZ (Phụ lục B). |
| Chỉnh sửa giá trị danh mục | Chỉnh sửa giá trị | Mô tả thao tác chỉnh sửa theo từng trường thay đổi “\[Trường\]: \[Giá trị cũ\] → \[Giá trị mới\]”. | Nguồn: UC-DM-03, UC-DM-05. |
| Sửa Địa điểm vận tải | Chỉnh sửa giá trị | Mô tả thao tác chỉnh sửa theo từng trường thay đổi “\[Trường\]: \[Giá trị cũ\] → \[Giá trị mới\]”. Riêng cập nhật Phường/Xã ghi rõ “Thêm phường xã \[Tên phường xã\]. Bỏ chọn phường xã \[Tên phường xã\]”. | Nguồn: UC-DM-06, BR-DM-10. Nội dung chi tiết là đề xuất. |
| Bật trạng thái giá trị (toggle Tắt → Bật) | Bật trạng thái | Diff: “Trạng thái giá trị Tắt kích hoạt → Bật kích hoạt”. | Ghi ngay khi toggle đổi trạng thái. Nguồn: UC-DM-04. |
| Tắt trạng thái giá trị (toggle Bật → Tắt) | Tắt trạng thái | Diff: “Trạng thái giá trị Bật kích hoạt → Tắt kích hoạt”. | Chỉ ghi sau khi Admin xác nhận cảnh báo (BR-DM-01, mục 3.5). Loại hình Xuất Nhập Khẩu: có cảnh báo ảnh hưởng Cấu hình chặng (BR-DM-06). |
| Thao tác lưu thất bại (trùng tên, lỗi hệ thống...) | Không ghi | Không phát sinh bản ghi. | Áp dụng quy ước chung 1.3. |

#### ***Cấu hình chặng (Quy tắc chặng hành trình): Xem lịch sử hoạt động*** 

| ID US | US\_HIS\_CFG\_02 |
| :---- | :---- |
| **Tên Story** | Xem lịch sử hoạt động — Cấu hình chặng (Quy tắc chặng hành trình) |
| **User Story** | Là Admin cấu hình, tôi muốn xem Lịch sử hoạt động của Quy tắc chặng hành trình, trong đó mỗi chức năng/action (Thêm, Sửa, Kích hoạt, Vô hiệu hóa, Xóa) được ghi thành một bản ghi riêng, để truy vết ai đã thay đổi bộ quy tắc điều phối Chặng và khi nào. |
| **Độ Ưu tiên (MoSCoW)** | Must have |
| **Module** | Cấu hình hệ thống / Cấu hình chặng |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

Acceptance Criteria

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Mỗi action thành công trên Quy tắc chặng sinh đúng 1 bản ghi 4 trường: Thời gian, Người thao tác, Hành động, Nội dung. Hành động gồm: Thêm mới / Chỉnh sửa/ Kích hoạt / Vô hiệu hóa / Xóa. | Action sinh nhiều bản ghi hoặc không sinh bản ghi; thiếu trường. |
| AC2 | Nội dung bản ghi nêu Mã quy tắc, Tên quy tắc và thay đổi cụ thể của action (giá trị cũ → mới với Chỉnh sửa; trạng thái cũ → mới với Kích hoạt/Vô hiệu hóa). | Nội dung không nêu quy tắc nào hoặc không nêu thay đổi. |
| AC3 | Nút “Lịch sử hoạt động” hiển thị ở màn Chi tiết quy tắc, mở modal chỉ hiển thị bản ghi của quy tắc đó; có lọc Hành động, lọc Người thao tác, lọc khoảng Thời gian, phân trang. | Modal hiển thị bản ghi của quy tắc khác. |
| AC4 | Chỉ người dùng có quyền Xem quy tắc mới thấy nút và xem được lịch sử. | Người không có quyền Xem vẫn mở được lịch sử. |
| AC5 | Mô phỏng (Leg Engine Simulator) và thao tác bị chặn (thiếu quyền, trùng 5 trường, xóa quy tắc đã có Phiếu dịch vụ) không ghi bản ghi lịch sử. | Ghi bản ghi khi chỉ chạy Mô phỏng hoặc khi thao tác bị chặn. |
| AC6 | Bản ghi chỉ đọc, không sửa/xóa kể cả Admin; bản ghi vẫn xem được sau khi quy tắc bị xóa. | Cho phép sửa/xóa bản ghi; mất bản ghi khi xóa quy tắc. |

Đặc tả cách lưu nội dung lịch sử hoạt động

*Toàn bộ nội dung đặc tả dưới đây là: SRS Cấu hình chặng (v10.0) chưa có Lịch sử hoạt động, audit log chi tiết từng lần sửa đang ngoài phạm vi Sprint hiện tại. Mỗi action thành công \= 1 bản ghi; lưu độc lập với quy tắc để không mất khi quy tắc bị xóa.*

| Sự kiện phát sinh | Hành động ghi | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Thêm mới Quy tắc chặng (US\_CH\_02) | Thêm mới  |  Tạo mới quy tắc chặng \[Mã quy tắc\], \[Tên quy tắc\], Phạm vi thực hiện \[Phạm vi thực hiện\], Phương thức vận tải \[Phương thức vận tải\], Loại hình vận tải \[Loại hình vận tải\], Điểm đi \[Điểm đi\], Điểm đến \[Điểm đến\],  | Nguồn thao tác: US\_CH\_02, BR-CH-17. Ghi sau khi hệ thống sinh mã thành công. |
| Chỉnh sửa Quy tắc chặng (US\_CH\_03) | Chỉnh sửa | Cập nhật thông tin: {Tên trường} \[Giá trị cũ\] → \[Giá trị mới\]. Thay đổi Cấu trúc Chặng: “Danh sách chặng \[List giá trị cũ & Các dịch vụ trong chặng\]  → \[List Giá trị mới & Các dịch vụ trong chặng\]”. | Mã quy tắc không sửa được nên không có trong diff. Thay đổi chỉ áp dụng cho Phiếu dịch vụ phát sinh mới (nguồn AC18). |
| Kích hoạt quy tắc (Dừng hoạt động → Đang hoạt động) | Kích hoạt  | Đã kích hoạt quy tắc và có thể bắt đầu sử dụng. | Nguồn thao tác: BR-CH-38. Quyền chung Kích hoạt/Vô hiệu hóa. |
| Vô hiệu hóa quy tắc (Đang hoạt động → Dừng hoạt động) | Vô hiệu hóa  | Đã tắt kích hoạt quy tắc và không được sử dụng trong các phiếu dịch vụ mới. | Quy tắc Dừng hoạt động không được Leg Engine chọn tự động (US\_CH\_07). |
| Xóa Quy tắc chặng (US\_CH\_04) | Xóa | Đã xóa quy tắc \[Mã quy tắc\] khỏi danh sách. | Nguồn thao tác: BR-CH-22 (chỉ xóa khi chưa có Phiếu dịch vụ sử dụng), xóa vĩnh viễn nên bản ghi giữ snapshot. |
| Chạy Mô phỏng (Leg Engine Simulator) | Không ghi | Không phát sinh bản ghi vì không thay đổi dữ liệu. | Nguồn: US\_CH\_07. |
| Thao tác bị từ chối (thiếu quyền, trùng 5 trường, xóa quy tắc đã sử dụng) | Không ghi | Không phát sinh bản ghi lịch sử; lỗi phân quyền vẫn ghi log hệ thống theo SRS nguồn. | Nguồn: AC phân quyền US\_CH\_02/03/04. |

#### ***Ghi nhận Audit Log — Tài khoản & Phân quyền (chưa có chức năng Xem)***

SRS Phân quyền quy định lưu Audit Log nhưng chưa có màn Xem Audit Log. Phần này chỉ mô tả cách lưu; chức năng Xem cần xác nhận (Phụ lục B, mục 9).

Cấu trúc bản ghi Audit Log:

* Thời gian: timestamp chuẩn lúc xảy ra hành động (ví dụ 30/09/2026 13:30:45).

* Người thực hiện: tên người dùng thực hiện hành động.

* Hành động: Tạo người dùng, Cập nhật thông tin, Gán vai trò, Xóa vai trò, Khóa tài khoản, Reset mật khẩu...

* Nội dung: lưu dạng text theo format \[Tên button thao tác\] \[Tên đối tượng bị tác động\].

| Sự kiện phát sinh | Hành động ghi | Nội dung lưu | Ghi chú / Nguồn |
| :---- | :---- | :---- | :---- |
| Lịch sử thao tác \- Tài khoản |  |  |  |
| Tạo tài khoản người dùng | Khởi tạo | Tạo mới tài khoản \[Mã\], \[Họ tên\] | Nguồn: BR\_PQ\_16. |
| Cập nhật thông tin / vai trò người dùng | Cập nhật  | Cập nhật thông tin: {Tên trường} \[Giá trị cũ\] → \[Giá trị mới\]. | Nguồn: BR\_PQ\_18. Đổi vai trò có hiệu lực tức thì (BR\_PQ\_17). |
| Reset mật khẩu về mặc định | Reset mật khẩu | Đã khôi phục mật khẩu về mật khẩu mặc định. | Nguồn: BR\_PQ\_19. |
| Khóa tài khoản | Khóa tài khoản | Đã khóa tài khoản \[Mã\], \[Họ tên\], không thể tiếp tục truy cập hệ thống bằng tài khoản này. | Nguồn: SRS Phân quyền, mục 4\. |
| Mở khóa tài khoản | Mở khóa tài khoản | Đã mở khóa tài khoản \[Mã\], \[Họ tên\], có thể tiếp  tục truy cập hệ thống bằng tài khoản này. | Nguồn chỉ nêu Khóa; Mở khóa là đề xuất. |
| Vô hiệu hóa vai trò | Vô hiệu hóa | Đã vô hiệu hóa vai trò \[Tên vai trò\] | Nguồn: SRS Phân quyền, mục 4\. |
| Lịch sử thao tác \- Bộ phận |  |  |  |
| Cập nhật bộ phận | Cập nhật  | Cập nhật thông tin: {Tên trường} \[Giá trị cũ\] → \[Giá trị mới\]. | Nguồn: BR\_PQ\_57. |
| Vô hiệu hóa bộ phận | Vô hiệu hóa  | Đã vô hiệu hóa bộ phận \[Tên bộ phận\] | Nguồn: BR\_PQ\_57. |
| Xóa bộ phận | Cập nhật / Vô hiệu hóa / Xóa | Đã xóa bộ phận \[Tên bộ phận\] | Nguồn: BR\_PQ\_57. |

### **3.3.2 Mô tả giao diện**

Link UI Design: \[Chèn link\]. Lịch sử thao tác của danh mục mở dạng modal từ màn bảng danh sách chi tiết.

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Nút “Lịch sử thao tác” |  | Button | — | — | Mở modal Lịch sử của danh mục đang xem. |
| Ô tìm kiếm |  | Text | \[...\] | (rỗng) | Tìm kiếm trong log. |
| Lọc Người thực hiện |  | Dropdown | — | Tất cả  | Lọc theo người thực hiện. |
| Lọc khoảng Thời gian |  | Date range | — | (rỗng) | Từ ngày – Đến ngày. |
| Lọc hành động |  | Dropdown | — | Tất cả  | Lọc theo trường Hành động. |
| Cột Thời gian |  | Datetime | — | — | Thời điểm thao tác, chỉ đọc. |
| Cột Người thực hiện |  | Text | — | — | Người thực hiện thao tác (SRS nguồn gọi “Người thực hiện”). |
| Cột Hành động |  | Text | — | — | Thêm mới giá trị / Chỉnh sửa giá trị / Bật trạng thái / Tắt trạng thái. |
| Cột Nội dung |  | Text | — | — | Mô tả và diff Trước/Sau, ví dụ “Trạng thái: Tắt → Bật”. |
| Phân trang |  | Pagination | — | \[...\] | Hiển thị ở cuối modal. |

### **3.3.3. Quy tắc nghiệp vụ (Business Rule)**

* BR-24: Mọi thao tác Thêm mới/Chỉnh sửa/Bật-Tắt trạng thái trên giá trị danh mục được ghi ngay vào Lịch sử thao tác theo đúng cấu trúc 4 trường (Thời gian, Người thao tác, Hành động, Nội dung); dữ liệu log là append-only, không sửa/xóa kể cả Admin.

* BR-25: Log lưu tối thiểu 12 tháng và ghi nhận ngay lập tức, không trễ.

* BR-32: Với danh mục có trường đặc thù (Chi cục Hải quan, Cửa khẩu, Kho, Địa điểm vận tải), bản ghi Thêm mới/Chỉnh sửa ghi cả các trường đặc thù trong Nội dung; hành động Tắt chỉ ghi sau khi Admin xác nhận cảnh báo.

* BR-30: Mỗi action thành công trên Quy tắc chặng (Thêm mới, Chỉnh sửa, Kích hoạt, Vô hiệu hóa, Xóa) ghi đúng 1 bản ghi 4 trường (Thời gian, Người thao tác, Hành động, Nội dung); Mô phỏng và thao tác bị chặn không ghi. 

* BR-29: Thao tác tạo, cập nhật (kèm trạng thái trước/sau), reset mật khẩu, khóa tài khoản, và cập nhật/vô hiệu hóa/xóa bộ phận đều phải ghi Audit Log.

### **3.3.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Lọc log không có kết quả | Thông tin | “Không tìm thấy lịch sử thao tác phù hợp.”  | Hiển thị bảng trống. |
| Lịch sử hoạt động chưa có bản ghi | Thông tin | “Chưa có lịch sử hoạt động.” | Hiển thị bảng trống. |
| Lỗi khi tải lịch sử thao tác | Lỗi | “Không thể tải lịch sử thao tác. Vui lòng thử lại.”  | Giữ nguyên modal, cho phép tải lại. |

### **3.3.5. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Tài khoản & Phân quyền | Xác định Admin và người thực hiện thao tác | Tài khoản & Phân quyền → Quản lý danh mục | Khi ghi log và khi mở Lịch sử | Không phải Admin → không thao tác được (Sprint 1). |
| Cấu hình chặng ↔ Phiếu dịch vụ | Điều kiện cho phép Xóa quy tắc (chưa có Phiếu dịch vụ sử dụng) trước khi ghi bản ghi “Xóa quy tắc” | Phiếu dịch vụ → Cấu hình chặng | Khi bấm Xóa quy tắc | Quy tắc đã được sử dụng → chặn xóa, không ghi lịch sử (BR-CH-22). |
| Quản lý danh mục → Cấu hình chặng | Cảnh báo ảnh hưởng khi sửa/tắt giá trị “Loại hình Xuất Nhập Khẩu” | Quản lý danh mục → Cấu hình chặng | Khi sửa/tắt giá trị thuộc nhóm này | Hiển thị cảnh báo trước khi Admin xác nhận; log vẫn ghi ở Quản lý danh mục (BR-DM-06). |

# **Phụ lục A. Hướng dẫn áp dụng mô hình Hybrid theo Sprint**

* **Refinement:** bẻ Epic → User Story \+ AC; đánh dấu \[PHỨC TẠP\] cho story nhiều nhánh/nhiều actor để bổ sung Use Case.

* **Sprint Planning:** chỉ story đạt Definition of Ready mới đưa vào Sprint Backlog; đính wireframe & business rule.

* **Trong Sprint:** US \+ AC là living doc; tester biến AC (và Use Case flow) trực tiếp thành test case.

* **Review/Done:** cập nhật lại US/UC theo thực tế build, đồng bộ Data Dictionary & bảng tích hợp.

