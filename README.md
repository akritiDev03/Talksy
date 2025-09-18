# Talksy - Real-Time Chat Application

Talksy is a modern real-time chat application built with React and Node.js, allowing users to communicate through text messages, images, and clickable links in a secure and responsive interface.

## Features

- 💬 Real-time messaging with Socket.IO
- 🖼️ Image sharing via Cloudinary
- 🔗 Clickable links in messages, sanitized with DOMPurify for security (only http/https URLs allowed)
- 👤 User authentication with JWT
- 🔄 Online/Offline status indicators
- ⌨️ Typing indicators
- 🕒 Last seen functionality
- ❌ Message deletion (click on desktop, long-press on mobile)
- 🔍 User search
- 📱 Responsive design

## Tech Stack

### Frontend
- React
- Socket.io-client
- Tailwind CSS
- Context API
- Vite

### Backend
- Node.js
- Express
- MongoDB
- Socket.io
- Cloudinary
- JWT Authentication


## 📁 Project Structure

```
📦 Talksy
├── client/                      # Frontend
│   ├── context/                # React Context files
│   │   ├── AuthContext.jsx     # Authentication context
│   │   └── ChatContext.jsx     # Chat management context
│   ├── public/                 # Public assets
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/            # Images and icons
│   │   │   
│   │   ├── components/        # React components 
│   │   │  ├── ChatContainer.jsx
│   │   │  ├── RightSidebar.jsx 
│   │   │  └── Sidebar.jsx 
│   │   │      
│   │   ├── lib/              # Utility functions
│   │   │   └── utils.js
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── vite.config.js
│
└── server/                   # Backend
    ├── controllers/          # Route controllers
    │   ├── messageController.js
    │   └── userController.js
    ├── lib/                 # Utility functions
    │   ├── cloudinary.js
    │   ├── db.js
    │   └── utils.js
    ├── middleware/          # Express middleware
    │   ├── auth.js
    │   └── updateLastSeen.js
    ├── models/             # Database models
    │   ├── Message.js
    │   └── User.js
    ├── routes/            # API routes
    │   ├── messageRoutes.js
    │   └── userRoutes.js
    ├── .env              # Environment variables
    ├── package.json
    └── server.js        # Entry point
```

##  Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/talksy.git
cd talksy
```

2. Install dependencies for both client and server
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables

Create `.env` file in client directory:
```env
VITE_BACKEND_URL=http://localhost:5000
```

Create `.env` file in server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

4. Start the development servers

```bash
# Start backend server
cd server
npm start

# Start frontend development server
cd client
npm run dev
```

## Usage

1. Register/Login with your credentials
2. Search for users to chat with
3. Click on a user to start chatting
4. Send text messages, images or links
5. View user's online status, typing indicators, and last seen time
6. Delete messages with:
   - Desktop: Click on message
   - Mobile: Long press on message

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

## Contact
📧 Email: [akritisingh0309@gmail.com](mailto:akritisingh0309@gmail.com)  
🐱 GitHub: [github.com/akritiDev03](https://github.com/akritiDev03) 