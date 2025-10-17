# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)).
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# BloomUP Frontend

- Stack: React + Vite + React Router + TailwindCSS
- Purpose: Auth flows, Family Setup, Dashboard

## Architecture

- `src/main.jsx`: App bootstrap
- `src/App.jsx`: Route definitions
- `src/components/AuthGuard.jsx`: Auth check + redirect logic
- `src/layout/DashboardLayout.jsx`: App shell with `Sidebar`
- `src/components/Sidebar.jsx`: Shows family name or user name
- `src/pages/*`: Feature pages (Login, Signup, FamilySetup, AddChild, Budget, etc.)

## Redirect Rules

- On load, `AuthGuard` fetches `/api/auth/me` with token
- If token invalid → redirect to `/login`
- If user has 0 children → redirect to `/family-setup`
- Else → redirect to `/dashboard`

## Family Setup

- Loads current user and children from backend
- Pencil button navigates to `AddChild` in edit mode with child data

## Add Child

- Add mode: `POST /api/users/:userId/children`
- Edit mode: `PUT /api/users/:userId/children/:childId`
- Uses `medicalHistory` field; age is displayed via DOB but stored by backend

## Dependencies

- runtime: `react`, `react-dom`, `react-router-dom`
- dev: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `eslint`
