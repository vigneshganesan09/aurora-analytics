# Anugal CIAM — demo applications

Two static web applications that sign in through Anugal CIAM over OpenID
Connect. They exist to prove the sign-in and single-sign-on flows end to end
against a real deployment, and to give a working reference for anyone
integrating a third application.

There is no build step and no dependencies. Every file here is served as-is.

```
index.html               Landing page: configuration, issuer check, redirect URIs
aurora-analytics.html    First application
meridian-docs.html       Second application, for demonstrating SSO
config.js                The only file you edit per environment
assets/
  app.css                Shared styling
  oidc-client.js         OIDC relying party: PKCE, token exchange, JWT verification
  demo-app.js            Page bootstrap shared by both applications
```

## Deploying

Copy the folder to any static host — nginx, S3 + CloudFront, GitHub Pages, an
existing web server's document root. It needs nothing but the ability to serve
files over HTTP.

Serve it over **HTTPS** anywhere other than localhost. `crypto.subtle`, which
generates the PKCE challenge and verifies the token signature, is unavailable in
a non-secure context, so the pages will fail to sign in over plain HTTP.

## Configuring

Edit `config.js`:

| Key | What it is |
|---|---|
| `issuer` | Base URL of the Anugal core API, **including** its `/anugal-core/api` prefix |
| `clientIds` | The OAuth client id each page authenticates as |
| `portalUrl` | Where "Return to sign-in" sends an ended session |
| `scope` | Scopes requested; the server intersects this with what the client allows |

The issuer prefix is the single most common misconfiguration. Verify it before
anything else:

```bash
curl -X POST https://<host>/oauth/token                  # 404 -> prefix missing
curl -X POST https://<host>/anugal-core/api/oauth/token  # 400 -> correct
```

A 400 means the route is alive and rejecting an empty body, which is what you
want. The landing page has a **Test the issuer** button that does the same check
against the discovery document.

## Registering each application in Anugal

Each page needs its own OAuth client, registered against the customer that will
use it:

1. Register it as a **public** client — no secret, PKCE required.
2. Register its redirect URI **exactly** as the page reports it. Each
   application page prints the value under "Redirect URI to register", and the
   landing page lists both. They are matched literally: a trailing slash, an
   added `index.html`, or `http` where the registration says `https` all fail.
3. Put the resulting client id into `config.js`.
4. Subscribe the customer to the application and grant it to the member who will
   sign in. Subscribed but not granted shows "Request access" rather than a
   launch.

## Walking the flow

1. Open `aurora-analytics.html` and sign in. The page shows the claims from the
   ID token and confirms the signature verified against the Anugal JWKS.
2. Open `meridian-docs.html`. It completes with no second prompt — that is
   single sign-on. The session lives in Anugal, not in either page.
3. Sign out of either one. Both are signed out.

## What these pages do, and what they deliberately do not

They run the authorization code flow with PKCE (S256) and hold **no client
secret**. Anugal registers a browser application as a public client, and its
token endpoint refuses a public client that presents no code challenge. A secret
shipped inside a static asset is readable by anyone who opens developer tools,
so there would be nothing for it to protect.

On every sign-in the client verifies the ID token's RS256 signature against the
issuer's JWKS, selecting the key by `kid` with no fallback, and then checks
`iss`, `aud`, `exp` and `nonce`. A correctly signed token issued for a different
application is still correctly signed — `aud` is what stops it being accepted
here.

Two limits worth knowing:

- **Cross-tab sign-out only works same-origin.** `BroadcastChannel` and storage
  events are scoped to an origin, so once these pages are on their own host the
  portal's sign-out broadcast never reaches them. What does still work is the
  token expiry timer and RP-initiated logout.
- **Tokens are held in memory only.** Reloading a page signs it in again through
  the Anugal session rather than restoring anything from storage, which is why a
  reload is instant while the session lives and prompts once it does not.

These are demonstration applications. A production relying party should exchange
the authorization code server-to-server and keep its own session in an httpOnly,
`SameSite` cookie rather than doing any of this in the browser.
