#!/usr/bin/env bash
# Checks a running DynaBox server end to end with curl: health, sign-up, sign-in, saving a
# document, the stale-revision refusal, reading it back and deleting it.
#
#   ./scripts/smoke.sh                          # the Docker setup: http://localhost:8080/api
#   ./scripts/smoke.sh http://localhost:3000    # the API on its own (docker-compose.dev.yml)
#
# It creates one throwaway account per run (there is no endpoint to delete an account yet) and
# removes the documents it saved. Needs only curl.
set -uo pipefail

BASE="${1:-http://localhost:8080/api}"
EMAIL="smoke-$(date +%s)-$RANDOM@example.com"
PASSWORD="smoke-test-password"
failures=0

pass() { printf '  \033[32mok\033[0m   %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; failures=$((failures + 1)); }

# request METHOD PATH [JSON_BODY] -> sets STATUS and BODY. Sends no Content-Type when there is no body.
request() {
  local method="$1" path="$2" body="${3-}" out
  local args=(-s -X "$method" -w $'\n%{http_code}' "$BASE$path")
  [ -n "${TOKEN-}" ] && args+=(-H "authorization: Bearer $TOKEN")
  [ -n "$body" ] && args+=(-H 'content-type: application/json' -d "$body")
  out="$(curl "${args[@]}")" || { STATUS=000; BODY=""; return; }
  STATUS="${out##*$'\n'}"
  BODY="${out%$'\n'*}"
}

expect() { # expect "what" STATUS [text the body must contain]
  if [ "$STATUS" = "$2" ] && { [ -z "${3-}" ] || [[ "$BODY" == *"$3"* ]]; }; then pass "$1 -> $STATUS"; else fail "$1 -> got $STATUS $BODY (wanted $2 ${3-})"; fi
}

echo "DynaBox smoke test against $BASE"

request GET /health;                    expect "health" 200 '"service":"dynabox-api"'

request POST /auth/register "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
if [ "$STATUS" = "403" ]; then echo "  This server does not accept new accounts (ALLOW_REGISTRATION=false); cannot run the rest."; exit 2; fi
expect "register" 201 '"token"'
TOKEN="$(printf '%s' "$BODY" | sed -E 's/.*"token":"([^"]+)".*/\1/')"
[ -n "$TOKEN" ] || { fail "no token in the register answer"; exit 1; }

request POST /auth/register "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"; expect "register twice" 409 'email_taken'
request POST /auth/login "{\"email\":\"$EMAIL\",\"password\":\"wrong-password-here\"}"; expect "login with a wrong password" 401 'invalid_credentials'
request POST /auth/login "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"; expect "login" 200 '"token"'
request GET /auth/me;                   expect "who am I" 200 "$EMAIL"

SAVED_TOKEN="$TOKEN"; TOKEN=""
request GET /sync;                      expect "read without a token" 401
TOKEN="$SAVED_TOKEN"

request PUT /sync/smoke-notes '{"payload":{"text":"hello"},"version":1,"baseRevision":0}'; expect "first save (base 0)" 200 '"revision":1'
request PUT /sync/smoke-notes '{"payload":{"text":"edited"},"version":1,"baseRevision":1}'; expect "save with the right base" 200 '"revision":2'
request PUT /sync/smoke-notes '{"payload":{"text":"stale"},"version":1,"baseRevision":1}';  expect "save with a stale base" 409 'revision_conflict'
request PUT /sync/smoke-count '{"payload":"3","version":1,"baseRevision":0}';               expect "save a string payload" 200
request GET /sync;                      expect "read everything back" 200 '"text":"edited"'
[[ "$BODY" == *'"payload":"3"'* ]] && pass "the string payload came back as a string" || fail "string payload changed type: $BODY"
request PUT /sync/Bad_Key '{"payload":{},"version":1,"baseRevision":0}';                    expect "a bad key is refused" 400
request DELETE /sync;                   expect "delete my documents" 204
request GET /sync;                      expect "nothing left" 200 '"documents":{}'

echo
if [ "$failures" -eq 0 ]; then printf '\033[32mAll checks passed.\033[0m\n'; else printf '\033[31m%d check(s) failed.\033[0m\n' "$failures"; exit 1; fi
