# Lành — app iOS, Android và máy tính

App **Expo (React Native, SDK 58)** mở web Lành (Google Apps Script) bên trong app. Web cập nhật thì app tự có bản mới, **không phải build lại app**.

| Nền tảng | Cách chạy | Ghi chú |
|---|---|---|
| **Android** | File APK cài thẳng, hoặc Google Play | Build bằng EAS (miễn phí) |
| **iPhone / iPad** | TestFlight hoặc App Store | Cần tài khoản Apple Developer (99 USD/năm) |
| **Máy tính** (Windows, macOS, Chromebook) | Web app cài được (PWA) từ Chrome / Edge | Đưa thư mục `dist/` lên hosting tĩnh |

## Trong app có gì
- Mở web Lành toàn màn hình, có màn chờ với logo Lành.
- **Mất mạng** thì hiện màn “Mất kết nối mạng”, có mạng lại thì tự tải lại.
- **Nút Back Android** lùi trang trong web trước khi thoát app; **iOS** vuốt từ mép để lùi, kéo xuống để tải lại.
- Link ngoài (Google Sheet, Zalo…) mở bằng trình duyệt hoặc app tương ứng.
- Web lỗi hoặc máy chủ Google bận thì hiện nút **Tải lại**.
- Chấm công Wi-Fi chạy trong app như trên web.

Đổi link web: sửa `WEB_URL` trong `src/config.ts`.

## Chạy thử ngay trên điện thoại
```bash
cd app
npm install
npx expo start
```
Cài app **Expo Go** (App Store / CH Play), quét mã QR hiện trong terminal. Máy tính và điện thoại phải chung một mạng.

## Build app thật (EAS, chạy trên cloud của Expo)
Cần tài khoản miễn phí tại expo.dev. Không cần Xcode hay Android Studio.

```bash
npx eas-cli@latest login
```

```bash
npx eas-cli@latest init
```

**Android (APK cài thẳng, gửi qua Zalo được):**
```bash
npx eas-cli@latest build -p android --profile preview
```

**Android cho Google Play** (file .aab; tài khoản Google Play Console 25 USD, trả một lần):
```bash
npx eas-cli@latest build -p android --profile production
```

**iOS** (cần Apple Developer; EAS tự tạo chứng chỉ):
```bash
npx eas-cli@latest build -p ios --profile production
```

Đưa lên TestFlight / App Store:
```bash
npx eas-cli@latest submit -p ios
```

## Bản máy tính (PWA)
```bash
npx expo export --platform web
```
Đưa thư mục `dist/` lên Netlify, Vercel, GitHub Pages hoặc Firebase Hosting (cần HTTPS). Mở link bằng **Chrome / Edge** → biểu tượng **Cài đặt app** trên thanh địa chỉ → Lành có icon riêng, mở thành cửa sổ riêng như phần mềm. Mac dùng chip Apple (M1 trở lên) cũng cài được bản iPad từ App Store.

## Thông tin app
- Tên: **Lành** · mã app iOS và Android: `vn.lanh.lichlam` (đổi trong `app.json` **trước** lần đầu đưa lên store).
- Biểu tượng và màn chờ: `assets/`; bản máy tính: `public/` (manifest, logo).
- `ios/` và `android/` do Expo tự tạo khi build; không sửa tay, không đưa lên git.

## Kiểm tra trước khi build
```bash
npx tsc --noEmit
```

```bash
npx expo lint
```

```bash
npx expo-doctor
```
