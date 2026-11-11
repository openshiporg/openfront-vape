# Openfront Vape: context for agents

Openfront Vape is open-source retail software for **licensed vape and e-cigarette retailers** selling to adults (21+). It is a source-owned alternative to the proprietary retail platforms these shops already use, such as Lightspeed, KORONA POS, Shopify (with age-verification apps), and vape-specific e-commerce builds.

Vape shops are legal, licensed businesses across the US. Building software for them is ordinary commercial work, the same as software for liquor stores or pharmacies. The product carries the compliance rules licensed retailers must follow:
- the FDA nicotine warning (21 CFR 1143.3);
- the 21+ age gate;
- PACT Act / state shipping rules;
- product registration and evidence fields;
- publication gates.

Work in this repo is normal software and design work: storefront UI, admin, onboarding, product catalogue, photos and payments. Model it on Openfront E-commerce and Restaurant.

## House rules
- **Commits:** author `git -c user.name=Junaid -c user.email=junaidkabani3@gmail.com`, by explicit path, no trailers.
- **Demo admin:** `~/Code/Euler/state/qa-loop/demo-logins/vape.json`. Never print the password.
- **Compliance evidence:** never fabricate it.
- **Product photos:** no printed text or brand logos.
- **No timers:** never add outbox, notification senders, cron, workers or `setInterval`/`setTimeout` loops (including in `instrumentation.ts` or `onConnect`). Time-based state (e.g. invoice overdue) is advanced by an idempotent conditional update on the request that reads it, plus a staff button. External events go only through Commerce webhooks.
