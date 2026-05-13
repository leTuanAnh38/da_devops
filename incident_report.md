# Báo cáo sự cố hệ thống (Incident Report) - QA/SRE

Tài liệu này ghi lại các sự cố kỹ thuật phát sinh trong quá trình triển khai và vận hành hệ thống Quản lý kho sách.

---

## Sự cố 1: Pipeline CI/CD thất bại do thiếu file khóa (Lockfile)

- **Hiện tượng:** Khi push code lên GitHub, job `frontend-ci` báo lỗi: *"Error: Some specified paths were not resolved, unable to cache dependencies."*
- **Xác định Layer lỗi:** **L3 (Backend/DevOps)** - Lỗi quy trình đóng gói và quản lý thư viện.
- **Nguyên nhân:** Thư mục `frontend` được khởi tạo bằng Vite nhưng chưa chạy `npm install` cục bộ, dẫn đến thiếu file `package-lock.json`. Pipeline GitHub Actions được cấu hình để tìm file này để cache, nên khi không thấy sẽ báo lỗi.
- **Cách fix:** Truy cập thư mục `frontend`, chạy `npm install` để tạo file `package-lock.json`, sau đó commit và push lên repository.
- **Cách phòng tránh:** Luôn đảm bảo chạy cài đặt thư viện đầy đủ và push các file lock (`package-lock.json` hoặc `yarn.lock`) lên Git để đồng nhất môi trường.

---

## Sự cố 2: Lỗi Build Frontend do không tương thích phiên bản Node.js

- **Hiện tượng:** Pipeline CI/CD báo lỗi: *"Vite requires Node.js version 20.19+ or 22.12+. You are using Node.js 18.20.8."*
- **Xác định Layer lỗi:** **L1 (Infrastructure)** - Lỗi cấu hình môi trường thực thi.
- **Nguyên nhân:** File cấu hình workflow `.github/workflows/main.yml` đang chỉ định sử dụng Node.js version 18, trong khi phiên bản Vite mới nhất yêu cầu tối thiểu Node.js 20.
- **Cách fix:** Cập nhật file `main.yml`, thay đổi `node-version: 18` thành `node-version: 20`.
- **Cách phòng tránh:** Kiểm tra kỹ yêu cầu hệ thống (System Requirements) của các framework trước khi thiết lập môi trường CI/CD hoặc Docker.

---

## Sự cố 3: Lỗi kết nối API khi deploy lên Docker/WSL (Thực tế)

- **Hiện tượng:** Giao diện hiện lên nhưng không thấy dữ liệu, báo lỗi "không kết nối tới được máy chủ" hoặc lỗi 404 khi gọi API.
- **Xác định Layer lỗi:** **L4 (Frontend / Config)** - Lỗi cấu hình biến môi trường.
- **Nguyên nhân:** File `docker-compose.yml` đang đặt `VITE_API_URL: http://localhost:5000`. Khi Frontend gọi API, nó sẽ gọi thiếu tiền tố `/api/` (ví dụ: `localhost:5000/books` thay vì `localhost:5000/api/books`), dẫn đến lỗi 404.
- **Cách fix:** 
  1. Cập nhật `VITE_API_URL: http://localhost:5000/api` trong `docker-compose.yml`.
  2. Chạy lại `docker compose up --build -d` để build lại Frontend với cấu hình mới.
- **Cách phòng tránh:** Luôn kiểm tra kỹ các biến môi trường (Environment Variables) và đảm bảo tính nhất quán giữa Backend (có `/api`) và Frontend.

---

## Sự cố 4: Lỗi hiển thị do Z-Index (Thực tế)

- **Hiện tượng:** Các thông báo báo lỗi hoặc thành công (SweetAlert2) bị modal "Lập phiếu kho" che khuất, người dùng không nhìn thấy thông báo.
- **Xác định Layer lỗi:** **L4 (Frontend)** - Lỗi giao diện (CSS).
- **Nguyên nhân:** Thuộc tính `z-index` của modal overlay được đặt quá cao (1000 - 2000), vượt quá độ ưu tiên của thư viện thông báo.
- **Cách fix:** Hạ `z-index` của các lớp modal xuống mức thấp hơn (ví dụ: 900) trong file CSS.
- **Cách phòng tránh:** Quy hoạch bảng mã `z-index` cho toàn bộ dự án để tránh xung đột lớp hiển thị.

---

## Sự cố 5: Lỗi logic nghiệp vụ - Cho phép nhập/xuất số lượng âm hoặc bằng 0 (Thực tế)

- **Hiện tượng:** Người dùng có thể nhập số lượng âm (ví dụ: -50) hoặc bằng 0 vào phiếu kho, dẫn đến sai lệch số tồn kho và dữ liệu báo cáo không hợp lệ.
- **Xác định Layer lỗi:** **L3 (Backend)** - Lỗi thiếu validation tại server.
- **Nguyên nhân:** API backend (`/api/warehouse/receipts`) chỉ nhận dữ liệu và thực hiện tính toán mà chưa kiểm tra điều kiện ràng buộc số lượng phải lớn hơn 0.
- **Cách fix:** Bổ sung đoạn mã kiểm tra tại `server.js` trước khi thực hiện giao dịch kho:
  ```javascript
  if (item.quantity <= 0) {
      return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
  }
  ```
- **Cách phòng tránh:** Luôn thực hiện "Sanitize" và "Validate" dữ liệu đầu vào tại cả hai phía (Frontend và Backend) để đảm bảo tính toàn vẹn dữ liệu.

---

## Checklist kiểm tra định kỳ cho QA/SRE:
1. [x] Kiểm tra tính sẵn sàng của endpoint `/api/health`.
2. [x] Kiểm tra log của Docker container (`docker compose logs -f`).
3. [x] Đảm bảo Pipeline luôn "xanh" trước khi merge code vào nhánh `main`.
