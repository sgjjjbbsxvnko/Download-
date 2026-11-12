# Sent Tweaks Downloads

Website tải file độc lập, chạy trên Cloudflare Workers. Danh sách file được lấy từ `files.json` công khai trên GitHub (cập nhật tự động sau khi bộ nhớ đệm hết hạn). Không chỉnh sửa website key cũ.

## 1. GitHub

Tạo repository mới tên `SentTweaks-Downloads` trong tài khoản `sgjjjbbsxvnko`. Đưa `files.json` và `worker.js` lên nhánh `main`.

Sửa `files.json` để thêm tệp. Ví dụ:

```json
[
  {
    "id": "sent-v1-android",
    "name": "Sent Tweaks V1",
    "description": "Bản Android 64-bit",
    "platform": "Android",
    "version": "1.0.0",
    "size": "25 MB",
    "updated": "12/11/2026",
    "featured": true,
    "url": "https://github.com/OWNER/REPO/releases/download/v1.0/SentTweaks.apk"
  }
]
```

Thay URL ví dụ bằng **liên kết tải thật** (GitHub Releases hoặc địa chỉ HTTPS tin cậy). Không khai báo đường dẫn không tồn tại. Mỗi `id` phải duy nhất và gồm chữ cái, chữ số, gạch ngang hoặc gạch dưới.

## 2. Cloudflare

Website đã được thiết kế dùng đường dẫn manifest mặc định:

`https://raw.githubusercontent.com/sgjjjbbsxvnko/SentTweaks-Downloads/main/files.json`

Nếu đổi tên repo, có thể thay `DEFAULT_MANIFEST_URL` trong `worker.js`, hoặc đặt biến Cloudflare Worker `FILES_JSON_URL` bằng đường dẫn raw HTTPS mới.

Triển khai bằng Cloudflare Dashboard > Workers & Pages > Create Worker > Edit code, thay nội dung bằng `worker.js` và Deploy. Có thể kết nối GitHub để thiết lập CI/CD sau khi repository mới tồn tại và Cloudflare có quyền truy cập.

## 3. Lưu file thực tế

Upload APK/IPA/ZIP vào GitHub Releases, hoặc sử dụng dịch vụ lưu trữ file được phép. `files.json` chỉ là danh mục, không phải nơi chứa file nhị phân. Không đưa khóa truy cập API vào file công khai.

## Giới hạn hiện tại

- Không có trang quản trị upload hoặc tài khoản người dùng.
- Không có thống kê lượt tải vì chưa cấu hình cơ sở dữ liệu.
- Chưa tự động cập nhật mã nguồn Worker từ GitHub; chỉ danh sách file tự cập nhật khi `files.json` thay đổi.
- Nếu cần Cloudflare R2 cho file lớn, cần kích hoạt dịch vụ R2 trong Dashboard trước.
