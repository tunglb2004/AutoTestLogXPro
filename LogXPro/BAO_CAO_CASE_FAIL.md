# Báo cáo case Fail — toàn bộ bộ test LogXPro

- **Ngày tổng hợp:** 06/11/2026, cập nhật sau lượt `sua-sau-toan-bo (lần 1)` (17:05)
- **Phạm vi:** 1.021 case trong `TEST_CASE_AUTO.md`: 1.015 case tự động (917 API, 20 luồng API, 78 UI) và 6 case thủ công
- **Module:** Lead, Hợp đồng khách hàng, Khách hàng, Nhà thầu, Hợp đồng nhà thầu (kèm 1 case Giá mua đầu vào trong UI-VDRD-005)
- **Môi trường:** web DEV `https://logx-dev.sonthanh.net.vn`, API DEV `https://logx-api-dev.sonthanh.net.vn`
- **Tài khoản và role:**

| Vai trò trong test | Tài khoản | Role thực tế |
|---|---|---|
| NVKD A | `tunglead2` | QL_LEAD |
| NVKD B | `tunglead` | QL_LEAD |
| DVKH A / QLNT | `tungkh2` | FULL_QUYEN_K1, QL_KH, QL_NHA_THAU |
| DVKH B | `tungkh` | FULL_QUYEN_K1, QL_KH, QL_NHA_THAU |
| NVKD C / DVKH C | `binh.tran` | DVKH_MASTER_DATA |

- **Nguồn số liệu:**
  - API và luồng API: lượt `toan-bo-api (lần 1)` ngày 06/11/2026 (936 case đã chạy: 859 đạt, 77 Fail, 1 bỏ qua), cộng lượt chạy lại `sua-sau-toan-bo (lần 1)` lúc 17:05 (5 case sửa test, đều đạt).
  - UI: các lượt ngày 06/11 (`ui-lan-dau (lần 6)`, `ui-sua-hd (lần 1)`, `ui-file-that (lần 1, 2)`, `ui-sua-3-case (lần 1)`).
  - Mỗi case lấy kết quả của lượt gần nhất có chạy case đó. Evidence trong `auto-tests/evidence/<ID>/`.

## 1. Tổng quan

| Nhóm | Tổng | Đạt | Fail | Bỏ qua |
|---|---:|---:|---:|---:|
| API Lead | 219 | 207 | 12 | 0 |
| API Hợp đồng khách hàng | 192 | 170 | 22 | 0 |
| API Khách hàng | 135 | 125 | 9 | 1 |
| API Nhà thầu | 180 | 164 | 16 | 0 |
| API Hợp đồng nhà thầu | 191 | 178 | 13 | 0 |
| Luồng API (FLOW) | 20 | 20 | 0 | 0 |
| UI | 78 | 57 | 21 | 0 |
| **Tổng tự động** | **1.015** | **921** | **93** | **1** |
| Thủ công (chưa chạy) | 6 | | | |

- **Tỷ lệ đạt:** 90,8% (921 / 1.014 case đã chạy).
- **Bỏ qua:** CUS-037 (`test.fixme`) cần khách hàng có HĐ đã hết hạn, chỉ tác vụ 0:00 tạo ra được.
- **Thủ công:** CTR-130, CTV-134 và 4 case tác vụ 0:00 chưa có code.
- **Fail của UI** gồm cả 3 case hết thời gian chờ (timeout).

### Phân loại 93 case Fail

| Nhóm nguyên nhân | API | UI | Tổng | Cần làm gì |
|---|---:|---:|---:|---|
| 1. Hệ thống lệch tài liệu / SRS / quy tắc đã chốt (nghi lỗi hệ thống) | 28 | 15 | 43 | Dev xem và sửa |
| 2. Hệ thống chặn đúng nhưng mã HTTP hoặc phạm vi khác tài liệu, cần chốt | 21 | 1 | 22 | BA / anh chốt quy tắc |
| 3. Đã có quyết định chấp nhận hành vi hệ thống, cần sửa test | 5 | 0 | 5 | Sửa test rồi chạy lại |
| 4. Lỗi do test, dữ liệu test, môi trường, hoặc chưa kết luận | 18 | 5 | 23 | Sửa test hoặc chạy lại |
| **Tổng** | **72** | **21** | **93** | |

### Thay đổi API so với lượt toàn bộ trước (05/11 11:14 → 06/11 16:44)

4 case chuyển sang **Đạt**:

| ID | Trước Fail vì | Nay |
|---|---|---|
| LEAD-025 | Code đọc `data: null` khi API trả 201 | Đạt sau khi sửa test theo quyết định chấp nhận `data: null` |
| LEAD-215 | Thiếu tài khoản NVKD C | Đạt khi dùng `binh.tran` |
| CUS-130 | Thiếu tài khoản DVKH C | Đạt khi dùng `binh.tran` |
| LEAD-092 | Chuỗi test có dấu cách cuối bị hệ thống cắt | Đạt sau khi sửa hàm sinh chuỗi |

5 case chuyển sang **Fail** ở lượt toàn bộ (không phải lỗi hệ thống); 4 case đã sửa test và **đạt** ở lượt chạy lại `sua-sau-toan-bo (lần 1)`, còn LEAD-077:

| ID | Nguyên nhân | Đã xử lý |
|---|---|---|
| CTR-014 | Mã HĐ đã vượt 3 chữ số (`CTC2611-1288`), test đòi đúng 3 chữ số | Đã sửa test: chấp nhận số tăng dần. **Đạt** khi chạy lại (17:05) |
| CTV-013 | Mã HĐ nhà thầu đã vượt 3 chữ số (`CTV2611-1400`), test đòi đúng 3 chữ số | Đã sửa test. **Đạt** khi chạy lại (17:05) |
| LEAD-160 | Lỗi do lần chuyển sang file thật: thêm 1 file upload nhưng quên tăng số tài liệu mong đợi (5 → 6) | Đã sửa test: so theo số file đã gửi. **Đạt** khi chạy lại (17:05) |
| VDR-106 | Như LEAD-160 (6 → 7) | Đã sửa test. **Đạt** khi chạy lại (17:05) |
| LEAD-077 | Số Lead trong thống kê và danh sách lệch 2, do test khác chạy song song tạo Lead giữa 2 lần đọc | Cần chạy riêng hoặc đổi cách so |

VDR-013 (mã nhà thầu `VDR-11124` vượt 4 chữ số) cũng đã sửa test và **đạt** ở lượt chạy lại.

Các case API Fail còn lại giữ **nguyên nguyên nhân** như lượt trước: mã lỗi và thông báo trả về giống hệt khi chạy với tài khoản và file thật mới.

## 2. Danh sách case API Fail theo nguyên nhân

### 2.1. Nhóm 1 — Nghi lỗi hệ thống (28 case)

#### 2.1.1. Thiếu file hoặc multipart hỏng → server trả 500 (11 case)
Tài liệu yêu cầu 400 (`validation-failed`). Hệ thống trả **500 internal-error**, tức không bắt được trường hợp thiếu phần `file` hoặc JSON hỏng trong multipart. Kết quả lặp lại ở cả 2 lượt toàn bộ (05/11 và 06/11).

| ID | Case | Kỳ vọng | Thực tế |
|---|---|---|---|
| CTR-017 | Upload HĐ thiếu file scan | 400 | 500 |
| CTR-032 | Multipart thiếu phần `contract` hoặc JSON hỏng | 400 | 500 |
| CTR-081 | Thêm phụ lục thiếu tên hoặc file | 400 | 500 |
| CTR-172 | Tái ký thiếu file scan hoặc trường bắt buộc | 400 | 500 |
| CTV-015 | Thêm HĐ nhà thầu thiếu trường bắt buộc hoặc file | 400 | 500 |
| CTV-028 | Multipart HĐ nhà thầu thiếu phần `contract` / JSON hỏng | 400 | 500 |
| CTV-067 | Thêm phụ lục HĐ nhà thầu thiếu tên hoặc file | 400 | 500 |
| CTV-175 | Tái ký HĐ nhà thầu thiếu file scan | 400 | 500 |
| LEAD-061 | Import Lead không gửi file | 400 | 500 |
| LEAD-163 | Đính kèm tài liệu Lead không gửi file | 400 | 500 |
| VDR-109 | Đính kèm tài liệu nhà thầu không gửi file | 400 | 500 |

#### 2.1.2. Người phụ trách / người nhận không hợp lệ vẫn được chấp nhận (4 case)
BR-CUST-16 và BR-CTR yêu cầu người phụ trách khách hàng phải là DVKH đang hoạt động. Tài khoản NVKD A `tunglead2` (id `61647735-…`, role QL_LEAD) vẫn được nhận.

| ID | Case | Thực tế |
|---|---|---|
| CTR-023 | Upload HĐ với `accountManagerId` không phải DVKH đang hoạt động | `POST /api/contracts` trả **201**, HĐ được tạo |
| CTR-034 | Danh sách người phụ trách cho upload HĐ loại tài khoản khóa và role khác | `GET /api/contracts/assignable-managers` vẫn có NVKD A |
| CUS-015 | Danh sách người nhận khi chuyển phụ trách KH | `GET /api/customers/assignable-managers` vẫn có NVKD A |
| CUS-124 | Chuyển phụ trách KH cho người không hợp lệ | Chuyển sang NVKD A vẫn trả **204** |

#### 2.1.3. File phụ lục của lần gia hạn không tải được (4 case)
Gia hạn HĐ kèm file phụ lục trả 200. Tải file của lần gia hạn `GET /api/contracts/{id}/extensions/1/file` trả **404** "ContractDocument … was not found".

| ID | Case |
|---|---|
| CTR-137 | Gia hạn kèm file phụ lục (đọc lại file) |
| CTR-144 | Tải file lần gia hạn |
| CTR-145 | Header của file lần gia hạn |
| CTR-147 | Response tải file lần gia hạn đúng schema Swagger |

#### 2.1.4. Dữ liệu không hợp lệ vẫn được nhận (6 case)

| ID | Case | Kỳ vọng | Thực tế |
|---|---|---|---|
| CTR-073 | Sửa HĐ với danh sách đầu mối rỗng (`contacts: []`) | 400 | 200, lưu được |
| CTV-020 | Thêm HĐ nhà thầu với nhiều hơn 1 file scan | 400 | 201 |
| CTV-032 | `contractor-options` với `mode` sai (`mode=EDIT`) | 400 | 200 (thiếu `mode` thì 400 đúng) |
| VDR-021 | Tạo nhà thầu dự phòng không hợp lệ | 400 / 404 / 409 | 201 |
| CUS-114 | Đổi hạng KH sang đúng hạng hiện tại | 400 / 409 (BR không cho đổi trùng hạng) | 200 |
| CTR-058 | Tìm `uploadable-customers` với ký tự đại diện `%_%` | Chỉ ra bản ghi chứa đúng chuỗi `%_%` | Trả về mọi Lead: ký tự `%`, `_` không được thoát (khớp kiểu LIKE) |

#### 2.1.5. Lead import không gán nguồn "Import" (2 case)
Tài liệu: Lead tạo từ file import có nguồn `IMPORT`. Thực tế, nguồn lấy theo cột "Nguồn" trong file (ví dụ `REFERRAL`). Lượt 06/11 đã dùng file mẫu `Mau_Nhap_Lead.xlsx` của anh và cho kết quả giống lượt trước.

| ID | Case |
|---|---|
| LEAD-055 | Import file 3 dòng hợp lệ |
| LEAD-056 | Lead import ở trạng thái Đang hoạt động |

#### 2.1.6. Thêm đầu mối với `primary=true` bị bỏ qua (1 case)

| ID | Case | Thực tế |
|---|---|---|
| CUS-050 | Thêm đầu mối KH với `primary`=true | 201 nhưng đầu mối chính vẫn là người cũ. Cùng hiện tượng với LEAD-109; LEAD-109 đã được anh chốt đổi sang luồng web (thêm rồi đặt chính bằng API riêng). CUS-050 có thể xử lý tương tự. |

### 2.2. Nhóm 2 — Chặn đúng nhưng mã HTTP hoặc phạm vi khác tài liệu, cần chốt (21 case)

#### 2.2.1. Trả 409 `domain-rule-violation` thay vì 400 / 413 / 403 (18 case)
Hệ thống có chặn và không tạo dữ liệu, nhưng trả **409** thay vì mã tài liệu ghi. Lượt 06/11 đã dùng file thật (`upload_test_1mb.exe`, file 10MB / 20MB / 21MB) và vẫn nhận 409. Giống MST nhà thầu trùng (anh đã chấp nhận 400 thay 409), cần anh chốt có chấp nhận 409 cho các trường hợp này không.

| ID | Case | Kỳ vọng | Thực tế |
|---|---|---|---|
| CTR-025 | Upload HĐ lỗi giữa chừng (file 0 byte) không chuyển đổi Lead | 400 | 409 |
| CTR-028 | File scan sai định dạng (`.exe`) hoặc quá lớn | 400 / 413 | 409 |
| CTR-029 | DVKH upload HĐ đầu tiên | 403 | 409 "Chỉ upload được hợp đồng đầu tiên cho Lead bạn phụ trách…" |
| CTR-082 | Phụ lục 5MB + 1 byte | 400 / 413 | 409 |
| CTR-083 | Phụ lục không phải PDF | 400 | 409 |
| CTR-176 | Tái ký lỗi không đổi HĐ gốc (file 0 byte) | 400 | 409 |
| CTV-021 | Thêm HĐ nhà thầu lỗi không đổi trạng thái nhà thầu (file 0 byte) | 400 | 409 |
| CTV-024 | File scan HĐ nhà thầu sai định dạng hoặc quá lớn | 400 / 413 | 409 |
| CTV-065 | Phụ lục HĐ nhà thầu định dạng khác PDF / DOCX | 400 | 409 |
| CTV-066 | Phụ lục HĐ nhà thầu 20MB + 1 byte | 400 / 413 | 409 |
| CTV-179 | Tái ký HĐ nhà thầu lỗi không đổi HĐ gốc | 400 | 409 |
| CTV-180 | Tái ký HĐ nhà thầu file scan sai định dạng | 400 | 409 |
| LEAD-161 | Tài liệu Lead định dạng không cho phép / đổi đuôi | 400 | 409 |
| LEAD-162 | Tài liệu Lead 10MB + 1 byte | 400 / 413 | 409 |
| LEAD-166 | Upload lỗi không tạo bản ghi tài liệu Lead | 400 / 413 | 409 |
| VDR-107 | Tài liệu nhà thầu định dạng không cho phép | 400 | 409 |
| VDR-108 | Tài liệu nhà thầu 10MB + 1 byte | 400 / 413 | 409 |
| VDR-112 | Upload lỗi không tạo bản ghi tài liệu nhà thầu | 400 / 413 | 409 |

#### 2.2.2. Sai phương thức HTTP trả 400 thay vì 405 (2 case)

| ID | Case | Kỳ vọng | Thực tế |
|---|---|---|---|
| VDR-040 | Gửi sai phương thức HTTP (API danh sách nhà thầu) | 405 | 400 |
| VDR-046 | Gửi sai phương thức HTTP (API thống kê nhà thầu) | 405 | 400 |

#### 2.2.3. Phạm vi xem của NVKD (1 case)

| ID | Case | Kỳ vọng | Thực tế |
|---|---|---|---|
| CUS-011 | NVKD xem danh sách khách hàng | 403 | 200. `tunglead2` chỉ có role QL_LEAD nhưng vẫn xem được danh sách KH, và có menu "Quản lý Khách hàng" trên web. Cần chốt NVKD có được xem danh sách KH không. |

### 2.3. Nhóm 3 — Đã chốt chấp nhận, cần sửa test (5 case)

| ID | Case | Thực tế | Quyết định đã có | Trạng thái test |
|---|---|---|---|---|
| VDR-020 | MST nhà thầu đã tồn tại | 400 | 400 là dữ liệu không hợp lệ, chấp nhận (05/11) | Chưa sửa |
| VDR-024 | Gửi lại cùng request tạo nhà thầu | 400 | Như trên | Chưa sửa |
| VDR-025 | 2 request cùng MST đồng thời | 1 thành công, 1 trả 400 | Như trên | Chưa sửa |
| VDR-056 | Sửa sang MST trùng nhà thầu khác | 400 | Như trên | Chưa sửa |
| CTR-171 | Số HĐ trùng trong cùng KH | 400 "Số hợp đồng này đã tồn tại…" | Chặn trùng trong cùng KH là đúng; 400 chấp nhận như UI-CTR-010 | Chưa sửa |

### 2.4. Nhóm 4 — Lỗi do test, dữ liệu test, môi trường, hoặc chưa kết luận (18 case)

#### 2.4.1. Tài khoản test không đúng vai trò (1 case)

| ID | Case | Nguyên nhân |
|---|---|---|
| CTR-001 | DVKH xem danh sách HĐ | Case kiểm DVKH chỉ thấy HĐ mình phụ trách (BR-CTR-18). DVKH A `tungkh2` có role `FULL_QUYEN_K1` nên thấy cả HĐ của DVKH khác. Cần 1 tài khoản DVKH thuần (chỉ QL_KH) để kiểm đúng. |

#### 2.4.2. Số liệu thống kê bị các test chạy song song làm thay đổi (5 case)
Test đọc số liệu trước và sau 1 thao tác rồi so chênh lệch. Trong lúc đó các worker khác cũng tạo hoặc đổi dữ liệu nên chênh lệch lớn hơn. Cần chạy riêng 1 worker hoặc so theo bản ghi của test.

| ID | Case | Thực tế (lượt 06/11) |
|---|---|---|
| LEAD-076 | Số liệu Lead đổi theo thao tác | Kỳ vọng tăng 2, thực tế tăng 14 |
| LEAD-077 | Thống kê chỉ tính Lead trong phạm vi user | Thống kê 2.155, đếm danh sách 2.157 (lệch do Lead tạo thêm giữa 2 lần đọc) |
| VDR-042 | Số liệu nhà thầu đổi theo thao tác | Kỳ vọng tăng 1, thực tế tăng 4 |
| VDR-043 | Thống kê không phụ thuộc bộ lọc danh sách | 2 lần đọc lệch nhau do dữ liệu thay đổi giữa 2 lần đọc |
| CTV-040 | Số liệu HĐ nhà thầu đổi theo thao tác | Đọc ra `NaN`: tên trường thống kê không khớp, cần dò lại response |

#### 2.4.3. Xuất file theo bộ lọc kết hợp / khoảng ngày 1 ngày (8 case)
Request xuất trả 200 nhưng nội dung file không khớp điều kiện lọc test kiểm. Nghi do lệch múi giờ khi so ngày tạo / ngày hết hạn (UTC và giờ Việt Nam), hoặc API xuất bỏ qua một số tham số lọc. **Chưa kết luận**, cần mở file xuất trong evidence để so.

| ID | Case |
|---|---|
| CTR-042 | Xuất HĐ kết hợp bộ lọc (hạng + khoảng ngày hết hạn) |
| CTR-043 | Xuất HĐ khoảng ngày hết hạn 1 ngày |
| CUS-022 | Xuất KH kết hợp bộ lọc |
| CUS-023 | Xuất KH khoảng ngày tạo 1 ngày |
| LEAD-049 | Xuất Lead kết hợp nhiều bộ lọc |
| LEAD-050 | Xuất Lead khoảng ngày tạo 1 ngày |
| VDR-035 | Xuất nhà thầu kết hợp bộ lọc |
| VDR-036 | Xuất nhà thầu khoảng ngày tạo 1 ngày |

#### 2.4.4. Dữ liệu email biên của test chưa đúng (3 case)
Email test có phần trước @ dài hơn 64 ký tự, sai chuẩn email nên bị từ chối là đúng. Cần đổi dữ liệu giống cách đã sửa cho UI-LEADF-013 và UI-CUS-007.

| ID | Case |
|---|---|
| LEAD-108 | Email đầu mối Lead 100 ký tự |
| CUS-063 | Email đầu mối KH 100 ký tự |
| VDR-079 | Email nhà thầu 255 ký tự |

#### 2.4.5. Chưa kết luận (1 case)

| ID | Case | Ghi chú |
|---|---|---|
| CUS-041 | Dữ liệu dùng chung với Lead gốc khi sửa KH | Kỳ vọng số bản ghi > 4, đọc được đúng 4 (lặp lại ở cả 2 lượt). Cần xem lại phép kiểm |

## 3. Case UI Fail (21 case)

#### Thay đổi UI so với bản trước (06/11, sau lượt `ui-sua-3-case (lần 1)`)

4 case chuyển sang **Đạt** sau khi sửa code test:

| ID | Trước đây Fail vì | Đã sửa | Kết quả |
|---|---|---|---|
| UI-VDR-002 | Test bấm nhầm ô "Phân hạng" trong Bộ lọc nâng cao, không thấy "Vận tải" | Chọn ô theo nhãn "Loại dịch vụ" (web gửi `serviceType=TRANSPORT`) | Đạt (7s) |
| UI-VDRD-008 | Test tìm sai nhãn nút xác nhận | Bấm nút "Xoá nhà thầu" trong popup | Đạt (6s) |
| UI-CTV-003 | Popup xem DOCX còn mở che nút Tải xuống | Đóng popup "File phụ lục" trước khi tải | Đạt (20s) |
| UI-LEAD-006 | Lượt trước web chưa về màn đăng nhập | Không đổi code; chạy lại ở cuối lượt (project `ui-session`) | Đạt (5s) |

Lưu ý khi đọc phần UI:
- Kết quả là của lượt chạy gần nhất có chạy case đó. Một số case đã được sửa code test sau lượt đó nhưng chưa chạy lại; các case này ghi rõ trong phần nguyên nhân chi tiết.
- Mỗi tài khoản chỉ giữ 1 phiên. Đăng nhập web bằng tài khoản test trong lúc chạy sẽ làm test bị đá phiên và Fail giả.

### 3.1. Danh sách case UI Fail

| ID | Tên case | Nhóm (A=1, B=2, C=4) | Lượt chạy | Nguyên nhân ngắn |
|---|---|---|---|---|
| UI-LEAD-003 | Ô số liệu khớp API | A | ui-lan-dau (lần 6) | Thiếu ô "Lead Ngưng hoạt động" |
| UI-LEAD-005 | Role khác không thấy menu Lead | B | ui-lan-dau (lần 6) | Gõ thẳng URL `/leads` vẫn vào được màn Lead |
| UI-LEAD-008 | Điều khiển bằng bàn phím | A | ui-lan-dau (lần 6) | Phím Esc không đóng popup Thêm mới Lead |
| UI-LEADF-003 | Tạo Lead thành công | A | ui-lan-dau (lần 6) | Tạo xong không chuyển sang màn chi tiết Lead |
| UI-LEADF-007 | Chuyển người phụ trách Lead | A | ui-lan-dau (lần 6) | Thông báo của NVKD B không nhắc mã / tên Lead |
| UI-COM-003 | Xuất Excel theo kết quả lọc | A | ui-lan-dau (lần 6) | Lọc ra 0 bản ghi nhưng file xuất vẫn có 4 dòng |
| UI-CTR-010 | Biên điều khoản HĐ | C | ui-sua-hd (lần 1) | Hạn thanh toán −1 và 1.5 không báo lỗi tại ô, cần xem lại |
| UI-CTR-011 | Phân vùng file scan và phụ lục HĐ khách hàng | A | ui-file-that (lần 2) | Phụ lục bị từ chối 409 sau khi NVKD tạo HĐ; file 0 byte tạo được HĐ |
| UI-CTR-013 | Biên badge cảnh báo kỳ hạn | C | ui-sua-hd (lần 1) | Quá thời gian khi duyệt toàn bộ HĐ; 1 HĐ còn 5 ngày không thấy badge |
| UI-CUS-002 | Lý do tạm ngưng hiển thị rõ | A | ui-lan-dau (lần 6) | Lịch sử thao tác không có lý do tạm ngưng |
| UI-CUS-005 | Hạn mức âm | A | ui-lan-dau (lần 6) | Hạn mức −1 không bị chặn |
| UI-CUS-008 | Biên hạn mức tín dụng | A | ui-lan-dau (lần 6) | Hạn mức −1 lưu được |
| UI-CUS-009 | Đổi hạng và chuyển người phụ trách | C | ui-lan-dau (lần 6) | Lý do 501 ký tự: kết quả chuyển không như kỳ vọng, cần xem lại |
| UI-CUS-010 | HĐ hiện hành và trạng thái KH | A | ui-lan-dau (lần 6) | Lịch sử thao tác không có lý do tạm ngưng |
| UI-VDR-007 | Biên form thêm, sửa nhà thầu | C | ui-lan-dau (lần 6) | Quá 20 phút, test quá dài |
| UI-VDR-008 | Phân vùng tài liệu nhà thầu | A | ui-file-that (lần 2) | File .exe đổi đuôi .pdf vẫn được lưu |
| UI-VDRD-005 | Bảng giá mua ở tab Bảng giá dịch vụ | A | ui-lan-dau (lần 6) | Tab hiện dòng giá, không hiện bảng giá mua và trạng thái |
| UI-VDRD-006 | Biên đầu mối nhà thầu | A | ui-lan-dau (lần 6) | Chi tiết nhà thầu không có xóa / đặt đầu mối chính |
| UI-VDRD-007 | Popup đổi hạng, dừng hợp tác, kích hoạt lại | A | ui-lan-dau (lần 6) | Đổi hạng kèm lý do 500 ký tự không lưu |
| UI-CTV-006 | Biên form thêm HĐ nhà thầu | A | ui-file-that (lần 2) | File scan 0 byte tạo được HĐ |
| UI-CTV-009 | Popup gia hạn, tái ký, hủy, dừng HĐ nhà thầu | C | ui-lan-dau (lần 6) | Chưa chạy lại sau khi sửa dữ liệu ngày D |

### 3.2. Nguyên nhân chi tiết từng case UI

#### Nhóm 1 (UI). Hệ thống lệch tài liệu / SRS / quy tắc đã chốt (15 case)

##### UI-LEAD-003 — Ô số liệu khớp API
- **Kỳ vọng:** SRS (UC Xem danh sách Lead) yêu cầu 3 ô: Tổng số Lead, Lead Đang hoạt động, Lead Ngưng hoạt động, bằng số của `GET /api/leads/stats`.
- **Thực tế:** màn chỉ có 2 ô, ví dụ `Tổng số lead: 1570`, `Đang hoạt động: 768`.
- **Nguyên nhân:** web **thiếu ô "Lead Ngưng hoạt động"**.

##### UI-LEAD-008 — Điều khiển bằng bàn phím
- **Kỳ vọng:** Tab đi qua được ô tìm kiếm, bộ lọc, nút Thêm mới; Enter mở popup, Esc đóng popup. Nút icon không cần nhãn (user chốt 05/11).
- **Thực tế:** Tab và Enter đạt. Bấm Esc, popup "Thêm mới Lead" **vẫn mở**.
- **Nguyên nhân:** popup không đóng bằng phím Esc.

##### UI-LEADF-003 — Tạo Lead thành công
- **Kỳ vọng:** sau khi lưu, chuyển sang màn chi tiết Lead mới (mã LED-XXXX).
- **Thực tế:** Lead tạo thành công (API 201, đúng 2 đầu mối, 1 đầu mối chính), nhưng web ở lại `/leads/`, không mở chi tiết.
- **Nguyên nhân:** web không điều hướng sang chi tiết sau khi tạo. Nếu chấp nhận ở lại danh sách thì cần chốt lại case.

##### UI-LEADF-007 — Chuyển người phụ trách Lead
- **Kỳ vọng:** chuyển thành công, NVKD B thấy Lead và có thông báo. SRS: "[Người cũ] đã chuyển Lead [Mã Lead] - [Tên doanh nghiệp] sang bạn phụ trách".
- **Thực tế:** các bước chuyển đều đạt (popup báo yêu cầu khi thiếu dữ liệu, 204, toast, NVKD A không còn thấy Lead, NVKD B đọc được Lead). Riêng `GET /api/notifications` của NVKD B **không có mã hay tên Lead** vừa chuyển.
- **Nguyên nhân:** không thấy thông báo chuyển giao. Cần dev xác nhận thông báo có được tạo không, hay nằm ở API khác.

##### UI-COM-003 — Xuất Excel theo kết quả lọc
- **Kỳ vọng:** kết quả lọc rỗng thì báo phù hợp, không tải file nhầm dữ liệu.
- **Thực tế:** lọc nhiều trang và 1 trang đều xuất đúng số dòng. Khi lọc bằng từ khóa không có kết quả (bảng rỗng), file xuất vẫn có **4 dòng dữ liệu**.
- **Nguyên nhân:** xuất Excel khi kết quả rỗng không theo bộ lọc.

##### UI-CTR-011 — Phân vùng file scan và phụ lục HĐ khách hàng
Có 2 lỗi, xác nhận qua trace mạng:
1. **Phụ lục không lưu được khi NVKD upload HĐ đầu tiên.**
   - NVKD tạo HĐ kèm 5 phụ lục: `POST /api/contracts` trả 201.
   - Web gửi tiếp từng phụ lục bằng request riêng `POST /api/contracts/{id}/annexes`, server trả **409 "Chỉ Người phụ trách khách hàng mới thực hiện được thao tác này"**.
   - Kết quả: HĐ có 0 phụ lục thay vì 5.
2. **File HĐ đã ký 0 byte tạo được HĐ.**
   - Sau khi chọn file 0 byte, request tạo HĐ trả 201.
   - Bình thường, file không hợp lệ bị bỏ và server trả 409 "Vui lòng đính kèm file scan hợp đồng"; DOCX và TXT đều bị chặn theo cách này.
- **Đạt:** DOCX, TXT bị chặn; 21MB bị chặn; đúng 20MB lưu được; phụ lục PDF 10MB (vượt 5MB) bị chặn.

##### UI-CUS-002 — Lý do tạm ngưng hiển thị rõ
- **Kỳ vọng:** KH có HĐ chưa hiệu lực ở trạng thái Tạm ngưng; lý do (HĐ chưa hiệu lực) xem trong Lịch sử thao tác (user chốt 05/11).
- **Thực tế:** trạng thái "Tạm ngưng" hiển thị đúng. Popup "Chi tiết lịch sử thao tác" chỉ có 3 dòng: Tạo mới Lead, Chuyển đổi thành khách hàng, Khởi tạo khách hàng. **Không có dòng nào nêu lý do tạm ngưng**.
- **Nguyên nhân:** lý do tạm ngưng không xuất hiện ở chi tiết KH lẫn lịch sử thao tác.

##### UI-CUS-010 — HĐ hiện hành và trạng thái KH theo tổ hợp hợp đồng
- **Thực tế:** HĐ hiện hành và trạng thái các tổ hợp đạt; KH chỉ còn HĐ đóng vẫn hiện trong danh sách.
- **Nguyên nhân Fail:** giống UI-CUS-002. Với KH "chỉ có HĐ chờ", lịch sử thao tác không có lý do tạm ngưng.

##### UI-CUS-005 — Hạn mức âm
- **Kỳ vọng:** hạn mức phải ≥ 0 (user chốt 05/11); nhập −1 thì báo lỗi tại ô, không gọi API.
- **Thực tế:** nhập −1 rồi bấm Lưu hạn mức, **không có lỗi tại ô**.
- **Nguyên nhân:** web không chặn hạn mức âm.

##### UI-CUS-008 — Biên hạn mức tín dụng
- **Thực tế:** `PUT /credit-limit` với −1 trả **200**, hạn mức được lưu.
- **Nguyên nhân:** hệ thống (cả web và API) cho lưu hạn mức âm, trái quy tắc ≥ 0.

##### UI-VDR-008 — Phân vùng tài liệu nhà thầu
- **Thực tế:** các file đúng 10MB (PDF, DOCX, JPG, PNG, XLSX, ZIP) lưu được; 11MB, EXE, MP4, 0 byte bị chặn.
- **Nguyên nhân Fail:** file **.exe đổi đuôi thành .pdf** (`hop-dong.pdf`, nội dung là file thực thi) vẫn được lưu thành tài liệu, contentType `application/pdf`. Hệ thống chỉ xét đuôi file, không kiểm tra nội dung.

##### UI-VDRD-005 — Bảng giá mua ở tab Bảng giá dịch vụ
- **Kỳ vọng:** theo SRS (khối Bảng giá mua đầu vào, BR-CTV-20), tab hiện bảng giá mua gắn nhà thầu kèm trạng thái hiệu lực; bấm vào mở đúng bảng giá.
- **Thực tế:** tạo bảng giá mua qua UI thành công (201); tab hiện đúng mã bảng giá và không lẫn nhà thầu khác.
- **Nguyên nhân Fail:**
  - Tab hiện **từng dòng giá** (mã `RS2611-xxx-0001`, chi cục, đơn giá, trạng thái dòng "Đã phê duyệt"), không hiện trạng thái của bảng giá ("Tạo mới").
  - Bấm vào dòng **không mở** màn bảng giá.

##### UI-VDRD-006 — Biên đầu mối nhà thầu
- **Kỳ vọng:** SRS (khối Đầu mối liên hệ) cho Thêm / Sửa / Xóa và đánh dấu đầu mối chính.
- **Thực tế:** chi tiết nhà thầu chỉ có nút "Chỉnh sửa người liên hệ". **Không có nút xóa đầu mối và đặt đầu mối chính**.
- **Nguyên nhân:** thiếu chức năng so với SRS. Test bị treo khi chờ nút xóa nên báo hết thời gian chờ.

##### UI-VDRD-007 — Popup đổi hạng, dừng hợp tác, kích hoạt lại
- **Kỳ vọng:** lý do tối đa 500 ký tự; lý do 499 và 500 phải lưu được (API VDR-174: 500 thành công).
- **Thực tế:** đổi hạng kèm lý do **500 ký tự không đổi được hạng** (hạng giữ nguyên). Biến thể 501 bị ô nhập cắt về 500 ký tự và cũng không lưu.
- **Nguyên nhân (nghi lỗi hệ thống):** giới hạn lý do của popup đổi hạng có thể nhỏ hơn 500. Cần dev xác nhận giới hạn thực tế.

##### UI-CTV-006 — Biên và phân vùng form thêm HĐ nhà thầu
- **Nguyên nhân Fail:** file scan **0 byte tạo được HĐ** (201), tương tự UI-CTR-011.
- **Đạt:** EXE và DOC bị chặn; 21MB bị chặn; ngày kết thúc trước ngày hiệu lực bị khóa trên lịch.
- **Ghi chú:** lượt chạy này có 1 lỗi mạng `socket hang up` khi gọi API tạo nhà thầu, do môi trường chứ không phải nghiệp vụ.

#### Nhóm 2 (UI). Chờ quyết định nghiệp vụ (1 case)

##### UI-LEAD-005 — Role khác không thấy menu Lead
- **Thực tế:** tài khoản không có quyền Lead (tungkh2) không thấy menu Lead (đạt). Nhưng gõ thẳng `https://logx-dev.sonthanh.net.vn/leads` lên thanh địa chỉ thì vẫn vào được màn "Quản lý Lead": có ô tìm kiếm, bộ lọc, bảng rỗng "Không có dữ liệu". Không lộ dữ liệu.
- **Cần chốt:** chấp nhận như vậy, hay phải chặn / chuyển trang báo không có quyền như tài liệu ghi.

#### Nhóm 4 (UI). Lỗi do test hoặc chưa kết luận (5 case)

##### UI-CTR-010 — Biên điều khoản HĐ trên form upload, sửa, tái ký
- **Đạt:** số HĐ trùng trong cùng KH bị chặn (400 "Số hợp đồng này đã tồn tại ở một hợp đồng khác của khách hàng"); số HĐ 99 / 100 ký tự và hạn thanh toán 0 / 1 / 364 / 365 trên form sửa lưu đúng.
- **Fail:**
  - Trên form Upload, nhập hạn thanh toán **−1 và 1.5 không có lỗi tại ô**, và HĐ được tạo (201).
  - Trace cho thấy giá trị gửi lên là 43, 18, 21, không phải giá trị đã nhập. Có thể web tự điền lại hạn thanh toán sau khi chọn khách hàng.
- **Kết luận:** chưa đủ để khẳng định lỗi hệ thống; cần kiểm tra lại cách web nhận giá trị ô hạn thanh toán. Bước form Tái ký đã sửa test (điền đủ "Thời hạn hợp đồng mới") nhưng chưa chạy lại.

##### UI-CTR-013 — Biên badge cảnh báo kỳ hạn HĐ khách hàng
- **Thực tế:**
  - Badge "(Còn N ngày)" của các HĐ test hiện đúng màu.
  - Khi duyệt toàn bộ HĐ Đang hiệu lực, **HĐ CTC2611-1053** (API báo còn 5 ngày) không thấy badge trên danh sách.
  - Test chạy quá 15 phút rồi bị dừng.
- **Nguyên nhân:** test duyệt từng dòng trên mọi trang nên quá chậm, cần tối ưu. Riêng CTC2611-1053 cần kiểm tra tay (có thể là lỗi hiển thị badge). Màn danh sách HĐ cũng chưa có 3 ô đếm Khẩn cấp / Lưu ý / Theo dõi theo SRS mục 3.2.2.

##### UI-CUS-009 — Đổi phân hạng và chuyển người phụ trách
- **Đạt:** ô hạng chỉ có 2 giá trị; Thường ↔ Chiến lược; Hủy giữ nguyên; sửa trường khác không đổi hạng; lý do rỗng không chuyển; lý do 500 ký tự chuyển được và HĐ liên quan đổi người phụ trách.
- **Fail:** biến thể lý do 501 ký tự cho kết quả chuyển người phụ trách khác kỳ vọng. Ô nhập có giới hạn 500 nên đáng lẽ phải cắt về 500 và chuyển được như biến thể 500.
- **Kết luận:** chưa kết luận, cần xem trace và chạy lại.

##### UI-VDR-007 — Biên và phân vùng form thêm, sửa nhà thầu
- **Đạt (các phần đã chạy được):** bỏ từng trường bắt buộc có thông báo riêng; MST sai định dạng bị chặn; MST trùng bị chặn (400 hoặc 409 đều đạt theo user chốt 05/11).
- **Nguyên nhân Fail (lỗi test):** case tạo khoảng 25 nhà thầu qua UI nên chạy quá 20 phút và bị dừng. Cần tách nhỏ hoặc rút gọn.

##### UI-CTV-009 — Popup gia hạn, tái ký, hủy, dừng khai thác HĐ nhà thầu
- **Lượt chạy gần nhất (lần 6)** còn dùng dữ liệu cũ: HĐ nối tiếp bắt đầu ngay sau ngày hết hạn gốc, nên D − 1 trùng ngày hết hạn cũ, bị chặn đúng theo BR-CTV-08. Test sau đó hết thời gian chờ khi tìm nút "Xác nhận" trong popup gia hạn.
- **Đã sửa test:** ngày D cách ngày hết hạn gốc 30 ngày. **Chưa chạy lại.**

## 4. Tổng hợp lỗi hệ thống cần dev xem

Gom các case Nhóm 1 (API và UI) theo từng vấn đề:

| # | Vấn đề | Nguồn | Case liên quan |
|---|---|---|---|
| 1 | Thiếu file hoặc multipart hỏng → server trả 500 thay vì 400 | API | CTR-017, CTR-032, CTR-081, CTR-172, CTV-015, CTV-028, CTV-067, CTV-175, LEAD-061, LEAD-163, VDR-109 |
| 2 | Người phụ trách / người nhận không phải DVKH đang hoạt động (ví dụ NVKD A `tunglead2`) vẫn được nhận và vẫn có trong danh sách chọn | API | CTR-023, CTR-034, CUS-015, CUS-124 |
| 3 | File phụ lục của lần gia hạn HĐ không tải được (404 "ContractDocument … was not found") | API | CTR-137, CTR-144, CTR-145, CTR-147 |
| 4 | Sửa HĐ với danh sách đầu mối rỗng vẫn lưu | API | CTR-073 |
| 5 | Thêm HĐ nhà thầu nhận nhiều hơn 1 file scan | API | CTV-020 |
| 6 | `contractor-options` nhận `mode` sai (`EDIT`) | API | CTV-032 |
| 7 | Tạo được nhà thầu dự phòng không hợp lệ | API | VDR-021 |
| 8 | Đổi hạng KH sang đúng hạng hiện tại vẫn trả 200 | API | CUS-114 |
| 9 | Tìm kiếm không thoát ký tự `%`, `_` (khớp kiểu LIKE) | API | CTR-058 |
| 10 | Lead import không gán nguồn `IMPORT` | API | LEAD-055, LEAD-056 |
| 11 | Thêm đầu mối KH với `primary=true` bị bỏ qua | API | CUS-050 |
| 12 | File 0 byte được nhận và tạo HĐ khi upload qua web (HĐ khách hàng, HĐ nhà thầu). Gọi thẳng API với file 0 byte thì bị chặn 409 (CTR-025, CTV-021), nên cần dev xem web gửi gì khi chọn file 0 byte | UI | UI-CTR-011, UI-CTV-006 |
| 13 | NVKD upload HĐ đầu tiên kèm phụ lục: phụ lục bị 409 "Chỉ Người phụ trách khách hàng…" nên không lưu | UI | UI-CTR-011 |
| 14 | File .exe đổi đuôi .pdf vẫn lưu thành tài liệu nhà thầu | UI | UI-VDR-008 |
| 15 | Hạn mức tín dụng −1 lưu được (quy tắc ≥ 0) | UI | UI-CUS-005, UI-CUS-008 |
| 16 | Màn Lead thiếu ô số liệu "Lead Ngưng hoạt động" | UI | UI-LEAD-003 |
| 17 | Esc không đóng popup Thêm mới Lead | UI | UI-LEAD-008 |
| 18 | Tạo Lead xong không mở chi tiết Lead | UI | UI-LEADF-003 |
| 19 | Không thấy thông báo chuyển giao Lead cho người nhận | UI | UI-LEADF-007 |
| 20 | Xuất Excel khi lọc rỗng vẫn ra 4 dòng | UI | UI-COM-003 |
| 21 | Lý do tạm ngưng KH không có trong lịch sử thao tác | UI | UI-CUS-002, UI-CUS-010 |
| 22 | Tab Bảng giá dịch vụ hiện dòng giá, không hiện bảng giá mua và trạng thái; bấm không mở bảng giá | UI | UI-VDRD-005 |
| 23 | Chi tiết nhà thầu thiếu xóa / đặt đầu mối chính | UI | UI-VDRD-006 |
| 24 | Đổi hạng nhà thầu kèm lý do 500 ký tự không lưu (nghi giới hạn < 500) | UI | UI-VDRD-007 |
| 25 | Danh sách HĐ khách hàng chưa có 3 ô đếm Khẩn cấp / Lưu ý / Theo dõi; HĐ CTC2611-1053 còn 5 ngày không thấy badge | UI | UI-CTR-013 |

## 5. Việc tiếp theo

### 5.1. Cần anh / BA chốt

| # | Nội dung | Case |
|---|---|---|
| 1 | Có chấp nhận 409 `domain-rule-violation` thay cho 400 / 413 / 403 khi file sai định dạng, quá dung lượng, 0 byte hoặc sai quyền upload không | 18 case mục 2.2.1 |
| 2 | Sai phương thức HTTP trả 400 thay vì 405 có chấp nhận không | VDR-040, VDR-046 |
| 3 | NVKD có được xem danh sách khách hàng không | CUS-011 |
| 4 | Gõ thẳng URL `/leads` bằng tài khoản không có quyền Lead vẫn vào màn rỗng có chấp nhận không | UI-LEAD-005 |
| 5 | CUS-050 có đổi sang luồng web giống LEAD-109 (thêm đầu mối rồi đặt chính bằng API riêng) không | CUS-050 |
| 6 | Cấp 1 tài khoản DVKH thuần (chỉ role QL_KH, không FULL_QUYEN) để kiểm phạm vi xem HĐ của DVKH | CTR-001 |

### 5.2. Phía test

| Case | Việc cần làm | Trạng thái |
|---|---|---|
| VDR-020, VDR-024, VDR-025, VDR-056, CTR-171 | Chấp nhận 400 theo quyết định đã có | Chưa sửa |
| LEAD-108, CUS-063, VDR-079 | Đổi email biên sang dạng hợp lệ (phần trước @ ≤ 64 ký tự) | Chưa sửa |
| LEAD-076, LEAD-077, VDR-042, VDR-043, CTV-040 | Chạy riêng 1 worker hoặc so theo bản ghi của test; dò lại tên trường thống kê HĐ nhà thầu | Chưa sửa |
| CTR-042, CTR-043, CUS-022, CUS-023, LEAD-049, LEAD-050, VDR-035, VDR-036 | Mở file xuất trong evidence để xác định lệch múi giờ hay API bỏ qua tham số lọc | Chưa làm |
| CUS-041 | Xem lại phép kiểm | Chưa làm |
| UI-VDR-007 | Tách nhỏ hoặc rút gọn số lần tạo nhà thầu qua UI | Chưa sửa |
| UI-CTR-013 | Đọc badge cả trang một lần thay vì từng dòng để chạy nhanh hơn | Chưa sửa |
| UI-CTR-010, UI-CUS-009 | Xem lại trace, chạy lại | Chưa làm |
| UI-CTV-009 | Chạy lại sau khi sửa dữ liệu ngày D | Đã sửa, chưa chạy lại |
