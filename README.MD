# Milk Machine Dashboard

## Development Setup

### Frontend

1. Install dependencies:
   ```
   pnpm i
   ```
2. Start the development server:
   ```
   pnpm run dev
   ```

### Database

1. Start the database using Docker Compose:
   ```
   docker compose up -d
   ```

### Backend

1. Install dependencies:
   ```
   pnpm i
   ```
2. Generate database client:
   ```
   pnpm db:generate
   ```
3. Run database migrations:
   ```
   pnpm db:migrate
   ```
4. Seed the database:
   ```
   pnpm db:seed
   ```
5. Start the backend server:
   ```
   pnpm run dev
   ```
