42 Events Platform
A comprehensive event management platform built for the 42 community. This application allows users to browse, register for, and manage events.

Project info
URL: https://lovable.dev/projects/02b6130a-874f-4bd1-ae15-1b26703b06f9 # 42hub.space

Features
User authentication with 42 OAuth and email/password
Event browsing with multiple views (list, calendar, map)
Event filtering by category, location, and tags
User dashboard with event subscriptions and favorites
Real-time event updates
Admin panel for managing events and users
Authentication
Test Credentials
You can use the following credentials for testing:

Superadmin

Email: superadmin@example.com
Password: SuperAdmin123!
Admin

Email: admin@example.com
Password: Admin123!
Regular User

Email: user@example.com
Password: User123!
Authentication Methods
42 OAuth: Click the 42 logo button on the login page
Email/Password: Use the email and password fields on the login page
Deployment
This project can be easily deployed through Lovable. Simply click on Share -> Publish in the Lovable interface.

Local Development
If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - install with nvm

Follow these steps:

# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
Technologies Used
This project is built with:

Vite
TypeScript
React
React Router
shadcn-ui
Tailwind CSS
Supabase (Database, Authentication, Realtime)
Leaflet (Map View)
Recharts (Dashboard)
Environment Variables
The project uses the following environment variables:

VITE_42_CLIENT_ID: Client ID for 42 OAuth authentication
