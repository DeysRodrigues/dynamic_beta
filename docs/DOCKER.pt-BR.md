# Rodando o DynaBox com Docker (conta e banco de dados)

> English version: [DOCKER.md](DOCKER.md)

Este guia liga o servidor do DynaBox no seu computador (ou num servidor seu): o app, a API e o
banco PostgreSQL, tudo com um comando. **É opcional.** Sem isto o DynaBox funciona normalmente só
com o armazenamento do navegador.

## O que você precisa

- Docker com o Compose (`docker compose version` deve funcionar). Instalação: https://docs.docker.com/get-docker/
- `git` e `openssl` (o `openssl` só serve para gerar senhas aleatórias).
- A porta 8080 livre (dá para trocar, veja `WEB_PORT`).

## Passo a passo

```bash
git clone https://github.com/DeysRodrigues/dynamic_beta.git
cd dynamic_beta
cp .env.example .env
```

Abra o `.env` e preencha as duas senhas. Gere cada uma com um comando e cole no arquivo:

```bash
openssl rand -hex 32    # cole em JWT_SECRET
openssl rand -hex 16    # cole em POSTGRES_PASSWORD
```

Depois ligue tudo:

```bash
docker compose up --build -d
```

A primeira vez demora uns minutos (baixa as imagens e compila). Confira que está de pé:

```bash
docker compose ps                      # db, api e web devem estar "healthy"/"running"
curl http://localhost:8080/api/health  # {"status":"ok","service":"dynabox-api",...}
```

Abra **http://localhost:8080**, entre em **Conta** no menu lateral e crie a sua conta. O app
servido por esse Docker já vem apontado para o próprio servidor.

## O arquivo `.env`

| Variável | Obrigatória | O que faz |
|---|---|---|
| `JWT_SECRET` | sim | Assina os logins. Mínimo 32 caracteres. A API não sobe sem ela. **Se trocar, todo mundo é deslogado.** |
| `POSTGRES_PASSWORD` | sim | Senha do usuário do banco. Use só letras e números (o hex do `openssl` serve), porque vai dentro de uma URL. Só vale na **primeira** criação do banco: depois de criado, trocar no `.env` não muda a senha dele. |
| `ALLOW_REGISTRATION` | não (`true`) | Se qualquer pessoa pode criar conta. **Ponha `false` depois de criar a sua.** |
| `CORS_ORIGINS` | não (`*`) | Quais sites podem falar com a API pelo navegador, separados por vírgula. `*` serve na sua máquina. Para usar o site publicado, ponha o endereço dele (ex.: `https://dynabox.space`). |
| `WEB_PORT` | não (`8080`) | Porta do app na sua máquina. |

Depois de mudar o `.env`, aplique com `docker compose up -d` (sem apagar nada).

O `.env` nunca vai para o git (está no `.gitignore`). Não compartilhe nem publique esse arquivo.

## O que sobe

| Serviço | O que é | Acessível de fora? |
|---|---|---|
| `web` | o app (nginx); repassa `/api` para a API | sim, na porta 8080 |
| `api` | o servidor (Fastify) | não, só através do `web` |
| `db` | PostgreSQL 17, dados no volume `dynabox_pgdata` | não |

## Usar o site publicado com o seu servidor

O site publicado começa só com o navegador. Para ele sincronizar com o **seu** servidor:

1. No `.env`, ponha `CORS_ORIGINS=https://dynabox.space` (o endereço do site que você usa) e rode
   `docker compose up -d`.
2. No site, abra **Conta**, digite `http://localhost:8080`, aperte **Testar conexão** e entre ou
   crie a conta.

Limites dos navegadores: o Chrome e o Firefox deixam uma página https chamar `http://localhost`;
o **Safari não**. Um servidor em outra máquina precisa de endereço **https**. Nesses casos use o
app servido pelo seu Docker (http://localhost:8080).

## Dia a dia

```bash
docker compose logs -f api      # acompanhar o servidor
docker compose stop             # pausar (os dados ficam)
docker compose up -d            # religar
docker compose down             # desligar e remover os containers (os dados ficam no volume)
docker compose down -v          # CUIDADO: apaga também o banco, ou seja, todas as contas e dados
```

**Atualizar** para uma versão nova:

```bash
git pull
docker compose up --build -d
```

As tabelas do banco são atualizadas sozinhas quando a API sobe.

## Backup e restauração do banco

```bash
# backup
docker compose exec -T db pg_dump -U dynabox dynabox > backup-dynabox.sql

# restaurar num banco vazio (recém-criado)
docker compose exec -T db psql -U dynabox dynabox < backup-dynabox.sql
```

Seus dados também continuam no navegador, e em **Personalizar → Backup** você baixa tudo em um
arquivo. Vale guardar os dois.

## Colocando num servidor na nuvem

1. Instale o Docker no servidor e siga os mesmos passos acima.
2. Ponha um proxy com **https** na frente da porta do `web` (Caddy, Traefik ou nginx com
   Let's Encrypt). Sem https o navegador bloqueia o login a partir de um site https.
3. No `.env`: `CORS_ORIGINS` com o endereço do site, e `ALLOW_REGISTRATION=false` depois de criar
   a sua conta.
4. Não abra a porta do banco para a internet. Neste compose ele nem tem porta publicada.

## O login dura 14 dias

Passado esse prazo o app volta sozinho ao modo só neste navegador (nada é apagado) e avisa na
página Conta. É só entrar de novo.

## Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| `JWT_SECRET`/`POSTGRES_PASSWORD` "is required" ao subir | O `.env` não existe ou está vazio. Rode `cp .env.example .env` e preencha. |
| `port is already allocated` | A 8080 está em uso. Ponha outra em `WEB_PORT` no `.env`. |
| A API reinicia sem parar | Veja `docker compose logs api`. Costuma ser `JWT_SECRET` com menos de 32 caracteres. |
| Mudei `POSTGRES_PASSWORD` e a API não conecta | O banco já foi criado com a senha antiga. Volte a senha antiga ou, se não há dados que importem, `docker compose down -v` e suba de novo. |
| "Não consegui falar com o servidor" na página Conta | Veja se `docker compose ps` está saudável e se o endereço é o do **app** (`http://localhost:8080`). No site publicado, confira o `CORS_ORIGINS`. |
| "Este servidor não está aceitando novas contas" | `ALLOW_REGISTRATION=false`. Ponha `true` por um momento para criar outra conta. |
| Esqueci a senha da conta | Não há recuperação por e-mail ainda. Crie outra conta, ou apague a atual direto no banco. |

## Verificação rápida de ponta a ponta

```bash
./scripts/smoke.sh    # cria uma conta de teste (precisa de ALLOW_REGISTRATION=true), envia, lê e apaga os documentos (precisa só de curl)
```

## Para desenvolver

Para acessar a API e o banco de fora (curl, psql), junte o arquivo de desenvolvimento:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
# API em 127.0.0.1:3000, banco em 127.0.0.1:5433
```
