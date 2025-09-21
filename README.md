# Wedding Vendor Contract Builder

A Next.js application that enables wedding vendors to create, manage, and sign contracts with clients using AI assistance.

## Features

- **Multi-vendor Support**: Photographers, caterers, florists, and other wedding vendors
- **AI-Powered Contract Generation**: Uses OpenRouter API to generate professional contracts
- **Digital Signatures**: Support for both typed and drawn signatures
- **Contract Management**: Create, edit, delete, and track contract status
- **PDF Export**: Generate PDF versions of signed contracts
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- OpenRouter API account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wedding-vendor-contract-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Test Credentials

Use these credentials to test different vendor types:

### Photographer
- **Email**: `photographer@test.com`
- **Password**: `password123`
- **Vendor**: Sarah Johnson Photography

### Caterer
- **Email**: `caterer@test.com`
- **Password**: `password123`
- **Vendor**: Elite Wedding Catering

### Florist
- **Email**: `florist@test.com`
- **Password**: `password123`
- **Vendor**: Bloom & Blossom Florals

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── ai-assist/     # AI contract generation
│   │   ├── auth/          # Authentication
│   │   └── contracts/     # Contract CRUD operations
│   ├── contracts/         # Contract management pages
│   ├── dashboard/         # Vendor dashboard
│   └── login/            # Authentication pages
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── contracts/        # Contract-related components
│   ├── layout/           # Layout components
│   └── ui/               # Generic UI components
├── data/                 # Mock data files
├── lib/                  # Utility libraries
├── stores/               # Zustand state management
└── types/                # TypeScript type definitions
```

## My Approach

### Architecture Decisions

1. **Next.js App Router**: Chose the modern app router for better performance and developer experience
2. **Zustand for State Management**: Lightweight alternative to Redux for managing authentication and contract state
3. **Mock Data Storage**: Used JSON files for simplicity, easily replaceable with a real database
4. **Component-Based Architecture**: Modular components for reusability and maintainability
5. **TypeScript**: Full type safety throughout the application

### AI Integration

- **OpenRouter API**: Leverages multiple AI models for contract generation
- **Context-Aware Generation**: Passes vendor type, client details, and service information to generate relevant contracts
- **Rich Text Editor**: TipTap editor for contract content editing with formatting support

### User Experience

- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Intuitive Navigation**: Clear user flows from login to contract signing
- **Visual Feedback**: Loading states, success/error messages, and smooth transitions

## Key Assumptions

1. **Single Vendor Per Account**: Each login represents one vendor business
2. **Simple Authentication**: Mock authentication without password hashing (development only)
3. **File-Based Storage**: JSON files instead of a database for simplicity
4. **AI Dependency**: Contracts require AI generation (could fallback to templates)
5. **PDF Generation**: Client-side PDF creation using jsPDF
6. **Signature Validation**: Basic signature capture without legal verification
7. **Single Currency**: All pricing in USD
8. **English Only**: No internationalization support

## What I'd Add With More Time

### Core Features

#### Client-Side Application
- **Client Portal**: Separate interface for clients to:
  - View available vendors by category and location
  - Browse vendor portfolios and pricing packages
  - Request quotes and proposals
  - Review and sign contracts
  - Make payments and track project status
  - Communicate with vendors through messaging

#### Two-Sided Marketplace Flow
- **Vendor Discovery**: Search and filter vendors by:
  - Service type (photography, catering, florals, etc.)
  - Location and travel radius
  - Price range and package options
  - Availability for specific dates
  - Reviews and ratings
- **Quote Management**: Streamlined process for quote requests and responses
- **Booking System**: Calendar integration for availability management

### Technical Enhancements

#### Backend Infrastructure
- **Real Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers
- **File Storage**: AWS S3 or Cloudinary for images and documents
- **Email Service**: SendGrid or AWS SES for notifications
- **Payment Processing**: Stripe integration for deposits and payments

#### Advanced Features
- **Real-time Chat**: Socket.io for vendor-client communication
- **Calendar Integration**: Google Calendar/Outlook sync
- **Document Templates**: Pre-built contract templates by vendor type
- **E-signature Integration**: DocuSign or HelloSign for legal signatures
- **Analytics Dashboard**: Business insights and performance metrics
- **Mobile Apps**: React Native apps for iOS and Android

#### Quality & Security
- **Comprehensive Testing**: Unit, integration, and E2E tests
- **Security Hardening**: Rate limiting, input validation, CSRF protection
- **Performance Optimization**: Image optimization, caching, CDN
- **Monitoring**: Error tracking with Sentry, analytics with Mixpanel
- **Compliance**: GDPR compliance, data encryption, audit logs

#### User Experience
- **Advanced Search**: Elasticsearch for complex vendor searches
- **Review System**: Client reviews and vendor ratings
- **Notification System**: Email and push notifications
- **Multi-language Support**: i18n for international markets
- **Accessibility**: WCAG 2.1 AA compliance
- **Progressive Web App**: Offline functionality and app-like experience

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Rich Text Editor**: TipTap
- **PDF Generation**: jsPDF
- **Signatures**: react-signature-canvas
- **Icons**: Lucide React
- **Animations**: Framer Motion

## License

This project is for demonstration purposes only.