# Firebase Hosting (Next.js Web Frameworks)

This app uses **Firebase Hosting** with the **Web Frameworks** integration (`firebase.json` → `source: "."`). The Firebase CLI builds your Next.js app and runs API routes / SSR on a **frameworks backend** in `us-central1`.

## Prerequisites

- Node **20+** (see `.nvmrc`).
- Firebase project **`floral-doctor`** (see `.firebaserc`) — or run `firebase use <project-id>`.
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools` or use the local devDependency: `npx firebase`.

## One-time setup

1. **Log in**

   ```bash
   firebase login
   ```

2. **Enable Web Frameworks** (if the CLI prompts you on first deploy)

   ```bash
   firebase experiments:enable webframeworks
   ```

3. **Production environment variables**

   Optional / recommended:

   - `NEXT_PUBLIC_SITE_URL` — your live canonical URL (metadata, OG, favicon)
   - **Firestore rules** must allow **read** (and client **write** for the admin panel) on `adminContent/main` for your Firebase web app—same as the public site content API.

   Configure these for the **Firebase Hosting / framework backend** in the [Firebase Console](https://console.firebase.google.com/) (Project → Hosting → your site → **Environment configuration**) or via the [Firebase CLI env docs](https://firebase.google.com/docs/functions/config-env). Do **not** commit secrets.

   For local deploys, you can copy `.env.local` to the filename referenced in `.env.example` (e.g. `.env.floral-doctor`) if your workflow uses that.

## Deploy from your machine

```bash
npm ci
npm run build
npm run deploy:firebase
```

Or:

```bash
npx firebase deploy --only hosting --project floral-doctor
```

## CI (GitHub Actions)

Workflow: `.github/workflows/firebase-hosting-deploy.yml`

1. Create a CI token: `firebase login:ci` and add it as repository secret **`FIREBASE_TOKEN`**.
2. Add any **build-time** or **runtime** secrets the deployed app needs (mirror production) as GitHub secrets and **uncomment / map** the `env` block in the workflow file if required.

## After deploy

- Open the **Hosting** URL in the Firebase Console (or your custom domain).
- Confirm **`/admin`** (content editor), `/api/public/site-content`, and Firestore-backed content.

## Custom domain (`www.floraldoctor.ca`)

1. In [Firebase Console](https://console.firebase.google.com/) → your project → **Hosting** → **Add custom domain**.
2. Enter **`www.floraldoctor.ca`** and follow the wizard. Firebase will show **DNS records** (usually **A/AAAA** to Google Hosting, sometimes **TXT** for verification).
3. At your **registrar** (where you bought the domain), add those records. Propagation can take minutes to 48 hours.
4. Optionally add the **apex** domain **`floraldoctor.ca`** and set Firebase’s recommended redirect to **www**, or rely on the app’s redirect in `next.config.mjs` (apex → `https://www.floraldoctor.ca`).
5. Set in production env (Firebase / `.env` for deploy):

   ```bash
   NEXT_PUBLIC_SITE_URL=https://www.floraldoctor.ca
   ```

   Redeploy after changing env so metadata and favicon base URL use the real domain.

## Useful links

- [Integrate Next.js with Firebase Hosting](https://firebase.google.com/docs/hosting/frameworks/nextjs)
- [Test, preview, and deploy](https://firebase.google.com/docs/hosting/test-preview-deploy)
