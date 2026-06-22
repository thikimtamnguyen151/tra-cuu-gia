@AGENTS.md

# Dự án: Tra cứu giá sản phẩm nội bộ

Web tra cứu giá sản phẩm cho 9 nhân viên nội bộ.

## Stack

- **Frontend/Backend**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Deploy**: Vercel — deploy qua `git push` lên GitHub nhánh `main`

## Database

### Bảng `products`

| Cột | Ghi chú |
|-----|---------|
| `name` | Tên sản phẩm |
| `unit` | Đơn vị |
| `cost_price` | Giá vốn — ẩn với non-admin |
| `sell_price` | Giá bán |
| `supplier` | Nhà cung cấp — ẩn với non-admin |
| `updated_at` | Có trigger tự cập nhật khi sửa dòng |

### Bảng `nhan_vien`

| Cột | Ghi chú |
|-----|---------|
| `username` | Tên đăng nhập |
| `password` | Mật khẩu |
| `full_name` | Họ tên |
| `role` | `admin` hoặc `warehouse` |

## Phân quyền

- **admin**: xem đủ giá vốn + NCC, vào được `/quan-ly`
- **warehouse**: chỉ thấy giá bán, không vào được `/quan-ly`

## Trang chính

### `/tra-cuu`
- Tìm kiếm không dấu (dùng `removeAccents` để so sánh)
- Ẩn cột `cost_price` và `supplier` nếu role không phải `admin`

### `/quan-ly` (chỉ admin)
- Thêm / sửa / xóa sản phẩm
- Nút lọc "vừa sửa": lọc theo `updated_at` (các sản phẩm mới sửa gần đây)

## Lưu ý quan trọng

- **Supabase row limit**: mặc định Supabase giới hạn 1000 dòng trả về. Đã tăng **Max Rows** trong Project Settings → API. Nếu thêm query mới cần nhiều dòng, kiểm tra setting này.
- **Deploy**: chỉ cần `git push origin main` — Vercel tự build và deploy.
