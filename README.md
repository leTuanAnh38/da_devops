# Hệ thống Quản lý Kho sách (Book Warehouse Management)

Dự án quản lý kho sách toàn diện bao gồm quản lý tồn kho, nhập/xuất kho, quản lý đơn hàng và báo cáo thống kê.

## 🚀 Công nghệ sử dụng

- **Frontend:** React.js, Vite, Axios, Recharts (Biểu đồ), SweetAlert2 (Thông báo).
- **Backend:** Node.js, Express, Sequelize (ORM), PostgreSQL.
- **Xác thực:** JSON Web Token (JWT).
- **Tiện ích:** Export Excel (xlsx).

---

## 🛠 Hướng dẫn cài đặt và chạy dự án

### 1. Yêu cầu hệ thống
- Node.js (Phiên bản 18+)
- PostgreSQL (Đã cài đặt và đang chạy)

### 2. Cài đặt Backend
Di chuyển vào thư mục backend và cài đặt các thư viện cần thiết:
```bash
cd backend
npm install
```

**Health Check Endpoint:** `GET /api/health` (Dùng để kiểm tra trạng thái hệ thống khi deploy).

Tạo file `.env` trong thư mục `backend` với nội dung sau:
```env
PORT=5000
DATABASE_URL=postgres://your_user:your_password@localhost:5432/warehouse
JWT_SECRET=your_secret_key_here
```

Khởi tạo dữ liệu mẫu (Seeding):
```bash
node seed.js        # Tạo dữ liệu sách và danh mục mẫu
node seed-user.js   # Tạo tài khoản admin mặc định (admin / admin123)
```

Chạy Backend:
```bash
npm start
```

### 3. Cài đặt Frontend
Mở một terminal mới, di chuyển vào thư mục frontend:
```bash
cd frontend
npm install
npm run dev
```

Truy cập ứng dụng tại: `http://localhost:5173`

---

## 🔑 Tài khoản đăng nhập mặc định

- **Username:** `admin`
- **Password:** `admin123`

---

## 📝 Các tính năng chính

- **Dashboard:** Thống kê doanh thu, tồn kho và cảnh báo hàng sắp hết.
- **Quản lý Kho:** Lập phiếu nhập/xuất kho chuyên nghiệp, quản lý thẻ kho theo từng trang.
- **Quản lý Đơn hàng:** Theo dõi tình trạng đơn hàng, tổng tiền và doanh thu.
- **Báo cáo:** Xuất dữ liệu Tồn kho, Nhập/Xuất và Đơn hàng ra file Excel.
- **Hệ thống Thông báo:** Cảnh báo tồn kho thấp và xác nhận các giao dịch thành công.

---

## 🤝 Thành viên phát triển

- Dự án được phát triển bởi đội ngũ Devops DA.
- Mọi đóng góp vui lòng đẩy lên các nhánh `feature/*` và tạo Pull Request vào nhánh `dev`.