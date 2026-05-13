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
Nếu thấy `{"status": "UP", ...}`, hệ thống đã sẵn sàng.

## 📦 Chức năng cốt lõi đã triển khai

### 1. Quản lý Kho & Phân trang (Inventory & Pagination)
- **Danh sách sách:** Quản lý thông tin sách, giá bán, và vị trí.
- **Phân trang chuyên nghiệp:** Toàn bộ thẻ kho (nhập/xuất) đã được phân trang phía Server để đảm bảo hiệu năng khi dữ liệu lớn.
- **Cảnh báo tồn kho:** Tự động đánh dấu đỏ các đầu sách sắp hết hàng (dưới 5 cuốn).

### 2. Nghiệp vụ Nhập / Xuất kho
- **Tạo phiếu kho:** Hỗ trợ lập phiếu nhập/xuất với giao diện chọn sách thông minh (hiện sẵn số lượng tồn thực tế để đối chiếu).
- **Ràng buộc logic:** Chặn nhập/xuất số lượng <= 0 và chặn xuất quá số lượng tồn kho.

### 3. Xuất báo cáo Excel (Excel Export)
- Tích hợp tính năng xuất dữ liệu ra file Excel cho mọi bảng dữ liệu (Sách, Thẻ kho, Đơn hàng).

### 4. Thẻ kho & Báo cáo (Stock Card & Dashboard)
- **Thẻ kho:** Truy xuất chi tiết lịch sử biến động của từng cuốn sách.
- **Dashboard:** Biểu đồ trực quan về doanh thu, tổng tồn kho và các hoạt động gần đây.

### 5. Bảo mật & Phân quyền
- Hệ thống đăng nhập (Auth) sử dụng JWT.
- Phân quyền rõ ràng giữa Admin và Nhân viên.

## 📡 Danh sách API Endpoint chính
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Health check hệ thống |
| GET | `/api/inventory/history` | Lấy lịch sử kho (có phân trang) |
| POST | `/api/warehouse/receipts` | Lập phiếu nhập/xuất kho |
| GET | `/api/stats` | Lấy số liệu thống kê Dashboard |
| POST | `/api/auth/login` | Đăng nhập hệ thống |
