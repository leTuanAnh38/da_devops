# Project Walkthrough - Hệ thống quản lý kho sách

Tài liệu này hướng dẫn cách vận hành, cấu trúc dự án và các tính năng đã triển khai để nhóm có thể tự tin thuyết trình demo.

## 🏗 Cấu trúc hệ thống (Architecture)
Hệ thống được thiết kế theo mô hình Microservices đơn giản:
- **Frontend:** React + Vite (Cổng 3000)
- **Backend:** Node.js Express API (Cổng 5000)
- **Database:** PostgreSQL (Cổng 5432)
- **Containerization:** Docker & Docker Compose

## 🚀 Hướng dẫn vận hành nhanh (Quick Start)

### 1. Chạy toàn bộ hệ thống bằng Docker
Tại thư mục gốc dự án, chạy lệnh:
```powershell
docker compose up --build -d
```
Hệ thống sẽ tự động tải Image, khởi tạo Database và chạy cả BE & FE.

### 2. Kiểm tra trạng thái API
Truy cập: `http://localhost:5000/api/health`
Nếu thấy `{"status": "OK"}`, hệ thống đã sẵn sàng.

## 📦 Chức năng cốt lõi đã triển khai

### 1. Quản lý kho (Inventory)
- **Thêm sách mới:** Khai báo tên, tác giả, vị trí kệ. Số lượng mặc định = 0.
- **Cảnh báo tồn kho:** Hệ thống tự động bôi đỏ số lượng nếu sách có dưới 5 cuốn.

### 2. Nhập / Xuất kho (Transactions)
- **Nhập kho (Import):** Tăng số lượng tồn thực tế.
- **Xuất kho (Export):** Giảm số lượng tồn.
- **Ràng buộc nghiệp vụ:** Không cho phép xuất quá số lượng hiện có trong kho.

### 3. Thẻ kho (Stock Card)
- Mọi biến động đều được lưu vết lịch sử (Previous Stock -> Change -> Current Stock).

## 🛠 Quy trình CI/CD (GitHub Actions)
Pipeline được thiết lập tự động chạy mỗi khi có code mới đẩy lên nhánh `main` hoặc `dev`:
1. **Install:** Cài đặt thư viện.
2. **Lint:** Kiểm tra chuẩn code.
3. **Build:** Đóng gói ứng dụng.

## 📡 Danh sách API Endpoint
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Kiểm tra sức khỏe hệ thống |
| GET | `/api/books` | Lấy danh sách toàn bộ sách |
| POST | `/api/books` | Thêm sách mới |
| POST | `/api/transactions` | Thực hiện Nhập/Xuất kho |
| GET | `/api/books/:id/history` | Xem lịch sử thẻ kho của 1 cuốn sách |
