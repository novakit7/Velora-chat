# 💬 Vellora

**Vellora** is a modern full-stack real-time chat application built as a **solo project** using the **MERN Stack** and **Socket.IO**. It is designed to deliver a seamless messaging experience with real-time communication, AI-powered features, secure authentication, media sharing, and a clean, responsive interface.

<!-- > **Status:** Active Development 🚧 -->

---

## ✨ Features

### 🔐 Authentication

- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and APIs

### 💬 Real-Time Chat

- Instant one-to-one messaging
- Live online/offline status
- Typing indicators
- Read receipts
- Message timestamps

### 👥 Social Features

- Search users
- Send, accept, and reject friend requests
- Manage friends list

### 📂 Media Sharing

- Upload and share images
- File sharing support
- Cloudinary integration

### 🤖 AI Integration

- AI-powered smart replies
- AI chat assistant

### 👤 User Profiles

- Update profile information
- Upload profile picture
- Customize bio

### 🎨 User Experience

- Fully responsive design
- Modern dark UI
- Smooth animations
- Toast notifications
- Loading skeletons

---

## 🛠 Tech Stack

### Frontend

- React
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcrypt

### Services

- Cloudinary
- AI API Integration

---

## 📁 Project Structure

```text
vellora/
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── config/
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/vellora.git
cd vellora
```

### Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

AI_API_KEY=your_ai_api_key
```

### Run the Project

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

---

## 🎯 Learning Goals

This project was built to strengthen my understanding of:

- Building scalable full-stack MERN applications
- Real-time communication with Socket.IO
- Secure authentication using JWT
- REST API development
- Database modeling with MongoDB
- Media management with Cloudinary
- AI integration in web applications
- Responsive UI development with Tailwind CSS

---

## 🔮 Future Improvements

- Group chats
- Voice & video calls
- Push notifications
- Advanced message search
- End-to-end encryption
- Custom themes
- Message reactions
- Voice messages

---

## 👨‍💻 About This Project

Vellora is a **personal portfolio project** developed independently to explore modern web technologies and build a production-style real-time chat platform. Every aspect of the application—from system design and backend architecture to frontend development and deployment—was designed and implemented by me.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you like this project, consider giving it a **⭐ Star** on GitHub—it helps and is greatly appreciated!
