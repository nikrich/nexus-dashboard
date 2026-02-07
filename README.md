# Nexus Dashboard

Project management dashboard for the Nexus platform.

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, register)
│   ├── (dashboard)/        # Protected dashboard pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── layout/             # Layout components (sidebar, header)
│   └── ui/                 # shadcn/ui components
├── features/               # Feature modules
│   ├── auth/               # Auth provider, forms
│   ├── projects/           # Project features
│   ├── tasks/              # Task features
│   └── notifications/      # Notification features
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── api-client.ts       # Typed API client
│   └── utils.ts            # General utilities
├── stores/                 # Zustand state stores
└── types/                  # TypeScript type definitions
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (zinc theme)
- **API**: REST via API Gateway (http://localhost:3000)
