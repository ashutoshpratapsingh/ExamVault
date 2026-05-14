# ExamVault

ExamVault is a full-stack MERN-based online examination and assessment management platform designed for educational institutions to conduct and manage digital examinations efficiently. The platform provides secure role-based access for Admins, Faculty members, and Students while supporting exam management, answer evaluation, result publishing, and analytics.

---

# Features

## Admin Module
- Secure Admin Authentication
- Create, Edit, and Delete Exams
- Generate and Manage Question Papers
- Add, Edit, and Delete Questions
- Manage Faculty and Student Accounts
- Assign Exams
- Monitor Overall System Activities
- Access Platform Analytics Dashboard

---

## Faculty Module
- Secure Faculty Login
- View Assigned Exams
- Access Student Submissions
- Evaluate and Check Answer Papers
- Publish Student Results
- Track Student Performance
- View Exam Analytics

> Note: Faculty members cannot edit question papers or modify questions created by the Admin.

---

## Student Module
- Secure Student Authentication
- View Available Exams
- Attempt Online Examinations
- Submit Responses Digitally
- View Published Results
- Track Academic Performance

---

# Analytics Dashboard

- Student Performance Analysis
- Exam-wise Analytics
- Submission Statistics
- Result Monitoring
- Performance Insights

---

# Tech Stack

## Frontend
- React.js
- HTML5
- CSS3
- JavaScript

## Backend
- Node.js
- Express.js

## Database
- MongoDB

## Authentication & Security
- JWT Authentication
- Role-Based Access Control
- Protected Routes

---

# Project Structure

```bash
ExamVault/
│
├── client/             # React Frontend
├── server/             # Express Backend
├── models/             # MongoDB Models
├── routes/             # API Routes
├── middleware/         # Authentication Middleware
├── controllers/        # Business Logic
├── utils/              # Helper Functions
└── README.md
```

---

# Installation & Setup

## Clone Repository

```bash
git clone https://github.com/ashutoshpratapsingh/ExamVault.git
```

---

## Navigate to Project Folder

```bash
cd ExamVault
```

---

## Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd ../client
npm install
```

---

# Running the Application

## Start Backend Server

```bash
cd server
npm start
```

## Start Frontend

```bash
cd client
npm start
```

---

# Environment Variables

Create a `.env` file inside the `server` directory.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

---

# Core Functionalities

- Multi-Role Authentication System
- Role-Based Authorization
- Online Examination Management
- Question Paper Generation
- Student Submission Handling
- Faculty Evaluation Workflow
- Result Publishing System
- Analytics Dashboard
- Secure REST APIs
- Responsive User Interface

---

# Screenshots

> Add screenshots for:
- Admin Dashboard
- Faculty Dashboard
- Student Portal
- Exam Interface
- Result Page
- Analytics Dashboard

---

# Future Enhancements

- AI-Based Proctoring
- Real-Time Exam Monitoring
- Timer-Based Examinations
- Email Notifications
- Cloud Deployment
- Certificate Generation
- Performance Leaderboards

---

# Author

## Ashutosh Pratap Singh

- GitHub: https://github.com/ashutoshpratapsingh

---

# Contributing

Contributions are welcome. Feel free to fork the repository and submit pull requests.

---

# License

This project is developed for educational and academic purposes.