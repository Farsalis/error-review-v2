# Error Review

A full-stack application for tracking mistakes, scheduling retests, and improving learning through spaced repetition.

## Features

- **Mistake Tracking**: Record and categorize mistakes (conceptual, procedural, careless, knowledge gap)
- **Retest Scheduling**: Automatically schedule retests based on error categories
- **Quiz Mode**: Review mistakes through interactive quizzes
- **Statistics**: Track progress and identify patterns

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

#### Persistent database is not implemented. If you want to implement, you'll need to do the following:

- Create typescript db file in /server
- Setup drizzle -> local postgres db connection 
- Reconfigure storage.ts to utilize new database

2. Set up environment variables:
```bash
# Create a .env file with:
DATABASE_URL=your_postgresql_connection_string
```

3. Set up the database:
```bash
npm run db:generate
npm run db:migrate
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database

## License

MIT
