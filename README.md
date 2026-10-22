# FLUIVIX

**Ứng dụng thương mại điện tử thời trang đa ngôn ngữ, tập trung vào trải nghiệm mua sắm trên web và thiết bị di động.**

FLUIVIX là ứng dụng Single Page Application (SPA) dành cho khách hàng, bao phủ hành trình từ khám phá bộ sưu tập, lựa chọn sản phẩm đến đặt hàng, theo dõi đơn và quản lý tài khoản. Giao diện theo phong cách editorial, sử dụng hình ảnh cục bộ, bố cục responsive và các tương tác phù hợp với từng kích thước màn hình.

> **Phạm vi hiện tại:** phiên bản trình diễn frontend với dữ liệu mẫu và trạng thái lưu trong trình duyệt. Đơn hàng, tài khoản, thanh toán và vận chuyển đều được mô phỏng; ứng dụng không tiếp nhận giao dịch thương mại thực tế.

## Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt và khởi chạy](#cài-đặt-và-khởi-chạy)
- [Các lệnh phát triển](#các-lệnh-phát-triển)
- [Kiểm thử](#kiểm-thử)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Các nhóm trang](#các-nhóm-trang)
- [Nguyên tắc nghiệp vụ và dữ liệu](#nguyên-tắc-nghiệp-vụ-và-dữ-liệu)
- [Đa ngôn ngữ và khả năng truy cập](#đa-ngôn-ngữ-và-khả-năng-truy-cập)
- [Build và triển khai](#build-và-triển-khai)
- [Quy ước phát triển](#quy-ước-phát-triển)
- [Tài nguyên và giấy phép](#tài-nguyên-và-giấy-phép)

## Tính năng

| Phân hệ             | Chức năng                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Khám phá            | Trang chủ, danh mục, bộ sưu tập, hàng mới, bán chạy, ưu đãi và lookbook                                                           |
| Tìm kiếm và lọc     | Tìm kiếm sản phẩm, bộ lọc, sắp xếp và phân trang; trạng thái tìm kiếm gắn với URL                                                 |
| Chi tiết sản phẩm   | Hình ảnh theo màu, thư viện ảnh phóng to, lựa chọn màu/kích cỡ, kiểm tra tồn kho theo biến thể, hướng dẫn kích cỡ và đánh giá mẫu |
| Mua sắm             | Xem nhanh, danh sách yêu thích, giỏ hàng, cập nhật số lượng và luồng Mua ngay độc lập                                             |
| Đặt hàng            | Thanh toán với tư cách khách hoặc tài khoản demo, địa chỉ nhận hàng, phương thức vận chuyển và mã ưu đãi                          |
| Thanh toán mô phỏng | COD và thanh toán trực tuyến demo với các trạng thái thành công, thất bại, hủy và thử lại                                         |
| Đơn hàng            | Xác nhận đơn, lịch sử, chi tiết đơn, tra cứu, dòng thời gian trạng thái và yêu cầu đổi trả theo điều kiện                         |
| Tài khoản           | Đăng ký/đăng nhập mô phỏng, hồ sơ, sổ địa chỉ và voucher                                                                          |
| Thông tin và hỗ trợ | Giới thiệu, liên hệ, câu hỏi thường gặp, chính sách giao hàng, đổi trả, quyền riêng tư và điều khoản                              |

Ứng dụng có **34 mẫu đường dẫn** và **5 ngôn ngữ**. Toàn bộ giá hiển thị bằng VND.

## Công nghệ sử dụng

| Nhóm                   | Công nghệ                                             | Vai trò                                                                 |
| ---------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Giao diện              | React 19, TypeScript 6                                | Xây dựng component và kiểm tra kiểu với chế độ strict                   |
| Build                  | Vite 8                                                | Máy chủ phát triển và đóng gói tài nguyên tĩnh                          |
| Định tuyến             | React Router 8                                        | Điều hướng SPA, route động và phân tách tải trang                       |
| Quản lý trạng thái     | Zustand 5, persist middleware                         | Giỏ hàng, tài khoản, yêu thích và đơn hàng cục bộ                       |
| Biểu mẫu               | React Hook Form 7, Zod 4                              | Quản lý form, kiểm tra dữ liệu và schema persistence                    |
| Đa ngôn ngữ            | i18next 26, react-i18next 17                          | Bản dịch giao diện và chuyển ngôn ngữ                                   |
| Giao diện và tương tác | Tailwind CSS 4, CSS tùy biến, Radix Dialog            | Thiết kế responsive, component dùng chung và hộp thoại                  |
| Hiệu ứng và phản hồi   | Anime.js 4, Sonner 2, Lucide React                    | Chuyển động, thông báo và biểu tượng                                    |
| Tiện ích CSS           | clsx, tailwind-merge, class-variance-authority        | Ghép class và quản lý biến thể component                                |
| Kiểm thử               | Vitest 5, React Testing Library, Playwright, axe-core | Unit/component, hành trình người dùng và kiểm tra accessibility tự động |
| Chất lượng mã          | ESLint 10, Prettier 3                                 | Phân tích mã và định dạng                                               |

Các phiên bản phụ thuộc được khai báo trong [package.json](package.json); phiên bản cài đặt chính xác được khóa trong [package-lock.json](package-lock.json).

## Cài đặt và khởi chạy

### Yêu cầu môi trường

- **Node.js 24.x** và npm. Môi trường đã dùng để kiểm tra dự án: Node.js `24.15.0`, npm `11.12.1`.
- Trình duyệt hiện đại có JavaScript và hỗ trợ Web Storage.
- Kết nối mạng khi cài đặt các gói phụ thuộc và trình duyệt Playwright lần đầu.

### Chạy ở môi trường phát triển

Tại thư mục gốc của dự án:

```bash
npm ci
npm run dev
```

Mở **http://127.0.0.1:5173**. Nếu cổng đang được sử dụng, xem địa chỉ thực tế trong terminal.

Ứng dụng hiện không yêu cầu file `.env`, API key, cơ sở dữ liệu hoặc dịch vụ backend. Trên Windows PowerShell, có thể dùng `npm.cmd` và `npx.cmd` nếu execution policy chặn các shim `.ps1`.

### Trải nghiệm tài khoản demo

Tại `/login`, chọn tài khoản mẫu hoặc nhập email `demo@fluivix.local`, sau đó nhập một mật khẩu giả có ít nhất 8 ký tự. Biểu mẫu chỉ kiểm tra điều kiện nhập liệu; mật khẩu không được lưu hoặc dùng để xác thực danh tính. Tài khoản mẫu có sẵn các đơn hàng để khám phá lịch sử và trạng thái.

Có thể đặt hàng trực tiếp với tư cách khách. Chỉ sử dụng thông tin giả khi thử nghiệm địa chỉ, tài khoản và các biểu mẫu.

## Các lệnh phát triển

| Lệnh                 | Mô tả                                                       |
| -------------------- | ----------------------------------------------------------- |
| `npm run dev`        | Khởi chạy Vite dev server tại `127.0.0.1`                   |
| `npm run build`      | Kiểm tra TypeScript và tạo bản build trong `dist/`          |
| `npm run preview`    | Phục vụ bản build cục bộ, mặc định tại `127.0.0.1:4173`     |
| `npm run typecheck`  | Kiểm tra kiểu TypeScript, không xuất file                   |
| `npm run lint`       | Chạy ESLint cho `src/` và `e2e/`                            |
| `npm test`           | Chạy unit test và component test một lần                    |
| `npm run test:watch` | Chạy Vitest ở chế độ theo dõi thay đổi                      |
| `npm run test:e2e`   | Chạy Playwright với dev server                              |
| `npm run check`      | Chạy lần lượt typecheck, lint, unit/component test và build |

`npm run check` không bao gồm E2E. Định dạng mã có thể được kiểm tra riêng bằng `npx prettier --check <đường-dẫn-file>`.

## Kiểm thử

### Unit và component

```bash
npm test
npm run check
```

Các bài kiểm thử trong `src/test/` bao phủ tính giá, giỏ hàng, đơn hàng, persistence, dữ liệu mẫu, nội dung và biểu mẫu.

### End-to-end

Cài Chromium trước lần chạy đầu tiên:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright tự khởi động máy chủ phát triển khi chưa có máy chủ phù hợp. Bộ kiểm thử trong `e2e/` bao gồm các luồng mua sắm, checkout, tài khoản, đa ngôn ngữ, responsive, bàn phím, hộp thoại, reduced motion và accessibility tự động.

Để kiểm tra bản build, tạo build trước rồi bật chế độ preview:

```powershell
# Windows PowerShell
npm run build
$env:FLUIVIX_PREVIEW = '1'
npm run test:e2e
Remove-Item Env:FLUIVIX_PREVIEW
```

```bash
# macOS / Linux
npm run build
FLUIVIX_PREVIEW=1 npm run test:e2e
```

Chế độ này dùng `http://127.0.0.1:4173`. Khi kiểm tra một bản build cụ thể, hãy dừng máy chủ cũ đang chiếm cổng để tránh tái sử dụng nhầm phiên bản. Trace được giữ lại khi bài kiểm thử thất bại; kết quả nằm trong `test-results/`.

Kết quả kiểm thử phụ thuộc vào phiên bản mã nguồn và môi trường chạy. Nhật ký xác minh theo từng đợt thay đổi được ghi tại [progress/BUILD-STATUS.md](progress/BUILD-STATUS.md).

## Cấu trúc dự án

```text
public/
  assets/                 # Ảnh sản phẩm, chiến dịch và ảnh dự phòng
  fonts/                  # Font cục bộ và giấy phép
  _redirects              # Quy tắc fallback SPA cho host tương thích
src/
  app/                    # Router, danh sách route và metadata
  components/
    layout/               # Shell, header, footer và hiệu ứng trang
    ui/                   # Thành phần giao diện dùng chung
  data/                   # Catalog, dữ liệu mẫu và ánh xạ hình ảnh
  features/               # Các phân hệ nghiệp vụ
    account/              # Hồ sơ và địa chỉ
    auth/                 # Tài khoản và phiên demo
    cart/                 # Giỏ hàng và quy tắc cập nhật
    catalog/              # Home, danh mục, tìm kiếm và bộ lọc
    checkout/             # Đặt hàng, tính giá và thanh toán demo
    i18n/                 # Cấu hình ngôn ngữ và từ điển
    orders/               # Snapshot đơn hàng và chuyển trạng thái
    product/              # Chi tiết sản phẩm và trình xem ảnh
    wishlist/             # Danh sách yêu thích
    ...                   # Đánh giá, giới thiệu và nội dung hỗ trợ
  lib/                    # Storage, persistence, URL và hook tiện ích
  pages/                  # Điều phối các trang nội dung
  styles/                 # Design tokens, CSS chung và bố cục mobile
  test/                   # Unit/component test và thiết lập kiểm thử
  types/                  # Mô hình dữ liệu dùng chung
  main.tsx                # Điểm khởi chạy ứng dụng
e2e/                     # Kịch bản Playwright
scripts/                 # Công cụ chuẩn bị tài nguyên
```

## Các nhóm trang

Danh sách đầy đủ được quản lý trong [src/app/route-inventory.ts](src/app/route-inventory.ts); cấu hình định tuyến nằm tại [src/app/App.tsx](src/app/App.tsx).

| Nhóm                  | Đường dẫn                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Trang chủ             | `/`                                                                                                                    |
| Khám phá và tìm kiếm  | `/shop`, `/category/:slug`, `/collections`, `/collections/:slug`, `/new-arrivals`, `/best-sellers`, `/sale`, `/search` |
| Sản phẩm và giỏ hàng  | `/product/:slug`, `/wishlist`, `/cart`                                                                                 |
| Đặt hàng              | `/checkout`, `/checkout/payment`, `/checkout/success`                                                                  |
| Tra cứu               | `/track-order`                                                                                                         |
| Truy cập tài khoản    | `/login`, `/register`, `/forgot-password`                                                                              |
| Khu vực tài khoản     | `/account`, `/account/profile`, `/account/addresses`, `/account/vouchers`, `/account/orders`, `/account/orders/:id`    |
| Thương hiệu và hỗ trợ | `/about`, `/lookbook`, `/contact`, `/size-guide`, `/faq`                                                               |
| Chính sách            | `/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`                                                      |

Khu vực `/account` yêu cầu phiên đăng nhập mô phỏng. Các đường dẫn không hợp lệ hiển thị trang 404.

## Nguyên tắc nghiệp vụ và dữ liệu

- **Giá và tồn kho:** tính tiền bằng số nguyên VND; kiểm tra giá, màu, kích cỡ và số lượng theo biến thể. Quy tắc tính tổng dùng chung tại `src/features/checkout/pricing.ts`.
- **Mua ngay:** sử dụng checkout intent riêng, không thay thế giỏ hàng hiện có.
- **Đơn hàng:** lưu snapshot sản phẩm, giá và thông tin đặt hàng tại thời điểm tạo đơn; lịch sử không phụ thuộc vào các thay đổi catalog sau đó.
- **Lưu trữ:** Zustand persist lưu dữ liệu có phiên bản dưới các khóa `fluivix:v1:*`. Dữ liệu được kiểm tra bằng Zod khi khôi phục; lỗi parse, quota hoặc quyền lưu trữ có cơ chế xử lý và bộ nhớ tạm dự phòng.
- **Giới hạn lưu trữ:** dữ liệu gắn với trình duyệt và origin hiện tại, không đồng bộ giữa thiết bị. Khi storage không khả dụng, trạng thái tạm có thể mất sau khi tải lại trang. Xóa dữ liệu trình duyệt sẽ làm mất lịch sử cục bộ.
- **Đặt lại dữ liệu:** thao tác đặt lại trong footer có bước xác nhận và chỉ xóa các khóa mang tiền tố `fluivix:`.
- **Tài nguyên:** catalog, bản dịch, ảnh và font được đóng gói cùng ứng dụng; không cần dịch vụ dữ liệu bên ngoài khi chạy. Dự án chưa cấu hình service worker để bảo đảm tải lại hoàn toàn offline.

### Giới hạn chức năng

Dự án không có Admin Dashboard, API server, cơ sở dữ liệu, xác thực đám mây, cổng thanh toán, thu thập thông tin thẻ, gửi email/SMS/OTP, tích hợp hãng vận chuyển hoặc analytics tracker. Biểu mẫu liên hệ, đăng ký nhận tin và quên mật khẩu không gửi thông điệp ra ngoài.

Phiên đăng nhập và dữ liệu trong trình duyệt không cung cấp cơ chế bảo mật tương đương hệ thống tài khoản thực. Giá, ưu đãi, tồn kho, thời gian giao hàng và chính sách là dữ liệu minh họa. Việc vận hành thương mại cần thiết kế và triển khai riêng các dịch vụ, biện pháp bảo mật và quy trình nghiệp vụ liên quan.

## Đa ngôn ngữ và khả năng truy cập

| Ngôn ngữ              | Mã locale |
| --------------------- | --------- |
| Tiếng Việt — mặc định | `vi`      |
| English               | `en`      |
| 한국어                | `ko`      |
| 简体中文              | `zh-CN`   |
| 日本語                | `ja`      |

Bộ chọn ngôn ngữ cập nhật giao diện tại chỗ, lưu lựa chọn và cập nhật thuộc tính `lang` của tài liệu. Nội dung giao diện lấy từ từ điển hoặc dữ liệu bản địa hóa; ngày và tiền tệ định dạng theo locale, với đơn vị tiền tệ luôn là VND.

Giao diện hỗ trợ điều hướng bàn phím, focus rõ ràng, nhãn cho điều khiển, quản lý focus trong hộp thoại và tùy chọn giảm chuyển động. Kiểm tra axe-core được kết hợp với kiểm thử responsive và tương tác; kết quả tự động không thay thế đánh giá accessibility thủ công.

## Build và triển khai

```bash
npm run build
npm run preview
```

Thư mục `dist/` chứa các file tĩnh để đưa lên dịch vụ static hosting. `vite preview` phục vụ kiểm tra cục bộ, không phải máy chủ production.

Yêu cầu cấu hình hosting:

1. Phục vụ nội dung của `dist/` tại gốc tên miền theo cấu hình hiện tại.
2. Chuyển các đường dẫn điều hướng SPA về `index.html` để truy cập trực tiếp và tải lại các trang như `/product/:slug` hoạt động.
3. Phục vụ đúng các file tĩnh trong `assets/` và `fonts/`.
4. Sử dụng HTTPS khi công khai ứng dụng.

File `public/_redirects` cung cấp fallback cho nền tảng tương thích; các host khác cần cấu hình tương đương. Nếu triển khai dưới đường dẫn con, cần điều chỉnh đồng thời Vite `base`, router và các đường dẫn tài nguyên tuyệt đối trước khi build.

## Quy ước phát triển

- Tổ chức mã theo tính năng; đặt kiểu dữ liệu dùng chung trong `src/types/` và tách quy tắc nghiệp vụ khỏi component.
- Dùng lại selector, hàm tính giá và chuyển trạng thái; tránh sao chép logic giữa giỏ hàng, checkout và đơn hàng.
- Bổ sung nội dung tương ứng cho cả 5 locale khi thay đổi giao diện hoặc thông báo lỗi.
- Giữ ảnh và font cục bộ, có phương án hiển thị dự phòng khi ảnh lỗi.
- Kiểm tra desktop, mobile, bàn phím và reduced motion khi thay đổi tương tác.
- Chạy `npm run check` và các kịch bản E2E liên quan trước khi bàn giao thay đổi.
- Không đưa thông tin cá nhân thật, mật khẩu, khóa truy cập hoặc file môi trường riêng vào repository.

## Tài nguyên và giấy phép

Thông tin nguồn ảnh và font được ghi tại:

- [Tài nguyên hình ảnh](public/assets/photos/README.md): ảnh minh họa cho sản phẩm và chiến dịch, không đại diện cho hàng hóa thực tế.
- [Thông tin font](public/fonts/README.md) và [SIL Open Font License của Gelasio](public/fonts/OFL-Gelasio.txt).

Repository hiện chưa có giấy phép cấp dự án. Không mặc định mã nguồn được cấp phép theo MIT hoặc một giấy phép mã nguồn mở khác; cần xác nhận quyền sử dụng và phân phối với chủ sở hữu. Các thư viện và tài nguyên bên thứ ba tuân theo giấy phép riêng của chúng.
