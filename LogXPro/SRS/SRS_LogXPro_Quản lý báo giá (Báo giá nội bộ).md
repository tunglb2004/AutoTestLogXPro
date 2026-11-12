**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification \- SRS)*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu “Quản lý báo giá” (báo giá nội bộ Pricing → Sales) |
| :---- | :---- |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | Trang BA |
| **Ngày tạo** | \[dd/MM/yyyy\] |
| **Ngày cập nhật** | 14/10/2026 |
| **Phiên bản** | v3.0 – Cập nhật SP4 |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Menu “Quản lý báo giá” cho phép Chuyên viên định giá (Pricing Analyst) khởi tạo và quản lý các báo giá nội bộ gửi cho bộ phận Kinh doanh (Sales), dựa trên Yêu cầu báo giá (RFQ) do Sales tạo.

Trên mỗi báo giá, người dùng xây dựng cấu trúc bảng giá chi tiết theo từng loại dịch vụ (Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát, Sang tải); mỗi dịch vụ gồm nhiều dòng giá (Cố định, Phụ phí) với Giá mua định mức, Giá bán định mức, Đơn giá báo giá, % Lợi nhuận. Hệ thống tự động tổng hợp giá trị tài chính và theo dõi vòng đời phát hành của báo giá.

Bên cạnh luồng tạo thủ công, menu hỗ trợ chức năng Tự động tạo Báo giá nội bộ (Auto-BGNB): hệ thống tự sinh và phát hành một báo giá nội bộ hoàn chỉnh từ dữ liệu của Yêu cầu báo giá — mix các giá trị thuộc tính đã nhập tại Yêu cầu báo giá thành các bảng giá dịch vụ, tự khớp dòng giá từ Giá bán định mức và tính sẵn các chỉ tiêu tài chính (chi tiết tại mục 3.2).

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Xem danh sách báo giá kèm bộ chỉ số tổng quan (Tổng số báo giá, Đã phát hành, Tỷ lệ chốt giá); tìm kiếm, lọc, xuất dữ liệu (Export).

* Khởi tạo báo giá với mã do hệ thống tự sinh; chọn Yêu cầu báo giá (RFQ) làm nguồn tự động điền thông tin khách hàng và thông tin dịch vụ → Xây dựng danh sách bảng giá theo loại dịch vụ: Chọn loại dịch vụ → chọn giá trị của thuộc tính → chọn dòng giá cho từng đầu mục giá; nhập Đơn giá; hệ thống tự tính % Lợi nhuận, Tổng đơn giá và Lợi nhuận dự kiến.

* Chỉnh sửa danh sách bảng giá dịch vụ: thêm mới/xóa bảng giá dịch vụ, cập nhật Đơn giá ngay trong danh sách bảng giá.

* Chỉnh sửa báo giá chỉ áp dụng cho báo giá ở trạng thái Nháp hoặc Thu hồi

* Quản lý vòng đời trạng thái phát hành: Nháp, Chờ phê duyệt, Đã phê duyệt,Từ chối, Đã phát hành, Thu hồi, Hết hiệu lực; 

* Ghi nhận Kết quả báo giá (Thành công/Thất bại) tự động từ Báo giá khách hàng.

* Xem chi tiết báo giá (thông tin chung, thông tin dịch vụ, danh sách bảng giá, tổng hợp bảng giá) và Bảng lịch sử hoạt động của Báo giá.

* Phát hành báo giá cho các báo giá ở trạng thái Nháp, Đã phê duyệt, Thu hồi → Người dùng xác nhận  → Phát hành báo giá thành công, Báo giá chuyển trạng thái “Đã phát hành”. Sau khi Phát hành báo giá, Báo giá được hiển thị trong màn chi tiết của Yêu cầu báo giá (RFQ)

* Thu hồi báo giá đã phát hành khi Sale chưa tạo Báo giá khách hàng từ Yêu cầu báo giá đã đính kèm (thao tác tại màn Chi tiết báo giá, có nhập Lý do thu hồi); báo giá chuyển trạng thái Thu hồi, ẩn khỏi màn Yêu cầu báo giá.

* Phân quyền theo chức năng: Xem / Sửa / Phát hành / Xóa; action chỉ hiển thị và thao tác được khi người dùng có quyền tương ứng.

* Luồng phê duyệt ngoại lệ và các trạng thái Chờ duyệt / Đã duyệt / Từ chối / Đã gửi báo giá (Sent Sales): CHƯA triển khai trong giai đoạn này. Thẻ chỉ số “Chờ duyệt ngoại lệ” và các nút chuyển trạng thái Exceptions / Sent Sales trên giao diện tạm thời không có luồng nghiệp vụ đứng sau.

* Chi tiết validate của Export/Import — chỉ mô tả nút (Đang cập nhật).

* Tự động tạo Báo giá nội bộ (Auto-BGNB) từ dữ liệu Yêu cầu báo giá; báo giá được phát hành ở trạng thái “Đã phát hành” — chi tiết tại mục 3.2.

* Engine Auto-BGNB: kiểm tra thuộc tính nguồn; sinh bảng giá dịch vụ theo tổ hợp (mix) các giá trị thuộc tính cho 5 loại dịch vụ; tự động khớp dòng giá từ Giá bán định mức; tự động tính Đơn giá, % Lợi nhuận, Tổng đơn giá bảng giá, Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%).

* Quy tắc xử lý thiếu Giá bán định mức theo 4 cấp (dòng giá / bảng giá / loại dịch vụ / báo giá); ngưỡng kiểm soát số lượng tổ hợp và cơ chế xử lý nền.

* Đồng bộ giá bán định mức cho Báo giá nội bộ tự động tại màn Chi tiết báo giá nội bộ (chỉ khi chưa có Báo giá khách hàng) — chi tiết tại US\_ABG\_08.

* Tự động chuyển Trạng thái dòng giá (Đang hiệu lực → Hết hạn) khi Giá bán định mức mà dòng giá tham chiếu được cập nhật; hiển thị tag "Hết hạn" tại dòng giá và disable bảng giá chứa dòng giá đó; chỉ áp dụng với dòng giá đang ở trạng thái Đang hiệu lực — chi tiết tại US\_QUO\_12.

**Ngoài phạm vi (Out-of-scope):**

* Tạo/sửa/quản lý RFQ (Yêu cầu báo giá) — thuộc phạm vi bộ phận Sales, ngoài tài liệu này; báo giá chỉ liên kết ID RFQ đã tồn tại.

* Luồng phê duyệt ngoại lệ và các trạng thái Chờ duyệt / Đã duyệt / Từ chối / Đã gửi báo giá (Sent Sales): CHƯA triển khai trong giai đoạn này. Thẻ chỉ số “Chờ duyệt ngoại lệ” và các nút chuyển trạng thái Exceptions / Sent Sales trên giao diện tạm thời không có luồng nghiệp vụ đứng sau.

* Quản lý Báo giá khách hàng (bản báo giá chính thức gửi khách hàng) — báo giá nội bộ chỉ nhận kết quả Thành công/Thất bại từ nguồn này; luồng và cơ chế đồng bộ cần làm rõ thêm.

* Kiểm tra ràng buộc ngưỡng lợi nhuận theo menu “Chính sách biên lợi nhuận” — độc lập, chưa liên kết ràng buộc.

* Tạo hợp đồng dịch vụ khách hàng khi báo giá “Thành công” (downstream) — module không trong phạm vi 6 menu hiện tại.

* Quy đổi đa tiền tệ (mặc định VNĐ; các bảng giá dùng chung tiền tệ của báo giá).

* Xem chi tiết Lịch sử chỉnh sửa của báo giá \- View chi tiết toàn bộ bản ghi trước thay đổi và sau thay đổi được đánh giá là không quá cần thiết trong quá trình vận hành và không cho vào phạm vi triển khai dự án.

* Phần thao tác của chức năng Auto-BGNB trên màn Chi tiết Yêu cầu báo giá (nút “Lấy tự động BGNB”, chuyển trạng thái Yêu cầu báo giá, hiển thị khối Báo giá nội bộ, tạo Báo giá khách hàng từ báo giá tự động) — đặc tả tại SRS Quản lý YCBG \+ Báo giá KH.

* Ghi nhận các lần chạy tạo báo giá tự động thất bại vào Lịch sử hoạt động — không triển khai.

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

[https\://drive.google.com/file/d/1au6UDousRrn\_UgjHlglnhdxQ26z6qh\_2/view?usp=sharing](https://drive.google.com/file/d/1au6UDousRrn_UgjHlglnhdxQ26z6qh_2/view?usp=sharing) 

**Mô tả luồng chính:**

* Bộ phận Sales tạo Yêu cầu báo giá — RFQ (ngoài phạm vi). Chuyên viên định giá khởi tạo báo giá, chọn RFQ chưa gắn báo giá để hệ thống tự động điền thông tin khách hàng và thông tin dịch vụ → Xây dựng danh sách bảng giá theo từng loại dịch vụ: Chọn loại dịch vụ → nhập thuộc tính theo loại dịch vụ, chọn dòng giá cho từng đầu mục giá từ bảng Giá bán định mức, nhập Đơn giá; hệ thống tự tính % Lợi nhuận từng đầu mục, Tổng đơn giá từng bảng giá và Tổng đơn giá dịch vụ của báo giá, % Lợi nhuận dự kiến của báo giá. → Nhấn Lưu, báo giá ở trạng thái Nháp.

* Phát hành báo giá cho Sales (Nháp → Đã phát hành); hệ thống ghi Người phát hành, Thời điểm phát hành và hiển thị báo giá nội bộ trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm.

* Trước khi Sale tạo Báo giá khách hàng, Chuyên viên định giá có thể Thu hồi báo giá Đã phát hành (nhập Lý do thu hồi tại màn Chi tiết báo giá); báo giá chuyển trạng thái Thu hồi, ẩn khỏi màn Chi tiết Yêu cầu báo giá, và vẫn được Phát hành lại hoặc Chỉnh sửa.

* Sales tạo Báo giá khách hàng từ báo giá nội bộ và cập nhật kết quả Thành công/Thất bại; hệ thống tự động ghi nhận Kết quả báo giá cho báo giá nội bộ tham chiếu theo trạng thái Báo giá khách hàng tương ứng. Chỉ số Tỷ lệ chốt (Won) cập nhật theo kết quả.

* Báo giá quá Thời hạn hiệu lực tự động chuyển sang trạng thái Hết hiệu lực, bất kể đang ở trạng thái nào.

* Toàn bộ thao tác trên báo giá được ghi nhận vào Lịch sử hoạt động.

* Tự động tạo Báo giá nội bộ (Auto-BGNB): Dịch vụ khách hàng (K1) bấm “Lấy tự động BGNB” trên màn Chi tiết Yêu cầu báo giá (Nháp / Chờ báo giá) → hệ thống kiểm tra dữ liệu đầu vào → mix tổ hợp thuộc tính theo từng dịch vụ được yêu cầu → nạp đầu mục giá → khớp dòng Giá bán định mức → áp dụng quy tắc thiếu giá 4 cấp → nếu còn ≥ 1 bảng giá khả dụng: tạo và phát hành báo giá nội bộ, Yêu cầu báo giá chuyển “Đã có báo giá”; nếu không: chặn và báo lỗi, Yêu cầu báo giá giữ nguyên trạng thái. Chi tiết tại mục 3.2.

* Đồng bộ giá định mức: với Báo giá nội bộ nguồn Tự động (Đã phát hành / Thu hồi) và Yêu cầu báo giá chưa có Báo giá khách hàng, người dùng bấm “Đồng bộ giá định mức” tại màn Chi tiết báo giá → hệ thống lấy lại giá theo dòng Giá bán định mức đã gắn hoặc gắn dòng mới theo quy tắc của Lấy tự động BGNB → tính lại quy tắc thiếu giá và các chỉ tiêu tổng hợp (US\_ABG\_08).

* Hết hạn dòng giá: khi Giá bán định mức của một dòng định mức được cập nhật tại menu Giá bán định mức, hệ thống tự động chuyển các dòng giá "Đang hiệu lực" đang gắn Mã giá bán định mức đó sang "Hết hạn", hiển thị tag "Hết hạn" và disable bảng giá chứa dòng giá; (US\_QUO\_12).

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tiếp nhận Yêu cầu báo giá | Bộ phận Sales (ngoài phạm vi) | Sales tạo Yêu cầu báo giá (RFQ) từ nhu cầu khách hàng | Nhu cầu khách hàng | RFQ tồn tại (mã RFQ) | Mỗi RFQ chỉ được gắn duy nhất 1 báo giá |
| Khởi tạo báo giá (Thêm mới báo giá) | Chuyên viên định giá | Nhập Tên báo giá, chọn RFQ; Hệ thống tự điền thông tin khách hàng, thông tin dịch vụ | RFQ chưa gắn báo giá | \- | Bắt buộc: Tên báo giá (không trùng), Mã yêu cầu báo giá |
| Xây dựng bảng giá & dòng giá (Thêm mới báo giá) | Chuyên viên định giá | Thêm bảng giá theo loại dịch vụ; nhập thuộc tính; chọn dòng giá cho từng đầu mục giá; nhập Đơn giá | Đầu mục giá (Loại giá: Cố định, Phụ phí), Giá mua/bán định mức  | Bảng giá mới kèm ID tự sinh \+ chỉ tiêu tổng hợp | 1 đầu mục giá – 1 dòng giá; thuộc tính bắt buộc nhập đầy đủ |
| Hoàn tất thêm mới báo giá (Thêm mới báo giá) | Chuyên viên định giá | Nhấn Lưu báo giá. Hệ thống tự sinh Mã báo giá | Form Thêm mới Báo giá đầy đủ thông tin | Báo giá trạng thái Nháp | Điền đầy đủ các trường thông tin bắt buộc |
| Phát hành báo giá | Chuyên viên định giá | Kiểm tra hợp lệ và phát hành cho Sales | Báo giá Nháp / Thu hồi hợp lệ | Báo giá Đã phát hành \+ Người phát hành \+ Thời điểm phát hành Báo giá đã phát hành hiển thị trên Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm | Có ≥ 1 dòng giá và chỉ áp dụng báo giá ở trạng thái “Nháp” hoặc “Thu hồi” |
| Thu hồi báo giá | Chuyên viên định giá | Thu hồi báo giá Đã phát hành tại màn Chi tiết báo giá khi Sale chưa tạo Báo giá khách hàng; nhập Lý do thu hồi và xác nhận | Báo giá Đã phát hành, Sale chưa tạo Báo giá khách hàng (Updating — cơ chế xác định) | Báo giá Thu hồi, ẩn khỏi màn Chi tiết Yêu cầu báo giá, ghi Lịch sử hoạt động | Chỉ áp dụng báo giá Đã phát hành; Lý do thu hồi bắt buộc nhập; dùng chung phân quyền với chức năng Phát hành |
| Cập nhật kết quả báo giá khách hàng | Bộ phận Sales (ngoài phạm vi) | Sale ghi nhận kết quả báo giá ngay trên Báo giá khách hàng.  | Phản hồi từ khách hàng qua Sales | RFQ Thành công / Thất bại | Áp dụng theo trạng thái của Báo giá khách hàng tương ứng, không phụ thuộc trạng thái hiện tại của báo giá nội bộ |
| Ghi nhận kết quả báo giá nội bộ | Hệ thống | Hệ thống ghi nhận lại kết quả thành công/thất bại vào Báo giá nội bộ. | Trạng thái Báo giá khách hàng | Báo giá Thành công / Thất bại | Chỉ áp dụng với Báo giá khách hàng đã có trạng thái Thành công / Thất bại |
| Hết hiệu lực | Hệ thống | Tự động chuyển Hết hiệu lực khi Thời hạn hiệu lực | Báo giá Đã phát hành quá Thời hạn hiệu lực | Báo giá Hết hiệu lực | Áp dụng bất kể báo giá đang ở trạng thái nào |
| Hết hạn dòng giá | Hệ thống | Tự động chuyển các dòng giá Đang hiệu lực đang gắn Mã giá bán định mức vừa được cập nhật sang Hết hạn; hiển thị tag "Hết hạn" Disable bảng giá chứa dòng giá; tính lại chỉ tiêu tổng hợp | Giá bán định mức được cập nhật (giá trị mới khác giá cũ) | Dòng giá Hết hạn; bảng giá disable | Chỉ áp dụng dòng giá Đang hiệu lực (BR-56 → BR-60) |
| **Luồng Tự động tạo Báo giá nội bộ (Auto-BGNB)** |  |  |  |  |  |
| Lấy tự động BGNB | Chuyên viên định giá (K2) | Bấm “Lấy tự động BGNB” trên màn Chi tiết Yêu cầu báo giá (thao tác đặc tả tại SRS Quản lý YCBG \+ Báo giá KH) | Yêu cầu báo giá ở Nháp / Chờ báo giá | Yêu cầu sinh báo giá; dữ liệu đầu vào chốt tại thời điểm bấm nút | BR-46 |
| Kiểm tra dữ liệu đầu vào | Hệ thống | Kiểm tra thuộc tính nguồn của từng dịch vụ được tick và các trường thông tin báo giá cần cho việc tạo tự động Thiếu dữ liệu → dừng luồng và báo lỗi | Dữ liệu Yêu cầu báo giá | Kết quả hợp lệ / thông báo lỗi | BR-32, BR-52 |
| Sinh tổ hợp thuộc tính (mix) | Hệ thống | Tích Descartes giá trị thuộc tính theo từng loại dịch vụ Khử trùng giá trị và tổ hợp | Thuộc tính tại Yêu cầu báo giá | Danh sách tổ hợp \= danh sách bảng giá | BR-34, BR-35, BR-36 |
| Kiểm tra ngưỡng tổ hợp | Hệ thống | Đối chiếu số tổ hợp với ngưỡng 50 / 200 | Số tổ hợp | Chạy đồng bộ / chạy nền / chặn | BR-46 |
| Nạp đầu mục giá | Hệ thống | Lấy đầu mục Cố định & Phụ phí đang kích hoạt Kho bãi: lọc thêm theo Loại kho | Cấu hình đầu mục giá | Danh sách dòng giá trống | BR-37 |
| Khớp & chọn dòng giá | Hệ thống | Khớp Giá bán định mức theo đầu mục \+ bộ thuộc tính Áp dụng tie-break 3 tầng | Giá bán định mức, Giá mua định mức | Dòng giá đã điền giá (snapshot) | BR-38, BR-39, BR-40 |
| Áp dụng quy tắc thiếu giá | Hệ thống | Badge cấp 1 tại dòng giá Disable bảng giá cấp 2 Banner loại dịch vụ cấp 3 | Kết quả khớp dòng giá | Trạng thái từng bảng giá | BR-41, BR-42, BR-43 |
| Kiểm tra điều kiện tạo | Hệ thống | Đếm số bảng giá khả dụng của toàn báo giá | Danh sách bảng giá | Cho tạo / chặn tạo | BR-44 |
| Tạo & phát hành báo giá | Hệ thống | Sinh Mã báo giá Tính các chỉ tiêu tổng hợp Đặt trạng thái “Đã phát hành” | Bảng giá khả dụng | Báo giá nội bộ “Đã phát hành” | BR-45, BR-47 |
| Cập nhật Yêu cầu báo giá | Hệ thống | Chuyển Yêu cầu báo giá sang “Đã có báo giá” (đặc tả tại SRS Quản lý YCBG \+ Báo giá KH) | Báo giá đã phát hành | Yêu cầu báo giá “Đã có báo giá” | SRS Quản lý YCBG \+ Báo giá KH |
| Đồng bộ giá định mức | Người dùng có quyền “Lấy tự động BGNB” | Bấm “Đồng bộ giá định mức” tại màn Chi tiết báo giá nội bộ Hệ thống cập nhật lại giá và tính lại các chỉ tiêu | Báo giá nguồn Tự động, Đã phát hành / Thu hồi, chưa có Báo giá khách hàng | Báo giá đã cập nhật giá (giữ nguyên trạng thái) | BR-54, BR-55 |
| Rà soát & điều chỉnh | Chuyên viên định giá (K2) | Thu hồi báo giá tự động Chỉnh sửa thủ công và phát hành lại | Báo giá “Tự động” | Báo giá chuyển sang “Thủ công” | BR-45, BR-49 (theo US\_QUO\_11, US\_QUO\_03) |

# **3\. Đặc tả Tính năng**

## **3.1. MODULE: Quản lý báo giá**

### **3.1.1. Danh sách User story**

**Ghi chú độ ưu tiên (MoSCoW):** Must have – không thể thiếu để sản phẩm hoạt động; Should have – rất quan trọng, có thể workaround/trì hoãn; Could have – cải thiện trải nghiệm, làm khi dư nguồn lực.

#### **User story 1: Xem danh sách báo giá và chỉ số tổng quan**

| ID US | US\_QUO\_01 |
| :---- | :---- |
| **Tên Story** | Xem danh sách báo giá và chỉ số tổng quan |
| **User story** | Là Chuyên viên định giá, tôi muốn xem danh sách báo giá kèm các chỉ số tổng quan cùng bộ tìm kiếm/lọc, để nắm nhanh tình trạng toàn bộ báo giá và truy cập nhanh vào từng báo giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn danh sách hiển thị 4 thẻ chỉ số:  Tổng báo giá,  Chờ duyệt ngoại lệ,  Đã phát hành,  Tỷ lệ chốt.  Thẻ “Chờ duyệt ngoại lệ” hiển thị 0 (hoặc được ẩn) do luồng phê duyệt ngoài phạm vi (xem BR16). | Sai số liệu thẻ; hoặc thẻ “Chờ duyệt ngoại lệ” hiển thị số \> 0 khi chưa có luồng duyệt. |
| AC2 | Mỗi dòng danh sách hiển thị đúng 10 cột:  Mã báo giá,  Tên báo giá,  Mã yêu cầu báo giá,  Khách hàng,  Tổng đơn giá,  Lợi nhuận dự kiến,  Trạng thái,  Kết quả Thời hạn hiệu lực.  Thao tác. | Thiếu cột hoặc sai dữ liệu hiển thị so với chi tiết báo giá. |
| AC3 | Cột Trạng thái hiển thị một trong 7 giá trị: Nháp, Chờ phê duyệt, Đã phê duyệt, Từ chối, Đã phát hành, Thu hồi, Hết hiệu lực. Cột Kết quả hiển thị Thành công hoặc Thất bại; để trống khi báo giá chưa có kết quả (xem BR2). | Hiển thị Thành công/Thất bại ở cột Trạng thái; hoặc cột Kết quả hiển thị giá trị khi báo giá chưa có kết quả. |
| AC4 | Ô tìm kiếm cho phép tìm theo Mã báo giá / Tên báo giá / Mã yêu cầu báo giá;  Bộ lọc theo Trạng thái / Khách hàng / Hạng khách hàng / Thời gian hiệu lực (Khoảng ngày) chỉ hiển thị báo giá đúng trạng thái đã chọn. Sắp xếp theo các cột: Tổng đơn giá, Lợi nhuận dự kiến,  | Tìm kiếm/lọc trả về sai kết quả hoặc không lọc. |
| AC5 | Các chức năng thao tác trên từng báo giá (Sửa/Xóa) chỉ khả dụng khi người dùng có quyền tương ứng.  Action “Xóa” chỉ hiển thị với báo giá Nháp (xem BR14). | Hiển thị action khi không có quyền; hoặc hiện Phát hành/Xóa trên báo giá không phải Nháp. |
| AC6 | Nút “Export” trên màn danh sách cho phép xuất dữ liệu danh sách. (Chi tiết định dạng/validate Export chưa mô tả trong phiên bản tài liệu này.) | Nút Export không hoạt động hoặc thiếu nút. |
| AC7 | Người dùng KHÔNG có quyền Xem bị chặn truy cập menu và không thấy dữ liệu. | Người dùng không có quyền Xem vẫn xem được danh sách. |

#### **User story 2: Thêm mới báo giá**

| ID US | US\_QUO\_02 |
| :---- | :---- |
| **Tên Story** | Thêm mới báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn thêm mới một báo giá để gửi cho Sale soạn báo giá khách hàng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Các trường bắt buộc gồm Tên báo giá và Mã yêu cầu báo giá liên quan (RFQ), Thời hạn hiệu lực; nếu còn trống, thao tác lưu bị chặn và hệ thống báo lỗi thiếu thông tin bắt buộc. | Cho lưu khi còn trống Tên báo giá hoặc Mã yêu cầu báo giá. |
| AC2 | Danh sách chọn Mã yêu cầu báo giá (RFQ) chỉ hiển thị các yêu cầu báo giá CHƯA gắn báo giá nào & trạng thái “Đang báo giá”;  Các yêu cầu báo giá đã có báo giá không xuất hiện trong danh sách chọn (xem BR1 — quan hệ 1 Yêu cầu báo giá – 1 báo giá). | Danh sách chọn hiển thị cả yêu cầu báo giá đã gắn báo giá; hoặc cho phép tạo báo giá thứ hai cho cùng một yêu cầu báo giá. |
| AC3 | Nhập Tên báo giá trùng với báo giá đã tồn tại: thao tác lưu bị chặn và hệ thống báo “Tên báo giá đã tồn tại”. | Cho tạo báo giá trùng Tên báo giá. |
| AC4 | Khi chọn Mã yêu cầu báo giá (RFQ), hệ thống tự động điền và hiển thị ở chế độ chỉ đọc: Khách hàng (ID \- Tên khách hàng) theo RFQ; Hạng khách hàng theo Khách hàng vừa điền; Ghi chú yêu cầu báo giá lấy từ Ghi chú chung của RFQ. | Chọn RFQ nhưng không tự điền; hoặc cho phép sửa các trường tự điền. |
| AC5 | Khi chọn Mã yêu cầu báo giá (RFQ), nhóm “Thông tin dịch vụ” và “Dịch vụ yêu cầu” (danh sách dịch vụ được yêu cầu kèm các thông tin yêu cầu tương ứng) được tự động điền từ RFQ, hiển thị chỉ đọc: Loại hình xuất nhập khẩu, Nhóm hàng, Đặc tính hàng hóa, Loại xe, Quy cách đóng gói, Ghi chú yêu cầu dịch vụ và thông tin từng dịch vụ yêu cầu. | Không tự điền nhóm Thông tin dịch vụ; hoặc không hiển thị đủ các giá trị khi RFQ có nhiều giá trị. Không hiển thị nhóm "Dịch vụ yêu cầu"; hoặc hiển thị khi chưa chọn RFQ; hoặc cho phép chỉnh sửa dữ liệu nhóm này. |
| AC6 | Các đầu mục xuất hiện trong bảng giá dịch vụ chỉ gồm các đầu mục có Loại giá thuộc {Cố định, Phụ phí} và được Kích hoạt;  Đầu mục có Loại giá “Phát sinh” và Đầu mục không được kích hoạt KHÔNG xuất hiện trong bảng giá dịch vụ (xem BR5). | Bảng giá dịch vụ hiển thị đầu mục có Loại giá Phát sinh. |
| AC7 | Tại nhóm Danh sách bảng giá, người dùng thêm mới bảng giá dịch vụ (chi tiết luồng tại US\_QUO\_04) hoặc xóa bảng giá dịch vụ (chi tiết tại US\_QUO\_05) và sửa Đơn giá của dòng giá (chi tiết tại US\_QUO\_06).  Sau mỗi thao tác thêm mới/xóa, hệ thống tự động tính lại Lợi nhuận (%) của dòng giá (theo BR6), Tổng đơn giá của bảng giá, Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%) (theo BR9, BR10). Trong mỗi loại dịch vụ có thể có nhiều bảng giá. | Không thêm/xóa được bảng giá; hoặc Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%) không được tính lại sau thao tác. |
| AC8 | Trường Đơn giá trong bảng giá dịch vụ là bắt buộc (đối với tất cả các dòng giá) Nếu còn trống khi lưu, thao tác lưu bị chặn và hệ thống báo lỗi thiếu thông tin bắt buộc. | Cho lưu khi còn trống Đơn giá. |
| AC9 | Khi lưu hợp lệ, báo giá được lưu ở trạng thái Nháp và điều hướng sang màn chi tiết/soạn thảo; thao tác Hủy không lưu bất kỳ thay đổi nào. Hệ thống tự sinh Mã báo giá theo cấu trúc IPSYYMMDD-XXX (IPS: tiền tố cố định; YY: 2 số cuối của năm, MM: tháng, DD: ngày tạo hiện tại; XXX: số thứ tự tạo trong ngày, bắt đầu từ 001); trường này ở chế độ chỉ đọc, người dùng không được chỉnh sửa (xem BR11) | Lưu thành công nhưng trạng thái không phải Nháp; hoặc Hủy vẫn lưu. Không tự sinh mã; sai cấu trúc mã; hoặc cho phép người dùng sửa Mã báo giá. |
| AC10 | Người dùng KHÔNG có quyền Tạo: nút “Thêm mới báo giá” bị ẩn và thao tác tạo bị chặn. | Người dùng không có quyền vẫn tạo được báo giá. |
| AC11 | Khi nhấn "Tạo báo giá", hệ thống đối chiếu các dịch vụ được yêu cầu (có tick trong RFQ) với Loại dịch vụ của các bảng giá dịch vụ đã tạo trong báo giá. Nếu có dịch vụ được yêu cầu (Loại dịch vụ của dịch vụ yêu cầu) mà chưa tạo bảng giá dịch vụ có Loại dịch vụ tương ứng, hệ thống hiển thị cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo báo giá?" — người dùng Xác nhận thì tiếp tục tạo, Hủy thì quay lại màn tạo (xem BR27). | Không kiểm tra/không cảnh báo khi thiếu bảng giá của dịch vụ được yêu cầu; hoặc chặn cứng không cho tạo báo giá. |
| AC12 | Khi đổi Mã yêu cầu báo giá (RFQ) mà báo giá đã có ≥ 1 bảng giá dịch vụ: hệ thống hiển thị popup “Thay đổi Yêu cầu báo giá sẽ xóa toàn bộ bảng giá dịch vụ đã tạo. Tiếp tục?”. Xác nhận → xóa toàn bộ bảng giá dịch vụ trên form, nạp lại thông tin theo RFQ mới và tính lại các chỉ tiêu tổng hợp (dữ liệu chỉ được lưu chính thức khi bấm Lưu); Hủy → giữ nguyên RFQ cũ. Báo giá chưa có bảng giá dịch vụ → đổi RFQ không hiển thị popup. Áp dụng cho cả báo giá nguồn Tự động (xem BR26). | Đổi RFQ nhưng bảng giá dịch vụ theo RFQ cũ vẫn giữ nguyên; hoặc xóa bảng giá không qua xác nhận. |

#### **User story 3: Chỉnh sửa báo giá**

| ID US | US\_QUO\_03 |
| :---- | :---- |
| **Tên Story** | Chỉnh sửa báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn chỉnh sửa một báo giá đang ở trạng thái Nháp trên màn hình có sẵn dữ liệu đã tạo, để hoàn thiện báo giá trước khi phát hành. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Chỉnh sửa chỉ khả dụng với báo giá ở trạng thái Nháp / Từ chối / Thu hồi; với báo giá ở các trạng thái khác (Chờ phê duyệt, Đã phê duyệt, Đã phát hành/Hết hiệu lực), chức năng bị ẩn và thao tác chỉnh sửa bị chặn (xem BR3). | Mở được màn chỉnh sửa với báo giá không ở trạng thái Nháp/Từ chối. |
| AC2 | Màn Chỉnh sửa báo giá có bố cục và các nhóm thông tin giống màn Thêm mới báo giá (Thông tin chung, Thông tin dịch vụ, Danh sách bảng giá, Tổng hợp bảng giá), với toàn bộ dữ liệu đã tạo được hiển thị sẵn. | Thiếu nhóm thông tin; hoặc dữ liệu đã lưu không được hiển thị sẵn. |
| AC3 | Mã báo giá giữ nguyên giá trị đã sinh khi tạo và ở chế độ chỉ đọc.  Các trường Tên báo giá, thời hạn hiệu lực, Điều kiện áp dụng: cho phép sửa;  Các trường Tên báo giá, thời hạn hiệu lực: Bắt buộc điền Hệ thống kiểm tra trùng tên với các báo giá khác (không tính chính báo giá đang sửa). | Mã báo giá bị thay đổi khi sửa; hoặc báo trùng tên với chính báo giá đang chỉnh sửa. Các trường bắt buộc để trống vẫn Lưu chỉnh sửa thành công. |
| AC4 | Khi người dùng đổi sang Mã yêu cầu báo giá (RFQ) khác, danh sách chọn vẫn chỉ hiển thị các yêu cầu báo giá chưa gắn báo giá (cộng thêm RFQ đang gắn với chính báo giá này);  Hệ thống tự điền lại Khách hàng, Hạng khách hàng, Ghi chú yêu cầu báo giá, nhóm Thông tin dịch vụ và các dịch vụ yêu cầu theo RFQ mới.  Khi đổi Mã yêu cầu báo giá (RFQ) mà báo giá đã có ≥ 1 bảng giá dịch vụ: hệ thống hiển thị popup “Thay đổi Yêu cầu báo giá sẽ xóa toàn bộ bảng giá dịch vụ đã tạo. Tiếp tục?”. Xác nhận → xóa toàn bộ bảng giá dịch vụ trên form, nạp lại thông tin theo RFQ mới và tính lại các chỉ tiêu tổng hợp (dữ liệu chỉ được lưu chính thức khi bấm Lưu); Hủy → giữ nguyên RFQ cũ. Báo giá chưa có bảng giá dịch vụ → đổi RFQ không hiển thị popup. Áp dụng cho cả báo giá nguồn Tự động (xem BR26). | Đổi RFQ nhưng các thông tin tự điền không được cập nhật lại theo RFQ mới. Đổi RFQ nhưng bảng giá dịch vụ theo RFQ cũ vẫn giữ nguyên; hoặc xóa bảng giá không qua xác nhận. |
| AC5 | Trong màn Chỉnh sửa, người dùng thêm mới/xóa bảng giá dịch vụ (US\_QUO\_04, US\_QUO\_05) và cập nhật Đơn giá của dòng giá (US\_QUO\_06) ngay trong Danh sách bảng giá; sau mỗi thao tác, hệ thống tự động tính lại Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%). | Các chỉ tiêu tổng hợp không được tính lại sau thao tác thêm/xóa bảng giá hoặc cập nhật Đơn giá. |
| AC6 | Trường Đơn giá trong bảng giá dịch vụ là bắt buộc (đối với tất cả các dòng giá) Nếu còn trống khi lưu, thao tác lưu bị chặn và hệ thống báo lỗi thiếu thông tin bắt buộc. | Cho lưu khi còn trống Đơn giá. |
| AC7 | Khi lưu thay đổi hợp lệ, hệ thống cập nhật báo giá, giữ nguyên trạng thái và ghi nhận thao tác vào Lịch sử hoạt động (xem BR17); thao tác Hủy không lưu bất kỳ thay đổi nào. | Lưu thay đổi làm đổi trạng thái báo giá; không ghi nhận Lịch sử hoạt động; hoặc Hủy vẫn lưu. |
| AC8 | Người dùng KHÔNG có quyền Sửa: chức năng Chỉnh sửa bị ẩn và thao tác bị chặn. | Người dùng không có quyền vẫn chỉnh sửa được báo giá. |
| AC9 | Khi nhấn "Tạo báo giá", hệ thống đối chiếu các dịch vụ được yêu cầu (có tick trong RFQ) với Loại dịch vụ của các bảng giá dịch vụ đã tạo trong báo giá. Nếu có dịch vụ được yêu cầu (Loại dịch vụ của dịch vụ yêu cầu) mà chưa tạo bảng giá dịch vụ có Loại dịch vụ tương ứng, hệ thống hiển thị cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo báo giá?" — người dùng Xác nhận thì tiếp tục tạo, Hủy thì quay lại màn tạo (xem BR27). | Không kiểm tra/không cảnh báo khi thiếu bảng giá của dịch vụ được yêu cầu; hoặc chặn cứng không cho tạo báo giá. |
| AC10 | Tại màn Chỉnh sửa, không hiển thị bảng giá ở trạng thái disable, kèm tag "Hết hạn" tại dòng giá; xử lý theo BR-59 (chi tiết tại US\_QUO\_12 AC8). | Bảng giá Hết hạn bị ẩn khỏi màn Chỉnh sửa; |

#### **User story 4: Thêm bảng giá dịch vụ trong báo giá**

| ID US | US\_QUO\_04 |
| :---- | :---- |
| **Tên Story** | Thêm bảng giá dịch vụ trong báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn thêm một bảng giá dịch vụ ngay trong màn Thêm mới/Chỉnh sửa báo giá bằng cách nhập thuộc tính dịch vụ và chọn dòng giá cho từng đầu mục giá, để dựng cấu trúc giá của báo giá theo đúng dữ liệu định mức đã có. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Tại màn Tạo/Sửa Báo giá, nhấn “Thêm bảng giá dịch vụ” mở modal “Thêm bảng giá dịch vụ mới” với các trường bắt buộc: Loại dịch vụ, Tên bảng giá cụ thể. | Không mở được modal; hoặc modal thiếu trường bắt buộc Loại dịch vụ / Tên bảng giá cụ thể. |
| AC2 | Khi chọn Loại dịch vụ, hệ thống hiển thị: (a) bộ thông tin thuộc tính tương ứng với loại dịch vụ đã chọn; (b) danh sách giá gồm 9 cột theo thứ tự: ID, Đầu mục giá, Loại giá, Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức, Đơn giá, Lợi nhuận (%). Bổ sung ràng buộc: Dropdown "Loại dịch vụ" chỉ hiển thị các loại dịch vụ có trong Dịch vụ yêu cầu của Yêu cầu báo giá (RFQ) đã chọn; loại dịch vụ không được yêu cầu trong RFQ không xuất hiện trong dropdown (xem BR25). | Chọn Loại dịch vụ nhưng không hiển thị bộ thuộc tính tương ứng; hoặc danh sách giá sai/thiếu cột so với đặc tả. Dropdown Loại dịch vụ hiển thị cả loại dịch vụ không có trong Dịch vụ yêu cầu của RFQ. |
| AC3 | Danh sách giá hiển thị các dòng đầu mục giá lấy từ cấu hình đầu mục giá;  \- Chỉ hiển thị các đầu mục có Loại giá thuộc {Cố định, Phụ phí}, và được kích hoạt. KHÔNG hiển thị đầu mục có Loại giá “Phát sinh” và đầu mục không kích hoạt (xem BR5).  \- Mỗi đầu mục giá có nút chọn dòng giá nằm trong chính đầu mục đó và chỉ được chọn 1 dòng giá (quan hệ 1 đầu mục giá – 1 dòng giá, xem BR18). \- Đối với Loại dịch vụ \= Kho bãi, sau khi chọn Loại kho, hệ thống hiển thị các đầu mục giá có Loại kho chứa Loại kho đã chọn. Nếu không có đầu mục giá tương ứng, hệ thống hiển thị thông báo Không có đầu mục giá nào cho dịch vụ này. | Hiển thị đầu mục Loại giá Phát sinh; danh sách đầu mục không lấy từ cấu hình đầu mục giá; hoặc một đầu mục cho phép chọn nhiều hơn 1 dòng giá. |
| AC4 | Người dùng nhập giá trị cho bộ thông tin thuộc tính;  Các thuộc tính bắt buộc nhập đầy đủ.  Khi nhấn nút chọn dòng giá của một đầu mục, hệ thống hiển thị danh sách dòng giá đã được lọc theo:  (a) đầu mục giá chứa nút chọn;  (b) các giá trị thuộc tính người dùng đã nhập. Bổ sung: Các trường thuộc tính là dropdown và chỉ chọn trong phạm vi giá trị đã nhập tại Yêu cầu báo giá theo bảng ánh xạ "Nguồn giá trị các trường thuộc tính" (mục 3.1.2) — xem BR25. Riêng Điểm đi, Điểm đến là hai dropdown riêng, mỗi dropdown chỉ chọn trong các điểm đi / điểm đến đã nhập tại Yêu cầu báo giá; cho phép ghép chéo điểm đi và điểm đến; không có Địa điểm vận tải phù hợp → dropdown rỗng kèm thông báo. | Cho chọn dòng giá khi chưa nhập đủ thuộc tính bắt buộc; hoặc danh sách dòng giá không được lọc theo đầu mục và giá trị thuộc tính đã nhập. Trường thuộc tính cho nhập/chọn giá trị ngoài phạm vi giá trị đã nhập tại Yêu cầu báo giá. |
| AC5 | Dòng giá đã chọn được điền vào đúng đầu mục giá tương ứng trong modal (Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức);  Đơn giá là trường bắt buộc trong bảng giá dịch vụ. Đơn giá mặc định bằng Giá bán định mức và cho phép người dùng cập nhật.  Khi có Đơn giá/cập nhật Đơn giá, hệ thống tự động tính lại Lợi nhuận (%) của dòng theo BR6; trường Lợi nhuận (%) ở chế độ chỉ đọc. | Dòng giá được điền sai đầu mục; Đơn giá mặc định không bằng Giá bán định mức; hoặc Lợi nhuận (%) không tự tính lại. |
| AC6 | Nhấn nút “Tạo bảng giá dịch vụ”:  Một bảng giá mới được thêm vào Danh sách bảng giá của báo giá  Hệ thống tự động sinh ID cho bảng giá theo cấu trúc: IQYYMM-XXX, trong đó: IQ (Internal Quote) là tiền tố cố định YYMM là 2 số cuối của năm/tháng hiện tại XXX bắt đầu từ 001  Hệ thống tự động sinh ID riêng cho từng dòng giá trong bảng giá (xem BR19).  Hệ thống tự động tính lại Tổng đơn giá của bảng giá, Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%). | Không tạo được bảng giá; không tự sinh ID bảng giá hoặc ID dòng giá; hoặc các chỉ tiêu tổng hợp không được tính lại. |
| AC7 | Nhấn “Tạo bảng giá dịch vụ” khi còn trống trường bắt buộc (Loại dịch vụ, Tên bảng giá cụ thể, Đơn giá của tất cả dòng giá) hoặc chưa nhập đủ thuộc tính bắt buộc: hệ thống chặn tạo và báo lỗi thiếu thông tin bắt buộc. | Cho tạo bảng giá khi còn thiếu trường bắt buộc hoặc thuộc tính bắt buộc. |
| AC8 | Nhấn “Tạo bảng giá dịch vụ” khi chưa chọn dòng giá cho tất cả đầu mục giá: hệ thống chặn tạo và báo “Vui lòng chọn đầy đủ dòng giá trong các đầu mục”. | Tạo được bảng giá dịch vụ có đầu mục trống dòng giá. |
| AC9 | Thao tác Hủy trong modal không tạo bảng giá và không thay đổi dữ liệu báo giá. | Hủy modal nhưng bảng giá vẫn được thêm vào báo giá. |
| AC10 | Được phép tạo nhiều bảng giá trong 1 loại dịch vụ.   | Chỉ được tạo 1 bảng giá trong 1 loại dịch vụ. Tạo đến bảng thứ 2 hệ thống báo lỗi. |
| AC11 | Khi nhấn "Tạo bảng giá dịch vụ", hệ thống kiểm tra bộ thuộc tính của bảng giá đang tạo với các bảng giá dịch vụ khác đã tạo trong cùng báo giá: Nếu trùng toàn bộ (cùng Loại dịch vụ và trùng giá trị của tất cả trường thuộc tính) → chặn tạo và báo "Bộ thuộc tính của dịch vụ này đã trùng với {ID – Tên bảng giá}. Vui lòng chọn bộ thông tin khác." (xem BR29). Chỉ khác Tên bảng giá KHÔNG được coi là khác bộ thuộc tính. Ngoại lệ: bảng giá dịch vụ đang bị disable của báo giá tạo tự động (BR-42) không được tính khi kiểm tra trùng; khi Lưu báo giá, bảng giá bị disable trùng bộ thuộc tính sẽ bị ghi đè bởi bảng giá mới tạo. | Tạo được 2 bảng giá dịch vụ có cùng Loại dịch vụ và trùng toàn bộ giá trị thuộc tính trong cùng một báo giá. |
| AC12 | Trong modal Thêm bảng giá dịch vụ, khi người dùng thay đổi giá trị của 1 trong các trường thuộc bộ thuộc tính sau khi đã chọn ≥ 1 dòng giá: hệ thống hiển thị popup “Thay đổi thuộc tính sẽ xóa toàn bộ dòng giá đã chọn trong bảng giá này. Tiếp tục?”. Xác nhận → cập nhật thuộc tính và xóa dòng giá đã gắn của TẤT CẢ đầu mục giá trong bảng (Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức, Đơn giá, Lợi nhuận (%)), tính lại các chỉ tiêu tổng hợp; Hủy → giữ nguyên giá trị thuộc tính cũ. Chưa chọn dòng giá nào → đổi thuộc tính không hiển thị popup. | Đổi thuộc tính nhưng dòng giá đã gắn vẫn giữ nguyên; chỉ xóa dòng giá của một số đầu mục; hoặc xóa dòng giá không qua xác nhận. |
| AC13 | Tạo bảng giá thành công, các dòng giá tạo mới có trạng thái mặc định là Đang hiệu lực | Các dòng giá không có trạng thái hoặc trạng thái Hết hạn |

#### **Use story 5: Xóa bảng giá dịch vụ**

| ID US | US\_QUO\_05 |
| :---- | :---- |
| **Tên Story** | Xóa bảng giá dịch vụ |
| **User Story** | Là Chuyên viên định giá, tôi muốn xóa một bảng giá dịch vụ khỏi báo giá đang ở trạng thái Nháp, để loại bỏ bảng giá không còn phù hợp và giữ báo giá đúng với phạm vi dịch vụ thực tế. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Xóa bảng giá dịch vụ hiển thị trên từng bảng giá trong nhóm Danh sách bảng giá tại màn Thêm mới/Chỉnh sửa báo giá. | Xóa được bảng giá khi báo giá không ở trạng thái Nháp; hoặc không có chức năng xóa trên từng bảng giá. |
| AC2 | Khi nhấn Xóa, hệ thống hiển thị bước xác nhận “Bạn có chắc muốn xóa bảng giá dịch vụ này?” trước khi thực hiện. | Xóa ngay không có bước xác nhận. |
| AC3 | Sau khi xác nhận, bảng giá dịch vụ và toàn bộ dòng giá thuộc bảng giá đó bị loại khỏi báo giá. | Bảng giá bị xóa nhưng các dòng giá thuộc bảng vẫn còn trong báo giá. |
| AC4 | Sau khi xóa, hệ thống tự động tính lại Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%) của báo giá (xem BR9, BR10). | Các chỉ tiêu tổng hợp không được tính lại sau khi xóa bảng giá. |
| AC5 | Khi xóa bảng giá cuối cùng, báo giá không còn dòng giá nào; hệ thống vẫn cho lưu báo giá ở trạng thái Nháp nhưng chặn phát hành theo điều kiện tối thiểu 1 dòng giá (xem BR14). | Chặn xóa bảng giá cuối cùng; hoặc cho phát hành báo giá không còn dòng giá nào. |
| AC6 | Người dùng KHÔNG có quyền Xóa: chức năng Xóa bảng giá dịch vụ bị ẩn và thao tác bị chặn. | Người dùng không có quyền vẫn xóa được bảng giá dịch vụ. |

#### **Use story 6: Sửa đơn giá trong bảng giá dịch vụ**

| ID US | US\_QUO\_06 |
| :---- | :---- |
| **Tên Story** | Sửa đơn giá trong bảng giá dịch vụ |
| **User Story** | Là Chuyên viên định giá, tôi muốn sửa Đơn giá của từng dòng giá ngay trong Danh sách bảng giá của báo giá, để điều chỉnh nhanh giá chào mà không phải mở lại modal bảng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Trường Đơn giá của từng dòng giá cho phép chỉnh sửa trực tiếp trong nhóm Danh sách bảng giá tại màn Thêm mới/Chỉnh sửa báo giá. | Sửa được Đơn giá khi báo giá không ở trạng thái Nháp; hoặc phải mở lại modal mới sửa được Đơn giá. |
| AC2 | Các trường Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức của dòng giá giữ nguyên giá trị và ở chế độ chỉ đọc khi người dùng sửa Đơn giá. | Giá mua định mức hoặc Giá bán định mức bị thay đổi khi sửa Đơn giá. |
| AC3 | Sau mỗi lần sửa Đơn giá, hệ thống tự động tính lại theo thứ tự: Lợi nhuận (%) của dòng giá (BR6) → Tổng đơn giá của bảng giá (BR9) → Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%) của báo giá (BR9, BR10). | Một trong các chỉ tiêu Lợi nhuận (%), Tổng đơn giá bảng giá, Tổng đơn giá dịch vụ, Lợi nhuận dự kiến không được tính lại. |
| AC4 | Nhập Đơn giá không hợp lệ (không phải số hoặc nhỏ hơn 0): hệ thống chặn nhập và không cập nhật dòng giá. | Nhập thành công giá trị âm hoặc không phải số. |

#### **User story 7: Xem chi tiết báo giá**

| ID US | US\_QUO\_07 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn xem chi tiết đầy đủ một báo giá gồm thông tin chung, thông tin phát hành, thông tin dịch vụ và danh sách bảng giá và lịch sử hoạt động, để rà soát trước khi phát hành và tra cứu khi cần. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Phần tiêu đề màn chi tiết hiển thị: Mã báo giá và Trạng thái báo giá. | Thiếu Mã báo giá hoặc Trạng thái báo giá ở phần tiêu đề. |
| AC2 | Nhóm Thông tin chung hiển thị: Tên báo giá, Mã yêu cầu báo giá liên quan (RFQ), Khách hàng (ID \- Tên khách hàng), Hạng khách hàng, Ghi chú yêu cầu báo giá, Thời hạn hiệu lực, Điều kiện áp dụng. | Thiếu/sai trường trong nhóm Thông tin chung. |
| AC3 | Nhóm Thông tin phát hành báo giá hiển thị: Người tạo, Người phát hành, Thời điểm phát hành, Kết quả báo giá (Thành công/Thất bại). Với báo giá nội bộ chưa có kết quả (từ báo giá khách hàng), các trường Người phát hành, Thời điểm phát hành và Kết quả phát hành để trống. | Thiếu nhóm Thông tin phát hành; hoặc hiển thị Người phát hành/Thời điểm phát hành khi báo giá chưa phát hành. |
| AC4 | Nhóm Thông tin dịch vụ hiển thị: Loại hình xuất nhập khẩu, Nhóm hàng, Đặc tính hàng hóa, Loại xe, Quy cách đóng gói, Ghi chú yêu cầu dịch vụ. | Thiếu/sai trường trong nhóm Thông tin dịch vụ. |
| AC5 | Nhóm Danh sách bảng giá hiển thị với mỗi bảng giá: Loại dịch vụ, Tên bảng giá, Các thuộc tính (theo loại dịch vụ), Tiền tệ, Bảng giá theo các đầu mục (8 cột: Mã dòng giá (ID), Đầu mục giá, Loại giá, Giá mua định mức, Mã giá bán định mức, Giá bán định mức, Đơn vị, Đơn giá, Lợi nhuận (%)) và Tổng đơn giá. Đối với dịch vụ có trong Yêu cầu báo giá nhưng không chưa bảng giá nào, hệ thống hiển thị badge cảnh báo. | Thiếu bảng giá, thiếu cột trong bảng đầu mục hoặc thiếu Tổng đơn giá. |
| AC6 | Mỗi bảng giá dịch vụ trong section Danh sách bảng giá có chức năng mở rộng/thu gọn: ở trạng thái thu gọn chỉ hiển thị ID \- Tên bảng giá dịch vụ; ở trạng thái mở rộng hiển thị đầy đủ nội dung bảng giá (thuộc tính, bảng giá theo các đầu mục, Tổng đơn giá). | Không có chức năng mở rộng/thu gọn; hoặc trạng thái thu gọn vẫn hiển thị nội dung ngoài ID \- Tên bảng giá dịch vụ. |
| AC7 | Nhóm Tổng hợp bảng giá hiển thị: Tổng đơn giá dịch vụ (chưa bao gồm VAT), Lợi nhuận dự kiến (%), Đơn vị tiền tệ. | Thiếu/sai chỉ tiêu trong nhóm Tổng hợp bảng giá. |
| AC8 | Nhóm Lịch sử hoạt động hiển thị danh sách các thao tác đã thực hiện trên báo giá, gồm đúng 4 cột: Thời gian, Người thực hiện, Hành động, Nội dung. | Thiếu nhóm Lịch sử hoạt động; hoặc thiếu/thừa cột so với đặc tả. |
| AC9 | Mỗi thao tác làm thay đổi báo giá (tạo mới, chỉnh sửa, phát hành, cập nhật kết quả, hết hiệu lực) đều được hệ thống tự động ghi nhận thành một bản ghi trong Lịch sử hoạt động (xem BR17). Danh sách lịch sử ở chế độ chỉ xem danh sách, không xem chi tiết, chỉnh sửa hoặc xóa. | Thao tác thay đổi báo giá không được ghi nhận vào Lịch sử hoạt động; hoặc cho phép xem chi tiết/chỉnh sửa/xóa bản ghi lịch sử. |
| AC10 | Màn Chi tiết báo giá hiển thị nhóm "Dịch vụ yêu cầu" (lấy từ Yêu cầu báo giá đã gắn). Nếu có dịch vụ được yêu cầu nhưng chưa có bảng giá dịch vụ tương ứng, hệ thống hiển thị cảnh báo trong tab dịch vụ "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}" (xem BR28). | Không hiển thị nhóm "Dịch vụ yêu cầu"; hoặc không cảnh báo khi có dịch vụ được yêu cầu nhưng chưa được báo giá. |

#### **User story 8: Phát hành báo giá**

| ID US | US\_QUO\_08 |
| :---- | :---- |
| **Tên Story** | Phát hành báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn phát hành một báo giá Nháp cho bộ phận Sales, để chốt bảng giá và bắt đầu theo dõi kết quả. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Phát hành chỉ hiển thị với báo giá ở trạng thái Nháp / Đã phê duyệt / Thu hồi. Các trạng thái còn lại không hiển nút Phát hành (Chờ phê duyệt, Từ chối, Đã phát hành, Hết hiệu lực) và chặn không cho phép phát hành báo giá. | Các trạng thái khác vẫn hiển thị nút và vẫn có thể phát hành báo giá. |
| AC2 | Khi người dùng thực hiện chức năng Phát hành, hệ thống kiểm tra điều kiện phát hành: báo giá có tối thiểu 1 dòng giá. | Cho phát hành báo giá không có dòng giá nào. |
| AC3 | Khi điều kiện phát hành hợp lệ: trạng thái chuyển sang Đã phát hành; hệ thống ghi nhận Người phát hành là người thực hiện thao tác và Thời điểm phát hành là thời điểm thao tác. | Không chuyển trạng thái; hoặc không ghi Người phát hành/Thời điểm phát hành. |
| AC4 | Sau khi chuyển sang trạng thái Đã phát hành, báo giá bị khóa chức năng xóa báo giá. | Còn cho phép xóa báo giá sau khi Đã phát hành. |
| AC5 | Sau khi phát hành thành công: hệ thống cập nhật thẻ chỉ số “Đã phát hành” và hiển thị thông báo “Phát hành báo giá thành công” và ghi nhận thao tác vào Lịch sử hoạt động. | Thẻ chỉ số không tăng; hoặc không có thông báo phát hành; hoặc không ghi nhận Lịch sử hoạt động. |
| AC6 | Sau khi phát hành thành công, báo giá nội bộ được hiển thị trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm; áp dụng cho mọi lần phát hành, kể cả phát hành lại từ trạng thái Thu hồi. | Phát hành thành công nhưng báo giá nội bộ không hiển thị trên màn Chi tiết Yêu cầu báo giá. |
| AC7 | Người dùng KHÔNG có quyền Phát hành: chức năng Phát hành bị ẩn và thao tác bị chặn. | Người dùng không có quyền vẫn phát hành được. |
| AC8 | Phát hành báo giá còn ≥ 1 bảng giá chứa dòng giá Hết hạn: hệ thống chặn và báo "Báo giá còn dòng giá hết hạn. Vui lòng cập nhật giá mới trước khi phát hành" (BR-60). | Phát hành được báo giá còn dòng giá Hết hạn mà không bị chặn. |

#### **User story 9: Ghi nhận kết quả và xử lý hết hiệu lực**

| ID US | US\_QUO\_09 |
| :---- | :---- |
| **Tên Story** | Ghi nhận kết quả và xử lý hết hiệu lực |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống ghi nhận kết quả của báo giá đã phát hành và tự chuyển Hết hiệu lực khi quá hạn, để phản ánh đúng kết quả kinh doanh và phục vụ theo dõi Tỷ lệ chốt. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Hệ thống đồng bộ kết quả báo giá từ báo giá khách hàng: Báo giá được ghi nhận Kết quả Thành công hoặc Thất bại theo trạng thái tương ứng của Báo giá khách hàng (xem BR20)  | Cho cập nhật kết quả với báo giá chưa phát hành; hoặc kết quả không khớp với ghi nhận từ Báo giá khách hàng. |
| AC2 | Một báo giá Đã phát hành có Thời hạn hiệu lực đã qua và được hệ thống tự động chuyển sang trạng thái Hết hiệu lực (xem BR2). | Báo giá quá hạn vẫn ở trạng thái Đã phát hành; hoặc báo giá đã Thành công/Thất bại bị chuyển Hết hiệu lực. |
| AC3 | Chỉ số Tỷ lệ chốt (Won) trên màn danh sách: công thức tính đang Updating — chưa chốt, cần bổ sung trước khi phát triển (xem BR14 và Mục 4). | Triển khai công thức Tỷ lệ chốt khi chưa được chốt chính thức. |
| AC4 | Khi trạng thái báo giá thay đổi (phát hành / có kết quả / hết hiệu lực), các thẻ chỉ số tổng quan trên màn danh sách được cập nhật tương ứng và thao tác được ghi nhận vào Lịch sử hoạt động. | Chỉ số tổng quan không cập nhật khi trạng thái đổi. |

#### **User story 10: Xóa báo giá** 

| ID US | US\_QUO\_10 |
| :---- | :---- |
| **Tên Story** | Xóa báo giá và phân quyền chức năng |
| **User story** | Là Chuyên viên định giá, tôi muốn xóa các báo giá Nháp không dùng đến và hệ thống kiểm soát mọi thao tác theo phân quyền, để giữ dữ liệu gọn gàng và đảm bảo an toàn vận hành. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Với một báo giá ở trạng thái Nháp, thao tác Xóa hiển thị bước xác nhận trước khi xóa; sau khi xác nhận, báo giá bị xóa khỏi danh sách. | Xóa không có bước xác nhận. |
| AC2 | Với một báo giá KHÔNG ở trạng thái Nháp (Chờ phê duyệt, Đã phê duyệt, Từ chối, Đã phát hành, Thu hồi/Hết hiệu lực), thao tác xóa bị chặn và hệ thống báo “Chỉ được xóa báo giá ở trạng thái Nháp” (xem BR13). | Cho xóa báo giá đã phát hành hoặc đã có kết quả. |
| AC3 | Khi một báo giá bị xóa, Yêu cầu báo giá đã gắn với báo giá đó được giải phóng và xuất hiện trở lại trong danh sách chọn RFQ của báo giá mới (xem BR1). | Yêu cầu báo giá vẫn bị coi là đã gắn báo giá sau khi báo giá bị xóa. |

#### **User story 11: Thu hồi báo giá**

| ID US | US\_QUO\_11 |
| :---- | :---- |
| **Tên Story** | Thu hồi báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn thu hồi một báo giá đã phát hành khi Sale chưa tạo Báo giá khách hàng, để điều chỉnh lại báo giá trước khi Sale tiếp tục xử lý với khách hàng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

Tiêu chí chấp nhận (Acceptance Criteria):

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Thu hồi hiển thị tại màn Chi tiết báo giá, chỉ áp dụng với báo giá ở trạng thái "Đã phát hành" và khi Sale CHƯA nhấn "Tạo báo giá khách hàng" trên Yêu cầu báo giá (RFQ) đã đính kèm. | Hiển thị/thực hiện được Thu hồi khi Sale đã tạo Báo giá khách hàng. |
| AC2 | Nhấn "Thu hồi" mở popup xác nhận gồm trường Lý do thu hồi (text area, bắt buộc nhập, tối đa 500 ký tự). | Mở được popup Thu hồi mà không có trường Lý do thu hồi; hoặc cho xác nhận khi để trống Lý do thu hồi. |
| AC3 | Nhấn "Xác nhận" trên popup: báo giá chuyển trạng thái "Thu hồi", hệ thống ghi nhận Lý do thu hồi vào Lịch sử hoạt động và hiển thị thông báo "Thu hồi báo giá thành công". | Không chuyển trạng thái; hoặc không ghi nhận Lịch sử hoạt động; hoặc không có thông báo thành công. |
| AC4 | Sau khi Thu hồi, báo giá không còn hiển thị trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm; Yêu cầu báo giá vẫn giữ nguyên liên kết 1-1 với báo giá này, không được giải phóng để gắn báo giá khác (xem BR1). Trạng thái Yêu cầu báo giá chuyển sang ”Đang báo giá” | Yêu cầu báo giá được giải phóng để chọn cho báo giá khác sau khi Thu hồi. Trạng thái Yêu cầu báo giá không thay đổi |
| AC5 | Báo giá ở trạng thái "Thu hồi" vẫn được Phát hành báo giá (US\_QUO\_08) và Chỉnh sửa báo giá (US\_QUO\_03); riêng chức năng Xóa vẫn KHÔNG áp dụng (chỉ áp dụng trạng thái Nháp — xem BR13). | Chặn Phát hành hoặc Chỉnh sửa báo giá đang ở trạng thái Thu hồi; hoặc cho phép Xóa báo giá Thu hồi. |
| AC6 | Báo giá "Thu hồi" quá Thời hạn hiệu lực vẫn tự động chuyển "Hết hiệu lực" như mọi trạng thái khác, không có ngoại lệ (xem BR2). | Báo giá Thu hồi quá hạn không tự chuyển Hết hiệu lực. |
| AC7 | Thao tác Thu hồi chỉ được sử dụng khi người dùng được phân quyền Thu hồi; người dùng KHÔNG có quyền Thu hồi thì chức năng Thu hồi cũng bị ẩn và thao tác bị chặn. | Người dùng không có quyền Thu hồi vẫn thu hồi được báo giá. |
| AC8 | Thao tác Hủy trong popup Thu hồi không thay đổi trạng thái báo giá và không lưu Lý do thu hồi. | Hủy popup nhưng báo giá vẫn chuyển sang trạng thái Thu hồi. |

#### **User story 12: Tự động chuyển trạng thái dòng giá khi cập nhật Giá bán định mức \[PHỨC TẠP\]**

| ID US | US\_QUO\_12 |
| :---- | :---- |
| **Tên Story** | Tự động chuyển trạng thái dòng giá khi cập nhật Giá bán định mức |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống tự động đánh dấu "Hết hạn" các dòng giá trong báo giá nội bộ khi Giá bán định mức mà dòng giá tham chiếu đã được cập nhật, để không sử dụng giá định mức cũ khi phát hành báo giá và tạo Báo giá khách hàng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá (áp dụng cho báo giá tạo thủ công và tạo tự động) |
| **Người Phụ trách (Owner)** | Trang BA |

Tiêu chí chấp nhận (Acceptance Criteria):

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Mỗi dòng giá đã gắn Mã giá bán định mức có Trạng thái dòng giá gồm 2 giá trị: "Đang hiệu lực", "Hết hạn". Dòng giá nhận trạng thái "Đang hiệu lực" tại thời điểm được gắn Mã giá bán định mức (chọn thủ công – US\_QUO\_04; khớp tự động – US\_ABG\_05; gắn lại – US\_ABG\_08) (BR-56). | Dòng giá đã gắn Mã giá bán định mức không có trạng thái; hoặc dòng giá mới gắn mặc định "Hết hạn". |
| AC2 | Khi Giá bán định mức của một dòng Giá bán định mức (Mã SSP-NNNN) được cập nhật thành công (giá trị mới khác giá trị trước cập nhật) hoặc bị xóa (do không còn dòng giá mua định mức tham chiếu) tại menu Giá bán định mức, hệ thống tự động chuyển TẤT CẢ dòng giá đang gắn Mã giá bán định mức đó và đang ở trạng thái "Đang hiệu lực" sang "Hết hạn" (BR-57). | Dòng giá không chuyển Hết hạn; chuyển cả dòng giá gắn Mã giá bán định mức khác; hoặc chuyển khi Lưu với giá trị không đổi. |
| AC3 | Phạm vi áp dụng: chỉ dòng giá đang "Đang hiệu lực". Dòng giá đã "Hết hạn" giữ nguyên trạng thái, không xử lý và không ghi Lịch sử hoạt động lặp lại khi Giá bán định mức tiếp tục thay đổi. Không áp dụng cho báo giá ở trạng thái Hết hiệu lực và báo giá mà Yêu cầu báo giá đã có Báo giá khách hàng (BR-57). | Xử lý lặp lại dòng giá đã Hết hạn; hoặc chuyển trạng thái dòng giá của báo giá ngoài phạm vi áp dụng. |
| AC4 | Dòng giá Hết hạn hiển thị tag "Hết hạn" trong bảng giá (màn Chi tiết); giữ nguyên các giá trị đã snapshot (Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức, Đơn giá, Lợi nhuận (%)) — không tự cập nhật giá mới (BR8). | Không hiển thị tag "Hết hạn"; hoặc hệ thống tự thay giá snapshot bằng giá mới. |
| AC5 | Bảng giá dịch vụ chứa ≥ 1 dòng giá Hết hạn tự động chuyển trạng thái disable. Tổng đơn giá của bảng \= null; bảng không tham gia Tổng đơn giá dịch vụ, Lợi nhuận dự kiến (%) và không được lấy khi tạo Báo giá khách hàng. Hệ thống tính lại Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%) của báo giá (BR-58). | Chỉ gắn tag tại dòng giá mà bảng giá vẫn khả dụng; bảng giá disable vẫn được cộng vào tổng hợp; hoặc chỉ tiêu tổng hợp không được tính lại. |
| AC6 | Việc chuyển Hết hạn không làm thay đổi Trạng thái báo giá, Nguồn tạo, Người phát hành, Thời điểm phát hành và Thời hạn hiệu lực của báo giá (BR-58). | Báo giá bị đổi trạng thái hoặc thông tin phát hành do dòng giá Hết hạn. |
| AC7 | Mỗi lần chuyển Hết hạn được ghi vào Lịch sử hoạt động của từng báo giá bị ảnh hưởng: Người thực hiện \= "Hệ thống"; Hành động \= "Dòng giá hết hạn"; Nội dung \= "{ID dòng giá} – {ID bảng giá}: Giá bán định mức {Mã giá bán định mức} thay đổi {giá cũ} → {giá mới}" (BR17). | Không ghi Lịch sử hoạt động; hoặc ghi sai Người thực hiện / nội dung. |
| AC8 | Đưa dòng giá về "Đang hiệu lực" (BR-59): (a) Báo giá nguồn Tự động: chức năng Đồng bộ giá định mức (US\_ABG\_08). (b) Báo giá Đã phát hành tạo thủ công: Thu hồi (nếu đủ điều kiện BR21) → Chỉnh sửa (Thêm bảng giá mới) → Phát hành lại. Các dòng giá trong bảng giá thêm mới ghi đè bảng giá disable cũ có trạng thái mặc định \= Đang hiệu lực. | Không có cách đưa dòng giá về Đang hiệu lực. |
| AC9 | Phát hành báo giá (US\_QUO\_08) khi còn ≥ 1 bảng giá chứa dòng giá Hết hạn: hệ thống chặn và báo "Báo giá còn dòng giá hết hạn. Vui lòng cập nhật giá mới trước khi phát hành" (BR-60). | Phát hành được báo giá còn dòng giá Hết hạn mà không bị chặn. |
| AC10 | Khi Lưu báo giá tại màn Thêm mới / Chỉnh sửa, hệ thống đối chiếu lại Giá bán định mức đã snapshot của các dòng giá Đang hiệu lực với giá hiện hành; dòng nào đã thay đổi trong lúc người dùng thao tác → chuyển Hết hạn, vẫn lưu báo giá (BR-60). | Lưu được dòng giá có giá snapshot khác giá hiện hành mà vẫn ở trạng thái Đang hiệu lực. |
| AC11 | Việc chuyển Hết hạn chạy nền sau khi cập nhật Giá bán định mức thành công; mỗi báo giá xử lý trong 1 transaction; lỗi tại một báo giá → rollback riêng báo giá đó và thử lại, không ảnh hưởng kết quả cập nhật Giá bán định mức và các báo giá khác (BR-60). | Lưu dở dang trạng thái dòng giá / bảng giá trong một báo giá; hoặc lỗi lan truyền làm hủy cập nhật Giá bán định mức. |

**▸ Use Case chi tiết UC\_QUO\_12 — Tự động chuyển trạng thái dòng giá khi cập nhật Giá bán định mức**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Hệ thống |
| Actor phụ | Người dùng cập nhật Giá bán định mức (menu Giá bán định mức) Chuyên viên định giá (K2) – người xử lý báo giá bị ảnh hưởng |
| Precondition | 1\. Dòng Giá bán định mức đang được gắn với ≥ 1 dòng giá "Đang hiệu lực" trong báo giá nội bộ thuộc phạm vi BR-57. 2\. Người dùng có quyền cập nhật Giá bán định mức. |
| Trigger | Lưu thành công Giá bán định mức mới (khác giá trị cũ) tại menu Giá bán định mức — cập nhật đơn lẻ hoặc nhập hàng loạt. |
| Luồng chính (Main flow) | 1\. Hệ thống ghi nhận sự kiện thay đổi Giá bán định mức (Mã giá bán định mức, giá cũ, giá mới, thời điểm). 2\. Hệ thống tìm toàn bộ dòng giá đang gắn Mã giá bán định mức đó, ở trạng thái "Đang hiệu lực", thuộc báo giá trong phạm vi BR-57. 3\. Với từng báo giá: chuyển các dòng giá tìm được sang "Hết hạn" và gắn tag "Hết hạn". 4\. Disable bảng giá chứa dòng giá Hết hạn; Tổng đơn giá của bảng \= null. 5\. Tính lại Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%) trên các bảng giá khả dụng. 6\. Ghi Lịch sử hoạt động của báo giá (Hành động "Dòng giá hết hạn", Người thực hiện "Hệ thống"). |
| Luồng thay thế (Alternative) | 2a. Không có dòng giá nào thỏa điều kiện: kết thúc, không ghi nhận. 3a. Dòng giá đã "Hết hạn": bỏ qua, không ghi Lịch sử hoạt động lặp lại. 4a. Bảng giá đã bị disable do thiếu giá (BR-42): giữ disable, bổ sung chú thích Hết hạn. 5a. Báo giá không còn bảng giá khả dụng: Tổng đơn giá dịch vụ và Lợi nhuận dự kiến để trống; trạng thái báo giá giữ nguyên. |
| Luồng ngoại lệ (Exception) | 3b. Lỗi khi xử lý một báo giá: rollback riêng báo giá đó, thử lại; ghi log hệ thống; không hủy cập nhật Giá bán định mức. 3c. Người dùng đang mở màn Thêm mới / Chỉnh sửa báo giá: áp dụng kiểm tra lại khi Lưu (US\_QUO\_12 AC11). |
| Postcondition | Không còn dòng giá "Đang hiệu lực" nào (trong phạm vi BR-57) mang giá snapshot khác Giá bán định mức hiện hành. Bảng giá chứa dòng giá Hết hạn bị disable; chỉ tiêu tổng hợp được tính lại; Lịch sử hoạt động được ghi nhận. |
| Business Rules liên quan | BR8, BR9, BR10, BR17, BR-42, BR-56, BR-57, BR-58, BR-59, BR-60 |

### **3.1.2. Mô tả giao diện**

* Ảnh giao diện: \[Chèn ảnh MH Danh sách báo giá / MH Thêm mới báo giá / MH Thêm mới báo giá / MH Xem chi tiết báo giá / Modal Thêm bảng giá dịch vụ mới\]

* Link UI Design: \[Chèn link\]

* Mô tả: Menu gồm 3 màn chính — Danh sách báo giá (thẻ chỉ số \+ bảng danh sách 10 cột \+ tìm kiếm/lọc/Export); Thêm mới báo giá và Chỉnh sửa báo giá (4 nhóm: Thông tin chung, Thông tin dịch vụ, Dịch vụ yêu cầu, Danh sách bảng giá, Tổng hợp bảng giá); Modal Thêm giá dịch vụ; Xem chi tiết báo giá (7 nhóm hiển thị, gồm Lịch sử hoạt động) và mỗi bảng giá dịch vụ có chức năng mở rộng/thu gọn.

* Ghi chú đổi tên hiển thị (áp dụng từ bản cập nhật này): nhãn hiển thị trên giao diện của thành phần "Bảng giá (dịch vụ)" được đổi thành "Dịch vụ" để tránh nhầm lẫn giữa các bảng giá — cụ thể: "Danh sách bảng giá" → "Danh sách dịch vụ"; "Thêm bảng giá dịch vụ" → "Thêm dịch vụ"; "Tạo bảng giá dịch vụ" → "Thêm dịch vụ"; "Xóa bảng giá dịch vụ" → "Xóa dịch vụ"; "ID/Tên bảng giá" → "ID/Tên dịch vụ"; "Tổng hợp bảng giá" → "Tổng hợp tài chính". Trong phần User story, Business Rule, bảng thông báo và các mục còn lại của tài liệu, thuật ngữ "bảng giá dịch vụ" được GIỮ NGUYÊN để không phá vỡ tham chiếu tài liệu; hai tên gọi cùng chỉ một đối tượng (xem BR30).

**Bảng 1 — Màn Danh sách báo giá: các cột hiển thị**

| STT | Tên cột | Mô tả |
| :---- | :---- | :---- |
| 1 | Mã báo giá | Mã do hệ thống tự sinh theo cấu trúc IPSYYMMDD-XXX |
| 2 | Tên báo giá | Tên do người dùng đặt, không trùng |
| 3 | Mã yêu cầu báo giá | Mã Yêu cầu báo giá (RFQ) mà báo giá liên kết |
| 4 | Khách hàng | Khách hàng theo Yêu cầu báo giá đã chọn (ID \- Tên khách hàng) |
| 5 | Hạng khách hàng | Hạng của khách hàng tương ứng |
| 6 | Tổng đơn giá | Tổng đơn giá dịch vụ của báo giá (chưa bao gồm VAT) |
| 7 | Lợi nhuận dự kiến | Tỷ lệ lợi nhuận dự kiến của báo giá (%) |
| 8 | Trạng thái | Nháp / Chờ phê duyệt / Đã phê duyệt / Từ chối / Đã phát hành / Thu hồi / Hết hiệu lực |
| 9 | Kết quả | Thành công / Thất bại; để trống khi báo giá chưa có kết quả ghi nhận từ Báo giá khách hàng |
| 10 | Thời hạn hiệu lực | Ngày hết hạn hiệu lực của báo giá |

**Bảng 2 — Màn Thêm mới báo giá: các trường thông tin**

***Nhóm 1 – Thông tin chung***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Mã báo giá | Tự sinh | Text | — | IPSYYMMDD-XXX | Hệ thống tự sinh, hiển thị chỉ đọc, không cho phép chỉnh sửa |
| Tên báo giá | v | Text | 200 | (Trống) | Bắt buộc; hệ thống kiểm tra trùng tên với các báo giá đã tồn tại |
| Mã yêu cầu báo giá liên quan (RFQ) | v | Select | — | (Trống) | Bắt buộc; danh sách chọn chỉ hiển thị các yêu cầu báo giá CHƯA gắn báo giá; là nguồn tự động điền các trường bên dưới (có check trùng khi lưu) |
| Khách hàng (ID \- Tên khách hàng) | — | Text (chỉ đọc) | — | (Theo RFQ) | Tự động điền theo Yêu cầu báo giá đã chọn |
| Hạng khách hàng | — | Text (chỉ đọc) | — | (Theo Khách hàng) | Tự động điền theo trường Khách hàng |
| Ghi chú yêu cầu báo giá | — | Text area (chỉ đọc) | — | (Theo RFQ) | Tự động điền nội dung trường Ghi chú chung của Yêu cầu báo giá đã chọn |
| Thời hạn hiệu lực | v | Date | — |  | Ngày hết hạn hiệu lực; quá hạn hệ thống tự chuyển trạng thái Hết hiệu lực (xem BR2) Luôn luôn \> {today} |
| Điều kiện áp dụng | — | Text area | 1000 | (Trống) | Điều kiện áp dụng kèm theo báo giá; người dùng nhập |

***Nhóm 2 – Thông tin dịch vụ (toàn bộ tự động điền từ Yêu cầu báo giá đã chọn, chỉ đọc, cho phép nhiều giá trị)***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Loại hình xuất nhập khẩu | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Nhóm hàng | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Đặc tính hàng hóa | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Loại xe | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Quy cách đóng gói | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Ghi chú yêu cầu dịch vụ | — | Text area (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |

***Nhóm 3 – Dịch vụ yêu cầu (hiển thị khi đã chọn Yêu cầu báo giá; lấy nguyên trạng từ Yêu cầu báo giá, chỉ đọc)***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Danh sách dịch vụ yêu cầu | — | List (chỉ đọc) | — | (Theo RFQ) | Danh sách các dịch vụ được tick trong Yêu cầu báo giá (Vận tải / Kho bãi / Khai báo Hải quan / Hải quan Giám sát / Sang tải) |
| Thông tin yêu cầu theo từng dịch vụ | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Các giá trị đã nhập trong Yêu cầu báo giá theo từng dịch vụ: Loại xe yêu cầu, Địa điểm làm TTHQ, Địa điểm kho, Loại hình kho, Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa, Địa điểm sang tải, Phương thức sang tải… |
| Trạng thái báo giá của dịch vụ | — | Label (chỉ đọc) | — | (Tự tính) | "Đã báo giá" khi đã có ≥ 1 bảng giá dịch vụ cùng Loại dịch vụ trong báo giá; "Chưa báo giá" (nhãn cảnh báo) khi chưa có — xem BR28 |
| Ghi chú yêu cầu dịch vụ | — | Text area (chỉ đọc) | — | (Theo RFQ) | Ghi chú của Yêu cầu báo giá theo từng dịch vụ (nếu có) |

***Nhóm 4 – Danh sách dịch vụ (khai báo qua modal “Thêm bảng giá dịch vụ mới”)***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| ID dịch vụ | Tự sinh | Text | — | (Tự sinh khi tạo) | Hệ thống tự động sinh ID khi tạo bảng giá dịch vụ; chỉ đọc |
| Loại dịch vụ | v | Enum | — | (Trống) | 1 trong 5 loại dịch vụ: Vận tải / Kho bãi / Khai báo Hải quan / Hải quan Giám sát / Sang tải Quyết định bộ thuộc tính và danh sách đầu mục giá hiển thị Dropdown chỉ hiển thị các loại dịch vụ có trong Dịch vụ yêu cầu của Yêu cầu báo giá đã chọn (xem BR25) |
| Tên dịch vụ | v | Text | 200 | (Trống) | Tên của bảng giá dịch vụ |
| Bộ thông tin thuộc tính (theo loại dịch vụ) | v | Động theo loại dịch vụ | — | (Trống) | Hiển thị sau khi chọn Loại dịch vụ; bắt buộc nhập đầy đủ.  Là dropdown, chỉ chọn trong phạm vi giá trị đã nhập tại Yêu cầu báo giá theo bảng "Nguồn giá trị các trường thuộc tính" bên dưới (xem BR25). Không được trùng bộ thuộc tính với dịch vụ khác đã tạo trong cùng báo giá (xem BR29). |
| Tiền tệ | v | Enum | — | VNĐ | Đơn vị tiền tệ áp dụng cho bảng giá |
| Tổng đơn giá | — | Number | — | (Tự tính) | Tổng Đơn giá của các đầu mục trong bảng giá; chỉ đọc |

**Bộ thông tin thuộc tính theo Loại dịch vụ:**

| Phân hệ | Cột đặc thù | Cột chung |
| :---- | :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (2) Kho bãi | Tên kho, Loại kho | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa | Đơn vị tính, Tiền tệ, Giá mua định mức |

Nguồn giá trị các trường thuộc tính (giới hạn theo Yêu cầu báo giá đã chọn):

| Trường trong bảng giá dịch vụ | Nguồn giá trị (trường tại Yêu cầu báo giá) | Kiểu chọn / Ghi chú |
| :---- | :---- | :---- |
| Loại dịch vụ | Dịch vụ yêu cầu (các dịch vụ được tick trong RFQ) | Dropdown — chỉ các loại dịch vụ được yêu cầu |
| Loại xe | Loại xe yêu cầu | Dropdown |
| Chi cục hải quan | Địa điểm làm TTHQ | Dropdown |
| Đặc tính hàng hóa | Đặc tính hàng hóa | Dropdown |
| Tên kho | Địa điểm kho | Dropdown |
| Loại kho | Loại hình kho | Dropdown |
| Loại hình XNK | Loại hình XNK | Dropdown |
| Nhóm hàng | Nhóm hàng | Dropdown |
| Địa điểm sang tải | Địa điểm sang tải | Dropdown |
| Phương thức sang tải | Loại hình sang tải | Dropdown |
| Điểm đi, Điểm đến (Vận tải) | Địa điểm vận tải có phạm vi khớp với Điểm đi / Điểm đến của Yêu cầu báo giá (BR-35) | Hai dropdown riêng; cho phép ghép chéo điểm đi và điểm đến |

Lưu ý: dropdown chỉ hiển thị các giá trị đã nhập tại Yêu cầu báo giá; nếu trường tương ứng tại Yêu cầu báo giá không có giá trị nào thì dropdown rỗng.

***Nhóm 5 – Tổng hợp tài chính***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tổng đơn giá dịch vụ (chưa bao gồm VAT) | — | Number | — | (Tự tính) | Tổng của Tổng đơn giá tất cả bảng giá trong báo giá; chỉ đọc |
| Lợi nhuận dự kiến (%) | — | Number | — | (Tự tính) | Tỷ lệ lợi nhuận dự kiến của báo giá; chỉ đọc (xem BR10) |
| Đơn vị tiền tệ | — | Enum | — | VNĐ | Mặc định VNĐ và ở chế độ không cho chỉnh sửa (disable) |

**Bảng 3 — Bảng giá theo các đầu mục: các cột hiển thị (áp dụng cho cả màn Thêm mới và màn Xem chi tiết)**

| STT | Tên cột | Mô tả |
| :---- | :---- | :---- |
|  | ID | ID riêng của từng dòng giá; hệ thống tự sinh tại thời điểm tạo bảng giá (xem BR19); chỉ đọc |
| 1 | Đầu mục giá | “\[ID đầu mục giá\] \- \[Tên đầu mục giá\]” của các đầu mục giá có loại giá \= “Cố định” và “Phụ phí” & Kích hoạt, lấy từ cấu hình đầu mục giá; mỗi đầu mục có nút chọn dòng giá |
| 2 | Loại giá | Cố định / Phụ phí (kế thừa từ đầu mục giá). Đầu mục Loại giá Phát sinh không xuất hiện trong bảng giá dịch vụ |
| 3 | Mã giá bán định mức | Mã của dòng  Giá bán định mức đã chọn, hệ thống điền sau khi người dùng chọn dòng giá |
| 4 | Đơn vị | Đơn vị tính lấy từ dòng Giá bán định mức đã chọn (không lấy từ đầu mục giá) |
| 5 | Giá mua định mức | Giá mua định mức tương ứng; chỉ đọc |
| 6 | Giá bán định mức | Giá bán định mức tương ứng; chỉ đọc |
| 7 | Đơn giá | Đơn giá áp dụng cho báo giá; mặc định bằng Giá bán định mức; cho phép chỉnh sửa (sửa được cả trong modal và trong Danh sách bảng giá) |
| 8 | Lợi nhuận (%) | Tự động tính theo BR6; chỉ đọc |
| 9 | Trạng thái dòng giá | Đang hiệu lực / Hết hạn (BR-56); chỉ đọc. Dòng Đang hiệu lực không hiển thị nhãn để giảm nhiễu; dòng Hết hạn hiển thị tag "Hết hạn" (màu đỏ) kèm tooltip giá cũ → giá mới. Dòng giá chưa gắn Mã giá bán định mức để trống. |

**Bảng 4 — Màn Xem chi tiết báo giá: các nhóm thông tin hiển thị**

| Nhóm thông tin | Trường hiển thị |
| :---- | :---- |
| Tiêu đề | Mã báo giá, Trạng thái báo giá Người tạo Trạng thái |
| Thông tin chung | Tên báo giá,  Mã yêu cầu báo giá liên quan (RFQ),  Khách hàng (ID \- Tên khách hàng),  Hạng khách hàng,  Ghi chú yêu cầu báo giá,  Thời hạn hiệu lực,  Điều kiện áp dụng |
| Thông tin phát hành báo giá | Người tạo,  Người phát hành,  Thời điểm phát hành,  Kết quả báo giá (Thành công/Thất bại) |
| Thông tin dịch vụ | Loại hình xuất nhập khẩu,  Nhóm hàng,  Đặc tính hàng hóa,  Loại xe,  Quy cách đóng gói,  Ghi chú yêu cầu dịch vụ |
| Dịch vụ yêu cầu | Danh sách dịch vụ được yêu cầu trong Yêu cầu báo giá kèm thông tin yêu cầu tương ứng; các dịch vụ "Chưa báo giá" được hiển thị cảnh báo (xem BR28) |
| Danh sách bảng giá | Với mỗi bảng giá: ID bảng giá  Loại dịch vụ,  Tên bảng giá,  Các biến phụ thuộc (theo loại dịch vụ),  Bảng giá theo các đầu mục (8 cột như đặc tả tại Bảng 3),  Tổng đơn giá Mỗi bảng giá có chức năng mở rộng (hiển thị đầy đủ) / thu gọn (chỉ hiển thị ID \- Tên bảng giá dịch vụ) Bổ sung: nhãn hiển thị "ID dịch vụ", "Tên dịch vụ"; đầu nhóm hiển thị cảnh báo "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}" khi có dịch vụ được yêu cầu nhưng chưa có bảng giá (xem BR28). Dòng giá Hết hạn hiển thị tag "Hết hạn"; bảng giá chứa dòng giá Hết hạn hiển thị ở trạng thái disable kèm chú thích "Bảng giá có dòng giá hết hạn do Giá bán định mức đã thay đổi" (BR-58). |
| Tổng hợp tài chính | Tổng đơn giá dịch vụ (chưa bao gồm VAT), Lợi nhuận dự kiến (%),  Đơn vị tiền tệ |
| Lịch sử hoạt động | Danh sách bản ghi lịch sử, gồm 4 cột:  Thời gian,  Người thực hiện,  Hành động,  Nội dung  (chi tiết tại Bảng 5\) |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

| ID | Quy tắc |
| :---- | :---- |
| BR1 | Quan hệ Yêu cầu báo giá – Báo giá là 1-1: mỗi Yêu cầu báo giá chỉ được gắn duy nhất 1 báo giá. Danh sách chọn Mã yêu cầu báo giá chỉ hiển thị các yêu cầu báo giá chưa gắn báo giá. RFQ ngoài phạm vi tài liệu này — chỉ chọn, không tạo/sửa tại menu này. |
| BR2 | Trạng thái báo giá gồm 7 giá trị: Nháp, Chờ phê duyệt, Đã phê duyệt, Từ chối, Đã phát hành, Thu hồi, Hết hiệu lực.  Kết quả báo giá (Thành công/Thất bại) là trường ĐỘC LẬP với Trạng thái, không phải một trạng thái trong vòng đời.  Báo giá quá Thời hạn hiệu lực tự động chuyển sang Hết hiệu lực, bất kể đang ở trạng thái nào. |
| BR3 | Chỉ báo giá ở trạng thái Nháp, Từ chối, Thu hồi mới được chỉnh sửa thông tin. Chỉ báo giá ở trạng thái Nháp mới được xóa. Sau khi chuyển sang Đã phát hành, báo giá bị khóa chức năng xóa báo giá. Ngoại lệ: Chức năng Đồng bộ giá định mức được cập nhật giá của báo giá nguồn Tự động ở trạng thái Đã phát hành / Thu hồi mà không đổi trạng thái báo giá (BR-54). |
| BR4 | Cấu trúc báo giá 3 cấp: Báo giá → Bảng giá (theo loại dịch vụ) → Dòng giá chi tiết. |
| BR5 | Bảng giá dịch vụ chỉ chứa các đầu mục giá có Loại giá thuộc {Cố định, Phụ phí} & Kích hoạt.  Đầu mục có Loại giá “Phát sinh” KHÔNG xuất hiện trong bảng giá dịch vụ và không tham gia vào các chỉ tiêu tổng hợp của báo giá.  Đầu mục không kích hoạt KHÔNG xuất hiện trong bảng giá dịch vụ và không tham gia vào các chỉ tiêu tổng hợp của báo giá.  |
| BR6 | % Lợi nhuận của đầu mục giá (Cố định/Phụ phí) \= (Đơn giá − Giá mua định mức) / Giá mua định mức; chỉ đọc, hệ thống tự tính.  |
| BR7 | Khi nạp đầu mục giá từ Giá bán định mức, Đơn giá mặc định \= Giá bán định mức; cho phép người dùng sửa Đơn giá; mỗi lần sửa hệ thống tính lại % Lợi nhuận theo BR6. |
| BR8 | Giá mua/bán định mức được chốt (snapshot) tại thời điểm nạp đầu mục giá vào báo giá; không tự đồng bộ khi định mức nguồn thay đổi. Ngoại lệ: chức năng Đồng bộ giá định mức snapshot lại giá tại thời điểm bấm nút (BR-55). Ngoại lệ 2: khi Giá bán định mức nguồn thay đổi, giá snapshot vẫn KHÔNG tự cập nhật nhưng dòng giá đang gắn Mã giá bán định mức đó chuyển trạng thái "Hết hạn" (BR-57, BR-58). |
| BR9 | Tổng đơn giá của một bảng giá \= Σ Đơn giá của các đầu mục trong bảng giá. Tổng đơn giá dịch vụ (chưa bao gồm VAT) của báo giá \= Σ Tổng đơn giá của tất cả bảng giá. Giá trị này cũng là cột “Tổng đơn giá” hiển thị ở màn Danh sách báo giá. |
| BR10 | Lợi nhuận dự kiến (%) toàn báo giá \= (Σ Đơn giá − Σ Giá mua định mức) / Σ Giá mua định mức; chỉ đọc, hệ thống tự tính. |
| BR11 | Mã báo giá do hệ thống tự sinh theo cấu trúc IPSYYMMDD-XXX  IPS: tiền tố cố định — Internal Pricing Sheet;  YY: 2 số cuối của năm,  MM: tháng,  DD: ngày tạo hiện tại;  XXX: số thứ tự tạo trong ngày, bắt đầu từ 001); Và người dùng KHÔNG được chỉnh sửa.  Tên báo giá do người dùng đặt và không được trùng. Các trường bắt buộc: Tên báo giá, Mã yêu cầu báo giá liên quan (RFQ), Thời hạn hiệu lực, Đơn giá của dòng giá (trong bảng giá dịch vụ) |
| BR12 | Hệ thống tự động sinh ID cho bảng giá theo cấu trúc: IQYYMM-XXX, trong đó: IQ (Internal Quote) là tiền tố cố định YYMM là 2 số cuối của năm/tháng hiện tại XXX bắt đầu từ 001  |
| BR13 | Xóa báo giá chỉ áp dụng với trạng thái Nháp. Mọi chức năng Xem/Sửa/Phát hành/Xóa được kiểm soát bằng phân quyền; chức năng ẩn hoàn toàn khi người dùng không có quyền. |
| BR14 | Điều kiện phát hành báo giá: báo giá phải có tối thiểu 1 dòng giá. Khi phát hành thành công, hệ thống ghi nhận Người phát hành và Thời điểm phát hành, đồng thời hiển thị báo giá nội bộ trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm. Bảng giá disable (BR-42, BR-58) không được tính là dòng giá hợp lệ; chặn phát hành khi báo giá còn bảng giá chứa dòng giá Hết hạn (BR-60). |
| BR15 | Tỷ lệ chốt (Won) \= Số lượng báo giá có kết quả Thành công / Tổng số báo giá “Đã phát hành” \+ “Hết hiệu lực” (**updating**) |
| BR16 | Thẻ chỉ số “Chờ duyệt ngoại lệ” thuộc luồng phê duyệt — NGOÀI phạm vi giai đoạn này; thẻ hiển thị 0 hoặc được ẩn. |
| BR17 | Mọi thao tác làm thay đổi báo giá được hệ thống tự động ghi nhận vào Lịch sử hoạt động, mỗi bản ghi gồm: Thời gian, Người thực hiện, Hành động, Nội dung. Lịch sử hoạt động chỉ ở chế độ xem; không cho phép chỉnh sửa hoặc xóa bản ghi. |
| BR18 | Trong một bảng giá dịch vụ, mỗi đầu mục giá chỉ được gán tối đa 1 dòng giá (quan hệ 1 đầu mục giá – 1 dòng giá). Danh sách dòng giá cho người dùng chọn được lọc theo:  (a) đầu mục giá tương ứng;  (b) các giá trị thuộc tính đã nhập trong bảng giá. Ràng buộc bộ thuộc tính – dòng giá: khi người dùng thay đổi 1 trong các trường thuộc bộ thuộc tính sau khi đã chọn ≥ 1 dòng giá, hệ thống yêu cầu xác nhận và xóa toàn bộ dòng giá đã gắn với các đầu mục giá trong bảng (US\_QUO\_04 AC12). |
| BR19 | Mỗi dòng giá trong bảng giá dịch vụ có một ID riêng do hệ thống tự động sinh tại thời điểm tạo bảng giá; ID hiển thị ở cột đầu tiên của Bảng giá theo các đầu mục và ở chế độ chỉ đọc. |
| BR20 | Kết quả báo giá được ghi nhận tự động: khi bộ phận Sales cập nhật trạng thái Thành công/Thất bại cho Báo giá khách hàng (được tạo từ báo giá nội bộ), hệ thống ghi nhận Kết quả báo giá tương ứng cho báo giá nội bộ được tham chiếu.  Người dùng tại menu này không cập nhật thủ công Kết quả báo giá. |
| BR21 | Thu hồi báo giá: chỉ áp dụng với báo giá ở trạng thái "Đã phát hành" và khi Sale CHƯA tạo Báo giá khách hàng từ Yêu cầu báo giá (RFQ) đã đính kèm.  |
| BR22 | Thu hồi thành công: báo giá chuyển trạng thái "Thu hồi", ẩn khỏi màn Chi tiết Yêu cầu báo giá (RFQ) nhưng vẫn giữ nguyên liên kết 1-1 với RFQ đó, không được giải phóng để gắn báo giá khác; |
| BR23 | Thao tác Thu hồi cần người dùng được phân quyền Thu hồi mới hiển thị và sử dụng được. |
| BR24 | Được phép tạo nhiều bảng giá trong báo giá |
| BR25 | Nguồn giá trị các trường thông tin trong modal Thêm dịch vụ (Thêm bảng giá dịch vụ) bị giới hạn theo Yêu cầu báo giá (RFQ) đã chọn: Loại dịch vụ ← Dịch vụ yêu cầu;  Loại xe ← Loại xe yêu cầu;  Chi cục hải quan ←Địa điểm làm TTHQ;  Đặc tính hàng hóa ← Đặc tính hàng hóa;  Tên kho ← Địa điểm kho;  Loại kho ← Loại hình kho;  Loại hình XNK ← Loại hình XNK;  Nhóm hàng ← Nhóm hàng;  Địa điểm sang tải ← Địa điểm sang tải;  Phương thức sang tải ← Loại hình sang tải. Tất cả là dropdown, chỉ chọn trong các giá trị đã nhập tại RFQ. Riêng Điểm đi, Điểm đến là hai dropdown riêng, hiển thị các Địa điểm vận tải có phạm vi khớp với điểm đi / điểm đến đã nhập tại Yêu cầu báo giá (quy tắc khớp tại BR-35); cho phép ghép chéo điểm đi và điểm đến; không có Địa điểm vận tải phù hợp → dropdown rỗng kèm thông báo. Chi tiết xem bảng "Nguồn giá trị các trường thuộc tính" (mục 3.1.2). |
| BR26 | Màn Thêm mới/Chỉnh sửa báo giá hiển thị nhóm "Dịch vụ yêu cầu" lấy nguyên trạng từ Yêu cầu báo giá đã chọn, ở chế độ chỉ đọc; nhóm chỉ hiển thị khi đã chọn Yêu cầu báo giá và được nạp lại khi người dùng đổi sang Yêu cầu báo giá khác. Ràng buộc Yêu cầu báo giá – bảng giá dịch vụ: khi đổi sang Yêu cầu báo giá khác mà báo giá đã có ≥ 1 bảng giá dịch vụ, hệ thống yêu cầu xác nhận và xóa toàn bộ bảng giá dịch vụ đã tạo; áp dụng cho cả báo giá nguồn Tự động (US\_QUO\_02 AC12, US\_QUO\_03 AC4). |
| BR27 | Cảnh báo thiếu dịch vụ (soft warning): khi nhấn Tạo/Lưu báo giá, hệ thống đối chiếu các dịch vụ được tick trong Yêu cầu báo giá với Loại dịch vụ của các bảng giá dịch vụ đã tạo trong báo giá. Với mỗi dịch vụ được yêu cầu nhưng chưa có bảng giá dịch vụ tương ứng, hệ thống cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ 1}, {Loại dịch vụ 2}... , tiếp tục Tạo/Lưu báo giá?". Đây là cảnh báo, KHÔNG chặn: người dùng Xác nhận thì tiếp tục Tạo/Lưu, Hủy thì quay lại màn tạo/chỉnh sửa. |
| BR28 | Hiển thị tab loại dịch vụ chưa được báo giá: (a) Màn Chi tiết báo giá — nhóm Danh sách dịch vụ; Mỗi tab loại dịch vụ hiển thị cảnh báo "Dịch vụ chưa được báo giá". (b) Màn Yêu cầu báo giá — section báo giá nội bộ đã phát hành: hiển thị cảnh báo tương tự cho các dịch vụ được yêu cầu nhưng không có trong báo giá đã phát hành. Cảnh báo chỉ mang tính thông tin, không chặn thao tác. |
| BR29 | Trong cùng một báo giá, KHÔNG được tồn tại hai bảng giá dịch vụ trùng bộ thuộc tính — tức cùng Loại dịch vụ và trùng giá trị của TẤT CẢ trường thuộc tính (theo bộ thuộc tính của loại dịch vụ đó). Tên bảng giá/Tên dịch vụ khác nhau KHÔNG được coi là khác bộ thuộc tính. Khi phát hiện trùng, hệ thống chặn tạo bảng giá dịch vụ và hiển thị thông báo lỗi. Ngoại lệ: bảng giá dịch vụ đang bị disable của báo giá tạo tự động (BR-42) không được tính khi kiểm tra trùng; khi Lưu báo giá, bảng giá bị disable trùng bộ thuộc tính sẽ bị ghi đè bởi bảng giá mới tạo. Quy tắc này không mâu thuẫn với BR24 — vẫn cho phép nhiều bảng giá trong cùng một loại dịch vụ, miễn khác bộ thuộc tính. Bảng giá disable do dòng giá Hết hạn (BR-58) KHÔNG thuộc ngoại lệ trên — vẫn được tính khi kiểm tra trùng và không bị ghi đè. |
| BR30 | Quy ước tên gọi: trên giao diện, thành phần "Bảng giá (dịch vụ)" hiển thị với nhãn "Dịch vụ" (Danh sách dịch vụ, Thêm/Tạo/Xóa dịch vụ, ID/Tên dịch vụ, Tổng hợp dịch vụ). Trong tài liệu (User story, Business Rule, bảng thông báo) giữ nguyên thuật ngữ "bảng giá dịch vụ". Hai tên gọi cùng chỉ một đối tượng. |
| BR-56 | Trạng thái dòng giá — Mỗi dòng giá đã gắn Mã giá bán định mức có Trạng thái dòng giá gồm 2 giá trị: "Đang hiệu lực" và "Hết hạn". Dòng giá nhận trạng thái "Đang hiệu lực" khi được gắn Mã giá bán định mức (chọn thủ công – US\_QUO\_04; khớp tự động – BR-38, BR-39; gắn lại – BR-55). Dòng giá chưa gắn Mã giá bán định mức (thiếu giá cấp 1 – BR-41) không mang trạng thái này. Trạng thái dòng giá độc lập với Trạng thái báo giá (BR2): "Hết hạn" của dòng giá khác "Hết hiệu lực" của báo giá. |
| BR-57 | Điều kiện chuyển "Hết hạn" — Khi Giá bán định mức của một dòng Giá bán định mức được cập nhật thành công (giá trị mới khác giá trị trước cập nhật) hoặc bị xóa (do không còn dòng giá mua định mức tham chiếu) tại menu Giá bán định mức, hệ thống tự động chuyển toàn bộ dòng giá đang gắn Mã giá bán định mức đó từ "Đang hiệu lực" sang "Hết hạn". Chỉ áp dụng với dòng giá "Đang hiệu lực"; dòng giá đã "Hết hạn" giữ nguyên, không xử lý lặp. Phạm vi báo giá: mọi trạng thái trừ Hết hiệu lực; không áp dụng khi đã có Báo giá khách hàng tương ứng. |
| BR-58 | Xử lý khi dòng giá "Hết hạn": (a) Dòng giá giữ nguyên các giá trị đã snapshot, không tự cập nhật giá mới (BR8, BR-40); hiển thị tag "Hết hạn". (b) Bảng giá dịch vụ chứa ≥ 1 dòng giá Hết hạn chuyển disable — áp dụng cho cả báo giá thủ công và tự động: Tổng đơn giá của bảng \= null; không tham gia Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (ngoại lệ BR9, BR10); không được lấy khi tạo Báo giá khách hàng; hiển thị chú thích "Bảng giá có dòng giá hết hạn do Giá bán định mức đã thay đổi". (c) Bảng giá disable do hết hạn dòng giá không hiển thị trong màn Chỉnh sửa và có thể bị ghi đè khi thêm bảng giá có cùng bộ thông tin và Lưu chỉnh sửa. (d) Hệ thống tính lại các chỉ tiêu tổng hợp; không đổi Trạng thái báo giá, Nguồn tạo, thông tin phát hành, Thời hạn hiệu lực. |
| BR-59 | Đưa dòng giá về "Đang hiệu lực" — Trạng thái chuyển một chiều; dòng giá chỉ về "Đang hiệu lực" khi được nạp lại giá hiện hành: (a) Báo giá nguồn Tự động: Đồng bộ giá định mức (BR-55). (b) Báo giá Đã phát hành tạo thủ công: Thu hồi (BR21) → Chỉnh sửa (Thêm bảng giá) → Phát hành lại. Bảng giá mới ghi đè bảng giá cũ và các dòng giá có trạng thái mặc định Đang hiệu lực Sửa Đơn giá (US\_QUO\_06) hoặc Giá bán định mức trở về giá cũ KHÔNG khôi phục trạng thái. |
| BR-60 | Ràng buộc liên quan: (a) Chặn Phát hành báo giá còn ≥ 1 bảng giá chứa dòng giá Hết hạn (bổ sung điều kiện BR14). (b) Khi Lưu báo giá tại màn Thêm mới / Chỉnh sửa, hệ thống đối chiếu lại Giá bán định mức snapshot của các dòng Đang hiệu lực với giá hiện hành; dòng đã thay đổi → chuyển Hết hạn và thông báo. (c) Xử lý chuyển Hết hạn chạy nền sau khi cập nhật Giá bán định mức thành công; mỗi báo giá xử lý trong 1 transaction, lỗi → rollback riêng báo giá đó và thử lại; không hủy kết quả cập nhật Giá bán định mức. |

### **3.1.4. Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Lưu báo giá khi còn trống trường bắt buộc (Tên báo giá, Mã yêu cầu báo giá, Thời hạn hiệu lực, Đơn giá) | Lỗi | “Vui lòng nhập đầy đủ thông tin bắt buộc” | Không lưu, giữ nguyên dữ liệu đang nhập |
| Nhập Tên báo giá trùng với báo giá đã tồn tại | Lỗi | “Tên báo giá đã tồn tại” | Không lưu |
| Tạo/lưu báo giá Nháp thành công | Thành công | “Tạo báo giá thành công” | Lưu trạng thái Nháp, điều hướng sang màn chi tiết/soạn thảo |
| Lưu thay đổi báo giá thành công (màn Chỉnh sửa) | Thành công | “Cập nhật báo giá thành công” | Lưu thay đổi, giữ trạng thái Nháp, ghi nhận Lịch sử hoạt động |
| Tạo bảng giá dịch vụ khi thiếu trường bắt buộc hoặc thuộc tính bắt buộc  | Lỗi | “Vui lòng nhập đầy đủ thông tin bắt buộc” | Không tạo bảng giá |
| Tạo bảng giá dịch vụ khi chưa chọn dòng giá cho tất cả đầu mục giá  | Lỗi | “Vui lòng nhập đầy đủ dòng giá trong các đầu mục giá” | Không tạo bảng giá (Giả định — xem Mục 4\) |
| Tạo bảng giá dịch vụ thành công | Thành công | “Tạo bảng giá dịch vụ thành công” | Thêm bảng giá kèm ID bảng giá và ID từng dòng giá tự sinh; tính lại các chỉ tiêu tổng hợp |
| Xóa bảng giá dịch vụ khỏi báo giá | Cảnh báo | “Bạn có chắc muốn xóa bảng giá dịch vụ này?” | Yêu cầu xác nhận; xác nhận → xóa bảng giá và toàn bộ dòng giá thuộc bảng, tính lại các chỉ tiêu tổng hợp |
| Nhập Đơn giá không hợp lệ (không phải số hoặc nhỏ hơn 0\) trong modal bảng giá hoặc trong danh sách bảng giá \- form tạo/sửa báo giá | Lỗi | “Đơn giá không hợp lệ” | Không cập nhật đầu mục giá và các chỉ tiêu tổng hợpKhông Lưu báo giá.  |
| Phát hành khi báo giá chưa có dòng giá nào | Lỗi | “Báo giá phải có tối thiểu 1 dòng giá trước khi phát hành” | Chặn phát hành |
| Phát hành báo giá thành công | Thành công | “Phát hành báo giá thành công” | Chuyển trạng thái Đã phát hành, ghi Người phát hành và Thời điểm phát hành. |
| Nhấn "Thu hồi" báo giá Đã phát hành (Sale chưa tạo Báo giá khách hàng) | Xác nhận | “Vui lòng nhập lý do thu hồi báo giá” | Hiển thị popup xác nhận Thu hồi với trường Lý do thu hồi (bắt buộc, tối đa 500 ký tự) |
| Xác nhận Thu hồi khi để trống Lý do thu hồi | Lỗi | “Vui lòng nhập lý do thu hồi” | Không thực hiện thu hồi, giữ nguyên popup |
| Xác nhận Thu hồi thành công | Thành công | “Thu hồi báo giá thành công” | Chuyển trạng thái Thu hồi, ẩn khỏi màn Chi tiết Yêu cầu báo giá, ghi nhận Lịch sử hoạt động |
| Thực hiện Thu hồi với báo giá không đủ điều kiện (không ở trạng thái Đã phát hành, hoặc Sale đã tạo Báo giá khách hàng) | Lỗi | “Không thể thu hồi báo giá ở trạng thái này” | Chặn thao tác thu hồi, ẩn/disable nút Thu hồi |
| Hệ thống ghi nhận Kết quả báo giá từ Báo giá khách hàng | Thông báo | “Báo giá đã được ghi nhận kết quả: \[Thành công/Thất bại\]” | Cập nhật trường Kết quả báo giá; ghi nhận Lịch sử hoạt động |
| Xóa báo giá Nháp | Cảnh báo | “Bạn có chắc muốn xóa báo giá này?” | Yêu cầu xác nhận; xác nhận → xóa |
| Người dùng không có quyền (Xem/Sửa/Phát hành/Xóa) | Lỗi | “Bạn không có quyền thực hiện chức năng này” | Ẩn chức năng, chặn thao tác |
| Nhấn Tạo/Lưu báo giá khi có dịch vụ được yêu cầu trong Yêu cầu báo giá nhưng chưa tạo bảng giá dịch vụ tương ứng | Cảnh báo (xác nhận) | "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo/Lưu báo giá?" | Hiển thị popup xác nhận; Xác nhận → tiếp tục Tạo/Lưu báo giá; Hủy → quay lại màn tạo/chỉnh sửa, giữ nguyên dữ liệu đang nhập (BR27) |
| Nhấn "Tạo bảng giá dịch vụ" khi bộ thuộc tính trùng với một bảng giá dịch vụ khác đã tạo trong báo giá | Lỗi | "Bộ thuộc tính của dịch vụ này đã trùng với {ID – Tên bảng giá}. Vui lòng chọn bộ thuộc tính khác." | Chặn tạo bảng giá dịch vụ, giữ nguyên modal và dữ liệu đang nhập (BR29) |
| Mở màn Chi tiết báo giá / màn Yêu cầu báo giá (section báo giá nội bộ đã phát hành) khi có dịch vụ được yêu cầu nhưng chưa được báo giá | Cảnh báo | "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}" | Hiển thị cảnh báo tại nhóm Dịch vụ yêu cầu/Danh sách dịch vụ; không chặn thao tác (BR28) Luôn luôn hiển thị cho đến khi dịch vụ đó có bảng giá |
| Chọn Loại dịch vụ/thuộc tính trong modal Thêm dịch vụ khi Yêu cầu báo giá không có giá trị tương ứng | Thông báo | "Yêu cầu báo giá chưa có giá trị cho trường này" (Đề xuất bổ sung — chờ xác nhận) | Dropdown hiển thị rỗng; không chặn các thao tác khác (BR25) |
| Thay đổi thuộc tính trong modal Thêm bảng giá dịch vụ khi đã chọn ≥ 1 dòng giá | Cảnh báo  | “Thay đổi thuộc tính sẽ xóa toàn bộ dòng giá đã chọn trong bảng giá này. Tiếp tục?” | Xác nhận → cập nhật thuộc tính, xóa toàn bộ dòng giá đã gắn trong bảng, tính lại chỉ tiêu tổng hợp Hủy → giữ nguyên giá trị thuộc tính cũ (BR18) |
| Đổi Yêu cầu báo giá khi báo giá đã có ≥ 1 bảng giá dịch vụ | Cảnh báo  | “Thay đổi Yêu cầu báo giá sẽ xóa toàn bộ bảng giá dịch vụ đã tạo. Tiếp tục?” | Xác nhận → xóa toàn bộ bảng giá dịch vụ trên form, nạp lại thông tin theo RFQ mới, tính lại chỉ tiêu tổng hợp Hủy → giữ nguyên RFQ cũ (BR26) |
| Không có Địa điểm vận tải khớp phạm vi điểm đi / điểm đến của Yêu cầu báo giá | Thông báo | “Không có địa điểm vận tải phù hợp với phạm vi Yêu cầu báo giá” | Dropdown Điểm đi / Điểm đến rỗng; không chặn các thao tác khác (BR25) |
| Bảng giá chứa ≥ 1 dòng giá Hết hạn | Cảnh báo | "Bảng giá có dòng giá hết hạn do Giá bán định mức đã thay đổi"  | Disable bảng giá; Tổng đơn giá của bảng \= null; tính lại chỉ tiêu tổng hợp; không lấy sang Báo giá khách hàng (BR-58) |
| Phát hành báo giá còn bảng giá chứa dòng giá Hết hạn | Lỗi | "Báo giá còn dòng giá hết hạn. Vui lòng cập nhật giá mới trước khi phát hành" (Đề xuất) | Chặn phát hành (BR-60) |
| Lưu báo giá khi có dòng giá Đang hiệu lực mà Giá bán định mức đã thay đổi trong lúc chỉnh sửa | Cảnh báo | "Có {n} dòng giá đã hết hạn do Giá bán định mức thay đổi trong lúc chỉnh sửa" (Đề xuất) | Vẫn lưu báo giá; chuyển dòng giá sang Hết hạn và disable bảng giá chứa dòng giá (BR-60) |

### **3.1.5. Tích hợp & Đồng bộ dữ liệu**

*\[Gắn link hoặc hình ảnh biểu đồ ERD mô hình hóa luồng dữ liệu của module\]*

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Yêu cầu báo giá (RFQ) | Nguồn dữ liệu bắt buộc; cung cấp danh sách RFQ chưa gắn báo giá và các thông tin khách hàng, dịch vụ Bổ sung: cung cấp Dịch vụ yêu cầu và các giá trị thuộc tính yêu cầu (Loại xe yêu cầu, Địa điểm làm TTHQ, Địa điểm kho, Loại hình kho, Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa, Địa điểm sang tải, Loại hình sang tải, Điểm đi / Điểm đến) làm nguồn giới hạn cho dropdown trong modal Thêm dịch vụ (BR25) và làm nguồn cho nhóm "Dịch vụ yêu cầu" (BR26). | RFQ → báo giá; báo giá → hiển thị trên Chi tiết Yêu cầu báo giá (hiện khi Đã phát hành, ẩn khi Thu hồi) Yêu cầu báo giá → nhóm Dịch vụ yêu cầu & dropdown thuộc tính của bảng giá dịch vụ; Báo giá → cảnh báo dịch vụ chưa báo giá tại section báo giá nội bộ đã phát hành của Yêu cầu báo giá (BR28). | Khi chọn Yêu cầu báo giá liên quan (RFQ) ở màn Thêm mới/Chỉnh sửa báo giá; khi Phát hành hoặc Thu hồi báo giá | Không còn RFQ khả dụng → danh sách chọn rỗng; Sale đã tạo Báo giá khách hàng → chặn Thu hồi (Updating — cơ chế xác định) Yêu cầu báo giá thiếu giá trị cho trường thuộc tính → dropdown rỗng; dịch vụ được yêu cầu nhưng chưa có bảng giá → cảnh báo, không chặn (BR27, BR28). |
| Cấu hình đầu mục giá | Cung cấp danh sách đầu mục giá (chỉ Loại giá Cố định, Phụ phí) hiển thị trong modal Thêm bảng giá dịch vụ | Đầu mục giá → đầu mục trong bảng giá | Khi chọn Loại dịch vụ trong modal | Đầu mục bị tắt kích hoạt → không hiển thị Đầu mục Loại giá Phát sinh → không hiển thị (BR5) |
| Giá mua định mức | Lấy Giá mua định mức làm căn cứ tính % Lợi nhuận | Giá mua định mức → đầu mục giá (snapshot) | Khi nạp đầu mục giá vào bảng giá | Nguồn đổi → không tự đồng bộ (BR8) |
| Giá bán định mức | Cung cấp danh sách dòng giá để chọn (đã lọc theo đầu mục giá và thuộc tính); cấp Mã giá bán định mức, Đơn vị và Giá bán định mức làm Đơn giá mặc định | Giá bán định mức → dòng giá trong bảng giá | Khi nhấn nút chọn dòng giá trong modal | Nguồn đổi → không tự đồng bộ (BR8) Không có dòng giá phù hợp với bộ lọc → hiển thị danh sách rỗng (Giả định) |
| Giá bán định mức (cập nhật giá) | Phát sinh sự kiện thay đổi Giá bán định mức để chuyển Trạng thái dòng giá | Giá bán định mức → dòng giá của báo giá nội bộ (chỉ đổi trạng thái, không đổi giá snapshot) | Khi Lưu thành công Giá bán định mức mới (đơn lẻ / nhập hàng loạt), giá trị khác giá cũ | Dòng giá đã Hết hạn → bỏ qua; báo giá Hết hiệu lực / đã có Báo giá khách hàng → không áp dụng; lỗi → rollback từng báo giá, thử lại (BR-57, BR-60). |
| Báo giá khách hàng | Nguồn ghi nhận tự động Kết quả báo giá (Thành công/Thất bại) cho báo giá nội bộ tham chiếu | Báo giá khách hàng → báo giá nội bộ | Khi Sales cập nhật trạng thái Thành công/Thất bại cho Báo giá khách hàng | Báo giá khách hàng bị hủy hoặc đổi kết quả → xử lý chưa xác định (xem Mục 4\) |
| Chính sách biên lợi nhuận | (Ngoài phạm vi) kiểm tra ràng buộc ngưỡng lợi nhuận | — | — | Chưa liên kết ràng buộc trong giai đoạn này |
| Báo cáo thống kê | Cấp số liệu Tổng báo giá, Đã phát hành, Tỷ lệ chốt (Won) | Báo giá → dashboard/báo cáo | Khi trạng thái báo giá thay đổi | Tỷ lệ chốt chờ chốt công thức (BR15) |
| Quản lý danh mục | Cung cấp danh mục Địa điểm vận tải làm nguồn dropdown Điểm đi / Điểm đến trong modal Thêm bảng giá dịch vụ | Quản lý danh mục → modal Thêm bảng giá dịch vụ | Khi chọn Điểm đi / Điểm đến | Không có Địa điểm vận tải khớp phạm vi Yêu cầu báo giá → dropdown rỗng, hiển thị thông báo; không chặn thao tác khác (BR25) |

## **3.2. MODULE: Tự động tạo Báo giá nội bộ (Auto-BGNB)**

**Phạm vi mục này:** Engine sinh báo giá nội bộ tự động và các thành phần hiển thị tại menu Quản lý báo giá. Phần thao tác trên màn Chi tiết Yêu cầu báo giá (nút “Lấy tự động BGNB”, chuyển trạng thái Yêu cầu báo giá, hiển thị khối Báo giá nội bộ, tạo Báo giá khách hàng — US\_ABG\_01, US\_ABG\_02, US\_ABG\_03, UC\_ABG\_01) đặc tả tại SRS Quản lý YCBG \+ Báo giá KH.

**Phân biệt Báo giá nội bộ tạo thủ công và tạo tự động:**

| Tiêu chí | Tạo thủ công | Tạo tự động (Auto-BGNB) |
| :---- | :---- | :---- |
| Người thực hiện | Chuyên viên định giá (K2) | Dịch vụ khách hàng (K1) bấm “Lấy tự động BGNB”; hệ thống sinh báo giá |
| Màn hình thao tác | Màn Thêm mới / Chỉnh sửa báo giá (menu Quản lý báo giá) | Màn Chi tiết Yêu cầu báo giá (đặc tả tại SRS Quản lý YCBG \+ Báo giá KH) |
| Trạng thái Yêu cầu báo giá áp dụng | Đang báo giá (US\_QUO\_02 AC2) | Nháp / Chờ báo giá |
| Trạng thái báo giá sau khi tạo | Nháp; phát hành thủ công (US\_QUO\_08) | Đã phát hành |
| Nguồn giá | K2 chọn dòng giá cho từng đầu mục giá; Đơn giá cho phép sửa | Hệ thống tự khớp từ Giá bán định mức (BR-38, BR-39); Đơn giá \= Giá bán định mức |
| Đơn giá của dòng giá | Bắt buộc; còn trống → chặn lưu (BR11, US\_QUO\_02 AC8) | Không chặn; dòng thiếu giá xử lý theo quy tắc thiếu giá 4 cấp (BR-41 → BR-44) |
| Bảng giá bị disable | Có khi dòng giá Hết hạn (BR-58) | Có (BR-42): không tham gia tổng hợp, ẩn tại màn Chỉnh sửa, không lấy sang Báo giá khách hàng |
| Cảnh báo thiếu bảng giá dịch vụ (BR27) | Áp dụng | Không áp dụng (BR-50) |
| Nguồn tạo / Người tạo / Người phát hành | Thủ công / Người thực hiện / Người thực hiện | Tự động / “Hệ thống” / “Hệ thống” Khi K2 Lưu chỉnh sửa sau Thu hồi: Nguồn tạo chuyển “Thủ công”; Người tạo giữ “Hệ thống”; Người phát hành \= người thực hiện khi Phát hành lại (BR-45) |
| Cảnh báo khi tạo Báo giá khách hàng | Không áp dụng | Cảnh báo khi còn bảng giá bị disable; chặn khi toàn bộ bảng giá bị disable (đặc tả tại SRS Quản lý YCBG \+ Báo giá KH) |
| Đồng bộ giá định mức | Không áp dụng | Áp dụng khi Nguồn tạo \= Tự động, trạng thái Đã phát hành / Thu hồi và chưa có Báo giá khách hàng (BR-54) |

### **3.2.1. Danh sách User story**

#### **User story US\_ABG\_04: Sinh bảng giá dịch vụ theo tổ hợp thuộc tính \[PHỨC TẠP\]**

| ID US | US\_ABG\_04 |
| :---- | :---- |
| **Tên Story** | Sinh bảng giá dịch vụ theo tổ hợp thuộc tính của Yêu cầu báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống sinh sẵn các bảng giá dịch vụ theo đúng các tổ hợp thuộc tính khách hàng yêu cầu, để không phải khai báo thủ công từng bảng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Báo giá nội bộ – Engine sinh bảng giá tự động |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Với mỗi dịch vụ được tick tại Yêu cầu báo giá, hệ thống sinh bảng giá theo tích Descartes các giá trị thuộc tính tương ứng của loại dịch vụ đó (BR-36). | Bỏ sót dịch vụ được tick; hoặc sinh thiếu tổ hợp so với giá trị đã nhập tại Yêu cầu báo giá. |
| AC2 | Ánh xạ nguồn giá trị thuộc tính theo BR-34: – Chi cục hải quan ← Địa điểm làm TTHQ (KBHQ và HQGS) – Phương thức sang tải ← Loại hình sang tải – Tên kho ← Địa điểm kho; Loại kho ← Loại hình kho – Loại xe ← Loại xe yêu cầu – Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa ← trường cùng tên | Lấy sai trường nguồn (ví dụ lấy Cửa khẩu thay cho Địa điểm làm TTHQ). |
| AC3 | Vận tải: mỗi cặp Điểm đi – Điểm đến giữ nguyên cặp, không mix chéo. Khớp với danh mục Địa điểm vận tải theo Quốc gia / Tỉnh – Thành phố và các cấp chi tiết (Việt Nam: Phường – Xã; Trung Quốc: Thành phố/Địa cấp thị, Quận/Huyện, Phường – Xã) (BR-35). | Mix chéo điểm đi của cặp này với điểm đến của cặp khác. |
| AC4 | Hệ thống khử trùng giá trị lặp và tổ hợp trùng trước khi sinh; không tồn tại hai bảng giá trùng bộ thuộc tính trong cùng báo giá (kế thừa BR29). | Sinh hai bảng giá cùng Loại dịch vụ và trùng toàn bộ giá trị thuộc tính. |
| AC5 | Mỗi bảng giá được sinh ID theo cấu trúc IQYYMM-XXX (BR12). Tên bảng giá tự sinh theo cấu trúc “{các giá trị thuộc tính nối bằng dấu /}”. | Không sinh ID; hoặc để trống Tên bảng giá (trường bắt buộc). |
| AC6 | Kiểm soát ngưỡng tổ hợp (BR-46): – ≤ 50 tổ hợp: xử lý đồng bộ. – 51 đến 200 tổ hợp: xử lý nền. – \> 200 tổ hợp: chặn và báo lỗi. | Xử lý đồng bộ với số tổ hợp lớn gây treo giao diện; hoặc không chặn khi vượt 200 tổ hợp. |
| AC7 | Tiền tệ của mọi bảng giá tự sinh \= VNĐ và ở chế độ không cho chỉnh sửa. | Sinh bảng giá với tiền tệ khác VNĐ. |

**▸ Use Case chi tiết UC\_ABG\_02 — Sinh tổ hợp bảng giá dịch vụ**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Hệ thống – Auto-BGNB Engine |
| Actor phụ | Menu Quản lý danh mục – danh mục địa điểm vận tải Yêu cầu báo giá – nguồn giá trị thuộc tính |
| Precondition | 1\. Yêu cầu báo giá đã đạt điều kiện thực hiện chức năng Lấy tự động BGNB (SRS Quản lý YCBG \+ Báo giá KH) và đã qua bước kiểm tra dữ liệu đầu vào (BR-32, BR-52). 2\. Danh sách dịch vụ được tick đã xác định. |
| Trigger | Engine được gọi khi K1 bấm “Lấy tự động BGNB” (US\_ABG\_01 — SRS Quản lý YCBG \+ Báo giá KH). |
| Luồng chính (Main flow) | 1\. Đọc danh sách dịch vụ được tick tại Yêu cầu báo giá. 2\. Với mỗi dịch vụ, xác định bộ thuộc tính bắt buộc của loại dịch vụ đó. 3\. Ánh xạ từng thuộc tính về trường nguồn tại Yêu cầu báo giá theo BR-34. 4\. Khử trùng giá trị trong từng tập nguồn. 5\. Sinh tích Descartes các tập giá trị thành danh sách tổ hợp. 6\. Riêng Vận tải: ghép (cặp điểm × loại xe), không mix chéo điểm đi và điểm đến. 7\. Khử trùng tổ hợp và đếm tổng số tổ hợp của toàn báo giá. 8\. Sinh ID và Tên cho từng bảng giá; chuyển sang bước nạp đầu mục giá (UC\_ABG\_03). |
| Luồng thay thế (Alternative) | 6a. Cặp điểm của Yêu cầu báo giá không nằm trong phạm vi danh mục địa điểm vận tải: 6a1. Bảng giá vẫn được sinh nhưng sẽ không khớp được dòng giá ở bước sau. 6a2. Bảng giá rơi vào quy tắc thiếu giá cấp 2 (BR-42). 7a. Tổng số tổ hợp trong khoảng 51 đến 200: engine chuyển sang chế độ xử lý nền (BR-46). |
| Luồng ngoại lệ (Exception) | 3a. Trường nguồn không có giá trị: không phát sinh tại bước này — đã chặn tại bước kiểm tra dữ liệu đầu vào (BR-32). 7b. Tổng số tổ hợp \> 200: engine dừng, trả lỗi vượt ngưỡng, không sinh bảng giá nào. |
| Postcondition | Danh sách bảng giá dịch vụ (chưa có dòng giá) đã sẵn sàng cho bước khớp dòng giá. |
| Business Rules liên quan | BR-32, BR-34, BR-35, BR-36, BR-42, BR-46, BR-52 |

#### **User story US\_ABG\_05: Tự động khớp dòng giá và tính toán tài chính \[PHỨC TẠP\]**

| ID US | US\_ABG\_05 |
| :---- | :---- |
| **Tên Story** | Tự động khớp dòng giá từ Giá bán định mức và tính toán chỉ tiêu tài chính |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống tự khớp dòng giá từ Giá bán định mức và tính sẵn các chỉ tiêu tài chính, để báo giá phản ánh đúng bảng định mức đã thiết lập. |
| **Độ Ưu tiên** | Must have |
| **Module** | Báo giá nội bộ – Engine sinh bảng giá tự động |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Đầu mục giá đưa vào bảng giá phải thỏa: đúng loại dịch vụ; Loại giá thuộc {Cố định, Phụ phí}; đang Kích hoạt. Đầu mục Loại giá “Phát sinh” và đầu mục tắt kích hoạt không xuất hiện (kế thừa BR5). | Bảng giá hiển thị đầu mục Loại giá “Phát sinh” hoặc đầu mục đã tắt kích hoạt. |
| AC2 | Riêng Kho bãi: chỉ nạp đầu mục giá có Loại kho chứa Loại kho của bảng giá đang xử lý (BR-37). | Nạp đầu mục của Loại kho khác vào bảng giá, làm bảng giá bị disable sai. |
| AC3 | Điều kiện khớp dòng Giá bán định mức: cùng đầu mục giá và mọi thuộc tính khớp tuyệt đối hoặc khớp với giá trị “Tất cả” (BR-38). | Khớp nhầm dòng khác đầu mục; hoặc bỏ sót dòng có giá trị “Tất cả”. |
| AC4 | Tie-break khi nhiều dòng cùng khớp, áp dụng đúng thứ tự 3 tầng (BR-39): 1\. Loại bỏ các dòng có Giá bán định mức \= null. 2\. Ưu tiên dòng có độ đặc hiệu cao hơn. Độ đặc hiệu \= số thuộc tính có giá trị cụ thể (khác “Tất cả”); dòng có độ đặc hiệu cao hơn được chọn; bằng nhau thì xét tầng 3\. 3\. Lấy dòng có Giá bán định mức CAO NHẤT. Không phát sinh trường hợp nhiều dòng khớp cùng Đơn vị tính: mỗi dòng Giá bán định mức là kết quả gom các dòng giá mua đầu vào theo một tổ hợp duy nhất Đầu mục giá \+ bộ thuộc tính \+ Đơn vị tính. Không hiển thị icon cảnh báo khi có nhiều dòng cùng khớp. | Lấy dòng có Giá bán định mức thấp nhất; bỏ qua bước loại dòng có Giá bán định mức \= null; hoặc chọn dòng có độ đặc hiệu thấp hơn. |
| AC5 | Bảng giá chứa một đầu mục giá KHÔNG khớp được dòng Giá bán định mức nào, hoặc chỉ khớp đúng 1 dòng Giá bán định mức mà dòng đó không có Giá bán định mức: toàn bộ bảng giá chứa đầu mục giá đó bị disable (BR-42). | Chỉ đánh dấu dòng giá thiếu giá mà vẫn cho sử dụng bảng giá. |
| AC6 | Dòng giá được điền: Mã giá bán định mức, Đơn vị tính, Giá mua định mức, Giá bán định mức; Đơn giá mặc định \= Giá bán định mức (BR7). | Đơn giá không bằng Giá bán định mức; hoặc thiếu Mã giá bán định mức. |
| AC7 | % Lợi nhuận của dòng giá \= (Đơn giá − Giá mua định mức) / Giá mua định mức, hiển thị ở chế độ chỉ đọc (BR6). | Cho nhập tay % Lợi nhuận; hoặc % Lợi nhuận không được tính. |
| AC8 | Giá mua định mức và Giá bán định mức được snapshot tại thời điểm sinh báo giá; thay đổi tại menu nguồn sau đó không tác động ngược (BR-40). | Báo giá đã phát hành tự thay đổi giá khi Giá bán định mức nguồn được cập nhật. |
| AC9 | Tổng đơn giá bảng giá \= Σ Đơn giá các dòng giá. Tổng đơn giá bảng giá \= null khi bảng giá bị disable. Tổng đơn giá dịch vụ \= Σ Tổng đơn giá các bảng giá khả dụng; bảng giá bị disable không tham gia tổng hợp (BR9, BR-42). | Bảng giá disable vẫn có Tổng đơn giá khác null; hoặc vẫn được cộng vào Tổng đơn giá dịch vụ. |
| AC10 | Lợi nhuận dự kiến (%) \= (Σ Đơn giá − Σ Giá mua định mức) / Σ Giá mua định mức, tính trên các bảng giá khả dụng (BR10). | Tính Lợi nhuận dự kiến trên cả bảng giá bị disable hoặc dòng giá thiếu giá. |
| AC11 | Mỗi dòng giá trong bảng giá được hệ thống sinh ID riêng (BR19). Dòng giá sinh ra mặc định có trạng thái \= Đang hiệu lực | Dòng giá không có ID hoặc ID bị trùng. |

**▸ Use Case chi tiết UC\_ABG\_03 — Khớp dòng giá và tính toán tài chính**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Hệ thống – Auto-BGNB Engine |
| Actor phụ | Menu Cấu hình đầu mục giá Menu Giá mua định mức Menu Giá bán định mức |
| Precondition | Danh sách bảng giá (chưa có dòng giá) đã được sinh từ UC\_ABG\_02. |
| Trigger | Kết thúc bước sinh tổ hợp bảng giá. |
| Luồng chính (Main flow) | 1\. Với mỗi bảng giá, lấy danh sách đầu mục giá hợp lệ theo loại dịch vụ. 2\. Với Kho bãi, lọc thêm đầu mục theo Loại kho của bảng giá. 3\. Với mỗi đầu mục, truy vấn Giá bán định mức theo đầu mục và bộ thuộc tính (chấp nhận giá trị “Tất cả”). 4\. Loại bỏ các dòng có Giá bán định mức \= null. 5\. Áp dụng tie-break: độ đặc hiệu (số thuộc tính có giá trị cụ thể) → lấy dòng có Giá bán định mức cao nhất. 6\. Điền dữ liệu dòng giá; đặt Đơn giá \= Giá bán định mức; tính % Lợi nhuận; snapshot giá. 7\. Tính Tổng đơn giá của bảng giá; bảng giá bị disable có Tổng đơn giá \= null. 8\. Tính Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%) trên các bảng giá khả dụng. |
| Luồng thay thế (Alternative) | 3a. Chỉ có dòng giá trị “Tất cả” khớp: hệ thống chọn dòng đó và tiếp tục tại bước 6\. 5a. Nhiều dòng khớp (các dòng luôn khác Đơn vị tính): hệ thống chọn theo tầng 2 rồi tầng 3 (BR-39); không hiển thị icon cảnh báo. |
| Luồng ngoại lệ (Exception) | 1a. Loại dịch vụ không có đầu mục giá nào đang kích hoạt: bảng giá không có dòng giá nào → bảng giá bị disable (BR-42); toàn bộ bảng giá của dịch vụ rơi vào quy tắc cấp 3 (BR-43). 2a. Kho bãi không có đầu mục giá nào phù hợp Loại kho của bảng giá: bảng giá không có dòng giá nào → bảng giá bị disable (BR-42). 3b. Không có dòng Giá bán định mức nào khớp: dòng giá rơi vào quy tắc thiếu giá cấp 1 và bảng giá chứa dòng đó bị disable (BR-41, BR-42). 4a. Toàn bộ dòng khớp đều có Giá bán định mức \= null: xử lý như 3b. 4b. Giá mua định mức của dòng \= null (kéo theo Giá bán định mức \= null theo BR12 — SRS Giá bán định mức): xử lý như 3b. |
| Postcondition | Mỗi bảng giá có đầy đủ dòng giá (có giá hoặc gắn nhãn thiếu giá). Mỗi bảng giá được xác định trạng thái khả dụng hoặc disable. |
| Business Rules liên quan | BR-37, BR-38, BR-39, BR-40, BR-41, BR-42, BR-43 |

#### **User story US\_ABG\_06: Hiển thị và xử lý bảng giá thiếu Giá bán định mức**

| ID US | US\_ABG\_06 |
| :---- | :---- |
| **Tên Story** | Hiển thị và xử lý bảng giá thiếu Giá bán định mức theo 4 cấp |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống chỉ rõ dòng giá / bảng giá / dịch vụ nào không có giá, để biết chính xác phần nào của báo giá không sử dụng được và xử lý bổ sung. |
| **Độ Ưu tiên** | Must have |
| **Module** | Báo giá nội bộ – Engine sinh bảng giá tự động |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Cấp 1 – Dòng giá: dòng không khớp được dòng Giá bán định mức nào, hoặc dòng khớp có Giá bán định mức \= null. Xử lý: vẫn hiển thị dòng, các ô giá để trống, gắn badge xám “Chưa có giá định mức”; dòng không tham gia tổng hợp (BR-41). | Ẩn dòng giá thiếu giá; hoặc dòng thiếu giá vẫn được cộng vào Tổng đơn giá. |
| AC2 | Cấp 2 – Bảng giá: bảng có ≥ 1 dòng thuộc AC1, kể cả khi dòng đó thuộc đầu mục Loại giá “Phụ phí”; hoặc bảng giá không có dòng giá nào. Xử lý: disable toàn bộ bảng giá, hiển thị chú thích “Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức”; Tổng đơn giá của bảng \= null và không tính vào báo giá (BR-42). | Chỉ disable dòng thiếu giá mà vẫn cho sử dụng bảng giá; bỏ qua dòng Phụ phí khi xét disable; hoặc bảng giá không có dòng giá nào vẫn được coi là khả dụng. |
| AC3 | Cấp 3 – Loại dịch vụ: toàn bộ bảng giá của một loại dịch vụ bị disable, hoặc loại dịch vụ không có đầu mục giá nào đang kích hoạt. Xử lý: hiển thị banner “Doanh nghiệp không cung ứng dịch vụ này” tại tab loại dịch vụ (BR-43). | Không hiển thị banner khi toàn bộ bảng giá của dịch vụ bị disable. |
| AC4 | Cấp 4 – Báo giá: không còn bảng giá khả dụng nào trong toàn bộ báo giá. Xử lý: chặn tạo báo giá và báo lỗi (BR-44). | Vẫn tạo và phát hành báo giá không có dòng giá hợp lệ nào. |
| AC5 | Badge cấp 1 có tooltip nêu nguyên nhân: “Chưa có nhà thầu cung ứng” (không tồn tại dòng định mức) hoặc “Chưa thiết lập giá bán định mức” (dòng tồn tại nhưng Giá bán định mức \= null). | Gộp hai nguyên nhân làm một, người dùng không biết xử lý ở menu nào. |
| AC6 | Nhãn “Doanh nghiệp không cung ứng dịch vụ này” (cấp 3\) tồn tại song song và độc lập với cảnh báo “Dịch vụ chưa được báo giá” của BR28; hai nhãn dùng cho hai ngữ cảnh khác nhau (BR-50). | Thay thế hoặc gộp hai nhãn làm một. |
| AC7 | Bảng giá bị disable KHÔNG xuất hiện trong màn Chỉnh sửa báo giá. Khi Lưu chỉnh sửa báo giá, bảng giá bị disable được giữ nguyên (không bị xóa), trừ trường hợp bị ghi đè. Bảng giá bị disable bị ghi đè khi có bảng giá trùng bộ thông tin thuộc tính được tạo thêm; việc ghi đè thực hiện khi Lưu báo giá (BR29). Bảng giá bị disable KHÔNG được lấy khi tạo Báo giá khách hàng. | Bảng giá disable vẫn hiển thị tại màn Chỉnh sửa báo giá; bị xóa khi Lưu chỉnh sửa; được đưa vào Báo giá khách hàng; hoặc chặn tạo bảng giá mới trùng bộ thuộc tính với bảng giá disable. |

#### **User story US\_ABG\_08: Đồng bộ giá định mức cho Báo giá nội bộ tự động \[PHỨC TẠP\]**

| ID US | US\_ABG\_08 |
| :---- | :---- |
| **Tên Story** | Đồng bộ giá định mức cho Báo giá nội bộ tự động |
| **User story** | Là người dùng được phân quyền “Lấy tự động BGNB”, tôi muốn cập nhật lại giá của Báo giá nội bộ tự động theo Giá bán định mức hiện hành ngay tại màn Chi tiết báo giá, để báo giá phản ánh giá mới nhất trước khi tạo Báo giá khách hàng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Báo giá nội bộ – Engine sinh bảng giá tự động |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Nút “Đồng bộ giá định mức” hiển thị tại màn Chi tiết báo giá nội bộ khi đồng thời: Nguồn tạo \= Tự động; trạng thái Đã phát hành hoặc Thu hồi; Yêu cầu báo giá chưa có Báo giá khách hàng; người dùng có quyền “Lấy tự động BGNB” (BR-54). | Nút hiển thị khi Nguồn tạo \= Thủ công, ở trạng thái khác (kể cả Hết hiệu lực), khi đã có Báo giá khách hàng hoặc người dùng không có quyền. |
| AC2 | Bấm nút: hệ thống hiển thị popup xác nhận “Hệ thống sẽ cập nhật lại giá theo Giá bán định mức hiện hành. Tiếp tục?”; Hủy → không thay đổi dữ liệu. | Cập nhật giá không qua xác nhận; hoặc Hủy vẫn cập nhật. |
| AC3 | Khi Xác nhận, hệ thống kiểm tra lại điều kiện chưa có Báo giá khách hàng; nếu đã có → chặn thao tác và báo lỗi (BR-54). | Vẫn cập nhật giá khi Báo giá khách hàng vừa được tạo. |
| AC4 | Đầu mục đã gắn dòng Giá bán định mức còn tồn tại và có giá: lấy lại Giá mua định mức, Giá bán định mức theo ID đã gắn; Đơn giá \= Giá bán định mức mới; tính lại % Lợi nhuận (BR-55a). Dòng giá đang Hết hạn cũng được lấy lại giá theo ID đã gắn và chuyển về Đang hiệu lực (BR-59). | Giá không được cập nhật theo ID đã gắn; hoặc Đơn giá không bằng Giá bán định mức mới. |
| AC5 | Dòng đã gắn không còn tồn tại hoặc Giá bán định mức \= null: hệ thống dò dòng khác theo BR-38, BR-39. – Có dòng phù hợp → gắn dòng mới vào đầu mục giá. – Không có → dòng giá chuyển cấp 1 (badge “Chưa có giá định mức”) và bảng giá chứa dòng đó bị disable (BR-55b). | Giữ dòng không còn giá mà không dò dòng thay thế; hoặc không disable bảng giá khi không có dòng thay thế. |
| AC6 | Đầu mục chưa gắn dòng Giá bán định mức: gắn dòng theo rule của Lấy tự động BGNB; không có dòng phù hợp → giữ nguyên (BR-55c). | Không gắn dòng cho đầu mục chưa có giá khi đã có dòng Giá bán định mức phù hợp. |
| AC7 | Phạm vi cập nhật: toàn bộ dòng giá của toàn bộ bảng giá, kể cả bảng đang bị disable; không sinh thêm, không xóa bảng giá; giữ nguyên danh sách đầu mục của từng bảng. | Bỏ qua bảng giá đang bị disable; hoặc sinh thêm / xóa bảng giá. |
| AC8 | Sau khi cập nhật: tính lại quy tắc thiếu giá cấp 1–3; bảng đang disable mà đủ giá được mở lại thành khả dụng; tính lại Tổng đơn giá bảng giá, Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (BR-41 → BR-43, BR9, BR10). | Bảng giá đủ giá vẫn bị disable; hoặc chỉ tiêu tổng hợp không được tính lại. |
| AC9 | Sau khi cập nhật mà không còn bảng giá khả dụng nào: không áp dụng kết quả, giữ nguyên dữ liệu và báo lỗi “Không có bảng giá khả dụng sau khi lấy giá mới nhất, giữ nguyên báo giá hiện tại”. | Lưu kết quả khiến báo giá không còn bảng giá khả dụng. |
| AC10 | Cập nhật thành công: giá được snapshot lại tại thời điểm bấm; không đổi trạng thái, Nguồn tạo, Người phát hành, Thời điểm phát hành, Thời hạn hiệu lực; hiển thị “Đã cập nhật giá bán định mức mới nhất cho báo giá {Mã báo giá}” và ghi Lịch sử hoạt động. | Đổi trạng thái hoặc thông tin phát hành của báo giá; không ghi Lịch sử hoạt động. |
| AC11 | Xử lý đồng bộ trong 1 transaction; lỗi giữa chừng → rollback toàn bộ, giữ nguyên dữ liệu báo giá (BR-47). | Lưu dở dang một phần kết quả khi xảy ra lỗi. |

**▸ Use Case chi tiết UC\_ABG\_04 — Đồng bộ giá định mức**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Người dùng có quyền “Lấy tự động BGNB” |
| Actor phụ | Hệ thống – Auto-BGNB Engine Menu Giá bán định mức, Giá mua định mức |
| Precondition | 1\. Báo giá nội bộ có Nguồn tạo \= Tự động, ở trạng thái Đã phát hành hoặc Thu hồi. 2\. Yêu cầu báo giá chưa có Báo giá khách hàng. |
| Trigger | Người dùng bấm “Đồng bộ giá định mức” tại màn Chi tiết báo giá nội bộ. |
| Luồng chính (Main flow) | 1\. Hệ thống hiển thị popup xác nhận; người dùng Xác nhận. 2\. Hệ thống kiểm tra lại điều kiện BR-54. 3\. Với mỗi đầu mục của mỗi bảng giá: đầu mục đã gắn dòng còn giá → lấy lại giá theo ID đã gắn; Đơn giá \= Giá bán định mức mới; tính lại % Lợi nhuận. 4\. Tính lại quy tắc thiếu giá cấp 1–3 và các chỉ tiêu tổng hợp. 5\. Hệ thống xác nhận còn ≥ 1 bảng giá khả dụng, lưu kết quả (snapshot lại giá). 6\. Hệ thống hiển thị thông báo thành công và ghi Lịch sử hoạt động. |
| Luồng thay thế (Alternative) | 3a. Dòng đã gắn không còn tồn tại hoặc Giá bán định mức \= null: dò dòng khác theo BR-38, BR-39; có → gắn dòng mới; không → dòng chuyển cấp 1, bảng giá bị disable. 3b. Đầu mục chưa gắn dòng: gắn theo BR-38, BR-39; không có → giữ cấp 1\. 4a. Bảng giá đang disable mà nay đủ giá: mở lại thành khả dụng. |
| Luồng ngoại lệ (Exception) | 1a. Người dùng Hủy: không thay đổi dữ liệu. 2a. Yêu cầu báo giá đã có Báo giá khách hàng: chặn thao tác, báo lỗi. 5a. Không còn bảng giá khả dụng: không áp dụng kết quả, giữ nguyên dữ liệu, báo lỗi. 5b. Lỗi hệ thống giữa chừng: rollback toàn bộ, giữ nguyên dữ liệu. |
| Postcondition | Thành công: báo giá được cập nhật giá theo Giá bán định mức hiện hành, giữ nguyên trạng thái và thông tin phát hành. Thất bại: dữ liệu báo giá không thay đổi. |
| Business Rules liên quan | BR-38, BR-39, BR-41, BR-42, BR-43, BR-47, BR-54, BR-55 |

### **3.2.2. Mô tả giao diện**

Link UI Design: \[Chèn link\]. Màn hình liên quan: Thêm mới / Chỉnh sửa / Chi tiết Báo giá nội bộ — bổ sung trường Nguồn tạo và các thành phần cảnh báo thiếu giá.

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Nguồn tạo |  | Enum (chỉ đọc) | — | Tự động | Tự động / Thủ công; hiển thị tại nhóm Thông tin phát hành báo giá.  Báo giá tự động được K2 Lưu chỉnh sửa sau Thu hồi: chuyển từ “Tự động” sang “Thủ công” (BR-45) |
| Người tạo |  | Text (chỉ đọc) | — | Hệ thống | Báo giá tự động ghi giá trị “Hệ thống”; giữ nguyên khi K2 Lưu chỉnh sửa và Phát hành lại |
| Người phát hành |  | Text (chỉ đọc) | — | Hệ thống | Báo giá tự động ghi giá trị “Hệ thống”; khi K2 Phát hành lại sau Thu hồi \= người thực hiện (US\_QUO\_08 AC3) |
| Tên báo giá | v | Text | 200 | (Tự sinh) | “BGNB tự động – {Mã RFQ} – {Tên khách hàng}”; đảm bảo không trùng vì Mã RFQ là duy nhất |
| Thời hạn hiệu lực | v | Date | — | (Tự sinh) | Ngày tạo \+ N ngày; N là tham số cấu hình hệ thống, mặc định 7 |
| Tên bảng giá dịch vụ | v | Text | 200 | (Tự sinh) | “{các giá trị thuộc tính nối bằng dấu /}” |
| Tổng đơn giá bảng giá |  | Number (chỉ đọc) | — | (Tự tính) | \= Σ Đơn giá các dòng giá; \= null khi bảng giá bị disable |
| Badge “Chưa có giá định mức” |  | Badge (chỉ đọc) | — | (Ẩn) | Gắn tại dòng giá thiếu Giá bán định mức — quy tắc cấp 1; tooltip nêu nguyên nhân (US\_ABG\_06 AC5) |
| Chú thích bảng giá disable |  | Text (chỉ đọc) | — | (Ẩn) | “Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức” — cấp 2 |
| Banner loại dịch vụ |  | Text (chỉ đọc) | — | (Ẩn) | “Doanh nghiệp không cung ứng dịch vụ này” — cấp 3 |
| Đơn vị tính (cột trong bảng giá) |  | Text (chỉ đọc) | — | (Theo dòng giá) | Lấy từ dòng Giá bán định mức, KHÔNG lấy từ đầu mục giá (xem Bảng 3\) |
| Nút “Đồng bộ giá định mức” |  | Button | — | (Ẩn) | Hiển thị tại màn Chi tiết báo giá nội bộ khi thỏa BR-54 (Nguồn tạo \= Tự động; Đã phát hành / Thu hồi; chưa có Báo giá khách hàng; có quyền “Lấy tự động BGNB”) |

### **3.2.3. Quy tắc nghiệp vụ (Business Rule)**

*Mã BR đánh số tiếp nối từ BR30; giữ nguyên số hiệu theo SRS Tự động tạo Báo giá nội bộ. BR-31, BR-33, BR-48 đặc tả tại SRS Quản lý YCBG \+ Báo giá KH.*

| ID | Quy tắc |
| :---- | :---- |
| BR-32 | Trước khi sinh bảng giá, hệ thống kiểm tra thuộc tính nguồn phục vụ phép mix của từng dịch vụ được tick tại Yêu cầu báo giá (theo bảng ánh xạ BR-34, BR-35): Địa điểm làm TTHQ (KBHQ, HQGS), Địa điểm kho, Loại hình kho, Địa điểm sang tải, Loại hình sang tải, Loại xe yêu cầu, Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa và cặp Điểm đi – Điểm đến (Vận tải). Do các thuộc tính nguồn không bắt buộc khi lưu Yêu cầu báo giá ở trạng thái Nháp, nếu một dịch vụ được tick thiếu giá trị ở bất kỳ thuộc tính nguồn nào, hệ thống chặn tạo báo giá tự động và báo lỗi kèm danh sách {Loại dịch vụ – Tên trường} còn thiếu; không sinh bản ghi báo giá nội bộ, Yêu cầu báo giá giữ nguyên trạng thái. |
| BR-34 | Bảng ánh xạ nguồn giá trị thuộc tính (thống nhất với BR25) — Chi cục hải quan ← Địa điểm làm TTHQ (áp dụng cho cả Khai báo hải quan và Hải quan giám sát); Phương thức sang tải ← Loại hình sang tải; Tên kho ← Địa điểm kho; Loại kho ← Loại hình kho; Loại xe ← Loại xe yêu cầu; Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa ← trường cùng tên tại Yêu cầu báo giá. |
| BR-35 | Vận tải — Điểm đi và Điểm đến lấy từ các cặp điểm của Yêu cầu báo giá, giữ nguyên cặp và không mix chéo. Quy tắc khớp điểm của Yêu cầu báo giá với Địa điểm vận tải (dùng chung cho luồng thủ công — BR25 — và luồng tự động): cùng Quốc gia và cùng Tỉnh/Thành phố; với mỗi cấp chi tiết hơn (Việt Nam: Phường/Xã; Trung Quốc: Thành phố/Địa cấp thị → Quận/Huyện → Phường/Xã), nếu Địa điểm vận tải có khai báo cấp đó thì giá trị của điểm phải thuộc tập giá trị đã khai báo, nếu bỏ trống thì coi như bao phủ toàn bộ cấp đó; điểm của Yêu cầu báo giá chỉ có dữ liệu tới cấp nào thì so sánh tới cấp đó. Phạm vi áp dụng: Việt Nam và Trung Quốc (BR-DM-17, BR-DM-18 — SRS Quản lý danh mục). |
| BR-36 | Mỗi tổ hợp giá trị thuộc tính sinh đúng 1 bảng giá dịch vụ; hệ thống khử trùng giá trị lặp trong từng tập nguồn và khử trùng tổ hợp trước khi sinh, đảm bảo không tồn tại hai bảng giá trùng bộ thuộc tính (kế thừa BR29). |
| BR-37 | Đầu mục giá đưa vào bảng giá tự sinh phải đúng loại dịch vụ, có Loại giá thuộc {Cố định, Phụ phí} và đang Kích hoạt. Riêng phân hệ Kho bãi, đầu mục giá còn phải có Loại kho chứa Loại kho của bảng giá đang xử lý (theo BR11 — SRS Cấu hình đầu mục giá). |
| BR-38 | Điều kiện khớp một dòng Giá bán định mức với cặp (bảng giá, đầu mục giá): cùng loại dịch vụ, cùng đầu mục giá, và với mọi thuộc tính của loại dịch vụ thì giá trị của dòng định mức bằng giá trị của bảng giá hoặc bằng “Tất cả”. |
| BR-39 | Tie-break khi nhiều dòng Giá bán định mức cùng khớp, áp dụng theo đúng thứ tự 3 tầng: (1) loại bỏ dòng có Giá bán định mức \= null; (2) ưu tiên dòng có độ đặc hiệu cao hơn — độ đặc hiệu \= số thuộc tính có giá trị cụ thể (khác “Tất cả”), dòng có độ đặc hiệu cao hơn được chọn, bằng nhau thì xét tầng (3); (3) lấy dòng có Giá bán định mức CAO NHẤT. Không phát sinh trường hợp nhiều dòng khớp cùng Đơn vị tính, vì mỗi dòng Giá bán định mức là kết quả gom các dòng giá mua đầu vào theo một tổ hợp duy nhất Đầu mục giá \+ bộ thuộc tính \+ Đơn vị tính (BR2 — SRS Giá mua định mức). Hệ thống không hiển thị icon cảnh báo khi có nhiều dòng cùng khớp. |
| BR-40 | Đơn giá của dòng giá mặc định bằng Giá bán định mức; % Lợi nhuận \= (Đơn giá − Giá mua định mức) / Giá mua định mức. Giá mua định mức và Giá bán định mức được snapshot tại thời điểm sinh báo giá và không tự đồng bộ khi nguồn thay đổi (chốt lại BR8; cần cập nhật mục 3.1.5 SRS Cấu hình đầu mục giá đang ghi “tham chiếu động, không snapshot”). Ngoại lệ: chức năng Đồng bộ giá định mức snapshot lại giá tại thời điểm bấm nút (BR-55). |
| BR-41 | Quy tắc thiếu giá cấp 1 — Dòng giá không khớp được dòng Giá bán định mức nào, hoặc dòng khớp có Giá bán định mức \= null: dòng vẫn hiển thị, các ô giá để trống, gắn badge xám “Chưa có giá định mức” và không tham gia các chỉ tiêu tổng hợp. |
| BR-42 | Quy tắc thiếu giá cấp 2 — Bảng giá có tối thiểu 1 dòng thuộc BR-41 (kể cả dòng thuộc đầu mục Loại giá “Phụ phí”), hoặc bảng giá không có dòng giá nào (loại dịch vụ không có đầu mục giá đang kích hoạt, hoặc Kho bãi không có đầu mục giá phù hợp Loại kho): toàn bộ bảng giá chuyển trạng thái disable và hiển thị chú thích “Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức”. Bảng giá bị disable có Tổng đơn giá \= null, không tham gia Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (ngoại lệ của BR9, BR10), không xuất hiện trong màn Chỉnh sửa báo giá, được giữ nguyên khi Lưu chỉnh sửa báo giá, bị ghi đè khi Lưu báo giá có bảng giá trùng bộ thuộc tính được tạo thêm (BR29), và không được lấy khi tạo Báo giá khách hàng. Bảng giá còn có thể bị disable do dòng giá Hết hạn — xử lý theo BR-58. |
| BR-43 | Quy tắc thiếu giá cấp 3 — Toàn bộ bảng giá của một loại dịch vụ bị disable, hoặc loại dịch vụ đó không có đầu mục giá nào đang kích hoạt: hiển thị banner “Doanh nghiệp không cung ứng dịch vụ này” tại tab loại dịch vụ. |
| BR-44 | Quy tắc thiếu giá cấp 4 — Toàn bộ báo giá không còn bảng giá khả dụng nào: hệ thống chặn tạo báo giá tự động và báo lỗi; Yêu cầu báo giá giữ nguyên trạng thái để tiếp tục luồng thủ công (giữ nguyên điều kiện phát hành của BR14; bảng giá bị disable không được tính là dòng giá hợp lệ). |
| BR-45 | Báo giá nội bộ tạo tự động có: Nguồn tạo \= “Tự động”; Người tạo \= Người phát hành \= “Hệ thống”; Mã báo giá theo BR11; Tên báo giá và Thời hạn hiệu lực tự sinh; Tên bảng giá dịch vụ tự sinh theo cấu trúc “{các giá trị thuộc tính nối bằng dấu /}”; Đơn vị tiền tệ \= VNĐ.  Khi Chuyên viên định giá Lưu chỉnh sửa báo giá tự động sau khi Thu hồi (US\_QUO\_03 — sửa Đơn giá, thêm/xóa bảng giá dịch vụ, đổi Yêu cầu báo giá…): Nguồn tạo chuyển ngay từ “Tự động” sang “Thủ công”; Người tạo giữ “Hệ thống”; khi Phát hành lại, Người phát hành \= người thực hiện. |
| BR-46 | Ngưỡng kiểm soát tổ hợp — ≤ 50 tổ hợp: xử lý đồng bộ; từ 51 đến 200 tổ hợp: xử lý nền và thông báo khi hoàn tất; \> 200 tổ hợp: chặn và yêu cầu tạo báo giá thủ công. Dữ liệu đầu vào được chốt tại thời điểm bấm “Lấy tự động BGNB”. Trong thời gian xử lý nền, hệ thống không khóa các thao tác trên Yêu cầu báo giá; khi job hoàn tất mà Yêu cầu báo giá đã thay đổi trạng thái, hệ thống hủy kết quả, không tạo báo giá nội bộ và gửi thông báo thất bại. |
| BR-47 | Toàn bộ quá trình sinh báo giá tự động chạy trong một transaction; lỗi giữa chừng phải rollback hoàn toàn, không để lại báo giá dở dang chiếm liên kết 1-1 với Yêu cầu báo giá (BR1). Thông báo kết quả tạo tự động (thành công hoặc thất bại, cả xử lý đồng bộ và xử lý nền) chỉ gửi cho người dùng đã bấm “Lấy tự động BGNB”. |
| BR-49 | Thu hồi và chỉnh sửa báo giá tự động áp dụng nguyên các quy tắc hiện hành của SRS này (US\_QUO\_11, US\_QUO\_03, BR21, BR22); sau khi Thu hồi, Yêu cầu báo giá chuyển “Đang báo giá” (US\_QUO\_11 AC4). Thu hồi bị chặn khi Dịch vụ khách hàng đã tạo Báo giá khách hàng (AC5 — US\_BG\_09). |
| BR-50 | BR27 (cảnh báo soft khi thiếu bảng giá dịch vụ) KHÔNG áp dụng cho luồng tạo tự động, chỉ áp dụng cho luồng tạo báo giá thủ công của K2; BR28 (cảnh báo “Dịch vụ chưa được báo giá”) giữ nguyên và tồn tại song song, độc lập với nhãn “Doanh nghiệp không cung ứng dịch vụ này” của BR-43. |
| BR-52 | Chỉ áp dụng cho luồng tạo tự động. Trước khi sinh bảng giá, hệ thống kiểm tra các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động: Tên báo giá, Mã yêu cầu báo giá liên quan, Thời hạn hiệu lực, Khách hàng, Hạng khách hàng, Đơn vị tiền tệ, Loại dịch vụ, Tên bảng giá dịch vụ. Nếu một trong các trường không có dữ liệu, hệ thống DỪNG luồng tạo tự động và báo lỗi “Không đủ thông tin để tạo tự động báo giá nội bộ”; không sinh bản ghi báo giá và Yêu cầu báo giá giữ nguyên trạng thái. Đơn giá trống của dòng giá không thuộc phạm vi kiểm tra này — xử lý theo quy tắc thiếu giá 4 cấp (BR-41 → BR-44). |
| BR-53 | Chỉ thao tác tạo báo giá tự động THÀNH CÔNG được ghi vào Lịch sử hoạt động của Yêu cầu báo giá và của báo giá; các lần chạy thất bại không được ghi nhận vào Lịch sử hoạt động (chỉ ghi log hệ thống). |
| BR-54 | Chức năng “Đồng bộ giá định mức” tại màn Chi tiết báo giá nội bộ chỉ hiển thị và sử dụng được khi đồng thời:  (1) Nguồn tạo \= “Tự động”;  (2) báo giá ở trạng thái Đã phát hành hoặc Thu hồi (ẩn ở các trạng thái khác);  (3) Yêu cầu báo giá chưa có Báo giá khách hàng;  (4) người dùng có quyền “Lấy tự động BGNB”.  Hệ thống kiểm tra lại điều kiện (3) tại thời điểm xác nhận. Chức năng là ngoại lệ của BR3, BR8 và BR-40: chỉ cập nhật giá, không đổi trạng thái báo giá. |
| BR-55 | Quy tắc cập nhật khi Đồng bộ giá định mức — áp dụng cho toàn bộ dòng giá của toàn bộ bảng giá (kể cả bảng đang bị disable); không sinh thêm, không xóa bảng giá, giữ nguyên danh sách đầu mục của từng bảng:  (a) Đầu mục đã gắn dòng Giá bán định mức còn tồn tại và có Giá bán định mức → lấy lại Giá mua định mức, Giá bán định mức theo ID đã gắn; Đơn giá \= Giá bán định mức mới; tính lại % Lợi nhuận.  (b) Dòng đã gắn không còn tồn tại hoặc Giá bán định mức \= null → dò dòng khác theo bộ thuộc tính, rule tương tự Tạo tự động báo giá nội bộ;  Nếu có → gắn dòng mới;  Nếu không có → dòng giá chuyển cấp 1 và bảng giá chứa dòng đó bị disable (BR-41, BR-42).  (c) Đầu mục chưa gắn dòng → gắn theo BR-38, BR-39; không có → giữ cấp 1\.  Sau khi cập nhật, tính lại quy tắc thiếu giá cấp 1–3 (bảng đang disable mà đủ giá được mở lại thành khả dụng), Tổng đơn giá bảng giá, Tổng đơn giá dịch vụ và Lợi nhuận dự kiến.  Nếu không còn bảng giá khả dụng nào → không áp dụng kết quả, giữ nguyên dữ liệu hiện tại và báo lỗi.  Xử lý đồng bộ trong 1 transaction (lỗi → rollback, theo BR-47); giá được snapshot lại tại thời điểm bấm; không đổi trạng thái, Nguồn tạo, Người phát hành, Thời điểm phát hành, Thời hạn hiệu lực; thao tác thành công được ghi Lịch sử hoạt động. (d) Dòng giá đang "Hết hạn" được xử lý như (a)/(b); sau khi nhận giá hiện hành, dòng giá chuyển "Đang hiệu lực" (BR-59).(d) Dòng giá đang "Hết hạn" được xử lý như (a)/(b); sau khi nhận giá hiện hành, dòng giá chuyển "Đang hiệu lực" (BR-59). |

### **3.2.4. Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Dịch vụ được tick tại Yêu cầu báo giá thiếu giá trị thuộc tính nguồn | Lỗi | “Yêu cầu báo giá chưa đủ thông tin để tạo tự động báo giá nội bộ: {Loại dịch vụ – Tên trường}, …” | Chặn tạo báo giá tự động Không sinh bản ghi báo giá nội bộ Yêu cầu báo giá giữ nguyên trạng thái (BR-32) |
| Một trong các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động không có dữ liệu | Lỗi | “Không đủ thông tin để tạo tự động báo giá nội bộ” | Dừng luồng tạo báo giá tự động Không sinh bản ghi báo giá nội bộ Yêu cầu báo giá giữ nguyên trạng thái (BR-52) |
| Tạo báo giá tự động thành công | Thành công | “Đã tạo tự động báo giá nội bộ {Mã báo giá}” | Báo giá ở trạng thái “Đã phát hành” Yêu cầu báo giá chuyển “Đã có báo giá” (SRS Quản lý YCBG \+ Báo giá KH) Gửi thông báo cho người bấm “Lấy tự động BGNB” (BR-47) Ghi Lịch sử hoạt động (BR-53) |
| Tổng số tổ hợp bảng giá từ 51 đến 200 | Thông tin | “Đang tạo báo giá tự động, hệ thống sẽ thông báo khi hoàn tất” | Chuyển sang xử lý nền Dữ liệu đầu vào chốt tại thời điểm bấm nút; không khóa thao tác trên Yêu cầu báo giá (BR-46) |
| Tổng số tổ hợp bảng giá vượt 200 | Lỗi | “Yêu cầu báo giá có phạm vi quá lớn ({n} tổ hợp). Vui lòng gửi sang Pricing để tạo báo giá thủ công” | Chặn tạo báo giá Yêu cầu báo giá giữ nguyên trạng thái |
| Không còn bảng giá khả dụng nào | Lỗi | “Không đủ dữ liệu giá bán định mức để tạo báo giá tự động. Vui lòng gửi yêu cầu sang Pricing” | Chặn tạo báo giá Không sinh bản ghi báo giá nội bộ Yêu cầu báo giá giữ nguyên trạng thái (BR-44) |
| Job tạo báo giá lỗi giữa chừng | Lỗi | “Tạo báo giá tự động thất bại. Vui lòng thử lại hoặc gửi yêu cầu sang Pricing” | Rollback toàn bộ Không lưu báo giá dở dang Ghi log và gửi thông báo cho người bấm “Lấy tự động BGNB” (BR-47) |
| Job xử lý nền hoàn tất khi Yêu cầu báo giá đã thay đổi trạng thái | Lỗi | “Tạo báo giá tự động không thành công do Yêu cầu báo giá {Mã RFQ} đã thay đổi trạng thái” | Hủy kết quả, không tạo báo giá nội bộ Gửi thông báo cho người bấm “Lấy tự động BGNB” (BR-46) |
| Dòng giá không khớp được Giá bán định mức, hoặc dòng khớp có giá bán \= null | Cảnh báo | “Chưa có giá định mức” | Badge xám tại dòng giá Các ô giá để trống Dòng không tham gia tổng hợp Disable toàn bộ bảng giá chứa dòng đó |
| Bảng giá có ≥ 1 dòng thiếu giá, hoặc bảng giá không có dòng giá nào | Cảnh báo | “Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức” | Disable toàn bộ bảng giá Tổng đơn giá của bảng \= null Không hiển thị tại màn Chỉnh sửa báo giá; giữ nguyên khi Lưu chỉnh sửa Không được lấy khi tạo Báo giá khách hàng |
| Toàn bộ bảng giá của một loại dịch vụ bị disable | Cảnh báo | “Doanh nghiệp không cung ứng dịch vụ này” | Hiển thị banner tại tab loại dịch vụ Không chặn các thao tác khác |
| Phát hành báo giá khi chưa có dòng giá hợp lệ nào | Lỗi | “Báo giá phải có tối thiểu 1 dòng giá trước khi phát hành” | Chặn phát hành (BR14) |
| Thu hồi báo giá tự động khi K1 đã tạo Báo giá khách hàng | Lỗi | “Không thể thu hồi báo giá ở trạng thái này” | Chặn thao tác thu hồi Ẩn hoặc disable nút Thu hồi |
| Bấm “Đồng bộ giá định mức” | Cảnh báo (xác nhận) | “Hệ thống sẽ cập nhật lại giá theo Giá bán định mức hiện hành. Tiếp tục?” | Xác nhận → thực hiện cập nhật (BR-55) Hủy → không thay đổi dữ liệu |
| Đồng bộ giá định mức thành công | Thành công | “Đã cập nhật giá bán định mức mới nhất cho báo giá {Mã báo giá}” | Cập nhật giá, tính lại quy tắc thiếu giá và các chỉ tiêu tổng hợp Ghi Lịch sử hoạt động |
| Sau khi lấy giá mới nhất không còn bảng giá khả dụng nào | Lỗi | “Không có bảng giá khả dụng sau khi lấy giá mới nhất, giữ nguyên báo giá hiện tại” | Không áp dụng kết quả; giữ nguyên dữ liệu báo giá (BR-55) |
| Xác nhận Đồng bộ giá định mức khi Yêu cầu báo giá đã có Báo giá khách hàng | Lỗi | “Không thể Đồng bộ giá định mức do đã có Báo giá khách hàng” (Đề xuất — chờ xác nhận nội dung) | Chặn thao tác; ẩn nút (BR-54) |
| Đồng bộ giá định mức lỗi giữa chừng | Lỗi | “Đồng bộ giá định mức thất bại. Vui lòng thử lại” (Đề xuất — chờ xác nhận nội dung) | Rollback toàn bộ; giữ nguyên dữ liệu báo giá (BR-47, BR-55) |

### **3.2.5. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Yêu cầu báo giá (RFQ) | Cung cấp dịch vụ yêu cầu và giá trị thuộc tính làm đầu vào cho phép mix | Yêu cầu báo giá → Auto-BGNB Engine | Khi K1 bấm “Lấy tự động BGNB” (US\_ABG\_01 — SRS Quản lý YCBG \+ Báo giá KH) | Thiếu thuộc tính nguồn → chặn tạo, báo lỗi (BR-32) Dữ liệu chốt tại thời điểm bấm nút; Yêu cầu báo giá đổi trạng thái trong khi xử lý nền → hủy kết quả (BR-46) |
| Cấu hình đầu mục giá | Cung cấp danh sách đầu mục giá và Loại kho gắn với đầu mục (phân hệ Kho bãi) | Cấu hình đầu mục giá → Auto-BGNB Engine | Khi nạp đầu mục cho từng bảng giá | Đầu mục tắt kích hoạt hoặc Loại giá “Phát sinh” → không nạp Không có đầu mục phù hợp → bảng giá không có dòng giá → disable (BR-42) |
| Giá bán định mức | Cung cấp dòng giá để khớp: Mã giá bán định mức, Đơn vị tính, Giá bán định mức | Giá bán định mức → dòng giá trong bảng giá | Khi khớp dòng giá cho từng đầu mục | Không có dòng khớp hoặc giá bán \= null → quy tắc cấp 1 và disable bảng giá (BR-41, BR-42) |
| Giá mua định mức | Cung cấp Giá mua định mức làm căn cứ tính % Lợi nhuận | Giá mua định mức → dòng giá (snapshot) | Khi điền dữ liệu dòng giá | Giá mua định mức \= null kéo theo giá bán \= null → quy tắc cấp 1 |
| Quản lý danh mục | Cung cấp danh mục địa điểm vận tải để đối chiếu cặp Điểm đi – Điểm đến | Quản lý danh mục → Auto-BGNB Engine | Khi sinh bảng giá dịch vụ Vận tải | Cặp điểm ngoài phạm vi danh mục → không khớp dòng giá → quy tắc cấp 2 |
| Hệ thống thông báo (chuông \+ email) | Thông báo kết quả tạo báo giá tự động | Auto-BGNB Engine → người bấm “Lấy tự động BGNB” | Khi tạo báo giá thành công hoặc thất bại | Gửi thông báo thất bại → ghi log, không ảnh hưởng kết quả tạo báo giá |
| Báo giá khách hàng | Nhận báo giá nội bộ tự động làm nguồn tạo báo giá gửi khách hàng | Báo giá nội bộ → Báo giá khách hàng | Khi K1 bấm “Tạo báo giá khách hàng” (SRS Quản lý YCBG \+ Báo giá KH) | Bảng giá bị disable không được lấy sang Báo giá khách hàng (BR-42) |
| Giá bán định mức / Giá mua định mức (Lấy giá mới nhất) | Cung cấp giá hiện hành theo ID dòng Giá bán định mức đã gắn, hoặc dòng thay thế theo BR-38, BR-39 | Giá bán định mức → dòng giá của báo giá tự động (snapshot lại) | Khi bấm “Đồng bộ giá định mức” (US\_ABG\_08) | Dòng không tồn tại / giá \= null và không có dòng thay thế → cấp 1, disable bảng giá; không còn bảng khả dụng → giữ nguyên báo giá (BR-55) |

# **4\. Đánh giá độ phủ rule (Case còn thiếu)**

Các điểm dưới đây là những case còn để (Giả định), còn ghi Updating hoặc còn mâu thuẫn giữa các nguồn; cần rà soát/xác nhận trước khi phát triển.

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| :---- | :---- | :---- | :---- |
| Luồng phê duyệt báo giá | Đã chốt đầy đủ 7 trạng thái trong vòng đời, bao gồm Từ chối (BR2) | Chưa đặc tả: ai trình duyệt, ai phê duyệt, điều kiện chuyển trạng thái, và điều kiện/luồng để báo giá chuyển sang Từ chối | Bổ sung user story và quy tắc cho luồng trình duyệt – phê duyệt – từ chối |
| Hết hiệu lực áp dụng cho mọi trạng thái | Đã chốt: quá Thời hạn hiệu lực tự chuyển Hết hiệu lực bất kể trạng thái (BR2), bao gồm cả trạng thái Thu hồi mới bổ sung (không có ngoại lệ) | Chưa rõ xử lý với báo giá đã có Kết quả Thành công: có tiếp tục chuyển Hết hiệu lực không, và báo giá Nháp quá hạn có còn chỉnh sửa được không | Chốt ngoại lệ áp dụng quy tắc Hết hiệu lực và hành vi với báo giá Nháp quá hạn |
| Đồng bộ Kết quả báo giá | Đã chốt cơ chế tự động ghi nhận từ Báo giá khách hàng (BR20), đã làm rõ: ghi nhận không phụ thuộc trạng thái báo giá nội bộ | Chưa rõ: xử lý khi Báo giá khách hàng bị hủy hoặc đổi kết quả sau khi đã ghi nhận; trường hợp một báo giá nội bộ có nhiều Báo giá khách hàng | Bổ sung quy tắc cập nhật lại/hoàn tác Kết quả báo giá và quan hệ số lượng giữa hai loại báo giá |
| Giải phóng Yêu cầu báo giá khi xóa báo giá | Đang để (Giả định) tại US\_QUO\_10 AC3 | Chưa chốt: RFQ có được chọn lại sau khi báo giá gắn với nó bị xóa hay không | Xác nhận quy tắc giải phóng RFQ khi báo giá bị xóa |
| Bắt buộc chọn dòng giá cho đầu mục | Đang để (Giả định) tối thiểu một dòng giá (US\_QUO\_04 AC8) | Chưa rõ: bắt buộc chọn cho toàn bộ đầu mục hay chỉ tối thiểu một; xử lý khi không có dòng giá phù hợp; có cho bỏ chọn/đổi dòng giá đã chọn không | Chốt quy tắc bắt buộc chọn dòng giá và hành vi khi danh sách lọc rỗng |
| Đổi Yêu cầu báo giá khi chỉnh sửa | Cho phép đổi RFQ ở màn Chỉnh sửa (US\_QUO\_03 AC4 – Giả định) | Chưa rõ ảnh hưởng tới các bảng giá đã tạo theo RFQ cũ (giữ nguyên, cảnh báo, hay xóa để dựng lại) | Chốt hành vi khi đổi RFQ trên báo giá đã có bảng giá |
| Phạm vi ghi nhận Lịch sử hoạt động | Đã xác định 4 cột hiển thị và nguyên tắc ghi nhận (BR17) | Chưa chốt danh mục Hành động; mức chi tiết của cột Nội dung; quy tắc sắp xếp và phân trang | Bổ sung danh mục Hành động chuẩn và mẫu nội dung ghi nhận cho từng loại thao tác |
| Quy tắc sinh ID bảng giá và ID dòng giá | Đã chốt do hệ thống tự sinh (BR12, BR19) | Chưa có cấu trúc/định dạng cụ thể của ID bảng giá và ID dòng giá | Bổ sung quy tắc sinh ID cho bảng giá dịch vụ và dòng giá |
| Bộ thuộc tính theo loại dịch vụ | Đã xác định là điều kiện lọc dòng giá và bắt buộc nhập đầy đủ | Chưa định nghĩa danh sách thuộc tính cụ thể cho từng loại trong 5 loại dịch vụ | Bổ sung bảng ánh xạ Loại dịch vụ ↔ danh sách thuộc tính |
| Công thức Tỷ lệ chốt (Won) | Updating — chưa chốt (BR15) | Chưa xác định tử số/mẫu số và phạm vi thống kê (theo kỳ, theo khách hàng…) | Chốt định nghĩa Tỷ lệ chốt trước khi phát triển chỉ số |
| Thuế suất VAT | Không còn trường nhập VAT trong màn báo giá | Chỉ tiêu ghi “chưa bao gồm VAT” nhưng không có nơi khai báo VAT → chưa rõ cách tính giá đã bao gồm VAT | Xác nhận: VAT được quản lý ở module khác, hay cần bổ sung lại trường VAT |
| Lợi nhuận âm | Chưa có chính sách | Chưa quy định xử lý khi Đơn giá nhỏ hơn Giá mua định mức | Chốt: chặn cứng hay chỉ cảnh báo khi lợi nhuận âm |
| Luồng phê duyệt ngoại lệ | Ngoài phạm vi (BR16) | Ngưỡng kích hoạt “Chờ duyệt ngoại lệ” và vai trò phê duyệt chưa định nghĩa | Đặc tả luồng phê duyệt ngoại lệ ở phiên bản sau |

                                                                                                                                                                                                                                        

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Ràng buộc dữ liệu trong bảng giá dịch vụ: Bộ thuộc tính với dòng giá bán ĐM thuộc đầu mục giá \=\> Khi cập nhật 1 trong các trường thuộc bộ thuộc tính thì clear toàn bộ dòng giá đã gắn với đầu mục giá trong bảng | Cập nhật bộ thuộc tính không thay đổi dòng giá bán định mức đã gắn với đầu mục. | 14/10/2026 | BA đề xuất. Các dòng giá bán định mức đang gắn vào bộ thuộc tính không tương thích gây mâu thuẫn thông tin và sai lệch trong hệ thống. |
| 2 | Ràng buộc chọn Điểm đi, Điểm đến theo phạm vi của Yêu cầu báo giá  khớp Quốc gia, Tỉnh/Thành phố, Phường/xã với Quốc gia Việt Nam khớp Quốc gia, Tỉnh/Thành phố, Địa cấp thị, Quận/huyện Phường/xã với Quốc gia Trung Quốc | Tự do chọn Điểm đi, Điểm đến khi thêm bảng giá dịch vụ | 14/10/2026 | BA đề xuất |
| 3 | Ràng buộc dữ liệu trong bảng giá dịch vụ: RFQ đã gắn với bảng giá dịch vụ \=\> Thay đổi RFQ, hệ thống hiển thị cảnh báo và clear toàn bộ bảng giá dịch vụ đã tạo. | Cập nhật RFQ \=\> Không ảnh hưởng đến bảng giá dịch vụ đã tạo,  | 14/10/2026 | BA đề xuất. Bảng giá dịch vụ có thể nằm ngoài phạm vi của yêu cầu báo giá. Gây mâu thuẫn thông tin và sai lệch trong hệ thống. |
| 4 | Báo giá nội bộ tự động \- Bổ sung chức năng Đồng bộ giá định mức (Chỉ sử dụng khi chưa có BGKH)  \- Khi Chuyên viên định giá (K2) Lưu chỉnh sửa báo giá tự động sau khi Thu hồi: Nguồn tạo chuyển ngay từ “Tự động” sang “Thủ công”; | Chưa có chức năng Lấy lại báo giá định mức mới nhất Người dùng cập nhật báo giá tự động chưa chuyển nguồn từ “Tự động” sang “Thủ công” | 14/10/2026 | BA đề xuất |
| 5 | Thêm bảng giá dịch vụ Kho bãi: Lấy danh sách đầu mục giá theo Loại kho: Chọn Loại kho, lấy danh sách đầu mục giá (CH đầu mục giá) có gắn với loại kho đã chọn | Mặc định lấy tất cả đầu mục giá đã cấu hình cho dv Kho bãi | 17/10/2026 | BA đề xuất |
| 6 | Bổ sung trạng thái của dòng giá: Hết hạn, Đang hiệu lực Dòng giá đang hiệu lực: Dòng giá khi được gắn giá bán định mức mặc định ở trạng thái Đang hiệu lực Dòng giá hết hạn: Có ít nhất 1 dòng giá hết hạn trong báo giá \=\> Chặn phát hành báo giá Bảng giá tự động disable khi chứa ít nhất 1 dòng giá hết hạn Bảng giá disable không hiển thị trong màn Chỉnh sửa báo giá | Dòng giá chưa có trạng thái | 19/10/2026 | BA đề xuất |
| 7 | Tự động chuyển trạng thái dòng giá khi cập nhật Giá bán định mức (Cập nhật đơn giá hoặc xóa dòng giá bán định mức do không còn giá mua định mức tham chiếu đến):  Báo giá có gắn ID giá bán định mức tự động chuyển trạng thái “Hết hạn” và hiển thị tag “Hết hạn” trong bảng giá. Bảng giá chứa dòng giá đó chuyển trạng thái disable. Phạm vi áp dụng: Chỉ áp dụng với các dòng giá Đang hiệu lực & Bảng giá Tạo mới, Thu hồi, Đã phát hành \+ Chưa tạo báo giá khách hàng | Chưa có luồng xử lý khi cập nhật Giá bán định mức, các báo giá vẫn sử dụng giá cũ đã lỗi thời. | 19/10/2026 | BA đề xuất |

                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification \- SRS)*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu “Quản lý báo giá” (báo giá nội bộ Pricing → Sales) |
| :---- | :---- |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | Trang BA |
| **Ngày tạo** | \[dd/MM/yyyy\] |
| **Ngày cập nhật** | 14/10/2026 |
| **Phiên bản** | v2.0 – Gộp chức năng Tự động tạo Báo giá nội bộ (Auto-BGNB) |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Menu “Quản lý báo giá” cho phép Chuyên viên định giá (Pricing Analyst) khởi tạo và quản lý các báo giá nội bộ gửi cho bộ phận Kinh doanh (Sales), dựa trên Yêu cầu báo giá (RFQ) do Sales tạo.

Trên mỗi báo giá, người dùng xây dựng cấu trúc bảng giá chi tiết theo từng loại dịch vụ (Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát, Sang tải); mỗi dịch vụ gồm nhiều dòng giá (Cố định, Phụ phí) với Giá mua định mức, Giá bán định mức, Đơn giá báo giá, % Lợi nhuận. Hệ thống tự động tổng hợp giá trị tài chính và theo dõi vòng đời phát hành của báo giá.

Bên cạnh luồng tạo thủ công, menu hỗ trợ chức năng Tự động tạo Báo giá nội bộ (Auto-BGNB): hệ thống tự sinh và phát hành một báo giá nội bộ hoàn chỉnh từ dữ liệu của Yêu cầu báo giá — mix các giá trị thuộc tính đã nhập tại Yêu cầu báo giá thành các bảng giá dịch vụ, tự khớp dòng giá từ Giá bán định mức và tính sẵn các chỉ tiêu tài chính (chi tiết tại mục 3.2).

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Xem danh sách báo giá kèm bộ chỉ số tổng quan (Tổng số báo giá, Đã phát hành, Tỷ lệ chốt giá); tìm kiếm, lọc, xuất dữ liệu (Export).

* Khởi tạo báo giá với mã do hệ thống tự sinh; chọn Yêu cầu báo giá (RFQ) làm nguồn tự động điền thông tin khách hàng và thông tin dịch vụ → Xây dựng danh sách bảng giá theo loại dịch vụ: Chọn loại dịch vụ → chọn giá trị của thuộc tính → chọn dòng giá cho từng đầu mục giá; nhập Đơn giá; hệ thống tự tính % Lợi nhuận, Tổng đơn giá và Lợi nhuận dự kiến.

* Chỉnh sửa danh sách bảng giá dịch vụ: thêm mới/xóa bảng giá dịch vụ, cập nhật Đơn giá ngay trong danh sách bảng giá.

* Chỉnh sửa báo giá chỉ áp dụng cho báo giá ở trạng thái Nháp hoặc Thu hồi

* Quản lý vòng đời trạng thái phát hành: Nháp, Chờ phê duyệt, Đã phê duyệt,Từ chối, Đã phát hành, Thu hồi, Hết hiệu lực; 

* Ghi nhận Kết quả báo giá (Thành công/Thất bại) tự động từ Báo giá khách hàng.

* Xem chi tiết báo giá (thông tin chung, thông tin dịch vụ, danh sách bảng giá, tổng hợp bảng giá) và Bảng lịch sử hoạt động của Báo giá.

* Phát hành báo giá cho các báo giá ở trạng thái Nháp, Đã phê duyệt, Thu hồi → Người dùng xác nhận  → Phát hành báo giá thành công, Báo giá chuyển trạng thái “Đã phát hành”. Sau khi Phát hành báo giá, Báo giá được hiển thị trong màn chi tiết của Yêu cầu báo giá (RFQ)

* Thu hồi báo giá đã phát hành khi Sale chưa tạo Báo giá khách hàng từ Yêu cầu báo giá đã đính kèm (thao tác tại màn Chi tiết báo giá, có nhập Lý do thu hồi); báo giá chuyển trạng thái Thu hồi, ẩn khỏi màn Yêu cầu báo giá.

* Phân quyền theo chức năng: Xem / Sửa / Phát hành / Xóa; action chỉ hiển thị và thao tác được khi người dùng có quyền tương ứng.

* Luồng phê duyệt ngoại lệ và các trạng thái Chờ duyệt / Đã duyệt / Từ chối / Đã gửi báo giá (Sent Sales): CHƯA triển khai trong giai đoạn này. Thẻ chỉ số “Chờ duyệt ngoại lệ” và các nút chuyển trạng thái Exceptions / Sent Sales trên giao diện tạm thời không có luồng nghiệp vụ đứng sau.

* Chi tiết validate của Export/Import — chỉ mô tả nút (Đang cập nhật).

* Tự động tạo Báo giá nội bộ (Auto-BGNB) từ dữ liệu Yêu cầu báo giá; báo giá được phát hành ở trạng thái “Đã phát hành” — chi tiết tại mục 3.2.

* Engine Auto-BGNB: kiểm tra thuộc tính nguồn; sinh bảng giá dịch vụ theo tổ hợp (mix) các giá trị thuộc tính cho 5 loại dịch vụ; tự động khớp dòng giá từ Giá bán định mức; tự động tính Đơn giá, % Lợi nhuận, Tổng đơn giá bảng giá, Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%).

* Quy tắc xử lý thiếu Giá bán định mức theo 4 cấp (dòng giá / bảng giá / loại dịch vụ / báo giá); ngưỡng kiểm soát số lượng tổ hợp và cơ chế xử lý nền.

**Ngoài phạm vi (Out-of-scope):**

* Tạo/sửa/quản lý RFQ (Yêu cầu báo giá) — thuộc phạm vi bộ phận Sales, ngoài tài liệu này; báo giá chỉ liên kết ID RFQ đã tồn tại.

* Luồng phê duyệt ngoại lệ và các trạng thái Chờ duyệt / Đã duyệt / Từ chối / Đã gửi báo giá (Sent Sales): CHƯA triển khai trong giai đoạn này. Thẻ chỉ số “Chờ duyệt ngoại lệ” và các nút chuyển trạng thái Exceptions / Sent Sales trên giao diện tạm thời không có luồng nghiệp vụ đứng sau.

* Quản lý Báo giá khách hàng (bản báo giá chính thức gửi khách hàng) — báo giá nội bộ chỉ nhận kết quả Thành công/Thất bại từ nguồn này; luồng và cơ chế đồng bộ cần làm rõ thêm.

* Kiểm tra ràng buộc ngưỡng lợi nhuận theo menu “Chính sách biên lợi nhuận” — độc lập, chưa liên kết ràng buộc.

* Tạo hợp đồng dịch vụ khách hàng khi báo giá “Thành công” (downstream) — module không trong phạm vi 6 menu hiện tại.

* Quy đổi đa tiền tệ (mặc định VNĐ; các bảng giá dùng chung tiền tệ của báo giá).

* Xem chi tiết Lịch sử chỉnh sửa của báo giá \- View chi tiết toàn bộ bản ghi trước thay đổi và sau thay đổi được đánh giá là không quá cần thiết trong quá trình vận hành và không cho vào phạm vi triển khai dự án.

* Phần thao tác của chức năng Auto-BGNB trên màn Chi tiết Yêu cầu báo giá (nút “Lấy tự động BGNB”, chuyển trạng thái Yêu cầu báo giá, hiển thị khối Báo giá nội bộ, tạo Báo giá khách hàng từ báo giá tự động) — đặc tả tại SRS Quản lý YCBG \+ Báo giá KH.

* Ghi nhận các lần chạy tạo báo giá tự động thất bại vào Lịch sử hoạt động — không triển khai.

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

[https\://drive.google.com/file/d/1au6UDousRrn\_UgjHlglnhdxQ26z6qh\_2/view?usp=sharing](https://drive.google.com/file/d/1au6UDousRrn_UgjHlglnhdxQ26z6qh_2/view?usp=sharing) 

**Mô tả luồng chính:**

* Bộ phận Sales tạo Yêu cầu báo giá — RFQ (ngoài phạm vi). Chuyên viên định giá khởi tạo báo giá, chọn RFQ chưa gắn báo giá để hệ thống tự động điền thông tin khách hàng và thông tin dịch vụ → Xây dựng danh sách bảng giá theo từng loại dịch vụ: Chọn loại dịch vụ → nhập thuộc tính theo loại dịch vụ, chọn dòng giá cho từng đầu mục giá từ bảng Giá bán định mức, nhập Đơn giá; hệ thống tự tính % Lợi nhuận từng đầu mục, Tổng đơn giá từng bảng giá và Tổng đơn giá dịch vụ của báo giá, % Lợi nhuận dự kiến của báo giá. → Nhấn Lưu, báo giá ở trạng thái Nháp.

* Phát hành báo giá cho Sales (Nháp → Đã phát hành); hệ thống ghi Người phát hành, Thời điểm phát hành và hiển thị báo giá nội bộ trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm.

* Trước khi Sale tạo Báo giá khách hàng, Chuyên viên định giá có thể Thu hồi báo giá Đã phát hành (nhập Lý do thu hồi tại màn Chi tiết báo giá); báo giá chuyển trạng thái Thu hồi, ẩn khỏi màn Chi tiết Yêu cầu báo giá, và vẫn được Phát hành lại hoặc Chỉnh sửa.

* Sales tạo Báo giá khách hàng từ báo giá nội bộ và cập nhật kết quả Thành công/Thất bại; hệ thống tự động ghi nhận Kết quả báo giá cho báo giá nội bộ tham chiếu theo trạng thái Báo giá khách hàng tương ứng. Chỉ số Tỷ lệ chốt (Won) cập nhật theo kết quả.

* Báo giá quá Thời hạn hiệu lực tự động chuyển sang trạng thái Hết hiệu lực, bất kể đang ở trạng thái nào.

* Toàn bộ thao tác trên báo giá được ghi nhận vào Lịch sử hoạt động.

* Tự động tạo Báo giá nội bộ (Auto-BGNB): Dịch vụ khách hàng (K1) bấm “Lấy tự động BGNB” trên màn Chi tiết Yêu cầu báo giá (Nháp / Chờ báo giá) → hệ thống kiểm tra dữ liệu đầu vào → mix tổ hợp thuộc tính theo từng dịch vụ được yêu cầu → nạp đầu mục giá → khớp dòng Giá bán định mức → áp dụng quy tắc thiếu giá 4 cấp → nếu còn ≥ 1 bảng giá khả dụng: tạo và phát hành báo giá nội bộ, Yêu cầu báo giá chuyển “Đã có báo giá”; nếu không: chặn và báo lỗi, Yêu cầu báo giá giữ nguyên trạng thái. Chi tiết tại mục 3.2.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tiếp nhận Yêu cầu báo giá | Bộ phận Sales (ngoài phạm vi) | Sales tạo Yêu cầu báo giá (RFQ) từ nhu cầu khách hàng | Nhu cầu khách hàng | RFQ tồn tại (mã RFQ) | Mỗi RFQ chỉ được gắn duy nhất 1 báo giá |
| Khởi tạo báo giá (Thêm mới báo giá) | Chuyên viên định giá | Nhập Tên báo giá, chọn RFQ; Hệ thống tự điền thông tin khách hàng, thông tin dịch vụ | RFQ chưa gắn báo giá | \- | Bắt buộc: Tên báo giá (không trùng), Mã yêu cầu báo giá |
| Xây dựng bảng giá & dòng giá (Thêm mới báo giá) | Chuyên viên định giá | Thêm bảng giá theo loại dịch vụ; nhập thuộc tính; chọn dòng giá cho từng đầu mục giá; nhập Đơn giá | Đầu mục giá (Loại giá: Cố định, Phụ phí), Giá mua/bán định mức  | Bảng giá mới kèm ID tự sinh \+ chỉ tiêu tổng hợp | 1 đầu mục giá – 1 dòng giá; thuộc tính bắt buộc nhập đầy đủ |
| Hoàn tất thêm mới báo giá (Thêm mới báo giá) | Chuyên viên định giá | Nhấn Lưu báo giá. Hệ thống tự sinh Mã báo giá | Form Thêm mới Báo giá đầy đủ thông tin | Báo giá trạng thái Nháp | Điền đầy đủ các trường thông tin bắt buộc |
| Phát hành báo giá | Chuyên viên định giá | Kiểm tra hợp lệ và phát hành cho Sales | Báo giá Nháp / Thu hồi hợp lệ | Báo giá Đã phát hành \+ Người phát hành \+ Thời điểm phát hành Báo giá đã phát hành hiển thị trên Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm | Có ≥ 1 dòng giá và chỉ áp dụng báo giá ở trạng thái “Nháp” hoặc “Thu hồi” |
| Thu hồi báo giá | Chuyên viên định giá | Thu hồi báo giá Đã phát hành tại màn Chi tiết báo giá khi Sale chưa tạo Báo giá khách hàng; nhập Lý do thu hồi và xác nhận | Báo giá Đã phát hành, Sale chưa tạo Báo giá khách hàng (Updating — cơ chế xác định) | Báo giá Thu hồi, ẩn khỏi màn Chi tiết Yêu cầu báo giá, ghi Lịch sử hoạt động | Chỉ áp dụng báo giá Đã phát hành; Lý do thu hồi bắt buộc nhập; dùng chung phân quyền với chức năng Phát hành |
| Cập nhật kết quả báo giá khách hàng | Bộ phận Sales (ngoài phạm vi) | Sale ghi nhận kết quả báo giá ngay trên Báo giá khách hàng.  | Phản hồi từ khách hàng qua Sales | RFQ Thành công / Thất bại | Áp dụng theo trạng thái của Báo giá khách hàng tương ứng, không phụ thuộc trạng thái hiện tại của báo giá nội bộ |
| Ghi nhận kết quả báo giá nội bộ | Hệ thống | Hệ thống ghi nhận lại kết quả thành công/thất bại vào Báo giá nội bộ. | Trạng thái Báo giá khách hàng | Báo giá Thành công / Thất bại | Chỉ áp dụng với Báo giá khách hàng đã có trạng thái Thành công / Thất bại |
| Hết hiệu lực | Hệ thống | Tự động chuyển Hết hiệu lực khi Thời hạn hiệu lực | Báo giá Đã phát hành quá Thời hạn hiệu lực | Báo giá Hết hiệu lực | Áp dụng bất kể báo giá đang ở trạng thái nào |
| **Luồng Tự động tạo Báo giá nội bộ (Auto-BGNB)** |  |  |  |  |  |
| Lấy tự động BGNB | Dịch vụ khách hàng (K1) | Bấm “Lấy tự động BGNB” trên màn Chi tiết Yêu cầu báo giá (thao tác đặc tả tại SRS Quản lý YCBG \+ Báo giá KH) | Yêu cầu báo giá ở Nháp / Chờ báo giá | Yêu cầu sinh báo giá; dữ liệu đầu vào chốt tại thời điểm bấm nút | BR-46 |
| Kiểm tra dữ liệu đầu vào | Hệ thống | Kiểm tra thuộc tính nguồn của từng dịch vụ được tick và các trường thông tin báo giá cần cho việc tạo tự động Thiếu dữ liệu → dừng luồng và báo lỗi | Dữ liệu Yêu cầu báo giá | Kết quả hợp lệ / thông báo lỗi | BR-32, BR-52 |
| Sinh tổ hợp thuộc tính (mix) | Hệ thống | Tích Descartes giá trị thuộc tính theo từng loại dịch vụ Khử trùng giá trị và tổ hợp | Thuộc tính tại Yêu cầu báo giá | Danh sách tổ hợp \= danh sách bảng giá | BR-34, BR-35, BR-36 |
| Kiểm tra ngưỡng tổ hợp | Hệ thống | Đối chiếu số tổ hợp với ngưỡng 50 / 200 | Số tổ hợp | Chạy đồng bộ / chạy nền / chặn | BR-46 |
| Nạp đầu mục giá | Hệ thống | Lấy đầu mục Cố định & Phụ phí đang kích hoạt Kho bãi: lọc thêm theo Loại kho | Cấu hình đầu mục giá | Danh sách dòng giá trống | BR-37 |
| Khớp & chọn dòng giá | Hệ thống | Khớp Giá bán định mức theo đầu mục \+ bộ thuộc tính Áp dụng tie-break 3 tầng | Giá bán định mức, Giá mua định mức | Dòng giá đã điền giá (snapshot) | BR-38, BR-39, BR-40 |
| Áp dụng quy tắc thiếu giá | Hệ thống | Badge cấp 1 tại dòng giá Disable bảng giá cấp 2 Banner loại dịch vụ cấp 3 | Kết quả khớp dòng giá | Trạng thái từng bảng giá | BR-41, BR-42, BR-43 |
| Kiểm tra điều kiện tạo | Hệ thống | Đếm số bảng giá khả dụng của toàn báo giá | Danh sách bảng giá | Cho tạo / chặn tạo | BR-44 |
| Tạo & phát hành báo giá | Hệ thống | Sinh Mã báo giá Tính các chỉ tiêu tổng hợp Đặt trạng thái “Đã phát hành” | Bảng giá khả dụng | Báo giá nội bộ “Đã phát hành” | BR-45, BR-47 |
| Cập nhật Yêu cầu báo giá | Hệ thống | Chuyển Yêu cầu báo giá sang “Đã có báo giá” (đặc tả tại SRS Quản lý YCBG \+ Báo giá KH) | Báo giá đã phát hành | Yêu cầu báo giá “Đã có báo giá” | SRS Quản lý YCBG \+ Báo giá KH |
| Rà soát & điều chỉnh | Chuyên viên định giá (K2) | Thu hồi báo giá tự động Chỉnh sửa thủ công và phát hành lại | Báo giá “Đã phát hành” | Báo giá đã cập nhật | BR-45, BR-49 (theo US\_QUO\_11, US\_QUO\_03) |

# **3\. Đặc tả Tính năng**

## **3.1. MODULE: Quản lý báo giá**

### **3.1.1. Danh sách User story**

**Ghi chú độ ưu tiên (MoSCoW):** Must have – không thể thiếu để sản phẩm hoạt động; Should have – rất quan trọng, có thể workaround/trì hoãn; Could have – cải thiện trải nghiệm, làm khi dư nguồn lực.

#### **User story 1: Xem danh sách báo giá và chỉ số tổng quan**

| ID US | US\_QUO\_01 |
| :---- | :---- |
| **Tên Story** | Xem danh sách báo giá và chỉ số tổng quan |
| **User story** | Là Chuyên viên định giá, tôi muốn xem danh sách báo giá kèm các chỉ số tổng quan cùng bộ tìm kiếm/lọc, để nắm nhanh tình trạng toàn bộ báo giá và truy cập nhanh vào từng báo giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn danh sách hiển thị 4 thẻ chỉ số:  Tổng báo giá,  Chờ duyệt ngoại lệ,  Đã phát hành,  Tỷ lệ chốt.  Thẻ “Chờ duyệt ngoại lệ” hiển thị 0 (hoặc được ẩn) do luồng phê duyệt ngoài phạm vi (xem BR16). | Sai số liệu thẻ; hoặc thẻ “Chờ duyệt ngoại lệ” hiển thị số \> 0 khi chưa có luồng duyệt. |
| AC2 | Mỗi dòng danh sách hiển thị đúng 10 cột:  Mã báo giá,  Tên báo giá,  Mã yêu cầu báo giá,  Khách hàng,  Tổng đơn giá,  Lợi nhuận dự kiến,  Trạng thái,  Kết quả Thời hạn hiệu lực.  Thao tác. | Thiếu cột hoặc sai dữ liệu hiển thị so với chi tiết báo giá. |
| AC3 | Cột Trạng thái hiển thị một trong 7 giá trị: Nháp, Chờ phê duyệt, Đã phê duyệt, Từ chối, Đã phát hành, Thu hồi, Hết hiệu lực. Cột Kết quả hiển thị Thành công hoặc Thất bại; để trống khi báo giá chưa có kết quả (xem BR2). | Hiển thị Thành công/Thất bại ở cột Trạng thái; hoặc cột Kết quả hiển thị giá trị khi báo giá chưa có kết quả. |
| AC4 | Ô tìm kiếm cho phép tìm theo Mã báo giá / Tên báo giá / Mã yêu cầu báo giá;  Bộ lọc theo Trạng thái / Khách hàng / Hạng khách hàng / Thời gian hiệu lực (Khoảng ngày) chỉ hiển thị báo giá đúng trạng thái đã chọn. Sắp xếp theo các cột: Tổng đơn giá, Lợi nhuận dự kiến,  | Tìm kiếm/lọc trả về sai kết quả hoặc không lọc. |
| AC5 | Các chức năng thao tác trên từng báo giá (Sửa/Xóa) chỉ khả dụng khi người dùng có quyền tương ứng.  Action “Xóa” chỉ hiển thị với báo giá Nháp (xem BR14). | Hiển thị action khi không có quyền; hoặc hiện Phát hành/Xóa trên báo giá không phải Nháp. |
| AC6 | Nút “Export” trên màn danh sách cho phép xuất dữ liệu danh sách. (Chi tiết định dạng/validate Export chưa mô tả trong phiên bản tài liệu này.) | Nút Export không hoạt động hoặc thiếu nút. |
| AC7 | Người dùng KHÔNG có quyền Xem bị chặn truy cập menu và không thấy dữ liệu. | Người dùng không có quyền Xem vẫn xem được danh sách. |

#### **User story 2: Thêm mới báo giá**

| ID US | US\_QUO\_02 |
| :---- | :---- |
| **Tên Story** | Thêm mới báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn thêm mới một báo giá để gửi cho Sale soạn báo giá khách hàng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Các trường bắt buộc gồm Tên báo giá và Mã yêu cầu báo giá liên quan (RFQ), Thời hạn hiệu lực; nếu còn trống, thao tác lưu bị chặn và hệ thống báo lỗi thiếu thông tin bắt buộc. | Cho lưu khi còn trống Tên báo giá hoặc Mã yêu cầu báo giá. |
| AC2 | Danh sách chọn Mã yêu cầu báo giá (RFQ) chỉ hiển thị các yêu cầu báo giá CHƯA gắn báo giá nào & trạng thái “Đang báo giá”;  Các yêu cầu báo giá đã có báo giá không xuất hiện trong danh sách chọn (xem BR1 — quan hệ 1 Yêu cầu báo giá – 1 báo giá). | Danh sách chọn hiển thị cả yêu cầu báo giá đã gắn báo giá; hoặc cho phép tạo báo giá thứ hai cho cùng một yêu cầu báo giá. |
| AC3 | Nhập Tên báo giá trùng với báo giá đã tồn tại: thao tác lưu bị chặn và hệ thống báo “Tên báo giá đã tồn tại”. | Cho tạo báo giá trùng Tên báo giá. |
| AC4 | Khi chọn Mã yêu cầu báo giá (RFQ), hệ thống tự động điền và hiển thị ở chế độ chỉ đọc: Khách hàng (ID \- Tên khách hàng) theo RFQ; Hạng khách hàng theo Khách hàng vừa điền; Ghi chú yêu cầu báo giá lấy từ Ghi chú chung của RFQ. | Chọn RFQ nhưng không tự điền; hoặc cho phép sửa các trường tự điền. |
| AC5 | Khi chọn Mã yêu cầu báo giá (RFQ), nhóm “Thông tin dịch vụ” và “Dịch vụ yêu cầu” (danh sách dịch vụ được yêu cầu kèm các thông tin yêu cầu tương ứng) được tự động điền từ RFQ, hiển thị chỉ đọc: Loại hình xuất nhập khẩu, Nhóm hàng, Đặc tính hàng hóa, Loại xe, Quy cách đóng gói, Ghi chú yêu cầu dịch vụ và thông tin từng dịch vụ yêu cầu. | Không tự điền nhóm Thông tin dịch vụ; hoặc không hiển thị đủ các giá trị khi RFQ có nhiều giá trị. Không hiển thị nhóm "Dịch vụ yêu cầu"; hoặc hiển thị khi chưa chọn RFQ; hoặc cho phép chỉnh sửa dữ liệu nhóm này. |
| AC6 | Các đầu mục xuất hiện trong bảng giá dịch vụ chỉ gồm các đầu mục có Loại giá thuộc {Cố định, Phụ phí} và được Kích hoạt;  Đầu mục có Loại giá “Phát sinh” và Đầu mục không được kích hoạt KHÔNG xuất hiện trong bảng giá dịch vụ (xem BR5). | Bảng giá dịch vụ hiển thị đầu mục có Loại giá Phát sinh. |
| AC7 | Tại nhóm Danh sách bảng giá, người dùng thêm mới bảng giá dịch vụ (chi tiết luồng tại US\_QUO\_04) hoặc xóa bảng giá dịch vụ (chi tiết tại US\_QUO\_05) và sửa Đơn giá của dòng giá (chi tiết tại US\_QUO\_06).  Sau mỗi thao tác thêm mới/xóa, hệ thống tự động tính lại Lợi nhuận (%) của dòng giá (theo BR6), Tổng đơn giá của bảng giá, Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%) (theo BR9, BR10). Trong mỗi loại dịch vụ có thể có nhiều bảng giá. | Không thêm/xóa được bảng giá; hoặc Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%) không được tính lại sau thao tác. |
| AC8 | Trường Đơn giá trong bảng giá dịch vụ là bắt buộc (đối với tất cả các dòng giá) Nếu còn trống khi lưu, thao tác lưu bị chặn và hệ thống báo lỗi thiếu thông tin bắt buộc. | Cho lưu khi còn trống Đơn giá. |
| AC9 | Khi lưu hợp lệ, báo giá được lưu ở trạng thái Nháp và điều hướng sang màn chi tiết/soạn thảo; thao tác Hủy không lưu bất kỳ thay đổi nào. Hệ thống tự sinh Mã báo giá theo cấu trúc IPSYYMMDD-XXX (IPS: tiền tố cố định; YY: 2 số cuối của năm, MM: tháng, DD: ngày tạo hiện tại; XXX: số thứ tự tạo trong ngày, bắt đầu từ 001); trường này ở chế độ chỉ đọc, người dùng không được chỉnh sửa (xem BR11) | Lưu thành công nhưng trạng thái không phải Nháp; hoặc Hủy vẫn lưu. Không tự sinh mã; sai cấu trúc mã; hoặc cho phép người dùng sửa Mã báo giá. |
| AC10 | Người dùng KHÔNG có quyền Tạo: nút “Thêm mới báo giá” bị ẩn và thao tác tạo bị chặn. | Người dùng không có quyền vẫn tạo được báo giá. |
| AC11 | Khi nhấn "Tạo báo giá", hệ thống đối chiếu các dịch vụ được yêu cầu (có tick trong RFQ) với Loại dịch vụ của các bảng giá dịch vụ đã tạo trong báo giá. Nếu có dịch vụ được yêu cầu (Loại dịch vụ của dịch vụ yêu cầu) mà chưa tạo bảng giá dịch vụ có Loại dịch vụ tương ứng, hệ thống hiển thị cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo báo giá?" — người dùng Xác nhận thì tiếp tục tạo, Hủy thì quay lại màn tạo (xem BR27). | Không kiểm tra/không cảnh báo khi thiếu bảng giá của dịch vụ được yêu cầu; hoặc chặn cứng không cho tạo báo giá. |

#### **User story 3: Chỉnh sửa báo giá**

| ID US | US\_QUO\_03 |
| :---- | :---- |
| **Tên Story** | Chỉnh sửa báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn chỉnh sửa một báo giá đang ở trạng thái Nháp trên màn hình có sẵn dữ liệu đã tạo, để hoàn thiện báo giá trước khi phát hành. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Chỉnh sửa chỉ khả dụng với báo giá ở trạng thái Nháp / Từ chối / Thu hồi; với báo giá ở các trạng thái khác (Chờ phê duyệt, Đã phê duyệt, Đã phát hành/Hết hiệu lực), chức năng bị ẩn và thao tác chỉnh sửa bị chặn (xem BR3). | Mở được màn chỉnh sửa với báo giá không ở trạng thái Nháp/Từ chối. |
| AC2 | Màn Chỉnh sửa báo giá có bố cục và các nhóm thông tin giống màn Thêm mới báo giá (Thông tin chung, Thông tin dịch vụ, Danh sách bảng giá, Tổng hợp bảng giá), với toàn bộ dữ liệu đã tạo được hiển thị sẵn. | Thiếu nhóm thông tin; hoặc dữ liệu đã lưu không được hiển thị sẵn. |
| AC3 | Mã báo giá giữ nguyên giá trị đã sinh khi tạo và ở chế độ chỉ đọc.  Các trường Tên báo giá, thời hạn hiệu lực, Điều kiện áp dụng: cho phép sửa;  Các trường Tên báo giá, thời hạn hiệu lực: Bắt buộc điền Hệ thống kiểm tra trùng tên với các báo giá khác (không tính chính báo giá đang sửa). | Mã báo giá bị thay đổi khi sửa; hoặc báo trùng tên với chính báo giá đang chỉnh sửa. Các trường bắt buộc để trống vẫn Lưu chỉnh sửa thành công. |
| AC4 | Khi người dùng đổi sang Mã yêu cầu báo giá (RFQ) khác, danh sách chọn vẫn chỉ hiển thị các yêu cầu báo giá chưa gắn báo giá (cộng thêm RFQ đang gắn với chính báo giá này);  Hệ thống tự điền lại Khách hàng, Hạng khách hàng, Ghi chú yêu cầu báo giá, nhóm Thông tin dịch vụ và các dịch vụ yêu cầu theo RFQ mới.  | Đổi RFQ nhưng các thông tin tự điền không được cập nhật lại theo RFQ mới. |
| AC5 | Trong màn Chỉnh sửa, người dùng thêm mới/xóa bảng giá dịch vụ (US\_QUO\_04, US\_QUO\_05) và cập nhật Đơn giá của dòng giá (US\_QUO\_06) ngay trong Danh sách bảng giá; sau mỗi thao tác, hệ thống tự động tính lại Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%). | Các chỉ tiêu tổng hợp không được tính lại sau thao tác thêm/xóa bảng giá hoặc cập nhật Đơn giá. |
| AC6 | Trường Đơn giá trong bảng giá dịch vụ là bắt buộc (đối với tất cả các dòng giá) Nếu còn trống khi lưu, thao tác lưu bị chặn và hệ thống báo lỗi thiếu thông tin bắt buộc. | Cho lưu khi còn trống Đơn giá. |
| AC7 | Khi lưu thay đổi hợp lệ, hệ thống cập nhật báo giá, giữ nguyên trạng thái và ghi nhận thao tác vào Lịch sử hoạt động (xem BR17); thao tác Hủy không lưu bất kỳ thay đổi nào. | Lưu thay đổi làm đổi trạng thái báo giá; không ghi nhận Lịch sử hoạt động; hoặc Hủy vẫn lưu. |
| AC8 | Người dùng KHÔNG có quyền Sửa: chức năng Chỉnh sửa bị ẩn và thao tác bị chặn. | Người dùng không có quyền vẫn chỉnh sửa được báo giá. |
| AC9 | Khi nhấn "Tạo báo giá", hệ thống đối chiếu các dịch vụ được yêu cầu (có tick trong RFQ) với Loại dịch vụ của các bảng giá dịch vụ đã tạo trong báo giá. Nếu có dịch vụ được yêu cầu (Loại dịch vụ của dịch vụ yêu cầu) mà chưa tạo bảng giá dịch vụ có Loại dịch vụ tương ứng, hệ thống hiển thị cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo báo giá?" — người dùng Xác nhận thì tiếp tục tạo, Hủy thì quay lại màn tạo (xem BR27). | Không kiểm tra/không cảnh báo khi thiếu bảng giá của dịch vụ được yêu cầu; hoặc chặn cứng không cho tạo báo giá. |

#### **User story 4: Thêm bảng giá dịch vụ trong báo giá**

| ID US | US\_QUO\_04 |
| :---- | :---- |
| **Tên Story** | Thêm bảng giá dịch vụ trong báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn thêm một bảng giá dịch vụ ngay trong màn Thêm mới/Chỉnh sửa báo giá bằng cách nhập thuộc tính dịch vụ và chọn dòng giá cho từng đầu mục giá, để dựng cấu trúc giá của báo giá theo đúng dữ liệu định mức đã có. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Tại màn Tạo/Sửa Báo giá, nhấn “Thêm bảng giá dịch vụ” mở modal “Thêm bảng giá dịch vụ mới” với các trường bắt buộc: Loại dịch vụ, Tên bảng giá cụ thể. | Không mở được modal; hoặc modal thiếu trường bắt buộc Loại dịch vụ / Tên bảng giá cụ thể. |
| AC2 | Khi chọn Loại dịch vụ, hệ thống hiển thị: (a) bộ thông tin thuộc tính tương ứng với loại dịch vụ đã chọn; (b) danh sách giá gồm 9 cột theo thứ tự: ID, Đầu mục giá, Loại giá, Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức, Đơn giá, Lợi nhuận (%). Bổ sung ràng buộc: Dropdown "Loại dịch vụ" chỉ hiển thị các loại dịch vụ có trong Dịch vụ yêu cầu của Yêu cầu báo giá (RFQ) đã chọn; loại dịch vụ không được yêu cầu trong RFQ không xuất hiện trong dropdown (xem BR25). | Chọn Loại dịch vụ nhưng không hiển thị bộ thuộc tính tương ứng; hoặc danh sách giá sai/thiếu cột so với đặc tả. Dropdown Loại dịch vụ hiển thị cả loại dịch vụ không có trong Dịch vụ yêu cầu của RFQ. |
| AC3 | Danh sách giá hiển thị các dòng đầu mục giá lấy từ cấu hình đầu mục giá;  \- Chỉ hiển thị các đầu mục có Loại giá thuộc {Cố định, Phụ phí}, và được kích hoạt. KHÔNG hiển thị đầu mục có Loại giá “Phát sinh” và đầu mục không kích hoạt (xem BR5).  \- Mỗi đầu mục giá có nút chọn dòng giá nằm trong chính đầu mục đó và chỉ được chọn 1 dòng giá (quan hệ 1 đầu mục giá – 1 dòng giá, xem BR18). | Hiển thị đầu mục Loại giá Phát sinh; danh sách đầu mục không lấy từ cấu hình đầu mục giá; hoặc một đầu mục cho phép chọn nhiều hơn 1 dòng giá. |
| AC4 | Người dùng nhập giá trị cho bộ thông tin thuộc tính;  Các thuộc tính bắt buộc nhập đầy đủ.  Khi nhấn nút chọn dòng giá của một đầu mục, hệ thống hiển thị danh sách dòng giá đã được lọc theo:  (a) đầu mục giá chứa nút chọn;  (b) các giá trị thuộc tính người dùng đã nhập. Bổ sung: Các trường thuộc tính là dropdown và chỉ chọn trong phạm vi giá trị đã nhập tại Yêu cầu báo giá theo bảng ánh xạ "Nguồn giá trị các trường thuộc tính" (mục 3.1.2) — xem BR25. Riêng Điểm đi, Điểm đến là hai dropdown riêng, mỗi dropdown chỉ chọn trong các điểm đi / điểm đến đã nhập tại Yêu cầu báo giá; cho phép ghép chéo điểm đi và điểm đến. | Cho chọn dòng giá khi chưa nhập đủ thuộc tính bắt buộc; hoặc danh sách dòng giá không được lọc theo đầu mục và giá trị thuộc tính đã nhập. Trường thuộc tính cho nhập/chọn giá trị ngoài phạm vi giá trị đã nhập tại Yêu cầu báo giá. |
| AC5 | Dòng giá đã chọn được điền vào đúng đầu mục giá tương ứng trong modal (Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức);  Đơn giá là trường bắt buộc trong bảng giá dịch vụ. Đơn giá mặc định bằng Giá bán định mức và cho phép người dùng cập nhật.  Khi có Đơn giá/cập nhật Đơn giá, hệ thống tự động tính lại Lợi nhuận (%) của dòng theo BR6; trường Lợi nhuận (%) ở chế độ chỉ đọc. | Dòng giá được điền sai đầu mục; Đơn giá mặc định không bằng Giá bán định mức; hoặc Lợi nhuận (%) không tự tính lại. |
| AC6 | Nhấn nút “Tạo bảng giá dịch vụ”:  Một bảng giá mới được thêm vào Danh sách bảng giá của báo giá  Hệ thống tự động sinh ID cho bảng giá theo cấu trúc: IQYYMM-XXX, trong đó: IQ (Internal Quote) là tiền tố cố định YYMM là 2 số cuối của năm/tháng hiện tại XXX bắt đầu từ 001  Hệ thống tự động sinh ID riêng cho từng dòng giá trong bảng giá (xem BR19).  Hệ thống tự động tính lại Tổng đơn giá của bảng giá, Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%). | Không tạo được bảng giá; không tự sinh ID bảng giá hoặc ID dòng giá; hoặc các chỉ tiêu tổng hợp không được tính lại. |
| AC7 | Nhấn “Tạo bảng giá dịch vụ” khi còn trống trường bắt buộc (Loại dịch vụ, Tên bảng giá cụ thể, Đơn giá của tất cả dòng giá) hoặc chưa nhập đủ thuộc tính bắt buộc: hệ thống chặn tạo và báo lỗi thiếu thông tin bắt buộc. | Cho tạo bảng giá khi còn thiếu trường bắt buộc hoặc thuộc tính bắt buộc. |
| AC8 | Nhấn “Tạo bảng giá dịch vụ” khi chưa chọn dòng giá cho tất cả đầu mục giá: hệ thống chặn tạo và báo “Vui lòng chọn đầy đủ dòng giá trong các đầu mục”. | Tạo được bảng giá dịch vụ có đầu mục trống dòng giá. |
| AC9 | Thao tác Hủy trong modal không tạo bảng giá và không thay đổi dữ liệu báo giá. | Hủy modal nhưng bảng giá vẫn được thêm vào báo giá. |
| AC10 | Được phép tạo nhiều bảng giá trong 1 loại dịch vụ.   | Chỉ được tạo 1 bảng giá trong 1 loại dịch vụ. Tạo đến bảng thứ 2 hệ thống báo lỗi. |
| AC11 | Khi nhấn "Tạo bảng giá dịch vụ", hệ thống kiểm tra bộ thuộc tính của bảng giá đang tạo với các bảng giá dịch vụ khác đã tạo trong cùng báo giá: Nếu trùng toàn bộ (cùng Loại dịch vụ và trùng giá trị của tất cả trường thuộc tính) → chặn tạo và báo "Bộ thuộc tính của dịch vụ này đã trùng với {ID – Tên bảng giá}. Vui lòng chọn bộ thông tin khác." (xem BR29). Chỉ khác Tên bảng giá KHÔNG được coi là khác bộ thuộc tính. Ngoại lệ: bảng giá dịch vụ đang bị disable của báo giá tạo tự động (BR-42) không được tính khi kiểm tra trùng; khi Lưu báo giá, bảng giá bị disable trùng bộ thuộc tính sẽ bị ghi đè bởi bảng giá mới tạo. | Tạo được 2 bảng giá dịch vụ có cùng Loại dịch vụ và trùng toàn bộ giá trị thuộc tính trong cùng một báo giá. |

#### **Use story 5: Xóa bảng giá dịch vụ**

| ID US | US\_QUO\_05 |
| :---- | :---- |
| **Tên Story** | Xóa bảng giá dịch vụ |
| **User Story** | Là Chuyên viên định giá, tôi muốn xóa một bảng giá dịch vụ khỏi báo giá đang ở trạng thái Nháp, để loại bỏ bảng giá không còn phù hợp và giữ báo giá đúng với phạm vi dịch vụ thực tế. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Xóa bảng giá dịch vụ hiển thị trên từng bảng giá trong nhóm Danh sách bảng giá tại màn Thêm mới/Chỉnh sửa báo giá. | Xóa được bảng giá khi báo giá không ở trạng thái Nháp; hoặc không có chức năng xóa trên từng bảng giá. |
| AC2 | Khi nhấn Xóa, hệ thống hiển thị bước xác nhận “Bạn có chắc muốn xóa bảng giá dịch vụ này?” trước khi thực hiện. | Xóa ngay không có bước xác nhận. |
| AC3 | Sau khi xác nhận, bảng giá dịch vụ và toàn bộ dòng giá thuộc bảng giá đó bị loại khỏi báo giá. | Bảng giá bị xóa nhưng các dòng giá thuộc bảng vẫn còn trong báo giá. |
| AC4 | Sau khi xóa, hệ thống tự động tính lại Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%) của báo giá (xem BR9, BR10). | Các chỉ tiêu tổng hợp không được tính lại sau khi xóa bảng giá. |
| AC5 | Khi xóa bảng giá cuối cùng, báo giá không còn dòng giá nào; hệ thống vẫn cho lưu báo giá ở trạng thái Nháp nhưng chặn phát hành theo điều kiện tối thiểu 1 dòng giá (xem BR14). | Chặn xóa bảng giá cuối cùng; hoặc cho phát hành báo giá không còn dòng giá nào. |
| AC6 | Người dùng KHÔNG có quyền Xóa: chức năng Xóa bảng giá dịch vụ bị ẩn và thao tác bị chặn. | Người dùng không có quyền vẫn xóa được bảng giá dịch vụ. |

#### **Use story 6: Sửa đơn giá trong bảng giá dịch vụ**

| ID US | US\_QUO\_06 |
| :---- | :---- |
| **Tên Story** | Sửa đơn giá trong bảng giá dịch vụ |
| **User Story** | Là Chuyên viên định giá, tôi muốn sửa Đơn giá của từng dòng giá ngay trong Danh sách bảng giá của báo giá, để điều chỉnh nhanh giá chào mà không phải mở lại modal bảng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Trường Đơn giá của từng dòng giá cho phép chỉnh sửa trực tiếp trong nhóm Danh sách bảng giá tại màn Thêm mới/Chỉnh sửa báo giá. | Sửa được Đơn giá khi báo giá không ở trạng thái Nháp; hoặc phải mở lại modal mới sửa được Đơn giá. |
| AC2 | Các trường Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức của dòng giá giữ nguyên giá trị và ở chế độ chỉ đọc khi người dùng sửa Đơn giá. | Giá mua định mức hoặc Giá bán định mức bị thay đổi khi sửa Đơn giá. |
| AC3 | Sau mỗi lần sửa Đơn giá, hệ thống tự động tính lại theo thứ tự: Lợi nhuận (%) của dòng giá (BR6) → Tổng đơn giá của bảng giá (BR9) → Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%) của báo giá (BR9, BR10). | Một trong các chỉ tiêu Lợi nhuận (%), Tổng đơn giá bảng giá, Tổng đơn giá dịch vụ, Lợi nhuận dự kiến không được tính lại. |
| AC4 | Nhập Đơn giá không hợp lệ (không phải số hoặc nhỏ hơn 0): hệ thống chặn nhập và không cập nhật dòng giá. | Nhập thành công giá trị âm hoặc không phải số. |

#### **User story 7: Xem chi tiết báo giá**

| ID US | US\_QUO\_07 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn xem chi tiết đầy đủ một báo giá gồm thông tin chung, thông tin phát hành, thông tin dịch vụ và danh sách bảng giá và lịch sử hoạt động, để rà soát trước khi phát hành và tra cứu khi cần. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Phần tiêu đề màn chi tiết hiển thị: Mã báo giá và Trạng thái báo giá. | Thiếu Mã báo giá hoặc Trạng thái báo giá ở phần tiêu đề. |
| AC2 | Nhóm Thông tin chung hiển thị: Tên báo giá, Mã yêu cầu báo giá liên quan (RFQ), Khách hàng (ID \- Tên khách hàng), Hạng khách hàng, Ghi chú yêu cầu báo giá, Thời hạn hiệu lực, Điều kiện áp dụng. | Thiếu/sai trường trong nhóm Thông tin chung. |
| AC3 | Nhóm Thông tin phát hành báo giá hiển thị: Người tạo, Người phát hành, Thời điểm phát hành, Kết quả báo giá (Thành công/Thất bại). Với báo giá nội bộ chưa có kết quả (từ báo giá khách hàng), các trường Người phát hành, Thời điểm phát hành và Kết quả phát hành để trống. | Thiếu nhóm Thông tin phát hành; hoặc hiển thị Người phát hành/Thời điểm phát hành khi báo giá chưa phát hành. |
| AC4 | Nhóm Thông tin dịch vụ hiển thị: Loại hình xuất nhập khẩu, Nhóm hàng, Đặc tính hàng hóa, Loại xe, Quy cách đóng gói, Ghi chú yêu cầu dịch vụ. | Thiếu/sai trường trong nhóm Thông tin dịch vụ. |
| AC5 | Nhóm Danh sách bảng giá hiển thị với mỗi bảng giá: Loại dịch vụ, Tên bảng giá, Các thuộc tính (theo loại dịch vụ), Tiền tệ, Bảng giá theo các đầu mục (8 cột: Mã dòng giá (ID), Đầu mục giá, Loại giá, Giá mua định mức, Mã giá bán định mức, Giá bán định mức, Đơn vị, Đơn giá, Lợi nhuận (%)) và Tổng đơn giá. Đối với dịch vụ có trong Yêu cầu báo giá nhưng không chưa bảng giá nào, hệ thống hiển thị badge cảnh báo. | Thiếu bảng giá, thiếu cột trong bảng đầu mục hoặc thiếu Tổng đơn giá. |
| AC6 | Mỗi bảng giá dịch vụ trong section Danh sách bảng giá có chức năng mở rộng/thu gọn: ở trạng thái thu gọn chỉ hiển thị ID \- Tên bảng giá dịch vụ; ở trạng thái mở rộng hiển thị đầy đủ nội dung bảng giá (thuộc tính, bảng giá theo các đầu mục, Tổng đơn giá). | Không có chức năng mở rộng/thu gọn; hoặc trạng thái thu gọn vẫn hiển thị nội dung ngoài ID \- Tên bảng giá dịch vụ. |
| AC7 | Nhóm Tổng hợp bảng giá hiển thị: Tổng đơn giá dịch vụ (chưa bao gồm VAT), Lợi nhuận dự kiến (%), Đơn vị tiền tệ. | Thiếu/sai chỉ tiêu trong nhóm Tổng hợp bảng giá. |
| AC8 | Nhóm Lịch sử hoạt động hiển thị danh sách các thao tác đã thực hiện trên báo giá, gồm đúng 4 cột: Thời gian, Người thực hiện, Hành động, Nội dung. | Thiếu nhóm Lịch sử hoạt động; hoặc thiếu/thừa cột so với đặc tả. |
| AC9 | Mỗi thao tác làm thay đổi báo giá (tạo mới, chỉnh sửa, phát hành, cập nhật kết quả, hết hiệu lực) đều được hệ thống tự động ghi nhận thành một bản ghi trong Lịch sử hoạt động (xem BR17). Danh sách lịch sử ở chế độ chỉ xem danh sách, không xem chi tiết, chỉnh sửa hoặc xóa. | Thao tác thay đổi báo giá không được ghi nhận vào Lịch sử hoạt động; hoặc cho phép xem chi tiết/chỉnh sửa/xóa bản ghi lịch sử. |
| AC10 | Màn Chi tiết báo giá hiển thị nhóm "Dịch vụ yêu cầu" (lấy từ Yêu cầu báo giá đã gắn). Nếu có dịch vụ được yêu cầu nhưng chưa có bảng giá dịch vụ tương ứng, hệ thống hiển thị cảnh báo trong tab dịch vụ "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}" (xem BR28). | Không hiển thị nhóm "Dịch vụ yêu cầu"; hoặc không cảnh báo khi có dịch vụ được yêu cầu nhưng chưa được báo giá. |

#### **User story 8: Phát hành báo giá**

| ID US | US\_QUO\_08 |
| :---- | :---- |
| **Tên Story** | Phát hành báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn phát hành một báo giá Nháp cho bộ phận Sales, để chốt bảng giá và bắt đầu theo dõi kết quả. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Phát hành chỉ hiển thị với báo giá ở trạng thái Nháp / Đã phê duyệt / Thu hồi. Các trạng thái còn lại không hiển nút Phát hành (Chờ phê duyệt, Từ chối, Đã phát hành, Hết hiệu lực) và chặn không cho phép phát hành báo giá. | Các trạng thái khác vẫn hiển thị nút và vẫn có thể phát hành báo giá. |
| AC2 | Khi người dùng thực hiện chức năng Phát hành, hệ thống kiểm tra điều kiện phát hành: báo giá có tối thiểu 1 dòng giá. | Cho phát hành báo giá không có dòng giá nào. |
| AC3 | Khi điều kiện phát hành hợp lệ: trạng thái chuyển sang Đã phát hành; hệ thống ghi nhận Người phát hành là người thực hiện thao tác và Thời điểm phát hành là thời điểm thao tác. | Không chuyển trạng thái; hoặc không ghi Người phát hành/Thời điểm phát hành. |
| AC4 | Sau khi chuyển sang trạng thái Đã phát hành, báo giá bị khóa chức năng xóa báo giá. | Còn cho phép xóa báo giá sau khi Đã phát hành. |
| AC5 | Sau khi phát hành thành công: hệ thống cập nhật thẻ chỉ số “Đã phát hành” và hiển thị thông báo “Phát hành báo giá thành công” và ghi nhận thao tác vào Lịch sử hoạt động. | Thẻ chỉ số không tăng; hoặc không có thông báo phát hành; hoặc không ghi nhận Lịch sử hoạt động. |
| AC6 | Sau khi phát hành thành công, báo giá nội bộ được hiển thị trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm; áp dụng cho mọi lần phát hành, kể cả phát hành lại từ trạng thái Thu hồi. | Phát hành thành công nhưng báo giá nội bộ không hiển thị trên màn Chi tiết Yêu cầu báo giá. |
| AC7 | Người dùng KHÔNG có quyền Phát hành: chức năng Phát hành bị ẩn và thao tác bị chặn. | Người dùng không có quyền vẫn phát hành được. |

#### **User story 9: Ghi nhận kết quả và xử lý hết hiệu lực**

| ID US | US\_QUO\_09 |
| :---- | :---- |
| **Tên Story** | Ghi nhận kết quả và xử lý hết hiệu lực |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống ghi nhận kết quả của báo giá đã phát hành và tự chuyển Hết hiệu lực khi quá hạn, để phản ánh đúng kết quả kinh doanh và phục vụ theo dõi Tỷ lệ chốt. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Hệ thống đồng bộ kết quả báo giá từ báo giá khách hàng: Báo giá được ghi nhận Kết quả Thành công hoặc Thất bại theo trạng thái tương ứng của Báo giá khách hàng (xem BR20)  | Cho cập nhật kết quả với báo giá chưa phát hành; hoặc kết quả không khớp với ghi nhận từ Báo giá khách hàng. |
| AC2 | Một báo giá Đã phát hành có Thời hạn hiệu lực đã qua và được hệ thống tự động chuyển sang trạng thái Hết hiệu lực (xem BR2). | Báo giá quá hạn vẫn ở trạng thái Đã phát hành; hoặc báo giá đã Thành công/Thất bại bị chuyển Hết hiệu lực. |
| AC3 | Chỉ số Tỷ lệ chốt (Won) trên màn danh sách: công thức tính đang Updating — chưa chốt, cần bổ sung trước khi phát triển (xem BR14 và Mục 4). | Triển khai công thức Tỷ lệ chốt khi chưa được chốt chính thức. |
| AC4 | Khi trạng thái báo giá thay đổi (phát hành / có kết quả / hết hiệu lực), các thẻ chỉ số tổng quan trên màn danh sách được cập nhật tương ứng và thao tác được ghi nhận vào Lịch sử hoạt động. | Chỉ số tổng quan không cập nhật khi trạng thái đổi. |

#### **User story 10: Xóa báo giá** 

| ID US | US\_QUO\_10 |
| :---- | :---- |
| **Tên Story** | Xóa báo giá và phân quyền chức năng |
| **User story** | Là Chuyên viên định giá, tôi muốn xóa các báo giá Nháp không dùng đến và hệ thống kiểm soát mọi thao tác theo phân quyền, để giữ dữ liệu gọn gàng và đảm bảo an toàn vận hành. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Với một báo giá ở trạng thái Nháp, thao tác Xóa hiển thị bước xác nhận trước khi xóa; sau khi xác nhận, báo giá bị xóa khỏi danh sách. | Xóa không có bước xác nhận. |
| AC2 | Với một báo giá KHÔNG ở trạng thái Nháp (Chờ phê duyệt, Đã phê duyệt, Từ chối, Đã phát hành, Thu hồi/Hết hiệu lực), thao tác xóa bị chặn và hệ thống báo “Chỉ được xóa báo giá ở trạng thái Nháp” (xem BR13). | Cho xóa báo giá đã phát hành hoặc đã có kết quả. |
| AC3 | Khi một báo giá bị xóa, Yêu cầu báo giá đã gắn với báo giá đó được giải phóng và xuất hiện trở lại trong danh sách chọn RFQ của báo giá mới (xem BR1). | Yêu cầu báo giá vẫn bị coi là đã gắn báo giá sau khi báo giá bị xóa. |

#### **User story 11: Thu hồi báo giá**

| ID US | US\_QUO\_11 |
| :---- | :---- |
| **Tên Story** | Thu hồi báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn thu hồi một báo giá đã phát hành khi Sale chưa tạo Báo giá khách hàng, để điều chỉnh lại báo giá trước khi Sale tiếp tục xử lý với khách hàng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

Tiêu chí chấp nhận (Acceptance Criteria):

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Thu hồi hiển thị tại màn Chi tiết báo giá, chỉ áp dụng với báo giá ở trạng thái "Đã phát hành" và khi Sale CHƯA nhấn "Tạo báo giá khách hàng" trên Yêu cầu báo giá (RFQ) đã đính kèm. | Hiển thị/thực hiện được Thu hồi khi Sale đã tạo Báo giá khách hàng. |
| AC2 | Nhấn "Thu hồi" mở popup xác nhận gồm trường Lý do thu hồi (text area, bắt buộc nhập, tối đa 500 ký tự). | Mở được popup Thu hồi mà không có trường Lý do thu hồi; hoặc cho xác nhận khi để trống Lý do thu hồi. |
| AC3 | Nhấn "Xác nhận" trên popup: báo giá chuyển trạng thái "Thu hồi", hệ thống ghi nhận Lý do thu hồi vào Lịch sử hoạt động và hiển thị thông báo "Thu hồi báo giá thành công". | Không chuyển trạng thái; hoặc không ghi nhận Lịch sử hoạt động; hoặc không có thông báo thành công. |
| AC4 | Sau khi Thu hồi, báo giá không còn hiển thị trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm; Yêu cầu báo giá vẫn giữ nguyên liên kết 1-1 với báo giá này, không được giải phóng để gắn báo giá khác (xem BR1). Trạng thái Yêu cầu báo giá chuyển sang ”Đang báo giá” | Yêu cầu báo giá được giải phóng để chọn cho báo giá khác sau khi Thu hồi. Trạng thái Yêu cầu báo giá không thay đổi |
| AC5 | Báo giá ở trạng thái "Thu hồi" vẫn được Phát hành báo giá (US\_QUO\_08) và Chỉnh sửa báo giá (US\_QUO\_03); riêng chức năng Xóa vẫn KHÔNG áp dụng (chỉ áp dụng trạng thái Nháp — xem BR13). | Chặn Phát hành hoặc Chỉnh sửa báo giá đang ở trạng thái Thu hồi; hoặc cho phép Xóa báo giá Thu hồi. |
| AC6 | Báo giá "Thu hồi" quá Thời hạn hiệu lực vẫn tự động chuyển "Hết hiệu lực" như mọi trạng thái khác, không có ngoại lệ (xem BR2). | Báo giá Thu hồi quá hạn không tự chuyển Hết hiệu lực. |
| AC7 | Thao tác Thu hồi chỉ được sử dụng khi người dùng được phân quyền Thu hồi; người dùng KHÔNG có quyền Thu hồi thì chức năng Thu hồi cũng bị ẩn và thao tác bị chặn. | Người dùng không có quyền Thu hồi vẫn thu hồi được báo giá. |
| AC8 | Thao tác Hủy trong popup Thu hồi không thay đổi trạng thái báo giá và không lưu Lý do thu hồi. | Hủy popup nhưng báo giá vẫn chuyển sang trạng thái Thu hồi. |

### **3.1.2. Mô tả giao diện**

* Ảnh giao diện: \[Chèn ảnh MH Danh sách báo giá / MH Thêm mới báo giá / MH Thêm mới báo giá / MH Xem chi tiết báo giá / Modal Thêm bảng giá dịch vụ mới\]

* Link UI Design: \[Chèn link\]

* Mô tả: Menu gồm 3 màn chính — Danh sách báo giá (thẻ chỉ số \+ bảng danh sách 10 cột \+ tìm kiếm/lọc/Export); Thêm mới báo giá và Chỉnh sửa báo giá (4 nhóm: Thông tin chung, Thông tin dịch vụ, Dịch vụ yêu cầu, Danh sách bảng giá, Tổng hợp bảng giá); Modal Thêm giá dịch vụ; Xem chi tiết báo giá (7 nhóm hiển thị, gồm Lịch sử hoạt động) và mỗi bảng giá dịch vụ có chức năng mở rộng/thu gọn.

* Ghi chú đổi tên hiển thị (áp dụng từ bản cập nhật này): nhãn hiển thị trên giao diện của thành phần "Bảng giá (dịch vụ)" được đổi thành "Dịch vụ" để tránh nhầm lẫn giữa các bảng giá — cụ thể: "Danh sách bảng giá" → "Danh sách dịch vụ"; "Thêm bảng giá dịch vụ" → "Thêm dịch vụ"; "Tạo bảng giá dịch vụ" → "Thêm dịch vụ"; "Xóa bảng giá dịch vụ" → "Xóa dịch vụ"; "ID/Tên bảng giá" → "ID/Tên dịch vụ"; "Tổng hợp bảng giá" → "Tổng hợp tài chính". Trong phần User story, Business Rule, bảng thông báo và các mục còn lại của tài liệu, thuật ngữ "bảng giá dịch vụ" được GIỮ NGUYÊN để không phá vỡ tham chiếu tài liệu; hai tên gọi cùng chỉ một đối tượng (xem BR30).

**Bảng 1 — Màn Danh sách báo giá: các cột hiển thị**

| STT | Tên cột | Mô tả |
| :---- | :---- | :---- |
| 1 | Mã báo giá | Mã do hệ thống tự sinh theo cấu trúc IPSYYMMDD-XXX |
| 2 | Tên báo giá | Tên do người dùng đặt, không trùng |
| 3 | Mã yêu cầu báo giá | Mã Yêu cầu báo giá (RFQ) mà báo giá liên kết |
| 4 | Khách hàng | Khách hàng theo Yêu cầu báo giá đã chọn (ID \- Tên khách hàng) |
| 5 | Hạng khách hàng | Hạng của khách hàng tương ứng |
| 6 | Tổng đơn giá | Tổng đơn giá dịch vụ của báo giá (chưa bao gồm VAT) |
| 7 | Lợi nhuận dự kiến | Tỷ lệ lợi nhuận dự kiến của báo giá (%) |
| 8 | Trạng thái | Nháp / Chờ phê duyệt / Đã phê duyệt / Từ chối / Đã phát hành / Thu hồi / Hết hiệu lực |
| 9 | Kết quả | Thành công / Thất bại; để trống khi báo giá chưa có kết quả ghi nhận từ Báo giá khách hàng |
| 10 | Thời hạn hiệu lực | Ngày hết hạn hiệu lực của báo giá |

**Bảng 2 — Màn Thêm mới báo giá: các trường thông tin**

***Nhóm 1 – Thông tin chung***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Mã báo giá | Tự sinh | Text | — | IPSYYMMDD-XXX | Hệ thống tự sinh, hiển thị chỉ đọc, không cho phép chỉnh sửa |
| Tên báo giá | v | Text | 200 | (Trống) | Bắt buộc; hệ thống kiểm tra trùng tên với các báo giá đã tồn tại |
| Mã yêu cầu báo giá liên quan (RFQ) | v | Select | — | (Trống) | Bắt buộc; danh sách chọn chỉ hiển thị các yêu cầu báo giá CHƯA gắn báo giá; là nguồn tự động điền các trường bên dưới (có check trùng khi lưu) |
| Khách hàng (ID \- Tên khách hàng) | — | Text (chỉ đọc) | — | (Theo RFQ) | Tự động điền theo Yêu cầu báo giá đã chọn |
| Hạng khách hàng | — | Text (chỉ đọc) | — | (Theo Khách hàng) | Tự động điền theo trường Khách hàng |
| Ghi chú yêu cầu báo giá | — | Text area (chỉ đọc) | — | (Theo RFQ) | Tự động điền nội dung trường Ghi chú chung của Yêu cầu báo giá đã chọn |
| Thời hạn hiệu lực | v | Date | — |  | Ngày hết hạn hiệu lực; quá hạn hệ thống tự chuyển trạng thái Hết hiệu lực (xem BR2) Luôn luôn \> {today} |
| Điều kiện áp dụng | — | Text area | 1000 | (Trống) | Điều kiện áp dụng kèm theo báo giá; người dùng nhập |

***Nhóm 2 – Thông tin dịch vụ (toàn bộ tự động điền từ Yêu cầu báo giá đã chọn, chỉ đọc, cho phép nhiều giá trị)***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Loại hình xuất nhập khẩu | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Nhóm hàng | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Đặc tính hàng hóa | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Loại xe | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Quy cách đóng gói | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Ghi chú yêu cầu dịch vụ | — | Text area (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |

***Nhóm 3 – Dịch vụ yêu cầu (hiển thị khi đã chọn Yêu cầu báo giá; lấy nguyên trạng từ Yêu cầu báo giá, chỉ đọc)***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Danh sách dịch vụ yêu cầu | — | List (chỉ đọc) | — | (Theo RFQ) | Danh sách các dịch vụ được tick trong Yêu cầu báo giá (Vận tải / Kho bãi / Khai báo Hải quan / Hải quan Giám sát / Sang tải) |
| Thông tin yêu cầu theo từng dịch vụ | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Các giá trị đã nhập trong Yêu cầu báo giá theo từng dịch vụ: Loại xe yêu cầu, Địa điểm làm TTHQ, Địa điểm kho, Loại hình kho, Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa, Địa điểm sang tải, Phương thức sang tải… |
| Trạng thái báo giá của dịch vụ | — | Label (chỉ đọc) | — | (Tự tính) | "Đã báo giá" khi đã có ≥ 1 bảng giá dịch vụ cùng Loại dịch vụ trong báo giá; "Chưa báo giá" (nhãn cảnh báo) khi chưa có — xem BR28 |
| Ghi chú yêu cầu dịch vụ | — | Text area (chỉ đọc) | — | (Theo RFQ) | Ghi chú của Yêu cầu báo giá theo từng dịch vụ (nếu có) |

***Nhóm 4 – Danh sách dịch vụ (khai báo qua modal “Thêm bảng giá dịch vụ mới”)***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| ID dịch vụ | Tự sinh | Text | — | (Tự sinh khi tạo) | Hệ thống tự động sinh ID khi tạo bảng giá dịch vụ; chỉ đọc |
| Loại dịch vụ | v | Enum | — | (Trống) | 1 trong 5 loại dịch vụ: Vận tải / Kho bãi / Khai báo Hải quan / Hải quan Giám sát / Sang tải Quyết định bộ thuộc tính và danh sách đầu mục giá hiển thị Dropdown chỉ hiển thị các loại dịch vụ có trong Dịch vụ yêu cầu của Yêu cầu báo giá đã chọn (xem BR25) |
| Tên dịch vụ | v | Text | 200 | (Trống) | Tên của bảng giá dịch vụ |
| Bộ thông tin thuộc tính (theo loại dịch vụ) | v | Động theo loại dịch vụ | — | (Trống) | Hiển thị sau khi chọn Loại dịch vụ; bắt buộc nhập đầy đủ.  Là dropdown, chỉ chọn trong phạm vi giá trị đã nhập tại Yêu cầu báo giá theo bảng "Nguồn giá trị các trường thuộc tính" bên dưới (xem BR25). Không được trùng bộ thuộc tính với dịch vụ khác đã tạo trong cùng báo giá (xem BR29). |
| Tiền tệ | v | Enum | — | VNĐ | Đơn vị tiền tệ áp dụng cho bảng giá |
| Tổng đơn giá | — | Number | — | (Tự tính) | Tổng Đơn giá của các đầu mục trong bảng giá; chỉ đọc |

**Bộ thông tin thuộc tính theo Loại dịch vụ:**

| Phân hệ | Cột đặc thù | Cột chung |
| :---- | :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (2) Kho bãi | Tên kho, Loại kho | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa | Đơn vị tính, Tiền tệ, Giá mua định mức |

Nguồn giá trị các trường thuộc tính (giới hạn theo Yêu cầu báo giá đã chọn):

| Trường trong bảng giá dịch vụ | Nguồn giá trị (trường tại Yêu cầu báo giá) | Kiểu chọn / Ghi chú |
| :---- | :---- | :---- |
| Loại dịch vụ | Dịch vụ yêu cầu (các dịch vụ được tick trong RFQ) | Dropdown — chỉ các loại dịch vụ được yêu cầu |
| Loại xe | Loại xe yêu cầu | Dropdown |
| Chi cục hải quan | Địa điểm làm TTHQ | Dropdown |
| Đặc tính hàng hóa | Đặc tính hàng hóa | Dropdown |
| Tên kho | Địa điểm kho | Dropdown |
| Loại kho | Loại hình kho | Dropdown |
| Loại hình XNK | Loại hình XNK | Dropdown |
| Nhóm hàng | Nhóm hàng | Dropdown |
| Địa điểm sang tải | Địa điểm sang tải | Dropdown |
| Phương thức sang tải | Loại hình sang tải | Dropdown |
| Điểm đi, Điểm đến (Vận tải) | Điểm đi / Điểm đến của Yêu cầu báo giá | Hai dropdown riêng; cho phép ghép chéo điểm đi và điểm đến |

Lưu ý: dropdown chỉ hiển thị các giá trị đã nhập tại Yêu cầu báo giá; nếu trường tương ứng tại Yêu cầu báo giá không có giá trị nào thì dropdown rỗng.

***Nhóm 5 – Tổng hợp tài chính***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tổng đơn giá dịch vụ (chưa bao gồm VAT) | — | Number | — | (Tự tính) | Tổng của Tổng đơn giá tất cả bảng giá trong báo giá; chỉ đọc |
| Lợi nhuận dự kiến (%) | — | Number | — | (Tự tính) | Tỷ lệ lợi nhuận dự kiến của báo giá; chỉ đọc (xem BR10) |
| Đơn vị tiền tệ | — | Enum | — | VNĐ | Mặc định VNĐ và ở chế độ không cho chỉnh sửa (disable) |

**Bảng 3 — Bảng giá theo các đầu mục: các cột hiển thị (áp dụng cho cả màn Thêm mới và màn Xem chi tiết)**

| STT | Tên cột | Mô tả |
| :---- | :---- | :---- |
|  | ID | ID riêng của từng dòng giá; hệ thống tự sinh tại thời điểm tạo bảng giá (xem BR19); chỉ đọc |
| 1 | Đầu mục giá | “\[ID đầu mục giá\] \- \[Tên đầu mục giá\]” của các đầu mục giá có loại giá \= “Cố định” và “Phụ phí” & Kích hoạt, lấy từ cấu hình đầu mục giá; mỗi đầu mục có nút chọn dòng giá |
| 2 | Loại giá | Cố định / Phụ phí (kế thừa từ đầu mục giá). Đầu mục Loại giá Phát sinh không xuất hiện trong bảng giá dịch vụ |
| 3 | Mã giá bán định mức | Mã của dòng  Giá bán định mức đã chọn, hệ thống điền sau khi người dùng chọn dòng giá |
| 4 | Đơn vị | Đơn vị tính lấy từ dòng Giá bán định mức đã chọn (không lấy từ đầu mục giá) |
| 5 | Giá mua định mức | Giá mua định mức tương ứng; chỉ đọc |
| 6 | Giá bán định mức | Giá bán định mức tương ứng; chỉ đọc |
| 7 | Đơn giá | Đơn giá áp dụng cho báo giá; mặc định bằng Giá bán định mức; cho phép chỉnh sửa (sửa được cả trong modal và trong Danh sách bảng giá) |
| 8 | Lợi nhuận (%) | Tự động tính theo BR6; chỉ đọc |

**Bảng 4 — Màn Xem chi tiết báo giá: các nhóm thông tin hiển thị**

| Nhóm thông tin | Trường hiển thị |
| :---- | :---- |
| Tiêu đề | Mã báo giá, Trạng thái báo giá Người tạo Trạng thái |
| Thông tin chung | Tên báo giá,  Mã yêu cầu báo giá liên quan (RFQ),  Khách hàng (ID \- Tên khách hàng),  Hạng khách hàng,  Ghi chú yêu cầu báo giá,  Thời hạn hiệu lực,  Điều kiện áp dụng |
| Thông tin phát hành báo giá | Người tạo,  Người phát hành,  Thời điểm phát hành,  Kết quả báo giá (Thành công/Thất bại) |
| Thông tin dịch vụ | Loại hình xuất nhập khẩu,  Nhóm hàng,  Đặc tính hàng hóa,  Loại xe,  Quy cách đóng gói,  Ghi chú yêu cầu dịch vụ |
| Dịch vụ yêu cầu | Danh sách dịch vụ được yêu cầu trong Yêu cầu báo giá kèm thông tin yêu cầu tương ứng; các dịch vụ "Chưa báo giá" được hiển thị cảnh báo (xem BR28) |
| Danh sách bảng giá | Với mỗi bảng giá: ID bảng giá  Loại dịch vụ,  Tên bảng giá,  Các biến phụ thuộc (theo loại dịch vụ),  Bảng giá theo các đầu mục (8 cột như đặc tả tại Bảng 3),  Tổng đơn giá Mỗi bảng giá có chức năng mở rộng (hiển thị đầy đủ) / thu gọn (chỉ hiển thị ID \- Tên bảng giá dịch vụ) Bổ sung: nhãn hiển thị "ID dịch vụ", "Tên dịch vụ"; đầu nhóm hiển thị cảnh báo "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}" khi có dịch vụ được yêu cầu nhưng chưa có bảng giá (xem BR28). |
| Tổng hợp tài chính | Tổng đơn giá dịch vụ (chưa bao gồm VAT), Lợi nhuận dự kiến (%),  Đơn vị tiền tệ |
| Lịch sử hoạt động | Danh sách bản ghi lịch sử, gồm 4 cột:  Thời gian,  Người thực hiện,  Hành động,  Nội dung  (chi tiết tại Bảng 5\) |

**Bảng 5 — Nhóm Lịch sử hoạt động (màn Xem chi tiết báo giá): các cột hiển thị**

| STT | Tên cột | Mô tả |
| :---- | :---- | :---- |
| 1 | Thời gian | Thời điểm thao tác được thực hiện |
| 2 | Người thực hiện | Người dùng thực hiện thao tác |
| 3 | Hành động | Loại thao tác: Tạo mới / Chỉnh sửa / Thêm bảng giá dịch vụ / Xóa bảng giá dịch vụ / Cập nhật đơn giá / Phát hành / Thu hồi / Ghi nhận kết quả báo giá / Hết hiệu lực (updating) |
| 4 | Nội dung | Diễn giải chi tiết nội dung thay đổi của thao tác |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

| ID | Quy tắc |
| :---- | :---- |
| BR1 | Quan hệ Yêu cầu báo giá – Báo giá là 1-1: mỗi Yêu cầu báo giá chỉ được gắn duy nhất 1 báo giá. Danh sách chọn Mã yêu cầu báo giá chỉ hiển thị các yêu cầu báo giá chưa gắn báo giá. RFQ ngoài phạm vi tài liệu này — chỉ chọn, không tạo/sửa tại menu này. |
| BR2 | Trạng thái báo giá gồm 7 giá trị: Nháp, Chờ phê duyệt, Đã phê duyệt, Từ chối, Đã phát hành, Thu hồi, Hết hiệu lực.  Kết quả báo giá (Thành công/Thất bại) là trường ĐỘC LẬP với Trạng thái, không phải một trạng thái trong vòng đời.  Báo giá quá Thời hạn hiệu lực tự động chuyển sang Hết hiệu lực, bất kể đang ở trạng thái nào. |
| BR3 | Chỉ báo giá ở trạng thái Nháp, Từ chối, Thu hồi mới được chỉnh sửa thông tin. Chỉ báo giá ở trạng thái Nháp mới được xóa. Sau khi chuyển sang Đã phát hành, báo giá bị khóa chức năng xóa báo giá. |
| BR4 | Cấu trúc báo giá 3 cấp: Báo giá → Bảng giá (theo loại dịch vụ) → Dòng giá chi tiết. |
| BR5 | Bảng giá dịch vụ chỉ chứa các đầu mục giá có Loại giá thuộc {Cố định, Phụ phí} & Kích hoạt.  Đầu mục có Loại giá “Phát sinh” KHÔNG xuất hiện trong bảng giá dịch vụ và không tham gia vào các chỉ tiêu tổng hợp của báo giá.  Đầu mục không kích hoạt KHÔNG xuất hiện trong bảng giá dịch vụ và không tham gia vào các chỉ tiêu tổng hợp của báo giá.  |
| BR6 | % Lợi nhuận của đầu mục giá (Cố định/Phụ phí) \= (Đơn giá − Giá mua định mức) / Giá mua định mức; chỉ đọc, hệ thống tự tính.  |
| BR7 | Khi nạp đầu mục giá từ Giá bán định mức, Đơn giá mặc định \= Giá bán định mức; cho phép người dùng sửa Đơn giá; mỗi lần sửa hệ thống tính lại % Lợi nhuận theo BR6. |
| BR8 | Giá mua/bán định mức được chốt (snapshot) tại thời điểm nạp đầu mục giá vào báo giá; không tự đồng bộ khi định mức nguồn thay đổi. |
| BR9 | Tổng đơn giá của một bảng giá \= Σ Đơn giá của các đầu mục trong bảng giá. Tổng đơn giá dịch vụ (chưa bao gồm VAT) của báo giá \= Σ Tổng đơn giá của tất cả bảng giá. Giá trị này cũng là cột “Tổng đơn giá” hiển thị ở màn Danh sách báo giá. |
| BR10 | Lợi nhuận dự kiến (%) toàn báo giá \= (Σ Đơn giá − Σ Giá mua định mức) / Σ Giá mua định mức; chỉ đọc, hệ thống tự tính. |
| BR11 | Mã báo giá do hệ thống tự sinh theo cấu trúc IPSYYMMDD-XXX  IPS: tiền tố cố định — Internal Pricing Sheet;  YY: 2 số cuối của năm,  MM: tháng,  DD: ngày tạo hiện tại;  XXX: số thứ tự tạo trong ngày, bắt đầu từ 001); Và người dùng KHÔNG được chỉnh sửa.  Tên báo giá do người dùng đặt và không được trùng. Các trường bắt buộc: Tên báo giá, Mã yêu cầu báo giá liên quan (RFQ), Thời hạn hiệu lực, Đơn giá của dòng giá (trong bảng giá dịch vụ) |
| BR12 | Hệ thống tự động sinh ID cho bảng giá theo cấu trúc: IQYYMM-XXX, trong đó: IQ (Internal Quote) là tiền tố cố định YYMM là 2 số cuối của năm/tháng hiện tại XXX bắt đầu từ 001  |
| BR13 | Xóa báo giá chỉ áp dụng với trạng thái Nháp. Mọi chức năng Xem/Sửa/Phát hành/Xóa được kiểm soát bằng phân quyền; chức năng ẩn hoàn toàn khi người dùng không có quyền. |
| BR14 | Điều kiện phát hành báo giá: báo giá phải có tối thiểu 1 dòng giá. Khi phát hành thành công, hệ thống ghi nhận Người phát hành và Thời điểm phát hành, đồng thời hiển thị báo giá nội bộ trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm. |
| BR15 | Tỷ lệ chốt (Won) \= Số lượng báo giá có kết quả Thành công / Tổng số báo giá “Đã phát hành” \+ “Hết hiệu lực” (**updating**) |
| BR16 | Thẻ chỉ số “Chờ duyệt ngoại lệ” thuộc luồng phê duyệt — NGOÀI phạm vi giai đoạn này; thẻ hiển thị 0 hoặc được ẩn. |
| BR17 | Mọi thao tác làm thay đổi báo giá được hệ thống tự động ghi nhận vào Lịch sử hoạt động, mỗi bản ghi gồm: Thời gian, Người thực hiện, Hành động, Nội dung. Lịch sử hoạt động chỉ ở chế độ xem; không cho phép chỉnh sửa hoặc xóa bản ghi. |
| BR18 | Trong một bảng giá dịch vụ, mỗi đầu mục giá chỉ được gán tối đa 1 dòng giá (quan hệ 1 đầu mục giá – 1 dòng giá). Danh sách dòng giá cho người dùng chọn được lọc theo:  (a) đầu mục giá tương ứng;  (b) các giá trị thuộc tính đã nhập trong bảng giá. |
| BR19 | Mỗi dòng giá trong bảng giá dịch vụ có một ID riêng do hệ thống tự động sinh tại thời điểm tạo bảng giá; ID hiển thị ở cột đầu tiên của Bảng giá theo các đầu mục và ở chế độ chỉ đọc. |
| BR20 | Kết quả báo giá được ghi nhận tự động: khi bộ phận Sales cập nhật trạng thái Thành công/Thất bại cho Báo giá khách hàng (được tạo từ báo giá nội bộ), hệ thống ghi nhận Kết quả báo giá tương ứng cho báo giá nội bộ được tham chiếu.  Người dùng tại menu này không cập nhật thủ công Kết quả báo giá. |
| BR21 | Thu hồi báo giá: chỉ áp dụng với báo giá ở trạng thái "Đã phát hành" và khi Sale CHƯA tạo Báo giá khách hàng từ Yêu cầu báo giá (RFQ) đã đính kèm.  |
| BR22 | Thu hồi thành công: báo giá chuyển trạng thái "Thu hồi", ẩn khỏi màn Chi tiết Yêu cầu báo giá (RFQ) nhưng vẫn giữ nguyên liên kết 1-1 với RFQ đó, không được giải phóng để gắn báo giá khác; |
| BR23 | Thao tác Thu hồi cần người dùng được phân quyền Thu hồi mới hiển thị và sử dụng được. |
| BR24 | Được phép tạo nhiều bảng giá trong báo giá |
| BR25 | Nguồn giá trị các trường thông tin trong modal Thêm dịch vụ (Thêm bảng giá dịch vụ) bị giới hạn theo Yêu cầu báo giá (RFQ) đã chọn: Loại dịch vụ ← Dịch vụ yêu cầu;  Loại xe ← Loại xe yêu cầu;  Chi cục hải quan ←Địa điểm làm TTHQ;  Đặc tính hàng hóa ← Đặc tính hàng hóa;  Tên kho ← Địa điểm kho;  Loại kho ← Loại hình kho;  Loại hình XNK ← Loại hình XNK;  Nhóm hàng ← Nhóm hàng;  Địa điểm sang tải ← Địa điểm sang tải;  Phương thức sang tải ← Loại hình sang tải. Tất cả là dropdown, chỉ chọn trong các giá trị đã nhập tại RFQ. Riêng Điểm đi, Điểm đến là hai dropdown riêng, mỗi dropdown chỉ chọn trong các điểm đi / điểm đến đã nhập tại Yêu cầu báo giá; cho phép ghép chéo điểm đi và điểm đến. Chi tiết xem bảng "Nguồn giá trị các trường thuộc tính" (mục 3.1.2). |
| BR26 | Màn Thêm mới/Chỉnh sửa báo giá hiển thị nhóm "Dịch vụ yêu cầu" lấy nguyên trạng từ Yêu cầu báo giá đã chọn, ở chế độ chỉ đọc; nhóm chỉ hiển thị khi đã chọn Yêu cầu báo giá và được nạp lại khi người dùng đổi sang Yêu cầu báo giá khác. |
| BR27 | Cảnh báo thiếu dịch vụ (soft warning): khi nhấn Tạo/Lưu báo giá, hệ thống đối chiếu các dịch vụ được tick trong Yêu cầu báo giá với Loại dịch vụ của các bảng giá dịch vụ đã tạo trong báo giá. Với mỗi dịch vụ được yêu cầu nhưng chưa có bảng giá dịch vụ tương ứng, hệ thống cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ 1}, {Loại dịch vụ 2}... , tiếp tục Tạo/Lưu báo giá?". Đây là cảnh báo, KHÔNG chặn: người dùng Xác nhận thì tiếp tục Tạo/Lưu, Hủy thì quay lại màn tạo/chỉnh sửa. |
| BR28 | Hiển thị tab loại dịch vụ chưa được báo giá: (a) Màn Chi tiết báo giá — nhóm Danh sách dịch vụ; Mỗi tab loại dịch vụ hiển thị cảnh báo "Dịch vụ chưa được báo giá". (b) Màn Yêu cầu báo giá — section báo giá nội bộ đã phát hành: hiển thị cảnh báo tương tự cho các dịch vụ được yêu cầu nhưng không có trong báo giá đã phát hành. Cảnh báo chỉ mang tính thông tin, không chặn thao tác. |
| BR29 | Trong cùng một báo giá, KHÔNG được tồn tại hai bảng giá dịch vụ trùng bộ thuộc tính — tức cùng Loại dịch vụ và trùng giá trị của TẤT CẢ trường thuộc tính (theo bộ thuộc tính của loại dịch vụ đó). Tên bảng giá/Tên dịch vụ khác nhau KHÔNG được coi là khác bộ thuộc tính. Khi phát hiện trùng, hệ thống chặn tạo bảng giá dịch vụ và hiển thị thông báo lỗi. Ngoại lệ: bảng giá dịch vụ đang bị disable của báo giá tạo tự động (BR-42) không được tính khi kiểm tra trùng; khi Lưu báo giá, bảng giá bị disable trùng bộ thuộc tính sẽ bị ghi đè bởi bảng giá mới tạo. Quy tắc này không mâu thuẫn với BR24 — vẫn cho phép nhiều bảng giá trong cùng một loại dịch vụ, miễn khác bộ thuộc tính. |
| BR30 | Quy ước tên gọi: trên giao diện, thành phần "Bảng giá (dịch vụ)" hiển thị với nhãn "Dịch vụ" (Danh sách dịch vụ, Thêm/Tạo/Xóa dịch vụ, ID/Tên dịch vụ, Tổng hợp dịch vụ). Trong tài liệu (User story, Business Rule, bảng thông báo) giữ nguyên thuật ngữ "bảng giá dịch vụ". Hai tên gọi cùng chỉ một đối tượng. |

### **3.1.4. Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Lưu báo giá khi còn trống trường bắt buộc (Tên báo giá, Mã yêu cầu báo giá, Thời hạn hiệu lực, Đơn giá) | Lỗi | “Vui lòng nhập đầy đủ thông tin bắt buộc” | Không lưu, giữ nguyên dữ liệu đang nhập |
| Nhập Tên báo giá trùng với báo giá đã tồn tại | Lỗi | “Tên báo giá đã tồn tại” | Không lưu |
| Tạo/lưu báo giá Nháp thành công | Thành công | “Tạo báo giá thành công” | Lưu trạng thái Nháp, điều hướng sang màn chi tiết/soạn thảo |
| Lưu thay đổi báo giá thành công (màn Chỉnh sửa) | Thành công | “Cập nhật báo giá thành công” | Lưu thay đổi, giữ trạng thái Nháp, ghi nhận Lịch sử hoạt động |
| Tạo bảng giá dịch vụ khi thiếu trường bắt buộc hoặc thuộc tính bắt buộc  | Lỗi | “Vui lòng nhập đầy đủ thông tin bắt buộc” | Không tạo bảng giá |
| Tạo bảng giá dịch vụ khi chưa chọn dòng giá cho tất cả đầu mục giá  | Lỗi | “Vui lòng nhập đầy đủ dòng giá trong các đầu mục giá” | Không tạo bảng giá (Giả định — xem Mục 4\) |
| Tạo bảng giá dịch vụ thành công | Thành công | “Tạo bảng giá dịch vụ thành công” | Thêm bảng giá kèm ID bảng giá và ID từng dòng giá tự sinh; tính lại các chỉ tiêu tổng hợp |
| Xóa bảng giá dịch vụ khỏi báo giá | Cảnh báo | “Bạn có chắc muốn xóa bảng giá dịch vụ này?” | Yêu cầu xác nhận; xác nhận → xóa bảng giá và toàn bộ dòng giá thuộc bảng, tính lại các chỉ tiêu tổng hợp |
| Nhập Đơn giá không hợp lệ (không phải số hoặc nhỏ hơn 0\) trong modal bảng giá hoặc trong danh sách bảng giá \- form tạo/sửa báo giá | Lỗi | “Đơn giá không hợp lệ” | Không cập nhật đầu mục giá và các chỉ tiêu tổng hợpKhông Lưu báo giá.  |
| Phát hành khi báo giá chưa có dòng giá nào | Lỗi | “Báo giá phải có tối thiểu 1 dòng giá trước khi phát hành” | Chặn phát hành |
| Phát hành báo giá thành công | Thành công | “Phát hành báo giá thành công” | Chuyển trạng thái Đã phát hành, ghi Người phát hành và Thời điểm phát hành. |
| Nhấn "Thu hồi" báo giá Đã phát hành (Sale chưa tạo Báo giá khách hàng) | Xác nhận | “Vui lòng nhập lý do thu hồi báo giá” | Hiển thị popup xác nhận Thu hồi với trường Lý do thu hồi (bắt buộc, tối đa 500 ký tự) |
| Xác nhận Thu hồi khi để trống Lý do thu hồi | Lỗi | “Vui lòng nhập lý do thu hồi” | Không thực hiện thu hồi, giữ nguyên popup |
| Xác nhận Thu hồi thành công | Thành công | “Thu hồi báo giá thành công” | Chuyển trạng thái Thu hồi, ẩn khỏi màn Chi tiết Yêu cầu báo giá, ghi nhận Lịch sử hoạt động |
| Thực hiện Thu hồi với báo giá không đủ điều kiện (không ở trạng thái Đã phát hành, hoặc Sale đã tạo Báo giá khách hàng) | Lỗi | “Không thể thu hồi báo giá ở trạng thái này” | Chặn thao tác thu hồi, ẩn/disable nút Thu hồi |
| Hệ thống ghi nhận Kết quả báo giá từ Báo giá khách hàng | Thông báo | “Báo giá đã được ghi nhận kết quả: \[Thành công/Thất bại\]” | Cập nhật trường Kết quả báo giá; ghi nhận Lịch sử hoạt động |
| Xóa báo giá Nháp | Cảnh báo | “Bạn có chắc muốn xóa báo giá này?” | Yêu cầu xác nhận; xác nhận → xóa |
| Người dùng không có quyền (Xem/Sửa/Phát hành/Xóa) | Lỗi | “Bạn không có quyền thực hiện chức năng này” | Ẩn chức năng, chặn thao tác |
| Nhấn Tạo/Lưu báo giá khi có dịch vụ được yêu cầu trong Yêu cầu báo giá nhưng chưa tạo bảng giá dịch vụ tương ứng | Cảnh báo (xác nhận) | "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo/Lưu báo giá?" | Hiển thị popup xác nhận; Xác nhận → tiếp tục Tạo/Lưu báo giá; Hủy → quay lại màn tạo/chỉnh sửa, giữ nguyên dữ liệu đang nhập (BR27) |
| Nhấn "Tạo bảng giá dịch vụ" khi bộ thuộc tính trùng với một bảng giá dịch vụ khác đã tạo trong báo giá | Lỗi | "Bộ thuộc tính của dịch vụ này đã trùng với {ID – Tên bảng giá}. Vui lòng chọn bộ thuộc tính khác." | Chặn tạo bảng giá dịch vụ, giữ nguyên modal và dữ liệu đang nhập (BR29) |
| Mở màn Chi tiết báo giá / màn Yêu cầu báo giá (section báo giá nội bộ đã phát hành) khi có dịch vụ được yêu cầu nhưng chưa được báo giá | Cảnh báo | "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}" | Hiển thị cảnh báo tại nhóm Dịch vụ yêu cầu/Danh sách dịch vụ; không chặn thao tác (BR28) Luôn luôn hiển thị cho đến khi dịch vụ đó có bảng giá |
| Chọn Loại dịch vụ/thuộc tính trong modal Thêm dịch vụ khi Yêu cầu báo giá không có giá trị tương ứng | Thông báo | "Yêu cầu báo giá chưa có giá trị cho trường này" (Đề xuất bổ sung — chờ xác nhận) | Dropdown hiển thị rỗng; không chặn các thao tác khác (BR25) |

### **3.1.5. Tích hợp & Đồng bộ dữ liệu**

*\[Gắn link hoặc hình ảnh biểu đồ ERD mô hình hóa luồng dữ liệu của module\]*

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Yêu cầu báo giá (RFQ) | Nguồn dữ liệu bắt buộc; cung cấp danh sách RFQ chưa gắn báo giá và các thông tin khách hàng, dịch vụ Bổ sung: cung cấp Dịch vụ yêu cầu và các giá trị thuộc tính yêu cầu (Loại xe yêu cầu, Địa điểm làm TTHQ, Địa điểm kho, Loại hình kho, Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa, Địa điểm sang tải, Loại hình sang tải, Điểm đi / Điểm đến) làm nguồn giới hạn cho dropdown trong modal Thêm dịch vụ (BR25) và làm nguồn cho nhóm "Dịch vụ yêu cầu" (BR26). | RFQ → báo giá; báo giá → hiển thị trên Chi tiết Yêu cầu báo giá (hiện khi Đã phát hành, ẩn khi Thu hồi) Yêu cầu báo giá → nhóm Dịch vụ yêu cầu & dropdown thuộc tính của bảng giá dịch vụ; Báo giá → cảnh báo dịch vụ chưa báo giá tại section báo giá nội bộ đã phát hành của Yêu cầu báo giá (BR28). | Khi chọn Yêu cầu báo giá liên quan (RFQ) ở màn Thêm mới/Chỉnh sửa báo giá; khi Phát hành hoặc Thu hồi báo giá | Không còn RFQ khả dụng → danh sách chọn rỗng; Sale đã tạo Báo giá khách hàng → chặn Thu hồi (Updating — cơ chế xác định) Yêu cầu báo giá thiếu giá trị cho trường thuộc tính → dropdown rỗng; dịch vụ được yêu cầu nhưng chưa có bảng giá → cảnh báo, không chặn (BR27, BR28). |
| Cấu hình đầu mục giá | Cung cấp danh sách đầu mục giá (chỉ Loại giá Cố định, Phụ phí) hiển thị trong modal Thêm bảng giá dịch vụ | Đầu mục giá → đầu mục trong bảng giá | Khi chọn Loại dịch vụ trong modal | Đầu mục bị tắt kích hoạt → không hiển thị Đầu mục Loại giá Phát sinh → không hiển thị (BR5) |
| Giá mua định mức | Lấy Giá mua định mức làm căn cứ tính % Lợi nhuận | Giá mua định mức → đầu mục giá (snapshot) | Khi nạp đầu mục giá vào bảng giá | Nguồn đổi → không tự đồng bộ (BR8) |
| Giá bán định mức | Cung cấp danh sách dòng giá để chọn (đã lọc theo đầu mục giá và thuộc tính); cấp Mã giá bán định mức, Đơn vị và Giá bán định mức làm Đơn giá mặc định | Giá bán định mức → dòng giá trong bảng giá | Khi nhấn nút chọn dòng giá trong modal | Nguồn đổi → không tự đồng bộ (BR8) Không có dòng giá phù hợp với bộ lọc → hiển thị danh sách rỗng (Giả định) |
| Báo giá khách hàng | Nguồn ghi nhận tự động Kết quả báo giá (Thành công/Thất bại) cho báo giá nội bộ tham chiếu | Báo giá khách hàng → báo giá nội bộ | Khi Sales cập nhật trạng thái Thành công/Thất bại cho Báo giá khách hàng | Báo giá khách hàng bị hủy hoặc đổi kết quả → xử lý chưa xác định (xem Mục 4\) |
| Chính sách biên lợi nhuận | (Ngoài phạm vi) kiểm tra ràng buộc ngưỡng lợi nhuận | — | — | Chưa liên kết ràng buộc trong giai đoạn này |
| Báo cáo thống kê | Cấp số liệu Tổng báo giá, Đã phát hành, Tỷ lệ chốt (Won) | Báo giá → dashboard/báo cáo | Khi trạng thái báo giá thay đổi | Tỷ lệ chốt chờ chốt công thức (BR15) |

## **3.2. MODULE: Tự động tạo Báo giá nội bộ (Auto-BGNB)**

**Phạm vi mục này:** Engine sinh báo giá nội bộ tự động và các thành phần hiển thị tại menu Quản lý báo giá. Phần thao tác trên màn Chi tiết Yêu cầu báo giá (nút “Lấy tự động BGNB”, chuyển trạng thái Yêu cầu báo giá, hiển thị khối Báo giá nội bộ, tạo Báo giá khách hàng — US\_ABG\_01, US\_ABG\_02, US\_ABG\_03, UC\_ABG\_01) đặc tả tại SRS Quản lý YCBG \+ Báo giá KH.

**Phân biệt Báo giá nội bộ tạo thủ công và tạo tự động:**

| Tiêu chí | Tạo thủ công | Tạo tự động (Auto-BGNB) |
| :---- | :---- | :---- |
| Người thực hiện | Chuyên viên định giá (K2) | Dịch vụ khách hàng (K1) bấm “Lấy tự động BGNB”; hệ thống sinh báo giá |
| Màn hình thao tác | Màn Thêm mới / Chỉnh sửa báo giá (menu Quản lý báo giá) | Màn Chi tiết Yêu cầu báo giá (đặc tả tại SRS Quản lý YCBG \+ Báo giá KH) |
| Trạng thái Yêu cầu báo giá áp dụng | Đang báo giá (US\_QUO\_02 AC2) | Nháp / Chờ báo giá |
| Trạng thái báo giá sau khi tạo | Nháp; phát hành thủ công (US\_QUO\_08) | Đã phát hành |
| Nguồn giá | K2 chọn dòng giá cho từng đầu mục giá; Đơn giá cho phép sửa | Hệ thống tự khớp từ Giá bán định mức (BR-38, BR-39); Đơn giá \= Giá bán định mức |
| Đơn giá của dòng giá | Bắt buộc; còn trống → chặn lưu (BR11, US\_QUO\_02 AC8) | Không chặn; dòng thiếu giá xử lý theo quy tắc thiếu giá 4 cấp (BR-41 → BR-44) |
| Bảng giá bị disable | Không phát sinh | Có (BR-42): không tham gia tổng hợp, ẩn tại màn Chỉnh sửa, không lấy sang Báo giá khách hàng |
| Cảnh báo thiếu bảng giá dịch vụ (BR27) | Áp dụng | Không áp dụng (BR-50) |
| Nguồn tạo / Người tạo / Người phát hành | Thủ công / Người thực hiện / Người thực hiện | Tự động / “Hệ thống” / “Hệ thống” Khi K2 Phát hành lại sau Thu hồi: Nguồn tạo chuyển “Thủ công”; Người tạo giữ “Hệ thống”; Người phát hành \= người thực hiện (BR-45) |
| Cảnh báo khi tạo Báo giá khách hàng | Không áp dụng | Cảnh báo khi còn bảng giá bị disable; chặn khi toàn bộ bảng giá bị disable (đặc tả tại SRS Quản lý YCBG \+ Báo giá KH) |

### **3.2.1. Danh sách User story**

#### **User story US\_ABG\_04: Sinh bảng giá dịch vụ theo tổ hợp thuộc tính \[PHỨC TẠP\]**

| ID US | US\_ABG\_04 |
| :---- | :---- |
| **Tên Story** | Sinh bảng giá dịch vụ theo tổ hợp thuộc tính của Yêu cầu báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống sinh sẵn các bảng giá dịch vụ theo đúng các tổ hợp thuộc tính khách hàng yêu cầu, để không phải khai báo thủ công từng bảng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Báo giá nội bộ – Engine sinh bảng giá tự động |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Với mỗi dịch vụ được tick tại Yêu cầu báo giá, hệ thống sinh bảng giá theo tích Descartes các giá trị thuộc tính tương ứng của loại dịch vụ đó (BR-36). | Bỏ sót dịch vụ được tick; hoặc sinh thiếu tổ hợp so với giá trị đã nhập tại Yêu cầu báo giá. |
| AC2 | Ánh xạ nguồn giá trị thuộc tính theo BR-34: – Chi cục hải quan ← Địa điểm làm TTHQ (KBHQ và HQGS) – Phương thức sang tải ← Loại hình sang tải – Tên kho ← Địa điểm kho; Loại kho ← Loại hình kho – Loại xe ← Loại xe yêu cầu – Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa ← trường cùng tên | Lấy sai trường nguồn (ví dụ lấy Cửa khẩu thay cho Địa điểm làm TTHQ). |
| AC3 | Vận tải: mỗi cặp Điểm đi – Điểm đến giữ nguyên cặp, không mix chéo. Khớp theo Quốc gia / Tỉnh – Thành phố / Phường – Xã với danh mục địa điểm vận tải (BR-35). | Mix chéo điểm đi của cặp này với điểm đến của cặp khác. |
| AC4 | Hệ thống khử trùng giá trị lặp và tổ hợp trùng trước khi sinh; không tồn tại hai bảng giá trùng bộ thuộc tính trong cùng báo giá (kế thừa BR29). | Sinh hai bảng giá cùng Loại dịch vụ và trùng toàn bộ giá trị thuộc tính. |
| AC5 | Mỗi bảng giá được sinh ID theo cấu trúc IQYYMM-XXX (BR12). Tên bảng giá tự sinh theo cấu trúc “{các giá trị thuộc tính nối bằng dấu /}”. | Không sinh ID; hoặc để trống Tên bảng giá (trường bắt buộc). |
| AC6 | Kiểm soát ngưỡng tổ hợp (BR-46): – ≤ 50 tổ hợp: xử lý đồng bộ. – 51 đến 200 tổ hợp: xử lý nền. – \> 200 tổ hợp: chặn và báo lỗi. | Xử lý đồng bộ với số tổ hợp lớn gây treo giao diện; hoặc không chặn khi vượt 200 tổ hợp. |
| AC7 | Tiền tệ của mọi bảng giá tự sinh \= VNĐ và ở chế độ không cho chỉnh sửa. | Sinh bảng giá với tiền tệ khác VNĐ. |

**▸ Use Case chi tiết UC\_ABG\_02 — Sinh tổ hợp bảng giá dịch vụ**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Hệ thống – Auto-BGNB Engine |
| Actor phụ | Menu Quản lý danh mục – danh mục địa điểm vận tải Yêu cầu báo giá – nguồn giá trị thuộc tính |
| Precondition | 1\. Yêu cầu báo giá đã đạt điều kiện thực hiện chức năng Lấy tự động BGNB (SRS Quản lý YCBG \+ Báo giá KH) và đã qua bước kiểm tra dữ liệu đầu vào (BR-32, BR-52). 2\. Danh sách dịch vụ được tick đã xác định. |
| Trigger | Engine được gọi khi K1 bấm “Lấy tự động BGNB” (US\_ABG\_01 — SRS Quản lý YCBG \+ Báo giá KH). |
| Luồng chính (Main flow) | 1\. Đọc danh sách dịch vụ được tick tại Yêu cầu báo giá. 2\. Với mỗi dịch vụ, xác định bộ thuộc tính bắt buộc của loại dịch vụ đó. 3\. Ánh xạ từng thuộc tính về trường nguồn tại Yêu cầu báo giá theo BR-34. 4\. Khử trùng giá trị trong từng tập nguồn. 5\. Sinh tích Descartes các tập giá trị thành danh sách tổ hợp. 6\. Riêng Vận tải: ghép (cặp điểm × loại xe), không mix chéo điểm đi và điểm đến. 7\. Khử trùng tổ hợp và đếm tổng số tổ hợp của toàn báo giá. 8\. Sinh ID và Tên cho từng bảng giá; chuyển sang bước nạp đầu mục giá (UC\_ABG\_03). |
| Luồng thay thế (Alternative) | 6a. Cặp điểm của Yêu cầu báo giá không nằm trong phạm vi danh mục địa điểm vận tải: 6a1. Bảng giá vẫn được sinh nhưng sẽ không khớp được dòng giá ở bước sau. 6a2. Bảng giá rơi vào quy tắc thiếu giá cấp 2 (BR-42). 7a. Tổng số tổ hợp trong khoảng 51 đến 200: engine chuyển sang chế độ xử lý nền (BR-46). |
| Luồng ngoại lệ (Exception) | 3a. Trường nguồn không có giá trị: không phát sinh tại bước này — đã chặn tại bước kiểm tra dữ liệu đầu vào (BR-32). 7b. Tổng số tổ hợp \> 200: engine dừng, trả lỗi vượt ngưỡng, không sinh bảng giá nào. |
| Postcondition | Danh sách bảng giá dịch vụ (chưa có dòng giá) đã sẵn sàng cho bước khớp dòng giá. |
| Business Rules liên quan | BR-32, BR-34, BR-35, BR-36, BR-42, BR-46, BR-52 |

#### **User story US\_ABG\_05: Tự động khớp dòng giá và tính toán tài chính \[PHỨC TẠP\]**

| ID US | US\_ABG\_05 |
| :---- | :---- |
| **Tên Story** | Tự động khớp dòng giá từ Giá bán định mức và tính toán chỉ tiêu tài chính |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống tự khớp dòng giá từ Giá bán định mức và tính sẵn các chỉ tiêu tài chính, để báo giá phản ánh đúng bảng định mức đã thiết lập. |
| **Độ Ưu tiên** | Must have |
| **Module** | Báo giá nội bộ – Engine sinh bảng giá tự động |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Đầu mục giá đưa vào bảng giá phải thỏa: đúng loại dịch vụ; Loại giá thuộc {Cố định, Phụ phí}; đang Kích hoạt. Đầu mục Loại giá “Phát sinh” và đầu mục tắt kích hoạt không xuất hiện (kế thừa BR5). | Bảng giá hiển thị đầu mục Loại giá “Phát sinh” hoặc đầu mục đã tắt kích hoạt. |
| AC2 | Riêng Kho bãi: chỉ nạp đầu mục giá có Loại kho chứa Loại kho của bảng giá đang xử lý (BR-37). | Nạp đầu mục của Loại kho khác vào bảng giá, làm bảng giá bị disable sai. |
| AC3 | Điều kiện khớp dòng Giá bán định mức: cùng đầu mục giá và mọi thuộc tính khớp tuyệt đối hoặc khớp với giá trị “Tất cả” (BR-38). | Khớp nhầm dòng khác đầu mục; hoặc bỏ sót dòng có giá trị “Tất cả”. |
| AC4 | Tie-break khi nhiều dòng cùng khớp, áp dụng đúng thứ tự 3 tầng (BR-39): 1\. Loại bỏ các dòng có Giá bán định mức \= null. 2\. Ưu tiên dòng có độ đặc hiệu cao hơn. Độ đặc hiệu \= số thuộc tính có giá trị cụ thể (khác “Tất cả”); dòng có độ đặc hiệu cao hơn được chọn; bằng nhau thì xét tầng 3\. 3\. Lấy dòng có Giá bán định mức CAO NHẤT. Không phát sinh trường hợp nhiều dòng khớp cùng Đơn vị tính: mỗi dòng Giá bán định mức là kết quả gom các dòng giá mua đầu vào theo một tổ hợp duy nhất Đầu mục giá \+ bộ thuộc tính \+ Đơn vị tính. Không hiển thị icon cảnh báo khi có nhiều dòng cùng khớp. | Lấy dòng có Giá bán định mức thấp nhất; bỏ qua bước loại dòng có Giá bán định mức \= null; hoặc chọn dòng có độ đặc hiệu thấp hơn. |
| AC5 | Bảng giá chứa một đầu mục giá KHÔNG khớp được dòng Giá bán định mức nào, hoặc chỉ khớp đúng 1 dòng Giá bán định mức mà dòng đó không có Giá bán định mức: toàn bộ bảng giá chứa đầu mục giá đó bị disable (BR-42). | Chỉ đánh dấu dòng giá thiếu giá mà vẫn cho sử dụng bảng giá. |
| AC6 | Dòng giá được điền: Mã giá bán định mức, Đơn vị tính, Giá mua định mức, Giá bán định mức; Đơn giá mặc định \= Giá bán định mức (BR7). | Đơn giá không bằng Giá bán định mức; hoặc thiếu Mã giá bán định mức. |
| AC7 | % Lợi nhuận của dòng giá \= (Đơn giá − Giá mua định mức) / Giá mua định mức, hiển thị ở chế độ chỉ đọc (BR6). | Cho nhập tay % Lợi nhuận; hoặc % Lợi nhuận không được tính. |
| AC8 | Giá mua định mức và Giá bán định mức được snapshot tại thời điểm sinh báo giá; thay đổi tại menu nguồn sau đó không tác động ngược (BR-40). | Báo giá đã phát hành tự thay đổi giá khi Giá bán định mức nguồn được cập nhật. |
| AC9 | Tổng đơn giá bảng giá \= Σ Đơn giá các dòng giá. Tổng đơn giá bảng giá \= null khi bảng giá bị disable. Tổng đơn giá dịch vụ \= Σ Tổng đơn giá các bảng giá khả dụng; bảng giá bị disable không tham gia tổng hợp (BR9, BR-42). | Bảng giá disable vẫn có Tổng đơn giá khác null; hoặc vẫn được cộng vào Tổng đơn giá dịch vụ. |
| AC10 | Lợi nhuận dự kiến (%) \= (Σ Đơn giá − Σ Giá mua định mức) / Σ Giá mua định mức, tính trên các bảng giá khả dụng (BR10). | Tính Lợi nhuận dự kiến trên cả bảng giá bị disable hoặc dòng giá thiếu giá. |
| AC11 | Mỗi dòng giá trong bảng giá được hệ thống sinh ID riêng (BR19). | Dòng giá không có ID hoặc ID bị trùng. |

**▸ Use Case chi tiết UC\_ABG\_03 — Khớp dòng giá và tính toán tài chính**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Hệ thống – Auto-BGNB Engine |
| Actor phụ | Menu Cấu hình đầu mục giá Menu Giá mua định mức Menu Giá bán định mức |
| Precondition | Danh sách bảng giá (chưa có dòng giá) đã được sinh từ UC\_ABG\_02. |
| Trigger | Kết thúc bước sinh tổ hợp bảng giá. |
| Luồng chính (Main flow) | 1\. Với mỗi bảng giá, lấy danh sách đầu mục giá hợp lệ theo loại dịch vụ. 2\. Với Kho bãi, lọc thêm đầu mục theo Loại kho của bảng giá. 3\. Với mỗi đầu mục, truy vấn Giá bán định mức theo đầu mục và bộ thuộc tính (chấp nhận giá trị “Tất cả”). 4\. Loại bỏ các dòng có Giá bán định mức \= null. 5\. Áp dụng tie-break: độ đặc hiệu (số thuộc tính có giá trị cụ thể) → lấy dòng có Giá bán định mức cao nhất. 6\. Điền dữ liệu dòng giá; đặt Đơn giá \= Giá bán định mức; tính % Lợi nhuận; snapshot giá. 7\. Tính Tổng đơn giá của bảng giá; bảng giá bị disable có Tổng đơn giá \= null. 8\. Tính Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%) trên các bảng giá khả dụng. |
| Luồng thay thế (Alternative) | 3a. Chỉ có dòng giá trị “Tất cả” khớp: hệ thống chọn dòng đó và tiếp tục tại bước 6\. 5a. Nhiều dòng khớp (các dòng luôn khác Đơn vị tính): hệ thống chọn theo tầng 2 rồi tầng 3 (BR-39); không hiển thị icon cảnh báo. |
| Luồng ngoại lệ (Exception) | 1a. Loại dịch vụ không có đầu mục giá nào đang kích hoạt: bảng giá không có dòng giá nào → bảng giá bị disable (BR-42); toàn bộ bảng giá của dịch vụ rơi vào quy tắc cấp 3 (BR-43). 2a. Kho bãi không có đầu mục giá nào phù hợp Loại kho của bảng giá: bảng giá không có dòng giá nào → bảng giá bị disable (BR-42). 3b. Không có dòng Giá bán định mức nào khớp: dòng giá rơi vào quy tắc thiếu giá cấp 1 và bảng giá chứa dòng đó bị disable (BR-41, BR-42). 4a. Toàn bộ dòng khớp đều có Giá bán định mức \= null: xử lý như 3b. 4b. Giá mua định mức của dòng \= null (kéo theo Giá bán định mức \= null theo BR12 — SRS Giá bán định mức): xử lý như 3b. |
| Postcondition | Mỗi bảng giá có đầy đủ dòng giá (có giá hoặc gắn nhãn thiếu giá). Mỗi bảng giá được xác định trạng thái khả dụng hoặc disable. |
| Business Rules liên quan | BR-37, BR-38, BR-39, BR-40, BR-41, BR-42, BR-43 |

#### **User story US\_ABG\_06: Hiển thị và xử lý bảng giá thiếu Giá bán định mức**

| ID US | US\_ABG\_06 |
| :---- | :---- |
| **Tên Story** | Hiển thị và xử lý bảng giá thiếu Giá bán định mức theo 4 cấp |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống chỉ rõ dòng giá / bảng giá / dịch vụ nào không có giá, để biết chính xác phần nào của báo giá không sử dụng được và xử lý bổ sung. |
| **Độ Ưu tiên** | Must have |
| **Module** | Báo giá nội bộ – Engine sinh bảng giá tự động |
| **Người Phụ trách (Owner)** | Trang BA |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Cấp 1 – Dòng giá: dòng không khớp được dòng Giá bán định mức nào, hoặc dòng khớp có Giá bán định mức \= null. Xử lý: vẫn hiển thị dòng, các ô giá để trống, gắn badge xám “Chưa có giá định mức”; dòng không tham gia tổng hợp (BR-41). | Ẩn dòng giá thiếu giá; hoặc dòng thiếu giá vẫn được cộng vào Tổng đơn giá. |
| AC2 | Cấp 2 – Bảng giá: bảng có ≥ 1 dòng thuộc AC1, kể cả khi dòng đó thuộc đầu mục Loại giá “Phụ phí”; hoặc bảng giá không có dòng giá nào. Xử lý: disable toàn bộ bảng giá, hiển thị chú thích “Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức”; Tổng đơn giá của bảng \= null và không tính vào báo giá (BR-42). | Chỉ disable dòng thiếu giá mà vẫn cho sử dụng bảng giá; bỏ qua dòng Phụ phí khi xét disable; hoặc bảng giá không có dòng giá nào vẫn được coi là khả dụng. |
| AC3 | Cấp 3 – Loại dịch vụ: toàn bộ bảng giá của một loại dịch vụ bị disable, hoặc loại dịch vụ không có đầu mục giá nào đang kích hoạt. Xử lý: hiển thị banner “Doanh nghiệp không cung ứng dịch vụ này” tại tab loại dịch vụ (BR-43). | Không hiển thị banner khi toàn bộ bảng giá của dịch vụ bị disable. |
| AC4 | Cấp 4 – Báo giá: không còn bảng giá khả dụng nào trong toàn bộ báo giá. Xử lý: chặn tạo báo giá và báo lỗi (BR-44). | Vẫn tạo và phát hành báo giá không có dòng giá hợp lệ nào. |
| AC5 | Badge cấp 1 có tooltip nêu nguyên nhân: “Chưa có nhà thầu cung ứng” (không tồn tại dòng định mức) hoặc “Chưa thiết lập giá bán định mức” (dòng tồn tại nhưng Giá bán định mức \= null). | Gộp hai nguyên nhân làm một, người dùng không biết xử lý ở menu nào. |
| AC6 | Nhãn “Doanh nghiệp không cung ứng dịch vụ này” (cấp 3\) tồn tại song song và độc lập với cảnh báo “Dịch vụ chưa được báo giá” của BR28; hai nhãn dùng cho hai ngữ cảnh khác nhau (BR-50). | Thay thế hoặc gộp hai nhãn làm một. |
| AC7 | Bảng giá bị disable KHÔNG xuất hiện trong màn Chỉnh sửa báo giá. Khi Lưu chỉnh sửa báo giá, bảng giá bị disable được giữ nguyên (không bị xóa), trừ trường hợp bị ghi đè. Bảng giá bị disable bị ghi đè khi có bảng giá trùng bộ thông tin thuộc tính được tạo thêm; việc ghi đè thực hiện khi Lưu báo giá (BR29). Bảng giá bị disable KHÔNG được lấy khi tạo Báo giá khách hàng. | Bảng giá disable vẫn hiển thị tại màn Chỉnh sửa báo giá; bị xóa khi Lưu chỉnh sửa; được đưa vào Báo giá khách hàng; hoặc chặn tạo bảng giá mới trùng bộ thuộc tính với bảng giá disable. |

### **3.2.2. Mô tả giao diện**

Link UI Design: \[Chèn link\]. Màn hình liên quan: Thêm mới / Chỉnh sửa / Chi tiết Báo giá nội bộ — bổ sung trường Nguồn tạo và các thành phần cảnh báo thiếu giá.

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Nguồn tạo |  | Enum (chỉ đọc) | — | Tự động | Tự động / Thủ công; hiển thị tại nhóm Thông tin phát hành báo giá. Báo giá tự động được K2 Phát hành lại sau Thu hồi: chuyển từ “Tự động” sang “Thủ công” (BR-45) |
| Người tạo |  | Text (chỉ đọc) | — | Hệ thống | Báo giá tự động ghi giá trị “Hệ thống”; giữ nguyên khi K2 Phát hành lại |
| Người phát hành |  | Text (chỉ đọc) | — | Hệ thống | Báo giá tự động ghi giá trị “Hệ thống”; khi K2 Phát hành lại sau Thu hồi \= người thực hiện (US\_QUO\_08 AC3) |
| Tên báo giá | v | Text | 200 | (Tự sinh) | “BGNB tự động – {Mã RFQ} – {Tên khách hàng}”; đảm bảo không trùng vì Mã RFQ là duy nhất |
| Thời hạn hiệu lực | v | Date | — | (Tự sinh) | Ngày tạo \+ N ngày; N là tham số cấu hình hệ thống, mặc định 7 |
| Tên bảng giá dịch vụ | v | Text | 200 | (Tự sinh) | “{các giá trị thuộc tính nối bằng dấu /}” |
| Tổng đơn giá bảng giá |  | Number (chỉ đọc) | — | (Tự tính) | \= Σ Đơn giá các dòng giá; \= null khi bảng giá bị disable |
| Badge “Chưa có giá định mức” |  | Badge (chỉ đọc) | — | (Ẩn) | Gắn tại dòng giá thiếu Giá bán định mức — quy tắc cấp 1; tooltip nêu nguyên nhân (US\_ABG\_06 AC5) |
| Chú thích bảng giá disable |  | Text (chỉ đọc) | — | (Ẩn) | “Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức” — cấp 2 |
| Banner loại dịch vụ |  | Text (chỉ đọc) | — | (Ẩn) | “Doanh nghiệp không cung ứng dịch vụ này” — cấp 3 |
| Đơn vị tính (cột trong bảng giá) |  | Text (chỉ đọc) | — | (Theo dòng giá) | Lấy từ dòng Giá bán định mức, KHÔNG lấy từ đầu mục giá (xem Bảng 3\) |

### **3.2.3. Quy tắc nghiệp vụ (Business Rule)**

*Mã BR đánh số tiếp nối từ BR30; giữ nguyên số hiệu theo SRS Tự động tạo Báo giá nội bộ. BR-31, BR-33, BR-48 đặc tả tại SRS Quản lý YCBG \+ Báo giá KH.*

| ID | Quy tắc |
| :---- | :---- |
| BR-32 | Trước khi sinh bảng giá, hệ thống kiểm tra thuộc tính nguồn phục vụ phép mix của từng dịch vụ được tick tại Yêu cầu báo giá (theo bảng ánh xạ BR-34, BR-35): Địa điểm làm TTHQ (KBHQ, HQGS), Địa điểm kho, Loại hình kho, Địa điểm sang tải, Loại hình sang tải, Loại xe yêu cầu, Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa và cặp Điểm đi – Điểm đến (Vận tải). Do các thuộc tính nguồn không bắt buộc khi lưu Yêu cầu báo giá ở trạng thái Nháp, nếu một dịch vụ được tick thiếu giá trị ở bất kỳ thuộc tính nguồn nào, hệ thống chặn tạo báo giá tự động và báo lỗi kèm danh sách {Loại dịch vụ – Tên trường} còn thiếu; không sinh bản ghi báo giá nội bộ, Yêu cầu báo giá giữ nguyên trạng thái. |
| BR-34 | Bảng ánh xạ nguồn giá trị thuộc tính (thống nhất với BR25) — Chi cục hải quan ← Địa điểm làm TTHQ (áp dụng cho cả Khai báo hải quan và Hải quan giám sát); Phương thức sang tải ← Loại hình sang tải; Tên kho ← Địa điểm kho; Loại kho ← Loại hình kho; Loại xe ← Loại xe yêu cầu; Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa ← trường cùng tên tại Yêu cầu báo giá. |
| BR-35 | Vận tải — Điểm đi và Điểm đến lấy từ các cặp điểm của Yêu cầu báo giá, giữ nguyên cặp và không mix chéo; hệ thống khớp theo Quốc gia / Tỉnh – Thành phố / Phường – Xã của điểm đi, điểm đến với phạm vi đã quy định trong danh mục địa điểm vận tải. |
| BR-36 | Mỗi tổ hợp giá trị thuộc tính sinh đúng 1 bảng giá dịch vụ; hệ thống khử trùng giá trị lặp trong từng tập nguồn và khử trùng tổ hợp trước khi sinh, đảm bảo không tồn tại hai bảng giá trùng bộ thuộc tính (kế thừa BR29). |
| BR-37 | Đầu mục giá đưa vào bảng giá tự sinh phải đúng loại dịch vụ, có Loại giá thuộc {Cố định, Phụ phí} và đang Kích hoạt. Riêng phân hệ Kho bãi, đầu mục giá còn phải có Loại kho chứa Loại kho của bảng giá đang xử lý (theo BR11 — SRS Cấu hình đầu mục giá). |
| BR-38 | Điều kiện khớp một dòng Giá bán định mức với cặp (bảng giá, đầu mục giá): cùng loại dịch vụ, cùng đầu mục giá, và với mọi thuộc tính của loại dịch vụ thì giá trị của dòng định mức bằng giá trị của bảng giá hoặc bằng “Tất cả”. |
| BR-39 | Tie-break khi nhiều dòng Giá bán định mức cùng khớp, áp dụng theo đúng thứ tự 3 tầng: (1) loại bỏ dòng có Giá bán định mức \= null; (2) ưu tiên dòng có độ đặc hiệu cao hơn — độ đặc hiệu \= số thuộc tính có giá trị cụ thể (khác “Tất cả”), dòng có độ đặc hiệu cao hơn được chọn, bằng nhau thì xét tầng (3); (3) lấy dòng có Giá bán định mức CAO NHẤT. Không phát sinh trường hợp nhiều dòng khớp cùng Đơn vị tính, vì mỗi dòng Giá bán định mức là kết quả gom các dòng giá mua đầu vào theo một tổ hợp duy nhất Đầu mục giá \+ bộ thuộc tính \+ Đơn vị tính (BR2 — SRS Giá mua định mức). Hệ thống không hiển thị icon cảnh báo khi có nhiều dòng cùng khớp. |
| BR-40 | Đơn giá của dòng giá mặc định bằng Giá bán định mức; % Lợi nhuận \= (Đơn giá − Giá mua định mức) / Giá mua định mức. Giá mua định mức và Giá bán định mức được snapshot tại thời điểm sinh báo giá và không tự đồng bộ khi nguồn thay đổi (chốt lại BR8; cần cập nhật mục 3.1.5 SRS Cấu hình đầu mục giá đang ghi “tham chiếu động, không snapshot”). |
| BR-41 | Quy tắc thiếu giá cấp 1 — Dòng giá không khớp được dòng Giá bán định mức nào, hoặc dòng khớp có Giá bán định mức \= null: dòng vẫn hiển thị, các ô giá để trống, gắn badge xám “Chưa có giá định mức” và không tham gia các chỉ tiêu tổng hợp. |
| BR-42 | Quy tắc thiếu giá cấp 2 — Bảng giá có tối thiểu 1 dòng thuộc BR-41 (kể cả dòng thuộc đầu mục Loại giá “Phụ phí”), hoặc bảng giá không có dòng giá nào (loại dịch vụ không có đầu mục giá đang kích hoạt, hoặc Kho bãi không có đầu mục giá phù hợp Loại kho): toàn bộ bảng giá chuyển trạng thái disable và hiển thị chú thích “Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức”. Bảng giá bị disable có Tổng đơn giá \= null, không tham gia Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (ngoại lệ của BR9, BR10), không xuất hiện trong màn Chỉnh sửa báo giá, được giữ nguyên khi Lưu chỉnh sửa báo giá, bị ghi đè khi Lưu báo giá có bảng giá trùng bộ thuộc tính được tạo thêm (BR29), và không được lấy khi tạo Báo giá khách hàng. |
| BR-43 | Quy tắc thiếu giá cấp 3 — Toàn bộ bảng giá của một loại dịch vụ bị disable, hoặc loại dịch vụ đó không có đầu mục giá nào đang kích hoạt: hiển thị banner “Doanh nghiệp không cung ứng dịch vụ này” tại tab loại dịch vụ. |
| BR-44 | Quy tắc thiếu giá cấp 4 — Toàn bộ báo giá không còn bảng giá khả dụng nào: hệ thống chặn tạo báo giá tự động và báo lỗi; Yêu cầu báo giá giữ nguyên trạng thái để tiếp tục luồng thủ công (giữ nguyên điều kiện phát hành của BR14; bảng giá bị disable không được tính là dòng giá hợp lệ). |
| BR-45 | Báo giá nội bộ tạo tự động có: Nguồn tạo \= “Tự động”; Người tạo \= Người phát hành \= “Hệ thống”; Mã báo giá theo BR11; Tên báo giá và Thời hạn hiệu lực tự sinh; Tên bảng giá dịch vụ tự sinh theo cấu trúc “{các giá trị thuộc tính nối bằng dấu /}”; Đơn vị tiền tệ \= VNĐ. Khi Chuyên viên định giá Phát hành lại báo giá tự động sau khi Thu hồi: Nguồn tạo chuyển từ “Tự động” sang “Thủ công”; Người tạo giữ “Hệ thống”; Người phát hành \= người thực hiện. |
| BR-46 | Ngưỡng kiểm soát tổ hợp — ≤ 50 tổ hợp: xử lý đồng bộ; từ 51 đến 200 tổ hợp: xử lý nền và thông báo khi hoàn tất; \> 200 tổ hợp: chặn và yêu cầu tạo báo giá thủ công. Dữ liệu đầu vào được chốt tại thời điểm bấm “Lấy tự động BGNB”. Trong thời gian xử lý nền, hệ thống không khóa các thao tác trên Yêu cầu báo giá; khi job hoàn tất mà Yêu cầu báo giá đã thay đổi trạng thái, hệ thống hủy kết quả, không tạo báo giá nội bộ và gửi thông báo thất bại. |
| BR-47 | Toàn bộ quá trình sinh báo giá tự động chạy trong một transaction; lỗi giữa chừng phải rollback hoàn toàn, không để lại báo giá dở dang chiếm liên kết 1-1 với Yêu cầu báo giá (BR1). Thông báo kết quả tạo tự động (thành công hoặc thất bại, cả xử lý đồng bộ và xử lý nền) chỉ gửi cho người dùng đã bấm “Lấy tự động BGNB”. |
| BR-49 | Thu hồi và chỉnh sửa báo giá tự động áp dụng nguyên các quy tắc hiện hành của SRS này (US\_QUO\_11, US\_QUO\_03, BR21, BR22); sau khi Thu hồi, Yêu cầu báo giá chuyển “Đang báo giá” (US\_QUO\_11 AC4). Thu hồi bị chặn khi Dịch vụ khách hàng đã tạo Báo giá khách hàng (AC5 — US\_BG\_09). |
| BR-50 | BR27 (cảnh báo soft khi thiếu bảng giá dịch vụ) KHÔNG áp dụng cho luồng tạo tự động, chỉ áp dụng cho luồng tạo báo giá thủ công của K2; BR28 (cảnh báo “Dịch vụ chưa được báo giá”) giữ nguyên và tồn tại song song, độc lập với nhãn “Doanh nghiệp không cung ứng dịch vụ này” của BR-43. |
| BR-52 | Chỉ áp dụng cho luồng tạo tự động. Trước khi sinh bảng giá, hệ thống kiểm tra các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động: Tên báo giá, Mã yêu cầu báo giá liên quan, Thời hạn hiệu lực, Khách hàng, Hạng khách hàng, Đơn vị tiền tệ, Loại dịch vụ, Tên bảng giá dịch vụ. Nếu một trong các trường không có dữ liệu, hệ thống DỪNG luồng tạo tự động và báo lỗi “Không đủ thông tin để tạo tự động báo giá nội bộ”; không sinh bản ghi báo giá và Yêu cầu báo giá giữ nguyên trạng thái. Đơn giá trống của dòng giá không thuộc phạm vi kiểm tra này — xử lý theo quy tắc thiếu giá 4 cấp (BR-41 → BR-44). |
| BR-53 | Chỉ thao tác tạo báo giá tự động THÀNH CÔNG được ghi vào Lịch sử hoạt động của Yêu cầu báo giá và của báo giá; các lần chạy thất bại không được ghi nhận vào Lịch sử hoạt động (chỉ ghi log hệ thống). |

### **3.2.4. Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Dịch vụ được tick tại Yêu cầu báo giá thiếu giá trị thuộc tính nguồn | Lỗi | “Yêu cầu báo giá chưa đủ thông tin để tạo tự động báo giá nội bộ: {Loại dịch vụ – Tên trường}, …” | Chặn tạo báo giá tự động Không sinh bản ghi báo giá nội bộ Yêu cầu báo giá giữ nguyên trạng thái (BR-32) |
| Một trong các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động không có dữ liệu | Lỗi | “Không đủ thông tin để tạo tự động báo giá nội bộ” | Dừng luồng tạo báo giá tự động Không sinh bản ghi báo giá nội bộ Yêu cầu báo giá giữ nguyên trạng thái (BR-52) |
| Tạo báo giá tự động thành công | Thành công | “Đã tạo tự động báo giá nội bộ {Mã báo giá}” | Báo giá ở trạng thái “Đã phát hành” Yêu cầu báo giá chuyển “Đã có báo giá” (SRS Quản lý YCBG \+ Báo giá KH) Gửi thông báo cho người bấm “Lấy tự động BGNB” (BR-47) Ghi Lịch sử hoạt động (BR-53) |
| Tổng số tổ hợp bảng giá từ 51 đến 200 | Thông tin | “Đang tạo báo giá tự động, hệ thống sẽ thông báo khi hoàn tất” | Chuyển sang xử lý nền Dữ liệu đầu vào chốt tại thời điểm bấm nút; không khóa thao tác trên Yêu cầu báo giá (BR-46) |
| Tổng số tổ hợp bảng giá vượt 200 | Lỗi | “Yêu cầu báo giá có phạm vi quá lớn ({n} tổ hợp). Vui lòng gửi sang Pricing để tạo báo giá thủ công” | Chặn tạo báo giá Yêu cầu báo giá giữ nguyên trạng thái |
| Không còn bảng giá khả dụng nào | Lỗi | “Không đủ dữ liệu giá bán định mức để tạo báo giá tự động. Vui lòng gửi yêu cầu sang Pricing” | Chặn tạo báo giá Không sinh bản ghi báo giá nội bộ Yêu cầu báo giá giữ nguyên trạng thái (BR-44) |
| Job tạo báo giá lỗi giữa chừng | Lỗi | “Tạo báo giá tự động thất bại. Vui lòng thử lại hoặc gửi yêu cầu sang Pricing” | Rollback toàn bộ Không lưu báo giá dở dang Ghi log và gửi thông báo cho người bấm “Lấy tự động BGNB” (BR-47) |
| Job xử lý nền hoàn tất khi Yêu cầu báo giá đã thay đổi trạng thái | Lỗi | “Tạo báo giá tự động không thành công do Yêu cầu báo giá {Mã RFQ} đã thay đổi trạng thái” | Hủy kết quả, không tạo báo giá nội bộ Gửi thông báo cho người bấm “Lấy tự động BGNB” (BR-46) |
| Dòng giá không khớp được Giá bán định mức, hoặc dòng khớp có giá bán \= null | Cảnh báo | “Chưa có giá định mức” | Badge xám tại dòng giá Các ô giá để trống Dòng không tham gia tổng hợp Disable toàn bộ bảng giá chứa dòng đó |
| Bảng giá có ≥ 1 dòng thiếu giá, hoặc bảng giá không có dòng giá nào | Cảnh báo | “Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức” | Disable toàn bộ bảng giá Tổng đơn giá của bảng \= null Không hiển thị tại màn Chỉnh sửa báo giá; giữ nguyên khi Lưu chỉnh sửa Không được lấy khi tạo Báo giá khách hàng |
| Toàn bộ bảng giá của một loại dịch vụ bị disable | Cảnh báo | “Doanh nghiệp không cung ứng dịch vụ này” | Hiển thị banner tại tab loại dịch vụ Không chặn các thao tác khác |
| Phát hành báo giá khi chưa có dòng giá hợp lệ nào | Lỗi | “Báo giá phải có tối thiểu 1 dòng giá trước khi phát hành” | Chặn phát hành (BR14) |
| Thu hồi báo giá tự động khi K1 đã tạo Báo giá khách hàng | Lỗi | “Không thể thu hồi báo giá ở trạng thái này” | Chặn thao tác thu hồi Ẩn hoặc disable nút Thu hồi |

### **3.2.5. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Yêu cầu báo giá (RFQ) | Cung cấp dịch vụ yêu cầu và giá trị thuộc tính làm đầu vào cho phép mix | Yêu cầu báo giá → Auto-BGNB Engine | Khi K1 bấm “Lấy tự động BGNB” (US\_ABG\_01 — SRS Quản lý YCBG \+ Báo giá KH) | Thiếu thuộc tính nguồn → chặn tạo, báo lỗi (BR-32) Dữ liệu chốt tại thời điểm bấm nút; Yêu cầu báo giá đổi trạng thái trong khi xử lý nền → hủy kết quả (BR-46) |
| Cấu hình đầu mục giá | Cung cấp danh sách đầu mục giá và Loại kho gắn với đầu mục (phân hệ Kho bãi) | Cấu hình đầu mục giá → Auto-BGNB Engine | Khi nạp đầu mục cho từng bảng giá | Đầu mục tắt kích hoạt hoặc Loại giá “Phát sinh” → không nạp Không có đầu mục phù hợp → bảng giá không có dòng giá → disable (BR-42) |
| Giá bán định mức | Cung cấp dòng giá để khớp: Mã giá bán định mức, Đơn vị tính, Giá bán định mức | Giá bán định mức → dòng giá trong bảng giá | Khi khớp dòng giá cho từng đầu mục | Không có dòng khớp hoặc giá bán \= null → quy tắc cấp 1 và disable bảng giá (BR-41, BR-42) |
| Giá mua định mức | Cung cấp Giá mua định mức làm căn cứ tính % Lợi nhuận | Giá mua định mức → dòng giá (snapshot) | Khi điền dữ liệu dòng giá | Giá mua định mức \= null kéo theo giá bán \= null → quy tắc cấp 1 |
| Quản lý danh mục | Cung cấp danh mục địa điểm vận tải để đối chiếu cặp Điểm đi – Điểm đến | Quản lý danh mục → Auto-BGNB Engine | Khi sinh bảng giá dịch vụ Vận tải | Cặp điểm ngoài phạm vi danh mục → không khớp dòng giá → quy tắc cấp 2 |
| Hệ thống thông báo (chuông \+ email) | Thông báo kết quả tạo báo giá tự động | Auto-BGNB Engine → người bấm “Lấy tự động BGNB” | Khi tạo báo giá thành công hoặc thất bại | Gửi thông báo thất bại → ghi log, không ảnh hưởng kết quả tạo báo giá |
| Báo giá khách hàng | Nhận báo giá nội bộ tự động làm nguồn tạo báo giá gửi khách hàng | Báo giá nội bộ → Báo giá khách hàng | Khi K1 bấm “Tạo báo giá khách hàng” (SRS Quản lý YCBG \+ Báo giá KH) | Bảng giá bị disable không được lấy sang Báo giá khách hàng (BR-42) |

# **4\. Đánh giá độ phủ rule (Case còn thiếu)**

Các điểm dưới đây là những case còn để (Giả định), còn ghi Updating hoặc còn mâu thuẫn giữa các nguồn; cần rà soát/xác nhận trước khi phát triển.

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| :---- | :---- | :---- | :---- |
| Luồng phê duyệt báo giá | Đã chốt đầy đủ 7 trạng thái trong vòng đời, bao gồm Từ chối (BR2) | Chưa đặc tả: ai trình duyệt, ai phê duyệt, điều kiện chuyển trạng thái, và điều kiện/luồng để báo giá chuyển sang Từ chối | Bổ sung user story và quy tắc cho luồng trình duyệt – phê duyệt – từ chối |
| Hết hiệu lực áp dụng cho mọi trạng thái | Đã chốt: quá Thời hạn hiệu lực tự chuyển Hết hiệu lực bất kể trạng thái (BR2), bao gồm cả trạng thái Thu hồi mới bổ sung (không có ngoại lệ) | Chưa rõ xử lý với báo giá đã có Kết quả Thành công: có tiếp tục chuyển Hết hiệu lực không, và báo giá Nháp quá hạn có còn chỉnh sửa được không | Chốt ngoại lệ áp dụng quy tắc Hết hiệu lực và hành vi với báo giá Nháp quá hạn |
| Đồng bộ Kết quả báo giá | Đã chốt cơ chế tự động ghi nhận từ Báo giá khách hàng (BR20), đã làm rõ: ghi nhận không phụ thuộc trạng thái báo giá nội bộ | Chưa rõ: xử lý khi Báo giá khách hàng bị hủy hoặc đổi kết quả sau khi đã ghi nhận; trường hợp một báo giá nội bộ có nhiều Báo giá khách hàng | Bổ sung quy tắc cập nhật lại/hoàn tác Kết quả báo giá và quan hệ số lượng giữa hai loại báo giá |
| Giải phóng Yêu cầu báo giá khi xóa báo giá | Đang để (Giả định) tại US\_QUO\_10 AC3 | Chưa chốt: RFQ có được chọn lại sau khi báo giá gắn với nó bị xóa hay không | Xác nhận quy tắc giải phóng RFQ khi báo giá bị xóa |
| Bắt buộc chọn dòng giá cho đầu mục | Đang để (Giả định) tối thiểu một dòng giá (US\_QUO\_04 AC8) | Chưa rõ: bắt buộc chọn cho toàn bộ đầu mục hay chỉ tối thiểu một; xử lý khi không có dòng giá phù hợp; có cho bỏ chọn/đổi dòng giá đã chọn không | Chốt quy tắc bắt buộc chọn dòng giá và hành vi khi danh sách lọc rỗng |
| Đổi Yêu cầu báo giá khi chỉnh sửa | Cho phép đổi RFQ ở màn Chỉnh sửa (US\_QUO\_03 AC4 – Giả định) | Chưa rõ ảnh hưởng tới các bảng giá đã tạo theo RFQ cũ (giữ nguyên, cảnh báo, hay xóa để dựng lại) | Chốt hành vi khi đổi RFQ trên báo giá đã có bảng giá |
| Phạm vi ghi nhận Lịch sử hoạt động | Đã xác định 4 cột hiển thị và nguyên tắc ghi nhận (BR17) | Chưa chốt danh mục Hành động; mức chi tiết của cột Nội dung; quy tắc sắp xếp và phân trang | Bổ sung danh mục Hành động chuẩn và mẫu nội dung ghi nhận cho từng loại thao tác |
| Quy tắc sinh ID bảng giá và ID dòng giá | Đã chốt do hệ thống tự sinh (BR12, BR19) | Chưa có cấu trúc/định dạng cụ thể của ID bảng giá và ID dòng giá | Bổ sung quy tắc sinh ID cho bảng giá dịch vụ và dòng giá |
| Bộ thuộc tính theo loại dịch vụ | Đã xác định là điều kiện lọc dòng giá và bắt buộc nhập đầy đủ | Chưa định nghĩa danh sách thuộc tính cụ thể cho từng loại trong 5 loại dịch vụ | Bổ sung bảng ánh xạ Loại dịch vụ ↔ danh sách thuộc tính |
| Công thức Tỷ lệ chốt (Won) | Updating — chưa chốt (BR15) | Chưa xác định tử số/mẫu số và phạm vi thống kê (theo kỳ, theo khách hàng…) | Chốt định nghĩa Tỷ lệ chốt trước khi phát triển chỉ số |
| Thuế suất VAT | Không còn trường nhập VAT trong màn báo giá | Chỉ tiêu ghi “chưa bao gồm VAT” nhưng không có nơi khai báo VAT → chưa rõ cách tính giá đã bao gồm VAT | Xác nhận: VAT được quản lý ở module khác, hay cần bổ sung lại trường VAT |
| Lợi nhuận âm | Chưa có chính sách | Chưa quy định xử lý khi Đơn giá nhỏ hơn Giá mua định mức | Chốt: chặn cứng hay chỉ cảnh báo khi lợi nhuận âm |
| Luồng phê duyệt ngoại lệ | Ngoài phạm vi (BR16) | Ngưỡng kích hoạt “Chờ duyệt ngoại lệ” và vai trò phê duyệt chưa định nghĩa | Đặc tả luồng phê duyệt ngoại lệ ở phiên bản sau |

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification – SRS)*

*Mô hình Hybrid: User Story (xương sống) \+ Use Case chi tiết (cho story phức tạp)*

| Tên hệ thống | LogXPro – Module Quản lý báo giá – Chức năng Tự động tạo Báo giá nội bộ (Auto-BGNB) |
| :---- | :---- |
| Link UI Design | \[Chèn link UI Design\] |
| Người lập | Trang BA |
| Ngày tạo | 09/09/2026 |
| Ngày cập nhật | 10/09/2026 |
| Phiên bản | v1.1 – SRS bổ sung cho SRS\_LogXPro\_Quản lý báo giá (Báo giá nội bộ) và SRS\_LogXPro\_Quản lý YCBG \+ Báo giá KH |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Chức năng Tự động tạo Báo giá nội bộ (Auto-BGNB) cho phép hệ thống tự sinh và phát hành một báo giá nội bộ hoàn chỉnh từ dữ liệu của Yêu cầu báo giá (RFQ), thay cho việc Chuyên viên định giá dựng thủ công từng bảng giá.

Hệ thống mix các giá trị thuộc tính đã nhập tại Yêu cầu báo giá thành các bảng giá dịch vụ, tự khớp dòng giá từ Giá bán định mức và tính sẵn các chỉ tiêu tài chính.

Mục tiêu: rút ngắn thời gian phản hồi khách hàng từ hàng giờ xuống vài giây, đồng thời chuẩn hóa giá chào theo đúng bảng Giá bán định mức đã thiết lập.

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Nút "Lấy tự động BGNB" trên màn Chi tiết Yêu cầu báo giá (vai trò Dịch vụ khách hàng – K1), áp dụng cho phiếu ở trạng thái Nháp và Chờ báo giá.

* Lấy báo giá trực tiếp từ bảng Giá bán định mức, không cần bộ phận Định giá (K2) tiếp nhận và dựng giá thủ công.

* Kiểm tra các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động; dừng luồng và báo lỗi khi thiếu dữ liệu.

* Sinh bảng giá dịch vụ theo tổ hợp (mix) các giá trị thuộc tính đã nhập tại Yêu cầu báo giá, cho 5 loại dịch vụ.

* Tự động khớp và chọn dòng giá từ Giá bán định mức theo đầu mục giá và bộ thuộc tính.

* Tự động tính Đơn giá, % Lợi nhuận, Tổng đơn giá bảng giá, Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%).

* Quy tắc xử lý thiếu Giá bán định mức theo 4 cấp: dòng giá / bảng giá / loại dịch vụ / báo giá.

* Phát hành báo giá ở trạng thái "Đã phát hành" và chuyển Yêu cầu báo giá sang "Đã có báo giá".

* Ngưỡng kiểm soát số lượng tổ hợp và cơ chế xử lý nền.

* Ghi nhận Lịch sử hoạt động cho thao tác tạo tự động thành công.

**Ngoài phạm vi (Out-of-scope):**

* Tạo/sửa/xóa Yêu cầu báo giá — thuộc SRS Quản lý YCBG \+ Báo giá KH.

* Tạo báo giá nội bộ thủ công (US\_QUO\_02 đến US\_QUO\_06) — giữ nguyên theo SRS Báo giá nội bộ hiện hành.

* Thu hồi và chỉnh sửa báo giá nội bộ — đã đặc tả tại US\_QUO\_11 và US\_QUO\_03 của SRS Báo giá nội bộ, không lặp lại trong tài liệu này.

* Ghi nhận các lần chạy tự động thất bại vào Lịch sử hoạt động — không triển khai.

* Luồng trình duyệt – phê duyệt – từ chối báo giá và luồng phê duyệt ngoại lệ — chưa triển khai.

* Thiết lập Giá mua định mức và Giá bán định mức — thuộc các menu tương ứng.

* Tạo Báo giá khách hàng từ báo giá nội bộ — giữ nguyên US\_BG\_09.

* Công thức Tỷ lệ chốt (Won) — giữ nguyên trạng thái Updating theo BR15.

* Quy đổi đa tiền tệ — báo giá nội bộ mặc định VNĐ.

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

*\[Chèn hình ảnh sơ đồ BPMN/Flowchart — xuất từ file LogX\_StateDiagram\_TuDongTaoBaoGiaNoiBo\_20260909.drawio\]*

**Mô tả luồng chính:**

K1 mở Yêu cầu báo giá (Nháp / Chờ báo giá) → bấm "Lấy tự động BGNB" → hệ thống kiểm tra trường bắt buộc → mix tổ hợp thuộc tính theo từng dịch vụ được yêu cầu → nạp đầu mục giá → khớp dòng Giá bán định mức → áp dụng quy tắc thiếu giá 4 cấp → nếu còn ≥ 1 bảng giá khả dụng: tạo và phát hành báo giá nội bộ, Yêu cầu báo giá chuyển "Đã có báo giá"; nếu không: chặn và báo lỗi, Yêu cầu báo giá giữ nguyên trạng thái.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Khởi phát | Dịch vụ khách hàng (K1) | Bấm "Lấy tự động BGNB" trên màn Chi tiết Yêu cầu báo giá | RFQ ở Nháp / Chờ báo giá | Yêu cầu sinh báo giá | BR-31 |
| Kiểm tra dữ liệu đầu vào | Hệ thống | Kiểm tra các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động Thiếu dữ liệu ở bất kỳ trường nào → dừng luồng và báo lỗi | Dữ liệu Yêu cầu báo giá | Kết quả hợp lệ / thông báo lỗi | BR-31, BR-52 |
| Sinh tổ hợp thuộc tính (mix) | Hệ thống | Tích Descartes giá trị thuộc tính theo từng loại dịch vụ Khử trùng giá trị và tổ hợp | Thuộc tính tại RFQ | Danh sách tổ hợp \= danh sách bảng giá | BR-34, BR-35, BR-36 |
| Kiểm tra ngưỡng tổ hợp | Hệ thống | Đối chiếu số tổ hợp với ngưỡng 50 / 200 | Số tổ hợp | Chạy đồng bộ / chạy nền / chặn | BR-46 |
| Nạp đầu mục giá | Hệ thống | Lấy đầu mục Cố định & Phụ phí đang kích hoạt Kho bãi: lọc thêm theo Loại kho | Cấu hình đầu mục giá | Danh sách dòng giá trống | BR-37 |
| Khớp & chọn dòng giá | Hệ thống | Khớp Giá bán định mức theo đầu mục \+ bộ thuộc tính Áp dụng tie-break 3 tầng | Giá bán định mức, Giá mua định mức | Dòng giá đã điền giá (snapshot) | BR-38, BR-39, BR-40 |
| Áp dụng quy tắc thiếu giá | Hệ thống | Badge cấp 1 tại dòng giá Disable bảng giá cấp 2 Banner loại dịch vụ cấp 3 | Kết quả khớp dòng giá | Trạng thái từng bảng giá | BR-41, BR-42, BR-43 |
| Kiểm tra điều kiện tạo | Hệ thống | Đếm số bảng giá khả dụng của toàn báo giá | Danh sách bảng giá | Cho tạo / chặn tạo | BR-44 |
| Tạo & phát hành báo giá | Hệ thống | Sinh Mã báo giá Tính các chỉ tiêu tổng hợp Đặt trạng thái "Đã phát hành" | Bảng giá khả dụng | Báo giá nội bộ "Đã phát hành" | BR-45, BR-47 |
| Cập nhật Yêu cầu báo giá | Hệ thống | Chuyển RFQ sang "Đã có báo giá" Ẩn nút "Gửi sang Pricing" Hiển thị khối BÁO GIÁ NỘI BỘ | Báo giá đã phát hành | RFQ "Đã có báo giá" | BR-33 |
| Rà soát & điều chỉnh | Chuyên viên định giá (K2) | Thu hồi báo giá tự động Chỉnh sửa thủ công và phát hành lại | Báo giá "Đã phát hành" | Báo giá đã cập nhật | BR-49 (theo US\_QUO\_11, US\_QUO\_03) |

# **3\. Đặc tả Tính năng**

*Mặc định mỗi tính năng được đặc tả bằng User Story \+ Acceptance Criteria. Các story đánh dấu \[PHỨC TẠP\] có thêm khối "Use Case chi tiết" mô tả main / alternative / exception flow.*

## **3.1. MODULE 1: Yêu cầu báo giá – Lấy tự động Báo giá nội bộ**

### **3.1.1 Danh sách user story**

**Ghi chú độ ưu tiên (MoSCoW):**

* Must have: bắt buộc để sản phẩm hoạt động / tuân thủ pháp luật – hợp đồng → Sprint hiện tại hoặc kế tiếp.

* Should have: quan trọng, có thể tạm workaround → đưa vào Sprint nếu còn năng lực sau nhóm Must have.

* Could have: mong muốn, cải thiện trải nghiệm → làm khi dư buffer hoặc sprint sau.

#### ***User story 1: Lấy tự động Báo giá nội bộ từ Yêu cầu báo giá \[PHỨC TẠP\]***

| ID US | US\_ABG\_01 |
| :---- | :---- |
| Tên Story | Lấy tự động Báo giá nội bộ từ Yêu cầu báo giá |
| User Story | Là Dịch vụ khách hàng (K1), tôi muốn lấy báo giá nội bộ tự động ngay trên Yêu cầu báo giá, để có bảng giá chào cho khách hàng mà không phải chờ Chuyên viên định giá xử lý thủ công. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Yêu cầu báo giá – Lấy tự động Báo giá nội bộ |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria:**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Nút "Lấy tự động BGNB" hiển thị trên thanh Header màn Chi tiết Yêu cầu báo giá khi phiếu ở trạng thái Nháp hoặc Chờ báo giá. | Nút hiển thị ở trạng thái Đang báo giá / Đã có báo giá / Từ chối báo giá / Đã hủy. |
| AC2 | Nút chỉ enable khi đủ 3 điều kiện: 1\. Phiếu đã được lưu (đã có Mã RFQ). 2\. Đã tick tối thiểu 01 dịch vụ. 3\. Phiếu chưa gắn báo giá nội bộ nào. | Enable nút khi phiếu chưa lưu, chưa tick dịch vụ nào hoặc đã có báo giá nội bộ. |
| AC3 | Dữ liệu hợp lệ và có ≥ 1 bảng giá khả dụng: hệ thống tạo báo giá nội bộ ở trạng thái "Đã phát hành". Ghi Người tạo \= Người phát hành \= "Hệ thống"; Nguồn tạo \= "Tự động" (BR-45). | Báo giá tạo ra ở trạng thái Nháp; hoặc ghi Người phát hành là K1. |
| AC4 | Sau khi tạo thành công, Yêu cầu báo giá chuyển sang "Đã có báo giá" (áp dụng cho cả trạng thái Nháp và Chờ báo giá). Nút "Gửi sang Pricing" bị ẩn (BR-33). | Yêu cầu báo giá vẫn ở Nháp / Chờ báo giá; hoặc vẫn hiển thị nút "Gửi sang Pricing". |
| AC5 | Hệ thống gửi thông báo (chuông \+ email) tới Chuyên viên định giá phụ trách để rà soát báo giá tự động. | Không gửi thông báo cho Chuyên viên định giá. |
| AC6 | CHỈ thao tác tạo báo giá tự động THÀNH CÔNG được ghi vào Lịch sử hoạt động của Yêu cầu báo giá; các lần chạy thất bại không được ghi nhận. | Ghi nhận cả các lần chạy thất bại vào Lịch sử hoạt động. |
| AC7 | Người dùng KHÔNG có quyền: nút bị ẩn hoàn toàn và thao tác bị chặn. | Người dùng không có quyền vẫn chạy được chức năng. |

**▸ Use Case chi tiết UC\_ABG\_01 — Lấy tự động Báo giá nội bộ**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Dịch vụ khách hàng (K1) |
| Actor phụ | Hệ thống – Auto-BGNB Engine Chuyên viên định giá (K2) – nhận thông báo rà soát Menu Cấu hình đầu mục giá, Giá mua định mức, Giá bán định mức |
| Precondition | 1\. K1 có quyền tạo/sửa Yêu cầu báo giá. 2\. Phiếu ở trạng thái Nháp hoặc Chờ báo giá và đã có Mã RFQ. 3\. Phiếu có ≥ 1 dịch vụ được tick và chưa gắn báo giá nội bộ nào. |
| Trigger | K1 bấm nút "Lấy tự động BGNB". |
| Luồng chính (Main flow) | 1\. Hệ thống kiểm tra các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động (BR-52). 2\. Hệ thống sinh tổ hợp thuộc tính (mix) cho từng dịch vụ được yêu cầu và khử trùng. 3\. Hệ thống đối chiếu tổng số tổ hợp với ngưỡng; ≤ 50 thì xử lý đồng bộ. 4\. Với mỗi tổ hợp, hệ thống nạp danh sách đầu mục giá hợp lệ. 5\. Với mỗi đầu mục, hệ thống khớp dòng Giá bán định mức và chọn theo tie-break 3 tầng. 6\. Hệ thống điền Mã giá bán định mức, Đơn vị tính, Giá mua định mức, Giá bán định mức; đặt Đơn giá \= Giá bán định mức; tính % Lợi nhuận. 7\. Hệ thống áp dụng quy tắc thiếu giá 4 cấp cho từng dòng giá, bảng giá và loại dịch vụ. 8\. Hệ thống xác nhận còn ≥ 1 bảng giá khả dụng. 9\. Hệ thống sinh Mã báo giá, tính các chỉ tiêu tổng hợp và đặt trạng thái "Đã phát hành". 10\. Hệ thống chuyển Yêu cầu báo giá sang "Đã có báo giá", ẩn nút "Gửi sang Pricing", hiển thị khối BÁO GIÁ NỘI BỘ. 11\. Hệ thống thông báo thành công cho K1 và gửi thông báo rà soát cho K2. |
| Luồng thay thế (Alternative) | 3a. Tổng số tổ hợp \> 50 và ≤ 200: 3a1. Hệ thống chuyển sang xử lý nền, hiển thị "Đang tạo báo giá tự động, hệ thống sẽ thông báo khi hoàn tất". 3a2. Yêu cầu báo giá tạm giữ nguyên trạng thái cho tới khi job hoàn tất. 3a3. Job hoàn tất: hệ thống cập nhật trạng thái và gửi thông báo cho K1 và K2. 7a. Một số bảng giá thiếu Giá bán định mức nhưng vẫn còn bảng khả dụng: 7a1. Hệ thống disable các bảng thiếu giá và gắn banner cấp 3 cho loại dịch vụ có toàn bộ bảng bị disable. 7a2. Luồng chính tiếp tục tại bước 8\. |
| Luồng ngoại lệ (Exception) | 1a. Một trong các trường thông tin phía Báo giá nội bộ không có dữ liệu: hệ thống dừng luồng, báo lỗi; Yêu cầu báo giá giữ nguyên trạng thái (BR-52). 3b. Tổng số tổ hợp \> 200: hệ thống chặn, báo lỗi vượt ngưỡng; Yêu cầu báo giá giữ nguyên trạng thái. 8a. Không còn bảng giá khả dụng nào: hệ thống chặn tạo, báo lỗi; K1 tiếp tục bằng luồng "Gửi sang Pricing". 9a. Lỗi hệ thống giữa chừng: rollback toàn bộ, không lưu báo giá dở dang, thông báo lỗi cho K1 và K2. |
| Postcondition | Thành công: báo giá nội bộ ở trạng thái "Đã phát hành" và Yêu cầu báo giá ở trạng thái "Đã có báo giá". Thất bại: không có bản ghi báo giá nào được tạo; Yêu cầu báo giá giữ nguyên trạng thái ban đầu. |
| Business Rules liên quan | BR-31, BR-32, BR-33, BR-34, BR-35, BR-36, BR-37, BR-38, BR-39, BR-40, BR-41, BR-42, BR-43, BR-44, BR-45, BR-46, BR-47, BR-52 |

#### ***User story 2: Xử lý khi không đủ dữ liệu giá để tạo báo giá tự động***

| ID US | US\_ABG\_02 |
| :---- | :---- |
| Tên Story | Kiểm tra dữ liệu và xử lý khi không đủ điều kiện tạo báo giá tự động |
| User Story | Là Dịch vụ khách hàng, tôi muốn được thông báo rõ khi hệ thống không đủ dữ liệu giá để tạo báo giá tự động, để chủ động chuyển sang luồng gửi Pricing xử lý thủ công. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Yêu cầu báo giá – Lấy tự động Báo giá nội bộ |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria:**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Trước khi sinh bảng giá, hệ thống kiểm tra các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động, gồm: Tên báo giá, Mã yêu cầu báo giá liên quan, Thời hạn hiệu lực, Khách hàng, Hạng khách hàng, Đơn vị tiền tệ, Loại dịch vụ, Tên bảng giá dịch vụ, Đơn giá của dòng giá. Nếu MỘT trong các trường trên không có dữ liệu: hệ thống dừng luồng và báo lỗi (BR-52). | Vẫn tiếp tục tạo báo giá khi một trong các trường thông tin cần thiết không có dữ liệu. |
| AC2 | Khi không còn bảng giá khả dụng nào, hệ thống chặn tạo báo giá và hiển thị lỗi "Không đủ dữ liệu giá bán định mức để tạo báo giá tự động. Vui lòng gửi yêu cầu sang Pricing" (BR-44). | Vẫn tạo báo giá nội bộ rỗng hoặc chỉ chứa bảng giá bị disable. |
| AC3 | Yêu cầu báo giá giữ nguyên trạng thái ban đầu (Nháp hoặc Chờ báo giá); không sinh bản ghi báo giá nội bộ nào. | Yêu cầu báo giá bị chuyển sang "Đã có báo giá" khi tạo thất bại. |
| AC4 | Nút "Gửi sang Pricing" vẫn khả dụng để K1 tiếp tục luồng thủ công. | Nút "Gửi sang Pricing" bị ẩn/disable sau khi tạo tự động thất bại. |

#### ***User story 3: Xem báo giá nội bộ tự động trên màn Chi tiết Yêu cầu báo giá***

| ID US | US\_ABG\_03 |
| :---- | :---- |
| Tên Story | Xem báo giá nội bộ tự động trên màn Chi tiết Yêu cầu báo giá |
| User Story | Là Dịch vụ khách hàng, tôi muốn xem khối Báo giá nội bộ do hệ thống tạo tự động ngay trên phiếu Yêu cầu báo giá, để nắm đơn giá và trao đổi với khách hàng. |
| Độ Ưu tiên (MoSCoW) | Should have |
| Module | Yêu cầu báo giá – Lấy tự động Báo giá nội bộ |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria:**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Sau khi tạo thành công, khối "BÁO GIÁ NỘI BỘ" hiển thị trên màn Chi tiết Yêu cầu báo giá như với báo giá do K2 phát hành (tham chiếu US\_BG\_06 AC2). | Khối BÁO GIÁ NỘI BỘ không hiển thị khi phiếu đã ở "Đã có báo giá". |
| AC2 | Khối hiển thị nhãn "Tự động" để phân biệt với báo giá do K2 dựng thủ công. | Không phân biệt được nguồn tạo báo giá trên giao diện. |
| AC3 | Bảng giá bị disable hiển thị chú thích giống như tại màn Chi tiết báo giá nội bộ: "Chưa có giá định mức" \- cấp 1, "Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức" \- cấp 2 / “Doanh nghiệp không cung ứng dịch vụ này” \- cấp 3 (tương ứng với cấp 1, cấp 2, cấp 3 tại US\_ABG\_06). Khối Báo giá nội bộ (nguồn Tự động) trên màn Chi tiết Yêu cầu báo giá KHÔNG hiển thị banner cảnh báo theo cấp loại dịch vụ. | Hiển thị banner cảnh báo theo cấp loại dịch vụ tại khối này; hoặc không hiển thị chú thích của bảng giá bị disable. "Chưa có nhà thầu cung ứng" (không tồn tại dòng định mức) hoặc "Chưa thiết lập giá bán định mức"  "Chưa có giá định mức"  |
| AC4 | Khi còn dịch vụ chưa có giá, bấm "Tạo báo giá khách hàng" hiển thị cảnh báo xác nhận "Báo giá còn dịch vụ \[Loại dịch vụ\] chưa có giá. Tiếp tục tạo báo giá khách hàng?". | Cho tạo Báo giá khách hàng mà không cảnh báo khi còn dịch vụ chưa có giá. |
| AC5 | Cần ít nhất 1 bảng giá hợp lệ trong bảng giá nội bộ để tạo được báo giá khách hàng Nếu tất cả bảng giá trong báo giá nội bộ đều disable, chặn người dùng tạo báo giá khách hàng từ báo giá nội bộ đó và thông báo lỗi | Cho tạo Báo giá khách hàng mà không cảnh báo khi còn dịch vụ chưa có giá. |

### **3.1.2 Mô tả giao diện**

Link UI Design: \[Chèn link\]. Màn hình liên quan: Chi tiết / Tạo mới Yêu cầu báo giá — bổ sung nút thao tác và khối Báo giá nội bộ.

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Nút "Lấy tự động BGNB" |  | Button | — | — | Hiển thị khi phiếu ở Nháp / Chờ báo giá; enable theo BR-31 |
| Trạng thái xử lý |  | Label | — | (Ẩn) | Hiển thị "Đang tạo báo giá tự động..." khi engine chạy nền |
| Khối "BÁO GIÁ NỘI BỘ" |  | Section (chỉ đọc) | — | (Ẩn) | Hiển thị khi phiếu ở "Đã có báo giá"; kèm nhãn nguồn tạo |
| Nhãn nguồn tạo báo giá |  | Badge (chỉ đọc) | — | Tự động | Phân biệt báo giá hệ thống sinh với báo giá K2 dựng thủ công |
| Danh sách bảng giá dịch vụ của báo giá nội bộ | v | List | — | (Trống) | Là danh sách các bảng giá lấy từ báo giá nội bộ |
| Chú thích bảng giá disable (khối BGNB) |  | Text (chỉ đọc) | — | (Ẩn) | "Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức"; khối này KHÔNG hiển thị banner theo cấp loại dịch vụ (US\_ABG\_03 AC3) |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

*Mã BR đánh số tiếp nối từ BR30 của SRS\_LogXPro\_Quản lý báo giá (Báo giá nội bộ).*

* BR-31: Nút "Lấy tự động BGNB" chỉ hiển thị khi Yêu cầu báo giá ở trạng thái Nháp hoặc Chờ báo giá, và chỉ enable khi phiếu đã có Mã RFQ, có ≥ 1 dịch vụ được tick và chưa gắn báo giá nội bộ nào.

* BR-32: Toàn bộ thuộc tính nguồn phục vụ phép mix — Địa điểm làm TTHQ (KBHQ, HQGS), Địa điểm kho, Loại hình kho, Địa điểm sang tải, Loại hình sang tải, Loại xe yêu cầu, Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa và cặp Điểm đi – Điểm đến (Vận tải) — đều là trường BẮT BUỘC tại Yêu cầu báo giá. Do đó khi chạy chức năng tự động không phát sinh trường hợp thiếu dữ liệu thuộc tính nguồn và không cần luồng xử lý riêng cho trường hợp này.

* BR-33: Tạo báo giá tự động thành công: Yêu cầu báo giá chuyển từ Nháp hoặc Chờ báo giá sang "Đã có báo giá", ẩn nút "Gửi sang Pricing" và bỏ qua các trạng thái trung gian Chờ báo giá / Đang báo giá cùng bộ nút của K2 (US\_BG\_10).

* BR-34: Bảng ánh xạ nguồn giá trị thuộc tính (thay thế bảng ánh xạ tại BR25) — Chi cục hải quan ← Địa điểm làm TTHQ (áp dụng cho cả Khai báo hải quan và Hải quan giám sát); Phương thức sang tải ← Loại hình sang tải; Tên kho ← Địa điểm kho; Loại kho ← Loại hình kho; Loại xe ← Loại xe yêu cầu; Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa ← trường cùng tên tại Yêu cầu báo giá.

* BR-35: Vận tải — Điểm đi và Điểm đến lấy từ các cặp điểm của Yêu cầu báo giá, giữ nguyên cặp và không mix chéo; hệ thống khớp theo Quốc gia / Tỉnh – Thành phố / Phường – Xã của điểm đi, điểm đến với phạm vi đã quy định trong danh mục địa điểm vận tải (sửa BR25).

* BR-36: Mỗi tổ hợp giá trị thuộc tính sinh đúng 1 bảng giá dịch vụ; hệ thống khử trùng giá trị lặp trong từng tập nguồn và khử trùng tổ hợp trước khi sinh, đảm bảo không tồn tại hai bảng giá trùng bộ thuộc tính (kế thừa BR29).

### **3.1.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Một trong các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động không có dữ liệu | Lỗi | "Không đủ thông tin để tạo tự động báo giá nội bộ" | Dừng luồng tạo báo giá tự động Không sinh bản ghi báo giá nội bộ Yêu cầu báo giá giữ nguyên trạng thái |
| Tạo báo giá tự động thành công | Thành công | "Tạo báo giá nội bộ tự động thành công \[Mã báo giá\]" | Báo giá chuyển "Đã phát hành" Yêu cầu báo giá chuyển "Đã có báo giá" Ẩn nút "Gửi sang Pricing" Gửi thông báo rà soát cho K2Ghi Lịch sử hoạt động |
| Tổng số tổ hợp bảng giá từ 51 đến 200 | Thông tin | "Đang tạo báo giá tự động, hệ thống sẽ thông báo khi hoàn tất" | Chuyển sang xử lý nền Yêu cầu báo giá giữ nguyên trạng thái tới khi job hoàn tất |
| Tổng số tổ hợp bảng giá vượt 200 | Lỗi | "Yêu cầu báo giá có phạm vi quá lớn ({n} tổ hợp). Vui lòng gửi sang Pricing để tạo báo giá thủ công" | Chặn tạo báo giá Yêu cầu báo giá giữ nguyên trạng thái |
| Không còn bảng giá khả dụng nào | Lỗi | "Không đủ dữ liệu giá bán định mức để tạo báo giá tự động. Vui lòng gửi yêu cầu sang Pricing" | Chặn tạo báo giá Không sinh bản ghi báo giá nội bộ Yêu cầu báo giá giữ nguyên trạng thái |
| Job tạo báo giá lỗi giữa chừng | Lỗi | "Tạo báo giá tự động thất bại. Vui lòng thử lại hoặc gửi yêu cầu sang Pricing" | Rollback toàn bộ Không lưu báo giá dở dang Ghi log và thông báo cho K2 |
| Người dùng không có quyền sử dụng chức năng | Lỗi | "Bạn không có quyền thực hiện chức năng này" | Ẩn nút Chặn thao tác |
| Bấm "Tạo báo giá khách hàng" khi báo giá tự động còn dịch vụ chưa có giá | Cảnh báo | "Báo giá còn {n} dịch vụ chưa có giá. Tiếp tục tạo báo giá khách hàng?" | Popup xác nhận Xác nhận → tiếp tục tạo Hủy → giữ nguyên màn hình |
| Bấm "Tạo báo giá khách hàng" khi tất cả bảng giá thuộc BGNB disable | Lỗi | “Không có biểu giá dịch vụ nào hợp lệ để tạo báo giá khách hàng” | Chặn thao tác tạo báo giá khách hàng. |

### **3.1.5. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Yêu cầu báo giá (RFQ) | Cung cấp thông tin khách hàng, hàng hóa, dịch vụ yêu cầu và các giá trị thuộc tính làm đầu vào cho engine | Yêu cầu báo giá → Auto-BGNB Engine | Khi K1 bấm "Lấy tự động BGNB" | Thuộc tính nguồn đã bắt buộc tại RFQ → không phát sinh ngoại lệ thiếu dữ liệu (BR-32) |
| Báo giá nội bộ | Nhận kết quả sinh tự động và phát hành báo giá | Auto-BGNB Engine → Báo giá nội bộ | Khi engine hoàn tất xử lý | Thiếu trường thông tin cần thiết → dừng luồng, báo lỗi (BR-52); lỗi giữa chừng → rollback toàn bộ (BR-47) |
| Hệ thống thông báo (chuông \+ email) | Thông báo kết quả cho K1 và yêu cầu rà soát cho K2 | Auto-BGNB Engine → K1, K2 | Khi tạo báo giá thành công hoặc thất bại | Gửi thông báo thất bại → ghi log, không ảnh hưởng kết quả tạo báo giá |
| Báo giá khách hàng | Nhận báo giá nội bộ tự động làm nguồn tạo báo giá gửi khách hàng | Báo giá nội bộ → Báo giá khách hàng | Khi K1 bấm "Tạo báo giá khách hàng" | Bảng giá bị disable không được lấy sang Báo giá khách hàng (BR-42) |

## **3.2. MODULE 2: Báo giá nội bộ – Engine sinh bảng giá tự động**

### **3.2.1 Danh sách user story**

#### ***User story 4: Sinh bảng giá dịch vụ theo tổ hợp thuộc tính \[PHỨC TẠP\]***

| ID US | US\_ABG\_04 |
| :---- | :---- |
| Tên Story | Sinh bảng giá dịch vụ theo tổ hợp thuộc tính của Yêu cầu báo giá |
| User Story | Là Chuyên viên định giá, tôi muốn hệ thống sinh sẵn các bảng giá dịch vụ theo đúng các tổ hợp thuộc tính khách hàng yêu cầu, để không phải khai báo thủ công từng bảng giá. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Báo giá nội bộ – Engine sinh bảng giá tự động |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria:**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Với mỗi dịch vụ được tick tại Yêu cầu báo giá, hệ thống sinh bảng giá theo tích Descartes các giá trị thuộc tính tương ứng của loại dịch vụ đó (BR-36). | Bỏ sót dịch vụ được tick; hoặc sinh thiếu tổ hợp so với giá trị đã nhập tại Yêu cầu báo giá. |
| AC2 | Ánh xạ nguồn giá trị thuộc tính theo BR-34: – Chi cục hải quan ← Địa điểm làm TTHQ (KBHQ và HQGS) – Phương thức sang tải ← Loại hình sang tải – Tên kho ← Địa điểm kho; Loại kho ← Loại hình kho – Loại xe ← Loại xe yêu cầu – Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa ← trường cùng tên | Lấy sai trường nguồn (ví dụ lấy Cửa khẩu thay cho Địa điểm làm TTHQ). |
| AC3 | Vận tải: mỗi cặp Điểm đi – Điểm đến giữ nguyên cặp, không mix chéo. Khớp theo Quốc gia / Tỉnh – Thành phố / Phường – Xã với danh mục địa điểm vận tải (BR-35). | Mix chéo điểm đi của cặp này với điểm đến của cặp khác. |
| AC4 | Hệ thống khử trùng giá trị lặp và tổ hợp trùng trước khi sinh; không tồn tại hai bảng giá trùng bộ thuộc tính trong cùng báo giá (kế thừa BR29). | Sinh hai bảng giá cùng Loại dịch vụ và trùng toàn bộ giá trị thuộc tính. |
| AC5 | Mỗi bảng giá được sinh ID theo cấu trúc IQYYMM-XXX (BR12). Tên bảng giá tự sinh theo cấu trúc "{các giá trị thuộc tính nối bằng dấu /}". | Không sinh ID; hoặc để trống Tên bảng giá (trường bắt buộc). |
| AC6 | Kiểm soát ngưỡng tổ hợp (BR-46): – ≤ 50 tổ hợp: xử lý đồng bộ. – 51 đến 200 tổ hợp: xử lý nền. – \> 200 tổ hợp: chặn và báo lỗi. | Xử lý đồng bộ với số tổ hợp lớn gây treo giao diện; hoặc không chặn khi vượt 200 tổ hợp. |
| AC7 | Tiền tệ của mọi bảng giá tự sinh \= VNĐ và ở chế độ không cho chỉnh sửa. | Sinh bảng giá với tiền tệ khác VNĐ. |

**▸ Use Case chi tiết UC\_ABG\_02 — Sinh tổ hợp bảng giá dịch vụ**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Hệ thống – Auto-BGNB Engine |
| Actor phụ | Menu Quản lý danh mục – danh mục địa điểm vận tải Yêu cầu báo giá – nguồn giá trị thuộc tính |
| Precondition | 1\. Yêu cầu báo giá đã pass validate của BR-31 và kiểm tra trường thông tin của BR-52. 2\. Danh sách dịch vụ được tick đã xác định. |
| Trigger | Engine được gọi khi K1 bấm "Lấy tự động BGNB" (US\_ABG\_01, US\_ABG\_07). |
| Luồng chính (Main flow) | 1\. Đọc danh sách dịch vụ được tick tại Yêu cầu báo giá. 2\. Với mỗi dịch vụ, xác định bộ thuộc tính bắt buộc của loại dịch vụ đó. 3\. Ánh xạ từng thuộc tính về trường nguồn tại Yêu cầu báo giá theo BR-34. 4\. Khử trùng giá trị trong từng tập nguồn. 5\. Sinh tích Descartes các tập giá trị thành danh sách tổ hợp. 6\. Riêng Vận tải: ghép (cặp điểm × loại xe), không mix chéo điểm đi và điểm đến. 7\. Khử trùng tổ hợp và đếm tổng số tổ hợp của toàn báo giá. 8\. Sinh ID và Tên cho từng bảng giá; chuyển sang bước nạp đầu mục giá (UC\_ABG\_03). |
| Luồng thay thế (Alternative) | 6a. Cặp điểm của Yêu cầu báo giá không nằm trong phạm vi danh mục địa điểm vận tải: 6a1. Bảng giá vẫn được sinh nhưng sẽ không khớp được dòng giá ở bước sau. 6a2. Bảng giá rơi vào quy tắc thiếu giá cấp 2 (BR-42). 7a. Tổng số tổ hợp trong khoảng 51 đến 200: engine chuyển sang chế độ xử lý nền. |
| Luồng ngoại lệ (Exception) | 3a. Trường nguồn không có giá trị: không phát sinh — toàn bộ thuộc tính nguồn đã là trường bắt buộc tại Yêu cầu báo giá (BR-32). 7b. Tổng số tổ hợp \> 200: engine dừng, trả lỗi vượt ngưỡng, không sinh bảng giá nào. |
| Postcondition | Danh sách bảng giá dịch vụ (chưa có dòng giá) đã sẵn sàng cho bước khớp dòng giá. |
| Business Rules liên quan | BR-32, BR-34, BR-35, BR-36, BR-42, BR-46, BR-52 |

#### ***User story 5: Tự động khớp dòng giá và tính toán tài chính \[PHỨC TẠP\]***

| ID US | US\_ABG\_05 |
| :---- | :---- |
| Tên Story | Tự động khớp dòng giá từ Giá bán định mức và tính toán chỉ tiêu tài chính |
| User Story | Là Chuyên viên định giá, tôi muốn hệ thống tự khớp dòng giá từ Giá bán định mức và tính sẵn các chỉ tiêu tài chính, để báo giá phản ánh đúng bảng định mức đã thiết lập. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Báo giá nội bộ – Engine sinh bảng giá tự động |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria:**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Đầu mục giá đưa vào bảng giá phải thỏa: đúng loại dịch vụ; Loại giá thuộc {Cố định, Phụ phí}; đang Kích hoạt. Đầu mục Loại giá "Phát sinh" và đầu mục tắt kích hoạt không xuất hiện (kế thừa BR5). | Bảng giá hiển thị đầu mục Loại giá "Phát sinh" hoặc đầu mục đã tắt kích hoạt. |
| AC2 | Riêng Kho bãi: chỉ nạp đầu mục giá có Loại kho chứa Loại kho của bảng giá đang xử lý (BR-37). | Nạp đầu mục của Loại kho khác vào bảng giá, làm bảng giá bị disable sai. |
| AC3 | Điều kiện khớp dòng Giá bán định mức: cùng đầu mục giá và mọi thuộc tính khớp tuyệt đối hoặc khớp với giá trị "Tất cả" (BR-38). | Khớp nhầm dòng khác đầu mục; hoặc bỏ sót dòng có giá trị "Tất cả". |
| AC4 | Tie-break khi nhiều dòng cùng khớp, áp dụng đúng thứ tự 3 tầng (BR-39): 1\. Loại bỏ các dòng có Giá bán định mức \= null. 2\. Ưu tiên dòng có độ đặc hiệu cao hơn (khớp giá trị cụ thể thắng giá trị "Tất cả"). 3\. Lấy dòng có Giá bán định mức CAO NHẤT. Không phát sinh trường hợp nhiều dòng khớp cùng Đơn vị tính: mỗi dòng Giá bán định mức là kết quả gom các dòng giá mua đầu vào theo một tổ hợp duy nhất Đầu mục giá \+ bộ thuộc tính \+ Đơn vị tính. | Lấy dòng có Giá bán định mức thấp nhất; hoặc bỏ qua bước loại dòng có Giá bán định mức \= null. |
| AC5 | Bảng giá chứa một đầu mục giá KHÔNG khớp được dòng Giá bán định mức nào, hoặc chỉ khớp đúng 1 dòng Giá bán định mức mà dòng đó không có Giá bán định mức: toàn bộ bảng giá chứa đầu mục giá đó bị disable (BR-42). | Chỉ đánh dấu dòng giá thiếu giá mà vẫn cho sử dụng bảng giá. |
| AC6 | Dòng giá được điền: Mã giá bán định mức, Đơn vị tính, Giá mua định mức, Giá bán định mức; Đơn giá mặc định \= Giá bán định mức (BR7). | Đơn giá không bằng Giá bán định mức; hoặc thiếu Mã giá bán định mức. |
| AC7 | % Lợi nhuận của dòng giá \= (Đơn giá − Giá mua định mức) / Giá mua định mức, hiển thị ở chế độ chỉ đọc (BR6). | Cho nhập tay % Lợi nhuận; hoặc % Lợi nhuận không được tính. |
| AC8 | Giá mua định mức và Giá bán định mức được snapshot tại thời điểm sinh báo giá; thay đổi tại menu nguồn sau đó không tác động ngược (BR-40). | Báo giá đã phát hành tự thay đổi giá khi Giá bán định mức nguồn được cập nhật. |
| AC9 | Tổng đơn giá bảng giá \= Σ Đơn giá các dòng giá. Tổng đơn giá bảng giá \= null khi bảng giá bị disable. Tổng đơn giá dịch vụ \= Σ Tổng đơn giá các bảng giá khả dụng; bảng giá bị disable không tham gia tổng hợp (BR9, BR-42). | Bảng giá disable vẫn có Tổng đơn giá khác null; hoặc vẫn được cộng vào Tổng đơn giá dịch vụ. |
| AC10 | Lợi nhuận dự kiến (%) \= (Σ Đơn giá − Σ Giá mua định mức) / Σ Giá mua định mức, tính trên các bảng giá khả dụng (BR10). | Tính Lợi nhuận dự kiến trên cả bảng giá bị disable hoặc dòng giá thiếu giá. |
| AC11 | Mỗi dòng giá trong bảng giá được hệ thống sinh ID riêng (BR19). | Dòng giá không có ID hoặc ID bị trùng. |

*Cập nhật v1.1: AC4 đổi thành tie-break 3 tầng (bỏ tầng "cùng Đơn vị tính"); bổ sung AC5 mới về điều kiện disable bảng giá; AC9 bổ sung quy tắc Tổng đơn giá \= null. Các AC từ AC5 (v1.0) trở đi được đánh số lại.*

**▸ Use Case chi tiết UC\_ABG\_03 — Khớp dòng giá và tính toán tài chính**

*(Đính kèm cho story phức tạp: nhiều nhánh / nhiều actor / ràng buộc nghiệp vụ chặt)*

| Mục | Nội dung |
| :---- | :---- |
| Actor chính | Hệ thống – Auto-BGNB Engine |
| Actor phụ | Menu Cấu hình đầu mục giá Menu Giá mua định mức Menu Giá bán định mức |
| Precondition | Danh sách bảng giá (chưa có dòng giá) đã được sinh từ UC\_ABG\_02. |
| Trigger | Kết thúc bước sinh tổ hợp bảng giá. |
| Luồng chính (Main flow) | 1\. Với mỗi bảng giá, lấy danh sách đầu mục giá hợp lệ theo loại dịch vụ. 2\. Với Kho bãi, lọc thêm đầu mục theo Loại kho của bảng giá. 3\. Với mỗi đầu mục, truy vấn Giá bán định mức theo đầu mục và bộ thuộc tính (chấp nhận giá trị "Tất cả"). 4\. Loại bỏ các dòng có Giá bán định mức \= null. 5\. Áp dụng tie-break: độ đặc hiệu → lấy dòng có Giá bán định mức cao nhất. 6\. Điền dữ liệu dòng giá; đặt Đơn giá \= Giá bán định mức; tính % Lợi nhuận; snapshot giá. 7\. Tính Tổng đơn giá của bảng giá; bảng giá bị disable có Tổng đơn giá \= null. 8\. Tính Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%) trên các bảng giá khả dụng. |
| Luồng thay thế (Alternative) | 3a. Chỉ có dòng giá trị "Tất cả" khớp: hệ thống chọn dòng đó và tiếp tục tại bước 6\. 5a. Nhiều dòng khớp (các dòng luôn khác Đơn vị tính): 5a1. Hệ thống chọn dòng có Giá bán định mức cao nhất. 5a2. Hệ thống hiển thị icon cảnh báo ngay trên dòng giá đó để K2 rà soát lại. |
| Luồng ngoại lệ (Exception) | 1a. Loại dịch vụ không có đầu mục giá nào đang kích hoạt: toàn bộ bảng giá của dịch vụ rơi vào quy tắc cấp 3 (BR-43). 3b. Không có dòng Giá bán định mức nào khớp: dòng giá rơi vào quy tắc thiếu giá cấp 1 và bảng giá chứa dòng đó bị disable (BR-41, BR-42). 4a. Toàn bộ dòng khớp đều có Giá bán định mức \= null: xử lý như 3b. 4b. Giá mua định mức của dòng \= null (kéo theo Giá bán định mức \= null theo BR12 — SRS Giá bán định mức): xử lý như 3b. |
| Postcondition | Mỗi bảng giá có đầy đủ dòng giá (có giá hoặc gắn nhãn thiếu giá). Mỗi bảng giá được xác định trạng thái khả dụng hoặc disable. |
| Business Rules liên quan | BR-37, BR-38, BR-39, BR-40, BR-41, BR-42, BR-43 |

#### ***User story 6: Hiển thị và xử lý bảng giá thiếu Giá bán định mức***

| ID US | US\_ABG\_06 |
| :---- | :---- |
| Tên Story | Hiển thị và xử lý bảng giá thiếu Giá bán định mức theo 4 cấp |
| User Story | Là Chuyên viên định giá, tôi muốn hệ thống chỉ rõ dòng giá / bảng giá / dịch vụ nào không có giá, để biết chính xác phần nào của báo giá không sử dụng được và xử lý bổ sung. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Báo giá nội bộ – Engine sinh bảng giá tự động |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria:**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Cấp 1 – Dòng giá: dòng không khớp được dòng Giá bán định mức nào, hoặc dòng khớp có Giá bán định mức \= null. Xử lý: vẫn hiển thị dòng, các ô giá để trống, gắn badge xám "Chưa có giá định mức"; dòng không tham gia tổng hợp (BR-41). | Ẩn dòng giá thiếu giá; hoặc dòng thiếu giá vẫn được cộng vào Tổng đơn giá. |
| AC2 | Cấp 2 – Bảng giá: bảng có ≥ 1 dòng thuộc AC1, kể cả khi dòng đó thuộc đầu mục Loại giá "Phụ phí". Xử lý: disable toàn bộ bảng giá, hiển thị chú thích "Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức"; Tổng đơn giá của bảng \= null và không tính vào báo giá (BR-42). | Chỉ disable dòng thiếu giá mà vẫn cho sử dụng bảng giá; hoặc bỏ qua dòng Phụ phí khi xét disable. |
| AC3 | Cấp 3 – Loại dịch vụ: toàn bộ bảng giá của một loại dịch vụ bị disable, hoặc loại dịch vụ không có đầu mục giá nào đang kích hoạt. Xử lý: hiển thị banner "Doanh nghiệp không cung ứng dịch vụ này" tại tab loại dịch vụ (BR-43). | Không hiển thị banner khi toàn bộ bảng giá của dịch vụ bị disable. |
| AC4 | Cấp 4 – Báo giá: không còn bảng giá khả dụng nào trong toàn bộ báo giá. Xử lý: chặn tạo báo giá và báo lỗi (BR-44). | Vẫn tạo và phát hành báo giá không có dòng giá hợp lệ nào. |
| AC5 | Badge cấp 1 có tooltip nêu nguyên nhân: "Chưa có nhà thầu cung ứng" (không tồn tại dòng định mức) hoặc "Chưa thiết lập giá bán định mức" (dòng tồn tại nhưng Giá bán định mức \= null). | Gộp hai nguyên nhân làm một, người dùng không biết xử lý ở menu nào. |
| AC6 | Nhãn "Doanh nghiệp không cung ứng dịch vụ này" (cấp 3\) tồn tại song song và độc lập với cảnh báo "Dịch vụ chưa được báo giá" của BR28; hai nhãn dùng cho hai ngữ cảnh khác nhau (BR-50). | Thay thế hoặc gộp hai nhãn làm một. |
| AC7 | Bảng giá bị disable KHÔNG xuất hiện trong màn Chỉnh sửa báo giá. Bảng giá bị disable bị ghi đè khi có bảng giá trùng bộ thông tin thuộc tính được tạo thêm. Bảng giá bị disable KHÔNG được lấy khi tạo Báo giá khách hàng. | Bảng giá disable vẫn hiển thị tại màn Chỉnh sửa báo giá; hoặc được đưa vào Báo giá khách hàng; hoặc chặn tạo bảng giá mới trùng bộ thuộc tính với bảng giá disable. |

#### ***User story 7: Lấy tự động báo giá từ Giá bán định mức, không qua bộ phận Định giá***

| ID US | US\_ABG\_07 |
| :---- | :---- |
| Tên Story | Lấy tự động báo giá từ Giá bán định mức, không qua bộ phận Định giá |
| User Story | Là Dịch vụ khách hàng (K1), tôi muốn lấy tự động báo giá từ bảng Giá bán định mức ngay trên màn Chi tiết Yêu cầu báo giá, để có báo giá nội bộ mà không cần bộ phận Định giá và giải pháp (K2) tiếp nhận và dựng giá. |
| Độ Ưu tiên (MoSCoW) | Must have |
| Module | Báo giá nội bộ – Engine sinh bảng giá tự động |
| Người Phụ trách (Owner) | Trang BA |

**Acceptance Criteria:**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Nút "Lấy tự động báo giá" được hiển thị trong màn Chi tiết Yêu cầu báo giá; chỉ hiển thị khi Yêu cầu báo giá ở trạng thái Nháp hoặc Chờ báo giá (BR-48). | Nút hiển thị tại màn Thêm mới/Chỉnh sửa báo giá; hoặc hiển thị ở các trạng thái khác của Yêu cầu báo giá. |
| AC2 | Thao tác do Dịch vụ khách hàng (K1) thực hiện; không yêu cầu bộ phận Định giá (K2) bấm "Tiếp nhận" hay "Tạo báo giá nội bộ" (US\_BG\_10). | Bắt buộc K2 tiếp nhận phiếu trước khi K1 lấy được báo giá tự động. |
| AC3 | Nguồn giá của báo giá tự động lấy trực tiếp từ bảng Giá bán định mức; không sử dụng dữ liệu nhập tay của K2. | Lấy giá từ nguồn khác Giá bán định mức. |
| AC4 | Sau khi tạo thành công, các nút "Tiếp nhận" và "Tạo báo giá nội bộ" của K2 trên phiếu không còn hiển thị do phiếu đã chuyển "Đã có báo giá" (BR-33). | Phiếu đã có báo giá nhưng vẫn hiển thị bộ nút của K2. |
| AC5 | Điều kiện phát hành vẫn theo BR14 (tối thiểu 1 dòng giá); bảng giá bị disable không được tính là dòng giá hợp lệ. | Cho phát hành báo giá chỉ gồm bảng giá bị disable. |
| AC6 | Cảnh báo soft theo BR27 KHÔNG áp dụng cho luồng tự động; chỉ áp dụng cho luồng tạo báo giá thủ công của K2 (BR-50). | Hiển thị cảnh báo BR27 trong luồng tự động. |
| AC7 | Thao tác thành công được ghi vào Lịch sử hoạt động với Hành động "Lấy tự động báo giá"; các lần chạy thất bại không được ghi nhận. | Ghi nhận cả các lần chạy thất bại vào Lịch sử hoạt động. |

### **3.2.2 Mô tả giao diện**

Link UI Design: \[Chèn link\]. Màn hình liên quan: Thêm mới / Chỉnh sửa / Chi tiết Báo giá nội bộ — bổ sung trường Nguồn tạo và các thành phần cảnh báo thiếu giá.

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Nguồn tạo |  | Enum (chỉ đọc) | — | Tự động | Tự động / Thủ công; hiển thị tại nhóm Thông tin phát hành báo giá |
| Người tạo |  | Text (chỉ đọc) | — | Hệ thống | Báo giá tự động ghi giá trị "Hệ thống" |
| Người phát hành |  | Text (chỉ đọc) | — | Hệ thống | Báo giá tự động ghi giá trị "Hệ thống" |
| Tên báo giá | v | Text | 200 | (Tự sinh) | "BGNB tự động – {Mã RFQ} – {Tên khách hàng}"; đảm bảo không trùng vì Mã RFQ là duy nhất |
| Thời hạn hiệu lực | v | Date | — | (Tự sinh) | Ngày tạo \+ N ngày; N là tham số cấu hình hệ thống, mặc định 7 |
| Tên bảng giá dịch vụ | v | Text | 200 | (Tự sinh) | "{các giá trị thuộc tính nối bằng dấu /}" |
| Tổng đơn giá bảng giá |  | Number (chỉ đọc) | — | (Tự tính) | \= Σ Đơn giá các dòng giá; \= null khi bảng giá bị disable |
| Badge "Chưa có giá định mức" |  | Badge (chỉ đọc) | — | (Ẩn) | Gắn tại dòng giá thiếu Giá bán định mức — quy tắc cấp 1 |
| Icon cảnh báo dòng giá |  | Icon (chỉ đọc) | — | (Ẩn) | Gắn tại dòng giá có nhiều dòng Giá bán định mức cùng khớp, để K2 rà soát lại (UC\_ABG\_03 – 5a2) |
| Chú thích bảng giá disable |  | Text (chỉ đọc) | — | (Ẩn) | "Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức" — cấp 2 |
| Banner loại dịch vụ |  | Text (chỉ đọc) | — | (Ẩn) | "Doanh nghiệp không cung ứng dịch vụ này" — cấp 3 |
| Đơn vị tính (cột trong bảng giá) |  | Text (chỉ đọc) | — | (Theo dòng giá) | Lấy từ dòng Giá bán định mức, KHÔNG lấy từ đầu mục giá — đính chính Bảng 3 mục 3.1.2 SRS Báo giá nội bộ |

### **3.2.3. Quy tắc nghiệp vụ (Business Rule)**

* BR-37: Đầu mục giá đưa vào bảng giá tự sinh phải đúng loại dịch vụ, có Loại giá thuộc {Cố định, Phụ phí} và đang Kích hoạt. Riêng phân hệ Kho bãi, đầu mục giá còn phải có Loại kho chứa Loại kho của bảng giá đang xử lý (theo BR11 — SRS Cấu hình đầu mục giá).

* BR-38: Điều kiện khớp một dòng Giá bán định mức với cặp (bảng giá, đầu mục giá): cùng loại dịch vụ, cùng đầu mục giá, và với mọi thuộc tính của loại dịch vụ thì giá trị của dòng định mức bằng giá trị của bảng giá hoặc bằng "Tất cả".

* BR-39: Tie-break khi nhiều dòng Giá bán định mức cùng khớp, áp dụng theo đúng thứ tự 3 tầng: (1) loại bỏ dòng có Giá bán định mức \= null; (2) ưu tiên dòng có độ đặc hiệu cao hơn — khớp giá trị cụ thể thắng giá trị "Tất cả"; (3) lấy dòng có Giá bán định mức CAO NHẤT. Không phát sinh trường hợp nhiều dòng khớp cùng Đơn vị tính, vì mỗi dòng Giá bán định mức là kết quả gom các dòng giá mua đầu vào theo một tổ hợp duy nhất Đầu mục giá \+ bộ thuộc tính \+ Đơn vị tính (BR2 — SRS Giá mua định mức). Khi phải áp dụng tầng (3), hệ thống hiển thị icon cảnh báo trên dòng giá để Chuyên viên định giá rà soát lại.

* BR-40: Đơn giá của dòng giá mặc định bằng Giá bán định mức; % Lợi nhuận \= (Đơn giá − Giá mua định mức) / Giá mua định mức. Giá mua định mức và Giá bán định mức được snapshot tại thời điểm sinh báo giá và không tự đồng bộ khi nguồn thay đổi (chốt lại BR8; cần cập nhật mục 3.1.5 SRS Cấu hình đầu mục giá đang ghi "tham chiếu động, không snapshot").

* BR-41: Quy tắc thiếu giá cấp 1 — Dòng giá không khớp được dòng Giá bán định mức nào, hoặc dòng khớp có Giá bán định mức \= null: dòng vẫn hiển thị, các ô giá để trống, gắn badge xám "Chưa có giá định mức" và không tham gia các chỉ tiêu tổng hợp.

* BR-42: Quy tắc thiếu giá cấp 2 — Bảng giá có tối thiểu 1 dòng thuộc BR-41 (kể cả dòng thuộc đầu mục Loại giá "Phụ phí"): toàn bộ bảng giá chuyển trạng thái disable và hiển thị chú thích "Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức". Bảng giá bị disable có Tổng đơn giá \= null, không tham gia Tổng đơn giá dịch vụ và Lợi nhuận dự kiến, không xuất hiện trong màn Chỉnh sửa báo giá, bị ghi đè khi có bảng giá trùng bộ thuộc tính được tạo thêm, và không được lấy khi tạo Báo giá khách hàng.

* BR-43: Quy tắc thiếu giá cấp 3 — Toàn bộ bảng giá của một loại dịch vụ bị disable, hoặc loại dịch vụ đó không có đầu mục giá nào đang kích hoạt: hiển thị banner "Doanh nghiệp không cung ứng dịch vụ này" tại tab loại dịch vụ.

* BR-44: Quy tắc thiếu giá cấp 4 — Toàn bộ báo giá không còn bảng giá khả dụng nào: hệ thống chặn tạo báo giá tự động và báo lỗi; Yêu cầu báo giá giữ nguyên trạng thái để tiếp tục luồng thủ công (giữ nguyên điều kiện phát hành của BR14).

* BR-45: Báo giá nội bộ tạo tự động có: Nguồn tạo \= "Tự động"; Người tạo \= Người phát hành \= "Hệ thống"; Mã báo giá theo BR11; Tên báo giá và Thời hạn hiệu lực tự sinh; Tên bảng giá dịch vụ tự sinh theo cấu trúc "{các giá trị thuộc tính nối bằng dấu /}"; Đơn vị tiền tệ \= VNĐ.

* BR-46: Ngưỡng kiểm soát tổ hợp — ≤ 50 tổ hợp: xử lý đồng bộ; từ 51 đến 200 tổ hợp: xử lý nền và thông báo khi hoàn tất; \> 200 tổ hợp: chặn và yêu cầu tạo báo giá thủ công.

* BR-47: Toàn bộ quá trình sinh báo giá tự động chạy trong một transaction; lỗi giữa chừng phải rollback hoàn toàn, không để lại báo giá dở dang chiếm liên kết 1-1 với Yêu cầu báo giá (BR1).

* BR-48: Chức năng lấy tự động được thực hiện tại màn Chi tiết Yêu cầu báo giá bởi Dịch vụ khách hàng (K1), chỉ khả dụng khi phiếu ở trạng thái Nháp hoặc Chờ báo giá; báo giá nội bộ được sinh trực tiếp từ bảng Giá bán định mức và không cần bộ phận Định giá (K2) tiếp nhận hay tạo báo giá thủ công (US\_BG\_10).

* BR-49: Thu hồi và chỉnh sửa báo giá tự động áp dụng nguyên các quy tắc hiện hành của SRS Báo giá nội bộ (US\_QUO\_11, US\_QUO\_03, BR21, BR22); Thu hồi bị chặn khi Dịch vụ khách hàng đã tạo Báo giá khách hàng (AC5 — US\_BG\_09).

* BR-50: BR27 (cảnh báo soft khi thiếu bảng giá dịch vụ) KHÔNG áp dụng cho luồng tạo tự động, chỉ áp dụng cho luồng tạo báo giá thủ công của K2; BR28 (cảnh báo "Dịch vụ chưa được báo giá") giữ nguyên và tồn tại song song, độc lập với nhãn "Doanh nghiệp không cung ứng dịch vụ này" của BR-43.

* BR-52: Trước khi sinh bảng giá, hệ thống kiểm tra các trường thông tin phía Báo giá nội bộ cần cho việc tạo tự động: Tên báo giá, Mã yêu cầu báo giá liên quan, Thời hạn hiệu lực, Khách hàng, Hạng khách hàng, Đơn vị tiền tệ, Loại dịch vụ, Tên bảng giá dịch vụ, Đơn giá của dòng giá. Nếu một trong các trường không có dữ liệu, hệ thống DỪNG luồng tạo tự động và báo lỗi "Không đủ thông tin để tạo tự động báo giá nội bộ"; không sinh bản ghi báo giá và Yêu cầu báo giá giữ nguyên trạng thái.

* BR-53: Chỉ thao tác tạo báo giá tự động THÀNH CÔNG được ghi vào Lịch sử hoạt động của Yêu cầu báo giá và của báo giá; các lần chạy thất bại không được ghi nhận vào Lịch sử hoạt động (chỉ ghi log hệ thống).

### **3.2.4 Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Dòng giá không khớp được Giá bán định mức, hoặc dòng khớp có giá bán \= null | Cảnh báo | "Chưa có giá định mức" | Badge xám tại dòng giá Các ô giá để trống Dòng không tham gia tổng hợp Disable toàn bộ bảng giá chứa dòng đó |
| Bảng giá có ≥ 1 dòng thiếu giá | Cảnh báo | "Không thể sử dụng bảng giá này do chưa có đầy đủ giá bán định mức" | Disable toàn bộ bảng giá Tổng đơn giá của bảng \= null Không hiển thị tại màn Chỉnh sửa báo giá Không được lấy khi tạo Báo giá khách hàng |
| Toàn bộ bảng giá của một loại dịch vụ bị disable | Cảnh báo | "Doanh nghiệp không cung ứng dịch vụ này" | Hiển thị banner tại tab loại dịch vụ Không chặn các thao tác khác |
| Nhiều dòng Giá bán định mức cùng khớp với một đầu mục giá | Cảnh báo | "Có nhiều dòng giá bán định mức khớp với đầu mục này, vui lòng rà soát lại" | Chọn dòng có Giá bán định mức cao nhất Hiển thị icon cảnh báo ngay trên dòng giá đó để K2 rà soát lại |
| Bấm "Lấy tự động báo giá" tại màn Chi tiết Yêu cầu báo giá thành công | Thành công | "Đã tạo tự động báo giá nội bộ {Mã báo giá}" | Sinh báo giá nội bộ ở trạng thái "Đã phát hành" Ghi Lịch sử hoạt động với Hành động "Lấy tự động báo giá" |
| Phát hành báo giá khi chưa có dòng giá hợp lệ nào | Lỗi | "Báo giá phải có tối thiểu 1 dòng giá trước khi phát hành" | Chặn phát hành (BR14) |
| Thu hồi báo giá tự động khi K1 đã tạo Báo giá khách hàng | Lỗi | "Không thể thu hồi báo giá ở trạng thái này" | Chặn thao tác thu hồi Ẩn hoặc disable nút Thu hồi |

### **3.2.5. Tích hợp & Đồng bộ dữ liệu**

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Cấu hình đầu mục giá | Cung cấp danh sách đầu mục giá và Loại kho gắn với đầu mục (phân hệ Kho bãi) | Cấu hình đầu mục giá → Auto-BGNB Engine | Khi nạp đầu mục cho từng bảng giá | Đầu mục tắt kích hoạt hoặc Loại giá "Phát sinh" → không nạp |
| Giá bán định mức | Cung cấp dòng giá để khớp: Mã giá bán định mức, Đơn vị tính, Giá bán định mức | Giá bán định mức → dòng giá trong bảng giá | Khi khớp dòng giá cho từng đầu mục | Không có dòng khớp hoặc giá bán \= null → quy tắc cấp 1 và disable bảng giá (BR-41, BR-42) |
| Giá mua định mức | Cung cấp Giá mua định mức làm căn cứ tính % Lợi nhuận | Giá mua định mức → dòng giá (snapshot) | Khi điền dữ liệu dòng giá | Giá mua định mức \= null kéo theo giá bán \= null → quy tắc cấp 1 |
| Quản lý danh mục | Cung cấp danh mục địa điểm vận tải để đối chiếu cặp Điểm đi – Điểm đến | Quản lý danh mục → Auto-BGNB Engine | Khi sinh bảng giá dịch vụ Vận tải | Cặp điểm ngoài phạm vi danh mục → không khớp dòng giá → quy tắc cấp 2 |
| Yêu cầu báo giá (RFQ) | Cung cấp dịch vụ yêu cầu và giá trị thuộc tính làm đầu vào cho phép mix | Yêu cầu báo giá → Auto-BGNB Engine | Khi K1 bấm "Lấy tự động báo giá" (US\_ABG\_01, US\_ABG\_07) | Thuộc tính nguồn đã bắt buộc tại RFQ → không phát sinh ngoại lệ thiếu dữ liệu (BR-32) |

# **Phụ lục A. Hướng dẫn áp dụng mô hình Hybrid theo Sprint**

* Refinement: bẻ Epic → User Story \+ AC; đánh dấu \[PHỨC TẠP\] cho story nhiều nhánh/nhiều actor để bổ sung Use Case.

* Sprint Planning: chỉ story đạt Definition of Ready mới đưa vào Sprint Backlog; đính wireframe & business rule.

* Trong Sprint: US \+ AC là living doc; tester biến AC (và Use Case flow) trực tiếp thành test case.

* Review/Done: cập nhật lại US/UC theo thực tế build, đồng bộ Data Dictionary & bảng tích hợp.

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

*(Software Requirements Specification \- SRS)*

| Tên hệ thống | LogXPro – Module Quản lý cung ứng – Menu “Quản lý báo giá” (báo giá nội bộ Pricing → Sales) |
| :---- | :---- |
| **Link UI Design** | \[Chèn link UI Design\] |
| **Người lập** | \[Họ và tên BA\] |
| **Ngày tạo** | \[dd/MM/yyyy\] |

# **1\. Tổng quan & Phạm vi**

## **1.1. Mục tiêu**

Menu “Quản lý báo giá” cho phép Chuyên viên định giá (Pricing Analyst) khởi tạo và quản lý các báo giá nội bộ gửi cho bộ phận Kinh doanh (Sales), dựa trên Yêu cầu báo giá (RFQ) do Sales tạo.

Trên mỗi báo giá, người dùng xây dựng cấu trúc bảng giá chi tiết theo từng loại dịch vụ (Vận tải, Kho bãi, Khai báo Hải quan, Hải quan Giám sát, Sang tải); mỗi dịch vụ gồm nhiều dòng giá (Cố định, Phụ phí) với Giá mua định mức, Giá bán định mức, Đơn giá báo giá, % Lợi nhuận. Hệ thống tự động tổng hợp giá trị tài chính và theo dõi vòng đời phát hành của báo giá.

## **1.2. Phạm vi hệ thống**

**Trong phạm vi (In-scope):**

* Xem danh sách báo giá kèm bộ chỉ số tổng quan (Tổng số báo giá, Đã phát hành, Tỷ lệ chốt giá); tìm kiếm, lọc, xuất dữ liệu (Export).

* Khởi tạo báo giá với mã do hệ thống tự sinh; chọn Yêu cầu báo giá (RFQ) làm nguồn tự động điền thông tin khách hàng và thông tin dịch vụ → Xây dựng danh sách bảng giá theo loại dịch vụ: Chọn loại dịch vụ → chọn giá trị của thuộc tính → chọn dòng giá cho từng đầu mục giá; nhập Đơn giá; hệ thống tự tính % Lợi nhuận, Tổng đơn giá và Lợi nhuận dự kiến.

* Chỉnh sửa danh sách bảng giá dịch vụ: thêm mới/xóa bảng giá dịch vụ, cập nhật Đơn giá ngay trong danh sách bảng giá.

* Chỉnh sửa báo giá chỉ áp dụng cho báo giá ở trạng thái Nháp hoặc Thu hồi

* Quản lý vòng đời trạng thái phát hành: Nháp, Chờ phê duyệt, Đã phê duyệt,Từ chối, Đã phát hành, Thu hồi, Hết hiệu lực; 

* Ghi nhận Kết quả báo giá (Thành công/Thất bại) tự động từ Báo giá khách hàng.

* Xem chi tiết báo giá (thông tin chung, thông tin dịch vụ, danh sách bảng giá, tổng hợp bảng giá) và Bảng lịch sử hoạt động của Báo giá.

* Phát hành báo giá cho các báo giá ở trạng thái Nháp, Đã phê duyệt, Thu hồi → Người dùng xác nhận  → Phát hành báo giá thành công, Báo giá chuyển trạng thái “Đã phát hành”. Sau khi Phát hành báo giá, Báo giá được hiển thị trong màn chi tiết của Yêu cầu báo giá (RFQ)

* Thu hồi báo giá đã phát hành khi Sale chưa tạo Báo giá khách hàng từ Yêu cầu báo giá đã đính kèm (thao tác tại màn Chi tiết báo giá, có nhập Lý do thu hồi); báo giá chuyển trạng thái Thu hồi, ẩn khỏi màn Yêu cầu báo giá.

* Phân quyền theo chức năng: Xem / Sửa / Phát hành / Xóa; action chỉ hiển thị và thao tác được khi người dùng có quyền tương ứng.

* Luồng phê duyệt ngoại lệ và các trạng thái Chờ duyệt / Đã duyệt / Từ chối / Đã gửi báo giá (Sent Sales): CHƯA triển khai trong giai đoạn này. Thẻ chỉ số “Chờ duyệt ngoại lệ” và các nút chuyển trạng thái Exceptions / Sent Sales trên giao diện tạm thời không có luồng nghiệp vụ đứng sau.

* Chi tiết validate của Export/Import — chỉ mô tả nút (Đang cập nhật).

**Ngoài phạm vi (Out-of-scope):**

* Tạo/sửa/quản lý RFQ (Yêu cầu báo giá) — thuộc phạm vi bộ phận Sales, ngoài tài liệu này; báo giá chỉ liên kết ID RFQ đã tồn tại.

* Luồng phê duyệt ngoại lệ và các trạng thái Chờ duyệt / Đã duyệt / Từ chối / Đã gửi báo giá (Sent Sales): CHƯA triển khai trong giai đoạn này. Thẻ chỉ số “Chờ duyệt ngoại lệ” và các nút chuyển trạng thái Exceptions / Sent Sales trên giao diện tạm thời không có luồng nghiệp vụ đứng sau.

* Quản lý Báo giá khách hàng (bản báo giá chính thức gửi khách hàng) — báo giá nội bộ chỉ nhận kết quả Thành công/Thất bại từ nguồn này; luồng và cơ chế đồng bộ cần làm rõ thêm.

* Kiểm tra ràng buộc ngưỡng lợi nhuận theo menu “Chính sách biên lợi nhuận” — độc lập, chưa liên kết ràng buộc.

* Tạo hợp đồng dịch vụ khách hàng khi báo giá “Thành công” (downstream) — module không trong phạm vi 6 menu hiện tại.

* Quy đổi đa tiền tệ (mặc định VNĐ; các bảng giá dùng chung tiền tệ của báo giá).

* Xem chi tiết Lịch sử chỉnh sửa của báo giá \- View chi tiết toàn bộ bản ghi trước thay đổi và sau thay đổi được đánh giá là không quá cần thiết trong quá trình vận hành và không cho vào phạm vi triển khai dự án.

# **2\. Sơ đồ luồng nghiệp vụ (Business Process Flow)**

[https\://drive.google.com/file/d/1au6UDousRrn\_UgjHlglnhdxQ26z6qh\_2/view?usp=sharing](https://drive.google.com/file/d/1au6UDousRrn_UgjHlglnhdxQ26z6qh_2/view?usp=sharing) 

**Mô tả luồng chính:**

* Bộ phận Sales tạo Yêu cầu báo giá — RFQ (ngoài phạm vi). Chuyên viên định giá khởi tạo báo giá, chọn RFQ chưa gắn báo giá để hệ thống tự động điền thông tin khách hàng và thông tin dịch vụ → Xây dựng danh sách bảng giá theo từng loại dịch vụ: Chọn loại dịch vụ → nhập thuộc tính theo loại dịch vụ, chọn dòng giá cho từng đầu mục giá từ bảng Giá bán định mức, nhập Đơn giá; hệ thống tự tính % Lợi nhuận từng đầu mục, Tổng đơn giá từng bảng giá và Tổng đơn giá dịch vụ của báo giá, % Lợi nhuận dự kiến của báo giá. → Nhấn Lưu, báo giá ở trạng thái Nháp.

* Phát hành báo giá cho Sales (Nháp → Đã phát hành); hệ thống ghi Người phát hành, Thời điểm phát hành và hiển thị báo giá nội bộ trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm.

* Trước khi Sale tạo Báo giá khách hàng, Chuyên viên định giá có thể Thu hồi báo giá Đã phát hành (nhập Lý do thu hồi tại màn Chi tiết báo giá); báo giá chuyển trạng thái Thu hồi, ẩn khỏi màn Chi tiết Yêu cầu báo giá, và vẫn được Phát hành lại hoặc Chỉnh sửa.

* Sales tạo Báo giá khách hàng từ báo giá nội bộ và cập nhật kết quả Thành công/Thất bại; hệ thống tự động ghi nhận Kết quả báo giá cho báo giá nội bộ tham chiếu theo trạng thái Báo giá khách hàng tương ứng. Chỉ số Tỷ lệ chốt (Won) cập nhật theo kết quả.

* Báo giá quá Thời hạn hiệu lực tự động chuyển sang trạng thái Hết hiệu lực, bất kể đang ở trạng thái nào.

* Toàn bộ thao tác trên báo giá được ghi nhận vào Lịch sử hoạt động.

| Tên bước | Actor/Lane | Mô tả chi tiết | Input | Output | Điều kiện/Rule |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tiếp nhận Yêu cầu báo giá | Bộ phận Sales (ngoài phạm vi) | Sales tạo Yêu cầu báo giá (RFQ) từ nhu cầu khách hàng | Nhu cầu khách hàng | RFQ tồn tại (mã RFQ) | Mỗi RFQ chỉ được gắn duy nhất 1 báo giá |
| Khởi tạo báo giá (Thêm mới báo giá) | Chuyên viên định giá | Nhập Tên báo giá, chọn RFQ; Hệ thống tự điền thông tin khách hàng, thông tin dịch vụ | RFQ chưa gắn báo giá | \- | Bắt buộc: Tên báo giá (không trùng), Mã yêu cầu báo giá |
| Xây dựng bảng giá & dòng giá (Thêm mới báo giá) | Chuyên viên định giá | Thêm bảng giá theo loại dịch vụ; nhập thuộc tính; chọn dòng giá cho từng đầu mục giá; nhập Đơn giá | Đầu mục giá (Loại giá: Cố định, Phụ phí), Giá mua/bán định mức  | Bảng giá mới kèm ID tự sinh \+ chỉ tiêu tổng hợp | 1 đầu mục giá – 1 dòng giá; thuộc tính bắt buộc nhập đầy đủ |
| Hoàn tất thêm mới báo giá (Thêm mới báo giá) | Chuyên viên định giá | Nhấn Lưu báo giá. Hệ thống tự sinh Mã báo giá | Form Thêm mới Báo giá đầy đủ thông tin | Báo giá trạng thái Nháp | Điền đầy đủ các trường thông tin bắt buộc |
| Phát hành báo giá | Chuyên viên định giá | Kiểm tra hợp lệ và phát hành cho Sales | Báo giá Nháp / Thu hồi hợp lệ | Báo giá Đã phát hành \+ Người phát hành \+ Thời điểm phát hành Báo giá đã phát hành hiển thị trên Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm | Có ≥ 1 dòng giá và chỉ áp dụng báo giá ở trạng thái “Nháp” hoặc “Thu hồi” |
| Thu hồi báo giá | Chuyên viên định giá | Thu hồi báo giá Đã phát hành tại màn Chi tiết báo giá khi Sale chưa tạo Báo giá khách hàng; nhập Lý do thu hồi và xác nhận | Báo giá Đã phát hành, Sale chưa tạo Báo giá khách hàng (Updating — cơ chế xác định) | Báo giá Thu hồi, ẩn khỏi màn Chi tiết Yêu cầu báo giá, ghi Lịch sử hoạt động | Chỉ áp dụng báo giá Đã phát hành; Lý do thu hồi bắt buộc nhập; dùng chung phân quyền với chức năng Phát hành |
| Cập nhật kết quả báo giá khách hàng | Bộ phận Sales (ngoài phạm vi) | Sale ghi nhận kết quả báo giá ngay trên Báo giá khách hàng.  | Phản hồi từ khách hàng qua Sales | RFQ Thành công / Thất bại | Áp dụng theo trạng thái của Báo giá khách hàng tương ứng, không phụ thuộc trạng thái hiện tại của báo giá nội bộ |
| Ghi nhận kết quả báo giá nội bộ | Hệ thống | Hệ thống ghi nhận lại kết quả thành công/thất bại vào Báo giá nội bộ. | Trạng thái Báo giá khách hàng | Báo giá Thành công / Thất bại | Chỉ áp dụng với Báo giá khách hàng đã có trạng thái Thành công / Thất bại |
| Hết hiệu lực | Hệ thống | Tự động chuyển Hết hiệu lực khi Thời hạn hiệu lực | Báo giá Đã phát hành quá Thời hạn hiệu lực | Báo giá Hết hiệu lực | Áp dụng bất kể báo giá đang ở trạng thái nào |

# **3\. Đặc tả Tính năng**

## **3.1. MODULE: Quản lý báo giá**

### **3.1.1. Danh sách User story**

**Ghi chú độ ưu tiên (MoSCoW):** Must have – không thể thiếu để sản phẩm hoạt động; Should have – rất quan trọng, có thể workaround/trì hoãn; Could have – cải thiện trải nghiệm, làm khi dư nguồn lực.

#### **User story 1: Xem danh sách báo giá và chỉ số tổng quan**

| ID US | US\_QUO\_01 |
| :---- | :---- |
| **Tên Story** | Xem danh sách báo giá và chỉ số tổng quan |
| **User story** | Là Chuyên viên định giá, tôi muốn xem danh sách báo giá kèm các chỉ số tổng quan cùng bộ tìm kiếm/lọc, để nắm nhanh tình trạng toàn bộ báo giá và truy cập nhanh vào từng báo giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Màn danh sách hiển thị 4 thẻ chỉ số:  Tổng báo giá,  Chờ duyệt ngoại lệ,  Đã phát hành,  Tỷ lệ chốt.  Thẻ “Chờ duyệt ngoại lệ” hiển thị 0 (hoặc được ẩn) do luồng phê duyệt ngoài phạm vi (xem BR16). | Sai số liệu thẻ; hoặc thẻ “Chờ duyệt ngoại lệ” hiển thị số \> 0 khi chưa có luồng duyệt. |
| AC2 | Mỗi dòng danh sách hiển thị đúng 10 cột:  Mã báo giá,  Tên báo giá,  Mã yêu cầu báo giá,  Khách hàng,  Tổng đơn giá,  Lợi nhuận dự kiến,  Trạng thái,  Kết quả Thời hạn hiệu lực.  Thao tác. | Thiếu cột hoặc sai dữ liệu hiển thị so với chi tiết báo giá. |
| AC3 | Cột Trạng thái hiển thị một trong 7 giá trị: Nháp, Chờ phê duyệt, Đã phê duyệt, Từ chối, Đã phát hành, Thu hồi, Hết hiệu lực. Cột Kết quả hiển thị Thành công hoặc Thất bại; để trống khi báo giá chưa có kết quả (xem BR2). | Hiển thị Thành công/Thất bại ở cột Trạng thái; hoặc cột Kết quả hiển thị giá trị khi báo giá chưa có kết quả. |
| AC4 | Ô tìm kiếm cho phép tìm theo Mã báo giá / Tên báo giá / Mã yêu cầu báo giá;  Bộ lọc theo Trạng thái / Khách hàng / Hạng khách hàng / Thời gian hiệu lực (Khoảng ngày) chỉ hiển thị báo giá đúng trạng thái đã chọn. Sắp xếp theo các cột: Tổng đơn giá, Lợi nhuận dự kiến,  | Tìm kiếm/lọc trả về sai kết quả hoặc không lọc. |
| AC5 | Các chức năng thao tác trên từng báo giá (Sửa/Xóa) chỉ khả dụng khi người dùng có quyền tương ứng.  Action “Xóa” chỉ hiển thị với báo giá Nháp (xem BR14). | Hiển thị action khi không có quyền; hoặc hiện Phát hành/Xóa trên báo giá không phải Nháp. |
| AC6 | Nút “Export” trên màn danh sách cho phép xuất dữ liệu danh sách. (Chi tiết định dạng/validate Export chưa mô tả trong phiên bản tài liệu này.) | Nút Export không hoạt động hoặc thiếu nút. |
| AC7 | Người dùng KHÔNG có quyền Xem bị chặn truy cập menu và không thấy dữ liệu. | Người dùng không có quyền Xem vẫn xem được danh sách. |

#### **User story 2: Thêm mới báo giá**

| ID US | US\_QUO\_02 |
| :---- | :---- |
| **Tên Story** | Thêm mới báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn thêm mới một báo giá để gửi cho Sale soạn báo giá khách hàng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Các trường bắt buộc gồm Tên báo giá và Mã yêu cầu báo giá liên quan (RFQ), Thời hạn hiệu lực; nếu còn trống, thao tác lưu bị chặn và hệ thống báo lỗi thiếu thông tin bắt buộc. | Cho lưu khi còn trống Tên báo giá hoặc Mã yêu cầu báo giá. |
| AC2 | Danh sách chọn Mã yêu cầu báo giá (RFQ) chỉ hiển thị các yêu cầu báo giá CHƯA gắn báo giá nào & trạng thái “Đang báo giá”;  Các yêu cầu báo giá đã có báo giá không xuất hiện trong danh sách chọn (xem BR1 — quan hệ 1 Yêu cầu báo giá – 1 báo giá). | Danh sách chọn hiển thị cả yêu cầu báo giá đã gắn báo giá; hoặc cho phép tạo báo giá thứ hai cho cùng một yêu cầu báo giá. |
| AC3 | Nhập Tên báo giá trùng với báo giá đã tồn tại: thao tác lưu bị chặn và hệ thống báo “Tên báo giá đã tồn tại”. | Cho tạo báo giá trùng Tên báo giá. |
| AC4 | Khi chọn Mã yêu cầu báo giá (RFQ), hệ thống tự động điền và hiển thị ở chế độ chỉ đọc: Khách hàng (ID \- Tên khách hàng) theo RFQ; Hạng khách hàng theo Khách hàng vừa điền; Ghi chú yêu cầu báo giá lấy từ Ghi chú chung của RFQ. | Chọn RFQ nhưng không tự điền; hoặc cho phép sửa các trường tự điền. |
| AC5 | Khi chọn Mã yêu cầu báo giá (RFQ), nhóm “Thông tin dịch vụ” và “Dịch vụ yêu cầu” (danh sách dịch vụ được yêu cầu kèm các thông tin yêu cầu tương ứng) được tự động điền từ RFQ, hiển thị chỉ đọc: Loại hình xuất nhập khẩu, Nhóm hàng, Đặc tính hàng hóa, Loại xe, Quy cách đóng gói, Ghi chú yêu cầu dịch vụ và thông tin từng dịch vụ yêu cầu. | Không tự điền nhóm Thông tin dịch vụ; hoặc không hiển thị đủ các giá trị khi RFQ có nhiều giá trị. Không hiển thị nhóm "Dịch vụ yêu cầu"; hoặc hiển thị khi chưa chọn RFQ; hoặc cho phép chỉnh sửa dữ liệu nhóm này. |
| AC6 | Các đầu mục xuất hiện trong bảng giá dịch vụ chỉ gồm các đầu mục có Loại giá thuộc {Cố định, Phụ phí} và được Kích hoạt;  Đầu mục có Loại giá “Phát sinh” và Đầu mục không được kích hoạt KHÔNG xuất hiện trong bảng giá dịch vụ (xem BR5). | Bảng giá dịch vụ hiển thị đầu mục có Loại giá Phát sinh. |
| AC7 | Tại nhóm Danh sách bảng giá, người dùng thêm mới bảng giá dịch vụ (chi tiết luồng tại US\_QUO\_04) hoặc xóa bảng giá dịch vụ (chi tiết tại US\_QUO\_05) và sửa Đơn giá của dòng giá (chi tiết tại US\_QUO\_06).  Sau mỗi thao tác thêm mới/xóa, hệ thống tự động tính lại Lợi nhuận (%) của dòng giá (theo BR6), Tổng đơn giá của bảng giá, Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%) (theo BR9, BR10). Trong mỗi loại dịch vụ có thể có nhiều bảng giá. | Không thêm/xóa được bảng giá; hoặc Tổng đơn giá dịch vụ và Lợi nhuận dự kiến (%) không được tính lại sau thao tác. |
| AC8 | Trường Đơn giá trong bảng giá dịch vụ là bắt buộc (đối với tất cả các dòng giá) Nếu còn trống khi lưu, thao tác lưu bị chặn và hệ thống báo lỗi thiếu thông tin bắt buộc. | Cho lưu khi còn trống Đơn giá. |
| AC9 | Khi lưu hợp lệ, báo giá được lưu ở trạng thái Nháp và điều hướng sang màn chi tiết/soạn thảo; thao tác Hủy không lưu bất kỳ thay đổi nào. Hệ thống tự sinh Mã báo giá theo cấu trúc IPSYYMMDD-XXX (IPS: tiền tố cố định; YY: 2 số cuối của năm, MM: tháng, DD: ngày tạo hiện tại; XXX: số thứ tự tạo trong ngày, bắt đầu từ 001); trường này ở chế độ chỉ đọc, người dùng không được chỉnh sửa (xem BR11) | Lưu thành công nhưng trạng thái không phải Nháp; hoặc Hủy vẫn lưu. Không tự sinh mã; sai cấu trúc mã; hoặc cho phép người dùng sửa Mã báo giá. |
| AC10 | Người dùng KHÔNG có quyền Tạo: nút “Thêm mới báo giá” bị ẩn và thao tác tạo bị chặn. | Người dùng không có quyền vẫn tạo được báo giá. |
| AC11 | Khi nhấn "Tạo báo giá", hệ thống đối chiếu các dịch vụ được yêu cầu (có tick trong RFQ) với Loại dịch vụ của các bảng giá dịch vụ đã tạo trong báo giá. Nếu có dịch vụ được yêu cầu (Loại dịch vụ của dịch vụ yêu cầu) mà chưa tạo bảng giá dịch vụ có Loại dịch vụ tương ứng, hệ thống hiển thị cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo báo giá?" — người dùng Xác nhận thì tiếp tục tạo, Hủy thì quay lại màn tạo (xem BR27). | Không kiểm tra/không cảnh báo khi thiếu bảng giá của dịch vụ được yêu cầu; hoặc chặn cứng không cho tạo báo giá. |

#### **User story 3: Chỉnh sửa báo giá**

| ID US | US\_QUO\_03 |
| :---- | :---- |
| **Tên Story** | Chỉnh sửa báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn chỉnh sửa một báo giá đang ở trạng thái Nháp trên màn hình có sẵn dữ liệu đã tạo, để hoàn thiện báo giá trước khi phát hành. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Chỉnh sửa chỉ khả dụng với báo giá ở trạng thái Nháp / Từ chối / Thu hồi; với báo giá ở các trạng thái khác (Chờ phê duyệt, Đã phê duyệt, Đã phát hành/Hết hiệu lực), chức năng bị ẩn và thao tác chỉnh sửa bị chặn (xem BR3). | Mở được màn chỉnh sửa với báo giá không ở trạng thái Nháp/Từ chối. |
| AC2 | Màn Chỉnh sửa báo giá có bố cục và các nhóm thông tin giống màn Thêm mới báo giá (Thông tin chung, Thông tin dịch vụ, Danh sách bảng giá, Tổng hợp bảng giá), với toàn bộ dữ liệu đã tạo được hiển thị sẵn. | Thiếu nhóm thông tin; hoặc dữ liệu đã lưu không được hiển thị sẵn. |
| AC3 | Mã báo giá giữ nguyên giá trị đã sinh khi tạo và ở chế độ chỉ đọc.  Các trường Tên báo giá, thời hạn hiệu lực, Điều kiện áp dụng: cho phép sửa;  Các trường Tên báo giá, thời hạn hiệu lực: Bắt buộc điền Hệ thống kiểm tra trùng tên với các báo giá khác (không tính chính báo giá đang sửa). | Mã báo giá bị thay đổi khi sửa; hoặc báo trùng tên với chính báo giá đang chỉnh sửa. Các trường bắt buộc để trống vẫn Lưu chỉnh sửa thành công. |
| AC4 | Khi người dùng đổi sang Mã yêu cầu báo giá (RFQ) khác, danh sách chọn vẫn chỉ hiển thị các yêu cầu báo giá chưa gắn báo giá (cộng thêm RFQ đang gắn với chính báo giá này);  Hệ thống tự điền lại Khách hàng, Hạng khách hàng, Ghi chú yêu cầu báo giá, nhóm Thông tin dịch vụ và các dịch vụ yêu cầu theo RFQ mới.  | Đổi RFQ nhưng các thông tin tự điền không được cập nhật lại theo RFQ mới. |
| AC5 | Trong màn Chỉnh sửa, người dùng thêm mới/xóa bảng giá dịch vụ (US\_QUO\_04, US\_QUO\_05) và cập nhật Đơn giá của dòng giá (US\_QUO\_06) ngay trong Danh sách bảng giá; sau mỗi thao tác, hệ thống tự động tính lại Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%). | Các chỉ tiêu tổng hợp không được tính lại sau thao tác thêm/xóa bảng giá hoặc cập nhật Đơn giá. |
| AC6 | Trường Đơn giá trong bảng giá dịch vụ là bắt buộc (đối với tất cả các dòng giá) Nếu còn trống khi lưu, thao tác lưu bị chặn và hệ thống báo lỗi thiếu thông tin bắt buộc. | Cho lưu khi còn trống Đơn giá. |
| AC7 | Khi lưu thay đổi hợp lệ, hệ thống cập nhật báo giá, giữ nguyên trạng thái và ghi nhận thao tác vào Lịch sử hoạt động (xem BR17); thao tác Hủy không lưu bất kỳ thay đổi nào. | Lưu thay đổi làm đổi trạng thái báo giá; không ghi nhận Lịch sử hoạt động; hoặc Hủy vẫn lưu. |
| AC8 | Người dùng KHÔNG có quyền Sửa: chức năng Chỉnh sửa bị ẩn và thao tác bị chặn. | Người dùng không có quyền vẫn chỉnh sửa được báo giá. |
| AC9 | Khi nhấn "Tạo báo giá", hệ thống đối chiếu các dịch vụ được yêu cầu (có tick trong RFQ) với Loại dịch vụ của các bảng giá dịch vụ đã tạo trong báo giá. Nếu có dịch vụ được yêu cầu (Loại dịch vụ của dịch vụ yêu cầu) mà chưa tạo bảng giá dịch vụ có Loại dịch vụ tương ứng, hệ thống hiển thị cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo báo giá?" — người dùng Xác nhận thì tiếp tục tạo, Hủy thì quay lại màn tạo (xem BR27). | Không kiểm tra/không cảnh báo khi thiếu bảng giá của dịch vụ được yêu cầu; hoặc chặn cứng không cho tạo báo giá. |

#### **User story 4: Thêm bảng giá dịch vụ trong báo giá**

| ID US | US\_QUO\_04 |
| :---- | :---- |
| **Tên Story** | Thêm bảng giá dịch vụ trong báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn thêm một bảng giá dịch vụ ngay trong màn Thêm mới/Chỉnh sửa báo giá bằng cách nhập thuộc tính dịch vụ và chọn dòng giá cho từng đầu mục giá, để dựng cấu trúc giá của báo giá theo đúng dữ liệu định mức đã có. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Tại màn Tạo/Sửa Báo giá, nhấn “Thêm bảng giá dịch vụ” mở modal “Thêm bảng giá dịch vụ mới” với các trường bắt buộc: Loại dịch vụ, Tên bảng giá cụ thể. | Không mở được modal; hoặc modal thiếu trường bắt buộc Loại dịch vụ / Tên bảng giá cụ thể. |
| AC2 | Khi chọn Loại dịch vụ, hệ thống hiển thị: (a) bộ thông tin thuộc tính tương ứng với loại dịch vụ đã chọn; (b) danh sách giá gồm 9 cột theo thứ tự: ID, Đầu mục giá, Loại giá, Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức, Đơn giá, Lợi nhuận (%). Bổ sung ràng buộc: Dropdown "Loại dịch vụ" chỉ hiển thị các loại dịch vụ có trong Dịch vụ yêu cầu của Yêu cầu báo giá (RFQ) đã chọn; loại dịch vụ không được yêu cầu trong RFQ không xuất hiện trong dropdown (xem BR25). | Chọn Loại dịch vụ nhưng không hiển thị bộ thuộc tính tương ứng; hoặc danh sách giá sai/thiếu cột so với đặc tả. Dropdown Loại dịch vụ hiển thị cả loại dịch vụ không có trong Dịch vụ yêu cầu của RFQ. |
| AC3 | Danh sách giá hiển thị các dòng đầu mục giá lấy từ cấu hình đầu mục giá;  \- Chỉ hiển thị các đầu mục có Loại giá thuộc {Cố định, Phụ phí}, và được kích hoạt. KHÔNG hiển thị đầu mục có Loại giá “Phát sinh” và đầu mục không kích hoạt (xem BR5).  \- Mỗi đầu mục giá có nút chọn dòng giá nằm trong chính đầu mục đó và chỉ được chọn 1 dòng giá (quan hệ 1 đầu mục giá – 1 dòng giá, xem BR18). | Hiển thị đầu mục Loại giá Phát sinh; danh sách đầu mục không lấy từ cấu hình đầu mục giá; hoặc một đầu mục cho phép chọn nhiều hơn 1 dòng giá. |
| AC4 | Người dùng nhập giá trị cho bộ thông tin thuộc tính;  Các thuộc tính bắt buộc nhập đầy đủ.  Khi nhấn nút chọn dòng giá của một đầu mục, hệ thống hiển thị danh sách dòng giá đã được lọc theo:  (a) đầu mục giá chứa nút chọn;  (b) các giá trị thuộc tính người dùng đã nhập. Bổ sung: Các trường thuộc tính là dropdown và chỉ chọn trong phạm vi giá trị đã nhập tại Yêu cầu báo giá theo bảng ánh xạ "Nguồn giá trị các trường thuộc tính" (mục 3.1.2) — xem BR25. Riêng Điểm đi, Điểm đến vẫn chọn tự do từ danh mục hệ thống, không giới hạn theo RFQ. | Cho chọn dòng giá khi chưa nhập đủ thuộc tính bắt buộc; hoặc danh sách dòng giá không được lọc theo đầu mục và giá trị thuộc tính đã nhập. Trường thuộc tính cho nhập/chọn giá trị ngoài phạm vi giá trị đã nhập tại Yêu cầu báo giá. |
| AC5 | Dòng giá đã chọn được điền vào đúng đầu mục giá tương ứng trong modal (Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức);  Đơn giá là trường bắt buộc trong bảng giá dịch vụ. Đơn giá mặc định bằng Giá bán định mức và cho phép người dùng cập nhật.  Khi có Đơn giá/cập nhật Đơn giá, hệ thống tự động tính lại Lợi nhuận (%) của dòng theo BR6; trường Lợi nhuận (%) ở chế độ chỉ đọc. | Dòng giá được điền sai đầu mục; Đơn giá mặc định không bằng Giá bán định mức; hoặc Lợi nhuận (%) không tự tính lại. |
| AC6 | Nhấn nút “Tạo bảng giá dịch vụ”:  Một bảng giá mới được thêm vào Danh sách bảng giá của báo giá  Hệ thống tự động sinh ID cho bảng giá theo cấu trúc: IQYYMM-XXX, trong đó: IQ (Internal Quote) là tiền tố cố định YYMM là 2 số cuối của năm/tháng hiện tại XXX bắt đầu từ 001  Hệ thống tự động sinh ID riêng cho từng dòng giá trong bảng giá (xem BR19).  Hệ thống tự động tính lại Tổng đơn giá của bảng giá, Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%). | Không tạo được bảng giá; không tự sinh ID bảng giá hoặc ID dòng giá; hoặc các chỉ tiêu tổng hợp không được tính lại. |
| AC7 | Nhấn “Tạo bảng giá dịch vụ” khi còn trống trường bắt buộc (Loại dịch vụ, Tên bảng giá cụ thể, Đơn giá của tất cả dòng giá) hoặc chưa nhập đủ thuộc tính bắt buộc: hệ thống chặn tạo và báo lỗi thiếu thông tin bắt buộc. | Cho tạo bảng giá khi còn thiếu trường bắt buộc hoặc thuộc tính bắt buộc. |
| AC8 | Nhấn “Tạo bảng giá dịch vụ” khi chưa chọn dòng giá cho tất cả đầu mục giá: hệ thống chặn tạo và báo “Vui lòng chọn đầy đủ dòng giá trong các đầu mục”. | Tạo được bảng giá dịch vụ có đầu mục trống dòng giá. |
| AC9 | Thao tác Hủy trong modal không tạo bảng giá và không thay đổi dữ liệu báo giá. | Hủy modal nhưng bảng giá vẫn được thêm vào báo giá. |
| AC10 | Được phép tạo nhiều bảng giá trong 1 loại dịch vụ.   | Chỉ được tạo 1 bảng giá trong 1 loại dịch vụ. Tạo đến bảng thứ 2 hệ thống báo lỗi. |
| AC11 | Khi nhấn "Tạo bảng giá dịch vụ", hệ thống kiểm tra bộ thuộc tính của bảng giá đang tạo với các bảng giá dịch vụ khác đã tạo trong cùng báo giá: Nếu trùng toàn bộ (cùng Loại dịch vụ và trùng giá trị của tất cả trường thuộc tính) → chặn tạo và báo "Bộ thuộc tính của dịch vụ này đã trùng với {ID – Tên bảng giá}. Vui lòng chọn bộ thông tin khác." (xem BR29). Chỉ khác Tên bảng giá KHÔNG được coi là khác bộ thuộc tính. | Tạo được 2 bảng giá dịch vụ có cùng Loại dịch vụ và trùng toàn bộ giá trị thuộc tính trong cùng một báo giá. |

#### **Use story 5: Xóa bảng giá dịch vụ**

| ID US | US\_QUO\_05 |
| :---- | :---- |
| **Tên Story** | Xóa bảng giá dịch vụ |
| **User Story** | Là Chuyên viên định giá, tôi muốn xóa một bảng giá dịch vụ khỏi báo giá đang ở trạng thái Nháp, để loại bỏ bảng giá không còn phù hợp và giữ báo giá đúng với phạm vi dịch vụ thực tế. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Xóa bảng giá dịch vụ hiển thị trên từng bảng giá trong nhóm Danh sách bảng giá tại màn Thêm mới/Chỉnh sửa báo giá. | Xóa được bảng giá khi báo giá không ở trạng thái Nháp; hoặc không có chức năng xóa trên từng bảng giá. |
| AC2 | Khi nhấn Xóa, hệ thống hiển thị bước xác nhận “Bạn có chắc muốn xóa bảng giá dịch vụ này?” trước khi thực hiện. | Xóa ngay không có bước xác nhận. |
| AC3 | Sau khi xác nhận, bảng giá dịch vụ và toàn bộ dòng giá thuộc bảng giá đó bị loại khỏi báo giá. | Bảng giá bị xóa nhưng các dòng giá thuộc bảng vẫn còn trong báo giá. |
| AC4 | Sau khi xóa, hệ thống tự động tính lại Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%) của báo giá (xem BR9, BR10). | Các chỉ tiêu tổng hợp không được tính lại sau khi xóa bảng giá. |
| AC5 | Khi xóa bảng giá cuối cùng, báo giá không còn dòng giá nào; hệ thống vẫn cho lưu báo giá ở trạng thái Nháp nhưng chặn phát hành theo điều kiện tối thiểu 1 dòng giá (xem BR14). | Chặn xóa bảng giá cuối cùng; hoặc cho phát hành báo giá không còn dòng giá nào. |
| AC6 | Người dùng KHÔNG có quyền Xóa: chức năng Xóa bảng giá dịch vụ bị ẩn và thao tác bị chặn. | Người dùng không có quyền vẫn xóa được bảng giá dịch vụ. |

#### **Use story 6: Sửa đơn giá trong bảng giá dịch vụ**

| ID US | US\_QUO\_06 |
| :---- | :---- |
| **Tên Story** | Sửa đơn giá trong bảng giá dịch vụ |
| **User Story** | Là Chuyên viên định giá, tôi muốn sửa Đơn giá của từng dòng giá ngay trong Danh sách bảng giá của báo giá, để điều chỉnh nhanh giá chào mà không phải mở lại modal bảng giá. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Trường Đơn giá của từng dòng giá cho phép chỉnh sửa trực tiếp trong nhóm Danh sách bảng giá tại màn Thêm mới/Chỉnh sửa báo giá. | Sửa được Đơn giá khi báo giá không ở trạng thái Nháp; hoặc phải mở lại modal mới sửa được Đơn giá. |
| AC2 | Các trường Mã giá bán định mức, Đơn vị, Giá mua định mức, Giá bán định mức của dòng giá giữ nguyên giá trị và ở chế độ chỉ đọc khi người dùng sửa Đơn giá. | Giá mua định mức hoặc Giá bán định mức bị thay đổi khi sửa Đơn giá. |
| AC3 | Sau mỗi lần sửa Đơn giá, hệ thống tự động tính lại theo thứ tự: Lợi nhuận (%) của dòng giá (BR6) → Tổng đơn giá của bảng giá (BR9) → Tổng đơn giá dịch vụ (chưa bao gồm VAT) và Lợi nhuận dự kiến (%) của báo giá (BR9, BR10). | Một trong các chỉ tiêu Lợi nhuận (%), Tổng đơn giá bảng giá, Tổng đơn giá dịch vụ, Lợi nhuận dự kiến không được tính lại. |
| AC4 | Nhập Đơn giá không hợp lệ (không phải số hoặc nhỏ hơn 0): hệ thống chặn nhập và không cập nhật dòng giá. | Nhập thành công giá trị âm hoặc không phải số. |

#### **User story 7: Xem chi tiết báo giá**

| ID US | US\_QUO\_07 |
| :---- | :---- |
| **Tên Story** | Xem chi tiết báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn xem chi tiết đầy đủ một báo giá gồm thông tin chung, thông tin phát hành, thông tin dịch vụ và danh sách bảng giá và lịch sử hoạt động, để rà soát trước khi phát hành và tra cứu khi cần. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Phần tiêu đề màn chi tiết hiển thị: Mã báo giá và Trạng thái báo giá. | Thiếu Mã báo giá hoặc Trạng thái báo giá ở phần tiêu đề. |
| AC2 | Nhóm Thông tin chung hiển thị: Tên báo giá, Mã yêu cầu báo giá liên quan (RFQ), Khách hàng (ID \- Tên khách hàng), Hạng khách hàng, Ghi chú yêu cầu báo giá, Thời hạn hiệu lực, Điều kiện áp dụng. | Thiếu/sai trường trong nhóm Thông tin chung. |
| AC3 | Nhóm Thông tin phát hành báo giá hiển thị: Người tạo, Người phát hành, Thời điểm phát hành, Kết quả báo giá (Thành công/Thất bại). Với báo giá nội bộ chưa có kết quả (từ báo giá khách hàng), các trường Người phát hành, Thời điểm phát hành và Kết quả phát hành để trống. | Thiếu nhóm Thông tin phát hành; hoặc hiển thị Người phát hành/Thời điểm phát hành khi báo giá chưa phát hành. |
| AC4 | Nhóm Thông tin dịch vụ hiển thị: Loại hình xuất nhập khẩu, Nhóm hàng, Đặc tính hàng hóa, Loại xe, Quy cách đóng gói, Ghi chú yêu cầu dịch vụ. | Thiếu/sai trường trong nhóm Thông tin dịch vụ. |
| AC5 | Nhóm Danh sách bảng giá hiển thị với mỗi bảng giá: Loại dịch vụ, Tên bảng giá, Các thuộc tính (theo loại dịch vụ), Tiền tệ, Bảng giá theo các đầu mục (8 cột: Mã dòng giá (ID), Đầu mục giá, Loại giá, Giá mua định mức, Mã giá bán định mức, Giá bán định mức, Đơn vị, Đơn giá, Lợi nhuận (%)) và Tổng đơn giá. Đối với dịch vụ có trong Yêu cầu báo giá nhưng không chưa bảng giá nào, hệ thống hiển thị badge cảnh báo. | Thiếu bảng giá, thiếu cột trong bảng đầu mục hoặc thiếu Tổng đơn giá. |
| AC6 | Mỗi bảng giá dịch vụ trong section Danh sách bảng giá có chức năng mở rộng/thu gọn: ở trạng thái thu gọn chỉ hiển thị ID \- Tên bảng giá dịch vụ; ở trạng thái mở rộng hiển thị đầy đủ nội dung bảng giá (thuộc tính, bảng giá theo các đầu mục, Tổng đơn giá). | Không có chức năng mở rộng/thu gọn; hoặc trạng thái thu gọn vẫn hiển thị nội dung ngoài ID \- Tên bảng giá dịch vụ. |
| AC7 | Nhóm Tổng hợp bảng giá hiển thị: Tổng đơn giá dịch vụ (chưa bao gồm VAT), Lợi nhuận dự kiến (%), Đơn vị tiền tệ. | Thiếu/sai chỉ tiêu trong nhóm Tổng hợp bảng giá. |
| AC8 | Nhóm Lịch sử hoạt động hiển thị danh sách các thao tác đã thực hiện trên báo giá, gồm đúng 4 cột: Thời gian, Người thực hiện, Hành động, Nội dung. | Thiếu nhóm Lịch sử hoạt động; hoặc thiếu/thừa cột so với đặc tả. |
| AC9 | Mỗi thao tác làm thay đổi báo giá (tạo mới, chỉnh sửa, phát hành, cập nhật kết quả, hết hiệu lực) đều được hệ thống tự động ghi nhận thành một bản ghi trong Lịch sử hoạt động (xem BR17). Danh sách lịch sử ở chế độ chỉ xem danh sách, không xem chi tiết, chỉnh sửa hoặc xóa. | Thao tác thay đổi báo giá không được ghi nhận vào Lịch sử hoạt động; hoặc cho phép xem chi tiết/chỉnh sửa/xóa bản ghi lịch sử. |
| AC10 | Màn Chi tiết báo giá hiển thị nhóm "Dịch vụ yêu cầu" (lấy từ Yêu cầu báo giá đã gắn). Nếu có dịch vụ được yêu cầu nhưng chưa có bảng giá dịch vụ tương ứng, hệ thống hiển thị cảnh báo trong tab dịch vụ "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}" (xem BR28). | Không hiển thị nhóm "Dịch vụ yêu cầu"; hoặc không cảnh báo khi có dịch vụ được yêu cầu nhưng chưa được báo giá. |

#### **User story 8: Phát hành báo giá**

| ID US | US\_QUO\_08 |
| :---- | :---- |
| **Tên Story** | Phát hành báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn phát hành một báo giá Nháp cho bộ phận Sales, để chốt bảng giá và bắt đầu theo dõi kết quả. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Phát hành chỉ hiển thị với báo giá ở trạng thái Nháp / Đã phê duyệt / Thu hồi. Các trạng thái còn lại không hiển nút Phát hành (Chờ phê duyệt, Từ chối, Đã phát hành, Hết hiệu lực) và chặn không cho phép phát hành báo giá. | Các trạng thái khác vẫn hiển thị nút và vẫn có thể phát hành báo giá. |
| AC2 | Khi người dùng thực hiện chức năng Phát hành, hệ thống kiểm tra điều kiện phát hành: báo giá có tối thiểu 1 dòng giá. | Cho phát hành báo giá không có dòng giá nào. |
| AC3 | Khi điều kiện phát hành hợp lệ: trạng thái chuyển sang Đã phát hành; hệ thống ghi nhận Người phát hành là người thực hiện thao tác và Thời điểm phát hành là thời điểm thao tác. | Không chuyển trạng thái; hoặc không ghi Người phát hành/Thời điểm phát hành. |
| AC4 | Sau khi chuyển sang trạng thái Đã phát hành, báo giá bị khóa chức năng xóa báo giá. | Còn cho phép xóa báo giá sau khi Đã phát hành. |
| AC5 | Sau khi phát hành thành công: hệ thống cập nhật thẻ chỉ số “Đã phát hành” và hiển thị thông báo “Phát hành báo giá thành công” và ghi nhận thao tác vào Lịch sử hoạt động. | Thẻ chỉ số không tăng; hoặc không có thông báo phát hành; hoặc không ghi nhận Lịch sử hoạt động. |
| AC6 | Sau khi phát hành thành công, báo giá nội bộ được hiển thị trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm; áp dụng cho mọi lần phát hành, kể cả phát hành lại từ trạng thái Thu hồi. | Phát hành thành công nhưng báo giá nội bộ không hiển thị trên màn Chi tiết Yêu cầu báo giá. |
| AC7 | Người dùng KHÔNG có quyền Phát hành: chức năng Phát hành bị ẩn và thao tác bị chặn. | Người dùng không có quyền vẫn phát hành được. |

#### **User story 9: Ghi nhận kết quả và xử lý hết hiệu lực**

| ID US | US\_QUO\_09 |
| :---- | :---- |
| **Tên Story** | Ghi nhận kết quả và xử lý hết hiệu lực |
| **User story** | Là Chuyên viên định giá, tôi muốn hệ thống ghi nhận kết quả của báo giá đã phát hành và tự chuyển Hết hiệu lực khi quá hạn, để phản ánh đúng kết quả kinh doanh và phục vụ theo dõi Tỷ lệ chốt. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Hệ thống đồng bộ kết quả báo giá từ báo giá khách hàng: Báo giá được ghi nhận Kết quả Thành công hoặc Thất bại theo trạng thái tương ứng của Báo giá khách hàng (xem BR20)  | Cho cập nhật kết quả với báo giá chưa phát hành; hoặc kết quả không khớp với ghi nhận từ Báo giá khách hàng. |
| AC2 | Một báo giá Đã phát hành có Thời hạn hiệu lực đã qua và được hệ thống tự động chuyển sang trạng thái Hết hiệu lực (xem BR2). | Báo giá quá hạn vẫn ở trạng thái Đã phát hành; hoặc báo giá đã Thành công/Thất bại bị chuyển Hết hiệu lực. |
| AC3 | Chỉ số Tỷ lệ chốt (Won) trên màn danh sách: công thức tính đang Updating — chưa chốt, cần bổ sung trước khi phát triển (xem BR14 và Mục 4). | Triển khai công thức Tỷ lệ chốt khi chưa được chốt chính thức. |
| AC4 | Khi trạng thái báo giá thay đổi (phát hành / có kết quả / hết hiệu lực), các thẻ chỉ số tổng quan trên màn danh sách được cập nhật tương ứng và thao tác được ghi nhận vào Lịch sử hoạt động. | Chỉ số tổng quan không cập nhật khi trạng thái đổi. |

#### **User story 10: Xóa báo giá** 

| ID US | US\_QUO\_10 |
| :---- | :---- |
| **Tên Story** | Xóa báo giá và phân quyền chức năng |
| **User story** | Là Chuyên viên định giá, tôi muốn xóa các báo giá Nháp không dùng đến và hệ thống kiểm soát mọi thao tác theo phân quyền, để giữ dữ liệu gọn gàng và đảm bảo an toàn vận hành. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

**Tiêu chí chấp nhận (Acceptance Criteria):**

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Với một báo giá ở trạng thái Nháp, thao tác Xóa hiển thị bước xác nhận trước khi xóa; sau khi xác nhận, báo giá bị xóa khỏi danh sách. | Xóa không có bước xác nhận. |
| AC2 | Với một báo giá KHÔNG ở trạng thái Nháp (Chờ phê duyệt, Đã phê duyệt, Từ chối, Đã phát hành, Thu hồi/Hết hiệu lực), thao tác xóa bị chặn và hệ thống báo “Chỉ được xóa báo giá ở trạng thái Nháp” (xem BR13). | Cho xóa báo giá đã phát hành hoặc đã có kết quả. |
| AC3 | Khi một báo giá bị xóa, Yêu cầu báo giá đã gắn với báo giá đó được giải phóng và xuất hiện trở lại trong danh sách chọn RFQ của báo giá mới (xem BR1). | Yêu cầu báo giá vẫn bị coi là đã gắn báo giá sau khi báo giá bị xóa. |

#### **User story 11: Thu hồi báo giá**

| ID US | US\_QUO\_11 |
| :---- | :---- |
| **Tên Story** | Thu hồi báo giá |
| **User story** | Là Chuyên viên định giá, tôi muốn thu hồi một báo giá đã phát hành khi Sale chưa tạo Báo giá khách hàng, để điều chỉnh lại báo giá trước khi Sale tiếp tục xử lý với khách hàng. |
| **Độ Ưu tiên** | Must have |
| **Module** | Quản lý báo giá |
| **Người Phụ trách (Owner)** | \[Tên BA\] |

Tiêu chí chấp nhận (Acceptance Criteria):

| STT | Tiêu chí Chấp nhận (AC) | Điều kiện Thất bại (Negative) |
| :---- | :---- | :---- |
| AC1 | Chức năng Thu hồi hiển thị tại màn Chi tiết báo giá, chỉ áp dụng với báo giá ở trạng thái "Đã phát hành" và khi Sale CHƯA nhấn "Tạo báo giá khách hàng" trên Yêu cầu báo giá (RFQ) đã đính kèm. | Hiển thị/thực hiện được Thu hồi khi Sale đã tạo Báo giá khách hàng. |
| AC2 | Nhấn "Thu hồi" mở popup xác nhận gồm trường Lý do thu hồi (text area, bắt buộc nhập, tối đa 500 ký tự). | Mở được popup Thu hồi mà không có trường Lý do thu hồi; hoặc cho xác nhận khi để trống Lý do thu hồi. |
| AC3 | Nhấn "Xác nhận" trên popup: báo giá chuyển trạng thái "Thu hồi", hệ thống ghi nhận Lý do thu hồi vào Lịch sử hoạt động và hiển thị thông báo "Thu hồi báo giá thành công". | Không chuyển trạng thái; hoặc không ghi nhận Lịch sử hoạt động; hoặc không có thông báo thành công. |
| AC4 | Sau khi Thu hồi, báo giá không còn hiển thị trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm; Yêu cầu báo giá vẫn giữ nguyên liên kết 1-1 với báo giá này, không được giải phóng để gắn báo giá khác (xem BR1). Trạng thái Yêu cầu báo giá chuyển sang ”Đang báo giá” | Yêu cầu báo giá được giải phóng để chọn cho báo giá khác sau khi Thu hồi. Trạng thái Yêu cầu báo giá không thay đổi |
| AC5 | Báo giá ở trạng thái "Thu hồi" vẫn được Phát hành báo giá (US\_QUO\_08) và Chỉnh sửa báo giá (US\_QUO\_03); riêng chức năng Xóa vẫn KHÔNG áp dụng (chỉ áp dụng trạng thái Nháp — xem BR13). | Chặn Phát hành hoặc Chỉnh sửa báo giá đang ở trạng thái Thu hồi; hoặc cho phép Xóa báo giá Thu hồi. |
| AC6 | Báo giá "Thu hồi" quá Thời hạn hiệu lực vẫn tự động chuyển "Hết hiệu lực" như mọi trạng thái khác, không có ngoại lệ (xem BR2). | Báo giá Thu hồi quá hạn không tự chuyển Hết hiệu lực. |
| AC7 | Thao tác Thu hồi chỉ được sử dụng khi người dùng được phân quyền Thu hồi; người dùng KHÔNG có quyền Thu hồi thì chức năng Thu hồi cũng bị ẩn và thao tác bị chặn. | Người dùng không có quyền Thu hồi vẫn thu hồi được báo giá. |
| AC8 | Thao tác Hủy trong popup Thu hồi không thay đổi trạng thái báo giá và không lưu Lý do thu hồi. | Hủy popup nhưng báo giá vẫn chuyển sang trạng thái Thu hồi. |

### **3.1.2. Mô tả giao diện (Reviewing)**

* Ảnh giao diện: \[Chèn ảnh MH Danh sách báo giá / MH Thêm mới báo giá / MH Thêm mới báo giá / MH Xem chi tiết báo giá / Modal Thêm bảng giá dịch vụ mới\]

* Link UI Design: \[Chèn link\]

* Mô tả: Menu gồm 3 màn chính — Danh sách báo giá (thẻ chỉ số \+ bảng danh sách 10 cột \+ tìm kiếm/lọc/Export); Thêm mới báo giá và Chỉnh sửa báo giá (4 nhóm: Thông tin chung, Thông tin dịch vụ, Dịch vụ yêu cầu, Danh sách bảng giá, Tổng hợp bảng giá); Modal Thêm giá dịch vụ; Xem chi tiết báo giá (7 nhóm hiển thị, gồm Lịch sử hoạt động) và mỗi bảng giá dịch vụ có chức năng mở rộng/thu gọn.

* Ghi chú đổi tên hiển thị (áp dụng từ bản cập nhật này): nhãn hiển thị trên giao diện của thành phần "Bảng giá (dịch vụ)" được đổi thành "Dịch vụ" để tránh nhầm lẫn giữa các bảng giá — cụ thể: "Danh sách bảng giá" → "Danh sách dịch vụ"; "Thêm bảng giá dịch vụ" → "Thêm dịch vụ"; "Tạo bảng giá dịch vụ" → "Thêm dịch vụ"; "Xóa bảng giá dịch vụ" → "Xóa dịch vụ"; "ID/Tên bảng giá" → "ID/Tên dịch vụ"; "Tổng hợp bảng giá" → "Tổng hợp tài chính". Trong phần User story, Business Rule, bảng thông báo và các mục còn lại của tài liệu, thuật ngữ "bảng giá dịch vụ" được GIỮ NGUYÊN để không phá vỡ tham chiếu tài liệu; hai tên gọi cùng chỉ một đối tượng (xem BR30).

**Bảng 1 — Màn Danh sách báo giá: các cột hiển thị**

| STT | Tên cột | Mô tả |
| :---- | :---- | :---- |
| 1 | Mã báo giá | Mã do hệ thống tự sinh theo cấu trúc IPSYYMMDD-XXX |
| 2 | Tên báo giá | Tên do người dùng đặt, không trùng |
| 3 | Mã yêu cầu báo giá | Mã Yêu cầu báo giá (RFQ) mà báo giá liên kết |
| 4 | Khách hàng | Khách hàng theo Yêu cầu báo giá đã chọn (ID \- Tên khách hàng) |
| 5 | Hạng khách hàng | Hạng của khách hàng tương ứng |
| 6 | Tổng đơn giá | Tổng đơn giá dịch vụ của báo giá (chưa bao gồm VAT) |
| 7 | Lợi nhuận dự kiến | Tỷ lệ lợi nhuận dự kiến của báo giá (%) |
| 8 | Trạng thái | Nháp / Chờ phê duyệt / Đã phê duyệt / Từ chối / Đã phát hành / Thu hồi / Hết hiệu lực |
| 9 | Kết quả | Thành công / Thất bại; để trống khi báo giá chưa có kết quả ghi nhận từ Báo giá khách hàng |
| 10 | Thời hạn hiệu lực | Ngày hết hạn hiệu lực của báo giá |

**Bảng 2 — Màn Thêm mới báo giá: các trường thông tin**

***Nhóm 1 – Thông tin chung***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Mã báo giá | Tự sinh | Text | — | IPSYYMMDD-XXX | Hệ thống tự sinh, hiển thị chỉ đọc, không cho phép chỉnh sửa |
| Tên báo giá | v | Text | 200 | (Trống) | Bắt buộc; hệ thống kiểm tra trùng tên với các báo giá đã tồn tại |
| Mã yêu cầu báo giá liên quan (RFQ) | v | Select | — | (Trống) | Bắt buộc; danh sách chọn chỉ hiển thị các yêu cầu báo giá CHƯA gắn báo giá; là nguồn tự động điền các trường bên dưới (có check trùng khi lưu) |
| Khách hàng (ID \- Tên khách hàng) | — | Text (chỉ đọc) | — | (Theo RFQ) | Tự động điền theo Yêu cầu báo giá đã chọn |
| Hạng khách hàng | — | Text (chỉ đọc) | — | (Theo Khách hàng) | Tự động điền theo trường Khách hàng |
| Ghi chú yêu cầu báo giá | — | Text area (chỉ đọc) | — | (Theo RFQ) | Tự động điền nội dung trường Ghi chú chung của Yêu cầu báo giá đã chọn |
| Thời hạn hiệu lực | v | Date | — |  | Ngày hết hạn hiệu lực; quá hạn hệ thống tự chuyển trạng thái Hết hiệu lực (xem BR2) Luôn luôn \> {today} |
| Điều kiện áp dụng | — | Text area | 1000 | (Trống) | Điều kiện áp dụng kèm theo báo giá; người dùng nhập |

***Nhóm 2 – Thông tin dịch vụ (toàn bộ tự động điền từ Yêu cầu báo giá đã chọn, chỉ đọc, cho phép nhiều giá trị)***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Loại hình xuất nhập khẩu | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Nhóm hàng | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Đặc tính hàng hóa | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Loại xe | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Quy cách đóng gói | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |
| Ghi chú yêu cầu dịch vụ | — | Text area (chỉ đọc) | — | (Theo RFQ) | Tự động điền từ Yêu cầu báo giá; có thể có nhiều giá trị |

***Nhóm 3 – Dịch vụ yêu cầu (hiển thị khi đã chọn Yêu cầu báo giá; lấy nguyên trạng từ Yêu cầu báo giá, chỉ đọc)***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Danh sách dịch vụ yêu cầu | — | List (chỉ đọc) | — | (Theo RFQ) | Danh sách các dịch vụ được tick trong Yêu cầu báo giá (Vận tải / Kho bãi / Khai báo Hải quan / Hải quan Giám sát / Sang tải) |
| Thông tin yêu cầu theo từng dịch vụ | — | Text/Multi-value (chỉ đọc) | — | (Theo RFQ) | Các giá trị đã nhập trong Yêu cầu báo giá theo từng dịch vụ: Loại xe yêu cầu, Địa điểm làm TTHQ, Địa điểm kho, Loại hình kho, Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa, Địa điểm sang tải, Phương thức sang tải… |
| Trạng thái báo giá của dịch vụ | — | Label (chỉ đọc) | — | (Tự tính) | "Đã báo giá" khi đã có ≥ 1 bảng giá dịch vụ cùng Loại dịch vụ trong báo giá; "Chưa báo giá" (nhãn cảnh báo) khi chưa có — xem BR28 |
| Ghi chú yêu cầu dịch vụ | — | Text area (chỉ đọc) | — | (Theo RFQ) | Ghi chú của Yêu cầu báo giá theo từng dịch vụ (nếu có) |

***Nhóm 4 – Danh sách dịch vụ (khai báo qua modal “Thêm bảng giá dịch vụ mới”)***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| ID dịch vụ | Tự sinh | Text | — | (Tự sinh khi tạo) | Hệ thống tự động sinh ID khi tạo bảng giá dịch vụ; chỉ đọc |
| Loại dịch vụ | v | Enum | — | (Trống) | 1 trong 5 loại dịch vụ: Vận tải / Kho bãi / Khai báo Hải quan / Hải quan Giám sát / Sang tải Quyết định bộ thuộc tính và danh sách đầu mục giá hiển thị Dropdown chỉ hiển thị các loại dịch vụ có trong Dịch vụ yêu cầu của Yêu cầu báo giá đã chọn (xem BR25) |
| Tên dịch vụ | v | Text | 200 | (Trống) | Tên của bảng giá dịch vụ |
| Bộ thông tin thuộc tính (theo loại dịch vụ) | v | Động theo loại dịch vụ | — | (Trống) | Hiển thị sau khi chọn Loại dịch vụ; bắt buộc nhập đầy đủ.  Là dropdown, chỉ chọn trong phạm vi giá trị đã nhập tại Yêu cầu báo giá theo bảng "Nguồn giá trị các trường thuộc tính" bên dưới (xem BR25). Không được trùng bộ thuộc tính với dịch vụ khác đã tạo trong cùng báo giá (xem BR29). |
| Tiền tệ | v | Enum | — | VNĐ | Đơn vị tiền tệ áp dụng cho bảng giá |
| Tổng đơn giá | — | Number | — | (Tự tính) | Tổng Đơn giá của các đầu mục trong bảng giá; chỉ đọc |

**Bộ thông tin thuộc tính theo Loại dịch vụ:**

| Phân hệ | Cột đặc thù | Cột chung |
| :---- | :---- | :---- |
| (1) Vận tải | Điểm đi, Điểm đến, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (2) Kho bãi | Tên kho, Loại kho | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (3) Khai báo Hải quan | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (4) Hải quan Giám sát | Chi cục hải quan, Loại hình XNK, Nhóm hàng, Loại xe | Đơn vị tính, Tiền tệ, Giá mua định mức |
| (5) Sang tải | Địa điểm sang tải, Phương thức sang tải, Nhóm hàng, Đặc tính hàng hóa | Đơn vị tính, Tiền tệ, Giá mua định mức |

Nguồn giá trị các trường thuộc tính (giới hạn theo Yêu cầu báo giá đã chọn):

| Trường trong bảng giá dịch vụ | Nguồn giá trị (trường tại Yêu cầu báo giá) | Kiểu chọn / Ghi chú |
| :---- | :---- | :---- |
| Loại dịch vụ | Dịch vụ yêu cầu (các dịch vụ được tick trong RFQ) | Dropdown — chỉ các loại dịch vụ được yêu cầu |
| Loại xe | Loại xe yêu cầu | Dropdown |
| Chi cục hải quan | Địa điểm làm TTHQ | Dropdown |
| Đặc tính hàng hóa | Đặc tính hàng hóa | Dropdown |
| Tên kho | Địa điểm kho | Dropdown |
| Loại kho | Loại hình kho | Dropdown |
| Loại hình XNK | Loại hình XNK | Dropdown |
| Nhóm hàng | Nhóm hàng | Dropdown |
| Địa điểm sang tải | Địa điểm sang tải | Dropdown |
| Phương thức sang tải | Phương thức sang tải | Dropdown |
| Điểm đi, Điểm đến (Vận tải) | — (không lấy theo RFQ) | Chọn tự do từ danh mục hệ thống |

Lưu ý: dropdown chỉ hiển thị các giá trị đã nhập tại Yêu cầu báo giá; nếu trường tương ứng tại Yêu cầu báo giá không có giá trị nào thì dropdown rỗng.

***Nhóm 5 – Tổng hợp tài chính***

| Tên trường | Bắt buộc? | Kiểu dữ liệu | Độ dài tối đa | Giá trị mặc định | Mô tả |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Tổng đơn giá dịch vụ (chưa bao gồm VAT) | — | Number | — | (Tự tính) | Tổng của Tổng đơn giá tất cả bảng giá trong báo giá; chỉ đọc |
| Lợi nhuận dự kiến (%) | — | Number | — | (Tự tính) | Tỷ lệ lợi nhuận dự kiến của báo giá; chỉ đọc (xem BR10) |
| Đơn vị tiền tệ | — | Enum | — | VNĐ | Mặc định VNĐ và ở chế độ không cho chỉnh sửa (disable) |

**Bảng 3 — Bảng giá theo các đầu mục: các cột hiển thị (áp dụng cho cả màn Thêm mới và màn Xem chi tiết)**

| STT | Tên cột | Mô tả |
| :---- | :---- | :---- |
|  | ID | ID riêng của từng dòng giá; hệ thống tự sinh tại thời điểm tạo bảng giá (xem BR19); chỉ đọc |
| 1 | Đầu mục giá | “\[ID đầu mục giá\] \- \[Tên đầu mục giá\]” của các đầu mục giá có loại giá \= “Cố định” và “Phụ phí” & Kích hoạt, lấy từ cấu hình đầu mục giá; mỗi đầu mục có nút chọn dòng giá |
| 2 | Loại giá | Cố định / Phụ phí (kế thừa từ đầu mục giá). Đầu mục Loại giá Phát sinh không xuất hiện trong bảng giá dịch vụ |
| 3 | Mã giá bán định mức | Mã của dòng  Giá bán định mức đã chọn, hệ thống điền sau khi người dùng chọn dòng giá |
| 4 | Đơn vị | Đơn vị tính của đầu mục giá |
| 5 | Giá mua định mức | Giá mua định mức tương ứng; chỉ đọc |
| 6 | Giá bán định mức | Giá bán định mức tương ứng; chỉ đọc |
| 7 | Đơn giá | Đơn giá áp dụng cho báo giá; mặc định bằng Giá bán định mức; cho phép chỉnh sửa (sửa được cả trong modal và trong Danh sách bảng giá) |
| 8 | Lợi nhuận (%) | Tự động tính theo BR6; chỉ đọc |

**Bảng 4 — Màn Xem chi tiết báo giá: các nhóm thông tin hiển thị**

| Nhóm thông tin | Trường hiển thị |
| :---- | :---- |
| Tiêu đề | Mã báo giá, Trạng thái báo giá Người tạo Trạng thái |
| Thông tin chung | Tên báo giá,  Mã yêu cầu báo giá liên quan (RFQ),  Khách hàng (ID \- Tên khách hàng),  Hạng khách hàng,  Ghi chú yêu cầu báo giá,  Thời hạn hiệu lực,  Điều kiện áp dụng |
| Thông tin phát hành báo giá | Người tạo,  Người phát hành,  Thời điểm phát hành,  Kết quả báo giá (Thành công/Thất bại) |
| Thông tin dịch vụ | Loại hình xuất nhập khẩu,  Nhóm hàng,  Đặc tính hàng hóa,  Loại xe,  Quy cách đóng gói,  Ghi chú yêu cầu dịch vụ |
| Dịch vụ yêu cầu | Danh sách dịch vụ được yêu cầu trong Yêu cầu báo giá kèm thông tin yêu cầu tương ứng và Trạng thái báo giá của dịch vụ ("Đã báo giá" / "Chưa báo giá"); các dịch vụ "Chưa báo giá" được hiển thị cảnh báo (xem BR28) |
| Danh sách bảng giá | Với mỗi bảng giá: ID bảng giá  Loại dịch vụ,  Tên bảng giá,  Các biến phụ thuộc (theo loại dịch vụ),  Bảng giá theo các đầu mục (8 cột như đặc tả tại Bảng 3),  Tổng đơn giá Mỗi bảng giá có chức năng mở rộng (hiển thị đầy đủ) / thu gọn (chỉ hiển thị ID \- Tên bảng giá dịch vụ) Bổ sung: nhãn hiển thị "ID dịch vụ", "Tên dịch vụ"; đầu nhóm hiển thị cảnh báo "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}" khi có dịch vụ được yêu cầu nhưng chưa có bảng giá (xem BR28). |
| Tổng hợp tài chính | Tổng đơn giá dịch vụ (chưa bao gồm VAT), Lợi nhuận dự kiến (%),  Đơn vị tiền tệ |
| Lịch sử hoạt động | Danh sách bản ghi lịch sử, gồm 4 cột:  Thời gian,  Người thực hiện,  Hành động,  Nội dung  (chi tiết tại Bảng 5\) |

**Bảng 5 — Nhóm Lịch sử hoạt động (màn Xem chi tiết báo giá): các cột hiển thị**

| STT | Tên cột | Mô tả |
| :---- | :---- | :---- |
| 1 | Thời gian | Thời điểm thao tác được thực hiện |
| 2 | Người thực hiện | Người dùng thực hiện thao tác |
| 3 | Hành động | Loại thao tác: Tạo mới / Chỉnh sửa / Thêm bảng giá dịch vụ / Xóa bảng giá dịch vụ / Cập nhật đơn giá / Phát hành / Thu hồi / Ghi nhận kết quả báo giá / Hết hiệu lực (updating) |
| 4 | Nội dung | Diễn giải chi tiết nội dung thay đổi của thao tác |

### **3.1.3. Quy tắc nghiệp vụ (Business Rule)**

| ID | Quy tắc |
| :---- | :---- |
| BR1 | Quan hệ Yêu cầu báo giá – Báo giá là 1-1: mỗi Yêu cầu báo giá chỉ được gắn duy nhất 1 báo giá. Danh sách chọn Mã yêu cầu báo giá chỉ hiển thị các yêu cầu báo giá chưa gắn báo giá. RFQ ngoài phạm vi tài liệu này — chỉ chọn, không tạo/sửa tại menu này. |
| BR2 | Trạng thái báo giá gồm 7 giá trị: Nháp, Chờ phê duyệt, Đã phê duyệt, Từ chối, Đã phát hành, Thu hồi, Hết hiệu lực.  Kết quả báo giá (Thành công/Thất bại) là trường ĐỘC LẬP với Trạng thái, không phải một trạng thái trong vòng đời.  Báo giá quá Thời hạn hiệu lực tự động chuyển sang Hết hiệu lực, bất kể đang ở trạng thái nào. |
| BR3 | Chỉ báo giá ở trạng thái Nháp, Từ chối, Thu hồi mới được chỉnh sửa thông tin. Chỉ báo giá ở trạng thái Nháp mới được xóa. Sau khi chuyển sang Đã phát hành, báo giá bị khóa chức năng xóa báo giá. |
| BR4 | Cấu trúc báo giá 3 cấp: Báo giá → Bảng giá (theo loại dịch vụ) → Dòng giá chi tiết. |
| BR5 | Bảng giá dịch vụ chỉ chứa các đầu mục giá có Loại giá thuộc {Cố định, Phụ phí} & Kích hoạt.  Đầu mục có Loại giá “Phát sinh” KHÔNG xuất hiện trong bảng giá dịch vụ và không tham gia vào các chỉ tiêu tổng hợp của báo giá.  Đầu mục không kích hoạt KHÔNG xuất hiện trong bảng giá dịch vụ và không tham gia vào các chỉ tiêu tổng hợp của báo giá.  |
| BR6 | % Lợi nhuận của đầu mục giá (Cố định/Phụ phí) \= (Đơn giá − Giá mua định mức) / Giá mua định mức; chỉ đọc, hệ thống tự tính.  |
| BR7 | Khi nạp đầu mục giá từ Giá bán định mức, Đơn giá mặc định \= Giá bán định mức; cho phép người dùng sửa Đơn giá; mỗi lần sửa hệ thống tính lại % Lợi nhuận theo BR6. |
| BR8 | Giá mua/bán định mức được chốt (snapshot) tại thời điểm nạp đầu mục giá vào báo giá; không tự đồng bộ khi định mức nguồn thay đổi. |
| BR9 | Tổng đơn giá của một bảng giá \= Σ Đơn giá của các đầu mục trong bảng giá. Tổng đơn giá dịch vụ (chưa bao gồm VAT) của báo giá \= Σ Tổng đơn giá của tất cả bảng giá. Giá trị này cũng là cột “Tổng đơn giá” hiển thị ở màn Danh sách báo giá. |
| BR10 | Lợi nhuận dự kiến (%) toàn báo giá \= (Σ Đơn giá − Σ Giá mua định mức) / Σ Giá mua định mức; chỉ đọc, hệ thống tự tính. |
| BR11 | Mã báo giá do hệ thống tự sinh theo cấu trúc IPSYYMMDD-XXX  IPS: tiền tố cố định — Internal Pricing Sheet;  YY: 2 số cuối của năm,  MM: tháng,  DD: ngày tạo hiện tại;  XXX: số thứ tự tạo trong ngày, bắt đầu từ 001); Và người dùng KHÔNG được chỉnh sửa.  Tên báo giá do người dùng đặt và không được trùng. Các trường bắt buộc: Tên báo giá, Mã yêu cầu báo giá liên quan (RFQ), Thời hạn hiệu lực, Đơn giá của dòng giá (trong bảng giá dịch vụ) |
| BR12 | Hệ thống tự động sinh ID cho bảng giá theo cấu trúc: IQYYMM-XXX, trong đó: IQ (Internal Quote) là tiền tố cố định YYMM là 2 số cuối của năm/tháng hiện tại XXX bắt đầu từ 001  |
| BR13 | Xóa báo giá chỉ áp dụng với trạng thái Nháp. Mọi chức năng Xem/Sửa/Phát hành/Xóa được kiểm soát bằng phân quyền; chức năng ẩn hoàn toàn khi người dùng không có quyền. |
| BR14 | Điều kiện phát hành báo giá: báo giá phải có tối thiểu 1 dòng giá. Khi phát hành thành công, hệ thống ghi nhận Người phát hành và Thời điểm phát hành, đồng thời hiển thị báo giá nội bộ trong màn Chi tiết Yêu cầu báo giá (RFQ) đã đính kèm. |
| BR15 | Tỷ lệ chốt (Won) \= Số lượng báo giá có kết quả Thành công / Tổng số báo giá “Đã phát hành” \+ “Hết hiệu lực” (**updating**) |
| BR16 | Thẻ chỉ số “Chờ duyệt ngoại lệ” thuộc luồng phê duyệt — NGOÀI phạm vi giai đoạn này; thẻ hiển thị 0 hoặc được ẩn. |
| BR17 | Mọi thao tác làm thay đổi báo giá được hệ thống tự động ghi nhận vào Lịch sử hoạt động, mỗi bản ghi gồm: Thời gian, Người thực hiện, Hành động, Nội dung. Lịch sử hoạt động chỉ ở chế độ xem; không cho phép chỉnh sửa hoặc xóa bản ghi. |
| BR18 | Trong một bảng giá dịch vụ, mỗi đầu mục giá chỉ được gán tối đa 1 dòng giá (quan hệ 1 đầu mục giá – 1 dòng giá). Danh sách dòng giá cho người dùng chọn được lọc theo:  (a) đầu mục giá tương ứng;  (b) các giá trị thuộc tính đã nhập trong bảng giá. |
| BR19 | Mỗi dòng giá trong bảng giá dịch vụ có một ID riêng do hệ thống tự động sinh tại thời điểm tạo bảng giá; ID hiển thị ở cột đầu tiên của Bảng giá theo các đầu mục và ở chế độ chỉ đọc. |
| BR20 | Kết quả báo giá được ghi nhận tự động: khi bộ phận Sales cập nhật trạng thái Thành công/Thất bại cho Báo giá khách hàng (được tạo từ báo giá nội bộ), hệ thống ghi nhận Kết quả báo giá tương ứng cho báo giá nội bộ được tham chiếu.  Người dùng tại menu này không cập nhật thủ công Kết quả báo giá. |
| BR21 | Thu hồi báo giá: chỉ áp dụng với báo giá ở trạng thái "Đã phát hành" và khi Sale CHƯA tạo Báo giá khách hàng từ Yêu cầu báo giá (RFQ) đã đính kèm.  |
| BR22 | Thu hồi thành công: báo giá chuyển trạng thái "Thu hồi", ẩn khỏi màn Chi tiết Yêu cầu báo giá (RFQ) nhưng vẫn giữ nguyên liên kết 1-1 với RFQ đó, không được giải phóng để gắn báo giá khác; |
| BR23 | Thao tác Thu hồi cần người dùng được phân quyền Thu hồi mới hiển thị và sử dụng được. |
| BR24 | Được phép tạo nhiều bảng giá trong báo giá |
| BR25 | Nguồn giá trị các trường thông tin trong modal Thêm dịch vụ (Thêm bảng giá dịch vụ) bị giới hạn theo Yêu cầu báo giá (RFQ) đã chọn: Loại dịch vụ ← Dịch vụ yêu cầu;  Loại xe ← Loại xe yêu cầu;  Chi cục hải quan ← Địa điểm làm TTHQ;  Đặc tính hàng hóa ← Đặc tính hàng hóa;  Tên kho ← Địa điểm kho;  Loại kho ← Loại hình kho;  Loại hình XNK ← Loại hình XNK;  Nhóm hàng ← Nhóm hàng;  Địa điểm sang tải ← Địa điểm sang tải;  Phương thức sang tải ← Phương thức sang tải. Tất cả là dropdown, chỉ chọn trong các giá trị đã nhập tại RFQ. Riêng Điểm đi, Điểm đến chọn tự do từ danh mục hệ thống. Chi tiết xem bảng "Nguồn giá trị các trường thuộc tính" (mục 3.1.2). |
| BR26 | Màn Thêm mới/Chỉnh sửa báo giá hiển thị nhóm "Dịch vụ yêu cầu" lấy nguyên trạng từ Yêu cầu báo giá đã chọn, ở chế độ chỉ đọc; nhóm chỉ hiển thị khi đã chọn Yêu cầu báo giá và được nạp lại khi người dùng đổi sang Yêu cầu báo giá khác. |
| BR27 | Cảnh báo thiếu dịch vụ (soft warning): khi nhấn Tạo/Lưu báo giá, hệ thống đối chiếu các dịch vụ được tick trong Yêu cầu báo giá với Loại dịch vụ của các bảng giá dịch vụ đã tạo trong báo giá. Với mỗi dịch vụ được yêu cầu nhưng chưa có bảng giá dịch vụ tương ứng, hệ thống cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ 1}, {Loại dịch vụ 2}... , tiếp tục Tạo/Lưu báo giá?". Đây là cảnh báo, KHÔNG chặn: người dùng Xác nhận thì tiếp tục Tạo/Lưu, Hủy thì quay lại màn tạo/chỉnh sửa. |
| BR28 | Hiển thị tab loại dịch vụ chưa được báo giá: (a) Màn Chi tiết báo giá — nhóm Danh sách dịch vụ; Mỗi tab loại dịch vụ hiển thị cảnh báo "Dịch vụ chưa được báo giá". (b) Màn Yêu cầu báo giá — section báo giá nội bộ đã phát hành: hiển thị cảnh báo tương tự cho các dịch vụ được yêu cầu nhưng không có trong báo giá đã phát hành. Cảnh báo chỉ mang tính thông tin, không chặn thao tác. |
| BR29 | Trong cùng một báo giá, KHÔNG được tồn tại hai bảng giá dịch vụ trùng bộ thuộc tính — tức cùng Loại dịch vụ và trùng giá trị của TẤT CẢ trường thuộc tính (theo bộ thuộc tính của loại dịch vụ đó). Tên bảng giá/Tên dịch vụ khác nhau KHÔNG được coi là khác bộ thuộc tính. Khi phát hiện trùng, hệ thống chặn tạo bảng giá dịch vụ và hiển thị thông báo lỗi. Quy tắc này không mâu thuẫn với BR24 — vẫn cho phép nhiều bảng giá trong cùng một loại dịch vụ, miễn khác bộ thuộc tính. |
| BR30 | Quy ước tên gọi: trên giao diện, thành phần "Bảng giá (dịch vụ)" hiển thị với nhãn "Dịch vụ" (Danh sách dịch vụ, Thêm/Tạo/Xóa dịch vụ, ID/Tên dịch vụ, Tổng hợp dịch vụ). Trong tài liệu (User story, Business Rule, bảng thông báo) giữ nguyên thuật ngữ "bảng giá dịch vụ". Hai tên gọi cùng chỉ một đối tượng. |

### **3.1.4. Danh sách thông báo và lỗi**

| Trigger | Loại thông báo | Nội dung hiển thị trên giao diện | Hành vi hệ thống |
| :---- | :---- | :---- | :---- |
| Lưu báo giá khi còn trống trường bắt buộc (Tên báo giá, Mã yêu cầu báo giá, Thời hạn hiệu lực, Đơn giá) | Lỗi | “Vui lòng nhập đầy đủ thông tin bắt buộc” | Không lưu, giữ nguyên dữ liệu đang nhập |
| Nhập Tên báo giá trùng với báo giá đã tồn tại | Lỗi | “Tên báo giá đã tồn tại” | Không lưu |
| Tạo/lưu báo giá Nháp thành công | Thành công | “Tạo báo giá thành công” | Lưu trạng thái Nháp, điều hướng sang màn chi tiết/soạn thảo |
| Lưu thay đổi báo giá thành công (màn Chỉnh sửa) | Thành công | “Cập nhật báo giá thành công” | Lưu thay đổi, giữ trạng thái Nháp, ghi nhận Lịch sử hoạt động |
| Tạo bảng giá dịch vụ khi thiếu trường bắt buộc hoặc thuộc tính bắt buộc  | Lỗi | “Vui lòng nhập đầy đủ thông tin bắt buộc” | Không tạo bảng giá |
| Tạo bảng giá dịch vụ khi chưa chọn dòng giá cho tất cả đầu mục giá  | Lỗi | “Vui lòng nhập đầy đủ dòng giá trong các đầu mục giá” | Không tạo bảng giá (Giả định — xem Mục 4\) |
| Tạo bảng giá dịch vụ thành công | Thành công | “Tạo bảng giá dịch vụ thành công” | Thêm bảng giá kèm ID bảng giá và ID từng dòng giá tự sinh; tính lại các chỉ tiêu tổng hợp |
| Xóa bảng giá dịch vụ khỏi báo giá | Cảnh báo | “Bạn có chắc muốn xóa bảng giá dịch vụ này?” | Yêu cầu xác nhận; xác nhận → xóa bảng giá và toàn bộ dòng giá thuộc bảng, tính lại các chỉ tiêu tổng hợp |
| Nhập Đơn giá không hợp lệ (không phải số hoặc nhỏ hơn 0\) trong modal bảng giá hoặc trong danh sách bảng giá \- form tạo/sửa báo giá | Lỗi | “Đơn giá không hợp lệ” | Không cập nhật đầu mục giá và các chỉ tiêu tổng hợpKhông Lưu báo giá.  |
| Phát hành khi báo giá chưa có dòng giá nào | Lỗi | “Báo giá phải có tối thiểu 1 dòng giá trước khi phát hành” | Chặn phát hành |
| Phát hành báo giá thành công | Thành công | “Phát hành báo giá thành công” | Chuyển trạng thái Đã phát hành, ghi Người phát hành và Thời điểm phát hành. |
| Nhấn "Thu hồi" báo giá Đã phát hành (Sale chưa tạo Báo giá khách hàng) | Xác nhận | “Vui lòng nhập lý do thu hồi báo giá” | Hiển thị popup xác nhận Thu hồi với trường Lý do thu hồi (bắt buộc, tối đa 500 ký tự) |
| Xác nhận Thu hồi khi để trống Lý do thu hồi | Lỗi | “Vui lòng nhập lý do thu hồi” | Không thực hiện thu hồi, giữ nguyên popup |
| Xác nhận Thu hồi thành công | Thành công | “Thu hồi báo giá thành công” | Chuyển trạng thái Thu hồi, ẩn khỏi màn Chi tiết Yêu cầu báo giá, ghi nhận Lịch sử hoạt động |
| Thực hiện Thu hồi với báo giá không đủ điều kiện (không ở trạng thái Đã phát hành, hoặc Sale đã tạo Báo giá khách hàng) | Lỗi | “Không thể thu hồi báo giá ở trạng thái này” | Chặn thao tác thu hồi, ẩn/disable nút Thu hồi |
| Hệ thống ghi nhận Kết quả báo giá từ Báo giá khách hàng | Thông báo | “Báo giá đã được ghi nhận kết quả: \[Thành công/Thất bại\]” | Cập nhật trường Kết quả báo giá; ghi nhận Lịch sử hoạt động |
| Xóa báo giá Nháp | Cảnh báo | “Bạn có chắc muốn xóa báo giá này?” | Yêu cầu xác nhận; xác nhận → xóa |
| Người dùng không có quyền (Xem/Sửa/Phát hành/Xóa) | Lỗi | “Bạn không có quyền thực hiện chức năng này” | Ẩn chức năng, chặn thao tác |
| Nhấn Tạo/Lưu báo giá khi có dịch vụ được yêu cầu trong Yêu cầu báo giá nhưng chưa tạo bảng giá dịch vụ tương ứng | Cảnh báo (xác nhận) | "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo/Lưu báo giá?" | Hiển thị popup xác nhận; Xác nhận → tiếp tục Tạo/Lưu báo giá; Hủy → quay lại màn tạo/chỉnh sửa, giữ nguyên dữ liệu đang nhập (BR27) |
| Nhấn "Tạo bảng giá dịch vụ" khi bộ thuộc tính trùng với một bảng giá dịch vụ khác đã tạo trong báo giá | Lỗi | "Bộ thuộc tính của dịch vụ này đã trùng với {ID – Tên bảng giá}. Vui lòng chọn bộ thuộc tính khác." | Chặn tạo bảng giá dịch vụ, giữ nguyên modal và dữ liệu đang nhập (BR29) |
| Mở màn Chi tiết báo giá / màn Yêu cầu báo giá (section báo giá nội bộ đã phát hành) khi có dịch vụ được yêu cầu nhưng chưa được báo giá | Cảnh báo | "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}" | Hiển thị cảnh báo tại nhóm Dịch vụ yêu cầu/Danh sách dịch vụ; không chặn thao tác (BR28) Luôn luôn hiển thị cho đến khi dịch vụ đó có bảng giá |
| Chọn Loại dịch vụ/thuộc tính trong modal Thêm dịch vụ khi Yêu cầu báo giá không có giá trị tương ứng | Thông báo | "Yêu cầu báo giá chưa có giá trị cho trường này" (Đề xuất bổ sung — chờ xác nhận) | Dropdown hiển thị rỗng; không chặn các thao tác khác (BR25) |

### **3.1.5. Tích hợp & Đồng bộ dữ liệu**

*\[Gắn link hoặc hình ảnh biểu đồ ERD mô hình hóa luồng dữ liệu của module\]*

| Tên hệ thống | Mục đích | Luồng dữ liệu | Trigger | Xử lý ngoại lệ |
| :---- | :---- | :---- | :---- | :---- |
| Yêu cầu báo giá (RFQ) | Nguồn dữ liệu bắt buộc; cung cấp danh sách RFQ chưa gắn báo giá và các thông tin khách hàng, dịch vụ Bổ sung: cung cấp Dịch vụ yêu cầu và các giá trị thuộc tính yêu cầu (Loại xe yêu cầu, Địa điểm làm TTHQ, Địa điểm kho, Loại hình kho, Loại hình XNK, Nhóm hàng, Đặc tính hàng hóa, Địa điểm/Phương thức sang tải) làm nguồn giới hạn cho dropdown trong modal Thêm dịch vụ (BR25) và làm nguồn cho nhóm "Dịch vụ yêu cầu" (BR26). | RFQ → báo giá; báo giá → hiển thị trên Chi tiết Yêu cầu báo giá (hiện khi Đã phát hành, ẩn khi Thu hồi) Yêu cầu báo giá → nhóm Dịch vụ yêu cầu & dropdown thuộc tính của bảng giá dịch vụ; Báo giá → cảnh báo dịch vụ chưa báo giá tại section báo giá nội bộ đã phát hành của Yêu cầu báo giá (BR28). | Khi chọn Yêu cầu báo giá liên quan (RFQ) ở màn Thêm mới/Chỉnh sửa báo giá; khi Phát hành hoặc Thu hồi báo giá | Không còn RFQ khả dụng → danh sách chọn rỗng; Sale đã tạo Báo giá khách hàng → chặn Thu hồi (Updating — cơ chế xác định) Yêu cầu báo giá thiếu giá trị cho trường thuộc tính → dropdown rỗng; dịch vụ được yêu cầu nhưng chưa có bảng giá → cảnh báo, không chặn (BR27, BR28). |
| Cấu hình đầu mục giá | Cung cấp danh sách đầu mục giá (chỉ Loại giá Cố định, Phụ phí) hiển thị trong modal Thêm bảng giá dịch vụ | Đầu mục giá → đầu mục trong bảng giá | Khi chọn Loại dịch vụ trong modal | Đầu mục bị tắt kích hoạt → không hiển thị Đầu mục Loại giá Phát sinh → không hiển thị (BR5) |
| Giá mua định mức | Lấy Giá mua định mức làm căn cứ tính % Lợi nhuận | Giá mua định mức → đầu mục giá (snapshot) | Khi nạp đầu mục giá vào bảng giá | Nguồn đổi → không tự đồng bộ (BR8) |
| Giá bán định mức | Cung cấp danh sách dòng giá để chọn (đã lọc theo đầu mục giá và thuộc tính); cấp Mã giá bán định mức, Đơn vị và Giá bán định mức làm Đơn giá mặc định | Giá bán định mức → dòng giá trong bảng giá | Khi nhấn nút chọn dòng giá trong modal | Nguồn đổi → không tự đồng bộ (BR8) Không có dòng giá phù hợp với bộ lọc → hiển thị danh sách rỗng (Giả định) |
| Báo giá khách hàng | Nguồn ghi nhận tự động Kết quả báo giá (Thành công/Thất bại) cho báo giá nội bộ tham chiếu | Báo giá khách hàng → báo giá nội bộ | Khi Sales cập nhật trạng thái Thành công/Thất bại cho Báo giá khách hàng | Báo giá khách hàng bị hủy hoặc đổi kết quả → xử lý chưa xác định (xem Mục 4\) |
| Chính sách biên lợi nhuận | (Ngoài phạm vi) kiểm tra ràng buộc ngưỡng lợi nhuận | — | — | Chưa liên kết ràng buộc trong giai đoạn này |
| Báo cáo thống kê | Cấp số liệu Tổng báo giá, Đã phát hành, Tỷ lệ chốt (Won) | Báo giá → dashboard/báo cáo | Khi trạng thái báo giá thay đổi | Tỷ lệ chốt chờ chốt công thức (BR15) |

# **4\. Đánh giá độ phủ rule (Case còn thiếu)**

Các điểm dưới đây là những case còn để (Giả định), còn ghi Updating hoặc còn mâu thuẫn giữa các nguồn; cần rà soát/xác nhận trước khi phát triển.

| Nội dung | Đánh giá | Case còn thiếu | Đề xuất bổ sung |
| :---- | :---- | :---- | :---- |
| Luồng phê duyệt báo giá | Đã chốt đầy đủ 7 trạng thái trong vòng đời, bao gồm Từ chối (BR2) | Chưa đặc tả: ai trình duyệt, ai phê duyệt, điều kiện chuyển trạng thái, và điều kiện/luồng để báo giá chuyển sang Từ chối | Bổ sung user story và quy tắc cho luồng trình duyệt – phê duyệt – từ chối |
| Hết hiệu lực áp dụng cho mọi trạng thái | Đã chốt: quá Thời hạn hiệu lực tự chuyển Hết hiệu lực bất kể trạng thái (BR2), bao gồm cả trạng thái Thu hồi mới bổ sung (không có ngoại lệ) | Chưa rõ xử lý với báo giá đã có Kết quả Thành công: có tiếp tục chuyển Hết hiệu lực không, và báo giá Nháp quá hạn có còn chỉnh sửa được không | Chốt ngoại lệ áp dụng quy tắc Hết hiệu lực và hành vi với báo giá Nháp quá hạn |
| Đồng bộ Kết quả báo giá | Đã chốt cơ chế tự động ghi nhận từ Báo giá khách hàng (BR20), đã làm rõ: ghi nhận không phụ thuộc trạng thái báo giá nội bộ | Chưa rõ: xử lý khi Báo giá khách hàng bị hủy hoặc đổi kết quả sau khi đã ghi nhận; trường hợp một báo giá nội bộ có nhiều Báo giá khách hàng | Bổ sung quy tắc cập nhật lại/hoàn tác Kết quả báo giá và quan hệ số lượng giữa hai loại báo giá |
| Giải phóng Yêu cầu báo giá khi xóa báo giá | Đang để (Giả định) tại US\_QUO\_10 AC3 | Chưa chốt: RFQ có được chọn lại sau khi báo giá gắn với nó bị xóa hay không | Xác nhận quy tắc giải phóng RFQ khi báo giá bị xóa |
| Bắt buộc chọn dòng giá cho đầu mục | Đang để (Giả định) tối thiểu một dòng giá (US\_QUO\_04 AC8) | Chưa rõ: bắt buộc chọn cho toàn bộ đầu mục hay chỉ tối thiểu một; xử lý khi không có dòng giá phù hợp; có cho bỏ chọn/đổi dòng giá đã chọn không | Chốt quy tắc bắt buộc chọn dòng giá và hành vi khi danh sách lọc rỗng |
| Đổi Yêu cầu báo giá khi chỉnh sửa | Cho phép đổi RFQ ở màn Chỉnh sửa (US\_QUO\_03 AC4 – Giả định) | Chưa rõ ảnh hưởng tới các bảng giá đã tạo theo RFQ cũ (giữ nguyên, cảnh báo, hay xóa để dựng lại) | Chốt hành vi khi đổi RFQ trên báo giá đã có bảng giá |
| Phạm vi ghi nhận Lịch sử hoạt động | Đã xác định 4 cột hiển thị và nguyên tắc ghi nhận (BR17) | Chưa chốt danh mục Hành động; mức chi tiết của cột Nội dung; quy tắc sắp xếp và phân trang | Bổ sung danh mục Hành động chuẩn và mẫu nội dung ghi nhận cho từng loại thao tác |
| Quy tắc sinh ID bảng giá và ID dòng giá | Đã chốt do hệ thống tự sinh (BR12, BR19) | Chưa có cấu trúc/định dạng cụ thể của ID bảng giá và ID dòng giá | Bổ sung quy tắc sinh ID cho bảng giá dịch vụ và dòng giá |
| Bộ thuộc tính theo loại dịch vụ | Đã xác định là điều kiện lọc dòng giá và bắt buộc nhập đầy đủ | Chưa định nghĩa danh sách thuộc tính cụ thể cho từng loại trong 5 loại dịch vụ | Bổ sung bảng ánh xạ Loại dịch vụ ↔ danh sách thuộc tính |
| Công thức Tỷ lệ chốt (Won) | Updating — chưa chốt (BR15) | Chưa xác định tử số/mẫu số và phạm vi thống kê (theo kỳ, theo khách hàng…) | Chốt định nghĩa Tỷ lệ chốt trước khi phát triển chỉ số |
| Thuế suất VAT | Không còn trường nhập VAT trong màn báo giá | Chỉ tiêu ghi “chưa bao gồm VAT” nhưng không có nơi khai báo VAT → chưa rõ cách tính giá đã bao gồm VAT | Xác nhận: VAT được quản lý ở module khác, hay cần bổ sung lại trường VAT |
| Cơ chế giá định mức trong báo giá | Đang để (Giả định) snapshot (BR8) | Snapshot hay tham chiếu động chưa chốt chính thức; tài liệu Cấu hình đầu mục giá ghi “tham chiếu động” | Chốt cơ chế: snapshot tại thời điểm chọn dòng giá, hay luôn tham chiếu giá hiện hành |
| Công thức % Lợi nhuận | Báo giá dùng biên trên giá bán (BR6); menu Giá bán định mức dùng markup | Hai công thức cho kết quả khác nhau → dễ nhầm khi đối chiếu | Thống nhất thuật ngữ và cách hiển thị % Lợi nhuận giữa các menu |
| Lợi nhuận âm | Chưa có chính sách | Chưa quy định xử lý khi Đơn giá nhỏ hơn Giá mua định mức | Chốt: chặn cứng hay chỉ cảnh báo khi lợi nhuận âm |
| Luồng phê duyệt ngoại lệ | Ngoài phạm vi (BR16) | Ngưỡng kích hoạt “Chờ duyệt ngoại lệ” và vai trò phê duyệt chưa định nghĩa | Đặc tả luồng phê duyệt ngoại lệ ở phiên bản sau |

# LIST UPDATE — SRS QUẢN LÝ BÁO GIÁ (BÁO GIÁ NỘI BỘ)

Tài liệu: SRS\_LogXPro\_Quản lý báo giá (Báo giá nội bộ) — Module Quản lý cung ứng, hệ thống LogXPro

Mục đích: theo dõi toàn bộ nội dung cập nhật của tài liệu SRS Quản lý báo giá qua các phiên bản.

1. # **Danh sách update v1.0** 

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Cập nhật cấu trúc ID bảng giá dịch vụ trong báo giá: IQYYMM-XXX, trong đó: IQ (Internal Quote) là tiền tố cố định YYMM là 2 số cuối của năm/tháng hiện tại XXX bắt đầu từ 001  | Chưa có quy định cấu trúc ID bảng giá dịch vụ trong báo giá, ID bảng giá do hệ thống tự động sinh ngẫu nhiên | 25/08/2026 | Hoàn thiện rule hệ thống |
| 1 | Popup Thêm mới bảng giá (Thêm dịch vụ): các trường thông tin trong bảng giá là dropdown, chỉ chọn trong các giá trị đã nhập tại Yêu cầu báo giá theo ánh xạ: \- Loại dịch vụ ← Dịch vụ yêu cầu; \- Loại xe ← Loại xe yêu cầu;  \- Chi cục hải quan ← Địa điểm làm TTHQ;  \- Đặc tính hàng hóa ← Đặc tính hàng hóa;  \- Tên kho ← Địa điểm kho;  \- Loại kho ← Loại hình kho; \- Loại hình XNK ← Loại hình XNK; \- Nhóm hàng ← Nhóm hàng; \- Địa điểm sang tải ← Địa điểm sang tải;  \- Phương thức sang tải ← Phương thức sang tải.  Riêng Điểm đi, Điểm đến chọn tự do từ danh mục hệ thống. (US\_QUO\_04 – AC2, AC4; mục 3.1.2 – bảng "Nguồn giá trị các trường thuộc tính"; BR25) | Người dùng nhập/chọn giá trị thuộc tính tự do từ danh mục hệ thống, không giới hạn theo Yêu cầu báo giá (US\_QUO\_04 – AC4 bản cũ: "Người dùng nhập giá trị cho bộ thông tin thuộc tính"). | 25/08/2026 | Đảm bảo bảng giá dịch vụ chỉ được lập trong đúng phạm vi khách hàng yêu cầu; tránh báo giá sai/thừa so với Yêu cầu báo giá. |
| 2 | Bổ sung nhóm giao diện "Dịch vụ yêu cầu" tại màn Thêm mới/Chỉnh sửa báo giá — hiển thị khi đã chọn Yêu cầu báo giá, lấy nguyên trạng từ Yêu cầu báo giá, chỉ đọc; nạp lại khi đổi sang Yêu cầu báo giá khác. (Mục 3.1.2 – Nhóm 3; US\_QUO\_02 – AC11; US\_QUO\_03 – AC9; BR26) | Màn Thêm mới/Chỉnh sửa báo giá chỉ có 4 nhóm: Thông tin chung, Thông tin dịch vụ, Danh sách bảng giá, Tổng hợp bảng giá — không có nhóm hiển thị Dịch vụ yêu cầu từ RFQ. | 25/08/2026 | Người dùng xem được thông tin yêu cầu báo giá ngay trong màn tạo/chỉnh sửa, không phải mở sang màn Yêu cầu báo giá để đối chiếu. |
| 3 | Bổ sung cảnh báo thiếu dịch vụ khi Tạo/Lưu báo giá: hệ thống đối chiếu dịch vụ được tick trong Yêu cầu báo giá với Loại dịch vụ của các bảng giá dịch vụ đã tạo; nếu thiếu → cảnh báo "Chưa tạo bảng giá dịch vụ {Loại dịch vụ}, tiếp tục Tạo/Lưu báo giá?". Cảnh báo mềm, không chặn. (US\_QUO\_02 – AC12; US\_QUO\_03 – AC10; BR27; mục 3.1.4) | Không có bước kiểm tra/cảnh báo khi báo giá thiếu bảng giá của dịch vụ đã được yêu cầu; hệ thống chỉ kiểm tra các trường bắt buộc và Đơn giá. | 25/08/2026 | Giảm rủi ro phát hành báo giá thiếu dịch vụ khách hàng đã yêu cầu, nhưng vẫn cho phép chủ động bỏ qua khi có lý do nghiệp vụ. |
| 4 | Bổ sung giao diện cảnh báo cho các loại dịch vụ không có báo giá: (a) màn Chi tiết báo giá — nhãn "Đã báo giá"/"Chưa báo giá" theo từng dịch vụ và cảnh báo "Dịch vụ chưa được báo giá: {danh sách Loại dịch vụ}"; (b) màn Yêu cầu báo giá — section báo giá nội bộ đã phát hành hiển thị cảnh báo tương tự. (US\_QUO\_07 – AC9, AC10; mục 3.1.2 – Bảng 4; BR28; mục 3.1.4) | Màn Chi tiết báo giá và section báo giá nội bộ tại màn Yêu cầu báo giá không hiển thị thông tin/cảnh báo về các dịch vụ được yêu cầu nhưng chưa được báo giá. | 25/08/2026 | Sales và Pricing nhận biết ngay dịch vụ còn thiếu khi xem báo giá đã phát hành, không phải tự đối chiếu thủ công với Yêu cầu báo giá. |
| 5 | Đổi tên hiển thị trên giao diện thành phần "Bảng giá" → "Dịch vụ": Danh sách bảng giá → Danh sách dịch vụ; Thêm/Tạo/Xóa bảng giá dịch vụ → Thêm/Tạo/Xóa dịch vụ; ID/Tên bảng giá → ID/Tên dịch vụ; Tổng hợp bảng giá → Tổng hợp dịch vụ. Phạm vi: CHỈ nhãn hiển thị (mục 3.1.2); User story, Business Rule, bảng thông báo giữ nguyên thuật ngữ "bảng giá dịch vụ" để không phá vỡ tham chiếu tài liệu. (Mục 3.1.2; BR30) | Toàn bộ giao diện và tài liệu dùng thuật ngữ "Bảng giá"/"Bảng giá dịch vụ" (Danh sách bảng giá, Thêm bảng giá dịch vụ mới, ID bảng giá, Tên bảng giá, Tổng hợp bảng giá). | 25/08/2026 | Tránh nhầm lẫn cho người dùng giữa "bảng giá" của báo giá và các bảng giá khác trong hệ thống (bảng giá mua, bảng giá định mức). |
| 6 | Bổ sung điều kiện khi tạo bảng giá dịch vụ: kiểm tra bộ thuộc tính với các bảng giá dịch vụ khác đã tạo trong cùng báo giá; nếu trùng toàn bộ (cùng Loại dịch vụ và trùng giá trị tất cả trường thuộc tính) → chặn tạo, báo lỗi "Bộ thuộc tính của dịch vụ này đã trùng với {ID – Tên bảng giá}. Vui lòng chọn bộ thuộc tính khác." (US\_QUO\_04 – AC11; BR29; mục 3.1.4) | Cho phép tạo nhiều bảng giá trong 1 loại dịch vụ mà không kiểm tra trùng bộ thuộc tính (US\_QUO\_04 – AC10; BR24). | 25/08/2026 | Ngăn dữ liệu trùng lặp gây sai lệch Tổng đơn giá và Lợi nhuận dự kiến của báo giá. |
| 7 | Bổ sung mục 1.2 Phạm vi hệ thống (In-scope): 3 gạch đầu dòng cho nhóm Dịch vụ yêu cầu, cảnh báo dịch vụ chưa báo giá và chặn trùng bộ thuộc tính. | Mục 1.2 chưa nêu các nội dung này trong phạm vi triển khai. | 25/08/2026 | Đồng bộ phạm vi tài liệu với các nội dung nghiệp vụ mới bổ sung. |
| 8 | Cập nhật mục 3.1.5 Tích hợp & Đồng bộ dữ liệu — dòng "Yêu cầu báo giá (RFQ)": bổ sung vai trò cung cấp Dịch vụ yêu cầu và các giá trị thuộc tính yêu cầu làm nguồn giới hạn dropdown; bổ sung luồng cảnh báo dịch vụ chưa báo giá tại section báo giá nội bộ của Yêu cầu báo giá. | Dòng "Yêu cầu báo giá (RFQ)" chỉ mô tả vai trò cung cấp danh sách RFQ chưa gắn báo giá và thông tin khách hàng/dịch vụ. | 25/08/2026 | Phản ánh đúng quan hệ dữ liệu hai chiều giữa Yêu cầu báo giá và Báo giá nội bộ sau cập nhật. |
| 9 | Bổ sung mục 4 – Đánh giá độ phủ rule: 5 case còn thiếu (RFQ có nhiều giá trị cho 1 thuộc tính; định nghĩa "trùng bộ thuộc tính" với giá trị trống; Yêu cầu báo giá thay đổi sau khi đã tạo báo giá; cảnh báo thiếu dịch vụ khi Phát hành) và mục "Câu hỏi cần xác nhận" (4 câu). | Mục 4 gồm 15 dòng đánh giá; chưa có mục "Câu hỏi cần xác nhận". | 25/08/2026 | Ghi nhận các điểm chưa chốt phát sinh từ đợt cập nhật để rà soát trước khi phát triển. |

**Ghi chú:** Toàn bộ nội dung cập nhật nêu trên đã được highlight (nền vàng) trong file SRS\_LogXPro\_Quản lý báo giá (Báo giá nội bộ) bản ngày 25/08/2026.

2. # **Danh sách update v1.1 (Sprint 2\)**

| STT | Nội dung update | Nội dung trước update | Ngày update | Lý do update |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Thêm chức năng Tự động tạo báo giá nội bộ từ Yêu cầu báo giá | Chưa có chức năng Tự động tạo báo giá nội bộ | 10/09/2026 | Thực hiện tiếp Sprint 2 |

