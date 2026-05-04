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

## Sự cố 3: Lỗi logic nghiệp vụ - Cho phép xuất kho âm (Giả định)

- **Hiện tượng:** Khi thực hiện lệnh Xuất kho với số lượng lớn hơn số lượng tồn, hệ thống vẫn thực hiện và làm số tồn kho bị âm.
- **Xác định Layer lỗi:** **L3 (Backend)** - Lỗi logic xử lý tại server.
- **Nguyên nhân:** Thiếu bước kiểm tra điều kiện `if (current_stock < export_quantity)` trước khi thực hiện câu lệnh UPDATE database.
- **Cách fix:** Bổ sung đoạn code kiểm tra tính hợp lệ tại `server.js` trong route `/api/transactions`:
  ```javascript
  if (type === 'EXPORT' && book.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
  }
  ```
- **Cách phòng tránh:** Thực hiện Unit Test cho các logic nghiệp vụ quan trọng liên quan đến biến động số dư/tồn kho.

---

## Checklist kiểm tra định kỳ cho QA/SRE:
1. [ ] Kiểm tra tính sẵn sàng của endpoint `/api/health`.
2. [ ] Kiểm tra log của Docker container (`docker compose logs -f`).
3. [ ] Đảm bảo Pipeline luôn "xanh" trước khi merge code vào nhánh `main`.
