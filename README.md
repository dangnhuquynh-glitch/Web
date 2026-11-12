# Lành — Lịch làm part-time (bản thiết kế lại)

Giao diện web Google Apps Script của Lành: **Đăng ký ca**, **Tồn kho**, **Quản lý** (duyệt đăng ký, lịch tháng, doanh thu/Pancake, bảng lương, nhân sự, tồn kho, cài đặt).

## Tệp
| Tệp | Nội dung |
|---|---|
| `Index.html` | Bản **thiết kế lại** — dán vào file HTML của dự án Apps Script |
| `original/Index.html` | Bản gốc lấy từ web app đang chạy (để so sánh / quay lại) |
| `docs/pro-theme.css` | Lớp giao diện mới (đã nhúng sẵn trong `Index.html`) |
| `docs/ux.css`, `docs/ux.js` | Lớp trải nghiệm: hướng dẫn, gợi ý, phím tắt, sáng/tối (đã nhúng sẵn) |
| `docs/screenshots/` | Ảnh trước (`truoc-*`) và sau (`sau-*`) |

## Thay đổi
Toàn bộ JavaScript và các lệnh `google.script.run` (`api`, …) **giữ nguyên**: chỉ thay phần trình bày.

- Hệ màu theo kiểu Atlassian Design System (nền xám trung tính, chữ `#172B4D`, xanh thương hiệu `#1F845A`), có chế độ tối.
- Bỏ font serif Lora, dùng một font Be Vietnam Pro cho cả tiêu đề, trông gọn và giống phần mềm doanh nghiệp hơn.
- Thanh trên màu trắng, nút chuyển chế độ dạng segmented control; banner demo dạng thông báo.
- Thẻ dùng đổ bóng (elevation) thay viền; bo góc thống nhất 6–8px.
- Tab quản lý, nhãn trạng thái (lozenge), tiêu đề bảng in hoa nhỏ, hover cho dòng bảng.
- Ô nhập có viền focus xanh dương rõ ràng; trên điện thoại nút chế độ kéo full chiều ngang.

## Dễ dùng cho người mới và người dùng lâu năm
**Người mới**
- **Màn chào lần đầu:** hỏi “Bạn muốn làm gì hôm nay?” với 3 lựa chọn (Đăng ký ca · Kiểm kho · Quản lý) và đưa thẳng tới đúng chỗ.
- **Gợi ý theo từng màn:** khung “Mẹo” ngắn ở đầu mỗi chế độ, bấm *Đã hiểu* là ẩn vĩnh viễn, *Xem từng bước* để mở hướng dẫn chi tiết.
- **Nút ? (Trợ giúp)** luôn ở góc trên: hướng dẫn từng bước cho cả 3 chế độ, bảng ký hiệu ca (S, C, HV, P, NL), xem lại màn chào.
- Vòng xoay khi đang tải, thông báo có dấu ✓ / ! rõ ràng.

**Người dùng lâu năm**
- **Nhớ chỗ đang làm:** mở lại web sẽ vào đúng chế độ và tab Quản lý dùng lần trước.
- **Phím tắt (máy tính):** `1` `2` `3` chuyển chế độ · `←` `→` tuần/tháng trước-sau · `[` `]` đổi tab Quản lý · `/` tới ô tìm · `Ctrl+Enter` Gửi/Lưu · `Esc` đóng · `?` trợ giúp. Rê chuột lên nút chế độ sẽ thấy phím tương ứng.
- **Giao diện Sáng / Tối / Tự động** (nút cạnh dấu ?), web nhớ lựa chọn.
- Gợi ý đã tắt sẽ không hiện lại, không làm phiền.

## Điện thoại & máy tính
Đã kiểm tra mọi màn hình (Đăng ký ca, 4 tab Tồn kho, 7 tab Quản lý và các tab con) ở 360, 390, 768, 1024 và 1440px: không tràn ngang, không có nút quá nhỏ để chạm.

- **Điện thoại:** thanh tab Quản lý thành 1 hàng vuốt ngang; nút chế độ trải đầy chiều ngang; nút cao ≥ 40px dễ bấm; ô thống kê tự thu nhỏ số tiền; bảng lớn (lịch tháng, lương) vuốt ngang bên trong khung, cột tên giữ cố định.
- **Máy tính:** nội dung rộng tối đa 1200px; thanh tab Quản lý dính trên cùng khi cuộn.
- Server đã gắn sẵn thẻ viewport (`addMetaTag`) nên không cần sửa Code.gs.

## Triển khai
1. Mở dự án Apps Script → file HTML đang được `doGet` trả về.
2. Dán nội dung `Index.html` thay thế → **Deploy → Manage deployments → Edit → New version**.
3. Mở file trực tiếp trên trình duyệt (không qua Apps Script) sẽ chạy **chế độ demo**, không ghi vào Google Sheet.
