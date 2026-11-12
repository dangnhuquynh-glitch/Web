# Lành — Lịch làm part-time (bản thiết kế lại)

Giao diện web Google Apps Script của Lành: **Đăng ký ca**, **Tồn kho**, **Quản lý** (duyệt đăng ký, lịch tháng, doanh thu/Pancake, bảng lương, nhân sự, tồn kho, cài đặt).

## Tệp
| Tệp | Nội dung |
|---|---|
| `Index.html` | Bản **thiết kế lại** — dán vào file HTML của dự án Apps Script |
| `original/Index.html` | Bản gốc lấy từ web app đang chạy (để so sánh / quay lại) |
| `docs/pro-theme.css` | Lớp giao diện mới (đã nhúng sẵn trong `Index.html`) |
| `docs/screenshots/` | Ảnh trước (`truoc-*`) và sau (`sau-*`) |

## Thay đổi
Toàn bộ JavaScript và các lệnh `google.script.run` (`api`, …) **giữ nguyên**: chỉ thay phần trình bày.

- Hệ màu theo kiểu Atlassian Design System (nền xám trung tính, chữ `#172B4D`, xanh thương hiệu `#1F845A`), có chế độ tối.
- Bỏ font serif Lora, dùng một font Be Vietnam Pro cho cả tiêu đề, trông gọn và giống phần mềm doanh nghiệp hơn.
- Thanh trên màu trắng, nút chuyển chế độ dạng segmented control; banner demo dạng thông báo.
- Thẻ dùng đổ bóng (elevation) thay viền; bo góc thống nhất 6–8px.
- Tab quản lý, nhãn trạng thái (lozenge), tiêu đề bảng in hoa nhỏ, hover cho dòng bảng.
- Ô nhập có viền focus xanh dương rõ ràng; trên điện thoại nút chế độ kéo full chiều ngang.

## Triển khai
1. Mở dự án Apps Script → file HTML đang được `doGet` trả về.
2. Dán nội dung `Index.html` thay thế → **Deploy → Manage deployments → Edit → New version**.
3. Mở file trực tiếp trên trình duyệt (không qua Apps Script) sẽ chạy **chế độ demo**, không ghi vào Google Sheet.
