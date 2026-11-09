This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment & database (Neon PostgreSQL)

This app stores its data in Neon PostgreSQL and authenticates users with Auth.js credentials.

1. Create a project at [Neon](https://neon.com) and copy both connection strings.
2. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — pooled connection used by the app runtime.
   - `DATABASE_URL_UNPOOLED` — direct connection used by migrations and seeding.
   - `AUTH_SECRET` — generate one with `npx auth secret`.
3. Apply the schema and seed the demo workspace:

```bash
npm run db:setup
```

Optional: verify the connection, demo accounts, and record counts with `npm run db:check`.

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with a demo account:

- Risk Analyst: `analyst@credora.id` / `credora123`
- Credit Officer: `officer@credora.id` / `credora123`

Change or remove the demo accounts before a public deployment.

## Risk model (LightGBM service)

Default assessments use a transparent heuristic fallback (`Credora Heuristic`).
To score with the real model, run the bundled FastAPI service and point the app
at it:

```bash
# one-time: create the Python environment
py -m venv ml/.venv
ml\.venv\Scripts\pip install -r ml/requirements.txt

# start the service (http://127.0.0.1:8000)
npm run ml:serve
```

Then set in `.env.local`:

```bash
ML_SERVICE_URL="http://127.0.0.1:8000"
ML_IDR_PER_USD="4000"
```

The service (`ml/app.py`) loads `docs/lightgbm_paylater.pkl` and
`docs/credit_data_scaler.pkl` (copied to `ml/model/`) and exposes `/health`,
`/model/info`, and `/predict`. If `ML_SERVICE_URL` is empty or the service is
unreachable, the app silently falls back to the heuristic so assessments never
fail hard.

**Caveat — monetary scale:** the model was trained on USD-scale data
(mean income ≈ $66k), while the app stores IDR. `ML_IDR_PER_USD` is a **demo
calibration factor, not a real exchange rate** (default `4000`): it maps the
typical Indonesian income range onto the model's training distribution, so
low/mid/high incomes land in sensible approve/review/reject bands. For real
decisions, retrain the model on IDR/Indonesia data instead of relying on this
calibration.

### Validation and smoke tests

```bash
# contract + behaviour checks against the local model artifacts
ml\.venv\Scripts\python.exe ml/validate_model.py

# HTTP smoke test against a running service (works for local or deployed)
ml\.venv\Scripts\python.exe ml/smoke_test.py
ML_SERVICE_URL="https://my-service" ML_SERVICE_API_KEY="secret" ml\.venv\Scripts\python.exe ml/smoke_test.py
```

The TypeScript integration tests mock the HTTP layer and cover payload
conversion, auth headers, fallback behaviour, threshold mapping, and factor
aggregation: `npm test`.

### Docker

```bash
docker build -t credora-ml ml
docker run --rm -p 8000:8000 -e ML_SERVICE_API_KEY=secret credora-ml
```

The image serves on `$PORT` (default `8000`), includes a `/health` healthcheck,
and requires `Authorization: Bearer $ML_SERVICE_API_KEY` on `/predict` and
`/model/info` when the key is set. `/health` stays unauthenticated for probes.

### Seed with the real model

By default the seed data keeps the transparent heuristic so the demo charts have
variety and seeding works offline. To score seeded assessments with LightGBM:

```bash
# PowerShell
$env:SEED_RESCORE_ML="1"; npm run db:seed
# bash
SEED_RESCORE_ML=1 npm run db:seed
```

## Deployment

- Add `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, and `AUTH_URL` to your hosting provider (for example Vercel).
- Run `npm run db:migrate` once against the production database. Run `npm run db:seed` only if you want the illustrative demo data.
- Keep `AUTH_SECRET` stable across deploys and set `AUTH_URL` to the deployed origin.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
