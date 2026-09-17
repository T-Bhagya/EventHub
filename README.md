# EventHub - Mobile Event Discovery and Booking Application

EventHub is a complete, cross-platform mobile application designed for event discovery, ticket booking, and event management. Built as a university Cross-Platform Application Development exercise, it features a modern React Native frontend powered by Expo Router and a Node.js REST API backend with Prisma ORM and SQLite database.

---

## 🌟 Key Features

### 👤 Normal User Features
- **Authentication**: Registration and login with role selection (`USER` vs `ORGANIZER`).
- **Event Discovery**: Personalized homepage ("Hello, {Name} 👋"), category horizontal selector, featured events, and upcoming events.
- **Search & Filter**: Search events by name, location, or description. Filter by categories (Music, Tech, Sports, Food, Art, etc.) with pull-to-refresh.
- **Event Details**: Comprehensive event info, seat availability counter, sold-out status, organizer details, and one-tap "Open in Maps" navigation.
- **Booking Flow**: Ticket quantity selector, backend total price calculation, contact pre-filling, seat availability checks, and unique booking reference generation (`EVH-XXXXXX`).
- **Booking Confirmation**: Dedicated confirmation screen with reference code and local device notification.
- **My Bookings**: Segmented tabs for **Upcoming** and **Previous** bookings with cancellation support (releasing seats back to availability).
- **Persisted Favourites**: Heart events to save in local device storage (`AsyncStorage`) across app restarts.
- **Profile Management**: View and edit user details (Name, Phone, Email) and logout.

### 🎪 Organizer Features
- **Organizer Dashboard**: Visual overview cards for Total Events, Upcoming Events, Total Bookings, and Total Tickets Reserved, plus Recent Events list.
- **My Events**: View created events with capacity breakdown (Total / Booked / Available seats).
- **Create Event**: Form with validation (future date, price, total capacity) and default placeholder images.
- **Edit Event**: Pre-filled update form with safety validation preventing reducing capacity below active booked seats.
- **Delete Event**: Action confirmation modal with safety guard protecting events with active bookings from accidental deletion.
- **Event Bookings Inspection**: View customer booking list for any event (Attendee name, email, phone, reference code, ticket quantity, and total paid).

---

## 🛠️ Technology Stack

### Mobile Frontend (`mobile/`)
- **React Native** & **Expo** (SDK 51)
- **Expo Router** (File-based navigation)
- **TypeScript**
- **Context API** (Authentication session & role management)
- **Axios** (REST API communication)
- **AsyncStorage** (JWT token and favourites persistence)
- **Expo Notifications** (Local booking confirmation & cancellation alerts)
- **Expo Vector Icons** (`Ionicons`)
- **React Native Safe Area Context**

### Backend Server (`server/`)
- **Node.js** & **Express.js**
- **TypeScript**
- **Prisma ORM**
- **SQLite Database** (`dev.db`)
- **bcryptjs** (Password hashing)
- **jsonwebtoken** (JWT authentication)
- **CORS & dotenv**

---

## 📁 Project Structure

```
EventHub/
├── server/                    # Express.js REST API Backend
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (User, Event, Booking)
│   │   └── seed.ts            # Database seed script
│   └── src/
│       ├── controllers/       # Auth, User, Event, Booking & Organizer controllers
│       ├── middleware/        # JWT Auth, Role verification, and Error handlers
│       ├── routes/            # Express route modules
│       ├── utils/             # Prisma instance, JWT & bcrypt helpers
│       ├── app.ts             # Express app setup
│       └── server.ts          # Server entry point (Port 5000)
│
└── mobile/                    # React Native Mobile App
    ├── app/                   # Expo Router file-based screens
    │   ├── _layout.tsx        # Root layout with AuthProvider & routing guard
    │   ├── (auth)/            # Login & Registration screens
    │   ├── (user)/            # User tabs (Home, Explore, Bookings, Favourites, Profile)
    │   ├── (organizer)/       # Organizer tabs (Dashboard, My Events, Create, Profile)
    │   ├── event/[id].tsx     # Event details screen
    │   ├── booking/           # Booking form, confirmation & single view screens
    │   └── organizer/         # Organizer event management & edit screens
    ├── components/            # Reusable UI components (EventCard, BookingCard, InputField, etc.)
    ├── contexts/              # AuthContext provider
    ├── services/              # Axios API service modules
    ├── storage/               # AsyncStorage utilities (Tokens, Favourites)
    ├── utils/                 # Date/Time formatters & Expo Notifications helper
    ├── constants/             # Design tokens & API configuration
    └── types/                 # Shared TypeScript interfaces
```

---

## 🔑 Test Account Credentials

The database comes pre-populated with seeded accounts and realistic Sri Lankan event data.

| Role | Email | Password | Full Name |
| :--- | :--- | :--- | :--- |
| **Normal User** | `user@eventhub.lk` | `password123` | Thilini Bhagya |
| **Normal User 2** | `user2@eventhub.lk` | `password123` | Kavindu Perera |
| **Organizer** | `organizer@eventhub.lk` | `password123` | Sri Lanka Events Ltd |
| **Organizer 2** | `organizer2@eventhub.lk` | `password123` | Colombo Tech Society |

---

## 🚀 Step-by-Step Installation & Running Guide

### 1. Prerequisite Requirements
- Node.js (v18.x or higher)
- npm or yarn
- Expo Go app on mobile device OR Android Emulator / iOS Simulator

---

### 2. Backend Setup (`server/`)

Open a terminal window and run:

```bash
cd server

# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Create SQLite database & run migrations
npx prisma migrate dev --name init

# 4. Seed database with test accounts & events
npm run seed

# 5. Start development REST API server
npm run dev
```

The backend server will run on **`http://localhost:5000/api`**.

---

### 3. Mobile Setup (`mobile/`)

Open a second terminal window and run:

```bash
cd mobile

# 1. Install dependencies
npm install

# 2. Start Expo Metro bundler
npx expo start
```

Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code with **Expo Go**.

---

### 🌐 Connecting Physical Devices or Emulators (API URL Configuration)

> [!IMPORTANT]
> - **Android Emulator**: `mobile/constants/api.ts` automatically maps `http://10.0.2.2:5000/api` to reach the host machine.
> - **Physical Phone (Expo Go)**: Physical mobile devices **cannot** connect to `localhost`. You must set your computer's local network IP in `mobile/.env` or when starting Expo:
>
> Create `mobile/.env`:
> ```env
> EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LOCAL_IP>:5000/api
> ```
> Example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api`

---

## 📡 REST API Summary

### Authentication & Users
- `POST /api/auth/register` - Register user or organizer account
- `POST /api/auth/login` - Authenticate & retrieve JWT token
- `GET /api/users/me` - Fetch logged-in user profile
- `PUT /api/users/me` - Update profile (Name, Phone, Email)

### Public Events
- `GET /api/events` - Get events list (Supports `?search=` and `?category=`)
- `GET /api/events/:id` - Get event details

### Bookings (Authenticated Users)
- `POST /api/bookings` - Create booking (Calculates price on backend, decrements seats atomically)
- `GET /api/bookings/my` - Fetch user's bookings list
- `GET /api/bookings/:id` - Fetch single booking details
- `PATCH /api/bookings/:id/cancel` - Cancel booking (Restores seats atomically)

### Organizer Endpoints (Protected by Organizer Role)
- `GET /api/organizer/dashboard` - Get organizer stats & recent events
- `GET /api/organizer/events` - Get events created by organizer
- `POST /api/organizer/events` - Create new event
- `GET /api/organizer/events/:id` - Get single organizer event
- `PUT /api/organizer/events/:id` - Edit event (Enforces seat capacity limits)
- `DELETE /api/organizer/events/:id` - Delete event (Blocked if active bookings exist)
- `GET /api/organizer/events/:id/bookings` - View customer bookings for an event

---

## 🛡️ Database Schema Overview (`Prisma / SQLite`)

- **`User`**: `id`, `name`, `email`, `phone`, `passwordHash`, `role` (`USER` | `ORGANIZER`), timestamps.
- **`Event`**: `id`, `title`, `imageUrl`, `description`, `date`, `time`, `location`, `category`, `price`, `totalSeats`, `availableSeats`, `organizerId`, timestamps.
- **`Booking`**: `id`, `bookingReference`, `userId`, `eventId`, `ticketQuantity`, `totalPrice`, `phone`, `note`, `status` (`CONFIRMED` | `CANCELLED` | `COMPLETED`), timestamps.

---

## 💡 Key Design Assumptions
1. **Seat Availability Integrity**: Seat decrements and increments are executed inside Prisma database transactions (`$transaction`) to guarantee data accuracy.
2. **Pricing Verification**: Frontend total price calculation is purely for user UI feedback; the backend independently calculates `totalPrice = event.price * ticketQuantity` to avoid client tampering.
3. **No Payment Gateway**: In accordance with project instructions, real bank/Stripe payment gateways are omitted for simplicity in this university exercise.
