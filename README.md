# 🏠 Nestify — Hostel Room Allocation System

A full-stack MERN web application for managing hostel room allocation, student records, and room availability.

## 🚀 Features
- 🔐 JWT Authentication (Admin / Student roles)
- 👑 Admin Panel — approve students, manage rooms
- 🏠 Interactive Room Floor Plan
- 💳 Payment UI (Fees management)
- 📅 Check-in / Check-out date tracking
- 🔧 Maintenance requests
- ⚡ Real-time updates (Socket.IO)

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Auth:** JWT
- **Realtime:** Socket.IO

## ⚙️ Setup Instructions

### 1. Clone karo
```bash
git clone https://github.com/DurgaRoy2226/Nestify-Hostel-Room-Allocation-System.git
cd Nestify-Hostel-Room-Allocation-System
```

### 2. Backend setup
```bash
cd backend
npm install
```

Backend `.env` file banao:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
PORT=5000
```
```bash
npm run dev
```

### 3. Admin account banao
```bash
node createAdmin.js
```
```
Email: admin@nestify.com
Password: Admin@123
```

### 4. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

### 5. Browser mein open karo
```
http://localhost:3000
```

## 📁 Project Structure
```
Nestify/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── context/
│   └── index.html
└── README.md
```

## 👥 Team
- Durga Roy