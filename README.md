```markdown
# 🏷️ FindBack — Community Lost & Found Platform

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg)

> **FindBack** is a community-powered lost and found platform that connects people who have lost items with those who have found them. Built with React, FastAPI, and Supabase.

🔗 **Live Demo:** [https://findback.vercel.app](https://findback.vercel.app)

---

## 📸 Screenshots

| Home Page | Item Detail |
|-----------|-------------|
| ![Home Page](https://via.placeholder.com/400x200?text=Home+Page) | ![Item Detail](https://via.placeholder.com/400x200?text=Item+Detail) |

| Chat | Profile |
|------|---------|
| ![Chat](https://via.placeholder.com/400x200?text=Chat) | ![Profile](https://via.placeholder.com/400x200?text=Profile) |

---

## ✨ Features

### 🔐 Authentication
- Email/password registration and login
- Secure session management
- Profile creation and management

### 📝 Item Management
- Report lost or found items with photos
- Add title, description, category, and location
- Multiple image uploads per post
- Mark items as returned once reunited

### 🔍 Search & Discovery
- Browse all active lost/found items
- Search by keyword, category, location, and date
- Filter by item type (lost/found)
- Real-time results

### 💬 Messaging System
- In-app chat between finders and owners
- No personal contact information exposed
- Message history for each item
- Real-time messaging with optimistic updates
- Unread message indicators

### 🔔 Notifications
- Real-time notifications for new messages
- Unread message count in navbar
- Browser notifications (desktop)
- Mark notifications as read

### 👤 User Profiles
- View and edit profile information
- Upload profile photo
- View all user's items (active and returned)
- Public profile for other users

### 🎨 Modern UI
- Clean, responsive design
- Mobile-first approach
- Intuitive user experience
- Beautiful gradient hero section
- Card-based layout for items

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React 18 + Vite | UI Framework |
| **Styling** | Tailwind CSS | Styling & Responsive Design |
| **Backend** | FastAPI (Python) | REST API |
| **Database** | Supabase (PostgreSQL) | Database + Auth + Storage |
| **Image Storage** | Supabase Storage | Photo uploads |
| **Authentication** | Supabase Auth | User authentication |
| **Real-time** | Supabase Realtime | Live chat & notifications |
| **Icons** | Lucide React | Icon library |
| **Deployment** | Vercel (Frontend) + Railway/Render (Backend) | Hosting |

---

## 📁 Project Structure

findback/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── Navbar.jsx
│   │   ├── context/          # React context
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── ItemDetail.jsx
│   │   │   ├── PostItem.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── PublicProfile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/         # API services
│   │   │   └── supabase.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                  # Environment variables
│   └── package.json
│
├── backend/                  # FastAPI
│   ├── app/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

## 🗄️ Database Schema

```sql
-- Core Tables
users (via Supabase Auth)
profiles          -- User profiles (name, phone, avatar)
items             -- Lost/found item posts
categories        -- Item categories (Phone, Wallet, etc.)
messages          -- In-app chat messages
reports           -- Flagged content moderation

-- Relationships
items.user_id → profiles.id
messages.item_id → items.id
messages.sender_id → profiles.id
messages.receiver_id → profiles.id
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase account (free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/rihhanna/findback.git
cd findback
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_SUPABASE_URL=your_supabase_url" > .env
echo "VITE_SUPABASE_ANON_KEY=your_anon_key" >> .env

# Start development server
npm run dev
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create .env file
echo "SUPABASE_URL=your_supabase_url" > .env
echo "SUPABASE_ANON_KEY=your_anon_key" >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" >> .env

# Start server
uvicorn app.main:app --reload
```

### 4. Database Setup

1. Create a Supabase project
2. Run `database/schema.sql` in Supabase SQL Editor
3. Configure Row Level Security (RLS) policies

### 5. Environment Variables

**Frontend (.env)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (.env)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🔧 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway)

```bash
cd backend
# Push to GitHub
# Connect repository to Railway
# Add environment variables
# Deploy
```

---

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API status |
| GET | `/health` | Health check |
| POST | `/auth/signup` | User registration |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| GET | `/items` | Get all items |
| POST | `/items` | Create item |
| GET | `/items/{id}` | Get item by ID |
| PUT | `/items/{id}` | Update item |
| DELETE | `/items/{id}` | Delete item |
| GET | `/messages/{item_id}` | Get messages for item |
| POST | `/messages` | Send message |
| GET | `/profiles/{user_id}` | Get user profile |

---

## 🔮 Future Enhancements

### v2.0 (Coming Soon)

- [ ] AI-powered image matching
- [ ] Smart search with embeddings
- [ ] Map view of lost/found items
- [ ] Push notifications
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Admin moderation dashboard
- [ ] QR code for pet tags / ID cards
- [ ] Reward/thank-you tipping

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**Rehana Hassan Muhamed**

- GitHub: [@rihhanna](https://github.com/rihhanna)
- LinkedIn: [Rehana Hassan](https://linkedin.com/in/rehana-hassan)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) — Database, Auth, and Storage
- [Tailwind CSS](https://tailwindcss.com) — Beautiful styling
- [Vercel](https://vercel.com) — Frontend hosting
- [Railway](https://railway.app) — Backend hosting
- [Lucide](https://lucide.dev) — Icons

---

## 📊 Project Status

| Phase | Status |
|-------|--------|
| MVP Development | ✅ Complete |
| Testing | 🔄 In Progress |
| Production | ✅ Live |
| v2.0 AI Features | ⏳ Planned |

---

## 🔗 Quick Links

- [GitHub Repository](https://github.com/rihhanna/findback)
- [Live Demo](https://findback.vercel.app)
- [Report Issue](https://github.com/rihhanna/findback/issues)

---

## 💬 Support

For support, email hrihhana@gmail.com or open an issue on GitHub.

---

**"I don't just study AI and Machine Learning. I build with it."** 🚀

---
Made with ❤️ by Rehana Hassan

