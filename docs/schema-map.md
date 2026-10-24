# Openfront Vape: schema and workflow map

Business: a US licensed vape retailer that sells to adults 21+. Regulated commerce fails closed: a sale goes through only when every piece of recorded evidence is current.

Sources: `features/keystone/models/**` (98 lists in 89 model files; `RegulatedAuthority.ts` and `RegulatedTransaction.ts` hold 5 each, `RegulatedProduct.ts` holds 2), `features/keystone/access.ts`, `features/keystone/models/regulatedAccess.ts`, `features/keystone/mutations/**`, `features/keystone/queries/**`, `features/keystone/regulated/**`, `features/keystone/checkout/order-commit.ts`, `features/keystone/orders/order-lifecycle.ts`, `features/regulated-commerce/**`, `features/platform/onboarding/lib/seed.json`.

Conventions used below:
- **Created by**: M = merchant staff (dashboard), C = customer (storefront), S = system (hooks, mutations, webhooks, `sudo()` writes).
- "Generic page" means the parity-locked model pages `/dashboard/<list-key>` (`app/dashboard/(admin)/[listKey]/…`). They hide hook validation messages.
- Every list spreads `trackingFields` (`createdAt`, `updatedAt`).

---

## 0. Access model (short)

| Rule | Where | Effect |
|---|---|---|
| Role checkbox permissions | `models/fields.ts` `permissionsList`, `access.ts` `generatedPermissions` | Human sessions: the role checkbox decides. API keys / OAuth tokens: the credential scope AND the owner's role must both grant it. Customer tokens never hold admin permissions. |
| Regulated permissions | `fields.ts` | `canReadCompliance`, `canManageCompliance`, `canReviewComplianceDecisions`, `canManageComplianceReports`, `canAccessIdentityEvidence`, `canOperateComplianceKillSwitch` |
| `managedComplianceAccess` | `regulatedAccess.ts` | query: read or manage compliance. create/update: `canManageCompliance`. delete: **denied** (records are never deleted). |
| `immutableComplianceAccess` | `regulatedAccess.ts` | query: read compliance. create/update/delete: **denied**, and omitted from GraphQL. Only system code writes them, through `context.sudo().prisma`. |
| Evidence digests | e.g. `evidenceDigest`, `pactEvidenceDigest`, `signatureDigest`, `cartFingerprint` | `read: denyAll`. Identity fields on `AgeVerificationAttempt` need `canAccessIdentityEvidence`. |
| Kill switch field | `RegulatedMerchantProfile.killSwitch` | Create needs `canManageCompliance`. Update needs `canOperateComplianceKillSwitch`. |
| Accepted evidence is immutable | `regulated/authority-revision.ts` `validateAuthorityRevision` | Once a record is in a usable state, any change to its evidence fields fails with "Accepted evidence is immutable…". It may only move to `suspended`/`revoked`/`expired`/`retired`/`emergency_disabled`/`delisted`. It can never go back to draft or review. Usable states need `effectiveAt < expiresAt`. |
| Commerce-owned lists | `Order`, `Cart`, `Payment`, etc. | `Order` GraphQL create/update/delete are all `false`; orders change only through custom mutations. |

---

## 1. Lists

### 1.1 Catalog

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| Product | Sellable vape device, e-liquid, component or accessory | title, handle, description (document), `regulatedCommerceRequired` (default true, compliance-only), `regulatedExemption{Reference,Digest,ReviewedAt,ExpiresAt}`, metadata; virtuals `thumbnail`, `dimensionsRange`, `defaultDimensions` | productVariants, productImages, productOptions, productCategories, productCollections, productTags, productType, shippingProfile, taxRates, discountConditions, discountRules | M (seed creates 10 as draft) | `draft` / `proposed` / `published` / `rejected`. `validateInput` (`Product.ts`): a regulated product cannot be created as published. Publishing runs `assertProductPublicationEvidence` (`regulated/enforcement.ts`): at least one variant, and every variant has an approved, current classification with approved marketing review and a current federal authorization (`federal_marketing_order` or `preexisting_status`, not delisted). The other route is a current reviewed exemption. A published regulated product cannot change title/subtitle/description/metadata ("Unpublish regulated products before changing customer-facing claims"). Turning regulation off needs an exemption reference, a SHA-256 digest, a review time and a future expiry. `afterOperation`: a marketing-copy edit on an unpublished product sets its classifications to `review` and `marketingReviewStatus=revoked`. Products are moved to `draft` automatically by the classification, authorization and image hooks (below). |
| ProductVariant | SKU (flavour, strength, colour) | title, sku, barcode/ean/upc, inventoryQuantity, manageInventory, allowBackorder, hsCode, originCountry, metadata, variantRank; virtual `fullTitle` | product, prices (MoneyAmount), productOptionValues, measurements, location, stockMovements, primaryImage, **regulatedClassification** (1:1), lineItems, claimItems | M | No enum. `validateInput` (`regulated/variant-review.ts`): changes to identity or media fields (title, sku, barcodes, hsCode, origin, material, metadata, product, classification, primaryImage, option values) are blocked while the product is published or holds a current exemption. `afterOperation`: any such change sets the classification to `review` with marketing review revoked, even while the product is a draft. |
| ProductImage | Product and variant media | image (S3 `my_images`), imagePath, altText, order | products, productVariants (primaryImage) | M | `afterOperation`: replacing the image or imagePath (not the alt text) drafts every linked regulated product. It also revokes approved classifications, or revokes marketing review on classifications that are not yet approved. |
| ProductOption | Option axis (Flavour, Strength) | title | product, productOptionValues | M | none |
| ProductOptionValue | Option value | value | productOption, productVariants | M | none |
| ProductCategory | Storefront navigation tree | title, handle, isActive, isInternal | products, parentCategory / categoryChildren, discountConditions | M (seed: 4) | isActive flag |
| ProductCollection | Merchandising group | title, handle | products, discountConditions | M (seed: 3) | none |
| ProductTag | Free tag | value | products, discountConditions | M | none |
| ProductType | Type label used by tax and discounts | value | products, taxRates, discountConditions | M | none |
| Measurement | Variant weight and dimensions, used for carrier packages | type (`weight`/`length`/`width`/`height`), unit, value | productVariant | M | none |
| Location | Stock location | name, address | variants | M | name must be 2 characters or more |
| StockMovement | Stock audit trail | type (`RECEIVE`/`REMOVE`), quantity, reason, note | variant | S (`adjustInventory`, `importInventory`) | append-only by convention |
| ShippingProfile | Groups products to shipping options | name, type (`default`/`gift_card`/`custom`) | products, shippingOptions | M | none |

### 1.2 Pricing

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| MoneyAmount | Variant price per region or currency | amount, compareAmount, min/maxQuantity; virtuals `displayPrice`, `calculatedPrice` | productVariant, region, currency, priceList, priceSet, priceRules | M | none |
| PriceList | Sale or override price book | name, type (`sale`/`override`), status, startsAt/endsAt | moneyAmounts, customerGroups | M | `draft` → `active` (manual) |
| PriceSet | Price-rule container | none | prices, priceRules, ruleTypes | S/M | none |
| PriceRule | Rule-based price | type (`fixed`/`percentage`), value, priority, ruleAttribute/ruleValue | moneyAmounts, priceSet | M | none |
| RuleType | Price-rule attribute vocabulary | name, ruleAttribute | priceSets | M | none |
| Discount | Promo code | code, isDisabled, isDynamic, stackable, startsAt/endsAt, usageLimit/usageCount | discountRule, regions, carts, orders, lineItemAdjustments | M | `isDisabled` flag. `afterOperation` recalculates attached carts. Changes to a cart discount invalidate its compliance evidence (`add/removeDiscountFromActiveCart` → `invalidateCartCompliance`). |
| DiscountRule | Discount value | type (`fixed`/`percentage`/`free_shipping`), allocation (`total`/`item`), value | discounts, discountConditions, products | M | none |
| DiscountCondition | Discount scope | type (products, types, collections, tags, customer_groups), operator (`in`/`not_in`) | discountRule and scope relations | M | none |
| GiftCard | Stored value | code, value, balance, isDisabled, endsAt | region, order, carts, giftCardTransactions | M/S | `isDisabled`. `afterOperation` recalculates carts. |
| GiftCardTransaction | Gift card ledger entry | amount, isTaxable, taxRate | giftCard, order | S | none |
| CustomerGroup | Segment for price lists and discounts | name | users, priceLists, discountConditions | M | none |

### 1.3 Orders and fulfilment

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| Cart | Shopping bag and checkout state | type (`default`/`swap`/`draft_order`/`payment_link`/`claim`), email, **complianceRevision**, idempotencyKey, context, paymentAuthorizedAt; virtuals `subtotal`, `total`, `rawTotal`, `tax`, `shipping`, `discount`, `checkoutStep`, `status`, `isActive`, `abandonedFor`… | user, region, lineItems, shipping/billingAddress, shippingMethods, discounts, giftCards, paymentCollection, payment, order, draftOrder, swap | C (`createActiveCart`), M (admin order create) | Virtual `status`/`checkoutStep`. `beforeOperation` blocks updates or deletes outside the commerce mutations unless the user has `canManageOrders`. Any change to lines, address, shipping, discount or payment calls `invalidateCartCompliance` (`regulated/enforcement.ts`). That bumps `complianceRevision`, revokes passed age attempts, expires quoted tax, revokes decisions and allowed carrier decisions, and logs `cart.compliance_invalidated`. |
| LineItem | Cart line | quantity, isGiftcard, allowDiscounts; virtuals `unitPrice`, `total`, `originalPrice`, `availableInRegion`… | cart, productVariant, lineItemAdjustments, lineItemTaxLines, returnItems, claimItems, swap, claimOrder | C/M | `afterOperation` recalculates the cart payment collection |
| LineItemAdjustment | Discount applied to a line | amount, description | lineItem, discount | S | none |
| LineItemTaxLine | Generic tax line | rate, code, name | lineItem | S | Regulated carts need region taxRate 0 (`GENERIC_TAX_RATE_MUST_BE_ZERO_FOR_REGULATED_CART`) |
| Order | Placed order | displayId, email, status, secretKey, taxRate, idempotencyKey, note; virtuals `subtotal`, `total`, `tax`, `fulfillmentStatus`, `unfulfilled`, `paymentDetails`, `totalPaid`… | cart, user, account, region, currency, lineItems (OrderLineItem), payments, fulfillments, shippingLabels, returns, claimOrders, swaps, events, discounts, giftCards | S (`completeActiveCart` → `checkout/order-commit.ts`) | `pending` → `completed` (derived: every line fully fulfilled, `orders/order-lifecycle.ts`); `completed` → `pending` when a fulfilment is cancelled; `requires_action` (payment webhook problem, `handlePaymentProviderWebhook`); `canceled` / `archived` only through `transitionOrderStatus` (cancel needs no active fulfilments and a full refund; archive needs `completed`). GraphQL CRUD is `false`. At order commit the cart decision, age, tax and carrier evidence are bound to the order and `checkout.compliance_committed` is logged. |
| OrderLineItem | Snapshot of the purchased line | title, sku, quantity, productData, variantData, formattedUnitPrice | order, productVariant, moneyAmount (OrderMoneyAmount), originalLineItem, fulfillmentItems | S | none |
| OrderMoneyAmount | Price snapshot | amount, originalAmount, priceData | orderLineItem, currency, region | S | none |
| OrderEvent | Order timeline | type (ORDER_PLACED, STATUS_CHANGE, PAYMENT_*, FULFILLMENT_STATUS_CHANGE, NOTE_ADDED, EMAIL_SENT, TRACKING_NUMBER_ADDED, RETURN_REQUESTED, REFUND_PROCESSED), data, time | order, user, createdBy | S | append-only by convention |
| DraftOrder | Admin-built order | status, displayId | cart, order | M | `open` → `completed` |
| Fulfillment | Shipment of order lines | shippedAt, canceledAt, data, idempotencyKey | order, fulfillmentItems, shippingLabels, fulfillmentProvider, claimOrder, swap | S (`createOrderFulfillment`, `createProviderShippingLabel`) | No enum; `canceledAt` set by `cancelOrderFulfillment` (blocked while a purchased label exists). `validateInput` checks quantities. Regulated orders: manual fulfilment is refused ("Manual fulfillment is disabled for regulated orders"). A fresh `fulfillment` compliance decision must allow, plus an order-bound adult-signature carrier decision. |
| FulfillmentItem | Quantity per order line | quantity | fulfillment, lineItem (OrderLineItem) | S | quantity validation |
| FulfillmentProvider | Fulfilment adapter (seed `fp_manual`) | name, code, isInstalled, credentials | regions, fulfillments, shippingOptions, shippingProviders | M/seed | isInstalled |
| ShippingLabel | Purchased carrier label | status, carrier, service, rate, trackingNumber, labelUrl | order, provider (ShippingProvider), fulfillment | S (`createProviderShippingLabel`) | `created` → `purchased` / `failed`. Regulated: `requireApprovedCarrierProvider` needs exactly one allowed, unexpired `CarrierEligibilityDecision` for this order and cart fingerprint with `adultSignature=true`, the exact rateId and package digest, and an active carrier `ProviderApproval` bound to that ShippingProvider. |
| ShippingMethod | Shipping chosen on a cart or order | price, data | cart, order, shippingOption, return, claimOrder, swap, shippingMethodTaxLines | C/S | `afterOperation` recalculates the cart |
| ShippingMethodTaxLine | Tax on shipping | rate, code | shippingMethod | S | none |
| CustomShippingOption | Cart-specific shipping price | price | shippingOption, cart | M | none |
| Swap | Exchange | fulfillmentStatus, paymentStatus, differenceDue | order, cart, return, lineItems, fulfillments, payment | M | fulfilment and payment enums (not driven by custom mutations) |

### 1.4 Returns and claims

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| Return | Return of order goods | status, refundAmount, receivedAt, shippingData | order, returnItems, shippingMethod, claimOrder, swap | M (orders slice) | `requested` → `received` (`processReturnRefund` sets it once the provider confirms the refund) / `requires_action` / `canceled`. `afterOperation` on create logs `RETURN_REQUESTED`. A regulated order also gets the ComplianceEvent `regulated.return_refunded` with reason `TAX_AND_REPORTING_REVERSAL_REVIEW_REQUIRED` and `taxReversalRecorded:false`. |
| ReturnItem | Line being returned | quantity, requested/receivedQuantity, note | return, lineItem, returnReason | M | none |
| ReturnReason | Reason vocabulary | value, label | parentReturnReason, returnItems | M | none |
| Refund | Money returned | amount, reason (`discount`/`return`/`swap`/`claim`/`other`), idempotencyKey | payment | S (`processReturnRefund`) | Created only after the provider confirms the exact amount and currency. Manual tender is refused. Idempotent. |
| ClaimOrder | Claim for a missing, wrong or damaged item | type (`refund`/`replace`), paymentStatus, fulfillmentStatus, refundAmount | order, claimItems, fulfillments, lineItems, return, address, shippingMethods | M | `paymentStatus` `na`/`not_refunded`/`refunded`; `fulfillmentStatus` 9 values; changed by hand (`UpdateClaimOrder`) |
| ClaimItem | Claimed line | reason (`missing_item`/`wrong_item`/`production_failure`/`other`), quantity, note | claimOrder, lineItem, productVariant, claimImages, claimTags | M | none |
| ClaimImage | Claim photo | image, url, altText | claimItem | M | none |
| ClaimTag | Claim label | value | claimItems | M | none |

### 1.5 Customers and accounts

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| User | Staff and customers (one list) | name, email, password, phone, onboardingStatus, hasAccount, customerToken; virtuals `firstName`, `lastName`, `activeCartId`, `billingAddress` | role, addresses, carts, orders, accounts, invoices, businessAccountRequest, apiKeys, webhookEndpoints, team/teamLead, customerGroups, notifications, payments, userField | C (sign-up), M | `onboardingStatus` `not_started` → `in_progress` → `completed` / `dismissed` (onboarding). Sign-up (`features/storefront/lib/data/user.ts` `signUp`) needs the `age_21` box and writes ComplianceEvent `AGE_ATTESTED_21`. That write is best-effort: a failure is logged and swallowed. |
| UserField | Login and security metadata | lastLoginIp, loginHistory, preferences, failedLoginAttempts | user | S | none |
| Address | Customer or shipping-origin address | first/last name, address1/2, city, province (US two-letter state, matched to `US-XX` jurisdictions), postalCode, phone, isBilling; virtual `label` | user, country, carts (billing/shipping), orders (billing/shipping), claimOrders, swaps, shippingProviders (fromAddress) | C (`createActiveUserAddress`), M | Hooks block re-pointing cart or order links, and block updates or deletes of an address any cart or order references (`security/address-command.ts` `assertAddressUnreferenced`), so a changed address is a new row. `cartIdsUsingAddress` in `enforcement.ts` is currently unused. |
| Account | Business (B2B) credit account | accountNumber, status, accountType (`business`/`personal`), totalAmount, paidAmount, creditLimit, dueDate; virtuals `balanceDue`, `availableCredit`, `unpaidLineItemsByRegion`… | user, currency, orders, lineItems (AccountLineItem), invoices | S (on request approval) | `active` / `suspended` / `not_approved` / `paid` / `overdue` (manual via invoices slice `UpdateAccountStatus`) |
| AccountLineItem | Charge posted to an account per order | amount, paymentStatus, orderDisplayId | account, order, region, invoiceLineItems | S (account checkout) | `unpaid` → `paid` / `canceled` |
| Invoice | Statement of account charges | invoiceNumber, status, totalAmount, dueDate, paidAt; virtuals `formattedTotal`, `itemCount`, `paymentSessions` | user, account, currency, lineItems (InvoiceLineItem), paymentCollection | C (`createInvoiceFromLineItems`) | `draft`/`sent`/`paid`/`overdue`/`cancelled` (default `paid`); `completeInvoicePayment` captures |
| InvoiceLineItem | Join between invoice and account charge | none; virtuals `orderDisplayId`, `formattedAmount` | invoice, accountLineItem | S | `validateInput` checks the link |
| BusinessAccountRequest | Application for a credit account | businessName, businessType, monthlyOrderVolume, requested/approvedCreditLimit, reviewNotes, status | user | C, reviewed by M | `pending` → `approved` / `not_approved` / `requires_info`. Must be created as pending. Approved requests are locked. `afterOperation` on approval creates the Account. |
| Team | Staff team | name, description | members, leader | M | leader must be a member; a team with members cannot be deleted |
| Role | Permission bundle (checkbox per permission, including the 6 compliance permissions) | name, `can*` checkboxes | assignedTo (users) | M | none |
| Invite | Staff invite | userEmail, role (`admin`/`member`/`developer`), token, expiresAt, accepted | none | M | `accepted` flag |
| Notification | Outbound message record (also privacy requests) | eventName, to, data | user, notificationProvider | S (`requestPrivacyAction`) | none |
| NotificationProvider | Notification channel | isInstalled | notifications | M | none |

### 1.6 Payments

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| PaymentProvider | Payment adapter (seed: Manual `pp_system_default`; adapters in `features/integrations/payment/{stripe,paypal,manual}.ts`) | name, code, isInstalled, credentials / credentialReference, `*Function` adapter names | regions, sessions | M/seed | isInstalled. Manual tender cannot finish storefront checkout (`completeActiveCart` `settlePaymentSession`). Regulated checkout also needs an active `payment` ProviderApproval bound to this provider. |
| PaymentCollection | Amount to collect for a cart or invoice | amount, authorizedAmount, refundedAmount, description (`default`/`refund`) | cart, invoice, paymentSessions, payments | S | none |
| PaymentSession | Per-provider session | isSelected, isInitiated, amount, data, paymentAuthorizedAt | paymentCollection, paymentProvider | S (`createActiveCartPaymentSessions`, `initiatePaymentSession`) | `initiatePaymentSession` and `setActiveCartPaymentSession` run the `payment` compliance purpose |
| Payment | Captured or authorised payment | amount, currencyCode, amountRefunded, status, capturedAt | order, cart, paymentCollection, captures, refunds, user, currency, swap | S | `pending` → `authorized` → `captured`; `failed` / `canceled`; set by checkout and `handlePaymentProviderWebhook` |
| Capture | Capture record | amount | payment | S | none |

### 1.7 Shipping

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| ShippingOption | Shipping rate offered at checkout (seed: Standard, Express, Return) | name, priceType (`flat_rate`/`calculated`/`free`), amount, isReturn, adminOnly; virtuals `calculatedAmount`, `isTaxInclusive` | region, fulfillmentProvider, shippingProfile, shippingOptionRequirements, shippingMethods, taxRates, customShippingOptions | M/seed | none. Regulated: the selected option must match the cart's allowed CarrierEligibilityDecision. |
| ShippingOptionRequirement | Subtotal threshold | type (`min_subtotal`/`max_subtotal`), amount | shippingOption | M | none |
| ShippingProvider | Carrier API adapter (`features/integrations/shipping/{shippo,shipengine,manual}.ts`) | name, isActive, accessToken / credentialReference, `*Function` adapter names | regions, labels, fulfillmentProvider, fromAddress | M | isActive. Needs a `carrier` ProviderApproval bound to it for regulated labels. |

### 1.8 Regions and tax

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| Store | The single storefront's settings | name, defaultCurrencyCode, homepageTitle/Description, logoIcon/logoColor, **metadata** (`business` = legalName, email, phone, address, licenses; `policies` = shipping, returns, ageVerification, privacy, terms; per `features/platform/store-settings/lib/store-info.ts`), link templates; virtual `paymentProviders` | currencies | seed/M | `validate` checks the logo SVG. Feeds the release gate `STORE_POLICIES_REQUIRED` (legal name, at least one licence and all five policies required). |
| Region | Market (seed: `us`, USD, taxRate 0) | code, name, taxRate, taxCode, automaticTaxes, giftCardsTaxable | currency, countries, paymentProviders, fulfillmentProviders, shippingProviders, shippingOptions, taxRates, taxProvider, discounts, giftCards, carts, orders, moneyAmounts, accountLineItems | seed/M | none. A regulated cart needs region taxRate 0; regulated tax comes from `RegulatedTaxQuote`. |
| Country | Country in a region | iso2, iso3, numCode, name | region, addresses | seed/M | none |
| Currency | Currency | code, symbol, name; virtual `noDivisionCurrency` | regions, moneyAmounts, orders, payments, stores, accounts, invoices | seed/M | none |
| TaxRate | Generic tax rate override | rate, code, name | region, products, productTypes, shippingOptions | M | none |
| TaxProvider | Generic tax adapter | isInstalled | regions | M | none |
| SalesChannel | Channel label | name, isDisabled | none | M | isDisabled |

### 1.9 Regulated compliance

All of these live in `models/RegulatedAuthority.ts`, `RegulatedProduct.ts`, `RegulatedTransaction.ts` and `RegulatedReporting.ts`. Evidence is "current" only between `effectiveAt` and `expiresAt` (`isCurrentEvidence`, `regulated-commerce/core/decision-engine.ts`). Nothing expires a record on a schedule: lapsed evidence simply stops counting when it is read.

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| Jurisdiction | Legal place a sale ships to, e.g. `US-CA` (matched as `<country iso2>-<province>`) | code (unique), name, level (`country`/`state`/`county`/`municipality`/`postal`), postalScope, authoritySources | parent / children | M (compliance) | `draft` → `active` → `retired`. Active needs at least one authority source. No revision lock. |
| RegulatedRuleSet | Signed policy pack version per jurisdiction (vocabulary: `policy-packs/us-ends/manifest.ts`; rule types in `core/decision-types.ts`) | packName, version, policyHash (unique), authorityCitations, rules (JSON, checked by `core/policy-validation.ts`), effectiveAt/expiresAt, approvedAt, signatureDigest | jurisdiction, reviewedBy (User) | M (compliance) | `draft` → `approved` → `active` → `retired` / `emergency_disabled`. Active needs a reviewer, approvedAt, a SHA-256 signature, citations and valid rules. Immutable once `approved` or `active`. The engine needs exactly one active rule set per destination. |
| RegulatedMerchantProfile | The licensed retailer's legal authority to sell | legalName, enabledCategories, complianceOwner, escalationContacts, counsel/insurance references, **pactRegistered**, pactRegistrationReference, pactEvidenceDigest, effectiveAt/expiresAt, **killSwitch** (default **true**) | store, originJurisdiction, launchJurisdictions[], licenses[] (MerchantLicense), providerApprovals[] (ProviderApproval) | M (compliance); onboarding creates a draft with killSwitch on (`onboarding/hooks/useOnboardingApi.ts`) | `draft` → `review` → `active` → `suspended` / `revoked`. Active needs PACT registration, a reference, a SHA-256 PACT digest, an origin and bounded dates. Immutable while active. The kill switch can always be turned on (`stopRegulatedCommerce` sets killSwitch and moves active → suspended). The engine needs exactly one active profile. |
| MerchantLicense | State or local tobacco/ENDS licence | licenseType, licenseNumber, issuingAuthority, authorityReference, evidenceDigest, verificationSource, effectiveAt/expiresAt, verifiedAt | profile, jurisdiction | M (compliance) | `draft` → `active` / `conditioned` → `suspended` / `expired` / `revoked`. Usable needs verifiedAt and a SHA-256 digest. Immutable once usable. Counted only when the rule set has a `license_required` rule. |
| ProviderApproval | Approval of an identity, payment, tax, registry or carrier provider for this merchant | purpose, providerCode, coveredCategories, coveredJurisdictionCodes, capabilities, approvalReference, evidenceDigest, effective/expires/validatedAt | profile, paymentProvider (purpose payment), shippingProvider (purpose carrier) | M (Compliance Center sheet `compliance-center/components/ProviderApprovalSheet.tsx`) | `unconfigured` → `review` → `active` → `suspended` / `expired` / `revoked`. Active needs a profile, bounded validated evidence, non-empty categories, jurisdictions and capabilities, and a bound provider for payment or carrier. Immutable while active. |
| RegulatedProductClassification | Reviewed ENDS classification of one variant | category (`ends_device`, `e_liquid`, `component`, `accessory`, `tobacco_derived_nicotine`, `synthetic_nicotine`), nicotineSource, nicotineConcentrationMgMl, flavor, packageUnits, liquidVolumeMl, manufacturer, brand, sourceReference, evidenceDigest, marketingReviewStatus (`pending`/`approved`/`rejected`/`revoked`), marketingEvidenceDigest, marketingReviewedAt | variant (1:1), reviewedBy, authorizations[] | M (product page ClassifySheet) | `draft` → `review` → `approved` → `rejected` / `revoked`. Approved needs a reviewer, bounded dates, a product digest, and an approved marketing review with digest and time. Immutable once approved. `afterOperation`: if an update leaves status or marketing review not approved, the linked published product is moved to `draft`. Variant, image and copy edits push it back to `review` or `revoked` (see Catalog). |
| ProductAuthorization | FDA marketing order, pre-existing status, or state/local directory listing | authority, authorizationType (`federal_marketing_order`/`preexisting_status`/`state_directory`/`local_directory`), authorizationIdentifier, evidenceUrl, evidenceDigest, claimRestrictions, effectiveAt, expiresAt, delistedAt, sellThroughEndsAt, lastVerifiedAt | classification, jurisdiction | M (ClassifySheet: create only) | `pending` → `authorized` → `suspended` / `delisted` / `denied` / `expired`. Authorized needs effectiveAt, lastVerifiedAt and a digest. Immutable once authorized. `afterOperation`: an update to anything but authorized drafts the linked published product. A directory type is needed only for a `directory_required` rule. |
| AgeVerificationAttempt | Hashed identity and age result from the approved identity provider | subjectDigest, thresholdAge (21 or more), verifiedAge, providerCode, providerTransactionId (unique), result, addressMatch (`not_checked`/`matched`/`mismatched`/`indeterminate`), evidenceDigest, consentPolicyVersion, cartFingerprint, issued/expires/deleteAfter | cart, order | S (`regulated/evidence-ingestion.ts` `recordVerifiedIdentityResult`; **no GraphQL or webhook entry point calls it**) | `pending` / `passed` / `failed` / `manual_review` / `expired` / `revoked`. Passed attempts on an open cart are set to `revoked` by `invalidateCartCompliance`. Bound to the order at commit. |
| RegulatedTaxQuote | Sales, excise and local fee quote from the approved tax provider | providerCode, providerReference, idempotencyKey, salesTaxAmount, exciseTaxAmount, localFeeAmount, breakdown, stampRequirements, evidenceDigest, issued/expires/committedAt, reversalReference | cart, order, jurisdiction | S (`regulated/transaction-evidence.ts` `recordRegulatedTaxQuote` / `commitRegulatedTaxQuote`; `regulated/reversals.ts` `reverseRegulatedTaxCommit`; **none is wired to GraphQL**) | `quoted` → `committed` (provider acknowledged) → `reversed` (provider acknowledged) / `voided`; `failed`; `expired` (cart changed). Checkout adds the committed quote total to the cart total. |
| CarrierEligibilityDecision | Approved carrier's ruling for this cart: service, rate, package, adult signature | carrierCode, serviceCode, rateId, packageDigest, origin/destinationJurisdictionCode, regulatedCategories, quantities, **adultSignature**, packageMarkings, evidenceDigest, idempotencyKey, issued/expires | cart, order, providerApproval, shippingOption | S (`transaction-evidence.ts` `recordCarrierEligibility`; **not wired to GraphQL**) | `allow` / `deny` (default) / `manual_review` / `expired` / `revoked`. Allow needs adultSignature. Revoked by cart changes and by the emergency stop (unbound ones only). |
| ComplianceDecision | Immutable per-cart engine verdict with a snapshot | purpose (`catalog_publication`/`cart`/`shipping`/`payment`/`checkout`/`fulfillment`), result (`allow`/`deny`/`manual_review`), policyPack/Version/Hash, ruleIds, reasonCodes, evidenceReferences, snapshot, snapshotDigest, idempotencyKey, issued/expires (5 minutes at most, `regulated/snapshot-expiry.ts`), revokedAt | cart, order, merchantProfile, jurisdiction, supersededBy, events[] | S (`evaluateCartCompliance` with persist) | Result is fixed at write time. `revokedAt` is set on cart change and by the emergency stop. Linked to the order at commit. |
| ComplianceEvent | Append-only compliance audit log | eventType, resourceType, resourceId, actorId, reasonCode, evidenceDigest, data, occurredAt | decision, order | S | Event types written: `cart.compliance_invalidated`, `checkout.compliance_committed`, `tax.commit_acknowledged`, `tax.reversal_acknowledged`, `regulated.return_refunded`, `merchant.emergency_stop`, `report.generated`, `report.submission_recorded`, `evidence.inventory_exported`, `AGE_ATTESTED_21` |
| ComplianceReportRun | Generated evidence report and filing receipt | reportType (only `evidence_inventory` is implemented), periodStartsAt/EndsAt (93 days at most), sourceTransactionIds, policyVersions, contentDigest, content, artifactReference, generatedAt, submittedAt, filingReceiptReference | jurisdiction, merchantProfile, generatedBy, submittedBy, supersedes | S (`generateComplianceReport`, `exportComplianceInventory`) | `generated` → `submitted` / `accepted` / `rejected` (`recordComplianceReportSubmission`); `reviewed` and `corrected` exist but nothing sets them. GraphQL CRUD is omitted. |

### 1.10 Platform and system

| List | Purpose here | Key fields | Relationships | Created by | States and transitions |
|---|---|---|---|---|---|
| ApiKey | Scoped machine credential | name, tokenSecret (password), tokenPreview, scopes, expiresAt, lastUsedAt, restrictedToIPs | user | M | `active` / `inactive` / `revoked`; owner-only unless `canManageKeys` |
| OAuthApp | Third-party app (e.g. OMS) | clientId/secret, redirectUris, scopes, webhookUrl | none | M | `active` / `suspended` / `pending` |
| OAuthToken | OAuth code or token | tokenType, scopes, expiresAt, isRevoked, PKCE fields | user | S | `isRevoked` `false` → `true` |
| WebhookEndpoint | Outbound webhook subscription | url, events, secret, scope (`STORE`/`USER`), isActive, failureCount | user, webhookEvents | M / C (`registerWebhookEndpoint`) | isActive; customer tokens may subscribe only to `fulfillment.created` |
| WebhookEvent | Delivery outbox | eventType, payload, deliveryAttempts, delivered, nextAttempt, deadLetteredAt | endpoint | S | pending → delivered / dead-lettered (`retryWebhookDeliveries`) |
| BatchJob | Import or export job | type (`PRODUCT_IMPORT`/`ORDER_EXPORT`/`INVENTORY_UPDATE`/`PRICE_UPDATE`), context, result, progress | createdBy | M/S | `CREATED` → `PROCESSING` → `COMPLETED` / `FAILED` / `CANCELED` |
| IdempotencyKey | Checkout, refund and fulfilment recovery ledger | idempotencyKey, request*, responseBody, recoveryPoint, lockedAt | none | S | `recoveryPoint` (e.g. `started`, `payment_confirmed`, `completed`, `failed`), `features/keystone/checkout/recovery.ts` |
| Note | Free note on any resource | value, resourceType, resourceId, authorId | polymorphic (no relation) | M | none |
| Team, Role, Invite, Notification, NotificationProvider | see 1.5 | | | | |

---

## 2. Merchant workflows

### (a) Go live

Readiness is computed by `regulatedCommerceReadiness` (`queries/regulatedCommerceReadiness.ts`). The hard gate is `releaseBlockers` (`regulated-commerce/core/release-gate.ts`). It runs on every cart, payment and checkout purpose, but not on fulfilment.

| Step | Lists | Rule that must hold | Blocker code if it fails |
|---|---|---|---|
| 1. Store details and policies | Store.metadata `business` + `policies` | legalName, at least one licence line, all of shipping/returns/ageVerification/privacy/terms (`missingStoreInfo`) | `STORE_POLICIES_REQUIRED` (release gate) |
| 2. Merchant profile | RegulatedMerchantProfile | status active, PACT registered with reference and SHA-256 digest, origin, bounded dates | `ACTIVE_MERCHANT_PROFILE_REQUIRED` (gate); `EXACTLY_ONE_ACTIVE_MERCHANT_PROFILE_REQUIRED` (readiness) |
| 3. Kill switch off | RegulatedMerchantProfile.killSwitch (default on) | at least one active profile with killSwitch false | `KILL_SWITCH_ENABLED` |
| 4. Launch jurisdictions | Jurisdiction (active, authority sources) linked as `launchJurisdictions` | at least one | `LAUNCH_JURISDICTION_REQUIRED` |
| 5. Licences | MerchantLicense | active or conditioned, verified, digest; needed when a rule set has `license_required` | per-cart `MERCHANT_LICENSE_REQUIRED` |
| 6. Rule sets | RegulatedRuleSet | one active, approved, signed, valid rule set per destination | `ACTIVE_REVIEWED_POLICY_REQUIRED` (readiness); per-cart `ACTIVE_POLICY_REQUIRED` |
| 7. Provider approvals | ProviderApproval × identity, payment, tax, carrier, registry | active and current; payment and carrier bound to PaymentProvider / ShippingProvider | `<PURPOSE>_PROVIDER_AUTHORITY_REQUIRED` (readiness only) |
| 8. Sellable product evidence | RegulatedProductClassification + ProductAuthorization | at least one approved classification with a current federal authorization | `CURRENT_PRODUCT_AND_FEDERAL_AUTHORITY_REQUIRED` (readiness only) |
| 9. Sales enabled | none (derived) | `releaseBlockers` returns nothing, so `transactionMode` is `enabled` | otherwise `assertCommerceReleaseEnabled` throws "Checkout isn't available for this store yet." |

Note: the release gate checks only steps 1–4. Steps 5–8 are enforced per cart by the decision engine, and steps 7–8 are also shown as readiness blockers.

### (b) Catalog: product to publish

| Step | Lists | Enforcement |
|---|---|---|
| Create product (draft) | Product | creating a regulated product as published is refused |
| Add options, variants, prices, images, measurements | ProductOption, ProductOptionValue, ProductVariant, MoneyAmount, ProductImage, Measurement | none until published |
| Classify each variant | RegulatedProductClassification | approval needs a reviewer, digest, dates and an approved marketing review |
| Add authorization | ProductAuthorization | `authorized` needs lastVerifiedAt and a digest; must be a federal type for publication |
| Publish | Product.status → published | `assertProductPublicationEvidence` / `assertVariantPublicationEvidence` (`regulated/enforcement.ts`) |
| Out-of-scope product | Product.regulatedCommerceRequired=false + exemption fields | compliance permission; reference, digest, review time and future expiry |
| Edit after publishing | Product, ProductVariant, ProductImage | copy and variant identity edits blocked while published; an image swap drafts the product and revokes classifications |
| Evidence withdrawn | Classification / Authorization update to a non-usable state | `afterOperation` drafts the published product (`draftLinkedProduct`). Lapse by date does not draft; the cart is denied instead. |

### (c) Checkout

| Step | Mutation | Lists | Compliance purpose |
|---|---|---|---|
| Create bag | `createActiveCart` | Cart | none |
| Add or change lines | `updateActiveCartLineItem`, `updateActiveCart` | LineItem, Cart | each variant must pass `assertVariantPublicationEvidence`; invalidates evidence. `activeCart` evaluates purpose `cart` for display. |
| Address | `updateActiveCart`, `createActiveUserAddress` | Address, Cart | invalidates; destination `US-<state>` resolves Jurisdiction |
| Shipping | `addActiveCartShippingMethod` | ShippingMethod | evaluates purpose `cart` ("Regulated shipping denied: …" on deny), then needs one allowed CarrierEligibilityDecision for this option, fingerprint and origin/destination; invalidates prior evidence |
| Discount | `add/removeDiscountFromActiveCart` | Discount, LineItemAdjustment | invalidates |
| Age verification | `recordVerifiedIdentityResult` (internal only) | AgeVerificationAttempt | passed, 21 or older, `addressMatch=matched`, current, same fingerprint |
| Tax quote and commit | `recordRegulatedTaxQuote` / `commitRegulatedTaxQuote` (internal only) | RegulatedTaxQuote | `payment`/`checkout` need `committed` |
| Carrier eligibility | `recordCarrierEligibility` (internal only) | CarrierEligibilityDecision | adultSignature=true |
| Payment session | `createActiveCartPaymentSessions`, `setActiveCartPaymentSession`, `initiatePaymentSession` | PaymentCollection, PaymentSession | purpose `payment`: age, committed tax, carrier evidence and an active payment ProviderApproval covering the jurisdiction and categories. Selecting a provider invalidates prior evidence. |
| Pre-check (optional) | `evaluateActiveCartCompliance` query | none (read; persists nothing unless asked) | any |
| Place order | `completeActiveCart` → `checkout/order-commit.ts` | ComplianceDecision (purpose checkout, persisted), IdempotencyKey, Order, OrderLineItem, Payment, ComplianceEvent | `checkout`; snapshot must match the accepted fingerprint; evidence bound to the order |

Deny reason codes come from `decision-engine.ts`, for example `MERCHANT_NOT_ACTIVE`, `MERCHANT_KILL_SWITCH_ACTIVE`, `PACT_REGISTRATION_NOT_RECORDED`, `DESTINATION_JURISDICTION_UNRESOLVED`, `DESTINATION_NOT_IN_MERCHANT_LAUNCH_SCOPE`, `GENERIC_TAX_RATE_MUST_BE_ZERO_FOR_REGULATED_CART`, `ACTIVE_POLICY_REQUIRED`, `CATEGORY_NOT_ENABLED_FOR_MERCHANT`, `MARKETING_REVIEW_REQUIRED`, `PRODUCT_CLASSIFICATION_REQUIRED`, `FEDERAL_AUTHORIZATION_REQUIRED`, rule codes (`CATEGORY_PROHIBITED`, `FLAVOR_PROHIBITED`, `QUANTITY_LIMIT_EXCEEDED`, `DESTINATION_AUTHORIZATION_REQUIRED`, `REQUIRED_PACKAGE_MARKING_MISSING`, `MERCHANT_LICENSE_REQUIRED`, `POLICY_REQUIREMENT_NOT_IMPLEMENTED`), `CURRENT_IDENTITY_AND_ADDRESS_EVIDENCE_REQUIRED`, `CURRENT_TAX_EVIDENCE_REQUIRED` / `COMMITTED_TAX_EVIDENCE_REQUIRED`, `PAYMENT_PROVIDER_APPROVAL_REQUIRED` and `APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED`, plus the release-gate codes.

Gap: no GraphQL mutation, webhook or adapter writes AgeVerificationAttempt, RegulatedTaxQuote or CarrierEligibilityDecision (`features/regulated-commerce/providers/contracts.ts` defines the adapter interfaces only). A regulated cart therefore always ends in deny at checkout today. The seeded Manual provider is also refused by storefront checkout.

### (d) Fulfilment

| Step | Mutation | Lists | Rule |
|---|---|---|---|
| Rates | `getRatesForOrder` | ShippingProvider | regulated: only the exact approved rate (`selectExactApprovedCarrierRate`) |
| Buy label | `createProviderShippingLabel` | ShippingLabel, Fulfillment, FulfillmentItem, OrderEvent | `requireApprovedCarrierProvider`: a `fulfillment` decision that allows, plus an order-bound, current, adult-signature CarrierEligibilityDecision with matching rateId and package digest and an active carrier approval bound to the provider |
| Manual fulfilment | `createOrderFulfillment` | Fulfillment | refused for regulated orders |
| Order status | `reconcileOrderFulfillmentStatus` | Order, OrderEvent | `pending` → `completed` when every line is fulfilled |
| Cancel | `cancelShippingLabel` then `cancelOrderFulfillment` | ShippingLabel, Fulfillment | the label must be cancelled first |
| Track | `trackShipment` | ShippingLabel | none |

### (e) Returns, claims and refunds

| Step | Mutation / UI | Lists | Regulated effect |
|---|---|---|---|
| Request return | orders slice `CreateReturn` | Return, ReturnItem, ReturnReason, OrderEvent `RETURN_REQUESTED` | none |
| Refund | `processReturnRefund` | Refund, Payment.amountRefunded, Return → `received`, OrderEvent `REFUND_PROCESSED`, WebhookEvent | ComplianceEvent `regulated.return_refunded`, reason `TAX_AND_REPORTING_REVERSAL_REVIEW_REQUIRED` |
| Tax reversal | `reverseRegulatedTaxCommit` (internal only, no GraphQL) | RegulatedTaxQuote → `reversed`, ComplianceEvent `tax.reversal_acknowledged` | needs provider acknowledgement of the exact amount |
| Claim | orders slice `CreateClaimOrder/Item/Image`, `UpdateClaimStatus` | ClaimOrder, ClaimItem, ClaimImage, ClaimTag | none |
| Cancel order | `transitionOrderStatus(canceled)` | Order | needs full refund and no fulfilments; invoiced account orders refused |

### (f) Safety stop

| Step | Mutation | Lists | Effect |
|---|---|---|---|
| Emergency stop | `stopRegulatedCommerce(profileId, reason)` (`canOperateComplianceKillSwitch`; reason of 10–500 characters) | RegulatedMerchantProfile (row lock, killSwitch=true, active → suspended), ComplianceDecision (all open ones revoked), CarrierEligibilityDecision (unbound allows revoked), ComplianceEvent `merchant.emergency_stop` (`regulated/emergency-stop-audit.ts`, `inFlightReviewRequired:true`) | one transaction; release gate then returns `KILL_SWITCH_ENABLED` |
| Resume | edit RegulatedMerchantProfile killSwitch off and status back to active | RegulatedMerchantProfile | needs `canOperateComplianceKillSwitch` for the field and `canManageCompliance` for the record |
| Disable a rule set | RegulatedRuleSet → `emergency_disabled` | RegulatedRuleSet | allowed from approved or active |
| In-flight review | none | ComplianceEvent | nothing lists orders placed before the stop |

### (g) Reporting

| Step | Mutation | Lists | Notes |
|---|---|---|---|
| Evidence inventory | `exportComplianceInventory(profileId)` | ComplianceReportRun (`evidence_inventory`), ComplianceEvent `evidence.inventory_exported` | `canManageComplianceReports`; Compliance Center button |
| Period report | `generateComplianceReport(reportType, jurisdictionId, merchantProfileId, periodStartsAt, periodEndsAt)` | ComplianceReportRun, ComplianceEvent `report.generated` | only `evidence_inventory`; 93 days at most; "not a jurisdiction filing" |
| Record filing | `recordComplianceReportSubmission(reportId, filingReceiptReference, status)` | ComplianceReportRun → submitted / accepted / rejected, ComplianceEvent | from generated, reviewed or submitted |
| Finance close | `getFinanceClose(start, end)` | Orders, payments, refunds | no UI |

### (h) Customer

| Step | Code | Lists |
|---|---|---|
| Sign up with 21+ box | `features/storefront/lib/data/user.ts` `signUp`, register form `modules/account/components/register` | User, ComplianceEvent `AGE_ATTESTED_21` (best effort). A self-attestation does not count as age-verification evidence. |
| Age gate | `modules/layout/components/age-gate` (cookie, 30 days) | none |
| Addresses | `create/update/deleteActiveUserAddress` | Address |
| Orders | `getCustomerOrders`, `getCustomerOrder(orderId, secretKey)` | Order (customer filter) |
| Business account and invoices | `BusinessAccountRequest`, `getCustomerAccount(s)`, `getUnpaidLineItemsByRegion`, `createInvoiceFromLineItems`, invoice payment mutations, `getCustomerPaidInvoices` | BusinessAccountRequest, Account, AccountLineItem, Invoice, InvoiceLineItem, PaymentSession |
| Profile and password | `updateActiveUser`, `updateActiveUserPassword`, `sendUserPasswordResetLink` / `redeemUserPasswordResetToken` | User |
| Privacy | `getMyPrivacyData`, `updatePrivacyPreferences`, `requestPrivacyAction` | UserField.preferences, Notification |
| Customer token | `regenerateCustomerToken` | User.customerToken |

### (i) Store setup

| Step | Lists | Where |
|---|---|---|
| Onboarding seed | Store, Region (`us`, taxRate 0), Currency, Country, ShippingOption ×3, ProductCategory ×4, ProductCollection ×3, Product ×10 (draft), PaymentProvider (Manual), FulfillmentProvider (`fp_manual`), draft RegulatedMerchantProfile (if `canManageCompliance`) | `features/platform/onboarding/lib/seed.json`, `hooks/useOnboardingApi.ts`, mounted in `features/dashboard/components/DashboardLayout.tsx` / `Sidebar.tsx` |
| Store settings, business, policies | Store | `/dashboard/platform/store` |
| Regions and markets | Region, Country, Currency, TaxRate | `/dashboard/platform/regions`, `/markets`, `/regions-management` |
| Payment providers | PaymentProvider (+ payment ProviderApproval) | `/dashboard/platform/payment-providers` |
| Shipping providers and options | ShippingProvider, ShippingOption, ShippingProfile, FulfillmentProvider (+ carrier ProviderApproval) | `/dashboard/platform/shipping-providers`, `/shipping-options`, `/shipping` |
| Staff and roles | User, Role, Team, Invite | `/dashboard/platform/users` (users only) |

---

## 3. Coverage: platform pages

Route = `app/dashboard/(admin)/platform/<route>/page.tsx`; slice = `features/platform/<slice>/`.

Baseline: commit `b0104de`. While this map was being written, new untracked routes and slices appeared in the working tree (`overview`, `merchant-profiles`, `jurisdictions`, `product-evidence`, `provider-approvals`, `compliance-ledger`, `compliance-reports`, plus `features/platform/components/compliance-form.tsx`). They are not assessed here. Re-check the MISSING rows below once that work lands.

**Merchant home / overview: MISSING.** Nothing sits under `/platform`. The nav item `Overview → /platform/overview` (`features/platform/lib/navigation.ts`) has no route, and `/dashboard` (`features/dashboard/screens/HomePage.tsx`) is the parity-locked model grid.

**Dead links:** `navigation.ts` and Compliance Center (`compliance-center/screens/ComplianceCenterPage.tsx` `resources`, blocker links) point to `/dashboard/platform/merchant-profiles`, `/jurisdictions`, `/product-evidence`, `/provider-approvals`, `/compliance-ledger` and `/compliance-reports`. None of these routes exists, so all six return 404. The inventory list links to `/dashboard/platform/inventory/<id>`, which also does not exist.

### 3.1 By workflow

| Workflow | Existing page | Status | Why |
|---|---|---|---|
| (a) Go-live checklist and readiness | `/platform/compliance` (compliance-center) | THIN | Shows blockers, counts, safety controls, provider-approval sheet and recent reports. Cannot create or activate the profile, licences, jurisdictions or rule sets, and its links to do so are dead. |
| (a) Store policies | `/platform/store` (store-settings) | ok | edits Store.metadata business and policies |
| (b) Catalog to publish | `/platform/products`, `/products/[id]`, `/products/create` (products) | THIN | ClassifySheet creates and edits a classification and creates authorizations. It cannot suspend, delist or revise an authorization, cannot record an exemption, and has no revision flow for immutable approved evidence. |
| (c) Checkout evidence (age, tax, carrier) | none | MISSING | no adapter, ingestion endpoint or review UI |
| (c) Admin order create | `/platform/orders/create` (orders) | ok | |
| (d) Fulfilment and adult-signature label | `/platform/orders/[id]/fulfill` (orders) | THIN | rates, label and fulfilment work, but carrier-eligibility evidence and the reason a regulated label is refused are not shown; no label-cancel action (`cancelShippingLabel` unused) although cancel-fulfilment requires it |
| (e) Returns and refunds | `/platform/orders/[id]` (orders ReturnsSection) | ok | create return, status, `processReturnRefund` |
| (e) Regulated reversal review | none | MISSING | `TAX_AND_REPORTING_REVERSAL_REVIEW_REQUIRED` events are not surfaced; no tax-reversal action |
| (e) Claims | `/platform/claims` (claims) + order ClaimsSection | THIN | list and status only; detail goes to the generic `/dashboard/claim-orders/<id>` |
| (f) Emergency stop | `/platform/compliance` (MerchantSafetyActions) | ok | stop and export |
| (f) Resume / in-flight review | none | MISSING | no resume control, no list of orders affected by a stop |
| (g) Inventory export | `/platform/compliance` | ok | |
| (g) Period report and filing receipt | none | MISSING | `generateComplianceReport` and `recordComplianceReportSubmission` have no UI; Compliance Center lists recent runs only |
| (g) Finance close | none | MISSING | `getFinanceClose` unused |
| (h) Customer list | `/platform/users` (users) | THIN | list only; detail is the generic `/dashboard/users/<id>`; no age attestation, addresses or order history |
| (h) Business account requests | `/platform/business-account-requests` | ok | review sheet |
| (h) Business accounts and invoices | `/platform/invoices` (invoices: Accounts) | THIN | account list and status only; Invoice records themselves have no page |
| (i) Onboarding | dashboard layout dialog (onboarding) | ok | seeds a draft profile only |
| (i) Regions and markets | `/platform/regions`, `/markets`, `/regions-management` (regions) | ok | `/markets` and `/regions-management` render the same `RegionListPage` |
| (i) Payment providers | `/platform/payment-providers` | ok | |
| (i) Shipping providers | `/platform/shipping-providers` | ok | |
| (i) Shipping options | `/platform/shipping-options`, `/shipping` (shipping-options) | THIN | list and create drawer; edit only on the generic page |
| Inventory adjust | `/platform/inventory` (inventory) | THIN | list only; `adjustInventory` and `importInventory` unused; detail link is dead |
| Analytics | `/platform/analytics` | ok | |
| System | `/platform/system` | THIN | tab wrapper linking to store and payment pages |

### 3.2 By list

| List(s) | Page | Status |
|---|---|---|
| Product, ProductVariant, ProductOption, ProductOptionValue, ProductImage, MoneyAmount, Measurement | `/platform/products/*` | ok |
| RegulatedProductClassification, ProductAuthorization | `/platform/products/[id]` ClassifySheet | THIN (authorization status changes and exemption not covered) |
| ProductCategory | `/platform/product-categories` | ok |
| ProductCollection | `/platform/product-collections` | ok |
| ProductTag, ProductType, ShippingProfile, Location | covered by the product form (tags, type); otherwise generic page | THIN |
| StockMovement | inventory (log) | THIN (no adjust) |
| Discount, DiscountRule, DiscountCondition | `/platform/discounts` | ok (rule and condition edited through the discount) |
| GiftCard, GiftCardTransaction | `/platform/gift-cards` | ok |
| PriceList | `/platform/price-lists` | ok |
| PriceSet, PriceRule, RuleType, CustomerGroup | none | MISSING (generic page only) |
| Order, OrderLineItem, OrderMoneyAmount, OrderEvent, DraftOrder, Note | `/platform/orders`, `/orders/[id]`, `/orders/create` | ok (join and log lists covered by order detail) |
| Cart, LineItem, LineItemAdjustment, LineItemTaxLine, ShippingMethod, ShippingMethodTaxLine, CustomShippingOption | order create (MiniStorefront) | ok (system lists, covered by orders) |
| Fulfillment, FulfillmentItem, ShippingLabel | `/platform/orders/[id]/fulfill` | THIN (see 3.1) |
| Return, ReturnItem, Refund | order detail | ok |
| ReturnReason | none | MISSING (generic page only) |
| ClaimOrder, ClaimItem, ClaimImage, ClaimTag | `/platform/claims` + order detail | THIN |
| Swap | none | MISSING (generic page only) |
| Payment, PaymentCollection, PaymentSession, Capture | order detail (payment details) | ok (system lists) |
| PaymentProvider | `/platform/payment-providers` | ok |
| ShippingOption, ShippingOptionRequirement | `/platform/shipping-options` | THIN |
| ShippingProvider | `/platform/shipping-providers` | ok |
| FulfillmentProvider | none | MISSING (generic page only) |
| Store | `/platform/store` | ok |
| Region, Country, Currency | `/platform/regions`, `/countries`, `/currencies`, `/markets` | ok |
| TaxRate, TaxProvider, SalesChannel | none | MISSING (generic page only) |
| User, UserField | `/platform/users` | THIN |
| Address | none (generic page; customer self-service on storefront) | MISSING |
| Account, AccountLineItem | `/platform/invoices` | THIN |
| Invoice, InvoiceLineItem | none | MISSING |
| BusinessAccountRequest | `/platform/business-account-requests` | ok |
| Role, Team, Invite | none | MISSING (generic page only) |
| Jurisdiction | none (nav link `/platform/jurisdictions` is dead) | MISSING |
| RegulatedRuleSet | none (`/platform/jurisdictions` dead) | MISSING |
| RegulatedMerchantProfile | `/platform/compliance` shows status and stop only (`/platform/merchant-profiles` dead) | MISSING (create, edit, activate) |
| MerchantLicense | none | MISSING |
| ProviderApproval | `/platform/compliance` ProviderApprovalSheet (create only; `/platform/provider-approvals` dead) | THIN (no list, edit, suspend or revoke) |
| AgeVerificationAttempt, RegulatedTaxQuote, CarrierEligibilityDecision | none (`/platform/compliance-ledger` dead); should show on order detail and in a ledger | MISSING |
| ComplianceDecision, ComplianceEvent | none (`/platform/compliance-ledger` dead) | MISSING |
| ComplianceReportRun | `/platform/compliance` "Recent reports" (6 rows, read only) | THIN |
| ApiKey | `/platform/api-keys` | ok |
| OAuthApp, OAuthToken | `/platform/apps`, `/platform/order-management-system` | ok |
| WebhookEndpoint, WebhookEvent | none (`retryWebhookDeliveries` unused) | MISSING |
| BatchJob | none | MISSING (generic page only) |
| IdempotencyKey | none | ok (system; nothing for a merchant to do) |
| Notification, NotificationProvider | none | MISSING (privacy requests land here unseen) |

---

## 4. Storefront workflows

Routes under `app/(storefront)/[countryCode]/`; logic in `features/storefront/`.

| Workflow | Route | Status | Notes |
|---|---|---|---|
| Age gate (21+) | layout (`modules/layout/components/age-gate`) | complete | cookie, 30 days; self-attestation only |
| Home | `(main)/page.tsx` | complete | |
| Browse all | `(main)/store/page.tsx` | complete | `getProductsSortedByPrice` |
| Category | `(main)/categories/[...category]/page.tsx` | complete | |
| Collection | `(main)/collections/[handle]/page.tsx` | complete | |
| Product | `(main)/products/[handle]/page.tsx` | complete | only published products are readable |
| Bag | `(main)/cart/page.tsx` | thin | regulated cart denials surface as raw thrown errors; `evaluateActiveCartCompliance` is never called to explain blockers |
| Checkout (address, shipping, payment, review) | `(checkout)/checkout/page.tsx` | thin | no identity or age-verification step, no tax-quote step, no carrier-eligibility step; `placeOrder` passes raw errors (`features/storefront/lib/data/cart.ts`) |
| Confirmation | `(main)/order/confirmed/[id]/page.tsx` | complete | secretKey for guests |
| Sign in / sign up (21+ box) | `(main)/account/@login/page.tsx` | complete | writes `AGE_ATTESTED_21` |
| Reset password | `(main)/account/@login/reset/page.tsx`, `@dashboard/reset/page.tsx` | complete | `sendUserPasswordResetLink` / `redeemUserPasswordResetToken` |
| Account overview | `(main)/account/@dashboard/page.tsx` | complete | |
| Profile | `@dashboard/profile/page.tsx` | complete | |
| Addresses | `@dashboard/addresses/page.tsx` | complete | |
| Order history and detail | `@dashboard/orders/page.tsx`, `orders/details/[id]/page.tsx` | complete | |
| Paid invoices | `@dashboard/invoices/page.tsx` | complete | |
| Business invoicing (pay balance) | `@dashboard/invoicing/page.tsx` | complete | |
| Checkout link | `@dashboard/checkout-link`, `@login/checkout-link` | complete | |
| Policies | `(main)/policies/[slug]/page.tsx` | complete | five slugs from `POLICY_PAGES`, read from Store.metadata |
| Customer return or claim request | none | missing | returns are created by staff only |
| Privacy preferences and data request | none | missing | `updatePrivacyPreferences`, `requestPrivacyAction`, `getMyPrivacyData` have no UI |
| Unknown path | `(main)/[...rest]/page.tsx` | complete | not-found |

## 5. Coverage after the 2026-10-23 coverage pass

Sections 3 and 4 describe HEAD `b0104de`. This pass added or rebuilt the following.

| Workflow / list | Before | After |
| --- | --- | --- |
| Merchant home | MISSING | `/dashboard/platform/overview` (`features/platform/overview`): sales state and blockers, orders to fulfil, products blocked from publishing, evidence expiring in 30 days, today's decisions |
| RegulatedMerchantProfile, MerchantLicense | MISSING (generic forms only) | `/dashboard/platform/merchant-profiles` + `[id]` (`features/platform/merchant-profiles`): create/edit drafts, submit, activate, suspend, revoke, new revision, stop/resume sales, licences add/edit/suspend/expire/revoke |
| Jurisdiction, RegulatedRuleSet | MISSING | `/dashboard/platform/jurisdictions` + `[id]` (`features/platform/jurisdictions`): jurisdictions with authority sources, activate/retire; rule sets with structured rules editor, approve/activate with signed policy hash, emergency disable, retire, new version |
| RegulatedProductClassification, ProductAuthorization | THIN (product-page sheet only) | `/dashboard/platform/product-evidence` (`features/platform/product-evidence`): classifications by status, expiring and missing-federal filters, unclassified regulated variants with Classify, authorizations with suspend/delist/expire |
| ProviderApproval | THIN (create only) | `/dashboard/platform/provider-approvals` + `[id]` (`features/platform/provider-approvals`): purpose and status filters, edit until active, submit, activate, suspend, revoke, expire |
| ComplianceDecision, ComplianceEvent, AgeVerificationAttempt, RegulatedTaxQuote, CarrierEligibilityDecision | MISSING | `/dashboard/platform/compliance-ledger` + `[id]` (`features/platform/compliance-ledger`): read-only tabs per record type, readable reason codes, decision detail with events timeline; age attestations tab |
| ComplianceReportRun | THIN | `/dashboard/platform/compliance-reports` + `[id]` (`features/platform/compliance-reports`): generate evidence inventory report, record submission, export inventory |
| Users (customers) | THIN | `/dashboard/platform/users/[id]`: profile, 21+ attestation, orders, addresses, carts, accounts and invoices |
| Inventory | THIN | Adjust stock sheet (delta or set count) and bulk paste through `adjustInventory`; product links fixed |
| Fulfilment | THIN | Real label/fulfilment refusal messages, shipping labels with Cancel label (`cancelShippingLabel`), carrier eligibility evidence |
| Regulated reversal review | MISSING | Order page Compliance section with `TAX_AND_REPORTING_REVERSAL_REVIEW_REQUIRED` banner and events |
| Compliance Center | THIN | Links now go to the platform pages above instead of the generic model forms |
| Storefront checkout compliance | THIN | `evaluateActiveCartCompliance` runs during checkout; compliance panel with customer-readable reasons; Place order disabled unless allowed; raw denials mapped |
| Storefront privacy | MISSING | `/[cc]/account/privacy`: preferences, data download, deletion request |

Still MISSING, with reason:
- Customer returns/claims from the storefront: no customer-callable mutation; Return/ClaimOrder writes need staff permissions.
- Checkout evidence ingestion (age verification, tax quote, carrier eligibility): needs external provider integrations; the record functions exist but no adapter is configured. Checkout stays fail-closed.
- Inventory import: `importInventory` is a stub with no input.
- Generic lists the same as E-commerce (Invoice, Role/Team/Invite, Webhooks, BatchJob, Notifications, PriceSet/PriceRule, ReturnReason, Swap, TaxRate/TaxProvider, SalesChannel): covered by the generic model pages, as in E-commerce.
- Dashboard home `/dashboard` and the sidebar onboarding card: parity-locked; the platform Overview is the merchant home.
