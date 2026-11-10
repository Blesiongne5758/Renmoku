# AI Spin 360 setup

AI Spin uses Supabase Edge Functions, Meshy Multi-Image-to-3D, Supabase Storage, and Midtrans. The browser never receives the Meshy server key or Midtrans server key. Apply `owner_features.sql` first, then run `ai_spin_billing.sql` in the Supabase SQL Editor.

## Configure the provider and payments

In Supabase **Project Settings → Edge Functions → Secrets**, configure:

- `MESHY_API_KEY`: Meshy API key for the Renmoku account.
- `MESHY_CREDIT_COST_IDR`: actual IDR cost of one Meshy API credit on Renmoku's account.
- `MIDTRANS_SERVER_KEY`: Midtrans server key.
- `MIDTRANS_IS_PRODUCTION`: `false` for sandbox, `true` after production onboarding.
- `PUBLIC_SITE_URL`: `https://renmoku.biz.id`.

Set `ai_spin_settings.meshy_credits_per_model` to the actual Meshy usage for the chosen quality. The default task requests Meshy 7.1, 2K textured GLB and normally consumes 30 API credits. Package prices are computed as AI provider cost plus 50% of that cost for Renmoku. Verify the credits consumed in the Meshy account before turning on paid generation.

Set the frontend build variables in the deployment workflow:

- `VITE_MIDTRANS_CLIENT_KEY`: public Midtrans client key for the same environment.
- `VITE_MIDTRANS_IS_PRODUCTION`: `false` or `true`, matching the Edge Function setting.

For manual Edge Function deploy from GitHub Actions, add `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` as repository Actions secrets, apply the SQL above first, then run **Deploy Supabase AI Spin** from the Actions tab. This workflow only deploys functions; database SQL and provider secrets must already be configured.

The client key is public by design. Never use the server key as a frontend variable.

## Deploy the functions

Link the project with Supabase CLI and deploy these functions:

```powershell
supabase link --project-ref <PROJECT_REF>
supabase functions deploy spin-catalog
supabase functions deploy spin-checkout
supabase functions deploy spin-model-generate
supabase functions deploy spin-model-sync
supabase functions deploy spin-model-publish
supabase functions deploy spin-payment-webhook
supabase functions deploy spin-renewal-webhook
supabase functions deploy spin-payment-reconcile
```

The function configuration disables JWT gateway checks only for the two Midtrans webhook endpoints. Those endpoints validate the payment signature or verify the notification against Midtrans before updating credits.

In Midtrans Dashboard → **Settings → Configuration**, set:

- Payment Notification URL: `https://<PROJECT_REF>.supabase.co/functions/v1/spin-payment-webhook`
- Recurring Notification URL: `https://<PROJECT_REF>.supabase.co/functions/v1/spin-renewal-webhook`

Recurring billing needs Midtrans account enablement and supports credit card and GoPay tokenization. Validate both flows in sandbox before enabling production. The initial Snap payment links the payment method; the backend then creates a monthly Midtrans Subscription.

## Packages and data flow

Seeded packages are 3, 10, and 25 monthly generations and one-time refills of 1, 5, and 10 generations. Each generation debits one owner credit. SQL reservation locks the wallet to prevent concurrent double spending; failed provider tasks return the credit. Refills are additive. Monthly credits renew on a successful recurring charge and unused monthly credits are replaced, while refill credits remain.

Generated GLB files stay in the private storage bucket during review. After owner approval and admin approval of the vehicle submission, the publish function copies the GLB to the public bucket and the listing appears in the Fleet showroom and vehicle detail. Unpublishing hides the listing and removes the public copy.

## Reconcile a monthly payment

If a paid monthly order shows **Pembayaran perlu rekonsiliasi admin**, do not clear the order guard until checking Midtrans. Look up the subscription using the name `RENMOKU_` followed by the first 24 characters of the order UUID without hyphens, and verify the order metadata and amount.

- If the subscription exists, call `spin-payment-reconcile` with an admin session and `{ "orderId": "<ai_spin_orders.id>", "subscriptionId": "<Midtrans subscription id>" }`. The function verifies the subscription against Midtrans and activates the paid credits.
- If Midtrans confirms no subscription exists, call the same function with `{ "orderId": "<ai_spin_orders.id>", "confirmNoSubscription": true }`, then resend the original payment notification from Midtrans Dashboard. The webhook will safely retry subscription creation.

The second action can create a new recurring charge if the subscription check was wrong. Confirm the absence of that subscription in Midtrans before using it.

## References

- [Meshy Multi-Image-to-3D API](https://docs.meshy.ai/en/api/multi-image-to-3d)
- [Meshy API pricing](https://docs.meshy.ai/en/api/pricing)
- [Midtrans Create Subscription API](https://docs.midtrans.com/reference/create-subscription)
- [Midtrans recurring HTTP notifications](https://docs.midtrans.com/reference/http-notification)
