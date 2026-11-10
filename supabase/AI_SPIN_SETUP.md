# AI Spin 360 setup

AI Spin uses Supabase Edge Functions, Meshy Multi-Image-to-3D, and Supabase Storage. Payments use a static QRIS configured by an admin; owners upload proof, and credits are granted only after admin approval. Apply `owner_features.sql`, `ai_spin_billing.sql`, `ai_spin_manual_qris.sql`, and `owner_dashboard_runtime.sql` in the Supabase SQL Editor, in that order. The last script enables booking Realtime, adds persisted check-in/check-out records, adds guarded owner vehicle deletion, and creates admin feature flags. Both AI Spin flags are set to **off** when that script runs.

## Configure the provider and payments

In Supabase **Project Settings → Edge Functions → Secrets**, configure:

- `MESHY_API_KEY`: Meshy API key for the Renmoku account.
- `MESHY_CREDIT_COST_IDR`: actual IDR cost of one Meshy API credit on Renmoku's account.
- `PUBLIC_SITE_URL`: `https://renmoku.biz.id`.

Set `ai_spin_settings.meshy_credits_per_model` to the actual Meshy usage for the chosen quality. The default task requests Meshy 7.1, 2K textured GLB and normally consumes 30 API credits. Package prices are computed as AI provider cost plus 50% of that cost for Renmoku. Verify the credits consumed in the Meshy account before turning on paid generation.

For manual Edge Function deploy from GitHub Actions, add `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` as repository Actions secrets, apply the SQL above first, then run **Deploy Supabase AI Spin** from the Actions tab. This workflow only deploys functions; database SQL and provider secrets must already be configured. The order and model-generation Edge Functions reject requests while their respective admin feature flags are off.

Never place the Meshy API key in frontend variables.

## Deploy the functions

Link the project with Supabase CLI and deploy these functions:

```powershell
supabase link --project-ref <PROJECT_REF>
supabase functions deploy spin-catalog
supabase functions deploy spin-manual-order
supabase functions deploy spin-model-generate
supabase functions deploy spin-model-sync
supabase functions deploy spin-model-publish
supabase functions deploy spin-payment-webhook
supabase functions deploy spin-renewal-webhook
supabase functions deploy spin-payment-reconcile
```

In the admin app, open **QRIS AI Spin**, upload the static QRIS image, and set the instructions. Verify that only administrators can replace the QRIS image and that owners can access only their own private proof uploads. Monthly packages renew manually after admin approval.

## Packages and data flow

Seeded packages are 3, 10, and 25 monthly generations and one-time refills of 1, 5, and 10 generations. Each generation debits one owner credit. SQL reservation locks the wallet to prevent concurrent double spending; failed provider tasks return the credit. Refills are additive. After an admin approves a monthly QRIS payment, the package credits are renewed for one month and unused monthly credits are replaced, while refill credits remain.

Generated GLB files stay in the private storage bucket during review. After owner approval and admin approval of the vehicle submission, the publish function copies the GLB to the public bucket and the listing appears in the Fleet showroom and vehicle detail. Unpublishing hides the listing and removes the public copy.

## Payment review

Open **Admin → QRIS AI Spin**. Compare the uploaded proof, amount, and incoming transfer in the QRIS provider account before approving. Approval and credit grant happen atomically; rejected orders keep the admin note visible to the owner.

This changes new AI Spin purchases to manual review. If any owners already have an active Midtrans recurring subscription, cancel those subscriptions in Midtrans separately; deploying this change does not cancel an existing recurring agreement.

## References

- [Meshy Multi-Image-to-3D API](https://docs.meshy.ai/en/api/multi-image-to-3d)
- [Meshy API pricing](https://docs.meshy.ai/en/api/pricing)
