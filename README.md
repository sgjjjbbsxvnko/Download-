# Sent Tweaks Downloads – bản cập nhật V3

- `worker.js`: Cloudflare Worker, có sẵn ảnh WebP của ảnh được gửi, hai nút **Tải APK** và **Get Key**, và mục Sent Tweaks V3.
- `files.json`: danh sách file để sửa và cập nhật trên GitHub. Trong thời gian GitHub chưa cập nhật, V3 vẫn hiển thị do được ghim trong Worker.
- `sent-tweaks-v3.webp`: ảnh xem trước (đã tối ưu); Worker có ảnh nhúng nên không cần phải host ảnh riêng.

## Cập nhật GitHub
Upload `worker.js` và `files.json` trong ZIP lên nhánh `main` của repo `https://github.com/sgjjjbbsxvnko/Download-` (thay thế file cũ). Không cần sửa website key hiện tại.

## Liên kết
- APK: https://www.mediafire.com/file/mis3l86zvldcoi6/Sent_Tweaks_V3.apk/file
- Key: https://snowy-cherry-0514.sentgetkey.workers.dev/

## Cloudflare
Worker: `sent-tweaks-downloads`; URL: https://sent-tweaks-downloads.quyenfa4-sentios.workers.dev/

Cập nhật `files.json` trên GitHub sẽ tự đồng bộ danh sách (có cache ~90 giây). Việc sửa `worker.js` trên GitHub chưa tự động deploy mã nguồn nếu chưa kết nối GitHub Builds.
