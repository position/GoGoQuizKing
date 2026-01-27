# GoGoQuizKing Project Gemini Guide

This document provides guidance for Gemini to effectively assist with the development of the GoGoQuizKing project.

## 1. Project Overview

GoGoQuizKing is a real-time quiz application built with Nuxt.js and Supabase. It currently features user authentication and a notice board.

## 2. Tech Stack

- **Framework**: [Nuxt.js](https://nuxt.com/) v3
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [Quasar](https://quasar.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Backend & Database**: [Supabase](https://supabase.com/)
- **Styling**: SCSS/Sass
- **Linting/Formatting**: ESLint, Prettier

## 3. Important Commands

- **Development Server**: `yarn dev`
- **Production Build**: `yarn build`
- **Static Generation**: `yarn generate`
- **Build Preview**: `yarn preview`

## 4. Folder Structure & Conventions

- **`api/`**: Contains server-side API endpoints, typically for communicating with external services.
- **`assets/`**: Static assets like global SCSS files.
- **`components/`**: Reusable Vue components, organized by feature (e.g., `auth`, `notice`, `quiz`).
- **`composables/`**: Reusable Vue composables. `use-supabase.ts` is the central point for Supabase client interaction.
- **`helper/`**: General utility functions that are not specific to Vue or Nuxt.
- **`middleware/`**: Nuxt middleware. `auth-guard.global.ts` is used for protecting routes.
- **`models/`**: TypeScript type definitions and interfaces for data structures.
- **`pages/`**: Application pages. The file structure here defines the app's routes.
- **`plugins/`**: Nuxt plugins for integrating libraries or running code on app initialization.
- **`store/`**: Pinia store modules for global state management (e.g., `auth.store.ts`).

## 5. Coding Style & Conventions

- **Component Naming**: Use PascalCase for Vue component file names (e.g., `NoticeList.vue`).
- **Composables Naming**: Use camelCase with a `use` prefix (e.g., `useSupabase`).
- **API Calls**: Use the composables and stores provided. Avoid direct API calls from components when possible.
- **State Management**: For global state, use the Pinia stores in the `store/` directory.
- **Styling**: Adhere to the existing SCSS structure and variables in `assets/scss/`.
