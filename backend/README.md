# DynaBox API

The optional server of [DynaBox](../README.md): accounts, and a copy of the app's saved data in
PostgreSQL. The app works without it; this exists for people who want an account and to use more
than one device. It is meant to be run with the Docker setup in the repository root
(`docker compose up --build`), which also serves the app.

The server keeps **one JSON document per user and key**, exactly what the browser keeps in
`localStorage` under the same key, and does not look inside it. Every write names the revision the
client last saw, and only succeeds if that is the revision on record.

## Endpoints

| Method and path | Needs a token | Does |
|---|---|---|
| `GET /health` | no | `{ status, service: "dynabox-api", registration }`. Docker polls it, and the app's "test the connection" button reads it |
| `POST /auth/register` | no | `{ email, password }` (8 to 128 chars). `201 { token, user }`, `409 email_taken`, `403 registration_disabled`, `400` |
| `POST /auth/login` | no | `200 { token, user }`, or `401 invalid_credentials` (the same answer for an unknown e-mail and a wrong password) |
| `GET /auth/me` | yes | the account behind the token; `401` if the account no longer exists |
| `GET /sync` | yes | `{ documents: { [key]: { payload, version, revision, updatedAt } } }` |
| `PUT /sync/:key` | yes | `{ payload, version, baseRevision }`. `200 { revision }`; **`409 revision_conflict`** with `current` (what the server has, or `null`) when `baseRevision` is not the stored revision; `413` over 2 MB; `400` for a key outside `^[a-z0-9-]{1,64}$` or a `null` payload |
| `DELETE /sync` | yes | deletes the account's documents (`204`); the account stays |

`baseRevision` is `0` for a key the client has never saved. The check and the write are one SQL
statement, so two clients writing on the same revision cannot both win.

## Configuration

Environment variables. The server refuses to start, with a list of what is wrong, if one is
invalid.

| Variable | Default | Meaning |
|---|---|---|
| `DATABASE_URL` | required | PostgreSQL connection string |
| `JWT_SECRET` | required, 32+ characters | signs the login tokens; there is deliberately no default |
| `ALLOW_REGISTRATION` | `true` | whether anyone can create an account |
| `CORS_ORIGINS` | `*` | websites allowed to call the API from a browser, comma separated |
| `AUTH_RATE_LIMIT_PER_MINUTE` | `10` | sign-in and sign-up attempts per address per minute |
| `PORT`, `HOST` | `3000`, `0.0.0.0` | where to listen |

## Data

```
users      (id uuid pk, email unique and lower-case, password_hash, created_at)
documents  (user_id -> users, key, payload jsonb, version int, revision bigint, updated_at,
            pk (user_id, key))      -- deleting a user deletes their documents
```

The migrations are SQL files in `drizzle/`, applied when the server starts. After changing
`src/db/schema.ts`, run `npx drizzle-kit generate` and commit the new file.

Two things learnt the hard way, both covered by tests: a JSON string payload (such as `"3"`) is
written as text cast to `jsonb` and read back as text, because handing it to the driver stores it
as the number 3; and a request that says `Content-Type: application/json` with no body (what a
browser sends on `DELETE`) is accepted, where Fastify would answer 400 by default.

## Working on it

```bash
npm install
npm run lint     # type check
npm test         # needs Docker running: starts a throwaway PostgreSQL 17
npm run dev      # tsx watch; needs DATABASE_URL and JWT_SECRET in the environment
npm run build && npm start
```

Each test file gets its own freshly migrated database inside one shared container, so they run in
parallel without seeing each other's data. `../scripts/smoke.sh` checks a running server end to end
with curl.
