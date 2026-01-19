# Eleryan Management System

## Project Overview
Eleryan Management System is a comprehensive, local-first web application designed to streamline field service operations. It enables efficient tracking of installation and maintenance cases, manages technician workflows, and provides real-time analytics for decision-makers.

Built to be robust and offline-capable, this application leverages a **Local-First Architecture** ensuring zero latency and continuous operation even without an internet connection.

## Key Features
*   ** Interactive Dashboard**: Visual analytics using Recharts to track case volumes, technician performance, and operational trends.
*   ** Case Management**: Full CRUD capabilities for Installation and Maintenance orders with advanced filtering and search.
*   ** Role-Based Access Control (RBAC)**: secure environment with granular permissions for Admins, Supervisors, and Users.
*   ** offline-First Reliability**: Powered by IndexedDB (Dexie.js), ensuring data persistence and instant load times.
*   ** Responsive Design**: A modern, mobile-friendly interface built with TailwindCSS and Framer Motion.

## Technical Highlights
*   **Architecture**: Client-Side "Local-First" Application (Serverless).
*   **Frontend**: React 19, Vite, TailwindCSS (Utility-first styling).
*   **Data Layer**: Dexie.js (Wrapper for IndexedDB) for complex local querying.
*   **Visualization**: Recharts for dynamic data plotting.
*   **Security**: Client-side session management with protected routes and role guards.

## Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/eleryan-management.git
    cd Managment-system
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the application**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

## Demo Credentials
To explore the full capabilities of the system, use the provided Admin account:

*   **Email**: `mostafa@elryan.com`
*   **Password**: `1111`

> **Note**: This is a "Local-First" application. On first load, the database will automatically seed with sample data for demonstration purposes.

---
*Built with ❤️ for Technical Excellence.*
