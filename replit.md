# WrenchFlow - Service Shop Manager Application

## Overview

WrenchFlow is a comprehensive service shop management application designed for small engine repair businesses. The application provides a complete solution for managing customers, equipment, parts inventory, work orders, and employee information with multi-tenant architecture supporting multiple repair shops.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Theme System**: Custom theme provider with light/dark mode support
- **Local Storage**: Custom hooks for persistent client-side data

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript
- **API Style**: RESTful API with JSON responses
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Development**: Hot module replacement (HMR) via Vite

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection Pooling**: Neon serverless pool for optimal performance

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions stored in PostgreSQL
- **Authorization**: Role-based access control with shop-specific permissions
- **Multi-tenant Support**: Users can access multiple shops with different roles

### Data Models
- **Users**: Authentication and profile management
- **Shops**: Multi-tenant shop isolation with subscription management
- **Customers**: Customer database with contact and service history
- **Equipment**: Equipment tracking with customer associations
- **Work Orders**: Digital work order management with status tracking
- **Parts**: Inventory management with cost tracking and stock levels
- **Vendors**: Supplier management for parts ordering

### User Interface Components
- **Layout System**: Responsive sidebar navigation with mobile support
- **Forms**: Reusable form components for all entity management
- **Theme Management**: User-customizable themes with system preference detection
- **Toast Notifications**: User feedback system for actions and errors
- **Modal Dialogs**: Consistent modal patterns for data entry and editing

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect handles authentication
3. Session established and stored in PostgreSQL
4. User shop associations loaded and cached
5. Shop selection determines data scope for all subsequent operations

### Business Logic Flow
1. All data operations are scoped to the selected shop
2. API endpoints validate shop access permissions
3. Frontend queries are shop-specific and cached
4. Real-time updates via React Query invalidation
5. Optimistic updates for improved user experience

### Multi-tenant Data Isolation
- All business entities include shopId foreign key constraints
- API middleware enforces shop-based data access
- Frontend components automatically scope queries to selected shop
- Admin users can access cross-shop data when authorized

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Runtime schema validation
- **tailwindcss**: Utility-first CSS framework

### UI Component Libraries
- **@radix-ui/***: Accessible primitive components
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation utilities

### Development Tools
- **vite**: Frontend build tool and dev server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration management
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
1. Frontend built with Vite to static assets
2. Backend compiled with esbuild to ESM modules
3. Database migrations applied via Drizzle Kit
4. Environment variables configured for production

### Production Environment
- **Database**: Neon PostgreSQL serverless
- **Sessions**: Stored in PostgreSQL with TTL management
- **Static Assets**: Served via Express static middleware
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Development Environment
- **Hot Reload**: Vite middleware integrated with Express
- **Database**: Same PostgreSQL instance with development schema
- **Authentication**: Replit Auth development configuration
- **Error Handling**: Runtime error overlay for debugging

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```