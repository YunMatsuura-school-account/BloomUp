# BloomUp

> A full-stack family management platform that helps parents track budgets, manage child profiles, schedule vaccinations, and receive AI-powered financial insights — all in one place.

**Live Demo:** [https://bloomup.wmdd.ca/](https://bloomup.wmdd.ca/) _(hosted on Langara WMDD college servers — availability may end after the academic term)_

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![AWS EC2](https://img.shields.io/badge/AWS%20EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/ec2/)

---

## Table of Contents

- [About The Project](#about-the-project)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## About The Project

**BloomUp** is a comprehensive web application designed for modern families to simplify the complexity of parenting. It combines **personal finance management**, **child health tracking**, **calendar scheduling**, and **AI-driven insights** into a single, easy-to-use platform.

Built as a full-stack MERN-style application, BloomUp demonstrates production-grade engineering practices including JWT-based authentication, secure password hashing, role-based route protection, third-party API integration (OpenAI), file uploads, and cloud deployment on AWS EC2 with Nginx as a reverse proxy and PM2 as a process manager.

### Why BloomUp?

- **All-in-one solution** — replaces multiple disconnected apps (budgeting, calendar, child records)
- **AI-powered** — leverages OpenAI GPT-4o-mini for personalized financial insights
- **Production-ready** — deployed on AWS EC2 with HTTPS, reverse proxy, and process management
- **Mobile-responsive** — built mobile-first with TailwindCSS

---

## Live Demo

The app is currently hosted on Langara College's WMDD servers:

**[https://bloomup.wmdd.ca/](https://bloomup.wmdd.ca/)**

> _Note: This deployment is maintained as part of an academic project and may be taken offline after the program ends. A self-hosted copy can be spun up by following the [Getting Started](#getting-started) instructions below._

---

## Key Features

### Authentication & Security
- Secure user registration and login with **JWT (JSON Web Tokens)**
- Password hashing using **bcryptjs** (salt rounds: 10)
- Protected routes with custom Express middleware
- Frontend `AuthGuard` component validates sessions on every protected page

### Budget Management
- Create monthly budgets with multiple category allocations
- Track expenses with optional receipt image uploads
- Visual budget summary with **custom donut charts** (Chart.js + SVG)
- Real-time spending vs. budget comparison

### AI-Powered Financial Insights
- Integrated with **OpenAI GPT-4o-mini** API
- Generates personalized analysis: top spending categories, smart suggestions, and predictions
- Session-storage caching to minimize redundant API calls
- Smart refresh logic based on budget activity

### Child Profile Management
- Create and manage multiple child profiles per family account
- Store medical history, date of birth, and profile images
- Vaccination tracking based on **BC (British Columbia) provincial vaccination schedule**

### Calendar & Reminders
- Full calendar view with **FullCalendar** (day grid, time grid, list views)
- Create, edit, and delete events
- Upcoming events widget on the dashboard
- Vaccination reminders with Google Maps integration

### Articles & Resources
- Curated library of parenting and child-care articles
- Category-based filtering
- "Save for later" functionality

### Contact System
- Functional contact form with email delivery via **Nodemailer / SendGrid**
- Form validation, success/error feedback, and loading states

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Vite 7** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **TailwindCSS 3** | Utility-first styling |
| **Chart.js + react-chartjs-2** | Data visualization |
| **FullCalendar** | Calendar component |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose 7** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Multer** | Multipart file uploads |
| **OpenAI SDK** | AI insights integration |
| **Nodemailer / SendGrid** | Email delivery |
| **CORS, dotenv** | Cross-origin & env config |

### DevOps & Deployment
- **AWS EC2** (Ubuntu 24.04, t2.small)
- **Nginx** as reverse proxy
- **PM2** for process management
- **OpenSSL** for HTTPS (self-signed for demo)
- **Git / GitHub** for version control

---

## Project Structure

```
BloomUp/
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── controllers/              # Business logic handlers
│   │   ├── aiInsightsController.js
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── childProfileController.js
│   │   ├── calendarController.js
│   │   ├── vaccinationController.js
│   │   └── ...
│   ├── routes/                   # API route definitions
│   ├── models/                   # Mongoose schemas
│   ├── middleware/               # JWT verification, etc.
│   ├── services/                 # OpenAI client, email, etc.
│   ├── scripts/                  # DB seeding utilities
│   ├── uploads/                  # User-uploaded files
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page-level components
│   │   ├── layout/               # Layout wrappers
│   │   ├── contexts/             # React Context providers
│   │   ├── App.jsx               # Routes & global interceptor
│   │   └── main.jsx              # Entry point
│   ├── public/                   # Static assets
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v16 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) account)
- [Git](https://git-scm.com/)
- An [OpenAI API key](https://platform.openai.com/) (for AI insights)
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) (for contact form emails)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/YunMatsuura-school-account/BloomUp.git
cd BloomUp
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Configure environment variables** (see [Environment Variables](#environment-variables) below)

5. **Seed the database (optional)**

```bash
cd ../backend
node scripts/seedArticles.js
node scripts/seedBCVaccinationData.js
```

6. **Start the backend** (from the `backend/` folder)

```bash
npm start
```

The API will be live at `http://localhost:8888`.

7. **Start the frontend** (in a new terminal, from the `frontend/` folder)

```bash
npm run dev
```

The app will open at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/bloomup
DB_NAME=bloomup

# JWT
ACCESS_TOKEN_SECRET=your-super-secret-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Server
PORT=8888
CORS_ORIGIN=http://localhost:5173

# Email (Contact Form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# SendGrid (optional)
SENDGRID_API_KEY=SG.your-sendgrid-api-key
```

### Frontend (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:8888
```

> **Note:** Never commit your `.env` files. They are already listed in `.gitignore`.

---

## API Reference

The backend exposes a RESTful API. Below is a summary of the main route groups.

| Group | Base Path | Description |
|-------|-----------|-------------|
| Auth | `/api/auth` | Signup, login, current user |
| Users | `/api/users` | User profile management |
| Children | `/api/users/:userId/children` | Child profile CRUD |
| Budget | `/api/budget` | Budget & expense management |
| AI Insights | `/api/ai/insights/budget` | OpenAI-powered analysis |
| Articles | `/api/articles` | Articles CRUD & saving |
| Calendar | `/api/calendar` | Calendar event management |
| Vaccinations | `/api/vaccinations` | Vaccination schedules |
| Contact | `/api/contact` | Contact form submissions |

### Example: Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

### Example: Get AI Insights

```http
GET /api/ai/insights/budget?userId=<id>&start=2026-01-01&end=2026-01-31
Authorization: Bearer <token>
```

---

## Deployment

The application has been deployed to two environments during development:

| Environment | Host | URL | Status |
|-------------|------|-----|--------|
| Academic demo | Langara WMDD college servers | [https://bloomup.wmdd.ca/](https://bloomup.wmdd.ca/) | Live (may end after academic term) |
| Production reference | AWS EC2 (Ubuntu 24.04, `t2.small`) | Static Elastic IP | Reference setup, can be re-spun anytime |

### Deploying to AWS EC2 (recommended for production)

1. Provision an Ubuntu 24.04 EC2 instance (e.g., `t2.small`) and assign an Elastic IP.
2. Install **Node.js**, **MongoDB**, **Nginx**, and **PM2**.
3. Clone the repo into `/var/www/bloomup/`.
4. Set up environment files on the server.
5. Run the backend as a PM2 service:

```bash
cd /var/www/bloomup/backend
npm install
pm2 start npm --name bloomup-api -- run start
pm2 save
```

6. Build the frontend and serve it via Nginx:

```bash
cd /var/www/bloomup/frontend
npm install
npm run build
sudo cp -r dist/* /var/www/bloomup/frontend-dist/
```

7. Configure Nginx to:
   - Serve the static frontend from `/var/www/bloomup/frontend-dist`
   - Proxy `/api/*` requests to `http://127.0.0.1:8888`
   - Force HTTPS with SSL certificates

8. Reload Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Roadmap

- [ ] Add unit & integration tests (Jest + React Testing Library)
- [ ] Migrate from self-signed SSL to Let's Encrypt
- [ ] Add Docker Compose for local development
- [ ] Implement push notifications for vaccination reminders
- [ ] Add multi-language support (i18n)
- [ ] Build a mobile companion app (React Native)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure your code follows the existing style and passes `npm run lint`.

---

## Team

BloomUp was built collaboratively by a team of **5 developers** as a  project for the **Web and Mobile App Design and Development (WMDD)** program at **Langara College, Vancouver**.

The team contributed across frontend, backend, design, AI integration, and DevOps.

---

## Acknowledgments

- [OpenAI](https://openai.com/) for the GPT-4o-mini API
- [FullCalendar](https://fullcalendar.io/) for the calendar component
- [Chart.js](https://www.chartjs.org/) for data visualizations
- [TailwindCSS](https://tailwindcss.com/) for the design system
- BC provincial vaccination schedule data sourced from official Government of Canada health resources
- Langara College WMDD program for hosting infrastructure and mentorship

---

## License

© 2026 BloomUp Team. All rights reserved.

This project was developed as an academic capstone and is not currently open-sourced. For inquiries about reuse or collaboration, please contact the team.

---

<p align="center">
  Built with care by the BloomUp team for modern families.
</p>
