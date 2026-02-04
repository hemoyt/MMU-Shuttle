# MMU Shuttle System (MVP)

A comprehensive web application for managing the Multimedia University (MMU) Cyberjaya shuttle bus service. The system connects Students, Drivers, and Transport Coordinators in real-time.

## 🚀 Key Features

*   **Real-Time Bus Tracking**: Students can see the live location of shuttle buses on an interactive map.
*   **Digital Booking System**: Students can view schedules, select pickup points, and book seats. A digital "Boarding Pass" is generated upon confirmation.
*   **Role-Based Access**:
    *   **Student**: Book rides, view live map, receive notifications.
    *   **Driver**: Share live location, report incidents (traffic, breakdown), view assigned routes.
    *   **Coordinator/Admin**: View dashboard statistics, send system-wide notifications, manage incidents.
*   **Incident Reporting**: Drivers can instantly report delays or accidents, triggering real-time alerts to all users.
*   **Notification System**: Admins can push alerts to specific user groups.

## 🛠 Tech Stack

*   **Frontend**: HTML5, JavaScript (ES6+), Tailwind CSS (Styling), Leaflet.js (Maps).
*   **Backend**: Node.js, Express.js, Socket.IO (Real-time events).
*   **Database**: SQLite (Development) / PostgreSQL (Production ready) with Sequelize ORM.
*   **Authentication**: JWT (JSON Web Tokens).

## 📥 Installation & Setup

1.  **Prerequisites**: Ensure you have Node.js installed.

2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    node seed.js  # (Optional) Resets database with demo data
    node index.js # Starts server on http://localhost:3000
    ```

3.  **Setup Frontend**:
    ```bash
    cd frontend
    npx -y serve -l 8080 . # Starts frontend on http://localhost:8080
    ```

## 🔐 Demo Credentials

Use the **"Quick Access"** buttons on the login screen or these credentials:

| Role | Email | Password | Capability |
| :--- | :--- | :--- | :--- |
| **Student** | `student@mmu.edu.my` | `student123` | Book rides, View Map |
| **Driver** | `driver@mmu.edu.my` | `driver123` | Share Location, Report Incident |
| **Coord** | `coord@mmu.edu.my` | `coord123` | View Stats, Send Alerts |
| **Admin** | `admin@mmu.edu.my` | `admin123` | Full Access |
