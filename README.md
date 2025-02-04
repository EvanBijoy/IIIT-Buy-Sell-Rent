# Buy-Sell @ IIITH

## Overview
Buy-Sell @ IIITH is a dedicated marketplace for the IIIT community, allowing users to buy and sell items seamlessly without incurring external platform taxes. Built using the MERN stack, the platform ensures secure authentication via IIIT's CAS authentication system, supports seamless transactions, and enhances user experience with a chatbot.

## Tech Stack
- **Frontend:** React with Mantine UI
- **Backend:** Express.js with Node.js
- **Database:** MongoDB
- **Authentication:** CAS Authentication & JWT
- **Styling:** Tailwind CSS & Mantine
- **Chatbot:** Kommunicate.io integration for AI-driven customer support

## Features
### Authentication & Authorization
- CAS-based login for IIIT users
- JWT-based authentication for session persistence
- Google reCAPTCHA for enhanced security

### User Roles
- Users can act as both Buyers and Sellers
- Profile page to manage user details
- Passwords stored securely using bcrypt hashing

### Item Management
- Sellers can list items with name, price, category, and description
- Buyers can search and filter items based on categories
- Item-specific pages with detailed descriptions

### Cart & Orders
- Add items to the cart
- Proceed to checkout with secure OTP-based transaction closure
- Order history with separate tabs for pending and completed transactions
- Sellers can manage received orders and process deliveries

### Chatbot Support
- Integrated Kommunicate.io chatbot for automated query resolution
- AI-driven responses similar to e-commerce support systems

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- Node.js (v18+)
- MongoDB (local or cloud instance)

### Steps to Run
#### 1. Clone the Repository
```sh
git clone https://github.com/your-repo/buy-sell-iiith.git
cd buy-sell-iiith
```
#### 2. Setup Backend
```sh
cd backend
npm install
```
Change the URIs and secrets in the code and try getting it into a .env
```
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
CAS_BASE_URL=https://login.iiit.ac.in/cas
```
Start the backend server:
```sh
npm run dev
```
#### 3. Setup Frontend
```sh
cd ../frontend
npm install
```
Start the frontend server:
```sh
npm run dev
```

## API Endpoints
### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/cas-auth` - CAS authentication

### Items
- `GET /api/items` - Fetch all items
- `POST /api/item/add` - Add a new item
- `GET /api/item/:id` - Get item details

### Orders
- `POST /api/orders` - Place an order
- `GET /api/orders` - Fetch user orders
- `POST /api/orders/validate-otp` - Validate OTP to complete transaction

## Deployment
- Frontend: Vercel / Netlify
- Backend: Render / AWS / DigitalOcean
- Database: MongoDB Atlas

## Folder Structure
```
<roll_no>/
├── backend/
│   ├── package.json
│   ├── src/
│   ├── .env
│   ├── ...
├── frontend/
│   ├── package.json
│   ├── src/
│   ├── .env
│   ├── ...
└── README.md
```

## Future Enhancements
- Payment gateway integration
- Wishlist feature
- Enhanced AI chatbot with conversational memory
- Modularise the code and use .env
