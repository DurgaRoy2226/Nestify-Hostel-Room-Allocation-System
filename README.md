# Nestify - Hostel Room Allocation System

A complete MERN stack application for managing hostel room allocations with a modern glassmorphism UI.

## Project Structure

```
Final-Nestify/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── ...
│   └── ...
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── ...
└── README.md
```

## Features

- **Authentication**: Secure signup and login with JWT
- **Role-based Access**: Admin and Student roles with different permissions
- **Room Management**: Create, update, delete rooms (Admin only)
- **Student Management**: Manage student records (Admin only)
- **Room Allocation**: Allocate/deallocate rooms to students (Admin only)
- **Dashboard**: Overview of hostel statistics
- **Responsive Design**: Works on all device sizes
- **Modern UI**: Glassmorphism design with dark theme

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Axios for API requests
- React Router for navigation
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage

1. Start both the frontend and backend servers
2. Open your browser and go to `http://localhost:3000`
3. Sign up as an admin or student
4. Log in to access the dashboard

### Default Roles
- **Admin**: Full access to all features
- **Student**: View-only access to assigned room information

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Students (Protected)
- `GET /api/students` - Get all students
- `POST /api/students` - Create a new student (Admin only)
- `PUT /api/students/:id` - Update a student (Admin only)
- `DELETE /api/students/:id` - Delete a student (Admin only)
- `PATCH /api/students/:id/allocate/:roomId` - Allocate room to student (Admin only)
- `PATCH /api/students/:id/deallocate` - Deallocate room from student (Admin only)

### Rooms (Protected)
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create a new room (Admin only)
- `PUT /api/rooms/:id` - Update a room (Admin only)
- `DELETE /api/rooms/:id` - Delete a room (Admin only)

## Development

To modify the application:

1. Backend changes: Modify files in the `backend/` directory
2. Frontend changes: Modify files in the `Frontend/src/` directory
3. Styling: Use Tailwind CSS classes in component files

## Deployment

### Backend
Deploy the backend to a Node.js hosting service (e.g., Heroku, Render, AWS Elastic Beanstalk).

### Frontend
Build the frontend and deploy the static files:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.