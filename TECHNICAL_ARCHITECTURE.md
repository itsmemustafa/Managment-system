# Technical Architecture & System Design

## 1. High-Level Architecture
The Eleryan Management System is architected as a **Local-First Single Page Application (SPA)**. Instead of relying on a traditional REST API + Database server model, it utilizes the browser's **IndexedDB** as its primary data store. This approach offers significant performance benefits (zero network latency for data) and offline capabilities.

### System Components:
*   **Presentation Layer**: React (UI), TailwindCSS (Styling), Framer Motion (Animations).
*   **Logic Layer**: React Hooks & Contexts for state management.
*   **Data Abstraction Layer**: `dbService.js` acting as a pseudo-backend controller.
*   **Persistence Layer**: Dexie.js managing IndexedDB.

## 2. Directory Structure & Organization
```
src/
├── components/       # Reusable UI components (Buttons, Layouts, Guards)
├── db/              # Database Configuration & Services
│   ├── db.js        # Dexie Schema definition
│   ├── dbService.js # API-like methods (get, add, update)
│   └── initDB.js    # Data seeding logic
├── pages/           # Application Views (Screens)
│   ├── Charts/      # Analytics sub-views
│   └── ...          # Feature-specific pages (Installations, Users)
├── Utils/           # Helper functions (Auth helpers, data formatting)
├── App.jsx          # Root component & Routing configuration
└── main.jsx         # Entry point
```

## 3. Data Flow

### Backend Logic (Client-Side)
Although this is a frontend-only app, it follows a structured "backend" pattern internally:
1.  **Request**: A React component calls a function from `dbService.js` (e.g., `getAllInstallations()`).
2.  **Processing**: The service handles the request, performing any necessary data transformation or validation.
3.  **Query**: Dexie.js translates the request into an IndexedDB transaction.
4.  **Response**: Data is returned asynchronously to the component.

### Data Seeding Lifecycle
1.  App mount (`App.jsx`).
2.  Calls `initializeDB()`.
3.  Checks record counts in IndexedDB.
4.  If empty, loads JSON fixtures from `src/data/` and bulk-inserts them into the local database (Normalization ensures consistent data structure).

## 4. Authentication & Authorization
The system implements a secure-by-design approach for client-side routing.

*   **Authentication Flow**:
    1.  User submits credentials on login page.
    2.  `getUserByEmail()` verifies against the `users` table in IndexedDB.
    3.  Success -> User object is serialized and stored in `localStorage` ("currentUser").
    4.  App redirects to dashboard.

*   **Authorization (RBAC)**:
    *   **RoleGuard Component**: Wraps protected routes.
    *   Reads `currentUser` from storage.
    *   Verifies if `user.role` matches the `allowed` prop (e.g., `['ADMIN', 'SUPERVISOR']`).
    *   Redirects unauthorized access attempts to the Login page.

## 5. Data Models
The database schema is defined in `db.js` using Dexie syntax:

*   **InstallationCases**: Tracks field installations (`orderNumber`, `customerName`, `device`, `date`).
*   **MaintenanceCases**: Tracks repairs and service calls (`deviceTypeCode`, `defectDescription`, `status`).
*   **Users**: System access accounts (`email`, `password`, `role`: ADMIN/SUPERVISOR/USER).
*   **Brands / DeviceTypes / Governorates**: Lookup tables for standardizing data entry.

## 6. Key Design Decisions
*   **Why IndexedDB?**
    *   Eliminates the complexity and cost of a hosted backend for this scale.
    *   Provides instant feedback to the user.
    *   Ideally suited for internal tools where data can be synchronized or exported later.
*   **Why TailwindCSS?**
    *   Rapid UI development with a consistent design system.
    *   High performance (no runtime style generation).
*   **Modular "Service" Layer**:
    *   Even though the DB is local, all DB calls are encapsulated in `dbService.js`. This decoupling allows for replacing IndexedDB with a real REST API in the future without rewriting the UI components.
