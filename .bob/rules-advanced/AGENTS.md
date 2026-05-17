# Advanced Mode Rules (Non-Obvious Only)

## Custom Utilities (Mandatory Usage)
- Transaction wrapper in `server/src/db/transaction.ts` MUST be used for all multi-query operations (auto-rollback on error)
- API client in `client/src/api/client.ts` has automatic retry with exponential backoff (don't add manual retries)
- All API responses MUST use `ApiResponse<T>` wrapper from `shared/types/api.ts`

## Error Handling
- Error codes are strings from `shared/constants/errors.ts` (e.g., "AUTH_001", not numbers)
- Never throw raw errors - always use error codes and transform to ApiErrorResponse

## React Patterns
- Hooks follow `use[Feature][Action]` naming (e.g., `useUserFetch`, `useAuthLogin`) for cache invalidation system
- Component structure: `ComponentName/index.tsx` + `ComponentName.module.css`
- Never use direct fetch in components - always through `client/src/api/` layer

## Database
- Query timeout is 30 seconds (explicitly configured in pool)
- Connection pool: min 2, max 10 (not defaults)
- Migrations must run from server directory: `cd server && npm run migrate:up`

## Testing
- Integration tests run against real test database (not mocked)
- Test database auto-seeded with `server/src/db/seeds/test.sql` before each run
- Run single test: `npm run test:integration -- server/src/api/users.test.ts` (full path required)

## Workspace
- Root scripts proxy to workspaces - commands run from root or specify working directory
- Shared types in `shared/` compiled as internal package (not just TS references)

## Advanced Mode Tools
- MCP tools available for external integrations
- Browser tools available for testing and debugging