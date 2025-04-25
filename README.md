# Lyht Notes

## Overview
Lyht Notes is a **collaborative, cross-platform** notetaking application. Built with **React, Electron, TipTap, and Supabase**, the application supports structured collaboration, AI-assisted features, and flexible notetaking.

## Requirements
Ensure the following dependencies are installed before running the project:
- **Node.js** (Latest LTS recommended)
- **npm** or **yarn**
- **Electron**
- **Supabase** (configured with your project settings)


Then install dependencies
npm install

Running the Project
Start the development server with Electron and React:
npm run dev


Running Individual Components
- Start React (Frontend):npm run dev:react

- Start Electron (Backend):npm run dev:electron


Building the Application
Create a production-ready build:
npm run build

Packaging for Different Platforms
- macOS (ARM64):npm run dist:mac

- Windows (x64):npm run dist:win

- Linux (x64):npm run dist:linux


Linting & Code Quality
Ensure code quality before committing changes:
npm run lint


Preview the Built Application
To test the production build locally:
npm run preview

