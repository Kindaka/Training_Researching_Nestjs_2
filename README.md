# 🚀 Training & Researching NestJS

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="100" alt="NestJS">
</p>  
_A Progressive Node.js framework for building efficient and scalable applications._

---

## 📌 Getting Started

### ⚙️ 1. Setup Environment Variables
Create `.env` files for both Docker Compose and the NestJS backend.

#### 📂 backend/.env
```
DB_HOST=your_localhost
DB_PORT=your_port
DB_NAME=your_db_name
DB_USER=your_username
DB_PASSWORD=your_password
NODE_ENV=development
PORT=your_port
JWT_SECRET=randome_jwt_secret
MAIL_HOST=your_key
MAIL_PORT=your_key
MAIL_USER=your_key
MAIL_PASS=your_key
MAIL_FROM=your_key
FE_DOMAIN=https://fe-training-qkit.vercel.app
SEQ_URL=your_key
SEQ_API_KEY=your_key
CLOUDINARY_CLOUD_NAME=your_key
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_key
```

#### 📂 backend/.env.prod (Running on Docker environment)
```
DB_HOST=your_key
DB_PORT=your_key
DB_NAME=your_key
DB_USER=your_key
DB_PASSWORD=your_key
NODE_ENV=your_key
PORT=your_key
JWT_SECRET=your_key
MAIL_HOST=your_key
MAIL_PORT=your_key
MAIL_USER=your_key
MAIL_PASS=your_key
MAIL_FROM=your_key
FE_DOMAIN=https://fe-training-qkit.vercel.app
SEQ_URL=your_key
SEQ_API_KEY=your_key
CLOUDINARY_CLOUD_NAME=your_key
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_key
```

#### 📂 compose/.env
```
POSTGRESQL_PORT=your_port
POSTGRESQL_USERNAME=your_username
POSTGRESQL_DATABASE=your_db_name
POSTGRESQL_PASSWORD=your_password
```

### 🐳 2. Run Database Container
Ensure Docker is installed, then run:
```sh
docker compose up --build --detach
```

### 🚀 3. Start the Backend
Navigate to the `backend` directory and run:
```sh
npm run start:dev
```

---

## 📁 Project Structure
```
Training_Researching_Nestjs/
├── backend/                  # NestJS Backend Application
├── frontend/                 # NestJS Frontend Application
├── compose/                  # Docker Compose Configuration
└── README.md                  # Project Documentation
```

---

## 🛠️ Technologies Used
✅ **NestJS** - A progressive Node.js framework  
✅ **TypeORM** - ORM for database management  
✅ **PostgreSQL** - Relational database  
✅ **Docker** - Containerization platform  
✅ **JWT (JSON Web Token)** - Authentication mechanism  
✅ **WebSocket** - Chat Application  
✅ **Cloudinary** - Upload image, video  

---

## 🤝 Contribution
Feel free to fork this repository and submit a pull request. We appreciate all contributions! 🎉

---

## 📜 License
This project is licensed under the **MIT License**.

💡 _Happy Coding! 🚀_

