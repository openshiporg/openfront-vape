import type { KeystoneContext } from "@keystone-6/core/types";
/**
 * addDiscountToActiveCart - Apply a discount code to a cart
 * 
 * Based on Medusa's discount flow:
 * 1. Validate discount exists and is active (not disabled, within date range, usage limit)
 * 2. Validate customer eligibility (customer group conditions)
 * 3. Validate region eligibility
 * 4. Handle stackability rules with existing cart discounts
 * 
 * Note: Product-level validation (which items get the discount) happens in calculateCartDiscount
 */

import { assertCartAccess, withCartMutationLock } from "../security/cart-access";
import { discountHasUsageCapacity, discountRegionEligible } from "../security/discount-eligibility";
import { invalidateCartCompliance } from "../regulated/enforcement";

async function addDiscountToActiveCart(root: unknown, { cartId, code }: { cartId: string; code: string }, context: KeystoneContext<any>) {
  return withCartMutationLock(context, cartId, async context => {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();

  // Get cart with customer and region info for eligibility validation
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
      }
      user {
        id
        customerGroups {
          id
        }
      }
      lineItems {
        id
      }
      discounts {
        id
        code
        stackable
      }
    `
  });

  if (!cart) {
    throw new Error(`Cart not found`);
  }

  if (!cart.lineItems || cart.lineItems.length === 0) {
    throw new Error(`Cannot apply discount to an empty cart`);
  }

  // Find the discount with full details
  const discount = await sudoContext.query.Discount.findOne({
    where: { code },
    query: `
      id
      code
      isDynamic
      isDisabled
      stackable
      startsAt
      endsAt
      usageLimit
      usageCount
      regions {
        id
      }
      discountRule {
        id
        type
        value
        allocation
        discountConditions {
          id
          type
          operator
          customerGroups {
            id
          }
        }
      }
    `
  });

  if (!discount) {
    throw new Error(`Invalid discount code: ${code}`);
  }

  const cartDiscounts: Array<{ id: string; stackable: boolean }> = cart.discounts || [];
  // Check if discount is already applied
  if (cartDiscounts?.some(d => d.id === discount.id)) {
    throw new Error(`Discount ${code} is already applied to this cart`);
  }

  // Validate discount is enabled
  if (discount.isDisabled) {
    throw new Error(`Discount ${code} is no longer available`);
  }

  // Check date validity
  const now = new Date();
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    throw new Error(`Discount ${code} is not yet active`);
  }
  if (discount.endsAt && new Date(discount.endsAt) < now) {
    throw new Error(`Discount ${code} has expired`);
  }

  // Check usage limits
  if (!discountHasUsageCapacity(discount.usageLimit, discount.usageCount)) {
    throw new Error(`Discount ${code} has reached its usage limit`);
  }

  // Validate region eligibility (if discount has region restrictions)
  if (!discountRegionEligible(discount.regions, cart.region?.id)) {
    throw new Error(`Discount ${code} is not available in your region`);
  }

  // Validate customer group eligibility
  // This is cart-level validation - does the customer qualify to use this discount?
  if (discount.discountRule?.discountConditions) {
    const customerGroupConditions: Array<{ type: string; operator: string; customerGroups?: Array<{ id: string }> }> = discount.discountRule.discountConditions.filter(
      (condition: { type: string }) => condition.type === 'customer_groups'
    );

    for (const condition of customerGroupConditions) {
      const conditionGroupIds = condition.customerGroups?.map(g => g.id) || [];
      const customerGroupIds: string[] = cart.user?.customerGroups?.map((group: { id: string }) => group.id) || [];

      if (conditionGroupIds.length === 0) continue;

      const hasMatch = customerGroupIds.some(id => conditionGroupIds.includes(id));

      if (condition.operator === 'in' && !hasMatch) {
        throw new Error(`Discount ${code} is not available for your customer group`);
      }
      if (condition.operator === 'not_in' && hasMatch) {
        throw new Error(`Discount ${code} is not available for your customer group`);
      }
    }
  }

  // Handle stackability rules
  let discountUpdate;
  
  if (cartDiscounts && cartDiscounts.length > 0) {
    const hasNonStackable = cartDiscounts.some(d => !d.stackable);
    
    if (hasNonStackable) {
      // Replace non-stackable discount with new one
      discountUpdate = {
        disconnect: cartDiscounts.map(d => ({ id: d.id })),
        connect: [{ id: discount.id }]
      };
    } else if (!discount.stackable) {
      // New discount is non-stackable, replace all existing
      discountUpdate = {
        disconnect: cartDiscounts.map(d => ({ id: d.id })),
        connect: [{ id: discount.id }]
      };
    } else {
      // Both are stackable, add new one
      discountUpdate = {
        connect: [{ id: discount.id }]
      };
    }
  } else {
    discountUpdate = {
      connect: [{ id: discount.id }]
    };
  }

  // Update cart with discount
  const updatedCart = await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data: {
      discounts: discountUpdate,
      paymentCollection: { disconnect: true },
    },
  });

  await invalidateCartCompliance(context, cartId, "DISCOUNT_CHANGED", true);

  // Note: Usage count is incremented when the cart is completed (order placed),
  // not when discount is added to cart. This prevents counting abandoned carts.

  return updatedCart;
  });
}

export default addDiscountToActiveCart;
