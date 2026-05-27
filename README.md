# 🌳 LegacyAI – Demo Sản Phẩm
> Nền tảng AI số hóa cây gia phả và lưu giữ ký ức gia tộc

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Bước 1: Cài dependencies
```bash
cd legacyai-demo
npm install
```

### Bước 2: Chạy development server
```bash
npm run dev
```

### Bước 3: Mở trình duyệt
```
http://localhost:5173
```

---

## 🎬 Demo Flow (cho giám khảo)

```
1. Login       → Nhập bất kỳ email/mật khẩu nào
2. Home        → Xem tổng quan gia đình, stats, ký ức gần đây
3. Family Tree → Xem cây gia phả 3 thế hệ, click vào thẻ
4. Add Member  → Nhấn "Thêm thành viên", điền form → Submit
5. AI Suggest  → Hệ thống tự động gợi ý quan hệ họ hàng ✨
6. Profile     → Click thành viên bất kỳ → Xem hồ sơ chi tiết
7. Add Memory  → Nhấn "Thêm ký ức" → Chọn loại, điền nội dung → Lưu
8. Timeline    → Xem toàn bộ dòng thời gian ký ức gia tộc
```

---

## 📁 Cấu trúc dự án

```
legacyai-demo/
├── src/
│   ├── App.jsx                        # Router chính
│   ├── main.jsx                       # Entry point
│   ├── index.css                      # Global styles (Tailwind)
│   ├── data/
│   │   └── mockData.js                # Dữ liệu mẫu 8 thành viên + 5 ký ức
│   ├── context/
│   │   └── AppContext.jsx             # Global state (auth, members, memories)
│   ├── utils/
│   │   └── relationshipEngine.js      # AI rule-based relationship engine
│   ├── components/
│   │   ├── Navbar.jsx                 # Navigation bar
│   │   ├── FamilyTree.jsx             # SVG tree renderer
│   │   ├── AddMemberModal.jsx         # Form thêm thành viên
│   │   ├── AIRelationshipModal.jsx    # Hiển thị AI gợi ý quan hệ
│   │   ├── MemoryCard.jsx             # Card ký ức (Facebook-style)
│   │   └── AddMemoryModal.jsx         # Form thêm ký ức
│   └── pages/
│       ├── LoginPage.jsx              # Đăng nhập / Đăng ký
│       ├── HomePage.jsx               # Trang chủ dashboard
│       ├── FamilyTreePage.jsx         # Trang cây gia phả
│       ├── MemberProfilePage.jsx      # Hồ sơ thành viên
│       └── MemoryTimelinePage.jsx     # Dòng thời gian ký ức
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🤖 AI Relationship Engine

File: `src/utils/relationshipEngine.js`

Logic rule-based suy luận quan hệ họ hàng:
- **Ông/Bà**: Cha/mẹ của cha/mẹ
- **Cô/Chú/Bác/Dì**: Anh/chị/em của cha/mẹ
- **Anh/Chị/Em ruột**: Cùng cha mẹ
- **Anh/Chị em họ**: Con của cô/chú/bác/dì
- **Cháu**: Con của con

---

## 🎨 Thiết kế

- **Màu sắc**: Warm amber/brown – gợi cảm giác di sản, truyền thống
- **Font**: Be Vietnam Pro (Google Fonts)
- **UI Pattern**: Cards, modals, smooth transitions
- **Responsive**: Desktop + Mobile

---

## 🛠️ Tech Stack

| Thành phần | Công nghệ |
|-----------|----------|
| Framework | React 18 + Vite 5 |
| Styling   | TailwindCSS 3 |
| Routing   | React Router v6 |
| Icons     | Lucide React |
| State     | React Context API |
| Data      | Mock data (no backend) |
| Avatars   | DiceBear API |

---

## 👥 Nhóm LegacyAI – FShark 2026

| Họ tên | Vai trò |
|--------|---------|
| Nguyễn Quang Minh | CEO / Developer |
| Nguyễn Thanh Trường Tuấn | CTO |
| Nguyễn Anh Phương | CMO |
| Nguyễn Duy Thịnh | Designer |
| Phạm Khắc Ngọc | Developer |
| Huỳnh Tấn Vinh | Developer |

---

*LegacyAI – Giữ gìn ký ức, kết nối thế hệ* 🌳
# LegacyAI
