# DesignCraft — Production-Grade Canva Clone

A full-stack, production-ready design application built with Next.js 14, TypeScript, Fabric.js, MongoDB, and Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas free tier)
- npm or yarn

### 1. Install dependencies

```bash
cd canva-clone
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/canva-clone
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- Admin account (`admin@designcraft.com` / `Admin@123456`)
- 6 sample templates
- Asset categories

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
canva-clone/
├── app/
│   ├── (auth)/              # Login, Register pages
│   ├── (dashboard)/         # Main app: Dashboard, Editor, Templates, Profile
│   ├── (admin)/             # Admin panel (role-guarded)
│   └── api/                 # REST API routes
├── components/
│   ├── editor/              # Canvas, Toolbar, Element/Property/Layer panels
│   ├── dashboard/           # Design grid, cards
│   ├── admin/               # Admin-specific UI
│   └── ui/                  # Reusable primitives (Button, Modal, Input, etc.)
├── lib/
│   ├── db/models/           # Mongoose models (User, Design, Template, Asset)
│   ├── auth/                # JWT utilities, middleware
│   ├── canvas/              # Fabric.js helpers
│   ├── storage/             # File upload handlers
│   └── validations/         # Zod schemas
├── store/                   # Zustand state management
├── hooks/                   # Custom React hooks
└── types/                   # TypeScript interfaces
```

---

## ✨ Features

### User Features
| Feature | Status |
|---------|--------|
| Register / Login with JWT | ✅ |
| Create designs (multiple presets) | ✅ |
| Canvas editor (Fabric.js) | ✅ |
| Add text with formatting | ✅ |
| Add shapes (rect, circle, triangle, star, line) | ✅ |
| Upload & add images | ✅ |
| Resize, rotate, move elements | ✅ |
| Layer management (show/hide/lock/reorder) | ✅ |
| Undo / Redo (50-step history) | ✅ |
| Auto-save (2.5s debounce) | ✅ |
| Save & load designs | ✅ |
| Duplicate designs | ✅ |
| Delete designs | ✅ |
| Templates gallery | ✅ |
| Export PNG, JPG, PDF | ✅ |
| Zoom controls | ✅ |
| Profile page | ✅ |

### Admin Features
| Feature | Status |
|---------|--------|
| Analytics dashboard | ✅ |
| Create/edit/delete templates | ✅ |
| Upload assets | ✅ |
| View/manage users | ✅ |
| Ban/unban users | ✅ |

---

## 🔑 API Reference

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
POST   /api/auth/refresh           Refresh access token
DELETE /api/auth/refresh           Logout

GET    /api/designs                List user's designs
POST   /api/designs                Create design
GET    /api/designs/[id]           Get design with canvas data
PUT    /api/designs/[id]           Save/update design
DELETE /api/designs/[id]           Delete design
POST   /api/designs/[id]/duplicate Duplicate design

GET    /api/templates              List templates (public)
GET    /api/templates/[id]         Get template

GET    /api/assets                 List assets
POST   /api/assets/upload          Upload asset file
DELETE /api/assets/[id]            Delete asset

GET    /api/admin/analytics        Analytics (admin)
*      /api/admin/templates/*      Template CRUD (admin)
GET    /api/admin/users            List users (admin)
PUT    /api/admin/users            Update user (admin)
```

---

## 🛡️ Security

- Passwords hashed with **bcrypt** (cost factor 12)
- **JWT dual-token** strategy: 15-min access tokens + 7-day refresh tokens (httpOnly cookies)
- Route-level **RBAC** (user vs admin)
- Input validation via **Zod** on all API routes
- File type validation on uploads
- 10MB file size limit

---

## 🎨 Canvas Editor

The editor uses **Fabric.js 5** for the canvas:

- All elements have a custom `id` property for tracking
- History is stored as JSON snapshots (max 50 steps)
- Auto-save debounces 2.5 seconds after last change
- Exports use Fabric's `toDataURL()` with retina scaling
- PDF export uses `jsPDF`

---

## 🚢 Production Deployment

### Environment Variables (Production)
```
MONGODB_URI=mongodb+srv://...   # Use MongoDB Atlas
JWT_ACCESS_SECRET=<64-char random string>
JWT_REFRESH_SECRET=<64-char random string>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Build
```bash
npm run build
npm start
```

### Recommended hosting
- **Vercel** (Next.js optimal)
- **Railway** or **Render** for Node.js + MongoDB

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Canvas | Fabric.js 5 |
| State | Zustand |
| Backend | Next.js API Routes |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Export | jsPDF |
| UI | Lucide Icons, react-colorful |

---

## 🗺️ Development Roadmap

### Phase 1 (Done — this codebase)
- Core auth + user system
- Design CRUD + canvas editor
- Shapes, text, image elements
- Layer panel, property panel
- Templates gallery
- Export PNG/JPG/PDF
- Admin panel

### Phase 2 (Enhancements)
- [ ] Rich text with Google Fonts picker
- [ ] Gradient fills for shapes
- [ ] Image filters and adjustments
- [ ] Element alignment tools (snap to grid)
- [ ] Copy/paste elements (Ctrl+C/V)
- [ ] Design sharing (public URLs)
- [ ] Keyboard shortcuts panel

### Phase 3 (Scale)
- [ ] Real-time collaboration (Socket.io)
- [ ] Comments on designs
- [ ] Version history browser
- [ ] Cloudinary integration
- [ ] Webhook for export queue
