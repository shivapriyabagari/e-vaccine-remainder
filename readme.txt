E-Vaccine Reminder
==================

This application helps a parent manage child profiles, vaccine reminders, and
optional email and WhatsApp notifications. It is an organizer only; it does not
calculate a medical vaccine schedule. Confirm dates with a qualified healthcare
professional and local public-health guidance.

Requirements
------------
- Node.js 20 or newer
- MongoDB (local or hosted)
- Email SMTP credentials for email delivery
- WhatsApp Business Cloud API credentials and an approved message template for
  WhatsApp delivery

Backend setup
-------------
1. Open a terminal in back_end.
2. Install dependencies with: npm install
3. Copy .env.example to .env and set MONGODB_URI and a long random JWT_SECRET.
4. Configure EMAIL_USER and EMAIL_PASS for Gmail, or configure SMTP_HOST,
   SMTP_PORT, SMTP_SECURE, EMAIL_USER, and EMAIL_PASS for another SMTP server.
5. To enable WhatsApp, set WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID,
   WHATSAPP_TEMPLATE_NAME, and the template language. The approved template
   must contain three body parameters in this order: child name, vaccine name,
   and due date.
6. Start the server with: npm run dev

The API listens on http://localhost:5000 by default. It seeds a basic vaccine
catalog when the database has no vaccine records. Vaccine dates and age
recommendations are intentionally not prescribed by the application.

Frontend setup
--------------
1. Open a second terminal in front_end.
2. Install dependencies with: npm install
3. Optionally copy .env.example to .env and set VITE_API_URL.
4. Start the development server with: npm run dev

Open the URL printed by Vite (normally http://localhost:5173). Register an
account, add a child, create a reminder, and select email and/or WhatsApp in
delivery settings. Reminders are scheduled by the backend once per day, by
default at 09:00 server local time, for dates one day ahead. Set
REMINDER_DAYS_BEFORE or REMINDER_CRON in the backend environment to customize.
The Send now button can be used to test a configured delivery channel.

API summary
-----------
- POST /api/auth/register and POST /api/auth/login
- GET /api/auth/me and PUT /api/auth/me
- GET /api/children and child create/read/update/delete routes (authenticated)
- GET /api/vaccines and GET /api/vaccines/:id
- GET /api/reminders and reminder create/update/delete/send routes (authenticated)
- GET /api/health

Passwords are hashed, account data is scoped to the signed-in user, and vaccine
catalog changes require an administrator account. New registrations are normal
user accounts; an administrator must be provisioned directly in MongoDB.

Checks
------
- Backend: npm test
- Frontend: npm run lint
- Frontend production build: npm run build
