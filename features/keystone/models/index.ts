
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

export const models = {
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
