# 🛍️ ShopSphere — Premium Full-Stack E-Commerce Platform

Welcome to **ShopSphere**, a modern, feature-rich, full-stack e-commerce marketplace built using the **MERN (MongoDB, Express, React, Node.js)** stack. It offers an elegant and responsive user interface, dark mode theme support, robust vendor and administrator workflows, secure Stripe payment processing, and a live customer support chat system powered by WebSockets.

---

## ✨ Features

### 👤 Customer Features
*   **Intuitive Shopping Experience:** Browse, search, filter, and view detailed product pages with smooth page transitions powered by `Framer Motion`.
*   **Cart & Wishlist Management:** Easily add/remove items, manage quantities, and save favorite items with real-time total updates.
*   **Secure Checkout & Payments:** Stripe-integrated payment forms for seamless and secure payment flows.
*   **Order History:** View completed orders, current statuses, and itemized billing/shipping details.
*   **Profile & Theme Control:** Update user details and toggle between light and dark modes instantly.

### 🏪 Vendor Features
*   **Vendor Onboarding:** Register as a vendor with structured application tracking.
*   **Vendor Dashboard:** Monitor product performance, stock availability, and vendor-specific sales data.
*   **Product Management:** Create, read, update, and delete (CRUD) product listings including price, inventory, images, and category categorization.

### 🛡️ Administrative Controls
*   **Admin Dashboard:** Analyze global shop performance, order frequencies, user registrations, and gross revenues.
*   **System-wide Catalog & Order Control:** Oversee global inventory, approve vendor status, and update global order shipping stages.
*   **Live Customer Support Chat:** Real-time customer support chat powered by Socket.io, allowing admins to chat with users in real-time.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS | Highly responsive component layout and styling |
| **Animation** | Framer Motion, Lucide React | Micro-interactions, icons, and smooth transitions |
| **Backend** | Node.js, Express.js | Robust, modular backend REST API endpoints |
| **Database** | MongoDB, Mongoose | Scalable, document-based object data modeling (ODM) |
| **WebSockets** | Socket.io | Bi-directional communication for live support chats |
| **Payments** | Stripe API | Secure card verification and payment transaction handling |
| **Security** | Helmet, Express Rate Limit | Robust middleware against common web vulnerabilities |

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16+)
*   npm (v8+)
*   MongoDB Instance (Atlas cloud or local installation)

### 1. Installation
Install root, client, and server dependencies concurrently using the root package utility:
```bash
npm run install-all
```

### 2. Environment Configurations
Create a `.env` file in the `server` directory based on the template:

**`server/.env`**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shopsphere
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### 3. Running the Application
Launch both the Vite development client and the Node/Express server concurrently:
```bash
npm run dev
```

*   **Frontend Client:** `http://localhost:5173`
*   **Backend API Server:** `http://localhost:5000`

---

## 📂 Project Structure

```text
ShopSphere/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable layout and ui components
│   │   ├── context/        # React context state (Auth, Theme, Cart, etc.)
│   │   ├── pages/          # Main page views (admin, vendor, customer)
│   │   └── services/       # Client API request layers
│   ├── index.html          # Vite entrypoint
│   └── vite.config.js      # Vite compilation configuration
├── server/                 # Express backend application
│   ├── config/             # Database and server configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Security and verification middleware
│   ├── models/             # Mongoose database schemas
│   ├── routes/             # API routing endpoints
│   └── server.js           # Server application startup
├── package.json            # Workspace execution script
└── README.md               # Main project documentation
```

---

## 🔒 Security Practices
*   **Helmet Headers:** Configures HTTP security headers to protect from standard cross-site scripting (XSS) and clickjacking attacks.
*   **Rate Limiting:** Stricter rate limits configured for authorization routes to mitigate brute-force password guess attacks.
*   **JWT Authentication:** Stateful user session replacement using cryptographically signed JSON Web Tokens.
