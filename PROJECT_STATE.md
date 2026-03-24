# Colab SaaS: "The Editorial Authority" - Project Context Summary

## 1. Project Overview & Aesthetic
This project is a premium, B2B SaaS platform for creator-brand deal tracking and management, themed as **"The Editorial Authority."** The design system prioritizes a clean, high-end "Atelier" look, ditching flashy neon for a minimalist, "light mode" glassmorphism aesthetic. It pairs **Manrope** (bold, editorial headlines) with **Inter** (readable body text), and utilizes **Material Symbols Outlined** for polished UI iconography.

## 2. Technology Stack
The application is built around modern web standards for performance and developer experience:
*   **Framework:** Next.js 16.2.1 (App Router, Turbopack)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 (using the `@theme inline` API in `app/globals.css` instead of `tailwind.config.ts`)
*   **Authentication & Database:** Supabase (`@supabase/supabase-js`)
*   **Design Generation:** The UI was scaffolded using an AI agent (Stitch MCP) to interpret and generate high-fidelity HTML/CSS from design prompts, which was then broken down into modular React Server & Client Components.

## 3. UI Design System Elements (Custom CSS Utilities)
The core design language relies heavily on these custom utility classes defined in `app/globals.css`:
*   `.editorial-gradient`: A subtle, multi-stop linear gradient blending primary (`#1A1A1A`) and secondary layers.
*   `.glass-card`: Translucent surfaces supporting the premium glassmorphic depth.
*   `.ambient-shadow`: A soft, dispersed drop-shadow for floating elements (cards, widgets).
*   `.ghost-border`: A highly subtle, semi-transparent border (usually `border-outline-variant/20`) to delineate structural elements without boxing them in.
*   **Custom Scrollbar:** A minimal, rounded scrollbar styling is applied globally.

## 4. Current State: Implemented Pages & Features

### A. Authentication Flow (Next.js Client Components)
Both Auth pages utilize a 50/50 split-screen layout on desktop (Branded Editorial content on the left, Forms on the right), collapsing smoothly to a stacked layout matching the aesthetic on mobile.
*   **`/` (Root):** Currently handles a simple redirect immediately to `/login`.
*   **`/login`:** Contains the login form wired to Supabase `signInWithPassword`. Features a built-in orchestration bypass: entering `test@test.com` with `password123` instantly logs the user in and redirects to the dashboard without hitting the Supabase Auth API (useful for testing UI flows).
*   **`/signup`:** Contains the registration form (Name, Email, Password) wired to Supabase `signUp`, redirecting to `/dashboard` upon success.

### B. Core Application: Deal Tracking Dashboard (`/dashboard`)
The dashboard is a Next.js App Router Client Component layout serving as a Kanban board for brand deals.
*   **Layout:** A fixed sidebar navigation (`Sidebar.tsx`) alongside a horizontally scrolling main content area accommodating multiple Kanban columns. Includes a floating "Weekly Milestone" widget.
*   **Components (`src/components/dashboard`):** 
    *   `Sidebar.tsx`: Navigation structure and "New Project" primary CTA.
    *   `KanbanColumn.tsx`: Renders a specific column (e.g., "New Inquiries", "Contract Signed") and dynamically filters deals matching its `status`.
    *   `DealCard.tsx`: The individual deal item displaying brand/project name, budget, and avatar.
*   **Data Model:** Currently driven entirely by a realistic static mock array located at `src/data/mockDeals.ts`. Defines a `Deal` interface with priority flags and status enums (`inquiry`, `negotiating`, `contract_signed`, `in_production`). There is **no database or drag-and-drop state interactivity hooked up yet.**

## 5. Next Immediate Development Steps
To transition this from a high-fidelity prototype to a functional application, the following steps are required:
1.  **Database Integration:** Replace the static mock data in `mockDeals.ts` by setting up the Supabase database schema for "Deals" and fetching records.
2.  **Row Level Security (RLS):** Ensure authenticated users can only see deals belonging to their specific creator or brand account.
3.  **Kanban Interactivity:** Implement React state management (e.g., `@hello-pangea/dnd` or simple prop-drilling with `useState`) to allow users to drag and drop or manually update the status of `DealCard` components between `KanbanColumn`s, triggering an `UPDATE` mutation to the Supabase database.
4.  **Form Modals:** Implement the "New Project" modal to insert incoming inquiries into the database.
