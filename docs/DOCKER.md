# Running DynaBox with Docker (account and database)

> Versão em português: [DOCKER.pt-BR.md](DOCKER.pt-BR.md)

This guide starts the DynaBox server on your computer (or on a server of yours): the app, the API
and a PostgreSQL database, with one command. **It is optional.** Without it DynaBox works fine
with the browser's storage alone.

## What you need

- Docker with Compose (`docker compose version` must work): https://docs.docker.com/get-docker/
- `git` and `openssl` (`openssl` is only used to generate random secrets).
- Port 8080 free (changeable, see `WEB_PORT`).

## Step by step

```bash
git clone https://github.com/DeysRodrigues/dynamic_beta.git
cd dynamic_beta
cp .env.example .env
```

Open `.env` and fill in the two secrets. Generate each with a command and paste it in:

```bash
openssl rand -hex 32    # paste into JWT_SECRET
openssl rand -hex 16    # paste into POSTGRES_PASSWORD
```

Then start everything:

```bash
docker compose up --build -d
```

The first run takes a few minutes (it pulls images and builds). Check it is up:

```bash
docker compose ps                      # db, api and web should be healthy/running
curl http://localhost:8080/api/health  # {"status":"ok","service":"dynabox-api",...}
```

Open **http://localhost:8080**, go to **Conta** in the side menu and create your account. The app
served by this Docker already points at its own server.

## The `.env` file

| Variable | Required | What it does |
|---|---|---|
| `JWT_SECRET` | yes | Signs logins. At least 32 characters. The API will not start without it. **Changing it logs everybody out.** |
| `POSTGRES_PASSWORD` | yes | Password of the database user. Letters and digits only (openssl's hex is fine), because it goes inside a URL. It only applies when the database is **first created**: changing it later in `.env` does not change the existing database's password. |
| `ALLOW_REGISTRATION` | no (`true`) | Whether anyone can create an account. **Set it to `false` once your own account exists.** |
| `CORS_ORIGINS` | no (`*`) | Which websites may call the API from a browser, comma separated. `*` is fine on your own machine. To use the published site, put its address (e.g. `https://dynabox.space`). |
| `WEB_PORT` | no (`8080`) | Port of the app on your machine. |

After editing `.env`, apply it with `docker compose up -d` (nothing is deleted).

`.env` is never committed (it is in `.gitignore`). Do not share or publish it.

## What runs

| Service | What it is | Reachable from outside? |
|---|---|---|
| `web` | the app (nginx); forwards `/api` to the API | yes, on port 8080 |
| `api` | the server (Fastify) | no, only through `web` |
| `db` | PostgreSQL 17, data in the `dynabox_pgdata` volume | no |

## Using the published site with your server

The published site starts with the browser's storage only. To make it sync with **your** server:

1. In `.env` set `CORS_ORIGINS=https://dynabox.space` (the address of the site you use) and run
   `docker compose up -d`.
2. In the site, open **Conta**, type `http://localhost:8080`, press **Testar conexão**, then sign
   in or create the account.

Browser limits: Chrome and Firefox let an https page call `http://localhost`; **Safari does not**.
A server on another machine needs an **https** address. In those cases use the app served by your
Docker (http://localhost:8080).

## Day to day

```bash
docker compose logs -f api      # follow the server
docker compose stop             # pause (data stays)
docker compose up -d            # start again
docker compose down             # stop and remove the containers (data stays in the volume)
docker compose down -v          # CAREFUL: also deletes the database, i.e. every account and document
```

**Updating** to a new version:

```bash
git pull
docker compose up --build -d
```

The database tables are upgraded automatically when the API starts.

## Backing up and restoring the database

```bash
# back up
docker compose exec -T db pg_dump -U dynabox dynabox > backup-dynabox.sql

# restore into an empty (freshly created) database
docker compose exec -T db psql -U dynabox dynabox < backup-dynabox.sql
```

Your data also stays in the browser, and **Personalizar → Backup** downloads everything as a file.
Worth keeping both.

## Putting it on a cloud server

1. Install Docker on the server and follow the same steps.
2. Put an **https** proxy in front of the `web` port (Caddy, Traefik, or nginx with Let's Encrypt).
   Without https the browser blocks sign-in from an https site.
3. In `.env`: set `CORS_ORIGINS` to the site's address, and `ALLOW_REGISTRATION=false` once your
   account exists.
4. Never open the database port to the internet. In this compose it has no published port at all.

## Login lasts 14 days

After that the app returns to browser-only mode by itself (nothing is deleted) and says so on the
Conta page. Just sign in again.

## Common problems

| Symptom | Cause and fix |
|---|---|
| `JWT_SECRET`/`POSTGRES_PASSWORD` "is required" on start | `.env` is missing or empty. Run `cp .env.example .env` and fill it in. |
| `port is already allocated` | 8080 is in use. Set another value in `WEB_PORT`. |
| The API keeps restarting | Check `docker compose logs api`. Usually `JWT_SECRET` has fewer than 32 characters. |
| I changed `POSTGRES_PASSWORD` and the API cannot connect | The database was created with the old password. Restore the old one, or if no data matters, `docker compose down -v` and start again. |
| "Não consegui falar com o servidor" on the Conta page | Check `docker compose ps` is healthy and that the address is the **app's** (`http://localhost:8080`). On the published site, check `CORS_ORIGINS`. |
| "Este servidor não está aceitando novas contas" | `ALLOW_REGISTRATION=false`. Set it to `true` for a moment to create another account. |
| I forgot the account password | There is no e-mail recovery yet. Create another account, or delete the current one straight in the database. |

## Quick end-to-end check

```bash
./scripts/smoke.sh    # creates a throwaway account (needs ALLOW_REGISTRATION=true), saves, reads and deletes documents (needs only curl)
```

## For development

To reach the API and the database from outside (curl, psql), add the dev file:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
# API on 127.0.0.1:3000, database on 127.0.0.1:5433
```
