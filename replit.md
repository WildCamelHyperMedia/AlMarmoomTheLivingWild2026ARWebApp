# Al Marmoom - Drive-Through Photography Exhibition

## Overview

Al Marmoom is a mobile-first digital gallery application for the Al Marmoom Desert Conservation Reserve photography exhibition. The app provides an interactive wildlife discovery experience where users sign up, watch animal videos to progressively unlock the collection, and can access AR experiences for select animals. The application supports bilingual content (English and Arabic) with RTL layout support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for user session, language preferences, and progress tracking
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and UI animations
- **Carousel**: Embla Carousel for the gallery page navigation

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **API Pattern**: RESTful JSON API under `/api/*` routes
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas with drizzle-zod for type-safe validation

### Data Storage
- **Database**: PostgreSQL (connection via DATABASE_URL environment variable)
- **Schema**: Two tables - `users` (id, name, phone) and `user_progress` (id, userId, unlockedAnimals array, lastUpdated)
- **Migrations**: Managed via drizzle-kit with migrations stored in `/migrations`

### Key Design Patterns
- **Shared Types**: Schema definitions in `/shared/schema.ts` are used by both frontend and backend for type consistency
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` allows for different storage implementations
- **Progressive Unlocking**: Animals are unlocked sequentially as users watch video content
- **Bilingual Support**: Language context provides translations and RTL/LTR direction switching

### Build Process
- **Development**: Vite dev server with HMR for frontend, tsx for backend
- **Production**: Client built with Vite to `dist/public`, server bundled with esbuild to `dist/index.cjs`
- **Static Serving**: Production server serves built frontend from `dist/public`

## External Dependencies

### Database
- PostgreSQL database required via `DATABASE_URL` environment variable
- Uses `connect-pg-simple` for session storage compatibility

### Frontend Libraries
- Radix UI primitives for accessible component foundations
- Lucide React for iconography
- Custom Dubai font family loaded from `/client/public/fonts/`

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal` for development error overlay
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` for Replit environment
- Custom `vite-plugin-meta-images` for OpenGraph image URLs based on Replit deployment domain

### Asset Management
- Animal images stored in `/client/public/animals/`
- Videos stored in `/client/public/videos/`
- AR experiences linked via external Zappar URLs