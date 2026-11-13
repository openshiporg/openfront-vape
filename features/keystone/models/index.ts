
import { Address } from "./Address";
import { ApiKey } from "./ApiKey";
import { BatchJob } from './BatchJob';
import { Capture } from "./Capture";
import { Cart } from "./Cart";
import { ClaimImage } from "./ClaimImage";
import { ClaimItem } from "./ClaimItem";
import { ClaimOrder } from "./ClaimOrder";
import { ClaimTag } from "./ClaimTag";
import { Country } from "./Country";
import { Currency } from "./Currency";
import { CustomerGroup } from "./CustomerGroup";
import { CustomShippingOption } from "./CustomShippingOption";
import { Discount } from "./Discount";
import { DiscountCondition } from "./DiscountCondition";
import { DiscountRule } from "./DiscountRule";
import { DraftOrder } from "./DraftOrder";
import { Fulfillment } from "./Fulfillment";
import { FulfillmentItem } from "./FulfillmentItem";
import { FulfillmentProvider } from "./FulfillmentProvider";
import { GiftCard } from "./GiftCard";
import { GiftCardTransaction } from "./GiftCardTransaction";
import { IdempotencyKey } from "./IdempotencyKey";
import { Invite } from "./Invite";
import { Account } from "./Account";
import { AccountLineItem } from "./AccountLineItem";
import { Invoice } from "./Invoice";
import { InvoiceLineItem } from "./InvoiceLineItem";
import { BusinessAccountRequest } from "./BusinessAccountRequest";
import { LineItem } from "./LineItem";
import { LineItemAdjustment } from "./LineItemAdjustment";
import { LineItemTaxLine } from "./LineItemTaxLine";
import { Location } from './Location';
import { Measurement } from './Measurement';
import { MoneyAmount } from "./MoneyAmount";
import { Note } from "./Note";
import { Notification } from "./Notification";
import { NotificationProvider } from "./NotificationProvider";
import { OAuthApp } from "./OAuthApp";
import { OAuthToken } from "./OAuthToken";
import { Order } from "./Order";
import { OrderEvent } from './OrderEvent';
import { OrderLineItem } from "./OrderLineItem";
import { OrderMoneyAmount } from "./OrderMoneyAmount";
import { Payment } from "./Payment";
import { PaymentCollection } from "./PaymentCollection";
import { PaymentProvider } from "./PaymentProvider";
import { PaymentSession } from "./PaymentSession";
import { PriceList } from "./PriceList";
import { PriceRule } from './PriceRule';
import { PriceSet } from './PriceSet';
import { Product } from "./Product";
import { ProductCategory } from "./ProductCategory";
import { ProductCollection } from "./ProductCollection";
import { ProductImage } from "./ProductImage";
import { ProductOption } from "./ProductOption";
import { ProductOptionValue } from "./ProductOptionValue";
import { ProductTag } from "./ProductTag";
import { ProductType } from "./ProductType";
import { ProductVariant } from "./ProductVariant";
import { Refund } from "./Refund";
import { Region } from "./Region";
import { Return } from "./Return";
import { ReturnItem } from "./ReturnItem";
import { ReturnReason } from "./ReturnReason";
import { Role } from "./Role";
import { RuleType } from "./RuleType";
import { SalesChannel } from "./SalesChannel";
import { ShippingLabel } from './ShippingLabel';
import { ShippingMethod } from "./ShippingMethod";
import { ShippingMethodTaxLine } from "./ShippingMethodTaxLine";
import { ShippingOption } from "./ShippingOption";
import { ShippingOptionRequirement } from "./ShippingOptionRequirement";
import { ShippingProfile } from "./ShippingProfile";
import { ShippingProvider } from './ShippingProvider';
import { StockMovement } from './StockMovement';
import { Store } from "./Store";
import { Swap } from "./Swap";
import { TaxProvider } from "./TaxProvider";
import { TaxRate } from "./TaxRate";
import { Team } from './Team';
import { User } from "./User";
import { UserField } from "./UserField";
import { WebhookEndpoint } from "./WebhookEndpoint";
import { WebhookEvent } from "./WebhookEvent";
import {
  Jurisdiction,
  MerchantLicense,
  ProviderApproval,
  RegulatedMerchantProfile,
  RegulatedRuleSet,
} from "./RegulatedAuthority";
import {
  ProductAuthorization,
  RegulatedProductClassification,
} from "./RegulatedProduct";
import {
  AgeVerificationAttempt,
  CarrierEligibilityDecision,
  ComplianceDecision,
  ComplianceEvent,
  RegulatedTaxQuote,
} from "./RegulatedTransaction";
import { ComplianceReportRun } from "./RegulatedReporting";

import type { BaseListTypeInfo, ListConfig } from "@keystone-6/core/types";

// Native records are readable here; their lifecycle commands live in platform
// features. Do not advertise generic writes that backend access rightly rejects.
function readOnlyNative<T extends BaseListTypeInfo>(definition: ListConfig<T>): ListConfig<T> {
  return {
    ...definition,
    ui: {
      ...definition.ui,
      hideCreate: true,
      hideDelete: true,
      itemView: { ...definition.ui?.itemView, defaultFieldMode: "read" },
    },
  };
}

const rawModels = {
  Account,
  AccountLineItem: readOnlyNative(AccountLineItem),
  Address,
  ApiKey,
  BatchJob,
  Capture: readOnlyNative(Capture),
  Cart,
  ClaimImage,
  ClaimItem,
  ClaimOrder,
  ClaimTag,
  Country,
  Currency,
  CustomShippingOption,
  CustomerGroup,
  Discount,
  DiscountCondition,
  DiscountRule,
  DraftOrder,
  Fulfillment: readOnlyNative(Fulfillment),
  FulfillmentItem: readOnlyNative(FulfillmentItem),
  FulfillmentProvider,
  GiftCard,
  GiftCardTransaction,
  IdempotencyKey: readOnlyNative(IdempotencyKey),
  Invite,
  Invoice: readOnlyNative(Invoice),
  InvoiceLineItem: readOnlyNative(InvoiceLineItem),
  BusinessAccountRequest,
  LineItem,
  LineItemAdjustment,
  LineItemTaxLine,
  Location,
  Measurement,
  MoneyAmount,
  Note,
  Notification,
  NotificationProvider,
  OAuthApp,
  OAuthToken,
  Order: readOnlyNative(Order),
  OrderEvent,
  OrderLineItem: readOnlyNative(OrderLineItem),
  OrderMoneyAmount: readOnlyNative(OrderMoneyAmount),
  Payment: readOnlyNative(Payment),
  PaymentCollection,
  PaymentProvider,
  PaymentSession,
  PriceList,
  PriceRule,
  PriceSet,
  Product,
  ProductCategory,
  ProductCollection,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  ProductTag,
  ProductType,
  ProductVariant,
  Refund: readOnlyNative(Refund),
  Region,
  Return,
  ReturnItem,
  ReturnReason,
  Role,
  RuleType,
  SalesChannel,
  ShippingLabel,
  ShippingMethod,
  ShippingMethodTaxLine,
  ShippingOption,
  ShippingOptionRequirement,
  ShippingProfile,
  ShippingProvider,
  StockMovement: readOnlyNative(StockMovement),
  Store,
  Swap,
  TaxProvider,
  TaxRate,
  Team,
  User,
  UserField,
  WebhookEndpoint,
  WebhookEvent,
  Jurisdiction,
  MerchantLicense,
  ProviderApproval,
  RegulatedMerchantProfile,
  RegulatedRuleSet,
  ProductAuthorization,
  RegulatedProductClassification,
  AgeVerificationAttempt,
  CarrierEligibilityDecision,
  ComplianceDecision,
  ComplianceEvent,
  RegulatedTaxQuote,
  ComplianceReportRun,
};

// Filter/order paths must not leak what read access hides (count-filter extraction through relations).
// - a field is filterable/orderable only where the session may read it (field access.read);
// - a relationship is filterable/orderable only where the session may read the related list: never when that
//   list is closed to it, and not into a row-scoped list when the list filtered from is wider than that scope;
// - secrets and blobs are never filterable or orderable.
type ReadMode = 'none' | 'scoped' | 'full';
function listReadMode(config: any, args: any): ReadMode {
  const access = config?.access;
  if (typeof access === 'function') return access(args) ? 'full' : 'none';
  const op = access?.operation?.query;
  if (op !== undefined && !(typeof op === 'function' ? op(args) : op)) return 'none';
  const filter = access?.filter?.query;
  if (filter === undefined) return 'full';
  const result = typeof filter === 'function' ? filter(args) : filter;
  if (result === false) return 'none';
  return result === true ? 'full' : 'scoped';
}
const NEVER_FILTERABLE = /^(customerToken|clientSecret|secret|token|accessToken|refreshToken|authorizationCode|credentials|credentialReference|providerData|data|sessionKey|registrationKey|subscriptionKey|secretKey|publishableKey)$/;
function fieldReadable(access: any, args: any): boolean {
  const read = typeof access === 'function' ? access : access?.read;
  if (read === undefined) return true;
  return typeof read === 'function' ? Boolean(read(args)) : Boolean(read);
}
function guardFilterPaths(listKey: string, config: any, all: Record<string, any>) {
  if (!config?.fields) return config;
  const fields = Object.fromEntries(Object.entries(config.fields).map(([fieldKey, fieldFunc]: [string, any]) => {
    if (typeof fieldFunc !== 'function') return [fieldKey, fieldFunc];
    return [fieldKey, (data: any) => {
      const f = fieldFunc(data);
      const never = NEVER_FILTERABLE.test(fieldKey);
      const target = f.dbField?.kind === 'relation' ? all[f.dbField.list] : undefined;
      const wrap = (own: unknown) => (args: any) => {
        if (never) return false;
        if (own === false || (typeof own === 'function' && !own(args))) return false;
        if (!fieldReadable(f.access, args)) return false;
        if (!target) return true;
        const to = listReadMode(target, args);
        if (to === 'none') return false;
        return to === 'full' || listReadMode(config, args) !== 'full';
      };
      return { ...f, isFilterable: wrap(f.isFilterable), isOrderable: wrap(f.isOrderable) };
    }];
  }));
  return { ...config, fields };
}
const guardedModels: Record<string, any> = Object.fromEntries(
  Object.entries(rawModels).map(([key, config]) => [key, guardFilterPaths(key, config, rawModels)]),
);

// Sidebar visibility follows the role: a list whose query access denies the session is hidden from navigation
// (Keystone evaluates ui.isHidden per session in admin meta). Explicit isHidden settings are kept.
export const models = Object.fromEntries(Object.entries(guardedModels).map(([key, config]: [string, any]) => {
  const operationQuery = config?.access?.operation?.query;
  const filterQuery = config?.access?.filter?.query;
  if (typeof operationQuery !== 'function' && typeof filterQuery !== 'function') return [key, config];
  const existing = config?.ui?.isHidden;
  const isHidden = (args: any) => {
    if (existing === true || (typeof existing === 'function' && existing(args))) return true;
    if (typeof operationQuery === 'function' && !operationQuery(args)) return true;
    return typeof filterQuery === 'function' && filterQuery(args) === false;
  };
  return [key, { ...config, ui: { ...(config.ui ?? {}), isHidden } }];
})) as typeof rawModels;

