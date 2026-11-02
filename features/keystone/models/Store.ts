
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { checkbox, json, text, relationship, timestamp, virtual } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";
import { DEMO_CATALOGUE_ACTIVE, resetDemoCatalogueCache } from "../regulated/demo-catalogue";
import { graphql } from "@keystone-6/core";
import {
  DEFAULT_STORE_LOGO_COLOR,
  DEFAULT_STORE_LOGO_ICON,
  normalizeStoreLogoColor,
} from "../../platform/store-settings/lib/store-logo";
import { sanitizeStoreLogoSvg } from "../utils/storeLogo";
import { getPublicPaymentProviderConfig } from "../utils/paymentProviderConfig";

export const Store = list({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels,
    },
  },
  fields: {
    name: text({
      defaultValue: "Openfront Store",
      validation: {
        isRequired: true,
      },
    }),
    defaultCurrencyCode: text({
      defaultValue: "usd",
      validation: {
        isRequired: true,
      },
    }),
    homepageTitle: text({
      defaultValue: "Openfront Next.js Starter",
    }),
    homepageDescription: text({
      defaultValue: "A performant frontend e-commerce starter template with Next.js 15 and Openfront.",
    }),
    logoIcon: text({
      defaultValue: DEFAULT_STORE_LOGO_ICON,
      hooks: {
        resolveInput: ({ resolvedData, fieldKey }) => {
          const value = resolvedData[fieldKey];
          if (value === undefined || value === null || value === '') return value;
          return typeof value === 'string' ? sanitizeStoreLogoSvg(value) : '';
        },
        validate: ({ inputData, resolvedData, fieldKey, addValidationError }) => {
          const submitted = inputData?.[fieldKey];
          if (typeof submitted === 'string' && submitted.trim() && !resolvedData?.[fieldKey]) {
            addValidationError('Logo must be a valid, safe SVG document');
          }
        },
      },
    }),
    logoColor: text({
      defaultValue: DEFAULT_STORE_LOGO_COLOR,
      hooks: {
        resolveInput: ({ resolvedData, fieldKey }) => {
          const value = resolvedData[fieldKey];
          return value === undefined ? value : normalizeStoreLogoColor(value);
        },
      },
    }),
    // 21 CFR 1143.3(b): the storefront advertises nicotine products, so every page that
    // shows products carries the fixed FDA warning. Compliance owns the switch; the
    // wording is fixed in code and cannot be edited here.
    nicotineWarningRequired: checkbox({
      defaultValue: true,
      label: "Show the FDA nicotine warning on the storefront",
      access: {
        create: permissions.canManageCompliance,
        update: permissions.canManageCompliance,
      },
      ui: {
        description: "Required while the shop sells or shows nicotine products (21 CFR 1143.3). Turn off only after a compliance review.",
      },
    }),
    // Demo catalogue: the public may see draft products as display only. Nothing becomes
    // sellable (carts and checkout refuse unpublished products) and the release gate shows
    // DEMO_CATALOGUE_ACTIVE while it is on. Compliance owns it; it is never seeded.
    demoCatalogue: checkbox({
      defaultValue: false,
      label: "Demo catalogue (drafts visible as display only)",
      access: {
        create: denyAll,
        update: permissions.canManageCompliance,
      },
      ui: {
        description: "Shows draft products on the storefront as display only. Nothing can be bought while it is on. Refused while an active merchant profile is selling.",
      },
    }),
    demoCatalogueChangedAt: timestamp({
      access: { create: denyAll, update: denyAll },
      ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "read" } },
    }),
    demoCatalogueChangedBy: text({
      access: { create: denyAll, update: denyAll },
      ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "read" } },
    }),
    metadata: json(),
    swapLinkTemplate: text(),
    paymentLinkTemplate: text(),
    inviteLinkTemplate: text(),
    // currency: relationship({
    //   ref: "Currency.stores",
    // }),
    currencies: relationship({
      ref: "Currency.stores",
      many: true,
    }),
    paymentProviders: virtual({
      field: graphql.field({
        type: graphql.list(
          graphql.object<{
            provider: string;
            publishableKey: string;
          }>()({
            name: 'PaymentProviderConfig',
            fields: {
              provider: graphql.field({ type: graphql.String }),
              publishableKey: graphql.field({ type: graphql.String }),
            },
          })
        ),
        resolve: async (_item, _args, context) => {
          const installedProviders = await context.sudo().query.PaymentProvider.findMany({
            where: { isInstalled: { equals: true } },
            query: 'code',
          });
          return installedProviders
            .map((provider: any) => getPublicPaymentProviderConfig(provider.code || ''))
            .filter((provider): provider is { provider: 'stripe' | 'paypal'; publishableKey: string } => Boolean(provider));
        },
      }),
      ui: { query: '{ provider publishableKey }' },
    }),
    ...trackingFields,
  },
  hooks: {
    resolveInput: async ({ operation, resolvedData, item, context }: any) => {
      if (operation === "update" && typeof resolvedData.demoCatalogue === "boolean" && resolvedData.demoCatalogue !== item?.demoCatalogue) {
        resolvedData.demoCatalogueChangedAt = new Date().toISOString();
        resolvedData.demoCatalogueChangedBy = String(context.session?.itemId || "");
      }
      return resolvedData;
    },
    validateInput: async ({ operation, resolvedData, item, context, addValidationError }: any) => {
      if (operation !== "update" || resolvedData.demoCatalogue !== true || item?.demoCatalogue === true) return;
      // A store that is actually cleared to sell can't drop into demo mode.
      const selling = await context.sudo().prisma.regulatedMerchantProfile.count({ where: { status: "active", killSwitch: false } });
      if (selling > 0) addValidationError("Demo catalogue can't be turned on while an active merchant profile is selling. Turn on its kill switch first.");
    },
    afterOperation: async ({ operation, originalItem, item, context }: any) => {
      resetDemoCatalogueCache();
      if (operation !== "update" || !item || Boolean(originalItem?.demoCatalogue) === Boolean(item.demoCatalogue)) return;
      const on = Boolean(item.demoCatalogue);
      await context.sudo().prisma.complianceEvent.create({
        data: {
          eventType: on ? "store.demo_catalogue_enabled" : "store.demo_catalogue_disabled",
          resourceType: "Store",
          resourceId: item.id,
          actorId: String(context.session?.itemId || ""),
          reasonCode: on ? DEMO_CATALOGUE_ACTIVE : "DEMO_CATALOGUE_OFF",
          data: { demoCatalogue: on },
          occurredAt: new Date(),
        },
      });
    },
  },
});
