# VitalSync - Healthcare Healthcare Dashboard

## Project Overview

VitalSync is a modern frontend healthcare dashboard designed to help patients and doctors manage appointments, medical history, and clinical workflows in a responsive web experience.

This application is built as a **frontend-first project** with strong emphasis on user interface quality, state-driven interaction, and mock data simulation. The current implementation showcases a professional patient portal and doctor portal with appointment lifecycle support.

## Figma Design Link
(https://www.figma.com/design/xgns946LVP2ube8qd1jrI6/Untitled?m=auto&t=Vu5Nnyey2iqIaFBu-6)

## Track

**Frontend**

This repository is focused on implementing a complete frontend solution using Next.js, Tailwind CSS, and React state management. The project prioritizes interface fidelity, user experience, and frontend engineering practices.

## Tech Stack

- **Next.js 14** - App Router, client and server components, routing, and build optimizations.
- **React 18** - Component-based UI, hooks, and modern frontend architecture.
- **Tailwind CSS** - Utility-first styling with responsive design support.
- **Lucide React** - Icon library for consistent UI visuals.
- **React Context API** - Global state management for role, profile, and appointment data.
- **JavaScript ES6+** - Clean, modern JavaScript syntax.
- **npm** - Dependency management.
- **PostCSS** - CSS processing for Tailwind.

## Project Description

VitalSync is a healthcare management dashboard that supports both patient and doctor workflows. The system allows a patient to select a profile, book appointments, view appointment status, review medical history, and see active prescriptions. On the doctor side, it allows appointment approval, status updates, patient overview, and scheduling controls.

The application is designed to be a polished frontend experience with the following goals:

- Deliver a meaningful healthcare workflow in a browser.
- Provide a reliable and intuitive appointment booking flow.
- Offer a clear status lifecycle for appointments.
- Support modern responsive design and interaction.
- Demonstrate advanced component and layout design.

## Core Features

### 1. Booking and Appointment Tracking

- Patient booking wizard with multi-step flow.
- Appointment status lifecycle: pending, scheduled, completed, cancelled.
- Doctor approval and rejection actions.
- Appointment review and confirmation screens.
- Status badges with color coding for clear feedback.

### 2. Patient Portal Experience

- Patient dashboard with summary statistics.
- Appointment list with filtering by status.
- Medical history timeline for past events.
- Prescriptions list and status tracking.
- Find doctors and view doctor details.

### 3. Doctor Portal Experience

- Doctor dashboard with overview cards.
- Doctor appointment list with patient information.
- Approve, reject, and complete appointment actions.
- Patient list and availability management section.
- Role-based doctor interface.

### 4. Shared Frontend Functionality

- Global AppContext for user and appointment state.
- Mock data layer to drive the frontend demo.
- Responsive layout and mobile-first styling.
- Accessible controls and semantic layout.
- Clean navigation and route structure.

## Commands

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Optional Cleanup

```bash
rm -rf node_modules .next package-lock.json
npm install
```

### Alternative Port Run

```bash
npm run dev -- -p 3001
```

## Pages and Routes

This application contains the following routes and pages:

- `/` - Landing page and introduction.
- `/select-profile` - Role selection screen for Patient or Doctor.
- `/patient/dashboard` - Patient home dashboard.
- `/patient/appointments` - Patient appointment viewer and booking panel.
- `/patient/book-appointment` - Standalone booking wizard.
- `/patient/history` - Medical history timeline.
- `/patient/prescriptions` - Prescriptions overview.
- `/patient/find-doctors` - Doctor discovery page.
- `/doctor/dashboard` - Doctor home dashboard.
- `/doctor/appointments` - Doctor appointment management.
- `/doctor/patients` - Doctor patient roster.
- `/doctor/availability` - Doctor availability and schedule.

## How It Works

The UI is divided into two main experiences:

### Patient Workflow

1. The user selects Patient on the profile selection screen.
2. The patient views the dashboard with health overview cards.
3. The patient navigates to appointments and opens the booking form.
4. The patient selects a doctor, date, time, type, and optional notes.
5. The patient confirms the booking and receives a pending approval status.
6. The patient can review the appointment status from the list.

### Doctor Workflow

1. The user selects Doctor on profile selection.
2. The doctor sees the dashboard and upcoming appointments.
3. The doctor reviews pending appointments.
4. The doctor approves or rejects pending requests.
5. Approved appointments move to scheduled status.
6. The doctor may mark a scheduled appointment as completed.

## Data Architecture

The project uses a mock data layer located in `lib/mockData.js`. The mock data includes:

- Doctors
- Patients
- Appointments
- Medical history
- Prescriptions

App state is persisted in memory using React Context. This allows the application to simulate real workflows without a backend.

## State Management

### AppContext

The central application context stores:

- `role` - The current selected role.
- `currentDoctor` - The active doctor profile.
- `currentPatient` - The active patient profile.
- `appointments` - The appointments array.
- `bookAppointment()` - Function to create a pending appointment.
- `updateAppointmentStatus()` - Function to change appointment status.

This context is provided at the application root and consumed by patient and doctor pages.

## User Interface

The UI uses Tailwind CSS for modular styling and responsive layout. Key interface patterns include:

- Card-based layout for dashboard elements.
- Tabs and filters for appointment management.
- Status badges for quick visual feedback.
- Wizard stepper for booking appointments.
- Responsive navigation menus for mobile and desktop.
- Iconography using Lucide icons.

## Component Design

The application structure is divided into reusable components and feature pages. Components are designed with the following principles:

- Single responsibility.
- Clear separation between layout and content.
- Reusable style patterns.
- Minimal prop drilling through context usage.
- Accessible interactive elements.

## Styling Pattern

Tailwind CSS is used for styling. The style methodology includes:

- Utility-first classes for spacing, typography, and layout.
- Consistent color palette for branding and status states.
- Responsive prefixes for mobile-first design.
- Component-level style consistency.
- Custom classes only where needed in global styles.

## Performance Considerations

The project is optimized for frontend performance with these practices:

- Route-based code splitting with Next.js.
- Utility CSS compilation with Tailwind.
- Minimal JavaScript bundling for visible pages.
- Client rendering on key interactive pages.
- Clean component hierarchies.

## Accessibility

Accessibility is a priority in this frontend implementation. The application includes:

- Semantic HTML elements.
- Keyboard-accessible buttons.
- Focus states for interactive controls.
- Descriptive text for status badges.
- Clear form labels and field grouping.
- Responsive touch targets for mobile.

## Project Structure

The folder layout is organized by feature:

- `app/` - Next.js application pages and layouts.
- `app/patient/` - Patient pages and subroutes.
- `app/doctor/` - Doctor pages and subroutes.
- `app/select-profile/` - Profile selection screen.
- `lib/` - Application data and context.
- `public/` - Static assets.
- `styles/` - Global styles if used.

The structure supports clean separation of views and feature areas.

## Mock Data Schema

### Doctor Object

Each doctor object contains:

- `id`
- `name`
- `specialty`
- `photo`
- `available`
- `rating`
- `experience`
- `hospital`
- `department`
- `nextAvailable`
- `slots`
- `bio`
- `patients`

### Patient Object

Each patient object contains:

- `id`
- `name`
- `age`
- `gender`
- `bloodType`
- `photo`
- `conditions`
- `allergies`
- `phone`
- `email`
- `address`
- `emergencyContact`
- `lastVisit`
- `weight`
- `height`

### Appointment Object

Each appointment object contains:

- `id`
- `patientId`
- `doctorId`
- `date`
- `time`
- `status`
- `type`
- `notes`
- `location`

### Appointment Statuses

The system currently supports:

- `pending` - Waiting for doctor approval.
- `scheduled` - Approved and confirmed.
- `completed` - Appointment finished.
- `cancelled` - Declined or removed.

## Core Feature Roadmap

### Core Feature 1: Booking Flow

- Stepper wizard to book a doctor appointment.
- Doctor selection page.
- Date and time selection.
- Appointment type selection.
- Notes submission.
- Review and confirm screen.
- Pending status and doctor review.

### Core Feature 2: Appointment Status

- Patient side appointment status display.
- Doctor side action buttons for status changes.
- Filter by status categories.
- Color-coded status badges.
- Status descriptions for clarity.

### Core Feature 3: Patient Dashboard

- Health summary with quick insights.
- Upcoming appointment count.
- Active prescription count.
- Alerts and reminders for health conditions.

### Core Feature 4: Medical History

- Timeline view of patient history.
- Event types such as visit, lab, procedure.
- Filter and search by event type.
- Doctor attribution and notes.

### Core Feature 5: Prescriptions

- Medication list for patient.
- Status tracking for each prescription.
- Display prescriber and dosage information.
- Filter by active, expired, or filled status.

### Core Feature 6: Doctor Management

- Doctor dashboard overview.
- Appointments list and status control.
- Patient details and contact.
- Availability management page.
- Schedule and profile display.

## Feature Prioritization

The current implementation is focused on frontend MVP features. Features are prioritized by user impact and frontend feasibility.

### MVP Features

- Role-based patient and doctor landing.
- Appointment booking and approval.
- Appointment status lifecycle.
- Patient dashboard summary.
- Doctor appointment actions.
- Responsive design and interactive UI.

### Planned Enhancements

- Calendar interface.
- Dark mode.
- Advanced search and filtering.
- In-app messaging.
- Export and reporting tools.
- Theme customization.

### Future Backend Features

- Real user authentication.
- Database integration.
- Persistent storage for appointments.
- Secure API endpoints.
- Notifications and reminders.

## State Tree Diagram

The following diagrams illustrate the global state structure (using React Context as the store) and the mock API endpoints planned for future backend integration.

### Global State Store Structure

```mermaid
graph TD
    A[Global State Store<br/>(React Context)] --> B[role<br/>string: null | 'patient' | 'doctor']
    A --> C[currentDoctor<br/>object: {id, name, specialty, ...}]
    A --> D[currentPatient<br/>object: {id, name, age, gender, ...}]
    A --> E[appointments<br/>array: [{id, patientId, doctorId, ...}]]
    A --> F[bookAppointment()<br/>function: adds new appointment]
    A --> G[updateAppointmentStatus()<br/>function: updates appointment status]
    A --> H[setRole()<br/>function]
    A --> I[setCurrentDoctor()<br/>function]
    A --> J[setCurrentPatient()<br/>function]
    A --> K[logout()<br/>function: resets state]
```

### Mock API Endpoints

```mermaid
graph TD
    API[Mock API Endpoints<br/>(Frontend Simulation)] --> GET1[GET /api/doctors<br/>Returns doctors array]
    API --> GET2[GET /api/patients<br/>Returns patients array]
    API --> GET3[GET /api/appointments<br/>Returns appointments array]
    API --> GET4[GET /api/medical-history<br/>Returns medical history array]
    API --> GET5[GET /api/prescriptions<br/>Returns prescriptions array]
    API --> POST1[POST /api/appointments<br/>Creates new appointment]
    API --> PATCH1[PATCH /api/appointments/:id<br/>Updates appointment status]
    API --> POST2[POST /api/auth/login<br/>Simulates login]
    API --> GET6[GET /api/auth/me<br/>Returns current user profile]
```

## Deployment Commands

### Run Locally

```bash
npm run dev
```

### Build Production

```bash
npm run build
```

### Serve Production

```bash
npm start
```

### Package Cleanup

```bash
rm -rf node_modules .next package-lock.json
npm install
```

## Troubleshooting

### Port in Use

If port 3000 is busy:

```bash
npm run dev -- -p 3001
```

### Dependency Issues

If install fails:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

If build fails:

```bash
npm run build
```

Inspect error messages and fix imports or syntax issues.

### No Hot Reload

If dev server does not refresh:

```bash
rm -rf .next
npm run dev
```

## Development Notes

- The current repository is frontend-only.
- Mock data drives the application state.
- No backend is required for current features.
- Global state is managed with React Context.
- App can be extended to API integration later.

## Recommendations for Extension

### Add Authentication

Add a login form and token-based authentication.

### Add Persistence

Connect appointments to a backend database.

### Add Notifications

Add in-app alerts and email reminders.

### Add Calendar

Provide a visual calendar for scheduling.

## API Plan

For future backend integration, these endpoints are proposed:

- `GET /api/auth/me`
- `POST /api/auth/login`
- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/:id`
- `GET /api/patients`
- `GET /api/doctors`

## Git Workflow

### Branch Strategy

- `main` for stable production-ready code.
- `feature/*` for new feature development.
- `fix/*` for bug fixes.
- `docs/*` for documentation changes.

### Commit Style

- `feat: Add appointment booking`
- `fix: Resolve booking form bug`
- `docs: Update README`
- `refactor: Simplify appointment state`
- `test: Add context tests`

### Pull Request Checklist

- [ ] Code builds successfully.
- [ ] No console warnings.
- [ ] Responsive UI verified.
- [ ] Component behavior tested.
- [ ] Documentation updated.

## Acknowledgments

This frontend project is built with the following technologies:

- Next.js
- React
- Tailwind CSS
- Lucide React
- npm

## License

MIT License

Copyright 2026

---

## Appendix

### Design Principles

- Clarity over complexity: keep pages simple and easy to read.
- Consistency: use consistent spacing, card styles, and button patterns.
- Predictability: UI actions should behave as expected.
- Feedback: provide clear success and error messages.
- Responsiveness: design for phones first, then larger screens.
- Accessibility: support keyboard navigation and screen readers.

### UX Principles

- Make tasks obvious and easy to start.
- Use simple labels and avoid jargon.
- Keep interaction flows short and clear.
- Show progression for multi-step processes.
- Prioritize primary actions on each screen.
- Avoid overwhelming users with too much data at once.

### Frontend Development Practices

- Keep components small and reusable.
- Separate layout from data logic.
- Use hooks for stateful behavior.
- Avoid deeply nested state when possible.
- Use descriptive variable names.
- Keep CSS utility classes readable and maintainable.

### Accessibility Checklist

- All buttons should be focusable.
- Links and buttons must have visible focus states.
- Forms should use labels for fields.
- Color contrast should support text legibility.
- Provide alternate text for images.
- Ensure page sections are structured with headings.

### File & Folder Conventions

- Use kebab-case for page and route folders.
- Use camelCase for component filenames when relevant.
- Keep data helpers in `lib/`.
- Keep shared state in a single context file.
- Place page-level styles in global or layout files.
- Avoid mixing feature responsibilities in one file.

### Example Usage Scenarios

- A patient books a follow-up appointment with a cardiologist.
- A doctor reviews pending appointment requests on the dashboard.
- A patient checks prescription status before a visit.
- A doctor marks a visit as completed after consultation.
- A patient reviews historical lab events from the timeline.
- A doctor updates available appointment slots for next week.

### Readme Maintenance Notes

- Update `README.md` whenever a new major feature is added.
- Keep route listings and command examples current.
- Document any new public API or configuration changes.
- Keep the tech stack section aligned with package versions.
- Add release notes when a new version is deployed.
- Review line count and readability periodically.

### Project Estimation Notes

- Current frontend MVP is complete and demo-ready.
- Future integration work will require backend API design.
- Adding persistence will shift the architecture.
- Real authentication will add separate login components.
- Notifications and calendar views will require new pages.
- Extended analytics will require data modeling and charts.

### Final Notes

This README serves as the product requirements document for the frontend implementation. It describes the current design, the shape of the application, the commands required to run it, and the future growth plan. The project is ready for development review and further frontend refinement.

