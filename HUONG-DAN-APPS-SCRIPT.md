# Đưa code lên Google Apps Script

Cần 2 file trong repo này:

| File trong repo | Dán vào Apps Script | Ghi chú |
|---|---|---|
| `Index.html` | File HTML giao diện đang có (thường tên **Index**) | Thay **toàn bộ** nội dung cũ |
| `ChamCong.gs` | Tạo file mới tên **ChamCong** | Phần máy chủ của chấm công Wi-Fi |

**Không sửa** `Code.gs` hay file `.gs` nào đang có.

## Các bước
1. Mở Google Sheet của Lành → **Tiện ích mở rộng → Apps Script** (hoặc vào script.google.com và mở dự án).
2. **Sao lưu trước:** mở file HTML hiện tại, Ctrl+A → Ctrl+C, dán vào Google Docs hoặc Notepad để giữ lại. Bản gốc cũng có trong repo tại `original/Index.html`.
3. **Thay giao diện:** vẫn ở file HTML đó, Ctrl+A → Delete → dán toàn bộ nội dung `Index.html` mới.
4. **Thêm chấm công:** bấm **+** cạnh chữ **Tệp** → **Tập lệnh** → đặt tên `ChamCong` → xoá đoạn `function myFunction() {}` → dán toàn bộ `ChamCong.gs`.
5. Bấm **Ctrl+S** (biểu tượng đĩa mềm) để lưu. Nếu báo lỗi cú pháp, chụp màn hình gửi lại.
6. **Triển khai → Quản lý các bản triển khai** → chọn bản đang dùng → biểu tượng **bút chì (Chỉnh sửa)** → **Phiên bản: Phiên bản mới** → **Triển khai**.
   Không chọn “Bản triển khai mới”, vì sẽ ra link khác.
7. Nếu Google hỏi quyền → chọn tài khoản → **Nâng cao → Đi tới … (không an toàn)** → **Cho phép**. Đây là script của chính bạn.

## Kiểm tra sau khi triển khai
1. Mở link web (nên mở tab ẩn danh hoặc tải lại mạnh: Ctrl+Shift+R). Giao diện mới có thêm nút **Chấm công**, nút **?** và nút sáng/tối.
2. **Cài Wi-Fi chấm công (một lần):** đứng ở quán, nối Wi-Fi **H&H Dao tao** → **Quản lý** → đăng nhập → tab **Chấm công** → **Dùng mạng đang kết nối**.
3. Thử bằng điện thoại một nhân viên: nối Wi-Fi quán → **Chấm công** → khung Wi-Fi hiện xanh → **Vào ca**.
4. Mở Google Sheet: có sheet mới **ChamCong** ghi lần chấm vừa rồi.

## Gặp lỗi
| Hiện tượng | Cách xử lý |
|---|---|
| Vẫn thấy giao diện cũ | Chưa tạo **Phiên bản mới** ở bước 6, hoặc trình duyệt còn lưu bản cũ → Ctrl+Shift+R |
| “Không kiểm tra được mạng” khi chấm công | Báo lại để sửa cách lấy IP |
| “Chưa kết nối Wi-Fi H&H Dao tao” dù đang ở quán | Tắt 4G/VPN; nếu modem vừa khởi động lại, quản lý bấm lại **Thêm mạng đang dùng** |
| “Không có chức năng …” / lỗi `api is not defined` | File `ChamCong.gs` chưa được lưu, hoặc dự án không có hàm `api` → gửi ảnh màn hình |
| Muốn quay về bản cũ | Dán lại nội dung đã sao lưu ở bước 2 rồi làm lại bước 6. File `ChamCong` để nguyên cũng không ảnh hưởng |
