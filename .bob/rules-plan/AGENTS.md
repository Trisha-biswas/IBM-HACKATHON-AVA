# Plan Mode Rules (Non-Obvious Only)

## Architecture Constraints
- Client and server are separate build targets with independent dependencies
- Shared types in `shared/` compiled as internal package (affects build order)
- Database schema changes require both migration file AND type updates in `shared/`

## Authentication Architecture
- Uses HTTP-only cookies (not localStorage) for security
- Token refresh handled server-side (not client-side)
- Session state managed through cookie-based authentication

## API Design
- Versioning in URL path (e.g., `/api/v1/users`), not headers
- All responses wrapped in `ApiResponse<T>` structure
- Error codes are strings from centralized constants (e.g., "AUTH_001")

## Database Architecture
- Connection pooling with explicit configuration (min 2, max 10, 30s timeout)
- Forward-only migrations (no rollback support by design)
- Test database is separate instance with auto-seeding

## Testing Architecture
- Integration tests use real database (not mocked) for accuracy
- E2E tests require both services running (client + server)
- Test isolation through database transactions and seeding

## Workspace Architecture
- Monorepo structure means scripts must specify working directory
- Root `npm run dev` runs both client and server concurrently
- Type checking runs across entire workspace to catch cross-package issues