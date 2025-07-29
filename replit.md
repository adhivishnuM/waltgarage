# EV Service App

## Overview

This is a comprehensive Electric Vehicle (EV) service management application built with a modern full-stack architecture. The app connects EV owners with service partners for various maintenance and repair needs, featuring real-time tracking, wallet management, and a complete service lifecycle management system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom EV-themed design system (electric green primary color)
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and React Context for auth
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **Development**: Hot module replacement with Vite middleware integration

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: @neondatabase/serverless for serverless PostgreSQL connections

## Key Components

### Authentication System
- **Provider**: Firebase Authentication with Google OAuth
- **User Management**: Custom user creation and profile management
- **Session Handling**: Firebase auth state persistence
- **Role-based Access**: Support for customer, partner, and admin roles

### Service Management
- **Service Types**: Battery, charging port, motor, diagnostics, and general maintenance
- **Status Tracking**: Complete lifecycle from pending → assigned → in_progress → completed
- **Priority Levels**: Normal, urgent, and emergency service classifications
- **Location Services**: GPS-based service location tracking and technician positioning

### Vehicle Management
- **Multi-vehicle Support**: Users can register multiple EV vehicles
- **Vehicle Details**: Brand, model, year, battery capacity, and current charge level
- **Service History**: Complete maintenance and repair history per vehicle

### Real-time Features
- **Service Tracking**: Live technician location updates via polling
- **Notifications**: System-wide notification management
- **Status Updates**: Real-time service status changes

### Payment System
- **Wallet Integration**: Built-in wallet system for service payments
- **Transaction History**: Complete payment and refund tracking
- **Cost Estimation**: Dynamic pricing based on service type and complexity

## Data Flow

1. **User Authentication**: Firebase handles auth, backend creates/retrieves user profile
2. **Service Request**: Customer selects vehicle → describes issue → system finds available partners
3. **Partner Assignment**: Partners can accept/decline service requests
4. **Service Execution**: Real-time tracking with location updates and status changes
5. **Payment Processing**: Wallet-based transactions with automatic balance updates
6. **Completion**: Rating system and service history recording

## External Dependencies

### Core Dependencies
- **Firebase**: Authentication and user management
- **Neon Database**: Serverless PostgreSQL hosting
- **React Query**: Server state management and caching
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **Drizzle Kit**: Database schema management
- **ESBuild**: Fast JavaScript bundling for production

### Maps and Location
- **Leaflet**: Interactive maps for service tracking (referenced in tracking component)
- **Geolocation API**: Browser-based location services

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles Node.js server to `dist/index.js`
- **Assets**: Static files served from build output directory

### Environment Configuration
- **Development**: Hot reload with Vite middleware integration
- **Production**: Optimized bundles with static file serving
- **Database**: Environment-based connection strings for different deployment stages

### Scalability Considerations
- **Serverless-ready**: Compatible with Neon's serverless PostgreSQL
- **Stateless Backend**: Session management through Firebase, no server-side session storage
- **CDN-friendly**: Static assets can be served from CDN in production

The application follows modern best practices with a clear separation of concerns, type safety throughout the stack, and a mobile-first responsive design optimized for EV service management workflows.