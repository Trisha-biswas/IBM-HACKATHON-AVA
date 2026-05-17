# Ask Mode Rules (Non-Obvious Only)

## Project Structure Context
- `server/src/` contains Express backend API code, not frontend source
- `client/src/api/` is the API client layer (fetch wrappers), not route definitions
- `shared/` types are the source of truth for both client and server (compiled as internal package)

## Database Context
- Migrations in `server/src/db/migrations/` follow `YYYYMMDDHHMMSS_description.sql` naming (timestamp required)
- Test database is separate instance, auto-seeded with `server/src/db/seeds/test.sql`
- Connection pool configured with non-default settings (min 2, max 10, 30s timeout)

## API Context
- All responses wrapped in `ApiResponse<T>` from `shared/types/api.ts`
- Error codes are strings (e.g., "AUTH_001") from `shared/constants/errors.ts`, not numbers
- API client in `client/src/api/client.ts` has built-in retry logic (not optional)

## Testing Context
- Integration tests run against real test database (not mocked)
- E2E tests require both client and server running concurrently
- Single test execution requires full path: `npm run test:integration -- server/src/api/users.test.ts`

## Workspace Context
- Monorepo with npm workspaces - root scripts proxy to client/server
- Commands may need to run from specific directories (e.g., migrations from server/)
- Type checking runs across entire workspace to catch shared type issues